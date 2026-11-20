import * as THREE from 'three';
import {geometry} from './support/geometry-only.mjs';
import {createCharacterEncounters} from '../src/character-encounters.js';
const noop=()=>{};
const ctx=new Proxy({createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]??noop});
globalThis.document={createElement:()=>({getContext:()=>ctx}),createElementNS:()=>({addEventListener:noop,removeEventListener:noop})};
const [adult,child,props,dog,staff,porter]=await Promise.all(['guest-v8','child-v5','encounter-props-v5','dog-v14','attendant-v5','porter-v5'].map(n=>geometry(n+'.glb')));
for(const [id,room] of [['C5','lounge'],['C6','baggage']])for(const anomaly of [null,id]){
 const cast=createCharacterEncounters(new THREE.Scene(),{adult,child,props,dog,staff,porter,persistent:true});
 const people=cast.cast.people,owners=id==='C5'?[[people[3],'l'],[people[4],'r']]:[[people[5],'l']];
 const prop=id==='C5'?cast.roots.C5.children.at(-1):cast.roots.C6.children[1];
 const old=new Map();let closestHands=Infinity;let bend=0;let fastest;let wristTurn=0,fingerTurn=0,propTravel=0,worstGap=0;
 const p=new THREE.Vector3(),q=new THREE.Quaternion();
 for(let i=0;i<1081;i++){
  const t=i/60;cast.update(t,1/60,room,{serial:1,vignette:id,anomaly});cast.roots[id].updateMatrixWorld(true);
  for(const [a,side] of owners)for(const name of ['hand','middle_02']){
   const bone=a.model.getObjectByName(name+'_'+side);if(name==='hand'){const bind=a.armPose.find(s=>s.bone===bone).rotation;bend=Math.max(bend,THREE.MathUtils.radToDeg(bind.angleTo(bone.quaternion)));}
   if(name==='hand')bone.getWorldQuaternion(q);else q.copy(bone.quaternion);
   if(i) {const d=THREE.MathUtils.radToDeg(q.angleTo(old.get(bone)));
    if(name==='hand'){if(d>wristTurn)fastest=[i,side];wristTurn=Math.max(wristTurn,d);}else fingerTurn=Math.max(fingerTurn,d);}
   old.set(bone,q.clone());
  }
  prop.getWorldPosition(p);
  if(i)propTravel=Math.max(propTravel,p.distanceTo(old.get(prop)));old.set(prop,p.clone());
  if(id==='C6')worstGap=Math.max(worstGap,cast.metrics.caseHandGap);
  if(id==='C5'){
   closestHands=Math.min(closestHands,cast.metrics.handoffSeparation);
   const phase=t%9,held=phase>.96&&phase<3.05||phase>(anomaly?6.88:5.72)&&phase<8.05;
   if(held)worstGap=Math.max(worstGap,cast.metrics.glassHandGap);
  }
 }
 console.log({id,anomaly,bend,wristTurn,fastest,fingerTurn,propTravel,worstGap,closestHands});
 if(closestHands<.24 || bend>28 || wristTurn>6 || fingerTurn>4 || propTravel>.012 || worstGap>.009)throw Error('Discontinuous grip or lost contact: '+id);
}
