import * as THREE from 'three';

const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const ease=THREE.MathUtils.smoothstep;

// Preserve the artist's authored assembly and bind each moving part to an
// upright pivot. This makes suspension and wheel rotations independent of the
// source file's Z-up transforms.
function pivotAt(parent,object,centre){
 const pivot=new THREE.Group();parent.add(pivot);
 pivot.position.copy(parent.worldToLocal(centre.clone()));
 pivot.updateWorldMatrix(true,false);pivot.attach(object);
 return pivot;
}
function flatTyre(wheel){
 const pieces=[];
 wheel.updateWorldMatrix(true,true);
 const inverseWheel=wheel.matrixWorld.clone().invert(),vertex=new THREE.Vector3();
 let rimRadius=0;
 wheel.traverse(o=>{
  if(!o.isMesh||!/^Rim/i.test(o.material.name))return;
  const local=inverseWheel.clone().multiply(o.matrixWorld),positions=o.geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
   vertex.fromBufferAttribute(positions,i).applyMatrix4(local);
   rimRadius=Math.max(rimRadius,Math.hypot(vertex.y,vertex.z));
  }
 });
 if(rimRadius<.1)throw Error('Vehicle rim missing.');
 const contactRadius=rimRadius+.012;
 wheel.traverse(o=>{
  if(!o.isMesh||!/^Tire(side|tread)/i.test(o.material.name))return;
  const g=o.geometry=o.geometry.clone(),pos=g.attributes.position,flat=pos.clone();
  const local=new THREE.Matrix4().copy(wheel.matrixWorld).invert().multiply(o.matrixWorld);
  const inverse=local.clone().invert(),point=new THREE.Vector3();
  for(let i=0;i<pos.count;i++){
   point.fromBufferAttribute(pos,i).applyMatrix4(local);
   // The rubber bulges at the contact patch. The alloy rim keeps its shape.
   const compression=Math.max(0,-contactRadius-point.y);
   point.x*=1+compression*5.9;point.z*=1+compression*.82;
   point.y=Math.max(point.y,-contactRadius);
   point.applyMatrix4(inverse);flat.setXYZ(i,point.x,point.y,point.z);
  }
  g.morphAttributes.position=[flat];o.updateMorphTargets();pieces.push(o);
 });
 if(!pieces.length)throw Error('Front tyre mesh missing from vehicle asset.');
 return {pieces,contactRadius};
}
export function rigNightCar(data){
 const car=new THREE.Group(),suspension=new THREE.Group();
 car.add(suspension);suspension.add(data.scene);data.scene.rotation.y=Math.PI;
 data.scene.traverse(o=>{
  if(!o.isMesh)return;
  const mat=o.material,name=mat.name||'';
  if(name==='Paint 1 Carmine'||name==='Paint 2 Carmine'){
   mat.map=null;mat.color.set(name.includes('1 ')?0x53606a:0x23282b);
   mat.roughness=.31;mat.metalness=.73;mat.clearcoat=1;mat.clearcoatRoughness=.128;
   mat.normalScale?.setScalar(.20);mat.clearcoatNormalScale?.setScalar(.12);mat.envMapIntensity=1.65;
  }
  if(name==='Glass'){
   mat.transmission=0;mat.transparent=true;mat.opacity=.22;
   mat.color.set(0x8da9b6);mat.depthWrite=false;
  }
  if(name==='Headlight'||name==='Brakelight'){
   mat.emissive.set(name==='Headlight'?0xffe6ba:0xc32014);mat.emissiveIntensity=name==='Headlight'?2.1:1.45;
  }
  if(/License|SteeringEmblem/i.test(o.name))o.visible=false;
 });
 car.updateMatrixWorld(true);
 const wheelNames=['WheelFrontL','WheelFrontR','WheelRearL','WheelRearR'];
 const wheels=wheelNames.map(name=>{
  const source=data.scene.getObjectByName(name);
  const wheel=pivotAt(car,source,source.getWorldPosition(new THREE.Vector3()));
  return {wheel,height:wheel.position.y};
 });
 const rubber=flatTyre(wheels[0].wheel);
 const leaf=data.scene.getObjectByName('BodyDoorLColor1');
 const hinge=pivotAt(suspension,leaf,leaf.getWorldPosition(new THREE.Vector3()));
 // Contact on the upper inside edge of the door, measured with the leaf shut.
 const grip=new THREE.Object3D();hinge.add(grip);
 grip.position.copy(hinge.worldToLocal(v(-.835,.62,-.26)));
 const pushPad=new THREE.Object3D();hinge.add(pushPad);
 // Find a real painted/contact surface at the top of the open door, separate
 // from the inside pull used while seated. Store it in hinge space.
 hinge.rotation.y=-.94;car.updateMatrixWorld(true);
 const wanted=v(-1.71,.94,-.29),point=new THREE.Vector3(),best=new THREE.Vector3();
 let nearest=Infinity;
 for(const name of ['BodyDoorLColor1','InteriorDoorL02','InteriorDoorL03']){
  const panel=data.scene.getObjectByName(name)||hinge.getObjectByName(name);
  if(!panel)continue;
  panel.traverse(o=>{if(!o.isMesh||/Window|Mirror|Handle/.test(o.name))return;
   const coords=o.geometry.attributes.position;
   for(let i=0;i<coords.count;i++){point.fromBufferAttribute(coords,i).applyMatrix4(o.matrixWorld);const d=point.distanceToSquared(wanted);
    if(d<nearest){nearest=d;best.copy(point);}
   }
  });
 }
 pushPad.position.copy(hinge.worldToLocal(best));hinge.rotation.y=0;

 function pose(time,remainingDistance){
  const damage=ease(time,2.4,3.13),settle=ease(time,2.83,3.48);
  const drop=Math.max(0,wheels[0].height-rubber.contactRadius);
  // The nose loads under braking, then the springs settle as the tread collapses.
  const brake=ease(time,2.12,2.45)*(1-ease(time,2.84,3.10));
  const t=Math.max(0,time-2.91);
  const rebound=Math.exp(-4.1*t)*Math.sin(12*t);
  suspension.rotation.set(-drop*.21*damage-.023*brake+.012*rebound,0,drop*.17*damage+.006*rebound);
  suspension.position.y=-drop*.42*damage-.013*brake+.009*rebound;
  wheels.forEach(({wheel,height},i)=>{
   wheel.rotation.x=remainingDistance/.384;
   wheel.position.y=height-(i===0?drop*damage:i===2?.012*damage:0);
  });
  rubber.pieces.forEach(o=>o.morphTargetInfluences[0]=settle);
  const open=ease(time,7.16,8.72)-ease(time,12.75,13.78);
  hinge.rotation.y=-.94*open;
 }
 return {car,pose,grip,pushPad};
}

