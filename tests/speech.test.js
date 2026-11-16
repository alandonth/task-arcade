import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deviceVoices,resolveVoice,voiceIdentity,say} from '../public/speech.js';
const a={voiceURI:'a',name:'A voice',lang:'en-US',default:true},b={voiceURI:'b',name:'B voice',lang:'en-GB'},fr={voiceURI:'c',name:'French',lang:'fr-FR'};
class Utterance{constructor(text){this.text=text;}}
test('real voice list filters languages, deduplicates entries, and handles unsupported browsers',()=>{assert.deepEqual(deviceVoices({getVoices:()=>[b,fr,a,a]}),[a,b]);assert.deepEqual(deviceVoices(null),[]);assert.deepEqual(deviceVoices({getVoices(){throw Error();}}),[]);});
test('selection uses the real voice object at normal pitch and speed',()=>{let utterance,canceled=0;const synth={getVoices:()=>[a,b],cancel(){canceled++;},speak(u){utterance=u;}};assert.equal(say(synth,'Keep going',voiceIdentity(b),{Utterance}),true);assert.equal(utterance.voice,b);assert.equal(utterance.lang,'en-GB');assert.equal(utterance.pitch,1);assert.equal(utterance.rate,1);assert.equal(canceled,1);});
test('a saved voice on a different device falls back to the local default',()=>{assert.equal(resolveVoice([a,b],{uri:'gone',name:'Gone',lang:'en-US'}),a);assert.equal(resolveVoice([a,b],{uri:'changed-uri',name:b.name,lang:b.lang}),b);});
test('default speech still works with no loaded voice list; preview reports genuine failures',()=>{let u,errors=0;const synth={getVoices:()=>[],cancel(){},speak(v){u=v;}};assert.equal(say(synth,'Hello',null,{Utterance,onError:()=>errors++}),true);assert.equal(u.lang,'en-US');assert.equal(u.voice,undefined);u.onerror({error:'canceled'});assert.equal(errors,0);u.onerror({error:'voice-unavailable'});assert.equal(errors,1);assert.equal(say(null,'Hi',null,{Utterance}),false);});
