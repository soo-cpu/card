// 공용 캘린더 중복 표시 시험 (v0.99-36 · 직원요청 이봄이 femwis7troewph): node intranet/tools/test/cal_dup_test.js [index.html]
// 일정 1건 등록 → 월간·주간·오늘·작은 창(미니)에 1번만 · 공정표에서 빠진 일정(gjOff)은 안 보임 · 저장소 cal 문서는 1건만 더해짐
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const today=new Date(Date.now()+9*36e5).toISOString().slice(0,10);
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "cal/gjoff1":{kind:"현장",title:"숨긴 공정 시험",start:today,end:today,name:"최윤수",gjPid:"p9",gjOff:true,createdAt:T0,updatedAt:T0},
 "cal/old1":{kind:"현장",title:"기존 일정 시험",start:today,end:today,name:"최윤수",createdAt:T0,updatedAt:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push([v?"통과":"실패",n]);console.log(v?"통과":"실패",n,x===undefined?"":String(x).replace(/\s+/g," ").slice(0,300))};
(async()=>{const b=await chromium.launch();const errs=[];
 for(const [vn,vopt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',Object.assign({},devices['Pixel 7'])]]){const tag=vn+' ';
  const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul'},vopt));await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
  const open=async who=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>d.dismiss());await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(7000);return p};
  const A=await open('admin');await wait(3000);
  for(const [who,nm] of [['bom','이봄이'],['admin','최윤수'],['jjh','정진혁']]){const t=tag+nm+': ';const P=who==='admin'?A:await open(who);
   await P.evaluate(()=>{location.hash='#calendar'});await wait(1200);
   const n0=Object.keys(await D()).filter(k=>/^cal\//.test(k)).length;const title='새 일정 '+nm;
   await P.locator('[data-calnew]').first().click();await wait(500);
   await P.evaluate(([title,today])=>{const v=document.getElementById('calVeil');const set=(k,x)=>{const el=v.querySelector('[data-cf="'+k+'"]');if(el){el.value=x;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}};set('title',title);set('start',today);set('end',today)},[title,today]);
   await P.locator('#calVeil [data-calsave]').click();await wait(1800);
   const d=await D(),ks=Object.keys(d).filter(k=>/^cal\//.test(k)),id=(ks.find(k=>d[k].title===title)||'').slice(4);
   ok(t+'일정 1건 등록 → 저장소 cal 문서 1건만 더해짐',ks.length===n0+1&&!!id,ks.length+' '+id);
   const cnt=async sel=>P.evaluate(([sel,id])=>document.querySelectorAll(sel+' [data-calopen$="|'+id+'"]').length,[sel,id]);
   const cntOff=async sel=>P.evaluate(sel=>document.querySelectorAll(sel+' [data-calopen$="|gjoff1"]').length,sel);
   const res={};for(const v of ['month','week','today']){await P.locator('[data-calview="'+v+'"]').first().click();await wait(600);res[v]=[await cnt('#view'),await P.evaluate(()=>document.querySelectorAll('#view [data-calopen$="|old1"]').length),await cntOff('#view'),await P.evaluate(()=>{const L=[...document.querySelectorAll('#view [data-calopen]')].map(e=>e.dataset.calopen);return L.length-new Set(L).size})]}
   ok(t+'월간·주간·오늘 보기에 같은 일정이 두 번 나오지 않음 · 주간·오늘은 새 일정·기존 일정 1번씩 · 숨긴 공정 0 (월간 칸은 하루 3개까지 + 더 보기라 0~1번)',['month','week','today'].every(v=>res[v][2]===0&&res[v][3]===0&&res[v][0]<=1)&&['week','today'].every(v=>res[v][0]===1&&res[v][1]===1),JSON.stringify(res));
   await P.evaluate(()=>{location.hash='#home'});await wait(900);await P.evaluate(()=>document.getElementById('calFab').click());await wait(700);
   const mini=[await cnt('#calMini'),await cntOff('#calMini'),await P.evaluate(()=>document.querySelectorAll('#calMini [data-calopen$="|old1"]').length)];
   const fabN=await P.evaluate(()=>(document.getElementById('calFabN')||{}).textContent||'');
   ok(t+'작은 창(미니)에도 1번만 · 숨긴 공정 0 · 오늘 개수 표시 = 실제 개수',mini[0]===1&&mini[1]===0&&mini[2]===1&&Number(fabN)===Object.values(d).filter(e=>e&&e.start===today&&!e.gjOff&&!e.__deleted&&!e.deleted).length,JSON.stringify(mini)+' fab='+fabN);
   await P.evaluate(()=>document.getElementById('calFab').click());await wait(300);
   const den=await P.evaluate(()=>window.__mockDenied.filter(x=>!/^(activity|access|knock)/.test(x)));if(who!=='admin')ok(t+'권한 밖 쓰기 0',!den.length,den.join(','));
   if(who!=='admin')await P.close()}
  const d=await D();ok(tag+'숨긴 공정 일정(gjOff)은 지워지지 않고 저장소에 그대로',!!d['cal/gjoff1']&&d['cal/gjoff1'].gjOff===true);
  await ctx.close()}
 const i=HTML.indexOf('const calList=');ok('코드: 화면 목록은 CAL.all 한 벌만 (Object.values(CAL) 합치기 없음)',i>0&&!/Object\.values\(CAL\)/.test(HTML));
 ok('화면 오류 0',!errs.length,errs.slice(0,3).join(' | '));
 await b.close();const f=R.filter(x=>x[0]==="실패").length;console.log(`\n합계 ${R.length} · 통과 ${R.length-f} · 실패 ${f}`);process.exit(f?1:0)})();
