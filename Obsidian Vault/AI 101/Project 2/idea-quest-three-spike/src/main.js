import * as THREE from 'three';
import { approvedCount, levelFor } from './progress.js';

const IDS = ['idea-quest', 'obsidian-gaze', 'image-palette'];
const STEPS = ['Define the goal', 'Choose a route', 'Build a small prototype', 'Human check', 'Iterate or stop'];
const COLORS = { 'idea-quest': '#c68af1', 'obsidian-gaze': '#42e2cb', 'image-palette': '#ffbd65' };
const LABELS = { 'idea-quest': 'idea.quest', 'obsidian-gaze': 'Gaze', 'image-palette': 'Image Palette' };
const DEMO = new URLSearchParams(window.location.search).get('demo') === '1';
const $ = (id) => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let records = new Map();
let selectedId = null;
let scene, camera, renderer, cat, lantern, raycaster;
const jars = new Map();
const pickMeshes = [];
let lastFocusedId = null;
let lastRegistryText = null;
let hoveredId = null;

function showError(message) { $('error').textContent = message; $('error').hidden = false; }
function clearError() { $('error').hidden = true; }

function mat(color, options = {}) { return new THREE.MeshToonMaterial({ color, ...options }); }
function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(x, y, z);
  parent.add(item);
  return item;
}
function ball(parent, material, x, y, z, sx, sy = sx, sz = sx) {
  const item = mesh(new THREE.SphereGeometry(1, 24, 16), material, parent, x, y, z);
  item.scale.set(sx, sy, sz);
  return item;
}
function block(parent, material, x, y, z, sx, sy, sz) {
  return mesh(new THREE.BoxGeometry(sx, sy, sz), material, parent, x, y, z);
}
function stroke(parent, material, points, radius = .025) {
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))), 24, radius, 6, false), material, parent);
}
function woodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const context = canvas.getContext('2d');
  const wash = context.createLinearGradient(0, 0, 0, 256);
  wash.addColorStop(0, '#d39158'); wash.addColorStop(.55, '#a86648'); wash.addColorStop(1, '#8e5543');
  context.fillStyle = wash; context.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 40; i++) {
    const y = i * 6.5;
    context.beginPath();
    for (let x = 0; x <= 512; x += 8) {
      const wave = Math.sin(x * .018 + i * .6) * (1.5 + i % 3) + Math.sin(x * .046 + i) * .7;
      if (x === 0) context.moveTo(x, y + wave); else context.lineTo(x, y + wave);
    }
    context.strokeStyle = i % 4 === 0 ? '#f2b77a33' : '#5e35402d';
    context.lineWidth = i % 4 === 0 ? 2 : 1;
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildBackdrop() {
  scene.background = new THREE.Color('#281a33');
  scene.fog = new THREE.Fog('#281a33', 13, 27);
  const wall = mat('#65465f');
  const beam = mat('#492c45');
  block(scene, wall, 0, 2, -5.2, 22, 9, .22);
  block(scene, beam, 0, 5.1, -4.9, 22, .28, .35);
  block(scene, beam, -5, 2, -4.9, .28, 7, .35);
  block(scene, beam, 5, 2, -4.9, .28, 7, .35);
  const panel = mat('#76516a');
  const inlay = mat('#b17a71');
  for (const x of [-4.36, -2.9, -1.44, 0, 1.44, 2.9, 4.36]) {
    block(scene, panel, x, -.15, -4.75, 1.36, 1.9, .16);
    block(scene, inlay, x, .76, -4.58, 1.4, .055, .13);
    block(scene, beam, x, -.92, -4.57, 1.46, .13, .18);
  }
  block(scene, inlay, 0, .85, -4.45, 10, .12, .22);
  for (const x of [-4.65, -1.2, 4.65]) {
    block(scene, beam, x, 2.75, -4.65, .19, 3.8, .23);
    block(scene, inlay, x, 4.6, -4.49, .34, .12, .28);
  }

  const windowShape = new THREE.Shape();
  windowShape.moveTo(-1.25, 0);
  windowShape.lineTo(1.25, 0);
  windowShape.lineTo(1.25, 2.15);
  windowShape.absarc(0, 2.15, 1.25, 0, Math.PI, false);
  windowShape.lineTo(-1.25, 0);
  const windowGroup = new THREE.Group();
  windowGroup.position.set(2.45, 2.0, -4.99);
  scene.add(windowGroup);
  mesh(new THREE.ShapeGeometry(windowShape), new THREE.MeshBasicMaterial({ color: '#244c88' }), windowGroup);
  ball(windowGroup, new THREE.MeshBasicMaterial({ color: '#ffecbb' }), .53, 2.62, .03, .25, .25, .02);
  block(windowGroup, mat('#9a6580'), 0, 1.05, .08, .10, 2.1, .14);
  block(windowGroup, mat('#9a6580'), 0, 1.7, .08, 2.45, .10, .14);
  const arch = mesh(new THREE.TorusGeometry(1.3, .1, 8, 36, Math.PI), mat('#9a6580'), windowGroup, 0, 2.15, .1);
  arch.rotation.z = 0;
  block(windowGroup, mat('#9a6580'), -1.3, 1.06, .1, .17, 2.2, .17);
  block(windowGroup, mat('#9a6580'), 1.3, 1.06, .1, .17, 2.2, .17);
  block(windowGroup, mat('#9a6580'), 0, -.08, .1, 2.75, .18, .2);
  const night = new THREE.Group();
  night.position.set(0, 0, .035);
  windowGroup.add(night);
  const skyline = mat('#17365e');
  for (const [x, y, w, h] of [[-.8, .35, .34, .7], [-.43, .4, .25, .8], [-.09, .28, .22, .56], [.28, .45, .29, .9], [.65, .32, .3, .64]]) {
    block(night, skyline, x, y, 0, w, h, .015);
  }
  for (const [x, y, size] of [[-.7, 2.7, .035], [-.28, 3.12, .025], [.92, 3.07, .03], [.28, 2.21, .02], [-.9, 1.78, .025]]) {
    ball(night, new THREE.MeshBasicMaterial({ color: '#fbdfa2' }), x, y, 0, size, size, .012);
  }
  const curtain = mat('#9c5c7c', { side: THREE.DoubleSide });
  for (const sign of [-1, 1]) {
    const drape = mesh(new THREE.ConeGeometry(.42, 2.9, 7, 1, true, 0, Math.PI), curtain, windowGroup, sign * 1.39, 1.38, .32);
    drape.rotation.y = sign * .5;
    block(windowGroup, mat('#e5ad72'), sign * 1.28, 1.15, .43, .45, .055, .07);
  }

  const shelf = mat('#a56a4b');
  const bookColors = ['#7a5d9e', '#517c8a', '#ad6a66', '#cca376', '#79658b'];
  for (const [sx, sy] of [[-3.53, 3.15], [4.04, 3.15]]) {
    block(scene, shelf, sx, sy, -4.12, 1.55, .12, .62);
    block(scene, mat('#e2b17c'), sx, sy + .08, -4.12, 1.57, .04, .64);
    for (let i = 0; i < 6; i++) {
      const h = .38 + (i % 3) * .09;
      block(scene, mat(bookColors[(i + (sx > 0 ? 2 : 0)) % bookColors.length]), sx - .52 + i * .2, sy + .13 + h / 2, -4.11, .16, h, .37);
    }
    block(scene, inlay, sx - .52, sy - .17, -4.06, .1, .32, .45);
    block(scene, inlay, sx + .52, sy - .17, -4.06, .1, .32, .45);
  }

  const floor = block(scene, mat('#322735'), 0, -.58, .5, 25, .15, 14);
  floor.receiveShadow = true;
  const floorLine = mat('#46384a');
  for (let z = -6; z <= 7; z += 1.25) block(scene, floorLine, 0, -.485, z, 22, .005, .018);
  const gold = mat('#f0ae65');
  for (let i = 0; i < 9; i++) {
    const star = mesh(new THREE.OctahedronGeometry(.03 + (i % 3) * .012), gold, scene,
      -3.9 + i * .9, 3.1 + Math.sin(i * 3.7) * .55, -3.7);
    star.rotation.z = i * .4;
  }
}

function buildTable() {
  const table = new THREE.Group();
  scene.add(table);
  const wood = mat('#ffffff', { map: woodTexture() });
  const darkWood = mat('#663a39');
  const edge = mat('#bd7b45');
  const grain = mat('#bb8058');
  const brass = mat('#e3ad6a');
  block(table, darkWood, 0, .61, .35, 9.4, .37, 3.6);
  for (let i = -1; i <= 1; i++) {
    const plank = block(table, wood, 0, .84, .35 + i * 1.08, 9.15, .1, 1.04);
    plank.castShadow = true;
    block(table, edge, 0, .86, .86 + i * 1.08, 9.1, .015, .028);
    for (let j = 0; j < 3; j++) {
      stroke(table, grain, [
        [-4.22, .899, .18 + i * 1.08 + j * .25],
        [-2.1, .901, .2 + i * 1.08 + j * .25 + .03],
        [.15, .899, .17 + i * 1.08 + j * .25],
        [2.7, .9, .19 + i * 1.08 + j * .25 - .02],
        [4.2, .899, .18 + i * 1.08 + j * .25],
      ], .006);
    }
  }
  for (const x of [-3.95, 3.95]) for (const z of [-.85, 1.4]) {
    block(table, darkWood, x, -.12, z, .55, 1.3, .55);
  }
  block(table, edge, 0, .49, 2.08, 9.45, .09, .1);
  block(table, brass, 0, .68, 2.1, 9.2, .025, .035);
  for (const x of [-4.45, 4.45]) {
    ball(table, brass, x, .66, 2.13, .05, .05, .02);
  }
}

function whisker(group, x1, y1, x2, y2) {
  const a = new THREE.Vector3(x1, y1, .63);
  const b = new THREE.Vector3(x2, y2, .63);
  const d = b.clone().sub(a);
  const line = mesh(new THREE.CylinderGeometry(.009, .009, d.length(), 6), mat('#d6a2ab'), group);
  line.position.copy(a.clone().add(b).multiplyScalar(.5));
  line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
}

function buildCat() {
  cat = new THREE.Group();
  cat.position.set(-3.1, .92, .35);
  scene.add(cat);
  const fur = mat('#222238');
  const litFur = mat('#39344d');
  const ear = mat('#a06080');
  const hat = mat('#704798');
  const hatLight = mat('#a06ac0');
  const amber = new THREE.MeshBasicMaterial({ color: '#ffc96e' });
  const black = new THREE.MeshBasicMaterial({ color: '#241822' });
  const shine = new THREE.MeshBasicMaterial({ color: '#fff3d0' });
  const eyes = [];

  ball(cat, litFur, 0, .58, 0, .54, .66, .43);
  ball(cat, mat('#724f8c'), 0, .57, -.26, .6, .65, .32);
  ball(cat, fur, 0, 1.55, .12, .77, .68, .64);
  ball(cat, litFur, -.5, 1.34, .4, .32, .25, .34);
  ball(cat, litFur, .5, 1.34, .4, .32, .25, .34);
  for (const sign of [-1, 1]) {
    const e = mesh(new THREE.ConeGeometry(.31, .65, 3), fur, cat, sign * .52, 2.08, .03);
    e.rotation.z = sign * -.25;
    const inner = mesh(new THREE.ConeGeometry(.16, .36, 3), ear, cat, sign * .52, 2.06, .29);
    inner.rotation.z = sign * -.25;
    ball(cat, fur, sign * .31, .16, .42, .18, .12, .21);
    for (const eye of [
      ball(cat, amber, sign * .31, 1.61, .68, .205, .255, .075),
      ball(cat, black, sign * .27, 1.6, .75, .085, .165, .035),
      ball(cat, shine, sign * .25 - .045, 1.70, .79, .044, .06, .02),
    ]) { eye.userData.openHeight = eye.scale.y; eyes.push(eye); }
    whisker(cat, sign * .42, 1.3, sign * .85, 1.37);
    whisker(cat, sign * .43, 1.25, sign * .83, 1.18);
    ball(cat, mat('#e3869d'), sign * .51, 1.3, .66, .14, .055, .02);
    const brow = ball(cat, fur, sign * .29, 1.93, .67, .22, .045, .05);
    brow.rotation.z = -sign * .18;
  }
  ball(cat, ear, 0, 1.37, .77, .09, .065, .05);
  ball(cat, mat('#e98594'), 0, 1.22, .76, .085, .07, .025);
  ball(cat, mat('#f6c1bd'), 0, 1.11, .77, .13, .035, .03);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.4, .45, -.2), new THREE.Vector3(-.86, .45, -.25),
    new THREE.Vector3(-1.01, 1.0, -.15), new THREE.Vector3(-.86, 1.14, .04)
  ]);
  mesh(new THREE.TubeGeometry(tailCurve, 18, .105, 8, false), fur, cat);

  const brim = ball(cat, hat, -.09, 2.18, .06, 1.15, .13, .93);
  brim.rotation.z = -.14;
  brim.rotation.x = -.12;
  const hatCrown = mesh(new THREE.CylinderGeometry(.37, .65, .89, 32), hat, cat, -.15, 2.71, -.05);
  hatCrown.rotation.z = -.21;
  const hatTip = mesh(new THREE.CylinderGeometry(.09, .37, .64, 28), hatLight, cat, -.35, 3.29, -.05);
  hatTip.rotation.z = -.52;
  ball(cat, hatLight, -.64, 3.51, -.05, .16, .15, .15);
  const hatBand = mat('#f1b86f');
  mesh(new THREE.TorusGeometry(.63, .055, 8, 30), hatBand, cat, -.12, 2.25, -.04).rotation.x = Math.PI / 2;
  const hatStar = mesh(new THREE.OctahedronGeometry(.16, 0), mat('#ffe7a9'), cat, .28, 2.27, .75);
  hatStar.rotation.z = Math.PI / 4;
  mesh(new THREE.TorusGeometry(.44, .045, 8, 28), mat('#edb468'), cat, -.16, 2.26, -.03).rotation.x = Math.PI / 2;
  const capeTie = mat('#eac077');
  ball(cat, capeTie, 0, .63, .47, .14, .14, .07);
  ball(cat, mat('#f6e0ac'), 0, .65, .51, .055, .055, .02);
  const collar = mesh(new THREE.TorusGeometry(.46, .09, 8, 28, Math.PI), hatLight, cat, 0, .9, .15);
  collar.rotation.x = Math.PI / 2;
  cat.userData.eyes = eyes;
  cat.userData.hatStar = hatStar;
  return cat;
}

