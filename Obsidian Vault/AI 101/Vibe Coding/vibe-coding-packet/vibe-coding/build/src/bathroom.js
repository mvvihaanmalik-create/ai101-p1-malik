import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {fitSmile} from './character-performance.js';
import {finishMaterial,surfaceColor} from './visual-finish.js';

// A repeating glaze with irregular ceramic edges. The same room is visible in the glass.
function ceramic(floor){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');ctx.fillStyle=floor?'#262620':'#434944';ctx.fillRect(0,0,512,512);
 let seed=417;const random=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
 const size=floor?32:64;
 for(let j=0;j<512/size;j++)for(let i=0;i<512/size;i++){
  const shade=Math.floor(random()*12),light=floor?(i+j)%2?44:26:57;
  ctx.fillStyle='hsl('+(floor?43:158)+' 12% '+(light+shade)+'%)';
  ctx.fillRect(i*size+1,j*size+1,size-2,size-2);
  ctx.fillStyle='#fff2';ctx.fillRect(i*size+2,j*size+2,size-4,1);
 }
 for(let i=0;i<19000;i++){ctx.fillStyle=random()>.48?'#2d221515':'#f5e4bf14';ctx.fillRect(random()*512,random()*512,random()*3+.4,1);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;
 const packed=new Uint8Array(512*512*4);
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const dx=x%size,dy=y%size,d=Math.min(dx,dy,size-1-dx,size-1-dy);
  const bevel=THREE.MathUtils.smoothstep(d,.15,2.65),i=4*(y*512+x);
  const wear=.5+.5*Math.sin(x*.065+Math.sin(y*.091))*Math.cos(y*.056);
  packed[i]=Math.round(55+bevel*163+random()*5);
  packed[i+1]=Math.round(232-bevel*(floor?110:149)+12*wear);
  packed[i+2]=0;packed[i+3]=255;
 }
 const relief=new THREE.DataTexture(packed,512,512);relief.flipY=true;
 relief.generateMipmaps=true;relief.minFilter=THREE.LinearMipmapLinearFilter;relief.magFilter=THREE.LinearFilter;
 relief.wrapS=relief.wrapT=THREE.RepeatWrapping;relief.anisotropy=8;relief.needsUpdate=true;
 return {color:texture,relief};
}

