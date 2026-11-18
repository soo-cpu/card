// 상세 자동견적·원가 보안 시험 (v0.99-39, 2026-11-18 · 상세 자동견적 지시 2026-11-12 v1 2·3번): node intranet/tools/test/dq_test.js [index.html]
// 대표·채진아·정진혁(p1 담당)·이봄이 × PC·Pixel 7: 자동 견적 입력 칸 → 평형 수량 규칙 → ‘견적 줄 만들기’(더하기만 · 같은 항목은 물어봄) → 간접비(5% · 평형×22,000) → 할인 → VAT → 0원 경고
// HF-RO 변환 왕복 · 권한별 원가 칸 유무(대표·채진아·담당 = 코드로 · 이봄이 = 칸 없음) · 저장한 줄·공용 작업 칸에 원가 없음 · PDF(캔버스 글자)에 원가·HF-RO 코드 없음
// 세부 단가표는 시험용 가짜 단가(실제 단가 아님) — 자동 견적이 쓰는 항목 번호(k)만 index.html 에서 읽어 만들고, U0759(고급 마루) 하나는 일부러 빼서 ‘단가표에 없음 → 0원’ 길을 시험
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const blk=HTML.slice(HTML.indexOf('// ===== v0.99-39 상세 자동견적'),HTML.indexOf('// ===== v0.99-39 원가 보안'));
const KS=[...new Set(blk.match(/"(U0\d{3}|X\d\d)"/g).map(x=>x.slice(1,-1)))].filter(k=>k!=="U0759");
const PRICE=k=>k==="X04"?22000:k==="U0004"?300000:10000+(parseInt(k.replace(/\D/g,''),10)%97)*1013; // 시험용 가짜 단가
const CAT={ver:"시험 단가표",updatedAt:T0,cols:["k","space","proc","name","unit","price","desc"],items:[["t_demo","전체","철거","철거 기본","식",500000,""]]};
const DET={ver:"단가표 시험 v0",updatedAt:T0,cols:["k","space","proc","name","unit","price","desc","mat","lab","chk"],items:KS.map(k=>[k,"세부 단가표","단가표·"+(k[0]==="X"?"갑지":"시험"),"시험 항목 "+k,"EA",PRICE(k),"",0,PRICE(k),""])};
const COST={U0004:123457};// 원가표(HF): 시험 원가 123,457원 × 수량 2 = 246,914원
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},
 "catalog/current":CAT,"catalog/detail2026":DET,"ccost/current":{items:COST,updatedAt:T0},
 "acct/u_cja/ccost/current":{items:COST,updatedAt:T0},"acct/u_jjh/ccost/current":{items:COST,updatedAt:T0},"acct/u_bom/ccost/current":{items:COST,updatedAt:T0},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 전체",custName:"홍길동",custCode:"C-2611-901",stage:"견적",mgr:"정진혁",cat:"주거",inq:"2026-11-01",work:"전체",py:34,updatedAt:T0},
 "quotes/q1":{qno:"P-2611-901-1차",ver:"1차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"본견적 진행",d:"2026-11-03",amount:1155000,
   items:[{k:"U0004",space:"세부 단가표",name:"시험 항목 U0004",unit:"EA",q:2,price:300000,amt:600000},{space:"거실",name:"고객 요청 별도 품목",unit:"식",q:1,price:450000,amt:450000,edited:true}],memo:"",createdAt:T0,updatedAt:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false}};
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ENC=s=>String(s).replace(/\d/g,c=>"SHOMEFURNI"[+c]);
(async()=>{const b=await chromium.launch();const __tz=b.newContext.bind(b);b.newContext=o=>__tz(Object.assign({timezoneId:'Asia/Seoul'},o||{}));const errs=[],dialogs=[];
 for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){
  const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{if(d.type()!=='confirm')dialogs.push(who+' '+d.type());d.dismiss()});
   await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK+`;(()=>{const f=CanvasRenderingContext2D.prototype.fillText;window.__cvText=[];CanvasRenderingContext2D.prototype.fillText=function(t,...a){window.__cvText.push(String(t));return f.call(this,t,...a)}})();`);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  const askAns=async(P,yes)=>{for(let i=0;i<20&&!(await P.locator('.okask').count());i++)await wait(150);const n=await P.locator('.okask').count();if(n){const txt=await P.locator('.okask').innerText();await P.locator('.okask [data-ok="'+(yes?1:0)+'"]').click();await wait(900);return txt}return ''};
  const setDa=async(P,k,v)=>{const el=P.locator('#daIn [data-da="'+k+'"]');if(typeof v==='boolean'){await el.setChecked(v)}else if(await el.evaluate(e=>e.tagName)==='SELECT')await el.selectOption(String(v));else{await el.fill(String(v));await el.dispatchEvent('change')}await wait(250)};
  const val=(P,k)=>P.locator('#daIn [data-da="'+k+'"]').inputValue();
  const wide=P=>P.evaluate(()=>{const s=document.querySelector('.sheet');return document.documentElement.scrollWidth<=window.innerWidth+2&&!!s&&s.scrollWidth<=s.clientWidth+2});
  const A0=await open('admin',12000);
  for(const who of ['admin','cja','jjh','bom']){const P=who==='admin'?A0:await open(who);const tag=vn+' '+USERS[who].name+': ';
   // HF-RO 변환 왕복 (화면 코드 그대로)
   const rt=await P.evaluate(()=>{const H=window.__hfT,L=[0,7,10,1234567890,246914,1000000,28.5,-350000];return {a:H.hfEnc(1234567890),b:H.hfEnc("1,234,000"),c:H.hfDec("H,OME,SSS"),d:H.hfDec("homefurnis"),all:L.every(v=>H.hfDec(H.hfEnc(v))===v),bad:isNaN(H.hfDec("xyz"))}});
   ok(tag+'HF-RO 변환: 1234567890 ↔ HOMEFURNIS · 1,234,000 → H,OME,SSS · 숫자→글자→숫자 왕복(소수·음수 포함)',rt.a==='HOMEFURNIS'&&rt.b==='H,OME,SSS'&&rt.c===1234000&&rt.d===1234567890&&rt.all&&rt.bad,JSON.stringify(rt));
   const qid=await P.evaluate(()=>{const q=window.__hfT.S().quotes.find(x=>x.qno==='P-2611-901-1차');return q&&q.id});
   await P.evaluate(i=>window.__hfT.openQ(i,'detail'),qid);await wait(1200);
   ok(tag+'상세 견적(공종별) 탭 맨 위 ‘자동 견적’ 14칸 + ‘견적 줄 만들기’',(await P.locator('#daBox').count())===1&&(await P.locator('#daIn [data-da]').count())>=25&&(await P.locator('#daBox [data-dagen]').count())===1,await P.locator('#daIn [data-da]').count());
   // 평형 기본값 (5-4): 프로젝트 34평 → 욕실 2 · 문 6 · 발코니 3 · 주방 4.5m(중급)
   ok(tag+'평형 34평(프로젝트)·중급 기본값: 욕실 2칸·전체 철거 · 방문 문틀까지 6개 · 발코니 3 · 주방 4.5m · 강마루',await val(P,'py')==='34'&&await val(P,'bath')==='2'&&await val(P,'bathM')==='전체 철거'&&await val(P,'door')==='문틀까지 교체'&&await val(P,'doorN')==='6'&&await val(P,'balc')==='3'&&await val(P,'kitL')==='4.5'&&await val(P,'floor')==='강마루',[await val(P,'py'),await val(P,'bath'),await val(P,'doorN'),await val(P,'kitL')].join(','));
   await setDa(P,'py',24);ok(tag+'24평으로 바꾸면 욕실 1칸 · 방문 4개 (규칙대로 다시 채움)',await val(P,'bath')==='1'&&await val(P,'doorN')==='4');
   await setDa(P,'g','기본');ok(tag+'전체 등급 기본 → 바닥 장판 · 방문 그대로(필름) 5개 · 중문 없음 · 주방 4m',await val(P,'floor')==='장판'&&await val(P,'door')==='그대로(필름)'&&await val(P,'doorN')==='5'&&await val(P,'jm')==='없음'&&await val(P,'kitL')==='4');
   await setDa(P,'bath',2);await setDa(P,'py',56);ok(tag+'직접 고친 칸(욕실 2)은 평형을 바꿔도 그대로 · 발코니 7(50평 이상)',await val(P,'bath')==='2'&&await val(P,'balc')==='7');
   await setDa(P,'py',34);await setDa(P,'g','중급');await setDa(P,'gp:바닥','고급');await setDa(P,'floor','고급 마루');await setDa(P,'win','전체');await setDa(P,'extL',true);
   ok(tag+'휴대폰 화면 가로 넘침 없음 · 입력 칸 글자 16px',await wide(P)&&(await P.locator('#daIn [data-da="py"]').evaluate(e=>getComputedStyle(e).fontSize))==='16px');
   const before=await P.evaluate(()=>window.__hfT.qeFull());
   await P.locator('#daBox [data-dagen]').click();const ask1=await askAns(P,false);await wait(800);
   const E=await P.evaluate(()=>window.__hfT.qeFull());const by=k=>E.find(l=>l.k===k);
   ok(tag+'같은 항목(U0004)이 이미 있어 확인 창으로 물어봄 → ‘있는 줄 그대로’',/이미 있는 항목 1개/.test(ask1)&&by('U0004')&&by('U0004').q===2&&!by('U0004').auto,ask1.replace(/\s+/g,' ').slice(0,80));
   ok(tag+'기존 줄 보존 (직접 입력 품목·수량·단가 그대로) · 줄은 더하기만',before.every(b=>E.some(l=>l.name===b.name&&l.q===b.q&&l.price===b.price))&&E.length>before.length+40,before.length+' → '+E.length);
   ok(tag+'수량 규칙: 욕실 전체 철거 2칸 · 실크 19롤(34×0.55) · 도배 인원 6(34×0.19) · 몰딩 34 · 다운라이트 19 · 공사 마감 35평 이하 구간',by('U0067')&&by('U0067').q===2&&by('U0415').q===1&&by('U0419').q===1&&by('U0738').q===19&&by('X09').q===6&&by('U0222').q===34&&by('U0849').q===19&&!!by('U0120'),['U0067','U0738','X09','U0849'].map(k=>by(k)&&by(k).q).join(','));
   ok(tag+'등급 묶음: 중급 = 한샘 필름(U0318) · 실크 일반(U0738) · 문틀까지(U0241 6개) · 초슬림 중문(U0248) · 중급 욕실 세트 2칸(U0430×2) · 확장 거실+행위허가',by('U0318')&&by('U0318').q===1.5&&by('U0241').q===6&&by('U0248')&&by('U0430').q===2&&by('U0151')&&by('X05')&&!by('U0316')&&!by('U0741'));
   const auto=E.filter(l=>l.auto);ok(tag+'만든 줄마다 자동 표시(어느 입력으로) · 단가 = 세부 단가표 그대로',auto.length===E.length-before.length&&auto.every(l=>/^자동 견적 · |^간접비 · /.test(l.auto))&&by('U0738').price===DET.items.find(r=>r[0]==='U0738')[5],auto[0]&&auto[0].auto);
   const zero=E.filter(l=>!l.dc&&!l.price);ok(tag+'단가표에 없는 항목은 0원 줄 + 단가 확인 필요 (창호 본체 · 고급 마루 U0759) · 금액 안 지어냄',zero.length===2&&zero.every(l=>l.chk===1)&&zero.some(l=>/창호 본체 교체 \(전체\)/.test(l.name))&&zero.some(l=>/U0759/.test(l.name)),zero.map(l=>l.name).join(' / '));
   const pill=await P.locator('#sheetForm').innerText();ok(tag+'화면에 ‘0원 품목 2개 · 단가 확인 필요’ 경고 · 자동 표시 글자',/0원 품목 2개/.test(pill)&&/자동 견적 · /.test(pill));
   const m=await P.evaluate(()=>{const E=window.__hfT.qeFull(),a=l=>Math.round(l.price*l.q),dir=E.filter(l=>!l.ind&&!l.dc).reduce((t,l)=>t+a(l),0),pv=E.find(l=>l.ind==='진행비'),mg=E.find(l=>l.ind==='관리비');return {dir,pv:pv&&pv.price,mg:mg&&[mg.k,mg.q,mg.price]}});
   ok(tag+'간접비: 공사진행비 = 직접공사비 × 5% · 기본시공관리비 = 34평 × 22,000원',m.pv===Math.round(m.dir*0.05)&&m.mg&&m.mg[0]==='X04'&&m.mg[1]===34&&m.mg[2]===22000,JSON.stringify(m));
   // 할인 → 합계 (공급가 → 할인 → VAT 10% → 총액)
   await setDa(P,'dcV',1000000);await P.locator('#daBox [data-daind]').click();await wait(700);
   const s=await P.evaluate(()=>{const E=window.__hfT.qeFull(),a=l=>Math.round(l.price*l.q),sup=E.filter(l=>!l.dc).reduce((t,l)=>t+a(l),0),dc=E.filter(l=>l.dc).reduce((t,l)=>t+a(l),0);return {sup,dc,net:sup+dc,txt:(document.querySelector('[data-dt="sum"]')||{}).innerText||''}});
   const tot=Math.round(s.net*1.1);ok(tag+'할인 100만 원 → 합계 칸: 공급가 → 할인 → 부가세 10% → 총액 (VAT 별도 표시)',s.dc===-1000000&&/할인 후 공급가/.test(s.txt)&&s.txt.replace(/\s+/g,'').includes(tot.toLocaleString('ko-KR')+'원')&&s.txt.replace(/\s+/g,'').includes((tot-s.net).toLocaleString('ko-KR')+'원')&&/VAT 별도/.test(await P.locator('#sheetForm').innerText()),s.txt.replace(/\s+/g,' ').slice(0,200));
   // 다시 만들기 → ‘수량 바꾸기’ (옛 수량 기록)
   await P.locator('#daBox [data-dagen]').click();const ask2=await askAns(P,true);await wait(800);const E2=await P.evaluate(()=>window.__hfT.qeFull());const u4=E2.find(l=>l.k==='U0004');
   ok(tag+'다시 만들기 → 같은 항목 물어봄 → ‘수량 바꾸기’: U0004 2 → 1 (옛 수량 기록) · 줄 수 그대로(두 번 안 들어감)',/이미 있는 항목/.test(ask2)&&u4.q===1&&u4.autoOld&&u4.autoOld[0].q===2&&E2.length===E.length+1,E.length+' → '+E2.length);
   // 원가 칸 (3번): 인쇄 탭의 HF
   await P.evaluate(()=>{const b=document.querySelector('[data-qtab="print"]');b&&b.click()});await wait(700);
   const hf=await P.locator('#sheetForm .qhf').count(),hfTxt=hf?await P.locator('#sheetForm .qhf').evaluate(e=>e.textContent):'';const canSee=who!=='bom';
   if(canSee){ok(tag+'원가·마진 칸 있음 → 기본은 HF-RO 코드 글자 (숫자 원가 246,914 안 보임) · ‘HF-RO 코드’ 안내',hf===1&&hfTxt.includes(ENC('246,914'))&&!hfTxt.includes('246,914')&&/HF-RO 코드/.test(hfTxt),hfTxt.replace(/\s+/g,' ').slice(0,160));
    await P.locator('#sheetForm .qhf summary').click();await P.locator('#sheetForm [data-hfshow]').first().click();await wait(600);const t2=await P.locator('#sheetForm .qhf').evaluate(e=>e.textContent);
    await P.locator('#sheetForm [data-hfshow]').first().click();await wait(600);const t3=await P.locator('#sheetForm .qhf').evaluate(e=>e.textContent);
    ok(tag+'‘숫자로 잠깐 보기’ → 246,914원 · ‘다시 숨기기’ → 코드로',t2.includes('246,914')&&!t3.includes('246,914')&&t3.includes(ENC('246,914')),t2.replace(/\s+/g,' ').slice(0,90))}
   else ok(tag+'원가를 볼 수 없는 사람(담당 아님): 원가·마진 칸·HF-RO 글자·보기 버튼 자체가 없음',hf===0&&(await P.locator('.hfro,[data-hfshow]').count())===0&&!(await P.locator('#sheetForm').innerText()).includes(ENC('246,914')));
   if(who==='admin'){await P.evaluate(()=>{const b=document.querySelector('[data-qtab="cost"]');b&&b.click()});await wait(600);const ct=await P.locator('#sheetForm .qtb[data-qt="cost"]').evaluate(e=>e.textContent);
    ok(tag+'대표 ‘원가·마진 계산’ 탭도 원가·하한가는 HF-RO 코드 (작성 중 U0004 1개 → 원가 123,457)',ct.includes(ENC('123,457'))&&!ct.includes('123,457')&&/HF-RO 코드/.test(ct),ct.replace(/\s+/g,' ').slice(0,120))}
   else ok(tag+'직원 화면에 ‘원가·마진 계산 (대표)’ 탭 없음',(await P.locator('[data-qtab="cost"]').count())===0);
   // 저장 (기존 저장 버튼·차수 흐름 그대로)
   await P.evaluate(()=>{const b=document.querySelector('[data-qtab="detail"]');b&&b.click()});await wait(600);
   const nq0=await P.evaluate(()=>window.__hfT.S().quotes.length);await P.locator('#sheetForm .qtb[data-qt="detail"] [data-qesave]').click();const ask3=await askAns(P,true);await wait(2500);
   const nq=await P.evaluate(()=>window.__hfT.S().quotes.filter(q=>q.prevQno==='P-2611-901-1차').sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0]);
   ok(tag+'저장: 0원 품목 경고 확인 창 → 새 차수(2차)로 저장 · 원래 1차 그대로 · 총액 = 공급가(할인 후) × 1.1',/0원 품목 2개/.test(ask3)&&nq&&/-\d+차$/.test(nq.qno)&&nq.amount===Math.round(nq.items.reduce((t,l)=>t+l.amt,0)*1.1)&&(await P.evaluate(()=>window.__hfT.S().quotes.find(q=>q.qno==='P-2611-901-1차').items.length))===2,(nq&&nq.qno)+' '+(nq&&nq.amount)+' '+ask3.replace(/\s+/g,' ').slice(0,60));
   const db=await D();const bad=JSON.stringify(Object.entries(db).filter(([k])=>/^(quotes|work)\//.test(k)).map(([,v])=>v));
   ok(tag+'저장된 견적 줄·공용 작업 칸에 원가 없음 (원가 숫자·qCost·cost 칸 없음)',nq&&nq.items.every(l=>!('cost' in l)&&!('qCost' in l))&&!bad.includes('123457')&&!bad.includes('246914')&&!/"qCost"/.test(bad));
   // PDF: 캔버스에 그린 글자에 원가·HF-RO 코드 없음 · VAT 별도 · 할인 칸
   if(nq){await P.evaluate(()=>{window.__cvText=[]});const pr=P.evaluate(i=>window.__hfT.qPrint(i),nq.id);let ask4='';for(let i=0;i<3;i++){const t=await askAns(P,true);if(!t)break;ask4+=t+' | '}await pr.catch(()=>{});await wait(800);const T=await P.evaluate(()=>window.__cvText);
    const codeLike=T.filter(t=>/^[SHOMEFURNI,.%\-]{3,}$/.test(t.trim()));
    ok(tag+'견적서 PDF: 0원 품목 확인 → 출력 · ‘VAT 별도’ 안내 · 할인 칸 · 원가(246,914)·HF-RO 코드·‘원가’ 글자 없음',/0원 품목 2개/.test(ask4)&&T.length>20&&T.some(t=>/VAT\) 별도/.test(t))&&T.includes('할인')&&!T.some(t=>/246,914|123,457|원가|마진|HF-RO/.test(t))&&!codeLike.length&&!T.some(t=>t.includes(ENC('246,914'))),T.length+' '+codeLike.join(','))}
   else ok(tag+'견적서 PDF 시험',false,'저장된 견적 없음');
   if(who!=='admin'){ok(tag+'대표 전용 칸 쓰기 거절 0',(await P.evaluate(()=>window.__mockDenied.length))===0,await P.evaluate(()=>window.__mockDenied.join(',')))}
   await P.evaluate(()=>window.__hfT.closeSheet&&window.__hfT.closeSheet());await wait(300);if(who!=='admin')await P.close()}
  await A0.close();await ctx.close()}
 ok('화면 오류·막히는 브라우저 창(alert·prompt) 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
