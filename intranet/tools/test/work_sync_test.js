const {chromium}=require('playwright');const fs=require('fs');// 공용 작업 칸 시험: node intranet/tools/test/work_sync_test.js [index.html]
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const OLD=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"]].map(([path,read,write])=>({path,read,write}));
const RULES=OLD.concat(process.env.NOWORK?[]:[{path:"work",read:"interact",write:"interact"}]);
const now=new Date().toISOString();
const SEED={"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장",email:"jjh@test"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장",email:"bom@test"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"상담",mgr:"정진혁",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",approvals:[{amt:1500000,t:"자재"}],inq:"2026-11-01",work:"욕실",updatedAt:"2026-11-01T00:00:00Z"},
 "projects/p2":{no:"P-2611-902",title:"미확정 현장",custName:"김시험",stage:"견적",mgr:"정진혁",contractAmt:"5000000",amtLock:"미확정",inq:"2026-11-02",updatedAt:"2026-11-01T00:00:00Z"},"ppriv/p1":{estCost:"20000000",updatedAt:"2026-11-01T00:00:00Z"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1],stage:"1-상담영업",updatedAt:"2026-11-01T00:00:00Z"},
 "cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:"2026-11-01T00:00:00Z"},
 "sites/s1":{pno:"P-2611-901",name:"시험 현장",mgr:"정진혁",status:"공사 중",logs:[],updatedAt:"2026-11-01T00:00:00Z"},
 "quotes/q1":{qno:"Q-2611-901",pno:"P-2611-901",name:"홍길동",amount:"3000000",qCost:"2100000",status:"작성",updatedAt:"2026-11-01T00:00:00Z"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});
 await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));
 await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const errs=[];
 async function open(who){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');return p}
 const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 // 1) 대표 화면 → 공용 칸 채움
 let A=await open('admin');await wait(9000);let d=await D();
 console.log('1 work keys',Object.keys(d).filter(k=>k.startsWith('work/')));
 const wp=d['work/all/projects/p1']||{};console.log('1 project contractAmt',wp.contractAmt,'estCost' in wp?'estCost:'+wp.estCost:'no estCost','perf' in wp?'perf!':'no perf');
 const wc=d['work/all/customers/c1']||{};console.log('1 no qCost',!('qCost' in (d['work/all/quotes/q1']||{})),'no approvals',!('approvals' in wp));console.log('1 customer tel',wc.tel,wc.addr);
 await A.close();
 // 2) 정진혁 화면 (대표 화면 닫힘) → 공사 내용 고쳐 저장
 let J=await open('jjh');await wait(7000);
 const seen=await J.evaluate(()=>document.body.innerText.includes('시험 현장'));console.log('2 jjh sees project',seen);
 fs.writeFileSync((process.env.OUT||'/tmp')+'/jjh_home.txt',await J.evaluate(()=>document.body.innerText.slice(0,3000)));
 await J.screenshot({path:(process.env.OUT||'/tmp')+'/jjh.png'});
 module.exports={J};
 // try UI edit
 try{await J.evaluate(()=>{location.hash="#projects"});await wait(1500);
   const row=J.locator('tr[data-open]').filter({hasText:'시험 현장'}).first();await row.click({timeout:5000});await wait(1200);
   const inp=J.locator('[data-k="work"]').first();await inp.fill('욕실+주방 (정진혁 수정)');
   const sv=J.locator('.sheet button').filter({hasText:/^저장/}).first();await sv.click({timeout:5000});await wait(2500);
 }catch(e){console.log('2 UI edit err',e.message.split('\n')[0])}
 d=await D();console.log('2 work p1.work',(d['work/all/projects/p1']||{}).work,'by',(d['work/all/projects/p1']||{}).__by,'| original',d['projects/p1'].work,'| mine',(d['mine/u_jjh/projects/p1']||{}).work);
 console.log('2 denied',await J.evaluate(()=>window.__mockDenied));
 // 3) 이봄이 화면: 대표 화면 없이 바로 보이는지
 let B=await open('bom');await wait(7000);await B.evaluate(()=>{location.hash="#projects"});await wait(1500);
 await B.locator('tr[data-open]').filter({hasText:'시험 현장'}).first().click({timeout:5000}).catch(e=>console.log('3 click err'));await wait(1000);
 console.log('3 bom sees edit',await B.evaluate(()=>{const i=document.querySelector('[data-k="work"]');return i&&i.value}));
 await B.evaluate(()=>{location.hash="#customers"});await wait(1500);await B.keyboard.press('Escape');await wait(300);
 const html=await B.evaluate(()=>document.body.innerHTML);console.log('3 bom customers page has tel',html.includes('010-1234-5678'),'| has 홍길동',html.includes('홍길동'));
 await B.close();await J.close();
 // 4) 대표 화면 → 원본 반영 + 기록
 A=await open('admin');await wait(9000);d=await D();
 console.log('4 orig keeps approvals',JSON.stringify(d['projects/p1'].approvals),'q1 qCost',d['quotes/q1'].qCost);console.log('4 original p1.work',d['projects/p1'].work,'orig estCost',JSON.stringify(d['projects/p1'].estCost),'perf',d['projects/p1'].perf,'contractAmt',d['projects/p1'].contractAmt,'estCost ppriv',d['ppriv/p1'].estCost);
 console.log('4 log',JSON.stringify(Object.keys(d).filter(k=>k.startsWith('acct/_work/log')).map(k=>({by:d[k].byName,prev:d[k].prev}))));
 console.log('4 work p1 by',(d['work/all/projects/p1']||{}).__by);
 await A.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb'));D['projects/p1']=Object.assign({},D['projects/p1'],{stage:'계약',updatedAt:new Date().toISOString(),__at:new Date().toISOString()});localStorage.setItem('mockdb',JSON.stringify(D));new BroadcastChannel('mockdb').postMessage(1)});await wait(7000);d=await D();
 console.log('5 boss edit -> work stage',(d['work/all/projects/p1']||{}).stage,'by',(d['work/all/projects/p1']||{}).__by);
 console.log('5 amtLock work p2 contractAmt',JSON.stringify((d['work/all/projects/p2']||{}).contractAmt));
 console.log('errors',errs.slice(0,10));
 await b.close()})();
