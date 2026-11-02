import sys
from PIL import Image, ImageDraw, ImageFont
FD='/usr/local/lib/python3.13/dist-packages/koreanize_matplotlib/fonts/'
def F(s,w='ExtraBold'): return ImageFont.truetype(FD+f'NanumGothic{w}.ttf',s)
INK=(28,36,52); GOLD=(176,141,74); CREAM=(255,226,160)
def cover(im,w,h,ay=0.5):
    r=max(w/im.width,h/im.height); im=im.resize((int(im.width*r)+1,int(im.height*r)+1),Image.LANCZOS)
    x=(im.width-w)//2; y=int((im.height-h)*ay); return im.crop((x,y,x+w,y+h))
def tag(d,x,y,s,bg,f):
    w=d.textlength(s,font=f); d.rounded_rectangle((x,y,x+w+40,y+f.size+26),14,fill=bg); d.text((x+20,y+10),s,font=f,fill='white')
def make(top,bot,l1,l2,l3,out,ay):
    W,H=1080,1920; im=Image.new('RGB',(W,H),(244,241,234)); half=H//2
    im.paste(cover(Image.open(top).convert('RGB'),W,half),(0,0))
    im.paste(cover(Image.open(bot).convert('RGB'),W,H-half,ay),(0,half))
    d=ImageDraw.Draw(im,'RGBA'); ft=F(34,'Bold')
    tag(d,28,28,'3D 제안서',GOLD,ft); tag(d,28,half+190+28,'실제 완공',INK,ft)
    bh=380; y0=half-bh//2; d.rectangle((0,y0,W,y0+bh),fill=(20,24,32,215))
    def c(y,t,f,col):
        w=d.textlength(t,font=f); d.text(((W-w)/2,y),t,font=f,fill=col)
    c(y0+40,l1,F(56,'Bold'),(255,255,255)); c(y0+120,l2,F(120),CREAM); c(y0+275,l3,F(48,'Bold'),(255,255,255))
    im.save(out,quality=92)
make(*sys.argv[1:7],float(sys.argv[7]))
