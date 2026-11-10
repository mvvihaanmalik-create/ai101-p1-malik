import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig, parseProjectFrontmatter, extractProjects, refreshProjectContext, readProjectContext } from '../scripts/context.mjs';
import { watchProjectContext } from '../scripts/context-watch.mjs';

async function fixture(t) {
  const vaultRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'design-shelf-context-'));
  t.after(() => fs.rm(vaultRoot, { recursive: true, force: true }));
  const notes = path.join(vaultRoot, 'Project 2/Workshop Projects');
  const registry = path.join(vaultRoot, 'Project 2/progress-arcade/projects.json');
  const configPath = path.join(vaultRoot, 'Project-03/design-shelf/config/project-sources.json');
  await Promise.all([notes, path.dirname(registry), path.dirname(configPath)].map(p => fs.mkdir(p, { recursive: true })));
  await fs.writeFile(configPath, JSON.stringify({ schemaVersion: 1, debounceMs: 100, pollIntervalMs: 1000 }));
  await fs.writeFile(registry, JSON.stringify({ activeProjectId: 'test-plugin', projects: [{ id: 'test-plugin', gates: ['approved', 'active', 'upcoming', 'upcoming', 'upcoming'], password: 'registry-private', updates: [{ text: 'private journal' }] }] }));
  const note = path.join(notes, 'plugin.md');
  await fs.writeFile(note, '---\nid: "test-plugin"\ntitle: "Color plugin"\npitch: "An offline Obsidian plugin for images."\nnext: "Review the image editor."\nfolder: "Project 2/plugin"\nupdatedAt: "2026-10-20"\n---\nPRIVATE BODY CONTENT');
  return { vaultRoot, configPath, notes, note, registry };
}

test('uses note summaries, registry gates, and transparent type inference', async t => {
  const options = await fixture(t);
  const data = await extractProjects(options);
  assert.equal(data.activeProjectId, 'test-plugin');
  assert.equal(data.projects.length, 1);
  const project = data.projects[0];
  assert.equal(project.type, 'plugins');
  assert.equal(project.gates.approved, 1);
  assert.equal(project.stage, 'Feasibility');
  assert.equal(project.contextSource.types, 'inferred from summary');
  assert.ok(project.tags.includes('offline'));
  assert.ok(project.contextKeywords.includes('images'));
  assert.ok(project.obsidianUrl.startsWith('obsidian://open?'));
  assert.equal(project.sourceNote, 'Project 2/Workshop Projects/plugin.md');
  assert.ok(!JSON.stringify(data).includes('PRIVATE BODY'));
  assert.ok(!JSON.stringify(data).includes('registry-private'));
  assert.ok(!JSON.stringify(data).includes('private journal'));
});

test('drops unknown, nested, secret-like fields and outside folder paths', async t => {
  const options = await fixture(t);
  await fs.writeFile(options.note, '---\nid: test-plugin\ntitle: Test\npitch: "api_key=abcdefghijklmnopqrst"\nfolder: ../../private\npassword: "hidden password"\nprivateNotes:\n  text: "hidden nested data"\nnext: Safe next step\n---\nPrivate body');
  const data = await extractProjects(options);
  const project = data.projects[0];
  assert.equal(project.pitch, '');
  assert.equal(project.folder, undefined);
  assert.equal(project.next, 'Safe next step');
  assert.ok(!JSON.stringify(data).includes('abcdefghijklmnopqrst'));
  assert.ok(!JSON.stringify(data).includes('hidden'));
});

test('explicit note overrides control type, tags, and focus', async t => {
  const options = await fixture(t);
  await fs.appendFile(options.note, '\nUnrelated text');
  const text = await fs.readFile(options.note, 'utf8');
  await fs.writeFile(options.note, text.replace('next:', 'designShelfType: ["games", "creative"]\ndesignShelfTags:\n  - "keyboard"\n  - "inventory"\ndesignShelfFocus: "Inventory transitions"\nnext:'));
  const { projects: [project] } = await extractProjects(options);
  assert.deepEqual(project.types, ['games', 'creative']);
  assert.ok(project.tags.includes('inventory'));
  assert.equal(project.focus, 'Inventory transitions');
  assert.equal(project.contextSource.types, 'designShelfType');
  assert.deepEqual(project.inference, []);
});

