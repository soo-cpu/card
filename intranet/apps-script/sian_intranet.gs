/**
 * 간편견적 Apps Script 덧붙이기 — '인트라넷 시안' (대표 지시 2026-11-13 18번 · A안 · 2026-11-14)
 *
 * 무엇: 인트라넷 프로젝트 화면에서 고른 도면·현장 사진(드라이브 파일)과 스타일·공간·요청 글로
 *       구글 Gemini 이미지 모델이 시안을 그리고, 드라이브 현장 폴더(프로젝트 폴더 › 시안 이미지)에
 *       '시안 P-YYMM-NNN YYYY-MM-DD vN.png' 이름으로 저장한다. 인트라넷 '③ 결과 불러오기'가 드라이브에서 받아 붙인다.
 *
 * 붙이는 법: 간편견적 Apps Script 프로젝트에 '파일 + → 스크립트'로 이 파일을 새로 만들어 통째로 붙여넣는다.
 *           기존 코드는 고치지 않는다. 단 두 곳에 한 줄씩만 더한다 (설치 안내 문서 참고):
 *             doGet  맨 앞:  if (p.a === 'isian') return isianDoGet_(e);
 *             doPost try 안 d = JSON.parse(...) 바로 다음:  if (d.action === 'isian') return isianJson_(isianRun_(d));
 *
 * 비밀: 코드에 비밀값 없음. 스크립트 속성에서만 읽는다.
 *   GEMINI_API_KEY  (이미 있음 · 손님 시안과 같이 씀)
 *   IMG_TOKEN       (새로 · 아무 긴 글자 40자 이상 · 인트라넷 대표 설정에도 같은 값)
 *   선택: ISIAN_DAY_MAX(전체 하루, 기본 30) · ISIAN_PROJ_MAX(프로젝트 하루, 기본 10) · ISIAN_USER_MAX(사람 하루, 기본 15)
 *         ISIAN_MODEL(모델 고정 · 비우면 기존 sianModel_ 자동 선택) · ISIAN_ROOT(인트라넷 첨부 폴더 ID)
 *
 * 인증: 인트라넷은 토큰을 직원에게 주지 않는다. 대표 화면이 날짜별 '입장권'
 *       = HMAC-SHA256(IMG_TOKEN, 'isian|' + 사용자ID + '|' + YYYY-MM-DD) 앞 32자(16진수)를 만들어
 *       그 직원 칸(acct/{직원}/img/t, 본인·대표만 읽음)에 넣는다. 서버는 오늘(서울) 날짜 입장권만 받는다.
 *
 * 한도: 손님 시안('sian:' 카운터)과 따로 'isian:YYYY-MM-DD' 카운터. 실패한 장은 되돌린다. 같은 요청 ID는 한 번만.
 *
 * Gemini 요청 형식: 기존 간편견적 v12 sianGen_ 과 같은 방식(v1beta models/{model}:generateContent ·
 *   contents[].parts[] 에 text + inline_data{mime_type,data} · generationConfig.responseModalities ['TEXT','IMAGE'] ·
 *   imageConfig.aspectRatio '4:3', 400이면 비율 빼고 다시 · 응답 candidates[0].content.parts[].inlineData).
 *   [확인 필요] 공식 문서(ai.google.dev)는 작업 세션 네트워크에서 열리지 않아 직접 확인 못 함. 입력 이미지 장수·크기 한도도 확인 필요
 *   (2026-11-14 웹 검색 · 2차 자료(Firebase AI Logic·LiteLLM 등): generateContent + responseModalities TEXT/IMAGE +
 *    generationConfig.imageConfig.aspectRatio '4:3' 형식은 같음 · 새 모델 이름 gemini-3.1-flash-image-preview 등은 sianModel_ 자동 목록이 고름)
 *   (여기서는 보수적으로 4장 · 장당 4MB · 합계 12MB).
 */
var ISIAN_MAX_IMG = 4;
var ISIAN_MAX_BYTES = 4 * 1024 * 1024;
var ISIAN_MAX_TOTAL = 12 * 1024 * 1024;
var ISIAN_ATT_ROOT = '1P0Rh3vBB1ApsUcpVXZsDrzr1mdVUWOor';   // 현장 공유드라이브 › 인트라넷 첨부 (인트라넷 ATT_ROOT 와 같음)
var ISIAN_USD = 0.039;                                       // 한 장 대략 비용 (확인 필요 · 기록용)
var ISIAN_GEM_BASE = 'https://generativelanguage.googleapis.com/v1beta/';
var ISIAN_LOG_TAB = '인트라넷 시안';

