import * as THREE from 'three';
import { painterly } from './painterly.js';
import { createPaintRenderer } from './paint-renderer.js';
import { approvedCount, levelFor } from './progress.js';
import { createSpiritCat, animateSpiritCat } from './spirit-cat.js';
import { createWorkshop } from './workshop.js';
import { artifactKind, ARTIFACTS } from './artifact-kind.js';
import { makeArtifactModels } from './artifact-models.js';
import { parseOrganization, nextTableFocus, tableSlot } from './organization.js';
import { createCollectionUI } from './collection-ui.js';
import { createRenderMonitor } from './render-monitor.js';
import { renderDensity, shouldRunRoom, createFrameBudget, frameDue } from './render-policy.js';
const renderMonitor=createRenderMonitor();
const frameBudget=createFrameBudget();

let IDS = ['idea-quest', 'obsidian-gaze', 'image-palette'];
let vaultState=null, collectionUI=null, firstRegistry=true;
const STEPS = ['Define the goal', 'Choose a route', 'Build a small prototype', 'Human check', 'Iterate or stop'];
const COLORS = { 'idea-quest': '#c68af1', 'obsidian-gaze': '#42e2cb', 'image-palette': '#ffbd65' };
const LABELS = { 'idea-quest': 'IdeaQuest Final', 'obsidian-gaze': 'Gaze', 'image-palette': 'Image Palette' };
const DEMO = new URLSearchParams(window.location.search).get('demo') === '1';
const HOSTED = document.body.dataset.mode === 'hosted';
function connectionLabel(){return HOSTED?`Shared collection · ${records.size} projects`:DEMO?'Demo · simulated levels':`Vault connected · ${records.size} projects`;}
const $ = (id) => document.getElementById(id);
let focusId='idea-quest';
try {const saved=localStorage.getItem('ideaQuest.focus');if(saved)focusId=saved;} catch {}
const ORGANIZATION_KEY='ideaQuest.organization.v1'+(DEMO?'.demo':'');
let storedOrganization=null;try{storedOrganization=localStorage.getItem(ORGANIZATION_KEY);}catch{}
let organization=parseOrganization(storedOrganization,IDS);
let collection='table',undoAction=null;
const PLACE_LABELS={table:'Worktable',shelf:'Wall shelf',retired:'Retired'};
function collectionIds(place){return IDS.filter(id=>organization[id]===place);}
function saveOrganization(){try{localStorage.setItem(ORGANIZATION_KEY,JSON.stringify(organization));if(focusId)localStorage.setItem('ideaQuest.focus',focusId);return true;}catch{return false;}}
const QUESTS={
  'idea-quest': {action:'Review the workshop design',hint:'Try the room and cat, then decide what to keep or change.'},
  'obsidian-gaze': {action:'Review the film-frame UI',hint:'Open Gaze in your vault. Keep, adjust, or reject the design.'},
  'image-palette': {action:'Test the accent-color override',hint:'The original quest is complete. Check the new accent feature before accepting it.'}
};
function questFor(project){
  const done=approvedCount(project),revisit=project.phase==='revisiting';
  const knownNote={'idea-quest':/3D potion-room|workshop design/i,'obsidian-gaze':/film-frame UI/i,'image-palette':/manual accent override/i}[project.id];
  const summary=knownNote?.test(project.nextMove||'')?QUESTS[project.id]:null;
  return {...(summary||{action:project.nextMove?.split('. ')[0]||'Choose your next step',hint:project.pitch}),status:revisit?'Revisiting':project.phase==='complete'?'Released':project.phase==='resting'?'Resting':project.phase==='idea'?'New idea':project.phase==='review'||/\b(review|test|check)\b/i.test(project.nextMove||'')?'Ready for your review':'Building',done};
}
function renderFocus(){
  focusId=nextTableFocus(organization,focusId,IDS);
  const p=records.get(focusId);
  if(p){const q=questFor(p);$('focusTitle').textContent=p.title;$('focusNext').textContent=q.action;$('focusOpen').textContent=HOSTED?'View project →':'Resume project →';}
  else{$('focusTitle').textContent='A clear worktable';$('focusNext').textContent='Bring an artifact back when you’re ready.';$('focusOpen').textContent=collectionIds('shelf').length?'Browse the shelf →':'Browse retired artifacts →';}
  $('questTotal').textContent=`${collectionIds('table').length} on the table · ${collectionIds('shelf').length} on the shelf`;
}
function renderCollections(){
  for(const place of ['table','shelf','retired']){const button=$(place+'Tab');button.textContent=`${PLACE_LABELS[place]} (${collectionIds(place).length})`;button.setAttribute('aria-pressed',String(collection===place));}
  $('collectionHint').textContent={table:'Tap an artifact or its name to open. Drag to the shelf to put it aside.',shelf:'Tap a shelf artifact to open. Drag it back to the table to continue.',retired:'Choose a retired project to view or restore it.'}[collection];
}
function showCollection(place){collection=place;hoveredId=null;renderDock();renderCollections();}
function jarRestPose(jar){
  const place=organization[jar.id];
  if(place==='shelf')return {position:workshop.shelfSlot(Math.max(0,collectionIds('shelf').indexOf(jar.id)%3)),scale:mobileLayout?.37:.38};
  const active=collectionIds('table');
  return {position:new THREE.Vector3(tableSlot(Math.max(0,active.indexOf(jar.id)),active.length,mobileLayout),1,mobileLayout?1.15:.4),scale:mobileLayout?.86:1};
}
function movePotion(id,to,isUndo=false){
  if(!IDS.includes(id)||!['table','shelf','retired'].includes(to)||organization[id]===to)return;
  if(to==='table'&&collectionIds('table').length>=3){say('Three ideas on the table is plenty. Shelve one first, then bring this one back.');showError('The worktable holds three projects. Move one to the shelf to make room.');return;}
  const from=organization[id],previousFocus=focusId;
  organization[id]=to;focusId=nextTableFocus(organization,focusId,IDS);
  const saved=saveOrganization(),jar=jars.get(id);
  if(jar){
    if(from==='retired'){const pose=jarRestPose(jar);jar.group.position.copy(pose.position);jar.group.position.y+=.7;jar.group.scale.setScalar(.02);}
    jar.group.visible=true;
    jar.flight={from:jar.group.position.clone(),fromScale:jar.group.scale.x,start:performance.now(),duration:to==='retired'?1450:1650,to};
  }
  selectedId=null;reveal=null;clearTimeout(revealTimer);hoveredId=null;$('artifactReveal').hidden=true;$('details').hidden=true;$('room').classList.remove('selected','revealing');setRoomModal(false);
  syncSceneArtifacts();renderDock();renderCollections();renderFocus();
  if(!isUndo){undoAction={id,from,to,previousFocus};$('undoMove').hidden=false;}
  $('moveMessage').textContent=(isUndo?'Restored ':to==='shelf'?'Shelved ':to==='retired'?'Retired ':'Returned to the table: ')+(LABELS[id]||id)+(saved?'.':'. Saved for this visit only.');
  $('moveToast').hidden=false;
  say(to==='shelf'?'Resting, not forgotten. I’ll keep this one safe.':to==='retired'?'A little more room for your next idea.':'Welcome back, little idea.');
  lastInteraction=performance.now();catMood=to==='retired'?'pet':'hello';greetingUntil=lastInteraction+3000;
  $(collection+'Tab').focus();chime();if(renderer)animate();
}
function undoMove(){if(!undoAction)return;const action=undoAction;undoAction=null;movePotion(action.id,action.from,true);focusId=nextTableFocus(organization,action.previousFocus,IDS);saveOrganization();renderFocus();renderDock();$('undoMove').hidden=true;}


