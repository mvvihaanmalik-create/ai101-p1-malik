export function approvedCount(project) {
  return (project.gates || []).filter((gate) => gate === 'approved').length;
}

export function levelFor(project) {
  return project.gates?.length ? Math.max(0, Math.min(1, approvedCount(project) / project.gates.length)) : project.phase === 'complete' ? 1 : 0;
}
