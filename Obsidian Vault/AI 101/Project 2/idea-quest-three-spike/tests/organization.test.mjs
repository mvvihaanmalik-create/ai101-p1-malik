import test from 'node:test';
import assert from 'node:assert/strict';
import {parseOrganization,nextTableFocus,tableSlot} from '../src/organization.js';
const ids=['a','b','c'];
test('organization defaults safely and accepts only known places',()=>{
  assert.deepEqual(parseOrganization('broken',ids),{a:'table',b:'table',c:'table'});
  assert.deepEqual(parseOrganization('{"a":"shelf","b":"retired","c":"deleted","other":"shelf"}',ids),{a:'shelf',b:'retired',c:'table'});
});
test('focus follows the worktable and permits an empty table',()=>{
  assert.equal(nextTableFocus({a:'shelf',b:'table',c:'retired'},'a',ids),'b');
  assert.equal(nextTableFocus({a:'shelf',b:'retired',c:'retired'},'b',ids),null);
  assert.equal(nextTableFocus({a:'table',b:'table',c:'retired'},'b',ids),'b');
});
test('remaining potions occupy distinct centered slots',()=>{
  assert.equal(tableSlot(0,1,true),0);
  assert.equal(tableSlot(0,2,true),-tableSlot(1,2,true));
  assert.equal(new Set(ids.map((_,i)=>tableSlot(i,3,false))).size,3);
});
