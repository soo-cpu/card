// 대표 결재 한 번에 시험 (대표 지시 2026-11-28, v0.99-52): node intranet/tools/test/ap_once_test.js [index.html]
// 가짜 공용 저장소(mock.js)에서만 돌림 — 실제 운영 데이터에는 시험 문서를 만들지 않음
const {chromium}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
// 접근 규칙은 perm1113_test.js 와 같은 줄 (approvals 는 따로 규칙 없음 = 공유받은 사람 읽기·쓰기, 승인 권한은 화면의 canDecide 가 가림)
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-10T00:00:00Z",T1="2026-11-26T01:00:00Z";
const NM={u_jjh:"정진혁",u_bom:"이봄이",u_cja:"채진아",u_boss:"최윤수"};
const FIX=[["검토","채진아"],["결재","최윤수"],["최종결재","신혜현"]];
const line=by=>FIX.filter((x,i)=>i===2||x[1]!==NM[by]).map(x=>({role:x[0],name:x[1]}));
const H=(name,by)=>({at:"2026-11-26T02:00:00.000Z",by:by||"u_cja",name,result:"승인",note:""});
// step: 지금 차례 칸 번호 · hist: 이미 승인된 칸
const ap=(by,title,step,x)=>{const al=line(by);return Object.assign({kind:"기안품의서 (본사)",title,status:step>0?"결재 진행":"결재 대기",step,pno:"본사",amount:120000,createdBy:by,createdAt:T1,updatedAt:T1,approver:"신혜현",reviewer:"",aline:al,history:al.slice(0,step).map(a=>H(a.name,a.name==="채진아"?"u_cja":"u_boss"))},x||{})};
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장",joined:"2023-02-20"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장",joined:"2023-12-01"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",joined:"2020-06-15"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",cat:"주거",inq:"2026-11-01",work:"욕실",files:[],updatedAt:T0,__at:T0},
 "approvals/a1":ap("u_jjh","한번에 시험 일",1),                                   // ① 검토 끝 · 최윤수 차례
 "approvals/a2":ap("u_jjh","한번에 시험 이 현장",1,{kind:"기안품의서 (현장)",pno:"P-2611-901",amount:777000,vendor:"시험타일",proc:"타일"}), // ② 원가 반영
 "approvals/a3":ap("u_bom","한번에 시험 삼",2),                                   // ③ 최윤수 칸만 승인된 대기 문서
 "approvals/a4":ap("u_boss","한번에 시험 사 대표기안",1),                          // ④ 대표 한 명(신혜현 칸만)
 "approvals/a5":ap("u_bom","한번에 시험 오 반려",1),                               // ⑤ 반려
 "approvals/a6":ap("u_jjh","한번에 시험 육 휴가",1,{kind:"휴가신청서",leave:"연차",from:"2026-12-03",to:"2026-12-03",days:1,pno:"",amount:""}), // ② 연차 캘린더
 "approvals/a7":ap("u_jjh","한번에 시험 칠 검토남음",0),                           // 검토가 남은 문서
 "approvals/a8":ap("u_jjh","한번에 시험 팔 끄기",1),                               // ⑥ 설정 끔
 "approvals/a9":ap("u_cja","한번에 시험 구 채진아기안",0),                         // 채진아 기안(검토 칸 없음) · 최윤수 차례
 "fin/bonuspay":{pays:[{id:"bp1",docNo:"B26-11-01",name:"정진혁",d:"2026-11-20",amt:1000000,period:"시험",status:"결재 대기",at:T1,by:"u_boss",steps:{draft:T1}},{id:"bp2",docNo:"B26-11-02",name:"이봄이",d:"2026-11-20",amt:2000000,period:"시험",status:"결재 대기",at:T1,by:"u_boss",steps:{draft:T1}}]}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const SID={jjh:"st_jjh",bom:"st_bom",cja:"st_cja"};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push([v?"통과":"실패",n]);console.log(v?"통과":"실패",n,v?"":(x===undefined?"":JSON.stringify(x)))};
