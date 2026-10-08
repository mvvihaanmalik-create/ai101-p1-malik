import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultDataFile = path.join(here, 'projects.json');
const defaultProgressFile = path.join(here, '..', 'progress.md');
const gateNames = ['Goal', 'Route', 'Prototype', 'Human check', 'Decide'];
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
]);

function readState(dataFile) {
  const state = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  if (!Array.isArray(state.projects)) throw new Error('Invalid project registry');
  return state;
}

function saveState(dataFile, state) {
  const temporary = `${dataFile}.${process.pid}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  try { fs.renameSync(temporary, dataFile); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

function safeText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function stepLabel(project) {
  const i = project.gates.findIndex((gate) => gate !== 'approved');
  return i < 0 ? 'Complete' : `${String(i + 1).padStart(2, '0')} ${gateNames[i]}`;
}

export function renderProgressNote(state) {
  const project = state.projects.find((entry) => entry.id === state.activeProjectId);
  if (!project) return '# Active project\n\nNo project selected.\n';
  const approved = project.gates.filter((gate) => gate === 'approved').length;
  const bars = project.kind === 'workflow' ? '■'.repeat(approved) + '□'.repeat(5 - approved) : 'ARTIFACT COMPLETE';
  const gateLine = project.kind === 'workflow'
    ? project.gates.map((gate, index) => `${String(index + 1).padStart(2, '0')} ${gateNames[index]} ${gate === 'approved' ? '✅' : gate === 'active' ? '▶' : '○'}`).join(' → ')
    : 'This project predates the five-gate coding workflow.';
  return `# Active project · ${project.title}\n\n## ${bars}${project.kind === 'workflow' ? ` · ${approved}/5 gates approved` : ''}\n\n**${gateLine}**\n\n**Now:** ${project.pitch}\n\n**Next decision:** ${project.nextMove}\n\n**Live board:** [[AI 101/Project 2/progress-arcade/README.md]] · **Updated:** ${project.updatedAt}\n\n> [!note] The five blocks count your approved decision gates, not percent of work. A build or test never fills a gate by itself. The full bar on Image Palette Studio refers to its original accepted workflow run; its later accent-override side quest remains under review.\n`;
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(value));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 16384) {
        reject(new Error('Request is too large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    request.on('error', reject);
  });
}

export function createApp({ dataFile = defaultDataFile, progressFile = defaultProgressFile } = {}) {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const origin = request.headers.origin;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const expected = `http://127.0.0.1:${request.socket.localPort}`;
        if (origin && origin !== expected) return sendJson(response, 403, { error: 'Only this local board can make changes.' });
        if (!request.headers['content-type']?.startsWith('application/json')) return sendJson(response, 415, { error: 'Use JSON to change the board.' });
      }
      if (request.method === 'GET' && url.pathname === '/api/projects') {
        return sendJson(response, 200, readState(dataFile));
      }
      if (request.method === 'POST' && url.pathname === '/api/projects') {
        const body = await readBody(request);
        const title = safeText(body.title, 60);
        const pitch = safeText(body.pitch, 180);
        if (title.length < 2 || pitch.length < 4) return sendJson(response, 400, { error: 'Add a title and short idea.' });
        const state = readState(dataFile);
        if (state.projects.length >= 100) return sendJson(response, 409, { error: 'The board is full.' });
        const now = new Date().toISOString();
        const project = {
          id: randomUUID(), title, pitch, kind: 'workflow', phase: 'active', accent: 'mint',
          createdAt: now, updatedAt: now,
          gates: ['active', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
          nextMove: 'Frame the goal and success test. Only your approval opens Step 2.',
          vaultLink: '',
          updates: [{ at: now, text: 'New idea started. Step 1 is open; no gate has been approved.' }],
        };
        state.projects.unshift(project);
        state.activeProjectId = project.id;
        saveState(dataFile, state);
        if (progressFile) fs.writeFileSync(progressFile, renderProgressNote(state), 'utf8');
        return sendJson(response, 201, { project, state });
      }
      if (request.method === 'PATCH' && url.pathname.startsWith('/api/projects/')) {
        const id = decodeURIComponent(url.pathname.slice('/api/projects/'.length));
        const body = await readBody(request);
        const state = readState(dataFile);
        const project = state.projects.find((entry) => entry.id === id);
        if (!project) return sendJson(response, 404, { error: 'Project not found.' });
        const now = new Date().toISOString();
        if (body.action === 'select') {
          state.activeProjectId = id;
        } else if (body.action === 'approve') {
          if (project.kind !== 'workflow') return sendJson(response, 409, { error: 'This artifact has no workflow gates.' });
          const index = project.gates.findIndex((gate) => gate !== 'approved');
          if (index < 0) return sendJson(response, 409, { error: 'The five-gate run is already complete.' });
          project.gates[index] = 'approved';
          if (index < 4) project.gates[index + 1] = 'active';
          project.phase = index === 4 ? 'complete' : 'active';
          project.nextMove = index === 4 ? 'Original five-gate run complete. Start a bounded side quest to revise.' : `Continue with Step ${index + 2}: ${gateNames[index + 1]}.`;
          project.updates.unshift({ at: now, text: `You approved Step ${index + 1}: ${gateNames[index]}.` });
        } else if (body.action === 'revise') {
          if (project.kind !== 'workflow' || project.gates.every((gate) => gate === 'approved')) return sendJson(response, 409, { error: 'No active gate to revise.' });
          const note = safeText(body.note, 220);
          if (!note) return sendJson(response, 400, { error: 'Say what needs another pass.' });
          project.phase = 'revising';
          project.nextMove = note;
          project.updates.unshift({ at: now, text: `Another pass requested: ${note}` });
        } else if (body.action === 'note') {
          const note = safeText(body.note, 220);
          if (!note) return sendJson(response, 400, { error: 'Write a short update first.' });
          project.updates.unshift({ at: now, text: note });
        } else {
          return sendJson(response, 400, { error: 'Unknown action.' });
        }
        project.updatedAt = now;
        project.updates = project.updates.slice(0, 40);
        saveState(dataFile, state);
        if (progressFile) fs.writeFileSync(progressFile, renderProgressNote(state), 'utf8');
        return sendJson(response, 200, { project, state });
      }
      if (request.method === 'GET' && staticFiles.has(url.pathname)) {
        const [name, type] = staticFiles.get(url.pathname);
        response.writeHead(200, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
        return response.end(fs.readFileSync(path.join(here, 'public', name)));
      }
      return sendJson(response, 404, { error: 'Not found.' });
    } catch (error) {
      const status = /Invalid JSON|too large/.test(error.message) ? 400 : 500;
      return sendJson(response, status, { error: status === 500 ? 'The board could not save or load. Check the local server.' : error.message });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4177);
  createApp().listen(port, '127.0.0.1', () => {
    process.stdout.write(`Progress Arcade ready at http://127.0.0.1:${port}\n`);
  });
}
