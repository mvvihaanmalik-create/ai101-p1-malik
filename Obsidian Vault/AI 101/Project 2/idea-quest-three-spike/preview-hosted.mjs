import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const assets={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/styles.css':['styles.css','text/css'],'/projects.json':['projects.json','application/json']};
http.createServer((request,response)=>{const asset=assets[new URL(request.url,'http://localhost').pathname];if(!asset||request.method!=='GET'){response.writeHead(404);response.end('Not found');return;}response.writeHead(200,{'Content-Type':asset[1]+'; charset=utf-8','Cache-Control':'no-store'});response.end(fs.readFileSync(path.join(here,'public-deploy',asset[0])));}).listen(4190,'127.0.0.1',()=>process.stdout.write('Hosted edition check: http://127.0.0.1:4190/\n'));