function makeCandle(x, z, height) {
  const candle = new THREE.Group();
  candle.position.set(x, .92, z);
  scene.add(candle);
  mesh(new THREE.CylinderGeometry(.12, .14, height, 12), mat('#f3d8a5'), candle, 0, height / 2, 0);
  mesh(new THREE.CylinderGeometry(.2, .19, .055, 16), mat('#a86d54'), candle, 0, .03, 0);
  const flame = mesh(new THREE.ConeGeometry(.075, .24, 10), new THREE.MeshBasicMaterial({ color: '#ffd27b' }), candle, 0, height + .16, 0);
  const light = new THREE.PointLight('#ffae69', 3, 4, 2);
  light.position.set(0, height + .2, .1);
  candle.add(light);
  return flame;
}

function buildLantern() {
  lantern = new THREE.Group();
  lantern.position.set(-.45, 4.42, -2.35);
  scene.add(lantern);
  const iron = mat('#5c3658');
  const gold = mat('#e7aa67');
  mesh(new THREE.CylinderGeometry(.025, .025, 1.2, 8), iron, lantern, 0, .43, 0);
  mesh(new THREE.ConeGeometry(.34, .26, 8), iron, lantern, 0, -.29, 0);
  const glow = ball(lantern, new THREE.MeshBasicMaterial({ color: '#ffd99a', transparent: true, opacity: .78 }), 0, -.7, 0, .29, .35, .29);
  glow.renderOrder = 2;
  mesh(new THREE.CylinderGeometry(.37, .37, .07, 12), gold, lantern, 0, -.99, 0);
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3;
    mesh(new THREE.CylinderGeometry(.022, .022, .68, 6), gold, lantern, Math.cos(angle) * .29, -.67, Math.sin(angle) * .29);
  }
  const light = new THREE.PointLight('#ffbf76', 2.2, 8, 2);
  light.position.y = -.71;
  lantern.add(light);
}

