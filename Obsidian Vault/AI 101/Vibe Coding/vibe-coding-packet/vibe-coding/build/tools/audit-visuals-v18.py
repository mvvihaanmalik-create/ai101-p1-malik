"""Check native output, camera registration, low-frequency colour and variant identity."""
from pathlib import Path
import json,sys
from PIL import Image,ImageDraw,ImageFont
import numpy as np
assets=Path(__file__).resolve().parents[1]/'assets'
proof=assets.parents[1]/'build-record/tests/visual-18'
meta=json.loads((assets/'hotel-v15.json').read_text());ends=json.loads((assets/'ending-v6.json').read_text())
allfiles=[c['plate'] for c in meta['cameras']+ends['shots']]+[f for v in meta['variants'].values() for f in v.values()]
small=lambda im:np.asarray(im.convert('RGB').resize((128,72),Image.Resampling.BOX),dtype=float)
stats=[];skipped=[]
for f in allfiles:
    path=assets/'masters-v18'/f
    if not path.is_file():skipped.append(f);continue
    with Image.open(path) as im,Image.open(assets/f) as old,Image.open(assets/'proxies-v18'/f) as proxy:
        assert im.size==(2560,1440) and old.size==(1920,1080) and proxy.size==(1280,720),f
        v=small(im)-small(old)
        stats.append(dict(file=f,bytes=path.stat().st_size,meanAbsRGB=round(abs(v).mean(),2),lumaShift=round((v@np.array([.2126,.7152,.0722])).mean(),2)))
def image(f):return small(Image.open(assets/'masters-v18'/f))
variants=[]
for k,shots in meta['variants'].items():
    for idx,f in shots.items():
        base=meta['cameras'][int(idx)]['plate']
        if base in skipped or f in skipped:continue
        old=small(Image.open(assets/f))-small(Image.open(assets/base));new=image(f)-image(base)
        mask=abs(old).max(axis=2)>15
        # A wide shot does not necessarily see every variant; only assess clearly visible differences.
        if mask.sum()>=12:
            a=old[mask].flatten();b=new[mask].flatten()
            variants.append(dict(variant=k,shot=idx,activePixels=int(mask.sum()),agreement=round(float(a@b/(np.linalg.norm(a)*np.linalg.norm(b)+1e-8)),3)))
result=dict(expected=len(allfiles),rendered=len(stats),missing=skipped,shots=stats,variants=variants)
(proof/'camera-audit.json').write_text(json.dumps(result,indent=2))
print('Cameras:',len(stats),'of',len(allfiles),'| largest change:',max(stats,key=lambda s:s['meanAbsRGB']) if stats else None,'| observed variant agreements:',[v['agreement'] for v in variants])
if '--final' in sys.argv:
    assert not skipped and len(stats)==38
    assert all(r['meanAbsRGB']<6 for r in stats),'Unexpected colour or composition change'
    assert all(v['agreement']>.80 for v in variants),'Inspect anomaly registration'

