"""Detailed CC0 MakeHuman characters, fitted clothing, weighted rigs and clips."""
import bpy,sys,math,json,bmesh
from pathlib import Path
from mathutils import Vector,Matrix,Quaternion
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'tools'))
from mpfb_bootstrap import HumanService,HumanObjectProperties,TargetService,ExportService,LocationService
DATA=ROOT/'tools/vendor/makehuman-data';OUT=ROOT/'assets';OUT.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.fps=30

def material(name,color,rough=.6,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
gold=material('Antique brass v2',(.35,.22,.07),.31,.75)
gloves=material('Butler ivory gloves',(.52,.49,.40),.85)
def fit_asset(body,sub,name,kind):
    return HumanService.add_mhclo_asset(str(DATA/sub/name/(name+'.mhclo')),body,asset_type=kind,subdiv_levels=1,material_type='GAMEENGINE')
def aim(rig,name,direction):
    pb=rig.pose.bones[name];rest=pb.bone.matrix_local.to_quaternion();restDir=pb.bone.tail_local-pb.bone.head_local
    desired=restDir.rotation_difference(Vector(direction).normalized())@rest
    pb.matrix=Matrix.LocRotScale(pb.head,desired,Vector((1,1,1)))
    bpy.context.view_layer.update()
def pose(rig,phase=0,walking=False,butler=False,raise_arm=False):
    for p in rig.pose.bones:p.rotation_mode='QUATERNION';p.rotation_quaternion=Quaternion();p.location=(0,0,0)
    bpy.context.view_layer.update()
    # Restrained chest breathing and an unsettling, sustained head inclination.
    rig.pose.bones['spine_03'].rotation_quaternion=Quaternion((1,0,0),.018 if butler else .006)
    rig.pose.bones['head'].rotation_quaternion=Quaternion((0,0,1),.14 if butler else -.015)@Quaternion((1,0,0),-.055 if butler else .015)
    bpy.context.view_layer.update()
    for side,sgn in [('l',1),('r',-1)]:
        arm=rig.pose.bones['upperarm_'+side];fore=rig.pose.bones['lowerarm_'+side]
        swing=math.sin(phase+(0 if side=='l' else math.pi))*(.10 if butler else .19) if walking else 0
        aim(rig,arm.name,(sgn*.035,swing,-.30))
        aim(rig,fore.name,(sgn*.015,-.035+swing*.8,-.27))
        if butler and side=='r':
            aim(rig,arm.name,(sgn*.04,-.02,-.29));aim(rig,fore.name,(sgn*.025,-.25,-.09))
        if raise_arm and side=='r':
            aim(rig,arm.name,(sgn*.07,-.24,-.07));aim(rig,fore.name,(sgn*.015,-.18,.15))
        # Keep wrists continuous with the forearm; slightly curled fingers.
        for p in rig.pose.bones:
            if p.name.endswith('_'+side) and any(p.name.startswith(t) for t in ['index','middle','ring','pinky','thumb']):
                p.rotation_quaternion=Quaternion((1,0,0),.12 if not butler else .20)
    for side,sgn in [('l',1),('r',-1)]:
        thigh=rig.pose.bones['thigh_'+side];calf=rig.pose.bones['calf_'+side]
        hip=thigh.head.copy();u=thigh.bone.length;l=calf.bone.length
        q=((phase/(2*math.pi))+(0 if side=='l' else .5))%1
        stride=.48 if butler else .60
        if walking:
            if q<.5:y=-stride*.5+q*2*stride;lift=0
            else:t=(q-.5)*2;y=stride*.5-stride*(t*t*(3-2*t));lift=.075*math.sin(math.pi*t)
        else:y=-.01;lift=0
        ankle=Vector((sgn*.11,y,.075+lift));d=ankle-hip;dist=min(d.length,u+l-.004);axis=d.normalized();a=(u*u-l*l+dist*dist)/(2*dist);h=math.sqrt(max(0,u*u-a*a));bend=Vector((0,-1,0));bend=(bend-axis*bend.dot(axis)).normalized();knee=hip+axis*a+bend*h
        aim(rig,thigh.name,knee-hip);aim(rig,calf.name,ankle-knee)
        aim(rig,'foot_'+side,(0,-.13,-.055));aim(rig,'ball_'+side,(0,-.07,.002))
    bpy.context.view_layer.update()

def add_button(rig,pos):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=1,location=pos);o=bpy.context.object;o.name='Butler brass button';o.scale=(.009,.005,.009);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(bpy.data.materials.get('Antique brass v2') or material('Antique brass v2',(.35,.22,.07),.31,.75))
    # Weighted accessory follows chest deformation without a detached rigid parent.
    o.parent=rig;g=o.vertex_groups.new(name='spine_03');g.add(list(range(len(o.data.vertices))),1,'REPLACE');mod=o.modifiers.new('Armature','ARMATURE');mod.object=rig

