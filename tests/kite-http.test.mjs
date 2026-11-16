import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createKiteHandler } from '../lib/kite-http.mjs';
import { startServer } from '../vendor/kite/server.mjs';

const origin = 'https://ahrok.site';
const password = 'Test-password-579!';

test('portal and browser assets load without a database and resolve under /kite', async () => {
  const handle = createKiteHandler({ start: () => { throw Error('must not initialize'); } });
  for (const path of ['/kite', '/kite/']) {
    const response = await handle(new Request(origin + path));
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<base href="\/kite\/">/);
  }
  for (const file of ['app.js', 'shell.mjs', 'config.js', 'mobile-auth.mjs', 'program-panels.mjs', 'capacitor.js', 'kite.svg']) {
    assert.equal((await handle(new Request(origin + '/kite/' + file))).status, 200, file);
  }
});

test('a failed database initialization returns a safe error and recovers', async () => {
  let count = 0;
  const handle = createKiteHandler({ onError() {}, start: () => {
    if (++count === 1) throw Error('postgres://secret-password');
    return { handler(req, res) { res.writeHead(200, {}); res.end('{}'); } };
  } });
  const first = await handle(new Request(origin + '/kite/api/admin/session'));
  assert.equal(first.status, 503);
  assert.doesNotMatch(await first.text(), /secret-password/);
  assert.equal((await handle(new Request(origin + '/kite/api/admin/session'))).status, 200);
});

test('admin workflow survives application restart; role and origin restrictions hold', async t => {
  const db = new DatabaseSync(':memory:');
  db.dialect = 'sqlite';
  const env = { DESK_ADMIN_ID: 'admin', DESK_ADMIN_PASSWORD: password,
    KITE_ADMIN_ORIGIN: origin, KITE_INSTITUTION_ID: 'nycmc-compass' };
  let app = await startServer({ database: db, env, listen: false });
  const handle = createKiteHandler({ start: () => app });
  t.after(() => app.close());
  let cookie;
  async function request(path, payload, { noCookie = false, requestOrigin = origin } = {}) {
    const headers = { origin: requestOrigin };
    if (cookie && !noCookie) headers.cookie = cookie;
    if (payload !== undefined) headers['content-type'] = 'application/json';
    return handle(new Request(origin + path, { method: payload === undefined ? 'GET' : 'POST', headers,
      body: payload === undefined ? undefined : JSON.stringify(payload) }));
  }
  const api = (path, payload, options) => request('/kite/api/admin/' + path, payload, options);
  const ok = async response => { assert.equal(response.status, 200, await response.clone().text()); return response.json(); };
  assert.equal((await api('session')).status, 401);
  assert.equal((await api('login', { id: 'admin', password }, { requestOrigin: 'https://evil.example' })).status, 403);
  const login = await api('login', { id: 'admin', password });
  await ok(login);
  cookie = login.headers.get('set-cookie').split(';')[0];
  assert.match(login.headers.get('set-cookie'), /Secure; HttpOnly; SameSite=Strict/);
  await ok(await api('groups', { name: 'Middle School' }));
  await ok(await api('teachers', { id: 'teacher', password }));
  const session = await ok(await api('session'));
  const day = session.today;
  let desk = await ok(await api('desk?day=' + day));
  const group = desk.groups[0].id;
  await ok(await api('students', { name: 'Sample Student', grade: '7', group }));
  await ok(await api('teacher-group', { teacher: 'teacher', group, assigned: true }));
  desk = await ok(await api('desk?day=' + day));
  const student = desk.students[0].id;
  await ok(await api('all-present', { day }));
  await ok(await api('record', { day, student, field: 'homework', value: 'Complete' }));
  await ok(await api('activities', { name: 'Coding', teacher: 'teacher', allGroups: true, groups: [] }));
  desk = await ok(await api('desk?day=' + day));
  const activity = desk.activities[0].id;
  await ok(await api('activity-record', { activity, student, field: 'participation', value: 'Participated', day }));
  await ok(await api('activity-record', { activity, student, field: 'progress', value: 1 }));
  await ok(await api('pickup-contact', { student, name: 'Sample Parent', relationship: 'Parent' }));
  desk = await ok(await api('desk?day=' + day));
  const contact = desk.pickupContacts[0].id;
  const pickup = { day, student, contact, note: '', identityChecked: true };
  await ok(await api('pickup', pickup));
  assert.equal((await api('pickup', pickup)).status, 409);
  await ok(await api('incident', { student, day, category: 'Other', detail: 'Sample incident', actionTaken: 'Resolved with staff' }));
  const exported = await api(`export?type=attendance&from=${day}&to=${day}`);
  assert.equal(exported.status, 200);
  assert.match(await exported.text(), /Sample Student.*Present/);
  assert.equal((await api('students', { name: 'Blocked', grade: '7' }, { requestOrigin: 'https://evil.example' })).status, 403);
  assert.equal((await api('login', { id: 'teacher', password }, { noCookie: true })).status, 403);
  assert.equal((await request('/api/mobile/login', { id: 'teacher', password }, { noCookie: true })).status, 403);
  assert.equal((await request('/api/mobile/session')).status, 401);
  // Start a new application over the same records and persisted session.
  app = await startServer({ database: db, env, listen: false });
  const restarted = createKiteHandler({ start: () => app });
  const after = await restarted(new Request(origin + '/kite/api/admin/desk?day=' + day, { headers: { cookie } }));
  const saved = await ok(after);
  assert.equal(saved.students[0].attendance, 'Present');
  assert.equal(saved.students[0].homework, 'Complete');
  assert.equal(saved.activities[0].students[0].level, 1);
  assert.equal(saved.pickups.length, 1);
  assert.equal(saved.incidents.length, 1);
  await ok(await api('logout', {}));
  assert.equal((await api('session')).status, 401);
});
