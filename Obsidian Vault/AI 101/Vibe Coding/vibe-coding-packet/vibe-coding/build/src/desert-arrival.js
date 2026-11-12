import * as THREE from 'three';
import {rigNightCar} from './night-car.js';
import {createRoadDriver} from './road-driver.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const vector=(x,y,z)=>new THREE.Vector3(x,y,z);
const smooth=(t,a,b)=>THREE.MathUtils.smoothstep(t,a,b);
const mix=THREE.MathUtils.lerp;
export const ROAD_DURATION=28.35;
const finish=(color,metalness=0,roughness=.75)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const luminous=color=>new THREE.MeshBasicMaterial({color});
const cube=new THREE.BoxGeometry(1,1,1);
function mesh(parent,geometry,material,x,y,z){
 const part=new THREE.Mesh(geometry,material);part.position.set(x,y,z);parent.add(part);return part;
}
function box(parent,mat,x,y,z,w,h,d){
 const part=mesh(parent,cube,mat,x,y,z);part.scale.set(w,h,d);return part;
}
function rod(parent,mat,from,to,r,top=r){
 const a=vector(...from),b=vector(...to),mid=a.clone().lerp(b,.5);
 const stem=mesh(parent,new THREE.CylinderGeometry(top,r,a.distanceTo(b),9),mat,...mid.toArray());
 stem.quaternion.setFromUnitVectors(vector(0,1,0),b.sub(a).normalize());return stem;
}
function panel(parent,mat,corners){
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute([0,1,2,0,2,3].flatMap(i=>corners[i]),3));geo.computeVertexNormals();
 return mesh(parent,geo,mat,0,0,0);
}
function grain(seed){
 return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}
