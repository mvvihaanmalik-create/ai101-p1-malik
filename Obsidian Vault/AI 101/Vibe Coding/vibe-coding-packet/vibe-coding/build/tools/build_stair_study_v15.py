"""One registered camera for the upper landing and a bloodless porcelain cast of the existing child's face."""
import bpy, math, bmesh, json
from mathutils import Vector
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'assets'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(out/'child-v5.glb'))
source=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.name.startswith('Child ') and not any(s in o.name.lower() for s in ['suit','shoes'])]
deps=bpy.context.evaluated_depsgraph_get()
cast=[]
for o in source:
    ev=o.evaluated_get(deps)
    mesh=bpy.data.meshes.new_from_object(ev);mesh.transform(ev.matrix_world)
    obj=bpy.data.objects.new('Kiln cast '+o.name,mesh);bpy.context.collection.objects.link(obj)
    cast.append(obj)
verts=[v.co for o in cast for v in o.data.vertices]
high=max(v.z for v in verts);low=min(v.z for v in verts);cut=high-(high-low)*.18
for o in cast:
    bm=bmesh.new();bm.from_mesh(o.data)
    res=bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,cut),plane_no=(0,0,1),clear_inner=True,dist=.00001)
    edges=[e for e in res['geom_cut'] if isinstance(e,bmesh.types.BMEdge) and e.is_valid and e.is_boundary]
    if edges:bmesh.ops.holes_fill(bm,edges=edges,sides=0)
    bm.to_mesh(o.data);bm.free();o.data.update()
    for p in o.data.polygons:p.use_smooth=True
    if 'high-poly' in o.name:continue  # retain the glazed eyes and pupils
    mat=bpy.data.materials.new(o.name);mat.use_nodes=True
    bs=mat.node_tree.nodes['Principled BSDF'];dark=any(s in o.name.lower() for s in ['short','brow','lash'])
    bs.inputs['Base Color'].default_value=(.057,.034,.022,1) if dark else (.73,.63,.49,1)
    bs.inputs['Roughness'].default_value=.36 if dark else .28
    o.data.materials.clear();o.data.materials.append(mat)
    for p in o.data.polygons:p.material_index=0
# Center and scale the prop to the diameter of the ordinary ball.
verts=[v.co.copy() for o in cast for v in o.data.vertices]
lo=Vector([min(v[k] for v in verts) for k in range(3)]);hi=Vector([max(v[k] for v in verts) for k in range(3)])
center=(lo+hi)/2
for o in cast:
    for v in o.data.vertices:v.co=(v.co-center)*(.365/(hi.z-lo.z))
bpy.ops.object.select_all(action='DESELECT')
for o in cast:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out/'porcelain-v15.glb'),export_format='GLB',use_selection=True,export_animations=False)
if (out/'hotel-v15.json').exists() and (out/'inspect-stair-v15.webp').exists():
    print('CAST COMPLETE',lo[:],hi[:],flush=True);raise SystemExit(0)
bpy.ops.wm.open_mainfile(filepath=str(out/'hotel-v14.blend'))
s=bpy.context.scene
c={'name':'inspect-stair-v15','room':'stairs','position':[90.35,3.08,-6.38],'target':[90.04,2.52,-8.95],'fov':39,'minY':0,'plate':'inspect-stair-v15.webp'}
cam=bpy.data.objects.new(c['name'],bpy.data.cameras.new(c['name']));s.collection.objects.link(cam)
def point(v):return Vector((v[0],-v[2],v[1]))
cam.location=point(c['position']);cam.rotation_euler=(point(c['target'])-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.sensor_width=36;cam.data.sensor_fit='HORIZONTAL';cam.data.lens=36/(2*math.tan(math.radians(c['fov'])/2)*16/9);s.camera=cam
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for dev in prefs.devices:dev.use=dev.type=='OPTIX'
s.cycles.device='GPU';s.cycles.samples=32;s.cycles.use_denoising=True
s.render.resolution_x=1920;s.render.resolution_y=1080;s.render.resolution_percentage=100;s.render.image_settings.file_format='WEBP';s.render.image_settings.quality=95
s.render.filepath=str(out/c['plate']);bpy.ops.render.render(write_still=True)
meta=json.loads((out/'hotel-v14.json').read_text());meta['version']=15;meta['details']['stair']=len(meta['cameras']);meta['cameras'].append(c)
(out/'hotel-v15.json').write_text(json.dumps(meta,indent=2))
print('STUDY COMPLETE',lo[:],hi[:],flush=True)
