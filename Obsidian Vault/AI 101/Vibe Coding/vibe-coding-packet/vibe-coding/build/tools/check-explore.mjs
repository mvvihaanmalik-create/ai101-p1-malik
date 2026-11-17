// Developer checks only. Drives an isolated Chrome using its debugging pipe, public keys and visible review UI.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const qaMode=process.argv[3]||'route';
const dir=new URL(process.env.HOTEL_SHOTS || (qaMode.startsWith('visual')?'../../build-record/tests/visual-18/'+(qaMode==='visual-baseline'?'before/':'after/'):qaMode==='route'?'../../build-record/tests/visual-18/route/':'../../build-record/tests/welcome-17/'),import.meta.url);
const url=process.argv[2]||'http://127.0.0.1:4170/?review=1';
const exe=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const tmp=await mkdtemp(path.join(os.tmpdir(),'room0-qa-'));
const browser=spawn(exe,['--headless=new','--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-first-run','--no-default-browser-check',(qaMode.startsWith('visual')||qaMode==='ending')?'--window-size=1920,1200':'--window-size=1280,820','--remote-debugging-pipe','--user-data-dir='+tmp,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','ignore','pipe','pipe']});
let counter=0,buf=Buffer.alloc(0),sid;const pending=new Map(),errors=[];
browser.stdio[4].on('data',v=>{buf=Buffer.concat([buf,v]);let end;while((end=buf.indexOf(0))>=0){const m=JSON.parse(buf.subarray(0,end).toString());buf=buf.subarray(end+1);if(m.id){const p=pending.get(m.id);if(!p)continue;pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);}});
function cmd(method,params={},sessionId=sid){const id=++counter;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});browser.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0');});}
const sleep=n=>new Promise(r=>setTimeout(r,n));
const ev=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.exception?.description||v.exceptionDetails.text);return v.result.value;};
const diag=()=>ev("JSON.parse(document.getElementById('diagnostics').textContent||'{}')");
async function until(f,max=55000){const start=Date.now();for(;;){if(errors.length)throw Error(errors.join('\n'));const v=await f();if(v)return v;if(Date.now()-start>max)throw Error('Timed out: '+f+' '+JSON.stringify(await diag()));await sleep(110);}}
const mode=process.argv[3]||'route';const snapshots=[];async function record(label){const d=await diag();snapshots.push({label,room:d.room,detail:d.detail,progress:d.progress,orientation:d.orientation,focus:d.focus,branch:d.branch,stairKind:d.stairKind,visibleCast:d.visibleCast,butlerVisible:d.butlerVisible,history:d.history,contacts:d.contacts,errors:d.errors,plaything:d.encounterMetrics?.plaything});await writeFile(new URL('browser-'+mode+'-checkpoints.json',dir),JSON.stringify(snapshots,null,2));console.log(label,d.room,d.detail,d.focus,d.progress);}
async function key(k,down){return cmd('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key:k,code:k==='Escape'?'Escape':'Key'+k.toUpperCase(),windowsVirtualKeyCode:k==='Escape'?27:k.toUpperCase().charCodeAt(0)});}
async function press(k){await key(k,true);await key(k,false);}
async function walk(k,condition){await key(k,true);try{await until(async()=>condition(await diag()));}finally{await key(k,false);}await sleep(350);}
const hit=id=>ev("document.getElementById("+JSON.stringify(id)+").click()");
const select=(id,value)=>ev("(()=>{let x=document.getElementById("+JSON.stringify(id)+");x.value="+JSON.stringify(value)+";x.dispatchEvent(new Event('change'));})()");
async function shot(file){const rect=await ev("(()=>{const r=document.getElementById('stage').getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height,scale:1}})()");const {data}=await cmd('Page.captureScreenshot',{format:'jpeg',quality:88,clip:rect});await writeFile(new URL(file+'.jpg',dir),Buffer.from(data,'base64'));}
const safety=setTimeout(()=>{console.error('Global timeout');browser.kill();process.exit(1);},540000);
try{
 const {targetInfos}=await cmd('Target.getTargets');sid=(await cmd('Target.attachToTarget',{targetId:targetInfos.find(t=>t.type==='page').targetId,flatten:true})).sessionId;
 await cmd('Runtime.enable');await cmd('Page.enable');await cmd('Page.navigate',{url});
 await until(async()=>await ev("Boolean(document.querySelector('#explore:not([disabled])'))"),90000);
 await ev("Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Hide review tools').click()");await shot('title-menu');
 await hit('explore');await until(async()=>(await diag()).exploreOutside);
 assert.equal((await diag()).build,'v40');await shot('broken-car');
 await walk('w',d=>Math.hypot(d.explorePosition[0]+86.45,d.explorePosition[2]+132.4)<2.7);
 await shot('hotel-approach');await press('e');await until(async()=>!(await diag()).exploreOutside);
 async function empty(label){const d=await diag();assert.equal(d.exploring,true);assert.equal(d.progress,0);assert.equal(d.anomaly,null);assert.equal(d.receptionistVisible,false);assert.equal(d.butlerVisible,false);assert.deepEqual(d.visibleCast,[]);assert.equal(d.ending,null);await record(label);}
 await empty('empty reception');await shot('empty-reception');
 if(mode!=='explore-start'){
 await press('Escape');await until(async()=>(await diag()).mode==='paused');assert.match(await ev("document.querySelector('#register-note').textContent"),/THIRD/);await shot('hotel-plan');await hit('resume');
 await walk('w',d=>d.guestY>7.8);await press('e');await until(async()=>(await diag()).room==='landing');
 for(const destination of ['pantry','lounge','baggage','bathroom','corridor','landing']){
  await sleep(950);await walk('w',d=>d.room===destination);await empty('ground '+destination);
  if(destination==='baggage'){
   await sleep(950);await walk('w',d=>d.guestY>4.7);await press('e');await until(async()=>(await diag()).room==='claim');
   assert.equal((await diag()).claim.personVisible,false);await key('a',true);await sleep(700);await key('a',false);await shot('empty-left-luggage');await press('e');await until(async()=>(await diag()).room==='baggage');
  }
 }
 for(let floor=1;floor<=3;floor++){
  await sleep(950);await press('e');await until(async()=>(await diag()).room==='stairs');await walk('w',d=>d.room==='landing'&&d.exploreFloor===floor);await empty('floor '+floor);
 }
 await sleep(950);await walk('w',d=>d.room==='corridor');await sleep(950);await walk('w',d=>d.room==='suite');await empty('honeymoon approach without ending');await shot('empty-suite-approach');
 await sleep(950);await walk('s',d=>d.room==='corridor');await sleep(950);await walk('s',d=>d.room==='landing');
 for(let floor=2;floor>=0;floor--){await sleep(950);await walk('s',d=>d.room==='stairs');await sleep(950);await walk('s',d=>d.room==='landing'&&d.exploreFloor===floor);await empty('descended to '+floor);}
 await sleep(950);await walk('s',d=>d.room==='reception');await sleep(950);await walk('s',d=>d.guestY<3.4);await press('e');await until(async()=>(await diag()).exploreOutside);await record('returned to highway');
 await press('Escape');await hit('title-menu');await until(async()=>await ev("!document.querySelector('#intro').hidden"));await hit('enter');await until(async()=>(await diag()).road!==null);
 assert.equal((await diag()).exploring,false);assert.equal((await diag()).exploreOutside,false);await press('e');await until(async()=>(await diag()).arrival!==null);await press('e');await until(async()=>(await diag()).arrival===null);
 assert.equal((await diag()).receptionistVisible,true);await record('story mode restored');
 }else{
  assert.equal((await diag()).graphicsRecoveries,0);assert.equal((await diag()).music.mode,'hotel');assert.equal((await diag()).music.tracks.hotel.paused,false);
  await hit('benchmark');await until(async()=>/medianMs/.test(await ev("document.querySelector('#benchmark-result').textContent")));
  const performance=JSON.parse(await ev("document.querySelector('#benchmark-result').textContent"));
  await writeFile(new URL('graphics-performance.json',dir),JSON.stringify(performance,null,2));
  await ev("window.restoreProbe=document.querySelector('#world').getContext('webgl2').getExtension('WEBGL_lose_context');window.restoreProbe.loseContext()");
  await until(async()=>await ev("!document.querySelector('#error').hidden"));
  await ev('window.restoreProbe.restoreContext()');await until(async()=>!(await diag()).graphicsLost&&(await diag()).graphicsRecoveries===1);
  await hit('resume');const start=(await diag()).guestY;await walk('w',d=>d.guestY>start+.5);await record('forced graphics recovery kept exploration controls');
 }
 assert.equal(errors.length,0);await writeFile(new URL('browser-'+mode+'-result.json',dir),JSON.stringify({status:'passed',url,errors,formalTest:false},null,2));
}finally{clearTimeout(safety);await cmd('Browser.close',{},undefined).catch(()=>{});browser.kill();}
