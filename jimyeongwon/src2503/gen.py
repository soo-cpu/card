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
 dict(key='welfare', sec='gov', short='종합사회복지관', project='구리시 종합사회복지관 경로식당 조성공사', client='구리시청',
      loc='경기도 구리시 (구리시 종합사회복지관)', d1='종합사회복지관 경로식당',
      work=['전면 철거, 경량 벽체, 천장 · 조명,', '바닥, 유리 칸막이, 주방 설비'],
      summary='노후한 경로식당을 골조 상태까지 철거한 뒤, 밝고 넓은 식당 공간으로 새로 조성했습니다.',
      term='2025. 06 ~ 2025. 07', hero='wf13', photos=['wf1', 'wf2', 'wf12']),
 dict(key='parking', sec='gov', short='제2공영주차장', project='구리전통시장 제2공영주차장 BF 본인증 보수 및 인테리어공사', client='구리시상권활성화재단',
      loc='경기도 구리시 (구리전통시장 제2공영주차장)', d1='제2공영주차장 1층 BF 인증 구역',
      work=['장애인 화장실, 점자블록, 출입문,', '다목적실 · 탈의실, 설비 · 방수'],
      summary='BF(장애물 없는 생활환경) 본인증 기준에 맞춰 화장실과 동선을 보수하고 내부를 새로 꾸몄습니다.',
      term='2025. 09 ~ 2025. 10', hero='pk3', photos=['pk1', 'pk2', 'pk4']),
 dict(key='weeclass', sec='gov', short='한국삼육중학교', project='한국삼육중학교 위클래스 상담실 환경개선공사', client='한국삼육중학교',
      loc='경기도 구리시 아차산로 487번길 70', d1='위클래스 상담실',
      work=['목공, 도어, 바닥, 전기 · 조명,', '제작가구(안내데스크 · 수납), 도장'],
      summary='학생이 편하게 머물 수 있도록 따뜻한 우드 톤과 개방형 상담 공간으로 구성했습니다.',
      term='2026. 01 ~ 2026. 02', hero='wc1', photos=['wc2', 'wc6', 'wc10']),
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
 dict(key='sanun', sec='res', short='분당 산운마을', project='분당 산운마을 8단지', client='개인 고객',
      loc='경기도 성남시 분당구', d1='산운마을 8단지 아파트 32평',
      work=['철거, 창호, 설비 · 전기, 목공, 필름, 타일,', '욕실 2개소, 도배, 마루, 조명,', '주방 · 수납 가구, 터닝도어, 실링팬'],
      summary='원형 우물천장과 간접조명, 아치 문틀을 더하고 주방 · 수납 가구를 새로 짜 넣어 부드럽고 밝은 집으로 바꿨습니다.',
      term='2025. 05. 19 ~ 2025. 06. 25', hero='su1', photos=['su2', 'su3', 'su4']),
 dict(key='shervill', sec='res', short='왕십리 쉐르빌', project='왕십리 삼성쉐르빌', client='개인 고객',
      loc='서울 성동구', d1='왕십리 삼성쉐르빌 아파트 32평',
      work=['철거, 거실 · 방 확장, 창호, 설비 · 전기,', '목공, 필름, 타일, 욕실 2개소, 도배,', '바닥, 조명, 주방 · 수납 가구'],
      summary='거실과 방을 확장하고 주방 가벽을 없애 공간을 넓히고, 매립 라인조명과 아치로 정돈된 분위기를 만들었습니다.',
      term='2025. 05. 07 ~ 2025. 06. 09', hero='sc1', photos=['sc2', 'sc3', 'sc4']),
 dict(key='jinjeop', sec='res', short='진접 신안인스빌', project='남양주 진접 신안인스빌', client='개인 고객',
      loc='경기도 남양주시', d1='진접 신안인스빌 아파트 34평',
      work=['철거, 설비 · 전기, 목공, 필름, 타일,', '욕실 2개소, 도배, 바닥, 조명,', '주방 · 수납 가구, 아치게이트, 스윙 중문'],
      summary='아치게이트와 스윙 중문, 우물천장 간접조명으로 집의 인상을 바꾸고 드레스룸과 붙박이장으로 수납을 정리했습니다.',
      term='2026. 06. 16 ~ 2026. 07. 20', hero='jj1', photos=['jj2', 'jj3', 'jj4']),
 dict(key='hometown', sec='res', short='인창 현대홈타운', project='구리 인창 현대홈타운', client='개인 고객',
      loc='경기도 구리시', d1='인창 현대홈타운 아파트 33평',
      work=['철거, 창호(로이유리), 목공, 필름, 타일,', '욕실 2개소 전체 교체, 도배, 바닥, 조명,', '주방 · 수납 가구, 파티션 중문'],
      summary='발코니 창을 로이유리로 바꾸고 욕실 두 곳을 전체 교체해, 오래된 아파트를 따뜻하고 깔끔한 집으로 새로 만들었습니다.',
      term='2026. 08. 25 ~ 2026. 09. 23', hero='hh1', photos=['hh2', 'hh3', 'hh4']),
 dict(key='bluestar', sec='com', short='블루스타 여행사', project='블루스타 여행사 사옥 3 · 4층 인테리어', client='(주)성성여행사 · 블루스타',
      loc='서울 서대문구', d1='여행사 사무실 3층 · 4층',
      work=['철거, 목공, 설비, 냉난방기, 금속 · 방수,', '화장실 방수 · 누수 보수, 포세린 타일 바닥,', '도배, 전기, 필름'],
      summary='3층 사무실을 전면 리모델링하고 4층 화장실 누수와 옥상 방수까지 함께 손봐, 밝고 쓰기 편한 사옥으로 바꿨습니다.',
      term='2025. 09. 25 ~ 2025. 11. 19', hero='bs1', photos=['bs2', 'bs3', 'bs4']),
 dict(key='jmall', sec='com', short='제이몰 골프존', project='의정부 제이몰 골프존 스크린골프장 (8타석)', client='태하엔지니어링건축사사무소',
      loc='경기도 의정부시', d1='스크린골프장 8타석 · 로비 · 화장실',
      work=['철거, 경량 벽체 · 천장, 목창호, 목공, 금속 · 유리,', '타일, 도장, 방염 필름, 데코타일, 가구,', '화장실, 냉난방기 · 전열교환기'],
      summary='8개 타석 룸과 로비, 화장실을 새로 조성하고 템바보드 벽과 간접조명으로 머물고 싶은 라운지를 만들었습니다.',
      term='2026. 06. 23 ~', hero='jm1', photos=['jm2', 'jm3', 'jm4']),
]
PERF = [('2025', 3, [('25년 01월', '서울 삼육고등학교 본관동 및 고3동 내부 도장공사'), ('25년 02월', '서울 삼육고등학교 청운2관 리모델링 공사'), ('25년 02월', '한국 삼육중학교 본관동 계단 러버타일 교체공사'),
        ('25년 05월', '분당 산운마을 8단지 아파트 인테리어 공사'), ('25년 05월', '왕십리 삼성쉐르빌 아파트 인테리어 공사'), ('25년 06월', '구리시 종합사회복지관 경로식당 조성공사'),
        ('25년 08월', '구리농수산물시장 공중화장실 수선공사'), ('25년 09월', '구리 인창동 동양아파트 인테리어 공사'), ('25년 09월', '블루스타 여행사 사옥 3·4층 인테리어 공사'), ('25년 10월', '구리전통시장 제2공영주차장 BF 본인증 보수 및 인테리어공사'),
        ('25년 11월', '구리 갈매동 D1블럭 경로당 기계설비 및 물품 납품'), ('25년 11월', '신내 데시앙포레 아파트 인테리어 공사'),
        ('25년 11월', '고덕 배재현대아파트 인테리어 공사')]),
        ('2026', 1, [('26년 02월', '한국 삼육중학교 위클래스 상담실 환경개선공사'), ('26년 03월', '구리시 장애인 주거 편의시설 개선공사 (3개소)'), ('26년 03월', '구리 갈매동 경로당 BF 인증 보완공사'),
        ('26년 04월', '이석영뉴미디어도서관 시설개선(리모델링) 공사'), ('26년 04월', '구리역 롯데캐슬 시그니처 아파트 인테리어 공사'), ('26년 06월', '2026 경기도자비엔날레 국제공모전 전시공간 환경개선공사'),
        ('26년 06월', '남양주 진접 신안인스빌 아파트 인테리어 공사'), ('26년 06월', '의정부 제이몰 골프존 스크린골프장(8타석) 인테리어 공사'), ('26년 08월', '2026 경기도자비엔날레 소장품전 전시연출 공사'),
        ('26년 08월', '구리 인창 현대홈타운 아파트 인테리어 공사')])]
