"""Run with Blender --background --python tools/build_scene.py.
Builds the original hotel, articulated characters, camera metadata and plates.
All distances are metres; Blender +Y is along the corridor, +Z is up.
"""
import bpy, math, json, random, os, sys
from pathlib import Path
from mathutils import Vector
random.seed(1908)
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'assets'; OUT.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for block in bpy.data.materials: bpy.data.materials.remove(block)
scene=bpy.context.scene

def mat(name,color,rough=.5,metal=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    return m
def grain(m,scale=5,stretch=(1,1,1),strength=.15):
    n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF')
    tc=n.new('ShaderNodeTexCoord');v=n.new('ShaderNodeVectorMath');v.operation='MULTIPLY';v.inputs[1].default_value=stretch
    noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=scale;noise.inputs['Detail'].default_value=4
    bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=strength;bump.inputs['Distance'].default_value=.035
    l.new(tc.outputs['Generated'],v.inputs[0]);l.new(v.outputs[0],noise.inputs['Vector']);l.new(noise.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],p.inputs['Normal'])
    ramp=n.new('ShaderNodeValToRGB');base=p.inputs['Base Color'].default_value[:3]
    ramp.color_ramp.elements[0].position=.18;ramp.color_ramp.elements[0].color=(*(c*.38 for c in base),1)
    ramp.color_ramp.elements[1].position=.82;ramp.color_ramp.elements[1].color=(*(min(1,c*1.6) for c in base),1)
    l.new(noise.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs[0],p.inputs['Base Color'])
def texmat(name,file,rough=.8):
    m=mat(name,(.5,.5,.5),rough);n=m.node_tree.nodes;t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(OUT/'textures'/file));m.node_tree.links.new(t.outputs['Color'],n.get('Principled BSDF').inputs['Base Color']);return m
wood=mat('Hand-rubbed walnut',(.12,.052,.021),.27);grain(wood,4,(3,3,.24),.16)
darkwood=mat('Recessed walnut',(.055,.026,.014),.37);grain(darkwood,5,(3,3,.2),.12)
brass=mat('Aged brass',(.36,.235,.095),.29,.78);grain(brass,18,(1,1,1),.07)
black=mat('Blackened iron',(.018,.022,.02),.48,.6)
plaster=mat('Smoked plaster',(.19,.18,.135),.9);grain(plaster,10,(1,1,1),.1)
wall=texmat('Faded olive damask','wallpaper.png');carpet=texmat('Worn oxblood runner','carpet.png',.95)
painting=texmat('An unremembered landscape','painting.png')
ivory=mat('Old ivory',(.64,.55,.38),.66)
velvet=mat('Curtain velvet',(.115,.019,.023),.9)
glass=mat('Night window',(.025,.055,.075),.14,.55)
shade=mat('Amber linen shade',(.72,.44,.17),.72)
p=shade.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(1,.43,.12,1);p.inputs['Emission Strength'].default_value=.7
bulb=mat('Incandescent',(.95,.62,.22),.3);p=bulb.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(1,.51,.16,1);p.inputs['Emission Strength'].default_value=5
redbulb=mat('Suite red glass',(.35,.012,.007),.3);p=redbulb.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(1,.025,.01,1);p.inputs['Emission Strength'].default_value=2

def finish(o,name,material=None,parent=None):
    o.name=name
    if material:o.data.materials.append(material)
    if parent:o.parent=parent
    return o
def cube(name,loc,scale,material,bevel=0,parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    finish(o,name,material,parent)
    if bevel:
        b=o.modifiers.new('Soft worn edges','BEVEL');b.width=bevel;b.segments=3
        o.modifiers.new('Weighted corners','WEIGHTED_NORMAL')
    return o
def uvball(name,loc,scale,material,parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,radius=1,location=loc);o=bpy.context.object;o.scale=scale;finish(o,name,material,parent)
    for p in o.data.polygons:p.use_smooth=True
    return o
def cyl(name,loc,r,depth,material,parent=None,r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=r,radius2=r if r2 is None else r2,depth=depth,location=loc);o=bpy.context.object;finish(o,name,material,parent)
    for p in o.data.polygons:p.use_smooth=True
    b=o.modifiers.new('Edge glint','BEVEL');b.width=.008;b.segments=2
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return o
def empty(name,loc=(0,0,0),parent=None):
    o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);o.location=loc;o.parent=parent;return o
