"""QR 안내판 만들기 (2026-11-20 v0)
실행: python3 go/print/make.py   (필요: pip install segno)
결과: go/print/ 아래 desk.html · window.html · site.html · thanks.html · sticker.html · index.html
문구를 바꾸려면 아래 POSTERS 의 글을 고치고 다시 실행하면 됩니다.
QR 주소(BASE)는 이미 인쇄된 안내판이 있으면 바꾸지 마세요."""
import os, segno

BASE = "https://soo-cpu.github.io/card/go/?from="
HERE = os.path.dirname(os.path.abspath(__file__))
INK = "#2a2420"


def qr(code):
    q = segno.make(BASE + code, error="q")
    svg = q.svg_inline(dark=INK, light="#ffffff", scale=1, border=2, omitsize=True)
    return svg.replace("<svg ", '<svg class="qrsvg" role="img" aria-label="QR 코드" ', 1)


HEAD = """<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="robots" content="noindex">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600&family=Cormorant+Garamond:wght@400;500&display=swap">
<style>
@page{{size:{page};margin:0}}
:root{{--bg:#f5f0e8;--paper:#fbf8f3;--ink:#2a2420;--sub:#7d7065;--line:#d9cebf;--pt:#9a7b56;--deep:#7a5f3f;
--sans:"Pretendard Variable",Pretendard,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;--serif:"Noto Serif KR","Nanum Myeongjo",serif;--latin:"Cormorant Garamond","Times New Roman",serif}}
*{{box-sizing:border-box}}
html,body{{margin:0;background:#cfc8bd}}
body{{font-family:var(--sans);color:var(--ink);word-break:keep-all;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.sheet{{width:{w};height:{h};margin:24px auto;background:var(--bg);position:relative;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.18)}}
@media print{{html,body{{background:none}}.sheet{{margin:0;box-shadow:none}}.noprint{{display:none!important}}}}
.noprint{{max-width:{w};margin:16px auto 0;font-size:14px;display:flex;gap:10px;align-items:center;padding:0 12px}}
.noprint button{{font:inherit;padding:8px 16px;border-radius:8px;border:1px solid #2a2420;background:#2a2420;color:#fff;cursor:pointer}}
.noprint a{{color:#2a2420}}
.qrsvg{{display:block;width:100%;height:auto;shape-rendering:crispEdges}}
.lbl{{font-family:var(--latin);letter-spacing:.32em;text-transform:uppercase;color:var(--pt)}}
.brand{{font-family:var(--latin);letter-spacing:.3em;text-transform:uppercase;font-size:13pt;color:var(--ink)}}
.brand small{{display:block;font-family:var(--sans);letter-spacing:.08em;font-size:8.5pt;color:var(--sub);text-transform:none;margin-top:2mm}}
.serif{{font-family:var(--serif);font-weight:300}}
{css}
</style></head><body>
<div class="noprint"><button onclick="print()">인쇄하기</button><span>{hint}</span><a href="./">← 안내판 목록</a></div>
{body}
</body></html>"""

A4 = dict(page="A4", w="210mm", h="297mm")

FOOT = '<div class="foot"><span>주식회사 홈퍼니싱 · 아르띠꼬 스튜디오 · 상봉 전시장 서울 중랑구 상봉로 131 듀오트리스 2F</span><span>1566-5904</span></div>'
FOOT_CSS = ".foot{position:absolute;left:18mm;right:18mm;bottom:12mm;border-top:.3mm solid var(--line);padding-top:4mm;display:flex;justify-content:space-between;font-size:8.5pt;color:var(--sub)}"

STEPS = """<div class="steps">
<div><i>01</i><b>1분 간편 견적</b><span>평형·공정만 고르면<br>예상 비용 범위가 바로</span></div>
<div><i>02</i><b>상담 신청</b><span>남겨 주시면<br>하루 안에 연락드려요</span></div>
<div><i>03</i><b>시공 사례</b><span>단지별 실제 현장<br>사진과 쇼츠 영상</span></div>
<div><i>04</i><b>오시는 길</b><span>상봉 전시장에서<br>자재·가구 실물 상담</span></div>
</div>"""
STEPS_CSS = """.steps{display:grid;grid-template-columns:1fr 1fr;gap:7mm 12mm;margin:0 24mm}
.steps div{display:grid;grid-template-columns:11mm 1fr;row-gap:1mm}
.steps i{grid-row:span 2;font-style:normal;font-family:var(--latin);font-size:20pt;color:var(--pt);line-height:1}
.steps b{font-size:11.5pt}.steps span{font-size:9.5pt;color:var(--sub);line-height:1.55}"""

POSTERS = []

