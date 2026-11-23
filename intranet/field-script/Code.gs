/**
 * 현장소통 (고객 현장 페이지) 서버 — Google Apps Script 웹앱
 * 현장소통 Code.gs 2026-11-23 v4 (이전: '현장소통 Code.gs 2026-11-23 v3', '2026-11-19 v2', '2026-11-18 v1', '2 현장소통 Code.gs.txt' = v0)
 * 화면: https://soo-cpu.github.io/card/field/
 * 저장: 이 스크립트가 붙은 구글 시트(글·공정·댓글) + 드라이브 현장별 폴더(사진, 월별 하위 폴더)
 * 원본 데이터는 지우지 않는다: 숨기기만 하고, 시트 행은 남긴다.
 *
 * v1에서 더한 것 (다음 지시 2026-11-13 v3 · 3번 고객 공유 페이지)
 *  - 결제 일정(계약금·중도금·잔금): '현장' 탭 16번째 칸 '결제(JSON)'
 *  - 고객 확인 번호(전화 뒷번호 4자리): '현장' 탭 17번째 칸. 비어 있으면 예전처럼 주소만으로 열림
 *    고객 화면의 site·photo·upload·post·comment 요청 모두 이 번호를 확인 (틀리면 5번까지, 15분 잠금)
 *  - 공정표: 공정(JSON) 단계마다 시작일(a)·끝일(b) 보관
 *  - 드라이브 폴더에서 사진 불러오기(importFolder): 원본은 읽기만 (복사·이동·이름 변경 안 함)
 *  - 인트라넷 프로젝트 번호(proj)는 '메모' 칸에만 (고객 화면에는 안 나감)
 *  - 고객 화면에 나가는 것: 현장명·담당자·연락처·주소·공사 기간·공정·결제 일정·글·사진·댓글
 *    (원가·마진·메모·프로젝트 번호·확인 번호는 절대 안 나감)
 *
 * v2에서 더한 것 (대표 지시 2026-11-19 · 직원이 비밀번호 없이 관리 화면 열기)
 *  - 직원 입장권(ticket): 인트라넷이 '직원 열쇠'로 서명한 5분짜리 입장권을 확인하고 6시간짜리 출입증(token)을 내줌
 *    열쇠는 스크립트 속성 FIELD_STAFF_KEY 에만 (코드·시트·기록에 쓰지 않음). 속성이 없으면 입장권은 모두 거절
 *    같은 입장권은 한 번만 (10분 동안 기억). 출입증은 캐시에만 있고 6시간 뒤 사라짐
 *  - 관리 요청의 pw 자리에 "T:출입증"이 오면 비밀번호 대신 인정. 그 밖의 값은 예전 그대로 비밀번호 확인(10번 틀리면 15분 잠금)
 *  - '기록' 탭의 '누가' 칸: 비밀번호로 들어오면 '관리', 입장권으로 들어오면 직원 이름
 *  - 고객 확인 번호(PIN)·횟수 제한·고객 화면 요청은 그대로
 *
 * v3에서 더한 것 (다음 지시 2026-11-23 v4 · B 고객 공유 페이지 개선)
 *  - projSite: 인트라넷 프로젝트 번호(proj, P-YYMM-NNN)로 현장을 찾고, 없으면 만든다 (입장권 출입증 또는 관리 비밀번호만)
 *    찾기·만들기는 한 잠금 안에서 해서 같은 proj 현장이 두 번 생기지 않음. 숨긴 현장은 찾지 않음. 지우는 것 없음
 *  - '현장' 탭 18번째 칸 '고객 이름' (관리 화면·검색용. 고객 화면에는 안 나감)
 *  - 인트라넷 공정표 날짜로 공정(JSON)을 고칠 때: 바꾸기 전 값을 '옛 값' 탭에 통째로 남기고 고침 (같으면 쓰지 않음)
 *    진행 상태(대기·진행 중·완료)는 같은 이름 단계에서 그대로 이어받고, 공정표에 없는 단계는 진행이 있던 것만 남김
 *  - sites 응답(관리 전용)에 고객 이름·확인 번호를 넣어 현장 목록 검색이 되게 함
 *  - 단계 이름은 40자까지
 *
 * v4 (검토 반영 2026-11-23): 자동 생성 현장명이 비면 고객 이름 대신 '인트라넷 현장 ' + 프로젝트 번호 (현장명은 고객 화면에 나감)
 *    확인 번호는 자르기 전 원래 값이 숫자 4자리일 때만 (긴 값을 앞 4자리로 저장하지 않음). 시트 칸·탭은 v3 와 같음 (setup 다시 안 해도 됨)
 */

