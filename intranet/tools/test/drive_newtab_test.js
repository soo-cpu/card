// 드라이브 파일 새 탭 열기 시험 (2026-11-17, v0.99-37): node intranet/tools/test/drive_newtab_test.js [새 index.html] [옛 index.html(비교용, 생략 가능)]
// - 대표·채진아·정진혁·이봄이 화면의 서식 자료실(#forms)·경리 자료함(#fbox)·캐시플로우(#cflow)·현장 자료(#sitedocs)에서
//   드라이브 파일 링크가 target=_blank 새 탭 링크인지, 드라이브 /preview iframe 이 남지 않았는지 확인
// - 옛 index.html 을 같이 주면, 사람별·메뉴별로 보이는 드라이브 파일 목록이 옛것과 똑같은지(권한 그대로) 비교
// playwright 가 없으면 PW=<playwright-core 경로> CHROME=<chrome.exe 경로> 로 돌림
const PWP=process.env.PW||'playwright';let pw;try{pw=require(PWP)}catch(e){pw=require(PWP+'-core')}const {chromium}=pw;const fs=require('fs');
const NEW=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const OLD=process.argv[3]?fs.readFileSync(process.argv[3],'utf8'):null;
const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T='2026-11-16T09:00:00Z';
const FIN=[{id:"DFIN_cash1",t:"캐시플로우 2026년 11월.xlsx",m:"application/vnd.ms-excel",mod:"2026-11-16",cat:"세무·회계",path:"자금"},{id:"DFIN_vat",t:"부가세 신고서 2026 2기.pdf",m:"application/pdf",mod:"2026-11-10",cat:"세무·회계",path:"세무"},{id:"DFIN_mi",t:"미수금 현황.pdf",m:"application/pdf",mod:"2026-11-12",cat:"세무·회계",path:"자금"}];
const SITE=[{id:"DSITE_1",t:"도면 1층.pdf",m:"application/pdf",mod:"2026-11-14",proj:"2026-11 시험 현장",pno:"P-2611-901",path:"2026 년 / 11 월 / 2026-11 시험 현장"},{id:"DSITE_boss",t:"단가표 원본.xlsx",m:"application/vnd.ms-excel",mod:"2026-11-14",path:"단가표"}];
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",stage:"시공",mgr:"정진혁",inq:"2026-11-01",updatedAt:T},
 "acct/_drv/fin/a":{items:FIN,at:T},"acct/u_cja/drvfin/a":{items:FIN,at:T},
 "acct/_drv/site/a":{items:SITE,at:T},"acct/u_jjh/drvsite/a":{items:SITE.slice(0,1),at:T},"acct/u_bom/drvsite/a":{items:SITE.slice(0,1),at:T},"acct/u_cja/drvsite/a":{items:SITE.slice(0,1),at:T}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false}};
