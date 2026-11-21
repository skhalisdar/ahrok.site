// Owner-only setup. JSON via stdin; never print passwords, codes or connection URLs.
import {randomBytes,scrypt as callback} from 'node:crypto';
import {promisify} from 'node:util';
import {openDatabase} from './database.mjs';
import {emptyState} from './server.mjs';
const scrypt=promisify(callback);
const encode=async value=>{const salt=randomBytes(16).toString('hex');return salt+':'+Buffer.from(await scrypt(value,salt,32)).toString('hex');};
let db;
try{
 let raw='';for await(const part of process.stdin){raw+=part;if(raw.length>100000)throw Error('Input too large');}
 const {instructor,students}=JSON.parse(raw);
 if(!instructor||typeof instructor.id!=='string'||!instructor.id.trim()||instructor.id.length>100||typeof instructor.password!=='string'||instructor.password.length<12||instructor.password.length>256)throw Error('Invalid instructor');
 if(!Array.isArray(students)||students.length>100)throw Error('Invalid roster');
 const ids=new Set();for(const s of students){if(!/^c[a-f0-9]{10}$/.test(s.id)||ids.has(s.id)||!/^\d{4}$/.test(s.code)||typeof s.name!=='string'||!s.name.trim()||s.name.length>40||![6,7,8].includes(Number(s.grade)))throw Error('Invalid roster');ids.add(s.id);}
 db=await openDatabase();
 const identity=await db.prepare('SELECT institution_id FROM compass_deployment_identity WHERE id=1').get();
 if(identity?.institution_id!=='nycmc-compass-independent')throw Error('Wrong database');
 await db.exec('BEGIN');
 try{
  await db.prepare('INSERT INTO compass_instructors(id,password) VALUES (?,?)').run(instructor.id.trim(),await encode(instructor.password));
  for(const s of students)await db.prepare('INSERT INTO compass_students(id,nickname,grade,pin,state) VALUES (?,?,?,?,?)').run(s.id,s.name.trim(),Number(s.grade),await encode(s.code),JSON.stringify(emptyState()));
  await db.exec('COMMIT');console.log(`Provisioned instructor and ${students.length} students.`);
 }catch(error){await db.exec('ROLLBACK');throw error;}
}catch{console.error('Provisioning failed; verify input and dedicated database setup. No credentials were printed.');process.exitCode=1;}
finally{await db?.close();}
