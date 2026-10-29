/**
 * 홈퍼니싱 인트라넷 (1단계) — Google Apps Script 웹앱
 * 메뉴: 전자결재(기안·품의 5종 + 휴가신청서), 인사(직원 시트·연차 자동 계산)
 *
 * 원칙
 * - 공유드라이브 「0. 홈퍼니싱」의 원본 파일은 읽기·링크만. 이동·수정·삭제하지 않음.
 * - 이 스크립트는 새 스프레드시트 2개를 만들어 씀.
 *   1) 홈퍼니싱 인트라넷 DB        : 직원 / 결재 / 결재_지출내역 / 현장
 *   2) 홈퍼니싱 민감정보(대표 전용) : 직원_민감 / 결재_계좌   ← 대표 계정만 접근
 * - 웹앱은 "실행: 나(대표)"로 배포 → 직원은 시트 파일에 직접 접근하지 않고, 서버가 권한을 확인해 필요한 칸만 돌려줌.
 */

const OWNER_EMAIL = 'soo@artico-studio.com';   // 결재 알림·민감정보 접근 (대표 전용)
const APP_TITLE = '홈퍼니싱 인트라넷';
const TZ = 'Asia/Seoul';

// 본사 「26년 기안품의서(본사,기성).xls」의 시트 5종 + 회사내부 「11 휴가신청서」
const KINDS = ['기안·품의(본사)', '기안·품의(업체기성)', '기안·품의(일반공사)', '기안·품의(물품납품)', '기안·품의(김포북변)', '휴가신청서'];

// 시트 머리글 (순서가 곧 열 순서)
const H = {
  // 본사 「인사기록부」 앞면 항목 순서 (주민번호·주소·혼인·연봉은 민감정보 시트로)
  직원: ['직원ID', '이름', '소속', '직급', '직책', '입사일', '현직위승진일', '입사구분', '입사시최종학력', '연락처', '회사이메일', '담당업무', '재직상태', '권한', '수정일'],
  // 인사기록부 표 항목 (학력·어학·자격면허·병역·입사전경력·발령·교육·상벌) — 대표만 봄
  인사이력: ['이력ID', '직원ID', '구분', '기간/일자', '항목1', '항목2', '항목3', '항목4', '비고'],
  결재: ['문서번호', '종류', '현장코드', '현장명', '기안일자', '기안부서', '기안자', '기안자이메일', '제목', '업체명(연락처)', '공급가합계', '부가세합계', '금액(VAT포함)', '지급요청일', '증빙자료', '증빙파일', '비고', '휴가구분', '휴가시작', '휴가종료', '휴가일수', '상태', '결재자', '결재일시', '결재의견', '작성일시'],
  결재_지출내역: ['문서번호', '순번', '일자', '구분', '지출내역', '공급가', '부가세'],
  현장: ['현장코드', '현장명', '고객코드', '상태', '등록일', '비고'],
  직원_민감: ['직원ID', '이름', '주민등록번호', '주소', '혼인여부', '급여(연봉)', '급여계좌', '근로계약서 링크', '인사기록 폴더 링크', '비고', '수정일'],
  결재_계좌: ['문서번호', '업체명', '계좌번호', '작성일시']
};

