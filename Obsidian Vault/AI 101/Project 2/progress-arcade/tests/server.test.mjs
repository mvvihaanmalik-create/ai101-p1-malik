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

async function fixture(options = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'progress-arcade-'));
  const dataFile = path.join(directory, 'projects.json');
  const progressFile = path.join(directory, 'progress.md');
  fs.copyFileSync(seed, dataFile);
  const server = createApp({ dataFile, progressFile, ...options });
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
    const ideaQuest = board.projects.find((project) => project.id === 'idea-quest');
    assert.equal(ideaQuest.gates.length, 5);
    const approved = ideaQuest.gates.filter((gate) => gate === 'approved').length;
    const gaze = board.projects.find((project) => project.id === 'obsidian-gaze');
    assert.deepEqual(gaze.gates, ['approved', 'approved', 'active', 'upcoming', 'upcoming']);
    assert.ok(renderProgressNote(board).includes(`${'■'.repeat(approved)}${'□'.repeat(5 - approved)} · ${approved}/5`));
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

test('embedded companion requires local token and reads selected project without changing gates', async () => {
  let seenPrompt = '';
  const approved = JSON.parse(fs.readFileSync(seed, 'utf8')).projects
    .find((project) => project.id === 'idea-quest').gates
    .filter((gate) => gate === 'approved').length;
  const stubAnswer = `Approved gates: ${approved}/5.`;
  const f = await fixture({ chatRunner: async (prompt) => { seenPrompt = prompt; return stubAnswer; } });
  try {
    const token = (await (await fetch(`${f.base}/api/chat-token`)).json()).token;
    const payload = { projectId: 'idea-quest', prompt: 'What is approved?' };
    const denied = await fetch(`${f.base}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://example.com', 'x-idea-csrf': token }, body: JSON.stringify(payload),
    });
    assert.equal(denied.status, 403);
    const allowed = await fetch(`${f.base}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json', origin: f.base, 'x-idea-csrf': token }, body: JSON.stringify(payload),
    });
    assert.equal(allowed.status, 200);
    const answer = await allowed.json();
    assert.equal(answer.answer, stubAnswer);
    assert.ok(answer.sources.includes('AI 101/Project 2/progress-arcade/projects.json'));
    assert.match(seenPrompt, new RegExp(`APPROVED GATES: ${approved}/5`));
    assert.equal((await (await fetch(`${f.base}/api/projects`)).json()).projects.find((p) => p.id === 'idea-quest').gates.filter((g) => g === 'approved').length, approved);
  } finally { await f.close(); }
});
