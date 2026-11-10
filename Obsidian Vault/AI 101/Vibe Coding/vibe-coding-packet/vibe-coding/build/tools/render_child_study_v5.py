import bpy,math
from pathlib import Path
from mathutils import Vector
out=Path(__file__).resolve().parents[1]/'assets'
bpy.ops.wm.open_mainfile(filepath=str(out/'child-v5.blend'));s=bpy.context.scene;s.frame_set(1)
print('CHILD SIZE',[(o.name,list(o.dimensions)) for o in s.objects if o.type=='MESH'])
for loc,energy,col in [((1,2,2),80,(1,.7,.5)),((-1,1,1.3),45,(.5,.7,1))]:
 d=bpy.data.lights.new('Study','AREA');d.energy=energy;d.color=col;d.size=1.2;o=bpy.data.objects.new('Study',d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.7))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Study');o=bpy.data.objects.new('Study',d);s.collection.objects.link(o);o.location=(0,3.2,.8);o.rotation_euler=(Vector((0,0,.65))-o.location).to_track_quat('-Z','Y').to_euler();d.lens=65;s.camera=o
s.render.engine='CYCLES';s.cycles.samples=24;s.cycles.use_denoising=True;s.render.resolution_x=800;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.filepath=str(out/'child-study-v5.png');s.view_settings.view_transform='AgX';bpy.ops.render.render(write_still=True)
print('CHILD STUDY COMPLETE')
