"""Render the actual editable 3D model from the same frontal angle for review."""
from pathlib import Path
import bpy, math, sys
from mathutils import Vector

root=Path(__file__).resolve().parents[1]
folder=root.parent/'build-record/tests/receptionist-22'
args=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=str(Path(args[0]).resolve()))
scene=bpy.context.scene;scene.frame_set(1)
world=bpy.data.worlds.new('Portrait studio');world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.105,.075,.06,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.48;scene.world=world
def area(name,pos,target,energy,color,size):
    lamp=bpy.data.lights.new(name,'AREA');lamp.energy=energy;lamp.color=color;lamp.shape='DISK';lamp.size=size
    obj=bpy.data.objects.new(name,lamp);scene.collection.objects.link(obj);obj.location=pos
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
area('Large softbox',(1.2,1.5,2.5),(0,0,1.60),74,(1,.83,.71),1.55)
area('Fill',(-1.04,.95,1.75),(0,0,1.61),20,(.88,.90,1),1.2)
area('Hair light',(-.5,-.55,2.15),(0,0,1.62),30,(1,.70,.45),.85)
camera=bpy.data.cameras.new('Portrait lens');obj=bpy.data.objects.new('Portrait lens',camera);scene.collection.objects.link(obj)
obj.location=(.003,1.34,1.634);obj.rotation_euler=(Vector((0,.025,1.573))-obj.location).to_track_quat('-Z','Y').to_euler();camera.lens=77;scene.camera=obj
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for d in prefs.devices:d.use=d.type=='OPTIX'
scene.cycles.device='GPU';scene.render.resolution_x=640;scene.render.resolution_y=704;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(folder/args[1])
bpy.ops.render.render(write_still=True)
