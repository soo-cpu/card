// 프로젝트 기록 타임라인 시험 (v0.99-54 · 다음 지시 2026-11-28 v11 B): node intranet/tools/test/timeline_test.js [index.html]
// 가짜 저장소(mock.js) + 가짜 받아쓰기(dictation):
//  가) 날짜순 합치기: 메모·결정·사진·결재·확정본·일지가 한 카드에 최신 날짜부터 · 종류 필터 · 더 보기(처음 30줄) · 최근 결정 3개
//  나) 한 줄 메모·결정 저장: 대표·정진혁·이봄이·채진아 (엔터·버튼 · 연달아 눌러도 한 번 · 낡은 창 '저장'에도 안 사라짐)
//  다) 결재 줄 권한: 실무 팀은 본인이 올린 결재만(남의 결재 제목·금액 안 보임) · 급여 결재는 아무에게도 타임라인에 안 나옴 · 결재는 읽기만(저장 안 함)
//  라) 계약 금액·원가·마진·성과금 글자 없음 · v11TimelineToday 모양(대표 현황판 연결) · 390px 넘침 없음 · 말하기(받아쓰기)
if(!process.env.LANG&&!process.env.LC_ALL)process.env.LANG='C.UTF-8';
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'../../..');
const HTML=fs.readFileSync(process.argv[2]||path.join(ROOT,'intranet/index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
// 날짜는 시험을 돌리는 날(한국 시간) 기준
const NOW=Date.now(),iso=ms=>new Date(ms).toISOString(),kd=ms=>new Date(ms+9*36e5).toISOString().slice(0,10),T=kd(NOW),D=n=>kd(NOW+n*864e5),T0="2026-11-01T00:00:00Z",NOWI=iso(NOW-60000);
// 그날(한국 시간) 낮 12시의 ISO 시각 — 날짜 경계에 걸리지 않게
const noon=n=>iso(Date.parse(D(n)+"T03:00:00Z"));
const line=[{role:"검토",name:"채진아"},{role:"결재",name:"최윤수"},{role:"최종결재",name:"신혜현"}];
const ap=(by,title,x)=>Object.assign({kind:"기안품의서 (현장)",title,status:"결재 진행",step:1,pno:"P-2611-901",amount:120000,createdBy:by,createdAt:noon(-1),updatedAt:noon(-1),history:[],aline:line},x||{});
const many=Array.from({length:40},(_,i)=>({id:"m"+i,at:iso(Date.parse(D(-50+i)+"T03:00:00Z")),type:"메모",text:"옛 메모 "+(i+1),by:"u_bom",name:"이봄이"}));
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-kim":{name:"김일반",uid:"u_kim",state:"재직",pos:"사원"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},"members/u_kim":{active:true,staffId:"st-kim",name:"김일반"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},
 // p1: 옛 방식 기록(종류 '상담 기록' · id 없음) · 결정 1 · 오늘 사진 2장(정진혁) + 어제 사진 1장(이봄이) · 어제 퇴근 일지 · 계약 금액·성과금 칸(타임라인에 나오면 안 됨)
 "projects/p1":{no:"P-2611-901",title:"시험마을 8단지",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",cat:"주거",inq:"2026-11-01",work:"욕실",start:D(-10),files:[],
   plog:[{at:noon(-5),type:"상담 기록",text:"첫 상담 · 욕실 전체",by:"u_jjh",name:"정진혁"},{id:"pl-d0",at:noon(-3),type:"결정",text:"욕실 타일은 600각 무광으로",by:"u_boss",name:"최윤수"}],
   photos:[{id:"ph1",fid:"as_x1",name:"a.jpg",type:"image/jpeg",d:T,at:NOWI,by:"u_jjh",byName:"정진혁",from:"현장 일지",proc:"타일"},{id:"ph2",fid:"as_x2",name:"b.jpg",type:"image/jpeg",d:T,at:NOWI,by:"u_jjh",byName:"정진혁",from:"현장 일지"},{id:"ph3",fid:"as_x3",name:"c.jpg",type:"image/jpeg",d:D(-1),at:noon(-1),by:"u_bom",byName:"이봄이",from:"프로젝트"}],
   progLog:[{id:"vl1s0",at:noon(-1),by:"u_jjh",byName:"정진혁",kind:"퇴근 일지",d:D(-1),text:"방수 끝냄",vid:"vl1"},{id:"pg0",at:T0,by:"u_boss",byName:"최윤수",kind:"확인",proc:"철거",pct:100,src:"직접"}],updatedAt:T0,__at:T0},
 "ppriv/p1":{estCost:"20202020",updatedAt:T0},
 // p2: 메모 40줄 (더 보기) · p5: 김일반 담당 (다른 직원 프로젝트는 김일반에게 가려짐)
 "projects/p2":{no:"P-2609-902",title:"지난 현장 주방",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"이봄이",contractAmt:"12000000",cat:"주거",inq:"2026-09-01",work:"주방",files:[],plog:many,updatedAt:T0,__at:T0},
 "projects/p5":{no:"P-2611-905",title:"김일반 담당 현장",custName:"최다섯",stage:"시공",mgr:"김일반",contractAmt:"5000000",cat:"주거",inq:"2026-11-12",work:"도배",files:[],plog:[{id:"pl-k1",at:NOWI,type:"메모",text:"도배지 도착",by:"u_kim",name:"김일반"}],updatedAt:T0,__at:T0},
 "sites/s1":{pno:"P-2611-901",name:"시험마을 8단지",mgr:"정진혁",customer:"홍길동",status:"공사 중",logs:[{d:T,proc:"타일",people:2,text:"벽 타일 붙임"},{d:D(-4),proc:"철거",people:3,text:"욕실 철거"}],files:[],updatedAt:T0,__at:T0},
 // 결재: a1 정진혁(프로젝트 번호) · a2 채진아(여러 줄 — 이 프로젝트 줄 + 본사 줄) · a3 이봄이(번호 없이 현장명만) · a5 채진아 반려 · a4 다른 프로젝트 · s1 급여(본사 서류에 프로젝트 번호가 적힌 경우) · h1 본사
 "approvals/a1":ap("u_jjh","타일 대금 정진혁기안",{amount:1234567}),
 "approvals/a2":ap("u_cja","목공 대금 채진아기안",{status:"승인",step:3,amount:7655432,lines:[{pno:"P-2611-901",vendor:"한빛목공",amount:"7654321",use:"공사"},{pno:"본사",vendor:"문구점",amount:"1111",use:"일반관리"}],createdAt:noon(-2)}),
 "approvals/a3":ap("u_bom","현장명만 적은 결재 이봄이기안",{pno:"",ref:"시험마을 8단지",amount:2223334,createdAt:noon(-4)}),
 "approvals/a5":ap("u_cja","반려된 결재 채진아기안",{status:"반려",amount:999000,createdAt:noon(-6)}),
 "approvals/a4":ap("u_jjh","다른 현장 결재",{pno:"P-2609-902",amount:4445556}),
 "approvals/s1":{kind:"기안품의서 (본사)",title:"11월 급여총액 시험",status:"결재 진행",step:1,pno:"P-2611-901",amount:15151515,hqlines:[{item:"급여",vendor:"직원 급여",amount:15151515,due:T,memo:""}],createdBy:"u_cja",createdAt:noon(-1),updatedAt:noon(-1),history:[],aline:line},
 "approvals/h1":ap("u_jjh","본사 사무용품",{pno:"본사",amount:88000}),
 // 마감재·도면 확정본 (A): v1 올림(이봄이) → 확정(정진혁)
 "work/all/spec/p1__v1":{k:"ver",pid:"p1",pno:"P-2611-901",ver:1,items:[{part:"욕실",name:"타일",spec:"600각"}],files:[],note:"",at:noon(-2),by:"u_bom",byName:"이봄이"},
 "work/all/spec/sa1":{k:"act",pid:"p1",pno:"P-2611-901",act:"확정",ver:1,at:iso(Date.parse(noon(-2))+36e5),by:"u_jjh",byName:"정진혁"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false},kim:{id:"u_kim",name:"김일반",email:"kim@test",isOwner:false}};
const FAKEDICT=`(()=>{const H={p:[],f:[],s:[]};let st='idle';const set=(s,reason)=>{st=s;H.s.forEach(h=>h(reason?{state:s,reason}:{state:s}))};
window.__dict={mode:'ok',starts:0,stops:0,gesture:[],tail:'',lang:'',state:()=>st,say:(t,partial)=>{if(st!=='listening')return false;if(partial)H.p.forEach(h=>h({text:t}));else{H.p.forEach(h=>h({text:''}));H.f.forEach(h=>h({text:t}))}return true}};
window.__MOCKDICT={onPartial:h=>{H.p.push(h);return()=>{}},onFinal:h=>{H.f.push(h);return()=>{}},onState:h=>{H.s.push(h);return()=>{}},active:()=>st!=='idle',
 start:o=>{const D=window.__dict;D.starts++;D.lang=(o&&o.language)||'';const g=!!(navigator.userActivation&&navigator.userActivation.isActive);D.gesture.push(g);if(!g)return Promise.reject({code:'no_gesture',message:'x'});
  if(st==='listening')return Promise.resolve();set('starting');return new Promise((res,rej)=>setTimeout(()=>{if(D.mode==='deny'){set('idle','not_granted');rej({code:'not_granted',message:'x'})}else{set('listening');res()}},80))},
 stop:()=>{const D=window.__dict;D.stops++;if(st==='idle')return Promise.resolve();set('finishing');return new Promise(res=>setTimeout(()=>{if(D.tail){const t=D.tail;D.tail='';H.f.forEach(h=>h({text:t}))}set('idle','stopped');res()},60))}}})();`;
const MONEY=/원가|마진|성과금|33,000,000|33000000|12,000,000|20,202,020|20202020|순수 인테리어/; // 타임라인에 나오면 안 되는 글자 (계약 금액·실행 원가·성과금 구분)
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(typeof x==='string'?x:JSON.stringify(x)).replace(/\s+/g,' ').slice(0,420))};const wait=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{
 const b=await chromium.launch();const errs=[],dialogs=[],opens=[];
 const mkCtx=async(opt,seedObj)=>{const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul'},opt));
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|github\.io/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[seedObj||SEED,RULES]);
  const dbNow=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')||'{}'));
  const open=async(who,extra,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});p.on('popup',()=>opens.push(who));
   await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+(extra||'')+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  return {ctx,dbNow,open}};
 const openPj=async(P,id)=>{await P.evaluate(i=>window.__hfT.open('projects',i),id);await wait(1200)};
 const rows=P=>P.evaluate(()=>[...document.querySelectorAll('#tlDyn .tlday, #tlDyn .tlrow')].map(e=>e.classList.contains('tlday')?{day:e.textContent.trim()}:{k:e.dataset.tlk,t:e.querySelector('.tltx').textContent,w:(e.querySelector('.tlwho')||{}).textContent||'',lab:e.querySelector('.tlk').textContent}));
 const boxTxt=P=>P.evaluate(()=>((document.getElementById('tlBox')||{}).innerText||'')+'\n'+((document.getElementById('tlTop')||{}).innerText||''));
 const apIds=P=>P.evaluate(()=>window.__hfT.tlAps('p1').map(e=>e.ap).sort());
 const plogOf=(d,key)=>((d[key]||{}).plog||[]);
 const addLine=async(P,text,how)=>{await P.locator('#tlText').fill(text);if(how==='enter')await P.locator('#tlText').press('Enter');else await P.locator('#tlAddBtn').click();await wait(1500)};

 const {dbNow,open}=await mkCtx({viewport:{width:1280,height:900}});
 const A=await open('admin',FAKEDICT,12000);const before=await dbNow();
 ok('0 버전 v0.99-54 이상',await A.evaluate(()=>{const m=document.documentElement.innerHTML.match(/const APP_VER="v0\.99-(\d+)/);return !!m&&Number(m[1])>=54}));

 // ================= 가) 날짜순 합치기 (대표) =================
 await openPj(A,'p1');
 ok('가1 프로젝트 화면에 ‘기록 타임라인’ 카드 + 한 줄 입력칸·메모/결정 고르기·저장 버튼',await A.locator('#tlBox').isVisible()&&await A.locator('#tlText').isVisible()&&await A.locator('#tlBox [data-tlkind="memo"]').isVisible()&&await A.locator('#tlBox [data-tlkind="dec"]').isVisible()&&await A.locator('#tlAddBtn').isVisible());
 const ev=await A.evaluate(()=>window.__hfT.tlEvents('p1'));const kinds=[...new Set(ev.map(e=>e.kind))].sort();
 ok('가2 여섯 종류가 모두 모임 (메모·결정·사진·결재·확정본·일지)',JSON.stringify(kinds)===JSON.stringify(["ap","dec","log","memo","photo","spec"]),kinds);
 ok('가3 최신 날짜부터 (날짜 내림차순 · 같은 날은 늦은 시각부터)',ev.every((e,i)=>i===0||ev[i-1].d>e.d||(ev[i-1].d===e.d))&&ev[0].d===T&&ev[ev.length-1].d===D(-6),ev.map(e=>e.d.slice(5)+e.kind));
 let rw=await rows(A);const days=rw.filter(r=>r.day).map(r=>r.day);
 ok('가4 화면: 날짜별 묶음 머리글이 최신부터 · 오늘 표시',days.length>=5&&/오늘/.test(days[0])&&days.every((d,i)=>i===0||days[i-1].slice(0,10)>d.slice(0,10)),days);
 const txt=rw.filter(r=>r.k).map(r=>r.lab+'|'+r.t+'|'+r.w);
 ok('가5 사진은 같은 날·같은 사람 한 줄 (오늘 정진혁 2장 · 어제 이봄이 1장)',txt.some(x=>/^사진\|사진 2장 · 타일\|.*정진혁/.test(x))&&txt.some(x=>/^사진\|사진 1장\|.*이봄이/.test(x)),txt.filter(x=>/^사진/.test(x)));
 ok('가6 일지: 현장 일지(오늘·4일 전) + 퇴근 일지 줄',txt.some(x=>/^일지\|현장 일지 · 타일 · 벽 타일 붙임/.test(x))&&txt.some(x=>/^일지\|현장 일지 · 철거 · 욕실 철거/.test(x))&&txt.some(x=>/^일지\|퇴근 일지 · 방수 끝냄\|.*정진혁/.test(x)),txt.filter(x=>/^일지/.test(x)));
 ok('가7 확정본: 올림·확정 이력 (A 의 v11SpecEvents)',txt.some(x=>/^확정본\|마감재·도면 v1 올림/.test(x))&&txt.some(x=>/^확정본\|마감재·도면 확정 v1\|.*정진혁/.test(x)),txt.filter(x=>/^확정본/.test(x)));
 ok('가8 옛 방식 기록(종류 ‘상담 기록’)도 메모로 보임 · 진행률 확인 줄은 안 섞임',txt.some(x=>/^메모\|\[상담 기록\] 첫 상담 · 욕실 전체\|.*정진혁/.test(x))&&!txt.some(x=>/철거 100|pct/.test(x)),txt.filter(x=>/^메모/.test(x)));
 const dec=await A.evaluate(()=>{const e=document.querySelector('#tlDyn .tlrow.k-dec .tltx');const cs=e&&getComputedStyle(e),bg=e&&getComputedStyle(e.closest('.tlrow')).backgroundColor;return e?{t:e.textContent,w:cs.fontWeight,bg}:null});
 ok('가9 결정사항은 굵게·색 바탕',!!dec&&dec.t==='욕실 타일은 600각 무광으로'&&Number(dec.w)>=700&&dec.bg!=='rgba(0, 0, 0, 0)',dec);
 const top=await A.locator('#tlTop').innerText();
 ok('가10 프로젝트 위쪽 ‘최근 결정’ 요약',/최근 결정/.test(top)&&/욕실 타일은 600각 무광으로/.test(top)&&/최윤수/.test(top),top);
 ok('가11 옛 ‘프로젝트 기록 (시간순)’ 입력칸은 타임라인으로 옮겨져 없음 (입력칸 하나만)',await A.locator('#plogText').count()===0&&await A.locator('#tlText').count()===1);
 // 결재 줄
 const apA=txt.filter(x=>/^결재/.test(x));
 ok('가12 대표: 이 프로젝트 결재 4건 (번호 a1 · 여러 줄 가운데 이 프로젝트 줄 a2 · 현장명만 a3 · 반려 a5) — 제목 · 금액 · 상태',JSON.stringify(await apIds(A))===JSON.stringify(["a1","a2","a3","a5"])&&apA.some(x=>x.includes('타일 대금 정진혁기안 · 1,234,567원 · 결재 진행')&&/정진혁$/.test(x))&&apA.some(x=>x.includes('목공 대금 채진아기안 · 7,654,321원 · 승인'))&&apA.some(x=>x.includes('현장명만 적은 결재 이봄이기안 · 2,223,334원'))&&apA.some(x=>x.includes('반려된 결재 채진아기안 · 999,000원 · 반려')),apA);
 ok('가13 여러 줄 결재는 이 프로젝트 줄 금액만 (본사 줄 1,111원은 안 더함) · 다른 프로젝트·본사·급여 결재는 안 나옴',!apA.some(x=>/7,655,432|다른 현장|본사 사무용품|급여|15,151,515|4,445,556/.test(x)),apA);
 ok('가14 사후 원가와 같은 연결 함수(apPjOf): 번호·현장명 → p1, 본사 → 없음',await A.evaluate(()=>{const T=window.__hfT;return T.apPjOf({pno:"P-2611-901"})==="p1"&&T.apPjOf({pno:"",ref:"시험마을 8단지"})==="p1"&&T.apPjOf({pno:"본사"})===null&&T.apPjOf({pno:"",ref:"없는현장"})===null}));
 // 필터
 await A.locator('#tlBox [data-tlf="ap"]').click();await wait(300);rw=await rows(A);
 ok('가15 종류 필터 ‘결재’: 결재 줄만 4줄 · 합계 안내(반려 뺌)',rw.filter(r=>r.k).length===4&&rw.filter(r=>r.k).every(r=>r.k==='ap')&&/내가 볼 수 있는 결재 4건 · 반려 뺀 합계 11,112,222원/.test(await A.locator('#tlApSum').innerText()),await A.locator('#tlApSum').innerText().catch(()=>''));
 await A.locator('#tlDyn .tlrow.k-ap').first().click();await wait(1200);
 ok('가16 결재 줄을 누르면 그 결재 서류가 열림',await A.evaluate(()=>{const s=window.__hfT.sheet();return !!s&&s.col==='approvals'}),await A.evaluate(()=>window.__hfT.sheet()));
 // 더 보기 (p2 메모 40줄)
 await openPj(A,'p2');rw=await rows(A);const more=await A.locator('#tlBox [data-tlmore]').innerText().catch(()=>'');
 ok('가17 처음 30줄 + ‘더 보기 (남은 11줄)’ (메모 40 + 결재 1)',rw.filter(r=>r.k).length===30&&/더 보기 \(남은 11줄\)/.test(more)&&rw.filter(r=>r.k==='memo')[0].t==='옛 메모 40',[rw.filter(r=>r.k).length,more]);
 await A.locator('#tlBox [data-tlmore]').click();await wait(300);rw=await rows(A);
 ok('가18 더 보기를 누르면 41줄 모두 · 버튼 사라짐',rw.filter(r=>r.k).length===41&&await A.locator('#tlBox [data-tlmore]').count()===0,rw.filter(r=>r.k).length);

 // ================= 나) 한 줄 메모·결정 저장 =================
 await openPj(A,'p1');
 await addLine(A,'대표 메모 한 줄','enter');let d=await dbNow();
 let pl=plogOf(d,'projects/p1').filter(x=>x.text==='대표 메모 한 줄');
 ok('나1 대표: 엔터로 바로 저장 (창 ‘저장’ 안 눌러도 projects/p1 plog 에 한 줄 · 종류 메모 · 이름 · id)',pl.length===1&&pl[0].type==='메모'&&pl[0].name==='최윤수'&&pl[0].by==='u_boss'&&/^pl/.test(pl[0].id)&&!!pl[0].at,pl);
 ok('나2 저장 뒤 입력칸 비워지고 타임라인에 바로 보임 (‘결재’만 걸러 보던 중이었어도 전체로 돌아가 보임)',await A.locator('#tlBox [data-tlf="all"]').getAttribute('aria-pressed')==='true'&&await A.locator('#tlText').inputValue()===''&&(await rows(A)).filter(r=>r.k).some(r=>r.t==='대표 메모 한 줄'&&/최윤수/.test(r.w)));
 // 연달아 누르기
 await A.locator('#tlText').fill('두 번 누른 메모');await A.evaluate(()=>{const b=document.getElementById('tlAddBtn');b.click();b.click();document.getElementById('tlText').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))});await wait(1800);d=await dbNow();
 ok('나3 연달아 눌러도 한 번만 저장',plogOf(d,'projects/p1').filter(x=>x.text==='두 번 누른 메모').length===1,plogOf(d,'projects/p1').length);
 await A.locator('#tlText').fill('   ');await A.locator('#tlAddBtn').click();await wait(500);const n0=plogOf(await dbNow(),'projects/p1').length;
 ok('나4 빈 칸은 저장 안 함',n0===plogOf(d,'projects/p1').length);
 await A.evaluate(()=>{const i=document.getElementById('tlText');i.value='조합 중';i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,isComposing:true}))});await wait(800);
 ok('나5 한글 조합 중 엔터는 저장 안 함',plogOf(await dbNow(),'projects/p1').length===n0&&await A.locator('#tlText').inputValue()==='조합 중');
 // 결정
 await A.locator('#tlBox [data-tlkind="dec"]').click();await addLine(A,'주방 상판은 흰색으로 확정','btn');d=await dbNow();
 pl=plogOf(d,'projects/p1').filter(x=>x.text==='주방 상판은 흰색으로 확정');
 ok('나6 결정: 종류 ‘결정’으로 저장 · 굵은 줄 · 위쪽 ‘최근 결정’ 맨 앞',pl.length===1&&pl[0].type==='결정'&&await A.evaluate(()=>[...document.querySelectorAll('#tlDyn .tlrow.k-dec .tltx')].some(e=>e.textContent==='주방 상판은 흰색으로 확정'))&&/주방 상판은 흰색으로 확정[\s\S]*욕실 타일은 600각/.test(await A.locator('#tlTop').innerText()),await A.locator('#tlTop').innerText());
 // 낡은 창 '저장': 타임라인에 적은 뒤 프로젝트 창의 저장을 눌러도 줄이 안 사라지고 안 겹침
 const nA=plogOf(d,'projects/p1').length;await A.locator('#saveSheet').click();await wait(2500);d=await dbNow();
 ok('나7 그 뒤 프로젝트 창 ‘저장’을 눌러도 기록이 그대로 (사라짐·겹침 없음 · 옛 줄 포함)',plogOf(d,'projects/p1').length===nA&&plogOf(d,'projects/p1').some(x=>x.text==='첫 상담 · 욕실 전체')&&new Set(plogOf(d,'projects/p1').map(x=>x.id||x.text)).size===nA,[nA,plogOf(d,'projects/p1').length]);

 // 직원 3명
 const staffRun=async(who,uid,name,textMemo)=>{const P=await open(who,FAKEDICT);await openPj(P,'p1');
  const vis=await P.locator('#tlBox').isVisible().catch(()=>false);await addLine(P,textMemo,who==='bom'?'btn':'enter');const dd=await dbNow();
  const mine=plogOf(dd,'mine/'+uid+'/projects/p1').filter(x=>x.text===textMemo),wk=plogOf(dd,'work/all/projects/p1').filter(x=>x.text===textMemo);
  ok('나8 '+name+': 카드가 보이고 한 줄 저장 → 본인 사본·공용 칸에 한 줄 (이름 '+name+')',vis&&mine.length===1&&wk.length===1&&mine[0].name===name&&mine[0].by===uid&&mine[0].type==='메모',[vis,mine.length,wk.length]);
  ok('나9 '+name+': 화면에 바로 보임 · 앞서 남긴 대표 메모·결정도 같이 보임',await P.evaluate(t=>{const L=[...document.querySelectorAll('#tlDyn .tltx')].map(e=>e.textContent);return L.includes(t)&&L.includes('대표 메모 한 줄')&&L.includes('주방 상판은 흰색으로 확정')},textMemo));
  return P};
 const J=await staffRun('jjh','u_jjh','정진혁','정진혁 현장 메모');
 const Bm=await staffRun('bom','u_bom','이봄이','이봄이 현장 메모');
 const C=await staffRun('cja','u_cja','채진아','채진아 확인 메모');
 await wait(6000);d=await dbNow();const all=plogOf(d,'projects/p1').map(x=>x.text);
 ok('나10 대표 화면이 직원 줄을 원본에 합침: 네 사람 메모가 모두 원본 projects/p1 에 (각 한 번)',['대표 메모 한 줄','정진혁 현장 메모','이봄이 현장 메모','채진아 확인 메모'].every(t=>all.filter(x=>x===t).length===1)&&all.includes('첫 상담 · 욕실 전체')&&all.includes('욕실 타일은 600각 무광으로'),all);
 ok('나10-1 프로젝트 창 ‘저장’ 뒤 창이 닫혔음 (다시 열어 봄)',await A.locator('#tlBox').count()===0);await openPj(A,'p1');
 ok('나11 대표 화면 타임라인에도 직원 메모가 보임',await A.evaluate(()=>{const L=[...document.querySelectorAll('#tlDyn .tltx')].map(e=>e.textContent);return ['정진혁 현장 메모','이봄이 현장 메모','채진아 확인 메모'].every(t=>L.includes(t))}));

 // ================= 다) 결재 줄 권한 =================
 ok('다0 네 화면 모두 타임라인이 열려 있음',(await Promise.all([A,J,Bm,C].map(P=>P.locator('#tlBox').isVisible()))).every(Boolean));
 const tJ=await boxTxt(J),tB=await boxTxt(Bm),tC=await boxTxt(C),tA=await boxTxt(A);
 ok('다1 정진혁(실무 팀): 본인이 올린 결재 a1 만 · 금액 보임',JSON.stringify(await apIds(J))==='["a1"]'&&/타일 대금 정진혁기안 · 1,234,567원/.test(tJ),await apIds(J));
 ok('다2 정진혁: 남의 결재 제목·금액 안 보임 (채진아·이봄이 기안 · 급여)',!/채진아기안|이봄이기안|7,654,321|2,223,334|999,000|급여|15,151,515/.test(tJ));
 ok('다3 이봄이(실무 팀): 본인이 올린 결재 a3 만 (현장명 연결) · 남의 것 안 보임',JSON.stringify(await apIds(Bm))==='["a3"]'&&/현장명만 적은 결재 이봄이기안 · 2,223,334원/.test(tB)&&!/정진혁기안|채진아기안|1,234,567|7,654,321|999,000|급여|15,151,515/.test(tB),await apIds(Bm));
 ok('다4 채진아(전체 담당): 이 프로젝트 결재 4건 모두',JSON.stringify(await apIds(C))==='["a1","a2","a3","a5"]'&&/7,654,321원/.test(tC)&&/1,234,567원/.test(tC),await apIds(C));
 ok('다5 급여 결재(본사 서류)는 대표·채진아 타임라인에도 안 나옴',!/급여|15,151,515/.test(tA)&&!/급여|15,151,515/.test(tC));
 ok('다6 정진혁 타임라인의 결재 줄은 1줄뿐 (종류 필터 숫자도 1)',await J.evaluate(()=>window.__hfT.tlEvents('p1').filter(e=>e.kind==='ap').length===1&&/결재 1$/.test(document.querySelector('#tlBox [data-tlf="ap"]').textContent.trim())));
 d=await dbNow();const apKeys=o=>Object.keys(o).filter(k=>k.startsWith('approvals/')).sort();
 ok('다7 결재는 읽기만: 결재 문서 7건 글자 하나 안 바뀜 · 새 결재 문서 없음',JSON.stringify(apKeys(d))===JSON.stringify(apKeys(before))&&apKeys(d).every(k=>JSON.stringify(d[k])===JSON.stringify(before[k])));
 const newKeys=Object.keys(d).filter(k=>!(k in before));
 ok('다8 새 저장 칸 없음: 새로 생긴 문서는 직원 사본·공용 칸의 프로젝트 줄·열람 기록뿐 (타임라인 전용 칸 없음)',newKeys.every(k=>/^(mine\/u_\w+\/projects\/|work\/all\/(projects|customers|quotes|sites|reports)\/|work\/all\/gone|knock\/|access\/|acct\/|activity\/|config\/|devok\/|cshare\/|creq\/|fin\/goalact$)/.test(k)),newKeys.filter(k=>!/^(mine\/|work\/|knock\/|access\/|acct\/|activity\/|config\/|devok\/)/.test(k)));
 const p1=d['projects/p1'];
 ok('다9 프로젝트 줄에 결재·사진 사본을 따로 만들지 않음 (plog 에는 메모·결정만 · 사진 3장 그대로)',plogOf(d,'projects/p1').every(x=>['메모','결정','상담 기록'].includes(x.type))&&(p1.photos||[]).length===3&&!('timeline' in p1)&&!('tl' in p1),Object.keys(p1));

 // ================= 라) 돈 글자 · 오늘 함수 · 휴대폰 · 말하기 =================
 ok('라1 타임라인·최근 결정에 계약 금액·원가·마진·성과금 글자 없음 (대표·정진혁·이봄이·채진아)',[tA,tJ,tB,tC].every(t=>!MONEY.test(t)),[tA,tJ,tB,tC].map(t=>(t.match(MONEY)||[''])[0]));
 const shape=L=>Array.isArray(L)&&L.every(e=>e&&['pid','name','t','kind','text','who'].every(k=>typeof e[k]==='string')&&['사진','메모','결정','일지'].includes(e.kind));
 const tdA=await A.evaluate(()=>window.v11TimelineToday());
 ok('라2 v11TimelineToday(): [{pid,name,t,kind,text,who}] 모양 · 종류는 사진·메모·결정·일지뿐 (결재·확정본·금액 없음)',shape(tdA)&&tdA.length>0&&!tdA.some(e=>/원|결재/.test(e.kind))&&!MONEY.test(JSON.stringify(tdA))&&!/1,234,567|기안/.test(JSON.stringify(tdA)),tdA.map(e=>e.kind+':'+e.text));
 const p1T=tdA.filter(e=>e.pid==='p1');
 ok('라3 오늘 것만: p1 사진 한 줄(2장 · n=2) · 오늘 메모·결정 · 오늘 현장 일지 — 어제 사진·옛 메모는 없음',p1T.filter(e=>e.kind==='사진').length===1&&p1T.find(e=>e.kind==='사진').n===2&&p1T.find(e=>e.kind==='사진').who==='정진혁'&&p1T.some(e=>e.kind==='결정'&&e.text==='주방 상판은 흰색으로 확정')&&p1T.some(e=>e.kind==='메모'&&e.text==='정진혁 현장 메모'&&e.who==='정진혁')&&p1T.some(e=>e.kind==='일지'&&/벽 타일 붙임/.test(e.text))&&!p1T.some(e=>/첫 상담|욕실 타일은 600각|방수 끝냄|욕실 철거/.test(e.text))&&p1T.every(e=>e.name==='시험마을 8단지'),p1T.map(e=>e.kind+':'+e.text+':'+e.n));
 ok('라3-1 t 는 ISO 시각 · 시각을 모르는 현장 일지는 빈 글자 (현황판이 엉뚱한 시각을 적지 않게)',p1T.filter(e=>e.kind!=='일지').every(e=>/^\d{4}-\d\d-\d\dT/.test(e.t))&&p1T.find(e=>e.kind==='일지').t==='',p1T.map(e=>e.t));
 ok('라4 대표: 다른 프로젝트 오늘 메모도 들어옴 (p5 김일반) · p2 옛 메모는 없음',tdA.some(e=>e.pid==='p5'&&e.text==='도배지 도착')&&!tdA.some(e=>e.pid==='p2'));
 const K=await open('kim','');const tdK=await K.evaluate(()=>window.v11TimelineToday());
 ok('라5 일반 직원(김일반): 본인이 볼 수 있는 프로젝트 것만 (p5) — 가려진 p1 은 없음',shape(tdK)&&tdK.length>0&&tdK.every(e=>e.pid==='p5'),tdK.map(e=>e.pid+':'+e.text));
 await openPj(K,'p1');
 ok('라6 김일반: 가려진 프로젝트(p1)에는 타임라인·최근 결정이 아예 없음',await K.locator('#tlBox').count()===0&&await K.locator('#tlTop').count()===0&&!/주방 상판은 흰색|대표 메모 한 줄|타일 대금/.test(await K.evaluate(()=>document.body.innerText)));
 // 대표 현황판(E)이 이 함수를 씀
 const snap=await A.evaluate(()=>window.__hfT.ceoCount());
 ok('라7 대표 현황판(E): 오늘 사진과 메모가 타임라인에서 옴 (tlSrc B · 주거 사진 2장 · 메모 줄 수 = 사진 아닌 오늘 줄)',snap.tlSrc==='B'&&snap.parts.res.tl.photo===2&&snap.parts.res.tl.memo===tdA.filter(e=>e.kind!=='사진').length,[snap.tlSrc,snap.parts.res.tl.photo,snap.parts.res.tl.memo,tdA.filter(e=>e.kind!=='사진').length]);
 // 말하기 (받아쓰기 있음)
 ok('라8 받아쓰기가 있으면 ‘말하기’ 버튼이 보임',await J.locator('#tlMic').isVisible());
 await J.locator('#tlMic').click();await wait(400);
 const v1=await J.evaluate(()=>({st:window.__dict.state(),starts:window.__dict.starts,g:window.__dict.gesture,lang:window.__dict.lang,mic:document.getElementById('tlMic').textContent}));
 ok('라9 말하기: 누른 그 자리에서 바로 start (손짓 안 · 한국어) → ‘멈추기’',v1.st==='listening'&&v1.starts===1&&v1.g[0]===true&&v1.lang==='ko-KR'&&v1.mic==='멈추기',v1);
 await J.evaluate(()=>window.__dict.say('타일 색',true));await wait(100);const part=await J.locator('#tlPart').innerText();
 await J.evaluate(()=>window.__dict.say(' 타일 색 고객이 다시 고르기로 함'));await wait(100);
 ok('라10 말하는 동안 임시 글 → 확정된 글이 입력칸에 (아직 저장 안 됨)',part==='타일 색'&&await J.locator('#tlText').inputValue()==='타일 색 고객이 다시 고르기로 함'&&!plogOf(await dbNow(),'mine/u_jjh/projects/p1').some(x=>/다시 고르기로/.test(x.text)));
 await J.locator('#tlMic').click();await wait(400);
 ok('라11 멈추기 → 다시 ‘말하기’',await J.evaluate(()=>window.__dict.state()==='idle'&&document.getElementById('tlMic').textContent==='말하기'&&window.__hfT.tlv().on===false));
 await J.locator('#tlText').press('Enter');await wait(1500);
 ok('라12 말한 글을 엔터로 저장',plogOf(await dbNow(),'mine/u_jjh/projects/p1').filter(x=>x.text==='타일 색 고객이 다시 고르기로 함').length===1);
 // 받아쓰기 뒤에도 퇴근 일지 말하기가 그대로 됨 (같은 손잡이를 같이 씀)
 await J.evaluate(()=>{window.__hfT.close&&window.__hfT.close()});await J.evaluate(()=>{const c=document.getElementById('closeSheet');c&&c.click()});await wait(600);
 await J.evaluate(()=>window.__hfT.vlOpen());await wait(900);await J.locator('#vlMic').click();await wait(400);await J.evaluate(()=>window.__dict.say(' 퇴근 일지 말'));await wait(150);
 ok('라13 퇴근 일지 말하기는 예전대로 (타임라인이 듣는 중이 아니면 퇴근 일지 창으로 감)',await J.locator('#vlText').inputValue()==='퇴근 일지 말',await J.locator('#vlText').inputValue().catch(()=>'-'));
 await J.locator('#vlMic').click();await wait(300);
 // 받아쓰기 거절
 await Bm.evaluate(()=>{window.__dict.mode='deny'});await Bm.locator('#tlMic').click();await wait(500);
 ok('라14 마이크 거절: 버튼이 사라지고 글로 쓰기는 그대로',await Bm.locator('#tlMic').isHidden()&&await Bm.locator('#tlText').isEnabled()&&await Bm.evaluate(()=>window.__hfT.vlDenied()===true));
 // 받아쓰기 없음 (null) + 휴대폰 390px
 {const {open:openM,dbNow:dbM}=await mkCtx({viewport:{width:390,height:800},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const AM=await openM('admin','',12000);const JM=await openM('jjh','');await openPj(JM,'p1');
  ok('라15 받아쓰기가 없으면 ‘말하기’ 버튼 없음 · 입력칸·저장은 있음',await JM.locator('#tlMic').isHidden()&&await JM.locator('#tlText').isVisible()&&await JM.locator('#tlAddBtn').isVisible());
  await JM.locator('#tlTop [data-tlgo]').tap();await wait(600);
  ok('라16 위쪽 ‘메모·결정 쓰기’를 누르면 입력칸으로 감',await JM.evaluate(()=>{const r=document.getElementById('tlText').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&document.activeElement&&document.activeElement.id==='tlText'}));
  const m=await JM.evaluate(()=>{const sh=document.querySelector('#veil .sheet'),bx=document.getElementById('tlBox'),r=bx.getBoundingClientRect();const small=[...bx.querySelectorAll('button:not([hidden]),input'),...document.querySelectorAll('#tlTop button')].filter(e=>e.offsetParent&&!e.classList.contains('tlrow')).map(e=>({t:(e.textContent||e.id).trim().slice(0,12),h:Math.round(e.getBoundingClientRect().height)})).filter(x=>x.h<44);
   const over=[...bx.querySelectorAll('*'),...document.querySelectorAll('#tlTop, #tlTop *')].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>innerWidth+1).length;
   return {docW:document.documentElement.scrollWidth,iw:innerWidth,shW:sh.scrollWidth,shC:sh.clientWidth,left:Math.round(r.left),right:Math.round(r.right),small,over}});
  ok('라17 390px: 가로 넘침 없음 (문서·창·카드 안 모든 것)',m.docW<=m.iw+1&&m.shW<=m.shC+1&&m.right<=m.iw+1&&m.left>=0&&m.over===0,m);
  ok('라18 390px: 버튼·입력칸 높이 44px 이상',m.small.length===0,m.small);
  await JM.locator('#tlText').fill('폰에서 쓴 한 줄 메모인데 조금 길게 적어서 줄이 넘어가도 화면 밖으로 나가지 않는지 봅니다 ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ');await JM.locator('#tlAddBtn').tap();await wait(1800);
  const m2=await JM.evaluate(()=>({shW:document.querySelector('#veil .sheet').scrollWidth,shC:document.querySelector('#veil .sheet').clientWidth,has:[...document.querySelectorAll('#tlDyn .tltx')].some(e=>/폰에서 쓴 한 줄 메모/.test(e.textContent))}));
  ok('라19 390px: 폰에서 저장 · 긴 글도 넘치지 않음',m2.has&&m2.shW<=m2.shC+1&&plogOf(await dbM(),'mine/u_jjh/projects/p1').filter(x=>/^폰에서 쓴 한 줄 메모/.test(x.text)).length===1,m2);
  if(process.env.OUT)await JM.screenshot({path:path.join(process.env.OUT,'timeline_390.png')}).catch(()=>{})}
 if(process.env.OUT){await A.evaluate(()=>{const b=document.getElementById('tlBox');b&&b.scrollIntoView()});await A.screenshot({path:path.join(process.env.OUT,'timeline_pc.png')}).catch(()=>{})}

 ok('마1 화면 오류 없음',errs.length===0,errs.slice(0,5));
 ok('마2 alert·confirm·prompt·새 창 없음',dialogs.length===0&&opens.length===0,[dialogs,opens]);
 await b.close();const f=R.filter(x=>!x).length;console.log(`\n결과: 통과 ${R.length-f} / 실패 ${f} (모두 ${R.length})`);process.exit(f?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
