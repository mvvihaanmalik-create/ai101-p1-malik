import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {createInterface} from 'node:readline';
import {outputSchema} from './roles.mjs';

// The model has public search and structured output only. File application and
// human approvals are separate server operations, never model-callable tools.
export class CodexRunner {
  constructor(cwd){this.cwd=cwd;this.pending=new Map();this.events=new Set();this.sequence=0;this.child=null;this.starting=null;this.model=null;this.connected=false;}
  async start(){if(this.connected)return;if(this.starting)return this.starting;this.starting=this.connect().finally(()=>{this.starting=null;});return this.starting;}
  async connect(){
    await fs.mkdir(this.cwd,{recursive:true});
    const entry=path.join(process.env.APPDATA||'','npm/node_modules/@openai/codex/bin/codex.js');
    await fs.access(entry).catch(()=>{throw Error('Codex is not installed. Open Codex on this PC and sign in.');});
    const arch=process.arch==='arm64'?'arm64':'x64',require=createRequire(entry);let vendor;
    try{vendor=path.join(path.dirname(require.resolve('@openai/codex-win32-'+arch+'/package.json')),'vendor');}catch{vendor=path.resolve(path.dirname(entry),'../vendor');}
    const exe=path.join(vendor,arch==='arm64'?'aarch64-pc-windows-msvc':'x86_64-pc-windows-msvc','bin/codex.exe');
    await fs.access(exe);
    this.child=spawn(exe,['app-server','--listen','stdio://','-c','web_search="live"','--disable','shell_tool','--disable','unified_exec','--disable','apps','--disable','plugins','--disable','multi_agent','-c','project_doc_max_bytes=0','-c','default_permissions="workshop"','-c','permissions.workshop.filesystem={":root"="deny",":minimal"="read",":workspace_roots"="read"}','-c','permissions.workshop.network.enabled=false'],{cwd:this.cwd,windowsHide:true,stdio:['pipe','pipe','pipe'],env:{...process.env,PSModulePath:undefined}});
    this.child.stderr.on('data',()=>{});
    createInterface({input:this.child.stdout}).on('line',line=>{try{this.receive(JSON.parse(line));}catch{}});
    this.child.on('error',()=>this.closed());this.child.on('exit',()=>this.closed());
    await this.rpc('initialize',{clientInfo:{name:'ideaquest_workshop',title:'idea.quest workshop',version:'1.0.0'},capabilities:{experimentalApi:true}});this.send({method:'initialized'});
    const account=await this.rpc('account/read',{});if(!account.account){this.close();throw Error('Sign into Codex on this PC, then reconnect.');}
    const models=await this.rpc('model/list',{});this.model=models.data.find(m=>m.isDefault&&!m.hidden)?.model;if(!this.model)throw Error('No available default Codex model.');this.connected=true;
  }
  send(message){if(!this.child?.stdin.writable)throw Error('Codex disconnected.');this.child.stdin.write(JSON.stringify(message)+'\n');}
  rpc(method,params){const id=++this.sequence;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('Codex did not answer '+method+'.'));},60000);this.pending.set(id,{resolve,reject,timer});try{this.send({id,method,params});}catch(e){clearTimeout(timer);this.pending.delete(id);reject(e);}});}
  receive(m){
    if(m.id!==undefined&&!m.method){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}return;}
    if(m.id!==undefined&&m.method){
      if(/requestApproval$/.test(m.method))this.send({id:m.id,result:m.method.includes('permissions')?{permissions:{},scope:'turn'}:{decision:'decline'}});
      else if(m.method==='item/tool/requestUserInput')this.send({id:m.id,result:{answers:{}}});
      else if(m.method==='mcpServer/elicitation/request')this.send({id:m.id,result:{action:'decline',content:null}});
      else this.send({id:m.id,error:{code:-32601,message:'This action is unavailable in the workshop.'}});
      return;
    }
    for(const handler of this.events)handler(m);
  }
  closed(){this.connected=false;this.child=null;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('Codex disconnected. Retry when ready.'));}this.pending.clear();for(const h of this.events)h({method:'disconnected'});}
  async run({instructions,prompt,signal,onProgress=()=>{}}){
    await this.start();if(signal?.aborted)throw Error('Stopped.');
    const thread=await this.rpc('thread/start',{model:this.model,cwd:this.cwd,ephemeral:true,developerInstructions:instructions,approvalPolicy:'untrusted',permissions:'workshop',config:{web_search:'live','features.shell_tool':false,'features.unified_exec':false,'features.apps':false,'features.plugins':false,'features.multi_agent':false,project_doc_max_bytes:0}});
    const threadId=thread.thread.id;let turnId,answer='',resolve,reject;
    const done=new Promise((res,rej)=>{resolve=res;reject=rej;});done.catch(()=>{});
    const handler=event=>{if(event.method==='disconnected')return reject(Error('Codex disconnected.'));if(event.params?.threadId!==threadId)return;
      if(event.method==='item/started'&&event.params.item?.type==='webSearch')onProgress('Checking public sources');
      if(event.method==='item/completed'&&event.params.item?.type==='agentMessage')answer=event.params.item.text||answer;
      if(event.method==='turn/completed'&&(!turnId||event.params.turn.id===turnId)){const turn=event.params.turn;turn.status==='completed'?resolve(answer):reject(Error(turn.error?.message||'The request was stopped.'));}
    };
    const interrupt=()=>{if(turnId)this.rpc('turn/interrupt',{threadId,turnId}).catch(()=>{});reject(Error('Stopped.'));};
    this.events.add(handler);signal?.addEventListener('abort',interrupt,{once:true});
    const timeout=setTimeout(()=>{interrupt();},600000);
    try{if(signal?.aborted)throw Error('Stopped.');const result=await this.rpc('turn/start',{threadId,input:[{type:'text',text:prompt}],cwd:this.cwd,approvalPolicy:'untrusted',permissions:'workshop',outputSchema});turnId=result.turn.id;if(signal?.aborted)interrupt();const output=JSON.parse(await done);return {...output,model:this.model};}
    finally{clearTimeout(timeout);signal?.removeEventListener('abort',interrupt);this.events.delete(handler);this.rpc('thread/archive',{threadId}).catch(()=>{});}
  }
  close(){this.connected=false;const child=this.child;if(!child)return;child.stdin.end();setTimeout(()=>{if(child.exitCode===null)child.kill();},1500).unref();}
}
