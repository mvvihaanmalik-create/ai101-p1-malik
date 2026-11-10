import {randomBytes} from 'node:crypto';
import {need} from './store.mjs';

// Browser-to-PC only. This is deliberately separate from the local /api routes.
export const hostedOrigin='https://ideaquest-workshop.vercel.app';
const pick=(value,keys)=>Object.fromEntries(keys.filter(k=>value&&Object.hasOwn(value,k)).map(k=>[k,value[k]]));
export const projectSummary=p=>({...pick(p,['id','title','pitch','goal','next','changed','updatedAt','type','types','tags','focus','platform','contextKeywords','stage','gates']),obsidianUrl:'#',sourceNote:''});
const checks=items=>(items||[]).map(c=>pick(c,['name','status','evidence']));
const files=items=>(items||[]).filter(f=>['index.html','styles.css','app.js'].includes(f.path)).map(f=>pick(f,['path','content']));
const output=o=>({...pick(o,['id','reply','model','at','options','sources','referenceIds']),checks:checks(o.checks)});
export function runSummary(s){
  const result=pick(s,['id','cycle','revision','sourceStamp','goal','direction','route','test','refs','referenceApproval','approvals','decision','paused','fixAuthorized','contextChanged']);
  result.messages=Object.fromEntries(Object.entries(s.messages||{}).map(([role,items])=>[role,items.slice(-50).map(m=>pick(m,['role','text','at']))]));
  result.outputs=Object.fromEntries(Object.entries(s.outputs||{}).map(([role,o])=>[role,output(o)]));
  result.jobs=(s.jobs||[]).slice(-40).map(j=>pick(j,['id','role','status','progress','at','completedAt','error']));
  result.events=(s.events||[]).slice(-100).map(e=>pick(e,['at','text']));
  result.drafts={...s.drafts};result.journalPath='';
  for(const key of ['pending','artifact'])result[key]=s[key]?{...pick(s[key],['id','hash','createdAt']),files:files(s[key].files),checks:checks(s[key].checks)}:null;
  result.audit=s.audit?{...pick(s.audit,['artifactHash','at']),checks:checks(s.audit.checks)}:null;
  // No sourceSnapshot, vault paths, raw note bodies, engine configuration or credentials.
  return result;
}

const commandFields={
  draft:['role','text'],goal:['goal'],choice:['field','text','test','refs'],
  'approve-references':[], 'approve-gate':['gate','note','acknowledged','decision'],
  pause:[],resume:[],revisit:[],'new-cycle':[],'request-fix':[],
  'request-agent':['role','prompt'],'stop-agent':['jobId'],
  'apply-prototype':['pendingId'],'save-reference':['id','saved'],'import-reference':['url'],
};
const projectRoute=/^\/bridge\/project\/([a-z0-9][a-z0-9_-]{0,99})(?:\/(command|library))?$/i;
export function createHostedBridge({load,getProject,view,roles,engine,execute,library}){
  const sessions=new Map();
  const reply=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});res.end(JSON.stringify(value));};
  async function body(req){let raw='';for await(const part of req){raw+=part;need(Buffer.byteLength(raw)<16000,'Request too large.',413);}try{return JSON.parse(raw);}catch{throw Object.assign(Error('Invalid request.'),{status:400});}}
  return async(req,res,route)=>{
    if(!route.startsWith('/bridge/'))return false;
    try{
      need(req.headers.origin===hostedOrigin,'This site cannot use the PC connection.',403);
      const match=route.match(projectRoute);
      const methods=route==='/bridge/catalog'?['GET']:route==='/bridge/select'?['POST']:match?match[2]==='command'?['POST']:['GET']:[];
      need(methods.length,'This PC route is not shared.',404);
      const method=req.method==='OPTIONS'?req.headers['access-control-request-method']:req.method;
      need(methods.includes(method),'Method not shared.',405);
      if(req.method==='OPTIONS'){
        const headers=(req.headers['access-control-request-headers']||'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
        need(headers.every(h=>['content-type','x-bridge-token'].includes(h)),'Header not shared.',403);
      }
      res.setHeader('Access-Control-Allow-Origin',hostedOrigin);res.setHeader('Vary','Origin');
      if(req.method==='OPTIONS'){
        res.setHeader('Access-Control-Allow-Methods',methods.join(', '));res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Bridge-Token');
        if(req.headers['access-control-request-private-network']==='true')res.setHeader('Access-Control-Allow-Private-Network','true');
        res.writeHead(204);res.end();return true;
      }
      let input;
      if(req.method==='POST'){need(req.headers['content-type']?.startsWith('application/json'),'Use a JSON request.',415);input=await body(req);need(input&&typeof input==='object'&&!Array.isArray(input),'Invalid request.',400);}
      if(route==='/bridge/catalog'){
        const data=await load();reply(res,200,{projects:data.projects.map(p=>pick(p,['id','title'])),activeProjectId:data.activeProjectId,roles,engine:{connected:engine.connected}});return true;
      }
      if(route==='/bridge/select'){
        need(Object.keys(input).every(k=>k==='id')&&typeof input.id==='string'&&/^[a-z0-9][a-z0-9_-]{0,99}$/i.test(input.id),'Choose a project.',400);
        const p=await getProject(input.id),token=randomBytes(32).toString('hex'),now=Date.now();
        for(const [key,s] of sessions)if(s.expires<now)sessions.delete(key);
        need(sessions.size<200,'Too many open project connections. Restart the PC app.',429);
        sessions.set(token,{id:p.id,expires:now+8*60*60*1000});
        reply(res,200,{token,project:projectSummary(p),run:runSummary(view(p))});return true;
      }
      const session=sessions.get(req.headers['x-bridge-token']);
      need(session&&session.expires>Date.now()&&session.id===match[1],'Select this project again to reconnect.',403);
      const p=await getProject(session.id);
      if(match[2]==='library'){
        const saved=await library.api('/api/saved');reply(res,200,{...await library.library(),saved:saved.saved.filter(s=>s.projectId===p.id)});return true;
      }
      if(match[2]==='command'){
        need(typeof input.command==='string'&&Object.hasOwn(commandFields,input.command),'This command is not shared.',400);const fields=commandFields[input.command];
        need(Object.keys(input).every(k=>['command','revision',...fields].includes(k)),'Unexpected command field.',400);
        need(Number.isInteger(input.revision)&&input.revision>=0,'Review this run before acting.',400);
        const result=await execute(p,input.command,pick(input,['revision',...fields]));
        reply(res,200,result||{project:projectSummary(p),run:runSummary(view(p))});return true;
      }
      reply(res,200,{project:projectSummary(p),run:runSummary(view(p))});return true;
    }catch(error){reply(res,error.status||500,{error:error.status?error.message:'The PC could not finish this request.'});return true;}
  };
}
