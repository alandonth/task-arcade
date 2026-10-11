// Display name only: keep the existing Worker, database and storage keys.
export const APP_NAME = 'Force of Focus';
export const GAMES = [
 {id:'stars',name:'Star Scoop',symbol:'star',at:0,seconds:10,description:'A ten-second star-catching sprint.',instructions:'Tap every star you can. You have just 10 seconds!'},
 {id:'memory',name:'Monster Match',symbol:'copy',at:3,seconds:120,description:'Match pairs fast for a bigger score.',instructions:'Tap two cards to find a pair. Finish all six pairs. Faster finishes and fewer guesses earn more points.'},
 {id:'nitrogen',name:'Nitrogen',symbol:'crosshair',at:5,seconds:45,description:'Paintball-powered skeet shooting.',instructions:'Tap the flying discs to splat them. Gold discs score extra. Missed discs break your streak.'},
 {id:'pong',name:'Power Pong',symbol:'rectangle-vertical',at:7,seconds:60,description:'A paddle duel against the machine.',instructions:'Drag your paddle up and down, or use the up/down arrows. Score by getting the ball past the other paddle.'},
 {id:'galaxy',name:'Galaxy Patrol',symbol:'rocket',at:10,seconds:60,description:'Defend the stars from space invaders.',instructions:'Move left and right by dragging or using arrows. Your ship fires automatically. Dodge enemies and their shots.'},
 {id:'typing',name:'Typing Ninja',symbol:'keyboard',at:13,seconds:60,description:'Type the word. Slice the target.',instructions:'Type the displayed word and press Enter. Faster answers build your combo. The phone keyboard works too.'},
 {id:'crossing',name:'Frog Crossing',symbol:'footprints',at:16,seconds:60,description:'Hop through traffic and across the river.',instructions:'Use arrow buttons or keys to hop. Avoid traffic and ride the logs across water to the gold bank.'},
 {id:'dig',name:'Tunnel Tamer',symbol:'pickaxe',at:20,seconds:60,description:'Dig tunnels and pop underground monsters.',instructions:'Move with arrow buttons or keys. Dig through earth, collect gems, and use Pump near a monster. Three pumps pop it!'},
 {id:'blocks',name:'Force Blocks',symbol:'blocks',at:24,seconds:90,description:'Falling blocks. Glowing clear lines.',instructions:'Move and rotate pieces to fill rows. Use Drop to place a piece instantly. Clearing several rows at once scores more.'},
 {id:'maze',name:'Neon Maze',symbol:'route',at:28,seconds:90,description:'Find your way through a new maze.',instructions:'Use arrow buttons or keys. Collect three power cells, then reach the gold exit. Every maze is different.'},
 {id:'skeeball',name:'Gold Roll',symbol:'circle-dot',at:33,seconds:60,description:'Nine balls. One golden high score.',instructions:'Swipe upward from the ball to roll. Your angle aims; swipe length changes power. Hit the rings to score. Nine balls per round.'},
 {id:'fish',name:'Bowl Bounce',symbol:'fish',at:38,seconds:45,description:'Catch jumping fish before they fall.',instructions:'Slide your net by dragging or using arrows. Catch fish as they fall back down. Gold fish score extra.'}
];
export function matchScore(seconds,turns){return Math.max(100,Math.round(2500-seconds*18-Math.max(0,turns-6)*35));}
