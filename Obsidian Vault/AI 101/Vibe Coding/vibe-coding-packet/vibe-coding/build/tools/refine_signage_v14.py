"""Rerender existing shots with stronger hotel lettering; preserve cameras/anomalies."""
import bpy,math,json,sys
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1];out=root/'assets'
bpy.ops.wm.open_mainfile(filepath=str(out/'hotel-v9.blend'));s=bpy.context.scene
meta=json.loads((out/'hotel-v9.json').read_text());meta['version']=14
font=bpy.data.fonts.load('C:/Windows/Fonts/georgiab.ttf')
ink=bpy.data.materials.new('Legible aged ivory lettering');ink.use_nodes=True
bs=ink.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(.71,.57,.32,1);bs.inputs['Metallic'].default_value=.12;bs.inputs['Roughness'].default_value=.75;bs.inputs['Emission Color'].default_value=(.5,.37,.18,1);bs.inputs['Emission Strength'].default_value=.16
signs=[]
for o in s.objects:
 if o.type!='FONT':continue
 o.data.font=font;o.data.size*=1.18;o.data.space_character=1.05
 if o.name.startswith('Hotel identity'):o.data.body='RECEPTION';o.data.size=.255
 if o.name.startswith('Suite name'):o.data.body='HONEYMOON\nSUITE';o.data.size=.145
 if o.name.startswith('Lift sign'):o.data.size=.115
 o.data.materials.clear();o.data.materials.append(ink)
 signs.append({'name':o.name,'text':o.data.body,'size':o.data.size})
portrait=bpy.data.objects['Landscape canvas'];escaped=bpy.data.objects.get('Human shadow outside the frame')
if 'Founder looking at you' not in bpy.data.materials:
 m=bpy.data.materials['Founder looking away'].copy();m.name='Founder looking at you';m.use_fake_user=True
 for n in m.node_tree.nodes:
  if n.type=='TEX_IMAGE':n.image=bpy.data.images.load(str(out/'founder-anomaly-v5.webp'))
panels=[bpy.data.objects.get('Lift left closed panel'),bpy.data.objects.get('Lift right closed panel')]
def variant(key):
 portrait.data.materials[0]=bpy.data.materials['Founder looking at you' if key=='E1' else 'Founder looking away']
 if escaped:escaped.hide_render=key!='E1'
 for o in s.objects:
  if o.name.startswith(('Impossible reflected','Reflected stair','Reflected diagonal')):o.hide_render=key!='E4'
 for i,o in enumerate(panels):
  if o:o.location.x=58.5+(-.415 if i==0 else .415)+((- .26 if i==0 else .26) if key=='E3' else 0)
jobs=[]
for index,c in enumerate(meta['cameras']):
 for key,file in [('normal',c['plate'])]+[(k,v[str(index)]) for k,v in meta['variants'].items() if str(index) in v]:
  dest=Path(file).stem+'-v14.webp'
  if key=='normal':c['plate']=dest
  else:meta['variants'][key][str(index)]=dest
  jobs.append((c,key,dest))
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for d in prefs.devices:d.use=d.type=='OPTIX'
s.cycles.device='GPU';s.cycles.samples=32;s.cycles.use_denoising=True
s.render.resolution_x=1920;s.render.resolution_y=1080;s.render.resolution_percentage=100;s.render.image_settings.file_format='WEBP';s.render.image_settings.color_mode='RGB';s.render.image_settings.quality=95
variant('normal');bpy.ops.wm.save_as_mainfile(filepath=str(out/'hotel-v14.blend'))
only=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
for c,key,file in jobs:
 if only and c['room'] not in only:continue
 if (out/file).exists():continue
 variant(key)
 cam=bpy.data.objects.get(c['name'])
 if not cam:
  cam=bpy.data.objects.new(c['name'],bpy.data.cameras.new(c['name']));s.collection.objects.link(cam)
 cam.location=(c['position'][0],-c['position'][2],c['position'][1]);target=Vector((c['target'][0],-c['target'][2],c['target'][1]));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.sensor_width=36;cam.data.sensor_fit='HORIZONTAL';cam.data.lens=36/(2*math.tan(math.radians(c['fov'])/2)*(16/9))
 s.camera=cam;s.render.filepath=str(out/file);bpy.ops.render.render(write_still=True);print('SIGNAGE V14',file,flush=True)
(out/'hotel-v14.json').write_text(json.dumps(meta,indent=2))
(root.parent/'build-record/tests/repairs-14/signage.json').write_text(json.dumps(signs,indent=2))
print('SIGNAGE V14 COMPLETE',flush=True)
