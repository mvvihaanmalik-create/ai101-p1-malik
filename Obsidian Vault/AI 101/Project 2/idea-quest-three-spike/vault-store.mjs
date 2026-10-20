import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';

const phases = ['idea', 'active', 'review', 'complete', 'resting', 'revisiting'];
const ignored = new Set(['node_modules', 'dist', 'build', 'outputs', 'Workshop Projects']);
const owned = ['ideaquest', 'id', 'title', 'pitch', 'phase', 'released', 'repository', 'live', 'next', 'changed', 'folder', 'milestones', 'sessions', 'createdAt', 'updatedAt'];
export class VaultError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
function text(value, max = 4000) {
  if (typeof value !== 'string' || value.length > max) throw new VaultError(`Enter text shorter than ${max} characters.`);
  return value.trim();
}
function link(value) {
  const clean = text(value || '', 2000);
  if (!clean) return '';
  try { const url = new URL(clean); if (url.protocol !== 'https:' || url.username || url.password) throw new Error(); }
  catch { throw new VaultError('Project links must be HTTPS URLs without embedded credentials.'); }
  return clean;
}
function parse(source) {
  const match = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([\w-]+):\s*(.*?)\s*$/);
    if (!field) continue;
    let value = field[2];
    try { value = JSON.parse(value); } catch { if (/^'.*'$/.test(value)) value = value.slice(1, -1).replace(/''/g, "'"); }
    data[field[1]] = value;
  }
  const body = source.replace(/^\uFEFF/, '').slice(match[0].length).replace(/\r\n/g, '\n');
  const milestones = body.match(/<!-- ideaquest-milestones -->\n([\s\S]*?)<!-- \/ideaquest-milestones -->/);
  if (milestones) data.milestones = [...milestones[1].matchAll(/^- \[([ xX])\] (.+)$/gm)].map(m => ({ title: m[2], done: m[1].toLowerCase() === 'x' }));
  const sessions = [...body.matchAll(/<!-- ideaquest-session -->\r?\n## Session · ([^\r\n]+)\r?\n\r?\n### What changed\r?\n\r?\n([\s\S]*?)\r?\n\r?\n### What’s next\r?\n\r?\n([\s\S]*?)\r?\n<!-- \/ideaquest-session -->/g)].map(m => ({ at: m[1], changed: m[2].trim(), next: m[3].trim() })).reverse();
  if (sessions.length) data.sessions = sessions;
  return { data, header: match[1], body };
}
function render(note, metadata) {
  const lines = note ? note.header.split(/\r?\n/).filter(line => !owned.some(key => line.startsWith(`${key}:`))) : [];
  for (const key of owned) if (metadata[key] !== undefined && !['milestones','sessions'].includes(key)) lines.push(`${key}: ${JSON.stringify(metadata[key])}`);
  let body = note?.body || `\n# ${metadata.title}\n\nThis project belongs to your idea.quest collection. Edit the properties above in Obsidian or use its workshop journal.\n`;
  const block = `<!-- ideaquest-milestones -->\n## Milestones\n\n${(metadata.milestones || []).map(m => `- [${m.done ? 'x' : ' '}] ${m.title}`).join('\n')}\n<!-- /ideaquest-milestones -->`;
  body = /<!-- ideaquest-milestones -->[\s\S]*?<!-- \/ideaquest-milestones -->/.test(body) ? body.replace(/<!-- ideaquest-milestones -->[\s\S]*?<!-- \/ideaquest-milestones -->/, () => block) : body + '\n' + block + '\n';
  return `---\n${lines.join('\n')}\n---\n${body}`;
}
function revision(source) { return createHash('sha256').update(source).digest('hex').slice(0, 20); }
function atomicWrite(file, value) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporary, value, { encoding: 'utf8', flag: 'wx' });
  try { fs.renameSync(temporary, file); } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

