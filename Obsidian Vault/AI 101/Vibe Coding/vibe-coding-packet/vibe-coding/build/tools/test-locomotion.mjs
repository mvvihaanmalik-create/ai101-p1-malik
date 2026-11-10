import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocomotion,steerMotion,measureMotion,CYCLES} from '../src/guest-locomotion.js';
test('actual travel selects the right authored step, independent of input key',()=>{
 for(const [x,z,key] of [[0,-1,'Walk'],[0,1,'WalkBack'],[-1,0,'StepLeft'],[1,0,'StepRight']]){const m=createLocomotion();measureMotion(m,x*CYCLES[key],z*CYCLES[key],1);assert.equal(m.phase,1);assert.equal(m.weights[key],1);}
});
test('diagonal stance blend reproduces actual ground displacement',()=>{
 const m=createLocomotion();measureMotion(m,-.02,-.04,1/60);
 assert.ok(Math.abs(m.weights.Walk*CYCLES.Walk*m.phase-.04)<1e-10);
 assert.ok(Math.abs(m.weights.StepLeft*CYCLES.StepLeft*m.phase-.02)<1e-10);
});
test('blocked movement does not advance steps and settles into idle',()=>{
 const m=createLocomotion();measureMotion(m,0,-.04,1/60);const phase=m.phase;
 for(let i=0;i<60;i++){steerMotion(m,0,-1,1/60);measureMotion(m,0,0,1/60);}
 assert.equal(m.phase,phase);assert.equal(m.gait,0);
});
test('release stops within 15 centimetres, without abrupt velocity changes',()=>{
 const m=createLocomotion();for(let i=0;i<60;i++)steerMotion(m,0,-1,1/60);
 let distance=0;for(let i=0;i<30;i++){const d=steerMotion(m,0,0,1/60);distance+=Math.hypot(d.x,d.z);}
 assert.equal(m.vz,0);assert.ok(distance>0&&distance<.15);
});
test('30 and 120 fps cover the same ground within three centimetres',()=>{
 function travel(fps){const m=createLocomotion();let z=0;for(let i=0;i<fps*3;i++){const d=steerMotion(m,0,-1,1/fps);z+=d.z;measureMotion(m,d.x,d.z,1/fps);}return z;}
 assert.ok(Math.abs(travel(30)-travel(120))<.03);
});
