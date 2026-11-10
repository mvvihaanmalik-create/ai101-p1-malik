import {initPlates,renderPlate,plateStatus,costumeFinish,reuseIdenticalPixels} from './visual-finish.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { installBenchmark } from './benchmark.js';
import { PassageLoop, seededRandom, crossedThreshold } from './passage-loop.js';
import { createEncounterArt } from './encounter-art.js';
import { createCharacterEncounters } from './character-encounters.js';
import {createReceptionEnding} from './reception-ending.js';
import {GREETING,canEnterEnding} from './ending-timeline.js';
import {createLocomotion,steerMotion,measureMotion,CYCLES} from './guest-locomotion.js';
import {createMusicScore} from './music-score.js';
import { CATALOGUE, inspectionAt } from './encounter-catalogue.js';
import {STAIR,REGISTER,floorName,orientationFocus,stairDecision,chooseShot} from './night-route.js';
import {createLuggageRoom} from './luggage-room.js';
let luggageRoom,claimCompleted=false,deskPorter,deskMixer,arrival=null;
const welcomeLines=[
 [2.65,GREETING],
 [5.65,'I’m sorry for the inconvenience. The lift is broken.'],
 [9.45,'For the honeymoon suite, you’ll have to take the stairs.']
];
let speaking=null;
function stopVoice(){if(speaking){speaking=null;window.speechSynthesis?.cancel();if(window.speechSynthesis?.paused)window.speechSynthesis.resume();}}
function porterLine(words,duration){
 say(words,duration);stopVoice();
 if(!soundOn||!window.speechSynthesis)return;
 const voice=window.speechSynthesis.getVoices().find(v=>v.localService&&/^en[-_]/i.test(v.lang));
 if(!voice)return;
 speaking=new SpeechSynthesisUtterance(words);speaking.voice=voice;speaking.rate=.97;speaking.volume=.76;
 const line=speaking;line.onend=line.onerror=()=>{if(speaking===line)speaking=null;};
 window.speechSynthesis.speak(line);
}
function finishArrival(){arrival=null;stopVoice();releaseMovement();say('The east wing is straight ahead.',3);}
function advanceArrival(dt){
 arrival.time+=dt;
 while(arrival.line+1<welcomeLines.length&&arrival.time>=welcomeLines[arrival.line+1][0]){
  arrival.line++;porterLine(welcomeLines[arrival.line][1],5);
 }
 if(arrival.time>=14.2)finishArrival();
}
const $=id=>document.getElementById(id);
const cfg={butlerSpeed:.62,repelSpeed:1.18,repelTime:3,cooldown:5,range:4.2,contact:.65,cutAt:11.4,returnAt:10.5};
const state={mode:'loading',time:0,view:0,active:false,repel:0,cooldown:0,gesture:0,walk:0,gait:0,threatWalk:0,captionUntil:0,contacts:0,casts:0,frameMs:0,resetAt:0};
const keys=new Set();let movementBasis=null,renderer,scene,camera,guest,butler,plates,views,guestShadow,butlerShadow,bell;
const blockedKeys=new Set();
function releaseMovement(){for(const k of keys)blockedKeys.add(k);keys.clear();movementBasis=null;if(actors.Guest){actors.Guest.locomotion.vx=0;actors.Guest.locomotion.vz=0;}}
const v=new THREE.Vector3(),v2=new THREE.Vector3(),nodes={},errors=[];
const actors={};let windowShadow,hotel,room='reception',needsRender=true,lastRender=0,lastDiagnostic=0,roomCooldown=0;
let cutUntil=0,suiteKnockAt=null,lastKnock=-1,lastEcho=-1;

