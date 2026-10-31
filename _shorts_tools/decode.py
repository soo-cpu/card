import json,base64,glob,os,sys
from PIL import Image, ImageOps
d='/root/.claude/projects/-home-user-card/f507173d-21b8-5775-bbe9-bbfcd309978f/tool-results/'
out=sys.argv[1]
for f in glob.glob(d+'mcp-Google_Drive-download_file_content-*.txt'):
    j=json.load(open(f))
    if not j.get('mimeType','').startswith('image'): continue
    p=os.path.join(out, j['id']+'.jpg')
    if os.path.exists(p): continue
    raw=base64.b64decode(j['content'])
    open('/tmp/shorts/tmp.jpg','wb').write(raw)
    im=ImageOps.exif_transpose(Image.open('/tmp/shorts/tmp.jpg')).convert('RGB')
    im.thumbnail((1600,1600)); im.save(p,quality=92)
    print(j['id'], j['title'], im.size)
