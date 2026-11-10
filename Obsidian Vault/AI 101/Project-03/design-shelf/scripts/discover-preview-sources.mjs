import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),assets=JSON.parse(await fs.readFile(new URL('data/assets.json',root),'utf8'));
const result=[];
async function read(url){try{const response=await fetch(url,{signal:AbortSignal.timeout(12000)});return response.ok?await response.text():'';}catch{return '';}}
const targets=assets.filter(r=>r.id.startsWith('asset-gh-')&&r.assetType!=='icons');let index=0;
await Promise.all(Array.from({length:3},async()=>{while(index<targets.length){const r=targets[index++],repo=new URL(r.url).pathname.slice(1),homepage=r.liveUrl||({'asset-gh-pacocoursey-cmdk':'https://cmdk.paco.me/','asset-gh-pmndrs-react-spring':'https://react-spring.dev/'}[r.id]);const html=homepage?await read(homepage):'';const meta={};for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){const attrs={};for(const m of tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g))attrs[m[1].toLowerCase()]=m[2].replaceAll('&amp;','&');if(attrs.property||attrs.name)meta[attrs.property||attrs.name]=attrs.content;}
let markdown=await read('https://raw.githubusercontent.com/'+repo+'/master/README.md');if(!markdown)markdown=await read('https://raw.githubusercontent.com/'+repo+'/main/README.md');
const images=[...markdown.matchAll(/!\[[^\]]*\]\(([^\s)]+)|<img\b[^>]*src=["']([^"']+)/gi)].map(m=>m[1]||m[2]).filter(u=>!/(badge|shields|sponsor|logo|github\/stars|contrib)/i.test(u)).slice(0,12);
result.push({id:r.id,title:r.title,homepage,og:meta['og:image'],images});}}));
await fs.writeFile(new URL('.local/preview-discovery.json',root),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
