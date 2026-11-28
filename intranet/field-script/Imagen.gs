/**
 * 시안 이미지 만들기 (대표 지시 2026-11-10) — 구글 Imagen 4
 * 인트라넷 프로젝트 화면의 '생성' 버튼이 새 탭으로 이 웹앱을 연다 (?a=img&...). claude.ai 인트라넷은 외부 API를 직접 못 부르기 때문.
 * 하는 일: 토큰 확인 → 사용량 제한(프로젝트당 하루 10장, 한 달 상한) → Imagen 4 호출 → 드라이브 현장 자료(인트라넷 첨부 › 프로젝트 폴더 › 시안 이미지)에 저장
 *          → 기록 시트('시안 이미지' 탭)에 한 줄 → (현장소통 코드가 있으면) 고객 공유 페이지에 '시안' 글로 올림 → 결과 화면
 * 비밀: API 키·토큰은 '스크립트 속성'에만 (GEMINI_API_KEY, IMG_TOKEN). 코드·저장소에 쓰지 않는다.
 */
var IMG_MODEL = 'imagen-4.0-generate-001';      // 표준. 빠른 버전: imagen-4.0-fast-generate-001
var IMG_COST_USD = { 'imagen-4.0-generate-001': 0.04, 'imagen-4.0-fast-generate-001': 0.02, 'imagen-4.0-ultra-generate-001': 0.06 };
var IMG_DAY_LIMIT = 10;                          // 프로젝트당 하루
var IMG_ATT_ROOT = '1P0Rh3vBB1ApsUcpVXZsDrzr1mdVUWOor';   // 현장 공유드라이브 › 인트라넷 첨부 (인트라넷 ATT_ROOT 와 같음)
function imgTab_() { if (!TAB.renders) TAB.renders = ['시안 이미지', ['시각', '날짜', '프로젝트', '현장명', '직원', '스타일', '공간', '마감재', '추가 요청', '영어 프롬프트', '모델', '비용(USD)', '파일ID', '파일 이름', '요청ID']]; }

function imgProp_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function page_(title, body) {
  return HtmlService.createHtmlOutput('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{font-family:"Malgun Gothic",sans-serif;margin:0;padding:20px;color:#111;background:#F2F2F2}.c{max-width:760px;margin:0 auto;background:#fff;border-radius:12px;padding:18px;border-top:6px solid #1F4E79}' +
    'h1{font-size:20px;color:#203864;margin:0 0 8px}img{width:100%;border-radius:8px;border:1px solid #ddd}.b{display:inline-block;background:#1F4E79;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;margin:8px 6px 0 0}.m{color:#555;font-size:13px}.e{color:#C00000;font-weight:700}' +
    '.f{color:#888;font-size:11px;text-align:center;margin-top:14px}</style><title>' + esc_(title) + '</title></head><body><div class="c">' + body + '<p class="f">ⓒ HOME FURNISHING CO. all rights reserved.</p></div></body></html>')
    .setTitle(title).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function imgFail_(msg) { return page_('시안 이미지', '<h1>시안 이미지를 만들지 못했어요</h1><p class="e">' + esc_(msg) + '</p><p class="m">이 탭을 닫고 인트라넷으로 돌아가세요.</p>'); }

function projFolder_(pno, title, fid) {
  if (fid) { try { return DriveApp.getFolderById(fid); } catch (x) {} }
  var root = DriveApp.getFolderById(imgProp_('IMG_ROOT') || IMG_ATT_ROOT);
  var it = root.getFolders();
  while (it.hasNext()) { var f = it.next(); if (f.getName().indexOf(pno) === 0) return f; }
  return root.createFolder((pno + ' ' + (title || '')).trim());
}
function sub_(f, name) { var it = f.getFoldersByName(name); return it.hasNext() ? it.next() : f.createFolder(name); }

function imgCall_(prompt, model) {
  var key = imgProp_('GEMINI_API_KEY');
  if (!key) throw new Error('API 키가 아직 없어요 (대표: 스크립트 속성 GEMINI_API_KEY)');
  var res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':predict', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: { 'x-goog-api-key': key },
    payload: JSON.stringify({ instances: [{ prompt: prompt }], parameters: { sampleCount: 1, aspectRatio: '4:3', personGeneration: 'dont_allow' } })
  });
  var code = res.getResponseCode(), j = {};
  try { j = JSON.parse(res.getContentText()); } catch (x) {}
  if (code !== 200) throw new Error('이미지 서비스 오류 ' + code + ': ' + String((j.error && j.error.message) || res.getContentText()).slice(0, 200));
  var p = (j.predictions || [])[0];
  if (!p || !p.bytesBase64Encoded) throw new Error('이미지가 오지 않았어요 (요청 내용이 안전 기준에 걸렸을 수 있어요 · 추가 요청을 바꿔 보세요)');
  return Utilities.newBlob(Utilities.base64Decode(p.bytesBase64Encoded), p.mimeType || 'image/png');
}

