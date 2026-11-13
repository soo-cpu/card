// 뒤로 가기·위치 표시 시험 (v0.99-27, 2026-11-13 · 다음 지시 2026-11-13 v1 1번): node intranet/tools/test/back_test.js [index.html]
// 대표·정진혁 × PC·Pixel 7: '← 뒤로'가 들어온 곳(프로젝트 통합 화면·고객 카드·목록)으로 돌아가는지, 브라우저 뒤로 가기도 같은지(인트라넷 밖으로 안 나감),
// 고치던 내용이 있으면 화면 안 확인 창(브라우저 confirm 아님), 위치 표시(프로젝트 › 홍길동 › 견적), 저장하면 들어온 곳으로, 상담 진행 모드에서 돌아오기
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "customers/c2":{code:"C-2611-902",name:"김영희",tel:"",addr:"",mgr:"이봄이",status:"진행중",steps:[1],stage:"1-상담영업",inq:"2026-11-02",createdAt:T0,updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"",cat:"주거",inq:"2026-11-01",work:"욕실",start:"2026-11-05",memo:"",updatedAt:T0},
 "projects/p2":{no:"P-2605-902",title:"지난 현장 주방",custName:"홍길동",custCode:"C-2611-901",stage:"사후관리",mgr:"이봄이",contractAmt:"12000000",cat:"주거",inq:"2026-04-01",work:"주방",start:"2026-04-10",end:"2026-05-01",warrantyEnd:"2027-05-01",warrantyMonths:12,updatedAt:T0},
 "projects/p3":{no:"P-2611-903",title:"남의 현장",custName:"김영희",custCode:"C-2611-902",stage:"상담",mgr:"이봄이",cat:"주거",inq:"2026-11-02",updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",code:"C-2611-901",name:"시험 현장 욕실",customer:"홍길동",mgr:"정진혁",status:"공사 중",proc:"타일",progress:"40",start:"2026-11-05",logs:[{d:"2026-11-10",proc:"타일",text:"욕실 벽 타일 시공 중"}],updatedAt:T0},
 "quotes/q1":{qno:"P-2611-901-1차",ver:"1차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"계약",d:"2026-11-03",amount:"3300000",items:[],memo:"",updatedAt:T0},
 "as/a1":{pno:"P-2611-901",code:"C-2611-901",site:"시험 현장 욕실",d:"2026-11-07",content:"실리콘 보수",status:"접수",mgr:"정진혁"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false}};
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){
  const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  const go=async(p,h)=>{await p.evaluate(x=>{location.hash=x},h);await wait(900)};
  const sh=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+'|'+s.id:''});
  const nav=p=>p.evaluate(()=>window.__hfT.nav().join(' > '));
  const crumb=async p=>(await p.locator('#veil .navbar .crumb').count())?(await p.locator('#veil .navbar .crumb').innerText()).replace(/\s+/g,' ').trim():'';
  const back=async p=>{await p.locator('#veil .navbar [data-navback]').click();await wait(700)};
  const inApp=p=>/^http:\/\/hf\.test\//.test(p.url());
  const wide=p=>p.evaluate(()=>{const s=document.querySelector('.sheet'),n=document.querySelector('.navbar');return document.documentElement.scrollWidth<=window.innerWidth+2&&!!s&&s.scrollWidth<=s.clientWidth+2&&!!n&&n.getBoundingClientRect().right<=window.innerWidth+1});
  const A0=await open('admin',12000);
  for(const who of ['admin','jjh']){const P=who==='admin'?A0:await open(who);const tag=vn+' '+USERS[who].name+': ';
   // 1) 목록 → 프로젝트 → 견적 → 뒤로 → 뒤로
   await go(P,'#projects');await P.locator('tbody tr[data-open="projects"][data-id="p1"]').first().click();await wait(1000);
   ok(tag+'목록에서 프로젝트를 열면 왼쪽 위 ‘← 뒤로’와 위치 표시',(await sh(P))==='projects|p1'&&(await P.locator('#veil .navbar [data-navback]').count())===1&&/프로젝트 › 홍길동/.test(await crumb(P)),await crumb(P));
   ok(tag+'‘← 뒤로’가 창 맨 왼쪽 위',await P.evaluate(()=>{const b=document.querySelector('#veil [data-navback]').getBoundingClientRect(),s=document.querySelector('#veil .sheet').getBoundingClientRect();return b.left-s.left<40&&b.top-s.top<40}));
   await P.locator('#pjHub .hubi[data-open="quotes"]').first().click();await wait(1200);
   ok(tag+'견적 카드 → 견적 상세 · 위치 표시 ‘프로젝트 › 홍길동 › 견적 1차’',(await sh(P))==='quotes|q1'&&/프로젝트 › 홍길동 › 견적 1차/.test(await crumb(P)),await crumb(P));
   ok(tag+'가로 넘침 없음 (뒤로 줄 포함)',await wide(P));
   await back(P);ok(tag+'견적에서 ‘← 뒤로’ → 프로젝트 통합 화면',(await sh(P))==='projects|p1'&&(await P.locator('#pjHub').count())===1,await sh(P));
   await back(P);ok(tag+'프로젝트에서 ‘← 뒤로’ → 목록 (창 닫힘)',(await sh(P))===''&&(await P.locator('#veil').count())===0&&(await P.evaluate(()=>location.hash))==='#projects');
   // 2) 프로젝트 → 고객 카드 → 그 고객의 다른 프로젝트 → 뒤로 3번
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);await P.locator('#pjHub .hubi[data-open="customers"]').first().click();await wait(900);
   const c2=await crumb(P);await P.locator('.sheet .custHub [data-open="projects"][data-id="p2"]').first().click();await wait(900);const n3=await nav(P),c3=await crumb(P);
   ok(tag+'프로젝트 → 고객 카드 → 다른 프로젝트: 들어온 순서대로 쌓임',n3==='projects|p1 > customers|c1 > projects|p2'&&/프로젝트 › 홍길동 › 홍길동/.test(c2)&&/지난 현장 주방/.test(c3),n3+' / '+c3);
   await back(P);const b1=await sh(P);await back(P);const b2=await sh(P);await back(P);const b3=await sh(P);
   ok(tag+'뒤로 3번: 고객 카드 → 프로젝트 → 목록',b1==='customers|c1'&&b2==='projects|p1'&&b3==='',[b1,b2,b3].join(' , '));
   // 3) 위치 표시를 눌러 한 번에 돌아가기
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);await P.locator('#pjHub .hubi[data-open="sites"]').first().click();await wait(900);
   const cs=await crumb(P);await P.locator('#veil .crumb [data-navto="0"]').click();await wait(700);
   ok(tag+'현장 진행 카드 → 위치 표시의 프로젝트 이름을 누르면 프로젝트로',/현장/.test(cs)&&(await sh(P))==='projects|p1',cs+' → '+await sh(P));
   await P.locator('#veil .crumb [data-navto="-1"]').click();await wait(600);ok(tag+'위치 표시 맨 앞(프로젝트)을 누르면 목록',(await sh(P))==='');
   // 4) 브라우저·휴대폰 뒤로 가기
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);await P.locator('#pjHub .hubi[data-open="as"]').first().click();await wait(900);const g0=await sh(P);
   await P.goBack().catch(()=>{});await wait(900);const g1=await sh(P),u1=inApp(P);await P.goBack().catch(()=>{});await wait(900);const g2=await sh(P),u2=inApp(P),h2=await P.evaluate(()=>location.hash);
   ok(tag+'브라우저 뒤로 가기: 사후관리 → 프로젝트 → 목록 (인트라넷 안, 메뉴 그대로)',g0==='as|a1'&&g1==='projects|p1'&&g2===''&&u1&&u2&&h2==='#projects',[g0,g1,g2,h2].join(' , '));
   // 5) 고치던 내용이 있을 때
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);
   await P.locator('#veil .navbar [data-navback]').click();await wait(500);ok(tag+'안 고쳤으면 확인 창 없이 바로 뒤로',(await P.locator('#navAsk').count())===0&&(await sh(P))==='');
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);
   const memo=P.locator('#sheetForm [data-k="memo"]');const memo0=await memo.inputValue();await memo.fill('뒤로 가기 시험 메모');await wait(200);
   await P.locator('#veil .navbar [data-navback]').click();await wait(500);const askT=(await P.locator('#navAsk').count())?await P.locator('#navAsk').innerText():'';
   ok(tag+'고친 뒤 ‘← 뒤로’ → “저장하지 않은 내용이 있어요. 저장할까요?” (화면 안 창)',/저장하지 않은 내용이 있어요\. 저장할까요\?/.test(askT)&&/저장 안 함/.test(askT)&&/계속 수정/.test(askT),askT.replace(/\s+/g,' '));
   await P.locator('#navAsk [data-nav="stay"]').click();await wait(400);ok(tag+'‘계속 수정’ → 그 창 그대로, 적던 글 그대로',(await sh(P))==='projects|p1'&&(await memo.inputValue())==='뒤로 가기 시험 메모');
   await P.goBack().catch(()=>{});await wait(700);const ask2=await P.locator('#navAsk').count();
   ok(tag+'브라우저 뒤로 가기도 같은 확인 창 (창은 그대로)',ask2===1&&(await sh(P))==='projects|p1'&&inApp(P));
   await P.locator('#navAsk [data-nav="drop"]').click();await wait(700);const m1=await P.evaluate(()=>(window.__hfT.S().projects.find(x=>x.id==='p1')||{}).memo||'');
   ok(tag+'‘저장 안 함’ → 닫히고 원래 값 그대로',(await sh(P))===''&&m1===memo0&&m1!=='뒤로 가기 시험 메모',m1);
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);await P.locator('#sheetForm [data-k="memo"]').fill('저장하고 뒤로 '+who);await wait(200);
   await P.locator('#veil .navbar [data-navback]').click();await wait(400);await P.locator('#navAsk [data-nav="save"]').click();await wait(2500);
   ok(tag+'‘저장’ → 저장되고 뒤로',(await sh(P))===''&&(await P.evaluate(()=>(window.__hfT.S().projects.find(x=>x.id==='p1')||{}).memo||''))==='저장하고 뒤로 '+who,await P.evaluate(()=>(window.__hfT.S().projects.find(x=>x.id==='p1')||{}).memo||''));
   // 6) 안쪽 창에서 저장 → 들어온 곳으로 / 취소·Esc 도 한 단계
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);await P.locator('#pjHub .hubi[data-open="as"]').first().click();await wait(900);
   await P.locator('#sheetForm [data-k="content"]').fill('실리콘 보수 (수정 '+who+')');await P.locator('#saveSheet').click();await wait(2500);
   ok(tag+'사후관리에서 ‘저장’ → 프로젝트 통합 화면으로 돌아옴',(await sh(P))==='projects|p1',await sh(P));
   await P.locator('#pjHub .hubi[data-open="sites"]').first().click();await wait(900);await P.keyboard.press('Escape');await wait(700);const e1=await sh(P);
   await P.locator('#pjHub .hubi[data-open="sites"]').first().click();await wait(900);await P.locator('#cancelSheet').click();await wait(700);const e2=await sh(P);
   ok(tag+'Esc·‘취소’도 한 단계 뒤로 (프로젝트)',e1==='projects|p1'&&e2==='projects|p1',e1+' , '+e2);
   await P.locator('#pjHub .hubi[data-open="sites"]').first().click();await wait(900);await P.locator('#closeSheet').click();await wait(600);ok(tag+'‘닫기’는 한 번에 모두 닫음',(await sh(P))==='');
   // 7) 상담 진행 모드(다른 메뉴)로 넘어갔다가 돌아오기
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);await P.locator('#veil [data-cs="from"]').first().click();await wait(1200);
   const rb=(await P.locator('#navRetBar [data-navret]').count())?(await P.locator('#navRetBar').innerText()).replace(/\s+/g,' '):'';
   ok(tag+'프로젝트 → 상담 진행 모드: 화면 위에 ‘← 뒤로’와 온 길',(await P.evaluate(()=>location.hash))==='#consult'&&/← 뒤로/.test(rb)&&/프로젝트 › 홍길동/.test(rb),rb);
   await P.locator('#navRetBar [data-navret]').click();await wait(1200);
   ok(tag+'‘← 뒤로’ → 그 프로젝트 통합 화면으로',(await sh(P))==='projects|p1'&&(await P.evaluate(()=>location.hash))==='#projects'&&(await P.locator('#navRetBar [data-navret]').count())===0,await sh(P));
   await P.locator('#veil [data-cs="from"]').first().click();await wait(1200);await P.goBack().catch(()=>{});await wait(1200);
   ok(tag+'상담 진행 모드에서 브라우저 뒤로 가기 → 그 프로젝트',(await sh(P))==='projects|p1'&&inApp(P),await sh(P)+' '+await P.evaluate(()=>location.hash));
   await P.locator('#closeSheet').click();await wait(500);
   // 8) 맨 처음 화면에서 뒤로 가기: 바로 나가지 않음
   await go(P,'#home');let left=false;for(let i=0;i<6&&!left;i++){await P.goBack().catch(()=>{});await wait(500);if(!inApp(P)){left=true;break}if(await P.evaluate(()=>[...document.querySelectorAll('.toast')].some(x=>/한 번 더 누르면/.test(x.textContent)))){break}}
   ok(tag+'홈까지 뒤로 가도 인트라넷 안 · “한 번 더 누르면 나가요” 안내',!left&&inApp(P)&&(await P.evaluate(()=>location.hash||'#home'))==='#home');
   // 9) 직원: 다른 직원 담당 고객 카드에서도 뒤로
   if(who==='jjh'){await go(P,'#projects');await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);
    await P.evaluate(()=>{const b=document.createElement('button');b.dataset.open='customers';b.dataset.id='c2';b.id='tmpOpen';document.querySelector('#veil .sheet').appendChild(b)});await P.locator('#tmpOpen').click();await wait(800);
    const lk=await sh(P);await back(P);
    ok(tag+'다른 직원 담당 고객 카드(실무 팀 함께 열람)에서 ‘← 뒤로’ → 들어온 프로젝트',lk==='customers|c2'&&(await sh(P))==='projects|p1',lk+' → '+await sh(P));if(await P.locator('#closeSheet').count()){await P.locator('#closeSheet').click();await wait(400)}
    ok(tag+'대표 전용 칸 쓰기 거절 0',(await P.evaluate(()=>window.__mockDenied.length))===0,await P.evaluate(()=>window.__mockDenied.join(',')));await P.close()}}
  await A0.close();await ctx.close()}
 ok('화면 오류·브라우저 대화상자(alert/confirm/prompt) 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 const blk=HTML.slice(HTML.indexOf('// ===== 뒤로 가기 · 위치 표시'),HTML.indexOf('// ===== 연결 상태 · 연습 모드 원인'));
 ok('뒤로 가기 코드에 alert/confirm/prompt/window.open/iframe 0건 · 저장소 쓰기 0건',blk.length>3000&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe/.test(blk)&&!/\.set\(|\.update\(|\.delete\(|put\(/.test(blk),blk.length+'자');
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
