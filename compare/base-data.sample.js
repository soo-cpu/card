/* 공개용 형식 예시. 실제 값은 base-data.js(비공개)에 있음. 숫자는 모두 null = 자료 필요. */
(function (root) {
  var P = ['철거','목공','전기','설비','타일','욕실','도배','필름','바닥','주방','창호','기타','합계'];
  function blank(n) { var d = {}; P.forEach(function (p) { d[p] = null; }); return { n: n, d: d }; }
  // 각 칸 형식: [하위25%, 중앙값, 상위25%, 건수] (평당 만원, VAT 별도, 직접공사비)
  var BAND = { '전체': blank(0), '20평 미만': blank(0), '20평대': blank(0), '30평대': blank(0), '40평대': blank(0), '50평 이상': blank(0) };
  BAND['전체'].n = 1;
  if (typeof module !== 'undefined' && module.exports) module.exports = BAND; else root.QC_BASE = BAND;
})(typeof window !== 'undefined' ? window : this);
