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
let scene, camera, renderer, cat, raycaster;
const jars = new Map();
const pickMeshes = [];
let lastFocusedId = null;
let lastRegistryText = null;

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

function buildBackdrop() {
  scene.background = new THREE.Color('#281a33');
  scene.fog = new THREE.Fog('#281a33', 13, 27);
  const wall = mat('#5a395a');
  const beam = mat('#593043');
  block(scene, wall, 0, 2, -5.2, 22, 9, .22);
  block(scene, beam, 0, 5.1, -4.9, 22, .28, .35);
  block(scene, beam, -5, 2, -4.9, .28, 7, .35);
  block(scene, beam, 5, 2, -4.9, .28, 7, .35);

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

  const floor = block(scene, mat('#3d253b'), 0, -.58, .5, 25, .15, 14);
  floor.receiveShadow = true;
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
  const wood = mat('#99613e');
  const darkWood = mat('#663a39');
  const edge = mat('#bd7b45');
  block(table, darkWood, 0, .61, .35, 9.4, .37, 3.6);
  for (let i = -1; i <= 1; i++) {
    const plank = block(table, wood, 0, .84, .35 + i * 1.08, 9.15, .1, 1.04);
    plank.castShadow = true;
    block(table, edge, 0, .86, .86 + i * 1.08, 9.1, .015, .028);
  }
  for (const x of [-3.95, 3.95]) for (const z of [-.85, 1.4]) {
    block(table, darkWood, x, -.12, z, .55, 1.3, .55);
  }
  block(table, edge, 0, .49, 2.08, 9.45, .09, .1);
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
  const fur = mat('#211e2b');
  const litFur = mat('#35283d');
  const ear = mat('#a06080');
  const hat = mat('#70428c');
  const hatLight = mat('#9657ae');
  const amber = new THREE.MeshBasicMaterial({ color: '#ffc96e' });
  const black = new THREE.MeshBasicMaterial({ color: '#241822' });
  const shine = new THREE.MeshBasicMaterial({ color: '#fff3d0' });

  ball(cat, litFur, 0, .58, 0, .54, .66, .43);
  ball(cat, fur, 0, 1.55, .12, .77, .68, .64);
  for (const sign of [-1, 1]) {
    const e = mesh(new THREE.ConeGeometry(.31, .65, 3), fur, cat, sign * .52, 2.08, .03);
    e.rotation.z = sign * -.25;
    const inner = mesh(new THREE.ConeGeometry(.16, .36, 3), ear, cat, sign * .52, 2.06, .29);
    inner.rotation.z = sign * -.25;
    ball(cat, fur, sign * .31, .16, .42, .18, .12, .21);
    ball(cat, amber, sign * .31, 1.61, .68, .205, .255, .075);
    ball(cat, black, sign * .27, 1.6, .75, .085, .165, .035);
    ball(cat, shine, sign * .25 - .045, 1.70, .79, .044, .06, .02);
    whisker(cat, sign * .42, 1.3, sign * .85, 1.37);
    whisker(cat, sign * .43, 1.25, sign * .83, 1.18);
  }
  ball(cat, ear, 0, 1.37, .77, .09, .065, .05);
  ball(cat, mat('#e98594'), 0, 1.22, .76, .085, .07, .025);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.4, .45, -.2), new THREE.Vector3(-.86, .45, -.25),
    new THREE.Vector3(-1.01, 1.0, -.15), new THREE.Vector3(-.86, 1.14, .04)
  ]);
  mesh(new THREE.TubeGeometry(tailCurve, 18, .105, 8, false), fur, cat);

  const brim = ball(cat, hat, -.09, 2.18, .06, 1.15, .13, .93);
  brim.rotation.z = -.14;
  brim.rotation.x = -.12;
  const cone1 = mesh(new THREE.ConeGeometry(.67, 1.05, 24), hat, cat, -.16, 2.72, -.05);
  cone1.rotation.z = -.28;
  const cone2 = mesh(new THREE.ConeGeometry(.31, .72, 20), hatLight, cat, -.43, 3.19, -.05);
  cone2.rotation.z = -.72;
  ball(cat, hatLight, -.69, 3.38, -.05, .15, .11, .14);
  mesh(new THREE.TorusGeometry(.44, .045, 8, 28), mat('#edb468'), cat, -.16, 2.26, -.03).rotation.x = Math.PI / 2;
  ball(cat, mat('#f4bb5c'), 0, .63, .47, .14, .14, .07);
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
    color: '#d4f8f4', transparent: true, opacity: .32, roughness: .15, metalness: 0,
    depthWrite: false, side: THREE.DoubleSide
  }), group);
  glass.renderOrder = 3;
  mesh(new THREE.TorusGeometry(.35, .035, 6, 28), mat('#f4d3aa'), group, 0, 1.93, 0).rotation.x = Math.PI / 2;
  const cork = mesh(new THREE.CylinderGeometry(.31, .28, .27, 12), mat('#bc8552'), group, 0, 2.06, 0);
  cork.rotation.z = -.03;
  mesh(new THREE.TorusGeometry(.39, .025, 6, 28), new THREE.MeshBasicMaterial({ color }), group, 0, .25, 0).rotation.x = Math.PI / 2;
  const jar = { id, group, homeX: x, liquid: null, level: -1 };
  group.traverse((node) => {
    if (node.isMesh) { node.userData.projectId = id; pickMeshes.push(node); }
  });
  jars.set(id, jar);
  return jar;
}

function setupScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, .1, 60);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  $('scene').appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight('#b9a3ca', 2.3));
  const warm = new THREE.DirectionalLight('#ffcc92', 3.0);
  warm.position.set(-3.5, 6, 5);
  scene.add(warm);
  const cool = new THREE.DirectionalLight('#83a5ff', 1.2);
  cool.position.set(4, 4, -3);
  scene.add(cool);
  buildBackdrop();
  buildTable();
  buildCat();
  makeCandle(-4.15, -.78, .72);
  makeCandle(4.12, -.75, .95);
  buildJar(IDS[0], -1.3);
  buildJar(IDS[1], .45);
  buildJar(IDS[2], 2.23);
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
  camera.position.set(0, mobile ? 3.15 : 3.45, mobile ? 13.5 : 10.8);
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
    const goalX = jar.homeX + (isSelected ? (window.innerWidth < 650 ? -.13 : -.9) : 0);
    const goalZ = isSelected ? 1.8 : .42;
    const goalY = isSelected ? 1.2 : .93;
    const goalScale = isSelected ? 1.26 : 1;
    const ease = still ? 1 : .09;
    jar.group.position.x += (goalX - jar.group.position.x) * ease;
    jar.group.position.y += (goalY - jar.group.position.y) * ease;
    jar.group.position.z += (goalZ - jar.group.position.z) * ease;
    jar.group.scale.lerp(new THREE.Vector3(goalScale, goalScale, goalScale), ease);
    if (!still && !isSelected) jar.group.rotation.z = Math.sin(time * .0011 + jar.homeX) * .012;
    else jar.group.rotation.z = 0;
  });
  if (cat) cat.rotation.z = still ? 0 : Math.sin(time * .0012) * .014;
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
  renderer.domElement.style.cursor = projectAtPointer(event) ? 'pointer' : 'default';
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
