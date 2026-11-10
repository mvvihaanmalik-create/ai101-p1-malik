const query=new URLSearchParams(location.search),kind=query.get('demo'),root=document.querySelector('#demo');
function fail(){root.replaceChildren();const p=document.createElement('p');p.className='error';p.setAttribute('role','status');p.innerHTML='<strong>This preview couldn’t load.</strong>Try again, or view the source below.';root.append(p);parent.postMessage({type:'shelf:preview-error'},'*');}
window.addEventListener('error',fail,{once:true});window.addEventListener('unhandledrejection',fail,{once:true});
document.addEventListener('keydown',event=>{if(event.key==='Escape')parent.postMessage({type:'shelf:preview-close'},'*');});
// Only public demo identifiers enter this frame. Project context and bridge tokens never do.
try{
  if(['motion','anime','spring','gesture','auto'].includes(kind))await(await import('./motion.jsx')).mount(root,kind);
  else if(['three','fiber','drei','rapier','model'].includes(kind))await(await import('./scene.jsx')).mount(root,kind,query.get('model'));
  else fail();
}catch{fail();}
