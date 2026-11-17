from pathlib import Path
p=Path(__file__).resolve().parent.parent
def edit(name, old, new):
 f=p/name;s=f.read_text(encoding='utf-8');assert old in s,(name,old[:80]);f.write_text(s.replace(old,new),encoding='utf-8')
edit('src/main.js',"import {fitSmile,", "import {refineGuestFace,createReceptionCounter} from './test3-art.js';\nimport {fitSmile,")
edit('src/main.js',"dataset.build='v36'","dataset.build='v37'")
edit('src/main.js','let capWidth=2304,slowTime=0;','let capWidth=1920,slowTime=0,graphicsLost=false,graphicsRecoveries=0;')
edit('src/main.js',"antialias:true,powerPreference:'high-performance'","antialias:false,powerPreference:'default'")
edit('src/main.js',"if(now-lastRender<10||document.hidden)return;","if(graphicsLost||now-lastRender<1000/30||document.hidden)return;")
edit('src/main.js',"now-lastRaf>100","now-lastRaf>500")
edit('src/main.js',"tick(now,'timer');}},16)","tick(now,'timer');}},250)")
edit('src/main.js',"for(const data of [g,b,child,props,staff,porter,dog,deskModel])costumeFinish(data.scene);","refineGuestFace(g.scene);\n for(const data of [g,b,child,props,staff,porter,dog,deskModel])costumeFinish(data.scene);")
edit('src/main.js',"scene.add(newDepth.scene);","scene.add(newDepth.scene);createReceptionCounter(scene);")
edit('src/main.js',"receptionist.position.set(31.45,.16,-7.85)","receptionist.position.set(31.45,.02,-7.85)")
edit('src/main.js',"$('world').addEventListener('webglcontextlost',e=>{e.preventDefault();pause();$('error-message').textContent='The graphics device paused. Reload to restore the passage.';$('error').hidden=false;});", """$('world').addEventListener('webglcontextlost',e=>{
  e.preventDefault();graphicsLost=true;graphicsRecoveries++;releaseMovement();pause();
  $('error-message').textContent='Restoring the graphics device. Your room and progress are saved.';$('error').hidden=false;
 });
 $('world').addEventListener('webglcontextrestored',()=>{
  graphicsLost=false;capWidth=1280;renderer.shadowMap.enabled=false;resize();needsRender=true;
  $('error').hidden=true;$('music-status').textContent='Graphics recovered in reduced-detail mode. Resume to continue.';
 });""")
edit('src/main.js',"setRoom('reception');for(const root of Object.values(characterEncounters.roots))root.visible=true;await renderer.compileAsync(scene,camera);updateCast(0);", "setRoom('reception');updateCast(0);await renderer.compileAsync(scene,camera);")
edit('src/main.js',"build:document.body.dataset.build,suiteApproach", "build:document.body.dataset.build,graphicsLost,graphicsRecoveries,gpuTextures:renderer.info.memory.textures,suiteApproach")
edit('src/main.js',"function ring(){[880,1317,1763,2310].forEach((f,i)=>tone(f,1.8,.09/(i+1)));}", "let lastBell=-Infinity;\nfunction ring(){lastBell=state.time;[880,1317,1763,2310].forEach((f,i)=>tone(f,2.4,.24/(i+1)));}")
edit('src/main.js',"if(bell){", "if(bell.visible&&room==='corridor'&&state.time-lastBell>5.2)ring();\n if(bell){")
edit('src/main.js',"bell.rotation.set(0,0,0);}\n }", "bell.rotation.set(0,0,.23*Math.sin((state.time-lastBell)*23)*Math.exp(-Math.max(0,state.time-lastBell)*3));}\n }")
edit('src/main.js',"Turn a case toward the mirror and compare its stamp with your ticket.","The porter holds the staff-stair key with the honeymoon luggage. Turn the cases toward the mirror; match the stamp to your suite ticket.")
edit('src/main.js',"textContent='Claim ticket'","textContent='Honeymoon suite · luggage receipt'")
edit('src/main.js',"say('Match your ticket to the stamp in the mirror.',4.5)","say('The staff-stair key is with your luggage. Match your suite receipt to a case in the mirror.',9)")
edit('src/main.js',"textContent='Honeymoon suite · claimed yesterday';","textContent='Honeymoon suite · claimed yesterday';say('Your receipt is dated yesterday. Inside: the staff-stair key. You have never stayed here before.',9);")
edit('src/main.js',"say('Wrong stamp.',2)","say('Wrong stamp. That case belongs to another room.',3)")
# A real, opaque cabinet replaces the ambiguous depth-only waist cut in all reception shots.
edit('src/reception-ending.js',"import {renderPlate,", "import {createReceptionCounter} from './test3-art.js';\nimport {renderPlate,")
edit('src/reception-ending.js',"const desk=new THREE.Mesh(new THREE.BoxGeometry(2.85,1.24,.98),new THREE.MeshBasicMaterial({colorWrite:false}));desk.position.set(31.5,.62,-6.9);desk.renderOrder=-2;scene.add(desk);", "const desk=createReceptionCounter(scene);")
edit('src/reception-ending.js',"samples:Math.min(2,renderer.capabilities.maxSamples)","samples:0")
edit('src/reception-ending.js',"2304/size.x","1920/size.x")
edit('src/ending-procession.js',"p===lady?.16:.02",".02")
# Avoid sliding the planted porter backwards through his walk animation.
edit('src/character-encounters.js',"const wave=Math.sin(time*.30);traveller.holder.position.z=-14.1+wave*.30;", "const wave=Math.sin(time*.60);traveller.holder.position.z=-14.15;")
edit('src/character-encounters.js',"const walking=Math.abs(Math.cos(time*.30))*.65;","const walking=0;")
edit('src/character-encounters.js',"hand.quaternion.rotateTowards(lower.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(wanted),.47);", "hand.quaternion.rotateTowards(lower.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(wanted),.42);")
edit('src/character-encounters.js',"sign*.34,-.28,.90","sign*.18,-.08,.98")
edit('src/character-encounters.js',"const t=(current.barClock??time)%9;", "const t=(current.barClock??time)%9;\n   const horror=changed?beat(t,1,2.2)*(1-beat(t,7.5,8.8)):0;\n   bartender.smile(changed?1.9:.35,changed?.75:.12);bartender.head.rotation.z-=.52*horror;\n   bartender.head.rotation.x-=.24*horror;\n   bottle.rotation.z=-1.65*horror;\n   wineFall.visible=horror>.02;wineFall.scale.y=Math.max(.01,horror);winePool.scale.setScalar(.4+.6*horror);winePool.visible=changed;\n   metrics.bartenderHorror=+horror.toFixed(3);")
edit('src/character-encounters.js',"const glass=new THREE.Group();", """const wineMat=new THREE.MeshStandardMaterial({color:0x610617,roughness:.20,metalness:.12});
 const wineFall=mesh(bar,new THREE.CylinderGeometry(.009,.017,.84,10),wineMat,[1.14,.68,-13.40]);wineFall.visible=false;
 const winePool=mesh(bar,new THREE.CircleGeometry(.19,32),wineMat,[1.14,.065,-13.40]);winePool.rotation.x=-Math.PI/2;winePool.visible=false;
 const glass=new THREE.Group();""")
