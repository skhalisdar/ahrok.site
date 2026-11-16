import { Readable } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startServer } from '../vendor/kite/server.mjs';

const assets = new Map([
  ['/kite', ['index.html', 'text/html; charset=utf-8']],
  ['/kite/', ['index.html', 'text/html; charset=utf-8']],
  ['/kite/reset-helper', ['reset-helper.html', 'text/html; charset=utf-8']],
  ['/kite/reset-helper.mjs', ['reset-helper.mjs', 'text/javascript; charset=utf-8']],
  ['/kite/scrypt.js', ['scrypt.js', 'text/javascript; charset=utf-8']],
  ...['app.js', 'config.js', 'capacitor.js', 'mobile-auth.mjs', 'program-panels.mjs', 'shell.mjs', 'student-csv.mjs']
    .map(name => ['/kite/' + name, [name, 'text/javascript; charset=utf-8']]),
  ['/kite/kite.svg', ['kite.svg', 'image/svg+xml']],
]);
const noStore = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

// A single application per function instance keeps its SQL transactions serialized.
// Sessions, device proofs and rate limits are persisted in PostgreSQL.
export function createKiteHandler({ start = () => startServer({ listen: false }),
  assetRoot = resolve(process.cwd(), 'vendor/kite/www'),
  clientAddress = () => 'unavailable', onError = () => console.error('Kite initialization failed') } = {}) {
  let application;
  async function getApplication() {
    if (!application) application = Promise.resolve().then(start).catch(error => {
      application = undefined; // A corrected environment or transient database outage can recover.
      throw error;
    });
    return application;
  }
  return async function handle(request) {
    const url = new URL(request.url);
    try {
      const asset = assets.get(url.pathname);
      if (asset && request.method === 'GET') {
        let content = await readFile(resolve(assetRoot, asset[0]));
        if (asset[0] === 'index.html') {
          // Next canonicalizes /kite/ to /kite. Resolve assets under the portal in both cases.
          content = Buffer.from(content.toString().replace('<head>', '<head><base href="/kite/">'));
        }
        const recoveryHeaders = asset[0].startsWith('reset-helper') ? {
          'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
          'Referrer-Policy': 'no-referrer',
        } : {};
        return new Response(content, { headers: { ...noStore, ...recoveryHeaders, 'Content-Type': asset[1] } });
      }
      const app = await getApplication();
      const incoming = request.body ? Readable.fromWeb(request.body) : Readable.from([]);
      incoming.url = url.pathname + url.search;
      incoming.method = request.method;
      incoming.headers = Object.fromEntries(request.headers);
      incoming.socket = { remoteAddress: clientAddress(request) };
      let status = 200, headers = {}, chunks = [];
      await app.handler(incoming, {
        writeHead(code, values) { status = code; headers = values; },
        end(value) { if (value !== undefined) chunks.push(Buffer.from(value)); },
      });
      return new Response([204, 304].includes(status) ? null : Buffer.concat(chunks), { status, headers });
    } catch {
      onError(); // Do not expose database URLs, credentials or provider errors.
      return Response.json({ error: 'Kite is temporarily unavailable. Please try again.' },
        { status: 503, headers: noStore });
    }
  };
}

export const handleKiteRequest = createKiteHandler({
  // Vercel overwrites this header. Never trust a client-supplied forwarded IP locally.
  clientAddress: request => process.env.VERCEL === '1'
    ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() || 'unavailable'
    : 'local',
});

