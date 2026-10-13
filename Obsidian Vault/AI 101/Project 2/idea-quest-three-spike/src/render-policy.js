export function renderDensity(width,height,deviceRatio=1,light=false){
  const cap=light?1:width<700?1.25:1.5;
  const budget=light?850000:1800000;
  return Math.max(.1,Math.min(deviceRatio,cap,Math.sqrt(budget/Math.max(1,width*height))));
}
export function shouldRunRoom({visible,inView,collectionOpen,still}){
  return visible&&inView&&!collectionOpen&&!still;
}
export function frameDue(now,lastDraw,scheduled,dragging,force=false){
  return force||now-lastDraw>=(scheduled&&!dragging?1000/30:1000/60)-1;
}
export function createFrameBudget(){
  let elapsed=0,frames=0,slowWindows=0;
  return {sample(dt){if(dt<=0||dt>250)return false;elapsed+=dt;frames++;if(elapsed<2000)return false;
    slowWindows=elapsed/frames>42?slowWindows+1:0;elapsed=0;frames=0;return slowWindows>=2;},reset(){elapsed=0;frames=0;slowWindows=0;}};
}
