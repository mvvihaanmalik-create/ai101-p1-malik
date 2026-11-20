"""Extend the existing hotel with authored playable locations and matched plates."""
import bpy,math,json,ast,random,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets';random.seed(1908)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'hotel-lighting-v2.blend'));scene=bpy.context.scene
print('HOTEL SOURCE OPEN',flush=True)
# Reuse the project's existing modelling helpers without rebuilding its v1 scene.
tree=ast.parse((ROOT/'tools/build_scene.py').read_text())
helpers={'mat','grain','finish','cube','uvball','cyl','empty','line','text','quad','area','point'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in helpers],type_ignores=[]),'<hotel helpers>','exec'))
# Direct data creation avoids a whole-scene dependency update for every cube.
def cube(name,loc,scale,material,bevel=0,parent=None):
    sx,sy,sz=[v/2 for v in scale];verts=[(x*sx,y*sy,z*sz) for x,y,z in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]);o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.location=loc;finish(o,name,material,parent)
    if bevel:b=o.modifiers.new('Worn edge','BEVEL');b.width=bevel;b.segments=2
    return o
wood=bpy.data.materials['Hand-rubbed walnut'];darkwood=bpy.data.materials['Recessed walnut'];brass=bpy.data.materials['Aged brass'];ivory=bpy.data.materials['Old ivory'];wall=bpy.data.materials['Faded olive damask'];carpet=bpy.data.materials['Worn oxblood runner'];velvet=bpy.data.materials['Curtain velvet'];black=bpy.data.materials['Blackened iron'];plaster=bpy.data.materials['Smoked plaster'];glass=bpy.data.materials['Night window'];shade=bpy.data.materials['Amber linen shade'];bulb=bpy.data.materials['Incandescent']
claret=mat('Claret lacquer',(.19,.009,.025),.28);grain(claret,5,(2,2,.3),.05)
jade=mat('Jade glass',(.014,.12,.095),.24,.15);p=jade.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(.02,.25,.12,1);p.inputs['Emission Strength'].default_value=.25
cream=mat('Ivory marble',(.36,.32,.24),.26);grain(cream,3,(1,1,1),.03)
onyx=mat('Black marble',(.012,.018,.022),.22);grain(onyx,4,(1,1,1),.04)
for o in scene.objects:
    if o.type!='LIGHT':continue
    if o.name.startswith('Warm pool'):
        o.data.color=(1,.20,.09) if o.location.y>15 else (1,.40,.14);o.data.energy=42
    if o.name.startswith('Downlit wallpaper'):o.data.color=(1,.32,.14);o.data.energy=17
    if o.name.startswith('Blue window wash'):o.data.color=(.13,.58,.65);o.data.energy=55
    if o.name.startswith('Moon through rain'):o.data.color=(.24,.50,1);o.data.energy=900
scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.045
scene.view_settings.exposure=.15
# The old far door now leads to stairs, rather than pretending to be the suite.
bpy.data.objects['Suite name'].data.body='E A S T   S T A I R\nH O N E Y M O O N   S U I T E  ↑'
rooms={};cameras=[];new_occluders=[]
def occ(name,loc,size):
    o=cube(name,loc,size,black);o.hide_render=True;new_occluders.append(o);return o
