import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,access} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const dir=new URL(process.argv.includes('--recorded')?'./T4-v16-recorded/':process.argv.includes('--repeat')?'./T4-v16-repeat/':'./',import.meta.url);
const url=process.argv[2];if(!url||!url.endsWith('.vercel.app/?review=1'))throw Error('Supply fixed review deployment');
const exe=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const tmp=await mkdtemp(path.join(os.tmpdir(),'room0-qa-'));
const browser=spawn(exe,[...(process.argv.includes('--recorded')?['--headless=new']:[]),'--window-position=20,15','--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-first-run','--no-default-browser-check','--window-size=1280,820','--remote-debugging-pipe','--user-data-dir='+tmp,'about:blank'],{windowsHide:false,stdio:['ignore','ignore','ignore','pipe','pipe']});
let counter=0,buf=Buffer.alloc(0),sid;const pending=new Map(),errors=[];
browser.stdio[4].on('data',v=>{buf=Buffer.concat([buf,v]);let end;while((end=buf.indexOf(0))>=0){const m=JSON.parse(buf.subarray(0,end).toString());buf=buf.subarray(end+1);if(m.id){const p=pending.get(m.id);if(!p)continue;pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);}});
function cmd(method,params={},sessionId=sid){const id=++counter;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});browser.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0');});}
const sleep=n=>new Promise(r=>setTimeout(r,n));
const ev=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.exception?.description||v.exceptionDetails.text);return v.result.value;};
const diag=()=>ev("JSON.parse(document.getElementById('diagnostics').textContent||'{}')");
async function until(f,max=55000){const start=Date.now();for(;;){if(errors.length)throw Error(errors.join('\n'));const v=await f();if(v)return v;if(Date.now()-start>max)throw Error('Timed out: '+f+' '+JSON.stringify(await diag()));await sleep(110);}}

const events=[],frames=[];let capturing=false,recording,start;
const log=event=>events.push({seconds:+((performance.now()-start)/1000).toFixed(3),event});
const write=async (file,bytes)=>writeFile(new URL('T4-v16-'+file,dir),bytes);
async function capture(){
 while(capturing){
  const at=performance.now();
  const image=await cmd('Page.captureScreenshot',{format:'jpeg',quality:82});
  const name='frame-'+String(frames.length).padStart(5,'0')+'.jpg';
  await writeFile(path.join(tmp,name),Buffer.from(image.data,'base64'));frames.push({at,name});await sleep(76);
 }
}
async function keyStroke(key,code,vk,ms=65){
 const data={key,code,windowsVirtualKeyCode:vk};
 await cmd('Input.dispatchKeyEvent',{...data,type:'keyDown'});await sleep(ms);await cmd('Input.dispatchKeyEvent',{...data,type:'keyUp'});
}
async function save(name){
 const d=await diag();await write(name+'.json',JSON.stringify(d,null,2));
 const {data}=await cmd('Page.captureScreenshot',{format:'jpeg',quality:90});await write(name+'.jpg',Buffer.from(data,'base64'));return d;
}
const file=new URL('T4-v16-out-of-scope.mp4',dir);
try {
 try{await access(file);throw Error('Existing formal recording');}catch(e){if(e.code!=='ENOENT')throw e;}
 const {targetInfos}=await cmd('Target.getTargets');sid=(await cmd('Target.attachToTarget',{targetId:targetInfos.find(t=>t.type==='page').targetId,flatten:true})).sessionId;
 await cmd('Runtime.enable');await cmd('Page.enable');await cmd('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await cmd('Page.navigate',{url});await cmd('Page.bringToFront');
 await until(async()=>await ev("Boolean(document.querySelector('#enter:not([disabled])'))"),110000);
 assert.equal(await ev('document.body.dataset.build'),'v16');
 start=performance.now();capturing=true;recording=capture();log('Continuous game-window capture started');
 await sleep(1000);await ev("document.getElementById('enter').click()");
 await ev("(()=>{const s=document.querySelector('#review-encounter');s.value='N-C1';s.dispatchEvent(new Event('change'));})()");
 await ev("document.getElementById('resume').click()");log('Entered, selected normal butler, resumed');
 await sleep(1100);await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
 await until(async()=>(await diag()).guestY>14);await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW',windowsVirtualKeyCode:87});await sleep(700);
 const before=await save('before');assert.equal(before.butlerVisible,true);assert.equal(before.anomaly,null);log('Stopped before decision line');
 await keyStroke('f','KeyF',70,3000);log('Held F for three seconds');
 for(let i=0;i<3;i++){await keyStroke(' ','Space',32);await sleep(140);}log('Pressed Space three times');
 await cmd('Page.bringToFront');if((await diag()).mode==='paused'){await ev("document.querySelector('#resume').click()");log('Resumed after focus loss');await sleep(650);}
 const point=await ev(`(async()=>{
  const THREE=await import('three'),meta=await (await fetch('assets/hotel-v15.json')).json();
  const shot=meta.cameras[JSON.parse(document.getElementById('diagnostics').textContent).view];
  const camera=new THREE.PerspectiveCamera(shot.fov,16/9,.05,100);
  camera.position.fromArray(shot.position);camera.lookAt(new THREE.Vector3(...shot.target));camera.zoom=1.18;camera.updateProjectionMatrix();camera.updateMatrixWorld();
  const chest=new THREE.Vector3(-.94,1.18,-18.6).project(camera),r=document.querySelector('#world').getBoundingClientRect();
  return {x:r.left+(chest.x+1)*r.width/2,y:r.top+(1-chest.y)*r.height/2};
 })()`);await write('click-point.json',JSON.stringify(point));
 for(let i=0;i<3;i++){for(const type of ['mousePressed','mouseReleased'])await cmd('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:'left',clickCount:1});await sleep(200);}log('Clicked ordinary butler three times');
 await sleep(900);await save('after-attempts');await keyStroke('s','KeyS',83,2000);await sleep(350);await keyStroke('Escape','Escape',27);await sleep(600);
 const end=await save('after-pause');assert.equal(end.mode,'paused');assert.ok(end.guestY<before.guestY-.5);assert.equal(end.progress,0);assert.equal(end.contacts,0);assert.equal(end.active,false);log('Walked backward two seconds and paused');await sleep(1400);
}finally{
 capturing=false;if(recording)await recording;
 if(frames.length){
  const fslist=frames.map(({at,name},i)=>"file '"+name+"'\nduration "+(((frames[i+1]?.at??performance.now())-at)/1000).toFixed(4)).join('\n');
  await writeFile(path.join(tmp,'frames.txt'),fslist+"\nfile '"+frames.at(-1).name+"'\n");
  const {fileURLToPath}=await import('node:url');
  const encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-f','concat','-safe','1','-i',path.join(tmp,'frames.txt'),'-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2','-r','15','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart','-n',fileURLToPath(file)],{windowsHide:true,stdio:'inherit'});
  const code=await new Promise(r=>encoder.once('exit',r));if(code)process.exitCode=1;
  await write('events.json',JSON.stringify({url,operator:'Codex',capturedFrames:frames.length,audio:false,errors,events},null,2));
 }
 await cmd('Browser.close').catch(()=>{});browser.kill();
}
