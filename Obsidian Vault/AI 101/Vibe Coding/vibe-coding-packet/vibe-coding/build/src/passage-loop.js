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
  this.recorded = new Set();
  this.serial = 0;
  this.history = [];
  this.order = [...ANOMALIES];
  for (let i = this.order.length - 1; i > 0; i--) {
   const j = Math.floor(random() * (i + 1));
   [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
  }
  this.next();
 }
 next(){
  if(this.unlocked)return this.current;
  const anomaly=this.orientation ? null : this.order.find(id => !this.recorded.has(id));
  this.current={serial:++this.serial,route:null,changed:Boolean(anomaly),shared:anomaly==='E3',anomaly,vignette:anomaly,resolved:false,observed:false};
  return this.current;
 }
 chooseRoute(route){
  const p=this.current;
  if(!p.route && !p.resolved){
   p.route=this.orientation ? route : STAIR.includes(p.anomaly) ? 'stair' : 'hall';
   if(this.orientation)p.vignette='C2';
  }
  return p;
 }
 decide(choice, serial = this.current.serial) {
  if (!['continue', 'return', 'contact'].includes(choice)) throw new Error('Invalid passage decision');
  if (this.unlocked || this.current.resolved || serial !== this.current.serial) return null;
  if (this.orientation && choice === 'return') return {kind: 'orientation-return', progress: 0};
  if (!this.orientation && choice==='return' && !this.current.observed) return {kind:'inspect-first'};
  this.current.resolved = true;
  const correct = choice !== 'contact' && (choice === 'return') === Boolean(this.current.anomaly);
  const kind = this.orientation ? 'orientation' : choice === 'contact' ? 'contact' : correct ? 'correct' : 'wrong';
  if (this.orientation) this.orientation = false;
  else if(correct){
   this.recorded.add(this.current.anomaly);
   this.progress=Math.floor(this.recorded.size/3);
  }
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
