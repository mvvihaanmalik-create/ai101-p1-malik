"""Refit the receptionist from the local v23 model. Run with Blender 4.3."""
from pathlib import Path
from math import sin, cos, exp, pi
import bpy
import bmesh
from mathutils import kdtree

root = Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'assets/receptionist-v23.blend'))
body = bpy.data.objects['Receptionist skin']
suit = bpy.data.objects['Receptionist female_elegantsuit01']
rig = bpy.data.objects['ReceptionistRig']

def smooth(a, b, x):
    t = min(1, max(0, (x-a)/(b-a)))
    return t*t*(3-2*t)

# Pull in the outside of the cheek and jaw while holding the mouth and eye sockets.
for v in body.data.vertices:
    x,y,z = v.co
    cheek = .138*exp(-((z-1.558)/.032)**2)
    jaw = .157*exp(-((z-1.519)/.025)**2)
    lateral = smooth(.018,.053,abs(x))
    front = 1-smooth(-.066,.008,y)
    v.co.x -= x*(cheek+jaw)*lateral*front
    v.co.y += .003*exp(-((z-1.555)/.018)**2)*lateral*front

def satin(name, rgb, rough):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bs = mat.node_tree.nodes['Principled BSDF']
    bs.inputs['Base Color'].default_value=(*rgb,1)
    bs.inputs['Roughness'].default_value=rough
    bs.inputs['Sheen Weight'].default_value=.26
    return mat

red=satin('Carmine satin',(.48,.011,.029),.40)
sash=satin('Garnet waist binding',(.24,.005,.019),.33)
# Keep the fitted shoulders, sleeves and neckline from the CC0 pattern.
# Cut both old garment panels at the waist; sew the new skirt behind a bias band.
bm=bmesh.new()
bm.from_mesh(suit.data)
zcut=1.093
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
    plane_co=(0,0,zcut),plane_no=(0,0,1),dist=.000001)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<zcut-.00001 and abs(v.co.x)<.216],context='VERTS')
bm.to_mesh(suit.data)
bm.free()
suit.name='Receptionist dress bodice'
suit.data.materials.clear();suit.data.materials.append(red)
for poly in suit.data.polygons:poly.material_index=0

# Each row gives height, half-width, forward depth and back depth of the cut.
rows=[(1.101,.138,.158,.039),(1.097,.141,.161,.042),(1.077,.139,.158,.040),
      (1.069,.139,.155,.041),(1.064,.137,.150,.043),(1.025,.150,.146,.055),
      (.965,.178,.157,.083),(.89,.199,.165,.111),(.82,.209,.167,.119),
      (.72,.222,.170,.123),(.62,.239,.180,.130),(.53,.254,.189,.137),
      (.496,.260,.194,.141),(.492,.257,.192,.139)]
count=100
pts=[];faces=[]
for row,(z,w,front,back) in enumerate(rows):
    flare=max(0,(1-z)/.50)**1.55
    for i in range(count):
        a=i*2*pi/count
        fold=flare*(.008*sin(9*a+.56)+.0035*sin(15*a-.42))
        pts.append(((w+fold)*sin(a),(back-front)*.5-((back+front)*.5+fold)*cos(a),
                    z+.0035*flare*cos(9*a+.56)))
        if row:
            k=(row-1)*count+i;j=(row-1)*count+(i+1)%count
            faces.append((k,k+count,j+count,j))
mesh=bpy.data.meshes.new('Gored bias skirt')
mesh.from_pydata(pts,[],faces);mesh.update()
skirt=bpy.data.objects.new('Receptionist red dress skirt',mesh)
bpy.context.collection.objects.link(skirt)
skirt.parent=rig
mesh.materials.append(red);mesh.materials.append(sash)
for f in mesh.polygons:
    f.use_smooth=True
    f.material_index=int(f.index//count in (0,1,2))
# Interpolate the existing fitted garment's bone weights over the new skirt.
original=bpy.data.objects.get('Receptionist skin')
tree=kdtree.KDTree(len(original.data.vertices))
for v in original.data.vertices:tree.insert(v.co,v.index)
tree.balance()
groups={g.index:skirt.vertex_groups.new(name=g.name) for g in original.vertex_groups if g.name in rig.data.bones}
for v in mesh.vertices:
    weights={}
    for _,idx,dist in tree.find_n(v.co,8):
        for g in original.data.vertices[idx].groups:
            if g.group in groups:weights[g.group]=weights.get(g.group,0)+g.weight/(.01+dist)**2
    top=sorted(weights.items(),key=lambda item:-item[1])[:4]
    total=sum(value for _,value in top)
    for gid,value in top:groups[gid].add([v.index],value/total,'REPLACE')
mod=skirt.modifiers.new('Dress follows the guest-facing rig','ARMATURE');mod.object=rig
holder=bpy.data.objects['Receptionist']
bpy.context.scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for obj in [holder]+list(holder.children_recursive):obj.select_set(True)
bpy.context.view_layer.objects.active=holder
bpy.ops.export_scene.gltf(filepath=str(root/'assets/receptionist-v24.glb'),export_format='GLB',
    use_selection=True,export_apply=False,export_animations=True,export_animation_mode='NLA_TRACKS',
    export_nla_strips=True,export_force_sampling=True,export_anim_single_armature=False,
    export_morph=False,export_skins=True,export_materials='EXPORT',export_image_format='WEBP',export_image_quality=92)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(root/'assets/receptionist-v24.blend'))
