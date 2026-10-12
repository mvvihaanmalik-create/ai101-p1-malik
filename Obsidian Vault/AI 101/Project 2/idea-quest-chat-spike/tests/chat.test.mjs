import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readContext } from '../context.mjs';
import { createApp, makePrompt } from '../server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const vaultRoot = path.resolve(here, '../../../..');
const registryPath = path.join(vaultRoot, 'AI 101', 'Project 2', 'progress-arcade', 'projects.json');
const digest = () => createHash('sha256').update(fs.readFileSync(registryPath)).digest('hex');

test('refreshes approved status and lists concrete context sources without edits', () => {
  const before = digest();
  const context = readContext(vaultRoot, 'idea-quest');
  const recorded = JSON.parse(fs.readFileSync(registryPath, 'utf8')).projects.find((item) => item.id === 'idea-quest');
  assert.equal(context.approved, recorded.gates.filter((gate) => gate === 'approved').length);
  assert.ok(context.sources.includes('AI 101/Project 2/idea-quest-chat-spike/handoff.md'));
  assert.match(makePrompt(context, 'What is next?'), /Do not edit files/);
  assert.equal(digest(), before);
});

test('a new prompt sees changed gate data in a test copy, not stale chat memory', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-quest-context-test-'));
  assert.ok(path.resolve(temporary).startsWith(path.resolve(os.tmpdir()) + path.sep));
  const registryDir = path.join(temporary, 'AI 101', 'Project 2', 'progress-arcade');
  fs.mkdirSync(registryDir, { recursive: true });
  const file = path.join(registryDir, 'projects.json');
  const project = { id: 'idea-quest', title: 'idea.quest', kind: 'workflow', gates: ['approved', 'approved', 'active', 'upcoming', 'upcoming'] };
  try {
    fs.writeFileSync(file, JSON.stringify({ projects: [project] }));
    assert.equal(readContext(temporary, project.id).approved, 2);
    project.gates[2] = 'approved';
    fs.writeFileSync(file, JSON.stringify({ projects: [project] }));
    assert.equal(readContext(temporary, project.id).approved, 3);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

test('local server rejects cross-origin prompts and uses read-only runner', async () => {
  const before = digest();
  let receivedPrompt = '';
  const server = createApp({ vaultRoot, runner: async (prompt) => { receivedPrompt = prompt; return 'The record is unchanged.'; } });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const statusResponse = await fetch(`${base}/api/status`);
    assert.equal(statusResponse.status, 200);
    const status = await statusResponse.json();
    assert.ok(status.projects.some((project) => project.id === 'idea-quest'));
    const rejected = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { origin: 'https://example.invalid', 'content-type': 'application/json', 'x-idea-csrf': status.csrfToken },
      body: JSON.stringify({ projectId: 'idea-quest', prompt: 'What is the status?' }),
    });
    assert.equal(rejected.status, 403);
    const accepted = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { origin: base, 'content-type': 'application/json', 'x-idea-csrf': status.csrfToken },
      body: JSON.stringify({ projectId: 'idea-quest', prompt: 'What is the status?' }),
    });
    assert.equal(accepted.status, 200);
    assert.match(receivedPrompt, /REFRESHED CONTEXT/);
    assert.match(receivedPrompt, /What is the status\?/);
    assert.equal(digest(), before);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
