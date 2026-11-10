// Explicit review-only measurement: separates GPU completion from rAF scheduling.
export function installBenchmark({renderer,scene,camera,pause,setRoom,reviewEncounter}){
 const button=document.createElement('button');button.textContent='Measure rendering';button.id='benchmark';button.style.cssText='position:fixed;right:10px;top:10px;z-index:30';
 const output=document.createElement('output');output.id='benchmark-result';output.style.cssText='position:fixed;right:10px;top:60px;z-index:30;max-width:440px;font:12px monospace;background:#000;color:#eee;padding:8px';
 document.body.append(button,output);
 const hide=document.createElement('button');hide.textContent='Hide review tools';hide.style.cssText='position:fixed;left:10px;top:10px;z-index:30';document.body.append(hide);hide.addEventListener('click',()=>{for(const e of [button,output,hide,document.getElementById('review-room'),document.getElementById('review-encounter'),document.getElementById('diagnostics')])if(e)e.style.display='none';});
 if(setRoom){const select=document.createElement('select');select.id='review-room';select.setAttribute('aria-label','Review location');select.style.cssText='position:fixed;right:180px;top:10px;z-index:30;padding:12px;background:#161512;color:#e5d3b5';for(const name of ['reception','landing','corridor','stairs','suite','lounge']){const option=document.createElement('option');option.value=name;option.textContent=name;select.append(option);}select.addEventListener('change',()=>{pause();setRoom(select.value);});document.body.append(select);}
 if(reviewEncounter){const select=document.createElement('select');select.id='review-encounter';select.setAttribute('aria-label','Review encounter');select.style.cssText='position:fixed;right:180px;top:58px;z-index:30;padding:10px;background:#161512;color:#e5d3b5';for(const [value,label] of [['','Review encounter'],['orientation','Restart orientation'],['normal','Normal passage'],['C1','C1 · Floating bell'],['E2','E2 · Upward rain'],['E6','E6 · Breathing runner']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}select.addEventListener('change',()=>{if(select.value)reviewEncounter(select.value);select.value='';});document.body.append(select);}
 button.addEventListener('click',()=>{
  pause();button.disabled=true;output.textContent='Measuring 60 completed frames';
  setTimeout(()=>{
   const gl=renderer.getContext(),times=[];for(let i=0;i<65;i++){const t=performance.now();renderer.render(scene,camera);gl.finish();if(i>=5)times.push(performance.now()-t);}
   times.sort((a,b)=>a-b);const rect=renderer.domElement.getBoundingClientRect();
   output.textContent=JSON.stringify({version:document.body.dataset.build||'v2',samples:times.length,medianMs:+times[30].toFixed(2),p95Ms:+times[57].toFixed(2),triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,viewport:[rect.width,rect.height],buffer:[renderer.domElement.width,renderer.domElement.height],visibility:document.visibilityState});button.disabled=false;
  },30);
 });
}
