import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createApp} from '../server.mjs';
import {hostedOrigin} from '../hosted-bridge.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const runtime=fs.readFileSync(new URL('../scripts/cloud-runtime.js',import.meta.url),'utf8');
const project=id=>({id,title:id,goal:id+' summary goal',pitch:id+' summary',next:'Review a small test',changed:'',folder:'private-folder',sourceNote:'private-note.md',rawBody:'PRIVATE NOTE BODY',tags:[],types:['apps'],platform:['Web'],gates:{known:true,approved:5,total:5}});
async function fixture(t){
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'workshop-hosted-test-'));let saved=[],agentCalls=0;
  const reference={id:'reference-one',title:'Sample source',url:'https://example.com/reference',publisher:'Sample',kind:'inspiration'};
  const library={library:async()=>({references:[reference]}),api:async()=>({saved}),save:async(projectId,referenceId,keep)=>{saved=saved.filter(s=>s.projectId!==projectId||s.referenceId!==referenceId);if(keep)saved.push({projectId,referenceId,savedAt:new Date().toISOString()});}};
  const runner={connected:true,model:'fixture',close(){},async run(){agentCalls++;return {reply:'Fixture reply',options:[],sources:[],files:[],checks:[]};}};
  const app=createApp({root,local:path.join(temp,'state'),runs:path.join(temp,'runs'),runner,shelf:library,projectLoader:async()=>({projects:[project('alpha'),project('beta')],activeProjectId:'alpha'})});
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+app.server.address().port;
  t.after(async()=>{await new Promise(resolve=>app.server.close(resolve));assert.equal(path.dirname(temp),os.tmpdir());assert.ok(path.basename(temp).startsWith('workshop-hosted-test-'));fs.rmSync(temp,{recursive:true,force:true});});
  async function request(route,{body,token,origin=hostedOrigin,method}={}){return fetch(base+route,{method:method||(body?'POST':'GET'),headers:{origin,...(token?{'x-bridge-token':token}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});}
  function client(pathname='/',parent){
    const window={fetch:async(input,options={})=>{const url=new URL(typeof input==='string'?input:input.url,hostedOrigin);if(url.origin==='http://127.0.0.1:4190')return fetch(base+url.pathname,{...options,headers:{...options.headers,origin:hostedOrigin}});if(url.pathname==='/shelf/library.json')return new Response(JSON.stringify({references:[reference]}));throw Error('Unexpected transport');}};
    window.addEventListener=()=>{};
    const context=vm.createContext({window,parent:parent||window,location:{origin:hostedOrigin,pathname},URL,Response,console});vm.runInContext(runtime,context);
    return {window,get:async route=>(await window.fetch(route)).json(),post:async(route,body)=>{const response=await window.fetch(route,{method:'POST',body:JSON.stringify(body)});return {status:response.status,data:await response.json()};}};
  }
  return {app,request,client,get agentCalls(){return agentCalls;}};
}

test('hosted bridge shares summaries only with the approved origin and selected-project token',async t=>{
  const f=await fixture(t);
  assert.equal((await f.request('/bridge/catalog',{origin:'https://other.example'})).status,403);
  assert.equal((await f.request('/api/state')).status,403);
  assert.equal((await f.request('/bridge/notes/alpha')).status,404);
  assert.equal((await f.request('/bridge/project/alpha')).status,403);
  const catalog=await(await f.request('/bridge/catalog')).json();assert.deepEqual(Object.keys(catalog.projects[0]).sort(),['id','title']);
  const selected=await(await f.request('/bridge/select',{body:{id:'alpha'}})).json();
  assert.equal(selected.project.folder,undefined);assert.equal(selected.project.rawBody,undefined);assert.equal(selected.run.sourceSnapshot,undefined);
  assert.equal((await f.request('/bridge/project/beta',{token:selected.token})).status,403);
  assert.equal((await f.request('/bridge/project/alpha',{token:selected.token})).status,200);
});

test('hosted commands preserve the goal, route and reference approval stops',async t=>{
  const f=await fixture(t),c=f.client();await c.get('/api/state');let s=(await c.get('/api/project/alpha')).run;
  const action=async(action,extra={})=>{const response=await c.post('/api/project/alpha/action',{action,revision:s.revision,...extra});if(response.data.run)s=response.data.run;return response;};
  assert.equal((await action('approve',{gate:1})).status,409);
  assert.equal((await c.post('/api/project/alpha/run',{role:'creative',prompt:'Choose a direction',revision:s.revision})).status,409);
  await action('goal',{goal:'Build a sample counter'});await action('approve',{gate:0});
  await action('selection',{field:'refs',refs:['reference-one']});
  assert.equal((await c.post('/api/project/alpha/run',{role:'creative',prompt:'Use the shortlist',revision:s.revision})).status,409);
  await action('approve-references');assert.deepEqual(s.referenceApproval.ids,['reference-one']);
  assert.equal((await action('approve',{gate:1})).status,409);
  assert.equal(s.approvals.filter(Boolean).length,1);assert.equal(f.agentCalls,0);
});

test('all three hosted runtimes share selected context, boards and cycle progress',async t=>{
  const f=await fixture(t),workshop=f.client(),shelf=f.client('/shelf/',workshop.window),quest=f.client('/ideaquest/',workshop.window);
  await workshop.get('/api/state');await workshop.get('/api/project/alpha');
  assert.equal((await shelf.get('/api/projects')).activeProjectId,'alpha');assert.equal((await quest.get('/api/projects')).activeProjectId,'alpha');
  let s=(await workshop.get('/api/project/alpha')).run;
  let response=await workshop.post('/api/project/alpha/action',{action:'goal',revision:s.revision,goal:'An isolated sample goal'});s=response.data.run;
  response=await workshop.post('/api/project/alpha/action',{action:'approve',gate:0,revision:s.revision});s=response.data.run;
  assert.equal((await quest.get('/api/projects')).projects.find(p=>p.id==='alpha').gates[0],'approved');
  await shelf.post('/api/saved',{saved:[{projectId:'alpha',referenceId:'reference-one'}]});assert.equal((await workshop.get('/api/library')).saved.length,1);
  await workshop.get('/api/project/beta');assert.equal((await shelf.get('/api/projects')).activeProjectId,'beta');assert.equal((await quest.get('/api/projects')).activeProjectId,'beta');
  assert.equal((await shelf.get('/api/saved')).saved.length,0);assert.equal((await quest.get('/api/projects')).projects.find(p=>p.id==='beta').gates[0],'active');
  await workshop.get('/api/project/alpha');assert.equal((await shelf.get('/api/saved')).saved.length,1);
  assert.equal((await workshop.get('/api/project/alpha')).run.approvals.filter(Boolean).length,1);assert.equal((await workshop.get('/api/project/beta')).run.approvals.filter(Boolean).length,0);
});
