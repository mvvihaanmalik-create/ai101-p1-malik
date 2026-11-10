import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const input=process.stdin;
if(input.isTTY)input.setRawMode(true);
input.setEncoding('utf8');input.resume();
console.log('Ready for private connection JSON on stdin (input is hidden).');
let buffer='';
input.on('data',chunk=>{buffer+=chunk;const index=buffer.search(/[\r\n]/);if(index<0)return;input.pause();if(input.isTTY)input.setRawMode(false);const connection=JSON.parse(buffer.slice(0,index));const result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',fileURLToPath(new URL('save-connection.ps1',import.meta.url))],{input:JSON.stringify(connection)+'\n',encoding:'utf8',windowsHide:true,env:{...process.env,PSModulePath:undefined}});if(result.status!==0){console.error('Could not save the private connection: '+(result.error?.code||result.stderr||result.status).toString().split(connection.token).join('[redacted]'));process.exit(1);}console.log(result.stdout.trim());process.exit(0);});
