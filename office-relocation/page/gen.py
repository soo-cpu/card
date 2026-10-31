import urllib.parse as U, html, json
q=U.quote
KS=lambda s:f"https://map.kakao.com/link/search/{q(s)}"
KM=lambda n,la,lo:f"https://map.kakao.com/link/map/{q(n)},{la},{lo}"
RV=lambda la,lo:f"https://map.kakao.com/link/roadview/{la},{lo}"
NV=lambda s:f"https://map.naver.com/p/search/{q(s)}"
IMG=lambda s:f"https://search.naver.com/search.naver?where=image&query={q(s)}"
DG="https://realty.daangn.com/articles/"
# (no, 제목, 상태, 금액, 넓이/층, 주차, 역, 평가, 사진원문, 사진검색어, 지도검색어, 좌표)
A=[
("22","뚝섬역 지식산업센터 16층","검토","5,000 / 460 / 관리비 ?","약 40평 · 16층","건물 177대","뚝섬역 1분","역 바로 앞, 주차 넉넉. 입주 업종 확인 필요 (11/1 새)","https://xn--v69ao4l1tikjdlql8po.com/item/view/16605","성수동 뚝섬역 지식산업센터","뚝섬역 지식산업센터",None),
("1","성수동2가 대로변 40평","검토","4,000 / 350 / 60","40평 · 층 ?","확인 필요","성수역 5분","큰길·역 가까움, 업무 홀·유리 회의실 인테리어 있음","http://www.onestopoffice.co.kr/m/detail?gid=73328","성수동 대로변 사무실 인테리어","성수역",None),
("2","성수동2가 4층 50평","검토","4,000 / 400 / 60","50평 · 4층","자주식 가능","성수역 ?","넓이 대비 가장 쌈, 상담실·샘플실 여유","https://www.teamtiger.co.kr/b/16606/","성수역 대로변 사무실 자주식주차","성수역",None),
("3","성수동2가 신축 3층 38평","검토","3,400 / 340 / 60","38평 · 3층","무료 1대","성수역 10분","신축 첫 입주","http://onestopoffice.co.kr/m/detail?gid=73330","성수동2가 신축 사무실","성수역",None),
("4","더 스페이스 타워","검토","4,800 / 480 / 81","49.6평 · 층 ?","건물 107대","뚝섬역 11분","주차 최고. 지하 1층일 수 있어 확인 필요",DG+"4613020","성수 더스페이스타워","서울 성동구 광나루로 144",(37.55130,127.04643)),
("7","연무장1길 2층 35평","검토","3,000 / 300 / 7","35평 · 2층","1대","성수역 9분","가격 가장 좋음. 사무실 용도 확인 필요",DG+"3500095","성수동 연무장1길 15-1","서울 성동구 연무장1길 15-1",(37.54449,127.05116)),
("5","성수 지식산업센터 4층 코너","검토","5,000 / 440 / ?","35.5평 · 4층","2대","성수역 ?","주차 2대. 입주 업종 확인 필요",None,"성수동 지식산업센터 사무실","성수동 지식산업센터",None),
("6","연무장길 1층 쇼룸형","검토","5,000 / 500 / ?","실 30평 · 1층","2대","확인 필요","쇼룸 겸 상담실, 하이엔드 이미지",None,"성수동 연무장길 1층 상가","성수동 연무장길",None),
("27","[8호선] 석촌동 신축 29평","검토","3,500 / 290 / ?","29평 · 층 ?","확인 필요","석촌역 (거리 확인 필요)","신축, 층고 높음. 구리역에서 8호선 직통 (11/1 새)","http://www.moosung.co.kr/153/rent.php?zone=&select=13","석촌동 신축 사무실","석촌역",None),
("28","[8호선] 석촌동 31평","검토","3,000 / 200 / ?","31평 · 층 ?","확인 필요","석촌역 (거리 확인 필요)","가성비 소형 사무실, 30평 기준 가장 쌈 (11/1 새)","http://www.moosung.co.kr/153/rent.php?zone=&select=13","석촌동 사무실","석촌역",None),
("31","[8호선] 성내동 32평","검토","4,000 / 250 / ?","32평 · 2~4층","확인 필요","강동구청역 근처","구리역에서 19분, 30평대에 250만 (11/1 새)","https://realty.daangn.com/map/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C/%EA%B0%95%EB%8F%99%EA%B5%AC/%EC%84%B1%EB%82%B4%EB%8F%99","강동구청역 사무실","강동구청역",None),
("23","서울숲역 2층 단독 27평","검토","3,500 / 330 / 20","27평 · 2층","확인 필요","서울숲역 5분","2019년 건물, 남녀 분리 화장실 (11/1 새)","https://www.teamtiger.co.kr/b/16716/","서울숲역 사무실 2층","서울숲역",None),
("8","용두동 고층 25평","검토","3,000 / 160 / ?","25평 · 고층","확인 필요","청량리역 6분","출퇴근 가장 편하고 쌈","https://realty.daangn.com/map/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C/%EB%8F%99%EB%8C%80%EB%AC%B8%EA%B5%AC/%EC%9A%A9%EB%91%90%EB%8F%99/%EC%9B%94%EC%84%B8","용두동 청량리역 사무실","청량리역",None),
("24","성수동1가 2층 30평","보류","5,000 / 350 / ?","30평 · 2층","?","서울숲역 근처","상세 미확인","https://www.teamtiger.co.kr/b/16716/","성수동1가 사무실 2층","서울숲역",None),
("9","용두동 40평","보류","2,000 / 130 / ?","40평","?","용두역","169일 전 글",DG+"3008568","용두동 사무실","용두역",None),
("10","광진구 약 30평","보류","2,000 / 150 / ?","약 30평","?","?","구의·광장동인지 확인","https://realty.daangn.com/map/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C/%EA%B4%91%EC%A7%84%EA%B5%AC/%EA%B5%AC%EC%9D%98%EB%8F%99/%EC%9B%94%EC%84%B8","구의동 사무실","구의역",None),
("12","성수동2가 3층 40평","보류","5,000 / 450 / ?","40평 · 3층","?","성수역 7분","주차·관리비 모름","https://www.teamtiger.co.kr/b/16607/","성수역 연무장길 근생 사무실","성수역",None),
("13","성수동2가 3층","보류","5,000 / 500 / ?","? · 3층","?","성수역 9분","넓이 모름","https://realty.daangn.com/map/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C/%EC%84%B1%EB%8F%99%EA%B5%AC/%EC%84%B1%EC%88%98%EB%8F%992%EA%B0%80","성수동2가 사무실","성수역",None),
("14","구의동 1층 40평","보류","5,000 / 450","40평 · 1층","?","구의역 10분","1층이라 비쌈","https://www.teamtiger.co.kr/b/14173/","구의역 1층 사무실","구의역",None),
("15","구의동 1층 40평 (보증금 1억)","보류","10,000 / 500","40평 · 1층","?","구의역","보증금 큼","https://www.teamtiger.co.kr/b/14173/","구의역 1층 상가","구의역",None),
("25","서울숲 드림타워 4층","보류","3,050 / 305 (추정)","27.5평 · 4층","?","성수역 5분","추정 임대료","https://smatch.kr/property/23684/rent","서울숲 드림타워","서울숲 드림타워",None),
("29","[8호선] 문정역 테라타워 9층 코너","보류","4,000 / 340 / 38","32평 · 9층","2대 (1대 월 5만)","문정역 지하 연결","2024년 4월 글이라 지금은 없을 수 있음. 같은 건물 다른 호실 문의 가치","https://sixth.sosohan365.com/6","문정역 테라타워","문정역 테라타워",None),
("32","[8호선] 성내동 25평","보류","2,000 / 150 / ?","25평","?","강동구청역 근처","30평보다 작음","https://realty.daangn.com/map/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C/%EA%B0%95%EB%8F%99%EA%B5%AC/%EC%84%B1%EB%82%B4%EB%8F%99","강동구청역 사무실","강동구청역",None),
("33","[8호선] 잠실새내 30평","보류","3,000 / 180 / ?","30평","?","잠실새내역 5분","인테리어 깔끔. 출처 글 미확인","http://www.moosung.co.kr/153/rent.php?zone=&select=13","잠실새내역 사무실","잠실새내역",None),
("34","[8호선] 석촌동 26평","보류","6,000 / 370 / ?","26평","?","석촌역","주차 정보 없음, 30평보다 작음","http://www.moosung.co.kr/153/rent.php?zone=&select=13","석촌역 사무실","석촌역",None),
("36","[8호선] 가락시장역 상가 35평","보류","4,550 / 455 / ?","35평","?","가락시장역 출구 앞","상가라 사무실 용도 확인 필요","https://www.teamtiger.co.kr/b/17707/","가락시장역 상가","가락시장역",None),
("11","성수동2가 37평","보류","3,800 / 380","37평","?","성수역 5분","링크 없음",None,"성수동2가 사무실 37평","성수역",None),
]
X=[("17","성수동2가 지하 30평 5,000/280","지하",DG+"2389197"),("16","성수동1가 23평 4,000/330","면적 부족",None),("18","광장동 20평 2,500/130","면적 부족",None),("19","청량리동 1층 8,000/600","예산 초과","https://www.nemoapp.kr/share/store/855911"),("20","연무장길 초입 4층 35평 7,000/600","예산 초과",None),("21","윈스타워 28평 7,500/750","예산 초과",None),("26","뚝섬역 18평 3,000/210","면적 부족","https://withusrealty.co.kr/item/view/13694"),("30","[8호선] 테라타워 55평 6,000/520","예산 초과·오래된 글","https://blog.daum.net/inchononeroom/5931"),("35","[8호선] 문정 엠스테이트 19평 3,000/360","면적 부족","https://land.daara.co.kr/m/article/view.php?sell_idx=7193070"),("37","[8호선] 천호역 상가 24평 5,000/580","예산 초과",None)]
e=html.escape
def card(r):
    no,t,st,pr,sz,pk,stn,ev,src,img,mq,co=r
    b=[]
    if src: b.append(f'<a class="b main" href="{e(src)}">매물 사진·원문 보기</a>')
    b.append(f'<a class="b" href="{e(IMG(img))}">건물·주변 사진 검색</a>')
    if co:
        b.append(f'<a class="b" href="{e(RV(*co))}">로드뷰</a>')
        b.append(f'<a class="b" href="{e(KM(t,*co))}">카카오맵 위치</a>')
    else: b.append(f'<a class="b" href="{e(KS(mq))}">카카오맵 (주변)</a>')
    b.append(f'<a class="b" href="{e(NV(mq))}">네이버지도</a>')
    return f'''<div class="card {st}"><div class="h"><span class="no">#{no}</span>{e(t)}<span class="st">{st}</span></div>
<div class="g"><div><i>금액</i><b>{e(pr)}</b></div><div><i>넓이·층</i>{e(sz)}</div><div><i>주차</i>{e(pk)}</div><div><i>역</i>{e(stn)}</div></div>
<p>{e(ev)}</p><div class="bs">{"".join(b)}</div></div>'''
rev=[r for r in A if r[2]=="검토"]; hold=[r for r in A if r[2]=="보류"]
xs="".join(f'<li>#{n} {e(t)} — {e(w)}'+(f' · <a href="{e(u)}">원문</a>' if u else '')+'</li>' for n,t,w,u in X)
H=f'''<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>사옥 후보 보드</title><style>
body{{margin:0;font-family:-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;background:#F2F2F2;color:#111}}
header{{background:#203864;color:#fff;padding:18px 16px}} header small{{color:#D1E3F3;letter-spacing:2px;font-size:11px}} header h1{{margin:6px 0 4px;font-size:22px}} header p{{margin:0;font-size:13px;color:#D1E3F3}}
main{{max-width:760px;margin:0 auto;padding:12px}}
.note{{background:#fff;border-left:4px solid #FFC000;padding:10px 12px;font-size:13px;border-radius:4px}}
h2{{color:#1F4E79;font-size:17px;margin:20px 4px 8px}}
.card{{background:#fff;border-radius:10px;margin:10px 0;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}}
.h{{background:#1F4E79;color:#fff;padding:10px 12px;font-weight:700;font-size:15px}} .card.보류 .h{{background:#7F7F7F}}
.no{{color:#FFC000;margin-right:6px}} .st{{float:right;font-weight:400;font-size:12px;color:#D1E3F3}}
.g{{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;padding:10px 12px 0;font-size:14px}} .g i{{display:block;font-style:normal;color:#7F7F7F;font-size:11px}}
.card p{{margin:8px 12px;font-size:13px;color:#333}}
.bs{{display:flex;flex-wrap:wrap;gap:6px;padding:4px 12px 12px}}
.b{{background:#D1E3F3;color:#1F4E79;text-decoration:none;padding:8px 11px;border-radius:18px;font-size:13px;font-weight:700}}
.b.main{{background:#1F4E79;color:#fff;flex-basis:100%;text-align:center;padding:11px}}
ul{{background:#fff;border-radius:10px;padding:10px 12px 10px 28px;font-size:13px}} a{{color:#1F4E79}}
footer{{text-align:center;color:#7F7F7F;font-size:11px;padding:20px}}
</style></head><body>
<header><small>HOME FURNISHING CO.</small><h1>사옥 후보 보드</h1><p>본사 이전 (구리 → 서울, 2027) · 2026-11-01 기준 37건 (8호선 11건 추가) · 검토 {len(rev)} · 보류 {len(hold)} · 제외 {len(X)}</p></header>
<main><div class="note"><b>사진 보는 법:</b> 파란 <b>[매물 사진·원문 보기]</b>를 누르면 중개사 글의 실제 사진이 열립니다. 원문 링크가 없는 매물은 <b>[건물·주변 사진 검색]</b>(네이버 이미지)과 <b>[로드뷰]</b>로 확인하세요. 로드뷰는 번지까지 확인된 매물만 있습니다. 모든 정보는 웹 검색 글 기준이라 지금도 나와 있는지는 확인이 필요합니다.</div>
<div class="note" style="margin-top:10px;border-left-color:#1F4E79"><b>8호선 라인 추가 (11/1):</b> 별내선 연장으로 구리역에서 8호선 직통. 구리역→천호 17분 · 강동구청 19분 · 잠실 23분 · 문정 31분. 석촌·성내 30평대 월세 200~290만으로 성수보다 쌈.</div><h2>검토 (좋은 순서)</h2>{"".join(card(r) for r in rev)}
<h2>보류</h2>{"".join(card(r) for r in hold)}
<h2>제외</h2><ul>{xs}</ul></main>
<footer>ⓒ HOME FURNISHING CO. all rights reserved.</footer></body></html>'''
open("index.html","w").write(H)
