// Compare the bytes served at a fixed release or public alias with the staged, runtime-only files.
import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const base=new URL(process.argv[2]);if(base.protocol!=='https:'||!base.hostname.endsWith('.vercel.app'))throw Error('Expected project deployment URL');
const manifest=JSON.parse(await readFile(new URL('../.deploy/manifest-current.json',import.meta.url),'utf8'));
const root=new URL('../',import.meta.url),meta=JSON.parse(await readFile(new URL('assets/hotel-v15.json',root)));
const files=['index.html','src/main.js','src/character-encounters.js','src/passage-loop.js','src/night-route.js','assets/hotel-v15.json','assets/porcelain-v15.glb',...[2,4,6,20,21,22].map(i=>'assets/'+meta.cameras[i].plate)];
const results=await Promise.all(files.map(async file=>{const req=await fetch(new URL(file,base));const bytes=Buffer.from(await req.arrayBuffer());const sha256=createHash('sha256').update(bytes).digest('hex');return {file,status:req.status,matches:manifest.find(x=>x.file===file)?.sha256===sha256,sha256};}));
console.log(JSON.stringify({base:base.href,verified:results.filter(x=>x.matches).length,total:results.length}));await writeFile(new URL('../../build-record/tests/repairs-15/'+(base.hostname==='room-zero-ashy.vercel.app'?'alias':'fixed')+'-verification.json',import.meta.url),JSON.stringify({base:base.href,results},null,2));assert.ok(results.every(r=>r.status===200&&r.matches));
