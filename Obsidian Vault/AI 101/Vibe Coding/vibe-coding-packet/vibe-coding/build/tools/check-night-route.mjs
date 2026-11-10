// Developer checks only. Drives an isolated Chrome using its debugging pipe, public keys and visible review UI.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const qaMode=process.argv[3]||'route';
const dir=new URL(qaMode.startsWith('visual')?'../../build-record/tests/visual-18/'+(qaMode==='visual-baseline'?'before/':'after/'):qaMode==='route'?'../../build-record/tests/visual-18/route/':'../../build-record/tests/welcome-17/',import.meta.url);
const url=process.argv[2]||'http://127.0.0.1:4170/?review=1';
const exe=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const tmp=await mkdtemp(path.join(os.tmpdir(),'room0-qa-'));
const browser=spawn(exe,['--headless=new','--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-first-run','--no-default-browser-check',qaMode.startsWith('visual')?'--window-size=1920,1200':'--window-size=1280,820','--remote-debugging-pipe','--user-data-dir='+tmp,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','ignore','pipe','pipe']});
let counter=0,buf=Buffer.alloc(0),sid;const pending=new Map(),errors=[];
browser.stdio[4].on('data',v=>{buf=Buffer.concat([buf,v]);let end;while((end=buf.indexOf(0))>=0){const m=JSON.parse(buf.subarray(0,end).toString());buf=buf.subarray(end+1);if(m.id){const p=pending.get(m.id);if(!p)continue;pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);}});
function cmd(method,params={},sessionId=sid){const id=++counter;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});browser.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0');});}
const sleep=n=>new Promise(r=>setTimeout(r,n));
const ev=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.exception?.description||v.exceptionDetails.text);return v.result.value;};
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
 await cmd('Runtime.enable');await cmd('Page.enable');await cmd('Page.navigate',{url});await until(async()=>await ev("Boolean(document.querySelector('#enter:not([disabled])'))"),90000);
 await hit('enter');await until(async()=>(await diag()).mode==='playing');
 // Hide review furniture for image captures; fixtures still operate their own public change handlers.
 await ev("Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Hide review tools').click()");
 async function claimCheck(){
  await until(async()=>(await diag()).room==='claim');await sleep(900);
  const start=await diag(),{target,order}=start.claim;
  async function choose(index){
   while((await diag()).claim.active!==index){await press('d');await sleep(280);}
   await press('e');await sleep(1250);
  }
  await choose(order.findIndex(x=>x!==target));await press('e');await sleep(400);
  assert.equal((await diag()).progress,2);assert.equal((await diag()).claim.solved,false);
  assert.match(await ev("document.getElementById('caption').textContent"),/pushes/);
  await choose(order.indexOf(target));await shot('mirror-match');await press('Escape');await sleep(350);
  assert.equal((await diag()).mode,'paused');await hit('resume');await press('e');await sleep(1300);
  assert.equal((await diag()).claim.solved,true);
  assert.match(await ev("document.getElementById('caption').textContent"),/this case up yesterday/);
  await shot('porter-recognizes-case');
  await until(async()=>(await diag()).claim?.open>=.95);await shot('porter-opens-stair');await press('e');
  await until(async()=>(await diag()).room==='stairs');assert.equal((await diag()).progress,2);await record('claimed luggage and entered staff stair');
 }
 if(mode==='visual-fallback'){
  await cmd('Network.enable');await cmd('Network.setBlockedURLs',{urls:['*masters-v18/route-4-normal-v15.webp']});
  await select('review-room','landing');await hit('resume');
  await until(async()=>{const d=await diag();return d.room==='landing'&&d.visual?.failed.includes('route-4-normal-v15.webp');});
  const start=(await diag()).guestY;await walk('w',d=>d.room==='landing'&&d.guestY>start+.5);await shot('blocked-master-fallback');
  await select('review-room','reception');await hit('resume');await until(async()=>{const d=await diag();return d.room==='reception'&&d.visual.masterReady;});
  await record('blocked landing master kept controls; reception recovered native art');
 }
 if(mode==='story'||(mode.startsWith('visual')&&mode!=='visual-fallback')){
  const depth=(await diag()).guestY;
  await until(async()=>(await diag()).arrival?.line===0);
  assert.ok((await diag()).guestY>depth+1);await shot('guest-at-counter');
  await until(async()=>(await diag()).arrival?.line===1);
  assert.match(await ev("document.getElementById('caption').textContent"),/lift is broken/);
  await press('Escape');await sleep(400);const frozen=(await diag()).arrival.time;
  await sleep(700);assert.equal((await diag()).arrival.time,frozen);await hit('resume');
  await until(async()=>(await diag()).arrival?.line===2);await shot('porter-directs-upstairs');
  await until(async()=>(await diag()).arrival===null);await walk('w',d=>d.guestY>7.8);await press('e');await until(async()=>(await diag()).room==='landing');
  await hit('restart');await sleep(550);await press('e');await sleep(400);assert.equal((await diag()).arrival,null);
 }
 if(mode==='visual-fallback'){ /* Standalone fallback exercise above. */ }
 else if(mode==='claim'||mode==='story'||mode.startsWith('visual')){
  for(let i=1;i<=2;i++){
   await select('review-encounter','C1');await hit('resume');await sleep(1100);await walk('s',d=>d.progress===i);
   await until(async()=>!(await diag()).pending);await sleep(450);
  }
  await claimCheck();
  if(mode==='visual'||mode==='visual-baseline'){
   const records=[];
   async function capture(label,waitMaster=true){
    await sleep(700);
    if(mode==='visual'&&waitMaster)await until(async()=>{const v=(await diag()).visual;return v?.masterReady&&!v.failed.length;});
    await shot(label);const d=await diag();records.push({label,view:d.view,room:d.room,visual:d.visual,frameMs:d.frameMs});
    if(mode==='visual'&&['desk','luggage','surround'].includes(label)){
     await hit('benchmark');await until(async()=>await ev("document.getElementById('benchmark-result').textContent.startsWith('{')"));
     records.at(-1).gpu=await ev("JSON.parse(document.getElementById('benchmark-result').textContent)");
     if((await diag()).mode==='paused')await hit('resume');
    }
   }
   for(const [room,id] of [['reception','desk'],['landing','lift-wide'],['corridor','gallery'],['stairs','stairs'],['suite','suite-door'],['lounge','night-bar']]){
    await select('review-room',room);await hit('resume');await until(async()=>(await diag()).room===room);await capture(id);
   }
   for(const [id,detail] of [['N-C4','dog'],['N-C1','bell'],['N-C6','luggage'],['E4','mirror'],['C3','children']]){
    await select('review-encounter',id);await hit('resume');await sleep(850);await select('review-detail',detail);await hit('resume');await capture(detail);
   }
   await ev("document.querySelector('[aria-label=\"Hold ending frame\"]').click()");
   for(const shot of ['bones','surround']){await select('review-ending',shot);await capture(shot);}
   await writeFile(new URL('shot-register.json',dir),JSON.stringify(records,null,2));
  }
 }else if(mode==='boundaries'){
  for(const [id,branch,want] of [['N-C3','stair',1],['N-C2','hall',2]]){
   await select('review-encounter',id);await hit('resume');await sleep(1100);
   await walk('w',d=>d.progress===want);await until(async()=>!(await diag()).pending);
   const d=await diag();assert.equal(d.history.at(-1).choice,'continue');assert.equal(d.history.at(-1).anomaly,null);await record(branch+' ordinary far exit');
   if(d.room==='stairs'){await sleep(1000);await walk('w',d=>d.room==='landing');}
  }
  await select('review-encounter','E3');await hit('resume');await sleep(1200);await walk('s',d=>d.progress===3);await record('shared lift return');
 }else if(mode==='edge'){
  await select('review-encounter','C1');await hit('resume');await sleep(1100);
  await press('Escape');await sleep(350);
  const register=await ev("document.getElementById('register-note').textContent");assert.match(register,/holds the bell/);await shot('night-register');await hit('resume');
  await walk('w',d=>d.guestY>14.53);assert.match(await ev("document.getElementById('caption').textContent"),/Hold S/);await shot('retreat-warning');
  await walk('s',d=>d.progress===1);await until(async()=>!(await diag()).pending);await record('escaped with one floor');
  await select('review-encounter','C1');await hit('resume');await sleep(1000);await walk('w',d=>d.contacts===1);
  await until(async()=>{const d=await diag();return d.room==='landing'&&d.progress===0&&!d.pending;});await sleep(1500);
  assert.match(await ev("document.getElementById('caption').textContent"),/caught you/);await shot('contact-reset');await record('contact reset and explanation');
  await walk('w',d=>d.guestY>5.3);assert.equal((await diag()).contacts,1);
 }else{
 for(const [id,name] of [['N-C3','ordinary-children'],['C3','porcelain-game'],['C4','dog-on-the-stair'],['C1','bell-study'],['E6','runner-study'],['C5','gallery-last-order']]){
  await select('review-encounter',id);await hit('resume');await sleep(1050);
  const focus=await diag();assert.equal(focus.vignette,id.replace('N-',''));assert.ok(focus.visibleCast.length<=1);
  await select('review-detail',id.endsWith('C3')?'children':id==='C4'?'dog':id==='C1'?'bell':id==='C5'?'bar':'runner');await hit('resume');await sleep(900);
  const d=await diag();assert.ok(d.detail);if(id.endsWith('C3'))assert.equal(d.encounterMetrics.plaything,id==='C3'?'porcelain likeness':'rubber ball');
  await record(name);await shot(name);
 }
 if(mode!=='stills'){
 // Fresh ordinary tour, using only retail controls for route movement and scoring.
 await hit('restart');await until(async()=>(await diag()).arrival!=null);await until(async()=>(await diag()).arrival===null);
 await walk('w',d=>d.room==='reception'&&d.guestY>7.8);await press('e');await until(async()=>(await diag()).room==='landing');await sleep(950);
 await walk('w',d=>d.room==='corridor');await sleep(950);await walk('w',d=>d.guestY>6.5);await press('e');await sleep(350);assert.equal((await diag()).detail,'service');await press('e');
 await walk('w',d=>d.room==='stairs');await record('unscored tour to stair');await sleep(950);
 await walk('w',d=>d.room==='landing');await record('ground register after tour');
 for(let i=0;i<4;i++){
  await sleep(1100);
  if(i%2===0){await press('e');await until(async()=>(await diag()).room==='stairs');}
  else await walk('w',d=>d.room==='corridor');
  await sleep(1100);const f=await diag();assert.equal(f.branch,i%2===0?'stair':'hall');assert.ok(f.visibleCast.length<=1);
  // Developer verification reads the fixture diagnostics to exercise both exits deterministically.
  if(f.anomaly){await walk('w',d=>d.guestY>(i%2===0?5.5:7));await walk('s',d=>d.progress===i+1);}
  else await walk('w',d=>d.progress===i+1);
  await record('correct decision '+(i+1));
  await until(async()=>!(await diag()).pending);await sleep(1000);
  if((await diag()).room==='claim'){await claimCheck();await sleep(950);}
  const at=await diag();if(at.room==='stairs'){await walk('w',d=>d.room===(i===3?'suite':'landing'));}
  else assert.equal(at.room,i===3?'suite':'landing');
 }
 await record('suite reached on mixed routes');await sleep(1000);await walk('w',d=>d.guestY>6.65);await press('e');await until(async()=>(await diag()).mode==='ending');await record('reception ending entered');
 }}
 assert.equal(errors.length,0);await writeFile(new URL('browser-'+mode+'-result.json',dir),JSON.stringify({status:'passed',url,errors,formalTest:false},null,2));
}finally{clearTimeout(safety);await cmd('Browser.close',{},undefined).catch(()=>{});browser.kill();}

