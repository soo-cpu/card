// 답장 초안 봇 시험판 자동 테스트 — node reply/test/run-tests.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const dir = path.join(__dirname, '..');
const bot = require(path.join(dir, 'gmail-draft-bot.gs'));

let pass = 0;
function t(name, fn) { fn(); pass++; console.log('  ✓ ' + name); }

console.log('1) 분류 (가짜 고객 메일)');
const cases = [
  ['인테리어 견적 문의드립니다', '구리 롯데캐슬 34평 아파트 전체 리모델링 비용이 궁금합니다.', 'T01'],
  ['견적 부탁드려요', '입주 전에 인테리어를 하려고 하는데 얼마 정도 드나요?', 'T01'],
  ['욕실 공사 문의', '화장실 1개만 리모델링하면 견적이 얼마나 나올까요?', 'T02'],
  ['주방 견적', '싱크대 교체 비용 알고 싶습니다', 'T02'],
  ['사무실 인테리어 견적 요청', '별내 상가 2층 사무실 40평 견적 부탁드립니다', 'T03'],
  ['학원 인테리어', '학원 오픈 예정인데 금액이 어느 정도일까요', 'T03'],
  ['견적서 문의', '지난주 실측하셨는데 견적서는 언제 받을 수 있을까요?', 'T04'],
  ['회사소개서 요청', '업체 선정 검토 중이라 회사소개서 보내주실 수 있을까요?', 'T05'],
  ['지명원 송부 요청', '귀사 지명원 송부 부탁드립니다.', 'T05'],
  ['시공 사례', '비슷한 평수 시공 사례 사진 받을 수 있을까요', 'T06'],
  ['서류 요청', '계약 진행을 위해 사업자등록증 사본과 통장사본 보내주세요. 제출 부탁드립니다.', 'T07'],
  ['실측 일정', '토요일 오전 실측 방문 가능할까요?', 'T08'],
  ['공사 일정 문의', '착공하면 공사 기간은 며칠 정도 걸리나요?', 'T09'],
  ['일정 변경 요청', '내일 방문 약속을 다음 주로 변경할 수 있을까요?', 'T10'],
  ['미팅 취소', '목요일 상담 미팅은 취소해야 할 것 같습니다', 'T10'],
];
for (const [s, b, want] of cases) {
  t(`${want} ← ${s}`, () => assert.strictEqual((bot.classify(s, b) || {}).id, want));
}

console.log('2) 분류 안 함 (정해진 유형 아님)');
const none = [
  ['[한국AI통신] 사업자 전환 신청이 반려되었습니다', '반려 사유 · 사업자등록증이 확인되지 않습니다. 다시 확인해 주세요'],
  ['감사합니다', '어제 공사 마무리 잘 해 주셔서 고맙습니다'],
  ['세금계산서 발행', '11월분 세금계산서 발행했습니다'],
];
for (const [s, b] of none) t(`없음 ← ${s}`, () => assert.strictEqual(bot.classify(s, b), null));

console.log('3) 건너뛰기');
t('회사 주소(내 답장)', () => assert.ok(bot.skipReason('최윤수 <soo@artico-studio.com>', '테스트', false)));
t('네이버·한메일·개인 Gmail은 통과', () => ['soo17115@naver.com','woo17115@hanmail.net','soo17115@gmail.com'].forEach(a => assert.strictEqual(bot.skipReason('x <'+a+'>', '견적 문의', false), null)));
t('상담 시간 서명', () => assert.ok(bot.CONFIG.SIGNATURE.includes('상담 시간 평일 9시~18시')));
t('no-reply', () => assert.ok(bot.skipReason('Google <no-reply@accounts.google.com>', '보안 알림', false)));
t('간편견적 알림', () => assert.ok(bot.skipReason('누군가 <a@b.com>', '[간편견적 신규상담] 홍길동 · 31평', false)));
t('뉴스레터', () => assert.ok(bot.skipReason('가게 <shop@b.com>', '이번 주 소식', true)));
t('일반 고객은 통과', () => assert.strictEqual(bot.skipReason('홍길동 <hong@naver.com>', '견적 문의', false), null));

