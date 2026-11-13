// 보안·권한 묶음 시험 (대표 지시 2026-11-13 · 0·1b·5·7·8·9·10·11·12번): node intranet/tools/test/perm1113_test.js [index.html]
// 대표·채진아(전체 담당)·정진혁·이봄이(실무 팀) × 실제 로그인 / 대표의 '직원 화면 미리 보기' 양쪽에서 확인
const {chromium}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const ONLY=(process.env.ONLY||'').split(',').filter(Boolean);const on=k=>!ONLY.length||ONLY.includes(k);
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-10T00:00:00Z";
const ap=(by,title,x)=>Object.assign({kind:"기안품의서 (본사)",title,status:"결재 대기",step:0,pno:"본사",amount:120000,createdBy:by,createdAt:"2026-11-12T01:00:00Z",updatedAt:"2026-11-12T01:00:00Z",history:[],aline:[{role:"기안",name:by==="u_jjh"?"정진혁":by==="u_bom"?"이봄이":by==="u_cja"?"채진아":"최윤수"},{role:"검토",name:"채진아"},{role:"결재",name:"최윤수"},{role:"최종결재",name:"신혜현"}]},x||{});
const act=(by,col,title,i)=>({at:"2026-11-12T0"+i+":00:00Z",by,col,action:"결재 요청",title});
const DRV=[{id:"d1",m:"application/pdf",mod:"2026-11-01",path:"2026년 / 11월 / 2026-11 시험 현장 / 견적서",pno:"",proj:"2026-11 시험 현장",t:"시험현장 견적서.pdf"},
 {id:"d2",m:"application/pdf",mod:"2026-10-20",path:"2026년 / 11월 / 2026-11 시험 현장 / 실행내역",pno:"",proj:"2026-11 시험 현장",t:"시험현장 실행내역표.pdf"},
 {id:"d3",m:"image/jpeg",mod:"2026-10-20",path:"2026년 / 11월 / 2026-11 시험 현장 / 지급품의",pno:"",proj:"2026-11 시험 현장",t:"현장 기안품의_01.jpg"},
 {id:"d4",m:"application/vnd.ms-excel",mod:"2026-10-22",path:"2026년 계약 및 실행내역 / 손익계산서",pno:"",proj:"2026년 계약 및 실행내역",t:"손익계산서양식 비밀.xls"},
 {id:"d5",m:"image/png",mod:"2026-11-03",path:"단가표 / 장판나라",pno:"",proj:"단가표",t:"단가표 비밀.png"},
 {id:"d6",m:"image/jpeg",mod:"2026-11-12",path:"인트라넷 첨부 / P-2611-901",pno:"",proj:"인트라넷 첨부",t:"첨부 비밀.jpg"},
 {id:"d7",m:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",mod:"2026-11-06",path:"홈퍼니싱 견적서",pno:"",proj:"홈퍼니싱 견적서",t:"홈퍼니싱 견적서_ver1 비밀.xlsx"},
 {id:"d8",m:"text/markdown",mod:"2026-11-03",path:"홍보마케팅",pno:"",proj:"홍보마케팅",t:"홍보 비밀.md"},
 {id:"d9",m:"image/jpeg",mod:"2026-11-06",path:"[ 포트폴리오 사진 ] / 2026년",pno:"",proj:"[ 포트폴리오 사진 ]",t:"포트폴리오 비밀.jpg"}];
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장",joined:"2023-02-20"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장",joined:"2023-12-01"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",joined:"2020-06-15"},
 "hr/st_jjh":{monthly:3111111,payday:"매월 25일",bank:"시험은행",account:"111-22-333333",payMonthly:[["2026-10","급여",3000000,3111111,300000,2811111,"","x.xlsx"]]},
 "hr/st_bom":{monthly:3222222,payday:"매월 25일",bank:"시험은행",account:"444-55-666666",payMonthly:[["2026-10","급여",3100000,3222222,310000,2912222,"","x.xlsx"]]},
 "hr/st_cja":{monthly:3333333,payday:"매월 25일",bank:"시험은행",account:"777-88-999999",payMonthly:[["2026-10","급여",3200000,3333333,320000,3013333,"","x.xlsx"]]},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",contractAmt:"33000000",cat:"주거",inq:"2026-11-01",work:"욕실",files:[],costTotal:8765432,approvals:[{no:"26-01-01",d:"2026-01-05",title:"과거결재 타일 대금",vendor:"비밀타일",amt:8765432}],updatedAt:T0,__at:T0},
 "ppriv/p1":{estCost:"20202020"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",tel:"",addr:"",createdAt:T0,updatedAt:T0},"cpriv/c1":{tel:"010-1111-2222",addr:"서울 시험동 1",updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",name:"시험 현장",mgr:"이봄이",customer:"홍길동",status:"착공 전",logs:[],files:[],updatedAt:T0,__at:T0},
 "quotes/q1":{qno:"P-2611-901-1",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"본견적 진행",d:"2026-11-05",amount:110000,work:"욕실",items:[],createdBy:"u_jjh",createdAt:T0,updatedAt:T0},
 "approvals/a1":ap("u_jjh","정진혁 올린 결재"),"approvals/a2":ap("u_bom","이봄이 올린 결재"),
 "approvals/a3":ap("u_cja","법인카드 대금 비밀결재"),"approvals/a4":ap("u_cja","교문체육센터 자재 비밀결재",{pno:"P-2611-901",kind:"기안품의서 (현장)",amount:4545454}),"approvals/a5":ap("u_boss","고용산재보험료 비밀결재"),
 "activity/x1":act("u_jjh","approvals","정진혁 올린 결재",1),"activity/x2":act("u_bom","approvals","이봄이 올린 결재",2),"activity/x3":act("u_cja","approvals","법인카드 대금 비밀결재",3),"activity/x4":act("u_cja","approvals","교문체육센터 자재 비밀결재",4),"activity/x5":act("u_boss","approvals","고용산재보험료 비밀결재",5),
 "activity/x6":Object.assign(act("u_boss","hr","인사카드 비밀활동",6),{action:"수정"}),"activity/x7":Object.assign(act("u_jjh","projects","시험 현장",7),{action:"수정"}),"activity/x8":Object.assign(act("u_boss","projects","남의 프로젝트 비밀활동",8),{action:"수정"}),
 "acct/_drv/site/c0":{at:"2026-11-12T21:44:00Z",items:DRV},"acct/u_jjh/drvsite/c0":{at:"2026-11-12T21:44:00Z",items:DRV},"acct/u_cja/drvsite/c0":{at:"2026-11-12T21:44:00Z",items:DRV},
 "fin/bonuspay":{rows:[{name:"정진혁",amt:"13131313"}]}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const NAME={jjh:"정진혁",bom:"이봄이",cja:"채진아"},SID={jjh:"st_jjh",bom:"st_bom",cja:"st_cja"},PAY={jjh:"3,111,111",bom:"3,222,222",cja:"3,333,333"};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push([v?"통과":"실패",n,x||""]);console.log(v?"통과":"실패",n,v?"":(x||""))};
