# 단지별 시공 페이지 생성기 (2026-11-24 v0). 실행: python3 gen_apt.py /home/user/card
import sys, os, json, html
ROOT = sys.argv[1]
BASE = "https://soo-cpu.github.io/card"
EST = BASE + "/estimate/?src=apt-"
VER = "단지별 페이지 2026-11-24 v0"

APTS = [
 dict(code="guri-lottecastle-signature", name="구리역 롯데캐슬 시그니처", short="구리역 롯데캐슬", py="37평", kind="아파트", area="경기도 구리시",
  title="구리역 롯데캐슬 시그니처 37평 인테리어 시공 사례 | 아르띠꼬 스튜디오",
  desc="구리역 롯데캐슬 시그니처 37평 신축 입주 인테리어. 벽 질감 마감, 천장 간접조명, 다이닝 유리장·원목 수납, 복도 히든 도어와 레일 조명까지 공간별 사진과 설명. 같은 단지 시공 경험이 있는 구리 업체.",
  intro="구리역 롯데캐슬 시그니처는 경의중앙선·8호선 구리역 생활권에 들어선 신축 대단지입니다. 새 아파트라 철거보다 ‘마감을 바꾸고 더하는’ 공사가 중심이 됩니다.",
  facts=[("규모","지하 6층~지상 최고 42층, 11개 동, 총 1,180가구"),("평면 구성","전용 34~101㎡ 8개 타입. 전용 85㎡ 이하 중소형이 공급 물량의 약 87%"),("분양","2023년 2월 견본주택 공개 (롯데건설)")],
  plan="중소형 비율이 높은 단지라 같은 평형이라도 수납과 동선을 어떻게 짜느냐에 따라 체감 면적이 크게 달라집니다. 37평처럼 큰 평형은 거실·다이닝·복도가 길게 이어지므로, 마감 재료를 하나로 통일하면 집이 훨씬 넓고 차분하게 읽힙니다.",
  src=[("뉴스1, 롯데건설 ‘구리역 롯데캐슬 시그니처’ 공급 (2023)","https://www.news1.kr/amp/realestate/construction/4943546"),("MTN, 롯데건설 ‘구리역 롯데캐슬 시그니처’ 견본주택 10일 오픈 (2023.02)","https://news.mtn.co.kr/news-detail/2023020512263376669")],
  work=["거실·복도 벽과 히든 도어를 같은 필름으로 마감(영림 PX450 발렌무디크림)","거실 천장 단차 간접조명·다운라이트","다이닝 유리장 + 원목 수납장 제작","복도 방문 히든 도어(도어 위 5mm 줄눈)","복도 마그네틱 레일 조명 매립","벽 모서리 라운드 코너 몰딩(영림 60R)","현관 슬라이딩 중문(영림)","주방 냉장고장 리폼(예림 HSM27 매트 문빔그레이)"],
  spaces=[
   ("거실 · 다이닝","../../images/work-1.jpg","구리역 롯데캐슬 시그니처 37평 거실과 다이닝",
    "거실 천장의 단차 안에 간접조명을 숨겨 밤에도 눈부심 없이 은은하게 밝습니다. TV 벽과 다이닝 쪽 벽을 같은 질감으로 마감해 거실에서 주방까지 한 공간처럼 이어지고, 다이닝 옆에는 유리장과 원목 수납장을 짜 넣어 그릇과 소품을 보여주며 수납합니다."),
   ("복도","../../images/hero.jpg","구리역 롯데캐슬 시그니처 37평 복도 히든 도어와 레일 조명",
    "방이 이어지는 긴 복도는 방문을 벽과 같은 마감으로 감춰 문틀이 보이지 않게 했습니다. 천장에는 레일 조명 한 줄만 두어 끝 벽을 비추고, 시선이 복도 끝까지 자연스럽게 흘러가도록 정리했습니다."),
  ]),
 dict(code="guui-hyundai-2", name="구의현대 2단지", short="구의현대 2단지", py="32평", kind="아파트", area="서울 광진구 구의동",
  title="구의현대 2단지 32평 인테리어 시공 사례 | 아르띠꼬 스튜디오",
  desc="광진구 구의동 구의현대 2단지 32평 전체 리모델링. 거실~주방 라인 조명, 거실을 마주 보는 아일랜드 주방, 유리 중문과 곡선 조명 거울. 1996년 준공 단지 구축 리모델링 경험.",
  intro="구의현대 2단지는 광진구 구의동의 1996년 준공 대단지입니다. 30년 가까이 된 구축이라 배관·전기·창호 상태를 먼저 확인하고, 그 위에 생활 동선을 새로 짜는 전체 리모델링 수요가 많습니다.",
  facts=[("규모","15개 동, 1,606세대, 최고 27층"),("준공","1996년 12월 입주"),("평형","시세 사이트 기준 31·32평형 등이 거래됨 (평형별 세대수는 공개 자료로 확인되지 않음)")],
  plan="이 시기 아파트는 거실과 주방 사이에 벽이 있고 주방이 안쪽에 갇힌 구조가 많습니다. 주방을 거실 쪽으로 열고 천장 조명을 길게 이어주면, 같은 면적에서도 집이 훨씬 넓게 느껴집니다. 구조 변경은 실측 후 가능한 범위를 확인해 드립니다.",
  src=[("다음부동산(dapt.kr) 구의현대2단지 단지 정보","https://dapt.kr/apt/AfA002.html"),("코리아차트 구의현대2단지아파트 기본 정보","https://apt.koreacharts.com/apt/A14383205/contents.html"),("리치고 구의현대2단지 시세","https://m.richgo.ai/realty/danji/a8XNvER")],
  work=["전체 철거 후 리모델링 · 거실 발코니 확장","거실~주방 천장 라인 조명(W50, 색온도·밝기 조절)","거실을 마주 보는 아일랜드 주방 제작(블룸 경첩·서랍, 인조대리석 상판)","현관 유리 중문(5T 강화유리)과 곡선 조명 거울","현관·주방 벽·욕실 포세린 타일(600×600)","욕실 2곳 전체 새로(공용 욕실 조적 욕조·매립 수납)","강마루·실크 도배·시스템 에어컨"],
  spaces=[
   ("거실 · 주방 · 현관","../../images/work-2.jpg","구의현대 2단지 32평 거실, 아일랜드 주방, 현관 유리 중문",
    "거실에서 주방까지 천장 라인 조명을 길게 이어, 앉은 자리 어디에서 봐도 공간이 하나로 읽힙니다. 주방은 거실을 마주 보는 아일랜드로 구성해 요리하면서 가족과 대화할 수 있게 했습니다. 사진 왼쪽 현관의 유리 중문 안쪽에는 곡선 조명 거울을 두어, 들어서는 순간 은은한 빛이 먼저 맞이합니다."),
  ]),
 dict(code="godeok-baejae-hyundai", name="고덕 배재현대", short="고덕 배재현대", py="36평", kind="아파트", area="서울 강동구 고덕동",
  title="고덕 배재현대 36평 주방 인테리어 · 3D 제안 vs 실제 완공 | 아르띠꼬 스튜디오",
  desc="강동구 고덕동 배재현대 36평 주방 리모델링. 3D 제안서와 실제 완공 사진을 나란히 비교. 화이트 상·하부장, 오픈 선반, 상부장 하부 조명. 1995년 준공 단지 시공 경험.",
  intro="고덕 배재현대는 5호선 고덕역 가까이에 있는 1995년 준공 단지입니다. 오래된 주방은 수납이 부족하고 조명이 어두운 경우가 많아, 주방만 새로 하는 부분 공사 문의도 많습니다.",
  facts=[("규모","3개 동, 448세대"),("준공","1995년 11월 사용승인 (현대건설)"),("평형","자료에 따라 29·36평형 또는 24·30평으로 표기가 다름")],
  plan="우리가 시공한 36평 세대의 주방은 창을 낀 ㄱ자 배치였습니다(같은 평형도 세대마다 다를 수 있습니다). 창 아래까지 하부장을 이어 작업대를 넓히고, 상부장 아래에 조명을 넣으면 낮에도 밤에도 손 밑이 밝은 주방이 됩니다.",
  src=[("당근부동산 고덕동 배재현대 단지 정보","https://realty.daangn.com/complexes/10654657/reviews/82266"),("리치고 고덕동 배재현대 시세","https://m.richgo.ai/realty/danji/a8YgfJU")],
  work=["주방 상·하부장 교체(화이트 플랫 도어)","창 아래까지 이어지는 ㄱ자 작업대","오픈 선반 2단","상부장 하부 LED 조명","주방 벽 타일"],
  spaces=[
   ("주방 · 3D 제안 vs 실제 완공","../../../estimate/img/c_godeok.jpg","고덕 배재현대 36평 주방 3D 제안서와 실제 완공 비교",
    "3D 제안서(위)와 실제 완공(아래)입니다. 상·하부장 배치, 오픈 선반, 상부장 아래 조명까지 제안한 모습 그대로 완성했습니다."),
  ]),
 dict(code="guri-galmae-office", name="구리 갈매 상업 사무실", short="구리 갈매 상업 사무실", py="", kind="상업 공간", area="경기도 구리시 갈매동",
  title="구리 갈매 상가·사무실 인테리어 시공 사례 | 아르띠꼬 스튜디오",
  desc="구리 갈매지구 상업 사무실 인테리어. 철판 계단과 원목 디딤판, 계단 아래 실내 정원, 석재 질감 안내 데스크. 갈매 상가·사무실·지식산업센터 인테리어 상담.",
  intro="갈매지구는 경춘선 갈매역을 중심으로 조성된 구리의 신도시 생활권입니다. 지식산업센터와 상가가 함께 들어서면서 사무실·매장 인테리어 수요가 꾸준히 늘고 있습니다.",
  facts=[("지구","경춘선 갈매역 중심 공공주택지구, 서울 노원구와 인접"),("주변","지식산업센터·상업시설 밀집, 별내역(8호선) 이용 가능"),("이 현장","2층으로 오르는 계단이 있는 복층형 공간")],
  plan="이 현장처럼 복층인 상업 공간은 2층으로 오르는 계단이 곧 공간의 얼굴이 됩니다. 계단 아래 남는 자리를 어떻게 쓰느냐에 따라 매장의 인상이 달라집니다.",
  src=[("이코노미스트, 구리 갈매지구 관련 보도 (2026)","https://economist.co.kr/article/view/ecn202607220028"),("디지털타임스, 구리갈매 지식산업센터 상업시설","https://www.dt.co.kr/article/11394479")],
  work=["검은 철판 계단 + 원목 디딤판","계단 아래 실내 정원","석재 질감 안내 데스크","천장 간접조명"],
  spaces=[
   ("입구 · 계단","../../images/work-3.jpg","구리 갈매 상업 사무실 2층 계단과 안내 데스크",
    "검은 철판 계단에 원목 디딤판을 얹어 2층으로 오르는 동선을 공간의 중심으로 삼았습니다. 계단 아래 남는 자리에는 작은 실내 정원을 들이고, 입구에는 석재 질감의 안내 데스크를 놓아 들어서는 손님을 맞이합니다."),
  ]),
]

