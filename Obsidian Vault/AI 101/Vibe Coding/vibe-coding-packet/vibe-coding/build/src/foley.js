import {createRoomTone} from './room-tone.js';
const files = {
 lid:'assets/audio/foley-28/lid.mp3',
 case:'assets/audio/foley-28/case.mp3',
 sleeve:'assets/audio/foley-28/sleeve.mp3',
 catch:'assets/audio/foley-28/catch.mp3',
 engine:'assets/audio/foley-23/engine.mp3',
 open:'assets/audio/foley-23/car-open.mp3',
 close:'assets/audio/foley-23/car-close.mp3',
 latch:'assets/audio/foley-23/metalLatch.mp3',
 hinge:'assets/audio/foley-23/creak1.mp3',
 stepA:'assets/audio/foley-23/footstep00.mp3',
 stepB:'assets/audio/foley-23/footstep03.mp3',
 stepC:'assets/audio/foley-23/footstep06.mp3'
};

export function createFoley() {
 const clips = new Map(), voices = new Set();
 let context, output, enterTone, reflection, send, room='road', enabled=true, step=0;
 // Decode during the hotel load so the first engine transient lands on the first frame.
 const ready = (async () => {
  const decoder = new OfflineAudioContext(1,1,44100);
  await Promise.all(Object.entries(files).map(async ([name,url]) => {
   try {
    const result = await fetch(url);
    if (!result.ok) throw Error(String(result.status));
    clips.set(name,await decoder.decodeAudioData(await result.arrayBuffer()));
   } catch (error) { console.warn('Hotel sound unavailable',name,error); }
  }));
 })().catch(error=>console.warn('Hotel audio decoder unavailable',error));
 function play(name, gain, {rate=1, cutoff=17000, offset=0, delay=0,pan=0}={}) {
  const buffer=clips.get(name);
  if (!context || !enabled || !buffer || offset >= buffer.duration) return;
  const source=context.createBufferSource(), filter=context.createBiquadFilter(), volume=context.createGain();
  source.buffer=buffer; source.playbackRate.value=rate;
  filter.type='lowpass'; filter.Q.value=.55; filter.frequency.value=cutoff;
  volume.gain.value=gain;
  const stereo=context.createStereoPanner();stereo.pan.value=pan;
  source.connect(filter);filter.connect(volume);volume.connect(stereo);stereo.connect(output);stereo.connect(send);voices.add(source);
  source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();volume.disconnect();stereo.disconnect();};
  source.start(context.currentTime+delay,offset);
 }
 function stop() {for (const source of voices) source.stop(); voices.clear();}
 function enter(name){
  room=name;
  enterTone?.(name);
  const wet={pantry:.23,stairs:.31,reception:.11,landing:.19,baggage:.045,claim:.055,lounge:.08,corridor:.14,suite:.05,ending:.22};
  reflection?.gain.setTargetAtTime(wet[name]||0,context.currentTime,.10);
 }
 return {
  ready,enter,
  connect(ctx,destination){
   context=ctx;output=destination;
   enterTone=createRoomTone(ctx,destination);send=ctx.createBiquadFilter();send.type='lowpass';send.frequency.value=3100;
   reflection=ctx.createGain();reflection.gain.value=0;reflection.connect(output);
   for(const [delay,pan,level] of [[.032,-.68,.75],[.081,.73,.40]]){
    const tap=ctx.createDelay(.1),p=ctx.createStereoPanner(),g=ctx.createGain();
    tap.delayTime.value=delay;p.pan.value=pan;g.gain.value=level;
    send.connect(tap);tap.connect(p);p.connect(g);g.connect(reflection);
   }
   enter(room);
  },
  enable(value){enabled=value;if(!value) stop();}, stop,
  engine(time){play('engine',.84,{offset:time,cutoff:4500});},
  car(open){play(open?'open':'close',open?.88:1.05);},
  fabric(pan=0,level=.38){play('sleeve',level,{pan,rate:.83,cutoff:3800});},
 cloche(tap,near){play('lid',(near?.64:.37)*[1,.60,.78][tap],{pan:.40,rate:[.83,.91,.76][tap],cutoff:near?8400:3600});},
 caseMove(){play('case',.64,{pan:.27,cutoff:3900,rate:.86});},
 clasp(){play('catch',.46,{pan:.27,rate:.82});},
 glass(){play('catch',.21,{pan:.24,rate:1.72,cutoff:7600});},
 door(){play('latch',.72);play('hinge',.55,{delay:.12,rate:.76});},
  foot(surface){
   const keys=['stepA','stepB','stepC','stepB','stepA','stepC'];
   const carpet=surface==='carpet',distant=surface==='distant',tile=surface==='tile';
   play(keys[step++ % keys.length],distant?.18:carpet?.40:.61,{
    cutoff:carpet?1450:distant?2300:tile?9300:5100,rate:.94+Math.random()*.12,pan:(step%2?1:-1)*.11
   });
  }
 };
}