function isianProp_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function isianNum_(k, d) { var v = parseInt(isianProp_(k), 10); return v > 0 ? v : d; }
function isianDay_(d) { return Utilities.formatDate(d || new Date(), 'Asia/Seoul', 'yyyy-MM-dd'); }
function isianClean_(s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n); }
function isianEsc_(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function isianJson_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function isianErr_(code, msg) { var e = new Error(msg); e.code = code; return e; }

/* 입장권: HMAC-SHA256(IMG_TOKEN, 'isian|uid|day') 16진수 앞 32자 — 인트라넷 gemTicket() 과 같은 계산 */
function isianTicket_(uid, day) {
  var tok = isianProp_('IMG_TOKEN');
  if (!tok) return '';
  var sig = Utilities.computeHmacSha256Signature('isian|' + uid + '|' + day, tok, Utilities.Charset.UTF_8);
  return sig.map(function (b) { var v = (b < 0 ? b + 256 : b).toString(16); return v.length < 2 ? '0' + v : v; }).join('').slice(0, 32);
}
function isianSame_(a, b) { // 글자 수가 같을 때 끝까지 비교 (시간 차이로 맞히기 어렵게)
  a = String(a || ''); b = String(b || '');
  if (!a || a.length !== b.length) return false;
  var x = 0; for (var i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

/* 하루 한도 (손님 'sian:' 과 따로). 기존 sianCount_ 가 'sian:' 으로 시작하는 지난 날 키만 지우므로 'isian:' 은 건드리지 않음 */
function isianCount_(day, pno, uid, rid) {
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var P = PropertiesService.getScriptProperties(), key = 'isian:' + day;
    Object.keys(P.getProperties()).forEach(function (k) { if (k.indexOf('isian:') === 0 && k !== key) P.deleteProperty(k); });
    var o = JSON.parse(P.getProperty(key) || '{"t":0,"p":{},"u":{},"r":[]}');
    o.p = o.p || {}; o.u = o.u || {}; o.r = o.r || [];
    if (o.r.indexOf(rid) >= 0) return { ok: false, code: 'dup', error: '이미 보낸 요청이에요 (인트라넷에서 ‘다시 준비’를 눌러 주세요)' };
    var tMax = isianNum_('ISIAN_DAY_MAX', 30), pMax = isianNum_('ISIAN_PROJ_MAX', 10), uMax = isianNum_('ISIAN_USER_MAX', 15);
    if (o.t >= tMax) return { ok: false, code: 'limit_total', error: '오늘 인트라넷 시안 ' + tMax + '장을 다 만들었어요 (내일 다시)' };
    if ((o.p[pno] || 0) >= pMax) return { ok: false, code: 'limit_project', error: '이 프로젝트는 오늘 ' + pMax + '장을 다 만들었어요 (내일 다시)' };
    if ((o.u[uid] || 0) >= uMax) return { ok: false, code: 'limit_user', error: '오늘 내 시안 ' + uMax + '장을 다 만들었어요 (내일 다시)' };
    o.t++; o.p[pno] = (o.p[pno] || 0) + 1; o.u[uid] = (o.u[uid] || 0) + 1; o.r.push(rid); o.r = o.r.slice(-200);
    P.setProperty(key, JSON.stringify(o));
    return { ok: true, total: o.t, proj: o.p[pno], user: o.u[uid], left: pMax - o.p[pno] };
  } finally { lock.releaseLock(); }
}
function isianRefund_(day, pno, uid) { // 실패한 장은 되돌림 (요청 ID 는 남겨 같은 요청을 두 번 못 보내게)
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var P = PropertiesService.getScriptProperties(), key = 'isian:' + day, o = JSON.parse(P.getProperty(key) || 'null');
    if (!o) return;
    o.t = Math.max(0, (o.t || 0) - 1);
    if (o.p && o.p[pno] > 0) o.p[pno]--;
    if (o.u && o.u[uid] > 0) o.u[uid]--;
    P.setProperty(key, JSON.stringify(o));
  } finally { lock.releaseLock(); }
}

/* 폴더: 인트라넷이 보낸 프로젝트 폴더 ID(첨부 폴더 안에 있을 때만) → 없으면 첨부 폴더에서 'P-…' 로 시작하는 폴더 → 없으면 새로 */
function isianRoot_() { return DriveApp.getFolderById(isianProp_('ISIAN_ROOT') || ISIAN_ATT_ROOT); }
function isianUnder_(item, rootId, depth) { // item(파일·폴더)이 rootId 폴더 안(depth 단계까지)에 있나
  var cur = [item];
  for (var d = 0; d < depth; d++) {
    var next = [];
    for (var i = 0; i < cur.length; i++) {
      var it = cur[i].getParents();
      while (it.hasNext()) { var f = it.next(); if (f.getId() === rootId) return true; next.push(f); }
    }
    if (!next.length) return false; cur = next;
  }
  return false;
}
function isianProjFolder_(pno, title, fid) {
  var root = isianRoot_();
  if (fid) {
    try { var f0 = DriveApp.getFolderById(fid); if (f0.getId() === root.getId() || isianUnder_(f0, root.getId(), 3)) return f0; } catch (x) {}
  }
  var it = root.getFolders();
  while (it.hasNext()) { var f = it.next(); if (f.getName().indexOf(pno) === 0) return f; }
  return root.createFolder((pno + ' ' + (title || '')).trim());
}
function isianSub_(f, name) { var it = f.getFoldersByName(name); return it.hasNext() ? it.next() : f.createFolder(name); }
/* 이름: 시안 P-YYMM-NNN YYYY-MM-DD vN.png · N 은 그 폴더의 같은 프로젝트 시안 중 가장 큰 번호 + 1 (v0 부터) · 같은 이름이 있으면 다음 번호 */
function isianName_(dir, pno, day) {
  var n = 0, it = dir.getFiles(), re = new RegExp('^시안 ' + pno.replace(/[-]/g, '\\-') + ' .*\\bv(\\d+)\\b');
  while (it.hasNext()) { var m = re.exec(it.next().getName()); if (m) n = Math.max(n, Number(m[1]) + 1); }
  var name = '시안 ' + pno + ' ' + day + ' v' + n + '.png';
  while (dir.getFilesByName(name).hasNext()) { n++; name = '시안 ' + pno + ' ' + day + ' v' + n + '.png'; }
  return name;
}

/* 입력 이미지: 드라이브 파일 ID (최대 4장). 프로젝트 폴더 안 파일만 · jpeg/png/webp · 장당 4MB */
function isianInputs_(ids, kinds, folder) {
  var out = [], total = 0;
  ids = String(ids || '').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return /^[\w-]{10,80}$/.test(s); }).slice(0, ISIAN_MAX_IMG);
  kinds = String(kinds || '').split(',');
  for (var i = 0; i < ids.length; i++) {
    var f;
    try { f = DriveApp.getFileById(ids[i]); } catch (x) { throw isianErr_('img_missing', (i + 1) + '번째 사진을 드라이브에서 찾지 못했어요'); }
    if (!isianUnder_(f, folder.getId(), 3)) throw isianErr_('img_outside', (i + 1) + '번째 사진이 이 프로젝트 폴더 밖에 있어요 (인트라넷에서 다시 골라 주세요)');
    var mime = f.getMimeType();
    if (!/^image\/(jpeg|png|webp)$/.test(mime)) throw isianErr_('img_type', (i + 1) + '번째 파일은 사진(jpg·png·webp)이 아니에요 · PDF 도면은 사진·화면 캡처로 올려 주세요');
    var size = f.getSize();
    if (size > ISIAN_MAX_BYTES) throw isianErr_('img_big', (i + 1) + '번째 사진이 4MB보다 커요 (인트라넷에서 줄여 다시 올려 주세요)');
    total += size;
    if (total > ISIAN_MAX_TOTAL) throw isianErr_('img_big', '사진 합계가 12MB보다 커요 (장수를 줄여 주세요)');
    out.push({ id: ids[i], kind: kinds[i] === 'p' ? 'p' : 's', mime: mime, b64: Utilities.base64Encode(f.getBlob().getBytes()) });
  }
  return out;
}

