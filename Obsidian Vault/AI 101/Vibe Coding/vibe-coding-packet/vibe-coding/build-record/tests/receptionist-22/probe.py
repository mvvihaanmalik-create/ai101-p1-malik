import bpy
from pathlib import Path
p=Path(bpy.data.filepath)
for name in ['Receptionist long01','Receptionist skin','Receptionist teeth_base','Receptionist high-poly']:
 o=bpy.data.objects[name];print('OBJECT',name,len(o.data.vertices),'offset',o.matrix_local.translation[:]);m=o.data.materials[0]
 print('MATERIAL',[(n.type,n.image.name if n.type=='TEX_IMAGE' and n.image else n.name) for n in m.node_tree.nodes],[(l.from_node.name,l.from_socket.name,l.to_node.name,l.to_socket.name) for l in m.node_tree.links])
 if 'long01' in name:
  import numpy as np
  a=np.array([v.co[:] for v in o.data.vertices])
  for z in [1.0,1.15,1.32,1.45,1.52,1.58,1.64,1.69,1.71]:
   sec=a[abs(a[:,2]-z)<.018]
   if len(sec): print('SLICE',z,np.round(sec.min(axis=0),3),np.round(sec.max(axis=0),3))
 if 'teeth' in name:print('GROUPS',[(g.name,g.index) for g in o.vertex_groups][:55])
