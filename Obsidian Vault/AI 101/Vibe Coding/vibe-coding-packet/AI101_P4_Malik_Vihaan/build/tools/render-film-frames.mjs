// Developer checks only. Drives an isolated Chrome using its debugging pipe, public keys and visible review UI.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const finale=process.argv.includes('--ending'),reduced=process.argv.includes('--reduced');
const showcase=process.argv.includes('--motion');
const dir=new URL('../../build-record/walkthrough-tv-final/',import.meta.url);
import {fileURLToPath} from 'node:url';
const frameFile=n=>fileURLToPath(new URL(n,dir));
const url=process.argv[2]||'http://127.0.0.1:4170/?review=1';
const exe=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const tmp=await mkdtemp(path.join(os.tmpdir(),'room0-qa-'));
const browser=spawn(exe,['--headless=new','--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-first-run','--no-default-browser-check','--window-size=2560,1520','--autoplay-policy=no-user-gesture-required','--remote-debugging-pipe','--user-data-dir='+tmp,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','ignore','pipe','pipe']});
let counter=0,buf=Buffer.alloc(0),sid;const pending=new Map(),errors=[];
browser.stdio[4].on('data',v=>{buf=Buffer.concat([buf,v]);let end;while((end=buf.indexOf(0))>=0){const m=JSON.parse(buf.subarray(0,end).toString());buf=buf.subarray(end+1);if(m.id){const p=pending.get(m.id);if(!p)continue;pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);}});
function cmd(method,params={},sessionId=sid){const id=++counter;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});browser.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0');});}
const sleep=n=>new Promise(r=>setTimeout(r,n));
const ev=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.exception?.description||v.exceptionDetails.text);return v.result.value;};
const diag=()=>ev("JSON.parse(document.getElementById('diagnostics').textContent||'{}')");
async function until(f,max=55000){const start=Date.now();for(;;){if(errors.length)throw Error(errors.join('\n'));const v=await f();if(v)return v;if(Date.now()-start>max)throw Error('Timed out: '+f+' '+JSON.stringify(await diag()));await sleep(110);}}


const kind=process.argv[3],first=kind==='opening'?0:4.8;
const count=kind==='opening'?1770:Math.round((27.2-first)*30);
const video=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','image2pipe','-framerate','30','-vcodec','mjpeg','-i','pipe:0','-pix_fmt','nv12','-c:v','hevc_mf','-hw_encoding','1','-b:v','34M','-g','60','-tag:v','hvc1',frameFile(kind+'-film.mp4')],{stdio:['pipe','ignore','inherit'],windowsHide:true});
const done=new Promise(resolve=>video.on('close',resolve));
try{
 const targets=await cmd('Target.getTargets');
 sid=(await cmd('Target.attachToTarget',{targetId:targets.targetInfos.find(t=>t.type==='page').targetId,flatten:true})).sessionId;
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:1376,height:774,deviceScaleFactor:3840/1376,mobile:false});
 await cmd('Page.navigate',{url});await until(async()=>await ev("typeof window.drawFilm==='function'"),120000);
 await ev("document.head.insertAdjacentHTML('beforeend','<style>#talk-staff,#staff-dialog{display:none!important}*{cursor:none!important}</style>')");
 await ev('window.startFilm('+JSON.stringify(kind)+')');await sleep(200);
 for(let i=0;i<count;i++){
  const mode=await ev('window.drawFilm('+(first+i/30)+')');
  const {data}=await cmd('Page.captureScreenshot',{format:'jpeg',quality:94,fromSurface:true,optimizeForSpeed:true});
  const bytes=Buffer.from(data,'base64');
  if(i===6||i===Math.floor(count*.52))await writeFile(frameFile(kind+'-'+i+'.jpg'),bytes);
  if(!video.stdin.write(bytes))await new Promise(resolve=>video.stdin.once('drain',resolve));
  if(i%150===0)console.log(kind,i,'/',count,mode);
 }
 video.stdin.end();assert.equal(await done,0);assert.equal(errors.length,0);
}finally{if(!video.stdin.writableEnded)video.stdin.end();browser.kill();}
