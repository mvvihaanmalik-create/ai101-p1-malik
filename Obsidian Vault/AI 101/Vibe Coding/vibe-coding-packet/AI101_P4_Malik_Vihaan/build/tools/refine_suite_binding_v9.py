import bpy,math,json
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'assets';bpy.ops.wm.open_mainfile(filepath=str(out/'hotel-v9.blend'));s=bpy.context.scene
for o in list(s.objects):
 if o.name.startswith(('Woven rush protection','Bound with red thread','Rush effigy','Effigy binding')):bpy.data.objects.remove(o,do_unlink=True)
rush=bpy.data.materials['Dried rush bindings'];thread=bpy.data.materials['Old red binding thread']
def cord(name,pts,r,mat):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2;p=c.splines.new('POLY');p.points.add(len(pts)-1)
 for v,co in zip(p.points,pts):v.co=(*co,1)
 o=bpy.data.objects.new(name,c);s.collection.objects.link(o);o.data.materials.append(mat)
# A small, irregular, faceless rush figure with split hanging ends.
for i in range(13):
 x=(i-6)*.009
 cord('Rush effigy stem',[(120+x*.6,8.18,2.91),(120+x,8.17,2.75),(120+x*.65,8.18,2.60),(120+x*1.8,8.18,2.38+.025*math.sin(i*2.1))],.004,rush)
for i in range(7):
 z=2.76+(i-3)*.007
 cord('Rush effigy arms',[(119.77,8.18,z-.08),(119.94,8.17,z),(120.07,8.17,z),(120.22,8.18,z-.11)],.004,rush)
for i in range(9):
 a=i/9*math.tau
 pts=[(120+.055*math.cos(t/16*math.tau+a),8.17+.015*math.sin(t/16*math.tau),2.94+.066*math.sin(t/16*math.tau+a)) for t in range(17)]
 cord('Rush effigy head',pts,.003,rush)
for y in [2.84,2.62]:
 for i in range(4):cord('Effigy binding',[(119.955,8.145,y+i*.006),(120.05,8.145,y+i*.006)],.0035,thread)
cord('Effigy binding loose end',[(120.04,8.14,2.63),(120.11,8.14,2.48),(120.08,8.14,2.39)],.003,thread)
s.camera=bpy.data.objects['suite'];s.render.filepath=str(out/'suite-v9.webp');prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for dev in prefs.devices:dev.use=dev.type=='OPTIX'
s.cycles.device='GPU';bpy.ops.wm.save_as_mainfile(filepath=str(out/'hotel-v9.blend'));bpy.ops.render.render(write_still=True)
