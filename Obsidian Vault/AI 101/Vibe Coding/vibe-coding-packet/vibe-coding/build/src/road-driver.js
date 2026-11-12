import * as THREE from 'three';
import {calibrateHands,orientedPalm,applyFingerGrip} from './hand-pose.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';

const vec=(x,y,z)=>new THREE.Vector3(x,y,z);
const clamp=THREE.MathUtils.clamp,smooth=THREE.MathUtils.smoothstep,lerp=THREE.MathUtils.lerp;
const up=vec(0,1,0),side=vec(1,0,0);

export function rotateWorld(bone,axis,radians){
 const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion());
 const localAxis=axis.clone().applyQuaternion(parent.invert());
 bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(localAxis,radians));
 bone.updateWorldMatrix(false,true);
}
function align(bone,child,target){
 const p=bone.getWorldPosition(new THREE.Vector3());
 const old=child.getWorldPosition(new THREE.Vector3()).sub(p).normalize();
 const next=target.clone().sub(p).normalize();
 const q=new THREE.Quaternion().setFromUnitVectors(old,next);
 const world=bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(q);
 bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
 bone.updateWorldMatrix(false,true);
}
export function reach(chain,target,pole,weight=1,levelEnd=false){
 const [a,b,c]=chain,A=a.getWorldPosition(new THREE.Vector3()),B=b.getWorldPosition(new THREE.Vector3()),C=c.getWorldPosition(new THREE.Vector3());
 const endRot=c.getWorldQuaternion(new THREE.Quaternion());
 const startA=a.quaternion.clone(),startB=b.quaternion.clone();
 const u=A.distanceTo(B),l=B.distanceTo(C);
 const line=target.clone().sub(A),dist=clamp(line.length(),Math.abs(u-l)+.002,u+l-.001);
 line.normalize();const along=(u*u-l*l+dist*dist)/(2*dist);
 const bend=pole.clone().addScaledVector(line,-pole.dot(line)).normalize();
 const joint=A.clone().addScaledVector(line,along).addScaledVector(bend,Math.sqrt(Math.max(0,u*u-along*along)));
 align(a,b,joint);align(b,c,A.clone().addScaledVector(line,dist));
 if(weight<1){a.quaternion.slerp(startA,1-weight);b.quaternion.slerp(startB,1-weight);}
 if(levelEnd)c.quaternion.copy(c.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(endRot));
}

