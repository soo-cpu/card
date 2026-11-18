/**
 * 답장 초안 봇 · 시험판 v0 (2026-11-18)
 * 주식회사 홈퍼니싱 · 아르띠꼬 스튜디오
 *
 * 하는 일: 받은편지함의 새 메일 중 정해진 유형(견적 문의·자료 요청·일정 확인)을 골라
 *          답장 "초안"을 Gmail 임시보관함에 만든다.
 * 절대 안 하는 일: 메일 보내기·전달·삭제. 이 파일에는 보내는 코드가 없다(테스트로 확인).
 *
 * 설치: soo@artico-studio.com 계정으로 script.google.com → 새 프로젝트 → 이 파일 내용 붙여넣기
 *       → 함수 `testRunOnce` 실행(권한 허용) → 결과 확인 → `installTrigger` 실행(10분마다 자동)
 * 끄기: `removeTrigger` 실행
 *
 * 처음에는 DRY_RUN = true (초안을 만들지 않고 라벨·기록만). 문구 승인 후 false + APPROVED 켜기.
 */

// ───────────────────────── 설정 ─────────────────────────
var CONFIG = {
  DRY_RUN: true,                // true: 분류만 하고 초안은 만들지 않음 (시험 단계)
  APPROVED: {                   // 형 승인된 문구만 true. false인 유형은 초안을 만들지 않음
    T01: false, T02: false, T03: false, T04: false, T05: false,
    T06: false, T07: false, T08: false, T09: false, T10: false
  },
  SEARCH: 'in:inbox newer_than:2d -category:promotions -category:social -label:자동답장',
  MAX_PER_RUN: 10,              // 한 번에 최대 처리 메일 수 (폭주 방지)
  MY_ADDRESSES: [               // 내 주소: 이 주소가 보낸 메일은 건너뜀
    'soo@artico-studio.com', 'soo17115@gmail.com', 'soo17115@naver.com', 'woo17115@hanmail.net'
  ],
  SKIP_SENDER_PATTERNS: [       // 자동 발송 메일 건너뜀
    'no-?reply', 'noreply', 'donotreply', 'mailer-daemon', 'postmaster', 'notification', 'newsletter',
    '@google\\.com$', '@github\\.com$', '@stripe\\.com$', 'saramin\\.co\\.kr$'
  ],
  SKIP_SUBJECT_PATTERNS: [      // 우리 시스템이 보내는 알림 등
    '^\\[간편견적', '^\\[사람인\\]', '광고', '\\(광고\\)', '수신거부', 'unsubscribe'
  ],
  LABEL_ROOT: '자동답장',
  SIGNATURE:
    '주식회사 홈퍼니싱 · 아르띠꼬 스튜디오\n' +
    '대표번호 1566-5904 | 전화 031-513-9560 | 팩스 031-513-9561\n' +
    '홈페이지 https://soo-cpu.github.io/card/site/'
};

var LINKS = {
  ESTIMATE: 'https://soo-cpu.github.io/card/estimate/',
  WORKS: 'https://soo-cpu.github.io/card/site/works/',
  PROFILE: 'https://soo-cpu.github.io/card/site/files/company-profile.pdf'
};

