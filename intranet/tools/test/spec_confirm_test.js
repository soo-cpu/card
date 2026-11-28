// 마감재·도면 '확정본' 시험 (다음 지시 2026-11-28 v11 · A · 인트라넷 v0.99-52 · 현장소통 Code.gs v10 · field/index.html v10)
//   LANG=C.UTF-8 node intranet/tools/test/spec_confirm_test.js [index.html]      (PART=1|2|3 로 한 부분만)
// 1부 인트라넷(가짜 저장소 + 가짜 구글 드라이브): 대표·정진혁·이봄이는 올리기·확정, 채진아는 보기만 · 버전 자동 증가 · 지난 버전 접힘 · 삭제 버튼 없음
//      확정 뒤 새 버전·확정본 바뀜 → 담당자 알림 · 현장 화면에는 확정본만 · 파일은 드라이브(assets 0) · 덧붙이기만(옛 줄 그대로) · 대표 사본으로 되살림
//      v11SpecSummary / v11SpecEvents · 현장소통으로 보내는 값(확정본만 · 업체·비고·금액 없음) · 고객 확인 날짜 읽어 오기
// 2부 서버(Code.gs v10 · Node 틀): specPush(확정본 저장·권한·파일 폴더 확인) · 고객 site 응답(확인 번호 뒤 · 확정본만 · 직원 이름 없음) · specSeen(날짜·버전 기록, 되돌리기 없음, 버전 바뀌면 다시) · setup 두 번
// 3부 현장소통 화면(field/index.html v10 미리보기·가짜 서버): 고객 화면 '확정 마감재·도면' 칸 + 큰 '확인했어요' · 옛 서버(v9)면 안내만 · 옛 값(# d=)도 그대로
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'../../..');
const HTML=fs.readFileSync(process.argv[2]||path.join(ROOT,'intranet/index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const FIELD=fs.readFileSync(path.join(ROOT,'field/index.html'),'utf8');
const makeServer=require('./gs_field_harness.js');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-10T00:00:00Z";
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"이봄이",status:"진행중",steps:[1],stage:"1-상담영업",updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",cat:"주거",stage:"시공",mgr:"이봄이",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",inq:"2026-11-01",fieldCode:"https://soo-cpu.github.io/card/field/?s=AbCdEfGhIjKlMnOpQrStUv12",updatedAt:T0},"ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "projects/p2":{no:"P-2611-902",title:"시험 학교 다목적실",custName:"시험초등학교",cat:"관공서·학교",stage:"계약",mgr:"정진혁",contractAmt:"77000000",inq:"2026-11-02",updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",name:"시험 현장 욕실",mgr:"정진혁",status:"공사 중",logs:[],updatedAt:T0},
 "config/fstaff":{key:"k_test_key_value_0123456789abcdef",at:"2026-11-20T00:00:00Z",hist:[]}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,v||x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,400))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 가짜 구글 드라이브 (localStorage 'mockdrive' 를 같은 화면들이 같이 씀) · window.__DRVFAIL=true 면 파일 만들기 실패
const DRIVE=`window.__mcpLog=[];window.__MOCKMCP={callTool:async(sv,tool,inp)=>{window.__mcpLog.push(tool);const D=JSON.parse(localStorage.getItem('mockdrive')||'{}');const J=o=>({content:[{type:'text',text:JSON.stringify(o)}]});const sv2=()=>localStorage.setItem('mockdrive',JSON.stringify(D));
 if(tool==='create_file'){if(window.__DRVFAIL)return {isError:true,content:[{type:'text',text:'권한 없음'}]};const id='drvfile'+Math.random().toString(36).slice(2,10);D[id]={id,title:inp.title,parentId:inp.parentId,mime:inp.contentMimeType,b64:inp.base64Content||'',size:(inp.base64Content||'').length};sv2();return J({id,viewUrl:'https://drive.google.com/file/d/'+id+'/view'})}
 if(tool==='download_file_content'){const f=D[inp.fileId];if(!f)return {isError:true,content:[{type:'text',text:'없음'}]};return J({content:f.b64,mimeType:f.mime})}
 if(tool==='search_files'){const q=String(inp.query||''),ms=[...q.matchAll(/title contains '([^']+)'/g)].map(x=>x[1]),pm=/parentId = '([^']+)'/.exec(q);return J({files:Object.values(D).filter(f=>ms.every(m=>String(f.title).includes(m))&&(!pm||f.parentId===pm[1])&&(!/folder/.test(q)||f.mime==='application/vnd.google-apps.folder')).map(f=>({id:f.id,title:f.title}))})}
 return J({})}};`;

