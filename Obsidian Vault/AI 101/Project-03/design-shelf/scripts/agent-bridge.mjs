import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {canonicalUrl,normalizeReference} from '../src/core.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=async file=>JSON.parse((await fs.readFile(path.join(root,file),'utf8')).replace(/^\uFEFF/,''));
const connection=await readJson('.local/connection.json'),settings=await readJson('.local/agent.json');
const site=new URL(connection.siteUrl);if(site.protocol!=='https:'||!site.hostname.endsWith('.chatgpt.site'))throw Error('Invalid private Site.');
const token=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(root,'scripts/read-token.ps1')],{encoding:'utf8',windowsHide:true,env:{...process.env,PSModulePath:undefined}}).trim();
const workerId=randomUUID(),cwd=path.join(root,'.local/agent-workspace');await fs.mkdir(cwd,{recursive:true});
const instructions=await fs.readFile(path.join(root,'agent/pip.md'),'utf8');
const log=message=>console.log(new Date().toISOString()+' '+message);
async function api(route,body){const response=await fetch(new URL(route,site),{headers:{'OAI-Sites-Authorization':'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Site returned '+response.status+' for '+route);return response.json();}

const text={type:'string'},nullable={type:['string','null']},strings={type:'array',items:text};
const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const reference=object({id:text,title:text,publisher:text,url:text,publishedAt:nullable,evergreen:{type:'boolean'},categories:{type:'array',items:{enum:['plugins','games','websites','apps','agents','creative'],type:'string'}},focus:{type:'array',items:{enum:['UX','UI','Interaction','Motion'],type:'string'}},tags:strings,summary:text,evidenceUrl:text,liveUrl:nullable,dateType:text,preview:object({type:{type:'string',enum:['image','video','none']},url:nullable,poster:nullable,alt:text})});
const outputSchema=object({reply:text,referenceIds:strings,references:{type:'array',items:reference,maxItems:6}});

class CodexClient{
  constructor(){this.pending=new Map();this.sequence=0;this.events=new Set();this.child=null;}
  async start(){
    if(this.child)return;
    const codexJs=settings.codexJs||path.join(process.env.APPDATA,'npm/node_modules/@openai/codex/bin/codex.js');
    await fs.access(codexJs);
    const target=process.arch==='arm64'?'aarch64-pc-windows-msvc':'x86_64-pc-windows-msvc';
    const require=createRequire(codexJs);let vendor;
    try{vendor=path.join(path.dirname(require.resolve('@openai/codex-win32-'+(process.arch==='arm64'?'arm64':'x64')+'/package.json')),'vendor');}catch{vendor=path.resolve(path.dirname(codexJs),'../vendor');}
    const executable=settings.codexBinary||path.join(vendor,target,'bin/codex.exe');await fs.access(executable);
    this.child=spawn(executable,['app-server','--listen','stdio://','-c','web_search="live"','--disable','shell_tool','--disable','unified_exec','--disable','apps','--disable','plugins','--disable','multi_agent','-c','project_doc_max_bytes=0','-c','default_permissions="pip-study"','-c','permissions.pip-study.filesystem={":root"="deny",":minimal"="read",":workspace_roots"="read"}','-c','permissions.pip-study.network.enabled=false'],{cwd,windowsHide:true,stdio:['pipe','pipe','pipe'],env:{...process.env,PSModulePath:undefined}});
    // Stderr can contain account or tool details. Keep it out of Site replies and logs.
    this.child.stderr.on('data',()=>{});
    createInterface({input:this.child.stdout}).on('line',line=>{try{this.receive(JSON.parse(line));}catch{}});
    this.child.on('error',()=>this.closed());this.child.on('exit',()=>this.closed());
    await this.rpc('initialize',{clientInfo:{name:'design_shelf',title:'Design Shelf',version:'1.1.0'},capabilities:{experimentalApi:true}});
    this.send({method:'initialized'});
    const account=await this.rpc('account/read',{});
    if(!account.account)throw Error('Sign into Codex on this PC to connect Pip.');
    const catalog=await this.rpc('model/list',{});
    const model=catalog.data.find(entry=>entry.isDefault&&!entry.hidden)?.model;
    if(!model)throw Error('Codex did not return an available default model.');
    const params={model,cwd,developerInstructions:instructions,approvalPolicy:'untrusted',permissions:'pip-study',config:{web_search:'live','features.shell_tool':false,'features.unified_exec':false,'features.apps':false,'features.plugins':false,'features.multi_agent':false,project_doc_max_bytes:0}};
    try{
      if(settings.conversationId){try{await this.rpc('thread/resume',{...params,threadId:settings.conversationId,excludeTurns:true});}catch(error){if(!/no rollout found/.test(error.message))throw error;settings.conversationId=null;}}
      if(!settings.conversationId){const created=await this.rpc('thread/start',params);settings.conversationId=created.thread.id;await fs.writeFile(path.join(root,'.local/agent.json'),JSON.stringify(settings));await this.rpc('thread/name/set',{threadId:settings.conversationId,name:'Pip · Shelf popup'});}
    }catch(error){this.close();throw error;}
    log('Connected to the dedicated Codex chat.');
  }
  closed(){this.child=null;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('Codex disconnected. Reconnect or retry.'));}this.pending.clear();for(const fn of this.events)fn({method:'bridge/disconnected'});}
  send(value){if(!this.child?.stdin.writable)throw Error('Codex is offline.');this.child.stdin.write(JSON.stringify(value)+'\n');}
  rpc(method,params){const id=++this.sequence;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('Codex did not answer '+method));},60000);this.pending.set(id,{resolve,reject,timer});this.send({id,method,params});});}
  receive(message){
    if(message.id!==undefined&&!message.method){const p=this.pending.get(message.id);if(p){this.pending.delete(message.id);clearTimeout(p.timer);message.error?p.reject(Error(message.error.message)):p.resolve(message.result);}return;}
    if(message.id!==undefined&&message.method){
      // This role only needs public search and structured answers. No commands,
      // file edits, other-app approvals, or expanded permissions are granted.
      if(/requestApproval$/.test(message.method))this.send({id:message.id,result:message.method.includes('permissions')?{permissions:{},scope:'turn'}:{decision:'decline'}});
      else if(message.method==='item/tool/requestUserInput')this.send({id:message.id,result:{answers:{}}});
      else if(message.method==='mcpServer/elicitation/request')this.send({id:message.id,result:{action:'decline',content:null}});
      else this.send({id:message.id,error:{code:-32601,message:'This action is unavailable in Design Shelf.'}});
      return;
    }
    for(const fn of this.events)fn(message);
  }
  async run(prompt,job){
    await this.start();let turnId,answer='',finish,fail;
    const done=new Promise((resolve,reject)=>{finish=resolve;fail=reject;});
    done.catch(()=>{});
    const handler=event=>{if(event.method==='bridge/disconnected')return fail(Error('Codex disconnected.'));
      if(event.params?.threadId!==settings.conversationId)return;
      if(event.method==='item/completed'&&event.params.item?.type==='agentMessage')answer=event.params.item.text||answer;
      if(event.method==='turn/completed'){const turn=event.params.turn;if(turnId&&turn.id!==turnId)return;turn.status==='completed'?finish(answer):fail(Error(turn.error?.message||'The request was stopped.'));}
    };
    this.events.add(handler);
    const timeout=setTimeout(()=>{if(turnId)this.rpc('turn/interrupt',{threadId:settings.conversationId,turnId}).catch(()=>{});fail(Error('Research took too long. Try a narrower request.'));},600000);
    const cancel=setInterval(async()=>{try{const current=await api('/api/agent/request/'+job.id);if(current.status==='cancelled'){if(turnId)await this.rpc('turn/interrupt',{threadId:settings.conversationId,turnId});fail(Error('Stopped.'));}}catch{}},5000);
    try{const result=await this.rpc('turn/start',{threadId:settings.conversationId,input:[{type:'text',text:prompt}],cwd,approvalPolicy:'untrusted',permissions:'pip-study',outputSchema});turnId=result.turn.id;return JSON.parse(await done);}
    finally{clearTimeout(timeout);clearInterval(cancel);this.events.delete(handler);}
  }
  close(){const child=this.child;if(!child)return;child.stdin.end();const timer=setTimeout(()=>{if(child.exitCode===null)child.kill();},2000);timer.unref();}
}

