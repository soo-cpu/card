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
 ("⭐1","[8호선 인근] 성내동 34평 강동역 5분","8호선","강동구 성내동 (번지 확인 필요)","확인 필요","34평 (113㎡)","3,500만 / 325만 / 관리비 56만 (월 약 381만 + 월세 부가세)","주차 편리 (대수 확인 필요)","강동역 도보 5분 (강동구청역 8호선 인근)","넓이와 월세가 조건에 딱 맞음. 관리비가 큰 편.","새 매물",
  [("매물 원문·사진","https://www.nemoapp.kr/share/office/903944"),("카카오맵",ks("강동역")),("네이버지도",nv("성내동 강동역"))]),
 ("보류","[8호선] 석촌·송파동 4층 30평","8호선","송파구 송파동·석촌동","4층","30평","4,000만 / 300만","확인 필요","석촌역 근처 (확인 필요)","크기·가격 딱 맞지만 다른 매물 글의 목록에만 보임.","새 매물",
  [("관련 목록","https://www.teamtiger.co.kr/b/17707/"),("카카오맵",ks("석촌역"))]),
]
near=[("방이동 신축 30.6평 (#41과 같은 건물일 수 있음)","5,000만/400만","역세권","http://www.moosung.co.kr/153/rent.php?zone=&select=13"),
      ("길동·성내동 30평대 여러 건 (게시 시점 확인 필요)","1,000~3,000만/100~150만","길동역·강동구청역","https://moosung.co.kr/m/under.php?select=&zone=4"),
      ("구의동 리젠트오피스텔 40~54평 (실내 주차)","확인 필요","강변역 6분","https://zippoom.com/%EB%B6%80%EB%8F%99%EC%82%B0/%EC%84%9C%EC%9A%B8-%EA%B4%91%EC%A7%84%EA%B5%AC-%EA%B5%AC%EC%9D%98%EB%8F%99-%EB%A6%AC%EC%A0%A0%ED%8A%B8%EC%98%A4%ED%94%BC%EC%8A%A4%ED%85%94/l831y5")]
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
<div class="cover"><div class="logo">HOME FURNISHING CO.</div><h1>사옥 매물 2026-11-03</h1>
<div>본사 사옥 이전 (구리 인창동 → 서울, 2027년) · 11월 3일 새 매물 · 8호선 포함</div></div>
<h2>요약</h2><div class="sum">
<p>📊 <b>분석:</b> 새 매물 5건 (검토 1, 보류 4). <span class="hl">성내동 34평 325만, 강동역 5분</span>이 오늘 추천.</p>
<p>🎯 <b>향후 계획:</b> 성내동 34평은 주차 대수·층 확인. 전체 1순위는 여전히 방이동 39평(270만, 주차 6대).</p>
<p>⚠️ <b>주의:</b> 웹 검색 글 기준. 건물명·번지·관리비는 확인 필요라 로드뷰 버튼은 없음(번지 확인 후 추가).</p></div>
<p class="note">※ 오늘 매물은 번지가 확인되지 않아 위치 약도·로드뷰 대신 역 주변 지도 링크를 넣었습니다. 전체 49건은 사옥 후보 보드(https://claude.ai/artifact/VHF9xWoBax8QN7oj1Z3mpB)와 옵시디언 「사옥 후보 목록 2026-11-03 v4」에 있습니다.</p>
<h2>새 매물</h2>{cards}
<h2>참고</h2><table class="t"><tr><th>매물</th><th>보증금/월세</th><th>역</th><th>링크</th></tr>{nrows}</table>
<h2>분석</h2><table class="t"><tr><th>구분</th><th>현황</th><th>문제점</th><th>개선점</th></tr>
<tr><td>새 매물</td><td>5건 (8호선 쪽 4, 구의 1)</td><td>성수·청량리 새 매물 없음</td><td>내일도 전 지역 검색</td></tr>
<tr><td>가격</td><td>8호선 30평대 170~400만</td><td>관리비·주차 정보 부족</td><td>중개사 문의 때 총액 확인</td></tr></table>
<h2>향후 계획</h2><table class="t"><tr><th>할 일</th><th>담당</th><th>기한</th><th>우선순위</th></tr>
<tr><td>성내동 34평(네모 903944) 주차 대수·층 문의</td><td>대표</td><td>자료 필요</td><td>상</td></tr>
<tr><td>방이동 39평(팀타이거 16941) 문의 (11/2 1순위)</td><td>대표</td><td>자료 필요</td><td>상</td></tr></table>
<div class="foot">ⓒ HOME FURNISHING CO. all rights reserved.</div></body></html>'''
open("report.html","w").write(H)
