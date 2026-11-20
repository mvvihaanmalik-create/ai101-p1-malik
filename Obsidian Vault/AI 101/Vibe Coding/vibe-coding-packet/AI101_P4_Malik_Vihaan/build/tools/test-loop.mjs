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
test('all twelve sightings required for every route preference, including retries',()=>{
 for(let seed=0;seed<200;seed++){
  const loop=oriented(seed),seen=new Set();
  for(let i=0;i<12;i++){
   const id=loop.current.anomaly;assert.ok(ANOMALIES.includes(id));assert.ok(!seen.has(id));
   assert.equal(loop.decide('return').kind,'inspect-first');
   loop.decide(i%2?'contact':'continue');fresh(loop);assert.equal(loop.current.anomaly,id);
   loop.current.observed=true;const serial=loop.current.serial;
   loop.decide('return');seen.add(id);assert.equal(loop.decide('return',serial),null);
   assert.equal(loop.progress,Math.floor((i+1)/3));assert.equal(loop.unlocked,i===11);
   if(i<11)fresh(loop,i%2?'hall':'stair');
  }
 }
});
test('only crossing a marked threshold submits, not turning or standing',()=>{
 assert.equal(crossedThreshold('landing',3.3,3.2),'return');assert.equal(crossedThreshold('corridor',4.5,4.3),'return');assert.equal(crossedThreshold('corridor',21.8,22.1),'continue');
 for(const [room,a,b] of [['landing',4.5,4],['landing',3.2,3.2],['landing',3.2,3.5],['corridor',15,14],['corridor',22,22],['stairs',21.8,22.1]])assert.equal(crossedThreshold(room,a,b),null);
});
test('inspection hotspots remain within the route and distinct from choice thresholds',()=>{
 for(const [room,x,y,key] of [['landing',59.4,7.5,'lift'],['corridor',-.7,7.7,'portrait'],['bathroom',239.7,5.5,'mirror'],['corridor',.9,12.3,'rain'],['pantry',179.5,4.5,'service'],['lounge',149.5,4.5,'bar'],['baggage',209.5,4.5,'luggage']])assert.equal(inspectionAt(room,x,y)?.key,key);
 assert.equal(inspectionAt('landing',59.5,3.25),null);assert.equal(inspectionAt('corridor',0,21.9),null);assert.equal(inspectionAt('stairs',90,7),null);
});

test('walking back through the corridor entrance scores exactly once without an E interaction',()=>{
 const loop=oriented(45);loop.current.anomaly='E2';loop.current.observed=true;
 const choice=crossedThreshold('corridor',4.46,4.38);assert.equal(choice,'return');
 assert.equal(loop.decide(choice).kind,'correct');assert.equal(loop.decide(choice),null);
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