def line(name,points,r,material,parent=None):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=3
    p=c.splines.new('BEZIER');p.bezier_points.add(len(points)-1)
    for b,co in zip(p.bezier_points,points):b.co=co;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);finish(o,name,material,parent);return o
def text(name,body,loc,size,material,rotation=(math.pi/2,0,0),align='CENTER'):
    c=bpy.data.curves.new(name,'FONT');c.body=body;c.size=size;c.align_x=align;c.extrude=.0015;c.space_character=1.2
    o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=rotation;c.materials.append(material);return o
def quad(name,verts,uvs,material):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],[(0,1,2,3)]);mesh.uv_layers.new()
    for i,uv in enumerate(uvs):mesh.uv_layers[0].data[i].uv=uv
    o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.data.materials.append(material);return o
def area(name,loc,target,color,power,size):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
def point(name,loc,color,power,r=.15):
    d=bpy.data.lights.new(name,'POINT');d.energy=power;d.color=color;d.shadow_soft_size=r;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;return o

# Architectural shell, layered joinery and real floorboards.
cube('Subfloor',(0,12,-.12),(5.2,26,.2),darkwood)
for x in [i*.31-2.4 for i in range(17)]:
    for y in range(0,26,3):cube('Oak floor board',(x,y+1.5+(1.5 if int(x*10)%2 else 0),0),(.30,2.99,.06),wood,.012)
quad('Runner',[(-1.18,-1,.038),(1.18,-1,.038),(1.18,25,.038),(-1.18,25,.038)],[(0,0),(1,0),(1,6),(0,6)],carpet)
cube('Ceiling',(0,12,3.65),(5.1,26,.18),plaster)
for side in [-1,1]:
    x=side*2.5
    cube('Wall body',(x,12,1.8),(.22,26,3.6),plaster)
    # UV-controlled damask on the upper wall.
    quad('Damask wall',[(side*2.377,-1,1.12),(side*2.377,25,1.12),(side*2.377,25,3.54),(side*2.377,-1,3.54)],[(0,0),(26,0),(26,2.42),(0,2.42)],wall)
    cube('Wainscot',(side*2.36,12,.57),(.15,26,1.14),darkwood,.015)
    for z,w in [(.08,.12),(.2,.06),(.98,.07),(1.1,.10),(1.17,.035),(3.38,.1),(3.48,.16),(3.55,.10)]:cube('Long carved moulding',(side*2.27,12,z),(.13,26,w),wood,.016)
    for y in [i*.75-.5 for i in range(35)]:
        cube('Panel stile',(side*2.24,y,.59),(.10,.07,.74),wood,.009)
        for z in [.28,.91]:cube('Raised inset trim',(side*2.25,y+.375,z),(.035,.64,.025),brass,.006)
    for y in [0,8.7,16,24.5]:
        cube('Pilaster',(side*2.22,y,1.8),(.22,.21,3.5),wood,.025)
        for z in [1.14,3.28]:cube('Pilaster capital',(side*2.18,y,z),(.29,.34,.16),wood,.02)
for y in [0,8.7,16,24.5]:
    cube('Ceiling rib',(0,y,3.44),(4.6,.24,.18),wood,.025)
    cube('Ceiling gilded line',(0,y-.14,3.4),(4.6,.025,.02),brass,.004)

