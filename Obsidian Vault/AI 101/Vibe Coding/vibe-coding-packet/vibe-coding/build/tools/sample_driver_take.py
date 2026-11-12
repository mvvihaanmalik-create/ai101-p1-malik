"""Sample the MIT Rocketbox chair-left performance in metre-scale, Y-up coordinates."""
import json
from pathlib import Path
import bpy
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(root.parent/'sources/assets/rocketbox/m_sit_stand_up_chair_left.max.fbx'),use_image_search=False)
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
scene=bpy.context.scene
joint_names=['Pelvis','Spine2','Neck','Head','MNose']+[s+' '+j for s in ['L','R'] for j in ['Thigh','Calf','Foot','Toe0','UpperArm','Forearm','Hand','Finger2']]
first,last=map(int,rig.animation_data.action.frame_range)
frames=[]
for frame in range(first,last+1):
    scene.frame_set(frame)
    values=[]
    for name in joint_names:
        p=rig.matrix_world @ rig.pose.bones['Bip01 '+name].head
        values.append([round(p.x,5),round(p.z,5),round(-p.y,5)])
    frames.append(values)
out=root/'assets/driver-exit-v28.json'
out.write_text(json.dumps(dict(fps=scene.render.fps,names=joint_names,frames=frames),separators=(',',':')))
for i in range(0,len(frames),8): print(i,dict(zip(joint_names[:2]+['L Foot','R Foot'],[frames[i][j] for j in [0,1,7,15]])))
