// 묶음 2B 시험 (v0.99-30, 2026-11-13 · 대표 지시 2026-11-13 의 14·16·17·15·13번): node intranet/tools/test/b2b_test.js [index.html]   · ONLY=14|16|17|15|13 로 한 부분만
// 14: 고객 이름·전화번호 칸(신규 상담·문의 접수·프로젝트·견적·고객) · 새로 만들 때 필수 · 한 곳(고객 카드)을 원본으로 · 문자 보내기 연결 · 현장명 자동
// 16: 간편 견적 상담(이름 변경 · 고객 정보 먼저 → 프로젝트로 연결)   17: 문의 접수(새 프로젝트)가 목록에 바로   15: 프로젝트 탭·뒤로 가기   13: 단계별 문자 문구·내 명함 링크·내 문구
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const ONLY=process.env.ONLY||"";const on=k=>!ONLY||ONLY.split(',').includes(k);
const STAFF={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const CAT={ver:"시험 단가표",updatedAt:T0,cols:["k","space","proc","name","unit","price","desc","qty","grp"],items:[["t_demo","공통 공사","철거","철거 기본","식",500000,"",1,""],["t_tile","욕실","타일","욕실 타일","m2",40000,"","bath",""],["t_fl","바닥·도배","바닥","강마루","평",120000,"","py","fl"]],presets:{"전체 공사":["t_demo","t_tile"]}};
// 돈·인사 정보: 직원 화면(정진혁·이봄이)에 나오면 안 되는 값
const MONEY=/20202020|20,202,020|1515151|1,515,151|13131313|13,131,313|2121212|2,121,212/;
const BASE=Object.assign({},STAFF,{"catalog/current":CAT,
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},"cpriv/c1":{tel:"01012345678",addr:"서울시 시험구 1",updatedAt:T0},
 "customers/c2":{code:"C-2611-902",name:"김영희",tel:"",addr:"",mgr:"이봄이",status:"진행중",steps:[1],stage:"1-상담영업",inq:"2026-11-02",createdAt:T0,updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",stage:"상담",mgr:"정진혁",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",approvals:[{amt:1515151,t:"자재"}],cat:"주거",inq:"2026-11-01",work:"욕실",addr:"서울시 시험구 1",updatedAt:T0},"ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "projects/p3":{no:"P-2610-903",title:"옛 자료 현장",custName:"옛손님",stage:"견적",mgr:"이봄이",cat:"주거",inq:"2026-10-05",addr:"구리 인창동 1",updatedAt:T0},
 "projects/p4":{no:"P-2609-904",title:"지난 현장 주방",custName:"김영희",custCode:"C-2611-902",stage:"사후관리",mgr:"이봄이",contractAmt:"12000000",cat:"주거",inq:"2026-04-01",end:"2026-05-01",warrantyEnd:"2027-05-01",warrantyMonths:12,updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",code:"C-2611-901",name:"시험 현장 욕실",customer:"홍길동",mgr:"정진혁",status:"착공 전",updatedAt:T0},
 "quotes/q1":{qno:"P-2611-901-1차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"본견적 진행",d:"2026-11-03",amount:"3300000",qCost:"2121212",items:[],updatedAt:T0},
 "as/a1":{pno:"P-2609-904",code:"C-2611-902",site:"지난 현장 주방",d:"2026-11-07",content:"싱크대 하부 실리콘 보수",status:"접수",mgr:"이봄이"},
 "fin/bonuspay":{rows:[{name:"정진혁",amt:"13131313"}]}});
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,340))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const STUB=`window.confirm=()=>false;`;
// 가짜 구글 드라이브 (문자 요청 파일): 만든 파일을 window.__mcpFiles 에 남김
const MCP=`window.__mcpFiles=[];window.__MOCKMCP={callTool:async(sv,tool,inp)=>{const J=o=>({content:[{type:"text",text:JSON.stringify(o)}]});if(tool==="create_file"){window.__mcpFiles.push({title:inp.title,text:inp.textContent});return J({id:"f"+window.__mcpFiles.length,title:inp.title})}if(tool==="search_files"){const m=/title = '([^']+)'/.exec(inp.query||"");return J({files:window.__mcpFiles.filter(f=>!m||f.title===m[1]).map((f,i)=>({id:"f"+i,title:f.title}))})}return {isError:true,content:[{text:"no"}]}}};`;
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 const mk=async(opt,seedObj,init)=>{const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[seedObj,RULES]);
  const open=async(who,ms)=>{const p=await ctx.newPage();p.__who=who;p.on('pageerror',e=>errs.push(who+': '+e.message));if(process.env.DEBUG)p.on('console',m=>{if(/error|warn/.test(m.type()))console.log('  ['+who+' '+m.type()+'] '+m.text().slice(0,300))});p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+(init||'')+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);for(let i=0;i<40&&!(await p.evaluate(()=>!!window.__hfT));i++)await wait(500);return p};
  const dbv=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')));
  return {ctx,open,seed,dbv}};
 const go=async(p,h)=>{await p.evaluate(x=>{location.hash=x},h);await wait(800)};
 const sh=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+'|'+s.id:''});
 const openS=async(p,col,id)=>{await go(p,'#'+col);await p.evaluate(([c,i])=>window.__hfT.open(c,i),[col,id||null]);await wait(900)};
 const close=async p=>{await p.evaluate(()=>window.__hfT.closeSheet());await wait(300)};
 const fill=async(p,k,v)=>{const el=p.locator('#sheetForm [data-k="'+k+'"]');await el.fill(String(v));await el.dispatchEvent('change')};
 const val=(p,k)=>p.evaluate(k=>{const e=document.querySelector('#sheetForm [data-k="'+k+'"]');return e?e.value:null},k);
 const save=async(p,ms)=>{await p.locator('#saveSheet').click();await wait(ms||2500)};
 const toastT=p=>p.evaluate(()=>[...document.querySelectorAll('.toast,#toast,[role="status"]')].map(e=>e.innerText).join(' | '));
 const S=(p,col)=>p.evaluate(c=>window.__hfT.S()[c].map(r=>Object.assign({},r)),col);
 const noOver=p=>p.evaluate(()=>{const s=[...document.querySelectorAll('.veil .sheet')].pop();return document.documentElement.scrollWidth<=window.innerWidth+2&&(!s||s.scrollWidth<=s.clientWidth+2)});
 const askYes=async(p,yes)=>{const n=await p.locator('.okask').count();if(n){await p.locator('.okask [data-ok="'+(yes?1:0)+'"]').click();await wait(2500)}return n};
 const telD=v=>String(v||'').replace(/\D/g,'');
 const VPS=[['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]];

 // ================= 14 (+17) =================
 if(on('14')||on('17')){
  for(const [vn,opt] of VPS){const tag='14 '+vn+' ',t17='17 '+vn+' ';
   const {ctx,open,dbv}=await mk(opt,BASE,STUB+MCP);const A=await open('admin',12000);const J=await open('jjh',8000);const B=await open('bom',8000);const C=await open('cja',8000);
   const WHO=[[A,'최윤수'],[C,'채진아'],[J,'정진혁'],[B,'이봄이']];
   // 화면마다 이름·전화번호 칸
   for(const [P,nm] of WHO){
    await openS(P,'projects');const f1=await P.evaluate(()=>{const q=k=>document.querySelector('#sheetForm [data-k="'+k+'"]');const t=q('custTel');return !!q('custName')&&!!t&&t.type==='tel'&&/꼭 필요/.test(t.closest('.f').innerText)&&/문의 접수/.test(document.querySelector('.sheet h3').innerText)});const ov1=await noOver(P);await close(P);
    await openS(P,'customers');const f2=await P.evaluate(()=>{const q=k=>document.querySelector('#sheetForm [data-k="'+k+'"]');const t=q('tel');return !!q('name')&&!!t&&/전화번호/.test(t.closest('.f').innerText)&&/꼭 필요/.test(t.closest('.f').innerText)});await close(P);
    await openS(P,'quotes');const f3=await P.evaluate(()=>{const q=k=>document.querySelector('#sheetForm [data-k="'+k+'"]');const t=q('qTel');return !!q('name')&&!!t&&/고객 전화번호/.test(t.closest('.f').innerText)&&/꼭 필요/.test(t.closest('.f').innerText)});await close(P);
    await go(P,'#consult');const f4=await P.evaluate(()=>{const n=document.getElementById('cn_name'),t=document.getElementById('cn_tel');return !!n&&!!t&&/전화번호/.test(t.closest('label').innerText)&&/꼭 필요/.test(t.closest('label').innerText)});
    ok(tag+nm+': 문의 접수(새 프로젝트)·고객 등록·견적 등록·상담 새 고객 화면 모두에 고객 이름 + 전화번호 칸(꼭 필요 표시)',f1&&f2&&f3&&f4&&ov1,[f1,f2,f3,f4,ov1].join(','));
    // 저장된 자료: 프로젝트·견적·고객 수정 화면에 같은 번호가 010-0000-0000 모양으로
    await openS(P,'projects','p1');const v1=await val(P,'custTel');await close(P);await openS(P,'quotes','q1');const v2=await val(P,'qTel');await close(P);await openS(P,'customers','c1');const v3=await val(P,'tel');await close(P);
    ok(tag+nm+': 저장된 고객 번호(저장값 01012345678)가 프로젝트·견적·고객 수정 화면에 010-1234-5678 로 그대로 나옴',v1==='010-1234-5678'&&v2==='010-1234-5678'&&v3==='010-1234-5678',[v1,v2,v3].join(' / '))}
   // 손대지 않고 저장 → 저장값을 바꾸지 않음
   await openS(A,'customers','c1');await fill(A,'memo','메모만 고침');await save(A);let D=await dbv();
   ok(tag+'대표: 고객 카드에서 다른 칸만 고쳐 저장 → 저장된 번호 글자(01012345678)는 그대로 · 메모는 저장됨',D['cpriv/c1'].tel==='01012345678'&&D['customers/c1'].memo==='메모만 고침'&&!D['customers/c1'].telLog,JSON.stringify(D['cpriv/c1']));
   // 새 프로젝트: 전화번호 없으면 저장 막음
   await openS(J,'projects');await fill(J,'custName','박새롬');await fill(J,'addr','구리 인창 아름마을LG 202동 708호');await fill(J,'work','욕실 2곳');
   await J.locator('#sheetForm [data-k="route"]').selectOption('전화');await save(J,1200);
   const blk=await J.evaluate(()=>({open:!!document.querySelector('#saveSheet'),foc:(document.activeElement&&document.activeElement.dataset||{}).k||''}));D=await dbv();
   ok(tag+'정진혁: 문의 접수에서 전화번호 없이 ‘등록’ → 저장 안 됨 · 전화번호 칸으로 안내(커서)',blk.open&&blk.foc==='custTel'&&!Object.keys(D).some(k=>/박새롬/.test(JSON.stringify(D[k]))),JSON.stringify(blk)+' '+await toastT(J));
   await fill(J,'custTel','01055556666');const shown=await val(J,'custTel');await fill(J,'py','24').catch(()=>{});await fill(J,'req','화이트 톤').catch(()=>{});await save(J,3500);
   const jp=(await S(J,'projects')).find(p=>p.custName==='박새롬'),jc=(await S(J,'customers')).find(c=>c.name==='박새롬');
   ok(tag+'정진혁: 번호를 넣으면(01055556666 → 칸에 010-5555-6666) 저장 · 프로젝트 번호 자동 · 고객 카드가 만들어져 이어짐(고객코드 자동) · 고객 카드 번호 = 010-5555-6666',shown==='010-5555-6666'&&!!jp&&/^P-\d{4}-\d{3}$/.test(jp.no)&&!!jc&&jp.custCode===jc.code&&jc.tel==='010-5555-6666',JSON.stringify([jp&&jp.no,jp&&jp.custCode,jc&&jc.tel]));
   ok(tag+'현장명 자동: 비워 둔 현장명이 주소의 아파트 이름 ‘아름마을LG’ 로',!!jp&&jp.title==='아름마을LG',jp&&jp.title);
   // 17: 목록에 바로
   await go(J,'#projects');const l1=await J.locator('#view').innerText();
   ok(t17+'정진혁이 만든 프로젝트가 정진혁 목록에 바로 (고객 이름·현장명·번호)',!!jp&&l1.includes(jp.no)&&/박새롬/.test(l1)&&/아름마을LG/.test(l1),l1.replace(/\s+/g,' ').slice(0,200));
   await wait(3000);await go(B,'#projects');await go(C,'#projects');await go(A,'#projects');const lb=await B.locator('#view').innerText(),lc=await C.locator('#view').innerText();
   ok(t17+'대표 화면을 기다리지 않고 이봄이·채진아 목록에도 바로 (공용 칸)',!!jp&&lb.includes(jp.no)&&/박새롬/.test(lb)&&lc.includes(jp.no)&&/박새롬/.test(lc),lb.replace(/\s+/g,' ').slice(0,160));
   for(let i=0;i<20;i++){D=await dbv();if(jp&&D['projects/'+jp.no])break;await wait(1000)}
   const la=await A.locator('#view').innerText();const acu=jc&&D['cpriv/'+jc.id];
   ok(t17+'대표 목록·원본에도 반영 (원본 projects 문서 · 고객 전화번호는 cpriv 에)',!!jp&&!!D['projects/'+jp.no]&&la.includes(jp.no)&&/박새롬/.test(la)&&!!acu&&acu.tel==='010-5555-6666'&&D['customers/'+jc.id].tel==='',JSON.stringify(acu));
   if(jp){for(const [P,nm] of [[B,'이봄이'],[A,'최윤수'],[J,'정진혁'],[C,'채진아']]){await openS(P,'projects',jp.no);const v=await val(P,'custTel'),hub=await P.locator('#pjHub').innerText().catch(()=>''),fv=await P.evaluate(()=>['addr','route','req','custName'].map(k=>(document.querySelector('#sheetForm [data-k="'+k+'"]')||{}).value).join('|'));
     ok(t17+nm+': 그 프로젝트를 열면 기본 정보(고객 이름·전화번호·주소·유입 경로·요청)가 그대로 · 고객 정보 카드에도 번호',v==='010-5555-6666'&&/010-5555-6666/.test(hub)&&/박새롬/.test(hub)&&fv==='구리 인창 아름마을LG 202동 708호|전화|화이트 톤|박새롬',v+' '+fv);await close(P)}}
   if(on('14')){
   // 옛 자료: 전화번호 없어도 열리고 다른 칸 저장됨 + 눈에 띄는 표시
   await openS(B,'projects','p3');const old=await B.evaluate(()=>({miss:document.querySelectorAll('#sheetForm .telmiss').length,hub:(document.querySelector('#pjHub')||{}).innerText||'',need:/꼭 필요/.test(document.querySelector('#sheetForm [data-k="custTel"]').closest('.f').innerText)}));
   await fill(B,'memo','옛 자료 메모만');await save(B,3000);const p3=(await S(B,'projects')).find(p=>p.id==='p3');
   ok(tag+'이봄이: 전화번호가 없는 옛 프로젝트 — 열림 · ‘전화번호를 넣어 주세요’ 표시 · 다른 칸만 고쳐도 저장됨(막지 않음)',old.miss===1&&/전화번호를 넣어 주세요/.test(old.hub)&&!old.need&&p3&&p3.memo==='옛 자료 메모만',JSON.stringify(old).slice(0,200)+' '+(p3&&p3.memo));
   await openS(B,'projects','p3');await fill(B,'custTel','010 7777 8888');await save(B,3500);const p3b=(await S(B,'projects')).find(p=>p.id==='p3'),c3=(await S(B,'customers')).find(c=>c.name==='옛손님');
   ok(tag+'이봄이: 옛 프로젝트에 번호를 넣어 저장 → 고객 카드가 만들어져 이어짐 · 번호 010-7777-8888',!!c3&&c3.tel==='010-7777-8888'&&p3b.custCode===c3.code&&p3b.memo==='옛 자료 메모만',JSON.stringify([p3b&&p3b.custCode,c3&&c3.tel]));
   // 프로젝트 화면에서 번호를 고치면 고객 카드가 바뀜 (옛 번호 기록) → 다른 화면에도
   await openS(B,'projects','p1');await fill(B,'custTel','01099998888');await B.locator('#saveSheet').click();await wait(1200);const asked=await askYes(B,true);await wait(1500);
   const bc=(await S(B,'customers')).find(c=>c.id==='c1');
   ok(tag+'이봄이: 프로젝트 화면에서 번호를 바꾸면 화면 안 확인 창 → 고객 카드 번호가 바뀌고 옛 번호는 기록(telLog)에 남음',asked===1&&bc.tel==='010-9999-8888'&&Array.isArray(bc.telLog)&&bc.telLog[0].from==='01012345678'&&bc.telLog[0].name==='이봄이',JSON.stringify([bc.tel,bc.telLog]));
   await wait(3500);for(let i=0;i<15;i++){D=await dbv();if((D['cpriv/c1']||{}).tel==='010-9999-8888')break;await wait(1000)}
   const vs=[];for(const P of [J,C,A]){await openS(P,'quotes','q1');vs.push(await val(P,'qTel'));await close(P);await openS(P,'customers','c1');vs.push(await val(P,'tel'));await close(P)}
   ok(tag+'바뀐 번호가 정진혁·채진아·대표의 견적·고객 수정 화면에 그대로 · 대표 원본(cpriv)에도',vs.every(v=>v==='010-9999-8888')&&D['cpriv/c1'].tel==='010-9999-8888'&&D['cpriv/c1'].addr==='서울시 시험구 1',vs.join(',')+' '+JSON.stringify(D['cpriv/c1']));
   // 낡은 창 저장: 정진혁이 고객 창을 연 채로, 이봄이가 번호를 바꾸고, 정진혁이 메모만 저장 → 번호는 이봄이 것
   await openS(J,'customers','c1');await openS(B,'customers','c1');await fill(B,'tel','010-2222-3333');await save(B,4500);
   await fill(J,'memo','정진혁 메모');await save(J,4500);for(let i=0;i<15;i++){D=await dbv();if(D['customers/c1'].memo==='정진혁 메모')break;await wait(1000)}await wait(3000);D=await dbv();
   const wk=D['work/all/customers/c1']||{};
   ok(tag+'낡은 창 저장: 정진혁이 옛 번호가 보이는 창에서 메모만 저장해도 이봄이가 바꾼 번호(010-2222-3333)가 지워지지 않음 (공용 칸·대표 원본)',wk.tel==='010-2222-3333'&&D['cpriv/c1'].tel==='010-2222-3333'&&D['customers/c1'].memo==='정진혁 메모',JSON.stringify([wk.tel,D['cpriv/c1'].tel,D['customers/c1'].memo]));
   // 새 견적·새 고객: 전화번호 필수
   await openS(J,'quotes');await fill(J,'name','견적손님');await fill(J,'site','남양주 다산 자이 101동');await save(J,1200);const qb=await J.evaluate(()=>!!document.querySelector('#saveSheet')&&(document.activeElement.dataset||{}).k);
   await fill(J,'qTel','0314445555');await save(J,3500);const qc=(await S(J,'customers')).find(c=>c.name==='견적손님'),qq=(await S(J,'quotes')).find(q=>q.name==='견적손님');
   ok(tag+'정진혁: 새 견적 — 번호 없으면 저장 막고 그 칸으로 · 넣으면 저장되고 고객 카드(031-444-5555)가 만들어져 이어짐',qb==='qTel'&&!!qc&&qc.tel==='031-444-5555'&&!!qq&&qq.code===qc.code,String(qb)+' '+JSON.stringify([qc&&qc.tel,qq&&qq.code]));
   await openS(C,'customers');await fill(C,'name','새고객');await save(C,1200);const cb=await C.evaluate(()=>!!document.querySelector('#saveSheet')&&(document.activeElement.dataset||{}).k);await fill(C,'tel','01033334444');await save(C,3500);const nc=(await S(C,'customers')).find(c=>c.name==='새고객');
   ok(tag+'채진아: 새 고객 — 번호 없으면 저장 막고 그 칸으로 · 넣으면 010-3333-4444 로 저장',cb==='tel'&&!!nc&&nc.tel==='010-3333-4444',String(cb)+' '+(nc&&nc.tel));
   // 상담 새 고객: 전화번호 필수
   await go(J,'#consult');await J.locator('#cn_name').fill('상담손님');await J.locator('#cn_addr').fill('구리 인창 동양 105-102');await J.locator('[data-cs="new"]').click();await wait(150);
   const csb=await J.evaluate(()=>document.activeElement&&document.activeElement.id);await wait(1000);const none=!(await S(J,'customers')).some(c=>c.name==='상담손님');
   ok(tag+'정진혁: 상담 새 고객 — 전화번호 없으면 저장 막고 전화번호 칸으로',csb==='cn_tel'&&none,csb);
   // 문자 보내기: 프로젝트·견적 화면에서 그 고객 번호가 들어가 있음
   for(const [P,nm] of [[J,'정진혁'],[A,'최윤수']]){await openS(P,'projects','p1');const nb=await P.locator('#pjHub [data-smscode]').count();if(nb)await P.locator('#pjHub [data-smscode]').click();await wait(700);
    const s1=await P.evaluate(()=>{const v=document.getElementById('smsVeil');return v?v.querySelector('#smsTo').innerText:''});await P.evaluate(()=>{const b=document.querySelector('#smsVeil [data-smsact="close"]');b&&b.click()});await close(P);
    await openS(P,'quotes','q1');await P.evaluate(()=>{const b=document.querySelector('[data-qtab="edit"]');b&&b.click()});await wait(400);const nq=await P.locator('#sheetForm [data-smscode]').count();if(nq)await P.locator('#sheetForm [data-smscode]').click();await wait(700);
    const s2=await P.evaluate(()=>{const v=document.getElementById('smsVeil');return v?v.querySelector('#smsTo').innerText:''});const ovs=await noOver(P);await P.evaluate(()=>{const b=document.querySelector('#smsVeil [data-smsact="close"]');b&&b.click()});await close(P);
    ok(tag+nm+': 프로젝트(고객 정보 카드)·견적 화면의 ‘문자 보내기’ → 받는 사람에 그 고객 번호(홍길동 010-2222-3333)가 들어가 있음',nb===1&&nq===1&&/홍길동 010-2222-3333/.test(s1)&&/홍길동 010-2222-3333/.test(s2)&&ovs,s1+' / '+s2)}
   // 돈 정보 안 샘 + 거절된 쓰기 없음
   for(const [P,nm] of [[J,'정진혁'],[B,'이봄이']]){await openS(P,'projects','p1');const t=await P.locator('.sheet').innerText();const den=await P.evaluate(()=>window.__mockDenied.filter(x=>!/^(activity|access|knock)/.test(x)));await close(P);
    ok(tag+nm+': 프로젝트 화면에 원가·마진·성과금 숫자 없음 · 권한 밖 쓰기 시도 0',!MONEY.test(t)&&!den.length,den.join(','))}
   D=await dbv();ok(tag+'원본 문서가 사라진 것 없음 (고객·프로젝트·견적)',['customers/c1','customers/c2','projects/p1','projects/p3','projects/p4','quotes/q1','cpriv/c1'].every(k=>D[k]));
   }
   await ctx.close()}
  // 낡은 화면(구독이 멈춘 화면)에서 저장해도 번호가 옛 값으로 돌아가지 않음 — 정진혁 화면: 바뀐 문서만 부르기 + 다른 창 소식 끊음 + 다시 읽기 없음
  if(on('14')){const BCW=`(()=>{const _BC=window.BroadcastChannel;window.BroadcastChannel=class{constructor(n){this.b=new _BC(n);this.b.onmessage=e=>{if(!window.__mute&&this.onmessage)this.onmessage(e)}}postMessage(m){this.b.postMessage(m)}close(){this.b.close()}}})();if(window.__MOCKUSER.id==='u_jjh'){window.__MOCKEXACT=true;window.__SUBPOLL=1e9}`;
   const {ctx,open,dbv}=await mk(VPS[0][1],BASE,STUB+BCW);const A=await open('admin',12000);const B=await open('bom',8000);const J2=await open('jjh',9000);await J2.evaluate(()=>{window.__mute=true});
   await openS(J2,'customers','c1');const seen=await val(J2,'tel');
   await openS(B,'customers','c1');await fill(B,'tel','010-4444-5555');await fill(B,'addr','서울시 새주소 9');await save(B,3000);let D=null;for(let i=0;i<20;i++){await wait(1000);D=await dbv();if((D['cpriv/c1']||{}).tel==='010-4444-5555')break}
   const j2tel=await J2.evaluate(()=>(window.__hfT.S().customers.find(c=>c.id==='c1')||{}).tel);
   await J2.evaluate(()=>{const el=document.querySelector('#sheetForm [data-k="memo"]');el.value='낡은 화면 메모';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});await save(J2,2500);D=await dbv();const w1=D['work/all/customers/c1']||{};
   for(let i=0;i<20;i++){await wait(1000);D=await dbv();if(D['customers/c1'].memo==='낡은 화면 메모')break}await wait(4000);D=await dbv();const w2=D['work/all/customers/c1']||{};
   ok('14 낡은 화면 준비: 정진혁의 멈춘 화면은 옛 번호(010-1234-5678)를 보고 있고, 원본은 이봄이가 바꾼 010-4444-5555',seen==='010-1234-5678'&&telD(j2tel)==='01012345678'&&D['cpriv/c1'].tel==='010-4444-5555',seen+' '+j2tel);
   ok('14 낡은 화면에서 메모만 저장: 공용 칸·대표 원본의 번호·주소는 이봄이 것 그대로 · 메모는 저장 · 옛 번호 기록(telLog)도 남음',w1.tel==='010-4444-5555'&&w2.tel==='010-4444-5555'&&D['cpriv/c1'].tel==='010-4444-5555'&&D['cpriv/c1'].addr==='서울시 새주소 9'&&w2.addr==='서울시 새주소 9'&&D['customers/c1'].memo==='낡은 화면 메모'&&(D['customers/c1'].telLog||[]).length===1,JSON.stringify([w1.tel,w2.tel,D['cpriv/c1'],D['customers/c1'].memo,(D['customers/c1'].telLog||[]).length]));
   await ctx.close()}
  // 현장명 자동 규칙 (코드 단위)
  if(on('14')){const {ctx,open}=await mk(VPS[0][1],BASE,STUB);const A=await open('admin',9000);
   const ap=await A.evaluate(()=>['구리 인창 아름마을LG 202동 708호','서울시 시험구 1','경기 구리 인창동','서울 강남구 역삼동 래미안 아파트 101동 202호','남양주 다산 자이 101동','구리시 교문동 123-4'].map(a=>window.__hfT.aptName(a)));
   ok('14 현장명 자동 규칙: 아파트 이름만 뽑고, 확실하지 않으면(행정동·번지뿐) 비움',ap.join('|')==='아름마을LG|||래미안 아파트|자이|',ap.join('|'));
   const tf=await A.evaluate(()=>['01012345678','010 1234 5678','0212345678','0314445555','010-1234-5678 (부인)','15881234',''].map(v=>window.__hfT.telFmt(v)));
   ok('14 번호 모양: 하이픈 정리만 (글이 섞인 값은 그대로)',tf.join('|')==='010-1234-5678|010-1234-5678|02-1234-5678|031-444-5555|010-1234-5678 (부인)|1588-1234|',tf.join('|'));
   // 사람이 적은 현장명은 덮지 않음
   await openS(A,'projects');await fill(A,'title','직접 적은 이름');await fill(A,'custName','직접손님');await fill(A,'custTel','01011112222');await fill(A,'addr','구리 인창 아름마을LG 202동 708호');await A.locator('#sheetForm [data-k="route"]').selectOption('전화');await save(A,1500);await askYes(A,true);await wait(1500);
   const pp=(await S(A,'projects')).find(p=>p.custName==='직접손님');ok('14 사람이 직접 적은 현장명은 덮지 않음',!!pp&&pp.title==='직접 적은 이름',pp&&pp.title);
   await ctx.close()}
 }
 // ================= 16 =================
 if(on('16')){
  for(const [vn,opt] of VPS){const tag='16 '+vn+' ';
   const {ctx,open,dbv}=await mk(opt,BASE,STUB);const A=await open('admin',12000);const J=await open('jjh',8000);const B=await open('bom',8000);const C=await open('cja',8000);
   for(const [P,nm] of [[A,'최윤수'],[C,'채진아'],[J,'정진혁'],[B,'이봄이']]){
    await go(P,'#consult');const r=await P.evaluate(()=>{const a=document.querySelector('a[href="#consult"]'),v=document.getElementById('view'),all=document.body.innerText;const pos=id=>{const e=document.getElementById(id);return e?[...v.querySelectorAll('input,select')].indexOf(e):-1};
     return {menu:a?a.innerText.trim():'',h1:(v.querySelector('h1')||{}).innerText||'',old:/상담 진행/.test(all),h2:[...v.querySelectorAll('h2')].map(x=>x.innerText.replace(/\s+/g,' ').slice(0,24)).join(' / '),first:pos('cn_name')>=0&&pos('cn_name')<pos('cn_tel')&&pos('cn_tel')<pos('cn_addr')&&pos('cn_addr')<pos('cs_pno'),hash:location.hash,over:document.documentElement.scrollWidth<=window.innerWidth+2}});
    ok(tag+nm+': 왼쪽 메뉴·화면 제목이 ‘간편 견적 상담’ (주소 #consult 그대로) · ‘상담 진행’ 글자 없음 · 고객 정보 등록(이름·전화번호·주소)이 맨 먼저',r.menu==='간편 견적 상담'&&r.h1==='간편 견적 상담'&&!r.old&&/^1\. 고객 정보 등록/.test(r.h2)&&r.first&&r.hash==='#consult'&&r.over,JSON.stringify(r));
    await openS(P,'projects','p1');const pt=await P.locator('.sheet').innerText();await close(P);ok(tag+nm+': 프로젝트 창의 버튼·안내도 ‘간편 견적 상담’',/간편 견적 상담/.test(pt)&&!/상담 진행/.test(pt))}
   // 고객 정보 없이 상담 시작 안 됨
   await go(J,'#consult');await J.locator('[data-cs="begin"]').click();await wait(400);
   const st0=await J.evaluate(()=>({form:!!document.getElementById('cn_name'),foc:document.activeElement&&document.activeElement.id}));
   ok(tag+'정진혁: 고객 정보(프로젝트) 없이 ‘상담 시작’ → 시작 안 됨 · 이름 칸으로 안내',st0.form&&st0.foc==='cn_name',JSON.stringify(st0));
   // 적던 글이 화면 새로 그리기에 지워지지 않음
   await J.locator('#cn_name').fill('오상담');await J.locator('#cn_tel').fill('01066667777');await J.locator('#cn_tel').dispatchEvent('change');
   await A.evaluate(async()=>{const s=Object.assign({},window.__hfT.S().projects.find(x=>x.id==='p4'));delete s.id;s.memo='다른 사람이 저장';await window.__hfT.put('projects','p4',s)});await wait(5000);
   const kept=await J.evaluate(()=>[document.getElementById('cn_name').value,document.getElementById('cn_tel').value].join('|'));
   ok(tag+'정진혁: 고객 정보를 적는 중에 다른 사람 저장이 들어와 화면이 다시 그려져도 적던 글이 그대로',kept==='오상담|010-6666-7777',kept);
   // 저장 → 프로젝트·고객 카드로 바로 연결 → 상담 화면
   const n0=(await S(J,'projects')).length;await J.locator('#cn_addr').fill('구리 인창 아름마을LG 101동 303호');await J.locator('#cn_py').fill('24');await J.locator('[data-cs="new"]').click();await wait(4000);
   const jp=(await S(J,'projects')).find(p=>p.custName==='오상담'),jc=(await S(J,'customers')).find(c=>c.name==='오상담');const inCs=await J.evaluate(()=>!!document.querySelector('#view .cs')&&!document.getElementById('cn_name'));
   ok(tag+'정진혁: 고객 정보를 저장하면 프로젝트(번호 자동·단계 상담·현장명 아름마을LG)와 고객 카드(번호 010-6666-7777)가 만들어져 이어지고 바로 상담 화면으로',!!jp&&!!jc&&jp.custCode===jc.code&&jp.stage==='상담'&&jp.title==='아름마을LG'&&jc.tel==='010-6666-7777'&&inCs&&(await S(J,'projects')).length===n0+1,JSON.stringify([jp&&jp.no,jp&&jp.title,jc&&jc.tel,inCs]));
   await wait(2500);await go(B,'#projects');const lb=await B.locator('#view').innerText();ok(tag+'이봄이: 그 프로젝트가 프로젝트 목록에 바로 보임',!!jp&&lb.includes(jp.no)&&/오상담/.test(lb));
   // 고른 내용 → 그 프로젝트의 견적으로 (기존 흐름)
   await J.locator('[data-cs="go"][data-i="7"]').click();await wait(400);await J.locator('[data-cs="t"]').first().click();await wait(400);await J.locator('[data-cs="go"][data-i="8"]').click();await wait(400);
   if(!(await J.locator('[data-cs="save"]').isVisible().catch(()=>false))){await J.locator('[data-cs="cust"]').click();await wait(400)}
   await J.locator('[data-cs="save"]').click();await wait(4000);const jq=(await S(J,'quotes')).filter(q=>jp&&q.pno===jp.no);
   ok(tag+'정진혁: 상담에서 고른 내용이 그 프로젝트의 견적(프로젝트번호-1차)으로 저장됨',jq.length===1&&jq[0].qno===jp.no+'-1차'&&jq[0].code===jc.code&&(jq[0].items||[]).length>=1,JSON.stringify(jq.map(q=>[q.qno,q.code,(q.items||[]).length])));
   // 같은 고객·같은 주소 → 기존 프로젝트로 잇기
   await wait(2500);await go(B,'#consult');const nb0=(await S(B,'projects')).length;await B.locator('#cn_name').fill('오상담');await B.locator('#cn_tel').fill('010-6666-7777');await B.locator('#cn_addr').fill('구리 인창 아름마을LG 101동 303호');await B.locator('[data-cs="new"]').click();await wait(900);
   const dv=await B.evaluate(()=>{const v=document.getElementById('dupVeil');return v?v.innerText.replace(/\s+/g,' '):''});const ovd=await noOver(B);
   await B.locator('#dupVeil [data-csdup]').first().click();await wait(1500);const bcs=await B.evaluate(()=>({cs:!!document.querySelector('#view .cs'),t:(document.querySelector('#view .cs-top')||{}).innerText||''}));
   ok(tag+'이봄이: 같은 고객·같은 주소로 등록하려 하면 화면 안 창으로 기존 프로젝트를 보여 주고 → ‘이 프로젝트로 상담’ → 새로 만들지 않고 그 프로젝트로 상담 시작',!!jp&&dv.includes(jp.no)&&/이미 있는 프로젝트/.test(dv)&&ovd&&bcs.cs&&/오상담/.test(bcs.t)&&(await S(B,'projects')).length===nb0,dv.slice(0,160)+' '+JSON.stringify(bcs));
   // 같은 전화번호(다른 주소) → 그 고객의 새 프로젝트 (고객 카드는 새로 만들지 않음)
   await go(C,'#consult');const nc0=(await S(C,'customers')).length;await C.locator('#cn_name').fill('홍길동');await C.locator('#cn_tel').fill('01012345678');await C.locator('#cn_addr').fill('남양주 다산 자이 202동 1001호');await C.locator('[data-cs="new"]').click();await wait(900);
   const asked=await askYes(C,true);await wait(1500);const cp=(await S(C,'projects')).find(p=>p.addr==='남양주 다산 자이 202동 1001호');
   ok(tag+'채진아: 같은 전화번호 고객이 있으면 물어보고 → 그 고객(C-2611-901)의 새 프로젝트로 등록 · 고객 카드는 늘지 않음',asked===1&&!!cp&&cp.custCode==='C-2611-901'&&cp.title==='자이'&&(await S(C,'customers')).length===nc0,JSON.stringify([asked,cp&&cp.custCode,cp&&cp.title]));
   const jt=await J.locator('#view').innerText();const den=await J.evaluate(()=>window.__mockDenied.filter(x=>!/^(activity|access|knock)/.test(x)));
   ok(tag+'정진혁 상담 화면에 원가·마진·성과금 숫자 없음 · 권한 밖 쓰기 0',!MONEY.test(jt)&&!den.length,den.join(','));
   await ctx.close()}
 }
 //__MORE__
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
