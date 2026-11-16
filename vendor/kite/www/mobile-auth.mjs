// Native proof is required for every mobile API call; never fall back to web login.
const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');
const base64url=value=>btoa(unescape(encodeURIComponent(JSON.stringify(value)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
export function mobileOrigin(value) {
  try {
    const url=new URL(value);
    if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error();
    return url.origin;
  } catch {throw new Error('Configure the mobile app with your HTTPS server address.');}
}
export async function apiResult(response) {
  try {return await response.json();}
  catch {throw new Error('Kite API is unavailable at the configured server. Try again after service is restored.');}
}
export async function mobileHeaders({origin,path,payload,session}) {
  const plugin=window.Capacitor?.registerPlugin('KiteDevice');
  if(!plugin)throw new Error('The signed Kite app is required.');
  const platform=window.Capacitor.getPlatform();
  const identity=await plugin.identity();
  const body=payload===undefined?'':JSON.stringify(payload);
  const requestPath='/api/mobile/'+path;
  const headers=session?{Authorization:'Bearer '+session.token}:{};
  const response=await fetch(origin+'/api/mobile/challenge',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({id:session?.id??String(payload?.id??'').trim().toLowerCase(),deviceId:identity.deviceId,platform,purpose:session?'request':'login',method:payload===undefined?'GET':'POST',path:requestPath,bodyHash:await hash(body)})});
  const challenge=await apiResult(response);
  if(!response.ok)throw Object.assign(new Error(challenge.error??'Device verification is unavailable.'),{status:response.status});
  const proof=await plugin.proof({payload:challenge.payload,enroll:!challenge.registered});
  return {...headers,'X-Kite-Proof':base64url({...proof,challengeId:challenge.id})};
}

