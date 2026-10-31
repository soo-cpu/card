import urllib.parse as U, base64, html
q=lambda s:U.quote(s)
def km(name,lat,lng): return f"https://map.kakao.com/link/map/{q(name)},{lat},{lng}"
def rv(lat,lng): return f"https://map.kakao.com/link/roadview/{lat},{lng}"
def ks(s): return f"https://map.kakao.com/link/search/{q(s)}"
def nv(s): return f"https://map.naver.com/p/search/{q(s)}"
FONT="/usr/local/lib/python3.13/site-packages/koreanize_matplotlib/fonts/"
img=lambda f:"data:image/png;base64,"+base64.b64encode(open(f,"rb").read()).decode()
# (순번, 제목, 지역, 주소, 층, 전용, 금액, 주차, 역, 평가, 상태, 링크들)
L=[
 ("⭐1","성수동1가 지식산업센터 16층 40평","성수동","성동구 성수동1가 (지식산업센터, 건물명 확인 필요)","16층 (20층 건물)","약 40평","5,000만 / 460만 / 관리비 확인 필요","건물 전체 177대 (호실 배정 확인 필요)","뚝섬역 도보 1분","역 바로 앞, 주차 넉넉, 즉시 입주. 지식산업센터라 입주 가능 업종 확인 필요.","새 매물",
  [("매물 원문·사진","https://xn--v69ao4l1tikjdlql8po.com/item/view/16605"),("카카오맵 뚝섬역 주변",ks("뚝섬역 지식산업센터")),("네이버지도",nv("뚝섬역 지식산업센터"))]),
 ("근접","서울숲역 2층 단독 27평","성수동","성동구 성수동1가 (글 제목은 2가, 주소 확인 필요)","2층 단독 (6층 건물)","27평 (공급 33평)","3,500만 / 330만 / 관리비 20만 (월 약 350만)","확인 필요","서울숲역 2번 출구 도보 5분","2019년 건물, 층 단독 사용, 남녀 분리 화장실, 천장형 냉난방. 30평보다 3평 작음.","새 매물",
  [("매물 원문·사진","https://www.teamtiger.co.kr/b/16716/"),("카카오맵 서울숲역 주변",ks("서울숲역")),("네이버지도",nv("서울숲역"))]),
 ("보류","성수동1가 2층 30평","성수동","성동구 성수동1가 (번지 확인 필요)","2층","30평","5,000만 / 350만 / 관리비 확인 필요","확인 필요","서울숲역 근처 (확인 필요)","조건에 딱 맞는 크기·가격. 같은 중개사 목록에만 보이고 상세는 아직 확인 못 함.","새 매물",
  [("중개사 목록(16716 아래 관련 매물)","https://www.teamtiger.co.kr/b/16716/")]),
]
near=[("서울숲 드림타워 4층 27.51평","3,050만/305만 (추정치)","성수역 도보 5분","https://smatch.kr/property/23684/rent"),
      ("성수동 뚝섬역 18평 (면적 부족, 참고)","3,000만/210만 + 관리비 20만","뚝섬역","https://withusrealty.co.kr/item/view/13694")]
