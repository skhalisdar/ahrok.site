import { createServer } from 'node:http';
import { openDatabase, initDatabase } from './database.mjs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createAuth, adminCookie } from './auth.mjs';
import { getWorkspace, initWorkspace } from './workspace.mjs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {bindInstitution,csv} from './operations.mjs';
import {createMobileProof,sha256} from './mobile-proof.mjs';
import {randomUUID} from 'node:crypto';
import {importStudents} from './www/student-import.mjs';

export async function startServer({database, env=process.env, listen=true} = {}) {
process.umask(0o077);
const db = database ?? await openDatabase(env);
if (env.KITE_SKIP_SCHEMA !== '1') await initDatabase(db);

if (env.KITE_SKIP_SCHEMA !== '1') await initWorkspace(db);
async function workspaceAccess() {
  const workspace = (await getWorkspace(db));
  if (workspace && workspace.expires_at <= Date.now()) {
    fail(403, 'Sponsored access has ended. Contact the program administrator.');
  }
  return workspace;
}

const sql = statement => db.prepare(statement);
const scryptOptions = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  return salt + ':' + scryptSync(password, salt, 64, scryptOptions).toString('hex');
}
const dummyHash = passwordHash(randomBytes(32).toString('hex'));
function validPassword(password, stored) {
  const [salt, digest] = stored.split(':');
  return timingSafeEqual(Buffer.from(digest, 'hex'), scryptSync(password, salt, 64, scryptOptions));
}
function fail(status, message) { throw Object.assign(new Error(message), {status}); }
function userId(value) {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(id)) fail(400, 'Use 3–32 letters, digits, dots, underscores or hyphens for the user ID.');
  return id;
}
function newPassword(value, minimum = 12) {
  if (typeof value !== 'string' || value.length < minimum || value.length > 128) {
    fail(400, `Use a password between ${minimum} and 128 characters.`);
  }
  return value;
}
if (!(await sql("SELECT 1 FROM users WHERE role = 'admin'").get())) {
  if (!env.DESK_ADMIN_ID || !env.DESK_ADMIN_PASSWORD) {
    throw new Error('Set DESK_ADMIN_ID and DESK_ADMIN_PASSWORD to initialize the administrator.');
  }
  (await sql("INSERT INTO users (id, role, password) VALUES (?, 'admin', ?)")
    .run(userId(env.DESK_ADMIN_ID), passwordHash(newPassword(env.DESK_ADMIN_PASSWORD))));
}
const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: env.DESK_TIMEZONE ?? 'America/New_York' });
function programDay() {
  const fields = Object.fromEntries(dateFormat.formatToParts().map(({type,value}) => [type,value]));
  return [fields.year, fields.month, fields.day].join('-');
}
function dateValue(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(400, 'Choose a valid date.');
  const parsed = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(+parsed) || parsed.toISOString().slice(0,10) !== value) fail(400, 'Choose a valid date.');
  return value;
}
async function body(req, limit = 8192) {
  req.setEncoding('utf8');
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (Buffer.byteLength(data) > limit) fail(413, 'Request too large.');
  }
  req.kiteRawBody=data;
  let value;
  try { value = JSON.parse(data); } catch { fail(400, 'Invalid request.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Invalid request.');
  return value;
}
let queue = Promise.resolve();
function exclusive(work) { const next = queue.then(work); queue = next.catch(() => {}); return next; }
async function rateLimit(key, max) {
  const now = Date.now();
  const bucket=sha256(key),expires=now+15*60000;
  await sql(`INSERT INTO auth_throttle VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET
    attempts=CASE WHEN auth_throttle.expires_at<=? THEN 1 ELSE auth_throttle.attempts+1 END,
    expires_at=CASE WHEN auth_throttle.expires_at<=? THEN ? ELSE auth_throttle.expires_at END`).run(bucket,expires,now,now,expires);
  if((await sql('SELECT attempts FROM auth_throttle WHERE bucket=?').get(bucket)).attempts>max)fail(429,'Too many attempts. Try again in 15 minutes.');
}
const statuses = {
  attendance: ['Unmarked','Present','Absent','Tardy'],
  homework: ['Unmarked','Complete','Needs Help','No Homework']
};
const origins = new Set(['capacitor://localhost', 'https://localhost']);
const page = await readFile(resolve(process.cwd(), 'vendor/kite/www/index.html'));
const config = await readFile(resolve(process.cwd(), 'vendor/kite/www/config.js'));
const client = await readFile(resolve(process.cwd(), 'vendor/kite/www/app.js'));
const mobileClient = await readFile(resolve(process.cwd(), 'vendor/kite/www/mobile-auth.mjs'));
const programClient = await readFile(resolve(process.cwd(), 'vendor/kite/www/program-panels.mjs'));
const capacitorRuntime = await readFile(resolve(process.cwd(), 'vendor/kite/www/capacitor.js'));
const safeHeaders = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const shell = await readFile(resolve(process.cwd(), 'vendor/kite/www/shell.mjs'));
const logo = await readFile(resolve(process.cwd(), 'vendor/kite/www/kite.svg'));
const studentImportClient = await readFile(resolve(process.cwd(), 'vendor/kite/www/student-csv.mjs'));
const port = Number(env.PORT ?? 4173);
const adminOrigin = env.KITE_ADMIN_ORIGIN ?? 'http://127.0.0.1:' + port;
if(env.NODE_ENV==='production'&&(!env.KITE_ADMIN_ORIGIN||!/^https:\/\/[^/]+$/.test(adminOrigin)))throw new Error('Set KITE_ADMIN_ORIGIN to the exact HTTPS administrator origin');
const institutionId = (await getWorkspace(db))?.slug ?? 'local';
const configuredInstitution=env.KITE_INSTITUTION_ID??institutionId;
if(env.NODE_ENV==='production'&&!env.KITE_INSTITUTION_ID) throw new Error('Set KITE_INSTITUTION_ID for the dedicated institution database');
if(institutionId!=='local'&&configuredInstitution!==institutionId) throw new Error('Institution does not match sponsored workspace');
await bindInstitution(db,configuredInstitution);
const mobileProof=createMobileProof({db,institutionId:configuredInstitution,env});
const auth = createAuth({
  adminOrigin,
  accounts: {
    async verifyPassword({id,password}) {
      const account = (await sql('SELECT * FROM users WHERE id = ? AND active = 1').get(id));
      if (!validPassword(password, account?.password ?? dummyHash) || !account) return null;
      (await workspaceAccess());
      return {id, role:account.role, active:true, institutionId:configuredInstitution};
    },
    async find(id) {
      const account = (await sql('SELECT id, role, active FROM users WHERE id = ?').get(id));
      return account && {...account,institutionId:configuredInstitution};
    }
  },
  sessions: {
    async insert(token, session) {
      (await sql('INSERT INTO sessions (token,user_id,expires,audience,role,device_id,institution_id) VALUES (?,?,?,?,?,?,?)')
        .run(token,session.accountId,session.expiresAt,session.audience,session.role,session.deviceId,session.institutionId));
    },
    async find(token) {
      const session = (await sql(`SELECT user_id AS accountId, expires AS expiresAt, audience, role, device_id AS deviceId, institution_id
        FROM sessions WHERE token = ?`).get(token));
      return session && {...session,institutionId:session.institution_id};
    }
  },
  mobileProof
});
const authMessages = {
  INVALID_CREDENTIALS:'Invalid user ID or password.',
  USE_KITE_MOBILE:'Teacher accounts sign in through the Kite iOS or Android app.',
  SESSION_REQUIRED:'Sign in to continue.',
  ORIGIN_FORBIDDEN:'Open Kite at the configured administrator address.',
  APP_PROOF_REQUIRED:'Mobile app verification is not available on this server.'
};

