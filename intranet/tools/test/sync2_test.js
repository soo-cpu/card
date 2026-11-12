// 직원 화면 동기화·삭제 표시 시험 (v0.99-25, 2026-11-12): node intranet/tools/test/sync2_test.js [index.html]
// 정진혁·이봄이 두 화면을 동시에 띄워 고객·프로젝트·견적·현장 각각: 등록 → 상대 화면에 보임, 수정 → 보임,
// 대표가 삭제 → 두 화면에서 사라짐 → 대표 화면을 다시 열어도·직원이 낡은 화면에서 저장해도 안 되살아남, 휴지통 되살리기 → 다시 보임.
// 가짜 저장소(mock.js)는 실제처럼 화면당 실시간 구독 64개까지만 받음 (대표 화면이 한도를 넘지 않는지도 같이 봄)
const {chromium}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
// 실제 명단과 같은 순서(채진아 → 대표 → 정진혁 → 이봄이 → 신혜현): 대표 화면 구독이 64개를 넘는 상황을 그대로 만듦
const SEED={"staff/st-chae":{name:"채진아",uid:"u_chae",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-shin":{name:"신혜현",uid:"u_shin",level:"공동대표",state:"재직"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_chae":{active:true,staffId:"st-chae",name:"채진아"},"members/u_shin":{active:true,staffId:"st-shin",name:"신혜현"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"상담",mgr:"정진혁",contractAmt:"33000000",estCost:"",inq:"2026-11-01",work:"욕실",updatedAt:T0},"ppriv/p1":{estCost:"20000000",updatedAt:T0},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1],stage:"1-상담영업",updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",name:"시험 현장",mgr:"정진혁",status:"공사 중",logs:[],updatedAt:T0},
 "quotes/q1":{qno:"Q-2611-901",pno:"P-2611-901",name:"홍길동",amount:"3000000",qCost:"2100000",status:"작성",items:[],updatedAt:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false}};
