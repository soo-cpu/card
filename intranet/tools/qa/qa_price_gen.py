# 상세 자동견적 기준 단가 뽑기 (v0.99-37, 2026-11-17)
# 「홈퍼니싱 견적서_ver1.xlsx」 '단가' 시트를 읽기만 해서(원본 수정 없음) 자동견적에 쓰는 줄의 단가를 JSON 으로 냄.
# 단가 = 금액(D) + 노무비(E) (숫자인 칸만, VAT 별도) · 키 = 'U' + 엑셀 행 번호 4자리 (catalog/detail2026 과 같은 번호)
# 사용: python -I qa_price_gen.py <ver1.xlsx 사본> > qa_price.json   (원본은 사본으로 복사해서 읽기)
import sys, re, json, zipfile
import xml.etree.ElementTree as ET
sys.stdout.reconfigure(encoding="utf-8")
ROWS = [4,10,19,27,34,44,45,53,54,62,63,67,69,76,83,120,121,122,131,135,141,151,155,160,179,185,186,187,
 222,234,241,242,248,250,274,276,316,318,321,338,380,381,382,383,384,385,391,392,395,396,399,400,404,405,409,410,
 414,415,418,419,424,425,426,427,203,430,432,437,444,446,449,459,462,466,524,525,529,547,548,556,635,637,678,679,680,
 705,709,710,711,716,718,722,723,738,741,749,758,760,770,773,781,789,790,793,799,806,819,826,829,834,849,852,854,857,
 861,862,863,864,871,872,879,880,900,901,903,910,912,916,920,921,924,938,946,947,958,959,960]
M = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
def load(path):
    z = zipfile.ZipFile(path)
    ss = [''.join(t.text or '' for t in si.iter(M+'t')) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall(M+'si')]
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rm = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
    tgt = [rm[s.get(R+'id')] for s in wb.find(M+'sheets') if s.get('name') == '단가'][0].lstrip('/')
    tgt = tgt if tgt.startswith('xl/') else 'xl/' + tgt
    out = {}
    for r in ET.fromstring(z.read(tgt)).iter(M+'row'):
        d = {}
        for c in r.findall(M+'c'):
            v = c.find(M+'v'); t = c.get('t')
            if t == 'inlineStr': val = ''.join(x.text or '' for x in c.iter(M+'t'))
            elif v is None: continue
            elif t == 's': val = ss[int(v.text)]
            elif t in ('str', 'e', 'b'): val = v.text
            else:
                f = float(v.text); val = int(f) if f == int(f) else f
            col = 0
            for ch in re.match(r'[A-Z]+', c.get('r')).group(): col = col*26 + ord(ch) - 64
            d[col-1] = val
        out[int(r.get('r'))] = d
    return out
def main():
    S = load(sys.argv[1]); res = {}; sub = {}; cur = ''
    for n in sorted(S):
        v = re.sub(r'\s+', '', str(S[n].get(1, '')))
        if v: cur = v
        sub[n] = cur
    for n in ROWS:
        d = S.get(n, {})
        name = re.sub(r'\s{2,}', ' ', str(d.get(2, '')).strip())
        if '_' not in name and sub.get(n) and not name.startswith(sub[n]): name = sub[n] + ' · ' + name
        p = sum(x for x in (d.get(3), d.get(4)) if isinstance(x, (int, float)))
        m = re.search(r'단위\s*[:：]?\s*([^\)\]]+)', name)
        res['U%04d' % n] = [name, (m.group(1).strip() if m else ''), round(p)]
    print(json.dumps(res, ensure_ascii=False, separators=(',', ':')))
main()
