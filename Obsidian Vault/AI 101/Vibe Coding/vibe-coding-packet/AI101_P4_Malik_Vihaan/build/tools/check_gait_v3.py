"""Measure stance-foot drift in authored clips, independent of browser scheduling."""
import bpy,json,math
from pathlib import Path
root=Path(__file__).resolve().parents[1];bpy.ops.wm.open_mainfile(filepath=str(root/'assets/characters-v3.blend'))
results={}
for name,frames,cycle in [('Guest',30,.62/.60*1.04),('Butler',54,.40/.60*1.07)]:
    rig=bpy.data.objects[name+'Rig'];rig.animation_data.action=bpy.data.actions[name+'_Walk']
    for track in rig.animation_data.nla_tracks:track.mute=True
    samples=[]
    for f in range(1,round(frames*.60)):
        bpy.context.scene.frame_set(f+1);bpy.context.view_layer.update();foot=rig.matrix_world@rig.pose.bones['foot_l'].head
        samples.append((foot.y+f/frames*cycle,foot.z))
    drift=max(p[0] for p in samples)-min(p[0] for p in samples);height=max(p[1] for p in samples)-min(p[1] for p in samples)
    results[name]={'stanceAnkleDriftMetres':round(drift,5),'stanceAnkleHeightVariationMetres':round(height,5),'cycleMetres':cycle,'samples':len(samples)}
path=root.parent/'build-record/tests/visual-prototype-03/01-gait.json';path.write_text(json.dumps(results,indent=2));print(json.dumps(results),flush=True)
