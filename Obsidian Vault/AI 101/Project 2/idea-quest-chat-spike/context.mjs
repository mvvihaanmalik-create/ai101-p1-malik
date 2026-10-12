import fs from 'node:fs';
import path from 'node:path';

const PROJECT_FILES = {
  'idea-quest': [
    'AI 101/Project 2/idea-quest-chat-spike/handoff.md',
    'AI 101/Project 2/outputs/idea-quest/01-define-the-goal.md',
    'AI 101/Project 2/outputs/idea-quest/02-check-feasibility.md',
    'AI 101/Project 2/idea-quest-chat-feasibility.md',
    'AI 101/Project 2/idea-quest-three-spike/README.md',
  ],
  'obsidian-gaze': [
    'AI 101/Project 2/outputs/obsidian-gaze/01-define-the-goal.md',
    'AI 101/Project 2/outputs/obsidian-gaze/02-check-feasibility.md',
    'AI 101/Project 2/obsidian-gaze-prototype/README.md',
  ],
  'image-palette': [
    'AI 101/Project 2/outputs/image-palette-web-app/01-define-the-goal.md',
    'AI 101/Project 2/outputs/image-palette-web-app/02-check-feasibility.md',
    'AI 101/Project 2/outputs/image-palette-web-app/03-build-a-small-prototype.md',
  ],
};

const CORE_FILES = [
  'AI 101/Project 2/00-start-here.md',
  'AI 101/Project 2/progress.md',
  'AI 101/ai-use-log.md',
];

function excerpt(relativePath, content) {
  if (relativePath.endsWith('ai-use-log.md')) {
    const start = content.indexOf('## 2026-10-11');
    const end = content.indexOf('\n## 2026-10-10', start + 1);
    content = start < 0 ? content.slice(0, 10000) : content.slice(start, end < 0 ? undefined : end);
  }
  return content.slice(0, 9000);
}

export function readContext(vaultRoot, projectId) {
  const registryPath = path.join(vaultRoot, 'AI 101', 'Project 2', 'progress-arcade', 'projects.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const project = registry.projects.find((entry) => entry.id === projectId);
  if (!project) throw new RangeError('Unknown project.');

  const sources = ['AI 101/Project 2/progress-arcade/projects.json'];
  const chunks = [`[SOURCE: ${sources[0]} · selected project record]\n${JSON.stringify(project, null, 2)}`];
  for (const relativePath of [...CORE_FILES, ...(PROJECT_FILES[projectId] || [])]) {
    const absolutePath = path.join(vaultRoot, ...relativePath.split('/'));
    if (!fs.existsSync(absolutePath)) continue;
    sources.push(relativePath);
    chunks.push(`[SOURCE: ${relativePath}]\n${excerpt(relativePath, fs.readFileSync(absolutePath, 'utf8'))}`);
  }
  const approved = project.kind === 'workflow'
    ? project.gates.filter((gate) => gate === 'approved').length : null;
  return {
    project,
    approved,
    sources,
    contextText: chunks.join('\n\n---\n\n').slice(0, 38000),
  };
}

export function listProjects(vaultRoot) {
  const registryPath = path.join(vaultRoot, 'AI 101', 'Project 2', 'progress-arcade', 'projects.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  return {
    activeProjectId: registry.activeProjectId,
    projects: registry.projects.map((project) => ({
      id: project.id,
      title: project.title,
      pitch: project.pitch,
      kind: project.kind,
      gates: project.gates,
      nextMove: project.nextMove,
      updatedAt: project.updatedAt,
    })),
  };
}
