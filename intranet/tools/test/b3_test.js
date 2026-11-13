// 묶음 3 시험 (v0.99-31, 2026-11-13 · 대표 지시 2026-11-13 의 2·20·3·4·18번): node intranet/tools/test/b3_test.js [index.html]   · ONLY=2|20|3|4|18 로 한 부분만
// 2: 현장 사진·파일 큰 버튼 (현장 일지·프로젝트 진행 상황) — 덧붙이기만, 드라이브 복사, 큰 사진 줄이기, 낡은 창 저장 보호
// 20: 업무 보고 사진(프로젝트 고름) + 현장 사진이 한 프로젝트 '현장 사진' 한 곳에 (참조 · 중복 저장 없음)
// 3: 공정표 엑셀(간트 막대) 읽기 → 확인 창 → 캘린더 등록 · 다시 첨부하면 맞춰 갱신 · 사람이 고친 일정은 물어봄
// 4: 사진 → AI 공정 % 추정(가짜 AI) → 맞아요/고치기 → 진행 막대 · AI 없을 때 직접 입력 · 하루 횟수 제한
// 선택: GJ_XLSX=<실제 공정표.xlsx> XLSX_JS=<xlsx.full.min.js> → 실제 파일을 같은 길로 읽음
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";const ONLY=process.env.ONLY||"";const on=k=>!ONLY||ONLY===k;
const STAFF={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const WHO=['admin','cja','jjh','bom'];const VPS=[['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]];
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,320))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const STUB=`window.confirm=()=>false;`;
// 가짜 드라이브: 폴더 만들기·파일 올리기만 받아 id 를 돌려줌 (부른 것은 __mcpLog)
const MCPW=`window.__mcpLog=[];window.__MOCKMCP={callTool:async(sv,tool,inp)=>{window.__mcpLog.push(tool+'|'+String(inp.title||'').slice(0,40)+'|'+String(inp.parentId||''));const id='D_'+Math.random().toString(36).slice(2,8);return {content:[{type:"text",text:JSON.stringify({id,title:inp.title})}]}}};`;
const BCW=`(()=>{const _BC=window.BroadcastChannel;window.BroadcastChannel=class{constructor(n){this.b=new _BC(n);this.b.onmessage=e=>{if(!window.__mute&&this.onmessage)this.onmessage(e)}}postMessage(m){this.b.postMessage(m)}close(){this.b.close()}}})();`;
const MONEY=/12,345,678|98,765|원가|마진|성과금/;
(async()=>{const b=await chromium.launch();const __tzSeoul=b.newContext.bind(b);b.newContext=o=>__tzSeoul(Object.assign({timezoneId:'Asia/Seoul'},o||{})) /* 시험 시간대 서울 고정 (검토 권고 2026-11-13: 한국 새벽에 날짜가 하루 어긋남) */;const errs=[],dialogs=[];
 const mk=async(opt,seedObj,init)=>{const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));
  const XJS=process.env.XLSX_JS?fs.readFileSync(process.env.XLSX_JS,'utf8'):null;
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>XJS&&/xlsx/.test(r.request().url())?r.fulfill({contentType:'application/javascript',body:XJS}):r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[seedObj,RULES]);
  const open=async(who,ms,extra)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));if(process.env.DEBUG)p.on('console',m=>{if(/error|warn/.test(m.type()))console.log('  ['+who+' '+m.type()+'] '+m.text().slice(0,300))});p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+init+(extra||'')+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);for(let i=0;i<40&&!(await p.evaluate(()=>!!window.__hfT));i++)await wait(500);return p};
  const dbv=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')));
  return {ctx,open,seed,dbv}};
 const go=async(p,h)=>{await p.evaluate(x=>{location.hash=x},h);await wait(700)};
 const openS=async(p,col,id)=>{await go(p,'#'+col);await p.evaluate(([c,i])=>window.__hfT.open(c,i),[col,id||null]);await wait(1000)};
 const close=async p=>{await p.evaluate(()=>window.__hfT.closeSheet());await wait(300)};
 const tab=async(p,k)=>{const t=p.locator('#veil .pttabs [data-pttab="'+k+'"]');if(await t.count()){await t.first().click();await wait(400)}};
 // 파일 넣기: 사진(작은 PNG·큰 JPEG)·PDF 를 화면 안에서 만들어 input 에 넣고 change
 const putFiles=(p,sel,kinds)=>p.evaluate(async([sel,kinds])=>{const out=[];for(const k of kinds){if(k==='big'){const c=document.createElement('canvas');c.width=2600;c.height=2000;const g=c.getContext('2d');const im=g.createImageData(2600,2000);for(let i=0;i<im.data.length;i++)im.data[i]=(i*2654435761>>>(i%7))&255;g.putImageData(im,0,0);const bl=await new Promise(r=>c.toBlob(r,'image/jpeg',.95));out.push(new File([bl],'큰 현장 사진.jpg',{type:'image/jpeg'}))}
   else if(k==='pdf')out.push(new File([new Uint8Array([37,80,68,70,45,49,46,52,10])],'현장 확인서.pdf',{type:'application/pdf'}));
   else{const c=document.createElement('canvas');c.width=40;c.height=30;c.getContext('2d').fillRect(0,0,20,20);const bl=await new Promise(r=>c.toBlob(r,'image/png'));out.push(new File([bl],k+'.png',{type:'image/png'}))}}
  const el=document.querySelector(sel);const dt=new DataTransfer();out.forEach(f=>dt.items.add(f));el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}));return out.map(f=>f.name+':'+f.size)},[sel,kinds]);
 const phOf=d=>((d||{}).photos||[]);
 const SEED=Object.assign({},STAFF,{
  "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],inq:"2026-11-01",createdAt:T0,updatedAt:T0},
  "projects/p1":{no:"P-2611-901",title:"사진 현장 101동",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:12345678,cat:"주거",inq:"2026-11-01",start:"2026-11-02",endPlan:"2026-11-20",files:[],updatedAt:T0},
  "projects/p2":{no:"P-2611-902",title:"남의 현장",custName:"김철수",stage:"시공",mgr:"이봄이",contractAmt:5000000,cat:"주거",inq:"2026-11-02",files:[],updatedAt:T0},
  "sites/s1":{pno:"P-2611-901",name:"사진 현장 101동",customer:"홍길동",status:"공사 중",mgr:"정진혁",start:"2026-11-02",end:"2026-11-20",amt:12345678,logs:[{d:"2026-11-03",proc:"철거",people:2,text:"철거 시작"}],files:[],updatedAt:T0},
  "sites/s9":{pno:"",name:"번호 없는 현장",status:"착공 전",mgr:"정진혁",files:[],updatedAt:T0}});

 // ================= 2 =================
 if(on('2')){
  for(const [vn,opt] of VPS){
   const {ctx,open,dbv}=await mk(opt,SEED,STUB+MCPW);const A=await open('admin',12000);
   for(const who of WHO){const P=who==='admin'?A:await open(who,9000);const tag='2 '+vn+' '+USERS[who].name+': ';
    await openS(P,'sites','s1');
    const bx=await P.evaluate(()=>{const b=document.querySelector('#phBox'),i=b&&b.querySelector('input[type=file][data-phin]'),l=b&&b.querySelector('.phbig');return b?{t:l.innerText.trim(),acc:i.accept,mul:i.multiple,h:l.getBoundingClientRect().height,w:l.getBoundingClientRect().width}:null});
    ok(tag+'현장 일지 창에 큰 ‘파일 또는 사진 선택’ 버튼 (여러 개 · 사진·카메라·PDF·엑셀)',bx&&bx.t==='파일 또는 사진 선택'&&bx.mul&&/image\/\*/.test(bx.acc)&&/pdf/.test(bx.acc)&&bx.h>=44,JSON.stringify(bx));
    const n0=phOf((await dbv())['work/all/projects/p1']).length;
    await P.selectOption('#phProc','철거');await P.fill('#phNote',USERS[who].name+' 메모');
    await putFiles(P,'#phBox input[data-phin]',[who+'-작은 사진','pdf']);let d;for(let i=0;i<20;i++){await wait(700);d=await dbv();if(phOf(d['work/all/projects/p1']).length>=n0+2)break}
    const ph=phOf(d['work/all/projects/p1']).slice(n0);
    ok(tag+'올린 2개가 그 프로젝트 현장 기록(공용 칸)에 덧붙음 · 누가·언제·어디서·공정·메모',ph.length===2&&ph.every(e=>e.byName===USERS[who].name&&e.from==='현장 관리'&&e.proc==='철거'&&e.note===USERS[who].name+' 메모'&&e.at&&e.d&&e.fid)&&ph.some(e=>/pdf$/.test(e.name)),JSON.stringify(ph.map(e=>[e.name,e.byName,e.from,e.proc])));
    if(who==='admin')ok(tag+'대표는 원본(projects/p1)에도 바로 · 계약 금액·단계 그대로',phOf(d['projects/p1']).length>=2&&d['projects/p1'].contractAmt===12345678&&d['projects/p1'].stage==='시공',JSON.stringify([phOf(d['projects/p1']).length,d['projects/p1'].contractAmt]));
    await wait(1200);const grid=await P.evaluate(()=>[...document.querySelectorAll('#phBox .phit')].map(x=>x.innerText.replace(/\s+/g,' ')));
    ok(tag+'창 안 목록에 바로 보임 (날짜·이름·현장 관리)',grid.length>=2&&grid.some(t=>t.includes(USERS[who].name)&&/현장 관리/.test(t)),grid.slice(0,3).join(' // '));
    ok(tag+'사진 칸에 돈 정보 없음',!MONEY.test(await P.locator('#phBox').innerText()));
    ok(tag+(who==='admin'?'대표: 숨기기 버튼(지우기 아님)':'직원: 삭제 요청 버튼만 (숨기기·지우기 없음)'),who==='admin'?(await P.locator('#phBox [data-phhide]').count())>0&&(await P.locator('#phBox [data-phreq]').count())===0:(await P.locator('#phBox [data-phhide]').count())===0&&(await P.locator('#phBox [data-phreq]').count())>0);
    ok(tag+'창 가로 넘침 없음',await P.evaluate(()=>{const s=[...document.querySelectorAll('.veil .sheet')].pop();return document.documentElement.scrollWidth<=window.innerWidth+2&&(!s||s.scrollWidth<=s.clientWidth+2)}));
    await close(P);
    // 프로젝트 창 '진행 상황' 탭에도 같은 사진
    await openS(P,'projects','p1');await tab(P,'prog');const g2=await P.evaluate(()=>{const b=document.querySelector('#phBox');return b&&b.offsetParent?[...b.querySelectorAll('.phit')].length:-1});
    ok(tag+'프로젝트 창 진행 상황 탭에도 같은 현장 사진 칸·큰 버튼',g2>=2&&(await P.locator('#phBox .phbig').count())===1,g2);await close(P);
    if(who==='jjh'){await openS(P,'sites','s9');ok(tag+'프로젝트 번호 없는 현장: 버튼 대신 안내',(await P.locator('#phBox').count())===0&&/프로젝트 번호를 고르고/.test(await P.locator('#veil').innerText()));await close(P)}
    if(who!=='admin')await P.close()}
   // 큰 사진은 줄여서 · 드라이브 현장 폴더 복사 기록
   await openS(A,'sites','s1');const before=await A.evaluate(()=>(window.__mockUploads||[]).length);const nm=await putFiles(A,'#phBox input[data-phin]',['big']);let d;for(let i=0;i<25;i++){await wait(800);d=await dbv();if(phOf(d['projects/p1']).some(e=>/큰 현장 사진/.test(e.name))&&(d['projects/p1'].phAct||[]).some(a=>a.act==='drive'&&(phOf(d['projects/p1']).find(e=>/큰 현장 사진/.test(e.name))||{}).id===a.ph))break}
   const up=await A.evaluate(n=>(window.__mockUploads||[]).slice(n),before);const big=Number(nm[0].split(':')[1]);
   ok('2 '+vn+' 큰 사진('+Math.round(big/1024)+'KB)은 줄여서 저장 (JPEG · 원본보다 작음)',up.length===1&&up[0].type==='image/jpeg'&&up[0].size<big,JSON.stringify(up));
   const bigE=phOf(d['projects/p1']).find(e=>/큰 현장 사진/.test(e.name))||{},act=(d['projects/p1'].phAct||[]).find(a=>a.act==='drive'&&a.ph===bigE.id);
   const ml=await A.evaluate(()=>window.__mcpLog);
   ok('2 '+vn+' 프로젝트 번호가 있어 드라이브 현장 폴더에도 복사 · 결과는 따로 덧붙이는 기록(phAct)',!!act&&!!act.drive.id&&ml.some(x=>/^create_file\|2026-\d\d-\d\d 큰 현장 사진/.test(x)),JSON.stringify(ml.slice(-3)));
   // 숨기기 → 지우지 않고 기록만
   const nPh=phOf(d['projects/p1']).length;await A.locator('#phBox [data-phhide]').first().click();await wait(400);await A.locator('.okask [data-ok="1"]').click();await wait(1500);d=await dbv();
   ok('2 '+vn+' 대표 숨기기: 사진 기록은 그대로(지우지 않음) · 숨김 기록이 덧붙음',phOf(d['projects/p1']).length===nPh&&(d['projects/p1'].phAct||[]).some(a=>a.act==='숨김'),JSON.stringify((d['projects/p1'].phAct||[]).map(a=>a.act)));
   await ctx.close()}
  // ---- 낡은 창 저장 보호: 정진혁 화면은 구독이 멈춤 → 이봄이가 사진을 올림 → 정진혁이 낡은 프로젝트 창에서 저장 + 낡은 화면에서 사진 올림 → 모두 남음 / 대표의 낡은 창도
  {const FREEZE=BCW+`if(window.__MOCKUSER.id==='u_jjh'||window.__FREEZE){window.__MOCKEXACT=true;window.__SUBPOLL=1e9}`;
   const {ctx,open,dbv}=await mk({viewport:{width:1280,height:900}},SEED,STUB+FREEZE);
   const A=await open('admin',12000);const B=await open('bom',9000);const J=await open('jjh',10000);await J.evaluate(()=>{window.__mute=true});
   const A2=await open('admin',10000,'window.__FREEZE=1;');await A2.evaluate(()=>{window.__mute=true});
   await openS(J,'projects','p1');await openS(A2,'projects','p1');
   await openS(B,'sites','s1');await putFiles(B,'#phBox input[data-phin]',['이봄이 사진']);let d;
   for(let i=0;i<25;i++){await wait(1000);d=await dbv();if(phOf(d['projects/p1']).some(e=>e.byName==='이봄이'))break}
   const jn=await J.evaluate(()=>((window.__hfT.S().projects.find(p=>p.id==='p1')||{}).photos||[]).length);
   ok('2 낡은 창 준비: 이봄이 사진이 원본까지 갔고, 정진혁·대표(둘째 창)의 멈춘 화면은 모름',phOf(d['projects/p1']).some(e=>e.byName==='이봄이')&&jn===0,jn);
   await J.evaluate(()=>{const el=document.querySelector('#sheetForm [data-k="addr"]');el.value='낡은 화면 저장';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});
   await J.locator('#saveSheet').click();await wait(2000);d=await dbv();
   ok('2 정진혁 낡은 창 저장 직후: 정진혁 사본·공용 칸에 이봄이 사진이 그대로',phOf(d['mine/u_jjh/projects/p1']).some(e=>e.byName==='이봄이')&&phOf(d['work/all/projects/p1']).some(e=>e.byName==='이봄이')&&d['work/all/projects/p1'].addr==='낡은 화면 저장',JSON.stringify([phOf(d['mine/u_jjh/projects/p1']).map(e=>e.byName),phOf(d['work/all/projects/p1']).map(e=>e.byName),(d['work/all/projects/p1']||{}).addr,(d['mine/u_jjh/projects/p1']||{}).addr]));
   await openS(J,'sites','s1');await putFiles(J,'#phBox input[data-phin]',['정진혁 낡은 화면 사진']);await wait(2500);
   for(let i=0;i<25;i++){await wait(1000);d=await dbv();const p=d['projects/p1'];if(p.addr==='낡은 화면 저장'&&phOf(p).some(e=>e.byName==='정진혁'))break}
   let p=d['projects/p1'];ok('2 대표 화면이 맞춘 뒤 원본: 주소는 정진혁 것 · 이봄이 사진·정진혁 사진 둘 다',p.addr==='낡은 화면 저장'&&phOf(p).some(e=>e.byName==='이봄이')&&phOf(p).some(e=>e.byName==='정진혁'),JSON.stringify(phOf(p).map(e=>e.byName)));
   // 대표 둘째 창(멈춤)에서 메모만 고쳐 저장 → 원본 사진이 빠지면 안 됨
   await A2.evaluate(()=>{const el=document.querySelector('#sheetForm [data-k="memo"]');el.value='대표 낡은 창';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});await A2.locator('#saveSheet').click();await wait(2500);d=await dbv();p=d['projects/p1'];
   ok('2 대표의 낡은 창 저장: 메모는 바뀌고 직원 사진 2장은 원본에 그대로',p.memo==='대표 낡은 창'&&phOf(p).some(e=>e.byName==='이봄이')&&phOf(p).some(e=>e.byName==='정진혁'),JSON.stringify(phOf(p).map(e=>e.byName)));
   await wait(5000);d=await dbv();ok('2 그 뒤 공용 칸도 사진 그대로 (대표 화면이 다시 맞춤)',phOf(d['work/all/projects/p1']).some(e=>e.byName==='이봄이')&&phOf(d['work/all/projects/p1']).some(e=>e.byName==='정진혁'),JSON.stringify(phOf(d['work/all/projects/p1']).map(e=>e.byName)));
   await ctx.close()}
  const i2=HTML.indexOf('// ===== 현장 사진·파일 (대표 지시 2026-11-13 2번)'),b2=HTML.slice(i2,HTML.indexOf('\n',HTML.indexOf('phUpload(z.dataset.phpid,fs.map(pasteName)')));
  ok('2 코드: alert/confirm/prompt/window.open/iframe 0 · 지우기(.delete) 0 · 새 저장 칸 없음',i2>0&&b2.length>3000&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe|\.delete\(|collection\(/.test(b2),b2.length+'자');
 }
 // ================= 20 =================
 if(on('20')){
  const SEED20=Object.assign({},SEED,{"reports/rOld":{d:"2026-11-05",who:"정진혁",rk:"현장 관리",ppno:"P-2611-901",files:[{id:"as_old1",name:"예전 보고 사진.jpg",type:"image/jpeg",size:1000}],createdBy:"u_jjh",createdAt:"2026-11-05T09:00:00Z",updatedAt:"2026-11-05T09:00:00Z"},
   "projects/p1":Object.assign({},SEED["projects/p1"],{photos:[{id:"ph_seed1",fid:"as_site1",name:"현장 일지 사진.png",type:"image/png",d:"2026-11-08",at:"2026-11-08T03:00:00Z",by:"u_bom",byName:"이봄이",from:"현장 관리"}]})});
  for(const [vn,opt] of VPS){
   const {ctx,open,dbv}=await mk(opt,SEED20,STUB);const A=await open('admin',12000);
   // 대표: 예전 업무 보고 사진은 계산해서 보이고, 직원도 보게 잇기 버튼
   await openS(A,'projects','p1');await tab(A,'prog');let t=await A.locator('#phBox').innerText();
   ok('20 '+vn+' 대표: 예전 업무 보고 사진도 현장 사진 한 곳에 (업무 보고 · 정진혁 · 11-05) + ‘직원도 보게 잇기’ 버튼',/2026-11-05 정진혁/.test(t.replace(/\s+/g,' '))&&/업무 보고/.test(t)&&(await A.locator('#phBox [data-phlink]').count())===1,t.replace(/\s+/g,' ').slice(0,200));
   await close(A);
   for(const who of WHO){const P=who==='admin'?A:await open(who,9000);const tag='20 '+vn+' '+USERS[who].name+': ';
    const up0=await P.evaluate(()=>(window.__mockUploads||[]).length);
    await openS(P,'reports',null);await P.evaluate(()=>{const el=document.querySelector('#sheetForm [data-k="ppno"]');el.value='P-2611-901';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});
    await putFiles(P,'#fileIn',[who+' 보고 사진']);await wait(1500);await P.locator('#saveSheet').click();let d,ref;
    for(let i=0;i<20;i++){await wait(800);d=await dbv();ref=phOf(d['work/all/projects/p1']).find(e=>e.from==='업무 보고'&&e.name===who+' 보고 사진.png');if(ref)break}
    const ups=await P.evaluate(n=>(window.__mockUploads||[]).slice(n),up0);
    const rep=Object.entries(d).find(([k,v])=>/^(mine\/u_[a-z]+\/)?reports\//.test(k)&&(v.files||[]).some(f=>f.name===who+' 보고 사진.png'));
    ok(tag+'업무 보고에서 프로젝트를 골라 올린 사진 → 그 프로젝트 현장 사진에 참조로 (같은 파일 id · 보고 id · 올린 사람)',!!ref&&!!rep&&ref.fid===(rep[1].files||[])[0].id&&ref.ref==='reports/'+rep[0].split('/').pop()&&ref.byName===USERS[who].name,JSON.stringify(ref));
    ok(tag+'파일은 한 번만 저장 (올리기 1번)',ups.length===1,JSON.stringify(ups.map(u=>u.name)));
    if(who!=='admin')await P.close()}
   // 다른 직원 화면: 남의 업무 보고는 못 보지만 사진은 프로젝트 현장 사진에 보임 · 날짜순
   const J=await open('jjh',9000);await openS(J,'projects','p1');await tab(J,'prog');await wait(800);
   const its=await J.evaluate(()=>[...document.querySelectorAll('#phBox .phit')].map(x=>x.innerText.replace(/\s+/g,' ')));
   const rpN=await J.evaluate(()=>window.__hfT.S().reports.filter(r=>r.createdBy!=='u_jjh').length);
   ok('20 '+vn+' 정진혁 화면: 남의 업무 보고는 안 보이지만(0건) 이봄이·채진아·대표가 보고에 올린 사진은 현장 사진에 보임 + 현장 일지 사진',rpN===0&&['이봄이','채진아','최윤수'].every(n=>its.some(t=>t.includes(n)&&/업무 보고/.test(t)))&&its.some(t=>/현장 관리/.test(t)&&t.includes('이봄이')),its.join(' // ').slice(0,300));
   const ds=its.map(t=>(t.match(/\d{4}-\d\d-\d\d/)||[''])[0]);ok('20 '+vn+' 날짜순(새것 먼저)',ds.every((x,i)=>!i||ds[i-1]>=x)&&ds.includes('2026-11-08'),ds.join(','));
   ok('20 '+vn+' 정진혁 화면: 대표가 잇기 전 예전 보고 사진(다른 직원 것 아님·본인 것)은 본인 보고라 보임 / 잇기 버튼은 없음',(await J.locator('#phBox [data-phlink]').count())===0);
   const B=await open('bom',9000);await openS(B,'projects','p1');await tab(B,'prog');let bt=await B.locator('#phBox').innerText();
   ok('20 '+vn+' 이봄이 화면: 잇기 전에는 정진혁의 예전 보고 사진(11-05)이 안 보임',!/2026-11-05/.test(bt));
   await openS(A,'projects','p1');await tab(A,'prog');await A.locator('#phBox [data-phlink]').click();let d;for(let i=0;i<20;i++){await wait(800);d=await dbv();if(phOf(d['work/all/projects/p1']).some(e=>e.fid==='as_old1'))break}
   const old=phOf(d['projects/p1']).find(e=>e.fid==='as_old1');
   ok('20 '+vn+' 대표 잇기 → 예전 보고 사진이 참조로 덧붙음 (업무 보고 원본은 그대로)',!!old&&old.ref==='reports/rOld'&&old.from==='업무 보고'&&(d['reports/rOld'].files||[]).length===1,JSON.stringify(old));
   for(let i=0;i<15;i++){await wait(800);bt=await B.locator('#phBox').innerText().catch(()=>'');if(/2026-11-05/.test(bt))break}
   ok('20 '+vn+' 그 뒤 이봄이 화면에도 예전 보고 사진(11-05 · 정진혁 · 업무 보고)',/2026-11-05/.test(bt)&&/업무 보고/.test(bt));
   ok('20 '+vn+' 직원 화면 현장 사진에 돈 정보 없음',!MONEY.test(bt));
   // 같은 보고를 다시 저장해도 두 번 붙지 않음
   const n1=phOf(d['projects/p1']).length;await openS(A,'reports','rOld');await A.locator('#saveSheet').click();await wait(3000);d=await dbv();
   ok('20 '+vn+' 같은 보고를 다시 저장해도 사진 참조가 겹치지 않음',phOf(d['projects/p1']).length===n1&&phOf(d['projects/p1']).filter(e=>e.fid==='as_old1').length===1,phOf(d['projects/p1']).length+' / '+n1);
   await ctx.close()}
  const i20=HTML.indexOf('// ===== 20번: 업무 보고에서'),b20=HTML.slice(i20,HTML.indexOf('async function phAct(',i20));
  ok('20 코드: alert/confirm/prompt/window.open/iframe 0 · 지우기 0 · 새 저장 칸 없음',i20>0&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe|\.delete\(|collection\(/.test(b20),b20.length+'자');
 }
 // ================= 3 =================
 if(on('3')){
  const F=(rgb)=>({patternType:"solid",fgColor:{rgb}});const S_=(v,fill)=>Object.assign({t:"s",v,w:v},fill?{s:F(fill)}:{s:{patternType:"none"}});const Z=fill=>({t:"z",s:F(fill)});
  // 실제 교문초 예정공정표와 같은 모양 (날짜 줄 '11/2' · 주말 회색 칸 · 파란 막대 · 요일 줄 · 아래 안내 글)
  const mkWs=(bars,extra)=>{const ws={};const ds=[];for(let i=0;i<19;i++){const d=new Date(Date.UTC(2026,10,2+i));ds.push((d.getUTCMonth()+1)+'/'+d.getUTCDate())}
   const col=i=>String.fromCharCode(67+i);ws.A1=S_('예 정 공 정 표');ws.A2=S_('공 사 명 : 시험 현장');ws.M2=S_('공사기간 : 2026.11.02 ~ 2026.11.20 (19일간)');ws.A3=S_('공  종','D9E1F2');
   ds.forEach((t,i)=>{const we=[5,6,12,13].includes(i);ws[col(i)+'3']=S_(t,we?'EDEDED':'D9E1F2');ws[col(i)+'4']=S_('월화수목금토일'[i%7],we?'EDEDED':'D9E1F2')});ws.V3=S_('비 고','D9E1F2');
   bars.forEach(([name,on],k)=>{const r=5+k;ws['A'+r]={t:'n',v:k+1,w:String(k+1)};ws['B'+r]=S_(name);[5,6,12,13].forEach(i=>{ws[col(i)+r]=Z('EDEDED')});on.forEach(i=>{ws[col(i)+r]=Z('4472C4')})});
   ws.A20=S_('※ 상기 공정표는 현장 여건에 따라 변동될 수 있습니다.');Object.assign(ws,extra||{});ws['!ref']='A1:V22';return ws};
  const BARS=[["계약 및 공사 준비",[0,1,2,3]],["철거공사 (안전매트 70㎡)",[5]],["매트 시공",[6,7]],["도장공사",[8]],["타일",[2,3,4,7,8]],["준공검사",[16]]];
  const WB1={SheetNames:["예정공정표"],Sheets:{"예정공정표":mkWs(BARS)}};
  const WB2={SheetNames:["표지","공정"],Sheets:{"표지":{A1:S_('표지'),'!ref':'A1:A1'},"공정":(()=>{const ws={A1:S_('2026년 12월 공정표'),B2:S_('공정')};for(let i=0;i<12;i++){const d=((28+i-1)%31)+1;ws[String.fromCharCode(67+i)+'2']={t:'n',v:d,w:String(d)}}
    ws.B3=S_('철거');ws.C3=S_('■');ws.D3=S_('■');ws.B4=S_('목공');['F','G','H','I'].forEach(c=>ws[c+'4']=S_('●'));ws.B5=S_('도배');ws.L5=S_('■');ws.M5=S_('■');ws['!ref']='A1:N6';return ws})()}};
  const WB3={SheetNames:["S"],Sheets:{"S":(()=>{const ws={A1:S_('공정'),A2:S_('설비'),A3:S_('전기')};for(let i=0;i<8;i++){ws[String.fromCharCode(66+i)+'1']={t:'n',v:46328+i,z:'m/d',w:'11/'+(2+i)}}ws.B2=Z('FFC000');ws.C2=Z('FFC000');ws.E3=Z('C6EFCE');ws.F3=Z('C6EFCE');ws['!ref']='A1:I3';return ws})()}};
  const XJSON=wb=>Buffer.from(JSON.stringify(wb),'utf8');
  const XST=`window.XLSX={read:u=>JSON.parse(new TextDecoder().decode(u)),utils:{sheet_to_csv:()=>''}};`;
  {const {ctx,open}=await mk({viewport:{width:1280,height:900}},SEED,STUB+XST);const A=await open('admin',10000);
   const r1=await A.evaluate(w=>window.__hfT.gjXl(w,''),WB1),s1=r1&&r1.items.map(x=>x.proc+':'+x.start.slice(5)+'~'+x.end.slice(5)).join(', ');
   ok('3 엑셀 읽기(교문초 양식): 날짜 줄 11/2~11/20 · 주말 회색은 막대 아님 · 주말을 건너 이어진 막대는 한 일정 · 요일 줄·안내 글은 공정 아님',s1==='계약 및 공사 준비:11-02~11-05, 철거공사 (안전매트 70㎡):11-07~11-07, 매트 시공:11-08~11-09, 도장공사:11-10~11-10, 타일:11-04~11-10, 준공검사:11-18~11-18'&&r1.items[0].start==='2026-11-02',s1);
   const r2=await A.evaluate(w=>window.__hfT.gjXl(w,''),WB2),s2=r2&&r2.items.map(x=>x.proc+':'+x.start+'~'+x.end).join(', ');
   ok('3 엑셀 읽기(날짜 숫자만 · ■● 표시 · 연말 넘어감): 시트 글자의 2026년 12월로 정하고 1일로 돌아가면 다음 달(2027-01)',s2==='철거:2026-12-28~2026-12-29, 목공:2026-12-31~2027-01-03, 도배:2027-01-06~2027-01-07'&&r2.sheet==='공정',s2);
   const r3=await A.evaluate(w=>window.__hfT.gjXl(w,'2026-11-01'),WB3),s3=r3&&r3.items.map(x=>x.proc+':'+x.start+'~'+x.end).join(', ');
   ok('3 엑셀 읽기(엑셀 날짜 칸 · 노랑·연초록 같은 밝은 막대색)',s3==='설비:2026-11-02~2026-11-03, 전기:2026-11-05~2026-11-06',s3);
   const r4=await A.evaluate(()=>window.__hfT.gjXl({SheetNames:["a"],Sheets:{a:{A1:{t:'s',v:'견적서',w:'견적서'},A2:{t:'s',v:'철거',w:'철거'},B2:{t:'n',v:1000000,w:'1,000,000'},'!ref':'A1:B2'}}},''));
   ok('3 공정표가 아닌 엑셀(견적서)은 아무것도 안 읽음',r4===null,JSON.stringify(r4));
   await ctx.close()}
  if(process.env.GJ_XLSX&&process.env.XLSX_JS){const {ctx,open}=await mk({viewport:{width:1280,height:900}},SEED,STUB);const A=await open('admin',10000);
   const b64=fs.readFileSync(process.env.GJ_XLSX).toString('base64');
   const r=await A.evaluate(async b=>{const X=await (async()=>{for(let i=0;i<30&&!window.XLSX;i++){try{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';document.head.appendChild(s);await new Promise(r=>{s.onload=r;s.onerror=r})}catch(e){}}return window.XLSX})();const u=Uint8Array.from(atob(b),c=>c.charCodeAt(0));return window.__hfT.gjXl(X.read(u,{type:'array',cellStyles:true}),'')},b64);
   const s=r&&r.items.map(x=>x.proc.split(' ')[0]+':'+x.start.slice(5)+'~'+x.end.slice(5)).join(', ');
   ok('3 실제 공정표 엑셀(교문초 예정공정표 ver-2, 드라이브 읽기만): 공정 10개 · 날짜 원본 막대와 같음',r&&r.items.length===10&&s==='계약:11-02~11-05, 철거공사:11-07~11-07, 경량벽체:11-08~11-08, 매트:11-08~11-09, 도장공사:11-10~11-10, 앵글:11-11~11-11, 전기공사:11-12~11-12, 보안공사:11-13~11-13, 공사:11-16~11-16, 준공검사:11-18~11-18',s);
   await ctx.close()}
  // ---- 첨부 → 확인 창 → 등록 → 다시 첨부(같음·바뀜·사람이 고침·없어짐) ----
  const SEED3=Object.assign({},SEED,{"projects/p3":Object.assign({},SEED["projects/p1"],{no:"P-2611-903",title:"정진혁 현장"}),"projects/p4":Object.assign({},SEED["projects/p2"],{no:"P-2611-904",title:"이봄이 현장"})});
  for(const [vn,opt] of VPS){
   const {ctx,open,dbv}=await mk(opt,SEED3,STUB+XST);const A=await open('admin',12000);
   for(const who of WHO){const P=who==='admin'?A:await open(who,9000);const tag='3 '+vn+' '+USERS[who].name+': ';const pid={admin:'p1',cja:'p2',jjh:'p3',bom:'p4'}[who];
    if(await P.locator('.okask').count())console.log('  (남은 확인 창: '+(await P.locator('.okask').innerText()).slice(0,80)+')');
    const cal0=Object.keys(await dbv()).filter(k=>k.startsWith('cal/')).length;
    await openS(P,'projects',pid);await tab(P,'cust');
    await P.evaluate(b=>{const u=Uint8Array.from(atob(b),c=>c.charCodeAt(0));const el=document.querySelector('#fileIn');const dt=new DataTransfer();dt.items.add(new File([u],'시험 예정공정표 v1.xlsx',{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}))},XJSON(WB1).toString('base64'));
    for(let i=0;i<15&&!(await P.locator('#gjVeil').count());i++)await wait(500);
    let g=await P.evaluate(()=>window.__hfT.gj());const d0=await dbv();
    ok(tag+'공정표 엑셀을 첨부하면 화면 안 확인 창(공정 | 시작 | 끝) · 아직 캘린더에 안 들어감',(await P.locator('#gjVeil.veil .sheet #gjT').count())===1&&g&&g.rows.length===6&&Object.keys(d0).filter(k=>k.startsWith('cal/')).length===cal0,JSON.stringify(g&&g.rows.map(r=>r.proc)));
    // 고치기: 도장공사 끝 → 11-11, 타일 줄 빼기
    await P.locator('#gjT [data-gjc="end"][data-gji="3"]').fill('2026-11-11');await P.locator('#gjT [data-gjc="end"][data-gji="3"]').dispatchEvent('change');await wait(300);
    await P.locator('#gjT [data-gju="4"]').uncheck();await wait(300);
    ok(tag+'확인 창 가로 넘침 없음',await P.evaluate(()=>{const s=document.querySelector('#gjVeil .sheet');return document.documentElement.scrollWidth<=window.innerWidth+2&&s.getBoundingClientRect().right<=window.innerWidth+1}));
    await P.locator('#gjVeil [data-gjsave]').click();let d;for(let i=0;i<15;i++){await wait(600);d=await dbv();if((d['projects/'+pid]||{}).sched||(d['work/all/projects/'+pid]||{}).sched)break}await wait(1500);d=await dbv();
    const ev=Object.entries(d).filter(([k,v])=>k.startsWith('cal/')&&v.gjPid===pid&&!v.gjOff).map(([k,v])=>v);const pr=(who==='admin'?d['projects/'+pid]:d['work/all/projects/'+pid])||{};
    ok(tag+'‘캘린더에 등록’ → 공용 캘린더 5건(뺀 줄 없음 · 고친 날짜) + 프로젝트 공정(sched) + 옛 공정 기록',ev.length===5&&ev.some(e=>e.title==='도장공사'&&e.start==='2026-11-10'&&e.end==='2026-11-11')&&!ev.some(e=>e.title==='타일')&&ev.every(e=>e.kind==='공정표'&&e.gjSig)&&(pr.sched||[]).length===5&&(pr.schedHist||[]).length===1,JSON.stringify([ev.length,(pr.sched||[]).length,(pr.schedHist||[]).length]));
    if(who==='admin'||who==='jjh'){
     // 같은 파일 다시 → 모두 '같음' → 쓰지 않음
     const at0=ev.map(e=>e.updatedAt).sort().join();await P.evaluate(()=>{});
     await P.evaluate(([pid])=>{},[pid]);
     await P.evaluate(b=>{const u=Uint8Array.from(atob(b),c=>c.charCodeAt(0));const el=document.querySelector('#fileIn');const dt=new DataTransfer();dt.items.add(new File([u],'시험 예정공정표 v1.xlsx',{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}))},XJSON(WB1).toString('base64'));
     for(let i=0;i<15&&!(await P.locator('#gjVeil').count());i++)await wait(500);
     await P.locator('#gjT [data-gjc="end"][data-gji="3"]').fill('2026-11-11');await P.locator('#gjT [data-gjc="end"][data-gji="3"]').dispatchEvent('change');await wait(300);await P.locator('#gjT [data-gju="4"]').uncheck();await wait(300);
     const st=await P.locator('#gjT tbody').innerText();
     await P.locator('#gjVeil [data-gjsave]').click();await wait(2500);d=await dbv();const ev2=Object.entries(d).filter(([k,v])=>k.startsWith('cal/')&&v.gjPid===pid&&!v.gjOff).map(([k,v])=>v);
     ok(tag+'같은 공정표를 다시 첨부·등록: 확인 창에 ‘같음’ · 두 번 들어가지 않고 다시 쓰지도 않음',/같음/.test(st)&&ev2.length===5&&ev2.map(e=>e.updatedAt).sort().join()===at0,st.replace(/\s+/g,' ').slice(0,120));
     // 사람이 캘린더에서 고침 (철거 → 11-06) · 새 공정표: 매트 시공 날짜 바뀜, 준공검사 빠짐, 철거 날짜도 바뀜(11-08)
     const eid=Object.entries(d).find(([k,v])=>k.startsWith('cal/')&&v.gjPid===pid&&/철거/.test(v.title))[0];
     await P.evaluate(async([eid])=>{const g=await window.__hfT.once?null:null;},[eid]);
     await A.evaluate(async k=>{const db=await window.claude.use('db');const g=await db.doc(k).get();const o=g.data();o.start='2026-11-06';o.end='2026-11-06';o.updatedAt=new Date().toISOString();o.updatedBy='u_cja';await db.doc(k).set(o)},eid);await wait(2500);
     const WBv2={SheetNames:["예정공정표"],Sheets:{"예정공정표":mkWs([["계약 및 공사 준비",[0,1,2,3]],["철거공사 (안전매트 70㎡)",[6]],["매트 시공",[8,9]],["도장공사",[8,9]]])}};
     await P.evaluate(b=>{const u=Uint8Array.from(atob(b),c=>c.charCodeAt(0));const el=document.querySelector('#fileIn');const dt=new DataTransfer();dt.items.add(new File([u],'시험 예정공정표 v2.xlsx',{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}))},XJSON(WBv2).toString('base64'));
     for(let i=0;i<15&&!(await P.locator('#gjVeil').count());i++)await wait(500);const st2=(await P.locator('#gjVeil').innerText()).replace(/\s+/g,' ');
     ok(tag+'고친 공정표: 확인 창에 같음·바뀜·사람이 고침 · 빠진 공정은 ‘지우지 않고 숨김’ 안내',/같음/.test(st2)&&/바뀜/.test(st2)&&/사람이 고침/.test(st2)&&/지우지 않고 캘린더에서 숨겨요/.test(st2),st2.slice(0,300));
     await P.locator('#gjVeil [data-gjsave]').click();for(let i=0;i<10&&!(await P.locator('.okask').count());i++)await wait(300);
     const ask=await P.locator('.okask').innerText().catch(()=>'');ok(tag+'사람이 고친 일정이 있으면 물어봄 (화면 안 확인 창)',/사람이 고친 일정/.test(ask),ask.slice(0,120));
     await P.locator('.okask [data-ok="0"]').click();await wait(3000);d=await dbv();
     const all=Object.entries(d).filter(([k,v])=>k.startsWith('cal/')&&v.gjPid===pid).map(([k,v])=>Object.assign({k},v));const live=all.filter(e=>!e.gjOff);
     const cr=all.find(e=>e.k===eid),mt=live.find(e=>e.title==='매트 시공'),jg=all.find(e=>e.title==='준공검사');
     ok(tag+'‘아니요’ → 사람이 고친 철거 일정은 그대로(11-06) · 매트 시공은 새 날짜(11-10~11-11) · 같은 공정은 문서 하나(두 번 등록 없음)',cr&&cr.start==='2026-11-06'&&!cr.gjOff&&mt&&mt.start==='2026-11-10'&&mt.end==='2026-11-11'&&live.filter(e=>e.title==='매트 시공').length===1&&live.filter(e=>e.title==='도장공사').length===1,JSON.stringify(live.map(e=>e.title+':'+e.start+'~'+e.end)));
     ok(tag+'빠진 공정(준공검사)은 지우지 않고 숨김(gjOff) · 캘린더 일정 문서 수는 줄지 않음',jg&&jg.gjOff===true&&all.length>=5,JSON.stringify(all.map(e=>e.title+(e.gjOff?'(숨김)':''))));
     const pr2=(who==='admin'?d['projects/'+pid]:d['work/all/projects/'+pid])||{};ok(tag+'프로젝트 공정은 새 공정표로 · 바꾸기 전 공정은 schedHist 에 남음',(pr2.sched||[]).length===4&&(pr2.schedHist||[]).length>=2&&(pr2.schedHist||[]).some(h=>(h.old||[]).length===5),JSON.stringify([(pr2.sched||[]).length,(pr2.schedHist||[]).map(h=>(h.old||[]).length)]));
     await close(P);await go(P,'#calendar');await wait(800);const ct=await P.locator('#view').innerText();const cal=await P.evaluate(p=>{const L=window.__hfT.cal?window.__hfT.cal():[];return L.filter(e=>e.gjPid===p).map(e=>e.title+':'+e.start)},pid);
     ok(tag+'캘린더: 이 현장의 숨긴 준공검사는 안 보이고(다른 현장 것만) 현장 공정은 보임 · 같은 공정 두 번 없음',!cal.some(x=>/준공검사/.test(x))&&/매트 시공/.test(ct)&&cal.length===4&&new Set(cal.map(x=>x.split(':')[0])).size===4,cal.join(', '));
    }
    await close(P);if(who!=='admin')await P.close()}
   await ctx.close()}
  const i3=HTML.indexOf('// 공정표 → 공용 캘린더 (2026-11-05 지시 · 2026-11-13 3번'),b3=HTML.slice(i3,HTML.indexOf('// ===== 현장 사진·파일 (대표 지시 2026-11-13 2번)'));
  ok('3 코드: alert/confirm/prompt/window.open/iframe 0 · 지우기(.delete) 0 (빠진 일정은 숨김) · 새 저장 칸 없음(cal·projects 만)',i3>0&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe|\.delete\(/.test(b3)&&(b3.match(/collection\("([^"]+)"\)/g)||[]).every(x=>/"cal"/.test(x)),b3.length+'자');
 }
 // ================= 4 =================
 if(on('4')){
  const AIW=`window.__aiLog=[];window.__MOCKSAMPLE=(()=>{const f=async()=>({text:''});f.json=async(prompt,o)=>{const im=(o&&o.images)||[];const dims=[];for(const b of im){try{const bm=await createImageBitmap(b);dims.push(bm.width+'x'+bm.height)}catch(e){dims.push('?')}}window.__aiLog.push({prompt,n:im.length,dims,tier:o&&o.modelTier});if(window.__aiFail)throw {code:window.__aiFail,message:'mock'};
   if(/공정표/.test(prompt))return {items:[{date:'2026-11-02',proc:'철거'},{date:'2026-11-03',proc:'철거'},{date:'2026-11-05',proc:'목공'}],note:''};return window.__aiAns||{proc:'철거',pct:62,why:'벽체 철거가 대부분 끝남'}};f.limits=async()=>({images:true});return f})();`;
  const SCH=[{proc:"철거",start:"2026-11-02",end:"2026-11-04"},{proc:"목공",start:"2026-11-05",end:"2026-11-10"}];
  const today=new Date(Date.now()+9*36e5).toISOString().slice(0,10);
  const lim=Array.from({length:15},(_,i)=>({id:'pgL'+i,kind:'추정',at:today+'T01:00:00Z',by:'u_x',byName:'누군가',proc:'철거',pct:10}));
  const SEED4=Object.assign({},SEED,{"projects/p1":Object.assign({},SEED["projects/p1"],{sched:SCH}),"projects/p2":Object.assign({},SEED["projects/p2"],{sched:SCH}),
   "projects/p3":Object.assign({},SEED["projects/p1"],{no:"P-2611-903",title:"정진혁 현장",sched:SCH}),"projects/p4":Object.assign({},SEED["projects/p2"],{no:"P-2611-904",title:"이봄이 현장",sched:SCH,progLog:lim}),
   "sites/s2":{pno:"P-2611-902",name:"남의 현장",status:"공사 중",mgr:"이봄이",files:[],updatedAt:T0},"sites/s3":{pno:"P-2611-903",name:"정진혁 현장",status:"공사 중",mgr:"정진혁",files:[],updatedAt:T0},"sites/s4":{pno:"P-2611-904",name:"이봄이 현장",status:"공사 중",mgr:"이봄이",files:[],updatedAt:T0}});
  const PJ={admin:['p1','s1'],cja:['p2','s2'],jjh:['p3','s3'],bom:['p4','s4']};
  const pgOf=(d,pid,who)=>(((who==='admin'?d['projects/'+pid]:d['work/all/projects/'+pid])||{}).progLog||[]);
  for(const [vn,opt] of VPS){
   const {ctx,open,dbv}=await mk(opt,SEED4,STUB+AIW);const A=await open('admin',12000);
   for(const who of WHO){const P=who==='admin'?A:await open(who,9000);const tag='4 '+vn+' '+USERS[who].name+': ';const [pid,sid]=PJ[who];
    await openS(P,'sites',sid);
    ok(tag+'현장 일지 창에 공정 진행 칸(전체 %·공정별 막대·직접 % 입력)',(await P.locator('#pgBox').count())===1&&/전체 0%/.test(await P.locator('#pgBox').innerText())&&(await P.locator('#pgBox [data-pgman]').count())===1);
    const n0=await P.evaluate(()=>window.__aiLog.length);await putFiles(P,'#phBox input[data-phin]',['공사 사진']);let d,L=[];
    for(let i=0;i<20;i++){await wait(700);d=await dbv();L=pgOf(d,pid,who);if(L.some(e=>e.kind==='추정'&&e.by===USERS[who].id)||(who==='bom'&&i>8))break}
    const ai=await P.evaluate(n=>window.__aiLog.slice(n),n0);
    if(who==='bom'){ok(tag+'하루 횟수(프로젝트 15번)를 다 쓴 프로젝트: AI 를 부르지 않음 · 사진은 저장',ai.length===0&&!L.some(e=>e.by==='u_bom')&&((d['work/all/projects/'+pid]||{}).photos||[]).length===1,JSON.stringify([ai.length,L.length]));
     await P.locator('#pgBox [data-pgman]').click();await wait(400);await P.selectOption('#pgProc','목공');await P.fill('#pgPct','40');await P.locator('#pgBox [data-pgsave]').click();
     for(let i=0;i<15;i++){await wait(600);d=await dbv();L=pgOf(d,pid,who);if(L.some(e=>e.kind==='확인'))break}
     const c=L.find(e=>e.kind==='확인');ok(tag+'직접 % 입력 → 확인 기록(직접) · 전체 = 공정표 기간 비중 (목공 6/9 × 40% = 27%)',c&&c.src==='직접'&&c.proc==='목공'&&c.pct===40&&/전체 27%/.test(await P.locator('#pgBox').innerText()),JSON.stringify(c));
     await close(P);await P.close();continue}
    const sg=L.find(e=>e.kind==='추정'&&e.by===USERS[who].id);
    ok(tag+'사진을 올리면 AI 에 줄인 사진 1장 + 공정 목록 → ‘추정’ 기록 (철거 62→60% · 근거 · 사진 id)',ai.length===1&&ai[0].n===1&&ai[0].dims.every(x=>{const [w,h]=x.split('x').map(Number);return Math.max(w,h)<=1024})&&/철거 \/ 목공/.test(ai[0].prompt)&&/개인정보는 설명하지 마세요/.test(ai[0].prompt)&&!/12,345,678|12345678|홍길동|김철수/.test(ai[0].prompt)&&sg&&sg.proc==='철거'&&sg.pct===60&&/벽체/.test(sg.why)&&(sg.phs||[]).length===1,JSON.stringify([ai.map(x=>[x.n,x.dims,x.tier]),sg]));
    await wait(800);let t=await P.locator('#pgBox').innerText();
    ok(tag+'확인 전에는 ‘추정’ 표시만 · 전체 % 는 그대로 0%',/추정/.test(t)&&/철거 약 60%/.test(t.replace(/\s+/g,' '))&&/전체 0%/.test(t),t.replace(/\s+/g,' ').slice(0,160));
    await P.locator('#pgBox [data-pgok]').first().click();for(let i=0;i<15;i++){await wait(600);d=await dbv();L=pgOf(d,pid,who);if(L.some(e=>e.kind==='확인'&&e.ref===sg.id))break}
    await wait(700);t=await P.locator('#pgBox').innerText();
    ok(tag+'‘맞아요’ → 확인 기록(AI 확인) · 전체 = 철거 3/9 × 60% = 20% · 추정 칸 사라짐',L.some(e=>e.kind==='확인'&&e.ref===sg.id&&e.src==='AI 확인'&&e.pct===60)&&/전체 20%/.test(t)&&(await P.locator('#pgBox [data-pgok]').count())===0,t.replace(/\s+/g,' ').slice(0,160));
    // 고치기
    await P.evaluate(()=>{window.__aiAns={proc:'목공',pct:30,why:'천장 틀 일부'}});await putFiles(P,'#phBox input[data-phin]',['목공 사진']);
    for(let i=0;i<20;i++){await wait(700);d=await dbv();L=pgOf(d,pid,who);if(L.some(e=>e.kind==='추정'&&e.proc==='목공'))break}await wait(800);
    await P.locator('#pgBox [data-pgfix]').first().click();await wait(400);await P.fill('#pgPct','50');await P.locator('#pgBox [data-pgsave]').click();
    for(let i=0;i<15;i++){await wait(600);d=await dbv();L=pgOf(d,pid,who);if(L.some(e=>e.kind==='확인'&&e.src==='고침'))break}await wait(700);t=await P.locator('#pgBox').innerText();
    ok(tag+'‘고치기’ → 목공 50% (고침) · 전체 = (3×60 + 6×50)/9 = 53%',L.some(e=>e.kind==='확인'&&e.src==='고침'&&e.proc==='목공'&&e.pct===50)&&/전체 53%/.test(t),t.replace(/\s+/g,' ').slice(0,160));
    if(who==='admin'){
     // 아니에요 → 무시 · 진행률 그대로
     await P.evaluate(()=>{window.__aiAns={proc:'철거',pct:100,why:'다 끝남'}});await putFiles(P,'#phBox input[data-phin]',['또 사진']);for(let i=0;i<20;i++){await wait(700);d=await dbv();L=pgOf(d,pid,who);if(L.some(e=>e.kind==='추정'&&e.pct===100))break}await wait(800);
     await P.locator('#pgBox [data-pgno]').first().click();await wait(1500);d=await dbv();L=pgOf(d,pid,who);t=await P.locator('#pgBox').innerText();
     ok(tag+'‘아니에요’ → 무시 기록 · 진행률 그대로 53%',L.some(e=>e.kind==='무시')&&/전체 53%/.test(t));
     // AI 오류 → 사진은 저장, 실패 기록(횟수에 셈)
     const ph0=((d['projects/'+pid]||{}).photos||[]).length;await P.evaluate(()=>{window.__aiFail='rate_limited'});await putFiles(P,'#phBox input[data-phin]',['오류 사진']);
     for(let i=0;i<20;i++){await wait(700);d=await dbv();L=pgOf(d,pid,who);if(L.some(e=>e.kind==='AI 실패'))break}
     ok(tag+'AI 오류(한도 등) → 사진은 저장 · ‘AI 실패’ 기록 · 진행률은 안 바뀜',L.some(e=>e.kind==='AI 실패'&&e.err==='rate_limited')&&((d['projects/'+pid]||{}).photos||[]).length===ph0+1);
     await P.evaluate(()=>{window.__aiFail=null});
    }
    ok(tag+'공정 진행 칸에 돈 정보 없음',!MONEY.test(await P.locator('#pgBox').innerText()));
    await close(P);
    await go(P,'#sites');await wait(800);const cell=await P.locator('[data-sprog="'+(who==='admin'?'P-2611-901':who==='cja'?'P-2611-902':'P-2611-903')+'"]').first().innerText().catch(()=>'');
    ok(tag+'현장 관리 목록에 공정 진행 막대 (전체 % · 공정별 % · 갱신 날짜)',/공정 53%/.test(cell)&&/철거 60%/.test(cell)&&/목공 50%/.test(cell)&&/갱신/.test(cell),cell.replace(/\s+/g,' '));
    await openS(P,'projects',pid);await tab(P,'prog');ok(tag+'프로젝트 진행 상황 탭에도 같은 공정 진행 막대',(await P.locator('#pgBox').isVisible())&&/전체 53%/.test(await P.locator('#pgBox').innerText()));await close(P);
    if(who!=='admin')await P.close()}
   ok('4 '+vn+' 휴대폰·PC 가로 넘침 없음 (공정 진행 칸)',await A.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
   // PDF·사진 공정표 → AI → 같은 확인 창
   await openS(A,'projects','p1');await tab(A,'cust');const n1=await A.evaluate(()=>window.__aiLog.length);
   await putFiles(A,'#fileIn',['현장 공정표']);for(let i=0;i<20&&!(await A.locator('#gjVeil').count());i++)await wait(500);
   const g=await A.evaluate(()=>window.__hfT.gj());const ai2=await A.evaluate(n=>window.__aiLog.slice(n),n1);
   ok('4 '+vn+' 사진 공정표(이름에 공정표)는 AI 로 읽어 같은 확인 창 (철거 11-02~11-03 · 목공 11-05) · 아직 캘린더에 안 넣음',g&&g.rows.map(r=>r.proc+':'+r.start.slice(5)+'~'+r.end.slice(5)).join(',')==='철거:11-02~11-03,목공:11-05~11-05'&&ai2.length===1&&/공정표/.test(ai2[0].prompt)&&/AI가 읽은 결과/.test(g.note),JSON.stringify(g&&g.rows));
   await A.locator('#gjVeil [data-gjclose]').click();await close(A);
   await ctx.close()}
  // AI 없는 화면(연습 모드·권한 없음): 사진은 저장 · 직접 입력 안내
  {const {ctx,open,dbv}=await mk({viewport:{width:1280,height:900}},SEED4,STUB);await open('admin',12000);const J=await open('jjh',10000);await openS(J,'sites','s3');
   await putFiles(J,'#phBox input[data-phin]',['AI 없는 사진']);await wait(4000);const d=await dbv();const w=d['work/all/projects/p3']||{};
   ok('4 AI 를 못 쓰는 화면: 사진은 저장 · 추정 없음 · ‘AI 추정을 쓸 수 없어요 · 직접 % 입력’ 안내',(w.photos||[]).length===1&&!(w.progLog||[]).length&&/AI 추정을 쓸 수 없어요/.test(await J.locator('#pgBox').innerText()));
   await ctx.close()}
  // 낡은 창 저장 보호: 정진혁 화면 멈춤 → 이봄이가 추정 확인 → 정진혁 낡은 프로젝트 창 저장 → 진행 기록 남음
  {const FREEZE=BCW+`if(window.__MOCKUSER.id==='u_jjh'){window.__MOCKEXACT=true;window.__SUBPOLL=1e9}`;
   const S2=Object.assign({},SEED4,{"projects/p1":Object.assign({},SEED4["projects/p1"],{progLog:[{id:'pgS1',kind:'추정',at:'2026-11-12T01:00:00Z',by:'u_cja',byName:'채진아',proc:'철거',pct:80,why:'거의 끝'}]})});
   const {ctx,open,dbv}=await mk({viewport:{width:1280,height:900}},S2,STUB+FREEZE);const A=await open('admin',12000);const B=await open('bom',9000);const J=await open('jjh',10000);await J.evaluate(()=>{window.__mute=true});
   await openS(J,'projects','p1');await openS(B,'sites','s1');await B.locator('#pgBox [data-pgok]').click();let d;
   for(let i=0;i<25;i++){await wait(1000);d=await dbv();if((d['projects/p1'].progLog||[]).some(e=>e.kind==='확인'))break}
   await J.evaluate(()=>{const el=document.querySelector('#sheetForm [data-k="memo"]');el.value='정진혁 낡은 창';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});await J.locator('#saveSheet').click();
   for(let i=0;i<25;i++){await wait(1000);d=await dbv();if(d['projects/p1'].memo==='정진혁 낡은 창')break}await wait(4000);d=await dbv();
   const pl=d['projects/p1'].progLog||[],wl=(d['work/all/projects/p1']||{}).progLog||[];
   ok('4 낡은 창 저장(정진혁 멈춘 화면): 메모는 바뀌고 이봄이의 확인 기록·채진아 추정은 원본·공용 칸에 그대로',d['projects/p1'].memo==='정진혁 낡은 창'&&pl.some(e=>e.kind==='확인'&&e.byName==='이봄이')&&pl.some(e=>e.id==='pgS1')&&wl.some(e=>e.kind==='확인'),JSON.stringify([pl.map(e=>e.kind+':'+e.byName),wl.length]));
   await ctx.close()}
  const i4=HTML.indexOf('// ===== 공정 진행률 (대표 지시 2026-11-13 4번'),b4=HTML.slice(i4,HTML.indexOf('\n',HTML.indexOf('if(await pgAdd(pid,{kind:"확인",ref,proc,pct,src:ref?"고침":"직접"}))')));
  ok('4 코드: alert/confirm/prompt/window.open/iframe 0 · 지우기 0 · 새 저장 칸 없음(프로젝트 줄 progLog 만) · fetch 없음(외부 주소 안 부름)',i4>0&&b4.length>3000&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe|\.delete\(|collection\(|fetch\(/.test(b4),b4.length+'자');
 }
 // @@B3_MORE@@
 console.log('\n== 묶음 3 시험: '+R.filter(x=>x).length+' / '+R.length+' 통과 · 페이지 오류 '+errs.length+' · 브라우저 창(alert 등) '+dialogs.length);errs.slice(0,10).forEach(e=>console.log('  오류: '+e));dialogs.slice(0,5).forEach(e=>console.log('  창: '+e));
 await b.close();process.exit(R.every(x=>x)&&!errs.length?0:1)})();
