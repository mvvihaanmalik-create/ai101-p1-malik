from pathlib import Path
p=Path('src/desert-arrival.js');s=p.read_text(encoding='utf-8')
def edit(old,new):
 global s
 assert old in s,old
 s=s.replace(old,new)
edit("import {rigNightCar}","import {clone} from 'three/addons/utils/SkeletonUtils.js';\nimport {createWelcomeCandle} from './welcome-candle.js';\nimport {RECEPTION_AT} from './opening-cue.js';\nimport {rigNightCar}")
edit('export const ROAD_DURATION=53;','export const ROAD_DURATION=RECEPTION_AT;\nconst HOTEL_SHIFT=new THREE.Vector3(-69,0,-119);')
edit('const roadCuts=[[0,-8],[10,0],[16,3.85],[20,6.48],[31,14.45],[39,19.25],[44,20.8],[53,28.35]];', 'const roadCuts=[[0,-20],[7,-13],[13,-7],[18,-2],[21,1.6],[23.2,3.85],[24,6.48],[32.6,14.45],[35.7,18.0],[36.3,20.8],[44.5,28.35]];')
edit('380,.2,380','780,.2,780');edit('7.4,.09,220','7.4,.09,620');edit('z=-83;z<85','z=-290;z<290')
edit('ridge(-76,18,0x584859);ridge(-59,10,0x503e4d);','ridge(-265,28,0x584859);ridge(-240,19,0x503e4d);')
edit('const hotel=new THREE.Group();hotel.position.set(-17,0,-14);staticSet.add(hotel);','const hotelSet=new THREE.Group();hotelSet.position.copy(HOTEL_SHIFT);staticSet.add(hotelSet);\n const hotel=new THREE.Group();hotel.position.set(-17,0,-14);hotelSet.add(hotel);')
edit('entryDoor.position.set(-18.06,0,-13.77);','entryDoor.position.set(-18.06,0,-13.77).add(HOTEL_SHIFT);')
edit('rod(staticSet,bark,pt(i/6),pt((i+1)/6)', 'rod(hotelSet,bark,pt(i/6),pt((i+1)/6)')
edit('leaf.side=THREE.DoubleSide;staticSet.add(new THREE.Mesh(g,leaf));','leaf.side=THREE.DoubleSide;hotelSet.add(new THREE.Mesh(g,leaf));')
edit('bake(staticSet);return {entryDoor,handle,grip};', '''const roadside=new THREE.Group();roadside.position.set(-8,0,48);staticSet.add(roadside);
 for(const x of [-1.4,1.4])box(roadside,metal,x,1.31,0,.07,2.62,.07);
 box(roadside,new THREE.MeshBasicMaterial({map:signMap}),0,2.18,0,3.25,.53,.06);
 const distanceMap=canvasTexture(768,128,ctx=>{ctx.fillStyle='#141719';ctx.fillRect(0,0,768,128);ctx.font='bold 64px Georgia';ctx.textAlign='center';ctx.fillStyle='#d5c4a1';ctx.fillText('0.1 MILE   ←',384,84);});
 box(roadside,new THREE.MeshBasicMaterial({map:distanceMap}),0,1.73,.01,3.25,.43,.07);
 bake(staticSet);return {entryDoor,handle,grip};''')
edit('new THREE.SphereGeometry(177,32,16)','new THREE.SphereGeometry(580,32,16)')
edit('createDesertArrival(guestData,carData,driverTake)','createDesertArrival(guestData,carData,driverTake,deskData)')
edit('PerspectiveCamera(40,16/9,.05,250)','PerspectiveCamera(40,16/9,.05,700)')
edit('FogExp2(0x101728,.013)','FogExp2(0x070b13,.0026)')
edit('porch.position.set(-18.39,2.02,-13.30);','porch.position.set(-18.39,2.02,-13.30).add(HOTEL_SHIFT);')
edit('for(let i=0;i<15;i++)','for(let i=0;i<28;i++)')
edit('createRoadDriver(guestData,driverTake);','createRoadDriver(guestData,driverTake,HOTEL_SHIFT);')
edit("let shot='highway';\n function frame(time){",'''const lady=new THREE.Group(),ladyModel=clone(deskData.scene);lady.add(ladyModel);scene.add(lady);lady.rotation.y=Math.PI;
 ladyModel.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.material=o.material.clone();if(o.material.transparent){o.material.alphaTest=.35;o.material.transparent=false;}}});
 const ladyMixer=new THREE.AnimationMixer(ladyModel);ladyMixer.clipAction(deskData.animations.find(a=>a.name==='Idle')).play();ladyMixer.update(0);
 const candle=createWelcomeCandle(scene,lady,ladyModel);
 const doorwayFill=new THREE.PointLight(0xffb984,4,4);doorwayFill.position.set(-17.5,2.0,-11.9).add(HOTEL_SHIFT);scene.add(doorwayFill);
 let shot='highway',smokeLevel=0;
 function frame(time,dt=0,clock=0){''')
