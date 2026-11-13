// 고객 전화·주소 사본 빈 칸 채우기 시험 (검토 권고 2026-11-13): node intranet/tools/test/cshare_fill_test.js [index.html]
// 직원이 고객 창에서 주소 한 칸만 고칠 때, 대표 사본(PRIVC)이 없는 새 고객이면 cshare 사본에 전화번호가 빈 값으로 들어가던 것 →
// 실행 순서를 뒤집어(공용 칸 쓰기가 막혀 cshare 만 들어감) 대표 화면이 cshare → cpriv 로 옮겨도 전화번호가 지워지지 않는지 봄
const {chromium}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"],["work/all/customers","interact","owner"]].map(([path,read,write])=>({path,read,write}));
const STAFF={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const T0="2026-11-01T00:00:00Z";const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const cu=(code,name,x)=>Object.assign({code,name,mgr:"정진혁",status:"진행중",steps:[1],inq:"2026-11-10",tel:"",addr:"",createdAt:T0,updatedAt:T0,__at:T0},x||{});
const SEED=Object.assign({},STAFF,{
 // 새 고객: 정진혁이 만든 것 · 대표 사본(cpriv)·정진혁 사본(cshare) 없음 · 공용 칸에만 번호·주소
 "customers/cN":cu("C-2611-951","새고객",{createdBy:"u_jjh"}),"work/all/customers/cN":Object.assign(cu("C-2611-951","새고객",{createdBy:"u_jjh"}),{tel:"010-5555-6666",addr:"구리 새집 1동",__by:"admin"}),
 // 대표 사본이 있는 고객 + 정진혁 사본(더 새것)에 전화번호가 빈 값으로 들어온 경우 (옛 버전 화면이 쓴 것)
 "customers/cO":cu("C-2611-952","옛고객"),"cpriv/cO":{tel:"010-7777-8888",addr:"서울 옛집",updatedAt:T0},"cshare/u_jjh/c/cO":{tel:"",addr:"서울 새 주소",updatedAt:"2026-11-12T00:00:00Z",by:"u_jjh"}});
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900},timezoneId:'Asia/Seoul'});const errs=[];
 await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const dbv=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')));
 const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));await p.addInitScript(`window.__SUBPOLL=2500;window.confirm=()=>false;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms);return p};
 // 1) 정진혁: 새 고객 창에서 주소만 고침 (공용 칸 쓰기는 규칙으로 막힘 → cshare 만 들어감 = 순서를 뒤집은 상황)
 const J=await open('jjh',9000);
 const t0=await J.evaluate(()=>{const c=window.__hfT.S().customers.find(x=>x.id==='cN');return c&&c.tel});
 ok('준비: 정진혁 화면은 공용 칸의 번호를 앎 · 대표 사본 없음',t0==='010-5555-6666',t0);
 await J.evaluate(()=>{location.hash='#customers'});await wait(600);await J.evaluate(()=>window.__hfT.open('customers','cN'));await wait(1200);
 await J.evaluate(()=>{const el=document.querySelector('#sheetForm [data-k="addr"]');el.value='구리 새집 2동';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});
 await J.locator('#saveSheet').click();await wait(2500);let d=await dbv();const sh=d['cshare/u_jjh/c/cN']||{};
 ok('정진혁 cshare 사본: 고친 주소 + 전화번호는 공용 칸 값으로 채워짐 (빈 값 아님)',sh.tel==='010-5555-6666'&&sh.addr==='구리 새집 2동',JSON.stringify(sh));
 ok('공용 칸 쓰기는 정말 막혔음 (순서 뒤집기 재현)',(d['work/all/customers/cN']||{}).addr==='구리 새집 1동',(d['work/all/customers/cN']||{}).addr);
 // 2) 대표 화면: cshare → cpriv 로 옮김 → 번호가 지워지면 안 됨
 const A=await open('admin',14000);for(let i=0;i<20;i++){await wait(1000);d=await dbv();if((d['cpriv/cN']||{}).addr==='구리 새집 2동'&&(d['cpriv/cO']||{}).addr==='서울 새 주소')break}
 ok('대표 화면이 옮긴 cpriv(새 고객): 주소는 새 값 · 전화번호 그대로',(d['cpriv/cN']||{}).tel==='010-5555-6666'&&(d['cpriv/cN']||{}).addr==='구리 새집 2동',JSON.stringify(d['cpriv/cN']));
 ok('대표 화면이 옮긴 cpriv(사본에 빈 번호가 온 옛 고객): 주소는 새 값 · 원본 전화번호는 지워지지 않음',(d['cpriv/cO']||{}).tel==='010-7777-8888'&&(d['cpriv/cO']||{}).addr==='서울 새 주소',JSON.stringify(d['cpriv/cO']));
 console.log('\n== cshare 빈 칸 시험: '+R.filter(x=>x).length+' / '+R.length+' 통과 · 페이지 오류 '+errs.length);errs.slice(0,5).forEach(e=>console.log('  오류: '+e));
 await b.close();process.exit(R.every(x=>x)&&!errs.length?0:1)})();
