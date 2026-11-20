"""Shape the likeness from the front reference; all pixels originate in the CC0 pack or this groom."""
from pathlib import Path
import bpy, math, random, numpy as np
from mathutils import Vector
from math import exp, sin, cos, pi

root=Path(__file__).resolve().parents[1];folder=root.parent/'build-record/tests/receptionist-22'
bpy.ops.wm.open_mainfile(filepath=str(folder/'base.blend'))
scene=bpy.context.scene;rig=bpy.data.objects['ReceptionistRig'];holder=bpy.data.objects['Receptionist']
scene.render.fps=30;scene.frame_set(1)
rig.data.pose_position='REST'
def smooth(a,b,x):
    t=max(0.,min(1.,(x-a)/(b-a)));return t*t*(3-2*t)
def gauss(x,c,w):return exp(-((x-c)/w)**2)
def warp(co):
    x,y,z=co;ax=abs(x);front=1-smooth(-.085,-.006,y)
    if z<1.478 or z>1.711:return
    mouth=gauss(z,1.541,.018)*gauss(x,0,.039)*front
    tip=gauss(z,1.566,.014)*gauss(x,0,.022)*front
    cheek=gauss(z,1.577,.025)*gauss(ax,.056,.023)
    brow=gauss(z,1.614,.010)*gauss(ax,.036,.022)*front
    # Widen the smile independently of the jaw. Lift the corners and define the cupid's bow.
    co.x+=x*(.21*mouth+.16*tip+.039*cheek-.074*gauss(z,1.514,.018))
    co.z+=mouth*(.0028+.0078*smooth(.011,.030,ax))+.0040*tip+.0023*cheek+.0028*brow
    co.y-=.0026*cheek*front+.0009*mouth+.0018*gauss(z,1.535,.004)*gauss(x,0,.022)*front
def newmesh(name,verts,faces,uvs,material,weights):
    data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update()
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.parent=rig
    data.materials.append(material)
    if uvs:
        layer=data.uv_layers.new(name='Groom UV')
        for loop in data.loops:layer.data[loop.index].uv=uvs[loop.vertex_index]
    groups={name:ob.vertex_groups.new(name=name) for name in ['head','neck_01','spine_03']}
    for i,w in enumerate(weights):
        for name,amount in zip(groups,w):
            if amount>0:groups[name].add([i],amount,'REPLACE')
    for poly in data.polygons:poly.use_smooth=True
    mod=ob.modifiers.new('Follows existing character rig','ARMATURE');mod.object=rig
    return ob
def tint_image(obj,mult,lip=False):
    mat=obj.data.materials[0];nodes=mat.node_tree.nodes;node=nodes.get('DiffuseTexture')
    if not node:return
    orig=node.image
    w,h=orig.size;px=np.empty(w*h*4,dtype=np.float32);orig.pixels.foreach_get(px);px=px.reshape(h,w,4)
    # Only the skin texture receives lip colour, confined using face-space coordinates and UVs.
    px[:,:,:3]*=mult
    if lip:
        mesh=obj.data;mesh.calc_loop_triangles();uv=mesh.uv_layers.active.data
        for tri in mesh.loop_triangles:
            pts=np.array([mesh.vertices[i].co[:] for i in tri.vertices])
            if pts[:,2].min()>1.558 or pts[:,2].max()<1.527 or pts[:,1].min()>-.122 or np.min(abs(pts[:,0]))>.042:continue
            t=np.array([uv[i].uv[:] for i in tri.loops])*[w,h]
            a=np.maximum(np.floor(t.min(axis=0)).astype(int),0);b=np.minimum(np.ceil(t.max(axis=0)).astype(int),[w-1,h-1])
            if np.any(a>b):continue
            yy,xx=np.mgrid[a[1]:b[1]+1,a[0]:b[0]+1]
            m=np.column_stack((t[1]-t[0],t[2]-t[0]))
            if abs(np.linalg.det(m))<1e-6:continue
            st=np.linalg.inv(m)@np.vstack(((xx+.5-t[0,0]).ravel(),(yy+.5-t[0,1]).ravel()))
            ok=(st[0]>=0)&(st[1]>=0)&(st.sum(axis=0)<=1)
            v=pts[0]+st.T@(pts[1:]-pts[0]);lx,ly,lz=v.T
            mid=1.541+np.minimum(.0045,.0045*(lx/.027)**2)
            mask=np.clip((1-(lx/.029)**2-((lz-mid)/.0095)**2)*4,0,1)*ok*(ly<-.127)
            pix=px[a[1]:b[1]+1,a[0]:b[0]+1,:3];pix*=1+mask.reshape(yy.shape)[:,:,None]*np.array([.025,-.37,-.29])
    out=orig.copy();out.name=obj.name+' portrait colour';out.pixels.foreach_set(px.ravel());out.update()
    out.filepath_raw=str(folder/(obj.name.replace(' ','-')+'.png'));out.file_format='PNG';out.save();out.pack()
    for n in nodes:
        if n.type=='TEX_IMAGE' and n.image==orig:n.image=out

