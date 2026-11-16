import { startServer } from '../vendor/kite/server.mjs';

// Run explicitly against the selected database, never during the website build.
// Existing administrators are preserved; bootstrap credentials initialize an empty database only.
if (process.env.NODE_ENV !== 'production') throw Error('Run with NODE_ENV=production and the intended PostgreSQL environment.');
if (process.env.KITE_SKIP_SCHEMA === '1') throw Error('Unset KITE_SKIP_SCHEMA while preparing the database.');
const app = await startServer({ listen: false });
await app.close();
console.log('Kite database preparation completed. Existing records and administrator credentials were preserved.');
