import bpy,sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
p=Path(__file__).resolve().parent
scene=bpy.context.scene;scene.frame_set(1)
camera=bpy.data.cameras.new('lens');obj=bpy.data.objects.new('lens',camera);scene.collection.objects.link(obj)
obj.location=(.003,1.34,1.634);obj.rotation_euler=(Vector((0,.025,1.573))-obj.location).to_track_quat('-Z','Y').to_euler();camera.lens=77;scene.camera=obj
scene.render.resolution_x=640;scene.render.resolution_y=704;scene.render.resolution_percentage=100;bpy.context.view_layer.update()
for n in ['Receptionist skin','Receptionist teeth_base','Receptionist high-poly','Receptionist eyebrow001']:
 o=bpy.data.objects[n];ev=o.evaluated_get(bpy.context.evaluated_depsgraph_get());regions=[(320,379),(285,321),(320,317),(320,335),(320,325),(320,292),(309,294),(280,246),(360,246),(239,280),(258,229),(391,229),(244,278),(401,278),(395,292),(357,321),(350,327)]
 for x,y in regions:
  pts=[]
  for i,v in enumerate(ev.data.vertices):
   w=ev.matrix_world@v.co;q=world_to_camera_view(scene,obj,w);sx=q.x*640;sy=704*(1-q.y)
   if abs(sx-x)<5 and abs(sy-y)<5:pts.append(((sx-x)**2+(sy-y)**2,i,w.y,sx,sy))
  if pts:
   _,i,wy,sx,sy=min(pts)
   print(n,x,y,tuple(round(a,4) for a in o.data.vertices[i].co),round(wy,4))
