import {readFileSync,writeFileSync} from 'node:fs';
const name=process.argv[2]?.trim();if(!name||name.length>60)throw Error('Usage: npm run rename -- "Your App Name" (1–60 characters)');
const config=new URL('../public/config.js',import.meta.url);let s=readFileSync(config,'utf8');s=s.replace(/export const APP_NAME = .*;/,'export const APP_NAME = '+JSON.stringify(name)+';');writeFileSync(config,s);
const manifest=new URL('../public/manifest.webmanifest',import.meta.url);const m=JSON.parse(readFileSync(manifest,'utf8'));m.name=name;m.short_name=name;writeFileSync(manifest,JSON.stringify(m,null,2)+'\n');
const html=new URL('../public/index.html',import.meta.url);const escaped=name.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));writeFileSync(html,readFileSync(html,'utf8').replace(/<title>.*?<\/title>/,`<title>${escaped}</title>`));
console.log('Updated app name, browser title, and Home Screen name. Redeploy to publish.');
