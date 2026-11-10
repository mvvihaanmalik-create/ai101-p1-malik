import * as THREE from 'three';

// Live details share the plate's world coordinates and camera. No full-screen
// colour changes identify an answer; every variant changes exactly one detail.
export async function createEncounterArt(scene) {
 const group = new THREE.Group(); scene.add(group);
 const texture = await new THREE.TextureLoader().loadAsync('assets/textures/carpet.png');
 texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
 const carpetGeo = new THREE.PlaneGeometry(2.36, 4.8, 28, 60);
 carpetGeo.rotateX(-Math.PI / 2); carpetGeo.translate(0, .052, -12.8);
 const pos = carpetGeo.attributes.position, uv = carpetGeo.attributes.uv;
 for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + 1.18) / 2.36, (-pos.getZ(i) + 1) * 6 / 26);
 const carpet = new THREE.Mesh(carpetGeo, new THREE.MeshStandardMaterial({map: texture, roughness: .96, side: THREE.DoubleSide}));
 carpet.receiveShadow = true; group.add(carpet);
 const rainData = [], points = [];
 for (const windowY of [5.6, 12.9, 19.7]) for (let i = 0; i < 100; i++) {
  // Deterministic, uneven spacing avoids a visible lattice on the panes.
  const hash = n => THREE.MathUtils.euclideanModulo(Math.sin(n * 127.1 + windowY * 311.7) * 43758.5453, 1);
  const across = hash(i + 1) * 1.7 - .85;
  rainData.push({windowY, across, phase: hash(i + 431), speed: .33 + hash(i + 617) * .2, length: .035 + hash(i + 89) * .045});
  points.push(0,0,0,0,0,0);
 }
 const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
 const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({color: 0x9bcad0, transparent: true, opacity: .38, depthWrite: false}));
 rain.frustumCulled = false; group.add(rain);
 const brass = new THREE.MeshStandardMaterial({color: 0xa68652, metalness: .65, roughness: .45});
 const markers = [];
 for (const [x,y,width] of [[60,3.25,2.55],[0,21.9,2.55]]) {
  const marker = new THREE.Group(); scene.add(marker); markers.push(marker);
  for (const offset of [-.065,.065]) { const strip = new THREE.Mesh(new THREE.BoxGeometry(width,.012,.018),brass); strip.position.set(x,.065,-y+offset); marker.add(strip); }
 }
 let anomaly = null, breathing = 0, lastBreathing = -1;
 function heightAt(x, y) {
  if (Math.abs(x) >= 1.18 || Math.abs(y - 12.8) >= 2.4) return 0;
  return breathing * Math.pow(Math.cos(x / 1.18 * Math.PI / 2), 2) * Math.pow(Math.cos((y - 12.8) / 2.4 * Math.PI / 2), 2);
 }
 function update(time, room, id) {
  anomaly = id; group.visible = room === 'corridor'; markers[0].visible = room === 'landing'; markers[1].visible = room === 'corridor';
  if (!group.visible) return;
  breathing = anomaly === 'E6' ? .14 + .30 * (.5 + .5 * Math.sin(time * 1.25)) : 0;
  if(breathing !== lastBreathing){
   for (let i = 0; i < pos.count; i++) pos.setY(i, .052 + heightAt(pos.getX(i), -pos.getZ(i)));
   pos.needsUpdate = true; carpetGeo.computeVertexNormals(); lastBreathing = breathing;
  }
  const p = rainGeo.attributes.position;
  rainData.forEach((drop,i) => {
   const direction = anomaly === 'E2' && drop.windowY === 12.9 ? 1 : -1;
   const h = 1.17 + THREE.MathUtils.euclideanModulo(drop.phase + time * drop.speed * direction, 1) * 1.87;
   // Stay in front of glass but behind the timber bars; leave the crossbar clear.
   const hidden = Math.abs(h - 2.1) < .12 || Math.abs(drop.across) < .055;
   p.setXYZ(i*2, 2.147, h, -drop.windowY - drop.across);
   p.setXYZ(i*2+1, 2.147, hidden ? h : Math.max(1.17,h-drop.length), -drop.windowY-drop.across);
  }); p.needsUpdate = true;
 }
 return {update, heightAt};
}
