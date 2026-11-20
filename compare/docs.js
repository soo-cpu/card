/* 타사 견적 비교기 — 문서 담당: 고객용 한 장(HTML) + 직원용 설명 메모(Markdown) 2026-11-21 v0
 * 고객용에는 우리 단가·범위 숫자를 넣지 않는다. 둘 다 reviewer(QC.review)를 통과해야 내보낸다. */
(function (root) {
  'use strict';
  var QC = (typeof module !== 'undefined' && module.exports) ? require('./engine.js') : root.QC;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function won(n) { return n ? Math.round(n).toLocaleString('ko-KR') + '원' : '-'; }
  function man(n) { return n ? Math.round(n / 10000).toLocaleString('ko-KR') + '만' : '-'; }

  function pick(r) {
    var real = r.findings.filter(function (f) { return !f.info && f.customer; });
    return {
      missing: real.filter(function (f) { return f.kind === '빠진 공정'; }),
      later: real.filter(function (f) { return f.kind !== '빠진 공정' && f.later; }),
      check: real.filter(function (f) { return !f.later && f.kind !== '빠진 공정'; })
    };
  }

  // 고객에게 보여줄 한 장 (A4 세로 1장 기준, 인쇄용 CSS 포함)
  function customerHTML(r, meta) {
    meta = meta || {};
    var g = pick(r), date = meta.date || '';
    var procCells = QC.PROCS.map(function (p) {
      var a = r.totals[p] || 0, ok = a > 0;
      var opt = (p === '창호' || p === '기타' || p === '설비');
      return '<div class="pc ' + (ok ? 'ok' : (opt ? 'opt' : 'no')) + '"><b>' + p + '</b><span>' + (ok ? man(a) : (opt ? '없음(선택)' : '없음')) + '</span></div>';
    }).join('');
    function list(arr, max) {
      if (!arr.length) return '<p class="none">해당 없음</p>';
      return '<ol>' + arr.slice(0, max).map(function (f) { return '<li>' + esc(f.customer) + '</li>'; }).join('') + '</ol>' +
        (arr.length > max ? '<p class="more">그 밖에 ' + (arr.length - max) + '건은 상담 때 함께 설명드립니다.</p>' : '');
    }
    var html = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>받으신 견적서 점검표</title><style>' +
      '@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:"Malgun Gothic","맑은 고딕","Noto Sans KR",sans-serif;color:#000;margin:0;font-size:10.5pt;line-height:1.5}' +
      '.top{background:#203864;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:flex-end}.top h1{margin:0;font-size:17pt;letter-spacing:-.5px}.top .brand{font-size:9pt;letter-spacing:2px;color:#D1E3F3}' +
      '.meta{display:flex;gap:18px;flex-wrap:wrap;background:#F2F2F2;padding:8px 16px;font-size:9.5pt}.meta b{color:#1F4E79}' +
      'h2{font-size:11.5pt;color:#1F4E79;border-bottom:2px solid #1F4E79;padding-bottom:2px;margin:12px 0 6px}' +
      '.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}.pc{border:1px solid #D1E3F3;padding:4px 6px;display:flex;flex-direction:column;font-size:9pt}.pc b{font-size:10pt}' +
      '.pc.ok{background:#fff}.pc.no{background:#fff;border:2px solid #FF0000}.pc.no span{color:#FF0000;font-weight:700}.pc.opt{background:#F2F2F2;color:#7F7F7F}' +
      'ol{margin:0;padding-left:20px}li{margin:2px 0}.none,.more{margin:2px 0;color:#7F7F7F;font-size:9.5pt}' +
      '.tip{margin-top:10px;background:#D1E3F3;padding:8px 12px;font-size:9.5pt}.tip b{background:#FFC000;padding:0 3px}' +
      '.foot{margin-top:10px;font-size:8pt;color:#7F7F7F;display:flex;justify-content:space-between}</style></head><body>' +
      '<div class="top"><h1>받으신 견적서 점검표</h1><div class="brand">HOME FURNISHING</div></div>' +
      '<div class="meta"><span><b>평형</b> ' + (r.평형 ? r.평형 + '평' : '확인 필요') + '</span><span><b>견적서 총액</b> ' + won(r.총액) + '</span><span><b>부가세</b> ' + esc(r.vat) + '</span><span><b>점검일</b> ' + esc(date) + '</span></div>' +
      '<h2>공정별로 들어 있는지 (견적서에 적힌 금액)</h2><div class="grid">' + procCells + '</div>' +
      '<h2>1. 견적서에 빠진 공정 (' + g.missing.length + '건)</h2>' + list(g.missing, 4) +
      '<h2>2. 나중에 추가될 수 있는 것 (' + g.later.length + '건)</h2>' + list(g.later, 7) +
      '<h2>3. 수량·자재 확인할 것 (' + g.check.length + '건)</h2>' + list(g.check, 4) +
      '<div class="tip"><b>비교 요령</b> 총액만 보지 마시고, 같은 공정·같은 수량·같은 자재 등급으로 맞춰 비교하세요. 빠진 공정과 ‘별도’ 항목을 더한 금액이 실제로 내실 금액입니다.</div>' +
      '<div class="foot"><span>이 점검표는 받으신 견적서에 적힌 내용만 보고 만든 참고 자료입니다. 업체마다 범위가 다를 수 있습니다.</span><span>ⓒ HOME FURNISHING CO. all rights reserved.</span></div>' +
      '</body></html>';
    return html;
  }

  // 직원용 설명 메모 (옵시디언·드라이브용 Markdown)
  function staffMemo(r, meta) {
    meta = meta || {};
    var g = pick(r), L = [];
    var top = r.findings.filter(function (f) { return !f.info; }).slice(0, 3);
    L.push('# 타사 견적 비교 메모 — ' + (meta.title || '고객 견적') + ' ' + (meta.date || ''));
    L.push('');
    L.push('> [!summary] 요약');
    L.push('> - 분석: 빠진 공정 ' + r.counts.빠진공정 + '건, 나중에 추가될 가능성 ' + r.counts.추가가능 + '건, 수량·금액 확인 ' + r.counts.수량 + '건, 자재 ' + r.counts.자재 + '건.');
    L.push('> - 할 일: ' + (top.length ? top.map(function (f) { return f.title; }).join(' / ') : '큰 문제 없음') + ' 부터 설명.');
    L.push('> - 주의: 상대 업체를 깎아내리지 말고 “같은 조건으로 맞춰 비교”만 권하기. 이 메모는 직원용 — 고객에게는 점검표 한 장만 드림.');
    L.push('');
    L.push('기준: ' + r.base + ' · 평형대 ' + r.band + ' · 부가세 ' + r.vat + (r.vat === '포함' ? ' (비교할 때 ÷1.1)' : ''));
    L.push('');
    L.push('## 공정별 금액 (상대 견적)과 우리 견적 보통 범위');
    L.push('');
    L.push('| 공정 | 상대 견적 | 평당 | 우리 견적 보통 범위(평당) | 판단 |');
    L.push('|---|---:|---:|---|---|');
    QC.PROCS.forEach(function (p) {
      var a = r.totals[p] || 0, ref = QC.refFor(r.평형, p);
      var per = (a && r.평형) ? ((a / (r.vat === '포함' ? 1.1 : 1)) / 10000 / r.평형).toFixed(1) + '만' : '-';
      var f = r.findings.filter(function (x) { return x.proc === p && !x.info; })[0];
      L.push('| ' + p + ' | ' + (a ? man(a) : '없음') + ' | ' + per + ' | ' + (ref.row ? ref.row[0] + '~' + ref.row[2] + '만 (' + ref.band + ')' : '-') + ' | ' + (f ? f.kind : '보통') + ' |');
    });
    L.push('');
    L.push('## 결과마다 — 형, 이렇게 설명하세요');
    r.findings.filter(function (f) { return !f.info; }).forEach(function (f, i) {
      L.push('');
      L.push('### ' + (i + 1) + '. [' + f.level + '] ' + f.title);
      L.push('- 근거: ' + f.detail);
      L.push('- 추천 문장: “' + f.say + '”');
    });
    var info = r.findings.filter(function (f) { return f.info; });
    if (info.length) { L.push(''); L.push('## 자재 메모'); info.forEach(function (f) { L.push('- ' + f.title); }); }
    L.push('');
    L.push('## 분석');
    L.push('');
    L.push('| 구분 | 현황 | 문제점 | 개선점 |');
    L.push('|---|---|---|---|');
    L.push('| 빠진 공정 | ' + g.missing.length + '건 | ' + (g.missing.map(function (f) { return f.proc; }).join('·') || '-') + ' | 우리 견적에 들어 있는 범위를 같이 보여 주기 |');
    L.push('| 추가 가능 | ' + g.later.length + '건 | 계약 뒤 추가 청구 위험 | 고객 점검표 2번을 같이 읽어 드리기 |');
    L.push('| 수량·자재 (고객용 3번) | ' + g.check.length + '건 | 같은 조건 비교가 안 됨 | 같은 수량·등급으로 맞춘 비교표 제안 |');
    L.push('');
    L.push('## 향후 계획');
    L.push('');
    L.push('| 할 일 | 담당 | 기한 | 우선순위 |');
    L.push('|---|---|---|---|');
    L.push('| 고객에게 점검표 한 장 전달·설명 | 담당 실장 | 상담 당일 | 상 |');
    L.push('| 빠진 공정·별도 항목 넣은 같은 조건 견적 다시 보내기 | 담당 실장 | 2일 안 | 중 |');
    L.push('| 읽기 결과 틀린 곳이 있으면 화면에서 고쳐 다시 비교 | 담당 실장 | 바로 | 하 |');
    L.push('');
    L.push('ⓒ HOME FURNISHING CO. all rights reserved.');
    return L.join('\n');
  }

  // 내보내기 전 검사: 두 문서 다 reviewer 통과해야 함
  function gate(r, meta, extra) {
    var c = customerHTML(r, meta), m = staffMemo(r, meta);
    var rc = QC.review(c, extra), rm = QC.review(m, extra);
    // 고객용에는 우리 보통 범위 숫자(평당)도 들어가면 안 됨
    var extra = [];
    if (/보통 범위|평당/.test(c.replace(/<[^>]+>/g, ''))) extra.push({ word: '우리 범위/평당', at: '고객용 한 장' });
    return { customer: c, memo: m, pass: rc.pass && rm.pass && !extra.length, hits: { customer: rc.hits.concat(extra), memo: rm.hits } };
  }

  var api = { customerHTML: customerHTML, staffMemo: staffMemo, gate: gate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.QCDocs = api;
})(typeof window !== 'undefined' ? window : this);
