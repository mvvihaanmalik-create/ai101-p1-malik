import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { createApp, renderProgressNote } from '../server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const seed = path.join(here, '..', 'projects.json');

async function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'progress-arcade-'));
  const dataFile = path.join(directory, 'projects.json');
  const progressFile = path.join(directory, 'progress.md');
  fs.copyFileSync(seed, dataFile);
  const server = createApp({ dataFile, progressFile });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    progressFile,
    async close() { server.close(); await once(server, 'close'); fs.rmSync(directory, { recursive: true, force: true }); },
  };
}

test('seeded board has honest progress and excludes artifact from five-gate count', async () => {
  const f = await fixture();
  try {
    const response = await fetch(`${f.base}/api/projects`);
    assert.equal(response.status, 200);
    const board = await response.json();
    assert.equal(board.projects.length, 4);
    assert.equal(board.activeProjectId, 'idea-quest');
    const gaze = board.projects.find((project) => project.id === 'obsidian-gaze');
    assert.deepEqual(gaze.gates, ['approved', 'approved', 'active', 'upcoming', 'upcoming']);
    assert.match(renderProgressNote(board), /□□□□□ · 0\/5/);
    assert.equal(board.projects.find((project) => project.id === 'ai-art-pin-up').gates.length, 0);
    assert.equal((await fetch(f.base)).status, 200);
    assert.equal((await fetch(`${f.base}/not-a-file`)).status, 404);
  } finally { await f.close(); }
});

test('new idea saves, approval advances one gate, revision does not', async () => {
  const f = await fixture();
  try {
    let response = await fetch(`${f.base}/api/projects`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Little Garden', pitch: 'A tiny creative coding experiment.' }),
    });
    assert.equal(response.status, 201);
    const created = await response.json();
    const id = created.project.id;
    assert.equal(created.state.activeProjectId, id);
    assert.deepEqual(created.project.gates, ['active', 'upcoming', 'upcoming', 'upcoming', 'upcoming']);
    assert.match(fs.readFileSync(f.progressFile, 'utf8'), /□□□□□ · 0\/5/);

    response = await fetch(`${f.base}/api/projects/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'revise', note: 'Make the goal smaller.' }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).project.gates, ['active', 'upcoming', 'upcoming', 'upcoming', 'upcoming']);

    response = await fetch(`${f.base}/api/projects/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).project.gates, ['approved', 'active', 'upcoming', 'upcoming', 'upcoming']);
    assert.match(fs.readFileSync(f.progressFile, 'utf8'), /■□□□□ · 1\/5/);
  } finally { await f.close(); }
});

test('rejects empty ideas and cross-origin writes', async () => {
  const f = await fixture();
  try {
    const bad = await fetch(`${f.base}/api/projects`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'A', pitch: 'No' }),
    });
    assert.equal(bad.status, 400);
    const foreign = await fetch(`${f.base}/api/projects`, {
      method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://example.com' },
      body: JSON.stringify({ title: 'Bad idea', pitch: 'Should never be saved.' }),
    });
    assert.equal(foreign.status, 403);
  } finally { await f.close(); }
});
