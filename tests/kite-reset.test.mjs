import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { makeResetSQL } from '../vendor/kite/www/reset-helper.mjs';
import { createKiteHandler } from '../lib/kite-http.mjs';
const { scrypt } = createRequire(import.meta.url)('../vendor/kite/www/scrypt.js');

test('browser reset hashes match server verification including UTF-8 passwords', async () => {
  for (const suffix of ['', 'বাংলাé']) {
    const password = randomBytes(18).toString('base64url') + suffix;
    const sql = await makeResetSQL(password, scrypt);
    assert(!sql.includes(password));
    const [salt, digest] = sql.match(/SET password = '([a-f0-9:]+)'/)[1].split(':');
    const actual = scryptSync(password, salt, 64, { N:32768, r:8, p:1, maxmem:64*1024*1024 });
    assert(timingSafeEqual(Buffer.from(digest, 'hex'), actual));
    assert.match(sql, /DELETE FROM public.sessions WHERE user_id = 'admin'/);
    assert.match(sql, /Unexpected institution/);
  }
  await assert.rejects(makeResetSQL('short', scrypt));
});

test('recovery helper loads without backend access and forbids password transmission', async () => {
  const handle = createKiteHandler({ start: () => { throw Error('No backend should be needed'); } });
  const page = await handle(new Request('https://ahrok.site/kite/reset-helper'));
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-security-policy'), /connect-src 'none'/);
  assert.match(page.headers.get('content-security-policy'), /form-action 'none'/);
  for (const path of ['reset-helper.mjs', 'scrypt.js']) {
    assert.equal((await handle(new Request('https://ahrok.site/kite/' + path))).status, 200);
  }
});
