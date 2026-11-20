// 시험 결과 PDF: 타사 견적 비교기 시험 결과 2026-11-21 v0
const fs = require('fs'), Q = require('../engine.js'), { chromium } = require('playwright');
const R = JSON.parse(fs.readFileSync('work/out/test_results.json', 'utf8'));
const A = JSON.parse(fs.readFileSync('work/accuracy.json', 'utf8'));
const M = JSON.parse(fs.readFileSync('work/out/조작시험.json', 'utf8'));
const REV = fs.existsSync('work/out/reviewer.json') ? JSON.parse(fs.readFileSync('work/out/reviewer.json', 'utf8')) : { verdict: '(미실시)', notes: [] };
const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const man = n => n ? Math.round(n / 10000).toLocaleString('ko-KR') + '만' : '-';
const css = `@page{size:A4;margin:14mm 12mm}*{box-sizing:border-box}body{font-family:"Malgun Gothic","Noto Sans KR",sans-serif;font-size:9.6pt;line-height:1.5;color:#000;margin:0}
.cover{background:#203864;color:#fff;padding:18px 20px;margin-bottom:10px}.cover h1{margin:0;font-size:20pt}.cover p{margin:4px 0 0;color:#D1E3F3}
h2{color:#1F4E79;font-size:12.5pt;border-bottom:2px solid #1F4E79;padding-bottom:2px;margin:16px 0 6px;break-after:avoid}h3{font-size:10.5pt;margin:10px 0 4px;color:#203864}
table{border-collapse:collapse;width:100%;margin:4px 0 8px;font-variant-numeric:tabular-nums}th{background:#1F4E79;color:#fff;font-weight:700;padding:4px 6px;text-align:left;font-size:9pt}td{border-bottom:1px solid #d9d9d9;padding:3px 6px;vertical-align:top}tr:nth-child(even) td{background:#F2F2F2}
.sum{background:#D1E3F3;padding:8px 12px;margin:6px 0}.sum li{margin:2px 0}.ok{color:#1F4E79;font-weight:700}.bad{color:#FF0000;font-weight:700}
.say{color:#333;font-size:8.8pt}.hi{background:#FFC000;padding:0 3px}.foot{margin-top:14px;font-size:8pt;color:#7F7F7F;text-align:right}.pb{break-before:page}`;
let h = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head><body>`;
h += `<div class="cover"><h1>타사 견적 비교기 시험 결과 2026-11-21 v0</h1><p>예전 견적서 3건 (고객 이름·전화·동호수 가림) · 읽기 → 비교 → 문서 → 검토 · HOME FURNISHING</p></div>`;
const allGate = R.res.every(x => x.gate.pass), negOK = R.neg.every(x => !x.pass);
h += `<div class="sum"><ul>
<li>📊 분석: 3건 모두 갑지 공정 금액을 원본과 <b>원 단위까지 똑같이</b> 읽음 (12/12 · 11/11 · 13/13). 세부 줄은 시험2 81/81, 시험3 94/97 (나머지 3줄은 사진에서 잘린 칸이라 ‘모름’ 처리).</li>
<li>🎯 향후 계획: 실제 타사 견적서 2~3건으로 직원이 써 보고 틀린 판단을 고친 뒤 v1. 빠진 공정 판단은 가공 시험으로 확인함.</li>
<li>⚠️ 주의: 시험 견적 3건은 우리 회사 예전 견적이라 ‘빠진 공정’이 0건으로 나오는 것이 정상. reviewer 자동 검사 ${allGate ? '<span class="ok">3건 통과</span>' : '<span class="bad">반려 있음</span>'}, 금지 낱말을 일부러 넣은 시험 문장 ${negOK ? '<span class="ok">4건 모두 반려됨</span>' : '<span class="bad">못 막음</span>'}, 검토 에이전트 최종: <b>${esc(REV.verdict)}</b>.</li></ul></div>`;
h += `<h2>1. 시험 방법</h2><table><tr><th>담당</th><th>한 일</th></tr>
<tr><td>읽기</td><td>시험 견적을 고객이 보내는 모양으로 바꿈 (시험1 PDF, 시험2 PDF, 시험3 휴대폰 사진처럼 기울이고 흐리게 만든 22장). 읽기 에이전트 3명이 직원 화면과 <b>같은 지시문</b>으로 각각 읽음.</td></tr>
<tr><td>비교</td><td>${esc(Q.BASE_NAME)} 기준으로 빠진 공정·금액 범위·수량·자재 등급·나중에 추가될 항목·별도 문구·부가세 점검.</td></tr>
<tr><td>문서</td><td>고객용 한 장(A4 1장) + 직원용 설명 메모 + 결과마다 “형, 이렇게 설명하세요” 문장.</td></tr>
<tr><td>reviewer</td><td>① 자동 검사(금지 낱말·내부 숫자) — 걸리면 내보내기 잠금 ② 독립 검토 에이전트가 산출물·화면·코드 전체를 다시 읽음.</td></tr></table>`;
h += `<h2>2. 읽기 정확도 (원본과 대조)</h2><table><tr><th>시험</th><th>평형·부가세</th><th>갑지 공정 금액</th><th>세부 줄</th><th>총액</th><th>주의</th></tr>`;
R.res.forEach(x => { const a = A[x.n]; h += `<tr><td>${esc(x.name)}</td><td>${x.평형}평 · ${esc(x.vat)}</td><td class="ok">${esc(a.갑지)}</td><td>${esc(a.세부)}</td><td>${x.총액일치 ? '<span class="ok">일치</span>' : '<span class="bad">다름</span>'} (${Number(x.src.총액).toLocaleString('ko-KR')}원)</td><td>${esc(a.주의)}</td></tr>`; });
h += `</table>`;
R.res.forEach((x, i) => {
  h += `<h2 class="${i ? 'pb' : ''}">${3 + i}. ${esc(x.name)} — 비교 결과</h2>`;
  h += `<table><tr>${Q.PROCS.map(p => `<th>${p}</th>`).join('')}</tr><tr>${Q.PROCS.map(p => `<td>${man(x.totals[p])}</td>`).join('')}</tr></table>`;
  h += `<p>빠진 공정 <b>${x.counts.빠진공정}</b> · 나중에 추가될 가능성 <b>${x.counts.추가가능}</b> · 수량·금액 확인 <b>${x.counts.수량}</b> · 자재 등급 <b>${x.counts.자재}</b> · 고객용 한 장 ${x.custPages}쪽 · 자동 검사 ${x.gate.pass ? '<span class="ok">통과</span>' : '<span class="bad">반려</span>'}</p>`;
  h += `<table><tr><th style="width:9%">중요도</th><th style="width:30%">찾은 것</th><th>형, 이렇게 설명하세요 (추천 문장)</th></tr>`;
  x.findings.filter(f => !f.info).forEach(f => { h += `<tr><td>${esc(f.level)}</td><td><b>${esc(f.kind)}</b><br>${esc(f.title)}</td><td class="say">${esc(f.say)}</td></tr>`; });
  const info = x.findings.filter(f => f.info); if (info.length) h += `<tr><td>참고</td><td colspan="2">${info.map(f => esc(f.title)).join(' · ')}</td></tr>`;
  h += `</table>`;
});
h += `<h2 class="pb">6. 빠진 공정 찾기 확인 (가공 시험)</h2><p>시험 견적은 우리 견적이라 빠진 공정이 없습니다. 판단이 맞게 작동하는지 보려고 <b>시험2 읽기 결과에서 철거·욕실을 지우고, 바닥 수량을 12평으로 줄이고, “욕실 방수 실측 후 별도” 문구를 넣은 가공본</b>으로 한 번 더 돌렸습니다 (실제 견적 아님).</p><table><tr><th>중요도</th><th>종류</th><th>찾은 것</th></tr>`;
M.forEach(f => { h += `<tr><td>${esc(f.level)}</td><td>${esc(f.kind)}</td><td>${esc(f.title)}</td></tr>`; });
h += `</table><p>→ 지운 철거·욕실을 <b>빠진 공정(높음)</b>, 줄인 바닥을 <b>수량 적음</b>, 넣은 문구를 <b>‘별도’·‘실측’ 항목</b>으로 모두 찾음.</p>`;
h += `<h2>7. reviewer 결과</h2><table><tr><th>검사</th><th>결과</th></tr>`;
R.res.forEach(x => { h += `<tr><td>자동 검사 — ${esc(x.name)} 고객용·메모</td><td>${x.gate.pass ? '<span class="ok">통과</span>' : '<span class="bad">반려</span> ' + esc(JSON.stringify(x.gate.hits))}</td></tr>`; });
R.neg.forEach((x, k) => { h += `<tr><td>일부러 금지 낱말·숫자를 넣은 시험 문장 ${k + 1}</td><td>${!x.pass ? '<span class="ok">반려됨 (정상)</span>' : '<span class="bad">통과됨 (문제)</span>'}</td></tr>`; });
h += `<tr><td>독립 검토 에이전트 (산출물·직원 화면·코드 전체)</td><td><b>${esc(REV.verdict)}</b>${REV.notes.length ? '<br>' + REV.notes.map(esc).join('<br>') : ''}</td></tr></table>`;
h += `<h2>분석</h2><table><tr><th>구분</th><th>현황</th><th>문제점</th><th>개선점</th></tr>
<tr><td>읽기</td><td>갑지 36/36 공정 금액 일치, 세부 줄 대조 175/178</td><td>사진에서 잘린 칸 3줄은 못 읽음</td><td>고객에게 PDF 원본 요청 문구를 상담 안내에 넣기</td></tr>
<tr><td>비교</td><td>빠진 공정·수량·별도 문구는 가공 시험에서 모두 잡음</td><td>시험 견적이 우리 견적이라 실제 타사 양식 시험이 없음</td><td>실제 타사 견적 2~3건으로 v1 점검</td></tr>
<tr><td>추가 가능 항목</td><td>줄눈·욕실 방수·고객 부담 항목을 잡음</td><td>낱말이 없으면 ‘안 보임’으로 판단 → 다른 이름으로 적힌 경우 오탐 가능</td><td>직원이 화면에서 틀린 판단을 알려 주면 낱말 추가</td></tr>
<tr><td>검토</td><td>자동 검사 + 독립 검토 에이전트</td><td>직원용 메모를 고객에게 보낼 위험</td><td>메모 첫 줄 ‘직원용’ 유지, 고객에게는 한 장만</td></tr></table>`;
h += `<h2>향후 계획</h2><table><tr><th>할 일</th><th>담당</th><th>기한</th><th>우선순위</th></tr>
<tr><td>실제 타사 견적서로 써 보고 틀린 판단 알려 주기</td><td>정진혁·이봄이 실장</td><td>1주</td><td>상</td></tr>
<tr><td>인트라넷 ‘상담 진행’에 바로가기</td><td>Claude</td><td>대표 승인 뒤</td><td>중</td></tr>
<tr><td>기초데이터 새 판 나오면 기준표 갱신</td><td>Claude</td><td>새 판 나올 때</td><td>중</td></tr></table>`;
h += `<div class="foot">ⓒ HOME FURNISHING CO. all rights reserved.</div></body></html>`;
fs.writeFileSync('work/out/시험 결과.html', h);
const rv = Q.review(h); console.log('report review', JSON.stringify(rv));
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.setContent(h); await p.pdf({ path: 'work/out/타사 견적 비교기 시험 결과 2026-11-21 v0.pdf', format: 'A4', printBackground: true }); await b.close(); console.log('pdf ok'); })();
