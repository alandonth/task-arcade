import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialState,finishTask,DEFAULT_SETTINGS,elapsed,settlePlay,validateSettings} from '../src/domain.js';
function fixture(){const s=initialState();s.tasks=[{id:'a',title:'Dog',minutes:5}];s.active={taskId:'a',startedAt:1000,elapsed:0};return s;}
test('early completion gives base plus bonus; cannot award twice',()=>{const s=fixture();assert.deepEqual(finishTask(s,DEFAULT_SETTINGS,61000),{early:true,reward:6});assert.equal(s.energy,360);assert.equal(s.points,12);assert.equal(s.completed,1);assert.throws(()=>finishTask(s,DEFAULT_SETTINGS,62000));});
test('overtime still earns base reward',()=>{const s=fixture();finishTask(s,DEFAULT_SETTINGS,400000);assert.equal(s.energy,300);assert.equal(s.points,10);});
test('pauses do not consume task time',()=>assert.equal(elapsed({elapsed:12000,startedAt:null},999999),12000));
test('play charges actual time and caps disconnected sessions at lease',()=>{const s=initialState();s.energy=300;s.play={startedAt:1000,leaseUntil:16000,earned:true};settlePlay(s,999999);assert.equal(s.energy,285);assert.equal(s.play,null);});
test('unlimited play does not drain stored energy',()=>{const s=initialState();s.energy=100;s.play={startedAt:1000,earned:false};settlePlay(s,10000);assert.equal(s.energy,100);});
test('settings reject invalid reward values',()=>{assert.throws(()=>validateSettings({...DEFAULT_SETTINGS,rewardMinutes:-1}));assert.throws(()=>validateSettings({...DEFAULT_SETTINGS,playMode:'fake'}));});
