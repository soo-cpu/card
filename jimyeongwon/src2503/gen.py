# 25.03.26 지명원 양식에 맞춘 신규 페이지 생성 (960 x 540 pt, 원본 측정값 기준)
import os, html, sys
M = os.path.dirname(os.path.abspath(__file__))
e = html.escape

CSS = r'''
@page{size:960pt 540pt;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Noto Sans KR',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.v.big,.sum{word-break:keep-all}
.pg{width:960pt;height:540pt;position:relative;overflow:hidden;page-break-after:always;background:#fff}
.pg:last-child{page-break-after:auto}
.bg{position:absolute;inset:0;background:center/cover no-repeat}
.panel{position:absolute;left:0;top:0;bottom:0;width:295.5pt;background:rgba(48,48,50,.64)}
.tab{position:absolute;right:0;top:0;width:217.5pt;height:52.5pt;background:#C55A11;color:#fff}
.tab .k{position:absolute;left:14.2pt;top:7.6pt;font-size:10.4pt;line-height:14.4pt;font-weight:500;letter-spacing:-.1pt}
.tab .bar{position:absolute;left:97pt;top:13pt;width:.9pt;height:27pt;background:#fff}
.tab .n{position:absolute;left:127.5pt;top:15.2pt;font-size:12.2pt;font-weight:400;white-space:nowrap}
.f{position:absolute;color:#fff;white-space:nowrap}
.lb{left:16.5pt;font-size:8.6pt;font-weight:400;letter-spacing:.1pt}
.v{left:92.6pt;font-size:8.7pt;font-weight:400;line-height:14.4pt;color:#e9e9e9}
.v.big{font-size:11.6pt;font-weight:500;color:#fff;white-space:normal;width:196pt;line-height:16pt}
.v.b{font-weight:500;color:#fff}
.sum{left:92.6pt;width:196pt;white-space:normal;font-size:8.3pt;line-height:13.4pt;color:#dcdcdc}
.cp{position:absolute;left:401.4pt;top:521.6pt;font-size:7.2pt;color:#fff;letter-spacing:-.05pt}
.cp.dk{color:#7f7f7f}
.no{position:absolute;right:14pt;top:522.4pt;font-size:8.2pt;color:#fff}
.no.dk{color:#7f7f7f}
.row{position:absolute;inset:0;display:flex;gap:2.25pt;background:#fff}
.row div{flex:1;background:center/cover no-repeat}
'''