def shell(name,x,width=6,length=10,tiles=False):
    print('BUILDING',name,flush=True)
    rooms[name]={'origin':x,'bounds':[-1.5,1.1,2.7,length-1.4],'entry':[-.45,3.0],'exit':length-1.5,'views':[]}
    cube(name+' floor',(x,length/2,-.1),(width,length,.18),darkwood)
    if tiles:
        for i in range(int(width/.5)):
            for j in range(int(length/.5)):cube('Marble tessera',(x-width/2+.25+i*.5,.25+j*.5,.014),(.49,.49,.035),cream if (i+j)%2 else onyx,.006)
    else:
        for i in range(int(width/.3)):
            for j in range(int(length/2)):cube('Room parquet',(x-width/2+.15+i*.3,1+j*2,.015),(.29,1.99,.035),wood,.007)
        quad('Room runner',[(x-.9,0,.045),(x+.9,0,.045),(x+.9,length,.045),(x-.9,length,.045)],[(0,0),(1,0),(1,length/4),(0,length/4)],carpet)
    cube('Room ceiling',(x,length/2,3.7),(width,length,.16),plaster)
    for s in [-1,1]:
        wx=x+s*width/2;cube('Room wall',(wx,length/2,1.8),(.18,length,3.6),darkwood)
        quad('Room damask',[(wx-s*.11,0,1.1),(wx-s*.11,length,1.1),(wx-s*.11,length,3.5),(wx-s*.11,0,3.5)],[(0,0),(length,0),(length,2.4),(0,2.4)],wall)
        for z in [.12,1.05,1.16,3.35,3.5]:cube('Room moulding',(wx-s*.15,length/2,z),(.16,length,.08),wood,.014)
        for yy in range(length):cube('Panel stile',(wx-s*.13,yy,.57),(.1,.07,.86),wood,.01)
    cube('Room end wall',(x,length,1.8),(width,.18,3.6),darkwood)
    area('Room cool ambience',(x+width/2-.4,4,3),(x-1,6,1),(.10,.35,.49),100,2.2)
    area('Room soft rear',(x,0,3),(x,5,1),(1,.43,.21),70,2)
def curtain(x,y,z=1.75,width=3,height=3.4):
    for i in range(int(width/.12)):
        xx=x-width/2+i*.12;cube('Velvet fold',(xx,y+math.sin(i*.8)*.065,z),(.14,.16,height),velvet,.06)
    cyl('Curtain finial',(x-width/2,y,3.5),.075,.18,brass)
def lamp(x,y,z=1.1,green=False):
    cyl('Lamp base',(x,y,z),.13,.07,brass);cyl('Lamp stem',(x,y,z+.22),.018,.4,brass)
    if green:cube('Banker green shade',(x,y,z+.43),(.45,.23,.15),jade,.075)
    else:cyl('Table shade',(x,y,z+.49),.22,.30,shade,r2=.12)
    point('Table light',(x,y-.12,z+.4),(.17,1,.61) if green else (1,.28,.12),28,.14)
def doorway(x,y,label,width=1.5):
    cube('Door panel',(x,y,1.5),(width,.12,3),claret,.025)
    for xx in [x-width/2-.1,x+width/2+.1]:cube('Door casing',(xx,y-.1,1.55),(.15,.20,3.1),wood,.02)
    for zz in [.35,1.4,2.72]:cube('Door inlay',(x,y-.08,zz),(width-.2,.03,.022),brass,.003)
    text('Door lettering',label,(x,y-.085,2.2),.13,brass)
    uvball('Door knob',(x+width*.33,y-.15,1.05),(.045,.07,.045),brass)
def camera(name,room,pos,target,lens=32,min_y=0):
    d=bpy.data.cameras.new(name);o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();d.lens=lens;d.sensor_width=36;d.sensor_fit='HORIZONTAL';d.clip_start=.05;d.clip_end=250
    conv=lambda p:[p[0],p[2],-p[1]]
    c={'name':name,'room':room,'position':conv(pos),'target':conv(target),'fov':math.degrees(2*math.atan(36/(2*lens)/(16/9))),'plate':name+'-v3.webp','minY':min_y};rooms[room]['views'].append(len(cameras));cameras.append(c)

rooms['corridor']={'origin':0,'bounds':[-1.37,1.2,3.8,22.5],'entry':[-.32,4.1],'exit':22.3,'views':[]}
camera('corridor-near','corridor',(.95,.5,2.13),(-.15,8.5,1.32),32)
camera('corridor-middle','corridor',(-1.15,6.1,2.15),(.10,16,1.3),32,9)
camera('corridor-far','corridor',(.95,12.5,2.12),(-.1,24,1.4),32,15.4)