export function createVaultStore({ vaultRoot, dataFile }) {
  const root = fs.realpathSync(vaultRoot);
  const home = path.join(root, 'Project 2', 'Workshop Projects');
  function relative(file) { return path.relative(root, file).split(path.sep).join('/'); }
  function safeFile(file) {
    const rel = path.relative(root, file);
    if (rel.startsWith('..') || path.isAbsolute(rel)) throw new VaultError('This path is outside the connected vault.');
    const existing = fs.existsSync(file) ? file : path.dirname(file);
    const resolved = fs.realpathSync(existing);
    const checked = path.relative(root, resolved);
    if (checked.startsWith('..') || path.isAbsolute(checked)) throw new VaultError('This path is outside the connected vault.');
    return file;
  }
  function scan() {
    const files = [];
    function walk(directory) {
      for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
        if (item.name.startsWith('.') || item.isSymbolicLink() || ['node_modules','dist','build','Templates'].includes(item.name)) continue;
        const file = path.join(directory, item.name);
        if (item.isDirectory()) walk(file);
        else if (item.name.endsWith('.md') && fs.statSync(file).size <= 1024 * 1024) files.push(file);
      }
    }
    walk(root); return files;
  }
  function seed() {
    fs.mkdirSync(home, { recursive: true }); safeFile(home);
    const marker = path.join(home, '.imported.json');
    const imported = fs.existsSync(marker) ? JSON.parse(fs.readFileSync(safeFile(marker), 'utf8')) : [];
    const legacy = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    for (const project of legacy.projects) {
      const file = safeFile(path.join(home, `${project.id}.md`));
      if (imported.includes(project.id)) continue;
      imported.push(project.id);
      if (fs.existsSync(file)) continue;
      const folder = project.vaultLink?.replace(/^AI 101\//, '').replace(/\/[^/]*$/, '') || '';
      const metadata = { ideaquest: true, id: project.id, title: project.title, pitch: project.pitch, phase: project.phase, released: project.phase === 'complete' || project.id === 'image-palette',
        repository: project.id === 'image-palette' ? 'https://github.com/mvvihaanmalik-create/ai101-image-palette-studio' : '',
        live: project.id === 'image-palette' ? 'https://mvvihaanmalik-create.github.io/ai101-image-palette-studio/' : '',
        next: project.nextMove, changed: project.updates?.[0]?.text || '', folder, milestones: [], sessions: [], createdAt: project.createdAt, updatedAt: project.updatedAt };
      fs.writeFileSync(file, render(null, metadata), { encoding: 'utf8', flag: 'wx' });
    }
    atomicWrite(safeFile(marker), JSON.stringify(imported));
  }
  let watcher;
  // Notifications accelerate refresh; a scan on every read also catches missed events and offline edits.
  try { watcher = fs.watch(root, { recursive: true }, () => {}); watcher.on('error', () => {}); watcher.unref(); } catch {}
  function read() {
    const legacy = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const legacyById = new Map(legacy.projects.map(project => [project.id, project]));
    const files = scan(), projects = [], warnings = [], seen = new Set();
    for (const file of files) {
      let source = fs.readFileSync(file, 'utf8'); const note = parse(source);
      if (note?.data.ideaquest !== true) continue;
      const d = note.data;
      let normalized = false;
      if (!d.id && typeof d.title === 'string' && d.title.trim()) {
        d.id = `${d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0,55) || 'project'}-${randomUUID().slice(0,8)}`;
        normalized = true;
      }
      if (d.phase === 'complete' && d.released !== true || d.id === 'image-palette' && d.released === undefined) {d.released=true;normalized=true;}
      if (normalized) {source = render(note,d);atomicWrite(safeFile(file),source);}
      if (typeof d.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(d.id) || typeof d.title !== 'string' || !d.title.trim()) { warnings.push(`Check project properties in ${relative(file)}`); continue; }
      if (seen.has(d.id)) { warnings.push(`Duplicate project ID ${d.id}: ${relative(file)}. Give each project its own ID.`); continue; }
      seen.add(d.id);
      const old = legacyById.get(d.id);
      const milestones = Array.isArray(d.milestones) ? d.milestones.filter(m => m && typeof m.title === 'string').slice(0, 12) : [];
      const sessions = Array.isArray(d.sessions) ? d.sessions.filter(s => s && typeof s.changed === 'string' && typeof s.next === 'string').slice(0, 100) : [];
      let folder = '';
      try { if (typeof d.folder === 'string' && d.folder) { const target = safeFile(path.resolve(root, d.folder)); if (!fs.statSync(target).isDirectory()) throw new Error(); folder = relative(target); } } catch { warnings.push(`Linked folder is unavailable for ${d.title}`); }
      const activity = folder ? files.filter(f => relative(f).startsWith(`${folder}/`) && f !== file).map(f => ({ path: relative(f), title: path.basename(f, '.md'), at: fs.statSync(f).mtime.toISOString() })).sort((a,b) => b.at.localeCompare(a.at)).slice(0, 5) : [];
      let repository = '', live = '';
      try { repository = link(d.repository); live = link(d.live); } catch { warnings.push(`Check HTTPS project links for ${d.title}`); }
      // The class registry owns historical workflow status; workshop notes own new projects.
      const phase = old?.kind === 'workflow' && phases.includes(old.phase) ? old.phase : phases.includes(d.phase) ? d.phase : 'idea';
      projects.push({ ...old, id: d.id, title: d.title, pitch: typeof d.pitch === 'string' ? d.pitch : '', kind: old?.kind || 'project',
        phase, released: d.released === true || phase === 'complete' || d.id === 'image-palette' && old?.gates?.every(gate=>gate==='approved'), repository, live, nextMove: typeof d.next === 'string' ? d.next : '',
        changed: sessions[0]?.changed || (typeof d.changed === 'string' ? d.changed : ''), folder, milestones, sessions, activity,
        gates: old?.gates || milestones.map(m => m.done === true ? 'approved' : 'upcoming'),
        gateNames: old?.gates?.length ? ['Goal', 'Route', 'Build', 'Review', 'Refine'] : milestones.map(m => m.title),
        legacyWorkflow: !!old?.gates?.length, vaultPath: relative(file), vaultLink: `AI 101/${relative(file)}`, revision: revision(source),
        createdAt: d.createdAt || '', updatedAt: d.updatedAt || '', updates: sessions.length ? sessions.map(s => ({ at: s.at, text: `${s.changed} Next: ${s.next}` })) : old?.updates || [] });
    }
    const candidates = files.filter(file => path.basename(file).toLowerCase() === 'readme.md').filter(file => {
      const rel = relative(file), parts = rel.split('/');
      return parts.length >= 3 && !parts.some(part => ignored.has(part)) && !projects.some(project => project.folder === relative(path.dirname(file)));
    }).map(file => ({ path: relative(file), folder: relative(path.dirname(file)), title: path.basename(path.dirname(file)) })).slice(0, 30);
    return { version: 2, activeProjectId: legacy.activeProjectId, projects, candidates, sync: { root: path.basename(root), vaultName: path.basename(path.dirname(root)), mode: 'local', warnings } };
  }
  function create(input) {
    const title = text(input.title, 120); if (!title) throw new VaultError('Give your project a name.');
    const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 55) || 'project'}-${randomUUID().slice(0, 8)}`;
    const folder = text(input.folder || '', 500);
    if (folder && !fs.statSync(safeFile(path.resolve(root, folder))).isDirectory()) throw new VaultError('Link a project folder, rather than a file.');
    const repository = link(input.repository), live = link(input.live);
    const match = read().projects.find(project => repository && project.repository.replace(/\.git$/, '').replace(/\/$/, '').toLowerCase() === repository.replace(/\.git$/, '').replace(/\/$/, '').toLowerCase() && project.folder === folder || live && project.live === live);
    if (match) throw new VaultError(`Already in your collection as ${match.title}. Add links in that project's journal.`, 409);
    const now = new Date().toISOString();
    const data = { ideaquest: true, id, title, pitch: text(input.pitch || '', 1000), phase: input.phase === 'complete' ? 'complete' : 'idea', released: input.phase === 'complete', repository, live,
      next: text(input.next || '', 2000), changed: '', folder, milestones: [], sessions: [], createdAt: now, updatedAt: now };
    const file = safeFile(path.join(home, `${id}.md`));
    fs.writeFileSync(file, render(null, data), { encoding: 'utf8', flag: 'wx' });
    return id;
  }
  function update(id, input) {
    const project = read().projects.find(p => p.id === id); if (!project) throw new VaultError('Project not found.', 404);
    const file = safeFile(path.join(root, project.vaultPath)), source = fs.readFileSync(file, 'utf8');
    if (input.revision !== revision(source)) throw new VaultError('This note changed in Obsidian. Your draft is kept here. Review the current note, then keep your draft and retry.', 409);
    const note = parse(source), d = { ...note.data }, now = new Date().toISOString();
    if (input.action === 'checkpoint') {
      const changed = text(input.changed, 4000), next = text(input.next, 2000);
      if (!changed || !next) throw new VaultError('Add what changed and one next step.');
      d.changed = changed; d.next = next;
      d.sessions = [{ at: now, changed, next }, ...project.sessions].slice(0, 100);
      if ([changed,next].some(value=>value.includes('<!-- /ideaquest-session -->') || value.includes('<!-- ideaquest-session -->'))) throw new VaultError('Leave the session markers out of checkpoint text.');
      note.body += `\n<!-- ideaquest-session -->\n## Session · ${now}\n\n### What changed\n\n${changed}\n\n### What’s next\n\n${next}\n<!-- /ideaquest-session -->\n`;
    } else if (input.action === 'milestone') {
      if (project.legacyWorkflow) throw new VaultError('Class approvals stay in the original progress board.');
      d.milestones = project.milestones.map((m,i) => i === input.index ? { ...m, done: input.done === true } : m);
    } else if (input.action === 'settings') {
      d.title = text(input.title, 120); if (!d.title) throw new VaultError('Give your project a name.');
      d.pitch = text(input.pitch || '', 1000); d.repository = link(input.repository); d.live = link(input.live);
      d.next = text(input.next || '', 2000);
      if (!phases.includes(input.phase)) throw new VaultError('Choose a project state.');
      d.phase = input.phase;
      if (d.phase === 'complete' || project.released) d.released = true;
      if (!project.legacyWorkflow) {
        const labels = text(input.milestoneText || '', 2000).split('\n').map(s => s.trim()).filter(Boolean);
        if (labels.length > 12) throw new VaultError('Use at most 12 milestones.');
        d.milestones = labels.map(title => ({ title: title.slice(0, 120), done: project.milestones.find(m => m.title === title)?.done === true }));
      }
      d.folder = text(input.folder || '', 500); if (d.folder && !fs.statSync(safeFile(path.resolve(root, d.folder))).isDirectory()) throw new VaultError('Link a project folder, rather than a file.');
    } else throw new VaultError('Unknown project action.');
    d.updatedAt = now; atomicWrite(file, render(note, d)); return id;
  }
  function noteContent(id) {
    const project = read().projects.find(p => p.id === id); if (!project) throw new VaultError('Project not found.', 404);
    return fs.readFileSync(safeFile(path.join(root, project.vaultPath)), 'utf8');
  }
  return { seed, read, create, update, noteContent, close: () => watcher?.close() };
}