body=bpy.data.objects['Receptionist skin'];hair=bpy.data.objects['Receptionist long01']
tint_image(body,[.91,.72,.57],True)
tint_image(bpy.data.objects['Receptionist eyebrow001'],[.58,.39,.26])
tint_image(hair,[.92,.65,.49])
for ob in list(rig.children_recursive):
    if ob.type!='MESH' or ob==hair:continue
    for v in ob.data.vertices:
        warp(v.co)
        x,y,z=v.co
        if (ob==body or 'eyelashes' in ob.name) and y<-.094 and .01<abs(x)<.059:
            v.co.z-=.0028*gauss(z,1.605,.0048)*gauss(abs(x),.034,.020)
        if (ob==body or 'eyelashes' in ob.name) and y<-.094 and .012<abs(x)<.055:
            v.co.z+=.0018*gauss(z,1.595,.0038)*gauss(abs(x),.035,.019)
        if ob==body and -.169<y<-.129 and abs(x)<.035:v.co.z+=.0026*gauss(z,1.537,.003)*gauss(x,0,.027)
# Bring the maxillary incisors into the visible smile; each tooth is a connected island.
teeth=bpy.data.objects['Receptionist teeth_base'];adj=[[] for _ in teeth.data.vertices]
for e in teeth.data.edges:
    a,b=e.vertices;adj[a].append(b);adj[b].append(a)
seen=set()
for i in range(len(adj)):
    if i in seen:continue
    stack=[i];seen.add(i);ids=[]
    while stack:
        k=stack.pop();ids.append(k)
        for n in adj[k]:
            if n not in seen:seen.add(n);stack.append(n)
    if len(ids)>160:
        for k in ids:teeth.data.vertices[k].co.y+=.006
        continue
    verts=[teeth.data.vertices[k] for k in ids]
    mean=sum((v.co for v in verts),Vector())/len(ids)
    if mean.z>1.546 and mean.y<-.112:
        top=max(v.co.z for v in verts)
        for v in verts:v.co.z=top+(v.co.z-top)*1.39-.001;v.co.y-=.003
    elif mean.z<1.544:
        for v in verts:v.co.z-=.004;v.co.y+=.003

# Style the fitted underlayer first so the part, exposed ear and back of the head
# also work in three-quarter view. Length propagates down to a curled shoulder section.
for vert in hair.data.vertices:
    x,y,z=vert.co;side=smooth(-.034,.047,x);low=1-smooth(1.39,1.631,z)
    front=1-smooth(-.105,.040,y);crown=smooth(1.641,1.712,z)
    vert.co.x=x-.030*crown+.016*side*low
    vert.co.y=y+.080*(1-side)*gauss(z,1.576,.062)*front
    vert.co.z=z+(.008-.017*(1-side))*crown+.018*front*gauss(z,1.674,.034)
    if z<1.55:
        t=(1.55-z)/.58
        vert.co.z=1.55-(1.55-z)*(.51+.026*side)
        vert.co.x+=low*(.006*side*sin(3.9*pi*t+.2)+.039*(1-side))
        vert.co.y+=low*(-.055*side+.042*(1-side))+.009*side*low*cos(4*pi*t)
