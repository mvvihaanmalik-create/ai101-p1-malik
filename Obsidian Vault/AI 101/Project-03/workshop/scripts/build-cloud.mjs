import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {dedupeReferences,normalizeReference,reusableAsset} from '../../design-shelf/src/core.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const output=path.join(root,'Project-03/workshop/cloud');
const publicDir=path.join(output,'public');
const read=file=>fs.readFile(path.join(root,file),'utf8');
const write=async(file,text)=>{const target=path.join(output,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,text);};
const deps=process.env.AI101_BUILD_DEPS||path.resolve(root,'../../../AppData/Local/AI101Projects/idea-quest-three-build/node_modules');
const require=createRequire(import.meta.url),esbuild=require(path.join(deps,'esbuild'));
await fs.mkdir(publicDir,{recursive:true});
// This allowlist contains public UI code, catalog metadata and fonts only.
for(const file of ['index.html','styles.css'])await write('public/'+file,await read('Project-03/workshop/public/'+file));
esbuild.buildSync({entryPoints:[path.join(root,'Project-03/workshop/src/characters.js')],outfile:path.join(publicDir,'characters.js'),nodePaths:[deps],bundle:true,minify:true,format:'iife',platform:'browser',target:'es2020'});
let workshop=await read('Project-03/workshop/public/app.js');
workshop=workshop.replaceAll("origin:'http://127.0.0.1:4188'","origin:location.origin").replaceAll("origin:'http://127.0.0.1:8917'","origin:location.origin");
workshop=workshop.replace("suiteApps[id].origin+'/?suite=1&project='","suiteApps[id].origin+(id==='shelf'?'/shelf/':'/ideaquest/')+'?suite=1&project='");
workshop=workshop.replace('state.pending||!!running()','!window.WorkshopCloud.online||state.pending||!!running()');
workshop=workshop.replace("$('#connection').textContent=state.engine.connected?'Agents connected':'Connect agents';$('#connection').disabled=state.pending;","$('#connection').textContent=window.WorkshopCloud.online?'PC connected':'Connect PC';$('#connection').disabled=state.pending||window.WorkshopCloud.online;");
const connectStart=workshop.indexOf("  $('#connection').addEventListener('click',"),connectEnd=workshop.indexOf("\n  root.addEventListener('change'",connectStart);
if(connectStart<0||connectEnd<0)throw Error('Connection control changed. Review the hosted adapter.');
workshop=workshop.slice(0,connectStart)+"  $('#connection').addEventListener('click',async()=>{stash();state.pending=true;renderChrome();$('#connection').textContent='Connecting…';try{await window.WorkshopCloud.connect();await init();toast('PC connected.');}catch(e){toast(e.message);}finally{state.pending=false;renderChrome();}});"+workshop.slice(connectEnd);
workshop=workshop.replace("$('#footer').textContent='Saved locally';","$('#footer').textContent=window.WorkshopCloud.online?'Saved on your PC':'PC offline';");
// The shared task card presents offline, paused and approval states once.
workshop=workshop.replace('Connect agents to send a request','Agents run on your PC');
workshop=workshop.replace('state.run=result.run;state.projects=','state.run=result.run;await loadLibrary();state.projects=');
const previewStart=workshop.indexOf('  function preview(){'),previewEnd=workshop.indexOf('\n  function programmer()',previewStart);
if(previewStart<0||previewEnd<0)throw Error('Prototype preview changed. Review the hosted adapter.');
workshop=workshop.slice(0,previewStart)+'  function preview(){return window.WorkshopCloud.preview(state.run.artifact);}\n'+workshop.slice(previewEnd);
workshop=workshop.replace("projectId:state.projectId,theme:","projectId:state.projectId==='connect-your-pc'?null:state.projectId,theme:");
workshop=workshop.replace("This local app is not responding. Start workshop/start.ps1, then retry.","This view did not load. Retry to reopen it.");
new vm.Script(workshop);await write('public/app.js',workshop);
await write('public/cloud-runtime.js',await read('Project-03/workshop/scripts/cloud-runtime.js'));
for(const file of ['index.html','runner.js'])await write('public/prototype-preview/'+file,await read('Project-03/workshop/scripts/prototype-preview/'+file));
let index=await fs.readFile(path.join(publicDir,'index.html'),'utf8');index=index.replace('<script src="/app.js"','<script src="/cloud-runtime.js" defer></script><script src="/app.js"');await write('public/index.html',index);