var TAB = {
  sites:    ['현장', ['코드','현장명','담당자','연락처','주소','착공일','준공예정일','공정(JSON)','상태','폴더ID','만든 시각','관리자 확인 시각','고객 최근 글','숨김','메모','결제(JSON)','고객 확인 번호','고객 이름']],
  posts:    ['글',   ['글ID','현장코드','날짜','작성(회사/고객)','이름','공정','종류','내용','중요','사진ID(JSON)','작성 시각','숨김','고친 시각']],
  comments: ['댓글', ['댓글ID','현장코드','글ID','작성(회사/고객)','이름','내용','작성 시각','숨김']],
  photos:   ['사진', ['파일ID','현장코드','올린 시각','작성(회사/고객)','파일 이름']],
  pdfs:     ['PDF',  ['파일ID','현장코드','파일 이름','만든 시각']],
  settings: ['설정', ['항목','값','설명']],
  log:      ['기록', ['시각','동작','현장코드','누가','내용']],
  hist:     ['옛 값', ['시각','현장코드','칸','옛 값','누가','까닭']]   // v3: 고치기 전 값 (지우지 않음)
};
var INIT_PW = '';   // 비워 둠(저장소 공개). 설치 때 대표 드라이브 '현장소통 첫 비밀번호.txt'를 읽고, 없으면 무작위.
var SHEET_ID = '1Mx45YBU5_Dy7a9i9pAn89VLA40PRJdMGAHTvmc0zpHI';   // 현장소통 데이터 2026-11-06 v0
var PHOTO_ROOT_ID = '1d2JMn10YKoZv9Ymjib1V9Fh5mictFqGL';          // 현장소통 사진·기록
var TEST_CODE = 'WI7ijOiMEPHIOf4vjkqEPmG2';
var TEST_FOLDER_ID = '1lw72he2le5Y8tumh8wdacHqucWWiJhcs';
var SAMPLE_URL = 'https://soo-cpu.github.io/card/field/sample/s';
var ROOT_NAME = '현장소통 사진·기록';
var PHASES = ['시공 전', '시공 중', '시공 후'];

function doGet(e) {
  if (e && e.parameter && e.parameter.a === 'img') return imgGen_(e.parameter);   // 시안 이미지 (Imagen.gs)
  return out_({ ok: true, msg: '현장소통 서버 동작 중', v: 4 });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { return out_({ ok: false, error: '요청 형식 오류' }); }
  try {
    var fn = ACTIONS[req.a];
    if (!fn) return out_({ ok: false, error: '알 수 없는 요청' });
    var r = fn(req) || {};
    r.ok = true;
    return out_(r);
  } catch (x) {
    return out_({ ok: false, error: String(x && x.message || x) });
  }
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- 시트 도우미 ---------- */
var SS_;
function ss_() { return SS_ || (SS_ = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet()); }
function sheet_(key) {
  var ss = ss_();
  var t = TAB[key], sh = ss.getSheetByName(t[0]);
  if (!sh) {
    sh = ss.insertSheet(t[0]);
    sh.getRange(1, 1, 1, t[1].length).setValues([t[1]]).setFontWeight('bold').setBackground('#F2F2F2');
    sh.setFrozenRows(1);
  }
  return sh;
}
/* v1: 예전 시트에 새 칸 머리글이 없으면 채운다 (기존 칸·행은 그대로) */
function ensureCols_(key) {
  var sh = sheet_(key), want = TAB[key][1];
  var have = sh.getRange(1, 1, 1, want.length).getDisplayValues()[0];
  for (var i = 0; i < want.length; i++) {
    if (!have[i]) sh.getRange(1, i + 1).setValue(want[i]).setFontWeight('bold').setBackground('#F2F2F2');
  }
}
function rows_(key) {
  var sh = sheet_(key), n = sh.getLastRow();
  if (n < 2) return [];
  var w = TAB[key][1].length;
  return sh.getRange(2, 1, n - 1, w).getDisplayValues().map(function (r, i) { r._row = i + 2; return r; });
}
function append_(key, arr) {
  var sh = sheet_(key);
  sh.getRange(sh.getLastRow() + 1, 1, 1, arr.length).setNumberFormat('@').setValues([arr.map(String)]);
}
function setCell_(key, row, col, val) {
  sheet_(key).getRange(row, col + 1).setNumberFormat('@').setValue(String(val));
}
function now_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'); }
function today_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd'); }
function id_(p) { return p + Utilities.getUuid().replace(/-/g, '').slice(0, 12); }
function log_(act, code, who, detail) { try { append_('log', [now_(), act, code || '', who || '', String(detail || '').slice(0, 300)]); } catch (x) {} }
/* v4: 확인 번호 — 원래 값(앞뒤 빈칸만 뺌)이 숫자 4자리면 그 값, 비었으면 '', 그 밖은 null (자르지 않음) */
function pin_(v) { var t = String(v == null ? '' : v).trim(); if (!t) return ''; return /^\d{4}$/.test(t) ? t : null; }
function clean_(s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, n || 2000).trim(); }
function day_(s) { s = clean_(s, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''; }

function setting_(k) {
  var r = rows_('settings').filter(function (x) { return x[0] === k; })[0];
  return r ? r[1] : '';
}
function ensureSettings_() {
  // 비밀번호는 코드에 두지 않는다(저장소 공개). 없으면 무작위로 만들어 '설정' 탭에 적는다.
  if (!setting_('관리 비밀번호')) append_('settings', ['관리 비밀번호', INIT_PW || firstPw_() || ('hf' + Utilities.getUuid().slice(0, 6)), '관리 화면 비밀번호. 이 칸을 고치면 바로 바뀜.']);
}

/* 대표 드라이브 '현장소통 첫 비밀번호.txt' (설치 때 한 번 읽음) */
function firstPw_() {
  try { var it = DriveApp.getFilesByName('현장소통 첫 비밀번호.txt'); return it.hasNext() ? it.next().getBlob().getDataAsString().trim().slice(0, 40) : ''; } catch (x) { return ''; }
}

/* 짐작할 수 없는 24자리 코드 */
function newCode_() {
  var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', s = '';
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now());
  for (var i = 0; i < 24; i++) s += abc.charAt(((bytes[i] + 256) % 256) % abc.length);
  return s;
}

