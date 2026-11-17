import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createScheduleStore,scheduleSchema,starterWeek} from '../schedules.mjs';
test('production schedule requests never run schema DDL',async()=>{
 const db=new DatabaseSync(':memory:');
 db.exec("PRAGMA foreign_keys=ON; CREATE TABLE users(id TEXT PRIMARY KEY); CREATE TABLE student_groups(id INTEGER PRIMARY KEY,name TEXT,name_key TEXT); INSERT INTO users VALUES('admin'); INSERT INTO student_groups VALUES(1,'Al-Amin (6-8)','al-amin');");
 db.exec(scheduleSchema); db.dialect='postgres';
 const exec=db.exec.bind(db);db.exec=sql=>{assert.doesNotMatch(sql,/CREATE|ALTER|GRANT/i);return exec(sql.replace('BEGIN IMMEDIATE','BEGIN'));};
 try {
  const admin={id:'admin',role:'admin'},store=createScheduleStore(db);
  assert.equal((await store.read(admin,'2026-11-17')).groups[0].source,'draft');
  await store.save(admin,{group:1,scope:'weekly',expectedVersion:0,confirmed:true,week:starterWeek('Al-Amin (6-8)')});
  assert.equal((await store.read(admin,'2026-11-17')).groups[0].source,'weekly');
  assert.equal(db.prepare('SELECT count(*) AS n FROM program_schedule_history').get().n,1);
 }finally{db.close();}
});
