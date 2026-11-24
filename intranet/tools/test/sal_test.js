// 급여 결재 시험 (직원 요청 33번 · 대표 결정 2026-11-24 · v0.99-50): node intranet/tools/test/sal_test.js [index.html]
// 본사 지급 항목 '급여' → 기안자·채진아·대표(최윤수·신혜현)만 봄 / 정진혁·이봄이 화면(목록·홈·검색·직접 열기·미리 보기 최근 활동)에는 안 보임
// 금액은 총액 한 줄만 (두 줄이면 저장 막음) · 주민번호·계좌·직원 이름+금액·계좌번호 칸·급여대장 첨부 이름 → 저장 전 경고
const {chromium}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-10T00:00:00Z";
const NM={u_jjh:"정진혁",u_bom:"이봄이",u_cja:"채진아",u_boss:"최윤수"};
const ap=(by,title,x)=>Object.assign({kind:"기안품의서 (본사)",title,status:"결재 대기",step:0,pno:"본사",amount:120000,createdBy:by,createdAt:"2026-11-24T01:00:00Z",updatedAt:"2026-11-24T01:00:00Z",history:[],aline:[{role:"기안",name:NM[by]},{role:"검토",name:"채진아"},{role:"결재",name:"최윤수"},{role:"최종결재",name:"신혜현"}].filter((r,i)=>i===0||r.name!==NM[by]),approver:"신혜현"},x||{});
const sal=(by,title,amt)=>ap(by,title,{amount:amt,hqlines:[{item:"급여",vendor:"직원 급여",amount:amt,due:"2026-11-25",memo:"11월분 총액"}]});
const act=(by,title,i)=>({at:"2026-11-24T0"+i+":00:00Z",by,col:"approvals",action:"결재 요청",title});
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},"staff/st_shh":{name:"신혜현",level:"공동대표",state:"재직",pos:"대표이사",role:"최종 결재"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "approvals/s1":sal("u_cja","11월 급여총액 채진아기안",15151515),
 "approvals/s2":sal("u_bom","급여 이봄이기안",16161616),
 "approvals/s3":sal("u_cja","같은제목 결재",17171717),
 "approvals/a1":ap("u_jjh","같은제목 결재"),"approvals/a2":ap("u_jjh","정진혁 본사 결재"),"approvals/a3":ap("u_bom","이봄이 본사 결재",{hqlines:[{item:"월세",vendor:"건물주",amount:120000}]}),
 "activity/x1":act("u_cja","11월 급여총액 채진아기안",1),"activity/x2":act("u_bom","급여 이봄이기안",2),"activity/x3":act("u_cja","같은제목 결재",3),"activity/x4":act("u_jjh","정진혁 본사 결재",4),
 "notify/n1":{kind:"결재 차례",to:["채진아"],apId:"s2",title:"급여 이봄이기안",at:"2026-11-24T02:00:00Z"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const SID={jjh:"st_jjh",bom:"st_bom",cja:"st_cja"};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push([v?"통과":"실패",n,x||""]);console.log(v?"통과":"실패",n,v?"":(x||""))};
// 누가 무엇을 봐야 하나: s1·s3 = 채진아 기안 급여, s2 = 이봄이 기안 급여
const SEE={admin:["s1","s2","s3"],cja:["s1","s2","s3"],bom:["s2"],jjh:[]};
const TITLE={s1:"11월 급여총액 채진아기안",s2:"급여 이봄이기안"},AMT={s1:"15,151,515",s2:"16,161,616",s3:"17,171,717"};
(async()=>{const b=await chromium.launch();const errs=[];
 const ctx=await b.newContext({viewport:{width:1280,height:900},timezoneId:'Asia/Seoul'});await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
 async function open(who,ms){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{if(d.type()!=='confirm')errs.push(who+' 대화상자 '+d.message().slice(0,40));d.dismiss()});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};window.__MOCKEXACT=true;`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p}
 const go=async(p,h,ms)=>{await p.evaluate(x=>{location.hash=x},h);await wait(ms||800)};
 const text=p=>p.evaluate(()=>document.body.innerText);
 async function sweep(P,who,how){const tag=who+' '+how,see=SEE[who];
  await go(P,'#approvals',1000);let t=await P.locator('main').innerText().catch(()=>text(P));
  for(const id of ["s1","s2"])ok(`${tag} 전자결재 목록: ${TITLE[id]} ${see.includes(id)?'보임':'안 보임'}`,t.includes(TITLE[id])===see.includes(id));
  ok(`${tag} 전자결재 목록: 급여 금액 ${see.length?'볼 수 있는 것만':'하나도 없음'}`,Object.keys(AMT).every(id=>t.includes(AMT[id])?see.includes(id):true));
  for(const id of ["s1","s2","s3"]){const direct=await P.evaluate(i=>{try{window.__hfT.open('approvals',i)}catch(e){}const s=window.__hfT.sheet();window.__hfT.closeSheet();return !!(s&&s.id===i)},id);ok(`${tag} 번호로 직접 열기 ${id}: ${see.includes(id)?'열림':'막힘'}`,direct===see.includes(id))}
  const gs=P.locator('#gs');if(await gs.count()){await gs.fill('급여');await wait(600);const r=await P.locator('#gsr').innerText().catch(()=>'');ok(`${tag} 전체 검색 ‘급여’: ${see.length?'볼 수 있는 것만':'안 나옴'}`,["s1","s2"].every(id=>r.includes(TITLE[id])===see.includes(id)),r.slice(0,160));await gs.fill('');await wait(200)}
  await go(P,'#home',1500);t=await text(P);
  ok(`${tag} 홈(알림·최근 활동·결재 카드): 못 보는 급여 결재 제목·금액 없음`,["s1","s2"].every(id=>see.includes(id)||!t.includes(TITLE[id]))&&Object.keys(AMT).every(id=>see.includes(id)||!t.includes(AMT[id])),(t.match(/급여[^\n]{0,30}/g)||[]).join(' | '));
  if(how==='미리 보기'&&who==='jjh')ok(`${tag} 최근 활동: 같은 제목의 남의 급여 결재 활동은 숨김 · 본인 결재 활동은 보임`,(()=>{const i=t.indexOf('최근 활동'),sec=i<0?'':t.slice(i,t.indexOf('바로 가는 툴',i)>0?t.indexOf('바로 가는 툴',i):i+800);return i>=0&&!/같은제목 결재/.test(sec)&&/정진혁 본사 결재/.test(sec)})(),(t.match(/[^\n]{0,30}같은제목 결재[^\n]{0,20}/g)||[]).join(' | '));
  for(const h of ['#projects','#calendar','#reports','#sites']){await go(P,h,600);const x=await text(P);if(Object.keys(AMT).some(id=>!see.includes(id)&&x.includes(AMT[id]))||["s1","s2"].some(id=>!see.includes(id)&&x.includes(TITLE[id])))ok(`${tag} ${h}: 급여 결재 없음`,false)}
  ok(`${tag} 나머지 화면(프로젝트·캘린더·업무 보고·현장) 돌아봄`,true)}
 // 대표 화면 먼저 (직원 사본 맞추기)
 const A=await open('admin',12000);await sweep(A,'admin','실제 로그인');
 // 공용 칸 work·직원 사본 mine 에 급여 결재가 안 들어감
 let d=await D();const leak=Object.keys(d).filter(k=>(k.startsWith('work/')||k.startsWith('mine/'))&&/15151515|16161616|17171717|급여총액|이봄이기안/.test(JSON.stringify(d[k])));ok('공용 칸 work·직원 사본 mine: 급여 결재 없음',!leak.length,leak.join(','));
 // 미리 보기 (대표가 직원 화면으로)
 for(const who of ['jjh','bom','cja']){await go(A,'#preview',1000);await A.locator('[data-pvgo="'+SID[who]+'"]').click();await wait(2500);await sweep(A,who,'미리 보기');await A.evaluate(()=>{const x=document.querySelector('[data-pvend],[data-pvexit],#pvTop .btn');if(x)x.click()});await wait(1500)}
 // 실제 로그인
 for(const who of ['jjh','bom','cja']){const P=await open(who,9000);await sweep(P,who,'실제 로그인');if(who!=='cja')await P.close();else{
  // 채진아: 급여 결재 저장 시험
  const newAp=async()=>{await P.evaluate(()=>{window.__hfT.closeSheet();window.__hfT.open('approvals')});await wait(1200);await P.locator('#sheetForm [data-k="title"]').fill('12월 급여 시험');const pn=P.locator('#sheetForm [data-k="pno"]');if(await pn.count())await pn.fill('본사')};
  const addLine=async(i,item,vendor,amt,memo)=>{await P.locator('[data-addrow="hqlines"]').click();await wait(300);await P.locator(`[data-row="hqlines"][data-i="${i}"][data-c="item"]`).selectOption(item);await P.locator(`[data-row="hqlines"][data-i="${i}"][data-c="vendor"]`).fill(vendor);await P.locator(`[data-row="hqlines"][data-i="${i}"][data-c="amount"]`).fill(String(amt));if(memo)await P.locator(`[data-row="hqlines"][data-i="${i}"][data-c="memo"]`).fill(memo);await wait(300)};
  const cnt=async()=>Object.keys(await D()).filter(k=>k.startsWith('approvals/')).length;
  const opts=await P.evaluate(()=>{window.__hfT.open('approvals');return new Promise(r=>setTimeout(()=>{const b=document.querySelector('[data-addrow="hqlines"]');if(b)b.click();setTimeout(()=>{const s=document.querySelector('[data-row="hqlines"][data-c="item"]');r(s?[...s.options].map(o=>o.value):[])},300)},1200))});
  ok('채진아 본사 지급 항목에 ‘급여’ 있음',opts.includes('급여'),opts.join(','));
  // ① 두 줄 → 저장 막음
  let n0=await cnt();await newAp();await addLine(0,'급여','정진혁',3000000);await addLine(1,'급여','이봄이',3100000);
  const note=await P.locator('[data-salnote]').count();ok('급여를 고르면 안내(기안자·채진아·대표만 · 총액 한 줄만) 보임',note>0);
  await P.locator('#saveSheet').click();await wait(1200);ok('급여 두 줄(직원별) → 저장 막음',(await cnt())===n0,String(await cnt()));
  // ② 한 줄 + 본문에 주민번호·계좌·직원 이름 금액 → 경고 → 취소하면 저장 안 됨
  await newAp();await addLine(0,'급여','직원 급여',9090909,'');await P.locator('#sheetForm [data-k="body"]').fill('정진혁 3,000,000원\n계좌 110-123-456789\n주민 900101-1234567');
  await P.locator('#saveSheet').click();await wait(1000);let ask=await P.locator('.okask').innerText().catch(()=>'');
  ok('민감 숫자·직원별 금액 → 저장 전 경고 창',/민감 정보/.test(ask)&&/주민번호·계좌번호 같은 숫자/.test(ask)&&/직원 이름 \+ 금액/.test(ask),ask.slice(0,200));
  const no=P.locator('.okask [data-ok="0"]');if(await no.count())await no.first().click();else await P.keyboard.press('Escape');await wait(1200);ok('경고에서 취소 → 저장 안 됨',(await cnt())===n0);
  // ③ 깨끗한 총액 한 줄 → 경고 없이 저장 · 날짜·전화번호는 경고 안 함
  await P.locator('#sheetForm [data-k="body"]').fill('2026-12-25 지급 예정 · 문의 010-1234-5678 · 12월 급여 총액');await P.locator('#saveSheet').click();await wait(1500);ask=await P.locator('.okask').count();
  d=await D();const nw=Object.keys(d).filter(k=>k.startsWith('approvals/')&&d[k].title==='12월 급여 시험');
  ok('총액 한 줄 · 날짜·전화번호만 → 경고 없이 저장',!ask&&nw.length===1&&d[nw[0]].amount===9090909&&d[nw[0]].hqlines.length===1&&d[nw[0]].status==='결재 대기',JSON.stringify(nw.map(k=>[d[k].amount,d[k].hqlines])));
  const aline=nw.length?d[nw[0]].aline.map(x=>x.role+':'+x.name).join(','):'';ok('결재 라인 그대로 (채진아 기안 → 검토 건너뜀 → 최윤수 → 신혜현)',aline==='결재:최윤수,최종결재:신혜현',aline);
  // ④ 첨부 이름·계좌번호 칸 경고 → 그래도 저장
  await newAp();await addLine(0,'급여','직원 급여',8080808,'');await P.evaluate(()=>{});
  await P.evaluate(()=>{const a=document.querySelector('#sheetForm [data-k="acctNo"]');if(a){a.value='시험은행 111-222-333333';a.dispatchEvent(new Event('input',{bubbles:true}))}});
  await P.locator('#saveSheet').click();await wait(1000);ask=await P.locator('.okask').innerText().catch(()=>'');const hasAcct=await P.locator('#sheetForm [data-k="acctNo"]').count();
  ok('계좌번호 칸을 채우면 경고',hasAcct>0&&/계좌번호’ 칸/.test(ask),hasAcct+' '+ask.slice(0,160));
  const yes=P.locator('.okask [data-ok="1"]');if(await yes.count())await yes.first().click();await wait(1500);d=await D();ok('경고에서 ‘그래도 저장’ → 저장됨',Object.keys(d).some(k=>k.startsWith('approvals/')&&d[k].amount===8080808));
  await P.close()}}
 // 정진혁 실제 로그인: 채진아가 방금 올린 급여 결재도 안 보임
 const J=await open('jjh',9000);await go(J,'#approvals',1000);let t=await J.locator('main').innerText();ok('정진혁: 채진아가 방금 올린 급여 결재 안 보임',!/12월 급여 시험|9,090,909|8,080,808/.test(t));await J.close();
 // 데이터: 시드 결재·활동 그대로 (지운 것 없음)
 d=await D();ok('시드 문서 지운 것 없음',Object.keys(SEED).every(k=>k in d),Object.keys(SEED).filter(k=>!(k in d)).join(','));
 // 캐시플로우 항목 맞추기: '급여' 글자는 급여 항목으로
 ok('오류·브라우저 대화상자 0',!errs.length,errs.slice(0,5).join(' | '));
 const fail=R.filter(r=>r[0]==='실패').length;console.log(`\n합계 ${R.length}건 · 통과 ${R.length-fail} · 실패 ${fail}`);
 fs.writeFileSync(OUT+'/sal_result.json',JSON.stringify(R,null,1));await b.close();process.exit(fail?1:0)})();
