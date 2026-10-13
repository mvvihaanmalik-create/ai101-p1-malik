import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { createVaultStore } from './vault-store.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const destination = path.join(here,'public-deploy');
fs.mkdirSync(destination,{recursive:true});
const require = createRequire(import.meta.url);
const esbuild = require('C:/Users/91982/AppData/Local/AI101Projects/idea-quest-three-build/node_modules/esbuild');
esbuild.buildSync({entryPoints:[path.join(here,'src/main.js')],outfile:path.join(here,'app.js'),nodePaths:['C:/Users/91982/AppData/Local/AI101Projects/idea-quest-three-build/node_modules'],bundle:true,minify:true,format:'iife',platform:'browser',target:'es2020'});
const store = createVaultStore({vaultRoot:path.resolve(here,'../..'),dataFile:path.resolve(here,'../progress-arcade/projects.json')});
let state;try{state=store.read();}finally{store.close();}
const publicKeys = ['id','title','pitch','kind','phase','released','repository','live','nextMove','changed','gates','gateNames','legacyWorkflow','milestones','updatedAt'];
const snapshot = {version:2,activeProjectId:state.activeProjectId,projects:state.projects.map(project=>({...Object.fromEntries(publicKeys.filter(key=>project[key]!==undefined).map(key=>[key,project[key]])),sessions:[],activity:[],updates:[]})),candidates:[],sync:{root:'Published collection',mode:'hosted',asOf:new Date().toISOString(),warnings:[]}};
const html = fs.readFileSync(path.join(here,'index.html'),'utf8').replace('<body>','<body data-mode="hosted">').replace('Opening your vault…','Opening the collection…');
fs.writeFileSync(path.join(destination,'index.html'),html);
fs.writeFileSync(path.join(destination,'projects.json'),JSON.stringify(snapshot,null,2)+'\n');
for(const file of ['app.js','styles.css','THREE-LICENSE.txt'])fs.copyFileSync(path.join(here,file),path.join(destination,file));
fs.writeFileSync(path.join(destination,'vercel.json'),JSON.stringify({framework:null,buildCommand:'',installCommand:'',outputDirectory:'.'},null,2)+'\n');
const files = ['index.html','app.js','styles.css','projects.json','THREE-LICENSE.txt','vercel.json'].map(file=>{const data=fs.readFileSync(path.join(destination,file));return {file,sha:createHash('sha1').update(data).digest('hex'),size:data.length};});
fs.writeFileSync(path.join(here,'deployment-manifest.json'),JSON.stringify({project:'idea-quest-ai101',projectId:'prj_zblNLbIE9RMYCLvgbmcWDpdHipAQ',accountId:'team_rYbBIpXkLNdDUrzd7HHQ5qOZ',asOf:snapshot.sync.asOf,files},null,2)+'\n');
process.stdout.write(JSON.stringify({files,projects:snapshot.projects.length,asOf:snapshot.sync.asOf}));
