/**
 * 현장소통 (고객 현장 페이지) 서버 — Google Apps Script 웹앱
 * 화면: https://soo-cpu.github.io/card/field/
 * 저장: 이 스크립트가 붙은 구글 시트(글·공정·댓글) + 드라이브 현장별 폴더(사진, 월별 하위 폴더)
 * 원본 데이터는 지우지 않는다: 숨기기만 하고, 시트 행은 남긴다.
 */

var TAB = {
  sites:    ['현장', ['코드','현장명','담당자','연락처','주소','착공일','준공예정일','공정(JSON)','상태','폴더ID','만든 시각','관리자 확인 시각','고객 최근 글','숨김','메모']],
  posts:    ['글',   ['글ID','현장코드','날짜','작성(회사/고객)','이름','공정','종류','내용','중요','사진ID(JSON)','작성 시각','숨김','고친 시각']],
  comments: ['댓글', ['댓글ID','현장코드','글ID','작성(회사/고객)','이름','내용','작성 시각','숨김']],
  photos:   ['사진', ['파일ID','현장코드','올린 시각','작성(회사/고객)','파일 이름']],
  pdfs:     ['PDF',  ['파일ID','현장코드','파일 이름','만든 시각']],
  settings: ['설정', ['항목','값','설명']],
  log:      ['기록', ['시각','동작','현장코드','누가','내용']]
};
var INIT_PW = '';   // 비워 둠(저장소 공개). 설치 때 대표 드라이브 '현장소통 첫 비밀번호.txt'를 읽고, 없으면 무작위.
var SHEET_ID = '1Mx45YBU5_Dy7a9i9pAn89VLA40PRJdMGAHTvmc0zpHI';   // 현장소통 데이터 2026-11-06 v0
var PHOTO_ROOT_ID = '1d2JMn10YKoZv9Ymjib1V9Fh5mictFqGL';          // 현장소통 사진·기록
var TEST_CODE = 'WI7ijOiMEPHIOf4vjkqEPmG2';
var TEST_FOLDER_ID = '1lw72he2le5Y8tumh8wdacHqucWWiJhcs';
var SAMPLE_URL = 'https://soo-cpu.github.io/card/field/sample/s';
var ROOT_NAME = '현장소통 사진·기록';

