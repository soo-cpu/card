// 성과금 실적 구분(perf) 칸 지키기 시험 (직원 잇단 저장 · 직원이 일부러 비운 칸은 그대로 비워짐) (v0.99-42, 2026-11-21)
// node intranet/tools/test/perf_keep_test.js [index.html]
// 가짜 공용 저장소(mock.js)에 직원 저장(직원 사본 mine · 공용 칸 work)을 몇 초 간격으로 넣고, 대표 화면이 원본에 맞춘 뒤 원본 칸을 확인
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const HTML=fs.readFileSync(process.argv[2]||path.join(__dirname,'../../index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const P=(o)=>Object.assign({custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"",approvals:[{amt:1515151,t:"자재"}],cat:"주거",inq:"2026-11-01",work:"욕실",memo:"대표 메모",updatedAt:T0},o);
const SEED={"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장",email:"jjh@test"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장",email:"bom@test"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",email:"cja@test"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "projects/p1":P({no:"P-2611-901",title:"시험 현장 1",perf:"순수 인테리어"}),"projects/p2":P({no:"P-2611-902",title:"시험 현장 2",perf:"제외: 특강·교육"}),
 "projects/p3":P({no:"P-2611-903",title:"시험 현장 3",perf:"제외: 조합 영업·납품"}),"projects/p4":P({no:"P-2611-904",title:"시험 현장 4",perf:"순수 인테리어"}),"projects/p5":P({no:"P-2611-905",title:"시험 현장 5"}),
 "ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "reports/r1":{d:"2026-11-20",who:"정진혁",createdBy:"u_jjh",note:"처음 보고",memo:"보고 내용",updatedAt:T0},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1],stage:"1-상담영업",updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "quotes/q1":{qno:"Q-2611-901",pno:"P-2611-901",name:"홍길동",amount:"3000000",qCost:"2100000",status:"작성",updatedAt:T0},"sites/s1":{pno:"P-2611-901",name:"시험 현장 1",mgr:"정진혁",status:"공사 중",logs:[],updatedAt:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false}};
let pass=0,fail=0;const ok=(t,c,x)=>{c?pass++:fail++;console.log((c?'통과':'실패')+' · '+t+(c||x===undefined?'':' → '+x))};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900},timezoneId:'Asia/Seoul'});
 await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const errs=[];const open=async who=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};window.__SUBPOLL=1500;/* 직원 사본 다시 읽기를 1.5초로 (실제는 40초) — 대표 화면이 직원 사본을 바로 받는 경우를 시험 */`+MOCK);await p.goto('http://hf.test/');return p};
 const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));const wait=ms=>new Promise(r=>setTimeout(r,ms));
 // 저장소에 직원 저장을 그대로 넣음 (직원 화면이 put 할 때 쓰는 모양: 직원 사본 mine + 공용 칸 work, perf 등 대표 전용 칸은 없음)
 const put=(docs)=>seed.evaluate(docs=>{const d=JSON.parse(localStorage.getItem('mockdb'));Object.keys(docs).forEach(k=>{d[k]=docs[k]});localStorage.setItem('mockdb',JSON.stringify(d));new BroadcastChannel('mockdb').postMessage(1)},docs);
 const staffRow=(d,id,chg,by,base,at)=>{const w=Object.assign({},d['work/all/projects/'+id]||d['projects/'+id],chg);['perf','approvals','costTotal','estCost','id'].forEach(k=>delete w[k]);w.__by=by;w.__at=at||new Date().toISOString();w.__base=base;return w};
 const A=await open('admin');await wait(10000);let d=await D();
 ok('준비: 대표 화면이 공용 칸을 채움 (성과금 칸은 공용 칸에 없음)',!!d['work/all/projects/p1']&&d['work/all/projects/p1'].perf===undefined);
 const baseOf=id=>{const r=d['projects/'+id];return r.__at||r.updatedAt};

 // (가) 직원 사본(mine)으로만 들어온 저장 — 직원 두 명이 2초 간격
 {const r1=staffRow(d,'p1',{work:"욕실+주방 (정진혁)"},'u_jjh',baseOf('p1'));await put({'mine/u_jjh/projects/p1':r1});await wait(2000);d=await D();
  const r2=staffRow(d,'p1',{work:"욕실+주방 (정진혁)",title:"시험 현장 1 (이봄이)"},'u_bom',baseOf('p1'));await put({'mine/u_bom/projects/p1':r2});await wait(9000);d=await D();const o=d['projects/p1'];
  ok('(가) 직원 사본 저장 2건(2초 간격) 뒤 원본 성과금 실적 구분 그대로',o.perf==="순수 인테리어",JSON.stringify(o.perf));
  ok('(가) 직원이 고친 칸은 원본에 반영 · 결재·대표 메모 그대로',o.title==="시험 현장 1 (이봄이)"&&/정진혁/.test(o.work)&&JSON.stringify(o.approvals)===JSON.stringify(SEED['projects/p1'].approvals)&&o.memo==="대표 메모",JSON.stringify([o.title,o.work,o.approvals,o.memo]))}

 // (나) 직원 사본 + 공용 칸에 같이 들어온 저장 (실제 직원 화면과 같은 모양) — 세 번 잇달아
 {for(const [who,chg] of [['u_jjh',{work:"거실 (정)"}],['u_bom',{work:"거실 (이)"}],['u_jjh',{work:"거실 (정2)"}]]){d=await D();const at=new Date().toISOString();const r=staffRow(d,'p2',chg,who,baseOf('p2'),at);const w=Object.assign({},r);await put({['mine/'+who+'/projects/p2']:r,'work/all/projects/p2':w});await wait(1500)}
  await wait(9000);d=await D();const o=d['projects/p2'];
  ok('(나) 직원 사본+공용 칸 저장 3건(1.5초 간격) 뒤 원본 성과금 실적 구분 그대로',o.perf==="제외: 특강·교육",JSON.stringify(o.perf));
  ok('(나) 마지막 저장 내용이 원본에',o.work==="거실 (정2)",o.work)}

 // (다) 직원 사본에 옛 성과금 값이 남아 있어도(예전에 내려간 사본) 대표가 바꾼 값을 되돌리지 않음
 {d=await D();const r=staffRow(d,'p3',{work:"주방"},'u_jjh',baseOf('p3'));r.perf="순수 인테리어";await put({'mine/u_jjh/projects/p3':r});await wait(9000);d=await D();
  ok('(다) 직원 사본에 옛 성과금 값이 있어도 원본 값(대표가 정한 것) 그대로',d['projects/p3'].perf==="제외: 조합 영업·납품"&&d['projects/p3'].work==="주방",JSON.stringify([d['projects/p3'].perf,d['projects/p3'].work]))}

 // (라) 직원이 저장한 뒤 곧바로 다른 칸을 비워 다시 저장 → 비운 것이 그대로 반영 (검토 반려 2026-11-21: 일부러 비운 칸을 되살리지 않음) · 성과금 칸은 그대로
 {d=await D();const old=baseOf('p4');const r1=staffRow(d,'p4',{work:"전체 리모델링 (정진혁)"},'u_jjh',old);await put({'mine/u_jjh/projects/p4':r1,'work/all/projects/p4':Object.assign({},r1)});await wait(4000);d=await D();
  const r2=staffRow(d,'p4',{work:"전체 리모델링 (정진혁)",memo:""},'u_jjh',old);await put({'mine/u_jjh/projects/p4':r2,'work/all/projects/p4':Object.assign({},r2)});await wait(9000);d=await D();const o=d['projects/p4'];
  ok('(라) 저장 직후 일부러 비운 칸(메모)은 비워짐 · 고친 칸 반영 · 성과금 실적 구분 그대로',o.memo===""&&o.work==="전체 리모델링 (정진혁)"&&o.perf==="순수 인테리어",JSON.stringify([o.memo,o.work,o.perf]))}

 // (마) 성과금 칸이 원래 없는 줄은 직원 저장 뒤에도 생기지 않음
 {d=await D();const r1=staffRow(d,'p5',{work:"도배"},'u_jjh',baseOf('p5'));await put({'work/all/projects/p5':r1});await wait(8000);d=await D();const o=d['projects/p5'];
  ok('(마) 성과금 칸이 없던 줄: 직원 저장 반영 · 성과금 칸은 없던 그대로',o.work==="도배"&&!o.perf,JSON.stringify([o.work,o.perf]))}

 // (바) 업무 보고(공용 칸 없는 메뉴): 직원이 자기 보고의 칸을 일부러 비우면 비워짐 (검토 반려 2026-11-21 — 낡은 화면 보호는 공용 칸이 있는 메뉴에서만)
 {const rp=(chg,at)=>Object.assign({d:"2026-11-20",who:"정진혁",createdBy:"u_jjh",note:"처음 보고",memo:"보고 내용"},chg,{__by:'u_jjh',__at:at||new Date().toISOString(),__base:T0});
  await put({'mine/u_jjh/reports/r1':rp({note:"고친 보고"})});await wait(8000);d=await D();ok('(바) 준비: 업무 보고 고친 것이 원본에',d['reports/r1'].note==="고친 보고",d['reports/r1'].note);
  await put({'mine/u_jjh/reports/r1':rp({note:"고친 보고",memo:""})});await wait(9000);d=await D();ok('(바) 업무 보고: 직원이 비운 칸(memo)은 원본에서도 비워짐',d['reports/r1'].memo===""&&d['reports/r1'].note==="고친 보고",JSON.stringify([d['reports/r1'].memo,d['reports/r1'].note]))}

 d=await D();
 ok('공용 칸·직원 사본 어디에도 성과금 값이 새로 들어가지 않음 (공용 칸)',Object.keys(d).filter(k=>k.startsWith('work/all/')).every(k=>d[k].perf===undefined));
 ok('원본 줄 수 그대로 (지워진 줄 없음) · 예상 원가 사본 그대로',['p1','p2','p3','p4','p5'].every(i=>d['projects/'+i])&&d['ppriv/p1'].estCost==="20202020"&&d['quotes/q1'].qCost==="2100000");
 ok('화면 오류 0',!errs.length,errs.slice(0,3).join(' | '));
 console.log('\n결과: 통과 '+pass+' / 실패 '+fail);await b.close();process.exit(fail?1:0)})();
