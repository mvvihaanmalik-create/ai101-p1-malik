// Developer checks only. Drives an isolated Chrome using its debugging pipe, public keys and visible review UI.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const finale=process.argv.includes('--ending'),reduced=process.argv.includes('--reduced');
const showcase=process.argv.includes('--motion');
const dir=new URL('../../build-record/walkthrough-43/',import.meta.url);
import {fileURLToPath} from 'node:url';
const frameFile=n=>fileURLToPath(new URL(n,dir));
const url=process.argv[2]||'http://127.0.0.1:4170/?review=1';
const exe=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const tmp=await mkdtemp(path.join(os.tmpdir(),'room0-qa-'));
const browser=spawn(exe,['--headless=new','--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-first-run','--no-default-browser-check','--window-size=2560,1520','--autoplay-policy=no-user-gesture-required','--remote-debugging-pipe','--user-data-dir='+tmp,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','ignore','pipe','pipe']});
let counter=0,buf=Buffer.alloc(0),sid;const pending=new Map(),errors=[];
browser.stdio[4].on('data',v=>{buf=Buffer.concat([buf,v]);let end;while((end=buf.indexOf(0))>=0){const m=JSON.parse(buf.subarray(0,end).toString());buf=buf.subarray(end+1);if(m.id){const p=pending.get(m.id);if(!p)continue;pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Page.screencastFrame'){onFrame(m.params);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);}});
function cmd(method,params={},sessionId=sid){const id=++counter;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});browser.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0');});}
const sleep=n=>new Promise(r=>setTimeout(r,n));
const ev=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.exception?.description||v.exceptionDetails.text);return v.result.value;};
const diag=()=>ev("JSON.parse(document.getElementById('diagnostics').textContent||'{}')");
async function until(f,max=55000){const start=Date.now();for(;;){if(errors.length)throw Error(errors.join('\n'));const v=await f();if(v)return v;if(Date.now()-start>max)throw Error('Timed out: '+f+' '+JSON.stringify(await diag()));await sleep(110);}}

// Capture the game tab's compositor, including captions, puzzle UI and end card.
const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','24','-vcodec','mjpeg','-i','pipe:0','-c:v','libx264','-threads','8','-preset','ultrafast','-crf','15','-pix_fmt','yuv420p',frameFile('walk-video.mp4')],{windowsHide:true,stdio:['pipe','ignore','inherit']});
const encoded=new Promise(resolve=>ff.on('close',resolve));
let initialTime=null,frames=0,latest=null,live=false,unique=0;
function outputUntil(timestamp){
 const target=Math.round((timestamp-initialTime)*24);
 if(target>24*3600)throw Error('Invalid capture clock');
 while(frames<target){ff.stdin.write(latest);frames++;}
}
function onFrame({data,metadata,sessionId}){
 cmd('Page.screencastFrameAck',{sessionId}).catch(()=>{});
 if(!live)return;
 const t=metadata.timestamp;if(initialTime===null)initialTime=t;
 if(latest)outputUntil(t);
 latest=Buffer.from(data,'base64');unique++;
}
const events=[];
async function mark(label){
 const d=await diag();events.push({label,time:+(frames/24).toFixed(2),room:d.room,score:d.progress,errors:d.errors});
 console.log(label,d.room,d.progress);
 await writeFile(frameFile('walkthrough-checkpoints.json'),JSON.stringify(events,null,2));
}
async function key(k,down){const vk=k==='Escape'?27:k.toUpperCase().charCodeAt(0);
 await cmd('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key:k,code:k==='Escape'?'Escape':'Key'+k.toUpperCase(),windowsVirtualKeyCode:vk});}
async function press(k){await key(k,true);await sleep(65);await key(k,false);}
async function walk(k,pred){await key(k,true);try{await until(async()=>pred(await diag()),65000);}finally{await key(k,false);}await sleep(220);}
async function enterRoom(name){await until(async()=>{const d=await diag();return d.room===name&&!d.pending;});await sleep(950);}
async function inspect(){
 await press('e');await until(async()=>(await diag()).detail);await sleep((await diag()).detail==='bar'?6000:3200);
 await press('e');await until(async()=>!(await diag()).detail);
}
try{
 const {targetInfos}=await cmd('Target.getTargets');sid=(await cmd('Target.attachToTarget',{targetId:targetInfos.find(t=>t.type==='page').targetId,flatten:true})).sessionId;
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:2560,height:1440,deviceScaleFactor:1,mobile:false});
 // Copy the game's actual Web Audio master and music buses to a recording track.
 // Capture the game's music and effects from its existing audio graph.
 await cmd('Page.addScriptToEvaluateOnNewDocument',{source:`
 const connect=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(dest,...args){
  const ok=connect.call(this,dest,...args);
  if(dest===this.context.destination&&this.context instanceof AudioContext){
   if(!window.gameAudio){
    const tap=this.context.createMediaStreamDestination();
    const rec=new MediaRecorder(tap.stream,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:256000});
    const chunks=[];rec.ondataavailable=e=>chunks.push(e.data);
    const result=new Promise(resolve=>rec.onstop=()=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result.split(',')[1]);fr.readAsDataURL(new Blob(chunks));});
    window.gameAudio={tap,rec,result,start:(performance.timeOrigin+performance.now())/1000};rec.start(500);
   }
   connect.call(this,window.gameAudio.tap);
  }return ok;
 };`});
 if(reduced)await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await cmd('Page.navigate',{url});await until(async()=>await ev("!!document.querySelector('#enter:not([disabled])')"),120000);
 await ev("Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Hide review tools').click()");
 await ev("document.documentElement.style.cursor='none';document.head.insertAdjacentHTML('beforeend','<style>*{cursor:none!important}</style>')");live=true;await cmd('Page.startScreencast',{format:'jpeg',quality:94,maxWidth:2560,maxHeight:1440,everyNthFrame:1});
 await until(async()=>latest!==null);await sleep(1600);await mark('Title');
 await ev("document.querySelector('#enter').click()");
 await until(async()=>(await diag()).road!=null);await mark('Desert highway');
 await until(async()=>{const d=await diag();return !d.road&&!d.arrival&&d.music.mode==='hotel';},140000);await mark('Checked in');
 await walk('w',d=>d.guestY>7.85);await press('e');await enterRoom('landing');
 await walk('d',d=>d.guestX>60.2);await walk('w',d=>d.room==='pantry');await enterRoom('pantry');
 for(const [room,next] of [['pantry','lounge'],['lounge','baggage'],['baggage','bathroom'],['bathroom','corridor']]){
  await walk('w',d=>d.guestY>4.32);await inspect();await mark(room+' encounter');
  await walk('w',d=>d.room===next);await enterRoom(next);
 }
 await walk('w',d=>d.guestY>11.6);await inspect();await mark('Gallery butler');
 await walk('w',d=>d.room==='stairs');await enterRoom('stairs');
 await walk('w',d=>d.guestY>6.1);await inspect();await mark('Children on stair landing');
 await walk('w',d=>d.stairKind==='kennel');await sleep(1350);await walk('w',d=>d.guestY>6.1);await inspect();await mark('Beau on the next landing');
 await walk('w',d=>d.room==='landing');await enterRoom('landing');
 for(let i=1;i<=12;i++){
  const id=(await diag()).anomaly;
  if(id==='E3'){
   await walk('w',d=>d.guestY>6.9);await walk('a',d=>d.guestX<59.55);await inspect();
  }else{
   if(['C3','C4','E5'].includes(id)){await walk('w',d=>d.guestY>4.4);await press('e');await enterRoom('stairs');}
   else{await walk('d',d=>d.guestX>60.2);await walk('w',d=>d.room!=='landing');await sleep(1200);}
   const d=await diag();const at=d.room==='stairs'?6.2:d.room==='corridor'?({C1:11.4,E1:7.5,E2:12.2,E6:11.2}[id]):4.5;
   await walk('w',s=>s.guestY>=at);
   if(id==='E1'||id==='E2')await walk(id==='E2'?'d':'a',s=>id==='E2'?s.guestX>.78:s.guestX<-.72);
   await inspect();
  }
  await walk('s',d=>d.history.filter(h=>h.kind==='correct').length>=i);
  await mark('Sighting '+i+' '+id);
  await until(async()=>!(await diag()).pending);await sleep(850);
  if((await diag()).room==='claim'){
   const c=(await diag()).claim;const n=c.order.indexOf(c.target);
   for(let step=0;step<n;step++){await press('d');await sleep(450);}
   await press('e');await sleep(1500);await press('e');await until(async()=>(await diag()).claim?.solved);
   await mark('Luggage claim');await until(async()=>(await diag()).claim?.open>=.95);await press('e');await enterRoom('stairs');
  }
  const dest=i===12?'suite':'landing';
  if((await diag()).room==='stairs')await walk('w',s=>s.room===dest);
  await enterRoom(dest);
 }
 await walk('w',d=>d.suiteApproach||d.mode==='ending');await until(async()=>(await diag()).mode==='ending');await mark('Honeymoon suite');
 await until(async()=>(await diag()).mode==='end',240000);await mark('End card');await sleep(2600);
 const end=await ev('(performance.timeOrigin+performance.now())/1000');live=false;outputUntil(end);await cmd('Page.stopScreencast');
 ff.stdin.end();assert.equal(await encoded,0);const audio=await ev("window.gameAudio.rec.stop();window.gameAudio.result");
 await writeFile(frameFile('walk-audio.webm'),Buffer.from(audio,'base64'));
 const offset=await ev('window.gameAudio.start')-initialTime;
 const mux=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',frameFile('walk-video.mp4'),'-itsoffset',String(offset),'-i',frameFile('walk-audio.webm'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-movflags','+faststart',frameFile(finale?'No departures.mp4':showcase?'Motion and sound.mp4':'Hotel of Horror - Walkthrough.mp4')],{windowsHide:true,stdio:'inherit'});
 assert.equal(await new Promise(resolve=>mux.on('close',resolve)),0);
 await writeFile(frameFile('capture.json'),JSON.stringify({frames,unique,offset,errors},null,2));assert.equal(errors.length,0);
}finally{
 live=false;if(!ff.stdin.writableEnded)ff.stdin.end();await cmd('Browser.close',{},undefined).catch(()=>{});browser.kill();
}
