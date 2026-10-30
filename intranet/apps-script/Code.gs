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
  현장: ['현장코드', '현장명', '발주처', '연도', '구분', '고객코드', '상태', '등록일', '폴더링크', '메모'],
  업체: ['업체코드', '업체명', '분류', '주요품목', '연락처', '결재건수', '출처', '메모'],
  서식: ['분류', '서식명', '링크', '결재종류'],
  직원_민감: ['직원ID', '이름', '주민등록번호', '주소', '혼인여부', '급여(연봉)', '급여계좌', '근로계약서 링크', '인사기록 폴더 링크', '비고', '수정일'],
  결재_계좌: ['문서번호', '업체명', '계좌번호', '작성일시'],
  // ── 인사 추가 (2026-10-30) ──
  // 연차 사용: 결재 전 기록·과거 사용분을 대표가 직접 넣는 곳 (승인된 휴가신청서는 결재 시트에서 자동으로 셈)
  연차사용: ['기록ID', '직원ID', '이름', '구분', '시작일', '종료일', '일수', '메모', '등록일'],
  // 급여·인상 이력 — 민감정보 시트(대표 전용)에만
  급여이력: ['이력ID', '직원ID', '이름', '적용일', '구분', '연봉', '월급여', '인상액', '인상률(%)', '사유', '등록일'],
  // ── 견적 모듈 ── 고객 데이터는 이 한 곳에만 (견적·상담·계약이 같이 씀)
  고객: ['고객코드', '고객명', '연락처뒤4', '아파트명', '동', '호수', '평형', '욕실수', '문의경로', '담당', '현장코드', '상태', '등록일', '메모'],
  단가표: ['키', '공정', '품목', '설명', '단위', '기본수량', '기본체크', '택1그룹', '기준판매가', '판매가', '하한가', '마진적용', '원가', '실비', '고정', '원가근거', '사용', '출처'],
  견적: ['견적번호', '버전', '고객코드', '고객명', '현장코드', '공사범위', '평형', '욕실수', '마진기준', '할인(만원)', '공급가', '부가세', '합계(VAT포함)', '원가합계', '상태', '작성자', '작성자이메일', '작성일시', '메모'],
  견적_항목: ['견적번호', '버전', '키', '공정', '품목', '단위', '수량', '단가', '금액', '원가단가', '원가금액', '직접수정']
};

// 직원 명단 (이름, 직급, 권한 표시). 실제 대표 권한은 OWNER_EMAIL 로만 판단
const STAFF_SEED = [['최윤수', '대표이사', '대표'], ['신혜현', '대표', '대표'], ['최남수', '실장', '직원'], ['유효성', '부장', '직원'],
  ['정진혁', '실장', '직원'], ['채진아', '', '직원'], ['이봄이', '', '직원']];

