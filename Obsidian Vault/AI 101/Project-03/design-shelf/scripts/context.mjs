import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_VAULT_ROOT = path.resolve(APP_ROOT, '../..');
const BOUNDS = Object.freeze({
  notesDirectory: 'Project 2/Workshop Projects',
  registry: 'Project 2/progress-arcade/projects.json',
  output: 'Project-03/design-shelf/data/projects.json',
});
const ALLOWED = new Set(['id', 'title', 'pitch', 'next', 'changed', 'updatedAt', 'folder', 'designShelfType', 'designShelfTags', 'designShelfFocus']);
const TYPES = ['plugins', 'games', 'websites', 'apps', 'agents', 'creative'];
const SECRET = /(?:\b(?:sk-[a-zA-Z0-9_-]{16,}|gh[pousr]_[a-zA-Z0-9]{16,}|github_pat_[a-zA-Z0-9_]{16,})|\bbearer\s+\S{12,}|\b(?:api[_-]?key|password|secret|access[_-]?token)\s*[:=]\s*\S+|https?:\/\/[^\s/@]+:[^\s/@]+@)/i;
const posix = value => value.split(path.sep).join('/');
const inside = (root, target) => target === root || (!path.relative(root, target).startsWith(`..${path.sep}`) && path.relative(root, target) !== '..' && !path.isAbsolute(path.relative(root, target)));

export async function loadConfig(options = {}) {
  const vaultRoot = path.resolve(options.vaultRoot || DEFAULT_VAULT_ROOT);
  const configPath = path.resolve(options.configPath || path.join(vaultRoot, 'Project-03/design-shelf/config/project-sources.json'));
  const input = JSON.parse(await fs.readFile(configPath, 'utf8'));
  if (input.schemaVersion !== 1) throw new Error('Unsupported project source configuration.');
  const config = { vaultRoot, configPath };
  for (const [key, relative] of Object.entries(BOUNDS)) {
    const target = path.resolve(vaultRoot, input[key] || relative);
    if (target !== path.resolve(vaultRoot, relative)) throw new Error(`Source boundary rejected: ${key}.`);
    config[key] = target;
  }
  config.debounceMs = Math.max(100, Math.min(3000, Number(input.debounceMs) || 450));
  config.pollIntervalMs = Math.max(1000, Math.min(60000, Number(input.pollIntervalMs) || 4000));
  return config;
}

// A small, deliberately bounded frontmatter reader. It supports flat strings and
// string lists only; it never evaluates YAML tags, objects, aliases, or note prose.
export function parseProjectFrontmatter(markdown) {
  const text = markdown.replace(/^\uFEFF/, '');
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) throw new Error('Missing or unclosed frontmatter.');
  const result = Object.create(null);
  let listKey;
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (/^\s+-\s+/.test(line) && listKey) {
      const item = parseScalar(line.trim().slice(2));
      if (typeof item !== 'string') throw new Error('Invalid list value.');
      result[listKey].push(item);
      continue;
    }
    const entry = /^([A-Za-z][A-Za-z0-9]*):(?:\s+(.*)|\s*)$/.exec(line);
    listKey = undefined;
    if (!entry) {
      if (/^\s/.test(line)) continue; // unknown nested properties are excluded
      throw new Error('Malformed frontmatter.');
    }
    const [, key, value = ''] = entry;
    if (!ALLOWED.has(key)) continue;
    if (Object.hasOwn(result, key)) throw new Error(`Duplicate field: ${key}.`);
    if (!value.trim() && ['designShelfTags', 'designShelfType'].includes(key)) {
      result[key] = [];
      listKey = key;
    } else result[key] = parseScalar(value);
  }
  return result;
}

