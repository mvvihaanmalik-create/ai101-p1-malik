"""Lighting correction: clear the light path through the existing window mullions."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
OUT=Path(__file__).resolve().parents[1]/'assets'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'room-zero.blend'));scene=bpy.context.scene
pref=bpy.context.preferences.addons['cycles'].preferences;pref.compute_device_type='OPTIX';pref.get_devices()
for d in pref.devices:d.use=d.type=='OPTIX'
scene.cycles.device='GPU';scene.cycles.samples=128
for o in scene.objects:
    if o.name.startswith(('Window pane','Window recess','Rain on glass')):o.visible_shadow=False
    if o.type!='LIGHT':continue
    if o.name.startswith('Blue window wash'):
        o.location.x=1.96;o.location.y+=.35;o.data.energy=35
    if o.name.startswith('Moon through rain'):
        y=o.location.y;o.location=(2.32,y,2.68);o.rotation_euler=(Vector((-2.0,y+2.8,-.1))-o.location).to_track_quat('-Z','Y').to_euler()
        o.data.energy=680;o.data.color=(.44,.65,1.0);o.data.spot_size=1.0;o.data.spot_blend=.30;o.data.shadow_soft_size=.045
    if o.name.startswith('Warm pool'):o.data.energy=30;o.data.color=(1,.48,.18)
    if o.name.startswith('Downlit wallpaper'):o.data.energy=15
scene.view_settings.exposure=.12
scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.055
bpy.data.materials['Fine hotel dust'].node_tree.nodes.get('Principled Volume').inputs['Density'].default_value=.009
# Fine roughness variation breaks up the uniform varnish without changing geometry.
for name in ['Hand-rubbed walnut','Recessed walnut']:
    m=bpy.data.materials[name];p=m.node_tree.nodes.get('Principled BSDF')
    noise=next((n for n in m.node_tree.nodes if n.type=='TEX_NOISE'),None)
    ramp=m.node_tree.nodes.new('ShaderNodeMapRange');ramp.inputs['From Min'].default_value=0;ramp.inputs['From Max'].default_value=1;ramp.inputs['To Min'].default_value=.28;ramp.inputs['To Max'].default_value=.58
    if noise:m.node_tree.links.new(noise.outputs['Fac'],ramp.inputs['Value']);m.node_tree.links.new(ramp.outputs[0],p.inputs['Roughness'])
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'hotel-lighting-v2.blend'))
for name in ['arrival','passage']:
    scene.camera=bpy.data.objects[name];scene.render.filepath=str(OUT/(name+'-v2.png'));bpy.ops.render.render(write_still=True)
meta=json.loads((OUT/'scene.json').read_text())
for c in meta['cameras']:c['plate']=c['name']+'-v2.png'
(OUT/'scene-v2.json').write_text(json.dumps(meta,indent=2))
print('LIGHTING V2 COMPLETE')