# 1. 상담석 (테이블 스탠드 A4)
POSTERS.append(dict(code="desk", file="desk.html", title="QR 안내판 · 상담석", fmt=A4,
  name="상담석 스탠드", where="상담 테이블·대기석 아크릴 스탠드 (A4 세로)",
  why="상담 기다리는 동안 견적·사례를 미리 보게 해서 상담 시간을 줄이고, 그 자리에서 연락처를 받음",
  hint="A4 세로 · 아크릴 스탠드(A4)에 끼우기",
  css="""
.top{text-align:center;padding-top:22mm}
.top .lbl{font-size:9pt;margin-top:5mm}
h1{font-family:var(--serif);font-weight:300;font-size:30pt;text-align:center;margin:9mm 0 5mm;letter-spacing:-.01em}
.lead{text-align:center;font-size:11pt;color:var(--sub);line-height:1.75;margin:0}
.box{width:96mm;margin:10mm auto 10mm;background:#fff;border-radius:5mm;padding:8mm 8mm 6mm;text-align:center}
.box .q{width:68mm;margin:0 auto}
.box b{display:block;margin-top:4mm;font-size:12pt}
.box p{margin:2mm 0 0;font-size:9pt;color:var(--sub)}
""" + STEPS_CSS + FOOT_CSS,
  body=lambda q: f"""<div class="sheet">
<div class="top"><div class="brand">Artico Studio<small>주식회사 홈퍼니싱</small></div><div class="lbl">Interior Design &amp; Build</div></div>
<h1>상담 전에, 먼저 둘러보세요.</h1>
<p class="lead">기다리시는 동안 예상 비용과 시공 사례를 미리 보실 수 있어요.<br>궁금한 점은 담당자에게 편하게 물어보세요.</p>
<div class="box"><div class="q">{q}</div><b>휴대폰 카메라로 비춰 주세요</b><p>견적 보기 → 사례 보기 → 상담 신청까지 한 화면에서</p></div>
{STEPS}
{FOOT}</div>"""))

# 2. 매장 밖 (유리문·외벽 A4, 멀리서도 보이게)
POSTERS.append(dict(code="window", file="window.html", title="QR 안내판 · 매장 밖", fmt=A4,
  name="매장 밖 · 유리문", where="전시장 유리문·외벽·엘리베이터 앞 (A4 세로, 유리 안쪽에서 바깥 보게 붙임)",
  why="문 닫힌 시간·지나가는 사람도 그 자리에서 견적 보고 연락처 남김 = 영업시간 밖 상담 접수",
  hint="A4 세로 · 유리에 붙일 땐 코팅 후 안쪽에서 테이프로",
  css="""
.sheet{background:var(--deep);color:#fbf8f3}
.top{text-align:center;padding-top:20mm}.top .brand{color:#fbf8f3}.top .brand small{color:#e6dccd}
h1{font-family:var(--serif);font-weight:400;font-size:36pt;line-height:1.35;text-align:center;margin:12mm 0 6mm}
.lead{text-align:center;font-size:13pt;line-height:1.7;color:#efe6d8;margin:0}
.box{width:118mm;margin:12mm auto 0;background:#fff;border-radius:6mm;padding:9mm;text-align:center;color:var(--ink)}
.box .q{width:96mm;margin:0 auto}
.box b{display:block;margin-top:4mm;font-size:14pt}
.call{text-align:center;margin-top:9mm;font-size:12pt;color:#efe6d8}.call b{font-size:22pt;color:#fff;letter-spacing:.04em;margin-left:3mm}
.foot{position:absolute;left:18mm;right:18mm;bottom:12mm;text-align:center;font-size:9pt;color:#d9ccb9}
""",
  body=lambda q: f"""<div class="sheet">
<div class="top"><div class="brand">Artico Studio<small>아르띠꼬 스튜디오 · 상봉 전시장</small></div></div>
<h1>문이 닫혀 있어도<br>상담은 열려 있어요.</h1>
<p class="lead">카메라로 비추면 1분 간편 견적부터 바로 보실 수 있어요.<br>연락처를 남겨 주시면 하루 안에 연락드립니다.</p>
<div class="box"><div class="q">{q}</div><b>24시간 견적 · 상담 신청</b></div>
<p class="call">전화 상담<b>1566-5904</b></p>
<div class="foot">아파트·상업 공간 인테리어 디자인과 시공 · 실내건축공사업 등록 업체</div></div>"""))

