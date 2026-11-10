"""Refine the proven v2 MakeHuman factory; retain v2 assets for comparison."""
from pathlib import Path
source=Path(__file__).with_name('build_characters_v2.py').read_text()
source=source[:source.index("guest,guestRig=make_character")]
source=source.replace("subdiv_levels=1","subdiv_levels=0").replace("mod.levels=1","mod.levels=0")
source=source.replace("'-v2.glb'","'-v3.glb'")
source=source.replace("('head/head-scale-vert-incr.target.gz',.34)","('eyes/l-eye-height2-incr.target.gz',.75),('eyes/r-eye-height2-incr.target.gz',.65),('eyes/l-eye-scale-incr.target.gz',.18),('eyes/r-eye-scale-incr.target.gz',.18),('head/head-scale-vert-incr.target.gz',.48)")
source=source.replace("'weight':.28 if old","'weight':.19 if old").replace(".85),('cheek/r-cheek-volume-decr.target.gz',.85)","1.0),('cheek/r-cheek-volume-decr.target.gz',1.0)")
source=source.replace("('neck/neck-scale-vert-incr.target.gz',.12)","('neck/neck-scale-vert-incr.target.gz',.32)")
source=source.replace("for z in [1.15,1.26,1.37]:","dress_butler(rig,body,suit)\n        for z in [1.13,1.24,1.35,1.46]:").replace("for x in [-.066,.066]:","for x in [0.0]:")
# Keep the face/body topology. Hair, clothes, eyes and shoes use their smooth base meshes.
source=source.replace("objects=[holder]+list(holder.children_recursive)","objects=[holder]+[o for o in holder.children_recursive if not any(k in o.name for k in ['teeth_base','tongue01'])]")
exec(compile(source,str(Path(__file__).with_name('build_characters_v2.py')),'exec'))