# Smooth the base silhouette before the armature so idle head motion stays intact.
for ob in [body,hair]:
    sub=ob.modifiers.new('Portrait silhouette','SUBSURF');sub.levels=1
    bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_move_to_index(modifier=sub.name,index=0)
    bpy.ops.object.modifier_apply(modifier=sub.name)

# Fine hand-combed fibres, in longitudinal UV space to follow each sculpted lock.
rng=np.random.default_rng(812);size=512;y,x=np.mgrid[:size,:size]/size
u=x+.009*np.sin(y*2*pi+x*9)+.0025*np.sin(y*6*pi+x*12)
line=rng.uniform(0,1,768);fib=line[(u*767).astype(int)%768];fine=.5+.5*np.sin(u*2*pi*174)
v=.43+.45*fib+.12*fine+.08*np.sin(u*2*pi*11)+rng.normal(0,.012,u.shape)
rgb=np.stack((.46*v+.076,.258*v+.036,.128*v+.018,np.ones_like(v)),axis=-1)
img=bpy.data.images.new('Chestnut fibres',size,size,alpha=False);img.pixels.foreach_set(rgb.astype(np.float32).ravel());img.update()
img.filepath_raw=str(folder/'chestnut-fibres.png');img.file_format='PNG';img.save();img.pack()
mat=bpy.data.materials.new('Brushed chestnut and copper');mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF')
tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img;mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.71;bs.inputs['Specular IOR Level'].default_value=.16
def cat(points,t):
    n=len(points)-1;s=min(n-1,int(t*n));u=t*n-s
    a,b,c,d=[points[max(0,min(n,i))] for i in (s-1,s,s+1,s+2)]
    return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u)
from mathutils.bvhtree import BVHTree
surface=BVHTree.FromPolygons([q.co for q in hair.data.vertices],[p.vertices[:] for p in hair.data.polygons])
for m in hair.data.materials:
    sh=m.node_tree.nodes.get('Principled BSDF')
    sh.inputs['Roughness'].default_value=.76;sh.inputs['Specular IOR Level'].default_value=.14
route=[(-.043,-.116,1.680),(-.024,-.110,1.700),(.014,-.102,1.712),(.052,-.102,1.695),
       (.072,-.113,1.666),(.078,-.122,1.633),(.083,-.125,1.598),(.101,-.120,1.566),
       (.118,-.115,1.535),(.113,-.133,1.508),(.099,-.159,1.482),(.112,-.180,1.452),
       (.133,-.182,1.423),(.138,-.188,1.392),(.131,-.198,1.366),(.113,-.205,1.342),(.095,-.200,1.335),(.078,-.184,1.348)]
verts=[];faces=[];uv=[];weights=[]
random.seed(241)
for j in range(34):
    q=j/33;phase=random.uniform(0,6.28);width=random.uniform(.0048,.0086)
    offset=random.uniform(-.0025,.0025);tip=random.uniform(-.006,.009);guides=[]
    for h,(x,y,z) in enumerate(route):
        t=h/(len(route)-1);fall=smooth(.15,.52,t)
        guides.append(Vector((x+(q-.43)*(.015+.046*fall)+offset+.008*fall*sin(4*pi*t+q*3.4)+.0018*fall*sin(t*14+phase),
                              y+q*(.060-.033*fall)-.010*sin(q*pi),
                              z+(q-.3)*.017*(1-fall)+tip*smooth(.58,1,t)+.015*sin(q*pi*1.5+t*4)*fall)))
    base=len(verts);rings=80;columns=7;startU=random.uniform(0,.65)
    for i in range(rings+1):
        t=i/rings;c=cat(guides,t)
        tangent=(cat(guides,min(1,t+.001))-cat(guides,max(0,t-.001))).normalized()
        across=tangent.cross(Vector((0,1,0))).normalized();thickness=across.cross(tangent).normalized()
        turn=.38*sin(t*6*pi+q*1.4)+.28*sin(q*4.4);wide=across*cos(turn)+thickness*sin(turn)
        taper=(.14+.86*smooth(0,.11,t))*(1-.97*smooth(.91,1,t))
        for k in range(columns):
            u=k/(columns-1);w=2*u-1;pt=c+wide*width*w*taper+thickness*(.0009*(1-w*w))
            if pt.z>1.56:
                hit=surface.ray_cast(Vector((pt.x,-.40,pt.z)),Vector((0,1,0)))[0]
                if hit is not None:
                    f=smooth(1.56,1.63,pt.z);pt.y=(1-f)*pt.y+f*(hit.y-.0015-.0015*sin(q*pi))
            verts.append(tuple(pt));uv.append((startU+u*.092,t*.98))
            head=smooth(1.43,1.55,pt.z);neck=(1-head)*smooth(1.33,1.49,pt.z)*.65
            weights.append((head,neck,1-head-neck))
            if i and k:
                n=base+i*columns+k;faces.append((n-columns-1,n-columns,n,n-1))