// ───────────────────── 유형 분류 규칙 ─────────────────────
// all: 묶음마다 하나 이상 들어 있어야 함. 위에서부터 먼저 맞는 유형 1개를 고름.
var REQUEST_WORDS = ['요청', '부탁', '보내 주', '보내주', '송부', '제출', '받을 수', '주실 수', '가능할까', '있을까'];
var RULES = [
  { id: 'T10', name: '일정 변경·취소', all: [['일정', '약속', '방문', '미팅', '실측', '상담', '시공'], ['변경', '취소', '연기', '미루', '바꿀', '바꾸', '다른 날', '못 갈', '어렵']] },
  { id: 'T04', name: '견적서 진행 문의', all: [['견적서', '견적'], ['언제', '아직', '진행 상황', '받을 수', '회신', '기다리', '받지 못', '못 받']] },
  { id: 'T07', name: '서류 요청', all: [['사업자등록증', '사업자 등록증', '면허', '통장사본', '통장 사본', '건설업 등록', '신용평가', '납세증명', '실적증명'], REQUEST_WORDS] },
  { id: 'T05', name: '회사소개서 요청', all: [['회사소개서', '회사 소개서', '지명원', '회사 소개 자료', '브로슈어', '카탈로그', '소개 자료'], REQUEST_WORDS] },
  { id: 'T06', name: '시공 사례 요청', all: [['시공 사례', '시공사례', '포트폴리오', '시공 사진', '시공사진', '레퍼런스', '작업 사례'], REQUEST_WORDS] },
  { id: 'T03', name: '견적 문의(상가·사무실)', all: [['견적', '비용', '금액', '얼마'], ['상가', '사무실', '매장', '병원', '학원', '카페', '식당', '점포', '오피스', '기관', '학교', '관공서']] },
  { id: 'T02', name: '견적 문의(부분 공사)', all: [['견적', '비용', '금액', '얼마'], ['욕실', '화장실', '주방', '싱크대', '도배', '바닥', '마루', '장판', '타일', '샷시', '창호', '부분', '중문', '붙박이']] },
  { id: 'T01', name: '견적 문의(전체 리모델링)', all: [['견적', '비용', '금액', '얼마', '상담 신청', '상담 문의'], ['리모델링', '인테리어', '전체', '아파트', '평', '입주', '이사']] },
  { id: 'T09', name: '공사 일정 문의', all: [['공사', '착공', '완공', '준공', '공정', '시공'], ['일정', '언제', '기간', '며칠', '끝나', '시작', '스케줄']] },
  { id: 'T08', name: '실측·방문 일정 확인', all: [['실측', '방문', '미팅', '상담', '현장'], ['일정', '시간', '날짜', '몇 시', '가능', '확인', '오시', '언제']] }
];

