"""Repeatable, seamless material studies and lightweight camera stand-ins."""
import json
from pathlib import Path
import numpy as np
from PIL import Image
assets=Path(__file__).resolve().parents[1]/'assets'
out=assets/'surfaces-v18';out.mkdir(exist_ok=True)
n=512
y,x=np.indices((n,n))*2*np.pi/n
rng=np.random.default_rng(1718)
def waves(spec):
    return sum(amp*np.sin(a*x+b*y+rng.uniform(0,2*np.pi)) for a,b,amp in spec)
# Values are neutral reflectance multipliers. Existing skin/fur/uniform colour is kept.
warp=waves([(1,2,.8),(2,-1,.3),(4,3,.12)])
wood=207+12*np.sin(13*x+warp+2*np.sin(y))+8*np.sin(43*x+3*warp)+5*np.sin(81*x+7*warp)+waves([(1,0,7),(3,1,7),(2,2,4)])
wool=222+10*np.sin(74*x+74*y)+5*np.cos(112*x-112*y)+4*np.cos(39*x)*np.cos(39*y)
velvet=216+waves([(0,1,9),(5,1,3),(9,2,3)])+4*np.cos(106*x)*np.cos(99*y)
brass=222+waves([(1,3,7),(3,2,6),(9,1,3),(1,99,3),(0,153,2)])
# Small leather cells use wrapped jittered seed points for continuous edges.
grid=46; yy,xx=np.indices((n,n))*grid/n;ix=np.floor(xx).astype(int);iy=np.floor(yy).astype(int)
j=rng.uniform(.13,.87,(grid,grid,2));d1=np.full((n,n),9.);d2=d1.copy()
for s in (-1,0,1):
    for t in (-1,0,1):
        p=j[(iy+t)%grid,(ix+s)%grid];d=(ix+s+p[:,:,0]-xx)**2+(iy+t+p[:,:,1]-yy)**2
        d2=np.minimum(d2,np.maximum(d,d1));d1=np.minimum(d1,d)
leather=194+27*np.clip((d2-d1)*5,0,1)+waves([(3,1,5),(1,-2,4)])
for key,v in [('walnut',wood),('twill',wool),('velvet',velvet),('brass',brass),('leather',leather)]:
    a=np.clip(v+rng.normal(0,2,v.shape),0,255).astype('uint8')
    Image.fromarray(a).convert('RGB').save(out/(key+'.webp'),quality=89,method=6)
meta=json.loads((assets/'hotel-v15.json').read_text());end=json.loads((assets/'ending-v6.json').read_text())
files={c['plate'] for c in meta['cameras']+end['shots']}|{f for choices in meta['variants'].values() for f in choices.values()}
proxies=assets/'proxies-v18';proxies.mkdir(exist_ok=True)
for f in sorted(files):
    with Image.open(assets/f) as im:im.resize((1280,720),Image.Resampling.LANCZOS).save(proxies/f,quality=90,method=5)
print(len(files),'previews, five material studies')
