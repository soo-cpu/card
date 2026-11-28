// 프로젝트 손익 한 장 시험 (v0.99-56 D · 다음 지시 2026-11-28 v11 D): node intranet/tools/test/pl_test.js [index.html]
// 대표·채진아만 메뉴·화면 / 정진혁·이봄이는 메뉴 없음·주소 직접 입력 막힘·저장 칸 거절 / 채진아 화면·출력에 성과금 글자·값 없음
// 숫자가 프로젝트 정산 요약·원가 관리 화면과 같음(가짜 자료 6건: 28% 위·밑·딱 28.0%·원가 없음·사후 원가 있는 것·결재 기준) / 낮은 순 정렬·빨간 표시 / 필터·정렬·출력 / 390px 넘침 없음 / 저장 요청 0(열람 기록만)
const {chromium}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||__dirname+'/../../index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const L=(proc,sale,est,i)=>({lid:"pl_"+proc+i,proc,sale,est,act:"",st:"예상",hist:[]});
const P=(no,title,x)=>Object.assign({no,title,custName:"시험고객",stage:"시공",mgr:"정진혁",cat:"주거",inq:"2026-12-20",files:[],updatedAt:T0,__at:T0},x);
const PC=(lines,post,x)=>({pc:Object.assign({lines,post:post||[],updatedAt:T0,by:"u_boss"},x||{}),updatedAt:T0});
// 가짜 자료 (계약 금액은 부가세 포함):
//  pA 주거·시공   계약 1,000만 · 실행 600만(40.0%) · 사후 없음            → 기준 위 (예상으로 판단) · 받은 돈 100만
//  pB 관공서·준공 계약 2,000만 · 실행 1,300만(35.0%) · 사후 1,500만(25.0%) → 기준 밑 · 다 받음
//  pC 주거·사후관리 계약 1,000만 · 실행 700만(30.0%) · 사후 720만(28.0%)   → 딱 28.0% = 기준 밑 아님 · 계약일 2026
//  pD 주거·계약   계약 500만 · 원가 없음                                    → 맨 아래 '원가 없음'
//  pE 관공서·종료 계약 3,000만 · 실행 2,400만(20.0%·확정 잠금) · 사후 1,800만(40.0%·결재 연결 줄 포함) + A/S 비용 30만(정산 요약 39.0%)
//  pF 주거·준공   계약 800만 · 원가 관리 비어 있음 · 승인된 품의 640만 → 사후 원가(결재 기준) 640만(20.0%) → 기준 밑
//  pG 주거·견적 (계약 전) → 표에 안 나옴
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "customers/c1":{code:"C-2612-901",name:"시험고객",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-12-01",createdAt:T0,updatedAt:T0},
 "projects/pA":P("P-2701-911","가나아파트 전체",{contractAmt:10000000,cdate:"2027-01-10",perf:"순수 인테리어",pays:[{step:"계약금",rate:10,amt:"1,000,000",due:"2027-01-10",paid:"2027-01-10"},{step:"착수금",rate:40,amt:"4,000,000",due:"2027-01-20",paid:""}]}),
 "ppriv/pA":PC([L("철거",3000000,2000000,1),L("목공",7000000,4000000,2)]),
 "projects/pB":P("P-2701-912","다라초등학교 교실",{stage:"준공",cat:"관공서·학교",mgr:"이봄이",contractAmt:20000000,cdate:"2027-01-15",end:"2027-03-01",perf:"제외: 조합 영업·납품",pays:[{step:"계약금",amt:"2,000,000",paid:"2027-01-15"},{step:"잔금",amt:"18,000,000",paid:"2027-03-05"}]}),
 "ppriv/pB":PC([L("전기",20000000,13000000,1)],[{vendor:"한빛전기",proc:"전기",amt:15000000}]),
 "projects/pC":P("P-2612-913","마바빌라 욕실",{stage:"사후관리",contractAmt:10000000,cdate:"2026-12-01",end:"2026-12-20",pays:[{step:"계약금",amt:"5,000,000",paid:"2026-12-01"}]}),
 "ppriv/pC":PC([L("타일",10000000,7000000,1)],[{vendor:"사아타일",proc:"타일",amt:7200000}]),
 "projects/pD":P("P-2701-914","자차주택 주방",{stage:"계약",contractAmt:5000000,cdate:"2027-01-20"}),
 "projects/pE":P("P-2701-915","카타시청 민원실",{stage:"종료",cat:"관공서·학교",mgr:"이봄이",contractAmt:30000000,cdate:"2027-01-25",end:"2027-04-01",pays:[{step:"계약금",amt:"3,000,000",paid:"2027-01-25"}]}),
 "ppriv/pE":PC([L("목공",30000000,24000000,1)],[{vendor:"가나타일",proc:"타일",amt:8000000,apId:"a_none",apNo:"품-27-01-01"},{vendor:"파하목공",proc:"목공",amt:10000000}],{lock:{by:"u_boss",name:"최윤수",at:T0}}),
 "as/as1":{pno:"P-2701-915",site:"카타시청 민원실",content:"문 틀어짐",status:"완료",asCost:300000,d:"2027-05-01",mgr:"이봄이",createdAt:T0,updatedAt:T0},
 "projects/pF":P("P-2701-916","거너상가 도장",{stage:"준공",contractAmt:8000000,cdate:"2027-01-28",end:"2027-02-20"}),
 "approvals/aF":{kind:"기안품의서 (현장)",title:"거너상가 도장 대금",status:"승인",step:3,pno:"P-2701-916",amount:6400000,use:"공사",costCat:"외주비",createdBy:"u_boss",createdAt:T0,updatedAt:T0,history:[],aline:[{role:"결재",name:"최윤수"},{role:"최종결재",name:"신혜현"}]},
 "projects/pG":P("P-2701-917","더러집 견적만",{stage:"견적",quoteAmt:9990000}),
 // 성과금 자료 (대표 전용 칸) — 손익 화면·출력 어디에도 나오면 안 됨
 "fin/settings":{year:2027,bm:28,share:30},"fin/bonuspay":{rules:{},pays:[{id:"b1",docNo:"성-27-01-01",name:"정진혁",amt:7777777,status:"승인",d:"2027-01-31"}],log:[]}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?"통과":"실패",n,v?"":(x===undefined?"":String(typeof x==="string"?x:JSON.stringify(x)).slice(0,500)))};