def door(y,number):
    x=-2.27
    cube('Door leaf',(x,y,1.38),(.09,1.38,2.72),darkwood,.02)
    for dy in [-.77,.77]:
        cube('Door architrave',(-2.16,y+dy,1.44),(.21,.13,2.9),wood,.025)
        cube('Door brass bead',(-2.04,y+dy,1.44),(.015,.018,2.8),brass,.005)
    for z in [2.8,2.94]:cube('Door pediment',(-2.16,y,z),(.26,1.72,.12),wood,.02)
    for z,h in [(.65,.85),(1.87,1.25)]:
        cube('Door raised field',(-2.20,y,z),(.07,1.08,h),wood,.012)
        for dy in [-.57,.57]:cube('Panel frame',(-2.15,y+dy,z),(.025,.035,h+.08),brass,.004)
        for zz in [z-h/2-.04,z+h/2+.04]:cube('Panel frame',(-2.15,y,zz),(.025,1.17,.03),brass,.004)
    uvball('Brass knob',(-2.03,y+.49,1.06),(.065,.045,.045),brass)
    cube('Escutcheon',(-2.11,y+.49,.99),(.04,.08,.22),brass,.025)
    text('Room number',number,(-2.085,y,1.98),.15,brass,(math.pi/2,0,math.pi/2))
for y,n in [(3,'102'),(10.8,'104'),(18.2,'106')]:door(y,n)

def sconce(side,y,red=False):
    x=side*2.16
    uvball('Brass wall rose',(x,y,2.15),(.06,.13,.19),brass)
    line('Swan-neck arm',[(x,y,2.15),(side*1.92,y,1.96),(side*1.81,y,2.08),(side*1.83,y,2.32)],.025,brass)
    cyl('Pleated lampshade',(side*1.83,y,2.48),.23,.36,redbulb if red else shade,r2=.12)
    for i in range(24):
        a=i*math.tau/24
        line('Shade pleat',[(side*1.83+.23*math.cos(a),y+.23*math.sin(a),2.30),(side*1.83+.12*math.cos(a),y+.12*math.sin(a),2.66)],.003,ivory if not red else velvet)
    for z,r in [(2.3,.235),(2.66,.125)]:
        bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=.009,major_segments=32,minor_segments=8,location=(side*1.83,y,z));finish(bpy.context.object,'Shade piping',brass)
    uvball('Bulb',(side*1.83,y,2.27),(.06,.06,.07),bulb)
    point('Warm pool',(side*1.75,y,2.28),(1,.53,.23) if not red else (1,.07,.025),90 if not red else 55,.18)
    area('Downlit wallpaper',(side*1.94,y,2.32),(side*2.36,y,1.4),(1,.55,.26),38,.55)
for side,ys in [(-1,[1.5,6.3,9,14.4,17,22]),(1,[2,9,16,22])]:
    for y in ys:sconce(side,y,y==22)

# Cold windows: divided panes, inset sill, rain beads and exterior mullion shadows.
for y in [5.6,12.9,19.7]:
    cube('Window recess',(2.30,y,2.13),(.19,2.05,2.15),black,.02)
    cube('Window pane',(2.18,y,2.13),(.025,1.84,1.94),glass,.005)
    for dy in [-1.04,1.04,0]:cube('Window vertical frame',(2.10,y+dy,2.13),(.17,.07,2.19),wood,.009)
    for z in [1.04,2.1,3.22]:cube('Window crossbar',(2.09,y,z),(.19,2.15,.07),wood,.009)
    cube('Window sill',(2.02,y,1.02),(.48,2.32,.12),wood,.02)
    for j in range(65):
        yy=y+random.uniform(-.9,.9);zz=random.uniform(1.12,3.13)
        line('Rain on glass',[(2.153,yy,zz),(2.153,yy+.003,zz-random.uniform(.02,.16))],.0025,glass)
    area('Blue window wash',(2.05,y,2.44),(-2.1,y+1.6,.3),(.27,.48,1),210,1.6)
    # Narrow louver-like cool shadows crossing the carpet.
    d=bpy.data.lights.new('Moon through rain','SPOT');d.energy=280;d.color=(.38,.59,1);d.spot_size=1.15;d.spot_blend=.35;d.shadow_soft_size=.06
    o=bpy.data.objects.new('Moon through rain',d);scene.collection.objects.link(o);o.location=(2.1,y,2.9);o.rotation_euler=(Vector((-1.5,y+3.5,0))-o.location).to_track_quat('-Z','Y').to_euler()

