import * as THREE from 'three';
import { fireMaterial } from './fire-material.js';
import { painterly } from './painterly.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createWorkshop(scene,renderer) {
  const materials=new Map();
  const mat=(c,roughness=.78)=>{
    const key=c+roughness;
    if(!materials.has(key)) materials.set(key,new THREE.MeshStandardMaterial({color:c,roughness}));
    return materials.get(key);
  };
  const gold=new THREE.MeshStandardMaterial({color:'#e9bb69',roughness:.68,metalness:.22});
  const copper=mat('#ae7352');
  const dark=mat('#393d39');
  function add(g,m,p=scene,x=0,y=0,z=0){const o=new THREE.Mesh(g,painterly(m,.58,.55));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
  function box(p,m,x,y,z,w,h,d,r=.05){
    const geo=new RoundedBoxGeometry(w,h,d,3,Math.min(Math.max(r,.07),w/3,h/3,d/3));
    const pos=geo.attributes.position,phase=x*2.3+y*3.7+z;
    for(let i=0;i<pos.count;i++){
      const px=pos.getX(i),py=pos.getY(i),pz=pos.getZ(i);
      const broad=w>.5&&h>.09;
      pos.setXYZ(i,px+Math.sin(py*3+pz*2+phase)*Math.min(w*.025,.028),py+(broad?.026:Math.min(h*.04,.008))*Math.sin(px/Math.max(w,.1)*5+pz*2+phase),pz+Math.sin(px*2+py*2+phase)*Math.min(d*.025,.025));
    }
    geo.computeVertexNormals();const item=add(geo,m,p,x,y,z);
    if(w>.25&&w<.8&&h>.2&&h<.6)item.rotation.z=Math.sin(phase)*.035;
    return item;
  }
  const sphere=new THREE.SphereGeometry(1,32,24);
  function ball(p,m,x,y,z,sx,sy=sx,sz=sx){const o=add(sphere,m,p,x,y,z);o.scale.set(sx,sy,sz);return o;}
  function tube(p,m,points,r=.025){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),24,r,7,false),m,p);}
  function ring(p,x,y,z,r,material=gold,width=.025){const o=add(new THREE.TorusGeometry(r,width,8,48),material,p,x,y,z);o.rotation.x=Math.PI/2;return o;}
  function tex(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
  let seed=94;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const wood=tex((c,w,h)=>{
    c.fillStyle='#a9663d';c.fillRect(0,0,w,h);
    for(let i=0;i<220;i++){const y=random()*h;c.beginPath();for(let x=0;x<=w;x+=8){const yy=y+Math.sin(x*.021+y*.062)*3+Math.sin(x*.005+y*.035)*8;if(x===0)c.moveTo(x,yy);else c.lineTo(x,yy);}c.strokeStyle=i%3?'#683d2925':'#e9b16f38';c.lineWidth=.5+random()*2;c.stroke();}
    for(let j=0;j<5;j++){const x=random()*w,y=random()*h;c.strokeStyle='#61352538';for(let i=0;i<4;i++){c.beginPath();c.ellipse(x,y,12+i*9,2+i*1.8,.02,0,Math.PI*2);c.stroke();}}
  },1024,256);
  const woodMat=new THREE.MeshStandardMaterial({map:wood,color:'#edc597',roughness:.76});
  const plaster=tex((c,w,h)=>{
    c.fillStyle='#344542';c.fillRect(0,0,w,h);
    for(let i=0;i<9000;i++){c.fillStyle=i%2?'#a4b5b70b':'#101c2416';c.fillRect(random()*w,random()*h,1+random()*3,1+random()*3);}
    for(let i=0;i<420;i++){c.fillStyle=i%2?'#87aa8d0c':'#172e3414';c.beginPath();c.ellipse(random()*w,random()*h,8+random()*35,5+random()*18,random()*3,0,Math.PI*2);c.fill();}
    c.strokeStyle='#d2ae6d28';c.lineWidth=1.5;
    for(let y=45;y<h;y+=105)for(let x=35;x<w;x+=105){c.beginPath();c.moveTo(x,y-9);c.quadraticCurveTo(x+2,y-2,x+9,y);c.quadraticCurveTo(x+2,y+2,x,y+9);c.quadraticCurveTo(x-2,y+2,x-9,y);c.quadraticCurveTo(x-2,y-2,x,y-9);c.stroke();c.beginPath();c.arc(x+48,y+48,2,0,Math.PI*2);c.stroke();}
  });
  plaster.wrapS=plaster.wrapT=THREE.RepeatWrapping;plaster.repeat.set(4,2);
  const plasterMat=new THREE.MeshStandardMaterial({map:plaster,roughness:1});
  scene.background=new THREE.Color('#17141b');scene.fog=new THREE.Fog('#17141b',20,34);
  const environment=new RoomEnvironment();
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(environment,.04).texture;scene.environmentIntensity=.12;
  environment.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#8cbbb8','#4a3020',.38));
  const key=new THREE.DirectionalLight('#ffcf8e',.75);key.position.set(-3,7,6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=7;key.shadow.camera.bottom=-5;key.shadow.normalBias=.025;key.shadow.bias=-.00015;key.shadow.radius=3;scene.add(key);
  const rim=new THREE.DirectionalLight('#62b7bc',1.25);rim.position.set(-4,4,-3);scene.add(rim);
  const fill=new THREE.DirectionalLight('#eeb087',.18);fill.position.set(-6,2,-1);scene.add(fill);

  const moonBounce=new THREE.PointLight('#57aeb5',7,8,2);moonBounce.position.set(-2.5,3.5,-2.6);scene.add(moonBounce);
  const catBounce=new THREE.PointLight('#ffbd6a',2.8,4.8,2);catBounce.position.set(-3.45,1.7,1.4);scene.add(catBounce);
  box(scene,plasterMat,0,2.4,-4.8,22,9,.2);
  for(const x of [-5.6,-1.6,5.6])box(scene,dark,x,2.4,-4.56,.24,7,.28);
  box(scene,dark,0,5.4,-4.53,20,.28,.35);
  box(scene,woodMat,0,.0,-4.54,14,2.05,.26);
  for(let x=-7;x<7;x+=.67)box(scene,dark,x,0,-4.35,.025,1.94,.04,.004);
  box(scene,copper,0,1.04,-4.25,14,.13,.38);
  box(scene,gold,0,1.15,-4.22,14,.025,.33,.006);
  box(scene,mat('#363744'),0,-.48,0,22,.1,18);
  for(let z=-5;z<8;z+=.8)box(scene,mat(z%2?'#46434b':'#3c3c46'),0,-.415,z,20,.04,.78,.008);

  // A deep arched window, framed in carved wood with a small sleeping town outside.
  const windowGroup=new THREE.Group();windowGroup.position.set(-.55,2.37,-4.38);windowGroup.scale.setScalar(.68);scene.add(windowGroup);
  const archShape=new THREE.Shape();archShape.moveTo(-1.18,0);archShape.lineTo(1.18,0);archShape.lineTo(1.18,1.96);archShape.absarc(0,1.96,1.18,0,Math.PI,false);archShape.lineTo(-1.18,0);
  const pane=add(new THREE.ShapeGeometry(archShape,48),new THREE.MeshBasicMaterial({color:'#24484f'}),windowGroup);
  pane.castShadow=false;
  const moon=ball(windowGroup,new THREE.MeshBasicMaterial({color:'#ffeda7'}),.52,2.34,.045,.24,.24,.02);moon.castShadow=false;
  ball(windowGroup,new THREE.MeshBasicMaterial({color:'#24484f'}),.61,2.42,.068,.21,.21,.012).castShadow=false;
  for(let i=0;i<21;i++){const x=random()*2.12-1.06,y=random()*2.1+.6;if(y>2.7&&Math.abs(x)>.7)continue;ball(windowGroup,new THREE.MeshBasicMaterial({color:'#b9e1dc'}),x,y,.03,.012+(i%3)*.006,.018,.008).castShadow=false;}
  for(let i=0;i<8;i++){const x=-1.05+i*.3,h=.23+random()*.35;box(windowGroup,mat('#173a56'),x,h/2,.07,.28,h,.05,.005);const roof=add(new THREE.ConeGeometry(.22,.2,4),mat('#203549'),windowGroup,x,h+.06,.08);roof.rotation.y=Math.PI/4;roof.scale.z=.3;box(windowGroup,new THREE.MeshBasicMaterial({color:'#f3c982'}),x,h*.53,.105,.04,.075,.006,.001);}
  const frame=mat('#a97553');
  tube(windowGroup,frame,[[-1.24,0,.17],[-1.24,1.95,.17],[-.9,2.85,.17],[0,3.24,.17],[.9,2.85,.17],[1.24,1.95,.17],[1.24,0,.17]],.12);
  tube(windowGroup,gold,[[-1.1,.03,.16],[-1.1,1.95,.16],[-.80,2.75,.16],[0,3.08,.16],[.8,2.75,.16],[1.1,1.95,.16],[1.1,.03,.16]],.022);
  box(windowGroup,frame,0,1.0,.16,.06,2,.12);
  box(windowGroup,frame,0,1.57,.16,2.35,.07,.12);
  box(windowGroup,woodMat,0,-.08,.21,2.8,.19,.62);
  for(const sign of [-1,1]){
    for(let i=0;i<4;i++){const g=new THREE.CylinderGeometry(.075,.13,2.75,12,1,true);const curtain=add(g,mat(i%2?'#865c79':'#78546f'),windowGroup,sign*(1.34+i*.095),1.46,.26);curtain.rotation.z=sign*-.06;}
    tube(windowGroup,gold,[[sign*1.2,.88,.32],[sign*1.43,.81,.45],[sign*1.69,.86,.32]],.03);
  }

  const bookColors=['#ad7770','#448780','#6a6293','#c09561','#737e9c'];
  function book(p,x,y,z,h,c){box(p,mat(c),x,y+h/2,z,.18,h,.37,.025);for(const yy of [y+.09,y+h-.09])box(p,gold,x,yy,z+.195,.13,.025,.009,.003);}
  function littleBottle(p,x,y,z,c,scale=1){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);p.add(g);ball(g,mat(c,.27),0,.18,0,.16,.20,.16);add(new THREE.CylinderGeometry(.067,.09,.18,16),mat(c,.3),g,0,.41,0);add(new THREE.CylinderGeometry(.073,.075,.08,16),copper,g,0,.52,0);box(g,mat('#ecdcaf'),0,.2,.153,.15,.14,.025,.03);}
  const shelf=new THREE.Group();shelf.position.set(-3.6,0,-4.05);scene.add(shelf);
  for(const yy of [2.15,4.10]){
    box(shelf,woodMat,0,yy,0,2.9,.16,.7);
    box(shelf,gold,0,yy-.015,.36,2.88,.035,.03,.008);
    for(const x of [-1.15,1.15]){box(shelf,dark,x,yy-.19,-.08,.15,.38,.36);ball(shelf,gold,x,yy-.16,.13,.038);}
  }
  const shelfLabel=tex((c,w,h)=>{c.fillStyle='#345047';c.fillRect(0,0,w,h);c.fillStyle='#e7d7ad';c.font='bold 32px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillText('RESTING IDEAS',w/2,h/2);},512,80);
  add(new THREE.PlaneGeometry(1.85,.29),new THREE.MeshStandardMaterial({map:shelfLabel,roughness:1}),shelf,0,3.89,.38);
  for(let i=0;i<4;i++)littleBottle(shelf,-.95+i*.54,2.25,0,['#567f9c','#c68f75','#699b78','#a291bb'][i],.78+(i%2)*.22);
  const chart=new THREE.Group();chart.position.set(-.65,3.32,-4.38);scene.add(chart);chart.visible=false;
  const chartTex=tex((c,w,h)=>{c.fillStyle='#1f3544';c.fillRect(0,0,w,h);c.strokeStyle='#daba78';c.lineWidth=3;for(const r of [145,156,185]){c.beginPath();c.arc(w/2,h/2,r,0,Math.PI*2);c.stroke();}for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(w/2+158*Math.cos(a),h/2+158*Math.sin(a));c.lineTo(w/2+181*Math.cos(a),h/2+181*Math.sin(a));c.stroke();}c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI*4/5-Math.PI/2;const x=w/2+115*Math.cos(a),y=h/2+115*Math.sin(a);if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();});
  box(chart,woodMat,0,0,0,1.27,1.55,.08);
  add(new THREE.PlaneGeometry(1.13,1.38),new THREE.MeshStandardMaterial({map:chartTex,roughness:1}),chart,0,0,.049);

  // Rounded masonry hearth, recessed firebox, logs and living amber fire.
  const hearth=new THREE.Group();hearth.position.set(2.85,1.16,-4.03);scene.add(hearth);
  const stone=mat('#74605c'),mortar=mat('#3c3030'),soot=mat('#171012');
  box(hearth,mortar,0,1.40,0,3.35,3.15,.40,.11);
  box(hearth,soot,0,.92,.25,2.09,1.78,.12,.25);
  for(const sign of [-1,1]) for(let row=0;row<5;row++){
    box(hearth,mat(row%2?'#79605a':'#6a5552'),sign*1.29,.25+row*.44,.35,.51,.40,.63,.09);
  }
  for(let row=0;row<2;row++)for(let col=0;col<5;col++)box(hearth,stone,-1.25+col*.625,2.21+row*.43,.30,.59,.39,.65,.08);
  box(hearth,woodMat,0,2.79,.43,3.72,.23,.99,.07);
  box(hearth,stone,0,-.05,.52,3.45,.20,1.30,.08);
  // Lit edges of a stack of split logs.
  for(let i=0;i<4;i++){
    const log=add(new THREE.CylinderGeometry(.13,.16,1.20,24),mat('#3d2420'),hearth,(i%2?-.17:.17),.17+Math.floor(i/2)*.17,.66);
    log.rotation.z=Math.PI/2;log.rotation.y=(i%2?1:-1)*.26;
    for(const side of [-1,1]){const end=add(new THREE.CircleGeometry(.135,32),mat('#b78c60'),log,0,side*.605,0);end.rotation.x=-side*Math.PI/2;
      for(const r of [.05,.09,.12]){const grain=add(new THREE.RingGeometry(r,r+.005,32),mat('#745034'),log,0,side*.607,0);grain.rotation.x=-side*Math.PI/2;}}
  }
  const fireTongues=[];
  const fireColors=['#ed6b22','#ffac38','#ffe49a'];
  for(let i=0;i<9;i++){
    const flame=new THREE.Group();flame.position.set((i-4)*.185,.27,.69+(i%3)*.025);hearth.add(flame);
    const h=.48+(i%3)*.16;
    const profile=[new THREE.Vector2(0,0),new THREE.Vector2(.11,.06),new THREE.Vector2(.16,.2),new THREE.Vector2(.105,h*.7),new THREE.Vector2(0,h)];
    const geo=new THREE.LatheGeometry(new THREE.SplineCurve(profile).getPoints(28).map(p=>new THREE.Vector2(Math.max(0,p.x),p.y)),20);
    const fireMat=fireMaterial(h,i*1.7);flame.userData.fireMaterial=fireMat;
    const f=add(geo,fireMat,flame);f.castShadow=false;f.receiveShadow=false;
    flame.rotation.z=(i-4)*-.045;fireTongues.push(flame);
  }
  const emberGeo=new THREE.BufferGeometry();emberGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(36*3),3));
  const emberMat=new THREE.PointsMaterial({color:new THREE.Color('#ffb65f').multiplyScalar(2),size:.025,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending});
  const embers=new THREE.Points(emberGeo,emberMat);hearth.add(embers);
  const fireLight=new THREE.PointLight('#ff9d52',25,11,2);fireLight.position.set(0,.85,1.0);hearth.add(fireLight);
  // Soft pool of orange light inside the soot-black opening.
  const haloTex=tex((c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'#ff9722aa');g.addColorStop(.4,'#ea5b1938');g.addColorStop(1,'#a83b0000');c.fillStyle=g;c.fillRect(0,0,w,h);},128,128);
  const halo=add(new THREE.PlaneGeometry(2.25,2.1),new THREE.MeshBasicMaterial({map:haloTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),hearth,0,.94,.34);halo.castShadow=false;
  // A small clock and two books rest on the mantel.
  ball(hearth,woodMat,0,3.17,.43,.34,.36,.13);
  const clockFace=add(new THREE.CircleGeometry(.26,32),mat('#dec79d'),hearth,0,3.18,.575);
  add(new THREE.TorusGeometry(.271,.013,8,48),gold,hearth,0,3.18,.584);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=box(hearth,dark,Math.sin(a)*.225,3.18+Math.cos(a)*.225,.588,.012,i%3?.025:.042,.009,.001);tick.rotation.z=-a;}
  tube(hearth,dark,[[0,3.18,.60],[0,3.36,.60]],.015);tube(hearth,dark,[[0,3.18,.60],[.14,3.10,.60]],.015);
  for(let i=0;i<2;i++)box(hearth,mat(i?'#776581':'#796743'),-.97,2.98+i*.12,.39,.64,.10,.45,.02);

  // The counter has actual bevels, joinery, drawer pulls and a fabric inlay.
  const table=new THREE.Group();scene.add(table);
  box(table,mat('#704533'),0,.66,.35,10,.38,3.65,.10);
  for(let i=0;i<5;i++)box(table,woodMat,0,.88,-1.10+i*.71,9.86,.14,.70,.035);
  box(table,gold,0,.67,2.19,9.7,.045,.045,.01);
  for(const x of [-4.35,4.35])for(const z of [-.7,1.6]){
    add(new THREE.CylinderGeometry(.19,.24,1.15,16),mat('#80533d'),table,x,-.04,z);
    ball(table,copper,x,.17,z,.23,.17,.23);add(new THREE.CylinderGeometry(.26,.26,.08,16),gold,table,x,.26,z);
  }
  for(const x of [-3.1,0,3.1]){
    box(table,woodMat,x,.41,2.12,2.75,.30,.11,.05);
    const ringHandle=add(new THREE.TorusGeometry(.082,.016,8,28),gold,table,x,.4,2.25);ball(table,gold,x,.46,2.25,.035);
    ringHandle.rotation.x=.15;
  }
  const runnerGroup=new THREE.Group();table.add(runnerGroup);
  box(runnerGroup,mat('#365369'),.68,.964,.46,6.13,.018,2.14,.007);
  for(const z of [-.55,1.47])box(runnerGroup,gold,.68,.978,z,6,.006,.022,.002);
  for(const x of [-2.31,3.67])box(runnerGroup,gold,x,.978,.46,.021,.006,1.98,.002);
  const catCushion=new THREE.Group();table.add(catCushion);
  add(new THREE.CylinderGeometry(.82,.85,.08,64),mat('#716887'),catCushion,-3.37,.97,.23);ring(catCushion,-3.37,1.015,.23,.74,gold,.012);
  const mobilePerch=new THREE.Group();mobilePerch.position.set(0,1.31,-1.12);table.add(mobilePerch);mobilePerch.visible=false;
  add(new THREE.CylinderGeometry(.70,.77,.70,64),mat('#716887'),mobilePerch);ring(mobilePerch,0,.353,0,.67,gold,.015);
  const sigils=[];
  for(const x of [-1.25,.62,2.49]){
    const sigil=new THREE.Group();sigil.position.set(x,0,.4);table.add(sigil);sigils.push(sigil);
    ring(sigil,0,.99,0,.77,mat('#cbac72'),.012);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const rune=box(sigil,gold,Math.cos(a)*.70,.995,Math.sin(a)*.70,.065,.007,.023,.002);rune.rotation.y=-a;}
  }
  // A little field journal and pen make the counter feel occupied.
  const journal=new THREE.Group();journal.position.set(4.02,1.01,.70);journal.rotation.y=-.24;table.add(journal);
  box(journal,mat('#824f59'),0,0,0,.77,.09,1.03,.04);box(journal,mat('#eee0b9'),0,.06,0,.71,.06,.93,.02);
  for(let i=0;i<5;i++)box(journal,mat('#b49b80'),0,.097,-.25+i*.11,.49,.004,.008,.001);
  tube(journal,gold,[[-.15,.11,.19],[.20,.13,.53]],.025);

  const lantern=new THREE.Group();lantern.position.set(-.54,4.88,-2.8);scene.add(lantern);
  tube(lantern,dark,[[0,0,0],[0,.8,0]],.024);
  add(new THREE.ConeGeometry(.3,.21,8),copper,lantern,0,-.12,0);
  add(new THREE.CylinderGeometry(.28,.28,.04,8),gold,lantern,0,-.75,0);
  const glow=new THREE.MeshStandardMaterial({color:'#ffda93',emissive:'#ffb845',emissiveIntensity:1.6,roughness:.3});
  ball(lantern,glow,0,-.44,0,.21,.27,.21);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;tube(lantern,gold,[[Math.cos(a)*.24,-.2,Math.sin(a)*.24],[Math.cos(a)*.27,-.73,Math.sin(a)*.27]],.018);}
  const lanternLight=new THREE.PointLight('#ffbb70',6,8,2);lanternLight.position.y=-.45;lantern.add(lanternLight);
  const flames=[];
  for(const [x,z,h] of [[-4.48,-.3,.7],[4.25,-.62,.95],[4.57,-.3,.52]]){
    add(new THREE.CylinderGeometry(.21,.25,.07,32),gold,scene,x,1.02,z);
    add(new THREE.CylinderGeometry(.095,.12,h,28),mat('#f4dfb0'),scene,x,1.07+h/2,z);
    for(let i=0;i<3;i++){const a=i*2.3;ball(scene,mat('#f4dfb0'),x+Math.cos(a)*.095,1.05+h-.08-i*.035,z+Math.sin(a)*.095,.025,.10,.025);}
    const flame=ball(scene,glow,x,1.15+h,z,.056,.14,.055);flames.push(flame);
    const light=new THREE.PointLight('#ffc57c',.65,2.5);light.position.set(x,1.1+h,z);scene.add(light);
  }
  const leafMat=mat('#628f7b');
  const plant=new THREE.Group();plant.position.set(4.47,1.77,-3.71);scene.add(plant);
  add(new THREE.CylinderGeometry(.27,.19,.44,24),mat('#bf8260'),plant,0,0,0);ring(plant,0,.22,0,.27,copper,.035);
  for(let i=0;i<10;i++){const a=i*2.4,r=.15+(i%3)*.10;const leaf=ball(plant,leafMat,Math.cos(a)*r,.32+(i%3)*.13,Math.sin(a)*r,.1,.30,.065);leaf.rotation.z=Math.cos(a)*-.7;leaf.rotation.x=Math.sin(a)*.7;}

  const glowMap=tex((c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'#fff7cf');g.addColorStop(.13,'#f3d69dbb');g.addColorStop(.4,'#e7d49a26');g.addColorStop(1,'#e7d49a00');c.fillStyle=g;c.fillRect(0,0,w,h);},64,64);
  const particlePositions=new Float32Array(45*3);
  for(let i=0;i<45;i++){particlePositions[i*3]=(random()-.5)*10;particlePositions[i*3+1]=1+random()*4.5;particlePositions[i*3+2]=-3+random()*5;}
  const moteGeo=new THREE.BufferGeometry();moteGeo.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
  const motes=new THREE.Points(moteGeo,new THREE.PointsMaterial({color:'#fff0bd',map:glowMap,size:.105,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(motes);
  let fireBoost=0,lanternOn=true;
  const interactables=[];
  for(const [root,action] of [[hearth,'fire'],[lantern,'lantern'],[journal,'journal']])root.traverse(o=>{if(o.isMesh){o.userData.roomAction=action;interactables.push(o);}});
  return {lantern,interactables,interact(action){if(action==='fire')fireBoost=1;if(action==='lantern'){lanternOn=!lanternOn;lanternLight.intensity=lanternOn?6:0;glow.emissiveIntensity=lanternOn?1.6:.2;}return lanternOn;},shelfSlot(i){return new THREE.Vector3(shelf.position.x+(i-1)*.85,shelf.position.y+4.20,shelf.position.z+.16);},setMobile(mobile){
    shelf.position.x=mobile?-2.1:-3.6;shelf.position.y=mobile?-.2:0;
    hearth.position.x=mobile?2.1:2.85;catBounce.position.set(mobile?-.9:-3.45,mobile?2.65:2.15,mobile?.25:1.4);mobilePerch.visible=mobile;catCushion.visible=!mobile;runnerGroup.position.x=mobile?-.68:0;runnerGroup.position.z=mobile?.29:0;
    sigils.forEach((s,i)=>{s.position.x=mobile?[-1.8,0,1.8][i]:[-1.25,.62,2.49][i];s.position.z=mobile?1.15:.4;s.scale.x=s.scale.z=mobile?.86:1;});
  },update(t,still){fireBoost*=.985;fireLight.intensity=(still?25:25+Math.sin(t*4.7)*1.5+Math.sin(t*7.3)*.7)+fireBoost*18;const ep=emberGeo.attributes.position;for(let i=0;i<ep.count;i++){const phase=i*.618,age=((still?0:t*.31)+phase)%1;ep.setXYZ(i,Math.sin(i*2.4+age*2)*(.28+age*.28),.3+age*1.75,.74+Math.cos(i*1.6+age)*.12);}ep.needsUpdate=true;fireTongues.forEach((f,i)=>{f.userData.fireMaterial.uniforms.fireTime.value=still?0:t;f.scale.y=(still?1:1+Math.sin(t*4.5+i*1.7)*.16)+fireBoost*.45;f.rotation.z=still?0:Math.sin(t*3+i)*.085;});lantern.rotation.z=still?0:Math.sin(t*.6)*.025;flames.forEach((f,i)=>{f.scale.y=.14*(still?1:1+Math.sin(t*6+i)*.08);});motes.rotation.y=still?0:Math.sin(t*.08)*.06;motes.position.y=still?0:Math.sin(t*.35)*.12;}};
}
