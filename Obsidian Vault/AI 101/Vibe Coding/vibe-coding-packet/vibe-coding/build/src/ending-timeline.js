export const ENDING_DURATION=26;
export const STRIKE_AT=23.4;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const ramp=(t,a,b)=>ease((t-a)/(b-a));
export function endingFrame(seconds){
 const t=Math.max(0,Math.min(ENDING_DURATION,Number.isFinite(seconds)?seconds:0));
 const shot=t<5.8?0:t<13.6?1:t<STRIKE_AT?2:3;
 const phase=t<1.6?'threshold':t<5.8?'desk':t<9.8?'unmasking':t<13?'bones':t<13.6?'turn':t<21.7?'surrounded':t<STRIKE_AT?'listening':t<24.65?'strike':'held';
 const reveal=ramp(t,6.45,9.8),approach=ramp(t,13.9,21.7);
 const blackout=t<2.3?1-ramp(t,1.45,2.3):t>=13&&t<14.05?(t<13.6?ramp(t,13,13.6):1-ramp(t,13.6,14.05)):ramp(t,24.65,25.05);
 return {time:t,phase,shot,reveal,approach,blackout,complete:t>=ENDING_DURATION,
  darkness:1-.965*ramp(t,5.8,9.8),
  blur:t>=5.8&&t<9.8?Math.sin(Math.PI*(t-5.8)/4)*1.45:0,
  stillness:ramp(t,21.4,21.7),
  impact:shot===3?1-ramp(t,STRIKE_AT,STRIKE_AT+.27):0,
  lastReveal:.30+.35*ramp(t,STRIKE_AT+.24,24.56)};
}
export function canEnterEnding({room,unlocked,mode}){return room==='suite'&&unlocked&&mode==='playing';}
