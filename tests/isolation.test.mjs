import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),read=p=>readFileSync(resolve(root,p),'utf8');
test('root website has no executable Kite or COMPASS backend code',()=>{
 for(const p of ['vendor/kite','vendor/compass','apps/compass','lib/kite-http.mjs','scripts/prepare-kite.mjs','app/kite/[[...path]]/route.ts','app/nycmccompass/[[...path]]/route.ts','app/api/mobile/[...path]/route.ts']) assert.equal(existsSync(resolve(root,p)),false,p);
});
test('root retains only root-specific runtime dependencies and never bundles application backends',()=>{
 const pkg=JSON.parse(read('package.json'));
 for(const p of ['pg','node-app-attest','google-auth-library','cbor','pdfkit'])assert.equal(pkg.dependencies[p],undefined,p);
 assert.equal(pkg.scripts['test:kite'],undefined);
 const next=read('next.config.ts');
 assert.doesNotMatch(next,/serverExternalPackages|outputFileTracingIncludes/);
 assert.doesNotMatch(next,/nycmc-compass\.vercel\.app/);
});
test('only /kite is reverse-proxied to the separate Kite Vercel project',()=>{
 const next=read('next.config.ts');
 assert.match(next,/async rewrites\(\)/);
 assert.match(next,/beforeFiles/);
 assert.ok(next.includes("source: '/kite', destination: 'https://kite-five-wine.vercel.app/kite/'"));
 assert.ok(next.includes("source: '/kite/:path*', destination: 'https://kite-five-wine.vercel.app/kite/:path*'"));
 assert.doesNotMatch(next,/source:\s*'\/kite'\s*,\s*destination:\s*'https:\/\/kite\.ahrok\.site/);
 assert.doesNotMatch(next,/source:\s*'\/nycmccompass\/:path\*'/);
});
test('COMPASS still redirects to its own hostname',()=>{
 const next=read('next.config.ts');
 assert.match(next,/AHROK_SUBDOMAIN_CUTOVER !== 'enabled'/);
 assert.ok(next.includes("source: '/nycmccompass', destination: 'https://compass.ahrok.site/nycmccompass'"));
});
test('CI will block nonisolated root source from being deployed',()=>{
 const wf=read('.github/workflows/subdomain-isolation.yml');
 assert.match(wf,/node scripts\/isolation-gate\.mjs --enforce/);
 assert.match(wf,/pnpm test:isolation/);
});

test('root environment template contains no child-app credentials',()=>{
 const env=read('.env.example');
 assert.match(env,/AHROK_SUBDOMAIN_CUTOVER=disabled/);
 assert.match(env,/^RESEND_API_KEY=/m);
 assert.doesNotMatch(env,/^(?:KITE_|COMPASS_|DESK_|PGHOST|PGUSER|PGPASSWORD|DATABASE_URL)/m);
});
