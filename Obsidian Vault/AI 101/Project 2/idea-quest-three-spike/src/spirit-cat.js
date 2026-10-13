import * as THREE from 'three';
import { painterly } from './painterly.js';

// A small, articulated witch-cat model, built entirely from local geometry.
// Head, ears, paws and tails have separate pivots so the silhouette stays alive.
export function createSpiritCat() {
  const root = new THREE.Group();
  const material = (color, extra = {}) => painterly(new THREE.MeshStandardMaterial({ color, roughness:1, ...extra }),.40,.55);
  const red = material('#59625b');
  const cream = material('#e3d5b8');
  const pink = material('#e98995');
  const ink = material('#302d31');
  const teal = material('#526a63');
  const gold = material('#f8c35a', { metalness: .12, roughness: .75 });
  const white = new THREE.MeshBasicMaterial({ color: '#fffbea' });
  const meshes = [];
  function add(geo, mat, parent, position = [0,0,0], scale = [1,1,1]) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...position); m.scale.set(...scale);
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m); meshes.push(m); return m;
  }
  const sphere = new THREE.SphereGeometry(1, 56, 36);
  const sp=sphere.attributes.position;
  for(let i=0;i<sp.count;i++){const x=sp.getX(i),y=sp.getY(i),z=sp.getZ(i);const r=1+.008*Math.sin(x*4+y*3)*Math.sin(z*4+1);sp.setXYZ(i,x*r,y*r,z*r);}
  sphere.computeVertexNormals();
  const orb = (p,m,pos,size) => add(sphere,m,p,pos,size);
  function line(p, m, points, radius) {
    const curve = new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(...v)));
    return add(new THREE.TubeGeometry(curve, 28, radius, 8, false),m,p);
  }
  const torso = new THREE.Group(); root.add(torso);
  orb(torso, red, [0,.67,0], [.70,.65,.53]);
  orb(torso, cream, [0,.62,.465], [.34,.38,.13]);
  for (const sign of [-1,1]) {
    orb(torso, red, [sign*.31,.13,.18],[.265,.16,.32]);
    orb(torso, cream,[sign*.31,.12,.39],[.24,.135,.19]);
    for(let i=-1;i<=1;i++) line(torso,material('#e3c5ae'),[
      [sign*.31+i*.075,.13,.56],[sign*.31+i*.075,.17,.555]
    ],.007);
  }
  const paws = [];
  for(const sign of [-1,1]) {
    const pivot = new THREE.Group(); pivot.position.set(sign*.48,1.04,.03); torso.add(pivot);
    orb(pivot,red,[sign*.06,-.23,.12],[.19,.31,.205]);
    orb(pivot,cream,[sign*.10,-.43,.18],[.185,.18,.21]);
    paws.push(pivot);
  }
  // Open-front wool cloak, gathered at the neck with scalloped folds.
  const cloak=new THREE.Group();torso.add(cloak);
  const cloth=material('#4c626b');cloth.side=THREE.DoubleSide;
  const vertices=[],indices=[],rows=18,cols=56;
  for(let r=0;r<=rows;r++){const v=r/rows;for(let c=0;c<=cols;c++){const a=.45+c/cols*(Math.PI*2-.9),radius=.57+v*.40+Math.sin(a*9)*.025*v;
    vertices.push(Math.sin(a)*radius,1.16-v*.94+Math.sin(a*7)*.035*v,Math.cos(a)*radius*.9-.015);}}
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const cloakGeo=new THREE.BufferGeometry();cloakGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));cloakGeo.setIndex(indices);cloakGeo.computeVertexNormals();add(cloakGeo,cloth,cloak);
  const hem=[];for(let c=0;c<=cols;c++){const i=(rows*(cols+1)+c)*3;hem.push(vertices.slice(i,i+3));}line(cloak,material('#b9a474'),hem,.018);
  for(const a of [.45,Math.PI*2-.45]){const edge=[];for(let r=0;r<=12;r++){const v=r/12,rad=.57+v*.40+Math.sin(a*9)*.025*v;edge.push([Math.sin(a)*rad,1.16-v*.94+Math.sin(a*7)*.035*v,Math.cos(a)*rad*.9]);}line(cloak,material('#b9a474'),edge,.018);}
  // Fine warm thread on the cloak: constellation embroidery and a stitched hem.
  const thread=material('#c6b187',{roughness:.86});
  for(const side of [-1,1]){
    const stars=[[.65,.72],[.82,.48],[.66,.31]].map(([angle,y])=>{const a=side*angle,v=(1.16-y)/.94,r=.57+v*.4+Math.sin(a*9)*.025*v+.012;return [Math.sin(a)*r,y,Math.cos(a)*r*.9];});
    line(cloak,thread,stars,.005);
    stars.forEach(([x,y,z])=>{orb(cloak,thread,[x,y,z],[.022,.026,.012]);});
    for(let i=0;i<18;i++){const a=side<0?3.55+i*.11:.5+i*.11,r=.57+.40+Math.sin(a*9)*.025+.012;orb(cloak,thread,[Math.sin(a)*r,.22+Math.sin(a*7)*.035,Math.cos(a)*r*.9],[.011,.009,.011]);}
  }
  const collar = add(new THREE.TorusGeometry(.48,.09,12,48),teal,torso,[0,1.13,0]); collar.rotation.x=Math.PI/2;
  const scarf = new THREE.Shape(); scarf.moveTo(-.2,0); scarf.quadraticCurveTo(0,-.07,.2,0); scarf.lineTo(.13,-.27); scarf.lineTo(0,-.19); scarf.lineTo(-.14,-.28); scarf.closePath();
  add(new THREE.ExtrudeGeometry(scarf,{depth:.025,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:3,steps:1}),teal,torso,[0,1.15,.48]);
  for(let i=0;i<15;i++){
    const a=i*Math.PI*2/15;
    const puff=orb(torso,cream,[Math.cos(a)*.50,1.13+Math.sin(a*3)*.025,Math.sin(a)*.39],[.14+(i%3)*.012,.13,.14]);
    puff.rotation.z=a*.2;
  }
  const bell = orb(torso,gold,[0,.99,.54],[.11,.115,.035]);


  const head = new THREE.Group(); head.position.set(0,1.75,.05); root.add(head);
  orb(head,red,[0,0,0],[1.0,.77,.68]);
  // Soft cheek puffs and a tiny muzzle keep the face round and quiet.
  orb(head,cream,[-.13,-.28,.621],[.18,.13,.09]);
  orb(head,cream,[.13,-.28,.621],[.18,.13,.09]);
  const ears=[];
  for(const sign of [-1,1]) {
    const earPivot = new THREE.Group(); earPivot.position.set(sign*.57,.48,-.03); head.add(earPivot);
    const shape = new THREE.Shape();
    shape.moveTo(-.26,-.12); shape.quadraticCurveTo(-.30,.09,-.12,.66);
    shape.quadraticCurveTo(-.08,.76,.02,.66); shape.quadraticCurveTo(.33,.33,.30,-.08); shape.closePath();
    const ear=add(new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSize:.07,bevelThickness:.065,bevelSegments:4,curveSegments:16,steps:1}),red,earPivot);
    ear.scale.x=sign; ear.rotation.z=sign*-.16;
    const inner=shape.clone();
    const patch=add(new THREE.ShapeGeometry(inner,24),pink,earPivot,[sign*.005,.075,.203],[sign*.58,.62,1]); patch.rotation.z=sign*-.16;
    earPivot.scale.y=.61;
    ears.push(earPivot);
  }
  // Gentle inset eyes: large warm pupils, narrow ivory crescents, relaxed tilt.
  const eyes=[],pupils=[],brows=[];
  const happyEyes=new THREE.Group();head.add(happyEyes);happyEyes.visible=false;
  const eyeWhite=new THREE.MeshStandardMaterial({color:'#efe5d1',roughness:1,envMapIntensity:0});
  const eyeDark=new THREE.MeshStandardMaterial({color:'#342b2f',roughness:.38,envMapIntensity:.18});
  const glint=new THREE.MeshBasicMaterial({color:'#fff1d8'});
  for(const sign of [-1,1]){
    const eye=new THREE.Group();eye.position.set(sign*.34,-.015,.625);eye.rotation.z=sign*-.065;head.add(eye);
    orb(eye,eyeWhite,[0,0,.015],[.193,.226,.027]);
    const pupil=new THREE.Group();eye.add(pupil);
    orb(pupil,eyeDark,[0,-.004,.045],[.160,.195,.021]);
    orb(pupil,glint,[-.051,.077,.064],[.027,.033,.006]);
    eyes.push(eye);pupils.push(pupil);
    line(happyEyes,cream,[[sign*.34-.15,-.04,.67],[sign*.34,.035,.697],[sign*.34+.15,-.04,.67]],.027);
    const brow=new THREE.Group();brow.position.set(sign*.34,.265,.586);head.add(brow);
    line(brow,cream,[[-.10,0,0],[0,.025,.026],[.09,.009,0]],.018);brows.push(brow);
    orb(head,material('#c88e81'),[sign*.54,-.235,.55],[.13,.065,.018]);
    for(let j=0;j<2;j++)line(head,cream,[[sign*.63,-.25-j*.085,.51],[sign*.83,-.20-j*.09,.35]],.008);
  }
  orb(head,pink,[0,-.23,.718],[.057,.036,.022]);
  const smile=new THREE.Group();head.add(smile);
  for(const sign of [-1,1])line(smile,ink,[[0,-.265,.731],[sign*.06,-.315,.731],[sign*.14,-.275,.705]],.012);
  const openSmile=new THREE.Group();head.add(openSmile);openSmile.visible=false;
  orb(openSmile,eyeDark,[0,-.315,.714],[.12,.093,.014]);
  orb(openSmile,pink,[0,-.357,.731],[.069,.028,.008]);
  // Little painted hearts rise on a pet, and golden stars celebrate a full jar.
  const reactions=new THREE.Group();root.add(reactions);
  const heartShape=new THREE.Shape();heartShape.moveTo(0,-.13);heartShape.bezierCurveTo(-.33,.07,-.1,.24,0,.10);heartShape.bezierCurveTo(.1,.24,.33,.07,0,-.13);
  const starShape=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.08:.17;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)starShape.moveTo(x,y);else starShape.lineTo(x,y);}starShape.closePath();
  for(let i=0;i<3;i++){
    const heart=add(new THREE.ShapeGeometry(heartShape,12),new THREE.MeshBasicMaterial({color:'#efaf9f',transparent:true,depthWrite:false,side:THREE.DoubleSide}),reactions);
    const star=add(new THREE.ShapeGeometry(starShape),new THREE.MeshBasicMaterial({color:'#f3d58a',transparent:true,depthWrite:false,side:THREE.DoubleSide}),reactions);
    heart.userData.index=star.userData.index=i;heart.userData.kind='heart';star.userData.kind='star';heart.castShadow=star.castShadow=false;
  }

  // One plush curled tail, with a rounded tip.
  const tails=[], flames=[];
  const tail=new THREE.Group();tail.position.set(.44,.24,-.25);root.add(tail);
  line(tail,red,[[0,0,0],[.42,.03,0],[.67,.22,.05],[.75,.55,.03],[.62,.69,.04],[.49,.57,.07]],.125);
  orb(tail,red,[.49,.57,.07],[.126,.126,.126]);tails.push(tail);

  // A floppy felt hat: elliptical brim, bent tapered crown, stitched plum band.
  const hat=new THREE.Group();hat.position.set(-.08,.60,-.04);hat.rotation.z=.15;head.add(hat);
  const felt=material('#304b59'),band=material('#6d8173');
  orb(hat,felt,[0,0,0],[1.05,.095,.76]);
  const hatGeo=new THREE.CylinderGeometry(.015,.67,1.12,48,20,false);
  const hp=hatGeo.attributes.position;
  for(let i=0;i<hp.count;i++) {const y=hp.getY(i),u=(y+.56)/1.12;hp.setX(i,hp.getX(i)-.60*u*u*u);hp.setY(i,y-.22*u*u*u);}
  hatGeo.computeVertexNormals();add(hatGeo,felt,hat,[0,.55,0],[1,1,.82]);
  add(new THREE.CylinderGeometry(.59,.66,.15,48),band,hat,[0,.13,0],[1,1,.82]);
  const moon=orb(hat,gold,[.02,.15,.54],[.105,.115,.025]);
  orb(hat,band,[.07,.19,.559],[.083,.087,.015]);
  for(let i=-5;i<=5;i++)orb(hat,cream,[i*.1,.071,.55-Math.abs(i)*.021],[.018,.007,.009]);

  for(let i=0;i<32;i++){
    const a=i*Math.PI*2/32;
    line(hat,band,[[Math.sin(a)*1.005,.041,Math.cos(a)*.72],[Math.sin(a)*.977,.05,Math.cos(a)*.70]],.005);
  }
  root.userData={cloak,head,torso,eyes,pupils,happyEyes,brows,smile,openSmile,reactions,hat,ears,paws,tails,flames,bell,meshes};
  return root;
}