# Stable idle and additive breathing, not a full-body Raise clip and rigid root swivel.
edit('src/luggage-room.js',"import {fitSmile}","import {fitSmile,secondaryPose}")
edit('src/luggage-room.js',"const head=figure.getObjectByName('head');", "const motion=secondaryPose(figure,['spine_01','spine_02','head','clavicle_r','upperarm_r','lowerarm_r']);\n let age=0;\n const head=figure.getObjectByName('head');")
edit('src/luggage-room.js',"if(head)head.quaternion.copy(neutralHead);\n  greet(recognitionTime>0?.24:.66);mixer.update(dt);", "motion.restore();age+=dt;\n  greet(recognitionTime>0?.24:.66);mixer.update(dt);\n  motion.turn('spine_01',.012*Math.sin(age*1.5),.015*Math.sin(age*.6));\n  motion.turn('spine_02',-.007*Math.sin(age*1.5));\n  if(head)head.rotation.y+=.08*Math.sin(age*.55);")
edit('src/luggage-room.js',"figure.rotation.y=Math.PI+.20-1.0*ease(recognitionTime,2,3.25);\n   if(previous<2.65&&recognitionTime>=2.65){release.reset().play();idle.crossFadeTo(release,.4,false);}", "const point=ease(recognitionTime,2,3.25)*(1-ease(recognitionTime,4.55,5.8));\n   motion.turn('clavicle_r',0,-.06*point);motion.turn('upperarm_r',-.24*point,0,-.18*point);motion.turn('lowerarm_r',-.32*point);\n   if(head)head.rotation.y-=.27*point;")
edit('src/luggage-room.js',"'Claim case'","'Open my case'")
edit('src/encounter-catalogue.js',"A released glass rises into a waiting hand.","The bartender tilts his head, grins and pours an endless red stream over the bar.")
# Compatibility format for Chromium builds without MP3 media support.
edit('src/music-score.js',"const tracks={hotel:new Audio('assets/audio/dance-of-the-dream-man.mp3')};", "const tracks={hotel:new Audio()};\n const preferred=tracks.hotel.canPlayType?.('audio/mpeg')?'assets/audio/dance-of-the-dream-man.mp3':'assets/audio/dance-of-the-dream-man.ogg';\n tracks.hotel.src=preferred;")
edit('src/music-score.js',"audio.addEventListener('error',()=>{failures.add(name);onError('Music could not load. Hotel effects remain available.');});", "audio.addEventListener('canplay',()=>{failures.delete(name);onError('');if(!paused&&mode==='hotel')play(name);});\n  audio.addEventListener('error',()=>{\n   if(!audio.src.endsWith('.ogg')){audio.src='assets/audio/dance-of-the-dream-man.ogg';audio.load();return;}\n   failures.add(name);onError('Music could not load. Resume to retry.');\n  });")
edit('src/music-score.js',"if(!failures.has(name))tracks[name].play()", "if(failures.delete(name))tracks[name].load();tracks[name].play()")
edit('src/finale-cue.js',"fetch('assets/audio/hotel-california-credits.mp3')", "fetch('assets/audio/hotel-california-credits.ogg')")
edit('tools/prepare-deploy.mjs','webp|mp3','webp|mp3|ogg')
edit('tools/serve.mjs',"'.mp3':'audio/mpeg'","'.mp3':'audio/mpeg','.ogg':'audio/ogg'")
