# A.pdf: render pages, black-box PII words (by bbox), rebuild as image PDF (scanned look)
import subprocess, re, sys, os
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
DPI = 110
bbox = subprocess.run(['pdftotext','-bbox',src,'-'],capture_output=True,text=True).stdout
pages = bbox.split('<page ')[1:]
# 가릴 고객 이름 등은 비공개 파일 work/mask-words.txt(한 줄에 하나)에서 읽음 — 저장소에 고객 이름을 두지 않음
extra = [w.strip() for w in open('work/mask-words.txt', encoding='utf-8') if w.strip()] if os.path.exists('work/mask-words.txt') else []
pat = re.compile('(' + '|'.join([re.escape(w) for w in extra] + [r'010-\d{3,4}-\d{4}', r'\d{3}동', r'\d{3,4}호', '최윤수', '정진혁', '449-81-01936', '홈퍼니싱', '한샘리하우스', '129번길', '동구릉로', '2-']) + ')')
os.makedirs('work/A_pages', exist_ok=True)
subprocess.run(['pdftoppm','-r',str(DPI),'-png',src,'work/A_pages/p'],check=True)
files = sorted(os.listdir('work/A_pages'))
imgs=[]
for i,(pg,fn) in enumerate(zip(pages,files)):
    im = Image.open('work/A_pages/'+fn).convert('RGB'); d = ImageDraw.Draw(im); k = DPI/72
    for m in re.finditer(r'xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]+)</word>', pg):
        if pat.search(m.group(5)):
            x0,y0,x1,y1 = [float(v)*k for v in m.groups()[:4]]
            d.rectangle([x0-2,y0-2,x1+2,y1+2], fill=(0,0,0))
    imgs.append(im)
imgs[0].save(out, save_all=True, append_images=imgs[1:], resolution=DPI)
print(len(imgs),'pages')
