// 고객 공유 페이지 버튼 시험 (v0.99-39, 2026-11-18): node intranet/tools/test/fshare_test.js [index.html]
// 대표·정진혁·이봄이·채진아 × PC·Pixel 7: 프로젝트 상세의 고객/현장 진행/견적/사후관리 카드, 고객 카드 '이 고객의 모든 것', 고객 이름 검색, 돈 정보(원가·마진·성과금·A/S 비용) 안 샘, 휴대폰 가로 넘침 없음
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "customers/c2":{code:"C-2611-902",name:"김영희",tel:"",addr:"",mgr:"이봄이",status:"진행중",steps:[1],stage:"1-상담영업",inq:"2026-11-02",createdAt:T0,updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",approvals:[{amt:1515151,t:"자재"}],cat:"주거",inq:"2026-11-01",work:"욕실",start:"2026-11-05",endPlan:"2026-12-20",updatedAt:T0},"ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "projects/p2":{no:"P-2605-902",title:"지난 현장 주방",custName:"홍길동",custCode:"C-2611-901",stage:"사후관리",mgr:"이봄이",contractAmt:"12000000",cat:"주거",inq:"2026-04-01",work:"주방",start:"2026-04-10",end:"2026-05-01",warrantyEnd:"2027-05-01",warrantyMonths:12,fieldCode:"https://soo-cpu.github.io/card/field/?s=AbCdEfGhIjKlMnOpQrStUv12",updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",code:"C-2611-901",name:"시험 현장 욕실",customer:"홍길동",mgr:"정진혁",status:"공사 중",proc:"타일",progress:"40",start:"2026-11-05",logs:[{d:"2026-11-08",proc:"철거",text:"욕실 철거 끝"},{d:"2026-11-10",proc:"타일",text:"욕실 벽 타일 시공 중"}],updatedAt:T0},
 "quotes/q1":{qno:"P-2611-901-1차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"계약",d:"2026-11-03",amount:"3300000",qCost:"2121212",items:[],updatedAt:T0},
 "quotes/q2":{qno:"P-2611-901-2차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"본견적 진행",d:"2026-11-09",amount:"5555000",amtLock:"미확정",items:[],updatedAt:T0},
 "quotes/q9":{qno:"따로 견적",pno:"",code:"C-2611-902",name:"김영희",staff:"이봄이",status:"신규 상담",d:"2026-11-11",amount:"",items:[],updatedAt:T0},
 "as/a1":{pno:"P-2605-902",code:"C-2611-901",site:"지난 현장 주방",d:"2026-11-07",content:"싱크대 하부 실리콘 보수",status:"접수",mgr:"이봄이",asCost:"777777",cost:"회사"},
 "fin/bonuspay":{rows:[{name:"정진혁",amt:"13131313"}]}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const MONEY=/2121212|2,121,212|20202020|20,202,020|777777|777,777|1515151|1,515,151|13131313|13,131,313/;
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){
  const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul'},opt));await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://hf.test'});
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  const A0=await open('admin',12000);
  for(const who of ['admin','jjh','bom']){const P=who==='admin'?A0:await open(who);const tag=vn+' '+USERS[who].name+': ';
   await P.evaluate(()=>{location.hash='#projects'});await wait(900);
   // p1: 코드 없음 → 만들기 링크 (담당 정진혁·대표만 보임, 이봄이는 가린 줄)
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);
   const sh1=P.locator('#pjHub .hubshare');const n1=await sh1.count();
   {/* 실무 팀은 통합 화면 전체(고객 전화 포함)를 이미 보므로 버튼도 같은 범위 */const a=sh1.locator('a');const href=n1?await a.getAttribute('href'):'';const u=href?new URL(href):null;const q=u?u.searchParams:new URLSearchParams();
    ok(tag+'p1 ‘고객 공유 페이지 만들기’ 링크: 새 탭·현장 추가 창 미리 채움',n1===1&&u&&u.origin+u.pathname==='https://soo-cpu.github.io/card/field/'&&q.has('admin')&&q.get('new')==='1'&&q.get('name')==='시험 현장 욕실'&&q.get('manager')==='정진혁 실장'&&q.get('start')==='2026-11-05'&&q.get('end')==='2026-12-20'&&q.get('proj')==='P-2611-901'&&await a.getAttribute('target')==='_blank'&&/noopener/.test(await a.getAttribute('rel')),href);
    ok(tag+'주소에 고객 이름·전화·금액 없음',!/홍길동|%ED%99%8D|1234|5678|33000000|20202020/.test(href),href)}
   await P.evaluate(()=>window.__hfT.closeSheet());await wait(300);
   // p2: 코드(주소 전체) 있음 → 열기·복사
   await P.evaluate(()=>window.__hfT.open('projects','p2'));await wait(1200);
   const sh2=P.locator('#pjHub .hubshare');const n2=await sh2.count();
   {const h=n2?await sh2.locator('a:not([data-fadm])').getAttribute('href'):'';ok(tag+'p2 ‘고객 화면 열기’ = 고객 주소 (?s=24자리, admin 없음)',n2===1&&h==='https://soo-cpu.github.io/card/field/?s=AbCdEfGhIjKlMnOpQrStUv12',h);
    await P.evaluate(()=>{window.__clip='';document.addEventListener('copy',e=>{const t=e.target;window.__fb=(t&&t.value)||String(document.getSelection()||'')},true)});await sh2.locator('[data-fcopy]').click();await wait(500);const fb=await P.evaluate(()=>window.__fb||'');
    ok(tag+'복사 막힌 곳(클립보드 API 없음): 예비 복사로 고객 주소',fb==='https://soo-cpu.github.io/card/field/?s=AbCdEfGhIjKlMnOpQrStUv12',fb);
    await P.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:t=>{window.__clip=t;return Promise.resolve()}}})});await sh2.locator('[data-fcopy]').click();await wait(500);const clip=await P.evaluate(()=>window.__clip);
    ok(tag+'‘고객 공유 링크 복사’ → 클립보드에 고객 주소',clip==='https://soo-cpu.github.io/card/field/?s=AbCdEfGhIjKlMnOpQrStUv12',clip)}
   ok(tag+'가로 넘침 없음',await P.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
   await P.evaluate(()=>window.__hfT.closeSheet());await wait(300);if(who!=='admin')await P.close()}
  await A0.close();await ctx.close()}
 // fcCode 단위 확인
 const p=await (await b.newContext()).newPage();await p.setContent('<script>'+HTML.slice(HTML.indexOf('function fcCode'),HTML.indexOf('function hubShareHTML'))+'<\/script>');
 const r=await p.evaluate(()=>[fcCode('AbCdEfGhIjKlMnOpQrStUv12'),fcCode(' https://x/field/?s=AbCdEfGhIjKlMnOpQrStUv12&z=1 '),fcCode('AbCd'),fcCode('<script>'),fcCode('?s=AbCdEfGhIjKlMnOpQrStUv12345'),fcCode('')]);
 ok('코드 읽기: 24자리·주소 전체 OK, 짧은 것·이상한 것·25자리 이상 거절',JSON.stringify(r)===JSON.stringify(['AbCdEfGhIjKlMnOpQrStUv12','AbCdEfGhIjKlMnOpQrStUv12','','','','']),JSON.stringify(r));
 { const P2=await (await b.newContext()).newPage();await P2.setContent('<script>const S={staff:[]},esc=x=>String(x);'+HTML.slice(HTML.indexOf('const FIELD_BASE='),HTML.indexOf('async function fcCopy'))+'<\/script>');
  const h=await P2.evaluate(()=>hubShareHTML({no:'P-2611-905',title:'',custName:'홍길동',custTel:'010-9999-8888',mgr:'정진혁'},{title:'',custName:'홍길동'}));
  ok('현장명이 빈 프로젝트 → 주소에 고객 이름·전화 없음 (name 칸 자체 없음)',/proj=P-2611-905/.test(h)&&!/name=|홍길동|%ED%99%8D|9999|8888/.test(h),h.slice(0,200)) }
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
