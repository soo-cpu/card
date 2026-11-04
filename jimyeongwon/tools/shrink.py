# usage: python3 shrink.py in.pdf out.pdf maxpx quality  -- recompress raster images only
import sys, io, zlib, pikepdf
from pikepdf import PdfImage, Name
from PIL import Image
src, dst, maxpx, q = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
pdf = pikepdf.open(src)
seen = set(); done = skipped = 0
for page in pdf.pages:
    for key, raw in list(page.images.items()):
        og = raw.objgen
        if og in seen: continue
        seen.add(og)
        try:
            if '/SMask' in raw or '/Mask' in raw or raw.get('/ImageMask', False): skipped += 1; continue
            pim = PdfImage(raw).as_pil_image()
            if pim.mode not in ('RGB', 'L'): pim = pim.convert('RGB')
            w, h = pim.size
            if max(w, h) > maxpx:
                pim.thumbnail((maxpx, maxpx), Image.LANCZOS)
            buf = io.BytesIO(); pim.save(buf, 'JPEG', quality=q, optimize=True)
            data = buf.getvalue()
            if len(data) >= len(raw.read_raw_bytes()): skipped += 1; continue
            raw.write(data, filter=Name.DCTDecode)
            raw.Width, raw.Height = pim.size
            raw.ColorSpace = Name.DeviceRGB if pim.mode == 'RGB' else Name.DeviceGray
            raw.BitsPerComponent = 8
            for k in ('/DecodeParms', '/Decode'):
                if k in raw: del raw[k]
            done += 1
        except Exception as ex:
            skipped += 1
pdf.save(dst, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
print('recompressed', done, 'skipped', skipped)
