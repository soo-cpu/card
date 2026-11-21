// 퇴근 음성 일지 시험 (v0.99-43, 2026-11-21): node intranet/tools/test/voice_log_test.js [index.html]
// 가짜 저장소(mock.js) + 가짜 받아쓰기(dictation)·가짜 자동 정리(sample):
//  가) 받아쓰기·자동 정리 있음: 말하기 → 1분 자동 멈춤 → 더 말하기 → 정리하기 → 맞아요/고칠게요 → 저장 뒤 반영(현장 진행 상황 한 줄·대표 홈 카드)
//  나) 대표 '퇴근 일지 요약' · 채진아·이봄이·일반 직원은 자기 것만(다른 직원 일지 읽기 거절) · 가려진 프로젝트 미반영
//  다) 받아쓰기 없음(null)·거절 / 자동 정리 없음·거절·오류 → 글로 쓰고 네 칸을 손으로 · 민감 숫자 경고 · 삭제 없음 · 휴대폰 폭
if(!process.env.LANG&&!process.env.LC_ALL)process.env.LANG='C.UTF-8';
const {chromium,devices}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'../../..');
const HTML=fs.readFileSync(process.argv[2]||path.join(ROOT,'intranet/index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-kim":{name:"김일반",uid:"u_kim",state:"재직",pos:"사원"},"staff/st-out":{name:"최남수",state:"재직",pos:"영업",intra:"사용 안 함"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},"members/u_kim":{active:true,staffId:"st-kim",name:"김일반"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험마을 8단지",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",approvals:[{amt:1515151,t:"자재"}],cat:"주거",inq:"2026-11-01",addr:"시험마을 8단지 804동 603호",work:"욕실",start:"2026-11-05",acLog:[{id:"ac1",at:T0,by:"u_boss",text:"옛 기록"}],progLog:[{id:"pg0",at:T0,by:"u_boss",byName:"최윤수",kind:"확인",proc:"철거",pct:100,src:"직접"}],updatedAt:T0},"ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "projects/p2":{no:"P-2605-902",title:"지난 현장 주방",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"이봄이",contractAmt:"12000000",cat:"주거",inq:"2026-04-01",work:"주방, 타일",updatedAt:T0},
 "projects/p3":{no:"P-2611-903",title:"다른마을 1동",custName:"박하나",stage:"상담",mgr:"정진혁",contractAmt:"",cat:"주거",inq:"2026-11-10",addr:"다른마을 1동 101호",work:"도배, 장판",updatedAt:T0},
 "projects/p5":{no:"P-2611-905",title:"김일반 담당 현장",custName:"최다섯",stage:"시공",mgr:"김일반",contractAmt:"5000000",cat:"주거",inq:"2026-11-12",work:"도배",updatedAt:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false},kim:{id:"u_kim",name:"김일반",email:"kim@test",isOwner:false}};
// 가짜 받아쓰기: 실제 계약(dictation.d.ts)대로 — start 는 누른 그 자리(사용자 손짓)에서만, 상태 starting→listening→finishing→idle(이유), 거절은 not_granted
const FAKEDICT=`(()=>{const H={p:[],f:[],s:[]};let st='idle';const set=(s,reason)=>{st=s;H.s.forEach(h=>h(reason?{state:s,reason}:{state:s}))};
window.__dict={mode:'ok',starts:0,stops:0,gesture:[],tail:'',lang:'',state:()=>st,say:(t,partial)=>{if(st!=='listening')return false;if(partial)H.p.forEach(h=>h({text:t}));else{H.p.forEach(h=>h({text:''}));H.f.forEach(h=>h({text:t}))}return true}};
window.__MOCKDICT={onPartial:h=>{H.p.push(h);return()=>{}},onFinal:h=>{H.f.push(h);return()=>{}},onState:h=>{H.s.push(h);return()=>{}},active:()=>st!=='idle',
 start:o=>{const D=window.__dict;D.starts++;D.lang=(o&&o.language)||'';const g=!!(navigator.userActivation&&navigator.userActivation.isActive);D.gesture.push(g);if(!g)return Promise.reject({code:'no_gesture',message:'x'});
  if(st==='listening')return Promise.resolve();set('starting');return new Promise((res,rej)=>setTimeout(()=>{if(D.mode==='deny'){set('idle','not_granted');rej({code:'not_granted',message:'x'})}else{set('listening');res()}},80))},
 stop:()=>{const D=window.__dict;D.stops++;if(st==='idle')return Promise.resolve();set('finishing');return new Promise(res=>setTimeout(()=>{if(D.tail){const t=D.tail;D.tail='';H.f.forEach(h=>h({text:t}))}set('idle','stopped');res()},60))}}})();`;
// 가짜 자동 정리: sample.json(prompt, options) — window.__sampleErr 가 있으면 그 코드로 거절
const FAKESAMPLE=`window.__sampleCalls=[];window.__sampleReply=null;window.__sampleErr='';window.__MOCKSAMPLE=Object.assign(async()=>({text:'',truncated:false}),{json:async(prompt,opt)=>{window.__sampleCalls.push({prompt:String(prompt),sig:!!(opt&&opt.signal instanceof AbortSignal)});await new Promise(r=>setTimeout(r,150));if(window.__sampleErr)throw {code:window.__sampleErr,message:'x'};return JSON.parse(JSON.stringify(window.__sampleReply))}});`;
const listOf=pr=>pr.slice(pr.indexOf('[현장 목록] (번호'),pr.lastIndexOf('\n[말한 글]\n')); // 보낸 글에서 현장 목록 부분
const LEAK=/홍길동|박하나|최다섯|1234-5678|12345678|33000000|12000000|5000000|20202020|1515151|원가|마진|804동|603호/; // 고객 이름·전화·금액·원가·주소
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(typeof x==='string'?x:JSON.stringify(x)).replace(/\s+/g,' ').slice(0,360))};const wait=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{
 const b=await chromium.launch();const errs=[],dialogs=[],opens=[];
 const mkCtx=async(opt,seedObj)=>{const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul'},opt));
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|github\.io/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[seedObj||SEED,RULES]);
  const dbNow=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')||'{}'));
  const open=async(who,extra,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});p.on('popup',()=>opens.push(who));
   await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+(extra||'')+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  return {ctx,dbNow,open}};
 const vl=P=>P.evaluate(()=>window.__hfT.vl());
 const step=P=>P.evaluate(()=>{const s=document.querySelector('#vlVeil .sheet');return s?s.dataset.vlstep:null});
 const today=P=>P.evaluate(()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)});
 const closeWin=async P=>{await P.evaluate(()=>{const c=document.querySelector('#vlVeil [data-vlclose]');c&&c.click()});await wait(200)};
 const tryRead=(P,pth)=>P.evaluate(async p=>{const db=await window.claude.use('db');try{const g=await db.doc(p).get();return {ok:true,exists:g.exists}}catch(e){return {ok:false}}},pth);
 const tryWrite=(P,pth)=>P.evaluate(async p=>{const db=await window.claude.use('db');try{await db.doc(p).set({x:1});return true}catch(e){return false}},pth);

 // ================= 가) 받아쓰기·자동 정리 있음 =================
 {const {ctx,dbNow,open}=await mkCtx({viewport:{width:1280,height:900}});
  const A=await open('admin',FAKEDICT+FAKESAMPLE,12000);const J=await open('jjh',FAKEDICT+FAKESAMPLE);
  const D=await today(J);const before=await dbNow();
  ok('정진혁 홈: ‘퇴근 일지 (말로 쓰기)’ 버튼이 보임 + 메뉴 ‘퇴근 일지’',await J.locator('#vlHomeBtn').isVisible()&&await J.locator('nav a[href="#vlog"], a[href="#vlog"]').first().innerText().then(t=>/^퇴근 일지$/.test(t.trim())),await J.locator('a[href="#vlog"]').first().innerText());
  await J.locator('#vlHomeBtn').click();await wait(900);
  ok('버튼을 누르면 화면 안 창(.veil/.sheet)이 열리고 말하기 버튼·글 칸·정리하기가 있음',await J.locator('#vlVeil .sheet').isVisible()&&await J.locator('#vlMic').isVisible()&&await J.locator('#vlText').isVisible()&&await J.locator('#vlVeil [data-vlorg]').isVisible()&&(await step(J))==='say');
  const box=await J.locator('#vlMic').boundingBox();ok('말하기 버튼이 큼 (100px 이상)',box&&box.width>=100&&box.height>=100,box);
  await J.locator('#vlMic').click();await wait(400);
  const d1=await J.evaluate(()=>({st:window.__dict.state(),starts:window.__dict.starts,g:window.__dict.gesture,lang:window.__dict.lang,mic:document.getElementById('vlMic').textContent,left:document.getElementById('vlLeft').textContent}));
  ok('말하기: 누른 그 자리에서 바로 start (손짓 안 · 한국어) → 듣는 중 · ‘멈추기’ · 남은 시간 표시',d1.st==='listening'&&d1.starts===1&&d1.g[0]===true&&d1.lang==='ko-KR'&&d1.mic==='멈추기'&&/남은 시간 (1:00|0:59)/.test(d1.left),d1);
  await J.evaluate(()=>window.__dict.say('오늘 시험마을',true));await wait(100);
  ok('말하는 동안 글이 보임 (임시 글)',await J.locator('#vlPart').innerText()==='오늘 시험마을');
  await J.evaluate(()=>{window.__dict.say(' 오늘 시험마을 8단지 타일 붙였고 자재비 300만 원 더 든다고 함.')});await wait(100);
  ok('확정된 글이 글 칸에 쌓임 (첫 글 앞 빈칸 없음 · 임시 글 지워짐)',await J.locator('#vlText').inputValue()==='오늘 시험마을 8단지 타일 붙였고 자재비 300만 원 더 든다고 함.'&&await J.locator('#vlPart').innerText()==='');
  await wait(1200);const l2=await J.locator('#vlLeft').innerText();ok('남은 시간이 줄어듦',/남은 시간 0:5[5-9]/.test(l2),l2);
  await J.evaluate(()=>{window.__hfT.vlLeft(2);window.__dict.tail=' 없는현장도 다녀옴.'});await wait(2800);
  const d2=await J.evaluate(()=>({st:window.__dict.state(),stops:window.__dict.stops,mic:document.getElementById('vlMic').textContent,msg:document.getElementById('vlMsg').textContent,txt:document.getElementById('vlText').value}));
  ok('60초가 되면 스스로 멈춤 (stop 1번 · 마지막 말까지 받음 · ‘더 말하기’ · 안내)',d2.st==='idle'&&d2.stops===1&&d2.mic==='더 말하기'&&/1분이 됐어요/.test(d2.msg)&&/없는현장도 다녀옴\.$/.test(d2.txt),d2);
  await J.locator('#vlMic').click();await wait(400);await J.evaluate(()=>window.__dict.say(' 내일은 다른마을 실측. 문제는 타일이 모자람.'));await wait(100);
  const d3=await J.evaluate(()=>({st:window.__dict.state(),left:document.getElementById('vlLeft').textContent,txt:document.getElementById('vlText').value}));
  ok('더 말하기: 다시 60초 · 앞 글 뒤에 이어 붙음',d3.st==='listening'&&/남은 시간 (1:00|0:59)/.test(d3.left)&&/다녀옴\. 내일은 다른마을 실측\. 문제는 타일이 모자람\.$/.test(d3.txt),d3);
  // 정리하기 (듣는 중에 눌러도 먼저 멈추고 마지막 말까지 받은 뒤 보냄)
  await J.evaluate(()=>{window.__dict.tail=' 끝.';window.__sampleReply={done:"- 시험마을 8단지 타일 시공",sites:[{no:"P-2611-901",name:"시험마을 8단지",text:"타일 붙임. 자재비 300만 원 더 든다고 함"},{no:"",name:"없는현장",text:"다녀옴"}],next:"다른마을 실측",issue:"타일이 모자람"}});
  await J.locator('#vlVeil [data-vlorg]').click();await wait(120);const stW=await step(J);await wait(900);
  const c1=await J.evaluate(()=>window.__sampleCalls.slice());
  ok('정리하기: ‘정리하는 중’ 뒤 초안 · 자동 정리 1번 요청(멈출 수 있는 신호 포함) · 마지막 말까지 들어감',stW==='wait'&&(await step(J))==='draft'&&c1.length===1&&c1[0].sig&&/문제는 타일이 모자람\. 끝\./.test(c1[0].prompt),[stW,await step(J),c1.length]);
  ok('보낸 글: 볼 수 있는 프로젝트의 번호·현장명만 (고객 이름·전화·금액·주소 없음)',/P-2611-901 \| 시험마을 8단지/.test(c1[0].prompt)&&/P-2611-903 \| 다른마을 1동/.test(c1[0].prompt)&&!LEAK.test(listOf(c1[0].prompt))&&(listOf(c1[0].prompt).match(/^P-/gm)||[]).length===4,listOf(c1[0].prompt).slice(-260));
  const dr=await J.locator('#vlVeil .sheet').innerText();
  ok('초안: 네 칸(한 일·현장·내일 할 일·문제) · 맞춘 현장(번호)과 못 맞춘 이름 구분 · 맞아요/고칠게요 버튼',await J.locator('#vlVeil [data-vlsec]').count()===4&&/프로젝트 맞춤\s*P-2611-901 시험마을 8단지/.test(dr)&&/목록에 없음\s*없는현장/.test(dr)&&/타일이 모자람/.test(dr)&&(await J.locator('#vlVeil [data-vlsave]').innerText()).trim()==='맞아요'&&(await J.locator('#vlVeil [data-vlfix]').innerText()).trim()==='고칠게요',dr);
  const mid=await dbNow();
  ok('저장 전에는 어디에도 반영하지 않음 (저장소 그대로)',JSON.stringify(Object.keys(mid).filter(k=>/vlog/.test(k)))==='[]'&&JSON.stringify(mid['projects/p1'])===JSON.stringify(before['projects/p1'])&&!JSON.stringify(mid).includes('퇴근 일지'));
  await J.locator('#vlVeil [data-vlsave]').click();await wait(2500);
  let db1=await dbNow();const doc1=db1['acct/u_jjh/vlog/'+D],e1=doc1&&doc1.entries&&doc1.entries[0];
  ok('맞아요 → 그대로 저장: acct/u_jjh/vlog/날짜 에 1건 (네 칸·말한 글·음성·자동 정리)',(await step(J))==='done'&&doc1&&doc1.entries.length===1&&e1.done==='- 시험마을 8단지 타일 시공'&&e1.next==='다른마을 실측'&&e1.issue==='타일이 모자람'&&e1.how==='음성'&&e1.ai===true&&!e1.old&&e1.byName==='정진혁'&&/시험마을 8단지 타일/.test(e1.raw)&&e1.sites.length===2&&e1.sites[0].pid==='p1'&&e1.sites[0].no==='P-2611-901'&&e1.sites[1].pid===''&&e1.sites[1].name==='없는현장',e1);
  const idx1=db1['acct/u_jjh/vlog/idx'];ok('날짜별 문제 목록(idx): 오늘 1건 · 문제 1건',idx1&&idx1.days[D].n===1&&idx1.days[D].issue.length===1&&idx1.days[D].issue[0].text==='타일이 모자람'&&idx1.days[D].issue[0].id===e1.id,idx1);
  const pl=k=>((db1[k]||{}).progLog||[]).filter(x=>x.kind==='퇴근 일지');
  const wl=pl('work/all/projects/p1').concat(pl('mine/u_jjh/projects/p1'));
  ok('맞춘 현장 프로젝트 ‘현장 진행 상황’ 기록(progLog)에 한 줄 덧붙임 (퇴근 일지 · 이름 · 날짜 · 내용 · 금액 가림)',wl.length>=1&&wl[0].byName==='정진혁'&&wl[0].d===D&&wl[0].text==='타일 붙임. 자재비 (금액) 더 든다고 함'&&wl[0].vid===e1.id&&!/300/.test(JSON.stringify(wl)),wl[0]);
  ok('못 맞춘 현장·다른 프로젝트에는 반영 없음',!['p2','p3','p5'].some(i=>pl('work/all/projects/'+i).length||pl('mine/u_jjh/projects/'+i).length||pl('projects/'+i).length));
  const doneTxt=await J.locator('#vlDone').innerText();ok('저장 뒤 안내: 현장 1곳 반영 · 문제는 대표에게 알림 · 목록에 없는 현장은 일지에만',/현장 진행 상황 1곳/.test(doneTxt)&&/문제는 대표에게 알렸어요/.test(doneTxt)&&/목록에 없는 현장은 일지에만/.test(doneTxt),doneTxt);
  await wait(9000);db1=await dbNow();const o1=db1['projects/p1'];
  ok('대표 화면이 받아 원본 프로젝트에도 한 줄 (옛 기록·옛 진행 줄·금액 칸 그대로)',pl('projects/p1').length===1&&o1.progLog.some(x=>x.id==='pg0')&&o1.acLog.length===1&&o1.contractAmt==='33000000'&&o1.perf==='순수 인테리어'&&JSON.stringify(o1.approvals)===JSON.stringify(before['projects/p1'].approvals),[pl('projects/p1').length,o1.perf,o1.contractAmt]);
  // 프로젝트 화면
  await closeWin(J);await J.evaluate(()=>{location.hash='#projects'});await wait(500);await J.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1300);
  const hub=await J.locator('#pjHub .hubc[data-pt="prog"]').innerText();ok('프로젝트 화면 ‘현장 진행 상황’ 칸에 퇴근 일지 줄이 보임 (금액 없음)',/퇴근 일지 1건/.test(hub)&&/정진혁: 타일 붙임\. 자재비 \(금액\) 더 든다고 함/.test(hub)&&!/300만/.test(hub),hub.slice(-200));
  await J.evaluate(()=>window.__hfT.closeSheet());await wait(300);

  // 두 번째: 고칠게요
  await J.evaluate(()=>{location.hash='#home'});await wait(600);await J.locator('#vlHomeBtn').click();await wait(1200);
  ok('다시 열면 ‘오늘 쓴 일지 1건’ 안내',/오늘 쓴 일지 1건/.test(await J.locator('#vlVeil .sheet').innerText()));
  await J.locator('#vlText').fill('다른마을 1동 실측했고 내일 견적 보냄');
  await J.evaluate(()=>{window.__sampleReply={done:"실측",sites:[{no:"",name:"어느 마을",text:"실측 끝"}],next:"견적 보내기",issue:"없음"}});
  await J.locator('#vlVeil [data-vlorg]').click();await wait(1100);
  ok('문제가 ‘없음’이면 빈칸으로 봄',(await vl(J)).f.issue===''&&(await step(J))==='draft');
  await J.locator('#vlVeil [data-vlfix]').click();await wait(300);
  ok('고칠게요 → 네 칸을 고치는 화면 (말한 글 보기 · 현장 고르기 목록)',(await step(J))==='edit'&&await J.locator('#vlVeil [data-vlf]').count()===3&&await J.locator('#vlVeil select[data-vlk="pid"]').count()===1&&await J.locator('#vlRaw').count()===1);
  await J.locator('#vlVeil [data-vlf="done"]').fill('다른마을 1동 실측');await J.locator('#vlVeil select[data-vlk="pid"]').selectOption('p3');await wait(300);await J.locator('#vlVeil [data-vls="0"][data-vlk="text"]').fill('실측 끝');
  const mid2=await dbNow();ok('고치는 동안에도 저장소는 그대로',mid2['acct/u_jjh/vlog/'+D].entries.length===1);
  await J.locator('#vlVeil [data-vlsave]').click();await wait(2500);
  let db2=await dbNow();const E2=db2['acct/u_jjh/vlog/'+D].entries,e2=E2[1];
  ok('고친 뒤 저장: 덧붙여 2건 (첫 일지 그대로) · 고친 것은 옛 값(자동 정리 초안)을 남김 · 글로 씀',E2.length===2&&JSON.stringify(E2[0])===JSON.stringify(e1)&&e2.done==='다른마을 1동 실측'&&e2.how==='글'&&e2.sites[0].pid==='p3'&&e2.old&&e2.old.length===1&&e2.old[0].done==='실측'&&e2.old[0].sites[0].name==='어느 마을'&&e2.old[0].sites[0].pid==='',e2);
  const wl3=(((db2['work/all/projects/p3']||{}).progLog)||[]).concat(((db2['mine/u_jjh/projects/p3']||{}).progLog)||[]).filter(x=>x.kind==='퇴근 일지');
  ok('고쳐서 고른 현장(p3)에 한 줄 · 문제 목록은 그대로 1건',wl3.length>=1&&wl3[0].text==='실측 끝'&&db2['acct/u_jjh/vlog/idx'].days[D].n===2&&db2['acct/u_jjh/vlog/idx'].days[D].issue.length===1,wl3[0]);
  await closeWin(J);

  // 대표 홈 카드 + 요약
  await A.evaluate(()=>{location.hash='#home'});await wait(400);await A.evaluate(()=>window.__hfT.vlbLoad());await wait(1200);
  const card=await A.locator('#vlCard').innerText().catch(()=>'');
  ok('대표 홈: ‘퇴근 일지 문제 1건’ 카드 (이름·날짜·문제 글)',/퇴근 일지 문제 1건/.test(card)&&/정진혁 · /.test(card)&&/타일이 모자람/.test(card),card);
  await A.locator('#vlCard [data-vlgo]').first().locator('.t').click();await wait(2500);
  const sum=await A.locator('#view').innerText();const names=await A.locator('#vlvCards .vlcard h2 > span:first-child').allInnerTexts();
  ok('대표 ‘퇴근 일지 요약’: 날짜 기본 오늘 · 직원별 카드 한 화면 · 문제 있는 직원이 맨 위 · 안 쓴 직원 ‘아직 없음’ · 사용 안 함 직원 제외',/퇴근 일지 요약/.test(sum)&&await A.locator('#vlvDate').inputValue()===D&&/^정진혁/.test(names[0])&&names.length===4&&names.some(n=>/^채진아/.test(n))&&names.some(n=>/^이봄이/.test(n))&&names.some(n=>/^김일반/.test(n))&&!/최남수/.test(sum)&&(sum.match(/아직 없음/g)||[]).length>=3,names);
  const jc=await A.locator('#vlvCards .vlcard[data-vluid="u_jjh"]').innerText();
  ok('대표 요약의 정진혁 카드: 2건 · 문제 있음 · 한 일·현장·내일 할 일·문제 · 고친 표시',/2건/.test(jc)&&/문제 있음/.test(jc)&&/시험마을 8단지 타일 시공/.test(jc)&&/P-2611-901 시험마을 8단지/.test(jc)&&/다른마을 실측/.test(jc)&&/타일이 모자람/.test(jc)&&/직원이 고침/.test(jc)&&/쓴 사람 1명 \/ 4명 · 문제 1명/.test(sum),jc.slice(0,300));
  await A.locator('#view [data-vlvd]').first().click();await wait(2000);
  ok('날짜를 하루 전으로 바꾸면 모두 ‘아직 없음’',(await A.locator('#vlvCards .vlcard').count())===4&&((await A.locator('#vlvCards').innerText()).match(/아직 없음/g)||[]).length===8&&await A.locator('#vlvDate').inputValue()<D);
  await A.evaluate(()=>{location.hash='#home'});await wait(700);await A.locator('#vlCard [data-vlseen]').first().click();await wait(1200);
  const db3=await dbNow();ok('대표가 ‘확인’을 누르면 카드에서 빠짐 (확인 표시만 저장 · 일지는 그대로)',await A.locator('#vlCard').count()===0&&db3['acct/u_boss/vlogseen/s']&&!!db3['acct/u_boss/vlogseen/s'].ids[e1.id]&&db3['acct/u_jjh/vlog/'+D].entries.length===2);

  // ================= 나) 다른 직원: 자기 것만 =================
  for(const w of ['cja','bom','kim']){const P=await open(w,FAKEDICT+FAKESAMPLE);const nm=USERS[w].name;
   const rd=await tryRead(P,'acct/u_jjh/vlog/'+D),rd2=await tryRead(P,'acct/u_jjh/vlog/idx'),wr=await tryWrite(P,'acct/u_jjh/vlog/'+D);
   ok(nm+': 다른 직원(정진혁) 일지 읽기·쓰기 거절 (접근 규칙)',rd.ok===false&&rd2.ok===false&&wr===false,[rd,rd2,wr]);
   ok(nm+': 홈에 버튼은 있고 대표용 문제 카드는 없음',await P.locator('#vlHomeBtn').isVisible()&&await P.locator('#vlCard').count()===0);
   await P.evaluate(()=>{location.hash='#vlog'});await wait(2500);const t=await P.locator('#view').innerText();
   ok(nm+': 퇴근 일지 화면은 ‘내 퇴근 일지’ — 본인 카드 하나뿐 (정진혁 글 없음)',/내 퇴근 일지/.test(t)&&await P.locator('#vlvCards .vlcard').count()===1&&new RegExp('^'+nm).test((await P.locator('#vlvCards .vlcard h2').innerText()).trim())&&!/타일이 모자람|시험마을 8단지 타일 시공|정진혁/.test(await P.locator('#vlvCards').innerText())&&!/퇴근 일지 요약/.test(t),t.slice(0,160));
   if(w==='kim'){ // 가려진 프로젝트 미반영
    const L=await P.evaluate(()=>window.__hfT.vlPjs());ok('김일반(일반 직원): 현장 목록은 본인이 볼 수 있는 프로젝트뿐 (p5)',JSON.stringify(L)==='["p5"]',L);
    await P.locator('#view [data-vlopen]').click();await wait(900);await P.locator('#vlText').fill('시험마을 8단지 가서 도배 봤고 김일반 담당 현장 마무리');
    await P.evaluate(()=>{window.__sampleReply={done:"도배 확인",sites:[{no:"P-2611-901",name:"시험마을 8단지",text:"도배 봄"},{no:"P-2611-905",name:"김일반 담당 현장",text:"마무리"}],next:"",issue:""}});
    await P.locator('#vlVeil [data-vlorg]').click();await wait(1100);const pr=listOf(await P.evaluate(()=>window.__sampleCalls.slice(-1)[0].prompt));
    ok('김일반: 보낸 현장 목록에 가려진 프로젝트(p1·p2·p3) 없음',/P-2611-905 \| 김일반 담당 현장/.test(pr)&&!/P-2611-901|P-2605-902|P-2611-903|시험마을|다른마을/.test(pr),pr.slice(-200));
    const f=(await vl(P)).f;ok('김일반: 가려진 프로젝트 번호를 받아도 ‘목록에 없음’으로 둠',f.sites[0].pid===''&&f.sites[1].pid==='p5',f.sites);
    await P.locator('#vlVeil [data-vlfix]').click();await wait(300);const opts=await P.locator('#vlVeil select[data-vlk="pid"]').first().locator('option').allInnerTexts();
    ok('김일반: 고치는 화면의 현장 목록에도 가려진 프로젝트 없음',opts.length===2&&/P-2611-905/.test(opts[1]),opts);
    await P.locator('#vlVeil [data-vlsave]').click();await wait(2500);const dk=await dbNow();const kd=dk['acct/u_kim/vlog/'+D];
    const got=k=>((((dk[k]||{}).progLog)||[]).filter(x=>x.kind==='퇴근 일지'&&x.by==='u_kim'));
    ok('김일반 저장: 본인 프로젝트(p5)에만 한 줄 · 가려진 p1 에는 김일반 줄 없음 · 문제 없으니 문제 목록 0',kd&&kd.entries.length===1&&kd.entries[0].sites[0].pid===''&&(got('work/all/projects/p5').length+got('mine/u_kim/projects/p5').length)>=1&&!['projects/p1','work/all/projects/p1','mine/u_kim/projects/p1'].some(k=>got(k).length)&&dk['acct/u_kim/vlog/idx'].days[D].issue.length===0,[kd&&kd.entries[0].sites,got('work/all/projects/p5').length]);
    await closeWin(P)}
   if(w==='cja'){await P.evaluate(()=>{location.hash='#projects'});await wait(500);await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1300);const h=await P.locator('#pjHub .hubc[data-pt="prog"]').innerText();
    ok('채진아: 프로젝트 ‘현장 진행 상황’의 퇴근 일지 줄은 보임 (현장 내용만 · 문제·내일 할 일 없음)',/퇴근 일지 1건/.test(h)&&!/타일이 모자람|다른마을 실측/.test(h),h.slice(-160));await P.evaluate(()=>window.__hfT.closeSheet())}
   await P.close()}
  const end=await dbNow();const lost=Object.keys(before).filter(k=>end[k]===undefined);
  const shrink=Object.keys(before).filter(k=>end[k]&&Object.keys(before[k]).some(f=>Array.isArray(before[k][f])&&(!Array.isArray(end[k][f])||end[k][f].length<before[k][f].length)));
  ok('삭제 없음: 처음 있던 문서 전부 그대로 있고 줄어든 목록 칸 없음',lost.length===0&&shrink.length===0,[lost,shrink]);
  ok('원본 금액·성과 칸 그대로 (perf·contractAmt·approvals·원가)',['p1','p2','p3','p5'].every(i=>['perf','contractAmt','approvals','estCost'].every(f=>JSON.stringify(end['projects/'+i][f])===JSON.stringify(before['projects/'+i][f])))&&JSON.stringify(end['ppriv/p1'])===JSON.stringify(before['ppriv/p1']));
  const den=[].concat(await J.evaluate(()=>window.__mockDenied),await A.evaluate(()=>window.__mockDenied)).filter(x=>/vlog/.test(x));ok('퇴근 일지 저장 길에 접근 규칙 거절 없음 (지금 규칙 33개 그대로)',den.length===0,den);
  await ctx.close()}

 // ================= 다) 받아쓰기 없음 · 자동 정리 없음 (휴대폰 폭) =================
 {const {ctx,dbNow,open}=await mkCtx(devices['Pixel 7']);const A=await open('admin','',10000);const J=await open('jjh','');const D=await today(J);
  await J.locator('#vlHomeBtn').scrollIntoViewIfNeeded();ok('휴대폰: 홈에 버튼이 보임',await J.locator('#vlHomeBtn').isVisible());
  await J.locator('#vlHomeBtn').click();await wait(1000);
  const note=await J.locator('#vlNoMic').innerText().catch(()=>'');
  ok('받아쓰기 없음(null): 말하기 버튼 숨김 + 큰 글 칸 + ‘휴대폰 자판의 마이크 버튼’ 안내',await J.locator('#vlMic').count()===0&&/휴대폰 자판의 마이크 버튼/.test(note)&&await J.locator('#vlText').isVisible(),note);
  const fit=await J.evaluate(()=>{const s=document.querySelector('#vlVeil .sheet').getBoundingClientRect(),t=document.getElementById('vlText').getBoundingClientRect();return {w:innerWidth,sw:s.right,sl:s.left,sx:document.documentElement.scrollWidth,th:t.height,fs:getComputedStyle(document.getElementById('vlText')).fontSize}});
  ok('휴대폰: 창이 화면 폭 안 · 가로 넘침 없음 · 글 칸 큼(글자 16px)',fit.sl>=0&&fit.sw<=fit.w+1&&fit.sx<=fit.w+1&&fit.th>=140&&fit.fs==='16px',fit);
  await J.locator('#vlText').fill('사무실에서 견적 정리. 고객 계좌 110-123-456789 받음');await wait(200);
  ok('민감 숫자(계좌 꼴): 경고가 바로 보임 (막지는 않음)',/주민번호·계좌·전화번호 같은 숫자가 보여요/.test(await J.locator('#vlWarn').innerText())&&await J.locator('#vlWarn [data-vlsens="mask"]').isVisible());
  await J.locator('#vlVeil [data-vlorg]').click();await wait(400);
  ok('정리하기를 누르면 먼저 경고: ‘숫자 가리고 정리하기’ / ‘그대로 정리하기’',(await step(J))==='say'&&/숫자 가리고 정리하기/.test(await J.locator('#vlWarn').innerText())&&/그대로 정리하기/.test(await J.locator('#vlWarn').innerText()));
  await J.locator('#vlWarn [data-vlsens="mask"]').click();await wait(600);const v1=await vl(J);
  ok('가리고 정리 → 자동 정리 없음(null): 말한 글 그대로 ‘한 일’ 칸에 넣고 네 칸을 손으로 (숫자는 가려짐)',(await step(J))==='edit'&&v1.ai===false&&v1.f.done==='사무실에서 견적 정리. 고객 계좌 (숫자 가림) 받음'&&/이 화면에서는 자동 정리를 쓸 수 없어요/.test(await J.locator('#vlEditMsg').innerText())&&!/110-123/.test(await J.locator('#vlVeil .sheet').innerText()),v1.f);
  await J.locator('#vlVeil [data-vlf="done"]').fill('사무실에서 견적 정리');await J.locator('#vlVeil [data-vladd]').click();await wait(300);await J.locator('#vlVeil select[data-vlk="pid"]').selectOption('p1');await wait(300);
  await J.locator('#vlVeil [data-vls="0"][data-vlk="text"]').fill('전화 통화. 주민번호 900101-1234567');await J.locator('#vlVeil [data-vlf="next"]').fill('견적 보내기');await wait(200);
  await J.locator('#vlVeil [data-vlsave]').click();await wait(500);
  ok('저장 때 민감 숫자(주민번호 꼴)가 있으면 먼저 경고 (아직 저장 안 됨)',(await step(J))==='edit'&&/숫자 가리고 저장/.test(await J.locator('#vlWarn').innerText())&&/그대로 저장/.test(await J.locator('#vlWarn').innerText())&&(await dbNow())['acct/u_jjh/vlog/'+D]===undefined);
  await J.locator('#vlWarn [data-vlsens="keep"]').click();await wait(2500);const d1=await dbNow();const e=((d1['acct/u_jjh/vlog/'+D]||{}).entries||[])[0];
  ok('‘그대로 저장’도 됨 (막지 않음) · 손으로 나눈 일지(ai 아님 · 글) · 현장 줄 반영',(await step(J))==='done'&&e&&e.ai===false&&e.how==='글'&&e.done==='사무실에서 견적 정리'&&e.next==='견적 보내기'&&e.sites[0].pid==='p1'&&!e.old&&!/110-123/.test(JSON.stringify(e)),e);
  await closeWin(J);ok('창 닫기',await J.locator('#vlVeil').count()===0);
  // 대표: 문제가 없으면 카드 없음
  await A.evaluate(()=>window.__hfT.vlbLoad());await wait(1000);ok('문제 칸이 비어 있으면 대표 홈 카드 없음',await A.locator('#vlCard').count()===0);
  // 대표도 쓸 수 있고 요약에 본인 카드가 생김
  await A.locator('#vlHomeBtn').scrollIntoViewIfNeeded();await A.locator('#vlHomeBtn').click();await wait(900);await A.locator('#vlText').fill('대표 일지');await A.locator('#vlVeil [data-vlorg]').click();await wait(500);await A.locator('#vlVeil [data-vlsave]').click();await wait(2000);await closeWin(A);
  await A.evaluate(()=>{location.hash='#vlog'});await wait(2500);const names=await A.locator('#vlvCards .vlcard h2 > span:first-child').allInnerTexts();
  ok('대표 본인이 쓰면 요약에 대표 카드도 나옴 (안 쓰면 안 나옴)',names.length===5&&names.some(n=>/^최윤수/.test(n))&&(await dbNow())['acct/u_boss/vlog/'+D].entries.length===1,names);
  await ctx.close()}

 // ================= 라) 받아쓰기 거절 · 자동 정리 거절·오류 =================
 {const {ctx,dbNow,open}=await mkCtx({viewport:{width:1280,height:900}});const A=await open('admin',FAKEDICT+FAKESAMPLE,10000);const J=await open('jjh',FAKEDICT+FAKESAMPLE);
  await J.evaluate(()=>{window.__dict.mode='deny'});await J.locator('#vlHomeBtn').click();await wait(900);await J.locator('#vlMic').click();await wait(600);
  const n1=await J.locator('#vlNoMic').innerText().catch(()=>'');
  ok('받아쓰기 거절(not_granted): 말하기 버튼 숨기고 글로 쓰기 안내',await J.locator('#vlMic').count()===0&&/마이크를 쓰지 않기로/.test(n1)&&/휴대폰 자판의 마이크 버튼/.test(n1)&&await J.evaluate(()=>window.__hfT.vlDenied())===true,n1);
  await closeWin(J);await J.evaluate(()=>{window.__dict.mode='ok'});await J.locator('#vlHomeBtn').click();await wait(900);
  ok('거절한 뒤에는 다시 묻지 않음 (창을 다시 열어도 버튼 없음 · start 1번뿐)',await J.locator('#vlMic').count()===0&&await J.evaluate(()=>window.__dict.starts)===1);
  // 자동 정리 오류(한 번 실패) → 손으로 · 다음에는 다시 시도함
  await J.locator('#vlText').fill('오늘은 사무실 정리');await J.evaluate(()=>{window.__sampleErr='invalid_json'});await J.locator('#vlVeil [data-vlorg]').click();await wait(1000);
  ok('자동 정리 오류(invalid_json): 말한 글 그대로 네 칸을 손으로 · 다음에는 다시 시도',(await step(J))==='edit'&&(await vl(J)).f.done==='오늘은 사무실 정리'&&/자동 정리를 하지 못했어요/.test(await J.locator('#vlEditMsg').innerText())&&await J.evaluate(()=>window.__hfT.vlNoAI())===false);
  await J.locator('#vlVeil [data-vlback]').click();await wait(300);ok('‘다시 말하기’로 돌아가면 적은 글 그대로',(await step(J))==='say'&&await J.locator('#vlText').inputValue()==='오늘은 사무실 정리');
  await J.evaluate(()=>{window.__sampleErr='not_granted'});await J.locator('#vlVeil [data-vlorg]').click();await wait(1000);const n2=await J.evaluate(()=>window.__sampleCalls.length);
  ok('자동 정리 거절(not_granted): 손으로 나누기 · 이 화면에서는 다시 묻지 않음',(await step(J))==='edit'&&/자동 정리를 쓰지 않기로/.test(await J.locator('#vlEditMsg').innerText())&&await J.evaluate(()=>window.__hfT.vlNoAI())===true&&n2===2);
  await J.locator('#vlVeil [data-vlback]').click();await wait(300);await J.evaluate(()=>{window.__sampleErr=''});await J.locator('#vlVeil [data-vlorg]').click();await wait(800);
  ok('거절 뒤 다시 정리하기를 눌러도 요청을 보내지 않음',(await step(J))==='edit'&&await J.evaluate(()=>window.__sampleCalls.length)===2);
  await J.locator('#vlVeil [data-vlf="done"]').fill('');await J.locator('#vlVeil [data-vlsave]').click();await wait(600);
  ok('네 칸이 모두 비면 저장하지 않음',(await step(J))==='edit'&&Object.keys(await dbNow()).filter(k=>/vlog/.test(k)).length===0);
  await closeWin(J);
  // 정리 중 '그만'
  const B=await open('bom',FAKEDICT+`window.__sampleCalls=[];window.__MOCKSAMPLE=Object.assign(async()=>({}),{json:(p,o)=>new Promise((res,rej)=>{window.__sampleCalls.push(1);o.signal.addEventListener('abort',()=>rej({code:'cancelled',message:'x'}))})});`);
  await B.locator('#vlHomeBtn').click();await wait(900);await B.locator('#vlText').fill('긴 정리 시험');await B.locator('#vlVeil [data-vlorg]').click();await wait(400);const sw=await step(B);await B.locator('#vlVeil [data-vlstop]').click();await wait(400);
  ok('정리 중 ‘그만’: 말하는 화면으로 돌아오고 글은 그대로',sw==='wait'&&(await step(B))==='say'&&await B.locator('#vlText').inputValue()==='긴 정리 시험');
  await B.keyboard.press('Escape');await wait(300);ok('Esc 로 창 닫힘',await B.locator('#vlVeil').count()===0);
  // 대표 미리 보기(직원 화면으로 보기)에서는 저장 안 됨 · 연습 모드에는 버튼 없음
  {await A.evaluate(()=>{location.hash='#preview'});await wait(900);await A.locator('[data-pvgo="st-jung"]').click();await wait(3000);const k0=JSON.stringify(Object.keys(await dbNow()).filter(k=>/vlog/.test(k)));
   await A.evaluate(()=>{location.hash='#home'});await wait(700);await A.locator('#vlHomeBtn').click();await wait(900);await A.locator('#vlText').fill('미리 보기 시험');await A.evaluate(()=>{window.__sampleReply={done:"미리 보기",sites:[],next:"",issue:"문제"}});await A.locator('#vlVeil [data-vlorg]').click();await wait(1000);
   const st0=await step(A);await A.locator('#vlVeil [data-vlsave]').click();await wait(1500);
   ok('미리 보기(대표가 정진혁 화면 보기): 창·초안은 보이지만 ‘맞아요’를 눌러도 저장하지 않음',st0==='draft'&&(await step(A))==='draft'&&JSON.stringify(Object.keys(await dbNow()).filter(k=>/vlog/.test(k)))===k0&&/미리 보기에서는 저장하지 않아요/.test(await A.locator('#vlVeil .sheet').innerText()));
   await closeWin(A);await A.evaluate(()=>{location.hash='#vlog'});await wait(1200);const t=await A.locator('#view').innerText();
   ok('미리 보기: 퇴근 일지 화면은 읽지 않음 · 대표용 문제 카드 없음',/미리 보기에서는 일지를 읽지 않아요/.test(t)&&await A.locator('#vlvCards').count()===0&&await A.locator('#vlCard').count()===0,t.slice(0,120))}
  const P=await ctx.newPage();P.on('pageerror',e=>errs.push('연습: '+e.message));P.on('dialog',d=>{dialogs.push('연습 '+d.type());d.dismiss()});
  await P.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS.jjh)};`+MOCK+`;(()=>{const u=window.claude.use;window.claude.use=async n=>{if(n==='db')throw new Error('no db');return u(n)}})();`);await P.goto('http://hf.test/');await wait(9000);
  ok('연습 모드(저장소 없음): 퇴근 일지 버튼·메뉴 없음',await P.locator('#vlHomeBtn').count()===0&&await P.locator('a[href="#vlog"]').count()===0);
  await ctx.close()}

 // ================= 마) 코드 점검 =================
 const blk=HTML.slice(HTML.indexOf('// ===== 퇴근 음성 일지'),HTML.indexOf('function okAsk(msg,yes,no)'));
 ok('코드: 퇴근 일지 묶음에 alert/confirm/prompt · window.open · iframe · .delete( 없음',blk.length>5000&&!/\balert\(|\bconfirm\(|\bprompt\(|window\.open|<iframe|\.delete\(/.test(blk));
 ok('코드: start 앞에 기다림(await) 없음 (누른 그 자리에서 바로)',/function vlMicTap\(\)\{[^]*?vlDict\.start\(/.test(blk)&&!/await/.test(blk.slice(blk.indexOf('function vlMicTap()'),blk.indexOf('vlDict.start('))));
 ok('화면 오류 0 · 대화상자 0 · 새 창 0',errs.length===0&&dialogs.length===0&&opens.length===0,[errs,dialogs,opens]);
 await b.close();const f=R.filter(x=>!x).length;console.log(`\n결과: 통과 ${R.length-f} / 실패 ${f}`);process.exit(f?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
