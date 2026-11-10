import keys from './texture-identities.js';
import * as THREE from 'three';

// The camera plate always has a locally loaded stand-in. Stream just the
// picture on screen, never a full hotel's worth of 1440p textures at once.
const hd=new Map(), failed=new Set();
let inFlight=null,latest=null,requestRender=()=>{};
const loader=new THREE.TextureLoader();
export function initPlates(redraw){requestRender=redraw;}
function pump(){
 if(inFlight||!latest||hd.has(latest)||failed.has(latest)||navigator.connection?.saveData)return;
 const file=latest;inFlight=file;
 loader.load('assets/masters-v18/'+file,t=>{
  t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;
  hd.set(file,t);while(hd.size>3){const [k,v]=hd.entries().next().value;hd.delete(k);v.dispose();}
  inFlight=null;requestRender();pump();
 },undefined,()=>{failed.add(file);inFlight=null;pump();});
}
export function renderPlate(renderer,scene,camera){
 const base=scene.background,file=base?.userData.masterPlate;
 if(!file){renderer.render(scene,camera);return;}
 latest=file;pump();const t=hd.get(file);
 if(!t){renderer.render(scene,camera);return;}
 hd.delete(file);hd.set(file,t);
 t.repeat.copy(base.repeat);t.offset.copy(base.offset);t.updateMatrix();scene.background=t;
 try{renderer.render(scene,camera);}finally{scene.background=base;}
}
export function plateStatus(){return {file:latest,masterReady:hd.has(latest),cached:hd.size,failed:[...failed]};}

const finishMaps=new Map();
export function finishMaterial(m,kind,relief=.00065){
 let map=finishMaps.get(kind);
 if(!map){
  map=loader.load('assets/surfaces-v18/'+kind+'.webp');map.wrapS=map.wrapT=THREE.RepeatWrapping;
  map.anisotropy=4;finishMaps.set(kind,map);
 }
 // Linear greyscale height and roughness detail, shared by all matching props.
 // A mapped costume retains the artist's colour texture and its UV transform.
 if(!m.roughnessMap)m.roughnessMap=map;
 if(!m.normalMap&&!m.bumpMap){m.bumpMap=map;m.bumpScale=relief;}
 return m;
}
const sharedPixels=new Map();
export function reuseIdenticalPixels(file,gltf){
 const ids=keys[file];if(!ids)return;
 gltf.scene.traverse(o=>{if(!o.isMesh)return;
  for(const m of [].concat(o.material))for(const t of [m.map,m.alphaMap,m.normalMap,m.roughnessMap,m.metalnessMap]){
   if(!t)continue;const idx=gltf.parser.associations.get(t)?.textures;
   const key=ids[gltf.parser.json.textures?.[idx]?.source];if(!key)continue;
   if(sharedPixels.has(key))t.source=sharedPixels.get(key);else sharedPixels.set(key,t.source);
  }
 });
}
export function costumeFinish(root){
 root.traverse(o=>{if(!o.isMesh||!o.geometry.attributes.uv)return;
  for(const m of [].concat(o.material)){
   if(!m.isMeshStandardMaterial)continue;
   for(const t of [m.map,m.normalMap])if(t)t.anisotropy=4;
   const n=m.name.toLowerCase();
   if(/eyebrow|eyelashes|skin\.short/.test(n)&&(m.transparent||m.alphaTest))m.alphaToCoverage=true;
   if(/elegantsuit|uniform|abandoned wool/.test(n)){m.roughness=.83;finishMaterial(m,'twill',.0007);}
   else if(/shoe|collar/.test(n)){m.roughness=.52;finishMaterial(m,'leather',.0005);}
   else if(/skin\.high-poly/.test(n))m.roughness=.30; // the iris/cornea mesh
   else if(/skin\.body/.test(n))m.roughness=.66;
   else if(/skin\.short/.test(n))m.roughness=.59;
   else if(/eyebrow|eyelashes/.test(n))m.roughness=.88;
   else if(/brass/.test(n))finishMaterial(m,'brass',.00035);
  }
 });
}
