import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {canonicalUrl,normalizeReference,dedupeReferences,reusableAsset} from '../src/core.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async(file,fallback)=>{try{return JSON.parse(await fs.readFile(path.join(root,file),'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}};
async function atomic(file,value){await fs.mkdir(path.dirname(file),{recursive:true});const temp=file+'.'+randomUUID()+'.tmp';await fs.writeFile(temp,JSON.stringify(value,null,2));await fs.rename(temp,file);}
const objectFile=key=>path.join(root,'.local/objects',encodeURIComponent(key));
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#0?39;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/<[^>]+>/g,'').trim();

export function nextCollection(now=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now);
  const n=t=>Number(parts.find(p=>p.type===t).value),year=n('year'),month=n('month'),day=n('day');
  // Next Sunday, stored as a local date so DST cannot move the weekend.
  const next=new Date(Date.UTC(year,month-1,day));next.setUTCDate(next.getUTCDate()+(7-next.getUTCDay()));
  return next.toISOString().slice(0,10);
}
export function collectionDue(status,now=new Date()){
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  return !status?.lastSuccess||!status.nextScheduledDate||today>=status.nextScheduledDate;
}
async function remote(url,json=false){
  const response=await fetch(canonicalUrl(url),{headers:{'User-Agent':'VihaanDesignShelf/2.0 (public asset metadata; original sources only)',Accept:json?'application/json':'text/html,text/plain'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error(response.status+' from '+new URL(url).hostname);
  const text=await response.text();if(text.length>16000000)throw Error('Source metadata is too large.');return json?JSON.parse(text):text;
}
async function pool(items,fn,concurrency=3){const out=[];let index=0;await Promise.all(Array.from({length:Math.min(items.length,concurrency)},async()=>{while(index<items.length){const i=index++;out[i]=await fn(items[i],i);}}));return out;}
const licenses=new Set(['MIT','ISC','Apache-2.0','BSD-2-Clause','BSD-3-Clause','CC0-1.0','OFL-1.1','CC-BY-4.0','CC-BY-SA-4.0']);
function license(id,url,checkedAt){return {id,url,free:true,openSource:true,commercial:true,attribution:id!=='CC0-1.0',verified:true,checkedAt};}
function record(input,now){return normalizeReference({publishedAt:null,evergreen:true,preview:{type:'none'},kind:'asset',checkedAt:now.toISOString(),...input},now);}

async function github(source,now){
  let data;
  if(source.licenseEvidence){
    const [evidence,html]=await Promise.all([remote(source.licenseEvidence.url),remote('https://github.com/'+source.repo)]);
    const patterns={'MIT':/Permission is hereby granted, free of charge/i,'Apache-2.0':/Apache License[\s\S]{0,80}Version 2\.0/,'BSD-2-Clause':/Redistribution and use in source and binary forms/,'BSD-3-Clause':/Redistribution and use in source and binary forms/};
    if(!patterns[source.licenseEvidence.id]?.test(evidence)||/commons clause|business source license|sustainable use license/i.test(evidence))throw Error('Original license evidence changed.');
    if(/This repository was archived by the owner|"isArchived":true/.test(html))throw Error('Repository is archived.');
    data={html_url:'https://github.com/'+source.repo,homepage:source.demoUrl,license:{spdx_id:source.licenseEvidence.id}};
  }else data=await remote('https://api.github.com/repos/'+source.repo,true);
  if(data.archived||data.disabled)throw Error('Repository is archived or disabled.');
  let id=data.license?.spdx_id,url=source.licenseEvidence?.url||data.html_url+'/blob/'+data.default_branch+'/LICENSE';
  if(source.licenseOverride){const evidence=await remote(source.licenseOverride.url);if(!evidence.includes('ISC License'))throw Error('License evidence changed.');id=source.licenseOverride.id;url=source.licenseOverride.url;}
  if(!licenses.has(id))throw Error('No supported, unambiguous license: '+(id||'unknown'));
  return [record({primaryCategory:source.primaryCategory,id:'asset-gh-'+source.repo.replaceAll('/','-'),title:source.title,publisher:source.repo.split('/')[0],url:data.html_url,liveUrl:data.homepage?.startsWith('https://')?data.homepage:null,categories:source.categories,focus:source.assetType==='motion'?['Interaction','Motion']:['UI','Interaction'],tags:[source.assetType,...source.formats.map(f=>f.toLowerCase()),...(data.topics||[]).slice(0,10)],assetType:source.assetType,formats:source.formats,summary:source.reason,license:license(id,url,now.toISOString()),downloadUrl:data.html_url,updatedAt:data.pushed_at||null,evidenceUrl:url,...(source.previewUrl?{preview:{type:'image',url:source.previewUrl,alt:source.title+' original asset preview'}}:{})},now)];
}
async function font(slug,now){
  const evidence='https://raw.githubusercontent.com/google/fonts/main/ofl/'+slug+'/OFL.txt';const text=await remote(evidence);
  if(!/SIL OPEN FONT LICENSE/i.test(text))throw Error('Font license was not verified.');
  const meta=await remote('https://raw.githubusercontent.com/google/fonts/main/ofl/'+slug+'/METADATA.pb');
  const name=meta.match(/^name:\s*"([^"]+)"/m)?.[1];if(!name)throw Error('Missing original font name.');
  const files=[...meta.matchAll(/filename:\s*"([^"]+)"/g)].map(m=>m[1]);
  return [record({id:'asset-font-'+slug,title:name,publisher:'Google Fonts',url:'https://fonts.google.com/specimen/'+name.replaceAll(' ','+'),categories:['apps','websites','plugins','creative'],focus:['UI'],tags:['typography','font',slug,...(/category:\s*"SERIF"/.test(meta)?['serif']:['sans-serif'])],assetType:'fonts',formats:[...new Set(files.map(f=>f.split('.').pop().toUpperCase()))],summary:'Open font family for interface or editorial typography. Download the family with its license.',license:license('OFL-1.1',evidence,now.toISOString()),downloadUrl:'https://github.com/google/fonts/tree/main/ofl/'+slug,evidenceUrl:evidence},now)];
}
function polyRecord(type,id,a,now){return record({id:'asset-poly-'+id,title:a.name,publisher:'Poly Haven',url:'https://polyhaven.com/a/'+id,publishedAt:a.date_published?new Date(a.date_published*1000).toISOString().slice(0,10):null,evergreen:true,categories:['games','creative','websites'],focus:['UI'],tags:[type,'3d','three.js',...(a.categories||[]),...(a.tags||[])].slice(0,24),assetType:type,formats:type==='models'?['glTF','Blender']:type==='hdris'?['HDR','EXR']:['PBR','JPG','PNG'],summary:(a.description||a.name+' for 3D scenes.').slice(0,300),license:license('CC0-1.0','https://polyhaven.com/license',now.toISOString()),downloadUrl:'https://polyhaven.com/a/'+id,preview:a.thumbnail_url?{type:'image',url:a.thumbnail_url,alt:a.name+' — Poly Haven asset preview'}:{type:'none'},evidenceUrl:'https://polyhaven.com/license'},now);}
async function polyhaven(type,limit,now){
  const assets=Object.entries(await remote('https://api.polyhaven.com/assets?t='+type,true)).filter(([,a])=>!a.date_published||a.date_published*1000<=+now);
  const newest=[...assets].sort((a,b)=>(b[1].date_published||0)-(a[1].date_published||0));
  const popular=[...assets].sort((a,b)=>(b[1].download_count||0)-(a[1].download_count||0));
  const selected=new Map(),categories=new Set();
  for(const item of newest.slice(0,Math.ceil(limit/3)))selected.set(item[0],item);
  for(const item of popular){const category=(item[1].categories||[])[0];if(!categories.has(category)&&selected.size<limit){categories.add(category);selected.set(item[0],item);}}
  for(const item of popular){if(selected.size>=limit)break;selected.set(item[0],item);}
  return [...selected.values()].map(([id,a])=>polyRecord(type,id,a,now));
}
async function kenney(page,now){
  const html=await remote('https://kenney.nl/assets'+(page>1?'/page:'+page:''));
  const cards=[...html.matchAll(/<div class='asset'>([\s\S]*?)<\/div>\s*<\/div>/g)];
  const records=[];
  for(const [,block] of cards){
    const url=block.match(/href='(https:\/\/kenney\.nl\/assets\/[a-z0-9-]+)'/)?.[1],title=decode(block.match(/<h2>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/)?.[1]||'');
    if(!url||!title)continue;
    const image=block.match(/background-image:url\("([^"]+)"\)/)?.[1];
    const category=decode(block.match(/category:[^']*'>([^<]+)</)?.[1]||'2D');
    const type=category==='Audio'?'audio':category==='Textures'?'textures':category==='3D'?'models':category==='UI'||/^ui pack|mobile controls|input prompts|minimap|cursor /i.test(title)?'game-ui':/icons/i.test(title)?'icons':'game-art';
    records.push(record({id:'asset-kenney-'+url.split('/').pop(),title,publisher:'Kenney',url,categories:type==='game-ui'?['games','apps']:['games','creative'],focus:type==='game-ui'?['UI','Interaction']:['UI'],tags:[type,category.toLowerCase(),'game','kenney',...title.toLowerCase().split(/\W+/)],assetType:type,formats:[],summary:category+' asset pack. One card represents the whole pack; source page lists the included files.',license:license('CC0-1.0','https://kenney.nl/support',now.toISOString()),downloadUrl:url,preview:image?{type:'image',url:image,alt:title+' — Kenney asset pack preview'}:{type:'none'},evidenceUrl:'https://kenney.nl/support'},now));
  }
  if(!records.length)throw Error('Kenney catalog layout changed.');return records;
}

async function discoveredGithubRecord(data,source,now){
  const base='https://raw.githubusercontent.com/'+data.full_name+'/'+data.default_branch+'/';
      let evidence,evidenceUrl;
      for(const file of ['LICENSE','LICENSE.md','LICENSE.txt'])try{const text=await remote(base+file);if(/Permission is hereby granted, free of charge/i.test(text)&&!/commons clause|business source license/i.test(text)){evidence=text;evidenceUrl=base+file;break;}}catch{}
      if(!evidence)return null;
      const readme=(await remote(base+'README.md')).slice(0,160000);
      const images=[...readme.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+[^)]*)?\)|<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)];
      const image=images.map(m=>({url:m[2]||m[3],alt:m[1]||''})).find(i=>/\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.test(i.url)&&!/shields|badge|logo|avatar|sponsor|contributor|star-history|buymeacoffee|ko-fi|opencollective/i.test(i.url+' '+i.alt));
      if(!image)return null;
      const previewUrl=canonicalUrl(new URL(image.url.replace(/^\/+/,''),base).href.replace('https://github.com/'+data.full_name+'/blob/','https://raw.githubusercontent.com/'+data.full_name+'/'));
      return record({id:'asset-gh-'+data.full_name.replaceAll('/','-'),primaryCategory:source.category,title:data.name.replaceAll('-',' '),publisher:data.owner.login,url:data.html_url,liveUrl:data.homepage?.startsWith('https://')?data.homepage:null,categories:[source.category==='ux-ui'?'apps':source.category==='motion'?'websites':source.category],focus:source.category==='motion'?['Motion','Interaction']:['UI','Interaction'],tags:[...(data.topics||[]),source.assetType].slice(0,24),assetType:source.assetType,formats:[],summary:data.description||'Open-source '+source.assetType+' from its original repository.',preview:{type:'image',url:previewUrl,alt:image.alt||data.name+' original README example'},license:license('MIT',evidenceUrl,now.toISOString()),evidenceUrl,downloadUrl:data.html_url,updatedAt:data.pushed_at},now);
}

