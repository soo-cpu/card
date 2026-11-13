// 견적 카드 연결 시험 (v0.99-27, 2026-11-13 · 다음 지시 2026-11-13 v1 2번): node intranet/tools/test/quote_enter_test.js [index.html]
// 프로젝트 통합 화면의 견적 카드 → 견적서_ver1 양식(공종별 상세 견적) 탭으로 열림 · 견적이 없으면 1차를 만들어 엶 · 견적 단계(① 항목 → ② 단가 미정 → ③ 단가 첨부) 표시 · 뒤로 가면 프로젝트
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
// 단가표: 상담 항목(current) 2개 + 세부 단가표(detail2026) 3개 (하나는 단가 0원 = 단가 미정)
const CAT={ver:"시험 단가표",updatedAt:T0,cols:["k","space","proc","name","unit","price","desc"],items:[["t_demo","전체","철거","철거 기본","식",500000,""],["t_tile","욕실","타일","욕실 타일","m2",40000,""]]};
const DET={ver:"단가표 시험 v0",updatedAt:T0,cols:["k","space","proc","name","unit","price","desc","mat","lab","chk"],items:[["U0001","전체","철거공사","현장보양","SET",250000,"",0,250000,""],["U0002","욕실","타일공사","벽타일 시공","m2",45000,"",20000,25000,""],["U0003","전체","목공사","단가 없는 품목","EA",0,"",0,0,"1"]]};
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},
 "catalog/current":CAT,"catalog/detail2026":DET,
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",stage:"견적",mgr:"정진혁",cat:"주거",inq:"2026-11-01",work:"욕실",updatedAt:T0},
 "projects/p2":{no:"P-2611-902",title:"견적 없는 현장",custName:"홍길동",custCode:"C-2611-901",stage:"상담",mgr:"정진혁",cat:"주거",inq:"2026-11-02",updatedAt:T0},
 "quotes/q1":{qno:"P-2611-901-1차",ver:"1차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"본견적 진행",d:"2026-11-03",amount:"",items:[],memo:"",createdAt:T0,updatedAt:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false}};
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const __tzSeoul=b.newContext.bind(b);b.newContext=o=>__tzSeoul(Object.assign({timezoneId:'Asia/Seoul'},o||{})) /* 시험 시간대 서울 고정 (검토 권고 2026-11-13: 한국 새벽에 날짜가 하루 어긋남) */;const errs=[],dialogs=[];
 for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){
  const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  const sh=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+'|'+s.id:''});
  const tabOn=p=>p.evaluate(()=>{const f=document.getElementById('sheetForm');return f?(String(f.className).match(/qt-(\w+)/)||[])[1]||'':''});
  const wide=p=>p.evaluate(()=>{const s=document.querySelector('.sheet');return document.documentElement.scrollWidth<=window.innerWidth+2&&!!s&&s.scrollWidth<=s.clientWidth+2});
  const A0=await open('admin',12000);
  for(const who of ['admin','jjh']){const P=who==='admin'?A0:await open(who);const tag=vn+' '+USERS[who].name+': ';
   await P.evaluate(()=>{location.hash='#projects'});await wait(800);await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1000);
   const card=P.locator('#pjHub .hubc').nth(2);const ct=await card.innerText();
   ok(tag+'견적 카드에 ‘견적서 작성 열기’ 버튼과 양식 안내 (견적서_ver1 · 단가 미정 → 단가 첨부)',/견적서 작성 열기/.test(ct)&&/견적서_ver1/.test(ct)&&/단가 미정 → 단가 첨부/.test(ct),ct.replace(/\s+/g,' ').slice(0,120));
   await card.locator('[data-pqenter]').click();await wait(1500);
   ok(tag+'버튼 → 그 프로젝트 견적이 ‘상세 견적 (공종별)’ 탭으로 열림',(await sh(P))==='quotes|q1'&&(await tabOn(P))==='detail',(await sh(P))+' '+await tabOn(P));
   const st=(await P.locator('#qStep').count())?(await P.locator('#qStep').innerText()).replace(/\s+/g,' '):'';
   ok(tag+'견적 단계 표시: ① 항목·수량 → ② 단가 미정 → ③ 단가 첨부 (지금 ①)',/① 항목·수량 넣기/.test(st)&&/② 단가 미정/.test(st)&&/③ 단가 첨부/.test(st)&&(await P.locator('#qStep').getAttribute('data-step'))==='0',st.slice(0,160));
   ok(tag+'위치 표시 ‘프로젝트 › 홍길동 › 견적 1차’ · 가로 넘침 없음',/프로젝트 › 홍길동 › 견적 1차/.test((await P.locator('#veil .crumb').innerText()).replace(/\s+/g,' '))&&await wide(P));
   // 수량을 넣으면 ③, 단가 0원 품목을 넣으면 ② 단가 미정
   const dq=k=>P.locator('#sheetForm [data-dq="'+k+'"]');
   if(await dq('U0001').count()){await P.evaluate(()=>document.querySelectorAll('#sheetForm details[data-dproc]').forEach(d=>d.open=true));
    await dq('U0001').fill('1');await dq('U0001').dispatchEvent('change');await wait(700);const s1=await P.locator('#qStep').getAttribute('data-step');
    await P.evaluate(()=>document.querySelectorAll('#sheetForm details[data-dproc]').forEach(d=>d.open=true));
    await dq('U0003').fill('2');await dq('U0003').dispatchEvent('change');await wait(700);const s2=await P.locator('#qStep').getAttribute('data-step'),t2=(await P.locator('#qStep').innerText()).replace(/\s+/g,' ');
    ok(tag+'단가 있는 품목만 → ③ 단가 첨부 · 단가 0원 품목이 섞이면 → ② 단가 미정 1개',s1==='2'&&s2==='1'&&/단가 미정 1개/.test(t2),s1+' '+s2+' '+t2.slice(0,90));
    await P.evaluate(()=>document.querySelectorAll('#sheetForm details[data-dproc]').forEach(d=>d.open=true));
    const dp=P.locator('#sheetForm [data-dp="U0003"]');await dp.fill('30000');await dp.dispatchEvent('change');await wait(700);
    ok(tag+'그 품목에 단가를 넣으면(이 견적에만) → ③ 단가 첨부',(await P.locator('#qStep').getAttribute('data-step'))==='2',await P.locator('#qStep').getAttribute('data-step'))}
   else ok(tag+'공종별 견적서에 단가표 품목이 보임',false,'data-dq 없음');
   // 뒤로: 고친 내용이 있으니 확인 창 → 저장 안 함 → 프로젝트
   await P.locator('#veil .navbar [data-navback]').click();await wait(500);const asked=await P.locator('#navAsk').count();if(asked){await P.locator('#navAsk [data-nav="drop"]').click();await wait(800)}
   ok(tag+'견적에서 ‘← 뒤로’ → (고친 내용 확인 뒤) 프로젝트 통합 화면',asked===1&&(await sh(P))==='projects|p1',asked+' '+await sh(P));
   // 견적 줄을 눌러도 같은 탭
   await P.locator('#pjHub .hubi[data-open="quotes"]').first().click();await wait(1200);
   ok(tag+'견적 줄을 눌러도 같은 양식 탭(공종별)으로',(await sh(P))==='quotes|q1'&&(await tabOn(P))==='detail',await tabOn(P));await P.evaluate(()=>window.__hfT.closeSheet());await wait(400);
   // 견적이 없는 프로젝트: 만들어서 엶 (대표만 한 번 — 같은 저장소라 직원은 이미 있는 것을 엶)
   await P.evaluate(()=>window.__hfT.open('projects','p2'));await wait(1000);const c2=P.locator('#pjHub .hubc').nth(2);const before=await P.evaluate(()=>window.__hfT.S().quotes.filter(q=>q.pno==='P-2611-902').length);
   const lbl=(await c2.locator('[data-pqenter]').innerText()).trim();await c2.locator('[data-pqenter]').click();await wait(2500);
   const after=await P.evaluate(()=>window.__hfT.S().quotes.filter(q=>q.pno==='P-2611-902').map(q=>q.qno).join(','));const s2=await sh(P);
   ok(tag+(before?'이미 만든 1차를 엶 (새로 또 만들지 않음)':'견적이 없으면 ‘+ 견적 1차 만들기’ → P-2611-902-1차를 만들어 같은 양식으로 엶'),(before?/견적서 작성 열기/.test(lbl):/견적 1차 만들기/.test(lbl))&&after==='P-2611-902-1차'&&/^quotes\|/.test(s2)&&(await tabOn(P))==='detail',lbl+' / '+after+' / '+s2+' '+await tabOn(P));
   await P.locator('#veil .navbar [data-navback]').click();await wait(800);ok(tag+'새로 만든 견적에서 ‘← 뒤로’ → 그 프로젝트',(await sh(P))==='projects|p2',await sh(P));await P.evaluate(()=>window.__hfT.closeSheet());await wait(300);
   if(who!=='admin'){ok(tag+'대표 전용 칸 쓰기 거절 0',(await P.evaluate(()=>window.__mockDenied.length))===0,await P.evaluate(()=>window.__mockDenied.join(',')));await P.close()}}
  await A0.close();await ctx.close()}
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
