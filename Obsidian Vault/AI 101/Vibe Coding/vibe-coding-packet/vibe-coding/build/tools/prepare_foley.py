"""Prepare the credited CC0 recordings with FFmpeg. Run from any directory."""
from pathlib import Path
import subprocess
import zipfile
import numpy as np

root = Path(__file__).resolve().parents[1]
sources = root.parent/'sources/audio-23'
dest = root/'assets/audio/foley-23'
dest.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(sources/'rpg-audio.zip') as pack:
    (sources/'kenney-license.txt').write_bytes(pack.read('license.txt'))
    clips = {n:pack.read('OGG/'+n+'.ogg') for n in ('footstep00','footstep03','footstep06','metalLatch','creak1')}
for name, file in [('car-open','door_opening.wav'),('car-close','door_closing.wav'),('engine','loop_0.wav')]:
    clips[name]=(sources/file).read_bytes()
rate=44100
for name,data in clips.items():
    raw=subprocess.run(['ffmpeg','-v','error','-i','pipe:0','-ac','1','-ar',str(rate),'-f','f32le','pipe:1'],
                       input=data,capture_output=True,check=True).stdout
    wave=np.frombuffer(raw,np.float32).copy()
    if name=='engine':
        # Pitch falls as the car slows, then the ignition dies.
        t=np.arange(int(rate*3.45))/rate
        speed=np.interp(t,[0,1.9,2.75,3.45],[1.16,1.09,.84,.63])
        phase=np.cumsum(speed)%len(wave)
        wave=np.interp(phase,np.arange(len(wave)+1),np.r_[wave,wave[0]])
        wave*=np.interp(t,[0,.12,1.9,2.8,3.45],[0,.92,1,.67,0])
    else:
        edge=np.where(np.abs(wave)>np.max(np.abs(wave))*.012)[0]
        wave=wave[max(0,edge[0]-350):edge[-1]+600].copy()
    wave*=.85/max(np.max(np.abs(wave)),.001)
    fade=min(128,len(wave)//4)
    wave[:fade]*=np.linspace(0,1,fade);wave[-fade:]*=np.linspace(1,0,fade)
    subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ar',str(rate),'-ac','1','-i','pipe:0',
                    '-c:a','libmp3lame','-b:a','96k',str(dest/(name+'.mp3'))],input=wave.astype('<f4').tobytes(),check=True)
    print(name,round(len(wave)/rate,3),'seconds')


# A dry trim retains the tiny attack that marks a grip or a metal contact.
room_dir=root/'assets/audio/foley-28'
room_dir.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(sources/'rpg-audio.zip') as pack:
    for name,original in [('lid','metalPot2'),('case','handleSmallLeather2'),('sleeve','cloth2'),('catch','metalClick')]:
        subprocess.run(['ffmpeg','-v','error','-y','-i','pipe:0','-ac','1','-ar','44100','-af',
                        'silenceremove=start_periods=1:start_threshold=-54dB:start_silence=0.004,highpass=f=65',
                        '-b:a','112k',str(room_dir/(name+'.mp3'))],input=pack.read('OGG/'+original+'.ogg'),check=True)
