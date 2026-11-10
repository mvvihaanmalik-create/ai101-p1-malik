"""Refit only the guest's locomotion. Preserve the existing mesh, textures and rig."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector,Matrix,Quaternion
root=Path(__file__).resolve().parents[1];out=root/'assets';record=root.parent/'build-record/tests/ui-gait-08'
bpy.ops.wm.open_mainfile(filepath=str(out/'characters-v3.blend'))
scene=bpy.context.scene;scene.render.fps=30
rig=bpy.data.objects['GuestRig'];holder=bpy.data.objects['Guest'];holder.location=(0,0,0)
for tr in list(rig.animation_data.nla_tracks):rig.animation_data.nla_tracks.remove(tr)
rig.animation_data.action=None
mods=[m for o in rig.children_recursive if o.type=='MESH' for m in o.modifiers if m.type=='ARMATURE']
for m in mods:m.show_viewport=False

def aim(name,direction):
 p=rig.pose.bones[name];rest=p.bone.matrix_local.to_quaternion();axis=p.bone.tail_local-p.bone.head_local
 p.matrix=Matrix.LocRotScale(p.head,axis.rotation_difference(Vector(direction).normalized())@rest,Vector((1,1,1)));bpy.context.view_layer.update()

def pose(phase,kind):
 for p in rig.pose.bones:p.rotation_mode='QUATERNION';p.rotation_quaternion=Quaternion();p.location=(0,0,0)
 walking=kind not in ['Idle','Raise'];sideways=kind.startswith('Step');back=kind=='WalkBack'
 stride=.30 if sideways else .44 if back else .60
 direction=Vector((-1,0,0) if kind=='StepRight' else (1,0,0) if kind=='StepLeft' else (0,1,0) if back else (0,-1,0))
 q0=phase/math.tau;double=.5+.5*math.cos(phase*2-.2*math.pi)
 bpy.context.view_layer.update();pelvis=rig.pose.bones['pelvis'];matrix=pelvis.matrix.copy()
 drop=(.022+.012*double if sideways else .018+.038*double if not back else .02+.021*double) if walking else .022
 matrix.translation+=Vector((.006*math.sin(phase) if walking else 0,0,-drop));pelvis.matrix=matrix;bpy.context.view_layer.update()
 rig.pose.bones['spine_03'].rotation_quaternion=Quaternion((1,0,0),.018)@Quaternion((0,0,1),.012*math.sin(phase) if walking else .003*math.sin(phase))
 rig.pose.bones['head'].rotation_quaternion=Quaternion((1,0,0),.018);bpy.context.view_layer.update()
 for side,sgn in [('l',1),('r',-1)]:
  swing=(.035 if sideways else .075)*math.cos(phase+(0 if side=='l' else math.pi)) if walking else 0
  if back:swing*=-.65
  aim('upperarm_'+side,(sgn*.025,swing,-.30));aim('lowerarm_'+side,(sgn*.012,-.045+swing*.6,-.27))
  if kind=='Raise' and side=='r':aim('upperarm_'+side,(sgn*.06,-.24,-.07));aim('lowerarm_'+side,(sgn*.015,-.18,.15))
  for p in rig.pose.bones:
   if p.name.endswith('_'+side) and p.name.startswith(('index','middle','ring','pinky','thumb')):p.rotation_quaternion=Quaternion((1,0,0),.12)
 for side,sgn in [('l',1),('r',-1)]:
  thigh=rig.pose.bones['thigh_'+side];calf=rig.pose.bones['calf_'+side];hip=thigh.head.copy();u=thigh.bone.length;l=calf.bone.length
  q=(q0+(0 if side=='l' else .5))%1;ankle=calf.bone.tail_local.copy();ankle.x=sgn*(.17 if sideways else .115);roll=0
  if walking:
   if q<.60:
    travel=-stride*.5+q/.60*stride
    roll=(.07*max(0,1-q/.09)-.11*max(0,(q-.50)/.10))*(.4 if sideways else -.5 if back else 1)
   else:
    t=(q-.60)/.40;travel=stride*.5-stride*(t*t*(3-2*t));ankle.z+=(.025 if sideways or back else .04)*math.sin(math.pi*t)**2
    roll=-.05*math.sin(math.pi*t)
   ankle-=direction*travel
  d=ankle-hip;dist=min(d.length,u+l-.001);axis=d.normalized();a=(u*u-l*l+dist*dist)/(2*dist);h=math.sqrt(max(0,u*u-a*a));bend=Vector((0,-1,0));bend=(bend-axis*bend.dot(axis)).normalized();knee=hip+axis*a+bend*h
  aim(thigh.name,knee-hip);aim(calf.name,ankle-knee)
  foot=rig.pose.bones['foot_'+side].bone;aim(foot.name,Quaternion((1,0,0),roll)@(foot.tail_local-foot.head_local))
 bpy.context.view_layer.update()

clips={};metrics={}
for kind,count in [('Idle',60),('Walk',36),('WalkBack',36),('StepLeft',36),('StepRight',36),('Raise',24)]:
 action=bpy.data.actions.new('Guest_v8_'+kind);rig.animation_data.action=action
 for f in range(count+1):
  scene.frame_set(f+1);pose(math.tau*f/count,kind)
  for p in rig.pose.bones:
   p.keyframe_insert('rotation_quaternion',frame=f+1,group=p.name)
   if p.name=='pelvis':p.keyframe_insert('location',frame=f+1,group=p.name)
 for curve in action.fcurves:
  for kp in curve.keyframe_points:kp.interpolation='LINEAR'
 clips[kind]=action;rig.animation_data.action=None
 track=rig.animation_data.nla_tracks.new();track.name=kind;track.strips.new(kind,1,action);track.mute=True
for m in mods:m.show_viewport=True
rig.animation_data.action=clips['Idle'];scene.frame_set(1)
objects=[holder]+[o for o in holder.children_recursive if not any(k in o.name for k in ['teeth_base','tongue01'])]
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=holder
bpy.ops.export_scene.gltf(filepath=str(out/'guest-v8.glb'),export_format='GLB',use_selection=True,export_apply=False,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_force_sampling=True,export_anim_single_armature=False,export_morph=False,export_skins=True,export_all_influences=False,export_materials='EXPORT',export_image_format='WEBP',export_image_quality=90)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'guest-locomotion-v8.blend'))
# World-space ankle drift during stance with matched root translation; export baked poses separately.
for kind,cycle,direction in [('Walk',1.04,Vector((0,1,0))),('WalkBack',.44/.60*1.04,Vector((0,-1,0))),('StepLeft',.52,Vector((-1,0,0))),('StepRight',.52,Vector((1,0,0)))]:
 rig.animation_data.action=clips[kind];samples=[]
 for f in range(2,21):
  scene.frame_set(f);bpy.context.view_layer.update();q=(f-1)/36
  foot=rig.matrix_world@rig.pose.bones['foot_l'].head+direction*q*cycle;samples.append(list(foot))
 ranges=[max(p[i] for p in samples)-min(p[i] for p in samples) for i in range(3)]
 metrics[kind]={'stanceWorldAnkleRangeMetres':ranges,'cycleMetres':cycle,'samples':len(samples)}
(record/'authored-gait.json').write_text(json.dumps(metrics,indent=2))
print('GUEST V8 COMPLETE',json.dumps(metrics),flush=True)
