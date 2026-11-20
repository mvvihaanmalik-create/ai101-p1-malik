import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {solveArm} from '../src/arm-kinematics.js';
import {Bone,Group,AnimationMixer,AnimationClip,QuaternionKeyframeTrack} from 'three';
import {captureArmPose,restoreArmPose,applyFingerGrip} from '../src/hand-pose.js';
test('arm solver preserves bone lengths and clamps unreachable targets without NaNs',()=>{
 for(const target of [new Vector3(0,0,0),new Vector3(0,-10,0),new Vector3(.2,-.3,.1),new Vector3(.001,0,0)]){
  const shoulder=new Vector3(),r=solveArm(shoulder,target,.30,.27,new Vector3(0,-1,0));
  assert.ok(Math.abs(r.elbow.distanceTo(shoulder)-.30)<1e-8);
  assert.ok(Math.abs(r.elbow.distanceTo(r.wrist)-.27)<1e-8);
  assert.ok(r.wrist.length()<=.57*.96+1e-9);
  assert.ok([...r.elbow.toArray(),...r.wrist.toArray()].every(Number.isFinite));
 }
});

test('constant animation tracks cannot accumulate finger curl across frames or frame rates',()=>{
 for(const fps of [30,60,120]){
  const model=new Group(),finger=new Bone();finger.name='middle_02_r';model.add(finger);
  const mixer=new AnimationMixer(model),clip=new AnimationClip('Idle',2,[new QuaternionKeyframeTrack('middle_02_r.quaternion',[0,2],[0,0,0,1,0,0,0,1])]);
  mixer.clipAction(clip).play();mixer.update(0);const rest=captureArmPose(model);
  restoreArmPose(rest);mixer.update(1/fps);applyFingerGrip(model,'r',1);const first=finger.quaternion.clone();
  for(let frame=0;frame<fps*60;frame++){
   restoreArmPose(rest);mixer.update(1/fps);applyFingerGrip(model,'r',1);
   assert.ok(finger.quaternion.angleTo(first)<1e-6,'grip should not tighten or spin as time elapses');
  }
  restoreArmPose(rest);mixer.update(1/fps);applyFingerGrip(model,'r',0);
  assert.ok(finger.quaternion.angleTo(rest[0].rotation)<1e-6,'release returns to authored open hand');
 }
});
test('reachable grip stays on target and elbow stays on its anatomical pole side',()=>{
 const target=new Vector3(.2,-.3,.1),pole=new Vector3(.35,-.8,.18),r=solveArm(new Vector3(),target,.30,.27,pole);
 assert.ok(r.wrist.distanceTo(target)<1e-8);
 const axis=target.clone().normalize(),bend=r.elbow.clone().addScaledVector(axis,-r.elbow.dot(axis));
 assert.ok(bend.dot(pole)>0);
});
