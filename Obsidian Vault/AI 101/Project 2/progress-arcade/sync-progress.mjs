import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderProgressNote } from './server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const state = JSON.parse(fs.readFileSync(path.join(here, 'projects.json'), 'utf8'));
fs.writeFileSync(path.join(here, '..', 'progress.md'), renderProgressNote(state), 'utf8');
process.stdout.write('Updated ../progress.md from projects.json\n');