# End wall and honeymoon suite, visible as a distant destination.
cube('End wall',(0,24.8,1.8),(5.1,.25,3.6),wood)
cube('Suite door',(0,24.61,1.5),(1.75,.15,3),velvet,.025)
for x in [-1.01,1.01]:cube('Suite jamb',(x,24.46,1.6),(.15,.23,3.2),wood,.02)
for z in [.4,1.4,2.65]:cube('Suite inlay',(0,24.50,z),(1.56,.035,.035),brass,.006)
for x in [-.73,.73]:cube('Suite inlay',(x,24.50,1.53),(.035,.035,2.3),brass,.006)
text('Suite name','H O N E Y M O O N\nS U I T E',(0,24.48,2.3),.15,brass)
uvball('Suite door handle',(.6,24.4,1.2),(.05,.07,.05),brass)
text('Above the threshold','0',(0,24.4,3.2),.24,brass)

# Gilded landscape, little console, fresh-looking dead flowers.
for y in [7.7,15.8]:
    cube('Portrait back',(-2.23,y,2.13),(.1,.91,1.25),darkwood,.01)
    quad('Landscape canvas',[(-2.155,y-.36,1.61),(-2.155,y+.36,1.61),(-2.155,y+.36,2.66),(-2.155,y-.36,2.66)],[(0,0),(1,0),(1,1),(0,1)],painting)
    for yy in [y-.47,y+.47]:cube('Gilt picture frame',(-2.12,yy,2.13),(.11,.09,1.35),brass,.025)
    for z in [1.48,2.79]:cube('Gilt picture frame',(-2.12,y,z),(.11,1.01,.09),brass,.025)
    for yy in [y-.47,y+.47]:
        for z in [1.48,2.79]:uvball('Frame rosette',(-2.06,yy,z),(.025,.06,.06),brass)
for y in [8.0,15.8]:
    for xx in [1.63,2.06]:
        for yy in [y-.35,y+.35]:
            line('Cabriole table leg',[(xx,yy,.04),(xx-.05,yy,.4),(xx+.03,yy,.8)],.035,wood)
    cube('Console tabletop',(1.85,y,.87),(.62,1.03,.07),wood,.06)
    cyl('Vase foot',(1.84,y,.94),.13,.08,brass)
    uvball('Porcelain urn',(1.84,y,1.09),(.16,.17,.2),brass)
    cyl('Vase neck',(1.84,y,1.23),.07,.14,brass,r2=.10)
    for j in range(11):
        xx=1.84+random.uniform(-.23,.23);yy=y+random.uniform(-.23,.23);zz=random.uniform(1.5,1.8)
        line('Flower stem',[(1.84,y,1.23),(xx,yy,zz)],.007,black)
        for a in range(6):uvball('Dried rose petal',(xx+.04*math.cos(a),yy+.04*math.sin(a),zz),(.046,.035,.02),velvet)

# A foreground rail makes the matched depth pass demonstrable.
for y in [i*.26+.1 for i in range(10)]:
    cyl('Turned baluster',(1.61,y,.52),.034,.96,wood)
    for z,r in [(.2,.055),(.43,.064),(.75,.055)]:uvball('Baluster turning',(1.61,y,z),(r,r,.11),wood)
cube('Polished handrail',(1.61,1.25,1.05),(.14,2.8,.13),wood,.05)
cube('Rail foot',(1.61,1.25,.06),(.15,2.8,.10),wood,.02)
for y in [-.12,2.62]:
    cube('Newel post',(1.61,y,.58),(.16,.16,1.15),wood,.02);uvball('Newel globe',(1.61,y,1.23),(.125,.125,.125),wood)