(async()=>{const b=await chromium.launch();const errs=[];
 async function world(seedX){const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[Object.assign({},SEED,seedX||{}),RULES]);
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
  const W=async(k,v)=>seed.evaluate(([k,v])=>{const d=JSON.parse(localStorage.getItem('mockdb'));if(v===null)delete d[k];else d[k]=v;localStorage.setItem('mockdb',JSON.stringify(d));new BroadcastChannel('mockdb').postMessage(1)},[k,v]);
  async function open(who,ms,pre){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{errs.push(who+' 대화상자 '+d.message().slice(0,40));d.dismiss()});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};${pre||''}`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p}
  return {ctx,D,W,open}}
 const navs=p=>p.evaluate(()=>[...document.querySelectorAll('#nav a')].map(a=>a.getAttribute('href')));
 const go=async(p,h,ms)=>{await p.evaluate(x=>{location.hash=x},h);await wait(ms||800)};
 const text=p=>p.evaluate(()=>document.body.innerText);
 const pv=async(A,who)=>{await go(A,'#preview',1000);await A.locator('[data-pvgo="'+SID[who]+'"]').click();await wait(2500)};
 const SECRET=/비밀결재|비밀활동|과거결재|비밀타일|8,765,432|4,545,454/;

 // ───────── 대표 화면을 먼저 한 번 열어 직원 사본을 만든 세계 ─────────
 const Wd=await world();let A=await Wd.open('admin',14000);
 if(on('0')){const t=await text(A);ok('0 대표 홈 최근 활동: 전부 보임',/법인카드 대금 비밀결재/.test(t)&&/고용산재보험료 비밀결재/.test(t)&&/인사카드 비밀활동/.test(t))}
 // 화면별 점검 (실제 로그인 · 미리 보기 공통)
 async function sweep(P,who,how){const tag=`${NAME[who]} ${how}`;const own=who==='jjh'?'정진혁 올린 결재':who==='bom'?'이봄이 올린 결재':'법인카드 대금 비밀결재';const full=who==='cja';
  const n=await navs(P);
  if(on('0')){
   await go(P,'#home',1200);let t=await text(P);const home=t;
   ok(`0 ${tag} 홈: 남의 결재 제목·못 보는 메뉴 활동 없음`,full?!/인사카드 비밀활동|남의 프로젝트 비밀활동/.test(t):!SECRET.test(t)&&!/이봄이 올린 결재|정진혁 올린 결재/.test(t.replace(new RegExp(own,'g'),'')),(t.match(SECRET)||[]).join(','));
   if(how==='미리 보기')ok(`0 ${tag} 홈 최근 활동: 본인 결재는 보임`,home.includes(own));
   if(how==='실제 로그인'){const st=await P.evaluate(()=>({act:window.__hfT.S().activity.length}));ok(`0 ${tag}: 활동 기록이 브라우저에 안 내려옴`,st.act===0,JSON.stringify(st))}
   await go(P,'#approvals',1000);t=await P.locator('main').innerText().catch(()=>text(P));
   ok(`0 ${tag} 전자결재 목록: ${full?'전체(결재 업무)':'본인 것만'}`,full?/고용산재보험료 비밀결재/.test(t)&&/정진혁 올린 결재/.test(t):t.includes(own)&&!SECRET.test(t)&&!(who==='jjh'?/이봄이 올린 결재/:/정진혁 올린 결재/).test(t),t.slice(0,200).replace(/\n/g,' '));
   // 주소·번호로 직접 열기
   const direct=await P.evaluate(()=>{try{window.__hfT.open('approvals','a5')}catch(e){}const s=window.__hfT.sheet();window.__hfT.closeSheet();return !!(s&&s.id==='a5')});ok(`0 ${tag} 남의 결재 번호로 직접 열기: ${full?'열림':'막힘'}`,full?direct:!direct);
   // 전체 검색
   const gs=P.locator('#gs');if(await gs.count()){await gs.fill('비밀결재');await wait(500);const r=await P.locator('#gsr').innerText().catch(()=>'');ok(`0 ${tag} 전체 검색 ‘비밀결재’: ${full?'나옴':'안 나옴'}`,full?/비밀결재/.test(r):!/비밀결재/.test(r),r.slice(0,120));await gs.fill('');await wait(200)}
   // 프로젝트 창: 인트라넷 결재·과거 결재
   await go(P,'#projects',900);await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);t=await P.locator('.sheet').first().innerText().catch(()=>'');
   ok(`0 ${tag} 프로젝트 창: 남의 결재·과거 결재(제목·업체·금액) ${full?'보임':'없음'}`,full?/교문체육센터 자재 비밀결재/.test(t)&&/과거결재 타일 대금/.test(t):!SECRET.test(t)&&/시험 현장|홍길동/.test(t),(t.match(SECRET)||[]).join(',')+' '+t.length);
   await P.evaluate(()=>window.__hfT.closeSheet());
   // 고객 이름 검색(통합 화면) · 캘린더 · 현장 · 견적 · 고객
   for(const h of ['#customers','#sites','#quotes','#calendar','#goal','#reports','#manuals','#as','#forms']){await go(P,h,600);t=await text(P);if(!full&&SECRET.test(t))ok(`0 ${tag} ${h}: 남의 결재 없음`,false,(t.match(SECRET)||[]).join(','))}
   ok(`0 ${tag} 나머지 9화면 돌아봄`,true)}
  return n}

 // ───────── 실제 로그인 ─────────
 const NAV={};
 for(const who of ['jjh','bom','cja']){const P=await Wd.open(who,9000);NAV[who]=await sweep(P,who,'실제 로그인');
  if(on('0')){const d=await Wd.D();const mp=d['mine/'+USERS[who].id+'/projects/p1']||{},wp=d['work/all/projects/p1']||{};
   ok(`0 ${NAME[who]} 사본(mine)·공용 칸(work): 과거 결재·합계 ${who==='cja'?'(전체 담당은 사본에 있음, 공용 칸에는 없음)':'없음'}`,!('approvals' in wp)&&!('costTotal' in wp)&&(who==='cja'?Array.isArray(mp.approvals):(!('approvals' in mp)&&!('costTotal' in mp))),JSON.stringify([Object.keys(mp).filter(k=>/appro|cost/i.test(k)),Object.keys(wp).filter(k=>/appro|cost/i.test(k))]))}
  await P.close()}
 // ───────── 미리 보기 ─────────
 for(const who of ['jjh','bom','cja']){await pv(A,who);const n=await sweep(A,who,'미리 보기');
  if(NAV[who])ok(`공통 ${NAME[who]}: 미리 보기 메뉴 = 실제 로그인 메뉴`,JSON.stringify(n)===JSON.stringify(NAV[who]),'미리:'+n.join(' ')+' | 실제:'+NAV[who].join(' '));
  await A.locator('[data-pvexit]').click();await wait(9000)}
 if(on('0')){const d=await Wd.D();ok('0 원본 그대로: 프로젝트의 과거 결재·합계 남아 있음',d['projects/p1'].costTotal===8765432&&d['projects/p1'].approvals.length===1)}
 console.log('메뉴',JSON.stringify(NAV));
 ok('오류·브라우저 대화상자 0',!errs.length,errs.slice(0,5).join(' | '));
 const fail=R.filter(r=>r[0]==='실패').length;console.log(`\n합계 ${R.length}건 · 통과 ${R.length-fail} · 실패 ${fail}`);
 fs.writeFileSync(OUT+'/perm1113_result.json',JSON.stringify(R,null,1));await b.close();process.exit(fail?1:0)})();