/* ================= 설치 (대표 계정으로 한 번만 실행) ================= */
function setup() {
  const me = Session.getEffectiveUser().getEmail();
  if (me !== OWNER_EMAIL) throw new Error('대표 계정(' + OWNER_EMAIL + ')으로 실행해 주세요. 지금: ' + me);
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('DB_ID')) {
    const db = SpreadsheetApp.create('홈퍼니싱 인트라넷 DB');
    ['직원', '인사이력', '결재', '결재_지출내역', '현장'].forEach((n, i) => {
      const sh = i === 0 ? db.getSheets()[0].setName(n) : db.insertSheet(n);
      initSheet_(sh, H[n]);
    });
    p.setProperty('DB_ID', db.getId());
    // 기존 직원 이름만 미리 넣음 (나머지 칸은 대표가 채움)
    const st = db.getSheetByName('직원');
    [['최윤수', '대표이사', '대표'], ['정진혁', '실장', '직원'], ['채진아', '', '직원'], ['이봄이', '', '직원']].forEach(r => {
      const o = { 직원ID: newId_('E'), 이름: r[0], 직급: r[1], 회사이메일: r[0] === '최윤수' ? OWNER_EMAIL : '', 재직상태: '재직', 권한: r[2], 수정일: now_() };
      append_(st, H.직원, o);
    });
  }
  // 이미 만든 DB에 새 시트가 빠져 있으면 추가 (기존 데이터는 그대로)
  const dbx = SpreadsheetApp.openById(p.getProperty('DB_ID'));
  ['직원', '인사이력', '결재', '결재_지출내역', '현장'].forEach(n => { if (!dbx.getSheetByName(n)) initSheet_(dbx.insertSheet(n), H[n]); });
  if (!p.getProperty('SECRET_ID')) {
    const sec = SpreadsheetApp.create('홈퍼니싱 민감정보(대표 전용) — 공유 금지');
    ['직원_민감', '결재_계좌'].forEach((n, i) => {
      const sh = i === 0 ? sec.getSheets()[0].setName(n) : sec.insertSheet(n);
      initSheet_(sh, H[n]);
    });
    p.setProperty('SECRET_ID', sec.getId());
  }
  if (!p.getProperty('FILES_ID')) {
    p.setProperty('FILES_ID', DriveApp.createFolder('홈퍼니싱 인트라넷 결재 증빙').getId());
  }
  Logger.log('DB: https://docs.google.com/spreadsheets/d/' + p.getProperty('DB_ID'));
  Logger.log('민감정보(대표 전용): https://docs.google.com/spreadsheets/d/' + p.getProperty('SECRET_ID'));
}

function initSheet_(sh, head) {
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#1F4E79').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
}

