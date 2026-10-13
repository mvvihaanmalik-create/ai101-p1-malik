import test from 'node:test';
import assert from 'node:assert/strict';
import {artifactKind} from '../src/artifact-kind.js';

test('completed work keeps its keepsake when a bonus review is pending',()=>{
  assert.equal(artifactKind({id:'a',phase:'revisiting',gates:Array(5).fill('approved'),nextMove:'Test a bonus change'},'a'),'keepsake');
  assert.equal(artifactKind({kind:'artifact',gates:[]}), 'keepsake');
});
test('primary work brews; another draft awaiting review is a sealed scroll',()=>{
  const p={id:'a',phase:'active',gates:['approved','approved','active','upcoming','upcoming'],nextMove:'Review the draft'};
  assert.equal(artifactKind(p,'a'),'potion');
  assert.equal(artifactKind(p,'b'),'scroll');
  assert.equal(artifactKind({...p,nextMove:'Build the prototype'},'b'),'potion');
});
