// 직원 화면 미리 보기 시험 (2026-11-12): node intranet/tools/test/preview_test.js [index.html]
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},"staff/st_out":{name:"최남수",level:"",state:"재직",intra:"사용 안 함"},
 "hr/st_jjh":{salary:"77777777",phone:"010-9999-0000"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"21212121",cat:"주거",inq:"2026-11-01",work:"욕실",updatedAt:"2026-11-01T00:00:00Z"},
 "ppriv/p1":{estCost:"20202020"},
 "approvals/a1":{kind:"기안품의서 (본사)",title:"정진혁 올린 결재",status:"결재 대기",step:0,line:["정진혁","채진아","최윤수","신혜현"],pno:"본사",amount:120000,createdBy:"u_jjh",createdAt:"2026-11-12T01:00:00Z",updatedAt:"2026-11-12T01:00:00Z",history:[]},
 "approvals/a2":{kind:"기안품의서 (본사)",title:"이봄이 올린 결재",status:"결재 대기",step:0,line:["이봄이","채진아","최윤수","신혜현"],pno:"본사",amount:50000,createdBy:"u_bom",createdAt:"2026-11-12T01:00:00Z",updatedAt:"2026-11-12T01:00:00Z",history:[]},
 "fin/bonuspay":{rows:[{name:"정진혁",amt:"13131313"}]}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push([v?"통과":"실패",n,x||""]);console.log(v?"통과":"실패",n,x||"")};
