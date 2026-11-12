// 다음 지시 2026-11-12 v0 시험: node intranet/tools/test/v1112_test.js [index.html]
// 1 첨부(끌어놓기·붙여넣기·파일 선택, PC·휴대폰) 2 휴대폰 열·전체 보기·두 손가락 확대 3 알림 중복 4 홈 맨 아래(대표만) 5 현장 진행 상황 열
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const SEED={"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장",email:"jjh@test"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장",email:"bom@test"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",email:"cja@test"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",cat:"주거",inq:"2026-11-01",end:"2026-12-20",updatedAt:"2026-11-01T00:00:00Z"},
 "sites/s1":{pno:"P-2611-901",name:"시험 현장",customer:"홍길동",mgr:"정진혁",status:"공사 중",proc:"타일",progress:45,logs:[{d:"2026-11-10",text:"타일 시작"}],updatedAt:"2026-11-01T00:00:00Z"},
 "quotes/q1":{qno:"P-2611-901-1차",pno:"P-2611-901",name:"홍길동",site:"시험 현장",amount:"3000000",status:"계약",d:"2026-11-02",updatedAt:"2026-11-01T00:00:00Z"},
 "approvals/a1":{kind:"기안품의서 (본사)",title:"26.11.10 코너비드 발주",status:"승인",pno:"본사",amount:120000,createdBy:"u_bom",createdAt:"2026-11-10T03:00:00Z",updatedAt:"2026-11-10T03:48:00Z"},
 "approvals/a2":{kind:"기안품의서 (본사)",title:"26.11.12 시험 발주",status:"결재 진행",pno:"본사",amount:50000,createdBy:"u_bom",createdAt:"2026-11-12T01:00:00Z",updatedAt:"2026-11-12T01:00:00Z"},
 // 실제 알림 모양 그대로: 같은 서류 '결재 차례'가 대표에게 2번
 "notify/n1":{apId:"a2",at:"2026-11-12T01:10:00Z",by:"u_cja",kind:"결재 차례",name:"기안품의서 (본사) · 26.11.12 시험 발주",readBy:{},to:["최윤수"],work:"기안 이봄이"},
 "notify/n2":{apId:"a2",at:"2026-11-12T01:10:18Z",by:"u_boss",kind:"결재 차례",name:"기안품의서 (본사) · 26.11.12 시험 발주",readBy:{},to:["최윤수"],work:"기안 이봄이"},
 "notify/n3":{apId:"a1",at:"2026-11-10T03:47:03Z",by:"u_boss",kind:"결재 차례",name:"기안품의서 (본사) · 26.11.10 코너비드 발주",readBy:{},to:["최윤수"],work:"기안 이봄이"},
 "notify/n4":{apId:"a1",at:"2026-11-10T03:47:21Z",by:"u_boss",kind:"결재 차례",name:"기안품의서 (본사) · 26.11.10 코너비드 발주",readBy:{},to:["최윤수"],work:"기안 이봄이"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(name,v,extra)=>{R.push([v?"통과":"실패",name,extra||""]);console.log(v?"통과":"실패",name,extra||"")};
(async()=>{const b=await chromium.launch();const errs=[];
 async function mk(opts){const ctx=await b.newContext(opts);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);return {ctx,seed}}
 async function open(env,who){const p=await env.ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{errs.push(who+': 브라우저 대화상자 '+d.type());d.dismiss()});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(6000);return p}
 const FILES=[["견적서.pdf","application/pdf",'%PDF-1.4 test'],["단가표.xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","PK xlsx"],["현장.png","image/png","png"]];
 async function attachTest(p,tag){
  await p.evaluate(()=>{location.hash="#approvals"});await wait(1200);
  await p.locator('button').filter({hasText:'결재 올리기'}).first().click();await wait(1200);
  const hasZone=await p.locator('#filePaste').count(),hasBtn=await p.locator('label:has(#fileIn)').filter({hasText:'파일 선택'}).count();ok(tag+' 첨부 칸·파일 선택 버튼',hasZone===1&&hasBtn===1);
  // ① 끌어다 놓기 (PDF)
  await p.evaluate(F=>{const dt=new DataTransfer();dt.items.add(new File([F[2]],F[0],{type:F[1]}));const z=document.getElementById('filePaste');z.dispatchEvent(new DragEvent('dragover',{dataTransfer:dt,bubbles:true,cancelable:true}));z.dispatchEvent(new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true}))},FILES[0]);await wait(1500);
  // ② 붙여넣기 Ctrl+V (사진, 창 아무 곳 = 제목 칸이 아닌 곳)
  await p.evaluate(F=>{const dt=new DataTransfer();dt.items.add(new File([F[2]],"image.png",{type:F[1]}));const ev=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true});document.getElementById('filePaste').dispatchEvent(ev)},FILES[2]);await wait(1500);
  // ③ 파일 선택 (엑셀)
  await p.setInputFiles('#fileIn',{name:'단가표.xlsx',mimeType:FILES[1][1],buffer:Buffer.from('PK xlsx test')});for(let k=0;k<10&&!/단가표/.test(await p.locator('#fileList').innerText());k++)await wait(500);
  const list=await p.locator('#fileList').innerText();ok(tag+' 세 방식 모두 첨부 (이름·용량)',/견적서\.pdf/.test(list)&&/사진 .*\.png/.test(list)&&/단가표\.xlsx/.test(list)&&/KB/.test(list),list.replace(/\n/g,' / '));
  const cnt=await p.locator('#fileCount').innerText();ok(tag+' 첨부 개수·합계 용량',/첨부 3개/.test(cnt),cnt);
  await p.locator('#fileList button[data-rmfile]').first().click();await wait(300);const list2=await p.locator('#fileList').innerText();ok(tag+' 삭제 버튼',!/견적서\.pdf/.test(list2)&&/단가표/.test(list2));
  // 창 아무 곳 붙여넣기 (본문 칸이 아닌 곳)
  await p.evaluate(()=>{const dt=new DataTransfer();dt.items.add(new File(['x'],"캡처.png",{type:'image/png'}));document.querySelector('.sheet h3').dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}))});await wait(1200);
  ok(tag+' 창 아무 곳 Ctrl+V',/캡처\.png/.test(await p.locator('#fileList').innerText()));
  await p.screenshot({path:OUT+'/attach_'+tag+'.png'});
  await p.keyboard.press('Escape');await wait(300)}
 // ===== PC (대표) =====
 let E=await mk({viewport:{width:1280,height:900}});let A=await open(E,'admin');
 await attachTest(A,'PC');
 await A.evaluate(()=>{location.hash="#home"});await wait(1200);
 const home=await A.evaluate(()=>document.body.innerText);
 const m=home.match(/알림 (\d+)건/);ok('3 알림 중복 → 1건 (승인 끝난 결재 차례는 숨김)',m&&m[1]==="1",m?m[0]:"알림 칸 없음");
 ok('4 대표 홈: 도입 요약·버전 기록 있음',/인트라넷 도입 요약/.test(home)&&/버전 기록/.test(home));
 ok('4 대표 홈: 기본 접힘',await A.evaluate(()=>[...document.querySelectorAll('details.plan')].every(d=>!d.open)));
 ok('4 할 일 표: 낡은 줄 지움',!/v0\.3|참여자/.test(await A.evaluate(()=>[...document.querySelectorAll('details.plan')].map(d=>d.innerHTML).join(''))));
 await A.locator('[data-notiok]').first().click();await wait(800);const D=JSON.parse(await E.seed.evaluate(()=>localStorage.getItem('mockdb')));
 ok('3 확인 누르면 같은 묶음 2건 모두 읽음',!!(D['notify/n1'].readBy||{}).u_boss&&!!(D['notify/n2'].readBy||{}).u_boss);
 await A.evaluate(()=>{location.hash="#sites"});await wait(1200);ok('5 현장 관리 진행 상황 열 (공정·%·일지)',/진행 상황/.test(await A.locator('thead').first().innerText())&&/45%/.test(await A.locator('tbody').first().innerText()));
 await A.locator('#q').fill('홍길동');await wait(800);ok('5 현장 관리 고객명 검색',/시험 현장/.test(await A.locator('tbody').first().innerText()));
 await A.evaluate(()=>{location.hash="#quotes"});await wait(1000);await A.locator('#q').fill('홍길동');await wait(800);ok('5 견적 관리 고객명 검색 → 그 고객 견적',(await A.locator('tbody tr').count())===1);
 await A.locator('tbody tr').first().click();await wait(1000);ok('5 견적 줄 누르면 프로젝트',/P-2611-901/.test(await A.locator('.sheet').first().innerText().catch(()=>"")));
 await A.close();
 // 직원 홈
 for(const w of ['jjh','cja']){const P=await open(E,w);await P.evaluate(()=>{location.hash="#home"});await wait(1000);const t=await P.evaluate(()=>document.body.innerText);ok('4 '+w+' 홈: 도입 요약·버전 기록 안 보임',!/인트라넷 도입 요약|버전 기록|v0\.99-/.test(t));await P.close()}
 await E.ctx.close();
 // ===== 휴대폰 (정진혁, Pixel 7) =====
 E=await mk(Object.assign({},devices['Pixel 7']));{const Jn=await open(E,'jjh');const nv=await Jn.evaluate(()=>[...document.querySelectorAll('#nav>a')].filter(a=>getComputedStyle(a).display!=="none").length);ok('2 정진혁 휴대폰 메뉴: 중요한 메뉴만',nv<=9,'보이는 메뉴 '+nv);await attachTest(Jn,'휴대폰 정진혁');await Jn.close()}
 const J=await open(E,'admin'); // 표 열 시험은 자료가 있는 대표 계정 (직원 사본은 대표 화면이 열려야 생김)
 await J.evaluate(()=>{location.hash="#projects"});await wait(1500);
 const vis=async()=>J.evaluate(()=>[...document.querySelectorAll('.tablebox thead th')].filter(th=>getComputedStyle(th).display!=="none").map(th=>th.innerText.trim()));
 let th=await vis();ok('2 휴대폰 프로젝트: 중요한 열만',th.length<=5,th.join(','));
 const navVis=await J.evaluate(()=>[...document.querySelectorAll('#nav>a')].filter(a=>getComputedStyle(a).display!=="none").length);ok('2 휴대폰 메뉴: 중요한 메뉴만',navVis<=9,'보이는 메뉴 '+navVis);
 await J.screenshot({path:OUT+'/mob_projects.png'});
 const over=await J.evaluate(()=>document.documentElement.scrollWidth-innerWidth);ok('2 휴대폰 가로 넘침 없음',over<=2,'넘침 '+over+'px');
 await J.tap('#pcvBtn');await wait(800);th=await vis();const thAll=await J.evaluate(()=>document.querySelectorAll('.tablebox thead th').length);ok('2 전체 보기 → 모든 열',th.length===thAll&&thAll>5,th.join(','));
 const z=await J.evaluate(()=>document.querySelector('.app').style.zoom);ok('2 전체 보기 → 화면 폭에 맞게 줄임',parseFloat(z)>0&&parseFloat(z)<1,'zoom '+z);
 await J.screenshot({path:OUT+'/mob_pcview.png'});
 await J.tap('#pcvBtn');await wait(600);
 // 두 손가락 확대 (CDP 터치)
 const cdp=await J.context().newCDPSession(J);const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map(([x,y],i)=>({x,y,id:i}))});
 await T('touchStart',[[150,400],[250,400]]);for(let k=1;k<=6;k++){await T('touchMove',[[150-k*15,400],[250+k*15,400]]);await wait(40)}await T('touchEnd',[]);await wait(500);
 const z2=await J.evaluate(()=>document.querySelector('.app').style.zoom);ok('2 두 손가락 벌리면 확대',parseFloat(z2)>1.3,'zoom '+z2);
 await J.screenshot({path:OUT+'/mob_pinch.png'});
 const zr=await J.locator('#zoomReset').isVisible();ok('2 확대하면 원래 크기 버튼',zr);if(zr){await J.tap('#zoomReset');await wait(300)}
 ok('2 원래 크기',!(await J.evaluate(()=>document.querySelector('.app').style.zoom)));
 for(const h of ['#approvals','#quotes']){await J.evaluate(x=>{location.hash=x},h);await wait(1000);const t2=await vis();ok('2 휴대폰 '+h+' 중요한 열만',t2.filter(Boolean).length<=4,t2.join(','))}
 await J.close();await E.ctx.close();
 ok('오류·브라우저 대화상자 0',!errs.length,errs.slice(0,5).join(' | '));
 fs.writeFileSync(OUT+'/v1112_result.json',JSON.stringify(R,null,1));
 await b.close()})();
