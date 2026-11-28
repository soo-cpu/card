// 자동 저장 시험 (2026-11-28, v0.99-53 · 대표 지시 직원 건의 1·2번): node intranet/tools/test/autosave_test.js [index.html]
// 가짜 공용 저장소(mock.js)만 씀 — 실제 운영 데이터에는 아무것도 만들지 않음
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"상담",mgr:"정진혁",contractAmt:"33000000",cat:"주거",inq:"2026-11-01",work:"욕실",addr:"서울 시험동 1",updatedAt:"2026-11-01T00:00:00Z"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",tel:"",addr:"",memo:"처음 메모",createdAt:"2026-11-01T00:00:00Z",updatedAt:"2026-11-01T00:00:00Z"},"cpriv/c1":{tel:"010-1111-2222",addr:"서울 시험동 1",updatedAt:"2026-11-01T00:00:00Z"},
 "catalog/current":{ver:"시험 단가표",updatedAt:"2026-11-01T00:00:00Z",cols:["k","space","proc","name","unit","price","desc","qty","grp"],items:[["t_demo","공통 공사","철거","철거 기본","식",500000,"",1,""],["t_tile","욕실","타일","욕실 타일","m2",40000,"","bath",""]],presets:{"전체 공사":["t_demo","t_tile"]}}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push([v?"통과":"실패",n,x||""]);console.log(v?"통과":"실패",n,v?"":(x||""))};
