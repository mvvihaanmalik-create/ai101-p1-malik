from pathlib import Path
import json, subprocess, sys
p=Path(sys.argv[1]); output=Path(sys.argv[2]); d=json.loads((p/'recording.json').read_text()); frames=d['frames']; lines=[]
for i,f in enumerate(frames):
    lines.append("file '"+f['file']+"'")
    if i+1<len(frames): lines.append('duration '+str(frames[i+1]['time']-f['time']))
lines.append("file '"+frames[-1]['file']+"'"); (p/'frames.txt').write_text('\n'.join(lines)+'\n')
shift=d['audioStarted']-frames[0]['time']; length=frames[-1]['time']-frames[0]['time']
print({'frames':len(frames),'seconds':length,'offset':shift},flush=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(p/'frames.txt'),'-itsoffset',str(shift),'-i',str(p/'game-audio.webm'),'-vf','pad=1904:1106:(ow-iw)/2:(oh-ih)/2,crop=1904:1070:0:18,scale=1920:1080,fps=30','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','224k','-t',str(length),'-movflags','+faststart',str(output)],check=True)
print('Export complete',flush=True)
