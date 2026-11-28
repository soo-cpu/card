// 현장소통 Code.gs v6 '인트라넷 가져오기' 일괄 등록 시험 (2026-11-25): LANG=C.UTF-8 node intranet/tools/test/import_test.js
// 새로 만듦 · 두 번 돌려도 중복 없음 · 공정 채움(옛 값 탭) · 고객 화면에 고객 이름/P번호 없음 · 행 삭제 0 · 탭 없거나 비면 아무것도 안 함
// 데이터는 모두 가짜(시험용 이름·번호) — 실제 고객 정보 없음
const fs=require('fs'),path=require('path');const makeServer=require('./gs_field_harness.js');
const GS=fs.readFileSync(path.join(__dirname,'../../field-script/Code.gs'),'utf8');
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,300))};
const HEAD=['프로젝트 번호','현장명','고객 이름','담당','착공일','준공예정일','확인 번호(뒷4)','공정(JSON)','처리'];
const S=makeServer({props:{}});const ss=S.ctx.SpreadsheetApp.openById();
// 0) 탭 없음 → 아무것도 안 함
const r0=S.ctx.importProjects();
ok('1: 탭이 없으면 아무것도 안 함 (탭도 만들지 않음)',r0.made===0&&r0.exist===0&&!S.st.sheets['인트라넷 가져오기']&&!S.st.sheets['현장'],JSON.stringify(r0));
const sh=ss.insertSheet('인트라넷 가져오기');sh.rows.push(HEAD.slice());
const r00=S.ctx.importProjects();
ok('2: 머리글만 있는 빈 탭 → 아무것도 안 함',r00.made===0&&r00.exist===0&&!S.st.sheets['현장'],JSON.stringify(r00));
const SC1=JSON.stringify([{n:'철거',a:'2026-09-01',b:'2026-09-02'},{n:'타일',a:'2026. 9. 10',b:'2026/09/12'}]);
sh.rows.push(['P-2609-801','시험 현장 A','가짜고객일','정진혁 실장','2026-09-01','2026-10-20','4321',SC1,'']);
sh.rows.push(['P-2609-802','','가짜고객이','이봄이 실장','2026. 9. 5','2026. 10. 30','123','','']);
sh.rows.push(['P-2609-801','다른 이름','가짜고객일','','','','9999','','']);          // 같은 번호 두 번째 줄
sh.rows.push(['','','','','','','','','']);                                            // 빈 줄
sh.rows.push(['P-26-1','잘못된 번호','가짜','','','','','','']);
sh.rows.push(['P-2609-803','공정 틀림','가짜','','','','','[{n:',' ']);                   // 처리 칸 공백 → 빈 칸으로 봄? (공백만이면 처리 안 된 줄)
sh.rows.push(['P-2609-804','이미 처리','가짜','','','','','','등록됨 예전']);
const rowsBefore=sh.rows.length;
const r1=S.ctx.importProjects();const sites=S.rowsOf('현장');const t=S.rowsOf('인트라넷 가져오기');
const A=sites.find(x=>x[14]==='인트라넷 P-2609-801'),B=sites.find(x=>x[14]==='인트라넷 P-2609-802');
ok('3: 새로 만듦 — 801·802 두 현장 (같은 번호 두 번째 줄은 이미 있음, 처리된 줄 804 는 건드리지 않음)',r1.made===2&&sites.length===2&&!!A&&!!B&&!sites.some(x=>/P-2609-804/.test(x[14])),JSON.stringify(r1));
ok('4: 칸 — 현장명·담당·착공/준공(날짜 모양 맞춤)·확인 번호·고객 이름·메모·24자리 코드',A&&/^[A-Za-z0-9]{24}$/.test(A[0])&&A[1]==='시험 현장 A'&&A[2]==='정진혁 실장'&&A[5]==='2026-09-01'&&A[6]==='2026-10-20'&&A[16]==='4321'&&A[17]==='가짜고객일'&&A[8]==='진행'&&B[5]==='2026-09-05'&&B[6]==='2026-10-30',JSON.stringify(A&&A.slice(0,18)));
ok('5: 현장명이 비면 ‘홈퍼니싱 현장’ · 앞 0 빠진 확인 번호 123 → 0123',B&&B[1]==='홈퍼니싱 현장'&&B[16]==='0123',B&&B[1]+'/'+B[16]);
ok('6: 공정 채움 — JSON 공정표 날짜(2026. 9. 10 → 2026-09-10) · 공정이 없으면 기본 단계',A&&JSON.stringify(JSON.parse(A[7]))===JSON.stringify([{n:'철거',s:0,a:'2026-09-01',b:'2026-09-02'},{n:'타일',s:0,a:'2026-09-10',b:'2026-09-12'}])&&JSON.parse(B[7]).length===7&&JSON.parse(B[7])[0].n==='철거',A&&A[7]);
ok('7: 처리 칸 — 등록됨 코드 / 이미 있음 코드 / 오류 / 빈 줄은 그대로 / 이미 처리된 줄 그대로',t[0][8]==='등록됨 '+A[0]&&t[1][8]==='등록됨 '+B[0]&&t[2][8]==='이미 있음 '+A[0]&&(t[3][8]||'')===''&&/^오류: 프로젝트 번호/.test(t[4][8])&&/^오류: 공정/.test(t[5][8])&&t[6][8]==='등록됨 예전',JSON.stringify(t.map(x=>x[8])));
ok('8: 두 번째 같은 번호 줄은 현장명·확인 번호 바꾸지 않음',A[1]==='시험 현장 A'&&A[16]==='4321');
// 두 번 돌리기: 처리 칸 비워서 다시 (사람이 처리 칸을 지운 경우도 중복 없어야)
const r2=S.ctx.importProjects();
ok('9: 두 번 돌려도(처리 칸 찬 줄) 아무것도 안 함',r2.made===0&&r2.exist===0&&S.rowsOf('현장').length===2,JSON.stringify(r2));
sh.rows[1][8]='';sh.rows[2][8]='';
const r3=S.ctx.importProjects();
ok('10: 처리 칸을 비우고 다시 돌려도 중복 없음 → 이미 있음',r3.made===0&&r3.exist===2&&S.rowsOf('현장').length===2&&/^이미 있음 /.test(S.rowsOf('인트라넷 가져오기')[0][8]),JSON.stringify(r3));
ok('11: 같은 공정이면 옛 값 탭에 안 씀',S.rowsOf('옛 값').length===0);
// 공정 바꿔서 다시 → mergeSched_ · 옛 값
const before=S.rowsOf('현장').find(x=>x[0]===A[0])[7];
sh.rows[1][7]=JSON.stringify([{n:'철거',a:'2026-09-01',b:'2026-09-03'},{n:'도장',a:'2026-09-20',b:'2026-09-21'}]);sh.rows[1][8]='';
const r4=S.ctx.importProjects();const A2=S.rowsOf('현장').find(x=>x[0]===A[0]);const H=S.rowsOf('옛 값');
ok('12: 공정이 바뀌면 mergeSched_ 로 맞춤 + 바꾸기 전 값은 옛 값 탭(누가 ‘가져오기’)',r4.exist===1&&JSON.parse(A2[7]).map(x=>x.n+x.b).join()==='철거2026-09-03,도장2026-09-21'&&H.length===1&&H[0][1]===A[0]&&H[0][2]==='공정(JSON)'&&H[0][3]===before&&H[0][4]==='가져오기'&&/ · 공정 맞춤/.test(S.rowsOf('인트라넷 가져오기')[0][8]),JSON.stringify(H.map(h=>h.slice(1,6))));
// 빈 고객 이름만 채움
const sh2=S.st.sheets['현장'];const bi=sh2.rows.findIndex(x=>x&&x[0]===B[0]);sh2.rows[bi][17]='';sh.rows[2][8]='';
S.ctx.importProjects();
ok('13: 고객 이름이 빈 현장만 채움',S.rowsOf('현장').find(x=>x[0]===B[0])[17]==='가짜고객이'&&S.rowsOf('현장').find(x=>x[0]===A[0])[17]==='가짜고객일');
// 고객 화면
const cA=S.post({a:'site',s:A[0],pin:'4321'}),cB=S.post({a:'site',s:B[0],pin:'0123'});
ok('14: 고객 화면 응답에 고객 이름·P번호·확인 번호·메모 없음 · 공정은 나감',cA.ok&&cB.ok&&!/가짜고객|P-2609|4321|0123|인트라넷/.test(JSON.stringify(cA)+JSON.stringify(cB))&&cA.site.stages.length===2,JSON.stringify(cA).slice(0,160));
ok('15: 확인 번호가 틀리면 고객 화면 안 열림',S.post({a:'site',s:A[0],pin:'0000'}).ok===false);
// 행 삭제 0
ok('16: 가져오기 탭 행 수 그대로(지운 행 0) · 머리글 그대로',S.st.sheets['인트라넷 가져오기'].rows.length===rowsBefore&&JSON.stringify(S.st.sheets['인트라넷 가져오기'].rows[0])===JSON.stringify(HEAD));
const L=S.rowsOf('기록');
ok('17: 기록 탭 — 현장 자동 생성 2건 · 인트라넷 가져오기 요약 (번호 값은 안 적음)',L.filter(x=>x[1]==='현장 자동 생성').length===2&&L.some(x=>x[1]==='인트라넷 가져오기'&&/새로 2/.test(x[4]))&&!L.some(x=>/4321|0123/.test(x.join('|'))),JSON.stringify(L.map(x=>x[1]+':'+x[4])));
// 숨긴 현장은 찾지 않음 (projSite 와 같음) → 새로 만듦
sh2.rows[bi][13]='Y';sh.rows[2][8]='';const n0=S.rowsOf('현장').length;S.ctx.importProjects();
ok('18: 숨긴 현장은 찾지 않음 (projSite 와 같은 규칙) · 숨긴 행은 그대로',S.rowsOf('현장').length===n0+1&&S.rowsOf('현장').find(x=>x[0]===B[0])[13]==='Y');
// setup 끝에서 부름 (시험 현장이 이미 있게 해서 seedTest_ 건너뜀)
{const T=makeServer({props:{}});const tss=T.ctx.SpreadsheetApp.openById();T.ctx.setup.toString();
 const sitesSh=tss.insertSheet('현장');sitesSh.rows.push(['코드']);sitesSh.rows.push([T.ctx.TEST_CODE||'WI7ijOiMEPHIOf4vjkqEPmG2','시험','','','','','','[]','진행','f1','','','','','','[]','','']);
 const it=tss.insertSheet('인트라넷 가져오기');it.rows.push(HEAD.slice());it.rows.push(['P-2609-811','셋업 시험','가짜','','2026-09-01','','','','']);
 let e='';try{T.ctx.setup()}catch(x){e=x.message}
 ok('19: setup() 끝에서 importProjects 를 부름 → 한 번에 등록',!e&&T.rowsOf('현장').some(x=>x[14]==='인트라넷 P-2609-811')&&/^등록됨 /.test(T.rowsOf('인트라넷 가져오기')[0][8]),e);}
ok('20: 소스 — 머리말 v6 이후(v7 2026-11-25 2부 포함) · doGet v:6 이후 · 지우는 동작 없음 · 가져오기 찾기·만들기가 한 잠금 안',/현장소통 Code\.gs 2026-11-25 v(6|7)\b/.test(GS)&&/v: (6|7) \}/.test(GS)&&!/deleteRow|deleteRows|\.clear\(|setTrashed|removeFile|deleteSheet/.test(GS)&&(()=>{const i=GS.indexOf('function importProjects'),seg=GS.slice(i);const w=seg.indexOf('waitLock'),f=seg.indexOf('projOf_(x) === proj'),ap=seg.indexOf("append_('sites'"),rl=seg.indexOf('releaseLock');return i>0&&w>0&&w<f&&f<ap&&ap<rl})()&&!/insertSheet\(IMPORT_TAB/.test(GS));
console.log(R.every(Boolean)?'== 모두 통과 '+R.length+'건 ==':'== 실패 '+R.filter(x=>!x).length+'건 ==');process.exit(R.every(Boolean)?0:1);
