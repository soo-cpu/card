// 현장소통 직원 번호(고정 6자리) 시험 (2026-11-23, Code.gs v5 · field/index.html v3): LANG=C.UTF-8 node intranet/tools/test/pin6_test.js
// 1부 서버(Code.gs · Node 틀): 정하기·맞음·틀림 5번 잠금·대표 풀기·번호 바꾸면 기기 토큰 무효·차단·30일 만료·새 기기 메일(번호·토큰 없음)·해시만 저장
//      ·직원 출입증으로 관리 칸 거절·전체 시도 제한·임시 열쇠(FIELD_STAFF_KEY)·관리 비밀번호 그대로·행 줄어듦 0
// 2부 현장소통 화면(field/index.html + 서버 틀): 로그인 화면 두 갈래·이름 큰 버튼·숫자 키패드·기억 기기(새 탭 번호 없이)·주소/저장소에 번호 없음
//      ·대표만 '직원 번호' 칸(정하기·차단)·차단 뒤 그 기기 막힘·브라우저 대화상자 0
const {chromium}=require('playwright');const fs=require('fs'),crypto=require('crypto'),path=require('path');
const ROOT=path.join(__dirname,'../../..');
const FIELD=fs.readFileSync(path.join(ROOT,'field/index.html'),'utf8');const GS=fs.readFileSync(path.join(ROOT,'intranet/field-script/Code.gs'),'utf8');
const APPS=JSON.parse(fs.readFileSync(path.join(ROOT,'intranet/field-script/appsscript.json'),'utf8'));
const makeServer=require('./gs_field_harness.js');
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const PJ='135790',PB='246813',PC='975310',PJ2='864209';
const OWNER='owner@example.test';

