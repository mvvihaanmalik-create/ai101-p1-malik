import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const connection=JSON.parse((await fs.readFile(path.join(root,'.local/connection.json'),'utf8')).replace(/^\uFEFF/,''));
const token=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(root,'scripts/read-token.ps1')],{encoding:'utf8',windowsHide:true,env:{...process.env,PSModulePath:undefined}}).trim();
async function request(route,body){const response=await fetch(new URL(route,connection.siteUrl),{headers:{'OAI-Sites-Authorization':'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})});if(!response.ok)throw Error(route+': '+response.status);return response.json();}
const library=await request('/api/library');
if(process.argv.includes('--write-check'))await request('/api/references',{references:[library.references[0]]});
const reread=await request('/api/library');
const context=await request('/api/projects');
console.log(JSON.stringify({references:reread.references.length,projects:context.projects.map(p=>p.id),generatedAt:context.generatedAt,writeReadVerified:process.argv.includes('--write-check')&&reread.references.length===library.references.length}));
