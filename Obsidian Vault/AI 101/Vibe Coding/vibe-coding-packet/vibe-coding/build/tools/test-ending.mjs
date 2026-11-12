import {test} from 'node:test';
import assert from 'node:assert/strict';
import {endingFrame,ENDING_DURATION,STRIKE_AT,canEnterEnding} from '../src/ending-timeline.js';
test('only the unlocked suite during gameplay can start the ending',()=>{
 for(const room of ['suite','corridor','reception'])for(const unlocked of [false,true])for(const mode of ['playing','paused','ending','end'])assert.equal(canEnterEnding({room,unlocked,mode}),room==='suite'&&unlocked&&mode==='playing');
});
test('silent reception gives way to bone, the crowd, a held silence and a single close cut',()=>{
 assert.equal(endingFrame(3).phase,'desk');assert.equal(endingFrame(3).reveal,0);
 assert.equal(endingFrame(11).shot,1);assert.equal(endingFrame(11).reveal,1);
 assert.equal(endingFrame(15).shot,2);assert.equal(endingFrame(22).phase,'listening');
 assert.equal(endingFrame(STRIKE_AT-.001).shot,2);assert.equal(endingFrame(STRIKE_AT).shot,3);
 assert.equal(endingFrame(26).blackout,1);
});
test('the finite ending freezes at its terminal image and never loops into play',()=>{
 assert.equal(endingFrame(ENDING_DURATION-.01).complete,false);assert.equal(endingFrame(ENDING_DURATION).complete,true);
 assert.deepEqual(endingFrame(9999),endingFrame(ENDING_DURATION));assert.equal(endingFrame(-2).time,0);assert.equal(endingFrame(NaN).time,0);
});
test('reveal and enclosure are bounded and monotonic with no flashing fade',()=>{
 let previous=endingFrame(0);
 for(let t=.01;t<=ENDING_DURATION;t+=.01){const f=endingFrame(t);for(const k of ['reveal','approach','blackout','darkness'])assert.ok(f[k]>=0&&f[k]<=1,k);assert.ok(f.reveal>=previous.reveal);assert.ok(f.approach>=previous.approach);assert.ok(Math.abs(f.blackout-previous.blackout)<.05);previous=f;}
});
