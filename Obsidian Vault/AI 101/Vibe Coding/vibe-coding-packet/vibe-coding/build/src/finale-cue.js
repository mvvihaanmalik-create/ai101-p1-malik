// The edit starts at 3:54.55. Its last ten seconds fade in the audio master.
export const DOOR_AT=4.80, CUE_LENGTH=111;
const cuts=[[DOOR_AT,0],[6.72,2.35],[8.95,5.8],[13.0,13.0],[13.45,13.6],[19.53,18.4],[22.84,21.7],[24.02,23.4],[25.58,24.65],[27,26]];
const lines=[
 [.35,2.95,'Last thing I remember'],
 [3.00,5.78,'I was running for the door'],
 [6.89,9.61,'I had to find the passage back'],
 [9.62,12.29,'To the place I was before'],
 [13.21,16.03,'“Relax,” said the night man'],
 [16.05,19.04,'“We are programmed to receive”'],
 [19.84,22.94,'You can check out any time you like'],
 [23.12,25.78,'But you can never leave']
];
function interpolate(t,x,y){
 if(t<=cuts[0][x])return cuts[0][y];
 for(let i=1;i<cuts.length;i++){
  const a=cuts[i-1],b=cuts[i];
  if(t<=b[x])return a[y]+(b[y]-a[y])*(t-a[x])/(b[x]-a[x]);
 }
 return cuts.at(-1)[y];
}
export const filmAt=t=>interpolate(t,0,1);
export const cueAt=t=>interpolate(t,1,0);
export const lyricAt=t=>lines.find(([start,end])=>t>=start&&t<end)?.[2]||'';

// The decoded excerpt, the subtitles and the film use one transport. Late
// decoding joins at the current offset. A missing device still permits a silent ending.
export function createFinalCue(onError){
 let ctx,gain,buffer,loading,source,active=false,running=false,offset=0,anchor=0,level=0;
 let useAudioClock=false;
 const now=()=>useAudioClock?ctx.currentTime:performance.now()/1000;
 const anchorNow=()=>{useAudioClock=ctx?.state==='running';anchor=now();};
 const time=()=>Math.min(CUE_LENGTH,offset+(running?Math.max(0,now()-anchor):0));
 function silence(){if(source){source.stop();source.disconnect();source=null;}}
 function sound(){
  silence();const at=time();
  if(!running||!buffer||!ctx||at>=CUE_LENGTH)return;
  source=ctx.createBufferSource();source.buffer=buffer;source.connect(gain);source.start(0,at);
 }
 function prepare(context){
  if(!context)return;ctx=context;
  if(!gain){gain=ctx.createGain();gain.gain.value=level;gain.connect(ctx.destination);}
  if(!loading)loading=fetch('assets/audio/hotel-california-credits.mp3').then(r=>{
   if(!r.ok)throw Error('Finale recording unavailable');return r.arrayBuffer();
  }).then(bytes=>ctx.decodeAudioData(bytes)).then(decoded=>{buffer=decoded;sound();})
    .catch(()=>{loading=null;onError('Ending music unavailable. Captions and animation continue.');});
 }
 return {
  prepare,time,
  start(at=0){active=running=true;offset=at;anchorNow();sound();},
  pause(){if(running){offset=time();running=false;silence();}},
  resume(){if(active&&!running){anchorNow();running=true;sound();}},
  stop(){active=running=false;offset=0;silence();},
  volume(value){level=value;if(gain)gain.gain.setTargetAtTime(value,ctx.currentTime,.04);},
  snapshot(){return {time:+time().toFixed(2),paused:!running,ready:Boolean(buffer),audible:Boolean(source&&running&&level>0),gain:level};}
 };
}