SITES = [
 dict(key='icheon', sec='gov', short='이천 도자비엔날레', project='2026 경기도자비엔날레 국제공모전 전시공간 환경개선공사', client='한국도자재단',
      loc='경기도 이천시', d1='경기도자비엔날레 국제공모전 전시공간',
      work=['철거, 전시 가벽 · 곡면 벽체, 원형 구조물,', '전시대 · 제작 가구, 금속, 목공, 도장,', '전기 · 조명, 커튼'],
      summary='국제공모전 전시공간을 곡면 벽체와 원형 구조물로 다시 짜, 작품 동선을 따라 자연스럽게 흐르는 전시장으로 바꿨습니다.',
      term='2026. 06 ~ 2026. 07', hero='bi11', photos=['bi1', 'bi13', 'bi15']),
 dict(key='yeoju', sec='gov', short='여주 도자미술관', project='2026 경기도자비엔날레 소장품전 전시연출 공사', client='한국도자재단',
      loc='경기도 여주시 (경기생활도자미술관)', d1='경기생활도자미술관 소장품전 전시실',
      work=['벽면 진열장 · 조명 진열 선반,', '층형 진열 좌대 · 전시대 제작,', '조명, 도장 및 보수'],
      summary='소장품전 전시실에 조명이 들어간 벽면 진열장과 층층 좌대를 제작해, 도자 작품이 돋보이는 전시 공간으로 연출했습니다.',
      term='2026. 08. 07 ~ 2026. 09. 04', hero='yj1', photos=['yj2', 'yj3', 'yj4']),
 dict(key='dongyang', sec='res', short='인창 동양아파트', project='구리 인창동 동양아파트', client='개인 고객',
      loc='경기도 구리시', d1='인창동 동양아파트 34평',
      work=['철거, 발코니 확장, 창호 교체, 시스템 에어컨,', '목공, 전기, 타일, 욕실 2개소, 바닥재, 도배,', '주방 가구, 붙박이장, 중문'],
      summary='발코니 확장과 창호 교체로 단열과 면적을 함께 확보하고, 주방과 붙박이장을 새로 짜 넣어 수납을 크게 늘렸습니다.',
      term='2025. 09. 02 ~ 2025. 10. 02', hero='dy1', photos=['dy2', 'dy3', 'dy4']),
 dict(key='desiang', sec='res', short='신내 데시앙', project='신내 데시앙포레', client='개인 고객',
      loc='서울 중랑구', d1='신내 데시앙포레 아파트 35평',
      work=['철거, 설비, 전기, 목공, 필름, 도장, 타일,', '욕실 2개소, 도배, 바닥재, 조명,', '주방 · 수납 가구, 간살 중문'],
      summary='거실과 주방을 하나로 잇고 아일랜드와 간살 파티션으로 공간을 나눠, 넓으면서도 쓰임이 분명한 집으로 바꿨습니다.',
      term='2025. 11. 27 ~ 2026. 01. 09', hero='ds1', photos=['ds2', 'ds3', 'ds4']),
 dict(key='baejae', sec='res', short='고덕 배재현대', project='고덕 배재현대아파트', client='개인 고객',
      loc='서울 강동구', d1='고덕 배재현대아파트 36평',
      work=['철거, 설비, 전기, 목공, 타일, 욕실 2개소,', '도배, 바닥재, 조명, 주방 · 수납 가구,', '중문, TV 벽'],
      summary='TV벽과 천장 간접조명, 벽면 수납장을 한 톤으로 정리해 오래된 아파트를 밝고 깔끔한 집으로 새로 만들었습니다.',
      term='', hero='bj1', photos=['bj2', 'bj3', 'bj4']),
 dict(key='lotte', sec='res', short='구리 롯데캐슬', project='구리역 롯데캐슬 시그니처', client='개인 고객',
      loc='경기도 구리시', d1='구리역 롯데캐슬 시그니처 아파트 37평',
      work=['현관 타일, 슬라이딩 중문, 주방 홈바,', '엔지니어드스톤, 서재 유리 파티션, 히든 도어,', '붙박이장, 필름, 간접조명, 실링팬'],
      summary='신축 아파트 마감 위에 TV벽 매립과 커튼박스 간접조명, 히든 도어를 더해 군더더기 없는 집으로 다듬었습니다.',
      term='2026. 04', hero='lc1', photos=['lc2', 'lc3', 'lc4']),
]
PERF = [('2025', 3, [('25년 09월', '구리 인창동 동양아파트 인테리어 공사'), ('25년 11월', '신내 데시앙포레 아파트 인테리어 공사'), ('25년 11월', '고덕 배재현대아파트 인테리어 공사')]),
        ('2026', 1, [('26년 04월', '구리역 롯데캐슬 시그니처 아파트 인테리어 공사'), ('26년 06월', '2026 경기도자비엔날레 국제공모전 전시공간 환경개선공사'), ('26년 08월', '2026 경기도자비엔날레 소장품전 전시연출 공사')])]
SEC = {'res': ('Residential', 'Space', '주거'), 'gov': ('Government', 'Office', '관공서')}