(async()=>{const b=await chromium.launch();const errs=[];
 const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
 async function open(who){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{errs.push(who+' 대화상자');d.dismiss()});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(7000);return p}
 const navs=p=>p.evaluate(()=>[...document.querySelectorAll('#nav a')].map(a=>a.getAttribute('href')));
 // 직원 계정: 메뉴 없음 + 주소 직접
 for(const w of ['jjh','cja']){const P=await open(w);const n=await navs(P);ok(w+' 메뉴에 미리 보기 없음',!n.includes('#preview'));await P.evaluate(()=>{location.hash='#preview'});await wait(800);const t=await P.evaluate(()=>document.body.innerText);ok(w+' 주소 직접 입력해도 안 열림',!/직원 고르기|이 직원 화면 보기/.test(t));ok(w+' 화면에 data-pvgo 없음',(await P.locator('[data-pvgo]').count())===0);await P.close()}
 // 대표
 const A=await open('admin');await wait(3000);let n=await navs(A);ok('대표 메뉴에 미리 보기 있음',n.includes('#preview'));
 await A.evaluate(()=>{location.hash='#preview'});await wait(1000);
 const names=await A.locator('[data-pvgo]').evaluateAll(els=>els.map(e=>e.closest('.item').querySelector('b').innerText.trim()));
 ok('직원 목록 순서 정진혁·이봄이·채진아 (대표·미사용 제외)',/^정진혁 실장/.test(names[0])&&/^이봄이 실장/.test(names[1])&&/^채진아 차장/.test(names[2])&&names.length===3,names.join(' | '));
 await A.screenshot({path:OUT+'/pv_menu.png'});
 const before=await D();const adminNav=n.length;
 await A.locator('[data-pvgo="st_jjh"]').click();await wait(2500);
 const bar=await A.locator('#pvTop').innerText().catch(()=>"");ok('띠: 정진혁 실장 화면 미리 보기 중 (읽기 전용)',/정진혁 실장 화면 미리 보기 중 \(읽기 전용\)/.test(bar)&&/내 화면으로 돌아가기/.test(bar),bar.replace(/\n/g,' / '));
 n=await navs(A);ok('정진혁 메뉴: 재무·인사·성과금·대표 전용 없음',!n.some(h=>['#fdash','#fstate','#cflow','#bonus','#fcost','#recv','#fbox','#staff','#preview','#drvchg','#trash','#amtchk'].includes(h))&&n.length<adminNav,n.join(' '));
 let d=await D();const log0=(d['knock/u_boss']||{}).log||[];ok('접속 기록: 시작 (누가·언제·어느 직원)',log0.some(l=>l.what==='직원 화면 미리 보기 시작'&&l.target==='정진혁 실장'&&l.at)&&d['knock/u_boss'].name==='최윤수',JSON.stringify(log0[0]));
 await A.screenshot({path:OUT+'/pv_home.png'});
 // 화면들
 const leaks=[];for(const h of ['#home','#projects','#approvals','#quotes','#sites','#customers','#goal','#bonus','#fdash','#staff','#myhr']){await A.evaluate(x=>{location.hash=x},h);await wait(700);const t=await A.evaluate(()=>document.body.innerText);if(/21212121|21,212,121|20202020|20,202,020|13131313|13,131,313|77777777|77,777,777|010-9999-0000/.test(t))leaks.push(h);if(!(await A.locator('#pvTop').isVisible()))leaks.push(h+' 띠 없음')}
 ok('미리 보기 11화면: 원가·성과금·급여 숫자 없음, 띠 계속 보임',!leaks.length,leaks.join(','));
 await A.evaluate(()=>{location.hash='#approvals'});await wait(900);const apT=await A.locator('tbody').first().innerText().catch(()=>"");ok('전자결재: 본인(정진혁)이 올린 것만',/정진혁 올린 결재/.test(apT)&&!/이봄이 올린 결재/.test(apT),apT.replace(/\n/g,' '));
 // 쓰기 시도: 프로젝트 저장
 await A.evaluate(()=>{location.hash='#projects'});await wait(900);{const pt=await A.locator('.tablebox tbody').first().innerText().catch(()=>'');ok('미리 보기 프로젝트 목록에 담당 현장 보임 (금액은 보이고 원가·마진 열 없음)',/시험 현장/.test(pt)&&!/21,212,121|20,202,020/.test(pt),pt.replace(/\n/g,' '))}await A.locator('tr[data-open]').first().click({timeout:5000});await wait(1000);
 const inp=A.locator('[data-k="work"]').first();if(await inp.count()){await inp.fill('미리 보기에서 고침');const sv=A.locator('.sheet button').filter({hasText:/^저장/}).first();if(await sv.count()){await sv.click();await wait(1500)}}
 ok('띠가 창(시트) 위에서도 보임',await A.locator('#pvTop').isVisible());await A.screenshot({path:OUT+'/pv_sheet.png'});await A.keyboard.press('Escape');await wait(300);
 // 결재 올리기 + 파일 올리기
 await A.evaluate(()=>{location.hash='#approvals'});await wait(800);await A.locator('button').filter({hasText:'결재 올리기'}).first().click();await wait(900);
 if(await A.locator('#fileIn').count()){await A.setInputFiles('#fileIn',{name:'x.png',mimeType:'image/png',buffer:Buffer.from('png')});await wait(1200)}
 const tt=A.locator('[data-k="title"]').first();if(await tt.count()){await tt.fill('미리 보기 결재');const sv=A.locator('.sheet button').filter({hasText:/올리기|저장/}).last();await sv.click().catch(()=>{});await wait(1500)}
 await A.keyboard.press('Escape');await wait(300);
 // 직접 호출로도 막히는지 (put, 알림 확인, 결재)
 const direct=await A.evaluate(async()=>{const out=[];try{await window.claude.use('db')}catch(e){}return out});
 d=await D();const changed=Object.keys(Object.assign({},before,d)).filter(k=>JSON.stringify(before[k])!==JSON.stringify(d[k]));
 ok('미리 보기 중 저장소 변경 = 대표 접속 기록(knock/u_boss)뿐',changed.length===1&&changed[0]==='knock/u_boss',changed.join(','));
 ok('파일 올리기 0건',!(await A.evaluate(()=>(window.__mockUploads||[]).length)));
 ok('원본 그대로 (프로젝트 공사 내용)',d['projects/p1'].work==='욕실');
 // 돌아가기
 await A.locator('#pvTop [data-pvexit]').click();await wait(8000);
 n=await navs(A);ok('내 화면으로 돌아가기 → 대표 메뉴 복귀',n.includes('#preview')&&n.includes('#bonus')&&!(await A.locator('#pvTop').count()));
 d=await D();const lg=(d['knock/u_boss']||{}).log||[];ok('접속 기록: 끝',lg.some(l=>l.what==='직원 화면 미리 보기 끝'&&l.target==='정진혁 실장'));
 await A.evaluate(()=>{location.hash='#preview'});await wait(1200);const pvT=await A.evaluate(()=>document.body.innerText);ok('미리 보기 기록 표에 시작·끝',/시작/.test(pvT)&&/끝/.test(pvT)&&/정진혁 실장/.test(pvT));
 await A.screenshot({path:OUT+'/pv_log.png',fullPage:true});
 // 채진아 미리 보기: 재무 보임, 성과금 없음
 await A.locator('[data-pvgo="st_cja"]').click();await wait(2500);n=await navs(A);ok('채진아 미리 보기: 재무 보임·성과금 없음',n.includes('#cflow')&&!n.includes('#bonus')&&!n.includes('#preview'),n.join(' '));
 await A.close();
 // 휴대폰 띠
 const mc=await b.newContext(devices['Pixel 7']);await mc.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await mc.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const ms=await mc.newPage();await ms.goto('http://hf.test/seed');await ms.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const M=await mc.newPage();M.on('pageerror',e=>errs.push('mob: '+e.message));await M.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS.admin)};`+MOCK);await M.goto('http://hf.test/');await wait(9000);
 await M.evaluate(()=>{document.getElementById('navMore').click()});await wait(300);await M.evaluate(()=>{location.hash='#preview'});await wait(900);await M.locator('[data-pvgo="st_bom"]').click();await wait(2500);
 ok('휴대폰: 띠 보임·가로 넘침 없음',(await M.locator('#pvTop').isVisible())&&(await M.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=2);await M.screenshot({path:OUT+'/pv_mob.png'});
 ok('오류·브라우저 대화상자 0',!errs.length,errs.slice(0,5).join(' | '));
 fs.writeFileSync(OUT+'/preview_result.json',JSON.stringify(R,null,1));await b.close()})();
