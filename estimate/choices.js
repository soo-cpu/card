/* 아르띠꼬 간편 견적 — 고객이 고르는 선택지와, 각 선택이 어떤 단가표 항목으로 바뀌는지.
   여기에는 금액이 없습니다. 금액은
   - 고객 화면: rates.js (선택지별 묶음 금액만)
   - 승인 화면: prices.enc.js (항목별 단가, 직원 비밀번호로만 열림)
   수량 규칙: "py"=공급 평형, "bath"=욕실 수, "doors"=방 수+욕실 수, "hpy"=평형의 절반, 숫자=고정 수량 */
var EST = (function () {
  // 방 수는 평형으로 어림합니다 (20평 이하 2개, 35평 이하 3개, 그 위 4개)
  function rooms(py) { return py <= 20 ? 2 : py <= 35 ? 3 : 4; }

  var GROUPS = [
    { id: "floor", name: "바닥", hint: "기존 마루 철거와 걸레받이가 같이 들어가요", opts: [
      { id: "keep", name: "그대로 둘게요", items: [] },
      { id: "jp", name: "장판", sub: "2.2~2.5T", items: [["dm_jangpan", "py"], ["fl_jp25", "py"], ["wd_base", "py"]] },
      { id: "maru", name: "강마루", sub: "가장 많이 하세요", items: [["dm_maru", "py"], ["fl_maru", "py"], ["wd_base", "py"]] },
      { id: "obj", name: "광폭·오브제 강마루", sub: "넓은 판, 600각 등", items: [["dm_maru", "py"], ["fl_obj", "py"], ["wd_base", "py"]] },
      { id: "tile", name: "포세린 타일", sub: "호텔·갤러리 느낌", items: [["dm_maru", "py"], ["fl_tile", "py"], ["wd_base", "py"]] }
    ]},
    { id: "wall", name: "벽·천장", hint: "몰딩 철거와 천장 몰딩이 같이 들어가요", opts: [
      { id: "keep", name: "그대로 둘게요", items: [] },
      { id: "hapji", name: "합지 도배", sub: "기본 종이 벽지", items: [["dm_mold", "py"], ["wd_ceil", "py"], ["wp_hapji", "py"]] },
      { id: "silk", name: "실크 도배", sub: "가장 많이 하세요", items: [["dm_mold", "py"], ["wd_ceil", "py"], ["wp_silk", "py"]] },
      { id: "paint", name: "벽 도장", sub: "벽지 대신 페인트", items: [["dm_mold", "py"], ["wd_ceil", "py"], ["wp_paintwall", "py"]] }
    ]},
    { id: "bath", name: "욕실", hint: "욕실 수만큼 계산돼요", opts: [
      { id: "keep", name: "그대로 둘게요", items: [] },
      { id: "over", name: "덧방", sub: "기존 타일 위에 새 타일", items: [["ba_dm_fix", "bath"], ["ba_tile_over", "bath"], ["ba_fix_std", "bath"]] },
      { id: "full", name: "전체 새로", sub: "철거 · 방수 · 타일 · 도기", items: [["ba_dm_full", "bath"], ["ba_wp12", "bath"], ["ba_tile_new", "bath"], ["ba_fix_std", "bath"]] },
      { id: "premium", name: "전체 새로 (고급)", sub: "대형 타일 · 고급 도기", items: [["ba_dm_full", "bath"], ["ba_wp12", "bath"], ["ba_tile_new", "bath"], ["ba_tile_big", "bath"], ["ba_fix_hi", "bath"]] }
    ]},
    { id: "kitchen", name: "주방", opts: [
      { id: "keep", name: "그대로 둘게요", items: [] },
      { id: "film", name: "문짝 필름 리폼", sub: "가구는 두고 색만", items: [["fm_kitchen", 1]] },
      { id: "new", name: "새 주방", sub: "제작 가구 · 상판 · 벽 타일", items: [["dm_kitchen", 1], ["dm_ktile", 3], ["fn_low", 3.5], ["fn_up", 3], ["fn_top", 3.5], ["fn_fridge", 1], ["fn_sink", 1], ["fn_faucet", 1], ["fn_hood", 1], ["tl_kit", 1], ["el_ind", 1]] },
      { id: "island", name: "새 주방 + 아일랜드", sub: "아일랜드 식탁 추가", items: [["dm_kitchen", 1], ["dm_ktile", 3], ["fn_low", 3.5], ["fn_up", 3], ["fn_top", 3.5], ["fn_fridge", 1], ["fn_sink", 1], ["fn_faucet", 1], ["fn_hood", 1], ["fn_island", 1.7], ["tl_kit", 1], ["el_ind", 1]] }
    ]},
    { id: "door", name: "방문", hint: "방 수와 욕실 수로 개수를 어림해요", opts: [
      { id: "keep", name: "그대로 둘게요", items: [] },
      { id: "film", name: "필름", sub: "문은 두고 색만", items: [["fm_door", "doors"]] },
      { id: "new", name: "새 문으로 교체", sub: "문틀 · 문짝 세트", items: [["dm_door", "doors"], ["dr_door", "doors"]] }
    ]},
    { id: "jm", name: "현관 중문", opts: [
      { id: "keep", name: "없음 · 그대로", items: [] },
      { id: "swing", name: "스윙 중문", sub: "강화유리", items: [["dr_jm", 1]] },
      { id: "slide", name: "3연동 슬라이딩", items: [["dr_jm3", 1]] }
    ]},
    { id: "light", name: "조명·전기", opts: [
      { id: "keep", name: "그대로 둘게요", items: [] },
      { id: "basic", name: "등·스위치 교체", sub: "방등 · 거실등 · 콘센트", items: [["el_set", "py"], ["el_fix", 7], ["el_sensor", 2], ["el_sw", 1], ["el_fire", 1]] },
      { id: "full", name: "매입등 + 간접조명", sub: "배선 새로 · 등박스", items: [["el_wire", "py"], ["el_set", "py"], ["el_fix", 7], ["el_sensor", 2], ["el_down", 25], ["el_t5", 8], ["el_sw", 1], ["el_fire", 1], ["wd_lightbox", 1]] }
    ]},
    { id: "entr", name: "현관", opts: [
      { id: "keep", name: "그대로 둘게요", items: [] },
      { id: "new", name: "새로 꾸미기", sub: "바닥 타일 · 신발장 · 도어락", items: [["dm_entr", 1], ["tl_entr", 1], ["fn_entr", 1], ["fm_entr", 1], ["et_video", 1], ["et_lock", 1], ["et_acc", 1]] }
    ]},
    { id: "balc", name: "발코니", opts: [
      { id: "keep", name: "그대로 둘게요", items: [] },
      { id: "new", name: "타일 + 탄성코트", items: [["tl_balc", 2], ["pt_balc", 1]] }
    ]},
    { id: "closet", name: "붙박이장", opts: [
      { id: "keep", name: "필요 없어요", items: [] },
      { id: "new", name: "안방 붙박이장", sub: "10자 기준", items: [["fn_closet", 10]] }
    ]},
    { id: "sash", name: "샷시", hint: "창 크기·개수에 따라 차이가 커서 실측 후 따로 안내해요", sep: true, opts: [
      { id: "keep", name: "그대로 둘게요", items: [] },
      { id: "new", name: "교체 희망", sub: "금액 별도 안내", items: [["dm_sash", 1], ["wn_sash", "py"], ["wn_lift", 1]] }
    ]},
    { id: "ac", name: "시스템에어컨", hint: "기계 모델에 따라 달라 실측 후 따로 안내해요", sep: true, opts: [
      { id: "keep", name: "필요 없어요", items: [] },
      { id: "2", name: "2대", sub: "금액 별도 안내", items: [["hv_ac", 2], ["wd_aircon", 2]] },
      { id: "3", name: "3대", sub: "금액 별도 안내", items: [["hv_ac", 3], ["wd_aircon", 3]] },
      { id: "4", name: "4대", sub: "금액 별도 안내", items: [["hv_ac", 4], ["wd_aircon", 4]] }
    ]}
  ];

  // 전체 리모델링을 고르면 처음에 들어가는 선택
  var FULL_DEFAULT = { floor: "maru", wall: "silk", bath: "full", kitchen: "new", door: "new", jm: "swing", light: "full", entr: "new", balc: "new", closet: "new", sash: "keep", ac: "keep" };

  // 공통 공사 묶음 (고객이 고르지 않고 자동으로 들어감)
  var COMMON = {
    c_full: { name: "공통 공사 (디자인·보양·철거 정리·폐기물·청소·감리)", items: [["design", "py"], ["adm_agree", 1], ["adm_protect", 1], ["adm_floor", "py"], ["dm_cabinet", 3], ["dm_misc", 1], ["dm_finish", 1], ["dm_waste", "py"], ["dm_lift", 3], ["tl_sub", 1], ["et_silicone", "py"], ["et_clean", "py"], ["et_manage", 30]] },
    c_part: { name: "공통 공사 (동의서·공용부 보양·자재 운반)", items: [["adm_agree", 1], ["adm_protect", 1], ["dm_lift", 1]] },
    c_part_live: { name: "가구·바닥 보양 (거주 중)", items: [["adm_floor2", "py"]] },
    c_part_empty: { name: "바닥 보양", items: [["adm_floor", "py"]] },
    c_part_waste: { name: "폐기물 처리", items: [["dm_waste", "hpy"]] }
  };

  function qty(rule, st) {
    if (rule === "py") return st.py;
    if (rule === "hpy") return Math.round(st.py / 2);
    if (rule === "bath") return st.bath;
    if (rule === "doors") return rooms(st.py) + st.bath;
    return Number(rule) || 0;
  }

  // st: {scope:"full"|"part", py, bath, live:true/false, sel:{groupId: optId}}
  // 결과: [{bundle, name, items:[[key, rule]], sep}]
  function bundles(st) {
    var out = [], picked = 0, nonBath = 0;
    GROUPS.forEach(function (g) {
      var oid = st.sel[g.id] || "keep";
      if (oid === "keep") return;
      var o = g.opts.filter(function (x) { return x.id === oid; })[0];
      if (!o) return;
      out.push({ bundle: g.id + ":" + o.id, name: g.name + " · " + o.name, items: o.items, sep: !!g.sep, group: g.id });
      if (!g.sep) { picked++; if (g.id !== "bath") nonBath++; }
    });
    if (!picked && !out.length) return out;
    if (st.scope === "full") {
      out.unshift({ bundle: "c_full", name: COMMON.c_full.name, items: COMMON.c_full.items });
    } else {
      out.unshift({ bundle: "c_part", name: COMMON.c_part.name, items: COMMON.c_part.items });
      if (nonBath) {
        var p = st.live ? "c_part_live" : "c_part_empty";
        out.splice(1, 0, { bundle: p, name: COMMON[p].name, items: COMMON[p].items });
        out.splice(2, 0, { bundle: "c_part_waste", name: COMMON.c_part_waste.name, items: COMMON.c_part_waste.items });
      }
    }
    return out;
  }

  // 고객 화면 금액: 묶음별 계수(rates.js)로 계산. 계수 = 고정 f + 평당 p + 욕실당 b + 문당 d + 반평당 h
  function bundleAmount(rate, st) {
    if (!rate) return 0;
    return (rate.f || 0) + (rate.p || 0) * st.py + (rate.b || 0) * st.bath + (rate.d || 0) * (rooms(st.py) + st.bath) + (rate.h || 0) * Math.round(st.py / 2);
  }

  // 회사 기준: 부분 공사는 부가세 포함 1,650만원 이상부터
  var MIN_PART = 16500000;

  // 접수 코드 (고객 → 승인 화면). 개인정보가 들어가므로 주소 # 뒤(서버로 안 가는 부분)에만 씁니다.
  function encodeReq(o) {
    var s = unescape(encodeURIComponent(JSON.stringify(o)));
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function decodeReq(s) {
    s = String(s || "").trim().replace(/^.*[#&]r=/, "").replace(/[\s&].*$/, "").replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return JSON.parse(decodeURIComponent(escape(atob(s))));
  }

  return { GROUPS: GROUPS, FULL_DEFAULT: FULL_DEFAULT, COMMON: COMMON, rooms: rooms, qty: qty, bundles: bundles, bundleAmount: bundleAmount, MIN_PART: MIN_PART, encodeReq: encodeReq, decodeReq: decodeReq };
})();
