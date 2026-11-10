/*__CORE__*/
const BUNDLE = /*__BUNDLE__*/ null;
/*__AGENT__*/
const CATALOG_KEY = 'library/catalog.json';
const PROJECTS_KEY = 'context/projects.json';
const SAVED_KEY = 'library/saved.json';
const baseHeaders = {'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'};
function json(value,status=200,headers={}) { return new Response(JSON.stringify(value),{status,headers:{...baseHeaders,'Content-Type':'application/json; charset=utf-8',...headers}}); }
async function readObject(env,key,fallback) { const o = await env.BUCKET?.get(key); return o ? {value:await o.json(),etag:o.etag} : {value:fallback,etag:null}; }
async function writeObject(env,key,value,etag) {
  if(!env.BUCKET)throw new Error('Library storage is unavailable.');
  const stored=await env.BUCKET.put(key,JSON.stringify(value),{httpMetadata:{contentType:'application/json'},...(etag?{onlyIf:{etagMatches:etag}}:{})});
  if(!stored)throw new Error('The collection changed during this update. Please retry.');
}
async function catalog(env) {
  const stored=await readObject(env,CATALOG_KEY,{schemaVersion:2,references:[],lastRefresh:null});
  const references=dedupeReferences([...stored.value.references,...BUNDLE.references]);
  const refresh=(await readObject(env,'library/refresh.json',{})).value;
  return {...stored,value:{...stored.value,references,sourceCount:references.length,assetCount:references.filter(reusableAsset).length,edition:BUNDLE.edition,previews:BUNDLE.previews,refresh}};
}
function boundedProjects(input) {
  if(!input || !Array.isArray(input.projects) || input.projects.length>100)throw new Error('Invalid project summary.');
  const string=(v,n=400)=>typeof v==='string'?v.slice(0,n):'';
  const list=v=>Array.isArray(v)?v.filter(x=>typeof x==='string').map(x=>x.slice(0,70)).slice(0,50):[];
  const projects=input.projects.map(p=>({id:string(p.id,100),title:string(p.title,120),pitch:string(p.pitch),next:string(p.next),changed:string(p.changed),updatedAt:string(p.updatedAt,50),sourceNote:string(p.sourceNote,250),sourceModifiedAt:string(p.sourceModifiedAt,50),type:string(p.type,30),types:list(p.types).filter(t=>SECTIONS.some(([k])=>k===t)),tags:list(p.tags),focus:Array.isArray(p.focus)?list(p.focus):string(p.focus),platform:list(p.platform),goal:string(p.goal),stage:string(p.stage,60),contextKeywords:list(p.contextKeywords),inference:Array.isArray(p.inference)?p.inference.map(i=>({field:string(i.field,30),value:string(i.value,100),reason:string(i.reason,150)})).slice(0,20):[],obsidianUrl:typeof p.obsidianUrl==='string' && p.obsidianUrl.startsWith('obsidian://open?')?p.obsidianUrl.slice(0,1000):null,gates:{known:!!p.gates?.known,approved:Math.max(0,Math.min(5,Number(p.gates?.approved)||0)),total:Math.max(0,Math.min(5,Number(p.gates?.total)||0)),active:string(p.gates?.active,50)}}));
  if(projects.some(p=>!p.id||!p.title))throw new Error('Projects need an id and title.');
  return {schemaVersion:1,generatedAt:string(input.generatedAt,50)||new Date().toISOString(),syncedAt:new Date().toISOString(),activeProjectId:string(input.activeProjectId,100),projects};
}
async function updateProjects(env,input) {
  const value=boundedProjects(input),existing=await readObject(env,PROJECTS_KEY,null);
  if(existing.value && new Date(existing.value.generatedAt)>new Date(value.generatedAt))throw new Error('A newer note summary is already stored.');
  await writeObject(env,PROJECTS_KEY,value,existing.etag);return {updated:value.projects.length,syncedAt:value.syncedAt,activeProjectId:value.activeProjectId};
}
async function upsertReferences(env,input) {
  if(!Array.isArray(input.references)||!input.references.length||input.references.length>100)throw new Error('Send between 1 and 100 references.');
  const now=new Date(),newReferences=input.references.map(r=>normalizeReference(r,now)),current=await catalog(env);
  const byUrl=new Map(current.value.references.map(r=>[canonicalUrl(r.url),r]));
  let added=0;
  for(const r of newReferences){const before=byUrl.get(r.url);if(!before)added++;byUrl.set(r.url,{...r,...(before?.kind==='asset'&&r.kind!=='asset'?{kind:before.kind,assetType:before.assetType,license:before.license,formats:before.formats,downloadUrl:before.downloadUrl}:{}),id:before?.id||r.id,addedAt:before?.addedAt||r.addedAt});}
  if(byUrl.size>2000)throw new Error('The library has reached its reference limit.');
  const references=dedupeReferences([...byUrl.values()]);
  const result={schemaVersion:2,references,lastRefresh:now.toISOString(),sourceCount:references.length};
  await writeObject(env,CATALOG_KEY,result,current.etag);
  return {added,updated:newReferences.length-added,total:references.length,lastRefresh:result.lastRefresh};
}
async function safeRemote(url,options={}) {
  let target=canonicalUrl(url);
  for(let i=0;i<4;i++) {
    const response=await fetch(target,{...options,redirect:'manual'});
    if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('Location');if(!location)throw new Error('Invalid source redirect.');target=canonicalUrl(new URL(location,target).href);continue;}
    return response;
  }
  throw new Error('Too many source redirects.');
}
function decode(value) {return value?.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>')||'';}
async function importLink(env,input) {
  const url=canonicalUrl(input.url);const response=await safeRemote(url,{headers:{'User-Agent':'DesignShelf/1.0 (public reference metadata)','Accept':'text/html'}});
  if(!response.ok || !response.headers.get('content-type')?.includes('text/html'))throw new Error('This page did not provide readable metadata. Add a public article or demo page.');
  const reader=response.body.getReader();let count=0,parts=[];
  while(true){const {done,value}=await reader.read();if(done)break;count+=value.length;if(count>1500000){await reader.cancel();throw new Error('This page is too large to import.');}parts.push(value);}
  const html=new TextDecoder().decode(new Uint8Array(parts.flatMap(p=>Array.from(p))));
  const meta={};for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){const attrs={};for(const a of tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g))attrs[a[1].toLowerCase()]=decode(a[2]);const key=attrs.property||attrs.name;if(key)meta[key]=attrs.content;}
  const title=meta['og:title']||decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1])||new URL(url).hostname;
  const date=meta['article:published_time']||meta['datePublished']||html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1]||null;
  const image=meta['og:image'] ? new URL(meta['og:image'],url).href : null;
  const r={id:'ref-'+crypto.randomUUID().slice(0,12),title,publisher:meta['og:site_name']||new URL(url).hostname.replace(/^www\./,''),url,publishedAt:date,evergreen:!date,categories:[input.category||'apps'],focus:[input.focus||'UI'],tags:[],summary:meta['og:description']||meta.description||'',preview:image?{type:'image',url:image,alt:title}:{type:'none'},evidenceUrl:url};
  const normalized=normalizeReference(r);await upsertReferences(env,{references:[normalized]});return {reference:normalized};
}
const referenceSchema={type:'object',required:['id','title','publisher','url','categories'],properties:{
  id:{type:'string'},title:{type:'string'},publisher:{type:'string'},url:{type:'string'},publishedAt:{type:['string','null']},evergreen:{type:'boolean'},
  categories:{type:'array',items:{type:'string',enum:['plugins','games','websites','apps','agents','creative']}},
  focus:{type:'array',items:{type:'string',enum:['UX','UI','Interaction','Motion']}},tags:{type:'array',items:{type:'string'}},summary:{type:'string'},evidenceUrl:{type:'string'},liveUrl:{type:['string','null']},dateType:{type:'string'},
  preview:{type:'object',properties:{type:{type:'string',enum:['image','video','none']},url:{type:['string','null']},poster:{type:['string','null']},alt:{type:'string'}}}
}};
const toolDefinitions=[
  {name:'read_design_library',description:'Read the current reference library, active project context, saved items, and refresh status.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
  {name:'upsert_design_references',description:'Add or update verified public design references. Dates must be the original published/case-study date. Unknown dates are evergreen. Provide original preview URLs and source evidence. Deduplicates source URLs.',inputSchema:{type:'object',required:['references'],properties:{references:{type:'array',minItems:1,maxItems:100,items:referenceSchema}},additionalProperties:false}},
  {name:'sync_project_context',description:'Replace the allowlisted project summaries exported from Vihaan’s local Obsidian notes. Never send raw note bodies or logs.',inputSchema:{type:'object',required:['projects','generatedAt'],properties:{generatedAt:{type:'string'},activeProjectId:{type:'string'},projects:{type:'array',maxItems:100,items:{type:'object'}}}}}
];
async function snapshot(env){const [c,p,s]=await Promise.all([catalog(env),readObject(env,PROJECTS_KEY,BUNDLE.projects),readObject(env,SAVED_KEY,{saved:[],updatedAt:null})]);return {library:c.value,context:p.value,saved:s.value};}
async function mcp(request,env){let rpc;try{rpc=await request.json();}catch{return json({error:'Invalid JSON'},400);}const reply=result=>json({jsonrpc:'2.0',id:rpc.id??null,result});
  if(rpc.method==='server/discover')return reply({supportedVersions:['2026-07-28'],capabilities:{tools:{}}});
  if(rpc.method==='initialize')return reply({protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'Design Shelf',version:'1.0.0'}});
  if(rpc.method?.startsWith('notifications/'))return new Response(null,{status:204});
  if(rpc.method==='tools/list')return reply({tools:toolDefinitions});
  if(rpc.method==='tools/call'){try{const args=rpc.params?.arguments||{};let output;if(rpc.params?.name==='read_design_library')output=await snapshot(env);else if(rpc.params?.name==='upsert_design_references')output=await upsertReferences(env,args);else if(rpc.params?.name==='sync_project_context')output=await updateProjects(env,args);else throw new Error('Unknown tool.');return reply({content:[{type:'text',text:JSON.stringify(output)}]});}catch(error){return reply({isError:true,content:[{type:'text',text:error.message}]});}}
  return json({jsonrpc:'2.0',id:rpc.id??null,error:{code:-32601,message:'Method not found'}});
}
export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url),path=url.pathname;
    try {
      if(path==='/mcp' && request.method==='POST')return mcp(request,env);
      if(path.startsWith('/api/') && request.method!=='GET') {
        const origin=request.headers.get('origin');if(origin && origin!==url.origin)return json({error:'Cross-origin writes are not allowed.'},403);
        if(Number(request.headers.get('content-length')||0)>750000)return json({error:'Update is too large.'},413);
      }
      if(path.startsWith('/api/agent'))return await agentApi(request,env,path);
      if(path==='/api/library' && request.method==='GET')return json((await catalog(env)).value);
      if(path==='/api/projects' && request.method==='GET')return json((await readObject(env,PROJECTS_KEY,BUNDLE.projects)).value);
      if(path==='/api/projects' && request.method==='POST')return json(await updateProjects(env,await request.json()));
      if(path==='/api/references' && request.method==='POST')return json(await upsertReferences(env,await request.json()));
      if(path==='/api/import' && request.method==='POST')return json(await importLink(env,await request.json()));
      if(path==='/api/saved'){
        const s=await readObject(env,SAVED_KEY,{saved:[],updatedAt:null});
        if(request.method==='GET')return json(s.value);
        if(request.method==='POST') {const body=await request.json();if(!Array.isArray(body.saved)||body.saved.length>2000)throw new Error('Invalid saved collection.');const ids=new Map((await catalog(env)).value.references.flatMap(r=>[r.id,...(r.aliases||[])].map(id=>[id,r.id])));const unique=new Map();for(const x of body.saved){if(!x||!ids.has(x.referenceId))continue;const projectId=typeof x.projectId==='string'?x.projectId.slice(0,100):null,referenceId=ids.get(x.referenceId);unique.set(projectId+'|'+referenceId,{referenceId,projectId,savedAt:typeof x.savedAt==='string'?x.savedAt:new Date().toISOString()});}const value={saved:[...unique.values()],updatedAt:new Date().toISOString()};await writeObject(env,SAVED_KEY,value,s.etag);return json(value);}
      }
      if(path.startsWith('/api/media/') && request.method==='GET'){
        const id=decodeURIComponent(path.slice('/api/media/'.length)),r=(await catalog(env)).value.references.find(r=>r.id===id);
        const target=url.searchParams.has('poster')?r?.preview?.poster:r?.preview?.url;if(!target)return json({error:'No preview'},404);
        const headers={'User-Agent':'DesignShelf/1.0 (public source preview)'};if(request.headers.get('range'))headers.Range=request.headers.get('range');
        const response=await safeRemote(target,{headers,cf:{cacheTtl:86400,cacheEverything:true}});
        const type=response.headers.get('Content-Type')||'';if(!response.ok||!type.match(/^(image|video)\//))return json({error:'Source preview unavailable'},502);
        const h=new Headers({'Content-Type':type,'Cache-Control':'public,max-age=86400','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});for(const k of ['Content-Length','Content-Range','Accept-Ranges'])if(response.headers.has(k))h.set(k,response.headers.get(k));return new Response(response.body,{status:response.status,headers:h});
      }
      if(path==='/health')return json({ok:true,version:BUNDLE.builtAt,storage:!!env.BUCKET});
      if(path==='/api/update-guide')return json(BUNDLE.updateGuide);
      const asset=BUNDLE.assets[path==='/'?'/index.html':path];
      if(asset && request.method==='GET'){
        const demo=path.startsWith('/try/'),scriptHashes=BUNDLE.previewPolicy.scriptHashes.join(' '),styleHash=BUNDLE.previewPolicy.styleHash;
        const policy=demo?"default-src 'none'; script-src 'self' "+scriptHashes+" 'wasm-unsafe-eval'; style-src 'self' "+styleHash+"; img-src 'self' data: blob: https://dl.polyhaven.org; connect-src 'self' https://api.polyhaven.com https://dl.polyhaven.org; base-uri 'none'; form-action 'none'; frame-ancestors 'self'":"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: data:; media-src 'self' https:; connect-src 'self'; font-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com https://*.chatgpt.site";
        return new Response(asset.encoding==='base64'?Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0)):asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':path==='/'||demo?'no-cache':'public,max-age=3600','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...(demo?{'Access-Control-Allow-Origin':'*'}:{}),'Content-Security-Policy':policy}});
      }
      return json({error:'Not found'},404);
    } catch(error){return json({error:error.message || 'This request could not be completed.'},400);}
  }
};
