import {readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
for(const f of readdirSync('src').filter(f=>f.endsWith('.js'))){execFileSync(process.execPath,['--check','src/'+f],{stdio:'inherit'});console.log('Syntax OK: '+f);}