const N=s=>Number(String(s).replace(/[^0-9-]/g,''))||0;
// 기대값 (화면 코드와 따로 손으로 계산): [id, 계약, 실행, 사후, 받은 돈, 남은 돈, 예상%, 실제%, 기준 밑]
const EXP=[["pF",8000000,0,6400000,0,8000000,null,20.0,true],["pB",20000000,13000000,15000000,20000000,0,35.0,25.0,true],["pC",10000000,7000000,7200000,5000000,5000000,30.0,28.0,false],["pA",10000000,6000000,0,1000000,9000000,40.0,null,false],["pE",30000000,24000000,18000000,3000000,27000000,20.0,40.0,false],["pD",5000000,0,0,0,5000000,null,null,false]];
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 async function world(seedX,vp){const ctx=await b.newContext({timezoneId:'Asia/Seoul',viewport:vp||{width:1280,height:900},isMobile:!!(vp&&vp.width<500),hasTouch:!!(vp&&vp.width<500)});
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r));window.__w=[];new BroadcastChannel("mockdb").onmessage=e=>window.__w.push(String(e&&e.data))},[Object.assign({},SEED,seedX||{}),RULES]);
  const DB=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
  const wmark=()=>seed.evaluate(()=>window.__w.length),wsince=n=>seed.evaluate(n=>window.__w.slice(n),n); // 저장 요청 기록 (모든 화면의 쓰기 경로)
  async function open(who,ms,url){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type()+' '+d.message().slice(0,40));d.dismiss()});
   await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};window.__MOCKEXACT=true;window.print=()=>{window.__printed=(window.__printed||0)+1;const h=document.getElementById('printRoot');window.__printHTML=h&&h.shadowRoot?h.shadowRoot.innerHTML:'';window.dispatchEvent(new Event('beforeprint'))};window.open=()=>{window.__opened=(window.__opened||0)+1;return null};`+MOCK);await p.goto(url||'http://hf.test/');await wait(ms||7000);return p}
  return {ctx,DB,open,wmark,wsince}}
 const navs=p=>p.evaluate(()=>[...document.querySelectorAll('#nav a')].map(a=>a.getAttribute('href')));
 const go=async(p,h,ms)=>{await p.evaluate(x=>{location.hash=x},h);await wait(ms||900)};
 const text=p=>p.evaluate(()=>document.body.innerText);
 const plain=async p=>{if(await p.locator('#view [data-costplain="g"][aria-pressed="false"]').count()){await p.locator('#view [data-costplain="g"]').first().click();await wait(400)}};
 const rows=p=>p.evaluate(()=>[...document.querySelectorAll('.pl-t tbody tr[data-plrow]')].map(tr=>({id:tr.dataset.plrow,low:tr.classList.contains('pl-low'),c:[...tr.cells].map(td=>td.innerText.replace(/\s+/g,' ').trim())})));
 const ids=async p=>(await rows(p)).map(r=>r.id).join();
 const pct=s=>{const m=String(s).match(/^(-?\d+\.\d)%/);return m?Number(m[1]):null};
 const printed=p=>p.evaluate(()=>window.__printHTML||''); // 인쇄가 불린 순간 화면 안 출력 틀(printRoot)에 들어 있던 내용

 // ───────── 1. 대표: 메뉴 · 화면 · 숫자 · 정렬 · 빨간 표시 ─────────
 const W=await world();const A=await W.open('admin',12000);
 for(let i=0;i<20;i++){const d=await W.DB();if(d["acct/u_cja/pcost/pE"]&&d["mine/u_cja/projects/pF"])break;await wait(1500)} // 채진아 사본이 내려갈 때까지 (기존 맞춤)
 let n=await navs(A);ok('1 대표 메뉴에 프로젝트 손익 (재무·경영 묶음 · 캐시플로우 바로 아래)',n.includes('#pl')&&n.indexOf('#pl')===n.indexOf('#cflow')+1,n);
 await go(A,'#pl',1200);ok('1 대표: #pl 이 열림',/프로젝트 손익/.test(await A.locator('#view h1').innerText())&&await A.locator('.pl-t').count()===1);
 let masked=await A.evaluate(()=>document.querySelectorAll('.pl-t .hfro').length);ok('1 원가 금액은 기존 규칙대로 처음에는 코드(HF-RO)로 가려져 있음',masked>0,masked);
 await plain(A);let r=await rows(A);
 ok('1 계약 단계부터 6건 · 견적 단계(pG)는 안 나옴',r.length===6&&!r.some(x=>x.id==='pG'),r.map(x=>x.id));
 ok('1 기본 정렬 = 마진율 낮은 순 (실제 우선, 없으면 예상 · 원가 없음은 맨 아래)',r.map(x=>x.id).join()===EXP.map(e=>e[0]).join(),r.map(x=>x.id));
 {const bad=[];EXP.forEach((e,i)=>{const c=(r[i]||{c:[]}).c;const got=[r[i]&&r[i].id,N(c[2]),N(c[3]),N(String(c[4]).replace(/결재 기준/,'')),N(c[5]),N(c[6]),pct(c[7]),pct(c[8]),r[i]&&r[i].low];if(JSON.stringify(got)!==JSON.stringify(e))bad.push([e,got])});
  ok('1 줄마다 계약·실행 원가·사후 원가·받은 돈·남은 돈·예상·실제 마진율이 손으로 계산한 값과 1원도 다르지 않음',!bad.length,bad)}
 ok('1 28% 밑 줄(pF 20.0% · pB 25.0%)만 빨간 줄 + ‘기준 밑’ 글자 · 딱 28.0%(pC)는 빨강 아님',r[0].low&&r[1].low&&/기준 밑/.test(r[0].c[0])&&/기준 밑/.test(r[1].c[8])&&!r[2].low&&!/기준 밑/.test(r[2].c.join(' ')),[r[0].c[0],r[2].c.join('|')]);
 ok('1 줄은 기준 위여도 예상 마진율만 낮으면(pE 20.0%) 그 칸에 ‘기준 밑’',!r[4].low&&/20\.0%.*기준 밑/.test(r[4].c[7])&&!/기준 밑/.test(r[4].c[8]),r[4].c);
 ok('1 원가 없는 줄(pD)은 맨 아래 · ‘원가 없음’ 표시 · 마진율 —',r[5].id==='pD'&&/원가 없음/.test(r[5].c[0])&&r[5].c[7]==='—'&&r[5].c[8]==='—',r[5].c);
 ok('1 원가 관리가 비어 결재로 잡힌 사후 원가(pF)는 ‘결재 기준’ 표시 · A/S 가 있는 줄(pE)은 정산 요약 마진율(39.0%)도 같이',/결재 기준/.test(r[0].c[4])&&/A\/S 넣으면 39\.0%/.test(r[4].c[8]),[r[0].c[4],r[4].c[8]]);
 {const col=await A.evaluate(()=>{const tr=document.querySelector('.pl-t tr.pl-low'),td=tr.cells[8],cs=getComputedStyle(td),o=getComputedStyle(document.querySelector('.pl-t tbody tr:not(.pl-low)').cells[2]);return [cs.backgroundColor,cs.color,o.backgroundColor]});
  ok('1 빨간 줄: 바탕·글자 색이 보통 줄과 다름',col[0]!==col[2]&&/rgb\((19\d|2\d\d), ?\d{1,2}, ?\d{1,2}\)|rgb\(255, 138, 138\)/.test(col[1]),col)}
 // 요약 카드 · 합계
 {const cards=await A.evaluate(()=>[...document.querySelectorAll('.pl-card')].map(c=>({t:c.querySelector('span').innerText,v:c.querySelector('strong').innerText,low:c.classList.contains('low')})));
  ok('1 요약 카드: 6건 · 계약 합계 83,000,000원 · 예상 평균 28.6%(가중) · 실제 평균 31.5%(가중) · 기준 밑 2건(빨강)',cards.length===5&&cards[0].v==='6건'&&N(cards[1].v)===83000000&&cards[2].v==='28.6%'&&cards[3].v==='31.5%'&&cards[4].v==='2건'&&cards[4].low&&/28% 밑/.test(cards[4].t),cards);
  const ft=await A.evaluate(()=>[...document.querySelector('.pl-t tfoot tr').cells].map(td=>td.innerText.trim()));
  ok('1 합계 줄: 계약 8,300만 · 실행 5,000만 · 사후 4,660만 · 받은 돈 2,900만 · 남은 돈 5,400만',N(ft[2])===83000000&&N(ft[3])===50000000&&N(ft[4])===46600000&&N(ft[5])===29000000&&N(ft[6])===54000000,ft)}
 ok('1 부가세 기준·마진율 식을 화면에 한 줄로 밝힘',/금액은 모두 부가세 포함/.test(await text(A))&&/\(계약 금액 − 원가\) ÷ 계약 금액/.test(await text(A)));

 // ───────── 2. 같은 숫자인지: 정산 요약 함수·원가 관리 저장값·프로젝트 창 화면과 대조 ─────────
 {const cmp=await A.evaluate(()=>{const T=window.__hfT,P=T.pl().rows,bad=[];P.forEach(x=>{const s=T.stl(x.id),c=T.pc(x.id)||{},est=(c.lines||[]).reduce((t,l)=>t+(Number(l.est)||0),0),po=(c.post||[]).reduce((t,q)=>t+(Number(q.amt)||0),0);
    if(!s||s.ca!==x.ca||s.post!==x.post||s.got!==x.got||s.left!==x.left||est!==x.est||po!==x.po)bad.push([x.id,x,s,est,po])});return {n:P.length,bad}});
  ok('2 모든 줄: 정산 요약 계산(stlData)·원가 관리 저장값(pcGet)과 계약·사후 원가·받은 돈·남은 돈·실행 원가가 같음',cmp.n===6&&!cmp.bad.length,cmp.bad)}
 for(const [id,eT,aT,gotW,postW,leftW] of [["pB","35%","25%",20000000,15000000,0],["pC","30%","28%",5000000,7200000,5000000]]){
  await A.locator('.pl-t tr[data-plrow="'+id+'"] .pl-name').click();await wait(1800);
  const opened=await A.evaluate(()=>{const s=window.__hfT.sheet();return (s?s.col+'|'+s.id:'')+'|'+document.querySelectorAll('#veil .pcbox').length});
  ok('2 '+id+' 줄을 누르면 그 프로젝트의 원가 관리 칸이 화면 안 창으로 열림',opened==='projects|'+id+'|1',opened);
  if(await A.locator('#veil .pcbox [data-costplain][aria-pressed="false"]').count()){await A.locator('#veil .pcbox [data-costplain]').first().click();await wait(500)}
  const scr=await A.evaluate(()=>{const tx=e=>(e.textContent||'').replace(/\s+/g,' ').trim(),rowsOf=sel=>[...document.querySelectorAll(sel)].map(tr=>[...tr.cells].map(tx));const pc=rowsOf('#veil .pcbox table:first-of-type tr'),all=rowsOf('#veil tr');
    const f=k=>{const r=all.filter(c=>c.length===2&&c[0].startsWith(k));return r.length?r[r.length-1][1]:''};return {pc:pc.slice(0,3),got:f('받은 돈'),left:f('안 받은 돈'),post:f('사후 원가'),ca:f('계약 금액')}});
  const row=(await A.evaluate(i=>window.__hfT.pl().rows.find(x=>x.id===i),id));
  ok('2 '+id+' 원가 관리 화면의 예정 마진 '+eT+' · 실제 마진 '+aT+' = 손익 표의 예상·실제 마진율',new RegExp('예정 마진.*· '+eT.replace('%','(\\.0)?%')).test(scr.pc[1].join(' '))&&new RegExp('실제 마진.*· '+aT.replace('%','(\\.0)?%')).test(scr.pc[2].join(' '))&&row.eR===parseFloat(eT)&&row.aR===parseFloat(aT),scr.pc);
  ok('2 '+id+' 현장 정산 요약 화면의 계약 금액·받은 돈·안 받은 돈·사후 원가 = 손익 표',N(scr.ca)===row.ca&&N(scr.got)===gotW&&row.got===gotW&&N(scr.post)===postW&&row.post===postW&&(leftW?N(scr.left)===leftW:true)&&row.left===leftW,scr);
  await A.evaluate(()=>window.__hfT.closeSheet());await wait(400)}

 // ───────── 3. 정렬 · 필터 ─────────
 await A.locator('.pl-t [data-plsort="ca"]').click();await wait(400);ok('3 열 머리(계약 금액)를 누르면 작은 순 (같은 금액은 프로젝트 번호 순)',await ids(A)==='pD,pF,pC,pA,pB,pE',await ids(A));
 await A.locator('.pl-t [data-plsort="ca"]').click();await wait(400);ok('3 한 번 더 누르면 큰 순 · 정렬 방향을 화면 글자(▼)와 aria-sort 로 알림',await ids(A)==='pE,pB,pC,pA,pF,pD'&&await A.locator('.pl-t th[aria-sort="descending"]').count()===1&&/▼/.test(await A.locator('.pl-t th[aria-sort="descending"]').innerText()),await ids(A));
 await A.locator('.pl-t [data-plsort="aR"]').click();await wait(400);ok('3 실제 마진율 순: 값 없는 줄(pA·pD)은 늘 맨 아래',await ids(A)==='pF,pB,pC,pE,pA,pD',await ids(A));
 await A.locator('[data-plsort="reset"]').click();await wait(400);ok('3 ‘마진율 낮은 순으로’ 단추로 처음 정렬로',await ids(A)===EXP.map(e=>e[0]).join(),await ids(A));
 await A.locator('[data-plf="year"]').selectOption('2026');await wait(400);ok('3 연도 2026 → 계약일 2026 인 pC 만 · 카드도 1건',await ids(A)==='pC'&&/1건/.test(await A.locator('.pl-card strong').first().innerText()),await ids(A));
 await A.locator('[data-plf="year"]').selectOption('');await A.locator('[data-plf="part"]').selectOption('gov');await wait(400);ok('3 파트 관공서 → pB·pE',await ids(A)==='pB,pE',await ids(A));
 await A.locator('[data-plf="part"]').selectOption('res');await A.locator('[data-plf="stg"]').selectOption('live');await wait(400);ok('3 파트 주거 + 단계 진행 중 → pA·pD',await ids(A)==='pA,pD',await ids(A));
 await A.locator('[data-plf="stg"]').selectOption('done');await wait(400);ok('3 파트 주거 + 준공 이후 → pF·pC',await ids(A)==='pF,pC',await ids(A));
 await A.locator('[data-plf="part"]').selectOption('');await A.locator('[data-plf="stg"]').selectOption('all');await wait(400);

 // ───────── 4. 출력·PDF (화면 안 출력 방식 · 새 창 없음) · 저장 요청 0 ─────────
 let m0=await W.wmark();await A.locator('[data-plprint]').click();await wait(900);
 {const h=await printed(A),st=await A.evaluate(()=>[window.__printed||0,window.__opened||0]);
  ok('4 출력·PDF: 화면 안 출력 틀(printRoot)에 6줄 · 인쇄 호출 1번 · 새 창 0',st[0]===1&&st[1]===0&&(h.match(/<tr class=/g)||[]).length===6&&/P-2701-916/.test(h)&&/\[기준 밑\]/.test(h)&&/20\.0% \(기준 밑\)/.test(h)&&/\[원가 없음\]/.test(h)&&/6,400,000/.test(h),[st,h.length]);
  ok('4 출력물에 성과금·성과급·perf 글자와 값 없음',!/성과|perf|bonus|7,777,777|7777777|순수 인테리어|제외:/i.test(h))}
 await go(A,'#home',600);await go(A,'#pl',900);await wait(1500);
 {const w=(await W.wsince(m0)).filter(p=>!/^knock\//.test(p));ok('4 대표가 손익 화면을 열고·출력해도 저장 요청은 열람 기록(knock) 말고 0',!w.length,w)}
 ok('4 대표 화면에도 성과금 글자·값 없음 (손익 화면 안)',!/성과|7,777,777|순수 인테리어|제외:/.test(await A.locator('#view').innerText()));

 // ───────── 5. 채진아(전체 담당): 메뉴·화면·같은 숫자 · 성과금 없음 · 저장 0 ─────────
 const C=await W.open('cja',9000);n=await navs(C);
 ok('5 채진아 메뉴에 프로젝트 손익 · 성과금 메뉴는 그대로 없음',n.includes('#pl')&&!n.includes('#bonus'),n);
 m0=await W.wmark();await go(C,'#pl',1500);await plain(C);const rc=await rows(C);
 ok('5 채진아: #pl 이 열리고 6줄',rc.length===6&&/프로젝트 손익/.test(await C.locator('#view h1').innerText()),rc.length);
 await go(A,'#pl',600);await plain(A);r=await rows(A);
 ok('5 채진아 화면의 모든 줄·모든 칸이 대표 화면과 글자까지 같음 (기존 사본 mine·pcost 로 같은 함수가 셈)',JSON.stringify(rc)===JSON.stringify(r),[rc.map(x=>x.c.join('|')).join(' / ').slice(0,300)]);
 {const t=await C.locator('#view').innerText();ok('5 채진아 손익 화면에 성과금·성과급·실적 구분 글자와 값 없음',!/성과|perf|7,777,777|7777777|순수 인테리어|제외:/i.test(t)&&!/성과|perf|7777777|순수 인테리어/i.test(await C.evaluate(()=>window.__hfT.plView())))}
 await C.locator('[data-plprint]').click();await wait(800);{const h=await printed(C);ok('5 채진아 출력물: 6줄 · 성과금 글자·값 없음 · 새 창 0',(h.match(/<tr class=/g)||[]).length===6&&!/성과|perf|bonus|7,777,777|순수 인테리어|제외:/i.test(h)&&(await C.evaluate(()=>window.__opened||0))===0)}
 await C.locator('.pl-t tr[data-plrow="pE"] .pl-name').click();await wait(1800);
 ok('5 채진아: 줄을 누르면 원가 관리 칸이 열림',(await C.evaluate(()=>{const s=window.__hfT.sheet();return (s?s.col+'|'+s.id:'')+'|'+document.querySelectorAll('#veil .pcbox').length}))==='projects|pE|1');
 await C.evaluate(()=>window.__hfT.closeSheet());await wait(1500);
 {const w=(await W.wsince(m0)).filter(p=>!/^knock\//.test(p)&&!/^mine\/u_cja\/idx\/sync$/.test(p)),den=await C.evaluate(()=>window.__mockDenied);const d=await W.DB();
  ok('5 채진아가 손익 화면을 보는 동안 저장 요청 0 (열람 기록만) · 거절된 요청 0',!w.length&&!den.length,[w,den]);
  const keys=Object.keys(d).filter(k=>/(^|\/)pl($|\/)|profit|손익/i.test(k));ok('5 손익용 새 저장 칸·새 사본 없음 (기존 사본만 씀)',!keys.length,keys);
  const mineP=Object.keys(d).filter(k=>/^acct\/u_cja\/pcost\//.test(k)).map(k=>JSON.stringify(d[k])).join('');ok('5 채진아 원가 사본(acct/u_cja/pcost)에 perf·성과 글자 없음',mineP.length>100&&!/perf|성과|bonus/i.test(mineP))}

 // ───────── 6. 정진혁·이봄이(실무 팀): 메뉴 없음 · 주소 직접 입력 막힘 · 검색 안 됨 · 저장 칸 거절 ─────────
 for(const who of ['jjh','bom']){const nm=who==='jjh'?'정진혁':'이봄이';const J=await W.open(who,8000,'http://hf.test/#pl');
  n=await navs(J);ok('6 '+nm+': 메뉴에 프로젝트 손익 없음',!n.includes('#pl'),n);
  const st=await J.evaluate(()=>({h1:(document.querySelector('#view h1')||{}).innerText||'',t:document.querySelectorAll('.pl-t,.pl-card').length,ok:window.__hfT.plOk(),pl:window.__hfT.pl(),v:window.__hfT.plView()}));
  ok('6 '+nm+': 주소에 #pl 을 직접 넣어도 손익 화면이 안 열림 (홈으로) · 표·카드 0',!/손익/.test(st.h1)&&st.t===0&&st.ok===false&&st.pl===null,st.h1);
  ok('6 '+nm+': 화면 함수를 억지로 불러도 안내 글만 (숫자 없음)',/대표·채진아 차장만/.test(st.v)&&!/\d{1,3}(,\d{3})+/.test(st.v)&&!/pl-t/.test(st.v),st.v.slice(0,200));
  await go(J,'#home',600);await go(J,'#pl',900);ok('6 '+nm+': 홈에서 #pl 로 옮겨도 안 열림',(await J.evaluate(()=>document.querySelectorAll('.pl-t,.pl-card').length))===0&&!/프로젝트 손익/.test(await text(J)));
  if(await J.locator('#gs').count()){await J.locator('#gs').fill('손익');await wait(700);ok('6 '+nm+': 통합 검색에 ‘손익’ 을 쳐도 손익 메뉴가 안 나옴',(await J.evaluate(()=>document.querySelectorAll('a[href="#pl"]').length))===0&&!/프로젝트 손익/.test(await text(J)));await J.locator('#gs').fill('')}
  const den=await J.evaluate(async()=>{const db=await window.claude.use("db"),out=[];for(const p of ["ppriv","acct/u_cja/pcost","acct/u_boss/pcost","mine/u_cja/projects","fin"]){try{await db.collection(p).get();out.push(p+":읽힘")}catch(e){out.push(p+":거절")}}try{await db.doc("ppriv/pA").set({x:1});out.push("쓰기:됨")}catch(e){out.push("쓰기:거절")}return out});
  ok('6 '+nm+': 원가 원본(ppriv)·채진아 원가 사본·채진아 프로젝트 사본·재무 칸 읽기와 원가 쓰기 모두 거절',den.every(x=>/거절$/.test(x)),den);
  await J.close()}
 await C.close();

 // ───────── 7. 휴대폰 390px ─────────
 {const M=await world(null,{width:390,height:800});const P=await M.open('admin',9000,'http://hf.test/#pl');await wait(800);
  const g=await P.evaluate(()=>{const de=document.documentElement,bx=document.querySelector('.pl-box'),td=document.querySelector('.pl-t tbody td'),cards=[...document.querySelectorAll('.pl-card')].map(c=>c.getBoundingClientRect());
   return {doc:de.scrollWidth,win:innerWidth,body:document.body.scrollWidth,box:[bx.scrollWidth,bx.clientWidth],pos:getComputedStyle(td).position,cardR:Math.max(...cards.map(c=>c.right)),sel:[...document.querySelectorAll('.pl-f select')].map(s=>s.getBoundingClientRect().height)}});
  ok('7 390px: 페이지 가로 넘침 없음',g.doc<=g.win&&g.body<=g.win,g);
  ok('7 390px: 표는 상자 안에서만 옆으로 밀림 · 프로젝트 열 고정(sticky)',g.box[0]>g.box[1]&&g.pos==='sticky',g);
  ok('7 390px: 요약 카드가 화면 안 · 고르는 칸 높이 40px 이상',g.cardR<=g.win&&g.sel.every(h=>h>=40),g);
  await P.evaluate(()=>{document.querySelector('.pl-box').scrollLeft=400});await wait(300);
  const s2=await P.evaluate(()=>{const td=document.querySelector('.pl-t tbody td').getBoundingClientRect(),bx=document.querySelector('.pl-box').getBoundingClientRect();return [Math.round(td.left-bx.left),document.documentElement.scrollWidth<=innerWidth]});
  ok('7 390px: 표를 옆으로 밀어도 프로젝트 열은 왼쪽에 그대로',Math.abs(s2[0])<=2&&s2[1],s2);await M.ctx.close()}

 // ───────── 8. 기준 마진율: 목표 관리에 2027 마진율 목표가 있으면 그 값 ─────────
 ok('8 목표가 없으면 기준 28',(await A.evaluate(()=>window.__hfT.plMin()))===28);
 {const G=await world({"config/goal":{year:2027,margin:30,months:[]}});const P=await G.open('admin',9000,'http://hf.test/#pl');await wait(600);const rr=await rows(P);
  ok('8 2027 마진율 목표가 30% 로 들어와 있으면 기준 30 → 딱 28.0% 인 pC 도 빨간 줄 · 카드 ‘기준 30% 밑 3건’',(await P.evaluate(()=>window.__hfT.plMin()))===30&&rr.find(x=>x.id==='pC').low&&/30% 밑/.test(await P.locator('.pl-card.low span').last().innerText())&&/3건/.test(await P.locator('.pl-card.low strong').last().innerText()),rr.filter(x=>x.low).map(x=>x.id));await G.ctx.close()}

 // ───────── 9. 코드 점검 ─────────
 ok('9 화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 {const i0=HTML.indexOf('// ===== 프로젝트 손익 한 장 (v0.99-56 D'),i1=HTML.indexOf('\ndocument.addEventListener("change",e=>{const el=e.target;if(!el||!el.dataset||!el.dataset.plf'),blk=HTML.slice(i0,HTML.indexOf('\n',i1+2)),code=blk.split('\n').filter(l=>!/^\s*\/\//.test(l)).join('\n');
  ok('9 손익 코드 묶음: alert/confirm/prompt/window.open/iframe 0 · 저장(.set/.update/.add/.delete) 0 · 성과금(perf·bonus·성과) 글자 0',i0>0&&i1>i0&&blk.length>5000&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe/.test(code)&&!/\.(set|update|add|delete)\(/.test(code)&&!/perf|bonus|성과|BP\(/i.test(code),blk.length+'자');
  ok('9 주소·메뉴 판정은 기존 canFcost() 한 곳 (대표·전체 담당) — 새 권한 규칙 없음',/const plOk=\(\)=>canFcost\(\);/.test(blk)&&/if\(h==="pl"&&plOk\(\)\)return h;/.test(HTML)&&/const canFcost=\(\)=>me\.admin\|\|\(mode==="shared"&&isCoBoss\(myStaff\(\)\)\);/.test(HTML))}
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
