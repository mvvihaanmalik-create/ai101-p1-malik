import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {normalizeReference,dedupeReferences} from '../src/core.mjs';
import {imageExtension} from './cache-asset-thumbnails.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFile(path.join(root,p),'utf8');
const core=(await read('src/core.mjs')).replace(/^export /gm,'');
const assets={};
const require=createRequire(import.meta.url),esbuild=require(process.env.AI101_BUILD_DEPS?path.join(process.env.AI101_BUILD_DEPS,'esbuild'):'C:/Users/91982/AppData/Local/AI101Projects/idea-quest-three-build/node_modules/esbuild');
const demoBuild=await esbuild.build({entryPoints:[path.join(root,'src/try/preview.js')],outdir:path.join(root,'dist/try'),bundle:true,splitting:true,format:'esm',minify:true,platform:'browser',target:'es2022',write:false,legalComments:'linked',define:{'process.env.NODE_ENV':'"production"'},chunkNames:'[name]-[hash]'});
for(const file of demoBuild.outputFiles)assets['/try/'+path.basename(file.path)]={type:'application/javascript; charset=utf-8',body:file.text};
assets['/try/index.html']={type:'text/html; charset=utf-8',body:await read('src/try/index.html')};
assets['/try/preview.css']={type:'text/css; charset=utf-8',body:await read('src/try/preview.css')};
// Each preview is one authenticated document with no extra script requests.
// Project state never enters the opaque sandbox; hashes allow only this code.
const previewPolicy={scriptHashes:[],styleHash:"'sha256-"+createHash('sha256').update(assets['/try/preview.css'].body).digest('base64')+"'"};
for(const [group,file] of [['motion','motion.jsx'],['scene','scene.jsx']]){
  const entry=`import {mount} from './${file}';const root=document.querySelector('#demo'),q=Object.fromEntries(new URLSearchParams(location.search));function fail(){root.innerHTML='<p class="error" role="status"><strong>This preview couldn’t load.</strong>Try again, or use Source preview.</p>';parent.postMessage({type:'shelf:preview-error'},'*');}addEventListener('error',fail,{once:true});addEventListener('unhandledrejection',fail,{once:true});document.addEventListener('keydown',e=>{if(e.key==='Escape')parent.postMessage({type:'shelf:preview-close'},'*');});Promise.resolve().then(()=>mount(root,q.demo,q.model)).catch(fail);`;
  const output=await esbuild.build({stdin:{contents:entry,resolveDir:path.join(root,'src/try'),sourcefile:group+'-frame.js'},bundle:true,format:'iife',minify:true,platform:'browser',target:'es2022',write:false,legalComments:'inline',define:{'process.env.NODE_ENV':'"production"'}});
  const script=output.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'),hash="'sha256-"+createHash('sha256').update(script).digest('base64')+"'";previewPolicy.scriptHashes.push(hash);
  const policy=`default-src 'none'; script-src ${hash} 'wasm-unsafe-eval'; style-src ${previewPolicy.styleHash} 'unsafe-inline'; img-src data: blob: https://dl.polyhaven.org; connect-src https://api.polyhaven.com https://dl.polyhaven.org; base-uri 'none'; form-action 'none'`;
  assets['/try/frame-'+group+'.html']={type:'text/html; charset=utf-8',body:'<!doctype html><html lang="en" data-shelf-preview="1"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="'+policy+'"><style>'+assets['/try/preview.css'].body+'</style></head><body><main id="demo"><p class="loading" role="status">Loading preview…</p></main><script>'+script+'</script></body></html>'};
}
const dependencyLock=JSON.parse(await read('package-lock.json'));let notices='Design Shelf interactive previews: third-party licenses\n\n';
for(const name of Object.keys(dependencyLock.packages).filter(name=>name.startsWith('node_modules/')).sort()){
  for(const file of ['LICENSE','LICENSE.md','LICENSE.txt','license','license.md','license.txt']){
    try{const license=await read(name+'/'+file);notices+=name+'\n'+license+'\n\n';break;}catch(error){if(error.code!=='ENOENT')throw error;}
  }
}
assets['/try/licenses.txt']={type:'text/plain; charset=utf-8',body:notices};
await fs.mkdir(path.join(root,'dist/try'),{recursive:true});
await fs.writeFile(path.join(root,'dist/try/files.json'),JSON.stringify(Object.keys(assets).map(name=>name.slice(1))));
await fs.writeFile(path.join(root,'dist/try/policy.json'),JSON.stringify(previewPolicy));
for(const [name,type] of [['index.html','text/html; charset=utf-8'],['styles.css','text/css; charset=utf-8'],['app.js','application/javascript; charset=utf-8']])assets['/'+name]={type,body:(name==='app.js'?core+'\n':'')+await read('src/'+name)};
assets['/app.js'].body=assets['/app.js'].body.replace('/*__ICONS__*/',await read('src/icons.js'));
const previews=JSON.parse(await read('config/asset-previews.json'));
assets['/previews/manifest.json']={type:'application/json; charset=utf-8',body:JSON.stringify(previews)};
for(const p of Object.values(previews))if(p.thumbnailVerifiedAt){
  if(p.kind==='font'){const bytes=await fs.readFile(path.join(root,'assets/previews',p.file));if(bytes.toString('ascii',0,4)!=='wOF2')throw Error('Invalid font specimen');}
  else imageExtension(await fs.readFile(path.join(root,'assets/previews',p.thumbnailFile)));
}
assets['/app.js'].body=assets['/app.js'].body.replace('/*__ASSET_PREVIEWS__*/',(await read('src/asset-previews.js')).replace('/*__PREVIEW_DATA__*/ {}',JSON.stringify(previews)));
assets['/app.js'].body=assets['/app.js'].body.replace('/*__PIP__*/',await read('src/pip.js'));
assets['/app.js'].body=assets['/app.js'].body.replace('/*__CATEGORIES__*/',await read('src/categories.js'));
assets['/app.js'].body=assets['/app.js'].body.replace('/*__POLISH__*/',(await read('src/category-slider.js'))+'\n'+await read('src/polish.js'));
assets['/styles.css'].body+='\n'+await read('src/polish.css')+'\n'+await read('src/material.css')+'\n'+await read('src/identity.css');
assets['/styles.css'].body+='\n'+await read('src/asset-previews.css');
assets['/styles.css'].body+='\n'+await read('src/simplify.css');
for(const [id,p] of Object.entries(previews)){
  for(const name of [...new Set([p.file,p.licenseFile,p.tryPoster,p.thumbnailFile].filter(Boolean))]){
    if(!/^(?:licenses\/)?[a-z0-9_.-]+\.(svg|woff2|txt|png|jpg|gif|webp)$/i.test(name))throw Error('Invalid preview file');
    const data=await fs.readFile(path.join(root,'assets/previews',name)),ext=path.extname(name).slice(1),binary=!['txt','svg'].includes(ext);
    assets['/previews/'+name]={type:({woff2:'font/woff2',png:'image/png',svg:'image/svg+xml',jpg:'image/jpeg',gif:'image/gif',webp:'image/webp',txt:'text/plain'})[ext],...(binary?{encoding:'base64',body:data.toString('base64')}:{body:data.toString('utf8')})};
  }
  if(p.kind==='font')assets['/styles.css'].body+='\n@font-face{font-family:"Shelf-'+id+'";src:url("/previews/'+p.file+'") format("woff2");font-weight:400;font-style:normal;font-display:swap}.font-specimen[data-font="'+id+'"]{font-family:"Shelf-'+id+'",serif}';
}
assets['/fonts/InterVariable.woff2']={type:'font/woff2',encoding:'base64',body:(await fs.readFile(path.join(root,'assets/InterVariable.woff2'))).toString('base64')};
assets['/fonts/LICENSE.txt']={type:'text/plain; charset=utf-8',body:await read('assets/Inter-LICENSE.txt')};
for(const name of ['pip'])assets['/'+name+'.svg']={type:'image/svg+xml',body:await read('assets/'+name+'.svg')};
assets['/shelf.png']={type:'image/png',encoding:'base64',body:(await fs.readFile(path.join(root,'assets/shelf-glass-256.png'))).toString('base64')};
assets['/icon.png']={type:'image/png',encoding:'base64',body:(await fs.readFile(path.join(root,'assets/shelf-glass-64.png'))).toString('base64')};
const markHash=createHash('sha256').update(assets['/shelf.png'].body).digest('hex').slice(0,10);
for(const name of ['/index.html','/app.js'])assets[name].body=assets[name].body.replaceAll('/shelf.png','/shelf.png?v='+markHash).replaceAll('/icon.png','/icon.png?v='+markHash);
for(const name of ['styles.css','app.js']) {const hash=createHash('sha256').update(assets['/'+name].body).digest('hex').slice(0,12);assets['/index.html'].body=assets['/index.html'].body.replace('/'+name,'/'+name+'?v='+hash);}
const guide=JSON.parse(await read('config/update-guide.json'));
// Private note summaries are runtime data. They are never part of source upload
// or deployment artifacts; the owner-approved note bridge supplies them later.
let collected=[];try{collected=JSON.parse(await read('data/assets.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
const edition=JSON.parse(await read('data/shelf-edition.json'));
const bundle={assets,previewPolicy,edition,previews,references:dedupeReferences([...JSON.parse(await read('data/references.json')),...collected].map(r=>normalizeReference(r))),projects:{schemaVersion:1,generatedAt:null,activeProjectId:null,projects:[]},builtAt:new Date().toISOString(),updateGuide:guide};
const agentSource=await read('worker/agent.mjs');
const worker=(await read('worker/index.js')).replace('/*__CORE__*/',()=>core).replace('/*__AGENT__*/',()=>agentSource).replace('/*__BUNDLE__*/ null',()=>JSON.stringify(bundle));
await fs.mkdir(path.join(root,'dist/server'),{recursive:true});await fs.mkdir(path.join(root,'dist/.openai'),{recursive:true});
await fs.writeFile(path.join(root,'dist/server/index.js'),worker);
await fs.copyFile(path.join(root,'.openai/hosting.json'),path.join(root,'dist/.openai/hosting.json'));
console.log(`Built Design Shelf: ${bundle.references.length} public references; note summaries excluded from deployment.`);
