// 현장소통 Code.gs v3 시험 (2026-11-20): node intranet/tools/test/fstaff_v3_test.js
// 시간이 끝난 출입증이 비밀번호 틀린 횟수에 들어가지 않는지 + 나머지 잠금·입장권·고객 확인 번호는 그대로인지 (서버만, 브라우저 없음)
const crypto = require('crypto');
const makeServer = require('./gs_field_harness.js');
const R = []; const ok = (n, v, x) => { R.push(!!v); console.log(v ? '통과' : '실패', n, x === undefined ? '' : String(x).slice(0, 200)); };

const KEY = crypto.randomBytes(32).toString('base64url');
const S = makeServer(); S.setPw('pw-test-77'); S.setProp('FIELD_STAFF_KEY', KEY);
const fails = () => Number((S.st.cache.pwfail || {}).v || 0);

// 1. 출입증 받기 → 6시간 지나 끝나게
const t1 = S.post({ a: 'ticket', k: S.ticket(KEY, { who: '정진혁' }) }).token;
ok('v3-1: 출입증 받음', /^[0-9a-f]{64}$/.test(t1 || ''));
S.advance(6 * 36e5 + 1000);
const e1 = S.post({ a: 'sites', pw: 'T:' + t1 });
ok('v3-2: 끝난 출입증 → 거절, 화면이 알아보는 입장권 안내', e1.ok === false && /입장권 시간이 끝났어요/.test(e1.error || ''), e1.error);
ok('v3-3: 끝난 출입증 한 번은 틀린 횟수 0', fails() === 0, fails());

// 2. 끝난 출입증으로 20번 요청(탭 여러 개가 자동으로 다시 부르는 상황) → 비밀번호는 잠기지 않음
for (let i = 0; i < 20; i++) S.post({ a: i % 2 ? 'sites' : 'login', pw: 'T:' + t1 });
ok('v3-4: 끝난 출입증 20번 → 틀린 횟수 그대로 0', fails() === 0, fails());
ok('v3-5: 그 뒤 맞는 비밀번호로 바로 로그인 됨 (예전에는 15분 잠김)', S.post({ a: 'login', pw: 'pw-test-77' }).ok);

// 3. 출입증 모양의 아무 값(가짜)도 잠금에 안 들어가지만, 통과도 안 됨
for (let i = 0; i < 12; i++) S.post({ a: 'login', pw: 'T:' + String(i % 10).repeat(40) });
ok('v3-6: 출입증 모양 가짜 12번 → 거절만, 잠금 없음', fails() === 0 && S.post({ a: 'login', pw: 'pw-test-77' }).ok);
ok('v3-7: 출입증 모양 값은 관리 화면을 열지 못함', ['sites', 'login', 'addSite'].every(a => S.post({ a, pw: 'T:' + 'a'.repeat(64), name: 'x' }).ok === false));

// 4. 비밀번호 추측은 예전처럼 10번에 잠김 (모양이 다른 'T:' 값 포함)
delete S.st.cache.pwfail;
const wrong = ['x1', 'x2', 'T:', 'T:null', 'T:bogus', 'T:' + 'a'.repeat(31), 'T:' + 'a'.repeat(81), 'T:' + 'a-'.repeat(20), '', 'x10'];
wrong.forEach(pw => S.post({ a: 'login', pw }));
ok('v3-8: 틀린 비밀번호·모양 다른 T: 값 10번 → 틀린 횟수 10', fails() === 10, fails());
ok('v3-9: 잠금 중 맞는 비밀번호도 막힘 (예전 그대로)', /잠겼/.test(S.post({ a: 'login', pw: 'pw-test-77' }).error || ''));
const t2 = S.post({ a: 'ticket', k: S.ticket(KEY, { who: '이봄이' }) }).token;
ok('v3-10: 잠금 중에도 살아 있는 출입증은 통과 (예전 그대로)', S.post({ a: 'sites', pw: 'T:' + t2 }).ok);
ok('v3-11: 잠금 중 끝난 출입증은 입장권 안내 (잠금 횟수 안 늘어남)', /입장권/.test(S.post({ a: 'sites', pw: 'T:' + t1 }).error || '') && fails() === 10, fails());
S.advance(15 * 6e4 + 1000);
ok('v3-12: 15분 지나면 비밀번호 다시 됨', S.post({ a: 'login', pw: 'pw-test-77' }).ok);

// 5. 고객 확인 번호(PIN) 잠금은 그대로
delete S.st.cache.pwfail;
const site = S.post({ a: 'addSite', pw: 'T:' + t2, name: '시험 현장', pin: '4321' });
for (let i = 0; i < 5; i++) S.post({ a: 'site', s: site.code, pin: '1111' });
ok('v3-13: 고객 확인 번호 5번 틀리면 잠금 (그대로)', site.ok && /여러 번/.test(S.post({ a: 'site', s: site.code, pin: '4321' }).error || ''));
const c14 = S.post({ a: 'comment', s: site.code, text: 'x', pw: 'T:' + t1 }), p14 = S.post({ a: 'photo', s: site.code, id: 'x', pw: 'T:' + t1 });
ok('v3-14: 끝난 출입증을 붙인 댓글·사진 요청 → 입장권 안내로 거절, 틀린 횟수 0', c14.ok === false && /입장권 시간/.test(c14.error || '') && p14.ok === false && fails() === 0, (c14.error || '') + ' / ' + (p14.error || ''));
const e15 = S.post({ a: 'login', pw: 'T:bogus' });
ok('v3-14b: 모양이 다른 T: 값은 \'입장권 모양이 맞지 않아요\' (화면이 알아보는 \'비밀번호\' 포함), 횟수 1', /입장권 모양이 맞지 않아요/.test(e15.error || '') && /비밀번호/.test(e15.error || '') && fails() === 1, e15.error);

// 6. 버전 표시
const fs = require('fs'), path = require('path');
const GS = fs.readFileSync(path.join(__dirname, '../../field-script/Code.gs'), 'utf8');
ok('v3-15: 머리말 v3·동작 확인 v:3', /현장소통 Code\.gs 2026-11-20 v3/.test(GS) && /v: 3 \}/.test(GS));

const bad = R.filter(v => !v).length; console.log('\n결과: 통과 ' + (R.length - bad) + ' / 실패 ' + bad); process.exit(bad ? 1 : 0);
