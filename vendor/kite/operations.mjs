// Durable institution-local program workflows; all authorization is server-side.
export const operationsSchema = `
CREATE TABLE IF NOT EXISTS deployment_identity (id INTEGER PRIMARY KEY CHECK(id=1), institution_id TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pickup_contacts (
 id TEXT PRIMARY KEY, student INTEGER NOT NULL REFERENCES students(id), name TEXT NOT NULL,
 relationship TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_by TEXT NOT NULL REFERENCES users(id), at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pickup_events (
 id TEXT PRIMARY KEY, student INTEGER NOT NULL REFERENCES students(id), day TEXT NOT NULL,
 contact TEXT NOT NULL REFERENCES pickup_contacts(id), contact_name TEXT NOT NULL,
 recorded_by TEXT NOT NULL REFERENCES users(id), at TEXT NOT NULL, note TEXT NOT NULL DEFAULT '',
 voided_by TEXT REFERENCES users(id), void_reason TEXT, voided_at TEXT
);
CREATE INDEX IF NOT EXISTS pickup_day ON pickup_events(day, student);
CREATE UNIQUE INDEX IF NOT EXISTS pickup_once ON pickup_events(student,day) WHERE voided_at IS NULL;
CREATE TABLE IF NOT EXISTS incidents (
 id TEXT PRIMARY KEY, student INTEGER NOT NULL REFERENCES students(id), day TEXT NOT NULL,
 category TEXT NOT NULL, detail TEXT NOT NULL, action_taken TEXT NOT NULL,
 recorded_by TEXT NOT NULL REFERENCES users(id), at TEXT NOT NULL,
 resolved_by TEXT REFERENCES users(id), resolution TEXT, resolved_at TEXT
);
CREATE INDEX IF NOT EXISTS incidents_day ON incidents(day,student);
CREATE TABLE IF NOT EXISTS mobile_devices (
 id TEXT PRIMARY KEY, platform TEXT NOT NULL CHECK(platform IN ('ios','android')),
 public_key TEXT NOT NULL, sign_count INTEGER NOT NULL DEFAULT 0,
 institution_id TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS mobile_challenges (
 id TEXT PRIMARY KEY, payload TEXT NOT NULL, institution_id TEXT NOT NULL,
 account_id TEXT NOT NULL, platform TEXT NOT NULL, device_id TEXT NOT NULL,
 purpose TEXT NOT NULL, method TEXT NOT NULL, path TEXT NOT NULL,
 body_hash TEXT NOT NULL, session_hash TEXT NOT NULL, expires_at BIGINT NOT NULL,
 used INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS mobile_challenges_expiry ON mobile_challenges(expires_at);
CREATE TABLE IF NOT EXISTS auth_throttle (bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at BIGINT NOT NULL);
`;

export async function bindInstitution(db, institutionId) {
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(institutionId)) throw new Error('Invalid institution ID');
  await db.prepare('INSERT INTO deployment_identity VALUES (1,?) ON CONFLICT(id) DO NOTHING').run(institutionId);
  const identity=await db.prepare('SELECT institution_id FROM deployment_identity WHERE id=1').get();
  if(identity.institution_id!==institutionId) throw new Error('This database belongs to a different institution');
}

export function csv(columns, rows) {
  const field=value=> {
    let text=value==null?'':String(value);
    // Prevent spreadsheet formula execution, including leading control/space characters.
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text="'"+text;
    return '"'+text.replaceAll('"','""')+'"';
  };
  return '\ufeff'+[columns,...rows.map(row=>columns.map(c=>row[c]))].map(row=>row.map(field).join(',')).join('\r\n')+'\r\n';
}

