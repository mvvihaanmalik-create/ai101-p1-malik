import {readFile, readdir, mkdir, copyFile, writeFile, unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Only runtime assets enter this standalone upload directory.
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'.deploy','room-zero-v6');
const files=new Set(['index.html','music-credits.html','assets/hotel-v15.json','assets/ending-v6.json','assets/rocketbox-LICENSE.txt']);
async function tree(folder){
 for(const entry of await readdir(path.join(root,folder),{withFileTypes:true})){
  const name=folder+'/'+entry.name;
  if(entry.isDirectory())await tree(name);else files.add(name);
 }
}
for(const recording of ['ending-v35.mp4','ending-v36-1080p.mp4'])files.add('downloads/'+recording);
await tree('assets/surfaces-v18');await tree('src');await tree('vendor');await tree('assets/fonts');
for(const file of [...files].filter(f=>f.startsWith('src/')&&f.endsWith('.js'))){
 const source=await readFile(path.join(root,file),'utf8');
 for(const match of source.matchAll(/['"](assets\/[^'"]+\.(?:glb|json|png|webp|mp3))['"]/g))files.add(match[1]);
}
function plates(value){
 if(typeof value==='string'&&value.endsWith('.webp')){files.add('assets/proxies-v31/'+value);files.add('assets/masters-v31/'+value);}
 else if(value&&typeof value==='object')Object.values(value).forEach(plates);
}
for(const name of ['hotel-v15.json','ending-v6.json'])plates(JSON.parse(await readFile(path.join(root,'assets',name),'utf8')));
// Remove only obsolete files listed by our previous runtime manifest.
let previous=[];try{previous=JSON.parse(await readFile(path.join(root,'.deploy','manifest-current.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
for(const entry of previous){if(files.has(entry.file))continue;const target=path.resolve(output,entry.file);if(!target.startsWith(output+path.sep))throw Error('Invalid obsolete runtime path');await unlink(target).catch(e=>{if(e.code!=='ENOENT')throw e;});}
await mkdir(output,{recursive:true});
const manifest=[];
for(const file of [...files].sort()){
 const source=path.join(root,file),target=path.join(output,file);
 if(!source.startsWith(root)||!target.startsWith(output+path.sep))throw Error('Invalid runtime path');
 await mkdir(path.dirname(target),{recursive:true});await copyFile(source,target);
 const bytes=await readFile(target);
 manifest.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await copyFile(path.join(root,'node_modules/three/LICENSE'),path.join(output,'THREE-LICENSE.txt'));
await writeFile(path.join(output,'vercel.json'),JSON.stringify({framework:null,buildCommand:'',installCommand:'',outputDirectory:'.',headers:[{source:'/(.*)',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]},{source:'/downloads/(.*)',headers:[{key:'Content-Disposition',value:'attachment'}]}]},null,2)+'\n');
await writeFile(path.join(output,'.vercelignore'),'.env*\n.vercel/\n.gitignore\n');
await writeFile(path.join(root,'.deploy','manifest-current.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({output,files:manifest.length+3,bytes:manifest.reduce((sum,f)=>sum+f.bytes,0),excluded:'Blender files, build tools, logs, node_modules, vault notes, old unused assets'},null,2));
