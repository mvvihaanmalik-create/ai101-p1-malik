import bpy,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'assets/characters-v3.blend'))
rig=bpy.data.objects['GuestRig']; holder=bpy.data.objects['Guest']
print('RIG',rig.location[:],rig.scale[:],holder.location[:],holder.scale[:],holder.rotation_euler[:])
print(json.dumps({n:{'head':list(rig.data.bones[n].head_local),'tail':list(rig.data.bones[n].tail_local),'length':rig.data.bones[n].length} for n in ['pelvis','thigh_l','calf_l','foot_l','ball_l','spine_03','upperarm_l'] if n in rig.data.bones},indent=2))
