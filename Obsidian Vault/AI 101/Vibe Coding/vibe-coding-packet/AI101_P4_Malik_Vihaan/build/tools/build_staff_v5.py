"""Distinct fitted hotel staff, from the retained CC0 character library."""
from pathlib import Path
import zipfile,ast
ROOT=Path(__file__).resolve().parents[1]
with zipfile.ZipFile(ROOT/'tools/vendor/makehuman_system_assets_cc0.zip') as z:
 for name in z.namelist():
  if name.startswith('skins/young_caucasian_female2/') and not name.endswith('/'):
   p=ROOT/'tools/vendor/makehuman-data'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(z.read(name))
source=(ROOT/'tools/build_characters_v2.py').read_text().split('guest,guestRig=make_character')[0]
source=source.replace('subdiv_levels=1','subdiv_levels=0').replace('mod.levels=1','mod.levels=0').replace("'-v2.glb'","'-v5.glb'")
source=source.replace("for k,val in props.items():", "props.update({'gender':.15 if name=='Attendant' else 1.,'age':.36 if name=='Attendant' else .72,'weight':.42 if name=='Attendant' else .65,'muscle':.28 if name=='Attendant' else .45,'height':.48 if name=='Attendant' else .53})\n    for k,val in props.items():")
source=source.replace("skin='old_caucasian_male' if old else 'middleage_caucasian_male'", "skin='young_caucasian_female2' if name=='Attendant' else 'middleage_caucasian_male'")
source=source.replace("'short04' if old else 'short01'", "'short04' if name=='Porter' else 'short01'")
source=source.replace("objects=[holder]+list(holder.children_recursive)","objects=[holder]+[o for o in holder.children_recursive if not any(k in o.name for k in ['teeth_base','tongue01'])]")
exec(compile(source,str(ROOT/'tools/build_characters_v2.py'),'exec'))
tree=ast.parse((ROOT/'tools/build_characters_v3.py').read_text());exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='pose'],type_ignores=[]),'<pose>','exec'))
staff,staffRig=make_character('Attendant',False);staff.location.x=-.8
porter,porterRig=make_character('Porter',False);porter.location.x=.8
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'staff-v5.blend'));print('STAFF V5 COMPLETE',flush=True)
