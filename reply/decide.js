// 예약 작업용 판단기: 메일 목록(JSON)을 받아 자동 발송·직접 처리·건너뛰기를 정한다.
// 사용: node decide.js < mails.json
// 입력: [{ threadId, messageId, from, subject, body, listUnsubscribe, lastFromMe, hasDraft, repliedToday }]
//   repliedToday: 오늘(최근 24시간) 이 주소로 자동답장을 이미 보냈으면 true
// 출력: [{ threadId, messageId, action: 'send'|'manual'|'skip', reason, type, to, subject, body }]
// 2026-11-19 형 결정: 초안 저장 대신 자동 발송. 단 ⟦ ⟧ 칸이 있는 유형(T04·T07)과
// 금액·할인·공사 기간 약속이 들어간 본문은 보내지 않고 'manual'(카톡으로 직접 처리 요청).
// 이 파일은 판단만 한다. 실제 발송은 예약 작업이 Gmail reply로 한다.
const path = require('path');
const bot = require(path.join(__dirname, 'gmail-draft-bot.gs'));

const FOOTER = '자동 발송된 안내 메일입니다. 궁금하신 점은 전화로 한 번 더 확인 부탁드립니다.';
const MANUAL_TYPES = { T04: '견적서 날짜를 형이 채워야 함', T07: '서류를 형이 첨부해야 함' };
// 자동응답·반송 메일에는 답하지 않음 (답장 주고받기 무한 반복 방지)
const AUTO_SUBJECT = /자동\s*응답|자동\s*회신|부재중|auto[- ]?reply|automatic reply|out of office|undeliver|delivery status|returned mail|반송/i;
// 금액·할인·공사 기간 약속 표현 (본문에 있으면 발송 금지)
const PROMISE = /\d[\d,]*(\.\d+)?\s*(천|만|억)?\s*원(?![가-힣])|할인|\d+\s*%|\d+\s*(일|주|개월|달)\s*(만에|안에|이내|내로|걸려|소요)|공사\s*기간은\s*\d/;

function finalBody(typeId, from) {
  return bot.buildBody(typeId, from) + '\n\n' + FOOTER;
}

function decide(m) {
  const base = { threadId: m.threadId, messageId: m.messageId, subject: m.subject };
  let reason = bot.skipReason(m.from, m.subject, !!m.listUnsubscribe);
  if (!reason && AUTO_SUBJECT.test(m.subject || '')) reason = '자동응답·반송 메일';
  if (!reason && m.lastFromMe) reason = '마지막 메일이 내 답장';
  if (!reason && m.repliedToday) reason = '오늘 이미 자동답장 보낸 사람';
  if (reason) return { ...base, action: 'skip', reason };
  const type = bot.classify(m.subject, m.body);
  if (!type) return { ...base, action: 'skip', reason: '정해진 유형 아님' };
  if (!bot.CONFIG.APPROVED[type.id]) return { ...base, action: 'skip', reason: '문구 미승인', type: type.id };
  const email = (String(m.from).match(/<([^>]+)>/) || [, m.from])[1].trim();
  const typeName = type.id + ' ' + type.name;
  if (MANUAL_TYPES[type.id]) return { ...base, action: 'manual', type: typeName, to: email, reason: MANUAL_TYPES[type.id] };
  const body = finalBody(type.id, m.from);
  if (PROMISE.test(body)) return { ...base, action: 'manual', type: typeName, to: email, reason: '본문에 금액·할인·기간 표현' };
  const subj = /^re:/i.test(m.subject || '') ? m.subject : 'Re: ' + (m.subject || '');
  return { ...base, action: 'send', type: typeName, to: email, subject: subj, body };
}

module.exports = { decide, finalBody, FOOTER, PROMISE, AUTO_SUBJECT, MANUAL_TYPES };

if (require.main === module) {
  let input = '';
  process.stdin.on('data', d => (input += d));
  process.stdin.on('end', () => {
    process.stdout.write(JSON.stringify(JSON.parse(input || '[]').map(decide), null, 2) + '\n');
  });
}
