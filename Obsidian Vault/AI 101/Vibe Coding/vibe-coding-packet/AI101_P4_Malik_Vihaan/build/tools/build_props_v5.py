"""Original dog sculptures, empty coat and rendered founder portraits."""
import bpy,math,bmesh,random
from mathutils import Vector,Quaternion,Matrix
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets';random.seed(501)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'characters-v3.blend'));s=bpy.context.scene;s.frame_set(1)
def material(name,color,rough=.65,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
def empty(name):
 o=bpy.data.objects.new(name,None);s.collection.objects.link(o);return o
def ellipsoid(name,pos,scale,mat,parent=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=pos);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 if parent:o.parent=parent
 return o
def tube(name,points,radius,mat,parent=None):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=12;c.bevel_depth=radius;c.bevel_resolution=3;sp=c.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
 for p,co in zip(sp.bezier_points,points):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c);s.collection.objects.link(o);o.data.materials.append(mat);o.parent=parent;return o
def area(name,loc,target,color,energy,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
def setup_render():
 s.render.engine='CYCLES';p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='OPTIX';p.get_devices()
 for d in p.devices:d.use=d.type=='OPTIX'
 s.cycles.device='GPU';s.cycles.samples=40;s.cycles.use_denoising=True;s.render.resolution_percentage=100;s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast';s.render.image_settings.file_format='WEBP';s.render.image_settings.quality=95

# A photographic founder portrait lit and composed for the gilt frame.
for o in s.objects:
 if o.name.startswith('Guest'):o.hide_render=True
founder=bpy.data.objects['Butler'];founder.location=(0,0,0);founder.rotation_euler.z=math.pi
rig=bpy.data.objects['ButlerRig'];rig.animation_data.action=None
for track in rig.animation_data.nla_tracks:track.mute=True
world=bpy.data.worlds.new('Portrait void');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.017,.012,.008,1);world.node_tree.nodes['Background'].inputs[1].default_value=.2;s.world=world
area('Portrait gold',(-.75,1.2,2.15),(0,0,1.6),(1,.57,.27),48,.65)
area('Portrait green rim',(.6,-.3,2),(0,0,1.6),(.24,.52,.42),35,.5)
d=bpy.data.cameras.new('Portrait camera');cam=bpy.data.objects.new('Portrait camera',d);s.collection.objects.link(cam);cam.location=(0,2.6,1.68);target=Vector((0,0,1.56));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();d.lens=85;s.camera=cam
setup_render();s.render.resolution_x=640;s.render.resolution_y=880
head=rig.pose.bones['head'];head.rotation_mode='QUATERNION';head.rotation_quaternion=Quaternion();bpy.context.view_layer.update();headPosition=head.head.copy();headRotation=head.matrix.to_quaternion()
for variant,angle in [('normal',1.05),('anomaly',0)]:
 head.matrix=Matrix.LocRotScale(headPosition,Quaternion((0,0,1),angle)@headRotation,Vector((1,1,1)));bpy.context.view_layer.update();s.render.filepath=str(OUT/f'founder-{variant}-v5.webp');bpy.ops.render.render(write_still=True);print('PORTRAIT',variant,flush=True)

# Extract the fitted jacket into an empty hanging garment, retaining textile UVs.
src=bpy.data.objects['Guest male_elegantsuit01'];deps=bpy.context.evaluated_depsgraph_get();mesh=bpy.data.meshes.new_from_object(src.evaluated_get(deps));coat=bpy.data.objects.new('EmptyCoat',mesh);s.collection.objects.link(coat)
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<.92],context='VERTS');bm.to_mesh(mesh);bm.free()
for v in mesh.vertices:
 if v.co.z<1.22:v.co.z-=(1.22-v.co.z)*.65
 v.co.z-=1.55
