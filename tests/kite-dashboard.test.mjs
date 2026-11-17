import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeDesk,weekDays,dashboardPanel} from '../vendor/kite/www/program-panels.mjs';
import {mountShell} from '../vendor/kite/www/shell.mjs';
const empty=()=>({students:[],groups:[],staff:[],pickups:[],incidents:[],today:'2026-11-17'});
const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
test('summary uses active students, latest shifts, non-voided pickups and unresolved incidents',()=>{
 const data=empty();data.students=[{id:1,active:1,attendance:'Present',homework:'Complete'},{id:2,active:1,attendance:'Tardy',homework:'Needs Help'},{id:3,active:1,attendance:'Absent',homework:'No Homework'},{id:4,active:1,attendance:'Unmarked',homework:'Unmarked'},{id:5,active:0,attendance:'Present',homework:'Complete'}];
 data.staff=[{teacher:'one',signed_in:0},{teacher:'two',signed_in:1},{teacher:'one',signed_in:1}];data.pickups=[{student:1,voided_at:null},{student:2,voided_at:'2026-11-17'}];data.incidents=[{resolved_at:null},{resolved_at:'2026-11-17'}];
 const result=summarizeDesk(data);assert.deepEqual({total:result.total,present:result.present,tardy:result.tardy,absent:result.absent,complete:result.complete,rate:result.attendanceRate,homework:result.homeworkRate,onShift:result.onShift,completed:result.completedShifts,pending:result.pending,incidents:result.openIncidents},{total:4,present:1,tardy:1,absent:1,complete:1,rate:25,homework:25,onShift:1,completed:1,pending:1,incidents:1});
});
test('unmarked and empty days remain distinct from recorded zero attendance',()=>{
 const noStudents=summarizeDesk(empty());assert.equal(noStudents.attendanceRate,null);assert.equal(noStudents.homeworkRate,null);
 const data=empty();data.students=[{id:1,active:1,attendance:'Unmarked',homework:'Unmarked'}];assert.equal(summarizeDesk(data).hasAttendance,false);assert.equal(summarizeDesk(data).hasHomework,false);
 data.students[0].attendance='Absent';assert.equal(summarizeDesk(data).hasAttendance,true);assert.equal(summarizeDesk(data).attendanceRate,0);
});
test('seven date keys are stable across month and daylight-saving boundaries',()=>{
 assert.deepEqual(weekDays('2026-03-02'),['2026-02-24','2026-02-25','2026-02-26','2026-02-27','2026-02-28','2026-03-01','2026-03-02']);assert.equal(weekDays('2026-11-03')[0],'2026-10-28');
});
test('dashboard does not draw fabricated history and escapes custom group labels',()=>{
 const data=empty();data.groups=[{id:1,name:'<script>Group</script>'}];data.students=[{id:1,active:1,group_id:1,attendance:'Unmarked',homework:'Unmarked'}];
 const html=dashboardPanel({data,day:data.today,history:[],historyStatus:'ready',schedule:null,e,heading:(title,description,actions)=>`<h2>${title}</h2>${actions}`});
 assert.match(html,/A little history goes a long way/);assert.ok(!html.includes('class="weekly-trend"'));assert.ok(!html.includes('<script>'));assert.match(html,/&lt;script&gt;/);
 const loading=dashboardPanel({data,day:data.today,history:[],historyStatus:'loading',schedule:null,e,heading:()=>''});assert.match(loading,/Loading seven-day history/);
});
test('Dashboard is first for administrators and unavailable in teacher navigation',()=>{
 const root={dataset:{},innerHTML:'',onclick:null};mountShell(root,{mode:'admin',active:'dashboard',onNavigate(){}});assert.ok(root.innerHTML.indexOf('data-tab="dashboard"')<root.innerHTML.indexOf('data-tab="roster"'));assert.match(root.innerHTML,/data-tab="dashboard"[\s\S]*?aria-current="page"/);
 mountShell(root,{mode:'teacher',active:'roster',onNavigate(){}});assert.ok(!root.innerHTML.includes('data-tab="dashboard"'));assert.ok(!root.innerHTML.includes('data-tab="admin"'));assert.ok(root.innerHTML.includes('data-tab="roster"'));
});
