"""Fit a supplied frontal portrait onto the animated skin. Run locally in Blender."""
from pathlib import Path
import sys
import bpy
import numpy as np
from mathutils import Vector

root = Path(__file__).resolve().parents[1]
reference = Path(sys.argv[sys.argv.index('--') + 1])
bpy.ops.wm.open_mainfile(filepath=str(root / 'assets/receptionist-v22.blend'))
body = bpy.data.objects['Receptionist skin']
scene = bpy.context.scene
scene.frame_set(1)
camera = bpy.data.cameras.new('Fitting lens')
camera.lens = 77
cam = bpy.data.objects.new('Fitting lens', camera)
scene.collection.objects.link(cam)
cam.location = (.003, 1.34, 1.634)
cam.rotation_euler = (Vector((0, .025, 1.573)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
# Corresponding skin landmarks in the rig portrait and the supplied 1280 x 1002 photo.
pairs = np.array([
 [318,145,651,104],[249,165,518,158],[383,176,767,169],
 [246,233,539,246],[274,222,570,235],[305,229,630,249],
 [336,229,691,248],[363,221,734,232],[390,229,764,239],
 [255,246,544,278],[281,239,586,262],[303,246,622,280],[281,251,587,289],
 [336,246,690,283],[360,239,727,265],[385,246,759,274],[360,251,726,290],
 [321,249,656,281],[319,283,654,348],[300,287,624,357],[338,287,682,357],[320,294,655,367],
 [279,313,575,400],[359,312,729,397],[311,307,638,388],[331,307,662,388],
 [320,309,653,391],[319,316,650,404],[319,325,652,421],[319,333,650,438],
 [320,379,649,521],[251,341,537,456],[386,341,764,453],[233,282,499,340],[405,282,798,340]
], dtype=float)
points = (pairs[:, :2] - [320, 260]) / 100
def kernel(q):
    d = ((q[:, None] - points[None])**2).sum(axis=2)
    return d * np.log(np.maximum(d, 1e-8))
basis = np.column_stack((np.ones(len(points)), points))
system = np.block([[kernel(points) + np.eye(len(points))*.0001, basis], [basis.T, np.zeros((3,3))]])
weights = np.linalg.solve(system, np.vstack((pairs[:, 2:], np.zeros((3,2)))))
# Store a compact warp lookup for the part of the portrait occupied by skin.
yy, xx = np.mgrid[100:412, 195:445]
grid = (np.column_stack((xx.ravel(), yy.ravel())) - [320,260]) / 100
warp = np.vstack([np.column_stack((kernel(q), np.ones(len(q)), q)) @ weights
                  for q in np.array_split(grid, 16)]).reshape(*xx.shape, 2)
def pixels(img):
    w,h = img.size
    data = np.empty(w*h*4, np.float32)
    img.pixels.foreach_get(data)
    return data.reshape(h,w,4)
photo = bpy.data.images.load(str(reference))
assert tuple(photo.size) == (1280,1002), 'Expected the supplied front portrait'
photo_rgb = pixels(photo)[::-1,:,:3]
def sample(image, xy):
    x,y = xy.T
    i = np.clip(np.floor(x).astype(int),0,image.shape[1]-2)
    j = np.clip(np.floor(y).astype(int),0,image.shape[0]-2)
    u,v = (x-i).clip(0,1)[:,None], (y-j).clip(0,1)[:,None]
    return (1-v)*((1-u)*image[j,i]+u*image[j,i+1])+v*((1-u)*image[j+1,i]+u*image[j+1,i+1])
def fit_layer(object_,part):
    mesh=object_.data
    posed=object_.evaluated_get(dg)
    position = np.array([v.co[:] for v in posed.data.vertices])
    projection = cam.calc_matrix_camera(dg, x=640, y=704) @ cam.matrix_world.inverted() @ posed.matrix_world
    clip = np.column_stack((position, np.ones(len(position)))) @ np.array(projection).T
    screen = (clip[:, :2] / clip[:, 3, None] * [1, -1] + 1) * [320, 352]
    
    node=object_.data.materials[0].node_tree.nodes['DiffuseTexture']
    base=node.image
    atlas=pixels(base)
    h,w=atlas.shape[:2]
    mesh.calc_loop_triangles()
    uvs = np.array([u.uv[:] for u in mesh.uv_layers.active.data])*[w,h]
    rest = np.array([v.co[:] for v in mesh.vertices])
    painted = 0
    for tri in mesh.loop_triangles:
        ids = list(tri.vertices)
        verts = rest[ids]
        if verts[:,2].max()<1.486 or verts[:,2].min()>1.703 or verts[:,1].min()>-.058:
            continue
        uv = uvs[list(tri.loops)]
        lo = np.maximum(np.floor(uv.min(0)).astype(int),0)
        hi = np.minimum(np.ceil(uv.max(0)).astype(int),[w-1,h-1])
        mat = (uv[1:]-uv[0]).T
        if abs(np.linalg.det(mat))<1e-6 or np.any(hi<lo): continue
        y,x = np.mgrid[lo[1]:hi[1]+1,lo[0]:hi[0]+1]
        st = (np.column_stack((x.ravel(),y.ravel()))+.5-uv[0]) @ np.linalg.inv(mat).T
        inside = (st.min(1)>=0)&(st.sum(1)<=1)
        if not inside.any(): continue
        st=st[inside]; x=x.ravel()[inside]; y=y.ravel()[inside]
        loc=verts[0]+st@(verts[1:]-verts[0])
        pt=screen[ids][0]+st@(screen[ids][1:]-screen[ids][0])
        radius=((pt-[320,255])/[95,131])**2
        mix=np.clip((1-radius.sum(1))*5,0,1)*np.clip((-loc[:,1]-.056)/.042,0,1)
        if mix.max()==0: continue
        source=sample(photo_rgb,sample(warp,pt-[195,100]))
        # Remove the amber cast from the photo; the reception supplies its own light.
        colour=np.clip(source*[1.11,1.04,1.02],0,1)
        alpha=.92*mix[:,None]
        atlas[y,x,:3]=atlas[y,x,:3]*(1-alpha)+colour*alpha
        painted+=int((mix>.1).sum())
    assert painted>800, (part,painted)
    folder=root.parent/'build-record/tests/face-sound-23'
    folder.mkdir(exist_ok=True)
    out=base.copy()
    out.name='Receptionist fitted '+part
    out.pixels.foreach_set(atlas.ravel());out.update()
    out.filepath_raw=str(folder/('fitted-'+part+'.png'));out.file_format='PNG';out.save();out.pack()
    for n in object_.data.materials[0].node_tree.nodes:
        if n.type=='TEX_IMAGE' and n.image==base:n.image=out
    print(part,'fitted texels',painted)

fit_layer(body,'skin')
# Keep the moving optical surfaces and tooth enamel in their native UV layouts.
eyes=bpy.data.objects['Receptionist high-poly'].data.materials[0]
eye_tex=eyes.node_tree.nodes['DiffuseTexture'].image
rgb=pixels(eye_tex)
r,g,b=rgb[:,:,:3].transpose(2,0,1)
iris=np.clip((r-b-.012)*14,0,1)*np.clip((.45-g)*7,0,1)
rgb[:,:,:3]*=1-.52*iris[:,:,None]
folder=root.parent/'build-record/tests/face-sound-23'
dark=eye_tex.copy();dark.name='Deep brown iris'
dark.pixels.foreach_set(rgb.ravel());dark.update()
dark.filepath_raw=str(folder/'iris.png');dark.file_format='PNG';dark.save();dark.pack()
for n in eyes.node_tree.nodes:
    if n.type=='TEX_IMAGE' and n.image==eye_tex:n.image=dark

bpy.data.images.remove(photo)
bpy.data.objects.remove(cam,do_unlink=True)
holder=bpy.data.objects['Receptionist']
bpy.ops.object.select_all(action='DESELECT')
for obj in [holder]+list(holder.children_recursive):obj.select_set(True)
bpy.context.view_layer.objects.active=holder
bpy.ops.export_scene.gltf(filepath=str(root/'assets/receptionist-v23.glb'),export_format='GLB',
    use_selection=True,export_apply=False,export_animations=True,export_animation_mode='NLA_TRACKS',
    export_nla_strips=True,export_force_sampling=True,export_anim_single_armature=False,
    export_morph=False,export_skins=True,export_materials='EXPORT',export_image_format='WEBP',export_image_quality=92)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(root/'assets/receptionist-v23.blend'))


