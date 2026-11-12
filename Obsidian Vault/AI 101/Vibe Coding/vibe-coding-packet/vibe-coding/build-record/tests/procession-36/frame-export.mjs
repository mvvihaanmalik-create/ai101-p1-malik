// Developer checks only. Drives an isolated Chrome using its debugging pipe, public keys and visible review UI.
import {once} from 'node:events';
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
const browser=spawn(exe,['--headless=new','--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-first-run','--no-default-browser-check','--window-size=1920,1180','--autoplay-policy=no-user-gesture-required','--remote-debugging-pipe','--user-data-dir='+tmp,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','ignore','pipe','pipe']});
let counter=0,buf=Buffer.alloc(0),sid;const pending=new Map(),errors=[];
browser.stdio[4].on('data',v=>{buf=Buffer.concat([buf,v]);let end;while((end=buf.indexOf(0))>=0){const m=JSON.parse(buf.subarray(0,end).toString());buf=buf.subarray(end+1);if(m.id){const p=pending.get(m.id);if(!p)continue;pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);}});
function cmd(method,params={},sessionId=sid){const id=++counter;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});browser.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0');});}
const sleep=n=>new Promise(r=>setTimeout(r,n));
const ev=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.exception?.description||v.exceptionDetails.text);return v.result.value;};
const diag=()=>ev("JSON.parse(document.getElementById('diagnostics').textContent||'{}')");
async function until(f,max=55000){const start=Date.now();for(;;){if(errors.length)throw Error(errors.join('\n'));const v=await f();if(v)return v;if(Date.now()-start>max)throw Error('Timed out: '+f+' '+JSON.stringify(await diag()));await sleep(110);}}


const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate','30','-vcodec','mjpeg','-i','pipe:0','-c:v','libx264','-threads','4','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',frameFile('timed-video.mp4')],{windowsHide:true,stdio:['pipe','ignore','inherit']});
const encoded=once(ff,'close');
try{
 const {targetInfos}=await cmd('Target.getTargets');sid=(await cmd('Target.attachToTarget',{targetId:targetInfos.find(t=>t.type==='page').targetId,flatten:true})).sessionId;
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
 await cmd('Page.navigate',{url});await until(async()=>await ev("!!document.querySelector('#enter:not([disabled])')"),120000);
 await ev("document.getElementById('enter').click()");
 for(let i=0;i<3360;i++){
  await ev('window.renderHotelFrame('+i+')');
  if(errors.length)throw Error(errors.join(' '));
  const {data}=await cmd('Page.captureScreenshot',{format:'jpeg',quality:94,optimizeForSpeed:true});
  if(!ff.stdin.write(Buffer.from(data,'base64')))await once(ff.stdin,'drain');
  if(i%300===0)console.log('Rendered',i,'of 3360');
 }
 ff.stdin.end();if((await encoded)[0]!==0)throw Error('Encoder exited early');
}finally{if(!ff.stdin.writableEnded)ff.stdin.end();await cmd('Browser.close',{},undefined).catch(()=>{});browser.kill();}
