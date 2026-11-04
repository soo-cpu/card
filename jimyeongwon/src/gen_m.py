# Builds pdf.html (portrait phone pages) and web.html (artifact page) from data.py.
import sys, os, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data import *
M = os.path.dirname(os.path.abspath(__file__))
e = html.escape

TAGCLS = {'관공서': 'g', '교육': 'e', '문화': 'p', '상업': 'c', '진행중': 'x', '특판': 'c'}

# =====================================================================
# PDF (540 x 960 px pages)
# =====================================================================
PCSS = r'''
@page{size:540px 960px;margin:0}
:root{--bg:#f6f5f2;--paper:#ffffff;--ink:#1d1b18;--sub:#6f6860;--line:#e2ddd5;--wal:#5e4532;--brass:#a8855a;--dark:#1f1b17;--tint:#efebe4}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Noto Sans KR',sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;word-break:keep-all;font-size:14px;line-height:1.6}
.pg{width:540px;height:960px;position:relative;overflow:hidden;page-break-after:always;background:var(--paper)}
.pg:last-child{page-break-after:auto}
.in{padding:56px 36px 60px}
.serif{font-family:'Noto Serif KR',serif}
.ey{font-size:10.5px;letter-spacing:.24em;color:var(--brass);font-weight:700;text-transform:uppercase}
h1{font-family:'Noto Serif KR',serif;font-weight:900;font-size:30px;line-height:1.3;margin-top:8px;letter-spacing:-.01em}
h1 small{display:block;font-family:'Noto Sans KR',sans-serif;font-size:13px;font-weight:400;color:var(--sub);margin-top:6px;letter-spacing:0}
.ft{position:absolute;left:36px;right:36px;bottom:22px;display:flex;justify-content:space-between;font-size:9.5px;color:#a39a8f;letter-spacing:.06em}
.ft b{color:var(--wal);font-weight:700}
.rule{height:1px;background:var(--line);margin:22px 0}
/* cover */
.cv .ph{position:absolute;inset:0 0 360px 0;background:center/cover}
.cv .pn{position:absolute;left:0;right:0;bottom:0;height:360px;background:var(--dark);color:#efe8df;padding:40px 36px}
.cv .br{font-size:11px;letter-spacing:.3em;color:var(--brass)}
.cv .t{font-family:'Noto Serif KR',serif;font-weight:900;font-size:56px;letter-spacing:.14em;margin-top:18px;line-height:1}
.cv .y{font-size:12px;letter-spacing:.32em;color:#bfb3a5;margin-top:14px}
.cv .co{font-size:21px;font-weight:700;margin-top:34px}
.cv .m{font-size:11.5px;color:#bfb3a5;margin-top:8px;line-height:1.8}
.cv .tag{position:absolute;right:20px;top:20px;background:rgba(20,18,16,.55);color:#fff;font-size:10px;padding:4px 10px;border-radius:2px}
/* quick */
.nums{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}
.nums div{background:var(--tint);padding:16px 16px 14px;border-radius:3px}
.nums b{font-family:'Noto Serif KR',serif;font-size:34px;font-weight:900;color:var(--wal);line-height:1}
.nums b small{font-size:15px;margin-left:2px}
.nums span{display:block;font-size:12.5px;font-weight:700;margin-top:8px}
.nums em{display:block;font-style:normal;font-size:11px;color:var(--sub)}
.qk{margin-top:22px;border-top:2px solid var(--ink)}
.qk div{display:grid;grid-template-columns:64px 1fr;padding:11px 0;border-bottom:1px solid var(--line);font-size:13px}
.qk dt{color:var(--brass);font-weight:700}
.kv{display:grid;grid-template-columns:96px 1fr;row-gap:10px;font-size:13px;margin-top:24px}
.kv dt{color:var(--sub)} .kv dd{font-weight:500}
.lead{font-family:'Noto Serif KR',serif;font-size:21px;font-weight:600;line-height:1.55;margin-top:22px}
.lead em{font-style:normal;color:var(--wal)}
.ph1{background:center/cover;border-radius:3px}
p.body{font-size:14px;line-height:1.85;color:#3b3631;margin-top:14px}
.sig{margin-top:22px;font-weight:700;font-size:14px}
.sig span{display:block;font-family:'Noto Serif KR',serif;font-size:20px;font-weight:900;margin-top:4px}
/* history */
.hs{margin-top:26px;position:relative;padding-left:22px;border-left:2px solid var(--line)}
.hs .st{position:relative;margin-bottom:22px}
.hs .st::before{content:"";position:absolute;left:-29px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--paper);border:2px solid var(--brass)}
.hs .st.now::before{background:var(--wal);border-color:var(--wal)}
.hs .yy{font-size:11.5px;color:var(--brass);font-weight:700;letter-spacing:.06em}
.hs .nm{font-family:'Noto Serif KR',serif;font-size:18px;font-weight:900}
.hs .ds{font-size:12px;color:var(--sub)}
.hs ul{list-style:none;margin-top:6px;font-size:12.5px}
.hs li{padding:3px 0}
.hs li::before{content:"·";color:var(--brass);margin-right:6px}
.vis{background:var(--dark);color:#e8e0d6;padding:20px;border-radius:3px;margin-top:22px}
.vis b{display:block;font-size:11px;letter-spacing:.2em;color:var(--brass)}
.vis span{font-family:'Noto Serif KR',serif;font-size:18px;font-weight:600}
.vals{margin-top:14px;display:grid;gap:10px}
.vals div{border:1px solid var(--line);border-radius:3px;padding:14px 16px;font-size:12.5px;color:var(--sub)}
.vals b{display:block;color:var(--ink);font-size:14.5px;margin-bottom:2px}
.org{margin-top:20px;text-align:center}
.org .ce{display:inline-block;background:var(--wal);color:#fff;font-weight:700;padding:8px 22px;border-radius:2px;font-size:13px}
.org .ln{width:1px;height:16px;background:var(--line);margin:0 auto}
.org .rw{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;border-top:1px solid var(--line);padding-top:12px}
.org .rw span{border:1px solid var(--line);font-size:11.5px;padding:7px 2px;border-radius:2px}
/* process */
.flow{margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:6px;counter-reset:f}
.flow div{background:var(--tint);padding:9px 12px;font-size:12.5px;border-radius:2px;counter-increment:f}
.flow div::before{content:counter(f);font-family:'Noto Serif KR',serif;font-weight:900;color:var(--brass);margin-right:8px}
.flow div.on{background:var(--wal);color:#fff}.flow div.on::before{color:#e5cfa9}
.fcap{font-size:11px;color:var(--wal);margin-top:6px;font-weight:700}
.diff{margin-top:22px;display:grid;gap:12px}
.diff div{border-left:3px solid var(--brass);padding:4px 0 4px 14px}
.diff b{display:block;font-size:15px}
.diff span{font-size:12.5px;color:var(--sub)}
.mg{margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mg div{background:var(--tint);border-radius:3px;padding:14px;font-size:12px;color:var(--sub)}
.mg b{display:block;font-family:'Noto Serif KR',serif;font-size:22px;font-weight:900;color:var(--wal)}
.note{margin-top:16px;font-size:12px;color:var(--sub);background:var(--tint);padding:12px 14px;border-radius:3px}
.note b{color:var(--ink)}
.strip3{position:absolute;left:36px;right:36px;bottom:56px;height:330px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.strip3 div{background:center/cover;border-radius:2px}
/* performance */
.yr{display:flex;align-items:baseline;gap:12px;margin-top:4px}
.yr b{font-family:'Noto Serif KR',serif;font-weight:900;font-size:54px;color:var(--wal);line-height:1}
.yr span{font-size:12px;color:var(--sub)}
.pl{list-style:none;margin-top:16px;border-top:2px solid var(--ink)}
.pl li{display:grid;grid-template-columns:40px 1fr;gap:4px;padding:9px 0;border-bottom:1px solid var(--line)}
.pl .mo{font-size:12px;color:var(--brass);font-weight:700;padding-top:1px}
.pl .t{font-size:13.5px;font-weight:500;line-height:1.45}
.pl .c{font-size:11px;color:var(--sub);margin-top:1px}
.pl.tight li{padding:6px 0}.pl.tight .t{font-size:12.5px}
.tg{display:inline-block;font-size:9.5px;font-weight:700;padding:0 6px;border-radius:2px;margin-left:6px;vertical-align:1px;background:var(--tint);color:var(--wal)}
.tg.e{background:#e3ecee;color:#355f6a}.tg.p{background:#eee5ef;color:#6e4a7a}.tg.x{background:var(--wal);color:#fff}
.cl{display:flex;flex-wrap:wrap;gap:7px;margin-top:20px}
.cl span{border:1px solid var(--line);border-radius:20px;padding:5px 12px;font-size:12.5px}
/* divider */
.dv{background:var(--dark);color:#efe8df}
.dv .ph{position:absolute;left:0;right:0;top:0;height:470px;background:center/cover}
.dv .tx{position:absolute;left:36px;right:36px;top:510px}
.dv .n{font-family:'Noto Serif KR',serif;font-size:64px;font-weight:900;color:var(--brass);line-height:1}
.dv .en{font-size:11px;letter-spacing:.28em;color:#b5a999;margin-top:12px}
.dv .ko{font-family:'Noto Serif KR',serif;font-size:30px;font-weight:900;margin-top:4px}
.dv ol{list-style:none;margin-top:18px;font-size:12px;color:#cfc4b7;columns:2;column-gap:16px}
.dv li{padding:2px 0;break-inside:avoid}
.dv li b{color:var(--brass);margin-right:6px}
/* project */
.pa .hero{position:absolute;left:0;right:0;top:0;height:470px;background:center/cover}
.pa .hero i{position:absolute;right:16px;top:16px;font-style:normal;background:rgba(20,18,16,.6);color:#fff;font-size:10px;padding:3px 9px;border-radius:2px}
.pa .tx{position:absolute;left:36px;right:36px;top:500px}
.pa .ct{font-size:11px;color:var(--brass);font-weight:700;letter-spacing:.12em}
.pa .ct b{font-family:'Noto Serif KR',serif;font-size:13px;color:var(--wal);margin-left:8px;letter-spacing:0}
.pa h2{font-family:'Noto Serif KR',serif;font-weight:900;font-size:24px;line-height:1.35;margin-top:6px}
.pa dl{display:grid;grid-template-columns:58px 1fr;row-gap:6px;font-size:12.5px;margin-top:16px}
.pa dt{color:var(--sub)} .pa dd{font-weight:500}
.pa .pt{margin-top:16px;font-size:12.5px;color:#3b3631;border-top:1px solid var(--line);padding-top:12px}
.pb .hd{position:absolute;left:36px;right:36px;top:24px;display:flex;justify-content:space-between;align-items:baseline;font-size:11px;color:var(--sub)}
.pb .hd b{color:var(--ink);font-size:12.5px}
.pb .hd em{font-style:normal;font-family:'Noto Serif KR',serif;font-weight:900;color:var(--wal);font-size:14px}
.pb .gr{position:absolute;left:20px;right:20px;top:54px;bottom:50px;display:grid;gap:8px}
.pb .gr div{background:center/cover;border-radius:2px;position:relative}
.pb .gr div i{position:absolute;left:8px;bottom:8px;font-style:normal;background:rgba(20,18,16,.62);color:#fff;font-size:10.5px;padding:3px 9px;border-radius:2px}
.pb .gr div b{position:absolute;left:8px;top:8px;background:var(--dark);color:#fff;font-size:11px;letter-spacing:.16em;padding:4px 10px;border-radius:2px}
.pb .gr div.af b{background:var(--wal)}
/* more cards */
.mc{margin-top:20px;display:grid;gap:12px}
.mc div{background:var(--tint);border-radius:3px;padding:14px 16px}
.mc .y{font-family:'Noto Serif KR',serif;font-weight:900;color:var(--wal);font-size:15px}
.mc b{display:block;font-size:15px;margin-top:2px}
.mc span{display:block;font-size:12px;color:var(--sub);margin-top:4px}
/* certs */
.cg{margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cg div{text-align:center;font-size:12px}
.cg .im{height:250px;border:1px solid var(--line);background:#fbfbfa center/contain no-repeat;margin-bottom:8px}
.cg b{display:block;font-size:13px}
.cg span{color:var(--sub);font-size:10.5px}
/* back */
.bk{background:var(--dark);color:#e9e1d8}
.bk .in{padding-top:140px}
.bk .t{font-family:'Noto Serif KR',serif;font-size:32px;font-weight:900;margin-top:10px}
.bk .s{color:#bdb2a6;margin-top:6px}
.bk dl{display:grid;grid-template-columns:72px 1fr;row-gap:10px;margin-top:46px;font-size:14px}
.bk dt{color:var(--brass)}
.bk .cta{margin-top:46px;border:1px solid #4a4038;border-radius:3px;padding:18px;font-size:13px;color:#cfc4b7}
.bk .cta b{display:block;color:#fff;font-size:15px;margin-bottom:4px}
'''

