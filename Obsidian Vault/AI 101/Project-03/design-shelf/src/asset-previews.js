  const assetPreviews=/*__PREVIEW_DATA__*/ {};
  const previewMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const interactiveSamples={'asset-gh-motiondivision-motion':'motion','asset-gh-juliangarnier-anime':'anime','asset-gh-pmndrs-react-spring':'spring','asset-gh-formkit-auto-animate':'auto','asset-gh-pmndrs-use-gesture':'gesture','asset-gh-mrdoob-three.js':'three','asset-gh-pmndrs-react-three-fiber':'fiber','asset-gh-pmndrs-drei':'drei','asset-gh-pmndrs-react-three-rapier':'rapier'};
  function interactiveSample(r){return interactiveSamples[r.id]||(r.assetType==='models'&&r.publisher==='Poly Haven'&&/^asset-poly-[a-z0-9_]+$/i.test(r.id)?'model':null);}
  let previewCleanup=()=>{};
  function assetThumbnailReady(r){const p=assetPreviews[r.id];return !!p?.thumbnailVerifiedAt&&!!(p.kind==='font'?p.file:p.thumbnailFile||p.thumbnailUrl);}
  function mountDetailPreview(r,container){
    previewCleanup();container.classList.toggle('has-live-preview',!!interactiveSample(r));
    if(!interactiveSample(r)){container.innerHTML=mediaMarkup(r,true);bindMedia(container);return;}
    let timer,frame;const controller=new AbortController(),signal=controller.signal;
    const release=()=>stage.querySelectorAll('video').forEach(video=>{sourceDemoObserver.unobserve(video);video.pause();});
    previewCleanup=()=>{clearTimeout(timer);controller.abort();release();frame?.remove();previewCleanup=()=>{};};
    container.innerHTML='<div class="try-toolbar"><div role="group" aria-label="Preview type"><button type="button" data-try="live" aria-pressed="true">Try it</button><button type="button" data-try="source" aria-pressed="false">Source preview</button></div><button type="button" data-try="reset" aria-label="Restart preview">↻</button></div><div class="try-stage"></div>';
    const stage=container.querySelector('.try-stage');
    const show=mode=>{
      clearTimeout(timer);release();frame?.remove();frame=null;stage.replaceChildren();container.querySelectorAll('[data-try=live],[data-try=source]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.try===mode)));
      container.querySelector('[data-try=reset]').hidden=mode!=='live';
      if(mode==='source'){stage.innerHTML=mediaMarkup(r,true);bindMedia(stage);return;}
      const loading=document.createElement('span');loading.className='try-loading';loading.setAttribute('role','status');loading.textContent='Loading '+(interactiveSample(r)==='model'?'3D model':'live sample')+'…';stage.append(loading);
      timer=setTimeout(()=>{loading.textContent='Still loading. Retry ↻ or use Source preview.';loading.classList.add('slow');},30000);
      const sample=interactiveSample(r),group=['motion','anime','spring','gesture','auto'].includes(sample)?'motion':'scene',params=new URLSearchParams({demo:sample});if(sample==='model')params.set('model',r.id.slice('asset-poly-'.length));frame=document.createElement('iframe');frame.title='Try '+r.title;frame.setAttribute('sandbox','allow-scripts');frame.referrerPolicy='no-referrer';frame.src='/try/frame-'+group+'.html?'+params;stage.append(frame);
    };
    container.addEventListener('click',event=>{const button=event.target.closest('[data-try]');if(button)show(button.dataset.try==='source'?'source':'live');},{signal});
    window.addEventListener('message',event=>{if(event.source!==frame?.contentWindow)return;if(['shelf:preview-ready','shelf:preview-error'].includes(event.data?.type)){clearTimeout(timer);stage.querySelector('.try-loading')?.remove();}if(event.data?.type==='shelf:preview-close')closeDialog($('#detail-dialog'));},{signal});
    show('live');
  }
  function assetPreviewMarkup(r,original=false){
    const p=assetPreviews[r.id];if(!p)return '';
    const description='<span class="source-preview-fallback" aria-hidden="true"><strong>'+esc(r.title)+'</strong><span>'+esc(r.summary)+'</span></span>';
    const badge=interactiveSample(r)?'<span class="try-badge">'+(r.assetType==='motion'?'Try motion':'Explore 3D')+' ↗</span>':'';
    if((p.thumbnailFile||p.thumbnailUrl)&&(!original||p.kind!=='video'))return '<span class="source-asset-preview source-example"><img src="'+esc(p.thumbnailUrl||'/previews/'+p.thumbnailFile)+'" loading="eager" decoding="async" alt="'+esc(p.tryPoster?r.title+' interactive sample':p.label||r.title)+'">'+badge+'</span>';
    if(original&&!p.kind&&p.thumbnailFile)return '<span class="source-asset-preview source-example"><img src="/previews/'+esc(p.thumbnailFile)+'" alt="'+esc(p.label||r.title)+'"></span>';
    if(p.tryPoster&&!original)return '<span class="source-asset-preview source-example">'+description+'<img src="/previews/'+esc(p.tryPoster)+'" loading="eager" decoding="async" alt="'+esc(r.title)+' interactive sample">'+badge+'</span>';
    if(p.kind==='font')return '<span class="source-asset-preview font-specimen" data-font="'+esc(r.id)+'" role="img" aria-label="'+esc(p.label)+'"><strong>'+esc(p.family)+'</strong><span>Aa Bb Cc</span><small>0123456789 &amp;?!</small></span>';
    if(p.kind==='icons')return '<span class="source-asset-preview icon-specimen">'+description+'<img src="/previews/'+esc(p.file)+'" loading="eager" decoding="async" alt="'+esc(p.label)+'"></span>';
    if(p.kind==='video'){
      const poster=p.thumbnailUrl||(p.thumbnailFile?'/previews/'+p.thumbnailFile:p.poster);
      return '<span class="source-asset-preview source-example">'+(poster?'<img class="source-video-poster" src="'+esc(poster)+'" alt="'+esc(p.label)+'">':'')+'<video controls playsinline preload="none" poster="'+esc(poster||'')+'" src="'+esc(p.url)+'" aria-label="'+esc(p.label)+'"></video></span>';
    }
    const reduced=previewMotion.matches&&/\.gif(?:\?|$)/i.test(p.url),url=p.file?'/previews/'+p.file:reduced?p.poster:p.url;
    return '<span class="source-asset-preview source-example">'+description+(url?'<img src="'+esc(url)+'" alt="'+esc(p.label)+'" loading="eager" decoding="async" referrerpolicy="no-referrer">':'')+badge+'</span>';
  }
  const sourceDemoObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
    if(isIntersecting&&!previewMotion.matches&&!document.hidden){if(!target.src)target.src=target.dataset.source;target.play().catch(()=>{});}else target.pause();
  }),{threshold:.25});
  function bindAssetPreviews(container){container.querySelectorAll('.source-demo').forEach(video=>{sourceDemoObserver.unobserve(video);sourceDemoObserver.observe(video);});}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('.source-demo').forEach(video=>video.pause());else document.querySelectorAll('.source-demo').forEach(video=>{sourceDemoObserver.unobserve(video);sourceDemoObserver.observe(video);});});
  previewMotion.addEventListener('change',()=>document.querySelectorAll('.source-demo').forEach(video=>{sourceDemoObserver.unobserve(video);sourceDemoObserver.observe(video);}));
