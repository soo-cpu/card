import numpy as np, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
FD='/usr/local/lib/python3.13/dist-packages/koreanize_matplotlib/fonts/'
def F(s,w='ExtraBold'): return ImageFont.truetype(FD+f'NanumGothic{w}.ttf',s)
W,H,FPS=1080,1920,30
BG=(244,241,234); INK=(28,36,52); GOLD=(176,141,74); OLIVE=(110,112,74)
S='/tmp/ht/src/'
def load(i): return Image.open(S+i+'.jpg').convert('RGB')
def cover(im,w,h,z=1.0,dx=0.0,ay=0.5):
    r=max(w/im.width,h/im.height)*z; im2=im.resize((int(im.width*r)+1,int(im.height*r)+1),Image.LANCZOS)
    x=int((im2.width-w)/2+dx*(im2.width-w)/2); y=int((im2.height-h)*ay)
    return im2.crop((x,y,x+w,y+h))
def ease(t): t=max(0,min(1,t)); return t*t*(3-2*t)
def ctext(d,y,s,f,fill,stroke=0,sf=None):
    w=d.textlength(s,font=f); d.text(((W-w)/2,y),s,font=f,fill=fill,stroke_width=stroke,stroke_fill=sf)
def tag(d,x,y,s,bg,fg=(255,255,255)):
    f=F(30,'Bold'); w=d.textlength(s,font=f); d.rounded_rectangle((x,y,x+w+36,y+52),12,fill=bg); d.text((x+18,y+9),s,font=f,fill=fg)

R={'kit':'1iPbAK355ufIJdY8qITvBLDajK5mTeJKE','kit2':'13pSRZFmUEEMqxneE61YpnzLzqG1yY7OY','mb':'1vQHv_r8phMqsQnEO3q_ksZr5ylwZTRcp',
   'room':'1GBk3l_idicf7GNL2TZr7YzEXm_xFSq1K','bath':'1teVE3UymAcNLpNsv6ERumIOMYMeZ4aGd','bath2':'1nILG4uhpl0c_kR7aJDKkIEKRt-OyCA8A'}
SC=[('kit','1iz0l0ZfKgfbOSgzqVRwOneSTOBk-MbUn','01','주방','창 아래 ㄱ자 주방 그대로'),
    ('kit2','1OH-qAlN-UDD6L28bNRLbqECTUCkGPFet','02','현관에서 본 주방','같은 자리, 같은 라인'),
    ('mb','1mubDs8srX80SqoE81XxofOZ44RCeGrxc','03','안방','천장까지 붙박이장'),
    ('room','1xT0AMKTBzuwOFx5a6iN6bGQgwiwxA4P3','04','작은방','창가 배치 그대로'),
    ('bath','13v646YGOLMDBk0qzitH2vNf6lpoymy5d','05','공용 욕실','조명 거울장 · 벽걸이 세면대'),
    ('bath2','1vizDjL-q8Qm0otVkR4bj_eCL3x1aTXVD','06','안방 욕실','욕조 옆 세면대까지')]
AY={'1iz0l0ZfKgfbOSgzqVRwOneSTOBk-MbUn':0.45,'1OH-qAlN-UDD6L28bNRLbqECTUCkGPFet':0.5,'13v646YGOLMDBk0qzitH2vNf6lpoymy5d':0.6,'1vizDjL-q8Qm0otVkR4bj_eCL3x1aTXVD':0.55}
HOOK=2.6; SD=2.9; END=4.6
TOTAL=HOOK+SD*len(SC)+END
IMGS={k:load(v) for k,v in R.items()}
HOOKIMG=load('16sWMiib8oazyUHWS3objIEAnK9O31WvQ')
PH={s[1]:load(s[1]) for s in SC}
TOPY,BOX=250,760; MIDY=TOPY+BOX; BOTY=MIDY+90
def header(d):
    ctext(d,70,'33평 아파트 · 계약 전 3D',F(54),INK)
    ctext(d,150,'3D 제안서  vs  실제 완공  2탄',F(40,'Bold'),GOLD)
def hook(t):
    im=cover(HOOKIMG,W,H,1.08-0.06*t/HOOK).filter(ImageFilter.GaussianBlur(0))
    im=ImageEnhance.Brightness(im).enhance(0.92); d=ImageDraw.Draw(im,'RGBA')
    d.rectangle((0,560,W,1060),fill=(20,24,32,150))
    a=ease(t/0.5)
    ctext(d,610,'가구 들어오기 전 완공 사진',F(52,'Bold'),(255,255,255))
    ctext(d,700,'3D랑 같을까요?',F(110),(255,226,160))
    ctext(d,860,'3D 제안서 그대로 2탄 · 33평',F(44,'Bold'),(255,255,255))
    tag(d,60,1120,'실제 완공',INK)
    return im
def scene(i,t):
    top,ph,day,step,pt=SC[i]
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im,'RGBA'); header(d)
    z=1.0+0.04*t/SD
    im.paste(cover(IMGS[top],W,BOX,z),(0,TOPY))
    tag(d,30,TOPY+24,'3D 제안서',GOLD)
    # 하단 현장 사진: 왼쪽에서 열림
    p=cover(PH[ph],W,BOX,1.04-0.04*t/SD,ay=AY.get(ph,0.5)); k=ease(t/0.45); w=max(1,int(W*k))
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
    im=cover(HOOKIMG,W,H,1.0+0.04*t/END); im=ImageEnhance.Brightness(im).enhance(0.55)
    d=ImageDraw.Draw(im,'RGBA')
    ctext(d,430,'보여드린 그대로, 완성합니다',F(56,'Bold'),(255,255,255))
    ctext(d,530,'3D 그대로 완성',F(84),(255,226,160))
    ctext(d,670,'같은 자리, 같은 공간',F(50,'Bold'),(255,255,255))
    if t>1.2:
        a=int(255*ease((t-1.2)/0.5))
        d.rectangle((0,860,W,1180),fill=(20,24,32,int(a*0.8)))
        ctext(d,900,'공간을 설계하는 홈퍼니싱',F(46,'Bold'),(255,255,255,a))
        ctext(d,965,'취향을 디자인하는 아르띠꼬',F(46,'Bold'),(255,255,255,a))
        ctext(d,1050,'디자인 · 설계 · 실내건축',F(36,'Bold'),(255,226,160,a))
    return im
def frame(t):
    if t<HOOK: return hook(t)
    t2=t-HOOK
    if t2<SD*len(SC): i=int(t2//SD); return scene(i,t2-i*SD)
    return ending(t2-SD*len(SC))
if __name__=='__main__':
    import sys
    if len(sys.argv)>1:
        for ts in sys.argv[1:]: frame(float(ts)).save(f'/tmp/shorts/out/ad2c_{ts}.jpg',quality=85)
        sys.exit()
    n=int(TOTAL*FPS)
    p=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
       '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','/tmp/shorts/out/ad2_clean_noaudio.mp4'],stdin=subprocess.PIPE)
    for k in range(n): p.stdin.write(frame(k/FPS).tobytes())
    p.stdin.close(); p.wait(); print('frames',n,'sec',TOTAL)
