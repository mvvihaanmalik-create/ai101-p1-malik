"""Correct signage fit, support the landing lamp, and finish the stair shell."""
import bpy,json,sys,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'hotel-v3.blend'));scene=bpy.context.scene
# Load only helper definitions, avoiding a rebuild.
import ast
tree=ast.parse((ROOT/'tools/build_scene.py').read_text());exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in {'cube','finish'}],type_ignores=[]),'<helpers>','exec'))
wood=bpy.data.materials['Hand-rubbed walnut'];brass=bpy.data.materials['Aged brass']
if 'Landing lamp console' not in bpy.data.objects:cube('Landing lamp console',(57.6,5.8,.4),(.68,.65,.8),wood,.035)
for o in scene.objects:
    if o.type=='FONT' and o.name.startswith(('Door lettering','Suite name')):
        o.data.size=(.15 if o.name.startswith('Suite name') else .13)*.70
    if o.name.startswith('Room wall') and (abs(o.location.x-87.5)<.1 or abs(o.location.x-92.5)<.1):o.location.z=2.8;o.dimensions.z=5.6
    if o.name.startswith('Room end wall') and abs(o.location.x-90)<.1:o.location.z=2.8;o.dimensions.z=5.6
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
bpy.data.objects['Hotel identity'].data.body='R E C E P T I O N';bpy.data.objects['Hotel identity'].data.size=.20
for device in prefs.devices:device.use=device.type=='OPTIX'
scene.cycles.device='GPU';bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'hotel-v3.blend'))
meta=json.loads((OUT/'hotel-v3.json').read_text())
only=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
for c in meta['cameras']:
    if only and c['name'] not in only:continue
    if c['room']=='lounge':continue
    scene.camera=bpy.data.objects[c['name']];scene.render.filepath=str(OUT/c['plate']);bpy.ops.render.render(write_still=True);print('REFINED',c['name'],flush=True)
print('REFINEMENT COMPLETE',flush=True)
