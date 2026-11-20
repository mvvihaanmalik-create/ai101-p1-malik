from pathlib import Path
p=Path('src/main.js');s=p.read_text(encoding='utf-8')
def edit(a,b):
 global s
 assert a in s,a
 s=s.replace(a,b)
edit("import {refineGuestFace", "import {OPENING_LENGTH,RECEPTION_AT,openingLyricAt} from './opening-cue.js';\nimport {createWelcomeCandle} from './welcome-candle.js';\nimport {refineGuestFace")
edit('deskMixer,arrival=null;','deskMixer,deskWelcome,arrival=null;')
edit("function finishArrival(){arrival=null;releaseMovement();$('caption').classList.remove('show');}", "function finishArrival(){arrival=null;releaseMovement();$('stage').classList.remove('opening-film');setOpeningLyric(-1);if(music.snapshot().mode==='opening')music.startHotel(audioCtx);$('caption').classList.remove('show');}")
a=s.index('function advanceArrival(dt){');b=s.index('const $=',a)
s=s[:a]+'''function advanceArrival(dt){
 arrival.time=arrival.musical?Math.max(0,music.openingTime()-RECEPTION_AT):arrival.time+dt;
 if(arrival.musical){music.updateOpening();setOpeningLyric(music.openingTime());}
 if(arrival.time>=5.06&&arrival.beat===0){
  arrival.beat=1;say('The lift is broken. Take the east stairs. I will show you.',9);
 }
 if(arrival.time>=11.0)arrival.beat=2;
 if(arrival.time>=OPENING_LENGTH-RECEPTION_AT)finishArrival();
}
'''+s[b:]
edit('deskMixer.update(dt);deskSmile', 'deskWelcome?.restore();deskMixer.update(dt);deskSmile')
edit('characterEncounters.update(state.time,dt,room,', "deskWelcome?.pose(arrival?.musical?music.openingTime():-1,room==='reception'&&Boolean(arrival));\n characterEncounters.update(state.time,dt,room,")
edit("document.body.dataset.build='v38';", "document.body.dataset.build='v39';")
edit('desert=createDesertArrival(g,nightCar,driverTake);','desert=createDesertArrival(g,nightCar,driverTake,deskModel);')
edit("deskMixer.clipAction(deskModel.animations.find(a=>a.name==='Idle')).play();", "deskMixer.clipAction(deskModel.animations.find(a=>a.name==='Idle')).play();deskMixer.update(0);deskWelcome=createWelcomeCandle(scene,receptionist,deskModel.scene);")
edit('await foley.ready;state.mode=', 'await Promise.all([foley.ready,music.prepareOpening()]);state.mode=')
edit("arrival=null;roadTime=null;$('stage').classList.remove('on-road');", "arrival=null;roadTime=null;$('stage').classList.remove('on-road','opening-film');if(music.snapshot().mode==='opening')music.startHotel(audioCtx);")
edit('function setLyric(t){', "function setOpeningLyric(t){const node=$('lyric'),line=openingLyricAt(t);if(node.textContent!==line)node.textContent=line;node.hidden=!line;}\nfunction setLyric(t){")
edit("$('caption').classList.remove('show');roadTime=0;roadStep=undefined;foley.enter('road');music.updateHotel(0,'road');foley.stop();desert.frame(roadTimeAt(0),0);$('stage').classList.add('on-road');", "$('caption').classList.remove('show');roadTime=0;roadStep=undefined;foley.enter('road');foley.stop();music.startOpening(audioCtx);desert.frame(roadTimeAt(0),0,0);$('stage').classList.add('on-road','opening-film');")
edit("function enterReception(){", "function enterReception(skipped=false){")
edit("arrival={time:0,beat:0};say('Receptionist: \\u201cWelcome. I have the honeymoon suite for you.\\u201d',5.8);", "if(skipped){music.startHotel(audioCtx);setOpeningLyric(-1);$('stage').classList.remove('opening-film');}\n arrival={time:0,beat:0,musical:!skipped};say('I am sorry. Only the honeymoon suite is available.',5.06);")
edit("if(roadTime!==null&&roadTimeAt(roadTime)>=0)foley.engine(roadTimeAt(roadTime));", "")
edit("const before=roadTimeAt(roadTime);roadTime+=dt;const shotTime=roadTimeAt(roadTime);const step=desert.frame(shotTime,dt);", "const before=roadTimeAt(roadTime),previous=roadTime;roadTime=music.openingTime();music.updateOpening();setOpeningLyric(roadTime);\n  const shotTime=roadTimeAt(roadTime);const step=desert.frame(shotTime,dt,roadTime);foley.drive(roadTime);")
edit("if(before<0&&shotTime>=0)foley.engine(0);", "")
edit("if(roadTime<10&&Math.floor((roadTime-dt)*2)!==Math.floor(roadTime*2)){tone(39+3*Math.sin(roadTime*2),.65,.09,'triangle');tone(78,.45,.025);}", "if(previous<36.4&&roadTime>=36.4)ring();")
edit("$('world').style.filter=roadTime<16?'grayscale(1) contrast(1.12)':'none';", "$('world').style.filter=roadTime<18?'grayscale(1) contrast(1.12)':roadTime>=26&&roadTime<29.2?`blur(${(.6*Math.sin((roadTime-26)/3.2*Math.PI)).toFixed(2)}px)`:'none';")
edit("road:roadTime===null?null:{time:roadTime,shot:desert.shot}", "road:roadTime===null?null:{time:roadTime,...desert.snapshot()}")
edit("if(soundOn&&roadTime!==null&&state.mode==='playing')foley.engine(roadTime);", "")
edit("if(roadTime!==null){if(k==='e'&&!e.repeat)enterReception();return;}", "if(roadTime!==null){if(k==='e'&&!e.repeat)enterReception(true);return;}")
p.write_text(s,encoding='utf-8')
