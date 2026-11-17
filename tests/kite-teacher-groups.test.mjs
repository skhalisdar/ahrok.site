import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {startServer} from '../vendor/kite/server.mjs';
import {createKiteHandler} from '../lib/kite-http.mjs';

test('administrators assign one or multiple groups without changing other teachers',async()=>{
 const db=new DatabaseSync(':memory:');db.dialect='sqlite';
 const origin='https://ahrok.site',password='Test-password-579!';
 const app=await startServer({database:db,listen:false,env:{DESK_ADMIN_ID:'admin',DESK_ADMIN_PASSWORD:password,KITE_ADMIN_ORIGIN:origin,KITE_INSTITUTION_ID:'nycmc-compass'}});
 const handle=createKiteHandler({start:()=>app});let cookie='';
 const api=(path,payload,site=origin)=>handle(new Request(origin+'/kite/api/admin/'+path,{method:payload?'POST':'GET',headers:{origin:site,cookie,'Content-Type':'application/json'},body:payload?JSON.stringify(payload):undefined}));
 const ok=async response=>{assert.equal(response.status,200,await response.clone().text());return response.json();};
 try{
  assert.equal((await api('teacher-groups',{teacher:'teacher',groups:[]})).status,401);
  const login=await api('login',{id:'admin',password});await ok(login);cookie=login.headers.get('set-cookie').split(';')[0];
  for(const name of ['Al-Ihsan (K-1)','Al-Ansar (2-3)'])await ok(await api('groups',{name}));
  for(const id of ['teacher','another'])await ok(await api('teachers',{id,password}));
  const groups=db.prepare('SELECT id FROM student_groups ORDER BY id').all().map(g=>g.id);
  const assignments=id=>db.prepare('SELECT group_id FROM teacher_group_assignments WHERE teacher_id=? ORDER BY group_id').all(id).map(a=>a.group_id);
  await ok(await api('teacher-groups',{teacher:'another',groups:[groups[0]]}));
  await ok(await api('teacher-groups',{teacher:'teacher',groups:[...groups,groups[0]]}));assert.deepEqual(assignments('teacher'),groups);
  await ok(await api('teacher-groups',{teacher:'teacher',groups:[groups[1]]}));assert.deepEqual(assignments('teacher'),[groups[1]]);
  assert.equal((await api('teacher-groups',{teacher:'teacher',groups:[groups[0],99999]})).status,404);assert.deepEqual(assignments('teacher'),[groups[1]]);
  assert.equal((await api('teacher-groups',{teacher:'teacher',groups:['1']})).status,400);
  assert.equal((await api('teacher-groups',{teacher:'admin',groups})).status,404);
  assert.equal((await api('teacher-groups',{teacher:'teacher',groups},'https://evil.example')).status,403);
  await ok(await api('teacher-groups',{teacher:'teacher',groups:[]}));assert.deepEqual(assignments('teacher'),[]);assert.deepEqual(assignments('another'),[groups[0]]);
  await ok(await api('teacher-access',{id:'teacher',action:'disable'}));assert.equal((await api('teacher-groups',{teacher:'teacher',groups})).status,404);
 }finally{await app.close();}
});
