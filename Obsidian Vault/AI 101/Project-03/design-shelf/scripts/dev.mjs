import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {watchProjectContext} from './context-watch.mjs';
import {refreshAssets} from './refresh-assets.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const storage=path.join(root,'.local/objects');await fs.mkdir(storage,{recursive:true});
class LocalBucket {
  async list({prefix=''}){const names=await fs.readdir(storage);return {objects:names.map(name=>({key:decodeURIComponent(name)})).filter(o=>o.key.startsWith(prefix)&&!o.key.endsWith('.tmp'))};}
  async get(key){try{const value=await fs.readFile(path.join(storage,encodeURIComponent(key)),'utf8');return {etag:createHash('sha256').update(value).digest('hex'),json:async()=>JSON.parse(value)};}catch(error){if(error.code==='ENOENT')return null;throw error;}}
  async put(key,value,options={}){const before=await this.get(key);if(options.onlyIf?.etagMatches && options.onlyIf.etagMatches!==before?.etag)return null;const file=path.join(storage,encodeURIComponent(key)),temp=file+'.tmp';await fs.writeFile(temp,value);await fs.rename(temp,file);return {etag:createHash('sha256').update(value).digest('hex')};}
}
const bucket=new LocalBucket();const monitor=await watchProjectContext({onUpdate:async data=>{await bucket.put('context/projects.json',JSON.stringify({...data,syncedAt:new Date().toISOString()}));console.log(`Notes connected: ${data.projects.length} projects.`);},onError:e=>console.error('Notes:',e.message)});
let worker,version;
async function getWorker(){const file=path.join(root,'dist/server/index.js'),stat=await fs.stat(file);if(stat.mtimeMs!==version){version=stat.mtimeMs;worker=(await import(pathToFileURL(file).href+'?v='+version)).default;}return worker;}
let collectionJob;
const collect=force=>collectionJob||=(Promise.resolve().then(async()=>{let cloud=false;try{cloud=JSON.parse(await fs.readFile(path.join(root,'../workshop/.local/cloud-assets.json'),'utf8')).enabled===true;}catch{}return !force&&cloud?{skipped:true,cloud:true}:refreshAssets({force});}).finally(()=>{collectionJob=null;}));
const server=http.createServer(async(req,res)=>{try{let body; if(!['GET','HEAD'].includes(req.method)){const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>750000)throw new Error('Request too large');chunks.push(chunk);}body=Buffer.concat(chunks);}
if(req.url==='/api/collect-assets'&&req.method==='POST'){
  if(req.headers.origin!=='http://127.0.0.1:'+port||req.headers.host!=='127.0.0.1:'+port)throw Error('Open the local Shelf to refresh sources.');
  const result=await collect(true);res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(result));return;
}
const headers={...req.headers,'oai-authenticated-user-id':'local-owner'};const request=new Request('http://127.0.0.1:'+port+req.url,{method:req.method,headers,...(body?{body,duplex:'half'}:{})});const response=await(await getWorker()).fetch(request,{BUCKET:bucket},{waitUntil:p=>p.catch(console.error)});const localHeaders=Object.fromEntries(response.headers);if(localHeaders['content-security-policy'])localHeaders['content-security-policy']=localHeaders['content-security-policy'].replace("frame-ancestors 'self'", "frame-ancestors 'self' http://127.0.0.1:4190");res.writeHead(response.status,localHeaders);if(response.body){for await(const chunk of response.body)res.write(chunk);}res.end();}catch(error){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}));}});
const port=Number(process.env.PORT||8917);server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
const catchUp=setInterval(()=>collect(false).catch(e=>console.error('Asset refresh:',e.message)),3600000);catchUp.unref();
void collect(false).catch(e=>console.error('Asset refresh:',e.message));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{clearInterval(catchUp);monitor.close();server.close(()=>process.exit());});
