const steps = ['Goal', 'Route', 'Prototype', 'Human check', 'Decide'];
const $ = (id) => document.getElementById(id);
let state = null;
let pendingAction = null;
let toastTimer;

function approvedCount(project) {
  return project.gates.filter((gate) => gate === 'approved').length;
}

function currentStep(project) {
  return project.gates.findIndex((gate) => gate !== 'approved');
}

function niceDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function toast(message, isError = false) {
  const el = $('toast');
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
}

async function request(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Something went wrong.');
  return result;
}

async function refresh(force = false) {
  try {
    const response = await fetch('/api/projects', { cache: 'no-store' });
    if (!response.ok) throw new Error('The local board is unavailable.');
    const next = await response.json();
    const changed = force || !state || JSON.stringify(next) !== JSON.stringify(state);
    state = next;
    $('connection').textContent = 'VAULT LINK ACTIVE';
    document.querySelector('.top-status').classList.remove('offline');
    $('lastSync').textContent = 'SYNCED ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (changed) render();
  } catch {
    $('connection').textContent = 'VAULT LINK LOST';
    document.querySelector('.top-status').classList.add('offline');
    $('lastSync').textContent = 'CHECK LOCAL SERVER';
  }
}

function addText(tag, className, value, parent) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value;
  parent.append(node);
  return node;
}

function renderList() {
  const list = $('projectList');
  list.replaceChildren();
  $('projectCount').textContent = String(state.projects.length).padStart(2, '0');
  for (const project of state.projects) {
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-tab' + (project.id === state.activeProjectId ? ' active' : '');
    button.dataset.accent = project.accent || 'mint';
    button.setAttribute('aria-pressed', project.id === state.activeProjectId ? 'true' : 'false');
    button.addEventListener('click', () => selectProject(project.id));
    const top = addText('span', 'tab-top', project.kind === 'artifact' ? 'BONUS CHAPTER' : project.phase.toUpperCase(), button);
    addText('span', '', project.kind === 'artifact' ? '★' : `☆ ${approvedCount(project)}/5`, top);
    addText('span', 'tab-name', project.title, button);
    const detail = project.kind === 'artifact' ? 'ARTIFACT COMPLETE' : approvedCount(project) === 5 ? 'ORIGINAL RUN COMPLETE' : `STEP ${currentStep(project) + 1} · ${steps[currentStep(project)]}`;
    addText('span', 'tab-bottom', detail, button);
    item.append(button);
    list.append(item);
  }
}

function renderStats() {
  const gates = state.projects.reduce((sum, project) => sum + approvedCount(project), 0);
  $('totalProjects').textContent = state.projects.length;
  $('totalGates').textContent = gates;
  $('totalXp').textContent = gates * 25;
}

function renderStages(project) {
  const container = $('stageMap');
  container.replaceChildren();
  const bar = $('progressBar');
  const artifact = project.kind === 'artifact';
  bar.hidden = artifact;
  container.hidden = artifact;
  $('progressCount').textContent = artifact ? 'FINAL ★' : `${approvedCount(project)} / 5`;
  bar.setAttribute('aria-valuenow', artifact ? '0' : String(approvedCount(project)));
  [...bar.children].forEach((segment, index) => {
    segment.className = artifact ? '' : project.gates[index];
  });
  if (artifact) return;
  project.gates.forEach((gate, index) => {
    const item = document.createElement('div');
    item.className = `stage ${gate}`;
    addText('span', 'stage-number', String(index + 1).padStart(2, '0'), item);
    addText('span', 'stage-label', steps[index], item);
    addText('span', 'stage-state', gate === 'approved' ? '✓ CLEARED' : gate === 'active' ? '▶ HERE' : '○ LOCKED', item);
    container.append(item);
  });
}

function actionButton(label, className, action, container) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', action);
  container.append(button);
}

function renderActions(project) {
  const actions = $('actions');
  actions.replaceChildren();
  const i = currentStep(project);
  if (project.kind === 'workflow' && i >= 0) {
    actionButton(`✓ APPROVE STEP ${i + 1} →`, 'primary-button', () => openAction('approve'), actions);
    actionButton('↺ ANOTHER PASS', 'secondary-button', () => openAction('revise'), actions);
  }
  actionButton('＋ ADD QUEST NOTE', 'secondary-button', () => openAction('note'), actions);
}

