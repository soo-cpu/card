// AI 견적 초안 시험 (다음 지시 2026-11-16 v0, v0.99-35 · v0.99-38 버튼 숨김 확인 추가): node intranet/tools/test/ai_est_test.js [index.html]
// 대표·채진아·정진혁·이봄이 × PC·Pixel 7 · 가짜 드라이브(요청 파일 → 가짜 PC 중계가 결과 파일) · 실제 AI·API 키 없음 · 실제 접근 규칙 흉내(mock.js)
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML0=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');
// v0.99-38 (다음 지시 2026-11-17 v0): 버튼은 AI_EST_ON=false 로 숨김 · 코드는 그대로 → ① 실제 파일로 '숨김' 확인 ② 시험용 사본에서만 true 로 켜서 기존 흐름(코드가 아직 맞는지) 확인
const FLAG_OFF='const AI_EST_ON=false;';const HTML=HTML0.replace(FLAG_OFF,'const AI_EST_ON=true;');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const AIE_DIR="1aLGQELLoaM5OMPWKZ0cOUkG90H4Lmq3T";const T0="2026-11-01T00:00:00Z";
const cu=(code,name,mgr,x)=>Object.assign({code,name,mgr,status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",tel:"",addr:"",createdAt:T0,updatedAt:T0,__at:T0},x||{});
const pj=(no,title,custCode,custName,mgr,x)=>Object.assign({no,title,custName,custCode,stage:"견적",mgr,contractAmt:"33000000",estCost:"21212121",cat:"주거",py:32,inq:"2026-11-01",updatedAt:T0},x||{});
const ITEM0={space:"거실",name:"기존 품목",q:1,unit:"식",price:100000,amt:100000};
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "hr/st_jjh":{phone:"010-7777-7777",rrn:"900101-1",pay:"3000000"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "config/company":{name:"주식회사 홈퍼니싱",brand:"아르띠꼬 스튜디오",tel:"1566-5904"},
 "customers/c1":cu("C-2611-901","홍길동","정진혁"),"cpriv/c1":{tel:"010-1111-2222",addr:"서울 시험동 1",updatedAt:T0},
 "customers/c2":cu("C-2611-902","김영희","이봄이"),"cpriv/c2":{tel:"01033334444",addr:"",updatedAt:T0},
 "projects/p1":pj("P-2611-901","래미안 101동","C-2611-901","홍길동","정진혁"),"ppriv/p1":{estCost:"20202020"},
 "projects/p2":pj("P-2611-902","자이 202동","C-2611-902","김영희","이봄이",{py:24}),
 "quotes/q1":{qno:"P-2611-901-1차",ver:"1차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",site:"래미안 101동",staff:"정진혁",status:"본견적 진행",d:"2026-11-03",amount:"110000",qCost:"2121212",py:32,items:[ITEM0],updatedAt:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const FAKEMCP=`window.__mcpCalls=[];window.__MOCKMCP={callTool:async(sv,tool,inp)=>{window.__mcpCalls.push([tool,JSON.stringify(inp)]);const D=JSON.parse(localStorage.getItem('mockdrive')||'{}');const wrap=o=>({content:[{type:'text',text:JSON.stringify(o)}]});
 if(tool==='create_file'&&window.__MCPDENYCREATE)return {isError:true,content:[{type:'text',text:'The caller does not have permission'}]};
 if(tool==='create_file'){const id='f_'+Math.random().toString(36).slice(2,9);D[id]={id,title:inp.title,parentId:inp.parentId||'',text:inp.textContent||'',mime:inp.contentMimeType||'',noconv:!!inp.disableConversionToGoogleType,modifiedTime:new Date().toISOString()};localStorage.setItem('mockdrive',JSON.stringify(D));return wrap({id,title:inp.title})}
 if(tool==='search_files'){const q=inp.query||'',m=/title = '([^']+)'/.exec(q),p=/parentId = '([^']+)'/.exec(q);return wrap({files:Object.values(D).filter(f=>(!m||f.title===m[1])&&(!p||f.parentId===p[1])).map(f=>({id:f.id,title:f.title,parentId:f.parentId,modifiedTime:f.modifiedTime}))})}
 if(tool==='download_file_content'){const f=D[inp.fileId];if(!f)return wrap({});const u=new TextEncoder().encode(f.text);let b='';u.forEach(x=>b+=String.fromCharCode(x));return wrap({content:btoa(b)})}
 return wrap({})}};`;
const ROWS=[{group:"도배",item:"실크 도배",spec:"",unit:"평",qty:80,unit_price:30000,amount:2400000,note:""},{group:"바닥",item:"강마루",spec:"동화 진",unit:"평",qty:32,unit_price:150000,amount:4800000,note:"걸레받이 포함"},{group:"욕실",item:"욕실 리모델링",spec:"",unit:"개",qty:2,unit_price:2100000,amount:4200000,note:"<b>굵게</b>"}];
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push([v?"통과":"실패",n]);console.log(v?"통과":"실패",n,x===undefined?"":String(x).replace(/\s+/g," ").slice(0,300))};
(async()=>{const b=await chromium.launch();const errs=[];
 // ① 숨김 확인 (실제 파일 그대로)
 ok('숨김: 깃발 const AI_EST_ON=false; 가 꼭 한 번',HTML0.split(FLAG_OFF).length===2);
 ok('숨김: AI 견적 코드는 남아 있음 (aieBtnHTML·aieOpen·aieDraw·aieWatch·AIE_DIR·요청 파일 ai_req_)',['function aieBtnHTML(','function aieOpen(','aieDraw','aieWatch','AIE_DIR=','ai_req_','data-aieopen'].every(x=>HTML0.includes(x)));
 ok('숨김: 버튼 함수·창 열기 함수가 깃발을 먼저 봄',/function aieBtnHTML\(qid,bar\)\{if\(!AI_EST_ON\)return "";/.test(HTML0)&&/function aieOpen\(qid\)\{if\(!AI_EST_ON\)return;/.test(HTML0));
 {const ctx=await b.newContext({timezoneId:'Asia/Seoul',viewport:{width:1280,height:900}});await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML0}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r));localStorage.setItem('mockdrive','{}')},[SEED,RULES]);
  const open0=async who=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push('숨김 '+who+': '+e.message));p.on('dialog',d=>d.dismiss());await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+FAKEMCP+MOCK);await p.goto('http://hf.test/');await wait(7000);return p};
  const A0=await open0('admin');await wait(9000);const L0=[[A0,'최윤수']];for(const [w,n] of [['cja','채진아'],['jjh','정진혁'],['bom','이봄이']])L0.push([await open0(w),n]);await wait(2500);
  for(const [P,nm] of L0){const t='숨김 '+nm+': ';await P.evaluate(x=>{location.hash=x},'#quotes');await wait(900);
   ok(t+'견적 관리 화면에 AI 견적 초안 버튼 없음',(await P.locator('[data-aieopen]').count())===0&&!/AI 견적 초안/.test(await P.locator('#view').innerText()));
   const qid=await P.evaluate(()=>{const q=window.__hfT.S().quotes.find(x=>x.qno==='P-2611-901-1차');return q&&q.id});
   await P.evaluate(i=>window.__hfT.openQ(i,"edit"),qid);await wait(900);
   ok(t+'견적 작성 칸에 AI 견적 초안 줄 없음 · 견적 칸은 그대로 열림',(await P.locator('#aieBar').count())===0&&(await P.locator('[data-aieopen]').count())===0&&!!(await P.evaluate(()=>window.__hfT.sheet())));
   await P.evaluate(()=>window.__hfT.closeSheet());await wait(300);
   const n0=Object.keys(JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdrive')))).length;await P.evaluate(()=>window.__hfT.aieOpen(""));await wait(500);
   ok(t+'창 열기 함수를 직접 불러도 창 안 열림 · 요청 파일 안 만듦',(await P.locator('#aieVeil').count())===0&&Object.keys(JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdrive')))).length===n0);
   if(nm==='최윤수')await P.screenshot({path:OUT+'/ai_est_hidden_pc.png'})}
  await ctx.close()}
 if(process.env.HIDDEN_ONLY){ok('화면 오류 0',!errs.length,errs.join(' | '));await b.close();const f=R.filter(x=>x[0]==="실패").length;console.log(`\n합계 ${R.length} · 통과 ${R.length-f} · 실패 ${f}`);process.exit(f?1:0)}
 // ② 시험용 사본(AI_EST_ON=true)으로 기존 흐름 확인 — 다시 켤 때 그대로 쓰이는지
 const VPS=[['PC',{viewport:{width:1280,height:900}}],['Pixel 7',Object.assign({},devices['Pixel 7'])]];
 for(const [vn,vopt] of VPS){const tag=vn+' ';
  const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul'},vopt));await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r));localStorage.setItem('mockdrive','{}')},[SEED,RULES]);
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));const F=async()=>Object.values(JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdrive'))));
  // 가짜 PC 중계: 결과가 없는 요청마다 결과 파일 (fn 이 결과 모양을 정함)
  const relay=async fn=>{const fl=await F();let n=0;for(const f of fl.filter(x=>/^ai_req_.*\.json$/.test(x.title)&&x.parentId===AIE_DIR)){const id=f.title.slice(7,-5);if(fl.some(x=>x.title==='ai_res_'+id+'.json'))continue;const q=JSON.parse(f.text);
    const res=Object.assign({v:1,id,at:new Date().toISOString(),by:q.by,ok:true,draft:true,model:"claude-haiku-5-5",site:q.site,pyeong:q.pyeong,rows:ROWS,total:11400000,assumptions:["욕실 2개로 가정","천장 도배 포함"],usage:{input_tokens:600,output_tokens:900},cost_usd:0.0005,cost_krw:0.7,error:null},fn?fn(q):{});
    await seed.evaluate(([t,p,txt])=>{const d=JSON.parse(localStorage.getItem('mockdrive'));const id='r_'+Math.random().toString(36).slice(2,9);d[id]={id,title:t,parentId:p,text:txt,modifiedTime:new Date().toISOString()};localStorage.setItem('mockdrive',JSON.stringify(d))},['ai_res_'+id+'.json',AIE_DIR,'﻿'+JSON.stringify(res)]);n++}return n};
  const open=async(who)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>d.dismiss());await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+FAKEMCP+MOCK);await p.goto('http://hf.test/');await wait(7000);return p};
  const go=async(p,h)=>{await p.evaluate(x=>{location.hash=x},h);await wait(900)};
  const veil=P=>P.evaluate(()=>(document.getElementById('aieVeil')||{}).innerText||'');
  const act=async(P,a)=>{await P.evaluate(a=>{const b=[...document.querySelectorAll('#aieVeil [data-aieact="'+a+'"]')].pop();b&&b.click()},a);await wait(700)};
  const askYes=async(P,yes)=>{const n=await P.locator('.okask').count();if(n){await P.locator('.okask [data-ok="'+(yes?1:0)+'"]').click();await wait(2500)}return n};
  const fill=async(P,o)=>{if(o.site!==undefined)await P.locator('#aieSite').fill(o.site);if(o.py!==undefined)await P.locator('#aiePy').fill(String(o.py));for(const x of (o.items||[]))await P.locator('#aieVeil [data-aieitem="'+x+'"]').check();if(o.memo!==undefined)await P.locator('#aieMemo').fill(o.memo);await wait(200)};
  const reqs=async()=>(await F()).filter(f=>/^ai_req_/.test(f.title));
  const A=await open('admin');await wait(9000); /* 대표 화면이 직원 사본을 올림 */
  const J=await open('jjh'),B=await open('bom'),C=await open('cja');await wait(2500);
  const PAGES=[[A,'최윤수','admin'],[C,'채진아','cja'],[J,'정진혁','jjh'],[B,'이봄이','bom']];
  for(const [P,nm,who] of PAGES){const t=tag+nm+': ';
   await go(P,'#quotes');
   ok(t+'견적 관리 화면에 ‘AI 견적 초안’ 버튼',(await P.locator('#view [data-aieopen]').count())===1);
   const qid=await P.evaluate(()=>{const q=window.__hfT.S().quotes.find(x=>x.qno==='P-2611-901-1차');return q&&q.id});
   await P.evaluate(i=>window.__hfT.openQ(i,"edit"),qid);await wait(900);
   ok(t+'견적 작성 칸 위 ‘AI 견적 초안’ 줄',(await P.locator('#aieBar [data-aieopen]').count())===1);
   await P.locator('#aieBar [data-aieopen]').click();await wait(500);
   ok(t+'창 열림 · 현장명(프로젝트 이름)·평수 미리 채움 · 넣을 견적 표시',(await P.locator('#aieVeil').count())===1&&(await P.locator('#aieSite').inputValue())==='래미안 101동'&&(await P.locator('#aiePy').inputValue())==='32'&&/P-2611-901-1차/.test(await veil(P)),await P.locator('#aieSite').inputValue());
   const n0=(await reqs()).length;
   await fill(P,{items:['도배','바닥','욕실'],memo:'홍길동 고객님 욕실 2개'});await act(P,'send');
   ok(t+'고객 이름을 적으면 막힘 (요청 파일 안 만듦)',/고객 이름\(홍길동\)은 넣지 마세요/.test(await veil(P))&&(await reqs()).length===n0,await veil(P));
   await fill(P,{memo:'욕실 2개 연락 010-1111-2222'});await act(P,'send');
   ok(t+'전화번호를 적으면 막힘',/전화번호는 넣지 마세요/.test(await veil(P))&&(await reqs()).length===n0);
   await fill(P,{memo:'욕실 2개 · 주방 상판 교체'});await act(P,'send');await wait(1500);
   const rq=(await reqs()).filter(f=>!/"x"/.test(f.title)).slice(-1)[0];const q=rq?JSON.parse(rq.text):{};
   ok(t+'요청 파일 1개 · AI 견적함 폴더 · json · 이름 ai_req_<id>.json',(await reqs()).length===n0+1&&rq.parentId===AIE_DIR&&rq.mime==='application/json'&&rq.noconv===true&&rq.title==='ai_req_'+q.id+'.json'&&/^\d{14}_[a-z0-9]{6}$/.test(q.id),rq&&rq.title);
   ok(t+'요청 모양 {v,id,by,site,pyeong,items,memo} 그대로 · by=직원 이름',Object.keys(q).join()==='v,id,by,site,pyeong,items,memo'&&q.v===1&&q.by===nm&&q.site==='래미안 101동'&&q.pyeong===32&&JSON.stringify(q.items)==='["도배","바닥","욕실"]'&&q.memo==='욕실 2개 · 주방 상판 교체',rq&&rq.text);
   ok(t+'요청 파일에 고객 이름·연락처·고객코드·금액·키 없음',!/홍길동|김영희|010|C-2611|1111|33000000|21212121|key|token|secret/i.test(rq.text),rq.text);
   ok(t+'기다리는 표시 ‘AI가 초안 만드는 중 (보통 1~2분)’',/AI가 초안 만드는 중 \(보통 1~2분\)/.test(await veil(P)));
   await relay();await wait(16500);
   const v1=await veil(P);
   ok(t+'결과 표: 맨 위 ‘AI 초안 — 확인 전 금액 아님’ · 8칸(공종·항목·규격·단위·수량·단가·금액·비고) · 3줄',/AI 초안 — 확인 전 금액 아님/.test(v1)&&(await P.locator('#aieTbl thead th').allInnerTexts()).join()==='공종,항목,규격,단위,수량,단가,금액,비고'&&(await P.locator('#aieTbl tbody tr').count())===3,v1.slice(0,200));
   ok(t+'금액 = 수량 × 단가 · 합계 11,400,000',(await P.locator('[data-aiea="0"]').innerText())==='2,400,000'&&(await P.locator('#aieTotal').innerText())==='11,400,000');
   await P.locator('[data-aier="qty|0"]').fill('90');await P.locator('[data-aier="unit_price|1"]').fill('160,000');await wait(300);
   ok(t+'수량·단가를 고치면 금액·합계 자동 (90×30,000 · 32×160,000 → 합계 12,020,000)',(await P.locator('[data-aiea="0"]').innerText())==='2,700,000'&&(await P.locator('[data-aiea="1"]').innerText())==='5,120,000'&&(await P.locator('#aieTotal').innerText())==='12,020,000',await P.locator('#aieTotal').innerText());
   ok(t+'표 아래 ‘확인할 것’ (가정 2개)',/확인할 것[\s\S]*욕실 2개로 가정[\s\S]*천장 도배 포함/.test(await P.locator('#aieAsm').innerText()));
   ok(t+'하단 토큰 사용량·대략 비용 (입력 600 · 출력 900 · 0.7원)',/입력 600토큰 · 출력 900토큰 · 대략 비용 0\.7원/.test(await P.locator('#aieUse').innerText()),await P.locator('#aieUse').innerText());
   ok(t+'AI 창에 원가·마진·성과금 없음 · 비고 글은 글자 그대로(태그 안 됨)',!/원가|마진|성과금|21,212,121|20,202,020|2,121,212/.test(v1)&&(await P.locator('#aieVeil b').filter({hasText:'굵게'}).count())===0&&(await P.locator('[data-aier="note|2"]').inputValue())==='<b>굵게</b>');
   ok(t+'AI 표에는 확정·저장 버튼 없음',(await P.locator('#aieVeil button').allInnerTexts()).every(x=>!/저장|확정/.test(x)),(await P.locator('#aieVeil button').allInnerTexts()).join('|'));
   if(vn==='PC'&&who==='admin')await P.screenshot({path:OUT+'/ai_est_res_pc.png'});if(vn!=='PC'&&who==='jjh')await P.screenshot({path:OUT+'/ai_est_res_pixel.png'});
   const sw=await P.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1);ok(t+'화면 가로 넘침 없음 (표는 상자 안에서만 옆으로)',sw);
   const d0=JSON.stringify((await D())['quotes/q1']);
   await act(P,'insert');const asked=await askYes(P,true);
   const st=await P.evaluate(()=>{const x=window.__hfT.qe()||{};return {s:window.__hfT.sheet(),qe:x.qe||[],tab:x.tab,veil:!!document.getElementById('aieVeil')}});
   ok(t+'‘초안을 견적에 넣기’ → 확인 창(okAsk) → 견적 작성 칸에 줄 더하기만 (기존 1줄 + AI 3줄, 고친 값 그대로)',asked===1&&st.s&&st.s.id===qid&&st.tab==='edit'&&!st.veil&&st.qe.length===4&&st.qe[0][1]==='기존 품목'&&st.qe[1].join()==='도배,실크 도배,90,평,30000'&&st.qe[2].join()==='바닥,강마루 동화 진,32,평,160000',JSON.stringify(st));
   ok(t+'넣기만 해서는 저장소의 견적이 바뀌지 않음',JSON.stringify((await D())['quotes/q1'])===d0);
   await P.locator('#sheetForm [data-qesave]').first().click();await wait(600);await askYes(P,true);await wait(1500);
   const D2=await D(),q1=D2['quotes/q1'];const newQ=Object.entries(D2).filter(([k,v])=>v&&typeof v==='object'&&Array.isArray(v.items)&&v.items.some(l=>l.ai)&&v.prevQno==='P-2611-901-1차'&&v.createdBy===USERS[who].id);
   ok(t+'기존 저장 버튼 → 새 차수로 저장 · 원래 1차는 그대로(1줄)',q1&&q1.items.length===1&&q1.items[0].name==='기존 품목'&&newQ.length>=1&&newQ[0][1].items.length===4,newQ.map(x=>x[0]).join(','));
   await P.evaluate(()=>window.__hfT.closeSheet());await wait(300);
  }
  // ok:false → error 문구 그대로 (정진혁 · 대표)
  for(const [P,nm] of [[J,'정진혁'],[A,'최윤수']]){const t=tag+nm+': ';
   await go(P,'#quotes');await P.locator('#view [data-aieopen]').click();await wait(400);await act(P,'new');
   await fill(P,{site:'힐스테이트 3동',py:'28',items:['도배']});await act(P,'send');await wait(1200);
   await relay(()=>({ok:false,rows:[],total:0,error:'하루 30건 넘음',usage:{input_tokens:0,output_tokens:0},cost_krw:0}));await wait(16500);
   ok(t+'ok:false → 오류 문구 그대로 ‘하루 30건 넘음’ · 표·넣기 버튼 없음',(await P.locator('#aieErr').innerText().catch(()=>''))==='하루 30건 넘음'&&(await P.locator('#aieTbl').count())===0&&(await P.locator('[data-aieact="insert"]').count())===0);
   // 10분 넘게 안 옴 → PC 중계 안내 · 다시 확인
   await act(P,'new');await fill(P,{site:'힐스테이트 4동'});await act(P,'send');await wait(1200);
   await P.evaluate(()=>window.__hfT.aieAge(11*60e3));await wait(16500);
   ok(t+'10분 넘게 결과가 없으면 ‘PC 중계가 꺼져 있을 수 있어요’ + 다시 확인 버튼',/PC 중계가 꺼져 있을 수 있어요/.test(await P.locator('#aieLate').innerText().catch(()=>''))&&(await P.locator('#aieVeil [data-aieact="recheck"]').count())===1);
   await relay();await act(P,'recheck');await wait(2500);
   ok(t+'다시 확인 → 결과가 오면 표',(await P.locator('#aieTbl tbody tr').count())===3);
   // 창을 닫으면 확인 멈춤
   await act(P,'new');await fill(P,{site:'힐스테이트 5동'});await act(P,'send');await wait(1200);await act(P,'close');
   const c0=await P.evaluate(()=>window.__mcpCalls.length);await wait(16500);const c1=await P.evaluate(()=>window.__mcpCalls.length);
   ok(t+'창을 닫으면 결과 확인(드라이브 읽기)이 멈춤',c1===c0,c0+'→'+c1);
   await P.locator('#view [data-aieopen]').click();await wait(400);
   ok(t+'다시 열면 기다리던 요청을 이어서 보여 줌',/AI가 초안 만드는 중/.test(await veil(P)));await act(P,'close');
  }
  // 목록 버튼 → 프로젝트 고르기 → 넣기 (대표 · 이봄이): 견적이 없는 프로젝트(P-2611-902)면 기존 길(pjQuoteOpen)대로 빈 1차를 열고 거기에 더함
  for(const [P,nm,who] of [[A,'최윤수','admin'],[B,'이봄이','bom']]){const t=tag+nm+': ';
   await go(P,'#quotes');await P.locator('#view [data-aieopen]').click();await wait(400);await act(P,'new');
   await P.locator('#aiePj').selectOption('P-2611-902');await wait(300);
   ok(t+'목록에서 연 창: 프로젝트를 고르면 현장명·평수 채움',(await P.locator('#aieSite').inputValue())==='자이 202동'&&(await P.locator('#aiePy').inputValue())==='24');
   await fill(P,{items:['바닥']});await act(P,'send');await wait(1200);const q2=JSON.parse((await reqs()).slice(-1)[0].text);
   ok(t+'요청 파일에 고객 이름(김영희) 없음',!/김영희|C-2611-902/.test(JSON.stringify(q2))&&q2.site==='자이 202동'&&q2.pyeong===24);
   await relay();await wait(16500);await act(P,'insert');await askYes(P,true);await wait(1500);
   const st=await P.evaluate(()=>{const x=window.__hfT.qe()||{};return {s:window.__hfT.sheet(),qe:(x.qe||[]).length,pno:x.pno}});
   ok(t+'넣기 → 그 프로젝트 견적 작성 칸에 3줄',st.s&&st.s.col==='quotes'&&st.pno==='P-2611-902'&&st.qe>=3,JSON.stringify(st));
   await P.evaluate(()=>window.__hfT.closeSheet());await wait(300);
  }
  // 프로젝트를 안 고르고 넣기 → 막힘
  {const P=C,t=tag+'채진아: ';await go(P,'#quotes');await P.locator('#view [data-aieopen]').click();await wait(400);await act(P,'new');await fill(P,{site:'푸르지오 1동',py:'30',items:['전기']});await act(P,'send');await wait(1200);await relay();await wait(16500);
   const s0=await P.evaluate(()=>window.__hfT.sheet());await act(P,'insert');
   ok(t+'넣을 프로젝트를 안 고르면 넣지 않음 (창 그대로)',(await P.locator('.okask').count())===0&&!s0&&!(await P.evaluate(()=>window.__hfT.sheet()))&&(await P.locator('#aieVeil').count())===1);await act(P,'close')}
  // 폴더 쓰기 권한 없음 (정진혁)
  {const P=J,t=tag+'정진혁: ';await P.evaluate(()=>{window.__MCPDENYCREATE=true});await go(P,'#quotes');await P.locator('#view [data-aieopen]').click();await wait(400);await act(P,'new');await fill(P,{site:'롯데캐슬 7동',py:'40',items:['타일']});const n0=(await reqs()).length;await act(P,'send');await wait(1500);
   ok(t+'폴더 쓰기 권한이 없으면 ‘AI 견적함 폴더 공유가 아직 안 됐어요 · 대표에게 알려 주세요’',/AI 견적함 폴더 공유가 아직 안 됐어요 · 대표에게 알려 주세요/.test(await veil(P))&&(await reqs()).length===n0);await P.evaluate(()=>{window.__MCPDENYCREATE=false});await act(P,'close')}
  // 권한 밖 쓰기 0 · 화면 오류 0
  for(const [P,nm] of [[J,'정진혁'],[B,'이봄이'],[C,'채진아']]){const den=await P.evaluate(()=>window.__mockDenied.filter(x=>!/^(activity|access|knock)/.test(x)));ok(tag+nm+': 권한 밖 쓰기 0',!den.length,den.join(','))}
  // 미리 보기(대표가 정진혁 화면): 버튼 잠김 · 요청 파일 안 만듦
  {const P=A;await P.evaluate(()=>window.__hfT.aieReset());await go(P,'#preview');await P.locator('[data-pvgo="st_jjh"]').click();await wait(2500);await go(P,'#quotes');const n0=(await reqs()).length;
   const dis=await P.locator('#view [data-aieopen]').isDisabled().catch(()=>null);await P.evaluate(()=>window.__hfT.aieOpen(""));await wait(500);
   ok(tag+'미리 보기(정진혁 화면): 버튼 잠김 · 창 안 열림 · 요청 파일 안 만듦',dis===true&&(await P.locator('#aieVeil').count())===0&&(await reqs()).length===n0,String(dis))}
  // 연습 모드(공용 저장소 연결 안 됨): 버튼 잠김 · 요청 파일 안 만듦
  {const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' 연습: '+e.message));p.on('dialog',d=>d.dismiss());await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS.jjh)};`+FAKEMCP+MOCK+`;(()=>{const u=window.claude.use;window.claude.use=async n=>{if(n==='db')throw new Error('no db');return u(n)}})();`);await p.goto('http://hf.test/');await wait(9000);
   const n0=(await reqs()).length;await go(p,'#quotes');const cnt=await p.locator('#view [data-aieopen]').count(),dis=cnt?await p.locator('#view [data-aieopen]').isDisabled():null;await p.evaluate(()=>window.__hfT&&window.__hfT.aieOpen(""));await wait(500);
   ok(tag+'연습 모드: 버튼 잠김(또는 없음) · 창 안 열림 · 요청 파일 안 만듦',(cnt===0||dis===true)&&(await p.locator('#aieVeil').count())===0&&(await reqs()).length===n0,cnt+'/'+dis);await p.close()}
  await ctx.close()}
 ok('화면 오류 0',!errs.length,errs.join(' | '));
 await b.close();const f=R.filter(x=>x[0]==="실패").length;console.log(`\n합계 ${R.length} · 통과 ${R.length-f} · 실패 ${f}`);process.exit(f?1:0)})();
