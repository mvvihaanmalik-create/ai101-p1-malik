import {Quaternion,Vector3,MathUtils,Matrix4} from 'three';

// Constant animation tracks are not necessarily rewritten by AnimationMixer.
// Restore the authored pose before applying procedural offsets, every frame.
export function captureArmPose(model){
 const bones=[];
 model.traverse(b=>{if(b.isBone&&/^(upperarm|lowerarm|hand|thumb|index|middle|ring|pinky)/.test(b.name))bones.push({bone:b,rotation:b.quaternion.clone()});});
 return bones;
}
export function restoreArmPose(pose){for(const {bone,rotation} of pose)bone.quaternion.copy(rotation);}
const axis=new Vector3(1,0,0),turn=new Quaternion();
export function calibrateHands(model){
 model.updateWorldMatrix(true,true);
 for(const side of ['r','l']){
  const hand=model.getObjectByName('hand_'+side),middle=model.getObjectByName('middle_01_'+side),index=model.getObjectByName('index_01_'+side),pinky=model.getObjectByName('pinky_01_'+side);
  if(!hand||!middle||!index||!pinky)continue;
  const wrist=hand.getWorldPosition(new Vector3()),forward=middle.getWorldPosition(new Vector3()).sub(wrist).normalize();
  const across=index.getWorldPosition(new Vector3()).sub(pinky.getWorldPosition(new Vector3())).normalize();
  const normal=new Vector3().crossVectors(across,forward).normalize();
  const center=model.getObjectByName('spine_03').getWorldPosition(new Vector3()).sub(wrist);if(normal.dot(center)<0)normal.negate();
  const inverse=hand.getWorldQuaternion(new Quaternion()).invert();
  hand.userData.palmForward=forward.clone().applyQuaternion(inverse);hand.userData.palmNormal=normal.clone().applyQuaternion(inverse);
  for(const name of ['index','middle','ring','pinky','thumb'])for(let segment=1;segment<=3;segment++){
   const b=model.getObjectByName(`${name}_${String(segment).padStart(2,'0')}_${side}`);if(!b)continue;
   const child=b.children.find(c=>c.isBone);
   const origin=b.getWorldPosition(new Vector3()),rotation=b.getWorldQuaternion(new Quaternion());
   const direction=child?child.getWorldPosition(new Vector3()).sub(origin).normalize():new Vector3(0,1,0).applyQuaternion(rotation);
   const inward=name==='thumb'?index.getWorldPosition(new Vector3()).sub(origin).normalize():normal;
   b.userData.flexAxis=new Vector3().crossVectors(direction,inward).normalize().applyQuaternion(rotation.invert());
  }
 }
}
function frame(forward,normal){
 const y=forward.clone().normalize(),z=normal.clone().addScaledVector(y,-normal.dot(y)).normalize(),x=new Vector3().crossVectors(y,z);
 return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(x,y,z));
}
export function orientedPalm(hand,normal,forward){
 return frame(forward,normal).multiply(frame(hand.userData.palmForward,hand.userData.palmNormal).invert());
}
export function applyFingerGrip(model,side,amount){
 const grip=MathUtils.clamp(amount,0,1);
 for(const [name,variation] of [['index',.85],['middle',1],['ring',1.04],['pinky',1.08],['thumb',.56]]){
  for(let segment=1;segment<=3;segment++){
   const bone=model.getObjectByName(`${name}_${String(segment).padStart(2,'0')}_${side}`);
   if(bone)bone.quaternion.multiply(turn.setFromAxisAngle(bone.userData.flexAxis||axis,[0,.53,.84,.43][segment]*grip*variation));
  }
 }
}
