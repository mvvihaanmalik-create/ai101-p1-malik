import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createVaultStore } from '../vault-store.mjs';
import { createApp } from '../server.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ideaquest-vault-test-'));
  const dataFile = path.join(root,'projects.json');
  const legacy = { activeProjectId:'legacy', projects:[{id:'legacy',title:'Existing build',pitch:'Already in the vault',phase:'active',kind:'workflow',gates:['approved','approved','active','upcoming','upcoming'],nextMove:'Review it',updates:[]}] };
  fs.writeFileSync(dataFile,JSON.stringify(legacy));
  t.after(()=>{assert.equal(path.dirname(root),os.tmpdir());assert.ok(path.basename(root).startsWith('ideaquest-vault-test-'));fs.rmSync(root,{recursive:true,force:true});});
  return { root, dataFile, legacy };
}
test('vault notes are rediscovered after edits, moves, additions and server restart', t=>{
  const f=fixture(t),store=createVaultStore({vaultRoot:f.root,dataFile:f.dataFile});store.seed();t.after(()=>store.close());
  const id=store.create({title:'My tiny build',next:'Make the first screen'});
  let p=store.read().projects.find(p=>p.id===id),file=path.join(f.root,p.vaultPath);
  fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('next: "Make the first screen"','next: "Test on a phone"')+'\nMy personal note stays here.\n');
  assert.equal(store.read().projects.find(p=>p.id===id).nextMove,'Test on a phone');
  const moved=path.join(f.root,'Moved project.md');fs.renameSync(file,moved);
  p=store.read().projects.find(p=>p.id===id);assert.equal(p.vaultPath,'Moved project.md');
  store.update(id,{action:'checkpoint',revision:p.revision,changed:'Made the first screen',next:'Try the upload'});
  assert.match(fs.readFileSync(moved,'utf8'),/My personal note stays here/);
  const restart=createVaultStore({vaultRoot:f.root,dataFile:f.dataFile});restart.seed();t.after(()=>restart.close());
  p=restart.read().projects.find(p=>p.id===id);assert.equal(p.sessions[0].changed,'Made the first screen');assert.equal(p.nextMove,'Try the upload');
  const added=path.join(f.root,'From Obsidian.md');fs.writeFileSync(added,'---\nideaquest: true\nid: from-obsidian\ntitle: From Obsidian\nphase: active\nnext: Keep building\n---\n# Notes\n');
  assert.equal(restart.read().projects.find(p=>p.id==='from-obsidian').title,'From Obsidian');
  const withoutId=path.join(f.root,'New note.md');fs.writeFileSync(withoutId,'---\nideaquest: true\ntitle: Created in Obsidian\nphase: idea\n---\nMy idea.\n');
  const discovered=restart.read().projects.find(p=>p.title==='Created in Obsidian');assert.ok(discovered.id);assert.match(fs.readFileSync(withoutId,'utf8'),/id: /);
  fs.renameSync(withoutId,path.join(f.root,'Renamed note.md'));assert.equal(restart.read().projects.find(p=>p.title==='Created in Obsidian').id,discovered.id);
  fs.unlinkSync(path.join(f.root,restart.read().projects.find(p=>p.id==='legacy').vaultPath));restart.seed();
  assert.equal(restart.read().projects.some(p=>p.id==='legacy'),false);
});
test('registry phase wins for existing workflows, while new project phase stays note-owned', t=>{
  const f=fixture(t);
  f.legacy.projects[0].phase='complete';
  f.legacy.projects[0].gates=Array(5).fill('approved');
  fs.writeFileSync(f.dataFile,JSON.stringify(f.legacy));
  const store=createVaultStore({vaultRoot:f.root,dataFile:f.dataFile});store.seed();t.after(()=>store.close());
  const workflowFile=path.join(f.root,store.read().projects.find(p=>p.id==='legacy').vaultPath);
  fs.writeFileSync(workflowFile,fs.readFileSync(workflowFile,'utf8').replace('phase: "complete"','phase: "active"'));
  const workflow=store.read().projects.find(p=>p.id==='legacy');
  assert.equal(workflow.phase,'complete');
  assert.equal(workflow.released,true);
  assert.deepEqual(workflow.gates,Array(5).fill('approved'));
  const id=store.create({title:'Note-owned build'});
  let project=store.read().projects.find(p=>p.id===id);
  store.update(id,{action:'settings',revision:project.revision,title:project.title,phase:'active',milestoneText:'Prototype'});
  project=store.read().projects.find(p=>p.id===id);
  assert.equal(project.phase,'active');
});
test('checkpoints protect newer Obsidian edits and class approvals; milestones use editable Markdown',t=>{
  const f=fixture(t),store=createVaultStore({vaultRoot:f.root,dataFile:f.dataFile});store.seed();t.after(()=>store.close());
  let p=store.read().projects[0];const original=fs.readFileSync(f.dataFile,'utf8');
  const note=path.join(f.root,p.vaultPath);fs.appendFileSync(note,'\nAn edit made in Obsidian.\n');
  assert.throws(()=>store.update(p.id,{action:'checkpoint',revision:p.revision,changed:'A change',next:'Next action'}),e=>e.status===409);
  p=store.read().projects[0];store.update(p.id,{action:'checkpoint',revision:p.revision,changed:'A change',next:'Next action'});
  assert.equal(fs.readFileSync(f.dataFile,'utf8'),original);
  assert.throws(()=>store.update(p.id,{action:'milestone',revision:store.read().projects[0].revision,index:0,done:true}),/Class approvals/);
  const id=store.create({title:'Three milestones'});p=store.read().projects.find(p=>p.id===id);
  store.update(id,{action:'settings',revision:p.revision,title:p.title,phase:'active',milestoneText:'Prototype\nPhone test\nRelease'});
  p=store.read().projects.find(p=>p.id===id);store.update(id,{action:'milestone',revision:p.revision,index:0,done:true});
  p=store.read().projects.find(p=>p.id===id);assert.deepEqual(p.gates,['approved','upcoming','upcoming']);
  const file=path.join(f.root,p.vaultPath);fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('- [ ] Phone test','- [x] Phone test'));
  assert.equal(store.read().projects.find(p=>p.id===id).gates[1],'approved');
  p=store.read().projects.find(p=>p.id===id);store.update(id,{action:'settings',revision:p.revision,title:p.title,phase:'complete',milestoneText:'Prototype\nPhone test\nRelease'});
  p=store.read().projects.find(p=>p.id===id);store.update(id,{action:'settings',revision:p.revision,title:p.title,phase:'revisiting',milestoneText:'Prototype\nPhone test\nRelease'});
  assert.equal(store.read().projects.find(p=>p.id===id).released,true);
});
test('new notes inside linked folders show activity; links deduplicate and paths stay in vault',t=>{
  const f=fixture(t),store=createVaultStore({vaultRoot:f.root,dataFile:f.dataFile});store.seed();t.after(()=>store.close());
  fs.mkdirSync(path.join(f.root,'Existing'));fs.writeFileSync(path.join(f.root,'Existing','README.md'),'# Existing');
  assert.ok(store.read().candidates.some(c=>c.title==='Existing')===false); // top-level course notes are not assumed to be projects
  const id=store.create({title:'Existing app',folder:'Existing',repository:'https://github.com/example/app',live:'https://example.com'});
  fs.writeFileSync(path.join(f.root,'Existing','New idea.md'),'A new thought');
  assert.ok(store.read().projects.find(p=>p.id===id).activity.some(a=>a.title==='New idea'));
  assert.throws(()=>store.create({title:'Duplicate',folder:'Existing',repository:'https://github.com/example/app.git'}),e=>e.status===409);
  assert.throws(()=>store.create({title:'Outside',folder:'../'}),/outside/);
  assert.throws(()=>store.create({title:'Unsafe',live:'javascript:alert(1)'}),/HTTPS/);
});
test('browser API writes checkpoints, serves notes, persists creations and rejects foreign origins',async t=>{
  const f=fixture(t),server=createApp({vaultRoot:f.root,dataFile:f.dataFile});server.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(async()=>{server.close();await once(server,'close');});
  const base=`http://127.0.0.1:${server.address().port}`,state=await (await fetch(base+'/api/projects')).json();
  const post=(route,input,origin=base)=>fetch(base+route,{method:'POST',headers:{'content-type':'application/json','x-workshop-token':state.token,origin},body:JSON.stringify(input)});
  assert.equal((await post('/api/projects',{title:'Bad origin'},'https://other.example')).status,403);
  let response=await post('/api/projects',{title:'API build',live:'https://example.com'});assert.equal(response.status,200);
  const created=await response.json(),p=created.projects.find(p=>p.id===created.id);
  response=await post('/api/projects/'+p.id,{action:'checkpoint',revision:p.revision,changed:'Built it',next:'Test it'});assert.equal(response.status,200);
  assert.match(await (await fetch(base+'/api/notes/'+p.id)).text(),/Built it/);
  assert.equal((await (await fetch(base+'/api/projects')).json()).projects.find(item=>item.id===p.id).nextMove,'Test it');
});