edit('const age=(time*.43+i/smoke.length)%1,s=smoke[i];','const age=THREE.MathUtils.euclideanModulo(clock*.43+i/smoke.length,1),s=smoke[i];')
edit('const size=.20+age*1.04;', 'const size=.24+age*(time>2.12?1.72:1.15);')
edit('s.material.opacity=.31*Math.sin(Math.PI*age)*smooth(time,2.25,3.65);', 'smokeLevel=.24*smooth(clock,11.2,15.8)+.45*smooth(clock,22.0,24.0);s.material.opacity=smokeLevel*Math.sin(Math.PI*age);')
edit('camera.updateProjectionMatrix();\n  return step;', '''// Later shots use the real hotel position, about 160 metres from the car.
  if(time>=20.8){camera.position.add(HOTEL_SHIFT);camera.lookAt(vector(-17.4,2.03-smooth(time,20.8,28.25)*.40,-13.80).add(HOTEL_SHIFT));}
  if(clock<18){
   shot=clock<13?'night-drive':'engine-smoke';
   camera.position.set(-3.85,1.30,car.position.z+.15);camera.lookAt(-4.1,1.08,car.position.z-32);camera.fov=49;
   camera.rotateZ(.0015*Math.sin(clock*7));
   if(clock>=15.5){shot='roadside-sign';camera.position.set(-4.9,1.47,car.position.z+.5);camera.lookAt(-8,2.0,48);camera.fov=48;}
  }else if(clock<23.2){
   shot='distant-hotel';camera.position.set(-6.9,1.55,car.position.z+1.6);camera.lookAt(vector(-17,5.7,-14).add(HOTEL_SHIFT));camera.fov=39;
  }else if(clock>=32.6&&clock<33.35){
   shot='desert-crossing';camera.position.set(-13.0,2.4,12);camera.lookAt(vector(-17,4.5,-14).add(HOTEL_SHIFT));camera.fov=42;
  }else if(clock>=33.35&&clock<36.3){
   shot='woman-in-doorway';camera.position.copy(vector(-18.7,1.6,-8.35).add(HOTEL_SHIFT));camera.lookAt(vector(-17.4,1.40,-13.4).add(HOTEL_SHIFT));camera.fov=36;
  }
  lady.visible=clock>=33.25&&clock<42.5;
  lady.position.copy(vector(-17.45-.95*smooth(clock,36.0,38.7),.02,-13.45).add(HOTEL_SHIFT));
  candle.restore();ladyMixer.update(dt);candle.pose(clock,lady.visible);
  if(clock>=40.2&&clock<42.25){
   shot='threshold-thought';camera.position.copy(driver.root.position).add(vector(-1.35,1.67,-1.45));camera.lookAt(driver.root.position.clone().add(vector(0,1.56,0)));camera.fov=43;
  }
  camera.updateProjectionMatrix();
  return step;''')
edit('get shot(){return shot;}};', 'get shot(){return shot;},snapshot(){return {shot,smokeLevel:+smokeLevel.toFixed(3),hotelDistance:+Math.hypot(81.9,139).toFixed(2),driver:driver.root.position.toArray(),candle:candle.snapshot()};}};')
p.write_text(s,encoding='utf-8')
p=Path('src/road-driver.js');s=p.read_text(encoding='utf-8').replace('createRoadDriver(guestData,take){','createRoadDriver(guestData,take,hotelShift=new THREE.Vector3()){')
s=s.replace('handleStop=vec(-17.37,0,-13.13),inside=vec(-17.54,0,-15.32);','handleStop=vec(-17.37,0,-13.13).add(hotelShift),inside=vec(-17.54,0,-15.32).add(hotelShift);')
p.write_text(s,encoding='utf-8')
