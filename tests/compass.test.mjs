import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {createCompassHandler} from '../vendor/compass/server.mjs';
function fixture(identity='nycmc-compass'){
 const database=new DatabaseSync(':memory:');database.dialect='sqlite';
 database.exec(`CREATE TABLE deployment_identity(id INTEGER,institution_id TEXT); CREATE TABLE users(id TEXT,role TEXT,active INTEGER); CREATE TABLE sessions(token TEXT,user_id TEXT,expires INTEGER,audience TEXT,role TEXT,institution_id TEXT);`);
 database.prepare('INSERT INTO deployment_identity VALUES (1,?)').run(identity);
 const raw='a'.repeat(64),digest=createHash('sha256').update(raw).digest('hex');
 database.prepare('INSERT INTO users VALUES (?,?,1)').run('admin','admin');
 database.prepare('INSERT INTO sessions VALUES (?,?,?,?,?,?)').run(digest,'admin',Date.now()+3600000,'admin-web','admin',identity);
 const handler=createCompassHandler({database,onError:()=>{}});
 const call=(path,body,cookie='',origin='https://ahrok.site')=>handler(new Request('https://ahrok.site/nycmccompass/api/'+path,{method:body===undefined?'GET':'POST',headers:{origin,cookie,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)}));
 return {database,call,admin:'__Host-kite-admin='+raw};
}
test('student isolation, instructor-only mutations, persistence and revocation',async()=>{
 const {call,admin,database}=fixture();
 assert.equal((await call('state')).status,401);
 assert.equal((await call('create',{name:'Test A.',grade:6},admin,'https://evil.test')).status,403);
 const a=await (await call('create',{name:'Test A.',grade:6},admin)).json();
 await call('create',{name:'Test B.',grade:8},admin);
 const login=await call('login',{id:a.id,code:a.code});assert.equal(login.status,200);
 const student=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/);
 let data=await (await call('state',undefined,student)).json();assert.equal(data.students.length,1);assert.equal(data.students[0].note,undefined);assert.equal(data.students[0].pin,undefined);
 assert.equal((await call('create',{name:'Forbidden',grade:6},student)).status,403);
 await call('update',{id:a.id,action:'notes',feedback:'Well done',note:'Private'},admin);
 await call('student',{action:'help',value:true,id:'other'},student);
 data=await (await call('state',undefined,student)).json();assert.equal(data.students[0].help,true);assert.equal(data.students[0].feedback,'Well done');assert.equal(data.students[0].note,undefined);
 assert.equal((await call('student',{action:'project',session:1,title:'Bad',reflection:'Test',url:'javascript:alert(1)'},student)).status,400);
 assert.equal((await call('student',{action:'project',session:1,title:'Good',reflection:'Tested it',url:'https://scratch.mit.edu/projects/123'},student)).status,200);
 assert.equal((await call('update',{id:a.id,action:'attendance',date:'2026-11-23',value:'Present'},admin)).status,200);
 assert.equal((await call('update',{id:a.id,action:'attendance',date:'2026-12-28',value:'Present'},admin)).status,400);
 await call('reset',{id:a.id},admin);assert.equal((await call('state',undefined,student)).status,401);
 database.close();
});
test('rate limits and wrong institution fail closed',async()=>{
 const {call,admin,database}=fixture();const a=await (await call('create',{name:'Test',grade:7},admin)).json();
 for(let i=0;i<5;i++)assert.equal((await call('login',{id:a.id,code:'0000'})).status,401);
 assert.equal((await call('login',{id:a.id,code:a.code})).status,429);database.close();
 const other=fixture('unrelated');assert.equal((await other.call('state',undefined,other.admin)).status,503);other.database.close();
});
test('roster import validates atomically and skips duplicates',async()=>{
 const {call,admin,database}=fixture();assert.equal((await call('import',{students:[{name:'Test',grade:6},{name:'Bad',grade:2}]},admin)).status,400);
 assert.equal((await (await call('state',undefined,admin)).json()).students.length,0);
 let r=await (await call('import',{students:[{name:'Test',grade:6}]},admin)).json();assert.equal(r.created.length,1);
 r=await (await call('import',{students:[{name:'Test',grade:6}]},admin)).json();assert.equal(r.created.length,0);database.close();
});
test('PostgreSQL startup checks existing tables without running DDL',async()=>{
 const seen=[];
 const database={dialect:'postgres',exec(){throw Error('Runtime must not run DDL')},prepare(sql){seen.push(sql);return {get:async()=>sql.includes('deployment_identity')?{institution_id:'nycmc-compass'}:sql.includes('JOIN sessions')?{id:'admin'}:undefined,all:async()=>[]};}};
 const handler=createCompassHandler({database,onError:()=>{}});
 const response=await handler(new Request('https://ahrok.site/nycmccompass/api/state',{headers:{cookie:'__Host-kite-admin='+'a'.repeat(64)}}));
 assert.equal(response.status,200);
 for(const table of ['compass_students','compass_sessions','compass_throttle'])assert.ok(seen.includes(`SELECT 1 FROM ${table} LIMIT 0`));
});