shell('reception',30,7,10,True)
curtain(31.3,9.75,width=3.6)
doorway(28.15,9.82,'E A S T   W I N G')
cube('Reception counter',(31.5,6.9,.55),(2.65,.82,1.1),wood,.05);cube('Counter marble',(31.5,6.9,1.14),(2.85,.98,.12),onyx,.03)
occ('Depth reception counter',(31.5,6.9,.62),(2.85,.98,1.24))
for x in [30.45,31.15,31.85,32.55]:cube('Counter raised field',(x,6.46,.6),(.56,.035,.72),claret,.01)
lamp(32.2,6.85,1.22,True)
cube('Guest register',(31.15,6.65,1.23),(.48,.31,.035),ivory,.005)
text('Register inscription','G U E S T S',(31.15,6.65,1.255),.037,black,(0,0,0))
cyl('Desk bell',(30.6,6.65,1.27),.09,.07,brass,r2=.035)
cube('Key rack backing',(30.95,9.63,2.05),(2,.12,1.3),wood,.025)
for i in range(6):
    for j in range(3):
        x=30.15+i*.3;z=1.58+j*.35;cube('Key cubby',(x,9.52,z),(.26,.15,.26),onyx,.01);line('Hanging key',[(x,9.41,z+.03),(x,9.40,z-.08)],.008,brass)
text('Hotel identity','R E C E P T I O N',(30.6,9.48,3.03),.20,brass)
area('Reception red curtain',(32.8,7.8,2.5),(31.2,9.7,2),(1,.015,.04),160,1.2)
camera('reception','reception',(31.1,-.4,2.15),(29.8,7.3,1.45),31)
rooms['reception']['bounds']=[-1.7,.2,2.7,8.6]

shell('landing',60,6,10)
cube('Lift recess',(58.5,9.75,1.52),(1.8,.3,3.05),onyx)
for x in [57.6,59.4]:cube('Lift brass jamb',(x,9.53,1.55),(.13,.2,3.1),brass,.014)
for i in range(11):
    x=57.7+i*.15;line('Lift scissor grille',[(x,9.50,.15),(x+.12,9.5,1.5),(x,9.50,2.9)],.012,brass)
text('Lift sign','OUT OF ORDER',(58.5,9.36,1.7),.13,ivory)
text('Lift dial','I   II   III   IV',(58.5,9.4,3.25),.12,brass)
doorway(61.1,9.78,'T H E   E A S T   P A S S A G E',1.45)
cube('Luggage trunk',(62.2,6.4,.35),(.75,.6,.7),claret,.07)
for x in [61.96,62.42]:cube('Trunk strap',(x,6.39,.35),(.045,.62,.72),brass,.008)
lamp(57.6,5.8,.8)
camera('landing','landing',(61.1,-.2,2.15),(59.9,8,1.5),32)

shell('stairs',90,5,11)
for i in range(12):
    y=4+i*.32;h=(i+1)*.16
    cube('Stair tread',(90,y+.16,h/2),(2.4,.32,h),wood,.008)
    cube('Stair runner',(90,y+.165,h+.01),(1.32,.33,.018),velvet)
    cube('Brass stair rod',(90,y+.018,h+.025),(1.55,.022,.022),brass,.006)
    for s in [-1,1]:
        cyl('Stair spindle',(90+s*1.25,y+.16,h+.45),.022,.9,wood)
        uvball('Spindle bead',(90+s*1.25,y+.16,h+.55),(.043,.043,.075),wood)
cube('Upper landing',(90,9.4,.96),(2.5,3.1,1.92),wood)
for s in [-1,1]:line('Stair handrail',[(90+s*1.25,3.9,1),(90+s*1.25,7.9,2.92),(90+s*1.25,10.5,2.92)],.055,wood)
doorway(90,10.75,'H O N E Y M O O N',1.55)
# Move the upper doorway and ceiling to the landing's elevation.
for o in list(scene.objects):
    if o.location.x>88 and o.location.x<92 and o.location.y>10.5 and o.name.startswith(('Door','Stair')):o.location.z+=1.92
cube('Stair upper ceiling',(90,8,5.6),(5,6,.2),plaster)
for o in scene.objects:
    if o.name.startswith('Room ceiling') and abs(o.location.x-90)<.1:o.location.z=5.6