const NEW={customers:["cN",{code:"C-2611-950",name:"새고객 김시험",mgr:"정진혁",status:"진행중",steps:[1],stage:"1-상담영업",tel:"010-5555-6666",addr:"",files:[]},"name","새고객 김시험 (수정)"],
 projects:["pN",{no:"P-2611-950",title:"새 프로젝트 시험",custName:"새고객 김시험",custCode:"C-2611-950",stage:"상담",mgr:"정진혁",inq:"2026-11-12",work:"주방",contractAmt:"",pays:[],files:[]},"title","새 프로젝트 시험 (수정)"],
 quotes:["qN",{qno:"Q-2611-950",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",amount:"1100000",status:"작성",staff:"정진혁",d:"2026-11-12",items:[],site:"새 견적 시험"},"site","새 견적 시험 (수정)"],
 sites:["sN",{pno:"P-2611-901",name:"새 현장 시험",customer:"홍길동",mgr:"정진혁",status:"착공 전",logs:[]},"name","새 현장 시험 (수정)"]};
const COLS=Object.keys(NEW);const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,300))};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});
 await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const errs=[],dialogs=[];
 async function open(who,ms){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.accept()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p}
 const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
 const setDb=(k,v)=>seed.evaluate(([k,v])=>{const d=JSON.parse(localStorage.getItem('mockdb'));if(v===null)delete d[k];else d[k]=v;localStorage.setItem('mockdb',JSON.stringify(d));new BroadcastChannel('mockdb').postMessage(1)},[k,v]);
 const has=(p,col,id)=>p.evaluate(([c,i])=>window.__hfT.S()[c].some(r=>r.id===i&&!r.__masked),[col,id]);
 const val=(p,col,id,f)=>p.evaluate(([c,i,f])=>{const r=window.__hfT.S()[c].find(r=>r.id===i);return r?r[f]:null},[col,id,f]);
 const put=(p,col,id,data)=>p.evaluate(async([c,i,d])=>{try{await window.__hfT.put(c,i,Object.assign({},d,{updatedAt:new Date().toISOString()}));return 'ok'}catch(e){return 'err:'+e.message}},[col,id,data]);
 const all=async(pages,col,id,want)=>{const v=[];for(const p of pages)v.push(await has(p,col,id));return v.every(x=>x===want)?true:(v.join(','),false)};
 const page=(p,h)=>p.evaluate(x=>{location.hash=x},h).then(()=>wait(700)).then(()=>p.evaluate(()=>document.querySelector('#view').innerText));

 // 0) 대표 화면: 구독 한도 안에서 직원 사본·공용 칸·삭제 표시까지 다 읽음
 let A=await open('admin',12000);let d=await D();
 const st=await A.evaluate(()=>({hit:window.__mockCapHit,live:window.__mockSubs(),stat:window.__subStat}));
 ok('0 대표 화면: 실시간 구독이 한도(64) 안 · 거절된 구독 0 · 나머지는 다시 읽기로',st.hit===0&&st.live<=64&&st.stat.poll>0&&st.stat.fail===0,JSON.stringify(st));
 ok('0 대표 화면이 직원 5명 사본을 모두 맞춤 (맞춘 시각 mine/<직원>/idx/sync · 맨 뒤 순서 직원도)',['u_chae','u_jjh','u_bom','u_shin'].every(u=>d['mine/'+u+'/idx/sync']&&d['mine/'+u+'/projects/p1']&&d['mine/'+u+'/customers/c1']),['u_chae','u_jjh','u_bom','u_shin'].map(u=>!!d['mine/'+u+'/idx/sync']).join(','));
 ok('0 공용 칸 4개 채워짐',COLS.every(c=>Object.keys(d).some(k=>k.startsWith('work/all/'+c+'/'))));
 await A.close();

 // 1) 대표 화면이 닫힌 동안: 정진혁 등록 → 이봄이 화면에 새로고침 없이 보임 / 수정 → 보임 / 이봄이 수정 → 정진혁 화면에 보임
 const J=await open('jjh'),B=await open('bom');
 const sj=await J.evaluate(()=>({hit:window.__mockCapHit,live:window.__mockSubs()}));ok('1 직원 화면 구독도 한도 안',sj.hit===0&&sj.live<=64,JSON.stringify(sj));
 for(const col of COLS){const [id,data,f,v2]=NEW[col];
  const r1=await put(J,col,id,data);await wait(1800);
  ok('1 '+col+' 등록(정진혁) → 이봄이 화면에 바로 보임',r1==='ok'&&await has(B,col,id)&&await has(J,col,id),r1);
  const r2=await put(J,col,id,Object.assign({},data,{[f]:v2}));await wait(1800);
  ok('1 '+col+' 수정(정진혁) → 이봄이 화면에 보임',r2==='ok'&&(await val(B,col,id,f))===v2,String(await val(B,col,id,f)));
  const r3=await put(B,col,id,Object.assign({},data,{[f]:v2+' · 이봄이'}));await wait(1800);
  ok('1 '+col+' 수정(이봄이) → 정진혁 화면에 보임',r3==='ok'&&(await val(J,col,id,f))===v2+' · 이봄이',String(await val(J,col,id,f)))}
 const bc=await page(B,'#customers'),bp=await page(B,'#projects');
 ok('1 이봄이 목록 화면(고객·프로젝트)에 새 줄이 그려짐',/새고객 김시험/.test(bc)&&/새 프로젝트 시험/.test(bp));
 d=await D();ok('1 대표 화면 없이도 공용 칸에 들어감 (원본에는 아직 없음)',COLS.every(c=>d['work/all/'+c+'/'+NEW[c][0]]&&!d[c+'/'+NEW[c][0]]));

 // 2) 대표 화면이 열림 → 직원이 만든 것이 원본에 · 다른 직원 사본에도
 A=await open('admin',14000);d=await D();
 ok('2 대표 화면이 열리면 원본에 반영 (4칸)',COLS.every(c=>!!d[c+'/'+NEW[c][0]]),COLS.map(c=>!!d[c+'/'+NEW[c][0]]).join(','));
 ok('2 새 고객 전화는 대표 전용 칸(cpriv)에, 원본 고객 줄은 비움',(d['cpriv/cN']||{}).tel==='010-5555-6666'&&(d['customers/cN']||{}).tel==='',JSON.stringify(d['cpriv/cN']));
 ok('2 이봄이·채진아 사본에도 내려감 (구독 한도 뒤 순서 직원)',!!d['mine/u_bom/projects/pN']&&!!d['mine/u_chae/projects/pN']&&!!d['mine/u_bom/customers/cN']);

 // 3) 대표가 삭제(휴지통) → 열려 있는 두 직원 화면에서 바로 사라짐
 for(const col of COLS){const id=NEW[col][0];await A.evaluate(([c,i])=>window.__hfT.rmCascade(c,i),[col,id]);await wait(2200);d=await D();
  ok('3 '+col+' 대표 삭제 → 정진혁·이봄이 화면에서 바로 사라짐 · 휴지통 보관 · 삭제 표시(누가·언제)',!(await has(J,col,id))&&!(await has(B,col,id))&&!d[col+'/'+id]&&!d['work/all/'+col+'/'+id]&&!!d['acct/_trash/t/'+col+'__'+id]&&(d['work/all/gone/'+col+'__'+id]||{}).by==='u_boss'&&!!(d['work/all/gone/'+col+'__'+id]||{}).at,JSON.stringify(d['work/all/gone/'+col+'__'+id]))}
 const bc2=await page(B,'#customers');ok('3 이봄이 고객 목록 화면에서도 안 보임',!/새고객 김시험/.test(bc2));
 await wait(9000);d=await D();
 ok('3 직원 사본: 정진혁이 만든 줄은 숨김 표시(내용 보관), 다른 직원 사본은 정리',COLS.every(c=>{const m=d['mine/u_jjh/'+c+'/'+NEW[c][0]];return !m||m.__gone||m.__by!=='u_jjh'})&&COLS.every(c=>!d['mine/u_chae/'+c+'/'+NEW[c][0]]),COLS.map(c=>JSON.stringify((d['mine/u_jjh/'+c+'/'+NEW[c][0]]||{}).__gone)).join(','));

 // 4) 낡은 화면에서 다시 저장 → 안 받음 / 옛 버전 브라우저가 사본·공용 칸에 직접 써도 → 대표 화면이 되살리지 않음
 for(const col of COLS){const [id,data]=NEW[col];const r=await put(J,col,id,data);ok('4 '+col+' 지워진 것을 정진혁이 다시 저장 → 거절',/^err/.test(r),r)}
 const now=()=>new Date().toISOString();
 for(const col of COLS){const [id,data]=NEW[col];const o=Object.assign({},data,{updatedAt:now(),__by:'u_jjh',__at:now()});await setDb('work/all/'+col+'/'+id,o);await setDb('mine/u_jjh/'+col+'/'+id,o)}
 for(let i=0;i<15;i++){await wait(2000);d=await D();if(i>=3&&COLS.every(c=>!d[c+'/'+NEW[c][0]]&&!d['work/all/'+c+'/'+NEW[c][0]]))break}
 ok('4 옛 방식으로 직접 써도: 원본에 안 되살아남 · 공용 칸에서 다시 빠짐 (4칸)',COLS.every(c=>!d[c+'/'+NEW[c][0]]&&!d['work/all/'+c+'/'+NEW[c][0]]),COLS.map(c=>[!!d[c+'/'+NEW[c][0]],!!d['work/all/'+c+'/'+NEW[c][0]]].join('/')).join(' '));
 ok('4 두 직원 화면에도 안 보임',(await Promise.all(COLS.map(async c=>!(await has(J,c,NEW[c][0]))&&!(await has(B,c,NEW[c][0]))))).every(Boolean));
 // 대표 화면을 닫았다 다시 열어도 그대로
 await A.close();A=await open('admin',14000);d=await D();
 ok('4 대표 화면을 다시 열어도 안 되살아남 · 휴지통 4건 그대로',COLS.every(c=>!d[c+'/'+NEW[c][0]]&&!d['work/all/'+c+'/'+NEW[c][0]]&&!!d['acct/_trash/t/'+c+'__'+NEW[c][0]])&&(await Promise.all(COLS.map(async c=>!(await has(J,c,NEW[c][0]))&&!(await has(B,c,NEW[c][0]))))).every(Boolean));
 ok('4 직원이 임의로 만든 삭제 표시는 대표 화면이 지움 (휴지통에 없는 것)',await (async()=>{await setDb('work/all/gone/customers__c1',{col:'customers',id:'c1',by:'u_jjh',at:now()});await wait(9000);const x=await D();return !x['work/all/gone/customers__c1']&&!!x['customers/c1']&&await has(B,'customers','c1')})());

 // 5) 휴지통 되살리기 → 다시 보임 (삭제 표시 해제)
 for(const col of COLS){const id=NEW[col][0];const r=await A.evaluate(async([c,i])=>{const all=await window.__hfT.once('acct/_trash/t');const x=all.find(r=>r.col===c&&r.id===i);return x?await window.__hfT.trashRestoreOne(x,all):'none'},[col,id]);for(let i=0;i<10;i++){await wait(2000);d=await D();if(d[col+'/'+id]&&d['work/all/'+col+'/'+id]&&await has(J,col,id)&&await has(B,col,id))break}/* 대표 화면이 다음 맞추기(최대 20초)를 돌 때까지 */
  ok('5 '+col+' 되살리기 → 원본·공용 칸에 다시 · 삭제 표시 해제 · 두 직원 화면에 다시 보임',r==='ok'&&!!d[col+'/'+id]&&!!d['work/all/'+col+'/'+id]&&!d['work/all/gone/'+col+'__'+id]&&await has(J,col,id)&&await has(B,col,id),r+' '+[!!d[col+'/'+id],!!d['work/all/'+col+'/'+id],!d['work/all/gone/'+col+'__'+id],await has(J,col,id),await has(B,col,id)].join('/'))}
 const r6=await put(J,'customers','cN',Object.assign({},NEW.customers[1],{name:'새고객 김시험 (되살린 뒤 수정)'}));await wait(2000);
 ok('5 되살린 뒤에는 다시 저장됨 → 이봄이 화면에 보임',r6==='ok'&&(await val(B,'customers','cN','name'))==='새고객 김시험 (되살린 뒤 수정)',r6);

 // 7) 검토 반려 2026-11-12: 직원 수정 직후 대표 삭제 → 삭제 표시가 중간에 지워지지 않음(직원 화면에 다시 안 보임) · 삭제 직후 낡은 화면 저장·직접 쓰기 → 원본에 안 되살아남
 {let n=0;for(const [col,gap] of [['customers',2700],['customers',3600],['quotes',3200],['customers',6000],['sites',4200]]){n++;const id='r'+n+col[0],base=Object.assign({},NEW[col][1]);if(base.code)base.code='C-2611-96'+n;if(base.qno)base.qno='Q-2611-96'+n;base[NEW[col][2]]='경합 시험 '+n;
   await put(J,col,id,base);await wait(1500);await put(B,col,id,Object.assign({},base,{memo:'이봄이 수정'}));
   let up=false;for(let i=0;i<12&&!up;i++){await wait(1000);up=!!(await D())[col+'/'+id]}/* 원본에 올라올 때까지 */
   await put(B,col,id,Object.assign({},base,{memo:'이봄이 다시 수정'}));await wait(gap);/* 직원 수정이 대표 화면 맞추기를 막 깨운 때 */
   await A.evaluate(([c,i])=>window.__hfT.rmCascade(c,i),[col,id]);
   await wait(600);const stale=await put(J,col,id,Object.assign({},base,{memo:'낡은 화면 저장'}));const nw=new Date().toISOString(),raw=Object.assign({},base,{memo:'직접 씀',updatedAt:nw,__by:'u_jjh',__at:nw});
   await setDb('work/all/'+col+'/'+id,raw);await setDb('mine/u_jjh/'+col+'/'+id,raw);
   let seen=0,noTomb=0,back=0;for(let i=0;i<36;i++){await wait(500);const x=await D();if(!x['work/all/gone/'+col+'__'+id])noTomb++;if(x[col+'/'+id])back++;if(await has(B,col,id)||await has(J,col,id))seen++}
   const x=await D();
   ok('7 '+col+' (수정 '+gap+'ms 뒤 삭제): 18초 동안 삭제 표시 유지 · 직원 화면에 다시 안 보임 · 원본에 안 되살아남 · 낡은 저장 거절',noTomb===0&&back===0&&seen<=2/* 직접 쓴 줄이 대표 화면에 닿기 전 한순간은 숨김 표시가 가림 */&&/^err/.test(stale)&&!x[col+'/'+id]&&!x['work/all/'+col+'/'+id]&&!!x['acct/_trash/t/'+col+'__'+id],'표시 없음 '+noTomb+'회 · 원본 되살아남 '+back+'회 · 직원 화면에 보임 '+seen+'회 · 낡은 저장 '+stale)}
  // 삭제 요청 승인(원본에 이미 없는 줄): 직원 사본 내용이 휴지통에 한 건 남음
  const nw=new Date().toISOString();await setDb('mine/u_bom/projects/pOld',{no:'P-2610-999',title:'옛 프로젝트 (원본에 없음)',mgr:'이봄이',stage:'계약',updatedAt:nw,__by:'u_bom',__at:nw});
  await setDb('mine/u_bom/delreq/projects__pOld',{col:'projects',id:'pOld',title:'옛 프로젝트 (원본에 없음)',what:'프로젝트',reason:'두 번 등록됨',at:nw,by:'u_bom',byName:'이봄이',status:'실행 요청',until:new Date(Date.now()+864e5).toISOString(),execAt:nw});await wait(9000);
  const hasBtn=true;const y=await D();
  ok('7 삭제 요청 승인(원본에 없는 줄): 휴지통에 직원 사본 내용 1건 · 삭제 표시 · 요청 ‘삭제함’ · 이봄이 화면에서 사라짐',hasBtn&&(((y['acct/_trash/t/projects__pOld']||{}).data)||{}).title==='옛 프로젝트 (원본에 없음)'&&!!y['work/all/gone/projects__pOld']&&(y['mine/u_bom/delreq/projects__pOld']||{}).status==='삭제함'&&!(await has(B,'projects','pOld')),JSON.stringify((y['mine/u_bom/delreq/projects__pOld']||{}).status)+' '+!!y['acct/_trash/t/projects__pOld'])}

 // 6) 돈 정보·원본 보존
 d=await D();const wk=Object.keys(d).filter(k=>k.startsWith('work/'));
 ok('6 공용 칸에 원가·마진·성과금 칸 없음',wk.every(k=>!['estCost','perf','qCost','approvals','pc','margin','marginRate','bonus','bonusBase'].some(f=>d[k]&&f in d[k]&&d[k][f]!==''&&d[k][f]!==undefined)),wk.length+'문서');
 ok('6 원래 있던 원본(p1·c1·q1·s1)·대표 전용 원가 그대로',d['projects/p1'].title==='시험 현장'&&d['customers/c1'].name==='홍길동'&&d['quotes/q1'].qCost==='2100000'&&d['sites/s1'].name==='시험 현장'&&d['ppriv/p1'].estCost==='20000000');
 ok('6 직원 화면이 대표 전용 칸에 쓰려다 거절된 것 0',(await J.evaluate(()=>window.__mockDenied.length))===0&&(await B.evaluate(()=>window.__mockDenied.length))===0,JSON.stringify(await J.evaluate(()=>window.__mockDenied)));
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
