import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createKiteHandler } from '../lib/kite-http.mjs';
import { startServer } from '../vendor/kite/server.mjs';

const origin='https://ahrok.site';

test('consolidated Kite portal serves messaging module without initializing the database', async () => {
  const handle=createKiteHandler({start(){throw Error('should not connect for static assets');}});
  for(const path of ['/kite','/kite/app.js','/kite/messages.mjs','/kite/kite.svg']) {
    const res=await handle(new Request(origin+path));
    assert.equal(res.status,200,path);
  }
  const js=await (await handle(new Request(origin+'/kite/messages.mjs'))).text();
  assert.match(js,/messagesPanel/);
});

test('consolidated admin API supports group messages without weakening permissions',async t=>{
  const db=new DatabaseSync(':memory:');db.dialect='sqlite';
  const app=await startServer({database:db,listen:false,env:{
    DESK_ADMIN_ID:'admin',DESK_ADMIN_PASSWORD:'Test-Kite-only-579!',
    KITE_ADMIN_ORIGIN:origin,KITE_INSTITUTION_ID:'nycmc-compass'
  }});
  t.after(()=>app.close());
  const handle=createKiteHandler({start:()=>app});
  let cookie='';
  const request=(path,data)=>handle(new Request(origin+'/kite/api/admin/'+path,{
    method:data===undefined?'GET':'POST',
    headers:{origin,'content-type':'application/json',cookie},
    body:data===undefined?undefined:JSON.stringify(data)
  }));
  const login=await request('login',{id:'admin',password:'Test-Kite-only-579!'});
  assert.equal(login.status,200,await login.clone().text());
  cookie=login.headers.get('set-cookie')?.split(';')[0]??'';
  assert.ok(cookie);
  const created=await request('groups',{name:'Kite QA Group'});
  assert.equal(created.status,200,await created.clone().text());
  const desk=await (await request('desk?day=2026-11-20')).json();
  const group=desk.groups.find(g=>g.name==='Kite QA Group');
  assert.ok(group);
  const sent=await request('group-message',{group:group.id,body:'Synthetic Kite QA message'});
  assert.equal(sent.status,200,await sent.clone().text());
  const result=await request('messages?group='+group.id);
  assert.equal(result.status,200,await result.clone().text());
  const list=await result.json();
  assert.equal(list.messages[0].body,'Synthetic Kite QA message');
  assert.equal((await request('messages?group=999999')).status,404);
});
