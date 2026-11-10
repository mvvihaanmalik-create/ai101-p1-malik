import fs from 'node:fs/promises';
import {canonicalUrl} from '../src/core.mjs';
const root=new URL('../',import.meta.url),output=new URL('assets/previews/',root);
const assets=JSON.parse(await fs.readFile(new URL('data/assets.json',root),'utf8'));
await fs.mkdir(new URL('licenses/',output),{recursive:true});
async function remote(url){const response=await fetch(canonicalUrl(url),{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'},signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(response.status+' '+url);return response;}
const text=async url=>(await remote(url)).text();
const manifest=JSON.parse(await fs.readFile(new URL('config/asset-previews.json',root),'utf8').catch(()=>'{}'));
const save=()=>fs.writeFile(new URL('config/asset-previews.json',root),JSON.stringify(manifest,null,2));
const names=['search','heart','star','folder','calendar','bell','home','camera','music'];
const sets=[
 ['lucide-icons/lucide','main/icons/',['search','heart','star','folder','calendar','bell','house','camera','sun'],'#4469a5'],
 ['phosphor-icons/core','main/assets/duotone/',['magnifying-glass','heart','star','folder','calendar','bell','house','camera','music-notes'].map(n=>n+'-duotone'),'#7864b5'],
 ['tailwindlabs/heroicons','master/optimized/24/solid/',['magnifying-glass','heart','star','folder','calendar','bell','home','camera','musical-note'],'#5757a3'],
 ['tabler/tabler-icons','main/icons/outline/',names,'#258b91'],
 ['feathericons/feather','main/icons/',names,'#9c744a'],
 ['iconoir-icons/iconoir','main/icons/regular/',['search','heart','star','folder','calendar','bell','home','camera','sun-light'],'#bd6577'],
 ['twbs/icons','main/icons/',['search','heart','star','folder','calendar','bell','house','camera','music-note-beamed'],'#7954ad'],
 ['radix-ui/icons','master/packages/radix-icons/icons/',['magnifying-glass','heart','star','file','calendar','bell','home','camera','speaker-loud'],'#596875'],
];
for(const [repo,base,icons,color] of sets){
  const r=assets.find(r=>r.id==='asset-gh-'+repo.replaceAll('/','-'));if(!r)throw Error('Unknown licensed source '+repo);
  if(manifest[r.id]&&!process.argv.includes('--force'))continue;
  const parts=[];
  for(const [i,name] of icons.entries()){
    const source='https://raw.githubusercontent.com/'+repo+'/'+base+name+'.svg',svg=await text(source);
    if(/<script|<foreignObject|<image|\bon\w+\s*=|(?:href|url)\s*[:=(]/i.test(svg))throw Error('Unsupported icon SVG '+source);
    const viewBox=svg.match(/viewBox=["']([\d .-]+)["']/)?.[1]||'0 0 24 24';
    const inner=svg.replace(/^[\s\S]*?<svg\b[^>]*>/,'').replace(/<\/svg>[\s\S]*$/,'');
    const attrs=svg.match(/<svg\b([^>]*)>/)?.[1]||'',presentation=[...attrs.matchAll(/\b(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin)=["']([^"']*)["']/g)].map(m=>m[1]+'="'+m[2]+'"').join(' ');
    const x=118+(i%3)*164,y=80+Math.floor(i/3)*132;
    parts.push('<svg x="'+x+'" y="'+y+'" width="62" height="62" viewBox="'+viewBox+'" '+presentation+'>'+inner+'</svg>');
  }
  const file=r.id+'.svg';
  await fs.writeFile(new URL(file,output),'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480" color="'+color+'"><title>'+r.title+' original icon samples</title><rect width="640" height="480" fill="#f4f2ee"/>'+parts.join('')+'</svg>');
  const license=await text('https://raw.githubusercontent.com/'+repo+'/'+base.split('/')[0]+'/LICENSE').catch(async()=>text('https://raw.githubusercontent.com/'+repo+'/'+base.split('/')[0]+'/LICENSE.txt')).catch(async()=>text('https://raw.githubusercontent.com/'+repo+'/'+base.split('/')[0]+'/LICENSE.md'));
  const licenseFile='licenses/'+r.id+'.txt';await fs.writeFile(new URL(licenseFile,output),license);
  manifest[r.id]={kind:'icons',file,licenseFile,sourceUrl:r.url,label:r.title+' original icons'};
  await save();
  console.log('Original icon sheet: '+r.title);
}
for(const r of assets.filter(r=>r.assetType==='fonts')){
  if(manifest[r.id]&&!process.argv.includes('--force'))continue;
  const css=await text('https://fonts.googleapis.com/css2?family='+encodeURIComponent(r.title)+':wght@400&display=swap');
  const fontUrl=[...css.matchAll(/url\((https:[^)]+)\)\s*format\(['"]woff2['"]\)/g)].at(-1)?.[1];if(!fontUrl)throw Error('No WOFF2 for '+r.title);
  const file=r.id+'.woff2',response=await remote(fontUrl);await fs.writeFile(new URL(file,output),Buffer.from(await response.arrayBuffer()));
  const licenseFile='licenses/'+r.id+'.txt';await fs.writeFile(new URL(licenseFile,output),await text(r.license.url));
  manifest[r.id]={kind:'font',file,licenseFile,sourceUrl:r.url,family:r.title,label:r.title+' font specimen'};
  await save();
  console.log('Original font: '+r.title);
}
const discovery=JSON.parse(await fs.readFile(new URL('.local/preview-discovery.json',root),'utf8'));
const choices={
 'asset-gh-adobe-react-spectrum':{file:'asset-gh-adobe-react-spectrum.png',sourceUrl:'https://react-aria.adobe.com/'},
 'asset-gh-emilkowalski-vaul':{url:'https://emilkowal.ski/vaul-post/background.mp4',kind:'video',poster:'https://vaul.emilkowal.ski/opengraph-image.png',sourceUrl:'https://emilkowal.ski/ui/building-a-drawer-component'},
 'asset-gh-shadcn-ui-ui':{url:'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/public/opengraph-image.png'},
 'asset-gh-radix-ui-primitives':{url:'https://raw.githubusercontent.com/radix-ui/primitives/main/primitives.png'},
 'asset-gh-pacocoursey-cmdk':{url:'https://raw.githubusercontent.com/dip/cmdk/main/website/public/og.png'},
 'asset-gh-motiondivision-motion':{url:'https://images.motion.dev/examples/previews/svelte/animate/v-3163b15c394c/preview.mp4',kind:'video',poster:'https://motion.dev/brand-lab/home-og.png'},
 'asset-gh-juliangarnier-anime':{url:'https://raw.githubusercontent.com/juliangarnier/anime/master/assets/images/usage-example-result.gif'},
 'asset-gh-formkit-auto-animate':{url:'https://cdn.formk.it/web-assets/motion.gif'},
 'asset-gh-pmndrs-react-spring':{url:'https://www.react-spring.dev/assets/thumbnail-CcOI_jYz.png',sourceUrl:'https://www.react-spring.dev/examples'},
 'asset-gh-pmndrs-use-gesture':{url:'https://i.imgur.com/qLKJod3.gif'},
 'asset-gh-pmndrs-drei':{url:'https://raw.githubusercontent.com/pmndrs/drei/master/docs/logo.jpg'},
 'asset-gh-pmndrs-react-three-fiber':{url:'https://raw.githubusercontent.com/pmndrs/react-three-fiber/master/docs/banner-r3f.jpg'},
 'asset-gh-mrdoob-three.js':{url:'https://threejs.org/examples/screenshots/webgl_materials_physical_transmission.jpg'},
 'asset-gh-pmndrs-react-three-rapier':{url:'https://raw.githubusercontent.com/pmndrs/react-three-rapier/HEAD/packages/react-three-rapier/misc/example-auto-colliders.jpg'},
};
for(const r of assets.filter(r=>r.id.startsWith('asset-gh-')&&r.assetType!=='icons')){
  if(manifest[r.id]&&!process.argv.includes('--force'))continue;
  const d=discovery.find(d=>d.id===r.id),choice=choices[r.id]||{url:d?.og};
  if(choice.file){await fs.access(new URL(choice.file,output));manifest[r.id]={kind:'image',file:choice.file,sourceUrl:choice.sourceUrl,label:r.title+' original interface example'};await save();continue;}
  if(!choice.url)throw Error('Missing real preview '+r.title);
  const response=await remote(choice.url),type=response.headers.get('content-type')||'';await response.body?.cancel();if(!/^(image|video)\//.test(type))throw Error('Not preview media '+r.title);
  manifest[r.id]={kind:choice.kind||'image',url:choice.url,poster:choice.poster||d?.og||null,sourceUrl:choice.sourceUrl||d?.homepage||r.url,label:r.title+' example from the original source'};
  await save();
  console.log('Source example: '+r.title);
}
await fs.writeFile(new URL('config/asset-previews.json',root),JSON.stringify(manifest,null,2));
console.log(Object.keys(manifest).length+' original previews ready.');
