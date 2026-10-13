import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { createApp } from '../server.mjs';
import { approvedCount, levelFor } from '../src/progress.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const registry = path.resolve(here, '..', '..', 'progress-arcade', 'projects.json');

test('liquid levels count approvals only; artifact is not a workflow jar', () => {
  const state = JSON.parse(fs.readFileSync(registry, 'utf8'));
  const project = state.projects.find((item) => item.id === 'idea-quest');
  assert.equal(project.gates.length, 5);
  assert.equal(levelFor(project), approvedCount(project) / 5);
  assert.equal(levelFor({ gates: ['active', 'upcoming', 'upcoming', 'upcoming', 'upcoming'] }), 0);
  assert.equal(levelFor({ gates: ['approved', 'approved', 'approved', 'active', 'upcoming'] }), .6);
  assert.equal(levelFor({ gates: Array(5).fill('approved') }), 1);
  assert.equal(state.projects.find((item) => item.id === 'ai-art-pin-up').gates.length, 0);
});

test('local server preserves live class approvals and rejects unauthorized writes', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-quest-three-'));
  const dataFile = path.join(directory, 'projects.json');
  const state = JSON.parse(fs.readFileSync(registry, 'utf8'));
  const idea = state.projects.find((item) => item.id === 'idea-quest');
  idea.gates = ['active', 'upcoming', 'upcoming', 'upcoming', 'upcoming'];
  fs.writeFileSync(dataFile, JSON.stringify(state));
  const server = createApp({ dataFile, vaultRoot: directory });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(url)).status, 200);
    assert.equal((await fetch(`${url}/app.js`)).status, 200);
    let response = await fetch(`${url}/api/projects`);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(levelFor((await response.json()).projects.find((item) => item.id === 'idea-quest')), 0);
    idea.gates = ['approved', 'approved', 'approved', 'active', 'upcoming'];
    fs.writeFileSync(dataFile, JSON.stringify(state));
    response = await fetch(`${url}/api/projects`);
    assert.equal(levelFor((await response.json()).projects.find((item) => item.id === 'idea-quest')), .6);
    response = await fetch(`${url}/api/projects?demo=1`);
    assert.equal(levelFor((await response.json()).projects.find((item) => item.id === 'idea-quest')), 0);
    response = await fetch(`${url}/api/projects`);
    assert.equal(levelFor((await response.json()).projects.find((item) => item.id === 'idea-quest')), .6);
    assert.equal((await fetch(`${url}/api/projects`, { method: 'POST' })).status, 403);
  } finally {
    server.close();
    await once(server, 'close');
    assert.equal(path.dirname(directory), os.tmpdir());
    assert.ok(path.basename(directory).startsWith('idea-quest-three-'));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
