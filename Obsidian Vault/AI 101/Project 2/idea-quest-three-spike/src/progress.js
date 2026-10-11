export function approvedCount(project) {
  return project.gates.filter((gate) => gate === 'approved').length;
}

export function levelFor(project) {
  return Math.max(0, Math.min(1, approvedCount(project) / 5));
}
