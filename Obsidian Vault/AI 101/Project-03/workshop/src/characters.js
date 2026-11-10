import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

// One WebGL context, six independently animated mesh characters.
const palette={chief:['#86b39f','#324d47'],creative:['#f3a497','#b75881'],tech:['#f8bd63','#b5772e'],pip:['#b890eb','#6946ae'],programmer:['#91cadf','#3d6c89'],auditor:['#b4d4a3','#4c957e']};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let active=null,raf=0,last=0;
const material=(color,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness:.34,metalness:.05,clearcoat:.65,clearcoatRoughness:.3,envMapIntensity:.45,...extra});
function mesh(geometry,mat,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function orb(parent,mat,x,y,z,sx,sy=sx,sz=sx){const m=mesh(new THREE.SphereGeometry(1,40,28),mat,parent,x,y,z);m.scale.set(sx,sy,sz);return m;}
function rod(parent,mat,a,b,r=.035){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va);const m=mesh(new THREE.CylinderGeometry(r,r,delta.length(),16),mat,parent);m.position.copy(va.add(vb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
// Use the original SVG outline as the mesh's equator, then inflate both sides.
function originalBody(id){
 const d=document.querySelector(`.sculpt[data-agent="${id}"] .sculpt-body > path`)?.getAttribute('d');
 if(!d)return new THREE.SphereGeometry(1,64,48);
 const parsed=new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
 const points=SVGLoader.createShapes(parsed.paths[0])[0].getPoints(40).map(p=>new THREE.Vector2((p.x-66)/45,(78-p.y)/45));
 const g=new THREE.SphereGeometry(1,96,64),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),rho=Math.hypot(x,y),dx=rho?x/rho:1,dy=rho?y/rho:0;let radius=Infinity;
  for(let j=0;j<points.length;j++){
   const a=points[j],b=points[(j+1)%points.length],ex=b.x-a.x,ey=b.y-a.y,den=dx*ey-dy*ex;if(Math.abs(den)<1e-7)continue;
   const t=(a.x*ey-a.y*ex)/den,u=(a.x*dy-a.y*dx)/den;
   if(t>0&&u>=0&&u<=1)radius=Math.min(radius,t);
  }
  if(!Number.isFinite(radius))radius=1;
  const inflatedRadius=1+(radius-1)*Math.pow(rho,4);
  p.setXYZ(i,dx*rho*inflatedRadius,dy*rho*inflatedRadius,z*(id==='pip'?.62:.69));
 }
 g.computeVertexNormals();return g;
}
function tintGeometry(g,id){
 const base={chief:['#b2dac3','#3c8b78','#203f4c'],creative:['#ffd2ac','#e47b83','#a54770'],tech:['#ffe5a0','#e9a440','#985c29'],pip:['#b2a5f1','#7651be','#49358a'],programmer:['#c5e9f2','#5cabc3','#365f8b'],auditor:['#f6edda','#bdd8ca','#5b9c91']}[id].map(c=>new THREE.Color(c));
 const glows={chief:['#78e1bf','#6477c1'],creative:['#ffb86b','#e35ca8'],tech:['#ffda6e','#ed7552'],pip:['#ea8cc4','#5c9ee9'],programmer:['#6ce0d0','#7376cd'],auditor:['#f7dca4','#59b7ae']}[id].map(c=>new THREE.Color(c));
 const p=g.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),c=base[2].clone().lerp(base[1],.8).lerp(base[0],Math.max(0,y)*.27);
  if(id==='pip'){
   c.copy(base[2]).lerp(base[1],.66).lerp(base[0],Math.max(0,y)*.22);
   const spot=(cx,cy,spread)=>Math.exp(-((x-cx)**2+(y-cy)**2)/spread);
   c.lerp(glows[0],spot(-.42,.04,.13)*.9);
   c.lerp(glows[1],spot(-.24,-.46,.17)*.95);
   c.lerp(new THREE.Color('#5946ec'),spot(.37,-.55,.22)*.8);
  }else{
   // Keep each character's own material story: jade, coral, honey, blue and pearl.
   const accents={chief:[-.4,.05,.26,.45,-.5,.3],creative:[-.4,.2,.24,.4,-.3,.27],tech:[-.35,.25,.3,.5,-.45,.32],programmer:[-.38,.25,.24,.45,-.4,.28],auditor:[-.3,.3,.28,.4,-.48,.24]}[id];
   const [ax,ay,ar,bx,by,br]=accents;
   c.copy(base[2]).lerp(base[1],id==='auditor'?.84:.7).lerp(base[0],Math.max(0,y)*.25);
   c.lerp(glows[0],Math.exp(-((x-ax)**2+(y-ay)**2)/ar)*.8);
   c.lerp(glows[1],Math.exp(-((x-bx)**2+(y-by)**2)/br)*.82);
  }
  if(z<0)c.multiplyScalar(.83);colors.push(c.r,c.g,c.b);
 }
 g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return g;
}
function deskModel(id){
 const group=new THREE.Group(),tone={chief:'#8da998',creative:'#cc949d',tech:'#c9a265',pip:'#9b86c6',programmer:'#84aebe',auditor:'#97b795'}[id];
 const top=mesh(new RoundedBoxGeometry(3,.27,1.65,5,.12),material(tone,{roughness:.3,clearcoat:.8}),group,0,-1.12,.5);
 mesh(new RoundedBoxGeometry(2.87,.17,1.53,5,.1),material(tone,{roughness:.5}),group,0,-1.28,.5);
 group.rotation.y=-.12;
 const props=new THREE.Group();group.add(props);
 const reactions=[];
 const react=(object,kind,index=0)=>{reactions.push({object,kind,index,position:object.position.clone(),rotation:object.rotation.clone()});return object;};
 const paperMat=material('#e8e6d3',{roughness:.85}),ink=material('#6d8c78'),gold=material('#dac184',{metalness:.2});
 function paper(x,z,w=.65,h=.52){return mesh(new RoundedBoxGeometry(w,.025,h,2,.025),paperMat,props,x,-.995,z);}
 function flatLine(x,z,w){return rod(props,ink,[x,-.97,z],[x+w,-.97,z],.012);}
 if(id==='chief'||id==='creative'||id==='auditor'){
  paper(-.65,.7,.75,.58);flatLine(-.92,.55,.44);flatLine(-.92,.68,.3);flatLine(-.92,.81,.4);
 }
 if(id==='chief'){
  const book=new THREE.Group();props.add(book);book.position.set(.65,-.96,.55);
  mesh(new RoundedBoxGeometry(.64,.1,.68,3,.035),material('#456c61'),book);
  mesh(new RoundedBoxGeometry(.58,.045,.6,2,.02),paperMat,book,0,.07,0);
  const cover=new THREE.Group();book.add(cover);cover.position.set(-.32,.1,0);react(cover,'book');
  mesh(new RoundedBoxGeometry(.64,.045,.68,3,.025),material('#8bbfa4'),cover,.32,0,0);
  rod(cover,gold,[.19,.03,-.16],[.46,.03,-.16],.018);
 }

 if(id==='creative'){
  ['#e3bc75','#91bacb','#bf92b5'].forEach((c,i)=>{const m=mesh(new RoundedBoxGeometry(.28,.025,.46,2,.02),material(c),props,.45+i*.16,-.96+i*.025,.75-i*.06);m.rotation.y=i*.22;react(m,'swatch',i);});
  const pencil=new THREE.Group();props.add(pencil);pencil.position.set(-.65,-.93,.7);react(pencil,'pencil');rod(pencil,gold,[-.22,0,-.12],[.22,0,.12],.04);orb(pencil,ink,.24,0,.13,.045,.035,.04);
 }
 if(id==='tech'){
  for(const [x,z,size] of [[-.85,.55,.33],[.8,.5,.42]]){react(mesh(new RoundedBoxGeometry(size,size,size,3,.045),material('#e5d9ad'),props,x,-1+size/2,z),'block',x<0?0:1);}
  for(let i=0;i<3;i++)react(mesh(new RoundedBoxGeometry(.19,.13,.3,3,.025),material('#d3b77b',{emissive:'#b79552'}),props,-.25+i*.25,-.92,.6),'connector',i);
 }
 if(id==='pip'){
  [-.95,.94].forEach((x,i)=>{const card=new THREE.Group();props.add(card);card.position.set(x,-.63,.4);card.rotation.set(-.15,(-1+2*i)*.2,(-1+2*i)*-.08);react(card,'card',i);
   mesh(new RoundedBoxGeometry(.52,.67,.06,3,.04),material(i?'#dbafca':'#adcfe1'),card);
   if(i)orb(card,material('#f4d3a3'),0,.1,.05,.12,.12,.025);else{const tri=mesh(new THREE.ConeGeometry(.17,.3,3),material('#7398b4'),card,0,-.04,.05);tri.scale.z=.18;}
   const back=mesh(new RoundedBoxGeometry(.34,.44,.012,2,.025),material(i?'#bd86a7':'#78a4bf'),card,0,0,-.04);
  });paper(0,.95,.45,.28);
 }
 if(id==='programmer'){
  const monitor=new THREE.Group();props.add(monitor);monitor.position.set(-.8,-.6,.35);monitor.rotation.y=.2;react(monitor,'monitor');
  mesh(new RoundedBoxGeometry(.82,.58,.09,4,.06),material('#86acbe'),monitor);
  mesh(new RoundedBoxGeometry(.7,.46,.025,3,.045),material('#173e4a',{roughness:.23}),monitor,0,0,.06);
  const mint=material('#c4f2de',{emissive:'#82a99a',emissiveIntensity:.15});rod(monitor,mint,[-.24,.09,.085],[-.13,0,.085],.018);rod(monitor,mint,[-.13,0,.085],[-.24,-.09,.085],.018);
  const cursor=rod(monitor,mint,[.01,-.1,.085],[.17,-.1,.085],.015);cursor.name='desk-cursor';rod(monitor,material('#7399a8'),[0,-.28,0],[0,-.4,0],.04);
  mesh(new RoundedBoxGeometry(.72,.045,.28,3,.04),material('#9fbcc5'),props,.62,-.97,.85);
  for(let i=0;i<4;i++)react(rod(props,material('#577d8d'),[.35+i*.15,-.94,.77],[.35+i*.15,-.94,.94],.013),'key',i);
 }
 if(id==='auditor'){
  for(let i=0;i<3;i++){
   const mark=new THREE.Group();props.add(mark);mark.position.set(-.9,-.955,.5+i*.17);react(mark,'checkmark',i);
   rod(mark,material('#448b77'),[0,0,0],[.045,0,.045],.02);rod(mark,material('#448b77'),[.045,0,.045],[.13,0,-.05],.02);
  }
  const lens=new THREE.Group();props.add(lens);lens.position.set(.77,-.96,.6);lens.rotation.x=-Math.PI/2;react(lens,'lens');
  mesh(new THREE.TorusGeometry(.23,.035,12,40),gold,lens);mesh(new THREE.CircleGeometry(.2,40),material('#c6e6db',{transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}),lens);
  rod(lens,gold,[.16,-.16,0],[.42,-.42,0],.04);
 }
 const light=orb(group,material('#dcf2c9',{emissive:'#9fcd91',emissiveIntensity:.5}),0,-1.26,1.28,.035);
 // Scale around the tabletop, so enlarged props remain seated on it.
 props.scale.setScalar(1.25);props.position.y=.25;
 return {group,props,light,reactions};
}
function character(id,env){
 const scene=new THREE.Scene();scene.environment=env;scene.environmentIntensity=.35;
 const root=new THREE.Group();scene.add(root);
 const bodyMat=material('#ffffff',{vertexColors:true,roughness:.52,clearcoat:.3,clearcoatRoughness:.4,envMapIntensity:.24});
 const body=mesh(tintGeometry(originalBody(id),id),bodyMat,root);
 const face=new THREE.Group();root.add(face);face.position.set(id==='pip'?.13:0,id==='pip'?.3:.02,.73);
 const eyeMat=material(['chief','pip','tech'].includes(id)?'#fff3ce':'#233b40',{roughness:.22});
 const eyes=new THREE.Group();face.add(eyes);
 const eyesMeshes=[];const cheeks=new THREE.Group();face.add(cheeks);
 if(!['programmer','tech','pip'].includes(id))for(const x of [-.51,.51])orb(cheeks,material(id==='pip'?'#f0b6d5':'#e9a7a1',{transparent:true,opacity:.22,depthWrite:false}),x,-.15,-.025,.1,.045,.02);
 if(['tech','programmer'].includes(id)){
  const visor=mesh(new RoundedBoxGeometry(1.38,.85,.12,6,.24),material('#173d48',{roughness:.19,clearcoat:1}),root,0,.02,.65);
  face.position.z=.76;
 }
 if(id==='programmer'){
  const ink=material('#d2fff0',{emissive:'#70baa7',emissiveIntensity:.15});
  rod(eyes,ink,[-.4,.17,.02],[-.22,.02,.02],.035);rod(eyes,ink,[-.22,.02,.02],[-.4,-.12,.02],.035);
  const cursor=rod(eyes,ink,[.02,-.12,.02],[.27,-.12,.02],.03);cursor.name='cursor';
 }else{
  for(const x of (id==='pip'?[-.14,.14]:[-.29,.29])){const e=orb(eyes,eyeMat,x,.08,0,.06,.125,.045);eyesMeshes.push(e);orb(eyes,material('#ffffff',{roughness:.15}),x-.013,.12,.035,.016,.025,.013);}
  const smile=new THREE.CatmullRomCurve3([new THREE.Vector3(-.09,-.21,.015),new THREE.Vector3(0,-.24,.025),new THREE.Vector3(.1,-.2,.015)]);
  if(id!=='pip')mesh(new THREE.TubeGeometry(smile,12,.014,8,false),material(id==='pip'?'#f7e7ff':'#4c5454'),face).name='smile';
 }
 const prop=new THREE.Group();root.add(prop);
 if(id==='creative'){
  const hatMat=material('#e3bc67',{roughness:.48});orb(prop,hatMat,0,.96,0,.91,.16,.67);prop.rotation.z=.16;orb(prop,hatMat,.1,1.14,0,.07,.13,.07);
 }
 if(id==='tech'){
  rod(prop,material('#bb8c49'),[0,.81,0],[0,1.2,0],.04);orb(prop,material('#ffe2a0',{emissive:'#e2aa4e',emissiveIntensity:.12}),0,1.28,0,.12);
 }
 if(id==='auditor'){
  // An open magnifying glass leaves both eyes and the smile readable.
  const trim=material('#739b91',{metalness:.25,roughness:.3});
  const gold=material('#d7bb7c',{metalness:.4,roughness:.3});
  const lens=new THREE.Group();lens.name='focus-barrel';lens.position.set(.34,.05,.9);prop.add(lens);
  mesh(new THREE.TorusGeometry(.34,.035,16,64),gold,lens);
  orb(lens,material('#d7fff4',{transparent:true,opacity:.1,roughness:.1,depthWrite:false}),0,0,0,.305,.305,.035);
  rod(lens,gold,[.24,-.24,0],[.47,-.58,0],.045);
  const glint=new THREE.CatmullRomCurve3([new THREE.Vector3(-.24,.04,.04),new THREE.Vector3(-.21,.16,.04),new THREE.Vector3(-.12,.23,.04)]);
  mesh(new THREE.TubeGeometry(glint,16,.012,8,false),material('#effff7',{transparent:true,opacity:.65}),lens);



 }
 if(id!=='pip')for(const x of [-.43,.43])orb(root,material(palette[id][1]),x,-.89,.08,.23,.13,.3);
 const desk=deskModel(id);scene.add(desk.group);
 scene.add(new THREE.HemisphereLight('#eef9ff','#64715a',.8));
 const key=new THREE.DirectionalLight('#fff4e2',1.4);key.position.set(-3,4,5);key.castShadow=true;key.shadow.mapSize.set(512,512);Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.1,far:15});key.shadow.bias=-.0004;key.shadow.normalBias=.025;scene.add(key);
 const rim=new THREE.DirectionalLight('#b9cfff',1);rim.position.set(3,2,-3);scene.add(rim);
 const camera=new THREE.PerspectiveCamera(32,1,.1,30);camera.position.set(0,.22,5.3);camera.lookAt(0,.12,0);
 return {scene,root,eyes,prop,face,desk,camera,id,hover:0,lookX:0,lookY:0,time:0,greeting:10,engaged:false,phase:Object.keys(palette).indexOf(id)*2.37};
}
function destroy(){
 if(!active)return;
 cancelAnimationFrame(raf);active.events.abort();active.observer.disconnect();active.renderer.dispose();active.env.dispose();
 for(const model of active.models.values())model.scene.traverse(o=>{o.geometry?.dispose();o.shadow?.map?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});
 active.canvas.remove();active.room.classList.remove('has-models');active=null;
}
function mount(){
 const content=document.querySelector('#content');const room=document.querySelector('.iq-room')||(content?.querySelector('.sculpt')?content:null);if(active?.room===room&&active?.canvas.isConnected)return;destroy();if(!room)return;
 let renderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return;}
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.autoClear=false;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
 const pmrem=new THREE.PMREMGenerator(renderer),environment=new RoomEnvironment(),target=pmrem.fromScene(environment,.04);environment.dispose();pmrem.dispose();
 const canvas=renderer.domElement;canvas.className='agent-model-canvas';canvas.setAttribute('aria-hidden','true');room.prepend(canvas);
 const models=new Map(Object.keys(palette).map(id=>[id,character(id,target.texture)]));
 const observer=new ResizeObserver(()=>{if(active){active.width=0;}});observer.observe(room);
 const events=new AbortController(),pointer={x:0,y:0,inside:false};
 room.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer.x=e.clientX;pointer.y=e.clientY;pointer.inside=true;},{passive:true,signal:events.signal});
 const release=()=>{pointer.inside=false;};
 room.addEventListener('pointerleave',release,{signal:events.signal});
 room.addEventListener('pointercancel',release,{signal:events.signal});
 window.addEventListener('blur',release,{signal:events.signal});
 window.addEventListener('scroll',release,{passive:true,capture:true,signal:events.signal});
 active={renderer,canvas,room,models,observer,events,pointer,env:target,width:0,height:0};
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();room.classList.remove('has-models');cancelAnimationFrame(raf);});
 canvas.addEventListener('webglcontextrestored',()=>{destroy();mount();});
 room.classList.add('has-models');last=0;raf=requestAnimationFrame(frame);
}
function frame(now){
 if(!active)return;raf=requestAnimationFrame(frame);
 if(document.hidden||active.room.closest('[hidden]')||now-last<16)return;
 const dt=Math.min((now-last)/1000||.033,.05);last=now;
 const {renderer,room,models}=active,b=room.getBoundingClientRect();
 if(b.bottom<0||b.top>innerHeight||b.width===0)return;
 if(active.width!==b.width||active.height!==b.height){renderer.setSize(b.width,b.height,false);active.width=b.width;active.height=b.height;}
 renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
 for(const [id,m] of models){
  const station=room.querySelector(`[data-role="${id}"]`),portrait=station?.querySelector('.sculpt')||room.querySelector(`.sculpt[data-agent="${id}"]`);if(!portrait)continue;
  const pr=portrait.getBoundingClientRect(),label=station?.querySelector('.iq-station-name')?.getBoundingClientRect();
  const r=station?{left:station.getBoundingClientRect().left-8,top:pr.top+6,width:station.getBoundingClientRect().width+16,height:label.top-pr.top-4}:pr;
  m.desk.group.visible=!!station;
  m.camera.position.set(0,station?2.4:.22,station?7.3:5.3);m.camera.lookAt(0,station?-.02:.12,0);
  const quiet=reduced.matches,mood=(station||portrait).dataset.mood,working=mood==='working'&&!quiet;
  // All companions loop independently, with gentle phase offsets and slower gestures.
  if(!quiet)m.time+=dt;
  const turnAge=((m.time+m.phase*.35)%5.8)/1.6;
  const engaged=!quiet&&turnAge>=0&&turnAge<2.5;
  m.greeting=engaged?turnAge:10;
  const t=m.time+m.phase,smooth=1-Math.exp(-dt*5);
  const expression=engaged?Math.sin(Math.PI*turnAge/2.5)**2:0;
  m.hover+=(expression-m.hover)*smooth;
  const pointer=active.pointer,dx=(pointer.x-(pr.left+pr.width/2)),dy=(pointer.y-(pr.top+pr.height*.4));
  const attention=pointer.inside&&!quiet?Math.max(0,1-Math.hypot(dx,dy)/320):0;
  const tx=THREE.MathUtils.clamp(dx/150,-1,1)*attention,ty=THREE.MathUtils.clamp(dy/130,-1,1)*attention;
  m.lookX+=(tx-m.lookX)*smooth;m.lookY+=(ty-m.lookY)*smooth;
  const greet=!quiet&&m.greeting<1.2?Math.sin(Math.PI*m.greeting/1.2)**2:0;
  const breath=quiet?0:Math.sin(t*1.45)*.012;
  const idle=expression;
  const size=station?1.08:1;
  m.root.scale.set(size*(1-breath*.35),size*(1+breath),size*(1-breath*.35));
  m.root.position.set(id==='pip'&&!quiet?Math.sin(t*.75)*.035:0,(station?.17:0)+(quiet?0:id==='pip'?Math.sin(t*1.45)*.055:Math.sin(t*1.45)*.008)+greet*.022,station?-.25:0);
  m.root.rotation.set(m.lookY*.09+(id==='programmer'?idle*.055:0),m.lookX*.2+(quiet?0:Math.sin(t*.45)*.018)+(working?Math.sin(t*2)*.055:0),(id==='pip'&&!quiet?Math.sin(t*.85)*.035:0)+(id==='chief'?-idle*.055:0)-greet*.025);
  const blinkTime=t%5.1;
  // A soft punctuation blink after each companion finishes its gesture.
  const afterGesture=!quiet&&turnAge>=2.32&&turnAge<2.64?Math.sin(Math.PI*(turnAge-2.32)/.32)**2:0;
  const naturalBlink=!quiet&&!engaged&&afterGesture===0&&blinkTime<.24?Math.sin(Math.PI*blinkTime/.24)**2:0;
  const closure=Math.max(afterGesture,naturalBlink),blink=1-.94*closure;
  m.eyes.scale.y=blink*(1-m.hover*.12);m.eyes.position.set(m.lookX*.055,-m.lookY*.035,0);
  m.face.rotation.z=id==='pip'?.28:id==='chief'?-idle*.025:0;
  const smile=m.face.getObjectByName('smile');if(smile)smile.scale.set(1+m.hover*.25+greet*.1,1+m.hover*.3,1);
  m.desk.props.position.y=.25+(working?Math.sin(t*2.5)*.018:0);
  // Each desk follows its companion's repeating gesture, with soft settles.
  for(const part of m.desk.reactions){
   const o=part.object,h=quiet?0:m.hover,age=m.greeting-part.index*.16;
   const pulse=!quiet&&age>0&&age<1.5?Math.sin(Math.PI*age/1.5)**2:0;
   o.position.copy(part.position);o.rotation.copy(part.rotation);
   if(part.kind==='card'){
    const u=THREE.MathUtils.clamp(age/1.6,0,1),flip=!quiet&&age>0&&age<1.6?(u*u*u*(u*(u*6-15)+10))*Math.PI*2:0;
    o.rotation.y+=flip+(part.index?1:-1)*h*.09;o.position.y+=pulse*.16;
   }
   if(part.kind==='swatch'){o.rotation.y+=(part.index-1)*h*.48;o.position.x+=(part.index-1)*h*.14;o.position.y+=h*.11+part.index*h*.045;}
   if(part.kind==='book'){o.rotation.z+=h*.95;}
   if(part.kind==='pencil'){o.position.x+=h*.25;o.position.y+=h*.13;o.position.z+=Math.sin(age*5)*pulse*.045;o.rotation.z-=h*.25;}
   if(part.kind==='checkmark'){o.position.y+=pulse*.1;o.scale.setScalar(1+pulse*.25);}
   if(part.kind==='note'){o.position.y+=h*.2;o.rotation.y-=h*.16;o.rotation.x-=h*.22;}
   if(part.kind==='block'){o.position.y+=pulse*.22;o.rotation.y+=(part.index?1:-1)*h*.28;}
   if(part.kind==='connector'){o.material.emissive.set('#b79552');o.material.emissiveIntensity=pulse*.32;o.position.y+=pulse*.16;}
   if(part.kind==='monitor'){o.rotation.y-=h*.15;o.rotation.x-=h*.09;o.position.y+=h*.045;}
   if(part.kind==='key'){o.position.y-=pulse*.025;}
   if(part.kind==='lens'){o.position.x-=h*.75;o.position.z+=h*.09;o.position.y+=h*.14;o.rotation.z+=h*.18;}
  }
  m.desk.light.material.emissiveIntensity=working?.5+Math.sin(t*3)*.3:mood==='ready'?.6:.05;
  const dc=m.desk.props.getObjectByName('desk-cursor');if(dc)dc.visible=quiet||!(working||m.hover>.15)||Math.sin(t*(working?7:4))>0;
  m.prop.position.set(0,0,0);m.prop.rotation.set(0,0,0);
  if(id==='creative'){const tip=Math.max(idle,greet*.8);m.prop.rotation.z=.16-tip*.18;m.prop.rotation.x=tip*.09;m.prop.position.y=tip*.055;}
  if(id==='tech'){m.prop.rotation.z=quiet?0:Math.sin(t*2.5)*(.008+idle*.025);}
  if(id==='auditor'){
   const pulse=(start,duration)=>engaged&&turnAge>start&&turnAge<start+duration?Math.sin(Math.PI*(turnAge-start)/duration)**2:0;
   const focus=pulse(.05,.85),inspect=pulse(.65,1.25),nod=pulse(1.65,.65);
   const lens=m.prop.getObjectByName('focus-barrel');
   lens.position.set(.34+m.lookX*.035,.05-m.lookY*.025,.9+focus*.07);
   lens.rotation.set(m.lookY*.055,m.lookX*.075,focus*.09);
   m.root.rotation.x+=inspect*.17+nod*.16;m.root.rotation.y-=inspect*.12;
   m.root.position.y-=inspect*.035+nod*.025;
  }
  if(id==='programmer'){const cursor=m.eyes.getObjectByName('cursor');if(cursor)cursor.visible=quiet||Math.sin(t*(working?7:2.3))>-.55;}
  const x=r.left-b.left,y=b.height-(r.top-b.top)-r.height;
  renderer.setViewport(x,y,r.width,r.height);renderer.setScissor(x,y,r.width,r.height);m.camera.aspect=r.width/r.height;m.camera.updateProjectionMatrix();renderer.render(m.scene,m.camera);
 }
}
new MutationObserver(mount).observe(document.querySelector('#content'),{childList:true});
document.addEventListener('visibilitychange',()=>{last=0;});
mount();
