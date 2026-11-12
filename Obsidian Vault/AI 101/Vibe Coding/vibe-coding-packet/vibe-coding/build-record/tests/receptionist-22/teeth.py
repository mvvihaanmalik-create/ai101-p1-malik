import bpy,bmesh
o=bpy.data.objects['Receptionist teeth_base'];bm=bmesh.new();bm.from_mesh(o.data);left=set(bm.verts)
while left:
 v=left.pop();stack=[v];component=[v]
 while stack:
  v=stack.pop()
  for e in v.link_edges:
   w=e.other_vert(v)
   if w in left:left.remove(w);stack.append(w);component.append(w)
 if len(component)>10:print('island',len(component),[(round(min(v.co[i] for v in component),3),round(max(v.co[i] for v in component),3)) for i in range(3)])
