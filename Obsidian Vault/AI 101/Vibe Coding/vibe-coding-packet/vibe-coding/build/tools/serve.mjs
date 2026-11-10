import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const types = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.glb':'model/gltf-binary','.mp3':'audio/mpeg'};
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
    const body=await readFile(file);
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
