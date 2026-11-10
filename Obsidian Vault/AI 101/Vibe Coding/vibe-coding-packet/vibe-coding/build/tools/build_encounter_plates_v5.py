"""Matched hotel plates: founder portrait, impossible mirror, closed/gapped lift.
The mirror uses actual Cycles reflection of geometry hidden from primary rays.
"""
import bpy,math,json,ast,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'hotel-v3.blend'));scene=bpy.context.scene
tree=ast.parse((ROOT/'tools/build_scene.py').read_text());helpers={'mat','finish','quad','area','point','line','cyl'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in helpers],type_ignores=[]),'<helpers>','exec'))
tree=ast.parse((ROOT/'tools/build_hotel_v3.py').read_text());exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='cube'],type_ignores=[]),'<cube>','exec'))
wood=bpy.data.materials['Hand-rubbed walnut'];brass=bpy.data.materials['Aged brass'];wall=bpy.data.materials['Faded olive damask'];velvet=bpy.data.materials['Curtain velvet']
meta=json.loads((OUT/'hotel-v3.json').read_text());meta['version']=5;meta['variants']={};meta['details']={}

def photo(name,file):
 m=mat(name,(.5,.5,.5),.78);p=m.node_tree.nodes['Principled BSDF'];tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(OUT/file));m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color']);return m
normal=photo('Founder looking away','founder-normal-v5.webp');changed=photo('Founder looking at you','founder-anomaly-v5.webp')
canvases=sorted([o for o in scene.objects if o.name.startswith('Landscape canvas')],key=lambda o:sum(v.co.y for v in o.data.vertices)/len(o.data.vertices))
portrait=canvases[0];portrait.data.materials.clear();portrait.data.materials.append(normal)
mirror=canvases[1];mirrorMat=mat('Antique silver mirror',(.78,.83,.79),.045,1);mirror.data.materials.clear();mirror.data.materials.append(mirrorMat)
# A light stays fixed in every variant. Only the hidden human begins casting.
area('Founder picture light',(-.15,7.3,2.65),(-2.2,7.7,1.5),(1,.56,.28),42,.38)

with bpy.data.libraries.load(str(OUT/'characters-v3.blend'),link=False) as (src,dst):
 dst.objects=[n for n in src.objects if n.startswith('Butler')]
ghost=[]
for o in dst.objects:
 if o is None:continue
 scene.collection.objects.link(o);ghost.append(o)
 if o.type=='MESH':o.visible_camera=False;o.visible_glossy=False;o.visible_diffuse=False;o.visible_shadow=True
founder=next(o for o in ghost if o.type=='EMPTY' and o.name.startswith('Butler'))
founder.location=(-1.3,7.55,.27);founder.rotation_euler.z=math.pi/2;founder.scale=(.9,.9,.9)
for o in ghost:o.hide_render=True

# Project the fitted human silhouette onto the damask. Reuse the wall UVs,
# darkening its actual pattern, so the impossible shadow is not a black decal.
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();verts=[];faces=[]
for o in ghost:
 if o.type!='MESH':continue
 ev=o.evaluated_get(deps);me=ev.to_mesh();transform=founder.matrix_world.inverted()@o.matrix_world;base=len(verts)
 for v in me.vertices:
  co=transform@v.co;verts.append((-2.364,6.72+co.x*1.15,.15+co.z*1.2))
 for f in me.polygons:faces.append(tuple(base+i for i in f.vertices))
 ev.to_mesh_clear()
me=bpy.data.meshes.new('Escaped silhouette');me.from_pydata(verts,[],faces);uv=me.uv_layers.new()
for f in me.polygons:
 for li in f.loop_indices:
  co=me.vertices[me.loops[li].vertex_index].co;uv.data[li].uv=(co.y+1,co.z-1.12)
shadowMat=wall.copy();shadowMat.name='Damask inside the escaped shadow';bs=shadowMat.node_tree.nodes['Principled BSDF'];link=next(l for l in shadowMat.node_tree.links if l.to_socket==bs.inputs['Base Color']);source=link.from_socket;shadowMat.node_tree.links.remove(link)
mix=shadowMat.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(.14,.16,.15,1);shadowMat.node_tree.links.new(source,mix.inputs[1]);shadowMat.node_tree.links.new(mix.outputs[0],bs.inputs['Base Color']);me.materials.append(shadowMat)
escaped=bpy.data.objects.new('Human shadow outside the frame',me);scene.collection.objects.link(escaped);escaped.visible_shadow=False;escaped.hide_render=True

# The familiar frame reflects the real corridor. Anomaly-only stair geometry
# is invisible to the player camera and visible to mirror rays.
stairs=[]
stairWood=wood.copy();stairWood.name='Wood seen only in the mirror';bs=stairWood.node_tree.nodes['Principled BSDF'];bs.inputs['Emission Color'].default_value=(.20,.085,.027,1);bs.inputs['Emission Strength'].default_value=.32
stairBrass=brass.copy();stairBrass.name='Reflected stair rods';bs=stairBrass.node_tree.nodes['Principled BSDF'];bs.inputs['Emission Color'].default_value=(.4,.19,.045,1);bs.inputs['Emission Strength'].default_value=.3
for i in range(11):
 x=-1.8+i*.37;h=.30*(i+1)
 stairs.append(cube('Impossible reflected tread',(x,18.0,h/2),(.37,4.2,h),stairWood,.012))
 stairs.append(cube('Impossible reflected runner',(x,18.0,h+.013),(.37,1.8,.018),velvet,.003))
 stairs.append(cube('Impossible reflected nosing',(x-.175,18.0,h+.025),(.025,2.05,.025),stairBrass,.004))
 for y in [16.5,19.5]:stairs.append(cyl('Reflected stair spindle',(x,y,h+.42),.022,.84,stairBrass))
