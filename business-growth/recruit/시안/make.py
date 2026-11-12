# 채용공고 디자인 시안 4종 만들기 (같은 내용, 디자인만 다름)
BODY = """
<header>
  <div class="tag">경력직 채용</div>
  <div class="co">주식회사 홈퍼니싱 · 아르띠꼬 스튜디오</div>
  <h1>상담부터 현장까지,<br>끝까지 맡을 분을 찾습니다</h1>
  <p class="lead">인테리어 영업 상담 · 현장 관리 경력직 1명</p>
</header>
<main>
  <section class="s-info"><h2><span>01</span>모집 분야</h2>
    <table>
      <tr><th>직무</th><td>영업 상담 + 현장 관리 (겸임)</td></tr>
      <tr><th>인원</th><td>1명</td></tr>
      <tr><th>근무지</th><td>[근무지]</td></tr>
    </table>
  </section>
  <section><h2><span>02</span>하는 일</h2>
    <ul>
      <li>고객 상담 · 실측 · 견적 · 계약</li>
      <li>아파트 리모델링, 학교 · 공공시설 현장 관리</li>
      <li>공정 · 협력업체 · 원가 관리, 준공과 사후 관리</li>
    </ul>
  </section>
  <section><h2><span>03</span>지원 자격</h2>
    <ul>
      <li>인테리어 · 실내건축 현장 관리 경력</li>
      <li>상담부터 계약까지 직접 해 본 분</li>
      <li>운전 가능한 분</li>
    </ul>
  </section>
  <section><h2><span>04</span>우대 사항</h2>
    <ul>
      <li>관련 자격증 소지자 (실내건축기사 · 산업기사 · 기능사, 건축기사 등)</li>
      <li>아파트 · 관공서 공사 경험</li>
    </ul>
  </section>
  <section class="s-info"><h2><span>05</span>근무 조건</h2>
    <table>
      <tr><th>고용 형태</th><td>[고용 형태]</td></tr>
      <tr><th>급여</th><td>[급여]</td></tr>
      <tr><th>근무 시간</th><td>[근무 시간]</td></tr>
    </table>
  </section>
  <section class="s-apply"><h2><span>06</span>지원 방법</h2>
    <div class="point"><b>접수</b> [접수 방법]<i></i><b>마감</b> [마감일]<i></i><b>절차</b> 서류 → 면접 → 최종 합격</div>
  </section>
</main>
<footer><b>문의</b> [담당자 · 연락처]<em>디자인 시안 {k} · 내용은 예시</em></footer>
"""
BASE = """*{box-sizing:border-box}html,body{margin:0}
body{width:860px;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2,p,ul,table{margin:0}table{width:100%;border-collapse:collapse}th{text-align:left}
section{break-inside:avoid}.point i{display:inline-block;width:22px}
footer em{float:right;font-style:normal;font-size:13px;opacity:.6}
@page{size:A4;margin:0}@media print{body{width:auto}}
"""
D = {}
D["A"] = ("남색 정돈형", "Noto+Sans+KR:wght@400;500;700;900", """
body{font-family:'Noto Sans KR',sans-serif;color:#111418;background:#fff}
header{background:#203864;color:#fff;padding:56px 56px 50px}
.tag{display:inline-block;background:#FFC000;color:#203864;font-weight:700;font-size:15px;padding:5px 14px;border-radius:4px}
.co{margin-top:22px;font-size:16px;color:#c9d6e6}
h1{margin-top:8px;font-size:42px;font-weight:900;line-height:1.3}
.lead{margin-top:14px;font-size:19px;color:#dbe4ef}
main{padding:42px 56px 10px}section{margin-bottom:34px}
h2{font-size:22px;font-weight:700;color:#1F4E79;padding-left:12px;border-left:6px solid #FFC000;margin-bottom:14px}
h2 span{display:none}
ul{padding-left:22px;font-size:18px}li{margin:5px 0}
table{font-size:18px}th,td{padding:11px 14px;border-bottom:1px solid #d9dde2}
th{width:150px;background:#F2F2F2;color:#1F4E79}
.point{background:#F2F2F2;border-radius:10px;padding:18px 22px;font-size:18px}.point b{color:#1F4E79;margin-right:6px}
footer{background:#1F4E79;color:#fff;padding:28px 56px;font-size:17px}footer b{color:#FFC000;margin-right:8px}
""")
D["B"] = ("흑백 미니멀", "Noto+Serif+KR:wght@400;600;900&family=Noto+Sans+KR:wght@400;500;700", """
body{font-family:'Noto Sans KR',sans-serif;color:#111;background:#fff}
header{padding:70px 64px 46px;border-bottom:2px solid #111;margin:0}
.tag{font-size:14px;letter-spacing:.3em;font-weight:700}
.co{margin-top:44px;font-size:15px;color:#666}
h1{margin-top:10px;font-family:'Noto Serif KR',serif;font-size:46px;font-weight:900;line-height:1.35;letter-spacing:-.01em}
.lead{margin-top:20px;font-size:18px;color:#444}
main{padding:10px 64px 0}
section{display:grid;grid-template-columns:190px 1fr;padding:30px 0;border-bottom:1px solid #ddd}
h2{font-family:'Noto Serif KR',serif;font-size:21px;font-weight:600}
h2 span{display:block;font-family:'Noto Sans KR';font-size:13px;color:#999;font-weight:500;margin-bottom:2px}
ul{list-style:none;padding:0;font-size:18px}li{margin:0 0 8px;padding-left:18px;position:relative}
li:before{content:"";position:absolute;left:0;top:14px;width:8px;height:1px;background:#111}
table{font-size:18px}th,td{padding:0 0 10px;vertical-align:top}th{width:120px;font-weight:500;color:#777}
.point{font-size:18px;line-height:2}.point b{font-weight:500;color:#777;margin-right:10px}.point i{display:block;width:0;height:0}
footer{padding:34px 64px 44px;font-size:17px}footer b{margin-right:10px}
""")
D["C"] = ("따뜻한 베이지", "Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400;500;700", """
body{font-family:'Noto Sans KR',sans-serif;color:#3a2f28;background:#F6F0E7}
header{padding:60px 56px 54px;background:#E9DDCB;border-radius:0 0 40px 40px;position:relative;overflow:hidden}
header:after{content:"";position:absolute;right:-70px;top:-70px;width:260px;height:260px;border-radius:50%;background:#B5553C;opacity:.9}
.tag{display:inline-block;background:#B5553C;color:#fff;font-weight:700;font-size:15px;padding:6px 16px;border-radius:999px}
.co{margin-top:26px;font-size:16px;color:#7a6a5c}
h1{margin-top:8px;font-family:'Gowun Batang',serif;font-size:43px;font-weight:700;line-height:1.35;color:#2b211b;position:relative;z-index:1}
.lead{margin-top:16px;font-size:18px;color:#5c4d41}
main{padding:36px 40px 6px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
section{background:#fff;border-radius:18px;padding:26px 26px 22px}
.s-apply,section:nth-of-type(5){grid-column:1/3}
h2{font-family:'Gowun Batang',serif;font-size:22px;font-weight:700;color:#B5553C;margin-bottom:12px}
h2 span{display:none}
ul{padding-left:20px;font-size:17px}li{margin:6px 0}li::marker{color:#B5553C}
table{font-size:17px}th,td{padding:8px 0;border-bottom:1px dashed #e3d8c8;vertical-align:top}th{width:96px;color:#8a7767;font-weight:500}
tr:last-child th,tr:last-child td{border:0}
.point{font-size:17px}.point b{color:#B5553C;margin-right:6px}
footer{padding:26px 56px 36px;font-size:17px;color:#5c4d41}footer b{color:#B5553C;margin-right:8px}
""")
D["D"] = ("차콜·골드 고급형", "Noto+Serif+KR:wght@400;600;700&family=Noto+Sans+KR:wght@300;400;500;700", """
body{font-family:'Noto Sans KR',sans-serif;color:#EDE8DF;background:#1C1B1A;font-weight:300}
header{padding:76px 64px 56px;text-align:center;border-bottom:1px solid #C9A46A55;margin:0 40px}
.tag{font-size:13px;letter-spacing:.45em;color:#C9A46A;font-weight:500}
.co{margin-top:34px;font-size:15px;color:#9c958a;letter-spacing:.06em}
h1{margin-top:14px;font-family:'Noto Serif KR',serif;font-size:42px;font-weight:600;line-height:1.45;color:#fff}
.lead{margin-top:20px;font-size:17px;color:#C9A46A}
main{padding:20px 64px 6px}
section{padding:30px 0;border-bottom:1px solid #ffffff14}
h2{font-family:'Noto Serif KR',serif;font-size:21px;font-weight:600;color:#fff;margin-bottom:14px;display:flex;align-items:baseline;gap:14px}
h2 span{font-family:'Noto Sans KR';font-size:13px;color:#C9A46A;letter-spacing:.1em}
ul{list-style:none;padding:0 0 0 34px;font-size:17px}li{margin:7px 0;padding-left:16px;position:relative}
li:before{content:"";position:absolute;left:0;top:12px;width:5px;height:5px;background:#C9A46A;transform:rotate(45deg)}
table{font-size:17px;margin-left:34px;width:calc(100% - 34px)}th,td{padding:7px 0;vertical-align:top}th{width:120px;color:#9c958a;font-weight:400}
.point{margin-left:34px;border:1px solid #C9A46A;padding:18px 22px;font-size:17px}.point b{color:#C9A46A;font-weight:500;margin-right:8px}
footer{padding:30px 64px 44px;font-size:16px;color:#9c958a}footer b{color:#C9A46A;margin-right:10px;font-weight:500}
""")
for k,(name,font,css) in D.items():
    html = f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>채용공고 디자인 시안 {k} · {name}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family={font}&display=swap">
<style>{BASE}{css}</style></head><body>{BODY.replace('{k}', k+' · '+name)}</body></html>"""
    open(f"채용공고 디자인 시안 2026-11-13 v0 {k}.html","w").write(html)