const perf={renderMs:0,scheduler:'raf',stalls:0};
const route=['reception','landing','corridor','stairs','suite'];
const roomNames={reception:'RECEPTION',landing:'THE BROKEN LIFT',corridor:'THE EAST PASSAGE',stairs:'THE EAST STAIR',suite:'THE HONEYMOON SUITE',lounge:'THE NIGHT BAR'};
const liveLights=[];let pendingRoom=null,encounterArt,characterEncounters,loop,passageStarted=false,cueAt=null,detail=null;
const plateVariants={};
let ending,pausedMode='playing';
let stairKind='transfer',lastFocus=null,stairSigns=[];
function focusId(){
 if(room==='corridor'&&loop.orientation)return orientationFocus(-guest.position.z);
 if(room==='stairs'&&stairKind!=='watch')return stairKind==='lesson'?'C3':null;
 if(loop.current.shared&&room!=='landing')return room==='stairs'?'C3':'C2';
 return loop.current.vignette;
}
function currentInspection(y){return chooseShot(room,y,focusId(),inspectionAt(room,guest.position.x,y),['lesson','watch'].includes(stairKind));}
function updateCast(dt){
 const id=focusId();
 if(room==='corridor'&&loop.orientation&&!detail&&lastFocus&&id!==lastFocus)setView(state.view,true);
 lastFocus=id;const inHall=room==='corridor'&&id==='C1';
 butler.visible=inHall;butlerShadow.visible=inHall;bell.visible=inHall;
 deskPorter.visible=room==='reception';
 if(deskPorter.visible){
  deskMixer.update(dt);
  const turn=arrival?THREE.MathUtils.smoothstep(arrival.time,8.6,10.3)*(1-THREE.MathUtils.smoothstep(arrival.time,12.1,13.7)):0;
  deskPorter.rotation.y=Math.PI-.50*turn;
 }
 characterEncounters.update(state.time,dt,room,{...loop.current,vignette:id},-camera.position.z,actors.Guest.locomotion.vz>.08);
}
function stairTravel(kind,notice){stairKind=kind;goRoom('stairs',false,notice);}
function enterBranch(branch){loop.chooseRoute(branch);if(branch==='stair')stairTravel('watch','East stair. Inspect the landing before crossing the top step.');else goRoom('corridor');}
function registerText(){
 if(room==='claim')return 'Turn a case toward the mirror and compare its stamp with your ticket.';
 if(room==='landing')return REGISTER.E3;
 const id=focusId();return id&&REGISTER[id]?REGISTER[id]:'The first trip is ordinary. Take your time learning the hotel.';
}
function refreshSigns(){
 for(const {ctx,tex,level} of stairSigns){
  ctx.setTransform(2,0,0,2,0,0);const enamel=ctx.createLinearGradient(0,0,420,288);enamel.addColorStop(0,'#33302a');enamel.addColorStop(.52,'#24221e');enamel.addColorStop(1,'#191a19');ctx.fillStyle=enamel;ctx.fillRect(0,0,512,288);
  ctx.strokeStyle='#ad9466';ctx.lineWidth=4;ctx.strokeRect(9,9,494,270);ctx.lineWidth=1.5;ctx.strokeRect(16,16,480,256);
  for(const x of [25,487])for(const y of [25,263]){ctx.fillStyle='#aa9064';ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#393227';ctx.fillRect(x-2,y-.6,4,1.2);}
 
  ctx.fillStyle='#e5cea1';ctx.textAlign='center';ctx.font='bold 39px Georgia';ctx.fillText(level?(stairKind==='transfer'?'WEST STAIR':'EAST STAIR'):'NIGHT REGISTER',256,72);
  ctx.font='bold 81px Georgia';ctx.fillText(floorName(loop.progress),256,175);ctx.font='bold 32px Georgia';ctx.fillText('F L O O R',256,235);tex.needsUpdate=true;
 }
}
let seed=0;
function newRun(){claimCompleted=false;seed=crypto.getRandomValues(new Uint32Array(1))[0];loop=new PassageLoop(seededRandom(seed));passageStarted=false;cueAt=null;stairKind='transfer';lastFocus=null;}
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
function setView(index,insertCut=false){
 if((index!==state.view||insertCut)&&state.mode==='playing'&&!reducedMotion&&views[state.view]?.room===views[index]?.room){
  // Dissolve between registered fixed shots; never interpolate plate and geometry separately.
  const cover=$('camera-cut');renderPlate(renderer,scene,camera);cover.width=renderer.domElement.width;cover.height=renderer.domElement.height;cover.getContext('2d').drawImage(renderer.domElement,0,0);cover.style.opacity='1';cutUntil=state.time+.14;
 }
 state.view=index;const c=views[index];camera.position.fromArray(c.position);camera.lookAt(new THREE.Vector3().fromArray(c.target));camera.fov=c.fov;const zoom=detail?(detail.key==='luggage'?1.18:detail.key==='stair'?1.12:1.30):room==='corridor'&&loop.orientation&&['C3','C5'].includes(focusId())?1.28:framingZoom;camera.zoom=zoom;camera.updateProjectionMatrix();scene.background=plateVariants[loop.current.anomaly]?.[index]||plates[index];scene.background.repeat.setScalar(1/zoom);scene.background.offset.setScalar((1-1/zoom)/2);scene.background.updateMatrix();$('location').textContent=room==='corridor'?'WEST GALLERY':room==='stairs'&&stairKind==='transfer'?'WEST STAIR':roomNames[room];needsRender=true;
}
let capWidth=2304,slowTime=0;
function resize(){const r=$('stage').getBoundingClientRect();renderer.setPixelRatio(Math.min(devicePixelRatio,1.75,capWidth/Math.max(1,r.width)));renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=16/9;camera.updateProjectionMatrix();needsRender=true;}
function mapNodes(root){root.traverse(o=>{if(o.name){nodes[o.name]=o;o.userData.restRotation=o.rotation.clone();}if(o.isMesh){o.frustumCulled=false;if(o.material){o.material.envMapIntensity=.45;if(o.material.name==='Aged brass')o.material.color.setRGB(.36,.235,.095);}}});}
function joint(name,axis,angle){const n=nodes[name];if(n)n.rotation[axis]=n.userData.restRotation[axis]+angle;}
function prepareActor(name,gltf){
 const mixer=new THREE.AnimationMixer(gltf.scene),actions={};
 for(let clip of gltf.animations){
  if(clip.name==='Raise'){clip=clip.clone();THREE.AnimationUtils.makeClipAdditive(clip,0,gltf.animations.find(c=>c.name==='Idle'));clip.tracks=clip.tracks.filter(t=>/upperarm_r|lowerarm_r|hand_r|thumb.*_r|index.*_r|middle.*_r|ring.*_r|pinky.*_r/.test(t.name));}
  actions[clip.name]=mixer.clipAction(clip);actions[clip.name].play();actions[clip.name].setEffectiveWeight(clip.name==='Idle'?1:0);
 }
 for(const key of [...Object.keys(CYCLES),'Raise'])if(actions[key])actions[key].paused=true;
 actors[name]={mixer,actions,hand:gltf.scene.getObjectByName('hand_r'),distance:0,locomotion:createLocomotion(),raiseWeight:0};mixer.update(0);
 gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.envMapIntensity=.32;if(m.transparent){m.alphaTest=.35;m.transparent=false;m.depthWrite=true;}}}});
 // Closed mouths never expose these interior meshes in this visual study.
 // Keep them in the editable source for the eventual reception reveal.
 gltf.scene.traverse(o=>{if(o.isMesh&&/teeth|tongue/i.test(o.name))o.visible=false;});
}