async function publicFetch(url,options={}){let target=canonicalUrl(url);for(let i=0;i<4;i++){const response=await fetch(target,{...options,redirect:'manual',signal:AbortSignal.timeout(18000)});if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');await response.body?.cancel();target=canonicalUrl(new URL(location,target).href);continue;}return response;}throw Error('Too many source redirects.');}
async function verifiedCandidate(candidate){
  const r=normalizeReference(candidate);const response=await publicFetch(r.url,{headers:{Accept:'text/html'}});
  if(!response.ok||!response.headers.get('content-type')?.includes('text/html')){await response.body?.cancel();return null;}
  const reader=response.body.getReader();let html='',bytes=0;const decoder=new TextDecoder();
  try{while(bytes<1500000){const {value,done}=await reader.read();if(done)break;bytes+=value.length;html+=decoder.decode(value,{stream:true});}}finally{await reader.cancel();}
  if(r.publishedAt){const day=r.publishedAt.slice(0,10),human=new Date(day+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});if(!html.includes(day)&&!r.url.includes(day.replaceAll('-','/'))&&!html.includes(human)){r.publishedAt=null;r.evergreen=true;}}
  if(r.preview?.url){try{const media=await publicFetch(r.preview.url,{headers:{Range:'bytes=0-255'}});const valid=media.ok&&/^(image|video)\//.test(media.headers.get('content-type')||'');await media.body?.cancel();if(!valid)r.preview={type:'none',url:null,poster:null,alt:''};}catch{r.preview={type:'none',url:null,poster:null,alt:''};}}
  return r;
}

const codex=new CodexClient();let busy=false,stopping=false;
await fs.writeFile(path.join(root,'.local/agent.pid'),String(process.pid));
async function heartbeat(){await api('/api/agent/heartbeat',{workerId,threadId:settings.threadId});}
async function work(){if(busy||stopping)return;busy=true;let job;
  try{
    await heartbeat();({job}=await api('/api/agent/claim',{workerId}));if(!job)return;
    log('Working on a '+job.action+' request.');
    const [library,context,guide,saved]=await Promise.all([api('/api/library'),api('/api/projects'),api('/api/update-guide'),api('/api/saved')]);
    const selected=context.projects.find(p=>p.id===job.projectId);if(!selected)throw Error('The selected project is no longer connected.');
    const prompt=JSON.stringify({request:{action:job.action,text:job.prompt},project:selected,today:new Date().toISOString().slice(0,10),windowDays:14,assetPolicy:guide.assetCollection,sources:guide.sources,sourcePolicy:guide.selection,platformAccess:guide.platformAccess,library:library.references.filter(r=>r.kind==='asset'&&r.license?.verified&&r.license?.free).map(({preview,...r})=>r),savedReferenceIds:saved.saved.filter(s=>s.projectId===job.projectId).map(s=>s.referenceId)});
    const result=await codex.run(prompt,job);
    if((await api('/api/agent/request/'+job.id)).status!=='running')return;
    const known=new Map(library.references.map(r=>[canonicalUrl(r.url),r]));const candidates=[];let skipped=0;
    for(const candidate of (result.references||[]).slice(0,6)){try{const url=canonicalUrl(candidate.url);if(known.has(url)){result.referenceIds.push(known.get(url).id);continue;}const valid=await verifiedCandidate(candidate);if(valid)candidates.push(valid);else skipped++;}catch{skipped++;}}
    if((await api('/api/agent/request/'+job.id)).status!=='running')return;
    let added=0;if(candidates.length){const written=await api('/api/references',{references:candidates});added=written.added;}
    const reread=await api('/api/library');const byUrl=new Map(reread.references.map(r=>[canonicalUrl(r.url),r.id]));
    const ids=[...new Set([...(result.referenceIds||[]),...candidates.map(r=>byUrl.get(r.url))])].filter(Boolean);
    const reply=String(result.reply||'Here are the closest references.').slice(0,1100)+(added?' Saved '+added+' source candidates. Asset cards require license and preview checks.':'')+(skipped?' Skipped '+skipped+' unverifiable source'+(skipped===1?'.':'s.'):'');
    await api('/api/agent/request/'+job.id+'/complete',{workerId,reply,referenceIds:ids});log('Request completed.');
  }catch(error){codex.close();log('Pip needs attention: '+error.message.replaceAll(token,'[redacted]'));if(job)try{await api('/api/agent/request/'+job.id+'/complete',{workerId,status:'failed',reply:'Could not finish: '+error.message.replaceAll(token,'[redacted]').slice(0,300),referenceIds:[]});}catch{}}
  finally{busy=false;}
}
const heart=setInterval(()=>heartbeat().catch(()=>{}),15000),poll=setInterval(work,5000);
if(process.argv.includes('--connect-only')){try{await codex.start();console.log('Codex chat connection is ready.');}finally{clearInterval(heart);clearInterval(poll);codex.close();}}
else{log('Pip is listening for requests.');await work();}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{stopping=true;clearInterval(heart);clearInterval(poll);codex.close();process.exit();});
