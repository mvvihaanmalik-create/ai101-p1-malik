import {CUE_LENGTH} from './finale-cue.js';

const filmEnd=27, rollStart=31.5, tributeAt=CUE_LENGTH-10, thanksAt=CUE_LENGTH-4;
const clamp=x=>Math.max(0,Math.min(1,x));
const fade=(time,start,duration)=>clamp((time-start)/duration);
let pages;
function makePages(roll){
 const groups=[];
 for(const section of roll.children){
  for(const name of section.querySelectorAll('p')){
   const group=document.createElement('div');group.append(section.firstElementChild.cloneNode(true),name.cloneNode(true));
   if(name.nextElementSibling?.tagName==='SMALL')group.append(name.nextElementSibling.cloneNode(true));
   groups.push(group);
  }
 }
 return groups;
}
export function paintCredits(t,reduced){
 const title=document.getElementById('closing-title'),win=document.getElementById('roll-window'),roll=document.getElementById('credit-roll'),thanks=document.getElementById('dedication');
 const tribute=document.getElementById('lynch-tribute');
 title.hidden=t>=rollStart;
 win.hidden=t<rollStart||t>=tributeAt;
 tribute.hidden=t<tributeAt||t>=thanksAt;
 thanks.hidden=t<thanksAt;
 if(!title.hidden)title.style.opacity=Math.min(fade(t,filmEnd,1.8),1-fade(t,rollStart-1.5,1.5));
 if(!win.hidden){
  const u=clamp((t-rollStart)/(tributeAt-rollStart));
  if(reduced){
   pages??=makePages(roll);
   const page=pages[Math.min(pages.length-1,Math.floor(u*pages.length))];
   roll.hidden=true;
   if(win.lastElementChild!==page){if(win.lastElementChild!==roll)win.lastElementChild.remove();win.append(page);}
   win.classList.add('credit-pages');
  }else{
   roll.style.transform='translateY('+(win.clientHeight-(win.clientHeight+roll.offsetHeight)*u)+'px)';
  }
 }
 if(!tribute.hidden)tribute.style.opacity=Math.min(fade(t,tributeAt,.7),1-fade(t,thanksAt-.7,.7));
 if(!thanks.hidden)thanks.style.opacity=Math.min(fade(t,thanksAt,.5),1-fade(t,CUE_LENGTH-.8,.8));
}