// Extract the already-built Shelf assets. No runtime bucket or note summaries ship.
const workerFile=path.join(root,'Project-03/design-shelf/dist/server/index.js');
const worker=(await import(pathToFileURL(workerFile).href+'?cloud='+Date.now())).default;
const previews=JSON.parse(await read('Project-03/design-shelf/config/asset-previews.json'));
const previewFiles=['previews/manifest.json',...new Set(Object.values(previews).flatMap(p=>[p.file,p.licenseFile,p.tryPoster,p.thumbnailFile].filter(Boolean).map(file=>'previews/'+file)))];
const tryFiles=JSON.parse(await read('Project-03/design-shelf/dist/try/files.json'));
for(const name of ['index.html','app.js','styles.css','pip.svg','shelf.png','icon.png','fonts/InterVariable.woff2','fonts/LICENSE.txt',...previewFiles,...tryFiles]){
  const response=await worker.fetch(new Request('https://build.invalid/'+name),{},{});if(!response.ok)throw Error('Missing Shelf asset: '+name);
  if(/\.(html|js|css)$/.test(name)){
    let text=await response.text();
    if(!name.startsWith('try/'))for(const file of ['styles.css','app.js','pip.svg','shelf.png','icon.png','fonts/','previews/','try/'])text=text.replaceAll('/'+file,'/shelf/'+file);
    if(name==='index.html')text=text.replace('<script src=', '<script src="/cloud-runtime.js" defer></script><script src=');
    if(name==='app.js'){
      text=text.replace("location.origin==='http://127.0.0.1:8917'&&parent!==window",'parent!==window').replaceAll("'http://127.0.0.1:4190'",'location.origin');
      text=text.replace("base='/api/media/'","base='/shelf/api/media/'");
      new vm.Script(text);
    }
    await write('public/shelf/'+name,text);
  }else await write('public/shelf/'+name,Buffer.from(await response.arrayBuffer()));
}
const refreshData=JSON.parse(await read('Project-03/design-shelf/.local/objects/library%2Frefresh.json'));
const references=dedupeReferences([...JSON.parse(await read('Project-03/design-shelf/data/references.json')),...JSON.parse(await read('Project-03/design-shelf/data/assets.json'))].map(r=>normalizeReference(r,new Date(refreshData.lastSuccess))));
const refresh={lastSuccess:refreshData.lastSuccess,nextScheduledDate:refreshData.nextScheduledDate,cadence:refreshData.cadence,assets:refreshData.assets,failedSources:refreshData.failedSources};
const edition=JSON.parse(await read('Project-03/design-shelf/data/shelf-edition.json'));
const catalog={schemaVersion:2,edition,references,sourceCount:references.length,assetCount:references.filter(reusableAsset).length,refresh};
await write('public/shelf/library.json',JSON.stringify(catalog));await write('data/catalog.json',JSON.stringify(catalog));
await write('data/shelf-previews.json',JSON.stringify(previews));
await write('data/asset-sources.json',await read('Project-03/design-shelf/config/asset-sources.json'));
for(const name of ['shelf-library','shelf-refresh','shelf-thumbnail']){
  const source=path.join(root,'Project-03/workshop/cloud-runtime',name+'.mjs');
  esbuild.buildSync({entryPoints:[source],outfile:path.join(output,'api',name+'.mjs'),bundle:true,minify:true,platform:'node',format:'esm',target:'node24',banner:{js:"import {createRequire as __shelfRequire} from 'node:module';const require=__shelfRequire(import.meta.url);"}});
}

