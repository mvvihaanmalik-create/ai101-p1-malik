import fs from 'node:fs/promises';
import {watch} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const here=path.join(root,'Project-03/workshop'),cloud=path.join(here,'cloud'),stateFile=path.join(here,'.local/cloud-publisher.json');
const team='team_rYbBIpXkLNdDUrzd7HHQ5qOZ',project='prj_Pgx8gFT7EwQqLkNhcLP3MCK2MHPa';
const vercel=path.resolve(root,'../../../AppData/Roaming/npm/node_modules/vercel/dist/vc.js');
function command(args,cwd=root){return new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',v=>stdout+=v);child.stderr.on('data',v=>stderr+=v);child.on('error',reject);child.on('exit',code=>code===0?resolve({stdout,stderr}):reject(Error((stderr||stdout).slice(-4500))));});}
export async function packageHash(){
  const hash=createHash('sha256');
  async function scan(dir){for(const entry of (await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){if(entry.name==='.vercel')continue;const file=path.join(dir,entry.name),relative=path.relative(cloud,file).replaceAll('\\','/');if(entry.isDirectory()){if(!['public','api','data'].includes(relative)&&!relative.startsWith('public/'))throw Error('Unexpected directory in deployment: '+relative);await scan(file);}else{if(!relative.startsWith('public/')&&!['api/media.mjs','api/shelf-library.mjs','api/shelf-refresh.mjs','api/shelf-thumbnail.mjs','data/catalog.json','data/core.mjs','data/shelf-previews.json','data/asset-sources.json','package.json','package-lock.json','vercel.json','.vercelignore'].includes(relative))throw Error('Unexpected file in deployment: '+relative);hash.update(relative);hash.update(await fs.readFile(file));}}}
  await scan(cloud);return hash.digest('hex');
}
let running=false,again=false,timer;
async function publish(){
  if(running){again=true;return;}running=true;
  try{
    await command([path.join(root,'Project-03/design-shelf/scripts/build.mjs')]);
    await command([path.join(here,'scripts/build-cloud.mjs')]);
    const hash=await packageHash();let previous={};try{previous=JSON.parse(await fs.readFile(stateFile,'utf8'));}catch{}
    if(previous.hash===hash){console.log('Cloud package unchanged.');return;}
    const inspected=await command([vercel,'--scope',team,'project','inspect','--non-interactive'],cloud);
    if(!(inspected.stdout+inspected.stderr).includes(project))throw Error('Deployment project did not match.');
    console.log('Publishing public UI and catalog updates…');
    const result=await command([vercel,'--scope',team,'deploy','--prod','--yes','--non-interactive'],cloud);
    const url=(result.stdout.match(/https:\/\/[^\s]+\.vercel\.app/g)||[]).at(-1)||previous.url;
    await fs.writeFile(stateFile,JSON.stringify({hash,url,updatedAt:new Date().toISOString()},null,2));
    console.log('Cloud updated: '+url);
  }catch(error){console.error('Cloud update stopped: '+error.message);process.exitCode=process.argv.includes('--watch')?0:1;}
  finally{running=false;if(again){again=false;void publish();}}
}
const main=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(main&&process.argv.includes('--watch')){
  await fs.writeFile(path.join(here,'.local/cloud-publisher.pid'),String(process.pid));
  const paths=['Project-03/workshop/public','Project-03/workshop/src','Project-03/workshop/scripts','Project-03/design-shelf/src','Project-03/design-shelf/scripts','Project-03/design-shelf/assets','Project-03/design-shelf/data','Project-03/design-shelf/config','Project 2/idea-quest-three-spike/src'];
  const changed=()=>{clearTimeout(timer);timer=setTimeout(publish,5000);};
  const watchers=paths.map(file=>watch(path.join(root,file),{recursive:true},changed));
  watchers.push(watch(path.join(here,'cloud-runtime'),{recursive:false},changed));
  for(const file of ['Project 2/idea-quest-three-spike/index.html','Project 2/idea-quest-three-spike/styles.css','Project-03/design-shelf/package.json','Project-03/design-shelf/package-lock.json'])watchers.push(watch(path.join(root,file),changed));
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{watchers.forEach(w=>w.close());process.exit();});
  console.log('Watching website source and public asset catalog. Private notes and run files are excluded.');
  void publish(); // Catch edits made while this PC or watcher was off.
}else if(main&&process.argv.includes('--record-current')){
  await fs.writeFile(stateFile,JSON.stringify({hash:await packageHash(),url:process.argv[process.argv.indexOf('--record-current')+1],updatedAt:new Date().toISOString()},null,2));
}else if(main)await publish();
