/* 타사 견적 비교기 엔진 2026-11-21 v0
 * 기준: 상세견적 기초데이터 2026-11-18 v1 — 3장 '견적 기준 10공정' 표(평당, 만원, VAT 별도, 직접공사비)만 씀.
 * 원가·마진 숫자는 이 파일에 넣지 않는다 (reviewer가 막음).
 */
(function (root) {
  'use strict';

  var VERSION = '타사 견적 비교기 2026-11-21 v0';
  var BASE_NAME = '상세견적 기초데이터 2026-11-18 v1 (견적 10공정, 평당 만원, VAT 별도)';

  // 10공정 + 창호·기타. 순서는 기초데이터 표 순서.
  var PROCS = ['철거', '목공', '전기', '설비', '타일', '욕실', '도배', '필름', '바닥', '주방', '창호', '기타'];
  var CORE10 = PROCS.slice(0, 10);

  // 견적 기준 평당 [하위25%, 중앙, 상위25%] 와 건수. 출처: 기초데이터 v1 3장.
  // 기준 평당 표는 공개 저장소에 두지 않는다: base-data.js(.gitignore)에서 읽음. 형식은 base-data.sample.js.
  var BAND = (typeof module !== 'undefined' && module.exports)
    ? (function () { try { return require('./base-data.js'); } catch (e) { return require('./base-data.sample.js'); } })()
    : root.QC_BASE;


  // 공정 분류 낱말 (읽기 결과의 원문 공정·품명으로 다시 확인할 때 씀)
  var KEYS = {
    철거: ['철거', '폐기물', '보양', '해체', '양중'],
    목공: ['목공', '몰딩', '걸레받이', '도어', '문틀', '문선', '중문', '가벽', '천장', '천정', '등박스', '아트월', '평탄화', '단열', '루바'],
    전기: ['전기', '조명', '콘센트', '스위치', '배선', '차단기', '분전반', '다운라이트', '매입등', '실링팬', '인터폰', '감지기', '라인조명'],
    설비: ['설비', '배관', '난방', '보일러', '확장', '에어컨', '분배기', '급수', '배수', '단올림', '가스'],
    타일: ['타일', '줄눈', '현관바닥', '발코니바닥'],
    욕실: ['욕실', '화장실', '방수', '양변기', '세면대', '젠다이', '욕조', '샤워', '수전', '도기', '파티션', '휴젠뜨', '비데'],
    도배: ['도배', '벽지', '실크', '합지'],
    필름: ['필름', '페인트', '도장', '탄성코트', '시트지'],
    바닥: ['바닥', '마루', '장판', '데코타일', '포세린', 'SPC', '강마루', '강화마루'],
    주방: ['주방', '싱크', '상판', '수납', '붙박이', '신발장', '가구', '후드', '쿡탑'],
    창호: ['창호', '샷시', '새시', '발코니창', '분합', '로이', '이중창', '방충망'],
    기타: ['입주청소', '청소']
  };

  // 자재 등급 낱말: [낱말, 등급, 쉬운 설명]. 등급: 하 / 중 / 상
  var GRADE = {
    바닥: [['장판', '하', '장판(비닐 바닥재)'], ['데코타일', '하', '데코타일'], ['강화마루', '하', '강화마루(표면만 단단한 마루)'], ['SPC', '중', 'SPC 바닥재'], ['강마루', '중', '강마루'], ['원목마루', '상', '원목마루'], ['포세린', '상', '포세린 타일 바닥'], ['폴리싱', '상', '폴리싱 타일 바닥']],
    도배: [['소폭합지', '하', '소폭 합지벽지'], ['합지', '하', '합지벽지(종이)'], ['광폭합지', '중', '광폭 합지벽지'], ['실크', '상', '실크벽지']],
    욕실: [['덧방', '하', '기존 타일 위 덧방'], ['부분철거', '중', '부분 철거'], ['전체철거', '상', '전체 철거'], ['방수', '상', '방수 공정']],
    타일: [['300*600', '중', '300×600 타일'], ['300x600', '중', '300×600 타일'], ['600*600', '상', '600각 타일'], ['600각', '상', '600각 타일'], ['600x1200', '상', '600×1200 대형 타일'], ['포세린', '상', '포세린 타일']],
    목공: [['ABS', '중', 'ABS 도어'], ['멤브레인', '하', '멤브레인 도어'], ['영림', '중', '영림 도어'], ['원목', '상', '원목 도어']],
    주방: [['PET', '중', 'PET 도어'], ['하이그로시', '중', '하이그로시 도어'], ['인조대리석', '중', '인조대리석 상판'], ['세라믹', '상', '세라믹 상판'], ['칸스톤', '상', '엔지니어드 스톤 상판'], ['스톤', '상', '스톤 상판'], ['LPM', '하', 'LPM 도어']],
    창호: [['로이', '상', '로이(단열) 유리'], ['24mm', '중', '24mm 복층유리'], ['22mm', '하', '22mm 복층유리'], ['28mm', '상', '28mm 복층유리'], ['16mm', '하', '16mm 복층유리']],
    필름: [['LX', '중', 'LX 인테리어필름'], ['현대', '중', '현대 인테리어필름'], ['수성페인트', '중', '수성 페인트'], ['탄성코트', '중', '탄성코트']]
  };

  // 나중에 추가되기 쉬운 항목 점검표: [이름, 찾는 낱말들, 공정, 설명]
  var LATER = [
    ['폐기물 처리비', ['폐기물', '폐자재', '반출', '처리비'], '철거', '철거하면 반드시 나오는 비용이라 견적에 없으면 공사 중에 따로 청구되기 쉽습니다.'],
    ['보양 작업', ['보양'], '철거', '엘리베이터·복도 보호 작업입니다. 관리사무소에서 꼭 요구합니다.'],
    ['엘리베이터 사용료·동의서·행위허가', ['E/V', '엘리베이터', '승강기', '동의서', '행위허가', '신고'], '기타', '관리사무소 규정 비용입니다. 누가 내는지 미리 정해 두지 않으면 나중에 추가됩니다.'],
    ['욕실 방수', ['방수'], '욕실', '욕실을 뜯으면 방수를 다시 해야 합니다. 빠지면 누수 위험이 크고 나중에 추가됩니다.'],
    ['줄눈·실리콘 마감', ['줄눈', '실리콘', '코킹'], '타일', '타일 마감 작업입니다. 따로 빼 두는 업체가 많습니다.'],
    ['창호 사춤·코킹', ['사춤', '코킹'], '창호', '창을 바꾸면 틈을 메우는 작업이 필요합니다.'],
    ['몰딩·걸레받이', ['몰딩', '걸레받이'], '목공', '도배·바닥을 새로 하면 같이 바꾸는 경우가 대부분입니다.'],
    ['문틀·문선', ['문틀', '문선'], '목공', '문짝만 바꾸고 문틀은 빠진 견적이 많습니다.'],
    ['콘센트·스위치 교체', ['콘센트', '스위치'], '전기', '도배 후 옛 콘센트가 눈에 띄어 추가로 바꾸는 경우가 많습니다.'],
    ['조명 기구', ['조명', '등기구', '다운라이트', 'LED'], '전기', '전기 공사에 조명 기구값이 들어 있는지 따로 확인해야 합니다.'],
    ['입주 청소', ['입주청소', '청소'], '기타', '공사 끝나고 꼭 필요한 청소입니다.'],
    ['공사 관리비(현장 관리)', ['관리비', '진행비', '감리', '현장관리'], '기타', '마지막 합계에서 따로 붙는 경우가 있습니다.'],
    ['부가세', ['부가세', 'VAT', '부가가치세'], '기타', '부가세 포함인지 별도인지에 따라 실제 내는 돈이 10% 달라집니다.']
  ];

  var VAGUE = [
    ['별도', '‘별도’라고 적힌 항목은 지금 금액에 들어 있지 않습니다.'],
    ['제외', '‘제외’ 항목은 공사 중 따로 청구될 수 있습니다.'],
    ['추후', '‘추후 협의’ 항목은 금액이 아직 정해지지 않았습니다.'],
    ['협의', '‘협의’ 항목은 금액이 아직 정해지지 않았습니다.'],
    ['실측', '‘실측 후’ 항목은 재어 본 뒤 금액이 바뀔 수 있습니다.'],
    ['미포함', '‘미포함’ 항목은 지금 금액에 들어 있지 않습니다.'],
    ['변동', '금액이 바뀔 수 있다는 문구가 있습니다.'],
    ['고객님 직접', '고객이 직접 내거나 준비하는 항목이라 총액에 없습니다.'],
    ['고객님 부담', '고객이 직접 내는 항목이라 총액에 없습니다.'],
    ['고객준비', '고객이 직접 준비하는 항목이라 총액에 없습니다.']
  ];

  function bandOf(py) {
    if (!py) return '전체';
    if (py < 20) return '20평 미만';
    if (py < 30) return '20평대';
    if (py < 40) return '30평대';
    if (py < 50) return '40평대';
    return '50평 이상';
  }
  // 그 평형대 자료가 4건 미만이면 전체 표를 씀
  function refFor(py, proc) {
    var b = bandOf(py), row = BAND[b].d[proc];
    if (!row || row[3] < 4) return { band: '전체', row: BAND['전체'].d[proc], fallback: b !== '전체' };
    return { band: b, row: row, fallback: false };
  }
  function presence(proc) { var r = BAND['전체'].d[proc]; return r ? r[3] / BAND['전체'].n : 0; }

  function txt(l) { return [l.원문공정, l.품명, l.규격, l.메모].filter(Boolean).join(' '); }
  function has(s, words) { s = String(s || ''); for (var i = 0; i < words.length; i++) if (s.indexOf(words[i]) >= 0) return words[i]; return null; }
  function clean(s) { return String(s || '').replace(/\s*-?\s*(공정없음|선택안함|선택인함)\s*/g, ' ').replace(/\s+-\s*$/, '').trim(); }
  function man(won) { return Math.round(won / 10000); }
  function fmtMan(won) { return man(won).toLocaleString('ko-KR') + '만원'; }

  // 원문 공정명을 10공정으로 (읽기 담당이 정한 값이 있으면 그대로, 없으면 낱말로)
  function classify(name) {
    var s = String(name || '');
    if (/설비\s*[,·/]?\s*전기|전기\s*[,·/]?\s*설비/.test(s)) return '설비전기';
    if (/주방|수납가구/.test(s)) return '주방';
    for (var i = 0; i < PROCS.length; i++) { if (has(s, KEYS[PROCS[i]])) return PROCS[i]; }
    return null;
  }

  /* 읽기 결과(q) → 공정별 금액. q.공정합계: [{원문공정, 공정, 금액}]
   * 공정이 '설비전기'처럼 묶여 있으면 줄 단위(q.lines)로 다시 나눔, 줄이 없으면 묶음 그대로 둠 */
  function totals(q) {
    var t = {}; PROCS.forEach(function (p) { t[p] = 0; });
    var combined = [];
    (q.공정합계 || []).forEach(function (s) {
      var ls = (q.lines || []).filter(function (l) { return l.원문공정 === s.원문공정; });
      var lsum = ls.reduce(function (a, l) { return a + (Number(l.금액) || 0); }, 0);
      var amt = Number(s.금액) || 0;
      if (ls.length && amt > 0 && Math.abs(lsum - amt) <= Math.max(1000, amt * 0.01)) {
        // 줄마다 10공정으로 (욕실 타일은 욕실로 — 기초데이터 v1과 같은 기준)
        ls.forEach(function (l) {
          var p = (l.공정 && PROCS.indexOf(l.공정) >= 0) ? l.공정 : (classify(txt(l)) || classify(s.원문공정) || '기타');
          if (p === '설비전기') p = has(txt(l), KEYS.전기) ? '전기' : '설비';
          t[p] += Number(l.금액) || 0;
        });
        return;
      }
      var p = s.공정 && PROCS.indexOf(s.공정) >= 0 ? s.공정 : classify(s.원문공정);
      if (p === '설비전기' || (s.공정 && String(s.공정).indexOf('+') > 0)) { combined.push(s); return; }
      if (p) t[p] += Number(s.금액) || 0;
    });
    combined.forEach(function (s) {
      var lines = (q.lines || []).filter(function (l) { return l.원문공정 === s.원문공정; });
      var sum = 0;
      lines.forEach(function (l) {
        var p = (l.공정 && PROCS.indexOf(l.공정) >= 0) ? l.공정 : (has(txt(l), KEYS.전기) ? '전기' : '설비');
        t[p] += Number(l.금액) || 0; sum += Number(l.금액) || 0;
      });
      var rest = (Number(s.금액) || 0) - sum;
      if (rest > 0) { t.설비 += rest / 2; t.전기 += rest / 2; }
    });
    return t;
  }

  function josa(s) {
    s = String(s || '');
    function bat(ch) { var c = ch.charCodeAt(0); if (c < 0xAC00 || c > 0xD7A3) return /[0-9LMNRlmnr]$/.test(ch) ? 1 : 0; return (c - 0xAC00) % 28 ? 1 : 0; }
    return s.replace(/([^\s(’”')])([)’”']*)(이\(가\)|은\(는\)|을\(를\))/g, function (m, ch, par, j) {
      var b = bat(ch); var map = { '이(가)': b ? '이' : '가', '은(는)': b ? '은' : '는', '을(를)': b ? '을' : '를' };
      return ch + (par || '') + map[j];
    }).replace(/”이 있습니다/g, '” 같은 내용이 있습니다').replace(/’이 있습니다/g, '’ 같은 내용이 있습니다');
  }
  function sev(level) { return { 높음: 3, 중간: 2, 낮음: 1 }[level] || 1; }

  /* 메인: 비교. q = 읽기 결과 JSON. opts = {평형, vat:'포함'|'별도'|'모름'} */
  function compare(q, opts) {
    opts = opts || {};
    var py = Number(opts.평형 || q.평형) || null;
    var vat = opts.vat || q.vat || '모름';
    var t = totals(q);
    var div = (vat === '포함') ? 1.1 : 1; // 기준표는 VAT 별도라 포함이면 나눠서 비교
    var lines = q.lines || [];
    var allText = lines.map(txt).concat(q.특이사항 || [], q.별도문구 || [], (q.공정합계 || []).map(function (s) { return s.원문공정; })).join(' \n ');
    var F = []; // findings

    // 1) 빠진 공정
    CORE10.forEach(function (p) {
      if (t[p] > 0) return;
      var pr = presence(p);
      var level = pr >= 0.85 ? '높음' : (pr >= 0.55 ? '중간' : '낮음');
      F.push({ kind: '빠진 공정', proc: p, level: level,
        title: p + ' 공정이 견적에 없습니다',
        detail: BAND['전체'].d[p] ? '우리가 비교한 전체 공사 견적 ' + BAND['전체'].n + '건 중 ' + BAND['전체'].d[p][3] + '건에 ' + p + ' 공정이 들어 있었습니다.' : '기준 자료 필요',
        customer: p + ' 공정이 견적서에 보이지 않습니다. 이번 공사에 정말 필요 없는지, 다른 공정에 들어가 있는지 업체에 확인해 보세요.',
        later: level !== '낮음' });
    });

    // 2) 공정별 금액이 보통 범위보다 많이 낮거나 높음 (평형을 알 때만)
    if (py) {
      PROCS.forEach(function (p) {
        if (!(t[p] > 0)) return;
        var ref = refFor(py, p); if (!ref.row) return;
        var per = (t[p] / div) / 10000 / py; // 평당 만원
        var lo = ref.row[0], hi = ref.row[2];
        if (p === '기타') return;
        if (per < lo * 0.6) {
          F.push({ kind: '금액 낮음', proc: p, level: '중간', per: per, ref: ref,
            title: p + ' 금액이 보통보다 많이 낮습니다',
            detail: '평당 ' + per.toFixed(1) + '만 (우리 견적 ' + ref.band + ' 보통 범위 ' + lo + '~' + hi + '만). 범위나 수량이 빠졌을 가능성.',
            customer: p + ' 금액이 같은 평형 보통 공사보다 꽤 낮게 적혀 있습니다. 어떤 작업까지 들어 있는지(범위·수량) 업체에 확인해 보세요.',
            later: true });
        } else if (per > hi * 1.3) {
          F.push({ kind: '금액 높음', proc: p, level: '낮음', per: per, ref: ref,
            title: p + ' 금액이 보통보다 높습니다',
            detail: '평당 ' + per.toFixed(1) + '만 (우리 견적 ' + ref.band + ' 보통 범위 ' + lo + '~' + hi + '만). 범위가 넓거나 자재가 좋은 것일 수 있음.',
            customer: p + ' 금액이 보통보다 높은 편입니다. 작업 범위가 넓거나 더 좋은 자재·방법이 들어간 것일 수 있으니 내용을 확인해 보세요.',
            later: false });
        }
      });
    }

    // 3) 수량 점검
    if (py) {
      lines.forEach(function (l) {
        var s = txt(l), qn = Number(l.수량), u = String(l.단위 || '');
        if (!(qn > 0)) return;
        if (/평|PY|py/.test(u)) {
          var need = null, what = null;
          if (/걸레받이|몰딩/.test(s)) { need = py; what = '몰딩·걸레받이'; }
          else if (/입주청소|청소/.test(s)) { need = py; what = '입주 청소'; }
          else if (/도배|벽지/.test(s) && !/천장|천정/.test(s)) { need = py; what = '도배'; }
          else if (/마루|장판|바닥/.test(s) && !/철거/.test(s)) { need = py * 0.6; what = '바닥재'; }
          if (need && qn < need * 0.7) {
            F.push({ kind: '수량 적음', proc: l.공정 || classify(s), level: '중간',
              title: what + ' 수량이 평형보다 적습니다 (' + qn + u + ')',
              detail: '평형 ' + py + '평인데 ' + what + ' 수량이 ' + qn + u + '입니다. 일부 방만 하는지, 나중에 늘어날지 확인.',
              customer: what + ' 수량이 ' + qn + u + '로 적혀 있습니다(집 ' + py + '평). 일부 공간만 하는 것인지 확인해 보세요. 나중에 수량이 늘면 금액도 늘어납니다.',
              later: true });
          }
        }
        var nm = clean(l.품명 || l.원문공정);
        if (/식|SET|set/.test(u) && qn === 1 && (Number(l.금액) || 0) >= 1500000 && !clean(l.규격).trim()) {
          F.push({ kind: '수량 불명확', proc: l.공정 || classify(s), level: '낮음',
            title: '‘한 묶음(1식·1세트)’ 큰 금액: ' + nm + ' ' + fmtMan(l.금액),
            detail: nm + ' ' + fmtMan(l.금액) + '이 한 묶음으로만 적혀 있고 제품·사양이 없음.',
            customer: '‘' + nm + '’이(가) 제품·사양 없이 한 묶음 ' + fmtMan(l.금액) + '으로 적혀 있습니다. 어떤 제품·구성인지 세부 내용을 받아 보세요.',
            later: true });
        }
      });
      // 욕실 개수
      var bathSets = lines.filter(function (l) { return /욕실|화장실/.test(txt(l)) && /세트|SET|set|식/.test(String(l.단위 || '')) && !/철거/.test(txt(l)); }).length;
      var bathSecs = (q.공정합계 || []).filter(function (s) { return /욕실|화장실/.test(s.원문공정) && Number(s.금액) > 0; }).length;
      var baths = Math.max(bathSecs, bathSets ? 1 : 0);
      if (py >= 30 && bathSecs === 1) {
        F.push({ kind: '수량 적음', proc: '욕실', level: '중간',
          title: '욕실이 1곳만 들어 있습니다',
          detail: py + '평은 보통 욕실이 2곳인데 견적에는 1곳만 있음.',
          customer: '견적에 욕실 공사가 1곳만 보입니다. 나머지 욕실은 그대로 쓰시는지 확인해 보세요.',
          later: true });
      }
    }

    // 4) 자재 등급
    Object.keys(GRADE).forEach(function (p) {
      var procLines = lines.filter(function (l) { var c = l.공정 || classify(txt(l)); return c === p || (p === '욕실' && /욕실|화장실/.test(txt(l))); });
      if (!procLines.length && !(t[p] > 0)) return;
      var found = [];
      procLines.forEach(function (l) {
        var s = txt(l);
        GRADE[p].forEach(function (g) { if (s.indexOf(g[0]) >= 0 && found.every(function (f) { return f[2] !== g[2]; })) found.push(g); });
      });
      if (found.some(function (g) { return g[0] === '광폭합지' || g[0] === '소폭합지'; })) found = found.filter(function (g) { return g[0] !== '합지'; });
      var low = found.filter(function (g) { return g[1] === '하'; });
      if (found.some(function (g) { return g[1] === '상'; }) || (p !== '욕실' && found.some(function (g) { return g[1] === '중'; }))) low = [];
      if (low.length) {
        F.push({ kind: '자재 등급', proc: p, level: '중간',
          title: p + ': 낮은 등급 자재가 보입니다 (' + low.map(function (g) { return g[2]; }).join(', ') + ')',
          detail: '같은 공정이라도 자재 등급이 다르면 금액 차이가 납니다. 비교할 때 같은 등급으로 맞춰 봐야 함.',
          customer: p + '에 ' + low.map(function (g) { return g[2]; }).join(', ') + '이(가) 적혀 있습니다. 다른 견적과 비교하실 때는 같은 자재 등급끼리 비교해야 정확합니다.',
          later: false, grade: found });
      } else if ((t[p] > 0) && procLines.length && !found.length && !procLines.some(function (l) { return (l.규격 || '').trim().length > 1; })) {
        F.push({ kind: '자재 미기재', proc: p, level: '낮음',
          title: p + ': 자재 이름·등급이 적혀 있지 않습니다',
          detail: '제품명·규격이 없어서 어떤 자재인지 알 수 없음. 시공 때 낮은 등급이 들어올 수 있음.',
          customer: p + '에 어떤 자재(제품명·두께·등급)를 쓰는지 적혀 있지 않습니다. 자재 이름을 받아 두시면 나중에 다툼이 없습니다.',
          later: false });
      } else if (found.length) {
        F.push({ kind: '자재 확인', proc: p, level: '정보',
          title: p + ': ' + found.map(function (g) { return g[2]; }).join(', '),
          detail: '자재 등급 ' + found.map(function (g) { return g[1]; }).join('/') + '.', customer: null, later: false, grade: found, info: true });
      }
    });

    // 5) 나중에 추가되기 쉬운 항목 (점검표)
    LATER.forEach(function (it) {
      var procAmt = t[it[2]] || 0;
      if (it[2] !== '기타' && !(procAmt > 0)) return; // 공정 자체가 없으면 '빠진 공정'에서 이미 다룸
      if (it[0] === '욕실 방수' && !(t.욕실 > 0)) return;
      if (it[0] === '부가세') return; // 아래 '부가세' 점검에서 따로 다룸
      if (has(allText, it[1])) return;
      F.push({ kind: '추가 가능', proc: it[2], level: (it[0] === '욕실 방수' || it[0] === '폐기물 처리비' || it[0] === '부가세') ? '높음' : '중간',
        title: it[0] + '이(가) 견적에 안 보입니다', detail: it[3], customer: it[0] + ': ' + it[3], later: true });
    });

    // 6) 별도·제외·추후·고객 부담 문구 — 낱말마다 한 건으로 묶음
    var bag = {};
    lines.concat((q.별도문구 || []).map(function (x) { return { 메모: x }; }), (q.특이사항 || []).map(function (x) { return { 메모: x }; })).forEach(function (l) {
      var raw = [l.원문공정, l.품명, l.규격, l.메모].join(' ');
      if (/표시 없음|제외함|판독|잘림|잘려|읽기|안 보임|흐림|null|VAT|부가세/.test(raw)) return;
      var s2 = clean([l.원문공정 && l.품명 ? '' : l.원문공정, l.품명, l.규격, l.품명 || l.규격 ? '' : l.메모].filter(Boolean).join(' '));
      VAGUE.forEach(function (v) {
        if (s2.indexOf(v[0]) < 0) return;
        var k = v[1]; bag[k] = bag[k] || { v: v, items: [] };
        var one = s2.replace(/\s+/g, ' '), short = one.length > 40 ? one.slice(0, 40).replace(/\s+\S*$/, '') + '…' : one;
        if (bag[k].items.every(function (x) { return x.slice(0, 18) !== short.slice(0, 18); })) bag[k].items.push(short);
      });
    });
    Object.keys(bag).forEach(function (k) {
      var b = bag[k], ex = b.items.slice(0, 3).map(function (x) { return '“' + x + '”'; }).join(', ');
      F.push({ kind: '별도 문구', proc: null, level: '중간',
        title: '‘' + b.v[0] + '’ 항목 ' + b.items.length + '건', detail: b.v[1] + ' 예: ' + ex,
        customer: '견적서에 ' + ex + (b.items.length > 3 ? ' 등 ' + b.items.length + '건' : '') + '이 있습니다. ' + b.v[1] + ' 금액을 미리 받아 두세요.', later: true });
    });

    // VAT
    if (vat === '모름') {
      F.push({ kind: '부가세', proc: '기타', level: '높음', title: '부가세 포함인지 알 수 없습니다',
        detail: '총액 비교 전에 부가세 포함·별도를 꼭 확인.', customer: '총액에 부가세(10%)가 들어 있는지 적혀 있지 않습니다. 포함인지 별도인지 업체에 꼭 확인해 보세요.', later: true });
    }

    F.forEach(function (f) { f.say = josa(sayFor(f, py)); f.title = josa(f.title); if (f.customer) f.customer = josa(f.customer); f.detail = josa(f.detail); });
    F.sort(function (a, b) { return (b.info ? 0 : sev(b.level)) - (a.info ? 0 : sev(a.level)); });

    var sum = PROCS.reduce(function (a, p) { return a + t[p]; }, 0);
    return {
      version: VERSION, base: BASE_NAME, 평형: py, band: bandOf(py), vat: vat,
      totals: t, 직접공사비합: sum, 총액: Number(q.총액) || null,
      findings: F,
      counts: { 빠진공정: F.filter(function (f) { return f.kind === '빠진 공정'; }).length,
                추가가능: F.filter(function (f) { return f.later; }).length,
                자재: F.filter(function (f) { return /자재/.test(f.kind) && !f.info; }).length,
                수량: F.filter(function (f) { return /수량|금액 낮음/.test(f.kind); }).length }
    };
  }

  // 직원 화면: "형, 이렇게 설명하세요" 추천 문장
  function sayFor(f, py) {
    var p = f.proc || '';
    switch (f.kind) {
      case '빠진 공정':
        return '고객님, 받으신 견적에는 ' + p + ' 공정이 빠져 있어요. 보통 ' + (py ? py + '평 ' : '') + '전체 공사에는 거의 다 들어가는 공정이라, 그대로 계약하시면 공사 중에 따로 추가될 가능성이 커요. 저희 견적에는 ' + p + '까지 다 넣어 두었으니, 총액만 보지 마시고 이 부분이 들어 있는지 같이 비교해 보시면 좋겠습니다.';
      case '금액 낮음':
        return '고객님, ' + p + ' 금액이 같은 평형 보통 공사보다 꽤 낮게 잡혀 있어요. 싸게 해 주는 것일 수도 있지만, 대개는 작업 범위나 수량이 빠져 있는 경우가 많아요. 어떤 작업까지 들어 있는지 업체에 한 번 물어보시고, 저희 견적의 ' + p + ' 항목과 하나씩 비교해 보시면 차이가 바로 보이실 거예요.';
      case '금액 높음':
        return '고객님, ' + p + ' 금액은 그 업체가 조금 높게 잡았어요. 범위가 넓거나 좋은 자재를 넣은 것일 수 있으니, 어떤 내용인지 보시고 저희 견적과 같은 조건으로 맞춰 비교해 드릴게요.';
      case '수량 적음':
        return '고객님, ' + f.title.replace(/입니다|습니다/, '') + '. 일부 공간만 하는 것으로 잡혀 있을 수 있어요. 현장에서 수량이 늘어나면 그만큼 금액도 늘어나니, 저희처럼 집 전체 기준으로 맞춘 견적인지 확인해 보세요.';
      case '수량 불명확':
        return '고객님, 이 항목은 ‘1식’으로만 적혀 있어서 무엇이 들었는지 알 수가 없어요. 나중에 “그건 안 들어 있었다”는 말이 나오지 않게, 세부 항목을 꼭 받아 두세요. 저희는 항목별로 수량과 단가를 다 적어 드려요.';
      case '자재 등급':
        return '고객님, ' + p + '에 들어간 자재가 ' + (f.grade || []).filter(function (g) { return g[1] === '하'; }).map(function (g) { return g[2]; }).join(', ') + '예요. 금액이 낮아 보이는 이유가 자재 차이일 수 있어요. 같은 자재로 맞추면 금액이 어떻게 되는지 저희가 바로 비교해 드릴게요.';
      case '자재 미기재':
        return '고객님, ' + p + '은(는) 어떤 자재를 쓰는지 이름이 안 적혀 있어요. 같은 이름의 공사라도 자재에 따라 품질과 금액이 많이 달라서, 제품명과 등급을 꼭 받아 두시는 게 안전합니다.';
      case '추가 가능':
        return '고객님, ' + f.title.replace('이(가) 견적에 안 보입니다', '') + '이(가) 견적에 안 보여요. ' + f.detail + ' 저희 견적에는 이 부분까지 넣어 두었습니다.';
      case '별도 문구':
        return '고객님, 견적서에 ‘별도·제외·추후’ 같은 말이 있는 항목은 지금 총액에 안 들어 있어요. 그 금액까지 더해야 실제로 내시는 돈이 돼요. 미리 금액을 받아 두시면 비교가 정확해집니다.';
      case '부가세':
        return '고객님, 이 견적은 부가세 포함인지 별도인지가 안 적혀 있어요. 별도라면 실제로는 10%가 더 붙어요. 꼭 확인하시고, 같은 기준으로 맞춰서 비교해 드릴게요.';
      case '자재 확인':
        return '고객님, ' + p + ' 자재는 ' + (f.grade || []).map(function (g) { return g[2]; }).join(', ') + '로 적혀 있어요. 저희 견적과 같은 등급인지 같이 보시면 됩니다.';
    }
    return '';
  }

  // ---------- reviewer: 원가·마진이 한 글자라도 있으면 반려 ----------
  var BANNED = ['원가', '마진', '실행', '이익', '이윤', '매입가', '매입 단가', '매입비', '남는', '수익률', '마크업', '할증', '사후 원가', '원가율', '공급단가', '업체 정산', '물대', '하도급', '하청', 'cost', 'margin', 'markup', 'profit'];
  function review(text, extra) {
    var s = String(text || '').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '), hits = [];
    BANNED.forEach(function (w) { var i = s.toLowerCase().indexOf(w.toLowerCase()); if (i >= 0) hits.push({ word: w, at: s.slice(Math.max(0, i - 15), i + w.length + 15) }); });
    (extra || []).forEach(function (w) { var i = s.indexOf(w); if (i >= 0) hits.push({ word: w, at: s.slice(Math.max(0, i - 15), i + w.length + 15) }); });
    return { pass: hits.length === 0, hits: hits };
  }

  // ---------- 읽기 담당에게 주는 지시문 (화면과 시험에서 똑같이 씀) ----------
  var READ_PROMPT = [
    '당신은 인테리어 견적서 읽기 담당입니다. 첨부한 사진/PDF 쪽은 고객이 받은 다른 업체 견적서입니다.',
    '보이는 그대로만 옮기세요. 없는 값은 null. 숫자를 지어내거나 계산해서 바꾸지 마세요. 금액은 원 단위 정수.',
    '각 줄을 우리 10공정(철거·목공·전기·설비·타일·욕실·도배·필름·바닥·주방) 또는 창호·기타 중 하나로 정하세요.',
    '분류 기준: 배선·콘센트·스위치·조명·차단기=전기 / 확장·난방·보일러·배관·에어컨·현관 단올림=설비 / 욕실 타일·방수·도기·젠다이=욕실 / 현관·주방벽·발코니 타일=타일 / 몰딩·걸레받이·도어·문틀·중문·천장=목공 / 필름·페인트=필름 / 마루·장판=바닥 / 주방가구·붙박이장·신발장=주방 / 샷시=창호 / 입주청소=기타. 보양·폐기물은 철거.',
    '수량이 0이거나 금액이 0인 빈 줄(‘공정없음’ 등)은 빼세요. 고객 이름·전화번호·주소의 동호수는 절대 옮기지 마세요.',
    '오직 아래 모양의 JSON 하나로만 답하세요:',
    '{"평형": number|null, "총액": number|null, "vat": "포함"|"별도"|"모름",',
    ' "공정합계": [{"원문공정": string, "공정": string, "금액": number}],',
    ' "lines": [{"원문공정": string, "공정": string, "품명": string, "규격": string|null, "수량": number|null, "단위": string|null, "금액": number|null, "메모": string|null}],',
    ' "별도문구": [string], "특이사항": [string], "읽기메모": string}',
    '공정합계는 견적서 첫 장(갑지)의 공정별 합계를 그대로. lines는 공정별 세부 쪽의 줄.',
    '메모와 별도문구에는 견적서에 적힌 글자만 그대로 옮기세요. 읽기에 관한 설명(잘림·흐림 등)은 읽기메모에만 쓰세요.'
  ].join('\n');

  var api = { VERSION: VERSION, BASE_NAME: BASE_NAME, PROCS: PROCS, CORE10: CORE10, BAND: BAND, bandOf: bandOf, refFor: refFor,
    classify: classify, totals: totals, compare: compare, review: review, READ_PROMPT: READ_PROMPT, fmtMan: fmtMan, man: man, BANNED: BANNED };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.QC = api;
})(typeof window !== 'undefined' ? window : this);