const SECRET='비밀메모 홍길동 계약 33000000원 전화 01012345678';
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
 for(const [vn,opt,whos] of [['PC',{viewport:{width:1280,height:900}},['jjh','admin','bom','cja']],['Pixel 7',devices['Pixel 7'],['jjh']]]){
  const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul'},opt));await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':r.request().url().includes('plain')?HTML:HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{dialogs.push(vn+' '+who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  const re=async(p,ms)=>{await p.reload();await wait(ms||7000)};
  const ls=p=>p.evaluate(()=>Object.keys(localStorage).filter(k=>/^hf_draft_/.test(k)&&!/__x$/.test(k)).sort());
  const srv=async uid=>Object.keys(await D()).filter(k=>k.startsWith('acct/'+uid+'/draft/')).sort();
  const stat=p=>p.evaluate(()=>{const e=document.getElementById('drStat');return e?e.innerText.trim():''});
  const sheetOf=p=>p.evaluate(()=>{const s=window.__hfT.sheet();return s?s.col+'|'+(s.id||''):''});
  const opn=async(p,col,id)=>{await p.evaluate(([c,i])=>window.__hfT.open(c,i||undefined),[col,id]);await wait(700)};
  const fld=(p,k)=>p.locator('#sheetForm [data-k="'+k+'"]').first();
  const typ=async(p,k,v)=>{const f=fld(p,k);await f.click();await f.fill(v)};
  const val=(p,k)=>p.evaluate(k=>{const e=document.querySelector('#sheetForm [data-k="'+k+'"]');return e?e.value:null},k);
  const bar=p=>p.evaluate(()=>{const e=document.getElementById('draftBar');return e?e.innerText.replace(/\s+/g,' ').trim():''});
  const toasts=p=>p.evaluate(()=>[...document.querySelectorAll('.toast')].map(x=>x.textContent).join(' | '));
  const note=p=>p.evaluate(()=>{const e=document.getElementById('saveNote');return e?e.innerText.replace(/\s+/g,' ').trim():''});
  const wide=p=>p.evaluate(()=>{const s=document.querySelector('#veil .sheet'),n=document.querySelector('#veil .navbar');return document.documentElement.scrollWidth<=window.innerWidth+2&&!!s&&s.scrollWidth<=s.clientWidth+2&&!!n&&n.getBoundingClientRect().right<=window.innerWidth+1});
  const A0=await open('admin',11000); // 대표 화면이 먼저 떠 있어야 직원 사본이 만들어짐
  for(const who of whos){const U=USERS[who],uid=U.id,tag=vn+' '+U.name+': ',mine=k=>'hf_draft_'+uid+'_'+k;
   let P=who==='admin'?A0:await open(who);
   // ── ③ 고친 게 없으면 임시본 없음
   await opn(P,'reports');await fld(P,'issue').click();await fld(P,'tomorrow').click();await wait(who==='jjh'&&vn==='PC'?32000:2500);
   ok(tag+'③ 열어서 눌러만 보고 안 고치면 임시본 없음'+(who==='jjh'&&vn==='PC'?' (30초 넘게 기다림)':''),(await ls(P)).filter(k=>k.startsWith('hf_draft_'+uid+'_')).length===0&&(await srv(uid)).length===0&&(await stat(P))==='',(await ls(P)).join(',')+' / '+(await stat(P)));
   // ── ① 쓰고 2~3초 뒤 임시본 + 표시
   const CASES=who==='jjh'?[['reports','issue','업무보고 '+SECRET],['approvals','body','기안서 본문 '+SECRET],['customers','memo','상담 기록 '+SECRET],['quotes','memo','견적 메모 '+SECRET],['sites','notice','현장 일지 '+SECRET]]:[['reports','issue','업무보고 '+SECRET],['approvals','body','기안서 본문 '+SECRET]];
   for(const [col,k,v] of CASES){if(await sheetOf(P)!==col+'|')await opn(P,col);await typ(P,k,v);await wait(2800);const L=await ls(P),S=await srv(uid),st=await stat(P);
    ok(tag+'① '+col+' 쓰고 3초 안에 임시본(브라우저·서버) + “자동 저장됨 시각” 표시',L.includes(mine(col+'_new'))&&S.includes('acct/'+uid+'/draft/'+mine(col+'_new'))&&/자동 저장됨 \d\d:\d\d/.test(st),L.join(',')+' / '+S.join(',')+' / '+st);
    if(col==='reports'){ok(tag+'표시가 화면 안에 보이고 가로 넘침 없음',await wide(P)&&await P.locator('#drStat').isVisible());await P.screenshot({path:OUT+'/as_'+(vn==='PC'?'pc':'m')+'_'+who+'_stat.png'})}}
   // ── ⑥ 확인 없이 다른 창으로 (불편해요·다른 화면 이동) → 그 직전에 임시 저장
   await opn(P,'as');await typ(P,'content','A/S 접수 '+SECRET);await P.evaluate(()=>window.__hfT.as.fb());await wait(300);
   ok(tag+'⑥ 쓰다가 「불편해요」를 누르면 바로 임시 저장 + 안내',(await ls(P)).includes(mine('as_new'))&&(await sheetOf(P))==='feedback|'&&/임시 저장해 뒀어요/.test(await toasts(P)),(await ls(P)).join(',')+' / '+await toasts(P));
   await typ(P,'body','불편한 점 '+SECRET);await P.evaluate(()=>window.__hfT.open('customers','c1'));await wait(300);
   ok(tag+'⑥ 쓰다가 다른 창으로 바로 넘어가도 임시 저장',(await ls(P)).includes(mine('feedback_new')),(await ls(P)).join(','));
   await P.evaluate(()=>window.__hfT.closeSheet());await wait(300);
   // ── ② 새로 열면 복구 안내 → 이어서 쓰기 / 버리기
   if(who!=='admin'){await re(P)}else{await re(P,11000)}
   await opn(P,'reports');await wait(900);const b1=await bar(P);
   ok(tag+'② 다시 열면 “작성 중이던 내용이 있습니다. 이어서 쓰시겠어요?”',/작성 중이던 내용이 있습니다\. 이어서 쓰시겠어요\?/.test(b1)&&/이어서 쓰기/.test(b1)&&/버리기/.test(b1),b1);
   await P.locator('#draftBar [data-draft="use"]').click();await wait(600);
   ok(tag+'② [이어서 쓰기] → 쓰던 글이 돌아옴',(await val(P,'issue'))==='업무보고 '+SECRET&&(await bar(P))==='',String(await val(P,'issue')));
   await opn(P,'approvals');await wait(900);const b2=await bar(P);await P.locator('#draftBar [data-draft="drop"]').click().catch(()=>{});await wait(900);
   ok(tag+'② [버리기] → 임시본만 정리',/이어서 쓰시겠어요/.test(b2)&&!(await ls(P)).includes(mine('approvals_new'))&&!(await srv(uid)).includes('acct/'+uid+'/draft/'+mine('approvals_new')),(await ls(P)).join(','));
   await P.evaluate(()=>window.__hfT.closeSheet());await wait(200);await opn(P,'approvals');await wait(900);ok(tag+'② 버린 뒤에는 다시 안 뜸',(await bar(P))==='');
   if(who!=='jjh'){await P.evaluate(()=>window.__hfT.closeSheet());await wait(200);if(who!=='admin')await P.close();continue}
   // ── ④ 빈칸 경고 뒤에도 임시본·입력 그대로
   await typ(P,'body','제목 없이 쓴 기안 '+SECRET);await wait(600);await P.locator('#saveSheet').click();await wait(900);
   ok(tag+'④ 빈칸 경고(제목 없음) 뒤에도 임시본이 남고 입력 그대로',/칸을 채워 주세요/.test(await toasts(P))&&(await ls(P)).includes(mine('approvals_new'))&&(await val(P,'body'))==='제목 없이 쓴 기안 '+SECRET&&(await sheetOf(P))==='approvals|',(await ls(P)).join(',')+' / '+await toasts(P));
   // ── ④ 저장 실패 (가짜 저장소가 거절) → 원인별 문구 + 다시 시도
   await opn(P,'reports');await wait(700);if(await P.locator('#draftBar [data-draft="use"]').count()){await P.locator('#draftBar [data-draft="use"]').click();await wait(500)}
   await typ(P,'tomorrow','내일 할 일 '+SECRET);
   for(const [name,fail,rx] of [['로그인 풀림',{message:'permission denied 홍길동 33000000'},/로그인이 풀렸어요/],['용량',{code:'invalid_argument',message:'document too large'},/내용이 너무 커요/],['그 밖',{code:'internal',message:'boom'},/저장하지 못했어요/]]){
    await P.evaluate(f=>{window.__MOCKFAIL={'mine/':f,'reports/':f}},fail);await P.locator('#saveSheet').click();await wait(1200);const nt=await note(P);
    ok(tag+'④ 저장 실패('+name+'): “저장 안 됨” + 원인 안내 + [다시 시도], 창·입력·임시본 그대로',/저장 안 됨/.test(nt)&&rx.test(nt)&&/다시 시도/.test(nt)&&(await sheetOf(P))==='reports|'&&(await val(P,'tomorrow'))==='내일 할 일 '+SECRET&&(await ls(P)).includes(mine('reports_new')),nt);
    ok(tag+'④ ('+name+') 견적이 아닌 화면에 ‘견적 항목은 임시 저장’ 문구 없음',!/견적 항목/.test(nt),nt)}
   await ctx.setOffline(true);await P.evaluate(()=>{window.__MOCKFAIL={'':{message:'Failed to fetch'}}});await P.locator('#saveNote [data-sn-retry]').click();await wait(1500);
   {const nt=await note(P);ok(tag+'④ 저장 실패(연결 끊김): “인터넷 연결이 끊겼어요”',/인터넷 연결이 끊겼어요/.test(nt)&&/다시 시도/.test(nt),nt);await P.screenshot({path:OUT+'/as_'+(vn==='PC'?'pc':'m')+'_fail.png'})}
   await ctx.setOffline(false);await P.evaluate(()=>{window.__MOCKFAIL=null});const d0=await D();await P.locator('#saveNote [data-sn-retry]').click();await wait(2500);const d1=await D();
   {const made=Object.keys(d1).filter(k=>/reports\//.test(k)&&!d0[k]);
    ok(tag+'④ [다시 시도] → 저장됨 (쓰던 글 그대로 들어감)',made.length>=1&&made.some(k=>JSON.stringify(d1[k]).includes('내일 할 일'))&&(await sheetOf(P))==='',made.join(','));
    ok(tag+'⑤ 저장 성공 뒤 임시본 정리 (브라우저·서버)',!(await ls(P)).includes(mine('reports_new'))&&!(await srv(uid)).includes('acct/'+uid+'/draft/'+mine('reports_new')),(await ls(P)).join(',')+' / '+(await srv(uid)).join(','))}
   // ── ‘저장 안 함’ → 임시본 정리
   await opn(P,'sites');await wait(700);if(await P.locator('#draftBar [data-draft="drop"]').count()){await P.locator('#draftBar [data-draft="drop"]').click();await wait(500)}
   await typ(P,'notice','버릴 글 '+SECRET);await wait(2500);const hadS=(await ls(P)).includes(mine('sites_new'));await P.locator('#closeSheet').click();await wait(500);const asked=await P.locator('#navAsk').count();await P.locator('#navAsk [data-nav="drop"]').click();await wait(1200);
   ok(tag+'닫기 → ‘저장 안 함’ → 임시본 정리, 다시 열어도 안 뜸',hadS&&asked===1&&!(await ls(P)).includes(mine('sites_new'))&&!(await srv(uid)).includes('acct/'+uid+'/draft/'+mine('sites_new')),(await ls(P)).join(','));
   await opn(P,'sites');await wait(900);ok(tag+'‘저장 안 함’ 뒤 다시 열면 안내 없음',(await bar(P))==='');await P.evaluate(()=>window.__hfT.closeSheet());
   // ── 이미 있는 문서(고객 카드) 고치다 꺼짐 → 복구 · 같은 창을 다시 그려도 고친 칸 그대로
   await opn(P,'customers','c1');await wait(800);await typ(P,'memo','고객 상담 추가 메모 '+SECRET);await P.evaluate(()=>window.__hfT.as.redraw());await wait(300);
   ok(tag+'같은 창을 다시 그려도(drawSheet) 고치던 칸이 사라지지 않음',(await val(P,'memo'))==='고객 상담 추가 메모 '+SECRET,String(await val(P,'memo')));
   await wait(2500);ok(tag+'있는 문서도 임시본이 문서별로 생김',(await ls(P)).includes(mine('customers_c1')));
   // ── ⑥ lockScreen 직전 임시 저장 + ⑦ 오프라인에서 쓴 글 같은 기기 복구
   await opn(P,'quotes');await wait(600);if(await P.locator('#draftBar [data-draft="drop"]').count()){await P.locator('#draftBar [data-draft="drop"]').click();await wait(500)}
   await ctx.setOffline(true);await P.evaluate(()=>{window.__MOCKFAIL={'':{message:'Failed to fetch'}}});await typ(P,'memo','오프라인에서 쓴 견적 메모 '+SECRET);await wait(2800);
   {const st=await stat(P);ok(tag+'⑦ 오프라인: “자동 저장 안 됨 — 이 기기에만 보관” 표시, 브라우저에는 남음',/자동 저장 안 됨 — 이 기기에만 보관/.test(st)&&(await ls(P)).includes(mine('quotes_new'))&&!(await srv(uid)).includes('acct/'+uid+'/draft/'+mine('quotes_new')),st);if(vn!=='PC')ok(tag+'⑦ 휴대폰에서도 표시가 보이고 넘침 없음',await wide(P)&&await P.locator('#drStat').isVisible());await P.screenshot({path:OUT+'/as_'+(vn==='PC'?'pc':'m')+'_offline.png'})}
   await P.evaluate(()=>{window.__MOCKFAIL=null});await ctx.setOffline(false);await wait(2500);
   ok(tag+'⑦ 연결이 돌아오면(online) 임시본을 서버에 다시 올림',(await srv(uid)).includes('acct/'+uid+'/draft/'+mine('quotes_new'))&&/자동 저장됨/.test(await stat(P)),(await srv(uid)).join(',')+' / '+await stat(P));
   await typ(P,'work','잠기기 직전 '+SECRET);await P.evaluate(()=>window.__hfT.as.lock('시험','잠금'));await wait(200);
   ok(tag+'⑥ 화면이 잠기기(lockScreen) 직전에 쓰던 글 임시 저장',await P.evaluate(k=>{try{return JSON.parse(localStorage.getItem(k)).data.work.indexOf('잠기기 직전')===0}catch(e){return false}},mine('quotes_new')));
   await ctx.setOffline(true);await wait(300);await ctx.setOffline(false);await re(P);
   await opn(P,'quotes');await wait(900);const bq=await bar(P);if(await P.locator('#draftBar [data-draft="use"]').count())await P.locator('#draftBar [data-draft="use"]').click();await wait(600);
   ok(tag+'⑦ 다시 열면 같은 기기에서 복구 (잠기기 직전 글 포함)',/이어서 쓰시겠어요/.test(bq)&&(await val(P,'memo'))==='오프라인에서 쓴 견적 메모 '+SECRET&&String(await val(P,'work')).indexOf('잠기기 직전')===0,bq+' / '+await val(P,'memo'));
   await opn(P,'customers','c1');await wait(900);{const bc=await bar(P);if(await P.locator('#draftBar [data-draft="use"]').count())await P.locator('#draftBar [data-draft="use"]').click();await wait(600);
    ok(tag+'있는 문서(고객 카드)도 다시 열면 복구 — 고친 칸만 돌아옴',/이어서 쓰시겠어요/.test(bc)&&(await val(P,'memo'))==='고객 상담 추가 메모 '+SECRET&&(await val(P,'name'))==='홍길동',bc+' / '+await val(P,'memo'))}
   await P.evaluate(()=>window.__hfT.closeSheet());await wait(200);
   // ── ⑧ 퇴근 일지
   await P.evaluate(()=>{window.__hfT.as.vlOpen()});await wait(1200);await P.locator('#vlText').click();await P.locator('#vlText').fill('퇴근 일지 '+SECRET);await wait(2800);
   ok(tag+'⑧ 퇴근 일지: 쓰는 대로 임시본 + 표시',(await ls(P)).includes(mine('vlog_new'))&&(await srv(uid)).includes('acct/'+uid+'/draft/'+mine('vlog_new'))&&/자동 저장됨 \d\d:\d\d/.test(await P.locator('#vlVeil .drstat').innerText()),(await ls(P)).join(','));
   await re(P);await P.evaluate(()=>{window.__hfT.as.vlOpen()});await wait(1500);const vb=await P.locator('#vlOfferBar').innerText().catch(()=>'');await P.locator('#vlOfferBar [data-vldr="use"]').click().catch(()=>{});await wait(500);
   ok(tag+'⑧ 퇴근 일지: 다시 열면 안내 → [이어서 쓰기]로 글이 돌아옴',/이어서 쓰시겠어요/.test(vb)&&(await P.locator('#vlText').inputValue())==='퇴근 일지 '+SECRET,vb);
   await P.evaluate(()=>{window.__hfT.as.vl().sensOk=true});await P.locator('[data-vlorg]').click();await wait(1500);await P.evaluate(()=>{window.__MOCKFAIL={'acct/':{message:'Failed to fetch'}}});await P.locator('[data-vlsave]').first().click();await wait(1200);
   ok(tag+'⑧ 퇴근 일지: 저장 실패해도 창·글·임시본 그대로',(await P.locator('#vlVeil').count())===1&&(await ls(P)).includes(mine('vlog_new'))&&/저장 안 됨/.test(await toasts(P)),await toasts(P));
   await P.evaluate(()=>{window.__MOCKFAIL=null;window.__hfT.as.vl().sensOk=true});await P.locator('[data-vlsave]').first().click();await wait(2500);
   ok(tag+'⑧ 퇴근 일지: 저장 성공 뒤 임시본 정리',/저장했어요/.test(await P.locator('#vlVeil').innerText().catch(()=>''))&&!(await ls(P)).includes(mine('vlog_new'))&&!(await srv(uid)).includes('acct/'+uid+'/draft/'+mine('vlog_new')),(await ls(P)).join(',')+' / '+(await srv(uid)).join(','));
   await P.locator('#vlVeil [data-vlclose]').first().click().catch(()=>{});await wait(300);
   // ── ⑧ 간편 견적 상담 › 고객 정보 등록 칸
   await P.evaluate(()=>{location.hash='#consult'});await wait(1500);await P.locator('#cn_name').fill('김시험');await P.locator('#cn_tel').fill('010-5555-6666');await P.locator('#cn_addr').fill('시험아파트 101-202');await P.locator('#cn_req').fill('거실 확장 요청');await wait(2800);
   ok(tag+'⑧ 고객 정보 등록 칸: 쓰는 대로 임시본 + 표시',(await ls(P)).includes(mine('csnew_new'))&&(await srv(uid)).includes('acct/'+uid+'/draft/'+mine('csnew_new'))&&/자동 저장됨/.test(await P.locator('#view [data-asstat]').first().innerText()),(await ls(P)).join(','));
   await re(P);await P.evaluate(()=>{location.hash='#consult'});await wait(2000);const cb=await P.locator('#csnBar').innerText().catch(()=>'');await P.locator('#csnBar [data-csndr="use"]').click().catch(()=>{});await wait(500);
   ok(tag+'⑧ 고객 정보 등록 칸: 다시 열면 안내 → [이어서 쓰기]',/이어서 쓰시겠어요/.test(cb)&&(await P.locator('#cn_name').inputValue())==='김시험'&&(await P.locator('#cn_addr').inputValue())==='시험아파트 101-202'&&(await P.locator('#cn_req').inputValue())==='거실 확장 요청',cb);
   await P.locator('[data-cs="new"]').click();await wait(3500);{const d=await D();
    ok(tag+'⑧ 고객 정보 등록 성공 뒤 임시본 정리',Object.keys(d).some(k=>/projects\//.test(k)&&JSON.stringify(d[k]).includes('김시험'))&&!(await ls(P)).includes(mine('csnew_new'))&&!(await srv(uid)).includes('acct/'+uid+'/draft/'+mine('csnew_new')),(await ls(P)).join(',')+' / '+await toasts(P))}
   await P.evaluate(()=>{location.hash='#home'});await wait(800);
   // ── ⑨ 오류 기록
   await P.evaluate(()=>{for(let i=0;i<50;i++)window.__hfT.as.errLog('화면 오류',{code:'t'+i,message:'시험 오류 '+i+' 홍길동 33000000'},'test');return window.__hfT.as.errFlush()});await wait(1500);
   {const d=await D(),keys=Object.keys(d).filter(k=>k.startsWith('acct/'+uid+'/errlog/')),all=keys.flatMap(k=>d[k].list||[]),js=JSON.stringify(keys.map(k=>d[k]));
    ok(tag+'⑨ 오류 기록이 본인 칸에 남음 (저장 실패·임시 저장 실패)',all.some(x=>x.what==='저장 실패'&&x.scr==='reports')&&all.some(x=>x.kind==='auth')&&all.some(x=>x.kind==='big')&&all.some(x=>x.kind==='net'&&x.on===false),JSON.stringify(all.slice(0,4)));
    ok(tag+'⑨ 오류 기록에 입력 내용·이름·금액 없음',!/비밀|홍길동|33000000|01012345678|내일 할 일|김시험/.test(js),js.slice(0,400));
    ok(tag+'⑨ 하루 30건까지만',all.length<=30&&all.length>=10,String(all.length))}
   {const r=await P.evaluate(async()=>{const db=await window.claude.use('db');const o=[];for(const f of [()=>db.doc('acct/u_bom/errlog/2026-11-28').get(),()=>db.collection('acct/u_boss/errlog').get(),()=>db.collection('acct/u_bom/draft').get()]){try{await f();o.push('읽힘')}catch(e){o.push('거절')}}return o.join(',')});
    ok(tag+'⑨ 직원은 남의 오류 기록·임시본을 못 읽음',r==='거절,거절,거절',r)}
   await P.evaluate(()=>{location.hash='#staff'});await wait(900);ok(tag+'⑨ 직원 화면에 오류 기록 칸 없음',(await P.locator('#errBox').count())===0);
   await P.close()}
  // 대표 화면: 오류 기록 목록
  await A0.evaluate(()=>{location.hash='#staff'});await wait(1200);const eb=A0.locator('#errBox');
  ok(vn+' 대표: 인사 관리 화면에 ‘오류·저장 실패 기록’ (접혀 있음)',(await eb.count())===1&&!(await eb.evaluate(e=>e.open)));
  await A0.locator('#errBox summary').click();await wait(1800);{const t=await eb.innerText();ok(vn+' 대표: 펼치면 직원 오류가 보이고 입력 내용은 없음',/정진혁/.test(t)&&/저장 실패/.test(t)&&/로그인·권한|연결 끊김|용량/.test(t)&&!/비밀|홍길동|33000000/.test(t),t.slice(0,300));await A0.screenshot({path:OUT+'/as_'+(vn==='PC'?'pc':'m')+'_errbox.png',fullPage:false})}
  if(vn==='PC'){
   // ── ⑩ 직원 화면 미리 보기: 임시본 안 남음
   await A0.evaluate(()=>{location.hash='#preview'});await wait(1000);const l0=(await ls(A0)).join(','),s0=Object.keys(await D()).filter(k=>/\/draft\//.test(k)).join(',');
   await A0.locator('[data-pvgo="st_bom"]').click();await wait(2500);await opn(A0,'reports');await typ(A0,'issue','미리 보기에서 쓴 글').catch(()=>{});await wait(3200);
   ok('⑩ 미리 보기: 임시본이 브라우저·서버 어디에도 안 생기고 표시도 없음',(await ls(A0)).join(',')===l0&&Object.keys(await D()).filter(k=>/\/draft\//.test(k)).join(',')===s0&&(await stat(A0))===''&&(await bar(A0))==='',(await ls(A0)).join(','));
   // ── ⑩ 연습 모드 (claude.ai 밖): 서버·직원 계정 칸에 임시본 없음
   const X=await ctx.newPage();X.on('pageerror',e=>errs.push('연습 모드: '+e.message));await X.goto('http://hf.test/plain');await wait(8000);const lx0=(await ls(X)).join(',');const dx0=JSON.stringify(await D());
   await X.evaluate(()=>{location.hash='#reports'});await wait(900);await X.locator('[data-new="reports"]').first().click();await wait(800);await X.locator('#sheetForm [data-k="issue"]').first().click();await X.locator('#sheetForm [data-k="issue"]').first().fill('연습 모드에서 쓴 글');await wait(3200);
   {const lx=await ls(X);ok('⑩ 연습 모드: 공용 저장소·직원 계정 칸에 임시본 없음 (계정 없는 이 브라우저 칸에만)',JSON.stringify(await D())===dx0&&lx.filter(k=>lx0.split(',').indexOf(k)<0).every(k=>/^hf_draft_local_/.test(k)),lx.join(','))}
   await X.close()}
  await ctx.close()}
 ok('브라우저 대화상자(alert/confirm/prompt) 0번',dialogs.length===0,dialogs.join(','));ok('화면 오류 0건',errs.length===0,errs.join(' | '));
 const bad=R.filter(r=>r[0]==="실패");console.log('\n합계',R.length,'통과',R.length-bad.length,'실패',bad.length);bad.forEach(r=>console.log(' 실패:',r[1],r[2]));await b.close();process.exit(bad.length?1:0)})();
