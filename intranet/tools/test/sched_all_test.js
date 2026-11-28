// 현장 일정 시험 (v0.99-55 C · 다음 지시 2026-11-28 v11 C 전체 현장 일정 한 화면): node intranet/tools/test/sched_all_test.js [index.html]
// 공정표(sched)에서 자동으로 그려짐(따로 입력 없음) · 담당자·파트 필터 · 주간 막대/한 달 달력 전환 · 늦은 공정 표시(대표 현황판과 같은 판정) ·
// 390px·1280px 같은 막대 화면 · 페이지 가로 넘침 없음 · 확대/축소(버튼·두 손가락) · 직원별로 볼 수 있는 프로젝트만 · 금액 글자 없음 · 저장 요청 0(읽기 전용)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../../index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
// 날짜는 시험을 돌리는 날(한국 시간) 기준
const NOW=Date.now(),iso=ms=>new Date(ms).toISOString(),kd=ms=>new Date(ms+9*36e5).toISOString().slice(0,10),T=kd(NOW),D=n=>kd(NOW+n*864e5),T0="2026-11-01T00:00:00Z";
const pg=(proc,pct,i)=>({id:"pg"+i,kind:"확인",proc,pct,at:iso(NOW-864e5),by:"u_jjh",byName:"정진혁"});
const pj=(no,title,stage,mgr,cat,sched,x)=>Object.assign({no,title,custName:"고객"+no.slice(-3),stage,mgr,cat,contractAmt:"33000000",inq:"2026-11-01",files:[],sched,updatedAt:T0,__at:T0},x||{});
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "staff/st_kim":{name:"김담당",uid:"u_kim",level:"일반",scope:"담당 건만",state:"재직",pos:"사원"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},"members/u_kim":{active:true,staffId:"st_kim",name:"김담당"},
 // p1 주거·시공·정진혁(현장 담당은 이봄이): 철거 끝(100%) · 목공 3일 늦음 · 오늘 타일
 "projects/p1":pj("P-2611-901","한빛아파트 욕실","시공","정진혁","주거",[{proc:"철거",start:D(-10),end:D(-8)},{proc:"목공",start:D(-5),end:D(-3)},{proc:"타일",start:D(-1),end:D(1)}],{progLog:[pg("철거",100,1),pg("타일",40,2)],pays:[{step:"계약금",amt:"3300000",due:D(-20),paid:D(-20)}]}),
 "projects/p2":pj("P-2611-902","푸른빌라 주방","견적","이봄이","주거",undefined),                                  // 공정표 없음
 "projects/p3":pj("P-2609-903","지난집 전체","준공","정진혁","주거",[{proc:"도배",start:D(-6),end:D(-4)}]),         // 끝난 현장: 기본은 안 보임 · 늦음 아님
 "projects/p4":pj("P-2611-904","교문초등학교 도서관","시공","이봄이","관공서·학교",[{proc:"전기",start:D(-4),end:D(-2)},{proc:"도장",start:D(3),end:D(6)}],{contractAmt:"110000000"}), // 전기 늦음
 "projects/p5":pj("P-2611-905","시청 민원실","계약","정진혁","관공서·학교",[{proc:"철거",start:D(60),end:D(62)}]),   // 먼 앞날: 기간 밖
 "projects/p6":pj("P-2611-906","김담당 현장","시공","김담당","주거",[{proc:"설비",start:D(0),end:D(2)}]),
 "projects/p7":pj("P-2611-907","가람빌 주방","시공","정진혁","주거",[{proc:"가구",start:D(0),end:D(1)}]),
 "projects/p8":pj("P-2611-908","다온집 거실","시공","이봄이","주거",[{proc:"조명",start:D(0),end:D(0)}]),
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1],stage:"1-상담영업",updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0}, // 고객이 한 줄은 있어야 대표 화면이 직원 사본(공용 작업 칸)을 맞춤
 "sites/s1":{pno:"P-2611-901",name:"한빛아파트 욕실",mgr:"이봄이",customer:"홍길동",status:"공사 중",amt:"33000000",logs:[],files:[],updatedAt:T0,__at:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false},kim:{id:"u_kim",name:"김담당",email:"kim@test",isOwner:false}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?"통과":"실패",n,v?"":(x===undefined?"":String(typeof x==="string"?x:JSON.stringify(x)).slice(0,500)))};
