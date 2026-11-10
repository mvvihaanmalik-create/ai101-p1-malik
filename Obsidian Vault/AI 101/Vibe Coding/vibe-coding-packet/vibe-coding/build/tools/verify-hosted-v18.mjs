// Compare served bytes for every changed runtime asset, with bounded concurrency.
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
const site=new URL(process.argv[2]),manifest=JSON.parse(await readFile(new URL('../.deploy/manifest-current.json',import.meta.url)));
const files=manifest.filter(x=>x.file.startsWith('src/')||/^assets\/(masters|proxies|surfaces)-v18\//.test(x.file)||x.file==='index.html');
const results=[];let cursor=0;
async function worker(){while(cursor<files.length){
 const item=files[cursor++];let last;
 for(let i=0;i<3;i++){try{
 const r=await fetch(new URL(item.file,site),{signal:AbortSignal.timeout(20000)}),bytes=Buffer.from(await r.arrayBuffer());
 last={file:item.file,status:r.status,matched:r.ok&&createHash('sha256').update(bytes).digest('hex')===item.sha256};
 if(last.matched)break;
 }catch(e){last={file:item.file,matched:false,error:e.message};}}
 results.push(last);
}}
await Promise.all(Array.from({length:4},worker));
const passed=results.every(x=>x.matched),report={site:site.href,passed,verified:results.filter(x=>x.matched).length,total:files.length,failed:results.filter(x=>!x.matched)};
console.log(JSON.stringify(report));await writeFile(new URL('../../build-record/tests/visual-18/'+(site.hostname==='room-zero-ashy.vercel.app'?'alias':'fixed')+'-verification.json',import.meta.url),JSON.stringify(report,null,2));
if(!passed)process.exitCode=1;