pages = []
def img(n):
    return f'url(img/{n}.jpg)'
def foot(label=''):
    return '<div class="ft"><span>Ⓒ HOME FURNISHING CO.</span><span><b>{label}</b> &nbsp;{n}</span></div>'.replace('{label}', label)
def page(cls, inner, ft=True, label=''):
    pages.append((cls, inner, ft, label))

# 1 cover
page('cv', f'''<div class="ph" style="background-image:{img('bi11')}"><span class="tag">2026 경기도자비엔날레 전시공간</span></div>
<div class="pn"><div class="br">HOME FURNISHING · ártico studio</div><div class="t">지명원</div><div class="y">2026 EDITION</div>
<div class="co">주식회사 홈퍼니싱</div><div class="m">실내건축공사업 · 여성기업 · 연구개발전담부서<br>공공 · 교육 · 문화시설 인테리어 설계 시공</div></div>''', False)

# 2 quick summary
nums = ''.join(f'<div><b>{a}<small>{u}</small></b><span>{l}</span><em>{s}</em></div>' for a, u, l, s in NUMBERS)
qk = ''.join(f'<div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in QUICK)
page('', f'''<div class="in"><div class="ey">At a glance</div><h1>발주처 담당자를 위한<br>한눈에 보는 홈퍼니싱</h1>
<div class="nums">{nums}</div><dl class="qk">{qk}</dl></div>''', label='한눈 요약')

# 3 company
kv = ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in COMPANY.items())
page('', f'''<div class="in"><div class="ey">Who we are</div><h1>회사 개요<small>최고의 만족과 감동을 드리는 신뢰의 파트너</small></h1>
<p class="lead">설계부터 시공, 가구 납품까지<br><em>공간의 A to Z</em>를 한 팀이 책임지는<br>디자인 시공 전문기업입니다.</p>
<dl class="kv">{kv}</dl>
<div class="ph1" style="background-image:{img('lob_1')};height:250px;margin-top:26px"></div></div>''', label='회사 소개')