const MONEY=/\d[\d,]*\s*(원|만원|억)|33,000,000|110,000,000|33000000|계약 금액|원가|마진|성과금/;
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 async function world(vp){const mob=!!(vp&&vp.width<500);const ctx=await b.newContext({timezoneId:'Asia/Seoul',viewport:vp||{width:1280,height:900},isMobile:mob,hasTouch:mob});
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const RAW=()=>seed.evaluate(()=>localStorage.getItem('mockdb'));
  async function open(who,ms){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type()+' '+d.message().slice(0,40));d.dismiss()});
   await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};window.__MOCKEXACT=true;`+MOCK);await p.goto('http://hf.test/');await wait(ms||8000);return p}
  return {ctx,RAW,open}}
 const go=async(p,h,ms)=>{await p.evaluate(x=>{location.hash=x},h);await wait(ms||900)};
 const navs=p=>p.evaluate(()=>[...document.querySelectorAll('#nav a')].map(a=>a.getAttribute('href')));
 const rows=p=>p.evaluate(()=>[...document.querySelectorAll('#saScroll .sa-row[data-sarow]')].map(e=>e.dataset.sarow));
 const pick=async(p,k,v)=>{await p.selectOption(`[data-saf="${k}"]`,v);await wait(350)};
 const bars=(p,id)=>p.evaluate(id=>[...document.querySelectorAll(`.sa-row[data-sarow="${id}"] .sa-bar`)].map(e=>({t:e.innerText.trim(),late:e.classList.contains('late'),done:e.classList.contains('done'),w:e.style.width,proc:e.dataset.proc})),id);
 const geo=p=>p.evaluate(()=>{const sc=document.getElementById('saScroll'),r=sc.getBoundingClientRect();return {sw:document.documentElement.scrollWidth,iw:innerWidth,boxR:Math.round(r.right),boxL:Math.round(r.left),boxSW:sc.scrollWidth,boxCW:sc.clientWidth,gantt:!!sc.querySelector('.sa-gantt'),rows:sc.querySelectorAll('.sa-row[data-sarow]').length,bars:sc.querySelectorAll('.sa-bar').length,hd:sc.querySelectorAll('.sa-ds span').length,z:document.getElementById('saZoom').style.zoom,zl:document.getElementById('saZl').innerText.trim(),sticky:getComputedStyle(sc.querySelector('.sa-row[data-sarow] .sa-name')).position}});
 const sheetId=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+"|"+s.id:null});
 const viewText=p=>p.evaluate(()=>document.getElementById('view').innerText);

 // ───────── 1. 대표 · PC 1280 ─────────
 const W=await world();const A=await W.open('admin',15000);
 let n=await navs(A);ok('1 메뉴에 현장 일정 (메뉴만 따로 다시 그려진 뒤에도 남아 있음)',n.includes('#schedall'),n.slice(0,5));
 await go(A,'#schedall',1200);const before=await W.RAW();n=await navs(A);ok('1 메뉴 자리: 홈 · 공용 캘린더 바로 다음에 현장 일정 · 지금 메뉴로 표시',n.indexOf('#calendar')===n.indexOf('#home')+1&&n.indexOf('#schedall')===n.indexOf('#calendar')+1&&await A.evaluate(()=>document.querySelector('#nav a[href="#schedall"]').getAttribute('aria-current')==='page'),n.slice(0,5));
 ok('1 화면 제목 · 주간 막대가 기본',await A.evaluate(()=>document.querySelector('#view h1').innerText==='현장 일정'&&document.getElementById('saScroll').dataset.view==='week'&&document.querySelector('[data-saf="weeks"]').value==='4'));
 let r=await rows(A);ok('1 공정표에서 자동으로: 공정표가 있는 진행 중 현장 6곳(시작 빠른 순) · 준공 현장(p3)·공정표 없는 현장(p2)은 막대에 없음',JSON.stringify(r)===JSON.stringify(['p1','p4','p6','p7','p8','p5']),r);
 ok('1 입력 칸 없음(읽기 전용): 일정 상자 안에 input·textarea 0',await A.evaluate(()=>document.querySelectorAll('#saScroll input,#saScroll textarea,#saScroll select').length)===0);
 let b1=await bars(A,'p1');ok('1 p1 막대: 목공(늦음·빨간 테두리) · 타일 40% (3일 = 88px)',b1.some(x=>x.proc==='목공'&&x.late&&/^! 목공/.test(x.t))&&b1.some(x=>x.proc==='타일'&&!x.late&&x.t==='타일 40%'&&x.w==='88px'),b1);
 let b4=await bars(A,'p4');ok('1 p4 막대: 전기 늦음 · 도장은 앞날이라 늦음 아님',b4.length===2&&b4.find(x=>x.proc==='전기').late&&!b4.find(x=>x.proc==='도장').late,b4);
 ok('1 늦은 공정 빨간 테두리(화면 계산값) · 요약 줄 ‘늦은 공정 2개’ · 현장 이름 옆 ‘늦음 1’',await A.evaluate(()=>{const e=document.querySelector('.sa-bar.late');const c=getComputedStyle(e);return c.borderTopColor==='rgb(213, 0, 0)'&&c.borderTopWidth==='2px'&&/늦은 공정 2개/.test(document.querySelector('.sa-sum').innerText)&&/늦음 1/.test(document.querySelector('.sa-row[data-sarow="p1"] .sa-name').innerText)}));
 ok('1 오늘 세로줄 · 오늘 날짜 칸 표시',await A.evaluate(()=>document.querySelectorAll('.sa-row[data-sarow="p1"] .sa-now').length===1&&document.querySelectorAll('.sa-ds span.td').length===1));
 ok('1 기간 밖 현장(p5): ‘이 기간에 공정 없음’ 줄',await A.evaluate(()=>{const e=document.querySelector('.sa-row[data-sarow="p5"] .sa-out');return !!e&&/이 기간에 공정 없음/.test(e.innerText)&&!document.querySelector('.sa-row[data-sarow="p5"] .sa-bar')}));
 ok('1 공정표 없음 목록에 푸른빌라 주방(p2)만',await A.evaluate(()=>{const L=[...document.querySelectorAll('.sa-none [data-sa="open"]')].map(e=>e.dataset.id);return L.join()==='p2'&&/푸른빌라 주방/.test(document.querySelector('.sa-none').innerText)}));
 // 늦은 공정 판정: 대표 현황판(E)과 같은 함수
 const lt=await A.evaluate(()=>({p1:window.__hfT.saLateProcs('p1'),p3:window.__hfT.saLateProcs('p3'),p4:window.__hfT.saLateProcs('p4'),ceo:(()=>{const c=window.__hfT.ceoCount();return {res:c.parts.res.late.L.map(x=>x.id),gov:c.parts.gov.late.L.map(x=>x.id),s:c.parts.res.late.L[0]&&c.parts.res.late.L[0].s}})()}));
 ok('1 늦음 판정 = 대표 현황판과 같음: p1 목공 · p4 전기 · 준공(p3)은 없음 / 현황판 늦어진 공정도 p1(주거)·p4(관공서)',JSON.stringify(lt.p1)===JSON.stringify([["목공",D(-3)]])&&JSON.stringify(lt.p4)===JSON.stringify([["전기",D(-2)]])&&lt.p3.length===0&&lt.ceo.res.join()==='p1'&&lt.ceo.gov.join()==='p4'&&/목공/.test(lt.ceo.s),lt);
 // 담당자 필터 (프로젝트 담당 + 현장 담당에서 자동 목록)
 const opts=await A.evaluate(()=>[...document.querySelector('[data-saf="mgr"]').options].map(o=>o.value));ok('1 담당자 목록 자동: 전체·김담당·이봄이·정진혁',JSON.stringify(opts)===JSON.stringify(["","김담당","이봄이","정진혁"]),opts);
 await pick(A,'mgr','이봄이');r=await rows(A);ok('1 담당 이봄이: p1(현장 담당)·p4·p8 · 공정표 없음에 p2',JSON.stringify(r)===JSON.stringify(['p1','p4','p8'])&&await A.evaluate(()=>!!document.querySelector('.sa-none [data-id="p2"]')),r);
 await pick(A,'mgr','정진혁');r=await rows(A);ok('1 담당 정진혁: p1·p7·p5 · 공정표 없음 목록 없음',JSON.stringify(r)===JSON.stringify(['p1','p7','p5'])&&await A.evaluate(()=>!document.querySelector('.sa-none')),r);
 await pick(A,'mgr','');await pick(A,'part','gov');r=await rows(A);ok('1 파트 관공서: p4·p5',JSON.stringify(r)===JSON.stringify(['p4','p5']),r);
 await pick(A,'part','res');r=await rows(A);ok('1 파트 주거: p1·p6·p7·p8',JSON.stringify(r)===JSON.stringify(['p1','p6','p7','p8']),r);await pick(A,'part','');
 await A.locator('[data-saf="all"]').check();await wait(350);r=await rows(A);const b3=await bars(A,'p3');ok('1 끝난 현장도 보기 → 준공 현장(p3) 나옴 · 늦음 표시 없음',r.includes('p3')&&b3.length===1&&!b3[0].late,[r,b3]);await A.locator('[data-saf="all"]').uncheck();await wait(350);
 // 기간 8주: 지난 2주부터 → p1 막대 3개 모두
 await pick(A,'weeks','8');b1=await bars(A,'p1');let g=await geo(A);
 ok('1 8주: 날짜 칸 56개 · p1 막대 3개(철거 100% 흐림)',g.hd===56&&b1.length===3&&b1.some(x=>x.proc==='철거'&&x.done&&x.t==='철거 100%'),[g.hd,b1]);
 ok('1 PC: 페이지 가로 넘침 없음 · 일정 상자 안에서만 스크롤 · 이름 열 고정(sticky)',g.sw<=g.iw+2&&g.boxR<=g.iw&&g.boxSW>g.boxCW&&g.sticky==='sticky',g);
 const st=await A.evaluate(()=>{const sc=document.getElementById('saScroll');sc.scrollLeft=300;const a=sc.querySelector('.sa-row[data-sarow] .sa-name').getBoundingClientRect().left,b=sc.getBoundingClientRect().left;return [sc.scrollLeft,Math.round(a-b)]});ok('1 가로로 밀어도 현장 이름 열은 왼쪽에 그대로',st[0]>=200&&Math.abs(st[1])<=2,st);
 await A.screenshot({path:OUT+'/sched_all_pc_week.png',fullPage:true});
 // 이전·다음·오늘
 const rng=()=>A.evaluate(()=>document.getElementById('saRng').innerText);const r0=await rng();await A.locator('[data-sa="next"]').click();await wait(300);const r1=await rng();await A.locator('[data-sa="prev"]').click();await wait(300);const r2=await rng();await A.locator('[data-sa="prev"]').click();await wait(300);await A.locator('[data-sa="today"]').click();await wait(300);
 ok('1 다음 → 기간 바뀜 · 이전 → 돌아옴 · 오늘 → 처음 기간',r1!==r0&&r2===r0&&await rng()===r0,[r0,r1,r2]);
 await pick(A,'weeks','4');await A.locator('.sa-row[data-sarow="p5"] .sa-out').click();await wait(400);const b5=await bars(A,'p5');ok('1 ‘이 기간에 공정 없음 … 보기’ → 그 공정이 있는 기간으로 옮김',b5.length===1&&b5[0].proc==='철거',b5);await A.locator('[data-sa="today"]').click();await wait(300);
 // 확대·축소 버튼
 await A.locator('[data-sa="zin"]').click();await wait(150);g=await geo(A);const z1=[g.z,g.zl];await A.locator('[data-sa="zout"]').click();await A.locator('[data-sa="zout"]').click();await wait(150);g=await geo(A);const z2=[g.z,g.zl];await A.locator('[data-sa="zreset"]').click();await wait(150);g=await geo(A);
 ok('1 확대 ＋ → 110% · 축소 − 두 번 → 90% · 가운데(%) → 100%',z1.join()==='1.1,110%'&&z2.join()==='0.9,90%'&&g.z==='1'&&g.zl==='100%',[z1,z2,g.z,g.zl]);
 // 한 달 달력
 await A.locator('[data-sa="view"][data-v="month"]').click();await wait(400);
 const mo=await A.evaluate(([T,L])=>{const sc=document.getElementById('saScroll'),td=sc.querySelector(`.sa-cell[data-saday="${T}"]`),lc=sc.querySelector(`.sa-cell[data-saday="${L}"]`);return {view:sc.dataset.view,cells:sc.querySelectorAll('.sa-cell').length,gantt:!!sc.querySelector('.sa-gantt'),chips:td?[...td.querySelectorAll('.sa-chip')].map(e=>e.dataset.id):null,more:td&&td.querySelector('.sa-more')?td.querySelector('.sa-more').innerText:null,tdMark:td&&td.classList.contains('td'),late:lc?!!lc.querySelector('.sa-chip.late[data-id="p1"]'):"달 밖",wk:!document.querySelector('[data-saf="weeks"]'),sw:document.documentElement.scrollWidth,iw:innerWidth}},[T,D(-3)]);
 ok('1 한 달 달력으로 전환: 날짜 칸 28~42개 · 막대 화면 아님 · 기간 고르기 숨김',mo.view==='month'&&mo.cells>=28&&mo.cells<=42&&mo.cells%7===0&&!mo.gantt&&mo.wk,mo);
 ok('1 달력 오늘 칸: 현장 칩 3개 + ‘+1’ (오늘 공정 있는 현장 4곳) · 오늘 표시',mo.chips&&mo.chips.length===3&&mo.more==='+1'&&mo.tdMark,mo);
 ok('1 달력: 늦은 공정이 있던 날(3일 전)의 p1 칩에 빨간 테두리 (그 날이 이번 달 표에 있을 때)',mo.late===true||mo.late==="달 밖",mo.late);ok('1 달력: 페이지 가로 넘침 없음',mo.sw<=mo.iw+2,[mo.sw,mo.iw]);
 await A.screenshot({path:OUT+'/sched_all_pc_month.png',fullPage:true});
 await A.locator(`.sa-cell[data-saday="${T}"] .sa-more`).click();await wait(300);const dv=await A.evaluate(()=>{const v=document.getElementById('saVeil');return v?{ids:[...v.querySelectorAll('.sa-chip')].map(e=>e.dataset.id).sort(),t:v.innerText}:null});
 ok('1 ‘+1’ → 화면 안 창(.veil/.sheet)에 그날 현장 4곳 모두 · 금액 없음',dv&&dv.ids.join()==='p1,p6,p7,p8'&&!MONEY.test(dv.t)&&await A.evaluate(()=>document.getElementById('saVeil').classList.contains('veil')&&!!document.querySelector('#saVeil .sheet')),dv);
 await A.locator('#saVeil .sa-chip[data-id="p7"]').click();await wait(1200);ok('1 창의 현장 칩 → 그 프로젝트(p7) 열림 · 창 닫힘',await sheetId(A)==='projects|p7'&&await A.evaluate(()=>!document.getElementById('saVeil')),await sheetId(A));
 await A.keyboard.press('Escape');await wait(500);if(await sheetId(A)){await A.evaluate(()=>{const b=[...document.querySelectorAll('#layer button')].find(x=>/^(닫기|취소)/.test(x.innerText.trim()));b&&b.click()});await wait(500)}
 await A.locator('[data-sa="view"][data-v="week"]').click();await wait(400);
 const txt=await viewText(A);ok('1 대표 화면에도 금액 글자 없음(계약 금액·원가·마진·○○원)',!MONEY.test(txt),(txt.match(MONEY)||[])[0]);
 ok('1 보기·기간·배율만 이 기기에 기억(localStorage hf-sa)',await A.evaluate(()=>{const o=JSON.parse(localStorage.getItem('hf-sa')||'{}');return o.view==='week'&&o.weeks===4&&Object.keys(o).sort().join()==='view,weeks,z'}));
 const after=await W.RAW();ok('1 읽기 전용: 현장 일정 화면에서 필터·전환·확대·이동을 해도 저장소가 한 글자도 안 바뀜(저장 요청 0)',before===after,(()=>{const a=JSON.parse(before),c=JSON.parse(after);return Object.keys(c).filter(k=>JSON.stringify(a[k])!==JSON.stringify(c[k]))})());
 ok('1 거절된 저장 요청도 없음',(await A.evaluate(()=>window.__mockDenied.filter(x=>/sched|sa/i.test(x)))).length===0);
 await A.locator('.sa-row[data-sarow="p1"] .sa-bar[data-proc="타일"]').click();await wait(1200);ok('1 막대를 누르면 그 프로젝트(p1)가 열림',await sheetId(A)==='projects|p1',await sheetId(A));
 ok('1 열린 프로젝트 창에 공정표 칸이 있음',await A.evaluate(()=>[...document.querySelectorAll('#layer h4')].some(e=>/공정표/.test(e.textContent))));

 // ───────── 2. 직원 · 휴대폰 390 (정진혁) — PC 와 같은 막대 화면 ─────────
 const Wm=await world({width:390,height:844});const A2=await Wm.open('admin',12000);for(let i=0;i<40&&!JSON.parse(await Wm.RAW())['work/all/projects/p8'];i++)await wait(1500);await wait(1500);await A2.close(); // 대표 화면이 한 번 열려 공용 작업 칸(직원이 보는 사본)을 채움
 const J=await Wm.open('jjh',9000);n=await navs(J);
 ok('2 휴대폰 기본 메뉴 줄에 현장 일정이 보임(메뉴 더보기 없이)',await J.evaluate(()=>{const a=document.querySelector('#nav a[href="#schedall"]');return !!a&&a.getBoundingClientRect().width>0&&!document.body.classList.contains('navall')}),n.slice(0,6));
 await go(J,'#schedall',1200);const jb=await Wm.RAW();r=await rows(J);
 ok('2 정진혁(실무 팀): 볼 수 있는 진행 중 현장 그대로 6곳 — 공용 작업 칸 사본의 공정표에서 자동',JSON.stringify(r)===JSON.stringify(['p1','p4','p6','p7','p8','p5']),r);
 ok('2 직원이 보는 현장 = 그 직원이 원래 볼 수 있는 프로젝트 안에서만',await J.evaluate(()=>{const vis=new Set(window.__hfT.vlPjs());const D=window.__hfT.saRows();return D.rows.every(x=>vis.has(x.id))&&D.none.every(id=>vis.has(id))}));
 g=await geo(J);ok('2 휴대폰도 같은 구조: 막대 화면(.sa-gantt) · 줄 6개 · 날짜 칸 28개 · 이름 열 고정 — 카드로 바뀌지 않음',g.gantt&&g.rows===6&&g.hd===28&&g.sticky==='sticky'&&g.bars>=6,g);
 ok('2 휴대폰: 페이지 가로 넘침 없음 · 일정 상자는 화면 안 · 상자 안에서만 가로 스크롤',g.sw<=g.iw+2&&g.boxR<=g.iw&&g.boxL>=0&&g.boxSW>g.boxCW,g);
 ok('2 휴대폰 기본 배율 75%',g.z==='0.75'&&g.zl==='75%',[g.z,g.zl]);
 const hs=await J.evaluate(()=>[...document.querySelectorAll('.sa-tools .btn,.sa-tools select,.sa-seg button,.sa-none .btn')].map(e=>Math.round(e.getBoundingClientRect().height)));ok('2 휴대폰: 버튼·고르기 칸 높이 44px 이상',hs.length>=9&&hs.every(h=>h>=44),hs);
 const jb1=await bars(J,'p1');ok('2 직원 화면에도 늦은 공정(목공) 빨간 테두리 · 진행률(타일 40%)',jb1.some(x=>x.proc==='목공'&&x.late)&&jb1.some(x=>x.t==='타일 40%'),jb1);
 await J.screenshot({path:OUT+'/sched_all_390_week.png',fullPage:true});
 await J.locator('[data-sa="zin"]').tap();await wait(200);g=await geo(J);ok('2 휴대폰 확대 ＋ → 85% · 여전히 페이지 넘침 없음',g.z==='0.85'&&g.zl==='85%'&&g.sw<=g.iw+2,g);
 // 두 손가락 확대: 상자 안에서 손가락 사이를 2배로 → 배율 2배(최대 200%), 화면 전체 배율(.app zoom)은 그대로
 const pz=await J.evaluate(()=>{const el=document.querySelector('#saScroll .sa-track'),app=document.querySelector('.app'),z0=document.getElementById('saZoom').style.zoom,a0=app.style.zoom||"";const mk=(id,x,y)=>new Touch({identifier:id,target:el,clientX:x,clientY:y});const fire=(t,ts)=>el.dispatchEvent(new TouchEvent(t,{touches:ts,targetTouches:ts,changedTouches:ts.length?ts:[mk(1,0,0)],bubbles:true,cancelable:true}));
   fire('touchstart',[mk(1,150,400),mk(2,250,400)]);fire('touchmove',[mk(1,100,400),mk(2,300,400)]);fire('touchend',[]);return {z0,z1:document.getElementById('saZoom').style.zoom,lab:document.getElementById('saZl').innerText.trim(),app0:a0,app1:app.style.zoom||"",saved:JSON.parse(localStorage.getItem('hf-sa')||'{}').z}});
 ok('2 두 손가락 벌리기(상자 안) → 85% → 170% · 기억됨 · 화면 전체 배율은 안 바뀜',pz.z0==='0.85'&&pz.z1==='1.7'&&pz.lab==='170%'&&pz.saved===1.7&&pz.app0===pz.app1,pz);
 g=await geo(J);ok('2 확대한 뒤에도 페이지 가로 넘침 없음(상자 안에서만 넓어짐)',g.sw<=g.iw+2&&g.boxR<=g.iw&&g.boxSW>g.boxCW*2,g);
 await J.locator('[data-sa="zreset"]').tap();await wait(200);
 await J.locator('[data-sa="view"][data-v="month"]').tap();await wait(400);const jm=await J.evaluate(T=>{const sc=document.getElementById('saScroll'),td=sc.querySelector(`.sa-cell[data-saday="${T}"]`);return {cells:sc.querySelectorAll('.sa-cell').length,chips:td?td.querySelectorAll('.sa-chip').length:0,more:td&&td.querySelector('.sa-more')?td.querySelector('.sa-more').innerText:null,sw:document.documentElement.scrollWidth,iw:innerWidth,boxSW:sc.scrollWidth,boxCW:sc.clientWidth,w:Math.round(sc.querySelector('.sa-cell').getBoundingClientRect().width)}},T);
 ok('2 휴대폰 한 달 달력도 PC 와 같은 표(7칸 × 주) · 오늘 칸 칩 3 + ‘+1’ · 상자 안 스크롤 · 페이지 넘침 없음',jm.cells%7===0&&jm.chips===3&&jm.more==='+1'&&jm.sw<=jm.iw+2&&jm.boxSW>jm.boxCW,jm);
 await J.screenshot({path:OUT+'/sched_all_390_month.png',fullPage:true});
 await J.locator('[data-sa="view"][data-v="week"]').tap();await wait(400);
 const jt=await viewText(J);ok('2 직원 화면에 금액 글자 없음',!MONEY.test(jt),(jt.match(MONEY)||[])[0]);
 ok('2 직원: 읽기 전용 — 저장소 그대로(저장 요청 0) · 거절된 요청 0',jb===await Wm.RAW()&&(await J.evaluate(()=>window.__mockDenied.length))===0,await J.evaluate(()=>window.__mockDenied));
 await J.locator('.sa-row[data-sarow="p4"] .sa-name').tap();await wait(1200);ok('2 현장 이름을 누르면 그 프로젝트(p4)가 열림',await sheetId(J)==='projects|p4',await sheetId(J));

 // ───────── 3. 다른 직원: 이봄이·채진아(전체) · 김담당(담당 건만) ─────────
 const B=await Wm.open('bom',9000);await go(B,'#schedall',1200);r=await rows(B);ok('3 이봄이: 메뉴 있음 · 같은 6곳',(await navs(B)).includes('#schedall')&&r.length===6,r);
 await pick(B,'mgr','이봄이');r=await rows(B);ok('3 이봄이가 담당자 필터 ‘이봄이’ → p1·p4·p8',JSON.stringify(r)===JSON.stringify(['p1','p4','p8']),r);await B.close();
 const C=await Wm.open('cja',9000);await go(C,'#schedall',1200);r=await rows(C);const ct=await viewText(C);ok('3 채진아(전체 담당): 메뉴 있음 · 6곳 · 금액 글자 없음',(await navs(C)).includes('#schedall')&&r.length===6&&!MONEY.test(ct),[r,(ct.match(MONEY)||[])[0]]);await C.close();
 const K=await Wm.open('kim',9000);await go(K,'#schedall',1200);r=await rows(K);const kt=await viewText(K);
 ok('3 ‘담당 건만’ 직원(김담당): 자기 담당 현장(p6)만 · 다른 현장 이름이 화면에 없음',JSON.stringify(r)===JSON.stringify(['p6'])&&!/한빛아파트|교문초|가람빌|다온집|시청|푸른빌라/.test(kt),[r,kt.slice(0,300)]);
 ok('3 ‘담당 건만’ 직원: 담당자 목록에도 남의 담당 이름이 안 나옴',await K.evaluate(()=>[...document.querySelector('[data-saf="mgr"]').options].map(o=>o.value).join()===',김담당'),await K.evaluate(()=>[...document.querySelector('[data-saf="mgr"]').options].map(o=>o.value)));

 ok('공통: 화면 오류 없음',errs.length===0,errs);ok('공통: alert·confirm·prompt 창 없음',dialogs.length===0,dialogs);
 await b.close();console.log(`결과: 통과 ${R.filter(Boolean).length} / 실패 ${R.filter(x=>!x).length}`);process.exit(R.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