def title_page(s, no):
    a, b, c = SEC[s['sec']]
    work = ''.join(f'<div class="f v" style="top:{258.6 + i * 14.4}pt">{e(w)}</div>' for i, w in enumerate(s['work']))
    sum_top = 258.6 + len(s['work']) * 14.4 + 14
    return f'''<section class="pg"><div class="bg" style="background-image:url(img/{s['hero']}.jpg)"></div><div class="panel"></div>
<div class="tab"><div class="k">{a}<br>{b} {c}</div><div class="bar" style="left:{97 if s['sec']=='res' else 103}pt"></div><div class="n" style="left:{127.5 if s['sec']=='res' else 119.5}pt;font-size:{12.2 if len(s['short'])<=7 else 10.4}pt">{e(s['short'])}</div></div>
<div class="f lb" style="top:84pt">. Project</div><div class="f v big" style="top:79.5pt">{e(s['project'])}</div>
<div class="f lb" style="top:192pt">. Client</div><div class="f v" style="top:190.5pt">{e(s['client'])}</div>
<div class="f lb" style="top:210pt">. Location</div><div class="f v" style="top:209.4pt">{e(s['loc'])}</div>
<div class="f lb" style="top:228pt">. Details</div><div class="f v b" style="top:228.2pt">{e(s['d1'])}</div>
{work}<div class="f sum" style="top:{sum_top}pt">{e(s['summary'])}</div>
<div class="f lb" style="top:390pt">. Term of Work</div><div class="f v" style="top:388.4pt">{e(s['term'])}</div>
<div class="cp">Ⓒ HOME FURNISHING CO. all rights reserved</div><div class="no">{no}</div></section>'''

def photo_page(s, no):
    cells = ''.join(f'<div style="background-image:url(img/{p}.jpg)"></div>' for p in s['photos'])
    return f'''<section class="pg"><div class="row">{cells}</div><div class="cp">Ⓒ HOME FURNISHING CO. all rights reserved</div><div class="no">{no}</div></section>'''

PCSS = r'''
@page{size:960pt 540pt;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent;font-family:'Noto Sans KR',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:960pt;height:540pt;position:relative;overflow:hidden}
.cov{position:absolute;background:#F2F2F2}
.wcov{position:absolute;background:#fff}
.yr{position:absolute;font-size:20.5pt;font-weight:700;color:#7F7F7F;text-shadow:1px 1px 1px rgba(0,0,0,.18)}
.it{position:absolute;font-size:9.1pt;color:#7D7D7D;white-space:nowrap}
.no{position:absolute;left:931pt;top:522.4pt;font-size:8.2pt;color:#7F7F7F}
'''
def perf_overlay(no):
    out = ['<div class="cov" style="left:40pt;top:110pt;width:432pt;height:392pt"></div>',
           '<div class="cov" style="left:489pt;top:110pt;width:432pt;height:392pt"></div>',
           '<div class="wcov" style="left:925pt;top:519pt;width:30pt;height:16pt"></div>']
    for col, (yr, start, items) in zip([(59.9, 61.2, 83.0), (505.3, 505.9, 527.7)], PERF):
        yx, nx, tx = col
        out.append(f'<div class="yr" style="left:{yx}pt;top:113.5pt">{yr}</div>')
        for i, (m, t) in enumerate(items):
            y = 155.8 + i * 18.48
            out.append(f'<div class="it" style="left:{nx}pt;top:{y}pt">{start + i}.</div><div class="it" style="left:{tx}pt;top:{y}pt">{e(m)} &nbsp;{e(t)}</div>')
    out.append(f'<div class="no">{no}</div>')
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="sans.css"><style>{PCSS}</style></head><body><section class="pg">{"".join(out)}</section></body></html>'

def build(sites, nos, out):
    pages = []
    for s, (n1, n2) in zip(sites, nos):
        pages.append(title_page(s, n1)); pages.append(photo_page(s, n2))
    open(os.path.join(M, out), 'w', encoding='utf-8').write(
        f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="sans.css"><style>{CSS}</style></head><body>{"".join(pages)}</body></html>')

if __name__ == '__main__':
    gov = [x for x in SITES if x['sec'] == 'gov']; res = [x for x in SITES if x['sec'] == 'res']
    build(gov, [('83-1', '83-2'), ('83-3', '83-4')], 'gov.html')
    build(res, [('104-1', '104-2'), ('104-3', '104-4'), ('104-5', '104-6'), ('104-7', '104-8')], 'res.html')
    open(os.path.join(M, 'perf.html'), 'w', encoding='utf-8').write(perf_overlay('10-1'))
    print('ok')
