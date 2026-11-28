// 대표 현황판 시험 (v0.99-53 E · 다음 지시 2026-11-28 v11 E): node intranet/tools/test/ceo_board_test.js [index.html]
// 대표에게만 메뉴·카드·첫 화면 / 직원 3명(실제 로그인·미리 보기)에게 안 보임 · 저장 칸(acct/_ceo) 읽기·쓰기 거절 / 파트별 숫자(늦은 공정·결재 대기·미수금·입금 예정·사진·메모)
// 8시·18시 스냅숏 규칙(기준 시각 계산 · 새 스냅숏은 그대로 · 낡은 스냅숏은 다시 셈 · 손으로 다시 세기) / A·B 요약 연결 / 390px 세로 쌓임·가로 넘침 없음 / 자료 변경 소식 합침
const {chromium}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
// 날짜는 시험을 돌리는 날(한국 시간) 기준으로 만듦
const NOW=Date.now(),iso=ms=>new Date(ms).toISOString(),kd=ms=>new Date(ms+9*36e5).toISOString().slice(0,10),T=kd(NOW),D=n=>kd(NOW+n*864e5),T0="2026-11-01T00:00:00Z",NOWI=iso(NOW);
// 기준 시각(오늘 08:00·18:00, 그 전이면 어제 18:00 · 한국 시간) — 화면 코드와 따로 계산해 맞춰 봄
const slotAt=ms=>{const k=new Date(ms+9*36e5),h=k.getUTCHours();let d=Date.UTC(k.getUTCFullYear(),k.getUTCMonth(),k.getUTCDate()),hh;if(h>=18)hh=18;else if(h>=8)hh=8;else{hh=18;d-=864e5}return iso(d+hh*36e5-9*36e5)};
const line=[{role:"검토",name:"채진아"},{role:"결재",name:"최윤수"},{role:"최종결재",name:"신혜현"}];
const ap=(by,title,x)=>Object.assign({kind:"기안품의서 (현장)",title,status:"결재 진행",step:1,pno:"본사",amount:120000,createdBy:by,createdAt:iso(NOW-6*864e5),updatedAt:iso(NOW-6*864e5),history:[],aline:line},x||{});
const pg=(proc,pct,i)=>({id:"pg"+i,kind:"확인",proc,pct,at:iso(NOW-864e5),by:"u_jjh",byName:"정진혁"});
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 // 주거: p1 시공(철거 끝 · 목공 3일 늦음 · 오늘 타일) · p2 견적 · p3 준공(지난 공정이 있어도 늦음 아님) · p8 시공(지난 공정 모두 100%)
 "projects/p1":{no:"P-2611-901",title:"한빛아파트 욕실",custName:"홍길동",stage:"시공",mgr:"정진혁",cat:"주거",contractAmt:"33000000",inq:"2026-11-01",files:[],
   sched:[{proc:"철거",start:D(-10),end:D(-8)},{proc:"목공",start:D(-5),end:D(-3)},{proc:"타일",start:D(-1),end:D(1)}],progLog:[pg("철거",100,1)],
   pays:[{step:"계약금",amt:"3300000",due:D(-20),paid:D(-20)},{step:"중도금",amt:"13200000",due:D(5)},{step:"잔금",amt:"3300000",due:D(-2)}],
   plog:[{at:NOWI,type:"메모",text:"오늘 타일 자재 들어옴",name:"정진혁"}],photos:[{id:"ph1",fid:"as_x1",name:"a.jpg",type:"image/jpeg",d:T,at:NOWI,by:"u_jjh",byName:"정진혁",from:"현장 일지"}],updatedAt:NOWI,updatedBy:"u_jjh",__at:NOWI},
 "projects/p2":{no:"P-2611-902",title:"푸른빌라 주방",custName:"김영희",stage:"견적",mgr:"이봄이",cat:"주거",inq:"2026-11-02",files:[],updatedAt:T0,__at:T0},
 "projects/p3":{no:"P-2609-903",title:"지난집 전체",custName:"박지난",stage:"준공",mgr:"정진혁",cat:"주거",inq:"2026-09-01",files:[],sched:[{proc:"도배",start:D(-30),end:D(-28)}],updatedAt:T0,__at:T0},
 "projects/p8":{no:"P-2611-908",title:"끝난공정 거실",custName:"최끝남",stage:"시공",mgr:"이봄이",cat:"주거",inq:"2026-11-03",files:[],sched:[{proc:"도장",start:D(-6),end:D(-4)}],progLog:[pg("도장",100,8)],updatedAt:T0,__at:T0},
 // 관공서: p4 시공(전기 2일 늦음 · 진행률 기록 없음) · p5 계약(공정이 앞날)
 "projects/p4":{no:"P-2611-904",title:"교문초등학교 도서관",custName:"교문초",stage:"시공",mgr:"이봄이",cat:"관공서·학교",contractAmt:"110000000",inq:"2026-10-20",files:[],sched:[{proc:"전기",start:D(-4),end:D(-2)}],pays:[{step:"계약금",amt:"11000000",due:D(10)}],updatedAt:T0,__at:T0},
 "projects/p5":{no:"P-2611-905",title:"시청 민원실",custName:"시청",stage:"계약",mgr:"정진혁",cat:"관공서·학교",contractAmt:"55000000",inq:"2026-11-05",files:[],sched:[{proc:"철거",start:D(7),end:D(9)}],pays:[{step:"계약금",amt:"5500000",due:D(45)}],updatedAt:T0,__at:T0},
 // 그 밖·구분 없음
 "projects/p6":{no:"P-2611-906",title:"상가 공사",custName:"이상가",stage:"상담",mgr:"정진혁",cat:"일반공사",inq:"2026-11-06",files:[],updatedAt:T0,__at:T0},
 "projects/p7":{no:"P-2611-907",title:"이름없는 문의",custName:"무명",stage:"문의",mgr:"",cat:"",inq:"2026-11-07",files:[],updatedAt:T0,__at:T0},
 "sites/s1":{pno:"P-2611-901",name:"한빛아파트 욕실",mgr:"정진혁",customer:"홍길동",status:"공사 중",logs:[{d:T,proc:"타일",people:2,text:"벽 타일 붙임"}],files:[],updatedAt:T0,__at:T0},
 "quotes/q1":{qno:"P-2611-902-1",pno:"P-2611-902",name:"김영희",staff:"정진혁",status:"본견적 진행",d:T,amount:110000,items:[],createdBy:"u_jjh",createdAt:NOWI,updatedAt:NOWI},
 // 결재: a1 주거·대표 차례 3일째(미룸) · a2 관공서·대표 차례 1시간째 · a3 본사·채진아 차례(대표 차례 아님) · a4 본사·신혜현 칸 6일째(미룸) · a5 승인 끝
 "approvals/a1":ap("u_jjh","한빛 타일 대금",{pno:"P-2611-901",history:[{at:iso(NOW-3*864e5),by:"u_cja",act:"검토"}]}),
 "approvals/a2":ap("u_cja","교문초 전기 자재",{pno:"P-2611-904",createdAt:NOWI,updatedAt:NOWI,history:[{at:iso(NOW-36e5),by:"u_cja",act:"검토"}]}),
 "approvals/a3":ap("u_bom","사무용품 구입",{step:0,status:"결재 대기"}),
 "approvals/a4":ap("u_cja","법인카드 대금",{step:2}),
 "approvals/a5":ap("u_jjh","끝난 결재",{status:"승인",step:3}),
 // 미수금 표 (캐시플로우 엑셀 그날 시트): 한빛아파트 → p1(주거) · 교문초등학교 → p4(관공서) · 어느상사 → 프로젝트 못 찾음
 ["fin/cfsheet-"+T.slice(0,7)]:{at:NOWI,days:{[T]:{sheet:"시험",file:"cash flow 시험.xlsx",ar:{rows:[{r:1,mon:"11월",name:"한빛아파트 홍길동",tot:33000000,left:5500000},{r:2,mon:"11월",name:"교문초등학교",tot:110000000,left:22000000},{r:3,mon:"10월",name:"어느상사",tot:2200000,left:1100000},{r:4,mon:"10월",name:"다받은곳",tot:1000000,left:0}]}}}},
 // 개선 요청함: 정진혁 접수 1 · 끝남 1 / 이봄이 형 확인 필요 1
 "feedback/f1":{body:"견적 화면이 느려요",kind:"불편해요",status:"접수",createdBy:"u_jjh",createdAt:iso(NOW-864e5)},"feedback/f2":{body:"버튼 글자 키워 주세요",kind:"불편해요",status:"처리완료",createdBy:"u_jjh",createdAt:iso(NOW-5*864e5)},
 "feedback/f3":{body:"권한을 바꿔 주세요",kind:"불편해요",status:"형 확인 필요",createdBy:"u_bom",createdAt:iso(NOW-2*864e5)},
 // 자료 변경 소식 (기존 '변경 확인' 탭)
 ["acct/_drv/chg/d"+T.replace(/-/g,"")]:{at:NOWI,items:[{k:"f1@"+NOWI,id:"f1",t:"교문초 실행내역 시험파일.xlsx",m:"x",path:"현장관리 › 교문초",pid:"par1",anc:[],drv:"현장관리",grp:"현장",who:"birdjack555",ts:NOWI,kind:"mod"}]},
 "acct/_drv/chgst/s":{at:NOWI,by:"예약",n:1,last:NOWI}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const NAME={jjh:"정진혁",bom:"이봄이",cja:"채진아"},SID={jjh:"st_jjh",bom:"st_bom",cja:"st_cja"};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?"통과":"실패",n,v?"":(x===undefined?"":String(typeof x==="string"?x:JSON.stringify(x)).slice(0,400)))};
