import {DatabaseSync, backup} from 'node:sqlite';
import {mkdtemp, mkdir, writeFile} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {openDatabase, initDatabase} from '../database.mjs';
import {initWorkspace} from '../workspace.mjs';

export const tables = ['users','students','student_groups','teacher_group_assignments',
  'student_group_memberships','activities','activity_groups','activity_participation',
  'activity_progress','records','staff_log','institution_workspace','deployment_identity',
  'pickup_contacts','pickup_events','incidents','mobile_devices'];
function fingerprint(rows) {
  return createHash('sha256').update(JSON.stringify(rows.map(row =>
    Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))))
    .map(row=>JSON.stringify(row)).sort())).digest('hex');
}

export async function migrate(source, target) {
  if (target.dialect !== 'postgres') throw new Error('Target must be PostgreSQL');
  if (source.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok' ||
      source.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Source integrity check failed');
  const present = source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r=>r.name);
  const unknown = present.filter(t=>![...tables,'sessions','mobile_challenges','auth_throttle'].includes(t));
  if (unknown.length) throw new Error('Unknown source tables: ' + unknown.join(', '));
  await target.exec('BEGIN');
  try {
    await target.exec("SELECT pg_advisory_xact_lock(74381529)");
    await initDatabase(target);
    await initWorkspace(target);
    for (const table of [...tables,'sessions','mobile_challenges','auth_throttle']) {
      if ((await target.prepare(`SELECT 1 FROM ${table} LIMIT 1`).all()).length) throw new Error('Target is not empty: ' + table);
    }
    const report = {};
    for (const table of tables) {
      if (!present.includes(table)) { report[table]={count:0}; continue; }
      const rows = source.prepare(`SELECT * FROM ${table}`).all();
      const columns = source.prepare(`PRAGMA table_info(${table})`).all().map(c=>c.name);
      const allowed = (await target.prepare('SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ?').all(table)).map(c=>c.column_name);
      if (columns.some(c=>!allowed.includes(c))) throw new Error('Unsupported source columns: ' + table);
      const insert = target.prepare(`INSERT INTO ${table} (${columns.map(c=>'"'+c+'"').join(',')}) VALUES (${columns.map(()=>'?').join(',')})`);
      for (const row of rows) await insert.run(...columns.map(c=>row[c]));
      const copied = await target.prepare(`SELECT ${columns.map(c=>'"'+c+'"').join(',')} FROM ${table}`).all();
      if (rows.length !== copied.length || fingerprint(rows) !== fingerprint(copied)) throw new Error('Verification failed: ' + table);
      report[table] = {count:rows.length, sha256:fingerprint(rows)};
    }
    for (const table of ['students','student_groups','activities','staff_log']) {
      await target.exec(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), coalesce((SELECT max(id) FROM ${table}),0)+1, false)`);
    }
    await target.exec('COMMIT');
    return {tables:report, sessions:'Not copied; fresh login required. Device public keys and counters preserved.'};
  } catch(error) { await target.exec('ROLLBACK'); throw error; }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [sourcePath, backupRoot, mode] = process.argv.slice(2);
  if (!sourcePath || !backupRoot || !['--snapshot-only','--import'].includes(mode)) {
    throw new Error('Usage: node scripts/migrate-postgres.mjs SOURCE.sqlite BACKUP_DIRECTORY --snapshot-only|--import (stop source writes first)');
  }
  process.umask(0o077);
  await mkdir(resolve(backupRoot),{recursive:true});
  const directory = await mkdtemp(join(resolve(backupRoot),'kite-'));
  const original = new DatabaseSync(resolve(sourcePath),{readOnly:true});
  const snapshotPath = join(directory,'source.sqlite');
  try { await backup(original,snapshotPath); } finally { original.close(); }
  const snapshot = new DatabaseSync(snapshotPath,{readOnly:true});
  let target;
  try {
    if (mode === '--snapshot-only') {
      if (snapshot.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Invalid snapshot');
      console.log('Verified SQLite-aware snapshot: ' + snapshotPath);
    } else {
      if (!process.env.DATABASE_URL && !process.env.PGHOST) throw new Error('PostgreSQL target settings required');
      target = await openDatabase();
      const report = await migrate(snapshot,target);
      await writeFile(join(directory,'verification.json'),JSON.stringify(report,null,2));
      console.log('Verified import; report: ' + join(directory,'verification.json'));
    }
  } finally { snapshot.close(); await target?.close(); }
}