# 4 CEO
ceo = ''.join(f'<p class="body">{x}</p>' for x in CEO)
page('', f'''<div class="in"><div class="ey">Message from the CEO</div><h1>CEO 인사말</h1>
<p class="lead" style="font-size:19px">“우리는 우리가 만들어 나가는<br>공간의 변화, 그 가치와 힘을 믿습니다.”</p>
{ceo}<div class="sig">주식회사 홈퍼니싱 대표이사<span>최윤수 · 신혜현</span></div>
<div class="ph1" style="background-image:{img('sm24_12')};height:200px;margin-top:26px"></div></div>''', label='회사 소개')

# 5 history
hs = ''.join(f'<div class="st{" now" if i == 3 else ""}"><div class="yy">{y}</div><div class="nm">{n}</div><div class="ds">{d}</div><ul>{"".join(f"<li>{x}</li>" for x in it)}</ul></div>' for i, (y, n, d, it) in enumerate(HISTORY))
page('', f'''<div class="in"><div class="ey">Company history</div><h1>회사 연혁<small>주식회사 홈퍼니싱이 걸어온 길</small></h1><div class="hs">{hs}</div></div>''', label='회사 소개')

# 6 vision / org
vals = ''.join(f'<div><b>{a}</b>{b}</div>' for a, b in VALUES)
org = ''.join(f'<span>{x}</span>' for x in ORG)
page('', f'''<div class="in"><div class="ey">Vision &amp; Organization</div><h1>비전 · 핵심가치 · 조직</h1>
<div class="vis"><b>VISION 2030</b><span>디자인 기업 홈퍼니싱이 만드는 새로운 세상</span></div>
<div class="vals">{vals}</div>
<div class="org"><div class="ce">대표이사</div><div class="ln"></div><div class="rw">{org}</div></div></div>''', label='회사 소개')

# 7 services
flow = ''.join(f'<div class="{"on" if i < 3 else ""}">{x}</div>' for i, x in enumerate(PROCESS))
diff = ''.join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in DIFF)
page('', f'''<div class="in"><div class="ey">What we do</div><h1>제공 서비스 · 차별화</h1>
<div class="flow">{flow}</div><div class="fcap">①~③ 단계 ONE-STOP 지원 · 디자인 특화</div>
<div class="diff">{diff}</div>
<div class="note"><b>함께 제안 · 납품</b> &nbsp;제작 가구 · 이동식 가구 · 사무/야외 가구 · 아크릴 가림막 · 실내 조경</div></div>''', label='서비스')

# 8 management
mg = ''.join(f'<div><b>{a}</b>{b}</div>' for a, b in MANAGE)
page('', f'''<div class="in"><div class="ey">Process management</div><h1>공정 · 안전 · 품질 관리</h1>
<div class="mg">{mg}</div>
<div class="note"><b>주요 공종</b> &nbsp;{TRADES}</div></div>
<div class="strip3"><div style="background-image:{img('dm10')}"></div><div style="background-image:{img('wf8')}"></div><div style="background-image:{img('pk10')}"></div></div>''', label='서비스')