# Low-density physically rendered atmosphere, not a painted beam.
fog=bpy.data.materials.new('Fine hotel dust');fog.use_nodes=True;n=fog.node_tree.nodes;n.clear();p=n.new('ShaderNodeVolumePrincipled');p.inputs['Density'].default_value=.012;p.inputs['Color'].default_value=(.52,.59,.65,1);p.inputs['Anisotropy'].default_value=.3;o=n.new('ShaderNodeOutputMaterial');fog.node_tree.links.new(p.outputs['Volume'],o.inputs['Volume'])
cube('Air volume',(0,12,1.8),(4.7,25.5,3.5),fog)
world=bpy.data.worlds.new('Midnight outside');scene.world=world;world.use_nodes=True;world.node_tree.nodes.get('Background').inputs[0].default_value=(.13,.16,.21,1);world.node_tree.nodes.get('Background').inputs[1].default_value=.17
area('Soft rear fill',(0,-1,3),(0,7,1),(.48,.58,.75),65,3)

# Capture environment objects before generating characters.
environment=list(scene.objects)

# Characters are original articulated GLBs. Limb pivot nodes support a runtime gait.
suit=mat('Guest charcoal wool',(.07,.078,.082),.85);grain(suit,85,(1,1,1),.08)
butlersuit=mat('Butler midnight barathea',(.027,.036,.042),.72)
shirt=mat('Ivory shirt cotton',(.57,.53,.44),.86)
tie=mat('Oxblood silk tie',(.125,.026,.027),.45)
skin=mat('Butler wax-pale skin',(.39,.31,.23),.7)
shadowSkin=mat('Guest face in shadow',(.014,.012,.011),1)
hair=mat('Dark swept hair',(.026,.019,.015),.86)
grey=mat('Thin silver hair',(.28,.27,.23),.83)
shoe=mat('Polished black leather',(.023,.019,.017),.28)
eyes=mat('Sunken eye sockets',(.04,.026,.02),.85)
eyeWhite=mat('Dim eyes',(.30,.29,.24),.4)

def ringmesh(name,levels,material,parent,segments=32):
    verts=[];faces=[]
    for z,rx,ry,cy in levels:
        for i in range(segments):
            a=i*math.tau/segments;verts.append((rx*math.cos(a),cy+ry*math.sin(a),z))
    for j in range(len(levels)-1):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
    faces.extend([tuple(reversed(range(segments))),tuple((len(levels)-1)*segments+i for i in range(segments))])
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);finish(o,name,material,parent)
    for p in mesh.polygons:p.use_smooth=True
    sub=o.modifiers.new('Tailoring surface','SUBSURF');sub.levels=1;return o
def tri(name,verts,material,parent):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],[tuple(range(len(verts)))]);mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);finish(o,name,material,parent);s=o.modifiers.new('Fabric thickness','SOLIDIFY');s.thickness=.007;return o