const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let records = new Map();
let primaryProjectId='idea-quest';
let reveal=null,revealTimer=null,ribbonDrag=null,ribbonDragged=false;
let selectedId = null;
let scene, camera, renderer, cat, workshop, raycaster, paintRenderer;
let sceneReady=false,renderReady=false,roomInView=true,loopRunning=false,roomPaused=false,contextLost=false;
let lightRendering=!!navigator.connection?.saveData,lastDraw=0,lastHover=0;
try{roomPaused=localStorage.getItem('ideaQuest.roomMotion')==='paused';}catch{}
let catHovered=false, catMood="idle", lastInteraction=0, helloCount=0;
const jars = new Map();
const pickMeshes = [];
let lastFocusedId = null;
let lastRegistryText = null;
let hoveredId = null;
let greetingUntil = 0;
let lastFrame = 0;
let pointerDown = null;
let potionDrag = null;
let dropHint;
let roomView=false,focusEnds=0,cozyUntil=0,watchedPotion=null,watchUntil=0;
const cameraAim=new THREE.Vector3(0,1.8,0);
let soundEnabled = false;
let audioContext;
let lastDialogue = '';
let sceneFailure = null;
const pointerLook = new THREE.Vector2();
const cameraHome = new THREE.Vector3();
let mobileLayout = false;
const catPickMeshes = [];
const jarSymbols = { 'idea-quest': '✧', 'obsidian-gaze': '◉', 'image-palette': '✿' };

function showError(message) { $('error').textContent = message; $('error').hidden = false; }
function clearError() { $('error').hidden = true; }

function mat(color, options = {}) { return painterly(new THREE.MeshStandardMaterial({ color, roughness:1, ...options }),1.4,.65); }
function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(x, y, z);
  parent.add(item);
  return item;
}
function ball(parent, material, x, y, z, sx, sy = sx, sz = sx) {
  const item = mesh(new THREE.SphereGeometry(1, 24, 16), material, parent, x, y, z);
  item.scale.set(sx, sy, sz);
  return item;
}
function block(parent, material, x, y, z, sx, sy, sz) {
  return mesh(new THREE.BoxGeometry(sx, sy, sz), material, parent, x, y, z);
}
function stroke(parent, material, points, radius = .025) {
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))), 24, radius, 6, false), material, parent);
}
function buildCat() {
  cat = createSpiritCat();
  cat.position.set(-3.1, .92, .35);
  scene.add(cat);
  return cat;
}

const bottleProfile = [
  [0, .06], [.30, .06], [.52, .18], [.62, .35], [.64, .61], [.64, 1.22],
  [.57, 1.40], [.39, 1.58], [.29, 1.68], [.29, 1.94], [.34, 1.94]
];
const smoothBottle = new THREE.SplineCurve(bottleProfile.slice(1).map(([r,y])=>new THREE.Vector2(r,y))).getPoints(64);
function radiusAt(y) {
  for (let i = 1; i < bottleProfile.length; i++) {
    const [r1, y1] = bottleProfile[i];
    const [r0, y0] = bottleProfile[i - 1];
    if (y <= y1) return r0 + (r1 - r0) * ((y - y0) / Math.max(.0001, y1 - y0));
  }
  return bottleProfile[bottleProfile.length-1][0];
}
function liquidGeometry(level) {
  if (level <= 0) return null;
  const top = .08 + 1.49 * level;
  const profile = [new THREE.Vector2(0, .075)];
  for (const {x:r, y} of smoothBottle) {
    if (y > .075 && y < top) profile.push(new THREE.Vector2(r * .89, y));
  }
  profile.push(new THREE.Vector2(radiusAt(top) * .89, top));
  profile.push(new THREE.Vector2(0, top));
  return { geometry: new THREE.LatheGeometry(profile, 64), top, radius: radiusAt(top) * .89 };
}
function updateLiquid(jar, level) {
  if (jar.potionGlow) jar.potionGlow.intensity = level > 0 ? .45 + level * .6 : 0;
  if (jar.liquid) {
    jar.liquid.parent?.remove(jar.liquid);
    jar.liquid.traverse((node) => { if (node.isMesh) {node.geometry.dispose();node.material.dispose();} });
    jar.liquid = null;
  }
  const shape = liquidGeometry(level);
  if (!shape) return;
  const liquid = new THREE.Group();
  const color = COLORS[jar.id];
  const liquidMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .14, roughness: .95, metalness: 0 });
  const ripple={time:{value:0},top:{value:shape.top},strength:{value:0}};
  const rippleShader=(shader)=>{
    shader.uniforms.potionTime=ripple.time;shader.uniforms.potionTop=ripple.top;shader.uniforms.potionStrength=ripple.strength;
    shader.vertexShader='uniform float potionTime; uniform float potionTop; uniform float potionStrength;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y += smoothstep(potionTop * .6, potionTop, position.y) * (sin(position.x * 7.0 + potionTime * 1.6) * .012 + cos(position.z * 6.0 + potionTime * 1.3) * .009) * potionStrength;');
  };
  liquidMat.onBeforeCompile=rippleShader;painterly(liquidMat,1.1,.5);
  mesh(shape.geometry, liquidMat, liquid);
  const surfaceGeometry=new THREE.CircleGeometry(shape.radius,64);surfaceGeometry.rotateX(-Math.PI/2);surfaceGeometry.translate(0,shape.top+.006,0);
  const surfaceMat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.18,roughness:.95,side:THREE.DoubleSide});surfaceMat.onBeforeCompile=rippleShader;painterly(surfaceMat,1.1,.5);
  mesh(surfaceGeometry,surfaceMat,liquid);
  const bubbles=[];
  for (let i = 0; i < Math.max(2, Math.floor(level * 8)); i++) {
    const angle = i * 2.39996;
    const radius = .11 + (i % 3) * .11;
    const y = .2 + (shape.top - .3) * ((i + .5) / Math.max(2, Math.floor(level * 8)));
    if (y < shape.top - .05) {const bubble=ball(liquid,new THREE.MeshBasicMaterial({color:'#fff4d2',transparent:true,opacity:.33}),Math.cos(angle)*radius,y,Math.sin(angle)*radius,.025+(i%2)*.012);bubble.userData.phase=i*.51;bubbles.push(bubble);}
  }
  liquid.renderOrder = 1;
  liquid.userData.top = shape.top;
  liquid.userData.ripple=ripple;
  liquid.userData.bubbles=bubbles;
  jar.bottle.add(liquid);
  jar.liquid = liquid;
}
function buildJar(id, x) {
  const group = new THREE.Group();
  group.position.set(x, .93, .42);
  scene.add(group);
  const color = COLORS[id];
  const profile = [new THREE.Vector2(0,.06),...smoothBottle];
  const glass = mesh(new THREE.LatheGeometry(profile, 64), new THREE.MeshPhysicalMaterial({
    color: '#d2e9ff', transparent: true, opacity: .16, roughness: .2, metalness: 0,
    clearcoat: 0, clearcoatRoughness: 1,
    depthWrite: false, side: THREE.FrontSide
  }), group);
  glass.renderOrder = 3;
  const bronze = mat('#e6b567', {metalness:.48,roughness:.3});
  const pale = mat('#f8e5bb');
  mesh(new THREE.CylinderGeometry(.69, .73, .065, 64), mat('#ad775b'), group, 0, .005, 0);
  mesh(new THREE.CylinderGeometry(.70, .70, .02, 64), mat('#233d51'), group, 0, .049, 0);
  mesh(new THREE.TorusGeometry(.65, .035, 8, 32), bronze, group, 0, .12, 0).rotation.x = Math.PI / 2;
  mesh(new THREE.TorusGeometry(.35, .035, 6, 28), mat('#f4d3aa'), group, 0, 1.93, 0).rotation.x = Math.PI / 2;
  const cork = mesh(new THREE.CylinderGeometry(.31, .28, .27, 48), mat('#ac7952'), group, 0, 2.06, 0);
  cork.rotation.z = -.03;
  const capTop=mesh(new THREE.CylinderGeometry(.34, .34, .035, 24), bronze, group, 0, 2.2, 0);
  const wax = ball(group, mat(color), 0, 2.23, 0, .16, .06, .16);
  wax.rotation.z = -.08;
  stroke(group,bronze,[[-.23,1.90,.22],[-.25,1.59,.43],[0,1.30,.65],[.25,1.59,.43],[.23,1.90,.22]],.017);
  const medallion = mesh(new THREE.CylinderGeometry(.205,.205,.045,48),bronze,group,0,1.13,.653);medallion.rotation.x=Math.PI/2;
  const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=512;
  const ctx=labelCanvas.getContext('2d');ctx.scale(4,4);ctx.fillStyle='#fff0cd';ctx.fillRect(0,0,128,128);ctx.strokeStyle='#aa8158';ctx.lineWidth=3;ctx.beginPath();ctx.arc(64,64,54,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#574056';ctx.font='bold 72px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(jarSymbols[id],64,67);
  const labelMap=new THREE.CanvasTexture(labelCanvas);labelMap.colorSpace=THREE.SRGBColorSpace;labelMap.anisotropy=8;
  mesh(new THREE.CircleGeometry(.181,48),new THREE.MeshStandardMaterial({map:labelMap,roughness:.7}),group,0,1.13,.68);
  for (const sign of [-1, 1]) {
    stroke(group, new THREE.MeshBasicMaterial({ color: '#eddbc0', transparent: true, opacity: .17 }), [
      [sign * .41, .42, .48], [sign * .47, .75, .47], [sign * .46, 1.1, .45], [sign * .37, 1.39, .37]
    ], .014);
  }
  mesh(new THREE.TorusGeometry(.39, .025, 6, 28), new THREE.MeshBasicMaterial({ color }), group, 0, .25, 0).rotation.x = Math.PI / 2;
  for(const r of [.53,.62])mesh(new THREE.TorusGeometry(r,.012,10,64),bronze,group,0,.15,0).rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const mark=mesh(new THREE.OctahedronGeometry(.021),bronze,group,Math.sin(a)*.49,.29,Math.cos(a)*.49);mark.scale.y=1.6;}
  const potionGlow = new THREE.PointLight(color, 0, 2.2, 2);
  potionGlow.position.set(0, .72, .1);
  group.add(potionGlow);
  const sparkles = new THREE.Group();group.add(sparkles);
  for(let i=0;i<8;i++){
    const star=mesh(new THREE.OctahedronGeometry(.026+(i%3)*.008),new THREE.MeshBasicMaterial({color:'#ffefb0',transparent:true,opacity:0}),sparkles);
    star.userData.phase=i*.78;
  }
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(32*3),3));
  const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color,size:.07,transparent:true,opacity:0,depthWrite:false}));dust.visible=false;scene.add(dust);
  const bottle=new THREE.Group();group.add(bottle);
  for(const child of [...group.children])if(child!==bottle&&child!==sparkles)bottle.add(child);
  const cap=new THREE.Group();bottle.add(cap);for(const part of [cork,capTop,wax])cap.add(part);
  const models=makeArtifactModels(group,color);
  const jar = { id, group, bottle, cap, models, kind:'potion', homeX: x, homeZ:.4, baseScale:1, liquid: null, level: -1, potionGlow, sparkles, dust, flight:null };
  group.visible=organization[id]!=='retired';
  group.traverse((node) => {
    if (node.isMesh) { node.userData.projectId = id;node.castShadow=node.material?.type!=='MeshPhysicalMaterial';pickMeshes.push(node); }
  });
  jars.set(id, jar);
  return jar;
}

