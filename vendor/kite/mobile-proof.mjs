import {createHash,createHmac,randomBytes,createPublicKey,verify,X509Certificate} from 'node:crypto';
import {verifyAttestation,verifyAssertion} from 'node-app-attest';
import cbor from 'cbor';
import {GoogleAuth,JWT} from 'google-auth-library';

export const sha256=value=>createHash('sha256').update(value).digest('hex');
const deny=(reason='PROOF_INVALID')=>{throw Object.assign(new Error('Mobile device verification failed.'),{status:403,code:'APP_PROOF_REQUIRED',verificationReason:reason});};
function decode(value,max=50000) {
  if(typeof value!=='string'||value.length>max) return deny();
  return Buffer.from(value,'base64');
}

export function createMobileProof({db,institutionId,env,now=Date.now,onReject=()=>{}}) {
  const query=s=>db.prepare(s);
  const appleConfigured=()=>Boolean(env.KITE_APPLE_TEAM_ID && env.KITE_IOS_BUNDLE_ID);
  const androidConfigured=()=>Boolean(env.KITE_ANDROID_PACKAGE && env.KITE_PLAY_CERTIFICATE_SHA256 && env.KITE_GOOGLE_SERVICE_ACCOUNT_JSON);
  if(env.NODE_ENV==='production'&&(appleConfigured()||androidConfigured())&&(!env.KITE_PROOF_BINDING_SECRET||env.KITE_PROOF_BINDING_SECRET.length<64))throw new Error('Set a shared random KITE_PROOF_BINDING_SECRET of at least 64 characters');
  const bindingSecret=env.KITE_PROOF_BINDING_SECRET??randomBytes(32).toString('hex');
  // A bare SHA-256 of a login body would turn the challenge table into an
  // offline password-guessing oracle. Keep only a server-secret HMAC of it.
  const protectBodyHash=value=>createHmac('sha256',bindingSecret).update(value).digest('hex');
  let google;
  async function playVerdict(token,requestHash) {
    if(!androidConfigured()||typeof token!=='string'||token.length>40000)deny();
    if(!google){
      const credentials=JSON.parse(env.KITE_GOOGLE_SERVICE_ACCOUNT_JSON);
      if(credentials.type!=='service_account'||typeof credentials.client_email!=='string'||!credentials.client_email.endsWith('.gserviceaccount.com')||typeof credentials.private_key!=='string'||!credentials.private_key.startsWith('-----BEGIN PRIVATE KEY-----'))deny();
      google=new GoogleAuth({authClient:new JWT({email:credentials.client_email,key:credentials.private_key,scopes:['https://www.googleapis.com/auth/playintegrity']})});
    }
    const client=await google.getClient();
    let response;
    try { response=await client.request({url:`https://playintegrity.googleapis.com/v1/${encodeURIComponent(env.KITE_ANDROID_PACKAGE)}:decodeIntegrityToken`,method:'POST',data:{integrity_token:token},timeout:10000}); }
    catch(error) { const status=Number(error.response?.status); deny([400,401,403,429].includes(status)?'PLAY_API_'+status:'PLAY_API_UNAVAILABLE'); }
    const v=response.data.tokenPayloadExternal;
    const details=v?.requestDetails, app=v?.appIntegrity;
    const certificates=env.KITE_PLAY_CERTIFICATE_SHA256.split(',').map(s=>s.trim().replace(/:/g,'').toLowerCase());
    if(!details || details.requestPackageName!==env.KITE_ANDROID_PACKAGE || details.requestHash!==requestHash ||
      !Number.isFinite(Number(details.timestampMillis)) || Math.abs(now()-Number(details.timestampMillis))>120000)deny('PLAY_REQUEST_MISMATCH');
    if(app?.appRecognitionVerdict==='UNEVALUATED')deny('PLAY_APP_UNEVALUATED');
    if(app?.appRecognitionVerdict==='UNRECOGNIZED_VERSION')deny('PLAY_UNRECOGNIZED_VERSION');
    if(app?.appRecognitionVerdict!=='PLAY_RECOGNIZED')deny('PLAY_APP_VERDICT_MISSING');
    if(app.packageName!==env.KITE_ANDROID_PACKAGE)deny('PLAY_PACKAGE_MISMATCH');
    if(!app.certificateSha256Digest?.some(cert=>certificates.includes(Buffer.from(cert,'base64url').toString('hex'))))deny('PLAY_CERTIFICATE_MISMATCH');
    if(v.accountDetails?.appLicensingVerdict!=='LICENSED')deny('PLAY_NOT_LICENSED');
    if(!v.deviceIntegrity?.deviceRecognitionVerdict?.includes('MEETS_DEVICE_INTEGRITY'))deny('PLAY_DEVICE_INTEGRITY');
  }
  async function challenge(input,req) {
    if(!['ios','android'].includes(input.platform)||!['login','request'].includes(input.purpose) ||
      !['GET','POST'].includes(input.method)||typeof input.path!=='string'||input.path.length>400 ||
      !/^\/api\/mobile\/(?!challenge(?:\?|$))[a-z-]+(?:\?[^#\r\n]*)?$/.test(input.path) ||
      typeof input.id!=='string'||!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(input.id)||
      typeof input.deviceId!=='string'||!input.deviceId||input.deviceId.length>256 ||
      !/^[a-f0-9]{64}$/.test(input.bodyHash))deny();
    if(input.platform==='ios'&&!appleConfigured()||input.platform==='android'&&!androidConfigured())deny();
    const rawToken=req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    const sessionHash=rawToken?sha256(rawToken):'';
    if(input.purpose==='login'&&(input.path!=='/api/mobile/login'||input.method!=='POST'||rawToken))deny();
    if(input.purpose==='request'&&!rawToken)deny();
    if(rawToken) {
      const s=await query('SELECT * FROM sessions WHERE token=? AND user_id=? AND audience=? AND institution_id=? AND expires>?').get(sessionHash,input.id,'mobile',institutionId,now());
      if(!s||s.device_id!==input.deviceId)deny();
    }
    await query('DELETE FROM mobile_challenges WHERE expires_at<?').run(now());
    const id=randomBytes(24).toString('hex'),expires=now()+90000;
    const protectedHash=protectBodyHash(input.bodyHash);
    const payload=JSON.stringify({v:1,nonce:randomBytes(32).toString('hex'),institutionId,origin:env.KITE_ADMIN_ORIGIN??'local',accountId:input.id,platform:input.platform,deviceId:input.deviceId,purpose:input.purpose,method:input.method,path:input.path,bodyHash:protectedHash,sessionHash,expires});
    await query('INSERT INTO mobile_challenges VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0)').run(id,payload,institutionId,input.id,input.platform,input.deviceId,input.purpose,input.method,input.path,protectedHash,sessionHash,expires);
    const registered=Boolean(await query('SELECT id FROM mobile_devices WHERE id=? AND active=1 AND institution_id=?').get(input.deviceId,institutionId));
    return {id,payload,expiresAt:expires,registered};
  }
  async function consume(req,accountId,purpose,sessionHash='',expectedDevice) {
    let stage='PROOF_CHALLENGE';
    try {
      const raw=req.headers['x-kite-proof'];
      if(typeof raw!=='string'||raw.length>80000)deny();
      const proof=JSON.parse(Buffer.from(raw,'base64url').toString('utf8'));
      if(typeof proof.challengeId!=='string')deny();
      const c=await query('SELECT * FROM mobile_challenges WHERE id=?').get(proof.challengeId);
      if(!c||c.used||c.expires_at<=now()||c.institution_id!==institutionId||c.account_id!==accountId||c.purpose!==purpose||
        c.method!==req.method||c.path!==req.kitePath||c.body_hash!==protectBodyHash(sha256(req.kiteRawBody??''))||c.session_hash!==sessionHash||
        expectedDevice&&expectedDevice!==c.device_id)deny();
      const device=await query('SELECT * FROM mobile_devices WHERE id=? AND institution_id=?').get(c.device_id,institutionId);
      if(device&&(!device.active||device.platform!==c.platform))deny();
      stage='DEVICE_PROOF';
      let publicKey=device?.public_key,signCount=device?.sign_count??0;
      if(c.platform==='ios') {
        if(!appleConfigured())deny();
        if(!device) {
          if(purpose!=='login')deny();
          const attestation=decode(proof.attestation);
          // The library validates Apple's signatures and nonce. Also enforce
          // certificate validity dates and the strict CBOR/authenticator shape.
          const decoded=cbor.decodeAllSync(attestation);
          if(decoded.length!==1||decoded[0].authData?.length<55)deny();
          for(const cert of decoded[0].attStmt?.x5c??[]) {
            const x=new X509Certificate(cert);
            if(now()<Date.parse(x.validFrom)||now()>Date.parse(x.validTo))deny();
          }
          const result=verifyAttestation({attestation,challenge:c.payload,keyId:c.device_id,bundleIdentifier:env.KITE_IOS_BUNDLE_ID,teamIdentifier:env.KITE_APPLE_TEAM_ID,allowDevelopmentEnvironment:false});
          if(result.environment!=='production')deny();
          publicKey=result.publicKey;
        }
        const assertion=decode(proof.assertion);
        const decoded=cbor.decodeAllSync(assertion);
        if(decoded.length!==1||decoded[0].authenticatorData?.length!==37||!Buffer.isBuffer(decoded[0].signature))deny();
        signCount=verifyAssertion({assertion,payload:c.payload,publicKey,bundleIdentifier:env.KITE_IOS_BUNDLE_ID,teamIdentifier:env.KITE_APPLE_TEAM_ID,signCount}).signCount;
      } else {
        if(!androidConfigured())deny();
        const der=device?createPublicKey(publicKey).export({type:'spki',format:'der'}):decode(proof.publicKey,2000);
        if(sha256(der)!==c.device_id)deny();
        const key=createPublicKey({key:der,type:'spki',format:'der'});
        if(key.asymmetricKeyType!=='ec'||key.asymmetricKeyDetails?.namedCurve!=='prime256v1')deny();
        if(!verify('sha256',Buffer.from(c.payload),key,decode(proof.signature,1000)))deny();
        stage='PLAY_CREDENTIALS';
        await playVerdict(proof.integrityToken,createHash('sha256').update(c.payload).digest('base64url'));
        publicKey=key.export({type:'spki',format:'pem'});
        signCount++;
      }
      stage='DEVICE_REGISTRATION';
      await db.exec('BEGIN IMMEDIATE');
      try {
        const taken=await query('UPDATE mobile_challenges SET used=1 WHERE id=? AND used=0 AND expires_at>?').run(c.id,now());
        if(taken.changes!==1)deny();
        if(device) {
          const changed=await query('UPDATE mobile_devices SET sign_count=? WHERE id=? AND sign_count=? AND active=1 AND institution_id=?').run(signCount,c.device_id,device.sign_count,institutionId);
          if(changed.changes!==1)deny();
        } else await query('INSERT INTO mobile_devices VALUES (?,?,?,?,?,1,?)').run(c.device_id,c.platform,publicKey,signCount,institutionId,now());
        await db.exec('COMMIT');
      } catch(error){await db.exec('ROLLBACK');throw error;}
      return c.device_id;
    }catch(error){
      // Fixed internal codes only: never return credentials, tokens, payloads or provider bodies.
      const reasons=new Set(['PLAY_API_400','PLAY_API_401','PLAY_API_403','PLAY_API_429','PLAY_API_UNAVAILABLE','PLAY_REQUEST_MISMATCH','PLAY_APP_UNRECOGNIZED','PLAY_APP_UNEVALUATED','PLAY_UNRECOGNIZED_VERSION','PLAY_APP_VERDICT_MISSING','PLAY_PACKAGE_MISMATCH','PLAY_CERTIFICATE_MISMATCH','PLAY_NOT_LICENSED','PLAY_DEVICE_INTEGRITY']);
      req.kiteVerificationCode=reasons.has(error.verificationReason)?error.verificationReason:stage;
      onReject(error);return null;
    }
  }
  return {challenge,
    verifyLoginAndConsume:(req,account)=>consume(req,account.id,'login'),
    verifyRequestAndConsume:async(req,session,digest)=>Boolean(await consume(req,session.accountId,'request',digest,session.deviceId))};
}