function part1(){
  const KEY=crypto.randomBytes(32).toString('base64url');
  const S=makeServer({props:{FIELD_STAFF_KEY:KEY}});S.setPw('pw-test-77');
  const P=o=>S.post(Object.assign({},o));const own=o=>P(Object.assign({pw:'pw-test-77'},o));
  // 행이 줄지 않는지 지켜봄
  const maxRows={};const rowsShrunk=()=>{let bad='';Object.values(S.st.sheets).forEach(sh=>{const n=sh.rows.length;if(maxRows[sh.name]!=null&&n<maxRows[sh.name])bad+=sh.name+' ';maxRows[sh.name]=Math.max(maxRows[sh.name]||0,n)});return bad};
  const dump=()=>JSON.stringify(Object.values(S.st.sheets).map(s=>s.rows))+JSON.stringify(S.st.cache)+JSON.stringify(S.st.mails);

  const l0=P({a:'pinLogin',name:'정진혁',pin:PJ,ua:'아이폰 · 사파리'});
  ok('서버 1: 소금(PIN_SALT) 없으면 번호 입장 거절 (setup 안내)',l0.ok===false&&/setup/.test(l0.error||''),l0.error);
  const n0=P({a:'pinNames'});
  ok('서버 2: 설정 탭에 \'직원 이름\' 줄(정진혁,이봄이,채진아) · 번호 정하기 전에는 이름 버튼 없음',n0.ok&&n0.names.length===0&&S.rowsOf('설정').some(r=>r[0]==='직원 이름'&&r[1]==='정진혁,이봄이,채진아'));
  const s1=own({a:'pinSet',name:'정진혁',pin:PJ});const salt=S.st.props.PIN_SALT||'';
  ok('서버 3: 대표가 번호 정함 → 소금이 없으면 무작위로 만듦(48자 이상)',s1.ok&&s1.first&&salt.length>=48,JSON.stringify(s1));
  own({a:'pinSet',name:'이봄이',pin:PB});
  const row=S.rowsOf('직원 번호').find(r=>r[0]==='정진혁')||[];
  const want=crypto.createHmac('sha256',salt).update('pin:정진혁:'+PJ).digest('base64url');
  ok('서버 4: 시트에는 HMAC-SHA256(소금, 이름+번호) 해시만 · 번호 그대로는 시트·캐시·기록 어디에도 없음',row[1]===want&&row[2]==='사용'&&!dump().includes(PJ)&&!dump().includes(PB),row.slice(0,3).join('|'));
  ok('서버 5: 번호 모양 거절 (5자리·같은 숫자·이어지는 숫자·목록에 없는 이름)',['12345','111111','123456','654321','abcdef'].every(pin=>own({a:'pinSet',name:'정진혁',pin}).ok===false)&&own({a:'pinSet',name:'홍길동',pin:'192837'}).ok===false);
  const n1=P({a:'pinNames'});
  ok('서버 6: 이름 버튼 = 번호가 정해진 이름만 (번호·해시 안 나감)',JSON.stringify(n1.names)==='["정진혁","이봄이"]'&&!/해시|hash|[A-Za-z0-9_-]{43}/.test(JSON.stringify(n1)),JSON.stringify(n1));

  // 메일 주소 없음 → 기록만
  const L1=P({a:'pinLogin',name:'정진혁',pin:PJ,ua:'아이폰 · 사파리'});
  ok('서버 7: 맞는 번호 → 6시간 출입증 + 30일 기억 기기 토큰 (64자리)',L1.ok&&/^[0-9a-f]{64}$/.test(L1.token||'')&&/^[0-9a-f]{64}$/.test(L1.dev||'')&&L1.days===30&&L1.who==='정진혁');
  ok('서버 8: OWNER_EMAIL 없음 → 메일 생략, 기록에 \'새 기기\'·\'메일 주소 없음\'',S.st.mails.length===0&&S.rowsOf('기록').some(r=>r[1]==='직원 번호 입장'&&r[3]==='정진혁'&&/새 기기/.test(r[4])&&/메일 주소 없음/.test(r[4])));
  const dv=S.rowsOf('기억 기기').find(r=>r[0]==='정진혁')||[];
  ok('서버 9: 기억 기기 탭에 토큰 해시만 (토큰 그대로 없음) · 만료 = 30일 뒤 · 기기 요약',dv[1]&&dv[1]!==L1.dev&&!dump().includes(L1.dev)&&dv[4]==='아이폰 · 사파리'&&dv[5]==='사용'&&dv[3]>dv[2]&&(new Date(dv[3].replace(' ','T')+'+09:00')-new Date(dv[2].replace(' ','T')+'+09:00'))/864e5>29.9,dv.join('|'));
  ok('서버 10: 직원 번호 출입증("T:")으로 관리 요청(sites·addSite) 통과 · 기록 \'누가\' = 직원 이름',P({a:'sites',pw:'T:'+L1.token}).ok&&P({a:'addSite',pw:'T:'+L1.token,name:'번호 시험 현장'}).ok&&S.rowsOf('기록').some(r=>r[1]==='현장 추가'&&r[3]==='정진혁'));
  S.setProp('OWNER_EMAIL',OWNER);
  const L2=P({a:'pinLogin',name:'정진혁',pin:PJ,ua:'윈도우 PC · 크롬'});const M=S.st.mails[0]||{};
  ok('서버 11: OWNER_EMAIL 있으면 새 기기마다 대표에게 메일 1통 (받는 주소 = 속성 값)',L2.ok&&S.st.mails.length===1&&M.to===OWNER&&/새 기기/.test(M.subj)&&/정진혁/.test(M.subj+M.body)&&/윈도우 PC · 크롬/.test(M.body));
  ok('서버 12: 메일에 번호·토큰·출입증·해시 없음',![PJ,L2.token,L2.dev,salt,want].some(x=>(M.subj+M.body).includes(x)));
  const D1=P({a:'devLogin',dev:L2.dev});
  ok('서버 13: 기억 기기 토큰 → 새 6시간 출입증 (번호 다시 안 물음 · 메일 안 보냄 · 기록 \'기억 기기\')',D1.ok&&/^[0-9a-f]{64}$/.test(D1.token||'')&&S.st.mails.length===1&&S.rowsOf('기록').some(r=>r[1]==='직원 번호 입장'&&/기억 기기/.test(r[4]))&&P({a:'sites',pw:'T:'+D1.token}).ok);
  ok('서버 14: 이상한 기억 기기 값 → DEVBAD: 오류',['','x','0'.repeat(64),L2.dev.slice(0,63)].every(dev=>/^DEVBAD:/.test(P({a:'devLogin',dev}).error||'')));

  for(let i=0;i<100;i++)P({a:'devLogin',dev:crypto.randomBytes(32).toString('hex')});
  const F=P({a:'devLogin',dev:L2.dev});
  ok('서버 14-2: 가짜 기억 토큰 100번 뒤에도 진짜 기기는 바로 들어옴 · 없는 토큰 기록은 1시간 5줄까지',F.ok&&/^[0-9a-f]{64}$/.test(F.token||'')&&S.rowsOf('기록').filter(r=>r[1]==='기억 기기 없음').length===5,F.error);
  const S0=makeServer();S0.setPw('p0');const W0=S0.post({a:'devLogin',dev:'a'.repeat(64)});
  ok('서버 14-3: 소금이 아직 없을 때 등 잠시 문제는 DEVWAIT: (화면이 기기 기억을 지우지 않음)',/^DEVWAIT:/.test(W0.error||''),W0.error);
  ok('서버 14-4: 번호 입장 잠금 안에서 시트에 쓰고 풀기 전에 SpreadsheetApp.flush()',(S.st.flushes||0)>=3);
  // 틀림·잠금
  const w=[];for(let i=0;i<4;i++)w.push(P({a:'pinLogin',name:'이봄이',pin:'000001',ua:'x'}).error||'');
  ok('서버 15: 틀리면 횟수 안내 (1/5 … 4/5) · 맞으면 횟수 0으로',w.join('|')==='번호가 맞지 않아요 (1/5)|번호가 맞지 않아요 (2/5)|번호가 맞지 않아요 (3/5)|번호가 맞지 않아요 (4/5)'&&P({a:'pinLogin',name:'이봄이',pin:PB,ua:'x'}).ok&&(S.rowsOf('직원 번호').find(r=>r[0]==='이봄이')||[])[3]==='0',w.join('|'));
  const LB=P({a:'pinLogin',name:'이봄이',pin:PB,ua:'안드로이드 · 삼성 인터넷'});
  for(let i=0;i<5;i++)P({a:'pinLogin',name:'이봄이',pin:'999990',ua:'x'});
  const rb=S.rowsOf('직원 번호').find(r=>r[0]==='이봄이')||[];
  ok('서버 16: 5번 틀리면 \'잠김\' · 맞는 번호도 막힘 · 기록 \'직원 번호 잠김\'',rb[2]==='잠김'&&rb[6]&&/잠겼/.test(P({a:'pinLogin',name:'이봄이',pin:PB,ua:'x'}).error||'')&&S.rowsOf('기록').some(r=>r[1]==='직원 번호 잠김'&&r[3]==='이봄이'),rb.join('|'));
  S.advance(48*36e5);
  ok('서버 17: 이틀이 지나도 잠금은 그대로 (시간으로 안 풀림)',/잠겼/.test(P({a:'pinLogin',name:'이봄이',pin:PB,ua:'x'}).error||''));
  ok('서버 18: 잠겨도 이미 기억한 기기는 그대로 들어옴 (번호 입력만 잠김)',P({a:'devLogin',dev:LB.dev}).ok);
  // 직원 출입증으로 관리 칸 거절
  const T=P({a:'devLogin',dev:L2.dev}).token;const tk=P({a:'ticket',k:S.ticket(KEY,{who:'채진아'})}).token;
  const staffTry=[['pinAdmin',{}],['pinSet',{name:'이봄이',pin:'192837'}],['pinUnlock',{name:'이봄이'}],['pinBlock',{name:'이봄이'}],['pinAddName',{name:'김새롬'}]];
  const deny=staffTry.every(([a,o])=>{const r1=P(Object.assign({a,pw:'T:'+T},o)),r2=P(Object.assign({a,pw:'T:'+tk},o)),r3=P(Object.assign({a},o)),r4=P(Object.assign({a,pw:'wrong-pw'},o));return [r1,r2,r3,r4].every(r=>r.ok===false)});
  ok('서버 19: 직원 번호·임시 열쇠 출입증·빈 값·틀린 비밀번호로 직원 번호 관리(보기·정하기·풀기·차단·이름 추가) 모두 거절',deny&&(S.rowsOf('직원 번호').find(r=>r[0]==='이봄이')||[])[2]==='잠김');
  delete S.st.cache.pwfail;
  const A=own({a:'pinAdmin'});
  ok('서버 20: 대표(관리 비밀번호)는 직원 번호 칸을 봄 · 응답에 번호·해시·토큰 없음 · 새 기기 표시',A.ok&&A.staff.length===3&&A.staff.find(x=>x.name==='이봄이').state==='잠김'&&A.staff.find(x=>x.name==='채진아').state==='번호 없음'&&A.logs.some(l=>l.newDev)&&!/[A-Za-z0-9_-]{43}/.test(JSON.stringify(A))&&!JSON.stringify(A).includes(PJ)&&A.mail===true&&A.salt===true);
  const U=own({a:'pinUnlock',name:'이봄이'});
  ok('서버 21: 대표가 잠금 풀기 → 다시 번호로 입장 · 옛 상태는 \'옛 값\' 탭',U.ok&&P({a:'pinLogin',name:'이봄이',pin:PB,ua:'x'}).ok&&S.rowsOf('옛 값').some(r=>/직원 번호 이봄이/.test(r[2])&&/잠김/.test(r[3])));
  // 번호 바꾸기 → 기억 기기·출입증 무효
  const before=S.rowsOf('기억 기기').filter(r=>r[0]==='정진혁'&&r[5]==='사용').length;
  const C=own({a:'pinSet',name:'정진혁',pin:PJ2});
  const devRows=S.rowsOf('기억 기기').filter(r=>r[0]==='정진혁');
  ok('서버 22: 번호 바꾸면 그 직원 기억 기기 모두 무효 (행은 남기고 상태만 \'무효(번호 바뀜)\')',C.ok&&C.killed===before&&before>=2&&devRows.every(r=>r[5]==='무효(번호 바뀜)')&&/^DEVBAD:/.test(P({a:'devLogin',dev:L2.dev}).error||''),before+'대');
  ok('서버 23: 번호 바꾸면 그 직원의 6시간 출입증도 끝 · 옛 번호 거절 · 새 번호 통과 · 다른 직원 기기는 그대로',P({a:'sites',pw:'T:'+T}).ok===false&&P({a:'pinLogin',name:'정진혁',pin:PJ,ua:'x'}).ok===false&&P({a:'pinLogin',name:'정진혁',pin:PJ2,ua:'x'}).ok&&P({a:'devLogin',dev:LB.dev}).ok);
  delete S.st.cache.pwfail;
  // 30일 만료
  const L3=P({a:'pinLogin',name:'정진혁',pin:PJ2,ua:'맥 · 사파리'});const sh=S.st.sheets['기억 기기'];const h3=crypto.createHmac('sha256',salt).update('dev:'+L3.dev).digest('base64url');
  const ri=sh.rows.findIndex(r=>r&&r[1]===h3);sh.rows[ri][3]='2026-01-01 00:00:00';
  const E=P({a:'devLogin',dev:L3.dev});
  ok('서버 24: 30일(만료 시각) 지난 기억 기기 → 거절 · 상태 \'만료\' · 번호를 다시 넣으면 됨',/^DEVBAD:30일/.test(E.error||'')&&sh.rows[ri][5]==='만료'&&P({a:'pinLogin',name:'정진혁',pin:PJ2,ua:'맥 · 사파리'}).ok,E.error);
  // 즉시 차단
  const L4=P({a:'pinLogin',name:'정진혁',pin:PJ2,ua:'x'});const tkJ=P({a:'ticket',k:S.ticket(KEY,{who:'정진혁'})}).token;
  ok('서버 25: 차단 전: 임시 열쇠 출입증(정진혁) 통과',P({a:'sites',pw:'T:'+tkJ}).ok);
  const B=own({a:'pinBlock',name:'정진혁'});
  const rj=S.rowsOf('직원 번호').find(r=>r[0]==='정진혁')||[];
  ok('서버 26: 즉시 차단 → 상태 \'차단\' · 번호·기억 기기·직원 번호 출입증·임시 열쇠 출입증 모두 끝',B.ok&&rj[2]==='차단'&&P({a:'pinLogin',name:'정진혁',pin:PJ2,ua:'x'}).ok===false&&/^DEVBAD:/.test(P({a:'devLogin',dev:L4.dev}).error||'')&&P({a:'sites',pw:'T:'+L4.token}).ok===false&&P({a:'sites',pw:'T:'+tkJ}).ok===false&&S.rowsOf('기억 기기').filter(r=>r[0]==='정진혁').every(r=>r[5]!=='사용'));
  ok('서버 27: 차단된 직원은 새 임시 열쇠 입장권도 거절 · 이름 버튼에서 빠짐 · 다른 직원(이봄이) 그대로',P({a:'ticket',k:S.ticket(KEY,{who:'정진혁'})}).ok===false&&!P({a:'pinNames'}).names.includes('정진혁')&&P({a:'ticket',k:S.ticket(KEY,{who:'이봄이'})}).ok&&P({a:'devLogin',dev:LB.dev}).ok);
  ok('서버 28: 차단은 잠금 풀기로 못 풂 · 대표가 새 번호를 정하면 다시 사용',own({a:'pinUnlock',name:'정진혁'}).ok===false&&own({a:'pinSet',name:'정진혁',pin:PJ}).ok&&P({a:'pinLogin',name:'정진혁',pin:PJ,ua:'x'}).ok);
  delete S.st.cache.pwfail;
  // 이름 추가
  const AN=own({a:'pinAddName',name:'김새롬'});
  ok('서버 29: 대표가 이름 추가 → 설정 \'직원 이름\'에 붙고 옛 값은 \'옛 값\' 탭 · 이상한 이름 거절',AN.ok&&AN.names.includes('김새롬')&&S.rowsOf('설정').find(r=>r[0]==='직원 이름')[1]==='정진혁,이봄이,채진아,김새롬'&&S.rowsOf('옛 값').some(r=>r[2]==='설정 직원 이름'&&r[3]==='정진혁,이봄이,채진아')&&own({a:'pinAddName',name:'<b>x'}).ok===false);
  // 메일 실패
  S.st.mailFail=true;const MF=P({a:'pinLogin',name:'이봄이',pin:PB,ua:'x'});S.st.mailFail=false;
  ok('서버 30: 메일이 실패해도 입장은 되고 기록에 \'메일 못 보냄\'',MF.ok&&S.rowsOf('기록').some(r=>/메일 못 보냄/.test(r[4])));
  // 전체 시도 제한
  const S2=makeServer();S2.setPw('pw2');S2.post({a:'pinSet',pw:'pw2',name:'정진혁',pin:PJ});S2.post({a:'pinSet',pw:'pw2',name:'이봄이',pin:PB});
  const okDev=S2.post({a:'pinLogin',name:'이봄이',pin:PB,ua:'x'});
  for(let i=0;i<4;i++)S2.post({a:'pinLogin',name:'정진혁',pin:'000002',ua:'x'});
  S2.post({a:'pinLogin',name:'정진혁',pin:PJ,ua:'x'}); // 맞으면 직원별 횟수는 0 (전체 횟수는 그대로)
  for(let i=0;i<4;i++)S2.post({a:'pinLogin',name:'정진혁',pin:'000003',ua:'x'});
  for(let i=0;i<12;i++)S2.post({a:'pinLogin',name:['채진아','홍길동','김','최윤수'][i%4],pin:'000004',ua:'x'});
  const G=S2.post({a:'pinLogin',name:'정진혁',pin:PJ,ua:'x'});
  ok('서버 31: 전체 틀린 시도 20번(여러 이름에 나눠도) → 맞는 번호도 1시간 막힘 · 직원별 잠금 전이라도',G.ok===false&&/1시간/.test(G.error||'')&&(S2.rowsOf('직원 번호').find(r=>r[0]==='정진혁')||[])[2]==='사용',G.error);
  for(let i=0;i<60;i++)S2.post({a:'devLogin',dev:crypto.randomBytes(32).toString('hex')});
  ok('서버 32: 전체 20번 제한이 걸리고 가짜 토큰 60번이 와도 기억 기기는 들어옴',S2.post({a:'devLogin',dev:okDev.dev}).ok);
  S2.advance(3601e3);
  ok('서버 33: 1시간 지나면 전체 제한 풀림',S2.post({a:'pinLogin',name:'정진혁',pin:PJ,ua:'x'}).ok);
  // 임시 열쇠·비밀번호 그대로
  const tk2=P({a:'ticket',k:S.ticket(KEY,{who:'채진아'})});
  ok('서버 34: 임시 열쇠(FIELD_STAFF_KEY 5분 입장권) 그대로 · 한 번만 · 관리 비밀번호 그대로',tk2.ok&&P({a:'sites',pw:'T:'+tk2.token}).ok&&P({a:'login',pw:'pw-test-77'}).ok&&P({a:'login',pw:'pw-test-78'}).error==='비밀번호가 맞지 않아요');
  ok('서버 35: 처음부터 끝까지 어느 탭도 행이 줄지 않음 · 번호 그대로는 어디에도 없음',(()=>{const b=rowsShrunk();return !b})()&&![PJ,PB,PJ2].some(x=>JSON.stringify(Object.values(S.st.sheets).map(s=>s.rows)).includes(x)));
  ok('서버 36: Code.gs v5 이상 머리말 · doGet v:5 이상 (v6 가져오기 2026-11-25) · 속성 이름만(PIN_SALT·OWNER_EMAIL) · 메일 주소·eval·clear·deleteRow 없음 · 메일 권한 범위',/현장소통 Code\.gs 2026-11-2\d v([5-9]|\d\d) /.test(GS)&&JSON.parse(S.ctx.doGet({parameter:{}}).text).v>=5&&/getProperty\('PIN_SALT'\)/.test(GS)&&/getProperty\('OWNER_EMAIL'\)/.test(GS)&&!/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/.test(GS)&&!/eval\(|\.clear\(|deleteRow|deleteSheet|clearContent/.test(GS)&&APPS.oauthScopes.includes('https://www.googleapis.com/auth/script.send_mail'));
}

(async()=>{part1();
 const b=await chromium.launch();const errs=[],dialogs=[];
 const KEY=crypto.randomBytes(32).toString('base64url');
 const S=makeServer({props:{FIELD_STAFF_KEY:KEY,OWNER_EMAIL:OWNER}});S.setPw('pw-test-77');
 S.post({a:'pinSet',pw:'pw-test-77',name:'정진혁',pin:PJ});S.post({a:'pinSet',pw:'pw-test-77',name:'이봄이',pin:PB});
 S.post({a:'addSite',pw:'pw-test-77',name:'번호 화면 현장',manager:'정진혁 실장'});
 const fieldCtx=async(vp)=>{const ctx=await b.newContext({viewport:vp||{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',hasTouch:true});
  await ctx.route('http://f.test/field/**',r=>{const u=r.request().url();if(/config\.js/.test(u))return r.fulfill({contentType:'application/javascript',body:'window.FIELD_API="http://api.test/exec";'});if(/\/field\/(\?|#|$)/.test(u))return r.fulfill({contentType:'text/html',body:FIELD});return r.abort()});
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  ctx.__posts=[];ctx.__reqs=[];
  await ctx.route('http://api.test/**',r=>{const q=r.request();ctx.__posts.push(q.postData()||'');r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(S.post(q.postData()||'{}'))})});
  ctx.on('request',q=>ctx.__reqs.push(q.url()));return ctx};
 const fopen=async(ctx,url,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.type());d.dismiss()});await p.goto(url);await wait(ms||900);return p};
 const st=p=>p.evaluate(()=>({url:location.href,list:/현장 목록/.test(document.body.innerText),login:!!document.getElementById('lp'),staffBtn:!!document.getElementById('lgStaff'),bar:(document.getElementById('bar')||{}).innerText||'',ls:JSON.stringify(localStorage),ss:JSON.stringify(sessionStorage),dev:localStorage.getItem('field_dev')||'',tk:sessionStorage.getItem('field_tk')||'',body:document.body.innerText.slice(0,400),wide:document.documentElement.scrollWidth>window.innerWidth+1}));
 const pressPin=async(p,pin)=>{for(const d of pin){await p.locator('.kp [data-k="'+d+'"]').click();await wait(40)}await wait(1200)};

 // 직원 (아이폰 크기)
 const C1=await fieldCtx();let p=await fopen(C1,'http://f.test/field/?admin');let s=await st(p);
 ok('화면 1: ?admin 로그인 화면 = \'직원 번호로 들어가기\' 큰 버튼 + 관리 비밀번호(대표 전용) · 임시 열쇠 안내',s.staffBtn&&s.login&&/대표 전용/.test(s.body)&&/임시 열쇠/.test(s.body)&&(await p.locator('#lgStaff').boundingBox()).height>=56,s.body.slice(0,120));
 await p.click('#lgStaff');await wait(700);
 const nb=await p.locator('[data-nm]').evaluateAll(a=>a.map(x=>({n:x.dataset.nm,h:x.getBoundingClientRect().height,w:x.getBoundingClientRect().width})));
 ok('화면 2: 이름 고르기 = 번호가 정해진 직원만 큰 버튼 (높이 56px 이상, 폭 거의 전체)',nb.map(x=>x.n).join(',')==='정진혁,이봄이'&&nb.every(x=>x.h>=56&&x.w>=300),JSON.stringify(nb));
 await p.click('[data-nm="정진혁"]');await wait(400);
 const inp=await p.locator('#ppIn').evaluate(e=>({t:e.type,im:e.inputMode,pt:e.getAttribute('pattern'),ml:e.maxLength,ac:e.getAttribute('autocomplete')}));
 const kp=await p.locator('.kp button').evaluateAll(a=>a.map(x=>x.getBoundingClientRect().height));
 s=await st(p);
 ok('화면 3: 번호 칸 = type=password · inputmode=numeric · pattern [0-9]* · 6자리 · 자동 완성 끔',inp.t==='password'&&inp.im==='numeric'&&inp.pt==='[0-9]*'&&inp.ml===6&&inp.ac==='off',JSON.stringify(inp));
 ok('화면 4: 화면 숫자 키패드 12칸(0~9·지우기·들어가기) 높이 56px 이상 · 휴대폰 폭에서 가로 스크롤 없음',kp.length===12&&kp.every(h=>h>=56)&&!s.wide,JSON.stringify(kp));
 for(const d of '24680'){await p.locator('.kp [data-k="'+d+'"]').click()}await p.locator('.kp [data-k="del"]').click();await p.locator('.kp [data-k="1"]').click();await wait(150);
 const dots=await p.locator('.dots i.on').count(); // 2468 → 24681 (5칸)
 await p.locator('.kp [data-k="1"]').click();await wait(1300); // 6자리(246811)가 되는 순간 자동 제출 → 틀림 1/5
 s=await st(p);const err1=await p.locator('#ppSt').innerText().catch(()=>'');
 ok('화면 5: 지우기 동작 · 6자리 채우면 바로 확인 · 틀리면 \'번호가 맞지 않아요 (1/5)\' · 번호 칸 비움',dots===5&&/1\/5/.test(err1)&&(await p.locator('#ppIn').inputValue())==='',err1+' dots='+dots);
 await pressPin(p,PJ);await wait(800);s=await st(p);
 ok('화면 6: 맞는 번호 → 현장 목록(관리 모드) · 직원에게는 \'직원 번호\' 칸 버튼 없음',s.list&&/관리 모드/.test(s.bar)&&!/직원 번호/.test(s.bar)&&(await p.locator('#abPin').count())===0,s.bar);
 ok('화면 7: 이 기기에 30일 기억 토큰(64자리)만 localStorage · 출입증은 sessionStorage · 번호는 어디에도 없음',/^[0-9a-f]{64}$/.test(s.dev)&&/^[0-9a-f]{64}$/.test(s.tk)&&![PJ,'246811'].some(x=>s.ls.includes(x)||s.ss.includes(x))&&!s.ls.includes(s.tk));
 ok('화면 8: 주소(쿼리·#)·요청 주소에 번호·토큰 없음 · 번호는 요청 본문(POST)에만',!s.url.includes(PJ)&&!s.url.includes('#')&&C1.__reqs.every(u=>!u.includes(PJ)&&!u.includes(s.dev))&&C1.__posts.some(x=>x.includes('"pinLogin"')&&x.includes(PJ)),s.url);
 ok('화면 9: 대표에게 새 기기 메일 1통 (아이폰 · 사파리, 번호 없음)',S.st.mails.length===1&&/아이폰 · 사파리/.test(S.st.mails[0].body)&&!S.st.mails[0].body.includes(PJ));
 const p2=await fopen(C1,'http://f.test/field/?admin',1800);const s2=await st(p2);
 ok('화면 10: 같은 기기 새 탭 → 번호 다시 안 물음(기억 기기) · 메일 더 안 감',s2.list&&!s2.login&&S.st.mails.length===1&&/^[0-9a-f]{64}$/.test(s2.tk)&&s2.tk!==s.tk,s2.body.slice(0,80));
 await p2.goto('http://f.test/field/?admin&s='+S.rowsOf('현장')[0][0]);await wait(1500);
 ok('화면 11: 직원 번호 출입증으로 현장 관리 화면 열림',/관리 모드/.test((await st(p2)).bar));
 await p2.close();
 // 일시 오류: 서버가 DEVWAIT: 를 주거나 연결이 끊겨도 기억 토큰은 그대로
 const devKeep=s.dev;let mode='wait';C1.__ab=0;
 await C1.route('http://api.test/**',async r=>{const q=r.request();const d=q.postData()||'';if(/"devLogin"/.test(d)&&mode==='wait'){mode='net';return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({ok:false,error:'DEVWAIT:잠시 막혔어요. 1시간 뒤에 다시 해 주세요'})})}if(/"devLogin"/.test(d)&&mode==='net'){if(++C1.__ab>=2)mode='';return r.abort()}return r.fallback()});
 const pw1=await fopen(C1,'http://f.test/field/?admin',1500);const w1=await st(pw1);await pw1.close();
 const pw2=await fopen(C1,'http://f.test/field/?admin',4500);const w2=await st(pw2);await pw2.close();
 ok('화면 11-2: 서버 일시 오류(DEVWAIT:)·연결 끊김에는 localStorage 기억 토큰을 지우지 않음 (로그인 화면만)',w1.login&&w1.dev===devKeep&&w2.login&&w2.dev===devKeep,JSON.stringify([w1.dev.slice(0,6),w2.dev.slice(0,6),mode]));
 const pw3=await fopen(C1,'http://f.test/field/?admin',1800);const w3=await st(pw3);await pw3.close();
 ok('화면 11-3: 문제가 지나가면 같은 기기는 다시 번호 없이 들어옴',w3.list&&w3.dev===devKeep);
 // 대표 (관리 비밀번호)
 const C2=await fieldCtx({width:420,height:860});const q=await fopen(C2,'http://f.test/field/?admin');
 await q.fill('#lp','pw-test-77');await q.click('#lf button');await wait(1300);let o=await st(q);
 ok('화면 12: 대표는 관리 비밀번호 그대로 → 현장 목록 + \'직원 번호\' 버튼',o.list&&(await q.locator('#abPin').count())===1,o.bar);
 await q.click('#abPin');await wait(900);
 const panel=await q.locator('#pinPanel').innerText().catch(()=>'');
 ok('화면 13: 직원 번호 칸 = 직원별 상태·틀린 횟수·기억 기기 + 접속 기록(빨간 \'새 기기\') · 번호·해시 안 보임',/정진혁/.test(panel)&&/사용/.test(panel)&&/채진아/.test(panel)&&/번호 없음/.test(panel)&&/접속 기록/.test(panel)&&(await q.locator('#pinPanel .newdev').count())>=1&&!panel.includes(PJ)&&!/[A-Za-z0-9_-]{43}/.test(panel),panel.slice(0,160));
 await q.click('#pinPanel [data-pset="채진아"]');await wait(200);
 const pa=await q.locator('#pinPanel [data-row="채진아"] .pA').evaluate(e=>({t:e.type,im:e.inputMode,pt:e.getAttribute('pattern')}));
 await q.fill('#pinPanel [data-row="채진아"] .pA',PC);await q.fill('#pinPanel [data-row="채진아"] .pB',PC);await q.click('#pinPanel [data-pgo="채진아"]');await wait(1300);
 const rc=S.rowsOf('직원 번호').find(r=>r[0]==='채진아')||[];
 ok('화면 14: 대표가 화면에서 채진아 번호 정함 (입력 칸 password·숫자 자판 · 화면·저장소에 번호 안 남음)',pa.t==='password'&&pa.im==='numeric'&&pa.pt==='[0-9]*'&&rc[2]==='사용'&&rc[1]&&rc[1]!==PC&&!(await q.evaluate(()=>document.body.innerHTML+JSON.stringify(localStorage)+JSON.stringify(sessionStorage))).includes(PC),JSON.stringify(pa));
 await q.click('#pinPanel [data-pblk="정진혁"]');await wait(300);
 const askTxt=await q.locator('.modal').last().innerText();await q.click('#akOk');await wait(1300);
 ok('화면 15: 즉시 차단은 화면 안 확인 창(confirm 아님) → 서버 상태 \'차단\'',/즉시 차단/.test(askTxt)&&(S.rowsOf('직원 번호').find(r=>r[0]==='정진혁')||[])[2]==='차단'&&!dialogs.length,askTxt.slice(0,60));
 // 차단 뒤 직원 기기
 await p.reload();await wait(2500);s=await st(p);
 ok('화면 16: 차단 뒤 직원 기기 새로 고침 → 관리 화면 안 열림 · 로그인 화면 · 기억 토큰 지움',s.login&&!s.list&&!s.dev,s.body.slice(0,100));
 await p.click('#lgStaff');await wait(700);
 ok('화면 17: 차단된 이름은 이름 버튼에서 빠짐',!(await p.locator('[data-nm="정진혁"]').count())&&(await p.locator('[data-nm="채진아"]').count())===1);
 await p.close();
 // 임시 열쇠(입장권)는 번호 없이 바로
 const C3=await fieldCtx();const t=await fopen(C3,'http://f.test/field/?admin#k='+S.ticket(KEY,{who:'이봄이'}),1500);const ts=await st(t);
 ok('화면 18: 인트라넷 버튼(임시 열쇠 입장권)은 번호 없이 바로 현장 목록 · 기억 토큰 안 만듦',ts.list&&!ts.login&&!ts.dev&&!ts.url.includes('#'),ts.url);
 // 직원 기기에서 나가기 → 기억도 지움
 const C4=await fieldCtx();const u=await fopen(C4,'http://f.test/field/?admin');await u.click('#lgStaff');await wait(600);await u.click('[data-nm="이봄이"]');await wait(300);await pressPin(u,PB);await wait(600);
 const u1=await st(u);await u.click('#abOut');await wait(600);const u2=await st(u);
 ok('화면 19: 직원이 \'나가기\' → 로그인 화면 · 이 기기 기억 토큰도 지움 (공용 기기용)',u1.list&&!!u1.dev&&u2.login&&!u2.dev);
 // 미리보기(서버 주소 없음)
 const C5=await b.newContext({viewport:{width:390,height:844}});
 await C5.route('http://f.test/field/**',r=>{const x=r.request().url();if(/config\.js/.test(x))return r.fulfill({contentType:'application/javascript',body:'window.FIELD_API="";'});if(/\/field\/(\?|#|$)/.test(x))return r.fulfill({contentType:'text/html',body:FIELD});return r.abort()});await C5.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const v=await fopen(C5,'http://f.test/field/?admin');await v.click('#lgStaff');await wait(500);await v.click('[data-nm="이봄이"]');await wait(300);await pressPin(v,'000000');const vs=await st(v);
 ok('화면 20: 미리보기에서도 번호 입장 흐름 동작 (000000) · 번호는 저장 안 함',vs.list&&!vs.ls.includes('000000"')&&!vs.ss.includes('000000'));
 ok('화면 21: 화면 오류·브라우저 대화상자(alert/confirm/prompt) 0 · 새로 넣은 코드에 alert/confirm/prompt/window.open 없음',!errs.length&&!dialogs.length&&(()=>{const i0=FIELD.indexOf('function loginView(msg)'),i1=FIELD.indexOf('/* ============ 관리 화면 (계속) ============ */');const part=FIELD.slice(i0,i1);return i0>0&&i1>i0&&!/alert\(|confirm\(|prompt\(|window\.open/.test(part)})(),errs.slice(0,3).join(' | ')+dialogs.join(','));
 ok('화면 22: field/index.html 머리말 v3 · 번호를 localStorage 에 쓰는 코드 없음',/현장소통 2026-11-23 v3/.test(FIELD)&&!/localStorage\.setItem\("field_pin|localStorage\.setItem\([^)]*pin\b/.test(FIELD));
 await b.close();const bad=R.filter(x=>!x).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
