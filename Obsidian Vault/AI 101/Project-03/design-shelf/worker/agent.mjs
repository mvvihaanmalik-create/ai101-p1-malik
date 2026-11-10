const AGENT_CONNECTION='agent/connection.json',JOB_PREFIX='agent/requests/';
const validJobId=id=>typeof id==='string'&&/^[a-zA-Z0-9-]{12,80}$/.test(id);
async function agentJobs(env){const objects=await env.BUCKET.list({prefix:JOB_PREFIX,limit:1000});const jobs=await Promise.all(objects.objects.map(o=>readObject(env,o.key,null).then(r=>r.value)));return jobs.filter(Boolean).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
async function agentApi(request,env,path){
  if(!path.startsWith('/api/agent'))return null;
  const now=new Date().toISOString();
  if(path==='/api/agent'&&request.method==='GET'){
    const [connection,jobs]=await Promise.all([readObject(env,AGENT_CONNECTION,{}),agentJobs(env)]);
    const online=Date.now()-Date.parse(connection.value.lastSeen||0)<45000;
    return json({online,lastSeen:connection.value.lastSeen||null,threadId:connection.value.threadId||null,jobs:jobs.slice(0,25).map(({workerId,...job})=>job)});
  }
  const input=request.method==='POST'?await request.json():{};
  if(path==='/api/agent/request'&&request.method==='POST'){
    if(!validJobId(input.id))throw Error('Invalid request ID.');
    const existing=await readObject(env,JOB_PREFIX+input.id,null);if(existing.value)return json(existing.value);
    const action=input.action==='refresh'?'refresh':'search',prompt=String(input.prompt||'').trim();
    if(prompt.length>1600||(!prompt&&action!=='refresh'))throw Error('Write a short search request.');
    const projects=(await readObject(env,PROJECTS_KEY,BUNDLE.projects)).value.projects;
    if(!projects.some(p=>p.id===input.projectId))throw Error('Choose a connected project first.');
    const jobs=await agentJobs(env);
    if(jobs.filter(j=>['queued','running'].includes(j.status)&&Date.now()-Date.parse(j.createdAt)<900000).length>=3)throw Error('Pip has three requests waiting. Let one finish first.');
    if(jobs.some(j=>Date.now()-Date.parse(j.createdAt)<5000))throw Error('Give Pip a few seconds before sending another request.');
    const job={id:input.id,action,prompt:prompt||(action==='refresh'?'Find fresh references for this project.':''),projectId:input.projectId,status:'queued',createdAt:now,updatedAt:now,reply:'',referenceIds:[]};
    await writeObject(env,JOB_PREFIX+job.id,job,null);return json(job,201);
  }
  if(path==='/api/agent/heartbeat'&&request.method==='POST'){
    if(!validJobId(input.workerId)||!/^[a-zA-Z0-9-]{12,80}$/.test(input.threadId||''))throw Error('Invalid connection.');
    await writeObject(env,AGENT_CONNECTION,{lastSeen:now,workerId:input.workerId,threadId:input.threadId},null);return json({ok:true});
  }
  if(path==='/api/agent/claim'&&request.method==='POST'){
    const connection=(await readObject(env,AGENT_CONNECTION,{})).value;
    if(input.workerId!==connection.workerId)throw Error('Reconnect Pip before taking requests.');
    const jobs=await agentJobs(env);
    for(const old of jobs.filter(j=>['queued','running'].includes(j.status)&&Date.now()-Date.parse(j.updatedAt)>900000)){
      const stored=await readObject(env,JOB_PREFIX+old.id,null);await writeObject(env,JOB_PREFIX+old.id,{...stored.value,status:'failed',reply:'This request expired. Send it again when Pip is online.',updatedAt:now},stored.etag);
    }
    const next=jobs.filter(j=>j.status==='queued'&&Date.now()-Date.parse(j.updatedAt)<=900000).at(-1);
    if(!next)return json({job:null});
    const stored=await readObject(env,JOB_PREFIX+next.id,null);
    if(stored.value.status!=='queued')return json({job:null});
    const job={...stored.value,status:'running',workerId:input.workerId,updatedAt:now};await writeObject(env,JOB_PREFIX+job.id,job,stored.etag);return json({job});
  }
  const match=path.match(/^\/api\/agent\/request\/([a-zA-Z0-9-]{12,80})(?:\/(cancel|complete))?$/);
  if(match){
    const stored=await readObject(env,JOB_PREFIX+match[1],null);if(!stored.value)return json({error:'Request not found.'},404);
    const job=stored.value;
    if(request.method==='GET')return json(job);
    if(match[2]==='cancel'&&request.method==='POST'&&['queued','running'].includes(job.status)){await writeObject(env,JOB_PREFIX+job.id,{...job,status:'cancelled',reply:'Stopped.',updatedAt:now},stored.etag);return json({ok:true});}
    if(match[2]==='complete'&&request.method==='POST'){
      if(job.status!=='running'||input.workerId!==job.workerId)throw Error('This request is no longer running.');
      const ids=new Set((await catalog(env)).value.references.map(r=>r.id));
      await writeObject(env,JOB_PREFIX+job.id,{...job,status:input.status==='failed'?'failed':'completed',reply:String(input.reply||'Finished.').slice(0,2000),referenceIds:Array.isArray(input.referenceIds)?input.referenceIds.filter(id=>ids.has(id)).slice(0,12):[],updatedAt:now},stored.etag);return json({ok:true});
    }
  }
  return json({error:'Unknown agent action.'},404);
}