def character(name,is_butler=False):
    root=empty(name); cloth=butlersuit if is_butler else suit
    height=1.07 if is_butler else 1
    hip=empty(name+'Body',(0,0,0),root)
    ringmesh(name+'Jacket',[(.78,.19,.115,0),(.87,.22,.14,0),(1.05,.19,.13,0),(1.31,.25,.14,0),(1.40,.23,.12,0),(1.44,.13,.09,0)],cloth,hip)
    # Shirt, collar and overlapping tailored lapels point +Y.
    tri(name+'Shirt',[(0,.155,1.08),(-.105,.143,1.40),(.105,.143,1.40)],shirt,hip)
    for s in [-1,1]:
        tri(name+'Lapel',[(s*.21,.116,1.37),(s*.105,.15,1.42),(s*.057,.167,1.19),(s*.13,.151,1.26)],cloth,hip)
        tri(name+'Collar',[(s*.10,.15,1.45),(s*.02,.178,1.40),(s*.062,.18,1.33)],shirt,hip)
    tri(name+'Tie',[(0,.184,1.38),(-.025,.18,1.32),(-.029,.179,1.15),(0,.18,1.10),(.029,.179,1.15),(.025,.18,1.32)],tie if not is_butler else black,hip)
    for z in [1.05,1.18,1.30]:
        for x in ([-.08,.08] if is_butler else [.02]):uvball(name+'Button',(x,.143,z),(.012,.008,.012),brass if is_butler else black,hip)
    cube(name+'Pocket',(-.145,.139,1.27),(.08,.013,.025),cloth,.004,hip)
    # Arms have independent shoulder and elbow pivots.
    for s,label in [(-1,'L'),(1,'R')]:
        arm=empty(name+'Arm'+label,(s*.25,0,1.34),hip)
        ringmesh(name+'Sleeve'+label,[(0,.092,.095,0),(-.09,.085,.09,0),(-.29,.066,.07,.005)],cloth,arm)
        fore=empty(name+'Forearm'+label,(0,0,-.28),arm)
        ringmesh(name+'CuffSleeve'+label,[(0,.066,.07,0),(-.19,.052,.055,0),(-.27,.048,.05,0)],cloth,fore)
        cyl(name+'WhiteCuff'+label,(0,0,-.275),.047,.044,shirt,fore)
        uvball(name+'Hand'+label,(0,.015,-.34),(.045,.035,.069),shirt if is_butler else skin,fore)
        for j in range(4):uvball(name+'Finger'+label,(s*(-.024+j*.014),.026,-.38),(.009,.013,.036),shirt if is_butler else skin,fore)
        leg=empty(name+'Leg'+label,(s*.103,0,.82),root)
        ringmesh(name+'Trouser'+label,[(0,.1,.105,0),(-.19,.09,.095,0),(-.40,.069,.075,0)],cloth,leg)
        shin=empty(name+'Shin'+label,(0,0,-.40),leg)
        ringmesh(name+'LowerTrouser'+label,[(0,.069,.075,0),(-.23,.066,.07,0),(-.33,.064,.07,0)],cloth,shin)
        uvball(name+'Shoe'+label,(0,.055,-.355),(.077,.149,.055),shoe,shin)
        cube(name+'Sole'+label,(0,.047,-.395),(.14,.25,.018),black,.02,shin)
    head=empty(name+'Head',(0,0,1.50),hip)
    cyl(name+'Neck',(0,0,-.03),.059,.16,skin if is_butler else shadowSkin,head)
    ringmesh(name+'Skull',[(0,.065,.07,.005),(.05,.08,.082,0),(.12,.094,.09,0),(.20,.092,.086,-.005),(.26,.071,.07,-.01),(.29,.02,.025,-.01)],skin if is_butler else shadowSkin,head)
    if is_butler:
        for s in [-1,1]:
            uvball('ButlerCheek',(s*.067,.068,.11),(.031,.033,.042),skin,head)
            uvball('ButlerSocket',(s*.04,.079,.17),(.029,.011,.021),eyes,head)
            uvball('ButlerEye',(s*.04,.09,.171),(.011,.008,.009),eyeWhite,head)
            uvball('ButlerPupil',(s*.04,.097,.171),(.004,.003,.005),black,head)
            line('ButlerBrow',[(s*.016,.087,.198),(s*.04,.091,.205),(s*.068,.08,.199)],.007,grey,head)
            line('ButlerNasolabial',[(s*.021,.093,.13),(s*.04,.086,.087),(s*.036,.078,.07)],.003,eyes,head)
            uvball('ButlerEar',(s*.097,-.001,.145),(.018,.027,.039),skin,head)
            for j in range(8):
                x=s*(.073+j*.003);line('ButlerSilverHair',[(x,-.01,.24),(x+s*.005,-.045,.19),(x,-.06,.07)],.004,grey,head)
        uvball('ButlerNose',(0,.097,.134),(.018,.036,.039),skin,head)
        line('ButlerMouth',[(-.035,.084,.067),(0,.092,.071),(.035,.084,.067)],.003,eyes,head)
        for z in [.215,.231]:line('ButlerForeheadWrinkle',[(-.05,.077,z),(0,.085,z+.004),(.05,.077,z)],.002,eyes,head)
        # Bell is parented separately so its anomalous levitation is visible.
        bell=empty('ButlerBell',(.35,.22,1.13),root)
        cyl('Bell rim',(0,0,0),.068,.025,brass,bell)
        cyl('Bell body',(0,0,.047),.063,.08,brass,bell,r2=.023)
        cyl('Bell handle',(0,0,.12),.014,.09,black,bell)
        uvball('Bell finial',(0,0,.175),(.023,.023,.023),brass,bell)
    else:
        uvball('GuestHairCap',(0,-.025,.226),(.099,.088,.085),hair,head)
        uvball('GuestHairBack',(0,-.067,.14),(.085,.035,.10),hair,head)
        for j in range(11):
            x=-.075+j*.014
            line('GuestCombedHair',[(x,.034,.25),(x-.015,-.015,.293),(x,-.084,.22)],.009,hair,head)
    root.scale=(height,height,height)
    return root