async function activityList(user, day) {
  const admin = user.role === 'admin';
  const activities = (await sql(`SELECT a.id, a.name, a.teacher_id, a.all_groups, u.active AS teacher_active
    FROM activities a JOIN users u ON u.id = a.teacher_id
    WHERE ? OR a.teacher_id = ? ORDER BY a.name_key`).all(Number(admin), user.id));
  const roster = sql(`SELECT s.id, s.name, g.id AS group_id, g.name AS group_name,
    p.status, coalesce(level.level, 0) AS level
    FROM activities a
    JOIN student_group_memberships m ON a.all_groups = 1 OR EXISTS (
      SELECT 1 FROM activity_groups ag WHERE ag.activity_id = a.id AND ag.group_id = m.group_id)
    JOIN students s ON s.id = m.student_id AND s.active = 1
    JOIN student_groups g ON g.id = m.group_id
    LEFT JOIN activity_participation p ON p.activity_id = a.id AND p.student_id = s.id AND p.day = ?
    LEFT JOIN activity_progress level ON level.activity_id = a.id AND level.student_id = s.id
    WHERE a.id = ? ORDER BY g.name_key, s.name, s.id`);
  const groups = sql('SELECT group_id FROM activity_groups WHERE activity_id = ? ORDER BY group_id');
  const result = [];
  for (const a of activities) result.push({...a, groups: (await groups.all(a.id)).map(g => g.group_id), students: (await roster.all(day, a.id))});
  return result;
}

