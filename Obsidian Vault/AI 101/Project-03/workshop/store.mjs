import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';

export const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
export const stamp=p=>hash({title:p.title,goal:p.goal,next:p.next,changed:p.changed,folder:p.folder,tags:p.tags,platform:p.platform,gates:p.gates});
export class Problem extends Error {constructor(message,status=400){super(message);this.status=status;}}
export function need(condition,message,status=409){if(!condition)throw new Problem(message,status);}
export function clean(value,max=6000){need(typeof value==='string'&&value.length<=max,'Enter shorter text.',400);return value.trim();}
export function atomic(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.'+randomUUID()+'.tmp';fs.writeFileSync(temp,value,{flag:'wx'});try{fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
export const fileNames=new Set(['index.html','styles.css','app.js']);
export function validateFiles(files){
  need(Array.isArray(files)&&files.length>0&&files.length<=3,'No usable browser prototype was returned.');
  need(new Set(files.map(f=>f.path)).size===files.length&&files.some(f=>f.path==='index.html'),'The prototype needs one index.html.');
  for(const file of files){need(fileNames.has(file.path),'Prototype file is outside the permitted scope.');clean(file.content,180000);}
  need(JSON.stringify(files).length<350000,'The prototype is too large.');
  return files.map(({path,content})=>({path,content}));
}
const fresh=p=>({id:p.id,cycle:randomUUID(),revision:0,sourceStamp:stamp(p),sourceSnapshot:p,goal:'',direction:'',route:'',test:'',refs:[],referenceApproval:null,approvals:[null,null,null,null,null],decision:null,paused:false,fixAuthorized:false,messages:{},outputs:{},jobs:[],pending:null,artifact:null,audit:null,events:[],drafts:{}});
export function createStore({root,local=path.join(root,'Project-03/workshop/.local'),runs=path.join(root,'Project-03/workshop-runs')}){
  const states=new Map();fs.mkdirSync(local,{recursive:true});
  const valid=id=>need(/^[a-z0-9][a-z0-9_-]{0,99}$/i.test(id),'Invalid project.',400);
  function get(p){valid(p.id);if(states.has(p.id))return structuredClone(states.get(p.id));const file=path.join(local,p.id+'.json');let s=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):fresh(p);let interrupted=false;for(const j of s.jobs)if(['queued','running'].includes(j.status)){j.status='interrupted';j.error='The workshop restarted. Retry when ready.';interrupted=true;}states.set(p.id,s);if(interrupted)save(s,'Run interrupted by restart.');return structuredClone(s);}
  function journal(s){const folder=path.join(runs,s.id,s.cycle);const labels=['Goal','Route','Prototype','Human check','Decide'];return {folder,text:`# ${s.sourceSnapshot.title}: workshop run\n\nProject note: ${s.sourceSnapshot.sourceNote}\n\n## Goal\n\n${s.goal||'Not set.'}\n\n## Direction\n\n${s.direction||'Not chosen.'}\n\n## Approved references for Creative Partner\n\n${s.referenceApproval?s.referenceApproval.references.map(r=>`- [${r.title}](${r.url})`).join('\n')+'\n\nApproved: '+s.referenceApproval.at:'Not approved. Saved and shortlisted references are not a handoff.'}\n\n## Route and small test\n\n${s.route||'Not chosen.'}\n\n${s.test||'Not set.'}\n\n## Human approvals\n\n${labels.map((label,i)=>`- ${label}: ${s.approvals[i]?s.approvals[i].at+' · '+s.approvals[i].note:'waiting'}`).join('\n')}\n\n## Record\n\n${s.events.map(e=>`- ${e.at}: ${e.text}`).join('\n')}\n\nThis run is separate from the original class gate history. Agent replies do not approve gates.\n`};}
  function save(s,event){s.revision++;if(event)s.events.push({at:new Date().toISOString(),text:event});atomic(path.join(local,s.id+'.json'),JSON.stringify(s,null,2));states.set(s.id,structuredClone(s));const j=journal(s);atomic(path.join(j.folder,'run.md'),j.text);return structuredClone(s);}
  function check(p,rev,{allowChanged=false,allowBusy=false}={}){const s=get(p);need(s.revision===rev,'This run changed in another tab. Refresh and review it before retrying.');if(!allowBusy)need(!s.jobs.some(j=>['running','queued'].includes(j.status)),'Wait for this project’s running agent, or stop it first.');if(!allowChanged&&s.approvals[0])need(s.sourceStamp===stamp(p),'Your project note changed. Revisit the plan to use the new context.');return s;}
  function mutate(p,input){const {action,revision}=input;let s=check(p,revision,{allowChanged:['revisit','new-cycle','pause','resume','draft'].includes(action),allowBusy:action==='draft'});const at=new Date().toISOString();let event;
    if(action==='draft'){need(typeof input.role==='string'&&input.role.length<30,'Invalid draft.',400);s.drafts[input.role]=clean(input.text||'',6000);return save(s);}
    if(action==='new-cycle'){need(s.decision||s.events.length,'There is no earlier run to archive.');atomic(path.join(local,'history',s.id,s.cycle+'.json'),JSON.stringify(s,null,2));s=fresh(p);s.revision=revision;event='User started a new cycle. Earlier run kept.';}
    else if(action==='revisit'){atomic(path.join(local,'history',s.id,s.cycle+'.json'),JSON.stringify(s,null,2));const previous=s;s={...fresh(p),revision,goal:previous.goal,direction:previous.direction,route:previous.route,test:previous.test,refs:previous.refs};event='User reopened the plan with current project context. Earlier run kept. Approvals need review.';}
    else if(action==='pause'){s.paused=true;event='User paused this run.';}
    else if(action==='resume'){s.paused=false;event='User resumed this run. Failed checks still require a fix decision.';}
    else if(action==='goal'){need(!s.approvals[0],'Revisit the plan to change an approved goal.');s.goal=clean(input.goal);need(s.goal.length>=5,'Write a specific goal.',400);s.sourceStamp=stamp(p);s.sourceSnapshot=p;event='User saved the goal draft.';}
    else if(action==='selection'){need(!s.approvals[1]&&!s.decision&&!s.paused,'Revisit the plan before changing its choices.');need(['direction','route','refs'].includes(input.field),'Invalid choice.',400);if(input.field==='refs'){need(Array.isArray(input.refs)&&input.refs.length<=30&&input.refs.every(x=>typeof x==='string'&&x.length<200),'Invalid references.',400);const refs=[...new Set(input.refs)];if(hash(refs)!==hash(s.refs))s.referenceApproval=null;s.refs=refs;}else{s[input.field]=clean(input.text);if(input.field==='route')s.test=clean(input.test); }event='User updated '+input.field+'.';}
    else if(action==='approve-references'){
      need(s.approvals[0]&&!s.approvals[1]&&!s.paused&&!s.decision,'Approve the goal, or revisit the locked plan first.');
      need(s.refs.length>0&&Array.isArray(input.references)&&input.references.length===s.refs.length&&input.references.every(r=>s.refs.includes(r.id)),'Review the current shortlist first.');
      s.referenceApproval={at,cycle:s.cycle,sourceStamp:s.sourceStamp,ids:[...s.refs],references:input.references};
      event='User approved '+s.refs.length+' references for Creative Partner. Direction and build still require approval.';
    }
    else if(action==='approve'){
      need(!s.paused&&!s.decision,'Resume or start a new cycle first.');const gate=input.gate;need(Number.isInteger(gate)&&gate>=0&&gate<=4,'Invalid gate.',400);need(!s.approvals[gate]&&s.approvals.slice(0,gate).every(Boolean),'Approve the previous gate first.');
      if(gate===0)need(s.goal.length>=5,'Set the goal first.');
      if(gate===1){need(s.direction&&s.route&&s.test,'Choose a direction, route, and small test first.');need(!s.refs.length||s.referenceApproval?.ids.join('|')===s.refs.join('|'),'Approve the reference shortlist first.');}
      if(gate===2)need(s.artifact&&s.artifact.checks.every(c=>c.status!=='fail')&&!s.pending,'Apply the prototype and resolve its required checks first.');
      if(gate===3){need(s.audit&&s.audit.artifactHash===s.artifact?.hash,'Review the current prototype with Auditor first.');need(s.audit.checks.length&&s.audit.checks.every(c=>c.status!=='fail'),'A required check failed. Request a fix or revisit the plan.');const unresolved=s.audit.checks.filter(c=>c.status==='unknown');need(unresolved.every(c=>input.acknowledged?.includes(c.name)),'Check each unverified item and record your evidence.');need(clean(input.note||'').length>=5,'Record what you checked and what happened.',400);}
      if(gate===4){need(['continue','stop'].includes(input.decision),'Choose continue or stop.',400);s.decision=input.decision;}
      s.approvals[gate]={at,note:clean(input.note||(['Goal approved','Direction, route, and test approved','Prototype accepted','Human check accepted','Decision: '+input.decision][gate]),4000)};event='User approved '+['Goal','Route','Prototype','Human check','Decide'][gate]+'.';
    }
    else if(action==='request-fix'){need(s.audit?.checks.some(c=>c.status==='fail')||s.artifact?.checks.some(c=>c.status==='fail'),'No failed check needs a fix.');need(!s.decision,'Start a new cycle to change completed work.');s.fixAuthorized=true;s.approvals[2]=null;s.approvals[3]=null;event='User requested a fix. The failed check stays unresolved until rerun.';}
    else throw new Problem('Unknown action.');return save(s,event);
  }
  function apply(p,input){const s=check(p,input.revision);need(!s.paused&&!s.decision&&s.approvals[1]&&s.pending,'An approved route and staged prototype are required.');need(s.pending.id===input.pendingId,'Review the current proposal before applying.');const files=validateFiles(s.pending.files);const folder=path.join(runs,s.id,s.cycle,'prototype',s.pending.id);fs.mkdirSync(folder,{recursive:true});for(const f of files)atomic(path.join(folder,f.path),f.content);s.artifact={id:s.pending.id,files,hash:hash(files),checks:s.pending.checks,createdAt:new Date().toISOString()};s.pending=null;s.audit=null;s.approvals[2]=null;s.approvals[3]=null;s.fixAuthorized=false;return save(s,'User applied the reviewed prototype files to this run’s separate local folder.');}
  function history(p,cycle){
    valid(p.id);need(typeof cycle==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(cycle),'Invalid saved run.',400);
    const current=get(p);if(current.cycle===cycle)return current;
    const file=path.join(local,'history',p.id,cycle+'.json');need(fs.existsSync(file),'Saved run not found.',404);
    const saved=JSON.parse(fs.readFileSync(file,'utf8'));need(saved.id===p.id&&saved.cycle===cycle,'Saved run does not match this project.',404);return saved;
  }
  function historyList(p){
    valid(p.id);const folder=path.join(local,'history',p.id),current=get(p),items=[current];
    if(fs.existsSync(folder))for(const file of fs.readdirSync(folder).filter(f=>/^[a-f0-9-]{36}\.json$/i.test(f))){try{const s=history(p,file.slice(0,-5));if(s.cycle!==current.cycle)items.push(s);}catch{}}
    return items.filter(s=>s.goal||s.events.length).map(s=>({cycle:s.cycle,goal:s.goal,at:s.events.at(-1)?.at||s.artifact?.createdAt||null,approvals:s.approvals.filter(Boolean).length,decision:s.decision,hasPrototype:!!s.artifact,current:s.cycle===current.cycle})).sort((a,b)=>(b.at||'').localeCompare(a.at||''));
  }
  return {get,save,check,mutate,apply,history,historyList,runs,local};
}
