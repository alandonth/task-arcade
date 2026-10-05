import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
const configPath=new URL('../wrangler.jsonc',import.meta.url);
let config=JSON.parse(readFileSync(configPath,'utf8'));
const wrangler=process.platform==='win32'?'node_modules/.bin/wrangler.cmd':'node_modules/.bin/wrangler';
function run(args,options={}){return execFileSync(wrangler,args,{encoding:'utf8',...options});}
if(config.d1_databases[0].database_id==='REPLACE_WITH_DATABASE_ID'){
 console.log('Creating the app database…');
 const result=run(['d1','create',config.d1_databases[0].database_name]);
 const id=result.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];
 if(!id)throw Error('Could not find the database ID. Run npx wrangler d1 list and paste its ID into wrangler.jsonc.');
 config.d1_databases[0].database_id=id;writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');
}
run(['d1','migrations','apply',config.d1_databases[0].database_name,'--remote'],{stdio:'inherit'});
console.log('Ready. Run npm run deploy to publish the app.');
