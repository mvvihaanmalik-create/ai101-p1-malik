import {finishMaterial,surfaceColor,lightHotelMaterials} from './visual-finish.js';
import {fitSmile} from './character-performance.js';
import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';

const stamps = ['Moon','Eye','Sun'];
function tagTexture(mark) {
 const canvas=document.createElement('canvas'); canvas.width=384; canvas.height=256;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#e3d1a2'; ctx.fillRect(0,0,384,256);
 ctx.strokeStyle='#442f27'; ctx.lineWidth=7; ctx.strokeRect(12,12,360,232);
 ctx.lineWidth=1.5;ctx.strokeRect(19,19,346,218);ctx.fillStyle='#715838';ctx.fillRect(120,35,144,2);
 for(let i=0;i<22;i++){const x=28+i*15.5;ctx.fillRect(x,216,4,1.5);}
 ctx.translate(192,128); ctx.fillStyle='#342722'; ctx.lineWidth=10;
 const disc=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 if(mark==='Moon'){disc(0,0,72);ctx.fillStyle='#e3d1a2';disc(32,-19,63);}
 if(mark==='Sun'){disc(0,0,40);for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);ctx.fillRect(-4,50,8,27);}}
 if(mark==='Eye'){ctx.beginPath();ctx.moveTo(-93,0);ctx.quadraticCurveTo(0,-104,93,0);ctx.quadraticCurveTo(0,104,-93,0);ctx.stroke();disc(0,0,27);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}