export function animateSpiritCat(cat,t,dt,{still=false,look=0,lookY=0,greet=0,mood='idle',attention=false,watching=false,cozy=false}={}) {
  const {cloak,head,torso,eyes,pupils,happyEyes,brows,smile,openSmile,reactions,hat,ears,paws,tails,bell}=cat.userData;
  const happy=(mood==='pet'||mood==='hello'||mood==='celebrate')&&greet>0;
  const sleepy=mood==='sleepy'||cozy;
  const blinkPhase=t%4.7;
  const blink=!still&&blinkPhase>4.40?Math.max(.04,Math.abs(blinkPhase-4.55)/.15):1;
  const damp=(current,target)=>still?target:THREE.MathUtils.damp(current,target,8,dt);
  head.rotation.z=damp(head.rotation.z,cozy?-.17:happy?-.12:attention?.09:still?0:Math.sin(t*.7)*.025);
  head.rotation.y=damp(head.rotation.y,still?0:look*(watching?.38:.24));
  head.rotation.x=damp(head.rotation.x,still?0:-lookY*(watching?.19:.10)+(sleepy?.07:0));
  head.position.y=1.75+(still?0:Math.sin(t*(happy?5:1.9))*(happy?.025:.01));
  torso.scale.y=1+(still?0:Math.sin(t*1.9)*.018);
  happyEyes.visible=happy||cozy;
  eyes.forEach((eye,i)=>{
    eye.visible=!happy&&!cozy;eye.scale.y=damp(eye.scale.y,(sleepy?.50:attention?1.08:.94)*blink);
    pupils[i].position.x=damp(pupils[i].position.x,still?0:look*.035);
    pupils[i].position.y=damp(pupils[i].position.y,still?0:lookY*.025);
  });
  brows.forEach((b,i)=>{b.position.y=damp(b.position.y,.265+(attention?.045:happy?.02:0));b.rotation.z=(i===0?1:-1)*(happy?.12:attention?-.12:.04);});
  smile.visible=!happy;openSmile.visible=happy;
  paws[1].rotation.z=damp(paws[1].rotation.z,still?0:mood==='hello'&&happy?1.9+Math.sin(t*8)*.25:mood==='pet'&&happy?.5:watching?.55:cozy?.8:0);
  paws[0].rotation.z=damp(paws[0].rotation.z,mood==='celebrate'&&happy?-1.1:cozy?-.65:0);
  ears.forEach((ear,i)=>{ear.rotation.z=still?0:Math.sin(t*1.1+i)*.035+(happy?(i===0?-.08:.08):0);});
  tails.forEach(tail=>{tail.rotation.y=still?0:Math.sin(t*(watching?3:cozy?.65:happy?4.2:1.3))*(happy?.27:.13);});
  hat.rotation.z=.15+(still?0:Math.sin(t*(happy?5:1.9))*(happy?.025:.006));
  reactions.visible=happy&&(mood==='pet'||mood==='celebrate');
  reactions.children.forEach(r=>{const i=r.userData.index,p=still?.4:(t*.55+i*.29)%1;r.visible=r.userData.kind===(mood==='celebrate'?'star':'heart');r.position.set((i-1)*.55+(still?0:Math.sin(t+i)*.05),2.9+p*.75,.75);r.scale.setScalar(.65+Math.sin(p*Math.PI)*.3);r.material.opacity=still?.8:Math.sin(p*Math.PI)*.85;});
  cloak.rotation.z=damp(cloak.rotation.z,cozy?.04:head.rotation.z*.18);
  cloak.scale.x=1+(still?0:Math.sin(t*1.9)*.012);
  torso.rotation.z=damp(torso.rotation.z,cozy?-.07:watching?-look*.025:0);
  bell.rotation.z=still?0:Math.sin(t*1.9)*.04;
}
