import {collectAssets} from './collect-assets.mjs';
import {cacheAssetThumbnails} from './cache-asset-thumbnails.mjs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import {createShelfEdition} from '../src/core.mjs';

export async function refreshAssets({force=false}={}){
  const collected=await collectAssets({force});if(collected.skipped)return collected;
  const thumbnails=await cacheAssetThumbnails();
  if(!thumbnails.ready)throw Error('No verified previews. Build stopped.');
  const root=new URL('../',import.meta.url),assets=JSON.parse(await fs.readFile(new URL('data/assets.json',root),'utf8')),previews=JSON.parse(await fs.readFile(new URL('config/asset-previews.json',root),'utf8'));
  let previous;try{previous=JSON.parse(await fs.readFile(new URL('data/shelf-edition.json',root),'utf8'));}catch{}
  const edition=createShelfEdition(assets.filter(r=>previews[r.id]?.thumbnailVerifiedAt),{previous,rotate:true});
  await fs.writeFile(new URL('data/shelf-edition.json',root),JSON.stringify(edition,null,2));
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[fileURLToPath(new URL('./build.mjs',import.meta.url))],{windowsHide:true,stdio:'inherit'});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('Shelf build failed.')));});
  return {...collected,previews:thumbnails.ready,previewFailures:thumbnails.missing};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(await refreshAssets({force:process.argv.includes('--force')}),null,2));}catch(error){console.error(error.message);process.exitCode=1;}
}
