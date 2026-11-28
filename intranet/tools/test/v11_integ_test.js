// v11 다섯 기능 맞물림 시험 (v0.99-56 · A 확정본 · B 타임라인 · C 현장 일정 · D 프로젝트 손익 · E 대표 현황판): LANG=C.UTF-8 node intranet/tools/test/v11_integ_test.js [index.html]
// 1 메뉴(PC 순서 · 휴대폰 기본 메뉴 줄 · 직원 3명) / 2 프로젝트 창 탭마다 카드가 맞는 탭에만 · 390px 넘침 없음 · 타임라인에 진짜 A 줄(v11SpecEvents)
// 3 C 막대 → 공정표 칸 · D 줄 → 원가·정산 칸 · 새 화면 3개에서 뒤로 가기 / 4 실시간 구독 수(한도 64 · 지킴이 54) / 5 SPEC_FIELD_LIVE=false
// 씨앗은 대표 현황판 시험(ceo_board_test.js)의 것을 그대로 빌려 씀 (그 파일의 RULES ~ USERS 부분)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
if(!process.env.LANG&&!process.env.LC_ALL)process.env.LANG='C.UTF-8';
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../../index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const CSRC=fs.readFileSync(__dirname+'/ceo_board_test.js','utf8');eval(CSRC.slice(CSRC.indexOf('const RULES='),CSRC.indexOf('const wait=')).replace(/\bconst (RULES|NOW|line|ap|pg|SEED|USERS|NAME|slotAt)\b/g,'var $1'));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?"통과":"실패",n,v?"":(x===undefined?"":String(typeof x==="string"?x:JSON.stringify(x)).slice(0,500)))};
// A 확정본 자료 (공용 작업 칸): p1 v1 올림 → 확정(정진혁) → v2 올림 / p4 v1 올림 → 확정 → 고객 확인
const sv=(pid,pno,ver)=>({k:"ver",pid,pno,ver,at:iso(NOW-(4-ver)*36e5),by:"u_bom",byName:"이봄이",items:[{space:"욕실",part:"벽",name:"시험 타일"}],files:[]});
const sa=(pid,pno,act,ver,byName,x)=>Object.assign({k:"act",pid,pno,act,ver,at:iso(NOW-36e5+ver*1000+(act==="고객 확인"?5000:0)),by:"u_x",byName},x||{});
const SPEC={"work/all/spec/p1__v1":sv("p1","P-2611-901",1),"work/all/spec/p1__v2":sv("p1","P-2611-901",2),"work/all/spec/p1__a1":sa("p1","P-2611-901","확정",1,"정진혁"),
 "work/all/spec/p4__v1":sv("p4","P-2611-904",1),"work/all/spec/p4__a1":sa("p4","P-2611-904","확정",1,"이봄이"),"work/all/spec/p4__a2":sa("p4","P-2611-904","고객 확인",1,"고객",{seenAt:NOWI})};
