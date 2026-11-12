"""Build the fitted face and hair foundation; preserve the guest-facing animation rig."""
from pathlib import Path
from zipfile import ZipFile
import bpy

root=Path(__file__).resolve().parents[1]
data=root/'tools/vendor/makehuman-data'
with ZipFile(root/'tools/vendor/makehuman_system_assets_cc0.zip') as archive:
    for entry in archive.infolist():
        if entry.is_dir() or not entry.filename.startswith(('hair/long01/','clothes/female_elegantsuit01/','skins/young_caucasian_female2/')):
            continue
        dest=(data/entry.filename).resolve()
        if not dest.is_relative_to(data.resolve()):raise ValueError(entry.filename)
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(archive.read(entry))

shape={
 'head/head-oval':.57,'head/head-scale-vert-decr':.16,
 'chin/chin-width-decr':.36,'chin/chin-height-decr':.20,'chin/chin-prominent-incr':.16,
 'forehead/forehead-temple-incr':.20,'nose/nose-scale-horiz-decr':.18,
 'nose/nose-scale-vert-incr':.17,'nose/nose-point-width-incr':.14,
 'mouth/mouth-scale-horiz-incr':.55,'mouth/mouth-lowerlip-volume-incr':.40,
 'mouth/mouth-upperlip-volume-incr':.25,'mouth/mouth-cupidsbow-incr':.18,
 'mouth/mouth-angles-up':.38,'mouth/mouth-laugh-lines-in':.29,
 'eyebrows/eyebrows-angle-up':.31,
 'expression/units/caucasian/mouth-corner-puller':.49,
 'expression/units/caucasian/mouth-open':.24,
 'expression/units/caucasian/mouth-elevation':.18,
}
for side in ('l','r'):
    shape.update({f'cheek/{side}-cheek-bones-incr':.39,f'cheek/{side}-cheek-volume-incr':.34,
                  f'cheek/{side}-cheek-trans-up':.25,f'eyes/{side}-eye-scale-incr':.20,
                  f'eyes/{side}-eye-corner2-up':.17})
factory=root/'tools/build_characters_v2.py'
source=factory.read_text().split('guest,guestRig=make_character')[0]
source=source.replace('for k,val in props.items():',"props.update(gender=.02,age=.48,height=.61,weight=.46,muscle=.35)\n    for k,val in props.items():")
source=source.replace("    if old:\n        for target", """    for path,weight in face_shape.items():
        TargetService.load_target(body,str(Path(LocationService.get_mpfb_data('targets'))/(path+'.target.gz')),weight=weight)
    bpy.context.view_layer.update()
    if old:
        for target""",1)
source=source.replace("skin='old_caucasian_male' if old else 'middleage_caucasian_male'","skin='young_caucasian_female2'")
source=source.replace("'short04' if old else 'short01'","'long01'").replace("'male_elegantsuit01'","'female_elegantsuit01'")
source=source.replace('subdiv_levels=1','subdiv_levels=0')
# Retain the inner mouth for the smile. The final groom and export share this rig.
source=source[:source.index('    bpy.ops.export_scene.gltf(')]+'    rig.animation_data.action=actions[0];scene.frame_set(1)\n    return holder,rig\n'
scope={'__file__':str(factory),'face_shape':shape}
exec(compile(source,str(factory),'exec'),scope)
holder,rig=scope['make_character']('Receptionist',False)
for o in rig.children_recursive:
    if o.type=='MESH':
        coords=[v.co for v in o.data.vertices]
        print('BOUNDS',o.name,[(min(v[i] for v in coords),max(v[i] for v in coords)) for i in range(3)],flush=True)
bpy.ops.file.pack_all()
out=root.parent/'build-record/tests/receptionist-22/base.blend'
out.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(out))

