import bpy,json,math
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'assets'
bpy.ops.wm.open_mainfile(filepath=str(out/'hotel-v9.blend'));s=bpy.context.scene;m=json.loads((out/'hotel-v9.json').read_text());c=m['cameras'][m['details']['luggage']];c['position']=[1.8,1.55,-18.3];c['target']=[.85,.85,-20.3];c['fov']=math.degrees(2*math.atan(36/(2*19)/(16/9)));cam=bpy.data.objects[c['name']];cam.location=(1.8,18.3,1.55);cam.rotation_euler=(Vector((.85,20.3,.85))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=19;s.camera=cam
(out/'hotel-v9.json').write_text(json.dumps(m,indent=2));bpy.ops.wm.save_as_mainfile(filepath=str(out/'hotel-v9.blend'));s.render.filepath=str(out/c['plate'])
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for dev in prefs.devices:dev.use=dev.type=='OPTIX'
s.cycles.device='GPU';bpy.ops.render.render(write_still=True)
