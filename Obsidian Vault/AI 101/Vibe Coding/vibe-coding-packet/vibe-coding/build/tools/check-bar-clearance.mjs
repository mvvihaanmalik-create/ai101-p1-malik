import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {geometry} from './support/geometry-only.mjs';
import {createCharacterEncounters} from '../src/character-encounters.js';

const noop=()=>{};
const ctx=new Proxy({createRadialGradient:()=>({addColorStop:noop})},{get:(obj,key)=>obj[key]??noop});
globalThis.document={createElement:()=>({getContext:()=>ctx}),createElementNS:()=>({addEventListener:noop,removeEventListener:noop})};
const [adult,child,props,dog,staff,porter]=await Promise.all(['guest-v8','child-v5','encounter-props-v5','dog-v14','attendant-v5','porter-v5'].map(name=>geometry(name+'.glb')));
const hotel=JSON.parse(await readFile(new URL('../assets/hotel-v15.json',import.meta.url)));
const cameras=hotel.cameras.filter(c=>c.room==='lounge').map(c=>{
 const camera=new THREE.PerspectiveCamera(c.fov,16/9,.05,100);
 camera.position.fromArray(c.position);camera.lookAt(new THREE.Vector3(...c.target));
 camera.zoom=c.name==='lounge'?1.18:1.30;camera.updateProjectionMatrix();camera.updateMatrixWorld();
 return camera;
});
const cast=createCharacterEncounters(new THREE.Scene(),{adult,child,props,dog,staff,porter,persistent:true});
function hands(model){
 let mesh;model.traverse(o=>{if(o.isSkinnedMesh&&/skin\.body$/i.test(o.material.name))mesh=o;});
 const {skinIndex,skinWeight}=mesh.geometry.attributes;
 const ids=[];for(let i=0;i<skinIndex.count;i++){
  let weight=0;for(let j=0;j<4;j++){
   const bone=mesh.skeleton.bones[skinIndex.getComponent(i,j)];
   if(/^(hand|pinky|ring|middle|index|thumb)_/.test(bone.name))weight+=skinWeight.getComponent(i,j);
  }
  if(weight>=.5)ids.push(i);
 }
 assert.ok(ids.length>100);return {mesh,ids};
}
const actors=cast.cast.people.slice(3,5).map(p=>hands(p.model)),world=new THREE.Vector3(),screen=new THREE.Vector3();
for(const variant of ['normal','changed','wine']){
 const minGap=[Infinity,Infinity],frames=variant==='wine'?328:541;
 for(let i=0;i<frames;i++){
  const t=i/60;
  cast.update(t,1/60,'lounge',{serial:1,vignette:'C5',anomaly:variant==='changed'?'C5':null,wineTime:variant==='wine'?t:null});
  cast.roots.C5.updateMatrixWorld(true);
  const edges=actors.map(({mesh,ids},actorIndex)=>{
   const result=Array(2).fill(actorIndex?Infinity:-Infinity);
   for(const id of ids){
    mesh.getVertexPosition(id,world).applyMatrix4(mesh.matrixWorld);
    for(let c=0;c<cameras.length;c++){
     const x=screen.copy(world).project(cameras[c]).x;
     result[c]=actorIndex?Math.min(result[c],x):Math.max(result[c],x);
    }
   }
   return result;
  });
  for(let c=0;c<cameras.length;c++)minGap[c]=Math.min(minGap[c],(edges[1][c]-edges[0][c])*640);
 }
 console.log({variant,frames,minimumHandGapAt1280px:{wide:minGap[0].toFixed(1),counter:minGap[1].toFixed(1)}});
 assert.ok(minGap.every(n=>n>4),'Visible hand silhouettes overlap: '+variant);
}