async function setupScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, .1, 60);
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'default' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(1);
  $('scene').appendChild(renderer.domElement);
  workshop = createWorkshop(scene,renderer);
  await new Promise(resolve=>setTimeout(resolve,0));
  buildCat();
  cat.traverse((node) => { if (node.isMesh) {node.castShadow = true;catPickMeshes.push(node);} });
  paintRenderer=createPaintRenderer(renderer,scene,camera);
  paintRenderer.setLight(lightRendering);
  raycaster = new THREE.Raycaster();
  renderer.domElement.addEventListener('pointerup', finishPotionDrag);
  renderer.domElement.addEventListener('pointerdown', beginPotionDrag);
  renderer.domElement.addEventListener('pointercancel',()=>finishPotionDrag(null));
  renderer.domElement.addEventListener('lostpointercapture',()=>{if(potionDrag)finishPotionDrag(null);});
  dropHint=document.createElement('div');dropHint.className='potion-drop-hint';dropHint.hidden=true;document.body.append(dropHint);
  renderer.domElement.addEventListener('pointermove',event=>{if(updatePotionDrag(event))return;const now=performance.now();if(now-lastHover>50){lastHover=now;hoverJar(event);}});
  renderer.domElement.addEventListener('pointerleave',()=>{hoveredId=null;catHovered=false;pointerLook.set(0,0);renderer.domElement.style.cursor='default';});
  window.addEventListener('resize',()=>{resize();animate(true);});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;syncRoomLoop();$('sceneLoading').hidden=false;$('sceneLoading').textContent='The room is resting. Your project collection is still available.';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;lastFrame=0;resize();$('sceneLoading').hidden=true;syncRoomLoop();});
  sceneReady=true;syncSceneArtifacts();
  resize();
  for(const jar of jars.values()){const pose=jarRestPose(jar);jar.group.position.copy(pose.position);jar.group.scale.setScalar(pose.scale);}
  if(renderer.compileAsync)await renderer.compileAsync(scene,camera);
  renderReady=true;
  $('sceneLoading').hidden=true;
  document.addEventListener('visibilitychange',()=>{frameBudget.reset();lastFrame=0;lastDraw=0;if(document.visibilityState==='visible')animate(true);syncRoomLoop();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{const wasVisible=roomInView;roomInView=entries[0].isIntersecting;if(roomInView&&!wasVisible)animate(true);syncRoomLoop();},{threshold:.03}).observe($('scene'));
  reducedMotion.addEventListener('change',()=>{animate();syncRoomLoop();});
  animate();syncRoomLoop();
}

function syncRoomLoop(){
  if(!renderer||!renderReady)return;
  const reading=selectedId&&!reveal&&performance.now()-lastInteraction>2800;
  const run=!contextLost&&!reading&&shouldRunRoom({visible:document.visibilityState==='visible',inView:roomInView,collectionOpen:$('libraryDialog').open,still:reducedMotion.matches||roomPaused});
  if(!run)renderMonitor.paused(reading?'reading the journal':$('libraryDialog').open?'browsing the collection':!roomInView?'room offscreen':document.visibilityState!=='visible'?'background tab':'quiet room');
  if(run===loopRunning)return;
  loopRunning=run;lastFrame=0;lastDraw=0;
  frameBudget.reset();if(run)renderMonitor.resumed();
  renderer.setAnimationLoop(run?animate:null);
}

