"""Two registered gallery inserts: bell in hand, runner in raking light."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
assets=Path(__file__).resolve().parents[1]/'assets'
bpy.ops.wm.open_mainfile(filepath=str(assets/'hotel-v14.blend'));s=bpy.context.scene
meta=json.loads((assets/'hotel-v15.json').read_text());prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for dev in prefs.devices: dev.use=dev.type=='OPTIX'
s.cycles.device='GPU';s.cycles.samples=32;s.render.image_settings.file_format='WEBP';s.render.image_settings.quality=95
for key,pos,target,fov in [('bell',[-.17,1.52,-16.02],[-.98,1.28,-18.6],32),('runner',[.46,1.15,-9.3],[0,.16,-13.25],39)]:
    name='inspect-'+key+'-v15';dest=name+'.webp'
    cam=bpy.data.objects.new(name,bpy.data.cameras.new(name));s.collection.objects.link(cam)
    conv=lambda v:Vector((v[0],-v[2],v[1]))
    cam.location=conv(pos);cam.rotation_euler=(conv(target)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.sensor_width=36;cam.data.sensor_fit='HORIZONTAL';cam.data.lens=36/(2*math.tan(math.radians(fov)/2)*16/9);s.camera=cam
    s.render.filepath=str(assets/dest);bpy.ops.render.render(write_still=True)
    c=dict(name=name,room='corridor',position=pos,target=target,fov=fov,minY=0,plate=dest)
    if key in meta['details']:meta['cameras'][meta['details'][key]]=c
    else:meta['details'][key]=len(meta['cameras']);meta['cameras'].append(c)
(assets/'hotel-v15.json').write_text(json.dumps(meta,indent=2))
print('INSERTS COMPLETE',flush=True)
