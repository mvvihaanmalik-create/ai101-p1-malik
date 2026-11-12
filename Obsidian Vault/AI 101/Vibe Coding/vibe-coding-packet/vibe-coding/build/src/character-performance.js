import * as THREE from 'three';

// These MakeHuman exports share a face layout, but the heads have different proportions.
// Measure each face against its own eye line before lifting the lip corners and cheeks.
const smiles=new WeakMap(),browShapes=new WeakMap();
function fitBrow(mesh){
 if(!mesh)return ()=>{};
 const source=mesh.geometry;let shape=browShapes.get(source);
 if(!shape){
  const pos=source.attributes.position;const delta=new Float32Array(pos.count*3);
  if(!source.boundingBox)source.computeBoundingBox();
  const width=source.boundingBox.max.x-source.boundingBox.min.x;
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i)/width,arch=Math.exp(-((Math.abs(x)-.26)**2)/.032);
   delta[i*3+1]=width*(x>0?.072:-.019)*arch;
  }
  shape=source.clone();shape.morphTargetsRelative=true;shape.morphAttributes.position=[new THREE.BufferAttribute(delta,3)];browShapes.set(source,shape);
 }
 mesh.geometry=shape;mesh.updateMorphTargets();return value=>{mesh.morphTargetInfluences[0]=value;};
}

// A greeting comes and goes on the tour. On upper floors its peak is
// delayed, then held. This envelope is independent of the anomaly draw.
export function socialBeat(age,floor){
 const unease=Math.max(0,Math.min(4,floor))/4;
 const delay=.10+unease*.90,hold=2.1+unease*4;
 const greet=THREE.MathUtils.smoothstep(age,delay,delay+.64);
 const release=THREE.MathUtils.smoothstep(age,hold,hold+1.1);
 return {unease,gaze:greet*(1-release*(1-unease)),nod:greet*(1-THREE.MathUtils.smoothstep(age,delay+.72,delay+1.48))};
}
export function fitSmile(root){
 let skin,eyes,brow;
 root.traverse(o=>{if(o.isMesh&&/eyebrow/i.test(o.material?.name))brow=o;if(o.isMesh&&/skin\.body$/i.test(o.material?.name))skin=o;if(o.isMesh&&/skin\.high-poly$/i.test(o.material?.name))eyes=o;});
 if(!skin||!eyes)return ()=>{};
 const source=skin.geometry;let shape=smiles.get(source);
 if(!shape){
  if(!eyes.geometry.boundingBox)eyes.geometry.computeBoundingBox();
  const bounds=eyes.geometry.boundingBox;const eyeY=(bounds.min.y+bounds.max.y)*.5;
  const unit=(bounds.max.x-bounds.min.x)/.096;
  const pos=source.attributes.position,delta=new Float32Array(pos.count*3);
  const mouthY=eyeY-.068*unit,front=bounds.min.z+.044*unit;
  for(let i=0;i<pos.count;i++){
   if(pos.getZ(i)>front)continue;
   const x=pos.getX(i)/unit,y=(pos.getY(i)-mouthY)/unit;
   const lip=Math.exp(-(((Math.abs(x)-.026)/.018)**2+(y/.020)**2));
   const cheek=Math.exp(-(((Math.abs(x)-.040)/.024)**2+((y-.026)/.026)**2));
   delta[i*3]=Math.sign(x)*unit*(.0045*lip+.0015*cheek);
   delta[i*3+1]=unit*(.009*lip+.004*cheek);
   delta[i*3+2]=unit*(-.0018*cheek+.002*lip);
  }
  shape=source.clone();shape.morphTargetsRelative=true;
  shape.morphAttributes.position=[new THREE.BufferAttribute(delta,3)];smiles.set(source,shape);
 }
 skin.geometry=shape;skin.updateMorphTargets();
 const liftBrow=fitBrow(brow);
 return (value,arch=0)=>{skin.morphTargetInfluences[0]=value;liftBrow(arch);};
}

// Remove last frame's secondary motion before sampling the next authored pose.
export function secondaryPose(root,names){
 const joints=Object.fromEntries(names.map(name=>[name,root.getObjectByName(name)]).filter(([,bone])=>bone));
 const original=new Map(),cache=new WeakMap();
 return {
  restore(){for(const [bone,pose] of original)bone.quaternion.copy(pose);original.clear();},
  turn(name,x=0,y=0,z=0){const bone=joints[name];if(!bone)return;
   let q=cache.get(bone);if(!q){q=new THREE.Quaternion();cache.set(bone,q);}
   if(!original.has(bone)){q.copy(bone.quaternion);original.set(bone,q);}
   bone.rotateX(x);bone.rotateY(y);bone.rotateZ(z);
  }
 };
}
