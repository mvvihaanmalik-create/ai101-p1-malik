import {names,scripted} from './staff-lines.mjs';
const dialog=document.querySelector('#staff-dialog'),form=dialog.querySelector('form'),input=form.querySelector('input'),log=dialog.querySelector('[role=log]'),send=form.querySelector('button');
const memories=new Map();let context,request;
export function resetTalk(){memories.clear();}
export function openTalk(data){
 context=data;dialog.querySelector('h2').textContent=names[data.staff];log.replaceChildren();
 for(const line of memories.get(data.staff)||[])append(line);
 input.value='';send.disabled=false;send.textContent='Ask';dialog.showModal();input.focus();
}
function append(line){
 const p=document.createElement('p');p.textContent=(line.role==='staff'?names[context.staff]:'You')+' · '+line.text;log.append(p);log.scrollTop=log.scrollHeight;
}
dialog.querySelector('[data-leave]').onclick=()=>dialog.close();
dialog.onclose=()=>{request?.abort();request=null;document.querySelector('#stage').focus();};
form.onsubmit=async event=>{
 event.preventDefault();const message=input.value.trim();if(!message||request)return;
 const ctx={...context,message,history:[...(memories.get(context.staff)||[])]},controller=new AbortController();
 request=controller;send.disabled=true;send.textContent='Waiting…';input.value='';
 append({role:'guest',text:message});let reply=scripted(ctx);
 const timer=setTimeout(()=>controller.abort(),8000);
 try{
  const r=await fetch('/api/staff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ctx),signal:controller.signal});
  if(r.ok){const data=await r.json();if(typeof data.reply==='string')reply=data.reply;}
 }catch{}finally{clearTimeout(timer);}
 if(request!==controller)return;
 append({role:'staff',text:reply});memories.set(ctx.staff,[...ctx.history,{role:'guest',text:message},{role:'staff',text:reply}].slice(-6));
 request=null;send.disabled=false;send.textContent='Ask';input.focus();
};
