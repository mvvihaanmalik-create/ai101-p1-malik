from pathlib import Path
import zipfile,json,hashlib
root=Path(__file__).resolve().parents[1]
archive=root/'tools/vendor/makehuman_system_assets_cc0.zip'
out=root/'tools/vendor/makehuman-data';out.mkdir(parents=True,exist_ok=True)
selected=['skins/middleage_caucasian_male/','skins/old_caucasian_male/','clothes/male_elegantsuit01/','clothes/shoes03/','hair/short01/','hair/short04/','eyes/','eyebrows/eyebrow001/','eyelashes/eyelashes01/','teeth/teeth_base/','tongue/tongue01/','packs/']
with zipfile.ZipFile(archive) as z:
    for name in z.namelist():
        if any(name.startswith(p) for p in selected):
            dest=(out/name).resolve()
            if not dest.is_relative_to(out.resolve()):raise ValueError('Archive path outside destination')
            z.extract(name,out)
    pack=json.loads(z.read('packs/makehuman_system_assets.json'))
    names=['middleage_caucasian_male','old_caucasian_male','male_elegantsuit01','shoes03','short01','short04','high-poly','eyebrow001','eyelashes01','teeth_base','tongue01']
    evidence={k:pack[k] for k in names if k in pack}
    (out/'selected-licenses.json').write_text(json.dumps(evidence,indent=2))
print('Asset pack SHA256:',hashlib.sha256(archive.read_bytes()).hexdigest())
print('Extracted selected CC0 assets:',list(evidence))
