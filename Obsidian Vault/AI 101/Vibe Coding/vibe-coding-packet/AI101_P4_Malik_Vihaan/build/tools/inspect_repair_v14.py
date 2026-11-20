import bpy, json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
files=list((root.parent/'sources/assets/german-shepherd/unpacked').rglob('*.blend'))
report={}
for file in files:
 bpy.ops.wm.open_mainfile(filepath=str(file))
 report[str(file.relative_to(root.parent))]={'objects':[{ 'name':o.name,'type':o.type,'dimensions':list(o.dimensions),'vertices':len(o.data.vertices) if o.type=='MESH' else 0,'bones':[{ 'name':b.name,'head':list(b.head_local),'tail':list(b.tail_local)} for b in o.data.bones] if o.type=='ARMATURE' else []} for o in bpy.context.scene.objects], 'images':[{'name':im.name,'size':list(im.size),'packed':bool(im.packed_file)} for im in bpy.data.images]}
(root.parent/'build-record/tests/repairs-14/dog-source-inspection.json').write_text(json.dumps(report,indent=2))
print('INSPECTED',len(files),'files',flush=True)
