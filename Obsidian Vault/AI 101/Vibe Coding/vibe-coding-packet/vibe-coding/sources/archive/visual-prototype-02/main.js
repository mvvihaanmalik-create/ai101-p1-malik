import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const $=id=>document.getElementById(id);
const cfg={speed:1.55,butlerSpeed:.76,repelSpeed:1.18,repelTime:3,cooldown:5,range:4.2,contact:.65,cutAt:11.4,returnAt:10.5};
const state={mode:'loading',time:0,view:0,active:false,repel:0,cooldown:0,gesture:0,walk:0,gait:0,threatWalk:0,captionUntil:0,contacts:0,casts:0,frameMs:0,resetAt:0};
const keys=new Set();let movementBasis=null,renderer,scene,camera,guest,butler,plates,views,guestShadow,butlerShadow,bell,cross,holyLight;
const v=new THREE.Vector3(),v2=new THREE.Vector3(),nodes={},errors=[];
const actors={};let windowShadow;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const review=new URLSearchParams(location.search).has('review');
addEventListener('error',e=>errors.push(e.message));

// Original synthesis. Starts only after the player enters the passage.
let audioCtx,master,droneGain;let soundOn=true;
function audioStart(){
 if(audioCtx){audioCtx.resume();return;}
 try{
  audioCtx=new AudioContext();master=audioCtx.createGain();master.gain.value=.18;master.connect(audioCtx.destination);
  droneGain=audioCtx.createGain();droneGain.gain.value=.035;droneGain.connect(master);
  [48.9,73.5,98.3].forEach((freq,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;g.gain.value=i===0?.5:.15;o.connect(g);g.connect(droneGain);o.start();});
  const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*3,audioCtx.sampleRate),a=buffer.getChannelData(0);let x=0;
  for(let i=0;i<a.length;i++){x=(x+(Math.random()*2-1)*.016)/1.018;a[i]=x;}
  const noise=audioCtx.createBufferSource();noise.buffer=buffer;noise.loop=true;
  const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=900;
  const gain=audioCtx.createGain();gain.gain.value=.28;noise.connect(filter);filter.connect(gain);gain.connect(master);noise.start();
 }catch(e){console.warn('Sound unavailable',e);}
}
function tone(freq,duration,volume,type='sine'){
 if(!audioCtx||!soundOn)return;
 const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(master);o.start(t);o.stop(t+duration+.04);
}
function ring(){[880,1317,1763,2310].forEach((f,i)=>tone(f,1.8,.09/(i+1)));}
function foot(){tone(70+Math.random()*20,.13,.11,'triangle');tone(220,.06,.018);}
function say(text,duration=4){$('caption').textContent=text;$('caption').classList.add('show');state.captionUntil=state.time+duration;}
function fatal(e){console.error(e);state.mode='error';$('error-message').textContent=`${e.message} Start this folder with npm run dev and open the printed local address.`;$('error').hidden=false;}
function shadow(){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),grad=g.createRadialGradient(64,64,4,64,64,64);grad.addColorStop(0,'rgba(3,3,3,.66)');grad.addColorStop(.35,'rgba(3,3,3,.32)');grad.addColorStop(1,'rgba(3,3,3,0)');g.fillStyle=grad;g.fillRect(0,0,128,128);
 const m=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false});
 const s=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.25),m);s.rotation.x=-Math.PI/2;s.position.y=.045;s.renderOrder=1;scene.add(s);return s;
}
function setView(index){
 state.view=index;const c=views[index];camera.position.fromArray(c.position);camera.lookAt(new THREE.Vector3().fromArray(c.target));camera.fov=c.fov;camera.updateProjectionMatrix();scene.background=plates[index];$('location').textContent=index?'THE UPPER PASSAGE':'THE EAST PASSAGE';
}
function resize(){const r=$('stage').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=16/9;camera.updateProjectionMatrix();}
function mapNodes(root){root.traverse(o=>{if(o.name){nodes[o.name]=o;o.userData.restRotation=o.rotation.clone();}if(o.isMesh){o.frustumCulled=false;if(o.material){o.material.envMapIntensity=.45;if(o.material.name==='Aged brass')o.material.color.setRGB(.36,.235,.095);}}});}
function joint(name,axis,angle){const n=nodes[name];if(n)n.rotation[axis]=n.userData.restRotation[axis]+angle;}
function prepareActor(name,gltf){
 const mixer=new THREE.AnimationMixer(gltf.scene),actions={};
 for(const clip of gltf.animations){actions[clip.name]=mixer.clipAction(clip);actions[clip.name].play();actions[clip.name].setEffectiveWeight(clip.name==='Idle'?1:0);}
 actors[name]={mixer,actions,hand:gltf.scene.getObjectByName('hand_r')};mixer.update(0);
 actions.Walk?.setEffectiveTimeScale(name==='Butler'?1.4:1.25);
 gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.envMapIntensity=.32;if(m.transparent){m.alphaTest=.35;m.transparent=false;m.depthWrite=true;}if(m.name.toLowerCase().includes('skin'))m.roughness=.64;}}});
 // Closed mouths never expose these interior meshes in this visual study.
 // Keep them in the editable source for the eventual reception reveal.
 gltf.scene.traverse(o=>{if(o.isMesh&&/teeth|tongue/i.test(o.name))o.visible=false;});
}

