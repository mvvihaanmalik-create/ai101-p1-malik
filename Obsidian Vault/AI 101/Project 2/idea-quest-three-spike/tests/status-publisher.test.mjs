import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inputFingerprint, makeSnapshot, parseInspectedDeployment, prepareStage, validateSnapshot } from '../status-auto-publish.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, '../public-deploy');
const project = {
  id: 'sample', title: 'Sample', pitch: 'A safe public summary.', kind: 'workflow', phase: 'active', released: false,
  repository: '', live: '', nextMove: 'Check the result.', changed: 'Changed status.',
  gates: ['approved', 'active', 'upcoming', 'upcoming', 'upcoming'], gateNames: ['Goal', 'Route', 'Build', 'Review', 'Decide'],
  legacyWorkflow: true, milestones: [], updatedAt: '2026-10-13',
  vaultPath: 'C:\\Users\\private\\notes.md', sessions: [{ changed: 'PRIVATE' }], activity: [{ text: 'PRIVATE' }], updates: [{ text: 'PRIVATE' }],
};

test('public snapshot allowlists summary fields and removes private history', () => {
  const snapshot = makeSnapshot({ activeProjectId: 'sample', projects: [project] }, '2026-10-13T00:00:00.000Z');
  assert.equal(snapshot.projects[0].nextMove, 'Check the result.');
  assert.equal(snapshot.projects[0].vaultPath, undefined);
  assert.deepEqual(snapshot.projects[0].sessions, []);
  assert.deepEqual(snapshot.projects[0].activity, []);
  assert.deepEqual(snapshot.projects[0].updates, []);
  assert.equal(validateSnapshot(snapshot), true);
});

test('rejects private paths, credentials, duplicate ids, and oversized status', () => {
  const base = makeSnapshot({ activeProjectId: 'sample', projects: [project] });
  assert.throws(() => validateSnapshot({ ...base, projects: [{ ...base.projects[0], nextMove: 'C:\\Users\\private\\notes.md' }] }), /private path/);
  assert.throws(() => validateSnapshot({ ...base, projects: [{ ...base.projects[0], pitch: `sk-${'x'.repeat(32)}` }] }), /credential/);
  assert.throws(() => validateSnapshot({ ...base, projects: [base.projects[0], base.projects[0]] }), /duplicate/);
  assert.throws(() => validateSnapshot({ ...base, projects: [{ ...base.projects[0], nextMove: 'x'.repeat(2001) }] }), /nextMove/);
});

test('status inputs fingerprint detects a changed note', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-quest-input-'));
  try {
    const notes = path.join(root, 'notes'); fs.mkdirSync(notes);
    const registry = path.join(root, 'projects.json'); fs.writeFileSync(registry, '{}');
    const note = path.join(notes, 'one.md'); fs.writeFileSync(note, 'old');
    const first = inputFingerprint(registry, notes);
    fs.writeFileSync(note, 'new');
    assert.notEqual(inputFingerprint(registry, notes), first);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('stage contains exactly status plus pinned visual assets; visual drift fails closed', () => {
  const snapshot = makeSnapshot({ activeProjectId: 'sample', projects: [project] });
  const { stage } = prepareStage(snapshot, publicDir);
  try {
    assert.deepEqual(fs.readdirSync(stage).sort(), ['THREE-LICENSE.txt', 'app.js', 'index.html', 'projects.json', 'styles.css', 'vercel.json'].sort());
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(stage, 'projects.json'), 'utf8')).projects[0].sessions, []);
  } finally { fs.rmSync(stage, { recursive: true, force: true }); }
  const altered = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-quest-static-'));
  try {
    for (const name of ['THREE-LICENSE.txt', 'app.js', 'index.html', 'styles.css', 'vercel.json']) fs.copyFileSync(path.join(publicDir, name), path.join(altered, name));
    fs.appendFileSync(path.join(altered, 'styles.css'), '\n/* unintended change */');
    assert.throws(() => prepareStage(snapshot, altered), /Static asset changed/);
  } finally { fs.rmSync(altered, { recursive: true, force: true }); }
});

test('promotion target is the inspected immutable Ready deployment, not a moving alias', () => {
  const report = 'id  dpl_ABC123\nname idea-quest-ai101\ntarget production\nstatus ● Ready\nurl https://idea-quest-ai101-abc123-vihaanmalik.vercel.app\n';
  assert.deepEqual(parseInspectedDeployment(report), {
    deploymentId: 'dpl_ABC123', staged: 'https://idea-quest-ai101-abc123-vihaanmalik.vercel.app',
  });
  assert.throws(() => parseInspectedDeployment(report.replace('Ready', 'Error')), /not promoting/);
  assert.throws(() => parseInspectedDeployment(report.replace('idea-quest-ai101\ntarget', 'wrong-project\ntarget')), /not promoting/);
});
