import numpy as np, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
FD='/usr/local/lib/python3.13/dist-packages/koreanize_matplotlib/fonts/'
def F(s,w='ExtraBold'): return ImageFont.truetype(FD+f'NanumGothic{w}.ttf',s)
W,H,FPS=1080,1920,30
BG=(244,241,234); INK=(28,36,52); GOLD=(176,141,74); OLIVE=(110,112,74)
S='/tmp/shorts/src/'
def load(i): return Image.open(S+i+'.jpg').convert('RGB')
def cover(im,w,h,z=1.0,dx=0.0):
    r=max(w/im.width,h/im.height)*z; im2=im.resize((int(im.width*r)+1,int(im.height*r)+1),Image.LANCZOS)
    x=int((im2.width-w)/2+dx*(im2.width-w)/2); y=(im2.height-h)//2
    return im2.crop((x,y,x+w,y+h))
def ease(t): t=max(0,min(1,t)); return t*t*(3-2*t)
def ctext(d,y,s,f,fill,stroke=0,sf=None):
    w=d.textlength(s,font=f); d.text(((W-w)/2,y),s,font=f,fill=fill,stroke_width=stroke,stroke_fill=sf)
def tag(d,x,y,s,bg,fg=(255,255,255)):
    f=F(30,'Bold'); w=d.textlength(s,font=f); d.rounded_rectangle((x,y,x+w+36,y+52),12,fill=bg); d.text((x+18,y+9),s,font=f,fill=fg)

R={'living1':'1chUbn0-ftK3-3ILpIZK7s0XLtnyvSQ72','living2':'1KFiDsm9wX9uA3yRDDA1sfpuZBKcCopA7','kitchen1':'1Q5nSHxhdAAyQjw_3tc6HBZ5JmpZJWfgK',
   'hall':'1fi_ELfHL36WrIO4n4GvbEZR1C1PWvOfB','bath':'1GgL84ipRwqHyUn9hvlWq5d_GY_ukAvnY','master':'1H0NLZOoJEIabFxrDNQDPSTuvqhZkMjX2'}
# (3D, 현장사진, 날짜, 공정, 포인트)
SC=[('kitchen1','1TQIMNxo-NenKLYjHolowAMfkQn8nPOuc','공사 전','원래 모습','원래 있던 아트월과 주방'),
    ('bath','10RL1i5CPs87iH1eT2P79Fl0t1zqJCXSO','D+3','욕실 철거','벽돌까지 전부 드러냈어요'),
    ('living2','12kkg-VEnGbM7eJNDaVRwRKGdVcQO3SVr','D+12','목공','천장·벽 목공 시작'),
    ('hall','1MrVJ1tvpU2e3N9AAz1aS_17rZvPqYq3O','D+12','목공','새 벽을 세워 공간을 나눠요'),
    ('bath','1AiigLLlwDWJv1LPiJI2Mj6c69B_X4b4P','D+19','욕실 타일','벽 타일 붙이는 날'),
    ('bath','1e_bnCKky6cb7GSnsMKlXhpO5SMiKqUyO','D+25','욕실 세팅','벽걸이 변기 · 코너 선반'),
    ('master','1DT4T4-rZWIjQV7F4Tyx_Lr9LWm5wpuTv','D+33','도배','안방'),
    ('living1','1goj0z-_OVypOOH76S_57Lc23tjC_1xm0','D+33','도배','거실, 3D 속 바로 그 자리')]
HOOK=2.6; SD=2.9; END=4.6
TOTAL=HOOK+SD*len(SC)+END
IMGS={k:load(v) for k,v in R.items()}
PH={s[1]:load(s[1]) for s in SC}
TOPY,BOX=250,760; MIDY=TOPY+BOX; BOTY=MIDY+90
def header(d):
    ctext(d,70,'구리 인창 우림필유 46평',F(54),INK)
    ctext(d,150,'3D 제안서  vs  공사 현장',F(40,'Bold'),GOLD)