const bottleProfile = [
  [0, .06], [.30, .06], [.52, .18], [.62, .35], [.64, .61], [.64, 1.22],
  [.57, 1.40], [.39, 1.58], [.29, 1.68], [.29, 1.94], [.34, 1.94]
];
function radiusAt(y) {
  for (let i = 1; i < bottleProfile.length; i++) {
    const [r1, y1] = bottleProfile[i];
    const [r0, y0] = bottleProfile[i - 1];
    if (y <= y1) return r0 + (r1 - r0) * ((y - y0) / Math.max(.0001, y1 - y0));
  }
  return bottleProfile.at(-1)[0];
}
function liquidGeometry(level) {
  if (level <= 0) return null;
  const top = .08 + 1.49 * level;
  const profile = [new THREE.Vector2(0, .075)];
  for (const [r, y] of bottleProfile) {
    if (y > .075 && y < top) profile.push(new THREE.Vector2(r * .89, y));
  }
  profile.push(new THREE.Vector2(radiusAt(top) * .89, top));
  profile.push(new THREE.Vector2(0, top));
  return { geometry: new THREE.LatheGeometry(profile, 32), top, radius: radiusAt(top) * .89 };
}
function updateLiquid(jar, level) {
  if (jar.potionGlow) jar.potionGlow.intensity = level > 0 ? .45 + level * .6 : 0;
  if (jar.liquid) {
    jar.group.remove(jar.liquid);
    jar.liquid.traverse((node) => { if (node.isMesh) node.geometry.dispose(); });
    jar.liquid = null;
  }
  const shape = liquidGeometry(level);
  if (!shape) return;
  const liquid = new THREE.Group();
  const color = COLORS[jar.id];
  mesh(shape.geometry, new THREE.MeshToonMaterial({ color, emissive: color, emissiveIntensity: .23, side: THREE.DoubleSide }), liquid);
  const surface = mesh(new THREE.CircleGeometry(shape.radius, 32), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }), liquid, 0, shape.top, 0);
  surface.rotation.x = -Math.PI / 2;
  for (let i = 0; i < Math.max(2, Math.floor(level * 8)); i++) {
    const angle = i * 2.39996;
    const radius = .11 + (i % 3) * .11;
    const y = .2 + (shape.top - .3) * ((i + .5) / Math.max(2, Math.floor(level * 8)));
    if (y < shape.top - .05) ball(liquid, new THREE.MeshBasicMaterial({ color: '#fff4d2', transparent: true, opacity: .46 }), Math.cos(angle) * radius, y, Math.sin(angle) * radius, .03 + (i % 2) * .012);
  }
  liquid.renderOrder = 1;
  jar.group.add(liquid);
  jar.liquid = liquid;
}
function buildJar(id, x) {
  const group = new THREE.Group();
  group.position.set(x, .93, .42);
  scene.add(group);
  const color = COLORS[id];
  const profile = bottleProfile.map(([r, y]) => new THREE.Vector2(r, y));
  const glass = mesh(new THREE.LatheGeometry(profile, 32), new THREE.MeshPhysicalMaterial({
    color: '#d9f4f5', transparent: true, opacity: .24, roughness: .11, metalness: 0,
    clearcoat: 1, clearcoatRoughness: .08,
    depthWrite: false, side: THREE.DoubleSide
  }), group);
  glass.renderOrder = 3;
  const bronze = mat('#d8a979');
  const pale = mat('#f8e5bb');
  mesh(new THREE.CylinderGeometry(.7, .73, .055, 32), mat('#774956'), group, 0, .005, 0);
  mesh(new THREE.TorusGeometry(.65, .035, 8, 32), bronze, group, 0, .12, 0).rotation.x = Math.PI / 2;
  mesh(new THREE.TorusGeometry(.35, .035, 6, 28), mat('#f4d3aa'), group, 0, 1.93, 0).rotation.x = Math.PI / 2;
  const cork = mesh(new THREE.CylinderGeometry(.31, .28, .27, 12), mat('#bc8552'), group, 0, 2.06, 0);
  cork.rotation.z = -.03;
  mesh(new THREE.CylinderGeometry(.34, .34, .035, 24), bronze, group, 0, 2.2, 0);
  const wax = ball(group, mat(color), 0, 2.23, 0, .16, .06, .16);
  wax.rotation.z = -.08;
  const medallion = mesh(new THREE.OctahedronGeometry(.18, 0), pale, group, 0, 1.12, .67);
  medallion.rotation.z = Math.PI / 4;
  ball(group, mat(color), 0, 1.12, .76, .07, .07, .018);
  for (const sign of [-1, 1]) {
    stroke(group, new THREE.MeshBasicMaterial({ color: '#f7fff6', transparent: true, opacity: .35 }), [
      [sign * .41, .42, .48], [sign * .47, .75, .47], [sign * .46, 1.1, .45], [sign * .37, 1.39, .37]
    ], .014);
  }
  mesh(new THREE.TorusGeometry(.39, .025, 6, 28), new THREE.MeshBasicMaterial({ color }), group, 0, .25, 0).rotation.x = Math.PI / 2;
  const potionGlow = new THREE.PointLight(color, 0, 2.2, 2);
  potionGlow.position.set(0, .72, .1);
  group.add(potionGlow);
  const jar = { id, group, homeX: x, liquid: null, level: -1, potionGlow };
  group.traverse((node) => {
    if (node.isMesh) { node.userData.projectId = id; pickMeshes.push(node); }
  });
  jars.set(id, jar);
  return jar;
}

function setupScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, .1, 60);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.19;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  $('scene').appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight('#b5a2c7', 1.05));
  const warm = new THREE.DirectionalLight('#ffd4a2', 3.3);
  warm.position.set(-3.5, 6, 5);
  warm.castShadow = true;
  warm.shadow.mapSize.set(1024, 1024);
  warm.shadow.camera.left = -7; warm.shadow.camera.right = 7;
  warm.shadow.camera.top = 7; warm.shadow.camera.bottom = -5;
  warm.shadow.bias = -.0005;
  scene.add(warm);
  const cool = new THREE.DirectionalLight('#87b2ff', 1.65);
  cool.position.set(4, 4, -3);
  scene.add(cool);
  buildBackdrop();
  buildTable();
  buildCat();
  buildLantern();
  makeCandle(-4.15, -.78, .72);
  makeCandle(4.12, -.75, .95);
  buildJar(IDS[0], -1.3);
  buildJar(IDS[1], .45);
  buildJar(IDS[2], 2.23);
  for (const jar of jars.values()) jar.group.traverse((node) => { if (node.isMesh && node.material?.type !== 'MeshPhysicalMaterial') node.castShadow = true; });
  cat.traverse((node) => { if (node.isMesh) node.castShadow = true; });
  raycaster = new THREE.Raycaster();
  renderer.domElement.addEventListener('pointerup', pickJar);
  renderer.domElement.addEventListener('pointermove', hoverJar);
  window.addEventListener('resize', resize);
  resize();
  renderer.setAnimationLoop(animate);
}

