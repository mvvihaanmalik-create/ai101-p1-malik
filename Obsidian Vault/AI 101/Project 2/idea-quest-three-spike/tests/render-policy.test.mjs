import test from 'node:test';
import assert from 'node:assert/strict';
import {renderDensity,shouldRunRoom,createFrameBudget,frameDue} from '../src/render-policy.js';
test('rendering respects device density and a pixel budget on phones, desktop and 4K',()=>{
  assert.equal(renderDensity(390,430,1),1);
  assert.equal(renderDensity(390,430,3),1.25);
  for(const [w,h] of [[1440,900],[3840,2160]]){const d=renderDensity(w,h,2);assert.ok(w*h*d*d<=1800001);}
  const d=renderDensity(1440,900,2,true);assert.ok(1440*900*d*d<=850001);
});
test('background, offscreen, paused and collection views do not keep rendering',()=>{
  const active={visible:true,inView:true,collectionOpen:false,still:false};assert.equal(shouldRunRoom(active),true);
  for(const state of [{visible:false},{inView:false},{collectionOpen:true},{still:true}])assert.equal(shouldRunRoom({...active,...state}),false);
});
test('quality only reduces after sustained slow foreground frames; hidden throttling is ignored',()=>{
  const fast=createFrameBudget();for(let i=0;i<240;i++)assert.equal(fast.sample(33),false);
  const slow=createFrameBudget();for(let i=0;i<79;i++)assert.equal(slow.sample(50),false);assert.equal(slow.sample(50),true);
  slow.reset();for(let i=0;i<30;i++)assert.equal(slow.sample(1000),false);
});
test('a burst of pointer events and animation callbacks share one rendering budget',()=>{
  let last=-100,draws=0;
  for(let t=0;t<1000;t++)for(const scheduled of [false,true])if(frameDue(t,last,scheduled,true)){last=t;draws++;}
  assert.ok(draws>=55&&draws<=64);
  assert.equal(frameDue(1001,1000,false,false),false);
  assert.equal(frameDue(1001,1000,false,false,true),true);
});
