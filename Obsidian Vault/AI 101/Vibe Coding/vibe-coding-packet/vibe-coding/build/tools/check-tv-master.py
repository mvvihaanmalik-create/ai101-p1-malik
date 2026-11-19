from pathlib import Path
import subprocess as s,json,numpy as np
p=Path('../build-record/walkthrough-tv-master')
movie=p/'Hotel of Horror - Full Walkthrough UHD.mp4'
d=json.loads(s.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,channels,nb_frames,start_time,duration:format=size,duration','-of','json',str(movie)]))
print(d,flush=True);assert d['streams'][0]['width']==3840 and d['streams'][0]['height']==2160 and d['streams'][1]['channels']==2
e=json.loads((p/'walkthrough-checkpoints.json').read_text());ids=[v['label'].split()[-1] for v in e if v['label'].startswith('Sighting ')]
assert len(set(ids))==12 and e[-1]['label']=='End card' and any(v['label']=='Luggage claim' for v in e)
def frames(f,at,seconds):
 raw=s.check_output(['ffmpeg','-loglevel','error','-ss',str(at),'-i',str(f),'-t',str(seconds),'-an','-vf','scale=160:90,format=gray','-f','rawvideo','pipe:1'])
 return np.frombuffer(raw,np.uint8).reshape(-1,90,160).astype('int16')
def audit(f,at,seconds):
 arr=frames(f,at,seconds);diff=np.abs(np.diff(arr,axis=0)).mean(axis=(1,2));print(f.name,at,seconds,'completely identical adjacent frames:',sum(diff==0),'of',len(diff),flush=True)
 return int(sum(diff==0))
c=p.parent/'walkthrough-tv-final'
for name,at,duration in [('opening-film.mp4',25,12),('ending-film.mp4',11,9)]:
 n=audit(c/name,at,duration);assert n<duration*3
bar=next(x['time'] for x in e if x['label']=='lounge encounter')-3.4
s.run(['ffmpeg','-y','-loglevel','error','-ss',str(bar),'-i',str(movie),'-vf','scale=1648:-2','-frames:v','1',str(p/'bar-caption-check.jpg')],check=True)
x=json.loads((p/'capture.json').read_text());assert not x['errors']
t=np.array(x['timestamps'])-x['initialTime']
gaps=np.diff(t[(t>62)&(t<e[-2]['time']-6)])
print('Interactive compositor frame gap ms p50/p95/p99/max:',np.percentile(gaps,[50,95,99,100])*1000)
(p/'export-check.json').write_text(json.dumps({'streams':d,'sightings':ids,'musicSlider':100,'talkHidden':True,'captionCSSpx':19,'layoutWidth':1376,'cinematicFrames':[1770,672],'interactiveSource':[2560,1440]},indent=2))