/* ---------- 권한 ---------- */
/* 관리 권한 확인. 돌려주는 값 = 누가 ('관리' 또는 입장권으로 들어온 직원 이름) */
function admin_(req) {
  var cache = CacheService.getScriptCache();
  var who = staffTok_(req, cache);
  if (who) return who;   // v2: 직원 출입증 (아래 비밀번호 확인·잠금은 예전 그대로)
  ensureSettings_();
  var fails = Number(cache.get('pwfail') || 0);
  if (fails >= 10) throw new Error('비밀번호를 여러 번 틀려 15분 동안 잠겼어요');
  if (!req.pw || String(req.pw) !== String(setting_('관리 비밀번호'))) {
    cache.put('pwfail', String(fails + 1), 900);
    throw new Error(/^T:/.test(String(req.pw || '')) ? '직원 입장권 시간이 끝났어요 (비밀번호가 맞지 않아요)' : '비밀번호가 맞지 않아요');
  }
  return '관리';
}

/* ---------- v2: 직원 입장권 ---------- */
var TICKET_MS = 5 * 60 * 1000;   // 입장권은 만든 지 5분 안에만
function b64u_(bytes) { return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, ''); }
function sameStr_(a, b) {   // 길이가 같을 때 끝까지 비교 (앞에서 멈추지 않음)
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  var d = 0;
  for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function whoName_(w) {
  try {
    var n = clean_(Utilities.newBlob(Utilities.base64DecodeWebSafe(w + '==='.slice((w.length + 3) % 4))).getDataAsString(), 20);
    return n.replace(/[^0-9A-Za-z가-힣 ]/g, '') || '직원';
  } catch (x) { return '직원'; }
}
/* 입장권 "시각.누구.한번값.서명" 확인 — 서명 = HMAC-SHA256(열쇠, "시각.누구.한번값") base64url. 틀리면 오류, 맞으면 { who, nonce } */
function ticketCheck_(k, key, nowMs) {
  if (!key) throw new Error('직원 열쇠가 아직 연결되지 않았어요 (스크립트 속성 FIELD_STAFF_KEY)');
  var m = /^(\d{13})\.([A-Za-z0-9_-]{1,120})\.([A-Za-z0-9_-]{16,64})\.([A-Za-z0-9_-]{43})$/.exec(String(k || ''));
  if (!m) throw new Error('입장권 모양이 맞지 않아요');
  var sig = b64u_(Utilities.computeHmacSha256Signature(m[1] + '.' + m[2] + '.' + m[3], String(key)));
  if (!sameStr_(sig, m[4])) throw new Error('입장권이 맞지 않아요 (인트라넷에서 다시 열어 주세요)');
  if (Math.abs(nowMs - Number(m[1])) > TICKET_MS) throw new Error('입장권 시간이 지났어요 (인트라넷에서 다시 열어 주세요)');
  return { who: whoName_(m[2]), nonce: m[3] };
}
/* pw 자리에 "T:출입증"이 오고 그 출입증이 캐시에 살아 있으면 직원 이름, 아니면 '' */
function staffTok_(req, cache) {
  var pw = String(req && req.pw || '');
  if (!/^T:[A-Za-z0-9]{32,80}$/.test(pw)) return '';
  return String(cache.get('tks_' + pw.slice(2)) || '');
}
function site_(code) {
  if (!code || String(code).length < 20) throw new Error('주소를 확인해 주세요');
  var r = rows_('sites').filter(function (x) { return x[0] === String(code); })[0];
  if (!r || r[13] === 'Y') throw new Error('주소를 확인해 주세요');
  return r;
}
/* v1: 고객 확인 번호(전화 뒷번호 4자리). 번호가 없는 현장은 예전처럼 통과.
   틀리면 'PIN:'으로 시작하는 오류 → 화면이 번호 입력 칸을 보여 줌 */
function pinOk_(r, req) {
  var pin = String(r[16] || '').trim();
  if (!pin) return;
  if (req.pin == null || req.pin === '') throw new Error('PIN:');
  var ok = String(req.pin).trim() === pin;
  // 틀린 횟수는 잠금 안에서 세어 동시에 많이 보내도 15분에 5번까지만 (검토 반영)
  var cache = CacheService.getScriptCache(), k = 'pinf_' + r[0];
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var fails = Number(cache.get(k) || 0);
    if (fails >= 5) throw new Error('PIN:확인 번호를 여러 번 틀렸어요. 15분 뒤에 다시 해 주세요');
    if (ok) return;
    cache.put(k, String(fails + 1), 900);
    throw new Error('PIN:번호가 맞지 않아요 (' + (fails + 1) + '/5)');
  } finally { lock.releaseLock(); }
}
function stages_(json) {
  var a = [];
  try { a = JSON.parse(json || '[]'); } catch (x) {}
  return (a || []).slice(0, 30).map(function (s) { return { n: clean_(s.n, 40), s: (Math.floor(Math.abs(Number(s.s) || 0))) % 3, a: day_(s.a), b: day_(s.b) }; }).filter(function (s) { return s.n; });
}
function pays_(json) {
  var a = [];
  try { a = typeof json === 'string' ? JSON.parse(json || '[]') : (json || []); } catch (x) {}
  return (a || []).slice(0, 12).map(function (p) {
    var amt = Math.round(Number(String(p.amt == null ? '' : p.amt).replace(/[^0-9.]/g, '')) || 0);
    return { n: clean_(p.n, 20) || '결제', amt: amt, due: day_(p.due), paid: !!p.paid, date: day_(p.date) };
  }).filter(function (p) { return p.n; });
}
function sitePublic_(r) {
  // 고객에게 나가는 칸만. 메모(14)·확인 번호(16)·폴더ID(9)는 넣지 않는다.
  return { code: r[0], name: r[1], manager: r[2], phone: r[3], address: r[4], start: r[5], end: r[6], stages: stages_(r[7]), status: r[8], payments: pays_(r[15]) };
}
function rate_(code, kind, max) {
  var c = CacheService.getScriptCache(), k = 'rt_' + kind + '_' + code, n = Number(c.get(k) || 0);
  if (n >= max) throw new Error('잠시 뒤에 다시 올려 주세요');
  c.put(k, String(n + 1), 3600);
}