coat.data.materials.clear();coat.data.materials.append(material('Abandoned wool',(.025,.036,.032),.93))
for f in coat.data.polygons:f.material_index=0;f.use_smooth=True
coatRoot=empty('Coat');coat.parent=coatRoot
for o in list(s.objects):
 if o not in [coat,coatRoot]:bpy.data.objects.remove(o,do_unlink=True)

# An original lean, long-legged hotel dog, with sculpted stand/sit silhouettes.
fur=material('Old dog sable',(.10,.075,.052),.91);cream=material('Grey muzzle',(.16,.14,.11),.87);nose=material('Wet nose',(.008,.009,.007),.25);eye=material('Warm cloudy iris',(.12,.065,.018),.24);pupil=material('Dog pupil',(.004,.006,.005),.16)
from mathutils import noise
def coat_color(o,head=False):
 m=fur.copy();m.name='Sable fur and greying guard hairs';attr=m.node_tree.nodes.new('ShaderNodeVertexColor');attr.layer_name='Coat';m.node_tree.links.new(attr.outputs['Color'],m.node_tree.nodes['Principled BSDF'].inputs['Base Color']);o.data.materials.clear();o.data.materials.append(m)
 colors=o.data.color_attributes.new(name='Coat',type='FLOAT_COLOR',domain='POINT')
 for i,v in enumerate(o.data.vertices):
  co=v.co;n=noise.noise_vector(co*57)[0]*.12+noise.noise_vector(co*9)[1]*.12
  grey=max(0,min(1,(-co.y-.07)*4))*.25 if head else max(0,min(1,(-co.y-.14)*7))*max(0,1-abs(co.x)*7)*.30
  base=(.075+grey,.057+grey*.87,.041+grey*.71);colors.data[i].color=(*(max(.012,c*(1+n)) for c in base),1)
def merge_sculpt(parts,name,voxel,parent):
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();o=bpy.context.object;o.name=name
 mod=o.modifiers.new('Anatomy union','REMESH');mod.mode='VOXEL';mod.voxel_size=voxel;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name)
 mod=o.modifiers.new('Skin','SMOOTH');mod.factor=.65;mod.iterations=3;bpy.ops.object.modifier_apply(modifier=mod.name)
 mod=o.modifiers.new('Surface budget','DECIMATE');mod.ratio=.64;bpy.ops.object.modifier_apply(modifier=mod.name);o.parent=parent;coat_color(o,'Head' in name);return o