// The room reads approved selected-project data directly from the PC bridge.
let quest=esbuild.buildSync({entryPoints:[path.join(root,'Project 2/idea-quest-three-spike/src/main.js')],nodePaths:[deps],bundle:true,minify:true,format:'iife',platform:'browser',target:'es2020',write:false}).outputFiles[0].text;
quest=quest.replaceAll('http://127.0.0.1:4190','__CLOUD_SUITE_ORIGIN__');
quest=quest.replaceAll('"__CLOUD_SUITE_ORIGIN__"','location.origin');
quest=quest.replaceAll('location.origin==="http://127.0.0.1:4188"&&','').replaceAll('Vault connected','PC connection pending');
quest=quest.replaceAll('PC connection pending','PC connected');
new vm.Script(quest);await write('public/ideaquest/app.js',quest);
let questIndex=await read('Project 2/idea-quest-three-spike/index.html');questIndex=questIndex.replace('<script src="./app.js"','<script src="/cloud-runtime.js" defer></script><script src="./app.js"');
questIndex=questIndex.replace('<body>','<body data-bridge="true">');
await write('public/ideaquest/index.html',questIndex);await write('public/ideaquest/styles.css',await read('Project 2/idea-quest-three-spike/styles.css'));
await write('data/core.mjs',await read('Project-03/design-shelf/src/core.mjs'));
await write('api/media.mjs',await read('Project-03/workshop/scripts/cloud-media.mjs'));
await write('package.json',JSON.stringify({name:'ideaquest-workshop-cloud',private:true,type:'module'}));
await write('vercel.json',JSON.stringify({framework:null,buildCommand:'',installCommand:'',outputDirectory:'public',functions:{'api/media.mjs':{includeFiles:'data/**',maxDuration:30}},rewrites:[{source:'/shelf/api/media/:id',destination:'/api/media?id=:id'}],headers:[{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'no-referrer'},{key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; media-src 'self' https:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'"}]}]},null,2));
await write('.vercel/project.json',JSON.stringify({orgId:'team_rYbBIpXkLNdDUrzd7HHQ5qOZ',projectId:'prj_Pgx8gFT7EwQqLkNhcLP3MCK2MHPa',projectName:'ideaquest-workshop'}));
const config=JSON.parse(await fs.readFile(path.join(output,'vercel.json'),'utf8'));
for(const name of ['shelf-library','shelf-refresh','shelf-thumbnail'])config.functions['api/'+name+'.mjs']={includeFiles:'data/**',maxDuration:name==='shelf-refresh'?300:30};
let cloudAssets;try{cloudAssets=JSON.parse(await read('Project-03/workshop/.local/cloud-assets.json'));}catch{}
if(cloudAssets?.enabled===true)config.crons=[{path:'/api/shelf-refresh',schedule:'0 15 * * 0'}];
config.headers[0].headers.find(h=>h.key==='Content-Security-Policy').value=config.headers[0].headers.find(h=>h.key==='Content-Security-Policy').value.replace("connect-src 'self';","connect-src 'self' http://127.0.0.1:4190;");
// Live samples get an isolated policy. They cannot contact the PC bridge.
config.headers[0].source='/((?!shelf/try/|prototype-preview/).*)';
config.headers.push({source:'/prototype-preview/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'no-referrer'},{key:'Cache-Control',value:'no-store'},{key:'Content-Security-Policy',value:"sandbox allow-scripts; default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'"}]});
config.headers.push({source:'/shelf/try/(.*)',headers:[{key:'Access-Control-Allow-Origin',value:'*'},{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'no-referrer'},{key:'Cache-Control',value:'no-cache'},{key:'Content-Security-Policy',value:"default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://dl.polyhaven.org; connect-src 'self' https://api.polyhaven.com https://dl.polyhaven.org; base-uri 'none'; form-action 'none'; frame-ancestors 'self'"}]});
const previewPolicy=JSON.parse(await read('Project-03/design-shelf/dist/try/policy.json'));
for(const rules of config.headers.filter(rule=>rule.source==='/shelf/try/(.*)'))for(const header of rules.headers)if(header.key==='Content-Security-Policy')header.value=header.value.replace("script-src 'self'","script-src 'self' "+previewPolicy.scriptHashes.join(' ')).replace("style-src 'self' 'unsafe-inline'","style-src 'self' "+previewPolicy.styleHash);
await write('vercel.json',JSON.stringify(config,null,2));
await write('public/THREE-LICENSE.txt',await fs.readFile(path.join(deps,'three/LICENSE'),'utf8'));
console.log('Cloud package ready: three interfaces, '+references.length+' public references. No project summaries, conversations, vault bodies or credentials included.');