# 3. 공사 현장 안내문 (엘리베이터·현관 게시)
POSTERS.append(dict(code="site", file="site.html", title="QR 안내판 · 공사 현장 안내문", fmt=A4,
  name="공사 현장 안내문", where="공사하는 아파트 엘리베이터·1층 게시판·세대 현관 (A4 세로, 빈칸은 손으로 채움)",
  why="어차피 붙여야 하는 공사 안내문에 QR을 넣어, 같은 단지 이웃이 그 집 공사 사례·비용을 보고 문의 (단지 연쇄 수주)",
  hint="A4 세로 · 빈칸(동·호수, 기간, 책임자)은 인쇄 후 펜으로 채우기",
  css="""
.top{display:flex;justify-content:space-between;align-items:flex-end;padding:18mm 18mm 0}
.top .lbl{font-size:9pt}
h1{font-family:var(--serif);font-weight:400;font-size:26pt;margin:12mm 18mm 4mm}
.lead{margin:0 18mm;font-size:11pt;line-height:1.8;color:var(--ink)}
table{margin:8mm 18mm 0;width:calc(100% - 36mm);border-collapse:collapse;font-size:11pt;background:var(--paper)}
th,td{border:.3mm solid var(--line);padding:4.2mm 5mm;text-align:left}
th{width:36mm;font-weight:600;background:#efe7db}
td{color:#b3a796}
.sorry{margin:6mm 18mm 0;font-size:10pt;color:var(--sub);line-height:1.75}
.bottom{position:absolute;left:18mm;right:18mm;bottom:26mm;display:grid;grid-template-columns:44mm 1fr;gap:8mm;align-items:center;background:#fff;border-radius:4mm;padding:6mm}
.bottom b{display:block;font-size:13pt;margin-bottom:1.5mm}
.bottom span{font-size:9.5pt;color:var(--sub);line-height:1.7}
""" + FOOT_CSS,
  body=lambda q: f"""<div class="sheet">
<div class="top"><div class="brand">Artico Studio<small>주식회사 홈퍼니싱</small></div><div class="lbl">Notice</div></div>
<h1>인테리어 공사 안내</h1>
<p class="lead">안녕하세요. 아래 세대의 인테리어 공사를 맡은 아르띠꼬 스튜디오입니다.<br>공사 기간 동안 소음과 통행에 불편을 드려 진심으로 죄송합니다.</p>
<table>
<tr><th>공사 세대</th><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;동&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;호</td></tr>
<tr><th>공사 기간</th><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;일 ~&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;일</td></tr>
<tr><th>작업 시간</th><td>평일 오전 9시 ~ 오후 6시 (주말·공휴일 소음 작업 없음)</td></tr>
<tr><th>소음 큰 날</th><td>철거:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ 타일:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>
<tr><th>현장 책임자</th><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;☎&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(대표번호 1566-5904)</td></tr>
</table>
<p class="sorry">불편하신 점은 언제든 위 번호로 연락 주시면 바로 조치하겠습니다.<br>공용 공간 보양과 청소를 매일 하겠습니다.</p>
<div class="bottom"><div>{q}</div><div><b>우리 집도 바꿔 볼까 궁금하셨다면</b><span>이 단지 시공 사례와 예상 비용을<br>휴대폰 카메라로 바로 보실 수 있어요.</span></div></div>
{FOOT}</div>"""))

# 4. 감사 카드 (A4에 A6 4장, 잘라서 사용)
_card = lambda q: f"""<div class="card"><div class="brand">Artico Studio</div>
<p class="t serif">새 공간에서의 하루가<br>늘 편안하시길 바랍니다.</p>
<p class="m">함께해 주셔서 감사합니다. 살아 보시고 남겨 주시는<br>후기 한 줄이 저희에게 가장 큰 힘이 됩니다.</p>
<div class="row"><div class="q">{q}</div><div><b>후기 남기기 · A/S 문의</b><span>카메라로 비추면<br>네이버·오늘의집 후기로 연결돼요.<br>A/S 1566-5904</span></div></div>
<div class="sign">주식회사 홈퍼니싱 대표 최윤수</div></div>"""
POSTERS.append(dict(code="thanks", file="thanks.html", title="QR 안내판 · 감사 카드", fmt=A4,
  name="입주 감사 카드", where="시공 완료·입주 날 선물(디퓨저·꽃 등)과 함께 전달 (A4에 4장, 점선대로 잘라 A6)",
  why="만족도가 가장 높은 순간에 후기를 받음 → 네이버 플레이스·오늘의집 후기가 쌓여 다음 고객 신뢰",
  hint="A4 세로 · 두꺼운 종이(200g 이상)에 인쇄해서 4장으로 자르기",
  css="""
.grid4{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;height:100%}
.card{border:.2mm dashed #c9bcaa;padding:12mm 10mm 9mm;position:relative;display:flex;flex-direction:column}
.card .brand{font-size:10pt}
.card .t{font-size:14pt;line-height:1.55;margin:7mm 0 3mm}
.card .m{font-size:8.3pt;color:var(--sub);line-height:1.7;margin:0}
.card .row{display:grid;grid-template-columns:24mm 1fr;gap:4mm;align-items:center;margin-top:auto;background:#fff;border-radius:2.5mm;padding:3mm}
.card .row b{display:block;font-size:9pt;margin-bottom:1mm}.card .row span{font-size:7.6pt;color:var(--sub);line-height:1.55}
.card .sign{font-size:7.5pt;color:var(--sub);margin-top:4mm;text-align:right}
""",
  body=lambda q: '<div class="sheet"><div class="grid4">' + _card(q) * 4 + "</div></div>"))

