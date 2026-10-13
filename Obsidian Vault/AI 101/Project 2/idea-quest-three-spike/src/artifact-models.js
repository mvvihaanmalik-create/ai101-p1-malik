import * as THREE from 'three';
import { painterly } from './painterly.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const material=(color,props={})=>painterly(new THREE.MeshStandardMaterial({color,roughness:.94,side:THREE.DoubleSide,...props}),1.4,.32);
function add(parent,geometry,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(parent,mat,x,y,z,w,h,d){return add(parent,new RoundedBoxGeometry(w,h,d,3,Math.min(.04,w/4,h/4,d/4)),mat,x,y,z);}
let vellum,lining;
function paintedMap(dark=false){
  if(dark?lining:vellum)return dark?lining:vellum;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d');
  c.fillStyle=dark?'#304e4b':'#ecd9ac';c.fillRect(0,0,1024,1024);
  let seed=97;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<8000;i++){c.fillStyle=i%2?(dark?'#b1c2a008':'#fff0c518'):(dark?'#111e1c0b':'#946c3109');c.fillRect(rand()*1024,rand()*1024,1+rand()*3,.6+rand()*2);}
  c.strokeStyle=dark?'#c4aa71':'#ae894d';c.lineWidth=3;c.strokeRect(62,52,900,920);c.lineWidth=1;c.strokeRect(76,67,872,890);
  for(const x of [77,947])for(const y of [68,955]){c.save();c.translate(x,y);c.scale(x<512?1:-1,y<512?1:-1);c.lineWidth=3;c.beginPath();c.moveTo(0,75);c.bezierCurveTo(58,70,72,45,72,14);c.bezierCurveTo(62,32,34,30,25,12);c.stroke();c.restore();}
  c.save();c.translate(512,dark?512:260);c.lineWidth=3;c.beginPath();c.arc(0,0,dark?205:128,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,dark?225:140,0,Math.PI*2);c.stroke();
  const radius=dark?165:96;c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?radius*.38:radius;if(i)c.lineTo(Math.cos(a)*r,Math.sin(a)*r);else c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.stroke();c.restore();
  if(!dark){c.strokeStyle='#85613b';c.lineWidth=3;c.lineCap='round';for(let row=0;row<8;row++){let x=175,y=490+row*47;c.beginPath();c.moveTo(x,y);for(let word=0;word<5;word++){const len=60+rand()*37;c.bezierCurveTo(x+12,y-8,x+len*.55,y+6,x+len,y-1);x+=len+15;c.moveTo(x,y);}c.stroke();}}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
  if(dark)lining=map;else vellum=map;return map;
}
function starStamp(parent,mat,x,y,z,size=.1){const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?size*.42:size;if(i)shape.lineTo(Math.cos(a)*r,Math.sin(a)*r);else shape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}shape.closePath();return add(parent,new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,steps:1}),mat,x,y,z);}
export function makeScroll(color,miniature=false){
  const root=new THREE.Group(),paper=material('#fff1cc',{map:paintedMap()}),wood=material('#73543b'),foil=material('#c9a56b',{roughness:.44,metalness:.55});
  const sheet=new THREE.PlaneGeometry(1.12,1.48,24,32),p=sheet.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,.045*Math.cos(x*4)+.016*Math.sin(y*5));p.setX(i,x+Math.sin(y*21)*.003);}sheet.computeVertexNormals();add(root,sheet,paper,0,1.05,.08);
  for(const y of [.31,1.79]){
    const roll=add(root,new THREE.CylinderGeometry(.102,.106,1.2,48),material('#e7d0a0'),0,y,.08);roll.rotation.z=Math.PI/2;
    for(const side of [-1,1]){
      const profile=[[0,0],[.052,0],[.07,.015],[.065,.035],[.045,.045],[.048,.13],[.077,.15],[.073,.19],[.035,.22],[0,.24]].map(([r,h])=>new THREE.Vector2(r,h));
      const finial=add(root,new THREE.LatheGeometry(profile,32),wood,side*.59,y,.08);finial.rotation.z=-side*Math.PI/2;
      for(const x of [side*.62,side*.75]){const ring=add(root,new THREE.TorusGeometry(.07,.011,8,32),foil,x,y,.08);ring.rotation.y=Math.PI/2;}
    }
  }
  const ribbon=box(root,material(color),0,1.02,.15,.09,1.48,.025);
  const seal=add(root,new THREE.CylinderGeometry(.16,.17,.054,40),material(color,{roughness:.7}),0,.97,.2);seal.rotation.x=Math.PI/2;
  const stamp=new THREE.Group();root.add(stamp);add(stamp,new THREE.TorusGeometry(.117,.011,8,32),foil,0,.97,.239);starStamp(stamp,foil,0,.97,.236,.065);
  seal.userData.stamp=stamp;
  const foot=new THREE.Group();root.add(foot);box(foot,wood,0,.07,0,.66,.09,.36);
  for(const x of [-.23,.23])box(foot,foil,x,.10,0,.035,.10,.36);
  if(miniature){root.scale.setScalar(.47);foot.visible=false;}
  return {root,ribbon,seal,stamp};
}
export function makeArtifactModels(parent,color){
  const scroll=makeScroll(color);parent.add(scroll.root);scroll.root.rotation.z=-.075;scroll.root.rotation.y=-.08;
  const chest=new THREE.Group();parent.add(chest);chest.rotation.y=-.12;
  const paint=material('#3d6158',{roughness:.82}),trim=material('#c9a56b',{roughness:.44,metalness:.55}),dark=material('#293c36'),velvet=material('#fff7dc',{map:paintedMap(true),roughness:1});
  box(chest,dark,0,.08,0,1.45,.14,1.03);box(chest,paint,0,.23,0,1.2,.16,.84);
  box(chest,paint,0,.55,.43,1.28,.68,.1);box(chest,paint,0,.55,-.43,1.28,.68,.1);
  for(const x of [-.6,.6])box(chest,paint,x,.55,0,.1,.68,.84);
  const liner=add(chest,new THREE.PlaneGeometry(1.06,.67),velvet,0,.32,0);liner.rotation.x=-Math.PI/2;
  for(const x of [-.5,.5])box(chest,trim,x,.54,.493,.069,.76,.025);
  for(const y of [.19,.90])box(chest,trim,0,y,.494,1.32,.045,.03);
  for(const x of [-.62,.62])for(const y of [.22,.85]){const stud=add(chest,new THREE.SphereGeometry(.038,20,14),trim,x,y,.504);stud.scale.z=.45;}
  const lid=new THREE.Group();lid.position.set(0,.96,-.45);chest.add(lid);
  const roof=add(lid,new THREE.CylinderGeometry(.49,.49,1.33,48,1,false,0,Math.PI),paint,0,.015,.45);roof.rotation.z=Math.PI/2;
  for(const x of [-.48,.48]){const band=add(lid,new THREE.CylinderGeometry(.505,.505,.067,48,1,true,0,Math.PI),trim,x,.015,.45);band.rotation.z=Math.PI/2;}
  for(const x of [-.665,.665]){const rim=add(lid,new THREE.TorusGeometry(.49,.019,8,48,Math.PI),trim,x,.015,.45);rim.rotation.y=Math.PI/2;}
  box(lid,trim,0,-.014,.45,1.35,.065,.98);
  const inside=add(lid,new THREE.PlaneGeometry(1.20,.83),velvet,0,-.049,.45);inside.rotation.x=Math.PI/2;
  const gem=add(lid,new THREE.OctahedronGeometry(.19,0),material(color,{roughness:.26,metalness:.15}),0,.65,.45);gem.rotation.y=Math.PI/4;
  const setting=add(lid,new THREE.TorusGeometry(.16,.023,8,32),trim,0,.5,.45);setting.rotation.x=Math.PI/2;
  for(const x of [-.12,.12])add(lid,new THREE.SphereGeometry(.035,20,14),trim,x,.56,.45);
  add(chest,new THREE.TorusGeometry(.125,.024,10,40),trim,0,.66,.51);starStamp(chest,trim,0,.66,.508,.068);
  for(const x of [-.58,.58])for(const z of [-.38,.38])add(chest,new THREE.SphereGeometry(.085,24,16),trim,x,.07,z);
  const message=makeScroll(color,true);parent.add(message.root);message.root.visible=false;
  scroll.root.visible=false;chest.visible=false;
  return {scroll,keepsake:chest,lid,message};
}
