import {createFinalCue} from './finale-cue.js';
// Track-specific sources and permissions are recorded in ../music-credits.html.
const clamp=x=>Math.max(0,Math.min(1,x));
export function createMusicScore({onError=()=>{}}={}){
 const tracks={hotel:new Audio('assets/audio/dance-of-the-dream-man.mp3')};
 let hotelFilter,context,channels,mode='idle',paused=true,enabled=true,volume=.55,hotelLevel=.65;
 const failures=new Set(),finale=createFinalCue(onError);
 for(const [name,audio] of Object.entries(tracks)){
  audio.preload='auto';audio.loop=name==='hotel';
  audio.addEventListener('error',()=>{failures.add(name);onError('Music could not load. Hotel effects remain available.');});
 }
 function attach(ctx){
  if(context||!ctx)return;context=ctx;channels={};
  for(const [name,audio] of Object.entries(tracks)){
   const source=context.createMediaElementSource(audio),filter=context.createBiquadFilter(),gain=context.createGain();
   filter.type='lowpass';filter.frequency.value=name==='hotel'?3200:12000;gain.gain.value=0;
   if(name==='hotel')hotelFilter=filter;source.connect(filter);filter.connect(gain);gain.connect(context.destination);channels[name]=gain;
  }
 }
 function play(name){if(!failures.has(name))tracks[name].play().catch(error=>{if(error.name!=='AbortError')onError('Music playback paused by the browser. Resume the game to retry.');});}
 function mix(){
  if(!context)return;
  const levels={hotel:mode==='hotel'?hotelLevel:0};
  finale.volume(enabled?volume*.82:0);
  for(const name of Object.keys(tracks))channels[name].gain.setTargetAtTime(!paused&&enabled?levels[name]*volume:0,context.currentTime,.12);
 }
 function startHotel(ctx){
  attach(ctx);mode='hotel';paused=false;finale.stop();tracks.hotel.currentTime=0;
  if(context){play('hotel');mix();}
 }
 function startEnding(at=0){
  mode='ending';paused=false;tracks.hotel.pause();finale.prepare(context);finale.start(at);mix();
 }
 function finishEnding(){mode='finished';finale.stop();mix();}
 function pause(){paused=true;tracks.hotel.pause();finale.pause();mix();}
 function resume(){
  paused=false;context?.resume().catch(()=>{});
  if(mode==='hotel'&&context)play('hotel');else if(mode==='ending')finale.resume();mix();
 }
 return {startHotel,startEnding,finishEnding,pause,resume,prepareEnding:()=>finale.prepare(context),cueTime:finale.time,
  updateHotel(t,room){if(mode!=='hotel')return;const phase=t%70;
   const levels={road:0,reception:.53,lounge:.71,pantry:.10,baggage:.055,claim:.045,suite:0};
   hotelLevel=levels[room]??(phase<14?.15*(1-phase/14):phase>60?.15*(phase-60)/10:0);
   if(hotelFilter){const hz=room==='lounge'?5100:room==='reception'?3200:room==='pantry'?870:640;
    if(hotelFilter.targetHz!==hz){hotelFilter.targetHz=hz;hotelFilter.frequency.setTargetAtTime(hz,context.currentTime,.30);}}
   mix();},
  setEnabled(value){enabled=value;mix();},setVolume(value){volume=clamp(Number(value)||0);mix();},
  snapshot(){return {mode,paused,enabled,volume,finale:finale.snapshot(),context:context?.state||'unstarted',tracks:Object.fromEntries(Object.entries(tracks).map(([name,a])=>[name,{paused:a.paused,time:+a.currentTime.toFixed(2),ready:a.readyState,duration:Number.isFinite(a.duration)?+a.duration.toFixed(2):null,gain:channels?+channels[name].gain.value.toFixed(3):0,error:failures.has(name)}]))};}
 };
}
