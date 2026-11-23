#!/usr/bin/env node
// Deliberately read-only. A passing functional test does not prove source isolation.
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const exists=path=>existsSync(resolve(root,path));
const read=path=>readFileSync(resolve(root,path),'utf8');
const blockers=[];

for(const [path,reason] of [
  ['vendor/kite','Kite application/server source is embedded in the root repository'],
  ['vendor/compass','COMPASS application/server source is embedded in the root repository'],
  ['apps/compass','a duplicate independently deployable COMPASS workspace is embedded in root'],
  ['lib/kite-http.mjs','the root repository can execute Kite backend code'],
  ['app/kite/[[...path]]/route.ts','the root deployment still owns a Kite executable route'],
  ['app/nycmccompass/[[...path]]/route.ts','the root deployment still owns a COMPASS executable route'],
  ['app/api/mobile/[...path]/route.ts','the root deployment still owns Kite native API routes'],
  ['scripts/prepare-kite.mjs','root builds still prepare embedded Kite application files'],
]) if(exists(path))blockers.push({kind:'source-ownership',path,reason});

if(exists('next.config.ts')) {
 const config=read('next.config.ts');
 for(const [value,reason] of [
  ["'./vendor/kite/","root tracing still packages Kite backend/asset files"],
  ["'./vendor/compass/","root tracing still packages COMPASS assets"],
  ["destination: 'https://nycmc-compass.vercel.app","root is proxying COMPASS instead of redirecting to a separate browser origin"],
 ]) if(config.includes(value))blockers.push({kind:'routing',path:'next.config.ts',reason});
}

if(exists('package.json')) {
 const pkg=JSON.parse(read('package.json'));
 for(const dep of ['pg','node-app-attest','google-auth-library','cbor','pdfkit'])
   if(pkg.dependencies?.[dep])blockers.push({
      kind:'bundling',path:'package.json',
      reason:`root still declares application-backend dependency ${dep}; verify it is unused before removal`
   });
}

const summary={
 architecture:'three-dedicated-browser-origins',
 repository:'skhalisdar/ahrok.site',
 mode:process.argv.includes('--enforce')?'ENFORCE':'REPORT',
 result:blockers.length?'BLOCKED':'CLEAR',
 blockers
};
process.stdout.write(JSON.stringify(summary,null,2)+'\n');
if(process.argv.includes('--enforce') && blockers.length)process.exitCode=2;
