"""Build the receptionist from Microsoft's MIT Rocketbox avatar and breathing take."""
from math import pi
from pathlib import Path
import bpy
import numpy as np
from mathutils import Quaternion

root=Path(__file__).resolve().parents[1]
source=root.parent/'sources/assets/rocketbox'
reviews=root.parent/'build-record/tests/rocketbox-25'
reviews.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.fps=30

def import_fbx(name):
    before=set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=str(source/name),use_image_search=False)
    items=set(bpy.data.objects)-before
    return items,next(o for o in items if o.type=='ARMATURE')

avatar,rig=import_fbx('Female_Adult_11.fbx')
mesh=next(o for o in avatar if o.type=='MESH')
motion,actor=import_fbx('f_idle_breathe_01.max.fbx')
take=actor.animation_data.action
first,last=map(int,take.frame_range)
rig.animation_data_clear()
for bone in rig.pose.bones:bone.rotation_mode='QUATERNION'
# Bake the motion in armature space. The clip's source rig has extra helper bones
# and starts from a different bind pose, so copying its local curves twists arms.
previous={}
for frame in list(range(first,last,2))+[last]:
    scene.frame_set(frame)
    rotations={}
    for bone in rig.pose.bones:
        other=actor.pose.bones.get(bone.name)
        if not other:continue
        desired=other.matrix.to_quaternion()
        rest=bone.bone.matrix_local.to_quaternion()
        if bone.parent:
            parent_rest=bone.parent.bone.matrix_local.to_quaternion()
            parent_pose=rotations[bone.parent.name]
            local=(parent_pose @ parent_rest.inverted() @ rest).inverted() @ desired
        else:local=rest.inverted() @ desired
        local.normalize()
        if bone.name in previous:local.make_compatible(previous[bone.name])
        previous[bone.name]=local.copy()
        rotations[bone.name]=desired
        bone.rotation_quaternion=local
        bone.keyframe_insert('rotation_quaternion',frame=frame)
idle=rig.animation_data.action
idle.name='Idle'
for obj in motion:bpy.data.objects.remove(obj,do_unlink=True)
for obj in avatar:
    if obj not in (rig,mesh):bpy.data.objects.remove(obj,do_unlink=True)
scene.frame_set(first)
scene.frame_end=last

def load_map(name,linear=False):
    im=bpy.data.images.load(str(source/('f011_'+name+'.tga')),check_existing=False)
    im.name='Rocketbox '+name
    if linear:im.colorspace_settings.name='Non-Color'
    return im

for slot in mesh.material_slots:
    mat=slot.material
    part=mat.name.split('_')[1]
    mat.name='Rocketbox '+part
    mat.use_nodes=True
    nodes=mat.node_tree.nodes
    nodes.clear()
    output=nodes.new('ShaderNodeOutputMaterial')
    shader=nodes.new('ShaderNodeBsdfPrincipled')
    mat.node_tree.links.new(shader.outputs[0],output.inputs['Surface'])
    base=load_map(part+'_color')
    if part=='body':
        # The central UV strip and sleeve islands carry the knitted dress.
        # Separate the warm skin in the V neckline and preserve the belt and boots.
        w,h=base.size
        pixels=np.empty(w*h*4,np.float32);base.pixels.foreach_get(pixels)
        rgb=pixels.reshape(h,w,4)[:,:,:3]
        v,u=np.ogrid[:h,:w];v=1-(v+.5)/h;u=(u+.5)/w
        central=(u>.335)&(u<.665)
        sleeves=(v>.405)&(v<.605)
        cloth=(central|sleeves)&(rgb[:,:,0]<.30)
        value=rgb @ np.array([.28,.57,.15],np.float32)
        fabric=np.stack([.092+value*2.7,.002+value*.17,.007+value*.30],axis=-1)
        rgb[cloth]=np.minimum(1,fabric[cloth])
        base.pixels.foreach_set(pixels);base.update()
        base.filepath_raw=str(reviews/'carmine-dress.png');base.file_format='PNG';base.save()
    base.pack()
    color=nodes.new('ShaderNodeTexImage');color.image=base
    mat.node_tree.links.new(color.outputs['Color'],shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value=.70 if part=='body' else .61
    if part=='opacity':
        mat.node_tree.links.new(color.outputs['Alpha'],shader.inputs['Alpha'])
        mat.use_backface_culling=False
    else:
        normal=nodes.new('ShaderNodeNormalMap')
        detail=nodes.new('ShaderNodeTexImage');detail.image=load_map(part+'_normal',True);detail.image.pack()
        normal.inputs['Strength'].default_value=.48
        mat.node_tree.links.new(detail.outputs['Color'],normal.inputs['Color'])
        mat.node_tree.links.new(normal.outputs['Normal'],shader.inputs['Normal'])

holder=bpy.data.objects.new('Night receptionist',None)
scene.collection.objects.link(holder)
for o in [rig,mesh]:
    if o.parent is None:o.parent=holder
holder.rotation_euler.z=pi
rig.animation_data.action=None
track=rig.animation_data.nla_tracks.new();track.name='Idle'
track.strips.new('Idle',first,idle)
scene.frame_set(first)
bpy.ops.object.select_all(action='DESELECT')
for o in [holder,rig,mesh]:o.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(root/'assets/receptionist-v25.glb'),export_format='GLB',
    use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',
    export_force_sampling=True,export_image_format='WEBP',export_image_quality=91,
    export_extras=False)
# Discard the FBX importer's original, unused materials and file placeholders.
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(root/'assets/receptionist-v25.blend'))
