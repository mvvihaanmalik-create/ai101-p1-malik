"""Seamless stone and dark walnut for the live washroom and baggage furniture."""
from pathlib import Path

import numpy as np
from PIL import Image

assets = Path(__file__).resolve().parents[1] / "assets"
size = 1024
rng = np.random.default_rng(3181)
y, x = np.mgrid[0:size, 0:size].astype(np.float32) / size


def field(cols, rows):
    # Wrap the last cell into the first so that wide slabs and rails can tile.
    grid = rng.random((rows, cols), dtype=np.float32)
    u, v = x * cols, y * rows
    i, j = u.astype(int), v.astype(int)
    a, b = u-i, v-j
    a, b = a*a*(3-2*a), b*b*(3-2*b)
    return ((1-a)*(1-b)*grid[j, i]+a*(1-b)*grid[j, (i+1)%cols]
            +(1-a)*b*grid[(j+1)%rows, i]+a*b*grid[(j+1)%rows, (i+1)%cols])


def save(name, color):
    Image.fromarray(np.uint8(np.clip(color, 0, 255))).save(assets / name, quality=94, method=5)


broad = field(5, 5)
warp = .30*broad+.09*field(13, 9)+.023*field(61, 36)
seam = np.abs(np.sin(2*np.pi*(x+2*y+warp)))
mineral = np.exp(-seam*95)*(.2+.8*field(14, 15))+.21*np.exp(-seam*14)
base = 13*broad+7*field(33, 27)+3*field(110, 108)
save("verde-marble-v31.webp", np.array([28, 39, 35])+base[..., None]+mineral[..., None]*[80, 78, 65])
bend = .052*field(3, 5)+.013*field(12, 16)
growth = (.5+.5*np.cos(2*np.pi*(15*y+bend*28)))**5
wood = 24*field(4, 58)+9*field(12, 248)-11*growth+8*field(2, 9)
save("smoked-walnut-v31.webp", np.array([50, 31, 23])+wood[..., None]*[1.08, .84, .69])
