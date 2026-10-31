import sys,os
from PIL import Image,ImageDraw,ImageFont
F=ImageFont.truetype('/usr/local/lib/python3.13/dist-packages/koreanize_matplotlib/fonts/NanumGothicBold.ttf',22)
ids=sys.argv[2:]; W=360;H=300;cols=5
rows=(len(ids)+cols-1)//cols
S=Image.new('RGB',(W*cols,H*rows),'white');d=ImageDraw.Draw(S)
for i,x in enumerate(ids):
    im=Image.open(f'src/{x}.jpg');im.thumbnail((W-6,H-36))
    X=(i%cols)*W;Y=(i//cols)*H;S.paste(im,(X+3,Y+3));d.text((X+5,Y+H-30),f'{i}:{x[:6]}',fill='red',font=F)
S.save(sys.argv[1])