// ───────────────────── 답장 문구 (승인 대기) ─────────────────────
// '답장 자동화 설계 2026-11-18 v0.md' 3장과 글자 하나까지 같아야 함 (test/run-tests.js가 비교)
// {고객} 자리는 보낸 사람 이름 + '님'(없으면 '고객님')으로 바뀜. ⟦ ⟧ 는 형이 채울 칸.
var TEMPLATES = {
  T01:
'안녕하세요, {고객}. 주식회사 홈퍼니싱(아르띠꼬 스튜디오)입니다.\n' +
'인테리어 견적 문의 주셔서 감사합니다.\n' +
'\n' +
'정확한 견적을 위해 아래 내용을 회신으로 알려 주시면 더 빠르게 안내드리겠습니다.\n' +
'1. 주소(단지명·동)\n' +
'2. 평수와 욕실 개수\n' +
'3. 원하시는 공사 범위(전체 리모델링 / 일부 공간)\n' +
'4. 희망 공사 시기 또는 입주 예정일\n' +
'5. 현재 집 사진이나 평면도(있으시면)\n' +
'\n' +
'대략적인 금액은 1분 간편 견적에서 먼저 확인하실 수 있습니다.\n' +
'https://soo-cpu.github.io/card/estimate/\n' +
'\n' +
'내용을 확인한 뒤 담당 실장이 연락드려 현장 실측 일정을 잡아 드리겠습니다.\n' +
'감사합니다.',

  T02:
'안녕하세요, {고객}. 주식회사 홈퍼니싱(아르띠꼬 스튜디오)입니다.\n' +
'부분 공사 견적 문의 감사합니다.\n' +
'\n' +
'공간과 자재에 따라 금액 차이가 커서, 아래 내용을 알려 주시면 맞춰서 안내드리겠습니다.\n' +
'1. 주소(단지명·동)와 평수\n' +
'2. 공사할 곳(예: 욕실 1곳, 주방, 도배·바닥 등)\n' +
'3. 해당 공간 사진 2~3장\n' +
'4. 희망 공사 시기\n' +
'\n' +
'확인 후 담당 실장이 연락드리겠습니다. 필요하면 현장을 직접 보고 정확한 견적을 드립니다.\n' +
'감사합니다.',

  T03:
'안녕하세요, {고객}. 주식회사 홈퍼니싱(아르띠꼬 스튜디오)입니다.\n' +
'상업 공간 인테리어 견적 문의 감사합니다.\n' +
'\n' +
'정확한 안내를 위해 아래 내용을 회신 부탁드립니다.\n' +
'1. 위치(주소)와 면적(평 또는 ㎡)\n' +
'2. 업종과 용도(사무실·매장·학원 등)\n' +
'3. 현재 상태(빈 공간 / 기존 인테리어 철거 필요)\n' +
'4. 희망 공사 기간과 오픈 예정일\n' +
'5. 도면이나 현장 사진(있으시면)\n' +
'\n' +
'회사 소개와 시공 사례도 함께 보내드립니다.\n' +
'회사소개서: https://soo-cpu.github.io/card/site/files/company-profile.pdf\n' +
'시공 사례: https://soo-cpu.github.io/card/site/works/\n' +
'\n' +
'내용을 확인한 뒤 담당자가 연락드려 현장 방문 일정을 잡아 드리겠습니다.\n' +
'감사합니다.',

  T04:
'안녕하세요, {고객}. 주식회사 홈퍼니싱(아르띠꼬 스튜디오)입니다.\n' +
'견적서를 기다리게 해 드려 죄송합니다.\n' +
'\n' +
'현재 실측 내용을 바탕으로 견적서를 정리하고 있으며, ⟦날짜⟧까지 메일로 보내드리겠습니다.\n' +
'그 전에 궁금하신 점이 있으면 대표번호 1566-5904로 편하게 연락 주세요.\n' +
'\n' +
'감사합니다.',

  T05:
'안녕하세요, {고객}. 주식회사 홈퍼니싱(아르띠꼬 스튜디오)입니다.\n' +
'요청하신 회사소개서(지명원)를 보내드립니다.\n' +
'\n' +
'회사소개서(PDF): https://soo-cpu.github.io/card/site/files/company-profile.pdf\n' +
'시공 사례: https://soo-cpu.github.io/card/site/works/\n' +
'\n' +
'추가로 필요한 자료가 있으면 회신 주세요.\n' +
'감사합니다.',

  T06:
'안녕하세요, {고객}. 주식회사 홈퍼니싱(아르띠꼬 스튜디오)입니다.\n' +
'시공 사례를 요청해 주셔서 감사합니다.\n' +
'\n' +
'아파트·상업 공간 시공 사례를 아래 페이지에 사진과 함께 모아 두었습니다.\n' +
'https://soo-cpu.github.io/card/site/works/\n' +
'\n' +
'비슷한 평수나 공간의 사례가 더 필요하시면 단지명이나 평수를 알려 주세요. 맞는 사례를 골라 보내드리겠습니다.\n' +
'감사합니다.',

  T07:
'안녕하세요, {고객}. 주식회사 홈퍼니싱입니다.\n' +
'요청하신 서류를 첨부해 보내드립니다.\n' +
'\n' +
'첨부: ⟦서류 이름⟧\n' +
'\n' +
'다른 서류가 더 필요하시면 회신 주세요.\n' +
'감사합니다.',

  T08:
'안녕하세요, {고객}. 주식회사 홈퍼니싱(아르띠꼬 스튜디오)입니다.\n' +
'일정 문의 주셔서 감사합니다.\n' +
'\n' +
'말씀하신 일정을 담당 실장 일정과 맞춰 본 뒤, 확정된 날짜와 시간을 다시 연락드리겠습니다.\n' +
'방문 전날에도 한 번 더 안내드립니다.\n' +
'\n' +
'감사합니다.',

  T09:
'안녕하세요, {고객}. 주식회사 홈퍼니싱(아르띠꼬 스튜디오)입니다.\n' +
'공사 일정 문의 감사합니다.\n' +
'\n' +
'현재 공정표 기준으로 담당 실장이 진행 상황과 남은 일정을 정리해 연락드리겠습니다.\n' +
'급하신 내용이면 대표번호 1566-5904로 전화 주세요.\n' +
'\n' +
'감사합니다.',

  T10:
'안녕하세요, {고객}. 주식회사 홈퍼니싱(아르띠꼬 스튜디오)입니다.\n' +
'일정 변경 요청 잘 받았습니다.\n' +
'\n' +
'가능한 날짜와 시간대를 2~3개 알려 주시면, 담당 실장 일정과 맞춰 새 일정을 확정해 연락드리겠습니다.\n' +
'\n' +
'감사합니다.'
};