function doGet(e) {
  return out_({ ok: true, msg: '현장소통 서버 동작 중' });
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
function clean_(s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, n || 2000).trim(); }

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
function admin_(req) {
  ensureSettings_();
  var cache = CacheService.getScriptCache(), fails = Number(cache.get('pwfail') || 0);
  if (fails >= 10) throw new Error('비밀번호를 여러 번 틀려 15분 동안 잠겼어요');
  if (!req.pw || String(req.pw) !== String(setting_('관리 비밀번호'))) {
    cache.put('pwfail', String(fails + 1), 900);
    throw new Error('비밀번호가 맞지 않아요');
  }
}
function site_(code) {
  if (!code || String(code).length < 20) throw new Error('주소를 확인해 주세요');
  var r = rows_('sites').filter(function (x) { return x[0] === String(code); })[0];
  if (!r || r[13] === 'Y') throw new Error('주소를 확인해 주세요');
  return r;
}
function sitePublic_(r) {
  var stages = [];
  try { stages = JSON.parse(r[7] || '[]'); } catch (x) {}
  return { code: r[0], name: r[1], manager: r[2], phone: r[3], address: r[4], start: r[5], end: r[6], stages: stages, status: r[8] };
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

var ACTIONS = {
  /* 고객·관리 공통 */
  site: function (req) {
    var r = site_(req.s), b = bundle_(r[0], false);
    return { site: sitePublic_(r), posts: b.posts, comments: b.comments };
  },
  photo: function (req) {
    var r = site_(req.s), ids = (req.ids || []).slice(0, 6), mine = {};
    rows_('photos').forEach(function (p) { if (p[1] === r[0]) mine[p[0]] = 1; });
    var res = {};
    ids.forEach(function (id) {
      if (!mine[id]) return;
      try {
        var b = DriveApp.getFileById(id).getBlob();
        res[id] = 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
      } catch (x) {}
    });
    return { photos: res };
  },
  upload: function (req) {
    var isAdmin = false;
    if (req.pw) { admin_(req); isAdmin = true; }
    var r = site_(req.s);
    if (!isAdmin) rate_(r[0], 'up', 80);
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
    var r = site_(req.s); rate_(r[0], 'post', 40);
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
    if (!isAdmin) rate_(r[0], 'cmt', 60);
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
      return s;
    });
    return { sites: list };
  },
  adminSite: function (req) {
    admin_(req);
    var r = site_(req.s), b = bundle_(r[0], true, r[11]);
    setCell_('sites', r._row, 11, now_());
    return { site: sitePublic_(r), posts: b.posts, comments: b.comments };
  },
  addSite: function (req) {
    admin_(req);
    var name = clean_(req.name, 60);
    if (!name) throw new Error('현장 이름을 적어 주세요');
    var code = newCode_(), stages = (req.stages || []).slice(0, 30).map(function (s) { return { n: clean_(s.n || s, 20), s: Number(s.s || 0) }; });
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      append_('sites', [code, name, clean_(req.manager, 30), clean_(req.phone, 30), clean_(req.address, 100), clean_(req.start, 10), clean_(req.end, 10),
                        JSON.stringify(stages), '진행', '', now_(), now_(), '', '', '']);
    } finally { lock.releaseLock(); }
    var r = site_(code); siteFolder_(r);
    log_('현장 추가', code, '관리', name);
    return { code: code };
  },
  updateSite: function (req) {
    admin_(req);
    var r = site_(req.s), f = req.fields || {};
    var map = { name: 1, manager: 2, phone: 3, address: 4, start: 5, end: 6, status: 8 };
    Object.keys(map).forEach(function (k) { if (f[k] != null) setCell_('sites', r._row, map[k], clean_(f[k], 100)); });
    if (f.stages) setCell_('sites', r._row, 7, JSON.stringify(f.stages.slice(0, 30).map(function (s) { return { n: clean_(s.n, 20), s: Number(s.s || 0) }; })));
    log_('현장 수정', r[0], '관리', Object.keys(f).join(','));
    return {};
  },
  adminPost: function (req) {
    admin_(req);
    var r = site_(req.s), text = clean_(req.text, 4000), photos = (req.photos || []).slice(0, 30).map(String);
    if (!text && !photos.length) throw new Error('내용을 적어 주세요');
    var id = id_('P');
    append_('posts', [id, r[0], clean_(req.date, 10) || today_(), '회사', clean_(req.author, 20) || '홈퍼니싱', clean_(req.stage, 20), clean_(req.kind, 10) || '공정',
                      text, req.important ? 'Y' : '', JSON.stringify(photos), now_(), '', '']);
    return { id: id };
  },
  editPost: function (req) {
    admin_(req);
    var r = site_(req.s);
    var p = rows_('posts').filter(function (x) { return x[0] === req.id && x[1] === r[0]; })[0];
    if (!p) throw new Error('글을 찾을 수 없어요');
    if (req.important != null) setCell_('posts', p._row, 8, req.important ? 'Y' : '');
    if (req.hidden != null) setCell_('posts', p._row, 11, req.hidden ? 'Y' : '');
    if (req.text != null) { log_('글 수정 전 내용', r[0], '관리', p[7]); setCell_('posts', p._row, 7, clean_(req.text, 4000)); }
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
    admin_(req);
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
    log_('PDF 저장', r[0], '관리', name);
    return { name: name, url: f.getUrl() };
  },
  folder: function (req) {
    admin_(req);
    return { url: siteFolder_(site_(req.s)).getUrl() };
  }
};

/* 처음 한 번: 시트 탭·설정·사진 폴더 만들기 (편집기에서 실행 ▶) */
function setup() {
  Object.keys(TAB).forEach(sheet_);
  ensureSettings_();
  if (!setting_('사진 폴더ID')) append_('settings', ['사진 폴더ID', root_().getId(), '현장별 폴더가 이 안에 생김']);
  seedTest_();
  rows_('sites').forEach(function (r) { siteFolder_(r); });
  log_('설치', '', '관리', '탭·설정·시험 현장 준비');
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
  append_('sites', [code, '시험 현장(대표 확인용)', '정진혁 실장', '1566-5904', '서울 (예시 주소)', '2026-11-03', '2026-11-20', JSON.stringify(stages), '진행', folder.getId(), '2026-11-03 08:00:00', '2026-11-05 18:00:00', '2026-11-05 20:12:00', '', '대표 확인용 시험 현장. 고객에게 보내지 않음']);
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