# performance divider
page('dv', f'''<div class="ph" style="background-image:{img('dm1')}"></div><div class="tx"><div class="n">02</div><div class="en">CONSTRUCTION PERFORMANCE</div><div class="ko">주요 시공실적</div>
<ol>{''.join(f'<li><b>{y}</b>{len(r)}건</li>' for y, _, r in PERF)}<li><b>주거</b>180건 이상</li></ol></div>''', False)

for y, note, rows in PERF:
    chunks = [rows] if len(rows) <= 13 else [rows[:9], rows[9:]]
    for ci, ch in enumerate(chunks):
        tight = ' tight' if len(ch) > 10 else ''
        li = ''.join(f'<li><span class="mo">{m}</span><div><div class="t">{t}<span class="tg {TAGCLS.get(tg, "")}">{tg}</span></div><div class="c">{c}</div></div></li>' for m, t, c, tg in ch)
        cont = ' (계속)' if ci else ''
        page('', f'''<div class="in"><div class="ey">Construction performance</div><div class="yr"><b>{y}</b><span>주요 시공실적{cont}{' · ' + note if note else ''}</span></div><ul class="pl{tight}">{li}</ul></div>''', label='시공실적')

page('', f'''<div class="in"><div class="ey">Clients</div><h1>주요 발주처</h1><div class="cl">{''.join(f'<span>{c}</span>' for c in CLIENTS)}</div>
<div class="ph1" style="background-image:{img('mr_7')};height:300px;margin-top:30px"></div></div>''', label='시공실적')

# projects divider
page('dv', f'''<div class="ph" style="background-image:{img('bi13')}"></div><div class="tx"><div class="n">03</div><div class="en">CONSTRUCTION EXPERIENCE</div><div class="ko">시공 사례</div>
<ol>{''.join(f'<li><b>{p["year"][2:]}</b>{p["title"].split(" ")[0]}</li>' for p in PROJECTS)}</ol></div>''', False)

def grid_page(p, cells, ba=False):
    rows = len(cells)
    inner = ''.join(cells)
    page('pb', f'''<div class="hd"><span>{p["cat"]} · <b>{p["title"]}</b></span><em>{p["year"]}</em></div><div class="gr" style="grid-template-rows:repeat({rows},1fr)">{inner}</div>''', label='시공사례')

for p in PROJECTS:
    loc = f'<dt>위치</dt><dd>{p["loc"]}</dd>' if p['loc'] else ''
    page('pa', f'''<div class="hero" style="background-image:{img(p['hero'])}"></div><div class="tx"><div class="ct">{p['cat']}<b>{p['year']}</b></div><h2>{p['title']}</h2>
<dl><dt>발주처</dt><dd>{p['client']}</dd>{loc}<dt>기간</dt><dd>{p['term']}</dd><dt>내용</dt><dd>{p['work']}</dd></dl><div class="pt">{p['point']}</div></div>''', label='시공사례')
    if p.get('before'):
        b, a = p['before']
        grid_page(p, [f'<div style="background-image:{img(b)}"><b>BEFORE</b></div>', f'<div class="af" style="background-image:{img(a)}"><b>AFTER</b></div>'])
    ph = p['photos']
    for i in range(0, len(ph), 3):
        grid_page(p, [f'<div style="background-image:{img(f)}"><i>{c}</i></div>' for f, c in ph[i:i + 3]])

for i in range(0, len(MORE), 4):
    mc = ''.join(f'<div><span class="y">{y}</span><b>{t}</b><span>{c} · {w} · {d}</span></div>' for y, t, c, w, d in MORE[i:i + 4])
    page('', f'''<div class="in"><div class="ey">More projects</div><h1>그 외 관공서 · 교육시설</h1><div class="mc">{mc}</div></div>''', label='시공사례')

# certs
cg = ''.join(f'<div><div class="im" style="background-image:{img(f)}"></div><b>{t}</b><span>{s}</span></div>' for f, t, s in CERTS)
page('', f'''<div class="in"><div class="ey">Certification &amp; License</div><h1>인증 서류</h1><div class="cg">{cg}</div></div>''', label='인증서류')

# back
ct = ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in CONTACT)
page('bk', f'''<div class="in"><div class="ey">Contact</div><div class="t">주식회사 홈퍼니싱</div><div class="s">공간의 변화, 그 가치와 힘을 믿습니다.</div>
<dl>{ct}<dt>주소</dt><dd>{COMPANY['주소']}</dd></dl>
<div class="cta"><b>현장 실측 · 견적 상담</b>도면이나 현장 사진을 보내주시면 공종별 내역과 일정까지 정리해 회신드립니다.</div></div>''', False)

out = []
for i, (cls, inner, ft, label) in enumerate(pages):
    f = foot(label).replace('{n}', f'{i + 1:02d}') if ft else ''
    out.append(f'<section class="pg {cls}">{inner}{f}</section>')
