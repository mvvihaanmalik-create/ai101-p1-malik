import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningCue,openingLyricAt,openingLines,OPENING_LENGTH,openingMix} from '../src/opening-cue.js';

test('the supplied opening has ordered captions and finishes before hotel play',()=>{
 assert.equal(OPENING_LENGTH,59);assert.equal(openingLyricAt(0),'');assert.match(openingLyricAt(47),/candle/);assert.match(openingLyricAt(50),/way/);assert.equal(openingLyricAt(59),'');
 for(let i=0;i<openingLines.length;i++){const [a,b]=openingLines[i];assert.ok(a<b&&b<=59);if(i)assert.ok(a>=openingLines[i-1][1]);}
 assert.ok(openingMix(6).lowpass<openingMix(50).lowpass);assert.equal(openingMix(59).gain,0);
});

test('opening pause, mute, restart and late audio unlock preserve the picture clock',async()=>{
 const saved={fetch:globalThis.fetch,OfflineAudioContext:globalThis.OfflineAudioContext,performance:globalThis.performance};
 const starts=[];let wall=100;
 const param=()=>({value:0,setTargetAtTime(v){this.value=v;}});
 const node=()=>({connect(){},disconnect(){},frequency:param(),gain:param(),pan:param(),delayTime:param(),Q:param()});
 const ctx={currentTime:20,state:'running',destination:{},createGain:node,createBiquadFilter:node,createStereoPanner:node,createDelay:node,createBufferSource:()=>({...node(),start(_when,at){starts.push(at);},stop(){}})};
 try{
  globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)});
  globalThis.OfflineAudioContext=class {async decodeAudioData(){return {duration:59};}};
  globalThis.performance={now:()=>wall*1000};
  const cue=createOpeningCue();await cue.preload();cue.start(ctx);ctx.currentTime+=17;assert.equal(cue.time(),17);
  cue.pause();ctx.currentTime+=4;assert.equal(cue.time(),17);cue.resume();assert.equal(starts.at(-1),17);
  cue.volume(0);assert.equal(cue.snapshot().audible,false);cue.volume(.5);assert.equal(cue.snapshot().audible,true);
  cue.stop();assert.equal(cue.time(),0);assert.equal(cue.snapshot().paused,true);
  ctx.state='suspended';cue.start(ctx);wall+=3;assert.equal(cue.time(),3);
  ctx.state='running';cue.mix();assert.equal(starts.at(-1),3);ctx.currentTime+=2;assert.equal(cue.time(),5);
  cue.stop();cue.start(ctx);assert.equal(cue.time(),0);ctx.currentTime+=60;assert.equal(cue.time(),59);
 }finally{Object.assign(globalThis,saved);}
});