async function saveActivity(input) {
  const {id, allGroups, groups} = input;
  const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
  if (!name || name.length > 60 || typeof allGroups !== 'boolean' || !Array.isArray(groups) ||
      (id !== undefined && !Number.isSafeInteger(id))) fail(400, 'Enter a valid activity name and group selection.');
  const teacher = userId(input.teacher);
  if (!(await sql("SELECT 1 FROM users WHERE id = ? AND role = 'teacher' AND active = 1").get(teacher))) {
    fail(404, 'Choose an active teacher.');
  }
  const selectedGroups = allGroups ? [] : [...new Set(groups)];
  const validGroups = new Set((await sql('SELECT id FROM student_groups').all()).map(g => g.id));
  if (!allGroups && (!selectedGroups.length || selectedGroups.some(g => !Number.isSafeInteger(g) || !validGroups.has(g)))) {
    fail(400, 'Choose at least one valid group.');
  }
  const key = name.normalize('NFC').toLowerCase();
  (await db.exec('BEGIN IMMEDIATE'));
  try {
    if ((await sql('SELECT 1 FROM activities WHERE name_key = ? AND id IS NOT ?').get(key, id ?? null))) {
      fail(409, 'An activity with this name already exists.');
    }
    const activity = id === undefined ?
      (await sql('INSERT INTO activities (name, name_key, teacher_id, all_groups) VALUES (?, ?, ?, ?) RETURNING id')
        .get(name, key, teacher, Number(allGroups))) :
      (await sql('UPDATE activities SET name = ?, name_key = ?, teacher_id = ?, all_groups = ? WHERE id = ? RETURNING id')
        .get(name, key, teacher, Number(allGroups), id));
    if (!activity) fail(404, 'Activity is unavailable.');
    (await sql('DELETE FROM activity_groups WHERE activity_id = ?').run(activity.id));
    const add = sql('INSERT INTO activity_groups VALUES (?, ?)');
    for (const group of selectedGroups) (await add.run(activity.id, group));
    (await db.exec('COMMIT'));
  } catch (error) {
    (await db.exec('ROLLBACK'));
    throw error;
  }
  return {};
}

async function saveActivityRecord(user, input) {
  const {activity, student, field, value} = input;
  if (!Number.isSafeInteger(activity) || !Number.isSafeInteger(student)) fail(400, 'Invalid activity or student.');
  const allowed = (await sql(`SELECT 1 FROM activities a JOIN student_group_memberships m ON m.student_id = ?
    JOIN students s ON s.id = m.student_id AND s.active = 1
    WHERE a.id = ? AND (? OR a.teacher_id = ?) AND (a.all_groups = 1 OR EXISTS (
      SELECT 1 FROM activity_groups ag WHERE ag.activity_id = a.id AND ag.group_id = m.group_id))`)
    .get(student, activity, Number(user.role === 'admin'), user.id));
  if (!allowed) fail(403, 'This activity record is outside your assigned roster.');
  if (field === 'participation') {
    const day = dateValue(input.day);
    if (value === 'Unmarked') {
      (await sql('DELETE FROM activity_participation WHERE activity_id = ? AND day = ? AND student_id = ?').run(activity, day, student));
    } else {
      if (!['Participated','Did Not Participate'].includes(value)) fail(400, 'Invalid participation status.');
      (await sql(`INSERT INTO activity_participation (activity_id, day, student_id, status) VALUES (?, ?, ?, ?)
        ON CONFLICT(activity_id, day, student_id) DO UPDATE SET status = excluded.status`).run(activity, day, student, value));
    }
  } else if (field === 'progress' && [-1,1].includes(value)) {
    (await sql(`INSERT INTO activity_progress VALUES (?, ?, max(0, ?))
      ON CONFLICT(activity_id, student_id) DO UPDATE SET level = max(0, min(5, level + ?))`)
      .run(activity, student, value, value));
  } else {
    fail(400, 'Invalid activity update.');
  }
  return {};
}