const SNAP="acct/_ceo/snap/cur";
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 async function world(seedX,vp){const ctx=await b.newContext({timezoneId:'Asia/Seoul',viewport:vp||{width:1280,height:900},isMobile:!!(vp&&vp.width<500),hasTouch:!!(vp&&vp.width<500)});
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[Object.assign({},SEED,seedX||{}),RULES]);
  const DB=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));const LS=k=>seed.evaluate(k=>localStorage.getItem(k),k);
  async function open(who,ms,pre,url){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type()+' '+d.message().slice(0,40));d.dismiss()});
   await p.addInitScript(`window.__CEOFIRST=true;window.__MOCKUSER=${JSON.stringify(USERS[who])};window.__MOCKEXACT=true;${pre||''}`+MOCK);await p.goto(url||'http://hf.test/');await wait(ms||7000);return p}
  return {ctx,DB,LS,open}}
 const navs=p=>p.evaluate(()=>[...document.querySelectorAll('#nav a')].map(a=>a.getAttribute('href')));
 const go=async(p,h,ms)=>{await p.evaluate(x=>{location.hash=x},h);await wait(ms||800)};
 const text=p=>p.evaluate(()=>document.body.innerText);const hash=p=>p.evaluate(()=>location.hash);
 const tile=(p,part,key)=>p.evaluate(([part,key])=>{const e=document.querySelector(`[data-ceopart="${part}"] [data-ceolist="${part}|${key}"] b`);return e?e.innerText.trim():null},[part,key]);

 // ───────── 1. 기준 시각 계산 (화면 코드) ─────────
 const W=await world();const A=await W.open('admin',15000);
 {const at=(y,m,d,h,mi)=>Date.UTC(y,m-1,d,h-9,mi);const cases=[[at(2026,11,28,7,59),"2026-11-27T09:00:00.000Z"],[at(2026,11,28,8,0),"2026-11-27T23:00:00.000Z"],[at(2026,11,28,17,59),"2026-11-27T23:00:00.000Z"],[at(2026,11,28,18,0),"2026-11-28T09:00:00.000Z"],[at(2026,11,29,0,10),"2026-11-28T09:00:00.000Z"],[at(2026,12,1,3,0),"2026-11-30T09:00:00.000Z"]];
  const got=await A.evaluate(c=>c.map(x=>window.__hfT.ceoSlotAt(x[0])),cases);ok('1 기준 시각: 07:59→어제 18시 · 08:00→오늘 8시 · 17:59→8시 · 18:00→18시 · 00:10·월초 새벽→전날 18시',got.every((g,i)=>g===cases[i][1]),got);
  const st=await A.evaluate(([a,b2])=>[window.__hfT.ceoStale(null),window.__hfT.ceoStale({at:"2026-11-27T22:59:59.000Z"},a),window.__hfT.ceoStale({at:"2026-11-27T23:00:01.000Z"},a),window.__hfT.ceoStale({at:"2026-11-27T23:00:01.000Z"},b2)],[at(2026,11,28,9,0),at(2026,11,28,18,5)]);
  ok('1 낡음 판정: 없음=낡음 · 8시 전에 센 것=낡음 · 8시 뒤에 센 것=그대로 · 18시가 지나면 다시 낡음',st[0]===true&&st[1]===true&&st[2]===false&&st[3]===true,st)}

 // ───────── 2. 대표: 첫 화면 · 메뉴 · 자동 집계·저장 ─────────
 ok('2 대표가 주소에 메뉴 없이 들어오면 현황판이 첫 화면',await hash(A)==='#ceo',await hash(A));
 let n=await navs(A);ok('2 대표 메뉴 맨 앞에 대표 현황판 · 기존 홈·자료 변경 소식 메뉴도 그대로',n[0]==='#ceo'&&n.includes('#home')&&n.includes('#drvchg'),n.slice(0,4));
 let db=await W.DB();let snap=db[SNAP];
 ok('2 처음 열면 세어서 대표 전용 칸(acct/_ceo/snap/cur)에 저장',!!snap&&snap.by==='auto'&&snap.slot===slotAt(Date.parse(snap.at))&&snap.day===T,snap&&[snap.by,snap.slot,snap.at,snap.day]);
 ok('2 저장 칸은 acct/_ceo 한 곳뿐 (직원 사본 칸에 현황판 자료 없음)',Object.keys(db).filter(k=>/ceo/i.test(k)).join()===SNAP,Object.keys(db).filter(k=>/ceo/i.test(k)));
 ok('2 스냅숏에 성과금·원가 낱말 없음',!/성과금|성과급|bonus|estCost|원가/.test(JSON.stringify(snap)));
 let t=await text(A);ok('2 화면에 ‘○월 ○일 08:00/18:00 기준’ 표시',/\d+월 \d+일 (08|18):00 기준/.test(t),t.slice(0,200));
 ok('2 파트 카드 2개 (주거·관공서)',await A.locator('.ceo-part').count()===2&&/주거 파트/.test(t)&&/관공서 파트/.test(t));

 // ───────── 3. 파트별 숫자 ─────────
 const P=snap.parts;const num=o=>[o.active.n,o.today.n,o.late.n,o.ap.n,o.ap.slow,o.recv.sum,o.recv.n,o.due.sum,o.due.n,o.due.over,o.tl.photo,o.tl.memo];
 ok('3 주거: 진행 3 · 오늘 공정 1 · 늦음 1 · 결재 1(미룸 1) · 미수금 550만(1줄) · 입금 예정 1,320만(1건) · 기한 지남 1 · 사진 1 · 메모 2',JSON.stringify(num(P.res))===JSON.stringify([3,1,1,1,1,5500000,1,13200000,1,1,1,2]),num(P.res));
 ok('3 관공서: 진행 2 · 오늘 공정 0 · 늦음 1 · 결재 1(미룸 0) · 미수금 2,200만 · 입금 예정 1,100만(45일 뒤 것은 뺌)',JSON.stringify(num(P.gov))===JSON.stringify([2,0,1,1,0,22000000,1,11000000,1,0,0,0]),num(P.gov));
 ok('3 그 밖·구분 없음: 진행 2(일반공사·빈칸) · 본사 결재 1(미룸 1 · 채진아 차례 것은 안 셈) · 미연결 미수금 110만',JSON.stringify(num(P.etc))===JSON.stringify([2,0,0,1,1,1100000,1,0,0,0,0,0]),num(P.etc));
 ok('3 늦은 공정 내용: 주거=목공(철거 100%·오늘 타일은 아님) · 관공서=전기 · 준공·100% 현장은 빠짐',P.res.late.L[0].id==='p1'&&/목공/.test(P.res.late.L[0].s)&&!/철거|타일/.test(P.res.late.L[0].s)&&/3일 지남/.test(P.res.late.L[0].s)&&P.gov.late.L[0].id==='p4'&&/전기/.test(P.gov.late.L[0].s),[P.res.late.L,P.gov.late.L]);
 ok('3 화면 숫자 = 스냅숏',await tile(A,'res','active')==='3건'&&await tile(A,'res','late')==='1곳'&&await tile(A,'res','ap')==='1건'&&await tile(A,'res','recv')==='550만원'&&await tile(A,'res','due')==='1,320만원'&&await tile(A,'gov','recv')==='2,200만원'&&await tile(A,'gov','active')==='2건',[await tile(A,'res','active'),await tile(A,'res','recv'),await tile(A,'res','due'),await tile(A,'gov','recv')]);
 ok('3 늦은 공정 칸은 빨간색',await A.evaluate(()=>document.querySelector('[data-ceolist="res|late"]').classList.contains('bad')&&getComputedStyle(document.querySelector('[data-ceolist="res|late"] b')).color!==getComputedStyle(document.querySelector('[data-ceolist="res|active"] b')).color));
 // (v0.99-54) A 확정본·B 타임라인이 인트라넷에 들어온 뒤: 확정본 요약은 0건, 사진·메모는 B 타임라인(진짜 v11TimelineToday)에서 옴 — 숫자는 기존 자료로 셀 때와 같음
 ok('3 확정본(A · 올린 것 없음)은 0건 · 사진·메모는 B 타임라인에서 (사진 1 · 메모 2) · 덜 센 표시 없음',await tile(A,'res','spec')==='0건'&&snap.tlSrc==='B'&&snap.specReady===true&&snap.partial===undefined&&snap.parts.res.spec.n===0&&await tile(A,'res','tl')==='사진 1 · 메모 2',[await tile(A,'res','spec'),await tile(A,'res','tl'),snap.tlSrc,snap.specReady,snap.partial]);
 {const tl=await A.evaluate(()=>window.v11TimelineToday().map(e=>[e.pid,e.kind,e.n||0,!!e.t,e.who]));
  ok('3 진짜 B 함수 모양: p1 메모(정진혁)·현장 일지(시각 없음)·사진 1장 — 그 밖의 프로젝트는 없음',JSON.stringify(tl.slice().sort())===JSON.stringify([["p1","메모",0,true,"정진혁"],["p1","사진",1,true,"정진혁"],["p1","일지",0,false,""]].sort()),tl);
  t=await A.locator('[data-ceopart="res"] .ceo-lines').innerText().catch(()=>'');ok('3 파트 카드 ‘오늘’ 미리 보기: 최근 한 줄 + 줄 수(오늘 3줄)',/오늘 3줄 · 한빛아파트 욕실/.test(t)&&t.split('\n').filter(l=>/^오늘/.test(l.trim())).length===1,t);
  // C(현장 일정)가 늦은 공정 판정을 saLateProcs 로 뺀 뒤에도 현황판 숫자가 그대로인지
  const lp=await A.evaluate(([T])=>{const h=window.__hfT,o={};["p1","p3","p4","p5","p8"].forEach(id=>{o[id]=h.saLateProcs(id,T)});o.rows=h.saRows().late;return o},[T]);
  ok('3 늦은 공정 공용 함수(saLateProcs): p1=목공만 · p4=전기 · 준공(p3)·앞날(p5)·100%(p8)는 없음 · 현장 일정 화면의 늦은 공정 수 = 현황판 합',JSON.stringify([lp.p1,lp.p4,lp.p3,lp.p5,lp.p8])===JSON.stringify([[["목공",D(-3)]],[["전기",D(-2)]],[],[],[]])&&lp.rows===P.res.late.n+P.gov.late.n+P.etc.late.n&&P.res.late.L[0].end===D(-3)&&P.res.late.L[0].days===3,lp)}
 const S3=snap.staff;const sf=nm=>S3.find(x=>x.name===nm);
 ok('3 직원 줄 3명: 정진혁 오늘 2건(프로젝트 수정·견적 등록)·기록 1·사진 1·요청 접수 1 끝남 1 / 이봄이 형 확인 필요 1 / 채진아 오늘 1건',S3.length===3&&sf('정진혁').work.n===2&&sf('정진혁').memo===1&&sf('정진혁').photo===1&&sf('정진혁').fb.wait===1&&sf('정진혁').fb.done===1&&sf('이봄이').fb.ask===1&&sf('이봄이').work.n===0&&sf('채진아').work.n===1,S3.map(x=>[x.name,x.work.n,x.memo,x.photo,x.fb.wait,x.fb.ask,x.fb.done]));
 ok('3 직원 줄 화면: 세 사람 이름 · 요청 상태',await A.locator('.ceo-srow').count()===3&&/형 확인 필요 1/.test(await A.locator('[data-ceostaff="이봄이"]').innerText())&&/오늘 2건/.test(await A.locator('[data-ceostaff="정진혁"]').innerText()));

 // ───────── 4. 알림: 늦어진 공정·미루는 결재만 ─────────
 t=await A.locator('#ceoAlert').innerText().catch(()=>'');ok('4 맨 위 빨간 줄: 공정 늦음 2곳 · 미루는 결재 2건',/공정 늦음 2곳/.test(t)&&/미루는 결재 2건/.test(t)&&/한빛아파트/.test(t)&&/교문초등학교/.test(t)&&/법인카드 대금/.test(t)&&!/교문초 전기 자재/.test(t),t);
 const red=await A.evaluate(()=>window.__hfT.ceoRed().map(x=>[x.kind,x.title,x.k,x.go||'',(x.open||[]).join('|')]));
 ok('4 기존 ‘대표 확인’ 목록에 공정 늦음 2줄 + 미루는 결재 1줄 (그 밖의 것은 안 얹음)',red.length===3&&red.filter(x=>x[0]==='공정 늦음').length===2&&red.filter(x=>x[0]==='결재 대기'&&/2일 넘음/.test(x[1])&&x[3]==='#approvals').length===1,red);
 ok('4 메뉴 숫자(빨간색) 4',/4/.test(await A.locator('#nav a[href="#ceo"] .cnt').innerText().catch(()=>'')));
 await A.locator('#redFab').click();await wait(500);t=await A.locator('#redVeil').innerText().catch(()=>'');ok('4 빨간 종 창에 ‘공정 늦음’·‘2일 넘음’ 줄이 보임',/공정 늦음/.test(t)&&/2일 넘음/.test(t)&&/목공/.test(t),t.slice(0,300));
 await A.locator('#redVeil [data-redclose]').click();await wait(300);

 // ───────── 5. 숫자를 누르면 목록 · 이동 ─────────
 await A.locator('[data-ceolist="res|late"]').click();await wait(400);t=await A.locator('#ceoVeil').innerText().catch(()=>'');ok('5 늦은 공정 숫자 → 목록 창(현장·공정·며칠 지남)',/주거 파트 · 공정 늦어진 현장/.test(t)&&/한빛아파트 욕실/.test(t)&&/목공/.test(t),t.slice(0,200));
 await A.locator('#ceoVeil [data-ceoopen="projects|p1"]').click();await wait(1200);ok('5 목록 줄 → 그 프로젝트가 열림',await A.evaluate(()=>{const s=window.__hfT.sheet();return !!s&&s.col==='projects'&&s.id==='p1'})&&!(await A.locator('#ceoVeil').count()));
 await A.evaluate(()=>window.__hfT.closeSheet());await wait(400);
 await A.locator('[data-ceolist="res|ap"]').click();await wait(400);t=await A.locator('#ceoVeil').innerText();ok('5 결재 숫자 → 목록(한빛 타일 대금 · 3일째)',/한빛 타일 대금/.test(t)&&/3일째/.test(t),t.slice(0,200));
 await A.locator('#ceoVeil [data-ceogo]').click();await wait(800);ok('5 ‘전자결재로’ → 전자결재 메뉴',await hash(A)==='#approvals');
 await go(A,'#ceo');await A.locator('[data-ceolist="gov|recv"]').click();await wait(400);t=await A.locator('#ceoVeil').innerText();ok('5 미수금 숫자 → 목록(교문초등학교 22,000,000원)',/교문초등학교/.test(t)&&/22,000,000원/.test(t),t.slice(0,200));
 await A.locator('#ceoVeil [data-ceogo]').click();await wait(800);ok('5 ‘미수금 화면으로’ → 미수금',await hash(A)==='#recv'&&/미수금/.test(await A.locator('#view h1').innerText()));
 await go(A,'#ceo');await A.locator('[data-ceolist="res|active"]').click();await wait(400);await A.locator('#ceoVeil [data-ceogo]').click();await wait(800);ok('5 진행 중 숫자 → ‘프로젝트 메뉴로’',await hash(A)==='#projects');
 await go(A,'#ceo');await A.locator('[data-ceolist="staff0|work"]').click();await wait(400);t=await A.locator('#ceoVeil').innerText();ok('5 직원 오늘 한 일 → 목록(프로젝트 수정·견적 등록)',/정진혁/.test(t)&&/한빛아파트 욕실/.test(t)&&/등록/.test(t)&&/수정/.test(t),t.slice(0,240));
 await A.locator('#ceoVeil [data-ceoclose]').click();await wait(300);ok('5 닫기',!(await A.locator('#ceoVeil').count()));

 // ───────── 6. 자료 변경 소식(기존 변경 확인 탭) 합침 · 기존 주소 그대로 ─────────
 t=await A.locator('#ceoDrv').innerText().catch(()=>'');ok('6 현황판 아래 칸에 자료 변경 소식(새 변경 1건 · 파일 이름 · 이봄이)',/자료 변경 소식/.test(t)&&/새 변경 1건/.test(t)&&/교문초 실행내역 시험파일/.test(t)&&/이봄이/.test(t),t.slice(0,300));
 await A.locator('#ceoDrv [data-dcseen]').first().click();await wait(900);db=await W.DB();ok('6 현황판에서 ‘확인함’ → 기존 확인 기록 칸에 저장',!!(db["acct/_drv/chgseen/m"]&&Object.keys(db["acct/_drv/chgseen/m"].seen||{}).length===1)&&/새 변경 0건/.test(await A.locator('#ceoDrv').innerText()));
 await A.locator('#ceoDrv a[href="#drvchg"]').click();await wait(900);ok('6 ‘전체 보기·설정’ → 기존 자료 변경 소식 화면(주소·기능 그대로)',await hash(A)==='#drvchg'&&/자료 변경 소식/.test(await A.locator('#view h1').innerText())&&await A.locator('[data-dccfgbox]').count()===1);
 await go(A,'#ceo');await A.locator('#view a[href="#home"]').click();await wait(900);ok('6 ‘기존 홈 보기’ 한 번으로 기존 홈',await hash(A)==='#home'&&!(await A.locator('#ceoParts').count()));

 // ───────── 7. 스냅숏 규칙: 그대로 두기 · 손으로 다시 세기 ─────────
 await go(A,'#ceo');const before=(await W.DB())[SNAP].at;const A2=await W.open('admin',13000);const mid=(await W.DB())[SNAP];
 ok('7 기준 시각 뒤에 센 스냅숏이 있으면 다시 열어도 그대로(다시 저장 안 함)',mid.at===before&&mid.by==='auto'&&await hash(A2)==='#ceo'&&await tile(A2,'res','active')==='3건',[before,mid.at]);
 await A2.locator('[data-ceorecount]').click();await wait(1500);const aft=(await W.DB())[SNAP];ok('7 ‘지금 다시 세기’ → 새로 세어 저장(손으로 · 기준 시각은 그대로)',aft.at>before&&aft.by==='manual'&&aft.slot===slotAt(Date.parse(aft.at))&&/다시 셈/.test(await A2.locator('#ceoBase').innerText()),[aft.at,aft.by]);
 await A2.close();

 // ───────── 8. 직원 3명: 메뉴·카드·첫 화면·저장 칸 ─────────
 for(const who of ['jjh','bom','cja']){const Pg=await W.open(who,9000);const tag=NAME[who];
  ok(`8 ${tag}: 첫 화면이 현황판 아님 · 메뉴에 현황판 없음`,await hash(Pg)!=='#ceo'&&!(await navs(Pg)).includes('#ceo'),[await hash(Pg)]);
  await go(Pg,'#ceo',1200);t=await text(Pg);ok(`8 ${tag}: 주소(#ceo)로 직접 가도 홈 · 현황판 카드·글자 없음`,!(await Pg.locator('.ceo-part,#ceoParts,.ceo-srow,#ceoAlert,#ceoDrv').count())&&!/대표 현황판|공정 늦어진 현장|미루는 결재/.test(t)&&await Pg.evaluate(()=>!!document.querySelector('#nav a[href="#home"][aria-current="page"]')),t.slice(0,120));
  const acc=await Pg.evaluate(async path=>{const d=await window.claude.use('db');const r={};try{const g=await d.doc(path).get();r.read=g&&g.exists?'읽힘':'없음'}catch(e){r.read='거절'}try{await d.collection('acct/_ceo/snap').get();r.list='읽힘'}catch(e){r.list='거절'}try{await d.doc(path).set({x:1});r.write='써짐'}catch(e){r.write='거절'}r.snap=window.__hfT.ceo();r.red=window.__hfT.ceoRed().length;return r},SNAP);
  ok(`8 ${tag}: 저장 칸 읽기·목록·쓰기 모두 거절 · 화면 안에도 스냅숏 없음`,acc.read==='거절'&&acc.list==='거절'&&acc.write==='거절'&&!acc.snap&&acc.red===0,acc);
  ok(`8 ${tag}: 빨간 종(대표 확인) 없음`,!(await Pg.locator('#redFab').count()));await Pg.close()}
 db=await W.DB();ok('8 직원이 다녀간 뒤 스냅숏 그대로 · 직원 칸(mine·acct/직원·work)에 현황판 자료 없음',db[SNAP].at===aft.at&&!Object.keys(db).some(k=>k!==SNAP&&/ceo/i.test(k))&&!Object.entries(db).some(([k,v])=>/^(mine|work|acct\/u_)/.test(k)&&/ceolate|"slot"|공정 늦음/.test(JSON.stringify(v))));
 // 대표의 '직원 화면 미리 보기'
 for(const who of ['jjh','cja']){await go(A,'#preview',1000);await A.locator('[data-pvgo="'+SID[who]+'"]').click();await wait(2500);n=await navs(A);await go(A,'#ceo',900);
  ok(`8 미리 보기(${NAME[who]}): 메뉴·카드 없음`,!n.includes('#ceo')&&!(await A.locator('.ceo-part,#ceoParts').count())&&!/대표 현황판/.test(await text(A)),n.slice(0,3));
  await A.evaluate(()=>{const b=[...document.querySelectorAll('#pvTop button')].find(x=>/끝|돌아|나가/.test(x.innerText));if(b)b.click()});await wait(4000)}
 ok('8 미리 보기를 끝내면 대표 화면으로 돌아옴(현황판 메뉴 다시 있음)',(await navs(A)).includes('#ceo'),await navs(A));

 // ───────── 9. 이 기기 첫 화면 고르기 ─────────
 await go(A,'#ceo',900);await A.locator('[data-ceofirst="home"]').click();await wait(500);ok('9 ‘이 기기 첫 화면을 기존 홈으로’ 저장',await W.LS('hf-ceo-first')==='home');
 const A3=await W.open('admin',9000);ok('9 그 뒤 대표가 들어오면 기존 홈이 먼저 · 현황판 메뉴는 그대로',await hash(A3)===''&&!(await A3.locator('#ceoParts').count())&&(await navs(A3))[0]==='#ceo',await hash(A3));
 await go(A3,'#ceo',900);await A3.locator('[data-ceofirst="ceo"]').click();await wait(400);ok('9 다시 현황판 먼저로',await W.LS('hf-ceo-first')==='ceo');await A3.close();
 const A4=await W.open('admin',8000,'','http://hf.test/#projects');ok('9 주소에 메뉴가 있으면(#projects) 그 메뉴 그대로',await hash(A4)==='#projects');await A4.close();

 // ───────── 10. 낡은 스냅숏 → 자동으로 다시 셈 / 새 스냅숏 → 그대로 ─────────
 const fake=(at)=>{const s=JSON.parse(JSON.stringify(snap));s.at=at;s.slot=slotAt(Date.parse(at));s.parts.res.active.n=77;s.by='auto';return s};
 const staleAt=iso(Date.parse(slotAt(Date.now()))-60000);
 const Wb=await world({[SNAP]:fake(staleAt)});const B=await Wb.open('admin',15000);const sb=(await Wb.DB())[SNAP];
 ok('10 기준 시각 1분 전에 센 스냅숏(가짜 77건) → 열면 자동으로 다시 세어 저장',sb.at>staleAt&&sb.parts.res.active.n===3&&await tile(B,'res','active')==='3건',[sb.at,sb.parts.res.active.n,await tile(B,'res','active')]);
 const freshAt=iso(Date.now());const Wc=await world({[SNAP]:fake(freshAt)});const C=await Wc.open('admin',15000);const sc=(await Wc.DB())[SNAP];
 ok('10 방금 센 스냅숏(가짜 77건) → 다시 세지 않고 저장된 숫자 그대로',sc.at===freshAt&&sc.parts.res.active.n===77&&await tile(C,'res','active')==='77건',[sc.at,await tile(C,'res','active')]);

 // ───────── 11. A(확정본)·B(타임라인) 요약이 있으면 씀 ─────────
 // A 는 진짜 함수(v11SpecSummary — 화면 코드가 만듦)와 맞물려 봄: 공용 작업 칸 work/all/spec 에 버전 줄·기록 줄을 넣음.
 // B 도 먼저 진짜 함수(v11TimelineToday)와 맞물려 봄: 관공서 p4 에 오늘 사진 2장(같은 사람 → 한 줄 · n 2)·결정 한 줄을 넣음. 그 다음 시험용 값으로 바꿔 ‘다시 세기’(B 제작자 판 방식)
 const sv=(pid,pno,ver)=>({k:"ver",pid,pno,ver,at:iso(NOW-(4-ver)*36e5),by:"u_bom",byName:"이봄이",items:[{space:"욕실",part:"벽",name:"시험 타일"}],files:[]});
 const sa=(pid,pno,act,ver,byName,x)=>Object.assign({k:"act",pid,pno,act,ver,at:iso(NOW-36e5+ver*1000+(act==="고객 확인"?5000:0)),by:"u_x",byName},x||{});
 const SPEC={"work/all/spec/p1__v1":sv("p1","P-2611-901",1),"work/all/spec/p1__v2":sv("p1","P-2611-901",2),"work/all/spec/p1__a1":sa("p1","P-2611-901","확정",1,"정진혁"), // 주거: v1 확정 · 고객 안 봄 · 그 뒤 v2 올라옴(확정 뒤 바뀜)
  "work/all/spec/p4__v1":sv("p4","P-2611-904",1),"work/all/spec/p4__a1":sa("p4","P-2611-904","확정",1,"이봄이"),"work/all/spec/p4__a2":sa("p4","P-2611-904","고객 확인",1,"고객",{seenAt:NOWI}), // 관공서: 확정 · 고객이 봄 → 안 셈
  "work/all/spec/p2__v1":sv("p2","P-2611-902",1), // 주거: 올리기만 하고 확정 전 → 안 셈
  "work/all/spec/p6__v1":sv("p6","P-2611-906",1),"work/all/spec/p6__a1":sa("p6","P-2611-906","확정",1,"최윤수")}; // 일반공사: A 는 part '관공서'로 주지만 현황판은 구분(cat)으로 '그 밖'
 const pre=`window.v11TimelineToday=[{pid:"p4",name:"교문초등학교 도서관",t:"09:10",kind:"사진",text:"전기 배관",who:"이봄이"},{pid:"p4",name:"교문초등학교 도서관",t:"10:20",kind:"메모",text:"자재 도착",who:"이봄이"}];`;
 const ph4=i=>({id:"ph4"+i,fid:"as_y"+i,name:"b"+i+".jpg",type:"image/jpeg",d:T,at:iso(NOW-i*1000),by:"u_bom",byName:"이봄이",from:"현장 일지"});
 const P4X={"projects/p4":Object.assign({},SEED["projects/p4"],{photos:[ph4(1),ph4(2),Object.assign(ph4(3),{name:"도면.pdf",type:"application/pdf"})],plog:[{at:NOWI,type:"결정",text:"전기 배관 위치 확정",name:"이봄이"}]})};
 const Wd=await world(Object.assign({},SPEC,P4X));const Dp=await Wd.open('admin',15000);const sd0=(await Wd.DB())[SNAP];
 const rtl=await Dp.evaluate(()=>window.v11TimelineToday().filter(e=>e.pid==="p4").map(e=>[e.kind,e.n||0,e.who,/^\d{4}-/.test(e.t)]));
 ok('11 진짜 B 함수(v11TimelineToday): p4 사진 한 줄(2장 · PDF 는 장수에 안 셈)·결정 한 줄',JSON.stringify(rtl.slice().sort())===JSON.stringify([["결정",0,"이봄이",true],["사진",2,"이봄이",true]]),rtl);
 ok('11 진짜 B 함수와 맞물린 현황판: 관공서 사진 2(장수) · 메모 1(결정) · 주거 사진 1 · 메모 2 그대로',sd0.tlSrc==='B'&&sd0.parts.gov.tl.photo===2&&sd0.parts.gov.tl.memo===1&&sd0.parts.gov.tl.n===2&&sd0.parts.res.tl.photo===1&&sd0.parts.res.tl.memo===2&&await tile(Dp,'gov','tl')==='사진 2 · 메모 1',[sd0.tlSrc,sd0.parts.gov.tl,sd0.parts.res.tl]);
 ok('11 직원별 ‘사진’ 수는 사진만(이봄이 2 — PDF 1개는 안 셈) · 기록 1',(sd0.staff.find(x=>x.name==='이봄이')||{}).photo===2&&(sd0.staff.find(x=>x.name==='이봄이')||{}).memo===1,sd0.staff.map(x=>[x.name,x.memo,x.photo]));
 await Dp.evaluate(pre);await Dp.evaluate(()=>window.__hfT.ceoRecount('manual'));await wait(2500);const sd=(await Wd.DB())[SNAP];
 const real=await Dp.evaluate(()=>window.v11SpecSummary().map(e=>[e.pid,e.part,e.ver,!!e.confirmedAt,!!e.custSeenAt,e.changedAfterConfirm]));
 ok('11 진짜 A 함수 모양: p1 확정 v1·고객 안 봄·확정 뒤 바뀜 / p4 고객 봄 / p2 확정 없음(ver 0) / p6 part 관공서',JSON.stringify(real.sort())===JSON.stringify([["p1","주거",1,true,false,true],["p2","주거",0,false,false,false],["p4","관공서",1,true,true,false],["p6","관공서",1,true,false,false]]),real);
 ok('11 A 요약(진짜 함수): 확정됐는데 고객이 안 본 것만 — 주거 1 · 관공서 0(고객이 봄) · 확정 전 것은 안 셈',sd.specReady===true&&sd.parts.res.spec.n===1&&sd.parts.res.spec.L[0].id==='p1'&&sd.parts.gov.spec.n===0&&/확정 뒤 바뀜/.test(sd.parts.res.spec.L[0].s)&&/정진혁/.test(sd.parts.res.spec.L[0].s)&&await tile(Dp,'res','spec')==='1건'&&await tile(Dp,'gov','spec')==='0건',[sd.specReady,sd.parts.res.spec,await tile(Dp,'res','spec')]);
 ok('11 A 가 관공서로 준 일반공사 현장은 현황판 구분(cat)대로 ‘그 밖’에 셈',sd.parts.etc.spec.n===1&&sd.parts.etc.spec.L[0].id==='p6',sd.parts.etc.spec);
 await Dp.locator('[data-ceolist="res|spec"]').click();await wait(400);t=await Dp.locator('#ceoVeil').innerText();ok('11 확정본 숫자 → 목록(한빛아파트 욕실 · 확정 뒤 바뀜) → 그 프로젝트 열림',/한빛아파트 욕실/.test(t)&&/확정 뒤 바뀜/.test(t),t.slice(0,200));
 await Dp.locator('#ceoVeil [data-ceoopen="projects|p1"]').click();await wait(1200);ok('11 목록 줄 → 프로젝트 p1',await Dp.evaluate(()=>{const s=window.__hfT.sheet();return !!s&&s.id==='p1'}));
 ok('11 B 타임라인(시험용 값으로 바꿔 다시 셈): 관공서 사진 1 · 메모 1',sd.by==='manual'&&sd.tlSrc==='B'&&sd.parts.gov.tl.photo===1&&sd.parts.gov.tl.memo===1&&sd.parts.res.tl.n===0&&await tile(Dp,'gov','tl')==='사진 1 · 메모 1',[sd.tlSrc,sd.parts.gov.tl]);

 // ───────── 12. 휴대폰 390px: 세로 쌓임 · 가로 넘침 없음 ─────────
 const Wm=await world(null,{width:390,height:844});const M=await Wm.open('admin',15000);
 const geo=await M.evaluate(()=>{const c=[...document.querySelectorAll('.ceo-part')].map(e=>{const r=e.getBoundingClientRect();return {l:Math.round(r.left),t:Math.round(r.top+scrollY),w:Math.round(r.width),h:Math.round(r.height)}});const nav=document.querySelector('#nav a[href="#ceo"]');
   const over=[...document.querySelectorAll('#view *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1}).length;
   return {hash:location.hash,c,sw:document.documentElement.scrollWidth,iw:innerWidth,over,nav:!!nav&&nav.getBoundingClientRect().width>0,tiles:[...document.querySelectorAll('.ceo-part')[0].querySelectorAll('.ceo-n')].map(e=>Math.round(e.getBoundingClientRect().left))}});
 ok('12 휴대폰: 첫 화면 현황판 · 메뉴 줄에 현황판 보임',geo.hash==='#ceo'&&geo.nav,geo);
 ok('12 휴대폰: 파트 카드가 세로로 쌓임(같은 왼쪽 · 둘째가 첫째 아래 · 폭이 화면에 꽉)',geo.c.length===2&&geo.c[0].l===geo.c[1].l&&geo.c[1].t>=geo.c[0].t+geo.c[0].h&&geo.c[0].w>=330&&geo.c[0].w<=390,geo.c);
 ok('12 휴대폰: 가로 넘침 없음(화면 밖으로 나간 것 0)',geo.sw<=geo.iw+2&&geo.over===0,[geo.sw,geo.iw,geo.over]);
 ok('12 휴대폰: 카드 한 장 높이가 화면(844) 절반쯤 — 두 장이 한 번 훑어 보임',geo.c.every(x=>x.h<=470),geo.c.map(x=>x.h));
 await M.screenshot({path:OUT+'/ceo_board_390.png',fullPage:true});
 await M.locator('[data-ceolist="res|late"]').click();await wait(400);const vg=await M.evaluate(()=>{const s=document.querySelector('#ceoVeil .sheet').getBoundingClientRect();return {w:Math.round(s.width),r:Math.round(s.right),sw:document.documentElement.scrollWidth}});
 ok('12 휴대폰: 목록 창도 화면 안',vg.r<=391&&vg.sw<=392,vg);await M.locator('#ceoVeil [data-ceoclose]').click();
 await A.setViewportSize({width:1280,height:900});await go(A,'#ceo',900);await A.screenshot({path:OUT+'/ceo_board_pc.png',fullPage:true});
 const pc=await A.evaluate(()=>[...document.querySelectorAll('.ceo-part')].map(e=>Math.round(e.getBoundingClientRect().top)));ok('12 PC: 파트 카드 2개가 나란히',pc.length===2&&pc[0]===pc[1],pc);

 // ───────── 13. 검토 권고 반영 ─────────
 // 13-1 덜 센 채 저장된 스냅숏(방금 센 것이라 기준 시각으로는 새것)은 자료가 다 오면 한 번 더 셈
 {const half=(x)=>{const s=fake(iso(Date.now()));Object.assign(s,x);return s};
  const Wp=await world({[SNAP]:half({partial:1})});const Pp=await Wp.open('admin',16000);const sp=(await Wp.DB())[SNAP];
  ok('13 덜 센 표시(partial)가 있는 새 스냅숏(가짜 77건) → 자료가 다 오면 다시 세어 저장(표시 없어짐)',sp.parts.res.active.n===3&&sp.partial===undefined&&sp.by==='auto'&&await tile(Pp,'res','active')==='3건',[sp.parts.res.active.n,sp.partial,sp.by]);
  const at1=sp.at;await wait(7000);ok('13 다시 센 뒤에는 그대로(되풀이해 세지 않음)',(await Wp.DB())[SNAP].at===at1);await Pp.close();
  const Wq=await world({[SNAP]:half({specReady:false})});const Pq=await Wq.open('admin',16000);const sq=(await Wq.DB())[SNAP];
  ok('13 ‘준비 중’(specReady=false)으로 저장된 새 스냅숏 → 확정본 자료가 오면 다시 세어 저장',sq.parts.res.active.n===3&&sq.specReady===true&&await tile(Pq,'res','spec')==='0건',[sq.parts.res.active.n,sq.specReady]);await Pq.close()}
 // 13-2 지운 줄·숨긴 줄·휴지통 줄은 안 셈 · 13-5 고친 사람 칸 없이 사본 표시만 있는 줄 · 13-6 급여 결재
 {const dead=(id,x)=>Object.assign({},SEED["projects/p1"],{no:"P-2611-9"+id,title:"지운 현장 "+id,plog:[],photos:[],pays:[{step:"잔금",amt:"990000",due:D(3)}]},x);
  const X={"projects/p91":dead("91",{__deleted:true}),"projects/p92":dead("92",{__gone:true}),"projects/p93":dead("93",{trashed:true}),
   "approvals/a91":ap("u_jjh","지운 결재",{pno:"P-2611-901",__deleted:true,history:[{at:iso(NOW-5*864e5),by:"u_cja",act:"검토"}]}),
   "feedback/f91":{body:"지운 요청",kind:"불편해요",status:"형 확인 필요",createdBy:"u_bom",createdAt:NOWI,__deleted:true},
   "quotes/q91":{qno:"P-2611-902-2",pno:"P-2611-902",name:"사본 표시만",staff:"이봄이",status:"본견적 진행",d:T,amount:1,items:[],createdBy:"u_bom",createdAt:T0,updatedAt:T0,__by:"u_jjh",__at:NOWI}, // 고친 사람 칸 없음 · 사본 표시(정진혁 · 오늘) → 정진혁 오늘 수정
   "quotes/q92":{qno:"P-2611-902-3",pno:"P-2611-902",name:"남이 고침",staff:"이봄이",status:"본견적 진행",d:T,amount:1,items:[],createdBy:"u_bom",createdAt:T0,updatedAt:NOWI,__by:"u_jjh",__at:T0},   // 오늘 고쳐졌지만 정진혁 사본 표시는 옛날 → 정진혁 것으로 세지 않음
   "approvals/a92":ap("u_cja","11월 급여 지급의 건 9,876,543원",{kind:"기안품의서 (본사)",pno:"본사",amount:9876543,hqlines:[{item:"급여",detail:"11월 급여",amount:9876543}],history:[{at:iso(NOW-4*864e5),by:"u_cja",act:"기안"}]})};
  const We=await world(X);const E=await We.open('admin',16000);const se=(await We.DB())[SNAP],J=JSON.stringify(se);
  ok('13 지운 줄(__deleted)·숨긴 줄(__gone)·휴지통 줄은 안 셈: 주거 진행 3 · 늦음 1 · 결재 1 · 입금 예정 1,320만 그대로',JSON.stringify(num(se.parts.res))===JSON.stringify([3,1,1,1,1,5500000,1,13200000,1,1,1,2])&&!/지운 현장|지운 결재|지운 요청/.test(J)&&se.staff.find(x=>x.name==='이봄이').fb.ask===1,num(se.parts.res));
  const jw=se.staff.find(x=>x.name==='정진혁').work;
  ok('13 고친 사람 칸 없이 사본 표시(__by)만 있는 줄: 그 사본 시각(__at)이 오늘이면 그 사람 오늘 수정(3건) · 옛날이면 안 셈',jw.n===3&&jw.L.some(w=>w.t==='사본 표시만'&&/수정/.test(w.s))&&!jw.L.some(w=>w.t==='남이 고침'),jw);
  const sal=se.parts.etc.ap.L.find(x=>x.id==='a92');
  ok('13 급여 결재(대표 차례): 줄 제목은 ‘급여 결재’만 · 금액·원래 제목 없음 · 건수에는 셈(그 밖 2건 · 미룸 2)',!!sal&&sal.t==='급여 결재'&&!/9,?876,?543|11월 급여/.test(JSON.stringify(sal))&&se.parts.etc.ap.n===2&&se.parts.etc.ap.slow===2,se.parts.etc.ap);
  ok('13 스냅숏 어디에도 급여 금액·급여 결재 원래 제목 없음',!/9,?876,?543|11월 급여/.test(J));
  t=await E.locator('#ceoAlert').innerText().catch(()=>'');ok('13 맨 위 알림 줄: ‘급여 결재’로만 (금액 없음)',/급여 결재/.test(t)&&/미루는 결재 3건/.test(t)&&!/9,?876,?543|11월 급여/.test(t),t);
  const rd=await E.evaluate(()=>window.__hfT.ceoRed().map(x=>x.title+' '+x.sub).join(' / '));ok('13 ‘대표 확인’ 목록 줄에도 금액·원래 제목 없음',/급여 결재/.test(rd)&&!/9,?876,?543|11월 급여/.test(rd),rd);
  await E.locator('[data-ceolist="etc|ap"]').click();await wait(400);t=await E.locator('#ceoVeil').innerText();ok('13 목록 창 줄: ‘급여 결재’ · 금액 없음 · 다른 결재(법인카드 대금 120,000원)는 그대로',/급여 결재/.test(t)&&!/9,?876,?543|11월 급여/.test(t)&&/법인카드 대금/.test(t)&&/120,000원/.test(t),t.slice(0,300));
  await E.locator('#ceoVeil [data-ceoopen="approvals|a92"]').click();await wait(1200);ok('13 그 줄을 누르면 급여 결재 서류가 열림(금액은 서류 안에서)',await E.evaluate(()=>{const s=window.__hfT.sheet();return !!s&&s.col==='approvals'&&s.id==='a92'}));await E.close()}
 // 13-3 44px (휴대폰): 알림 줄 안 현장·결재 링크 · ‘그 밖·구분 없음’ 칩 · 목록 창 ‘닫기’
 {await go(M,'#ceo',900);const hs=await M.evaluate(()=>{const h=q=>[...document.querySelectorAll(q)].map(e=>Math.round(e.getBoundingClientRect().height));return {al:h('#ceoAlert button'),chip:h('.ceo-chip'),over:[...document.querySelectorAll('#view *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1}).length}});
  ok('13 휴대폰: 알림 줄 링크·‘그 밖’ 칩 높이 44px 이상 · 가로 넘침 없음',hs.al.length>=3&&hs.al.every(x=>x>=44)&&hs.chip.length>=4&&hs.chip.every(x=>x>=44)&&hs.over===0,hs);
  await M.locator('[data-ceolist="etc|ap"]').click();await wait(400);const ch=await M.evaluate(()=>{const r=document.querySelector('#ceoVeil [data-ceoclose]').getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]});
  ok('13 휴대폰: 목록 창 ‘닫기’ 44px 이상',ch[0]>=44&&ch[1]>=44,ch);await M.locator('#ceoVeil [data-ceoclose]').click()}
 // 13-4 320px: ‘오늘 현장 사진·메모’ 값이 말줄임으로 잘리지 않음(줄바꿈)
 {const Ws=await world(null,{width:320,height:640});const Sm=await Ws.open('admin',15000);
  const g=await Sm.evaluate(()=>{const b=document.querySelector('[data-ceolist="res|tl"] b'),cs=getComputedStyle(b);return {txt:b.innerText.trim().replace(/\s+/g,' '),sw:b.scrollWidth,cw:b.clientWidth,ws:cs.whiteSpace,to:cs.textOverflow,h:Math.round(b.getBoundingClientRect().height),docw:document.documentElement.scrollWidth,iw:innerWidth,over:[...document.querySelectorAll('#view *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1}).length}});
  ok('13 320px: ‘사진 1 · 메모 2’ 가 잘리지 않고 다 보임(줄바꿈 · 말줄임 없음) · 가로 넘침 없음',g.txt==='사진 1 · 메모 2'&&g.sw<=g.cw+1&&g.ws==='normal'&&g.to!=='ellipsis'&&g.docw<=g.iw+2&&g.over===0,g);
  await Sm.screenshot({path:OUT+'/ceo_board_320.png',fullPage:true});await Sm.close()}

 ok('공통: 화면 오류 없음',errs.length===0,errs);ok('공통: alert·prompt 창 없음',dialogs.filter(d=>!/ confirm /.test(d)).length===0,dialogs);
 await b.close();console.log(`결과: 통과 ${R.filter(Boolean).length} / 실패 ${R.filter(x=>!x).length}`);process.exit(R.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