function resize() {
  if (!renderer) return;
  const bounds = $('scene').getBoundingClientRect();
  const mobile = bounds.width < 700;
  mobileLayout=mobile;
  renderer.setPixelRatio(renderDensity(bounds.width,bounds.height,window.devicePixelRatio||1,lightRendering));
  renderer.setSize(bounds.width, bounds.height, false);
  paintRenderer?.resize(bounds.width,bounds.height);
  camera.aspect = Math.max(.1, bounds.width / bounds.height);
  camera.fov = mobile ? 42 : 38;
  cameraHome.set(mobile ? 0 : .75, mobile ? 5.6 : 4.05, mobile ? 11.3 : 12.2);
  camera.position.copy(cameraHome);
  camera.lookAt(0, mobile ? 1.75 : 1.8, 0);
  camera.updateProjectionMatrix();
  cat.position.set(mobile?0:-3.37,mobile?1.68:1.04,mobile?-1.12:.12);
  cat.scale.setScalar(mobile?.84:.95);
  const xs = mobile ? [-1.50, 0, 1.50] : [-1.25, .62, 2.49];
  jars.forEach((jar, id) => {jar.homeX=xs[Math.max(0,collectionIds('table').indexOf(id))%3];jar.homeZ=mobile?1.15:.4;jar.baseScale=mobile?.86:1;});
  workshop.setMobile(mobile);
  for(const jar of jars.values())if(!selectedId&&!jar.flight&&potionDrag?.id!==jar.id){const pose=jarRestPose(jar);jar.group.position.copy(pose.position);jar.group.scale.setScalar(pose.scale);}
}
function animate(scheduledTime) {
  if(!renderer||!renderReady||contextLost||$('libraryDialog').open||document.visibilityState!=='visible'||!roomInView)return;
  const now=performance.now();
  const scheduled=typeof scheduledTime==='number';
  if(!frameDue(now,lastDraw,scheduled,!!potionDrag?.active,scheduledTime===true))return;lastDraw=now;
  const began=renderMonitor.begin(renderer);
  const time=performance.now();
  const still = reducedMotion.matches||roomPaused;
  const interval=lastFrame?time-lastFrame:0;
  const dt=Math.min(.05,lastFrame?(time-lastFrame)/1000:.016);lastFrame=time;
  const ease=still?1:1-Math.exp(-9*dt);
  jars.forEach((jar) => {
    const isSelected = jar.id === selectedId;
    const isHovered = jar.id === hoveredId;
    const place=organization[jar.id],rest=jarRestPose(jar);
    const target=isSelected?new THREE.Vector3(mobileLayout?0:-1.1,mobileLayout?1.12:1.02,mobileLayout?2.3:1.9):rest.position;
    const targetScale=isSelected?jar.baseScale*(reveal?1.18:1.1):rest.scale*(isHovered?1.045:1);
    jar.dust.visible=false;
    if(potionDrag?.active&&potionDrag.id===jar.id){
      jar.group.position.lerp(potionDrag.target,still?1:Math.max(ease,.35));
      jar.group.rotation.z=still?0:THREE.MathUtils.lerp(jar.group.rotation.z,potionDrag.tilt,.2);
      jar.group.scale.setScalar(potionDrag.scale*1.08);
    }else if(jar.flight){
      const f=jar.flight,p=still?1:Math.min(1,(time-f.start)/f.duration),smooth=p*p*(3-2*p);
      if(f.to==='retired'){
        jar.group.position.copy(f.from);jar.group.position.y+=Math.sin(p*Math.PI)*.30;
        jar.group.scale.setScalar(f.fromScale*Math.max(.001,1-smooth*1.18));jar.group.rotation.z=Math.sin(p*Math.PI)*.15;
        jar.group.visible=p<.82;
        jar.dust.visible=!still&&p<1;jar.dust.material.opacity=Math.sin(p*Math.PI)*.9;
        const positions=jar.dust.geometry.attributes.position;
        for(let i=0;i<positions.count;i++){const angle=i*2.39996;const r=.18+p*(.7+(i%4)*.11);positions.setXYZ(i,f.from.x+Math.cos(angle)*r,f.from.y+.35+(i%5)*.15+p*1.2,f.from.z+Math.sin(angle)*r*.55);}
        positions.needsUpdate=true;
      }else{
        jar.group.visible=true;jar.group.position.lerpVectors(f.from,rest.position,smooth);jar.group.position.y+=f.dragDrop?Math.sin(p*Math.PI*2)*.16*(1-p):Math.sin(p*Math.PI)*1.15;
        jar.group.scale.setScalar(THREE.MathUtils.lerp(f.fromScale,rest.scale,smooth));jar.group.rotation.z=Math.sin(p*Math.PI*2)*.07;
      }
      if(p>=1){jar.flight=null;jar.group.visible=f.to!=='retired';jar.dust.visible=false;}
    }else{
      jar.group.visible=place!=='retired'||isSelected;
      jar.group.position.lerp(target,ease);jar.group.position.y+=!still&&isHovered?.006:0;
      jar.group.scale.lerp(new THREE.Vector3(targetScale,targetScale,targetScale),ease);
      jar.group.rotation.z=still||isSelected||place==='shelf'?0:Math.sin(time*.0011+jar.homeX)*.012;
    }
    const opening=isSelected&&reveal?.mode!=='closed'&&reveal?.id===jar.id;
    const openEase=still?1:1-Math.exp(-5*dt);
    jar.cap.position.y=THREE.MathUtils.lerp(jar.cap.position.y,opening?.63:0,openEase);
    jar.cap.position.x=THREE.MathUtils.lerp(jar.cap.position.x,opening?-.45:0,openEase);
    jar.cap.rotation.z=THREE.MathUtils.lerp(jar.cap.rotation.z,opening?.25:0,openEase);
    jar.models.lid.rotation.x=THREE.MathUtils.lerp(jar.models.lid.rotation.x,opening?-1.12:0,openEase);
    jar.models.scroll.ribbon.visible=!opening;jar.models.scroll.seal.visible=!opening;jar.models.scroll.stamp.visible=!opening;
    const message=jar.models.message.root;
    message.visible=opening&&reveal?.mode==='emerging';
    const messageY=jar.kind==='potion'?2.48:jar.kind==='keepsake'?1.25:1.48;
    message.position.y=THREE.MathUtils.lerp(message.position.y,opening?messageY:.7,openEase);
    message.position.z=.35;message.rotation.z=still?0:Math.sin(time*.0018)*.06;
    message.scale.setScalar(THREE.MathUtils.lerp(message.scale.x,opening?(reveal?.mode==='unfolding'?.83:.52):.02,openEase));
    jar.sparkles.children.forEach((spark,i)=>{
      const p=spark.userData.phase,t=time*.001;
      spark.position.set(Math.sin(p+t*.3)*.80,.40+((p*.31+(still?0:t*.25))%1.9),Math.cos(p+t*.3)*.70);
      spark.rotation.y=still?0:t;
      spark.material.opacity=(isSelected?.7:isHovered?.45:.14)*(still?1:.55+.45*Math.sin(t*2+p));
      spark.visible=jar.level>0&&(jar.kind==='potion'||isSelected);
    });
    if(jar.liquid){const data=jar.liquid.userData;data.ripple.time.value=time*.001;data.ripple.strength.value=still?0:isSelected||isHovered?1:.45;data.bubbles.forEach(b=>{if(!still)b.position.y=.15+((time*.00007+b.userData.phase)%1)*(data.top-.20);});}
    if (jar.potionGlow && jar.level > 0) {
      const base = .45 + jar.level * .6;
      jar.potionGlow.intensity = (jar.kind==='potion'?base:0) * (isSelected ? 1.8 : isHovered ? 1.4 : 1) *
        (still ? 1 : 1 + .07 * Math.sin(time * .003 + jar.homeX));
    }
  });
  if (cat) {
    const greet=Math.max(0,Math.min(1,(greetingUntil-time)/1000));
    const watching=!!potionDrag?.active||!!reveal||(time<watchUntil&&!!watchedPotion),cozy=!watching&&time<cozyUntil;
    const mood=watching?'idle':cozy?'cozy':greet>0?catMood:time-lastInteraction>20000?'sleepy':'idle';
    const moodLabel=watching?'watching your artifact':cozy?'warming little paws':mood==='pet'?'very happy to see you':mood==='hello'?'saying hello':mood==='celebrate'?'celebrating your progress':mood==='sleepy'?'a little sleepy':catHovered||hoveredId?'a curious little helper':'your workshop keeper';
    if($('keeperMood').textContent!==moodLabel)$('keeperMood').textContent=moodLabel;
    let look=selectedId?.65:pointerLook.x,lookY=pointerLook.y;
    if(watching){const p=potionDrag?.active?potionDrag.target:jars.get(reveal?.id||watchedPotion)?.group.position.clone().add(new THREE.Vector3(0,reveal?2:0,0));if(p){look=THREE.MathUtils.clamp((p.x-cat.position.x)/3,-1,1);lookY=THREE.MathUtils.clamp((p.y+1-(cat.position.y+1.75))/2,-1,1);}}
    if(cozy){look=.85;lookY=-.3;}
    animateSpiritCat(cat,time*.001,dt,{still,look,lookY,greet,mood,watching,cozy,attention:watching||catHovered||!!hoveredId});
  }
  workshop?.update(time*.001,still);
  const closeShelf=roomView&&!selectedId&&!mobileLayout;
  const camTarget=reveal&&!mobileLayout?new THREE.Vector3(-.3,4.1,10.5):closeShelf?new THREE.Vector3(-1.7,4.4,9.4):cameraHome.clone();
  camTarget.x+=still||mobileLayout?0:pointerLook.x*.25;
  camTarget.y+=still||mobileLayout?0:pointerLook.y*.12;
  camera.position.lerp(camTarget,still?1:1-Math.exp(-3*dt));
  cameraAim.lerp(new THREE.Vector3(reveal&&!mobileLayout?-.65:closeShelf?-1.7:0,reveal?2.2:closeShelf?3.2:mobileLayout?1.75:1.8,closeShelf?-3:0),still?1:1-Math.exp(-3*dt));
  camera.lookAt(cameraAim);
  positionArtifactLabels();

  paintRenderer?paintRenderer.render():renderer.render(scene,camera);
  renderMonitor.end(renderer,began,lightRendering?'Light':'Balanced');
  if(!lightRendering&&scheduled&&frameBudget.sample(interval)){lightRendering=true;paintRenderer?.setLight(true);resize();}
  syncRoomLoop();
}