async function part1(b){
  const ctx=await b.newContext({viewport:{width:1280,height:900},timezoneId:'Asia/Seoul'});
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r));localStorage.removeItem('mockdrive')},[SEED,RULES]);
  const errs=[],dialogs=[];
  const open=async(who,ms,vp)=>{const p=await ctx.newPage();if(vp)await p.setViewportSize(vp);p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss().catch(()=>{})});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+DRIVE+MOCK);await p.goto('http://hf.test/');await wait(ms||9000);return p};
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
  const specDocs=d=>Object.keys(d).filter(k=>k.startsWith('work/all/spec/')).sort();
  const A=await open('admin');const J=await open('jjh');const B=await open('bom');const C=await open('cja');
  const openP=async(P,col,id)=>{await P.evaluate(([c,i])=>window.__hfT.open(c,i),[col||'projects',id||'p1']);await wait(1800)};
  const box=P=>P.evaluate(()=>{const b=document.getElementById('spBox');if(!b)return null;const q=s=>b.querySelector(s);const t=s=>{const e=q(s);return e?e.innerText.replace(/\s+/g,' '):''};
    return {cur:t('#spCur'),curVer:q('#spCur')?q('#spCur').dataset.spver:'',pend:t('#spPend'),pendVer:q('#spPend')?q('#spPend').dataset.spver:'',none:!!q('#spNone'),changed:t('#spChanged'),cust:t('#spCust'),
      past:q('#spPast')?{open:q('#spPast').open,sum:q('#spPast summary').innerText,n:b.querySelectorAll('#spPast .spold').length,openOld:[...b.querySelectorAll('#spPast .spold')].filter(x=>x.open).length}:null,
      ro:!!q('#spRO'),newBtn:!!q('[data-spnew]'),okBtn:!!q('[data-spok]'),undoBtn:!!q('[data-spundo]'),noConf:!!q('#spNoConf'),ed:!!q('#spEdit'),send:!!q('a[data-fsm="spec"]'),seenBtn:!!q('[data-spseen]'),copyBtn:b.querySelectorAll('[data-spcopy]').length,
      delBtn:[...b.querySelectorAll('button,a')].filter(x=>/삭제|지우기|휴지통/.test(x.innerText)||x.matches('[data-rmfile],[data-del],[data-trash]')).length,text:b.innerText.replace(/\s+/g,' ')}});
  const yes=async P=>{await P.locator('.okask [data-ok="1"]').click({timeout:5000});await wait(1200)};
  for(const P of [A,J,B,C])await openP(P);
  // --- 권한
  const can={};for(const [P,w] of [[A,'대표'],[J,'정진혁'],[B,'이봄이'],[C,'채진아']])can[w]=await P.evaluate(()=>window.__hfT.spCan());
  ok('권한 1: 대표·정진혁·이봄이는 올리기·확정 가능',['대표','정진혁','이봄이'].every(w=>can[w].edit&&can[w].confirm),JSON.stringify(can));
  ok('권한 2: 채진아는 올리기·확정 불가 (보기만)',!can['채진아'].edit&&!can['채진아'].confirm,JSON.stringify(can['채진아']));
  let x=await box(C);ok('권한 3: 채진아 화면 — 칸은 보이고 ‘보기만’ 안내 · 새 버전·확정 버튼 없음',x&&x.ro&&!x.newBtn&&!x.okBtn&&!x.ed,JSON.stringify(x));
  x=await box(B);ok('카드 1: 프로젝트 화면에 ‘마감재·도면’ 칸 · 처음엔 확정본 없음 · ‘새 버전 올리기’ 버튼',x&&x.none&&x.newBtn&&!x.cur,JSON.stringify(x));
  ok('카드 2: 프로젝트 통합 화면(연결 카드)에 마감재·도면 한 줄',await B.evaluate(()=>{const h=document.getElementById('spHub');return !!h&&/마감재·도면/.test(h.innerText)}));
  // --- 이봄이: v1 올리기 (마감재 2줄 + 그림 1 + PDF 1)
  await B.locator('#spBox [data-spnew]').click();await wait(400);
  const fill=async(P,rows,note)=>{await P.evaluate(([rows,note])=>{const R=document.querySelectorAll('#spEdit .sprow');rows.forEach((r,i)=>{['space','item','prod','vendor','note'].forEach((k,j)=>{const e=R[i].querySelector('[data-spf="'+k+'"]');e.value=r[j]||'';e.dispatchEvent(new Event('input',{bubbles:true}))})});const n=document.querySelector('#spEdit [data-spnote]');n.value=note||'';n.dispatchEvent(new Event('input',{bubbles:true}))},[rows,note])};
  await fill(B,[['욕실','벽 타일','포세린 600각 웜그레이','시험타일상사','줄눈 2mm'],['거실','마루','강마루 내추럴 오크','시험마루','']],'처음 올림');
  const up1=await B.evaluate(async()=>{window.__mockUploads=[];const c=document.createElement('canvas');c.width=2400;c.height=1800;const g=c.getContext('2d');g.fillStyle='#369';g.fillRect(0,0,2400,1800);const jb=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));
    const pdf=new File([new TextEncoder().encode('%PDF-1.4\n% 시험 도면\n%%EOF')],'평면도 v1.pdf',{type:'application/pdf'});
    await window.__hfT.spUpload('p1',[new File([jb],'욕실 타일 시안.jpg',{type:'image/jpeg'}),pdf,new File(['x'],'메모.txt',{type:'text/plain'})]);
    return {assets:(window.__mockUploads||[]).length,files:[...document.querySelectorAll('#spEdit .spfile')].length}});
  ok('올리기 1: 그림·PDF 는 새 버전 칸에 붙고(2개) 글 파일은 거절 · 저장 공간(assets) 0',up1.files===2&&up1.assets===0,JSON.stringify(up1));
  await B.locator('#spEdit [data-spsave]').click();await wait(1800);
  let d=await D();const v1=d['work/all/spec/p1__v1'];
  ok('올리기 2: 공용 작업 칸 work/all/spec/p1__v1 에 버전 1 (마감재 2줄 · 파일 2 · 올린 사람 이봄이)',!!v1&&v1.k==='ver'&&v1.ver===1&&v1.items.length===2&&v1.files.length===2&&v1.byName==='이봄이'&&v1.pno==='P-2611-901',JSON.stringify(v1));
  ok('올리기 3: 그림은 드라이브 보기용(dv_) · PDF 는 드라이브(dr_) · 둘 다 드라이브 원본 있음',!!v1&&/^dv_/.test(v1.files[0].id)&&/^dr_/.test(v1.files[1].id)&&v1.files.every(f=>f.drive&&f.drive.id),JSON.stringify(v1&&v1.files));
  ok('올리기 4: 버전 줄에 돈 정보 없음 (계약 금액·원가·성과금)',!!v1&&!/33000000|20202020|contractAmt|estCost|perf/.test(JSON.stringify(v1)));
  const v1json=JSON.stringify(v1);
  await wait(1500);
  x=await box(J);ok('보기 1: 정진혁 화면에 ‘확정 전 v1’ + 확정 버튼 · 아직 확정본 없음',x.pendVer==='1'&&x.okBtn&&x.none&&/포세린 600각 웜그레이/.test(x.pend),JSON.stringify(x));
  x=await box(C);ok('보기 2: 채진아 화면 — v1 은 보이지만 확정 버튼 없음 (확정 권한 안내)',x.pendVer==='1'&&!x.okBtn&&x.noConf&&x.ro,JSON.stringify(x));
  const img=await J.evaluate(async()=>{const im=document.querySelector('#spPend .spfile img');if(!im)return 'no img';im.scrollIntoView();await new Promise(r=>setTimeout(r,2500));return {blob:im.src.startsWith('blob:'),w:im.naturalWidth}});
  ok('보기 3: 이봄이가 올린 그림이 정진혁 화면에서 열림 (내 드라이브 연결로 · 1600px 이하)',img.blob&&img.w>0&&img.w<=1600,JSON.stringify(img));
  // 현장 화면(현장 관리 카드): 확정본만
  await openP(J,'sites','s1');x=await box(J);
  ok('현장 화면 1: 확정 전에는 아무 버전도 안 보임 (확정본 없음 안내만)',!!x&&x.none&&!x.pend&&!x.past&&!x.newBtn&&!/포세린/.test(x.text),JSON.stringify(x));
  await openP(J);
  // --- 정진혁: v1 확정
  await J.locator('#spBox [data-spok="1"]').click();await yes(J);
  d=await D();let acts=specDocs(d).map(k=>d[k]).filter(o=>o.k==='act');
  ok('확정 1: 정진혁이 v1 확정 → 기록 줄(확정 · 누가 · 언제)',acts.length===1&&acts[0].act==='확정'&&acts[0].ver===1&&acts[0].byName==='정진혁'&&/^\d{4}-\d{2}-\d{2}T/.test(acts[0].at),JSON.stringify(acts));
  x=await box(J);ok('확정 2: ‘최신 확정본 v1’ 크게 · 확정 정진혁 표시',x.curVer==='1'&&/최신 확정본/.test(x.cur)&&/확정 정진혁/.test(x.cur)&&!x.pend,JSON.stringify(x));
  let noti=Object.keys(d).filter(k=>k.startsWith('notify/')).map(k=>d[k]).filter(n=>n.kind==='확정본 변경');
  ok('확정 3: 프로젝트 담당(이봄이)에게 알림 · 누른 본인(정진혁)에게는 안 감',noti.length===1&&noti[0].to.includes('이봄이')&&!noti[0].to.includes('정진혁')&&noti[0].pno==='P-2611-901',JSON.stringify(noti));
  // --- 이봄이: v2 (확정 뒤 새 버전)
  await wait(1200);await B.locator('#spBox [data-spnew]').click();await wait(400);
  const pre=await B.evaluate(()=>({rows:[...document.querySelectorAll('#spEdit .sprow')].length,first:document.querySelector('#spEdit [data-spf="prod"]').value,files:document.querySelectorAll('#spEdit .spfile').length}));
  ok('버전 1: 새 버전 칸은 바로 앞 버전 내용으로 미리 채워짐 (2줄 · 파일 2)',pre.rows===2&&/포세린/.test(pre.first)&&pre.files===2,JSON.stringify(pre));
  await fill(B,[['욕실','벽 타일','포세린 600각 라이트베이지','시험타일상사','색 변경'],['거실','마루','강마루 내추럴 오크','시험마루','']],'욕실 타일 색 변경');
  await B.locator('#spEdit [data-spsave]').click();await wait(2000);
  d=await D();const v2=d['work/all/spec/p1__v2'];
  ok('버전 2: 새로 올리면 버전이 자동으로 2',!!v2&&v2.ver===2&&/라이트베이지/.test(JSON.stringify(v2.items))&&v2.note==='욕실 타일 색 변경',JSON.stringify(v2));
  ok('버전 3: v1 줄은 그대로 (덧붙이기만 — 고치지 않음)',JSON.stringify(d['work/all/spec/p1__v1'])===v1json);
  noti=Object.keys(d).filter(k=>k.startsWith('notify/')).map(k=>d[k]).filter(n=>n.kind==='확정본 변경');
  const n2=noti.find(n=>/새 버전 v2/.test(n.work));
  ok('알림 1: 확정 뒤 새 버전 → 현장 담당(정진혁)에게 ‘확정 뒤 새 버전’ 알림 (올린 이봄이 본인 제외)',!!n2&&n2.to.includes('정진혁')&&!n2.to.includes('이봄이'),JSON.stringify(noti));
  x=await box(J);ok('알림 2: 정진혁 화면 — 확정본 v1 그대로 + ‘확정 뒤 바뀜’ 표시 + 확정 전 v2',x.curVer==='1'&&/확정 뒤 바뀜/.test(x.changed)&&x.pendVer==='2',JSON.stringify(x));
  await J.evaluate(()=>{window.__hfT.closeSheet();location.hash='#home'});await wait(1500);
  const home=await J.evaluate(()=>document.body.innerText.replace(/\s+/g,' '));
  ok('알림 3: 정진혁 홈 알림 칸에 ‘확정본 변경’ (프로젝트 번호·새 버전 v2)',/확정본 변경/.test(home)&&/P-2611-901/.test(home)&&/새 버전 v2/.test(home),home.slice(0,600));
  let sum=await A.evaluate(()=>window.v11SpecSummary());
  ok('요약 1: v11SpecSummary — 확정본 v1 · 확정 정진혁 · 확정 뒤 바뀜 true · 고객 확인 빈 값 · 주거 파트',sum.length===1&&sum[0].pid==='p1'&&sum[0].ver===1&&sum[0].confirmedBy==='정진혁'&&sum[0].changedAfterConfirm===true&&sum[0].custSeenAt===''&&sum[0].part==='주거'&&/시험 현장 욕실/.test(sum[0].name)&&!!sum[0].confirmedAt,JSON.stringify(sum));
  // --- 대표: v2 확정
  await openP(A);await A.locator('#spBox [data-spok="2"]').click();await yes(A);
  x=await box(A);ok('확정 4: 대표가 v2 확정 → 최신 확정본 v2 (확정 최윤수) · ‘확정 뒤 바뀜’ 없어짐',x.curVer==='2'&&/확정 최윤수/.test(x.cur)&&!x.changed&&!x.pend,JSON.stringify(x));
  ok('지난 버전 1: v1 은 ‘지난 버전’으로 접혀 있음 (닫힌 상태 · 1개 · 지울 수 없어요)',!!x.past&&x.past.open===false&&x.past.n===1&&x.past.openOld===0&&/지난 버전 1개/.test(x.past.sum)&&/지울 수 없어요/.test(x.past.sum),JSON.stringify(x.past));
  const oldSum=await A.evaluate(()=>document.querySelector('#spPast .spold summary').textContent.replace(/\s+/g,' '));
  ok('지난 버전 2: 접힌 줄에 v1 확정 이력(정진혁)이 남음',/v1/.test(oldSum)&&/확정 정진혁/.test(oldSum),oldSum);
  for(const [P,w] of [[A,'대표'],[B,'이봄이'],[C,'채진아']]){if(P!==A)await openP(P);const y=await box(P);ok('삭제 없음: '+w+' 화면 마감재·도면 칸에 삭제·지우기 버튼 없음',!!y&&y.delBtn===0&&!y.ed,JSON.stringify(y&&y.delBtn))}
  d=await D();noti=Object.keys(d).filter(k=>k.startsWith('notify/')).map(k=>d[k]).filter(n=>n.kind==='확정본 변경');
  ok('알림 4: 확정본이 v1 → v2 로 바뀌면 담당(이봄이·정진혁)에게 ‘확정본이 바뀌었어요’',noti.some(n=>/확정본이 바뀌었어요: v1 → v2/.test(n.work)&&n.to.includes('이봄이')&&n.to.includes('정진혁')&&!n.to.includes('최윤수')),JSON.stringify(noti.map(n=>[n.to,n.work])));
  // --- 이봄이: v3 올리고 직접 확정
  await B.locator('#spBox [data-spnew]').click();await wait(400);await B.locator('#spEdit [data-spadd]').click();await wait(300);
  await fill(B,[['욕실','벽 타일','포세린 600각 라이트베이지','시험타일상사',''],['거실','마루','강마루 내추럴 오크','시험마루',''],['주방','상판','인조대리석 화이트','시험상판','']],'주방 상판 추가');
  await B.locator('#spEdit [data-spsave]').click();await wait(1800);await B.locator('#spBox [data-spok="3"]').click();await yes(B);
  x=await box(B);ok('확정 5: 이봄이가 v3 올리고 확정 → 최신 확정본 v3 (확정 이봄이) · 지난 버전 2개(접힘)',x.curVer==='3'&&/확정 이봄이/.test(x.cur)&&x.past&&x.past.n===2&&x.past.open===false,JSON.stringify(x));
  // --- 채진아가 저장소에 직접 '확정' 줄을 써도 인정 안 됨
  await C.evaluate(async()=>{const db=await window.claude.use('db');await db.collection('work/all/spec').doc('sa_forged').set({k:'act',pid:'p1',pno:'P-2611-901',act:'확정',ver:1,at:new Date(Date.now()+60000).toISOString(),by:'u_cja',byName:'채진아'})});await wait(1500);
  x=await box(J.isClosed()?A:A);ok('권한 4: 확정 권한 없는 이름(채진아)으로 쓰인 ‘확정’ 줄은 무시 — 확정본 v3 그대로',x.curVer==='3',JSON.stringify(x.cur));
  // --- 확정 취소 → 다시 확정 (기록 줄로 남음)
  await openP(J);await J.locator('#spBox [data-spundo="3"]').click();await yes(J);
  x=await box(J);ok('확정 취소 1: 정진혁이 v3 확정 취소 → 확정본 없음 · v3 은 ‘확정 전’으로 · 버전은 그대로',x.none&&x.pendVer==='3',JSON.stringify(x));
  d=await D();ok('확정 취소 2: 취소도 기록 줄로 남고(확정 취소) 버전 줄 3개 그대로',specDocs(d).map(k=>d[k]).some(o=>o.act==='확정 취소'&&o.ver===3&&o.byName==='정진혁')&&['p1__v1','p1__v2','p1__v3'].every(k=>!!d['work/all/spec/'+k]));
  await openP(J,'sites','s1');x=await box(J);ok('현장 화면 2: 확정 취소 뒤 현장 화면에는 아무 버전도 안 보임',x.none&&!/인조대리석/.test(x.text),JSON.stringify(x));
  await openP(J);await J.locator('#spBox [data-spok="3"]').click();await yes(J);
  await openP(B,'sites','s1');x=await box(B);
  ok('현장 화면 3: 현장 화면에는 최신 확정본(v3)만 — 지난 버전·새 버전 쓰기·확정 버튼 없음',x.curVer==='3'&&/인조대리석 화이트/.test(x.cur)&&!x.past&&!x.pend&&!x.newBtn&&!x.okBtn&&!x.undoBtn&&!x.send&&x.delBtn===0,JSON.stringify(x));
  // --- 대표 사본으로 되살림: 공용 칸에서 버전 줄이 사라져도 대표 화면이 되돌림
  d=await D();const mir=Object.keys(d).filter(k=>k.startsWith('acct/_spec/s/'));
  ok('보관 1: 대표 화면이 대표 전용 칸(acct/_spec/s)에 같은 줄을 사본으로 둠',['p1__v1','p1__v2','p1__v3'].every(k=>JSON.stringify(d['acct/_spec/s/'+k])===JSON.stringify(d['work/all/spec/'+k])),mir.length);
  await seed.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb'));delete D['work/all/spec/p1__v1'];localStorage.setItem('mockdb',JSON.stringify(D));new BroadcastChannel('mockdb').postMessage('work/all/spec/p1__v1')});await wait(3500);
  d=await D();ok('보관 2: 공용 칸에서 v1 줄이 사라져도 대표 화면이 사본으로 되살림 (삭제 불가)',JSON.stringify(d['work/all/spec/p1__v1'])===v1json,JSON.stringify(d['work/all/spec/p1__v1']||null).slice(0,80));
  // --- 현장소통으로 보내는 값
  await openP(B);
  const pay=await B.evaluate(()=>{const s=window.__hfT.spPayload('p1');const raw=window.__hfT.fsData('p1','spec');const bin=atob(raw.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((raw.length+3)%4));const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return {s,o:JSON.parse(new TextDecoder().decode(u)),a:(()=>{const a=document.querySelector('#spBox a[data-fsm="spec"]');return a?{href:a.getAttribute('href'),fadm:a.dataset.fadm,fsp:a.dataset.fsp}:null})()}});
  ok('전달 1: 보내는 값 = 최신 확정본(v3) · 확정한 사람·시각 · 마감재 3줄(공간·품목·제품명·색상) · 드라이브 파일 2',pay.o.m==='spec'&&pay.o.proj==='P-2611-901'&&pay.o.spec.ver===3&&pay.o.spec.by==='정진혁'&&pay.o.spec.it.length===3&&pay.o.spec.it.every(r=>r.length===3)&&pay.o.spec.fl.length===2&&pay.o.spec.fl[0].t==='i'&&pay.o.spec.fl[1].t==='p',JSON.stringify(pay.o));
  ok('전달 2: 보내는 값에 업체·비고·금액·원가·전체 전화번호·열쇠 없음',!/시험타일상사|시험마루|33000000|20202020|010-?1234-?5678|k_test_key/.test(JSON.stringify(pay.o)),JSON.stringify(pay.o).slice(0,300));
  ok('전달 3: ‘고객 화면(현장소통)에 확정본 보내기’ = 기존 직원 열쇠 입장권 링크(data-fadm) · 쿼리에는 admin·s 만',!!pay.a&&pay.a.fadm==='1'&&pay.a.fsp==='p1'&&/^https:\/\/soo-cpu\.github\.io\/card\/field\/\?admin&s=AbCdEfGhIjKlMnOpQrStUv12$/.test(pay.a.href),JSON.stringify(pay.a));
  const sent=await B.evaluate(async()=>{const a=document.querySelector('#spBox a[data-fsm="spec"]');a.addEventListener('click',e=>e.preventDefault());a.click();const h=a.getAttribute('href');await new Promise(r=>setTimeout(r,2200));return {k:/#k=\d{13}\./.test(h),d:/&d=[A-Za-z0-9_-]{20,}/.test(h),after:a.getAttribute('href'),txt:document.querySelector('#spCust')?document.querySelector('#spCust').innerText:''}});
  ok('전달 4: 누르면 입장권(k)·값(d)은 # 뒤에만 붙고 곧 지워짐 · ‘보낸 기록 v3’ 가 남음',sent.k&&sent.d&&!/#/.test(sent.after)&&/현장소통에 보낸 기록: v3/.test(sent.txt.replace(/\s+/g,' ')),JSON.stringify(sent).slice(0,300));
  // --- 고객 확인 날짜 읽어 오기 (현장소통 서버가 드라이브에 남긴 표시 파일)
  x=await box(B);ok('고객 확인 1: 아직이면 ‘고객이 아직 확인하지 않았어요’',/아직 확인하지 않았어요/.test(x.cust),x.cust);
  await B.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdrive')||'{}');D.seenmark1={id:'seenmark1',title:'확정본고객확인 P-2611-901 v3 2026-11-29 1432.txt',parentId:'x',mime:'text/plain',b64:''};D.seenmark2={id:'seenmark2',title:'확정본고객확인 P-2611-902 v3 2026-11-30 0900.txt',parentId:'x',mime:'text/plain',b64:''};localStorage.setItem('mockdrive',JSON.stringify(D))});
  await B.locator('#spBox [data-spseen]').click();await wait(1800);
  x=await box(B);ok('고객 확인 2: ‘고객 확인 새로 고침’ → 날짜가 화면에 (2026-11-29 14:32)',/2026-11-29 14:32/.test(x.cust)&&/확인했어요/.test(x.cust),x.cust);
  await B.locator('#spBox [data-spseen]').click();await wait(1500);
  d=await D();ok('고객 확인 3: 기록 줄 ‘고객 확인’ 은 한 번만 (다시 눌러도 겹치지 않음 · 다른 프로젝트 것은 안 섞임)',specDocs(d).map(k=>d[k]).filter(o=>o.act==='고객 확인').length===1);
  await wait(1200);sum=await A.evaluate(()=>window.v11SpecSummary());
  ok('요약 2: v11SpecSummary — 확정본 v3 · 고객 확인 날짜 · 확정 뒤 바뀜 false',sum.length===1&&sum[0].ver===3&&sum[0].custSeenAt==='2026-11-29 14:32'&&sum[0].changedAfterConfirm===false&&sum[0].confirmedBy==='정진혁',JSON.stringify(sum));
  const keys=sum[0]?Object.keys(sum[0]):[];ok('요약 3: 약속한 칸 이름 (pid·name·part·ver·confirmedBy·confirmedAt·custSeenAt·changedAfterConfirm)',['pid','name','part','ver','confirmedBy','confirmedAt','custSeenAt','changedAfterConfirm'].every(k=>keys.includes(k)),keys.join());
  const ev=await A.evaluate(()=>window.v11SpecEvents('p1'));
  ok('타임라인: v11SpecEvents(pid) — {t,kind:spec,text,who} 시간순 · 올림 3 · 확정 4 · 확정 취소 1 · 고객 확인 1 · 채진아 가짜 줄 없음',ev.every(e=>e.kind==='spec'&&e.t&&e.text&&'who' in e)&&ev.filter(e=>/올림/.test(e.text)).length===3&&ev.filter(e=>/ 확정 v/.test(e.text)).length===4&&ev.filter(e=>/확정 취소/.test(e.text)).length===1&&ev.filter(e=>/고객 확인/.test(e.text)).length===1&&!ev.some(e=>e.who==='채진아')&&ev.map(e=>e.t).join()===ev.map(e=>e.t).slice().sort().join(),JSON.stringify(ev.map(e=>[e.text,e.who])));
  // --- 다른 프로젝트(관공서) · 새 확정 뒤 고객 확인은 다시
  await B.locator('#spBox [data-spnew]').click();await wait(400);await fill(B,[['욕실','벽 타일','포세린 600각 화이트','시험타일상사',''],['거실','마루','강마루 내추럴 오크','시험마루',''],['주방','상판','인조대리석 화이트','시험상판','']],'타일 화이트로');
  await B.locator('#spEdit [data-spsave]').click();await wait(1500);await B.locator('#spBox [data-spok="4"]').click();await yes(B);
  x=await box(B);ok('고객 확인 4: 확정본이 v4 로 바뀌면 고객 확인은 다시 ‘아직’ (버전마다 따로)',x.curVer==='4'&&/아직 확인하지 않았어요/.test(x.cust)&&/아직 이 확정본을 고객 화면\(현장소통\)에 보내지 않았어요/.test(x.cust),x.cust);
  // --- 직원 화면에 돈 정보 없음 · 저장소 확인
  d=await D();const all=specDocs(d).map(k=>JSON.stringify(d[k])).join('');
  ok('돈 정보: 마감재·도면 저장 줄 어디에도 계약 금액·원가 없음',!/33000000|20202020|77000000/.test(all));
  ok('드라이브: 파일은 프로젝트 번호 폴더에 (그림 원본 1 · 보기용 1 · PDF 1) · assets 올림 0',await B.evaluate(()=>{const dv=JSON.parse(localStorage.getItem('mockdrive')||'{}');const pf=Object.values(dv).find(f=>/folder/.test(f.mime)&&/^P-2611-901/.test(f.title));const L=Object.values(dv).filter(f=>pf&&f.parentId===pf.id);return !!pf&&L.length===3&&L.filter(f=>/보기용/.test(f.title)).length===1&&L.filter(f=>/pdf/.test(f.mime)).length===1&&(window.__mockUploads||[]).length===0}));
  // --- 휴대폰 크기: 버튼 44px
  const M=await open('bom',8000,{width:390,height:800});await openP(M);await M.locator('#spBox [data-spnew]').click();await wait(500);
  const hts=await M.evaluate(()=>[...document.querySelectorAll('#spBox button,#spBox a.btn,#spBox label.btn,#spBox summary')].filter(e=>e.offsetParent).map(e=>[e.innerText.trim().slice(0,14),Math.round(e.getBoundingClientRect().height)]));
  ok('휴대폰: 마감재·도면 칸의 버튼·접는 줄 높이 44px 이상 ('+hts.length+'개)',hts.length>=6&&hts.every(h=>h[1]>=44),JSON.stringify(hts.filter(h=>h[1]<44)));
  ok('휴대폰: 가로로 넘치지 않음 (칸 너비 ≤ 화면)',await M.evaluate(()=>document.getElementById('spBox').getBoundingClientRect().width<=390&&document.getElementById('spEdit').scrollWidth<=document.getElementById('spEdit').clientWidth+2));
  await M.close();
  ok('막힌 기능: alert·prompt 창 없음 (확인은 화면 안 창)',!dialogs.some(x=>/alert|prompt/.test(x)),dialogs.join());
  ok('화면 오류 없음',errs.length===0,errs.slice(0,5).join(' | '));
  const src=HTML.slice(HTML.indexOf("// ===== v0.99-52 마감재·도면"),HTML.indexOf("// ===== 공정 진행률 (대표 지시 2026-11-13 4번"));
  ok('코드: 마감재·도면 블록에 .delete( · alert( · confirm( · prompt( · window.open · iframe · assets 올리기 없음',src.length>5000&&!/\.delete\(|[^A-Za-z.]alert\(|[^A-Za-z.]confirm\(|prompt\(|window\.open|<iframe|upAsset\(|assets\.upload/.test(src));
  ok('버전 표시 v0.99-52 이상(A 설명 남음)',/const APP_VER="v0\.99-5[2-9] \(/.test(HTML)&&/v0\.99-52: \(다음 지시 2026-11-28 v11 · A|APP_VER="v0\.99-52 \(/.test(HTML));
  await ctx.close();
}

// ===== 2부·3부 공통: 가짜 서버에 현장 하나 + 드라이브 파일(인트라넷 첨부 › 프로젝트 폴더 안 그림·PDF, 글 파일, 폴더 밖 PDF)
const PW='pw-test-77',KEY='k'.repeat(40),ATT='1P0Rh3vBB1ApsUcpVXZsDrzr1mdVUWOor';
function serverWithSite(){const S=makeServer({props:{FIELD_STAFF_KEY:KEY}});S.setPw(PW);
  const r=S.post({a:'projSite',pw:PW,proj:'P-2611-901',name:'시험 현장 욕실',cust:'홍길동',pin:'5678',manager:'이봄이 실장'});
  const Dv=S.ctx.DriveApp,root=Dv.getFolderById(ATT),pf=root.createFolder('P-2611-901 시험 현장 욕실');
  const blob=(n,mime,size)=>({_name:n,getContentType:()=>mime,getBytes:()=>new Array(size).fill(1)});
  const F={img:pf.createFile(blob('보기용 타일.jpg','image/jpeg',5000)).getId(),pdf:pf.createFile(blob('평면도.pdf','application/pdf',9000)).getId(),txt:pf.createFile(blob('메모.txt','text/plain',10)).getId(),
    out:Dv.getFolderById('otherfolder_abcdefgh').createFile(blob('다른 폴더 서류.pdf','application/pdf',100)).getId()};
  const tk=()=>'T:'+S.post({a:'ticket',k:S.ticket(KEY,{who:'이봄이'})}).token;
  const spec=(ver,by,extra)=>Object.assign({ver,by:by||'정진혁',at:'2026-11-28T05:02:11',it:[['욕실','벽 타일','포세린 600각 라이트베이지','시험타일상사','줄눈 2mm'],['거실','마루','강마루 내추럴 오크']],fl:[{i:F.img,n:'욕실 타일 시안.jpg',t:'i'},{i:F.pdf,n:'평면도 v1.pdf',t:'p'}]},extra||{});
  return {S,code:r.code,F,tk,spec,rows:n=>S.rowsOf(n)}}

async function part2(){
  const X=serverWithSite(),{S,code,F}=X;const T=X.tk();
  ok('서버 1: doGet v:10',JSON.parse(S.ctx.doGet({parameter:{}}).text).v===10);
  const tabs0=Object.keys(S.st.sheets);const siteRow0=JSON.stringify(X.rows('현장'));
  let r=S.post({a:'specPush',s:code,spec:X.spec(3)});ok('서버 2: 비밀번호·출입증 없이 확정본 보내기 → 거절',!r.ok&&/비밀번호|잠겨/.test(r.error),JSON.stringify(r));
  r=S.post({a:'specPush',pw:T,s:code,spec:X.spec(3,'채진아')});ok('서버 3: 확정한 사람이 채진아(확정 권한 없음) → 거절',!r.ok&&/확정 권한/.test(r.error),JSON.stringify(r));
  r=S.post({a:'specPush',pw:T,proj:'P-2611-901',spec:X.spec(3,'정진혁',{fl:[{i:F.img,n:'욕실 타일 시안.jpg'},{i:F.pdf,n:'평면도 v1.pdf'},{i:F.txt,n:'메모.txt'},{i:F.out,n:'다른 폴더 서류.pdf'},{i:'nofile_zzzzzzzz',n:'없는 파일'}]})});
  ok('서버 4: 직원 출입증으로 확정본 v3 받음 (프로젝트 번호로 현장 찾음 · 마감재 2줄 · 파일 2)',r.ok&&r.ver===3&&r.items===2&&r.files===2&&!r.same,JSON.stringify(r));
  ok('서버 5: 이미지·PDF 가 아닌 파일 · 인트라넷 첨부 폴더 밖 파일 · 없는 파일은 받지 않고 알려 줌 (3개)',r.ok&&r.skipped.length===3&&r.skipped.some(x=>/폴더 밖/.test(x))&&r.skipped.some(x=>/이미지·PDF 아님/.test(x))&&r.skipped.some(x=>/못 읽음/.test(x)),JSON.stringify(r.skipped));
  let L=X.rows('확정 마감재·도면');
  ok('서버 6: 새 탭 ‘확정 마감재·도면’ 에 한 줄 (버전·확정·확정한 사람·확정 시각·보낸 사람 이봄이)',L.length===1&&L[0][1]===code&&L[0][2]==='3'&&L[0][3]==='확정'&&L[0][4]==='정진혁'&&L[0][5]==='2026-11-28T05:02:11'&&L[0][6]==='이봄이',JSON.stringify(L));
  ok('서버 7: 마감재는 공간·품목·제품명·색상 3칸만 저장 (업체·비고는 받지 않음)',JSON.parse(L[0][7]).every(a=>a.length===3)&&!/시험타일상사|줄눈/.test(L[0][7]),L[0][7]);
  ok('서버 8: 기존 ‘현장’ 탭 줄은 그대로 · 탭은 더해지기만',JSON.stringify(X.rows('현장'))===siteRow0&&tabs0.every(t=>Object.keys(S.st.sheets).includes(t)));
  r=S.post({a:'specPush',pw:T,s:code,proj:'P-2611-999',spec:X.spec(3)});ok('서버 8-2: 현장 코드와 프로젝트 번호가 서로 다르면 거절 (다른 프로젝트 현장에 안 올라감)',!r.ok&&/다른 프로젝트/.test(r.error)&&X.rows('확정 마감재·도면').length===1,JSON.stringify(r));
  r=S.post({a:'specPush',pw:T,s:code,spec:X.spec(3)});ok('서버 9: 같은 확정본을 다시 보내면 줄을 더하지 않음',r.ok&&r.same===true&&X.rows('확정 마감재·도면').length===1,JSON.stringify(r));
  // 고객 화면 응답
  r=S.post({a:'site',s:code});ok('서버 10: 고객 — 확인 번호 없이는 확정본 못 봄 (PIN 요구)',!r.ok&&/^PIN:/.test(r.error)&&!/포세린/.test(JSON.stringify(r)),JSON.stringify(r));
  r=S.post({a:'site',s:code,pin:'5678'});const sp=r.spec;
  ok('서버 11: 고객 — 확인 번호 통과 뒤 확정본 v3 (마감재 2줄 · 파일 2 · 아직 확인 전)',r.ok&&sp&&sp.ver===3&&sp.items.length===2&&sp.items[0][2]==='포세린 600각 라이트베이지'&&sp.files.length===2&&sp.files[0].kind==='img'&&sp.files[1].kind==='pdf'&&sp.seenAt==='',JSON.stringify(sp));
  ok('서버 12: 고객 응답에 확정한 직원·보낸 직원 이름·업체·비고 없음',r.ok&&!('by' in sp)&&!/정진혁|이봄이|시험타일상사|줄눈/.test(JSON.stringify(r)),JSON.stringify(r).slice(0,300));
  r=S.post({a:'adminSite',pw:T,s:code});ok('서버 13: 직원 화면 응답 — 같은 확정본 + 확정한 사람',r.ok&&r.spec&&r.spec.ver===3&&r.spec.by==='정진혁'&&r.spec.items.length===2,JSON.stringify(r.spec));
  // 파일
  r=S.post({a:'specFile',s:code,id:F.img});ok('서버 14: 고객 — 확인 번호 없이 파일 요청 → 거절',!r.ok&&/^PIN:/.test(r.error),JSON.stringify(r));
  r=S.post({a:'specFile',s:code,pin:'5678',id:F.img});ok('서버 15: 고객 — 확정본 그림 받기',r.ok&&/^data:image\/jpeg;base64,/.test(r.data)&&r.kind==='img',JSON.stringify(r).slice(0,120));
  r=S.post({a:'specFile',s:code,pin:'5678',id:F.pdf});ok('서버 16: 고객 — 확정본 PDF 받기',r.ok&&/^data:application\/pdf;base64,/.test(r.data)&&r.kind==='pdf',JSON.stringify(r).slice(0,120));
  r=S.post({a:'specFile',s:code,pin:'5678',id:F.out});ok('서버 17: 확정본에 없는 파일 번호는 거절 (다른 폴더 서류)',!r.ok&&/찾을 수 없어요/.test(r.error),JSON.stringify(r));
  // 고객 확인
  r=S.post({a:'specSeen',s:code,pw:T,ver:3});ok('서버 18: 직원은 ‘확인했어요’를 누를 수 없음',!r.ok&&/고객 화면에서만/.test(r.error),JSON.stringify(r));
  r=S.post({a:'specSeen',s:code,ver:3});ok('서버 19: 확인 번호 없이 ‘확인했어요’ → 거절',!r.ok&&/^PIN:/.test(r.error),JSON.stringify(r));
  r=S.post({a:'specSeen',s:code,pin:'5678',ver:2});ok('서버 20: 다른 버전 번호로 누르면 거절 (확정본이 바뀌었어요)',!r.ok&&/바뀌었어요/.test(r.error),JSON.stringify(r));
  r=S.post({a:'specSeen',s:code,pin:'5678',ver:3});const at1=r.seenAt;L=X.rows('고객 확인 기록');
  ok('서버 21: 고객 ‘확인했어요’ → 날짜·버전 기록 (새 탭 ‘고객 확인 기록’ 한 줄)',r.ok&&/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(at1)&&r.already===false&&L.length===1&&L[0][1]===code&&L[0][2]==='3'&&L[0][3]===at1.slice(0,10),JSON.stringify(r)+JSON.stringify(L));
  const items=S.st.drive.items,mk=Object.keys(items).filter(k=>/^확정본고객확인 /.test(items[k].name));
  ok('서버 22: 드라이브 ‘인트라넷 첨부 › 확정본 고객 확인 기록’ 에 표시 파일 (제목 = 프로젝트 번호·버전·날짜 · 고객 이름 없음)',mk.length===1&&/^확정본고객확인 P-2611-901 v3 \d{4}-\d{2}-\d{2} \d{4}\.txt$/.test(items[mk[0]].name)&&items[items[mk[0]].parent].name==='확정본 고객 확인 기록'&&items[items[mk[0]].parent].parent===ATT&&!/홍길동|5678/.test(items[mk[0]].name)&&L[0][4]===mk[0],JSON.stringify(mk.map(k=>items[k])));
  r=S.post({a:'specSeen',s:code,pin:'5678',ver:3});ok('서버 23: 다시 눌러도 처음 날짜 그대로 · 줄·표시 파일 늘지 않음',r.ok&&r.already===true&&r.seenAt===at1&&X.rows('고객 확인 기록').length===1&&Object.keys(items).filter(k=>/^확정본고객확인 /.test(items[k].name)).length===1,JSON.stringify(r));
  r=S.post({a:'specUnseen',s:code,pin:'5678',ver:3});const r2=S.post({a:'specSeen',s:code,pin:'5678',ver:3,undo:true});
  ok('서버 24: 되돌리기 없음 (되돌리는 요청 없음 · undo 를 보내도 그대로)',!r.ok&&/알 수 없는 요청/.test(r.error)&&r2.ok&&r2.seenAt===at1&&X.rows('고객 확인 기록').length===1);
  r=S.post({a:'site',s:code,pin:'5678'});ok('서버 25: 고객 화면 응답에 확인 날짜',r.ok&&r.spec.seenAt===at1);r=S.post({a:'adminSite',pw:T,s:code});ok('서버 26: 직원 화면 응답에도 고객 확인 날짜',r.ok&&r.spec.seenAt===at1);
  // 버전이 바뀌면 다시 확인
  r=S.post({a:'specPush',pw:PW,s:code,spec:X.spec(4,'최윤수')});const s4=S.post({a:'site',s:code,pin:'5678'}).spec;
  ok('서버 27: 새 확정본 v4 → 고객 확인은 다시 빈 값 (버전마다 따로) · v3 확인 줄은 그대로',r.ok&&s4.ver===4&&s4.seenAt===''&&X.rows('고객 확인 기록').length===1&&X.rows('확정 마감재·도면').length===2,JSON.stringify(s4));
  r=S.post({a:'specSeen',s:code,pin:'5678',ver:3});ok('서버 28: 옛 버전(v3)으로 다시 누르면 거절',!r.ok&&/바뀌었어요/.test(r.error));
  r=S.post({a:'specSeen',s:code,pin:'5678',ver:4});ok('서버 29: v4 확인 → 기록 2줄 (v3 · v4)',r.ok&&X.rows('고객 확인 기록').length===2&&X.rows('고객 확인 기록').map(x=>x[2]).join()==='3,4');
  r=S.post({a:'specPush',pw:T,s:code,spec:X.spec(2)});ok('서버 30: 더 옛 버전(v2)은 받지 않음',!r.ok&&/더 새 확정본\(v4\)/.test(r.error),JSON.stringify(r));
  r=S.post({a:'specPush',pw:T,s:code,spec:{ver:5,by:'이봄이',at:'',it:[],fl:[{i:F.out,n:'x'}]}});ok('서버 31: 내용이 빈 확정본(파일도 못 받음)은 거절',!r.ok&&/비어 있어요/.test(r.error),JSON.stringify(r));
  // 확정 취소 → 내림 (줄은 지우지 않음)
  r=S.post({a:'specPush',pw:T,s:code,spec:{cancel:1}});const s0=S.post({a:'site',s:code,pin:'5678'});L=X.rows('확정 마감재·도면');
  ok('서버 32: 확정 취소 → 고객 화면에서 확정본 내림 · 줄은 지우지 않고 ‘확정 취소’ 한 줄 더함 (3줄)',r.ok&&r.cancelled===true&&s0.ok&&s0.spec===null&&L.length===3&&L[2][3]==='확정 취소'&&L[0][3]==='확정',JSON.stringify(L.map(x=>x.slice(2,5))));
  r=S.post({a:'specFile',s:code,pin:'5678',id:F.img});ok('서버 33: 확정본이 없으면 파일도 안 나감',!r.ok);
  r=S.post({a:'specPush',pw:T,s:code,spec:X.spec(4,'최윤수')});ok('서버 34: 다시 확정(v4) → 고객 확인 기록(v4)이 그대로 이어짐',r.ok&&S.post({a:'site',s:code,pin:'5678'}).spec.seenAt!=='');
  const logs=X.rows('기록').map(x=>x[1]);ok('서버 35: ‘기록’ 탭에 확정본 받음·고객 확인·내림이 남음',['확정본 받음','확정본 고객 확인','확정본 내림'].every(k=>logs.includes(k)),logs.join());
  // 옛 화면이 보내는 요청은 그대로 (prog·site 모양)
  r=S.post({a:'prog',s:code,pin:'5678'});ok('서버 36: 기존 요청(prog·projSite)은 그대로 동작',r.ok&&Array.isArray(r.stages)&&S.post({a:'projSite',pw:T,proj:'P-2611-901'}).code===code);
  // setup 두 번 (새 탭·새 설정 줄만 더하고 다시 돌려도 같음)
  {const Tn=makeServer({props:{}});const tss=Tn.ctx.SpreadsheetApp.openById();
   const sh=tss.insertSheet('현장');sh.rows.push(['코드']);sh.rows.push([Tn.ctx.TEST_CODE||'WI7ijOiMEPHIOf4vjkqEPmG2','시험','','','','','','[]','진행','f1','','','','','','[]','','']);
   const old=tss.insertSheet('글');old.rows.push(['글ID','현장코드','날짜']);old.rows.push(['P_keep','WI7ijOiMEPHIOf4vjkqEPmG2','2026-11-01']);
   let e='';try{Tn.ctx.setup()}catch(x){e=x.message}const snap=()=>JSON.stringify(Object.keys(Tn.st.sheets).map(n=>[n,n==='기록'?0:Tn.st.sheets[n].rows]));const a1=snap();
   try{Tn.ctx.setup()}catch(x){e+=x.message}const a2=snap();const set=Tn.rowsOf('설정').filter(x=>x[0]==='확정본 파일 상위 폴더ID');
   ok('서버 37: setup → 새 탭 2개(확정 마감재·도면 · 고객 확인 기록)와 설정 한 줄 · 기존 탭·줄 그대로',!e&&!!Tn.st.sheets['확정 마감재·도면']&&!!Tn.st.sheets['고객 확인 기록']&&set.length===1&&Tn.rowsOf('글')[0][0]==='P_keep'&&Tn.st.sheets['현장'].rows[0][0]==='코드',e);
   ok('서버 38: setup 을 두 번 돌려도 탭·머리글·설정이 똑같음 (늘지 않음)',a1===a2)}
  const GS=fs.readFileSync(path.join(ROOT,'intranet/field-script/Code.gs'),'utf8');
  ok('서버 39: 소스 — 머리말 v10 · 지우는 동작 없음 (deleteRow·clear·setTrashed·removeFile·deleteSheet)',/현장소통 Code\.gs 2026-11-28 v10/.test(GS)&&!/deleteRow|deleteRows|\.clear\(|setTrashed|removeFile|deleteSheet/.test(GS));
  ok('서버 40: 소스 — 실제 고객 이름·확인 번호가 든 일괄 등록(Import.gs)은 저장소에 없음',!/var ROWS = \[|importSeed|setupAll/.test(GS));
}

async function part3(b){
  const errs=[];const X=serverWithSite(),{S,code}=X;S.post({a:'specPush',pw:PW,s:code,spec:X.spec(3)});
  const enc=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
  const fieldCtx=async(Sv)=>{const ctx=await b.newContext({viewport:{width:420,height:820},timezoneId:'Asia/Seoul'});
    await ctx.route('http://f.test/field/**',r=>{const u=r.request().url();if(/config\.js/.test(u))return r.fulfill({contentType:'application/javascript',body:'window.FIELD_API="http://api.test/exec";'});if(/\/field\/(\?|#|$)/.test(u))return r.fulfill({contentType:'text/html',body:FIELD});return r.abort()});
    await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
    await ctx.route('http://api.test/**',r=>{const req=r.request();r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(Sv.post(req.postData()||'{}'))})});return ctx};
  const fopen=async(ctx,url,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('dialog '+d.type());d.dismiss().catch(()=>{})});await p.goto(url);await wait(ms||1500);return p};
  const st=p=>p.evaluate(()=>{const s=document.getElementById('spec');return {url:location.href,pinGate:!!document.getElementById('pinIn'),body:document.body.innerText.replace(/\s+/g,' '),spec:s?s.innerText.replace(/\s+/g,' '):'',ver:s?s.dataset.ver:'',rows:s?s.querySelectorAll('tbody tr').length:0,imgs:s?s.querySelectorAll('.sf img').length:0,pdfs:s?s.querySelectorAll('[data-sfpdf]').length:0,
    okBtn:(()=>{const x=document.getElementById('specOk');return x?Math.round(x.getBoundingClientRect().height):0})(),seen:(document.getElementById('specSeen')||{}).innerText||'',old:!!document.getElementById('specOld'),none:!!document.getElementById('specNone'),toast:[...document.querySelectorAll('.toast')].map(t=>t.textContent).join('|'),wide:document.documentElement.scrollWidth<=innerWidth+2}});
  let ctx=await fieldCtx(S);
  // 고객 화면
  let C=await fopen(ctx,'http://f.test/field/?s='+code);let x=await st(C);
  ok('화면 1: 고객 — 확인 번호를 넣기 전에는 확정본이 안 보임',x.pinGate&&!x.spec&&!/포세린/.test(x.body),x.body.slice(0,120));
  await C.fill('#pinIn','5678');await C.locator('#pf button').first().click();await wait(2500);x=await st(C);
  ok('화면 2: 고객 — 확인 번호 통과 뒤 ‘확정 마감재·도면 v3’ 칸 (마감재 2줄 · 그림 1 · PDF 1)',/확정 마감재·도면\s*v3/.test(x.spec)&&x.rows===2&&/포세린 600각 라이트베이지/.test(x.spec)&&x.imgs===1&&x.pdfs===1,JSON.stringify(x).slice(0,400));
  ok('화면 3: 고객 화면에 확정한 직원 이름·업체·비고 없음',!/정진혁|이봄이|시험타일상사|줄눈/.test(x.body));
  ok('화면 4: 큰 ‘확인했어요’ 버튼 (높이 50px 이상) · 가로 넘침 없음',x.okBtn>=50&&x.wide,x.okBtn);
  await C.locator('[data-sfpdf]').click();await wait(900);
  ok('화면 5: PDF 도면 — 누르면 화면 안 창에 ‘열기 · 내려받기’ 링크',await C.evaluate(()=>{const a=document.querySelector('.modal a[download]');return !!a&&/^blob:/.test(a.href)}));
  await C.locator('.modal [data-close]').click();await wait(200);
  await C.locator('#specOk').click();await wait(300);
  ok('화면 6: ‘확인했어요’ → 화면 안 확인 창 (되돌릴 수 없어요 안내)',await C.evaluate(()=>{const m=document.querySelector('.modal');return !!m&&/되돌릴 수 없어요/.test(m.innerText)&&!!document.getElementById('akOk')}));
  await C.locator('.modal [data-close]').click();await wait(300);ok('화면 7: 확인 창에서 취소하면 기록 안 됨',X.rows('고객 확인 기록').length===0);
  await C.locator('#specOk').click();await wait(300);await C.locator('#akOk').click();await wait(1500);x=await st(C);
  ok('화면 8: 확인 → 서버에 날짜·버전 기록 · 버튼 대신 ‘확인하셨습니다’',X.rows('고객 확인 기록').length===1&&X.rows('고객 확인 기록')[0][2]==='3'&&!x.okBtn&&/확인하셨습니다/.test(x.seen),JSON.stringify(x.seen));
  await C.reload();await wait(2500);x=await st(C);ok('화면 9: 다시 열어도 확인한 날짜 그대로 · 누를 버튼 없음 (되돌리기 없음)',/확인하셨습니다/.test(x.seen)&&!x.okBtn&&!/되돌리|취소/.test(x.spec),x.spec.slice(-120));
  // 버전이 바뀌면 다시 확인 — 화면이 옛 버전을 보고 있을 때 누르면 안내 뒤 새로 고침
  const C2=await fopen(ctx,'http://f.test/field/?s='+code,600);await C2.evaluate(()=>sessionStorage.setItem('field_pin_'+new URLSearchParams(location.search).get('s'),'5678'));await C2.reload();await wait(2200);
  S.post({a:'specPush',pw:PW,s:code,spec:X.spec(4,'이봄이',{it:[['욕실','벽 타일','포세린 600각 화이트']]})});
  await C.reload();await wait(2500);x=await st(C);ok('화면 10: 확정본이 v4 로 바뀌면 ‘확인했어요’ 버튼이 다시 나옴',x.ver==='4'&&x.okBtn>=50&&/포세린 600각 화이트/.test(x.spec),JSON.stringify(x).slice(0,200));
  await C.locator('#specOk').click();await wait(300);await C.locator('#akOk').click();await wait(1500);
  ok('화면 11: v4 확인 → 기록 2줄 (v3 · v4)',X.rows('고객 확인 기록').map(r=>r[2]).join()==='3,4');
  // 직원 화면 (입장권)
  const A=await fopen(ctx,'http://f.test/field/?admin&s='+code+'#k='+S.ticket(KEY,{who:'정진혁'}),3000);x=await st(A);
  ok('화면 12: 직원 화면 — 확정본 v4 + 확정한 사람 + 고객 확인 날짜 · ‘확인했어요’ 버튼 없음',x.ver==='4'&&/확정 이봄이/.test(x.spec)&&/고객 확인 \d{4}-\d{2}-\d{2}/.test(x.seen)&&!x.okBtn,JSON.stringify(x).slice(0,300));
  // 인트라넷 ‘현장소통에 확정본 보내기’ (# 뒤 k·d)
  const d5={v:1,m:'spec',proj:'P-2611-901',name:'시험 현장 욕실',spec:{ver:5,by:'최윤수',at:'2026-11-29T01:00:00',it:[['주방','상판','인조대리석 화이트']],fl:[{i:X.F.img,n:'욕실 타일 시안.jpg',t:'i'}]}};
  const A2=await fopen(ctx,'http://f.test/field/?admin#k='+S.ticket(KEY,{who:'이봄이'})+'&d='+enc(d5),3500);x=await st(A2);const L=X.rows('확정 마감재·도면');
  ok('화면 13: 인트라넷에서 보낸 확정본 v5 → 서버에 저장 · 그 현장 화면이 열림 · 안내',L[L.length-1][2]==='5'&&L[L.length-1][4]==='최윤수'&&L[L.length-1][6]==='이봄이'&&x.ver==='5'&&/확정본 v5 을 고객 화면에 올렸어요/.test(x.toast)&&/인조대리석 화이트/.test(x.spec),JSON.stringify(x).slice(0,300));
  ok('화면 14: 입장권·값은 읽자마자 주소에서 지움 (# 없음 · 쿼리는 admin·s 만)',!/#/.test(x.url)&&/\?admin&s=[A-Za-z0-9]{24}$/.test(x.url),x.url);
  const A3=await fopen(ctx,'http://f.test/field/?admin&s='+code+'#k='+S.ticket(KEY,{who:'이봄이'})+'&d='+enc({v:1,m:'spec',proj:'P-2611-901',spec:{cancel:1}}),3500);x=await st(A3);
  ok('화면 15: 확정 취소를 보내면 고객 화면에서 확정본 내림 (직원 화면에는 ‘아직 확정본이 없어요’)',S.post({a:'site',s:code,pin:'5678'}).spec===null&&x.none&&/확정본을 내렸어요/.test(x.toast),x.toast);
  await C.reload();await wait(2500);x=await st(C);ok('화면 16: 고객 화면 — 확정본이 없으면 칸 자체가 없음',!x.spec&&!x.okBtn&&!/확정 마감재/.test(x.body));
  // 예전 값(# d= auto)도 그대로
  const A4=await fopen(ctx,'http://f.test/field/?admin#k='+S.ticket(KEY,{who:'정진혁'})+'&d='+enc({v:1,m:'auto',proj:'P-2611-901',name:'시험 현장 욕실'}),3000);x=await st(A4);
  ok('화면 17: 예전 값(고객 공유 페이지 열기 · auto)은 그대로 — 같은 현장이 열림',new RegExp('s='+code+'$').test(x.url)&&/시험 현장 욕실/.test(x.body));
  await ctx.close();
  // 옛 서버(v9): 확정본 요청을 모름 · 응답에 spec 없음 → 안내만, 화면은 그대로
  const Y=serverWithSite();const OLD={post:raw=>{const q=typeof raw==='string'?JSON.parse(raw):raw;if(/^spec/.test(q.a||''))return {ok:false,error:'알 수 없는 요청'};const r=Y.S.post(q);delete r.spec;return r}};
  ctx=await fieldCtx(OLD);
  const O1=await fopen(ctx,'http://f.test/field/?admin#k='+Y.S.ticket(KEY,{who:'이봄이'})+'&d='+enc(d5),3500);x=await st(O1);
  ok('화면 18: 서버가 v10 전이면 — ‘Code.gs v10 배포 필요’ 안내만 하고 현장 화면은 그대로 열림',/Code\.gs v10 배포 필요/.test(x.toast)&&/시험 현장 욕실/.test(x.body)&&x.old&&!x.spec,JSON.stringify(x).slice(0,300));
  const O2=await fopen(ctx,'http://f.test/field/?s='+Y.code,800);await O2.fill('#pinIn','5678');await O2.locator('#pf button').first().click();await wait(2200);x=await st(O2);
  ok('화면 19: 옛 서버 + 고객 화면 — 확정본 칸 없이 예전처럼 열림',/시험 현장 욕실/.test(x.body)&&!x.spec&&!x.old&&!/확정 마감재/.test(x.body));
  await ctx.close();
  ok('화면 20: 화면 오류·브라우저 대화상자 없음',errs.length===0,errs.slice(0,4).join(' | '));
  const V9=(FIELD.match(/confirm\(|prompt\(|window\.open\(|alert\(/g)||[]).length;
  ok('화면 21: 소스 — 머리말 v10 · 새 confirm/prompt/alert/window.open 없음 (v9 원본 6개 그대로) · 확정본 구간에 iframe·innerHTML 에 서버 글 그대로 넣기 없음',/현장소통 화면 2026-11-28 v10/.test(FIELD)&&V9===6&&(()=>{const seg=FIELD.slice(FIELD.indexOf('function specHtml()'),FIELD.indexOf('function schedHtml(s)'));return seg.length>1500&&!/<iframe|confirm\(|alert\(|prompt\(|window\.open/.test(seg)})(),V9);
}

(async()=>{const b=await chromium.launch();const P=process.env.PART||'';
  try{if(!P||P==='1')await part1(b);
    if(!P||P==='2')await part2();
    if(!P||P==='3')await part3(b)}
  catch(e){ok('시험 실행 오류 없음',false,e&&e.stack||e)}
  await b.close();const pass=R.filter(Boolean).length;console.log(`\n결과: 통과 ${pass} / 실패 ${R.length-pass} (모두 ${R.length})`);process.exit(R.length-pass?1:0)})();