async function discoverGithub(source,known,now){
  const since=new Date(+now-365*86400000).toISOString().slice(0,10);
  const query=source.query+' license:mit archived:false fork:false stars:>=25 pushed:>='+since;
  const result=await remote('https://api.github.com/search/repositories?q='+encodeURIComponent(query)+'&sort=updated&order=desc&per_page=15',true),items=[],deadline=Date.now()+35000;
  for(const data of result.items||[]){
    if(items.length>=5||Date.now()>deadline)break;
    if(data.archived||data.disabled||data.license?.spdx_id!=='MIT'||known.has(data.html_url.toLowerCase()))continue;
    try{
      const item=await discoveredGithubRecord(data,source,now);if(!item)continue;items.push(item);
      known.add(data.html_url.toLowerCase());
    }catch{ /* A missing license, README or preview leaves the existing shelf intact. */ }
  }
  return items;
}

export async function lookupSourceAsset(input,config,now=new Date()){
  const url=canonicalUrl(input),u=new URL(url);
  if(u.hostname==='github.com'){
    const source=config.github.find(s=>'https://github.com/'+s.repo===url);
    if(source)return (await github(source,now))[0];
    const path=u.pathname.split('/').filter(Boolean);
    if(path.length===2){
      const data=await remote('https://api.github.com/repos/'+path.join('/'),true);
      const discovery=(config.discovery||[]).find(s=>(data.topics||[]).includes(s.query.match(/topic:([\w-]+)/)?.[1]));
      if(discovery&&!data.archived&&!data.disabled&&data.license?.spdx_id==='MIT')return await discoveredGithubRecord(data,discovery,now);
    }
  }
  if(u.hostname==='polyhaven.com'&&/^\/a\/[a-z0-9_]+$/i.test(u.pathname)){
    const id=u.pathname.split('/').pop();
    for(const type of Object.keys(config.polyhaven)){
      const assets=await remote('https://api.polyhaven.com/assets?t='+type,true),a=assets[id];
      if(a)return polyRecord(type,id,a,now);
    }
  }
  if(u.hostname==='kenney.nl'&&/^\/assets\/[a-z0-9-]+$/.test(u.pathname)){
    for(let page=1;page<=config.kenneyPages;page++){const r=(await kenney(page,now)).find(r=>r.url===url);if(r)return r;}
  }
  return null;
}