async function api(req, url, audience, headers) {
  const route = req.method + ' ' + url.pathname;
  if(audience==='mobile'&&route==='POST /api/challenge') {
    await rateLimit('challenge:'+req.socket.remoteAddress,1000);
    return mobileProof.challenge(await body(req),req);
  }
  if (route === 'POST /api/login') {
    await rateLimit('ip:' + req.socket.remoteAddress, 100);
    await sql('DELETE FROM sessions WHERE expires<=?').run(Date.now());
    await sql('DELETE FROM auth_throttle WHERE expires_at<=?').run(Date.now());
    const input = await body(req);
    const id = userId(input.id);
    await rateLimit('user:' + id, 12);
    if (typeof input.password !== 'string' || input.password.length > 128) fail(401, 'Invalid user ID or password.');
    const result = await auth.login(audience, req, {id,password:input.password});
    await sql('DELETE FROM auth_throttle WHERE bucket=?').run(sha256('user:'+id));
    const {role} = (await sql('SELECT role FROM users WHERE id = ?').get(id));
    if (audience === 'admin-web') {
      headers['Set-Cookie'] = adminCookie(result.token);
      return {id, role, today:programDay()};
    }
    return {token:result.token, id, role, expiresAt:result.expiresAt, institutionId:configuredInstitution,today:programDay()};
  }
  // Read the body before checking the session so a slow upload cannot use a session revoked in the meantime.
  const input = req.method === 'POST' ? await body(req, route === 'POST /api/import-students' ? 262144 : 8192) : {};
  const verified = await auth.requireSession(audience, req);
  const user = {id:verified.accountId,role:verified.role,tokenHash:verified.tokenDigest};
  const admin = user.role === 'admin';
  if (route === 'POST /api/logout') {
    (await sql('DELETE FROM sessions WHERE token = ?').run(user.tokenHash));
    if (audience === 'admin-web') headers['Set-Cookie'] = adminCookie('0'.repeat(64), 0);
    return {};
  }
  const workspace = (await workspaceAccess());
  if(route==='GET /api/session')return {id:user.id,role:user.role,today:programDay()};
  if (route === 'GET /api/desk') {
    const day = dateValue(url.searchParams.get('day'));
    const students = (await sql(`SELECT s.id, s.name, s.grade, s.level, s.active,
      r.attendance, r.homework, r.note, g.id AS group_id, g.name AS group_name
      FROM students s LEFT JOIN records r ON r.student = s.id AND r.day = ?
      LEFT JOIN student_group_memberships m ON m.student_id = s.id
      LEFT JOIN student_groups g ON g.id = m.group_id
      WHERE s.active = 1 OR (? AND r.student IS NOT NULL) ORDER BY s.name, s.id`).all(day, Number(admin)));
    const staff = (await sql(`SELECT l.id, l.teacher, l.signed_in, l.at FROM staff_log l
      WHERE l.day = ? AND (? OR l.teacher = ?) ORDER BY l.id DESC`).all(day, Number(admin), user.id));
    const teachers = admin ? (await sql("SELECT id, active FROM users WHERE role = 'teacher' ORDER BY id").all()) : [];
    const groups = admin ? (await sql('SELECT id, name FROM student_groups ORDER BY name_key').all()) :
      (await sql(`SELECT g.id, g.name FROM student_groups g JOIN teacher_group_assignments a ON a.group_id = g.id
        WHERE a.teacher_id = ? ORDER BY g.name_key`).all(user.id));
    const assignments = admin ? (await sql('SELECT group_id, teacher_id FROM teacher_group_assignments ORDER BY teacher_id').all()) : [];
    const incidents=await sql(`SELECT i.*,s.name AS student_name FROM incidents i JOIN students s ON s.id=i.student
      WHERE i.day=? AND (? OR (i.recorded_by=? AND s.active=1)) ORDER BY i.at DESC`).all(day,Number(admin),user.id);
    const pickupContacts=await sql('SELECT c.* FROM pickup_contacts c JOIN students s ON s.id=c.student WHERE c.active=1 AND (? OR s.active=1) ORDER BY c.name').all(Number(admin));
    const pickups=await sql('SELECT p.*,s.name AS student_name FROM pickup_events p JOIN students s ON s.id=p.student WHERE p.day=? AND (? OR s.active=1) ORDER BY p.at DESC').all(day,Number(admin));
    const devices=admin?await sql('SELECT id,platform,active,created_at FROM mobile_devices WHERE institution_id=? ORDER BY created_at DESC').all(configuredInstitution):[];
    return {students, staff, teachers, groups, assignments, incidents,pickupContacts,pickups,devices,activities: (await activityList(user, day)), workspace: workspace && {name: workspace.name, accessType: workspace.access_type, expiresAt: workspace.expires_at}, today: programDay()};
  }
  if(route==='POST /api/incident') {
    const student=Number(input.student),day=dateValue(input.day);
    if(!Number.isSafeInteger(student)||!await sql('SELECT id FROM students WHERE id=? AND active=1').get(student))fail(404,'Student is unavailable.');
    if(!['Injury','Behavior','Safety','Other'].includes(input.category))fail(400,'Choose an incident category.');
    for(const field of ['detail','actionTaken'])if(typeof input[field]!=='string'||!input[field].trim()||input[field].length>2000)fail(400,'Enter incident details and the action taken, up to 2000 characters each.');
    if(!admin&&day!==programDay())fail(400,'Teachers record incidents for today.');
    await sql('INSERT INTO incidents (id,student,day,category,detail,action_taken,recorded_by,at) VALUES (?,?,?,?,?,?,?,?)').run(randomUUID(),student,day,input.category,input.detail.trim(),input.actionTaken.trim(),user.id,new Date().toISOString());
    return {};
  }
  if(route==='POST /api/pickup') {
    if(input.day!==programDay())fail(400,'Pickup can only be recorded for today.');
    if(!Number.isSafeInteger(input.student)||typeof input.contact!=='string'||typeof input.note!=='string'||input.note.length>500||input.identityChecked!==true)fail(400,'Confirm pickup identity and choose an authorized contact.');
    const contact=await sql('SELECT c.* FROM pickup_contacts c JOIN students s ON s.id=c.student WHERE c.id=? AND c.student=? AND c.active=1 AND s.active=1').get(input.contact,input.student);
    if(!contact)fail(403,'This person is not an active authorized pickup contact.');
    if(await sql('SELECT id FROM pickup_events WHERE student=? AND day=? AND voided_at IS NULL').get(input.student,input.day))fail(409,'Pickup has already been recorded.');
    await sql('INSERT INTO pickup_events (id,student,day,contact,contact_name,recorded_by,at,note) VALUES (?,?,?,?,?,?,?,?)').run(randomUUID(),input.student,input.day,contact.id,contact.name,user.id,new Date().toISOString(),input.note.trim());
    return {};
  }
  if(route==='GET /api/export') {
    if(!admin)fail(403,'Administrator access required.');
    const from=dateValue(url.searchParams.get('from')),to=dateValue(url.searchParams.get('to'));
    if(from>to||(+new Date(to)- +new Date(from))/86400000>366)fail(400,'Choose a date range of at most 367 days.');
    const type=url.searchParams.get('type');
    const sources={
      attendance:['SELECT r.day,s.id,s.name,s.grade,r.attendance FROM records r JOIN students s ON s.id=r.student WHERE r.day BETWEEN ? AND ? ORDER BY r.day,s.id',['day','id','name','grade','attendance']],
      homework:['SELECT r.day,s.id,s.name,r.homework,r.note FROM records r JOIN students s ON s.id=r.student WHERE r.day BETWEEN ? AND ? ORDER BY r.day,s.id',['day','id','name','homework','note']],
      staff:['SELECT day,teacher,signed_in,at FROM staff_log WHERE day BETWEEN ? AND ? ORDER BY at',['day','teacher','signed_in','at']],
      activities:['SELECT p.day,a.name AS activity,s.name AS student,p.status FROM activity_participation p JOIN activities a ON a.id=p.activity_id JOIN students s ON s.id=p.student_id WHERE p.day BETWEEN ? AND ? ORDER BY p.day,a.id,s.id',['day','activity','student','status']],
      incidents:['SELECT * FROM incidents WHERE day BETWEEN ? AND ? ORDER BY day,at',['day','student','category','detail','action_taken','recorded_by','at','resolved_by','resolution','resolved_at']],
      pickup:['SELECT * FROM pickup_events WHERE day BETWEEN ? AND ? ORDER BY day,at',['day','student','contact_name','recorded_by','at','note','voided_by','void_reason','voided_at']]
    };
    if(!Object.hasOwn(sources,type))fail(400,'Choose an export type.');
    const [statement,columns]=sources[type],rows=await sql(statement).all(from,to);
    if(rows.length>50000)fail(413,'Export too large; choose a smaller date range.');
    headers['Content-Disposition']=`attachment; filename="kite-${type}-${from}-${to}.csv"`;
    return {csv:csv(columns,rows),type:'text/csv; charset=utf-8'};
  }
  if (route === 'POST /api/record') {
    const {student, field, value} = input;
    const day = dateValue(input.day);
    if (!Number.isSafeInteger(student) || !(await sql('SELECT 1 FROM students WHERE id = ? AND active = 1').get(student))) fail(404, 'Student is unavailable.');
    if (field === 'note' ? typeof value !== 'string' || value.length > 140 :
        !Object.hasOwn(statuses, field) || !statuses[field].includes(value)) fail(400, 'Invalid student record.');
    (await sql(`INSERT INTO records (day, student, ${field}) VALUES (?, ?, ?)
      ON CONFLICT(day,student) DO UPDATE SET ${field} = excluded.${field}`).run(day, student, value));
    return {};
  }
  if (route === 'POST /api/step') {
    if (!Number.isSafeInteger(input.student) || ![-1,1].includes(input.delta)) fail(400, 'Invalid progress update.');
    const row = (await sql('UPDATE students SET level = max(0, min(5, level + ?)) WHERE id = ? AND active = 1 RETURNING level')
      .get(input.delta, input.student));
    if (!row) fail(404, 'Student is unavailable.');
    return row;
  }
  if (route === 'POST /api/shift') {
    if (admin) fail(403, 'Staff check-ins are for teachers.');
    if (input.day !== programDay() || typeof input.signedIn !== 'boolean') fail(400, 'Select today to record a shift.');
    const last = (await sql('SELECT signed_in FROM staff_log WHERE day = ? AND teacher = ? ORDER BY id DESC LIMIT 1').get(input.day, user.id));
    if (Boolean(last?.signed_in) !== input.signedIn) {
      (await sql('INSERT INTO staff_log (day, teacher, signed_in, at) VALUES (?, ?, ?, ?)')
        .run(input.day, user.id, Number(input.signedIn), new Date().toISOString()));
    }
    return {};
  }
  if (route === 'POST /api/activity-record') return (await saveActivityRecord(user, input));
  if (!admin) fail(403, 'Administrator access required.');
  if (route === 'POST /api/import-students') return await importStudents(db, input);
  if(route==='POST /api/rename-group') {
    const name=typeof input.name==='string'?input.name.trim().replace(/\s+/g,' '):'';
    if(!Number.isSafeInteger(input.group)||!name||name.length>60)fail(400,'Enter a valid group name.');
    const result=await sql('UPDATE student_groups SET name=?,name_key=? WHERE id=?').run(name,name.normalize('NFC').toLowerCase(),input.group);
    if(!result.changes)fail(404,'Group not found.');return {};
  }
  if(route==='POST /api/student-details') {
    if(!Number.isSafeInteger(input.student)||typeof input.name!=='string'||!input.name.trim()||input.name.length>80||typeof input.grade!=='string'||!input.grade.trim()||input.grade.length>60)fail(400,'Enter a student name and grade.');
    const result=await sql('UPDATE students SET name=?,grade=? WHERE id=?').run(input.name.trim(),input.grade.trim(),input.student);
    if(!result.changes)fail(404,'Student not found.');return {};
  }
  if(route==='GET /api/devices')return {devices:await sql('SELECT id,platform,sign_count,institution_id,active,created_at FROM mobile_devices WHERE institution_id=?').all(configuredInstitution)};
  if(route==='POST /api/revoke-device') {
    if(typeof input.id!=='string')fail(400,'Choose a device.');
    await db.exec('BEGIN IMMEDIATE');
    try{
      await sql('UPDATE mobile_devices SET active=0 WHERE id=? AND institution_id=?').run(input.id,configuredInstitution);
      await sql('DELETE FROM sessions WHERE device_id=? AND institution_id=?').run(input.id,configuredInstitution);
      await db.exec('COMMIT');
    }catch(error){await db.exec('ROLLBACK');throw error;}return {};
  }
  if(route==='POST /api/pickup-contact') {
    if(!Number.isSafeInteger(input.student)||!await sql('SELECT id FROM students WHERE id=? AND active=1').get(input.student))fail(404,'Student is unavailable.');
    if(typeof input.name!=='string'||!input.name.trim()||input.name.length>120||typeof input.relationship!=='string'||!input.relationship.trim()||input.relationship.length>80)fail(400,'Enter a pickup contact name and relationship.');
    await sql('INSERT INTO pickup_contacts (id,student,name,relationship,created_by,at) VALUES (?,?,?,?,?,?)').run(randomUUID(),input.student,input.name.trim(),input.relationship.trim(),user.id,new Date().toISOString());return {};
  }
  if(route==='POST /api/pickup-contact-disable') {
    if(typeof input.id!=='string')fail(400,'Choose a pickup contact.');
    const result=await sql('UPDATE pickup_contacts SET active=0 WHERE id=?').run(input.id);
    if(!result.changes)fail(404,'Contact not found.');return {};
  }
  if(route==='POST /api/resolve-incident') {
    if(typeof input.id!=='string'||typeof input.resolution!=='string'||!input.resolution.trim()||input.resolution.length>2000)fail(400,'Enter a resolution.');
    const result=await sql('UPDATE incidents SET resolution=?,resolved_by=?,resolved_at=? WHERE id=? AND resolved_at IS NULL').run(input.resolution.trim(),user.id,new Date().toISOString(),input.id);
    if(!result.changes)fail(409,'Incident is missing or already resolved.');return {};
  }
  if(route==='POST /api/void-pickup') {
    if(typeof input.id!=='string'||typeof input.reason!=='string'||!input.reason.trim()||input.reason.length>500)fail(400,'Enter a correction reason.');
    const result=await sql('UPDATE pickup_events SET void_reason=?,voided_by=?,voided_at=? WHERE id=? AND voided_at IS NULL').run(input.reason.trim(),user.id,new Date().toISOString(),input.id);
    if(!result.changes)fail(409,'Pickup is missing or already corrected.');return {};
  }
  if (route === 'POST /api/activities') return (await saveActivity(input));
  if (route === 'POST /api/groups') {
    const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
    if (!name || name.length > 60) fail(400, 'Enter a group name of up to 60 characters.');
    const key = name.normalize('NFC').toLowerCase();
    const result = (await sql('INSERT INTO student_groups (name, name_key) VALUES (?, ?) ON CONFLICT(name_key) DO NOTHING')
      .run(name, key));
    if (!result.changes) fail(409, 'A group with this name already exists.');
    return {};
  }
  if (route === 'POST /api/teacher-group') {
    const {group, assigned} = input;
    const teacher = userId(input.teacher);
    if (typeof assigned !== 'boolean' || !Number.isSafeInteger(group)) fail(400, 'Invalid group assignment.');
    if (!(await sql('SELECT 1 FROM student_groups WHERE id = ?').get(group))) fail(404, 'Group is unavailable.');
    if (assigned) {
      if (!(await sql("SELECT 1 FROM users WHERE id = ? AND role = 'teacher' AND active = 1").get(teacher))) {
        fail(404, 'Active teacher account unavailable.');
      }
      (await sql('INSERT INTO teacher_group_assignments VALUES (?, ?) ON CONFLICT(group_id, teacher_id) DO NOTHING')
        .run(group, teacher));
    } else {
      (await sql('DELETE FROM teacher_group_assignments WHERE group_id = ? AND teacher_id = ?').run(group, teacher));
    }
    return {};
  }
  if (route === 'POST /api/student-group') {
    const {student, group} = input;
    if (!Number.isSafeInteger(student) || !(await sql('SELECT 1 FROM students WHERE id = ? AND active = 1').get(student))) {
      fail(404, 'Student is unavailable.');
    }
    if (group === null) {
      (await sql('DELETE FROM student_group_memberships WHERE student_id = ?').run(student));
    } else {
      if (!Number.isSafeInteger(group) || !(await sql('SELECT 1 FROM student_groups WHERE id = ?').get(group))) {
        fail(404, 'Group is unavailable.');
      }
      (await sql(`INSERT INTO student_group_memberships (student_id, group_id) VALUES (?, ?)
        ON CONFLICT(student_id) DO UPDATE SET group_id = excluded.group_id`).run(student, group));
    }
    return {};
  }
  if (route === 'POST /api/all-present') {
    const day = dateValue(input.day);
    (await sql(`INSERT INTO records (day, student, attendance)
      SELECT ?, id, 'Present' FROM students WHERE active = 1
      ON CONFLICT(day,student) DO UPDATE SET attendance = 'Present'`).run(day));
    return {};
  }
  if (route === 'POST /api/students') {
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const grade = typeof input.grade === 'string' ? input.grade.trim() : '';
    const group = input.group ?? null;
    if (!name || name.length > 80 || !grade || grade.length > 60) {
      fail(400, 'Enter a student name (up to 80 characters) and grade (up to 60 characters).');
    }
    (await db.exec('BEGIN IMMEDIATE'));
    try {
      if (group !== null && (!Number.isSafeInteger(group) || !(await sql('SELECT 1 FROM student_groups WHERE id = ?').get(group)))) {
        fail(404, 'Group is unavailable.');
      }
      // Keep the legacy Track column compatible with existing databases.
      const student = (await sql("INSERT INTO students (name, grade, track) VALUES (?, ?, '') RETURNING id").get(name, grade));
      if (group !== null) {
        (await sql('INSERT INTO student_group_memberships (student_id, group_id) VALUES (?, ?)').run(student.id, group));
      }
      (await db.exec('COMMIT'));
    } catch (error) {
      (await db.exec('ROLLBACK'));
      throw error;
    }
    return {};
  }
  if (route === 'POST /api/archive-student') {
    if (!Number.isSafeInteger(input.student)) fail(400, 'Invalid student.');
    (await sql('UPDATE students SET active = 0 WHERE id = ?').run(input.student));
    return {};
  }
  if (route === 'POST /api/teachers') {
    const id = userId(input.id);
    if ((await sql('SELECT 1 FROM users WHERE id = ?').get(id))) fail(409, 'This user ID is already reserved.');
    (await sql("INSERT INTO users (id, role, password) VALUES (?, 'teacher', ?)")
      .run(id, passwordHash(newPassword(input.password, 6))));
    return {};
  }
  if (route === 'POST /api/teacher-access') {
    const id = userId(input.id);
    if (!(await sql("SELECT 1 FROM users WHERE role = 'teacher' AND id = ? AND active = 1").get(id))) fail(404, 'Active teacher account unavailable.');
    if (!['disable','reset'].includes(input.action)) fail(400, 'Invalid account action.');
    const password = input.action === 'reset' ? passwordHash(newPassword(input.password, 6)) : null;
    (await db.exec('BEGIN IMMEDIATE'));
    try {
      if (password) (await sql('UPDATE users SET password = ? WHERE id = ?').run(password, id));
      else (await sql('UPDATE users SET active = 0 WHERE id = ?').run(id));
      (await sql('DELETE FROM sessions WHERE user_id = ?').run(id));
      (await db.exec('COMMIT'));
    } catch (error) {
      (await db.exec('ROLLBACK'));
      throw error;
    }
    return {};
  }
  fail(404, 'Unknown endpoint.');
}

