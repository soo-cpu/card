// 사후 원가 ← 계약 견적서 자동 연결 시험 (v0.99-27, 2026-11-13 · 다음 지시 2026-11-13 v1 4번): node intranet/tools/test/postcost_test.js [index.html]
// 1부(항상): 가짜 견적서(갑지 표)를 프로젝트에 첨부 → 원가 관리를 열면 항목·계약 금액 자동 → 실행 원가 입력 → 차액·마진율 → 기타 항목 → 견적서가 바뀌면 물어보고 다시 맞춤(입력값 유지·옛 줄 남김)
//          대표·정진혁(담당)·채진아(전체 담당)는 보이고, 이봄이(담당 아님)는 안 보임 · 공용 칸(work)·직원 사본에 원가가 안 샘
// 2부(선택): 진짜 엑셀로 — XLSX_JS=<xlsx.full.min.js 경로> EST_XLSX=<계약 견적서.xlsx 경로> [SHOT=<화면 그림 저장 경로>] 를 주면 실제 파일을 실제 엑셀 읽기 도구로 읽어 결과 표를 찍음
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
// 가짜 견적서: 홈퍼니싱 견적서_ver1 ‘갑지’와 같은 줄 배치 (NO·명칭·자재비·노무비·총액 → 소계 → 간접공사비 → 총합계)
const gap=(direct,ind,total)=>[["갑지"],["견적서 / ESTIMATE"],["NO","명 칭","자 재 비","노 무 비","총액","비고"],["","직 접 공 사 비"]].concat(direct.map(([n,m,l],i)=>[i+1,n,m,l,m+l,""])).concat([["소계","",direct.reduce((t,d)=>t+d[1],0),direct.reduce((t,d)=>t+d[2],0),direct.reduce((t,d)=>t+d[1]+d[2],0)],["","간 접 공 사 비"]]).concat(ind.map(([n,a],i)=>[i+1,n,"",5,"%",a])).concat([["","소 계","","","",ind.reduce((t,d)=>t+d[1],0)],["","총 합 계","","부가세포함","",total]]);
const XL1=gap([["철거공사",100000,900000],["목공사",2000000,1000000],["타일공사",1500000,500000]],[["공사진행비",300000]],6200000); // 항목 합 6,300,000 · 총 합계 6,200,000 → 할인·절사 -100,000
const XL2=gap([["철거공사",200000,1000000],["타일공사",1500000,500000],["도배공사",300000,500000]],[["공사진행비",200000]],4200000); // 목공사 빠짐 · 도배공사 새로 · 철거 금액 바뀜
// 이름이 겹치는 견적서 (검토 반려 2026-11-13): 목공사 두 줄 · ‘철거공사’와 ‘철거’ · 음수 줄 — 줄마다 따로 보여야 하고 보이는 줄 합 = 합계
const XD=gap([["철거공사",100000,900000],["목공사",2000000,1000000],["목공사",500000,500000],["철거",0,300000],["서비스 할인",-200000,0]],[["공사진행비",300000]],5400000);
const XD2=gap([["목공사",2500000,1000000],["철거",0,300000],["목공사",700000,500000],["철거공사",200000,900000]],[["공사진행비",300000]],6400000); // 순서·금액 바뀜 · 서비스 할인 빠짐
const xf=(id,name,rows)=>{const b=Buffer.from(JSON.stringify({SheetNames:["갑지"],Sheets:{"갑지":rows}}),'utf8');return {["xfile/"+id]:{name,type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",size:b.length,n:1,by:"u_boss",at:T0},["xfile/"+id+"_0"]:{data:b.toString('base64'),i:0,of:id}}};
const STAFF={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"}};
const XT="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const SEED=Object.assign({},STAFF,xf("e1","시험 계약 견적서.xlsx",XL1),xf("e2","시험 계약 견적서 (변경).xlsx",XL2),xf("d1","겹침 계약 견적서.xlsx",XD),xf("d2","겹침 계약 견적서 (변경).xlsx",XD2),{
 "projects/p3":{no:"P-2611-903",title:"이름 겹침 현장",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",contractAmt:5400000,cat:"주거",inq:"2026-11-03",files:[{id:"xf_d1",name:"겹침 계약 견적서.xlsx",type:XT,size:900}],updatedAt:T0},
 "projects/p4":{no:"P-2611-904",title:"실행 원가 확정 현장",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",contractAmt:6200000,cat:"주거",inq:"2026-11-04",files:[{id:"xf_e1",name:"시험 계약 견적서.xlsx",type:XT,size:900}],updatedAt:T0},
 "ppriv/p4":{pc:{lines:[{proc:"철거공사",est:"",act:"",st:"예상",hist:[]}],lock:{by:"u_boss",name:"최윤수",at:T0},updatedAt:T0,by:"u_boss"},updatedAt:T0},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 전체",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",contractAmt:6200000,cat:"주거",inq:"2026-11-01",work:"전체",files:[{id:"xf_e1",name:"시험 계약 견적서.xlsx",type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",size:900}],updatedAt:T0},
 "projects/p2":{no:"P-2611-902",title:"견적서 없는 현장",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",contractAmt:3000000,cat:"주거",inq:"2026-11-02",files:[],updatedAt:T0}});
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const STUB=`window.confirm=()=>false;window.XLSX={read:u=>JSON.parse(new TextDecoder().decode(u)),utils:{sheet_to_json:w=>w}};`;
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,320))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const N=s=>Number(String(s).replace(/[^0-9-]/g,''))||0;
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 const mk=async(opt,seedObj,init,routeX)=>{const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>routeX&&/xlsx/.test(r.request().url())?r.fulfill({contentType:'application/javascript',body:routeX}):r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[seedObj,RULES]);
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+init+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  return {ctx,open,seed}};
 const sh=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+'|'+s.id:''});
 const pc=(p,id)=>p.evaluate(i=>window.__hfT.pc(i),id);
 const openPc=async(p,id,tab)=>{await p.evaluate(()=>{location.hash='#projects'});await wait(500);await p.evaluate(i=>window.__hfT.open('projects',i),id);await wait(1000);if(!(await p.locator('#veil [data-pctop]').count()))return false;await p.locator('#veil [data-pctop]').first().click();await wait(tab===false?600:2500);if(tab){await p.locator('#veil [data-pctab="'+tab+'"]').click();await wait(700)}return true};
 const rows=p=>p.evaluate(()=>[...document.querySelectorAll('#pcPostT tbody tr')].map(tr=>[...tr.children].map(td=>{const i=td.querySelector('input');return (td.innerText||'').replace(/\s+/g,' ').trim()+(i?' ['+i.value+']':'')})));
 const foot=p=>p.evaluate(()=>[...document.querySelectorAll('#pcPostT tfoot tr')].map(tr=>(tr.innerText||'').replace(/\s+/g,' ').trim()));
 const setPi=async(p,i,v)=>{const el=p.locator('#pcPostT [data-pcpi="'+i+'"]');await el.fill(String(v));await el.dispatchEvent('change');await wait(900)};
 // ===== 1부 =====
 for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){
  const {ctx,open,seed}=await mk(opt,SEED,STUB);const A=await open('admin',12000);const tag=vn+' ';
  // 대표: 원가 관리를 열면 첨부 견적서가 자동으로 들어옴 (처음이라 묻지 않음)
  ok(tag+'대표: 프로젝트에 원가 관리 버튼',await openPc(A,'p1','post'));
  const c1=await pc(A,'p1'),L1=(c1&&c1.lines)||[];
  ok(tag+'첨부한 계약 견적서 → 항목 5줄(철거·목·타일·공사진행비·할인 절사)과 계약 금액 자동 · 합계 = 견적서 총 합계 6,200,000',L1.length===5&&L1.map(l=>l.proc).join(',')==='철거공사,목공사,타일공사,공사진행비,할인·절사 (견적서 총 합계에 맞춤)'&&L1.map(l=>l.sale).join(',')==='1000000,3000000,2000000,300000,-100000'&&c1.xl&&c1.xl.total===6200000&&c1.xl.fid==='xf_e1',L1.map(l=>l.proc+' '+l.sale).join(' / '));
  ok(tag+'확인 창 없이 들어옴 (처음 연결) · 사후 원가 탭 표 머리: 항목 | 계약 견적 금액(자동) | 실행 원가(직원 입력) | 차액 | 마진율',(await A.locator('.okask').count())===0&&/항목\s*계약 견적 금액 \(자동\)\s*실행 원가 \(직원 입력\)\s*차액\s*마진율/.test((await A.locator('#pcPostT thead').innerText()).replace(/\s+/g,' ')),(await A.locator('#pcPostT thead').innerText()).replace(/\s+/g,' '));
  let T=await rows(A);ok(tag+'표: 견적서 항목이 순서대로 줄줄이, 항목마다 계약 금액',/^철거공사/.test(T[0][0])&&/1,000,000/.test(T[0][1])&&/^목공사/.test(T[1][0])&&/3,000,000/.test(T[1][1])&&/^타일공사/.test(T[2][0])&&/2,000,000/.test(T[2][1])&&/^공사진행비/.test(T[3][0])&&/300,000/.test(T[3][1])&&/-100,000/.test(T[4][1]),T.slice(0,5).map(r=>r[0]+' '+r[1]).join(' / '));
  const box=(await A.locator('#pcXlBox').innerText()).replace(/\s+/g,' ');ok(tag+'읽은 견적서 이름·항목 수·총 합계 표시',/시험 계약 견적서\.xlsx/.test(box)&&/항목 4개/.test(box)&&/6,200,000원/.test(box),box.slice(0,200));
  // 실행 원가 입력 → 차액·마진율
  await setPi(A,0,700000);await setPi(A,1,2400000);T=await rows(A);const F=await foot(A);
  ok(tag+'실행 원가 입력 → 차액·마진율 자동 (철거 1,000,000−700,000 = 300,000 · 30% / 목 3,000,000−2,400,000 = 600,000 · 20%)',/\[700,000\]/.test(T[0][2])&&T[0][3]==='300,000'&&T[0][4]==='30%'&&/\[2,400,000\]/.test(T[1][2])&&T[1][3]==='600,000'&&T[1][4]==='20%',T.slice(0,2).map(r=>r.join(' | ')).join(' // '));
  ok(tag+'합계 줄: 계약 6,200,000 · 실행 원가 3,100,000 · 차액 3,100,000 · 50%',/6,200,000/.test(F[0])&&/3,100,000/.test(F[0])&&/50%/.test(F[0]),F[0]);
  // 기타 항목 직접 추가
  await A.locator('#veil [data-pcpadd]').first().click();await wait(900);let pj=await A.evaluate(()=>{const i=document.querySelector('#pcPostT input[data-pcp^="proc|"]');return i?i.dataset.pcp.split('|')[1]:''});
  const en=A.locator('#pcPostT [data-pcp="proc|'+pj+'"]');await en.fill('추가 전기 배선');await en.dispatchEvent('change');await wait(900);const ea=A.locator('#pcPostT [data-pcp="amt|'+pj+'"]');await ea.fill('150000');await ea.dispatchEvent('change');await wait(900);
  T=await rows(A);const etc=T.find(r=>/추가 전기 배선/.test(r[0]))||[];const F2=await foot(A);
  ok(tag+'‘+ 기타 항목 추가’ → 견적서에 없는 원가를 직접 넣고 합계에 더해짐 (3,250,000)',/견적서에 없음/.test(etc[1]||'')&&/\[150,000\]/.test(etc[2]||'')&&/3,250,000/.test(F2[0]),(etc.join(' | '))+' // '+F2[0]);
  ok(tag+'사후 원가 화면 가로 넘침 없음 (표는 표 상자 안에서만 밀림)',await A.evaluate(()=>{const s=document.querySelector('.sheet');return document.documentElement.scrollWidth<=window.innerWidth+2&&s.scrollWidth<=s.clientWidth+2}));
  // 담당 직원(정진혁): 같은 표가 보이고 입력할 수 있음 · 이봄이(담당 아님)는 안 보임 · 채진아(전체 담당)는 보임
  await wait(1500);const J=await open('jjh');ok(tag+'정진혁(담당): 원가 관리 → 사후 원가 표에 견적서 항목·계약 금액·대표가 넣은 실행 원가',await openPc(J,'p1','post')&&await J.evaluate(()=>{const t=document.querySelector('#pcPostT');return !!t&&/철거공사/.test(t.innerText)&&/1,000,000/.test(t.innerText)&&!!t.querySelector('[data-pcpi="0"]')&&t.querySelector('[data-pcpi="0"]').value==='700,000'}));
  await setPi(J,2,1500000);const cj=await pc(J,'p1');ok(tag+'정진혁: 타일공사 실행 원가 1,500,000 입력 → 본인 원가 사본에 저장',((cj&&cj.post)||[]).some(r=>r.it&&r.proc==='타일공사'&&r.amt===1500000)&&(await J.evaluate(()=>window.__mockDenied.length))===0,JSON.stringify((cj&&cj.post)||[]).slice(0,200));
  const B=await open('bom');await B.evaluate(()=>{location.hash='#projects'});await wait(500);await B.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1000);
  ok(tag+'이봄이(이 프로젝트 담당 아님): 원가 관리 버튼·표·금액 없음',(await sh(B))==='projects|p1'&&(await B.locator('#veil [data-pctop]').count())===0&&(await B.locator('.pcbox').count())===0&&!/원가 관리|마진|3,100,000|700,000|2,400,000/.test(await B.locator('#veil').innerText()),(await sh(B))+' '+(await B.locator('#veil [data-pctop]').count())+' '+(await B.locator('.pcbox').count())+' '+((await B.locator('#veil').innerText()).match(/.{30}(원가 관리|마진|3,100,000|700,000|2,400,000).{30}/s)||[''])[0].replace(/\s+/g,' '));
  const C=await open('cja');ok(tag+'채진아(전체 담당): 기존 권한 그대로 원가 관리가 보임',await openPc(C,'p1','post')&&/철거공사/.test(await C.locator('#pcPostT').innerText()));
  // 공용 칸·직원 사본에 원가가 새지 않음
  const leak=await seed.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb')||'{}'),bad=[];Object.keys(D).forEach(k=>{if(/^(ppriv\/|acct\/u_jjh\/pcost\/|acct\/u_cja\/pcost\/|xfile\/|knock\/|activity\/)/.test(k))return;const s=JSON.stringify(D[k]);if(/"(pc|post|xl|xlHist)":|"sale":|700000|2400000|1500000|3100000/.test(s))bad.push(k)});return bad});
  ok(tag+'원가·실행 원가는 대표 칸(ppriv)과 담당·채진아 원가 사본에만 · 공용 칸(work)·이봄이 사본·프로젝트 문서에 없음',leak.length===0,leak.join(','));
  await J.close();await B.close();await C.close();
  // 첨부 견적서가 바뀜 → 물어본 뒤 다시 맞춤
  await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);
  await A.evaluate(async()=>{const p=Object.assign({},window.__hfT.S().projects.find(x=>x.id==='p1'));delete p.id;p.files=p.files.concat([{id:'xf_e2',name:'시험 계약 견적서 (변경).xlsx',type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',size:900}]);await window.__hfT.put('projects','p1',p)});await wait(1500);
  await openPc(A,'p1',false);await wait(1200);const q=(await A.locator('.okask').count())?(await A.locator('.okask').last().innerText()).replace(/\s+/g,' '):'';
  ok(tag+'첨부 견적서가 바뀌면 “새 견적서로 항목을 다시 맞출까요?” (화면 안 확인 창 · 바로 바꾸지 않음)',/새 견적서로 항목을 다시 맞출까요\?/.test(q)&&/지우지 않고/.test(q)&&(await pc(A,'p1')).xl.fid==='xf_e1',q.slice(0,160));
  await A.locator('.okask [data-ok="0"]').last().click();await wait(600);await A.locator('#veil [data-pctab="post"]').click();await wait(600);
  const bx=(await A.locator('#pcXlBox').innerText()).replace(/\s+/g,' ');ok(tag+'‘그대로 두기’ → 항목 그대로 · ‘첨부 견적서가 바뀌었어요’ 표시와 다시 맞추기 버튼',(await pc(A,'p1')).xl.fid==='xf_e1'&&/첨부 견적서가 바뀌었어요/.test(bx)&&/새 견적서로 항목 다시 맞추기/.test(bx),bx.slice(0,200));
  await A.locator('#veil [data-pcxlre]').click();await wait(700);await A.locator('.okask [data-ok="1"]').last().click();await wait(2500);
  const c2=await pc(A,'p1'),L2=c2.lines,g=n=>L2.find(l=>l.proc===n)||{},po=c2.post||[];
  ok(tag+'다시 맞춤: 새 항목 순서(철거·타일·도배·공사진행비) · 철거 계약 금액 1,200,000으로 · 도배공사 새 줄',L2.slice(0,4).map(l=>l.proc+' '+l.sale).join(' / ')==='철거공사 1200000 / 타일공사 2000000 / 도배공사 800000 / 공사진행비 200000'&&c2.xl.fid==='xf_e2'&&c2.xl.total===4200000,L2.map(l=>l.proc+' '+l.sale+(l.old?' (옛)':'')).join(' / '));
  ok(tag+'이미 입력한 실행 원가는 그대로 (철거 700,000 · 목 2,400,000 · 기타 150,000)',po.some(r=>r.it&&r.proc==='철거공사'&&r.amt===700000)&&po.some(r=>r.it&&r.proc==='목공사'&&r.amt===2400000)&&po.some(r=>r.proc==='추가 전기 배선'&&r.amt===150000),JSON.stringify(po.map(r=>[r.proc,r.amt])));
  ok(tag+'새 견적서에 없는 목공사 줄은 버리지 않고 ‘옛 견적서 항목’으로 남김 (옛 계약 금액 3,000,000 기록, 계약 합계에서는 뺌) · 맞추기 전 모습 보관',g('목공사').old===1&&g('목공사').saleOld===3000000&&!g('목공사').sale&&(c2.xlHist||[]).length>=1&&c2.xlHist[c2.xlHist.length-1].lines.some(l=>l.proc==='목공사'&&l.sale===3000000),JSON.stringify(g('목공사'))+' hist '+(c2.xlHist||[]).length);
  await A.locator('#veil [data-pctab="post"]').click();await wait(600);T=await rows(A);const tm=T.find(r=>/^목공사/.test(r[0]))||[],td=T.find(r=>/^철거공사/.test(r[0]))||[];const F3=await foot(A);
  ok(tag+'표: 철거 1,200,000 − 700,000 = 500,000 · 목공사 줄에 ‘옛 견적서 항목’과 입력값 2,400,000 · 계약 합계 4,200,000',/1,200,000/.test(td[1])&&td[3]==='500,000'&&/옛 견적서 항목/.test(tm[0])&&/\[2,400,000\]/.test(tm[2])&&/4,200,000/.test(F3[0]),td.join(' | ')+' // '+tm.join(' | ')+' // '+F3[0]);
  // 견적서가 없는 프로젝트: 안내만
  await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);await openPc(A,'p2','post');const nb=(await A.locator('#pcXlBox').innerText()).replace(/\s+/g,' ');
  ok(tag+'견적서를 첨부하지 않은 프로젝트: “계약 견적서가 아직 첨부되지 않았어요” 안내 · 기타 항목은 직접 추가 가능',/아직 첨부되지 않았어요/.test(nb)&&(await A.locator('#veil [data-pcpadd]').count())>=1&&!(await pc(A,'p2')||{}).xl,nb.slice(0,120));
  // 이름이 겹치는 견적서: 줄마다 따로 · 보이는 줄 합 = 합계 · 줄마다 입력 · 다시 맞추기에서도 안 섞임
  await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);await openPc(A,'p3','post');
  const items=async()=>{const T=await rows(A),k=T.findIndex(r=>/^기타 항목/.test(r[0]));return T.slice(0,k<0?T.length:k)};const inV=c=>N((String(c).match(/\[([^\]]*)\]/)||[0,''])[1]);
  let cd=await pc(A,'p3'),I=await items(),FD=await foot(A);
  ok(tag+'이름 겹침: 견적서 6줄이 표에도 6줄 (철거공사·목공사·목공사·철거·서비스 할인·공사진행비) · 줄마다 입력 칸',(cd.lines||[]).length===6&&I.length===6&&I.map(r=>r[0]).join(',')==='철거공사,목공사,목공사,철거,서비스 할인,공사진행비'&&(await A.locator('#pcPostT [data-pcpi]').count())===6,I.map(r=>r[0]+' '+r[1]).join(' / '));
  ok(tag+'이름 겹침: 보이는 줄의 계약 금액 합 = 합계 줄 = 견적서 총 합계 5,400,000 (음수 줄 -200,000 포함)',I.reduce((t,r)=>t+N(r[1]),0)===5400000&&/5,400,000/.test(FD[0])&&/-200,000/.test(I[4][1])&&!cd.xl.adj,I.reduce((t,r)=>t+N(r[1]),0)+' // '+FD[0]);
  await setPi(A,1,2000000);await setPi(A,2,700000);await setPi(A,3,100000);await setPi(A,0,600000);cd=await pc(A,'p3');I=await items();FD=await foot(A);const its=(cd.post||[]).filter(r=>r.it);
  ok(tag+'이름 겹침: 줄마다 따로 저장 (목공사 2,000,000 / 목공사 700,000 / 철거 100,000 / 철거공사 600,000 · 줄 번호 4개가 서로 다름)',its.length===4&&new Set(its.map(r=>r.lid)).size===4&&[inV(I[0][2]),inV(I[1][2]),inV(I[2][2]),inV(I[3][2])].join(',')==='600000,2000000,700000,100000',JSON.stringify(its.map(r=>[r.proc,r.amt]))+' '+I.slice(0,4).map(r=>r[2]).join(' | '));
  ok(tag+'이름 겹침: 줄마다 차액·마진율 (둘째 목공사 1,000,000−700,000 = 300,000 · 30% / 철거 300,000−100,000 = 200,000) · 보이는 실행 원가 합 3,400,000 = 합계 줄',I[2][3]==='300,000'&&I[2][4]==='30%'&&I[3][3]==='200,000'&&I[1][3]==='1,000,000'&&I.reduce((t,r)=>t+inV(r[2]),0)===3400000&&/3,400,000/.test(FD[0]),I.slice(0,4).map(r=>r.join(' | ')).join(' // ')+' // '+FD[0]);
  await A.locator('#veil [data-pctab="cmp"]').click();await wait(600);const CM=await A.evaluate(()=>{const t=[...document.querySelectorAll('.pcbox table')].find(x=>x.querySelector('tfoot'));return {b:[...t.querySelectorAll('tbody tr')].map(tr=>[...tr.children].map(td=>td.innerText.replace(/\s+/g,' ').trim())),f:[...t.querySelectorAll('tfoot tr')].map(tr=>tr.innerText.replace(/\s+/g,' ').trim())}});
  const cr=n=>CM.b.find(r=>r[0].replace(/ 초과$/,'')===n)||[];
  ok(tag+'비교표(③)도 같은 숫자: 목공사 견적 4,000,000·사후 2,700,000 / 철거공사 1,000,000·600,000 / 철거 300,000·100,000 / 합계 5,400,000·3,400,000',N(cr('목공사')[1])===4000000&&N(cr('목공사')[3])===2700000&&N(cr('철거공사')[1])===1000000&&N(cr('철거공사')[3])===600000&&N(cr('철거')[1])===300000&&N(cr('철거')[3])===100000&&CM.b.reduce((t,r)=>t+N(r[1]),0)===5400000&&CM.b.reduce((t,r)=>t+N(r[3]),0)===3400000&&/5,400,000/.test(CM.f[0])&&/3,400,000/.test(CM.f[0]),CM.b.map(r=>r[0]+' '+r[1]+' '+r[3]).join(' / ')+' // '+CM.f[0]);
  // 겹친 상태에서 견적서가 바뀜 → 다시 맞추기
  await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);
  await A.evaluate(async()=>{const p=Object.assign({},window.__hfT.S().projects.find(x=>x.id==='p3'));delete p.id;p.files=p.files.concat([{id:'xf_d2',name:'겹침 계약 견적서 (변경).xlsx',type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',size:900}]);await window.__hfT.put('projects','p3',p)});await wait(1500);
  await openPc(A,'p3',false);await wait(1200);const qd=await A.locator('.okask').count();if(qd){await A.locator('.okask [data-ok="1"]').last().click();await wait(2500)}await A.locator('#veil [data-pctab="post"]').click();await wait(600);
  cd=await pc(A,'p3');I=await items();FD=await foot(A);const po3=(cd.post||[]).filter(r=>r.it).map(r=>r.amt).sort((a,b)=>a-b).join(',');
  ok(tag+'겹친 채 다시 맞추기: 새 순서(목공사 3,500,000 · 철거 300,000 · 목공사 1,200,000 · 철거공사 1,100,000 · 공사진행비) + 빠진 ‘서비스 할인’은 옛 줄로 남음',qd===1&&cd.xl.fid==='xf_d2'&&cd.lines.slice(0,5).map(l=>l.proc+' '+l.sale).join(' / ')==='목공사 3500000 / 철거 300000 / 목공사 1200000 / 철거공사 1100000 / 공사진행비 300000'&&cd.lines.some(l=>l.proc==='서비스 할인'&&l.old===1&&l.saleOld===-200000),cd.lines.map(l=>l.proc+' '+l.sale+(l.old?' (옛 '+l.saleOld+')':'')).join(' / '));
  ok(tag+'겹친 채 다시 맞추기: 입력한 실행 원가가 제 줄에 그대로 (첫 목공사 2,000,000 · 철거 100,000 · 둘째 목공사 700,000 · 철거공사 600,000) · 사라지거나 섞인 값 없음',po3==='100000,600000,700000,2000000'&&[inV(I[0][2]),inV(I[1][2]),inV(I[2][2]),inV(I[3][2])].join(',')==='2000000,100000,700000,600000',po3+' // '+I.slice(0,4).map(r=>r[0]+' '+r[2]).join(' | '));
  ok(tag+'겹친 채 다시 맞추기: 보이는 줄 합 = 합계 (계약 6,400,000 · 실행 원가 3,400,000)',I.reduce((t,r)=>t+N(r[1].replace(/\(옛[^)]*\)/,'')),0)===6400000&&I.reduce((t,r)=>t+inV(r[2]),0)===3400000&&/6,400,000/.test(FD[0])&&/3,400,000/.test(FD[0]),I.map(r=>r[0]+' '+r[1]).join(' / ')+' // '+FD[0]);
  // 실행 원가 확정(잠금) 상태: 자동으로 바꾸지 않고 물어봄
  await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);await openPc(A,'p4',false);await wait(1200);const ql=(await A.locator('.okask').count())?(await A.locator('.okask').last().innerText()).replace(/\s+/g,' '):'';const c4=await pc(A,'p4');
  ok(tag+'실행 원가 확정(잠금) 프로젝트: 견적서를 자동으로 넣지 않고 물어봄 (그대로 두면 줄 안 바뀜)',/확정\(잠금\)/.test(ql)&&!c4.xl&&c4.lines.length===1&&!!c4.lock,ql.slice(0,120));
  if(ql){await A.locator('.okask [data-ok="0"]').last().click();await wait(500)}ok(tag+'‘그대로 두기’ 뒤에도 잠금·줄 그대로',!(await pc(A,'p4')).xl&&(await pc(A,'p4')).lines.length===1);
  await A.close();await ctx.close()}
 // ===== 2부: 진짜 엑셀 =====
 if(process.env.XLSX_JS&&process.env.EST_XLSX){const lib=fs.readFileSync(process.env.XLSX_JS,'utf8'),buf=fs.readFileSync(process.env.EST_XLSX),b64=buf.toString('base64'),CH=180000,n=Math.ceil(b64.length/CH),nm=process.env.EST_NAME||'계약 견적서 (최종).xlsx';
  const S2=Object.assign({},STAFF,{"xfile/real":{name:nm,type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",size:buf.length,n,by:"u_boss",at:T0},
   "projects/pa":{no:"P-2611-004",title:"시험용 실제 견적서 현장",custName:"시험 고객",custCode:"",stage:"계약",mgr:"정진혁",contractAmt:N(process.env.EST_CONTRACT||0)||"",cat:"주거",inq:"2026-11-06",files:[{id:"xf_real",name:nm,size:buf.length}],updatedAt:T0},
   "ppriv/pa":{pc:{lines:[{proc:"철거",est:"",act:"",st:"예상",hist:[]},{proc:"",est:"",act:"",st:"예상",hist:[]},{proc:"",est:"",act:"",st:"예상",hist:[]},{proc:"",est:"",act:"",st:"예상",hist:[]}],by:"u_boss",updatedAt:T0},updatedAt:T0}});
  for(let i=0;i<n;i++)S2["xfile/real_"+i]={data:b64.slice(i*CH,(i+1)*CH),i,of:"real"};
  const {ctx,open}=await mk({viewport:{width:1280,height:1400}},S2,'window.confirm=()=>false;',lib);const A=await open('admin',12000);
  await openPc(A,'pa',false);await wait(6000);await A.locator('#veil [data-pctab="post"]').click();await wait(800);
  const c=await pc(A,'pa')||{},L=c.lines||[],sum=L.reduce((t,l)=>t+(Number(l.sale)||0),0);
  ok('실제 견적서: 원가 관리를 열면 항목이 자동으로 들어옴 (확인 창 없음 · 손으로 적어 둔 ‘철거’ 줄은 ‘철거공사’ 항목으로 맞춰짐)',L.length>3&&!!c.xl&&(await A.locator('.okask').count())===0&&!L.some(l=>l.proc==='철거'),L.length+'줄');
  ok('실제 견적서: 항목 합계 = 견적서 총 합계',!!c.xl&&c.xl.total>0&&sum===c.xl.total,sum+' / '+(c.xl&&c.xl.total));
  console.log('\n[실제 견적서 결과] 파일: '+nm);console.log('항목 수: '+L.length+' (견적서 공정 '+(c.xl&&c.xl.n)+'개'+(c.xl&&c.xl.adj?' + 할인·절사 1줄':'')+')');console.log('계약 금액 합계: '+sum.toLocaleString('ko-KR')+'원 · 견적서 총 합계: '+((c.xl&&c.xl.total)||0).toLocaleString('ko-KR')+'원 · 공정 합계(조정 전): '+((c.xl&&c.xl.sum)||0).toLocaleString('ko-KR')+'원');
  console.log('| 항목 | 계약 견적 금액 |');console.log('|---|---:|');L.forEach(l=>console.log('| '+l.proc+' | '+(Number(l.sale)||0).toLocaleString('ko-KR')+' |'));
  console.log('표 머리: '+(await A.locator('#pcPostT thead').innerText()).replace(/\s+/g,' '));console.log('합계 줄: '+(await foot(A)).join(' // '));console.log('견적서 상자: '+(await A.locator('#pcXlBox').innerText()).replace(/\s+/g,' '));
  if(process.env.SHOT){await A.locator('#veil .pcbox').scrollIntoViewIfNeeded();await A.locator('#veil .pcbox').screenshot({path:process.env.SHOT}).catch(e=>console.log('그림 저장 실패',e.message))}
  await A.close();await ctx.close();
  // 3부: 프로젝트 창에서 진짜 엑셀을 ‘파일 선택’으로 첨부 → 저장 → 원가 관리에 자동 (가짜 저장소도 실제처럼 문서 하나 26만 자 제한)
  {const S3=Object.assign({},STAFF,{"projects/pb":{no:"P-2611-905",title:"첨부 시험 현장",custName:"시험 고객",custCode:"",stage:"계약",mgr:"정진혁",contractAmt:N(process.env.EST_CONTRACT||0)||"",cat:"주거",inq:"2026-11-06",files:[],updatedAt:T0}});
   const {ctx,open}=await mk({viewport:{width:1280,height:1000}},S3,'window.confirm=()=>false;',lib);const A=await open('admin',12000);
   await A.evaluate(()=>{location.hash='#projects'});await wait(500);await A.evaluate(()=>window.__hfT.open('projects','pb'));await wait(1000);
   await A.locator('#fileIn').setInputFiles({name:nm,mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:buf});
   let up=false;for(let i=0;i<40&&!up;i++){await wait(500);up=await A.evaluate(n=>[...document.querySelectorAll('#fileList .file')].some(x=>x.textContent.includes(n)&&!/올리는 중/.test(x.textContent)),nm)}
   ok('실제 견적서('+Math.round(buf.length/1024)+'KB)를 프로젝트 첨부 칸에 올림 (엑셀 원본 보관)',up);
   await A.locator('#saveSheet').click();await wait(9000);const c=await pc(A,'pb')||{},L=c.lines||[];
   ok('첨부하고 ‘저장’만 누르면 원가 관리에 견적서 항목·계약 금액이 자동으로 (원가 창을 열지 않아도)',!!c.xl&&L.length===(c.xl.n+(c.xl.adj?1:0))&&L.reduce((t,l)=>t+(Number(l.sale)||0),0)===c.xl.total,L.length+'줄 '+(c.xl&&c.xl.total));
   await openPc(A,'pb','post');ok('그 뒤 사후 원가 표에 항목이 줄줄이',(await A.locator('#pcPostT [data-pcpi]').count())>=L.length-1&&L.length>3,await A.locator('#pcPostT [data-pcpi]').count());
   await A.close();await ctx.close()}}
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 const i0=HTML.indexOf('// ===== 사후 원가 ← 계약 견적서 자동 연결'),blk=HTML.slice(i0,HTML.indexOf('// 원가 관리 버튼을 프로젝트 창 맨 위에 크게'));
 ok('사후 원가 연결 코드에 alert/confirm/prompt/window.open/iframe 0건 · 공용 칸(work)·프로젝트 문서에 쓰지 않음',i0>0&&blk.length>2000&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe/.test(blk)&&!/workPut|WKP|put\(|collection\("work/.test(blk),blk.length+'자');
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
