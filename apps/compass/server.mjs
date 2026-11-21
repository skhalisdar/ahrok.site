import {randomBytes,randomInt,createHash,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {openDatabase} from './database.mjs';
const scrypt=promisify(scryptCallback), BASE='/nycmccompass', COOKIE='__Host-compass-student', INSTRUCTOR_COOKIE='__Host-compass-instructor';
const hash=x=>createHash('sha256').update(x).digest('hex');
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export const schema=`
CREATE TABLE IF NOT EXISTS compass_instructors (id TEXT PRIMARY KEY, password TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS compass_instructor_sessions (token TEXT PRIMARY KEY, instructor_id TEXT NOT NULL REFERENCES compass_instructors(id), expires BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS compass_students (id TEXT PRIMARY KEY, nickname TEXT NOT NULL, grade INTEGER NOT NULL CHECK(grade BETWEEN 6 AND 8), pin TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS compass_sessions (token TEXT PRIMARY KEY, student_id TEXT NOT NULL REFERENCES compass_students(id), expires BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS compass_throttle (bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires BIGINT NOT NULL);
`;
const cookie=(v,age=28800)=>`${COOKIE}=${v}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`;
const token=(request,name)=>request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);
export const emptyState=()=>({progress:Array(6).fill('Not Started'),attendance:{},checks:{},help:false,projects:[],feedback:'',note:''});
export function projectURL(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
async function pinHash(pin){const salt=randomBytes(16).toString('hex');return salt+':'+Buffer.from(await scrypt(pin,salt,32)).toString('hex');}
async function verifyPin(pin,stored){const [salt,expected]=stored.split(':');const actual=await scrypt(pin,salt,32);return expected.length===64&&timingSafeEqual(Buffer.from(expected,'hex'),actual);}
const text=(v,max)=>{if(typeof v!=='string'||v.length>max)fail(400,'Invalid text.');return v.trim();};
export function createCompassHandler({database,env=process.env,assetRoot=fileURLToPath(new URL('./www/',import.meta.url)),now=Date.now,onError=()=>console.error('COMPASS request failed')}={}){
 let opened,queue=Promise.resolve();
 const serial=fn=>{const next=queue.then(fn,fn);queue=next.catch(()=>{});return next;};
 async function db(){if(!opened)opened=(async()=>{const connection=database||await openDatabase(env);const identity=await connection.prepare('SELECT institution_id FROM compass_deployment_identity WHERE id=1').get();if(identity?.institution_id!=='nycmc-compass-independent')throw Error('Wrong institution database');if(connection.dialect==='postgres'){
 // PostgreSQL uses a dedicated DML-only runtime role. Schema changes run
 // separately as the database owner; never grant the runtime CREATE access.
 for(const table of ['compass_students','compass_sessions','compass_throttle','compass_instructors','compass_instructor_sessions']){
  await connection.prepare(`SELECT 1 FROM ${table} LIMIT 0`).all();
 }
 }else await connection.exec(schema);return connection;})().catch(e=>{opened=undefined;throw e});return opened;}
 const origin=env.COMPASS_ORIGIN||'https://ahrok.site';
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
 let calendar;
 async function dates(){if(!calendar){const code=await readFile(resolve(assetRoot,'curriculum.js'),'utf8');const matches=[...code.matchAll(/"date":\s*"([0-9-]+)"/g)];calendar=new Set(matches.map(m=>m[1]));if(calendar.size!==49)throw Error('Invalid curriculum');}return calendar;}
 const statement=async(sql)=> (await db()).prepare(sql);
 async function one(sql,...args){return (await statement(sql)).get(...args);}
 async function all(sql,...args){return (await statement(sql)).all(...args);}
 async function run(sql,...args){return (await statement(sql)).run(...args);}
 async function limit(key,max){const bucket=hash(key);const stamp=now();const row=await one(`INSERT INTO compass_throttle(bucket,attempts,expires) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=CASE WHEN compass_throttle.expires<=? THEN 1 ELSE compass_throttle.attempts+1 END, expires=CASE WHEN compass_throttle.expires<=? THEN excluded.expires ELSE compass_throttle.expires END RETURNING attempts`,bucket,stamp+15*60_000,stamp,stamp);if(row.attempts>max)fail(429,'Too many attempts. Try again in 15 minutes.');}
 async function account(request){const st=token(request,COOKIE);if(st&&/^[a-f0-9]{64}$/.test(st)){const s=await one('SELECT s.* FROM compass_students s JOIN compass_sessions t ON t.student_id=s.id WHERE t.token=? AND t.expires>? AND s.active=1',hash(st),now());if(s)return {role:'student',student:s};}
 const admin=token(request,INSTRUCTOR_COOKIE);if(admin&&/^[a-f0-9]{64}$/.test(admin)){const a=await one("SELECT u.id FROM compass_instructors u JOIN compass_instructor_sessions s ON s.instructor_id=u.id WHERE s.token=? AND s.expires>? AND u.active=1",hash(admin),now());if(a)return {role:'teacher',id:a.id};}fail(401,'Please sign in.');}
 function view(s,teacher){const state=JSON.parse(s.state);if(!teacher)delete state.note;return {id:s.id,name:s.nickname,grade:s.grade,active:Boolean(s.active),...state};}
 async function data(user){return {role:user.role,students:user.role==='teacher'?(await all('SELECT * FROM compass_students ORDER BY nickname')).map(s=>view(s,true)):[view(user.student,false)]};}
 async function input(request){if(Number(request.headers.get('content-length')||0)>65536)fail(413,'Request too large.');const reader=request.body?.getReader();if(!reader)return {};const chunks=[];let total=0;for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>65536){await reader.cancel();fail(413,'Request too large.');}chunks.push(Buffer.from(value));}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{fail(400,'Invalid JSON.');}}
 async function update(id,change){const connection=await db();await connection.exec(connection.dialect==='postgres'?'BEGIN':'BEGIN IMMEDIATE');try{const row=await one('SELECT * FROM compass_students WHERE id=?'+(connection.dialect==='postgres'?' FOR UPDATE':''),id);if(!row)fail(404,'Student not found.');const state=JSON.parse(row.state);await change(state,row);await run('UPDATE compass_students SET state=? WHERE id=?',JSON.stringify(state),id);await connection.exec('COMMIT');return row;}catch(e){await connection.exec('ROLLBACK');throw e;}}
 async function createStudent(raw){const nickname=text(raw.name,40);if(!nickname||![6,7,8].includes(Number(raw.grade)))fail(400,'Use a nickname and grade 6, 7, or 8.');const id='c'+randomBytes(5).toString('hex'),pin=String(randomInt(1000,10000));await run('INSERT INTO compass_students(id,nickname,grade,pin,state) VALUES (?,?,?,?,?)',id,nickname,Number(raw.grade),await pinHash(pin),JSON.stringify(emptyState()));return {id,name:nickname,grade:Number(raw.grade),code:pin};}
 async function api(request,path){const method=request.method;const body=method==='POST'?await input(request):{};
 if(path==='/api/instructor/login'&&method==='POST'){
 const id=typeof body.id==='string'?body.id.trim():'',password=typeof body.password==='string'?body.password:'';
 if(!id||id.length>100||!password||password.length>256)fail(401,'Invalid instructor ID or password.');
 const ip=env.VERCEL==='1'?request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()||'unknown':'local';
 await limit('instructor-ip:'+ip,30);await limit('instructor:'+id,5);
 const instructor=await one('SELECT * FROM compass_instructors WHERE id=? AND active=1',id);
 const valid=await verifyPin(password,instructor?.password||'00000000000000000000000000000000:'+ '0'.repeat(64));
 if(!instructor||!valid)fail(401,'Invalid instructor ID or password.');
 const value=randomBytes(32).toString('hex');
 await run('DELETE FROM compass_instructor_sessions WHERE expires<=?',now());
 await run('INSERT INTO compass_instructor_sessions(token,instructor_id,expires) VALUES (?,?,?)',hash(value),instructor.id,now()+8*60*60_000);
 return Response.json({ok:true},{headers:{...headers,'Set-Cookie':cookie(value).replace(COOKIE,INSTRUCTOR_COOKIE)}});
 }
 if(path==='/api/instructor/logout'&&method==='POST'){
 const value=token(request,INSTRUCTOR_COOKIE);if(value&&/^[a-f0-9]{64}$/.test(value))await run('DELETE FROM compass_instructor_sessions WHERE token=?',hash(value));
 return Response.json({ok:true},{headers:{...headers,'Set-Cookie':cookie('',0).replace(COOKIE,INSTRUCTOR_COOKIE)}});
 }
 if(path==='/api/login'&&method==='POST'){const id=typeof body.id==='string'?body.id.trim().toLowerCase():'';const pin=typeof body.code==='string'?body.code:'';if(!/^c[a-f0-9]{10}$/.test(id)||!/^\d{4}$/.test(pin))fail(401,'Invalid student ID or code.');const ip=env.VERCEL==='1'?request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()||'unknown':'local';await limit('ip:'+ip,60);await limit('student:'+id,5);const s=await one('SELECT * FROM compass_students WHERE id=? AND active=1',id);if(!s||!await verifyPin(pin,s.pin))fail(401,'Invalid student ID or code.');const value=randomBytes(32).toString('hex');await run('DELETE FROM compass_sessions WHERE expires<=?',now());await run('DELETE FROM compass_throttle WHERE expires<=?',now());await run('INSERT INTO compass_sessions(token,student_id,expires) VALUES (?,?,?)',hash(value),id,now()+8*60*60_000);return Response.json(await data({role:'student',student:s}),{headers:{...headers,'Set-Cookie':cookie(value)}});}
 if(path==='/api/logout'&&method==='POST'){const value=token(request,COOKIE);if(value&&/^[a-f0-9]{64}$/.test(value))await run('DELETE FROM compass_sessions WHERE token=?',hash(value));return Response.json({ok:true},{headers:{...headers,'Set-Cookie':cookie('',0)}});}
 const user=await account(request);if(method==='GET'&&path==='/api/state')return Response.json(await data(user),{headers});
 if(method!=='POST')fail(404,'Not found.');
 if(path==='/api/student'){if(user.role!=='student')fail(403,'Student session required.');const id=user.student.id;await update(id,state=>{if(body.action==='help'){if(typeof body.value!=='boolean')fail(400,'Invalid help status.');state.help=body.value;}
 else if(body.action==='checks'){if(!Number.isInteger(body.session)||body.session<1||body.session>49||!Array.isArray(body.value)||body.value.length!==4||!body.value.every(v=>typeof v==='boolean'))fail(400,'Invalid checklist.');state.checks[body.session]=body.value;}
 else if(body.action==='project'){if(state.projects.length>=200)fail(400,'Project limit reached.');if(!Number.isInteger(body.session)||body.session<1||body.session>49)fail(400,'Invalid session.');const title=text(body.title,100),reflection=text(body.reflection,2000),url=projectURL(text(body.url,2000));if(!title||!reflection||!url)fail(400,'Add a title, safe link and reflection.');state.projects.push({id:randomBytes(12).toString('hex'),session:body.session,title,url,reflection,created:new Date(now()).toISOString(),status:'Submitted',feedback:''});}else fail(400,'Unknown student action.');});return Response.json({ok:true},{headers});}
 if(user.role!=='teacher')fail(403,'Instructor access required.');
 if(path==='/api/create'){const item=await createStudent(body);return Response.json(item,{headers});}
 if(path==='/api/import'){if(!Array.isArray(body.students)||!body.students.length||body.students.length>100)fail(400,'Import 1–100 students.');for(const s of body.students){if(!s||!text(s.name,40)||![6,7,8].includes(Number(s.grade)))fail(400,'Invalid roster row.');}const connection=await db(),created=[];await connection.exec(connection.dialect==='postgres'?'BEGIN':'BEGIN IMMEDIATE');try{for(const s of body.students){const existing=await one('SELECT id FROM compass_students WHERE nickname=? AND grade=?',s.name.trim(),Number(s.grade));if(!existing)created.push(await createStudent(s));}await connection.exec('COMMIT');}catch(e){await connection.exec('ROLLBACK');throw e;}return Response.json({created},{headers});}
 if(path==='/api/reset'){const s=await one('SELECT id,nickname FROM compass_students WHERE id=?',text(body.id,40));if(!s)fail(404,'Student not found.');const code=String(randomInt(1000,10000));await run('UPDATE compass_students SET pin=? WHERE id=?',await pinHash(code),s.id);await run('DELETE FROM compass_sessions WHERE student_id=?',s.id);return Response.json({id:s.id,name:s.nickname,code},{headers});}
 if(path==='/api/update'){const id=text(body.id,40);if(body.action==='active'){if(typeof body.value!=='boolean')fail(400,'Invalid status.');await run('UPDATE compass_students SET active=? WHERE id=?',body.value?1:0,id);await run('DELETE FROM compass_sessions WHERE student_id=?',id);return Response.json({ok:true},{headers});}
 await update(id,async state=>{if(body.action==='progress'){if(!Number.isInteger(body.module)||body.module<0||body.module>5||!['Not Started','In Progress','Completed'].includes(body.value))fail(400,'Invalid progress.');state.progress[body.module]=body.value;}
 else if(body.action==='attendance'){if(!(await dates()).has(body.date)||!['Unmarked','Present','Absent','Tardy','Excused'].includes(body.value))fail(400,'Invalid attendance.');state.attendance[body.date]=body.value;}
 else if(body.action==='notes'){state.feedback=text(body.feedback,2000);state.note=text(body.note,2000);}
 else if(body.action==='help'){state.help=false;}
 else if(body.action==='review'){const p=state.projects.find(p=>p.id===body.project);if(!p||!['Submitted','Needs Revision','Complete'].includes(body.status))fail(400,'Invalid review.');p.status=body.status;p.feedback=text(body.feedback,2000);}
 else fail(400,'Unknown instructor action.');});return Response.json({ok:true},{headers});}
 fail(404,'Not found.');}
 return async request=>{const path=new URL(request.url).pathname.slice(BASE.length).replace(/\/$/,'');try{if(!new URL(request.url).pathname.startsWith(BASE+'/')&&new URL(request.url).pathname!==BASE)fail(404,'Not found.');const files={'':'index.html','/app.js':'app.js','/style.css':'style.css','/curriculum.js':'curriculum.js'};if(request.method==='GET'&&Object.hasOwn(files,path)){const name=files[path],body=await readFile(resolve(assetRoot,name));return new Response(body,{headers:{...headers,'Content-Type':name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"}});}if(!['GET','POST'].includes(request.method))fail(405,'Method not allowed.');if(request.method==='POST'&&request.headers.get('origin')!==origin)fail(403,'Origin not allowed.');return await serial(()=>api(request,path));}catch(e){if(!e.status)onError();return Response.json({error:e.status?e.message:'Learning portal unavailable. Please contact your instructor.'},{status:e.status||503,headers});}};
}
export const handleCompassRequest=createCompassHandler();