function projectAtPointer(event) {
  if (!renderer) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(pickMeshes.filter(mesh=>{const j=jars.get(mesh.userData.projectId);if(!j||organization[j.id]==='retired'||!j.group.visible||j.flight)return false;for(let n=mesh;n;n=n.parent)if(!n.visible)return false;return true;}), false)[0]?.object.userData.projectId || null;
}
function beginPotionDrag(event){
  if(event.pointerType==='mouse'&&event.button!==0)return;
  pointerDown={x:event.clientX,y:event.clientY};if(selectedId)return;
  const id=projectAtPointer(event);if(!id)return;
  const jar=jars.get(id),normal=camera.getWorldDirection(new THREE.Vector3());
  const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,jar.group.position);
  const hit=raycaster.ray.intersectPlane(plane,new THREE.Vector3());if(!hit)return;
  potionDrag={id,pointerId:event.pointerId,active:false,plane,offset:jar.group.position.clone().sub(hit),target:jar.group.position.clone(),scale:jar.group.scale.x,tilt:0,to:organization[id]==='table'?'shelf':'table',over:false};
  renderer.domElement.setPointerCapture(event.pointerId);
}
function dragDestination(){
  const point=potionDrag.to==='shelf'?workshop.shelfSlot(1):new THREE.Vector3(.65,1.6,mobileLayout?1.15:.4);
  const ndc=point.clone().project(camera),rect=renderer.domElement.getBoundingClientRect();
  return {x:rect.left+(ndc.x+1)*rect.width/2,y:rect.top+(1-ndc.y)*rect.height/2,rx:mobileLayout?95:150,ry:mobileLayout?65:85};
}
function updatePotionDrag(event){
  if(!potionDrag||event.pointerId!==potionDrag.pointerId)return false;
  if(!potionDrag.active&&Math.hypot(event.clientX-pointerDown.x,event.clientY-pointerDown.y)<8)return false;
  potionDrag.active=true;watchedPotion=potionDrag.id;watchUntil=performance.now()+2400;event.preventDefault();lastInteraction=performance.now();
  projectAtPointer(event);
  const hit=raycaster.ray.intersectPlane(potionDrag.plane,new THREE.Vector3());
  if(hit){const next=hit.add(potionDrag.offset);potionDrag.tilt=THREE.MathUtils.clamp((potionDrag.target.x-next.x)*.12,-.16,.16);potionDrag.target.copy(next);}
  const d=dragDestination();potionDrag.over=((event.clientX-d.x)/d.rx)**2+((event.clientY-d.y)/d.ry)**2<1;
  dropHint.hidden=false;dropHint.style.left=d.x+'px';dropHint.style.top=d.y+'px';dropHint.classList.toggle('ready',potionDrag.over);
  dropHint.textContent=potionDrag.over?'Release · lovely spot!':potionDrag.to==='shelf'?'↑ Rest on the shelf':'↓ Back to the worktable';
  renderer.domElement.style.cursor='grabbing';hoveredId=potionDrag.id;animate();return true;
}
function finishPotionDrag(event){
  const drag=potionDrag;potionDrag=null;if(dropHint)dropHint.hidden=true;
  if(drag&&renderer.domElement.hasPointerCapture(drag.pointerId))renderer.domElement.releasePointerCapture(drag.pointerId);
  renderer.domElement.style.cursor='grab';
  if(!drag?.active){if(event)pickJar(event);else pointerDown=null;return;}
  pointerDown=null;hoveredId=null;
  if(event&&drag.over){movePotion(drag.id,drag.to);const flight=jars.get(drag.id).flight;if(flight){flight.duration=650;flight.dragDrop=true;}chime('select');}
  else{const jar=jars.get(drag.id);jar.flight={from:jar.group.position.clone(),fromScale:jar.group.scale.x,start:performance.now(),duration:500,to:organization[drag.id],dragDrop:true};}
  animate();
}
function pickJar(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  if(!pointerDown||Math.hypot(event.clientX-pointerDown.x,event.clientY-pointerDown.y)>12)return;
  pointerDown=null;
  if(reveal){if(reveal.mode==='closed')openArtifact();else if(reveal.mode==='sealed')unfurlArtifact();return;}
  const id = projectAtPointer(event);
  if (id) {lastFocusedId=id;selectProject(id);}
  else if(raycaster.intersectObjects(catPickMeshes,false).length) greetCat("pet");
  else {const prop=raycaster.intersectObjects(workshop.interactables,false)[0];if(prop)interactRoom(prop.object.userData.roomAction);}
  if(event.pointerType!=='mouse')hoveredId=null;
}
function hoverJar(event) {
  lastInteraction=performance.now();
  hoveredId = projectAtPointer(event);
  catHovered=!hoveredId&&raycaster.intersectObjects(catPickMeshes,false).length>0;
  const rect=renderer.domElement.getBoundingClientRect();
  pointerLook.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
  const prop=raycaster.intersectObjects(workshop.interactables,false)[0];
  renderer.domElement.style.cursor = hoveredId?'grab':catHovered||prop?'pointer':'default';
  renderer.domElement.title=hoveredId?'Drag to move · tap to discover':prop?{fire:'Stoke the fire',lantern:'Toggle the lantern',journal:'Begin a focus session'}[prop.object.userData.roomAction]:'';
}

function chime(kind='select') {
  if(!soundEnabled)return;
  try {
    audioContext??=new (window.AudioContext||window.webkitAudioContext)();
    audioContext.resume();
    const notes=kind==='hello'?[659.25,880,987.77]:[523.25,783.99];
    notes.forEach((frequency,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain(),t=audioContext.currentTime+i*.085;o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.4);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.42);});
  } catch { soundEnabled=false;$('soundButton').setAttribute('aria-pressed','false'); }
}
let dialogueTimer;
function say(text){if(lastDialogue===text)return;$('keeperLine').textContent=text;lastDialogue=text;const keeper=document.querySelector('.keeper');keeper.classList.add('speaking');clearTimeout(dialogueTimer);dialogueTimer=setTimeout(()=>keeper.classList.remove('speaking'),6500);}
function greetCat(kind='hello'){
  lastInteraction=performance.now();
  catMood=kind==='pet'?'pet':'hello';greetingUntil=lastInteraction+6000;
  const lines=kind==='pet'?['Prrrr… that is exactly the spot.','One more little head scratch?','You bring the ideas. I’ll bring the purrs.']:['Oh, hello! I saved you the warmest spot.','A little idea and a little courage. We can do this.','The fire is warm. There’s no need to rush.'];
  say(lines[helloCount++%lines.length]);chime('hello');
  // Paint the response in the input event even when the host throttles animation frames.
  if(renderer&&cat)animate();
}