function renderJournal(project) {
  const journal = $('journal');
  journal.replaceChildren();
  if (!project.updates.length) addText('p', '', 'No updates yet. Write the first quest note.', journal);
  for (const update of project.updates) {
    const entry = document.createElement('article');
    entry.className = 'journal-entry';
    const time = addText('time', '', niceDate(update.at), entry);
    time.dateTime = update.at;
    addText('p', '', update.text, entry);
    journal.append(entry);
  }
}

function renderProject() {
  const project = state.projects.find((entry) => entry.id === state.activeProjectId) || state.projects[0];
  if (!project) {
    $('questTitle').textContent = 'No projects yet';
    $('questPitch').textContent = 'Start an idea to open the first quest.';
    return;
  }
  $('questKicker').textContent = project.kind === 'artifact' ? 'BONUS CHAPTER · FINISHED ARTIFACT' : `CURRENT SAVE · ${project.phase.toUpperCase()}`;
  $('questTitle').textContent = project.title;
  $('questPitch').textContent = project.pitch;
  $('questBadge').textContent = project.kind === 'artifact' ? 'COMPLETE ★' : approvedCount(project) === 5 ? 'SIDE QUEST ↺' : `LEVEL ${String(Math.max(1, currentStep(project) + 1)).padStart(2, '0')}`;
  $('nextMove').textContent = project.nextMove;
  renderStages(project);
  renderActions(project);
  renderJournal(project);
  const foot = $('questFoot');
  foot.replaceChildren();
  addText('span', '', `UPDATED ${niceDate(project.updatedAt)} · LOCAL VAULT RECORD`, foot);
  if (project.vaultLink) {
    const link = document.createElement('a');
    link.href = `obsidian://open?vault=Obsidian%20Vault&file=${encodeURIComponent(project.vaultLink)}`;
    link.textContent = 'OPEN SOURCE NOTE ↗';
    foot.append(link);
  }
}

function render() {
  renderList();
  renderStats();
  renderProject();
}

async function selectProject(id) {
  if (id === state.activeProjectId) return;
  try {
    const result = await request(`/api/projects/${encodeURIComponent(id)}`, 'PATCH', { action: 'select' });
    state = result.state;
    render();
  } catch (error) { toast(error.message, true); }
}

function openAction(action) {
  const project = state.projects.find((entry) => entry.id === state.activeProjectId);
  pendingAction = action;
  const descriptions = {
    approve: ['APPROVAL GATE', `Approve Step ${currentStep(project) + 1}?`, 'This records your decision and opens the next step. Tests and drafts alone do not count.', 'APPROVE & CONTINUE →'],
    revise: ['REVISION LOOP', 'Ask for another pass', 'What specifically needs to change before you approve this step?', 'SAVE REVISION ↺'],
    note: ['QUEST LOG', 'Add a field note', 'Record a result, observation, or decision without advancing the gate.', 'SAVE NOTE ＋'],
  };
  const [eyebrow, title, description, button] = descriptions[action];
  $('actionEyebrow').textContent = eyebrow;
  $('actionTitle').textContent = title;
  $('actionDescription').textContent = description;
  $('actionSubmit').textContent = button;
  $('actionNote').value = '';
  $('actionNote').required = action !== 'approve';
  $('actionNote').hidden = action === 'approve';
  $('actionNoteLabel').hidden = action === 'approve';
  $('actionDialog').showModal();
}

function updateClock() {
  $('clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

$('newProjectButton').addEventListener('click', () => $('newProjectDialog').showModal());
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => $(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
}));
$('newProjectForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    const result = await request('/api/projects', 'POST', {
      title: $('ideaTitle').value,
      pitch: $('ideaPitch').value,
    });
    state = result.state;
    $('newProjectDialog').close();
    $('newProjectForm').reset();
    render();
    toast('NEW QUEST UNLOCKED! Step 1 is ready. ✦');
  } catch (error) { toast(error.message, true); }
  finally { button.disabled = false; }
});
$('actionForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    const result = await request(`/api/projects/${encodeURIComponent(state.activeProjectId)}`, 'PATCH', {
      action: pendingAction,
      note: $('actionNote').value,
    });
    state = result.state;
    $('actionDialog').close();
    render();
    toast(pendingAction === 'approve' ? 'CHECKPOINT CLEARED! +25 XP ★' : 'QUEST LOG SAVED ✦');
  } catch (error) { toast(error.message, true); }
  finally { button.disabled = false; }
});
updateClock();
setInterval(updateClock, 30000);
refresh(true);
setInterval(() => refresh(), 4000);
