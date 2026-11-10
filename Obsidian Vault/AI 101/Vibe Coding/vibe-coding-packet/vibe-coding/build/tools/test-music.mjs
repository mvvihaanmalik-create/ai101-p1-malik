import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreLevels,createMusicScore} from '../src/music-score.js';

test('ending score hands off hotel music and becomes silent at the terminal image',()=>{
 assert.deepEqual(scoreLevels(0),{hotel:.65,ending:0});
 assert.equal(scoreLevels(2.4).hotel,0);
 assert.ok(scoreLevels(14.5).ending>scoreLevels(6.2).ending);
 assert.equal(scoreLevels(26).ending,0);
 for(let t=-1;t<40;t+=.05)for(const gain of Object.values(scoreLevels(t)))assert.ok(gain>=0&&gain<=1);
});

test('pause, ending, replay and mute do not leave overlapping or advancing tracks',()=>{
 const previous=globalThis.Audio;
 class FakeAudio{constructor(){this.currentTime=0;this.paused=true;this.readyState=4;this.duration=180;}addEventListener(){}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
 globalThis.Audio=FakeAudio;
 const node=()=>({connect(){},frequency:{value:0},gain:{value:0,setTargetAtTime(v){this.value=v;}}});
 const ctx={currentTime:1,state:'running',destination:{},createMediaElementSource:node,createBiquadFilter:node,createGain:node,resume:()=>Promise.resolve()};
 try{
  const score=createMusicScore();score.startHotel(ctx);assert.equal(score.snapshot().tracks.hotel.paused,false);
  score.updateHotel(35,'corridor');assert.equal(score.snapshot().tracks.hotel.gain,0);
  score.updateHotel(35,'reception');assert.ok(score.snapshot().tracks.hotel.gain>0);
  score.pause();assert.equal(score.snapshot().tracks.hotel.paused,true);score.resume();
  score.startEnding();score.updateEnding(11);assert.equal(score.snapshot().tracks.hotel.paused,true);assert.equal(score.snapshot().tracks.ending.time,11);
  score.setEnabled(false);assert.equal(score.snapshot().tracks.ending.gain,0);
  score.setEnabled(true);score.pause();assert.equal(score.snapshot().tracks.ending.paused,true);score.resume();assert.equal(score.snapshot().tracks.ending.paused,false);
  score.updateEnding(26);assert.equal(score.snapshot().mode,'finished');assert.equal(score.snapshot().tracks.ending.paused,true);
  score.startHotel(ctx);assert.equal(score.snapshot().tracks.ending.paused,true);assert.equal(score.snapshot().tracks.ending.time,0);assert.equal(score.snapshot().tracks.hotel.time,0);
 }finally{globalThis.Audio=previous;}
});
