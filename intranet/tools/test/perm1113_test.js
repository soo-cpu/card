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
  const W=async(k,v)=>seed.evaluate(([k,v])=>{const d=JSON.parse(localStorage.getItem('mockdb'));if(v===null)delete d[k];else d[k]=v;localStorage.setItem('mockdb',JSON.stringify(d));new BroadcastChannel('mockdb').postMessage(k)},[k,v]);
  async function open(who,ms,pre){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{/* okAsk 는 confirm 이 막히면(여기서는 바로 닫힘) 화면 안 확인 창으로 넘어감 — 그 밖의 대화상자만 오류 */if(d.type()!=='confirm')errs.push(who+' 대화상자 '+d.message().slice(0,40));d.dismiss()});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};window.__MOCKEXACT=${process.env.LOOSE?'false':'true'};${pre||''}`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p}
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
  const h1=async h=>{await go(P,h,700);return P.evaluate(()=>{const e=document.querySelector('#view h1');return e?e.innerText:''})};
  if(on('1b')){ok(`1b ${tag} 메뉴: 현장 원가 (주간) ${full?'있음':'없음'}`,n.includes('#fcost')===full,n.join(' '));const t=await h1('#fcost');ok(`1b ${tag} 주소 #fcost 직접: ${full?'열림':'안 열림'}`,/현장 원가/.test(t)===full,t)}
  if(on('5')){ok(`5 ${tag} 메뉴: 경영 대시보드·빈칸 목록·자료 변경 소식·미리 보기 없음`,!n.some(x=>['#fdash','#blanks','#drvchg','#preview','#bonus','#amtchk','#mysign'].includes(x)),n.join(' '));
   for(const [h,re] of [['#fdash',/경영 대시보드/],['#blanks',/빈칸 목록/],['#drvchg',/자료 변경 소식/],['#bonus',/성과금/],['#preview',/미리 보기/]]){const t=await h1(h);if(re.test(t))ok(`5 ${tag} 주소 ${h} 직접: 안 열림`,false,t)}
   ok(`5 ${tag} 주소 직접 입력 5개(#fdash·#blanks·#drvchg·#bonus·#preview) 돌아봄`,true);
   await go(P,'#home',900);const t=await text(P);ok(`5·11 ${tag} 홈: 빈칸 카드·채움률·경영 카드 없음`,!/내 빈칸|빈칸 목록|자료 채움률|현장 원가 주의|이번 주 현장 원가|자료 변경 소식/.test(t),(t.match(/내 빈칸|빈칸 목록|자료 채움률|현장 원가 주의|이번 주 현장 원가|자료 변경 소식/)||[]).join(','));
   if(full){ok(`5·12 ${tag} 메뉴: 재무제표·캐시플로우·경리 자료함·인사 관리·미수금은 그대로`,['#fstate','#cflow','#fbox','#staff','#recv','#approvals','#myhr'].every(x=>n.includes(x)),n.join(' '));const c=await h1('#cflow');const ct=await text(P);ok(`5 ${tag} 캐시플로우: 열리고 ‘자금 관리 원본’ 버튼 없음`,/캐시플로우/.test(c)&&!/자금 관리 원본/.test(ct))}
   else ok(`5 ${tag} 메뉴: 재무·경리·인사 관리 없음`,!n.some(x=>['#fstate','#cflow','#fbox','#staff','#recv'].includes(x)),n.join(' '))}
  if(on('7')){ok(`7 ${tag} 메뉴: 현장 자료 있음`,n.includes('#sitedocs'));await go(P,'#sitedocs',1500);let t=await text(P);ok(`7 ${tag} 현장 자료: 현장 폴더만 (계약·단가표·인트라넷 첨부·견적서 양식·홍보·포트폴리오 묶음 없음)`,/2026-11 시험 현장/.test(t)&&!/비밀|계약 및 실행내역|단가표|인트라넷 첨부|홈퍼니싱 견적서|홍보마케팅|포트폴리오/.test(t.replace(/직원 화면에는[^\n]*/,'')),t.slice(0,300).replace(/\n/g,' '));
   const q=P.locator('#dsQ');if(await q.count()){await q.fill('비밀');await wait(500);t=await text(P);ok(`7 ${tag} 현장 자료 검색 ‘비밀’: 안 나옴`,!/비밀\.(xls|png|jpg|xlsx|md)/.test(t));await P.locator('#dsQ').fill('');await wait(300)}
   if(how==='실제 로그인'){const raw=await P.evaluate(()=>JSON.stringify((window.__hfT.drvs?window.__hfT.drvs():null)||[]));ok(`7 ${tag}: 브라우저에 내려온 목록에도 다른 묶음 없음 (대표 화면이 맞춘 뒤)`,!/비밀/.test(raw)&&/시험현장 견적서/.test(raw),raw.length+'')}}
  if(on('8')){ok(`8 ${tag} 메뉴: 내 인사 정보 있음`,n.includes('#myhr'));await go(P,'#myhr',1200);const t=await text(P);const others=Object.keys(PAY).filter(k=>k!==who).map(k=>PAY[k]);
   ok(`8 ${tag} 내 인사 정보: 본인 월 급여·월별 급여 보임, 급여명세서 버튼 있음`,t.includes(PAY[who])&&/급여명세서 출력/.test(t)&&/2026-10|10월/.test(t),t.slice(0,200).replace(/\n/g,' '));
   ok(`8 ${tag} 내 인사 정보: 남의 급여 없음`,!others.some(x=>t.includes(x)));
   if(!full){const bad=[];for(const h of ['#home','#approvals','#projects','#customers','#sites','#quotes','#reports','#forms','#goal','#staff']){await go(P,h,500);const tt=await text(P);if(Object.values(PAY).some(x=>tt.includes(x))||/111-22-333333|444-55-666666|777-88-999999/.test(tt))bad.push(h)}ok(`8 ${tag} 다른 10화면에 급여·계좌 숫자 없음`,!bad.length,bad.join(','))}}
  return n}

 // ───────── 실제 로그인 ─────────
 const NAV={};
 for(const who of ['jjh','bom','cja']){const P=await Wd.open(who,9000);NAV[who]=await sweep(P,who,'실제 로그인');
  if(on('0')){const d=await Wd.D();const mp=d['mine/'+USERS[who].id+'/projects/p1']||{},wp=d['work/all/projects/p1']||{};
   ok(`0 ${NAME[who]} 사본(mine)·공용 칸(work): 과거 결재·합계 ${who==='cja'?'(전체 담당은 사본에 있음, 공용 칸에는 없음)':'없음'}`,!('approvals' in wp)&&!('costTotal' in wp)&&(who==='cja'?Array.isArray(mp.approvals):(!('approvals' in mp)&&!('costTotal' in mp))),JSON.stringify([Object.keys(mp).filter(k=>/appro|cost/i.test(k)),Object.keys(wp).filter(k=>/appro|cost/i.test(k))]))}
  if(on('8')){const d=await Wd.D(),u=USERS[who].id,ks=Object.keys(d).filter(k=>k.startsWith('acct/'+u+'/'));const mine=d['acct/'+u+'/me/hr']||{};
   ok(`8 ${NAME[who]} 사본: 본인 급여 사본 있음(계좌는 끝 4자리만)`,String(mine.monthly)===PAY[who].replace(/,/g,'')&&/^\*{4}\d{4}$/.test(mine.account||''),JSON.stringify(Object.keys(mine)));
   if(who!=='cja')ok(`8 ${NAME[who]} 사본: 남의 급여(pay·hrall) 사본 없음`,!ks.some(k=>/\/(pay|hrall)\//.test(k))&&!Object.values(PAY).filter((_,i)=>Object.keys(PAY)[i]!==who).some(x=>JSON.stringify(ks.map(k=>d[k])).includes(x.replace(/,/g,''))),ks.join(' '))}
  if(on('7')){const d=await Wd.D(),c=d['acct/'+USERS[who].id+'/drvsite/c0'];ok(`7 ${NAME[who]} 사본(acct/…/drvsite): 현장 폴더 3건만 (없던 사본은 만들어짐)`,!!c&&c.items.length===3&&c.items.every(x=>/시험 현장/.test(x.proj)),c?c.items.map(x=>x.proj).join('|'):'없음')}
  if(on('10')){const st=await P.evaluate(()=>window.__hfT.subs?window.__hfT.subs():null);console.log('  구독',NAME[who],JSON.stringify(st))}
  await P.close()}
 // ───────── 미리 보기 ─────────
 for(const who of ['jjh','bom','cja']){await pv(A,who);const n=await sweep(A,who,'미리 보기');
  if(NAV[who])ok(`공통 ${NAME[who]}: 미리 보기 메뉴 = 실제 로그인 메뉴`,JSON.stringify(n)===JSON.stringify(NAV[who]),'미리:'+n.join(' ')+' | 실제:'+NAV[who].join(' '));
  await A.locator('[data-pvexit]').click();await wait(9000)}
 if(on('0')){const d=await Wd.D();ok('0 원본 그대로: 프로젝트의 과거 결재·합계 남아 있음',d['projects/p1'].costTotal===8765432&&d['projects/p1'].approvals.length===1)}
 if(on('5')){const n=await navs(A);ok('5 대표 메뉴: 경영 대시보드·빈칸 목록·자료 변경 소식·현장 원가·미리 보기 있음',['#fdash','#blanks','#drvchg','#fcost','#preview','#sitedocs'].every(x=>n.includes(x)),n.join(' '));await go(A,'#cflow',900);ok('5 대표 캐시플로우: ‘자금 관리 원본’ 버튼 있음',/자금 관리 원본/.test(await text(A)));
  await go(A,'#sitedocs',1500);const t=await text(A);ok('7 대표 현장 자료: 모든 묶음 보임',/단가표/.test(t)&&/인트라넷 첨부/.test(t)&&/2026-11 시험 현장/.test(t));const d=await Wd.D();ok('7 대표 목록(acct/_drv/site) 그대로 9건',d['acct/_drv/site/c0'].items.length===9)}
 await A.close();await Wd.ctx.close();

 // ───────── 대표 화면이 한 번도 안 열린 세계: 직원이 먼저 접속 ─────────
 if(on('7')||on('8')){const W2=await world();const J=await W2.open('jjh',8000);
  await go(J,'#sitedocs',1500);let t=await text(J);ok('7 대표 화면 열리기 전(사본에 전체 목록이 있어도) 정진혁 화면: 현장 폴더만',/2026-11 시험 현장/.test(t)&&!/비밀/.test(t));
  await go(J,'#myhr',1000);t=await text(J);ok('8 대표 화면 열리기 전 정진혁 내 인사 정보: 안내만 (남의 급여 없음)',/대표 화면이 열리면/.test(t)&&!Object.values(PAY).some(x=>t.includes(x)));
  const B=await W2.open('bom',8000);await go(B,'#sitedocs',1500);t=await text(B);ok('7 사본이 없는 이봄이: 안내만',/아직 이 계정에 현장 자료 목록이 없어요/.test(t));await J.close();await B.close();await W2.ctx.close()}

 // ───────── 9·10번: 낡은 창 저장 · 첨부 지킴 · 깜빡임 ─────────
 if(on('9')||on('10')){const FILE={id:"xf_t1",name:"시험 견적서.pdf",size:1234,type:"application/pdf"};
  const W3=await world({"acct/_work/log/projects__p1__1":{col:"projects",id:"p1",by:"u_jjh",byName:"정진혁",at:"2026-11-09T00:00:00Z",applied:"2026-11-09T00:00:10Z",isNew:false,prev:JSON.stringify({files:[{id:"xf_old",name:"옛날에 빠진 계약서.pdf",size:10,type:"application/pdf"}]}),title:"시험 현장"}});
  const A3=await W3.open('admin',14000);const J=await W3.open('jjh',9000);
  // A) 정진혁이 프로젝트 창을 열어 둔 사이 대표가 PDF 를 붙임 → 정진혁 화면이 그 소식을 받은 뒤 옛 창에서 저장
  await go(J,'#projects',800);await J.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);
  await A3.evaluate(async f=>{const T=window.__hfT,p=T.S().projects.find(x=>x.id==='p1'),o=Object.assign({},p,{files:[f],updatedAt:new Date().toISOString()});delete o.id;o.estCost="";await T.put('projects','p1',o)},FILE);await wait(9000);
  let d=await W3.D();ok('9 대표가 붙인 PDF: 원본·공용 칸에 있음',(d['projects/p1'].files||[]).length===1&&(d['work/all/projects/p1'].files||[]).length===1);
  await J.locator('[data-k="work"]').first().fill('욕실 + 주방');await J.locator('#saveSheet').click();await wait(2500);d=await W3.D();
  ok('10-A 옛 창에서 저장: 공용 칸에 내 수정(공사 내용)도, 대표가 붙인 첨부도 있음',d['work/all/projects/p1'].work==='욕실 + 주방'&&(d['work/all/projects/p1'].files||[]).some(f=>f.id==='xf_t1'),JSON.stringify([d['work/all/projects/p1'].work,d['work/all/projects/p1'].files]));
  await wait(9000);d=await W3.D();ok('10-A 대표 화면이 반영한 원본: 수정 반영 + 첨부 그대로 + 과거 결재·합계 그대로',d['projects/p1'].work==='욕실 + 주방'&&(d['projects/p1'].files||[]).some(f=>f.id==='xf_t1')&&d['projects/p1'].costTotal===8765432&&(d['projects/p1'].approvals||[]).length===1,JSON.stringify([d['projects/p1'].work,d['projects/p1'].files,d['projects/p1'].costTotal]));
  // B) 소식을 못 받은 화면(낡은 사본)에서 저장한 것처럼: 첨부 없는 옛 줄을 공용 칸에 직접 올림 (실제 사고 2026-11-13 07:00 모양)
  const stale=Object.assign({},d['work/all/projects/p1'],{files:[],memo:"낡은 화면에서 저장",__by:"u_jjh",__at:new Date(Date.now()+1000).toISOString(),__base:"2026-11-10T00:00:00Z",updatedAt:new Date(Date.now()+1000).toISOString()});
  await W3.W('work/all/projects/p1',stale);await wait(12000);d=await W3.D();
  ok('9·10-B 낡은 화면 저장이 올라와도: 원본 첨부 그대로 + 다른 칸(메모)은 반영',(d['projects/p1'].files||[]).some(f=>f.id==='xf_t1')&&d['projects/p1'].memo==='낡은 화면에서 저장',JSON.stringify([d['projects/p1'].files,d['projects/p1'].memo]));
  ok('9·10-B 공용 칸에도 첨부가 다시 내려옴',(d['work/all/projects/p1'].files||[]).some(f=>f.id==='xf_t1'),JSON.stringify(d['work/all/projects/p1'].files));
  const logs=Object.keys(d).filter(k=>k.startsWith('acct/_work/log/'));ok('10 옛 값 기록 남음(지우지 않음)',logs.length>=3,logs.length+'');
  // 이봄이(그 현장 담당) 화면에서 첨부가 보이고 열 수 있는 링크
  const B=await W3.open('bom',9000);await go(B,'#projects',800);await B.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);
  const ft=await B.locator('.sheet').first().innerText();const href=await B.locator('.sheet a[href*="xf_t1"]').count();ok('9 이봄이 화면: 프로젝트 첨부 ‘시험 견적서.pdf’ 보이고 여는 링크 있음',/시험 견적서\.pdf/.test(ft)&&href>0,href+'');
  ok('9 이봄이 화면 프로젝트 창: 원가·과거 결재·합계 없음',!SECRET.test(ft)&&!/20202020|20,202,020/.test(ft));await B.evaluate(()=>window.__hfT.closeSheet());
  // C) 최신을 보고 있는 직원이 첨부를 빼고 저장하면 그대로 빠짐 (일부러 뺀 것은 존중)
  await J.evaluate(()=>window.__hfT.closeSheet());await wait(500);await J.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);await J.locator('[data-k="work"]').first().fill('욕실 + 주방 + 현관');await J.locator('#saveSheet').click();await wait(12000);/* 내 저장을 대표 화면이 받아 다시 내려 준 뒤 */await J.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);
  const rm=J.locator('.sheet [data-rmfile]');const nrm=await rm.count();if(nrm){await rm.first().click();await wait(300);await J.locator('#saveSheet').click();await wait(12000)}d=await W3.D();
  ok('10-C 최신을 보고 있는 직원이 첨부를 빼고 저장: 그대로 빠짐(일부러 뺀 것) · 옛 값 기록에 남음',nrm===1&&!(d['projects/p1'].files||[]).some(f=>f.id==='xf_t1')&&Object.keys(d).filter(k=>k.startsWith('acct/_work/log/')).some(k=>/xf_t1/.test(d[k].prev||'')),nrm+' '+JSON.stringify(d['projects/p1'].files));
  // 깜빡임: 정진혁이 새 프로젝트를 만들면(대표 화면 닫힘) 이봄이 화면에 공용 칸으로 보임 → 읽기가 한 번 실패해도 사라지지 않음
  await A3.close();await wait(500);
  await J.evaluate(async()=>{const T=window.__hfT;await T.put('projects','P-2611-950',{no:'P-2611-950',title:'공용 칸에만 있는 현장',custName:'박공용',stage:'상담',mgr:'정진혁',cat:'주거',inq:'2026-11-13',createdBy:'u_jjh',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})});await wait(3000);
  await go(B,'#projects',1200);let bt=await text(B);ok('10 이봄이 화면: 정진혁이 방금 만든 프로젝트가 바로 보임',/공용 칸에만 있는 현장/.test(bt));
  const fired=await B.evaluate(()=>window.__mockFireErr('work/all/'));await wait(500);await W3.W('mine/u_bom/idx/projects',{rows:[],at:new Date().toISOString()});/* 내 사본 쪽 소식이 한 번 와서 목록을 다시 합치게 함 */await wait(1200);await go(B,'#home',500);await go(B,'#projects',1200);bt=await text(B);
  ok('10 공용 칸 읽기가 한 번 실패한 뒤에도 그 프로젝트가 그대로 보임 (보였다 안 보였다 없음)',fired>0&&/공용 칸에만 있는 현장/.test(bt),'실패 흉내 '+fired+'개');
  ok('10 직원 화면 맨 위: 대표 화면이 마지막으로 맞춘 시각 표시',/대표 화면이 마지막으로 맞춘 시각 \d\d-\d\d \d\d:\d\d/.test(bt),(bt.match(/대표 화면이 마지막으로[^\n]*/)||[''])[0].slice(0,120));
  await J.close();await B.close();
  // 대표 홈: 빠진 첨부 찾기 → 되살리기
  const A4=await W3.open('admin',12000);await go(A4,'#home',1000);await A4.locator('[data-flscan]').click();await wait(2000);let at=await text(A4);
  ok('9 대표 홈 ‘직원 저장으로 빠진 첨부’: 기록에서 찾음',/옛날에 빠진 계약서\.pdf/.test(at)&&/시험 견적서\.pdf/.test(at)&&/빠진 첨부 2개/.test(at),(at.match(/직원 저장으로 빠진 첨부[^\n]*/)||[''])[0]);
  const before=await W3.D();await A4.locator('[data-flback]').click();await wait(800);const yes=A4.locator('.okask [data-ok="1"]').first();if(await yes.count())await yes.click();await wait(4000);d=await W3.D();
  ok('9 되살리기: 원본 첨부에 다시 붙음 · 있던 첨부·다른 칸 그대로',(d['projects/p1'].files||[]).some(f=>f.id==='xf_old')&&(d['projects/p1'].files||[]).some(f=>f.id==='xf_t1')&&d['projects/p1'].memo===before['projects/p1'].memo&&d['projects/p1'].costTotal===8765432,JSON.stringify(d['projects/p1'].files));
  ok('9·10 지워진 문서 0 (저장소 문서 수가 줄지 않음)',Object.keys(before).every(k=>k in d),Object.keys(before).filter(k=>!(k in d)).join(','));
  await A4.close();await W3.ctx.close()}
 console.log('메뉴',JSON.stringify(NAV));
 ok('오류·브라우저 대화상자 0',!errs.length,errs.slice(0,5).join(' | '));
 const fail=R.filter(r=>r[0]==='실패').length;console.log(`\n합계 ${R.length}건 · 통과 ${R.length-fail} · 실패 ${fail}`);
 fs.writeFileSync(OUT+'/perm1113_result.json',JSON.stringify(R,null,1));await b.close();process.exit(fail?1:0)})();
