import test from 'node:test';
import assert from 'node:assert/strict';
import {createMusicScore} from '../src/music-score.js';

import {filmAt,cueAt,lyricAt,DOOR_AT,CUE_LENGTH} from '../src/finale-cue.js';
import {socialBeat} from '../src/character-performance.js';
test('suite approach precedes film; musical marks preserve all shots through blackout',()=>{
 assert.equal(filmAt(DOOR_AT),0);assert.equal(filmAt(24.02),23.4);assert.equal(filmAt(CUE_LENGTH),26);
 assert.equal(lyricAt(-1),'');assert.match(lyricAt(4),/door/);assert.match(lyricAt(24.1),/leave/);assert.equal(lyricAt(27),'');
 for(let t=0;t<26;t+=.1)assert.ok(Math.abs(filmAt(cueAt(t))-t)<1e-8);
});
test('upper floors hold attention longer in normal and changed encounters',()=>{
 assert.ok(socialBeat(1,0).nod>socialBeat(1,4).nod);
 const durations=[0,1,2,3,4].map(n=>socialBeat(10,n).gaze);assert.deepEqual(durations,[0,.25,.5,.75,1]);
});
test('pause, ending, replay and mute do not leave overlapping or advancing tracks',()=>{
 const previous=globalThis.Audio;
 class FakeAudio{constructor(){this.currentTime=0;this.paused=true;this.readyState=4;this.duration=180;}addEventListener(){}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
 globalThis.Audio=FakeAudio;
 const node=()=>({connect(){},frequency:{value:0,setTargetAtTime(v){this.value=v;}},gain:{value:0,setTargetAtTime(v){this.value=v;}}});
 const ctx={currentTime:1,state:'running',destination:{},createMediaElementSource:node,createBiquadFilter:node,createGain:node,resume:()=>Promise.resolve()};
 try{
  const score=createMusicScore();score.startHotel(ctx);assert.equal(score.snapshot().tracks.hotel.paused,false);
  score.updateHotel(35,'corridor');assert.equal(score.snapshot().tracks.hotel.gain,0);
  score.updateHotel(35,'reception');assert.ok(score.snapshot().tracks.hotel.gain>0);
  score.pause();assert.equal(score.snapshot().tracks.hotel.paused,true);score.resume();
  score.startEnding();ctx.currentTime+=11;assert.equal(score.snapshot().tracks.hotel.paused,true);assert.equal(score.cueTime(),11);
  score.setEnabled(false);assert.equal(score.snapshot().finale.gain,0);
  score.setEnabled(true);score.pause();assert.equal(score.snapshot().finale.paused,true);ctx.currentTime+=5;assert.equal(score.cueTime(),11);score.resume();assert.equal(score.snapshot().finale.paused,false);
  score.finishEnding();assert.equal(score.snapshot().mode,'finished');assert.equal(score.snapshot().finale.paused,true);
  score.startHotel(ctx);assert.equal(score.snapshot().finale.paused,true);assert.equal(score.cueTime(),0);assert.equal(score.snapshot().tracks.hotel.time,0);
 }finally{globalThis.Audio=previous;}
});
