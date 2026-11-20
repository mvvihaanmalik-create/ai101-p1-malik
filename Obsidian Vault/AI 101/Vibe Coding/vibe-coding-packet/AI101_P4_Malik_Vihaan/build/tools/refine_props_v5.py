from pathlib import Path
path=Path(__file__).with_name('build_props_v5.py');source=path.read_text()
start=source.index('# A photographic founder portrait');end=source.index('# Extract the fitted jacket')
exec(compile(source[:start]+source[end:],str(path),'exec'))
