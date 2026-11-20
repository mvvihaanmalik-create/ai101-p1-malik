from pathlib import Path
p=Path(__file__).with_name('build_ending_v6.py');s=p.read_text().split('# Matched closer/reverse shots')[0];exec(compile(s,str(p),'exec'))