# 5. 스티커 시트 (견적서·명함·차량·자재 박스·현장 펜스)
_st = lambda q: f'<div class="st"><div class="q">{q}</div><b>1분 견적 · 상담</b><span>ARTICO STUDIO · 1566-5904</span></div>'
POSTERS.append(dict(code="sticker", file="sticker.html", title="QR 안내판 · 스티커", fmt=A4,
  name="QR 스티커 12개", where="견적서·계약서 표지, 명함 뒷면, 회사 차량, 현장 자재 박스, 쇼룸 샘플 (A4 라벨지 12칸)",
  why="손에 남는 모든 물건에서 다시 견적·상담으로 돌아오게 함",
  hint="A4 라벨지(12칸, 3×4) · 그냥 종이에 찍어 잘라 써도 됨",
  css="""
.grid12{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:4mm;padding:10mm;height:100%}
.st{background:#fff;border-radius:3mm;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4mm;text-align:center;border:.2mm solid var(--line)}
.st .q{width:34mm}
.st b{font-size:10pt;margin-top:2mm}.st span{font-size:6.5pt;letter-spacing:.08em;color:var(--sub);margin-top:1mm}
""",
  body=lambda q: '<div class="sheet"><div class="grid12">' + _st(q) * 12 + "</div></div>"))


def main():
    for p in POSTERS:
        html = HEAD.format(title=p["title"], css=p["css"], hint=p["hint"], body=p["body"](qr(p["code"])), **p["fmt"])
        with open(os.path.join(HERE, p["file"]), "w", encoding="utf-8") as f:
            f.write(html)
    rows = "".join(
        f'<a class="it" href="{p["file"]}"><i>{i+1:02d}</i><div><b>{p["name"]}</b><p><em>어디에</em>{p["where"]}</p><p><em>왜</em>{p["why"]}</p><p class="u">QR 주소 · {BASE}{p["code"]}</p></div><span>열기 →</span></a><p style="margin:-4px 0 12px 12px;font-size:13px"><a href="pdf/{p["code"]}.pdf">PDF 바로 받기</a></p>'
        for i, p in enumerate(POSTERS))
    index = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QR 안내판 모음</title><meta name="robots" content="noindex">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>:root{{--bg:#f5f0e8;--paper:#fbf8f3;--ink:#2a2420;--sub:#8c7f72;--line:#e3dace;--pt:#9a7b56}}
@media (prefers-color-scheme:dark){{:root{{--bg:#1b1815;--paper:#211d19;--ink:#ede6dc;--sub:#a39a8e;--line:#332d27;--pt:#c2a57a;color-scheme:dark}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font-family:"Pretendard Variable",Pretendard,sans-serif;line-height:1.65;word-break:keep-all;overflow-wrap:anywhere}}
.w{{max-width:760px;margin:0 auto;padding:32px 16px 48px}}h1{{font-size:24px;margin:0 0 6px}}.lead{{color:var(--sub);margin:0 0 24px}}
.it{{display:grid;grid-template-columns:36px 1fr auto;gap:12px;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:10px;color:inherit;text-decoration:none}}
.it i{{font-style:normal;color:var(--pt);font-size:20px}}.it b{{font-size:16px}}.it p{{margin:4px 0 0;font-size:13.5px}}.it em{{font-style:normal;color:var(--pt);font-weight:600;margin-right:8px}}
.it .u{{color:var(--sub);font-size:12px}}.it span{{color:var(--pt);white-space:nowrap;align-self:center}}
.tip{{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:14px 16px;font-size:13.5px;margin-top:18px}}.tip b{{color:var(--pt)}}
@media (max-width:520px){{.it{{grid-template-columns:28px 1fr}}.it span{{display:none}}}}</style></head><body><div class="w">
<h1>QR 안내판 모음</h1><p class="lead">모든 QR은 같은 안내 페이지(<a href="../">/card/go/</a>)를 열고, 붙인 자리마다 첫 문장이 달라져요. 상담 신청이 들어오면 메일에 '들어온 경로'가 함께 적혀서 어느 QR이 효과 있는지 알 수 있어요.</p>
{rows}
<div class="tip"><b>인쇄 팁</b> · 각 안내판을 열고 '인쇄하기' → 용지 A4, 여백 없음, 배경 그래픽 켜기. QR은 최소 2.5cm 이상, 유리문용은 코팅해서 붙이세요.</div>
</div></body></html>"""
    with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as f:
        f.write(index)
    print("done", len(POSTERS))


if __name__ == "__main__":
    main()