def hook(t):
    im=cover(IMGS['living1'],W,H,1.12-0.06*t/HOOK).filter(ImageFilter.GaussianBlur(0))
    im=ImageEnhance.Brightness(im).enhance(0.92); d=ImageDraw.Draw(im,'RGBA')
    d.rectangle((0,560,W,1060),fill=(20,24,32,150))
    a=ease(t/0.5)
    ctext(d,610,'계약 전에 보여드린 3D',F(52,'Bold'),(255,255,255))
    ctext(d,700,'이대로 될까?',F(110),(255,226,160))
    ctext(d,860,'철거부터 도배까지 33일, 따라가 봤어요',F(44,'Bold'),(255,255,255))
    tag(d,60,1120,'3D 제안서',GOLD)
    return im
def scene(i,t):
    top,ph,day,step,pt=SC[i]
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im,'RGBA'); header(d)
    z=1.0+0.04*t/SD
    im.paste(cover(IMGS[top],W,BOX,z),(0,TOPY))
    tag(d,30,TOPY+24,'3D 제안서',GOLD)
    # 하단 현장 사진: 왼쪽에서 열림
    p=cover(PH[ph],W,BOX,1.04-0.04*t/SD); k=ease(t/0.45); w=max(1,int(W*k))
    im.paste(p.crop((0,0,w,BOX)),(0,BOTY))
    if w<W: d.rectangle((w,BOTY,W,BOTY+BOX),fill=(225,220,210))
    d.line((w-2,BOTY,w-2,BOTY+BOX),fill=GOLD,width=6) if w<W else None
    tag(d,30,BOTY+24,'실제 현장',INK)
    # 가운데 띠: 날짜·공정
    d.rectangle((0,MIDY,W,BOTY),fill=INK)
    f1=F(46); f2=F(40,'Bold')
    s1=f'{day}  ·  {step}'; d.text((40,MIDY+18),s1,font=f1,fill=(255,226,160))
    # 진행 바
    prog=(i+ease(t/SD))/len(SC); d.rectangle((0,BOTY-6,int(W*prog),BOTY),fill=GOLD)
    # 포인트 문구 (사진 위, 안전영역 안)
    a=int(255*ease((t-0.4)/0.4))
    if a>0:
        ft=F(44,'Bold'); tw=d.textlength(pt,font=ft)
        d.rounded_rectangle((30,BOTY+96,30+tw+40,BOTY+170),14,fill=(20,24,32,int(a*0.75)))
        d.text((50,BOTY+106),pt,font=ft,fill=(255,255,255,a))
    return im
def ending(t):
    im=cover(IMGS['living1'],W,H,1.0+0.04*t/END); im=ImageEnhance.Brightness(im).enhance(0.55)
    d=ImageDraw.Draw(im,'RGBA')
    ctext(d,430,'D+33, 도배까지 끝',F(56,'Bold'),(255,255,255))
    ctext(d,530,'3D 그대로 나왔을까?',F(84),(255,226,160))
    ctext(d,670,'완공 공개는 다음 편에서',F(50,'Bold'),(255,255,255))
    if t>1.2:
        a=int(255*ease((t-1.2)/0.5))
        d.rectangle((0,860,W,1180),fill=(20,24,32,int(a*0.8)))
        ctext(d,900,'공간을 설계하는 홈퍼니싱',F(46,'Bold'),(255,255,255,a))
        ctext(d,965,'취향을 디자인하는 아르띠꼬',F(46,'Bold'),(255,255,255,a))
        ctext(d,1050,'디자인 · 설계 · 실내건축  |  상담 1566-5904',F(36,'Bold'),(255,226,160,a))
    return im
def frame(t):
    if t<HOOK: return hook(t)
    t2=t-HOOK
    if t2<SD*len(SC): i=int(t2//SD); return scene(i,t2-i*SD)
    return ending(t2-SD*len(SC))
if __name__=='__main__':
    import sys
    if len(sys.argv)>1:
        for ts in sys.argv[1:]: frame(float(ts)).save(f'/tmp/shorts/out/prev_{ts}.jpg',quality=85)
        sys.exit()
    n=int(TOTAL*FPS)
    p=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
       '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','/tmp/shorts/out/video_noaudio.mp4'],stdin=subprocess.PIPE)
    for k in range(n): p.stdin.write(frame(k/FPS).tobytes())
    p.stdin.close(); p.wait(); print('frames',n,'sec',TOTAL)
