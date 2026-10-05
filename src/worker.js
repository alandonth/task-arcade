import {DEFAULT_SETTINGS,GAMES,initialState,finishTask,elapsed,settlePlay,validateSettings} from './domain.js';
const enc=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
const unhex=s=>Uint8Array.from(s.match(/../g),x=>parseInt(x,16));
async function sha(s){return hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));}
async function hashPassword(s,salt=hex(crypto.getRandomValues(new Uint8Array(16)))){
 const key=await crypto.subtle.importKey('raw',enc.encode(s),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(salt),iterations:100000,hash:'SHA-256'},key,256);
 return `${salt}:${hex(bits)}`;
}
async function verify(s,h){const v=await hashPassword(s,h.split(':')[0]);let diff=v.length^h.length;for(let i=0;i<h.length;i++)diff|=(v.charCodeAt(i)||0)^h.charCodeAt(i);return diff===0;}
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});}
function fail(message,status=400){throw Object.assign(Error(message),{status});}
function text(v,max=100){return String(v??'').trim().slice(0,max);}
const AVATARS=['🐸','🦊','🐱','🤖','🦄','🐼','🐙','🐶'];
async function rate(db,key,limit){
 const now=Date.now();await db.prepare('INSERT INTO attempts(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<? THEN excluded.reset_at ELSE reset_at END').bind(key,now+900000,now,now).run();
 const r=await db.prepare('SELECT count FROM attempts WHERE key=?').bind(key).first();if(r.count>limit)fail('Too many attempts. Try again in 15 minutes.',429);
}
async function session(req,db){const token=req.headers.get('Cookie')?.match(/(?:^|;\s*)ta_session=([^;]+)/)?.[1];if(!token)fail('Please sign in.',401);const s=await db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?').bind(await sha(token),Date.now()).first();if(!s)fail('Please sign in again.',401);return s;}
async function issue(req,db,hid){const token=hex(crypto.getRandomValues(new Uint8Array(32)));await db.prepare('INSERT INTO sessions(token_hash,household_id,expires_at) VALUES(?,?,?)').bind(await sha(token),hid,Date.now()+30*86400000).run();return {'Set-Cookie':`ta_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${new URL(req.url).protocol==='https:'?'; Secure':''}`};}
async function snapshot(db,s){
 const h=await db.prepare('SELECT settings FROM households WHERE id=?').bind(s.household_id).first();
 const p=await db.prepare('SELECT * FROM profiles WHERE household_id=? ORDER BY rowid').bind(s.household_id).all();
 return {settings:JSON.parse(h.settings),adult:s.adult_until>Date.now(),profiles:p.results.map(p=>({...p,state:JSON.parse(p.state)}))};
}
export default {async fetch(req,env){
 const url=new URL(req.url);if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(req);
 try{
 if(req.method!=='GET'&&req.headers.get('Origin')!==url.origin)fail('Request origin does not match.',403);
 if(req.method!=='GET'&&!req.headers.get('Content-Type')?.startsWith('application/json'))fail('Use JSON.',415);
 if(Number(req.headers.get('Content-Length')||0)>20000)fail('Request is too large.',413);
 let b={};if(req.method!=='GET'){const raw=await req.text();if(raw.length>20000)fail('Request is too large.',413);try{b=JSON.parse(raw);}catch{fail('Invalid request.');}}
 const db=env.DB, path=url.pathname,now=Date.now();
 if(path==='/api/register'&&req.method==='POST'){
 await rate(db,'register:'+ (req.headers.get('CF-Connecting-IP')||'local'),10);
 const username=text(b.username,40).toLowerCase();if(!/^[a-z0-9_-]{3,40}$/.test(username))fail('Use 3–40 letters, numbers, underscores or dashes.');
 if(typeof b.password!=='string'||b.password.length<10||b.password.length>128)fail('Use a password of 10–128 characters.');
 if(!/^\d{4,8}$/.test(b.pin||''))fail('Choose a 4–8 digit adult PIN.');
 const name=text(b.name,30);if(!name)fail('Enter the first player’s name.');
 const hid=crypto.randomUUID();const ph=await hashPassword(b.password),pin=await hashPassword(b.pin);
 try{await db.batch([db.prepare('INSERT INTO households VALUES(?,?,?,?,?,?)').bind(hid,username,ph,pin,JSON.stringify(DEFAULT_SETTINGS),now),db.prepare('INSERT INTO profiles(id,household_id,name,avatar,state) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),hid,name,'🐸',JSON.stringify(initialState()))]);}catch(e){if(String(e).includes('UNIQUE'))fail('That household username is already taken.',409);throw e;}
 return json({ok:true},201,await issue(req,db,hid));
 }
 if(path==='/api/login'&&req.method==='POST'){
 await rate(db,'login:'+ (req.headers.get('CF-Connecting-IP')||'local'),20);
 const h=await db.prepare('SELECT * FROM households WHERE username=?').bind(text(b.username,40).toLowerCase()).first();
 if(!h||typeof b.password!=='string'||b.password.length>128||!await verify(b.password,h.password_hash))fail('Username or password is incorrect.',401);
 return json({ok:true},200,await issue(req,db,h.id));
 }
 const s=await session(req,db);
 if(path==='/api/state'&&req.method==='GET')return json(await snapshot(db,s));
 if(path==='/api/logout'&&req.method==='POST'){await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(s.token_hash).run();return json({ok:true},200,{'Set-Cookie':'ta_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});}
 if(path==='/api/adult'&&req.method==='POST'){
 if(b.lock){await db.prepare('UPDATE sessions SET adult_until=0 WHERE token_hash=?').bind(s.token_hash).run();return json({ok:true});}
 await rate(db,'pin:'+s.household_id,10);const h=await db.prepare('SELECT pin_hash FROM households WHERE id=?').bind(s.household_id).first();
 if(!/^\d{4,8}$/.test(b.pin||'')||!await verify(b.pin,h.pin_hash))fail('That PIN didn’t match.',403);
 await db.prepare('UPDATE sessions SET adult_until=? WHERE token_hash=?').bind(now+600000,s.token_hash).run();return json({ok:true});
 }
 const adult=()=>{if(s.adult_until<=now)fail('Unlock adult settings first.',403);};
 if(path==='/api/settings'&&req.method==='POST'){adult();const settings=validateSettings(b);await db.prepare('UPDATE households SET settings=? WHERE id=?').bind(JSON.stringify(settings),s.household_id).run();return json({ok:true});}
 if(path==='/api/profiles'&&req.method==='POST'){adult();const name=text(b.name,30);if(!name)fail('Enter a name.');const n=await db.prepare('SELECT COUNT(*) AS n FROM profiles WHERE household_id=?').bind(s.household_id).first();if(n.n>=12)fail('This household already has 12 profiles.');await db.prepare('INSERT INTO profiles(id,household_id,name,avatar,state) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),s.household_id,name,AVATARS.includes(b.avatar)?b.avatar:'🐸',JSON.stringify(initialState())).run();return json({ok:true});}
 if(path!=='/api/action'||req.method!=='POST')fail('Not found.',404);
 const p=await db.prepare('SELECT * FROM profiles WHERE id=? AND household_id=?').bind(text(b.profileId,80),s.household_id).first();if(!p)fail('Player not found.',404);
 if(b.version!==p.version)fail('This profile changed on another screen. Refresh and try again.',409);
 const h=await db.prepare('SELECT settings FROM households WHERE id=?').bind(s.household_id).first();const settings=JSON.parse(h.settings),state=JSON.parse(p.state);let result={};
 switch(b.action){
 case 'add':{if(state.tasks.length>=50)fail('Finish a few tasks before adding more.');const title=text(b.title,100),minutes=Number(b.minutes);if(!title||!Number.isInteger(minutes)||minutes<1||minutes>180)fail('Enter a task and 1–180 minutes.');state.tasks.push({id:crypto.randomUUID(),title,minutes,category:['chores','homework','other'].includes(b.category)?b.category:'other',steps:text(b.steps,1000).split('\n').map(x=>x.trim()).filter(Boolean).slice(0,12),prompt:text(b.prompt,200),checked:[]});break;}
 case 'remove':if(state.active?.taskId===b.taskId)fail('Stop the timer before removing this task.');state.tasks=state.tasks.filter(t=>t.id!==b.taskId);break;
 case 'move':{const i=state.tasks.findIndex(t=>t.id===b.taskId),j=i+(b.direction===-1?-1:1);if(i>=0&&j>=0&&j<state.tasks.length)[state.tasks[i],state.tasks[j]]=[state.tasks[j],state.tasks[i]];break;}
 case 'start':{if(state.active)fail('There is already a task running.');if(!state.tasks.some(t=>t.id===b.taskId))fail('Task not found.');settlePlay(state,now);state.active={taskId:b.taskId,startedAt:now,elapsed:0};break;}
 case 'pause':if(state.active?.startedAt!=null){state.active.elapsed=elapsed(state.active,now);state.active.startedAt=null;}break;
 case 'resume':if(state.active&&state.active.startedAt===null)state.active.startedAt=now;break;
 case 'stop':state.active=null;break;
 case 'check':{const t=state.tasks.find(t=>t.id===b.taskId);if(!t||!Number.isInteger(b.index)||b.index<0||b.index>=t.steps.length)fail('Step not found.');t.checked=t.checked.includes(b.index)?t.checked.filter(i=>i!==b.index):[...t.checked,b.index];break;}
 case 'complete':result=finishTask(state,settings,now);break;
 case 'theme':{if(!['carnival','space','lava'].includes(b.theme))fail('Theme not found.');if(!state.ownedThemes.includes(b.theme)){if(state.points<30)fail('You need 30 points.');state.points-=30;state.ownedThemes.push(b.theme);}state.theme=b.theme;break;}
 case 'voice':if(!['friendly','robot','calm'].includes(b.voice))fail('Voice not found.');state.voice=b.voice;break;
 case 'play':{const g=GAMES.find(g=>g.id===b.gameId);if(!g||state.completed<g.at)fail('Discover this game by completing more tasks.');if(state.active)fail('Finish or stop your task before playing.');settlePlay(state,now);if(settings.playMode==='earned'&&state.energy<=0)fail('Complete a task to wake the arcade!');state.play={gameId:g.id,startedAt:now,leaseUntil:now+15000,earned:settings.playMode==='earned'};break;}
 case 'playTick':{const previous=state.play;if(!previous)fail('Game session ended.');settlePlay(state,now);if(!previous.earned||state.energy>0)state.play={...previous,startedAt:now,leaseUntil:now+15000};break;}
 case 'endPlay':{const id=state.play?.gameId;settlePlay(state,now);const score=Number(b.score);if(id&&Number.isInteger(score)&&score>=0&&score<=100000)state.scores[id]=Math.max(state.scores[id]||0,score);break;}
 default:fail('Unknown action.');
 }
 const r=await db.prepare('UPDATE profiles SET state=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(state),p.id,p.version).run();if(!r.meta.changes)fail('This profile changed. Refresh and try again.',409);
 return json({result,...await snapshot(db,s)});
 }catch(e){if(!e.status)console.error('API error',e);return json({error:e.status?e.message:'Something went wrong. Please try again.'},e.status||500);}
}};