export async function collectSourceRecords(config,previous=[],now=new Date()){
  const sources=[];
  const known=new Set([...previous.map(r=>r.url),...config.github.map(s=>'https://github.com/'+s.repo)].map(u=>u.toLowerCase()));
  const work=[...config.github.map(s=>({id:'github:'+s.repo,run:()=>github(s,now)})),...(config.discovery||[]).map(s=>({id:'discovery:'+s.category,run:()=>discoverGithub(s,known,now)})),...config.fonts.map(s=>({id:'font:'+s,run:()=>font(s,now)})),...Object.entries(config.polyhaven).map(([type,limit])=>({id:'polyhaven:'+type,run:()=>polyhaven(type,limit,now)})),...Array.from({length:config.kenneyPages},(_,i)=>({id:'kenney:'+(i+1),run:()=>kenney(i+1,now)}))];
  const batches=await pool(work,async source=>{try{const items=await source.run();sources.push({id:source.id,status:'ok',count:items.length,checkedAt:now.toISOString()});return items;}catch(e){sources.push({id:source.id,status:'failed',error:e.message,checkedAt:now.toISOString()});return [];}});
  const fresh=batches.flat();if(!fresh.length)throw Error('No sources were reachable. Kept the last good collection.');
  const priorById=new Map(previous.map(r=>[r.id,r]));
  return {assets:dedupeReferences([...fresh.map(r=>({...r,addedAt:priorById.get(r.id)?.addedAt||r.addedAt})),...previous]).filter(reusableAsset),sources};
}

