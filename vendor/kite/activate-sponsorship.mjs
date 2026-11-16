import { openDatabase } from './database.mjs';
import { activateSponsorship, initWorkspace, sponsoredInstitution } from './workspace.mjs';

if (process.argv.length !== 3 || process.argv[2] !== sponsoredInstitution.slug || (!process.env.DATABASE_URL && !process.env.PGHOST && !process.env.DESK_DB) ||
    process.env.DESK_DB === ':memory:' || process.env.DESK_DB?.startsWith('file:')) {
  console.error('Select a dedicated database and run: npm run activate-sponsorship -- nycmc-compass');
  process.exit(1);
}
process.umask(0o077);
const db = await openDatabase();
try {
  await initWorkspace(db);
  const workspace = await activateSponsorship(db);
  console.log(workspace.name + ' sponsored access expires at ' + new Date(workspace.expires_at).toISOString());
} finally {
  await db.close();
}