area('Stair crimson',(88.4,8.7,4.1),(90,6,1.5),(1,.014,.035),190,1.5)
area('Stair cold shaft',(91.5,5.7,4.6),(89,6,1),(.10,.40,1),150,1)
camera('stairs-low','stairs',(91.05,.3,2.15),(89.9,7,2.05),30)
camera('stairs-high','stairs',(90.95,4.5,3.72),(89.8,10.5,3.1),30,6.8)
rooms['stairs']['bounds']=[-.7,.7,2.7,9.7];rooms['stairs']['exit']=9.5

shell('suite',120,5,9)
curtain(118.35,8.8,width=1.5);curtain(121.65,8.8,width=1.5)
doorway(120,8.7,'H O N E Y M O O N\nS U I T E',1.8)
text('Suite zero','0',(120,8.5,3.22),.31,brass)
for x in [118.5,121.5]:
    cube('Suite console',(x,7,.5),(.7,.65,1),wood,.03);lamp(x,7,1.04)
area('Suite red threshold',(120,8.35,3.3),(120,5.5,1),(1,.008,.035),160,1.6)
camera('suite','suite',(120.85,.3,2.04),(120,8.4,1.75),34)
rooms['suite']['exit']=7.3

shell('lounge',150,7,10,True)
curtain(150,9.8,width=6.5)
cube('Bar body',(151.1,7.2,.58),(3.7,.8,1.16),claret,.05);cube('Bar onyx',(151.1,7.2,1.2),(3.9,.95,.12),onyx,.025)
occ('Depth bar',(151.1,7.2,.65),(3.9,.95,1.3))
for z in [1.55,2.2,2.85]:
    cube('Bottle shelf',(151,9.3,z),(3.4,.4,.08),wood,.02)
    for i in range(12):
        x=149.5+i*.27;h=random.uniform(.18,.30);cyl('Bottle',(x,9.23,z+h/2+.05),.055,h,jade if i%3 else claret);cyl('Bottle neck',(x,9.23,z+h+.07),.023,.08,brass)
for x in [149.8,151,152.2]:
    cyl('Bar stool foot',(x,6.15,.12),.22,.07,brass);cyl('Stool stem',(x,6.15,.48),.04,.72,brass);cyl('Velvet stool',(x,6.15,.88),.24,.12,velvet)
lamp(152.4,7.2,1.27,True)
cube('Lounge sofa seat',(147.65,5.2,.48),(.8,2,.3),velvet,.13);cube('Lounge sofa back',(147.3,5.2,.94),(.22,2,1.1),velvet,.1)
area('Bar red velvet',(148,7,2.8),(150,9.7,2),(1,.008,.04),200,1.8)
camera('lounge','lounge',(151,-.4,2.1),(149.8,8,1.5),31)
rooms['lounge']['bounds']=[-1.3,.2,2.7,5.7];rooms['lounge']['exit']=5.5

# Export depth proxies for the additional furnishings only.
bpy.ops.object.select_all(action='DESELECT')
for o in new_occluders:o.select_set(True)
bpy.context.view_layer.objects.active=new_occluders[0]
bpy.ops.export_scene.gltf(filepath=str(OUT/'hotel-occlusion-v3.glb'),export_format='GLB',use_selection=True,export_animations=False)
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='WEBP';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.quality=95
scene.cycles.samples=48;scene.cycles.use_denoising=True;scene.cycles.max_bounces=5;scene.cycles.volume_bounces=1
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for device in prefs.devices:device.use=device.type=='OPTIX'
scene.cycles.device='GPU'
meta={'width':1920,'height':1080,'rooms':rooms,'cameras':cameras,'version':3}
(OUT/'hotel-v3.json').write_text(json.dumps(meta,indent=2))
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'hotel-v3.blend'))
only=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
for c in cameras:
    if only and c['name'] not in only:continue
    scene.camera=bpy.data.objects[c['name']];scene.render.filepath=str(OUT/c['plate']);bpy.ops.render.render(write_still=True);print('PLATE COMPLETE',c['name'],flush=True)
print('HOTEL V3 COMPLETE',flush=True)