// 형이 꼭 채우거나 확인해야 하는 유형 → '확인필요' 라벨
var NEEDS_FILL = { T04: true, T07: true };

// ───────────────────── 순수 함수 (테스트 가능) ─────────────────────
function classify(subject, body) {
  var text = normalize_((subject || '') + '\n' + (body || '').slice(0, 3000));
  for (var i = 0; i < RULES.length; i++) {
    var r = RULES[i], ok = true;
    for (var g = 0; g < r.all.length && ok; g++) {
      ok = r.all[g].some(function (w) { return text.indexOf(normalize_(w)) !== -1; });
    }
    if (ok) return { id: r.id, name: r.name };
  }
  return null;
}

function normalize_(s) {
  return String(s).replace(/\s+/g, ' ').toLowerCase();
}

/** 보낸 사람 표시 이름에서 '홍길동님' 만들기. 한글 이름이 아니면 '고객님' */
function customerName(fromHeader) {
  var m = String(fromHeader || '').match(/^\s*"?([^"<]+?)"?\s*</);
  var name = m ? m[1].trim() : '';
  if (/^[가-힣]{2,4}$/.test(name)) return name + ' 고객님';
  return '고객님';
}

function emailOf_(fromHeader) {
  var m = String(fromHeader || '').match(/<([^>]+)>/);
  return (m ? m[1] : String(fromHeader || '')).trim().toLowerCase();
}

/** 건너뛸 메일이면 이유(문자열), 처리할 메일이면 null */
function skipReason(fromHeader, subject, hasListUnsubscribe) {
  var email = emailOf_(fromHeader);
  if (CONFIG.MY_ADDRESSES.indexOf(email) !== -1) return '내가 보낸 메일';
  for (var i = 0; i < CONFIG.SKIP_SENDER_PATTERNS.length; i++) {
    if (new RegExp(CONFIG.SKIP_SENDER_PATTERNS[i], 'i').test(email)) return '자동 발송 주소';
  }
  for (var j = 0; j < CONFIG.SKIP_SUBJECT_PATTERNS.length; j++) {
    if (new RegExp(CONFIG.SKIP_SUBJECT_PATTERNS[j], 'i').test(subject || '')) return '알림·광고 제목';
  }
  if (hasListUnsubscribe) return '뉴스레터(수신거부 머리글)';
  return null;
}

function buildBody(typeId, fromHeader) {
  var head = NEEDS_FILL[typeId] ? '[보내기 전 ⟦ ⟧ 칸을 채우고 이 줄을 지워 주세요]\n\n' : '';
  return head + TEMPLATES[typeId].replace('{고객}', customerName(fromHeader)) + '\n\n' + CONFIG.SIGNATURE;
}

