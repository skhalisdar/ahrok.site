import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {DatabaseSync} from 'node:sqlite';

// Only this isolated test process substitutes physical-device attestation.
// Password verification, session binding and route authorization remain real.
const proofURL=new URL('../vendor/kite/mobile-proof.mjs',import.meta.url).href;
registerHooks({load(url,context,next){
 if(url!==proofURL)return next(url,context);
 return {format:'module',shortCircuit:true,source:`import {createHash} from 'node:crypto';
 export const sha256=value=>createHash('sha256').update(value).digest('hex');
 export const createMobileProof=()=>({verifyLoginAndConsume:async req=>req.headers['x-test-device-proof']==='valid'?'test-device':null,verifyRequestAndConsume:async req=>req.headers['x-test-device-proof']==='valid'});`};
}});
const {startServer}=await import('../vendor/kite/server.mjs');
const {createKiteHandler}=await import('../lib/kite-http.mjs');

test('teacher mobile sessions can read and modify only currently assigned groups',async()=>{
 const db=new DatabaseSync(':memory:');db.dialect='sqlite';
 const origin='https://ahrok.site',password='Test-password-579!';
 const app=await startServer({database:db,listen:false,env:{DESK_ADMIN_ID:'admin',DESK_ADMIN_PASSWORD:password,KITE_ADMIN_ORIGIN:origin,KITE_INSTITUTION_ID:'nycmc-compass'}});
 const handle=createKiteHandler({start:()=>app});let token='';
 const api=(path,payload,proof=true)=>handle(new Request(origin+'/api/mobile/'+path,{method:payload?'POST':'GET',headers:{'Content-Type':'application/json',authorization:'Bearer '+token,...(proof?{'x-test-device-proof':'valid'}:{})},body:payload?JSON.stringify(payload):undefined}));
 const ok=async response=>{assert.equal(response.status,200,await response.clone().text());return response.json();};
 try{
  db.exec("INSERT INTO users(id,role,password) SELECT 'teacher','teacher',password FROM users WHERE id='admin'; INSERT INTO student_groups VALUES(1,'First group','first'),(2,'Second group','second'); INSERT INTO students(id,name,grade,track) VALUES(1,'First Student','1',''),(2,'Second Student','2',''),(3,'Unassigned Student','3',''); INSERT INTO student_group_memberships VALUES(1,1),(2,2); INSERT INTO teacher_group_assignments VALUES(1,'teacher'); INSERT INTO activities(id,name,name_key,teacher_id,all_groups) VALUES(1,'Coding','coding','teacher',1);");
  const login=await ok(await api('login',{id:'teacher',password}));token=login.token;const day=login.today;
  await ok(await api('shift',{day,signedIn:true}));
  await ok(await api('shift',{day,signedIn:true}));
  assert.equal(db.prepare('SELECT count(*) AS n FROM staff_log WHERE teacher=?').get('teacher').n,1,'repeated sign-in does not duplicate shifts');
  let shiftDesk=await ok(await api('desk?day='+day));assert.equal(shiftDesk.staff[0].signed_in,1);
  await ok(await api('shift',{day,signedIn:false}));shiftDesk=await ok(await api('desk?day='+day));assert.equal(shiftDesk.staff[0].signed_in,0);
  assert.equal((await api('shift',{day:'2000-01-01',signedIn:true})).status,400);
  assert.equal((await api('shift',{day,signedIn:true},false)).status,403);
  assert.equal((await api('desk?day='+day,undefined,false)).status,403);
  for(const student of [1,2]){
   db.prepare('INSERT INTO pickup_contacts(id,student,name,relationship,created_by,at) VALUES(?,?,?,?,?,?)').run('contact-'+student,student,'Guardian '+student,'Parent','admin',new Date().toISOString());
   db.prepare('INSERT INTO incidents(id,student,day,category,detail,action_taken,recorded_by,at) VALUES(?,?,?,?,?,?,?,?)').run('incident-'+student,student,day,'Other','Test detail','Test action','teacher',new Date().toISOString());
   db.prepare('INSERT INTO pickup_events(id,student,day,contact,contact_name,recorded_by,at) VALUES(?,?,?,?,?,?,?)').run('pickup-'+student,student,day,'contact-'+student,'Guardian '+student,'teacher',new Date().toISOString());
  }
  let desk=await ok(await api('desk?day='+day));
  assert.deepEqual(desk.students.map(s=>s.id),[1]);assert.deepEqual(desk.groups.map(g=>g.id),[1]);assert.deepEqual(desk.pickupContacts.map(c=>c.student),[1]);assert.deepEqual(desk.incidents.map(i=>i.student),[1]);assert.deepEqual(desk.activities[0].students.map(s=>s.id),[1]);
  assert.deepEqual(desk.pickups.map(p=>p.student),[1]);
  const schedule=await ok(await api('schedule?day='+day));assert.deepEqual(schedule.groups.map(g=>g.id),[1]);
  await ok(await api('record',{student:1,day,field:'attendance',value:'Present'}));
  await ok(await api('step',{student:1,delta:1}));
  await ok(await api('activity-record',{activity:1,student:1,field:'participation',day,value:'Participated'}));
  for(const [route,payload] of [
   ['record',{student:2,day,field:'attendance',value:'Present'}],
   ['record',{student:3,day,field:'homework',value:'Complete'}],
   ['step',{student:2,delta:1}],
   ['incident',{student:2,day,category:'Other',detail:'Test',actionTaken:'Test'}],
   ['pickup',{student:2,day,contact:'contact-2',note:'',identityChecked:true}],
   ['activity-record',{activity:1,student:2,field:'participation',day,value:'Participated'}],
   ['teacher-groups',{teacher:'teacher',groups:[1,2]}]
  ])assert.equal((await api(route,payload)).status,403,route);
  assert.equal(db.prepare('SELECT count(*) AS n FROM records WHERE student=2').get().n,0);
  db.prepare('INSERT INTO teacher_group_assignments VALUES(2,?)').run('teacher');
  desk=await ok(await api('desk?day='+day));assert.equal(desk.students.length,2);await ok(await api('record',{student:2,day,field:'attendance',value:'Present'}));
  db.prepare('DELETE FROM teacher_group_assignments WHERE teacher_id=?').run('teacher');
  desk=await ok(await api('desk?day='+day));assert.deepEqual(desk.students,[]);assert.deepEqual(desk.pickupContacts,[]);assert.deepEqual(desk.incidents,[]);assert.deepEqual(desk.activities[0].students,[]);
  assert.equal((await api('record',{student:1,day,field:'attendance',value:'Absent'})).status,403);
  token=(await ok(await api('login',{id:'admin',password}))).token;
  desk=await ok(await api('desk?day='+day));assert.equal(desk.students.length,3);assert.equal(desk.groups.length,2);assert.equal(desk.pickups.length,2);
 }finally{await app.close();}
});

