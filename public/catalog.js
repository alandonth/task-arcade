export const ANIMALS=[{id:'frog',name:'Frog',color:'#83c96b'},{id:'fox',name:'Fox',color:'#f29b50'},{id:'cat',name:'Cat',color:'#c2a0ec'},{id:'bear',name:'Bear',color:'#b98b69'}];
export const ITEMS=[
 {id:'hat-none',slot:'hat',name:'No hat',price:0},{id:'cap',slot:'hat',name:'Explorer cap',price:20},{id:'crown',slot:'hat',name:'Paper crown',price:35},{id:'wizard',slot:'hat',name:'Wizard hat',price:45},
 {id:'shirt-basic',slot:'shirt',name:'Sunny tee',price:0},{id:'shirt-space',slot:'shirt',name:'Space crew',price:25},{id:'shirt-stripe',slot:'shirt',name:'Rainbow stripes',price:30},{id:'shirt-lava',slot:'shirt',name:'Lava club',price:35},
 {id:'accessory-none',slot:'accessory',name:'No accessory',price:0},{id:'glasses',slot:'accessory',name:'Big round glasses',price:20},{id:'bowtie',slot:'accessory',name:'Party bow tie',price:25},{id:'satchel',slot:'accessory',name:'Adventure bag',price:40}
];
export const STARTER_ITEMS=['hat-none','shirt-basic','accessory-none'];
export function wardrobeFor(state={},legacy=''){
 const old={'🐸':'frog','🦊':'fox','🐱':'cat','🐼':'bear','🐶':'bear','🤖':'cat','🦄':'cat','🐙':'frog'};
 const saved=state.wardrobe||{};
 const owned=[...new Set([...STARTER_ITEMS,...(saved.owned||[]).filter(id=>ITEMS.some(i=>i.id===id))])];
 const equipped={hat:'hat-none',shirt:'shirt-basic',accessory:'accessory-none'};
 for(const slot of Object.keys(equipped))if(ITEMS.some(i=>i.id===saved.equipped?.[slot]&&i.slot===slot)&&owned.includes(saved.equipped[slot]))equipped[slot]=saved.equipped[slot];
 return {animal:ANIMALS.some(a=>a.id===saved.animal)?saved.animal:old[legacy]||'frog',owned,equipped};
}
export function wardrobeAction(state,action,b){
 state.wardrobe=wardrobeFor(state);const w=state.wardrobe;
 if(action==='animal'){if(!ANIMALS.some(a=>a.id===b.animal))throw Error('Choose an animal.');w.animal=b.animal;return;}
 const item=ITEMS.find(i=>i.id===b.itemId);if(!item)throw Error('Item not found.');
 if(action==='buyItem'&&!w.owned.includes(item.id)){if(state.points<item.price)throw Error('Finish more tasks to earn points for this item.');state.points-=item.price;w.owned.push(item.id);}
 if(!w.owned.includes(item.id))throw Error('Unlock this item first.');w.equipped[item.slot]=item.id;
}
