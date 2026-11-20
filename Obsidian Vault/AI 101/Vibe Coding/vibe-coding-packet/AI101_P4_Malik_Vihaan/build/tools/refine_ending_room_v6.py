from pathlib import Path
p=Path(__file__).with_name('build_ending_v6.py');s=p.read_text();prefix=s[:s.index("bpy.ops.wm.open_mainfile")];body=s[s.index('# Matched closer/reverse shots'):];exec(compile(prefix+body,str(p),'exec'))