console.log('4) 고객 이름·초안 본문');
t('한글 이름', () => assert.strictEqual(bot.customerName('"홍길동" <hong@naver.com>'), '홍길동 고객님'));
t('영문·없음', () => assert.strictEqual(bot.customerName('hong@naver.com'), '고객님'));
t('서명 붙음', () => assert.ok(bot.buildBody('T01', '홍길동 <h@n.com>').includes('대표번호 1566-5904')));
t('T07 확인 줄', () => assert.ok(bot.buildBody('T07', 'x@y.com').startsWith('[보내기 전')));
t('{고객} 남지 않음', () => Object.keys(bot.TEMPLATES).forEach(k => assert.ok(!bot.buildBody(k, 'a@b.c').includes('{고객}'))));

console.log('5) 안전');
const code = fs.readFileSync(path.join(dir, 'gmail-draft-bot.gs'), 'utf8').replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '');
t('보내기·전달·삭제 코드 없음', () => {
  for (const bad of [/\.send\w*\(/, /sendEmail/, /\.forward\(/, /\.reply\(/, /\.replyAll\(/, /moveToTrash/, /\.trash\(/, /MailApp/, /UrlFetchApp/]) {
    assert.ok(!bad.test(code), '금지 코드 발견: ' + bad);
  }
});
t('기본은 시험 모드', () => assert.strictEqual(bot.CONFIG.DRY_RUN, true));
t('승인 스위치 10개 (형 승인 2026-11-18)', () => assert.strictEqual(Object.keys(bot.CONFIG.APPROVED).length, 10));
t('서명에 대표 이름', () => assert.ok(bot.CONFIG.SIGNATURE.startsWith('대표 최윤수 드림')));
t('문구에 금액(원) 없음', () => Object.values(bot.TEMPLATES).forEach(s => assert.ok(!/\d\s*(만\s*)?원/.test(s))));

console.log('6) 설계 문서와 문구가 같음');
const md = fs.readFileSync(path.join(dir, '답장 자동화 설계 2026-11-18 v1.md'), 'utf8');
for (const id of Object.keys(bot.TEMPLATES)) {
  t(id, () => {
    const m = md.match(new RegExp('### ' + id + ' [^\\n]*\\n[\\s\\S]*?```text\\n([\\s\\S]*?)\\n```'));
    assert.ok(m, id + ' 문서에 없음');
    assert.strictEqual(m[1], bot.TEMPLATES[id]);
  });
}
console.log('7) 자동 발송 규칙 (2026-11-19)');
const d = require(path.join(dir, 'decide.js'));
const M = o => Object.assign({ threadId: 't', messageId: 'm', from: '홍길동 <hong@naver.com>', subject: '견적 문의', body: '아파트 32평 리모델링 견적', lastFromMe: false, hasDraft: false, repliedToday: false }, o);
t('문의 메일은 send', () => assert.strictEqual(d.decide(M({})).action, 'send'));
t('맨 끝 안내 문구', () => assert.ok(d.decide(M({})).body.endsWith(d.FOOTER)));
t('하루 1번만', () => assert.strictEqual(d.decide(M({ repliedToday: true })).action, 'skip'));
t('자동응답 메일 금지', () => assert.strictEqual(d.decide(M({ subject: '[자동응답] 부재중입니다 견적' })).action, 'skip'));
t('광고 금지', () => assert.strictEqual(d.decide(M({ subject: '(광고) 인테리어 견적 할인' })).action, 'skip'));
t('no-reply 금지', () => assert.strictEqual(d.decide(M({ from: 'x <no-reply@shop.com>' })).action, 'skip'));
t('뉴스레터 금지', () => assert.strictEqual(d.decide(M({ listUnsubscribe: true })).action, 'skip'));
t('T04·T07은 보내지 않음', () => {
  assert.strictEqual(d.decide(M({ subject: '견적서 문의', body: '견적서 언제 받을 수 있나요' })).action, 'manual');
  assert.strictEqual(d.decide(M({ subject: '서류', body: '사업자등록증 보내주세요' })).action, 'manual');
});
t('보내는 문구 8개에 금액·할인·기간 약속 없음', () => Object.keys(bot.TEMPLATES).filter(k => !d.MANUAL_TYPES[k]).forEach(k => assert.ok(!d.PROMISE.test(d.finalBody(k, 'a@b.c')), k)));
t('약속 감지기 작동', () => ['500만원', '10% 할인', '3주 만에 끝', '공사 기간은 4주'].forEach(x => assert.ok(d.PROMISE.test(x), x)));

console.log(`\n모두 통과: ${pass}개`);
