// 묶음 2A 시험 (v0.99-29, 2026-11-13 · 대표 지시 2026-11-13 의 1a·6·19·21번): node intranet/tools/test/b2a_test.js [index.html]   · ONLY=1a|6|19|21 로 한 부분만
// 1a: 사후 원가 ← 드라이브 현장 폴더에서 견적서 가져오기 (가짜 드라이브 — 읽기 도구만 불렸는지도 봄) + 엑셀 읽기(갑지·이름 다른 시트·일반 양식·시트 여럿)
// 선택: XLSX_JS=<xlsx.full.min.js> EST_XLSX=<실제 계약 견적서.xlsx> [SHOT=<그림 경로>] → 실제 파일을 가짜 드라이브에 넣어 같은 길로 가져와 줄 수·합계 확인
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z",XT="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",FT="application/vnd.google-apps.folder";
const ONLY=process.env.ONLY||"";const on=k=>!ONLY||ONLY===k;
const gap=(direct,ind,total,extra)=>[["갑지"],["견적서 / ESTIMATE"],["NO","명 칭","자 재 비","노 무 비","총액","비고"],["","직 접 공 사 비"]].concat(direct.map(([n,m,l,t],i)=>[i+1,n,m,l,t===undefined?m+l:t,""])).concat([["소계","",0,0,direct.reduce((t,d)=>t+(d[3]===undefined?d[1]+d[2]:d[3]),0)],["","간 접 공 사 비"]]).concat(ind.map(([n,a],i)=>[i+1,n,"",5,"%",a])).concat(extra||[]).concat([["","총  합 계","","부가세포함","",total]]);
// 입주청소 줄: 자재비 칸에 평수(24)·노무비 칸에 단가(17000)·총액 0 → 금액으로 읽으면 안 됨 (실제 견적서에서 나온 것)
const XL1=gap([["철거공사",100000,900000],["목공사",2000000,1000000],["타일공사",1500000,500000],["부부욕실",0,0],["입주청소",24,17000,0]],[["공사진행비",300000]],6200000,[["","","","","",100000]]);
const XL2=gap([["철거공사",200000,1000000],["타일공사",1500000,500000],["도배공사",300000,500000]],[["공사진행비",200000]],4200000);
const GEN=[["견 적 서"],["","","부가세 포함금액","","",1100000],["구분","품 명","규격","수량","단가","금액"],[1,"철거공사","금속","1","",700000],[2,"목공 공사","인건비",12,400000,4800000],["","","자재비",1,"",3500000],["","","소 계","","",8300000],["","소 계","","","",9000000],["","합 계","","","",9000000]];
const wbJ=(names,sheets)=>Buffer.from(JSON.stringify({SheetNames:names,Sheets:sheets}),'utf8').toString('base64');
const STAFF={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,320))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const STUB=`window.confirm=()=>false;window.XLSX={read:u=>JSON.parse(new TextDecoder().decode(u)),utils:{sheet_to_json:w=>w}};`;
// 가짜 구글 드라이브: 읽기 도구 3개만 답함. 부른 도구 이름은 window.__mcpLog 에 남김
const mcpInit=tree=>`window.__mcpLog=[];window.__MOCKMCP=(()=>{const T=${JSON.stringify(tree)};const J=o=>({content:[{type:"text",text:JSON.stringify(o)}]});return {callTool:async(sv,tool,inp)=>{window.__mcpLog.push(tool+'|'+String(inp.fileId||inp.parentId||'')+'|'+String(inp.title||'').slice(0,12));
 if(tool==="search_files"){const q=inp.query||"";const pm=/parentId = '([^']+)'/.exec(q),ts=[...q.matchAll(/title contains '([^']+)'/g)].map(m=>m[1]),fo=/mimeType = 'application\\/vnd.google-apps.folder'/.test(q);
  return J({files:T.filter(f=>(!pm||f.parentId===pm[1])&&ts.every(t=>f.title.includes(t))&&(!fo||f.mimeType==="${FT}")&&(pm||ts.length)).map(f=>({id:f.id,title:f.title,mimeType:f.mimeType,parentId:f.parentId,modifiedTime:f.mod||"2026-10-27T01:00:00Z",sharedDriveId:f.sd||undefined}))})}
 if(tool==="get_file_metadata"){const f=T.find(x=>x.id===inp.fileId);return f?J({id:f.id,title:f.title,mimeType:f.mimeType}):{isError:true,content:[{text:"not found"}]}}
 if(tool==="download_file_content"){const f=T.find(x=>x.id===inp.fileId);return f&&f.b64?J({id:f.id,title:f.title,content:f.b64}):{isError:true,content:[{text:"no content"}]}}
 return {isError:true,content:[{text:"쓰기 도구는 시험에서 막음: "+tool}]}}}})();`;
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 const mk=async(opt,seedObj,init,routeX)=>{const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>routeX&&/xlsx/.test(r.request().url())?r.fulfill({contentType:'application/javascript',body:routeX}):r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[seedObj,RULES]);
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+init+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);for(let i=0;i<40&&!(await p.evaluate(()=>!!window.__hfT));i++)await wait(500);if(!(await p.evaluate(()=>!!window.__hfT)))console.log('  (화면이 안 뜸: '+who+') '+(await p.locator('body').innerText()).replace(/\s+/g,' ').slice(0,200));return p};
  return {ctx,open,seed}};
 const sh=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+'|'+s.id:''});
 const pc=(p,id)=>p.evaluate(i=>window.__hfT.pc(i),id);
 const openPc=async(p,id,tab)=>{await p.evaluate(()=>{location.hash='#projects'});await wait(500);await p.evaluate(i=>window.__hfT.open('projects',i),id);await wait(1000);if(!(await p.locator('#veil [data-pctop]').count()))return false;await p.locator('#veil [data-pctop]').first().click();await wait(1500);if(tab){await p.locator('#veil [data-pctab="'+tab+'"]').click();await wait(700)}return true};
 const rows=p=>p.evaluate(()=>[...document.querySelectorAll('#pcPostT tbody tr')].map(tr=>[...tr.children].map(td=>{const i=td.querySelector('input');return (td.innerText||'').replace(/\s+/g,' ').trim()+(i?' ['+i.value+']':'')})));
 const setPi=async(p,i,v)=>{const el=p.locator('#pcPostT [data-pcpi="'+i+'"]');await el.fill(String(v));await el.dispatchEvent('change');await wait(900)};
 const noOver=p=>p.evaluate(()=>{const s=[...document.querySelectorAll('.veil .sheet')].pop();return document.documentElement.scrollWidth<=window.innerWidth+2&&(!s||s.scrollWidth<=s.clientWidth+2)});
 const sumSale=c=>((c&&c.lines)||[]).reduce((t,l)=>t+(Number(l.sale)||0),0);

 // ================= 1a =================
 if(on('1a')){
  const TREE=[{id:"F_p2",title:"2026-11 견적서 없는 현장 24평",mimeType:FT,parentId:"ROOT",sd:"SD1"},{id:"F_p2e",title:"견적서",mimeType:FT,parentId:"F_p2"},{id:"F_p2m",title:"06. 마감재",mimeType:FT,parentId:"F_p2"},
   {id:"X_1",title:"261027 견적서 없는 현장 (최종).xlsx",mimeType:XT,parentId:"F_p2e",b64:wbJ(["갑지"],{"갑지":XL1})},{id:"X_2",title:"261101 견적서 없는 현장 (변경 계약).xlsx",mimeType:XT,parentId:"F_p2e",mod:"2026-11-01T01:00:00Z",b64:wbJ(["갑지"],{"갑지":XL2})},
   {id:"X_m",title:"마감재리스트.xlsx",mimeType:XT,parentId:"F_p2m",b64:wbJ(["Sheet1"],{"Sheet1":[["a"]]})},{id:"X_t",title:"~$261027 임시.xlsx",mimeType:XT,parentId:"F_p2e"},{id:"P_1",title:"계약서.pdf",mimeType:"application/pdf",parentId:"F_p2"},
   {id:"F_linkedfolder01234567",title:"2026-10 링크 걸린 현장",mimeType:FT,parentId:"ROOT"},{id:"X_g",title:"일반 양식 견적서.xls",mimeType:"application/vnd.ms-excel",parentId:"F_linkedfolder01234567",b64:wbJ(["판넬","자재성","메모"],{"판넬":GEN.slice(0,4).concat([["","합 계","","","",700000]]),"자재성":GEN,"메모":[["그냥 메모"]]})},
   {id:"X_r",title:"이름 다른 시트.xlsx",mimeType:XT,parentId:"F_linkedfolder01234567",b64:wbJ(["표지","총괄표"],{"표지":[["표지"]],"총괄표":XL2})},
   {id:"F_pasted0123456789abc",title:"붙여 넣을 폴더",mimeType:FT,parentId:"ROOT"},{id:"X_p",title:"붙여 넣은 폴더 견적서.xlsx",mimeType:XT,parentId:"F_pasted0123456789abc",b64:wbJ(["갑지"],{"갑지":XL2})}];
  const SEED=Object.assign({},STAFF,{
   "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},
   "projects/p2":{no:"P-2611-902",title:"견적서 없는 현장",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",contractAmt:6200000,cat:"주거",inq:"2026-11-02",files:[],updatedAt:T0},
   "projects/p5":{no:"P-2611-905",title:"링크 현장",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",contractAmt:1,cat:"주거",inq:"2026-11-03",drive:"https://drive.google.com/drive/folders/F_linkedfolder01234567?usp=sharing",files:[],updatedAt:T0},
   "projects/p6":{no:"P-2611-906",title:"어디에도 없는 곳",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"이봄이",contractAmt:1,cat:"주거",inq:"2026-11-04",files:[],updatedAt:T0},
   "projects/p7":{no:"P-2611-907",title:"목록 현장 101동",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",contractAmt:1,cat:"주거",inq:"2026-11-05",files:[],updatedAt:T0},
   "acct/_drv/site/c0":{at:T0,items:[{id:"X_1",m:XT,mod:"2026-10-27",path:"2026년 / 11월 / 2026-11 구리 목록 현장 101동 24평 / 견적서",pno:"",proj:"2026-11 구리 목록 현장 101동 24평",t:"목록 현장 (최종).xlsx"},{id:"P_9",m:"application/pdf",mod:"2026-10-27",path:"2026년 / 11월 / 2026-11 구리 목록 현장 101동 24평",pno:"",proj:"2026-11 구리 목록 현장 101동 24평",t:"계약서.pdf"},{id:"X_9",m:XT,mod:"2026-10-27",path:"2026년 계약 및 실행내역 / 손익계산서",pno:"",proj:"2026년 계약 및 실행내역",t:"목록 현장 101동 손익.xlsx"}]}});
  for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){const tag='1a '+vn+' ';
   const {ctx,open,seed}=await mk(opt,SEED,STUB+mcpInit(TREE));const A=await open('admin',12000);
   // 엑셀 읽기 규칙 (실제 견적서에서 나온 것)
   const g=await A.evaluate(x=>window.__hfT.qxGap(x),XL1);
   ok(tag+'갑지 읽기: 총액 칸만 읽음 — 입주청소(자재비 칸 24·노무비 칸 17000·총액 0)는 금액으로 안 들어감 · 0원 줄(부부욕실·입주청소)은 이름만 남김 · 총 합계 6,200,000',g.lines.map(l=>l.proc+':'+l.amt).join(',')==='철거공사:1000000,목공사:3000000,타일공사:2000000,공사진행비:300000'&&g.total===6200000&&g.zero.join(',')==='부부욕실,입주청소',JSON.stringify(g).slice(0,260));
   const gg=await A.evaluate(x=>window.__hfT.qxGen(x),GEN);
   ok(tag+'일반 견적서 표(품명·금액): 품명마다 한 줄 — 묶음에 ‘소계’가 있으면 그 값, 없으면 그 줄 금액 · ‘합계’ 줄 = 총 합계 · 부가세 포함금액은 따로 적어 둠',gg&&gg.lines.map(l=>l.proc+':'+l.amt).join(',')==='철거공사:700000,목공 공사:8300000'&&gg.total===9000000&&gg.vat===1100000,JSON.stringify(gg).slice(0,260));
   // 대표: 견적서 없는 프로젝트 → 버튼 → 드라이브에서 현장 폴더를 이름으로 찾음 → 엑셀 목록
   ok(tag+'대표: 사후 원가에 ‘드라이브 현장 폴더에서 견적서 가져오기’ 버튼',await openPc(A,'p2','post')&&(await A.locator('#pcXlBox [data-pcdrv]').count())===1&&/드라이브 현장 폴더에서 견적서 가져오기/.test(await A.locator('#pcXlBox').innerText()));
   await A.locator('#pcXlBox [data-pcdrv]').click();await wait(2500);let pd=await A.evaluate(()=>window.__hfT.pd());
   ok(tag+'화면 안 창(.veil/.sheet)으로 열림 · 폴더 링크가 없어 드라이브에서 현장 이름으로 폴더를 찾아 자동 선택',(await A.locator('#pdVeil.veil .sheet').count())===1&&pd&&pd.folders.length===1&&pd.folders[0].id==='F_p2'&&pd.cur===0,JSON.stringify(pd&&pd.folders));
   const names=await A.evaluate(()=>[...document.querySelectorAll('#pdFiles li')].map(li=>li.innerText.replace(/\s+/g,' ').trim()));
   ok(tag+'폴더 안(하위 폴더 포함) 엑셀 목록: 견적서 2개가 위(‘견적서로 보임’)·마감재리스트는 아래 · 임시(~$)·PDF 는 없음',names.length===3&&/견적서로 보임/.test(names[0])&&/견적서로 보임/.test(names[1])&&/마감재리스트/.test(names[2])&&!/견적서로 보임/.test(names[2])&&/견적서 ·|견적서 /.test(names[0])&&!names.some(n=>/~\$|계약서\.pdf/.test(n)),names.join(' // '));
   ok(tag+'가져오기 창 가로 넘침 없음',await noOver(A));
   if(vn==='Pixel 7'&&process.env.SHOTDIR)await A.screenshot({path:process.env.SHOTDIR+'/1a_pick_phone.png'});
   await A.locator('#pdVeil [data-pdget="X_1"]').click();await wait(2500);let c=await pc(A,'p2');
   ok(tag+'고르면 내려받아 항목·계약 금액 자동 (처음이라 묻지 않음): 5줄 = 항목 4 + 할인·절사 1 · 합계 = 견적서 총 합계',(await A.locator('.okask').count())===0&&c&&c.lines.length===5&&c.lines.map(l=>l.proc).join(',')==='철거공사,목공사,타일공사,공사진행비,할인·절사 (견적서 총 합계에 맞춤)'&&sumSale(c)===6200000&&c.xl.total===6200000&&c.xl.adj===-100000,c&&c.lines.map(l=>l.proc+':'+l.sale).join(','));
   ok(tag+'어느 드라이브 파일에서 가져왔는지 기록: 파일 이름·id·폴더·시각·누가 (원가 문서 안)',c.xl.drv&&c.xl.drv.id==='X_1'&&/최종/.test(c.xl.drv.name)&&c.xl.drv.folderId==='F_p2'&&c.xl.drv.path==='견적서'&&c.xl.drv.byName==='최윤수'&&c.xl.by==='u_boss'&&!!c.xl.at&&c.drvLog.length===1&&c.drvLog[0].id==='X_1'&&c.drvf.id==='F_p2',JSON.stringify(c.xl.drv));
   const box=(await A.locator('#pcXlBox').innerText()).replace(/\s+/g,' ');
   ok(tag+'창이 닫히고 사후 원가 표에 줄줄이 · 상자에 ‘드라이브에서 가져옴’·폴더·가져온 사람·0원이라 뺀 항목',(await A.locator('#pdVeil').count())===0&&(await A.locator('#pcPostT [data-pcpi]').count())>=4&&(await A.locator('#pcPostT tbody tr').count())>=5&&/드라이브에서 가져옴/.test(box)&&/2026-11 견적서 없는 현장 24평/.test(box)&&/최윤수/.test(box)&&/넣지 않은 항목 2개: 부부욕실, 입주청소/.test(box)&&/원본은 읽기만/.test(box),box.slice(0,300));
   ok(tag+'표 머리: 항목 | 계약 견적 금액(자동) | 실행 원가(직원 입력) | 차액 | 마진율',/항목\s*계약 견적 금액 \(자동\)\s*실행 원가 \(직원 입력\)\s*차액\s*마진율/.test((await A.locator('#pcPostT thead').innerText()).replace(/\s+/g,' ')));
   // 실행 원가 입력 뒤 다시 가져오기 → 물어봄 → 그대로 두기 / 다시 맞추기
   await setPi(A,0,700000);await setPi(A,2,1500000);
   await A.locator('#pcXlBox [data-pcdrv]').click();await wait(2000);pd=await A.evaluate(()=>window.__hfT.pd());
   ok(tag+'다시 열면 지난번에 쓴 폴더가 먼저',pd&&pd.folders[0].id==='F_p2'&&/지난번/.test(pd.folders[0].src)&&pd.cur===0,JSON.stringify(pd&&pd.folders));
   await A.locator('#pdVeil [data-pdget="X_2"]').click();await wait(1500);const q=(await A.locator('.okask').count())?(await A.locator('.okask').last().innerText()).replace(/\s+/g,' '):'';
   ok(tag+'이미 들어 있으면 “새 견적서로 항목을 다시 맞출까요?” (화면 안 확인 창 · 바로 바꾸지 않음)',/새 견적서로 항목을 다시 맞출까요\?/.test(q)&&/변경 계약/.test(q)&&/지우지 않고/.test(q)&&(await pc(A,'p2')).xl.drv.id==='X_1',q.slice(0,160));
   await A.locator('.okask [data-ok="0"]').last().click();await wait(600);ok(tag+'‘그대로 두기’ → 그대로 (창은 열린 채)',(await pc(A,'p2')).xl.drv.id==='X_1'&&(await A.locator('#pdVeil').count())===1);
   await A.locator('#pdVeil [data-pdget="X_2"]').click();await wait(1500);await A.locator('.okask [data-ok="1"]').last().click();await wait(2500);c=await pc(A,'p2');
   const T=await rows(A);const tR=T.find(r=>/^타일공사/.test(r[0]))||[],dR=T.find(r=>/^철거공사/.test(r[0]))||[];
   ok(tag+'‘다시 맞추기’ → 새 견적서 항목으로 · 입력한 실행 원가는 항목 이름으로 맞춰 유지(철거 700,000 · 타일 1,500,000) · 계약 금액은 새 값',c.xl.drv.id==='X_2'&&/\[700,000\]/.test(dR[2]||'')&&/1,200,000/.test(dR[1]||'')&&/\[1,500,000\]/.test(tR[2]||'')&&c.lines.some(l=>l.proc==='도배공사'&&l.sale===800000)&&c.xl.total===4200000,T.map(r=>r.slice(0,3).join(' | ')).join(' // '));
   ok(tag+'옛 견적서 항목(목공사)은 버리지 않고 남김 · 맞추기 전 모습·옛 출처는 기록(xlHist)에 · 가져온 기록 2건',c.lines.some(l=>l.proc==='목공사'&&l.old)&&c.xlHist&&c.xlHist.length>=1&&c.xlHist[c.xlHist.length-1].prev&&c.xlHist[c.xlHist.length-1].prev.drv.id==='X_1'&&c.drvLog.length===2,JSON.stringify((c.xlHist||[]).map(h=>h.prev&&h.prev.file)));
   // 폴더 링크가 있는 프로젝트 · 일반 양식(시트 여럿) → 시트 고르기 · 이름 다른 시트
   await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);await openPc(A,'p5','post');await A.locator('#pcXlBox [data-pcdrv]').click();await wait(2000);pd=await A.evaluate(()=>window.__hfT.pd());
   ok(tag+'프로젝트 카드에 현장 폴더 링크가 있으면 그 폴더를 바로 엶',pd&&pd.folders[0].id==='F_linkedfolder01234567'&&/프로젝트/.test(pd.folders[0].src)&&(pd.files||[]).length===2,JSON.stringify(pd&&pd.folders));
   await A.locator('#pdVeil [data-pdget="X_g"]').click();await wait(1500);const pk=(await A.locator('.okask [data-pick]').count());const pkT=pk?(await A.locator('.okask').last().innerText()).replace(/\s+/g,' '):'';
   ok(tag+'갑지가 없고 견적 표가 시트 여럿에 있으면 어느 시트인지 물어봄 (추측하지 않음 · ‘모든 시트 합쳐서’도 있음)',pk===3&&/판넬 · 항목 1개/.test(pkT)&&/자재성 · 항목 2개/.test(pkT)&&/모든 시트를 합쳐서/.test(pkT),pkT.slice(0,200));
   await A.locator('.okask [data-pick="1"]').click();await wait(2500);c=await pc(A,'p5');
   ok(tag+'고른 시트(자재성)로 들어옴: 철거·목공 2줄 · 총 합계 9,000,000 · 읽은 방식·부가세 포함금액 안내',c&&c.xl&&c.xl.sheet==='자재성'&&c.lines.map(l=>l.proc+':'+l.sale).join(',')==='철거공사:700000,목공 공사:8300000'&&c.xl.total===9000000&&/읽은 방식: 일반 견적서 표/.test(await A.locator('#pcXlBox').innerText())&&/부가세 포함금액 1,100,000원/.test(await A.locator('#pcXlBox').innerText()),c&&c.lines.map(l=>l.proc+':'+l.sale).join(','));
   await A.locator('#pcXlBox [data-pcdrv]').click();await wait(2000);await A.locator('#pdVeil [data-pdget="X_r"]').click();await wait(1200);await A.locator('.okask [data-ok="1"]').last().click();await wait(2500);c=await pc(A,'p5');
   ok(tag+'시트 이름이 ‘갑지’가 아니어도(총괄표) 같은 양식이면 읽음',c.xl.sheet==='총괄표'&&/갑지 양식/.test(c.xl.how)&&c.xl.total===4200000&&sumSale(c)===4200000,c.xl.sheet+' '+c.xl.how);
   // 어디에도 없는 프로젝트 → 안내 → 이름으로 찾기 / 주소 붙여 넣기
   await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);await openPc(A,'p6','post');await A.locator('#pcXlBox [data-pcdrv]').click();await wait(2500);
   let vt=(await A.locator('#pdVeil').innerText()).replace(/\s+/g,' ');ok(tag+'현장 폴더를 못 찾으면 안내: 이름으로 찾거나 폴더 주소를 붙여 넣기',/현장 폴더를 아직 못 찾았어요/.test(vt)&&(await A.locator('#pdQ').count())===1&&(await A.locator('#pdUrl').count())===1,vt.slice(0,200));
   await A.locator('#pdUrl').fill('그냥 글자');await A.locator('#pdVeil [data-pdurl]').click();await wait(500);ok(tag+'폴더 주소가 아니면 알려 줌',/드라이브 폴더 주소가 아니에요/.test(await A.locator('#pdVeil').innerText()));
   await A.locator('#pdUrl').fill('https://drive.google.com/drive/folders/F_pasted0123456789abc');await A.locator('#pdVeil [data-pdurl]').click();await wait(2000);pd=await A.evaluate(()=>window.__hfT.pd());
   ok(tag+'폴더 주소를 붙여 넣으면 그 폴더의 엑셀 목록',pd&&pd.folders.some(f=>f.id==='F_pasted0123456789abc'&&f.name==='붙여 넣을 폴더')&&(pd.files||[]).length===1&&pd.files[0].id==='X_p',JSON.stringify(pd));
   await A.locator('#pdQ').fill('링크 걸린');await A.locator('#pdVeil [data-pdfind]').click();await wait(1500);pd=await A.evaluate(()=>window.__hfT.pd());
   ok(tag+'이름으로 폴더 찾기 → 찾은 폴더가 목록에 더해짐',pd&&pd.folders.some(f=>f.id==='F_linkedfolder01234567'),JSON.stringify(pd&&pd.folders));
   await A.locator('#pdVeil [data-pdclose]').click();await wait(300);ok(tag+'닫기 → 아무것도 안 바뀜',(await A.locator('#pdVeil').count())===0&&!((await pc(A,'p6'))||{}).xl);
   // 현장 자료(드라이브) 목록에서 찾기: 현장 폴더만 (대표 전용 묶음 ‘계약 및 실행내역’은 후보에 안 나옴)
   await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);await openPc(A,'p7','post');await A.locator('#pcXlBox [data-pcdrv]').click();await wait(2500);pd=await A.evaluate(()=>window.__hfT.pd());
   ok(tag+'현장 자료(드라이브) 목록에 같은 이름의 현장 폴더가 있으면 거기서 엑셀을 보여 줌 (PDF·대표 전용 묶음 제외)',pd&&pd.folders.length===1&&/목록 현장 101동/.test(pd.folders[0].name)&&/현장 자료 목록/.test(pd.folders[0].src)&&(pd.files||[]).length===1&&pd.files[0].id==='X_1'&&pd.files[0].path==='견적서',JSON.stringify(pd));
   await A.locator('#pdVeil [data-pdclose]').click();await wait(300);
   const log=await A.evaluate(()=>window.__mcpLog);const wr=log.filter(t=>!/^(search_files|get_file_metadata|download_file_content)\|/.test(t)),rd=log.filter(t=>/^download_file_content\|/.test(t));
   ok(tag+'견적서 가져오기는 드라이브 읽기 도구만 부름 — 현장 폴더·견적서 파일을 건드린 쓰기 0 (다른 기능의 버전 보관·백업 만들기는 시험 폴더 밖)',rd.length>=4&&wr.every(t=>/^create_file\|/.test(t)&&!/\|(F_|X_|P_|ROOT)/.test(t)),[...new Set(wr)].join(',')+' / 읽기 '+log.length+'회');
   // 담당 직원(정진혁)·채진아는 버튼이 보이고 가져올 수 있음 · 이봄이(담당 아님)는 원가 표·버튼 없음
   await wait(1500);const J=await open('jjh');ok(tag+'정진혁(담당): 버튼 보임',await openPc(J,'p7','post')&&(await J.locator('#pcXlBox [data-pcdrv]').count())===1);
   await J.locator('#pcXlBox [data-pcdrv]').click();await wait(2500);const pj=await J.evaluate(()=>window.__hfT.pd());
   ok(tag+'정진혁: 본인 현장 자료 사본(현장 폴더만)에서 같은 현장 폴더를 찾음',pj&&pj.folders.length===1&&/현장 자료 목록/.test(pj.folders[0].src)&&(pj.files||[]).length===1,JSON.stringify(pj));
   if(!(await J.locator('#pdVeil [data-pdget="X_1"]').count())){await J.locator('#pdUrl').fill('https://drive.google.com/drive/folders/F_pasted0123456789abc');await J.locator('#pdVeil [data-pdurl]').click();await wait(2000)}
   await J.locator('#pdVeil [data-pdget]').first().click();await wait(2500);const cj=await pc(J,'p7');
   ok(tag+'정진혁: 가져오기 → 본인 원가 사본에 저장 · 가져온 사람 정진혁 · 거절된 쓰기 0',cj&&cj.xl&&cj.xl.drv&&cj.xl.drv.byName==='정진혁'&&cj.lines.length>=4&&(await J.evaluate(()=>window.__mockDenied.length))===0,JSON.stringify(cj&&cj.xl&&cj.xl.drv));
   const B=await open('bom');await B.evaluate(()=>{location.hash='#projects'});await wait(500);await B.evaluate(()=>window.__hfT.open('projects','p2'));await wait(1000);
   ok(tag+'이봄이(이 프로젝트 담당 아님): 원가 관리·드라이브 버튼·금액 없음',(await sh(B))==='projects|p2'&&(await B.locator('[data-pctop],[data-pcdrv],.pcbox,#pcXlBox').count())===0&&!/드라이브 현장 폴더에서|1,200,000|700,000/.test(await B.locator('#veil').innerText()));
   ok(tag+'이봄이(자기 담당 p6): 버튼 보임 (원가 표를 볼 수 있는 사람에게만)',await openPc(B,'p6','post')&&(await B.locator('#pcXlBox [data-pcdrv]').count())===1);
   const C=await open('cja');ok(tag+'채진아(전체 담당): 버튼 보임',await openPc(C,'p2','post')&&(await C.locator('#pcXlBox [data-pcdrv]').count())===1);
   await wait(2500);const leak=await seed.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb')||'{}'),bad=[];Object.keys(D).forEach(k=>{if(/^(ppriv\/|acct\/u_jjh\/pcost\/|acct\/u_cja\/pcost\/|acct\/u_bom\/pcost\/p6|knock\/|activity\/)/.test(k))return;const s=JSON.stringify(D[k]);if(/"(pc|post|xl|xlHist|drvLog|drvf)":|"sale":/.test(s))bad.push(k)});return bad});
   ok(tag+'가져온 항목·금액·출처 기록은 대표 칸(ppriv)과 담당·채진아 원가 사본에만 · 프로젝트 문서·공용 칸(work)·남의 사본에 없음',leak.length===0,leak.join(','));
   const dj=await seed.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb')||'{}');return Object.keys(D).filter(k=>/^acct\/u_bom\/pcost\/(p2|p5|p7)/.test(k)).length});ok(tag+'이봄이 사본에 남의 프로젝트 원가 없음',dj===0,dj);
   await J.close();await B.close();await C.close();await A.close();await ctx.close()}
  // 실제 견적서 (선택)
  if(process.env.EST_XLSX&&process.env.XLSX_JS){const buf=fs.readFileSync(process.env.EST_XLSX),lib=fs.readFileSync(process.env.XLSX_JS,'utf8'),nm=process.env.EST_NAME||'실제 계약 견적서.xlsx';
   const TR=[{id:"F_real",title:"2026-11 구리 인창 아름마을LG 202동 708호 24평",mimeType:FT,parentId:"ROOT",sd:"SD1"},{id:"F_reale",title:"견적서",mimeType:FT,parentId:"F_real"},{id:"X_real",title:nm,mimeType:XT,parentId:"F_reale",b64:buf.toString('base64')}];
   const S2=Object.assign({},STAFF,{"projects/pa":{no:"P-2611-004",title:"아름마을 LG 202동 708호",custName:"시험 고객",custCode:"",stage:"계약",mgr:"정진혁",contractAmt:"",cat:"주거",inq:"2026-11-06",files:[],updatedAt:T0}});
   for(const [vn,opt] of [['PC',{viewport:{width:1280,height:1500}}],['Pixel 7',devices['Pixel 7']]]){
    const {ctx,open}=await mk(opt,S2,'window.confirm=()=>false;'+mcpInit(TR),lib);const A=await open('admin',12000);
    await openPc(A,'pa','post');await A.locator('#pcXlBox [data-pcdrv]').click();await wait(3000);const pd=await A.evaluate(()=>window.__hfT.pd());
    ok('1a 실제 '+vn+': 프로젝트 이름(아름마을 LG 202동 708호)으로 드라이브 현장 폴더(…아름마을LG 202동 708호 24평)를 찾고 견적서 엑셀 1개가 보임',pd&&pd.folders.length===1&&pd.folders[0].id==='F_real'&&(pd.files||[]).length===1,JSON.stringify(pd&&pd.folders));
    await A.locator('#pdVeil [data-pdget="X_real"]').click();await wait(9000);const c=await pc(A,'pa')||{},L=c.lines||[],sum=sumSale(c);
    ok('1a 실제 '+vn+': 실제 견적서('+Math.round(buf.length/1024)+'KB)를 드라이브 길로 가져옴 → 항목 합계 = 견적서 총 합계 (원본과 일치)',!!c.xl&&c.xl.total>0&&sum===c.xl.total&&L.length===c.xl.n+(c.xl.adj?1:0),L.length+'줄');
    console.log('[실제 견적서 '+vn+'] 줄 수 '+L.length+' (항목 '+(c.xl&&c.xl.n)+(c.xl&&c.xl.adj?' + 할인·절사 1':'')+') · 합계 일치 '+(c.xl&&sum===c.xl.total)+' · 0원이라 뺀 항목 '+((c.xl&&c.xl.zero)||[]).join(',')+' · 읽은 방식 '+(c.xl&&c.xl.how));
    if(process.env.V){L.forEach(l=>console.log('   | '+l.proc+' | '+(Number(l.sale)||0).toLocaleString('ko-KR')+' |'));console.log('   합계 '+sum.toLocaleString('ko-KR')+' / 견적서 총 합계 '+((c.xl&&c.xl.total)||0).toLocaleString('ko-KR'))}
    if(process.env.SHOTDIR){await A.locator('#veil .pcbox').scrollIntoViewIfNeeded();await A.locator('#veil .pcbox').screenshot({path:process.env.SHOTDIR+'/1a_real_'+(vn==='PC'?'pc':'phone')+'.png'}).catch(e=>console.log('그림 저장 실패',e.message))}
    ok('1a 실제 '+vn+': 가로 넘침 없음',await noOver(A));await A.close();await ctx.close()}}
  const i0=HTML.indexOf('// ===== 드라이브 현장 폴더에서 견적서 가져오기'),blk=HTML.slice(i0,HTML.indexOf('document.addEventListener("toggle",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.pcven'));
  ok('1a 코드: alert/confirm/prompt/window.open/iframe 0 · 드라이브 쓰기 도구(create_file·update_file·trash·copy·share) 0 · 프로젝트 문서·공용 칸에 쓰지 않음',i0>0&&blk.length>3000&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe/.test(blk)&&!/create_file|update_file|trash_file|copy_file|share_file/.test(blk)&&!/workPut|[^a-zA-Z]put\(|collection\("work/.test(blk),blk.length+'자');
 }
 //__MORE__
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
