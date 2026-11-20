import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
globalThis.self=globalThis;
globalThis.ProgressEvent ??= class {constructor(type,init){Object.assign(this,init);}};
export async function geometry(file){
 const raw=await readFile(new URL('../../assets/'+file,import.meta.url));
 const end=20+raw.readUInt32LE(12),doc=JSON.parse(raw.subarray(20,end));
 for(const m of doc.materials){for(const k of Object.keys(m))if(!['name','doubleSided'].includes(k))delete m[k];}
 delete doc.images;delete doc.textures;delete doc.extensionsRequired;
 doc.buffers[0].uri='data:application/octet-stream;base64,'+raw.subarray(end+8).toString('base64');
 return new GLTFLoader().parseAsync(JSON.stringify(doc),'');
}