function resize() {
  if (!renderer) return;
  const bounds = $('scene').getBoundingClientRect();
  const mobile = bounds.width < 650;
  renderer.setSize(bounds.width, bounds.height, false);
  camera.aspect = Math.max(.1, bounds.width / bounds.height);
  camera.fov = mobile ? 48 : 40;
  camera.position.set(mobile ? .15 : 1.05, mobile ? 3.15 : 3.75, mobile ? 13.5 : 10.8);
  camera.lookAt(0, mobile ? 1.73 : 1.55, 0);
  camera.updateProjectionMatrix();
  cat.position.x = mobile ? -1.75 : -3.1;
  cat.scale.setScalar(mobile ? .82 : 1);
  const xs = mobile ? [-.66, .7, 1.94] : [-1.3, .45, 2.23];
  IDS.forEach((id, i) => { jars.get(id).homeX = xs[i]; });
}
function animate(time) {
  const still = reducedMotion.matches;
  jars.forEach((jar) => {
    const isSelected = jar.id === selectedId;
    const isHovered = jar.id === hoveredId;
    const goalX = jar.homeX + (isSelected ? (window.innerWidth < 650 ? -.13 : -.9) : 0);
    const goalZ = isSelected ? 1.8 : .42;
    const goalY = (isSelected ? 1.2 : .93) + (!still && isHovered ? .04 : 0);
    const goalScale = isSelected ? 1.26 : isHovered ? 1.055 : 1;
    const ease = still ? 1 : .09;
    jar.group.position.x += (goalX - jar.group.position.x) * ease;
    jar.group.position.y += (goalY - jar.group.position.y) * ease;
    jar.group.position.z += (goalZ - jar.group.position.z) * ease;
    jar.group.scale.lerp(new THREE.Vector3(goalScale, goalScale, goalScale), ease);
    if (!still && !isSelected) jar.group.rotation.z = Math.sin(time * .0011 + jar.homeX) * .012;
    else jar.group.rotation.z = 0;
    if (jar.potionGlow && jar.level > 0) {
      const base = .45 + jar.level * .6;
      jar.potionGlow.intensity = base * (isSelected ? 1.8 : isHovered ? 1.4 : 1) *
        (still ? 1 : 1 + .07 * Math.sin(time * .003 + jar.homeX));
    }
  });
  if (cat) {
    const blinkPhase = (time * .001) % 4.7;
    const blink = still ? 1 : blinkPhase > 4.37 && blinkPhase < 4.57
      ? Math.max(.08, Math.abs(blinkPhase - 4.47) * 10) : 1;
    for (const eye of cat.userData.eyes) eye.scale.y = eye.userData.openHeight * blink;
    cat.rotation.z = still ? 0 : Math.sin(time * .0012) * .014;
    const targetYaw = selectedId ? Math.max(-.13, Math.min(.13, (jars.get(selectedId).homeX + 3.1) * .025)) : 0;
    cat.rotation.y += (targetYaw - cat.rotation.y) * (still ? 1 : .04);
    cat.position.y = .92 + (still ? 0 : .012 * Math.sin(time * .0025));
    cat.userData.hatStar.rotation.y = still ? 0 : time * .0007;
  }
  if (lantern) lantern.rotation.z = still ? 0 : Math.sin(time * .0008) * .018;
  renderer.render(scene, camera);
}

