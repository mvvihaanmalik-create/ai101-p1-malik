import * as THREE from 'three';
import {finishMaterial,surfaceColor} from './visual-finish.js';

// Cooper-inspired proportions on the existing CC0 rig, preserving its weights,
// UVs, animation clips and eye placement. This is an approximation, not a scan.
export function refineGuestFace(root){
 let eyes;root.traverse(m=>{if(/skin\.high-poly$/i.test(m.material?.name))eyes=m;});
 if(!eyes)return;
 eyes.geometry.computeBoundingBox();const b=eyes.geometry.boundingBox;
 const eye=(b.min.y+b.max.y)/2,unit=(b.max.x-b.min.x)/.096,front=b.min.z+.044*unit;
 root.traverse(mesh=>{
  if(!mesh.isMesh)return;const name=mesh.material?.name||'';
  if(/skin\.short/i.test(name)){mesh.material=mesh.material.clone();mesh.material.color.setHex(0x292522);}
  if(!/skin\.body$|eyebrow/i.test(name))return;
  mesh.geometry=mesh.geometry.clone();const p=mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   let x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(z>front||y<eye-.18*unit)continue;
   const h=(y-eye)/unit,side=x/unit;
   const jaw=Math.exp(-(((h+.105)/.036)**2)),cheek=Math.exp(-(((h+.035)/.025)**2));
   x*=1+.14*jaw-.04*cheek;
   const chin=Math.exp(-((side/.032)**2+((h+.119)/.025)**2));
   z-=.006*unit*chin;
   const bridge=Math.exp(-((side/.018)**2+((h+.018)/.045)**2));z-=.003*unit*bridge;
   if(/eyebrow/i.test(name))y-=.002*unit;
   p.setXYZ(i,x,y,z);
  }
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
 });
}

// Actual furniture with a visible front and top. Characters retain full bodies
// behind it, rather than being clipped at an invisible depth-only rectangle.
export function createReceptionCounter(scene){
 const group=new THREE.Group();scene.add(group);
 const wood=finishMaterial(new THREE.MeshStandardMaterial({color:0x493027,roughness:.64}),'walnut');
 wood.map=surfaceColor('assets/smoked-walnut-v31.webp');
 const stone=new THREE.MeshStandardMaterial({color:0x172a26,roughness:.27,metalness:.1});
 stone.map=surfaceColor('assets/verde-marble-v31.webp');
 const brass=new THREE.MeshStandardMaterial({color:0x8e6940,roughness:.38,metalness:.65});
 function box(w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);group.add(m);}
 box(2.90,1.10,.94,31.5,.55,-6.9,wood);
 box(3.08,.12,1.08,31.5,1.16,-6.9,stone);
 box(2.96,.055,.98,31.5,.065,-6.9,brass);
 for(const x of [30.16,31.05,31.95,32.84])box(.035,.90,.025,x,.58,-6.415,brass);
 for(const y of [.16,1.02])box(2.72,.026,.025,31.5,y,-6.415,brass);
 // Register and a live green-shaded lamp sit on the actual counter surface.
 box(.58,.035,.35,31.30,1.24,-6.65,new THREE.MeshStandardMaterial({color:0xcbbd98,roughness:.9}));
 box(.22,.035,.16,32.12,1.24,-6.75,brass);
 box(.024,.27,.024,32.12,1.39,-6.75,brass);
 const shade=new THREE.Mesh(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x286a50,emissive:0x24704b,emissiveIntensity:.65,side:THREE.DoubleSide,roughness:.3}));
 shade.scale.set(.24,.12,.13);shade.position.set(32.12,1.54,-6.75);group.add(shade);
 const lamp=new THREE.PointLight(0xa0d6b4,1.2,1.8);lamp.position.set(32.12,1.48,-6.72);group.add(lamp);
 return group;
}
