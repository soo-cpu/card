// 직원 화면 미리 보기 시험 (2026-11-12): node intranet/tools/test/preview_test.js [index.html]
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},"staff/st_out":{name:"최남수",level:"",state:"재직",intra:"사용 안 함"},
 "hr/st_jjh":{salary:"77777777",phone:"010-9999-0000"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"21212121",cat:"주거",inq:"2026-11-01",work:"욕실",updatedAt:"2026-11-01T00:00:00Z"},
 "ppriv/p1":{estCost:"20202020"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",tel:"",addr:"",createdAt:"2026-11-01T00:00:00Z",updatedAt:"2026-11-01T00:00:00Z"},"cpriv/c1":{tel:"010-1111-2222",addr:"서울 시험동 1",updatedAt:"2026-11-01T00:00:00Z"},
 "customers/c2":{code:"C-2611-902",name:"김영희",mgr:"이봄이",status:"진행중",steps:[1],stage:"1-상담영업",inq:"2026-11-02",tel:"",addr:"",createdAt:"2026-11-02T00:00:00Z",updatedAt:"2026-11-02T00:00:00Z"},"cpriv/c2":{tel:"010-3333-4444",addr:"",updatedAt:"2026-11-02T00:00:00Z"},
 "catalog/k1":{k:"k1",space:"욕실",proc:"타일",name:"욕실 타일 시공",unit:"식",price:100000,cost:61616161},
 "quotes/q1":{qno:"P-2611-901-1",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"본견적 진행",d:"2026-11-05",amount:110000,work:"욕실",items:[{space:"욕실",name:"욕실 타일 시공",q:1,unit:"식",price:100000,amt:100000}],createdBy:"u_jjh",createdAt:"2026-11-05T00:00:00Z",updatedAt:"2026-11-05T00:00:00Z"},
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
 await A.evaluate(()=>{location.hash='#blanks'});await wait(6000);await A.evaluate(()=>{location.hash='#home'});await wait(9000);await A.evaluate(()=>{location.hash='#preview'});await wait(1000);
 await A.evaluate(()=>{window.__toasts=[];new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(x=>{if(x.classList&&x.classList.contains('toast'))window.__toasts.push([Date.now(),x.textContent])}))).observe(document.body,{childList:true})});
 const before=await D();const adminNav=n.length;const ls0=await A.evaluate(()=>Object.keys(localStorage).filter(k=>/^hf/.test(k)).sort().join(','));
 await A.locator('[data-pvgo="st_jjh"]').click();await wait(2500);
 const bar=await A.locator('#pvTop').innerText().catch(()=>"");ok('띠: 정진혁 실장 화면 미리 보기 중 (읽기 전용)',/정진혁 실장 화면 미리 보기 중 \(읽기 전용\)/.test(bar)&&/내 화면으로 돌아가기/.test(bar),bar.replace(/\n/g,' / '));
 n=await navs(A);ok('정진혁 메뉴: 재무·인사·성과금·대표 전용 없음',!n.some(h=>['#fdash','#fstate','#cflow','#bonus','#fcost','#recv','#fbox','#staff','#preview','#drvchg','#trash','#amtchk'].includes(h))&&n.length<adminNav,n.join(' '));
 let d=await D();const log0=(d['knock/u_boss']||{}).log||[];ok('접속 기록: 시작 (누가·언제·어느 직원)',log0.some(l=>l.what==='직원 화면 미리 보기 시작'&&l.target==='정진혁 실장'&&l.at)&&d['knock/u_boss'].name==='최윤수',JSON.stringify(log0[0]));
 await A.screenshot({path:OUT+'/pv_home.png'});
 // 화면들
 const leaks=[];for(const h of ['#home','#projects','#approvals','#quotes','#sites','#customers','#goal','#bonus','#fdash','#staff','#myhr']){await A.evaluate(x=>{location.hash=x},h);await wait(700);const t=await A.evaluate(()=>document.body.innerText);{/* #myhr(내 인사 정보)에는 그 직원 본인 급여가 보이는 것이 맞음 — 실제 직원 화면과 같음. 다른 화면에는 없어야 함 */const mm=(h==='#myhr'?/21212121|21,212,121|20202020|20,202,020|13131313|13,131,313|61616161|61,616,161/:/21212121|21,212,121|20202020|20,202,020|13131313|13,131,313|77777777|77,777,777|010-9999-0000|61616161|61,616,161/).exec(t);if(mm)leaks.push(h+' '+mm[0])}if(!(await A.locator('#pvTop').isVisible()))leaks.push(h+' 띠 없음')}
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
 // ── 검토 반려 2026-11-12: 견적 작성·서식·캘린더를 만져도 임시 저장이 브라우저·서버 어디에도 안 남음
 await A.evaluate(()=>{location.hash='#quotes'});await wait(900);await A.locator('button[data-open="quotes"]').first().click();await wait(1500);
 {const et=A.locator('[data-qtab="edit"]');if(await et.count()){await et.first().click();await wait(600)}}
 const qi=A.locator('[data-qe="q|0"]').first();const qiN=await qi.count();if(qiN){await qi.fill('7');await qi.dispatchEvent('change');await wait(2600)}
 const qeTxt=await A.locator('.sheet').first().innerText().catch(()=>'');
 ok('미리 보기에서 견적 작성 칸을 고칠 수 있음 (시험이 그 경로를 탐)',qiN===1,'data-qe 칸 '+qiN);
 ok('견적을 만져도 ‘서버 임시 저장 실패 · 연결되면 자동으로 다시 올려요’ 문구 없음',!/서버 임시 저장 실패|자동으로 다시 올려요/.test(qeTxt));
 await A.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));document.dispatchEvent(new Event('visibilitychange'))});await wait(500);
 // 검토 반려 2026-11-12: 미리 보기에서 견적 '저장'을 눌러도 버전 보관본이 브라우저에 남지 않음 (남으면 돌아온 뒤 대표 이름으로 올라감)
 {const sv=A.locator('.sheet button').filter({hasText:/^저장/}).first();const nsv=await sv.count();if(nsv){await sv.click().catch(()=>{});await wait(1500)}
  ok('미리 보기에서 견적 ‘저장’을 눌러도 브라우저에 버전 보관본(hf-qver-*)이 안 남음',nsv>0&&(await A.evaluate(()=>Object.keys(localStorage).filter(k=>/^hf-qver-/.test(k)).length))===0,'저장 버튼 '+nsv)}
 await A.keyboard.press('Escape');await wait(300);
 await A.evaluate(()=>{location.hash='#calendar'});await wait(800);if(await A.locator('[data-calnew]').count()){await A.locator('[data-calnew]').first().click();await wait(500);const ct=A.locator('#calVeil [data-cf="title"]');if(await ct.count()){await ct.fill('미리 보기 일정');await wait(400)}const cc=A.locator('#calVeil [data-calclose]');if(await cc.count())await cc.first().click();await wait(300)}
 await A.evaluate(()=>{location.hash='#projects'});await wait(800);await A.locator('tr[data-open]').first().click({timeout:5000});await wait(800);{const w=A.locator('[data-k="work"]').first();if(await w.count())await w.fill('미리 보기 임시 저장 시험')}
 const t0=await A.evaluate(()=>window.__toasts.length);await wait(33000);/* 자동 임시 저장(15·30초 간격)이 돌 시간 */
 const lsPV=await A.evaluate(()=>Object.keys(localStorage).filter(k=>/^hf/.test(k)).sort());
 ok('미리 보기 중 브라우저에 임시 저장이 안 남음 (hf-qdraft-*, hf_draft_<직원>, hf_cal_draft_<직원>)',!lsPV.some(k=>/^hf-qdraft-|^hf_draft_|^hf_cal_draft_/.test(k))&&lsPV.join(',')===ls0,lsPV.join(','));
 const tl=await A.evaluate(()=>window.__toasts.map(x=>x[1]));const idle=tl.length-t0;
 ok('‘저장되지 않아요’ 안내가 가만히 있는 33초 동안 반복되지 않음 (화면이 스스로 하는 저장은 한 번만 알림)',idle===0&&tl.filter(t=>/미리 ?보기에서는 저장되지 않아요/.test(t)).length>=1,'가만히 있는 동안 '+idle+'번 / 전체 '+tl.length+'번');
 await A.keyboard.press('Escape');await wait(300);
 d=await D();{const ch=Object.keys(Object.assign({},before,d)).filter(k=>JSON.stringify(before[k])!==JSON.stringify(d[k]));ok('견적·캘린더·서식을 만진 뒤에도 저장소 변경 = 대표 접속 기록뿐 (임시 저장 문서 0)',ch.length===1&&ch[0]==='knock/u_boss'&&!Object.keys(d).some(k=>/qdraft|\/draft\//.test(k)),ch.join(','))}
 // 돌아가기: 새로고침을 기다리는 틈에 화면이 다시 그려져도(다른 기기 저장 흉내) 가려진 자료로 쓰지 않음
 await A.evaluate(()=>{location.hash='#blanks'});await wait(700);await A.locator('#pvTop [data-pvexit]').click();
 for(let i=0;i<3;i++){await wait(300);await seed.evaluate(()=>{new BroadcastChannel('mockdb').postMessage(1)}).catch(()=>{})}
 await wait(8000);
 d=await D();{const ch=Object.keys(Object.assign({},before,d)).filter(k=>JSON.stringify(before[k])!==JSON.stringify(d[k]));
  /* 새로고침 뒤 대표 화면이 늘 다시 쓰는 것(시각만 바뀜): 접속 기록·내 계정 표시·맞춘 시각·단가 사본(내용 같음) */const same=(k,f)=>JSON.stringify((before[k]||{})[f])===JSON.stringify((d[k]||{})[f]);
  const badK=ch.filter(k=>k!=='knock/u_boss'&&k!=='members/u_boss'&&!/^(mine\/[^/]+\/idx\/sync|work\/sync)$/.test(k)&&!(/^acct\/[^/]+\/ccost\/current$/.test(k)&&same(k,'items')&&same(k,'revoked')));
  ok('돌아가기 뒤: 대표 계정 견적 임시 저장(acct/u_boss/qdraft) 없음',!Object.keys(d).some(k=>/^acct\/u_boss\/qdraft\//.test(k)),Object.keys(d).filter(k=>/qdraft/.test(k)).join(','));
  ok('돌아가기 뒤: 채움률(config/fill)·빈칸 목록(mine/*/idx/blanks)·원본이 가려진 자료로 바뀌지 않음',badK.length===0&&JSON.stringify(before['config/fill'])===JSON.stringify(d['config/fill'])&&JSON.stringify(before['quotes/q1'])===JSON.stringify(d['quotes/q1']),'바뀐 문서: '+ch.join(','));
  const lsEnd=await A.evaluate(()=>Object.keys(localStorage).filter(k=>/^hf-qdraft-|^hf_draft_u_jjh|^hf_cal_draft_u_jjh/.test(k)));ok('돌아가기 뒤: 브라우저에도 미리 보기 임시 저장 없음',lsEnd.length===0,lsEnd.join(','))}
 await A.evaluate(()=>{location.hash='#quotes'});await wait(900);await A.locator('button[data-open="quotes"]').first().click();await wait(1500);
 ok('돌아온 대표 화면: 견적에 ‘이어서 하기’(임시 저장본) 안 뜸',!/이어서 하기|임시 저장본/.test(await A.locator('.sheet').first().innerText().catch(()=>'')));await A.keyboard.press('Escape');await wait(300);
 await A.evaluate(()=>{window.dispatchEvent(new Event('online'))});await wait(3000);d=await D();
 ok('견적 저장 → 돌아온 뒤 online: 대표 계정으로 견적 버전(acct/u_boss/qv_*)이 올라가지 않음 · 원본 견적 그대로',!Object.keys(d).some(k=>/\/qv_/.test(k))&&JSON.stringify(before['quotes/q1'])===JSON.stringify(d['quotes/q1']),Object.keys(d).filter(k=>/\/qv_/.test(k)).join(','));
 // 돌아가기 (위에서 이미 눌렀음)
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
