// 프로젝트 통합 화면 시험 (v0.99-26, 2026-11-12): node intranet/tools/test/hub_test.js [index.html]
// 대표·정진혁·이봄이·채진아 × PC·Pixel 7: 프로젝트 상세의 고객/현장 진행/견적/사후관리 카드, 고객 카드 '이 고객의 모든 것', 고객 이름 검색, 돈 정보(원가·마진·성과금·A/S 비용) 안 샘, 휴대폰 가로 넘침 없음
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "customers/c2":{code:"C-2611-902",name:"김영희",tel:"",addr:"",mgr:"이봄이",status:"진행중",steps:[1],stage:"1-상담영업",inq:"2026-11-02",createdAt:T0,updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",approvals:[{amt:1515151,t:"자재"}],cat:"주거",inq:"2026-11-01",work:"욕실",start:"2026-11-05",updatedAt:T0},"ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "projects/p2":{no:"P-2605-902",title:"지난 현장 주방",custName:"홍길동",custCode:"C-2611-901",stage:"사후관리",mgr:"이봄이",contractAmt:"12000000",cat:"주거",inq:"2026-04-01",work:"주방",start:"2026-04-10",end:"2026-05-01",warrantyEnd:"2027-05-01",warrantyMonths:12,updatedAt:T0},
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
  const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  const go=async(p,h)=>{await p.evaluate(x=>{location.hash=x},h);await wait(900)};
  const sh=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+'|'+s.id:''});
  const close=async p=>{await p.evaluate(()=>window.__hfT.closeSheet());await wait(300)};
  const wide=p=>p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2);
  const A0=await open('admin',12000);/* 대표 화면이 먼저 공용 칸·직원 사본을 채움 */
  for(const who of ['admin','jjh','bom','cja']){const P=who==='admin'?A0:await open(who);const tag=vn+' '+USERS[who].name+': ';
   // 1) 프로젝트 상세 → 카드 4개
   await go(P,'#projects');await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);
   const hub=P.locator('#pjHub');const n=await hub.locator('.hubc').count();const t=n?await hub.innerText():'';
   ok(tag+'프로젝트 상세에 카드 4개 (고객 정보·현장 진행 상황·견적·사후관리)',n===4&&/고객 정보/.test(t)&&/현장 진행 상황/.test(t)&&/견적/.test(t)&&/사후관리/.test(t),n);
   ok(tag+'고객(이름·코드·전화) · 현장(공정 타일·진행률 40%·마지막 일지) · 견적 2건(차수·상태)',/홍길동/.test(t)&&/C-2611-901/.test(t)&&/010-1234-5678/.test(t)&&/타일/.test(t)&&/40%/.test(t)&&/욕실 벽 타일 시공 중/.test(t)&&/1차/.test(t)&&/2차/.test(t)&&/계약/.test(t),t.replace(/\s+/g,' ').slice(0,260));
   ok(tag+'카드에 원가·마진·성과금·A/S 비용·과거 결재 금액 없음',!MONEY.test(t)&&!/마진|원가|성과/.test(t),(t.match(MONEY)||[]).join(','));
   if(who==='jjh'||who==='bom')ok(tag+'금액 미확정 견적은 금액 숨김',/금액 미확정/.test(t)&&!/5,555,000|5555000/.test(t));
   ok(tag+'가로 넘침 없음 (프로젝트 상세)',await wide(P));
   if(vn!=='PC'){const w=await hub.locator('.hubc').evaluateAll(L=>L.map(e=>Math.round(e.getBoundingClientRect().left)));ok(tag+'휴대폰: 카드가 한 줄에 하나씩',new Set(w).size===1,w.join(','))}
   // 2) 카드를 누르면 그 메뉴 상세로
   await hub.locator('.hubi[data-open="sites"]').first().click();await wait(900);const s1=await sh(P);await close(P);
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);await P.locator('#pjHub .hubi[data-open="quotes"]').first().click();await wait(1200);const s2=await sh(P);await close(P);
   await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900);await P.locator('#pjHub .hubi[data-open="customers"]').first().click();await wait(900);const s3=await sh(P);
   ok(tag+'카드 누르면 현장·견적·고객 상세로 이동',s1==='sites|s1'&&/^quotes\|q[12]$/.test(s2)&&s3==='customers|c1',[s1,s2,s3].join(' '));
   // 3) 고객 카드: 이 고객의 모든 것 (프로젝트 2건)
   const ch=P.locator('.sheet .custHub');const cn=await ch.locator('.hubp').count();const ct=cn?await ch.innerText():'';
   ok(tag+'고객 카드 ‘이 고객의 모든 것’: 프로젝트 2건이 프로젝트별로 (현장 진행·견적·사후관리 A/S·하자보수)',cn===2&&/P-2611-901/.test(ct)&&/P-2605-902/.test(ct)&&/40%/.test(ct)&&/싱크대 하부 실리콘 보수/.test(ct)&&/하자보수 2027-05-01/.test(ct)&&!MONEY.test(ct),cn+' '+ct.replace(/\s+/g,' ').slice(0,200));
   ok(tag+'가로 넘침 없음 (고객 카드)',await wide(P));
   await ch.locator('[data-open="projects"]').first().click();await wait(900);ok(tag+'고객 카드에서 프로젝트를 누르면 프로젝트 상세',/^projects\|p[12]$/.test(await sh(P)),await sh(P));await close(P);
   // 4) 고객 이름으로 찾기 (고객 관리·프로젝트)
   for(const h of ['#customers','#projects']){await go(P,h);await P.locator('#q').fill('홍길');await P.locator('#q').dispatchEvent('input');await wait(1100);
    const hs=P.locator('#hubS .custHub');const hn=await hs.count();const ht=hn?await P.locator('#hubS').innerText():'';
    ok(tag+h+' 에서 ‘홍길’ 검색 → 그 고객의 프로젝트·현장 진행·견적·사후관리가 한 화면에',hn===1&&/P-2611-901/.test(ht)&&/P-2605-902/.test(ht)&&/40%/.test(ht)&&/1차/.test(ht)&&/싱크대/.test(ht)&&!MONEY.test(ht),hn+' '+ht.replace(/\s+/g,' ').slice(0,160));
    ok(tag+h+' 검색 화면 가로 넘침 없음',await wide(P));
    await P.locator('#q').fill('');await P.locator('#q').dispatchEvent('input');await wait(500)}
   // 5) 연결 끊긴 것 모아 보기는 대표만
   await go(P,'#projects');const ln=await P.locator('#hubLoose').count();
   ok(tag+(who==='admin'?'프로젝트에 묶이지 않은 것(견적 1·고객 1) 모아 보기 보임':'‘묶이지 않은 것’ 모아 보기는 안 보임 (대표만)'),who==='admin'?(ln===1&&/견적 1/.test(await P.locator('#hubLoose summary').innerText())):ln===0,ln);
   if(who!=='admin'){ok(tag+'대표 전용 칸 쓰기 거절 0',(await P.evaluate(()=>window.__mockDenied.length))===0);await P.close()}}
  await A0.close();await ctx.close()}
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 const blk=HTML.slice(HTML.indexOf('// ===== 프로젝트 통합 화면'),HTML.indexOf('// 프로젝트 하나로 이어지는 흐름 1단계'));
 ok('통합 화면 코드에 alert/confirm/prompt/window.open 0건 · 원가 칸(estCost·qCost·asCost·perf·margin) 안 읽음',blk.length>2000&&!/\b(alert|confirm|prompt)\s*\(|window\.open/.test(blk)&&!/estCost|qCost|asCost|asCharge|\.perf\b|marginRate|\.margin\b|bonus|\.pc\b|contractAmt/.test(blk),blk.length+'자');
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
