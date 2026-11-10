import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {extractProjects} from '../design-shelf/scripts/context.mjs';
import {createStore,need,clean,hash,stamp,Problem,validateFiles,fileNames} from './store.mjs';
import {roles,instructions} from './roles.mjs';
import {CodexRunner} from './codex.mjs';
import {createShelf} from './shelf.mjs';
import {selectReferences} from '../design-shelf/src/core.mjs';
import {createHostedBridge,runSummary} from './hosted-bridge.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
export function syntaxChecks(files){const checks=[];for(const f of files){const scripts=f.path.endsWith('.js')?[f.content]:f.path.endsWith('.html')?[...f.content.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(m=>!m[1].includes('src=')&&!/application\/(ld\+)?json/.test(m[1])).map(m=>m[2]):[];for(const [i,script] of scripts.entries()){const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:script,encoding:'utf8',windowsHide:true,timeout:10000,maxBuffer:100000});checks.push({name:`JavaScript syntax: ${f.path}${scripts.length>1?' #'+(i+1):''}`,status:result.status===0?'pass':'fail',evidence:result.status===0?'Node parsed this script. Behavior was not executed.':String(result.stderr||result.error?.message||'Syntax check failed.').slice(0,2000)});}}return checks.length?checks:[{name:'Prototype files',status:'pass',evidence:'No JavaScript was present. No runtime behavior was tested.'}];}