for y in [16.5,19.5]:stairs.append(line('Reflected diagonal handrail',[(-1.95,y,1.04),(2.1,y,4.3)],.045,stairWood))
for o in stairs:o.visible_camera=False;o.visible_shadow=False;o.visible_diffuse=False;o.visible_glossy=True;o.hide_render=True

# Two actual closed panels, with matching wallpaper immediately behind them.
steel=mat('Aged lift bronze',(.09,.065,.032),.37,.72)
left=cube('Lift left closed panel',(58.085,9.43,1.52),(.83,.075,2.92),steel,.012)
right=cube('Lift right closed panel',(58.915,9.43,1.52),(.83,.075,2.92),steel,.012)
quad('Lift wallpaper inside',[(57.68,9.51,.07),(59.32,9.51,.07),(59.32,9.51,2.99),(57.68,9.51,2.99)],[(0,0),(1.64,0),(1.64,2.92),(0,2.92)],wall)
# Keep the sign fixed above the opening, not floating across the anomalous gap.
sign=bpy.data.objects.get('Lift sign')
if sign:sign.location.z=3.05;sign.data.size=.10
area('Lift inspection glow',(59.6,7.8,3.15),(58.5,9.5,1.6),(1,.49,.19),125,1.2)
area('Lift cool edge',(57.7,8.4,2.7),(58.5,9.5,1.2),(.13,.55,.42),45,.7)

def camera(name,room,pos,target,lens=40):
 d=bpy.data.cameras.new(name);o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();d.lens=lens;d.sensor_width=36;d.sensor_fit='HORIZONTAL';d.clip_start=.05;d.clip_end=250
 conv=lambda p:[p[0],p[2],-p[1]]
 idx=len(meta['cameras']);meta['cameras'].append({'name':name,'room':room,'position':conv(pos),'target':conv(target),'fov':math.degrees(2*math.atan(36/(2*lens)/(16/9))),'plate':name+'-v5.webp','minY':0,'detail':True});return idx
meta['details']['vignette']=camera('inspect-guests','corridor',(-.65,10.1,1.62),(.70,14.0,1.05),32)
meta['details']['portrait']=camera('inspect-portrait','corridor',(.5,5.8,2.05),(-2.16,7.7,1.85),28)
meta['details']['mirror']=camera('inspect-mirror','corridor',(.5,13.8,2.0),(-2.16,15.8,1.95),28)
meta['details']['coat']=camera('inspect-coat','corridor',(.45,10.1,1.85),(-1.55,12.8,1.45),28)
meta['details']['lift']=camera('inspect-lift','landing',(60.1,5.5,1.95),(58.5,9.5,1.6),28)
meta['details']['rain']=camera('inspect-rain','corridor',(.1,11.5,1.85),(2.15,12.9,2.10),38)
meta['details']['children']=camera('inspect-children','corridor',(-.65,10.3,1.45),(.75,14.05,.70),32)
meta['details']['dog']=camera('inspect-dog','corridor',(-.7,11.0,1.40),(.85,14.1,.38),30)

normalIndices=[0,1,2,4]+list(meta['details'].values())
for idx in normalIndices:meta['cameras'][idx]['plate']=meta['cameras'][idx]['name']+'-v5.webp'
jobs=[('normal',i,meta['cameras'][i]['plate']) for i in normalIndices]
for id,indices in [('E1',[0,1,2,meta['details']['portrait']]),('E3',[4,meta['details']['lift']]),('E4',[0,1,2,meta['details']['mirror'],meta['details']['coat']])]:
 meta['variants'][id]={}
 for idx in indices:
  file=f'{meta["cameras"][idx]["name"]}-{id}-v5.webp';meta['variants'][id][str(idx)]=file;jobs.append((id,idx,file))

def variant(id):
 portrait.data.materials[0]=changed if id=='E1' else normal
 for o in ghost:o.hide_render=True
 escaped.hide_render=id!='E1'
 for o in stairs:o.hide_render=id!='E4'
 left.location.x=58.085-(.26 if id=='E3' else 0);right.location.x=58.915+(.26 if id=='E3' else 0)
variant('normal')
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='WEBP';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.quality=95
scene.cycles.samples=40;scene.cycles.use_denoising=True;scene.cycles.max_bounces=6
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for dev in prefs.devices:dev.use=dev.type=='OPTIX'
scene.cycles.device='GPU';scene.frame_set(1)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'hotel-v5.blend'));(OUT/'hotel-v5.json').write_text(json.dumps(meta,indent=2))
only=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
for id,idx,file in jobs:
 if only and id not in only and meta['cameras'][idx]['name'] not in only:continue
 variant(id);scene.camera=bpy.data.objects[meta['cameras'][idx]['name']];scene.render.filepath=str(OUT/file);bpy.ops.render.render(write_still=True);print('PLATE V5 COMPLETE',file,flush=True)
print('HOTEL V5 COMPLETE',flush=True)