const P1X={"projects/p1":Object.assign({},SEED["projects/p1"],{custCode:"C-901",plog:SEED["projects/p1"].plog.concat([{at:iso(NOW-7200e3),type:"결정",text:"욕실 벽 타일은 300각 무광으로 확정",name:"정진혁"}])}),
 "customers/c1":{code:"C-901",name:"홍길동",tel:"010-1111-2222",addr:"구리시 시험로 1",status:"진행중",mgr:"정진혁",createdAt:"2026-11-01T00:00:00Z",updatedAt:"2026-11-01T00:00:00Z"}};
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 async function world(seedX,vp,ls){const mob=!!(vp&&vp.width<500);const ctx=await b.newContext({timezoneId:'Asia/Seoul',viewport:vp||{width:1280,height:900},isMobile:mob,hasTouch:mob});
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r,ls])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r));Object.entries(ls||{}).forEach(([k,v])=>localStorage.setItem(k,v))},[Object.assign({},SEED,SPEC,P1X,seedX||{}),RULES,ls||null]);
  const DB=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
  async function open(who,ms,url){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type()+' '+d.message().slice(0,40));d.dismiss()});
   await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};window.__MOCKEXACT=true;`+MOCK);await p.goto(url||'http://hf.test/');await wait(ms||8000);return p}
  return {ctx,DB,open}}
 const navs=p=>p.evaluate(()=>[...document.querySelectorAll('#nav a')].map(a=>a.getAttribute('href')));
 const navShown=p=>p.evaluate(()=>[...document.querySelectorAll('#nav a')].filter(a=>getComputedStyle(a).display!=='none'&&a.getBoundingClientRect().width>0).map(a=>a.getAttribute('href')));
 const go=async(p,h,ms)=>{await p.evaluate(x=>{location.hash=x},h);await wait(ms||900)};
 const hash=p=>p.evaluate(()=>location.hash);const sh=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+'|'+s.id:''});
 const back=async p=>{await p.locator('#veil .navbar [data-navback]').click();await wait(800)};
 const after=(L,a,b2)=>L.indexOf(a)>=0&&L.indexOf(b2)>L.indexOf(a);

 // ───────── 1. 메뉴 ─────────
 const W=await world();const A=await W.open('admin',15000);
 let n=await navs(A);
 ok('1 대표 PC 메뉴 순서: 대표 현황판 → 홈 → 공용 캘린더 → 현장 일정 … 캐시플로우 → 프로젝트 손익 → 성과금 (하나씩만)',n[0]==='#ceo'&&n[1]==='#home'&&after(n,'#calendar','#schedall')&&n.indexOf('#schedall')===n.indexOf('#calendar')+1&&n.indexOf('#pl')===n.indexOf('#cflow')+1&&n.indexOf('#bonus')===n.indexOf('#pl')+1&&['#ceo','#schedall','#pl'].every(h=>n.filter(x=>x===h).length===1),n);
 for(const [who,want] of [['jjh',[false,true,false]],['bom',[false,true,false]],['cja',[false,true,true]]]){const Pg=await W.open(who,9000);const m=await navs(Pg);
  ok(`1 ${NAME[who]} 메뉴: 대표 현황판 ${want[0]?'있음':'없음'} · 현장 일정 있음 · 프로젝트 손익 ${want[2]?'있음':'없음'} · 성과금 없음`,m.includes('#ceo')===want[0]&&m.includes('#schedall')===want[1]&&m.includes('#pl')===want[2]&&!m.includes('#bonus'),m);
  const got=[];for(const h of ['#ceo','#schedall','#pl']){await go(Pg,h,900);got.push(await Pg.evaluate(()=>(document.querySelector('#nav a[aria-current="page"]')||{getAttribute:()=>''}).getAttribute('href')))}
  ok(`1 ${NAME[who]}: 주소로 직접 가도 권한대로 (#ceo → 홈 · #schedall 열림 · #pl ${want[2]?'열림':'→ 홈'})`,got[0]==='#home'&&got[1]==='#schedall'&&got[2]===(want[2]?'#pl':'#home'),got);await Pg.close()}
 // 휴대폰 기본 메뉴 줄 (860px 이하 · '메뉴 더보기' 누르기 전)
 for(const w of [390,360,320]){const Wm=await world(null,{width:w,height:780});const M=await Wm.open('admin',14000);const v=await navShown(M);
  const g=await M.evaluate(()=>{const nav=document.getElementById('nav'),rail=document.querySelector('.rail'),nr=nav.getBoundingClientRect(),rr=rail.getBoundingClientRect();const L=[...nav.querySelectorAll('a')].filter(a=>getComputedStyle(a).display!=='none');
    return {docW:document.documentElement.scrollWidth,iw:innerWidth,railH:Math.round(rr.height),navH:Math.round(nr.height),navR:Math.round(nr.right),tops:[...new Set(L.map(a=>Math.round(a.getBoundingClientRect().top)))].length,minH:Math.min(...L.map(a=>Math.round(a.getBoundingClientRect().height))),clip:L.filter(a=>{const r=a.getBoundingClientRect();return r.bottom>nr.bottom+1||r.top<nr.top-1}).length,scroll:nav.scrollWidth>nav.clientWidth,ox:getComputedStyle(nav).overflowX,more:!!document.getElementById('navMore')&&document.getElementById('navMore').getBoundingClientRect().right<=innerWidth+1}});
  ok(`1 휴대폰 ${w}px 대표 기본 메뉴 줄: 대표 현황판·현장 일정 보임 · 프로젝트 손익은 ‘메뉴 더보기’ 안`,v[0]==='#ceo'&&v.includes('#schedall')&&v.includes('#home')&&v.includes('#projects')&&v.includes('#approvals')&&!v.includes('#pl')&&!v.includes('#bonus'),v);
  ok(`1 휴대폰 ${w}px: 메뉴 줄이 넘쳐 깨지지 않음 (한 줄 · 옆으로 밀어 봄 · 화면 가로 넘침 없음 · ‘메뉴 더보기’ 버튼 화면 안)`,g.docW<=g.iw+2&&g.navR<=g.iw+1&&g.tops===1&&g.clip===0&&g.ox==='auto'&&g.more,g);
  if(w===390){await M.locator('#navMore').click();await wait(400);const all=await navShown(M);const g2=await M.evaluate(()=>({docW:document.documentElement.scrollWidth,iw:innerWidth,over:[...document.querySelectorAll('#nav a')].filter(a=>a.getBoundingClientRect().right>innerWidth+1).length}));
   ok('1 휴대폰 390px ‘메뉴 더보기’: 프로젝트 손익·성과금까지 다 보이고 화면 밖으로 안 나감',all.includes('#pl')&&all.includes('#bonus')&&all.includes('#ceo')&&all.includes('#schedall')&&g2.docW<=g2.iw+2&&g2.over===0,[all.length,g2]);
   await M.locator('#navMore').click();await wait(300);await M.screenshot({path:OUT+'/v11_nav_390.png'})}
  await M.close();await Wm.ctx.close()}
 {const Wh=await world(null,{width:390,height:780},{'hf-ceo-first':'home'});const H=await Wh.open('admin',12000);const v=await navShown(H);
  ok('1 휴대폰: 첫 화면을 ‘기존 홈’으로 해 둔 대표도 기본 메뉴 줄에 대표 현황판이 보임(현황판을 한 번도 안 열었어도)',await hash(H)===''&&v[0]==='#ceo'&&v.includes('#schedall'),[await hash(H),v]);await Wh.ctx.close()}
 {const Wj=await world(null,{width:390,height:780});const J=await Wj.open('jjh',10000);const v=await navShown(J);ok('1 휴대폰 정진혁 기본 메뉴 줄: 현장 일정 보임 · 대표 현황판·프로젝트 손익 없음',v.includes('#schedall')&&!v.includes('#ceo')&&!v.includes('#pl'),v);await Wj.ctx.close()}

 // ───────── 2. 프로젝트 창: 탭마다 카드 ─────────
 const vis=p=>p.evaluate(()=>{const on=q=>{const e=document.querySelector('#veil '+q);return !!(e&&e.offsetParent)};const h4=re=>[...document.querySelectorAll('#veil h4')].some(e=>e.offsetParent&&re.test(e.textContent||''));
   return {tab:(document.querySelector('#veil .sheet')||{dataset:{}}).dataset.pt||'all',spBox:on('#spBox'),spHub:on('#spHub'),tlBox:on('#tlBox'),tlTop:on('#tlTop'),pg:h4(/^공정 진행/),sched:h4(/^공정표/),ph:h4(/^현장 사진·파일/),money:h4(/^돈 흐름/),hub:on('#pjHub'),
     hubc:[...document.querySelectorAll('#veil #pjHub .hubc')].filter(e=>e.offsetParent).map(e=>e.dataset.pt)}});
 await A.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1500);
 const tabs={};for(const k of ['all','cust','prog','quote','as']){if(k!=='all'){await A.locator('#veil [data-pttab="'+k+'"]').click();await wait(500)}tabs[k]=await vis(A)}
 ok('2 ‘전체’ 탭: A 마감재·도면 카드 · B 기록 타임라인 · 최근 결정 · 공정 진행 · 현장 사진 · 공정표 · 돈 흐름 · 통합 카드 모두 보임',tabs.all.spBox&&tabs.all.tlBox&&tabs.all.tlTop&&tabs.all.pg&&tabs.all.ph&&tabs.all.sched&&tabs.all.money&&tabs.all.hub&&tabs.all.spHub,tabs.all);
 ok('2 ‘진행 상황’ 탭: 마감재·도면 카드 · 기록 타임라인 · 공정 진행 · 현장 사진 보임 · 통합 카드는 진행 것만(그 안에 확정본 한 줄) · 돈 흐름 없음',tabs.prog.tab==='prog'&&tabs.prog.spBox&&tabs.prog.tlBox&&tabs.prog.pg&&tabs.prog.ph&&tabs.prog.spHub&&!tabs.prog.money&&tabs.prog.hubc.length>0&&tabs.prog.hubc.every(x=>x==='prog'),tabs.prog);
 for(const k of ['cust','quote','as'])ok(`2 ‘${({cust:'고객 정보',quote:'견적',as:'사후 관리'})[k]}’ 탭: 마감재·도면 카드·기록 타임라인·공정 진행·현장 사진은 안 보임 (그 탭 카드만)`,tabs[k].tab===k&&!tabs[k].spBox&&!tabs[k].tlBox&&!tabs[k].pg&&!tabs[k].ph&&!tabs[k].spHub&&tabs[k].hubc.every(x=>x===k),tabs[k]);
 ok('2 ‘최근 결정’ 요약은 어느 탭에서나 맨 위에 보임 (B 설계 그대로)',['all','cust','prog','quote','as'].every(k=>tabs[k].tlTop),Object.fromEntries(Object.entries(tabs).map(([k,v])=>[k,v.tlTop])));
 ok('2 기존 칸 자리 그대로: 돈 흐름은 ‘견적’ 탭에만 · 공정표(→ 공용 캘린더) 칸은 ‘고객 정보’ 탭(v0.99-51 과 같음)',tabs.quote.money&&!tabs.prog.money&&!tabs.cust.money&&!tabs.as.money&&tabs.cust.sched&&!tabs.prog.sched&&!tabs.quote.sched&&!tabs.as.sched,Object.fromEntries(Object.entries(tabs).map(([k,v])=>[k,[v.money,v.sched]])));
 await A.locator('#veil [data-pttab="prog"]').click();await wait(500);
 const ev=await A.evaluate(()=>({p1:window.__hfT.tlEvents('p1').filter(e=>e.kind==='spec').map(e=>e.text+'|'+(e.who||'')),p4:window.__hfT.tlEvents('p4').filter(e=>e.kind==='spec').map(e=>e.text+'|'+(e.who||'')),real:String(window.v11SpecEvents).length>100,dom:document.getElementById('tlBox').innerText}));
 ok('2 B 타임라인에 A 의 진짜 줄(v11SpecEvents): p1 올림 v1·v2 + 확정 v1(정진혁) · p4 확정 + 고객 확인',ev.real&&ev.p1.filter(x=>/올림/.test(x)).length===2&&ev.p1.some(x=>/확정 v1/.test(x)&&/정진혁/.test(x))&&ev.p4.some(x=>/확정/.test(x)&&/이봄이/.test(x))&&ev.p4.some(x=>/고객.*확인/.test(x)),ev);
 ok('2 타임라인 화면(p1)에 확정본 줄·결정 줄·사진 줄이 같이 보임',/확정본/.test(ev.dom)&&/마감재·도면 확정 v1/.test(ev.dom)&&/300각 무광/.test(ev.dom)&&/사진 1장/.test(ev.dom),ev.dom.slice(0,400));
 ok('2 ‘최근 결정’에 그 결정 한 줄',/300각 무광/.test(await A.locator('#tlTop').innerText()));
 await A.evaluate(()=>window.__hfT.closeSheet());await wait(400);
 // 390px: 탭마다 가로 넘침 없음
 const Wm=await world(null,{width:390,height:844});const M=await Wm.open('admin',14000);await M.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1500);
 for(const k of ['all','cust','prog','quote','as']){if(k!=='all'){await M.locator('#veil [data-pttab="'+k+'"]').click();await wait(500)}
  const g=await M.evaluate(()=>{const s=document.querySelector('#veil .sheet');const inScroll=e=>{for(let x=e.parentElement;x&&x!==s;x=x.parentElement){const o=getComputedStyle(x).overflowX;if((o==='auto'||o==='scroll')&&x.scrollWidth>x.clientWidth)return true}return false};
    const shut=e=>{const d=e.closest('details:not([open])');return !!d&&!e.closest('summary')};/* 접힌 칸 안은 안 보이므로 뺌 */
    const bad=[...s.querySelectorAll('*')].filter(e=>e.offsetParent&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().right>innerWidth+1&&!inScroll(e)&&!shut(e));
    return {docW:document.documentElement.scrollWidth,iw:innerWidth,shW:s.scrollWidth,shC:s.clientWidth,over:bad.length,who:bad.slice(0,4).map(e=>e.tagName+'.'+String(e.className).slice(0,30)+'#'+e.id),v:{sp:!!(document.getElementById('spBox')||{}).offsetParent,tl:!!(document.getElementById('tlBox')||{}).offsetParent}}});
  ok(`2 390px ‘${k}’ 탭: 가로 넘침 없음 (문서·창·안의 모든 것 — 옆으로 미는 표 안은 빼고)`,g.docW<=g.iw+1&&g.shW<=g.shC+1&&g.over===0&&g.v.sp===(k==='all'||k==='prog')&&g.v.tl===(k==='all'||k==='prog'),g);
  if(k==='prog')await M.screenshot({path:OUT+'/v11_pj_prog_390.png',fullPage:false})}
 await M.evaluate(()=>window.__hfT.closeSheet());await wait(300);

 // ───────── 3. C 막대 → 공정표 · D 줄 → 원가·정산 · 뒤로 가기 ─────────
 for(const [tag,P] of [['PC',A],['390px',M]]){
  // E 현황판 → 목록 → 프로젝트 → 뒤로
  await go(P,'#ceo',1000);await P.locator('[data-ceolist="res|late"]').click();await wait(400);await P.locator('#ceoVeil [data-ceoopen="projects|p1"]').click();await wait(1200);
  const e1=await sh(P);await back(P);ok(`3 ${tag} E 현황판: 숫자 → 목록 → 프로젝트 → ‘← 뒤로’ → 현황판 그대로(창 닫힘 · 주소 #ceo)`,e1==='projects|p1'&&await sh(P)===''&&await hash(P)==='#ceo'&&await P.locator('#ceoParts').count()===1&&await P.locator('#veil').count()===0,[e1,await sh(P),await hash(P)]);
  await P.locator('[data-ceolist="res|late"]').click();await wait(400);await P.locator('#ceoVeil [data-ceoopen="projects|p1"]').click();await wait(1200);await P.goBack().catch(()=>{});await wait(1000);
  ok(`3 ${tag} E 현황판: 브라우저·휴대폰 뒤로 가기 → 프로젝트만 닫히고 현황판 (인트라넷 안)`,await sh(P)===''&&await hash(P)==='#ceo'&&/^http:\/\/hf\.test\//.test(P.url()),[await sh(P),await hash(P),P.url()]);
  // C 현장 일정 → 막대 → 공정표 칸
  await go(P,'#schedall',1200);const bar=P.locator('.sa-row[data-sarow="p1"] .sa-bar').first();const hasBar=await bar.count();
  if(hasBar){await bar.scrollIntoViewIfNeeded();await bar.click()}else await P.locator('#view [data-sa="open"][data-id="p1"]').first().click();await wait(1500);
  const c1=await P.evaluate(()=>{const s=window.__hfT.sheet(),h=[...document.querySelectorAll('#veil h4')].find(e=>/공정표/.test(e.textContent||'')),sc=document.querySelector('#veil .sheet');if(!h||!sc)return {s:s&&s.col+'|'+s.id,h:false};const r=h.getBoundingClientRect(),q=sc.getBoundingClientRect();return {s:s&&s.col+'|'+s.id,h:true,vis:!!h.offsetParent,inView:r.top>=q.top-2&&r.top<q.bottom-20,top:Math.round(r.top-q.top),scrolled:sc.scrollTop>50,tab:sc.dataset.pt||'all'}});
  ok(`3 ${tag} C 현장 일정: ${hasBar?'막대':'현장 줄'}를 누르면 그 프로젝트가 열리고 공정표 칸이 화면에 보이게 내려감`,c1.s==='projects|p1'&&c1.h&&c1.vis&&c1.inView&&c1.scrolled,c1);
  await back(P);ok(`3 ${tag} C 현장 일정: ‘← 뒤로’ → 현장 일정 그대로`,await sh(P)===''&&await hash(P)==='#schedall'&&await P.locator('#veil').count()===0,[await sh(P),await hash(P)]);
  await P.locator('#view [data-sa="open"][data-id="p1"]').first().click();await wait(1300);const c2=await sh(P);await P.goBack().catch(()=>{});await wait(1000);
  ok(`3 ${tag} C 현장 일정: 브라우저 뒤로 가기 → 프로젝트만 닫히고 현장 일정`,c2==='projects|p1'&&await sh(P)===''&&await hash(P)==='#schedall',[c2,await sh(P),await hash(P)]);
  // D 프로젝트 손익 → 줄 → 원가·정산 칸
  await go(P,'#pl',1200);await P.locator('#view [data-plrow="p1"]').first().click();await wait(1500);
  const d1=await P.evaluate(()=>{const s=window.__hfT.sheet(),bx=document.querySelector('#veil .pcbox'),sc=document.querySelector('#veil .sheet');return {s:s&&s.col+'|'+s.id,pc:!!(bx&&bx.offsetParent),tab:sc?sc.dataset.pt||'all':'',crumb:(document.querySelector('#veil .crumb')||{innerText:''}).innerText.replace(/\s+/g,' ')}});
  ok(`3 ${tag} D 프로젝트 손익: 줄을 누르면 그 프로젝트의 원가 관리(원가·정산) 칸이 열림`,d1.s==='projects|p1'&&d1.pc&&/원가 관리/.test(d1.crumb),d1);
  await back(P);const d2=await P.evaluate(()=>{const s=window.__hfT.sheet();return {s:s?s.col+'|'+s.id:'',pc:document.querySelectorAll('#veil .pcbox').length}});await back(P);
  ok(`3 ${tag} D 프로젝트 손익: ‘← 뒤로’ 첫 번은 원가 관리 칸만 닫고(기존 규칙) 한 번 더 누르면 손익 화면`,d2.s==='projects|p1'&&d2.pc===0&&await sh(P)===''&&await hash(P)==='#pl',[d2,await sh(P),await hash(P)]);
  await P.locator('#view [data-plrow="p4"]').first().click();await wait(1300);await P.goBack().catch(()=>{});await wait(900);if(await sh(P)!=='')await P.goBack().catch(()=>{});await wait(900);
  ok(`3 ${tag} D 프로젝트 손익: 브라우저 뒤로 가기(두 번 안에) → 손익 화면 · 인트라넷 안`,await sh(P)===''&&await hash(P)==='#pl'&&/^http:\/\/hf\.test\//.test(P.url()),[await sh(P),await hash(P)]);
  // 새 화면끼리 메뉴로 옮긴 뒤 브라우저 뒤로 → 바로 전 메뉴
  await go(P,'#ceo',800);await go(P,'#schedall',800);await go(P,'#pl',800);await P.goBack().catch(()=>{});await wait(900);const h1=await hash(P);await P.goBack().catch(()=>{});await wait(900);
  ok(`3 ${tag} 메뉴 사이 뒤로 가기: 손익 → 현장 일정 → 현황판`,h1==='#schedall'&&await hash(P)==='#ceo',[h1,await hash(P)])}

 // ───────── 4. 실시간 구독 수 ─────────
 await go(A,'#ceo',800);await A.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1500);await A.evaluate(()=>window.__hfT.closeSheet());for(const h of ['#schedall','#pl','#projects','#approvals','#ceo']){await go(A,h,700)}await wait(1500);
 const sub=await A.evaluate(()=>window.__hfT.subs());
 ok('4 대표 화면 실시간 구독: 한도 64 안 · 지킴이 기준(54) 안 · 거절된 구독 0 (다섯 화면·프로젝트 창을 다 연 뒤)',sub.live<=54&&sub.live+0<64&&sub.fail===0,sub);
 const add=(HTML.match(/db\.collection\(SPP\)\.onSnapshot/g)||[]).length;const ceoSub=/async function ceoLoad\(\)\{try\{const g=await db\.doc\(CEO_PATH\+"\/cur"\)\.get\(\)/.test(HTML);
 const body=(a,z)=>HTML.slice(HTML.indexOf(a),HTML.indexOf(z,HTML.indexOf(a)));
 const noSub=[['E 현황판',body('// ===== v0.99-53 E. 대표 현황판','// ===== 입력 시트 =====')],['B 타임라인',body('const TL_KINDS=','// ===== 프로젝트 창 탭')],['C 현장 일정',body('const saZ=','function saDayOpen')+HTML.substr(HTML.indexOf('function saDayOpen'),6000)],['D 프로젝트 손익',body('const plNavHTML','// ===== ')]].map(([k,t])=>[k,t.length,(t.match(/\.onSnapshot\(/g)||[]).length]);
 ok('4 새 기능이 더한 실시간 구독: A 확정본 칸 1개뿐 · B·C·D·E 는 0개 (E 스냅숏은 한 번 읽기)',add===1&&ceoSub&&noSub.every(x=>x[1]>500&&x[2]===0),[add,ceoSub,noSub]);
 console.log('   구독 수(대표 · 가짜 저장소):',JSON.stringify(sub));
 const J=await W.open('jjh',9000);await go(J,'#schedall',800);await J.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1500);const subJ=await J.evaluate(()=>window.__hfT.subs());ok('4 직원(정진혁) 화면 구독도 한도 안 · 거절 0',subJ.live<=54&&subJ.fail===0,subJ);console.log('   구독 수(정진혁):',JSON.stringify(subJ));await J.close();

 // ───────── 5. 그대로 둘 것 ─────────
 ok('5 SPEC_FIELD_LIVE=false 기본값 그대로 (현장소통 보내기 스위치 꺼짐)',/const SPEC_FIELD_LIVE=false;/.test(HTML)&&(await A.evaluate(()=>window.__hfT.spCan().live))===false);
 ok('5 버전 표시 v0.99-56 그대로 · 맨 앞 설명도 그대로(D 프로젝트 손익)',/APP_VER\s*=\s*"v0\.99-56 \(다음 지시 2026-11-28 v11 · D 프로젝트 손익 한 장/.test(HTML),(HTML.match(/APP_VER\s*=\s*"[^"]{0,60}/)||[''])[0]);
 ok('공통: 화면 오류 없음',errs.length===0,errs);ok('공통: alert·confirm·prompt 창 없음',dialogs.length===0,dialogs);
 await b.close();console.log(`결과: 통과 ${R.filter(Boolean).length} / 실패 ${R.filter(x=>!x).length}`);process.exit(R.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