export function createApp({root=path.resolve(here,'../..'),local,runs,runner,projectLoader,shelf}={}){
  const store=createStore({root,local,runs}),engine=runner||new CodexRunner(path.join(store.local,'agent-workspace')),library=shelf||createShelf(root);
  const load=projectLoader||(()=>extractProjects({vaultRoot:root}));const token=randomBytes(32).toString('hex'),active=new Map();let connecting=false;
  const getProject=async id=>{const p=(await load()).projects.find(p=>p.id===id);need(p,'Project not found.',404);return p;};
  const view=p=>{const s=store.get(p);return {...s,contextChanged:s.sourceStamp!==stamp(p),journalPath:`Project-03/workshop-runs/${p.id}/${s.cycle}/run.md`};};
  function validateRun(p,s,role){
    need(Object.hasOwn(roles,role),'Unknown agent.',400);need(!s.paused&&!s.decision,'Resume this run or start a new cycle.');
    if(role!=='chief')need(s.approvals[0],'Approve the goal before handing it to an agent.');
    const failed=s.audit?.checks.some(c=>c.status==='fail')||s.artifact?.checks.some(c=>c.status==='fail');
    if(failed&&role!=='chief')need(role==='programmer'&&s.fixAuthorized,'A required check failed. Request a fix or revisit the plan.');
    if(role==='creative'&&s.refs.length)need(s.referenceApproval?.cycle===s.cycle&&s.referenceApproval?.sourceStamp===stamp(p)&&s.referenceApproval.ids.join('|')===s.refs.join('|'),'Approve your reference shortlist in Pip before handing it to Creative Partner.');
    if(role==='programmer')need(s.approvals[1],'Approve the direction, route, and small test before building.');
    if(role==='auditor')need(s.artifact&&!s.pending,'Apply the current prototype before the audit.');
    need(s.sourceStamp===stamp(p)||!s.approvals[0],'The project note changed. Revisit the plan first.');
  }
  async function finishJob(p,job,signal){
    try{
      let s=store.get(p);const refs=await library.library();const selected=s.referenceApproval?.references||[];const saved=await library.api('/api/saved');
      const context={project:p,run:{cycle:s.cycle,goal:s.goal,direction:s.direction,route:s.route,test:s.test,approvals:s.approvals,refs:selected,referenceApproval:s.referenceApproval?{at:s.referenceApproval.at,ids:s.referenceApproval.ids}:null,failedChecks:s.audit?.checks.filter(c=>c.status==='fail')||[],fixAuthorized:s.fixAuthorized},conversation:(s.messages[job.role]||[]).slice(-12),request:job.prompt};
      context.handoffs=Object.fromEntries(Object.entries(s.outputs).filter(([role])=>role!==job.role&&role!=='pip').map(([role,o])=>[role,{reply:o.reply,sources:o.sources,options:o.options,checks:o.checks}]));
      if(job.role==='pip'){delete context.handoffs;context.today=new Date().toISOString().slice(0,10);context.windowDays=14;context.shortlist=refs.references.filter(r=>s.refs.includes(r.id));context.savedReferenceIds=saved.saved.filter(r=>r.projectId===p.id).map(r=>r.referenceId);const assetRequest=true;context.library=selectReferences(refs.references,{project:{...p,goal:[s.goal,p.goal,job.prompt].join(' ')},collection:assetRequest?'assets':'all'}).slice(0,80).map(({preview,...r})=>({...r,previewVerified:!!refs.previews?.[r.id]?.thumbnailVerifiedAt}));context.catalog={total:refs.references.length,shown:context.library.length,assetRequest,previewPolicy:"Only previewVerified=true is confirmation. Omitted metadata means unknown, not a missing thumbnail."};context.sourceGuide=JSON.parse(fs.readFileSync(path.join(root,'Project-03/design-shelf/config/update-guide.json'),'utf8'));}
      if(['programmer','auditor'].includes(job.role))context.prototype=s.artifact;
      const result=await engine.run({instructions:instructions(root,job.role),prompt:JSON.stringify(context),signal,onProgress:message=>{const now=store.get(p),j=now.jobs.find(x=>x.id===job.id);if(j?.status==='running'){j.progress=message;store.save(now);}}});
      s=store.get(p);const j=s.jobs.find(x=>x.id===job.id);if(!j||j.status!=='running'||signal.aborted)return;
      const current=await getProject(p.id);need(stamp(current)===job.sourceStamp,'Project context changed during this run. Revisit the plan before retrying.');need(s.cycle===job.cycle,'The project cycle changed.');
      const reply=clean(result.reply||'',12000);need(reply,'The agent returned no answer.',502);
      const output={id:job.id,reply,model:result.model||'Codex',at:new Date().toISOString(),options:(result.options||[]).slice(0,3).map(o=>({title:clean(o.title,200),detail:clean(o.detail,4000),test:clean(o.test||'',3000)})),sources:(result.sources||[]).slice(0,6).filter(x=>{try{return new URL(x.url).protocol==='https:';}catch{return false;}}).map(x=>({title:clean(x.title,250),url:clean(x.url,2000),reason:clean(x.reason,2000)})),referenceIds:(result.referenceIds||[]).filter(id=>refs.references.some(r=>r.id===id)).slice(0,6),checks:[]};
      if(job.role==='programmer'&&result.files?.length){const files=validateFiles(result.files);s.pending={id:job.id,files,checks:syntaxChecks(files)};s.approvals[2]=null;s.approvals[3]=null;s.audit=null;}
      if(job.role==='auditor'){
        need(Array.isArray(result.checks)&&result.checks.length,'The audit returned no checks. Retry it.',502);
        const checks=result.checks.slice(0,10).map(c=>{need(['pass','fail','unknown'].includes(c.status),'Invalid audit status.',502);return {name:clean(c.name,250),status:c.status,evidence:clean(c.evidence,4000)};});
        // Browser interaction always requires a human check in this bounded runtime.
        checks.push({name:'Try the approved test yourself',status:'unknown',evidence:s.test});
        output.checks=[...s.artifact.checks,...checks];s.audit={artifactHash:s.artifact.hash,checks:output.checks,at:output.at};s.approvals[3]=null;
      }
      s.outputs[job.role]=output;s.messages[job.role]||=[];s.messages[job.role].push({role:'assistant',text:reply,at:output.at});j.status='completed';j.completedAt=output.at;if(job.role==='programmer')s.fixAuthorized=false;
      store.save(s,`${roles[job.role].name} returned a ${job.role==='programmer'?'prototype proposal':job.role==='auditor'?'source review':'reply'}. No human gate was approved.`);
    }catch(error){const s=store.get(p),j=s.jobs.find(x=>x.id===job.id);if(j&&j.status==='running'){j.status=signal.aborted?'cancelled':'failed';j.error=String(error.message).slice(0,500);store.save(s,`${roles[job.role].name}: ${j.status}.`);}}
    finally{active.delete(job.id);}
  }
  async function mutate(p,body){
    if(body.action==='selection'&&body.field==='refs'){const catalog=await library.library();need(Array.isArray(body.refs)&&body.refs.every(id=>catalog.references.some(r=>r.id===id)),'A reference is no longer in the library.');}
    if(body.action==='approve-references'){
      const current=store.check(p,body.revision),catalog=await library.library();
      body.references=current.refs.map(id=>{const r=catalog.references.find(r=>r.id===id);need(r,'A shortlisted reference is missing.');return {id:r.id,title:r.title,url:r.url,publisher:r.publisher,publishedAt:r.publishedAt||null,summary:r.summary||'',tags:r.tags||[],focus:r.focus||[],categories:r.categories||[],kind:r.kind||'inspiration',assetType:r.assetType||'',license:r.license||null,formats:r.formats||[],downloadUrl:r.downloadUrl||null};});
    }
    store.mutate(p,body);
  }
  function requestAgent(p,body){
    const s=store.check(p,body.revision);validateRun(p,s,body.role);need(active.size<3,'Three agents are already running. Wait for one to finish.');
    const prompt=clean(body.prompt,6000);need(prompt.length>=3,'Write a short request.',400);
    const job={id:randomUUID(),role:body.role,prompt,status:'running',progress:'Thinking',at:new Date().toISOString(),cycle:s.cycle,sourceStamp:stamp(p)};
    s.messages[job.role]||=[];s.messages[job.role].push({role:'user',text:prompt,at:job.at});s.jobs.push(job);s.drafts[job.role]='';store.save(s,`User asked ${roles[job.role].name} to work on this run.`);
    const controller=new AbortController();active.set(job.id,{controller,projectId:p.id,role:job.role});void finishJob(p,job,controller.signal);
  }
  function stopAgent(p,body){const s=store.get(p);const j=s.jobs.find(j=>j.id===body.jobId);need(j&&['queued','running'].includes(j.status),'This request has already stopped.');j.status='cancelled';s.paused=true;store.save(s,'User stopped the agent and paused this run.');active.get(j.id)?.controller.abort();}
  const bridge=createHostedBridge({load,getProject,view,roles:Object.fromEntries(Object.entries(roles).map(([id,{name,job}])=>[id,{name,job}])),engine,library,execute:async(p,command,input)=>{
    if(command==='request-agent')requestAgent(p,input);
    else if(command==='stop-agent'){need(store.get(p).revision===input.revision,'Review the current run first.');stopAgent(p,input);}
    else if(command==='apply-prototype')store.apply(p,input);
    else if(command==='save-reference'){store.check(p,input.revision,{allowBusy:true});const catalog=await library.library();need(catalog.references.some(r=>r.id===input.id),'Reference not found.');await library.save(p.id,clean(input.id,200),input.saved===true);return {ok:true};}
    else if(command==='import-reference'){store.check(p,input.revision,{allowBusy:true});return library.api('/api/import',{url:clean(input.url,2000),category:p.types?.[0]||'apps',focus:'UI'});}
    else await mutate(p,{...input,action:command==='choice'?'selection':command==='approve-gate'?'approve':command});
  }});
  const json=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});res.end(JSON.stringify(value));};
  const server=http.createServer(async(req,res)=>{
    const origin=`http://127.0.0.1:${req.socket.localPort}`;
    try{
      need(req.headers.host===new URL(origin).host,'Open the local workshop address.',403);
      const url=new URL(req.url,origin),route=url.pathname;
      if(await bridge(req,res,route))return;
      if(route.startsWith('/api/'))need(!req.headers.origin||req.headers.origin===origin,'This request is outside the workshop.',403);
      let body;
      if(req.method==='POST'){need(req.headers.origin===origin&&req.headers['x-workshop-token']===token&&req.headers['content-type']?.startsWith('application/json'),'Refresh the workshop before making changes.',403);let raw='';for await(const part of req){raw+=part;need(raw.length<500000,'Request too large.',413);}try{body=JSON.parse(raw);}catch{throw new Problem('Invalid request.');}}
      if(route==='/api/state'&&req.method==='GET'){const projects=await load();return json(res,200,{...projects,roles,token,engine:{connected:engine.connected,model:engine.model,connecting},running:[...active.values()].map(a=>({projectId:a.projectId,role:a.role}))});}
      if(route==='/api/connect'&&req.method==='POST'){connecting=true;try{await engine.start();return json(res,200,{connected:engine.connected,model:engine.model});}finally{connecting=false;}}
      if(route==='/api/library'&&req.method==='GET')return json(res,200,{...await library.library(),...await library.api('/api/saved')});
      const historyRoute=route.match(/^\/api\/project\/([a-z0-9_-]+)\/history(?:\/([a-f0-9-]{36}))?$/i);
      if(historyRoute&&req.method==='GET'){const p=await getProject(historyRoute[1]);return json(res,200,historyRoute[2]?{run:runSummary(store.history(p,historyRoute[2]))}:{runs:store.historyList(p)});}
      const match=route.match(/^\/api\/project\/([a-z0-9_-]+)(?:\/(action|run|cancel|apply|save-reference|import-reference))?$/i);
      if(match){const p=await getProject(match[1]),action=match[2];if(!action&&req.method==='GET')return json(res,200,{project:p,run:view(p)});
        need(req.method==='POST','Use POST for this action.',405);
        if(action==='action'){await mutate(p,body);return json(res,200,{project:p,run:view(p)});}
        if(action==='apply'){store.apply(p,body);return json(res,200,{project:p,run:view(p)});}
        if(action==='save-reference'){await library.save(p.id,clean(body.id,200),body.saved===true);return json(res,200,{ok:true});}
        if(action==='import-reference'){const source=clean(body.url,2000);const result=await library.api('/api/import',{url:source,category:p.types?.[0]||'apps',focus:'UI'});return json(res,200,result);}
        if(action==='cancel'){stopAgent(p,body);return json(res,200,{project:p,run:view(p)});}
        if(action==='run'){requestAgent(p,body);return json(res,202,{project:p,run:view(p)});}
      }
      const proto=route.match(/^\/prototype\/([a-z0-9_-]+)\/([a-f0-9-]+)\/([a-f0-9-]+)\/(index.html|styles.css|app.js)$/i);
      if(proto&&req.method==='GET'){const p=await getProject(proto[1]),s=store.history(p,proto[2]);need(s.artifact?.id===proto[3],'Prototype not found in this run.',404);const f=s.artifact.files.find(f=>f.path===proto[4]);need(f,'File not found.',404);res.writeHead(200,{'content-type':f.path.endsWith('.html')?'text/html; charset=utf-8':f.path.endsWith('.css')?'text/css':'text/javascript','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':`sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline' ${origin}; style-src 'unsafe-inline' ${origin}; img-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'`});return res.end(f.content);}
      const assets={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/characters.js':'characters.js','/styles.css':'styles.css'};
      if(req.method==='GET'&&assets[route]){const name=assets[route];res.writeHead(200,{'content-type':name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.css')?'text/css':'text/javascript','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; media-src https:; connect-src 'self'; frame-src 'self' http://127.0.0.1:4188 http://127.0.0.1:8917; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});return res.end(fs.readFileSync(path.join(here,'public',name)));}
      json(res,404,{error:'Not found.'});
    }catch(error){json(res,error.status||500,{error:error.status?error.message:'The workshop could not finish this request. '+String(error.message).slice(0,350)});}
  });
  server.on('close',()=>{for(const a of active.values())a.controller.abort();engine.close?.();});
  return {server,store,engine};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const {server}=createApp();const port=Number(process.env.PORT||4190);server.listen(port,'127.0.0.1',()=>console.log(`idea.quest workshop: http://127.0.0.1:${port}/`));for(const sig of ['SIGINT','SIGTERM'])process.once(sig,()=>server.close(()=>process.exit()));}
