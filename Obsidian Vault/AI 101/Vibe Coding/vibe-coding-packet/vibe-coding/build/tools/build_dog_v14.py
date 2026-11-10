"""Adapt the CC BY 4.0 3DSkillUp German Shepherd. No downloaded scripts run."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector,Matrix
root=Path(__file__).resolve().parents[1];out=root/'assets'
source=next((root.parent/'sources/assets/german-shepherd/unpacked').rglob('*Rigged.blend'))
bpy.ops.wm.open_mainfile(filepath=str(source));s=bpy.context.scene
rig=bpy.data.objects['001_GermanShepherd_Rig'];dog=bpy.data.objects['GermanShepherd_Mesh']
for o in list(s.objects):
 if o not in [rig,dog]:bpy.data.objects.remove(o,do_unlink=True)
rig.animation_data_clear()
for p in rig.pose.bones:p.rotation_mode='XYZ';p.rotation_euler=(0,0,0);p.location=(0,0,0);p.scale=(1,1,1)
for m in dog.data.materials:
 if not m.use_nodes:continue
 bs=m.node_tree.nodes.get('Principled BSDF')
 if bs:bs.inputs['Roughness'].default_value=.84
for im in bpy.data.images:
 if im.source=='FILE':im.pack()
# Bake a seated silhouette from the same rig, preserving the source topology.
def shift(name,delta):
 p=rig.pose.bones[name];p.location=p.bone.matrix_local.to_quaternion().inverted()@Vector(delta)
shift('CTRL-body',(0,0,-.19))
bpy.context.view_layer.update()
def aim_control(name,direction):
 p=rig.pose.bones[name];axis=p.bone.tail_local-p.bone.head_local
 rotation=axis.rotation_difference(Vector(direction).normalized())@p.bone.matrix_local.to_quaternion()
 p.matrix=Matrix.LocRotScale(p.head,rotation,Vector((1,1,1)));bpy.context.view_layer.update()
for name,direction in [('CTRL-pelvis',(0,-.08,.08)),('CTRL-spine.01',(0,-.07,.06)),('CTRL-spine.02',(0,-.08,.06)),('CTRL-chest',(0,-.07,.08)),('CTRL-neck.01',(0,-.055,.075)),('CTRL-neck.02',(0,-.042,.08)),('CTRL-head',(0,-.121,-.048))]:aim_control(name,direction)
for side in ['L','R']:shift('CTRL-hind_foot.'+side,(0,-.14,0))
bpy.context.view_layer.update()
dg=bpy.context.evaluated_depsgraph_get();sitMesh=bpy.data.meshes.new_from_object(dog.evaluated_get(dg),depsgraph=dg)
sit=bpy.data.objects.new('DogSit',sitMesh);s.collection.objects.link(sit);sit.matrix_world=dog.matrix_world.copy()
for p in rig.pose.bones:p.rotation_euler=(0,0,0);p.location=(0,0,0)
holder=bpy.data.objects.new('DogStand',None);s.collection.objects.link(holder);rig.parent=holder
# Both source mesh and rig are in metres. A full-size dog, feet on the floor.
rig.name='HotelDogRig';dog.name='HotelDogCoat';s.frame_set(1);bpy.context.view_layer.update()
bpy.ops.object.select_all(action='DESELECT')
for o in [holder,rig,dog,sit]:o.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(out/'dog-v14.glb'),export_format='GLB',use_selection=True,export_animations=False,export_skins=True,export_morph=False,export_image_format='WEBP',export_image_quality=90)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'dog-v14.blend'))
(root.parent/'build-record/tests/repairs-14/dog-adaptation.json').write_text(json.dumps({'source':'German Shepherd by 3dskillup.art','license':'CC BY 4.0','vertices':len(dog.data.vertices),'triangles':sum(len(p.vertices)-2 for p in dog.data.polygons),'textureResolution':list(bpy.data.images['mat_001_BaseColor.png'].size),'glbBytes':(out/'dog-v14.glb').stat().st_size},indent=2))
print('DOG V14 EXPORTED',flush=True)