(async()=>{const b=await chromium.launch();const errs=[];
 const ctx=await b.newContext({viewport:{width:1280,height:900},timezoneId:'Asia/Seoul'});await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
 async function open(who,ms){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{errs.push(who+' 대화상자('+d.type()+') '+d.message().slice(0,40));d.dismiss()});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};window.__MOCKEXACT=true;`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p}
 const go=async(p,h,ms)=>{await p.evaluate(x=>{location.hash=x},h);await wait(ms||900)};
 const text=p=>p.evaluate(()=>document.body.innerText);
 const openAp=async(p,id)=>{await p.evaluate(i=>{window.__hfT.closeSheet();window.__hfT.open('approvals',i)},id);await wait(900)};
 // 열린 결재 서류 창: 버튼·글·회사 양식(출력과 같은 양식)
 const sheetInfo=p=>p.evaluate(()=>{const f=document.getElementById('sheetForm')||document.querySelector('.sheet');const fr=document.getElementById('apInline');return {btn:[...document.querySelectorAll('[data-decide]')].map(x=>x.dataset.decide+':'+x.textContent.trim()),text:f?f.innerText:'',paper:fr?(fr.srcdoc||''):'',html:f?f.innerHTML:''}});
 const press=async(p,v)=>{await p.locator('[data-decide="'+v+'"]').first().click();await wait(1200)};
 const paperBoxes=html=>{const m=html.replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');return m};

 const A=await open('admin',14000);
 ok('버전 기록에 v0.99-52 설명 남음 (v0.99-53부터는 맨 앞이 아님)',/v0\.99-52 \(대표 지시 2026-11-28 대표 결재 한 번에/.test(HTML));
 let d0=await D();const BEFORE=JSON.parse(JSON.stringify(d0));

 // ───────── ⑦ 직원 화면 (대표가 승인하기 전, 대표 칸 차례인 문서) ─────────
 for(const who of ['jjh','bom','cja']){const P=await open(who,9000);const tag=USERS[who].name;
  await go(P,'#approvals',1200);ok(`⑦ ${tag}: 전자결재 화면에 ‘결재 설정’ 칸·켜기/끄기 버튼 없음`,await P.evaluate(()=>!document.getElementById('apset')&&!document.querySelector('[data-aponce]')));
  const ids=who==='jjh'?['a1','a8']:who==='bom'?['a3','a5']:['a1','a3','a4','a9'];
  for(const id of ids){await openAp(P,id);const s=await sheetInfo(P);const has=await P.evaluate(i=>window.__hfT.S().approvals.some(x=>x.id===i)&&!!document.querySelector('.sheet'),id);ok(`⑦ ${tag}: 대표 칸 차례 문서 ${id} 가 화면에 열리고 승인·반려 버튼 없음`,has&&s.btn.length===0,{has,btn:s.btn})}
  if(who==='cja'){await openAp(P,'a7');const s=await sheetInfo(P);ok('채진아: 검토 차례 문서(a7)는 지금처럼 검토 승인 버튼만 (한 번에 글자 없음)',s.btn.some(x=>x==='승인:승인')&&!/한 번에|두 칸/.test(s.btn.join()),s.btn)}
  // 직원이 손으로 설정을 바꾸려 해도 저장소가 막음
  const den=await P.evaluate(async()=>{try{await window.__hfT.put('config','aponce',{on:false});return 'saved'}catch(e){return 'denied'}});const dd=await D();ok(`⑦ ${tag}: 설정 문서(config/aponce) 직접 저장 막힘`,!dd['config/aponce'],den);
  await P.close()}
 // 대표의 '직원 화면 미리 보기'
 await go(A,'#preview',1000);if(await A.locator('[data-pvgo="'+SID.jjh+'"]').count()){await A.locator('[data-pvgo="'+SID.jjh+'"]').click();await wait(2500);await go(A,'#approvals',1000);ok('⑦ 미리 보기(정진혁): 결재 설정 칸 없음',await A.evaluate(()=>!document.getElementById('apset')));await openAp(A,'a1');const s=await sheetInfo(A);ok('⑦ 미리 보기(정진혁): 본인 문서 a1 열림 · 승인 버튼 없음',s.btn.length===0&&/한번에 시험 일/.test(s.text+s.paper),s.btn);await A.evaluate(()=>window.__hfT.closeSheet());const ex=A.locator('[data-pvexit],[data-pvoff]').first();if(await ex.count()){await ex.click();await wait(1500)}else{await A.reload();await wait(12000)}}
 else ok('⑦ 미리 보기 버튼을 찾지 못함 (건너뜀 아님 · 실패)',false);

 // ───────── 설정 칸 (대표) ─────────
 await go(A,'#approvals',1200);
 ok('⑦′ 대표: 전자결재 화면에 ‘결재 설정 · 대표 결재 한 번에’ 켜짐(기본값) + 끄기 버튼',await A.evaluate(()=>{const c=document.getElementById('apset');return !!c&&/대표 결재 한 번에/.test(c.innerText)&&/켜짐/.test(c.innerText)&&!!c.querySelector('[data-aponce="0"]')}));

 // ───────── ① 승인 한 번 → 두 칸 ─────────
 await openAp(A,'a1');let s=await sheetInfo(A);
 ok('① 대표: 승인 버튼 하나 (최윤수·신혜현 두 칸 한 번에) + 반려',s.btn.length===2&&/^승인:승인 \(최윤수·신혜현 두 칸 한 번에\)$/.test(s.btn[0])&&s.btn[1]==='반려:반려',s.btn);
 await A.fill('#decNote','시험 의견');await press(A,'승인');let d=await D();let a=d['approvals/a1'];const h1=a.history.slice(-2);
 ok('① 승인 한 번 → 상태 승인 · 두 칸(최윤수 결재·신혜현 최종결재) 승인 기록',a.status==='승인'&&a.history.length===3&&h1[0].name==='최윤수'&&h1[0].role==='결재'&&h1[1].name==='신혜현'&&h1[1].role==='최종결재'&&h1.every(h=>h.result==='승인'),a);
 ok('① 이력에 실제 누른 계정 남음 (by·pressedBy·once)',h1.every(h=>h.by==='u_boss'&&h.pressedBy==='최윤수'&&h.once===true),h1);
 ok('① 옛 기록(채진아 검토)·기안 칸 그대로',JSON.stringify(a.history[0])===JSON.stringify(BEFORE['approvals/a1'].history[0])&&a.createdBy==='u_jjh'&&a.createdAt===T1&&JSON.stringify(a.aline)===JSON.stringify(BEFORE['approvals/a1'].aline));
 await openAp(A,'a1');s=await sheetInfo(A);const pp=paperBoxes(s.paper);const md=new Date(Date.now()+9*3600e3).toISOString().slice(5,10).replace('-',' / ');
 ok('① 결재란(회사 양식 = 출력 양식): 채진아·최윤수·신혜현 이름 + 승인 날짜',/채진아/.test(pp)&&/최윤수/.test(pp)&&/신혜현/.test(pp)&&pp.split(md).length>=3&&/최윤수 신혜현/.test(pp),pp.slice(0,300));
 ok('① 화면·양식 어디에도 ‘대결’·누른 계정 표시 없음',!/대결|pressedBy|한 번에 승인|u_boss/.test(s.paper)&&!/대결/.test(s.text)&&!/대결/.test(await text(A)));
 ok('① 승인 뒤 승인·반려 버튼 없음 (또 누를 수 없음)',s.btn.length===0,s.btn);
 // 출력 양식 글자 직접 확인 (apPrintNow 가 쓰는 같은 함수가 화면 양식을 만듦) + 소스에 대결 글자를 쓰는 자리 없음
 ok('소스: 화면에 쓰는 ‘대결’ 글자 없음 (옛 표시를 지우는 정리 식 한 줄만)',(HTML.match(/대결/g)||[]).length===(HTML.match(/\\\(대결\[\^\)\]\*\\\)/g)||[]).length+(HTML.match(/법인 대결|'대결'/g)||[]).length||(HTML.match(/대결/g)||[]).length<=2,(HTML.match(/.{30}대결.{30}/g)||[]));

 // 채진아 기안(검토 칸 없음) → 한 번에
 await openAp(A,'a9');await press(A,'승인');d=await D();a=d['approvals/a9'];ok('①′ 채진아 기안 문서(검토 칸 없음): 승인 한 번 → 두 칸 승인',a.status==='승인'&&a.history.length===2&&a.history[0].name==='최윤수'&&a.history[1].name==='신혜현'&&a.history.every(h=>h.once),a.history);

 // ───────── ② 후속 처리 한 번 ─────────
 await openAp(A,'a2');await press(A,'승인');await openAp(A,'a6');await press(A,'승인');
 await go(A,'#cal',1500);await go(A,'#approvals',7500);await go(A,'#home',7500);await go(A,'#approvals',7500);
 d=await D();const post=(((d['ppriv/p1']||{}).pc||{}).post||[]).filter(r=>r.apId==='a2');const cal=Object.keys(d).filter(k=>k.startsWith('cal/')&&d[k].lvAp==='a6');
 ok('② 현장 기안 최종 승인 → 프로젝트 원가 반영 정확히 한 줄 (금액 그대로)',d['approvals/a2'].status==='승인'&&post.length===1&&post[0].amt===777000&&!!d['approvals/a2'].pcSynced,{post,st:d['approvals/a2'].status,sync:d['approvals/a2'].pcSynced});
 ok('② 휴가 최종 승인 → 연차 캘린더 정확히 한 건',d['approvals/a6'].status==='승인'&&cal.length===1&&/연차 · 정진혁/.test(d[cal[0]].title),cal.map(k=>d[k]));
 ok('② 승인 알림(기안자에게 최종 승인) 문서당 한 건 · ‘결재 차례’ 알림은 새로 생기지 않음',['a1','a2','a6'].every(id=>Object.values(d).filter(x=>x&&x.apId===id&&x.kind==='결재 최종 승인').length===1)&&!Object.values(d).some(x=>x&&x.kind==='결재 차례'&&['a1','a2','a6','a9'].includes(x.apId)));

 // ───────── ③ 최윤수만 승인된 대기 문서 ─────────
 await openAp(A,'a3');s=await sheetInfo(A);await press(A,'승인');d=await D();a=d['approvals/a3'];
 ok('③ 최윤수 칸만 승인된 대기 문서: 한 번 누르면 끝 (신혜현 칸 한 줄만 더해짐 · 옛 기록 그대로)',a.status==='승인'&&a.history.length===3&&a.history[2].name==='신혜현'&&a.history[2].pressedBy==='최윤수'&&JSON.stringify(a.history.slice(0,2))===JSON.stringify(BEFORE['approvals/a3'].history),{btn:s.btn,h:a.history});

 // ───────── ④ 대표 한 명 문서 ─────────
 await openAp(A,'a4');s=await sheetInfo(A);await press(A,'승인');d=await D();a=d['approvals/a4'];
 ok('④ 대표 칸이 하나(신혜현)뿐인 문서: 버튼·동작 지금과 같음',s.btn[0]==='승인:최종결재 (결재란에 신혜현)'&&a.status==='승인'&&a.history.length===2&&a.history[1].name==='신혜현'&&!a.history[1].once,{btn:s.btn,h:a.history});

 // ───────── 검토가 남은 문서: 지금과 같음 ─────────
 await openAp(A,'a7');s=await sheetInfo(A);
 ok('검토가 남은 문서: 대표 화면 버튼은 지금처럼 검토 넣기·건너뛰기·반려 (한 번에 아님)',s.btn.length===3&&/^승인:검토 넣기/.test(s.btn[0])&&/^건너뜀:검토 건너뛰기/.test(s.btn[1]),s.btn);
 await press(A,'승인');d=await D();a=d['approvals/a7'];ok('검토 넣기 → 검토 칸만 승인되고 최윤수 차례로 (건너뛰지 않음)',a.status==='결재 진행'&&a.step===1&&a.history.length===1&&a.history[0].name==='채진아'&&!a.history[0].once,a);

 // ───────── ⑤ 반려 ─────────
 await openAp(A,'a5');await press(A,'반려');d=await D();a=d['approvals/a5'];
 ok('⑤ 반려: 문서 반려 · 반려 기록 한 줄(최윤수 칸) · 신혜현 칸 기록 없음',a.status==='반려'&&a.step===1&&a.history.length===2&&a.history[1].result==='반려'&&a.history[1].name==='최윤수'&&!a.history.some(h=>h.name==='신혜현'),a.history);

 // ───────── 성과금 결재 (켜짐) ─────────
 await go(A,'#bonus',1500);let bb=await A.evaluate(()=>[...document.querySelectorAll('[data-bpgo="bp1"]')].map(x=>x.dataset.v+':'+x.textContent.trim()));
 ok('성과금 결재(켜짐): 승인 버튼 하나 (최윤수·신혜현 한 번에)',bb.some(x=>x==='승인:승인 (최윤수·신혜현 한 번에)')&&!bb.some(x=>/^최종 결재 대기:/.test(x)),bb);
 await A.locator('[data-bpgo="bp1"][data-v="승인"]').click();await wait(1500);d=await D();let bp=d['fin/bonuspay'].pays.find(x=>x.id==='bp1');
 ok('성과금 결재(켜짐): 한 번에 승인 · 결재·최종결재 날짜 둘 다 · 누른 계정은 기록 칸에만 · 금액 그대로',bp.status==='승인'&&!!bp.steps.ok1&&!!bp.steps.ok2&&bp.steps.okBy==='u_boss'&&bp.steps.once===true&&bp.amt===1000000&&d['fin/bonuspay'].pays.length===2,bp);

 // ───────── ⑥ 설정 끄기 → 옛 방식 ─────────
 await go(A,'#approvals',1200);await A.locator('[data-aponce="0"]').click();await wait(1500);d=await D();
 ok('⑥ 끄기 → config/aponce {on:false} + 바꾼 기록(log) 저장 · 화면 ‘꺼짐’',d['config/aponce']&&d['config/aponce'].on===false&&d['config/aponce'].by==='u_boss'&&(d['config/aponce'].log||[]).length===1&&d['config/aponce'].log[0].from===true&&await A.evaluate(()=>/꺼짐/.test(document.getElementById('apset').innerText)),d['config/aponce']);
 await openAp(A,'a8');s=await sheetInfo(A);await press(A,'승인');d=await D();a=d['approvals/a8'];
 ok('⑥ 끄면 옛 방식: 첫 승인은 최윤수 칸만 (결재 진행 · 신혜현 차례)',s.btn[0]==='승인:승인'&&a.status==='결재 진행'&&a.step===2&&a.history.length===2&&a.history[1].name==='최윤수'&&!a.history[1].once,{btn:s.btn,a});
 await openAp(A,'a8');s=await sheetInfo(A);await press(A,'승인');d=await D();a=d['approvals/a8'];
 ok('⑥ 끄면 옛 방식: 두 번째 승인(최종결재, 결재란에 신혜현)으로 끝',s.btn[0]==='승인:최종결재 (결재란에 신혜현)'&&a.status==='승인'&&a.history.length===3&&a.history[2].name==='신혜현',{btn:s.btn,h:a.history});
 await go(A,'#bonus',1500);bb=await A.evaluate(()=>[...document.querySelectorAll('[data-bpgo="bp2"]')].map(x=>x.dataset.v+':'+x.textContent.trim()));
 ok('⑥ 성과금 결재(꺼짐): 옛 버튼 ‘결재 (최윤수)’',bb.some(x=>x==='최종 결재 대기:결재 (최윤수)'),bb);
 await A.locator('[data-bpgo="bp2"][data-v="최종 결재 대기"]').click();await wait(1200);d=await D();bp=d['fin/bonuspay'].pays.find(x=>x.id==='bp2');ok('⑥ 성과금 결재(꺼짐): 첫 결재 뒤 ‘최종 결재 대기’',bp.status==='최종 결재 대기'&&!!bp.steps.ok1&&!bp.steps.ok2,bp);
 // 다시 켜기 → 기록 두 줄, 최윤수만 승인된 성과금도 한 번에 끝
 await go(A,'#approvals',1200);await A.locator('[data-aponce="1"]').click();await wait(1500);d=await D();ok('⑥ 다시 켜기 → {on:true} · 바꾼 기록 두 줄(옛 값 남음)',d['config/aponce'].on===true&&d['config/aponce'].log.length===2,d['config/aponce']);
 await go(A,'#bonus',1500);await A.locator('[data-bpgo="bp2"][data-v="승인"]').click();await wait(1200);d=await D();bp=d['fin/bonuspay'].pays.find(x=>x.id==='bp2');ok('성과금: 최윤수만 결재된 대기 건도 한 번에 끝 (첫 결재 날짜 그대로)',bp.status==='승인'&&!!bp.steps.ok2&&!bp.steps.once,bp);

 // ───────── 데이터 삭제·덮어쓰기 없음 ─────────
 d=await D();const lost=Object.keys(BEFORE).filter(k=>!(k in d));
 ok('처음 있던 문서 하나도 지워지지 않음',lost.length===0,lost);
 ok('결재 문서: 옛 기록 줄은 그대로 앞에 남고 뒤에만 더해짐 · 기안자·제목·금액·결재 라인 그대로',Object.keys(BEFORE).filter(k=>k.startsWith('approvals/')).every(k=>{const o=BEFORE[k],n=d[k];return JSON.stringify(n.history.slice(0,o.history.length))===JSON.stringify(o.history)&&n.title===o.title&&n.amount===o.amount&&n.createdBy===o.createdBy&&JSON.stringify(n.aline)===JSON.stringify(o.aline)}));
 ok('후속 처리 다시 확인: 원가 반영 한 줄·연차 한 건 그대로 (여러 번 화면을 다녀도 늘지 않음)',(((d['ppriv/p1']||{}).pc||{}).post||[]).filter(r=>r.apId==='a2').length===1&&Object.keys(d).filter(k=>k.startsWith('cal/')&&d[k].lvAp==='a6').length===1);
 ok('막힌 대화상자(alert·confirm·prompt)·화면 오류 없음',errs.length===0,errs);
 await b.close();const bad=R.filter(r=>r[0]==='실패');console.log(`\n합계 ${R.length}건 · 통과 ${R.length-bad.length} · 실패 ${bad.length}`);process.exit(bad.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
