
/**
 * 현장소통 (고객 현장 페이지) 서버 — Google Apps Script 웹앱
 * 현장소통 Code.gs 2026-11-27 v9 (이전: '현장소통 Code.gs 2026-11-26 v8', '2026-11-26 v7', '2026-11-25 v6', '2026-11-23 v5', '2026-11-23 v4', '2026-11-23 v3', '2026-11-19 v2', '2026-11-18 v1', '2 현장소통 Code.gs.txt' = v0)
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
 * v4 (검토 반영 2026-11-23): 자동 생성 현장명이 비면 고정 글 '홈퍼니싱 현장' (현장명은 고객 화면에 나감 — 고객 이름·프로젝트 번호 안 씀)
 *    확인 번호는 자르기 전 원래 값이 숫자 4자리일 때만 (긴 값을 앞 4자리로 저장하지 않음). 시트 칸·탭은 v3 와 같음 (setup 다시 안 해도 됨)
 *
 * v5에서 더한 것 (대표 지시 2026-11-23 · 직원별 고정 6자리 번호로 관리 화면 입장)
 *  - 직원 번호: 대표가 직원마다 정하는 6자리. 서버에는 HMAC-SHA256(소금, 이름+번호) 해시만 ('직원 번호' 탭). 소금 = 스크립트 속성 PIN_SALT (없으면 setup 이 무작위로 만듦)
 *    직원 이름 목록 = '설정' 탭 '직원 이름' 줄 (쉼표로 구분, 대표가 고침. 처음 값 정진혁,이봄이,채진아)
 *  - 5번 틀리면 그 직원 '잠김' (시간이 지나도 안 풀림, 대표가 풀어 줌) · 전체 틀린 시도도 1시간에 20번까지 (잠금 안에서 셈)
 *  - 번호가 맞으면 30일 기억 기기 토큰(기기 localStorage)을 주고, 서버는 토큰 해시만 '기억 기기' 탭에. 30일 안에는 토큰 → 6시간 출입증 ("T:" 구조 그대로)
 *  - 새 기기로 들어오면 대표에게 메일 (스크립트 속성 OWNER_EMAIL, 없으면 기록만. 메일에 번호·토큰 없음) + '기록' 탭에 '새 기기'
 *  - 대표(관리 비밀번호로 들어온 사람)만: 번호 정하기·바꾸기(그 직원 기억 기기 모두 무효)·잠금 풀기·즉시 차단(번호·기기·출입증 무효)·이름 추가·접속 기록 보기
 *    직원 출입증(임시 열쇠·직원 번호)으로 온 요청은 이 동작들을 거절
 *  - 기존 5분 입장권(FIELD_STAFF_KEY, 화면 이름 '임시 열쇠')·관리 비밀번호·고객 확인 번호는 그대로. 지우는 행·칸 없음 (바뀐 값은 '옛 값' 탭)
 *
 * v6에서 더한 것 (다음 지시 2026-11-25 v9 1부 · 계약 단계 이후 기존 프로젝트 일괄 등록)
 *  - 시트 탭 '인트라넷 가져오기' (대표 시트에 따로 채움. 이 스크립트는 탭을 만들지 않음 — 없거나 비면 아무것도 안 함)
 *    칸 순서: 프로젝트 번호 · 현장명 · 고객 이름 · 담당 · 착공일 · 준공예정일 · 확인 번호(뒷4) · 공정(JSON [{n,a,b}]) · 처리
 *  - importProjects(): 처리 칸이 빈 줄마다 projSite 와 같은 규칙 — 프로젝트 번호로 찾고(숨긴 현장 제외) 없으면 만듦, 중복 없음,
 *    현장명이 비면 '홈퍼니싱 현장', 공정은 mergeSched_ (바꾸기 전 값은 '옛 값' 탭), 고객 이름은 빈 칸만 채움
 *    처리 칸에 '등록됨 코드…' / '이미 있음 코드…' / '오류: …' 를 적음. 행은 지우지 않음. '기록' 탭에 남김
 *  - setup() 끝에서도 importProjects() 를 부름 (편집기에서 importProjects 만 따로 실행해도 됨)
 *
 * v7에서 바꾼 것 (2026-11-26 · 다음 지시 2026-11-25 v9 2부 현장 사진 · 직원 교육 전 안정화. 새 기능 없음)
 *  - 관리 비밀번호: 스크립트 속성 ADMIN_PW 에서만 읽음. 속성이 비면 비밀번호 입장은 잠김(직원 번호·임시 열쇠는 그대로)
 *    '설정' 탭 '관리 비밀번호' 줄·드라이브 '첫 비밀번호' 파일은 더 읽지도 만들지도 않음 (행은 지우지 않음)
 *  - 고객 화면 응답(site)에서 직원 정보 뺌: 담당자 이름·연락처는 빈 값, 회사 글·댓글 작성자는 '홈퍼니싱'
 *  - 사진은 올린 직원과 상관없이 같은 현장 코드면 직원 전원이 봄 (사진 탭 '현장코드' 기준, 올린 사람으로 거르지 않음)
 *  - 사진 원본(uploadOrig, 직원만): 현장 원본 폴더 '현장명_고객명'(없으면 자동 생성)에 저장. 부모 폴더 = '설정' 탭 '현장 원본 폴더ID'
 *    (비면 사진 폴더). 화면에는 브라우저가 긴 변 1600px 로 줄인 사진(upload)만. '현장' 탭 19번째 칸 '원본 폴더ID'
 *  - '사진' 탭 6~8번째 칸: 숨김 · 원본ID · 촬영 시각. 사진 삭제(hidePhoto)는 대표만 = 숨김 표시만 (드라이브 원본·화면용 파일 그대로)
 *  - 글 하나에 사진 100장까지 (여러 장 한 번에 올리기) · adminPost 도 잠금 안에서 씀 (동시에 올려도 줄이 겹치지 않게)
 *
 * v8 (2026-11-26 검토 반영 · v7 과 화면·시트 같음)
 *  - 숨긴 사진을 받는 '대표' 판단을 owner_ 와 같게: 직원 출입증(T:)은 이름이 '관리'여도 대표로 보지 않음 (photo·adminSite)
 *  - 요청 이름은 ACTIONS 에 직접 있는 것만 (constructor·toString 같은 기본 이름은 '알 수 없는 요청')
 *  - uploadOrig: 큰 원본을 드라이브에 쓰는 동안은 잠금을 잡지 않음 (폴더 찾기·시트 칸 적기만 잠금 안). 고객 확인 번호 확인도 같은 잠금을 쓰기 때문
 *
 * v9에서 더한 것 (2026-11-27 · 공정표 일정 · 공정 완료 체크 · 결제 단계 입금 완료)
 *  - 저장 자리는 그대로: 공정(JSON) 단계마다 d(완료 날짜) 추가 [{n,s,a,b,d}] — 옛 줄(d 없음)도 그대로 읽힘. 결제(JSON)는 v1 그대로 {n,amt,due,paid,date}
 *  - 새 요청(모두 직원 출입증·관리 비밀번호만): schedParse(표 붙여넣기·xlsx·csv 미리 보기) · schedSave(기존 현장 공정표 추가/수정)
 *    stageDone(공정 [완료]·되돌림, 날짜 고칠 수 있음) · payDone([입금 완료]·되돌림). 고객·관리 공통 prog(공정·결제만 가볍게, 고객은 확인 번호)
 *  - addSite: text/file(공정표)도 받음. updateSite: 옛 화면이 d 없이 보내도 완료 날짜를 지우지 않음, 완료로 바꾸면 오늘 날짜
 *  - xlsx 는 Utilities.unzip 으로 서버에서 읽음 (드라이브 변환·새 권한 없음). 옛 .xls 는 안 받음 (xlsx·csv·붙여넣기로)
 *  - 새 탭 '공정·결제 기록' (누르기 기록, 지우지 않음) · '설정' 탭 '기본 공정' 줄 (철거,설비,목공,전기,타일,도배,마감 — 대표가 고침)
 *  - 응답에 progress {done,total,pct} (완료 공정 수 / 전체)
 */

var TAB = {
  sites:    ['현장', ['코드','현장명','담당자','연락처','주소','착공일','준공예정일','공정(JSON)','상태','폴더ID','만든 시각','관리자 확인 시각','고객 최근 글','숨김','메모','결제(JSON)','고객 확인 번호','고객 이름','원본 폴더ID']],
  posts:    ['글',   ['글ID','현장코드','날짜','작성(회사/고객)','이름','공정','종류','내용','중요','사진ID(JSON)','작성 시각','숨김','고친 시각']],
  comments: ['댓글', ['댓글ID','현장코드','글ID','작성(회사/고객)','이름','내용','작성 시각','숨김']],
  photos:   ['사진', ['파일ID','현장코드','올린 시각','작성(회사/고객)','파일 이름','숨김','원본ID','촬영 시각']],   // v7: 6~8번째 칸
  pdfs:     ['PDF',  ['파일ID','현장코드','파일 이름','만든 시각']],
  settings: ['설정', ['항목','값','설명']],
  log:      ['기록', ['시각','동작','현장코드','누가','내용']],
  hist:     ['옛 값', ['시각','현장코드','칸','옛 값','누가','까닭']],   // v3: 고치기 전 값 (지우지 않음)
  pins:     ['직원 번호', ['이름','번호 해시','상태','틀린 횟수','바꾼 때','세대','잠긴 때']],          // v5: 번호는 해시만
  devs:     ['기억 기기', ['직원','토큰 해시','만든 때','만료','기기 요약','상태','마지막 사용']],     // v5: 토큰은 해시만
  marks:    ['공정·결제 기록', ['시각','현장코드','구분','항목','동작','날짜','누가']]                // v9: [완료]·[입금 완료]·되돌림 (지우지 않음)
};
// v7: 관리 비밀번호는 코드·시트·드라이브 파일에 두지 않는다 — 스크립트 속성 ADMIN_PW 에만 (대표가 직접 넣음)
var SHEET_ID = '1Mx45YBU5_Dy7a9i9pAn89VLA40PRJdMGAHTvmc0zpHI';   // 현장소통 데이터 2026-11-06 v0
var PHOTO_ROOT_ID = '1d2JMn10YKoZv9Ymjib1V9Fh5mictFqGL';          // 현장소통 사진·기록
var TEST_CODE = 'WI7ijOiMEPHIOf4vjkqEPmG2';
var TEST_FOLDER_ID = '1lw72he2le5Y8tumh8wdacHqucWWiJhcs';
var SAMPLE_URL = 'https://soo-cpu.github.io/card/field/sample/s';
var ROOT_NAME = '현장소통 사진·기록';
var PHASES = ['시공 전', '시공 중', '시공 후'];