collar=material('Oxblood dog collar',(.13,.018,.014),.68);brass=material('Old dog tag',(.36,.23,.065),.38,.75)
def dog(name,sitting):
 root=empty(name);pieces=[]
 # Dog faces -Y. The chest and tucked abdomen read as a whippet rather than a toy.
 z=.64 if not sitting else .48
 specs=[('Ribcage',(0,.08,z),(.18,.37,.23)),('Tucked waist',(0,.32,z+.005),(.12,.24,.13)),('Haunch',(0,.46,z-.02),(.17,.19,.18)),('Breast',(0,-.20,z+.02),(.15,.18,.24)),('Neck',(0,-.28,z+.22),(.12,.15,.27))]
 for n,co,scale in specs:pieces.append(ellipsoid(name+n,co,scale,fur))
 for side in [-1,1]:
  if not sitting:
   for y in [-.2,.43]:
    pieces.extend([ellipsoid('Upper leg',(side*.125,y,.40),(.055,.075,.22),fur),ellipsoid('Hock',(side*.13,y+.055,.21),(.035,.042,.17),fur),ellipsoid('Paw',(side*.13,y-.015,.07),(.053,.105,.055),fur)])
  else:
   pieces.extend([ellipsoid('Sitting thigh',(side*.17,.35,.20),(.13,.20,.17),fur),ellipsoid('Folded hind paw',(side*.17,.18,.06),(.075,.15,.05),fur),ellipsoid('Seated foreleg',(side*.12,-.24,.25),(.035,.05,.24),fur),ellipsoid('Forepaw',(side*.12,-.29,.055),(.052,.10,.045),fur)])
 bpy.ops.object.select_all(action='DESELECT')
 for o in pieces:o.select_set(True)
 bpy.context.view_layer.objects.active=pieces[0];bpy.ops.object.join();body=bpy.context.object;body.name=name+'Body'
 mod=body.modifiers.new('Continuous anatomy','REMESH');mod.mode='VOXEL';mod.voxel_size=.012;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name)
 mod=body.modifiers.new('Soft coat','SMOOTH');mod.factor=.8;mod.iterations=4;bpy.ops.object.modifier_apply(modifier=mod.name)
 mod=body.modifiers.new('Surface','DECIMATE');mod.ratio=.6;bpy.ops.object.modifier_apply(modifier=mod.name);body.parent=root;coat_color(body)
 head=empty(name+'Head');head.parent=root;head.location=(0,-.30,z+.36)
 headParts=[ellipsoid('Cranium',(0,-.025,.02),(.10,.14,.115),fur),ellipsoid('Brow',(0,-.10,.015),(.086,.09,.071),fur),ellipsoid('Long muzzle',(0,-.17,-.035),(.055,.15,.052),cream),ellipsoid('Lower jaw',(0,-.16,-.070),(.045,.13,.023),fur)]
 merge_sculpt(headParts,name+'HeadSurface',.007,head)
 ellipsoid('Nose',(0,-.303,-.024),(.040,.026,.025),nose,head)
 for side in [-1,1]:ellipsoid('Nostril',(side*.025,-.323,-.02),(.010,.007,.009),pupil,head)
 for side in [-1,1]:
  ellipsoid('Watchful eye',(side*.080,-.105,.037),(.017,.015,.013),eye,head);ellipsoid('Pupil',(side*.085,-.116,.038),(.008,.006,.009),pupil,head)
  tube('Heavy eyelid',[(side*.071,-.112,.044),(side*.086,-.107,.054),(side*.096,-.091,.046)],.009,fur,head)
  verts=[(side*.08,.035,.07),(side*.16,.035,.055),(side*.165,-.015,-.06),(side*.12,-.06,-.15),(side*.09,-.07,-.04),(side*.11,-.01,.015)]
  me=bpy.data.meshes.new('Folded ear');me.from_pydata(verts,[],[(0,1,5),(1,2,5),(2,3,4,5),(4,0,5)]);me.materials.append(fur);ear=bpy.data.objects.new('Folded velvet ear',me);s.collection.objects.link(ear);ear.parent=head
  solid=ear.modifiers.new('Ear thickness','SOLIDIFY');solid.thickness=.008;sub=ear.modifiers.new('Ear fold','SUBSURF');sub.levels=2
  for f in me.polygons:f.use_smooth=True
  for toe in [-1,0,1]:ellipsoid('Claw',(side*.13+toe*.015,-.29 if sitting else -.29,.045),(.007,.018,.008),nose,root)
 tube('Tail',[(0,.56,z),(0,.73,z-.14),(.06,.88,.25 if not sitting else .09),(.16,.91,.12 if not sitting else .07)],.024,fur,root)
 bpy.ops.mesh.primitive_torus_add(major_radius=.12,minor_radius=.017,major_segments=32,minor_segments=8,location=(0,-.28,z+.27));o=bpy.context.object;o.name='Dog collar';o.data.materials.append(collar);o.parent=root
 ellipsoid('No name on tag',(0,-.405,z+.18),(.033,.006,.041),brass,root)
 return root
dog('DogStand',False);dog('DogSit',True)
for image in bpy.data.images:
 if image.source=='FILE' and not image.packed_file:
  try:image.pack()
  except:pass
bpy.ops.object.select_all(action='SELECT');bpy.ops.export_scene.gltf(filepath=str(OUT/'encounter-props-v5.glb'),export_format='GLB',use_selection=True,export_animations=False,export_apply=True,export_image_format='WEBP')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'encounter-props-v5.blend'))
print('PROPS V5 COMPLETE',flush=True)
