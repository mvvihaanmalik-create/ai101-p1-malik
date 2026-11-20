from pathlib import Path
path=Path(__file__).with_name('build_props_v5.py')
exec(compile(path.read_text().split('# Extract the fitted jacket')[0],str(path),'exec'))
print('FOUNDER V5 COMPLETE',flush=True)
