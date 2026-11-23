import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const config=readFileSync(new URL('../next.config.ts',import.meta.url),'utf8');
const vercel=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
test('subdomain cutover is disabled until deliberately enabled',()=>{
  assert.match(config,/AHROK_SUBDOMAIN_CUTOVER !== 'enabled'/);
  assert.match(config,/permanent: false/);
  assert.equal(vercel.git.deploymentEnabled['isolation-subdomains-20261123'],false);
});
test('only old application landing pages redirect to dedicated origins',()=>{
  for(const [source,destination] of [
    ['/kite','https://kite.ahrok.site/kite/'],
    ['/nycmccompass','https://compass.ahrok.site/nycmccompass'],
  ]) {
    assert.ok(config.includes("source: '"+source+"'"),source);
    assert.ok(config.includes("destination: '"+destination+"'"),destination);
  }
});
