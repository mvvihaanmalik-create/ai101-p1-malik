import {readFile,writeFile} from 'node:fs/promises';
const file=new URL('../assets/night-register.json',import.meta.url);
const key=process.env.DEEPSEEK_API_KEY;
if(key){
 const notes=JSON.parse(await readFile(file,'utf8'));
 try{
  const response=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',signal:AbortSignal.timeout(25000),headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:'deepseek-flash',thinking:{type:'disabled'},max_tokens:650,response_format:{type:'json_object'},messages:[{role:'user',content:'Rewrite these fictional hotel ledger entries as quiet, unsettling night-clerk observations. Preserve each specific event. One short sentence per ID. Return only a JSON object with identical IDs and string values. '+JSON.stringify(notes)}]})});
  if(!response.ok)throw Error();
  const data=await response.json();
  const lines=JSON.parse(data.choices[0].message.content);
  if(!Object.keys(notes).every(id=>typeof lines[id]==='string'&&lines[id].trim().length>4&&lines[id].length<=150))throw Error();
  await writeFile(file,JSON.stringify(Object.fromEntries(Object.keys(notes).map(id=>[id,lines[id].trim()])),null,2));
  console.log('Generated the night register.');
 }catch{console.log('Using the authored night register.');}
}
