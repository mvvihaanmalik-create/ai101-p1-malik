import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { installBenchmark } from './benchmark.js';
import { PassageLoop, seededRandom, crossedThreshold } from './passage-loop.js';
import { createEncounterArt } from './encounter-art.js';
import { createCharacterEncounters } from './character-encounters.js';
import {createReceptionEnding} from './reception-ending.js';
import {GREETING,canEnterEnding} from './ending-timeline.js';
import {createMusicScore} from './music-score.js';
import { CATALOGUE, inspectionAt } from './encounter-catalogue.js';
const $=id=>document.getElementById(id);
const cfg={speed:1.55,butlerSpeed:.76,repelSpeed:1.18,repelTime:3,cooldown:5,range:4.2,contact:.65,cutAt:11.4,returnAt:10.5};
const state={mode:'loading',time:0,view:0,active:false,repel:0,cooldown:0,gesture:0,walk:0,gait:0,threatWalk:0,captionUntil:0,contacts:0,casts:0,frameMs:0,resetAt:0};
const keys=new Set();let movementBasis=null,renderer,scene,camera,guest,butler,plates,views,guestShadow,butlerShadow,bell,cross,holyLight;
const blockedKeys=new Set();
function releaseMovement(){for(const k of keys)blockedKeys.add(k);keys.clear();movementBasis=null;}
const v=new THREE.Vector3(),v2=new THREE.Vector3(),nodes={},errors=[];
const actors={};let windowShadow,hotel,room='reception',needsRender=true,lastRender=0,lastDiagnostic=0,roomCooldown=0;
const perf={renderMs:0,scheduler:'raf',stalls:0};
const route=['reception','landing','corridor','stairs','suite'];
const roomNames={reception:'RECEPTION',landing:'THE BROKEN LIFT',corridor:'THE EAST PASSAGE',stairs:'THE EAST STAIR',suite:'THE HONEYMOON SUITE',lounge:'THE NIGHT BAR'};
const liveLights=[];let pendingRoom=null,encounterArt,characterEncounters,loop,passageStarted=false,cueAt=null,detail=null;
const plateVariants={};
let ending,pausedMode='playing';
let seed=0;
function newRun(){seed=crypto.getRandomValues(new Uint32Array(1))[0];loop=new PassageLoop(seededRandom(seed));passageStarted=false;cueAt=null;}
newRun();
const framingZoom=1.18;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const review=new URLSearchParams(location.search).has('review');
addEventListener('error',e=>errors.push(e.message));

// Original synthesis. Starts only after the player enters the passage.
let audioCtx,master,droneGain;let soundOn=true;
const music=createMusicScore({onError:message=>{$('music-status').textContent=message;}});
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
 state.view=index;const c=views[index];camera.position.fromArray(c.position);camera.lookAt(new THREE.Vector3().fromArray(c.target));camera.fov=c.fov;camera.updateProjectionMatrix();scene.background=plateVariants[loop.current.anomaly]?.[index]||plates[index];$('location').textContent=roomNames[room];needsRender=true;
}
function resize(){const r=$('stage').getBoundingClientRect();renderer.setPixelRatio(Math.min(devicePixelRatio,1.25,1600/Math.max(1,r.width)));renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=16/9;camera.updateProjectionMatrix();needsRender=true;}
function mapNodes(root){root.traverse(o=>{if(o.name){nodes[o.name]=o;o.userData.restRotation=o.rotation.clone();}if(o.isMesh){o.frustumCulled=false;if(o.material){o.material.envMapIntensity=.45;if(o.material.name==='Aged brass')o.material.color.setRGB(.36,.235,.095);}}});}
function joint(name,axis,angle){const n=nodes[name];if(n)n.rotation[axis]=n.userData.restRotation[axis]+angle;}
function prepareActor(name,gltf){
 const mixer=new THREE.AnimationMixer(gltf.scene),actions={};
 for(let clip of gltf.animations){
  if(clip.name==='Raise'){clip=clip.clone();THREE.AnimationUtils.makeClipAdditive(clip,0,gltf.animations.find(c=>c.name==='Idle'));clip.tracks=clip.tracks.filter(t=>/upperarm_r|lowerarm_r|hand_r|thumb.*_r|index.*_r|middle.*_r|ring.*_r|pinky.*_r/.test(t.name));}
  actions[clip.name]=mixer.clipAction(clip);actions[clip.name].play();actions[clip.name].setEffectiveWeight(clip.name==='Idle'?1:0);
 }
 actions.Walk.paused=true;actions.Raise.paused=true;
 actors[name]={mixer,actions,hand:gltf.scene.getObjectByName('hand_r'),distance:0,raiseWeight:0};mixer.update(0);
 gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.envMapIntensity=.32;if(m.transparent){m.alphaTest=.35;m.transparent=false;m.depthWrite=true;}if(m.name.toLowerCase().includes('skin'))m.roughness=.64;}}});
 // Closed mouths never expose these interior meshes in this visual study.
 // Keep them in the editable source for the eventual reception reveal.
 gltf.scene.traverse(o=>{if(o.isMesh&&/teeth|tongue/i.test(o.name))o.visible=false;});
}