function parseScalar(raw) {
  const value = raw.trim();
  if (!value) return '';
  if (value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'string') throw new Error();
      return parsed;
    } catch { throw new Error('Invalid quoted string.'); }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'")) throw new Error('Invalid quoted string.');
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value.startsWith('[')) {
    if (!value.endsWith(']')) throw new Error('Invalid list.');
    try {
      const list = JSON.parse(value);
      if (!Array.isArray(list) || list.some(x => typeof x !== 'string')) throw new Error();
      return list;
    } catch {
      const list = value.slice(1, -1).split(',').map(x => x.trim()).filter(Boolean);
      if (list.some(x => /[\[\]{}&*!]/.test(x))) throw new Error('Unsupported list.');
      return list.map(x => parseScalar(x));
    }
  }
  if (/^[|>{&*!]/.test(value)) throw new Error('Unsupported frontmatter value.');
  return value.replace(/\s+#.*$/, '');
}

function clean(value, maxLength = 1200) {
  if (typeof value !== 'string' || SECRET.test(value)) return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function list(value) {
  return (Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [])
    .map(x => clean(x, 70).toLowerCase()).filter(Boolean).slice(0, 20);
}

export function deriveContext(project, overrides = {}) {
  const text = [project.title, project.pitch, project.next, project.changed].join(' ').toLowerCase();
  // Project type follows the stated identity; a note mentioning an unrelated
  // workflow or review action must not turn a poster into an application.
  const identity = [project.title, project.pitch].join(' ').toLowerCase();
  const rules = [
    ['plugins', /\b(plugin|plugins|extension|extensions|obsidian)\b/, 'Plugin or extension mentioned'],
    ['games', /\b(game|games|gameplay|puzzle|platformer|roguelike)\b/, 'Game mentioned'],
    ['agents', /\b(agent|agents|assistant|chatbot|llm)\b/, 'Agent or assistant mentioned'],
    ['websites', /\b(website|websites|landing page|portfolio|browser|web app|dashboard)\b/, 'Web interface mentioned'],
    ['apps', /\b(app|application|studio|tracker|tool)\b/, 'Application or tool mentioned'],
    ['creative', /\b(creative|poster|exhibition|cinematic|3d|potion|art|color|colors|image|film)\b/, 'Visual or creative work mentioned'],
  ];
  const explicitTypes = list(overrides.designShelfType).filter(x => TYPES.includes(x));
  const detected = rules.filter(([, pattern]) => pattern.test(identity));
  const types = explicitTypes.length ? [...new Set(explicitTypes)] : detected.map(([type]) => type);
  const inference = explicitTypes.length ? [] : detected.map(([type, , reason]) => ({ field: 'types', value: type, reason }));
  const tags = new Set(list(overrides.designShelfTags));
  const features = [
    ['image processing', /\b(image|photo|grade|grading)\b/],
    ['color', /\b(color|colors|palette|accent)\b/],
    ['3d', /\b(3d|potion room)\b/],
    ['progress', /\b(progress|tracker|gates|project status)\b/],
    ['offline', /\boffline\b/],
    ['performance', /\b(performance|rendering|loading|paint|background tabs)\b/],
    ['touch', /\b(touch|phone|mobile)\b/],
    ['review', /\b(review|test|accept|adjust|reject)\b/],
  ];
  for (const [tag, pattern] of features) if (pattern.test(text)) tags.add(tag);
  const platform = [];
  for (const [label, pattern] of [
    ['Obsidian', /\bobsidian\b/], ['iOS', /\b(ios|iphone|ipad)\b/],
    ['macOS', /\b(macos|macbook|mac os)\b/], ['Windows', /\bwindows\b/],
    ['Android', /\bandroid\b/], ['Web', /\b(browser|website|web app|background tabs)\b/],
    ['Mobile', /\b(phone|mobile|touch)\b/], ['Desktop', /\bdesktop\b/],
  ]) if (pattern.test(text)) platform.push(label);
  const focus = clean(overrides.designShelfFocus, 300) || project.next || project.pitch;
  const keywords = [...new Set([...types, ...tags, ...platform.map(x => x.toLowerCase()), ...text.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(x => x.length > 3 && !STOP_WORDS.has(x))])].slice(0, 100);
  return {
    type: types[0] || 'all', types, tags: [...tags], focus, platform,
    goal: project.pitch, contextKeywords: keywords,
    inference, contextSource: {
      types: explicitTypes.length ? 'designShelfType' : types.length ? 'inferred from summary' : 'unknown',
      tags: list(overrides.designShelfTags).length ? 'designShelfTags and summary keywords' : 'summary keywords',
      focus: clean(overrides.designShelfFocus) ? 'designShelfFocus' : project.next ? 'next' : 'pitch',
      platform: platform.length ? 'explicit mentions in summary' : 'unknown',
    },
  };
}
const STOP_WORDS = new Set('this that with from into before after their there then than keep review project projects still being through current original later whether which what have main under each when more only next changed'.split(' '));

async function safeRealPath(root, target) {
  const [realRoot, realTarget] = await Promise.all([fs.realpath(root), fs.realpath(target)]);
  if (!inside(realRoot, realTarget)) throw new Error('Source resolved outside its allowed directory.');
  return realTarget;
}

export async function extractProjects(options = {}) {
  const config = await loadConfig(options);
  const warnings = [];
  let registry = {};
  try {
    await safeRealPath(path.dirname(config.registry), config.registry);
    await safeRealPath(config.vaultRoot, config.registry);
    const raw = await fs.readFile(config.registry, 'utf8');
    if (raw.length > 2_000_000) throw new Error('Registry too large.');
    registry = JSON.parse(raw);
    if (!Array.isArray(registry.projects)) throw new Error('Invalid registry.');
  } catch { registry = {}; warnings.push('Project registry unavailable; gate status is unknown.'); }
  const registryProjects = new Map((registry.projects || []).filter(p => p && typeof p.id === 'string').map(p => [p.id, p]));
  const projects = [];
  let files = [];
  try {
    await safeRealPath(config.vaultRoot, config.notesDirectory);
    files = (await fs.readdir(config.notesDirectory, { withFileTypes: true })).filter(entry => entry.isFile() && entry.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name));
  } catch { warnings.push('Project notes unavailable.'); }
  for (const file of files) {
    const sourceNote = posix(path.relative(config.vaultRoot, path.join(config.notesDirectory, file.name)));
    try {
      const target = await safeRealPath(config.notesDirectory, path.join(config.notesDirectory, file.name));
      const stat = await fs.stat(target);
      if (stat.size > 128_000) throw new Error('Note too large.');
      const frontmatter = parseProjectFrontmatter(await fs.readFile(target, 'utf8'));
      const id = clean(frontmatter.id, 80);
      if (!/^[a-z0-9][a-z0-9_-]*$/i.test(id)) throw new Error('Missing or invalid project ID.');
      if (projects.some(p => p.id === id)) throw new Error('Duplicate project ID.');
      const record = registryProjects.get(id);
      const title = clean(frontmatter.title, 120) || id;
      const base = {
        id, title, pitch: clean(frontmatter.pitch), next: clean(frontmatter.next),
        changed: clean(frontmatter.changed), updatedAt: clean(frontmatter.updatedAt, 40),
        sourceNote, sourceModifiedAt: stat.mtime.toISOString(),
      };
      const folder = clean(frontmatter.folder, 240);
      if (folder && !path.isAbsolute(folder) && !/^[a-z]:/i.test(folder) && inside(config.vaultRoot, path.resolve(config.vaultRoot, folder))) base.folder = posix(path.normalize(folder));
      const gateKnown = Array.isArray(record?.gates) && record.gates.length <= 5 && record.gates.every(x => ['approved', 'active', 'upcoming'].includes(x));
      const gateStates = gateKnown ? record.gates : [];
      const approved = gateStates.filter(x => x === 'approved').length;
      const active = gateStates.indexOf('active');
      const stageNames = ['Goal', 'Feasibility', 'Prototype', 'Human check', 'Iterate'];
      projects.push({
        ...base, ...deriveContext(base, frontmatter),
        stage: !gateKnown ? 'Unknown' : !gateStates.length ? 'Artifact' : approved === gateStates.length ? 'Completed workflow' : stageNames[active >= 0 ? active : approved] || 'Unknown',
        gates: { known: gateKnown, approved: gateKnown ? approved : null, total: gateKnown ? gateStates.length : null, active: active < 0 ? null : active + 1 },
        obsidianUrl: `obsidian://open?vault=${encodeURIComponent(path.basename(path.dirname(config.vaultRoot)))}&file=${encodeURIComponent(`${path.basename(config.vaultRoot)}/${sourceNote}`)}`,
      });
    } catch { warnings.push(`Skipped malformed or unavailable project note: ${file.name}.`); }
  }
  const activeProjectId = projects.some(p => p.id === registry.activeProjectId) ? registry.activeProjectId : projects[0]?.id || null;
  return { schemaVersion: 1, generatedAt: (options.now ? new Date(options.now) : new Date()).toISOString(), activeProjectId, projects, warnings };
}

export async function refreshProjectContext(options = {}) {
  const config = await loadConfig(options);
  const data = await extractProjects(options);
  await fs.mkdir(path.dirname(config.output), { recursive: true });
  await safeRealPath(config.vaultRoot, path.dirname(config.output));
  // Resolve existing output too, so a replaced symlink cannot redirect writes.
  try { await safeRealPath(path.dirname(config.output), config.output); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temp = `${config.output}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  try { await fs.rename(temp, config.output); }
  catch (error) {
    // Windows can forbid replacing an existing file via rename. The generated
    // cache is disposable; copy only after rechecking the target boundary.
    if (!['EPERM', 'EACCES', 'EEXIST'].includes(error.code)) throw error;
    try { await safeRealPath(path.dirname(config.output), config.output); } catch (check) { if (check.code !== 'ENOENT') throw check; }
    await fs.copyFile(temp, config.output);
    await fs.unlink(temp);
  }
  return data;
}

export async function readProjectContext(options = {}) {
  const config = await loadConfig(options);
  try {
    await safeRealPath(path.dirname(config.output), config.output);
    const data = JSON.parse(await fs.readFile(config.output, 'utf8'));
    if (data.schemaVersion === 1 && Array.isArray(data.projects)) return data;
  } catch { /* regenerate a missing or malformed cache */ }
  return refreshProjectContext(options);
}

export async function sourceFingerprint(options = {}) {
  const config = await loadConfig(options);
  const hash = createHash('sha256');
  for (const target of [config.configPath, config.registry]) {
    try {
      if (target === config.registry) await safeRealPath(config.vaultRoot, target);
      hash.update(await fs.readFile(target));
    } catch { hash.update(`missing:${path.basename(target)}`); }
  }
  try {
    await safeRealPath(config.vaultRoot, config.notesDirectory);
    for (const entry of (await fs.readdir(config.notesDirectory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const target = await safeRealPath(config.notesDirectory, path.join(config.notesDirectory, entry.name));
      const stat = await fs.stat(target);
      // Hash only metadata + frontmatter, never personal body text.
      if (stat.size <= 128_000) {
        const text = await fs.readFile(target, 'utf8');
        hash.update(entry.name).update(stat.mtime.toISOString()).update(text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || 'invalid');
      }
    }
  } catch { hash.update('notes-unavailable'); }
  return hash.digest('hex');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  refreshProjectContext().then(data => console.log(`Connected ${data.projects.length} project notes.`)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
