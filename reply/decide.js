// 예약 작업용 판단기: 메일 목록(JSON)을 받아 건너뛸지·유형·초안 본문을 정한다.
// 사용: node decide.js < mails.json
// 입력: [{ threadId, messageId, from, subject, body, listUnsubscribe, lastFromMe, hasDraft }]
// 출력: [{ threadId, messageId, action: 'draft'|'skip', reason, type, to, subject, body, needsFill }]
// 이 파일과 gmail-draft-bot.gs 는 메일을 보내지 않는다. 판단만 한다.
const path = require('path');
const bot = require(path.join(__dirname, 'gmail-draft-bot.gs'));
const NEEDS_FILL = { T04: true, T07: true };

let input = '';
process.stdin.on('data', d => (input += d));
process.stdin.on('end', () => {
  const mails = JSON.parse(input || '[]');
  const out = mails.map(m => {
    const base = { threadId: m.threadId, messageId: m.messageId, subject: m.subject };
    let reason = bot.skipReason(m.from, m.subject, !!m.listUnsubscribe);
    if (!reason && m.lastFromMe) reason = '마지막 메일이 내 답장';
    if (!reason && m.hasDraft) reason = '이미 초안 있음';
    if (reason) return { ...base, action: 'skip', reason };
    const type = bot.classify(m.subject, m.body);
    if (!type) return { ...base, action: 'skip', reason: '정해진 유형 아님' };
    if (!bot.CONFIG.APPROVED[type.id]) return { ...base, action: 'skip', reason: '문구 미승인', type: type.id };
    const email = (String(m.from).match(/<([^>]+)>/) || [, m.from])[1].trim();
    const subj = /^re:/i.test(m.subject || '') ? m.subject : 'Re: ' + (m.subject || '');
    return { ...base, action: 'draft', type: type.id + ' ' + type.name, to: email, subject: subj,
      body: bot.buildBody(type.id, m.from), needsFill: !!NEEDS_FILL[type.id] };
  });
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
});
