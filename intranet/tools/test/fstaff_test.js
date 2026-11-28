// 현장소통 직원 열쇠·입장권 시험 (v0.99-40, 2026-11-19): node intranet/tools/test/fstaff_test.js [index.html]
// 1부 서버(Code.gs · Node 틀): 입장권 확인·5분·한 번만·출입증 6시간·비밀번호 잠금·확인 번호(PIN) 그대로
// 2부 인트라넷(가짜 저장소): 버튼 3개·관리 화면 열기·열쇠 없음 → 보통 주소·직원은 열쇠 읽기만·주소에 전화·금액·원가·열쇠 없음·가린 줄에는 버튼 없음·대표 화면 열쇠 만들기(옛 열쇠 hist)
// 3부 현장소통 화면(field/index.html): 입장권 → 관리 화면(비밀번호 화면 없음)·주소에서 바로 지움·실패하면 비밀번호 화면·고객 화면·확인 번호·비밀번호 로그인 그대로
const {chromium,devices}=require('playwright');const fs=require('fs'),crypto=require('crypto'),path=require('path');
const ROOT=path.join(__dirname,'../../..');
const HTML=fs.readFileSync(process.argv[2]||path.join(ROOT,'intranet/index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const FIELD=fs.readFileSync(path.join(ROOT,'field/index.html'),'utf8');const GS=fs.readFileSync(path.join(ROOT,'intranet/field-script/Code.gs'),'utf8');
const makeServer=require('./gs_field_harness.js');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",approvals:[{amt:1515151,t:"자재"}],cat:"주거",inq:"2026-11-01",work:"욕실",start:"2026-11-05",endPlan:"2026-12-20",updatedAt:T0},"ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "projects/p2":{no:"P-2605-902",title:"지난 현장 주방",custName:"홍길동",custCode:"C-2611-901",stage:"사후관리",mgr:"이봄이",contractAmt:"12000000",cat:"주거",inq:"2026-04-01",work:"주방",start:"2026-04-10",end:"2026-05-01",warrantyEnd:"2027-05-01",warrantyMonths:12,fieldCode:"https://soo-cpu.github.io/card/field/?s=AbCdEfGhIjKlMnOpQrStUv12",updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",code:"C-2611-901",name:"시험 현장 욕실",customer:"홍길동",mgr:"정진혁",status:"공사 중",proc:"타일",progress:"40",start:"2026-11-05",logs:[],updatedAt:T0},
 "quotes/q1":{qno:"P-2611-901-1차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"계약",d:"2026-11-03",amount:"3300000",qCost:"2121212",items:[],updatedAt:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const BASE='https://soo-cpu.github.io/card/field/',CODE='AbCdEfGhIjKlMnOpQrStUv12';
const TK_RE=/^(\d{13})\.([A-Za-z0-9_-]{1,120})\.([A-Za-z0-9_-]{16,64})\.([A-Za-z0-9_-]{43})$/;
const LEAK=/홍길동|%ED%99%8D|1234|5678|33000000|12000000|20202020|2121212|1515151|3300000|원가|마진|%EC%9B%90%EA%B0%80/; // 고객 이름·전화·금액·원가
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const hmac=(key,msg)=>crypto.createHmac('sha256',key).update(msg).digest('base64url');
const sigOk=(key,k)=>{const m=TK_RE.exec(k);return !!m&&hmac(key,m[1]+'.'+m[2]+'.'+m[3])===m[4]};
const whoOf=k=>{const m=TK_RE.exec(k);return m?Buffer.from(m[2],'base64url').toString('utf8'):''};

function part1(){ // ===== 1부: 서버 (Code.gs) =====
  const KEY=crypto.randomBytes(32).toString('base64url');
  const S=makeServer();S.setPw('pw-test-77');
  ok('서버 1: 속성 FIELD_STAFF_KEY 없음 → 입장권 거절(분명한 안내)',/FIELD_STAFF_KEY/.test(S.post({a:'ticket',k:S.ticket(KEY)}).error||''));
  S.setProp('FIELD_STAFF_KEY',KEY);
  const k1=S.ticket(KEY,{who:'정진혁'}),r1=S.post({a:'ticket',k:k1});
  ok('서버 2: 맞는 입장권 → 출입증',r1.ok&&/^[0-9a-f]{64}$/.test(r1.token||''),JSON.stringify(r1).slice(0,60));
  ok('서버 3: 출입증("T:…")으로 관리 요청(sites·login) 통과',S.post({a:'sites',pw:'T:'+r1.token}).ok&&S.post({a:'login',pw:'T:'+r1.token}).ok);
  ok('서버 4: 같은 입장권 다시 → 거절',/이미 쓴/.test(S.post({a:'ticket',k:k1}).error||''));
  ok('서버 5: 6분 지난 입장권·6분 앞선 입장권 거절, 4분 지난 것은 통과',/시간/.test(S.post({a:'ticket',k:S.ticket(KEY,{ts:Date.now()-6*6e4})}).error||'')&&/시간/.test(S.post({a:'ticket',k:S.ticket(KEY,{ts:Date.now()+6*6e4})}).error||'')&&S.post({a:'ticket',k:S.ticket(KEY,{ts:Date.now()-4*6e4})}).ok);
  const bad=S.ticket(crypto.randomBytes(32).toString('base64url')),g=S.ticket(KEY),gm=TK_RE.exec(g);
  ok('서버 6: 다른 열쇠로 만든 것·이름만 바꾼 것·시각만 바꾼 것·모양이 다른 것 거절',[bad,gm[1]+'.'+Buffer.from('최윤수').toString('base64url')+'.'+gm[3]+'.'+gm[4],(Number(gm[1])+1)+'.'+gm[2]+'.'+gm[3]+'.'+gm[4],'abc','',gm[1]+'.'+gm[2]+'.'+gm[3],g+'x'].every(k=>S.post({a:'ticket',k}).ok===false));
  ok('서버 7: 고친 뒤에도 원래 입장권은 아직 쓸 수 있음(틀린 시도가 한번값을 태우지 않음)',S.post({a:'ticket',k:g}).ok);
  ok('서버 8: 없는 출입증·빈 값은 거절 (비밀번호 확인으로 넘어감)',[ 'T:'+'0'.repeat(64),'T:','T:null','' ].every(pw=>S.post({a:'sites',pw}).ok===false));
  delete S.st.cache.pwfail;
  ok('서버 9: 비밀번호 로그인 그대로',S.post({a:'login',pw:'pw-test-77'}).ok&&S.post({a:'login',pw:'pw-test-78'}).error==='비밀번호가 맞지 않아요');
  delete S.st.cache.pwfail;for(let i=0;i<10;i++)S.post({a:'login',pw:i%2?'T:'+String(i).repeat(40):'wrong-pw-'+i}); /* 서버 v9(드라이브본)부터 출입증 모양(T:)은 비밀번호 틀린 횟수로 세지 않음 → 틀린 비밀번호를 섞어 10번 채움 */for(let i=0;i<5;i++)S.post({a:'login',pw:'wrong-more-'+i});
  ok('서버 10: 틀린 값 10번(가짜 출입증 포함) → 잠금 그대로, 맞는 비밀번호도 15분 막힘',/잠겼/.test(S.post({a:'login',pw:'pw-test-77'}).error||''));
  ok('서버 11: 잠금 중에도 살아 있는 출입증은 통과(비밀번호 추측과 무관)',S.post({a:'sites',pw:'T:'+r1.token}).ok);
  delete S.st.cache.pwfail;
  const a=S.post({a:'addSite',pw:'T:'+r1.token,name:'시험 현장',pin:'4321',proj:'P-2611-901'});
  const lg=S.rowsOf('기록');
  ok('서버 12: 출입증으로 현장 추가 → 기록 ‘누가’ = 직원 이름, 비밀번호로 하면 ‘관리’',a.ok&&lg.some(r=>r[1]==='현장 추가'&&r[3]==='정진혁')&&lg.some(r=>r[1]==='직원 입장'&&r[3]==='정진혁')&&S.post({a:'updateSite',pw:'pw-test-77',s:a.code,fields:{name:'시험 현장 2'}}).ok&&S.rowsOf('기록').some(r=>r[1]==='현장 수정'&&r[3]==='관리'));
  const c0=S.post({a:'site',s:a.code}),c1=S.post({a:'site',s:a.code,pin:'0000'}),c2=S.post({a:'site',s:a.code,pin:'4321'}),c3=S.post({a:'site',s:a.code,pw:'T:'+r1.token}),c4=S.post({a:'post',s:a.code,text:'x',pw:'T:bogus'});
  ok('서버 13: 고객 확인 번호 그대로 (없으면 PIN:, 틀리면 PIN:…, 맞으면 열림 · 고객 요청에 pw 를 붙여도 번호 확인)',/^PIN:$/.test(c0.error||'')&&/^PIN:번호/.test(c1.error||'')&&c2.ok&&c2.site.name==='시험 현장 2'&&/^PIN:/.test(c3.error||'')&&/^PIN:/.test(c4.error||''));
  ok('서버 14: 고객에게 나가는 내용에 확인 번호·프로젝트 번호·메모 없음',!/4321|P-2611-901|인트라넷/.test(JSON.stringify(c2)));
  for(let i=0;i<6;i++)S.post({a:'site',s:a.code,pin:'1111'});
  ok('서버 15: 확인 번호 5번 틀리면 잠금 그대로 (맞는 번호도 15분 막힘)',/여러 번/.test(S.post({a:'site',s:a.code,pin:'4321'}).error||''));
  S.advance(6*36e5+1000);
  const ex=S.post({a:'sites',pw:'T:'+r1.token});
  ok('서버 16: 6시간 지나면 출입증 끝 (화면이 알아보는 안내)',ex.ok===false&&/입장권/.test(ex.error||''),ex.error);
  ok('서버 17: 기록·시트 어디에도 열쇠·출입증 값 없음',!JSON.stringify(Object.values(S.st.sheets).map(s=>s.rows)).includes(KEY)&&!JSON.stringify(Object.values(S.st.sheets).map(s=>s.rows)).includes(r1.token));
  ok('서버 18: Code.gs 에 열쇠 값·eval 없음, 속성 이름만',/getProperty\('FIELD_STAFF_KEY'\)/.test(GS)&&!/eval\(/.test(GS)&&!/FIELD_STAFF_KEY\s*=\s*['"]/.test(GS));
  return KEY}

(async()=>{part1();
 const b=await chromium.launch();const errs=[],dialogs=[];let acceptConfirm=false;
 // ===== 2부: 인트라넷 =====
 for(const [vn,opt,whos] of [['PC',{viewport:{width:1280,height:900}},['jjh','bom','cja']],['Pixel 7',devices['Pixel 7'],['jjh']]]){
  const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul'},opt));
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|github\.io/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const dbNow=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')||'{}'));
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{if(acceptConfirm&&d.type()==='confirm')return d.accept();dialogs.push(who+' '+d.type());d.dismiss()});
   await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);
   await p.evaluate(()=>{window.__hrefs=[];document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[data-fadm]');if(a){window.__hrefs.push(a.href);e.preventDefault()}})});return p}; // 새 탭은 열지 않고, 누른 순간의 주소만 받아 둠
  const sheetOf=async(P,id)=>{await P.evaluate(()=>window.__hfT.closeSheet());await wait(250);await P.evaluate(()=>{location.hash='#projects'});await wait(500);await P.evaluate(i=>window.__hfT.open('projects',i),id);await wait(1200);return P.locator('#pjHub .hubshare')};
  const lastHref=P=>P.evaluate(()=>window.__hrefs[window.__hrefs.length-1]||'');
  const A0=await open('admin',12000);const SP={};for(const w of whos)SP[w]=await open(w);
  // (가) 열쇠 없음
  for(const w of whos){const P=SP[w],tag=vn+' '+USERS[w].name+': ';
   const sh=await sheetOf(P,'p2');const txt=(await sh.count())?await sh.innerText():'';
   const hrefs=await sh.locator('a').evaluateAll(a=>a.map(x=>[x.textContent.trim(),x.getAttribute('href'),x.target,x.rel]));
   // v0.99-46 B: 계약 뒤(p2 = 사후관리) 코드 있는 프로젝트는 ‘고객 공유 페이지 열기’(관리 화면)·‘고객 주소 복사’·‘고객 화면 보기’
   ok(tag+'코드 있는 프로젝트(계약 뒤): ‘고객 공유 페이지 열기’·‘고객 주소 복사’·‘고객 화면 보기’',/고객 공유 페이지 열기/.test(txt)&&/고객 주소 복사/.test(txt)&&/고객 화면 보기/.test(txt)&&await sh.locator('[data-fcopy]').count()===1,JSON.stringify(hrefs));
   ok(tag+'관리 화면 = ?admin&s=코드 · 고객 화면 = ?s=코드 · 둘 다 새 탭 보통 링크',hrefs.length===2&&hrefs[0][1]===BASE+'?admin&s='+CODE&&hrefs[1][1]===BASE+'?s='+CODE&&hrefs.every(h=>h[2]==='_blank'&&/noopener/.test(h[3])),JSON.stringify(hrefs));
   await sh.locator('a[data-fadm]').click();await wait(400);const h0=await lastHref(P);const toastTxt=await P.evaluate(()=>Array.from(document.querySelectorAll('.toast')).map(t=>t.textContent).join('|'));
   ok(tag+'열쇠 없음 → 보통 주소(입장권 없음) + 안내',h0===BASE+'?admin&s='+CODE&&/아직 연결되지 않았어요/.test(toastTxt),h0+' · '+toastTxt)}
  // (나) 대표: 직원 열쇠 만들기
  await A0.evaluate(()=>{location.hash='#forms'});await wait(1200);
  ok(vn+' 대표: 서식 자료실에 ‘현장소통 연결 (대표만)’ · 열쇠 없음',await A0.locator('#fstCfg').count()===1&&/직원 열쇠 없음/.test(await A0.locator('#fstCfg summary').innerText()));
  await A0.locator('#fstCfg summary').click();await wait(300);await A0.locator('[data-fstnew]').click();await wait(1200);
  const KEY=await A0.locator('#fstVal').inputValue().catch(()=>'');
  ok(vn+' 대표: ‘직원 열쇠 만들기’ → 한 번 보여 줌 (무작위 32바이트 = 43자) + 복사 버튼',/^[A-Za-z0-9_-]{43}$/.test(KEY)&&await A0.locator('[data-fstcopy]').count()===1,KEY.length);
  await A0.evaluate(()=>{window.__clip='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:t=>{window.__clip=t;return Promise.resolve()}}})});await A0.locator('[data-fstcopy]').click();await wait(300);
  ok(vn+' 대표: 복사 → 클립보드에 열쇠',await A0.evaluate(()=>window.__clip)===KEY);
  await A0.locator('[data-fsthide]').click();await wait(400);
  ok(vn+' 대표: 가린 뒤에는 화면 어디에도 열쇠 글자 없음',!(await A0.content()).includes(KEY)&&await A0.locator('#fstVal').count()===0);
  let D=await dbNow();
  ok(vn+' 저장: config/fstaff 에만 열쇠 (기록 activity 등 다른 문서에는 없음)',D['config/fstaff']&&D['config/fstaff'].key===KEY&&Object.keys(D).filter(k=>k!=='config/fstaff'&&JSON.stringify(D[k]).includes(KEY)).length===0,Object.keys(D).filter(k=>JSON.stringify(D[k]).includes(KEY)).join(','));
  // (다) 직원: 읽기만 · 입장권
  await wait(1500);
  for(const w of whos){const P=SP[w],tag=vn+' '+USERS[w].name+': ';
   const rd=await P.evaluate(async()=>{const db=await window.claude.use('db');const x=await db.doc('config/fstaff').get();let wr='ok';try{await db.doc('config/fstaff').set({key:'hack'})}catch(e){wr='denied'}let up='ok';try{await db.doc('config/fstaff').update({key:'hack'})}catch(e){up='denied'}return {k:(x.data()||{}).key,wr,up,app:window.__hfT.fstKey()}});
   ok(tag+'열쇠 문서를 읽을 수 있고(입장권용) 쓸 수는 없음',rd.k===KEY&&rd.app===KEY&&rd.wr==='denied'&&rd.up==='denied'&&(await dbNow())['config/fstaff'].key===KEY,JSON.stringify({wr:rd.wr,up:rd.up}));
   ok(tag+'직원 화면에는 ‘현장소통 연결’ 설정 칸 없음',await P.evaluate(async()=>{location.hash='#forms';await new Promise(r=>setTimeout(r,700));return !document.getElementById('fstCfg')&&!document.querySelector('[data-fstnew]')}));
   let sh=await sheetOf(P,'p2');const a=sh.locator('a[data-fadm]');
   const t0=Date.now();await a.click();await wait(300);let h=await lastHref(P);let [u,k]=[h.split('#k=')[0],h.split('#k=')[1]||''];let m=TK_RE.exec(k);
   ok(tag+'‘관리 화면 열기’ → 주소 뒤 # 에 입장권 (시각.누구.한번값.서명)',u===BASE+'?admin&s='+CODE&&!!m&&Math.abs(Number(m[1])-t0)<8000,h.slice(0,90));
   ok(tag+'서명 = HMAC-SHA256(열쇠, 시각.누구.한번값) — Node crypto 와 같음 · 누구 = 본인 이름',sigOk(KEY,k)&&whoOf(k)===USERS[w].name,whoOf(k));
   ok(tag+'주소에 열쇠·비밀번호 칸·고객 이름·전화·금액·원가 없음, 물음표 뒤(서버로 가는 부분)에는 입장권 없음',!h.includes(KEY)&&!LEAK.test(h)&&!/pw=|pass/i.test(h)&&!/k=/.test(new URL(h).search),h.slice(0,60));
   await wait(700);ok(tag+'연 뒤에는 화면의 링크가 보통 주소로 돌아감 (입장권을 남기지 않음)',await a.getAttribute('href')===BASE+'?admin&s='+CODE);
   // 키보드(포커스 → Enter) · 스크립트 클릭(미리 만들 틈 없음)
   await a.focus();await wait(250);await P.keyboard.press('Enter');await wait(300);const h2=await lastHref(P),k2=h2.split('#k=')[1]||'';
   sh=await sheetOf(P,'p2');await sh.locator('a[data-fadm]').evaluate(x=>x.click());await wait(200);const h3=await lastHref(P),k3=h3.split('#k=')[1]||'';
   ok(tag+'키보드 Enter·바로 누르기(미리 만들 틈 없음)도 맞는 입장권 · 매번 다른 한번값',sigOk(KEY,k2)&&sigOk(KEY,k3)&&new Set([k,k2,k3].map(x=>(TK_RE.exec(x)||[])[3])).size===3);
   const same=await P.evaluate(async key=>{const msg=Date.now()+'.abc.defghijklmnopqrstuv';return [await window.__hfT.fstSign(key,msg),window.__hfT.fstSignJs(key,msg),msg]},KEY);
   ok(tag+'WebCrypto 서명 = 직접 계산 서명 = Node',same[0]===same[1]&&same[0]===hmac(KEY,same[2]));
   // 서버(Code.gs)가 실제로 받아 줌 · 두 번은 안 됨
   const S=makeServer({props:{FIELD_STAFF_KEY:KEY}});S.setPw('pw-test-77');const r=S.post({a:'ticket',k});
   ok(tag+'인트라넷이 만든 입장권을 서버(Code.gs)가 받아 줌 → 출입증 · 같은 입장권 두 번째는 거절 · 기록에 직원 이름',r.ok&&S.post({a:'sites',pw:'T:'+r.token}).ok&&S.post({a:'ticket',k}).ok===false&&S.rowsOf('기록').some(x=>x[1]==='직원 입장'&&x[3]===USERS[w].name));
   // 코드 없는 프로젝트: 만들기
   sh=await sheetOf(P,'p1');const txt1=(await sh.count())?await sh.innerText():'';await sh.locator('a[data-fadm]').click();await wait(300);const hm=await lastHref(P);const um=new URL(hm),q=um.searchParams,km=hm.split('#k=')[1]||'';
   {const hh={};hm.slice(hm.indexOf('#')+1).split('&').forEach(x=>{const i=x.indexOf('=');if(i>0)hh[x.slice(0,i)]=x.slice(i+1)});let dd=null;try{dd=JSON.parse(Buffer.from(hh.d||'','base64url').toString('utf8'))}catch(e){}
    ok(tag+'코드 없는 프로젝트(계약 뒤 · v0.99-46 B): ‘고객 공유 페이지 열기’ = 주소 ?admin 뿐 + # 뒤 입장권(k)·값(d: 현장명·담당·착공·준공·프로젝트 번호·고객 이름·뒷 4자리)',/고객 공유 페이지 열기/.test(txt1)&&um.origin+um.pathname===BASE&&um.search==='?admin'&&sigOk(KEY,hh.k)&&dd&&dd.m==='auto'&&dd.name==='시험 현장 욕실'&&dd.mgr==='정진혁 실장'&&dd.start==='2026-11-05'&&dd.end==='2026-12-20'&&dd.proj==='P-2611-901'&&dd.cust==='홍길동'&&dd.pin==='5678'&&!/01012345678|1234-5678/.test(JSON.stringify(dd)),hm.slice(0,120))}
   ok(tag+'만들기 주소에도 열쇠·고객 이름·전화·금액·원가 없음',!hm.includes(KEY)&&!LEAK.test(hm.split('#')[0])&&!LEAK.test(decodeURIComponent(hm.split('#')[0])));
   ok(tag+'가로 넘침 없음',await P.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
   ok(tag+'권한 밖 쓰기는 일부러 해 본 열쇠 문서뿐',(await P.evaluate(()=>window.__mockDenied)).every(x=>x==='config/fstaff'),(await P.evaluate(()=>window.__mockDenied)).join(','))}
  // (라) 가린 줄 · 미리 보기
  {const P=SP.jjh;const r=await P.evaluate(()=>{const f=window.__hfT.hubShareHTML;if(!f)return null;const p={no:'P-2611-909',title:'가린 현장',mgr:'이봄이',fieldCode:'AbCdEfGhIjKlMnOpQrStUv12'};return [f(p,{__masked:true,title:'가린 현장'}),f(Object.assign({},p,{fieldCode:''}),{__masked:true}),f(p,null),f(p,{title:'가린 현장'}).length>0]});
   ok(vn+' 가린 줄(내 담당 아님)·줄 없음: 버튼 3개 모두 없음 (안 가린 줄에는 있음)',r&&r[0]===''&&r[1]===''&&r[2]===''&&r[3]===true,JSON.stringify(r&&r.slice(0,3)))}
  // (마) 대표: 새로 만들기 → 옛 열쇠 hist
  if(vn==='PC'){acceptConfirm=true;await A0.locator('#fstCfg summary').count();if(!(await A0.locator('[data-fstnew]').isVisible()))await A0.locator('#fstCfg summary').click();await A0.locator('[data-fstnew]').click();await wait(1500);acceptConfirm=false;
   const K2=await A0.locator('#fstVal').inputValue().catch(()=>'');D=await dbNow();const f=D['config/fstaff']||{};
   ok('PC 대표: ‘새로 만들기’ → 새 열쇠, 옛 열쇠는 hist 에 그대로 (지우지 않음)',/^[A-Za-z0-9_-]{43}$/.test(K2)&&K2!==KEY&&f.key===K2&&(f.hist||[]).length===1&&f.hist[0].key===KEY,(f.hist||[]).length);
   await wait(1500);const P=SP.jjh;const sh=await sheetOf(P,'p2');await sh.locator('a[data-fadm]').click();await wait(300);const k=(await lastHref(P)).split('#k=')[1]||'';
   ok('PC 정진혁: 새 열쇠가 바로 내려와 새 열쇠로 서명 (옛 열쇠 서명 아님)',sigOk(K2,k)&&!sigOk(KEY,k));
   // 대표 화면에서도 버튼·입장권
   await A0.evaluate(()=>{window.__hrefs=[]});const shA=await sheetOf(A0,'p2');await shA.locator('a[data-fadm]').click();await wait(300);const kA=(await lastHref(A0)).split('#k=')[1]||'';
   ok('PC 대표: 대표 화면 ‘관리 화면 열기’도 입장권',sigOk(K2,kA)&&whoOf(kA)==='최윤수')}
  for(const w of whos)await SP[w].close();await A0.close();await ctx.close()}
 ok('인트라넷 소스: 열쇠 값이 코드에 없음(무작위 생성) · 새 alert/prompt/window.open/iframe 없음 (입장권 코드 구간)',(()=>{const i=HTML.indexOf('// ===== 현장소통 직원 열쇠'),j=HTML.indexOf('window.addEventListener("hashchange",()=>{FST_SHOW=""})');const seg=HTML.slice(i,j);return i>0&&j>i&&/crypto\.getRandomValues/.test(seg)&&!/alert\(|prompt\(|window\.open|<iframe|\.delete\(/.test(seg)})());
 ok('인트라넷: 화면 오류·브라우저 대화상자 0 (새로 만들기 확인 1번은 okAsk)',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));

 // ===== 3부: 현장소통 화면 =====
 const errs3=[];const KEY3=crypto.randomBytes(32).toString('base64url');
 const fieldCtx=async(api,S)=>{const ctx=await b.newContext({viewport:{width:420,height:820}});
  await ctx.route('http://f.test/field/**',r=>{const u=r.request().url();if(/config\.js/.test(u))return r.fulfill({contentType:'application/javascript',body:'window.FIELD_API='+JSON.stringify(api)+';'});if(/\/field\/(\?|#|$)/.test(u))return r.fulfill({contentType:'text/html',body:FIELD});return r.abort()});
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  if(S)await ctx.route('http://api.test/**',r=>{const req=r.request();ctx.__posts=(ctx.__posts||[]);ctx.__posts.push(req.url()+' '+(req.postData()||''));r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(S.post(req.postData()||'{}'))})});
  ctx.__reqs=[];ctx.on('request',q=>ctx.__reqs.push(q.url()));return ctx};
 const fopen=async(ctx,url)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs3.push(e.message));p.on('dialog',d=>d.dismiss());await p.goto(url);await wait(900);return p};
 const st=p=>p.evaluate(()=>({url:location.href,hash:location.hash,list:/현장 목록/.test(document.body.innerText),login:!!document.getElementById('lp'),msg:(document.getElementById('ls')||{}).textContent||'',pwLS:localStorage.getItem('field_pw'),tk:sessionStorage.getItem('field_tk')||'',lsAll:JSON.stringify(localStorage).length,bar:(document.getElementById('bar')||{}).innerText||'',body:document.body.innerText.slice(0,300)}));
 { // 미리보기(서버 주소 없음)
  const ctx=await fieldCtx('');const good=makeServer().ticket(KEY3);
  let p=await fopen(ctx,'http://f.test/field/?admin#k='+good);let s=await st(p);
  ok('현장소통 미리보기: 모양이 맞는 입장권 → 비밀번호 화면 없이 현장 목록 · 주소에서 입장권 지움 · 비밀번호 저장 안 함',s.list&&!s.login&&s.hash===''&&!s.url.includes('k=')&&s.pwLS===null&&!!s.tk,JSON.stringify(s).slice(0,200));
  ok('현장소통 미리보기: 출입증은 이 탭(sessionStorage)에만, localStorage 에 입장권·출입증 없음',await p.evaluate(k=>!JSON.stringify(localStorage).includes(k)&&!JSON.stringify(localStorage).includes(sessionStorage.getItem('field_tk')),good));
  await p.close();p=await fopen(ctx,'http://f.test/field/?admin#k=abc.def');s=await st(p);
  ok('현장소통 미리보기: 모양이 틀린 입장권 → 비밀번호 화면 + 짧은 안내 · 주소에서 지움',s.login&&!s.list&&/입장권/.test(s.msg)&&s.hash==='',s.msg);
  await p.fill('#lp','0000');await p.click('#lf button');await wait(700);s=await st(p);
  ok('현장소통 미리보기: 비밀번호 로그인 그대로 (0000)',s.list&&s.pwLS==='0000');
  await p.close();p=await fopen(ctx,'http://f.test/field/?s=WI7ijOiMEPHIOf4vjkqEPmG2#k='+good);s=await st(p);
  ok('현장소통 미리보기: 고객 화면 그대로 (입장권이 붙어 와도 무시하고 지움 · 관리 모드 아님)',/시험 현장/.test(s.body)&&!/관리 모드/.test(s.bar)&&s.hash===''&&!s.tk,s.body.slice(0,80));
  await ctx.close()}
 { // 서버 연결(Code.gs 틀)
  const S=makeServer({props:{FIELD_STAFF_KEY:KEY3}});S.setPw('pw-test-77');
  const site=S.post({a:'addSite',pw:'pw-test-77',name:'확인 번호 현장',pin:'2468',manager:'정진혁 실장'});
  const ctx=await fieldCtx('http://api.test/exec',S);const tk=S.ticket(KEY3,{who:'이봄이'});
  let p=await fopen(ctx,'http://f.test/field/?admin#k='+tk);await wait(600);let s=await st(p);
  ok('현장소통+서버: 입장권 → 관리 화면(현장 목록) · 비밀번호 화면 없음 · 주소에서 지움',s.list&&!s.login&&s.hash===''&&/확인 번호 현장/.test(await p.evaluate(()=>document.body.innerText)),JSON.stringify(s).slice(0,160));
  ok('현장소통+서버: 서버로 간 주소(쿼리)에 입장권 없음 · 요청 본문의 pw 는 "T:출입증"뿐 (비밀번호 아님)',ctx.__reqs.every(u=>!u.includes(tk)&&!/[?&]k=/.test(u))&&ctx.__posts.filter(x=>/"pw"/.test(x)).every(x=>/"pw":"T:[0-9a-f]{64}"/.test(x))&&s.pwLS===null);
  await p.reload();await wait(1200);s=await st(p);
  ok('현장소통+서버: 새로 고침해도 같은 탭에서는 계속 관리 화면',s.list&&!s.login);
  await p.goto('http://f.test/field/?admin&s='+site.code);await wait(1500);s=await st(p);
  ok('현장소통+서버: 출입증으로 현장 관리 화면(글쓰기·진행률) 열림 · 확인 번호 묻지 않음',/관리 모드/.test(s.bar)&&!await p.locator('#pinIn').count(),s.bar.slice(0,60));
  await p.close();p=await fopen(ctx,'http://f.test/field/?admin#k='+tk);await wait(600);s=await st(p);
  ok('현장소통+서버: 이미 쓴 입장권(다른 탭) → 비밀번호 화면 + 안내',s.login&&!s.list&&/입장권/.test(s.msg),s.msg);
  await p.fill('#lp','pw-test-77');await p.click('#lf button');await wait(900);s=await st(p);
  ok('현장소통+서버: 그 화면에서 비밀번호 로그인 그대로',s.list&&s.pwLS==='pw-test-77');
  await p.close();
  // 출입증이 끝난 탭
  const ctx2=await fieldCtx('http://api.test/exec',S);p=await fopen(ctx2,'http://f.test/field/?admin#k='+S.ticket(KEY3));await wait(600);S.advance(6*36e5+1000);await p.reload();await wait(1300);s=await st(p);
  ok('현장소통+서버: 6시간 뒤 출입증 끝 → 비밀번호 화면 + 안내 (출입증 지움)',s.login&&/입장권/.test(s.msg)&&!s.tk,s.msg);
  await p.close();
  // 고객 화면·확인 번호
  delete S.st.cache.pwfail;p=await fopen(ctx2,'http://f.test/field/?s='+site.code);await wait(700);
  const gate=await p.locator('#pinIn').count();await p.fill('#pinIn','2468');await p.keyboard.press('Enter');await wait(1200);s=await st(p);
  ok('현장소통+서버: 고객 화면 확인 번호(뒷 4자리) 그대로 — 번호 넣어야 열림',gate===1&&/확인 번호 현장/.test(s.body)&&!/관리 모드/.test(s.bar),s.body.slice(0,80));
  await p.close();
  // 열쇠 속성 없음
  S.setProp('FIELD_STAFF_KEY',undefined);p=await fopen(ctx2,'http://f.test/field/?admin#k='+S.ticket(KEY3));await wait(600);s=await st(p);
  ok('현장소통+서버: 서버에 열쇠 속성이 없으면 → 비밀번호 화면 (예전 그대로)',s.login&&!s.list&&/입장권/.test(s.msg),s.msg);
  await ctx.close();await ctx2.close()}
 ok('현장소통 화면: 오류 0 · 입장권은 localStorage 에 쓰지 않음(코드)',!errs3.length&&!/localStorage\.setItem\("field_tk/.test(FIELD)&&/sessionStorage\.setItem\("field_tk"/.test(FIELD)&&/history\.replaceState\(null, "", location\.pathname \+ location\.search\)/.test(FIELD),errs3.slice(0,2).join('|'));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
