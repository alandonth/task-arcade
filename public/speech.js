// Real voices supplied by the browser/OS. No synthetic "styles" or remote service.
export function voiceIdentity(voice){return {uri:voice.voiceURI||'',name:voice.name,lang:voice.lang};}
export function voiceKey(voice){return JSON.stringify([voice.voiceURI||voice.uri||'',voice.name,voice.lang]);}
export function deviceVoices(synth){
 try{
  const seen=new Set();
  return (synth?.getVoices?.()||[]).filter(v=>{
   if(typeof v.name!=='string'||!/^en(?:[-_]|$)/i.test(v.lang||''))return false;
   const key=voiceKey(v);if(seen.has(key))return false;seen.add(key);return true;
  }).sort((a,b)=>Number(b.default)-Number(a.default)||a.name.localeCompare(b.name)||a.lang.localeCompare(b.lang));
 }catch{return [];}
}
export function resolveVoice(voices,preference){
 if(preference){
  const match=voices.find(v=>v.voiceURI===preference.uri&&v.name===preference.name&&v.lang===preference.lang)
   ||voices.find(v=>v.name===preference.name&&v.lang===preference.lang);
  if(match)return match;
 }
 return voices.find(v=>v.default)||voices.find(v=>v.lang.toLowerCase()==='en-us')||voices[0]||null;
}
export function say(synth,message,preference,{Utterance=globalThis.SpeechSynthesisUtterance,onError=()=>{}}={}){
 if(!synth||typeof Utterance!=='function')return false;
 try{
  synth.cancel();const utterance=new Utterance(message),voice=resolveVoice(deviceVoices(synth),preference);
  if(voice){utterance.voice=voice;utterance.lang=voice.lang;}else utterance.lang='en-US';
  utterance.rate=1;utterance.pitch=1;
  utterance.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))onError(e);};
  synth.speak(utterance);return true;
 }catch{onError();return false;}
}
