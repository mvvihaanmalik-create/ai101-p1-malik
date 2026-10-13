// Optional, visible diagnostics for measuring the real rendering path.
export function createRenderMonitor(){
  const enabled=new URLSearchParams(location.search).get('diagnostics')==='1';
  let panel=null,projects=0,room=0,start=performance.now(),frames=0,total=0,worst=0,lastReport=start;
  if(enabled){panel=document.createElement('output');panel.id='renderDiagnostics';panel.className='render-diagnostics';panel.setAttribute('aria-label','Rendering diagnostics');document.body.append(panel);}
  return {enabled,markProjects(){projects ||= performance.now();},begin(renderer){if(enabled){renderer.info.autoReset=false;renderer.info.reset();}return performance.now();},end(renderer,began,quality='Original'){
    if(!enabled)return;
    const now=performance.now(),duration=now-began;room ||= now;
    frames++;total+=duration;worst=Math.max(worst,duration);
    if(now-lastReport<1000)return;
    panel.textContent=`${quality} · ${Math.round(frames*1000/(now-lastReport))} fps · submit ${(total/frames).toFixed(1)} ms · peak ${worst.toFixed(1)} ms · DPR ${renderer.getPixelRatio().toFixed(2)} · ${renderer.info.render.calls} draws · ${Math.round(renderer.info.render.triangles/1000)}k triangles · projects ${(projects/1000).toFixed(2)}s · room ${(room/1000).toFixed(2)}s`;
    lastReport=now;frames=0;total=0;worst=0;
  },resumed(){lastReport=performance.now();frames=0;total=0;worst=0;},paused(reason){if(panel)panel.textContent=`Paused · ${reason} · projects ${(projects/1000).toFixed(2)}s · room ${(room/1000).toFixed(2)}s`;}};
}
