import test from 'node:test';
import assert from 'node:assert/strict';
import {cueSamples,CUE_LENGTHS,createWorkshopAudio} from '../src/workshop-audio.js';
import {restoreFocus,FOCUS_DURATION} from '../src/focus-session.js';

test('every sound has a bounded audible signal and silent boundaries, without external assets',()=>{
  for(const kind of Object.keys(CUE_LENGTHS)){
    const samples=cueSamples(kind);let power=0,peak=0;
    for(const sample of samples){assert.ok(Number.isFinite(sample));power+=sample*sample;peak=Math.max(peak,Math.abs(sample));}
    assert.ok(Math.sqrt(power/samples.length)>.001,kind+' is not silent');
    assert.ok(peak<=.321,kind+' cannot clip');
    assert.equal(samples[0],0);assert.equal(samples[samples.length-1],0);
    assert.deepEqual(cueSamples(kind),samples,'reproducible synthesis');
  }
});

function fixture(){
  const items=new Map();let created=0,started=0,stopped=0,time=0;
  class Context{
    constructor(){created++;this.state='suspended';this.currentTime=0;this.destination={};}
    async resume(){this.state='running';}
    async suspend(){this.state='suspended';}
    createGain(){return {gain:{value:0,setTargetAtTime(){}},connect(){}};}
    createBuffer(channels,length){const data=new Float32Array(length);return {getChannelData:()=>data};}
    createBufferSource(){return {connect(){},disconnect(){},start(){started++;},stop(){stopped++;this.onended?.();}};}
  }
  const storage={getItem:key=>items.get(key)||null,setItem:(key,value)=>items.set(key,value)};
  const audio=createWorkshopAudio({storage,Context,now:()=>time});
  return {audio,items,storage,Context,advance(){time+=100;},counts:()=>({created,started,stopped})};
}

test('audio is opt-in, remembers preferences, and stops on mute or backgrounding',async()=>{
  const f=fixture();assert.equal(await f.audio.play('potion'),false);assert.equal(f.counts().created,0);
  await f.audio.setEnabled(true);assert.equal(f.counts().created,1);assert.equal(f.counts().started,1,'one ambient loop');
  await f.audio.play('potion');assert.equal(f.counts().started,2);
  f.audio.setVolume(.2);f.audio.setAmbience(false);
  const saved=JSON.parse(f.items.get('ideaQuest.audio'));assert.deepEqual(saved,{enabled:true,volume:.2,ambience:false});
  f.audio.setVisible(false);const count=f.counts().started;f.advance();assert.equal(await f.audio.play('complete'),false);assert.equal(f.counts().started,count);assert.ok(f.counts().stopped>=2);
  f.audio.setVisible(true);await f.audio.unlock();await f.audio.setEnabled(false);f.advance();assert.equal(await f.audio.play('purr'),false);
  assert.equal(JSON.parse(f.items.get('ideaQuest.audio')).enabled,false);
});

test('muting while audio resumes cannot schedule a late sound; denied audio/storage are nonfatal',async()=>{
  const f=fixture();await f.audio.setEnabled(true);f.advance();const pending=f.audio.play('scroll');await f.audio.setEnabled(false);const count=f.counts().started;await pending;assert.equal(f.counts().started,count);
  class Denied{constructor(){throw new Error('blocked');}}
  const audio=createWorkshopAudio({Context:Denied,storage:{getItem(){throw new Error('denied');},setItem(){throw new Error('denied');}}});
  assert.equal(await audio.setEnabled(true),false);assert.equal(audio.state().unavailable,true);assert.equal(await audio.play('purr'),false);
});

test('focus survives reload only for a valid, unexpired project session',()=>{
  const now=1000000,ids=['first','second'];
  const session={projectId:'second',endsAt:now+FOCUS_DURATION-1000};
  assert.deepEqual(restoreFocus(JSON.stringify(session),now,ids),session);
  for(const raw of ['bad',null,'{}',JSON.stringify({...session,projectId:'deleted'}),JSON.stringify({...session,endsAt:now-1}),JSON.stringify({...session,endsAt:now+FOCUS_DURATION+1})])assert.equal(restoreFocus(raw,now,ids),null);
});
