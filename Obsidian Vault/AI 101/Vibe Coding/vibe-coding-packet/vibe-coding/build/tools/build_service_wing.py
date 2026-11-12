"""Render the walkable pantry and baggage office and the bar's inspection angle."""
from pathlib import Path
import ast,json,math,random
import bpy
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'hotel-v14.blend'))
scene=bpy.context.scene
def helpers(file,names):
    tree=ast.parse((ROOT/'tools'/file).read_text())
    exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in names],type_ignores=[]),file,'exec'),globals())
helpers('build_scene.py',{'mat','grain','finish','cyl','text','area','point','uvball','line','quad'})
helpers('build_hotel_v3.py',{'cube','doorway','lamp','shell'})
wood,darkwood,brass,ivory,wall,carpet,velvet,black,plaster,shade,claret,jade,cream,onyx=[bpy.data.materials[n] for n in ['Hand-rubbed walnut','Recessed walnut','Aged brass','Old ivory','Faded olive damask','Worn oxblood runner','Curtain velvet','Blackened iron','Smoked plaster','Amber linen shade','Claret lacquer','Jade glass','Ivory marble','Black marble']]
meta=json.loads((OUT/'hotel-v15.json').read_text())
rooms={}
rng=random.Random(71)
shell('pantry',180,6.6,10,True)
shell('baggage',210,6.6,10)
tile=mat('Celadon glazed tile',(.18,.29,.23),.24)
bottle=mat('Brown apothecary glass',(.12,.044,.012),.18,.18)
for i in range(13):
    for j in range(6):
        cube('Glazed tile',(177.0+i*.50,9.71,.27+j*.5),(.49,.06,.49),tile,.009)
doorway(178.1,9.53,'STAFF  STAIR',1.1)
for z in (1.18,1.93,2.64):
    cube('Pantry plate rack',(181.0,9.22,z),(3.12,.61,.07),darkwood,.017)
    for k in range(7):
        x=179.8+k*.39
        if k%3==1:
            cyl('Amber jar',(x,9.15,z+.16),.093,.25,bottle)
            cyl('Lid',(x,9.15,z+.30),.091,.03,brass)
        else:
            for n in range(3+(k+int(z*3))%4):
                cyl('Ivory saucer',(x,9.2,z+.052+n*.027),.173,.027,ivory,r2=.14)
text('Pantry sign','S I L V E R   P A N T R Y',(180.8,9.54,3.06),.185,brass)
for x in [179.3,181.65]:
    cyl('Pendant stem',(x,7.90,3.31),.013,.66,brass)
    cyl('Green enamel shade',(x,7.90,2.96),.27,.21,jade,r2=.09)
    point('Pantry pendant',(x,7.85,2.76),(1,.70,.42),63,.20)
area('Pantry window',(177.1,5.5,2.8),(180.4,7.7,.95),(.40,.63,.72),175,2.3)
doorway(208.05,9.52,'STAFF  STAIR',1.12)
for x in (209.52,210.96,212.40):
    for edge in [-.70,.70]:cube('Rack stile',(x+edge,8.91,1.55),(.065,1.03,3.10),darkwood,.012)
    for row in range(4):
        z=.22+row*.77
        cube('Trunk shelf',(x,8.95,z),(1.46,1.03,.07),wood,.012)
        for col in range(2):
            w=rng.uniform(.48,.62);h=rng.uniform(.24,.42);cx=x-.34+col*.68;cy=8.90+rng.uniform(-.12,.15)
            cube('Steamer case',(cx,cy,z+.04+h/2),(w,.50,h),[claret,darkwood,velvet][rng.randrange(3)],.043)
            for sx in (-.30,.30):cube('Case strap',(cx+w*sx,cy,z+.042+h/2),(.027,.507,h+.014),brass,.004)
            cube('Ivory ticket',(cx,cy-.257,z+h*.55),(.094,.01,.053),ivory,.002)
text('Baggage sign','B A G G A G E   O F F I C E',(210.84,9.50,3.22),.145,ivory)
lamp(207.55,6.5,1.02)
area('Baggage key',(208.0,5.7,2.85),(210.5,7.4,1.2),(1,.53,.25),205,2.1)
area('Baggage rim',(212.3,8.3,2.9),(210.5,6,1),(.30,.58,.60),120,1.3)
shots=[('pantry','pantry',(181.35,.7,2.14),(179.95,7.45,1.38),33),
       ('pantry-service','pantry',(179.22,4.55,1.74),(180.75,7.20,1.23),37),
       ('baggage','baggage',(211.40,.8,2.16),(209.95,7.5,1.38),33),
       ('baggage-mirror','baggage',(208.99,4.46,1.65),(210.83,7.7,1.43),37),
       ('bar-counter','lounge',(149.58,3.56,1.79),(150.85,7.21,1.45),39)]
scene.render.engine='CYCLES';scene.cycles.samples=18;scene.cycles.use_denoising=True
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for device in prefs.devices:device.use=device.type=='OPTIX'
scene.cycles.device='GPU';scene.render.resolution_percentage=100;scene.render.resolution_x=1920;scene.render.resolution_y=1080
scene.render.image_settings.file_format='WEBP';scene.render.image_settings.quality=94
scene.render.use_sequencer=False
for name,room,pos,look,lens in shots:
    d=bpy.data.cameras.new(name);cam=bpy.data.objects.new(name,d);scene.collection.objects.link(cam)
    cam.location=pos;cam.rotation_euler=(Vector(look)-cam.location).to_track_quat('-Z','Y').to_euler();d.lens=lens;d.sensor_fit='HORIZONTAL';scene.camera=cam
    plate=name+'-v27.webp';scene.render.filepath=str(OUT/'masters-v18'/plate);bpy.ops.render.render(write_still=True)
    proxy=bpy.data.images.load(scene.render.filepath);proxy.scale(960,540);proxy.filepath_raw=str(OUT/'proxies-v18'/plate);proxy.file_format='WEBP';proxy.save();bpy.data.images.remove(proxy)
    cv=lambda v:[v[0],v[2],-v[1]]
    view=dict(name=name+'-v27',room=room,position=cv(pos),target=cv(look),fov=math.degrees(2*math.atan(36/(2*lens)/(16/9))),plate=plate,minY=0)
    ix=next((i for i,c in enumerate(meta['cameras']) if c['name']==view['name']),len(meta['cameras']))
    if ix==len(meta['cameras']):meta['cameras'].append(view)
    else:meta['cameras'][ix]=view
    if name==room:
        meta['rooms'][room]=dict(origin=pos[0]//30*30,bounds=[-1.38,-.15,2.7,8.05],entry=[-.55,3.42],exit=7.88,views=[ix])
    else:meta['details'][{'pantry-service':'service','baggage-mirror':'luggage','bar-counter':'bar'}[name]]=ix
(OUT/'hotel-v15.json').write_text(json.dumps(meta,indent=2)+'\n')