export function createRoadDriver(guestData,take){
 const root=new THREE.Group(),model=clone(guestData.scene);root.add(model);
 const bone=name=>model.getObjectByName(name);
 const chain=(names,s)=>names.map(name=>bone(name+'_'+s));
 const arms=['l','r'].map(s=>chain(['upperarm','lowerarm','hand'],s));
 const legs=['l','r'].map(s=>chain(['thigh','calf','foot'],s));
 calibrateHands(model);
 const rest=[];model.traverse(o=>{if(o.isBone)rest.push([o,o.quaternion.clone()]);});
 const mixer=new THREE.AnimationMixer(model);
 const action=name=>mixer.clipAction(guestData.animations.find(c=>c.name===name)).play();
 const idle=action('Idle'),walk=action('Walk');
 const pivot=bone('pelvis'),spine=bone('spine_01'),head=bone('head');
 const begin=vec(-5.70,0,6.15),handleStop=vec(-17.37,0,-13.13),inside=vec(-17.54,0,-15.32);
 const path=handleStop.clone().sub(begin),yaw=Math.atan2(-path.x,-path.z);
 const sockets=arms.map((chain,i)=>{
  const hand=chain[2],middle=bone('middle_01_'+(i?'r':'l'));
  const contact=middle.getWorldPosition(new THREE.Vector3()).lerp(hand.getWorldPosition(new THREE.Vector3()),.18);
  const socket=new THREE.Object3D();socket.name=i?'RightPalmContact':'LeftPalmContact';
  socket.position.copy(hand.worldToLocal(contact));hand.add(socket);return socket;
 });
 function plantHand(i,target,weight,normal,forward,curl){
  const [upper,lower,hand]=arms[i];
  const relative=lower.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(orientedPalm(hand,normal,forward));
  hand.quaternion.rotateTowards(relative,.68*weight);
  applyFingerGrip(model,i?'r':'l',curl*weight);
  const outward=upper.getWorldPosition(new THREE.Vector3()).sub(arms[1-i][0].getWorldPosition(new THREE.Vector3())).normalize();
  const pole=outward.multiplyScalar(.55).add(vec(0,-.80,0));
  reach([upper,lower,sockets[i]],target,pole,weight);
 }
 function animate(t,gait,distance){
  for(const [o,q] of rest)o.quaternion.copy(q);
  idle.time=t%idle.getClip().duration;walk.time=(distance/1.04%1)*walk.getClip().duration;
  idle.setEffectiveWeight(1-gait);walk.setEffectiveWeight(gait);mixer.update(0);
  for(const [o,q] of rest)q.copy(o.quaternion);
 }
 const joints=Object.fromEntries(take.names.map(n=>[n,new THREE.Vector3()]));
 function sampleTake(frame){
  const i=Math.floor(frame),j=Math.min(i+1,take.frames.length-1);
  take.names.forEach((name,k)=>{
   const a=take.frames[i][k],b=take.frames[j][k],u=frame-i;
   joints[name].set(-lerp(a[0],b[0],u),lerp(a[1],b[1],u),-lerp(a[2],b[2],u));
  });
 }
 function frame(t,car,carGrip,entryGrip,pushPad){
  if(t<14.45){
   animate(t,0,0);
   const f=clamp((t-7.88)*24,0,take.frames.length-1);
   sampleTake(f);
   const hip=joints.Pelvis,open=smooth(t,7.14,8.45),closing=smooth(t,11.62,12.54)*(1-smooth(t,12.90,13.23));
   const hipAxis=joints['L Thigh'].clone().sub(joints['R Thigh']);
   const seatedYaw=Math.atan2(hipAxis.z,-hipAxis.x);
   const settle=smooth(t,13.42,14.45);
   root.rotation.y=lerp(seatedYaw, yaw,settle);
   const pelvis=vec(-.50-.14*smooth(f,24,38)+1.63*hip.x-.035*closing, .415+(hip.y-.59106)*1.79-.064*closing, .10+hip.z*.84-.16*closing).add(car.position);
   root.position.set(0,0,0);root.updateMatrixWorld(true);
   const pivotAtOrigin=pivot.getWorldPosition(new THREE.Vector3());
   root.position.copy(pelvis).sub(pivotAtOrigin);
   root.updateMatrixWorld(true);
   const relative=name=>joints[name].clone().sub(hip).multiplyScalar(1.12).add(pelvis);
   // The recorded shoulders lead the turn, with the chest compressing over the planted thigh.
   const shoulders=joints['L UpperArm'].clone().sub(joints['R UpperArm']);
   const twist=Math.atan2(shoulders.z,-shoulders.x)-seatedYaw;
   rotateWorld(spine,up,Math.atan2(Math.sin(twist),Math.cos(twist))*.73-.28*closing);
   const core=joints.Neck.clone().sub(hip);core.z-=.12*closing;core.normalize();
   align(spine,bone('neck_01'),spine.getWorldPosition(new THREE.Vector3()).add(core));
   const face=joints.MNose.clone().sub(joints.Head);
   const gaze=Math.atan2(-face.x,-face.z)-seatedYaw;
   rotateWorld(head,up,.50*Math.atan2(Math.sin(gaze),Math.cos(gaze))-.48*closing);
   rotateWorld(head,side.clone().applyAxisAngle(up,seatedYaw),.10-.21*open+.16*smooth(t,10.1,11.5));
   for(const [i,s] of ['L','R'].entries()){
    const foot=joints[s+' Foot'],first=take.frames[0][take.names.indexOf(s+' Foot')];
    const swing=i?smooth(f,41,59):smooth(f,5,29);
    let x=(i?-.375:-.655)+(foot.x+first[0])*(i?1.68:2.0)-.05*open;
    let h=lerp(.20,.077,swing)+(foot.y-first[1])*1.16+.195*Math.sin(swing*Math.PI);
    let z=(i?-.36:-.35)+(foot.z+first[2])*1.12-(i?0:.16)*Math.sin(swing*Math.PI);
    const contact=i?smooth(f,58,62):smooth(f,26,30)*(1-smooth(f,63,68));
    x=lerp(x,i?-1.575:-1.218,contact);h=lerp(h,.077,contact);z=lerp(z,i?-.247:.18,contact);
    const ankle=vec(x,h,z).add(car.position);
    const pole=joints[s+' Calf'].clone().sub(joints[s+' Thigh']).normalize();
    reach(legs[i],ankle,pole,1,true);
    // The toe follows the filmed swivel even during a planted heel pivot.
    const toe=bone('ball_'+(i?'r':'l'));
    const sole=joints[s+' Toe0'].clone().sub(foot).normalize();
    if(toe)align(legs[i][2],toe,legs[i][2].getWorldPosition(new THREE.Vector3()).add(sole));
   }
   const doorGrip=carGrip.getWorldPosition(new THREE.Vector3());
   for(const [i,s] of ['L','R'].entries()){
    const recorded=relative(s+' Hand'),elbow=joints[s+' Forearm'].clone().sub(joints[s+' UpperArm']).normalize();
    const wheel=car.position.clone().add(vec(i?-.34:-.65,.72,-.50));
    const wrist=wheel.lerp(recorded,smooth(t,i?7.46:8.12,i?8.56:8.76));
    reach(arms[i],wrist,elbow,1,true);
    const wheelHold=1-smooth(t,i?7.30:6.48,i?7.86:6.96);
    if(wheelHold>0)plantHand(i,wheel,wheelHold,vec(i?-.9:.9,0,.25),vec(0,-.64,-.77),.65);
   }
   const opening=smooth(t,6.58,7.14)*(1-smooth(t,7.69,8.13));
   if(opening>0)plantHand(0,doorGrip,opening,vec(-.82,-.32,-.18),vec(-.3,.16,-.94),.59);
   if(closing>0)plantHand(1,pushPad.getWorldPosition(new THREE.Vector3()),closing,vec(.78,-.28,0),vec(.22,.05,-.97),.63);
   if(settle>0){
    for(const [o,base] of rest)o.quaternion.slerp(base,settle);
    root.position.lerp(begin,settle);
   }
   return;
  }
  // An editorial cut skips the middle of the path. Phase follows distance.
  const establishing=t<20.8;
  const d=establishing?Math.min(6.4,(t-14.45)*1.04):
   path.length()-2.60*(1-smooth(t,20.75,23.85));
  const enter=smooth(t,24.32,28.0);
  root.position.copy(begin).addScaledVector(path,d/path.length()).lerp(inside,enter);
  root.rotation.y=lerp(yaw,.06,smooth(t,21.4,23.65));
  const walking=establishing?smooth(t,14.45,15.0):1-smooth(t,23.1,23.85)+smooth(t,24.32,25.1);
  const travelled=d+enter*inside.distanceTo(handleStop);
  animate(t,Math.min(1,walking),travelled);
  root.updateMatrixWorld(true);
  const pushing=smooth(t,23.03,23.96)*(1-smooth(t,24.87,25.6));
  if(pushing>0)plantHand(1,entryGrip.getWorldPosition(new THREE.Vector3()),pushing,vec(0,-.8,-.6),vec(-.3,0,-.9),.63);
  return Math.floor(travelled/.52);
 }
 return {root,frame};
}

