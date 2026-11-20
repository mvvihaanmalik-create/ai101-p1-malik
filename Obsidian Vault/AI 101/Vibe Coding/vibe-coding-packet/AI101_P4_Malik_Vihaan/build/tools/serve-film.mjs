import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const types = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.glb':'model/gltf-binary','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
const port=Number(process.env.PORT || 4170);
http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    let name=decodeURIComponent(url.pathname);
    if(name==='/')name='/index.html';
    const file=path.resolve(root,'.'+name);
    if(!file.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
    const info=await stat(file);
    if(!info.isFile()) {res.writeHead(404).end();return;}
    let body=await readFile(file);
    if(name==='/src/main.js'){
     let code=body.toString('utf8').replaceAll('music.openingTime()','window.filmClock').replaceAll('music.cueTime()','window.filmClock')
      .replace('let capWidth=2560','let capWidth=3840').replace('Math.min(devicePixelRatio,2,','Math.min(devicePixelRatio,3,')
      .replace("if(renderer.domElement.width>1600&&elapsed<.25)","if(false)").replace("if(graphicsLost||now-lastRender<1000/30||document.hidden)return;","if(graphicsLost)throw Error('Graphics lost during export');");
     const at=code.indexOf(' renderer.setAnimationLoop(now=>');
     if(at<0)throw Error('Missing capture insertion');
     code=code.slice(0,at)+`
      let exportTick=0;
      window.startFilm=(sequence)=>{
       window.filmClock=0;begin();if(sequence==='ending'){reviewEnding('suite');resume();startEnding(0,true);}
       capWidth=3840;resize();last=lastRender=0;exportTick=0;
      };
      window.drawFilm=(t)=>{window.filmClock=t;exportTick++;tick(exportTick*1000/30,'export');return state.mode;};
      return;
     `+code.slice(at);
     body=Buffer.from(code);
    }
    if(name==='/src/reception-ending.js')body=Buffer.from(body.toString('utf8').replace('1920/size.x','3840/size.x'));
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
    const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
    if(range){
      const start=Number(range[1]),end=Math.min(body.length-1,range[2]?Number(range[2]):body.length-1);
      if(start>end||start>=body.length){res.writeHead(416,{'Content-Range':`bytes */${body.length}`}).end();return;}
      res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${body.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:body.subarray(start,end+1));return;
    }
    res.writeHead(200,{...headers,'Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
  } catch {res.writeHead(404).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Room 0: http://127.0.0.1:${port}`));