export async function collectAssets({force=false,now=new Date()}={}){
  const previousStatus=await read('.local/objects/'+encodeURIComponent('library/refresh.json'),{});
  if(!force&&!collectionDue(previousStatus,now))return {skipped:true,...previousStatus};
  await fs.mkdir(path.join(root,'.local'),{recursive:true});const lock=path.join(root,'.local/collect-assets.lock');let handle;
  try{handle=await fs.open(lock,'wx');}catch(e){if(e.code==='EEXIST'){const stat=await fs.stat(lock);if(+now-stat.mtimeMs>3600000){await fs.unlink(lock);return collectAssets({force,now});}return {skipped:true,running:true};}throw e;}
  try{
    const config=await read('config/asset-sources.json',{}),previous=await read('data/assets.json',[]);
    const {assets,sources}=await collectSourceRecords(config,previous,now);
    await atomic(path.join(root,'data/assets.json'),assets);
    const catalog=await read('.local/objects/'+encodeURIComponent('library/catalog.json'),{references:[]});
    const references=dedupeReferences([...assets,...catalog.references]);
    await atomic(objectFile('library/catalog.json'),{...catalog,schemaVersion:2,references,lastRefresh:now.toISOString(),sourceCount:references.length});
    const status={lastSuccess:now.toISOString(),nextScheduledDate:nextCollection(now),cadence:'Sunday · America/New_York',assets:assets.length,added:assets.filter(r=>!previous.some(p=>p.id===r.id)).length,sources,failedSources:sources.filter(s=>s.status==='failed').length};
    await atomic(objectFile('library/refresh.json'),status);
    return status;
  }catch(error){await atomic(objectFile('library/refresh.json'),{...previousStatus,lastAttempt:now.toISOString(),lastError:error.message});throw error;}
  finally{await handle.close();await fs.unlink(lock).catch(()=>{});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const result=await collectAssets({force:process.argv.includes('--force')});console.log(JSON.stringify(result,null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