def make_character(name,old):
    before=set(scene.objects)
    body=HumanService.create_human(scale=.1,feet_on_ground=True)
    body.name=name+' skin'
    props={'gender':1.,'age':.98 if old else .52,'muscle':.30 if old else .52,'weight':.28 if old else .46,'height':.61 if old else .55,'caucasian':1.,'african':0.,'asian':0.}
    for k,val in props.items():HumanObjectProperties.set_value(k,val,entity_reference=body)
    TargetService.reapply_macro_details(body)
    if old:
        for target,amount in [('head/head-scale-vert-incr.target.gz',.34),('chin/chin-width-decr.target.gz',.4),('nose/nose-volume-incr.target.gz',.22),('cheek/l-cheek-volume-decr.target.gz',.85),('cheek/r-cheek-volume-decr.target.gz',.85),('cheek/l-cheek-bones-incr.target.gz',.45),('cheek/r-cheek-bones-incr.target.gz',.45),('eyes/l-eye-bag-incr.target.gz',.75),('eyes/r-eye-bag-incr.target.gz',.75),('mouth/mouth-laugh-lines-in.target.gz',.5),('mouth/mouth-angles-up.target.gz',.18),('neck/neck-scale-vert-incr.target.gz',.12)]:
            path=Path(LocationService.get_mpfb_data('targets'))/target
            if path.exists():TargetService.load_target(body,str(path),weight=amount)
    skin='old_caucasian_male' if old else 'middleage_caucasian_male'
    HumanService.set_character_skin(str(DATA/'skins'/skin/(skin+'.mhmat')),body,skin_type='GAMEENGINE')
    rig=HumanService.add_builtin_rig(body,'game_engine');rig.name=name+'Rig'
    for sub,asset,kind in [('eyes','high-poly','Eyes'),('eyebrows','eyebrow001','Eyebrows'),('eyelashes','eyelashes01','Eyelashes'),('teeth','teeth_base','Teeth'),('tongue','tongue01','Tongue'),('clothes','male_elegantsuit01','Clothes'),('clothes','shoes03','Clothes'),('hair','short04' if old else 'short01','Hair')]:
        o=fit_asset(body,sub,asset,kind);o.name=name+' '+asset
        if old and kind=='Hair':o['recede']=True
    # Apply body visibility masks and subdivision while retaining the armature.
    ExportService.bake_modifiers_remove_helpers(body,bake_masks=True,bake_subdiv=True,remove_helpers=True,also_proxy=False)
    for o in list(rig.children_recursive):
        if o.type!='MESH':continue
        if o.data.shape_keys:
            bpy.context.view_layer.objects.active=o;bpy.ops.object.shape_key_remove(all=True,apply_mix=True)
        for mod in list(o.modifiers):
            if mod.type in ['SUBSURF','MASK']:
                bpy.context.view_layer.objects.active=o
                if mod.type=='SUBSURF':mod.levels=1
                try:bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception as e:print('Modifier skip',o.name,str(e))
        for p in o.data.polygons:p.use_smooth=True
        if o.get('recede'):
            bm=bmesh.new();bm.from_mesh(o.data);zmin=min(v.co.z for v in bm.verts);zmax=max(v.co.z for v in bm.verts)
            remove=[f for f in bm.faces if all(v.co.z>zmin+(zmax-zmin)*.54 and v.co.y<.045 and abs(v.co.x)<.085 for v in f.verts)]
            bmesh.ops.delete(bm,geom=remove,context='FACES');bm.to_mesh(o.data);bm.free()
            for m in o.data.materials:
                p=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
                if p:
                    for link in list(m.node_tree.links):
                        if link.to_socket==p.inputs['Base Color']:m.node_tree.links.remove(link)
                    p.inputs['Base Color'].default_value=(.24,.25,.235,1)
        for mat in o.data.materials:
            if not mat or not mat.use_nodes:continue
            bsdf=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
            if bsdf:
                bsdf.inputs['Roughness'].default_value=.78 if 'suit' in o.name else (.62 if o==body else .46)
                if 'Hair' in o.name or 'short0' in o.name:bsdf.inputs['Roughness'].default_value=.83
    if old:
        # Assign glove fabric to hand/finger polygons using the real skin weights.
        glove_material=material('Butler ivory gloves',(.52,.49,.40),.85)
        idx=len(body.data.materials);body.data.materials.append(glove_material)
        groups={g.index:g.name for g in body.vertex_groups}
        for face in body.data.polygons:
            values=[]
            for vi in face.vertices:
                values.append(sum(g.weight for g in body.data.vertices[vi].groups if groups.get(g.group,'').startswith(('hand_','thumb_','index_','middle_','ring_','pinky_'))))
            if min(values)>.6:face.material_index=idx
        suit=next(o for o in rig.children if 'male_elegantsuit01' in o.name)
        for z in [1.15,1.26,1.37]:
            for x in [-.066,.066]:
                nearby=[v.co.y for v in suit.data.vertices if abs(v.co.z-z)<.035 and abs(v.co.x-x)<.035]
                if nearby:add_button(rig,(x,min(nearby)-.008,z))
    # Preserve editable rig and generate named, skinned animation clips.
    armature_mods=[m for o in rig.children_recursive if o.type=='MESH' for m in o.modifiers if m.type=='ARMATURE']
    for m in armature_mods:m.show_viewport=False
    actions=[]
    for kind,count in [('Idle',60),('Walk',54 if old else 30),('Raise',24)]:
        action=bpy.data.actions.new(name+'_'+kind);rig.animation_data_create();rig.animation_data.action=action
        for f in range(count+1):
            scene.frame_set(f+1);pose(rig,math.tau*f/count,kind=='Walk',old,kind=='Raise')
            for p in rig.pose.bones:
                p.keyframe_insert('rotation_quaternion',frame=f+1,group=p.name)
                if p.name=='pelvis':p.keyframe_insert('location',frame=f+1,group=p.name)
        for curve in action.fcurves:
            for kp in curve.keyframe_points:kp.interpolation='LINEAR'
        actions.append(action);rig.animation_data.action=None
        track=rig.animation_data.nla_tracks.new();track.name=kind;track.strips.new(kind,1,action);track.mute=True
    for m in armature_mods:m.show_viewport=True
    rig.animation_data.action=actions[0];scene.frame_set(1)
    # MakeHuman faces -Y; the hotel actors face +Y before glTF's axis conversion.
    holder=bpy.data.objects.new(name,None);scene.collection.objects.link(holder);rig.parent=holder;holder.rotation_euler.z=math.pi
    # Fit to actual standing height rather than adding scale inside an armature.
    holder.scale=(1.04,1.04,1.04) if not old else (1.07,1.07,1.07)
    objects=[holder]+list(holder.children_recursive)
    for image in bpy.data.images:
        if image.source=='FILE' and max(image.size)>2048:
            factor=2048/max(image.size);image.scale(round(image.size[0]*factor),round(image.size[1]*factor));image.pack()
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=holder
    bpy.ops.export_scene.gltf(filepath=str(OUT/(name.lower()+'-v2.glb')),export_format='GLB',use_selection=True,export_apply=False,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_force_sampling=True,export_anim_single_armature=False,export_morph=False,export_skins=True,export_all_influences=False,export_materials='EXPORT',export_image_format='WEBP',export_image_quality=90)
    rig.animation_data.action=actions[0];scene.frame_set(1)
    print('CHARACTER',name,'bones',len(rig.data.bones),'meshes',len([o for o in objects if o.type=='MESH']))
    return holder,rig

guest,guestRig=make_character('Guest',False)
guest.location.x=-1
butler,butlerRig=make_character('Butler',True)
butler.location.x=1
# Pack images into a separate editable character source, preserving the v1 hotel.
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'characters-v2.blend'))
summary={'generator':'MakeHuman MPFB 2.0.18','license':'CC0 assets; GPL-3.0 tooling retained in tools/vendor/mpfb2','characters':['guest-v2.glb','butler-v2.glb'],'clips':['Idle','Walk','Raise']}
(OUT/'characters-v2.json').write_text(json.dumps(summary,indent=2))
print('CHARACTERS V2 COMPLETE')
