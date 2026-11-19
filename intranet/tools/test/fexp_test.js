// 현장소통 '시간이 끝난 출입증' 시험 (Code.gs v3, 2026-11-20): node intranet/tools/test/fexp_test.js [Code.gs 경로]
// 서버(Code.gs · Node 틀)만 돌림 — 브라우저·인트라넷 화면 필요 없음. 실제 시트·드라이브는 건드리지 않음.
// 확인: 시간이 끝난 진짜 출입증은 '비밀번호 틀린 횟수'에 안 들어가고, 가짜·고친 출입증과 틀린 비밀번호는 예전처럼 들어감
const crypto=require('crypto');const makeServer=require('./gs_field_harness.js');
const FILE=process.argv[2];
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,200))};
const KEY=crypto.randomBytes(32).toString('base64url'),PWD='pw-test-77',H6=6*36e5+1000;
const mk=()=>{const S=makeServer(FILE?{file:FILE}:{});S.setPw(PWD);S.setProp('FIELD_STAFF_KEY',KEY);return S};
const fails=S=>Number(S.ctx.CacheService.getScriptCache().get('pwfail')||0);
const tok=S=>{const r=S.post({a:'ticket',k:S.ticket(KEY,{who:'정진혁'})});if(!r.ok)throw new Error('출입증 못 받음: '+r.error);return r.token};
const flip=c=>c==='0'?'1':'0';
console.log('대상:',FILE||'intranet/field-script/Code.gs','·',(makeServer(FILE?{file:FILE}:{}).ctx.doGet().text));