test('skips malformed, missing-ID, duplicate-ID notes without using body text', async t => {
  const options = await fixture(t);
  await fs.writeFile(path.join(options.notes, 'bad.md'), '---\nid: "broken\n---\n');
  await fs.writeFile(path.join(options.notes, 'missing.md'), '---\ntitle: Missing\n---\nid: this-is-not-frontmatter');
  await fs.writeFile(path.join(options.notes, 'duplicate.md'), '---\nid: test-plugin\ntitle: Duplicate\n---\n');
  const data = await extractProjects(options);
  assert.equal(data.projects.length, 1);
  assert.equal(data.warnings.length, 3);
  assert.throws(() => parseProjectFrontmatter('---\nid: a\nid: b\n---\n'), /Duplicate/);
});

test('missing registry means unknown gates; registry selection must name a real note', async t => {
  const options = await fixture(t);
  await fs.writeFile(options.registry, '{not json');
  let data = await extractProjects(options);
  assert.equal(data.projects[0].gates.known, false);
  assert.equal(data.projects[0].gates.approved, null);
  assert.equal(data.projects[0].stage, 'Unknown');
  assert.equal(data.warnings.length, 1);
  await fs.writeFile(options.registry, JSON.stringify({ activeProjectId: '../../private', projects: [] }));
  data = await extractProjects(options);
  assert.equal(data.activeProjectId, 'test-plugin');
  await fs.rm(options.notes, { recursive: true });
  data = await extractProjects(options);
  assert.deepEqual(data.projects, []);
  assert.equal(data.activeProjectId, null);
});

test('configuration cannot expand the fixed source boundary', async t => {
  const options = await fixture(t);
  await fs.writeFile(options.configPath, JSON.stringify({ schemaVersion: 1, notesDirectory: '../private' }));
  await assert.rejects(loadConfig(options), /boundary/);
});

test('refresh updates the generated cache after context changes and preserves source bytes', async t => {
  const options = await fixture(t);
  const registryBefore = await fs.readFile(options.registry, 'utf8');
  const original = await fs.readFile(options.note, 'utf8');
  await refreshProjectContext(options);
  await fs.writeFile(options.note, original.replace('Review the image editor.', 'Test keyboard shortcuts.'));
  await refreshProjectContext(options);
  const data = await readProjectContext(options);
  assert.equal(data.projects[0].focus, 'Test keyboard shortcuts.');
  assert.ok(data.projects[0].contextKeywords.includes('keyboard'));
  assert.equal(await fs.readFile(options.registry, 'utf8'), registryBefore);
  assert.equal(await fs.readFile(options.note, 'utf8'), original.replace('Review the image editor.', 'Test keyboard shortcuts.'));
});

test('watcher catches editor note replacement and ignores unrelated files', { timeout: 7000 }, async t => {
  const options = await fixture(t);
  let updates = 0;
  let resolveUpdate;
  let rejectUpdate;
  const updated = new Promise((resolve, reject) => { resolveUpdate = resolve; rejectUpdate = reject; });
  const monitor = await watchProjectContext({
    ...options,
    onUpdate: data => { updates++; if (data.projects[0]?.next === 'Try the motion preview.') resolveUpdate(data); },
    onError: rejectUpdate,
  });
  t.after(() => monitor.close());
  await fs.writeFile(path.join(options.notes, 'private.txt'), 'do not read');
  const original = await fs.readFile(options.note, 'utf8');
  await fs.writeFile(`${options.note}.tmp`, original.replace('Review the image editor.', 'Try the motion preview.'));
  await fs.unlink(options.note);
  try { await fs.rename(`${options.note}.tmp`, options.note); }
  catch (error) {
    if (error.code !== 'EPERM') throw error;
    await fs.copyFile(`${options.note}.tmp`, options.note);
    await fs.unlink(`${options.note}.tmp`);
  }
  const data = await updated;
  assert.equal(data.projects[0].focus, 'Try the motion preview.');
  assert.equal(updates, 2);
});
