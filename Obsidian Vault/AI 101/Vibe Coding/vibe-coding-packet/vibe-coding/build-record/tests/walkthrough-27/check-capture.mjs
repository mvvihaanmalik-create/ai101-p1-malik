// Developer checks only. Drives an isolated Chrome using its debugging pipe, public keys and visible review UI.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const qaMode='title';const dir=new URL('../../build-record/tests/walkthrough-27/',import.meta.url);
const url=process.argv[2]||'http://127.0.0.1:4170/?review=1';
const exe=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const tmp=await mkdtemp(path.join(os.tmpdir(),'room0-qa-'));
const browser=spawn(exe,['--headless=new','--auto-accept-this-tab-capture','--autoplay-policy=no-user-gesture-required','--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-first-run','--no-default-browser-check',qaMode.startsWith('visual')?'--window-size=1920,1200':'--window-size=1280,820','--remote-debugging-pipe','--user-data-dir='+tmp,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','ignore','pipe','pipe']});
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

try {
 const {targetInfos}=await cmd('Target.getTargets');
 sid=(await cmd('Target.attachToTarget',{targetId:targetInfos.find(t=>t.type==='page').targetId,flatten:true})).sessionId;
 await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Page.navigate',{url});
 await until(async()=>await ev('document.title.includes("Hotel of Horror")'));
 console.log(await ev(`Promise.race([navigator.mediaDevices.getDisplayMedia({preferCurrentTab:true,video:{width:1280,height:720,frameRate:30,displaySurface:'browser'},audio:true}).then(s=>{const l=s.getTracks().map(t=>[t.kind,t.label,t.getSettings().displaySurface]);s.getTracks().forEach(t=>t.stop());return l;}).catch(e=>String(e)),new Promise(r=>setTimeout(()=>r("capture timeout"),8000))])`));
}finally{clearTimeout(safety);await cmd('Browser.close',{},undefined).catch(()=>{});browser.kill();}
