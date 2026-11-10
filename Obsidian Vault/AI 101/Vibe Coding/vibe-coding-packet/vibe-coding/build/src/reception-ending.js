import {renderPlate} from './visual-finish.js';
import * as THREE from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {createCharacterEncounters} from './character-encounters.js';
import {endingFrame,ENDING_DURATION} from './ending-timeline.js';

export async function createReceptionEnding({renderer,loader,tex,models,reception,plate,reducedMotion,onBeat}){
 const meta=await (await fetch('assets/ending-v6.json')).json();
 const [skeleton,...textures]=await Promise.all([loader.loadAsync('assets/butler-skeleton-v6.glb'),...meta.shots.map(s=>tex.loadAsync('assets/proxies-v18/'+s.plate))]);
 textures.forEach((t,i)=>{t.userData.masterPlate=meta.shots[i].plate;t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.repeat.setScalar(1/1.18);t.offset.setScalar((1-1/1.18)/2);t.updateMatrix();});
 const shots=[reception,...meta.shots],plates=[plate,...textures],scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,16/9,.05,80);camera.zoom=1.18;
 scene.add(new THREE.HemisphereLight(0xa4c6be,0x201317,.75));
 const warm=new THREE.PointLight(0xff8f48,15,10,2);warm.position.set(30.7,2.5,-6);scene.add(warm);
 const cold=new THREE.DirectionalLight(0x9dbebc,.6);cold.position.set(29,4,-2);scene.add(cold);
 const key=new THREE.PointLight(0xe5ead1,0,7,2);key.position.set(31.3,1.7,-7.5);scene.add(key);
 const actors=[];
 function actor(data,pos,yaw){
  const model=clone(data.scene),root=new THREE.Group();root.add(model);scene.add(root);root.position.fromArray(pos);root.rotation.y=yaw;
  const materials=[];model.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=false;o.castShadow=false;o.material=o.material.clone();o.material.transparent=true;o.material.depthWrite=false;o.material.alphaTest=.02;materials.push(o.material);});
  const mixer=new THREE.AnimationMixer(model),idle=mixer.clipAction(data.animations.find(a=>a.name==='Idle'));idle.play();
  const a={root,model,mixer,materials};actors.push(a);return a;
 }
 const host=actor(models.butler,[31.45,.02,-7.85],Math.PI),bones=actor(skeleton,[31.45,.02,-7.85],Math.PI),guest=actor(models.guest,[29.55,.02,-3],0);
 bones.materials.forEach(m=>{m.userData.cavity=m.name.includes('cavities');m.color.set(m.userData.cavity?0x010302:0x9a9c80);m.emissive.set(m.userData.cavity?0x000000:0xd3d9ba);m.emissiveIntensity=.20;m.roughness=.6;});
 const crowd=createCharacterEncounters(scene,{adult:models.guest,child:models.child,props:models.props,dog:models.dog,staff:models.staff,porter:models.porter});
 const layouts=[['C2',28.0,3.7],['C3',29.6,1.5],['C4',30.7,1.9],['C5',32.0,3.4],['C6',32.0,5.4]];
 const ghostMaterials=[];
 for(const id of layouts.map(x=>x[0]))crowd.roots[id].traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=false;
  if(!o.material.isMeshStandardMaterial)return;o.material=o.material.clone();const m=o.material;
  m.userData.spectralActor=o.isSkinnedMesh||id==='C4';m.emissive.set(0x99c5ae);m.emissiveMap=m.map;m.emissiveIntensity=.20;
  const rim=m.userData.spectralActor?'.12,.28,.20':'.018,.035,.025';
  m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n'+(!m.map?'totalEmissiveRadiance *= diffuseColor.rgb;':'')+'totalEmissiveRadiance += vec3('+rim+')*pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);');};m.customProgramCacheKey=()=>`ending-rim-${m.userData.spectralActor}-${!!m.map}`;ghostMaterials.push(m);
 });
 // A depth-only counter keeps the same reception geometry registered in both front shots.
 const desk=new THREE.Mesh(new THREE.BoxGeometry(2.85,1.24,.98),new THREE.MeshBasicMaterial({colorWrite:false}));desk.position.set(31.5,.62,-6.9);desk.renderOrder=-2;scene.add(desk);
 const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true});
 const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const post=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{image:{value:target.texture},pixel:{value:new THREE.Vector2(1/1280,1/720)},blur:{value:0},glow:{value:0},fade:{value:0}},vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
  uniform sampler2D image;uniform vec2 pixel;uniform float blur,glow,fade;varying vec2 uv0;
  void main(){
   vec3 c=texture2D(image,uv0).rgb;vec3 halo=vec3(0.);vec3 soft=vec3(0.);
   for(int x=-2;x<=2;x++){for(int y=-2;y<=2;y++){
    vec2 d=vec2(float(x),float(y));vec3 b=texture2D(image,uv0+d*pixel*3.).rgb;halo+=max(b-.45,vec3(0.))/25.;
    soft+=texture2D(image,uv0+d*pixel*(1.+blur*2.)).rgb/25.;
   }}
   c=mix(c,soft,clamp(blur,0.,1.));c+=halo*glow;
   float edge=smoothstep(.85,.19,length((uv0-.5)*vec2(1.,.8)));c*=mix(.57,1.,edge);c*=1.-fade;
   gl_FragColor=vec4(c,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
 postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),post));
 const size=new THREE.Vector2(),pivot=new THREE.Vector3(.7,0,-14),axis=new THREE.Vector3(0,1,0);
 let active=false,time=0,lastPhase='',held=false,frame=endingFrame(0),drawStats={};
 function placeCrowd(dt){
  // Author the ordinary encounter choreography first, then place each vignette around the guest.
  for(const [id] of layouts){crowd.roots[id].position.set(0,0,0);crowd.roots[id].rotation.set(0,0,0);}
  for(const [id] of layouts)crowd.update(time,dt,'corridor',{anomaly:id,vignette:id});
  crowd.roots.coat.visible=false;
  for(const [id,x,y] of layouts){
   const root=crowd.roots[id],start=new THREE.Vector3(x,0,-y),center=new THREE.Vector3(30,0,-4.5),dir=center.clone().sub(start).normalize();
   const distance=(id==='C6'?.60:1.20)*frame.approach;start.addScaledVector(dir,distance);
   const yaw=Math.atan2(dir.x,dir.z);root.rotation.y=yaw;root.position.copy(start).sub(pivot.clone().applyAxisAngle(axis,yaw));root.visible=frame.shot===2;
  }
  for(const a of crowd.actors){
   a.idle.setEffectiveWeight(.18);a.walk.setEffectiveWeight(.82);a.walk.time=(frame.approach*1.20/1.07%1)*a.walk.getClip().duration;a.mixer.update(0);
  }
 }
 function update(dt){
  if(!active)return;if(!held)time=Math.min(ENDING_DURATION,time+dt);frame=endingFrame(time);
  if(frame.phase!==lastPhase){lastPhase=frame.phase;onBeat?.(frame.phase);}
  const shot=shots[frame.shot];camera.position.fromArray(shot.position);camera.lookAt(new THREE.Vector3().fromArray(shot.target));camera.fov=shot.fov;camera.updateProjectionMatrix();scene.background=plates[frame.shot];scene.backgroundIntensity=frame.shot===2?.22:frame.darkness;
  host.root.visible=frame.shot<2&&frame.reveal<.999;bones.root.visible=frame.shot===1&&frame.reveal>0;
  for(const m of host.materials){m.opacity=1-frame.reveal;m.depthWrite=frame.reveal===0;}
  for(const m of bones.materials){m.opacity=frame.reveal;m.depthWrite=true;m.emissiveIntensity=.20+(!reducedMotion?.025*Math.sin(time*1.4):0);}
  for(const a of actors)a.mixer.setTime(time);
  warm.intensity=15*(frame.shot===2?.10:frame.darkness);cold.intensity=.6*(frame.shot===2?.7:frame.darkness);key.intensity=frame.reveal*.8;
  guest.root.visible=frame.shot===0;guest.root.position.set(frame.shot===2?30:29.55,.02,frame.shot===2?-4.8:-3);guest.root.rotation.y=frame.shot===2?Math.PI:0;
  for(const m of guest.materials){m.opacity=1;m.transparent=false;m.depthWrite=true;}
  placeCrowd(held?0:dt);ghostMaterials.forEach(m=>m.emissiveIntensity=frame.shot===2?(m.userData.spectralActor?.18+frame.approach*.20:.10):0);
  post.uniforms.blur.value=reducedMotion?0:frame.blur;post.uniforms.glow.value=frame.shot===2?.7:frame.reveal*.65;post.uniforms.fade.value=frame.blackout;
 }
 function render(){
  renderer.getDrawingBufferSize(size);size.multiplyScalar(Math.min(1,1920/size.x)).floor();if(target.width!==size.x||target.height!==size.y){target.setSize(size.x,size.y);post.uniforms.pixel.value.set(1/size.x,1/size.y);}
  renderer.setRenderTarget(target);renderPlate(renderer,scene,camera);drawStats={triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls};renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
 }
 function start(at=0){active=true;time=at;lastPhase='';held=false;update(0);}
 function stop(){active=false;held=false;time=0;lastPhase='';}
 function hold(value){held=value;}
 function snapshot(){return {time:+time.toFixed(2),phase:frame.phase,shot:frame.shot,reveal:+frame.reveal.toFixed(3),approach:+frame.approach.toFixed(3),complete:frame.complete,held,cast:frame.shot===2?7:1,...drawStats};}
 // Compile real ending materials without starting or scoring the ending.
 renderer.setRenderTarget(target);for(const t of [3,18,11]){start(t);await renderer.compileAsync(scene,camera);renderer.render(scene,camera);}renderer.setRenderTarget(null);await renderer.compileAsync(postScene,postCamera);renderer.render(postScene,postCamera);stop();
 return {start,stop,update,render,hold,snapshot,get active(){return active;},get frame(){return frame;}};
}