KEYWORDS = {
 "guri-lottecastle-signature":["구리역 롯데캐슬 시그니처 인테리어","구리역 롯데캐슬 시그니처 37평 인테리어","롯데캐슬 시그니처 입주 인테리어","구리역 롯데캐슬 인테리어 업체","구리역 롯데캐슬 시그니처 신축 인테리어","구리 롯데캐슬 시그니처 간접조명","구리역 롯데캐슬 시그니처 붙박이장","구리 신축 아파트 인테리어","구리 인창동 아파트 인테리어","구리역 롯데캐슬 시그니처 거실 인테리어"],
 "guui-hyundai-2":["구의현대2단지 인테리어","구의현대2단지 32평 인테리어","구의현대 2단지 리모델링","구의동 아파트 인테리어","광진구 아파트 인테리어","구의현대2단지 주방 인테리어","구의현대2단지 아일랜드 주방","구의현대2단지 중문","광진구 32평 리모델링","구의현대아파트 인테리어 업체"],
 "godeok-baejae-hyundai":["고덕 배재현대 인테리어","배재현대 36평 인테리어","고덕 배재현대 주방 리모델링","고덕동 아파트 인테리어","강동구 아파트 인테리어","배재현대아파트 주방","고덕동 주방 리모델링","강동구 36평 인테리어","고덕역 아파트 인테리어","배재현대 리모델링 업체"],
 "guri-galmae-office":["구리 갈매 사무실 인테리어","갈매 상가 인테리어","갈매지구 사무실 인테리어","구리 상가 인테리어","갈매 지식산업센터 인테리어","구리 사무실 인테리어 업체","갈매동 매장 인테리어","구리 복층 상가 인테리어","갈매역 상가 인테리어","구리 갈매 인테리어"],
}

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "apt.css"), encoding="utf-8").read()