/* ================= 설치 (대표 계정으로 한 번만 실행) ================= */
function setup() {
  const me = Session.getEffectiveUser().getEmail();
  if (me !== OWNER_EMAIL) throw new Error('대표 계정(' + OWNER_EMAIL + ')으로 실행해 주세요. 지금: ' + me);
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('DB_ID')) {
    const db = SpreadsheetApp.create('홈퍼니싱 인트라넷 DB');
    ['직원', '인사이력', '결재', '결재_지출내역', '현장', '업체', '서식', '고객', '단가표', '견적', '견적_항목'].forEach((n, i) => {
      const sh = i === 0 ? db.getSheets()[0].setName(n) : db.insertSheet(n);
      initSheet_(sh, H[n]);
    });
    p.setProperty('DB_ID', db.getId());
  }
  // 이미 만든 DB에 새 시트가 빠져 있으면 추가 (기존 데이터는 그대로)
  const dbx = SpreadsheetApp.openById(p.getProperty('DB_ID'));
  ['직원', '인사이력', '연차사용', '결재', '결재_지출내역', '현장', '업체', '서식', '고객', '단가표', '견적', '견적_항목'].forEach(n => { if (!dbx.getSheetByName(n)) initSheet_(dbx.insertSheet(n), H[n]); });
  // 기존 직원 이름만 미리 넣음 (나머지 칸은 대표가 채움). 다시 실행해도 없는 사람만 추가
  const st = dbx.getSheetByName('직원');
  const have = rows_(st, H.직원).map(r => String(r.이름).trim());
  STAFF_SEED.filter(r => have.indexOf(r[0]) < 0).forEach(r => {
    append_(st, H.직원, { 직원ID: newId_('E'), 이름: r[0], 직급: r[1], 회사이메일: r[0] === '최윤수' ? OWNER_EMAIL : '', 재직상태: '재직', 권한: r[2], 수정일: now_() });
  });
  if (!p.getProperty('SECRET_ID')) {
    const sec = SpreadsheetApp.create('홈퍼니싱 민감정보(대표 전용) — 공유 금지');
    ['직원_민감', '결재_계좌'].forEach((n, i) => {
      const sh = i === 0 ? sec.getSheets()[0].setName(n) : sec.insertSheet(n);
      initSheet_(sh, H[n]);
    });
    p.setProperty('SECRET_ID', sec.getId());
  }
  const secx = SpreadsheetApp.openById(p.getProperty('SECRET_ID'));
  ['직원_민감', '결재_계좌', '급여이력'].forEach(n => { if (!secx.getSheetByName(n)) initSheet_(secx.insertSheet(n), H[n]); });
  if (!p.getProperty('FILES_ID')) {
    p.setProperty('FILES_ID', DriveApp.createFolder('홈퍼니싱 인트라넷 결재 증빙').getId());
  }
  setupCatalog();
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
function leaveInfo_(joinStr, approvals, email, manual) {
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
    .reduce((s, a) => s + (a.휴가구분 === '반차' ? 0.5 : Number(a.휴가일수) || 1), 0)
    + (manual || []).filter(m => ['연차', '반차'].includes(m.구분) && d_(m.시작일) >= f && d_(m.시작일) <= e)
      .reduce((s, m) => s + (m.구분 === '반차' ? 0.5 : Number(m.일수) || 1), 0);
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
  const man = rows_(db_().getSheetByName('연차사용'), H.연차사용);
  return rows_(db_().getSheetByName('직원'), H.직원).map(s => {
    const o = {}; H.직원.forEach(h => o[h] = s[h]);
    o.입사일 = d_(s.입사일); o.현직위승진일 = d_(s.현직위승진일);
    o.연차 = leaveInfo_(o.입사일, ap, s.회사이메일, man.filter(m => m.직원ID === s.직원ID));
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

// 연차 사용 내역 — 대표는 모든 직원, 직원은 본인 것만
const LEAVE_KINDS = ['연차', '반차', '경조휴가', '병가', '기타'];
function listLeave(staffId) {
  const v = requireStaff_();
  if (!v.isOwner && !(v.staff && v.staff.직원ID === staffId)) throw new Error('본인 연차 내역만 볼 수 있어요.');
  const st = rows_(db_().getSheetByName('직원'), H.직원).find(s => s.직원ID === staffId);
  if (!st) throw new Error('직원을 찾을 수 없어요.');
  const em = String(st.회사이메일 || '').toLowerCase();
  const fromAp = em ? rows_(db_().getSheetByName('결재'), H.결재)
    .filter(a => a.종류 === '휴가신청서' && a.상태 === '승인' && String(a.기안자이메일).toLowerCase() === em)
    .map(a => ({ 기록ID: '', 구분: a.휴가구분, 시작일: d_(a.휴가시작), 종료일: d_(a.휴가종료), 일수: a.휴가구분 === '반차' ? 0.5 : (Number(a.휴가일수) || 1), 메모: '', 출처: '결재 ' + a.문서번호 })) : [];
  const fromMan = rows_(db_().getSheetByName('연차사용'), H.연차사용).filter(m => m.직원ID === staffId)
    .map(m => ({ 기록ID: m.기록ID, 구분: m.구분, 시작일: d_(m.시작일), 종료일: d_(m.종료일), 일수: Number(m.일수) || 0, 메모: m.메모, 출처: '직접 입력' }));
  return fromAp.concat(fromMan).sort((a, b) => a.시작일 < b.시작일 ? 1 : -1);
}
function saveLeave(o) {
  requireOwner_();
  if (!o.직원ID || !o.시작일) throw new Error('직원과 시작일을 적어 주세요.');
  if (LEAVE_KINDS.indexOf(o.구분) < 0) throw new Error('구분을 골라 주세요.');
  const st = rows_(db_().getSheetByName('직원'), H.직원).find(s => s.직원ID === o.직원ID);
  if (!st) throw new Error('직원을 찾을 수 없어요.');
  const 일수 = o.구분 === '반차' ? 0.5 : (Number(o.일수) || 1);
  append_(db_().getSheetByName('연차사용'), H.연차사용, { 기록ID: newId_('L'), 직원ID: o.직원ID, 이름: st.이름, 구분: o.구분,
    시작일: o.시작일, 종료일: o.종료일 || o.시작일, 일수, 메모: o.메모 || '', 등록일: now_() });
  return true;
}
function deleteLeave(id) {
  requireOwner_();
  const sh = db_().getSheetByName('연차사용');
  const r = rows_(sh, H.연차사용).find(x => x.기록ID === id);
  if (r) sh.deleteRow(r._row);
  return true;
}

// 급여·인상 이력 — 대표만 (민감정보 시트)
const PAY_KINDS = ['입사', '정기인상', '수시인상', '승진', '조정', '삭감'];
function listPay(staffId) {
  requireOwner_();
  return rows_(secret_().getSheetByName('급여이력'), H.급여이력).filter(r => r.직원ID === staffId)
    .map(r => { const o = {}; H.급여이력.forEach(h => o[h] = r[h]); o.적용일 = d_(r.적용일); return o; })
    .sort((a, b) => a.적용일 < b.적용일 ? 1 : -1);
}
// 인상액·인상률은 바로 전 기록과 비교해 자동 계산, 가장 최근 연봉은 직원_민감 '급여(연봉)'에도 반영
function savePay(o) {
  requireOwner_();
  const 연봉 = Number(String(o.연봉 || '').replace(/[^0-9]/g, ''));
  if (!o.직원ID || !o.적용일 || !연봉) throw new Error('적용일과 연봉(원)을 적어 주세요.');
  const ss = secret_(), sh = ss.getSheetByName('급여이력');
  const prev = rows_(sh, H.급여이력).filter(r => r.직원ID === o.직원ID && d_(r.적용일) < o.적용일)
    .sort((a, b) => d_(a.적용일) < d_(b.적용일) ? 1 : -1)[0];
  const before = prev ? Number(prev.연봉) || 0 : 0;
  const st = rows_(db_().getSheetByName('직원'), H.직원).find(s => s.직원ID === o.직원ID);
  if (!st) throw new Error('직원을 찾을 수 없어요.');
  const 월급여 = Number(String(o.월급여 || '').replace(/[^0-9]/g, '')) || Math.round(연봉 / 12);
  append_(sh, H.급여이력, { 이력ID: newId_('P'), 직원ID: o.직원ID, 이름: st.이름, 적용일: o.적용일,
    구분: PAY_KINDS.indexOf(o.구분) >= 0 ? o.구분 : (prev ? '정기인상' : '입사'), 연봉, 월급여,
    인상액: before ? 연봉 - before : '', '인상률(%)': before ? Math.round((연봉 - before) / before * 1000) / 10 : '',
    사유: o.사유 || '', 등록일: now_() });
  syncPay_(o.직원ID, st.이름);
  return true;
}
function deletePay(id) {
  requireOwner_();
  const sh = secret_().getSheetByName('급여이력');
  const r = rows_(sh, H.급여이력).find(x => x.이력ID === id);
  if (r) { sh.deleteRow(r._row); syncPay_(r.직원ID, r.이름); }
  return true;
}
function syncPay_(staffId, name) {
  const last = rows_(secret_().getSheetByName('급여이력'), H.급여이력).filter(r => r.직원ID === staffId && d_(r.적용일) <= today_())
    .sort((a, b) => d_(a.적용일) < d_(b.적용일) ? 1 : -1)[0];
  if (!last) return;
  const sh = secret_().getSheetByName('직원_민감');
  const cur = rows_(sh, H.직원_민감).find(x => x.직원ID === staffId);
  const row = {}; H.직원_민감.forEach(h => row[h] = cur ? cur[h] : '');
  row.직원ID = staffId; row.이름 = row.이름 || name; row['급여(연봉)'] = last.연봉; row.수정일 = now_();
  cur ? update_(sh, H.직원_민감, cur._row, row) : append_(sh, H.직원_민감, row);
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
  return rows_(db_().getSheetByName('현장'), H.현장).map(s => { const o = {}; H.현장.forEach(h => o[h] = s[h]); return o; }).reverse();
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
    append_(sh, H.현장, { 현장코드: code, 현장명: name, 연도: Number('20' + yy), 고객코드: customerCode || '', 상태: '진행', 등록일: today_() });
    return code;
  } finally { lock.releaseLock(); }
}

// 결재 목록 — 직원은 본인 것, 대표는 전체. 계좌번호는 여기 없음
function listApprovals() {
  const v = requireStaff_();
  const by = {};
  rows_(db_().getSheetByName('결재_지출내역'), H.결재_지출내역).forEach(l => { (by[l.문서번호] = by[l.문서번호] || []).push(l); });
  return rows_(db_().getSheetByName('결재'), H.결재)
    .filter(a => v.isOwner || String(a.기안자이메일).toLowerCase() === v.email)
    .map(a => { const o = {}; H.결재.forEach(h => o[h] = a[h] instanceof Date ? d_(a[h]) : a[h]); o.지출내역 = (by[a.문서번호] || []).map(l => ({ 일자: d_(l.일자), 구분: l.구분, 지출내역: l.지출내역, 공급가: l.공급가, 부가세: l.부가세 })); return o; })
    .sort((a, b) => ((b.상태 === '결재 대기') - (a.상태 === '결재 대기')) || String(b.기안일자).localeCompare(String(a.기안일자)));
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
    // 같은 달 번호 중 가장 큰 것 + 1 (과거 종이 기안 26-10-xx 와 겹치지 않게)
    const n = rows_(sh, H.결재).map(a => String(a.문서번호)).filter(x => x.indexOf(ym + '-') === 0)
      .reduce((m, x) => Math.max(m, parseInt(x.slice(ym.length + 1), 10) || 0), 0) + 1;
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


/* ================= 견적 모듈 =================
 * 단가 계산은 「아르띠꼬 상담견적 v.15」와 같다.
 *  - 마진적용 항목: 판매단가 = max(반올림(기준판매가 × (1−0.28) ÷ (1−마진)), 하한가)
 *  - 그 밖의 항목: 판매가 그대로
 *  - 반올림: 5만원 이상 1,000원 단위, 미만 100원 단위
 *  - 합계: 공급가 − 할인(만원) → 부가세 10% → 합계
 * 원가·마진율은 대표 화면에만 돌려준다. 직원·고객 화면에는 판매가만.
 */
const PUB_MARGIN = 0.28;
const MARGINS = [0.25, 0.26, 0.27, 0.28, 0.29, 0.30];

function setupCatalog() {
  const sh = db_().getSheetByName('단가표');
  if (sh.getLastRow() > 1) return;   // 이미 있으면 건드리지 않음
  const rows = DEFAULT_CATALOG.map(c => c.concat(['', 0, 0, '', 1, CATALOG_SRC]));
  sh.getRange(2, 1, rows.length, H.단가표.length).setValues(rows);
}

function rnd_(x) { return x >= 50000 ? Math.round(x / 1000) * 1000 : Math.round(x / 100) * 100; }
// 상담견적 v.15와 같은 순서: 원가가 있으면 원가 기준(실비=원가 그대로, 고정=판매가, 그 밖=원가÷(1−마진) 반올림, 하한가 이상)
function unitPrice_(p, mg) {
  const c = Number(p.원가) || 0;
  if (c || Number(p.실비) || Number(p.고정)) {
    if (Number(p.실비)) return c;
    if (Number(p.고정)) return Number(p.판매가) || 0;
    return Math.max(rnd_(c / (1 - mg)), Number(p.하한가) || 0);
  }
  if (Number(p.마진적용) && Number(p.기준판매가)) return Math.max(rnd_(Number(p.기준판매가) * (1 - PUB_MARGIN) / (1 - mg)), Number(p.하한가) || 0);
  return Number(p.판매가) || 0;
}
function autoQty_(p, py, bath) {
  if (p.기본수량 === 'py') return Number(py) || 0;
  if (p.기본수량 === 'bath') return Number(bath) || 1;
  return Number(p.기본수량) || 1;
}
function catalog_() {
  return rows_(db_().getSheetByName('단가표'), H.단가표).filter(p => p.키 && String(p.사용) !== '0');
}

// 화면용 단가표: 직원에겐 원가 칸을 빼고 준다
function getCatalog() {
  const v = requireStaff_();
  return {
    items: catalog_().map(p => {
      const o = { 키: p.키, 공정: p.공정, 품목: p.품목, 설명: p.설명, 단위: p.단위, 기본수량: p.기본수량, 기본체크: Number(p.기본체크) ? 1 : 0, 택1그룹: p.택1그룹, 기준판매가: Number(p.기준판매가) || 0, 판매가: Number(p.판매가) || 0, 하한가: Number(p.하한가) || 0, 마진적용: Number(p.마진적용) ? 1 : 0 };
      // 2026-10-30 대표 결정: 원가는 직원 전원 공개. 고객 상담 모드(별도 함수)에는 보내지 않음.
      o.원가 = Number(p.원가) || 0; o.실비 = Number(p.실비) ? 1 : 0; o.고정 = Number(p.고정) ? 1 : 0;
      return o;
    }),
    presets: PRESETS, order: CAT_ORDER, margins: MARGINS, defaultMargin: PUB_MARGIN, source: CATALOG_SRC
  };
}

/* ---- 고객 ---- */
function listCustomers() {
  requireStaff_();
  return rows_(db_().getSheetByName('고객'), H.고객).map(c => { const o = {}; H.고객.forEach(h => o[h] = c[h]); return o; }).reverse();
}
function saveCustomer(o) {
  const v = requireStaff_();
  if (!o.고객명) throw new Error('고객명을 적어 주세요 (성만, 예: 김OO).');
  if (o.연락처뒤4 && !/^\d{4}$/.test(String(o.연락처뒤4))) throw new Error('연락처는 뒤 4자리 숫자만 적어 주세요.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = db_().getSheetByName('고객');
    const all = rows_(sh, H.고객);
    const cur = o.고객코드 ? all.find(c => c.고객코드 === o.고객코드) : null;
    const row = {}; H.고객.forEach(h => row[h] = o[h] !== undefined ? o[h] : (cur ? cur[h] : ''));
    if (!cur) {
      const y = Utilities.formatDate(new Date(), TZ, 'yyyy');
      const n = all.filter(c => String(c.고객코드).indexOf(y + '-') === 0).length + 1;
      row.고객코드 = y + '-' + ('00' + n).slice(-3);         // 고객관리 툴과 같은 2026-026 형식
      row.등록일 = today_(); row.상태 = row.상태 || '상담';
      row.담당 = row.담당 || (v.staff ? v.staff.이름 : '대표');
    }
    cur ? update_(sh, H.고객, cur._row, row) : append_(sh, H.고객, row);
    return row.고객코드;
  } finally { lock.releaseLock(); }
}

/* ---- 견적 ---- */
// 서버에서 다시 계산 (화면 값은 믿지 않음)
function priceEstimate_(f, owner) {
  const mg = MARGINS.indexOf(Number(f.마진기준)) >= 0 ? Number(f.마진기준) : PUB_MARGIN;
  const cat = catalog_(); const byKey = {}; cat.forEach(p => byKey[p.키] = p);
  const lines = [];
  Object.keys(f.items || {}).forEach(k => {
    const it = f.items[k], p = byKey[k];
    if (!p || !it || !it.on) return;
    const q = (it.q !== null && it.q !== '' && it.q !== undefined) ? Number(it.q) : autoQty_(p, f.평형, f.욕실수);
    const over = Number(it.px) > 0 ? Number(it.px) : 0;   // 이 견적에서만 단가 직접 수정 (v.14와 같이 직원도 가능)
    const up = over || unitPrice_(p, mg);
    const cu = Number(p.원가) || 0;
    lines.push({ 키: k, 공정: p.공정, 품목: p.품목, 단위: p.단위, 수량: q, 단가: up, 금액: Math.round(up * q), 원가단가: cu, 원가금액: Math.round(cu * q), 직접수정: over ? 1 : 0 });
  });
  const order = CAT_ORDER;
  lines.sort((a, b) => order.indexOf(a.공정) - order.indexOf(b.공정));
  const sale = lines.reduce((s, l) => s + l.금액, 0);
  const cost = lines.reduce((s, l) => s + l.원가금액, 0);
  const disc = (Number(f['할인(만원)']) || 0) * 10000;
  const net = Math.max(0, sale - disc);
  const vat = Math.round(net * 0.1);
  return { mg, lines, sale, disc, net, vat, total: net + vat, cost, margin: net && cost ? (net - cost) / net : null };
}

// 화면에서 합계 미리 계산 (원가는 대표에게만)
function previewEstimate(f) {
  const v = requireStaff_();
  const r = priceEstimate_(f, v.isOwner);
  return r;
}

function listEstimates() {
  const v = requireStaff_();
  return rows_(db_().getSheetByName('견적'), H.견적).map(e => {
    const o = {}; H.견적.forEach(h => o[h] = e[h]);
    return o;
  }).reverse();
}

function getEstimate(no, ver) {
  const v = requireStaff_();
  const e = rows_(db_().getSheetByName('견적'), H.견적).find(x => x.견적번호 === no && Number(x.버전) === Number(ver));
  if (!e) throw new Error('견적을 찾지 못했어요.');
  const items = {};
  rows_(db_().getSheetByName('견적_항목'), H.견적_항목).filter(l => l.견적번호 === no && Number(l.버전) === Number(ver))
    .forEach(l => items[l.키] = { on: true, q: Number(l.수량), px: Number(l.직접수정) ? Number(l.단가) : 0 });
  const o = {}; H.견적.forEach(h => o[h] = e[h]); o.items = items;
  return o;
}

// 저장: 새 견적이면 번호 발급(Q26-10-01), asNewVersion이면 같은 번호의 다음 버전
function saveEstimate(f, asNewVersion) {
  const v = requireStaff_();
  if (!f.고객코드) throw new Error('고객을 먼저 골라 주세요.');
  const cust = rows_(db_().getSheetByName('고객'), H.고객).find(c => c.고객코드 === f.고객코드);
  if (!cust) throw new Error('고객 목록에 없는 고객이에요.');
  const r = priceEstimate_(f, v.isOwner);
  if (!r.lines.length) throw new Error('공사 항목을 하나 이상 골라 주세요.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const d = db_(), sh = d.getSheetByName('견적'), ls = d.getSheetByName('견적_항목');
    const all = rows_(sh, H.견적);
    let no = f.견적번호, ver = Number(f.버전) || 0;
    if (!no) {
      const ym = Utilities.formatDate(new Date(), TZ, 'yy-MM');
      const n = new Set(all.filter(e => String(e.견적번호).indexOf('Q' + ym + '-') === 0).map(e => e.견적번호)).size + 1;
      no = 'Q' + ym + '-' + ('0' + n).slice(-2); ver = 1;
    } else if (asNewVersion) {
      ver = Math.max.apply(null, all.filter(e => e.견적번호 === no).map(e => Number(e.버전))) + 1;
    }
    const row = {
      견적번호: no, 버전: ver, 고객코드: cust.고객코드, 고객명: cust.고객명, 현장코드: cust.현장코드 || '', 공사범위: f.공사범위 || '',
      평형: f.평형 || '', 욕실수: f.욕실수 || '', 마진기준: r.mg, '할인(만원)': Number(f['할인(만원)']) || 0,
      공급가: r.net, 부가세: r.vat, '합계(VAT포함)': r.total, 원가합계: r.cost, 상태: f.상태 || '작성중',
      작성자: v.staff ? v.staff.이름 : '대표', 작성자이메일: v.email, 작성일시: now_(), 메모: f.메모 || ''
    };
    const cur = all.find(e => e.견적번호 === no && Number(e.버전) === ver);
    if (cur) {
      update_(sh, H.견적, cur._row, row);
      rows_(ls, H.견적_항목).filter(l => l.견적번호 === no && Number(l.버전) === ver).map(l => l._row).sort((a, b) => b - a).forEach(rw => ls.deleteRow(rw));
    } else append_(sh, H.견적, row);
    const lineRows = r.lines.map(l => H.견적_항목.map(h => h === '견적번호' ? no : h === '버전' ? ver : l[h]));
    if (lineRows.length) ls.getRange(ls.getLastRow() + 1, 1, lineRows.length, H.견적_항목.length).setValues(lineRows);
    return { 견적번호: no, 버전: ver, 합계: r.total };
  } finally { lock.releaseLock(); }
}


/* ---- 원가 가져오기 (대표가 한 번 실행) ----
 * 상담견적 v.15의 원가를 대표 드라이브의 「단가표 원가 v.15 (대표 전용)」 시트에서 읽어 단가표 시트에 채운다.
 * 원가는 코드(GitHub)에 넣지 않는다. 시트 열: 키, 원가, 실비, 고정, 하한가, 원가근거
 */
function importCosts(sheetId) {
  requireOwner_();
  sheetId = sheetId || PropertiesService.getScriptProperties().getProperty('COST_SHEET_ID');
  if (!sheetId) throw new Error('원가 시트 ID가 없어요. 설치안내의 "원가 가져오기"를 보세요.');
  const src = SpreadsheetApp.openById(sheetId).getSheets()[0].getDataRange().getValues();
  const head = src[0].map(String), idx = n => head.indexOf(n);
  const m = {}; src.slice(1).forEach(r => { if (r[idx('키')]) m[r[idx('키')]] = r; });
  const sh = db_().getSheetByName('단가표');
  let n = 0;
  rows_(sh, H.단가표).forEach(p => {
    const r = m[p.키]; if (!r) return;
    p.원가 = Number(r[idx('원가')]) || 0; p.실비 = Number(r[idx('실비')]) ? 1 : 0; p.고정 = Number(r[idx('고정')]) ? 1 : 0;
    if (Number(r[idx('하한가')])) p.하한가 = Number(r[idx('하한가')]);
    p.원가근거 = r[idx('원가근거')] || '';
    update_(sh, H.단가표, p._row, p); n++;
  });
  return n + '개 항목 원가 반영';
}

// 대표가 한 번 실행: 대표 드라이브(내 드라이브)의 「단가표 원가 v.15 (대표 전용 · 공유 금지)」에서 원가를 가져온다
function importCostsV15() {
  return importCosts('1_kkJwsyP075YU4hgQgJp0PL8OSJtCltXToTFhhz6ghU');
}


/* ================= 초기 데이터 가져오기 (대표가 한 번 실행) =================
 * 공유드라이브 「홈퍼니싱 본사 결재 서류 › 0. 홈퍼니싱」을 읽기만 해서 만든 표 3개
 * (대표 내 드라이브 「인트라넷 초기 데이터 (대표 전용)」 폴더)를 인트라넷 시트로 옮긴다.
 * 원본 공유드라이브 파일은 건드리지 않는다. 이미 있는 코드는 건너뛴다(다시 실행해도 중복 없음).
 */
const SEED = {
  현장: '1VOoX7nzDrv9dguaZV7C5LjyAwIW-uUNz07TddPFWL-c',
  업체: '1Nk9Gju0_aJC3NicgAW5NImBJDHj6_8xlV3BrdnqS6bI',
  서식: '1c8zwXq9bU7lj8GqAKAtUYnRCwbqpUlvI-NGZNXAqsYc'
};
function seedRows_(id) {
  const v = SpreadsheetApp.openById(id).getSheets()[0].getDataRange().getValues();
  const head = v[0].map(h => String(h).trim());
  return v.slice(1).filter(r => r.some(x => String(x).trim() !== '')).map(r => { const o = {}; head.forEach((h, i) => o[h] = typeof r[i] === 'string' ? r[i].trim() : r[i]); return o; });
}
function importSeed() {
  requireOwner_();
  const d = db_(), out = [];
  // 현장
  const sh = d.getSheetByName('현장'), have = new Set(rows_(sh, H.현장).map(x => x.현장코드));
  let n = 0;
  seedRows_(SEED.현장).forEach(r => {
    if (have.has(r.현장코드)) return;
    append_(sh, H.현장, { 현장코드: r.현장코드, 현장명: r.현장명, 발주처: r.발주처, 연도: r.연도, 구분: r.구분, 상태: '', 등록일: today_(),
      폴더링크: r.폴더ID ? 'https://drive.google.com/drive/folders/' + r.폴더ID : '', 메모: r.메모 || '' });
    n++;
  });
  out.push('현장 ' + n + '곳');
  // 업체 (계좌번호 없음)
  const vs = d.getSheetByName('업체'), hv = new Set(rows_(vs, H.업체).map(x => x.업체코드));
  n = 0;
  seedRows_(SEED.업체).forEach(r => { if (hv.has(r.업체코드)) return; append_(vs, H.업체, r); n++; });
  out.push('업체 ' + n + '곳');
  // 서식
  const fs = d.getSheetByName('서식'), hf = new Set(rows_(fs, H.서식).map(x => x.서식명));
  n = 0;
  seedRows_(SEED.서식).forEach(r => { if (hf.has(r.서식명)) return; append_(fs, H.서식, { 분류: r.분류, 서식명: r.서식명, 링크: 'https://drive.google.com/file/d/' + r.파일ID + '/view', 결재종류: r.결재종류 }); n++; });
  out.push('서식 ' + n + '개');
  return out.join(' · ') + ' 가져옴';
}

function listVendors() {
  requireStaff_();
  return rows_(db_().getSheetByName('업체'), H.업체).map(x => { const o = {}; H.업체.forEach(h => o[h] = x[h]); return o; });
}
function listForms() {
  requireStaff_();
  return rows_(db_().getSheetByName('서식'), H.서식).map(x => { const o = {}; H.서식.forEach(h => o[h] = x[h]); return o; });
}

/* ================= 과거 기안품의서 가져오기 (2026-10-30 · 대표가 실행) =================
 * 원본 월별/연도별 기안품의서 엑셀(.xls)을 읽기만 한다. 원본은 이동·수정·삭제하지 않는다.
 * 방법: 원본을 대표 내 드라이브에 '임시 구글시트 사본'으로 만들어 읽고 → 결재 시트에 한 건씩 기록 → 임시 사본은 휴지통으로.
 * 계좌번호는 대표 전용 시트(결재_계좌)로만. 상태는 '과거 기록', 직원 화면에는 나오지 않음(대표 결재함에만).
 * 6분 실행 제한이 있어 한 번에 다 못 끝나면 "다시 실행하세요"라고 나옴 → 같은 함수를 다시 실행 (중복 없이 이어서 함).
 * 고급 서비스 Drive API(v3) 사용 — appsscript.json 에 이미 켜 둠.
 */
const AP_HISTORY = [
  ['20년6월', '18NvglFaqGCDdlo495MJYNQfqorQoyXYb'],
  ['20년7월', '1Pu56lwx1XsWiDcXZgvk6sRBFia0sr1L_'],
  ['20년8,9월', '1HYmyjSvbRqSGJfXwvXh7WSoRwuWHAcdL'],
  ['20년11,12월', '1xkFJQ_nq4SF-HK87zI5dFTdwAbAsNOG9'],
  ['21년(본사,기성)', '1ki7hyo5lYh6RGG-BB8j7gdxk0jb91DiA'],
  ['23년(현장)', '1BRiXXMLCvJd3JUJdxAlRQx-udPwu0JaJ'],
  ['24년(현장)', '1VFGYWMfiQQ_ZvcZ80CVjq1iZW_Q4ll29'],
  ['26년(본사,기성)', '1AZyIjyqOIGNkIEiB0u4EuSNP-QdxjbwA']
];
function importApprovalHistory() {
  requireOwner_();
  const t0 = Date.now(), p = PropertiesService.getScriptProperties();
  const done = JSON.parse(p.getProperty('AP_HIST_DONE') || '[]');
  const d = db_(), sh = d.getSheetByName('결재'), ls = d.getSheetByName('결재_지출내역');
  const acc = secret_().getSheetByName('결재_계좌');
  let ks = d.getSheetByName('결재_가져오기');
  if (!ks) { ks = d.insertSheet('결재_가져오기'); initSheet_(ks, ['키', '문서번호']); }
  const keys = new Set(ks.getDataRange().getValues().slice(1).map(r => String(r[0])));
  const used = new Set(rows_(sh, H.결재).map(r => String(r.문서번호)));
  const out = [];
  for (const [name, id] of AP_HISTORY) {
    if (done.indexOf(id) >= 0) continue;
    if (Date.now() - t0 > 4 * 60 * 1000) { out.push('시간이 다 돼서 멈춤 → importApprovalHistory 를 한 번 더 실행하세요'); break; }
    const tmp = Drive.Files.copy({ name: '[임시·읽기용] ' + name, mimeType: MimeType.GOOGLE_SHEETS }, id, { supportsAllDrives: true });
    let docs;
    try { docs = parseApprovalBook_(SpreadsheetApp.openById(tmp.id), name, 'https://drive.google.com/file/d/' + id + '/view'); }
    finally { DriveApp.getFileById(tmp.id).setTrashed(true); }
    const rowsA = [], rowsL = [], rowsC = [], rowsK = [];
    docs.forEach(x => {
      const key = [x.종류, x.문서번호, x.제목, x['금액(VAT포함)'], x.현장명].join('|');
      if (keys.has(key)) return;
      keys.add(key);
      apFinish_(x, used);
      rowsA.push(H.결재.map(h => x[h] === undefined ? '' : x[h]));
      x._items.forEach((it, i) => rowsL.push([x.문서번호, i + 1, it.일자, it.구분, it.지출내역, it.공급가, it.부가세]));
      if (x._계좌) rowsC.push([x.문서번호, x['업체명(연락처)'], x._계좌, '원본 ' + name]);
      rowsK.push([key, x.문서번호]);
    });
    putRows_(sh, rowsA); putRows_(ls, rowsL); putRows_(acc, rowsC); putRows_(ks, rowsK);
    done.push(id); p.setProperty('AP_HIST_DONE', JSON.stringify(done));
    out.push(name + ' ' + rowsA.length + '건');
  }
  if (done.length === AP_HISTORY.length) out.push('과거 기안품의서 가져오기 완료');
  Logger.log(out.join(' · '));
  return out.join(' · ');
}
function putRows_(sh, rows) { if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows); }

// 문서 한 묶음 = '문서번호' 줄부터 다음 '문서번호' 줄 전까지 (본사 양식 그대로)
function parseApprovalBook_(ss, src, link) {
  const docs = [];
  const sv = x => x instanceof Date ? d_(x) : (typeof x === 'number' ? String(Math.round(x * 100) / 100) : String(x == null ? '' : x).trim());
  const ns = x => sv(x).replace(/\s/g, '');
  // 글에서 금액을 뽑을 때는 첫 번째 숫자 묶음만 (예: "1,000,000원(공급가 909,091…)" → 1000000)
  const num = x => { if (typeof x === 'number') return Math.round(x); const m = String(x || '').match(/-?\d[\d,]*/); return m ? Number(m[0].replace(/,/g, '')) : ''; };
  const after = t => t.indexOf(':') >= 0 ? t.slice(t.indexOf(':') + 1).trim() : '';
  ss.getSheets().forEach(s => {
    const nm = s.getName(); if (nm.indexOf('기안') < 0) return;
    const kind = '기안·품의' + nm.replace('기안.품의', '').replace(/\s*\(\d\)$/, '');
    const v = s.getDataRange().getValues();
    const starts = []; v.forEach((r, i) => { if (ns(r[0]) === '문서번호') starts.push(i); });
    starts.forEach((r0, k) => {
      const r1 = k + 1 < starts.length ? starts[k + 1] : v.length;
      const x = { 문서번호: sv(v[r0][1]), 종류: kind, 현장명: '', 기안일자: '', 기안부서: '', 기안자: '', 제목: '', '업체명(연락처)': '', 공급가합계: '', 부가세합계: '',
        '금액(VAT포함)': '', 지급요청일: '', 증빙자료: '', 비고: '', _요약: '', _items: [], _src: src, _link: link };
      v[r0].forEach((c, j) => { if (ns(c) === '현장명') x.현장명 = (v[r0].slice(j + 1).map(sv).find(t => t) || ''); });
      let hdr = null, table = false;
      for (let r = r0 + 1; r < r1; r++) {
        const row = v[r], c0 = ns(row[0]);
        if (c0 === '기안일자') x.기안일자 = sv(row[1]);
        else if (c0 === '기안부서') x.기안부서 = sv(row[1]);
        else if (c0 === '기안자') x.기안자 = sv(row[1]);
        else if (c0 === '제목') x.제목 = sv(row[1]);
        else if (c0 === '비고') x.비고 = row.slice(1).map(sv).filter(t => t).join(' ');
        else if (c0 === '일자' && row.some(c => ns(c) === '공급가')) { hdr = {}; row.forEach((c, j) => { if (ns(c)) hdr[ns(c)] = j; }); table = true; }
        else if (table) {
          if (row.slice(0, 4).some(c => sv(c).indexOf('合') >= 0 || ['합계', '計'].indexOf(ns(c)) >= 0)) {
            table = false;
            if (hdr.공급가 !== undefined) { x.공급가합계 = num(row[hdr.공급가]); x.부가세합계 = num(row[hdr.부가세 !== undefined ? hdr.부가세 : hdr.공급가 + 1]); }
            continue;
          }
          if (c0.indexOf('2.') === 0) table = false;
          else {
            const g = key => hdr[key] !== undefined ? row[hdr[key]] : '';
            const desc = sv(g('지출내역')), a = num(g('공급가'));
            if (desc || a !== '') x._items.push({ 일자: sv(row[0]), 구분: sv(row[hdr.구분 !== undefined ? hdr.구분 : 1]), 지출내역: desc, 공급가: a, 부가세: num(g('부가세')) });
            continue;
          }
        }
        const t = sv(row[0]);
        if (/^1\./.test(t) && t.indexOf('지출') >= 0) x._요약 = after(t);
        else if (/^2\./.test(t) && t.indexOf('업체') >= 0) x['업체명(연락처)'] = after(t);
        else if (/^3\./.test(t) && t.indexOf('금') >= 0) {
          const n = row.slice(1).find(c => typeof c === 'number'); x['금액(VAT포함)'] = n !== undefined ? Math.round(n) : num(after(t));
          const m = after(t).match(/\d[\d,]*/);   // "67,000,0000원" 처럼 쉼표 자리가 틀린 원본은 표시만 해 둠 (금액은 원본 그대로)
          if (n === undefined && m && m[0].indexOf(',') >= 0 && !/^\d{1,3}(,\d{3})+$/.test(m[0])) x._확인 = '원본 금액 표기 확인 필요(' + m[0] + ')';
        }
        else if (/^4\./.test(t) && t.indexOf('지급') >= 0) x.지급요청일 = after(t);
        else if (/^5\./.test(t) && t.indexOf('계좌') >= 0) x._계좌 = after(t);
        else if (/^6\./.test(t) && t.indexOf('증빙') >= 0) x.증빙자료 = after(t);
      }
      if (!x.문서번호 && !x.제목) return;
      if (x['금액(VAT포함)'] === '' && x.공급가합계 !== '') x['금액(VAT포함)'] = (x.공급가합계 || 0) + (x.부가세합계 || 0);
      docs.push(x);
    });
  });
  return docs;
}
// 날짜 형식 통일, 제목 없으면 지출내역으로, 문서번호가 겹치면 -b -c (원본 번호는 비고에)
function apFinish_(x, used) {
  const t = String(x.기안일자 || '').trim();
  let m = t.match(/^(\d{2,4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/);
  const p2 = n => ('0' + n).slice(-2);
  if (m) { let y = +m[1]; if (y < 100) y += 2000; x.기안일자 = y + '-' + p2(m[2]) + '-' + p2(m[3]); }
  else if ((m = t.match(/^(\d{1,2})\/(\d{1,2})/)) && /^\d{2}-/.test(x.문서번호)) x.기안일자 = '20' + x.문서번호.slice(0, 2) + '-' + p2(m[1]) + '-' + p2(m[2]);
  if (!x.제목) x.제목 = x._요약 || '(제목 없음)';
  if (x._요약 && x._요약 !== x.제목 && !x._items.length) x.비고 = '지출내역: ' + x._요약 + (x.비고 ? ' / ' + x.비고 : '');
  const base = x.문서번호 || '무번호'; let no = base, k = 1;
  while (used.has(no)) { k++; no = base + '-' + String.fromCharCode(96 + k); }
  if (no !== base) x.비고 = (x.비고 ? x.비고 + ' / ' : '') + '원본 문서번호 ' + base;
  used.add(no); x.문서번호 = no;
  if (x._확인) x.비고 = (x.비고 ? x.비고 + ' / ' : '') + x._확인;
  x.증빙파일 = x._link; x.상태 = '과거 기록'; x.결재자 = '(종이 결재)'; x.작성일시 = '원본 ' + x._src;
}
