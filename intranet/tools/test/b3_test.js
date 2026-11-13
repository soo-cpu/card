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
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
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
 // @@B3_MORE@@
 console.log('\n== 묶음 3 시험: '+R.filter(x=>x).length+' / '+R.length+' 통과 · 페이지 오류 '+errs.length+' · 브라우저 창(alert 등) '+dialogs.length);errs.slice(0,10).forEach(e=>console.log('  오류: '+e));dialogs.slice(0,5).forEach(e=>console.log('  창: '+e));
 await b.close();process.exit(R.every(x=>x)&&!errs.length?0:1)})();
