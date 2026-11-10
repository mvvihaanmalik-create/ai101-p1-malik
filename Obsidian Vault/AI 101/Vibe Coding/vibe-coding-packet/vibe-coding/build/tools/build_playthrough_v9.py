import bpy,math,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1];out=root/'assets'
bpy.ops.wm.open_mainfile(filepath=str(out/'hotel-v5.blend'));s=bpy.context.scene
meta=json.loads((out/'hotel-v5.json').read_text());meta['version']=9;meta['rooms']['corridor']['entry']=[-.32,5]
jobs=[]
for key,base,offset in [('service','vignette',6.4),('children','children',3.25),('bar','vignette',-3.7),('luggage','vignette',-6.1)]:
 spec=dict(meta['cameras'][meta['details'][base]]);spec['position']=spec['position'].copy();spec['target']=spec['target'].copy();spec['position'][2]+=offset;spec['target'][2]+=offset;
 if key=='luggage':spec['position']=[1.8,1.55,-18.3];spec['target']=[.85,.85,-20.3];spec['fov']=math.degrees(2*math.atan(36/(2*19)/(16/9)))
 spec['name']='inspect-'+key+'-v9';spec['plate']=spec['name']+'.webp'
 idx=meta['details']['children'] if key=='children' else len(meta['cameras'])
 if key=='children':meta['cameras'][idx]=spec
 else:meta['cameras'].append(spec)
 meta['details'][key]=idx
 d=bpy.data.cameras.new(spec['name']);c=bpy.data.objects.new(spec['name'],d);s.collection.objects.link(c);c.location=(spec['position'][0],-spec['position'][2],spec['position'][1]);target=Vector((spec['target'][0],-spec['target'][2],spec['target'][1]));c.rotation_euler=(target-c.location).to_track_quat('-Z','Y').to_euler();d.sensor_width=36;d.sensor_fit='HORIZONTAL';d.lens=36/(2*math.tan(math.radians(spec['fov'])/2)*(16/9));jobs.append(('normal',c,spec['plate']))
 if key in ['service','bar']:
  variant='E1' if key=='service' else 'E4';file=spec['name']+'-'+variant+'.webp';meta['variants'][variant][str(idx)]=file;jobs.append((variant,c,file))
# Original folk-horror dressing, not a replica of a film prop.
def material(name,color,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=.8
 if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
 return m
rush=material('Dried rush bindings',(.28,.20,.085));thread=material('Old red binding thread',(.18,.009,.016));wax=material('Old beeswax',(.30,.20,.10));salt=material('Coarse threshold salt',(.43,.40,.31));flame=material('Small candle flame',(1,.26,.035),4)
def cord(name,pts,r,mat):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2;p=c.splines.new('POLY');p.points.add(len(pts)-1)
 for v,co in zip(p.points,pts):v.co=(*co,1)
 o=bpy.data.objects.new(name,c);s.collection.objects.link(o);o.data.materials.append(mat);return o
for i in range(7):
 a=i*math.pi/7;pts=[]
 for j in range(33):
  t=j/32*math.tau;x=.24*math.cos(t+a)*(1+.12*math.sin(t*3));z=.21*math.sin(t+a);pts.append((120+x,8.20-i*.003,2.76+z))
 cord('Woven rush protection',pts,.006,rush)
for i in range(5):cord('Bound with red thread',[(119.93+i*.006,8.16,2.53),(120.08+i*.006,8.16,2.99)],.004,thread)
for x,h in [(118.94,.22),(119.12,.31),(121.02,.25)]:
 bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=.043,depth=h,location=(x,7.75,h/2+.04));bpy.context.object.data.materials.append(wax)
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=1,location=(x,7.75,h+.055));bpy.context.object.scale=(.012,.012,.035);bpy.context.object.data.materials.append(flame)
 d=bpy.data.lights.new('Quiet candle','POINT');d.energy=1.8;d.color=(1,.32,.09);d.shadow_soft_size=.12;o=bpy.data.objects.new('Quiet candle',d);s.collection.objects.link(o);o.location=(x,7.75,h+.1)
for i in range(96):
 x=119.13+i*.018;cord('Salt threshold',[(x,7.68+.006*math.sin(i*4.7),.048),(x+.01,7.69,.05)],.005,salt)
suite=meta['cameras'][7];suite['plate']='suite-v9.webp';jobs.append(('normal',bpy.data.objects['suite'],suite['plate']))
portrait=bpy.data.objects['Landscape canvas'];escaped=bpy.data.objects.get('Human shadow outside the frame');panels=[bpy.data.objects.get('Lift left closed panel'),bpy.data.objects.get('Lift right closed panel')]
if 'Founder looking at you' not in bpy.data.materials:
 m=bpy.data.materials['Founder looking away'].copy();m.name='Founder looking at you'
 for n in m.node_tree.nodes:
  if n.type=='TEX_IMAGE':n.image=bpy.data.images.load(str(out/'founder-anomaly-v5.webp'))
def variant(key):
 portrait.data.materials[0]=bpy.data.materials['Founder looking at you' if key=='E1' else 'Founder looking away']
 if escaped:escaped.hide_render=key!='E1'
 for o in s.objects:
  if o.name.startswith(('Impossible reflected','Reflected stair','Reflected diagonal')):o.hide_render=key!='E4'
variant('normal');s.render.resolution_x=1920;s.render.resolution_y=1080;s.render.resolution_percentage=100;s.render.image_settings.file_format='WEBP';s.render.image_settings.color_mode='RGB';s.render.image_settings.quality=95
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for dev in prefs.devices:dev.use=dev.type=='OPTIX'
s.cycles.device='GPU';s.cycles.samples=32;s.cycles.use_denoising=True
(out/'hotel-v9.json').write_text(json.dumps(meta,indent=2));bpy.ops.wm.save_as_mainfile(filepath=str(out/'hotel-v9.blend'))
for key,cam,file in jobs:
 variant(key);s.camera=cam;s.render.filepath=str(out/file);bpy.ops.render.render(write_still=True);print('V9 PLATE',file,flush=True)
