import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultDataFile = path.resolve(here, '..', 'progress-arcade', 'projects.json');
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
]);

export function createApp({ dataFile = defaultDataFile } = {}) {
  return http.createServer((request, response) => {
    if (request.method !== 'GET') {
      response.writeHead(405, { Allow: 'GET' });
      response.end('Read-only prototype');
      return;
    }
    const url = new URL(request.url, 'http://localhost');
    const pathname = url.pathname;
    if (pathname === '/api/projects') {
      try {
        const state = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
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
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4188);
  createApp({ dataFile: process.env.IDEAQUEST_DATA_FILE || defaultDataFile }).listen(port, '127.0.0.1', () => {
    process.stdout.write(`Potion room study: http://127.0.0.1:${port}/\n`);
  });
}
