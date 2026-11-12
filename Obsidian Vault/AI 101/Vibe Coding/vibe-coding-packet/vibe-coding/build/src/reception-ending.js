import {renderPlate,lightHotelMaterials} from './visual-finish.js';
import * as THREE from 'three';
import {createProcession} from './ending-procession.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {createCharacterEncounters} from './character-encounters.js';
import {endingFrame,ENDING_DURATION,STRIKE_AT} from './ending-timeline.js';

export async function createReceptionEnding({renderer,loader,tex,models,reception,plate,reducedMotion,onBeat}){
 const meta=await (await fetch('assets/ending-v6.json')).json();
 const [skeleton,...textures]=await Promise.all([loader.loadAsync('assets/butler-skeleton-v6.glb'),...meta.shots.map(s=>tex.loadAsync('assets/proxies-v31/'+s.plate))]);
 textures.forEach((t,i)=>{t.userData.masterPlate=meta.shots[i].plate;t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.repeat.setScalar(1/1.18);t.offset.setScalar((1-1/1.18)/2);t.updateMatrix();});
 const shots=[reception,...meta.shots],plates=[plate,...textures],scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,16/9,.05,80);camera.zoom=1.18;
 lightHotelMaterials(scene,.16);
 scene.add(new THREE.HemisphereLight(0x97b2ac,0x2c1522,.50));
 const warm=new THREE.PointLight(0xff8f48,15,10,2);warm.position.set(30.7,2.5,-6);scene.add(warm);
 const cold=new THREE.DirectionalLight(0x9dbebc,.6);cold.position.set(27.4,3.7,-9.4);cold.target.position.set(30,1.3,-5.5);scene.add(cold,cold.target);
 const key=new THREE.PointLight(0xe5ead1,0,7,2);key.position.set(30.96,2.09,-7.10);scene.add(key);
 const guest=clone(models.guest.scene);scene.add(guest);guest.position.set(29.55,.02,-3);
 const crowd=createCharacterEncounters(scene,{adult:models.guest,child:models.child,props:models.props,dog:models.dog,staff:models.staff,porter:models.porter});
 const procession=createProcession(scene,crowd,models,skeleton,onBeat,reducedMotion);
 const voidColor=new THREE.Color(0x120b0e);
 const curtainCanvas=document.createElement('canvas');curtainCanvas.width=768;curtainCanvas.height=384;
 const context=curtainCanvas.getContext('2d');
 for(let x=0;x<768;x++){
  const fold=.5+.5*Math.cos(x*.094+1.3*Math.sin(x*.031));const velvet=fold*fold*(.4+.57*Math.exp(-((x-378)**2)/84000));
  const gradient=context.createLinearGradient(0,0,0,384);
  gradient.addColorStop(0,'rgb('+Math.round(32+58*velvet)+',12,19)');
  gradient.addColorStop(.74,'rgb('+Math.round(18+46*velvet)+',8,14)');
  gradient.addColorStop(1,'#110b0e');context.fillStyle=gradient;context.fillRect(x,0,1,384);
 }
 const curtain=new THREE.CanvasTexture(curtainCanvas);curtain.colorSpace=THREE.SRGBColorSpace;
 const faceLight=new THREE.PointLight(0xffdfbe,0,12,2),rim=new THREE.DirectionalLight(0x9ab9cc,.83);
 rim.position.set(30,3,1);rim.target.position.set(30,1,-4);scene.add(faceLight,rim,rim.target);
 // A depth-only counter keeps the same reception geometry registered in both front shots.
 const desk=new THREE.Mesh(new THREE.BoxGeometry(2.85,1.24,.98),new THREE.MeshBasicMaterial({colorWrite:false}));desk.position.set(31.5,.62,-6.9);desk.renderOrder=-2;scene.add(desk);
 const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true,samples:Math.min(2,renderer.capabilities.maxSamples)});
 const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const post=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{image:{value:target.texture},pixel:{value:new THREE.Vector2(1/1280,1/720)},blur:{value:0},glow:{value:0},fade:{value:0}},vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
  uniform sampler2D image;uniform vec2 pixel;uniform float blur,glow,fade;varying vec2 uv0;
  void main(){
   vec3 c=texture2D(image,uv0).rgb;vec3 halo=vec3(0.);vec3 soft=vec3(0.);
   vec2 radius=pixel*(1.+blur*1.8);
   soft=(texture2D(image,uv0+radius).rgb+texture2D(image,uv0-radius).rgb+
    texture2D(image,uv0+vec2(radius.x,-radius.y)).rgb+texture2D(image,uv0+vec2(-radius.x,radius.y)).rgb)*.25;
   halo=max(soft-.49,vec3(0.));
   c+=clamp(c-soft,vec3(-.025),vec3(.025))*.43*(1.-clamp(blur,0.,1.));
   c=mix(c,soft,clamp(blur,0.,1.))+halo*glow;
   float edge=1.-smoothstep(.19,.85,length((uv0-.5)*vec2(1.,.8)));c*=mix(.57,1.,edge);c*=1.-fade;
   gl_FragColor=vec4(c,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
 postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),post));
 const size=new THREE.Vector2(),anchor=new THREE.Vector3(),aim=new THREE.Vector3();
 let active=false,time=0,lastPhase='',held=false,frame=endingFrame(0),drawStats={},view='';
 function frameActor(p,height,side,above,distance,fov){
  p.getWorldPosition(anchor);anchor.y+=height;
  camera.position.copy(anchor);camera.position.x+=side;camera.position.y+=above;camera.position.z-=distance;
  camera.lookAt(anchor);camera.fov=fov;
 }
 function update(dt,clock){
  if(!active)return;
  if(!held)time=Math.min(ENDING_DURATION,clock??(time+dt));
  frame=endingFrame(time);
  if(frame.phase!==lastPhase){lastPhase=frame.phase;onBeat?.(frame.phase);}
  const shot=frame.shot,wide=shot===2,close=shot===3;
  procession.tick(time,shot);
  guest.visible=shot===0;desk.visible=shot<2;
  const registered=shots[close?1:shot];
  camera.position.fromArray(registered.position);camera.lookAt(aim.fromArray(registered.target));
  camera.fov=registered.fov;camera.zoom=1.18;
  scene.background=plates[close?1:shot];view=['desk','receptionist','assembly','last look'][shot];
  if(wide){
   camera.zoom=1.12;
   if(time<15.1){camera.zoom=1.32;const background=plates[2];
    background.repeat.setScalar(1/camera.zoom);background.offset.setScalar((1-1/camera.zoom)/2);background.updateMatrix();}
   // Start with the whole room before cutting in along the same side of the procession.
   if(time>=15.1&&time<17.22){view='under the cloche';procession.isolate([procession.attendant]);frameActor(procession.attendant.holder,1.21,.25,.20,1.85,40);}
   else if(time>=17.22&&time<19.43){view='last pour';procession.isolate([procession.bartender]);frameActor(procession.bartender.holder,1.54,-.25,.11,1.41,32);}
   else if(time>=19.43&&time<21.97){
    view='the plaything';procession.isolate([procession.kid,procession.hound]);frameActor(procession.kid.holder,.68,.57,.15,2.23,44);
    aim.copy(anchor);aim.x+=.38;camera.lookAt(aim);
    if(time>=20.98){view='the hound';frameActor(procession.hound,.54,-.23,.11,1.62,35);}
   }else if(time>=21.97){view='the bell';procession.isolate([procession.butler]);frameActor(procession.butler.holder,1.50,-.35,.06,1.61,40);}
   if(view!=='assembly')scene.background=curtain;
  }
  if(close){
   procession.lady.head.getWorldPosition(anchor);anchor.y+=.073;anchor.z+=.064;
   camera.position.copy(anchor);camera.position.z+=reducedMotion?.75:.57-.058*THREE.MathUtils.smoothstep(time,STRIKE_AT,STRIKE_AT+.30);
   camera.position.x+=.072;camera.position.y-=.041;camera.lookAt(anchor);camera.rotateZ(-.047);
   camera.fov=34;scene.background=voidColor;
  }
  camera.updateProjectionMatrix();
  scene.backgroundIntensity=wide?(view==='assembly'?.33:.64):frame.darkness;
  warm.intensity=shot===0?14:shot===1?6:1.3;
  cold.intensity=wide?.95:.5;
  key.color.setHex(0xaad4c9);key.position.set(31,2.1,-7.12);key.intensity=shot===1?1.35:.35;
  faceLight.position.copy(camera.position);faceLight.position.x-=.48;faceLight.position.y+=.62;
  faceLight.intensity=wide?(view==='assembly'?24:3.8):close?.77:1.8;
  post.uniforms.blur.value=reducedMotion?0:frame.blur*.25;
  post.uniforms.glow.value=wide?.14:.12*frame.reveal;post.uniforms.fade.value=frame.blackout;
  if(close&&reducedMotion)post.uniforms.fade.value=Math.max(frame.blackout,.8*(1-THREE.MathUtils.smoothstep(time,STRIKE_AT,STRIKE_AT+.48)));
 }
 function render(){
  renderer.getDrawingBufferSize(size);size.multiplyScalar(Math.min(1,2304/size.x)).floor();if(target.width!==size.x||target.height!==size.y){target.setSize(size.x,size.y);post.uniforms.pixel.value.set(1/size.x,1/size.y);}
  renderer.setRenderTarget(target);renderPlate(renderer,scene,camera);drawStats={triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls};renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
 }
 function start(at=0){active=true;procession.reset();time=at;lastPhase='';held=false;update(0);}
 function stop(){active=false;held=false;time=0;lastPhase='';}
 function hold(value){held=value;}
 function snapshot(){return {time:+time.toFixed(2),phase:frame.phase,shot:frame.shot,reveal:+frame.reveal.toFixed(3),approach:+frame.approach.toFixed(3),complete:frame.complete,held,view,deskSkeleton:procession.ladySkull(),cast:frame.shot===2?9:frame.shot===3?1:2,...drawStats};}
 // Compile real ending materials without starting or scoring the ending.
 renderer.setRenderTarget(target);for(const t of [3,18,11,STRIKE_AT]){start(t);await renderer.compileAsync(scene,camera);renderer.render(scene,camera);}renderer.setRenderTarget(null);await renderer.compileAsync(postScene,postCamera);renderer.render(postScene,postCamera);stop();
 return {start,stop,update,render,hold,snapshot,get active(){return active;},get frame(){return frame;}};
}
