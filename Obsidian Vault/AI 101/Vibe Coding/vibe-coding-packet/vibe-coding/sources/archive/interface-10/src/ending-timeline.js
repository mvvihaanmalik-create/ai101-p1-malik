export const GREETING='We have been expecting you.';
export const ENDING_DURATION=26;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export function endingFrame(seconds){
 const t=Math.max(0,Math.min(ENDING_DURATION,Number.isFinite(seconds)?seconds:0));
 const phase=t<1.6?'threshold':t<6.2?'greeting':t<10.5?'unmasking':t<13.8?'bones':t<14.5?'turn':t<24?'surrounded':'held';
 const reveal=ease((t-7)/3.5),approach=ease((t-14.5)/9.5);
 return {time:t,phase,shot:t<6.2?0:t<14.5?1:2,reveal,approach,
  darkness:1-.965*ease((t-6.2)/4.3),
  blackout:t<1.6?1:t<2.5?1-ease((t-1.6)/.9):t>=13.8&&t<14.5?Math.sin((t-13.8)/.7*Math.PI):0,
  blur:t<6.2?0:t<10.5?Math.sin((t-6.2)/4.3*Math.PI)*1.7:0,
  caption:t>=2.3&&t<6.2?GREETING:'',complete:t>=ENDING_DURATION};
}
export function canEnterEnding({room,unlocked,mode}){return room==='suite'&&unlocked&&mode==='playing';}