function doGet(e) {
  if (e && e.parameter && e.parameter.a === 'img') return imgGen_(e.parameter);   // 시안 이미지 (Imagen.gs)
  return out_({ ok: true, msg: '현장소통 서버 동작 중', v: 9 });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { return out_({ ok: false, error: '요청 형식 오류' }); }
  try {
    var fn = (req && typeof req.a === 'string' && Object.prototype.hasOwnProperty.call(ACTIONS, req.a)) ? ACTIONS[req.a] : null;   // v8
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
  if (sh.getMaxColumns && sh.getMaxColumns() < want.length) sh.insertColumnsAfter(sh.getMaxColumns(), want.length - sh.getMaxColumns());   // v7: 칸이 모자라면 늘림
  var have = sh.getRange(1, 1, 1, want.length).getDisplayValues()[0];
  for (var i = 0; i < want.length; i++) {
    if (!have[i]) sh.getRange(1, i + 1).setValue(want[i]).setFontWeight('bold').setBackground('#F2F2F2');
  }
}
function rows_(key) {
  var sh = sheet_(key), n = sh.getLastRow();
  if (n < 2) return [];
  var full = TAB[key][1].length, w = full;
  if (sh.getMaxColumns) w = Math.min(full, sh.getMaxColumns());   // v7: 새 칸이 아직 없는 옛 시트도 읽힘 (모자란 칸은 빈 값)
  return sh.getRange(2, 1, n - 1, w).getDisplayValues().map(function (r, i) { while (r.length < full) r.push(''); r._row = i + 2; return r; });
}
function append_(key, arr) {
  var sh = sheet_(key);
  if (sh.getMaxColumns && sh.getMaxColumns() < arr.length) sh.insertColumnsAfter(sh.getMaxColumns(), arr.length - sh.getMaxColumns());   // v7: 칸이 모자란 옛 탭
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
var ORIG_MAX = 25 * 1024 * 1024;   // v7: 원본 한 장 25MB까지
/* v7: 촬영 시각 — 밀리초 숫자(2000년 ~ 내일)만 받아 한국 시각 글자로. 그 밖은 '' */
function takenAt_(v) {
  var n = Number(v);
  if (!isFinite(n) || n < 946684800000 || n > Date.now() + 86400000) return '';
  return Utilities.formatDate(new Date(n), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
}

function setting_(k) {
  var r = rows_('settings').filter(function (x) { return x[0] === k; })[0];
  return r ? r[1] : '';
}
/* v7: 관리 비밀번호는 스크립트 속성 ADMIN_PW 에서만 (시트·코드·드라이브 파일에 만들지 않음). 비면 '' → 비밀번호 입장 잠김 */
function adminPw_() { return String(props_().getProperty('ADMIN_PW') || '').trim(); }

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
  if (/^T:/.test(String(req.pw || ''))) throw new Error('직원 입장권 시간이 끝났어요 (비밀번호가 맞지 않아요)');   // 출입증 모양은 비밀번호로 보지 않음
  var apw = adminPw_();
  if (!apw) throw new Error('관리 비밀번호가 아직 설정되지 않아 잠겨 있어요 (대표: 스크립트 속성 ADMIN_PW)');   // v7: 안전 쪽
  var fails = Number(cache.get('pwfail') || 0);
  if (fails >= 10) throw new Error('비밀번호를 여러 번 틀려 15분 동안 잠겼어요');
  if (!req.pw || !sameStr_(String(req.pw), apw)) {
    cache.put('pwfail', String(fails + 1), 900);
    throw new Error('비밀번호가 맞지 않아요');
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
  var v = String(cache.get('tks_' + pw.slice(2)) || '');
  if (!v) return '';
  var o = null;
  if (v.charAt(0) === '{') { try { o = JSON.parse(v); } catch (x) { return ''; } }
  var who = o ? String(o.w || '') : v;
  if (!who) return '';
  var pr = pinRow_(who);   // v5: 즉시 차단된 직원은 어떤 출입증도 안 됨
  if (pr && pr[2] === '차단') return '';
  if (o && o.p && (!pr || String(pr[5]) !== String(o.g))) return '';   // 직원 번호 출입증: 번호를 바꾸거나 차단하면 끝
  return who;
}
/* v5: 대표만 (관리 비밀번호로 온 요청). 직원 출입증("T:")은 거절 */
function owner_(req) {
  if (/^T:/.test(String(req && req.pw || ''))) throw new Error('대표만 할 수 있어요 (관리 비밀번호로 들어와 주세요)');
  var who = admin_(req);
  if (who !== '관리') throw new Error('대표만 할 수 있어요 (관리 비밀번호로 들어와 주세요)');
  return who;
}
/* v8: admin_ 이 돌려준 who 가 대표(관리 비밀번호)인지 — 직원 출입증(T:)은 이름이 '관리'여도 아님 */
function isOwnerReq_(who, req) { return who === '관리' && !/^T:/.test(String(req && req.pw || '')); }

/* ---------- v5: 직원 번호 · 기억 기기 ---------- */
var PIN_MAX_FAIL = 5, PIN_ALL_MAX = 20, PIN_ALL_TTL = 3600, DEV_DAYS = 30, SESSION_S = 21600;
var STAFF_DEFAULT = '정진혁,이봄이,채진아';
function props_() { return PropertiesService.getScriptProperties(); }
/* 소금(PIN_SALT): make 가 참이면 없을 때 무작위로 만듦 (setup·번호 정하기). 이미 있으면 절대 바꾸지 않음 */
function salt_(make) {
  var p = props_(), s = String(p.getProperty('PIN_SALT') || '').trim();
  if (!s && make) { s = newCode_() + newCode_(); p.setProperty('PIN_SALT', s); }
  if (!s) throw new Error('직원 번호가 아직 준비되지 않았어요 (대표가 setup 을 한 번 실행해 주세요)');
  return s;
}
function mac_(msg) { return b64u_(Utilities.computeHmacSha256Signature(String(msg), salt_())); }
function pinHash_(name, pin) { return mac_('pin:' + name + ':' + pin); }
function devHash_(tok) { return mac_('dev:' + tok); }
function newTok_() { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ''); }
function validName_(n) { n = String(n == null ? '' : n).replace(/\s+/g, ''); return /^[가-힣A-Za-z]{2,10}$/.test(n) ? n : ''; }
function staffNames_() {
  var seen = {}, out = [];
  String(setting_('직원 이름') || '').split(/[,·\s]+/).forEach(function (x) { var n = validName_(x); if (n && !seen[n] && out.length < 30) { seen[n] = 1; out.push(n); } });
  return out;
}
function ensurePinSettings_() {
  if (!rows_('settings').some(function (x) { return x[0] === '직원 이름'; })) append_('settings', ['직원 이름', STAFF_DEFAULT, '현장소통 관리 화면에 직원 번호로 들어갈 수 있는 이름 (쉼표로 구분). 대표가 고침']);
}
function pinRow_(name) { return name ? (rows_('pins').filter(function (x) { return x[0] === name; })[0] || null) : null; }
function uaSum_(v) { return clean_(v, 40).replace(/[^0-9A-Za-z가-힣 ·\/().-]/g, '').trim() || '알 수 없는 기기'; }
function addDays_(n) { return Utilities.formatDate(new Date(Date.now() + n * 86400000), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'); }
/* 그 직원의 살아 있는 기억 기기를 모두 무효로 (행은 남기고 상태만) */
function devKill_(name, why) {
  var n = 0;
  rows_('devs').forEach(function (d) { if (d[0] === name && d[5] === '사용') { setCell_('devs', d._row, 5, why); n++; } });
  return n;
}
function pinSession_(name, gen) {
  var tok = newTok_();
  CacheService.getScriptCache().put('tks_' + tok, JSON.stringify({ w: name, g: String(gen), p: 1 }), SESSION_S);
  return tok;
}
/* 대표에게 메일 — 받는 주소는 스크립트 속성 OWNER_EMAIL 에만. 번호·토큰은 넣지 않음 */
function mailOwner_(subj, body) {
  var to = String(props_().getProperty('OWNER_EMAIL') || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return '메일 주소 없음(기록만)';
  try { MailApp.sendEmail(to, subj, body); return '메일 보냄'; } catch (x) { return '메일 못 보냄'; }
}
function pinAllFail_(cache) { cache.put('pinall', String(Number(cache.get('pinall') || 0) + 1), PIN_ALL_TTL); }
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
  if (!Array.isArray(a)) a = [];
  return a.slice(0, 30).map(function (s) {
    s = s || {};
    var st = (Math.floor(Math.abs(Number(s.s) || 0))) % 3;
    return { n: clean_(s.n, 40), s: st, a: day_(s.a), b: day_(s.b), d: st === 2 ? day_(s.d) : '' };   // v9: d = 완료 날짜 (완료일 때만)
  }).filter(function (s) { return s.n; });
}
function pays_(json) {
  var a = [];
  try { a = typeof json === 'string' ? JSON.parse(json || '[]') : (json || []); } catch (x) {}
  if (!Array.isArray(a)) a = [];
  return a.slice(0, 12).map(function (p) {
    p = p || {};
    var amt = Math.round(Number(String(p.amt == null ? '' : p.amt).replace(/[^0-9.]/g, '')) || 0);
    return { n: clean_(p.n, 20) || '결제', amt: amt, due: day_(p.due), paid: !!p.paid, date: day_(p.date) };
  }).filter(function (p) { return p.n; });
}
function sitePublic_(r) {
  // 고객에게 나가는 칸만. 메모(14)·확인 번호(16)·폴더ID(9)는 넣지 않는다.
  var st = stages_(r[7]);
  return { code: r[0], name: r[1], manager: r[2], phone: r[3], address: r[4], start: r[5], end: r[6], stages: st, status: r[8], payments: pays_(r[15]), progress: progress_(st), rev: rev_(r) };   // v9: progress·rev
}
/* v7: 고객 화면 전용 — 직원 이름·연락처는 넣지 않음 (칸은 빈 값으로 두어 옛 화면도 그대로 동작) */
var CO_NAME = '홈퍼니싱';
function siteCust_(r) { var s = sitePublic_(r); s.manager = ''; s.phone = ''; return s; }
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
/* v7: 사진 원본 폴더 '현장명_고객명' — 부모 = '설정' 탭 '현장 원본 폴더ID'(공유 드라이브의 현장 폴더 모음), 비면 사진 폴더.
   같은 이름 폴더가 이미 있으면 그것을 씀(새로 만들지 않음). 찾은·만든 폴더 ID 는 '현장' 탭 19번째 칸에. 잠금 안에서 부름 */
function folderName_(s) { return String(s || '').replace(/[\\\/:*?"<>|\u0000-\u001F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80); }
function origFolder_(r) {
  if (r[18]) { try { return DriveApp.getFolderById(r[18]); } catch (x) {} }
  var parent = null, pid = setting_('현장 원본 폴더ID');
  if (pid) { try { parent = DriveApp.getFolderById(pid); } catch (x) { parent = null; } }
  if (!parent) parent = root_();
  var name = folderName_(r[1]) || '홈퍼니싱 현장', cust = folderName_(r[17]);
  name = cust ? name + '_' + cust : name + '_' + String(r[0]).slice(0, 6);   // 고객 이름이 없으면 코드 앞 6자리로 (같은 이름 현장끼리 섞이지 않게)
  var it = parent.getFoldersByName(name), f = it.hasNext() ? it.next() : parent.createFolder(name);
  ensureCols_('sites');
  setCell_('sites', r._row, 18, f.getId());
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
/* v7: 그 현장의 숨긴 사진 ID (대표가 '삭제'한 사진 — 시트 표시만, 파일은 그대로) */
function hiddenPh_(code) {
  var h = {};
  rows_('photos').forEach(function (p) { if (p[1] === code && p[5] === 'Y') h[p[0]] = 1; });
  return h;
}
/* isAdmin = 직원·대표 화면, isOwner = 대표(숨긴 사진 목록도 받음). 고객 화면은 회사 쪽 작성자 이름을 '홈퍼니싱'으로 */
function bundle_(code, isAdmin, seenAt, isOwner) {
  var hid = hiddenPh_(code);
  var posts = rows_('posts').filter(function (p) { return p[1] === code && (isAdmin || p[11] !== 'Y'); }).map(function (p) {
    var ph = []; try { ph = JSON.parse(p[9] || '[]'); } catch (x) {}
    if (!Array.isArray(ph)) ph = [];
    var o = { id: p[0], date: p[2], by: p[3] === '고객' ? 'c' : 'a', author: (isAdmin || p[3] === '고객') ? p[4] : CO_NAME, stage: p[5], kind: p[6], text: p[7],
             important: p[8] === 'Y', photos: ph.filter(function (id) { return !hid[id]; }), createdAt: p[10], hidden: p[11] === 'Y',
             isNew: !!(isAdmin && p[3] === '고객' && p[10] > (seenAt || '')) };
    if (isOwner) o.hiddenPhotos = ph.filter(function (id) { return hid[id]; });
    return o;
  });
  var comments = rows_('comments').filter(function (c) { return c[1] === code && (isAdmin || c[7] !== 'Y'); }).map(function (c) {
    return { id: c[0], postId: c[2], by: c[3] === '고객' ? 'c' : 'a', author: (isAdmin || c[3] === '고객') ? c[4] : CO_NAME, text: c[5], createdAt: c[6], hidden: c[7] === 'Y',
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
    return { n: x.n, s: hit !== null ? old[hit].s : 0, a: x.a, b: x.b || x.a, d: hit !== null ? old[hit].d : '' };   // v9: 완료 날짜도 이어받음
  });
  old.forEach(function (x, i) { if (!used[i] && x.s > 0 && out.length < 30) out.push(x); });   // 진행이 있던 단계는 남김
  var j = JSON.stringify(out);
  return j === JSON.stringify(old) ? null : j;
}
var DEF_STAGES = ['철거', '설비', '전기', '목공', '타일', '도장', '마감'];   // v9: '설정' 탭 '기본 공정' 줄이 없을 때만 (defStages_)

/* ---------- v9: 공정표 일정 · 공정 완료 · 결제 단계 ---------- */
/* 저장 자리는 예전 그대로: 공정 = '현장' 탭 공정(JSON) [{n,s,a,b,d}] (d = 완료 날짜, v9), 결제 = 결제(JSON) [{n,amt,due,paid,date}].
   고객 화면·인트라넷이 이미 이 두 칸을 읽기 때문에 따로 시트로 옮기지 않음 (한 곳에만 저장).
   누르기 기록(완료·되돌림·입금·되돌림)은 새 탭 '공정·결제 기록'에 한 줄씩 (지우지 않음) */
var PAY_STAGES = ['계약금', '중도금', '잔금'];
var DEF_STAGES_V9 = '철거,설비,목공,전기,타일,도배,마감';
/* 기본 공정 목록 = '설정' 탭 '기본 공정' 줄 (쉼표로 구분, 대표가 고침). 줄이 없으면 예전 DEF_STAGES */
function defStages_() {
  var seen = {}, out = [];
  String(setting_('기본 공정') || '').split(/[,·\n]+/).forEach(function (x) { var n = clean_(x, 40); if (n && !seen[n] && out.length < 30) { seen[n] = 1; out.push(n); } });
  return out.length ? out : DEF_STAGES.slice();
}
function ensureSchedSettings_() {
  if (!rows_('settings').some(function (x) { return x[0] === '기본 공정'; })) append_('settings', ['기본 공정', DEF_STAGES_V9, 'v9: 새 현장 기본 공정 목록 (쉼표로 구분). 대표가 고침']);
}
function stKey_(n) { return String(n || '').replace(/\s+/g, '').toLowerCase(); }
function ymd_(y, m, d) {
  y = Number(y); m = Number(m); d = Number(d);
  if (!(y >= 2000 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31)) return '';
  var t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCMonth() !== m - 1) return '';   // 2월 30일 같은 날은 버림
  return y + '-' + ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2);
}
/* 날짜 글자 → yyyy-MM-dd. 2026-11-28 · 2026.11.28 · 2026/11/28 · 26.11.28 · 11/28 · 11-28 · 11.28 · 11월 28일 · 2026년 11월 28일(토) · 엑셀 날짜 숫자(46354).
   연도가 없으면 year(없으면 올해). 못 읽으면 '' */
function parseDay_(v, year) {
  if (v == null) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') return isNaN(v.getTime()) ? '' : Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd');
  var s = String(v).replace(/\([^)]*\)/g, ' ').replace(/[월화수목금토일]요일/g, ' ').trim();
  if (!s) return '';
  var y0 = Number(year) || Number(today_().slice(0, 4)), m;
  if (/^\d{5}(\.\d+)?$/.test(s)) {   // 엑셀 날짜 숫자 (1899-12-30 부터 센 날)
    var n = Math.floor(Number(s));
    if (n < 36526 || n > 73050) return '';
    var t = new Date(Date.UTC(1899, 11, 30) + n * 86400000);
    return ymd_(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
  }
  if ((m = s.match(/^(\d{4})\s*[.\/\-년]\s*(\d{1,2})\s*[.\/\-월]\s*(\d{1,2})\s*일?\.?$/))) return ymd_(m[1], m[2], m[3]);
  if ((m = s.match(/^(\d{4})(\d{2})(\d{2})$/))) return ymd_(m[1], m[2], m[3]);
  if ((m = s.match(/^(\d{2})\s*[.\/\-]\s*(\d{1,2})\s*[.\/\-]\s*(\d{1,2})\.?$/))) return ymd_(2000 + Number(m[1]), m[2], m[3]);
  if ((m = s.match(/^(\d{1,2})\s*월\s*(\d{1,2})\s*일?$/))) return ymd_(y0, m[1], m[2]);
  if ((m = s.match(/^(\d{1,2})\s*[.\/\-]\s*(\d{1,2})\.?$/))) return ymd_(y0, m[1], m[2]);
  return '';
}
function dayNum_(d) { return d ? Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10))) / 86400000 : 0; }
function addYear_(d) { return d ? ymd_(Number(d.slice(0, 4)) + 1, d.slice(5, 7), d.slice(8, 10)) : ''; }
/* 표 글자(엑셀에서 복사한 탭 구분 · CSV · 칸 사이 두 칸 이상 띄움) → [[칸,...],...] */
function splitTable_(text) {
  var lines = String(text == null ? '' : text).replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  var tab = lines.some(function (l) { return l.indexOf('\t') >= 0; });
  var comma = !tab && lines.some(function (l) { return l.indexOf(',') >= 0; });
  return lines.slice(0, 300).map(function (l) {
    if (tab) return l.split('\t').map(function (c) { return c.replace(/^"(.*)"$/, '$1').trim(); });
    if (comma) {   // CSV (따옴표 안의 쉼표는 그대로)
      var out = [], cur = '', q = false;
      for (var i = 0; i < l.length; i++) {
        var ch = l.charAt(i);
        if (q) { if (ch === '"') { if (l.charAt(i + 1) === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
        else if (ch === '"') q = true;
        else if (ch === ',') { out.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
      out.push(cur.trim());
      return out;
    }
    return l.trim().split(/\s{2,}|\s*\|\s*/).map(function (c) { return c.trim(); });
  }).filter(function (r) { return r.join('').trim(); });
}
var SCH_HEAD = { n: /^(공정|공종|공정명|작업|작업명|항목|내용|단계|trade|name)$/i, a: /(시작|착수|착공|부터|start|from)/i, b: /(종료|끝|완료|마감일|준공|까지|end|to)/i, p: /(기간|일정|날짜|period|date)/i };
/* 표 → 공정표 [{n,a,b}] + 알림. 머리글(공정·시작일·종료일)을 너그럽게 찾고, 없으면 1칸=공정·2칸=시작·3칸=종료.
   '11/28~12/02' 처럼 한 칸에 기간이 있어도 됨. 연도가 없는 날짜는 year 기준, 앞 날짜(첫 줄은 착공일 start)보다 반년 넘게 앞서면 다음 해로 봄 */
function parseSchedRows_(table, year, siteStart) {
  siteStart = day_(siteStart);
  if (siteStart && !year) year = Number(siteStart.slice(0, 4));
  var rows = (table || []).map(function (r) { return (r || []).map(function (c) { return c == null ? '' : String(c).trim(); }); });
  var warn = [], col = { n: 0, a: 1, b: 2, p: -1 }, start = 0;
  for (var h = 0; h < Math.min(rows.length, 10); h++) {
    var r = rows[h], f = { n: -1, a: -1, b: -1, p: -1 };
    r.forEach(function (c, i) {
      var t = c.replace(/\s+/g, '');
      if (f.n < 0 && SCH_HEAD.n.test(t)) f.n = i;
      else if (f.a < 0 && SCH_HEAD.a.test(t) && !parseDay_(c, year)) f.a = i;
      else if (f.b < 0 && SCH_HEAD.b.test(t) && !parseDay_(c, year)) f.b = i;
      else if (f.p < 0 && SCH_HEAD.p.test(t) && !parseDay_(c, year)) f.p = i;
    });
    if (f.n >= 0 && (f.a >= 0 || f.p >= 0 || f.b >= 0)) { col = f; start = h + 1; break; }
  }
  var out = [], prev = siteStart || '', seen = {};   // v9 검토 반영: 첫 줄도 착공일과 비교 (11월 착공 · 1/5 → 다음 해)
  for (var i = start; i < rows.length && out.length < 30; i++) {
    var r = rows[i], n = clean_(col.n >= 0 ? r[col.n] : '', 40);
    if (!n || /^(합계|소계|계|총계|비고)$/.test(n.replace(/\s+/g, ''))) continue;
    var ra = col.a >= 0 ? r[col.a] : '', rb = col.b >= 0 ? r[col.b] : '';
    if (col.p >= 0 && r[col.p] && !ra) {
      var pp = String(r[col.p]).split(/\s*[~～〜–—]\s*|\s+-\s+/);
      ra = pp[0] || ''; rb = rb || pp[1] || '';
    } else if (ra && !rb && /[~～〜]/.test(ra)) { var p2 = ra.split(/\s*[~～〜]\s*/); ra = p2[0]; rb = p2[1] || ''; }
    var yr = prev ? Number(prev.slice(0, 4)) : year;
    var a = parseDay_(ra, yr), b = parseDay_(rb, a ? Number(a.slice(0, 4)) : yr);
    if (a && prev && !/^\s*\d{4}|^\d{2}[.\/-]\d{1,2}[.\/-]|^\d{5}/.test(String(ra)) && dayNum_(a) < dayNum_(prev) - 180) a = addYear_(a);
    if (a && b && dayNum_(b) < dayNum_(a)) { if (!/^\s*\d{4}|^\d{5}/.test(String(rb)) && dayNum_(addYear_(b)) - dayNum_(a) <= 180) b = addYear_(b); /* 12/30~1/3 처럼 해를 넘길 때만 */ else { warn.push(n + ': 종료일이 시작일보다 앞이라 종료일을 비움'); b = ''; } }
    if (ra && !a) warn.push(n + ': 시작일 "' + clean_(ra, 20) + '" 을 읽지 못함');
    if (rb && !b && !/종료일이 시작일/.test(warn[warn.length - 1] || '')) warn.push(n + ': 종료일 "' + clean_(rb, 20) + '" 을 읽지 못함');
    if (seen[stKey_(n)]) warn.push(n + ': 같은 이름 공정이 또 있음 (둘 다 넣음)');
    seen[stKey_(n)] = 1;
    if (a) prev = a;
    out.push({ n: n, a: a, b: b || a });
  }
  if (!out.length) warn.push('공정 줄을 찾지 못했어요 (칸: 공정 · 시작일 · 종료일)');
  return { rows: out, warn: warn.slice(0, 40) };
}
/* xlsx(엑셀) → 첫 시트 표. xlsx 는 zip 이라 Utilities.unzip 으로 풀고 XML 을 읽음 (드라이브 변환·새 권한 없음) */
function xmlText_(s) {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, function (x, d) { return String.fromCharCode(Number(d)); }).replace(/&#x([0-9a-f]+);/gi, function (x, d) { return String.fromCharCode(parseInt(d, 16)); }).replace(/&amp;/g, '&');
}
function colIdx_(ref) { var m = /^([A-Z]+)/.exec(String(ref || '')), n = 0; if (!m) return -1; for (var i = 0; i < m[1].length; i++) n = n * 26 + (m[1].charCodeAt(i) - 64); return n - 1; }
/* v9 검토 반영: 압축 폭탄 막기 — 풀기 전에 zip 목록(central directory)의 '풀린 크기'를 더해 20MB 넘으면 거절, 푼 뒤에도 한 번 더 셈 */
var XLSX_UNZIP_MAX = 20 * 1024 * 1024;
function zipSize_(bytes) {
  var u8 = function (i) { return bytes[i] & 255; }, u16 = function (i) { return u8(i) | (u8(i + 1) << 8); }, u32 = function (i) { return (u16(i) + u16(i + 2) * 65536); };
  var e = -1;
  for (var i = bytes.length - 22; i >= 0 && i >= bytes.length - 22 - 65535; i--) if (u32(i) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('엑셀(xlsx) 파일이 깨졌어요');
  var n = u16(e + 10), p = u32(e + 16), total = 0;
  if (n > 2000) throw new Error('엑셀 파일이 너무 커요');
  for (var k = 0; k < n; k++) {
    if (p + 46 > bytes.length || u32(p) !== 0x02014b50) throw new Error('엑셀(xlsx) 파일이 깨졌어요');
    total += u32(p + 24);
    if (total > XLSX_UNZIP_MAX) throw new Error('엑셀 파일 내용이 너무 커요 (풀면 20MB 넘음)');
    p += 46 + u16(p + 28) + u16(p + 30) + u16(p + 32);
  }
  return total;
}
function xlsxTable_(bytes) {
  var parts = {}, total = 0;
  zipSize_(bytes);
  Utilities.unzip(Utilities.newBlob(bytes, 'application/zip', 'x.zip')).forEach(function (b) { total += b.getBytes().length; parts[b.getName()] = b; });
  if (total > XLSX_UNZIP_MAX) throw new Error('엑셀 파일 내용이 너무 커요 (풀면 20MB 넘음)');
  var str = function (k) { return parts[k] ? parts[k].getDataAsString('UTF-8') : ''; };
  var target = '';
  try {   // 첫 시트 찾기: workbook.xml 첫 <sheet r:id> → rels
    var wb = str('xl/workbook.xml'), rid = (/<sheet\b[^>]*\br:id="([^"]+)"/.exec(wb) || [])[1], rels = str('xl/_rels/workbook.xml.rels');
    if (rid) {
      var re = /<Relationship\b[^>]*>/g, m;
      while ((m = re.exec(rels))) { if (m[0].indexOf('Id="' + rid + '"') >= 0) { target = (/Target="([^"]+)"/.exec(m[0]) || [])[1] || ''; break; } }
      target = target.replace(/^\/?xl\//, '').replace(/^\//, '');
      if (target) target = 'xl/' + target;
    }
  } catch (x) {}
  if (!parts[target]) target = Object.keys(parts).filter(function (k) { return /^xl\/worksheets\/[^\/]+\.xml$/.test(k); }).sort()[0] || '';
  if (!target) throw new Error('엑셀 시트를 찾지 못했어요');
  var ss = [], sx = str('xl/sharedStrings.xml'), si = /<si\b[^>]*>([\s\S]*?)<\/si>/g, mm;
  while ((mm = si.exec(sx))) { var t = '', tr = /<t\b[^>]*>([\s\S]*?)<\/t>|<t\b[^>]*\/>/g, tm; while ((tm = tr.exec(mm[1]))) t += tm[1] ? xmlText_(tm[1]) : ''; ss.push(t); }
  var xml = str(target), out = [], rowRe = /<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g, rm, ri = 0;
  while ((rm = rowRe.exec(xml)) && out.length < 300) {
    var rn = Number((/\br="(\d+)"/.exec(rm[0]) || [])[1]) || (ri + 1); ri = rn;
    var cells = [], cRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, cm;
    while ((cm = cRe.exec(rm[1] || ''))) {
      var attr = cm[1], body = cm[2] || '', ci = colIdx_((/\br="([A-Z]+\d+)"/.exec(attr) || [])[1]), ty = (/\bt="([^"]+)"/.exec(attr) || [])[1] || '';
      if (ci < 0) ci = cells.length;
      if (ci > 50) continue;
      var v = (/<v>([\s\S]*?)<\/v>/.exec(body) || [])[1], val = '';
      if (ty === 's') val = ss[Number(v)] || '';
      else if (ty === 'inlineStr') val = xmlText_((/<is>([\s\S]*?)<\/is>/.exec(body) || [])[1]);
      else val = v == null ? '' : xmlText_(v);
      while (cells.length < ci) cells.push('');
      cells[ci] = String(val).trim();
    }
    while (out.length < rn - 1 && out.length < 300) out.push([]);
    out.push(cells);
  }
  return out.filter(function (r) { return r.join('').trim(); });
}
/* 요청에서 공정표 읽기: req.text(붙여 넣은 표·CSV 글자) 또는 req.file(data:...;base64, xlsx·csv) → { rows, warn, from } */
var SCHED_FILE_MAX = 5 * 1024 * 1024;
function schedFromReq_(req, start) {
  start = day_(start); var year = start ? Number(start.slice(0, 4)) : null;
  var f = String(req.file || '');
  if (f) {
    var m = /^data:([^;,]*)(?:;[^;,]*)*;base64,(.+)$/.exec(f);
    if (!m) throw new Error('공정표 파일 형식 오류');
    var bytes = Utilities.base64Decode(m[2]), nm = String(req.fileName || '').toLowerCase();
    if (bytes.length > SCHED_FILE_MAX) throw new Error('공정표 파일이 너무 커요 (5MB까지)');
    var zip = bytes.length > 3 && (bytes[0] & 255) === 0x50 && (bytes[1] & 255) === 0x4B;
    if (zip) { var r = parseSchedRows_(xlsxTable_(bytes), year, start); r.from = 'xlsx'; return r; }
    if (/\.xls$/.test(nm) || ((bytes[0] & 255) === 0xD0 && (bytes[1] & 255) === 0xCF)) throw new Error('옛 엑셀(.xls)은 못 읽어요. 엑셀에서 .xlsx 또는 CSV 로 저장하거나 표를 복사해 붙여 넣어 주세요');
    var txt = Utilities.newBlob(bytes).getDataAsString('UTF-8');
    if (txt.indexOf('�') >= 0) { try { txt = Utilities.newBlob(bytes).getDataAsString('MS949'); } catch (x) {} }   // 한글 엑셀 CSV (CP949)
    var c = parseSchedRows_(splitTable_(txt), year, start); c.from = 'csv'; return c;
  }
  if (req.text != null && String(req.text).trim()) { var t = parseSchedRows_(splitTable_(String(req.text).slice(0, 100000)), year, start); t.from = 'text'; return t; }
  return null;
}
/* 새 공정표(사람이 고친 목록 = 기준)에 옛 진행 상태·완료 날짜를 같은 이름끼리 이어 붙임 */
function applySched_(oldJson, plan) {
  var old = stages_(oldJson), used = {};
  plan = (Array.isArray(plan) ? plan : []).filter(function (x) { return x && clean_(x.n, 40); }).slice(0, 30);   // 이름 없는 줄은 미리 뺌 (번호 맞추기)
  return stages_(JSON.stringify((plan || []).slice(0, 30))).map(function (x, k) {
    var src = (plan || [])[k] || {}, hit = null;
    for (var i = 0; i < old.length; i++) if (!used[i] && stKey_(old[i].n) === stKey_(x.n)) { hit = i; break; }
    if (hit !== null) used[hit] = 1;
    var s = src.s != null ? x.s : (hit !== null ? old[hit].s : 0);
    var d = src.d != null ? x.d : (hit !== null ? old[hit].d : '');
    return { n: x.n, s: s, a: x.a, b: x.b || x.a, d: s === 2 ? d : '' };
  });
}
function progress_(stages) {
  var t = stages.length, d = stages.filter(function (x) { return x.s === 2; }).length;
  return { done: d, total: t, pct: t ? Math.round(d * 100 / t) : 0 };
}
/* 고객 화면이 가볍게 다시 읽을 때 바뀜 확인용 (공정·결제 칸 내용 요약) */
function rev_(r) { return b64u_(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, String(r[7] || '') + '|' + String(r[15] || '') + '|' + String(r[8] || ''))).slice(0, 12); }
function mark_(code, kind, item, act, day, who) { try { append_('marks', [now_(), code, kind, item, act, day || '', who || '']); } catch (x) {} }
/* 잠금 안에서 그 현장 줄을 다시 읽고 fn(r) 실행 */
function withSite_(code, fn) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { var r = site_(code); return fn(r); } finally { SpreadsheetApp.flush(); lock.releaseLock(); }
}
function findIdx_(list, req) {
  var i = req.i == null || req.i === '' ? -1 : Number(req.i), n = clean_(req.n, 40);
  if (n) {
    if (i >= 0 && list[i] && stKey_(list[i].n) === stKey_(n)) return i;   // 같은 이름이 둘이면 번호로
    for (var k = 0; k < list.length; k++) if (stKey_(list[k].n) === stKey_(n)) return k;
    return -1;
  }
  return i >= 0 && i < list.length && Math.floor(i) === i ? i : -1;
}
function reqDay_(v) {
  if (v == null || v === '') return today_();
  var d = parseDay_(v);
  if (!d) throw new Error('날짜를 확인해 주세요 (예: 2026-11-28)');
  return d;
}

var ACTIONS = {
  /* 고객·관리 공통 */
  site: function (req) {
    var r = site_(req.s);
    pinOk_(r, req);
    var b = bundle_(r[0], false);
    return { site: siteCust_(r), posts: b.posts, comments: b.comments, pinOn: !!String(r[16] || '').trim() };   // v7: 직원 정보 없음
  },
  photo: function (req) {
    var isAdmin = false, who = '';
    if (req.pw) { who = admin_(req); isAdmin = true; }
    var r = site_(req.s);
    if (!isAdmin) pinOk_(r, req);
    var ids = (Array.isArray(req.ids) ? req.ids : []).slice(0, 6).map(String), mine = {};
    // v7: 같은 현장 코드 사진이면 누가 올렸든 직원 전원에게. 숨긴 사진은 대표에게만
    var own = isOwnerReq_(who, req);   // v8
    rows_('photos').forEach(function (p) { if (p[1] === r[0] && (p[5] !== 'Y' || own)) mine[p[0]] = 1; });
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
    var taken = takenAt_(req.taken);   // v7: 촬영 시각 (화면이 EXIF·파일 날짜로 알려 줌, 없으면 빈 값)
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      var f = monthFolder_(r).createFile(Utilities.newBlob(bytes, 'image/' + m[1], name));
      append_('photos', [f.getId(), r[0], now_(), isAdmin ? '회사' : '고객', name, '', '', taken]);
      return { fileId: f.getId() };
    } finally { lock.releaseLock(); }
  },
  /* v7: 사진 원본 — 직원·대표만. upload 로 받은 화면용 사진 ID(id)에 원본을 붙여 현장 원본 폴더('현장명_고객명')에 저장 */
  uploadOrig: function (req) {
    var who = admin_(req);
    var r = site_(req.s);
    var m = /^data:(image\/(?:jpeg|png|webp|heic|heif|gif|bmp|tiff)|application\/octet-stream);base64,(.+)$/.exec(String(req.data || ''));
    if (!m) throw new Error('원본 형식 오류');
    var bytes = Utilities.base64Decode(m[2]);
    if (bytes.length > ORIG_MAX) throw new Error('원본이 너무 커요 (' + Math.round(ORIG_MAX / 1048576) + 'MB까지)');
    var id = String(req.id || ''), base = folderName_(clean_(req.name, 120)).replace(/\s/g, '_') || 'photo.jpg';
    var findP = function () { return rows_('photos').filter(function (x) { return x[0] === id && x[1] === r[0]; })[0]; };
    var p = findP();
    if (!p) throw new Error('사진을 찾을 수 없어요');
    if (p[6]) return { origId: p[6], already: true };   // 같은 원본을 두 번 넣지 않음
    // v8: 큰 원본을 드라이브에 쓰는 동안은 잠금을 잡지 않음 (고객 확인 번호·다른 직원 올리기가 잠금을 기다리다 실패하지 않게)
    var folder, lock = LockService.getScriptLock(); lock.waitLock(25000);
    try { folder = origFolder_(site_(req.s)); } finally { SpreadsheetApp.flush(); lock.releaseLock(); }   // 폴더 찾기·만들기·현장 칸 적기만 잠금 안에서
    var stamp = (p[7] || p[2] || now_()).replace(/[^0-9]/g, '').slice(0, 14);
    var f = folder.createFile(Utilities.newBlob(bytes, m[1], stamp.slice(0, 8) + '_' + stamp.slice(8) + '_' + base));
    lock = LockService.getScriptLock(); lock.waitLock(25000);
    try {
      p = findP();
      if (!p) throw new Error('사진을 찾을 수 없어요');
      if (p[6]) return { origId: p[6], already: true };   // 그 사이 같은 사진 원본이 먼저 들어감 (방금 만든 파일은 지우지 않고 둠)
      setCell_('photos', p._row, 6, f.getId());
      return { origId: f.getId() };
    } finally { SpreadsheetApp.flush(); lock.releaseLock(); }
  },
  /* v7: 사진 삭제 = 대표만, 숨김 표시만 (드라이브 원본·화면용 파일은 지우지 않음). hidden:false 면 되살림 */
  hidePhoto: function (req) {
    var who = owner_(req);
    var r = site_(req.s), id = String(req.id || ''), on = req.hidden !== false;
    var p = rows_('photos').filter(function (x) { return x[0] === id && x[1] === r[0]; })[0];
    if (!p) throw new Error('사진을 찾을 수 없어요');
    ensureCols_('photos');
    setCell_('photos', p._row, 5, on ? 'Y' : '');
    log_(on ? '사진 숨김' : '사진 되살림', r[0], who, id + ' · 드라이브 파일은 그대로');
    return { hidden: on };
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
    var tb = pinRow_(t.who);
    if (tb && tb[2] === '차단') throw new Error('들어갈 수 없어요 (대표에게 문의해 주세요)');   // v5: 즉시 차단된 직원
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

  /* ---------- v5: 직원 번호 (로그인 화면) ---------- */
  /* 이름 버튼에 쓸 목록: 번호가 정해졌고 차단이 아닌 이름만 (번호·해시·횟수는 안 나감) */
  pinNames: function (req) {
    ensurePinSettings_();
    var pins = rows_('pins');
    var names = staffNames_().filter(function (n) { return pins.some(function (x) { return x[0] === n && x[1] && x[2] !== '차단'; }); });
    return { names: names };
  },
  /* 6자리 번호 확인 → 30일 기억 기기 토큰 + 6시간 출입증. 새 기기는 대표에게 메일 */
  pinLogin: function (req) {
    salt_();
    var name = validName_(req.name), pin = String(req.pin == null ? '' : req.pin), ua = uaSum_(req.ua);
    var cache = CacheService.getScriptCache(), out = null, err = '', act = '', detail = '';
    var lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {   // 직원별·전체 틀린 횟수는 잠금 안에서 셈 (동시에 많이 보내도 한도 그대로)
      var all = Number(cache.get('pinall') || 0);
      var r = name && staffNames_().indexOf(name) >= 0 ? pinRow_(name) : null;
      if (all >= PIN_ALL_MAX) { err = '틀린 번호가 너무 많아 잠시 막혔어요. 1시간 뒤에 다시 해 주세요'; act = '직원 번호 막힘'; detail = '전체 시도 제한 · ' + ua; }
      else if (!r || !r[1]) { pinAllFail_(cache); err = '이름 또는 번호를 확인해 주세요'; act = '직원 번호 틀림'; detail = '번호 없는 이름 · ' + ua; }
      else if (r[2] === '차단') { pinAllFail_(cache); err = '들어갈 수 없어요 (대표에게 문의해 주세요)'; act = '직원 번호 틀림'; detail = '차단된 이름 · ' + ua; }
      else if (r[2] === '잠김') { pinAllFail_(cache); err = '번호를 ' + PIN_MAX_FAIL + '번 틀려 잠겼어요. 대표가 풀어 줘야 해요'; act = '직원 번호 틀림'; detail = '잠긴 상태 · ' + ua; }
      else if (!/^\d{6}$/.test(pin) || !sameStr_(pinHash_(name, pin), r[1])) {
        pinAllFail_(cache);
        var f = Number(r[3] || 0) + 1;
        setCell_('pins', r._row, 3, f);
        if (f >= PIN_MAX_FAIL) { setCell_('pins', r._row, 2, '잠김'); setCell_('pins', r._row, 6, now_()); err = '번호를 ' + PIN_MAX_FAIL + '번 틀려 잠겼어요. 대표가 풀어 줘야 해요'; act = '직원 번호 잠김'; }
        else { err = '번호가 맞지 않아요 (' + f + '/' + PIN_MAX_FAIL + ')'; act = '직원 번호 틀림'; }
        detail = f + '/' + PIN_MAX_FAIL + ' · ' + ua;
      } else {
        if (Number(r[3] || 0)) setCell_('pins', r._row, 3, 0);
        var dev = newTok_();
        append_('devs', [name, devHash_(dev), now_(), addDays_(DEV_DAYS), ua, '사용', now_()]);
        out = { token: pinSession_(name, r[5]), dev: dev, who: name, days: DEV_DAYS };
        act = '직원 번호 입장'; detail = '새 기기 · ' + ua;
      }
    } finally { SpreadsheetApp.flush(); lock.releaseLock(); }   // 검토 반영: 잠금 풀기 전에 시트에 확실히 씀
    if (!out) { log_(act, '', name || '(이름 없음)', detail); throw new Error(err); }
    var m = mailOwner_('[현장소통] 새 기기 접속 — ' + name + ' ' + now_().slice(0, 16),
      name + ' 님이 새 기기로 현장소통 관리 화면에 들어왔어요.\n시각: ' + now_() + '\n기기: ' + ua + '\n\n모르는 접속이면 현장소통 관리 화면(관리 비밀번호) › 직원 번호 › 즉시 차단 을 눌러 주세요.\nⓒ HOME FURNISHING CO. all rights reserved.');
    log_(act, '', name, detail + ' · ' + m);
    return out;
  },
  /* 기억 기기 토큰 → 6시간 출입증 (30일 안, 번호를 바꾸거나 차단하면 무효) */
  devLogin: function (req) {
    // 토큰을 먼저 찾는다. 찾은 토큰은 어떤 횟수 제한에도 걸리지 않음 (검토 반영: 가짜 토큰으로 진짜 기기를 막지 못하게)
    // 오류 앞머리: DEVBAD: = 확실히 무효(화면이 기기 기억을 지움) · DEVWAIT: = 잠시 문제(지우지 않음)
    var tok = String(req.dev || '');
    if (!/^[0-9a-f]{64}$/.test(tok)) throw new Error('DEVBAD:기억 기기 정보가 맞지 않아요');
    try { salt_(); } catch (x) { throw new Error('DEVWAIT:' + x.message); }
    var h = devHash_(tok), d = rows_('devs').filter(function (x) { return sameStr_(x[1], h); })[0];
    if (!d) {   // 없는 토큰(244비트 무작위라 짐작 불가) — 막지 않고 기록만 (1시간에 5줄까지, 기록 탭이 넘치지 않게)
      var c = CacheService.getScriptCache(), n = Number(c.get('devmiss') || 0);
      c.put('devmiss', String(n + 1), PIN_ALL_TTL);
      if (n < 5) log_('기억 기기 없음', '', '(모름)', '없는 기억 기기 토큰' + (n === 4 ? ' · 이 뒤 1시간은 기록 생략' : ''));
      throw new Error('DEVBAD:이 기기는 기억되어 있지 않아요');
    }
    var r = pinRow_(d[0]);
    if (d[5] !== '사용') throw new Error('DEVBAD:이 기기 기억이 끝났어요 (번호를 다시 넣어 주세요)');
    if (String(d[3]) <= now_()) { setCell_('devs', d._row, 5, '만료'); log_('기억 기기 만료', '', d[0], d[4]); throw new Error('DEVBAD:30일이 지나 번호를 다시 넣어 주세요'); }
    if (!r || r[2] === '차단' || !r[1] || staffNames_().indexOf(d[0]) < 0) { setCell_('devs', d._row, 5, '무효(차단)'); throw new Error('DEVBAD:들어갈 수 없어요 (대표에게 문의해 주세요)'); }
    setCell_('devs', d._row, 6, now_());
    log_('직원 번호 입장', '', d[0], '기억 기기 · ' + d[4]);
    return { token: pinSession_(d[0], r[5]), who: d[0] };
  },

  /* ---------- v5: 직원 번호 관리 (대표만) ---------- */
  pinAdmin: function (req) {
    owner_(req);
    ensurePinSettings_();
    var pins = rows_('pins'), devs = rows_('devs'), t = now_(), names = staffNames_();
    pins.forEach(function (x) { if (x[0] && names.indexOf(x[0]) < 0) names.push(x[0]); });   // 목록에서 뺀 이름도 상태는 보임
    var list = names.map(function (n) {
      var r = pins.filter(function (x) { return x[0] === n; })[0];
      return { name: n, listed: staffNames_().indexOf(n) >= 0, set: !!(r && r[1]), state: r ? (r[2] || '사용') : '번호 없음', fails: r ? Number(r[3] || 0) : 0, changedAt: r ? r[4] : '', lockedAt: r ? r[6] : '',
               devs: devs.filter(function (d) { return d[0] === n && d[5] === '사용' && String(d[3]) > t; }).map(function (d) { return { made: d[2], exp: d[3], ua: d[4], last: d[6] }; }) };
    });
    var acts = /^(직원 번호|기억 기기|번호 |잠금 풀기|즉시 차단|직원 입장|직원 이름)/;
    var logs = rows_('log').filter(function (x) { return acts.test(x[1]); }).slice(-80).reverse().map(function (x) {
      return { t: x[0], act: x[1], who: x[3], detail: x[4], newDev: /새 기기/.test(x[4]), ok: /입장/.test(x[1]) };
    });
    return { staff: list, logs: logs, mail: !!String(props_().getProperty('OWNER_EMAIL') || '').trim(), salt: !!String(props_().getProperty('PIN_SALT') || '').trim() };
  },
  pinSet: function (req) {
    var who = owner_(req);
    ensurePinSettings_();
    var name = validName_(req.name), pin = String(req.pin == null ? '' : req.pin);
    if (!name || staffNames_().indexOf(name) < 0) throw new Error('직원 이름 목록에 없는 이름이에요');
    if (!/^\d{6}$/.test(pin)) throw new Error('번호는 숫자 6자리로 넣어 주세요');
    if (/^(\d)\1{5}$/.test(pin) || '0123456789'.indexOf(pin) >= 0 || '9876543210'.indexOf(pin) >= 0) throw new Error('같은 숫자·이어지는 숫자는 쓸 수 없어요');
    var killed = 0, first = false, lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      salt_(true);
      var h = pinHash_(name, pin), r = pinRow_(name);
      if (!r) { append_('pins', [name, h, '사용', 0, now_(), 1, '']); first = true; }
      else {
        keepOld_('', '직원 번호 ' + name, '상태 ' + (r[2] || '') + ' · 세대 ' + (r[5] || '') + ' · 바꾼 때 ' + (r[4] || ''), who, '번호 바꿈 (해시는 남기지 않음)');
        setCell_('pins', r._row, 1, h); setCell_('pins', r._row, 2, '사용'); setCell_('pins', r._row, 3, 0); setCell_('pins', r._row, 4, now_());
        setCell_('pins', r._row, 5, Number(r[5] || 0) + 1); setCell_('pins', r._row, 6, '');
        killed = devKill_(name, '무효(번호 바뀜)');
      }
    } finally { SpreadsheetApp.flush(); lock.releaseLock(); }
    log_(first ? '번호 정함' : '번호 바꿈', '', who, name + (first ? '' : ' · 기억 기기 ' + killed + '대 무효'));
    return { first: first, killed: killed };
  },
  pinUnlock: function (req) {
    var who = owner_(req);
    var name = validName_(req.name), r = pinRow_(name);
    if (!r) throw new Error('번호가 없는 이름이에요');
    if (r[2] !== '잠김') throw new Error(r[2] === '차단' ? '차단된 직원은 새 번호를 정하면 다시 쓸 수 있어요' : '잠겨 있지 않아요');
    keepOld_('', '직원 번호 ' + name, '상태 잠김 · 틀린 횟수 ' + r[3] + ' · 잠긴 때 ' + r[6], who, '잠금 풀기');
    setCell_('pins', r._row, 2, '사용'); setCell_('pins', r._row, 3, 0);
    log_('잠금 풀기', '', who, name);
    return {};
  },
  pinBlock: function (req) {
    var who = owner_(req);
    var name = validName_(req.name);
    if (!name) throw new Error('이름을 확인해 주세요');
    var killed = 0, lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      var r = pinRow_(name);
      if (!r) append_('pins', [name, '', '차단', 0, now_(), 1, '']);   // 번호를 정하기 전이라도 차단 표시 (임시 열쇠 출입증도 막힘)
      else {
        keepOld_('', '직원 번호 ' + name, '상태 ' + (r[2] || '') + ' · 세대 ' + (r[5] || ''), who, '즉시 차단');
        setCell_('pins', r._row, 2, '차단'); setCell_('pins', r._row, 4, now_()); setCell_('pins', r._row, 5, Number(r[5] || 0) + 1);
      }
      killed = devKill_(name, '무효(차단)');
    } finally { SpreadsheetApp.flush(); lock.releaseLock(); }   // 검토 반영: 잠금 풀기 전에 시트에 확실히 씀
    log_('즉시 차단', '', who, name + ' · 기억 기기 ' + killed + '대 무효 · 출입증 끝');
    return { killed: killed };
  },
  pinAddName: function (req) {
    var who = owner_(req);
    ensurePinSettings_();
    var name = validName_(req.name);
    if (!name) throw new Error('이름은 한글·영문 2~10자로 넣어 주세요');
    var cur = staffNames_();
    if (cur.indexOf(name) >= 0) return { names: cur };
    var row = rows_('settings').filter(function (x) { return x[0] === '직원 이름'; })[0];
    keepOld_('', '설정 직원 이름', row[1], who, '이름 추가 ' + name);
    setCell_('settings', row._row, 1, cur.concat([name]).join(','));
    log_('직원 이름 추가', '', who, name);
    return { names: staffNames_() };
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
    return { sites: list, defStages: defStages_(), payStages: PAY_STAGES };   // v9: 새 현장 기본 공정
  },
  adminSite: function (req) {
    var who = admin_(req);
    var r = site_(req.s), b = bundle_(r[0], true, r[11], isOwnerReq_(who, req));   // v8
    setCell_('sites', r._row, 11, now_());
    var s = sitePublic_(r), x = adminExtra_(r); s.pin = x.pin; s.proj = x.proj; s.cust = x.cust;
    return { site: s, posts: b.posts, comments: b.comments, pinOn: !!x.pin, defStages: defStages_(), payStages: PAY_STAGES };   // v9
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
        var name = clean_(req.name, 60) || '홈퍼니싱 현장';   // v4: 현장명은 고객 화면에 나감 — 고객 이름·프로젝트 번호는 쓰지 않음
        var st0 = stages_(JSON.stringify(sched)).filter(function (x) { return x.a; });
        if (!st0.length) st0 = defStages_().map(function (n) { return { n: n, s: 0, a: '', b: '' }; });   // v9: '설정' 탭 기본 공정
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
    var code = newCode_(), stages = stages_(JSON.stringify(req.stages || [])), warn = [];
    if (!stages.length && (req.file || req.text)) {   // v9: 공정표 파일(xlsx·csv) 또는 붙여 넣은 표로 바로 채움
      var ps = schedFromReq_(req, req.start);
      if (ps) { stages = applySched_('[]', ps.rows); warn = ps.warn; }
    }
    var proj = (String(req.proj || '').match(/P-\d{4}-\d{3}/) || [''])[0];
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      append_('sites', [code, name, clean_(req.manager, 30), clean_(req.phone, 30), clean_(req.address, 100), day_(req.start), day_(req.end),
                        JSON.stringify(stages), '진행', '', now_(), now_(), '', '', proj ? ('인트라넷 ' + proj) : '', JSON.stringify(pays_(req.payments)), pin, clean_(req.cust, 30)]);
    } finally { lock.releaseLock(); }
    var r = site_(code); siteFolder_(r);
    log_('현장 추가', code, who, name + (proj ? ' · ' + proj : '') + (stages.length ? ' · 공정 ' + stages.length + '단계' : ''));
    return { code: code, stages: stages, warn: warn };
  },
  updateSite: function (req) {
    var who = admin_(req);
    ensureCols_('sites');
    var f = req.fields || {}, hasRev = req.rev != null && req.rev !== '';
    var pin = null;
    if (f.pin != null) { pin = pin_(f.pin); if (pin === null) throw new Error('확인 번호는 숫자 4자리로 적어 주세요'); }   // v9: 쓰기 전에 먼저 확인 (반쯤 쓰지 않게)
    // v9 검토 반영: 잠금 안에서 그 줄을 새로 읽고 고침. 화면이 rev 를 보내면 그 사이 다른 기기가 바꿨는지 확인
    var code = withSite_(req.s, function (r) {
      if (hasRev && String(req.rev) !== rev_(r)) throw new Error('다른 기기에서 바뀌었어요, 새로 고쳐 주세요');
      var map = { name: 1, manager: 2, phone: 3, address: 4, status: 8, cust: 17 };
      Object.keys(map).forEach(function (k) { if (f[k] != null) setCell_('sites', r._row, map[k], clean_(f[k], 100)); });
      if (f.start != null) setCell_('sites', r._row, 5, day_(f.start));
      if (f.end != null) setCell_('sites', r._row, 6, day_(f.end));
      if (f.stages) {
        // 옛 화면은 d(완료 날짜) 없이, 불러온 때의 상태로 보냄 → rev 가 없으면 이미 완료(s=2)인 같은 이름 공정은 상태·완료 날짜를 그대로 둠
        // (완료 되돌리기는 [되돌리기] = stageDone 으로만). 새로 완료가 되면 오늘
        var olds = stages_(r[7]), inc = (Array.isArray(f.stages) ? f.stages : []).filter(function (x) { return x && clean_(x.n, 40); }).slice(0, 30);
        var ns = JSON.stringify(applySched_(r[7], inc.map(function (x) { x = x || {}; return { n: x.n, s: x.s == null ? 0 : x.s, a: x.a, b: x.b, d: x.d }; })).map(function (x, k) {
          var src = inc[k] || {}, noD = src.d == null || src.d === '';
          var o = olds.filter(function (y) { return stKey_(y.n) === stKey_(x.n) && y.s === 2; })[0];
          if (!hasRev && o && noD) { x.s = 2; x.d = o.d; }
          if (x.s === 2 && !x.d && noD) x.d = o && o.d ? o.d : today_();
          return x;
        }));
        if (ns !== JSON.stringify(stages_(r[7]))) { keepOld_(r[0], '공정(JSON)', r[7], who, '관리 화면에서 고침'); setCell_('sites', r._row, 7, ns); }
      }
      if (f.payments) {
        var oldp = pays_(r[15]), np = pays_(f.payments);
        if (!hasRev) np.forEach(function (x) {   // 옛 화면: 이미 입금 완료인 같은 이름 결제는 완료·날짜를 그대로 (되돌리기는 payDone 으로만)
          var o = oldp.filter(function (y) { return stKey_(y.n) === stKey_(x.n) && y.paid; })[0];
          if (o) { x.paid = true; x.date = o.date || x.date; }
        });
        var pj = JSON.stringify(np);
        if (pj !== JSON.stringify(oldp)) { keepOld_(r[0], '결제(JSON)', r[15], who, '관리 화면에서 고침'); setCell_('sites', r._row, 15, pj); }
      }
      if (pin !== null) setCell_('sites', r._row, 16, pin);
      return r[0];
    });
    log_('현장 수정', code, who, Object.keys(f).join(','));
    return {};
  },
  adminPost: function (req) {
    admin_(req);
    var r = site_(req.s), text = clean_(req.text, 4000), photos = (Array.isArray(req.photos) ? req.photos : []).slice(0, 100).map(String);   // v7: 100장까지
    if (!text && !photos.length) throw new Error('내용을 적어 주세요');
    var id = id_('P');
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {   // v7: 잠금 안에서 (여러 직원이 동시에 올려도 줄이 겹치지 않게)
      append_('posts', [id, r[0], day_(req.date) || today_(), '회사', clean_(req.author, 20) || '홈퍼니싱', clean_(req.stage, 20), clean_(req.kind, 10) || '공정',
                        text, req.important ? 'Y' : '', JSON.stringify(photos), now_(), '', '']);
    } finally { lock.releaseLock(); }
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
  },

  /* ---------- v9: 공정표 · 공정 완료 · 결제 단계 ---------- */
  /* 고객·관리 공통: 공정·결제만 가볍게 다시 읽기 (고객 화면 자동 새로 고침용). 고객은 확인 번호 확인, 그 현장 것만 */
  prog: function (req) {
    var isAdmin = false;
    if (req.pw) { admin_(req); isAdmin = true; }
    var r = site_(req.s);
    if (!isAdmin) pinOk_(r, req);
    var st = stages_(r[7]);
    return { rev: rev_(r), stages: st, payments: pays_(r[15]), progress: progress_(st), status: r[8] };
  },
  /* 직원: 공정표 미리 보기 — 붙여 넣은 표(text) 또는 파일(file: xlsx·csv data URL). 시트에는 아무것도 쓰지 않음 */
  schedParse: function (req) {
    admin_(req);
    var start = day_(req.start);
    if (!start && req.s) { try { start = day_(site_(req.s)[5]); } catch (x) {} }
    var p = schedFromReq_(req, start);
    if (!p) throw new Error('붙여 넣은 표나 파일이 없어요');
    return { rows: p.rows, warn: p.warn, from: p.from };
  },
  /* 직원: 기존 현장 공정표 추가/수정 — stages:[{n,a,b}] (화면에서 고친 목록이 기준) 또는 text/file.
     같은 이름 공정의 진행 상태·완료 날짜는 이어받음. 바꾸기 전 값은 '옛 값' 탭에 */
  schedSave: function (req) {
    var who = admin_(req);
    var res = withSite_(req.s, function (r) {
      var plan = Array.isArray(req.stages) ? req.stages.slice(0, 30) : null, warn = [];
      if (!plan) {
        var p = schedFromReq_(req, r[5]);
        if (!p) throw new Error('공정표가 비어 있어요');
        plan = p.rows; warn = p.warn;
      }
      plan = plan.map(function (x) { x = x || {}; return { n: x.n, a: day_(x.a) || parseDay_(x.a), b: day_(x.b) || parseDay_(x.b) }; });
      var out = applySched_(r[7], plan);
      if (!out.length) throw new Error('공정이 하나도 없어요');
      var nj = JSON.stringify(out), same = nj === JSON.stringify(stages_(r[7]));
      if (!same) { keepOld_(r[0], '공정(JSON)', r[7], who, '공정표 추가/수정'); setCell_('sites', r._row, 7, nj); }
      return { code: r[0], stages: out, warn: warn, same: same };
    });
    if (!res.same) log_('공정표 수정', res.code, who, res.stages.length + '단계');
    return { stages: res.stages, warn: res.warn, progress: progress_(res.stages), same: res.same };
  },
  /* 직원: [완료] — 공정 하나 완료 (완료 날짜 date, 없으면 오늘). undo:true 면 되돌림 (완료 날짜 지움, 진행 중/대기로) */
  stageDone: function (req) {
    var who = admin_(req), undo = req.undo === true, day = undo ? '' : reqDay_(req.date);
    var res = withSite_(req.s, function (r) {
      var st = stages_(r[7]), i = findIdx_(st, req);
      if (i < 0) throw new Error('공정을 찾을 수 없어요 (화면을 새로 고쳐 주세요)');
      var x = st[i];
      if (undo) { if (x.s !== 2 && !x.d) return { code: r[0], st: st, x: x, same: true }; x.s = x.a && x.a <= today_() ? 1 : 0; x.d = ''; }
      else { if (x.s === 2 && x.d === day) return { code: r[0], st: st, x: x, same: true }; x.s = 2; x.d = day; }
      setCell_('sites', r._row, 7, JSON.stringify(st));
      return { code: r[0], st: st, x: x };
    });
    if (!res.same) { mark_(res.code, '공정', res.x.n, undo ? '완료 되돌림' : '완료', day, who); log_(undo ? '공정 완료 되돌림' : '공정 완료', res.code, who, res.x.n + (day ? ' ' + day : '')); }
    return { stages: res.st, progress: progress_(res.st), same: !!res.same };
  },
  /* 직원: [입금 완료] — 결제 단계 n(계약금·중도금·잔금 등, 또는 번호 i). date 없으면 오늘. undo:true 면 되돌림.
     결제 줄이 없고 이름이 계약금·중도금·잔금이면 새 줄로 만듦 (amt·due 를 같이 보내면 그 값으로) */
  payDone: function (req) {
    var who = admin_(req), undo = req.undo === true, day = undo ? '' : reqDay_(req.date);
    var res = withSite_(req.s, function (r) {
      var ps = pays_(r[15]), i = findIdx_(ps, req), n = clean_(req.n, 20);
      if (i < 0) {
        if (undo || PAY_STAGES.indexOf(n) < 0) throw new Error('결제 단계를 찾을 수 없어요 (화면을 새로 고쳐 주세요)');
        ps = pays_(ps.concat([{ n: n, amt: req.amt, due: req.due }]));
        ps.sort(function (a, b) { var ia = PAY_STAGES.indexOf(a.n), ib = PAY_STAGES.indexOf(b.n); return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib); });
        i = findIdx_(ps, { n: n });
      }
      var x = ps[i];
      if (undo) { if (!x.paid && !x.date) return { code: r[0], ps: ps, x: x, same: true }; x.paid = false; x.date = ''; }
      else { if (x.paid && x.date === day) return { code: r[0], ps: ps, x: x, same: true }; x.paid = true; x.date = day; }
      ensureCols_('sites');
      setCell_('sites', r._row, 15, JSON.stringify(ps));
      return { code: r[0], ps: ps, x: x };
    });
    if (!res.same) { mark_(res.code, '결제', res.x.n, undo ? '입금 되돌림' : '입금 완료', day, who); log_(undo ? '입금 되돌림' : '입금 완료', res.code, who, res.x.n + (day ? ' ' + day : '')); }
    return { payments: res.ps, same: !!res.same };
  }
};

/* 처음 한 번: 시트 탭·설정·사진 폴더 만들기 (편집기에서 실행 ▶) — v1로 바꾼 뒤에도 한 번 실행하면 새 칸 머리글이 생김 */
function setup() {
  Object.keys(TAB).forEach(sheet_);
  ensureCols_('sites');
  ensureCols_('photos');  // v7: 숨김 · 원본ID · 촬영 시각 머리글 (관리 비밀번호는 시트에 만들지 않음 — 스크립트 속성 ADMIN_PW)
  ensurePinSettings_();   // v5: '직원 이름' 줄
  ensureSchedSettings_(); // v9: '기본 공정' 줄 (있으면 그대로) · '공정·결제 기록' 탭은 위 TAB 에서 (있으면 그대로)
  if (!rows_('settings').some(function (x) { return x[0] === '현장 원본 폴더ID'; })) append_('settings', ['현장 원본 폴더ID', '', 'v7: 사진 원본이 갈 공유 드라이브 폴더 ID (그 안에 현장명_고객명 폴더가 생김). 비우면 사진 폴더 안에']);
  salt_(true);            // v5: PIN_SALT 가 없으면 무작위로 만듦 (있으면 그대로)
  if (!setting_('사진 폴더ID')) append_('settings', ['사진 폴더ID', root_().getId(), '현장별 폴더가 이 안에 생김']);
  seedTest_();
  rows_('sites').forEach(function (r) { siteFolder_(r); });
  log_('설치', '', '관리', '탭·설정·시험 현장 준비 (v9 · 공정 완료 날짜·입금 완료·공정·결제 기록 탭)');
  importProjects();   // v6: '인트라넷 가져오기' 탭 (없거나 비면 아무것도 안 함)
}

/* v6: '인트라넷 가져오기' 탭 → 현장 일괄 등록 (projSite 와 같은 규칙). 편집기에서 실행 ▶ 해도 됨. 행·칸은 지우지 않음 */
var IMPORT_TAB = '인트라넷 가져오기';
var IMPORT_COLS = ['프로젝트 번호', '현장명', '고객 이름', '담당', '착공일', '준공예정일', '확인 번호(뒷4)', '공정(JSON)', '처리'];
function impDay_(v) {   // 시트 날짜 표시(2026. 11. 5 · 2026/11/05 · 2026-11-05) → yyyy-MM-dd
  var m = String(v == null ? '' : v).match(/(\d{4})\D{1,3}(\d{1,2})\D{1,3}(\d{1,2})/);
  return m ? day_(m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2)) : '';
}
function impPin_(v) {   // 숫자 칸이라 앞의 0이 빠진 경우(123 → 0123)만 채움. 그 밖은 숫자 4자리일 때만
  var t = String(v == null ? '' : v).trim();
  if (/^\d{1,3}$/.test(t)) t = ('000' + t).slice(-4);
  var p = pin_(t);
  return p === null ? '' : p;
}
function importProjects() {
  var sh = ss_().getSheetByName(IMPORT_TAB);
  if (!sh) return { ok: true, made: 0, exist: 0, err: 0, note: '탭 없음' };
  var n = sh.getLastRow();
  if (n < 2) return { ok: true, made: 0, exist: 0, err: 0, note: '빈 탭' };
  ensureCols_('sites');
  var data = sh.getRange(2, 1, n - 1, IMPORT_COLS.length).getDisplayValues();
  var who = '가져오기', made = 0, exist = 0, err = 0, newRows = [];
  var mark = function (i, t) { sh.getRange(i + 2, IMPORT_COLS.length).setNumberFormat('@').setValue(String(t)); };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {   // projSite 처럼 찾기·만들기를 한 잠금 안에서 → 같은 번호 줄이 여러 번 있어도 현장은 하나
    data.forEach(function (d, i) {
      if (String(d[8] || '').trim()) return;                                    // 처리 칸이 찬 줄은 건너뜀
      if (!d.slice(0, 8).join('').trim()) return;                               // 완전히 빈 줄
      var proj = String(d[0] || '').trim();
      if (!/^P-\d{4}-\d{3}$/.test(proj)) { mark(i, '오류: 프로젝트 번호 모양 (P-YYMM-NNN)'); err++; return; }
      var sched = [], sj = String(d[7] || '').trim();
      if (sj) {
        try { sched = JSON.parse(sj); } catch (x) { mark(i, '오류: 공정(JSON) 모양'); err++; return; }
        if (!Array.isArray(sched)) { mark(i, '오류: 공정(JSON) 모양'); err++; return; }
        sched = sched.slice(0, 30).map(function (x) { x = x || {}; return { n: x.n, a: impDay_(x.a), b: impDay_(x.b) }; });
      }
      var cust = clean_(d[2], 30);
      var r = rows_('sites').filter(function (x) { return x[13] !== 'Y' && projOf_(x) === proj; })[0] || null;
      if (!r) {
        var name = clean_(d[1], 60) || '홈퍼니싱 현장';   // 현장명은 고객 화면에 나감 — 고객 이름·프로젝트 번호는 쓰지 않음
        var st0 = stages_(JSON.stringify(sched)).filter(function (x) { return x.a; });
        if (!st0.length) st0 = defStages_().map(function (k) { return { n: k, s: 0, a: '', b: '' }; });   // v9
        else st0 = st0.map(function (x) { return { n: x.n, s: 0, a: x.a, b: x.b || x.a }; });
        var pin = impPin_(d[6]), nc = newCode_();
        append_('sites', [nc, name, clean_(d[3], 30), '', '', impDay_(d[4]), impDay_(d[5]),
                          JSON.stringify(st0), '진행', '', now_(), now_(), '', '', '인트라넷 ' + proj, '[]', pin, cust]);
        mark(i, '등록됨 ' + nc);
        newRows.push([nc, name, proj, pin]);
        made++;
      } else {
        var nj = mergeSched_(r[7], sched), tag = '';
        if (nj) { keepOld_(r[0], '공정(JSON)', r[7], who, '인트라넷 가져오기로 맞춤 ' + proj); setCell_('sites', r._row, 7, nj); tag += ' · 공정 맞춤'; }
        if (!String(r[17] || '') && cust) { setCell_('sites', r._row, 17, cust); tag += ' · 고객 이름 채움'; }   // 빈 칸만 채움
        mark(i, '이미 있음 ' + r[0] + tag);
        if (tag) log_('인트라넷 맞춤', r[0], who, proj + tag);
        exist++;
      }
    });
  } finally { lock.releaseLock(); }
  newRows.forEach(function (x) {
    var r = rows_('sites').filter(function (y) { return y[0] === x[0]; })[0];
    try { if (r) siteFolder_(r); } catch (e) {}
    log_('현장 자동 생성', x[0], who, x[1] + ' · ' + x[2] + (x[3] ? ' · 확인 번호 있음' : ' · 확인 번호 없음'));
  });
  if (made || exist || err) log_('인트라넷 가져오기', '', who, '새로 ' + made + ' · 이미 있음 ' + exist + ' · 오류 ' + err);
  return { ok: true, made: made, exist: exist, err: err };
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