SEC = {'res': ('Residential', 'Space', '주거'), 'gov': ('Government', 'Office', '관공서'), 'com': ('Commercial', 'Space', '상업공간')}

def title_page(s, no):
    a, b, c = SEC[s['sec']]
    work = ''.join(f'<div class="f v" style="top:{258.6 + i * 14.4}pt">{e(w)}</div>' for i, w in enumerate(s['work']))
    sum_top = 258.6 + len(s['work']) * 14.4 + 14
    return f'''<section class="pg"><div class="bg" style="background-image:url(img/{s['hero']}.jpg)"></div><div class="panel"></div>
<div class="tab"><div class="k">{a}<br>{b} {c}</div><div class="bar" style="left:{ {'res':97,'gov':103,'com':99}[s['sec']] }pt"></div><div class="n" style="left:{ {'res':127.5,'gov':119.5,'com':121.9}[s['sec']] }pt;font-size:{12.2 if len(s['short'])<=7 else 10.4}pt">{e(s['short'])}</div></div>
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
    K = {x['key']: x for x in SITES}
    def lbl(base, n): return [(f'{base}-{2*k+1}', f'{base}-{2*k+2}') for k in range(n)]
    gov = [K[k] for k in ['welfare', 'parking', 'weeclass', 'icheon', 'yeoju']]
    com = [K[k] for k in ['bluestar', 'jmall']]
    res = [K[k] for k in ['sanun', 'shervill', 'dongyang', 'desiang', 'baejae', 'lotte', 'jinjeop', 'hometown']]
    build(gov, lbl('83', len(gov)), 'gov.html')
    build(com, lbl('94', len(com)), 'com.html')
    build(res, lbl('104', len(res)), 'res.html')
    open(os.path.join(M, 'perf.html'), 'w', encoding='utf-8').write(perf_overlay('10-1'))
    print('ok', len(gov), len(com), len(res))
