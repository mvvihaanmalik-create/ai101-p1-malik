import * as THREE from 'three';
import {restoreArmPose} from './hand-pose.js';
import {reach} from './road-driver.js';

const vector=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const smooth=THREE.MathUtils.smoothstep;
const axis=vector(0,1,0);

function darkenPupils(root){
 root.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.material.name.endsWith('skin.high-poly'))return;
  mesh.geometry.computeBoundingBox();
  const box=mesh.geometry.boundingBox,center=box.getCenter(vector());
  let sum=0,count=0;
  const pos=mesh.geometry.attributes.position;
  for(let i=0;i<pos.count;i++)if(pos.getX(i)>0){sum+=pos.getX(i);count++;}
  const x=sum/count,radius=(box.max.x-box.min.x)*.092;
  const mat=mesh.material;
  mat.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec3 eyePoint;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n eyePoint=position;');
   shader.fragmentShader='varying vec3 eyePoint;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    vec2 iris=vec2(abs(eyePoint.x)-${x.toFixed(6)},eyePoint.y-${center.y.toFixed(6)})/${radius.toFixed(6)};
    float pupil=1.-smoothstep(.74,1.,length(iris));
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.009,.004,.006),pupil);
    diffuseColor.rgb+=vec3(.68,.55,.42)*(1.-smoothstep(.08,.21,length(iris-vec2(.25,.32))));`);
  };
  mat.customProgramCacheKey=()=>mat.name+'-iris';
 });
}

export function createProcession(scene,crowd,models,skeleton,onBeat,reduced){
 const {actor,people,hound,cloche,bottle,caseObject,handTo,gripPoint}=crowd.cast;
 const group=new THREE.Group();scene.add(group);
 for(const root of Object.values(crowd.roots))root.visible=false;
 const [attendant,kid,companion,server,bartender,porter]=people;
 for(const person of people)group.add(person.holder);
 const lady=actor(group,models.deskModel,[0,0,0]),butler=actor(group,models.butler,[0,0,0]);
 butler.model.getObjectByName('ButlerBell')?.removeFromParent();
 const peopleOnFloor=[...people,lady,butler];
 const lanes=[[-1.58,-2.8],[0,-3.62],[.82,-1.40],[-1.28,-.72],[1.54,-2.8],[-.32,.40],[-.46,-1.62],[1.86,-.42]];
 for(const p of peopleOnFloor){
  const i=peopleOnFloor.indexOf(p);
  if(p!==lady){p.smile(1.95+(i%3)*.28,.68+i*.07);darkenPupils(p.model);}
  else p.smile(0,0);
 }
 // Two separate skeleton instances follow the actors' sampled pose, including the bell wrist.
 function double(person,scale){
  const shell=actor(group,skeleton,[0,0,0]);shell.holder.scale.setScalar(scale);
  const joints=[];
  shell.model.traverse(o=>{
   if(o.isBone){const source=person.model.getObjectByName(o.name);if(source)joints.push([o,source]);}
   if(o.isMesh){const m=o.material,cavity=/cavit/i.test(m.name);m.emissive.setHex(cavity?0:0xacc5ac);m.emissiveIntensity=cavity?0:.055;m.color.setHex(cavity?0x090406:0xb7b092);m.roughness=.64;if(!cavity){  m.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec3 ivoryPos;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n ivoryPos=position;');
   shader.fragmentShader=`varying vec3 ivoryPos;
    float boneHash(vec3 q){q=fract(q*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
    float boneGrain(vec3 q){vec3 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);
     return mix(mix(mix(boneHash(i),boneHash(i+vec3(1,0,0)),f.x),mix(boneHash(i+vec3(0,1,0)),boneHash(i+vec3(1,1,0)),f.x),f.y),
     mix(mix(boneHash(i+vec3(0,0,1)),boneHash(i+vec3(1,0,1)),f.x),mix(boneHash(i+vec3(0,1,1)),boneHash(i+vec3(1,1,1)),f.x),f.y),f.z);}`+'\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
     float stain=boneGrain(ivoryPos*51.)*.62+boneGrain(ivoryPos*180.)*.38;
     diffuseColor.rgb*=mix(vec3(.21,.17,.13),vec3(.92,.88,.72),smoothstep(.18,.78,stain));
     diffuseColor.rgb*=1.-.32*smoothstep(.69,.90,boneGrain(ivoryPos*700.));`);
  };
   }}
  });
  return (visible)=>{
   person.model.visible=!visible;shell.holder.visible=visible;
   if(!visible)return;
   for(const [bone,source] of joints)bone.quaternion.copy(source.quaternion);
   shell.holder.rotation.copy(person.holder.rotation);shell.holder.position.copy(person.holder.position);
   const delta=person.head.getWorldPosition(vector()).sub(shell.head.getWorldPosition(vector()));
   shell.holder.position.add(delta);
  };
 }
 const ladyBones=double(lady,.9),butlerBones=double(butler,1);
 // The cut face retains the original UVs. Restore the cast member's skin and hair.
 const childMaterials=new Map();
 models.child.scene.traverse(o=>{if(o.isMesh)childMaterials.set(o.name.toLowerCase(),o.material);});
 function headProp(){
  const head=models.porcelain.scene.clone(true);
  head.traverse(o=>{
   if(!o.isMesh)return;
   const part=o.name.toLowerCase().replace(/^kiln[ _]cast[ _]/,'');
   const material=childMaterials.get(part);
   if(material&&o.geometry.attributes.uv){
    o.material=material.clone();o.material.color.multiplyScalar(.84);
    o.material.transparent=false;o.material.depthWrite=true;
    o.material.alphaTest=/hair|short|brow|lash/i.test(part)?.34:.02;
   }
  });
  return head;
 }
 const plateHead=headProp(),bounceHead=headProp();group.add(plateHead,bounceHead);
 plateHead.scale.setScalar(.70);bounceHead.scale.setScalar(.92);
 const silver=new THREE.MeshStandardMaterial({color:0xaeb6ae,metalness:.66,roughness:.26});
 const tray=new THREE.Mesh(new THREE.CylinderGeometry(.221,.203,.016,64),silver);
 group.add(tray,cloche,bottle,caseObject);
 const handbell=models.bell.clone(true);group.add(handbell);handbell.scale.setScalar(1.26);
 const wine=new THREE.MeshPhysicalMaterial({color:0x650c29,emissive:0x310716,roughness:.15,clearcoat:1});
 const blood=new THREE.MeshPhysicalMaterial({color:0x5b0c13,emissive:0x36060b,roughness:.19,clearcoat:.95});
 const ribbon=new THREE.CylinderGeometry(1,1,1,10,12, true);
 const stream=new THREE.Mesh(ribbon,wine);stream.frustumCulled=false;group.add(stream);
 const circles=ribbon.attributes.position.clone();ribbon.attributes.position.setUsage(THREE.DynamicDrawUsage);
 // Stain the fabric itself, so the wet edges follow the skinned jacket.
 const wet={value:0};
 bartender.model.traverse(mesh=>{
  if(!mesh.isMesh||!/elegantsuit|uniform/i.test(mesh.material.name))return;
  const material=mesh.material;
  material.onBeforeCompile=shader=>{
   shader.uniforms.wineWet=wet;
   shader.vertexShader='varying vec3 clothPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n clothPoint=position;');
   shader.fragmentShader='varying vec3 clothPoint;uniform float wineWet;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float fall=clamp((1.50-clothPoint.y)/.38,0.,1.);
    float w=.019+.026*sin(fall*3.14)+.003*sin(fall*80.);
    float streak=(1.-smoothstep(w,w+.008,abs(clothPoint.x-(.074+.031*fall+.006*sin(fall*12.)))))*
     (1.-smoothstep(-.06,.011,clothPoint.z))*(1.-smoothstep(1.48,1.52,clothPoint.y))*smoothstep(fall-.09,fall+.03,wineWet);
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.19,.004,.019),streak*.87);`);
  };
 });
 const trails=Array.from({length:5},()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),blood);group.add(m);return m;});
 group.add(hound);hound.position.set(0,.035,0);hound.rotation.y=0;
 const dogBone=name=>hound.getObjectByName(name);
 const snout=dogBone('DEF-head');
 const dogDirection=snout.getWorldPosition(vector()).sub(dogBone('DEF-pelvis').getWorldPosition(vector()));
 hound.rotation.y=Math.PI-Math.atan2(dogDirection.x,dogDirection.z);
 hound.updateWorldMatrix(true,true);
 // Socket at the lower lip of the standing German Shepherd, in model metres.
 // Attach it to the head once, so every drop starts on the moving jaw.
 const mouth=snout.worldToLocal(hound.localToWorld(vector(.021,.624,.484)));
 const fur=hound.getObjectByName('HotelDogCoat');fur.material=fur.material.clone();
 fur.material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 muzzle;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    muzzle=position;
    float lip=exp(-dot((position.yz-vec2(.636,.449))/vec2(.019,.031),(position.yz-vec2(.636,.449))/vec2(.019,.031)));
    transformed.y+=.012*lip*smoothstep(.013,.042,abs(position.x));`);
  shader.fragmentShader='varying vec3 muzzle;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec3 stain=(muzzle-vec3(.018,.633,.468))/vec3(.034,.029,.053);
    float blood=1.-smoothstep(.56,1.22,length(stain));
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.19,.003,.009),.83*blood);`);
 };
 const paws=[];
 for(const side of ['L','R'])for(const fore of [true,false]){
  const parts=fore?['frontupper','frontforearm','frontpaw']:['hindthigh','hindshin','hindhock'];
  const chain=parts.map(part=>{const key=('def'+part+side).toLowerCase();let bone;hound.traverse(o=>{if(o.isBone&&o.name.replace(/[^a-z]/gi,'').toLowerCase()===key)bone=o;});return bone;});
  paws.push({chain,bind:chain.map(b=>b.quaternion.clone()),offset:(side==='L'?0:.5)+(fore?0:.72)});
 }
 function dogPose(distance,t){
  hound.position.set(30.91,.035,-3.95-distance);
  for(const {chain,bind,offset} of paws){
   chain.forEach((b,i)=>b.quaternion.copy(bind[i]));
   const phase=(distance/.48+offset)%1,swing=Math.max(0,(phase-.62)/.38);
   const foot=chain[2].getWorldPosition(vector());foot.z-=phase<.62?.1488-phase*.48:-.1488+.2976*smooth(swing,0,1);
   foot.y+=.048*Math.sin(Math.PI*swing);
   const bend=chain[1].getWorldPosition(vector()).sub(chain[0].getWorldPosition(vector())).normalize();
   reach(chain,foot,bend,1,true);
  }
  const lip=snout.localToWorld(mouth.clone());
  trails.forEach((drop,i)=>{
   drop.position.copy(lip);drop.position.z-=.008;
   if(i===0){drop.position.y-=.017;drop.scale.set(.0038,.021+.004*Math.sin(t*8),.0038);return;}
   const u=(t*1.32+i*.25)%1;
   drop.position.y-=.034+.29*u*u;drop.position.z+=u*.073;
   drop.scale.setScalar(.0058*(1-u*.68));drop.scale.y*=1.8;
  });
 }
 function perform(person,dist,t,i,walk){
  person.motion.restore();restoreArmPose(person.armPose);
  person.idle.time=(t+i*.28)%person.idle.getClip().duration;person.idle.setEffectiveWeight(walk?.12:1);
  person.walk.time=((dist/(.93*person.holder.scale.x)+i*.29)%1)*person.walk.getClip().duration;
  person.walk.setEffectiveWeight(walk?.88:0);person.mixer.update(0);
  for(const saved of person.armPose)saved.rotation.copy(saved.bone.quaternion);
  person.head.quaternion.copy(person.headRest);
  person.head.rotation.z+=(person===lady?.014:.094)*Math.sin(t*.76+i);
 }
 function point(p,x,y,z){return p.holder.localToWorld(vector(x,y,z));}
 function hand(p,side,target,grip){return gripPoint(handTo(p,target,side,grip));}
 let lastRing=-1;
 function tick(t,shot){
  const parade=shot===2,close=shot===3,dist=parade?.30*(t-13.6):0;
  group.visible=true;
  for(const [i,p] of peopleOnFloor.entries()){
   p.holder.visible=parade||p===lady||(!close&&p===butler);
   if(!p.holder.visible)continue;
   const [x,z]=lanes[i];p.holder.position.set(30+x,.02,z-dist);
   p.holder.rotation.y=.045*x;
   if(!parade){
    p.holder.position.set(p===lady?31.45:30.2,p===lady?.16:.02,p===lady?-7.85:-7.35);
    p.holder.rotation.y=Math.PI;
   }
   perform(p,dist,t,i,parade);
  }
  for(const prop of [tray,plateHead,cloche,bottle,stream,caseObject,bounceHead,hound,...trails])prop.visible=parade;
  const ringPhase=(t-.65)*2.9,ringBeat=Math.floor((ringPhase+Math.PI/2)/(Math.PI*2));
  if(butler.holder.visible){
   const handLocal=point(butler,.30,1.31+.105*Math.sin(ringPhase),-.27);
   const palm=hand(butler,'r',handLocal,.87);
   handbell.position.copy(palm);handbell.position.y-=.106;handbell.rotation.z=.24*Math.cos(ringPhase);
   if(!close&&t>1&&ringBeat!==lastRing&&lastRing!==-1)onBeat?.('handbell');
   lastRing=ringBeat;
  }
  handbell.visible=butler.holder.visible;
  const swap=(seconds,offset)=>reduced?Math.sin(seconds*1.15+offset)>.48:Math.sin(seconds*2.35+offset)+.39*Math.sin(seconds*5.13+offset)>.25;
  ladyBones(close?t<24.12||t>24.50:t>6.1&&swap(t,.9));
  butlerBones(butler.holder.visible&&t>6.8&&swap(t,3.15));
  if(!parade)return;
  dogPose(dist,t);
  const lift=.5+.5*Math.cos((t-16.22)*2.25);
  tray.position.copy(point(attendant,-.035,1.03+.014*Math.sin(t*2),-.295));
  hand(attendant,'l',tray.position.clone().add(vector(-.14,-.025,.055)),.34);
  plateHead.position.copy(tray.position);plateHead.position.y+=.133;plateHead.rotation.y=.15;
  cloche.scale.set(1.04,1.46,1.04);cloche.position.copy(tray.position);cloche.position.y+=.018+.21*lift;cloche.position.x+=.21*lift;cloche.position.z+=.065*lift;
  cloche.rotation.z=-.73*lift;
  const knob=cloche.localToWorld(vector(0,.215,0));
  const lidGrip=hand(attendant,'r',knob,.67);
  cloche.position.add(lidGrip.sub(knob));
  const phase=(t*.98)%1,height=.19+.56*(1-(2*phase-1)**2);
  bounceHead.position.copy(point(kid,.27,height,-.22));bounceHead.rotation.set(-.32+.45*Math.sin(t*4),.74*Math.sin(t*3.1),-.24);
  hand(kid,'r',point(kid,.27,.64+.21*Math.sin(Math.PI*2*(phase-.13)),-.22),.12);
  const pour=.5+.5*Math.cos((t-18.45)*1.7);
  const wineGrip=hand(bartender,'r',point(bartender,.23,1.54+.16*pour,-.19),.75);
  bottle.rotation.set(-.25,.06,1.55+.65*pour);
  bottle.position.copy(wineGrip).sub(vector(0,.225,0).applyQuaternion(bottle.quaternion));
  const from=bottle.localToWorld(vector(0,.312,0)),to=from.clone();
  to.copy(point(bartender,.075,1.46,-.119));
  // A thin jet leaves the bottle sideways, then gravity draws it down to the lapel.
  const mid=from.clone();mid.x=to.x;mid.z=to.z;mid.y-=.01;
  const flow=ribbon.attributes.position;
  for(let i=0;i<flow.count;i++){
   const u=.5-circles.getY(i),v=1-u,r=(.0042+.0018*u)*(1+.13*Math.sin(t*15-u*18));
   flow.setXYZ(i,v*v*from.x+2*u*v*mid.x+u*u*to.x+r*circles.getX(i),
    v*v*from.y+2*u*v*mid.y+u*u*to.y,v*v*from.z+2*u*v*mid.z+u*u*to.z+r*circles.getZ(i));
  }
  flow.needsUpdate=true;
  wet.value=smooth(t,13.6,19.4);
  caseObject.scale.y=1;const caseGrip=hand(porter,'l',point(porter,-.32,.73,-.06),.83);
  caseObject.position.copy(caseGrip);caseObject.position.y-=.72;
 }
 function isolate(subjects){
  const keep=new Set(subjects);
  for(const p of peopleOnFloor)if(!keep.has(p))p.holder.visible=false;
  for(const [subject,props] of [[attendant,[tray,plateHead,cloche]],[bartender,[bottle,stream]],[kid,[bounceHead]],[hound,[hound,...trails]],[porter,[caseObject]],[butler,[handbell]]]){
   if(!keep.has(subject))for(const prop of props)prop.visible=false;
  }
  if(!keep.has(lady))ladyBones(false);
  if(!keep.has(butler))butlerBones(false);
 }
 return {tick,isolate,group,people:peopleOnFloor,lady,butler,attendant,kid,hound,bartender,plateHead,bounceHead,
  ladySkull:()=>!lady.model.visible,reset(){lastRing=-1;}};
}
