import * as THREE from 'three';

// Live details share the plate's world coordinates and camera. No full-screen
// colour changes identify an answer; every variant changes exactly one detail.
export async function createEncounterArt(scene) {
 const group = new THREE.Group(); scene.add(group);
 const texture = await new THREE.TextureLoader().loadAsync('assets/textures/carpet.png');
 texture.anisotropy=8;texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
 const carpetGeo = new THREE.PlaneGeometry(2.36, 4.8, 28, 60);
 carpetGeo.rotateX(-Math.PI / 2); carpetGeo.translate(0, .052, -12.8);
 const pos = carpetGeo.attributes.position, uv = carpetGeo.attributes.uv;
 for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + 1.18) / 2.36, (-pos.getZ(i) + 1) * 6 / 26);
 const carpet = new THREE.Mesh(carpetGeo, new THREE.MeshStandardMaterial({map: texture, roughness: .96, side: THREE.DoubleSide}));
 carpet.receiveShadow = true; group.add(carpet);
 // Pools cast by the gallery's three divided windows. Shear the footprint
 // along the passage to follow the raking light built into the wall plates.
 const spillCanvas=document.createElement('canvas');spillCanvas.width=256;spillCanvas.height=192;
 const ctx=spillCanvas.getContext('2d');ctx.filter='blur(5px)';ctx.fillStyle='white';
 for(const x of [22,132])for(const y of [12,97])ctx.fillRect(x,y,101,77);
 const windowMap=new THREE.CanvasTexture(spillCanvas);
 const spillMaterial=new THREE.MeshBasicMaterial({map:windowMap,color:0x849da9,transparent:true,opacity:.105,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
 const windowFloor=new THREE.PlaneGeometry(3.85,1.68);windowFloor.rotateX(-Math.PI/2);
 const footprint=windowFloor.attributes.position;
 for(let i=0;i<footprint.count;i++)footprint.setZ(i,footprint.getZ(i)+footprint.getX(i)*.41);
 windowFloor.computeBoundingSphere();
 for(const depth of [5.6,12.9,19.7]){
  const spill=new THREE.Mesh(windowFloor,spillMaterial);spill.position.set(.17,.06,-depth-.69);group.add(spill);
 }
 // The suite door is closed. A thin warm seam gives the guest a destination
 // across the dark carpet without revealing the room on the other side.
 const slitCanvas=document.createElement('canvas');slitCanvas.width=256;slitCanvas.height=192;
 const slitCtx=slitCanvas.getContext('2d');
 for(let y=0;y<192;y++){
  const reach=y/191,spread=82+37*reach;
  const beam=slitCtx.createLinearGradient(128-spread,0,128+spread,0);
  for(const [at,alpha] of [[0,0],[.15,.86],[.5,1],[.85,.86],[1,0]])beam.addColorStop(at,'rgba(255,206,149,'+alpha*(.69*Math.exp(-reach*6)+.31*Math.exp(-reach*32))+')');
  slitCtx.fillStyle=beam;slitCtx.fillRect(0,y,256,1);
 }
 const leak=new THREE.Mesh(new THREE.PlaneGeometry(2.05,1.44),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(slitCanvas),color:0xe69a66,transparent:true,opacity:.52,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
 leak.rotation.x=-Math.PI/2;leak.position.set(120,.063,-7.92);scene.add(leak);leak.visible=false;
 const rainData = [], points = [], reflections=[];
 for (const windowY of [5.6, 12.9, 19.7]) for (let i = 0; i < 100; i++) {
  // Deterministic, uneven spacing avoids a visible lattice on the panes.
  const hash = n => THREE.MathUtils.euclideanModulo(Math.sin(n * 127.1 + windowY * 311.7) * 43758.5453, 1);
  const across = hash(i + 1) * 1.7 - .85;
  rainData.push({windowY, across, phase: hash(i + 431), speed: .33 + hash(i + 617) * .2, length: .035 + hash(i + 89) * .045});
  points.push(0,0,0,0,0,0);
  const glint=.35+.55*hash(i+57);reflections.push(glint*.62,glint*.83,glint,glint*.11,glint*.17,glint*.23);
 }
 const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
 rainGeo.setAttribute('color',new THREE.Float32BufferAttribute(reflections,3));
 const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({color: 0xffffff,vertexColors:true, transparent: true, opacity: .72, depthWrite: false}));
 rain.frustumCulled = false; group.add(rain);
 const brass = new THREE.MeshStandardMaterial({color: 0xa68652, metalness: .65, roughness: .45});
 const markers = [];
 for (const [x,y,width] of [[60,3.25,2.55],[0,21.9,2.55],[0,4.4,2.55]]) {
  const marker = new THREE.Group(); scene.add(marker); markers.push(marker);
  for (const offset of [-.065,.065]) { const strip = new THREE.Mesh(new THREE.BoxGeometry(width,.012,.018),brass); strip.position.set(x,.065,-y+offset); marker.add(strip); }
 }
 let anomaly = null, breathing = 0, lastBreathing = -1;
 function heightAt(x, y) {
  if (Math.abs(x) >= 1.18 || Math.abs(y - 12.8) >= 2.4) return 0;
  return breathing * Math.pow(Math.cos(x / 1.18 * Math.PI / 2), 2) * Math.pow(Math.cos((y - 12.8) / 2.4 * Math.PI / 2), 2);
 }
 function update(time, room, id) {
  anomaly = id; leak.visible=room==='suite'; group.visible = room === 'corridor'; markers[0].visible = room === 'landing'; markers[1].visible = room === 'corridor'; markers[2].visible = room === 'corridor';
  if (!group.visible) return;
  breathing = anomaly === 'E6' ? .18 + .38 * (.5 + .5 * Math.sin(time * 1.25)) : 0;
  if(breathing !== lastBreathing){
   for (let i = 0; i < pos.count; i++) pos.setY(i, .052 + heightAt(pos.getX(i), -pos.getZ(i)));
   pos.needsUpdate = true; carpetGeo.computeVertexNormals(); lastBreathing = breathing;
  }
  const p = rainGeo.attributes.position;
  rainData.forEach((drop,i) => {
   const direction = anomaly === 'E2' && drop.windowY === 12.9 ? 1 : -1;
   const path=THREE.MathUtils.euclideanModulo(drop.phase+time*drop.speed*direction*(direction===1?1.85:1),1);
   // Water hesitates at imperfections in the pane, then gathers speed again.
   const h=1.17+(path-.036*Math.sin(path*Math.PI*6))*1.87;
   const track=-drop.windowY-drop.across+.013*Math.sin(path*Math.PI*4+drop.phase*9);
   // Stay in front of glass but behind the timber bars; leave the crossbar clear.
   const hidden = Math.abs(h - 2.1) < .12 || Math.abs(drop.across) < .055;
   p.setXYZ(i*2, 2.147, h, track);
   p.setXYZ(i*2+1, 2.147, hidden?h:THREE.MathUtils.clamp(h-drop.length*direction*(direction===1?2.1:1),1.17,3.04),track+.002);
  }); p.needsUpdate = true;
 }
 return {update, heightAt};
}