function bloodMaterial(clean){
 const stained=clean.clone();stained.name=clean.name+' (mirror)';
 stained.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 stainPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nstainPosition=position;');
  shader.fragmentShader='varying vec3 stainPosition;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   vec2 p=stainPosition.xy;
   float grain=sin(p.x*164.0+cos(p.y*115.0))*sin(p.y*157.0)+0.48*sin(357.0*p.x+211.0*p.y);
   float streak=sin(p.x*630.0+sin(p.y*29.0)*0.75)+0.45*sin(p.x*1430.0+p.y*17.0);
   float wound=length((p-vec2(-0.037,1.77))/vec2(0.057,0.133));
   float collar=length((p-vec2(-0.042,1.52))/vec2(0.14,0.27));
   float sleeve=length((p-vec2(0.31,1.12))/vec2(0.16,0.22));
   float channel=sin(p.x*330.+.6*sin(p.y*17.+p.x*32.));
   float rivulet=length(vec2((p.x+.016+.003*sin(p.y*48.))/.006,(p.y-1.65)/.14));
   float edge=min(rivulet,min(wound,min(collar,sleeve))+.12*grain+.18*channel+.095*streak);
   float mask=1.0-smoothstep(.88,1.12,edge);
   vec3 coagulated=mix(vec3(.038,.0015,.002),vec3(.20,.004,.005),clamp(.46+.25*grain+.13*streak,0.,1.));
   diffuseColor.rgb=mix(diffuseColor.rgb,coagulated*(.67+.6*diffuseColor.r),mask*.96);`);
 };
 stained.customProgramCacheKey=()=>'bathroom-blood-v1';return stained;
}

export function createBathroom(scene,guest){
 const root=new THREE.Group();root.position.x=240;root.visible=false;scene.add(root);
 const material=(color,roughness=.55,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const brass=finishMaterial(material(0x9c7946,.32,.7),'brass'),wood=finishMaterial(material(0x382b25),'walnut');
 wood.map=surfaceColor('assets/smoked-walnut-v31.webp');wood.color.setHex(0xcfbbab);
 const enamel=new THREE.MeshPhysicalMaterial({color:0xd8d4bd,roughness:.24,clearcoat:.76,clearcoatRoughness:.14}),dark=material(0x203431,.35),wall=material(0x49534b,.92),marble=material(0x252e2a,.27);
 marble.map=surfaceColor('assets/verde-marble-v31.webp');marble.color.setHex(0xe0e6dc);
 function object(geometry,mat,x,y,z){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);root.add(m);return m;}
 const box=(x,y,z,w,h,d,m)=>object(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const globe=(x,y,z,w,h,d,m)=>{const g=object(new THREE.SphereGeometry(1,24,14),m,x,y,z);g.scale.set(w,h,d);return g;};
 function pipe(points,r){return object(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),18,r,8,false),brass,0,0,0);}
 const tile=ceramic(false),floor=ceramic(true);
 function tiled(x,y,z,w,h,turn,tex,span){
  const m=material(0xffffff,.84);m.map=tex.color;m.bumpMap=m.roughnessMap=tex.relief;m.bumpScale=.0045;
  const geo=new THREE.PlaneGeometry(w,h),uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/span,uv.getY(i)*h/span);
  const pane=object(geo,m,x,y,z);pane.rotation.y=turn;return pane;
 }
 tiled(.35,.013,-5.4,6,9,0,floor,2.5).rotation.x=-Math.PI/2;
 for(const [x,turn] of [[-1.68,Math.PI/2],[3.35,-Math.PI/2]]){
  tiled(x,1.02,-5.4,8.8,2.04,turn,tile,1.55);box(x,2.85,-5.4,.07,1.62,8.8,wall);
  box(x+.044*Math.sign(turn),2.07,-5.4,.1,.08,8.8,dark);
 }
 for(const [z,turn] of [[-9.48,0],[-1.15,Math.PI]]){
  tiled(.82,1.02,z,5.04,2.04,turn,tile,1.55);box(.82,2.84,z,5.05,1.65,.065,wall);
 }
 box(.82,3.65,-5.35,5.12,.1,8.6,wall);
 // Panelled WC doors and a transom provide depth behind the reflected guest.
 for(const z of [-3.4,-5.1,-6.8]){
  box(2.9,1.13,z,.10,2.07,1.55,dark);
  for(const y of [.72,1.66])box(2.83,y,z,.044,.73,1.21,wood);
  globe(2.77,1.13,z+.55,.05,.043,.044,brass);box(2.92,2.24,z,.16,.09,1.68,brass);
 }
 box(.16,1.16,-9.39,1.56,2.32,.10,brass);box(.16,1.11,-9.31,1.44,2.22,.10,wood);
 for(const y of [.58,1.60])box(.16,y,-9.24,1.13,.78,.045,dark);
 globe(.7,1.12,-9.18,.05,.05,.055,brass);
 const zCenter=-5.5,mirrorX=-1.54;
 box(mirrorX-.045,1.82,zCenter,.095,1.54,3.45,brass);
 const mirror=new Reflector(new THREE.PlaneGeometry(3.37,1.46),{color:0xf6f2e8,textureWidth:1024,textureHeight:640,clipBias:.001,multisample:0});
 mirror.position.set(mirrorX+.01,1.82,zCenter);mirror.rotation.y=Math.PI/2;root.add(mirror);
 box(-1.38,.94,zCenter,.56,.11,3.45,marble);
 for(const z of [-4.72,-6.28]){
  const bowl=object(new THREE.LatheGeometry([[.003,0],[.14,.005],[.25,.055],[.31,.143],[.315,.156],[.304,.166],[.29,.15],[.235,.083],[.11,.03],[.035,.026],[.003,.024]].map(([r,h])=>new THREE.Vector2(r,h)),48),enamel,-1.26,1.0,z);
  bowl.scale.z=1.36;
  // Inset bowl and drain, two ceramic taps and a curved brass spout.

  globe(-1.26,1.028,z,.023,.004,.023,brass);
  pipe([[-1.56,1.01,z],[-1.55,1.31,z],[-1.43,1.34,z],[-1.39,1.27,z]],.022);
  for(const dz of [-.17,.17])globe(-1.50,1.10,z+dz,.044,.035,.044,enamel);
  pipe([[-1.28,.88,z],[-1.28,.54,z],[-1.47,.48,z],[-1.62,.62,z]],.034);
 }
 const lit=new THREE.MeshStandardMaterial({color:0xffdebb,emissive:0xffd3a2,emissiveIntensity:1.25,roughness:.3});
 for(const z of [-3.61,-7.39]){
  box(-1.57,1.87,z,.14,.22,.11,brass);pipe([[-1.56,1.86,z],[-1.40,1.89,z],[-1.38,2.0,z]],.025);
  globe(-1.38,2.10,z,.11,.155,.11,lit);
 }
 const smile=fitSmile(guest);
 const replacements=[];
 guest.traverse(mesh=>{if(mesh.isMesh&&/skin\.body|elegantsuit/.test(mesh.material?.name))replacements.push({mesh,clean:mesh.material,bloody:bloodMaterial(mesh.material)});});
 let changed=false,passes=0;
 const renderReflection=mirror.onBeforeRender.bind(mirror);
 mirror.onBeforeRender=(...args)=>{
  const visible=guest.visible;guest.visible=true;smile(changed?0:.70);
  if(changed)for(const p of replacements)p.mesh.material=p.bloody;
  try{renderReflection(...args);passes++;}finally{
   for(const p of replacements)p.mesh.material=p.clean;smile(0);guest.visible=visible;
  }
 };
 return {
  background:new THREE.Color(0x161b1a),
  enter(active,bloody){root.visible=active;changed=active&&bloody;},
  aim(camera){const dz=guest.position.z;camera.position.set(guest.position.x-.20,1.76,dz+.08);camera.lookAt(2*(240+mirrorX)-guest.position.x,1.59,dz);},
  snapshot(){return {changed,passes,clean:replacements.every(p=>p.mesh.material===p.clean),surfaces:replacements.length};}
 };
}
