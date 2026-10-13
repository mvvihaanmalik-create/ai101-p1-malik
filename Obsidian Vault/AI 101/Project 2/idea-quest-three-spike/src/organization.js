export const PLACES=['table','shelf','retired'];
export function parseOrganization(raw,ids){
  let saved={};try{saved=JSON.parse(raw)||{};}catch{}
  return Object.fromEntries(ids.map(id=>[id,PLACES.includes(saved[id])?saved[id]:'table']));
}
export function nextTableFocus(layout,current,ids){
  return ids.includes(current)&&layout[current]==='table'?current:ids.find(id=>layout[id]==='table')||null;
}
export function tableSlot(index,count,mobile){
  const slots=mobile?{1:[0],2:[-1.1,1.1],3:[-1.8,0,1.8]}:{1:[.65],2:[-.35,1.65],3:[-1.25,.62,2.49]};
  return (slots[count]||slots[3])[index]??0;
}