cards=""
for (n,t,a,addr,fl,sz,pr,pk,stn,ev,stt,links) in L:
    btn="".join(f'<a class="btn" href="{html.escape(u)}">{html.escape(x)}</a>' for x,u in links)
    cards+=f'''<div class="card"><div class="ch"><span class="no">{n}</span> {t} <span class="tag">{stt}</span></div>
<table class="kv"><tr><th>주소</th><td>{addr}</td><th>층</th><td>{fl}</td></tr>
<tr><th>전용</th><td>{sz}</td><th>주차</th><td>{pk}</td></tr>
<tr><th>금액</th><td colspan=3><b>{pr}</b></td></tr>
<tr><th>역</th><td colspan=3>{stn}</td></tr>
<tr><th>평가</th><td colspan=3>{ev}</td></tr></table>
<div class="links">{btn}</div></div>'''
nrows="".join(f"<tr><td>{a}</td><td>{b}</td><td>{c}</td><td><a href='{u}'>원문</a></td></tr>" for a,b,c,u in near)
H=f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:"NanumGothic";src:url("file://{FONT}NanumGothic.ttf")}}
@font-face{{font-family:"NanumGothic";font-weight:bold;src:url("file://{FONT}NanumGothicBold.ttf")}}
@page{{size:A4;margin:14mm 12mm 16mm}}
body{{font-family:"NanumGothic";font-size:10.5pt;color:#000;line-height:1.45}}
.cover{{background:#203864;color:#fff;padding:22px 24px;border-radius:4px}}
.cover .logo{{font-size:10pt;letter-spacing:2px;color:#D1E3F3}} .cover h1{{margin:8px 0 4px;font-size:22pt}}
h2{{color:#1F4E79;border-bottom:2px solid #1F4E79;padding-bottom:3px;margin-top:18px;font-size:14pt}}
.sum{{background:#F2F2F2;padding:10px 14px;border-left:5px solid #1F4E79}} .sum p{{margin:3px 0}}
.hl{{background:#FFC000;padding:0 3px}}
.card{{border:1px solid #D1E3F3;border-radius:6px;margin:10px 0;page-break-inside:avoid}}
.ch{{background:#1F4E79;color:#fff;padding:6px 10px;font-weight:bold;font-size:11.5pt}}
.no{{color:#FFC000}} .tag{{float:right;font-size:9pt;font-weight:normal;color:#D1E3F3}}
table{{border-collapse:collapse;width:100%}} .kv th{{background:#F2F2F2;width:44px;text-align:left;padding:4px 6px;font-size:9.5pt;color:#1F4E79}}
.kv td{{padding:4px 6px;border-bottom:1px solid #F2F2F2}}
.links{{padding:6px 8px}} .btn{{display:inline-block;background:#D1E3F3;color:#1F4E79;text-decoration:none;padding:4px 9px;border-radius:12px;margin:2px 4px 2px 0;font-size:9.5pt;font-weight:bold}}
.t th{{background:#1F4E79;color:#fff;padding:5px}} .t td{{padding:5px;border-bottom:1px solid #ddd}} .t tr:nth-child(even) td{{background:#F2F2F2}}
.maps{{display:flex;gap:6px}} .maps img{{width:50%}} .note{{color:#7F7F7F;font-size:9pt}}
.foot{{color:#7F7F7F;font-size:8.5pt;text-align:center;margin-top:20px}}
</style></head><body>
<div class="cover"><div class="logo">HOME FURNISHING CO.</div><h1>사옥 매물 2026-11-01</h1>
<div>본사 사옥 이전 (구리 인창동 → 서울, 2027년) · 11월 1일 새 매물 · 월세 500만 원까지 기준</div></div>
<h2>요약</h2><div class="sum">
<p>📊 <b>분석:</b> 새 매물 3건, 모두 성수동. <span class="hl">뚝섬역 1분 지식산업센터 40평 460만(건물 주차 177대)</span>이 오늘 가장 좋음.</p>
<p>🎯 <b>향후 계획:</b> 지식산업센터는 인테리어·디자인 회사 입주 가능 여부부터 확인. 서울숲역 27평은 30평 미만이지만 가성비 좋아 함께 보기.</p>
<p>⚠️ <b>주의:</b> 웹 검색 글 기준. 건물명·번지·관리비는 확인 필요라 로드뷰 버튼은 없음(번지 확인 후 추가).</p></div>
<p class="note">※ 오늘 매물은 번지가 확인되지 않아 위치 약도·로드뷰 대신 역 주변 지도 링크를 넣었습니다. 지난 후보 전체는 옵시디언 「사옥 후보 목록 2026-11-01 v1」에 있습니다.</p>
<h2>새 매물</h2>{cards}
<h2>참고</h2><table class="t"><tr><th>매물</th><th>보증금/월세</th><th>역</th><th>링크</th></tr>{nrows}</table>
<h2>분석</h2><table class="t"><tr><th>구분</th><th>현황</th><th>문제점</th><th>개선점</th></tr>
<tr><td>새 매물</td><td>3건 (성수동1가)</td><td>광장·구의·청량리 새 매물 없음</td><td>내일도 4개 지역 계속 검색</td></tr>
<tr><td>주차</td><td>지식산업센터 177대</td><td>호실 배정 대수 모름</td><td>방문객 주차 가능 여부 문의</td></tr>
<tr><td>정보</td><td>웹 검색 글 기준</td><td>건물명·번지·관리비 없음</td><td>중개사 확인 후 로드뷰 추가</td></tr></table>
<h2>향후 계획</h2><table class="t"><tr><th>할 일</th><th>담당</th><th>기한</th><th>우선순위</th></tr>
<tr><td>뚝섬역 지식산업센터 40평: 건물명·관리비·입주 업종·방문객 주차 문의</td><td>대표</td><td>자료 필요</td><td>상</td></tr>
<tr><td>서울숲역 27평·성수동1가 30평(팀타이거) 상세 문의</td><td>대표</td><td>자료 필요</td><td>중</td></tr>
<tr><td>매일 07:37 새 매물 정리 (이 대화에 바로 표시)</td><td>Claude</td><td>매일</td><td>중</td></tr></table>
<div class="foot">ⓒ HOME FURNISHING CO. all rights reserved.</div></body></html>'''
open("report.html","w").write(H)
