  const suiteRequests=new Map();
  function workshopRequest(action,extra={}){
    const requestId=crypto.randomUUID(),projectId=state.projectId;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{suiteRequests.delete(requestId);reject(Error('Workshop did not respond. Reopen it and try again.'));},20000);
      suiteRequests.set(requestId,{resolve,reject,timer,projectId});
      parent.postMessage({type:'workshop:request',requestId,projectId,action,...extra},'http://127.0.0.1:4190');
    });
  }
  window.addEventListener('message',e=>{
    if(!inSuite||e.origin!=='http://127.0.0.1:4190'||e.source!==parent||e.data?.type!=='workshop:response')return;
    const item=suiteRequests.get(e.data.requestId);if(!item)return;clearTimeout(item.timer);suiteRequests.delete(e.data.requestId);
    if(item.projectId!==state.projectId)return item.reject(Error('Project changed. Try again.'));
    e.data.error?item.reject(Error(e.data.error)):item.resolve(e.data.result);
  });
  const pip={open:false,data:{online:false,jobs:[]},seen:new Set(),busy:false};
  function renderPip(){
    const signature=JSON.stringify({online:pip.data.online,goal:pip.data.goal,blocked:pip.data.blocked,jobs:pip.data.jobs,project:state.projectId,title:project()?.title,busy:pip.busy,total:state.library.references.length});
    if(signature===pip.signature)return;pip.signature=signature;
    const jobs=(pip.data.jobs||[]).filter(j=>j.projectId===state.projectId).slice(0,6).reverse();
    $('#pip-project').textContent=pip.data.blocked||pip.data.goal||'Ideas for '+(project()?.title||'your project')+'.';
    $('#pip-empty').hidden=jobs.length>0;
    $('#pip-offline').hidden=inSuite?!pip.data.blocked:pip.data.online;if(inSuite)$('#pip-offline').textContent=pip.data.blocked||'';
    $('#pip-connection').textContent=inSuite?'Workshop · current project':pip.data.online?'Codex · PC online':'PC offline';
    $('#pip-connection').classList.toggle('is-online',pip.data.online);
    const thread=pip.data.threadId;$('#pip-codex').hidden=!thread;if(thread)$('#pip-codex').href='codex://threads/'+encodeURIComponent(thread);
    const active=jobs.some(j=>['queued','running'].includes(j.status));
    $('#pip-launcher').classList.toggle('is-working',active);
    $('#pip-refresh').disabled=active||pip.busy||!!pip.data.blocked;$('#pip-send').disabled=active||pip.busy||!project()||!!pip.data.blocked;
    const messages=$('#pip-messages'),nearBottom=messages.scrollHeight-messages.scrollTop-messages.clientHeight<70;
    messages.innerHTML=jobs.map(j=>{
      const waiting=['queued','running'].includes(j.status),status=j.status==='queued'?(pip.data.online?'Queued…':'Waiting for your PC…'):'Looking through sources…';
      const refs=(j.referenceIds||[]).map(id=>state.library.references.find(r=>r.id===id)).filter(r=>r&&reusableAsset(r)&&assetThumbnailReady(r)).slice(0,5);
      return '<article class="pip-exchange"><p class="pip-question">'+esc(j.prompt)+'</p><div class="pip-answer">'+(waiting?'<span class="pip-thinking"><i></i><i></i><i></i></span><span>'+status+'</span><button type="button" class="pip-stop" data-pip-stop="'+j.id+'">Stop</button>':'<p>'+esc(j.reply||'Finished.')+'</p>')+'</div>'+(refs.length?'<div class="pip-results">'+refs.map(r=>'<button type="button" data-pip-ref="'+esc(r.id)+'"><span>'+esc(r.title)+'</span>'+icon('arrow-up-right')+'</button>').join('')+'</div><button type="button" class="pip-view" data-pip-view="'+j.id+'">View in shelf '+icon('arrow-up-right')+'</button>':'')+(inSuite&&(j.sources||[]).length?'<div class="pip-results">'+j.sources.map(r=>'<div><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.title)+'</a><p>'+esc(r.reason)+'</p></div>').join('')+'</div>':'')+'</article>';
    }).join('');
    if(nearBottom)messages.scrollTop=messages.scrollHeight;
  }
  async function refreshPip(){try{
    const projectId=state.projectId;const next=inSuite?await workshopRequest('pip-status'):await api('/api/agent');if(projectId!==state.projectId)return;
    const changed=next.jobs.some(j=>j.status==='completed'&&!pip.seen.has(j.id));
    if(changed){await load(true);for(const j of next.jobs.filter(j=>j.status==='completed'))pip.seen.add(j.id);if(!pip.open)$('#pip-launcher .pip-unread').hidden=false;}
    pip.data=next;renderPip();
  }catch{$('#pip-connection').textContent='Connection unavailable';}}
  async function sendPip(action,prompt){
    if(pip.busy||!project())return;pip.busy=true;$('#pip-error').hidden=true;renderPip();
    const assetPrompt=prompt+' Assets only: return up to five relevant reusable assets, with verified free licenses and accurate previews. Prefer the existing asset library; use source links for new candidates pending collection checks. No inspiration posts. Never treat check dates as publication dates.';
    try{if(inSuite)await workshopRequest('pip-run',{prompt:assetPrompt});else await api('/api/agent/request',{method:'POST',body:JSON.stringify({id:crypto.randomUUID(),action,prompt:assetPrompt,projectId:state.projectId})});$('#pip-input').value='';await refreshPip();}
    catch(error){$('#pip-error').textContent=error.message;$('#pip-error').hidden=false;}
    finally{pip.busy=false;renderPip();}
  }
  async function togglePip(open){
    const panel=$('#pip-panel');pip.open=open;$('#pip-launcher').setAttribute('aria-expanded',String(open));
    panel.getAnimations().forEach(animation=>animation.cancel());
    if(open){toggleMenu(false);panel.hidden=false;$('#pip-launcher .pip-unread').hidden=true;renderPip();refreshPip();animateElement(panel,[{opacity:0,transform:'translateY(14px) scale(.95)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:370});$('#pip-input').focus();}
    else {const animation=animateElement(panel,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(8px) scale(.97)'}],{duration:160});if(animation)await animation.finished.catch(()=>{});if(!pip.open){panel.hidden=true;if(!document.querySelector('dialog[open]'))$('#pip-launcher').focus();}}
  }
  $('#pip-launcher').addEventListener('click',()=>togglePip(!pip.open));$('#pip-close').addEventListener('click',()=>togglePip(false));
  $('#pip-form').addEventListener('submit',event=>{event.preventDefault();const prompt=$('#pip-input').value.trim();if(prompt)sendPip('search',prompt);});
  $('#pip-input').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();$('#pip-form').requestSubmit();}});
  $('#pip-refresh').addEventListener('click',()=>sendPip('refresh','Find fresh assets for '+(project()?.title||'this project')+'.'));
  $('#pip-panel').addEventListener('click',async event=>{
    const source=event.target.closest('[data-pip-import]');if(source){source.disabled=true;try{await workshopRequest('import-source',{url:source.dataset.pipImport});await load(true);toast('Added to Shelf. Save it to your board to include it in the handoff.');}catch(error){toast(error.message);}finally{source.disabled=false;}return;}
    const suggestion=event.target.closest('[data-pip-prompt]'),ref=event.target.closest('[data-pip-ref]'),view=event.target.closest('[data-pip-view]'),stop=event.target.closest('[data-pip-stop]');
    if(suggestion){$('#pip-input').value=suggestion.dataset.pipPrompt;$('#pip-input').focus();}
    if(ref){togglePip(false);openDetail(ref.dataset.pipRef);}
    if(view){const job=pip.data.jobs.find(j=>j.id===view.dataset.pipView);state.agentResults=job.referenceIds;state.section='all';state.focus='All';state.search='';$('#search').value='';togglePip(false);render();window.scrollTo({top:0,behavior:'smooth'});}
    if(stop){try{if(inSuite)await workshopRequest('pip-cancel',{jobId:stop.dataset.pipStop});else await api('/api/agent/request/'+stop.dataset.pipStop+'/cancel',{method:'POST',body:'{}'});await refreshPip();}catch(error){toast(error.message);}}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&pip.open)togglePip(false);});
  setInterval(()=>{if(!document.hidden&&(pip.open||pip.data.jobs.some(j=>['queued','running'].includes(j.status))))refreshPip();},5000);
  $('#project-list').addEventListener('click',()=>{if(pip.open)renderPip();});

  if(inSuite){
    const handoff=document.createElement('button');handoff.type='button';handoff.className='secondary-button';handoff.textContent='Review with Creative Partner';handoff.id='review-board';handoff.hidden=true;
    $('#workbench-actions').append(handoff);
    handoff.addEventListener('click',async()=>{handoff.disabled=true;try{await workshopRequest('review-board');}catch(error){toast(error.message);}finally{handoff.disabled=false;}});
  }
