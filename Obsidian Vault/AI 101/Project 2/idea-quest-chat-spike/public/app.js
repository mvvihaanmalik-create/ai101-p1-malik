const $ = (id) => document.getElementById(id);
const state = { projects: [], activeProjectId: '', selectedProjectId: '', csrfToken: '', busy: false, history: {} };

function approvedCount(project) { return project.gates?.filter((gate) => gate === 'approved').length || 0; }

function renderProjects() {
  const list = $('project-list');
  list.replaceChildren();
  for (const project of state.projects) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `project-button${project.id === state.selectedProjectId ? ' selected' : ''}`;
    button.setAttribute('aria-pressed', String(project.id === state.selectedProjectId));
    const icon = document.createElement('span');
    icon.className = 'project-icon';
    icon.textContent = project.id === 'idea-quest' ? '✦' : project.id === 'obsidian-gaze' ? '◉' : project.id === 'image-palette' ? '◐' : '◇';
    const title = document.createElement('span');
    title.className = 'project-name';
    title.textContent = project.title;
    const progress = document.createElement('span');
    progress.className = 'project-progress';
    progress.textContent = project.kind === 'workflow' ? `${approvedCount(project)}/5` : 'ART';
    button.append(icon, title, progress);
    button.addEventListener('click', () => selectProject(project.id));
    list.append(button);
  }
}

function renderStatus() {
  const project = state.projects.find((entry) => entry.id === state.selectedProjectId);
  if (!project) return;
  $('status-heading').textContent = project.title;
  $('project-pitch').textContent = project.pitch;
  $('next-move').textContent = project.nextMove;
  $('updated-label').textContent = `Updated ${project.updatedAt || 'unknown'}`;
  $('progress-label').textContent = project.kind === 'workflow' ? `${approvedCount(project)} of 5 approved` : 'Unscored artifact';
  const row = $('gate-row');
  row.replaceChildren();
  if (project.kind === 'workflow') {
    for (let i = 0; i < 5; i++) {
      const gate = document.createElement('span');
      gate.className = `gate ${project.gates[i] || 'upcoming'}`;
      gate.title = `Step ${i + 1}: ${project.gates[i] || 'upcoming'}`;
      row.append(gate);
    }
  } else row.textContent = '✦ Completed before this workflow';
}

async function renderSources() {
  try {
    const response = await fetch(`/api/context?project=${encodeURIComponent(state.selectedProjectId)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Context unavailable');
    const data = await response.json();
    $('source-count').textContent = String(data.sources.length);
    const list = $('source-list');
    list.replaceChildren();
    for (const source of data.sources) {
      const item = document.createElement('li');
      item.textContent = source;
      list.append(item);
    }
  } catch {
    $('source-count').textContent = '?';
    $('source-list').replaceChildren();
  }
}

function addMessage(role, text) {
  const messages = $('messages');
  messages.querySelector('.welcome')?.remove();
  const bubble = document.createElement('div');
  bubble.className = `message ${role}`;
  const label = document.createElement('div');
  label.className = 'message-label';
  label.textContent = role === 'user' ? 'YOU' : role === 'assistant' ? 'CODEX · READ ONLY' : 'STATUS';
  const body = document.createElement('div');
  body.className = 'message-body';
  body.textContent = text;
  bubble.append(label, body);
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function selectProject(id) {
  if (state.busy) return;
  state.selectedProjectId = id;
  renderProjects();
  renderStatus();
  renderSources();
  $('messages').replaceChildren();
  addMessage('system', `Project context switched to ${state.projects.find((project) => project.id === id)?.title || id}. Ask a question to load the latest vault notes.`);
}

async function refreshStatus() {
  try {
    const response = await fetch('/api/status', { cache: 'no-store' });
    if (!response.ok) throw new Error('Local status unavailable.');
    const data = await response.json();
    state.projects = data.projects;
    state.activeProjectId = data.activeProjectId;
    state.csrfToken = data.csrfToken;
    if (!state.selectedProjectId || !state.projects.some((entry) => entry.id === state.selectedProjectId)) {
      state.selectedProjectId = data.activeProjectId;
    }
    renderProjects();
    renderStatus();
    await renderSources();
  } catch (error) {
    $('agent-state').textContent = 'OFFLINE';
    addMessage('system', error.message);
  }
}

async function sendPrompt(event) {
  event.preventDefault();
  const prompt = $('prompt').value.trim();
  if (state.busy || prompt.length < 3 || !state.selectedProjectId) return;
  state.busy = true;
  $('send').disabled = true;
  $('agent-state').textContent = 'READING VAULT…';
  const projectId = state.selectedProjectId;
  const history = (state.history[projectId] || []).slice(-6);
  addMessage('user', prompt);
  $('prompt').value = '';
  const pending = addMessage('system', 'Codex is reading the selected project context and preparing an answer…');
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-idea-csrf': state.csrfToken },
      body: JSON.stringify({ projectId, prompt, history }),
    });
    const result = await response.json();
    pending.remove();
    if (!response.ok) throw new Error(result.error || 'The prompt did not complete.');
    addMessage('assistant', result.answer);
    state.history[projectId] = [...history, { role: 'user', text: prompt }, { role: 'assistant', text: result.answer.slice(0, 1200) }].slice(-6);
    $('agent-state').textContent = 'ANSWER READY';
    await refreshStatus();
  } catch (error) {
    pending.remove();
    addMessage('system', error.message);
    $('agent-state').textContent = 'CHECK NEEDED';
  } finally {
    state.busy = false;
    $('send').disabled = false;
    $('prompt').focus();
  }
}

for (const button of document.querySelectorAll('[data-question]')) {
  button.addEventListener('click', () => { $('prompt').value = button.dataset.question; $('prompt').focus(); });
}
$('chat-form').addEventListener('submit', sendPrompt);
$('prompt').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); $('chat-form').requestSubmit(); }
});
refreshStatus();
setInterval(() => { if (!state.busy) refreshStatus(); }, 15000);
