// 카드별 점검표 (v0.99-27, 2026-11-13 · 다음 지시 2026-11-13 v1 3번): node intranet/tools/test/check_test.js [index.html]
// 프로젝트 통합 화면에서 고객·현장·견적·사후관리·원가 카드마다 ‘들어가기 / 돌아오기 / 저장 / 연결 번호’를 대표·정진혁·이봄이·채진아 × PC·Pixel 7 로 실제로 돌려 보고 표로 찍음
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";const PC0={lines:[{proc:"철거공사",sale:1000000,est:"",act:"",st:"예상",hist:[],xl:1},{proc:"목공사",sale:3000000,est:"",act:"",st:"예상",hist:[],xl:1}],post:[],updatedAt:T0,by:"u_boss"};
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",memo:"",createdAt:T0,updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"4000000",estCost:"",cat:"주거",inq:"2026-11-01",work:"욕실",start:"2026-11-05",memo:"",updatedAt:T0},"ppriv/p1":{pc:PC0,updatedAt:T0},"acct/u_jjh/pcost/p1":PC0,"acct/u_cja/pcost/p1":PC0,
 "sites/s1":{pno:"P-2611-901",code:"C-2611-901",name:"시험 현장 욕실",customer:"홍길동",mgr:"정진혁",status:"공사 중",proc:"타일",progress:"40",start:"2026-11-05",notice:"",logs:[],updatedAt:T0},
 "quotes/q1":{qno:"P-2611-901-1차",ver:"1차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"계약",d:"2026-11-03",amount:"4000000",items:[],memo:"",updatedAt:T0},
 "as/a1":{pno:"P-2611-901",code:"C-2611-901",site:"시험 현장 욕실",d:"2026-11-07",content:"실리콘 보수",status:"접수",mgr:"정진혁"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const CARDS=[["고객","customers","c1","code","C-2611-901"],["현장","sites","s1","pno","P-2611-901"],["견적","quotes","q1","pno","P-2611-901"],["사후관리","as","a1","pno","P-2611-901"]];
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,240))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const M={};const mark=(card,colm,who,vn,v)=>{const k=card+'|'+colm;(M[k]=M[k]||{});(M[k][who]=M[k][who]||[]).push(v)};
(async()=>{const b=await chromium.launch();const __tzSeoul=b.newContext.bind(b);b.newContext=o=>__tzSeoul(Object.assign({timezoneId:'Asia/Seoul'},o||{})) /* 시험 시간대 서울 고정 (검토 권고 2026-11-13: 한국 새벽에 날짜가 하루 어긋남) */;const errs=[],dialogs=[];
 for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){
  const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.confirm=()=>false;window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  const sh=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+'|'+s.id:''});
  const A0=await open('admin',12000);
  for(const who of ['admin','jjh','bom','cja']){const P=who==='admin'?A0:await open(who);const nm=USERS[who].name,tag=vn+' '+nm+': ';
   await P.evaluate(()=>{location.hash='#projects'});await wait(600);await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1000);
   for(const [card,col,id,lk,lv] of CARDS){
    // 들어가기
    const it=P.locator('#pjHub .hubi[data-open="'+col+'"][data-id="'+id+'"]');const has=await it.count();if(has){await it.first().click();await wait(1100)}
    const inOk=has===1&&(await sh(P))===col+'|'+id;mark(card,'들어가기',nm,vn,inOk);ok(tag+card+' 카드 들어가기',inOk,await sh(P));
    // 연결 번호: 그 카드 자료의 번호가 프로젝트 번호(고객은 고객코드)와 같고 화면 위치 표시에 프로젝트가 앞에 있음
    const row=await P.evaluate(([c,i])=>window.__hfT.S()[c].find(x=>x.id===i)||{},[col,id]);const pj=await P.evaluate(()=>window.__hfT.S().projects.find(x=>x.id==='p1')||{});
    const lkOk=row[lk]===lv&&(lk==='code'?pj.custCode===lv:pj.no===lv)&&/^프로젝트 › 홍길동 ›/.test(((await P.locator('#veil .crumb').count())?await P.locator('#veil .crumb').innerText():'').replace(/\s+/g,' '));
    mark(card,'연결 번호',nm,vn,lkOk);ok(tag+card+' 연결 번호 ('+lk+' = '+lv+')',lkOk,row[lk]);
    // 저장: 글 칸 하나를 고치고 저장 → 저장소 값이 바뀌고 프로젝트 통합 화면으로 돌아옴
    if(col==='quotes'&&await P.locator('#veil [data-qtab="edit"]').count()){await P.locator('#veil [data-qtab="edit"]').click();await wait(500)}
    const key=await P.evaluate(()=>{for(const k of ['memo','notice','content']){const e=document.querySelector('#sheetForm [data-k="'+k+'"]');if(e&&e.offsetParent!==null&&!e.disabled&&!e.readOnly)return k}return ''});
    const val='점검 '+card+' '+nm+' '+vn;let svOk=false;if(key&&await P.locator('#saveSheet').count()){await P.locator('#sheetForm [data-k="'+key+'"]').fill(val);await P.locator('#saveSheet').click();await wait(2600);
     svOk=(await P.evaluate(([c,i,k])=>(window.__hfT.S()[c].find(x=>x.id===i)||{})[k],[col,id,key]))===val&&(await sh(P))==='projects|p1'}
    mark(card,'저장',nm,vn,svOk);ok(tag+card+' 저장 ('+(key||'칸 없음')+') → 값 남고 프로젝트로',svOk,await sh(P));
    // 돌아오기: 다시 들어가서 ‘← 뒤로’
    if((await sh(P))!=='projects|p1'){await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(900)}
    await P.locator('#pjHub .hubi[data-open="'+col+'"][data-id="'+id+'"]').first().click();await wait(1000);await P.locator('#veil .navbar [data-navback]').click();await wait(800);
    const bkOk=(await sh(P))==='projects|p1'&&(await P.locator('#pjHub').count())===1&&(await P.locator('#navAsk').count())===0;mark(card,'돌아오기',nm,vn,bkOk);ok(tag+card+' 돌아오기 (← 뒤로 → 프로젝트 통합 화면)',bkOk,await sh(P))}
   // 원가 카드 (원가 관리): 권한 있는 사람만
   const can=who!=='bom';const btn=await P.locator('#veil [data-pctop]').count();
   if(!can){const hid=btn===0&&(await P.locator('.pcbox').count())===0;['들어가기','돌아오기','저장','연결 번호'].forEach(c=>mark('원가',c,nm,vn,hid?'숨김':false));ok(tag+'원가 카드는 안 보임 (이 프로젝트 담당 아님 · 기존 권한 그대로)',hid,btn)}
   else{if(btn){await P.locator('#veil [data-pctop]').first().click();await wait(900);await P.locator('#veil [data-pctab="post"]').click();await wait(700)}
    const inOk=btn>=1&&(await P.locator('#pcPostT').count())===1&&/원가 관리/.test(await P.locator('#veil .crumb').innerText());mark('원가','들어가기',nm,vn,inOk);ok(tag+'원가 카드 들어가기 (원가 관리 → 사후 원가 표)',inOk);
    const c0=await P.evaluate(()=>window.__hfT.pc('p1'));const lkOk=!!c0&&(c0.lines||[]).length===2&&/철거공사/.test(await P.locator('#pcPostT').innerText());mark('원가','연결 번호',nm,vn,lkOk);ok(tag+'원가 연결 번호 (프로젝트 번호 p1의 원가 줄)',lkOk);
    const amt=({admin:610000,jjh:620000,bom:0,cja:640000})[who]+(vn==='PC'?0:5000);const el=P.locator('#pcPostT [data-pcpi="0"]');await el.fill(String(amt));await el.dispatchEvent('change');await wait(1200);
    const c1=await P.evaluate(()=>window.__hfT.pc('p1'));const svOk=((c1&&c1.post)||[]).some(r=>r.it&&r.proc==='철거공사'&&r.amt===amt)&&(await P.evaluate(()=>window.__mockDenied.length))===0;mark('원가','저장',nm,vn,svOk);ok(tag+'원가 저장 (철거공사 실행 원가 '+amt+')',svOk,JSON.stringify((c1&&c1.post)||[]).slice(0,120));
    await P.locator('#veil .navbar [data-navback]').click();await wait(700);const bkOk=(await sh(P))==='projects|p1'&&(await P.locator('.pcbox').count())===0&&(await P.locator('#pjHub').count())===1;mark('원가','돌아오기',nm,vn,bkOk);ok(tag+'원가 돌아오기 (← 뒤로 → 프로젝트 통합 화면)',bkOk)}
   if(who!=='admin'){ok(tag+'대표 전용 칸 쓰기 거절 0',(await P.evaluate(()=>window.__mockDenied.length))===0,await P.evaluate(()=>window.__mockDenied.join(',')));await P.close()}}
  await A0.close();await ctx.close()}
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 // 점검표
 const cell=(card,c)=>{const o=M[card+'|'+c]||{};return ['최윤수','정진혁','이봄이','채진아'].map(n=>{const v=o[n]||[];return n+' '+(v.length&&v.every(x=>x==='숨김')?'숨김(권한)':v.length&&v.every(x=>x===true)?'O':'X')}).join(' · ')};
 console.log('\n| 카드 | 들어가기 | 돌아오기 | 저장 | 연결 번호 |');console.log('|---|---|---|---|---|');['고객','현장','견적','사후관리','원가'].forEach(k=>console.log('| '+k+' | '+['들어가기','돌아오기','저장','연결 번호'].map(c=>cell(k,c)).join(' | ')+' |'));
 console.log('(O = PC·Pixel 7 둘 다 통과 · 가짜 저장소 시험 도구 기준)');
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
