import test from 'node:test';
import assert from 'node:assert/strict';
import {teacherShiftPanel} from '../vendor/kite/www/program-panels.mjs';
import {mountShell} from '../vendor/kite/www/shell.mjs';
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const options={role:'teacher',id:'teacher',day:'2026-11-17',today:'2026-11-17',events:[],e};
test('teacher shift action follows latest own event and does not confuse app logout with shift sign-out',()=>{
 let html=teacherShiftPanel(options);assert.match(html,/Off shift/);assert.match(html,/data-action="shift" data-in="1"/);assert.match(html,/Sign In to Shift/);assert.match(html,/Logging out of the app does not end your shift/);
 html=teacherShiftPanel({...options,events:[{teacher:'other',signed_in:0,at:'2026-11-17T21:00:00Z'},{teacher:'teacher',signed_in:1,at:'2026-11-17T20:00:00Z'},{teacher:'teacher',signed_in:0,at:'2026-11-17T19:00:00Z'}]});assert.match(html,/On shift/);assert.match(html,/data-in="0"/);assert.match(html,/Sign Out of Shift/);assert.match(html,/3:00 PM ET/);
 html=teacherShiftPanel({...options,events:[{teacher:'teacher',signed_in:0,at:'2026-11-17T21:00:00Z'}]});assert.match(html,/Off shift/);assert.match(html,/Sign In to Shift/);
});
test('historical shift view prevents writes and offers today; admins have no teacher shift controls',()=>{
 const html=teacherShiftPanel({...options,day:'2026-11-16'});assert.match(html,/data-shift-today/);assert.match(html,/data-in="1" disabled/);assert.equal(teacherShiftPanel({...options,role:'admin'}),'');
});
test('teacher navigation names My Shift without changing staff tab hooks or granting admin modules',()=>{
 const root={dataset:{}};mountShell(root,{mode:'teacher',active:'staff',onNavigate(){}});assert.match(root.innerHTML,/data-tab="staff"[\s\S]*?My Shift/);assert.doesNotMatch(root.innerHTML,/data-tab="(?:dashboard|admin|reports)"/);
});
