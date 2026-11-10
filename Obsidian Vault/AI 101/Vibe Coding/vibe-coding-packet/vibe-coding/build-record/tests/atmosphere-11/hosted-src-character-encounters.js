import {Reflector} from 'three/addons/objects/Reflector.js';
import * as THREE from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Gameplay retains a fixed cast. The ending can stage each group independently.
export function createCharacterEncounters(scene,{adult,child,props,staff,porter,persistent=false}){
 const metrics={};
 const roots={},actors=[],brass=new THREE.MeshStandardMaterial({color:0x8f7446,metalness:.72,roughness:.35}),
 silver=new THREE.MeshStandardMaterial({color:0xbab8a9,metalness:.82,roughness:.24}),
 wood=new THREE.MeshStandardMaterial({color:0x211310,roughness:.6}),
 leather=new THREE.MeshStandardMaterial({color:0x3b1a18,roughness:.68}),
 rubber=new THREE.MeshStandardMaterial({color:0x111312,roughness:.93});
 function root(id){const g=new THREE.Group();g.name=id;scene.add(g);roots[id]=g;return g;}
 function mesh(parent,geo,mat,pos=[0,0,0]){const m=new THREE.Mesh(geo,mat);m.position.fromArray(pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(parent,size,pos,mat,r=.02){return mesh(parent,new RoundedBoxGeometry(...size,2,r),mat,pos);}
 function cylinder(parent,r,h,pos,mat,r2=r){return mesh(parent,new THREE.CylinderGeometry(r2,r,h,24),mat,pos);}
 function tube(parent,points,r,mat){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,8,false),mat);}
 function label(parent,text,w,h,pos){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#b5a080';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#61503d';ctx.strokeRect(9,9,494,110);ctx.font='24px Georgia';ctx.fillStyle='#342a23';ctx.textAlign='center';ctx.fillText(text,256,75);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return mesh(parent,new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,roughness:.9}),pos);
 }
 function actor(parent,data,pos,{tint=0xffffff,scale=1,yaw=Math.PI}={}){
  const model=clone(data.scene),holder=new THREE.Group();holder.add(model);parent.add(holder);holder.position.fromArray(pos);holder.scale.setScalar(scale);holder.rotation.y=yaw;
  model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.frustumCulled=false;o.material=o.material.clone();if(o.material.transparent){o.material.alphaTest=.35;o.material.transparent=false;o.material.depthWrite=true;}
   if(/suit/i.test(o.name))o.material.color.set(tint);o.material.roughness=/skin/i.test(o.name)?.68:.83;
  });
  const mixer=new THREE.AnimationMixer(model),idle=mixer.clipAction(data.animations.find(c=>c.name==='Idle'));idle.play();
  const walk=mixer.clipAction(data.animations.find(c=>c.name==='Walk'));walk.play();walk.paused=true;walk.setEffectiveWeight(0);
  const head=model.getObjectByName('head');const a={holder,model,mixer,idle,walk,head,headRest:head.quaternion.clone(),lastZ:pos[2],distance:0};actors.push(a);return a;
 }
 const temp=new THREE.Vector3(),aPos=new THREE.Vector3(),bPos=new THREE.Vector3(),cPos=new THREE.Vector3();
 const q=new THREE.Quaternion(),pQ=new THREE.Quaternion();
 function aim(bone,child,target){
  bone.getWorldPosition(aPos);child.getWorldPosition(bPos);const from=bPos.sub(aPos).normalize(),to=temp.copy(target).sub(aPos).normalize();q.setFromUnitVectors(from,to);bone.getWorldQuaternion(pQ);q.multiply(pQ);bone.parent.getWorldQuaternion(pQ);bone.quaternion.copy(pQ.invert().multiply(q));bone.updateWorldMatrix(false,true);
 }
 function handTo(a,target,side='r'){
  const upper=a.model.getObjectByName('upperarm_'+side),lower=a.model.getObjectByName('lowerarm_'+side),hand=a.model.getObjectByName('hand_'+side);
  a.holder.updateWorldMatrix(true,true);upper.getWorldPosition(aPos);lower.getWorldPosition(bPos);hand.getWorldPosition(cPos);
  const start=aPos.clone(),u=start.distanceTo(bPos),l=bPos.distanceTo(cPos),axis=target.clone().sub(start),d=Math.min(axis.length(),u+l-.002);axis.normalize();
  const along=(u*u-l*l+d*d)/(2*Math.max(.01,d)),height=Math.sqrt(Math.max(0,u*u-along*along));const bend=new THREE.Vector3(0,-.6,1).addScaledVector(axis,-new THREE.Vector3(0,-.6,1).dot(axis)).normalize();
  const elbow=start.clone().addScaledVector(axis,along).addScaledVector(bend,height);aim(upper,lower,elbow);aim(lower,hand,target);return hand;
 }
 function suitcase(parent){
  const g=new THREE.Group();parent.add(g);box(g,[.45,.56,.21],[0,.34,0],leather,.045);
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

 const dogGroup=root('C4'),stand=clone(props.scene.getObjectByName('DogStand')),sit=clone(props.scene.getObjectByName('DogSit'));
 stand.position.set(.8,.03,-14.05);stand.rotation.y=-.65;dogGroup.add(stand);stand.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
 const dogHead=stand.getObjectByName('DogStandHead'),headRest=dogHead.quaternion.clone();
 const projected=new THREE.ShaderMaterial({transparent:true,depthWrite:true,depthFunc:THREE.LessDepth,side:THREE.DoubleSide,uniforms:{opacity:{value:.38}},vertexShader:`void main(){vec4 p=modelMatrix*vec4(position,1.);p.x-=p.y*.70;p.z+=p.y*.58;p.y=.076;gl_Position=projectionMatrix*viewMatrix*p;}`,fragmentShader:`uniform float opacity;void main(){gl_FragColor=vec4(.015,.012,.013,opacity);}`});
 const shadowStand=clone(stand),shadowSit=sit;shadowSit.position.copy(stand.position);shadowSit.rotation.copy(stand.rotation);
 for(const g of [shadowStand,shadowSit]){dogGroup.add(g);g.traverse(o=>{if(o.isMesh){o.material=projected;o.castShadow=false;o.frustumCulled=false;o.renderOrder=2;}});}
 const dogCase=suitcase(dogGroup);dogCase.position.set(1.55,0,-14.7);dogCase.rotation.y=-.2;

 const bar=root('C5'),server=actor(bar,staff,[.20,.02,-14.02],{tint:0xa17f70,yaw:Math.PI-.1}),bartender=actor(bar,porter,[1.0,.02,-14.06],{tint:0x8f958a,yaw:Math.PI+.15});
 box(bar,[.88,.88,.47],[.72,.49,-13.65],wood,.035);box(bar,[1.03,.065,.59],[.72,.965,-13.65],new THREE.MeshStandardMaterial({color:0x152321,metalness:.15,roughness:.3}),.025);
 for(const x of [.32,1.12])cylinder(bar,.025,.93,[x,.5,-13.41],brass);
 label(bar,'THE LAST ORDER',.45,.08,[.72,.65,-13.398]);
 const glass=new THREE.Group();bar.add(glass);glass.scale.setScalar(1.12);const glassMat=new THREE.MeshPhysicalMaterial({color:0xa6b5a2,metalness:.08,roughness:.14,transparent:true,opacity:.78,side:THREE.DoubleSide});
 const rim=mesh(glass,new THREE.TorusGeometry(.045,.005,8,32),silver,[0,.12,0]);rim.rotation.x=Math.PI/2;
 const cup=mesh(glass,new THREE.CylinderGeometry(.045,.034,.12,32,1,true),glassMat,[0,.06,0]);cylinder(glass,.037,.007,[0,.005,0],silver);cylinder(glass,.036,.055,[0,.034,0],new THREE.MeshStandardMaterial({color:0xb85d1e,emissive:0x291204,emissiveIntensity:.25,metalness:.1,roughness:.22}));

 const luggage=root('C6'),traveller=actor(luggage,porter,[.55,.02,-14.15],{tint:0x899180,scale:1.03,yaw:Math.PI-.18}),caseObject=suitcase(luggage);caseObject.scale.y=1.5;const caseHandle=new THREE.Vector3();

 // A real planar reflection, with a separate actor only for the changed reflection.
 const reflection=actor(luggage,porter,[.55,.02,-14.15],{tint:0x899180,scale:1.03,yaw:Math.PI-.18});reflection.holder.visible=false;
 const mirrorFrame=new THREE.Group();luggage.add(mirrorFrame);mirrorFrame.visible=persistent;
 const mirror=new Reflector(new THREE.PlaneGeometry(1.4,2.2),{textureWidth:512,textureHeight:512,color:0xadaaa0});
 mirror.position.set(1.1,1.2,-15.55);mirrorFrame.add(mirror);
 for(const x of [.37,1.83])box(mirrorFrame,[.065,2.34,.09],[x,1.2,-15.56],brass);
 for(const y of [.05,2.35])box(mirrorFrame,[1.5,.065,.09],[1.1,y,-15.56],brass);
 let reflectionChanged=false,retreating=false;
 const reflectRender=mirror.onBeforeRender;
 mirror.onBeforeRender=function(renderer,world,camera,...args){
  const bg=world.background,visible=traveller.holder.visible,depthOnly=[];world.traverse(o=>{if(o.isMesh&&o.visible&&o.material.colorWrite===false){depthOnly.push(o);o.visible=false;}});world.background=new THREE.Color(0x111718);
  if(reflectionChanged){traveller.holder.visible=false;reflection.holder.visible=true;}
  try{reflectRender.call(this,renderer,world,camera,...args);}finally{for(const o of depthOnly)o.visible=true;world.background=bg;traveller.holder.visible=visible;reflection.holder.visible=false;}
 };
 const coatGroup=root('coat');const coat=clone(props.scene.getObjectByName('Coat'));coatGroup.add(coat);coat.position.set(-1.57,1.75,-12.9);coat.rotation.y=.20;
 cylinder(coatGroup,.035,1.78,[-1.57,.91,-12.9],wood);cylinder(coatGroup,.24,.065,[-1.57,.073,-12.9],wood);
 tube(coatGroup,[[-1.79,1.68,-12.9],[-1.57,1.83,-12.9],[-1.35,1.68,-12.9],[-1.79,1.68,-12.9]],.012,brass);
 for(const o of [coat])o.traverse(m=>{if(m.isMesh)m.castShadow=true;});
 let currentId='C1',lastTime=0;
 const smooth=t=>t*t*(3-2*t),lerp=(a,b,t)=>new THREE.Vector3().lerpVectors(a,b,smooth(THREE.MathUtils.clamp(t,0,1)));
 const tablePoint=new THREE.Vector3(.58,1.02,-13.78),serverPoint=new THREE.Vector3(.39,1.24,-13.78),handoff=new THREE.Vector3(.58,1.22,-13.78);
 function updateOne(time,dt,room,current){
  const nextId=current.vignette||'C1';if(!persistent&&nextId!==currentId)for(const k of Object.keys(metrics))delete metrics[k];currentId=nextId;const changed=current.anomaly===currentId;
  for(const [id,g] of Object.entries(roots))g.visible=room==='corridor'&&(id===currentId||id==='coat');
  if(room!=='corridor')return;
  coat.rotation.x=current.anomaly==='E5'?-Math.PI/2+.025*Math.sin(time*.8):.008*Math.sin(time*.7);
  for(const a of actors){if(!a.holder.parent.visible)continue;a.mixer.update(dt);}
  if(currentId==='C2'){const beat=time%4.8;const knock=changed?(Math.exp(-beat*22)+Math.exp(-Math.abs(beat-.24)*28)+Math.exp(-Math.abs(beat-.49)*28)):0;cloche.position.y=1+knock*.045;cloche.rotation.z=knock*.045;metrics.clocheKnock=+knock.toFixed(3);}
  if(currentId==='C3'){
   childB.holder.visible=!changed;
   ball.position.set(.70+Math.sin(time*.75)*.48,.13,-12.95);ball.rotation.z=-Math.sin(time*.75)*3.7;
   ballShadow.position.set(ball.position.x,.077,ball.position.z);ballShadow.material.opacity=.65;
   metrics.childrenVisible=changed?1:2;
   for(const a of [childA,childB])a.head.quaternion.copy(a.headRest).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),.05));
  }
  if(currentId==='C4'){
   dogHead.quaternion.copy(headRest);dogHead.rotation.y+=Math.sin(time*.45)*.14;dogHead.rotation.z+=.04*Math.sin(time*.9);stand.position.x=.8+Math.sin(time*.45)*.018;
   shadowStand.position.copy(stand.position);shadowStand.getObjectByName('DogStandHead').quaternion.copy(dogHead.quaternion);shadowStand.visible=!changed;shadowSit.visible=changed;
  }
  if(currentId==='C5'){
   const t=time%7;let pos,serverTarget,bartenderTarget;
   if(changed){
    serverTarget=serverPoint;bartenderTarget=new THREE.Vector3(.98,.95,-14.0);
    pos=t<2?tablePoint:t<4?lerp(tablePoint,serverPoint,(t-2)/2):t<5?serverPoint:t<5.6?lerp(serverPoint,tablePoint,(t-5)/.6):tablePoint;
   }else{
    pos=t<1?tablePoint:t<2.4?lerp(tablePoint,serverPoint,(t-1)/1.4):t<3.6?lerp(serverPoint,handoff,(t-2.4)/1.2):t<5?lerp(handoff,tablePoint,(t-3.6)/1.4):tablePoint;
    serverTarget=t<3.6?pos:lerp(handoff,new THREE.Vector3(.20,.95,-14.0),(t-3.6)/.8);
    if(t>6)serverTarget=lerp(new THREE.Vector3(.20,.95,-14.0),tablePoint,t-6);
    bartenderTarget=t<2.8?new THREE.Vector3(.98,.95,-14.0):t<3.6?lerp(new THREE.Vector3(.98,.95,-14.0),handoff,(t-2.8)/.8):t<5?pos:lerp(tablePoint,new THREE.Vector3(.98,.95,-14.0),(t-5)/.8);
   }
   const sh=handTo(server,serverTarget.clone().add(new THREE.Vector3(0,.07,0)),'l'),bh=handTo(bartender,bartenderTarget.clone().add(new THREE.Vector3(0,.07,0)));
   glass.position.copy(pos);
   if(!changed&&t>=1&&t<5){(t<3.6?sh:bh).getWorldPosition(glass.position);glass.position.y-=.07;}
   const shPos=sh.getWorldPosition(new THREE.Vector3()),bhPos=bh.getWorldPosition(new THREE.Vector3()),gripPoint=glass.position.clone().add(new THREE.Vector3(0,.07,0));
   metrics.glassPhase=+t.toFixed(2);metrics.glassHandGap=+Math.min(shPos.distanceTo(gripPoint),bhPos.distanceTo(gripPoint)).toFixed(3);metrics.handoffSeparation=+shPos.distanceTo(bhPos).toFixed(3);
  }
  if(currentId==='C6'){
   const z=-14.1+Math.sin(time*.45)*.45,travel=z-traveller.lastZ;traveller.lastZ=z;traveller.distance+=travel;traveller.holder.position.z=z;
   traveller.idle.setEffectiveWeight(.15);traveller.walk.setEffectiveWeight(.85);traveller.walk.time=THREE.MathUtils.euclideanModulo(traveller.distance/1.07,1)*traveller.walk.getClip().duration;
   caseHandle.set(.94,1.08,z+.08);const hand=handTo(traveller,caseHandle,'l');caseObject.position.set(.94,0,z+.08);
   hand.getWorldPosition(caseObject.position);caseObject.position.y-=1.08;
   reflectionChanged=changed;reflection.holder.position.z=-14.15;reflection.head.quaternion.copy(reflection.headRest);if(changed&&retreating)reflection.head.rotation.y+=.65;metrics.reflectionMismatch=changed;mirror.visible=persistent;
   metrics.caseHandGap=+hand.getWorldPosition(new THREE.Vector3()).distanceTo(new THREE.Vector3(caseObject.position.x,1.08,caseObject.position.z)).toFixed(3);
  }
  lastTime=time;
 }
 const offsets={C2:6.4,C3:3.25,C4:0,C5:-3.7,C6:-6.1};
 function update(time,dt,room,current,viewDepth=0,isRetreating=false){
  retreating=isRetreating;
  if(!persistent)return updateOne(time,dt,room,current);
  if(room!=='corridor'){for(const g of Object.values(roots))g.visible=false;return;}
  // Choreography is authored in local staging coordinates, then placed in the hall.
  for(const id of Object.keys(offsets))roots[id].position.z=0;
  for(const id of Object.keys(offsets))updateOne(time,dt,room,{...current,vignette:id});
  for(const [id,offset] of Object.entries(offsets)){roots[id].position.z=offset;roots[id].visible=14-offset>viewDepth+.6;}
  roots.coat.visible=12.9>viewDepth+.5;
 }
 function inspectKey(id){return id==='C1'?null:'vignette';}
 return {update,inspectKey,roots,metrics,actors};
}
