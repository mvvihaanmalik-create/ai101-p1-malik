import fs from 'node:fs';
import {canonicalUrl} from '../data/core.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
export default async function handler(req,res){
  try{
    const url=new URL(req.url,'https://local.invalid'),id=url.searchParams.get('id');
    const r=catalog.references.find(r=>r.id===id);let target=url.searchParams.has('poster')?r?.preview?.poster:r?.preview?.url;
    if(!target){res.statusCode=404;return res.end('No preview');}
    let response;
    for(let i=0;i<4;i++){
      target=canonicalUrl(target);response=await fetch(target,{redirect:'manual',headers:{'User-Agent':'DesignShelf/2.0 (original source preview)',...(req.headers.range?{Range:req.headers.range}:{})},signal:AbortSignal.timeout(15000)});
      if([301,302,303,307,308].includes(response.status)){const next=response.headers.get('location');await response.body?.cancel();target=new URL(next,target).href;continue;}break;
    }
    if(!response.ok||!/^(image|video)\//.test(response.headers.get('content-type')||'')){res.statusCode=502;return res.end('Preview unavailable');}
    res.statusCode=response.status;res.setHeader('Content-Type',response.headers.get('content-type'));res.setHeader('Cache-Control','private,max-age=86400');
    for(const key of ['Content-Range','Accept-Ranges'])if(response.headers.has(key))res.setHeader(key,response.headers.get(key));
    for await(const chunk of response.body)res.write(chunk);res.end();
  }catch{res.statusCode=502;res.end('Preview unavailable');}
}
