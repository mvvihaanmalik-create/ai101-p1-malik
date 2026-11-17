import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {geometry} from './support/geometry-only.mjs';
import {createWelcomeCandle,welcomeStep} from '../src/welcome-candle.js';

test('receptionist keeps elbows outside her torso, neutral wrists and a continuous candle grip',async()=>{
 const data=await geometry('receptionist-v20.glb'),scene=new T.Scene(),holder=new T.Group();
 holder.add(data.scene);scene.add(holder);
 const mixer=new T.AnimationMixer(data.scene),idle=mixer.clipAction(data.animations.find(a=>a.name==='Idle')).play();
 mixer.update(0);const pose=createWelcomeCandle(scene,holder,data.scene);
 const old=new Map();let maxTurn=0,maxTravel=0,minimumSide=Infinity,peak;
 for(let i=0;i<=1620;i++){
  const t=32+i/60;pose.restore();idle.time=t%idle.getClip().duration;mixer.update(0);
  holder.rotation.y=t<44.5?welcomeStep(t).yaw:Math.PI;
  holder.position.set(t<44.5?-welcomeStep(t).distance:0,0,0);pose.pose(t);
  const s=pose.snapshot();assert.ok(s.wristBend<.01);assert.ok(s.gripGap<.0001);
  for(const [side,sign] of [['r',1],['l',-1]])for(const name of ['upperarm','lowerarm','hand']){
   const b=data.scene.getObjectByName(name+'_'+side),point=holder.worldToLocal(b.getWorldPosition(new T.Vector3()));
   minimumSide=Math.min(minimumSide,point.x*sign);
   assert.ok(point.x*sign>.14,`${name}_${side} crossed into the torso at ${t}`);
   const q=b.quaternion.clone(),prev=old.get(b);
   if(prev){const turn=T.MathUtils.radToDeg(q.angleTo(prev.q));if(turn>maxTurn){maxTurn=turn;peak={t,bone:b.name};}maxTravel=Math.max(maxTravel,point.distanceTo(prev.point));}
   old.set(b,{q,point});
  }
 }
 console.log(JSON.stringify({minimumSide,maxTurn,maxTravel,peak}));
 assert.ok(maxTurn<5,`Arm snapped ${maxTurn} degrees in one frame`);
 assert.ok(maxTravel<.018,`Hand jumped ${maxTravel} metres in one frame`);
});

test('doorway walk completes a stride with planted turns before and after',()=>{
 assert.equal(welcomeStep(36.45).distance,0);assert.equal(welcomeStep(38.65).distance,1.04);
 assert.equal(welcomeStep(36.45).yaw,Math.PI/2);assert.equal(welcomeStep(38.65).yaw,Math.PI/2);
 assert.equal(welcomeStep(39.4).weight,0);assert.equal(welcomeStep(39.4).yaw,Math.PI);
 let previous=0;
 for(let t=33;t<42;t+=1/120){const p=welcomeStep(t);assert.ok(p.distance>=previous);previous=p.distance;}
});
