// 문자 6종 템플릿 자동 채움 시험 (다음 지시 2026-11-14 v4, v0.99-34): node intranet/tools/test/v4sms_test.js [index.html]
// 대표·채진아·정진혁·이봄이 × PC·Pixel 7 · 가짜 드라이브(실제 문자 안 나감) · 실제 접근 규칙 흉내(mock.js)
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const SMS_DIR="1zy6FTTRsu89AnXjlafO55cqV90-Y4mfH";
const T0="2026-11-01T00:00:00Z";
const cu=(code,name,mgr,x)=>Object.assign({code,name,mgr,status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",tel:"",addr:"",createdAt:T0,updatedAt:T0,__at:T0},x||{});
const pj=(no,title,custCode,custName,mgr,x)=>Object.assign({no,title,custName,custCode,stage:"상담",mgr,contractAmt:"33000000",cat:"주거",inq:"2026-11-01",updatedAt:T0},x||{});
const OLDLOG={id:"20261110120000_old001",at:"2026-11-10T03:00:00.000Z",by:"정진혁",tpl:"견적 후 1차",msg:"옛 문자",to:"01011112222",test:true,status:"시험 성공",code:"1",message:"",msg_id:"T0",type:"SMS",stage:"q1",pno:"P-2611-901",site:"래미안 101동"};
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "staff/st_out":{name:"퇴사자",uid:"",level:"일반 직원",state:"퇴사",pos:"사원"},"staff/st_ext":{name:"최남수",uid:"",level:"일반 직원",state:"재직",pos:"영업",intra:"사용 안 함"},
 "hr/st_jjh":{phone:"010-7777-7777",rrn:"900101-1",pay:"3000000",acct:"111-222"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "config/company":{name:"주식회사 홈퍼니싱",brand:"아르띠꼬 스튜디오",tel:"1566-5904"},
 "customers/c1":cu("C-2611-901","홍길동","정진혁",{smsLog:[OLDLOG]}),"cpriv/c1":{tel:"010-1111-2222",addr:"서울 시험동 1",updatedAt:T0},
 "customers/c2":cu("C-2611-902","김영희","이봄이"),"cpriv/c2":{tel:"01033334444",addr:"",updatedAt:T0},
 "customers/c6":cu("C-2611-003","겹침가","정진혁"),"cpriv/c6":{tel:"01055556666",addr:"",updatedAt:T0},
 "customers/c7":cu("C-2611-003","겹침나","정진혁"),"cpriv/c7":{tel:"01077778888",addr:"",updatedAt:T0},
 "projects/p1":pj("P-2611-901","래미안 101동","C-2611-901","홍길동","정진혁"),
 "projects/p2":pj("P-2611-902","자이 202동","C-2611-901","홍길동","정진혁"),
 "projects/p3":pj("P-2611-903","끝난 현장","C-2611-901","홍길동","정진혁",{stage:"종료"}),
 "projects/p6":pj("P-2611-906","힐스테이트 5동","C-2611-003","겹침가","정진혁"),
 "acct/u_boss/sms/my":{cardTel:"010-1000-2000"},
 "acct/u_jjh/sms/my":{cardPos:"",cardTel:"010-2000-3000",tpls:{c1:"정진혁 내 문구 {고객명}"}},
 "acct/u_bom/sms/my":{cardPos:"팀장",cardTel:"010-4000-5000"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const V4={c1:["상담 후 1차","안녕하세요 {고객명}님, {회사명} {담당자명} {담당자직함}입니다. 오늘 {현장명} 상담 시간 내주셔서 감사합니다. 말씀하신 내용 정리해서 견적 준비하겠습니다. 궁금한 점은 언제든 연락 주세요. {담당자연락처}"],
 c2:["상담 후 2차","{고객명}님, {회사명} {담당자명}입니다. 지난 {현장명} 상담 뒤로 더 궁금하신 점이나 바뀐 부분 있으시면 편하게 말씀해 주세요. 반영해서 견적에 넣어드리겠습니다. {담당자연락처}"],
 q1:["견적 후 1차","{고객명}님, {회사명} {담당자명}입니다. {현장명} 견적서 보내드렸습니다. 항목별로 궁금한 부분은 통화로 자세히 설명드릴게요. {담당자연락처}"],
 q2:["견적 후 2차","{고객명}님, {회사명} {담당자명}입니다. {현장명} 견적 검토는 잘 하고 계신지요. 자재나 범위를 조정하면 금액도 맞춰볼 수 있으니 편하게 말씀 주세요. {담당자연락처}"],
 k1:["계약 유도 1차","{고객명}님, {회사명} {담당자명}입니다. {현장명} 공사 일정을 잡으시려면 이번 주 안에 확정해 주시면 원하시는 날짜로 맞춰드릴 수 있습니다. 방문 상담도 가능합니다. {담당자연락처}"],
 k2:["계약 유도 2차","{고객명}님, {회사명} {담당자명}입니다. {현장명} 관련해서 마지막으로 확인차 연락드립니다. 결정에 도움이 필요하시면 언제든 연락 주세요. 꼼꼼하게 챙기겠습니다. {담당자연락처}"]};
const fillX=(t,v)=>Object.entries(v).reduce((s,[k,x])=>s.split('{'+k+'}').join(x),t);
const CO="홈퍼니싱 아르띠꼬스튜디오";
const FAKEMCP=`window.__MOCKMCP={callTool:async(sv,tool,inp)=>{const D=JSON.parse(localStorage.getItem('mockdrive')||'{}');const wrap=o=>({content:[{type:'text',text:JSON.stringify(o)}]});
 if(tool==='create_file'){const id='f_'+Math.random().toString(36).slice(2,9);D[id]={id,title:inp.title,parentId:inp.parentId||'',text:inp.textContent||'',modifiedTime:new Date().toISOString()};localStorage.setItem('mockdrive',JSON.stringify(D));return wrap({id,title:inp.title})}
 if(tool==='search_files'){const q=inp.query||'',m=/title = '([^']+)'/.exec(q),p=/parentId = '([^']+)'/.exec(q);return wrap({files:Object.values(D).filter(f=>(!m||f.title===m[1])&&(!p||f.parentId===p[1])).map(f=>({id:f.id,title:f.title,parentId:f.parentId,modifiedTime:f.modifiedTime}))})}
 return wrap({})}};`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push([v?"통과":"실패",n]);console.log(v?"통과":"실패",n,x===undefined?"":String(x).slice(0,300))};
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 const VPS=[['PC',{viewport:{width:1280,height:900}}],['Pixel 7',Object.assign({},devices['Pixel 7'])]];
 for(const [vn,vopt] of VPS){
  const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul'},vopt));await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r));localStorage.setItem('mockdrive','{}')},[SEED,RULES]);
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));const F=async()=>Object.values(JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdrive'))));
  const open=async(who)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+FAKEMCP+MOCK);await p.goto('http://hf.test/');await wait(7000);return p};
  const tag=vn+' ';
  const sOpen=async(P,ids,tpl,x)=>{await P.evaluate(([ids,tpl,x])=>{const L=ids.map(i=>window.__hfT.S().customers.find(c=>c.id===i)).filter(Boolean);window.__hfT.smsOpen(Object.assign({targets:L,tpl},x||{}))},[ids,tpl,x||{}]);await wait(1200)};
  const pick=async(P,n)=>{await P.locator('#smsTpl').selectOption(n);await wait(300)};
  const prev=async P=>{await P.locator('#smsVeil [data-smsact="preview"]').click();await wait(400)};
  const back=async P=>{await P.locator('#smsVeil [data-smsact="back"]').click();await wait(300)};
  const fin=P=>P.evaluate(()=>{const t=document.getElementById('smsFinal');return t?t.value:((document.querySelector('#smsPrev pre')||{}).textContent||'')});
  const sendOff=P=>P.evaluate(()=>{const b=document.querySelector('#smsVeil [data-smsact="send"]');return !b||b.disabled});
  const blk=P=>P.evaluate(()=>(document.getElementById('smsBlk')||{}).innerText||'');
  const close=async P=>{await P.evaluate(()=>{const b=document.querySelector('#smsVeil [data-smsact="close"]');b&&b.click()});await wait(200)};
  const A=await open('admin');await wait(9000); /* 대표 화면: 직원 사본 + 문자 명함 사본(config/smscard) 올림 */
  let d=await D();const cards=(d['config/smscard']||{}).cards||{};
  ok(tag+'대표 화면이 열리면 직원 문자 명함 사본(config/smscard): 정진혁·이봄이·최윤수 · 이름·직함·연락처만 · 인사(hr) 전화·주민번호·급여·계좌 없음 · 퇴사·사용 안 함 직원 없음',cards.st_jjh&&cards.st_jjh.tel==='010-2000-3000'&&cards.st_bom.pos==='팀장'&&cards.st_boss&&cards.st_boss.tel==='010-1000-2000'&&!cards.st_cja&&!cards.st_out&&!cards.st_ext&&Object.values(cards).every(c=>Object.keys(c).sort().join()==='name,pos,tel')&&!/7777|900101|3000000|111-222/.test(JSON.stringify(d['config/smscard'])),JSON.stringify(d['config/smscard']));
  const J=await open('jjh'),B=await open('bom'),C=await open('cja');await wait(2000);
  // ── 1 6종 자동 채움 글자 (네 명 각자 · 기본 담당자 = 로그인한 나)
  const SEE={admin:[A,'최윤수','대표','010-1000-2000','c1'],cja:[C,'채진아','차장','','c1'],jjh:[J,'정진혁','실장','010-2000-3000','c1'],bom:[B,'이봄이','팀장','010-4000-5000','c2']};
  for(const [w,[P,nm,pos,tel,cid]] of Object.entries(SEE)){
   await sOpen(P,[cid],'상담 후 1차');
   const st=await P.evaluate(()=>({mgr:(document.getElementById('smsMgr')||{}).value,mgrOpts:[...document.querySelectorAll('#smsMgr option')].map(o=>o.textContent),site:[...document.querySelectorAll('#smsSite option')].map(o=>o.textContent),siteIn:!!document.getElementById('smsSiteIn'),tpl:[...document.querySelectorAll('#smsTpl option')].map(o=>o.value)}));
   ok(tag+nm+': 담당자 기본값 = 로그인한 나 · 목록은 재직·인트라넷 사용 직원 4명(퇴사·사용 안 함 빠짐) · 6종 단계 있음',st.mgr==='st_'+(w==='admin'?'boss':w)&&st.mgrOpts.length===4&&!st.mgrOpts.some(x=>/퇴사자|최남수/.test(x))&&Object.values(V4).every(v=>st.tpl.includes(v[0])),JSON.stringify(st));
   const site=cid==='c1'?'자이 202동':'';
   if(cid==='c1')ok(tag+nm+': 현장 2곳 고객 → 현장 선택 드롭다운(최신 우선 · 끝난 현장 빠짐)',st.site.length===2&&/자이 202동/.test(st.site[0])&&/래미안 101동/.test(st.site[1]),st.site.join('|'));
   else ok(tag+nm+': 프로젝트 없는 고객 → 현장명 직접 입력 칸',st.siteIn);
   let all=true,x='';
   for(const [k,[name,t]] of Object.entries(V4)){await pick(P,name);await prev(P);const m=await fin(P);const exp=fillX(t,{"고객명":cid==='c1'?'홍길동':'김영희',"회사명":CO,"담당자명":nm,"담당자직함":pos,"현장명":site||'{현장명}',"담당자연락처":tel||'{담당자연락처}'});
    const off=await sendOff(P),bl=await blk(P);const need=!tel||!site;
    if(m!==exp||off!==need||(need&&!(tel?true:/담당자 연락처가 비어 있어요/.test(bl))||(need&&!site&&!/현장명이 비어 있어요/.test(bl)))){all=false;x=k+' '+m+' ≠ '+exp+' off='+off+' '+bl}await back(P)}
   ok(tag+nm+': 6종 미리보기 = v4 문구 글자 그대로 + 자동 채움 (회사명·고객명·현장명·담당자명·직함·연락처)'+(tel&&site?'':' · 빈 칸은 발송 막힘 + 어떤 칸인지 표시'),all,x);
   if(w==='cja'){/* 연락처 비어 있음 → 담당자를 정진혁으로 바꾸면 그 명함으로 채워지고 발송 가능 */await pick(P,'견적 후 1차');await P.locator('#smsMgr').selectOption('st_jjh');await wait(300);await prev(P);const m=await fin(P),off=await sendOff(P);
    ok(tag+'채진아: 담당자를 정진혁으로 바꾸면 문구가 정진혁 명함(대표 화면이 올린 사본)으로 바뀌고 발송 가능',m===fillX(V4.q1[1],{"고객명":"홍길동","회사명":CO,"담당자명":"정진혁","현장명":"자이 202동","담당자연락처":"010-2000-3000"})&&!off,m);await back(P)}
   if(w==='bom'){await pick(P,'견적 후 1차');await P.locator('#smsSiteIn').fill('은마 3동');await wait(200);await prev(P);const m=await fin(P);ok(tag+'이봄이: 현장명을 적으면 채워지고 발송 가능',/은마 3동 견적서/.test(m)&&!(await sendOff(P)),m);await back(P)}
   if(w==='jjh'){await pick(P,'상담 후 1차');const src=await P.evaluate(()=>(document.getElementById('smsSrc')||{}).innerText+'|'+!!document.querySelector('#smsVeil [data-smsact="mysave"]'));const tx=await P.locator('#smsText').inputValue();
    ok(tag+'정진혁: 6종은 회사 문구 사용 · 내 문구가 있으면 ‘회사 문구 사용 (내 문구는 보관됨)’ · 내 문구 저장 버튼 없음',src==='회사 문구 사용 (내 문구는 보관됨)|false'&&tx===V4.c1[1],src);
    await P.locator('#smsMgr').selectOption('st_cja');await wait(300);await prev(P);const bl=await blk(P);ok(tag+'정진혁: 명함 사본이 없는 직원(채진아)을 담당자로 고르면 ‘그 직원 명함 정보를 읽을 수 없어요’로 발송 막힘',/그 직원\(채진아\) 명함 정보를 읽을 수 없어요/.test(bl)&&await sendOff(P),bl);await back(P)}
   await close(P);await P.evaluate(()=>{if(window.SMS)window.SMS=null});
   const ux=await P.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2);ok(tag+nm+': 가로 넘침 없음',ux)}
  d=await D();ok(tag+'정진혁 내 문구(acct/u_jjh/sms/my tpls.c1)는 지워지지 않고 보관',(d['acct/u_jjh/sms/my'].tpls||{}).c1==='정진혁 내 문구 {고객명}');
  // ── 2 대표: 현장·담당자 바꾸면 문구 바뀜 · 이미 보냄 · 최종 문구 고쳐 시험 발송 · 기록 덧붙이기
  await sOpen(A,['c1'],'견적 후 1차');await prev(A);let m0=await fin(A);let sent=await A.evaluate(()=>!!document.querySelector('#smsPrev .smssent'));
  ok(tag+'대표: 자이 202동 견적 후 1차는 보낸 적 없음 → 이미 보냄 표시 없음',!sent&&/자이 202동/.test(m0),m0);await back(A);
  await A.locator('#smsSite').selectOption('1');await wait(300);const note=await A.evaluate(()=>(document.getElementById('smsSentNote')||{}).innerText||'');await prev(A);m0=await fin(A);sent=await A.evaluate(()=>(document.querySelector('#smsPrev .smssent')||{}).innerText||'');
  ok(tag+'대표: 현장을 래미안 101동으로 바꾸면 문구가 바뀌고 ‘이미 보냄 (2026-11-10)’ 표시 (막지는 않음)',/래미안 101동 견적서/.test(m0)&&/이미 보냄 \(2026-11-10\)/.test(sent)&&/이미 보냄 \(2026-11-10\)/.test(note)&&!(await sendOff(A)),sent+' / '+note);await back(A);
  await A.locator('#smsMgr').selectOption('st_bom');await wait(300);await prev(A);m0=await fin(A);
  ok(tag+'대표: 담당자를 이봄이로 바꾸면 이봄이 명함(이름·연락처)으로 바뀜',m0===fillX(V4.q1[1],{"고객명":"홍길동","회사명":CO,"담당자명":"이봄이","현장명":"래미안 101동","담당자연락처":"010-4000-5000"}),m0);
  await A.locator('#smsFinal').fill(m0+' 고친 글');await wait(200);await A.locator('#smsVeil [data-smsact="send"]').click();await wait(3000);
  const fl=(await F()).filter(f=>/^sms_req_/.test(f.title));const req=fl[0]?JSON.parse(fl[0].text):{};d=await D();const L=d['customers/c1'].smsLog||[];const nw=L.find(e=>e.id===req.id)||{};
  ok(tag+'대표: 미리보기에서 고친 최종 문구가 요청 파일 글 그대로 · 시험 발송 · 받는 번호',fl.length===1&&req.test===true&&req.items.length===1&&req.items[0].msg===m0+' 고친 글'&&req.items[0].to==='01011112222'&&Object.keys(req.items[0]).sort().join()==='cust,msg,name,to',JSON.stringify(req).slice(0,240));
  ok(tag+'대표: 고객 카드 문자 기록에 덧붙임(옛 기록 그대로) · 단계 q1 · 프로젝트 번호 · 현장 · 담당자 이름',L.length===2&&L.some(e=>e.id===OLDLOG.id&&e.msg==='옛 문자')&&nw.stage==='q1'&&nw.pno==='P-2611-901'&&nw.site==='래미안 101동'&&nw.mgrName==='이봄이'&&nw.by==='최윤수'&&nw.msg===m0+' 고친 글'&&nw.status==='대기',JSON.stringify(nw).slice(0,260));
  await close(A);
  // ── 3 여러 명: 담당자 = 각 고객 담당 직원 · 현장 = 각 고객 최신 프로젝트
  await sOpen(A,['c1','c2'],'견적 후 1차');const mg=await A.locator('#smsMgr').inputValue();await prev(A);const pv=await A.locator('#smsPrev').innerText();
  ok(tag+'대표 여러 명: 담당자 기본 ‘각 고객 담당 직원’ → 홍길동=정진혁·자이 202동, 김영희=이봄이(현장 없음 → 김영희 칸 막힘)',mg==='__cust'&&/홍길동님, 홈퍼니싱 아르띠꼬스튜디오 정진혁입니다\. 자이 202동 견적서/.test(pv)&&/010-2000-3000/.test(pv)&&/김영희님, 홈퍼니싱 아르띠꼬스튜디오 이봄이입니다\. \{현장명\}/.test(pv)&&/김영희: 현장명이 비어 있어요/.test(await blk(A))&&await sendOff(A),pv.replace(/\n/g,' | ').slice(0,300));await close(A);
  // ── 4 고객코드 겹침: 고객 문서 id 기준 · 고객명까지 맞는 프로젝트만
  await sOpen(J,['c6'],'상담 후 2차');const s6=await J.evaluate(()=>[...document.querySelectorAll('#smsSite option')].map(o=>o.textContent).join('|'));await close(J);
  await sOpen(J,['c7'],'상담 후 2차');const s7=await J.evaluate(()=>!!document.getElementById('smsSiteIn'));await close(J);
  ok(tag+'고객코드가 겹친 두 고객(C-2611-003): 겹침가 = 힐스테이트 5동, 겹침나 = 프로젝트 없음(직접 입력)',/힐스테이트 5동/.test(s6)&&s7,s6);
  // ── 5 문구 관리(설정)는 대표만: 직원 화면에 설정 칸 없음 · 대표가 회사명·6종 내 문구 사용을 바꾸면 반영
  for(const [P,nm] of [[J,'정진혁'],[B,'이봄이'],[C,'채진아']]){await P.evaluate(()=>{location.hash='#forms'});await wait(900);ok(tag+nm+': 서식 자료실에 문자 발송 설정(문구 관리) 칸 없음',(await P.locator('#smsCfg').count())===0)}
  await A.evaluate(()=>{location.hash='#forms'});await wait(1500);await A.evaluate(()=>{const d=document.getElementById('smsCfg');if(d)d.open=true});await wait(1500);
  const tbl=await A.evaluate(()=>(document.getElementById('smsCards')||{}).innerText||'');
  ok(tag+'대표 설정: 직원 문자 명함 표(보기만) · 채진아 연락처 비어 있음 표시',/정진혁/.test(tbl)&&/010-2000-3000/.test(tbl)&&/채진아[\s\S]*비어 있음/.test(tbl),tbl.replace(/\n/g,' | ').slice(0,200));
  await A.locator('#smsCfCo').fill('아르띠꼬 시험회사');await A.locator('#smsCfMine6').check();await A.locator('[data-smscfsave]').click();await wait(1500);d=await D();
  ok(tag+'대표 설정 저장: config/sms 에 회사명·6종 내 문구 사용 · 옛 값 hist · 명함 사본(config/smscard)은 그대로',d['config/sms'].coName==='아르띠꼬 시험회사'&&d['config/sms'].mineOn6===true&&!!(d['config/smscard']||{}).cards,JSON.stringify(d['config/sms']).slice(0,200));
  await wait(1500);await sOpen(J,['c1'],'상담 후 1차');const tj=await J.locator('#smsText').inputValue();await pick(J,'상담 후 2차');await prev(J);const mj=await fin(J);
  ok(tag+'정진혁 화면: 회사명이 바뀐 값으로 · 6종 내 문구 켜면 내 문구(상담 후 1차) 사용',tj==='정진혁 내 문구 {고객명}'&&/아르띠꼬 시험회사 정진혁입니다/.test(mj),tj+' / '+mj);await close(J);
  // ── 6 직원 권한 밖 쓰기 0 · 남의 acct 문서 안 읽음
  for(const [P,nm] of [[J,'정진혁'],[B,'이봄이'],[C,'채진아']]){const den=await P.evaluate(()=>window.__mockDenied.filter(x=>!/^(activity|access|knock)/.test(x)));ok(tag+nm+': 권한 밖 쓰기 0',!den.length,den.join(','))}
  d=await D();ok(tag+'원본 문서 그대로 (고객·프로젝트·인사·내 문구)',['customers/c1','customers/c2','customers/c6','customers/c7','projects/p1','projects/p2','projects/p3','hr/st_jjh','acct/u_jjh/sms/my','acct/u_bom/sms/my'].every(k=>d[k]));
  await ctx.close()}
 const i0=HTML.indexOf('// 문자 6종 설정 (다음 지시 2026-11-14 v4)'),i1=HTML.indexOf('// 고객 카드에 기록 (지우지 않음');const blkC=HTML.slice(i0,i1);
 ok('코드: 새 부분에 alert/confirm/prompt/window.open/iframe/.delete( 없음',i0>0&&i1>i0&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe|\.delete\(/.test(blkC),blkC.length+'자');
 ok('코드: 6종 기본 문구 글자 = v4 그대로',Object.entries(V4).every(([k,[n,t]])=>HTML.includes('["'+k+'","'+n+'","'+t+'"]')));
 ok('코드: 옛 기본 문구 기록(SMS_TPLS_V30) 남음',/const SMS_TPLS_V30=\[\["c1","상담 후 1차","\[\{회사\}\]/.test(HTML));
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 await b.close();const f=R.filter(r=>r[0]==="실패");console.log("\n합계",R.length,"통과",R.length-f.length,"실패",f.length);process.exit(f.length?1:0)})();
