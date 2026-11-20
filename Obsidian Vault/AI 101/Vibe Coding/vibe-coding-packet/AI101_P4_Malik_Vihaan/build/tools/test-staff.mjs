import assert from 'node:assert/strict';
import handler from '../api/staff.mjs';
process.env.OPENAI_API_KEY='test-only';
let calls=0;
global.fetch=async(url,options)=>{calls++;const body=JSON.parse(options.body);assert.match(body.messages[1].content,/Blood runs/);return Response.json({choices:[{message:{content:"Your clean shirt is at reception."}}]});};
async function ask(body){let result;const res={setHeader(){},status(){return this},json(x){result=x},end(){}};await handler({method:'POST',body,headers:{}},res);return result;}
const base={staff:'bartender',message:'A glass of red please',seen:[],floor:0,history:[]};
assert.match((await ask(base)).reply,/1969/);assert.equal(calls,0);
assert.equal((await ask({...base,staff:'receptionist',message:'Where is my shirt?',seen:['E4']})).source,'live');assert.equal(calls,1);
global.fetch=async()=>{throw Error()};assert.equal((await ask({...base,staff:'porter'})).source,'script');
console.log('Staff tests passed: authored cue, contextual model request, provider failure.');