async function boot(){
 renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,16/9,.05,100);
 initPlates(()=>{needsRender=true;});if((navigator.deviceMemory||8)<=4)capWidth=1600;
 document.body.dataset.build='v18';
 const response=await fetch('assets/hotel-v15.json');if(!response.ok)throw new Error('Hotel camera data is missing.');hotel=await response.json();views=hotel.cameras;
 const manager=new THREE.LoadingManager();manager.onProgress=(_,loaded,total)=>{$('load-progress').textContent=` ${Math.round(loaded/total*100)}%`;};
 const loader=new GLTFLoader(manager),tex=new THREE.TextureLoader(manager);
 const imageFiles=[...new Set([...views.map(c=>c.plate),...Object.values(hotel.variants).flatMap(v=>Object.values(v))])];
 const [g,b,o,newDepth,child,props,staff,porter,dog,porcelain,...p]=await Promise.all([loader.loadAsync('assets/guest-v8.glb'),loader.loadAsync('assets/butler-v3.glb'),loader.loadAsync('assets/occlusion.glb'),loader.loadAsync('assets/hotel-occlusion-v3.glb'),loader.loadAsync('assets/child-v5.glb'),loader.loadAsync('assets/encounter-props-v5.glb'),loader.loadAsync('assets/attendant-v5.glb'),loader.loadAsync('assets/porter-v5.glb'),loader.loadAsync('assets/dog-v14.glb'),loader.loadAsync('assets/porcelain-v15.glb'),...imageFiles.map(file=>tex.loadAsync('assets/proxies-v18/'+file))]);
 for(const [name,data] of [['guest-v8',g],['butler-v3',b],['child-v5',child],['attendant-v5',staff],['porter-v5',porter],['porcelain-v15',porcelain]])reuseIdenticalPixels(name,data);
 for(const data of [g,b,child,props,staff,porter,dog])costumeFinish(data.scene);
 p.forEach((t,i)=>t.userData.masterPlate=imageFiles[i]);
 // Apply the identical centered crop to the plate and perspective camera.
 // This keeps geometry/occlusion registered while making the shot more intimate.
 camera.zoom=framingZoom;
 const textureByFile=Object.fromEntries(imageFiles.map((file,i)=>[file,p[i]]));plates=views.map(c=>textureByFile[c.plate]);for(const [id,variants] of Object.entries(hotel.variants))plateVariants[id]=Object.fromEntries(Object.entries(variants).map(([index,file])=>[index,textureByFile[file]]));p.forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.repeat.setScalar(1/framingZoom);t.offset.setScalar((1-1/framingZoom)/2);t.updateMatrix();});
 guest=new THREE.Group();guest.add(g.scene);scene.add(guest);mapNodes(g.scene);
 butler=new THREE.Group();butler.add(b.scene);scene.add(butler);mapNodes(b.scene);
 prepareActor('Guest',g);prepareActor('Butler',b);
 o.scene.traverse(n=>{if(n.isMesh){n.material=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});n.renderOrder=-2;}});scene.add(o.scene);
 newDepth.scene.traverse(n=>{if(n.isMesh){if(/reception.?counter/i.test(n.name))n.position.y-=.065;n.material=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});n.renderOrder=-2;}});scene.add(newDepth.scene);
 scene.add(new THREE.HemisphereLight(0x758f97,0x28101b,.58));
 const key=new THREE.DirectionalLight(0xe9af80,.85);key.position.set(-3,4,2);scene.add(key);
 const rim=new THREE.DirectionalLight(0x5c9fca,.85);rim.position.set(4,3,-10);scene.add(rim);
 for(const color of [0xff732e,0x37a6a7]){const l=new THREE.PointLight(color,9,8,2);scene.add(l);liveLights.push(l);}
 guestShadow=shadow();butlerShadow=shadow();bell=nodes.ButlerBell;
 guestShadow.material.opacity=.55;butlerShadow.material.opacity=.55;
 for(const r of Object.values(hotel.rooms)){if(r===hotel.rooms.stairs)continue;const floor=new THREE.Mesh(new THREE.PlaneGeometry(6,r===hotel.rooms.corridor?25:11),new THREE.ShadowMaterial({opacity:.30,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.set(r.origin,.05,r===hotel.rooms.corridor?-12:-5);floor.receiveShadow=true;scene.add(floor);}
 windowShadow=new THREE.SpotLight(0x86b2c9,19,15,.85,.6,2);windowShadow.castShadow=true;windowShadow.shadow.mapSize.setScalar((navigator.deviceMemory||8)>4?1024:512);windowShadow.shadow.bias=-.0005;windowShadow.shadow.normalBias=.025;scene.add(windowShadow,windowShadow.target);
 // Retain the anomalous bell as an independent, levitating brass prop.
 bell=new THREE.Group();bell.name='ButlerBell';const bellMat=new THREE.MeshStandardMaterial({color:0x9e7437,metalness:.6,roughness:.3});
 const bellCup=new THREE.Mesh(new THREE.CylinderGeometry(.022,.067,.08,32),bellMat);bell.add(bellCup);
 const bellHandle=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.10,16),bellMat);bellHandle.position.y=.09;bell.add(bellHandle);butler.add(bell);bell.position.set(.40,1.27,-.22);
 const dustGeo=new THREE.BufferGeometry(),positions=[];for(let i=0;i<180;i++)positions.push((Math.random()-.5)*4,Math.random()*3.2,-Math.random()*24);dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xc4b58c,size:.009,transparent:true,opacity:.28,depthWrite:false}));scene.add(dust);
 for(const [x,y,z,level] of [[61.10,1.68,-9.67,false],[91.11,3.33,-10.68,true]]){
  const c=document.createElement('canvas');c.width=1024;c.height=576;const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const sign=new THREE.Mesh(new THREE.BoxGeometry(.72,.405,.025),new THREE.MeshBasicMaterial({map:tex,color:0xcdbb9b}));sign.position.set(x,y,z);scene.add(sign);stairSigns.push({ctx:c.getContext('2d'),tex,level});
 }
 encounterArt=await createEncounterArt(scene);characterEncounters=createCharacterEncounters(scene,{adult:g,child,props,dog,staff,porter,porcelain,persistent:true});
 luggageRoom=createLuggageRoom(porter,characterEncounters.makeCase);
 deskPorter=new THREE.Group();deskPorter.add(porter.scene);deskPorter.position.set(31.45,.02,-7.85);deskPorter.rotation.y=Math.PI;scene.add(deskPorter);
 porter.scene.traverse(part=>{if(part.isMesh&&part.material.transparent){part.material=part.material.clone();part.material.alphaTest=.35;part.material.transparent=false;part.material.depthWrite=true;}});
 deskMixer=new THREE.AnimationMixer(porter.scene);deskMixer.clipAction(porter.animations.find(a=>a.name==='Idle')).play();
 ending=await createReceptionEnding({renderer,loader,tex,models:{guest:g,butler:b,child,props,dog,staff,porter},reception:views[3],plate:plates[3],reducedMotion,onBeat:phase=>{if(phase==='greeting')ring();if(phase==='unmasking'){tone(36,4,.16,'triangle');tone(74,4,.045);}if(phase==='turn')tone(48,1,.14);if(phase==='surrounded'){tone(31,6,.19,'triangle');tone(65,6,.045);}if(phase==='held')tone(42,2,.10);}});
 $('world').addEventListener('webglcontextlost',e=>{e.preventDefault();pause();$('error-message').textContent='The graphics device paused. Reload to restore the passage.';$('error').hidden=false;});
 new ResizeObserver(resize).observe($('stage'));resize();setRoom('reception');for(const root of Object.values(characterEncounters.roots))root.visible=true;await renderer.compileAsync(scene,camera);updateCast(0);renderPlate(renderer,scene,camera);state.mode='intro';$('enter').disabled=false;$('enter').textContent='Enter the hotel';if(review)$('diagnostics').hidden=false;
 if(review)installBenchmark({renderer,scene,camera,pause,setRoom,reviewEncounter,reviewDetail,reviewEnding,holdEnding:value=>ending.hold(value),renderFrame:()=>ending.active?ending.render():room==='claim'?luggageRoom.render(renderer):renderPlate(renderer,scene,camera)});
 let last=performance.now(),lastStep=0,lastRaf=last;
 function tick(now,scheduler){
  if(now-lastRender<10||document.hidden)return;
  const elapsed=(now-last)/1000;last=now;const dt=Math.min(elapsed,.05);state.frameMs=state.frameMs*.95+elapsed*1000*.05;perf.scheduler=scheduler;
  if(state.mode==='playing'){
   if(renderer.domElement.width>1600&&elapsed<.25){slowTime=Math.max(0,slowTime+(elapsed>.037?elapsed:-elapsed*1.5));if(slowTime>4){capWidth=renderer.domElement.width>1960?1920:1600;slowTime=0;resize();}}
   state.time+=dt;update(dt);$('camera-cut').style.opacity=String(Math.max(0,(cutUntil-state.time)/.14));for(const actor of Object.values(actors))actor.mixer.update(dt);const step=Math.floor(actors.Guest.locomotion.phase*2);if(step>lastStep&&state.gait>.25)foot();lastStep=step;
   if(state.time>state.captionUntil)$('caption').classList.remove('show');if(!reducedMotion)dust.rotation.y=Math.sin(state.time*.02)*.006;
   needsRender=true;
  }
  if(state.mode==='ending'){
   state.time+=dt;ending.update(dt);const f=ending.frame;music.updateEnding(f.time);$('caption').textContent=f.caption;$('caption').classList.toggle('show',!!f.caption);needsRender=true;
   if(f.complete){state.mode='end';$('end').hidden=false;$('again').focus();if(droneGain)droneGain.gain.setTargetAtTime(.012,audioCtx.currentTime,1);}
  }
  if(needsRender){const start=performance.now();(ending?.active?ending.render():room==='claim'?luggageRoom.render(renderer):renderPlate(renderer,scene,camera));perf.renderMs=perf.renderMs*.9+(performance.now()-start)*.1;needsRender=false;}
  lastRender=now;if(now-lastDiagnostic>200){updateDiagnostics();lastDiagnostic=now;}
 }
 renderer.setAnimationLoop(now=>{lastRaf=now;tick(now,'raf');});
 // Desktop embedded previews can stall rAF even while reporting visible.
 // The watchdog only runs while visible, never advances hidden gameplay.
 setInterval(()=>{const now=performance.now();if(!document.hidden&&now-lastRaf>100){if(perf.scheduler!=='timer')perf.stalls++;tick(now,'timer');}},16);
}
function resetPositions(){
 const r=hotel.rooms[room];guest.position.set(r.origin+r.entry[0],.02,-r.entry[1]);guest.rotation.set(0,0,0);butler.position.set(room==='reception'?31.45:-.28,.02,room==='reception'?-7.85:-18.2);butler.rotation.y=Math.PI;butler.visible=room==='corridor'||room==='reception';butlerShadow.visible=room==='corridor'&&butler.visible;bell.visible=room==='corridor'&&butler.visible;if(room==='corridor'){butler.position.set(-.94,.02,-18.6);cueAt=null;}
 if(room==='landing')guest.position.set(60.35,.02,-4.5);if(room==='corridor')guest.position.z=-5.0;
 state.active=false;state.repel=0;state.cooldown=0;state.gesture=0;state.walk=0;state.gait=0;state.threatWalk=0;state.resetAt=0;
 for(const name of ['Guest','Butler']){actors[name].distance=0;actors[name].locomotion=createLocomotion();animateBody(name,0,0);}setView(r.views[0]);keys.clear();movementBasis=null;updateShadows();needsRender=true;
}
function updateProgress(){
 const label=!passageStarted?'Find the broken lift':loop.orientation?'Ground floor · ordinary visit':`${floorName(loop.progress)} FLOOR  ·  ${loop.progress} / 4`;
 $('progress-label').textContent=label;$('progress').setAttribute('aria-label',label);
 [...$('progress-marks').children].forEach((mark,i)=>mark.classList.toggle('lit',i<loop.progress));
}
function setRoom(name,fromEnd=false){
 arrival=null;stopVoice();
 ending?.stop();pausedMode='playing';$('stage').classList.remove('ending');$('end').hidden=true;
 detail=null;$('stage').classList.remove('inspecting');guest.visible=true;guestShadow.visible=true;room=name;lastKnock=-1;lastEcho=-1;suiteKnockAt=name==='suite'?state.time+2:null;if(name==='landing'&&!passageStarted)passageStarted=true;
 if(name==='claim'){
  releaseMovement();luggageRoom.start(seed);$('stage').classList.add('claim');$('location').textContent='LEFT LUGGAGE';$('interaction').textContent=luggageRoom.prompt();
  say('The porter slides you a claim ticket. The case stamps face the mirror.',6);needsRender=true;return;
 }
 luggageRoom.hide();$('stage').classList.remove('claim');lastFocus=null;resetPositions();if(fromEnd)guest.position.z=-(hotel.rooms[name].exit-.9);
 roomCooldown=.8;updateShadows();encounterArt.update(state.time,room,loop.current.anomaly);updateCast(0);updateProgress();refreshSigns();
 const line=name==='reception'?GREETING:name==='landing'?(loop.orientation?'The lift is out. Walk through the red door for an ordinary tour. Nothing on this visit can cost a floor.':'At the register: E takes the east stair. Walk through the red door for the west gallery.'):
 name==='corridor'?(loop.orientation?'Learn what belongs here. At a prompt, E takes a closer look; E again steps away.':'The gallery leads to the west stair. Check the night register in the pause menu if you need a reference.'):
 name==='stairs'?(stairKind==='lesson'?'The children play here. Look closely if you like, then climb to the register.':stairKind==='watch'?'Take your time on the stairs. Top step to continue; bottom step to turn back.':loop.unlocked?'The suite is one flight up.':'Climb to the register on the next floor.'):
 name==='suite'?'The rushes are tied from this side. Something inside knocks back.':'The last drink is still waiting.';
 say(line,7);
}
function goRoom(name,fromEnd=false,notice=''){if(pendingRoom)return;cutUntil=0;$('camera-cut').style.opacity='0';pendingRoom={name,fromEnd,notice,at:state.time+.42};releaseMovement();$('blackout').style.opacity=1;}
function nextPassage(notice){loop.next();cueAt=null;goRoom('landing',false,notice);}
function submitDecision(choice){
 const result=loop.decide(choice);if(!result)return;
 if(result.kind==='orientation-return'){releaseMovement();guest.position.z=room==='corridor'?-5.0:-4.5;say('First, learn the ordinary passage. Continue to the far stair.',5);return;}
 updateProgress();releaseMovement();
 if(result.kind==='wrong'||result.kind==='contact'){
  tone(39,.8,.25,'sawtooth');nextPassage(result.kind==='contact'?'He caught you. Back to ground: hold S past the entrance before he reaches you.':choice==='return'?'This visit was ordinary. Going back cost your floors. Start again at ground.':`You passed a change. ${CATALOGUE[result.anomaly]?.changed||''} Back to ground.`);
 }else{
  tone(165,.5,.035);
  const notice=result.kind==='orientation'?'Now you know the ordinary passage. Four correct decisions will open the suite.':result.unlocked?'Four correct decisions. The suite is waiting.':`${result.progress} of 4. Climb to the next landing.`;
  if(result.progress===2&&!claimCompleted){goRoom('claim');return;}
  if(result.kind==='orientation')stairTravel('lesson','Ordinary tour. Visit the children on the upper landing, then climb to begin.');
  else if(room==='stairs'&&choice==='continue'){if(result.unlocked)goRoom('suite',false,notice);else nextPassage(notice);}
  else stairTravel('transfer',notice);
 }
}
function reviewEncounter(id){
 // A visible review-only fixture; never changes retail randomization or speed.
 pause();pendingRoom=null;$('blackout').style.opacity=0;
 if(id==='orientation'){newRun();passageStarted=true;setRoom('landing');}
 else{const normal=id==='normal'||id.startsWith('N-'),key=id.replace('N-',''),branch=STAIR.includes(key)?'stair':'hall';loop.orientation=false;loop.unlocked=false;loop.progress=Math.min(loop.progress,3);loop.current={serial:++loop.serial,anomaly:normal?null:key,vignette:key,changed:!normal,shared:key==='E3',route:key==='E3'?null:branch,resolved:false};passageStarted=true;stairKind='watch';setRoom(key==='E3'?'landing':branch==='stair'?'stairs':'corridor');}
}
function openInspection(key){
 if(state.active){say('He is too close. Keep moving.',2);return;}
 detail={key,view:state.view};$('stage').classList.add('inspecting');releaseMovement();guest.visible=false;guestShadow.visible=false;const shot=key;if(hotel.details[shot]===undefined)throw Error('Missing inspection: '+key);setView(hotel.details[shot]);$('interaction').textContent='E · Return to the passage';
}
function closeInspection(){if(!detail)return;const saved=detail.view;detail=null;$('stage').classList.remove('inspecting');guest.visible=true;guestShadow.visible=true;releaseMovement();setView(saved);}
function reviewDetail(key){
 pause();if(!key)return;const match={service:'C2',children:'C3',dog:'C4',bar:'C5',luggage:'C6',portrait:'E1',mirror:'E4',coat:'E5',lift:'E3',rain:'E2',runner:'E6',bell:'C1'}[key];if(!match)return;
 if(loop.current.vignette!==match)reviewEncounter('N-'+match);
 const stair=room==='stairs';const pos={service:[.1,6.9],children:[.1,10.5],dog:[.1,14],bar:[.1,17.6],luggage:[.1,20],portrait:[-.7,7.7],mirror:[-.7,15.1],coat:[-1.1,12.3],lift:[59.4,7.5],rain:[.9,12.3],bell:[-.3,12],runner:[-.3,12]}[key];
 detail=null;guest.position.set(stair?89.75:pos[0],stair?1.28:.02,-(stair?6.5:pos[1]));updateShadows();openInspection(stair?'stair':key);updateCast(0);needsRender=true;
}
function floorHeight(y){return room==='stairs'?THREE.MathUtils.clamp((y-4)/3.84,0,1)*1.92:room==='corridor'?encounterArt.heightAt(guest.position.x,y):0;}
function interact(){
 if(state.mode!=='playing'||pendingRoom)return;if(detail){closeInspection();return;}if(roomCooldown>0)return;
 const y=-guest.position.z,r=hotel.rooms[room],inspection=currentInspection(y);
 if(room==='landing'&&!loop.orientation&&y>=3.75&&y<=6.25){enterBranch('stair');return;}
 if(room==='landing'&&y>7.6&&guest.position.x>=59.9){enterBranch('hall');return;}
 if(inspection){openInspection(inspection.key);return;}
 if(room==='reception'&&y<4.6){goRoom('lounge');return;}
 if(y>r.exit-.9){
  if(room==='landing'&&guest.position.x<r.origin-.1){say('OUT OF ORDER. The east passage is to your right.',4);return;}
  if(room==='suite'){if(!loop.unlocked){say('The hotel has not given you the key.',3);return;}startEnding();return;}
  if(room==='lounge'){say('One drink. No name. No departure date.',4);return;}
  if(room==='corridor')return;
  if(room==='stairs')return;
  goRoom(route[route.indexOf(room)+1]);return;
 }
 if(y<r.bounds[2]+.6&&room!=='reception'){
  if(room==='landing'){say('Cross the brass line to turn back.',3);return;}
  if(room==='stairs'){say('This door has closed behind you. Continue upstairs.',3);return;}
  if(room==='suite'){stairKind='transfer';goRoom('stairs',true);return;}
  goRoom(room==='lounge'?'reception':route[route.indexOf(room)-1],true);return;}
 if(room==='landing')say('OUT OF ORDER. Please use the east stair.',4);
}
function startEnding(at=0){
 if(!canEnterEnding({room,unlocked:loop.unlocked,mode:state.mode}))return;
 releaseMovement();pendingRoom=null;detail=null;state.active=false;state.resetAt=0;state.gesture=0;
 cutUntil=0;$('camera-cut').style.opacity='0';ending.start(at);music.startEnding(at);state.mode='ending';$('stage').classList.add('ending');$('blackout').style.opacity=0;$('interaction').textContent='';$('caption').classList.remove('show');$('location').textContent='RECEPTION';$('end').hidden=true;$('pause').hidden=true;$('stage').focus();needsRender=true;
}
function reviewEnding(value){
 ending.stop();$('stage').classList.remove('ending');$('end').hidden=true;$('pause').hidden=true;state.mode='playing';loop.orientation=false;loop.progress=4;loop.unlocked=true;loop.current.resolved=true;setRoom('suite');guest.position.z=-6.8;roomCooldown=0;
 if(value==='suite'){pause();return;}
 const times={arrival:2.6,bones:11.2,surround:19,final:25};startEnding(times[value]??0);
}
function begin(){
 ending?.stop();$('stage').classList.remove('ending');$('progress').hidden=false;pausedMode='playing';
 audioStart();music.startHotel(audioCtx);pendingRoom=null;blockedKeys.clear();newRun();state.contacts=0;state.casts=0;setRoom('reception');state.mode='playing';$('intro').hidden=true;$('pause').hidden=true;$('end').hidden=true;$('hud').hidden=false;$('blackout').style.opacity=0;$('stage').focus();
 if(master)master.gain.setTargetAtTime(soundOn?.18:0,audioCtx.currentTime,.2);
 $('caption').classList.remove('show');arrival={time:0,line:-1};
}
function pause(){if(!['playing','ending'].includes(state.mode))return;if(speaking)window.speechSynthesis?.pause();pausedMode=state.mode;$('pause').querySelector('.premise').innerHTML=pausedMode==='ending'?'The night will continue when you return.':'Ordinary: walk past the far end. Changed: hold S past your entrance. Four in a row open the suite. A mistake or contact sends you back to ground.';if(room==='claim')$('pause').querySelector('.premise').textContent='Match the stamp on your ticket to the one in the mirror.';$('register-note').hidden=pausedMode==='ending';$('register-note').textContent='Night register: '+registerText();state.mode='paused';music.pause();if(actors.Guest){actors.Guest.locomotion.vx=0;actors.Guest.locomotion.vz=0;}keys.clear();movementBasis=null;$('pause').hidden=false;$('resume').focus();if(master)master.gain.setTargetAtTime(0,audioCtx.currentTime,.2);}
function resume(){if(state.mode!=='paused')return;state.mode=pausedMode;music.resume();if(speaking)window.speechSynthesis?.resume();$('pause').hidden=true;$('stage').focus();if(master)master.gain.setTargetAtTime(soundOn?.18:0,audioCtx.currentTime,.2);}
function animateBody(name,phase,moving){
 const actor=actors[name];if(!actor)return;
 if(name==='Guest'){
  const m=actor.locomotion;
  for(const key of Object.keys(CYCLES)){const action=actor.actions[key];action.time=(m.phase%1)*action.getClip().duration;action.setEffectiveWeight(moving*m.weights[key]);}
  actor.actions.Idle.setEffectiveWeight(1-moving);
 }else{
  actor.actions.Walk.time=THREE.MathUtils.euclideanModulo(actor.distance/.7133333333,1)*actor.actions.Walk.getClip().duration;
  actor.actions.Idle.setEffectiveWeight(1-moving);actor.actions.Walk.setEffectiveWeight(moving);
 }
 actor.raiseWeight=THREE.MathUtils.lerp(actor.raiseWeight,name==='Guest'&&state.gesture>0?1:0,.24);actor.actions.Raise.setEffectiveWeight(actor.raiseWeight);
}
function updateShadows(){for(const [actor,s] of [[guest,guestShadow],[butler,butlerShadow]]){s.position.x=actor.position.x;s.position.z=actor.position.z+.08;s.position.y=actor.position.y+.03;}const origin=hotel.rooms[room].origin;liveLights[0].position.set(origin-1.8,2.45,guest.position.z-1);liveLights[1].position.set(origin+2.0,2.7,guest.position.z-2.5);if(room==='reception'||room==='lounge'){liveLights[1].position.set(room==='reception'?32.2:152.4,1.86,room==='reception'?-6.85:-7.2);}windowShadow.position.set(origin+2.3,3.3,guest.position.z-1);windowShadow.target.position.set(origin-1,.1,guest.position.z-3);}
function update(dt){
 roomCooldown=Math.max(0,roomCooldown-dt);
 if(room==='suite'&&suiteKnockAt!==null&&state.time>=suiteKnockAt){tone(62,.14,.13,'triangle');tone(126,.08,.025);suiteKnockAt=null;}
 if(pendingRoom){if(state.time>=pendingRoom.at){const next=pendingRoom;pendingRoom=null;setRoom(next.name,next.fromEnd);if(next.notice)say(next.notice,6);$('blackout').style.opacity=0;}return;}
 if(room==='claim'){luggageRoom.step(dt);$('interaction').textContent=luggageRoom.prompt();return;}
 if(state.resetAt){if(state.time>=state.resetAt){state.resetAt=0;submitDecision('contact');}return;}
 const previousY=-guest.position.z;
 music.updateHotel(state.time,room);
 if(room==='corridor'&&loop.current.anomaly==='C2'&&previousY<11){const phase=state.time%4.8,beat=Math.floor(state.time/4.8)*3+(phase>=.49?2:phase>=.24?1:0);if(beat!==lastKnock&&phase<.65){lastKnock=beat;tone(155,.09,.18,'triangle');tone(83,.16,.10);}}
 if(room==='stairs'&&stairKind==='watch'&&loop.current.anomaly==='C3'&&previousY>4&&actors.Guest.locomotion.vz>.08){const beat=Math.floor(state.time*2.1);if(beat!==lastEcho){lastEcho=beat;tone(125,.08,.055,'triangle');}}

 encounterArt.update(state.time,room,loop.current.anomaly);updateCast(dt);
 state.cooldown=Math.max(0,state.cooldown-dt);state.gesture=Math.max(0,state.gesture-dt);
 if(arrival)advanceArrival(dt);
 const ix=arrival?(arrival.time<2.70?.20:0):(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 const iy=arrival?(arrival.time<2.70?1:0):(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
 const moving=!detail&&(ix!==0||iy!==0);
 if(moving){
  if(!movementBasis)movementBasis={forward:new THREE.Vector3(0,0,-1),right:new THREE.Vector3(1,0,0)};
  v.copy(movementBasis.forward).multiplyScalar(iy).addScaledVector(movementBasis.right,ix).normalize();
 }else{movementBasis=null;v.set(0,0,0);}
 const motion=actors.Guest.locomotion,delta=steerMotion(motion,v.x,v.z,dt,room==='stairs'?.8:1),r=hotel.rooms[room];
 v2.copy(guest.position);
 guest.position.x=THREE.MathUtils.clamp(guest.position.x+delta.x,r.origin+r.bounds[0],r.origin+r.bounds[1]);
 guest.position.z=THREE.MathUtils.clamp(guest.position.z+delta.z,-r.bounds[3],-r.bounds[2]);
 const dx=guest.position.x-v2.x,dz=guest.position.z-v2.z;
 if(Math.abs(dx)<1e-8)motion.vx=0;if(Math.abs(dz)<1e-8)motion.vz=0;
 measureMotion(motion,dx,dz,dt);state.walk+=Math.hypot(dx,dz);state.gait=motion.gait;
 // Authored directional steps keep the concealed face and planted feet aligned.
 guest.rotation.y=arrival?-.46*THREE.MathUtils.smoothstep(arrival.time,1.9,3.1)*(1-THREE.MathUtils.smoothstep(arrival.time,12.9,14.2)):0;
 animateBody('Guest',state.walk,state.gait);
 guest.position.y=.02+floorHeight(-guest.position.z);
 if(room==='corridor'&&focusId()==='C1'&&cueAt===null&&guest.position.z<-14.5){cueAt=state.time;ring();if(loop.current.anomaly==='C1')say('The bell is out of his hand. Hold S and cross the line you came in by.',7);}
 if(room==='corridor'&&loop.current.anomaly==='C1'&&!state.active&&cueAt!==null){
  // The warning delays pursuit, but walking into his stationary body still counts as contact.
  const separation=Math.hypot(guest.position.x-butler.position.x,guest.position.z-butler.position.z);
  state.active=state.time-cueAt>=5.5||separation<=cfg.contact;
 }
 if(room==='corridor'&&state.active){
  v.subVectors(guest.position,butler.position);v.y=0;const dist=v.length();v.normalize();
  if(dist>cfg.contact){butler.position.addScaledVector(v,cfg.butlerSpeed*dt);actors.Butler.distance+=cfg.butlerSpeed*dt;}
  else{state.contacts++;state.resetAt=state.time+1.1;$('blackout').style.opacity=1;tone(39,.9,.5,'sawtooth');releaseMovement();return;}
  butler.position.x=THREE.MathUtils.clamp(butler.position.x,-1.37,1.15);
  butler.position.z=THREE.MathUtils.clamp(butler.position.z,-23,-2.9);
  butler.rotation.y=Math.atan2(-v.x,-v.z);state.threatWalk+=dt*3.1;animateBody('Butler',state.threatWalk,1);
 }else animateBody('Butler',state.time*.6,0);
 if(bell){
  if(loop.current.anomaly==='C1'&&room==='corridor'){if(bell.parent!==butler)butler.add(bell);bell.position.set(.40,1.31+Math.sin(state.time*1.4)*.045,-.22);bell.rotation.set(0,0,0);}
  else{if(bell.parent!==butler)butler.add(bell);actors.Butler.hand.getWorldPosition(v2);butler.worldToLocal(v2);bell.position.copy(v2);bell.position.y-=.13;bell.rotation.set(0,0,Math.sin(state.time*2)*.08);}
 }
 const y=-guest.position.z;let chosen=r.views[0];for(const index of r.views)if(y>=views[index].minY+(index>state.view?.25:-.25))chosen=index;if(!detail&&chosen!==state.view)setView(chosen);
 const decision=roomCooldown<=0&&passageStarted&&!loop.current.resolved?(room==='stairs'&&stairKind==='watch'?stairDecision(previousY,y):crossedThreshold(room,previousY,y)):null;if(decision&&!detail){submitDecision(decision);return;}
 if(!detail&&roomCooldown<=0&&room==='landing'&&y>8.1&&guest.position.x>=59.9){enterBranch('hall');return;}
 if(!detail&&roomCooldown<=0&&room==='stairs'&&stairKind!=='watch'&&y>9.35){if(loop.unlocked)goRoom('suite');else nextPassage(stairKind==='lesson'?'Your scored visits begin here. Check the lift, then choose a route.':'Check the lift. E takes the east stair; walk to the red door for the west gallery.');return;}
 const nearby=currentInspection(y);
 const hint=detail?'E: Step away when ready':nearby?`E: ${nearby.label}`:
  room==='landing'&&!loop.orientation&&y>=3.75&&y<=6.25?'E: Take east stair   /   W: Walk to west gallery':
  room==='landing'&&y<3.9?(loop.orientation?'First learn the ordinary passage':'CROSS THE BRASS LINE: TURN BACK'):
  room==='corridor'&&y<5.8?(loop.orientation?'REMEMBER THIS FLOOR, THEN CONTINUE':'WALK BACK THROUGH THE ENTRANCE'):
  room==='corridor'&&y>20.3?'CROSS THE BRASS LINE: CONTINUE':
  room==='landing'&&y>7.6&&guest.position.x>=59.9?'WALK THROUGH THE RED DOOR':
  room==='stairs'?(stairKind==='watch'?(y>8.15?'Top step: continue':'Bottom step: turn back   /   Top step: continue'):'Continue upstairs'):
  y>r.exit-.9?(room==='suite'?'E: Knock on the suite door':room==='lounge'?'E: Read the last order':'E: Open the next door'):
  y<r.bounds[2]+.6&&['suite','lounge'].includes(room)?'E: Return':
  room==='reception'&&y<4.6?'E: Visit the night bar':'';
 $('interaction').textContent=arrival?'E   Skip greeting':hint;
 if(droneGain)droneGain.gain.setTargetAtTime(state.active?.045:.008,audioCtx.currentTime,.5);updateShadows();
}
function updateDiagnostics(){
 if(!guest)return;
 $('diagnostics').textContent=JSON.stringify({build:'v18',visual:review?{...plateStatus(),bufferWidth:renderer.domElement.width}:undefined,arrival:arrival?{...arrival}:null,claim:room==='claim'?luggageRoom.snapshot():undefined,branch:loop.current.route,stairKind,focus:focusId(),butlerVisible:butler.visible,music:review?music.snapshot():undefined,ending:ending?.active?ending.snapshot():null,encounterMetrics:review?characterEncounters.metrics:undefined,visibleCast:review?Object.entries(characterEncounters.roots).filter(([id,g])=>g.visible).map(([id])=>id):undefined,vignette:review?loop.current.vignette:undefined,detail:detail?.key||null,time:+state.time.toFixed(2),seed,passage:loop.current.serial,orientation:loop.orientation,anomaly:review?loop.current.anomaly:undefined,progress:loop.progress,unlocked:loop.unlocked,resolved:loop.current.resolved,history:review?loop.history:undefined,pending:pendingRoom?.name||null,mode:state.mode,room,view:state.view,guestX:+guest.position.x.toFixed(2),guestY:+(-guest.position.z).toFixed(2),elevation:+guest.position.y.toFixed(2),butlerY:+(-butler.position.z).toFixed(2),distance:+guest.position.distanceTo(butler.position).toFixed(2),active:state.active,repel:+state.repel.toFixed(2),cooldown:+state.cooldown.toFixed(2),contacts:state.contacts,casts:state.casts,frameMs:+state.frameMs.toFixed(1),renderCpuMs:+perf.renderMs.toFixed(2),scheduler:perf.scheduler,stalls:perf.stalls,triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,locomotion:review?actors.Guest.locomotion:undefined,walkPhase:+actors.Guest.actions.Walk.time.toFixed(3),errors});$('stage').dataset.mode=state.mode;$('stage').dataset.camera=String(state.view);
}
$('enter').addEventListener('click',begin);$('resume').addEventListener('click',resume);$('restart').addEventListener('click',begin);$('again').addEventListener('click',begin);
$('sound').addEventListener('change',e=>{soundOn=e.target.checked;if(!soundOn)stopVoice();music.setEnabled(soundOn);if(master)master.gain.setTargetAtTime(soundOn&&['playing','ending'].includes(state.mode)?.18:0,audioCtx.currentTime,.1);});
$('music-volume').addEventListener('input',e=>{music.setVolume(Number(e.target.value)/100);$('music-value').textContent=e.target.value+'%';});
addEventListener('keydown',e=>{
 if(e.key!=='Escape'&&e.target.closest?.('input,select,a'))return;
 const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','f','e','escape'].includes(k))e.preventDefault();
 if(k==='escape'&&!e.repeat){if(state.mode==='paused')resume();else pause();return;}if(state.mode!=='playing'||pendingRoom||blockedKeys.has(k))return;if(room==='claim'){
  if(e.repeat)return;
  const outcome=luggageRoom.input(k);
  if(outcome==='turn'||outcome==='select')$('caption').classList.remove('show');
  if(outcome==='wrong'){tone(104,.18,.08);say('The porter pushes the case back. Try another stamp.',3);}
  if(outcome==='match'){tone(200,.13,.035);porterLine('The honeymoon suite? I carried this case up yesterday.',4.8);}
  if(outcome==='exit'){claimCompleted=true;stairTravel('transfer','The staff stair leads to the second-floor register.');}
  return;
 }
 if(arrival){if(k==='e'&&!e.repeat)finishArrival();return;}
 if(k==='e'&&!e.repeat)interact();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))keys.add(k);
});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys.delete(k);blockedKeys.delete(k);if(!keys.size)movementBasis=null;});
addEventListener('blur',()=>pause());document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
boot().catch(fatal);

