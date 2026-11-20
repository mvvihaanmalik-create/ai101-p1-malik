import bpy,math
from pathlib import Path
from mathutils import Vector
OUT=Path(__file__).resolve().parents[1]/'assets'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'characters-v2.blend'))
s=bpy.context.scene;s.frame_set(1)
bpy.data.objects['Guest'].location=(-.63,0,0);bpy.data.objects['Guest'].rotation_euler.z=0
bpy.data.objects['Butler'].location=(.63,0,0)
s.world=bpy.data.worlds.new('Portrait darkness');s.world.use_nodes=True;s.world.node_tree.nodes.get('Background').inputs[0].default_value=(.04,.05,.065,1);s.world.node_tree.nodes.get('Background').inputs[1].default_value=.4
def area(name,loc,target,color,energy,size):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Amber key',(-2,2,3),(.3,0,1.3),(1,.64,.35),240,2)
area('Window rim',(1.8,-1,2.6),(0,0,1.4),(.38,.60,1),300,1.4)
area('Face fill',(.5,3,1.6),(.5,0,1.6),(.7,.78,1),35,2)
d=bpy.data.cameras.new('Study');o=bpy.data.objects.new('Study',d);s.collection.objects.link(o);o.location=(0,4.4,1.55);o.rotation_euler=(Vector((0,0,1.04))-o.location).to_track_quat('-Z','Y').to_euler();d.lens=56;s.camera=o
s.render.engine='CYCLES';p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='OPTIX';p.get_devices()
for dev in p.devices:dev.use=dev.type=='OPTIX'
s.cycles.device='GPU';s.cycles.samples=48;s.cycles.use_denoising=True;s.render.resolution_x=1400;s.render.resolution_y=1100;s.render.resolution_percentage=100;s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast'
s.render.image_settings.file_format='PNG';s.render.filepath=str(OUT/'character-study-v2.png');bpy.ops.render.render(write_still=True)
print('GLTF_IMAGE_FORMATS',[e.identifier for e in bpy.ops.export_scene.gltf.get_rna_type().properties['export_image_format'].enum_items])
print('CHARACTER STUDY COMPLETE')
