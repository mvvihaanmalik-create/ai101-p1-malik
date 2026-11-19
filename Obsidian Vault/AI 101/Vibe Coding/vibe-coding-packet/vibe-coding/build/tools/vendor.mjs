import {mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
for(const [source,target] of [
 ['build/three.module.js','three.module.js'],['build/three.core.js','three.core.js'],
 ['examples/jsm/loaders/GLTFLoader.js','addons/loaders/GLTFLoader.js'],
 ['examples/jsm/utils/BufferGeometryUtils.js','addons/utils/BufferGeometryUtils.js'],
 ['examples/jsm/utils/SkeletonUtils.js','addons/utils/SkeletonUtils.js'],['examples/jsm/geometries/RoundedBoxGeometry.js','addons/geometries/RoundedBoxGeometry.js'],['LICENSE','LICENSE']
]){const dest=path.join(root,'vendor/three',target);await mkdir(path.dirname(dest),{recursive:true});await copyFile(path.join(root,'node_modules/three',source),dest);}
console.log('Three.js 0.187.0 runtime copied with MIT license. No CDN is used.');
