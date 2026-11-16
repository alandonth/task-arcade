import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../src/worker.js';
class D1 {constructor(){this.db=new DatabaseSync(':memory:');this.db.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));}prepare(sql){const db=this.db;let args=[];return {bind(...a){args=a;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return {meta:{changes:Number(db.prepare(sql).run(...args).changes)}};}};}async batch(items){this.db.exec('BEGIN');try{const result=[];for(const i of items)result.push(await i.run());this.db.exec('COMMIT');return result;}catch(e){this.db.exec('ROLLBACK');throw e;}}}
test('accounts, PIN enforcement, profile separation, rewards and conflict protection',async()=>{
 const env={DB:new D1()};let cookie='';
 async function call(path,body,origin='https://test.local'){const r=await worker.fetch(new Request('https://test.local/api/'+path,{method:body?'POST':'GET',headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),Cookie:cookie},body:body?JSON.stringify(body):undefined}),env);if(r.headers.has('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};}
 assert.equal((await call('register',{username:'testfamily',password:'strong-passphrase',pin:'4826',name:'Maya'})).status,201);
 let d=(await call('state')).data;const id=d.profiles[0].id;
 assert.equal((await call('profiles',{name:'Sibling'})).status,403);
 assert.equal((await call('adult',{pin:'0000'})).status,403);
 assert.equal((await call('adult',{pin:'4826'})).status,200);
 assert.equal((await call('profiles',{name:'Sibling',avatar:'🦊'})).status,200);
 assert.equal((await call('settings',{...d.settings,rewardMinutes:7})).status,200);
 let a=await call('action',{profileId:id,version:0,action:'add',title:'Feed dog',minutes:5});assert.equal(a.status,200);const task=a.data.profiles[0].state.tasks[0];
 assert.equal((await call('action',{profileId:id,version:0,action:'start',taskId:task.id})).status,409);
 a=await call('action',{profileId:id,version:1,action:'start',taskId:task.id});assert.equal(a.status,200);
 a=await call('action',{profileId:id,version:2,action:'complete'});assert.equal(a.status,200);assert.equal(a.data.profiles[0].state.energy,480);assert.equal(a.data.profiles[1].state.energy,0);
 assert.equal((await call('action',{profileId:id,version:2,action:'complete'})).status,409);
 assert.equal((await call('action',{profileId:id,version:3,action:'play',gameId:'memory'})).status,400);
 assert.equal((await call('action',{profileId:'foreign-profile',version:0,action:'add',title:'x',minutes:1})).status,404);
 assert.equal((await call('adult',{pin:'4826'},'https://evil.local')).status,403);
 assert.equal((await call('action',{profileId:id,version:3,action:'buyItem',itemId:'crown'})).status,400);
 a=await call('action',{profileId:id,version:3,action:'animal',animal:'fox'});assert.equal(a.status,200);assert.equal(a.data.profiles[0].state.wardrobe.animal,'fox');assert.equal(a.data.profiles[0].state.completed,1);
 assert.equal((await call('action',{profileId:id,version:4,action:'equipItem',itemId:'crown'})).status,400);
 assert.equal((await call('logout',{})).status,200);assert.equal((await call('state')).status,401);
 assert.equal((await call('login',{username:'testfamily',password:'strong-passphrase'})).status,200);
});

test('profile names and real voice choices persist without changing login, rewards or sibling profiles',async()=>{
 const env={DB:new D1()};let cookie='';
 async function call(path,body){const r=await worker.fetch(new Request('https://test.local/api/'+path,{method:body?'POST':'GET',headers:{Origin:'https://test.local',...(body?{'Content-Type':'application/json'}:{}),Cookie:cookie},body:body?JSON.stringify(body):undefined}),env);if(r.headers.has('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};}
 await call('register',{username:'renamefamily',password:'strong-passphrase',pin:'4826',name:'Maya'});
 await call('adult',{pin:'4826'});await call('profiles',{name:'Sibling',animal:'fox'});await call('adult',{lock:true});
 const before=(await call('state')).data,first=before.profiles[0],sibling=before.profiles[1];
 const act=(action,extra={},version)=>call('action',{profileId:first.id,version:version??first.version,action,...extra});
 for(const name of ['', '   ', 'x'.repeat(31), 'Maya\nX'])assert.equal((await act('rename',{name})).status,400);
 assert.equal((await call('action',{profileId:'foreign-profile',version:0,action:'rename',name:'Oops'})).status,404);
 const rename=await act('rename',{name:'  May & Fox  '});assert.equal(rename.status,200);
 assert.equal(rename.data.profiles[0].name,'May & Fox');assert.deepEqual(rename.data.profiles[0].state,first.state);assert.deepEqual(rename.data.profiles[1],sibling);
 assert.equal((await act('rename',{name:'Stale'},0)).status,409);
 const voice={uri:'native/voice-2',name:'Natural English',lang:'en-US'};
 let a=await act('voiceChoice',{voice},1);assert.equal(a.status,200);assert.deepEqual(a.data.profiles[0].state.voiceChoice,voice);
 assert.equal((await act('voiceChoice',{voice:{...voice,lang:'invalid language'}},2)).status,400);
 assert.equal((await act('voiceChoice',{voice:{...voice,name:''}},2)).status,400);
 assert.equal((await act('voiceChoice',{voice:null},2)).status,200);
 await call('logout',{});assert.equal((await call('login',{username:'renamefamily',password:'strong-passphrase'})).status,200);
 const saved=(await call('state')).data;assert.equal(saved.profiles[0].name,'May & Fox');assert.equal(saved.profiles[0].state.voiceChoice,null);assert.deepEqual(saved.profiles[1],sibling);
});