def dress_butler(rig,body,suit):
    uniform=suit.data.materials[0].copy();uniform.name='Butler ink-black service uniform'
    p=next(n for n in uniform.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    for link in list(uniform.node_tree.links):
        if link.to_socket==p.inputs['Base Color']:uniform.node_tree.links.remove(link)
    p.inputs['Base Color'].default_value=(.012,.018,.022,1);p.inputs['Roughness'].default_value=.84
    # Unify the lapel, shirt and tie surfaces into the black formal service coat.
    suit.data.materials.clear();suit.data.materials.append(uniform)
    for face in suit.data.polygons:face.material_index=0
    # Sharpen the skull and cheek silhouette while keeping the fitted face parts aligned.
    for o in [body]+[o for o in rig.children_recursive if o.type=='MESH' and any(k in o.name for k in ['short04','eyebrow','eyelash','high-poly'])]:
        for v in o.data.vertices:
            if v.co.z>1.56:
                blend=min(1,(v.co.z-1.56)/.09);v.co.x*=1-.10*blend
    # A narrow rounded collar follows the fitted neck, without the previous broad bib.
    neck=[v.co for v in body.data.vertices if 1.47<v.co.z<1.56 and abs(v.co.x)<.11]
    z=1.54;cy=.015
    if neck:cy=sum(v.y for v in neck)/len(neck)
    verts=[];faces=[];count=48
    for zz,rx,ry in [(z,.062,.057),(z+.035,.059,.055)]:
        for i in range(count):
            a=math.tau*i/count;verts.append((rx*math.cos(a),cy+ry*math.sin(a),zz))
    for i in range(count):faces.append((i,(i+1)%count,(i+1)%count+count,i+count))
    mesh=bpy.data.meshes.new('Service collar');mesh.from_pydata(verts,[],faces);mesh.materials.append(uniform)
    collar=bpy.data.objects.new('Butler standing collar',mesh);scene.collection.objects.link(collar);collar.parent=rig
    group=collar.vertex_groups.new(name='neck_01');group.add(list(range(len(verts))),1,'REPLACE')
    mod=collar.modifiers.new('Armature','ARMATURE');mod.object=rig
    for p in mesh.polygons:p.use_smooth=True

def pose(rig,phase=0,walking=False,butler=False,raise_arm=False):
    for p in rig.pose.bones:p.rotation_mode='QUATERNION';p.rotation_quaternion=Quaternion();p.location=(0,0,0)
    pelvis=rig.pose.bones['pelvis']
    bpy.context.view_layer.update()
    if walking:
        matrix=pelvis.matrix.copy();matrix.translation+=Vector(((.006 if butler else .012)*math.sin(phase),0,(-.035 if butler else -.065)+(.004 if butler else .008)*math.cos(phase*2)));pelvis.matrix=matrix
    bpy.context.view_layer.update()
    rig.pose.bones['spine_03'].rotation_quaternion=Quaternion((1,0,0),.055 if butler else .025)@Quaternion((0,1,0),(.005 if butler else .02)*math.sin(phase) if walking else 0)
    rig.pose.bones['head'].rotation_quaternion=Quaternion((0,0,1),.26 if butler else -.015)@Quaternion((1,0,0),-.11 if butler else .02)
    bpy.context.view_layer.update()
    for side,sgn in [('l',1),('r',-1)]:
        swing=math.sin(phase+(0 if side=='l' else math.pi))*(.025 if butler else .12) if walking else 0
        aim(rig,'upperarm_'+side,(sgn*.035,swing,-.30));aim(rig,'lowerarm_'+side,(sgn*.015,-.04+swing*.75,-.27))
        if butler and side=='r':aim(rig,'lowerarm_'+side,(sgn*.02,-.24,-.11))
        if raise_arm and side=='r':
            aim(rig,'upperarm_'+side,(sgn*.06,-.24,-.07));aim(rig,'lowerarm_'+side,(sgn*.015,-.18,.15))
        for p in rig.pose.bones:
            if p.name.endswith('_'+side) and p.name.startswith(('index','middle','ring','pinky','thumb')):p.rotation_quaternion=Quaternion((1,0,0),.2 if butler else .12)
    for side,sgn in [('l',1),('r',-1)]:
        thigh=rig.pose.bones['thigh_'+side];calf=rig.pose.bones['calf_'+side];hip=thigh.head.copy();u=thigh.bone.length;l=calf.bone.length
        q=(phase/math.tau+(0 if side=='l' else .5))%1;stride=.40 if butler else .62
        ankle=calf.bone.tail_local.copy();roll=0
        if walking:
            if q<.60:
                ankle.y+=-stride*.5+q/.60*stride
                roll=.10*max(0,1-q/.09)-.14*max(0,(q-.50)/.10)
            else:
                t=(q-.60)/.40;ankle.y+=stride*.5-stride*(t*t*(3-2*t));ankle.z+=(.035 if butler else .075)*math.sin(math.pi*t);roll=-.07*math.sin(math.pi*t)
        d=ankle-hip;dist=min(d.length,u+l-.001);axis=d.normalized();a=(u*u-l*l+dist*dist)/(2*dist);h=math.sqrt(max(0,u*u-a*a));bend=Vector((0,-1,0));bend=(bend-axis*bend.dot(axis)).normalized();knee=hip+axis*a+bend*h
        aim(rig,thigh.name,knee-hip);aim(rig,calf.name,ankle-knee)
        foot=rig.pose.bones['foot_'+side].bone;aim(rig,foot.name,Quaternion((1,0,0),roll)@(foot.tail_local-foot.head_local))
    bpy.context.view_layer.update()

guest,guestRig=make_character('Guest',False);guest.location.x=-1
butler,butlerRig=make_character('Butler',True);butler.location.x=1
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'characters-v3.blend'))
(OUT/'characters-v3.json').write_text(json.dumps({'generator':'MPFB 2.0.18','guestCycleMetres':.62/.60*1.04,'butlerCycleMetres':.40/.60*1.07,'clips':['Idle','Walk','Raise'],'bones':53},indent=2))
print('CHARACTERS V3 COMPLETE')