const ROUTES=["forms","fbox","cflow","sitedocs"];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function run(HTML,tag){const b=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});const ctx=await b.newContext({viewport:{width:1280,height:900},timezoneId:'Asia/Seoul'});
 await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));
 await ctx.route(/drive\.google\.com/,r=>r.fulfill({contentType:'text/html',body:'<html><body>drive stub</body></html>'}));
 await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|googleapis|gstatic/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.clear();localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const errs=[],out={};
 for(const who of Object.keys(USERS)){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(6000);
  out[who]={};
  for(const r of ROUTES){await p.evaluate(h=>{location.hash="#"+h},r);await wait(1800);
   // 경리 자료함: 분류 카드 펼치기 (드라이브 목록 줄이 보이게)
   if(r==="fbox"){await p.evaluate(()=>{const t=document.querySelector('[data-dfopen="세무·회계"]');if(t)t.click()});await wait(800)}
   if(r==="forms"){await p.evaluate(()=>{if(!document.querySelector('[data-fmopen][aria-expanded="true"]')){const t=document.querySelector('[data-fmopen]');if(t)t.click()}});await wait(800)}
   if(r==="sitedocs"){const ks=await p.evaluate(()=>[...document.querySelectorAll('[data-dsopen]')].map(x=>x.dataset.dsopen));out[who].siteGroups=ks;if(ks[0]){await p.evaluate(k=>{const t=document.querySelector('[data-dsopen="'+k+'"]');if(t&&t.getAttribute('aria-expanded')!=="true")t.click()},ks[0]);await wait(800)}}
   out[who][r]=await p.evaluate(()=>{const A=[...document.querySelectorAll('a[href*="drive.google.com/file/d/"]')].filter(a=>!a.closest('.toollink'));
     const files=A.filter(a=>a.matches('[data-dpv],[data-cfdrv]')||a.closest('#dfBox'));
     return {route:location.hash,title:(document.querySelector('.head h1')||{}).textContent||"",
      ids:[...new Set(A.map(a=>(a.href.match(/file\/d\/([^/]+)/)||[])[1]))].sort(),
      notNewTab:files.filter(a=>a.target!=="_blank"||!/noopener/.test(a.rel||"")).map(a=>a.textContent.trim()).slice(0,5),nFiles:files.length,
      driveIframes:[...document.querySelectorAll('iframe')].filter(f=>/drive\.google|docs\.google/.test(f.src||"")).length,
      cfItems:[...document.querySelectorAll('[data-cfdoc],[data-cfdrv]')].map(x=>x.dataset.cfdrv?("drv:"+x.tagName+":"+x.target):("blob:"+x.tagName)),
      cfNames:[...document.querySelectorAll('[data-cfdoc] b,[data-cfdrv] b')].map(x=>x.textContent.trim()).sort()}});
  }
  // 대표·채진아: 서식 자료실 첫 파일 / 캐시플로우 드라이브 자료를 눌러 새 탭이 열리는지, 화면 안 미리 보기(iframe)가 안 뜨는지
  if(tag==="new"){for(const [r,sel] of [["forms","a[data-dpv]"],["fbox","#dfBox a[data-dpv]"],["cflow","a[data-cfdrv]"],["sitedocs","a[data-dpv]"]]){if((who==="jjh"||who==="bom")&&(r==="fbox"||r==="cflow"))continue;await p.evaluate(h=>{location.hash="#"+h},r);await wait(1500);
    const el=p.locator(sel).first();if(!(await el.count())){out[who]["click_"+r]="링크 없음";continue}
    const pop=ctx.waitForEvent('page',{timeout:5000}).catch(()=>null);await el.click();const np=await pop;await wait(500);
    out[who]["click_"+r]={newTab:np?np.url():null,veil:await p.evaluate(()=>!!document.getElementById('dpVeil')),iframes:await p.evaluate(()=>[...document.querySelectorAll('iframe')].filter(f=>/drive\.google/.test(f.src||"")).length),hash:await p.evaluate(()=>location.hash)};if(np)await np.close()}}
  await p.close()}
 await b.close();return {out,errs}}
(async()=>{const N=await run(NEW,"new");let bad=0;
 for(const [who,R] of Object.entries(N.out))for(const [r,v] of Object.entries(R)){if(r==="siteGroups"){console.log(who,'현장 묶음',JSON.stringify(v));continue}if(r.startsWith("click_")){console.log(who,r,JSON.stringify(v));if(typeof v==="object"&&(!v.newTab||!/drive\.google\.com\/file\/d\//.test(v.newTab)||v.veil||v.iframes))bad++;continue}
  console.log(who.padEnd(5),r.padEnd(8),'파일링크',String(v.nFiles).padStart(2),'| 새탭아님',JSON.stringify(v.notNewTab),'| 드라이브iframe',v.driveIframes,'| ids',v.ids.join(','),v.cfItems.length?'| cf '+v.cfItems.join(','):'');
  if(v.notNewTab.length||v.driveIframes)bad++}
 if(OLD){const O=await run(OLD,"old");for(const who of Object.keys(USERS))for(const r of ROUTES){const k=v=>JSON.stringify([(v||{}).ids||[],(v||{}).cfNames||[]]);const a=r==="cflow"?((O.out[who][r]||{}).cfNames||[]):((O.out[who][r]||{}).ids||[]),b2=r==="cflow"?((N.out[who][r]||{}).cfNames||[]):((N.out[who][r]||{}).ids||[]);const same=JSON.stringify(a)===JSON.stringify(b2);console.log('권한 비교',who,r,same?'같음':'다름! 옛 '+a.join(',')+' / 새 '+b2.join(','));if(!same)bad++}
  console.log('옛 화면 오류',O.errs.slice(0,5))}
 console.log('새 화면 오류',N.errs.slice(0,10));if(N.errs.length)bad++;
 console.log(bad?'실패 '+bad+'건':'모두 통과');process.exit(bad?1:0)})();
