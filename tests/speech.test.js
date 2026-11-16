import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encouragementFor} from '../public/config.js';
test('on-screen encouragement prioritizes a custom reminder and the next unchecked step',()=>{
 const task={title:'Feed the dog',category:'chores',steps:['Fill the food bowl','Check the water'],checked:[]};
 assert.equal(encouragementFor({...task,prompt:'Use the blue scoop.'}),'Use the blue scoop.');
 assert.equal(encouragementFor(task),'Next little step: Fill the food bowl');
 assert.equal(encouragementFor({...task,checked:[0]}),'Next little step: Check the water');
 assert.equal(encouragementFor({...task,checked:[0,1]}),'Keep going with Feed the dog. You’re making progress!');
 assert.equal(encouragementFor({title:'Math',category:'homework'}),'Keep working on Math. One question at a time.');
});
