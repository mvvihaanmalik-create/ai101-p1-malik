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
 if(mode.startsWith('visual') && mode!=='visual-fallback'){
  for(const [name,t] of [['brakes',2.95],['tyre',4.8],['driver',10.2],['exterior',16],['entrance',25.45]]){
   await until(async()=>(await diag()).road?.time>=t);await shot(name);
  }
 }
 if(mode==='lighting'){
  for(const [name,t] of [['tyre',4.8],['hotel-road',16],['porch',24.4]]){await until(async()=>(await diag()).road?.time>=t);await shot(name);}
 }
 if(mode==='bath'){
  await until(async()=>(await diag()).road?.time>=16,100000);await shot('four-storey-exterior');
 }
 if((await diag()).road)await press('e');
 async function claimCheck(){
  await until(async()=>(await diag()).room==='claim');await sleep(900);
  const start=await diag(),{target,order}=start.claim;
  async function choose(index){
   while((await diag()).claim.active!==index){await press('d');await sleep(280);}
   await press('e');await sleep(1250);
  }
  await choose(order.findIndex(x=>x!==target));await press('e');await sleep(400);
  assert.equal((await diag()).progress,2);assert.equal((await diag()).claim.solved,false);
  assert.match(await ev("document.getElementById('caption').textContent"),/Wrong stamp/);
  await choose(order.indexOf(target));await shot('mirror-match');await press('Escape');await sleep(350);
  assert.equal((await diag()).mode,'paused');await hit('resume');await press('e');await sleep(1300);
  assert.equal((await diag()).claim.solved,true);
  assert.match(await ev("document.getElementById('claim-ticket').textContent"),/claimed yesterday/);
  await shot('porter-recognizes-case');
  await until(async()=>(await diag()).claim?.open>=.95);await shot('porter-opens-stair');await press('e');
  await until(async()=>(await diag()).room==='stairs');assert.equal((await diag()).progress,2);await record('claimed luggage and entered staff stair');
 }
 if(mode==='visual-fallback'){
  await cmd('Network.enable');await cmd('Network.setBlockedURLs',{urls:['*masters-v31/route-4-normal-v15.webp']});
  await select('review-room','landing');await hit('resume');
  await until(async()=>{const d=await diag();return d.room==='landing'&&d.visual?.failed.includes('route-4-normal-v15.webp');});
  const start=(await diag()).guestY;await walk('w',d=>d.room==='landing'&&d.guestY>start+.5);await shot('blocked-master-fallback');
  await select('review-room','reception');await hit('resume');await until(async()=>{const d=await diag();return d.room==='reception'&&d.visual.masterReady;});
  await record('blocked landing master kept controls; reception recovered native art');
 }
 if(mode==='story'||(mode.startsWith('visual')&&mode!=='visual-fallback')){
  const depth=(await diag()).guestY;
  await until(async()=>(await diag()).arrival?.beat===0);
  await until(async()=>(await diag()).guestY>depth+1);await shot('guest-at-counter');
  await until(async()=>(await diag()).arrival?.beat===1);
  assert.match(await ev("document.getElementById('caption').textContent"),/LIFT OUT OF ORDER/);
  await press('Escape');await sleep(400);const frozen=(await diag()).arrival.time;
  await sleep(700);assert.equal((await diag()).arrival.time,frozen);await hit('resume');
  await until(async()=>(await diag()).arrival?.beat===2);await shot('porter-directs-upstairs');
  await until(async()=>(await diag()).arrival===null);await walk('w',d=>d.guestY>7.8);await press('e');await until(async()=>(await diag()).room==='landing');
  await hit('restart');await until(async()=>(await diag()).road!=null);await press('e');await until(async()=>(await diag()).arrival!=null);await press('e');await until(async()=>(await diag()).arrival===null);
 }
 if(mode==='performance'){
  await select('review-encounter','orientation');await hit('resume');await sleep(900);await walk('w',d=>d.room==='pantry');await sleep(950);
  await walk('w',d=>d.guestY>4.5);await until(async()=>/plates are still warm/.test(await ev("document.getElementById('caption').textContent")));
  assert.equal((await diag()).socialFloor,0);await press('e');await sleep(650);await shot('ordinary-attendant');await record('ordinary tour greeting');
  for(let level=1;level<=4;level++){
   await select('review-encounter','N-C2');await hit('resume');await sleep(950);await walk('w',d=>d.guestY>4.4);
   assert.equal((await diag()).socialFloor,level);
   if(level===4){await until(async()=>/cold upstairs/.test(await ev("document.getElementById('caption').textContent")));await press('e');await sleep(850);await shot('fourth-attendant');}
   await record('ordinary pantry performance '+level);
   if(level<4){await select('review-encounter','C1');await hit('resume');await sleep(950);await walk('s',d=>d.progress===level);await until(async()=>!(await diag()).pending);}
  }
 }else if(mode==='finale'){
  await select('review-room','suite');await hit('resume');await sleep(900);await walk('w',d=>d.guestY>5.1);
  assert.equal((await diag()).suiteApproach,false);assert.equal((await diag()).music.mode,'hotel');
  await select('review-ending','suite');await hit('resume');await sleep(650);
  assert.equal((await diag()).music.mode,'hotel');
  await walk('w',d=>d.suiteApproach);await until(async()=>{const d=await diag();return d.music.finale.audible&&d.lyric.length>0;});await shot('approach');
  await press('Escape');await until(async()=>(await diag()).mode==='paused');const paused=(await diag()).music.finale.time;
  await sleep(650);assert.equal((await diag()).music.finale.time,paused);
  await hit('sound');await hit('resume');await until(async()=>{const d=await diag();return !d.music.finale.audible&&d.music.finale.time>paused+.35;});await hit('sound');
  for(const [time,label] of [[7.5,'reception'],[14.3,'night-man'],[20.7,'encircled'],[24.25,'strike']]){
   await until(async()=>(await diag()).music.finale.time>=time);const d=await diag();assert.equal(d.mode,'ending');assert.ok(d.lyric);assert.ok(d.music.finale.audible);await shot(label);await record(label);
  }
  await until(async()=>(await diag()).mode==='credits');await until(async()=>(await diag()).music.finale.time>30);await shot('title');
  assert.equal((await diag()).music.finale.audible,true);await press('Escape');await until(async()=>(await diag()).mode==='paused');
  const held=(await diag()).music.finale.time;await sleep(520);assert.equal((await diag()).music.finale.time,held);await hit('resume');
  for(const [time,label] of [[42,'credits'],[72,'sources'],[103,'tribute'],[109,'thanks']]){
   await until(async()=>(await diag()).music.finale.time>=time,70000);assert.equal((await diag()).mode,'credits');await shot(label);
   if(label==='tribute')assert.equal(await ev("document.getElementById('lynch-tribute').hidden"),false);
   if(label==='thanks')assert.equal(await ev("document.getElementById('dedication').hidden"),false);
  }
  await until(async()=>(await diag()).mode==='end');assert.equal((await diag()).lyric,'');assert.equal((await diag()).music.finale.audible,false);
  await hit('again');await until(async()=>(await diag()).road!=null);assert.equal((await diag()).music.mode,'hotel');assert.equal((await diag()).music.finale.time,0);
  await record('replay cleared cue and captions');
 }else if(mode==='lighting'){
  const ready=async()=>{await sleep(540);await until(async()=>{const d=await diag();return d.room==='bathroom'||d.visual.masterReady;});};
  for(const name of ['reception','landing','corridor','stairs','suite','pantry','baggage','lounge','bathroom']){
   await select('review-room',name);await hit('resume');await until(async()=>(await diag()).room===name);await ready();await shot(name);
  }
  for(const [encounter,detail] of [['N-C2','service'],['N-C5','bar'],['N-C6','luggage'],['N-E4','mirror'],['E4','mirror']]){
   await select('review-encounter',encounter);await select('review-detail',detail);await hit('resume');await ready();await shot(encounter+'-'+detail);
   if(encounter==='N-C5'&&(await diag()).build==='v31'){
    for(const [label,phase] of [['server-lifts',1.90],['glass-down',4.15],['bartender-lifts',6.86]]){
     await until(async()=>{const t=(await diag()).encounterMetrics.glassPhase;return t>=phase&&t<phase+.52;});await shot(label);
    }
   }
  }
  for(let i=1;i<=2;i++){await select('review-encounter','C1');await hit('resume');await sleep(1100);await walk('s',d=>d.progress===i);await until(async()=>!(await diag()).pending);}
  await claimCheck();
  await ev("document.querySelector('[aria-label=\"Hold ending frame\"]').click()");
  for(const name of ['arrival','bones','surround','final']){
   await select('review-ending',name);await until(async()=>(await diag()).ending?.held);await sleep(750);await shot('ending-'+name);
  }
  await record('all rooms, both washroom states, luggage puzzle and four ending shots');
 }else if(mode==='cast'){
  const studies={C1:'bell',C2:'service',C3:'children',C4:'dog',C5:'bar',C6:'luggage',E1:'portrait',E2:'rain',E3:'lift',E4:'mirror',E5:'coat',E6:'runner'};
  for(const [id,study] of Object.entries(studies))for(const changed of [false,true]){
   await select('review-encounter',(changed?'':'N-')+id);await select('review-detail',study);await hit('resume');
   await until(async()=>{const d=await diag();return d.focus===id&&d.detail&&d.mode==='playing'&&d.anomaly===(changed?id:null);});
   const observation=await ev("document.querySelector('#caption').textContent");
   assert.match(observation,changed?/Turn back/:/Continue onward/);
   assert.equal(await ev("getComputedStyle(document.querySelector('#caption')).visibility"),'visible');
   await record((changed?'changed ':'ordinary ')+id+' close-up and direction');
  }
 }else if(mode==='wing'||mode==='bath'){
  for(const [id,room,detail] of (mode==='bath'?[['E4','bathroom','mirror'],['C5','lounge','bar']]:[['C2','pantry','service'],['C5','lounge','bar'],['C6','baggage','luggage'],['E4','bathroom','mirror']])){
   for(const variant of ['N-'+id,id]){
    await select('review-encounter',variant);await hit('resume');await sleep(950);
    const d=await diag();assert.equal(d.room,room);assert.deepEqual(d.visibleCast,id==='E4'?[]:[id]);
    await walk('w',s=>s.guestY>(id==='E4'?5.25:4.35));
    if(id==='E4')await shot(room+'-wide-'+variant);
    if(id==='C5'&&variant==='N-C5')assert.match(await ev("document.getElementById('interaction').textContent"),/Ask for wine/);
    await press('e');await until(async()=>(await diag()).detail===detail);
    if(id==='E4'){
     await until(async()=>(await diag()).bathroom?.passes>1);
     const mirror=(await diag()).bathroom;assert.equal(mirror.clean,true);assert.equal(mirror.changed,variant===id);assert.equal(mirror.surfaces,2);
    }
    if(id==='C5'&&variant==='N-C5'){
     await until(async()=>(await diag()).wineTime>1.35);
     assert.match(await ev("document.getElementById('caption').textContent"),/spirit here since 1969/);
     assert.equal(await ev("getComputedStyle(document.getElementById('caption')).visibility"),'visible');await shot('wine-response');
     await until(async()=>(await diag()).wineTime===null);
    }
    if(id==='C5'&&variant===id){assert.equal((await diag()).wineAsked,true);assert.equal((await diag()).wineTime,null);}
    await sleep(650);await shot(room+'-'+variant);await press('e');await sleep(350);
    if(variant===id)await walk('s',s=>s.pending||s.room!==room);else await walk('w',s=>s.pending||s.room!==room);
    await until(async()=>{const h=(await diag()).history;return h?.at(-1)?.serial===d.passage;});
    const last=(await diag()).history.at(-1);assert.equal(last.correct,true);assert.equal(last.choice,variant===id?'return':'continue');
    await record(variant+' scored in '+room);
   }
  }
 }else if(mode==='procession'){
  await ev("document.querySelector('[aria-label=\"Hold ending frame\"]').click()");
  for(const name of ['arrival','bones','surround','service','wine','plaything','hound','bell','final']){
   await select('review-ending',name);await until(async()=>(await diag()).ending?.held);await sleep(400);await shot(name);
   const d=await diag();assert.deepEqual(d.errors,[]);console.log(name,d.ending.view,d.ending.deskSkeleton);
  }
 }else if(mode==='ending'){
  await ev("document.querySelector('[aria-label=\"Hold ending frame\"]').click()");
  for(const name of ['arrival','bones','surround','final']){
   await select('review-ending',name);await until(async()=>(await diag()).ending?.held);await sleep(900);await shot(name);
  }
  await ev("document.querySelector('[aria-label=\"Hold ending frame\"]').click()");
  await until(async()=>(await diag()).mode==='end');await record('final approach complete');
 }else if(mode==='visual-fallback'){ /* Standalone fallback exercise above. */ }
 else if(mode==='claim'||mode==='story'||mode.startsWith('visual')){
  for(let i=1;i<=2;i++){
   await select('review-encounter','C1');await hit('resume');await sleep(1100);await walk('s',d=>d.progress===i);
   await until(async()=>!(await diag()).pending);await sleep(450);
  }
  await claimCheck();
  if(mode==='visual'){await sleep(1150);await walk('w',d=>d.guestY>5.65);await shot('stair-footing');}
  if(mode==='visual'||mode==='visual-baseline'){
   const records=[];
   async function capture(label,waitMaster=true){
    await sleep(700);
    if(waitMaster)await until(async()=>{const v=(await diag()).visual;return v?.masterReady&&!v.failed.length;});
    await shot(label);const d=await diag();records.push({label,view:d.view,room:d.room,visual:d.visual,frameMs:d.frameMs});
    if(['desk','luggage','surround'].includes(label)){
     await hit('benchmark');await until(async()=>await ev("document.getElementById('benchmark-result').textContent.startsWith('{')"));
     records.at(-1).gpu=await ev("JSON.parse(document.getElementById('benchmark-result').textContent)");
     if((await diag()).mode==='paused')await hit('resume');
    }
   }
   for(const [room,id] of [['reception','desk'],['landing','lift-wide'],['corridor','gallery'],['stairs','stairs'],['suite','suite-door'],['lounge','night-bar']]){
    await select('review-room',room);await hit('resume');await until(async()=>(await diag()).room===room);await capture(id);
   }
   const studies=[['N-C4','dog'],['N-C1','bell'],['N-C6','luggage'],['E4','mirror'],['C3','children']];
   if(mode==='visual')studies.push(['C2','service'],['C5','bar'],['E1','portrait'],['E2','rain'],['E3','lift'],['E5','coat'],['E6','runner']);
   for(const [id,detail] of studies){
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
 await hit('restart');await until(async()=>(await diag()).road!=null);await press('e');await until(async()=>(await diag()).arrival!=null);await until(async()=>(await diag()).arrival===null);
 await walk('w',d=>d.room==='reception'&&d.guestY>7.8);await press('e');await until(async()=>(await diag()).room==='landing');await sleep(950);
 await walk('w',d=>d.room==='pantry');await sleep(950);await walk('w',d=>d.guestY>4.4);await press('e');await sleep(350);assert.equal((await diag()).detail,'service');await press('e');
 for(const room of ['lounge','baggage','bathroom','corridor']){await walk('w',d=>d.room===room);await sleep(950);}
 await walk('w',d=>d.room==='stairs');await record('unscored tour to stair');await sleep(950);
 await walk('w',d=>d.stairKind==='kennel');await until(async()=>!(await diag()).pending);await sleep(950);
 await walk('w',d=>d.guestY>5.6);await until(async()=>/BEAU/.test(await ev("document.getElementById('caption').textContent")));await record('met the dog on its own landing');
 await walk('w',d=>d.room==='landing');await record('ground register after tour');
 for(let i=0;i<4;i++){
  await sleep(1100);
  if(i%2===0){await press('e');await until(async()=>(await diag()).room==='stairs');}
  else await walk('w',d=>['corridor','pantry','baggage','bathroom','lounge'].includes(d.room));
  await sleep(1100);const f=await diag();assert.equal(f.branch,i%2===0?'stair':'hall');assert.ok(f.visibleCast.length<=1);
  // Developer verification reads the fixture diagnostics to exercise both exits deterministically.
  if(f.anomaly){await walk('w',d=>d.guestY>(i%2===0?5.5:f.room==='lounge'?4.45:7));await walk('s',d=>d.progress===i+1);}
  else await walk('w',d=>d.progress===i+1);
  await record('correct decision '+(i+1));
  await until(async()=>!(await diag()).pending);await sleep(1000);
  if((await diag()).room==='claim'){await claimCheck();await sleep(950);}
  const at=await diag();if(at.room==='stairs'){await walk('w',d=>d.room===(i===3?'suite':'landing'));}
  else assert.equal(at.room,i===3?'suite':'landing');
 }
 await record('suite reached on mixed routes');await sleep(1000);await walk('w',d=>d.guestY>6.65);await press('e');await until(async()=>(await diag()).mode==='ending');await record('reception ending entered');
 await until(async()=>(await diag()).mode==='end',180000);await shot('last-frame');await record('ending completed');
 }}
 assert.equal(errors.length,0);await writeFile(new URL('browser-'+mode+'-result.json',dir),JSON.stringify({status:'passed',url,errors,formalTest:false},null,2));
}finally{clearTimeout(safety);await cmd('Browser.close',{},undefined).catch(()=>{});browser.kill();}


