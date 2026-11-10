import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {canonicalUrl,reusableAsset} from '../src/core.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'assets/previews');
export function imageExtension(bytes){
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.length>32&&bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0)return 'png';
  if(bytes[0]===255&&bytes[1]===216&&bytes.at(-2)===255&&bytes.at(-1)===217)return 'jpg';
  if(/^GIF8[79]a/.test(bytes.toString('ascii',0,6))&&bytes.length>32)return 'gif';
  if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'&&bytes.length>32)return 'webp';
  const svg=bytes.toString('utf8');
  if(/<svg[\s>]/.test(svg)&&/<\/svg>/.test(svg)&&!/<script|<foreignObject|<image|\bon\w+\s*=|(?:href|url)\s*[:=(]/i.test(svg))return 'svg';
  throw Error('Not a complete supported image');
}
async function download(input){
  let url=canonicalUrl(input);
  for(let i=0;i<5;i++){
    const response=await fetch(url,{redirect:'manual',headers:{'User-Agent':'DesignShelf/3.0 (licensed asset previews)'},signal:AbortSignal.timeout(25000)});
    if([301,302,303,307,308].includes(response.status)){url=canonicalUrl(new URL(response.headers.get('location'),url).href);await response.body?.cancel();continue;}
    if(!response.ok)throw Error('Preview returned '+response.status);
    const chunks=[];let size=0;
    for await(const chunk of response.body){size+=chunk.length;if(size>6000000)throw Error('Preview exceeds 6 MB');chunks.push(chunk);}
    const bytes=Buffer.concat(chunks);return {bytes,extension:imageExtension(bytes)};
  }
  throw Error('Too many preview redirects');
}
export async function cacheAssetThumbnails({force=false}={}){
  const assets=JSON.parse(await fs.readFile(path.join(root,'data/assets.json'),'utf8')).filter(reusableAsset);
  const manifestFile=path.join(root,'config/asset-previews.json');
  const manifest=JSON.parse(await fs.readFile(manifestFile,'utf8'));
  await fs.mkdir(directory,{recursive:true});let cursor=0;const missing=[];let ready=0;
  await Promise.all(Array.from({length:5},async()=>{while(cursor<assets.length){
    const r=assets[cursor++],p=manifest[r.id]||{},local=p.tryPoster||(p.kind==='icons'?p.file:null)||(p.kind==='image'?p.file:null);
    const source=local?'local:'+local:p.kind==='font'?'local:'+p.file:p.kind==='video'?p.poster:p.url||r.preview?.url;
    try{
      if(p.kind==='font'){
        const bytes=await fs.readFile(path.join(directory,p.file));if(bytes.toString('ascii',0,4)!=='wOF2')throw Error('Invalid font specimen');
      }else if(local){imageExtension(await fs.readFile(path.join(directory,local)));p.thumbnailFile=local;}
      else if(!force&&p.thumbnailFile&&p.thumbnailSource===source){imageExtension(await fs.readFile(path.join(directory,p.thumbnailFile)));}
      else{
        if(!source)throw Error('No original asset preview');
        const {bytes,extension}=await download(source),hash=createHash('sha256').update(source).digest('hex').slice(0,10);
        p.thumbnailFile=r.id+'-'+hash+'.'+extension;await fs.writeFile(path.join(directory,p.thumbnailFile),bytes);
      }
      Object.assign(p,{thumbnailSource:source,thumbnailVerifiedAt:new Date().toISOString(),label:p.label||r.preview?.alt||r.title+' original asset preview'});
      manifest[r.id]=p;ready++;
    }catch(error){
      // A failed refresh may retain only an already verified preview of this exact source.
      let retained=false;if(p.thumbnailSource===source&&p.thumbnailFile)try{imageExtension(await fs.readFile(path.join(directory,p.thumbnailFile)));retained=true;ready++;}catch{}
      if(!retained)delete p.thumbnailVerifiedAt;
      manifest[r.id]=p;missing.push({id:r.id,title:r.title,error:error.message,retained});
    }
  }}));
  await fs.writeFile(manifestFile,JSON.stringify(manifest,null,2));
  const result={checkedAt:new Date().toISOString(),assets:assets.length,ready,missing};
  await fs.writeFile(path.join(root,'.local/thumbnail-status.json'),JSON.stringify(result,null,2));
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=await cacheAssetThumbnails({force:process.argv.includes('--force')});console.log(JSON.stringify(result,null,2));
  if(result.ready===0)process.exitCode=1;
}