const TRAIL_STEPS=['Goal','Route','Build','Review','Refine'];
function questTrail(project,labels=false){
  const trail=document.createElement('span');trail.className='quest-trail'+(labels?' with-labels':'');
  const done=approvedCount(project),total=project.gates.length;
  if(!total){trail.className='project-state-seal';trail.textContent=project.phase==='complete'?'❖ Released keepsake':'✧ Your milestones, your pace';return trail;}
  const names=project.gateNames||TRAIL_STEPS;
  trail.style.setProperty('--trail-count',total);
  trail.style.setProperty('--trail-fill',`${Math.max(0,done-1)/Math.max(1,total-1)*100}%`);
  trail.classList.toggle('complete',done===total);
  trail.setAttribute('role','progressbar');trail.setAttribute('aria-valuemin','0');trail.setAttribute('aria-valuemax',String(total));trail.setAttribute('aria-valuenow',String(done));
  trail.setAttribute('aria-label','Quest progress');
  trail.setAttribute('aria-valuetext',project.gates.map((state,i)=>`${names[i]} ${state==='approved'?'complete':state==='active'?'current':'ahead'}`).join(', '));
  const track=document.createElement('span');track.className='trail-track';track.setAttribute('aria-hidden','true');trail.append(track);
  const stars=document.createElement('span');stars.className='trail-stars';stars.setAttribute('aria-hidden','true');
  project.gates.forEach((state,i)=>{const node=document.createElement('span');node.className='trail-stop '+state;node.title=`${names[i]} · ${state==='approved'?'complete':state==='active'?'current':'ahead'}`;
    const gem=document.createElement('span');gem.className='trail-gem';gem.textContent=state==='approved'?'✦':state==='active'?'◆':'◇';node.append(gem);
    if(labels){const text=document.createElement('span');text.className='trail-name';text.textContent=names[i];node.append(text);}stars.append(node);});
  trail.append(stars);return trail;
}
function renderDock() {
  const dock = $('jarDock');
  dock.replaceChildren();
  renderCollections();
  const visibleIds=collection==='retired'?collectionIds('retired').slice(0,3):[...collectionIds('table').slice(0,3),...collectionIds('shelf').slice(0,3)];
  dock.classList.toggle('retired-labels',collection==='retired');
  dock.style.setProperty('--visible-count',Math.max(1,visibleIds.length));
  $('emptyCollection').hidden=visibleIds.length>0;
  $('emptyCollection').textContent={table:'A little breathing room. Bring an artifact back from the wall shelf or Retired.',shelf:'Your shelf is waiting. Drag an artifact here, or move it from its journal.',retired:'Nothing retired. Cleared artifacts will appear here, ready to restore.'}[collection];
  for (const id of visibleIds) {
    const project = records.get(id);
    if (!project) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'jar-option';
    button.dataset.projectId = id;
    button.style.setProperty('--project-color', COLORS[id]);
    button.classList.toggle('is-selected',selectedId===id);button.setAttribute('aria-haspopup','dialog');
    button.setAttribute('aria-label', `${project.title}, ${approvedCount(project)} of 5 gates approved. Open project details.`);
    const name = document.createElement('span'); name.className = 'jar-name'; name.textContent = project.title;
    const q=questFor(project);
    const kind=artifactKind(project,primaryProjectId);
    button.dataset.artifactKind=kind;button.dataset.place=organization[id];
    button.setAttribute('aria-label',`${project.title}: ${organization[id]==='table'?q.status:organization[id]==='shelf'?'On the shelf':'Retired and restorable'}. Open project.`);
    button.title=project.title+' · Open journal';
    button.append(name);
    button.addEventListener('click', () => { lastFocusedId = id; selectProject(id); });
    button.addEventListener('pointerenter', () => { hoveredId = id; });
    button.addEventListener('pointerleave', () => { if (hoveredId === id) hoveredId = null; });
    button.addEventListener('focus', () => { hoveredId = id; });
    button.addEventListener('blur', () => { if (hoveredId === id) hoveredId = null; });
    dock.append(button);
  }
  if(collectionIds(collection).length>3){const more=document.createElement('button');more.className='browse-more';more.type='button';more.textContent='More projects →';more.addEventListener('click',()=>collectionUI.show());dock.append(more);}
  positionArtifactLabels();
}
const labelAnchor=new THREE.Vector3();
function positionArtifactLabels(){
  const dock=$('jarDock'),positioned=renderReady&&!contextLost&&collection!=='retired';
  dock.classList.toggle('labels-positioned',positioned);
  if(!positioned)return;
  const bounds=$('scene').getBoundingClientRect(),roomBounds=$('room').getBoundingClientRect();
  const placed=[];
  for(const button of dock.querySelectorAll('[data-project-id]')){
    const jar=jars.get(button.dataset.projectId);
    if(!jar){button.hidden=true;continue;}
    labelAnchor.copy(jar.group.position);labelAnchor.y-=.12;labelAnchor.project(camera);
    button.hidden=!jar.group.visible||labelAnchor.z>1||labelAnchor.z< -1||!!jar.flight||potionDrag?.id===jar.id;
    const width=mobileLayout?organization[jar.id]==='shelf'?90:collectionIds('table').length===3?92:128:organization[jar.id]==='shelf'?136:168;
    const x=Math.max(width/2+12,Math.min(bounds.width-width/2-12,(labelAnchor.x+1)*bounds.width/2));
    button.style.width=width+'px';
    const left=bounds.left-roomBounds.left+x-width/2,baseTop=bounds.top-roomBounds.top+(1-labelAnchor.y)*bounds.height/2+10;
    const height=button.offsetHeight;let top=baseTop;
    for(const previous of placed)if(left<previous.right+8&&left+width>previous.left-8&&top<previous.bottom+8&&top+height>previous.top-8)top=previous.bottom+8;
    if(!button.hidden)placed.push({left,right:left+width,top,bottom:top+height});
    button.style.left=(bounds.left-roomBounds.left+x)+'px';
    button.style.top=top+'px';button.style.setProperty('--label-offset',(top-baseTop)+'px');button.classList.toggle('label-staggered',top>baseTop);
  }
}
function renderDetails(project) {
  if(!project)return;
  collectionUI?.renderProject(project);
  $('detailTitle').textContent = project.title;
  $('detailPitch').textContent = project.pitch;
  $('detailPlacement').textContent={table:'On your worktable',shelf:'In your collection · on the wall shelf',retired:'Retired · ready to restore'}[organization[project.id]];
  $('detailProgress').replaceChildren(questTrail(project,true));
  $('detailTrailState').textContent=project.legacyWorkflow&&approvedCount(project)===5?(project.phase==='revisiting'?'Original milestones complete · revisiting':'Original milestones complete'):questFor(project).status;
  $('detailSeal').style.color = COLORS[project.id];
  const q=questFor(project);
  $('detailNext').textContent=q.action;
  $('fullNext').textContent=project.nextMove;
  $('setFocus').textContent=project.id===focusId?'Your current focus ✓':'Make this my focus';
  $('setFocus').disabled=project.id===focusId;
  $('setFocus').hidden=organization[project.id]!=='table'||project.id===focusId;
  $('potionPlace').textContent={table:'On your worktable',shelf:'On the wall shelf',retired:'Retired'}[organization[project.id]];
  $('shelvePotion').textContent=organization[project.id]==='table'?'Move to wall shelf':organization[project.id]==='shelf'?'Bring to worktable':'Restore to worktable';
  $('disposePotion').hidden=organization[project.id]==='retired';
  const updatedDate=new Date(project.updatedAt);
  $('detailLatest').textContent = HOSTED ? (Number.isFinite(updatedDate.getTime())?`Updated · ${new Intl.DateTimeFormat('en',{dateStyle:'medium',timeZone:'UTC'}).format(updatedDate)}`:'') : project.updates?.[0] ? `Latest · ${project.updates[0].at}: ${project.updates[0].text}` : 'No dated updates yet.';
  const list = $('gateList'); list.replaceChildren();
  project.gates.forEach((state, i) => {
    const item = document.createElement('li'); item.className = state;
    item.textContent = `${String(i + 1).padStart(2, '0')} · ${project.gateNames?.[i]||STEPS[i]}`;
    list.append(item);
  });
}
function setRoomModal(active){if(!active)document.body.classList.remove('artifact-inspection');for(const selector of ['.masthead','.intro','.keeper','.collection-controls','.jar-dock','.empty-collection','.footnote','.workshop-play','#moveToast']){const element=document.querySelector(selector);if(element)element.inert=active;}}
function selectProject(id,playful=false) {
  const project=records.get(id);if(!project)return;
  if(potionDrag)finishPotionDrag(null);
  clearTimeout(revealTimer);selectedId=id;setRoomModal(true);if(mobileLayout){window.scrollTo({top:0,behavior:'instant'});document.body.classList.add('artifact-inspection');}
  syncSceneArtifacts();
  const kind=artifactKind(project,primaryProjectId);reveal={id,kind,mode:'closed',playful:playful===true,start:performance.now()};
  chime();lastInteraction=performance.now();watchedPotion=id;watchUntil=lastInteraction+4000;
  renderDock();renderDetails(project);
  $('details').hidden=true;$('details').querySelector('.journey').open=false;
  $('room').classList.add('selected','revealing');$('artifactReveal').hidden=false;
  $('revealKind').textContent=ARTIFACTS[kind].name;
  $('revealTitle').textContent=project.title;
  $('revealHint').textContent=ARTIFACTS[kind].hint;
  $('openArtifact').textContent=ARTIFACTS[kind].opening+' →';$('openArtifact').hidden=false;
  $('ribbonParcel').hidden=true;$('artifactReveal').style.setProperty('--pull',0);
  $('revealClose').focus();say('Let’s see what this little '+(kind==='scroll'?'scroll':kind==='keepsake'?'keepsake':'potion')+' holds.');
  if(renderer)animate();openArtifact();
}
function openArtifact(){
  if(!reveal||reveal.mode!=='closed')return;
  reveal.mode='emerging';reveal.start=performance.now();chime();
  $('openArtifact').hidden=true;$('revealClose').focus();$('revealHint').textContent='A little note is finding its way out…';
  const id=reveal.id;
  revealTimer=setTimeout(()=>{if(!reveal||reveal.id!==id)return;if(!reveal.playful){showQuestJournal(id);return;}reveal.mode='sealed';$('ribbonParcel').hidden=false;$('revealHint').textContent='One small step, tucked inside.';$('pullRibbon').focus();if(renderer)animate();},reducedMotion.matches?0:reveal.playful?720:260);
  if(renderer)animate();
}
function unfurlArtifact(){
  if(!reveal||!['sealed','unfolding'].includes(reveal.mode))return;
  reveal.mode='unfolding';$('artifactReveal').classList.add('unfurling');
  $('artifactReveal').style.setProperty('--pull',1);chime();const id=reveal.id;
  clearTimeout(revealTimer);
  revealTimer=setTimeout(()=>{if(!reveal||reveal.id!==id)return;
    showQuestJournal(id);
  },reducedMotion.matches?0:650);
  if(renderer)animate();
}
function showQuestJournal(id){
  if(selectedId!==id)return;
  clearTimeout(revealTimer);reveal=null;ribbonDrag=null;
  $('artifactReveal').hidden=true;$('artifactReveal').classList.remove('unfurling');$('room').classList.remove('revealing');
  $('details').hidden=false;renderDetails(records.get(id));$('returnButton').focus();$('details').scrollTop=0;
  $('details').querySelector('.artifact-management').open=false;
  catMood=records.get(id).phase==='complete'||records.get(id).gates.length>0&&approvedCount(records.get(id))===records.get(id).gates.length?'celebrate':'hello';greetingUntil=performance.now()+2600;
  const project=records.get(id);say(project.changed?`Last time: ${project.changed.slice(0,100)} Next: ${project.nextMove.slice(0,100)}`:'Your next small step: '+(project.nextMove||'Save an idea to begin.'));if(renderer)animate();
}
function returnToTable() {
  collectionUI?.rememberDraft();
  clearTimeout(revealTimer);reveal=null;ribbonDrag=null;selectedId=null;
  $('artifactReveal').hidden=true;$('artifactReveal').classList.remove('unfurling');$('details').hidden=true;
  $('room').classList.remove('selected','revealing');setRoomModal(false);renderDock();say('Every big idea starts with a little spark.');
  if(lastFocusedId)$('jarDock').querySelector(`[data-project-id="${lastFocusedId}"]`)?.focus();
  syncSceneArtifacts();if(renderer)animate();
}
function syncSceneArtifacts(){
  if(!sceneReady)return;
  const wanted=new Set([...collectionIds('table').slice(0,3),...collectionIds('shelf').slice(0,3),...(selectedId?[selectedId]:[])]);
  for(const [id,jar] of jars){if(wanted.has(id)||jar.flight)continue;scene.remove(jar.group,jar.dust);jar.group.traverse(node=>{if(node.isMesh){node.geometry.dispose();const materials=Array.isArray(node.material)?node.material:[node.material];materials.forEach(m=>{m.map?.dispose();m.dispose();});}});jar.dust.geometry.dispose();jar.dust.material.dispose();jars.delete(id);for(let i=pickMeshes.length-1;i>=0;i--)if(pickMeshes[i].userData.projectId===id)pickMeshes.splice(i,1);}
  for(const id of wanted){if(!records.has(id))continue;if(!jars.has(id))buildJar(id,0);const jar=jars.get(id),project=records.get(id);jar.baseScale=mobileLayout?.86:1;jar.kind=artifactKind(project,primaryProjectId);jar.bottle.visible=jar.kind==='potion';jar.models.scroll.root.visible=jar.kind==='scroll';jar.models.keepsake.visible=jar.kind==='keepsake';const level=levelFor(project);if(level!==jar.level){updateLiquid(jar,level);jar.level=level;}}
}
function applyRegistry(state) {
  if (!Array.isArray(state.projects)) throw new Error('Project registry has no projects.');
  const wasFirst=firstRegistry;
  vaultState=state;
  primaryProjectId=state.activeProjectId||IDS[0];
  records = new Map(state.projects.map((project) => [project.id, project]));
  IDS=state.projects.map(project=>project.id);
  if(firstRegistry){let saved={};try{saved=JSON.parse(storedOrganization)||{};}catch{}const parsed=parseOrganization(storedOrganization,IDS);for(const id of IDS)if(Object.prototype.hasOwnProperty.call(saved,id))organization[id]=parsed[id];firstRegistry=false;}
  for(const id of IDS){COLORS[id] ||= ['#c68af1','#42cbb3','#ffbd65','#cf8e8e'][IDS.indexOf(id)%4];jarSymbols[id] ||= '✧';if(!organization[id])organization[id]=collectionIds('table').length<3&&records.get(id).phase!=='complete'?'table':'shelf';}
  let tableCount=0;for(const id of IDS)if(organization[id]==='table'&&++tableCount>3)organization[id]='shelf';
  if(selectedId&&!records.has(selectedId))returnToTable();
  saveOrganization();syncSceneArtifacts();collectionUI?.render();
  renderDock();
  if (selectedId) renderDetails(records.get(selectedId));
  $('connection').textContent = connectionLabel();
  renderFocus();
  if(wasFirst)say(HOSTED?'Open a project to see its story, code, and live app.':'Your next step is waiting. Open a project to continue.');
  renderMonitor.markProjects();
  for(const id of ['libraryOpen','newProject','focusOpen'])$(id).disabled=false;
  clearError();
}
async function loadRegistry() {
  const response = await fetch(HOSTED ? './projects.json' : DEMO ? '/api/projects?demo=1' : '/api/projects', { cache: 'no-store' });
  if (!response.ok) throw new Error(HOSTED?'Could not load the published collection.':'Could not read the vault project registry.');
  const text = await response.text();
  if (text === lastRegistryText) {clearError();$('connection').textContent=connectionLabel();return;}
  applyRegistry(JSON.parse(text));
  lastRegistryText = text;
}

