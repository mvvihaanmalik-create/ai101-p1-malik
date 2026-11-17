import * as THREE from 'three';
import {calibrateHands,captureArmPose,restoreArmPose,applyFingerGrip} from './hand-pose.js';
import {reach} from './road-driver.js';

const v=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const ease=(t,a,b)=>THREE.MathUtils.smootherstep(t,a,b);
// One complete stride. Turn before moving, then look back after stopping.
export function welcomeStep(t){
 const travel=ease(t,36.45,38.65);
 return {distance:1.04*travel,weight:ease(t,36.45,36.85)*(1-ease(t,38.25,38.65)),
  yaw:Math.PI-Math.PI/2*ease(t,35.85,36.45)*(1-ease(t,38.65,39.40))};
}

export function createWelcomeCandle(scene,holder,model){
 calibrateHands(model);const arms=captureArmPose(model);
 const chain=side=>['upperarm','lowerarm','hand'].map(n=>model.getObjectByName(n+'_'+side));
 const right=chain('r'),left=chain('l'),hand=left[2],wristRest=hand.quaternion.clone();
 // Measure the socket with the fingers already closed around the stem.
 applyFingerGrip(model,'l',.72);holder.updateWorldMatrix(true,true);
 const grip=model.getObjectByName('middle_02_l').getWorldPosition(v())
  .lerp(model.getObjectByName('thumb_03_l').getWorldPosition(v()),.38);
 const socket=new THREE.Object3D();socket.position.copy(hand.worldToLocal(grip));hand.add(socket);
 restoreArmPose(arms);
 const candle=new THREE.Group();scene.add(candle);
 const brass=new THREE.MeshStandardMaterial({color:0x8a6240,metalness:.7,roughness:.38});
 const wax=new THREE.MeshStandardMaterial({color:0xd2bd92,roughness:.8});
 const add=(g,m,y)=>{const o=new THREE.Mesh(g,m);o.position.y=y;candle.add(o);return o;};
 add(new THREE.CylinderGeometry(.065,.078,.018,32),brass,-.09);
 add(new THREE.CylinderGeometry(.012,.017,.13,24),brass,-.015);
 add(new THREE.CylinderGeometry(.043,.03,.025,32),brass,.058);
 add(new THREE.CylinderGeometry(.019,.021,.14,24),wax,.133);
 add(new THREE.CylinderGeometry(.0015,.002,.012,8),new THREE.MeshStandardMaterial({color:0x302018}),.208);
 const flame=add(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:0xffc173}),.228);flame.scale.set(.008,.023,.008);
 const light=new THREE.PointLight(0xffb05d,0,2);light.position.y=.24;candle.add(light);
 let lit=false,guide=0;
 const localPoint=b=>holder.worldToLocal(b.getWorldPosition(v()));
 return {
  restore(){restoreArmPose(arms);},
  pose(t,visible=true){
   candle.visible=visible;if(!visible)return;
   holder.updateWorldMatrix(true,true);
   // This rig's right shoulder is +X and its left shoulder is -X.
   // Solve to the wrist, not past the fingers. Keep the wrist's neutral local rotation.
   const sway=.006*Math.sin(t*1.55),breath=.004*Math.sin(t*1.18);
   reach(left,holder.localToWorld(v(-.285,1.17+breath,-.255+sway)),v(-.58,-.92,.13).applyQuaternion(holder.quaternion));
   hand.quaternion.copy(wristRest);applyFingerGrip(model,'l',.72);
   guide=ease(t,48.65,50.10)*(1-ease(t,54.45,56.35));
   if(guide>0){
    const destination=holder.localToWorld(v(.46,1.30,-.285));
    reach(right,destination,v(.62,-.86,.10).applyQuaternion(holder.quaternion),guide);
    // The open hand follows the forearm instead of retaining a downward world pose.
    applyFingerGrip(model,'r',.14*guide);
   }
   holder.updateWorldMatrix(true,true);candle.position.copy(socket.getWorldPosition(v()));
   candle.rotation.set(.012*Math.sin(t*1.18),holder.rotation.y,.010*Math.sin(t*1.55));
   lit=t>=46.38;flame.visible=lit;const flutter=1+.045*Math.sin(t*15)+.025*Math.sin(t*31);
   light.intensity=lit?.72*flutter:0;flame.scale.y=.023*flutter;
  },
  snapshot(){return {lit,visible:candle.visible,guide:+guide.toFixed(3),
   right:right.map(localPoint).map(p=>p.toArray()),left:left.map(localPoint).map(p=>p.toArray()),
   wristBend:THREE.MathUtils.radToDeg(wristRest.angleTo(hand.quaternion)),
   gripGap:candle.position.distanceTo(socket.getWorldPosition(v()))};}
 };
}
