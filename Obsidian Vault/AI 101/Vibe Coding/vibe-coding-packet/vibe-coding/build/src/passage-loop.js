// Pure game rules, independent of rendering and frame rate.
import {ANOMALIES} from './encounter-catalogue.js';
import {STAIR,HALL} from './night-route.js';
export {ANOMALIES};
export function seededRandom(seed) {
 let value = seed >>> 0;
 return () => { value += 0x6D2B79F5; let t = value; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export class PassageLoop {
 constructor(random = Math.random) {
  this.random = random; this.progress = 0; this.orientation = true; this.unlocked = false;
  this.decks=new Map();this.last=new Map();this.serial=0;this.history=[];this.next();
 }
 draw(key,pool){
  let bag=this.decks.get(key);
  if(!bag?.length){
   bag=[...pool];
   for(let i=bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
   if(bag.length>1&&bag.at(-1)===this.last.get(key))[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];
   this.decks.set(key,bag);
  }
  const id=bag.pop();this.last.set(key,id);return id;
 }
 next(){
  if(this.unlocked)return this.current;
  const changed=!this.orientation&&this.random()<.5;
  const shared=!this.orientation&&this.random()<1/12;
  this.current={serial:++this.serial,route:null,changed,shared,anomaly:changed&&shared?'E3':null,vignette:shared?'E3':null,resolved:false};
  return this.current;
 }
 chooseRoute(route){
  if(!['hall','stair'].includes(route))throw Error('Unknown route');
  const p=this.current;
  if(p.resolved||p.route)return p;
  p.route=route;
  if(!p.shared){
   p.vignette=this.orientation?'C2':this.draw(route+Number(p.changed),route==='stair'?STAIR:HALL);
   p.anomaly=p.changed?p.vignette:null;
  }
  return p;
 }
 decide(choice, serial = this.current.serial) {
  if (!['continue', 'return', 'contact'].includes(choice)) throw new Error('Invalid passage decision');
  if (this.unlocked || this.current.resolved || serial !== this.current.serial) return null;
  if (this.orientation && choice === 'return') return {kind: 'orientation-return', progress: 0};
  this.current.resolved = true;
  const correct = choice !== 'contact' && (choice === 'return') === Boolean(this.current.anomaly);
  const kind = this.orientation ? 'orientation' : choice === 'contact' ? 'contact' : correct ? 'correct' : 'wrong';
  if (this.orientation) this.orientation = false;
  else this.progress = correct ? this.progress + 1 : 0;
  this.unlocked = this.progress === 4;
  const result = {kind, choice, correct, progress: this.progress, unlocked: this.unlocked, serial, anomaly: this.current.anomaly};
  this.history.push(result); this.history = this.history.slice(-32);
  return result;
 }
}
// A threshold is crossed, not activated by standing on it or changing direction.
export function crossedThreshold(room, previousY, y) {
 if (room === 'landing' && previousY > 3.25 && y <= 3.25) return 'return';
 if (room === 'corridor' && previousY > 4.4 && y <= 4.4) return 'return';
 if (room === 'corridor' && previousY < 21.9 && y >= 21.9) return 'continue';
 return null;
}