guest=character('Guest');butler=character('Butler',True)

def descendants(root):return [root]+list(root.children_recursive)
def export_objects(path,objects):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
export_objects(OUT/'guest.glb',descendants(guest));export_objects(OUT/'butler.glb',descendants(butler))
for root in [guest,butler]:
    for o in descendants(root):o.hide_render=True

# Low-poly depth-only occluders; matching world geometry stays invisible in browser.
occluders=[]
for side in [-1,1]:occluders.append(cube('DepthWall',(side*2.50,12,1.8),(.22,26,3.6),black))
occluders.append(cube('DepthRail',(1.61,1.25,1.05),(.14,2.8,.13),black))
for y in [i*.26+.1 for i in range(10)]:occluders.append(cube('DepthBaluster',(1.61,y,.52),(.055,.055,.96),black))
for y in [8,15.8]:occluders.append(cube('DepthConsole',(1.85,y,.87),(.62,1.03,.07),black))
export_objects(OUT/'occlusion.glb',occluders)
for o in occluders:o.hide_render=True

scene.render.engine='CYCLES';scene.cycles.samples=96;scene.cycles.use_denoising=True
try:
    pref=bpy.context.preferences.addons['cycles'].preferences;pref.compute_device_type='OPTIX';pref.get_devices()
    for d in pref.devices:d.use=d.type=='OPTIX'
    scene.cycles.device='GPU'
except Exception as e:print('CPU fallback:',e)
scene.cycles.max_bounces=6;scene.cycles.volume_bounces=1
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB'
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.65
scene.use_nodes=True;n=scene.node_tree.nodes;n.clear();r=n.new('CompositorNodeRLayers');g=n.new('CompositorNodeGlare');g.glare_type='FOG_GLOW';g.quality='HIGH';g.threshold=1.5;g.size=7;g.mix=-.93;c=n.new('CompositorNodeComposite');scene.node_tree.links.new(r.outputs['Image'],g.inputs['Image']);scene.node_tree.links.new(g.outputs['Image'],c.inputs[0])
camera_defs=[('arrival',(1.05,-.7,2.55),(-.30,9.2,1.22),25),('passage',(-1.47,8.0,2.65),(.35,20,1.2),27)]
data={'width':1920,'height':1080,'cameras':[],'coordinates':'Three: x = Blender x, y = Blender z, z = -Blender y'}
def convert(p):return [p[0],p[2],-p[1]]
for name,pos,target,lens in camera_defs:
    cd=bpy.data.cameras.new(name);cam=bpy.data.objects.new(name,cd);scene.collection.objects.link(cam);cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cd.lens=lens;cd.sensor_width=36;cd.sensor_fit='HORIZONTAL';cd.clip_start=.05;cd.clip_end=100
    fov=math.degrees(2*math.atan(36/(2*lens)/(1920/1080)))
    data['cameras'].append({'name':name,'position':convert(pos),'target':convert(target),'fov':fov,'plate':name+'.png'})
(OUT/'scene.json').write_text(json.dumps(data,indent=2))
scene.camera=bpy.data.objects['arrival']
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'room-zero.blend'))
for name,_,_,_ in camera_defs:
    scene.camera=bpy.data.objects[name];scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
print('ROOM ZERO ASSETS COMPLETE')
