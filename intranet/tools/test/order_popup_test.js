const {chromium}=require('playwright');const fs=require('fs');// 대표 지시 팝업 시험: node intranet/tools/test/work_sync_test.js [index.html]
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const OLD=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"]].map(([path,read,write])=>({path,read,write}));
const RULES=OLD.concat(process.env.NOWORK?[]:[{path:"work",read:"interact",write:"interact"}]);
const now=new Date().toISOString();
const SEED={"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장",email:"jjh@test"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장",email:"bom@test"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"상담",mgr:"정진혁",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",inq:"2026-11-01",work:"욕실",updatedAt:"2026-11-01T00:00:00Z"},
 "projects/p2":{no:"P-2611-902",title:"미확정 현장",custName:"김시험",stage:"견적",mgr:"정진혁",contractAmt:"5000000",amtLock:"미확정",inq:"2026-11-02",updatedAt:"2026-11-01T00:00:00Z"},"ppriv/p1":{estCost:"20000000",updatedAt:"2026-11-01T00:00:00Z"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1],stage:"1-상담영업",updatedAt:"2026-11-01T00:00:00Z"},
 "cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:"2026-11-01T00:00:00Z"},
 "sites/s1":{pno:"P-2611-901",name:"시험 현장",mgr:"정진혁",status:"공사 중",logs:[],updatedAt:"2026-11-01T00:00:00Z"},
 "quotes/q1":{qno:"Q-2611-901",pno:"P-2611-901",name:"홍길동",amount:"3000000",status:"작성",updatedAt:"2026-11-01T00:00:00Z"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false}};
(async()=>{const b=await chromium.launch();const __tzSeoul=b.newContext.bind(b);b.newContext=o=>__tzSeoul(Object.assign({timezoneId:'Asia/Seoul'},o||{})) /* 시험 시간대 서울 고정 (검토 권고 2026-11-13: 한국 새벽에 날짜가 하루 어긋남) */;const ctx=await b.newContext({viewport:{width:1280,height:900}});
 await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));
 await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const errs=[],dialogs=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
 async function open(who){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+': '+d.type());d.dismiss().catch(()=>{})});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');return p}
 const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
 // 1) 대표: 지시 보내기
 let A=await open('admin');await wait(8000);
 await A.locator('[data-ordnew]').first().click({timeout:8000});await wait(400);
 await A.locator('[data-ordto="u_jjh"]').check();await A.fill('#ordT','시험 지시: 단가 86개 입력');await A.fill('#ordD','단가표에 없는 상담 항목 금액 입력');await A.selectOption('#ordL','price');await A.fill('#ordDue','2026-11-14');
 await A.locator('[data-ordsend]').click();await wait(1500);let d=await D();
 const om=Object.keys(d).filter(k=>k.startsWith('acct/_ord/o/'));const oc=Object.keys(d).filter(k=>k.startsWith('mine/u_jjh/orders/'));
 console.log('1 master',om.length,'copy jjh',oc.length,'copy bom',Object.keys(d).filter(k=>k.startsWith('mine/u_bom/orders/')).length);
 console.log('1 home card shows',await A.evaluate(()=>document.body.innerText.includes('정진혁 안 읽음')));
 await A.close();
 // 2) 정진혁: 팝업 → 완료
 let J=await open('jjh');await wait(7000);
 const pop=await J.evaluate(()=>{const v=document.getElementById('ordVeil');return v?v.innerText.slice(0,200):null});console.log('2 jjh popup',JSON.stringify(pop));
 d=await D();console.log('2 status after open',d[oc[0]].status);
 await J.locator('[data-orddone]').first().click();await wait(500);await J.locator('[data-ok="1"]').click({timeout:3000}).catch(()=>console.log('2 no okAsk'));await wait(1200);
 d=await D();console.log('2 status',d[oc[0]].status,!!d[oc[0]].doneAt,'denied',await J.evaluate(()=>window.__mockDenied));
 console.log('2 popup gone',await J.evaluate(()=>!document.getElementById('ordVeil')));
 await J.close();
 // 2b) 이봄이: 지시 없음 → 팝업 없음
 let B=await open('bom');await wait(6000);console.log('2b bom popup',await B.evaluate(()=>!!document.getElementById('ordVeil')));await B.close();
 // 3) 대표: 완료 팝업 → 확인
 A=await open('admin');await wait(9000);
 console.log('3 admin popup',JSON.stringify(await A.evaluate(()=>{const v=document.getElementById('ordVeil');return v?v.innerText.slice(0,160):null})));
 await A.locator('[data-ordack]').click().catch(()=>console.log('3 no ack btn'));await wait(1200);d=await D();console.log('3 ack',JSON.stringify(d[om[0]].ack));await A.close();
 A=await open('admin');await wait(9000);console.log('3b admin popup again',await A.evaluate(()=>!!document.getElementById('ordVeil')));
 // 4) 마감 지난 미완료 → 빨간 표시 (드라이브 md 형식 파서도)
 await A.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb'));D['acct/_ord/o/old1']={to:['u_bom'],toNames:['이봄이'],title:'지난 지시',desc:'',link:'projects',due:'2026-11-01',at:'2026-10-30T00:00:00Z',by:'u_boss',src:'화면',ack:{}};D['mine/u_bom/orders/old1']={title:'지난 지시',desc:'',link:'projects',due:'2026-11-01',at:'2026-10-30T00:00:00Z',from:'대표',status:'read'};localStorage.setItem('mockdb',JSON.stringify(D))});await A.close();
 A=await open('admin');await wait(9000);console.log('4 late popup',JSON.stringify(await A.evaluate(()=>{const v=document.getElementById('ordVeil');return v?v.innerText.slice(0,200):null})));await A.close();
 B=await open('bom');await wait(6000);console.log('4 bom popup',JSON.stringify(await B.evaluate(()=>{const v=document.getElementById('ordVeil');return v?v.innerText.slice(0,160):null})));
 await B.locator('[data-ordgo]').first().click().catch(()=>console.log('4 no go'));await wait(800);console.log('4 bom went to',await B.evaluate(()=>location.hash));
 console.log('errors',errs.slice(0,8),'dialogs',dialogs);await b.close()})();