{ // (가) 시간이 끝난 진짜 출입증 12번
  const S=mk(),t=tok(S);S.advance(H6);const rs=[];for(let i=0;i<12;i++)rs.push(S.post({a:i%2?'sites':'login',pw:'T:'+t}));
  ok('가-1: 끝난 출입증 12번 → 모두 거절',rs.every(r=>r.ok===false));
  ok('가-2: 틀린 횟수 0 그대로',fails(S)===0,'틀린 횟수 '+fails(S));
  ok('가-3: 안내 = 시간이 끝났다 + 인트라넷에서 다시 열기 (화면이 알아보는 낱말 ‘입장권’ 포함, ‘비밀번호가 맞지 않아요’·‘잠겼’ 아님)',rs.every(r=>/입장권/.test(r.error)&&/시간이 끝났/.test(r.error)&&/인트라넷/.test(r.error)&&!/맞지 않아요|잠겼/.test(r.error)),rs[11].error);
  const g=S.post({a:'login',pw:PWD});
  ok('가-4: 잠기지 않음 — 바로 뒤 맞는 비밀번호 로그인 통과',g.ok===true,g.error||'');
  ok('가-5: 끝난 출입증으로는 아무것도 못 함 (목록·현장 추가 거절, 시트에 현장 안 생김)',S.post({a:'addSite',pw:'T:'+t,name:'x'}).ok===false&&S.rowsOf('현장').length===0);
}
{ // (나) 서명이 틀린(가짜) 출입증
  const S=mk();const r=S.post({a:'sites',pw:'T:'+crypto.randomBytes(32).toString('hex')});
  ok('나-1: 무작위 가짜 출입증 → 거절 + 틀린 횟수 1',r.ok===false&&fails(S)===1,'틀린 횟수 '+fails(S)+' · '+r.error);
  for(let i=0;i<9;i++)S.post({a:'login',pw:'T:'+crypto.randomBytes(32).toString('hex')});
  ok('나-2: 가짜 출입증 10번 → 잠금 (맞는 비밀번호도 막힘, 예전 그대로)',fails(S)===10&&/잠겼/.test(S.post({a:'login',pw:PWD}).error||''),'틀린 횟수 '+fails(S));
}
{ // (다) 끝난 진짜 출입증을 조금 고친 것 — '끝났다'는 것만 흉내 내고 서명은 안 맞음
  const S=mk(),t=tok(S),t2=tok(S);S.advance(H6);
  const c=[t.slice(0,63)+flip(t[63]),flip(t[0])+t.slice(1),t.slice(0,32)+t2.slice(32),t2.slice(0,32)+t.slice(32),t.slice(0,32)+'0'.repeat(32),t.toUpperCase()==t?t+'0':t.toUpperCase(),t+'0'];
  let n=0;const bad=[];c.forEach((x,i)=>{const r=S.post({a:'sites',pw:'T:'+x});if(r.ok!==false||fails(S)!==++n)bad.push(i)});
  ok('다-1: 서명 끝 글자·앞 글자만 바꾼 것, 두 출입증을 섞은 것, 서명을 0으로 채운 것, 대문자로 바꾼 것, 한 글자 붙인 것 → 모두 틀린 횟수 +1',bad.length===0&&fails(S)===c.length,'틀린 횟수 '+fails(S)+'/'+c.length+(bad.length?' · 안 세어진 것 '+bad:''));
  const S2=mk(),K2=crypto.randomBytes(32).toString('base64url'),r0=crypto.randomBytes(16).toString('hex');
  const forged=[r0+crypto.createHmac('sha256',K2).update('tok.'+r0).digest('hex').slice(0,32),(Date.now()-864e5)+'.'+r0,String(Date.now()-864e5)+r0+r0.slice(0,19)];
  forged.forEach(x=>S2.post({a:'login',pw:'T:'+x}));
  ok('다-2: 다른 열쇠로 서명한 것·지난 시각을 적어 넣은 것 → 모두 틀린 횟수에 들어감 (끝난 시각을 보내는 쪽이 고를 수 없음)',fails(S2)===forged.length,'틀린 횟수 '+fails(S2)+'/'+forged.length);
  const S3=mk(),t3=tok(S3);S3.advance(H6);S3.setProp('FIELD_STAFF_KEY',undefined);S3.post({a:'login',pw:'T:'+t3});
  ok('다-3: 열쇠 속성이 지워져 서명을 확인할 수 없으면 → 틀린 횟수에 들어감 (확인 못 한 것을 봐주지 않음)',fails(S3)===1,'틀린 횟수 '+fails(S3));
}
{ // (라) 틀린 비밀번호
  const S=mk();const r=S.post({a:'login',pw:'pw-test-78'});
  ok('라-1: 틀린 비밀번호 → 틀린 횟수 1, 안내 그대로',fails(S)===1&&r.error==='비밀번호가 맞지 않아요',r.error);
  S.post({a:'login',pw:''});S.post({a:'sites'});
  ok('라-2: 빈 비밀번호·비밀번호 없음도 틀린 횟수에 들어감 (3)',fails(S)===3,'틀린 횟수 '+fails(S));
  for(let i=0;i<7;i++)S.post({a:'login',pw:'no'+i});
  ok('라-3: 10번 → 잠금, 15분 뒤 풀림',/잠겼/.test(S.post({a:'login',pw:PWD}).error||'')&&(S.advance(15*6e4+1000),S.post({a:'login',pw:PWD}).ok===true));
}
{ // (마) 살아 있는 출입증
  const S=mk(),t=tok(S);S.post({a:'login',pw:'no'});S.post({a:'login',pw:'no2'});
  const a=S.post({a:'sites',pw:'T:'+t}),b=S.post({a:'login',pw:'T:'+t});S.advance(H6-60000);const c=S.post({a:'sites',pw:'T:'+t});
  ok('마-1: 살아 있는 출입증 → 통과 (6시간 되기 1분 전에도), 틀린 횟수 변화 없음 (2 그대로)',a.ok&&b.ok&&c.ok&&/^[0-9a-f]{64}$/.test(t),'출입증 길이 '+t.length);
  const S2=mk(),u=tok(S2);S2.post({a:'login',pw:'no'});S2.post({a:'login',pw:'no2'});const f0=fails(S2);S2.post({a:'sites',pw:'T:'+u});S2.post({a:'login',pw:'T:'+u});
  ok('마-2: 통과한 출입증은 틀린 횟수를 올리지도 지우지도 않음',f0===2&&fails(S2)===2,'전 '+f0+' → 후 '+fails(S2));
  const x=S2.post({a:'addSite',pw:'T:'+u,name:'시험 현장'});
  ok('마-3: 기록 ‘누가’ = 직원 이름 그대로',x.ok&&S2.rowsOf('기록').some(r=>r[1]==='현장 추가'&&r[3]==='정진혁'));
}
{ // (바) 끝난 출입증 뒤 비밀번호 로그인, 잠금과의 관계
  const S=mk(),t=tok(S);S.advance(H6);for(let i=0;i<15;i++)S.post({a:'sites',pw:'T:'+t});
  const g=S.post({a:'login',pw:PWD}),l=S.post({a:'sites',pw:PWD});
  ok('바-1: 끝난 출입증 15번 뒤 맞는 비밀번호 → 로그인·목록 정상',g.ok===true&&l.ok===true&&Array.isArray(l.sites),g.error||l.error||'');
  const n=S.post({a:'ticket',k:S.ticket(KEY,{who:'이봄이'})});
  ok('바-2: 끝난 뒤 새 입장권으로 다시 들어오면 새 출입증 통과',n.ok&&S.post({a:'sites',pw:'T:'+n.token}).ok);
  for(let i=0;i<4;i++)S.post({a:'login',pw:'no'+i});for(let i=0;i<8;i++)S.post({a:'login',pw:'T:'+t});for(let i=0;i<5;i++)S.post({a:'login',pw:'no'+i});
  ok('바-3: 틀린 비밀번호 4번 + 끝난 출입증 8번 + 틀린 비밀번호 5번 → 틀린 횟수 9 (끝난 출입증은 안 셈), 아직 안 잠김',fails(S)===9&&S.post({a:'login',pw:PWD}).ok===true,'틀린 횟수 '+fails(S));
  S.post({a:'login',pw:'no'});
  const lk=S.post({a:'login',pw:PWD}),e2=S.post({a:'login',pw:'T:'+t});
  ok('바-4: 틀린 비밀번호가 10번이 되면 잠금은 예전 그대로 · 잠긴 동안 끝난 출입증은 ‘시간이 끝났다’ 안내 (횟수 안 늘어남)',/잠겼/.test(lk.error||'')&&/시간이 끝났/.test(e2.error||'')&&fails(S)===10,'틀린 횟수 '+fails(S)+' · '+e2.error);
  const all=JSON.stringify(Object.values(S.st.sheets).map(s=>s.rows));
  ok('바-5: 기록·시트 어디에도 열쇠·출입증 값 없음',!all.includes(KEY)&&!all.includes(t)&&!all.includes(n.token));
}
const f=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-f)+' / 실패 '+f+' (모두 '+R.length+')');process.exit(f?1:0);