/* ================= 웹 화면 ================= */
function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle(APP_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ================= 공통 ================= */
function db_() { return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('DB_ID')); }
function secret_() { return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SECRET_ID')); }
function now_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'); }
function today_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function newId_(p) { return p + Utilities.getUuid().slice(0, 8); }
function d_(v) { return v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : String(v || ''); }

function rows_(sheet, head) {
  const v = sheet.getDataRange().getValues();
  return v.slice(1).map((r, i) => { const o = { _row: i + 2 }; head.forEach((h, j) => o[h] = r[j] instanceof Date ? d_(r[j]) : r[j]); return o; });
}
function append_(sheet, head, o) { sheet.appendRow(head.map(h => o[h] === undefined ? '' : o[h])); }
function update_(sheet, head, row, o) { sheet.getRange(row, 1, 1, head.length).setValues([head.map(h => o[h] === undefined ? '' : o[h])]); }

function viewer_() {
  const email = (Session.getActiveUser().getEmail() || '').toLowerCase();
  const staff = rows_(db_().getSheetByName('직원'), H.직원).find(s => String(s.회사이메일).toLowerCase() === email && email);
  return { email, isOwner: email === OWNER_EMAIL, staff: staff || null };
}
function requireStaff_() {
  const v = viewer_();
  if (!v.isOwner && !(v.staff && v.staff.재직상태 !== '퇴사')) throw new Error('등록된 직원 계정이 아니에요. 대표에게 직원 시트에 회사이메일 등록을 요청해 주세요.');
  return v;
}
function requireOwner_() {
  const v = viewer_();
  if (!v.isOwner) throw new Error('대표만 할 수 있어요.');
  return v;
}

/* ================= 연차 (입사일 기준 · 근로기준법 제60조, 상시 5인 이상) =================
 * 1년 미만: 1개월 개근마다 1일 (최대 11일)
 * 1년 이상: 15일, 3년차부터 2년마다 1일 가산 (최대 25일)
 * 사용일수: 승인된 휴가신청서(연차·반차) 중 '이번 연차년도'(입사 기념일 ~ 다음 기념일 전날) 것
 */
function leaveInfo_(joinStr, approvals, email) {
  if (!joinStr) return { 발생: '', 사용: '', 잔여: '', 기간: '입사일 필요' };
  const join = new Date(joinStr + 'T00:00:00+09:00');
  const t = new Date(today_() + 'T00:00:00+09:00');
  let years = t.getFullYear() - join.getFullYear();
  const anniv = new Date(join); anniv.setFullYear(join.getFullYear() + years);
  if (anniv > t) { years--; anniv.setFullYear(anniv.getFullYear() - 1); }
  let grant, from, to;
  if (years < 1) {
    let months = (t.getFullYear() - join.getFullYear()) * 12 + (t.getMonth() - join.getMonth());
    if (t.getDate() < join.getDate()) months--;
    grant = Math.max(0, Math.min(11, months));
    from = join; to = new Date(join); to.setFullYear(join.getFullYear() + 1); to.setDate(to.getDate() - 1);
  } else {
    grant = Math.min(25, 15 + Math.floor((years - 1) / 2));
    from = anniv; to = new Date(anniv); to.setFullYear(anniv.getFullYear() + 1); to.setDate(to.getDate() - 1);
  }
  const f = d_(from), e = d_(to);
  const used = approvals.filter(a => a.종류 === '휴가신청서' && a.상태 === '승인' && String(a.기안자이메일).toLowerCase() === String(email).toLowerCase()
      && ['연차', '반차'].includes(a.휴가구분) && d_(a.휴가시작) >= f && d_(a.휴가시작) <= e)
    .reduce((s, a) => s + (a.휴가구분 === '반차' ? 0.5 : Number(a.휴가일수) || 1), 0);
  return { 발생: grant, 사용: used, 잔여: grant - used, 기간: f + ' ~ ' + e, 근속년수: years };
}

/* ================= 화면에서 부르는 함수 ================= */
function getBoot() {
  const v = requireStaff_();
  const staff = listStaff();
  return { email: v.email, isOwner: v.isOwner, me: v.staff ? v.staff.이름 : '대표', kinds: KINDS, staff, sites: listSites() };
}

// 직원 시트 — 민감정보 없음. 연차는 서버에서 계산해 붙임
function listStaff() {
  requireStaff_();
  const ap = rows_(db_().getSheetByName('결재'), H.결재);
  return rows_(db_().getSheetByName('직원'), H.직원).map(s => {
    const o = {}; H.직원.forEach(h => o[h] = s[h]);
    o.연차 = leaveInfo_(d_(s.입사일), ap, s.회사이메일);
    return o;
  });
}

function saveStaff(o) {
  requireOwner_();
  const sh = db_().getSheetByName('직원');
  const all = rows_(sh, H.직원);
  const cur = o.직원ID ? all.find(s => s.직원ID === o.직원ID) : null;
  const row = {}; H.직원.forEach(h => row[h] = (o[h] !== undefined ? o[h] : (cur ? cur[h] : '')));
  if (!row.이름) throw new Error('이름을 적어 주세요.');
  row.직원ID = cur ? cur.직원ID : newId_('E');
  row.수정일 = now_();
  cur ? update_(sh, H.직원, cur._row, row) : append_(sh, H.직원, row);
  return row.직원ID;
}

// 민감정보 — 대표만
function getSecret(staffId) {
  requireOwner_();
  const r = rows_(secret_().getSheetByName('직원_민감'), H.직원_민감).find(x => x.직원ID === staffId);
  const o = {}; H.직원_민감.forEach(h => o[h] = r ? r[h] : ''); o.직원ID = staffId; return o;
}
function saveSecret(o) {
  requireOwner_();
  const sh = secret_().getSheetByName('직원_민감');
  const cur = rows_(sh, H.직원_민감).find(x => x.직원ID === o.직원ID);
  const row = {}; H.직원_민감.forEach(h => row[h] = o[h] || ''); row.수정일 = now_();
  cur ? update_(sh, H.직원_민감, cur._row, row) : append_(sh, H.직원_민감, row);
  return true;
}

// 인사이력 (인사기록부 표 항목) — 대표만
const HIST_KINDS = ['학력', '어학능력', '특허·자격·면허', '병역', '입사전경력', '발령사항', '교육사항', '상벌사항'];
function getHistory(staffId) {
  requireOwner_();
  return rows_(db_().getSheetByName('인사이력'), H.인사이력).filter(r => r.직원ID === staffId)
    .map(r => { const o = {}; H.인사이력.forEach(h => o[h] = r[h]); return o; });
}
function saveHistory(staffId, list) {
  requireOwner_();
  const sh = db_().getSheetByName('인사이력');
  const all = rows_(sh, H.인사이력);
  // 이 직원의 기존 줄을 아래에서부터 지우고 새로 씀
  all.filter(r => r.직원ID === staffId).map(r => r._row).sort((a, b) => b - a).forEach(r => sh.deleteRow(r));
  (list || []).filter(x => HIST_KINDS.indexOf(x.구분) >= 0 && (x['기간/일자'] || x.항목1 || x.항목2))
    .forEach(x => append_(sh, H.인사이력, Object.assign({}, x, { 이력ID: newId_('H'), 직원ID: staffId })));
  return true;
}

// 현장 (2단계 대비: 지금부터 현장코드 S26-001 사용)
function listSites() {
  requireStaff_();
  return rows_(db_().getSheetByName('현장'), H.현장).map(s => ({ 현장코드: s.현장코드, 현장명: s.현장명, 상태: s.상태 }));
}
function addSite(name, customerCode) {
  requireStaff_();
  if (!name) throw new Error('현장명을 적어 주세요.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = db_().getSheetByName('현장');
    const yy = Utilities.formatDate(new Date(), TZ, 'yy');
    const n = rows_(sh, H.현장).filter(s => String(s.현장코드).indexOf('S' + yy + '-') === 0).length + 1;
    const code = 'S' + yy + '-' + ('00' + n).slice(-3);
    append_(sh, H.현장, { 현장코드: code, 현장명: name, 고객코드: customerCode || '', 상태: '진행', 등록일: today_() });
    return code;
  } finally { lock.releaseLock(); }
}

// 결재 목록 — 직원은 본인 것, 대표는 전체. 계좌번호는 여기 없음
function listApprovals() {
  const v = requireStaff_();
  const lines = rows_(db_().getSheetByName('결재_지출내역'), H.결재_지출내역);
  return rows_(db_().getSheetByName('결재'), H.결재)
    .filter(a => v.isOwner || String(a.기안자이메일).toLowerCase() === v.email)
    .map(a => { const o = {}; H.결재.forEach(h => o[h] = a[h]); o.지출내역 = lines.filter(l => l.문서번호 === a.문서번호); return o; })
    .reverse();
}

// 결재 올리기: 직원 기안 → 결과 시트 기록 → 대표에게 메일
function submitApproval(f) {
  const v = requireStaff_();
  if (!f.제목) throw new Error('제목을 적어 주세요.');
  if (KINDS.indexOf(f.종류) < 0) throw new Error('서류 종류를 골라 주세요.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let no;
  try {
    const d = db_();
    const sh = d.getSheetByName('결재');
    const ym = Utilities.formatDate(new Date(), TZ, 'yy-MM');
    const n = rows_(sh, H.결재).filter(a => String(a.문서번호).indexOf(ym + '-') === 0).length + 1;
    no = ym + '-' + ('0' + n).slice(-2);                       // 원본과 같은 26-01-01 형식
    const lines = (f.지출내역 || []).filter(l => l.지출내역 || l.구분 || Number(l.공급가));
    const sup = lines.reduce((s, l) => s + (Number(l.공급가) || 0), 0);
    const vat = lines.reduce((s, l) => s + (Number(l.부가세) || 0), 0);
    const files = (f.files || []).map(x => saveFile_(no, x)).join('\n');
    append_(sh, H.결재, {
      문서번호: no, 종류: f.종류, 현장코드: f.현장코드 || '', 현장명: f.현장명 || '', 기안일자: today_(),
      기안부서: f.기안부서 || (v.staff ? v.staff.소속 : ''), 기안자: v.staff ? v.staff.이름 : '대표', 기안자이메일: v.email,
      제목: f.제목, '업체명(연락처)': f.업체명 || '', 공급가합계: sup, 부가세합계: vat,
      '금액(VAT포함)': lines.length ? sup + vat : (Number(f.금액) || 0), 지급요청일: f.지급요청일 || '', 증빙자료: f.증빙자료 || '', 증빙파일: files,
      비고: f.비고 || '', 휴가구분: f.휴가구분 || '', 휴가시작: f.휴가시작 || '', 휴가종료: f.휴가종료 || '', 휴가일수: f.휴가일수 || '',
      상태: '결재 대기', 작성일시: now_()
    });
    const ls = d.getSheetByName('결재_지출내역');
    lines.forEach((l, i) => append_(ls, H.결재_지출내역, { 문서번호: no, 순번: i + 1, 일자: l.일자 || '', 구분: l.구분 || '', 지출내역: l.지출내역 || '', 공급가: Number(l.공급가) || 0, 부가세: Number(l.부가세) || 0 }));
    if (f.계좌번호) append_(secret_().getSheetByName('결재_계좌'), H.결재_계좌, { 문서번호: no, 업체명: f.업체명 || '', 계좌번호: f.계좌번호, 작성일시: now_() });
  } finally { lock.releaseLock(); }
  notifyOwner_(no);
  return no;
}

function saveFile_(no, x) {
  const folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('FILES_ID'));
  const blob = Utilities.newBlob(Utilities.base64Decode(x.data), x.type || 'application/octet-stream', no + '_' + x.name);
  return folder.createFile(blob).getUrl();
}

function notifyOwner_(no) {
  const a = rows_(db_().getSheetByName('결재'), H.결재).find(r => r.문서번호 === no);
  const url = ScriptApp.getService().getUrl();
  const amt = Number(a['금액(VAT포함)']) ? Number(a['금액(VAT포함)']).toLocaleString('ko-KR') + '원' : '-';
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: '[결재 요청] ' + no + ' ' + a.제목 + ' (' + a.기안자 + ')',
    htmlBody: '<p><b>' + a.종류 + '</b> 결재 요청이 올라왔어요.</p>' +
      '<table cellpadding="4" style="border-collapse:collapse">' +
      [['문서번호', no], ['현장', (a.현장코드 ? a.현장코드 + ' ' : '') + a.현장명], ['기안자', a.기안자], ['제목', a.제목], ['업체', a['업체명(연락처)']], ['금액', amt], ['지급요청일', a.지급요청일]]
        .map(r => '<tr><td style="color:#7F7F7F">' + r[0] + '</td><td>' + esc_(r[1]) + '</td></tr>').join('') +
      '</table><p><a href="' + url + '#approvals">인트라넷에서 승인·반려하기</a></p>' +
      '<p style="color:#7F7F7F;font-size:12px">계좌번호는 메일에 넣지 않았어요. 인트라넷 결재 화면(대표 전용)에서 확인하세요.</p>'
  });
}
function esc_(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// 대표: 계좌번호 보기 (결재 상세에서만)
function getAccount(no) {
  requireOwner_();
  const r = rows_(secret_().getSheetByName('결재_계좌'), H.결재_계좌).find(x => x.문서번호 === no);
  return r ? r.계좌번호 : '';
}

// 대표: 승인 / 반려 → 결과 시트 기록 + 기안자에게 결과 메일
function decide(no, result, note) {
  const v = requireOwner_();
  if (['승인', '반려'].indexOf(result) < 0) throw new Error('승인 또는 반려만 할 수 있어요.');
  const sh = db_().getSheetByName('결재');
  const a = rows_(sh, H.결재).find(r => r.문서번호 === no);
  if (!a) throw new Error('문서를 찾지 못했어요.');
  if (a.상태 !== '결재 대기') throw new Error('이미 ' + a.상태 + ' 처리된 문서예요.');
  a.상태 = result; a.결재자 = '대표이사'; a.결재일시 = now_(); a.결재의견 = note || '';
  update_(sh, H.결재, a._row, a);
  if (a.기안자이메일 && a.기안자이메일 !== v.email) {
    MailApp.sendEmail(a.기안자이메일, '[결재 ' + result + '] ' + no + ' ' + a.제목,
      no + ' ' + a.제목 + ' 문서가 ' + result + '되었어요.' + (note ? '\n의견: ' + note : '') + '\n' + ScriptApp.getService().getUrl());
  }
  return true;
}
