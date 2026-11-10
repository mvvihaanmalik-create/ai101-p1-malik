import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {lookupSourceAsset} from '../design-shelf/scripts/collect-assets.mjs';
import {canonicalUrl} from '../design-shelf/src/core.mjs';
import {hash,atomic,need} from './store.mjs';

// Use the same local object store as Design Shelf. No private Site token is read.
export function createShelf(root){
  const shelf=path.join(root,'Project-03/design-shelf'),objects=path.join(shelf,'.local/objects');
  const file=key=>path.join(objects,encodeURIComponent(key));
  const bucket={
    async get(key){try{const raw=fs.readFileSync(file(key),'utf8');return {etag:hash(raw),json:async()=>JSON.parse(raw)};}catch(e){if(e.code==='ENOENT')return null;throw e;}},
    async put(key,value,options={}){let raw;try{raw=fs.readFileSync(file(key),'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}if(options.onlyIf?.etagMatches&&options.onlyIf.etagMatches!==hash(raw||''))return null;atomic(file(key),value);return {etag:hash(value)};},
    async list({prefix=''}){return {objects:fs.existsSync(objects)?fs.readdirSync(objects).map(name=>({key:decodeURIComponent(name)})).filter(o=>o.key.startsWith(prefix)&&!o.key.endsWith('.tmp')):[]};},
  };
  let worker;
  async function api(route,body){if(route==='/api/import'){const url=canonicalUrl(body.url),existing=(await api('/api/library')).references.find(r=>r.url===url);if(existing)return {reference:existing};const config=JSON.parse(fs.readFileSync(path.join(shelf,'config/asset-sources.json'),'utf8')),asset=await lookupSourceAsset(url,config);if(asset){await api('/api/references',{references:[asset]});return {reference:asset};}}worker||=(await import(pathToFileURL(path.join(shelf,'dist/server/index.js')).href)).default;const response=await worker.fetch(new Request('http://localhost'+route,{method:body?'POST':'GET',headers:{'oai-authenticated-user-id':'local-owner',...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})}),{BUCKET:bucket},{waitUntil:()=>{}});const data=await response.json();need(response.ok,data.error||'Shelf unavailable.',502);return data;}
  return {api, async library(){return api('/api/library');},async save(projectId,referenceId,saved){const data=await api('/api/saved');const items=data.saved.filter(s=>!(s.projectId===projectId&&s.referenceId===referenceId));if(saved)items.push({projectId,referenceId,savedAt:new Date().toISOString()});return api('/api/saved',{saved:items});}};
}
