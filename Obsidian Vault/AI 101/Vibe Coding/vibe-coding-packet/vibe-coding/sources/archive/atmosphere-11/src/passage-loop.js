// Pure game rules, independent of rendering and frame rate.
import {ANOMALIES,CHARACTERS} from './encounter-catalogue.js';
export {ANOMALIES};
export function seededRandom(seed) {
 let value = seed >>> 0;
 return () => { value += 0x6D2B79F5; let t = value; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export class PassageLoop {
 constructor(random = Math.random) {
  this.random = random; this.progress = 0; this.orientation = true; this.unlocked = false;
  this.bag = []; this.lastAnomaly = null; this.serial = 0; this.history = [];
  this.next();
 }
 draw() {
  if (!this.bag.length) {
   this.bag = [...ANOMALIES];
   for (let i = this.bag.length - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; }
   // Avoid a repeat across the boundary between two complete bags too.
   if (this.bag.at(-1) === this.lastAnomaly) [this.bag[0], this.bag[this.bag.length - 1]] = [this.bag.at(-1), this.bag[0]];
  }
  this.lastAnomaly = this.bag.pop(); return this.lastAnomaly;
 }
 next() {
  if (this.unlocked) return this.current;
  const anomaly=this.orientation?null:this.random()<.5?this.draw():null;
  // Every ordinary passage has the same cast. Only the drawn detail changes.
  const vignette='C1';
  this.current = {serial: ++this.serial, anomaly, vignette, resolved: false};
  return this.current;
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