open(f'{M}/pdf.html', 'w', encoding='utf-8').write(f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>주식회사 홈퍼니싱 지명원 2026</title>
<link rel="stylesheet" href="sans.css"><link rel="stylesheet" href="serif.css"><style>{PCSS}</style></head><body>{''.join(out)}</body></html>''')
print('pdf pages', len(pages))

# =====================================================================
# WEB (artifact page body)
# =====================================================================
WCSS = r'''
/* Layout: one narrow reading column (max 1080px), photo-led project blocks with swipe galleries on phones */
:root{
  --bg:#f6f5f2;--paper:#ffffff;--ink:#1d1b18;--sub:#6b645c;--line:#e1dcd4;--tint:#eeeae3;
  --wal:#5e4532;--brass:#9c7a4f;--dark:#1f1b17;--on-dark:#efe8df;--on-dark-sub:#b9ad9f;
  --tg-e-bg:#e3ecee;--tg-e:#355f6a;--tg-p-bg:#eee5ef;--tg-p:#6e4a7a;
  --serif:'Noto Serif KR',Georgia,serif;--sans:'Noto Sans KR',system-ui,-apple-system,'Apple SD Gothic Neo',sans-serif;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#151311;--paper:#1c1916;--ink:#ece6de;--sub:#a99f94;--line:#332e29;--tint:#24201c;
  --wal:#d1b089;--brass:#c49d6c;--dark:#0f0d0c;--on-dark:#efe8df;--on-dark-sub:#b9ad9f;
  --tg-e-bg:#1f3136;--tg-e:#9cc5cf;--tg-p-bg:#33263a;--tg-p:#d3b4de;color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#151311;--paper:#1c1916;--ink:#ece6de;--sub:#a99f94;--line:#332e29;--tint:#24201c;
  --wal:#d1b089;--brass:#c49d6c;--dark:#0f0d0c;--on-dark:#efe8df;--on-dark-sub:#b9ad9f;
  --tg-e-bg:#1f3136;--tg-e:#9cc5cf;--tg-p-bg:#33263a;--tg-p:#d3b4de;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:16px;line-height:1.65;word-break:keep-all;margin:0}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--paper)}
a{color:inherit}
.wrap{max-width:1080px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1,h2,h3{font-family:var(--serif);font-weight:900;text-wrap:balance;margin:0;letter-spacing:-.01em}
.ey{font-size:11px;letter-spacing:.22em;color:var(--brass);font-weight:700;text-transform:uppercase}
nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--paper);border-bottom:1px solid var(--line)}
nav .wrap{display:flex;align-items:center;gap:18px;height:54px;overflow-x:auto;scrollbar-width:none}
nav .wrap::-webkit-scrollbar{display:none}
nav .logo{font-family:var(--serif);font-weight:900;white-space:nowrap;margin-right:auto}
nav a{text-decoration:none;font-size:14px;color:var(--sub);white-space:nowrap}
nav a:hover,nav a:focus-visible{color:var(--ink)}
:focus-visible{outline:2px solid var(--brass);outline-offset:2px}
/* hero */
.hero{position:relative;background:var(--dark);color:var(--on-dark)}
.hero .ph{aspect-ratio:16/9;max-height:62vh;width:100%;background:center/cover;max-width:100%}
.hero .tx{padding-block:28px 34px}
.hero .br{font-size:11px;letter-spacing:.3em;color:var(--brass)}
.hero h1{font-size:clamp(36px,8vw,64px);letter-spacing:.12em;margin-top:10px;color:var(--on-dark)}
.hero p{color:var(--on-dark-sub);margin:10px 0 0;max-width:40em}
.hero .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.hero .chips span{border:1px solid #4a4038;color:var(--on-dark);border-radius:20px;padding:4px 12px;font-size:13px}
section.s{padding-block:56px;border-bottom:1px solid var(--line)}
section.s h2{font-size:clamp(26px,5vw,36px);margin-top:6px}
section.s .lede{color:var(--sub);margin:8px 0 0;max-width:40em}
.nums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:26px}
.nums div{background:var(--paper);border:1px solid var(--line);padding:18px;border-radius:4px}
.nums b{font-family:var(--serif);font-size:38px;font-weight:900;color:var(--wal);line-height:1;font-variant-numeric:tabular-nums}
.nums b small{font-size:16px;margin-left:2px}
.nums span{display:block;font-weight:700;margin-top:8px;font-size:14px}
.nums em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}
.qk{margin:26px 0 0;border-top:2px solid var(--ink)}
.qk div{display:grid;grid-template-columns:84px minmax(0,1fr);padding:12px 0;border-bottom:1px solid var(--line)}
.qk dt{color:var(--brass);font-weight:700}.qk dd{margin:0}
.two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:36px;margin-top:26px}
.kv{display:grid;grid-template-columns:110px minmax(0,1fr);row-gap:10px;margin:0}
.kv dt{color:var(--sub)}.kv dd{margin:0;font-weight:500}
.lead{font-family:var(--serif);font-size:22px;font-weight:600;line-height:1.55;margin:0}
.lead em{font-style:normal;color:var(--wal)}
.ceo p{color:var(--sub);margin:12px 0 0;max-width:36em}
.ceo .sig{margin-top:16px;font-weight:700;color:var(--ink)}
.ceo .sig span{font-family:var(--serif);font-size:20px;font-weight:900;margin-left:8px}
.hs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:26px}
.hs .st{border-top:3px solid var(--line);padding-top:12px}
.hs .st.now{border-color:var(--wal)}
.hs .yy{font-size:12.5px;color:var(--brass);font-weight:700}
.hs .nm{font-family:var(--serif);font-size:19px;font-weight:900}
.hs .ds{font-size:13px;color:var(--sub)}
.hs ul{list-style:none;padding:0;margin:8px 0 0;font-size:14px}
.hs li{padding:3px 0;border-bottom:1px dotted var(--line)}
.vals{display:grid;grid-template-columns:1.2fr repeat(3,minmax(0,1fr));gap:12px;margin-top:22px}
.vals div{background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:16px;font-size:14px;color:var(--sub)}
.vals b{display:block;color:var(--ink);font-size:16px;margin-bottom:4px}
.vals .v{background:var(--dark);border-color:var(--dark);color:var(--on-dark-sub)}.vals .v b{color:var(--on-dark)}
.org{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:16px;font-size:14px}
.org span{border:1px solid var(--line);border-radius:20px;padding:4px 14px;background:var(--paper)}
.org .ce{background:var(--wal);color:var(--paper);border-color:var(--wal);font-weight:700}
.flow{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:4px;margin-top:24px;counter-reset:f}
.flow div{background:var(--tint);padding:10px 8px;font-size:13px;text-align:center;counter-increment:f;border-radius:2px}
.flow div::before{content:counter(f);display:block;font-family:var(--serif);font-weight:900;color:var(--brass)}
.flow div.on{background:var(--wal);color:var(--paper)}.flow div.on::before{color:var(--paper)}
.fcap{font-size:13px;color:var(--wal);font-weight:700;margin-top:8px}
.cards3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:22px}
.cards3 div{border-left:3px solid var(--brass);padding:2px 0 2px 14px}
.cards3 b{display:block;font-size:17px}
.cards3 span{font-size:14px;color:var(--sub)}
.mg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:22px}
.mg div{background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:16px;font-size:14px;color:var(--sub)}
.mg b{display:block;font-family:var(--serif);font-size:22px;font-weight:900;color:var(--wal)}
.note{margin-top:16px;font-size:14px;color:var(--sub);background:var(--tint);padding:12px 16px;border-radius:4px}
.note b{color:var(--ink)}
/* performance */
.yrs{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.yrs a{text-decoration:none;border:1px solid var(--line);background:var(--paper);border-radius:20px;padding:5px 14px;font-size:14px;font-variant-numeric:tabular-nums}
.yrs a:hover{border-color:var(--wal);color:var(--wal)}
.yb{margin-top:30px;scroll-margin-top:70px}
.yb h3{font-size:30px;color:var(--wal);display:flex;align-items:baseline;gap:12px}
.yb h3 span{font-family:var(--sans);font-size:13px;font-weight:400;color:var(--sub)}
.pl{list-style:none;padding:0;margin:10px 0 0;border-top:2px solid var(--ink);columns:2;column-gap:32px}
.pl li{display:grid;grid-template-columns:52px minmax(0,1fr);gap:6px;padding:10px 0;border-bottom:1px solid var(--line);break-inside:avoid}
.pl .mo{font-size:13px;color:var(--brass);font-weight:700;font-variant-numeric:tabular-nums}
.pl .t{font-weight:500}
.pl .c{font-size:12.5px;color:var(--sub)}
.tg{display:inline-block;font-size:11px;font-weight:700;padding:0 7px;border-radius:2px;margin-left:6px;vertical-align:2px;background:var(--tint);color:var(--wal)}
.tg.e{background:var(--tg-e-bg);color:var(--tg-e)}.tg.p{background:var(--tg-p-bg);color:var(--tg-p)}.tg.x{background:var(--wal);color:var(--paper)}
.cl{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.cl span{border:1px solid var(--line);background:var(--paper);border-radius:20px;padding:5px 13px;font-size:14px}
/* projects */
.pj{padding-block:40px;border-top:1px solid var(--line);scroll-margin-top:60px}
.pj:first-of-type{border-top:0}
.pj .top{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:28px;align-items:start}
.pj .heroimg{aspect-ratio:3/2;width:100%;max-width:100%;border-radius:4px;background:center/cover;cursor:zoom-in;border:0;padding:0;display:block}
.pj .ct{font-size:12.5px;color:var(--brass);font-weight:700;letter-spacing:.1em}
.pj .ct b{font-family:var(--serif);color:var(--wal);margin-left:8px;letter-spacing:0;font-size:15px}
.pj h3{font-size:24px;line-height:1.35;margin-top:6px}
.pj dl{display:grid;grid-template-columns:60px minmax(0,1fr);row-gap:6px;font-size:14px;margin:14px 0 0}
.pj dt{color:var(--sub)}.pj dd{margin:0;font-weight:500}
.pj .pt{margin-top:14px;font-size:14.5px;color:var(--sub);border-top:1px solid var(--line);padding-top:12px}
.gal{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}
.gal button{aspect-ratio:4/3;border:0;padding:0;border-radius:3px;background:center/cover;position:relative;cursor:zoom-in;max-width:100%}
.gal button i{position:absolute;left:6px;bottom:6px;font-style:normal;background:rgba(20,18,16,.62);color:#fff;font-size:11.5px;padding:2px 8px;border-radius:2px}
.ba{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
.ba button{aspect-ratio:4/3;border:0;padding:0;border-radius:3px;background:center/cover;position:relative;cursor:zoom-in;max-width:100%}
.ba button b{position:absolute;left:8px;top:8px;background:var(--dark);color:var(--on-dark);font-size:11.5px;letter-spacing:.14em;padding:3px 10px;border-radius:2px}
.ba button.af b{background:var(--wal);color:var(--paper)}
.pidx{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:22px}
.pidx a{text-decoration:none;background:var(--paper);border:1px solid var(--line);border-radius:4px;overflow:hidden;display:block}
.pidx a div{aspect-ratio:4/3;background:center/cover;max-width:100%}
.pidx a span{display:block;padding:8px 10px;font-size:13px;line-height:1.4}
.pidx a span b{color:var(--wal);font-family:var(--serif);margin-right:6px}
.more{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:22px}
.more div{background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:14px 16px}
.more .y{font-family:var(--serif);font-weight:900;color:var(--wal)}
.more b{display:block;margin-top:2px}
.more span{display:block;font-size:13px;color:var(--sub);margin-top:4px}
.certs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:22px}
.certs button{border:1px solid var(--line);background:#fbfbfa center/contain no-repeat;aspect-ratio:7/10;width:100%;max-width:100%;border-radius:3px;cursor:zoom-in}
.certs b{display:block;margin-top:8px;font-size:15px}
.certs span{font-size:12.5px;color:var(--sub)}
.contact{background:var(--dark);color:var(--on-dark);padding-block:56px}
.contact h2{color:var(--on-dark);font-size:32px}
.contact p{color:var(--on-dark-sub);margin:8px 0 0}
.contact dl{display:grid;grid-template-columns:90px minmax(0,1fr);row-gap:12px;margin:26px 0 0;font-size:16px}
.contact dt{color:var(--brass)}.contact dd{margin:0;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.contact .copy{font:inherit;font-size:12px;border:1px solid #4a4038;background:transparent;color:var(--on-dark);border-radius:14px;padding:2px 10px;cursor:pointer}
.contact .cta{margin-top:28px;border:1px solid #4a4038;border-radius:4px;padding:18px;color:var(--on-dark-sub);max-width:40em}
.contact .cta b{display:block;color:var(--on-dark);font-size:17px;margin-bottom:4px}
.contact small{display:block;margin-top:30px;color:#8a7f73;font-size:12px}
#lb{position:fixed;inset:0;background:rgba(10,9,8,.92);z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(16px + env(safe-area-inset-top,0px)) 16px calc(16px + env(safe-area-inset-bottom,0px))}
#lb[hidden]{display:none}
#lb img{max-width:100%;max-height:82vh;border-radius:3px}
#lb p{color:#eee;margin:10px 0 0;font-size:14px}
#lb button{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:calc(12px + env(safe-area-inset-right,0px));background:#fff;border:0;border-radius:18px;padding:6px 14px;font:inherit;font-size:14px;cursor:pointer}
@media (max-width:820px){
  .nums,.mg{grid-template-columns:repeat(2,minmax(0,1fr))}
  .two,.pj .top{grid-template-columns:minmax(0,1fr)}
  .hs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .vals{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.vals .v{grid-column:span 2}
  .flow{grid-template-columns:repeat(4,minmax(0,1fr))}
  .cards3,.more{grid-template-columns:minmax(0,1fr)}
  .pl{columns:1}
  .pidx{grid-template-columns:repeat(2,minmax(0,1fr))}
  .certs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gal{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:8px;margin-right:calc(-1 * max(16px,env(safe-area-inset-right,0px)))}
  .gal button{flex:0 0 78%;scroll-snap-align:start}
}
@media (max-width:420px){.hs{grid-template-columns:minmax(0,1fr)}.nums b{font-size:32px}}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
'''

def wimg(n):
    return f"background-image:url(img/{n}.jpg)"
def zbtn(n, cap, cls='', inner=''):
    return f'<button type="button" class="{cls}" style="{wimg(n)}" data-src="img/{n}.jpg" data-cap="{e(cap)}" aria-label="{e(cap)} 크게 보기">{inner}</button>'

W = []
W.append('<title>홈퍼니싱 지명원 2026</title>\n<meta name="claude:viewport-fit-sides" content="cover">')
W.append('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@600;900&display=swap">')
W.append(f'<style>{WCSS}</style>')
W.append('<nav aria-label="목차"><div class="wrap"><span class="logo">HOME FURNISHING</span><a href="#about">회사</a><a href="#perf">실적</a><a href="#works">시공사례</a><a href="#license">인증</a><a href="#contact">연락처</a></div></nav>')
W.append(f'''<header class="hero"><div class="ph" style="{wimg('bi11')}" role="img" aria-label="경기도자비엔날레 전시공간"></div><div class="wrap tx"><div class="br">HOME FURNISHING · ártico studio</div><h1>지명원 2026</h1>
<p>주식회사 홈퍼니싱은 관공서 · 학교 · 문화시설의 실내 공간을 설계 지원부터 시공, 가구 납품까지 한 팀으로 책임집니다.</p>
<div class="chips"><span>실내건축공사업</span><span>여성기업 수의계약</span><span>연구개발전담부서</span><span>2014년 설립</span></div></div></header>''')

nums = ''.join(f'<div><b>{a}<small>{u}</small></b><span>{l}</span><em>{s}</em></div>' for a, u, l, s in NUMBERS)
qk = ''.join(f'<div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in QUICK)
W.append(f'''<section class="s" id="glance"><div class="wrap"><div class="ey">At a glance</div><h2>발주처 담당자를 위한 한눈 요약</h2><div class="nums">{nums}</div><dl class="qk">{qk}</dl></div></section>''')

kv = ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in COMPANY.items())
ceo = ''.join(f'<p>{x}</p>' for x in CEO)
W.append(f'''<section class="s" id="about"><div class="wrap"><div class="ey">Who we are</div><h2>회사 개요</h2>
<div class="two"><div><p class="lead">설계부터 시공, 가구 납품까지<br><em>공간의 A to Z</em>를 한 팀이 책임지는<br>디자인 시공 전문기업입니다.</p><dl class="kv" style="margin-top:22px">{kv}</dl></div>
<div class="ceo"><div class="ey">Message from the CEO</div><p class="lead" style="font-size:19px;margin-top:8px">“우리는 우리가 만들어 나가는 공간의 변화, 그 가치와 힘을 믿습니다.”</p>{ceo}<div class="sig">대표이사<span>최윤수 · 신혜현</span></div></div></div></div></section>''')

hs = ''.join(f'<div class="st{" now" if i == 3 else ""}"><div class="yy">{y}</div><div class="nm">{n}</div><div class="ds">{d}</div><ul>{"".join(f"<li>{x}</li>" for x in it)}</ul></div>' for i, (y, n, d, it) in enumerate(HISTORY))
vals = '<div class="v"><b>Vision 2030</b>디자인 기업 홈퍼니싱이 만드는 새로운 세상</div>' + ''.join(f'<div><b>{a}</b>{b}</div>' for a, b in VALUES)
org = '<span class="ce">대표이사</span>' + ''.join(f'<span>{x}</span>' for x in ORG)
W.append(f'''<section class="s" id="history"><div class="wrap"><div class="ey">History &amp; Vision</div><h2>회사 연혁 · 비전</h2><div class="hs">{hs}</div><div class="vals">{vals}</div><div class="org">{org}</div></div></section>''')

flow = ''.join(f'<div class="{"on" if i < 3 else ""}">{x}</div>' for i, x in enumerate(PROCESS))
diff = ''.join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in DIFF)
mg = ''.join(f'<div><b>{a}</b>{b}</div>' for a, b in MANAGE)
W.append(f'''<section class="s" id="service"><div class="wrap"><div class="ey">What we do</div><h2>제공 서비스 · 차별화</h2><p class="lede">공사 계약 프로세스 8단계 중 발주 전 ①~③ 단계부터 함께합니다.</p>
<div class="flow">{flow}</div><div class="fcap">①~③ ONE-STOP 지원 · 디자인 특화</div><div class="cards3">{diff}</div>
<h3 style="font-size:22px;margin-top:40px">공정 · 안전 · 품질 관리</h3><div class="mg">{mg}</div><div class="note"><b>주요 공종</b> &nbsp;{TRADES}</div></div></section>''')

yrs = ''.join(f'<a href="#y{y[:4]}">{y}</a>' for y, _, _ in PERF)
yb = ''
for y, note, rows in PERF:
    li = ''.join(f'<li><span class="mo">{m}</span><div><div class="t">{t}<span class="tg {TAGCLS.get(tg, "")}">{tg}</span></div><div class="c">{c}</div></div></li>' for m, t, c, tg in rows)
    yb += f'<div class="yb" id="y{y[:4]}"><h3>{y}<span>{len(rows)}건{" · " + note if note else ""}</span></h3><ul class="pl">{li}</ul></div>'
cl = ''.join(f'<span>{c}</span>' for c in CLIENTS)
W.append(f'''<section class="s" id="perf"><div class="wrap"><div class="ey">Construction performance</div><h2>주요 시공실적</h2><p class="lede">2020년부터 2026년 10월까지 공공 · 교육 · 문화시설 공사 78건, 주거공간 인테리어 180건 이상을 수행했습니다.</p>
<div class="yrs">{yrs}</div>{yb}<h3 style="font-size:22px;margin-top:40px">주요 발주처</h3><div class="cl">{cl}</div></div></section>''')

pidx = ''.join(f'<a href="#{p["id"]}"><div style="{wimg(p["hero"])}"></div><span><b>{p["year"]}</b>{p["title"]}</span></a>' for p in PROJECTS)
pj = ''
for p in PROJECTS:
    loc = f'<dt>위치</dt><dd>{p["loc"]}</dd>' if p['loc'] else ''
    ba = ''
    if p.get('before'):
        b, a = p['before']
        ba = f'<div class="ba">{zbtn(b, "공사 전", "", "<b>BEFORE</b>")}{zbtn(a, "공사 후", "af", "<b>AFTER</b>")}</div>'
    gal = ''.join(zbtn(f, c, '', f'<i>{c}</i>') for f, c in p['photos'])
    pj += f'''<article class="pj" id="{p['id']}"><div class="top"><button type="button" class="heroimg" style="{wimg(p['hero'])}" data-src="img/{p['hero']}.jpg" data-cap="{e(p['title'])}" aria-label="{e(p['title'])} 대표 사진 크게 보기"></button>
<div><div class="ct">{p['cat']}<b>{p['year']}</b></div><h3>{p['title']}</h3><dl><dt>발주처</dt><dd>{p['client']}</dd>{loc}<dt>기간</dt><dd>{p['term']}</dd><dt>내용</dt><dd>{p['work']}</dd></dl><div class="pt">{p['point']}</div></div></div>{ba}<div class="gal">{gal}</div></article>'''
more = ''.join(f'<div><span class="y">{y}</span><b>{t}</b><span>{c} · {w} · {d}</span></div>' for y, t, c, w, d in MORE)
W.append(f'''<section class="s" id="works"><div class="wrap"><div class="ey">Construction experience</div><h2>시공 사례</h2><p class="lede">최근 현장부터 정리했습니다. 사진을 누르면 크게 볼 수 있습니다.</p><div class="pidx">{pidx}</div>{pj}
<h3 style="font-size:22px;margin-top:30px">그 외 관공서 · 교육시설</h3><div class="more">{more}</div></div></section>''')

certs = ''.join(f'<div><button type="button" style="background-image:url(img/{f}.jpg)" data-src="img/{f}.jpg" data-cap="{e(t)}" aria-label="{e(t)} 크게 보기"></button><b>{t}</b><span>{s}</span></div>' for f, t, s in CERTS)
W.append(f'''<section class="s" id="license"><div class="wrap"><div class="ey">Certification &amp; License</div><h2>인증 서류</h2><div class="certs">{certs}</div></div></section>''')

ct = ''.join(f'<dt>{k}</dt><dd><span>{v}</span>' + (f'<button type="button" class="copy" data-copy="{e(v.split()[-1])}">복사</button>' if k in ('대표전화', '담당', '이메일') else '') + '</dd>' for k, v in CONTACT)
W.append(f'''<section class="contact" id="contact"><div class="wrap"><div class="ey">Contact</div><h2>주식회사 홈퍼니싱</h2><p>공간의 변화, 그 가치와 힘을 믿습니다.</p>
<dl>{ct}<dt>주소</dt><dd>{COMPANY['주소']}</dd></dl>
<div class="cta"><b>현장 실측 · 견적 상담</b>도면이나 현장 사진을 보내주시면 공종별 내역과 일정까지 정리해 회신드립니다.</div>
<small>Ⓒ HOME FURNISHING CO. · 2026.10 기준</small></div></section>''')
W.append('<div id="lb" hidden role="dialog" aria-modal="true" aria-label="사진 크게 보기"><button type="button" id="lbx">닫기</button><img id="lbi" alt=""><p id="lbc"></p></div>')
W.append(r'''<script>
(function(){
  var lb=document.getElementById('lb'),im=document.getElementById('lbi'),cap=document.getElementById('lbc'),last=null;
  document.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-src]');
    if(b){last=b;im.src=b.getAttribute('data-src');im.alt=b.getAttribute('data-cap')||'';cap.textContent=b.getAttribute('data-cap')||'';lb.hidden=false;document.getElementById('lbx').focus();return;}
    var c=ev.target.closest('[data-copy]');
    if(c){var t=c.getAttribute('data-copy');var done=function(){c.textContent='복사됨';setTimeout(function(){c.textContent='복사'},1500)};
      try{navigator.clipboard.writeText(t).then(done,function(){sel(c)})}catch(e){sel(c)}return;}
    if(!lb.hidden&&(ev.target===lb||ev.target.id==='lbx')){close();}
  });
  function sel(c){var s=c.previousElementSibling;var r=document.createRange();r.selectNodeContents(s);var w=getSelection();w.removeAllRanges();w.addRange(r);}
  function close(){lb.hidden=true;im.removeAttribute('src');if(last)last.focus();}
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&!lb.hidden)close();});
})();
</script>''')
open(f'{M}/web.html', 'w', encoding='utf-8').write('\n'.join(W))
used = set()
import re
for s in ['\n'.join(W)]:
    used |= set(re.findall(r'img/([\w\-]+)\.jpg', s))
open(f'{M}/web_imgs.txt', 'w').write('\n'.join(sorted(used)))
print('web imgs', len(used))
