"""Native camera masters. The v17 plates remain instant fallbacks during play."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
base=Path(__file__).resolve().parents[1]/'assets'
out=base/'masters-v18';out.mkdir(exist_ok=True)
def setup(scene_file):
    bpy.ops.wm.open_mainfile(filepath=str(base/scene_file))
    s=bpy.context.scene
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='OPTIX';prefs.get_devices()
    for d in prefs.devices:d.use=d.type=='OPTIX'
    s.cycles.device='GPU';s.cycles.samples=48;s.cycles.use_denoising=True;s.cycles.use_adaptive_sampling=True;s.cycles.adaptive_threshold=.055
    s.render.resolution_x=2560;s.render.resolution_y=1440;s.render.resolution_percentage=100
    s.render.image_settings.file_format='WEBP';s.render.image_settings.quality=96
    # Low-relief surface finish under the existing practical lights. Keep relief
    # already authored on other materials, and never change clue geometry.
    for m in bpy.data.materials:
        if not m.use_nodes:continue
        name=m.name.lower()
        if not any(k in name for k in ('walnut','brass','velvet','plaster','leather','mahogany')):continue
        nodes=m.node_tree.nodes;links=m.node_tree.links;bs=next((n for n in nodes if n.type=='BSDF_PRINCIPLED'),None)
        if not bs or bs.inputs['Normal'].is_linked:continue
        tex=nodes.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=155 if 'brass' in name else 85;tex.inputs['Detail'].default_value=2
        bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.14;bump.inputs['Distance'].default_value=.0009
        links.new(tex.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bs.inputs['Normal'])
    return s
def render(s,c,file):
    if (out/file).is_file():return
    cam=bpy.data.objects.new('Master lens',bpy.data.cameras.new('Master lens'));s.collection.objects.link(cam)
    cv=lambda a:Vector((a[0],-a[2],a[1]))
    cam.location=cv(c['position']);cam.rotation_euler=(cv(c['target'])-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.sensor_width=36;cam.data.sensor_fit='HORIZONTAL';cam.data.lens=36/(2*math.tan(math.radians(c['fov'])/2)*16/9)
    s.camera=cam;s.render.filepath=str(out/file);bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam,do_unlink=True);print('MASTER '+file,flush=True)
s=setup('hotel-v14.blend')
for name,body in [('Suite name','WEST\nSTAIR'),('Above the threshold','W'),('Door lettering.001','WEST GALLERY'),('Door lettering.002','UPPER LANDING')]:bpy.data.objects[name].data.body=body
meta=json.loads((base/'hotel-v15.json').read_text())
for i in [3]+[n for n in range(len(meta['cameras'])) if n!=3]:
    c=meta['cameras'][i]
    for key,file in [('normal',c['plate'])]+[(k,v[str(i)]) for k,v in meta['variants'].items() if str(i) in v]:
        bpy.data.objects['Landscape canvas'].data.materials[0]=bpy.data.materials['Founder looking at you' if key=='E1' else 'Founder looking away']
        bpy.data.objects['Human shadow outside the frame'].hide_render=key!='E1'
        for o in s.objects:
            if o.name.startswith(('Impossible reflected','Reflected stair','Reflected diagonal')):o.hide_render=key!='E4'
        for n,name in enumerate(['Lift left closed panel','Lift right closed panel']):
            bpy.data.objects[name].location.x=58.5+(-.415 if n==0 else .415)+((-.26 if n==0 else .26) if key=='E3' else 0)
        render(s,c,file)
s=setup('ending-reception-v6.blend')
for c in json.loads((base/'ending-v6.json').read_text())['shots']:render(s,c,c['plate'])
