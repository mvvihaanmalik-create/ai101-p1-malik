// Developer checks only. Drives an isolated Chrome using its debugging pipe, public keys and visible review UI.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const finale=process.argv.includes('--ending'),reduced=process.argv.includes('--reduced');
const showcase=process.argv.includes('--motion');
const dir=new URL('./',import.meta.url);
import {fileURLToPath} from 'node:url';
const frameFile=n=>fileURLToPath(new URL(n,dir));
const url=process.argv[2]||'http://127.0.0.1:4170/?review=1';
const exe=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const tmp=await mkdtemp(path.join(os.tmpdir(),'room0-qa-'));
const browser=spawn(exe,['--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-first-run','--no-default-browser-check','--window-size=1280,820','--autoplay-policy=no-user-gesture-required','--remote-debugging-pipe','--user-data-dir='+tmp,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','ignore','pipe','pipe']});
let counter=0,buf=Buffer.alloc(0),sid;const pending=new Map(),errors=[];
browser.stdio[4].on('data',v=>{buf=Buffer.concat([buf,v]);let end;while((end=buf.indexOf(0))>=0){const m=JSON.parse(buf.subarray(0,end).toString());buf=buf.subarray(end+1);if(m.id){const p=pending.get(m.id);if(!p)continue;pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Page.screencastFrame'){onFrame(m.params);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);}});
function cmd(method,params={},sessionId=sid){const id=++counter;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});browser.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0');});}
const sleep=n=>new Promise(r=>setTimeout(r,n));
const ev=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.exception?.description||v.exceptionDetails.text);return v.result.value;};
const diag=()=>ev("JSON.parse(document.getElementById('diagnostics').textContent||'{}')");
async function until(f,max=55000){const start=Date.now();for(;;){if(errors.length)throw Error(errors.join('\n'));const v=await f();if(v)return v;if(Date.now()-start>max)throw Error('Timed out: '+f+' '+JSON.stringify(await diag()));await sleep(110);}}

// Capture the game tab's compositor, including captions, puzzle UI and end card.
const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','30','-vcodec','mjpeg','-i','pipe:0','-c:v','libx264','-threads','4','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',frameFile('walk-video.mp4')],{windowsHide:true,stdio:['pipe','ignore','inherit']});
const encoded=new Promise(resolve=>ff.on('close',resolve));
let initialTime=null,frames=0,latest=null,live=false,unique=0;
function outputUntil(timestamp){
 const target=Math.round((timestamp-initialTime)*30);
 if(target>30*600)throw Error('Invalid capture clock');
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
 const d=await diag();events.push({label,time:+(frames/30).toFixed(2),room:d.room,score:d.progress,errors:d.errors});
 console.log(label,d.room,d.progress);
 await writeFile(frameFile('walkthrough-checkpoints.json'),JSON.stringify(events,null,2));
}
async function key(k,down){const vk=k==='Escape'?27:k.toUpperCase().charCodeAt(0);
 await cmd('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key:k,code:k==='Escape'?'Escape':'Key'+k.toUpperCase(),windowsVirtualKeyCode:vk});}
async function press(k){await key(k,true);await sleep(65);await key(k,false);}
async function walk(k,pred){await key(k,true);try{await until(async()=>pred(await diag()),65000);}finally{await key(k,false);}await sleep(220);}
async function enterRoom(name){await until(async()=>{const d=await diag();return d.room===name&&!d.pending;});await sleep(950);}
async function inspect(){
 await press('e');await until(async()=>(await diag()).detail);await sleep(1600);
 await press('e');await until(async()=>!(await diag()).detail);
}
try{
 const {targetInfos}=await cmd('Target.getTargets');sid=(await cmd('Target.attachToTarget',{targetId:targetInfos.find(t=>t.type==='page').targetId,flatten:true})).sessionId;
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
 // Copy the game's actual Web Audio master and music buses to a recording track.
 // Capture the game's music and effects from its existing audio graph.
 await cmd('Page.addScriptToEvaluateOnNewDocument',{source:`
 const connect=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(dest,...args){
  const ok=connect.call(this,dest,...args);
  if(dest===this.context.destination){
   if(!window.gameAudio){
    const tap=this.context.createMediaStreamDestination();
    const rec=new MediaRecorder(tap.stream,{mimeType:'audio/webm;codecs=opus'});
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
 const point=await ev("(()=>{const r=document.querySelector('#enter').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
 await cmd('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});

 await cmd('Page.bringToFront');
 live=true;await cmd('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:1280,maxHeight:720,everyNthFrame:1});
 await until(async()=>latest!==null);
 const select=(id,value)=>ev("(()=>{const s=document.getElementById("+JSON.stringify(id)+");s.value="+JSON.stringify(value)+";s.dispatchEvent(new Event('change'));})()");
 const checkpoints=[];
 async function checkpoint(label){
  const d=await diag();checkpoints.push({label,...d});
  await writeFile(frameFile('T3-events.json'),JSON.stringify(checkpoints,null,2));
  const {data}=await cmd('Page.captureScreenshot',{format:'jpeg',quality:90});
  await writeFile(frameFile(label+'.jpg'),Buffer.from(data,'base64'));
  console.log(label,JSON.stringify({build:d.build,mode:d.mode,room:d.room,detail:d.detail,x:d.guestX,z:d.guestY,score:d.progress,errors:d.errors}));
  return d;
 }
 await until(async()=>(await diag()).road!=null);await press('e');
 await select('review-encounter','orientation');await ev("document.getElementById('resume').click()");
 await sleep(1500);
 await walk('w',d=>d.room==='pantry');await sleep(1500);await walk('w',d=>d.guestY>4.4);
 await sleep(16000);const initial=await checkpoint('01-before-inspection');
 await press('e');await until(async()=>(await diag()).detail);await sleep(16000);
 await key('w',true);await key('d',true);await sleep(3000);await key('w',false);await key('d',false);
 await checkpoint('02-inspection-after-WD');await sleep(18000);
 await press('e');await until(async()=>!(await diag()).detail);await checkpoint('03-inspection-closed');
 await press('Escape');await sleep(600);await key('w',true);await sleep(3000);await key('w',false);await sleep(2000);
 await checkpoint('04-paused-after-W');await sleep(14000);
 await ev("document.getElementById('resume').click()");await sleep(5000);await checkpoint('05-resumed-idle');
 await sleep(10000);for(let i=0;i<5;i++){await key('e',true);await key('e',false);}
 await sleep(1000);await checkpoint('06-five-E');await sleep(18000);
 if((await diag()).detail)await press('e');
 await key('w',true);await sleep(2000);await key('w',false);await sleep(700);
 await checkpoint('07-final-walk');await sleep(20000);
 await press('Escape');await checkpoint('08-feedback-pause');await sleep(10000);
 const end=await ev('(performance.timeOrigin+performance.now())/1000');live=false;outputUntil(end);await cmd('Page.stopScreencast');
 ff.stdin.end();assert.equal(await encoded,0);const audio=await ev("window.gameAudio.rec.stop();window.gameAudio.result");
 await writeFile(frameFile('walk-audio.webm'),Buffer.from(audio,'base64'));
 const offset=await ev('window.gameAudio.start')-initialTime;
 const mux=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',frameFile('walk-video.mp4'),'-ss',String(Math.max(0,-offset)),'-i',frameFile('walk-audio.webm'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-movflags','+faststart',frameFile('T3-unexpected-input.mp4')],{windowsHide:true,stdio:'inherit'});
 assert.equal(await new Promise(resolve=>mux.on('close',resolve)),0);
 await writeFile(frameFile('capture.json'),JSON.stringify({frames,unique,offset,errors},null,2));assert.equal(errors.length,0);
}finally{
 live=false;if(!ff.stdin.writableEnded)ff.stdin.end();await cmd('Browser.close',{},undefined).catch(()=>{});browser.kill();
}


