"""Original anatomical bone geometry and two matched reception ending plates."""
import bpy,math,json,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'characters-v3.blend'))
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE' and 'Butler' in o.name);holder=rig.parent
holder.location=(0,0,0);rig.animation_data.action=None;rig.data.pose_position='REST'
bone=bpy.data.materials.new('Old ivory bone');bone.diffuse_color=(.47,.57,.43,1);bone.use_nodes=True;p=bone.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.47,.57,.43,1);p.inputs['Roughness'].default_value=.52
cavity=bpy.data.materials.new('Unlit bone cavities');cavity.diffuse_color=(.004,.006,.005,1);cavity.use_nodes=True;cavity.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.004,.006,.005,1)
parts=[]
def finish(o,name,joint):
 o.name=name
 if not o.data.materials:o.data.materials.append(bone)
 bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 # Apply object translation into coordinates before assigning armature weights.
 for v in o.data.vertices:v.co=o.matrix_world@v.co
 o.matrix_world.identity();o.parent=rig
 g=o.vertex_groups.new(name=joint);g.add(list(range(len(o.data.vertices))),1,'REPLACE')
 mod=o.modifiers.new('Bone attachment','ARMATURE');mod.object=rig
 for f in o.data.polygons:f.use_smooth=True
 parts.append(o);return o