var ISIAN_EN = {
  space: { '거실': 'living room', '주방': 'kitchen with dining area', '침실': 'master bedroom', '아이방': "child's bedroom", '욕실': 'bathroom',
    '현관': 'entrance hallway', '드레스룸': 'walk-in closet dressing room', '서재': 'home study' },
  style: { '내추럴': 'natural style with warm wood and soft linen textures', '모던': 'modern style with clean lines and a neutral palette',
    '클래식': 'modern classic style with subtle wall panel moldings', '북유럽': 'Scandinavian style, bright, airy and cozy',
    '미니멀': 'minimal style, clutter-free with hidden storage', '호텔식': 'luxury hotel style with indirect lighting',
    '재팬디': 'Japandi style, calm, low furniture and natural materials', '빈티지': 'mid-century vintage style' }
};
function isianPrompt_(q, imgs) {
  var sp = ISIAN_EN.space[q.sp] || 'room', st = ISIAN_EN.style[q.st] || 'modern style';
  var base = isianClean_(q.prompt, 1800);
  if (base.length < 20) base = 'Photorealistic interior design rendering of a Korean apartment ' + sp + ', ' + st + '.' +
    (q.mt ? ' Main finishing materials: ' + isianClean_(q.mt, 100) + '.' : '') + (q.ex ? ' Additional request: ' + isianClean_(q.ex, 300) + '.' : '') +
    ' Natural daylight, eye-level wide-angle view, realistic proportions (2.3 m ceiling), no people, no text, no watermark.';
  var guide = [];
  imgs.forEach(function (im, i) {
    guide.push('Attached image ' + (i + 1) + (im.kind === 'p'
      ? ' is the floor plan / drawing of this apartment. Roughly follow its layout (room arrangement, window and door positions); keep the result a natural interior photo, not a drawing.'
      : ' is a photo of the actual site as it is now. Keep its room shape, window and door positions, ceiling height and camera viewpoint, and redesign only the finishes, lighting, furniture and built-ins.'));
  });
  return base + (guide.length ? '\n' + guide.join('\n') : '') + '\nDo not copy any person, face, name, address, document or text from the attached images. 4:3 landscape. No people, no text, no logos, no watermark.';
}
function isianModel_(key) {
  var fixed = isianProp_('ISIAN_MODEL');
  if (fixed) return fixed.replace(/^models\//, '');
  if (typeof sianModel_ === 'function') return sianModel_(key);    // 간편견적 v12 의 자동 선택 (Lite → Flash, Pro 제외)
  return 'gemini-2.5-flash-image';                                   // [확인 필요] sianModel_ 이 없을 때만
}
/* Gemini 호출 → {b64, mime, model, tok} (간편견적 v12 sianGen_ 과 같은 형식) */
function isianGen_(prompt, imgs) {
  var key = isianProp_('GEMINI_API_KEY');
  if (!key) throw isianErr_('no_key', 'GEMINI_API_KEY 가 스크립트 속성에 없어요');
  var model = isianModel_(key);
  var parts = [{ text: prompt }].concat(imgs.map(function (im) { return { inline_data: { mime_type: im.mime, data: im.b64 } }; }));
  var call = function (cfg) {
    return UrlFetchApp.fetch(ISIAN_GEM_BASE + 'models/' + model + ':generateContent', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: { 'x-goog-api-key': key },
      payload: JSON.stringify({ contents: [{ role: 'user', parts: parts }], generationConfig: cfg }) });
  };
  var r = call({ responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '4:3' } });
  if (r.getResponseCode() === 400) r = call({ responseModalities: ['TEXT', 'IMAGE'] });   // 비율 설정을 모르는 모델이면 빼고 다시
  if (r.getResponseCode() === 404) { try { CacheService.getScriptCache().remove('gem:model'); } catch (x) {} }
  if (r.getResponseCode() !== 200) throw isianErr_('gemini_' + r.getResponseCode(), 'Gemini ' + model + ' ' + r.getResponseCode() + ': ' + String(r.getContentText()).slice(0, 300));
  var j = JSON.parse(r.getContentText());
  var c0 = (j.candidates || [])[0] || {}, ps = (c0.content || {}).parts || [];
  var im = ps.map(function (p) { return p.inlineData || p.inline_data; }).filter(function (d) { return d && d.data; })[0];
  if (!im) throw isianErr_('no_image', '그림이 안 왔어요 (' + model + ' · ' + (c0.finishReason || (j.promptFeedback && j.promptFeedback.blockReason) || '이유 없음') + ' · 요청 글을 바꿔 보세요)');
  var u = j.usageMetadata || {};
  return { b64: im.data, mime: im.mimeType || im.mime_type || 'image/png', model: model, tok: (u.promptTokenCount || '') + '/' + (u.candidatesTokenCount || '') };
}
function isianLog_(row) { // 간편견적 접수 시트에 '인트라넷 시안' 탭 (SHEET_ID 가 있을 때만 · 실패해도 시안은 그대로)
  try {
    if (typeof SHEET_ID === 'undefined') return;
    var ss = SpreadsheetApp.openById(SHEET_ID), sh = ss.getSheetByName(ISIAN_LOG_TAB);
    if (!sh) { sh = ss.insertSheet(ISIAN_LOG_TAB); sh.appendRow(['시각', '프로젝트', '직원', '사용자ID', '공간', '스타일', '입력 사진', '결과', '모델', '토큰(입력/출력)', '파일 이름', '파일ID', '요청ID', '메모']); sh.setFrozenRows(1); }
    sh.appendRow(row);
  } catch (x) {}
}