function imgGen_(q) {
  imgTab_();
  if (!imgProp_('IMG_TOKEN') || String(q.t || '') !== imgProp_('IMG_TOKEN')) return imgFail_('인트라넷에서 연 주소가 아니에요 (토큰이 맞지 않음)');
  var pno = clean_(q.p, 20), title = clean_(q.n, 60), by = clean_(q.by, 20) || '직원', rid = clean_(q.rid, 16) || id_('r').slice(1, 9);
  var prompt = clean_(q.prompt, 1800);
  if (!/^P-\d{4}-\d{3}/.test(pno)) return imgFail_('프로젝트 번호가 없어요');
  if (prompt.length < 20) return imgFail_('프롬프트가 비어 있어요');
  var model = imgProp_('IMG_MODEL') || IMG_MODEL, cost = IMG_COST_USD[model] || 0.04;
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  var f, name, day = today_(), ym = day.slice(0, 7);
  try {
    var rows = rows_('renders');
    if (rows.some(function (r) { return r[14] === rid; })) return page_('시안 이미지', '<h1>이미 만든 요청이에요</h1><p class="m">새로 만들려면 인트라넷에서 \'다시 생성\'을 누르세요.</p>');
    var today = rows.filter(function (r) { return r[2] === pno && String(r[1]).slice(0, 10) === day; }).length;
    if (today >= IMG_DAY_LIMIT) return imgFail_('이 프로젝트는 오늘 ' + IMG_DAY_LIMIT + '장을 다 만들었어요 (내일 다시)');
    var cap = Number(imgProp_('IMG_MONTH_CAP') || 300);
    var month = rows.filter(function (r) { return String(r[1]).slice(0, 7) === ym; }).length;
    if (month >= cap) return imgFail_('이번 달 상한 ' + cap + '장에 닿았어요 (대표에게 말해 주세요)');
    var blob = imgCall_(prompt, model);
    var dir = sub_(projFolder_(pno, title, clean_(q.f, 80)), '시안 이미지');
    var n = 0, it = dir.getFiles();
    while (it.hasNext()) { var m = /\sv(\d+)\s/.exec(it.next().getName()); if (m) n = Math.max(n, Number(m[1]) + 1); }
    name = ('시안 ' + pno + ' ' + clean_(q.sp, 10) + ' ' + clean_(q.st, 10) + ' ' + day + ' v' + n + ' ' + by + ' (' + rid + ').png').replace(/\s+/g, ' ');
    f = dir.createFile(blob.setName(name));
    f.setDescription(JSON.stringify({ pno: pno, by: by, style: q.st || '', space: q.sp || '', mat: q.mt || '', extra: clean_(q.ex, 300), prompt: prompt, model: model, usd: cost, rid: rid }));
    append_('renders', [now_(), day, pno, title, by, clean_(q.st, 20), clean_(q.sp, 20), clean_(q.mt, 30), clean_(q.ex, 300), prompt, model, cost, f.getId(), name, rid]);
  } catch (x) {
    return imgFail_(String(x && x.message || x));
  } finally { lock.releaseLock(); }
  // 고객 공유 페이지 (현장소통 코드가 있을 때만): 회사 글 '시안'으로
  var shared = '';
  try {
    if (q.fc && String(q.fc).length >= 20) {
      var r = site_(String(q.fc));
      append_('photos', [f.getId(), r[0], now_(), '회사', name]);
      append_('posts', [id_('p'), r[0], today_(), '회사', by, '디자인', '시안', (q.sp || '') + ' ' + (q.st || '') + ' 시안 이미지예요. (실제 시공과 다를 수 있어요)', '', JSON.stringify([f.getId()]), now_(), '', '']);
      shared = '<p class="m">고객 공유 페이지에도 올렸어요.</p>';
    }
  } catch (x) { shared = '<p class="m">고객 공유 페이지에는 못 올렸어요: ' + esc_(x.message || x) + '</p>'; }
  log_('시안 이미지', pno, by, name);
  var src = 'data:image/png;base64,' + Utilities.base64Encode(f.getBlob().getBytes());
  return page_('시안 이미지 ' + pno, '<h1>시안 이미지를 만들었어요</h1><p class="m">' + esc_(name) + '<br>드라이브 현장 자료 › ' + esc_(pno) + ' › 시안 이미지에 저장했어요.</p>' + shared +
    '<img src="' + src + '" alt="시안 이미지"><p><b>인트라넷으로 돌아가서 \'결과 불러오기\'를 누르면 프로젝트에 붙어요.</b></p><a class="b" href="https://drive.google.com/file/d/' + f.getId() + '/view" target="_blank">드라이브에서 보기</a>');
}
