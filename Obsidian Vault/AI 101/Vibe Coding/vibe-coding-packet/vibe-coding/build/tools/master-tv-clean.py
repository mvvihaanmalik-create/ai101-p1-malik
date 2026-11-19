from pathlib import Path
import json,subprocess as sp, numpy as np
cinema=Path('../build-record/walkthrough-tv-final').resolve()
p=Path('../build-record/walkthrough-tv-master').resolve()
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
first=opstart+1770
times=np.array(capture['timestamps'])-capture['initialTime']
gaps=[(round(t*30)+1, round((t+delta)*30)-1) for t,delta in zip(times,np.diff(times)) if first/30<t<enstart/30 and delta>.15]
removed=sum(b-a for a,b in gaps)
print('trimming captured holds',gaps,removed,'frames',flush=True)
encode('title',0,opstart);encode('credits',enstart+672,n)
clean=p/'play-clean.mp4'
if not clean.exists() or vidframes(clean)!=enstart-first-removed:
 expr='+'.join('between(n,'+str(a-first)+','+str(b-first-1)+')' for a,b in gaps)
 filters="select='not("+expr+")',setpts=N/(30*TB),scale=3840:2160:flags=lanczos,format=nv12"
 cmd(['ffmpeg','-y','-loglevel','error','-i',str(p/'play.mp4'),'-an','-vf',filters,'-filter_threads','5','-c:v','hevc_mf','-hw_encoding','1','-b:v','34M','-g','60','-tag:v','hvc1',str(clean)])
 assert vidframes(clean)==enstart-first-removed
# Decode on the movie timeline including the quiet title before the first audio packet.
audio=np.frombuffer(sp.check_output(['ffmpeg','-loglevel','error','-i',str(movie),'-vn','-af','aresample=48000:async=1:first_pts=0','-f','f32le','-ac','2','pipe:1']),np.float32).reshape(-1,2).copy()
pieces=[];pos=0
for a,b in gaps:
 left,right=a*1600,b*1600
 pieces.append(audio[pos:left]);blend=960;ramp=np.linspace(0,1,blend)[:,None]
 audio[right:right+blend]=audio[left:left+blend]*(1-ramp)+audio[right:right+blend]*ramp;pos=right
pieces.append(audio[pos:])
mix=p/'final-audio.m4a'
sp.run(['ffmpeg','-y','-loglevel','error','-f','f32le','-ar','48000','-ac','2','-i','pipe:0','-c:a','aac','-b:a','320k',str(mix)],input=np.concatenate(pieces).tobytes(),check=True)
assert vidframes(cinema/'opening-film.mp4')==1770 and vidframes(cinema/'ending-film.mp4')==672
files=[p/'title.mp4',cinema/'opening-film.mp4',p/'play-clean.mp4',cinema/'ending-film.mp4',p/'credits.mp4']
(p/'edit.txt').write_text(''.join("file '"+f.as_posix()+"'\n" for f in files))
out=p/'Hotel of Horror - Full Walkthrough UHD.mp4'
cmd(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(p/'edit.txt'),'-i',str(mix),'-map','0:v:0','-map','1:a:0','-c','copy','-tag:v','hvc1','-movflags','+faststart',str(out)])
assert vidframes(out)==n-removed
