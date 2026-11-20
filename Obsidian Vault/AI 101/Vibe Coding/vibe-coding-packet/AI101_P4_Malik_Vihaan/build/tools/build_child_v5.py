"""Proper child proportions from the already licensed CC0 MakeHuman library."""
from pathlib import Path
import zipfile,ast
ROOT=Path(__file__).resolve().parents[1]
with zipfile.ZipFile(ROOT/'tools/vendor/makehuman_system_assets_cc0.zip') as z:
    for name in z.namelist():
        if name.startswith('skins/young_caucasian_male/') and not name.endswith('/'):
            dest=ROOT/'tools/vendor/makehuman-data'/name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(name))
source=(ROOT/'tools/build_characters_v2.py').read_text().split("guest,guestRig=make_character")[0]
source=source.replace('subdiv_levels=1','subdiv_levels=0').replace('mod.levels=1','mod.levels=0')
source=source.replace("'age':.98 if old else .52","'age':.98 if old else .12")
source=source.replace("'height':.61 if old else .55","'height':.61 if old else .40")
source=source.replace("'muscle':.30 if old else .52","'muscle':.30 if old else .30")
source=source.replace("'middleage_caucasian_male'","'young_caucasian_male'")
source=source.replace("'-v2.glb'","'-v5.glb'")
source=source.replace("objects=[holder]+list(holder.children_recursive)","objects=[holder]+[o for o in holder.children_recursive if not any(k in o.name for k in ['teeth_base','tongue01'])]")
exec(compile(source,str(ROOT/'tools/build_characters_v2.py'),'exec'))
tree=ast.parse((ROOT/'tools/build_characters_v3.py').read_text())
code=ast.unparse(next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='pose')).replace('else 0.62','else 0.36')
exec(code)
child,rig=make_character('Child',False)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'child-v5.blend'))
print('CHILD V5 COMPLETE',flush=True)
