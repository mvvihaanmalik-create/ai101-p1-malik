import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PassageLoop, seededRandom, ANOMALIES, crossedThreshold} from '../src/passage-loop.js';
import {CATALOGUE,CHARACTERS,inspectionAt} from '../src/encounter-catalogue.js';
import {STAIR,HALL,chooseShot,stairDecision} from '../src/night-route.js';
function fresh(loop,branch='hall'){loop.next();loop.chooseRoute(branch);}
const answer = loop => loop.current.anomaly ? 'return' : 'continue';
function oriented(seed=123){const loop=new PassageLoop(seededRandom(seed));loop.decide('continue');fresh(loop);return loop;}
test('orientation is ordinary, cannot score, and cannot be skipped by returning',()=>{
 const loop=new PassageLoop();assert.equal(loop.current.anomaly,null);
 assert.equal(loop.decide('return').kind,'orientation-return');assert.equal(loop.current.resolved,false);
 assert.equal(loop.decide('continue').kind,'orientation');assert.equal(loop.progress,0);assert.equal(loop.orientation,false);
});
test('four consecutive correct decisions unlock, both choices are valid',()=>{
 for(let seed=0;seed<100;seed++){
  const loop=oriented(seed);
  for(let i=1;i<=4;i++){const result=loop.decide(answer(loop));assert.equal(result.progress,i);assert.equal(loop.unlocked,i===4);if(i<4)fresh(loop,i%2?'stair':'hall');}
  assert.equal(loop.decide('return'),null);const serial=loop.current.serial;loop.next();assert.equal(loop.current.serial,serial);
 }
});
test('wrong choice and contact reset streak, not anomaly draw history',()=>{
 for(const fail of ['wrong','contact']){
  const loop=oriented();for(let i=0;i<3;i++){loop.decide(answer(loop));fresh(loop);}
  const decks=JSON.stringify([...loop.decks]);
  const result=loop.decide(fail==='contact'?'contact':answer(loop)==='return'?'continue':'return');
  assert.equal(result.kind,fail);assert.equal(loop.progress,0);assert.equal(JSON.stringify([...loop.decks]),decks);
 }
});
test('each passage commits once; stale callbacks cannot score a new passage',()=>{
 const loop=oriented();const serial=loop.current.serial;loop.decide(answer(loop));assert.equal(loop.decide(answer(loop)),null);
 loop.next();assert.equal(loop.decide(answer(loop),serial),null);assert.equal(loop.progress,1);
});
test('each route locks once; normal and changed decks shuffle separately',()=>{
 for(const route of ['stair','hall']){
  const pool=route==='hall'?HALL:STAIR,loop=new PassageLoop(seededRandom(608));loop.decide('continue');
  const draws=[];let anomalous=0,shared=0;
  for(let i=0;i<10000;i++){
   const p=loop.next(),was=p.changed;loop.chooseRoute(route);
   const stamp=JSON.stringify(p);loop.chooseRoute(route==='hall'?'stair':'hall');assert.equal(JSON.stringify(p),stamp);
   assert.equal(Boolean(p.anomaly),was);
   if(p.shared){shared++;assert.equal(p.vignette,'E3');}
   else{assert.ok(pool.includes(p.vignette));if(p.changed)draws.push(p.anomaly);}
   if(was)anomalous++;loop.decide('contact');
  }
  for(let i=0;i+pool.length<=draws.length;i+=pool.length)assert.equal(new Set(draws.slice(i,i+pool.length)).size,pool.length);
  assert.ok(anomalous>4800&&anomalous<5200);assert.ok(shared>600&&shared<1000);
 }
});
test('same seed reproduces order; different seeds produce different orders',()=>{
 const sequence=seed=>{const loop=oriented(seed),seq=[];for(let i=0;i<30;i++){seq.push(loop.current.anomaly);loop.decide('contact');fresh(loop);}return seq;};
 assert.deepEqual(sequence(44),sequence(44));assert.notDeepEqual(sequence(44),sequence(45));
});
test('only crossing a marked threshold submits, not turning or standing',()=>{
 assert.equal(crossedThreshold('landing',3.3,3.2),'return');assert.equal(crossedThreshold('corridor',4.5,4.3),'return');assert.equal(crossedThreshold('corridor',21.8,22.1),'continue');
 for(const [room,a,b] of [['landing',4.5,4],['landing',3.2,3.2],['landing',3.2,3.5],['corridor',15,14],['corridor',22,22],['stairs',21.8,22.1]])assert.equal(crossedThreshold(room,a,b),null);
});
test('normal and changed versions of all twelve entries are reachable',()=>{
 assert.deepEqual([...HALL,...STAIR,'E3'].sort(),[...ANOMALIES].sort());
 const loop=oriented(505),normal=new Set(),changed=new Set();
 for(let i=0;i<2000;i++){const p=loop.current;(p.anomaly?changed:normal).add(p.vignette);loop.decide('contact');fresh(loop,i%2?'stair':'hall');}
 assert.equal(normal.size,12);assert.equal(changed.size,12);
});
test('inspection hotspots remain within the route and distinct from choice thresholds',()=>{
 for(const [room,x,y,key] of [['landing',59.4,7.5,'lift'],['corridor',-.7,7.7,'portrait'],['bathroom',239.7,5.5,'mirror'],['corridor',.9,12.3,'rain'],['pantry',179.5,4.5,'service'],['lounge',149.5,4.5,'bar'],['baggage',209.5,4.5,'luggage']])assert.equal(inspectionAt(room,x,y)?.key,key);
 assert.equal(inspectionAt('landing',59.5,3.25),null);assert.equal(inspectionAt('corridor',0,21.9),null);assert.equal(inspectionAt('stairs',90,7),null);
});

test('walking back through the corridor entrance scores exactly once without an E interaction',()=>{
 const loop=oriented(45);loop.current.anomaly='E2';
 const choice=crossedThreshold('corridor',4.46,4.38);assert.equal(choice,'return');
 assert.equal(loop.decide(choice).progress,1);assert.equal(loop.decide(choice),null);
 assert.equal(crossedThreshold('corridor',5.5,5.2),null);
});
test('stair decisions require crossing the bottom or top, and absent guests cannot be inspected',()=>{
 assert.equal(stairDecision(2.90,2.80),'return');assert.equal(stairDecision(9.30,9.36),'continue');
 assert.equal(stairDecision(7,7),null);assert.equal(stairDecision(8,7),null);
 assert.equal(chooseShot('corridor',7,'C1',{key:'service'},false),null);
 assert.equal(chooseShot('stairs',6,'C3',null,true).key,'stair');assert.equal(chooseShot('stairs',6,'C3',null,false),null);
});

test('gallery has no service, bartender, traveller or stair-cast hotspots',()=>{
 for(const depth of [7,10,14,17,20])assert.equal(inspectionAt('corridor',0,depth),null);
});
