"""Finish the camera-locked Blender renders at their native resolution."""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ASSETS = Path(__file__).resolve().parents[1] / "assets"
# Room-specific darkroom timing: RGB transmission away from practicals,
# warmth of the practical, exposure in stops over the surrounding room.
LOOKS = {
    "corridor": ((.86, .94, 1.04), (1.14, 1.01, .89), .33),
    "reception": ((.93, .86, .98), (1.09, 1.06, .88), .48),
    "stairs": ((.81, .96, 1.09), (1.17, .98, .96), .43),
    "landing": ((.84, .95, 1.02), (1.12, 1.04, .84), .40),
    "suite": ((.96, .84, .96), (1.16, 1.05, .86), .52),
    "pantry": ((.77, .98, .99), (1.12, 1.06, .89), .39),
    "baggage": ((.83, .94, 1.01), (1.17, 1.02, .85), .42),
    "lounge": ((.94, .84, .98), (1.10, 1.04, .92), .46),
    "ending": ((.77, .94, .96), (1.11, 1.0, .89), .36),
}
# Optical centres of the practical lights in the wide shots. Detail shots
# derive their lighting masks from the actual rendered lamps and surfaces.
PRACTICALS = {
    "reception": (.74, .48), "lounge": (.76, .49), "landing": (.41, .31),
    "stairs-low": (.29, .26), "stairs-high": (.18, .52), "suite": (.53, .58),
    "pantry-v27": (.59, .32), "baggage-v27": (.34, .51),
    "corridor-near": (.21, .36), "corridor-middle": (.15, .27), "corridor-far": (.76, .34),
}


def finish(filename, room, shot):
    master = Image.open(ASSETS / "masters-v18" / filename).convert("RGB")
    width, height = master.size
    # A low-frequency exposure mask lets the practicals keep their pools while
    # the unlit walls recede. All variants of a camera share its light direction.
    guide = master.resize((240, 135), Image.Resampling.LANCZOS).convert("L")
    broad = np.asarray(guide.filter(ImageFilter.GaussianBlur(8)), dtype=np.float32) / 255
    pool = np.clip((broad - .026) / .32, 0, 1)
    if shot in PRACTICALS:
        x, y = PRACTICALS[shot]
        yy, xx = np.mgrid[0:135, 0:240]
        pool = np.maximum(pool, .86 * np.exp(-((xx / 239 - x) / .25)**2 - ((yy / 134 - y) / .40)**2))
    field = Image.fromarray((pool * 255).astype("uint8")).resize((width, height), Image.Resampling.BICUBIC)
    light = np.asarray(field, dtype=np.float32)[..., None] / 255
    shadow, lamp, stops = LOOKS[room]
    encoded = np.asarray(master, dtype=np.float32) / 255
    linear = np.where(encoded <= .04045, encoded / 12.92, ((encoded + .055) / 1.055)**2.4)
    for ch in range(3):
        gain = (shadow[ch] + (lamp[ch] - shadow[ch]) * light[..., 0]) * np.exp2(-.27 + stops * light[..., 0])
        linear[..., ch] *= gain
    # Preserve texture in practical lamps and keep the darkest wood out of pure black.
    result = np.where(linear < .0031308, 12.92 * linear, 1.055 * np.maximum(linear, 0)**(1/2.4) - .055)
    result = np.minimum(result, .9) + .1 * (1 - np.exp(-np.maximum(0, result - .9) / .1))
    result = Image.fromarray(np.uint8(np.clip(result * 255 + .5, 0, 255)))
    master_out = ASSETS / "masters-v31" / filename
    # Small-radius acutance on native edges, with a threshold to spare render noise.
    result.filter(ImageFilter.UnsharpMask(.95, 94, 3)).save(master_out, quality=94, method=4)
    with Image.open(ASSETS / "proxies-v18" / filename) as old_proxy:
        proxy = result.resize(old_proxy.size, Image.Resampling.LANCZOS)
    proxy.filter(ImageFilter.UnsharpMask(.65, 65, 3)).save(ASSETS / "proxies-v31" / filename, quality=84, method=4)


if __name__ == "__main__":
    for directory in ("masters-v31", "proxies-v31"):
        (ASSETS / directory).mkdir(exist_ok=True)
    hotel = json.loads((ASSETS / "hotel-v15.json").read_text())
    files = {}
    for index, camera in enumerate(hotel["cameras"]):
        for file in [camera["plate"]] + [v.get(str(index)) for v in hotel["variants"].values()]:
            if file:
                files[file] = (camera["room"], camera["name"])
    for shot in json.loads((ASSETS / "ending-v6.json").read_text())["shots"]:
        files[shot["plate"]] = ("ending", shot["name"])
    for file, (room, shot) in files.items():
        finish(file, room, shot)
    print(f"Finished {len(files)} native plates and matching proxies.")
