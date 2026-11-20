"""Second lighting pass on the saved hotel. Keeps geometry/cameras identical."""
import bpy
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'assets'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'room-zero.blend'))
scene=bpy.context.scene
pref=bpy.context.preferences.addons['cycles'].preferences;pref.compute_device_type='OPTIX';pref.get_devices()
for d in pref.devices:d.use=d.type=='OPTIX'
scene.cycles.device='GPU'
for o in scene.objects:
    if o.type!='LIGHT':continue
    if o.name.startswith('Warm pool'):o.data.energy=36 if '22' not in o.name else 30
    elif o.name.startswith('Downlit wallpaper'):o.data.energy=14
    elif o.name.startswith('Blue window wash'):o.data.energy=78
    elif o.name.startswith('Moon through rain'):o.data.energy=220
    elif o.name.startswith('Soft rear fill'):o.data.energy=12
scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.045
bpy.data.materials['Fine hotel dust'].node_tree.nodes.get('Principled Volume').inputs['Density'].default_value=.007
scene.view_settings.exposure=.0
# A darker, less glossy walnut reads as old joinery rather than varnished plastic.
for name in ['Hand-rubbed walnut','Recessed walnut']:
    m=bpy.data.materials[name];p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.42
    for n in m.node_tree.nodes:
        if n.type=='VALTORGB':
            for e in n.color_ramp.elements:
                base=(.12,.052,.021) if name=='Hand-rubbed walnut' else (.055,.026,.014)
                factor=(.38 if e.position<.5 else 1.6)*.66
                e.color=(*(x*factor for x in base),1)
scene.cycles.samples=112
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'room-zero.blend'))
for name in ['arrival','passage']:
    scene.camera=bpy.data.objects[name];scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
print('REFINED LIGHTING COMPLETE')
