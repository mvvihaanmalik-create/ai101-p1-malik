// A presentation choice; project progress and shelf placement remain independent.
export function artifactKind(project, primaryProjectId) {
  const done = project.gates?.filter(state => state === 'approved').length || 0;
  if (project.released || project.kind === 'artifact' || project.phase === 'complete' || project.legacyWorkflow !== false && done === 5) return 'keepsake';
  if (project.id === primaryProjectId && project.phase === 'active') return 'potion';
  if (project.phase === 'review' || project.gates?.[3] === 'active' || /^(?:side quest:\s*)?(?:review|test|check)\b/i.test(project.nextMove || '')) return 'scroll';
  return 'potion';
}

export const ARTIFACTS = {
  potion: { label: 'Brewing', name: 'Potion', opening: 'Lift the cork', hint: 'A little idea is brewing inside.' },
  scroll: { label: 'Awaiting review', name: 'Sealed scroll', opening: 'Break the seal', hint: 'A finished draft, ready for your eyes.' },
  keepsake: { label: 'Collected', name: 'Keepsake chest', opening: 'Open the keepsake', hint: 'A completed chapter, with room for another.' }
};