/* ---------- 드라이브 폴더 ---------- */
function root_() {
  var id = setting_('사진 폴더ID') || PHOTO_ROOT_ID;
  if (id) { try { return DriveApp.getFolderById(id); } catch (x) {} }
  var file = DriveApp.getFileById(ss_().getId());
  var parents = file.getParents(), parent = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  var it = parent.getFoldersByName(ROOT_NAME), f = it.hasNext() ? it.next() : parent.createFolder(ROOT_NAME);
  append_('settings', ['사진 폴더ID', f.getId(), '현장별 폴더가 이 안에 생김']);
  return f;
}
function siteFolder_(r) {
  if (r[9]) { try { return DriveApp.getFolderById(r[9]); } catch (x) {} }
  var f = root_().createFolder(r[1] + ' (' + r[0].slice(0, 6) + ')');
  setCell_('sites', r._row, 9, f.getId());
  return f;
}
function monthFolder_(r) {
  var f = siteFolder_(r), m = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM');
  var it = f.getFoldersByName(m);
  return it.hasNext() ? it.next() : f.createFolder(m);
}
/* v1: 큰 사진(1.5MB 넘음, 드라이브에서 불러온 원본 등)은 드라이브 미리 보기 크기(긴 변 1600)로 보냄 */
function photoData_(id) {
  var f = DriveApp.getFileById(id);
  if (f.getSize() > 1.5 * 1024 * 1024) {
    try {
      var res = UrlFetchApp.fetch('https://drive.google.com/thumbnail?sz=w1600&id=' + encodeURIComponent(id), { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
      if (res.getResponseCode() === 200) {
        var t = res.getBlob();
        if (/^image\//.test(t.getContentType())) return 'data:' + t.getContentType() + ';base64,' + Utilities.base64Encode(t.getBytes());
      }
    } catch (x) {}
  }
  if (f.getSize() > 1.5 * 1024 * 1024) throw new Error('큰 사진 미리 보기 실패');   // 원본 통째로 보내면 한 묶음이 다 실패 → 이 사진만 건너뜀
  var b = f.getBlob();
  return 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
}

/* ---------- 현장 내용 ---------- */
function bundle_(code, isAdmin, seenAt) {
  var posts = rows_('posts').filter(function (p) { return p[1] === code && (isAdmin || p[11] !== 'Y'); }).map(function (p) {
    var ph = []; try { ph = JSON.parse(p[9] || '[]'); } catch (x) {}
    return { id: p[0], date: p[2], by: p[3] === '고객' ? 'c' : 'a', author: p[4], stage: p[5], kind: p[6], text: p[7],
             important: p[8] === 'Y', photos: ph, createdAt: p[10], hidden: p[11] === 'Y',
             isNew: !!(isAdmin && p[3] === '고객' && p[10] > (seenAt || '')) };
  });
  var comments = rows_('comments').filter(function (c) { return c[1] === code && (isAdmin || c[7] !== 'Y'); }).map(function (c) {
    return { id: c[0], postId: c[2], by: c[3] === '고객' ? 'c' : 'a', author: c[4], text: c[5], createdAt: c[6], hidden: c[7] === 'Y',
             isNew: !!(isAdmin && c[3] === '고객' && c[6] > (seenAt || '')) };
  });
  return { posts: posts, comments: comments };
}
function adminExtra_(r) {
  return { pin: String(r[16] || ''), proj: projOf_(r), cust: String(r[17] || '') };
}
function projOf_(r) { var m = String(r[14] || '').match(/P-\d{4}-\d{3}/); return m ? m[0] : ''; }
/* v3: 옛 값 남기기 (값 전체, 자르지 않음 — 시트 칸 한도 5만 자 안) */
function keepOld_(code, col, old, who, why) { append_('hist', [now_(), code, col, String(old == null ? '' : old).slice(0, 49000), who || '', why || '']); }
/* v3: 인트라넷 공정표(단계 이름·시작·끝) → 공정(JSON). 같은 이름 단계의 진행 상태는 이어받음. 바뀐 게 없으면 null */
function mergeSched_(oldJson, sched) {
  var old = stages_(oldJson), key = function (n) { return String(n || '').replace(/\s+/g, '').toLowerCase(); }, used = {};
  var plan = stages_(JSON.stringify((sched || []).slice(0, 30))).filter(function (x) { return x.a; });
  if (!plan.length) return null;
  var out = plan.map(function (x) {
    var hit = null;
    for (var i = 0; i < old.length; i++) if (!used[i] && key(old[i].n) === key(x.n)) { hit = i; break; }
    if (hit !== null) used[hit] = 1;
    return { n: x.n, s: hit !== null ? old[hit].s : 0, a: x.a, b: x.b || x.a };
  });
  old.forEach(function (x, i) { if (!used[i] && x.s > 0 && out.length < 30) out.push(x); });   // 진행이 있던 단계는 남김
  var j = JSON.stringify(out);
  return j === JSON.stringify(old) ? null : j;
}
var DEF_STAGES = ['철거', '설비', '전기', '목공', '타일', '도장', '마감'];

var ACTIONS = {
  /* 고객·관리 공통 */
  site: function (req) {
    var r = site_(req.s);
    pinOk_(r, req);
    var b = bundle_(r[0], false);
    return { site: sitePublic_(r), posts: b.posts, comments: b.comments, pinOn: !!String(r[16] || '').trim() };
  },
  photo: function (req) {
    var isAdmin = false;
    if (req.pw) { admin_(req); isAdmin = true; }
    var r = site_(req.s);
    if (!isAdmin) pinOk_(r, req);
    var ids = (req.ids || []).slice(0, 6), mine = {};
    rows_('photos').forEach(function (p) { if (p[1] === r[0]) mine[p[0]] = 1; });
    var res = {};
    ids.forEach(function (id) {
      if (!mine[id]) return;
      try { res[id] = photoData_(id); } catch (x) {}
    });
    return { photos: res };
  },
  upload: function (req) {
    var isAdmin = false;
    if (req.pw) { admin_(req); isAdmin = true; }
    var r = site_(req.s);
    if (!isAdmin) { pinOk_(r, req); rate_(r[0], 'up', 80); }
    var m = /^data:image\/(jpeg|png);base64,(.+)$/.exec(req.data || '');
    if (!m) throw new Error('사진 형식 오류');
    var bytes = Utilities.base64Decode(m[2]);
    if (bytes.length > 4 * 1024 * 1024) throw new Error('사진이 너무 커요');
    var name = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd_HHmmss') + '_' + (isAdmin ? '회사' : '고객') + '_' + Math.floor(Math.random() * 1000) + '.jpg';
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      var f = monthFolder_(r).createFile(Utilities.newBlob(bytes, 'image/' + m[1], name));
      append_('photos', [f.getId(), r[0], now_(), isAdmin ? '회사' : '고객', name]);
      return { fileId: f.getId() };
    } finally { lock.releaseLock(); }
  },
  post: function (req) {
    var r = site_(req.s); pinOk_(r, req); rate_(r[0], 'post', 40);
    var text = clean_(req.text, 2000), photos = (req.photos || []).slice(0, 20).map(String);
    if (!text && !photos.length) throw new Error('내용을 적어 주세요');
    var id = id_('P'), t = now_();
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      append_('posts', [id, r[0], today_(), '고객', clean_(req.author, 20) || '고객', '', clean_(req.kind, 10) || '의견', text, '', JSON.stringify(photos), t, '', '']);
      setCell_('sites', r._row, 12, t);
    } finally { lock.releaseLock(); }
    return { id: id };
  },
  comment: function (req) {
    var isAdmin = false;
    if (req.pw) { admin_(req); isAdmin = true; }
    var r = site_(req.s);
    if (!isAdmin) { pinOk_(r, req); rate_(r[0], 'cmt', 60); }
    var text = clean_(req.text, 1000);
    if (!text) throw new Error('내용을 적어 주세요');
    var id = id_('C'), t = now_();
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      append_('comments', [id, r[0], String(req.postId || ''), isAdmin ? '회사' : '고객', clean_(req.author, 20) || (isAdmin ? '홈퍼니싱' : '고객'), text, t, '']);
      if (!isAdmin) setCell_('sites', r._row, 12, t);
    } finally { lock.releaseLock(); }
    return { id: id };
  },

  /* v2: 직원 입장권 → 출입증 (인트라넷 '관리 화면 열기') */
  ticket: function (req) {
    var key = String(PropertiesService.getScriptProperties().getProperty('FIELD_STAFF_KEY') || '').trim();
    var t = ticketCheck_(req.k, key, Date.now());
    var cache = CacheService.getScriptCache();
    var lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {   // 같은 입장권은 한 번만 (잠금 안에서 확인해 동시에 두 번 와도 하나만)
      if (cache.get('tkn_' + t.nonce)) throw new Error('이미 쓴 입장권이에요 (인트라넷에서 다시 열어 주세요)');
      cache.put('tkn_' + t.nonce, '1', 600);
    } finally { lock.releaseLock(); }
    var token = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
    cache.put('tks_' + token, t.who, 21600);   // 6시간
    log_('직원 입장', '', t.who, '인트라넷 입장권');
    return { token: token };
  },

  /* 관리 전용 */
  login: function (req) { admin_(req); return {}; },
  sites: function (req) {
    admin_(req);
    var posts = rows_('posts'), cm = rows_('comments');
    var list = rows_('sites').filter(function (r) { return r[13] !== 'Y'; }).map(function (r) {
      var s = sitePublic_(r), seen = r[11] || '';
      s.newCount = posts.filter(function (p) { return p[1] === r[0] && p[3] === '고객' && p[10] > seen; }).length +
                   cm.filter(function (c) { return c[1] === r[0] && c[3] === '고객' && c[6] > seen; }).length;
      s.postCount = posts.filter(function (p) { return p[1] === r[0] && p[11] !== 'Y'; }).length;
      s.createdAt = r[10];
      var x = adminExtra_(r); s.pinOn = !!x.pin; s.proj = x.proj; s.cust = x.cust; s.pin = x.pin;   // v3: 목록 검색용 (관리 전용)
      return s;
    });
    return { sites: list };
  },
  adminSite: function (req) {
    admin_(req);
    var r = site_(req.s), b = bundle_(r[0], true, r[11]);
    setCell_('sites', r._row, 11, now_());
    var s = sitePublic_(r), x = adminExtra_(r); s.pin = x.pin; s.proj = x.proj; s.cust = x.cust;
    return { site: s, posts: b.posts, comments: b.comments, pinOn: !!x.pin };
  },
  /* v3: 인트라넷 '고객 공유 페이지 열기' — proj 로 찾기/만들기, 공정표 날짜 맞추기 (s 가 오면 그 현장) */
  projSite: function (req) {
    var who = admin_(req);
    ensureCols_('sites');
    var code = String(req.s || ''), proj = /^P-\d{4}-\d{3}$/.test(String(req.proj || '')) ? String(req.proj) : '';
    if (!code && !proj) throw new Error('프로젝트 번호가 없어요 (인트라넷에서 다시 열어 주세요)');
    var pin = pin_(req.pin);
    if (pin === null) pin = '';   // 숫자 4자리가 아니면 넣지 않음
    var sched = Array.isArray(req.stages) ? req.stages.slice(0, 30) : [];
    var created = false, schedN = 0, r = null, custFilled = false;
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {   // 찾기와 만들기를 한 잠금 안에서 → 같은 proj 가 동시에 두 번 와도 현장은 하나
      if (code) r = site_(code);
      else r = rows_('sites').filter(function (x) { return x[13] !== 'Y' && projOf_(x) === proj; })[0] || null;
      if (!r) {
        var name = clean_(req.name, 60) || ('인트라넷 현장 ' + proj);   // v4: 고객 이름은 현장명(고객 화면)에 쓰지 않음
        var st0 = stages_(JSON.stringify(sched)).filter(function (x) { return x.a; });
        if (!st0.length) st0 = DEF_STAGES.map(function (n) { return { n: n, s: 0, a: '', b: '' }; });
        else st0 = st0.map(function (x) { return { n: x.n, s: 0, a: x.a, b: x.b || x.a }; });
        var nc = newCode_();
        append_('sites', [nc, name, clean_(req.manager, 30), clean_(req.phone, 30), '', day_(req.start), day_(req.end),
                          JSON.stringify(st0), '진행', '', now_(), now_(), '', '', '인트라넷 ' + proj, '[]', pin, clean_(req.cust, 30)]);
        created = true;
        r = rows_('sites').filter(function (x) { return x[0] === nc; })[0];
        schedN = st0[0] && st0[0].a ? st0.length : 0;
      } else {
        var nj = mergeSched_(r[7], sched);
        if (nj) { keepOld_(r[0], '공정(JSON)', r[7], who, '인트라넷 공정표로 맞춤' + (proj ? ' ' + proj : '')); setCell_('sites', r._row, 7, nj); schedN = JSON.parse(nj).length; }
        if (!String(r[17] || '') && clean_(req.cust, 30)) { setCell_('sites', r._row, 17, clean_(req.cust, 30)); custFilled = true; }   // 빈 칸만 채움
      }
    } finally { lock.releaseLock(); }
    if (created) { try { siteFolder_(r); } catch (x) {} log_('현장 자동 생성', r[0], who, r[1] + ' · ' + proj + (pin ? ' · 확인 번호 있음' : ' · 확인 번호 없음')); }
    else if (schedN || custFilled) log_('인트라넷 맞춤', r[0], who, (schedN ? '공정표 ' + schedN + '단계' : '') + (custFilled ? ' 고객 이름' : ''));
    return { code: r[0], created: created, sched: schedN, pinOn: !!String(r[16] || pin || '').trim() };
  },
  addSite: function (req) {
    var who = admin_(req);
    ensureCols_('sites');
    var name = clean_(req.name, 60);
    if (!name) throw new Error('현장 이름을 적어 주세요');
    var pin = pin_(req.pin);
    if (pin === null) throw new Error('확인 번호는 숫자 4자리로 적어 주세요');
    var code = newCode_(), stages = stages_(JSON.stringify(req.stages || []));
    var proj = (String(req.proj || '').match(/P-\d{4}-\d{3}/) || [''])[0];
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      append_('sites', [code, name, clean_(req.manager, 30), clean_(req.phone, 30), clean_(req.address, 100), day_(req.start), day_(req.end),
                        JSON.stringify(stages), '진행', '', now_(), now_(), '', '', proj ? ('인트라넷 ' + proj) : '', JSON.stringify(pays_(req.payments)), pin, clean_(req.cust, 30)]);
    } finally { lock.releaseLock(); }
    var r = site_(code); siteFolder_(r);
    log_('현장 추가', code, who, name + (proj ? ' · ' + proj : ''));
    return { code: code };
  },
  updateSite: function (req) {
    var who = admin_(req);
    ensureCols_('sites');
    var r = site_(req.s), f = req.fields || {};
    var map = { name: 1, manager: 2, phone: 3, address: 4, status: 8, cust: 17 };
    Object.keys(map).forEach(function (k) { if (f[k] != null) setCell_('sites', r._row, map[k], clean_(f[k], 100)); });
    if (f.start != null) setCell_('sites', r._row, 5, day_(f.start));
    if (f.end != null) setCell_('sites', r._row, 6, day_(f.end));
    if (f.stages) {
      var ns = JSON.stringify(stages_(JSON.stringify(f.stages)));
      if (ns !== JSON.stringify(stages_(r[7]))) { keepOld_(r[0], '공정(JSON)', r[7], who, '관리 화면에서 고침'); setCell_('sites', r._row, 7, ns); }
    }
    if (f.payments) setCell_('sites', r._row, 15, JSON.stringify(pays_(f.payments)));
    if (f.pin != null) {
      var pin = pin_(f.pin);
      if (pin === null) throw new Error('확인 번호는 숫자 4자리로 적어 주세요');
      setCell_('sites', r._row, 16, pin);
    }
    log_('현장 수정', r[0], who, Object.keys(f).join(','));
    return {};
  },
  adminPost: function (req) {
    admin_(req);
    var r = site_(req.s), text = clean_(req.text, 4000), photos = (req.photos || []).slice(0, 30).map(String);
    if (!text && !photos.length) throw new Error('내용을 적어 주세요');
    var id = id_('P');
    append_('posts', [id, r[0], day_(req.date) || today_(), '회사', clean_(req.author, 20) || '홈퍼니싱', clean_(req.stage, 20), clean_(req.kind, 10) || '공정',
                      text, req.important ? 'Y' : '', JSON.stringify(photos), now_(), '', '']);
    return { id: id };
  },
  /* v1: 드라이브 폴더(현장 폴더의 시공 전·중·후 사진)에서 사진 불러오기 — 원본은 읽기만 */
  importFolder: function (req) {
    var who = admin_(req);
    var r = site_(req.s);
    var fid = (String(req.folder || '').match(/[-\w]{25,}/) || [''])[0];
    if (!fid) throw new Error('드라이브 폴더 주소를 붙여 넣어 주세요');
    var folder;
    try { folder = DriveApp.getFolderById(fid); } catch (x) { throw new Error('폴더를 열 수 없어요 (주소·공유 확인)'); }
    var kind = PHASES.indexOf(String(req.kind)) >= 0 ? String(req.kind) : '시공 중';
    var have = {};
    rows_('photos').forEach(function (p) { if (p[1] === r[0]) have[p[0]] = 1; });
    var it = folder.getFiles(), list = [], skipped = 0, already = 0;
    while (it.hasNext()) {
      var f = it.next(), mt = f.getMimeType();
      if (!/^image\/(jpeg|png|webp)$/.test(mt)) { skipped++; continue; }
      if (have[f.getId()]) { already++; continue; }
      if (f.getSize() > 25 * 1024 * 1024) { skipped++; continue; }
      list.push({ id: f.getId(), name: f.getName(), t: f.getDateCreated().getTime() });
    }
    list.sort(function (a, b) { return a.t - b.t || (a.name < b.name ? -1 : 1); });
    var more = Math.max(0, list.length - 30);
    list = list.slice(0, 30);
    if (!list.length) return { count: 0, skipped: skipped, already: already, more: 0 };
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    var id = id_('P');
    try {
      list.forEach(function (x) { append_('photos', [x.id, r[0], now_(), '회사', '드라이브 ' + x.name]); });
      append_('posts', [id, r[0], day_(req.date) || today_(), '회사', clean_(req.author, 20) || '홈퍼니싱', clean_(req.stage, 20), kind,
                        clean_(req.text, 4000), '', JSON.stringify(list.map(function (x) { return x.id; })), now_(), '', '']);
    } finally { lock.releaseLock(); }
    log_('드라이브 사진 불러오기', r[0], who, kind + ' ' + list.length + '장 · 폴더 ' + folder.getName());
    return { count: list.length, skipped: skipped, already: already, more: more, id: id };
  },
  editPost: function (req) {
    var who = admin_(req);
    var r = site_(req.s);
    var p = rows_('posts').filter(function (x) { return x[0] === req.id && x[1] === r[0]; })[0];
    if (!p) throw new Error('글을 찾을 수 없어요');
    if (req.important != null) setCell_('posts', p._row, 8, req.important ? 'Y' : '');
    if (req.hidden != null) setCell_('posts', p._row, 11, req.hidden ? 'Y' : '');
    if (req.text != null) { log_('글 수정 전 내용', r[0], who, p[7]); setCell_('posts', p._row, 7, clean_(req.text, 4000)); }
    if (req.kind != null) setCell_('posts', p._row, 6, clean_(req.kind, 10));
    setCell_('posts', p._row, 12, now_());
    return {};
  },
  editComment: function (req) {
    admin_(req);
    var r = site_(req.s);
    var c = rows_('comments').filter(function (x) { return x[0] === req.id && x[1] === r[0]; })[0];
    if (!c) throw new Error('댓글을 찾을 수 없어요');
    if (req.hidden != null) setCell_('comments', c._row, 7, req.hidden ? 'Y' : '');
    return {};
  },
  savePdf: function (req) {
    var who = admin_(req);
    var r = site_(req.s), m = /^data:application\/pdf;(?:[^;,]*;)?base64,(.+)$/.exec(req.data || '');
    if (!m) throw new Error('PDF 형식 오류');
    var folder = siteFolder_(r), base = '현장기록 ' + r[1].replace(/[\\\/:*?"<>|]/g, ' ') + ' ', max = -1, it = folder.getFiles();
    while (it.hasNext()) {
      var n = it.next().getName(), mm = /\sv(\d+)\.pdf$/.exec(n);
      if (n.indexOf(base) === 0 && mm) max = Math.max(max, Number(mm[1]));
    }
    var name = base + today_() + ' v' + (max + 1) + '.pdf';
    var f = folder.createFile(Utilities.newBlob(Utilities.base64Decode(m[1]), 'application/pdf', name));
    append_('pdfs', [f.getId(), r[0], name, now_()]);
    log_('PDF 저장', r[0], who, name);
    return { name: name, url: f.getUrl() };
  },
  folder: function (req) {
    admin_(req);
    return { url: siteFolder_(site_(req.s)).getUrl() };
  }
};

/* 처음 한 번: 시트 탭·설정·사진 폴더 만들기 (편집기에서 실행 ▶) — v1로 바꾼 뒤에도 한 번 실행하면 새 칸 머리글이 생김 */
function setup() {
  Object.keys(TAB).forEach(sheet_);
  ensureCols_('sites');
  ensureSettings_();
  if (!setting_('사진 폴더ID')) append_('settings', ['사진 폴더ID', root_().getId(), '현장별 폴더가 이 안에 생김']);
  seedTest_();
  rows_('sites').forEach(function (r) { siteFolder_(r); });
  log_('설치', '', '관리', '탭·설정·시험 현장 준비 (v3)');
}

/* 시험 현장(대표 확인용) 3일치 — 이미 있으면 다시 넣지 않음 */
function seedTest_() {
  if (rows_('sites').some(function (r) { return r[0] === TEST_CODE; })) return;
  var code = TEST_CODE, folder;
  try { folder = DriveApp.getFolderById(TEST_FOLDER_ID); } catch (x) { folder = root_().createFolder('시험 현장(대표 확인용) (' + code.slice(0, 6) + ')'); }
  var mit = folder.getFoldersByName('2026-11'), month = mit.hasNext() ? mit.next() : folder.createFolder('2026-11');
  var ph = [];
  for (var i = 0; i < 8; i++) {
    var blob = UrlFetchApp.fetch(SAMPLE_URL + i + '.jpg').getBlob().setName('예시사진_' + i + '.jpg');
    var f = month.createFile(blob);
    ph.push(f.getId());
    append_('photos', [f.getId(), code, '2026-11-0' + (3 + Math.min(2, Math.floor(i / 3))) + ' 17:00:00', i === 7 ? '고객' : '회사', '예시사진_' + i + '.jpg']);
  }
  var stages = [{ n: '철거', s: 2 }, { n: '설비', s: 2 }, { n: '전기', s: 1 }, { n: '목공', s: 1 }, { n: '타일', s: 0 }, { n: '도장', s: 0 }, { n: '마감', s: 0 }];
  append_('sites', [code, '시험 현장(대표 확인용)', '정진혁 실장', '1566-5904', '서울 (예시 주소)', '2026-11-03', '2026-11-20', JSON.stringify(stages), '진행', folder.getId(), '2026-11-03 08:00:00', '2026-11-05 18:00:00', '2026-11-05 20:12:00', '', '대표 확인용 시험 현장. 고객에게 보내지 않음', '[]', '']);
  var P = [
    ['P_s1', '2026-11-03', '회사', '정진혁 실장', '철거', '공정', '오늘 철거 작업을 마쳤습니다.\n· 거실·주방 기존 마루, 걸레받이 철거\n· 욕실 2곳 타일·도기 철거\n· 폐기물 1톤 반출, 엘리베이터 보양 완료\n내일은 설비(배관) 작업이 들어갑니다.', '', [0, 1, 2], '2026-11-03 17:40:00'],
    ['P_s2', '2026-11-04', '회사', '정진혁 실장', '설비', '공정', '욕실·주방 배관 교체와 수압 시험을 마쳤습니다. 누수 없음 확인했습니다.\n전기 배선은 오후부터 시작했습니다.', '', [3, 4], '2026-11-04 17:20:00'],
    ['P_s3', '2026-11-04', '회사', '정진혁 실장', '타일', '공지', '욕실 타일 색상을 11월 8일(토)까지 정해 주세요.\n샘플 두 가지(밝은 그레이 / 웜 베이지)를 현장에 두었습니다. 정해 주시면 바로 발주합니다.', 'Y', [], '2026-11-04 18:05:00'],
    ['P_s4', '2026-11-05', '회사', '정진혁 실장', '목공', '공정', '거실 천장 몰딩 자리와 안방 붙박이장 벽체 목공을 시작했습니다. 전기 콘센트 위치도 함께 표시해 두었습니다.', '', [5, 6], '2026-11-05 17:30:00'],
    ['P_s5', '2026-11-05', '고객', '고객', '', '요청', '안방 콘센트를 침대 양쪽에 하나씩 더 넣을 수 있을까요? 참고 사진 올려요.', '', [7], '2026-11-05 20:12:00']
  ];
  P.forEach(function (p) {
    append_('posts', [p[0], code, p[1], p[2], p[3], p[4], p[5], p[6], p[7], JSON.stringify(p[8].map(function (k) { return ph[k]; })), p[9], '', '']);
  });
  append_('comments', ['C_s1', code, 'P_s1', '고객', '고객', '빠르게 진행해 주셔서 감사합니다!', '2026-11-03 19:02:00', '']);
  append_('comments', ['C_s2', code, 'P_s1', '회사', '정진혁 실장', '감사합니다. 매일 저녁 진행 사진 올려 드리겠습니다.', '2026-11-03 19:30:00', '']);
  append_('comments', ['C_s3', code, 'P_s3', '고객', '고객', '토요일 오전에 현장 들러서 보고 정할게요.', '2026-11-04 21:10:00', '']);
}