def ell(name,pos,scale,joint,finishNow=True):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=28,ring_count=18,location=pos);o=bpy.context.object;o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return finish(o,name,joint) if finishNow else o
def tube(name,points,r,joint):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2;c.resolution_u=2
 sp=c.splines.new('POLY');sp.points.add(len(points)-1)
 for p,co in zip(sp.points,points):p.co=(*co,1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');return finish(bpy.context.object,name,joint)
# Hollow eye sockets and nasal opening are cut geometry, not painted dark discs.
skull=ell('Cranium',(0,-.035,1.805),(.084,.094,.112),'head',False)
skull.data.materials.append(bone);skull.data.materials.append(cavity)
for x,y,z,scale in [(-.038,-.118,1.808,(.030,.055,.031)),(.038,-.118,1.808,(.030,.055,.031)),(0,-.128,1.762,(.014,.040,.025))]:
 cutter=ell('Socket cutter',(x,y,z),scale,'head',False);cutter.data.materials.append(bone);cutter.data.materials.append(cavity)
 for f in cutter.data.polygons:f.material_index=1
 bpy.context.view_layer.objects.active=skull
 m=skull.modifiers.new('Carved cavity','BOOLEAN');m.operation='DIFFERENCE';m.object=cutter;bpy.ops.object.modifier_apply(modifier=m.name);bpy.data.objects.remove(cutter,do_unlink=True)
finish(skull,'Hollow skull','head')
ell('Upper jaw',(0,-.088,1.739),(.050,.039,.021),'head')
for side in [-1,1]:
 ell('Cheek arch',(side*.063,-.080,1.775),(.013,.024,.017),'head')
 tube('Mandible',[(side*.063,-.012,1.769),(side*.067,-.034,1.696),(side*.042,-.098,1.674),(0,-.120,1.669)],.009,'head')
 tube('Brow arch',[(side*.010,-.111,1.833),(side*.035,-.125,1.843),(side*.061,-.112,1.835)],.007,'head')
for i in range(12):
 a=(i/11-.5)*2.35;x=.045*math.sin(a);y=-.086-.040*math.cos(a)
 ell('Upper tooth',(x,y,1.720),(.0058,.0064,.011),'head')
 ell('Lower tooth',(x,y,1.680),(.0055,.006,.007),'head')
# Rib cage, sternum, vertebrae, clavicles and pelvis.
for i in range(10):
 z=1.235+i*.023;w=.105+.047*math.sin(i/9*math.pi);d=.075+.025*math.sin(i/9*math.pi)
 for side in [-1,1]:
  pts=[(side*w*math.sin(t),.018+d*math.cos(t),z+.024*math.sin(t)) for t in [j/24*math.pi for j in range(25)]]
  tube('Rib %02d'%i,pts,.006 if i<7 else .005,'spine_03')
tube('Sternum',[(0,-.082,1.27),(0,-.091,1.39),(0,-.067,1.48)],.012,'spine_03')
for i in range(26):
 z=1.06+i*.026;joint='spine_01' if z<1.20 else 'spine_03' if z<1.51 else 'neck_01'
 ell('Vertebra',(0,.06,z),(.023,.017,.010),joint)
for side in [-1,1]:
 tube('Clavicle',[(0,-.053,1.49),(side*.07,-.065,1.51),(side*.17,-.018,1.50)],.009,'spine_03')
 ell('Iliac wing',(side*.09,.005,1.06),(.070,.036,.075),'pelvis')
 tube('Pubic arch',[(side*.12,-.018,1.04),(side*.075,-.065,.99),(0,-.058,1.00)],.013,'pelvis')
for b in rig.data.bones:
 name=b.name
 if any(name.startswith(x) for x in ['upperarm','lowerarm','thigh','calf','hand','foot','toe','thumb','index','middle','ring','pinky']):
  a,bp=Vector(b.head_local),Vector(b.tail_local);length=(bp-a).length
  if length<.008:continue
  r=.016 if name.startswith('thigh') else .011 if name.startswith(('upperarm','calf')) else .008 if name.startswith(('lowerarm','foot')) else .004
  tube(name+' shaft',[a,a.lerp(bp,.22)+Vector((.004,0,0)),a.lerp(bp,.78),bp],r,name)
  if name.startswith(('thigh','calf','upperarm','lowerarm')):
   for pt in [a,bp]:ell('Joint',pt,(r*1.45,r*1.4,r*1.2),name)
  if name.startswith(('lowerarm','calf')):tube(name+' paired bone',[a+Vector((.014,0,0)),bp+Vector((.012,0,0))],r*.48,name)
# Join to one weighted mesh for low draw cost.
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();bones=parts[0];bones.name='Butler anatomical skeleton'
rig.data.pose_position='POSE';rig.animation_data.action=bpy.data.actions.get('Butler Idle') or next(a for a in bpy.data.actions if 'Idle' in a.name and 'Butler' in a.name)
bpy.context.scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for o in [bones,rig,holder]:o.select_set(True)
bpy.context.view_layer.objects.active=holder
bpy.ops.export_scene.gltf(filepath=str(OUT/'butler-skeleton-v6.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_skins=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'ending-skeleton-v6.blend'));print('SKELETON V6 COMPLETE',flush=True)
# Matched closer/reverse shots in the same reception geometry.
bpy.ops.wm.open_mainfile(filepath=str(OUT/'hotel-v5.blend'));scene=bpy.context.scene
# The earlier front-facing reception plate never needed a front wall. Close it for the reverse shot.
wood=bpy.data.materials['Hand-rubbed walnut'];velvet=bpy.data.materials['Curtain velvet'];brass=bpy.data.materials['Aged brass']
def panel(name,pos,scale,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat);be=o.modifiers.new('Soft edges','BEVEL');be.width=.018;be.segments=3;return o
panel('Reception entrance wall',(30,-.12,1.85),(7,.18,3.7),wood)
for side in [-1,1]:
 panel('Closed entrance leaf',(30+side*.47,.02,1.55),(.93,.14,3.1),wood)
 panel('Entrance pull',(30+side*.15,.14,1.28),(.025,.055,.42),brass)
 for i in range(19):panel('Final red curtain',(30+side*(1.08+i*.125),.14+math.sin(i*.8)*.04,1.8),(.14,.14,3.6),velvet)
for x in [28.1,31.9]:
 d=bpy.data.lights.new('Last red light','AREA');o=bpy.data.objects.new('Last red light',d);scene.collection.objects.link(o);o.location=(x,2.1,2.8);o.rotation_euler=(Vector((x,.1,1.8))-o.location).to_track_quat('-Z','Y').to_euler();d.energy=140;d.color=(1,.025,.045);d.shape='DISK';d.size=1.2
shots=[]
def camera(name,pos,target,lens):
 d=bpy.data.cameras.new(name);o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();d.lens=lens;d.sensor_width=36;d.sensor_fit='HORIZONTAL'
 conv=lambda p:[p[0],p[2],-p[1]]
 shots.append(dict(name=name,position=conv(pos),target=conv(target),fov=math.degrees(2*math.atan(36/(2*lens)/(16/9))),plate=name+'-v6.webp'))
 return o
camera('ending-butler',(30.7,4.5,1.78),(31.45,7.85,1.55),44)
camera('ending-surround',(30.0,8.7,2.6),(30.0,3.5,.95),24)
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='WEBP';scene.render.image_settings.quality=95
scene.cycles.samples=40;scene.cycles.use_denoising=True
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for dev in prefs.devices:dev.use=dev.type=='OPTIX'
scene.cycles.device='GPU'
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'ending-reception-v6.blend'));(OUT/'ending-v6.json').write_text(json.dumps({'shots':shots},indent=2))
for shot in shots:
 scene.camera=bpy.data.objects[shot['name']];scene.render.filepath=str(OUT/shot['plate']);bpy.ops.render.render(write_still=True);print('ENDING PLATE COMPLETE',shot['name'],flush=True)
print('ENDING V6 COMPLETE',flush=True)
