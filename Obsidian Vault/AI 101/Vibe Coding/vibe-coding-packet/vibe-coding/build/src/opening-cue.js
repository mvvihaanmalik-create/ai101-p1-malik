// Supplied recording, original 00:45–01:44. Times are relative to that edit.
export const OPENING_LENGTH=59, RECEPTION_AT=44.5;
export const openingLines=[
 [7.06,9.85,'On a dark desert highway'],[10.18,12.85,'Cool wind in my hair'],
 [13.58,16.90,'Warm smell of colitas'],[17.30,19.15,'Rising up through the air'],
 [20.24,22.50,'Up ahead in the distance'],[22.62,25.65,'I saw a shimmering light'],
 [26.00,29.45,'My head grew heavy and my sight grew dim'],[29.50,32.40,'I had to stop for the night'],
 [33.34,35.64,'There she stood in the doorway'],[36.40,38.50,'I heard the mission bell'],
 [40.22,42.18,'And I was thinking to myself'],[42.18,45.44,'This could be heaven or this could be hell'],
 [46.38,48.62,'Then she lit up a candle'],[49.56,51.82,'And she showed me the way'],
 [52.74,55.30,'There were voices down the corridor'],[55.82,58.40,'I thought I heard them say']
];
export const openingLyricAt=t=>openingLines.find(([a,b])=>t>=a&&t<b)?.[2]||'';
const smooth=(x,a,b)=>{const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u);};
export function openingMix(t){
 const outside=smooth(t,24,33),score=smooth(t,35,43);
 return {highpass:180-135*score,lowpass:3800-2100*outside+10500*score,
  gain:(.80-.28*outside+.20*score)*smooth(t,0,.5)*(1-smooth(t,57.8,59)),
  pan:-.23*(1-score),echo:.035+.055*outside-.045*score};
}

// Picture, subtitles, pause and the radio filter all follow this audio clock.
export function createOpeningCue(onError=()=>{}){
 let ctx,buffer,loading,source,gain,high,low,pan,echo,active=false,running=false,offset=0,anchor=0,level=.45,audioClock=false;
 const now=()=>audioClock?ctx.currentTime:performance.now()/1000;
 const time=()=>Math.min(OPENING_LENGTH,offset+(running?Math.max(0,now()-anchor):0));
 const anchorNow=()=>{audioClock=ctx?.state==='running';anchor=now();};
 function silence(){if(source){source.stop();source.disconnect();source=null;}}
 function sound(){silence();if(!buffer||!ctx||!running||time()>=OPENING_LENGTH)return;source=ctx.createBufferSource();source.buffer=buffer;source.connect(high);source.start(0,time());}
 async function preload(){
  if(loading)return loading;
  loading=(async()=>{
   const decoder=new OfflineAudioContext(2,1,48000);
   for(const file of ['assets/audio/hotel-california-opening.ogg','assets/audio/hotel-california-opening.mp3']){
    try{const r=await fetch(file);if(!r.ok)throw Error('Missing recording');buffer=await decoder.decodeAudioData(await r.arrayBuffer());return;}
    catch(error){if(file.endsWith('.mp3'))onError('Opening music unavailable. The film can still play.');}
   }
  })();return loading;
 }
 function mix(){if(!ctx)return;
  if(running&&!audioClock&&ctx.state==='running'){offset=time();anchorNow();sound();}
  const m=openingMix(time()),at=ctx.currentTime;
  high.frequency.setTargetAtTime(m.highpass,at,.08);low.frequency.setTargetAtTime(m.lowpass,at,.08);
  gain.gain.setTargetAtTime(running?level*m.gain:0,at,.04);pan.pan.setTargetAtTime(m.pan,at,.1);echo.gain.setTargetAtTime(m.echo,at,.1);
 }
 return {preload,time,mix,
  start(context){
   if(!ctx&&context){ctx=context;high=ctx.createBiquadFilter();high.type='highpass';low=ctx.createBiquadFilter();low.type='lowpass';low.Q.value=.55;
    gain=ctx.createGain();pan=ctx.createStereoPanner();echo=ctx.createGain();const delay=ctx.createDelay(1);delay.delayTime.value=.24;
    high.connect(low);low.connect(gain);gain.connect(pan);pan.connect(ctx.destination);pan.connect(delay);delay.connect(echo);echo.connect(ctx.destination);
   }
   active=running=true;offset=0;anchorNow();sound();mix();
  },
  pause(){if(running){offset=time();running=false;silence();mix();}},
  resume(){if(active&&!running){anchorNow();running=true;sound();mix();}},
  stop(){active=running=false;offset=0;silence();mix();},
  volume(value){level=value;mix();},
  snapshot(){return {time:+time().toFixed(3),ready:Boolean(buffer),paused:!running,audible:Boolean(source&&running&&level>0&&ctx?.state==='running'),...openingMix(time())};}
 };
}
