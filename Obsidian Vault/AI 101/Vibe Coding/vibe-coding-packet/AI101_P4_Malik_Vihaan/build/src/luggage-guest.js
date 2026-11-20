import * as THREE from 'three';

let agedSkin;
// A separate costume/face treatment on the existing CC0 rig. The bartender's
// source materials and geometry are never changed by this function.
export function ageLuggageGuest(root){
 if(root.userData.olderTraveller)return;
 root.userData.olderTraveller=true;
 let skin,eyes,hair,brows;
 root.traverse(m=>{
  const name=m.material?.name||'';
  if(/skin\.body$/.test(name))skin=m;
  if(/skin\.high-poly$/.test(name))eyes=m;
  if(/skin\.short/.test(name))hair=m;
  if(/eyebrow/.test(name))brows=m;
  if(/elegantsuit/.test(name)){
   m.material=m.material.clone();m.material.color.setHex(0x8e8170);m.material.roughness=.86;
   m.geometry=m.geometry.clone();const p=m.geometry.attributes.position;
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const torso=THREE.MathUtils.smoothstep(y,.87,1.04)*(1-THREE.MathUtils.smoothstep(y,1.49,1.62));
    const center=Math.exp(-((x/.27)**4));
    p.setXYZ(i,x*(1-.22*torso*center),y,z*(1-.16*torso*center));
   }
   p.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();
  }
 });
 if(!skin||!eyes)return;
 if(!agedSkin){agedSkin=new THREE.TextureLoader().load('assets/luggage-guest-aged-skin-v38.webp');agedSkin.colorSpace=THREE.SRGBColorSpace;agedSkin.flipY=false;agedSkin.anisotropy=4;}
 skin.material=skin.material.clone();skin.material.map=agedSkin;skin.material.color.setHex(0xe1d1c2);skin.material.roughness=.88;
 // Preserve the hair's alpha silhouette, replacing only its dark pigment.
 for(const m of [hair,brows].filter(Boolean)){
  m.material=m.material.clone();m.material.color.setHex(0xc3c0b7);
  m.material.onBeforeCompile=shader=>{
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    float strand=dot(diffuseColor.rgb,vec3(.3,.5,.2));
    diffuseColor.rgb=mix(vec3(.21,.23,.23),vec3(.69,.68,.63),clamp(strand*6.,0.,1.));`);
  };m.material.customProgramCacheKey=()=> 'silver-traveller-hair-v38';
 }
 eyes.geometry.computeBoundingBox();const e=eyes.geometry.boundingBox;
 const unit=(e.max.x-e.min.x)/.096,eyeY=(e.min.y+e.max.y)/2,front=e.min.z;
 // Hollow cheeks and longer side/back hair distinguish the older silhouette.
 skin.geometry=skin.geometry.clone();const face=skin.geometry.attributes.position;
 for(let i=0;i<face.count;i++){
  const x=face.getX(i)/unit,y=(face.getY(i)-eyeY)/unit,z=face.getZ(i);
  if(z>front+.065*unit||y<-.17||y>.012)continue;
  const hollow=Math.exp(-(((Math.abs(x)-.048)/.025)**2+((y+.040)/.029)**2));
  face.setXYZ(i,face.getX(i)*(1-.085*hollow),face.getY(i),z+.006*unit*hollow);
 }
 face.needsUpdate=true;skin.geometry.computeVertexNormals();
 if(hair){
  hair.geometry=hair.geometry.clone();const hp=hair.geometry.attributes.position;
  for(let i=0;i<hp.count;i++){
   const x=hp.getX(i)/unit,y=(hp.getY(i)-eyeY)/unit,z=(hp.getZ(i)-front)/unit;
   const back=THREE.MathUtils.smoothstep(z,.034,.105);
   const low=1-THREE.MathUtils.smoothstep(y,-.090,.035);
   hp.setY(i,hp.getY(i)-.17*unit*back*low);
   hp.setX(i,hp.getX(i)*(1+.10*back*low));
  }
  hp.needsUpdate=true;hair.geometry.computeVertexNormals();hair.geometry.computeBoundingSphere();
 }
 // A fitted beard shell keeps the original skin weights. It follows the head
 // and jaw without a rigid prop floating in front of the mouth.
 const geom=skin.geometry.clone(),p=geom.attributes.position,n=geom.attributes.normal;
 geom.setAttribute('beardRoot',p.clone());
 const keep=[],index=geom.index;
 const candidate=i=>{const x=p.getX(i)/unit,y=(p.getY(i)-eyeY)/unit;return Math.abs(x)<.092&&y<-.027&&y>-.17&&p.getZ(i)<front+.074*unit;};
 for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);if(candidate(a)||candidate(b)||candidate(c))keep.push(a,b,c);}
 geom.setIndex(keep);
 for(let i=0;i<p.count;i++)if(candidate(i)){
  const y=(p.getY(i)-eyeY)/unit,chin=Math.exp(-(((y+.119)/.038)**2));
  const depth=(.004+.016*chin)*unit;
  const length=1-THREE.MathUtils.smoothstep(y,-.142,-.082);
  p.setXYZ(i,(p.getX(i)+n.getX(i)*depth)*(1-.18*length),p.getY(i)+n.getY(i)*depth-.080*unit*length,p.getZ(i)+n.getZ(i)*depth-.009*unit*length);
 }
 p.needsUpdate=true;geom.computeVertexNormals();geom.computeBoundingSphere();
 const beardMat=new THREE.MeshStandardMaterial({name:'Traveller silver beard',color:0x979991,roughness:.96,side:THREE.DoubleSide});
 beardMat.onBeforeCompile=shader=>{
  shader.vertexShader='attribute vec3 beardRoot;varying vec3 beardPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nbeardPoint=beardRoot;');
  shader.fragmentShader='varying vec3 beardPoint;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 q=(beardPoint-vec3(0.,${eyeY.toFixed(6)},${front.toFixed(6)}))/${unit.toFixed(6)};
   float edge=-.031-.032*pow(max(0.,1.-abs(q.x)/.068),1.2);
   bool whiskers=abs(q.x)<.034&&q.y<-.046&&q.y>-.066;
   bool lip=abs(q.x)<.029&&q.y<-.064&&q.y>-.083;
   if(q.y>edge&&!whiskers||lip||q.y<-.160||q.z>.072)discard;
   float grain=fract(sin(dot(floor(q.xy*vec2(3000.,270.)),vec2(12.9898,78.233)))*43758.5453);
   diffuseColor.rgb*=mix(.57,1.20,grain);
  `);
 };beardMat.customProgramCacheKey=()=> 'silver-beard-v38';
 const beard=new THREE.SkinnedMesh(geom,beardMat);beard.name='TravellerBeard';beard.bindMode=skin.bindMode;
 beard.position.copy(skin.position);beard.quaternion.copy(skin.quaternion);beard.scale.copy(skin.scale);
 beard.bind(skin.skeleton,skin.bindMatrix);beard.frustumCulled=false;skin.parent.add(beard);
 // Round wire frames use the head's inverse bind transform, so the bridge,
 // lenses and temples stay attached through every sampled animation pose.
 const glasses=new THREE.Group();glasses.name='TravellerSpectacles';
 const frame=new THREE.MeshStandardMaterial({name:'Traveller bronze spectacles',color:0x65513e,metalness:.65,roughness:.36});
 function line(points,r=.0017){const path=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)));const m=new THREE.Mesh(new THREE.TubeGeometry(path,16,r*unit,6,false),frame);glasses.add(m);}
 for(const sign of [-1,1]){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.026*unit,.0017*unit,8,40),frame);
  ring.scale.y=.84;ring.position.set(sign*.031*unit,eyeY,front-.013*unit);glasses.add(ring);
  line([[sign*.057*unit,eyeY,front-.012*unit],[sign*.071*unit,eyeY+.001*unit,front+.025*unit],[sign*.074*unit,eyeY-.010*unit,front+.094*unit]]);
 }
 line([[-.006*unit,eyeY+.004*unit,front-.014*unit],[0,eyeY+.009*unit,front-.019*unit],[.006*unit,eyeY+.004*unit,front-.014*unit]]);
 const head=root.getObjectByName('head'),headIndex=skin.skeleton.bones.indexOf(head);
 glasses.applyMatrix4(skin.skeleton.boneInverses[headIndex].clone().multiply(skin.bindMatrix));head.add(glasses);
}
