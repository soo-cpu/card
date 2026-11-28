// 현장소통 직원 열쇠 카드 쉽게 시험 (v0.99-46, 2026-11-23): node intranet/tools/test/fstcard_test.js [index.html]
// 대표 화면: 맨 위 '직원에게 보내지 않아요' 안내 · 큰 상태(열쇠 없음 → 연결 준비됨) · 만든 직후 큰 '열쇠 복사'(48px 이상, 넓게) · 3단계 · 연결 시험 링크(입장권)
// 직원(정진혁·이봄이·채진아) 화면: 카드·안내·연결 시험 링크 모두 없음 · 복사·새로 만들기 동작 전과 같음(옛 열쇠 hist)
const {chromium,devices}=require('playwright');const fs=require('fs'),crypto=require('crypto'),path=require('path');
const ROOT=path.join(__dirname,'../../..');
const HTML=fs.readFileSync(process.argv[2]||path.join(ROOT,'intranet/index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const BASE='https://soo-cpu.github.io/card/field/';
const TK_RE=/^(\d{13})\.([A-Za-z0-9_-]{1,120})\.([A-Za-z0-9_-]{16,64})\.([A-Za-z0-9_-]{43})$/;
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,200))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const sigOk=(key,k)=>{const m=TK_RE.exec(k);return !!m&&crypto.createHmac('sha256',key).update(m[1]+'.'+m[2]+'.'+m[3]).digest('base64url')===m[4]};
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];let accept=false;
 for(const [vn,opt] of [['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]]){
  const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul'},opt));
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|github\.io/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const dbNow=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')||'{}'));
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{if(accept&&d.type()==='confirm')return d.accept();dialogs.push(who+' '+d.type());d.dismiss()});
   await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);
   await p.evaluate(()=>{window.__hrefs=[];document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[data-fadm]');if(a){window.__hrefs.push(a.href);e.preventDefault()}})});return p};
  const A=await open('admin',12000);await A.evaluate(()=>{location.hash='#forms'});await wait(1200);
  const card=A.locator('#fstCfg');if(!(await card.evaluate(d=>d.open)))await A.locator('#fstCfg summary').click();await wait(300);
  const note=await A.locator('#fstNote').innerText().catch(()=>'');
  ok(vn+' 대표: 카드 맨 위 안내 ‘직원에게 보내지 않아요’ + 관리 화면 열기',/직원에게 보내지 않아요/.test(note)&&/관리 화면 열기/.test(note)&&await A.evaluate(()=>{const d=document.getElementById('fstCfg'),n=document.getElementById('fstNote');return d.children[1]===n}),note);
  ok(vn+' 대표: 열쇠 없음 → 큰 상태 ‘열쇠 없음’ · 연결 시험 링크 없음',/^열쇠 없음/.test(await A.locator('#fstState').innerText())&&await A.locator('#fstTest').count()===0&&await A.locator('[data-fstcopy]').count()===0);
  const steps=await A.locator('#fstSteps li').allInnerTexts();
  ok(vn+' 대표: 붙여 넣는 순서 번호 3단계 (복사 · 스크립트 속성 FIELD_STAFF_KEY 저장 · Code.gs 새 버전)',steps.length===3&&/열쇠 복사/.test(steps[0])&&/프로젝트 설정/.test(steps[1])&&/스크립트 속성/.test(steps[1])&&/FIELD_STAFF_KEY/.test(steps[1])&&/저장/.test(steps[1])&&/Code\.gs/.test(steps[2])&&/새 버전/.test(steps[2]),steps.join(' / '));
  await A.locator('[data-fstnew]').click();await wait(1200);
  const KEY=await A.locator('#fstVal').inputValue().catch(()=>'');const cp=A.locator('[data-fstcopy]');
  const box=await cp.boundingBox().catch(()=>null),fw=await A.locator('#fstVal').boundingBox().catch(()=>null);
  ok(vn+' 대표: 만든 직후 열쇠 칸 아래 큰 ‘열쇠 복사’ 하나 (높이 48px 이상 · 칸 너비만큼)',/^[A-Za-z0-9_-]{43}$/.test(KEY)&&await cp.count()===1&&/열쇠 복사/.test(await cp.innerText())&&box&&fw&&box.height>=47.5&&box.width>=fw.width*0.9&&box.y>fw.y,JSON.stringify({box,fw}));
  await A.evaluate(()=>{window.__clip='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:t=>{window.__clip=t;return Promise.resolve()}}})});await cp.click();await wait(300);
  ok(vn+' 대표: ‘열쇠 복사’ → 클립보드에 열쇠 (전과 같은 동작)',await A.evaluate(()=>window.__clip)===KEY);
  // 클립보드가 막혀도 길게 눌러 복사할 칸은 남아 있음
  await A.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('x'))}});document.execCommand=()=>false});await cp.click();await wait(400);
  ok(vn+' 대표: 복사가 막히면 안내 + 열쇠 칸 그대로',/길게 눌러/.test(await A.evaluate(()=>Array.from(document.querySelectorAll('.toast')).map(t=>t.textContent).join('|')))&&await A.locator('#fstVal').inputValue()===KEY);
  ok(vn+' 대표: 상태 ‘연결 준비됨(열쇠 있음 · 만든 때)’',/연결 준비됨/.test(await A.locator('#fstState').innerText())&&/열쇠 있음 · 만든 때 \d{4}-\d\d-\d\d \d\d:\d\d/.test(await A.locator('#fstState').innerText()),await A.locator('#fstState').innerText());
  const t=A.locator('#fstTest');const th=await t.evaluate(a=>[a.getAttribute('href'),a.target,a.rel,a.dataset.fadm]).catch(()=>null);
  ok(vn+' 대표: 연결 시험 = 기존 관리 화면 주소(?admin) · data-fadm · 새 탭 보통 링크 · 안내 글',th&&th[0]===BASE+'?admin'&&th[1]==='_blank'&&/noopener/.test(th[2])&&th[3]==='1'&&/비밀번호 없이 열리면 연결 완료/.test(await card.innerText())&&/②를 다시 확인/.test(await card.innerText()),JSON.stringify(th));
  await t.click();await wait(300);const h=await A.evaluate(()=>window.__hrefs[window.__hrefs.length-1]||'');const k=h.split('#k=')[1]||'';
  ok(vn+' 대표: 연결 시험 누르면 입장권 붙음 (열쇠 서명 · 주소에 열쇠 없음) · 뒤에는 보통 주소로',h.split('#k=')[0]===BASE+'?admin'&&sigOk(KEY,k)&&!h.includes(KEY)&&await (async()=>{await wait(800);return await t.getAttribute('href')===BASE+'?admin'})(),h.slice(0,80));
  const btnBox=await A.locator('#fstTest').boundingBox();ok(vn+' 대표: 연결 시험 버튼도 크게 (48px 이상)',btnBox&&btnBox.height>=47.5,JSON.stringify(btnBox));
  ok(vn+' 대표: 가로 넘침 없음',await A.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
  await A.locator('[data-fsthide]').click();await wait(400);
  ok(vn+' 대표: 가리기 → 열쇠 글자 화면에 없음 · 작은 ‘복사’ 하나만',!(await A.content()).includes(KEY)&&await A.locator('[data-fstcopy]').count()===1&&!/열쇠 복사$/.test(await A.locator('[data-fstcopy]').innerText()));
  let D=await dbNow();
  ok(vn+' 저장: 열쇠는 config/fstaff 에만 (기록 등 다른 문서에 없음)',D['config/fstaff']&&D['config/fstaff'].key===KEY&&Object.keys(D).filter(x=>x!=='config/fstaff'&&JSON.stringify(D[x]).includes(KEY)).length===0);
  accept=true;await A.locator('[data-fstnew]').click();await wait(1500);accept=false;
  const K2=await A.locator('#fstVal').inputValue().catch(()=>'');D=await dbNow();const f=D['config/fstaff']||{};
  ok(vn+' 대표: 새로 만들기(확인 한 번) → 새 열쇠 · 옛 열쇠는 hist 에 그대로',K2&&K2!==KEY&&f.key===K2&&(f.hist||[]).length===1&&f.hist[0].key===KEY);
  // 직원 3명
  await wait(1500);
  for(const w of (vn==='PC'?['jjh','bom','cja']:['jjh'])){const P=await open(w);await P.evaluate(()=>{location.hash='#forms'});await wait(900);
   const r=await P.evaluate(()=>({card:!!document.getElementById('fstCfg'),note:!!document.getElementById('fstNote'),test:!!document.getElementById('fstTest'),btn:!!document.querySelector('[data-fstnew],[data-fstcopy],[data-fsthide]'),txt:/FIELD_STAFF_KEY|직원에게 보내지 않아요|연결 시험/.test(document.body.innerText)}));
   ok(vn+' '+USERS[w].name+': 열쇠 카드·안내·연결 시험·버튼 모두 없음',!r.card&&!r.note&&!r.test&&!r.btn&&!r.txt,JSON.stringify(r));
   ok(vn+' '+USERS[w].name+': 열쇠 값이 화면 글에 없음',!(await P.content()).includes(K2));await P.close()}
  await A.close();await ctx.close()}
 const i=HTML.indexOf('function fstCard(){'),j=HTML.indexOf('window.addEventListener("hashchange",()=>{FST_SHOW=""})'),seg=HTML.slice(i,j);
 ok('소스: 카드 구간에 alert/confirm/prompt/window.open/iframe 없음 · me.admin 조건 유지 · 새 외부 주소 없음',i>0&&j>i&&!/alert\(|[^.]confirm\(|prompt\(|window\.open|<iframe/.test(seg)&&/if\(!me\.admin\|\|mode!=="shared"\|\|PV\)return ""/.test(seg)&&!/https?:\/\//.test(seg));
 ok('화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