export function createLuggageRoom(porter,makeCase){
 const scene=new THREE.Scene();lightHotelMaterials(scene,.42);scene.background=new THREE.Color(0x292120);
 const camera=new THREE.PerspectiveCamera(36,16/9,.05,35);
 camera.position.set(.15,2.1,4.0);camera.lookAt(.05,1.45,-.6);
 const material=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.62});
 const walnut=material(0x47312a),trim=material(0xa18755,.42),velvet=material(0x641f34),taupe=material(0x605145);
 for(const [mat,key,factor] of [[walnut,'walnut',.002],[velvet,'velvet',.0009],[trim,'brass',.0004],[taupe,'velvet',.0006]]){finishMaterial(mat,key,factor);mat.map=mat.roughnessMap;}
 walnut.map=surfaceColor('assets/smoked-walnut-v31.webp');walnut.color.setHex(0xcbb7a7);
 function box(parent,x,y,z,w,h,d,mat){
  const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv,p=geo.attributes.position,n=geo.attributes.normal;
  for(let i=0;i<uv.count;i++){const u=Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i),v=Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i);uv.setXY(i,u*1.65+.34,v*1.65+.17);}
  const obj=new THREE.Mesh(geo,mat);obj.position.set(x,y,z);parent.add(obj);return obj;
 }
 box(scene,0,0,-1,10,.12,9,walnut);box(scene,0,2,-2.05,9,4,.09,velvet);
 box(scene,0,1.5,4.8,9,3,.1,taupe);
 // A reeded amber transom faces the mirror. Its reflection locates the room
 // behind the player without putting another symbol next to the claim stamp.
 const reed=document.createElement('canvas');reed.width=768;reed.height=224;
 const rc=reed.getContext('2d'),light=rc.createRadialGradient(455,119,8,420,116,460);
 light.addColorStop(0,'#d9ab70');light.addColorStop(.56,'#846242');light.addColorStop(1,'#4b433d');rc.fillStyle=light;rc.fillRect(0,0,768,224);
 for(let i=0;i<768;i+=9){rc.fillStyle='#392c292e';rc.fillRect(i,0,3,224);rc.fillStyle='#fbe4af24';rc.fillRect(i+4,0,2,224);}
 const gl=new THREE.CanvasTexture(reed);gl.colorSpace=THREE.SRGBColorSpace;
 const lite=new THREE.Mesh(new THREE.PlaneGeometry(3.35,.80),new THREE.MeshBasicMaterial({map:gl}));lite.position.set(.3,2.30,4.69);lite.rotation.y=Math.PI;scene.add(lite);
 for(const y of [1.87,2.73])box(scene,.3,y,4.67,3.51,.065,.08,trim);
 for(const x of [-1.42,-.27,.86,2.02])box(scene,x,2.30,4.67,.046,.85,.08,walnut);
 for(let x=-4;x<=4;x+=.42)box(scene,x,2,-1.98,.024,4,.028,walnut);
 for(let y of [.45,2.95])box(scene,0,y,-1.94,8,.05,.06,trim);
 // Rows of numbered pigeonholes behind the counter.
 for(let y=.45;y<2.8;y+=.38)box(scene,-2.72,y,-1.63,1.6,.038,.38,walnut);
 for(let x=-3.52;x<-1.85;x+=.4)box(scene,x,1.61,-1.63,.035,2.34,.38,walnut);
 const mirror=new Reflector(new THREE.PlaneGeometry(2.8,1.76),{textureWidth:1024,textureHeight:576,multisample:0,color:0xe2daca});
 let lastMirror=-Infinity;const reflect=mirror.onBeforeRender;
 mirror.onBeforeRender=function(...args){const now=performance.now();if(now-lastMirror<30)return;lastMirror=now;reflect.apply(this,args);};
 mirror.position.set(-.32,1.75,-1.8);scene.add(mirror);
 for(const x of [-1.75,1.11])box(scene,x,1.75,-1.78,.085,1.93,.09,trim);
 for(const y of [.84,2.66])box(scene,-.32,y,-1.78,2.94,.085,.09,trim);
 // The gilt slip catches the light inside the dark walnut mirror surround.
 for(const x of [-1.81,1.17])box(scene,x,1.75,-1.80,.038,2.04,.12,walnut);
 for(const y of [.76,2.74])box(scene,-.32,y,-1.80,3.03,.045,.12,walnut);
 const door=new THREE.Group();door.position.set(1.38,0,-1.82);scene.add(door);
 box(scene,2.02,1.19,-1.91,1.33,2.38,.09,new THREE.MeshBasicMaterial({color:0xb5926c}));
 box(door,.65,1.19,0,1.30,2.38,.10,walnut);box(door,1.12,1.07,.09,.12,.04,.08,trim);
 for(const y of [.25,1.4,2.14])box(door,.65,y,.065,1.06,.034,.03,trim);
 // Inset panels and a key escutcheon make the service door read in silhouette.
 for(const y of [.81,1.75])for(const x of [.15,1.15])box(door,x,y,.065,.025,y<1?.99:.65,.025,trim);
 const esc=new THREE.Mesh(new THREE.SphereGeometry(1,14,8),trim);esc.scale.set(.049,.093,.016);esc.position.set(1.12,1.04,.07);door.add(esc);
 box(scene,-.35,.43,.05,3.72,.84,.98,walnut);
 box(scene,-.35,.89,.04,3.88,.085,1.07,trim);
 box(scene,-.35,.945,.04,3.84,.055,1.02,velvet);
 // Narrow brass reveal between the padded top and the cabinet face.
 box(scene,-.35,.85,.541,3.71,.016,.016,trim);
 const figure=clone(porter.scene);figure.position.set(1.23,.05,-.96);figure.rotation.y=Math.PI+.20;scene.add(figure);
 figure.traverse(part=>{
  if(!part.isMesh)return;
  part.frustumCulled=false;
  part.material=part.material.clone();
  if(part.material.transparent){part.material.alphaTest=.35;part.material.transparent=false;part.material.depthWrite=true;}
 });
 const mixer=new THREE.AnimationMixer(figure);
 const idle=mixer.clipAction(porter.animations.find(a=>a.name==='Idle')).play();
 const release=mixer.clipAction(porter.animations.find(a=>a.name==='Raise'));release.setLoop(THREE.LoopOnce,1);release.clampWhenFinished=true;
 scene.add(new THREE.HemisphereLight(0xc4c7cc,0x39202c,.76));
 for(const [x,y,z,color,power] of [[-1.76,2.42,1.12,0xffb979,21],[1.82,2.55,-.43,0x96c3c2,14.5]]){
  const light=new THREE.PointLight(color,power,8);light.position.set(x,y,z);scene.add(light);
 }
 // Soft contact at the feet of each case, including when it slides toward us.
 const mask=document.createElement('canvas');mask.width=mask.height=128;
 const mc=mask.getContext('2d'),grad=mc.createRadialGradient(64,64,4,64,64,64);
 grad.addColorStop(0,'rgba(16,4,4,.65)');grad.addColorStop(.55,'rgba(16,4,4,.33)');grad.addColorStop(1,'rgba(16,4,4,0)');mc.fillStyle=grad;mc.fillRect(0,0,128,128);
 const shade=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(mask),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 // Exact critically damped response preserves momentum if the guest reverses a case mid-turn.
 function settle(body,key,goal,rate,dt){
  const velocity=key+'Speed',offset=body[key]-goal,decay=Math.exp(-rate*dt);
  const c=body[velocity]+rate*offset;
  body[key]=goal+(offset+c*dt)*decay;body[velocity]=(body[velocity]-rate*c*dt)*decay;
 }
 const cases=[],textures=stamps.map(tagTexture);
 for(let i=0;i<3;i++){
  const bag=makeCase(scene);bag.position.set(-1.42+i*1.06,.98,.03);bag.scale.setScalar(1.23);
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(.37,.255),new THREE.MeshBasicMaterial({map:textures[i]}));
  tag.position.set(0,.4,-.117);tag.rotation.y=Math.PI;bag.add(tag);const contact=new THREE.Mesh(new THREE.PlaneGeometry(.90,.50),shade);contact.position.set(bag.position.x,.975,.03);contact.rotation.x=-Math.PI/2;scene.add(contact);cases.push({bag,tag,contact,yaw:0,yawSpeed:0,depth:.03,depthSpeed:0});
 }
 const ticket=document.getElementById('claim-ticket'),stamp=document.getElementById('claim-stamp');
 const greet=fitSmile(figure);greet(.66);
 const head=figure.getObjectByName('head');
 const neutralHead=head?.quaternion.clone();
 let active=0,target=0,turned=false,angle=0,solved=false,open=0,order=[],recognitionTime=0;
 function start(seed){
  lastMirror=-Infinity;target=(seed>>>3)%3;order=[0,1,2];if(seed&1)order.reverse();order.push(...order.splice(0,seed%3));
  cases.forEach((c,i)=>{c.tag.material.map=textures[order[i]];c.yaw=c.bag.rotation.y=Math.PI/2;
   c.depth=c.bag.position.z=c.contact.position.z=.03;c.yawSpeed=c.depthSpeed=0;});
  active=0;turned=false;angle=Math.PI/2;solved=false;open=0;door.rotation.y=0;
  recognitionTime=0;release.stop();idle.reset().setEffectiveWeight(1).play();figure.rotation.y=Math.PI+.20;
  if(head)head.quaternion.copy(neutralHead);
  stamp.src=textures[target].image.toDataURL();stamp.alt=stamps[target];ticket.hidden=false;
 }
 function step(dt){
  if(head)head.quaternion.copy(neutralHead);
  greet(recognitionTime>0?.24:.66);mixer.update(dt);const goal=turned?0:Math.PI/2;
  cases.forEach((c,i)=>{
   settle(c,'yaw',i===active?goal:Math.PI/2,11,dt);
   settle(c,'depth',i===active?(solved?.06:.30):.02,solved?4:10,dt);
   c.bag.rotation.y=c.yaw;c.bag.position.z=c.contact.position.z=c.depth;c.contact.rotation.z=c.yaw;
  });
  angle=cases[active].yaw;
  if(solved){
   const previous=recognitionTime;recognitionTime+=dt;
   const ease=THREE.MathUtils.smoothstep;
   const glance=ease(recognitionTime,0,.65)*(1-ease(recognitionTime,1.55,2.4));
   if(head){head.rotation.x+=.16*glance;head.rotation.y+=.24*glance;}
   figure.rotation.y=Math.PI+.20-1.0*ease(recognitionTime,2,3.25);
   if(previous<2.65&&recognitionTime>=2.65){release.reset().play();idle.crossFadeTo(release,.4,false);}
   open=ease(recognitionTime,3.15,4.55);door.rotation.y=-1.35*open;
  }
 }
 function input(key){
  if(solved)return key==='e'&&open>=.95?'exit':null;
  const offset=['a','arrowleft'].includes(key)?-1:['d','arrowright'].includes(key)?1:0;
  if(offset){active=(active+offset+3)%3;turned=false;angle=Math.PI/2;return 'select';}
  if(key!=='e')return null;
  if(!turned){turned=true;return 'turn';}if(angle>.10)return null;
  if(order[active]!==target){turned=false;return 'wrong';}
  solved=true;return 'match';
 }
 function prompt(){
  if(solved)return open>=.95?'E   Enter the staff stair':'';
  return ['Left','Middle','Right'][active]+' case     ·     A / D   Select     ·     E   '+(turned?'Claim case':'Turn to mirror');
 }
 return {start,step,input,prompt,hide(){ticket.hidden=true;},render(renderer){renderer.render(scene,camera);},snapshot(){return {active,target:stamps[target],order:order.map(i=>stamps[i]),turned,solved,open};}};
}
