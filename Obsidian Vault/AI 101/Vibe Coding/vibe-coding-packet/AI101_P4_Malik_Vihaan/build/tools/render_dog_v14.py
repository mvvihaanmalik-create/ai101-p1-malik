import bpy
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'assets/dog-v14.blend'));s=bpy.context.scene
bpy.data.objects['DogStand'].location.x=-.65;bpy.data.objects['DogSit'].location.x=.65
bpy.ops.object.camera_add(location=(2.4,-2.6,1.5));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.4))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=48;s.camera=cam
for pos,power in [((0,-2,3),350),((1,2,2),250)]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=3;o.rotation_euler=(Vector((0,0,.4))-o.location).to_track_quat('-Z','Y').to_euler()
s.world=bpy.data.worlds.new('Study world');s.world.color=(.18,.18,.18);s.render.engine='CYCLES';s.cycles.samples=16;s.render.resolution_x=1000;s.render.resolution_y=650;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.filepath=str(root.parent/'build-record/tests/repairs-14/dog-pose-study.png');bpy.ops.render.render(write_still=True)
