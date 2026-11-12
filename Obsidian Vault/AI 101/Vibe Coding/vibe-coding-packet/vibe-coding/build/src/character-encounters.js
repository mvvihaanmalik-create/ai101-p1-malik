import {fitSmile,secondaryPose} from './character-performance.js';
import {finishMaterial} from './visual-finish.js';
import {solveArm} from './arm-kinematics.js';
import {captureArmPose,restoreArmPose,applyFingerGrip,calibrateHands,orientedPalm} from './hand-pose.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import * as THREE from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Gameplay stages a single encounter; the finale arranges its own crowd.
export function createCharacterEncounters(scene,{adult,child,props,dog,staff,porter,porcelain,persistent=false}){
 const metrics={};
 const roots={},actors=[],brass=new THREE.MeshStandardMaterial({color:0x8f7446,metalness:.72,roughness:.35}),
 silver=new THREE.MeshStandardMaterial({color:0xbab8a9,metalness:.82,roughness:.24}),
 wood=new THREE.MeshStandardMaterial({color:0x211310,roughness:.6}),
 leather=new THREE.MeshStandardMaterial({color:0x3b1a18,roughness:.68}),
 rubber=new THREE.MeshStandardMaterial({color:0x111312,roughness:.93});
 for(const [m,k] of [[wood,'walnut'],[leather,'leather'],[brass,'brass'],[silver,'brass']]){finishMaterial(m,k);m.map=m.roughnessMap;}
 function root(id){const g=new THREE.Group();g.name=id;scene.add(g);roots[id]=g;return g;}
 function mesh(parent,geo,mat,pos=[0,0,0]){const m=new THREE.Mesh(geo,mat);m.position.fromArray(pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(parent,size,pos,mat,r=.02){return mesh(parent,new RoundedBoxGeometry(...size,2,r),mat,pos);}
 function cylinder(parent,r,h,pos,mat,r2=r){return mesh(parent,new THREE.CylinderGeometry(r2,r,h,24),mat,pos);}
 function tube(parent,points,r,mat){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,8,false),mat);}
 function label(parent,text,w,h,pos){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#e0c89b';ctx.fillRect(0,0,1024,256);ctx.strokeStyle='#61503d';ctx.lineWidth=4;ctx.strokeRect(14,14,996,228);ctx.font='bold 90px Georgia';ctx.fillStyle='#201913';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,133,950);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return mesh(parent,new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,roughness:.9,emissive:0xffffff,emissiveMap:texture,emissiveIntensity:.10}),pos);
 }
 function actor(parent,data,pos,{tint=0xffffff,scale=1,yaw=Math.PI}={}){
  const model=clone(data.scene),holder=new THREE.Group();holder.add(model);parent.add(holder);holder.position.fromArray(pos);holder.scale.setScalar(scale);holder.rotation.y=yaw;
  model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.frustumCulled=false;o.material=o.material.clone();if(o.material.transparent){o.material.alphaTest=.35;o.material.transparent=false;o.material.depthWrite=true;}
   if(/suit/i.test(o.name))o.material.color.set(tint);
  });
  const mixer=new THREE.AnimationMixer(model),idle=mixer.clipAction(data.animations.find(c=>c.name==='Idle'));idle.play();
  const walk=mixer.clipAction(data.animations.find(c=>c.name==='Walk'));walk.play();walk.paused=true;walk.setEffectiveWeight(0);
  mixer.update(0);calibrateHands(model);
  const head=model.getObjectByName('head');const motion=secondaryPose(model,['spine_01','spine_02','clavicle_l','clavicle_r','upperarm_l','upperarm_r','lowerarm_l','lowerarm_r','thigh_l','calf_l','foot_l','thigh_r','calf_r','foot_r']);
  const a={holder,model,mixer,idle,walk,head,motion,smile:fitSmile(model),offset:actors.length*1.79,headRest:head.quaternion.clone(),armPose:captureArmPose(model),lastZ:pos[2],distance:0};actors.push(a);return a;
 }
 const temp=new THREE.Vector3(),aPos=new THREE.Vector3(),bPos=new THREE.Vector3(),cPos=new THREE.Vector3();
 const q=new THREE.Quaternion(),pQ=new THREE.Quaternion();
 function aim(bone,child,target){
  bone.getWorldPosition(aPos);child.getWorldPosition(bPos);const from=bPos.sub(aPos).normalize(),to=temp.copy(target).sub(aPos).normalize();q.setFromUnitVectors(from,to);bone.getWorldQuaternion(pQ);q.multiply(pQ);bone.parent.getWorldQuaternion(pQ);bone.quaternion.copy(pQ.invert().multiply(q));bone.updateWorldMatrix(false,true);
 }
 function gripPoint(hand,out=new THREE.Vector3()){
  const side=hand.name.endsWith('_l')?'l':'r';
  hand.getObjectByName('middle_02_'+side).getWorldPosition(out);
  return out.lerp(hand.getObjectByName('thumb_03_'+side).getWorldPosition(new THREE.Vector3()),.38);
 }
 // With the wrist gently bent, the forearm and palm form one distal link.
 // Reach for the actual contact point. Rolling about elbow-to-contact leaves
 // the fingers on the prop and avoids asking the wrist to absorb forearm twist.
 function handTo(a,target,side,grip,glassGrip=false){
  const upper=a.model.getObjectByName('upperarm_'+side),lower=a.model.getObjectByName('lowerarm_'+side),hand=a.model.getObjectByName('hand_'+side);
  applyFingerGrip(a.model,side,grip);
  a.holder.updateWorldMatrix(true,true);
  const sign=side==='l'?1:-1;
  const normal=glassGrip?new THREE.Vector3(sign*.88,0,-.46).normalize():new THREE.Vector3(0,-1,0);
  const forward=glassGrip?new THREE.Vector3(sign*.34,-.28,.90):new THREE.Vector3(.12,-.30,.95);
  const wanted=orientedPalm(hand,normal,forward);
  hand.quaternion.rotateTowards(lower.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(wanted),.47);
  const shoulder=upper.getWorldPosition(new THREE.Vector3()),elbow=lower.getWorldPosition(new THREE.Vector3());
  const other=a.model.getObjectByName('upperarm_'+(side==='l'?'r':'l')).getWorldPosition(new THREE.Vector3());
  const pole=shoulder.clone().sub(other).normalize().multiplyScalar(.62).add(new THREE.Vector3(0,-.78,-.12));
  const solved=solveArm(shoulder,target,shoulder.distanceTo(elbow),elbow.distanceTo(gripPoint(hand)),pole);
  aim(upper,lower,solved.elbow);
  aim(lower,{getWorldPosition:out=>gripPoint(hand,out)},solved.wrist);
  const axis=gripPoint(hand).sub(lower.getWorldPosition(elbow)).normalize();
  const actual=hand.userData.palmNormal.clone().applyQuaternion(hand.getWorldQuaternion(new THREE.Quaternion()));
  actual.addScaledVector(axis,-actual.dot(axis)).normalize();
  const projected=normal.clone().addScaledVector(axis,-normal.dot(axis)).normalize();
  const sine=THREE.MathUtils.clamp(axis.dot(actual.cross(projected)),-1,1);
  axis.applyQuaternion(lower.parent.getWorldQuaternion(new THREE.Quaternion()).invert());
  lower.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis,.90*sine));
  hand.updateWorldMatrix(true,true);return hand;
 }
 function suitcase(parent){
  const g=new THREE.Group();parent.add(g);box(g,[.45,.56,.21],[0,.34,0],leather,.045);
  // A belted trunk, with a dark recessed lid seam and a single clasp.
  box(g,[.422,.012,.219],[0,.494,0],wood,.004);
  box(g,[.037,.045,.014],[0,.49,.117],brass,.005);
  for(const x of [-.15,.15])box(g,[.033,.57,.225],[x,.34,0],brass,.006);
  for(const x of [-.17,.17])for(const y of [.10,.57])box(g,[.09,.07,.23],[x,y,0],brass,.016);
  tube(g,[[-.09,.63,0],[-.09,.72,0],[.09,.72,0],[.09,.63,0]],.014,wood);
  for(const x of [-.16,.16]){const w=cylinder(g,.042,.045,[x,.055,0],rubber);w.rotation.z=Math.PI/2;}
  label(g,'NO DEPARTURE',.19,.055,[.025,.42,.113]);return g;
 }
 function shadowDisc(parent,r=.35){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),grad=ctx.createRadialGradient(32,32,2,32,32,32);grad.addColorStop(0,'#0009');grad.addColorStop(1,'#0000');ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);const m=mesh(parent,new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}),[0,.072,0]);m.rotation.x=-Math.PI/2;m.castShadow=false;return m;}

 const service=root('C2');const attendant=actor(service,staff,[1.20,.02,-14.25],{tint:0xd5c1a1,yaw:Math.PI+.12});
 const trolley=new THREE.Group();service.add(trolley);trolley.position.set(.65,0,-13.25);
 for(const y of [.23,.94])box(trolley,[.80,.055,.53],[0,y,0],wood,.02);
 for(const x of [-.35,.35])for(const z of [-.20,.20]){cylinder(trolley,.017,.82,[x,.53,z],brass);const wheel=cylinder(trolley,.072,.035,[x,.08,z],rubber);wheel.rotation.z=Math.PI/2;}
 tube(trolley,[[-.36,1.00,-.23],[-.36,1.12,-.23],[.36,1.12,-.23],[.36,1.00,-.23]],.018,brass);
 cylinder(trolley,.27,.025,[0,.985,0],silver);label(trolley,'ROOM SERVICE',.39,.085,[0,.76,.275]);
 const cloche=new THREE.Group();trolley.add(cloche);const profile=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI/2;profile.push(new THREE.Vector2(.23*Math.cos(a),.19*Math.sin(a)));}mesh(cloche,new THREE.LatheGeometry(profile,48),silver);cylinder(cloche,.027,.05,[0,.215,0],brass);cloche.position.y=1;

 const children=root('C3');const childA=actor(children,child,[.18,.02,-14.0],{tint:0x9d8b7c,scale:1.22,yaw:Math.PI-.22}),childB=actor(children,child,[1.28,.02,-14.4],{tint:0x777e7c,scale:1.13,yaw:Math.PI+.25});
 const ball=mesh(children,new THREE.SphereGeometry(.13,32,24),new THREE.MeshStandardMaterial({color:0x6e0d13,roughness:.28}),[.65,.13,-12.9]);
 const stripe=mesh(ball,new THREE.TorusGeometry(.131,.005,8,48),new THREE.MeshStandardMaterial({color:0xaf7d54,roughness:.7}));stripe.rotation.x=.35;const ballShadow=shadowDisc(children,.23);
 const likeness=persistent&&porcelain?porcelain.scene.clone(true):null;
 if(likeness){children.add(likeness);likeness.visible=false;likeness.traverse(o=>{if(o.isMesh)o.castShadow=true;});}

 const dogGroup=root('C4'),stand=clone(dog.scene.getObjectByName('DogStand')),sit=clone(dog.scene.getObjectByName('DogSit'));
 stand.position.set(.8,.075,-14.05);stand.rotation.y=-.65;dogGroup.add(stand);stand.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.frustumCulled=false;}});
 const dogHead=stand.getObjectByName('DEF-head'),headRest=dogHead.quaternion.clone();
 const houndJoints=['DEF-neck.01','DEF-ear.01.L','DEF-ear.01.R','DEF-tail.01','DEF-tail.02','DEF-tail.03'];
 const houndPose=secondaryPose(stand,houndJoints);
 const projected=new THREE.ShaderMaterial({transparent:true,depthWrite:true,depthFunc:THREE.LessDepth,side:THREE.DoubleSide,uniforms:{opacity:{value:.70},base:{value:0}},vertexShader:`
 uniform float base;
 #include <common>
 #include <skinning_pars_vertex>
 void main(){
 #include <skinbase_vertex>
 #include <begin_vertex>
 #include <skinning_vertex>
 vec4 p=modelMatrix*vec4(transformed,1.);float h=p.y-base;p.x-=h*.70;p.z+=h*.58;p.y=base+.076;gl_Position=projectionMatrix*viewMatrix*p;}`,fragmentShader:`uniform float opacity;void main(){gl_FragColor=vec4(.015,.012,.013,opacity);}`});
 const shadowStand=clone(stand),shadowSit=sit;shadowSit.position.copy(stand.position);shadowSit.rotation.copy(stand.rotation);
 for(const g of [shadowStand,shadowSit]){dogGroup.add(g);g.traverse(o=>{if(o.isMesh){o.material=projected;o.castShadow=false;o.frustumCulled=false;o.renderOrder=2;}});}
 const dogCase=suitcase(dogGroup);dogCase.position.set(1.55,0,-14.7);dogCase.rotation.y=-.2;

 const bar=root('C5'),server=actor(bar,staff,[.13,.02,-14.03],{tint:0xa17f70,scale:1.10,yaw:Math.PI-.1}),bartender=actor(bar,porter,[1.07,.02,-14.02],{tint:0x8f958a,yaw:Math.PI+.15});
 box(bar,[.88,1,.47],[.72,.55,-13.65],wood,.035);box(bar,[1.03,.065,.59],[.72,1.085,-13.65],new THREE.MeshStandardMaterial({color:0x152321,metalness:.15,roughness:.3}),.025);
 for(const x of [.32,1.12])cylinder(bar,.025,1.05,[x,.56,-13.41],brass);
 label(bar,'THE LAST ORDER',.45,.08,[.72,.65,-13.398]);
 // An empty bottle stays on the shelf through both versions of the encounter.
 const bottle=mesh(bar,new THREE.LatheGeometry([[.001,0],[.043,0],[.045,.018],[.044,.185],[.021,.224],[.014,.233],[.014,.295],[.018,.297],[.018,.312],[.011,.312]].map(([x,y])=>new THREE.Vector2(x,y)),28),new THREE.MeshStandardMaterial({color:0x244535,roughness:.22,metalness:.18}),[1.14,1.12,-13.71]);
 cylinder(bottle,.045,.087,[0,.118,0],new THREE.MeshStandardMaterial({color:0xc5ae84,roughness:.78}));
 label(bottle,'1969',.07,.043,[0,.119,.046]);
 const glass=new THREE.Group();bar.add(glass);glass.scale.setScalar(1.12);const glassMat=new THREE.MeshPhysicalMaterial({color:0xbaccc2,metalness:.04,roughness:.18,transparent:true,opacity:.49,depthWrite:false,side:THREE.FrontSide});
 const rim=mesh(glass,new THREE.TorusGeometry(.045,.005,8,32),silver,[0,.12,0]);rim.rotation.x=Math.PI/2;
 const cup=mesh(glass,new THREE.CylinderGeometry(.045,.034,.12,32,1,true),glassMat,[0,.06,0]);cylinder(glass,.037,.007,[0,.005,0],silver);cylinder(glass,.036,.055,[0,.034,0],new THREE.MeshStandardMaterial({color:0xb85d1e,emissive:0x291204,emissiveIntensity:.25,metalness:.1,roughness:.22}));

 const luggage=root('C6'),traveller=actor(luggage,porter,[.55,.02,-14.15],{tint:0x899180,scale:1.03,yaw:Math.PI-.18}),caseObject=suitcase(luggage);caseObject.scale.y=1.5;const caseHandle=new THREE.Vector3();

 // A real planar reflection, with a separate actor only for the changed reflection.
 const reflection=actor(luggage,porter,[.55,.02,-14.15],{tint:0x899180,scale:1.03,yaw:Math.PI-.18});reflection.holder.visible=false;
 const mirrorFrame=new THREE.Group();luggage.add(mirrorFrame);mirrorFrame.visible=persistent;
 const mirror=new Reflector(new THREE.PlaneGeometry(1.4,2.2),{textureWidth:384,textureHeight:384,multisample:0,color:0xadaaa0});
 mirror.position.set(1.1,1.2,-15.55);mirrorFrame.add(mirror);
 for(const x of [.37,1.83])box(mirrorFrame,[.065,2.34,.09],[x,1.2,-15.56],brass);
 for(const y of [.05,2.35])box(mirrorFrame,[1.5,.065,.09],[1.1,y,-15.56],brass);
 let reflectionChanged=false,retreating=false,mirrorSerial=-1,renderedSerial=-1,mirrorTime=0,lastMirrorTime=-Infinity;
 const mirrorCamera=new THREE.Matrix4(),mirrorProjection=new THREE.Matrix4(),mirrorBackground=new THREE.Color(0x111718);let depthMeshes=null;
 const reflectRender=mirror.onBeforeRender;
 mirror.onBeforeRender=function(renderer,world,camera,...args){
  const cameraChanged=!mirrorCamera.equals(camera.matrixWorld)||!mirrorProjection.equals(camera.projectionMatrix);
  const distance=camera.position.distanceTo(mirror.getWorldPosition(temp)),cadence=distance>8?.1:1/30;
  const rt=mirror.getRenderTarget(),close=distance<(rt.width>384?7:5.5),w=close?768:384;if(rt.width!==w||rt.height!==w*9/16){rt.setSize(w,w*9/16);renderedSerial=-1;}
  if(!world.userData.measureFullFrame&&!cameraChanged&&renderedSerial===mirrorSerial&&mirrorTime-lastMirrorTime<cadence)return;
  lastMirrorTime=mirrorTime;renderedSerial=mirrorSerial;mirrorCamera.copy(camera.matrixWorld);mirrorProjection.copy(camera.projectionMatrix);
  if(!depthMeshes){depthMeshes=[];world.traverse(o=>{if((o.isMesh&&o.material.colorWrite===false)||o.isPoints||o.isLineSegments)depthMeshes.push(o);});}
  const bg=world.background,visible=traveller.holder.visible,depthOnly=depthMeshes.filter(o=>o.visible);for(const o of depthOnly)o.visible=false;world.background=mirrorBackground;
  if(reflectionChanged){traveller.holder.visible=false;reflection.holder.visible=true;}
  try{reflectRender.call(this,renderer,world,camera,...args);}finally{for(const o of depthOnly)o.visible=true;world.background=bg;traveller.holder.visible=visible;reflection.holder.visible=false;}
 };
 const coatGroup=root('coat');const coat=clone(props.scene.getObjectByName('Coat'));coatGroup.add(coat);coat.position.set(-1.57,1.75,-12.9);coat.rotation.y=.20;
 cylinder(coatGroup,.035,1.78,[-1.57,.91,-12.9],wood);cylinder(coatGroup,.24,.065,[-1.57,.073,-12.9],wood);
 tube(coatGroup,[[-1.79,1.68,-12.9],[-1.57,1.83,-12.9],[-1.35,1.68,-12.9],[-1.79,1.68,-12.9]],.012,brass);
 for(const o of [coat])o.traverse(m=>{if(m.isMesh)m.castShadow=true;});
 let currentId='C1',lastTime=0;
 const smooth=t=>t*t*(3-2*t);
 const tablePoint=new THREE.Vector3(.61,1.12,-13.75);
 const serverLift=new THREE.Vector3(.45,1.29,-13.77),receiverLift=new THREE.Vector3(.84,1.39,-13.75);
 const serverRest=new THREE.Vector3(.28,1.13,-13.75),receiverRest=new THREE.Vector3(.91,1.14,-13.73);
 const serverContact=new THREE.Vector3(-.037,.075,.012),receiverContact=new THREE.Vector3(.037,.075,.012);
 const beat=(t,a,b)=>THREE.MathUtils.smoothstep(t,a,b);
 function updateOne(time,dt,room,current){
  const nextId=current.vignette||'C1';if(!persistent&&nextId!==currentId)for(const k of Object.keys(metrics))delete metrics[k];currentId=nextId;const changed=current.anomaly===currentId;
  for(const [id,g] of Object.entries(roots))g.visible=room==='corridor'&&(id===currentId||id==='coat');
  if(room!=='corridor')return;
  coat.rotation.x=current.anomaly==='E5'?-Math.PI/2+.025*Math.sin(time*.8):.008*Math.sin(time*.7);
  if(currentId==='C6'){
   const wave=Math.sin(time*.30);traveller.holder.position.z=-14.1+wave*.30;
   const walking=Math.abs(Math.cos(time*.30))*.65;
   traveller.idle.setEffectiveWeight(1-walking);traveller.walk.setEffectiveWeight(walking);
   traveller.walk.time=THREE.MathUtils.euclideanModulo(wave*.30/1.07,1)*traveller.walk.getClip().duration;
  }
  const {gaze,nod,unease}=current.staffBeat||{gaze:0,nod:0,unease:0};
  for(const a of actors){
   if(!a.holder.parent.visible)continue;
   a.motion.restore();restoreArmPose(a.armPose);a.mixer.update(dt);
   for(const saved of a.armPose)saved.rotation.copy(saved.bone.quaternion);
   const warmth=a===bartender?.31:a===traveller?.46:a===childA||a===childB?.96:.76;
   const smile=(changed?.11:.24)+warmth*(.11*Math.sin(time*.74+a.offset)*(1-unease)+gaze*.82);
   a.smile(smile,(a===server||a===bartender?.91:.53)*gaze);
   a.head.quaternion.copy(a.headRest);
   // The server checks the bartender's reaction; the traveller sizes up the new arrival.
   if(a===server){a.head.rotation.y-=.27*gaze;a.head.rotation.z-=.095*nod;}
   if(a===traveller){a.head.rotation.y+=.32*gaze;a.head.rotation.x-=.105*nod;}

   const breath=Math.sin(time*1.64+a.offset),shift=Math.sin(time*.73+a.offset);
   a.motion.turn('spine_01',.013*breath,.022*shift,.015*shift);
   a.motion.turn('spine_02',-.007*breath,.013*shift,-.006*shift);
   for(const [side,sign] of [['l',1],['r',-1]]){
    a.motion.turn('clavicle_'+side,.012*breath,sign*.009*shift);
    a.motion.turn('upperarm_'+side,.024*Math.sin(time*.94+a.offset+sign),0,sign*.017*breath);
    a.motion.turn('lowerarm_'+side,.029*(.6+.4*shift));
   }
  }
  if(currentId==='C2'){const beat=time%4.8;const knock=changed?[.09,.33,.58].reduce((height,at)=>height+Math.exp(-((beat-at)**2)/.0016),0):0;cloche.position.y=1+knock*.135;cloche.rotation.z=knock*.17;
   attendant.head.quaternion.copy(attendant.headRest);attendant.head.rotation.x+=.075+.11*knock+.16*nod;attendant.head.rotation.y-=.26*gaze;metrics.clocheKnock=+knock.toFixed(3);}
  if(currentId==='C3'){
   childB.holder.visible=persistent||!changed;
   const phase=(time%7.2)/7.2,travel=Math.cos(Math.PI*smooth(Math.min(1,(phase%0.5)/.32)))*(phase<.5?1:-1);
   ball.position.set(.70+travel*.48,.13,-13.77-.15*travel);ball.rotation.z=-travel*3.7;
   ball.visible=!(changed&&likeness);
   if(likeness){likeness.visible=changed;likeness.position.copy(ball.position);likeness.position.y=.19;likeness.scale.setScalar(1.18);
    likeness.rotation.order='YXZ';likeness.rotation.set(-.20,Math.PI+.25,-(1-travel)*Math.PI);}

   ballShadow.position.set(ball.position.x,.077,ball.position.z);ballShadow.material.opacity=.65;
   metrics.childrenVisible=childB.holder.visible?2:1;metrics.plaything=changed&&likeness?'porcelain likeness':'rubber ball';
   for(const [index,a] of [childA,childB].entries()){
    // Eyes lead the returning ball; the porcelain player holds a fixed stare.
    const gaze=changed&&index===1?0:Math.atan2(ball.position.x-a.holder.position.x,1.4);
    a.head.quaternion.copy(a.headRest);a.head.rotation.x+=.095;
    a.head.rotation.y+=gaze*.53+(index===0?-.24:.31)*nod;
    a.head.rotation.z+=(index===0?1:-1)*.11*nod;
    const waiting=index===0?-travel:travel,follow=THREE.MathUtils.smoothstep(waiting,.38,1);
    const side=index===0?'l':'r';
    a.motion.turn('spine_01',.038*follow,gaze*.12,0);
    a.motion.turn('thigh_'+side,-.11*follow);a.motion.turn('calf_'+side,.17*follow);
    a.motion.turn('foot_'+side,-.06*follow);
    a.motion.turn('upperarm_'+side,-.055*follow,0,(index===0?1:-1)*.064*follow);
   }
  }
  if(currentId==='C4'){
   houndPose.restore();houndPose.turn('DEF-neck.01',.023*Math.sin(time*1.23),.07*Math.sin(time*.62));
   for(let i=0;i<3;i++)houndPose.turn(houndJoints[3+i],0,(changed?.025:.13*(1-.74*unease)) *Math.sin(time*3.7-i*.64));
   houndPose.turn('DEF-ear.01.L',.08*Math.sin(time*.91)**7);houndPose.turn('DEF-ear.01.R',.075*Math.sin(time*.89+.94)**7);
   for(const name of houndJoints){const b=stand.getObjectByName(name),s=shadowStand.getObjectByName(name);if(b&&s)s.quaternion.copy(b.quaternion);}
   dogHead.quaternion.copy(headRest);dogHead.rotation.y+=Math.sin(time*.32)*.045;dogHead.rotation.x+=.015*Math.sin(time*.7);dogHead.rotation.z+=.21*gaze;
   shadowStand.position.copy(stand.position);shadowStand.getObjectByName('DEF-head').quaternion.copy(dogHead.quaternion);shadowStand.visible=!changed;shadowSit.visible=changed;
  }
  if(currentId==='C5'){
   const service=current.wineTime;
   if(service!=null){
    // A glance at the vintage, an open hand beside the bottle, then a slow shake of the head.
    const present=THREE.MathUtils.smoothstep(service,.18,1.14)*(1-THREE.MathUtils.smoothstep(service,4.12,5.36));
    glass.position.copy(tablePoint);
    bartender.head.quaternion.copy(bartender.headRest);
    bartender.head.rotation.x+=.13*present;
    bartender.head.rotation.y+=present*(.18+.19*Math.sin(Math.max(0,service-1.1)*3.1));
    handTo(server,serverRest.clone().add(serverContact),'l',0,true);
    const gesture=receiverRest.clone().add(receiverContact).lerp(new THREE.Vector3(1.055,1.39,-13.77),present);
    handTo(bartender,gesture,'r',.10*present,true);
    lastTime=time;return;
   }
   bartender.head.quaternion.copy(bartender.headRest);
   // Two people use the same spot on the counter in turn. The glass rests
   // on the wood during the exchange, giving the first hand time to clear.
   bartender.head.rotation.y+=.24*gaze;bartender.head.rotation.x+=.09*nod;
   const t=(current.barClock??time)%9;
   const firstLift=beat(t,.95,1.87)*(1-beat(t,2.14,3.05));
   const secondLift=beat(t,changed?4.86:5.72,6.85)*(1-beat(t,7.04,8.05));
   const pos=tablePoint.clone().lerp(serverLift,firstLift).lerp(receiverLift,secondLift);
   const offer=beat(t,.06,.88)*(1-beat(t,3.15,4.13));
   const receive=beat(t,4.32,5.57)*(1-beat(t,8.12,8.99));
   const serverTarget=serverRest.clone().lerp(firstLift>0?pos:tablePoint,offer);
   // On the changed visit the receiving palm is already waiting above the wood.
   const receivingPoint=changed&&t<6.85?receiverLift:pos;
   const bartenderTarget=receiverRest.clone().lerp(receivingPoint,receive);
   const sh=handTo(server,serverTarget.clone().add(serverContact),'l',beat(t,.56,.96)*(1-beat(t,3.03,3.54)),true);
   const bh=handTo(bartender,bartenderTarget.clone().add(receiverContact),'r',beat(t,changed?6.49:5.13,changed?6.94:5.68)*(1-beat(t,8.03,8.53)),true);
   glass.position.copy(pos);
   const shPos=gripPoint(sh),bhPos=gripPoint(bh),gripTarget=glass.position.clone().add(new THREE.Vector3(0,.075,0));
   metrics.glassPhase=+t.toFixed(2);metrics.glassHandGap=+Math.min(shPos.distanceTo(gripTarget.clone().add(new THREE.Vector3(-.037,0,.012))),bhPos.distanceTo(gripTarget.clone().add(new THREE.Vector3(.037,0,.012)))).toFixed(3);metrics.handoffSeparation=+shPos.distanceTo(bhPos).toFixed(3);
   metrics.serverReachError=+shPos.distanceTo(serverTarget.clone().add(new THREE.Vector3(-.037,.075,.012))).toFixed(3);metrics.receiverReachError=+bhPos.distanceTo(bartenderTarget.clone().add(new THREE.Vector3(.037,.075,.012))).toFixed(3);
  }
  if(currentId==='C6'){
   const z=traveller.holder.position.z;
   caseObject.position.set(.85,0,z+.16);caseHandle.copy(caseObject.position);caseHandle.y+=1.08;
   const hand=handTo(traveller,caseHandle,'l',.88);

   reflectionChanged=changed;reflection.holder.position.z=-14.15;reflection.head.quaternion.copy(reflection.headRest);if(changed&&retreating)reflection.head.rotation.y+=.65;metrics.reflectionMismatch=changed;mirror.visible=persistent;
   metrics.caseHandGap=+gripPoint(hand).distanceTo(new THREE.Vector3(caseObject.position.x,caseObject.position.y+1.08,caseObject.position.z)).toFixed(3);
  }
  // Lower floors acknowledge the guest and then return to work. Upstairs
  // the head keeps following after the body has turned back to its task.
  if(gaze>0&&Number.isFinite(current.localEyeX)){
   for(const a of actors){
    if(!a.holder.parent.visible||!a.holder.visible)continue;
    const toEye=Math.atan2(current.localEyeX-a.holder.position.x,current.localEyeZ-a.holder.position.z);
    const delta=toEye-a.holder.rotation.y-Math.PI;
    const yaw=THREE.MathUtils.clamp(Math.atan2(Math.sin(delta),Math.cos(delta)),-.68,.68);
    a.head.rotation.y+=yaw*gaze*(.38+.60*unease);
    a.head.rotation.z+=gaze*unease*(a===childB||a===bartender?-.18:.22);
    if(a===attendant){a.motion.turn('spine_01',.12*nod*(1-unease));a.head.rotation.x-=.14*unease*gaze;}
   }
  }
  lastTime=time;
 }
 const offsets={C2:6.4,C3:3.25,C4:0,C5:-3.7,C6:-6.1};
 function update(time,dt,room,current,viewDepth=0,isRetreating=false){
  retreating=isRetreating;mirrorTime=time;mirrorSerial=current.serial;
  if(!persistent)return updateOne(time,dt,room,current);
  const id=current.vignette;
  const stair=room==='stairs';
  const wing={pantry:['C2',180,6.8,0],lounge:['C5',150,6.8,.13],baggage:['C6',210,6.8,0]}[room];
  const stage=room==='corridor'||stair||Boolean(wing);
  for(const g of Object.values(roots))g.visible=false;
  if(wing&&wing[0]!==id)return;
  if(room==='corridor'&&['C2','C3','C4','C5','C6','E5'].includes(id))return;
  if(!stage||(!roots[id]&&id!=='E5'))return;
  const g=id==='E5'?roots.coat:roots[id];
  // Solve hands and props in their authored local frame before placing the group.
  g.position.set(0,0,0);g.updateWorldMatrix(true,true);
  const mount=wing?wing.slice(1):stair?({C3:[89.27,4.4],C4:[89.16,5.12],E5:[91.58,3.94]}[id]||[90,0]):[0,offsets[id]||0];
  updateOne(time,dt,'corridor',{...current,localEyeX:current.eyeX-mount[0],localEyeZ:current.eyeZ-mount[1]});
  for(const other of Object.values(roots))other.visible=other===g;
  projected.uniforms.base.value=stair?1.92:0;
  if(stair){
   if(id==='C3')g.position.set(89.27,1.92,4.40);
   if(id==='C4')g.position.set(89.16,1.92,5.12);
   if(id==='E5')g.position.set(91.58,1.92,3.94);
  }else if(wing)g.position.set(wing[1],wing[3],wing[2]);
  else g.position.z=offsets[id]||0;
  g.updateWorldMatrix(true,true);
 }
 function inspectKey(id){return id==='C1'?null:'vignette';}
 return {update,inspectKey,roots,metrics,actors,cast:{actor,handTo,gripPoint,bottle,cloche,caseObject,people:[attendant,childA,childB,server,bartender,traveller],hound:stand},makeCase:suitcase};
}
