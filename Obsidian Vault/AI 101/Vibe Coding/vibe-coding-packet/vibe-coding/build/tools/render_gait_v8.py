import bpy,math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'assets/guest-locomotion-v8.blend'))
s=bpy.context.scene;guest=bpy.data.objects['Guest'];rig=bpy.data.objects['GuestRig']
for o in s.objects:o.hide_render=not(o==guest or o in guest.children_recursive)
for tr in rig.animation_data.nla_tracks:tr.mute=True
s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True;s.display.shading.background_type='WORLD';s.world.color=(.11,.11,.11)
s.render.resolution_x=320;s.render.resolution_y=500;s.render.resolution_percentage=100
c=bpy.data.cameras.new('Gait evidence');cam=bpy.data.objects.new('Gait evidence',c);s.collection.objects.link(cam);s.camera=cam;c.type='ORTHO';c.ortho_scale=2.2
cam.location=(3,-3,1.25);cam.rotation_euler=(Vector((0,0,.95))-cam.location).to_track_quat('-Z','Y').to_euler()
s.render.image_settings.file_format='PNG'
for kind,frame in [('Walk',1),('Walk',10),('Walk',19),('WalkBack',10),('StepLeft',10),('StepRight',10)]:
 rig.animation_data.action=bpy.data.actions['Guest_v8_'+kind];s.frame_set(frame);s.render.filepath=str(root.parent/f'build-record/tests/ui-gait-08/pose-{kind}-{frame}.png');bpy.ops.render.render(write_still=True)
