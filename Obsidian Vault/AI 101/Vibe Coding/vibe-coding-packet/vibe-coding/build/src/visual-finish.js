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
 loader.load('assets/masters-v31/'+file,t=>{
  t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;
  hd.set(file,t);while(hd.size>3){const [k,v]=hd.entries().next().value;hd.delete(k);v.dispose();}
  inFlight=null;requestRender();pump();
 },undefined,()=>{failed.add(file);inFlight=null;pump();});
}
export function renderPlate(renderer,scene,camera){
 const base=scene.background,file=base?.userData?.masterPlate;
 if(!file){renderer.render(scene,camera);return;}
 latest=file;pump();const t=hd.get(file);
 if(!t){renderer.render(scene,camera);return;}
 hd.delete(file);hd.set(file,t);
 t.repeat.copy(base.repeat);t.offset.copy(base.offset);t.updateMatrix();scene.background=t;
 try{renderer.render(scene,camera);}finally{scene.background=base;}
}
export function plateStatus(){return {file:latest,masterReady:hd.has(latest),cached:hd.size,failed:[...failed]};}

let roomReflection;
export function lightHotelMaterials(scene,intensity){
 if(!roomReflection){
  // A low-resolution reflection card for furniture and cloth against the baked rooms.
  // Three prefilters it once; a shaded brass edge reflects a wide, soft lamp.
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const ctx=canvas.getContext('2d'),wall=ctx.createLinearGradient(0,0,0,128);
  wall.addColorStop(0,'#392529');wall.addColorStop(.45,'#523c37');
  wall.addColorStop(.59,'#322129');wall.addColorStop(1,'#171016');
  ctx.fillStyle=wall;ctx.fillRect(0,0,256,128);
  for(const [x,width,color] of [[28,14,'#f0c39a'],[105,8,'#e6b184'],[175,22,'#8fa9b0'],[231,8,'#bf6a50']]){
   ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=8;ctx.fillRect(x,43,width,15);
  }
  roomReflection=new THREE.CanvasTexture(canvas);roomReflection.colorSpace=THREE.SRGBColorSpace;
  roomReflection.mapping=THREE.EquirectangularReflectionMapping;
 }
 scene.environment=roomReflection;scene.environmentIntensity=intensity;
}
const finishMaps=new Map();
const surfaceColors=new Map();
export function surfaceColor(file){
 if(!surfaceColors.has(file)){
  const texture=loader.load(file);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=8;
  surfaceColors.set(file,texture);
 }
 return surfaceColors.get(file);
}
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
// A repeatable, sub-pixel variation in skin oil. Only roughness is modulated,
 // preserving the authored MakeHuman pigmentation, pores and eyebrow silhouettes.
let pores;
function skinSurface(){
 if(pores)return pores;
 const pixels=new Uint8Array(128*128*4);let state=471;
 for(let i=0;i<pixels.length;i+=4){
  state=(Math.imul(state,1664525)+1013904223)>>>0;
  const value=209+(state>>>27);
  pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=255;
 }
 pores=new THREE.DataTexture(pixels,128,128);pores.wrapS=pores.wrapT=THREE.RepeatWrapping;
 pores.repeat.set(6,6);pores.magFilter=THREE.LinearFilter;pores.minFilter=THREE.LinearMipmapLinearFilter;
 pores.generateMipmaps=true;pores.needsUpdate=true;return pores;
}
export function costumeFinish(root){
 root.traverse(o=>{if(!o.isMesh||!o.geometry.attributes.uv)return;
  for(const m of [].concat(o.material)){
   if(!m.isMeshStandardMaterial)continue;
   for(const t of [m.map,m.normalMap,m.roughnessMap])if(t)t.anisotropy=8;
   const n=m.name.toLowerCase();
   if(/eyebrow|eyelashes|skin\.short/.test(n)&&(m.transparent||m.alphaTest))m.alphaToCoverage=true;
   if(/elegantsuit|uniform|abandoned wool/.test(n)){m.roughness=.87;finishMaterial(m,'twill',.00098);}
   else if(/shoe|collar/.test(n)){m.roughness=.58;finishMaterial(m,'leather',.00072);}
   else if(/skin\.high-poly/.test(n))m.roughness=.30; // the iris/cornea mesh
   else if(/skin\.body/.test(n)){m.roughness=.77;if(!m.roughnessMap)m.roughnessMap=skinSurface();}
   else if(/skin\.short/.test(n))m.roughness=.59;
   else if(/eyebrow|eyelashes/.test(n))m.roughness=.88;
   else if(/brass/.test(n))finishMaterial(m,'brass',.00035);
  }
 });
}
