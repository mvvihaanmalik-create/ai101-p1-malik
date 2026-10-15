import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createVaultStore } from './vault-store.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const vaultRoot = path.resolve(here, '../..');
const registry = path.resolve(here, '../progress-arcade/projects.json');
const notes = path.resolve(here, '../Workshop Projects');
const publicDir = path.join(here, 'public-deploy');
const stateDir = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'AI101Projects', 'idea-quest-status-publisher');
const stateFile = path.join(stateDir, 'state.json');
const logFile = path.join(stateDir, 'publisher.log');
const projectId = 'prj_zblNLbIE9RMYCLvgbmcWDpdHipAQ';
const scope = 'vihaanmalik';
const liveUrl = 'https://idea-quest-ai101.vercel.app/';
const vercelCli = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'npm', 'node_modules', 'vercel', 'dist', 'vc.js');
const staticHashes = Object.freeze({
  'index.html': '5a1e9807baa781db6a16323d22ebb966d477ac04',
  'app.js': 'f223f171fe3265456650b99688ae0242a13fc942',
  'styles.css': '3554d3a83356178b9834f59d03f6615725ae52f7',
  'THREE-LICENSE.txt': '7293d37daed3d6714b36d830e30c9614a5e268ec',
  'vercel.json': 'd0d16fa6043530e4b0e14b34bd9061cd21c58d24',
});
const publicKeys = ['id', 'title', 'pitch', 'kind', 'phase', 'released', 'repository', 'live', 'nextMove', 'changed', 'gates', 'gateNames', 'legacyWorkflow', 'milestones', 'updatedAt'];
const allowedFiles = [...Object.keys(staticHashes), 'projects.json'];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const hash = (data, algorithm = 'sha1') => createHash(algorithm).update(data).digest('hex');
const stamp = () => new Date().toISOString();

function removeStage(stage) {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const target = fs.realpathSync(stage);
  if (path.dirname(target).toLowerCase() !== tempRoot.toLowerCase() || !path.basename(target).startsWith('idea-quest-status-')) {
    throw new Error('Refusing to remove a path outside the dedicated status-stage directory.');
  }
  fs.rmSync(target, { recursive: true, force: true, maxRetries: 12, retryDelay: 500 });
}

function log(message) {
  fs.mkdirSync(stateDir, { recursive: true });
  const line = `[${stamp()}] ${message}`;
  fs.appendFileSync(logFile, `${line}\n`);
  process.stdout.write(`${line}\n`);
}

export function inputFingerprint(registryPath = registry, notesPath = notes) {
  const files = [registryPath, ...fs.readdirSync(notesPath).filter(name => name.endsWith('.md')).sort().map(name => path.join(notesPath, name))];
  const digest = createHash('sha256');
  for (const file of files) { digest.update(path.basename(file)); digest.update(fs.readFileSync(file)); }
  return digest.digest('hex');
}

