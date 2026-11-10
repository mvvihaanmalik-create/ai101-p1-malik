// Approved browser-to-PC access. Project data never passes through Vercel.
(() => {
  const originalFetch=window.fetch.bind(window),base='http://127.0.0.1:4190';
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
  const empty={id:'connect-your-pc',title:'Connect your PC',goal:'',pitch:'Your projects stay on your PC.',next:'Start the local Workshop and allow this site’s local network connection.',types:['apps','games','plugins','websites','agents','creative'],tags:[],platform:['web'],contextKeywords:[],gates:{known:false,approved:0,total:5},obsidianUrl:'#',sourceNote:''};
  const neutral=p=>({...empty,...p});
  const emptyRun=p=>({id:p.id,cycle:'not-connected',revision:0,goal:'',direction:'',route:'',test:'',refs:[],referenceApproval:null,approvals:[null,null,null,null,null],decision:null,paused:false,messages:{},outputs:{},jobs:[],events:[],drafts:{},pending:null,artifact:null,audit:null,contextChanged:false,journalPath:''});
  function createConnection(){
    const sessions=new Map();let selected=null,online=false,catalog=null,selectionVersion=0;
    async function request(route,{token,body}={}){
      try{
        const response=await originalFetch(base+route,{method:body?'POST':'GET',mode:'cors',credentials:'omit',cache:'no-store',targetAddressSpace:'loopback',...(route==='/bridge/catalog'&&typeof AbortSignal!=='undefined'?{signal:AbortSignal.timeout(10000)}:{}),headers:{...(token?{'x-bridge-token':token}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
        const result=await response.json();if(!response.ok)throw Object.assign(Error(result.error||'PC request failed.'),{status:response.status});online=true;return result;
      }catch(error){if(!error.status){online=false;console.warn('PC connection unavailable:',error.message);throw Error('PC offline or local network access is blocked. Start workshop/start.ps1, allow this site’s connection, then reload.');}throw error;}
    }
    async function select(id){
      let session=sessions.get(id);
      if(!session||session.expires<Date.now()){
        const data=await request('/bridge/select',{body:{id}});session={...data,expires:Date.now()+7*60*60*1000};sessions.set(id,session);
      }
      return session;
    }
    async function snapshot(id){
      const version=++selectionVersion,session=await select(id);
      try{const data=await request('/bridge/project/'+encodeURIComponent(id),{token:session.token});Object.assign(session,data);if(version===selectionVersion)selected=id;return data;}
      catch(error){if(error.status===403){sessions.delete(id);const fresh=await select(id);if(version===selectionVersion)selected=id;return {project:fresh.project,run:fresh.run};}throw error;}
    }
    async function command(id,command,input={}){
      const session=await select(id),revision=input.revision??session.run.revision;
      const result=await request('/bridge/project/'+encodeURIComponent(id)+'/command',{token:session.token,body:{command,revision,...input}});
      if(result.run)Object.assign(session,result);return result;
    }
    async function library(){
      if(!selected||!online)return null;const session=await select(selected);return request('/bridge/project/'+encodeURIComponent(selected)+'/library',{token:session.token});
    }
    return {get online(){return online;},get selected(){return selected;},async catalog(){catalog=await request('/bridge/catalog');return catalog;},get cachedCatalog(){return catalog;},select,snapshot,command,library,
      async contexts(){const data=await this.catalog();const current=selected?sessions.get(selected)?.project:null;return {projects:data.projects.map(p=>current?.id===p.id?current:neutral(p)),activeProjectId:selected||data.activeProjectId,generatedAt:current?JSON.stringify(current):'titles'};},
      async quest(){const context=await this.contexts();const s=selected?sessions.get(selected)?.run:null;return {version:1,activeProjectId:context.activeProjectId,candidates:[],sync:{root:'your PC',mode:'bridge',asOf:null,warnings:['Notes are edited in the local app. Workshop approvals stay in Workshop.']},projects:context.projects.map(p=>{
        const n=p.id===selected&&s?s.approvals.filter(Boolean).length:0;
        return {id:p.id,title:p.title,pitch:p.pitch||'',nextMove:p.id===selected?(s?.goal||p.next):'Select to load from your PC',changed:p.changed||'',updatedAt:p.updatedAt||'',gates:Array.from({length:5},(_,i)=>i<n?'approved':i===n?'active':'upcoming'),gateNames:['Goal','Route','Prototype','Human check','Decide'],phase:s?.decision==='stop'&&p.id===selected?'resting':n===5?'complete':'active',legacyWorkflow:true,milestones:[],sessions:[],activity:[],updates:[],revision:0,folder:'',vaultPath:'',repository:'',live:''};
      })};}
    };
  }
  let connection;
  let cloudLibrary;
  async function publicAssets(){try{const response=await originalFetch('/api/shelf-library',{cache:'no-store'});if(response.ok){cloudLibrary=await response.json();return cloudLibrary;}}catch{}return cloudLibrary||await(await originalFetch('/shelf/library.json',{cache:'no-store'})).json();}
  try{connection=parent!==window&&parent.WorkshopCloud?.connection;}catch{}
  connection||=createConnection();
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const previewDocuments=new Map();
  window.addEventListener('message',event=>{
    if(event.data?.type!=='workshop-preview-ready')return;
    const frame=[...document.querySelectorAll('iframe[data-preview-id]')].find(f=>f.contentWindow===event.source&&f.dataset.previewId===event.data.id);
    const html=frame&&previewDocuments.get(frame.dataset.previewId);
    if(html)event.source.postMessage({type:'workshop-preview-render',html},'*');
  });
  window.WorkshopCloud={connection,get online(){return connection.online;},connect:()=>connection.catalog(),preview(artifact){
    const files=Object.fromEntries((artifact?.files||[]).map(f=>[f.path,f.content]));if(!files['index.html'])return '';
    let html=files['index.html'].replace(/<link\b[^>]*href=["'](?:\.\/)?styles\.css["'][^>]*>/gi,()=>'<style>'+String(files['styles.css']||'').replace(/<\/style/gi,'<\\/style')+'</style>').replace(/<script\b[^>]*src=["'](?:\.\/)?app\.js["'][^>]*>\s*<\/script>/gi,()=>'<script>'+String(files['app.js']||'').replace(/<\/script/gi,'<\\/script')+'<\/script>');
    html='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; connect-src \'none\'; form-action \'none\'; base-uri \'none\'">'+html;
    const id=artifact.id;previewDocuments.clear();previewDocuments.set(id,html);
    return '<iframe class="prototype" title="Project prototype" sandbox="allow-scripts" data-preview-id="'+esc(id)+'" src="/prototype-preview/index.html#'+encodeURIComponent(id)+'"></iframe>';
  }};
  window.fetch=async(input,options={})=>{
    const url=new URL(typeof input==='string'?input:input.url,location.origin),method=(options.method||'GET').toUpperCase();
    if(url.origin!==location.origin||!url.pathname.startsWith('/api/'))return originalFetch(input,options);
    const route=url.pathname,body=options.body?JSON.parse(options.body):{};
    try{
      if(route==='/api/state'){
        try{const context=await connection.contexts();return json({...connection.cachedCatalog,...context,token:''});}
        catch{return json({projects:[empty],activeProjectId:empty.id,roles:{},token:'',engine:{connected:false}});}
      }
      if(route==='/api/library'){
        const assets=await publicAssets();let local;try{local=await connection.library();}catch{}
        const ids=new Set(assets.references.map(r=>r.id)),urls=new Set(assets.references.map(r=>r.url));
        return json({...assets,references:[...assets.references,...(local?.references||[]).filter(r=>!ids.has(r.id)&&!urls.has(r.url))],saved:local?.saved||[]});
      }
      if(route==='/api/projects'){
        if(method!=='GET')return json({error:'Edit project notes in the local IdeaQuest app.'},409);
        try{return json(location.pathname.startsWith('/ideaquest/')?await connection.quest():await connection.contexts());}
        catch{return json(location.pathname.startsWith('/ideaquest/')?{version:1,activeProjectId:null,projects:[],candidates:[],sync:{root:'your PC',mode:'bridge',asOf:null,warnings:['PC offline.']}}:{projects:[empty],activeProjectId:empty.id});}
      }
      if(route==='/api/saved'){
        if(!connection.selected)return method==='GET'?json({saved:[]}):json({error:'Connect your PC and choose a project before saving.'},503);
        const selectedId=connection.selected,data=await connection.library();
        if(selectedId!==connection.selected)return json({error:'Project changed. Save again on the selected project.'},409);
        if(method==='POST'){
          const id=selectedId;const desired=(body.saved||[]).filter(s=>s.projectId===id).map(s=>s.referenceId),current=(data.saved||[]).map(s=>s.referenceId);
          for(const ref of new Set([...desired,...current]))if(desired.includes(ref)!==current.includes(ref)){
            if(desired.includes(ref)&&!data.references.some(r=>r.id===ref)){const candidate=(await publicAssets()).references.find(r=>r.id===ref);if(!candidate)throw Error('Asset no longer available.');const imported=await connection.command(id,'import-reference',{url:candidate.url});if(imported.reference?.id!==ref)throw Error('This asset needs a verified source check before saving.');}
            await connection.command(id,'save-reference',{id:ref,saved:desired.includes(ref)});
          }
          return json({saved:(await connection.library()).saved});
        }return json({saved:data?.saved||[]});
      }
      if(route==='/api/import'&&method==='POST')return json(await connection.command(connection.selected,'import-reference',{url:body.url}));
      const match=route.match(/^\/api\/project\/([a-z0-9_-]+)(?:\/(action|run|cancel|apply|save-reference|import-reference))?$/i);
      if(match){
        const id=match[1];if(id===empty.id)return json({project:empty,run:emptyRun(empty)});
        if(!match[2]&&method==='GET')return json(await connection.snapshot(id));
        if(method!=='POST')return json({error:'Action unavailable.'},405);
        const {action,revision,...rest}=body;
        const command=match[2]==='action'?({selection:'choice',approve:'approve-gate'}[action]||action):({run:'request-agent',cancel:'stop-agent',apply:'apply-prototype','save-reference':'save-reference','import-reference':'import-reference'}[match[2]]);
        return json(await connection.command(id,command,{...(revision===undefined?{}:{revision}),...rest}));
      }
      if(route==='/api/agent')return json({online:connection.online,jobs:[]});
      return json({error:'This action is available in the local app.'},409);
    }catch(error){return json({error:error.message},error.status||503);}
  };
})();
