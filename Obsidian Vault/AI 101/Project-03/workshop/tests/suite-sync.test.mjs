import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

// Execute the shipped context handler with harmless UI doubles.
const questSource=fs.readFileSync(new URL('../../../Project%202/idea-quest-three-spike/src/main.js',import.meta.url),'utf8');
const start=questSource.indexOf("let lastBridgeContext=");
const end=questSource.indexOf('\nif(inSuite)window.addEventListener',start);
function quest({bridge=false,load=async()=>{}}={}){
  const calls=[],messages=[];
  const context=vm.createContext({inSuite:true,suiteProjectId:null,suiteWorkflow:null,suiteReady:true,suitePending:null,suiteActive:true,suiteInspectPending:null,focusId:'a',selectedId:'a',records:new Map([['a',{}],['b',{}],['c',{}]]),audio:{setVisible:v=>calls.push(['audio',v])},document:{visibilityState:'visible',documentElement:{dataset:{}},body:{dataset:{bridge:String(bridge)}}},loadRegistry:load,localStorage:{setItem(){}},renderFocus(){},renderDock(){},renderDetails(){},$:()=>({querySelectorAll:()=>[]}),selectProject:id=>calls.push(['open',id]),animate(){},syncRoomLoop(){},lastFrame:0,lastDraw:0,parent:{postMessage:(data,origin)=>messages.push({data,origin})}});
  vm.runInContext(questSource.match(/^function withWorkshopProgress.*$/m)[0]+'\n'+questSource.slice(start,end),context);return {context,calls,messages,apply:data=>context.applySuiteContext(data)};
}
test('hidden idea.quest receives context without opening or focusing its inspector',async()=>{
  const q=quest();await q.apply({projectId:'b',active:false});assert.equal(q.context.focusId,'b');assert.equal(q.context.suiteInspectPending,'b');assert.equal(q.calls.some(x=>x[0]==='open'),false);
  await q.apply({projectId:'b',active:true});assert.deepEqual(q.calls.filter(x=>x[0]==='open'),[['open','b']]);assert.equal(q.context.suiteInspectPending,null);
});
test('rapid hidden project changes open only the latest project on return',async()=>{
  const q=quest();await q.apply({projectId:'b',active:false});await q.apply({projectId:'c',active:false});await q.apply({projectId:'c',active:true});assert.deepEqual(q.calls.filter(x=>x[0]==='open'),[['open','c']]);
});
test('same-project switches preserve the open inspector and invalid ids are reported',async()=>{
  const q=quest();await q.apply({projectId:'a',active:false});await q.apply({projectId:'a',active:true});assert.equal(q.calls.some(x=>x[0]==='open'),false);await q.apply({projectId:'unknown',active:true});assert.equal(q.context.focusId,'a');assert.equal(q.messages.at(-1).data.type,'workshop:missing');
});
test('context arriving before idea.quest is ready waits for initialization',async()=>{
  const q=quest();q.context.suiteReady=false;await q.apply({projectId:'b',active:false});assert.equal(q.context.focusId,'a');assert.equal(q.context.suitePending.projectId,'b');assert.equal(q.calls.length,0);
});

test('late hosted context cannot restore an earlier project after a rapid switch',async()=>{
  const pending=[];const q=quest({bridge:true,load:()=>new Promise(resolve=>pending.push(resolve))});
  const earlier=q.apply({projectId:'b',active:false}),latest=q.apply({projectId:'c',active:true});
  pending[1]();await latest;pending[0]();await earlier;
  assert.equal(q.context.focusId,'c');assert.equal(q.context.suiteActive,true);assert.deepEqual(q.calls.filter(x=>x[0]==='open'),[['open','c']]);
});
