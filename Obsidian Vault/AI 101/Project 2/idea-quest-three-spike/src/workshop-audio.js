// Small, local sound palette: no downloads, microphone, or audio dependency.
export const CUE_LENGTHS={potion:.48,scroll:.36,keepsake:.62,place:.22,retire:.42,undo:.4,purr:.85,fire:.65,lantern:.14,complete:1.1,navigate:.09,hearth:3};
export function cueSamples(kind,sampleRate=22050){
  const seconds=CUE_LENGTHS[kind]||CUE_LENGTHS.navigate;
  const samples=new Float32Array(Math.ceil(seconds*sampleRate));let seed=173,previous=0,low=0;
  for(let i=0;i<samples.length;i++){
    const t=i/sampleRate,u=t/seconds;
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;
    low+=.08*(noise-low);let v=0;
    if(kind==='hearth')v=low*.22+noise*.035*Math.pow(Math.max(0,Math.sin(t*37)*Math.sin(t*13)),12);
    else if(kind==='scroll'||kind==='retire')v=(noise-previous)*.08*(.55+.45*Math.sin(t*46))*(kind==='retire'?1-u:1);
    else if(kind==='purr')v=(Math.sin(t*2*Math.PI*82)*.1+Math.sin(t*2*Math.PI*164)*.025+low*.025)*(.5+.5*Math.sin(t*2*Math.PI*23));
    else if(kind==='fire')v=low*.3+noise*.06*Math.pow(Math.max(0,Math.sin(t*73)),9);
    else if(kind==='place'||kind==='lantern'||kind==='navigate')v=Math.sin(2*Math.PI*(kind==='place'?160:kind==='lantern'?920:430)*t)*.18*Math.exp(-t*35)+low*.06*Math.exp(-t*60);
    else if(kind==='potion')v=(Math.sin(2*Math.PI*(260*t+330*t*t))*.1+Math.sin(t*2*Math.PI*620)*.04)*(.65+.35*Math.sin(t*53));
    else {
      const notes=kind==='complete'?[523.25,659.25,783.99]:kind==='undo'?[659.25,523.25]:[392,587.33];
      for(let j=0;j<notes.length;j++){const age=t-j*.12;if(age>=0)v+=(Math.sin(age*2*Math.PI*notes[j])+.18*Math.sin(age*2*Math.PI*notes[j]*2))*.085*Math.min(1,age/.008)*Math.exp(-age*7);}
    }
    previous=noise;
    const envelope=kind==='hearth'?1:Math.min(1,t/.012,(seconds-t)/.035)*Math.sin(Math.PI*u)**.45;
    samples[i]=Math.max(-.32,Math.min(.32,v*envelope));
  }
  // The hearth loops without a discontinuity; all one-shot cues end at silence.
  if(kind==='hearth'){const fade=Math.floor(sampleRate*.025);for(let i=0;i<fade;i++){samples[i]*=i/fade;samples[samples.length-1-i]*=i/fade;}}
  samples[0]=0;samples[samples.length-1]=0;return samples;
}

export function createWorkshopAudio({storage,Context=globalThis.AudioContext||globalThis.webkitAudioContext,onChange=()=>{},now=()=>Date.now()}={}){
  let enabled=false,volume=.35,ambience=true,visible=true,context,master,hearth,unavailable=false,lastCue=-Infinity;
  const cache=new Map(),sources=new Set();
  try{const saved=JSON.parse(storage?.getItem('ideaQuest.audio')||'null');if(saved){enabled=saved.enabled===true;volume=Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):.35;ambience=saved.ambience!==false;}}catch{}
  const state=()=>({enabled,volume,ambience,unavailable,ready:context?.state==='running'});
  function persist(){try{storage?.setItem('ideaQuest.audio',JSON.stringify({enabled,volume,ambience}));}catch{}onChange(state());}
  function stop(){for(const source of sources){try{source.stop();}catch{}}sources.clear();hearth=null;}
  function buffer(kind){if(!cache.has(kind)){const data=cueSamples(kind),b=context.createBuffer(1,data.length,22050);b.getChannelData(0).set(data);cache.set(kind,b);}return cache.get(kind);}
  function source(kind,loop=false){const s=context.createBufferSource();s.buffer=buffer(kind);s.loop=loop;s.connect(master);sources.add(s);s.onended=()=>{s.disconnect();sources.delete(s);};s.start();return s;}
  function sync(){if(master)master.gain.setTargetAtTime(enabled&&visible?volume:0,context.currentTime,.035);if(!enabled||!visible||!ambience){if(hearth){try{hearth.stop();}catch{}hearth=null;}}else if(context?.state==='running'&&!hearth)hearth=source('hearth',true);}
  async function unlock(){
    if(!enabled||!visible||unavailable)return false;
    try{
      if(!context){if(!Context)throw new Error('No Web Audio');context=new Context();master=context.createGain();master.gain.value=0;master.connect(context.destination);}
      if(context.state!=='running')await context.resume();
      if(!enabled||!visible)return false;
      sync();onChange(state());return context.state==='running';
    }catch{unavailable=true;enabled=false;stop();persist();return false;}
  }
  async function play(kind='navigate'){
    if(!enabled||!visible||now()-lastCue<65)return false;lastCue=now();
    if(!await unlock()||!enabled||!visible)return false;
    source(kind);return true;
  }
  return {state,unlock,play,
    async setEnabled(value){enabled=!!value;unavailable=false;if(!enabled){stop();sync();if(context?.state==='running')context.suspend().catch(()=>{});}persist();if(enabled)return unlock();return false;},
    setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));sync();persist();},
    setAmbience(value){ambience=!!value;sync();persist();},
    setVisible(value){visible=!!value;if(!visible){stop();sync();if(context?.state==='running')context.suspend().catch(()=>{});}},
  };
}
