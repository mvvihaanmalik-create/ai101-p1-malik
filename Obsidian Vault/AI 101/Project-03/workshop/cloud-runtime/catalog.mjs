import fs from 'node:fs/promises';
import {createHash,timingSafeEqual} from 'node:crypto';
import {get,put} from '@vercel/blob';
import {collectSourceRecords,nextCollection} from '../../design-shelf/scripts/collect-assets.mjs';
import {imageExtension} from '../../design-shelf/scripts/cache-asset-thumbnails.mjs';
import {canonicalUrl,reusableAsset,assetHomeCategory,dedupeReferences,createShelfEdition} from '../../design-shelf/src/core.mjs';

const statePath='shelf/state-v1.json';
const readSeed=async name=>JSON.parse(await fs.readFile(new URL('../data/'+name,import.meta.url),'utf8'));
const configured=()=>!!(process.env.BLOB_STORE_ID||process.env.BLOB_READ_WRITE_TOKEN);
export async function loadCatalog({strict=false}={}){
  const [catalog,seedPreviews]=await Promise.all([readSeed('catalog.json'),readSeed('shelf-previews.json')]);
  const seed=()=>({schemaVersion:1,references:catalog.references.filter(reusableAsset),previews:seedPreviews,edition:catalog.edition,refresh:{...catalog.refresh,cloud:true,configured:configured()}});
  if(configured())try{
    const result=await get(statePath,{access:'private',useCache:false});
    if(result?.statusCode===200){const state=await new Response(result.stream).json();if(state.schemaVersion===1&&Array.isArray(state.references)&&state.previews){
      const references=dedupeReferences([...state.references,...catalog.references.filter(reusableAsset)]),previews={...seedPreviews,...state.previews};
      return {...state,references,previews,edition:state.edition||catalog.edition};
    }}
  }catch(error){console.error('Shelf storage read failed:',error.name);if(strict)throw error;}
  return seed();
}
export function publicCatalog(state){return {schemaVersion:2,edition:state.edition,references:state.references.filter(reusableAsset),previews:Object.fromEntries(Object.entries(state.previews).map(([id,p])=>{const {blobPath,...preview}=p;return [id,{...preview,...(blobPath?{thumbnailUrl:'/api/shelf-thumbnail?id='+encodeURIComponent(id)}:{})}];})),refresh:{...state.refresh,cloud:true,configured:configured()},sourceCount:state.references.length,lastRefresh:state.refresh.lastSuccess};}
export function sendJson(res,value,status=200){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','private,no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(value));}
export function cronAuthorized(req){const secret=process.env.CRON_SECRET,auth=req.headers.authorization;if(!secret||typeof auth!=='string')return false;const expected=Buffer.from('Bearer '+secret),received=Buffer.from(auth);return expected.length===received.length&&timingSafeEqual(expected,received);}
async function originalImage(input){
  let url=canonicalUrl(input);
  for(let i=0;i<4;i++){
    const response=await fetch(url,{redirect:'manual',headers:{'User-Agent':'DesignShelf/3.0 (licensed original asset previews)'},signal:AbortSignal.timeout(18000)});
    if([301,302,303,307,308].includes(response.status)){url=canonicalUrl(new URL(response.headers.get('location'),url).href);await response.body?.cancel();continue;}
    if(!response.ok)throw Error('Preview HTTP '+response.status);
    const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>4000000)throw Error('Preview too large');chunks.push(chunk);}
    const bytes=Buffer.concat(chunks);return {bytes,extension:imageExtension(bytes)};
  }
  throw Error('Preview redirect limit');
}
export async function refreshCatalog(){
  if(!configured())throw Error('Private asset storage is not connected.');
  // Conditional create prevents overlapping cron deliveries from publishing competing snapshots.
  const lockPath='shelf/refresh-lock.json';
  try{await put(lockPath,JSON.stringify({expires:Date.now()+330000}),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});}
  catch(error){
    const lock=await get(lockPath,{access:'private',useCache:false});const value=lock?.statusCode===200?await new Response(lock.stream).json():null;
    if(value?.expires>Date.now())return {skipped:true,reason:'Refresh already running'};
    // Expired lock is recoverable, but only replace the version just read.
    await put(lockPath,JSON.stringify({expires:Date.now()+330000}),{access:'private',addRandomSuffix:false,allowOverwrite:true,ifMatch:lock?.blob?.etag,contentType:'application/json'});
  }
  try{
    const before=await loadCatalog({strict:true}),config=await readSeed('asset-sources.json'),now=new Date();
    if(before.refresh.cloudCompletedAt&&Date.now()-Date.parse(before.refresh.cloudCompletedAt)<5*86400000)return {skipped:true,reason:'Weekly refresh already completed'};
    const {assets,sources}=await collectSourceRecords(config,before.references,now),previews={...before.previews},missing=[];
    let cursor=0;
    await Promise.all(Array.from({length:4},async()=>{while(cursor<assets.length){const r=assets[cursor++];
      r.primaryCategory=assetHomeCategory(r);
      if(previews[r.id]?.thumbnailVerifiedAt)continue;
      try{
        if(r.preview?.type!=='image'||!r.preview.url)throw Error('No verified original image');
        const {bytes,extension}=await originalImage(r.preview.url),hash=createHash('sha256').update(bytes).digest('hex').slice(0,16),blobPath='shelf/thumbnails/'+r.id.replace(/[^a-zA-Z0-9_.-]/g,'-')+'-'+hash+'.'+extension;
        await put(blobPath,bytes,{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:({jpg:'image/jpeg',svg:'image/svg+xml'})[extension]||'image/'+extension});
        previews[r.id]={blobPath,thumbnailUrl:'/api/shelf-thumbnail?id='+encodeURIComponent(r.id),thumbnailVerifiedAt:now.toISOString(),thumbnailSource:r.preview.url,label:r.preview.alt||r.title};
      }catch(error){missing.push({id:r.id,error:error.message});}
    }}));
    const references=assets.filter(r=>previews[r.id]?.thumbnailVerifiedAt);
    if(!references.length)throw Error('No usable asset previews. Previous snapshot retained.');
    const edition=createShelfEdition(references,{previous:before.edition,rotate:true,now});
    const state={schemaVersion:1,references,previews,edition,refresh:{lastSuccess:now.toISOString(),cloudCompletedAt:now.toISOString(),nextScheduledDate:nextCollection(now),cadence:'Sunday · cloud',cloud:true,configured:true,assets:references.length,added:references.filter(r=>!before.references.some(p=>p.id===r.id)).length,failedSources:sources.filter(s=>s.status==='failed').length,previewFailures:missing.length,sources,missing}};
    // Publish the catalog only after all included thumbnails have been stored.
    await put(statePath,JSON.stringify(state),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});
    console.log('Shelf cloud refresh complete',JSON.stringify({assets:references.length,added:state.refresh.added,failedSources:state.refresh.failedSources,previewFailures:missing.length}));
    return {ok:true,assets:references.length,added:state.refresh.added,failedSources:state.refresh.failedSources,previewFailures:missing.length};
  }finally{
    // Overwrite our own lock with an expired timestamp instead of deleting data.
    await put(lockPath,JSON.stringify({expires:0}),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});
  }
}
export async function streamThumbnail(req,res){
  const id=new URL(req.url,'https://local.invalid').searchParams.get('id'),state=await loadCatalog(),p=state.previews[id];
  if(!p?.blobPath?.startsWith('shelf/thumbnails/'))return sendJson(res,{error:'No stored thumbnail'},404);
  const result=await get(p.blobPath,{access:'private'});if(result?.statusCode!==200)return sendJson(res,{error:'Thumbnail unavailable'},404);
  res.statusCode=200;res.setHeader('Content-Type',result.blob.contentType);res.setHeader('Cache-Control','private,max-age=86400');res.setHeader('X-Content-Type-Options','nosniff');
  for await(const chunk of result.stream)res.write(chunk);res.end();
}
