"""Original decorative textures. No downloaded film imagery or stock assets."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import random, math
random.seed(1908)
out=Path(__file__).resolve().parents[1]/'assets'/'textures'
out.mkdir(parents=True,exist_ok=True)

def flower(d,x,y,r,col,petals=8):
    for i in range(petals):
        a=i*math.tau/petals
        pts=[]
        for j in range(25):
            t=j*math.tau/24
            u=r*.48*math.cos(t)+r*.52; v=r*.19*math.sin(t)
            pts.append((x+u*math.cos(a)-v*math.sin(a),y+u*math.sin(a)+v*math.cos(a)))
        d.polygon(pts,fill=col)
    d.ellipse((x-r*.12,y-r*.12,x+r*.12,y+r*.12),fill=(130,103,56))

im=Image.new('RGB',(1024,2048),(61,19,24));d=ImageDraw.Draw(im)
for x,w,c in [(32,5,(157,112,60)),(50,2,(96,67,42)),(100,26,(31,41,38)),(124,4,(145,102,60)),(148,2,(164,115,66)),(176,5,(97,56,35))]:
    d.rectangle((x,0,x+w,2048),fill=c);d.rectangle((1024-x-w,0,1024-x,2048),fill=c)
for y in range(-60,2110,128):
    for x in (110,914):flower(d,x,y,30,(145,92,54),6)
for y in range(-128,2200,256):
    for x in range(256,900,256):
        xx=x+(128 if (y//256)%2 else 0)
        if xx>840:continue
        d.polygon([(xx,y-96),(xx+90,y),(xx,y+96),(xx-90,y)],outline=(147,87,51),width=3)
        flower(d,xx,y,65,(109,76,47),8)
        for k in range(4):
            a=k*math.pi/2+math.pi/4
            flower(d,xx+100*math.cos(a),y+100*math.sin(a),23,(128,89,55),5)
px=im.load()
for y in range(im.height):
    for x in range(im.width):
        n=random.randint(-12,12)+(3 if x%3==0 else -2)
        worn=1-.23*math.exp(-((x-510)/180)**2)
        px[x,y]=tuple(max(0,min(255,int(v*worn+n))) for v in px[x,y])
im.save(out/'carpet.png')

im=Image.new('RGB',(512,512),(56,58,37));d=ImageDraw.Draw(im)
for x,y in [(128,128),(384,384),(128,-384),(384,-128)]:
    for side in (-1,1):
        for j in range(5):
            yy=y-90+j*35; xx=x+side*(18+12*j)
            d.arc((xx-30,yy-26,xx+30,yy+26),0 if side==1 else 100,270 if side==1 else 370,fill=(109,102,60),width=3)
            flower(d,xx,yy,13,(91,88,50),5)
    d.line((x,y-110,x,y+110),fill=(101,96,53),width=3)
    flower(d,x,y-70,30,(112,103,61),6)
    flower(d,x,y+90,22,(112,103,61),4)
px=im.load()
for y in range(512):
    for x in range(512):
        n=random.randint(-6,6);px[x,y]=tuple(max(0,min(255,v+n)) for v in px[x,y])
im.save(out/'wallpaper.png')

# A fictional, deliberately faded landscape painting, painted procedurally.
im=Image.new('RGB',(768,1024));px=im.load()
for y in range(1024):
    for x in range(768):
        t=y/1024;n=random.randint(-8,8)
        px[x,y]=(int(67-30*t)+n,int(65-30*t)+n,int(49-20*t)+n)
d=ImageDraw.Draw(im)
for k in range(5):
    yy=430+k*85
    pts=[(0,1024)]+[(x,yy+55*math.sin(x*.009+k)+25*math.sin(x*.03)) for x in range(0,770,5)]+[(768,1024)]
    d.polygon(pts,fill=(38-k*4,44-k*5,31-k*3))
for x in (110,160,650):
    d.line((x,900,x+20,180),fill=(22,24,16),width=15)
    for j in range(12):
        yy=220+j*45;d.line((x+15,yy,x+random.randint(-110,110),yy-90),fill=(27,30,19),width=7)
im=im.filter(ImageFilter.GaussianBlur(1.2));im.save(out/'painting.png')
print('Original carpet, wallpaper and landscape textures written.')
