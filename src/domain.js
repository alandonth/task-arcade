export const DEFAULT_SETTINGS = {rewardMinutes:5, bonusMinutes:1, playMode:'earned', autoNext:false, keepAwake:true, reminderSeconds:90};
export const GAMES = [{id:'stars',name:'Star Scoop',icon:'⭐',at:0},{id:'memory',name:'Monster Match',icon:'👾',at:3}];
export function initialState(){return {tasks:[],active:null,energy:0,points:0,completed:0,theme:'carnival',ownedThemes:['carnival'],voice:'friendly',scores:{},play:null,history:[]};}
export function elapsed(active,now){return active.elapsed + (active.startedAt===null?0:Math.max(0,now-active.startedAt));}
export function finishTask(state,settings,now){
 if(!state.active) throw Error('Start a task first.');
 const task=state.tasks.find(t=>t.id===state.active.taskId);
 if(!task) throw Error('Task not found.');
 const early=elapsed(state.active,now)<task.minutes*60000;
 const reward=settings.rewardMinutes+(early?settings.bonusMinutes:0);
 state.energy+=reward*60;state.points+=10+(early?2:0);state.completed++;
 state.history.unshift({title:task.title,at:now,early,minutes:reward});state.history=state.history.slice(0,40);
 state.tasks=state.tasks.filter(t=>t.id!==task.id);state.active=null;
 return {early,reward};
}
export function settlePlay(state,now){
 if(!state.play)return;
 const used=Math.max(0,Math.ceil((Math.min(now,state.play.leaseUntil??now)-state.play.startedAt)/1000));
 if(state.play.earned)state.energy=Math.max(0,state.energy-used);
 state.play=null;
}
export function validateSettings(s){
 const out={};for(const [key,min,max] of [['rewardMinutes',1,30],['bonusMinutes',0,10],['reminderSeconds',30,600]]){
 const n=Number(s[key]);if(!Number.isInteger(n)||n<min||n>max)throw Error('Check the adult settings.');out[key]=n;}
 if(!['earned','unlimited'].includes(s.playMode))throw Error('Choose a play mode.');
 return {...out,playMode:s.playMode,autoNext:!!s.autoNext,keepAwake:!!s.keepAwake};
}