def e(s): return html.escape(s, quote=True)

ICON_TEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
ICON_KAKAO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 4C7 4 3 7.1 3 11c0 2.5 1.7 4.7 4.2 6L6.5 20l3.6-2.3c.6.1 1.2.1 1.9.1 5 0 9-3.1 9-7s-4-6.8-9-6.8z"/></svg>'

def head(title, desc, url, depth, img):
    up = "../" * depth
    return f'''<!doctype html>
<!-- {VER} · 같은 단지 이웃 손님용 페이지. 사례 추가: site/apt/_tools/gen_apt.py 의 APTS 에 한 덩어리 추가 후 python3 site/apt/_tools/gen_apt.py . 실행 -->
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#f5f0e8">
<link rel="icon" type="image/png" sizes="32x32" href="{up}images/favicon-32.png">
<link rel="apple-touch-icon" href="{up}images/apple-touch-icon.png">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="{url}"><meta property="og:image" content="{img}">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300&family=Cormorant+Garamond:wght@400;500&display=swap">
<style>{CSS}</style>'''

def bar(est):
    return f'''<div class="bar">
  <a class="est" href="{est}">1분 간편 견적</a>
  <a class="call" href="tel:15665904">{ICON_TEL}전화 상담</a>
  <a href="../../#contact">{ICON_KAKAO}카카오톡 상담</a>
</div>'''

