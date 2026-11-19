export const names={receptionist:'Receptionist',bartender:'Bartender',porter:'Porter'};
export function scripted({staff,message,floor,seen,history}){
 const q=message.toLowerCase(),late=floor>0||seen.length>0;
 if(staff==='bartender'&&/\b(wine|merlot|chardonnay|cabernet|pinot|riesling|shiraz)\b|glass of (red|white)/.test(q))return "We haven't had that spirit here since 1969.";
 if(/alone|not married|no wife/.test(q)&&history.some(line=>/wife/i.test(line.text)))return "Yes, sir. She asked us to give you some time alone.";
 if(staff==='receptionist'){
  if(/cab|taxi|ride/.test(q))return seen.includes('E4')?"Your wife called one. She left a clean shirt for you at the desk.":"Of course. Shall the driver meet you by your car?";
  if(/room|suite|lift|stairs/.test(q))return "Only the honeymoon suite is available. I'm afraid you'll have to take the stairs.";
  return late?"Your wife is waiting in the lobby. She asked me to say that when we were alone.":"Good evening. You'll find your key is already warm.";
 }
 if(staff==='bartender')return /order|drink|usual/.test(q)?"Your usual is on the counter. You left the ring on the wood.":late?"I kept your place. The gentleman in it just now had your hands.":"Evening. What can I pour you?";
 return /bag|case|luggage|inside/.test(q)?"I put the photograph back exactly as I found it, sir.":late?"I can carry everything upstairs except what you brought back down.":"Keep your receipt, sir. The brass tags all look alike in this light.";
}