async function boot(){
 renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,16/9,.05,100);
 document.body.dataset.build='v7';
 const response=await fetch('assets/hotel-v5.json');if(!response.ok)throw new Error('Hotel camera data is missing.');hotel=await response.json();views=hotel.cameras;
 const manager=new THREE.LoadingManager();manager.onProgress=(_,loaded,total)=>{$('load-progress').textContent=` ${Math.round(loaded/total*100)}%`;};
 const loader=new GLTFLoader(manager),tex=new THREE.TextureLoader(manager);
 const imageFiles=[...new Set([...views.map(c=>c.plate),...Object.values(hotel.variants).flatMap(v=>Object.values(v))])];
 const [g,b,o,newDepth,child,props,staff,porter,...p]=await Promise.all([loader.loadAsync('assets/guest-v3.glb'),loader.loadAsync('assets/butler-v3.glb'),loader.loadAsync('assets/occlusion.glb'),loader.loadAsync('assets/hotel-occlusion-v3.glb'),loader.loadAsync('assets/child-v5.glb'),loader.loadAsync('assets/encounter-props-v5.glb'),loader.loadAsync('assets/attendant-v5.glb'),loader.loadAsync('assets/porter-v5.glb'),...imageFiles.map(file=>tex.loadAsync('assets/'+file))]);
 // Apply the identical centered crop to the plate and perspective camera.
 // This keeps geometry/occlusion registered while making the shot more intimate.
 camera.zoom=framingZoom;
 const textureByFile=Object.fromEntries(imageFiles.map((file,i)=>[file,p[i]]));plates=views.map(c=>textureByFile[c.plate]);for(const [id,variants] of Object.entries(hotel.variants))plateVariants[id]=Object.fromEntries(Object.entries(variants).map(([index,file])=>[index,textureByFile[file]]));p.forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.repeat.setScalar(1/framingZoom);t.offset.setScalar((1-1/framingZoom)/2);t.updateMatrix();});
 guest=new THREE.Group();guest.add(g.scene);scene.add(guest);mapNodes(g.scene);
 butler=new THREE.Group();butler.add(b.scene);scene.add(butler);mapNodes(b.scene);
 prepareActor('Guest',g);prepareActor('Butler',b);
 o.scene.traverse(n=>{if(n.isMesh){n.material=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});n.renderOrder=-2;}});scene.add(o.scene);
 newDepth.scene.traverse(n=>{if(n.isMesh){n.material=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});n.renderOrder=-2;}});scene.add(newDepth.scene);
 scene.add(new THREE.HemisphereLight(0x758f97,0x28101b,.58));
 const key=new THREE.DirectionalLight(0xe9af80,.85);key.position.set(-3,4,2);scene.add(key);
 const rim=new THREE.DirectionalLight(0x5c9fca,.85);rim.position.set(4,3,-10);scene.add(rim);
 for(const color of [0xff732e,0x37a6a7]){const l=new THREE.PointLight(color,9,8,2);scene.add(l);liveLights.push(l);}
 guestShadow=shadow();butlerShadow=shadow();bell=nodes.ButlerBell;
 guestShadow.material.opacity=.55;butlerShadow.material.opacity=.55;
 for(const r of Object.values(hotel.rooms)){if(r===hotel.rooms.stairs)continue;const floor=new THREE.Mesh(new THREE.PlaneGeometry(6,r===hotel.rooms.corridor?25:11),new THREE.ShadowMaterial({opacity:.30,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.set(r.origin,.05,r===hotel.rooms.corridor?-12:-5);floor.receiveShadow=true;scene.add(floor);}
 windowShadow=new THREE.SpotLight(0x86b2c9,19,15,.85,.6,2);windowShadow.castShadow=true;windowShadow.shadow.mapSize.set(512,512);windowShadow.shadow.bias=-.0005;windowShadow.shadow.normalBias=.025;scene.add(windowShadow,windowShadow.target);
 // Retain the anomalous bell as an independent, levitating brass prop.
 bell=new THREE.Group();bell.name='ButlerBell';const bellMat=new THREE.MeshStandardMaterial({color:0x9e7437,metalness:.6,roughness:.3});
 const bellCup=new THREE.Mesh(new THREE.CylinderGeometry(.022,.067,.08,32),bellMat);bell.add(bellCup);
 const bellHandle=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.10,16),bellMat);bellHandle.position.y=.09;bell.add(bellHandle);butler.add(bell);bell.position.set(.40,1.27,-.22);
 cross=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:0xa77c3d,metalness:.8,roughness:.28});
 for(const [sx,sy,z] of [[.025,.23,0],[.135,.025,.045]]){const c=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,.021),m);c.position.y=z;cross.add(c);}cross.visible=false;scene.add(cross);holyLight=new THREE.PointLight(0xffd8a0,0,3);scene.add(holyLight);
 const dustGeo=new THREE.BufferGeometry(),positions=[];for(let i=0;i<180;i++)positions.push((Math.random()-.5)*4,Math.random()*3.2,-Math.random()*24);dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xc4b58c,size:.009,transparent:true,opacity:.28,depthWrite:false}));scene.add(dust);
 encounterArt=await createEncounterArt(scene);characterEncounters=createCharacterEncounters(scene,{adult:g,child,props,staff,porter});
 ending=await createReceptionEnding({renderer,loader,tex,models:{guest:g,butler:b,child,props,staff,porter},reception:views[3],plate:plates[3],reducedMotion,onBeat:phase=>{if(phase==='greeting')ring();if(phase==='unmasking'){tone(36,4,.16,'triangle');tone(74,4,.045);}if(phase==='turn')tone(48,1,.14);if(phase==='surrounded'){tone(31,6,.19,'triangle');tone(65,6,.045);}if(phase==='held')tone(42,2,.10);}});
 $('world').addEventListener('webglcontextlost',e=>{e.preventDefault();pause();$('error-message').textContent='The graphics device paused. Reload to restore the passage.';$('error').hidden=false;});
 new ResizeObserver(resize).observe($('stage'));resize();setRoom('reception');for(const root of Object.values(characterEncounters.roots))root.visible=true;await renderer.compileAsync(scene,camera);characterEncounters.update(state.time,0,room,loop.current);renderer.render(scene,camera);state.mode='intro';$('enter').disabled=false;$('enter').textContent='Enter the hotel';if(review)$('diagnostics').hidden=false;
 if(review)installBenchmark({renderer,scene,camera,pause,setRoom,reviewEncounter,reviewDetail,reviewEnding,holdEnding:value=>ending.hold(value),renderFrame:()=>ending.active?ending.render():renderer.render(scene,camera)});
 let last=performance.now(),lastStep=0,lastRaf=last;
 function tick(now,scheduler){
  if(now-lastRender<10||document.hidden)return;
  const elapsed=(now-last)/1000;last=now;const dt=Math.min(elapsed,.05);state.frameMs=state.frameMs*.95+elapsed*1000*.05;perf.scheduler=scheduler;
  if(state.mode==='playing'){
   state.time+=dt;update(dt);for(const actor of Object.values(actors))actor.mixer.update(dt);if(state.walk-lastStep>.54){lastStep=state.walk;foot();}if(state.walk<lastStep)lastStep=state.walk;
   if(state.time>state.captionUntil)$('caption').classList.remove('show');if(!reducedMotion)dust.rotation.y=Math.sin(state.time*.02)*.006;
   needsRender=true;
  }
  if(state.mode==='ending'){
   state.time+=dt;ending.update(dt);const f=ending.frame;music.updateEnding(f.time);$('caption').textContent=f.caption;$('caption').classList.toggle('show',!!f.caption);needsRender=true;
   if(f.complete){state.mode='end';$('end').hidden=false;$('again').focus();if(droneGain)droneGain.gain.setTargetAtTime(.012,audioCtx.currentTime,1);}
  }
  if(cross?.visible&&actors.Guest?.hand){actors.Guest.hand.getWorldPosition(cross.position);cross.position.y+=.065;cross.position.z-=.04;holyLight.position.copy(cross.position);}
  if(needsRender){const start=performance.now();(ending?.active?ending.render():renderer.render(scene,camera));perf.renderMs=perf.renderMs*.9+(performance.now()-start)*.1;needsRender=false;}
  lastRender=now;if(now-lastDiagnostic>200){updateDiagnostics();lastDiagnostic=now;}
 }
 renderer.setAnimationLoop(now=>{lastRaf=now;tick(now,'raf');});
 // Desktop embedded previews can stall rAF even while reporting visible.
 // The watchdog only runs while visible, never advances hidden gameplay.
 setInterval(()=>{const now=performance.now();if(!document.hidden&&now-lastRaf>100){if(perf.scheduler!=='timer')perf.stalls++;tick(now,'timer');}},16);
}
function resetPositions(){
 const r=hotel.rooms[room];guest.position.set(r.origin+r.entry[0],.02,-r.entry[1]);guest.rotation.set(0,0,0);butler.position.set(room==='reception'?31.45:-.28,.02,room==='reception'?-7.85:-18.2);butler.rotation.y=Math.PI;butler.visible=(room==='corridor'&&loop.current.vignette==='C1')||room==='reception';butlerShadow.visible=room==='corridor'&&butler.visible;bell.visible=room==='corridor'&&butler.visible;if(room==='corridor'){butler.position.set(loop.current.anomaly==='C1'?-.28:.94,.02,-15.8);cueAt=null;}
 if(room==='landing')guest.position.z=-4.5;
 state.active=false;state.repel=0;state.cooldown=0;state.gesture=0;state.walk=0;state.gait=0;state.threatWalk=0;state.resetAt=0;
 for(const name of ['Guest','Butler']){actors[name].distance=0;animateBody(name,0,0);}cross.visible=false;holyLight.intensity=0;setView(r.views[0]);keys.clear();movementBasis=null;updateShadows();needsRender=true;
}
function updateProgress(){
 const label=!passageStarted?'Find the east passage':loop.orientation?'Orientation · learn the ordinary passage':loop.unlocked?'4 / 4 · The suite is waiting':`${loop.progress} / 4 · Correct decisions`;
 $('progress-label').textContent=label;$('progress').setAttribute('aria-label',label);
 [...$('progress-marks').children].forEach((mark,i)=>mark.classList.toggle('lit',i<loop.progress));
}
function setRoom(name,fromEnd=false){
 ending?.stop();pausedMode='playing';$('stage').classList.remove('ending');$('end').hidden=true;
 detail=null;guest.visible=true;guestShadow.visible=true;room=name;if(name==='landing'&&!passageStarted)passageStarted=true;
 resetPositions();if(fromEnd)guest.position.z=-(hotel.rooms[name].exit-.9);
 roomCooldown=.8;updateShadows();encounterArt.update(state.time,room,loop.current.anomaly);characterEncounters.update(state.time,0,room,loop.current);updateProgress();
 say(name==='corridor'?(loop.orientation?'Learn the ordinary passage. E examines nearby objects. Occupants are not always wrong.':'Look carefully. The hotel makes small mistakes.'):name==='reception'?GREETING:name==='landing'?(loop.orientation?'Learn the ordinary passage first. Cross the brass line at the far stair.':'If anything has changed, return across the brass line behind you.'):name==='stairs'?(loop.unlocked?'Four correct decisions. The honeymoon suite is above.':'The stair returns to the same floor.'):name==='lounge'?'The last drink is still waiting.':'One room remains occupied.',6);
}
function goRoom(name,fromEnd=false,notice=''){if(pendingRoom)return;pendingRoom={name,fromEnd,notice,at:state.time+.42};releaseMovement();$('blackout').style.opacity=1;}
function nextPassage(notice){loop.next();cueAt=null;goRoom('landing',false,notice);}
function submitDecision(choice){
 const result=loop.decide(choice);if(!result)return;
 if(result.kind==='orientation-return'){guest.position.z=-3.5;say('First, learn the ordinary passage. Continue to the far stair.',5);return;}
 updateProgress();releaseMovement();
 if(result.kind==='wrong'||result.kind==='contact'){
  tone(39,.8,.25,'sawtooth');nextPassage(result.kind==='contact'?'He has brought you back. Progress returns to zero.':'The hotel returns you to zero. Look again.');
 }else{
  tone(330,.7,.06);tone(495,1,.035);
  const notice=result.kind==='orientation'?'Now you know the ordinary passage. Four correct decisions will open the suite.':result.unlocked?'Four correct decisions. The suite is waiting.':`${result.progress} of 4. Another floor. The same passage.`;
  if(choice==='continue'||result.unlocked)goRoom('stairs',false,notice);else nextPassage(notice);
 }
}
function reviewEncounter(id){
 // A visible review-only fixture; never changes retail randomization or speed.
 pause();pendingRoom=null;$('blackout').style.opacity=0;
 if(id==='orientation'){newRun();passageStarted=true;setRoom('landing');}
 else{const normal=id==='normal'||id.startsWith('N-'),key=id.replace('N-','');loop.orientation=false;loop.unlocked=false;loop.progress=Math.min(loop.progress,3);loop.current={serial:++loop.serial,anomaly:normal?null:key,vignette:key.startsWith('C')?key:'C1',resolved:false};passageStarted=true;setRoom(key==='E3'?'landing':'corridor');}
}
function openInspection(key){
 if(loop.current.anomaly==='C1'){say('Keep your eyes on him.',2);return;}
 detail={key,view:state.view};releaseMovement();guest.visible=false;guestShadow.visible=false;const shot=key==='vignette'&&loop.current.vignette==='C3'?'children':key==='vignette'&&loop.current.vignette==='C4'?'dog':key;setView(hotel.details[shot]);$('interaction').textContent='E · Return to the passage';
}
function closeInspection(){if(!detail)return;const saved=detail.view;detail=null;guest.visible=true;guestShadow.visible=true;releaseMovement();setView(saved);}
function reviewDetail(key){
 pause();if(!key)return;detail=null;const positions={vignette:[-.25,11.8],portrait:[-.5,7.7],mirror:[-.5,15.1],coat:[-1.1,12.3],lift:[59.4,7.5],rain:[.9,12.3]};
 const targetRoom=key==='lift'?'landing':'corridor';if(room!==targetRoom)setRoom(targetRoom);
 guest.position.set(positions[key][0],.02,-positions[key][1]);setView(hotel.rooms[room].views[key==='portrait'||key==='lift'?0:1]??hotel.rooms[room].views[0]);updateShadows();openInspection(key);characterEncounters.update(state.time,0,room,loop.current);needsRender=true;
}
function floorHeight(y){return room==='stairs'?THREE.MathUtils.clamp((y-4)/3.84,0,1)*1.92:room==='corridor'?encounterArt.heightAt(guest.position.x,y):0;}
function interact(){
 if(state.mode!=='playing'||pendingRoom)return;if(detail){closeInspection();return;}if(roomCooldown>0)return;
 const y=-guest.position.z,r=hotel.rooms[room],inspection=inspectionAt(room,guest.position.x,y);
 if(inspection){openInspection(inspection.key);return;}
 if(room==='reception'&&y<4.6){goRoom('lounge');return;}
 if(y>r.exit-.9){
  if(room==='landing'&&guest.position.x<r.origin-.1){say('OUT OF ORDER. The east passage is to your right.',4);return;}
  if(room==='suite'){if(!loop.unlocked){say('The hotel has not given you the key.',3);return;}startEnding();return;}
  if(room==='lounge'){say('One drink. No name. No departure date.',4);return;}
  if(room==='corridor'){return;}
  if(room==='stairs'){if(loop.unlocked)goRoom('suite');else nextPassage('Four correct decisions. No mistakes.');return;}
  goRoom(route[route.indexOf(room)+1]);return;
 }
 if(y<r.bounds[2]+.6&&room!=='reception'){
  if(room==='landing'){say('Cross the brass line to turn back.',3);return;}
  if(room==='stairs'){say('This door has closed behind you. Continue upstairs.',3);return;}
  if(room==='suite'){goRoom('stairs',true);return;}
  goRoom(room==='lounge'?'reception':route[route.indexOf(room)-1],true);return;}
 if(room==='landing')say('OUT OF ORDER. Please use the east stair.',4);
}
function startEnding(at=0){
 if(!canEnterEnding({room,unlocked:loop.unlocked,mode:state.mode}))return;
 releaseMovement();pendingRoom=null;detail=null;state.active=false;state.resetAt=0;state.gesture=0;cross.visible=false;holyLight.intensity=0;
 ending.start(at);music.startEnding(at);state.mode='ending';$('stage').classList.add('ending');$('blackout').style.opacity=0;$('interaction').textContent='';$('caption').classList.remove('show');$('location').textContent='RECEPTION';$('end').hidden=true;$('pause').hidden=true;$('stage').focus();needsRender=true;
}
function reviewEnding(value){
 ending.stop();$('stage').classList.remove('ending');$('end').hidden=true;$('pause').hidden=true;state.mode='playing';loop.orientation=false;loop.progress=4;loop.unlocked=true;loop.current.resolved=true;setRoom('suite');guest.position.z=-6.8;roomCooldown=0;
 if(value==='suite'){pause();return;}
 const times={arrival:2.6,bones:11.2,surround:19,final:25};startEnding(times[value]??0);
}
function begin(){
 ending?.stop();$('stage').classList.remove('ending');$('progress').hidden=false;pausedMode='playing';
 audioStart();music.startHotel(audioCtx);pendingRoom=null;blockedKeys.clear();newRun();state.contacts=0;state.casts=0;setRoom('reception');state.mode='playing';$('intro').hidden=true;$('pause').hidden=true;$('end').hidden=true;$('hud').hidden=false;$('defense').style.display='flex';$('blackout').style.opacity=0;$('stage').focus();
 if(master)master.gain.setTargetAtTime(soundOn?.18:0,audioCtx.currentTime,.2);say(GREETING,5);
}
function pause(){if(!['playing','ending'].includes(state.mode))return;pausedMode=state.mode;$('pause').querySelector('.premise').innerHTML=pausedMode==='ending'?'The night will continue when you return.':'Ordinary passage: cross the far stair line.<br>Anomaly: return across the landing line.<br>Four correct choices in a row open the suite.<br>F repels the butler. Mistakes or contact reset progress.';state.mode='paused';music.pause();keys.clear();movementBasis=null;$('pause').hidden=false;$('resume').focus();if(master)master.gain.setTargetAtTime(0,audioCtx.currentTime,.2);}
function resume(){if(state.mode!=='paused')return;state.mode=pausedMode;music.resume();$('pause').hidden=true;$('stage').focus();if(master)master.gain.setTargetAtTime(soundOn?.18:0,audioCtx.currentTime,.2);}
function cast(){
 if(state.mode!=='playing'||state.cooldown>0||state.resetAt||pendingRoom)return;
 state.casts++;state.cooldown=cfg.cooldown;state.gesture=1;ring();
 if(room==='corridor'&&loop.current.anomaly==='C1'&&guest.position.distanceTo(butler.position)<=cfg.range){state.active=true;state.repel=cfg.repelTime;say('For a moment, he remembers his manners.',3);}else say('Keep it close.',1.8);
}
function animateBody(name,phase,moving){
 const actor=actors[name];if(!actor)return;
 const cycle=name==='Guest'?1.0746666667:.7133333333;
 actor.actions.Walk.time=THREE.MathUtils.euclideanModulo(actor.distance/cycle,1)*actor.actions.Walk.getClip().duration;
 actor.actions.Idle.setEffectiveWeight(1-moving);actor.actions.Walk.setEffectiveWeight(moving);
 actor.raiseWeight=THREE.MathUtils.lerp(actor.raiseWeight,name==='Guest'&&state.gesture>0?1:0,.24);actor.actions.Raise.setEffectiveWeight(actor.raiseWeight);
}
function updateShadows(){for(const [actor,s] of [[guest,guestShadow],[butler,butlerShadow]]){s.position.x=actor.position.x;s.position.z=actor.position.z+.08;s.position.y=actor.position.y+.03;}const origin=hotel.rooms[room].origin;liveLights[0].position.set(origin-1.8,2.45,guest.position.z-1);liveLights[1].position.set(origin+2.0,2.7,guest.position.z-2.5);windowShadow.position.set(origin+2.3,3.3,guest.position.z-1);windowShadow.target.position.set(origin-1,.1,guest.position.z-3);}
function update(dt){
 roomCooldown=Math.max(0,roomCooldown-dt);
 if(pendingRoom){if(state.time>=pendingRoom.at){const next=pendingRoom;pendingRoom=null;setRoom(next.name,next.fromEnd);if(next.notice)say(next.notice,6);$('blackout').style.opacity=0;}return;}
 if(state.resetAt){if(state.time>=state.resetAt){state.resetAt=0;submitDecision('contact');}return;}
 const previousY=-guest.position.z;
 encounterArt.update(state.time,room,loop.current.anomaly);characterEncounters.update(state.time,dt,room,loop.current);
 state.cooldown=Math.max(0,state.cooldown-dt);state.gesture=Math.max(0,state.gesture-dt);
 const ix=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),iy=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),moving=!detail&&(ix!==0||iy!==0);
 if(moving){
  if(!movementBasis){const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();movementBasis={forward,right:new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0))};}
  v.copy(movementBasis.forward).multiplyScalar(iy).addScaledVector(movementBasis.right,ix).normalize();v2.copy(guest.position);guest.position.addScaledVector(v,(room==='stairs'?1.1:cfg.speed)*dt);const r=hotel.rooms[room];guest.position.x=THREE.MathUtils.clamp(guest.position.x,r.origin+r.bounds[0],r.origin+r.bounds[1]);guest.position.z=THREE.MathUtils.clamp(guest.position.z,-r.bounds[3],-r.bounds[2]);const travelled=guest.position.distanceTo(v2);actors.Guest.distance+=travelled*(iy<0?-1:1);state.walk+=travelled;
  // Retreat is a cautious backwards walk. Both fixed views keep the guest's face hidden.
  guest.rotation.y=THREE.MathUtils.damp(guest.rotation.y,-ix*.45,6,dt);
 }else{movementBasis=null;guest.rotation.y=THREE.MathUtils.damp(guest.rotation.y,0,6,dt);}
 state.gait=THREE.MathUtils.damp(state.gait,moving?1:0,16,dt);
 animateBody('Guest',state.walk,state.gait);
 guest.position.y=.02+floorHeight(-guest.position.z);
 if(room==='corridor'&&loop.current.vignette==='C1'&&cueAt===null&&guest.position.z<-9.7){cueAt=state.time;ring();}
 if(room==='corridor'&&loop.current.anomaly==='C1'&&!state.active&&cueAt!==null&&state.time-cueAt>=2.5)state.active=true;
 if(room==='corridor'&&state.active){
  v.subVectors(guest.position,butler.position);v.y=0;const dist=v.length();v.normalize();
  if(state.repel>0){state.repel-=dt;butler.position.addScaledVector(v,-cfg.repelSpeed*dt);actors.Butler.distance-=cfg.repelSpeed*dt;butler.position.z=Math.max(-23,butler.position.z);}
  else if(dist>cfg.contact){butler.position.addScaledVector(v,cfg.butlerSpeed*dt);actors.Butler.distance+=cfg.butlerSpeed*dt;}
  else{state.contacts++;state.resetAt=state.time+1.1;$('blackout').style.opacity=1;tone(39,.9,.5,'sawtooth');releaseMovement();return;}
  butler.position.x=THREE.MathUtils.clamp(butler.position.x,-1.37,1.15);
  butler.position.z=THREE.MathUtils.clamp(butler.position.z,-23,-2.9);
  butler.rotation.y=Math.atan2(-v.x,-v.z);state.threatWalk+=dt*3.1;animateBody('Butler',state.threatWalk,1);
 }else animateBody('Butler',state.time*.6,0);
 if(bell){
  if(loop.current.anomaly==='C1'&&room==='corridor'){if(bell.parent!==butler)butler.add(bell);bell.position.set(.40,1.31+Math.sin(state.time*1.4)*.045,-.22);bell.rotation.set(0,0,0);}
  else{if(bell.parent!==butler)butler.add(bell);actors.Butler.hand.getWorldPosition(v2);butler.worldToLocal(v2);bell.position.copy(v2);bell.position.y-=.13;bell.rotation.set(0,0,Math.sin(state.time*2)*.08);}
 }
 cross.visible=state.gesture>0;cross.position.copy(guest.position).add(v2.set(.27,1.35,-.32));holyLight.position.copy(cross.position);holyLight.intensity=state.gesture>0?2.5:0;
 const y=-guest.position.z,r=hotel.rooms[room];let chosen=r.views[0];for(const index of r.views)if(y>=views[index].minY+(index>state.view?.25:-.25))chosen=index;if(!detail&&chosen!==state.view)setView(chosen);
 const decision=roomCooldown<=0&&passageStarted&&!loop.current.resolved?crossedThreshold(room,previousY,y):null;if(decision){submitDecision(decision);return;}
 const nearby=inspectionAt(room,guest.position.x,y);
 const hint=detail?'E · Return to the passage':nearby?`E · ${nearby.label}`:room==='landing'&&y<5.1?(loop.orientation?'First learn the ordinary passage · go forward':'CROSS THE BRASS LINE · TURN BACK'):room==='corridor'&&y>20.3?'CROSS THE BRASS LINE · CONTINUE':y>r.exit-.9?(room==='suite'?'E · Knock on the suite door':room==='lounge'?'E · Read the last order':room==='landing'&&guest.position.x<r.origin-.1?'E · Read the lift notice':'E · Open the next door'):y<r.bounds[2]+.6&&room!=='reception'?'E · Return':room==='reception'&&y<4.6?'E · Visit the night bar':room==='landing'?'E · Read the lift notice':'';
 $('interaction').textContent=hint;
 const ready=state.cooldown<=0;$('defense-label').textContent=ready?'F · Raise the crucifix':`Steady your hand · ${Math.ceil(state.cooldown)}s`;$('charge').style.transform=`scaleX(${1-state.cooldown/cfg.cooldown})`;$('defense').setAttribute('aria-label',ready?'Crucifix ready':`Crucifix recharging ${Math.ceil(state.cooldown)} seconds`);
 if(droneGain)droneGain.gain.setTargetAtTime(state.active?.06:.035,audioCtx.currentTime,.5);updateShadows();
}
function updateDiagnostics(){
 if(!guest)return;
 $('diagnostics').textContent=JSON.stringify({build:'v7',music:review?music.snapshot():undefined,ending:ending?.active?ending.snapshot():null,encounterMetrics:review?characterEncounters.metrics:undefined,vignette:review?loop.current.vignette:undefined,detail:detail?.key||null,time:+state.time.toFixed(2),seed,passage:loop.current.serial,orientation:loop.orientation,anomaly:review?loop.current.anomaly:undefined,progress:loop.progress,unlocked:loop.unlocked,resolved:loop.current.resolved,history:review?loop.history:undefined,pending:pendingRoom?.name||null,mode:state.mode,room,view:state.view,guestX:+guest.position.x.toFixed(2),guestY:+(-guest.position.z).toFixed(2),elevation:+guest.position.y.toFixed(2),butlerY:+(-butler.position.z).toFixed(2),distance:+guest.position.distanceTo(butler.position).toFixed(2),active:state.active,repel:+state.repel.toFixed(2),cooldown:+state.cooldown.toFixed(2),contacts:state.contacts,casts:state.casts,frameMs:+state.frameMs.toFixed(1),renderCpuMs:+perf.renderMs.toFixed(2),scheduler:perf.scheduler,stalls:perf.stalls,triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,walkPhase:+actors.Guest.actions.Walk.time.toFixed(3),errors});$('stage').dataset.mode=state.mode;$('stage').dataset.camera=String(state.view);
}
$('enter').addEventListener('click',begin);$('resume').addEventListener('click',resume);$('restart').addEventListener('click',begin);$('again').addEventListener('click',begin);
$('sound').addEventListener('change',e=>{soundOn=e.target.checked;music.setEnabled(soundOn);if(master)master.gain.setTargetAtTime(soundOn&&['playing','ending'].includes(state.mode)?.18:0,audioCtx.currentTime,.1);});
$('music-volume').addEventListener('input',e=>{music.setVolume(Number(e.target.value)/100);$('music-value').textContent=e.target.value+'%';});
addEventListener('keydown',e=>{
 if(e.key!=='Escape'&&e.target.closest?.('input,select,a'))return;
 const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','f','e','escape'].includes(k))e.preventDefault();
 if(k==='escape'&&!e.repeat){if(state.mode==='paused')resume();else pause();return;}if(state.mode!=='playing'||pendingRoom||blockedKeys.has(k))return;if(k==='f'&&!e.repeat)cast();if(k==='e'&&!e.repeat)interact();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))keys.add(k);
});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys.delete(k);blockedKeys.delete(k);if(!keys.size)movementBasis=null;});
addEventListener('blur',()=>pause());document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
boot().catch(fatal);
