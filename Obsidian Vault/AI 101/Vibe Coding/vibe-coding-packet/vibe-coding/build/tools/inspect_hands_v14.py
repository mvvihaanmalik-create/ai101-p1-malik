import bpy,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'assets/staff-v5.blend'))
rig=bpy.data.objects['PorterRig']
bpy.context.scene.frame_set(1)
report={b.name:{'head':list(b.head_local),'tail':list(b.tail_local),'matrix':[list(row) for row in b.matrix_local],'pose':list(rig.pose.bones[b.name].rotation_quaternion)} for b in rig.data.bones if any(x in b.name for x in ('hand','arm','index','middle','thumb'))}
(root.parent/'build-record/tests/repairs-14/hand-rig.json').write_text(json.dumps(report,indent=2))
print('HAND RIG SAVED')