// Batch fixed scenery by material. Moving wheels, door and character stay independent.
function bake(root){
 root.updateMatrixWorld(true);
 const inverse=root.matrixWorld.clone().invert(),sets=new Map();
 root.traverse(o=>{if(!o.isMesh)return;
  const geom=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
  geom.applyMatrix4(inverse.clone().multiply(o.matrixWorld));
  if(!o.material.map)geom.deleteAttribute('uv');
  const key=o.material;
  if(!sets.has(key))sets.set(key,[]);sets.get(key).push(geom);
 });
 root.clear();
 for(const [material,parts] of sets){
  const combined=mergeGeometries(parts);root.add(new THREE.Mesh(combined,material));parts.forEach(part=>part.dispose());
 }
}
function canvasTexture(width,height,paint){
 const c=document.createElement('canvas');c.width=width;c.height=height;paint(c.getContext('2d'));
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
function mistTexture(){
 return canvasTexture(128,128,ctx=>{
  const rng=grain(401);
  for(let i=0;i<36;i++){
   const a=rng()*Math.PI*2,r=rng()*32,x=64+Math.cos(a)*r,y=64+Math.sin(a)*r,sz=13+rng()*20;
   const g=ctx.createRadialGradient(x,y,1,x,y,sz);g.addColorStop(0,'rgba(217,218,209,.19)');g.addColorStop(1,'rgba(217,218,209,0)');
   ctx.fillStyle=g;ctx.fillRect(x-sz,y-sz,2*sz,2*sz);
  }
 });
}
function grounds(scene){
 const staticSet=new THREE.Group();scene.add(staticSet);
 const rng=grain(1249),stucco=finish(0x76564d),sand=finish(0x65514a),stone=finish(0x563834),trim=finish(0x8c6656);
 const dark=finish(0x281c21),leaf=luminous(0x05070a),bark=luminous(0x06080b),metal=finish(0x4d4140,.36);
 // Material grain is sampled in metres, so large walls and the desert floor retain detail.
 for(const [surface,scale,amount] of [[stucco,1.2,.33],[sand,.62,.48],[stone,2.0,.24]]){
  surface.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec3 exteriorPos;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n exteriorPos=(modelMatrix*vec4(transformed,1.)).xyz;');
   shader.fragmentShader='varying vec3 exteriorPos;\nfloat grainHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}\nfloat surfaceNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(grainHash(i),grainHash(i+vec3(1,0,0)),f.x),mix(grainHash(i+vec3(0,1,0)),grainHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(grainHash(i+vec3(0,0,1)),grainHash(i+vec3(1,0,1)),f.x),mix(grainHash(i+vec3(0,1,1)),grainHash(i+vec3(1,1,1)),f.x),f.y),f.z);}\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\nvec3 p=exteriorPos*${scale.toFixed(2)};float grit=surfaceNoise(p)*.5+surfaceNoise(p*8.)*.3+surfaceNoise(p*68.)*.2;diffuseColor.rgb*=1.+(grit-.5)*${(amount*3).toFixed(2)};`);
  };
  surface.customProgramCacheKey=()=>String(scale);
 }
 const gravel=canvasTexture(256,256,ctx=>{const im=ctx.createImageData(256,256);
  for(let i=0;i<im.data.length;i+=4){const n=178+rng()*60;im.data.set([n,n,n,255],i);}ctx.putImageData(im,0,0);});
 gravel.wrapS=gravel.wrapT=THREE.RepeatWrapping;gravel.repeat.set(12,85);
 const road=finish(0x424047);road.map=gravel;box(staticSet,sand,0,-.15,0,380,.2,380);
 box(staticSet,road,-3,-.044,0,7.4,.09,220);
 for(const x of [-3.12,-2.95])for(let z=-83;z<85;z+=7)box(staticSet,stripe,x,.007,z,.066,.009,4.9);
 function ridge(z,h,color){
  const positions=[];const m=finish(color);m.side=THREE.DoubleSide;
  let last=h*.55;
  for(let x=-400;x<400;x+=4){
   const k=h*(.5+.24*Math.sin(x*.071+z)+.18*Math.sin(x*.17)+rng()*.19);
   positions.push(x,-1,z,x,last,z,x+4,k,z,x,-1,z,x+4,k,z,x+4,-1,z);last=k;
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();staticSet.add(new THREE.Mesh(g,m));
 }
 ridge(-76,18,0x584859);ridge(-59,10,0x503e4d);
 const shrub=finish(0x504432);
 for(let i=0;i<220;i++){
  let x=(rng()-.5)*130,z=(rng()-.5)*130;if(Math.abs(x+3)<4.4||(x<-5&&x>-31&&z>-29&&z<8))continue;
  const h=.12+rng()*.46;const rock=mesh(staticSet,new THREE.IcosahedronGeometry(1,0),shrub,x,.04,z);rock.scale.set(h*1.5,h,h);rock.rotation.y=rng()*6;
 }
 for(let z=-64;z<72;z+=17){
  rod(staticSet,bark,[2.3,0,z],[2.45,5.8,z],.11,.075);box(staticSet,bark,2.45,5.44,z,1.5,.12,.12);
  for(const x of [1.85,3.05])for(let k=0;k<4;k++){
   const sag=i=>5.49-.53*Math.sin(Math.PI*i/4);rod(staticSet,dark,[x,sag(k),z+k*4.25],[x,sag(k+1),z+(k+1)*4.25],.011);
  }
 }
 const hotel=new THREE.Group();hotel.position.set(-17,0,-14);staticSet.add(hotel);
 // Open the wall around the doorway so the actor can actually cross it.
 for(const x of [-5.8,5.8]){
  box(hotel,stucco,x,6.48,-2.6,9.4,12.96,5.2);
  box(hotel,stone,x,.31,.04,9.4,.62,.20);
 }
 box(hotel,stucco,0,7.87,-2.60,2.22,10.18,5.2);
 box(hotel,dark,0,1.40,-3.50,2.30,2.80,.18);
 box(hotel,trim,0,12.96,-2.6,21.6,.22,5.6);box(hotel,dark,0,13.15,-2.6,21.4,.14,5.4);
 box(hotel,stucco,0,13.01,-2.1,6.1,1.45,4.4);box(hotel,trim,0,13.78,-2.1,6.35,.15,4.62);
 const panes=['#ed3027','#b5131b','#66151e','#e13b29'].map(tint=>{
  const tex=canvasTexture(128,192,ctx=>{
   const light=ctx.createRadialGradient(70,115,2,60,88,128);light.addColorStop(0,tint);light.addColorStop(.6,tint);light.addColorStop(1,'#21151c');ctx.fillStyle=light;ctx.fillRect(0,0,128,192);
   for(let i=0;i<128;i++){ctx.fillStyle='rgba(31,9,15,'+(.12+.16*(1+Math.sin(i*.35))+Math.max(0,1-i/34)*.34)+')';ctx.fillRect(i,0,1,192);}
   ctx.fillStyle='#24191c88';ctx.fillRect(0,0,128,16);ctx.fillRect(0,174,128,18);
  });return new THREE.MeshBasicMaterial({map:tex});
 });
 for(let row=0;row<4;row++)for(let i=-4;i<=4;i++){
  if(!row&&Math.abs(i)<2)continue;
  const x=i*2.18,y=1.92+row*3.03;
  box(hotel,dark,x,y,.04,1.35,1.84,.10);box(hotel,panes[(i+row+5)%4],x,y,.106,1.14,1.63,.035);
  for(const k of [-1,1])box(hotel,stone,x+k*.48,y,.13,.13,1.64,.038);
  box(hotel,dark,x,y,.145,.039,1.66,.035);box(hotel,dark,x,y+.28,.146,1.14,.044,.025);
  box(hotel,trim,x,y-.92,.15,1.53,.09,.29);
 }
 box(hotel,stone,0,2.96,1.04,6.8,.33,2.35);box(hotel,trim,0,3.18,1.04,7.10,.13,2.5);
 for(const x of [-2.95,2.95]){box(hotel,trim,x,1.48,1.97,.33,2.96,.33);box(hotel,stone,x,.29,1.97,.52,.58,.52);}
 const insideWall=luminous(0x4b111e);
 box(hotel,insideWall,0,1.36,-2.95,2.22,2.72,.08);
 for(const x of [-.90,-.64,-.38,-.12,.14,.40,.66,.92])box(hotel,dark,x,1.38,-2.88,.028,2.72,.04);
 box(hotel,stone,0,.014,-1,2.17,.055,3.55);
 // Two ribbed porch lanterns give the threshold a visible source of warm light.
 const lanternGlass=luminous(0xe8a16a),brass=finish(0x8b6748,.56,.41);
 for(const x of [-1.39,1.39]){
  box(hotel,brass,x,1.92,.16,.30,.55,.16);
  box(hotel,lanternGlass,x,1.92,.255,.22,.41,.04);
  for(const side of [-1,0,1])box(hotel,brass,x+side*.079,1.92,.284,.012,.42,.014);
  for(const z of [1.71,2.13])box(hotel,brass,x,z,.255,.27,.035,.10);
 }
 const signMap=canvasTexture(1024,144,ctx=>{
  const rng=grain(7301);
  ctx.fillStyle='#181619';ctx.fillRect(0,0,1024,144);
  ctx.strokeStyle='#75584b';ctx.lineWidth=3;ctx.strokeRect(9,9,1006,126);
  ctx.font='68px Georgia';ctx.fillStyle='#deb998';ctx.textBaseline='middle';ctx.fillText('H O T E L',105,74);
  const x0=514;ctx.save();
  // Only fragments of old gilding survive under the gouges.
  ctx.fillStyle='#8b6952';for(let i=0;i<70;i++)ctx.fillRect(x0+rng()*362,47+rng()*47,2+rng()*6,1+rng()*5);
  for(let i=0;i<245;i++){
   const x=x0-40+rng()*385,y=37+rng()*75,len=19+rng()*112;
   ctx.lineWidth=.6+rng()*2.9;ctx.strokeStyle=['#3a2a27','#8a7564','#090b0e','#51372e'][i%4];
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+len*.4,y-5-rng()*10);ctx.lineTo(x+len,y-9-rng()*23);ctx.stroke();
  }
  ctx.restore();
  for(const x of [25,999])for(const y of [24,120]){ctx.fillStyle='#927762';ctx.beginPath();ctx.arc(x,y,3.2,0,7);ctx.fill();}
 });
 box(hotel,new THREE.MeshBasicMaterial({map:signMap,color:0xccab94}),0,3.54,.17,5.4,.76,.10);
 const entryDoor=new THREE.Group();entryDoor.position.set(-18.06,0,-13.77);scene.add(entryDoor);
 function doorLeaf(group,cx,z){
  box(group,dark,cx,1.28,z,1.055,2.56,.09);
  for(const h of [.64,1.77]){
   for(const dx of [-.40,.40])box(group,stone,cx+dx,h,z+.065,.038,.88,.04);
   for(const dy of [-.44,.44])box(group,stone,cx,h+dy,z+.065,.82,.038,.04);
  }
 }
 doorLeaf(entryDoor,.53,0);doorLeaf(hotel,.54,.22);
 const handle=new THREE.Group();handle.position.set(.87,1.12,.10);entryDoor.add(handle);
 box(handle,metal,-.075,0,.018,.18,.033,.056);
 box(hotel,metal,.17,1.12,.32,.18,.033,.056);
 const grip=new THREE.Object3D();grip.position.set(-.08,0,.05);handle.add(grip);
 for(const x of [-1.58,1.58]){
  box(hotel,metal,x,2.03,.15,.24,.53,.20);box(hotel,luminous(0xe34830),x,2.04,.27,.16,.34,.13);
 }
 // A fan palm's leaflets hang in pairs along a bent central rib.
 function palm(x,z,height,lean){
  const crown=vector(x+lean,height,z);
  for(let i=0;i<6;i++){
   const pt=t=>[x+lean*t*t,height*t,z+.28*Math.sin(t*2)];
   rod(staticSet,bark,pt(i/6),pt((i+1)/6),.19-i*.012,.18-i*.012);
  }
  crown.z+=.28*Math.sin(2);const blades=[];
  for(let i=0;i<15;i++){
   const a=i*2.39996+rng()*.13,len=height*(.32+rng()*.18),lift=.65+rng()*1.25;
   const mid=t=>vector(crown.x+Math.cos(a)*len*t,crown.y+lift*Math.sin(t*Math.PI)-1.15*t*t,crown.z+Math.sin(a)*len*t);
   for(let k=0;k<20;k++){
    const t=k/20,u=(k+1)/20,b=mid(t),e=mid(u),w=len*(.15*Math.sin(Math.PI*(t+.06))+.022);
    for(const side of [-1,1]){
     const tip=mid(Math.min(1,t+.13));tip.x-=side*Math.sin(a)*w;tip.z+=side*Math.cos(a)*w;tip.y-=w*.62;
     blades.push(...b.toArray(),...e.toArray(),...tip.toArray());
    }
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(blades,3));g.computeVertexNormals();leaf.side=THREE.DoubleSide;staticSet.add(new THREE.Mesh(g,leaf));
 }
 for(const [x,z,h,l] of [[-26,-11,9,1.0],[-11,-8,9,-.9],[-21,-19,11,-.7],[-29,-22,8,1.3],[-9,-24,10,.6],[-24,-3,7.7,-.4],[-31,-9,8,.5]])palm(x,z,h,l);
 bake(staticSet);return {entryDoor,handle,grip};
}
const stripe=finish(0x8a7755);


function desertSky(scene){
 const material=new THREE.ShaderMaterial({
  side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 direction; void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`varying vec3 direction;
  void main(){
   vec3 d=normalize(direction);
   float h=max(0.,d.y);
   float horizon=exp(-h*9.);
   vec3 sky=mix(vec3(.0013,.0023,.0046),vec3(.009,.014,.022),horizon);
   vec2 st=vec2(atan(d.z,d.x),asin(d.y))*440.;
   float hash=fract(sin(dot(floor(st),vec2(41.21,15.71)))*14853.4);
   float star=step(.995,hash)*(1.-smoothstep(.01,.19,length(fract(st)-.5)));
   sky+=vec3(.19,.21,.24)*star*smoothstep(.06,.34,h);
   gl_FragColor=vec4(sky,1.);
   #include <colorspace_fragment>
  }`
 });
 mesh(scene,new THREE.SphereGeometry(177,32,16),material,0,0,0);
}
function lightPool(){
 const tex=canvasTexture(128,256,ctx=>{
  for(let y=0;y<256;y++){const t=y/255,width=14+46*t;
   const g=ctx.createLinearGradient(64-width,0,64+width,0);
   for(const [stop,v] of [[0,0],[.22,.45],[.5,1],[.78,.45],[1,0]])g.addColorStop(stop,'rgba(255,209,145,'+(v*.66*(1-t)**1.5)+')');
   ctx.fillStyle=g;ctx.fillRect(0,y,128,1);
  }
 });
 return new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
}
export function createDesertArrival(guestData,carData,driverTake){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,16/9,.05,250);
 scene.fog=new THREE.FogExp2(0x101728,.013);desertSky(scene);
 const {entryDoor,handle,grip}=grounds(scene);
 const vehicle=rigNightCar(carData),{car}=vehicle;scene.add(car);
 scene.add(new THREE.HemisphereLight(0x97a8ba,0x19151b,.13));
 const moon=new THREE.DirectionalLight(0x98b1cf,.39);moon.position.set(7,8,-9);scene.add(moon);
 // Narrow reflected strips shape the lacquer and glass without lighting the desert.
 const env=canvasTexture(512,256,ctx=>{
  const g=ctx.createLinearGradient(0,0,0,256);
  for(const [t,c] of [[0,'#111c29'],[.28,'#101924'],[.49,'#26303e'],[.55,'#080b10'],[1,'#07080a']])g.addColorStop(t,c);
  ctx.fillStyle=g;ctx.fillRect(0,0,512,256);
  const sheen=ctx.createRadialGradient(95,79,6,95,79,82);sheen.addColorStop(0,'#8696a6');sheen.addColorStop(.45,'#687884');sheen.addColorStop(1,'rgba(25,37,50,0)');ctx.fillStyle=sheen;ctx.fillRect(0,0,256,176);
  for(const [x,y,w,h,c] of [[47,84,88,5,'#899db2'],[245,110,58,3,'#b75043'],[382,89,61,8,'#788998']]){
   ctx.shadowColor=c;ctx.shadowBlur=9;ctx.fillStyle=c;ctx.fillRect(x,y,w,h);
  }
 });env.mapping=THREE.EquirectangularReflectionMapping;scene.environment=env;scene.environmentIntensity=.91;
 const porch=new THREE.PointLight(0xffad75,16,8.5);porch.position.set(-18.39,2.02,-13.30);scene.add(porch);
 const carKey=new THREE.PointLight(0xb7cadd,6.4,6.2);carKey.position.set(-7.0,2.7,4.1);scene.add(carKey);
 const tyreFill=new THREE.PointLight(0xaebfce,5.7,4.5);tyreFill.position.set(-6.6,1.14,3.76);scene.add(tyreFill);
 const cabinLight=new THREE.PointLight(0xffa36f,0,2.85);cabinLight.position.set(-.31,1.06,.18);car.add(cabinLight);
 const rim=new THREE.PointLight(0x98bfdf,7.6,7);rim.position.set(-7.4,2.4,6.9);scene.add(rim);
 const mat=lightPool();
 for(const x of [-.72,.72]){
  const pool=mesh(car,new THREE.PlaneGeometry(2.7,10),mat,x,.032,-7.58);pool.rotation.x=Math.PI/2;
 }
 const smokeMap=mistTexture(),smoke=[];
 for(let i=0;i<15;i++){
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeMap,color:0xa0aebf,transparent:true,depthWrite:false}));
  car.add(sprite);smoke.push(sprite);
 }
 const driver=createRoadDriver(guestData,driverTake);scene.add(driver.root);
 const shade=canvasTexture(128,64,ctx=>{ctx.scale(1,.5);const g=ctx.createRadialGradient(64,64,8,64,64,64);g.addColorStop(0,'rgba(9,5,8,.85)');g.addColorStop(1,'rgba(9,5,8,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);});
 const shadowMat=new THREE.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false});
 const contact=mesh(car,new THREE.PlaneGeometry(2.9,5.8),shadowMat,0,.024,0);contact.rotation.x=-Math.PI/2;
 const feet=mesh(scene,new THREE.PlaneGeometry(.83,.69),shadowMat,0,.02,0);feet.rotation.x=-Math.PI/2;
 let shot='highway';
 function frame(time){
  const decel=1-THREE.MathUtils.clamp((time-2.12)/.8,0,1);
  const stoppingDistance=8.7*Math.max(0,2.12-time)+3.48*decel*decel;
  car.position.set(-4.1,0,6+stoppingDistance);
  vehicle.pose(time,stoppingDistance);
  cabinLight.intensity=4.6*(smooth(time,7.12,7.75)-smooth(time,13.72,14.15));
  for(let i=0;i<smoke.length;i++){
   const age=(time*.43+i/smoke.length)%1,s=smoke[i];
   const drift=age*age,eddy=Math.sin(time*.72+i*.71+age*4);
   s.position.set(-.38-.93*drift+.12*age*eddy,.93+age*(1.42+.22*Math.sin(i*2)),-1.73+.42*drift+.11*age*Math.cos(time*.8+i));
   const size=.20+age*1.04;s.scale.set(size*1.15,size,1);
   // Steam picks up a cold rim as it rises out of the warm engine bay.
   s.material.color.setRGB(.47+age*.16,.45+age*.28,.43+age*.43);
   s.material.rotation=.7*Math.sin(i*5)+age*.45;s.material.opacity=.31*Math.sin(Math.PI*age)*smooth(time,2.25,3.65);
  }
  handle.rotation.z=-.36*(smooth(time,23.85,24.18)-smooth(time,24.42,24.84));
  entryDoor.rotation.y=1.45*smooth(time,24.16,25.80);
  const step=driver.frame(time,car,vehicle.grip,grip,vehicle.pushPad);
  feet.visible=time>9.44;feet.position.set(driver.root.position.x,.021,driver.root.position.z);
  if(time<3.85){
   shot='highway';const creep=smooth(time,0,3.85);
   camera.position.set(-8.9+creep*.25,.74,1.2);camera.lookAt(-4.07,.66,6.8+decel*6);camera.fov=35;
  }else if(time<6.48){
   shot='flat-tyre';const creep=smooth(time,3.85,6.48);
   camera.position.set(-6.62,.42,3.37+creep*.12);camera.lookAt(-5.02,.39,4.52);camera.fov=34;
  }else if(time<14.45){
   shot='driver-exits';const out=smooth(time,7,12);
   camera.position.set(-8.38-out*.27,.98+out*.22,6.96+out*.42);camera.lookAt(-4.87-out*.58,.78+out*.19,5.97);camera.fov=36;
  }else if(time<19.25){
   shot='hotel';const advance=smooth(time,14.45,20.8);
   camera.position.set(-4.52-advance*.9,1.61,9.58-advance*1.45);camera.lookAt(-16.6,5.48,-13.8);camera.fov=48;
  }else if(time<20.8){
   shot='sign';const creep=smooth(time,19.25,20.8);
   camera.position.set(-18.08+creep*.09,3.60,-8.87);camera.lookAt(-17.0,3.54,-13.8);camera.fov=39;
  }else{
   shot='entrance';const move=smooth(time,20.8,28.25);
   camera.position.set(-14.72-move*.83,1.58,-8.85-move*.5);
   camera.lookAt(-17.4,2.03-move*.40,-13.80);camera.fov=46;
  }
  camera.updateProjectionMatrix();
  return step;
 }
 frame(0,0);
 return {frame,render:renderer=>renderer.render(scene,camera),get shot(){return shot;}};
}
