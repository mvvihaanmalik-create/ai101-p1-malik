import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import media from '../cloud/api/media.mjs';
const root=fileURLToPath(new URL('../cloud/public/',import.meta.url));
const server=http.createServer(async(req,res)=>{
  let url=new URL(req.url,'http://localhost');
  const match=url.pathname.match(/^\/shelf\/api\/media\/([^/]+)$/);
  if(match){url.pathname='/api/media';url.searchParams.set('id',decodeURIComponent(match[1]));req.url=url.pathname+url.search;return media(req,res);}
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));
  if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end('Not found');}
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
});
server.listen(4191,'127.0.0.1',()=>console.log('Cloud review: http://127.0.0.1:4191/'));
