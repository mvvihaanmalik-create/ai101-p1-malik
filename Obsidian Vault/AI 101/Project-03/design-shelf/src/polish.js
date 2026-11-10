  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  const springEase='cubic-bezier(.2,.82,.22,1)';
  const cardPool=new Map();let visibleReferences=[],collectionSignature='',workbenchSignature='';

  function boardSavedIds(projectId){return [...new Set(state.saved.filter(s=>!s.projectId||s.projectId===projectId).map(s=>s.referenceId))];}
  function animateElement(element,frames,options={}){if(!element||motionPreference.matches||!element.animate)return null;return element.animate(frames,{duration:360,easing:springEase,...options});}
  function pulseSave(id){const card=cardPool.get(id);animateElement(card?.querySelector('.card-save'),[{transform:'scale(.82)'},{transform:'scale(1.14)',offset:.6},{transform:'scale(1)'}],{duration:380});}
  function renderNavigation(){
    const nav=$('#navigation');
    if(!nav.children.length){const group=items=>'<div class="nav-group">'+items.map(([id,label])=>'<button type="button" class="nav-button" data-section="'+id+'">'+icon(sectionIcons[id])+'<span>'+label+'</span>'+(id==='saved'?'<span class="nav-count"></span>':'')+'</button>').join('')+'</div>';nav.innerHTML=group([['recommended','For you'],['all','Explore']])+group([['saved','Your board']]);}
    nav.querySelectorAll('[data-section]').forEach(b=>{if(b.dataset.section===state.section||(b.dataset.section==='all'&&isCategory(state.section)))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    nav.querySelector('.nav-count').textContent=savedIds().length;
    const categories=$('#mobile-categories');
    const categorySignature=JSON.stringify(categoryOptions());
    if(categories.dataset.signature!==categorySignature){categories.dataset.signature=categorySignature;categories.innerHTML='<div class="category-rail"><span class="category-thumb" aria-hidden="true" hidden></span>'+categoryOptions().map(([id,label])=>'<button type="button" data-category="'+esc(id)+'">'+esc(label)+'</button>').join('')+'<button type="button" class="category-add" aria-label="Add a category" title="Add a category">'+icon('plus')+'</button></div>';}
    categories.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===state.section)));
    requestAnimationFrame(()=>positionCategorySlider());
    $('#mobile-dock').querySelectorAll('[data-dock]').forEach(b=>{const selected=b.dataset.dock===state.section||(b.dataset.dock==='all'&&(state.section==='all'||isCategory(state.section)));if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  }
  function updateWorkbench(p,list,title){
    const isProject=state.section==='recommended'&&!state.agentResults;
    const intro=isProject?(typeof p?.focus==='string'&&p.focus?p.focus:p?.pitch||'A place for the references that move your project forward.'):state.section==='saved'?'The ideas you kept for '+(p?.title||'this project')+'.':state.section==='archive'?'Older work and undated finds worth keeping.':state.agentResults?'A focused selection from your conversation with Pip (Design Shelf).':state.collection==='assets'?'Reusable files and code from original makers. License checked at source.':'Explore real interfaces, interactions, and the people behind them.';
    $('#view-title').textContent=title;$('#view-description').textContent=intro.length>155?intro.slice(0,152).replace(/\s+\S*$/,'')+'…':intro;
    $('#workbench').classList.toggle('is-project',isProject);const review=$('#review-board'),isBoard=state.section==='saved';$('#workbench-actions').hidden=!isProject&&!(isBoard&&review);$('#workbench-ask').hidden=!isProject;if(review){review.hidden=!isBoard;review.disabled=!savedIds().length;}
    $('#workbench-ask').disabled=!p;$('#workbench-brief').disabled=!p;
    $('#board-action-label').textContent='Your board'+(savedIds().length?' · '+savedIds().length:'');
    $('#mobile-project-name').textContent=p?.title||'Choose project';$('#mobile-monogram').textContent=p?.title?.slice(0,1)||'+';
    if(p?.id==='design-shelf'){for(const el of [$('#mobile-monogram'),$('#project-monogram')])el.innerHTML='<img src="/shelf.png" alt="">';}
    $('#mobile-project').setAttribute('aria-label','Choose project, current: '+(p?.title||'none'));
    $('#collection-count').textContent=state.loading?'Opening your shelf…':list.length+' asset'+(list.length===1?'':'s')+(state.section==='saved'?' on this board':state.search||state.agentResults||state.fullCollection?'':' · Weekly picks');
    $('#clear-filters').hidden=!state.search&&!state.agentResults;
    const signature=state.projectId+'|'+state.section+'|'+!!state.agentResults;
    if(signature!==workbenchSignature&&!state.loading){workbenchSignature=signature;animateElement($('.workbench-copy'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:420});}
    const kept=state.library.references.filter(r=>savedIds().includes(r.id)&&r.preview?.url);
    const covers=(kept.length?kept:list.filter(r=>r.preview?.url)).filter(r=>r.preview.type!=='video'||r.preview.poster).slice(0,3);
    const preview=$('#board-preview'),coverSignature=covers.map(r=>r.id).join(',');preview.hidden=!isProject||covers.length===0||state.collection==='assets';
    if(preview.dataset.covers!==coverSignature){preview.dataset.covers=coverSignature;preview.innerHTML=covers.map(r=>'<span class="preview-print"><img src="'+esc(r.preview.type==='video'?r.preview.poster:r.preview.url)+'" alt="" referrerpolicy="no-referrer" loading="lazy"></span>').join('');preview.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>img.parentElement.classList.add('preview-unavailable'),{once:true}));}
  }
  function paintReferences(list){
    const grid=$('#reference-grid'),previous=new Map([...grid.children].map(card=>[card.dataset.reference,card.getBoundingClientRect()]));
    visibleReferences=list;
    const nodes=list.map(r=>{
      let card=cardPool.get(r.id),revision=JSON.stringify(r);
      if(!card||card._revision!==revision){card=document.createElement('article');card.className='reference-card';card.dataset.reference=r.id;card._revision=revision;
        card.innerHTML='<button type="button" class="card-open" data-open="'+esc(r.id)+'" aria-label="Open '+esc(r.title)+'"><span class="card-media">'+mediaMarkup(r)+(r.preview?.type==='video'?'<span class="media-mark" aria-hidden="true">'+icon('play')+'</span>':'')+'<span class="card-enter" aria-hidden="true">'+icon('arrow-up-right')+'</span></span><span class="card-caption"><span class="card-title">'+esc(r.title)+'</span><span class="card-publisher">'+esc(r.publisher)+'</span>'+(r.kind==='asset'?'<span class="asset-meta">'+esc(assetLabels[r.assetType]||r.assetType)+' · '+esc(r.license?.id||'License unknown')+'</span>':'')+'</span></button><button type="button" class="card-save icon-button" data-save="'+esc(r.id)+'">'+icon('bookmark')+'</button>';
        if(r.kind==='asset'&&!assetPreviews[r.id]&&!r.preview?.url)card.classList.add('asset-no-media');
        bindMedia(card);cardPool.set(r.id,card);
      }
      const saved=savedIds().includes(r.id),button=card.querySelector('.card-save');button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',(saved?'Remove from board: ':'Save to board: ')+r.title);button.title=saved?'Remove from this board':'Save to this board';
      return card;
    });
    const signature=list.map(r=>r.id).join('|');
    if(signature!==collectionSignature||nodes.some((node,i)=>grid.children[i]!==node)){
      grid.querySelectorAll('video').forEach(video=>video.pause());grid.replaceChildren(...nodes);bindAssetPreviews(grid);collectionSignature=signature;
      nodes.forEach((card,i)=>{const before=previous.get(card.dataset.reference),after=card.getBoundingClientRect();
        if(before?.width&&after.width){const dx=before.left-after.left,dy=before.top-after.top;if(Math.abs(dx)+Math.abs(dy)>2)animateElement(card,[{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate(0,0)'}],{duration:420});}
        else animateElement(card,[{opacity:0,transform:'translateY(14px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:430,delay:Math.min(i,5)*24});
      });
    }
    if(cardPool.size>160)for(const [id,card] of cardPool){if(!card.isConnected)cardPool.delete(id);if(cardPool.size<=100)break;}
  }
  function openDialog(dialog,from){
    toggleMenu(false);if(pip.open)togglePip(false);
    if(!dialog.open)dialog.showModal();
    let dx=0,dy=18;if(from?.isConnected){const a=from.getBoundingClientRect(),b=dialog.getBoundingClientRect();dx=Math.max(-70,Math.min(70,a.left+a.width/2-b.left-b.width/2));dy=Math.max(-45,Math.min(45,a.top+a.height/2-b.top-b.height/2));}
    animateElement(dialog,[{opacity:0,transform:'translate('+dx+'px,'+dy+'px) scale(.955)'},{opacity:1,transform:'translate(0,0) scale(1)'}],{duration:320});
  }
  async function closeDialog(dialog){if(!dialog.open||dialog.dataset.closing)return;dialog.dataset.closing='true';const motion=animateElement(dialog,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(7px) scale(.98)'}],{duration:150});if(motion)await motion.finished.catch(()=>{});dialog.close();delete dialog.dataset.closing;}
  function toggleMenu(open){if(open&&matchMedia('(min-width:761px)').matches)return;$('.sidebar').classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open);$('#sidebar-scrim').hidden=!open;$('#menu-button').setAttribute('aria-expanded',String(open));$('main').inert=open;$('#mobile-dock').inert=open;}
  function goToSection(section){state.agentResults=null;state.section=section;state.focus='All';state.search='';$('#search').value='';toggleMenu(false);render();window.scrollTo({top:0,behavior:motionPreference.matches?'instant':'smooth'});}
  function updateDetailPosition(){const index=visibleReferences.findIndex(r=>r.id===state.selected);$('#detail-position').textContent=index>=0?(index+1)+' / '+visibleReferences.length:'';$('#detail-prev').disabled=index<=0;$('#detail-next').disabled=index<0||index>=visibleReferences.length-1;}
  function stepDetail(direction){const index=visibleReferences.findIndex(r=>r.id===state.selected),next=visibleReferences[index+direction];if(!next)return;state.selected=next.id;renderDetail();updateDetailPosition();$('#detail-dialog').scrollTop=0;animateElement($('#detail-media'),[{opacity:.35,transform:'translateX('+(direction*10)+'px)'},{opacity:1,transform:'translateX(0)'}],{duration:270});}
  function initPolish(){
    $('.sidebar').id='library-sidebar';icons();initCategorySlider();
    $('.search-wrap kbd').textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘ K':'Ctrl K';
    $('#sidebar-scrim').addEventListener('click',()=>toggleMenu(false));
    $('#mobile-categories').addEventListener('click',event=>{const b=event.target.closest('[data-category]');if(b)goToSection(b.dataset.category);else if(event.target.closest('.category-add'))openCategoryForm();});
    $('#mobile-dock').addEventListener('click',event=>{const b=event.target.closest('[data-dock]');if(!b)return;b.dataset.dock==='pip'?togglePip(!pip.open):goToSection(b.dataset.dock);});
    $('#workbench-ask').addEventListener('click',()=>{togglePip(true);$('#pip-input').value='Find up to five free reusable assets with accurate previews that fit '+(project()?.title||'this project')+'.';});
    $('#workbench-board').addEventListener('click',()=>goToSection('saved'));$('#workbench-brief').addEventListener('click',openContext);
    $('#clear-filters').addEventListener('click',()=>{state.agentResults=null;state.focus='All';state.search='';state.assetType='all';state.license='all';state.period='all';$('#search').value='';render();});
    $('#detail-prev').addEventListener('click',()=>stepDetail(-1));$('#detail-next').addEventListener('click',()=>stepDetail(1));
    $('#detail-copy').addEventListener('click',async()=>{const r=state.library.references.find(r=>r.id===state.selected);if(!r)return;try{await navigator.clipboard.writeText(r.url);toast('Source link copied');}catch{toast('Open the source to copy its link.');}});
    document.addEventListener('keydown',event=>{if($('#detail-dialog').open&&!['INPUT','TEXTAREA','VIDEO'].includes(document.activeElement.tagName)){if(event.key==='ArrowLeft'){event.preventDefault();stepDetail(-1);}if(event.key==='ArrowRight'){event.preventDefault();stepDetail(1);}}});
    matchMedia('(min-width:761px)').addEventListener('change',()=>toggleMenu(false));
  }
