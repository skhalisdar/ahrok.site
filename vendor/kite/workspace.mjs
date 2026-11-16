export const sponsoredInstitution = Object.freeze({
  slug: 'nycmc-compass',
  name: 'NYCMC/COMPASS'
});

export async function initWorkspace(db) {
  await db.exec('CREATE TABLE IF NOT EXISTS deployment_identity (id INTEGER PRIMARY KEY CHECK(id=1), institution_id TEXT NOT NULL)');
  await db.exec(`CREATE TABLE IF NOT EXISTS institution_workspace (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    access_type TEXT NOT NULL CHECK(access_type = 'sponsored'),
    activated_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL CHECK(expires_at > activated_at)
  )`);
}

export async function getWorkspace(db) {
  return await db.prepare('SELECT slug, name, access_type, activated_at, expires_at FROM institution_workspace WHERE id = 1').get() ?? null;
}

export async function activateSponsorship(db, now = new Date()) {
  const identity=await db.prepare('SELECT institution_id FROM deployment_identity WHERE id=1').get();
  if(identity && !['local',sponsoredInstitution.slug].includes(identity.institution_id))throw new Error('This database is already assigned to another institution.');
  const expires = new Date(now);
  expires.setUTCFullYear(now.getUTCFullYear() + 1);
  if (expires.getUTCMonth() !== now.getUTCMonth()) expires.setUTCDate(0);
  await db.prepare(`INSERT INTO institution_workspace VALUES (1, ?, ?, 'sponsored', ?, ?)
    ON CONFLICT(id) DO NOTHING`).run(sponsoredInstitution.slug, sponsoredInstitution.name, +now, +expires);
  const workspace = await getWorkspace(db);
  if (workspace.slug !== sponsoredInstitution.slug) throw new Error('This database is already assigned to another institution.');
  await db.prepare("INSERT INTO deployment_identity VALUES (1,?) ON CONFLICT(id) DO UPDATE SET institution_id=excluded.institution_id WHERE deployment_identity.institution_id='local'").run(sponsoredInstitution.slug);
  return workspace;
}