const handler = async (req,res) => {
  const origin = req.headers.origin;
  const cors = origins.has(origin) ? {
    'Access-Control-Allow-Origin':origin,
    'Access-Control-Allow-Headers':'Authorization, Content-Type, X-Kite-Proof',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Vary':'Origin'
  } : {};
  const responseHeaders = {};
  function send(status, value, type='application/json; charset=utf-8') {
    res.writeHead(status, {...safeHeaders, ...cors, ...responseHeaders, 'Content-Type':type});
    res.end(type.startsWith('application/json') ? JSON.stringify(value) : value);
  }
  try {
    const url = new URL(req.url, 'http://localhost');
    req.kitePath=url.pathname+url.search;
    if (req.method === 'OPTIONS' && origins.has(origin)) {
      res.writeHead(204, {...safeHeaders,...cors});
      return res.end();
    }
    if (req.method === 'GET' && url.pathname === '/healthz') {
      return send(200, {status:'ok'});
    }
    if(req.method==='GET'&&url.pathname==='/readyz'){
      await exclusive(()=>db.prepare('SELECT 1').get());return send(200,{status:'ok'});
    }
    if (req.method === 'GET' && url.pathname === '/kite') {
      res.writeHead(308, {Location:'/kite/'});
      return res.end();
    }
    const asset = url.pathname.replace(/^\/kite(?=\/)/, '');
    if (req.method === 'GET' && asset === '/') return send(200,page,'text/html; charset=utf-8');
    if (req.method === 'GET' && asset === '/app.js') return send(200,client,'text/javascript; charset=utf-8');
    if (req.method === 'GET' && asset === '/mobile-auth.mjs') return send(200,mobileClient,'text/javascript; charset=utf-8');
    if (req.method === 'GET' && asset === '/program-panels.mjs') return send(200,programClient,'text/javascript; charset=utf-8');
    if (req.method === 'GET' && asset === '/capacitor.js') return send(200,capacitorRuntime,'text/javascript; charset=utf-8');
    if (req.method === 'GET' && asset === '/config.js') return send(200,config,'text/javascript; charset=utf-8');
    if (req.method === 'GET' && asset === '/shell.mjs') return send(200,shell,'text/javascript; charset=utf-8');
    if (req.method === 'GET' && asset === '/student-csv.mjs') return send(200,studentImportClient,'text/javascript; charset=utf-8');
    if (req.method === 'GET' && asset === '/kite.svg') return send(200,logo,'image/svg+xml');
    const match = url.pathname.match(/^(\/kite\/api\/admin|\/api\/mobile)(\/.+)$/);
    if (!match) return send(404,{error:'Unknown page.'});
    const audience = match[1] === '/kite/api/admin' ? 'admin-web' : 'mobile';
    url.pathname = '/api' + match[2];
    const result=await exclusive(() => api(req,url,audience,responseHeaders));
    if(result?.type==='text/csv; charset=utf-8')return send(200,result.csv,result.type);
    send(200,result);
  } catch (error) {
    if(error.code==='23505'||error.code==='SQLITE_CONSTRAINT_UNIQUE'){error.status=409;error.message='This record already exists. Refresh and try again.';}
    if (!error.status) console.error(error);
    send(error.status ?? 500, {error:authMessages[error.code] ?? (error.status ? error.message : 'The server could not complete the request.')});
  }
};
const server = createServer({maxHeaderSize:65536},handler);
if(listen)server.listen(port, env.DESK_HOST ?? '127.0.0.1');

return {server, handler, close:async () => {
  if(server.listening)await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  await exclusive(() => db.close());
}};
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const app = await startServer();
  for (const signal of ['SIGTERM','SIGINT']) process.on(signal, () => {
    app.close().then(() => process.exit(0));
    setTimeout(() => process.exit(1),25000).unref();
  });
}


