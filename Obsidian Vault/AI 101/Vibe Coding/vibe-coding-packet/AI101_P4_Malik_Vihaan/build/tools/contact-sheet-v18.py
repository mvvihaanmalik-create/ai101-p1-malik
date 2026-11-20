from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=root.parent/'build-record/tests/visual-18'
sheet=Image.new('RGB',(1440,894),'#171416');d=ImageDraw.Draw(sheet)
title=ImageFont.truetype(str(root/'assets/fonts/cinzel-600.ttf'),31)
label=ImageFont.truetype(str(root/'assets/fonts/ibm-plex-sans-500.ttf'),18)
d.text((24,12),'ROOM 0   /   THE HOTEL',fill='#ead9b7',font=title)
for i,(shot,name) in enumerate([('desk','01   /   Reception'),('gallery','02   /   West gallery'),('porter-recognizes-case','03   /   Left luggage'),('suite-door','04   /   Honeymoon suite')]):
    x=24+(i%2)*704;y=73+(i//2)*402
    img=Image.open(out/'after'/(shot+'.jpg')).resize((688,387),Image.Resampling.LANCZOS)
    # Reserve a narrow caption strip, separate from the unaltered picture.
    img.thumbnail((650,366),Image.Resampling.LANCZOS);sheet.paste(img,(x,y))
    d.text((x,y+368),name,font=label,fill='#d5b990')
sheet.save(out/'hotel-stills.jpg',quality=92,subsampling=0)

