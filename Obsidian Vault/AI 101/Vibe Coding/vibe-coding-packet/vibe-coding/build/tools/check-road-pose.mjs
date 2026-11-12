import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {createRoadDriver} from '../src/road-driver.js';
import {rigNightCar} from '../src/night-car.js';
import {geometry} from './support/geometry-only.mjs';
const guest=await geometry('guest-v8.glb'),vehicle=rigNightCar(await geometry('night-car-v28.glb'));
const take=JSON.parse(await readFile(new URL('../assets/driver-exit-v28.json',import.meta.url),'utf8'));
const driver=createRoadDriver(guest,take),door=new THREE.Object3D(),pos=b=>b.getWorldPosition(new THREE.Vector3());
const measure=(leg)=>{
 const [hip,knee,ankle]=['thigh','calf','foot'].map(n=>pos(driver.root.getObjectByName(n+'_'+leg)));
 const angle=hip.clone().sub(knee).angleTo(ankle.clone().sub(knee))*180/Math.PI;
 return {angle:+angle.toFixed(1),ankle:ankle.toArray().map(n=>+n.toFixed(3)),knee:knee.toArray().map(n=>+n.toFixed(3))};
};
vehicle.car.position.set(-4.1,0,6);
const samples=[],handMetrics={};let maxOpeningGap=0,maxClosingGap=0;let lastHandPose;
for(let f=0;f<=14.45*60;f++){
 const t=f/60;vehicle.pose(t,0);vehicle.car.updateMatrixWorld(true);driver.frame(t,vehicle.car,vehicle.grip,door,vehicle.pushPad);
 if(t>=7.15&&t<=7.67)maxOpeningGap=Math.max(maxOpeningGap,pos(driver.root.getObjectByName('LeftPalmContact')).distanceTo(pos(vehicle.grip)));
 if(t>=12.53&&t<=12.90)maxClosingGap=Math.max(maxClosingGap,pos(driver.root.getObjectByName('RightPalmContact')).distanceTo(pos(vehicle.pushPad)));
 if(f>=384){
  samples.push({t,l:measure('l'),r:measure('r')});
  const current=['hand_l','hand_r','head','spine_01'].map(name=>driver.root.getObjectByName(name).getWorldQuaternion(new THREE.Quaternion()));
  if(lastHandPose)current.forEach((q,i)=>{
   const turn=THREE.MathUtils.radToDeg(q.angleTo(lastHandPose[i]));
   if(turn>(handMetrics[i]?.turn??0))handMetrics[i]={turn:+turn.toFixed(2),t:+t.toFixed(3)};
  });
  lastHandPose=current;
 }
}

for(const leg of ['l','r']){
 const angles=samples.map(s=>s[leg].angle),slow=Math.min(...angles),peak=Math.max(...angles);
 const jump=Math.max(...angles.slice(1).map((v,i)=>Math.abs(v-angles[i])));
 const [start,end]=leg==='l'?[9.16,10.47]:[10.49,13.38];
 const stance=samples.filter(s=>s.t>=start&&s.t<=end).map(s=>new THREE.Vector3(...s[leg].ankle));
 const drift=Math.max(...stance.map(p=>p.distanceTo(stance[0])));
 console.log(JSON.stringify({leg,sampledFrames:angles.length,minDegrees:slow,maxDegrees:peak,maxDegreesPerFrame:+jump.toFixed(2),plantedAnkleDriftMeters:drift}));
 if(slow<50||peak>170||jump>4||drift>.005)throw Error('Car exit contact regression: '+leg);
}

console.log('Peak frame rotations (left wrist, right wrist, head, torso)',handMetrics);

console.log({maxOpeningGap,maxClosingGap});if(Math.max(maxOpeningGap,maxClosingGap)>.006)throw Error('Door contact gap');
if(Object.values(handMetrics).some(m=>m.turn>7))throw Error('Discontinuous upper-body turn');