/* 본체: q = {k, u, d, p, n, f, img, kd, sp, st, mt, ex, prompt, by, rid} → {ok, ...} 또는 {ok:false, code, error} */
function isianRun_(q) {
  q = q || {};
  var day = isianDay_(), uid = isianClean_(q.u, 64), pno = isianClean_(q.p, 20), rid = isianClean_(q.rid, 16);
  if (!isianProp_('IMG_TOKEN')) return { ok: false, code: 'no_token', error: '서버에 IMG_TOKEN 이 아직 없어요 (대표: 스크립트 속성)' };
  if (!/^[\w-]{3,64}$/.test(uid)) return { ok: false, code: 'bad_user', error: '사용자 값이 없어요' };
  if (String(q.d || '') !== day) return { ok: false, code: 'ticket_day', error: '입장권 날짜가 오늘(' + day + ')이 아니에요 · 인트라넷에서 ‘다시 준비’를 눌러 주세요' };
  if (!isianSame_(String(q.k || '').toLowerCase(), isianTicket_(uid, day))) return { ok: false, code: 'ticket', error: '인트라넷에서 연 주소가 아니에요 (입장권이 맞지 않음)' };
  if (!/^P-\d{4}-\d{3}$/.test(pno)) return { ok: false, code: 'bad_project', error: '프로젝트 번호가 없어요' };
  if (!/^[a-z0-9]{6,16}$/.test(rid)) return { ok: false, code: 'bad_rid', error: '요청 ID 가 없어요' };
  var by = isianClean_(q.by, 20) || '직원', title = isianClean_(q.n, 60);
  var c = isianCount_(day, pno, uid, rid);
  if (!c.ok) return c;
  var g = null, f = null, name = '', imgs = [];
  try {
    var folder = isianProjFolder_(pno, title, isianClean_(q.f, 80));
    imgs = isianInputs_(q.img, q.kd, folder);
    var prompt = isianPrompt_(q, imgs);
    g = isianGen_(prompt, imgs);
    var dir = isianSub_(folder, '시안 이미지');
    name = isianName_(dir, pno, day);
    f = dir.createFile(Utilities.newBlob(Utilities.base64Decode(g.b64), g.mime || 'image/png', name));
    f.setDescription(JSON.stringify({ engine: 'gemini', pno: pno, by: by, uid: uid, space: isianClean_(q.sp, 20), style: isianClean_(q.st, 20),
      mat: isianClean_(q.mt, 100), extra: isianClean_(q.ex, 300), inputs: imgs.map(function (x) { return x.kind + ':' + x.id; }), model: g.model, usd: ISIAN_USD, rid: rid }));
  } catch (e) {
    isianRefund_(day, pno, uid);
    isianLog_([new Date(), pno, by, uid, q.sp || '', q.st || '', imgs.length, '실패(횟수 안 셈)', g ? g.model : '', '', '', '', rid, String(e.message || e).slice(0, 300)]);
    return { ok: false, code: e.code || 'fail', error: String(e.message || e).slice(0, 300) };
  }
  isianLog_([new Date(), pno, by, uid, q.sp || '', q.st || '', imgs.length, '저장', g.model, g.tok, name, f.getId(), rid, '']);
  return { ok: true, pno: pno, name: name, fileId: f.getId(), url: 'https://drive.google.com/file/d/' + f.getId() + '/view', model: g.model, left: c.left, b64: g.b64, mime: g.mime };
}

