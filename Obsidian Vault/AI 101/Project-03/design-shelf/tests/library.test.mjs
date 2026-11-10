import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalUrl,inWindow,normalizeReference,referenceFit,selectReferences,dedupeReferences} from '../src/core.mjs';
import worker from '../dist/server/index.js';
const now=new Date('2026-10-20T12:00:00Z');
const raw={id:'sample',title:'An actual source',publisher:'Publisher',url:'https://example.com/post?utm_source=x',publishedAt:'2026-10-01',categories:['plugins'],focus:['UX'],tags:['keyboard'],summary:'A source example.',preview:{type:'none'}};
test('reference dates are original and unknown dates stay outside recent view',()=>{const r=normalizeReference({...raw,publishedAt:null},now);assert.equal(r.publishedAt,null);assert.equal(r.evergreen,true);assert.equal(inWindow(r,now),false);assert.throws(()=>normalizeReference({...raw,publishedAt:'2027-01-01'},now));});
test('source URLs dedupe tracking but do not allow private endpoints',()=>{assert.equal(canonicalUrl(raw.url),'https://example.com/post');for(const url of ['http://example.com','https://127.0.0.1/','https://192.168.1.1/','https://local.internal/','https://user:pass@example.com/'])assert.throws(()=>canonicalUrl(url));});
test('a plugin context ranks keyboard plugins over unrelated game art',()=>{const plugin=normalizeReference(raw,now);const game=normalizeReference({...raw,id:'game',url:'https://example.com/game',categories:['games'],tags:['3d']},now);const p={types:['plugins'],tags:['keyboard'],contextKeywords:[],focus:'Improve commands'};assert(referenceFit(plugin,p).score>referenceFit(game,p).score);assert.deepEqual(selectReferences([game,plugin],{project:p,now}).map(r=>r.id),['sample']);});
test('saved older references remain available after ninety days',()=>{const r=normalizeReference({...raw,publishedAt:'2026-01-01'},now);assert.equal(selectReferences([r],{section:'all',now}).length,0);assert.equal(selectReferences([r],{section:'saved',savedIds:['sample'],now}).length,1);});
class Bucket{values=new Map();async get(k){const x=this.values.get(k);return x?{etag:String(x.version),json:async()=>structuredClone(x.value)}:null;}async put(k,value,options={}){const old=this.values.get(k);if(options.onlyIf&&options.onlyIf.etagMatches!==String(old?.version))return null;this.values.set(k,{version:(old?.version||0)+1,value:JSON.parse(value)});return {etag:String((old?.version||0)+1)};}}
const call=(env,path,body)=>worker.fetch(new Request('https://shelf.test'+path,{method:body?'POST':'GET',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})}),env,{});
test('reference update persists and repeated imports dedupe canonical source URLs',async()=>{const env={BUCKET:new Bucket()};let response=await call(env,'/api/references',{references:[{...raw,publishedAt:null}]});assert.equal(response.status,200);response=await call(env,'/api/references',{references:[{...raw,publishedAt:null,url:'https://example.com/post?utm_medium=second'}]});assert.equal((await response.json()).added,0);const library=await(await call(env,'/api/library')).json();assert.equal(library.references.filter(r=>r.url==='https://example.com/post').length,1);});
test('project sync keeps only allowed summaries and rejects stale snapshots',async()=>{const env={BUCKET:new Bucket()};let response=await call(env,'/api/projects',{generatedAt:'2026-10-20',projects:[{id:'p',title:'Project',pitch:'Goal',password:'private',body:'private note text',sessions:[1]}]});assert.equal(response.status,200);const data=await(await call(env,'/api/projects')).json();assert.equal(data.projects[0].password,undefined);assert.equal(data.projects[0].body,undefined);response=await call(env,'/api/projects',{generatedAt:'2026-10-19',projects:[]});assert.equal(response.status,400);});
test('saved references persist and unknown IDs are excluded',async()=>{const env={BUCKET:new Bucket()};const library=await(await call(env,'/api/library')).json();const id=library.references[0].id;await call(env,'/api/saved',{saved:[{referenceId:id,projectId:'p'}, {referenceId:'missing'}]});assert.deepEqual((await(await call(env,'/api/saved')).json()).saved.map(s=>s.referenceId),[id]);});
test('write requests reject foreign browser origins',async()=>{const response=await worker.fetch(new Request('https://shelf.test/api/projects',{method:'POST',headers:{Origin:'https://other.test','Content-Type':'application/json'},body:'{}'}),{BUCKET:new Bucket()},{});assert.equal(response.status,403);});
test('media endpoint refuses unlisted source URLs',async()=>{const response=await call({BUCKET:new Bucket()},'/api/media/not-a-reference?url=https://localhost/');assert.equal(response.status,404);});


test('the same work and its demo merge without losing saved aliases',()=>{
 const a=normalizeReference({...raw,id:'case-study',url:'https://example.com/story',liveUrl:'https://maker.com/demo'},now);
 const b=normalizeReference({...raw,id:'demo',url:'https://www.maker.com/demo?ref=social',liveUrl:null,title:'Working demo'},now);
 const list=dedupeReferences([a,b]);assert.equal(list.length,1);assert.ok(list[0].aliases.includes('demo'));
 assert.equal(selectReferences(list,{section:'saved',savedIds:['demo'],now}).length,1);
});
test('verified evergreen assets stay useful while unlicensed demos never enter assets',()=>{
 const a=normalizeReference({...raw,id:'asset',url:'https://example.com/icons',publishedAt:null,kind:'asset',assetType:'icons',license:{id:'MIT',url:'https://example.com/license',verified:true,free:true,openSource:true,commercial:true}},now);
 const demo=normalizeReference({...raw,id:'demo',url:'https://example.com/demo',title:'Unlicensed demo'},now);
 assert.deepEqual(selectReferences([a,demo],{section:'all',collection:'assets',assetType:'icons',license:'open',now}).map(r=>r.id),['asset']);
 assert.equal(selectReferences([a],{section:'all',collection:'assets',period:'recent',now}).length,0);
 assert.equal(selectReferences([a],{section:'all',collection:'assets',license:'cc0',now}).length,0);
});
test('aliases saved twice collapse to one project board item',async()=>{
 const env={BUCKET:new Bucket()};await call(env,'/api/references',{references:[{...raw,id:'original',url:'https://example.com/work',liveUrl:'https://example.com/play'},{...raw,id:'old-alias',url:'https://example.com/play',title:'Play the demo'}]});
 await call(env,'/api/saved',{saved:[{referenceId:'original',projectId:'p'},{referenceId:'old-alias',projectId:'p'}]});
 const saved=(await(await call(env,'/api/saved')).json()).saved;assert.equal(saved.length,1);assert.equal(saved[0].referenceId,'original');
});
