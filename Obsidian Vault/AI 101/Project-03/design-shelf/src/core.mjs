export const SECTIONS = [
  ['all','Library'],['plugins','Plugins'],['games','Games'],['websites','Websites'],['apps','Apps & tools'],['agents','AI agents'],['creative','Creative']
];

export function canonicalUrl(value) {
  const u = new URL(value);
  if (u.protocol !== 'https:') throw new Error('Use an HTTPS source link.');
  if (/^(localhost|[0-9.]+$|\[)|\.(local|internal|test)$/i.test(u.hostname) || u.username || u.password || (u.port && u.port !== '443')) throw new Error('Use a public source.');
  u.hash = '';
  [...u.searchParams.keys()].filter(k => /^(utm_|fbclid$|gclid$|si$|ref$|ref_src$|mc_cid$|mc_eid$)/i.test(k)).forEach(k => u.searchParams.delete(k));
  u.searchParams.sort();
  u.pathname = u.pathname.replace(/\/$/,'') || '/';
  return u.href;
}

export function referenceKeys(r) {
  const key=url=>{try{const u=new URL(canonicalUrl(url));u.hostname=u.hostname.replace(/^www\./,'');return u.href.toLowerCase();}catch{return '';}};
  const title=String(r.title||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  return [...new Set([key(r.url),key(r.liveUrl),...(r.relatedUrls||[]).map(key),title.length>=8?'title|'+String(r.publisher||'').toLowerCase().trim()+'|'+title:''].filter(Boolean))];
}

export function dedupeReferences(references) {
  const items=[],owners=new Map();
  for(const input of references){
    const keys=referenceKeys(input),matches=[...new Set(keys.map(k=>{const r=owners.get(k);return k.startsWith('title|')&&r&&!r.categories.some(c=>(input.categories||[]).includes(c))?null:r;}).filter(Boolean))];
    const r=matches[0]||{...input,aliases:[...(input.aliases||[])]};
    if(!matches.length)items.push(r);
    else {
      for(const other of [input,...matches.slice(1)]){
        r.aliases=[...new Set([...r.aliases,other.id,...(other.aliases||[])])].filter(id=>id!==r.id);
        if(other.id===r.id){if(String(other.checkedAt||'')>String(r.checkedAt||'')){const aliases=r.aliases;Object.assign(r,other,{aliases});}continue;}
        r.categories=[...new Set([...r.categories,...(other.categories||[])])];r.focus=[...new Set([...r.focus,...(other.focus||[])])];r.tags=[...new Set([...r.tags,...(other.tags||[])])];
        r.relatedUrls=[...new Set([...(r.relatedUrls||[]),other.url,...(other.relatedUrls||[])])].filter(u=>u!==r.url);
        if(!r.preview?.url&&other.preview?.url)r.preview=other.preview;
        if(other.kind==='asset'&&other.license?.verified&&(r.kind!=='asset'||String(other.checkedAt||'')>String(r.checkedAt||''))){r.kind='asset';r.assetType=other.assetType;r.license=other.license;r.downloadUrl=other.downloadUrl;r.formats=other.formats;r.updatedAt=other.updatedAt;}
        if(String(other.checkedAt||'')>String(r.checkedAt||''))r.checkedAt=other.checkedAt;
        for(const [k,v] of owners)if(v===other)owners.set(k,r);
        if(other!==input){const index=items.indexOf(other);if(index>=0)items.splice(index,1);}
      }
    }
    for(const k of [...keys,...referenceKeys(r)])owners.set(k,r);
  }
  return items;
}

export function reusableAsset(r) {return r.kind==='asset'&&r.license?.verified===true&&r.license?.free===true;}

export function assetHomeCategory(r){
  if(['plugins','games','ux-ui','motion','websites','apps','agents','creative'].includes(r.primaryCategory))return r.primaryCategory;
  if(r.assetType==='motion')return 'motion';
  if(r.publisher==='Kenney'||['game-art','game-ui','audio'].includes(r.assetType))return 'games';
  if(['icons','components','fonts'].includes(r.assetType))return 'ux-ui';
  if(['models','textures','hdris','3d-tools'].includes(r.assetType))return 'creative';
  return r.categories.find(c=>['plugins','agents','apps','websites','creative','games'].includes(c))||'creative';
}

export const SHELF_CATEGORIES=['plugins','games','ux-ui','motion','websites','apps','agents','creative'];
function balancedPicks(items,count){
  const remaining=[...items],picked=[],publishers=new Map(),types=new Map();
  while(remaining.length&&picked.length<count){let best=0,score=-Infinity;
    remaining.forEach((r,i)=>{const value=-i*.025-(publishers.get(r.publisher)||0)*3-(types.get(r.assetType)||0)*2;if(value>score){score=value;best=i;}});
    const [r]=remaining.splice(best,1);picked.push(r);publishers.set(r.publisher,(publishers.get(r.publisher)||0)+1);types.set(r.assetType,(types.get(r.assetType)||0)+1);
  }return picked;
}
// Editions persist across deployments. Rotation never changes source or addition dates.
export function createShelfEdition(references,{previous=null,rotate=false,now=new Date()}={}){
  const assets=dedupeReferences(references).filter(reusableAsset),byId=new Map(assets.map(r=>[r.id,r]));
  const history=new Set(previous?.history||[]),categories={},replaced={};
  for(const category of SHELF_CATEGORIES){
    const old=[...new Set(previous?.categories?.[category]||[])].filter(id=>byId.has(id)&&assetHomeCategory(byId.get(id))===category).slice(0,10);
    const candidates=assets.filter(r=>assetHomeCategory(r)===category&&!history.has(r.id)&&!old.includes(r.id)).sort((a,b)=>String(b.addedAt).localeCompare(String(a.addedAt)));
    const additions=balancedPicks(candidates,previous?(rotate?Math.min(5,10):10-old.length):10).map(r=>r.id);
    const kept=rotate?old.slice(0,Math.max(0,10-additions.length)):old;
    categories[category]=[...additions,...kept].slice(0,10);replaced[category]=previous&&rotate?additions.length:0;
    categories[category].forEach(id=>history.add(id));
  }
  return {schemaVersion:1,createdAt:previous?.createdAt||now.toISOString(),updatedAt:now.toISOString(),categories,history:[...history],replaced};
}
export function weeklyShelfPicks(references,{categories=[],matches=(r,id)=>assetHomeCategory(r)===id,edition=null}={}){
  const selected=new Set();
  for(const id of categories){
    const candidates=references.filter(r=>matches(r,id)),ids=edition?.categories?.[id];
    if(ids){const allowed=new Set(ids);candidates.filter(r=>allowed.has(r.id)).slice(0,10).forEach(r=>selected.add(r.id));}
    else balancedPicks(candidates,10).forEach(r=>selected.add(r.id));
  }
  return references.filter(r=>selected.has(r.id));
}

export function inWindow(reference, now = new Date(), days = 90) {
  if (reference.evergreen || !reference.publishedAt) return false;
  const date = new Date(reference.publishedAt);
  return Number.isFinite(+date) && date <= now && date >= new Date(+now - days * 86400000);
}

export function normalizeReference(r, now = new Date()) {
  if (!r || typeof r !== 'object') throw new Error('Missing reference.');
  const url = canonicalUrl(r.url);
  const clean = (v,n=240) => String(v || '').trim().slice(0,n);
  const categories = [...new Set((r.categories || []).filter(v => SECTIONS.some(([key]) => key === v) && v !== 'all'))];
  if (!clean(r.title) || !clean(r.publisher) || !categories.length) throw new Error('A title, publisher, and project type are required.');
  let publishedAt = null;
  if (r.publishedAt) {
    const date = new Date(r.publishedAt);
    if (!Number.isFinite(+date) || date > now) throw new Error('The source date must be valid and not in the future.');
    publishedAt = date.toISOString().slice(0,10);
  }
  let preview = {type:'none',url:null,poster:null,alt:clean(r.title)};
  if (r.preview?.url && ['image','video'].includes(r.preview.type)) {
    preview = {type:r.preview.type,url:canonicalUrl(r.preview.url),poster:r.preview.poster ? canonicalUrl(r.preview.poster) : null,alt:clean(r.preview.alt || r.title)};
  }
  const focus = (Array.isArray(r.focus) ? r.focus : [r.focus]).filter(v => ['UX','UI','Interaction','Motion'].includes(v));
  const license=r.license&&typeof r.license==='object'?{id:clean(r.license.id,60),url:r.license.url?canonicalUrl(r.license.url):null,free:r.license.free===true,openSource:r.license.openSource===true,commercial:r.license.commercial===true,attribution:r.license.attribution===true,verified:r.license.verified===true,checkedAt:clean(r.license.checkedAt,40)}:null;
  return {primaryCategory:clean(r.primaryCategory,40),id:clean(r.id,100) || url,title:clean(r.title,140),publisher:clean(r.publisher,100),url,publishedAt,evergreen:!publishedAt || !!r.evergreen,categories,focus:[...new Set(focus)],tags:[...new Set((r.tags || []).map(v=>clean(v,40).toLowerCase()).filter(Boolean))].slice(0,24),summary:clean(r.summary,400),preview,evidenceUrl:r.evidenceUrl ? canonicalUrl(r.evidenceUrl) : url,liveUrl:r.liveUrl ? canonicalUrl(r.liveUrl) : null,dateType:clean(r.dateType,40)||'published',previewNote:clean(r.previewNote,200),checkedAt:clean(r.checkedAt,40),addedAt:clean(r.addedAt,40) || now.toISOString(),kind:r.kind==='asset'?'asset':'inspiration',assetType:clean(r.assetType,40),formats:(r.formats||[]).map(v=>clean(v,30)).slice(0,12),downloadUrl:r.downloadUrl?canonicalUrl(r.downloadUrl):null,license,aliases:(r.aliases||[]).map(v=>clean(v,100)).slice(0,100),relatedUrls:(r.relatedUrls||[]).slice(0,20).map(canonicalUrl),updatedAt:clean(r.updatedAt,40)};
}

export function referenceFit(reference, project) {
  if (!project) return {score:0,reasons:[]};
  const types = project.types || [project.type];
  const tags = (project.tags || []).map(v=>String(v).toLowerCase());
  const context=[project.title,project.goal,project.pitch,project.next,...(project.platform||[])].filter(Boolean).join(' ').toLowerCase();
  const words = new Set([...(project.contextKeywords || []),...tags,...context.match(/[\p{L}\p{N}.+#-]{3,}/gu)||[]].map(v=>String(v).toLowerCase()));
  for(const [match,related] of [[/three|webgl|3d/,['3d','three.js','models','textures','hdris','3d-tools']],[/motion|animation|animate|smooth/,['motion','animation','spring']],[/icon|toolbar|navigation/,['icons']],[/game|playful|platformer/,['game','game-art','game-ui']],[/type|font|editorial/,['fonts','typography']]])if(match.test(context))related.forEach(word=>words.add(word));
  const matches = (reference.tags || []).filter(tag=>words.has(tag));
  const typeMatch = reference.categories.some(type=>types.includes(type));
  const focusMatches = (reference.focus || []).filter(f=>(project.focus || []).includes(f));
  return {score:(typeMatch?8:0)+matches.length*3+focusMatches.length,reasons:[...matches.slice(0,3),...(typeMatch?[SECTIONS.find(([key])=>key===reference.categories.find(type=>types.includes(type)))?.[1] || 'Project type']:[])].slice(0,3)};
}

export function selectReferences(references, {project=null,section='recommended',focus='All',search='',savedIds=[],now=new Date(),collection='all',assetType='all',license='all',period='all'}={}) {
  const query = search.toLowerCase().trim();
  const isSaved = r=>savedIds.includes(r.id)||(r.aliases||[]).some(id=>savedIds.includes(id));
  const sorted=dedupeReferences(references).filter(r=>{
    if(collection==='assets'&&!reusableAsset(r))return false;
    if(collection==='inspiration'&&r.kind==='asset')return false;
    if(assetType!=='all'&&r.assetType!==assetType)return false;
    if(license==='cc0'&&r.license?.id!=='CC0-1.0')return false;
    if(license==='open'&&!r.license?.openSource)return false;
    if(license==='commercial'&&!r.license?.commercial)return false;
    if(period==='recent'&&!inWindow(r,now))return false;
    if(section==='saved')return isSaved(r) && (!query || (r.title+' '+r.publisher+' '+r.tags.join(' ')).toLowerCase().includes(query)) && (focus==='All'||r.focus.includes(focus));
    if(section==='archive' ? inWindow(r,now)||reusableAsset(r) : !inWindow(r,now)&&!reusableAsset(r))return false;
    if(!['recommended','all','archive'].includes(section) && !r.categories.includes(section))return false;
    if(section==='recommended' && project && referenceFit(r,project).score===0)return false;
    return (focus==='All'||r.focus.includes(focus)) && (!query||(r.title+' '+r.publisher+' '+r.tags.join(' ')+' '+r.summary).toLowerCase().includes(query));
  }).sort((a,b)=>section==='recommended' ? referenceFit(b,project).score-referenceFit(a,project).score || String(b.publishedAt).localeCompare(String(a.publishedAt)) : String(b.publishedAt).localeCompare(String(a.publishedAt)));
  if(section!=='recommended')return sorted;
  // Balance the first screen without hiding the rest of the collection.
  const remaining=[...sorted],balanced=[],publishers=new Map(),types=new Map();
  while(remaining.length&&balanced.length<24){let best=0,score=-Infinity;remaining.forEach((r,i)=>{const value=referenceFit(r,project).score-(publishers.get(r.publisher)||0)*3-(types.get(r.assetType)||0)*1.5;if(value>score){score=value;best=i;}});const [r]=remaining.splice(best,1);balanced.push(r);publishers.set(r.publisher,(publishers.get(r.publisher)||0)+1);types.set(r.assetType,(types.get(r.assetType)||0)+1);}
  return [...balanced,...remaining];
}
