"""Fit the desk receptionist from the previously retained MakeHuman CC0 pack."""
from pathlib import Path
from zipfile import ZipFile
import bpy

root=Path(__file__).resolve().parents[1]
pack=root/'tools/vendor/makehuman_system_assets_cc0.zip'
folders=('hair/bob02/', 'clothes/female_elegantsuit01/', 'skins/young_caucasian_female2/')
data=root/'tools/vendor/makehuman-data'
with ZipFile(pack) as archive:
    for entry in archive.infolist():
        if entry.is_dir() or not entry.filename.startswith(folders):
            continue
        dest=(data/entry.filename).resolve()
        if not dest.is_relative_to(data.resolve()):
            raise ValueError(entry.filename)
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(archive.read(entry))

factory=root/'tools/build_characters_v2.py'
source=factory.read_text().split('guest,guestRig=make_character')[0]
source=source.replace("for k,val in props.items():","props.update(gender=.03,age=.47,height=.61,weight=.46,muscle=.35)\n    for k,val in props.items():")
source=source.replace("skin='old_caucasian_male' if old else 'middleage_caucasian_male'","skin='young_caucasian_female2'")
source=source.replace("'short04' if old else 'short01'","'bob02'").replace("'male_elegantsuit01'","'female_elegantsuit01'")
source=source.replace("subdiv_levels=1","subdiv_levels=0").replace("mod.levels=1","mod.levels=0")
source=source.replace("objects=[holder]+list(holder.children_recursive)","objects=[holder]+[o for o in holder.children_recursive if not any(k in o.name for k in ('teeth_base','tongue01'))]")
source=source.replace("'-v2.glb'","'-v20.glb'")
scope={'__file__':str(factory)}
exec(compile(source,str(factory),'exec'),scope)
scope['make_character']('Receptionist',False)
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(root/'assets/receptionist-v20.blend'))

