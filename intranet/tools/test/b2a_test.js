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
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));if(process.env.DEBUG)p.on('console',m=>{if(/error|warn/.test(m.type()))console.log('  ['+who+' '+m.type()+'] '+m.text().slice(0,300))});p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+init+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);for(let i=0;i<40&&!(await p.evaluate(()=>!!window.__hfT));i++)await wait(500);if(!(await p.evaluate(()=>!!window.__hfT)))console.log('  (화면이 안 뜸: '+who+') '+(await p.locator('body').innerText()).replace(/\s+/g,' ').slice(0,200));return p};
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
 // ================= 6 =================
 if(on('6')){
  const days=[];for(let y=2025,m=8;!(y===2026&&m===12);m===12?(y++,m=1):m++){const k=y+'-'+String(m).padStart(2,'0');days.push([k+'-05',1000000,400000,5000000]);if(k!=='2026-11')days.push([k+'-20',0,300000,4700000])}
  // 2026-10 만 다르게: 수입 500,000 · 지출 900,000 → 마이너스
  days.forEach(r=>{if(r[0]==='2026-10-05'){r[1]=500000;r[2]=600000}});
  const E=(id,o)=>({["fincf/"+id]:Object.assign({d:"2026-10-05",io:"출금",amt:0,cat:"",who:"",memo:"",pno:"",plan:false,at:T0,by:"excel",src:"엑셀"},o)});
  const SEED=Object.assign({},STAFF,{"fin/cfhist":{days,copiedAt:T0},"fin/cfnew":{days:[["2026-11-12",200000,50000,5150000]],at:T0},"fin/cfset":{floor:""},"customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0}},
   E("e1",{amt:200000,cat:"고정비",who:"농협카드"}),E("e2",{amt:100000,who:"[한국전력]",memo:"사무실 전기요금"}),E("e3",{amt:999000,cat:"고정비",who:"예정처",plan:true,d:"2026-10-20"}),E("e4",{amt:777000,cat:"고정비",io:"입금",who:"입금처"}),
   E("e5",{amt:300000,who:"홍길동",memo:"10월 급여"}),E("e6",{amt:50000,who:"[국민651->신한485]"}),E("e7",{amt:40000,who:"한국전력",d:"2026-09-05"}),E("e8",{amt:60000,cat:"자재",who:"두성",d:"2026-09-05"}));
  for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){const tag='6 '+vn+' ';
   const {ctx,open,seed}=await mk(opt,SEED,STUB);const A=await open('admin',12000);
   await A.evaluate(()=>{location.hash='#cflow'});await wait(1500);
   ok(tag+'대표: 캐시플로우에 ‘일별 보기 / 월별 보기’ · 처음은 일별(지금 화면 그대로)',(await A.locator('#cfViewBar [data-cfview]').count())===2&&(await A.locator('#cfViewBar [data-cfview="day"]').getAttribute('aria-pressed'))==='true'&&(await A.locator('#cfMonth').count())===0&&(await A.locator('#cfv_d').count())===1);
   await A.locator('#cfViewBar [data-cfview="month"]').click();await wait(800);
   const tb=()=>A.evaluate(()=>[...document.querySelectorAll('#cfMonthT tbody tr.cfm-row')].map(tr=>{const c=[...tr.children].map(td=>(td.textContent||'').replace(/\s+/g,' ').trim());c[0]=tr.querySelector('.cfm-ml').textContent;c[5]=tr.querySelector('.cfm-c6').textContent;return c}));
   let M=await tb();const head=(await A.locator('#cfMonthT thead').textContent()).replace(/\s+/g,' ').replace(/(월|수입|지출|고정비|마진)(?=\S)/g,'$1 ');
   ok(tag+'월별 표: 월 | 수입 | 지출 | 고정비 | 마진 | 플러스/마이너스 · 최근 12개월(2026-11 → 2025-12)',/월 수입 지출 고정비 마진 플러스 \/ 마이너스/.test(head)&&M.length===12&&/2026년 11월/.test(M[0][0])&&/2025년 12월/.test(M[11][0]),head+' / '+M.length+' '+(M[0]||[])[0]+' ~ '+(M[11]||[])[0]);
   const oct=M.find(r=>/2026년 10월/.test(r[0]))||[],nov=M[0]||[],sep=M.find(r=>/2026년 9월/.test(r[0]))||[],aug=M.find(r=>/2026년 8월/.test(r[0]))||[];
   ok(tag+'10월: 자금일보 그대로 더함 — 수입 500,000 · 지출 900,000 · 마진 −400,000 · ‘마이너스’',oct[1]==='500,000'&&oct[2]==='900,000'&&oct[4]==='−400,000'&&/마이너스/.test(oct[5]),oct.join(' | '));
   ok(tag+'11월: 사본(05일) + 자동 반영분(12일)을 같이 더함 — 수입 1,200,000 · 지출 450,000 · 마진 +750,000 · ‘플러스’',nov[1]==='1,200,000'&&nov[2]==='450,000'&&nov[4]==='+750,000'&&/플러스/.test(nov[5]),nov.join(' | '));
   ok(tag+'고정비(처음 기준 = 항목 ‘고정비’만): 10월 200,000 (지급 예정 줄·입금 줄·구분 없는 줄은 안 더함) · 9월 0 · 출금 줄이 없는 8월은 ‘—’',oct[3]==='200,000'&&sep[3]==='0'&&aug[3]==='—',oct[3]+' / '+sep[3]+' / '+aug[3]);
   const col=await A.evaluate(()=>{const r=document.querySelector('#cfMonthT tr.cfm-row[data-cfm="2026-10"]');const b=r.children[4].querySelector('b'),i=r.querySelector('.cfm-c6 .cfm-bar i');const r2=document.querySelector('#cfMonthT tbody tr.cfm-row');return [getComputedStyle(b).color,getComputedStyle(i).backgroundColor,getComputedStyle(r2.querySelector('.cfm-c6 .cfm-bar i')).backgroundColor,i.style.width]});
   ok(tag+'마이너스 달은 빨간색(글자·막대), 플러스 달 막대는 남색',col[0]==='rgb(198, 40, 40)'&&col[1]==='rgb(198, 40, 40)'&&col[2]==='rgb(31, 78, 121)',col.join(' '));
   const ft=(await A.locator('#cfMonthT tfoot').textContent()).replace(/\s+/g,' ');if(vn==='Pixel 7'){const vis=await A.evaluate(()=>{const r=document.querySelector('#cfMonthT tbody tr.cfm-row'),bx=document.querySelector('#cfMonth .tablebox').getBoundingClientRect(),m=r.children[4].getBoundingClientRect(),p=r.querySelector('.cfm-mb .pill').getBoundingClientRect();return [m.right<=bx.right+1&&m.right<=window.innerWidth,p.width>0&&p.right<=window.innerWidth,getComputedStyle(r.querySelector('.cfm-c6')).display]});
    ok(tag+'휴대폰: 옆으로 밀지 않아도 마진 칸까지 보이고, 플러스/마이너스 표시·막대는 달 칸 안에',vis[0]&&vis[1]&&vis[2]==='none',vis.join(' '))}
   ok(tag+'합계 줄 (12개월)',/합계\s*\(12개월\)/.test(ft)&&/11,700,000/.test(ft),ft);
   ok(tag+'월별 화면 가로 넘침 없음 (표는 표 상자 안에서만 밀림)',await A.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
   if(process.env.SHOTDIR)await A.screenshot({path:process.env.SHOTDIR+'/6_month_'+(vn==='PC'?'pc':'phone')+'.png',fullPage:true});
   // 기간 고르기
   await A.locator('#cfYearSel').selectOption('2025');await wait(600);M=await tb();ok(tag+'연도 선택 2025 → 2025년 달만 (8~12월 5개)',M.length===5&&M.every(r=>/2025년/.test(r[0])),M.map(r=>r[0]).join(','));
   await A.locator('#cfYearSel').selectOption('2026');await wait(600);M=await tb();ok(tag+'연도 선택 2026 → 1~11월 11개',M.length===11&&/2026년 11월/.test(M[0][0])&&/2026년 1월/.test(M[10][0]),M.length);
   // 달을 누르면 그 달 일별 → 날짜를 누르면 일별 보기의 그날
   await A.locator('#cfMonthT tr.cfm-row[data-cfm="2026-10"]').click();await wait(600);const dd=await A.evaluate(()=>[...document.querySelectorAll('#cfMonthT tr.cfm-days tbody tr')].map(tr=>(tr.innerText||'').replace(/\s+/g,' ').trim()));
   ok(tag+'달을 누르면 그 달 일별(날짜·입금·출금·잔액)이 펼쳐짐',dd.length===2&&/10-20 0 300,000 4,700,000/.test(dd[0])&&/10-05 500,000 600,000 5,000,000/.test(dd[1]),dd.join(' // '));
   await A.locator('#cfMonthT [data-cfgo="2026-10-05"]').click();await wait(800);
   ok(tag+'날짜를 누르면 일별 보기의 그날 내역으로',(await A.locator('#cfMonth').count())===0&&(await A.locator('#cfv_d').inputValue())==='2026-10-05'&&/한국전력/.test(await A.locator('#view').innerText()));
   // 고정비 구분 기준: 대표가 거래처를 골라 저장 → 고정비에 더해짐 · 옛 기준 기록
   await A.locator('#cfViewBar [data-cfview="month"]').click();await wait(600);await A.locator('#cfFixBox summary').click();await wait(300);
   const fw=await A.evaluate(()=>[...document.querySelectorAll('#cfFixBox [data-cffw]')].map(x=>x.dataset.cffw));const fc=await A.evaluate(()=>[...document.querySelectorAll('#cfFixBox [data-cffc]')].map(x=>x.dataset.cffc+(x.checked?'*':'')));
   ok(tag+'고정비 구분 기준(대표): 항목 체크(고정비만 켜짐) + 거래처 체크 목록 — 계좌 이체 줄·급여 줄은 목록에 없음 · [한국전력]과 한국전력은 한 곳으로',fc.includes('고정비*')&&fc.filter(c=>/\*/.test(c)).length===1&&fw.includes('한국전력')&&fw.filter(w=>/한국전력/.test(w)).length===1&&!fw.some(w=>/->|홍길동|예정처|입금처/.test(w)),fc.join(',')+' / '+fw.join(','));
   await A.locator('#cfFixBox [data-cffw="한국전력"]').check();await A.locator('#cfFixBox [data-cffixsave]').click();await wait(1500);M=await tb();
   const st=await seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb'))['fin/cfset']);
   ok(tag+'한국전력을 고정비로 고르고 저장 → 2026년 10월 300,000 · 9월 40,000 · 옛 기준은 기록(fixedHist)에 · 다른 설정(최저선)은 그대로',(M.find(r=>/2026년 10월/.test(r[0]))||[])[3]==='300,000'&&(M.find(r=>/2026년 9월/.test(r[0]))||[])[3]==='40,000'&&st.fixedWho.join()==='한국전력'&&st.fixedCats.join()==='고정비'&&st.fixedHist.length===1&&st.fixedHist[0].cats.join()==='고정비'&&st.floor==="",JSON.stringify(st).slice(0,240));
   // 채진아: 같은 숫자 · 기준은 보기만 / 정진혁·이봄이: 캐시플로우 자체가 없음
   let cp=0;for(let i=0;i<60;i++){cp=await seed.evaluate(()=>{const x=JSON.parse(localStorage.getItem('mockdb'))['acct/u_cja/fin/all'];return x&&x.cfset&&(x.cfset.fixedWho||[]).length?1:0});if(cp)break;await wait(1000);if(i===59)console.log('  (채진아 재무 사본이 60초 안에 안 생김) busy='+(await A.evaluate(()=>window.__hfT.busy())))}
   const C=await open('cja',9000);await C.evaluate(()=>{location.hash='#cflow'});await wait(1500);await C.locator('#cfViewBar [data-cfview="month"]').click();await wait(800);
   const MC=await C.evaluate(()=>[...document.querySelectorAll('#cfMonthT tbody tr.cfm-row')].map(tr=>{const c=[...tr.children].map(td=>(td.textContent||'').replace(/\s+/g,' ').trim());c[0]=tr.querySelector('.cfm-ml').textContent;return c}));const oc=MC.find(r=>/2026년 10월/.test(r[0]))||[];
   ok(tag+'채진아(전체 담당): 월별 보기가 보이고 대표와 같은 숫자(직원 사본) · 사본 시각 표시',MC.length===12&&oc[1]==='500,000'&&oc[2]==='900,000'&&oc[3]==='300,000'&&oc[4]==='−400,000'&&/사본/.test(await C.locator('#cfMonth h2').innerText()),oc.join(' | ')+' :: '+(await C.locator('#view').innerText()).replace(/\s+/g,' ').slice(0,200)+' :: '+JSON.stringify(await seed.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb'));const x=D['acct/u_cja/fin/all'];return x?Object.keys(x)+' '+(x.hist||[]).length:Object.keys(D).filter(k=>/u_cja/.test(k))})));
   ok(tag+'채진아: 고정비 구분 기준은 보기만 (체크·저장 버튼 없음)',(await C.locator('#cfFixBox input,#cfFixBox [data-cffixsave]').count())===0&&/대표 화면에서 바꿀 수 있어요/.test(await C.locator('#cfFixBox').textContent())&&/거래처: 한국전력/.test(await C.locator('#cfFixBox').textContent())&&(await C.evaluate(()=>window.__mockDenied.length))===0);
   for(const who of ['jjh','bom']){const P=await open(who,8000);await P.evaluate(()=>{location.hash='#cflow'});await wait(1200);const tx=await P.locator('body').innerText();
    ok(tag+(who==='jjh'?'정진혁':'이봄이')+'(실무 팀): 캐시플로우·월별 보기·금액 없음 (주소를 직접 쳐도)',(await P.locator('#cfMonth,#cfViewBar,#cfMonthT,[data-cfview]').count())===0&&!/월별 보기|캐시플로우|900,000|4,700,000/.test(tx),tx.replace(/\s+/g,' ').slice(0,80));await P.close()}
   const lk=await seed.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb')||'{}');return Object.keys(D).filter(k=>/^(acct\/u_jjh|acct\/u_bom|work|mine)\//.test(k)&&/fixedWho|cfhist|"hist"|4700000/.test(JSON.stringify(D[k])))});
   ok(tag+'정진혁·이봄이 사본·공용 칸에 자금일보·고정비 기준 없음',lk.length===0,lk.join(','));
   await C.close();await A.close();await ctx.close()}
  const i6=HTML.indexOf('// ===== 캐시플로우 월별 보기'),b6=HTML.slice(i6,HTML.indexOf('document.addEventListener("click",e=>{const t=e.target.closest("[data-cfio],[data-cfday]'));
  ok('6 코드: alert/confirm/prompt/window.open/iframe 0 · 새 저장 칸 없음(설정은 기존 fin/cfset 에만)',i6>0&&b6.length>2000&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe/.test(b6)&&!/collection\(|\.doc\(/.test(b6)&&/finPut\("cfset"/.test(b6),b6.length+'자');
 }
 // ================= 19 =================
 if(on('19')){
  const D=n=>new Date(Date.now()+9*36e5+n*864e5).toISOString().slice(0,10);
  const site=(id,pno,name,o)=>({["sites/"+id]:Object.assign({pno,name,customer:"홍길동",addr:"",mgr:"정진혁",status:"착공 전",start:"",end:"",proc:"",progress:"",logs:[],files:[],updatedAt:T0},o)});
  const proj=(id,no,title,o)=>({["projects/"+id]:Object.assign({no,title,custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",contractAmt:1000,cat:"주거",inq:"2026-10-01",files:[],updatedAt:T0},o)});
  const SEED=Object.assign({},STAFF,{"customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0}},
   proj("pA","P-2611-801","교문초 시험",{start:D(-11),endPlan:D(7)}),site("sA","P-2611-801","교문초 시험",{start:D(-11),end:D(7)}),          // 착공일 지남 → 공사 중
   proj("pB","P-2611-802","착공 예정 현장",{start:D(7),endPlan:D(30)}),site("sB","P-2611-802","착공 예정 현장",{start:D(7),end:D(30)}),      // 아직 → 착공 전
   proj("pC","P-2611-803","보류 현장",{start:D(-5),endPlan:D(20)}),site("sC","P-2611-803","보류 현장",{status:"보류",start:D(-5),end:D(20)}), // 사람이 보류 → 그대로
   proj("pD","P-2611-804","프로젝트에만 착공일",{start:D(-3),endPlan:D(10)}),site("sD","P-2611-804","프로젝트에만 착공일",{}),               // 현장 카드엔 날짜 없음 → 프로젝트 날짜로
   proj("pE","P-2611-805","준공 예정일 지난 현장",{start:D(-30),endPlan:D(-2)}),site("sE","P-2611-805","준공 예정일 지난 현장",{start:D(-30),end:D(-2)}), // 준공일 지남 → 건드리지 않음
   proj("pF","P-2611-806","오늘 착공",{start:D(0),endPlan:D(9)}),site("sF","P-2611-806","오늘 착공",{start:D(0),end:""}),                      // 오늘 착공 · 준공일 빈칸 → 공사 중
   proj("pG","P-2611-807","이미 준공",{stage:"준공",start:D(-40),end:D(-10)}),site("sG","P-2611-807","이미 준공",{status:"준공",start:D(-40),end:D(-10)}));
  for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){const tag='19 '+vn+' ';
   const {ctx,open,seed}=await mk(opt,SEED,STUB);const A=await open('admin',12000);
   const st=p=>p.evaluate(()=>Object.fromEntries(window.__hfT.S().sites.map(s=>[s.id,s.status])));
   let m=await st(A);
   ok(tag+'대표: 착공일 ≤ 오늘 < 준공(예정)일인 ‘착공 전’ 현장은 ‘공사 중’ (교문초 같은 경우 · 오늘 착공 · 프로젝트에만 착공일이 있는 현장 포함)',m.sA==='공사 중'&&m.sF==='공사 중'&&m.sD==='공사 중',JSON.stringify(m));
   ok(tag+'착공일이 아직 안 된 현장은 ‘착공 전’ 그대로 · 사람이 정한 ‘보류’·‘준공’은 덮지 않음 · 준공 예정일이 지난 ‘착공 전’은 건드리지 않음',m.sB==='착공 전'&&m.sC==='보류'&&m.sG==='준공'&&m.sE==='착공 전',JSON.stringify(m));
   await A.evaluate(()=>{location.hash='#sites'});await wait(1200);const lt=(await A.locator('#view').innerText()).replace(/\s+/g,' ');
   const rowSt=await A.evaluate(()=>{const o={};document.querySelectorAll('#view [data-id]').forEach(el=>{const t=(el.innerText||'').replace(/\s+/g,' ');['교문초 시험','착공 예정 현장','보류 현장'].forEach(n=>{if(t.includes(n)&&!o[n])o[n]=(/공사 중/.test(t)?'공사 중':/착공 전/.test(t)?'착공 전':/보류/.test(t)?'보류':'?')})});return o});
   ok(tag+'현장 관리 목록: 교문초 시험 = 공사 중 · 착공 예정 현장 = 착공 전 · 보류 현장 = 보류',rowSt['교문초 시험']==='공사 중'&&rowSt['착공 예정 현장']==='착공 전'&&rowSt['보류 현장']==='보류',JSON.stringify(rowSt));
   await A.evaluate(()=>{location.hash='#home'});await wait(1000);
   const tile=await A.evaluate(()=>{const S=window.__hfT.S();return S.sites.filter(x=>x.status==="공사 중").length});
   const tileTxt=await A.evaluate(()=>{const a=[...document.querySelectorAll('#view a[href="#sites"],#view [data-go="sites"]')].map(x=>(x.innerText||'').replace(/\s+/g,' '));return a.join(' / ')});
   ok(tag+'홈 타일의 공사 중 현장 수 = 3 (화면에 쓰는 같은 목록)',tile===3&&(!tileTxt||/3/.test(tileTxt)),tile+' :: '+tileTxt.slice(0,120));
   // 프로젝트 단계 표시: 단계 값은 ‘계약’ 그대로, 흐름은 ‘현장 관리’
   await A.evaluate(()=>{location.hash='#projects'});await wait(600);await A.evaluate(()=>window.__hfT.open('projects','pA'));await wait(1200);
   const fl=await A.evaluate(()=>{const v=document.querySelector('#veil');const cur=v.querySelector('[aria-current="step"],.flow .on,.pflow .on,[data-flowcur]');return [(v.innerText||'').replace(/\s+/g,' ').slice(0,600),cur?cur.textContent:'']});
   ok(tag+'프로젝트 창: 현장이 공사 중이면 지금 단계가 ‘현장 관리’ · ‘현장 열기 · 공사 중’',/현장 열기 · 공사 중/.test(fl[0]),fl[1]+' :: '+fl[0].slice(0,260));
   const stg=await A.evaluate(()=>window.__hfT.S().projects.find(p=>p.id==='pA').stage);ok(tag+'프로젝트에 저장된 단계 값은 그대로 ‘계약’ (화면에서만 현장 관리로 읽음)',stg==='계약',stg);
   await A.evaluate(()=>window.__hfT.closeSheet());
   // 저장값: 대표 화면이 바꾸고 옛 값은 기록으로
   let dbs=null;for(let i=0;i<40;i++){dbs=await seed.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb'));return ['sA','sB','sC','sD','sE','sF','sG'].map(k=>D['sites/'+k])});if(dbs[0].status==='공사 중'&&dbs[3].status==='공사 중'&&dbs[5].status==='공사 중')break;await wait(1000)}
   const lg=dbs[0].statusLog||[];
   ok(tag+'대표 화면이 열려 있으면 저장값도 ‘공사 중’으로 · 옛 값(착공 전)·바꾼 때·이유를 그 현장 기록(statusLog)에 남김 · 다른 칸(착공일·담당·이름)은 그대로',dbs[0].status==='공사 중'&&lg.length===1&&lg[0].from==='착공 전'&&lg[0].to==='공사 중'&&lg[0].by==='자동'&&/착공일/.test(lg[0].why)&&!!lg[0].at&&dbs[0].start===D(-11)&&dbs[0].mgr==='정진혁'&&dbs[0].name==='교문초 시험',JSON.stringify(lg));
   ok(tag+'안 바뀌어야 할 현장의 저장값은 그대로 (착공 예정·보류·준공 예정일 지남·준공) · 기록도 안 생김',dbs[1].status==='착공 전'&&dbs[2].status==='보류'&&dbs[4].status==='착공 전'&&dbs[6].status==='준공'&&[1,2,4,6].every(i=>!dbs[i].statusLog),[1,2,4,6].map(i=>dbs[i].status).join(','));
   await wait(3000);const d2=await seed.evaluate(()=>(JSON.parse(localStorage.getItem('mockdb'))['sites/sA'].statusLog||[]).length);ok(tag+'한 번만 바꿈 (다시 맞춰도 기록이 늘지 않음)',d2===1,d2);
   // 사람이 다시 ‘보류’로 두면 그대로
   await A.evaluate(async()=>{const s=Object.assign({},window.__hfT.S().sites.find(x=>x.id==='sF'));delete s.id;s.status='보류';await window.__hfT.put('sites','sF',s)});await wait(5000);
   const sf=await seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb'))['sites/sF'].status);ok(tag+'자동으로 바뀐 뒤 사람이 ‘보류’로 바꾸면 다시 덮지 않음',sf==='보류'&&(await st(A)).sF==='보류',sf);
   // 직원 화면: 정진혁·이봄이·채진아도 같은 상태로 보임
   for(const [who,nm] of [['jjh','정진혁'],['bom','이봄이'],['cja','채진아']]){const P=await open(who,9000);const ms=await st(P);await P.evaluate(()=>{location.hash='#sites'});await wait(1000);const t=(await P.locator('#view').innerText()).replace(/\s+/g,' ');
    ok(tag+nm+': 현장 관리에서 교문초 시험 = 공사 중 · 착공 예정 = 착공 전 · 거절된 쓰기 0',(ms.sA==='공사 중'||ms.sA===undefined)&&(ms.sB==='착공 전'||ms.sB===undefined)&&(ms.sA!==undefined||who==='bom')&&(await P.evaluate(()=>window.__mockDenied.length))===0,JSON.stringify(ms).slice(0,160));await P.close()}
   await A.close();await ctx.close()}
  // 직원만 열려 있을 때(대표 화면이 아직 안 바꿨을 때)도 읽을 때 ‘공사 중’
  {const {ctx,open,seed}=await mk({viewport:{width:1280,height:900}},Object.assign({},SEED,{"work/all/sites/sA":Object.assign({},SEED["sites/sA"],{__at:T0}),"work/all/projects/pA":Object.assign({},SEED["projects/pA"],{__at:T0})}),STUB);const J=await open('jjh',9000);
   const ms=await J.evaluate(()=>Object.fromEntries(window.__hfT.S().sites.map(s=>[s.id,s.status])));const raw=await seed.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb'));return [D['sites/sA'].status,Object.keys(D).filter(k=>/sites/.test(k)&&/sA/.test(k)).map(k=>k+'='+D[k].status).join(',')]});
   ok('19 정진혁만 열려 있을 때: 저장값은 아직 ‘착공 전’이어도 화면은 ‘공사 중’으로 읽음 (대표 원본은 안 건드림)',ms.sA==='공사 중'&&raw[0]==='착공 전',JSON.stringify(ms)+' :: '+raw[1]);await J.close();await ctx.close()}
  const i19=HTML.indexOf('// ===== 현장 상태 자동'),b19=HTML.slice(i19,HTML.indexOf('function render(){try{siteAutoFix()'));
  ok('19 코드: alert/confirm/prompt/window.open/iframe 0 · 지우기(.delete) 0',i19>0&&b19.length>800&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe|\.delete\(/.test(b19),b19.length+'자');
 }
 // ================= 21 =================
 if(on('21')){
  const D=n=>new Date(Date.now()+9*36e5+n*864e5).toISOString().slice(0,10);
  const proj=(id,no,title,o)=>({["projects/"+id]:Object.assign({no,title,custName:"홍길동",custCode:"C-2611-901",stage:"사후관리",mgr:"정진혁",contractAmt:33000000,cat:"주거",inq:"2026-01-01",start:"2026-02-01",warrantyMonths:12,files:[],updatedAt:T0},o)});
  const SEED=Object.assign({},STAFF,{"config/sms":{who:"team"},
   "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:Array.from({length:20},(x,i)=>i+1),stage:"4-완료사후",inq:"2026-01-01",createdAt:T0,updatedAt:T0,smsLog:[{id:"sm1",at:D(-3)+"T02:00:00Z",by:"u_boss",tpl:"점검 안내",msg:"안녕하세요 홈퍼니싱입니다. 1개월 점검 안내드립니다.",to:"01012345678",test:false,status:"발송됨"}]},
   "customers/c2":{code:"C-2611-902",name:"김상담",tel:"",addr:"",mgr:"이봄이",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0}},
   proj("pS","P-2609-901","사후 현장 가",{end:D(-40),warrantyEnd:""}),proj("pT","P-2609-902","준공 현장 나",{stage:"준공",mgr:"이봄이",end:D(-5)}),proj("pU","P-2401-903","옛 종료 현장",{stage:"종료",end:"2024-03-01",warrantyEnd:"2025-03-01"}),proj("pV","P-2611-904","계약 현장",{stage:"계약",end:""}),
   {"as/a1":{pno:"P-2609-901",site:"사후 현장 가",code:"C-2611-901",d:D(-6),mgr:"정진혁",status:"접수",plan:D(-1),content:"욕실 실리콘 들뜸",asCost:54321,asCharge:"",cost:"회사",files:[{id:"f1",name:"a.jpg"},{id:"f2",name:"b.jpg"}],createdAt:T0,updatedAt:T0},
    "as/a2":{pno:"P-2609-901",site:"사후 현장 가",code:"C-2611-901",d:D(-20),mgr:"정진혁",status:"완료",plan:D(-18),done:D(-17),content:"현관 도어락 교체",asCost:"",files:[],createdAt:T0,updatedAt:T0},
    "as/a3":{pno:"P-2401-903",site:"옛 종료 현장",code:"C-2611-901",d:"2024-06-01",mgr:"",status:"완료",done:"2024-06-05",content:"옛 하자",files:[],createdAt:T0,updatedAt:T0}});
  for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){const tag='21 '+vn+' ';
   const {ctx,open,seed}=await mk(opt,SEED,STUB);const A=await open('admin',12000);const dbg=k=>seed.evaluate(k=>JSON.parse(localStorage.getItem('mockdb'))[k],k);
   // 원인 고침: 고객 관리 화면의 ‘4단계 · 완료·사후’를 누르면 사후 관리 화면
   await A.evaluate(()=>{location.hash='#customers'});await wait(1200);
   ok(tag+'고객 관리: 단계 줄 4칸이 누를 수 있는 단추 (예전에는 글자만 있어 눌러도 안 바뀜)',(await A.locator('#custFlow [data-cstg]').count())===4&&/사후 관리/.test(await A.locator('#custFlow [data-cstg="4-완료사후"]').innerText()));
   await A.locator('#custFlow [data-cstg="1-상담영업"]').click();await wait(600);
   ok(tag+'1단계를 누르면 그 단계 고객만 (김상담만 보임)',/김상담/.test(await A.locator('#view').innerText())&&!/홍길동/.test((await A.locator('#view').innerText()).replace(/프로젝트.*?홍길동/g,''))&&(await A.locator('#custFlow [data-cstg="1-상담영업"]').getAttribute('class'))==='on');
   await A.locator('#custFlow [data-cstg="4-완료사후"]').click();await wait(1000);
   ok(tag+'‘4단계 · 완료·사후 → 사후 관리’를 누르면 사후 관리 화면이 열림',(await A.evaluate(()=>location.hash))==='#as'&&(await A.locator('#acBoard').count())===1&&/사후 관리/.test(await A.locator('#view h1').first().innerText()),await A.evaluate(()=>location.hash));
   const li=await A.evaluate(()=>[...document.querySelectorAll('#acList [data-acpick]')].map(x=>x.dataset.acpick+' '+(x.innerText||'').replace(/\s+/g,' ')));
   ok(tag+'프로젝트 목록: 준공·사후관리 프로젝트 + A/S가 있는 옛 프로젝트 (계약 단계는 없음) · 처리할 하자가 있는 프로젝트가 맨 위 · 하자기간 남은 날',li.length===3&&/^P-2609-901/.test(li[0])&&/처리할 하자 1건/.test(li[0])&&/하자기간 중 · \d+일 남음/.test(li[0])&&li.some(x=>/^P-2401-903/.test(x)&&/하자기간 끝/.test(x))&&!li.some(x=>/P-2611-904/.test(x)),li.join(' // '));
   await A.locator('#acList [data-acpick="P-2609-901"]').click();await wait(700);
   const wt=(await A.locator('#acWarr').innerText()).replace(/\s+/g,' ');const y=new Date(Date.parse(D(-40)+"T00:00:00Z"));const wEnd=new Date(Date.UTC(y.getUTCFullYear(),y.getUTCMonth()+12,y.getUTCDate())).toISOString().slice(0,10);
   ok(tag+'프로젝트를 고르면: 하자 보수 기간(준공일 ~ 만료일 12개월)과 남은 날',wt.includes('준공 '+D(-40)+' ~ '+wEnd)&&/12개월/.test(wt)&&/\d+일 남음/.test(wt),wt);
   const at=await A.evaluate(()=>[...document.querySelectorAll('#acAsT tbody tr')].map(tr=>[...tr.children].map(td=>(td.innerText||'').replace(/\s+/g,' ').trim())));const ah=(await A.locator('#acAsT thead').innerText()).replace(/\s+/g,' ');
   ok(tag+'하자 접수 목록: 접수일 | 하자 내용 | 상태 | 담당 | 처리 예정일 | 완료일 | 사진 — 2건 · 예정일 지난 미완료는 ‘지남’ · 사진 2장',/접수일 하자 내용 상태 담당 처리 예정일 완료일 사진/.test(ah)&&at.length===2&&at[0][1]==='욕실 실리콘 들뜸'&&at[0][2]==='접수'&&at[0][3]==='정진혁'&&at[0][4].includes(D(-1))&&/지남/.test(at[0][4])&&at[0][6]==='2장'&&at[1][2]==='완료'&&at[1][5]===D(-17)&&!/지남/.test(at[1][4]),at.map(r=>r.join(' | ')).join(' // '));
   const ct=await A.evaluate(()=>[...document.querySelectorAll('#acChkT tbody tr')].map(tr=>(tr.innerText||'').replace(/\s+/g,' ').trim()));
   ok(tag+'점검 일정: 준공 1개월 점검(지남 → ‘점검 연락함’ 단추) · 준공 1년 점검(남은 날)',ct.length===2&&/준공 1개월 점검/.test(ct[0])&&/일 지남/.test(ct[0])&&/점검 연락함/.test(ct[0])&&/준공 1년 점검/.test(ct[1])&&/일 남음/.test(ct[1]),ct.join(' // '));
   let lg=await A.evaluate(()=>[...document.querySelectorAll('#acLogL li')].map(li=>(li.innerText||'').replace(/\s+/g,' ').trim()));
   ok(tag+'고객 연락 기록: 인트라넷에서 보낸 문자(고객 카드 문자 기록)가 같이 보임 · 전화번호는 안 나옴',lg.length===1&&/^문자/.test(lg[0])&&/1개월 점검 안내/.test(lg[0])&&/문자 발송 기록 \(발송됨\)/.test(lg[0])&&!/0101234|010-1234/.test(await A.locator('#acBoard').innerText()),lg.join(' // '));
   ok(tag+'사후 관리 화면(프로젝트별 칸)에 금액 없음 (A/S 비용·계약 금액)',!/54,321|33,000,000/.test(await A.locator('#acBoard').innerText()));
   ok(tag+'가로 넘침 없음',await A.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
   if(process.env.SHOTDIR)await A.screenshot({path:process.env.SHOTDIR+'/21_'+(vn==='PC'?'pc':'phone')+'.png',fullPage:true});
   // 연락 기록 추가
   await A.locator('#acl_kind').selectOption('방문');await A.locator('#acl_text').fill('토요일 오전 방문해 실리콘 다시 시공하기로 함');await A.locator('#acBoard [data-acladd]').click();await wait(1500);
   lg=await A.evaluate(()=>[...document.querySelectorAll('#acLogL li')].map(li=>(li.innerText||'').replace(/\s+/g,' ').trim()));let pS=await dbg('projects/pS');
   ok(tag+'연락 기록(방문)을 적고 ‘기록’ → 목록 맨 위에 · 프로젝트 문서의 acLog 에 덧붙임(누가·언제) · 다른 칸(현장명·단계·계약 금액·담당)은 그대로',lg.length===2&&/^방문/.test(lg[0])&&/실리콘 다시 시공/.test(lg[0])&&/최윤수/.test(lg[0])&&pS.acLog.length===1&&pS.acLog[0].kind==='방문'&&pS.acLog[0].byName==='최윤수'&&!!pS.acLog[0].at&&pS.title==='사후 현장 가'&&pS.stage==='사후관리'&&pS.contractAmt===33000000&&pS.mgr==='정진혁',lg.join(' // '));
   await A.locator('#acl_text').fill('');await A.locator('#acBoard [data-acladd]').click();await wait(500);ok(tag+'내용이 비면 저장하지 않음',(await dbg('projects/pS')).acLog.length===1);
   // 점검 연락함
   await A.locator('#acChkT [data-acchk="m1"]').click();await wait(1500);pS=await dbg('projects/pS');const c2=await A.evaluate(()=>(document.querySelector('#acChkT tbody tr').innerText||'').replace(/\s+/g,' '));
   ok(tag+'‘점검 연락함’ → 그 점검에 연락한 날·사람 표시 · 연락 기록에도 한 줄 · 단추는 사라짐',pS.acChk&&pS.acChk.m1&&pS.acChk.m1.byName==='최윤수'&&pS.acLog.length===2&&/1개월 점검 연락/.test(pS.acLog[1].text)&&/연락함/.test(c2)&&!/점검 연락함/.test(c2),c2);
   // + 하자 접수 → A/S 접수 창 (프로젝트 번호 자동 · 처리 예정일 칸) → 저장 → 목록에
   await A.locator('#acDetail [data-newas]').click();await wait(1000);const sv=await sh(A);
   ok(tag+'‘+ 하자 접수’ → A/S 접수 창이 화면 안에서 열리고 프로젝트 번호·현장이 채워져 있음 · ‘처리 예정일’ 칸 있음',/^as\|/.test(sv)&&(await A.locator('#sheetForm [data-k="pno"]').inputValue().catch(()=>''))==='P-2609-901'&&(await A.locator('#sheetForm [data-k="plan"]').count())===1&&(await A.locator('#sheetForm [data-k="site"]').inputValue())==='사후 현장 가',sv);
   await A.locator('#sheetForm [data-k="content"]').fill('베란다 창틀 누수');await A.locator('#sheetForm [data-k="plan"]').fill(D(3));await A.locator('#saveSheet').click();await wait(2500);
   if(await sh(A))await A.evaluate(()=>window.__hfT.closeSheet());await A.evaluate(()=>{location.hash='#as'});await wait(800);
   const at2=await A.evaluate(()=>[...document.querySelectorAll('#acAsT tbody tr')].map(tr=>(tr.innerText||'').replace(/\s+/g,' ').trim()));
   ok(tag+'저장하면 그 프로젝트 하자 접수 목록에 (3건 · 처리 예정일 표시) · 고른 프로젝트가 그대로',at2.length===3&&at2.some(r=>/베란다 창틀 누수/.test(r)&&r.includes(D(3))),at2.join(' // '));
   // 프로젝트 통합 화면 → 사후 관리 화면
   await A.evaluate(()=>{location.hash='#projects'});await wait(600);await A.evaluate(()=>window.__hfT.open('projects','pT'));await wait(1200);
   ok(tag+'프로젝트 창의 사후관리 카드에 ‘사후 관리 화면 열기’',(await A.locator('#pjHub [data-acgo="P-2609-902"]').count())===1);
   await A.locator('#pjHub [data-acgo="P-2609-902"]').click();await wait(1200);
   ok(tag+'누르면 사후 관리 화면에서 그 프로젝트가 골라진 채로 열림',(await A.evaluate(()=>location.hash))==='#as'&&!(await sh(A))&&/P-2609-902 · 준공 현장 나/.test(await A.locator('#acDetail').innerText()));
   // 실무 팀: 쓰되 돈 정보는 안 보임
   await wait(6000);
   for(const [who,nm,mine] of [['jjh','정진혁','P-2609-901'],['bom','이봄이','P-2609-902']]){const P=await open(who,10000);await P.evaluate(()=>{location.hash='#customers'});await wait(1000);
    const hasFlow=await P.locator('#custFlow [data-cstg="4-완료사후"]').count();if(hasFlow){await P.locator('#custFlow [data-cstg="4-완료사후"]').click();await wait(1000)}else{await P.evaluate(()=>{location.hash='#as'});await wait(1000)}
    const pl=await P.evaluate(()=>[...document.querySelectorAll('#acList [data-acpick]')].map(x=>x.dataset.acpick));
    ok(tag+nm+'(실무 팀): 고객 관리 → 완료·사후 → 사후 관리 화면이 열리고 프로젝트가 보임',(await P.evaluate(()=>location.hash))==='#as'&&pl.includes(mine),pl.join(','));
    await P.locator('#acList [data-acpick="'+mine+'"]').click();await wait(700);
    await P.locator('#acl_text').fill(nm+' 전화 확인');await P.locator('#acBoard [data-acladd]').click();await wait(2000);
    const l2=await P.evaluate(()=>[...document.querySelectorAll('#acLogL li')].map(li=>(li.innerText||'').replace(/\s+/g,' ').trim()));
    ok(tag+nm+': 연락 기록을 남길 수 있음 (거절된 쓰기 0)',l2.some(x=>x.includes(nm+' 전화 확인')&&x.includes(nm))&&(await P.evaluate(()=>window.__mockDenied.length))===0,l2.join(' // ')+' denied='+(await P.evaluate(()=>window.__mockDenied.join(','))));
    const vt=await P.locator('#view').innerText();
    ok(tag+nm+': 사후 관리 화면에 돈 정보 없음 (A/S 비용 칸·금액, 계약 금액)',!/54,321|33,000,000|A\/S 비용|비용 \(회사/.test(vt)&&(await P.locator('#view th').evaluateAll(a=>a.map(x=>x.textContent).join('|'))).indexOf('비용')<0,(await P.locator('#view th').evaluateAll(a=>a.map(x=>x.textContent).join('|'))));
    if(who==='jjh'){await P.locator('#acAsT tr[data-id="a1"]').click();await wait(1000);const sv2=await sh(P);const hasCost=await P.locator('#sheetForm [data-k="asCost"],#sheetForm [data-k="asCharge"]').count();
     ok(tag+'정진혁: 하자 접수 줄을 누르면 A/S 창이 열리고 비용 칸은 없음 · 처리 예정일은 고칠 수 있음',sv2==='as|a1'&&hasCost===0&&(await P.locator('#sheetForm [data-k="plan"]').count())===1&&!/54,321/.test(await P.locator('#veil').innerText()),sv2+' cost='+hasCost);
     await P.locator('#sheetForm [data-k="plan"]').fill(D(2));await P.locator('#sheetForm [data-k="status"]').selectOption('일정 잡힘');await P.locator('#saveSheet').click();await wait(3000);
     const mineAs=await seed.evaluate(()=>{const Dd=JSON.parse(localStorage.getItem('mockdb'));const ks=Object.keys(Dd).filter(k=>/(^|\/)as\/a1$/.test(k));return ks.map(k=>k+':'+Dd[k].status+':'+Dd[k].plan+':'+Dd[k].asCost)});
     ok(tag+'정진혁이 저장해도 안 보이던 A/S 비용 값은 지워지지 않음 · 상태·처리 예정일은 바뀜',mineAs.length>0&&mineAs.every(x=>/:54321$/.test(x))&&mineAs.some(x=>x.includes(':일정 잡힘:'+D(2)+':')),mineAs.join(' // '))}
    await P.close()}
   const C=await open('cja',9000);await C.evaluate(()=>{location.hash='#as'});await wait(1000);ok(tag+'채진아(전체 담당): 사후 관리 화면·프로젝트 목록이 보임 (비용 칸은 기존 권한대로 보임)',(await C.locator('#acBoard [data-acpick]').count())>=3&&/비용/.test(await C.locator('#view th').evaluateAll(a=>a.map(x=>x.textContent).join('|'))));await C.close();
   await A.close();await ctx.close()}
  const i21=HTML.indexOf('// ===== 사후 관리: 프로젝트별 하자 접수'),b21=HTML.slice(i21,HTML.indexOf('document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-newas]")'));
  ok('21 코드: alert/confirm/prompt/window.open/iframe 0 · 지우기(.delete) 0 · 새 저장 칸 없음(기존 projects·as 문서에만)',i21>0&&b21.length>3000&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe|\.delete\(|collection\(/.test(b21),b21.length+'자');
 }
 //__MORE__
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
