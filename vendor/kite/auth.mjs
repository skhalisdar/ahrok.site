/**
 * Store session digests server-side. The account lookup must load current role,
 * tenant membership and status from the database on every protected request.
 */
import { createHash, randomBytes } from 'node:crypto';

const policy = {
  'admin-web': { roles: ['admin'], ttlMs: 8 * 60 * 60_000 },
  mobile: { roles: ['admin', 'teacher'], ttlMs: 5 * 60_000 }
};

function reject(status, code) {
  throw Object.assign(new Error(code), { status, code });
}

function digest(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function createAuth({
  accounts, sessions, mobileProof,
  adminOrigin = 'https://ahrok.site', now = Date.now
}) {
  // The server route supplies the audience. Never derive it from request data.
  async function login(audience, req, credentials) {
    const rule = Object.hasOwn(policy, audience) ? policy[audience] : null;
    if (!rule) reject(403, 'AUDIENCE_FORBIDDEN');
    if (audience === 'admin-web') checkOrigin(req);
    const account = await accounts.verifyPassword(credentials);
    if (!account?.active) reject(401, 'INVALID_CREDENTIALS');
    if (!rule.roles.includes(account.role)) {
      reject(403, audience === 'admin-web' ? 'USE_KITE_MOBILE' : 'ROLE_FORBIDDEN');
    }
    const deviceId = audience === 'mobile' ?
      await mobileProof.verifyLoginAndConsume(req, account) : null;
    if (audience === 'mobile' && !deviceId) reject(403, 'APP_PROOF_REQUIRED');

    const token = randomBytes(32).toString('hex');
    const expiresAt = now() + rule.ttlMs;
    await sessions.insert(digest(token), {
      accountId: account.id, institutionId: account.institutionId,
      audience, role: account.role, deviceId, expiresAt
    });
    return { token, expiresAt };
  }

  function checkOrigin(req) {
    if (req.headers.origin !== adminOrigin) reject(403, 'ORIGIN_FORBIDDEN');
  }

  async function requireSession(audience, req, { requiredRole } = {}) {
    const rule = Object.hasOwn(policy, audience) ? policy[audience] : null;
    if (!rule) reject(403, 'AUDIENCE_FORBIDDEN');
    if (audience === 'admin-web' && !['GET','HEAD'].includes(req.method)) checkOrigin(req);
    const token = audience === 'admin-web'
      ? req.headers.cookie?.split(';').map(s => s.trim())
        .find(s => s.startsWith('__Host-kite-admin='))?.slice('__Host-kite-admin='.length)
      : req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    if (!token || !/^[a-f0-9]{64}$/.test(token)) reject(401, 'SESSION_REQUIRED');
    const tokenDigest = digest(token);
    const session = await sessions.find(tokenDigest);
    if (!session || session.expiresAt <= now() || session.audience !== audience) {
      reject(401, 'SESSION_REQUIRED');
    }
    const account = await accounts.find(session.accountId);
    if (!account?.active || !rule.roles.includes(account.role) || account.role !== session.role ||
        (requiredRole && account.role !== requiredRole) ||
        account.institutionId !== session.institutionId) reject(403, 'ROLE_FORBIDDEN');
    if (audience === 'mobile' &&
        !await mobileProof.verifyRequestAndConsume(req, session, tokenDigest)) {
      reject(403, 'APP_PROOF_REQUIRED');
    }
    return { accountId: account.id, institutionId: account.institutionId, role: account.role, tokenDigest };
  }

  return { login, requireSession };
}

export function adminCookie(token, maxAgeSeconds = 28_800) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new TypeError('Invalid session token');
  return '__Host-kite-admin=' + token + '; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=' + maxAgeSeconds;
}

