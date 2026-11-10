import {readFile} from 'node:fs/promises';
const base=process.argv[2]||'http://127.0.0.1:4170/';
const files=['src/ending-timeline.js','src/reception-ending.js','assets/ending-v6.json','assets/butler-skeleton-v6.glb','assets/masters-v18/ending-butler-v6.webp','assets/masters-v18/ending-surround-v6.webp','index.html','src/main.js','src/style.css','assets/hotel-v15.json','assets/hotel-occlusion-v3.glb','assets/guest-v8.glb','assets/butler-v3.glb','src/benchmark.js','assets/occlusion.glb','vendor/three/three.module.js','vendor/three/three.core.js','vendor/three/addons/loaders/GLTFLoader.js','vendor/three/addons/utils/BufferGeometryUtils.js','vendor/three/addons/utils/SkeletonUtils.js'];
files.push('src/night-route.js','assets/porcelain-v15.glb','src/character-encounters.js','src/encounter-catalogue.js','assets/child-v5.glb','assets/attendant-v5.glb','assets/porter-v5.glb','assets/encounter-props-v5.glb','vendor/three/addons/geometries/RoundedBoxGeometry.js','src/passage-loop.js','src/encounter-art.js','assets/textures/carpet.png');
for(const file of files){const res=await fetch(base+file,{method:'HEAD'});if(!res.ok)throw Error(`${file}: ${res.status}`);console.log(`${res.status} ${file}`);}
const meta=JSON.parse(await readFile(new URL('../assets/hotel-v15.json',import.meta.url)));
if(meta.width/meta.height!==16/9||meta.cameras.length!==23)throw Error('Camera plate mismatch');
for(const c of meta.cameras)if(c.fov<20||c.fov>65||c.position.length!==3||c.target.length!==3)throw Error('Invalid camera');
const plates=new Set([...meta.cameras.map(c=>c.plate),...Object.values(meta.variants).flatMap(v=>Object.values(v))]);
if(plates.size!==36||Object.keys(meta.details).length!==14)throw Error('Expected 36 plates and fourteen detail views');
for(const plate of plates)for(const tier of ['masters-v18','proxies-v18']){const response=await fetch(base+'assets/'+tier+'/'+plate,{method:'HEAD'});if(!response.ok)throw Error('Missing plate '+plate);}
if(Object.keys(meta.rooms).length!==6)throw Error('Expected six locations');
console.log('Runtime routes, 23 matched cameras, 36 plates and six locations passed.');
for(const name of ['guest','butler','child','attendant','porter']){
 const revision=name==='guest'?8:name==='butler'?3:5;
 const buffer=await readFile(new URL(`../assets/${name}-v${revision}.glb`,import.meta.url));
 const gltf=JSON.parse(buffer.toString('utf8',20,20+buffer.readUInt32LE(12)));
 if(gltf.skins?.length!==1||gltf.skins[0].joints.length!==53)throw Error(`${name}: expected weighted 53-bone rig`);
 for(const clip of (name==='guest'?['Idle','Walk','WalkBack','StepLeft','StepRight','Raise']:['Idle','Walk','Raise']))if(!gltf.animations?.some(a=>a.name===clip&&a.channels.length>0))throw Error(`${name}: missing ${clip} animation`);
 if(!gltf.meshes.some(m=>m.primitives.some(p=>p.attributes.JOINTS_0!==undefined&&p.attributes.WEIGHTS_0!==undefined)))throw Error(`${name}: missing skin weights`);
 console.log(`${name}: ${gltf.meshes.length} meshes, 53 bones, ${gltf.animations.length} animation clips, ${(buffer.length/1e6).toFixed(2)} MB`);
}

const propsBuffer=await readFile(new URL('../assets/encounter-props-v5.glb',import.meta.url));
const props=JSON.parse(propsBuffer.toString('utf8',20,20+propsBuffer.readUInt32LE(12)));
for(const name of ['DogStand','DogSit','DogStandHead','DogSitHead','Coat','EmptyCoat'])if(!props.nodes.some(n=>n.name===name))throw Error('Missing prop '+name);
console.log('Original dog stand/sit silhouettes, articulated heads and adapted empty coat passed.');
const dogBuffer=await readFile(new URL('../assets/dog-v14.glb',import.meta.url));
const dog=JSON.parse(dogBuffer.toString('utf8',20,20+dogBuffer.readUInt32LE(12)));
for(const name of ['DogStand','DogSit','DEF-head'])if(!dog.nodes.some(n=>n.name===name))throw Error('Missing replacement dog node '+name);
if(!dog.skins?.length||!dog.images?.length)throw Error('Replacement dog lost rig/textures');
if(dogBuffer.length>2_000_000)throw Error('Replacement dog exceeds 2 MB budget');
console.log('Replacement dog: textured weighted mesh, standing/sitting silhouettes, head bone and <2 MB passed.');

const finale=JSON.parse(await readFile(new URL('../assets/ending-v6.json',import.meta.url)));
if(finale.shots.length!==2||finale.shots.some(s=>s.position.length!==3||s.target.length!==3||s.fov<15||s.fov>65))throw Error('Invalid ending cameras');
const skel=await readFile(new URL('../assets/butler-skeleton-v6.glb',import.meta.url));
const skeleton=JSON.parse(skel.toString('utf8',20,20+skel.readUInt32LE(12)));
if(skeleton.skins?.[0]?.joints.length!==53||!skeleton.animations.some(a=>a.name==='Idle'))throw Error('Ending skeleton is not rigged');
if(!skeleton.materials.some(m=>m.name==='Unlit bone cavities'))throw Error('Missing dark socket material');
console.log('Ending: two matched reception shots and weighted 53-bone anatomical skeleton passed.');