FOOT = '''<footer><div class="in">
  <a class="logo" href="../../">HOME FURNISHING</a>
  <div class="biz"><div><b>주식회사 홈퍼니싱</b> · 아르띠꼬 스튜디오<br><span class="nw">대표번호 <a href="tel:15665904">1566-5904</a></span></div></div>
  <div>© 2026 Home Furnishing · Artico Studio</div>
</div></footer>'''

LB = '''<dialog id="lb"><button type="button" aria-label="닫기">×</button><img alt=""></dialog>
<script>
(function(){var d=document.getElementById('lb'),im=d.querySelector('img');
document.querySelectorAll('[data-full]').forEach(function(b){b.setAttribute('aria-label',b.querySelector('img').alt+' 크게 보기');
 b.addEventListener('click',function(){im.src=b.dataset.full;im.alt=b.querySelector('img').alt;if(d.showModal)d.showModal();else d.setAttribute('open','')})});
d.addEventListener('click',function(){d.close?d.close():d.removeAttribute('open')})})();
</script>'''

def page(a):
    url = f"{BASE}/site/apt/{a['code']}/"
    est = EST + a["code"]
    first_img = a["spaces"][0][1]
    og = BASE + "/site/images/og.jpg"
    meta = a["kind"] + (" · " + a["py"] if a["py"] else "") + " · " + a["area"]
    ld = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"홈","item":BASE+"/site/"},
        {"@type":"ListItem","position":2,"name":"시공 사례","item":BASE+"/site/works/"},
        {"@type":"ListItem","position":3,"name":"단지별 보기","item":BASE+"/site/apt/"},
        {"@type":"ListItem","position":4,"name":a["name"],"item":url}]}
    facts = "".join(f"<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k,v in a["facts"])
    srcs = "".join(f'<li><a href="{s[1]}" target="_blank" rel="noopener nofollow">{e(s[0])}</a></li>' for s in a["src"])
    work = "".join(f"<li>{e(w)}</li>" for w in a["work"])
    sp = ""
    for i,(t,img,alt,txt) in enumerate(a["spaces"]):
        tall = ' class="tall"' if "c_godeok" in img else ""
        sp += f'''
  <article class="sp">
    <button type="button" class="ph" data-full="{img}"><img{tall} src="{img}" alt="{e(alt)}" loading="{'eager' if i==0 else 'lazy'}"></button>
    <div class="txt"><span class="n">{i+1:02d}</span><h3>{e(t)}</h3><p>{e(txt)}</p></div>
  </article>'''
    kw = ", ".join(KEYWORDS[a["code"]])
    shop = a["kind"] == "상업 공간"
    badge = "이 지역 시공 경험 있음" if shop else "이 단지 시공 경험 있음"
    cta_t = "이 지역 상가·사무실, 먼저 상담해 보세요" if shop else f"{a['short']}에 사신다면, 이미 시공해 본 단지입니다"
    cta_p = ("같은 지역 공간을 직접 설계하고 시공했습니다. 업종과 공간에 맞춰 상담해 드립니다." if shop
             else f"같은 단지를 직접 설계하고 시공했기 때문에 평면·배관 위치·관리사무소 공사 규정을 미리 알고 시작합니다. 1분 간편 견적으로 비슷한 평형의 예상 비용부터 확인해 보세요.")
    return head(a["title"], a["desc"], url, 2, og) + f'''
<meta name="keywords" content="{e(kw)}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head><body>

<header class="top">
  <a class="logo" href="../../">HOME FURNISHING</a>
  <a class="back" href="../">← 단지별 보기</a>
</header>

<main>
<div class="in head">
  <nav class="crumb" aria-label="현재 위치"><a href="../../">홈</a> › <a href="../../works/">시공 사례</a> › <a href="../">단지별 보기</a></nav>
  <span class="badge"><i aria-hidden="true">✓</i>{badge}</span>
  <h1>{e(a["name"])}</h1>
  <p class="meta">{e(meta)}</p>
  <p class="lead">{e(a["intro"])}</p>
  <div class="cta-row">
    <a class="btn est" href="{est}">1분 간편 견적 받기</a>
    <a class="btn" href="tel:15665904">{ICON_TEL}1566-5904</a>
  </div>
</div>

<section class="in about" aria-labelledby="h-about">
  <div class="lbl">About</div>
  <h2 id="h-about">{"지역 소개" if shop else "단지 소개와 평면 특징"}</h2>
  <dl class="facts">{facts}</dl>
  <p class="plan">{e(a["plan"])}</p>
  <details class="src"><summary>출처 (공개 자료 · 2026년 11월 확인)</summary><ul>{srcs}</ul>
  <p>공개 자료를 옮긴 것으로, 정확한 세대 정보는 관리사무소·건축물대장으로 확인해 주세요.</p></details>
</section>

<section class="alt" aria-labelledby="h-work"><div class="in">
  <div class="lbl">Our Work</div>
  <h2 id="h-work">우리가 한 공사</h2>
  <ul class="work">{work}</ul>
</div></section>

<section class="in spaces" aria-labelledby="h-sp">
  <div class="lbl">Spaces</div>
  <h2 id="h-sp">공간별 사진과 설명</h2>
  <p class="lead">사진을 누르면 크게 볼 수 있습니다. 고객 정보가 보이는 사진은 싣지 않습니다.</p>{sp}
</section>

<section class="alt cta" aria-labelledby="h-cta"><div class="in">
  <span class="badge"><i aria-hidden="true">✓</i>{badge}</span>
  <h2 id="h-cta">{e(cta_t)}</h2>
  <p class="lead">{e(cta_p)}</p>
  <div class="cta-row">
    <a class="btn est" href="{est}">1분 간편 견적 받기</a>
    <a class="btn" href="tel:15665904">{ICON_TEL}전화 상담</a>
    <a class="btn" href="../../#contact">{ICON_KAKAO}카카오톡 상담</a>
  </div>
  <p class="note">견적은 상담 내용 기준의 예상 금액이며, 실측 후 자재와 설계가 확정되면 달라질 수 있습니다.</p>
</div></section>

<nav class="in others" aria-label="다른 단지">
  <div class="lbl">More</div>
  <ul class="chl">{"".join(f'<li><a href="../{o["code"]}/"><b>{e(o["name"])}</b><span>{e(o["kind"] + (" · " + o["py"] if o["py"] else ""))}</span><i aria-hidden="true">→</i></a></li>' for o in APTS if o is not a)}
  <li><a href="../../works/"><b>시공 사례 전체</b><span>사진으로 보기</span><i aria-hidden="true">→</i></a></li></ul>
</nav>
</main>

{FOOT}
{bar(est)}
{LB}
</body></html>
'''

def index():
    url = f"{BASE}/site/apt/"
    title = "단지별 시공 사례 | 홈퍼니싱 · 아르띠꼬 스튜디오"
    desc = "아르띠꼬 스튜디오가 직접 시공한 아파트 단지와 상업 공간을 단지별로 모았습니다. 구리역 롯데캐슬 시그니처, 구의현대 2단지, 고덕 배재현대, 구리 갈매 상업 사무실."
    cards = ""
    for a in APTS:
        img = a["spaces"][0][1][3:]  # site/apt/코드/ 기준 → site/apt/ 기준 (한 단계 위)
        tall = ' class="tall"' if "c_godeok" in img else ""
        cards += f'''
  <li><a href="{a["code"]}/"><div class="ph"><img{tall} src="{img}" alt="{e(a["name"])} 시공 사진" loading="lazy"></div>
    <span class="badge sm"><i aria-hidden="true">✓</i>시공 경험 있음</span><b>{e(a["name"])}</b><span class="m">{e(a["kind"] + (" · " + a["py"] if a["py"] else "") + " · " + a["area"])}</span></a></li>'''
    return head(title, desc, url, 1, BASE + "/site/images/og.jpg").replace('href="../../images', 'href="../images') + f'''
</head><body>
<header class="top">
  <a class="logo" href="../">HOME FURNISHING</a>
  <a class="back" href="../works/">← 시공 사례</a>
</header>
<main>
<div class="in head">
  <div class="lbl">By Complex</div>
  <h1>단지별 보기</h1>
  <p class="lead">우리 단지를 이미 해본 곳인지 확인해 보세요. 같은 단지는 평면과 공사 규정을 알고 시작합니다.</p>
</div>
<ul class="in cards">{cards}
</ul>
<div class="in cta-row center">
  <a class="btn est" href="{EST}index">1분 간편 견적 받기</a>
  <a class="btn" href="tel:15665904">{ICON_TEL}1566-5904</a>
</div>
<p class="in note-c">견적은 상담 내용 기준의 예상 금액이며, 실측 후 자재와 설계가 확정되면 달라질 수 있습니다.</p>
</main>
{FOOT.replace('href="../../"', 'href="../"')}
<div class="bar">
  <a class="est" href="{EST}index">1분 간편 견적</a>
  <a class="call" href="tel:15665904">{ICON_TEL}전화 상담</a>
  <a href="../#contact">{ICON_KAKAO}카카오톡 상담</a>
</div>
</body></html>
'''

os.makedirs(os.path.join(ROOT, "site/apt"), exist_ok=True)
for a in APTS:
    d = os.path.join(ROOT, "site/apt", a["code"]); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(page(a))
open(os.path.join(ROOT, "site/apt/index.html"), "w", encoding="utf-8").write(index())

# sitemap
urls = [BASE+"/site/", BASE+"/site/works/", BASE+"/site/apt/"] + [f"{BASE}/site/apt/{a['code']}/" for a in APTS]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{u}</loc><lastmod>2026-11-24</lastmod></url>\n" for u in urls) + "</urlset>\n"
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(sm)

# 검색어 표
md = ["# 단지별 페이지 검색어 (2026-11-24 v0)\n", "| 단지 | 검색용 제목 | 검색용 설명 |", "|---|---|---|"]
for a in APTS: md.append(f"| {a['name']} | {a['title'].replace('|', chr(92)+'|')} | {a['desc']} |")
md.append("")
for a in APTS:
    md.append(f"## {a['name']} (site/apt/{a['code']}/)\n")
    md += [f"{i+1}. {k}" for i,k in enumerate(KEYWORDS[a['code']])]
    md.append("")
open(os.path.join(ROOT, "site/apt/검색어.md"), "w", encoding="utf-8").write("\n".join(md))
print("ok", len(APTS))
