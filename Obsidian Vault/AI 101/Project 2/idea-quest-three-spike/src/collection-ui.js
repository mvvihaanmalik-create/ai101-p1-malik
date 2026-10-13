const $ = id => document.getElementById(id);
const HOSTED = document.body.dataset.mode === 'hosted';
const states = { idea:'Idea', active:'Building', review:'Reviewing', complete:'Released', resting:'Resting', revisiting:'Revisiting' };
const symbols = { idea:'✧', active:'⚗', review:'≋', complete:'❖', resting:'☾', revisiting:'✦' };
function element(tag, className, text) { const node = document.createElement(tag); node.className = className; if (text !== undefined) node.textContent = text; return node; }
function noteLink(vault, file) { return `obsidian://open?vault=${encodeURIComponent(vault || 'Obsidian Vault')}&file=${encodeURIComponent('AI 101/' + file)}`; }
function externalLink(label, href) { const anchor = element('a', 'destination', label); anchor.href = href; if (href.startsWith('https:') || href.startsWith('/api/')) { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; } return anchor; }

export function createCollectionUI({ getState, save, refresh, openProject, onCheckpoint }) {
  const dialog = $('libraryDialog'), checkpoint = $('checkpointForm'), settings = $('projectSettings'), create = $('createProjectForm');
  const drafts = new Map(); let currentId = null, checkpointDirty = false, settingsDirty = false;
  let returnFocus = null;
  function show(createMode = false, candidate = null) {
    returnFocus = document.activeElement;
    $('libraryContent').hidden = createMode; create.hidden = !createMode;
    $('libraryTitle').textContent = createMode ? 'A new chapter' : 'The collection';
    if (candidate) { create.elements.title.value = candidate.title; create.elements.folder.value = candidate.folder; }
    render(); if (!dialog.open) dialog.showModal();
    (createMode ? create.elements.title : $('librarySearch')).focus();
  }
  function close() { dialog.close(); returnFocus?.focus(); }
  function render() {
    const state = getState(); if (!state) return;
    const search = $('librarySearch').value.toLowerCase(), filter = $('libraryFilter').value;
    const projects = state.projects.filter(p => (!search || [p.title,p.pitch,p.nextMove,p.repository].join(' ').toLowerCase().includes(search)) && (filter === 'all' || p.phase === filter || filter === 'complete' && p.released || filter === 'active' && p.phase === 'revisiting'));
    $('librarySummary').textContent = `${projects.length} of ${state.projects.length} projects · ${HOSTED?'published '+new Date(state.sync.asOf).toLocaleDateString():'saved in '+state.sync.root}`;
    const grid = $('libraryGrid'); grid.replaceChildren();
    for (const project of projects) {
      const card = element('button', 'collection-card'); card.type = 'button';
      card.append(element('span', 'collection-emblem', project.released ? '❖' : symbols[project.phase] || '✧'), element('h3','',project.title), element('span','collection-state',(project.released && project.phase !== 'complete' ? 'Released · ' : '') + (states[project.phase] || 'Idea')), element('p','',project.pitch || 'A little project with a place in your collection.'), element('p','collection-next',project.nextMove || (project.phase === 'complete' ? 'Open the result and its story →' : 'Choose your next small step →')));
      card.addEventListener('click', () => { close(); openProject(project.id); }); grid.append(card);
    }
    if (!projects.length) grid.append(element('p','collection-empty','No projects match. Try another search, or add your first idea.'));
    $('discoverySummary').textContent = `Found in your vault · ${state.candidates.length} possible projects`;
    $('discoveryPanel').hidden = !state.candidates.length;
    const candidates = $('discoveryList'); candidates.replaceChildren();
    for (const candidate of state.candidates) {
      const row = element('div','discovery-row'), copy = element('div',''); copy.append(element('strong','',candidate.title),element('small','',candidate.folder));
      const button = element('button','quiet-button','Add project'); button.type='button'; button.addEventListener('click',()=>show(true,candidate)); row.append(copy,button); candidates.append(row);
    }
    $('syncNotes').textContent = HOSTED?'This shared edition shows a published snapshot. Add projects and save checkpoints in the local workshop; vault changes appear here after republishing.':state.sync.warnings.length ? state.sync.warnings.join(' · ') : 'Connected locally. Project notes are discovered automatically; saved checkpoints return to the vault.';
  }
  function rememberDraft() {
    if (!currentId) return;
    drafts.set(currentId, { checkpoint: Object.fromEntries(new FormData(checkpoint)), settings: Object.fromEntries(new FormData(settings)), checkpointRevision: checkpoint.dataset.revision, settingsRevision: settings.dataset.revision, checkpointDirty, settingsDirty });
  }
  function fill(form, values) { for (const [key,value] of Object.entries(values)) if (form.elements[key]) form.elements[key].value = value || ''; }
  function resetCheckpoint(project) {
    fill(checkpoint, { changed:'', next:project.nextMove }); checkpoint.dataset.revision=project.revision; checkpointDirty=false;
    $('checkpointMessage').textContent=''; $('reloadCheckpoint').hidden=true;
  }
  function resetSettings(project) {
    fill(settings, { title:project.title, pitch:project.pitch, phase:project.phase, repository:project.repository, live:project.live, folder:project.folder, next:project.nextMove, milestoneText:project.milestones.map(m=>m.title).join('\n') });
    settings.dataset.revision=project.revision; settingsDirty=false; $('settingsMessage').textContent=''; $('reloadSettings').hidden=true;
  }
  function renderProject(project) {
    const switched = currentId !== project.id;
    if (switched) { rememberDraft(); currentId=project.id; checkpointDirty=false; settingsDirty=false; resetCheckpoint(project); resetSettings(project);
      const draft=drafts.get(project.id); if (draft) { if (draft.checkpointDirty) { fill(checkpoint,draft.checkpoint); checkpoint.dataset.revision=draft.checkpointRevision; checkpointDirty=true; } if(draft.settingsDirty) {fill(settings,draft.settings);settings.dataset.revision=draft.settingsRevision;settingsDirty=true;} }
      checkpoint.closest('details').open=false; settings.closest('details').open=false;
    } else { if (!checkpointDirty && !checkpoint.dataset.saving) resetCheckpoint(project); if (!settingsDirty && !settings.dataset.saving) resetSettings(project); }
    $('lastChanged').textContent=project.changed || 'Your first checkpoint will appear here.';
    const links=$('projectLinks'); links.replaceChildren();
    if (project.live) links.append(externalLink('Open app ↗',project.live));
    if (project.repository) links.append(externalLink('View code ↗',project.repository));
    if(!HOSTED)links.append(externalLink('Open vault note ↗',noteLink(getState().sync.vaultName,project.vaultPath)),externalLink('Read note',`/api/notes/${encodeURIComponent(project.id)}`));
    if(HOSTED&&!links.childNodes.length)links.append(element('p','library-summary','This project’s working notes live in the local vault.'));
    $('milestoneEditor').hidden=project.legacyWorkflow;
    const actions=$('milestoneActions'); actions.replaceChildren();
    if (!project.legacyWorkflow) project.milestones.forEach((m,index)=>{
      const label=element('label','milestone-check'), input=document.createElement('input'); input.type='checkbox';input.checked=m.done===true;input.disabled=HOSTED;
      input.addEventListener('change',async()=>{ input.disabled=true; try {await save({action:'milestone',index,done:input.checked,revision:project.revision},project.id);}catch(error){input.checked=!input.checked;$('settingsMessage').textContent=error.message;settings.closest('details').open=true;}finally{input.disabled=false;} }); label.append(input,document.createTextNode(m.title));actions.append(label);
    });
    const activity=$('projectActivity');activity.replaceChildren();
    for(const session of project.sessions.slice(0,10)){const row=element('article','session-entry');row.append(element('small','',new Date(session.at).toLocaleString()),element('p','',session.changed),element('p','session-next','Next: '+session.next));activity.append(row);}
    for(const file of project.activity){const row=element('p','activity-entry');row.append(externalLink(file.title,noteLink(getState().sync.vaultName,file.path)),element('small','', ' · '+new Date(file.at).toLocaleDateString()));activity.append(row);}
    if(!activity.childNodes.length)activity.append(element('p','',HOSTED?'The full session history stays in the local vault.':'Save a checkpoint or link a project folder to see activity here.'));
  }
  async function submit(form, id, action, messageId, reloadId) {
    const button=form.querySelector('[type=submit]');button.disabled=true;form.dataset.saving='true';$(messageId).textContent='Saving to your vault…';
    try {
      await save({...Object.fromEntries(new FormData(form)),action,revision:form.dataset.revision},id);
      const project=getState().projects.find(p=>p.id===id);
      if(action==='checkpoint'){checkpointDirty=false;resetCheckpoint(project);onCheckpoint(project);}else{settingsDirty=false;resetSettings(project);if(project.phase==='complete')onCheckpoint(project,false,true);}
      $(messageId).textContent='Saved to vault ✓';drafts.delete(id);renderProject(project);$(messageId).textContent='Saved to vault ✓';
    } catch(error) {$(messageId).textContent=error.message;$(reloadId).hidden=error.status!==409;}
    finally {button.disabled=false;delete form.dataset.saving;}
  }
  checkpoint.addEventListener('input',()=>{checkpointDirty=true;}); settings.addEventListener('input',()=>{settingsDirty=true;});
  checkpoint.addEventListener('submit',event=>{event.preventDefault();submit(checkpoint,currentId,'checkpoint','checkpointMessage','reloadCheckpoint');});
  settings.addEventListener('submit',event=>{event.preventDefault();submit(settings,currentId,'settings','settingsMessage','reloadSettings');});
  async function keepDraft(form,messageId,buttonId) {
    try {await refresh();const project=getState().projects.find(p=>p.id===currentId);if(!project)throw new Error('This project note is no longer available.');form.dataset.revision=project.revision;$(buttonId).hidden=true;$(messageId).textContent='Latest note loaded. Your draft is kept. Save again when you’re ready.';}
    catch(error){$(messageId).textContent=error.message;}
  }
  $('reloadCheckpoint').addEventListener('click',()=>keepDraft(checkpoint,'checkpointMessage','reloadCheckpoint'));
  $('reloadSettings').addEventListener('click',()=>keepDraft(settings,'settingsMessage','reloadSettings'));
  create.addEventListener('submit',async event=>{
    event.preventDefault();const button=create.querySelector('[type=submit]');button.disabled=true;$('createMessage').textContent='Making a home in your vault…';
    try{const result=await save(Object.fromEntries(new FormData(create)));create.reset();$('createMessage').textContent='';close();openProject(result.id);onCheckpoint(getState().projects.find(p=>p.id===result.id),true);}
    catch(error){$('createMessage').textContent=error.message;}finally{button.disabled=false;}
  });
  $('libraryOpen').addEventListener('click',()=>show());$('newProject').addEventListener('click',()=>show(true));
  $('libraryAdd').addEventListener('click',()=>show(true));$('createCancel').addEventListener('click',()=>show());$('libraryClose').addEventListener('click',close);
  $('librarySearch').addEventListener('input',render);$('libraryFilter').addEventListener('change',render);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();}});
  if(HOSTED){$('newProject').hidden=true;$('libraryAdd').hidden=true;checkpoint.closest('details').hidden=true;settings.closest('details').hidden=true;$('discoveryPanel').hidden=true;document.querySelector('.footnote span:first-child').textContent='IDEA.QUEST · SHARED WORKSHOP';document.querySelector('.footnote span:last-child').textContent='Published snapshot. Vault saves are available in the local workshop.';}
  return { render, renderProject, show, rememberDraft };
}