function updateFocusClock(){
  if(!focusEnds||document.visibilityState!=='visible')return;
  const remaining=Math.max(0,Math.ceil((focusEnds-Date.now())/1000));
  $('focusSession').textContent=remaining?`End focus · ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`:'Start 15-minute focus';
  if(!remaining){focusEnds=0;catMood='celebrate';lastInteraction=performance.now();greetingUntil=lastInteraction+2600;say('A little session, a real step forward. Take a breath.');chime();animate();syncRoomLoop();}
}
function interactRoom(action){
  if(action==='journal'){
    if(focusEnds){focusEnds=0;$('focusSession').textContent='Start 15-minute focus';say('Taking a breather. Your progress is still here.');}
    else{focusEnds=Date.now()+15*60*1000;say('Fifteen quiet minutes. Just one small step for '+(LABELS[focusId]||'your next idea')+'.');}
  }else{if(action==='fire'){cozyUntil=performance.now()+16000;catMood='cozy';}const on=workshop?.interact(action);say(action==='fire'?'Bob tucks into their cloak and warms their paws.':on?'A warm light for your next idea.':'Moonlight and embers. A quieter kind of cozy.');if(action==='lantern')$('lanternToggle').setAttribute('aria-pressed',String(on));}
  lastInteraction=performance.now();if(renderer)animate();
}
async function boot() {
  collectionUI=createCollectionUI({getState:()=>vaultState,onVisibilityChange:syncRoomLoop,refresh:loadRegistry,openProject:id=>{lastFocusedId=id;selectProject(id);},save:async(input,id)=>{if(HOSTED)throw new Error('Use the local workshop to save to your vault.');if(DEMO)throw new Error('Leave demo mode to save to your vault.');const response=await fetch(id?`/api/projects/${encodeURIComponent(id)}`:'/api/projects',{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':vaultState.token},body:JSON.stringify(input)});const result=await response.json();if(!response.ok){const error=new Error(result.error||'Could not save. Your draft is still here.');error.status=response.status;throw error;}applyRegistry(result);lastRegistryText='';return result;},onCheckpoint:(project,created,released)=>{catMood=created||project.phase==='complete'?'celebrate':'hello';greetingUntil=performance.now()+4000;lastInteraction=performance.now();say(released?`${project.title} is released. A keepsake worth keeping.`:created?`A new home for ${project.title}. Let’s begin.`:'Saved your place. Next: '+project.nextMove);chime();animate();syncRoomLoop();}});
  const tools=document.createElement('div');tools.className='workshop-play';tools.setAttribute('aria-label','Workshop interactions');
  tools.innerHTML='<details class="room-rituals"><summary>Room extras <span aria-hidden="true">✧</span></summary><div class="ritual-list"><button id="shelfView" aria-pressed="false">Explore shelf</button><button id="stokeFire">Stoke fire</button><button id="lanternToggle" aria-pressed="true">Lantern</button><button id="pauseRoom" aria-pressed="false">Pause room motion</button><button id="focusSession">Start 15-minute focus</button></div></details>';
  $('room').append(tools);
  $('pauseRoom').setAttribute('aria-pressed',String(roomPaused));$('pauseRoom').textContent=roomPaused?'Resume room motion':'Pause room motion';
  window.setInterval(updateFocusClock,1000);
  $('shelfView').addEventListener('click',()=>{roomView=!roomView;$('shelfView').setAttribute('aria-pressed',String(roomView));$('shelfView').textContent=roomView?'Back to room':'Explore shelf';showCollection(roomView?'shelf':'table');animate();});
  $('stokeFire').addEventListener('click',()=>interactRoom('fire'));
  $('lanternToggle').addEventListener('click',()=>interactRoom('lantern'));
  $('focusSession').addEventListener('click',()=>interactRoom('journal'));
  $('pauseRoom').addEventListener('click',()=>{roomPaused=!roomPaused;try{localStorage.setItem('ideaQuest.roomMotion',roomPaused?'paused':'live');}catch{}$('pauseRoom').setAttribute('aria-pressed',String(roomPaused));$('pauseRoom').textContent=roomPaused?'Resume room motion':'Pause room motion';animate();syncRoomLoop();});

  $('replayReveal').addEventListener('click',()=>{if(selectedId)selectProject(selectedId,true);});
  $('revealClose').addEventListener('click',returnToTable);
  $('openArtifact').addEventListener('click',openArtifact);
  $('pullRibbon').addEventListener('click',()=>{if(!ribbonDrag&&!ribbonDragged)unfurlArtifact();ribbonDragged=false;});
  $('pullRibbon').addEventListener('keydown',()=>{ribbonDragged=false;});
  const ribbon=$('pullRibbon');
  ribbon.addEventListener('pointerdown',e=>{if(reveal?.mode!=='sealed'||(e.pointerType==='mouse'&&e.button!==0))return;ribbonDragged=false;ribbonDrag={pointerId:e.pointerId,y:e.clientY,pull:0};ribbon.setPointerCapture(e.pointerId);});
  ribbon.addEventListener('pointermove',e=>{if(!ribbonDrag||e.pointerId!==ribbonDrag.pointerId)return;const pull=Math.max(0,Math.min(1,(e.clientY-ribbonDrag.y)/85));ribbonDrag.pull=pull;if(pull>.08)ribbonDragged=true;$('artifactReveal').style.setProperty('--pull',pull);if(pull>=1){ribbonDrag=null;unfurlArtifact();}});
  ribbon.addEventListener('pointerup',e=>{if(!ribbonDrag)return;const pull=ribbonDrag.pull;ribbonDrag=null;if(pull>.45)unfurlArtifact();else $('artifactReveal').style.setProperty('--pull',0);});
  ribbon.addEventListener('pointercancel',()=>{ribbonDrag=null;$('artifactReveal').style.setProperty('--pull',0);});
  $('returnButton').addEventListener('click', returnToTable);
  $('backButton').addEventListener('click', returnToTable);
  $('focusOpen').addEventListener('click',()=>{if(focusId){lastFocusedId=focusId;selectProject(focusId);}else{showCollection(collectionIds('shelf').length?'shelf':'retired');$(collection+'Tab').focus();}});
  for(const place of ['table','shelf','retired'])$(place+'Tab').addEventListener('click',()=>showCollection(place));
  $('shelvePotion').addEventListener('click',()=>{if(selectedId)movePotion(selectedId,organization[selectedId]==='table'?'shelf':'table');});
  $('disposePotion').addEventListener('click',()=>{if(selectedId)movePotion(selectedId,'retired');});
  $('undoMove').addEventListener('click',undoMove);
  $('dismissMove').addEventListener('click',()=>{$('moveToast').hidden=true;});
  $('setFocus').addEventListener('click',()=>{if(!selectedId)return;focusId=selectedId;try{localStorage.setItem('ideaQuest.focus',focusId);}catch{}renderFocus();renderDock();renderDetails(records.get(selectedId));say('One small quest at a time. I’m right here.');});
  $('greetButton').addEventListener('click',()=>greetCat('hello'));
  $('petButton').addEventListener('click',()=>greetCat('pet'));
  $('soundButton').addEventListener('click',()=>{soundEnabled=!soundEnabled;$('soundButton').setAttribute('aria-pressed',String(soundEnabled));$('soundButton').setAttribute('aria-label',soundEnabled?'Mute sound effects':'Enable sound effects');if(soundEnabled)chime('hello');});
  document.addEventListener('keydown', (event) => {
    if(event.key==='Escape'&&potionDrag){finishPotionDrag(null);return;}
    if(event.key==='Escape'&&selectedId)returnToTable();
    if(event.key==='Tab'&&selectedId){const panel=reveal?$('artifactReveal'):$('details');const tabbable=[...panel.querySelectorAll('button,a[href],input,textarea,select,summary')].filter(el=>!el.disabled&&el.getClientRects().length);const first=tabbable[0],last=tabbable[tabbable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  });
  try { await loadRegistry(); }
  catch (error) { $('connection').textContent=HOSTED?'Collection unavailable · retrying':'Vault unavailable · retrying';showError(error.message); }
  $('loading').hidden=true;
  await new Promise(resolve=>setTimeout(resolve,50));
  try { await setupScene(); }
  catch (error) {sceneFailure='The 3D room is unavailable here. All projects and links are still ready in All projects.';$('sceneLoading').textContent=sceneFailure;$('sceneLoading').hidden=false;}
  if(!sceneReady){$('pauseRoom').disabled=true;$('stokeFire').disabled=true;$('lanternToggle').disabled=true;$('shelfView').disabled=true;}
  window.setInterval(() => {
    if (document.visibilityState === 'visible') loadRegistry().catch((error) => {$('connection').textContent=HOSTED?'Collection unavailable · retrying':'Vault unavailable · retrying';showError(error.message);});
  }, HOSTED?60000:5000);
}
boot();

// Narrow, read-only hooks for automated checks of the prototype; no write action exists.
window.__ideaQuestTest = { levelFor, selectProject, getSelected: () => selectedId, getLevels: () =>
  Object.fromEntries(IDS.map((id) => [id, jars.get(id)?.level ?? null])) };

