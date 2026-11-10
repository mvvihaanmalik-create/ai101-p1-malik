"""Rebake only rooms/shots that can see an obsolete destination. Keep all variant pairs registered."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
assets=Path(__file__).resolve().parents[1]/'assets'
bpy.ops.wm.open_mainfile(filepath=str(assets/'hotel-v14.blend'));s=bpy.context.scene
meta=json.loads((assets/'hotel-v15.json').read_text())
names={'corridor':[('Suite name','WEST\nSTAIR'),('Above the threshold','W')],'landing':[('Door lettering.001','WEST GALLERY')],'stairs':[('Door lettering.002','UPPER LANDING')]}
original={}
for pairs in names.values():
 for name,body in pairs:
  o=bpy.data.objects[name];original[name]=[o.matrix_world@Vector(p) for p in o.bound_box];o.data.body=body
bpy.context.view_layer.update()
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for d in prefs.devices:d.use=d.type=='OPTIX'
s.cycles.device='GPU';s.cycles.samples=32;s.cycles.use_denoising=True;s.render.image_settings.file_format='WEBP';s.render.image_settings.quality=95
def variant(key):
 bpy.data.objects['Landscape canvas'].data.materials[0]=bpy.data.materials['Founder looking at you' if key=='E1' else 'Founder looking away']
 bpy.data.objects['Human shadow outside the frame'].hide_render=key!='E1'
 for o in s.objects:
  if o.name.startswith(('Impossible reflected','Reflected stair','Reflected diagonal')):o.hide_render=key!='E4'
 for i,name in enumerate(['Lift left closed panel','Lift right closed panel']):
  bpy.data.objects[name].location.x=58.5+(-.415 if i==0 else .415)+((-.26 if i==0 else .26) if key=='E3' else 0)
for i,c in enumerate(meta['cameras']):
 if c['room'] not in names:continue
 cam=bpy.data.objects.new('Rev15 view '+str(i),bpy.data.cameras.new('Route lens'));s.collection.objects.link(cam);s.camera=cam
 cv=lambda v:Vector((v[0],-v[2],v[1]));cam.location=cv(c['position']);cam.rotation_euler=(cv(c['target'])-cam.location).to_track_quat('-Z','Y').to_euler()
 cam.data.sensor_width=36;cam.data.sensor_fit='HORIZONTAL';cam.data.lens=36/(2*math.tan(math.radians(c['fov'])/2)*16/9)
 bpy.context.view_layer.update()
 seen=False
 for name,_ in names[c['room']]:
  o=bpy.data.objects[name];pts=[world_to_camera_view(s,cam,p) for p in original[name]+[o.matrix_world@Vector(p) for p in o.bound_box]]
  if max(p.z for p in pts)>0 and min(p.x for p in pts)<1.02 and max(p.x for p in pts)>-.02 and min(p.y for p in pts)<1.02 and max(p.y for p in pts)>-.02:seen=True
 if not seen:continue
 for key,file in [('normal',c['plate'])]+[(k,v[str(i)]) for k,v in meta['variants'].items() if str(i) in v]:
  new='route-'+str(i)+'-'+key+'-v15.webp'
  if not (assets/new).exists():
   variant(key);s.render.filepath=str(assets/new);bpy.ops.render.render(write_still=True)
  if key=='normal':c['plate']=new
  else:meta['variants'][key][str(i)]=new
  print('ROUTE SIGN',i,new,flush=True)
(assets/'hotel-v15.json').write_text(json.dumps(meta,indent=2))
print('ROUTE LETTERING COMPLETE',flush=True)