groom=newmesh('Receptionist side parted copper waves',verts,faces,uv,mat,weights)
liner=bpy.data.materials.new('Warm charcoal lashes');liner.use_nodes=True
lashBs=liner.node_tree.nodes.get('Principled BSDF');lashBs.inputs['Base Color'].default_value=(.009,.005,.006,1);lashBs.inputs['Roughness'].default_value=.82
faceSurface=BVHTree.FromPolygons([q.co for q in body.data.vertices],[p.vertices[:] for p in body.data.polygons])
for side in [-1,1]:
    vs=[];fs=[]
    for i in range(43):
        t=i/42;x=side*(.015+t*.042)
        zz=1.599+.0054*sin(pi*min(1,t/.82))+.0028*t+.0048*smooth(.78,1,t)
        w=(.00038+.00110*sin(t*pi*.85))*(1-smooth(.79,1,t))
        for dz in [-w*.35,w]:
            hit=faceSurface.ray_cast(Vector((x,-.28,zz+dz)),Vector((0,1,0)))[0]
            y=hit.y if hit is not None else -.126;vs.append((x,y-.0008,zz+dz))
        if i:fs.append((i*2-2,i*2-1,i*2+1,i*2))
    newmesh('Receptionist upper lash line',vs,fs,None,liner,[(1,0,0)]*len(vs))

# Fine gold hoops at the exposed lobe echo the reference and define the tuck.
gold=bpy.data.materials.new('Brushed gold hoops');gold.use_nodes=True
bs=gold.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.62,.32,.080,1);bs.inputs['Metallic'].default_value=.76;bs.inputs['Roughness'].default_value=.30
for side in (-1,1):
    vs=[];fs=[]
    for i in range(80):
        a=2*pi*i/80
        for j in range(8):
            b=2*pi*j/8;r=.0011*cos(b)
            vs.append((side*(.079+(.012+r)*sin(a)), -.019+.007*sin(a)+.0011*sin(b),1.524+(.027+r)*cos(a)))
            fs.append((i*8+j,((i+1)%80)*8+j,((i+1)%80)*8+(j+1)%8,i*8+(j+1)%8))
    newmesh('Receptionist gold hoop',vs,fs,None,gold,[(1,0,0)]*len(vs))
rig.data.pose_position='POSE';scene.frame_set(1);bpy.context.view_layer.update()
bpy.ops.object.select_all(action='DESELECT')
for o in [holder]+list(holder.children_recursive):o.select_set(True)
bpy.context.view_layer.objects.active=holder
bpy.ops.export_scene.gltf(filepath=str(root/'assets/receptionist-v22.glb'),export_format='GLB',use_selection=True,export_apply=False,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_force_sampling=True,export_anim_single_armature=False,export_morph=False,export_skins=True,export_materials='EXPORT',export_image_format='WEBP',export_image_quality=92)
bpy.ops.file.pack_all();bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(root/'assets/receptionist-v22.blend'))

