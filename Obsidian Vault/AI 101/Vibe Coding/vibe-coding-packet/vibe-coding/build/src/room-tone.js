// Wind at the roadside, ventilation at the desk, and the lift motor share one
// continuously running network. Crossfades keep the floor cuts free of clicks.
const rooms={
 road:      [360,.19, .41,0,0],
 reception: [630,.044,-.28,60,.042],
 pantry:    [1590,.064,.48,118,.037],
 lounge:    [430,.036,-.42,55,.018],
 baggage:   [340,.034,.54,76,.024],
 claim:     [440,.040,.47,76,.029],
 landing:   [770,.046,-.72,60,.064],
 stairs:    [1020,.052,.58,0,0],
 corridor:  [1230,.051,.72,48,.027],
 suite:     [275,.024,-.13,46,.026],
 ending:    [310,.015,-.45,39,.030],
 silence:   [300,0,0,48,0]
};
export function createRoomTone(ctx,output){
 const noise=ctx.createBufferSource(),buffer=ctx.createBuffer(1,ctx.sampleRate*5,ctx.sampleRate);
 const samples=buffer.getChannelData(0);let seed=9031,x=0;
 for(let i=0;i<samples.length;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;x=.89*x+.11*(seed/2147483648-1);
  samples[i]=x*Math.min(1,i/600,(samples.length-1-i)/600);
 }
 noise.buffer=buffer;noise.loop=true;
 const band=ctx.createBiquadFilter(),air=ctx.createGain(),stereo=ctx.createStereoPanner();
 band.type='bandpass';band.Q.value=.64;air.gain.value=0;
 noise.connect(band);band.connect(air);air.connect(stereo);stereo.connect(output);noise.start();
 const motor=ctx.createOscillator(),hum=ctx.createGain();motor.type='triangle';hum.gain.value=0;
 motor.connect(hum);hum.connect(stereo);motor.start();
 let current;
 return function enter(name){
  if(current===name)return;current=name;
  const [hz,level,pan,freq,volume]=rooms[name]||rooms.silence;
  const at=ctx.currentTime;
  for(const [param,value] of [[band.frequency,hz],[air.gain,level],[stereo.pan,pan],[motor.frequency,freq||48],[hum.gain,volume]]){
   param.setTargetAtTime(value,at,name==='silence'?.04:.28);
  }
 };
}