export function validateSnapshot(snapshot) {
  if (snapshot.version !== 2 || !Array.isArray(snapshot.projects) || !snapshot.projects.length) throw new Error('Invalid public project collection.');
  if (!snapshot.projects.some(project => project.id === snapshot.activeProjectId)) throw new Error('Active project is missing.');
  const ids = new Set();
  for (const project of snapshot.projects) {
    for (const key of Object.keys(project)) if (![...publicKeys, 'sessions', 'activity', 'updates'].includes(key)) throw new Error(`Unexpected public field: ${key}`);
    if (typeof project.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(project.id) || ids.has(project.id)) throw new Error('Invalid or duplicate project id.');
    ids.add(project.id);
    for (const [key, max] of Object.entries({ title: 120, pitch: 1000, nextMove: 2000, changed: 4000 })) {
      if (typeof project[key] !== 'string' || project[key].length > max) throw new Error(`Invalid ${key} for ${project.id}.`);
    }
    for (const key of ['repository', 'live']) if (project[key] && (!/^https:\/\//.test(project[key]) || project[key].length > 600)) throw new Error(`Invalid ${key} URL.`);
    if (!Array.isArray(project.gates) || ![0, 5].includes(project.gates.length) || project.gates.some(gate => !['approved', 'active', 'upcoming'].includes(gate))) throw new Error('Invalid approval gates.');
    if (!Array.isArray(project.gateNames) || project.gateNames.length !== project.gates.length || project.gateNames.some(name => typeof name !== 'string' || name.length > 120)) throw new Error('Invalid gate names.');
    if (!Array.isArray(project.milestones) || project.milestones.length > 12 || project.milestones.some(m => typeof m.title !== 'string' || m.title.length > 120 || typeof m.done !== 'boolean' || Object.keys(m).some(key => !['title', 'done'].includes(key)))) throw new Error('Invalid milestones.');
    if (project.sessions?.length || project.activity?.length || project.updates?.length) throw new Error('Private history reached the public snapshot.');
  }
  const serialized = JSON.stringify(snapshot);
  const strings = (value) => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(strings) : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
  const content = strings(snapshot).join('\n');
  if (/C:\\Users\\|(?:^|[^a-z])(?:sk-|ghp_|gho_|vercel_)[A-Za-z0-9_-]{12,}|-----BEGIN [A-Z ]+PRIVATE KEY-----/im.test(content)) throw new Error('Possible private path or credential in public snapshot.');
  if (Buffer.byteLength(serialized) > 200_000) throw new Error('Public snapshot exceeds size limit.');
  return true;
}

export function makeSnapshot(state, asOf = stamp()) {
  const snapshot = {
    version: 2,
    activeProjectId: state.activeProjectId,
    projects: state.projects.map(project => ({
      ...Object.fromEntries(publicKeys.filter(key => project[key] !== undefined).map(key => [key, key === 'milestones' ? project.milestones.map(milestone => ({ title: milestone.title, done: milestone.done === true })) : project[key]])),
      sessions: [], activity: [], updates: [],
    })),
    candidates: [],
    sync: { root: 'Published collection', mode: 'hosted', asOf, warnings: [] },
  };
  validateSnapshot(snapshot);
  return snapshot;
}

function readSnapshot() {
  const store = createVaultStore({ vaultRoot, dataFile: registry });
  try { return makeSnapshot(store.read()); }
  finally { store.close(); }
}

export function prepareStage(snapshot, from = publicDir) {
  validateSnapshot(snapshot);
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-quest-status-'));
  try {
    for (const [name, expected] of Object.entries(staticHashes)) {
      const source = path.join(from, name);
      const data = fs.readFileSync(source);
      if (hash(data) !== expected) throw new Error(`Static asset changed: ${name}. Status-only publisher stopped.`);
      fs.writeFileSync(path.join(stage, name), data);
    }
    fs.writeFileSync(path.join(stage, 'projects.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
    const found = fs.readdirSync(stage).sort();
    if (JSON.stringify(found) !== JSON.stringify([...allowedFiles].sort())) throw new Error('Unexpected deployment files.');
    return { stage, statusHash: hash(fs.readFileSync(path.join(stage, 'projects.json'))) };
  } catch (error) {
    try { removeStage(stage); } catch (cleanupError) { log(`Temporary stage cleanup deferred: ${cleanupError.message}`); }
    throw error;
  }
}

function run(program, args, cwd, timeout = 300_000) {
  const result = spawnSync(program, args, { cwd, encoding: 'utf8', timeout, windowsHide: true, maxBuffer: 10_000_000 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${program} ${args[0]} failed: ${(result.stderr || result.stdout || '').slice(-1800)}`);
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function runLocalTests() {
  for (const folder of [here, path.resolve(here, '../progress-arcade')]) {
    const tests = fs.readdirSync(path.join(folder, 'tests')).filter(name => name.endsWith('.test.mjs')).map(name => path.join(folder, 'tests', name));
    run(process.execPath, ['--test', ...tests], folder);
  }
}

async function verifyRemote(base, expectedHash) {
  const url = new URL('projects.json', base);
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Status fetch failed: ${response.status} at ${url}`);
  const content = Buffer.from(await response.arrayBuffer());
  if (hash(content) !== expectedHash) throw new Error(`Status hash mismatch at ${url}`);
  const parsed = JSON.parse(content.toString('utf8'));
  validateSnapshot(parsed);
}

export function parseInspectedDeployment(inspected) {
  const deploymentId = inspected.match(/\bid\s+(dpl_[A-Za-z0-9]+)/)?.[1];
  const staged = inspected.match(/\burl\s+(https:\/\/idea-quest-ai101-[a-z0-9-]+\.vercel\.app)/)?.[1];
  if (!deploymentId || !staged || !/\bReady\b/.test(inspected) || !/\bname\s+idea-quest-ai101\b/.test(inspected)) {
    throw new Error('Staged deployment inspection failed; not promoting.');
  }
  return { deploymentId, staged };
}

function state() {
  try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); }
  catch { return {}; }
}

function saveState(value) {
  fs.mkdirSync(stateDir, { recursive: true });
  const temporary = `${stateFile}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, stateFile);
}

async function publish({ dryRun = false } = {}) {
  const before = inputFingerprint();
  const snapshot = readSnapshot();
  const { stage, statusHash } = prepareStage(snapshot);
  try {
    runLocalTests();
    if (inputFingerprint() !== before) throw new Error('Status inputs changed during validation; retry after edits settle.');
    log(`Validated ${snapshot.projects.length} status records; six-file stage SHA1 ${statusHash}.`);
    if (dryRun) return { dryRun: true, statusHash, before };

    if (!fs.existsSync(vercelCli)) throw new Error('Vercel CLI is not installed at the expected path.');
    const account = run(process.execPath, [vercelCli, 'whoami', '--scope', scope], stage, 30_000);
    if (!account.includes('mvvihaanmalik-7004')) throw new Error('Vercel account mismatch.');
    const result = run(process.execPath, [vercelCli, 'deploy', '--prod', '--skip-domain', '--project', projectId, '--scope', scope, '--yes', '--non-interactive'], stage);
    const urls = [...result.matchAll(/https:\/\/[^\s]+\.vercel\.app\/?/g)].map(match => match[0]);
    const stagedAlias = urls.at(-1);
    if (!stagedAlias || !/^https:\/\/idea-quest-ai101-[a-z0-9-]+\.vercel\.app\/?$/.test(stagedAlias)) throw new Error('Could not confirm staged IdeaQuest URL; not promoting.');
    const inspected = run(process.execPath, [vercelCli, 'inspect', stagedAlias, '--scope', scope], stage, 30_000);
    const { deploymentId, staged } = parseInspectedDeployment(inspected);
    await verifyRemote(staged, statusHash);
    log(`Staged status verified at ${staged} (${deploymentId}); promoting.`);
    run(process.execPath, [vercelCli, 'promote', staged, '--scope', scope, '--yes', '--non-interactive'], stage);
    await verifyRemote(liveUrl, statusHash);
    fs.copyFileSync(path.join(stage, 'projects.json'), path.join(publicDir, 'projects.json'));
    saveState({ fingerprint: before, statusHash, publishedAt: stamp(), deployment: staged, deploymentId });
    log(`Live status verified at ${liveUrl}.`);
    return { dryRun: false, statusHash, before, staged };
  } finally {
    try { removeStage(stage); } catch (error) { log(`Temporary stage cleanup deferred: ${error.message}`); }
  }
}

async function watch() {
  log('Status-only monitor started; polling selected inputs every 5 seconds.');
  let observed = inputFingerprint(), changedAt = Date.now() - 15_000;
  let failedAt = 0;
  while (true) {
    await sleep(5_000);
    let current;
    try { current = inputFingerprint(); }
    catch (error) { log(`Input read failed: ${error.message}`); continue; }
    if (current !== observed) { observed = current; changedAt = Date.now(); failedAt = 0; continue; }
    if (current === state().fingerprint || Date.now() - changedAt < 15_000 || Date.now() - failedAt < 300_000) continue;
    try { await publish(); observed = inputFingerprint(); changedAt = Date.now(); }
    catch (error) { failedAt = Date.now(); log(`Publish stopped: ${error.stack || error}`); }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  if (!['--dry-run', '--once', '--watch'].includes(mode)) { process.stderr.write('Use --dry-run, --once, or --watch.\n'); process.exitCode = 2; }
  else {
    (mode === '--watch' ? watch() : publish({ dryRun: mode === '--dry-run' }))
      .catch(error => { log(`Publish stopped: ${error.stack || error}`); process.exitCode = 1; });
  }
}
