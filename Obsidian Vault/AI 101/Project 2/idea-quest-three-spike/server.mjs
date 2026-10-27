import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createVaultStore } from './vault-store.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultDataFile = path.resolve(here, '..', 'progress-arcade', 'projects.json');
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
]);

export function createApp({ dataFile = defaultDataFile, vaultRoot = path.resolve(here, '../..') } = {}) {
  const store = createVaultStore({ dataFile, vaultRoot, includeCompanionProjects: true }); store.seed();
  const token = randomBytes(24).toString('hex');
  function json(response, status, value) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(JSON.stringify(value));
  }
  const server = http.createServer(async (request, response) => {
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(request.headers.host || '')) { json(response, 403, { error: 'Open the workshop through its local address.' }); return; }
    const url = new URL(request.url, 'http://localhost');
    const pathname = url.pathname;
    if (request.method === 'POST' && /^\/api\/projects(?:\/[a-z0-9-]+)?$/.test(pathname)) {
      if (request.headers['x-workshop-token'] !== token || request.headers.origin !== `http://${request.headers.host}` || !request.headers['content-type']?.startsWith('application/json')) {
        json(response, 403, { error: 'Refresh the local workshop before saving.' }); return;
      }
      try {
        let body = ''; for await (const chunk of request) { body += chunk; if (body.length > 32768) throw new Error('Request is too large.'); }
        const input = JSON.parse(body);
        const id = pathname === '/api/projects' ? store.create(input) : store.update(pathname.split('/').at(-1), input);
        json(response, 200, { id, ...store.read(), token });
      } catch (error) { json(response, error.status || 400, { error: error.message }); }
      return;
    }
    if (request.method !== 'GET') { response.writeHead(405, { Allow: 'GET, POST' }); response.end('Method unavailable'); return; }
    if (/^\/api\/notes\/[a-z0-9-]+$/.test(pathname)) {
      try { const content = store.noteContent(pathname.split('/').at(-1)); response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(content); }
      catch (error) { json(response, error.status || 503, { error: error.message }); } return;
    }
    if (pathname === '/api/projects') {
      try {
        const state = store.read(); state.token = token;
        if (url.searchParams.get('demo') === '1') {
          const idea = state.projects.find((project) => project.id === 'idea-quest');
          if (idea) {
            idea.gates = ['active', 'upcoming', 'upcoming', 'upcoming', 'upcoming'];
            idea.nextMove = 'Demo-only 0/5 jar. The actual idea.quest approvals are unchanged.';
            idea.updates = [{ at: 'demo', text: 'This simulated state demonstrates an empty jar; it is not the live vault record.' }];
          }
        }
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(JSON.stringify(state));
      } catch {
        response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ error: 'Project registry unavailable' }));
      }
      return;
    }
    const asset = assets.get(pathname);
    if (!asset) { response.writeHead(404); response.end('Not found'); return; }
    fs.readFile(path.join(here, asset[0]), (error, content) => {
      if (error) { response.writeHead(500); response.end('Asset unavailable'); return; }
      response.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-store' });
      response.end(content);
    });
  });
  server.on('close', () => store.close());
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4188);
  createApp({ dataFile: process.env.IDEAQUEST_DATA_FILE || defaultDataFile }).listen(port, '127.0.0.1', () => {
    process.stdout.write(`Potion room study: http://127.0.0.1:${port}/\n`);
  });
}
