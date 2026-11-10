// Kevin MacLeod, CC BY 4.0. Full source/edits/attribution: ../music-credits.html.
const clamp=x=>Math.max(0,Math.min(1,x));
export function scoreLevels(time){
 const t=Math.max(0,Number.isFinite(time)?time:0);
 return {hotel:.65*(1-clamp(t/2.4)),ending:(.22+.73*clamp((t-1.6)/13))*clamp(t/1.6)*(1-clamp((t-24)/2))};
}

export function createMusicScore({onError=()=>{}}={}){
 const tracks={hotel:new Audio('assets/audio/hotel-noir.mp3'),ending:new Audio('assets/audio/ending-dread.mp3')};
 let context,channels,mode='idle',paused=true,enabled=true,volume=.55,time=0,lastSync=-10,hotelLevel=.65;
 const failures=new Set();
 for(const [name,audio] of Object.entries(tracks)){
  audio.preload='auto';audio.loop=name==='hotel';
  audio.addEventListener('error',()=>{failures.add(name);onError('Music could not load. Hotel effects remain available.');});
 }
 function attach(ctx){
  if(context||!ctx)return;context=ctx;channels={};
  for(const [name,audio] of Object.entries(tracks)){
   const source=context.createMediaElementSource(audio),filter=context.createBiquadFilter(),gain=context.createGain();
   filter.type='lowpass';filter.frequency.value=name==='hotel'?3200:12000;gain.gain.value=0;
   source.connect(filter);filter.connect(gain);gain.connect(context.destination);channels[name]=gain;
  }
 }
 function play(name){if(!failures.has(name))tracks[name].play().catch(error=>{if(error.name!=='AbortError')onError('Music playback paused by the browser. Resume the game to retry.');});}
 function mix(){
  if(!context)return;
  const levels=mode==='hotel'?{hotel:hotelLevel,ending:0}:mode==='ending'?scoreLevels(time):{hotel:0,ending:0};
  for(const name of Object.keys(tracks))channels[name].gain.setTargetAtTime(!paused&&enabled?levels[name]*volume:0,context.currentTime,.12);
 }
 function startHotel(ctx){
  attach(ctx);mode='hotel';paused=false;time=0;tracks.ending.pause();tracks.ending.currentTime=0;tracks.hotel.currentTime=0;
  if(context){play('hotel');mix();}
 }
 function startEnding(at=0){
  mode='ending';paused=false;time=at;lastSync=-10;tracks.ending.currentTime=Math.min(at,26);
  if(context){play('ending');if(at<2.4)play('hotel');else tracks.hotel.pause();mix();}
 }
 function updateEnding(t){
  if(mode!=='ending')return;time=t;
  if(t>=2.4)tracks.hotel.pause();
  // Keep the scored cue with the visual reveal when rendering stalls or review jumps.
  if(!paused&&!tracks.ending.seeking&&tracks.ending.readyState>=2&&t-lastSync>1&&Math.abs(tracks.ending.currentTime-t)>.7){tracks.ending.currentTime=Math.min(t,26);lastSync=t;}
  mix();if(t>=26){mode='finished';tracks.ending.pause();mix();}
 }
 function pause(){paused=true;for(const track of Object.values(tracks))track.pause();mix();}
 function resume(){
  paused=false;if(!context)return;context.resume().catch(()=>{});
  if(mode==='hotel')play('hotel');else if(mode==='ending'){play('ending');if(time<2.4)play('hotel');}mix();
 }
 return {startHotel,startEnding,updateEnding,pause,resume,
  updateHotel(t,room){if(mode!=='hotel')return;const phase=t%70;hotelLevel=['reception','lounge'].includes(room)?.65:phase<14?.16*(1-phase/14):phase>60?.16*(phase-60)/10:0;mix();},
  setEnabled(value){enabled=value;mix();},setVolume(value){volume=clamp(Number(value)||0);mix();},
  snapshot(){return {mode,paused,enabled,volume,context:context?.state||'unstarted',tracks:Object.fromEntries(Object.entries(tracks).map(([name,a])=>[name,{paused:a.paused,time:+a.currentTime.toFixed(2),ready:a.readyState,duration:Number.isFinite(a.duration)?+a.duration.toFixed(2):null,gain:channels?+channels[name].gain.value.toFixed(3):0,error:failures.has(name)}]))};}
 };
}