function projectAtPointer(event) {
  if (!renderer) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(pickMeshes, false)[0]?.object.userData.projectId || null;
}
function pickJar(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  const id = projectAtPointer(event);
  if (id) selectProject(id);
}
function hoverJar(event) {
  hoveredId = projectAtPointer(event);
  renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'default';
}

function renderDock() {
  const dock = $('jarDock');
  dock.replaceChildren();
  for (const id of IDS) {
    const project = records.get(id);
    if (!project) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'jar-option';
    button.dataset.projectId = id;
    button.style.setProperty('--project-color', COLORS[id]);
    button.setAttribute('aria-pressed', String(selectedId === id));
    button.setAttribute('aria-label', `${project.title}, ${approvedCount(project)} of 5 gates approved. Open project details.`);
    const gem = document.createElement('span'); gem.className = 'jar-gem'; gem.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span'); copy.className = 'jar-copy';
    const name = document.createElement('span'); name.className = 'jar-name'; name.textContent = LABELS[id];
    const count = document.createElement('span'); count.className = 'jar-count'; count.textContent = `${approvedCount(project)} / 5 APPROVED`;
    copy.append(name, count); button.append(gem, copy);
    button.addEventListener('click', () => { lastFocusedId = id; selectProject(id); });
    button.addEventListener('pointerenter', () => { hoveredId = id; });
    button.addEventListener('pointerleave', () => { if (hoveredId === id) hoveredId = null; });
    button.addEventListener('focus', () => { hoveredId = id; });
    button.addEventListener('blur', () => { if (hoveredId === id) hoveredId = null; });
    dock.append(button);
  }
}
function renderDetails(project) {
  $('detailTitle').textContent = project.title;
  $('detailPitch').textContent = project.pitch;
  $('detailCount').textContent = `${approvedCount(project)} / 5`;
  $('detailSeal').style.color = COLORS[project.id];
  $('detailNext').textContent = project.nextMove;
  $('detailLatest').textContent = project.updates?.[0] ? `Latest · ${project.updates[0].at}: ${project.updates[0].text}` : 'No dated updates yet.';
  const list = $('gateList'); list.replaceChildren();
  project.gates.forEach((state, i) => {
    const item = document.createElement('li'); item.className = state;
    item.textContent = `${String(i + 1).padStart(2, '0')} · ${STEPS[i]}`;
    list.append(item);
  });
}
function selectProject(id) {
  const project = records.get(id);
  if (!project) return;
  selectedId = id;
  renderDock();
  renderDetails(project);
  $('details').hidden = false;
  $('room').classList.add('selected');
  $('returnButton').focus();
  if (window.innerWidth < 650) $('details').scrollTop = 0;
}
function returnToTable() {
  selectedId = null;
  $('details').hidden = true;
  $('room').classList.remove('selected');
  renderDock();
  if (lastFocusedId) $('jarDock').querySelector(`[data-project-id="${lastFocusedId}"]`)?.focus();
}
function applyRegistry(state) {
  if (!Array.isArray(state.projects)) throw new Error('Project registry has no projects.');
  records = new Map(state.projects.map((project) => [project.id, project]));
  for (const id of IDS) {
    const project = records.get(id);
    if (!project || project.gates?.length !== 5) throw new Error(`Expected five-gate project missing: ${id}`);
    const jar = jars.get(id);
    if (jar) {
      const level = levelFor(project);
      if (level !== jar.level) { updateLiquid(jar, level); jar.level = level; }
    }
  }
  renderDock();
  if (selectedId) renderDetails(records.get(selectedId));
  $('connection').textContent = DEMO ? 'DEMO LEVELS · NOT LIVE' : 'VAULT RECORDS · READ ONLY';
  clearError();
}
async function loadRegistry() {
  const response = await fetch(DEMO ? '/api/projects?demo=1' : '/api/projects', { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not read the vault project registry.');
  const text = await response.text();
  if (text === lastRegistryText) return;
  applyRegistry(JSON.parse(text));
  lastRegistryText = text;
}

async function boot() {
  $('returnButton').addEventListener('click', returnToTable);
  $('backButton').addEventListener('click', returnToTable);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && selectedId) returnToTable(); });
  try { setupScene(); }
  catch (error) { showError(`3D view unavailable on this browser: ${error.message}. Project buttons will still work.`); }
  try { await loadRegistry(); }
  catch (error) { showError(error.message); }
  window.setInterval(() => {
    if (document.visibilityState === 'visible') loadRegistry().catch((error) => showError(error.message));
  }, 5000);
}
boot();

// Narrow, read-only hooks for automated checks of the prototype; no write action exists.
window.__ideaQuestTest = { levelFor, selectProject, getSelected: () => selectedId, getLevels: () =>
  Object.fromEntries(IDS.map((id) => [id, jars.get(id)?.level ?? null])) };