/* 새 탭(GET ?a=isian&…) → 결과 화면. fmt=json 이면 JSON (그림 데이터는 빼고) */
function isianDoGet_(e) {
  var q = (e && e.parameter) || {}, r;
  try { r = isianRun_(q); } catch (x) { r = { ok: false, code: 'fail', error: String(x && x.message || x) }; }
  if (q.fmt === 'json') { var o = {}; Object.keys(r).forEach(function (k) { if (k !== 'b64') o[k] = r[k]; }); return isianJson_(o); }
  return isianPage_(r);
}
function isianPage_(r) {
  var body = r.ok
    ? '<h1>시안 이미지를 만들었어요</h1><p class="m">' + isianEsc_(r.name) + '<br>드라이브 현장 폴더 › ' + isianEsc_(r.pno) + ' › 시안 이미지에 저장했어요. (이 프로젝트 오늘 남은 ' + Math.max(0, r.left) + '장)</p>' +
      '<img src="data:' + isianEsc_(r.mime || 'image/png') + ';base64,' + r.b64 + '" alt="시안 이미지">' +
      '<p><b>이 탭을 닫고 인트라넷으로 돌아가 ‘③ 결과 불러오기’를 누르면 프로젝트에 붙어요.</b></p><a class="b" href="' + isianEsc_(r.url) + '" target="_blank" rel="noopener">드라이브에서 보기</a>'
    : '<h1>시안 이미지를 만들지 못했어요</h1><p class="e">' + isianEsc_(r.error) + '</p><p class="m">이유 코드: ' + isianEsc_(r.code || '') + ' · 이 탭을 닫고 인트라넷으로 돌아가세요. 실패한 장은 횟수에 들어가지 않아요.</p>';
  return HtmlService.createHtmlOutput('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{font-family:"Malgun Gothic",sans-serif;margin:0;padding:16px;color:#111;background:#F2F2F2}.c{max-width:760px;margin:0 auto;background:#fff;border-radius:12px;padding:18px;border-top:6px solid #1F4E79}' +
    'h1{font-size:20px;color:#203864;margin:0 0 8px}img{width:100%;border-radius:8px;border:1px solid #ddd}.b{display:inline-block;background:#1F4E79;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;margin:8px 6px 0 0}' +
    '.m{color:#555;font-size:13px}.e{color:#C00000;font-weight:700}.f{color:#888;font-size:11px;text-align:center;margin-top:14px}</style><title>인트라넷 시안</title></head><body><div class="c">' +
    body + '<p class="f">ⓒ HOME FURNISHING CO. all rights reserved.</p></div></body></html>').setTitle('인트라넷 시안')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* 확인용: 편집기에서 isianCheck 고르고 ▶ 실행 → 로그에 속성·폴더 상태 (그림은 안 만듦 · 횟수 안 셈) */
function isianCheck() {
  var ok = [];
  ok.push('IMG_TOKEN: ' + (isianProp_('IMG_TOKEN') ? (isianProp_('IMG_TOKEN').length >= 40 ? '있음' : '있음 (40자보다 짧아요 · 더 길게 권장)') : '없음'));
  ok.push('GEMINI_API_KEY: ' + (isianProp_('GEMINI_API_KEY') ? '있음' : '없음'));
  try { ok.push('첨부 폴더: ' + isianRoot_().getName()); } catch (x) { ok.push('첨부 폴더를 못 열어요: ' + x.message); }
  try { ok.push('모델: ' + isianModel_(isianProp_('GEMINI_API_KEY'))); } catch (x) { ok.push('모델 확인 실패: ' + x.message); }
  ok.push('오늘 인트라넷 시안: ' + (isianProp_('isian:' + isianDay_()) || '아직 없음'));
  Logger.log(ok.join('\n'));
}
