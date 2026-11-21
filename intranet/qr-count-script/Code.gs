/**
 * QR 방문 집계 (홈퍼니싱 공사 안내문 QR) — 구글 Apps Script 웹앱
 * 만든 날: 2026-11-21 · 인트라넷 v0.99-42 와 한 묶음
 *
 * 하는 일
 *  - 고객 안내 페이지(event/index.html)가 보내는 '현장 코드(c) + 버튼 종류(b)' 를 받아
 *    시트 '기록' 에 [날짜, 현장 코드, 버튼] 한 줄을 더하고,
 *    드라이브 파일 hf_qr_count.json (현장별 합계) 를 고친다.
 *  - 인트라넷 대표 화면이 hf_qr_count.json 을 읽어 '서식 자료실 › QR 유입 현황' 에 보여 준다.
 *
 * 받지 않는 것: 이름, 전화번호, 주소, 적은 내용, 접속 주소(IP), 기기 정보 — 저장하지 않는다.
 * 날짜는 '일' 까지만 (시각은 남기지 않음).
 *
 * 설치: 같은 폴더의 'QR 방문 집계 설치 안내 2026-11-21 v0.md' 를 따라 한다.
 */
var SHEET_LOG = '기록';
var FILE_NAME = 'hf_qr_count.json';          // 인트라넷이 이 이름으로 찾는다 — 바꾸지 말 것
var BOOK_NAME = 'QR 방문 집계 2026-11-21 v0';
var KINDS = ['visit', 'est', 'consult', 'about', 'sms', 'call'];
var DAY_LIMIT = 3000;                          // 하루에 받는 최대 줄 수 (장난·오류로 넘치는 것 막기)

function doGet(e) { return hit_(e); }
function doPost(e) { return hit_(e); }

function out_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }

function hit_(e) {
  var p = (e && e.parameter) || {};
  var c = String(p.c || '').toUpperCase();
  var b = String(p.b || '');
  if (!/^[A-Z0-9]{1,16}$/.test(c) || KINDS.indexOf(b) < 0) return out_('no');
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (err) { return out_('busy'); }
  try {
    var props = PropertiesService.getScriptProperties();
    var day = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    var n = props.getProperty('day') === day ? Number(props.getProperty('n') || 0) : 0;
    if (n >= DAY_LIMIT) return out_('full');
    props.setProperties({ day: day, n: String(n + 1) });
    book_().getSheetByName(SHEET_LOG).appendRow([day, c, b]);
    var f = file_();
    var j = read_(f);
    if (!j.codes[c]) j.codes[c] = {};
    j.codes[c][b] = (Number(j.codes[c][b]) || 0) + 1;
    j.at = new Date().toISOString();
    f.setContent(JSON.stringify(j));
  } finally { lock.releaseLock(); }
  return out_('ok');
}

/** 처음 한 번 실행: 시트와 집계 파일을 만든다 (이미 있으면 그대로 둔다). */
function setup() {
  var b = book_();
  var f = file_();
  Logger.log('기록 시트: ' + b.getUrl());
  Logger.log('집계 파일(' + FILE_NAME + '): ' + f.getUrl());
}

/** 집계 파일이 이상해졌을 때: '기록' 시트 전체를 다시 세어 집계 파일을 새로 쓴다. 기록 시트는 건드리지 않는다. */
function rebuild() {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = book_().getSheetByName(SHEET_LOG);
    var last = sh.getLastRow();
    var rows = last > 1 ? sh.getRange(2, 1, last - 1, 3).getValues() : [];
    var j = { v: 1, at: new Date().toISOString(), codes: {} };
    rows.forEach(function (r) {
      var c = String(r[1] || '').toUpperCase(), b = String(r[2] || '');
      if (!/^[A-Z0-9]{1,16}$/.test(c) || KINDS.indexOf(b) < 0) return;
      if (!j.codes[c]) j.codes[c] = {};
      j.codes[c][b] = (j.codes[c][b] || 0) + 1;
    });
    file_().setContent(JSON.stringify(j));
    Logger.log('다시 셈: ' + rows.length + '줄');
  } finally { lock.releaseLock(); }
}

function book_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('bookId');
  var b = null;
  if (id) { try { b = SpreadsheetApp.openById(id); } catch (err) { b = null; } }
  if (!b) {
    b = SpreadsheetApp.create(BOOK_NAME);
    props.setProperty('bookId', b.getId());
  }
  var sh = b.getSheetByName(SHEET_LOG);
  if (!sh) {
    sh = b.getSheets()[0];
    sh.setName(SHEET_LOG);
    sh.getRange(1, 1, 1, 3).setValues([['날짜', '현장 코드', '버튼']]);
    sh.setFrozenRows(1);
  }
  return b;
}

function file_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('fileId');
  var f = null;
  if (id) { try { f = DriveApp.getFileById(id); if (f.isTrashed()) f = null; } catch (err) { f = null; } }
  if (!f) {
    f = DriveApp.createFile(FILE_NAME, JSON.stringify({ v: 1, at: new Date().toISOString(), codes: {} }), 'application/json');
    props.setProperty('fileId', f.getId());
  }
  return f;
}

function read_(f) {
  var j = null;
  try { j = JSON.parse(f.getBlob().getDataAsString()); } catch (err) { j = null; }
  if (!j || typeof j !== 'object' || !j.codes || typeof j.codes !== 'object') j = { v: 1, at: '', codes: {} };
  return j;
}
