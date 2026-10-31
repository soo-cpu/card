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
 ("⭐1","성수동2가 대로변 40평","성수동","성동구 성수동2가 (대로변, 정확한 번지 확인 필요)","확인 필요","40평 (임대 65평)","4,000만 / 350만 / 관리비 60만 (월 약 410만)","확인 필요","성수역 도보 5분","큰길·역 5분, 업무 홀·유리 회의실 인테리어 있음. 고객이 찾기 가장 쉬움.","다시 보기",
  [("매물 원문·사진","http://www.onestopoffice.co.kr/m/detail?gid=73328"),("카카오맵 성수역 주변",ks("성수역")),("네이버지도",nv("성수동2가 성수역"))]),
 ("⭐2","성수동2가 4층 50평","성수동","성동구 성수동2가 (대로변 표기, 번지 확인 필요)","4층 (6층 건물)","50평","4,000만 / 400만 / 관리비 60만 (월 약 460만)","자주식 가능 (대수 확인 필요)","성수역 (거리 확인 필요)","평당 8만 원, 넓이 대비 가장 쌈. 상담실·자재 샘플실까지 넉넉.","새 매물",
  [("매물 원문·사진 (일치 확인 필요)","https://www.teamtiger.co.kr/b/16606/"),("카카오맵 성수역 주변",ks("성수역"))]),
 ("⭐3","성수동2가 신축 3층 38평","성수동","성동구 성수동2가 (번지 확인 필요)","3층","38평 (임대 54평)","3,400만 / 340만 / 관리비 60만 (월 약 400만)","무료 1대","성수역 도보 10분","신축 첫 입주. 깔끔한 상태로 바로 꾸미기 좋음.","다시 보기",
  [("매물 원문·사진 (일치 확인 필요)","http://onestopoffice.co.kr/m/detail?gid=73330"),("카카오맵 성수역 주변",ks("성수역"))]),
 ("⭐4","더 스페이스 타워 49.6평","성수동","성동구 성수동1가, 광나루로 144","확인 필요 (지하 1층이라는 검색 결과도 있음)","49.6평","4,800만 / 480만 / 관리비 81만 (월 약 561만)","건물 전체 107대","뚝섬역 도보 약 11분 (673m)","주차는 후보 중 최고. 지상층인지 먼저 확인.","다시 보기",
  [("매물 원문·사진","https://realty.daangn.com/articles/4613020"),("카카오맵 위치",km("더 스페이스 타워 (광나루로 144)",37.55130,127.04643)),("로드뷰",rv(37.55130,127.04643)),("네이버지도",nv("서울 성동구 광나루로 144"))]),
 ("⭐5","성수 지식산업센터 4층 코너","성수동","성동구 성수동 (건물명 확인 필요)","4층 코너","35.5평 + 발코니 7평","5,000만 / 440만 / 관리비 확인 필요","2대 (1대 무료, 1대 월 7만)","성수역 (거리 확인 필요)","주차 2대 확보. 입주 가능 업종 확인 필요.","다시 보기",
  [("카카오맵 성수 지식산업센터",ks("성수동 지식산업센터"))]),
 ("⭐6","연무장길 1층 쇼룸형 30평","성수동","성동구 성수동1가 연무장길 (번지 확인 필요)","1층","실 30평","5,000만 / 500만 / 관리비 확인 필요","2대","성수역 (거리 확인 필요)","1층 쇼룸 겸 상담실로 최고 (하이엔드 이미지). 월세는 상한선.","다시 보기",
  [("카카오맵 연무장길",ks("성수동 연무장길"))]),
 ("기존 추천","연무장1길 15-1, 2층 35평","성수동","성동구 성수동2가, 연무장1길 15-1","2층 (4층 건물)","35평 (115.7㎡)","3,000만 / 300만 / 관리비 7만 (월 약 307만)","1대","성수역 도보 약 9분 (595m)","가격 가장 좋음. 상가라 사무실 용도 가능 여부 확인 필요.","v0 추천",
  [("매물 원문·사진","https://realty.daangn.com/articles/3500095"),("카카오맵 위치",km("연무장1길 15-1",37.54449,127.05116)),("로드뷰",rv(37.54449,127.05116)),("네이버지도",nv("서울 성동구 연무장1길 15-1"))]),
 ("가성비","용두동 고층 25평","청량리 일대","동대문구 용두동 (번지 확인 필요)","고층","25평 (84㎡)","3,000만 / 160만 / 관리비 확인 필요","확인 필요","청량리역 도보 6분","출퇴근 가장 편하고 쌈. 30평보다 5평 작음.","v0",
  [("당근 용두동 목록","https://realty.daangn.com/map/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C/%EB%8F%99%EB%8C%80%EB%AC%B8%EA%B5%AC/%EC%9A%A9%EB%91%90%EB%8F%99/%EC%9B%94%EC%84%B8"),("카카오맵 청량리역",ks("청량리역"))]),
]
near=[("성수동2가 3층 40평","5,000만/450만","성수역 도보 7분","https://www.teamtiger.co.kr/b/16607/"),
      ("성수동2가 3층 (넓이 확인 필요)","5,000만/500만","성수역 도보 9분","https://realty.daangn.com/map/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C/%EC%84%B1%EB%8F%99%EA%B5%AC/%EC%84%B1%EC%88%98%EB%8F%992%EA%B0%80"),
      ("구의동 1층 40평","1억/500만","구의역","https://www.teamtiger.co.kr/b/14173/"),
      ("구의동 1층 40평","5,000만/450만","구의역 도보 10분","https://www.teamtiger.co.kr/b/14173/")]
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
<div class="cover"><div class="logo">HOME FURNISHING CO.</div><h1>사옥 매물 2026-10-31 v2</h1>
<div>본사 사옥 이전 (구리 인창동 → 서울, 2027년) · 월세 500만 원까지 넓힌 기준 · 위치·로드뷰 링크 포함</div></div>
<h2>요약</h2><div class="sum">
<p>📊 <b>분석:</b> 월세를 500만 원까지 보면 <span class="hl">성수동 35~50평, 주차 1~2대 매물</span>이 여러 개 생김. 광장동·청량리는 400~500만 원대 새 매물 없음.</p>
<p>🎯 <b>향후 계획:</b> ⭐1 대로변 40평 · ⭐2 50평 400만 · ⭐4 더 스페이스 타워(주차 107대)부터 중개사 확인 → 현장 방문.</p>
<p>⚠️ <b>주의:</b> 모두 웹 검색에 잡힌 글 기준. 지금도 나와 있는지, 층, 사무실 용도 가능 여부는 확인 필요.</p></div>
<h2>위치 약도</h2><div class="maps"><img src="{img('map_all.png')}"><img src="{img('map_ss.png')}"></div>
<p class="note">※ 이 작업 환경에서는 카카오맵·네이버지도·매물 사이트 사진 서버 접속이 막혀 있어, 지도 사진·로드뷰·매물 사진을 문서에 직접 넣지 못했습니다. 아래 각 매물의 <b>[매물 원문·사진] [카카오맵 위치] [로드뷰]</b> 버튼을 누르면 휴대폰에서 바로 열립니다. 로드뷰는 정확한 주소가 확인된 매물만 있습니다.</p>
<h2 style="page-break-before:always">추천 매물</h2>{cards}
<h2>조건 근접 (정보 부족)</h2><table class="t"><tr><th>매물</th><th>보증금/월세</th><th>역</th><th>링크</th></tr>{nrows}</table>
<h2>분석</h2><table class="t"><tr><th>구분</th><th>현황</th><th>문제점</th><th>개선점</th></tr>
<tr><td>매물 수</td><td>성수 위주로 추천 6건</td><td>광장동·청량리 30평 매물 적음</td><td>매일 아침 검색 계속, 범위 유지</td></tr>
<tr><td>정보 정확도</td><td>웹 검색 글 기준</td><td>번지·층·사진 일부 없음</td><td>중개사 전화로 확인, 환경에 매물 사이트 허용</td></tr>
<tr><td>주차</td><td>1대~107대로 차이 큼</td><td>성수는 골목 주차 어려움</td><td>방문객 주차·공영주차장 같이 확인</td></tr>
<tr><td>비용</td><td>월 합계 307만~561만</td><td>관리비 60~81만으로 큼</td><td>관리비 포함 총액으로 비교</td></tr></table>
<h2>향후 계획</h2><table class="t"><tr><th>할 일</th><th>담당</th><th>기한</th><th>우선순위</th></tr>
<tr><td>⭐1·⭐2·⭐4 중개사 연락 (지금도 있는지, 층, 주차, 입주 시기)</td><td>대표</td><td>자료 필요</td><td>상</td></tr>
<tr><td>연무장1길 15-1 사무실 용도(건축물대장) 확인</td><td>대표</td><td>자료 필요</td><td>상</td></tr>
<tr><td>예약 작업에 Google Drive 연결 추가</td><td>대표</td><td>11/1 07:37 전</td><td>상</td></tr>
<tr><td>매일 아침 새 매물 정리 (PDF 포함)</td><td>Claude (예약 작업)</td><td>매일 07:37</td><td>중</td></tr></table>
<div class="foot">ⓒ HOME FURNISHING CO. all rights reserved.</div></body></html>'''
open("report.html","w").write(H)
