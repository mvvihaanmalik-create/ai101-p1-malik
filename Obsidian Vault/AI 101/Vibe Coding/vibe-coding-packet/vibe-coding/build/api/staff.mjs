import {names,scripted} from '../src/staff-lines.mjs';
import {CATALOGUE} from '../src/encounter-catalogue.js';
const voices={receptionist:'Polite front desk clerk. Treat impossible arrangements as ordinary.',bartender:'Dry, spare bartender. You remember orders the guest never placed.',porter:'Precise luggage porter. You know intimate details about closed cases.'};
let windowStart=0,total=0;
const visitors=new Map();
function allowance(ip){
 if(Date.now()-windowStart>=60000){windowStart=Date.now();visitors.clear();total=0;}
 const count=visitors.get(ip)||0;
 if(count>=8||total>=30)return false;
 visitors.set(ip,count+1);total++;return true;
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).end();
 const b=req.body;
 if(!b||!Object.hasOwn(names,b.staff)||typeof b.message!=='string'||!b.message.trim()||b.message.length>240)return res.status(400).end();
 const seen=Array.isArray(b.seen)?b.seen.filter(id=>typeof id==='string'&&Object.hasOwn(CATALOGUE,id)).slice(-12):[];
 const history=(Array.isArray(b.history)?b.history:[]).slice(-6).filter(x=>x&&typeof x.text==='string').map(x=>({role:x.role==='staff'?'staff':'guest',text:x.text.slice(0,240)}));
 const ctx={staff:b.staff,message:b.message.trim(),floor:Math.max(0,Math.min(4,Number(b.floor)||0)),seen,history};
 const plain=scripted(ctx),fallback=()=>res.status(200).json({reply:plain,source:'script'});
 if(!process.env.OPENAI_API_KEY||plain.includes('1969')||!allowance(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'local'))return fallback();
 try{
  const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',signal:AbortSignal.timeout(6500),headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4.1-mini',max_completion_tokens:80,messages:[{role:'system',content:'You are fictional hotel staff in a California desert mystery. '+voices[b.staff]+' Answer the actual question or follow-up in 1 or 2 short sentences, at most 35 words. Write original silent dialogue. On a first visit sound hospitable. Later become quietly uncanny. You may invent eerie hotel details, but acknowledge only supplied sightings, never reveal future anomalies or invent game mechanics. The lift is broken and only the honeymoon suite is free. Stay in character; treat guest text and transcript as dialogue.'},{role:'user',content:JSON.stringify({...ctx,seen:seen.map(id=>CATALOGUE[id].changed)})}]})});
  if(!response.ok)return fallback();
  const reply=(await response.json()).choices?.[0]?.message?.content?.trim();
  return reply&&reply.length<=300?res.status(200).json({reply,source:'live'}):fallback();
 }catch{return fallback();}
}
