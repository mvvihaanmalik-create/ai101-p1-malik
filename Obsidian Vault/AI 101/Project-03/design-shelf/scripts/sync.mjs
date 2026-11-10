import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {watchProjectContext} from './context-watch.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const connection=JSON.parse((await fs.readFile(path.join(root,'.local/connection.json'),'utf8')).replace(/^\uFEFF/,''));
const site=new URL(connection.siteUrl);if(site.protocol!=='https:'||!site.hostname.endsWith('.chatgpt.site'))throw new Error('Unsupported private site URL.');
const token=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(root,'scripts/read-token.ps1')],{encoding:'utf8',windowsHide:true,env:{...process.env,PSModulePath:undefined}}).trim();
const log=message=>console.log(new Date().toISOString()+' '+message);
let lastData,lastError;async function push(data){lastData=data;try{const response=await fetch(new URL('/api/projects',site),{method:'POST',headers:{'Content-Type':'application/json','OAI-Sites-Authorization':'Bearer '+token},body:JSON.stringify(data)});if(!response.ok)throw new Error('Site returned '+response.status);const result=await response.json();lastError=null;log(`Synced ${result.updated} project summaries.`);}catch(error){lastError=error.message;log('Note sync needs attention: '+error.message);}}
const monitor=await watchProjectContext({onUpdate:push,onError:e=>log('Notes: '+e.message)});
const retry=setInterval(()=>{if(lastError&&lastData)push(lastData);},60000);
await fs.writeFile(path.join(root,'.local/sync.pid'),String(process.pid));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{monitor.close();clearInterval(retry);process.exit();});
log('Watching selected Obsidian project notes.');
