"""Fix export material compatibility and maintain cloth across articulated joints."""
import bpy, math
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'assets'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'room-zero.blend'))
for name,color in [('Guest charcoal wool',(.055,.061,.065)),('Butler midnight barathea',(.025,.031,.038))]:
    m=bpy.data.materials[name];p=m.node_tree.nodes.get('Principled BSDF')
    for link in list(m.node_tree.links):
        if link.to_node==p:m.node_tree.links.remove(link)
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=.82
for name in ['Guest','Butler']:
    root=bpy.data.objects[name];objects=[root]+list(root.children_recursive)
    for o in objects:
        if o.type=='MESH':
            for m in list(o.modifiers):
                if m.type=='SUBSURF':o.modifiers.remove(m)
            # Flat end caps must not pull the side normals upwards at wrists/knees.
            for face in o.data.polygons:
                if len(face.vertices)>4:face.use_smooth=False
            if any(t in o.name for t in ['Sleeve','Trouser','Jacket']):
                if not o.get('supported_cloth'):
                    # Close support loops preserve joint overlap while subdivision
                    # softens the shoulder/waist silhouette instead of shortening limbs.
                    seg=32;raw=[v.co.copy() for v in o.data.vertices]
                    rings=[raw[i:i+seg] for i in range(0,len(raw),seg)]
                    supportA=[a.lerp(b,.035) for a,b in zip(rings[0],rings[1])]
                    supportB=[a.lerp(b,.965) for a,b in zip(rings[-2],rings[-1])]
                    rings=[rings[0],supportA]+rings[1:-1]+[supportB,rings[-1]]
                    verts=[tuple(v) for ring in rings for v in ring];faces=[]
                    for j in range(len(rings)-1):
                        for i in range(seg):faces.append((j*seg+i,j*seg+(i+1)%seg,(j+1)*seg+(i+1)%seg,(j+1)*seg+i))
                    faces.extend([tuple(reversed(range(seg))),tuple((len(rings)-1)*seg+i for i in range(seg))])
                    old=o.data;mats=list(old.materials);mesh=bpy.data.meshes.new(o.name+' supported cloth');mesh.from_pydata(verts,[],faces);mesh.update();o.data=mesh
                    for m in mats:mesh.materials.append(m)
                    for f in mesh.polygons:f.use_smooth=True
                    o['supported_cloth']=True
                if o.modifiers.get('Cloth edge'):o.modifiers.remove(o.modifiers['Cloth edge'])
                smooth=o.modifiers.new('Tailoring smooth','SUBSURF');smooth.levels=2
                if not o.data.uv_layers:o.data.uv_layers.new()
                for poly in o.data.polygons:
                    for li in poly.loop_indices:
                        co=o.data.vertices[o.data.loops[li].vertex_index].co
                        o.data.uv_layers.active.data[li].uv=(math.atan2(co.y,co.x)/math.tau+.5,co.z*2)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=str(OUT/(name.lower()+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
# Preserve the source model corrections without changing any lighting/cameras.
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'room-zero.blend'))
print('CHARACTER CORRECTIONS COMPLETE')
