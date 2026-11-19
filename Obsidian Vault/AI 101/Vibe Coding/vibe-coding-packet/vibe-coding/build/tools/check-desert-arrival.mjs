// Developer checks only. Drives an isolated Chrome using its debugging pipe, public keys and visible review UI.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const qaMode='title';const dir=new URL(process.env.HOTEL_SHOTS || '../../build-record/tests/face-sound-23/',import.meta.url);
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
 await cmd('Runtime.enable');await cmd('Page.enable');
 await cmd('Page.addScriptToEvaluateOnNewDocument',{source:`
  window.foleyLog=[]; window.activeFoley=new Set();
  const names=new WeakMap(),decoded=new WeakMap(),read=Response.prototype.arrayBuffer;
  Response.prototype.arrayBuffer=async function(){const bytes=await read.call(this);
   if(this.url.includes('/foley-'))names.set(bytes,this.url.split('/').pop());return bytes;};
  const decode=BaseAudioContext.prototype.decodeAudioData;
  BaseAudioContext.prototype.decodeAudioData=async function(bytes,...args){
   const clip=await decode.call(this,bytes,...args);if(names.has(bytes))decoded.set(clip,names.get(bytes));return clip;};
  const start=AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start=function(...args){
   if(decoded.has(this.buffer)){window.foleyLog.push({file:decoded.get(this.buffer),state:this.context.state,offset:args[1]||0});
    window.activeFoley.add(this);this.addEventListener('ended',()=>window.activeFoley.delete(this));}
   return start.apply(this,args);};`});
 await cmd('Page.navigate',{url});await until(async()=>await ev("Boolean(document.querySelector('#enter:not([disabled])'))"),90000);


 assert.match(await ev('document.title'),/Hotel of Horror/);
 await ev("Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Hide review tools').click()");
 const button=await ev("(()=>{const r=document.querySelector('#enter').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
 await cmd('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...button});
 await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...button});
 await until(async()=>(await diag()).road?.time>.4);
 await press('Escape');await until(async()=>(await diag()).mode==='paused');
 await until(async()=>await ev('window.activeFoley.size')===0);await hit('resume');
 await until(async()=>await ev("window.foleyLog.some(e=>e.file==='engine.mp3'&&e.offset>0)"));
 await ev("document.getElementById('sound').click()");await until(async()=>await ev('window.activeFoley.size')===0);
 await ev("document.getElementById('sound').click()");
 for(const [name,t] of [['highway',2.76],['flat',4.9],['unlatch',7.64],['pivot',8.94],['plant',10.38],['stand',12.1],['close',13.4],['silhouette',16.0],['sign',19.77],['approach',22.3],['latch',24.05],['door',25.74],['threshold',27.62]]){
  await until(async()=>(await diag()).road?.time>=t);await shot(name);
  if(name==='flat'){await press('Escape');await until(async()=>(await diag()).mode==='paused');const time=(await diag()).road.time;await sleep(650);assert.equal((await diag()).road.time,time);await hit('resume');}
 }
 await until(async()=>(await diag()).arrival?.beat===0);await shot('receptionist');
 await until(async()=>(await diag()).arrival?.beat===1);assert.match(await ev("document.querySelector('#caption').textContent"),/LIFT OUT OF ORDER/);
 await press('e');await until(async()=>(await diag()).arrival===null);await walk('w',d=>d.guestY>7.8);await press('e');await until(async()=>(await diag()).room==='landing');
 await hit('restart');await until(async()=>(await diag()).road!=null);await press('e');await until(async()=>{const d=await diag();return !d.road&&d.arrival!=null;});await press('e');await until(async()=>(await diag()).arrival===null);
 if((await diag()).build==='v28'){
  const played=file=>ev("window.foleyLog.some(e=>e.file==="+JSON.stringify(file)+")");
  for(const [id,file] of [['C2','lid.mp3'],['N-C5','catch.mp3']]){
   await select('review-encounter',id);await hit('resume');await until(()=>played(file));
  }
  for(let i=1;i<=2;i++){
   await select('review-encounter','C1');await hit('resume');await sleep(1150);
   await walk('s',d=>d.progress===i);await until(async()=>!(await diag()).pending);await sleep(500);
  }
  assert.equal((await diag()).room,'claim');await press('e');await until(()=>played('case.mp3'));
  await until(async()=>await ev('window.activeFoley.size')===0);
  assert.ok(await played('sleeve.mp3'));
 }
 const events=await ev('window.foleyLog');const clips=[...new Set(events.map(e=>e.file))];
 for(const clip of ['engine','car-open','car-close','metalLatch','creak1','footstep00','footstep03','footstep06'])assert.ok(clips.includes(clip+'.mp3'),clip);
 assert.ok(events.some(e=>e.state==='running'));assert.equal(await ev('window.activeFoley.size'),0);
 assert.equal(errors.length,0);
 await writeFile(new URL('opening-result.json',dir),JSON.stringify({status:'passed',pause:true,skip:true,arrival:true,exitToLanding:true,mute:true,clips,events,errors},null,2));
}finally{clearTimeout(safety);await cmd('Browser.close',{},undefined).catch(()=>{});browser.kill();}