async function boot(){
 renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,16/9,.05,100);
 const response=await fetch('assets/scene-v2.json');if(!response.ok)throw new Error('Hotel camera data is missing.');views=(await response.json()).cameras;
 const manager=new THREE.LoadingManager();manager.onProgress=(_,loaded,total)=>{$('load-progress').textContent=` ${Math.round(loaded/total*100)}%`;};
 const loader=new GLTFLoader(manager),tex=new THREE.TextureLoader(manager);
 const [g,b,o,...p]=await Promise.all([loader.loadAsync('assets/guest-v2.glb'),loader.loadAsync('assets/butler-v2.glb'),loader.loadAsync('assets/occlusion.glb'),...views.map(c=>tex.loadAsync('assets/'+c.plate))]);
 plates=p;plates.forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;});
 guest=new THREE.Group();guest.add(g.scene);scene.add(guest);mapNodes(g.scene);
 butler=new THREE.Group();butler.add(b.scene);scene.add(butler);mapNodes(b.scene);
 prepareActor('Guest',g);prepareActor('Butler',b);
 o.scene.traverse(n=>{if(n.isMesh){n.material=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});n.renderOrder=-2;}});scene.add(o.scene);
 scene.add(new THREE.HemisphereLight(0x879bab,0x24190d,.72));
 const key=new THREE.DirectionalLight(0xeec698,.65);key.position.set(-3,4,0);scene.add(key);
 const rim=new THREE.DirectionalLight(0x8ab5ef,.55);rim.position.set(4,3,-10);scene.add(rim);
 [-1,1].forEach(s=>[2,6.3,9,14.4,17,22].forEach(y=>{const l=new THREE.PointLight(y===22?0xd44b2c:0xffbc69,7,6,2);l.position.set(s*1.8,2.3,-y);scene.add(l);}));
 [5.6,12.9,19.7].forEach(y=>{const l=new THREE.PointLight(0x8ebeff,9,7,2);l.position.set(2.1,2.4,-y);scene.add(l);});
 guestShadow=shadow();butlerShadow=shadow();bell=nodes.ButlerBell;
 guestShadow.material.opacity=.55;butlerShadow.material.opacity=.55;
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(4.6,25),new THREE.ShadowMaterial({opacity:.34,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.set(0,.041,-12);floor.receiveShadow=true;scene.add(floor);
 windowShadow=new THREE.SpotLight(0xa3c9ff,28,15,.75,.5,2);windowShadow.position.set(2.3,2.68,-12.9);windowShadow.target.position.set(-2,0,-15.7);windowShadow.castShadow=true;windowShadow.shadow.mapSize.set(1024,1024);windowShadow.shadow.bias=-.0005;windowShadow.shadow.normalBias=.025;scene.add(windowShadow,windowShadow.target);
 // Retain the anomalous bell as an independent, levitating brass prop.
 bell=new THREE.Group();bell.name='ButlerBell';const bellMat=new THREE.MeshStandardMaterial({color:0x9e7437,metalness:.6,roughness:.3});
 const bellCup=new THREE.Mesh(new THREE.CylinderGeometry(.022,.067,.08,32),bellMat);bell.add(bellCup);
 const bellHandle=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.10,16),bellMat);bellHandle.position.y=.09;bell.add(bellHandle);butler.add(bell);bell.position.set(.40,1.27,-.22);
 cross=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:0xa77c3d,metalness:.8,roughness:.28});
 for(const [sx,sy,z] of [[.025,.23,0],[.135,.025,.045]]){const c=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,.021),m);c.position.y=z;cross.add(c);}cross.visible=false;scene.add(cross);holyLight=new THREE.PointLight(0xffd8a0,0,3);scene.add(holyLight);
 const dustGeo=new THREE.BufferGeometry(),positions=[];for(let i=0;i<180;i++)positions.push((Math.random()-.5)*4,Math.random()*3.2,-Math.random()*24);dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xc4b58c,size:.009,transparent:true,opacity:.28,depthWrite:false}));scene.add(dust);
 $('world').addEventListener('webglcontextlost',e=>{e.preventDefault();pause();$('error-message').textContent='The graphics device paused. Reload to restore the passage.';$('error').hidden=false;});
 new ResizeObserver(resize).observe($('stage'));setView(0);resize();resetPositions();state.mode='intro';$('enter').disabled=false;$('enter').textContent='Enter the passage';if(review)$('diagnostics').hidden=false;
 let last=performance.now(),lastStep=0;
 renderer.setAnimationLoop(now=>{
  const elapsed=(now-last)/1000;last=now;const dt=Math.min(elapsed,.05);state.frameMs=state.frameMs*.95+elapsed*1000*.05;
  if(state.mode==='playing'){
   state.time+=dt;update(dt);for(const actor of Object.values(actors))actor.mixer.update(dt);if(state.walk-lastStep>Math.PI){lastStep=state.walk;foot();}if(state.walk<lastStep)lastStep=state.walk;
   if(state.time>state.captionUntil)$('caption').classList.remove('show');if(!reducedMotion)dust.rotation.y=Math.sin(state.time*.02)*.006;
  }
  if(cross?.visible&&actors.Guest?.hand){actors.Guest.hand.getWorldPosition(cross.position);cross.position.y+=.065;cross.position.z-=.04;holyLight.position.copy(cross.position);}
  renderer.render(scene,camera);updateDiagnostics();
 });
}
function resetPositions(){
 guest.position.set(-.32,.02,-3.8);guest.rotation.set(0,0,0);butler.position.set(-.28,.02,-18.2);butler.rotation.y=Math.PI;
 state.active=false;state.repel=0;state.cooldown=0;state.gesture=0;state.walk=0;state.gait=0;state.threatWalk=0;state.resetAt=0;
 for(const name of ['Guest','Butler'])animateBody(name,0,0);cross.visible=false;setView(0);keys.clear();movementBasis=null;updateShadows();
}
function begin(){
 audioStart();resetPositions();state.mode='playing';$('intro').hidden=true;$('pause').hidden=true;$('end').hidden=true;$('hud').hidden=false;$('defense').style.display='flex';$('blackout').style.opacity=0;$('stage').focus();
 if(master)master.gain.setTargetAtTime(soundOn?.18:0,audioCtx.currentTime,.2);say('The lift is out of order. Take the passage.',5);
}
function pause(){if(state.mode!=='playing')return;state.mode='paused';keys.clear();movementBasis=null;$('pause').hidden=false;$('resume').focus();if(master)master.gain.setTargetAtTime(0,audioCtx.currentTime,.2);}
function resume(){if(state.mode!=='paused')return;state.mode='playing';$('pause').hidden=true;$('stage').focus();if(master)master.gain.setTargetAtTime(soundOn?.18:0,audioCtx.currentTime,.2);}
function cast(){
 if(state.mode!=='playing'||state.cooldown>0||state.resetAt)return;
 state.casts++;state.cooldown=cfg.cooldown;state.gesture=1;ring();
 if(state.active&&guest.position.distanceTo(butler.position)<=cfg.range){state.repel=cfg.repelTime;say('For a moment, he remembers his manners.',3);}else say('Keep it close.',1.8);
}
function animateBody(name,phase,moving){
 const actor=actors[name];if(!actor)return;
 if(name==='Guest')actor.actions.Walk?.setEffectiveTimeScale((keys.has('s')||keys.has('arrowdown')?-1:1)*1.25);
 const raised=name==='Guest'&&state.gesture>0;
 actor.actions.Idle?.setEffectiveWeight(raised?0:1-moving);
 actor.actions.Walk?.setEffectiveWeight(raised?0:moving);
 actor.actions.Raise?.setEffectiveWeight(raised?1:0);
}
function updateShadows(){for(const [actor,s] of [[guest,guestShadow],[butler,butlerShadow]]){s.position.x=actor.position.x;s.position.z=actor.position.z+.08;}}
function update(dt){
 if(state.resetAt){if(state.time>=state.resetAt){resetPositions();$('blackout').style.opacity=0;say('You are back where you started.',4);}return;}
 state.cooldown=Math.max(0,state.cooldown-dt);state.gesture=Math.max(0,state.gesture-dt);
 const ix=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),iy=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),moving=ix!==0||iy!==0;
 if(moving){
  if(!movementBasis){const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();movementBasis={forward,right:new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0))};}
  v.copy(movementBasis.forward).multiplyScalar(iy).addScaledVector(movementBasis.right,ix).normalize();guest.position.addScaledVector(v,cfg.speed*dt);guest.position.x=THREE.MathUtils.clamp(guest.position.x,-1.37,1.2);guest.position.z=THREE.MathUtils.clamp(guest.position.z,-22.5,-2.9);
  // Retreat is a cautious backwards walk. Both fixed views keep the guest's face hidden.
  guest.rotation.y=THREE.MathUtils.damp(guest.rotation.y,-ix*.20,6,dt);state.walk+=dt*8.4;
 }else{movementBasis=null;guest.rotation.y=THREE.MathUtils.damp(guest.rotation.y,0,6,dt);}
 state.gait=THREE.MathUtils.damp(state.gait,moving?1:0,16,dt);
 animateBody('Guest',state.walk,state.gait);
 if(!state.active&&guest.position.z<-7.2){state.active=true;ring();say('His hand is empty. The bell is not.',4.5);}
 if(state.active){
  v.subVectors(guest.position,butler.position);v.y=0;const dist=v.length();v.normalize();
  if(state.repel>0){state.repel-=dt;butler.position.addScaledVector(v,-cfg.repelSpeed*dt);butler.position.z=Math.max(-23,butler.position.z);}
  else if(dist>cfg.contact)butler.position.addScaledVector(v,cfg.butlerSpeed*dt);
  else{state.contacts++;state.resetAt=state.time+1.1;$('blackout').style.opacity=1;tone(39,.9,.5,'sawtooth');keys.clear();return;}
  butler.position.x=THREE.MathUtils.clamp(butler.position.x,-1.37,1.15);
  butler.position.z=THREE.MathUtils.clamp(butler.position.z,-23,-2.9);
  butler.rotation.y=Math.atan2(-v.x,-v.z);state.threatWalk+=dt*3.1;animateBody('Butler',state.threatWalk,1);
 }else animateBody('Butler',state.time*.6,0);
 if(bell){bell.position.y=1.31+Math.sin(state.time*1.4)*.045;bell.position.x=.40;}
 cross.visible=state.gesture>0;cross.position.copy(guest.position).add(v2.set(.27,1.35,-.32));holyLight.position.copy(cross.position);holyLight.intensity=state.gesture>0?2.5:0;
 const y=-guest.position.z;if(state.view===0&&y>cfg.cutAt)setView(1);else if(state.view===1&&y<cfg.returnAt)setView(0);
 const nearest=[5.6,12.9,19.7].reduce((a,b)=>Math.abs(a-y)<Math.abs(b-y)?a:b);windowShadow.position.z=-nearest;windowShadow.target.position.z=-nearest-2.8;
 if(y>22.4){state.mode='end';$('end').hidden=false;$('again').focus();keys.clear();if(master)master.gain.setTargetAtTime(.07,audioCtx.currentTime,.5);}
 const ready=state.cooldown<=0;$('defense-label').textContent=ready?'F · Raise the crucifix':`Steady your hand · ${Math.ceil(state.cooldown)}s`;$('charge').style.transform=`scaleX(${1-state.cooldown/cfg.cooldown})`;$('defense').setAttribute('aria-label',ready?'Crucifix ready':`Crucifix recharging ${Math.ceil(state.cooldown)} seconds`);
 if(droneGain)droneGain.gain.setTargetAtTime(state.active?.06:.035,audioCtx.currentTime,.5);updateShadows();
}
function updateDiagnostics(){
 if(!guest)return;
 $('diagnostics').textContent=JSON.stringify({mode:state.mode,view:state.view,guestX:+guest.position.x.toFixed(2),guestY:+(-guest.position.z).toFixed(2),butlerY:+(-butler.position.z).toFixed(2),distance:+guest.position.distanceTo(butler.position).toFixed(2),active:state.active,repel:+state.repel.toFixed(2),cooldown:+state.cooldown.toFixed(2),contacts:state.contacts,casts:state.casts,frameMs:+state.frameMs.toFixed(1),triangles:renderer.info.render.triangles,errors});$('stage').dataset.mode=state.mode;$('stage').dataset.camera=String(state.view);
}
$('enter').addEventListener('click',begin);$('resume').addEventListener('click',resume);$('restart').addEventListener('click',begin);$('again').addEventListener('click',begin);
$('sound').addEventListener('change',e=>{soundOn=e.target.checked;if(master)master.gain.setTargetAtTime(soundOn&&state.mode==='playing'?.18:0,audioCtx.currentTime,.1);});
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','f','escape'].includes(k))e.preventDefault();
 if(k==='escape'&&!e.repeat){if(state.mode==='paused')resume();else pause();return;}if(state.mode!=='playing')return;if(k==='f'&&!e.repeat)cast();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))keys.add(k);
});
addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(!keys.size)movementBasis=null;});
addEventListener('blur',()=>pause());document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
boot().catch(fatal);
