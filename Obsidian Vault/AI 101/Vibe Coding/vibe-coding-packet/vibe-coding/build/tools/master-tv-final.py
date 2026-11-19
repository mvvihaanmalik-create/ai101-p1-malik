from pathlib import Path
import json,subprocess as sp, numpy as np
p=Path('../build-record/walkthrough-tv-final').resolve()
movie=p/'Hotel of Horror - Walkthrough.mp4'
def cmd(args): sp.run(args,check=True)
def mono(f):
 raw=sp.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(f),'-vn','-ac','1','-ar','8000','-f','f32le','pipe:1'])
 return np.frombuffer(raw,dtype='<f4')
def align(r,a,est,points):
 anchors=[]
 for at in points:
  start=max(0,round((est+at-2)*8000));sig=r[start:round((est+at+3.5)*8000)]
  ref=a[round(at*8000):round((at+1.5)*8000)]
  c=np.correlate(sig,ref,'valid')
  q=int(c.argmax());den=float(np.linalg.norm(sig[q:q+len(ref)])*np.linalg.norm(ref))
  anchors.append(((start+q)/8000-at,float(c[q])/max(den,1e-10)))
 print('correlation anchors',anchors,flush=True)
 verified=[t for t,confidence in anchors if confidence>.15]
 if not verified or max(verified)-min(verified)>.20: raise ValueError('Audio alignment needs review')
 return float(np.median(verified))
def vidframes(file):
 data=json.loads(sp.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=nb_frames,width,height','-of','json',str(file)]))['streams'][0]
 print(file.name,data,flush=True);return int(data['nb_frames'])
events=json.loads((p/'walkthrough-checkpoints.json').read_text())
capture=json.loads((p/'capture.json').read_text())
probe=json.loads(sp.check_output(['ffprobe','-v','error','-select_streams','a:0','-show_entries','stream=start_time','-of','json',str(movie)]))
aoffset=float(probe['streams'][0]['start_time'])
a=mono(movie); op=next(e for e in events if e['label']=='Desert highway');en=next(e for e in events if e['label']=='Honeymoon suite')
opening=aoffset+align(a,mono('assets/audio/hotel-california-opening.ogg'),op['time']-op['opening']-aoffset,[7.8,20,37,48,55])
ending=aoffset+align(a,mono('assets/audio/hotel-california-credits.ogg'),en['time']-en['audio']-aoffset,[5.9,11,18,23])
n=vidframes(movie);opstart=round(opening*30);enstart=round((ending+4.8)*30)
def encode(name,start,end):
 f=p/(name+'.mp4');
 if f.exists() and vidframes(f)==end-start:return
 cmd(['ffmpeg','-y','-hide_banner','-loglevel','error','-ss',str(start/30),'-i',str(movie),'-an','-frames:v',str(end-start),'-filter_threads','6','-vf','scale=3840:2160:flags=lanczos,format=nv12','-c:v','hevc_mf','-hw_encoding','1','-b:v','34M','-g','60','-tag:v','hvc1',str(f)]);assert vidframes(f)==end-start
print('picture cuts',opening,ending,'frames',opstart,enstart,flush=True)
encode('title',0,opstart);encode('play',opstart+1770,enstart);encode('credits',enstart+672,n)
import sys
if '--prepare' in sys.argv:sys.exit(0)
assert vidframes(p/'opening-film.mp4')==1770 and vidframes(p/'ending-film.mp4')==672
files=['title','opening-film','play','ending-film','credits'];(p/'edit.txt').write_text(''.join("file '"+f+".mp4'\n" for f in files))
out=p/'Hotel of Horror - Full Walkthrough UHD.mp4'
cmd(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(p/'edit.txt'),'-i',str(movie),'-map','0:v:0','-map','1:a:0','-c','copy','-tag:v','hvc1','-movflags','+faststart',str(out)])
assert vidframes(out)==n
