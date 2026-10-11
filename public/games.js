import {GAMES,matchScore} from './config.js';
const W=480,H=560,TEAL='#4ee0cd',GOLD='#f4ce70',WHITE='#eef7f5',INK='#101b20';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const directions={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
function shuffle(items,rng){return items.map(v=>({v,r:rng()})).sort((a,b)=>a.r-b.r).map(a=>a.v);}
export function makeMaze(rng=Math.random){
 const size=15,cells=Array.from({length:size},()=>Array(size).fill(1)),stack=[[1,1]];cells[1][1]=0;
 while(stack.length){const [x,y]=stack.at(-1),choices=shuffle([[2,0],[-2,0],[0,2],[0,-2]],rng).filter(([dx,dy])=>x+dx>0&&x+dx<size-1&&y+dy>0&&y+dy<size-1&&cells[y+dy][x+dx]===1);
  if(!choices.length){stack.pop();continue;}const [dx,dy]=choices[0];cells[y+dy/2][x+dx/2]=0;cells[y+dy][x+dx]=0;stack.push([x+dx,y+dy]);}
 return cells;
}
function base(id){return {id,score:0,time:0,finished:false,notice:'',effects:[],keys:new Set(),pointer:null,act(){},update(){},draw(){}};}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function text(c,s,x,y,size=20,color=WHITE,align='center'){c.fillStyle=color;c.font=`bold ${size}px monospace`;c.textAlign=align;c.fillText(s,x,y);}
function circle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
function star(c,x,y,r,color=GOLD){c.fillStyle=color;c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,k=i%2?r*.43:r;c.lineTo(x+Math.cos(a)*k,y+Math.sin(a)*k);}c.closePath();c.fill();}
function buddy(c,x,y,color=TEAL,scale=1){rect(c,x-12*scale,y-10*scale,24*scale,20*scale,color);rect(c,x-17*scale,y-5*scale,34*scale,10*scale,color);rect(c,x-8*scale,y-5*scale,4*scale,5*scale,INK);rect(c,x+4*scale,y-5*scale,4*scale,5*scale,INK);}
function effect(s,x,y,label){s.effects.push({x,y,label,left:.65});}
export function createArcadeModel(id,rng=Math.random){
 const s=base(id),rand=(a,b)=>a+(b-a)*rng();
 if(id==='stars'){
  s.target={x:rand(40,440),y:rand(80,475)};
  s.act=(action,p)=>{if(action==='tap'&&Math.hypot(p.x-s.target.x,p.y-s.target.y)<38){s.score+=10;effect(s,p.x,p.y,'+10');s.target={x:rand(40,440),y:rand(80,475)};}};
  s.draw=c=>{text(c,'10 SECOND SPRINT',240,42,20,GOLD);star(c,s.target.x,s.target.y,32);};
 }else if(id==='memory'){
  s.cards=shuffle([0,1,2,3,4,5,0,1,2,3,4,5],rng);s.open=[];s.matched=[];s.turns=0;s.hideAt=0;
  s.act=(action,p)=>{if(action!=='tap'||s.open.length===2)return;const col=Math.floor((p.x-26)/110),row=Math.floor((p.y-90)/120),i=row*4+col;if(col<0||col>3||row<0||row>2||p.x>26+col*110+98||p.y>90+row*120+105||s.matched.includes(i)||s.open.includes(i))return;s.open.push(i);
   if(s.open.length===2){s.turns++;if(s.cards[s.open[0]]===s.cards[s.open[1]]){s.matched.push(...s.open);s.open=[];if(s.matched.length===12){s.score=matchScore(s.time,s.turns);s.finished=true;s.notice='All pairs found! Speed bonus banked.';}}else s.hideAt=s.time+.65;}};
  s.update=()=>{if(s.open.length===2&&s.time>=s.hideAt)s.open=[];};
  s.draw=c=>{text(c,`${s.matched.length/2}/6 PAIRS · ${s.turns} GUESSES`,240,45,18,GOLD);s.cards.forEach((v,i)=>{const x=26+i%4*110,y=90+Math.floor(i/4)*120,shown=s.open.includes(i)||s.matched.includes(i);rect(c,x,y,98,105,shown?'#174b47':'#26383f');if(shown){buddy(c,x+49,y+53,[TEAL,GOLD,'#fd937c','#afa6ed','#67a6ef','#ea91cb'][v],1.6);text(c,String(v+1),x+49,y+91,16);}else text(c,'?',x+49,y+67,40,TEAL);});text(c,'FINISH FASTER = MORE POINTS',240,505,16,TEAL);};
 }else if(id==='nitrogen'){
  s.discs=[];s.splats=[];s.spawn=0;s.streak=0;
  s.act=(action,p)=>{if(action!=='tap')return;const i=s.discs.findIndex(d=>Math.hypot(p.x-d.x,p.y-d.y)<d.r+12);if(i>=0){const d=s.discs.splice(i,1)[0];s.streak++;const points=(d.gold?30:10)+Math.min(20,s.streak*2);s.score+=points;s.splats.push({x:d.x,y:d.y,gold:d.gold,left:.5});effect(s,d.x,d.y,'SPLAT +'+points);}else s.streak=0;};
  s.update=dt=>{s.splats.forEach(v=>v.left-=dt);s.splats=s.splats.filter(v=>v.left>0);s.spawn-=dt;if(s.spawn<=0){const left=rng()<.5;s.discs.push({x:left?-25:505,y:rand(340,485),vx:(left?1:-1)*rand(110,175),vy:rand(-270,-210),r:22,gold:rng()<.2});s.spawn=rand(.6,1);}s.discs.forEach(d=>{d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=145*dt;});const misses=s.discs.filter(d=>d.y>H+30||d.x<-60||d.x>540).length;if(misses)s.streak=0;s.discs=s.discs.filter(d=>d.y<H+30&&d.x>-60&&d.x<540);};
  s.draw=c=>{rect(c,0,485,480,75,'#163e39');text(c,'NITROGEN // PAINT RANGE',240,35,18,GOLD);text(c,'STREAK '+s.streak,240,66,16,TEAL);s.discs.forEach(d=>{circle(c,d.x,d.y,d.r,d.gold?GOLD:TEAL);circle(c,d.x,d.y,10,INK);});for(const v of s.splats){circle(c,v.x,v.y,30,v.gold?GOLD:TEAL);for(let i=0;i<7;i++)circle(c,v.x+Math.cos(i)*43,v.y+Math.sin(i)*43,7,v.gold?GOLD:TEAL);}rect(c,190,510,100,18,'#b9c9c5');rect(c,200,525,22,28,'#387e72');rect(c,245,491,29,19,GOLD);text(c,'TAP TO FIRE',240,478,16,TEAL);};
 }else if(id==='pong'){
  s.player=230;s.enemy=230;s.ball={x:240,y:280,vx:220,vy:rand(-110,110)};s.enemyPoints=0;
  const reset=direction=>{s.ball={x:240,y:280,vx:direction*220,vy:rand(-130,130)};};
  s.act=(a,p)=>{if(a==='tap'||a==='move')s.player=clamp(p.y-50,70,450);};
  s.update=dt=>{s.player=clamp(s.player+(s.keys.has('down')?1:s.keys.has('up')?-1:0)*320*dt,70,450);s.enemy=clamp(s.enemy+clamp(s.ball.y-(s.enemy+50),-1,1)*155*dt,70,450);const b=s.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y<76){b.y=76;b.vy=Math.abs(b.vy);}if(b.y>525){b.y=525;b.vy=-Math.abs(b.vy);}if(b.vx<0&&b.x<35&&b.x>13&&b.y>s.player-8&&b.y<s.player+108){b.x=35;b.vx=Math.min(360,Math.abs(b.vx)*1.08);b.vy=(b.y-s.player-50)*4;}if(b.vx>0&&b.x>445&&b.x<467&&b.y>s.enemy-8&&b.y<s.enemy+108){b.x=445;b.vx=-Math.min(360,Math.abs(b.vx)*1.06);b.vy=(b.y-s.enemy-50)*4;}if(b.x>490){s.score+=100;effect(s,240,240,'GOAL +100');reset(-1);}if(b.x<-10){s.enemyPoints++;reset(1);}};
  s.draw=c=>{text(c,'PLAYER  '+s.score/100+' : '+s.enemyPoints+'  CPU',240,38,18,GOLD);for(let y=80;y<530;y+=30)rect(c,239,y,2,15,'#395359');rect(c,18,s.player,12,100,TEAL);rect(c,450,s.enemy,12,100,GOLD);circle(c,s.ball.x,s.ball.y,8,WHITE);};
 }else if(id==='galaxy'){
  s.ship=240;s.bullets=[];s.enemies=[];s.shots=[];s.spawn=0;s.fire=0;s.lives=3;s.invincible=0;
  s.act=(a,p)=>{if(a==='tap'||a==='move')s.ship=clamp(p.x,25,455);};
  s.update=dt=>{s.ship=clamp(s.ship+(s.keys.has('right')?1:s.keys.has('left')?-1:0)*300*dt,25,455);s.spawn-=dt;s.fire-=dt;s.invincible=Math.max(0,s.invincible-dt);if(s.fire<=0){s.bullets.push({x:s.ship,y:493,w:4,h:14});s.fire=.2;}if(s.spawn<=0){s.enemies.push({x:rand(20,430),y:60,w:28,h:24,v:rand(36,65),phase:rand(0,6),fire:rand(1,3)});s.spawn=.7;}s.bullets.forEach(b=>b.y-=410*dt);s.shots.forEach(b=>b.y+=180*dt);s.enemies.forEach(e=>{e.y+=e.v*dt;e.x+=Math.sin(s.time*2+e.phase)*35*dt;e.fire-=dt;if(e.fire<=0){s.shots.push({x:e.x+12,y:e.y+22,w:6,h:12});e.fire=2;}for(const b of s.bullets)if(hit(b,e)){e.dead=true;b.dead=true;s.score+=25;effect(s,e.x,e.y,'+25');break;}if(!e.dead&&e.y>490){e.dead=true;if(!s.invincible){s.lives--;s.invincible=1;}}});const player={x:s.ship-16,y:495,w:32,h:24};s.shots.forEach(b=>{if(!s.invincible&&hit(player,b)){b.dead=true;s.lives--;s.invincible=1.2;}});s.bullets=s.bullets.filter(b=>b.y>50&&!b.dead);s.shots=s.shots.filter(b=>b.y<H&&!b.dead);s.enemies=s.enemies.filter(e=>!e.dead);if(s.lives<=0){s.finished=true;s.notice='Patrol complete. Recharge and try again!';}};
  s.draw=c=>{text(c,'GALAXY PATROL · HULL '+s.lives,240,36,18,GOLD);for(let i=0;i<24;i++)rect(c,(i*73)%470,80+(i*47+s.time*12)%440,2,2,'#45636c');s.enemies.forEach(e=>buddy(c,e.x+14,e.y+12,GOLD));s.bullets.forEach(b=>rect(c,b.x,b.y,b.w,b.h,TEAL));s.shots.forEach(b=>rect(c,b.x,b.y,b.w,b.h,'#fd937c'));if(!s.invincible||Math.floor(s.time*10)%2===0){c.fillStyle=TEAL;c.beginPath();c.moveTo(s.ship,489);c.lineTo(s.ship-19,523);c.lineTo(s.ship+19,523);c.closePath();c.fill();}};
 }else if(id==='typing'){
  const words=['focus','power','force','arcade','rocket','gold','teal','ninja','dragon','planet','charge','galaxy','task','bright','jump','energy','star','victory','paddle','fish'];s.word=words[Math.floor(rng()*words.length)];s.deadline=7;s.combo=0;s.correct=0;s.misses=0;
  const next=()=>{s.word=words[Math.floor(rng()*words.length)];s.deadline=s.time+Math.max(3.5,7-s.correct*.08);};
  s.act=(a,value)=>{if(a!=='word')return;if(value.trim().toLowerCase()===s.word){s.notice='';s.combo++;s.correct++;const n=50+Math.ceil(Math.max(0,s.deadline-s.time))*5+Math.min(50,s.combo*5);s.score+=n;effect(s,240,230,'SLICE +'+n);next();}else{s.combo=0;s.notice='Try that word again.';}};
  s.update=()=>{if(s.time>s.deadline){s.misses++;s.combo=0;next();}};
  s.draw=c=>{text(c,'COMBO '+s.combo+' · WORDS '+s.correct,240,42,18,GOLD);rect(c,50,160,380,160,'#1c393b');text(c,s.word.toUpperCase(),240,251,34,TEAL);rect(c,50,340,380,12,'#29444b');rect(c,50,340,380*clamp((s.deadline-s.time)/7,0,1),12,GOLD);text(c,'TYPE BELOW + PRESS ENTER',240,410,17,WHITE);if(s.effects.length){c.strokeStyle=GOLD;c.lineWidth=5;c.beginPath();c.moveTo(70,300);c.lineTo(410,170);c.stroke();}if(s.notice)text(c,s.notice,240,470,16,GOLD);};
 }else if(id==='crossing'){
  s.frog={x:5,y:10};s.lives=3;s.round=0;s.lanes=Array.from({length:9},(_,i)=>({offset:rand(0,420),speed:(i%2?1:-1)*(i<4?45:65)}));s.cooldown=0;
  const reset=()=>{s.frog={x:5,y:10};s.cooldown=.35;};
  s.act=a=>{if(!directions[a]||s.cooldown>0)return;const [dx,dy]=directions[a];s.frog.x=clamp(s.frog.x+dx,0,9);s.frog.y=clamp(s.frog.y+dy,0,10);};
  s.update=dt=>{s.cooldown=Math.max(0,s.cooldown-dt);s.lanes.forEach(l=>l.offset=(l.offset+l.speed*dt+480)%480);const f=s.frog;if(f.y===0){s.score+=200;s.round++;effect(s,240,70,'CROSSED +200');reset();return;}const lane=s.lanes[f.y-1];if(f.y>=1&&f.y<=4){const center=f.x*48+24;let safe=false;for(let k=-1;k<4;k++){const x=lane.offset+k*190;if(center>x&&center<x+140)safe=true;}if(!safe&&s.cooldown<=0){s.lives--;reset();}else if(s.cooldown<=0){f.x+=lane.speed*dt/48;if(f.x<0||f.x>9){s.lives--;reset();}}}else if(f.y>=6&&f.y<=9&&s.cooldown<=0){const center=f.x*48+24;for(let k=-1;k<5;k++){const x=lane.offset+k*165;if(center>x-15&&center<x+65){s.lives--;reset();break;}}}if(s.lives<=0){s.finished=true;s.notice='Crossing complete!';}};
  s.draw=c=>{text(c,'FROG CROSSING · LIVES '+s.lives,240,29,18,GOLD);for(let row=0;row<=10;row++){const y=55+row*44;rect(c,0,y,480,43,row===0||row===5||row===10?'#174d41':row<5?'#16374e':'#283138');if(row>=1&&row<=4){const l=s.lanes[row-1];for(let k=-1;k<4;k++)rect(c,l.offset+k*190,y+9,140,24,'#ad8551');}else if(row>=6&&row<=9){const l=s.lanes[row-1];for(let k=-1;k<5;k++){rect(c,l.offset+k*165,y+7,65,30,row%2?GOLD:'#eb9178');rect(c,l.offset+k*165+13,y+10,23,10,INK);}}}buddy(c,s.frog.x*48+24,55+s.frog.y*44+22,TEAL,1.2);};
 }else if(id==='dig'){
  s.grid=Array.from({length:13},()=>Array(13).fill(1));s.player={x:6,y:1};s.grid[1][6]=0;s.monsters=[{x:2,y:4,hits:0},{x:10,y:6,hits:0},{x:3,y:10,hits:0},{x:10,y:11,hits:0}];s.gems=[{x:3,y:3},{x:9,y:4},{x:6,y:8},{x:2,y:11}];s.lives=3;s.walk=0;s.monsterClock=0;s.invincible=0;s.pumpFlash=0;
  s.act=a=>{if(a==='pump'){s.pumpFlash=.2;const m=s.monsters.find(m=>Math.abs(m.x-s.player.x)+Math.abs(m.y-s.player.y)<=2);if(m){m.hits++;if(m.hits>=3){s.monsters=s.monsters.filter(v=>v!==m);s.score+=150;effect(s,m.x*34+36,m.y*34+74,'POP +150');}}if(!s.monsters.length){s.finished=true;s.notice='Every monster popped!';}return;}if(!directions[a]||s.walk>0)return;const [dx,dy]=directions[a];s.player.x=clamp(s.player.x+dx,0,12);s.player.y=clamp(s.player.y+dy,0,12);if(s.grid[s.player.y][s.player.x]){s.grid[s.player.y][s.player.x]=0;s.score+=1;}s.walk=.11;const gem=s.gems.find(g=>g.x===s.player.x&&g.y===s.player.y);if(gem){s.score+=50;s.gems=s.gems.filter(g=>g!==gem);}};
  s.update=dt=>{s.walk=Math.max(0,s.walk-dt);s.invincible=Math.max(0,s.invincible-dt);s.pumpFlash=Math.max(0,s.pumpFlash-dt);s.monsterClock+=dt;if(s.monsterClock>1.1){s.monsterClock=0;s.monsters.forEach(m=>{if(m.hits>0&&rng()<.4){m.hits--;return;}if(rng()<.5)m.x+=Math.sign(s.player.x-m.x);else m.y+=Math.sign(s.player.y-m.y);s.grid[m.y][m.x]=0;});}if(!s.invincible&&s.monsters.some(m=>m.x===s.player.x&&m.y===s.player.y)){s.lives--;s.invincible=1.5;s.player={x:6,y:1};}if(s.lives<=0){s.finished=true;s.notice='Tunnel expedition complete.';}};
  s.draw=c=>{text(c,'LIVES '+s.lives+' · MONSTERS '+s.monsters.length,240,28,18,GOLD);s.grid.forEach((row,y)=>row.forEach((v,x)=>{rect(c,19+x*34,57+y*34,33,33,v?'#5d4632':'#142a2e');if(v)rect(c,26+x*34,65+y*34,3,3,'#9b7850');}));s.gems.forEach(g=>star(c,36+g.x*34,74+g.y*34,11));s.monsters.forEach(m=>buddy(c,36+m.x*34,74+m.y*34,'#ed887b',1+m.hits*.25));buddy(c,36+s.player.x*34,74+s.player.y*34,TEAL);if(s.pumpFlash){c.strokeStyle=TEAL;c.lineWidth=3;c.beginPath();c.arc(36+s.player.x*34,74+s.player.y*34,65,0,7);c.stroke();}text(c,'GET CLOSE. PUMP THREE TIMES.',240,531,15,TEAL);};
 }else if(id==='blocks'){
  const shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];s.board=Array.from({length:18},()=>Array(10).fill(0));s.lines=0;s.fall=0;s.lockDelay=0;
  const collides=(shape,x,y)=>shape.some((row,dy)=>row.some((v,dx)=>v&&(x+dx<0||x+dx>=10||y+dy>=18||(y+dy>=0&&s.board[y+dy][x+dx]))));
  const spawn=()=>{const n=Math.floor(rng()*shapes.length);s.piece={shape:shapes[n].map(r=>[...r]),x:3,y:0,color:n+1};if(collides(s.piece.shape,s.piece.x,0)){s.finished=true;s.notice='Stack full. Nice run!';}};
  const lock=()=>{const p=s.piece;p.shape.forEach((row,dy)=>row.forEach((v,dx)=>{if(v&&p.y+dy>=0)s.board[p.y+dy][p.x+dx]=p.color;}));const rows=s.board.filter(row=>row.every(Boolean)).length;if(rows){s.board=s.board.filter(row=>!row.every(Boolean));while(s.board.length<18)s.board.unshift(Array(10).fill(0));s.lines+=rows;s.score+=[0,100,300,500,800][rows];effect(s,240,240,rows+' LINE'+(rows>1?'S':'')+'!');}spawn();s.fall=0;};
  s.act=a=>{const p=s.piece;if(a==='up'||a==='rotate'){const rotated=p.shape[0].map((_,x)=>p.shape.map(row=>row[x]).reverse());for(const n of [0,-1,1,-2,2])if(!collides(rotated,p.x+n,p.y)){p.shape=rotated;p.x+=n;break;}}else if(a==='drop'){while(!collides(p.shape,p.x,p.y+1)){p.y++;s.score+=2;}lock();}else if(a==='down'){if(!collides(p.shape,p.x,p.y+1)){p.y++;s.score++;}else lock();}else if(a==='left'||a==='right'){const dx=a==='left'?-1:1;if(!collides(p.shape,p.x+dx,p.y))p.x+=dx;}};
  s.update=dt=>{s.fall+=dt;if(s.fall>Math.max(.18,.65-s.lines*.018)){s.fall=0;s.act('down');}};
  s.draw=c=>{text(c,'LINES '+s.lines,240,25,18,GOLD);const colors=['',TEAL,GOLD,'#eb947f','#aea3ed','#64a5e9','#87caa0','#d69ac6'];const cell=(x,y,v,alpha=1)=>{c.globalAlpha=alpha;rect(c,100+x*28,42+y*28,26,26,colors[v]);rect(c,103+x*28,45+y*28,20,3,'#ffffff55');c.globalAlpha=1;};s.board.forEach((row,y)=>row.forEach((v,x)=>{rect(c,100+x*28,42+y*28,27,27,'#1c3035');if(v)cell(x,y,v);}));const p=s.piece;let ghost=p.y;while(!collides(p.shape,p.x,ghost+1))ghost++;p.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v){cell(p.x+x,ghost+y,p.color,.25);cell(p.x+x,p.y+y,p.color);}}));};spawn();
 }else if(id==='maze'){
  s.cells=makeMaze(rng);s.player={x:1,y:1};const spots=[];s.cells.forEach((r,y)=>r.forEach((v,x)=>{if(!v&&(x!==1||y!==1)&&(x!==13||y!==13))spots.push({x,y});}));s.cellsToGet=shuffle(spots,rng).slice(0,3);s.collected=0;
  s.act=a=>{if(!directions[a])return;const [dx,dy]=directions[a],x=s.player.x+dx,y=s.player.y+dy;if(s.cells[y]?.[x]!==0)return;s.player={x,y};const n=s.cellsToGet.findIndex(v=>v.x===x&&v.y===y);if(n>=0){s.cellsToGet.splice(n,1);s.collected++;s.score+=100;}if(x===13&&y===13&&s.collected===3){s.score+=Math.max(50,Math.round(1200-s.time*10));s.finished=true;s.notice='Maze mastered. Power restored!';}};
  s.draw=c=>{text(c,'POWER CELLS '+s.collected+'/3',240,32,18,GOLD);s.cells.forEach((row,y)=>row.forEach((v,x)=>{rect(c,15+x*30,60+y*30,29,29,v?'#28605c':'#101e24');}));s.cellsToGet.forEach(p=>star(c,30+p.x*30,75+p.y*30,10));rect(c,15+13*30,60+13*30,29,29,s.collected===3?GOLD:'#665b39');buddy(c,30+s.player.x*30,75+s.player.y*30,TEAL,.8);};
 }else if(id==='skeeball'){
  s.balls=9;s.ball=null;s.start=null;s.rings=[{x:125,y:110,r:30,points:100},{x:355,y:110,r:30,points:100},{x:240,y:165,r:34,points:50},{x:240,y:245,r:38,points:30},{x:240,y:335,r:43,points:20}];
  s.act=(a,p)=>{if(s.ball||s.balls<=0)return;if(a==='tap'&&p.y>400)s.start=p;if(a==='release'&&s.start){const dy=s.start.y-p.y,dx=p.x-s.start.x;if(dy<15){s.start=null;return;}s.ball={x:240,y:500,tx:clamp(240+dx*1.3,35,445),ty:clamp(490-dy*1.35,60,450),t:0};s.balls--;s.start=null;}if(a==='roll')s.act('release',{x:240,y:210});};
  s.update=dt=>{if(!s.ball)return;s.ball.t+=dt;if(s.ball.t>=.65){const b=s.ball,ring=s.rings.find(r=>Math.hypot(b.tx-r.x,b.ty-r.y)<r.r);const points=ring?.points||10;s.score+=points;effect(s,b.tx,b.ty,'+'+points);s.ball=null;if(!s.balls){s.finished=true;s.notice='Nine rolls. Score banked!';}}};
  s.draw=c=>{text(c,'GOLD ROLL · BALLS '+s.balls,240,32,18,GOLD);rect(c,65,65,350,485,'#2b3838');for(const r of s.rings){circle(c,r.x,r.y,r.r+5,GOLD);circle(c,r.x,r.y,r.r,INK);text(c,''+r.points,r.x,r.y+7,20,GOLD);}rect(c,185,455,110,6,TEAL);if(s.ball){const t=clamp(s.ball.t/.65,0,1);circle(c,240+(s.ball.tx-240)*t,500+(s.ball.ty-500)*t,14*(1-t*.35),WHITE);}else circle(c,240,500,14,WHITE);if(s.start){c.strokeStyle=TEAL;c.lineWidth=3;c.beginPath();c.moveTo(240,500);c.lineTo(s.start.x,s.start.y);c.stroke();}text(c,'SWIPE UP FROM THE BALL',240,550,14,TEAL);};
 }else if(id==='fish'){
  s.net=240;s.fish=[];s.spawn=0;s.missed=0;
  s.act=(a,p)=>{if(a==='tap'||a==='move')s.net=clamp(p.x,45,435);};
  s.update=dt=>{s.net=clamp(s.net+(s.keys.has('right')?1:s.keys.has('left')?-1:0)*300*dt,45,435);s.spawn-=dt;if(s.spawn<=0){s.fish.push({x:240,y:425,vx:rand(-105,105),vy:rand(-380,-310),gold:rng()<.2});s.spawn=rand(.65,1.1);}s.fish.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=240*dt;if(f.vy>0&&f.y>=457&&f.y<=490&&Math.abs(f.x-s.net)<50){f.caught=true;const n=f.gold?50:20;s.score+=n;effect(s,f.x,450,'+'+n);}if(f.y>535){f.caught=true;s.missed++;}});s.fish=s.fish.filter(f=>!f.caught);};
  s.draw=c=>{text(c,'CATCH THE JUMPING FISH',240,32,18,GOLD);circle(c,240,415,65,'#1a4958');rect(c,185,382,110,12,TEAL);s.fish.forEach(f=>{c.fillStyle=f.gold?GOLD:TEAL;c.beginPath();c.ellipse(f.x,f.y,17,10,Math.atan2(f.vy,f.vx),0,7);c.fill();c.beginPath();c.moveTo(f.x-10,f.y);c.lineTo(f.x-25,f.y-10);c.lineTo(f.x-25,f.y+10);c.closePath();c.fill();circle(c,f.x+7,f.y-3,3,INK);});c.strokeStyle=GOLD;c.lineWidth=5;c.beginPath();c.ellipse(s.net,475,48,12,0,0,7);c.stroke();for(let i=-30;i<=30;i+=15){c.beginPath();c.moveTo(s.net+i,475);c.lineTo(s.net+i*.6,515);c.stroke();}text(c,'MISSED '+s.missed,240,550,16,TEAL);};
 }else throw Error('Game not found.');
 const update=s.update,draw=s.draw,act=s.act;
 s.update=dt=>{if(s.finished)return;s.time+=dt;update(dt);s.effects.forEach(e=>{e.left-=dt;e.y-=25*dt;});s.effects=s.effects.filter(e=>e.left>0);};
 s.act=(a,p)=>{if(!s.finished)act(a,p);};
 s.draw=c=>{rect(c,0,0,W,H,INK);draw(c);for(const e of s.effects)text(c,e.label,e.x,e.y,18,GOLD);};
 return s;
}
export function startArcade(canvas,id,{onScore=()=>{},onFinish=()=>{},wordInput,controls}={}){
 const limit=GAMES.find(g=>g.id===id).seconds,model=createArcadeModel(id),ctx=canvas.getContext('2d');canvas.width=W;canvas.height=H;let stopped=false,frame=0,last=performance.now(),lastDraw=0,repeat=0,score=-1,started=performance.now();const held=new Set(),listeners=[];
 const listen=(el,event,fn,opts)=>{el.addEventListener(event,fn,opts);listeners.push(()=>el.removeEventListener(event,fn,opts));};
 const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};};
 listen(canvas,'pointerdown',e=>{e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);model.pointer=point(e);model.act('tap',model.pointer);});
 listen(canvas,'pointermove',e=>{if(model.pointer){model.pointer=point(e);model.act('move',model.pointer);}});
 listen(canvas,'pointerup',e=>{model.act('release',point(e));model.pointer=null;});listen(canvas,'pointercancel',()=>{model.pointer=null;});
 const keyMap={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'pump',Enter:'drop',x:'rotate',X:'rotate'};
 listen(window,'keydown',e=>{if(e.target===wordInput)return;const a=keyMap[e.key];if(!a)return;e.preventDefault();if(!e.repeat)model.act(a);model.keys.add(a);held.add(a);});
 listen(window,'keyup',e=>{const a=keyMap[e.key];model.keys.delete(a);held.delete(a);});listen(window,'blur',()=>{model.keys.clear();held.clear();});
 for(const button of controls?.querySelectorAll('[data-control]')||[]){listen(button,'pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);const a=button.dataset.control;model.act(a);model.keys.add(a);held.add(a);});const release=()=>{model.keys.delete(button.dataset.control);held.delete(button.dataset.control);};listen(button,'pointerup',release);listen(button,'pointercancel',release);}
 if(wordInput){listen(wordInput,'keydown',e=>{if(e.key==='Enter'){e.preventDefault();model.act('word',wordInput.value);wordInput.value='';}});const form=wordInput.closest('form');if(form)listen(form,'submit',e=>{e.preventDefault();model.act('word',wordInput.value);wordInput.value='';wordInput.focus();});wordInput.focus();}
 function loop(now){if(stopped)return;const dt=Math.min(.05,(now-last)/1000);last=now;if(!document.hidden){model.update(dt);model.time=(now-started)/1000;if(model.time>=limit&&!model.finished){model.finished=true;model.notice="Time’s up!";}repeat+=dt;if(repeat>.14){repeat=0;if(['crossing','dig','blocks','maze'].includes(id))for(const a of held)if(directions[a])model.act(a);}
  if(model.score!==score){score=model.score;onScore(score);}if(now-lastDraw>=1000/30){model.draw(ctx);lastDraw=now;}if(model.finished){stopped=true;listeners.forEach(fn=>fn());onFinish(model.notice);return;}}
  frame=requestAnimationFrame(loop);
 }
 model.draw(ctx);frame=requestAnimationFrame(loop);
 return {model,stop(){stopped=true;cancelAnimationFrame(frame);listeners.forEach(fn=>fn());model.keys.clear();}};
}
export function controlsFor(id){
 if(['crossing','dig','maze'].includes(id))return ['up','left','down','right',...(id==='dig'?['pump']:[])];
 if(id==='blocks')return ['left','rotate','right','down','drop'];
 if(id==='pong')return ['up','down'];
 if(['galaxy','fish'].includes(id))return ['left','right'];
 return [];
}