// ───────────────────── Gmail 실행부 ─────────────────────
function run() {
  var labels = {
    root: getLabel_(CONFIG.LABEL_ROOT),
    draft: getLabel_(CONFIG.LABEL_ROOT + '/초안 만듦'),
    test: getLabel_(CONFIG.LABEL_ROOT + '/시험 분류'),
    check: getLabel_(CONFIG.LABEL_ROOT + '/확인필요'),
    skip: getLabel_(CONFIG.LABEL_ROOT + '/해당없음')
  };
  var draftThreadIds = {};
  GmailApp.getDrafts().forEach(function (d) {
    try { draftThreadIds[d.getMessage().getThread().getId()] = true; } catch (e) {}
  });

  var threads = GmailApp.search(CONFIG.SEARCH, 0, CONFIG.MAX_PER_RUN);
  var rows = [];
  threads.forEach(function (thread) {
    var msgs = thread.getMessages();
    var last = msgs[msgs.length - 1];
    var from = last.getFrom(), subject = thread.getFirstMessageSubject();
    var row = { time: new Date(), from: from, subject: subject, type: '', action: '' };

    var reason = skipReason(from, subject, !!last.getHeader('List-Unsubscribe'));
    if (!reason && draftThreadIds[thread.getId()]) reason = '이미 초안 있음';
    if (reason) {
      row.action = '건너뜀: ' + reason;
      thread.addLabel(labels.skip);
    } else {
      var type = classify(subject, last.getPlainBody());
      if (!type) {
        row.action = '건너뜀: 정해진 유형 아님';
        thread.addLabel(labels.skip);
      } else {
        row.type = type.id + ' ' + type.name;
        if (CONFIG.DRY_RUN || !CONFIG.APPROVED[type.id]) {
          row.action = CONFIG.DRY_RUN ? '시험: 초안 안 만듦' : '문구 미승인: 초안 안 만듦';
          thread.addLabel(labels.test);
        } else {
          last.createDraftReply(buildBody(type.id, from)); // 초안만. 보내지 않음.
          thread.addLabel(labels.draft);
          if (NEEDS_FILL[type.id]) thread.addLabel(labels.check);
          row.action = '초안 만듦';
        }
      }
    }
    thread.addLabel(labels.root);
    rows.push(row);
  });
  writeLog_(rows);
  return rows;
}

/** 처음 설치 때 한 번: 권한 허용 + 결과를 실행 기록에 보여 줌 */
function testRunOnce() {
  var rows = run();
  rows.forEach(function (r) { Logger.log([r.subject, r.type, r.action].join(' | ')); });
  Logger.log('처리 ' + rows.length + '건. 기록 시트: ' + logSheetUrl_());
}

function installTrigger() {
  removeTrigger();
  ScriptApp.newTrigger('run').timeBased().everyMinutes(10).create();
  Logger.log('10분마다 실행 예약됨');
}

function removeTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'run') ScriptApp.deleteTrigger(t);
  });
}

function getLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

function writeLog_(rows) {
  if (!rows.length) return;
  var sheet = logSheet_();
  rows.forEach(function (r) { sheet.appendRow([r.time, r.from, r.subject, r.type, r.action]); });
}

function logSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('LOG_SHEET_ID');
  var ss = id ? SpreadsheetApp.openById(id) : null;
  if (!ss) {
    ss = SpreadsheetApp.create('답장 자동화 기록');
    ss.getSheets()[0].appendRow(['시각', '보낸 사람', '제목', '유형', '처리']);
    props.setProperty('LOG_SHEET_ID', ss.getId());
  }
  return ss.getSheets()[0];
}

function logSheetUrl_() {
  return logSheet_().getParent().getUrl();
}

// node 테스트용 (Apps Script에서는 무시됨)
if (typeof module !== 'undefined') {
  module.exports = { CONFIG: CONFIG, RULES: RULES, TEMPLATES: TEMPLATES, classify: classify,
    customerName: customerName, skipReason: skipReason, buildBody: buildBody };
}
