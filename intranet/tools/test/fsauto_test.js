// 고객 공유 페이지 자동 연결 시험 (v0.99-46 B, 2026-11-23): LANG=C.UTF-8 node intranet/tools/test/fsauto_test.js [index.html]
// 1부 서버(Code.gs · Node 틀): projSite 찾기/만들기·같은 proj 두 번 안 만듦·입장권/비밀번호만·공정 맞춤(옛 값 탭)·고객 화면에 고객 이름/번호/proj 없음·목록 검색 칸·지우는 것 없음
// 2부 인트라넷(가짜 저장소): 대표·정진혁·이봄이·채진아 — 계약 뒤 ‘고객 공유 페이지 열기’·‘고객 주소 복사’, 계약 전 ‘만들기’, 쿼리는 ?admin(·s=코드)뿐, # 뒤 값에 전체 전화·금액·비밀번호·열쇠 없음, 공정표 날짜
// 3부 현장소통 화면(field/index.html + Code.gs 틀): # 읽고 바로 지움·자동 생성·두 번째는 같은 현장·공정 채우기·검색 거름·고객 화면 확인 번호·미리보기·계약 전 미리 채움
const {chromium}=require('playwright');const fs=require('fs'),crypto=require('crypto'),path=require('path');
const ROOT=path.join(__dirname,'../../..');
const HTML=fs.readFileSync(process.argv[2]||path.join(ROOT,'intranet/index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const FIELD=fs.readFileSync(path.join(ROOT,'field/index.html'),'utf8');const GS=fs.readFileSync(path.join(ROOT,'intranet/field-script/Code.gs'),'utf8');
const makeServer=require('./gs_field_harness.js');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z",KEY=crypto.randomBytes(32).toString('base64url');
const SCHED=[{proc:"철거",start:"2026-11-05",end:"2026-11-06"},{proc:"타일",start:"2026-11-10",end:"2026-11-12"},{proc:"타일",start:"2026-11-14",end:"2026-11-15"},{proc:"도장",start:"2026-11-18",end:""}];
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},
 "config/fstaff":{key:KEY,at:T0,by:"u_boss",hist:[]},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",perf:"순수 인테리어",approvals:[{amt:1515151,t:"자재"}],cat:"주거",inq:"2026-11-01",work:"욕실",start:"2026-11-05",endPlan:"2026-12-20",sched:SCHED,updatedAt:T0},"ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "projects/p2":{no:"P-2605-902",title:"지난 현장 주방",custName:"홍길동",custCode:"C-2611-901",stage:"사후관리",mgr:"이봄이",contractAmt:"12000000",cat:"주거",inq:"2026-04-01",work:"주방",start:"2026-04-10",end:"2026-05-01",fieldCode:"https://soo-cpu.github.io/card/field/?s=AbCdEfGhIjKlMnOpQrStUv12",sched:[{proc:"주방 철거",start:"2026-04-10",end:"2026-04-11"}],updatedAt:T0},
 "projects/p3":{no:"P-2611-903",title:"상담 중 현장",custName:"홍길동",custCode:"C-2611-901",stage:"상담",mgr:"정진혁",contractAmt:"",cat:"주거",inq:"2026-11-10",start:"2026-12-01",updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",code:"C-2611-901",name:"시험 현장 욕실",customer:"홍길동",mgr:"정진혁",status:"공사 중",proc:"타일",progress:"40",start:"2026-11-05",logs:[],updatedAt:T0},
 "fin/bonuspay":{rows:[{name:"정진혁",amt:"13131313"}]}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const BASE='https://soo-cpu.github.io/card/field/',CODE='AbCdEfGhIjKlMnOpQrStUv12';
const TK_RE=/^(\d{13})\.([A-Za-z0-9_-]{1,120})\.([A-Za-z0-9_-]{16,64})\.([A-Za-z0-9_-]{43})$/;
const MONEY=/33000000|33,000,000|12000000|20202020|1515151|13131313|원가|마진/;const FULLTEL=/01012345678|1234-5678|010-1234/;
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const hmac=(key,msg)=>crypto.createHmac('sha256',key).update(msg).digest('base64url');
const sigOk=(key,k)=>{const m=TK_RE.exec(k||'');return !!m&&hmac(key,m[1]+'.'+m[2]+'.'+m[3])===m[4]};
const hashOf=h=>{const i=h.indexOf('#');const o={};if(i<0)return o;h.slice(i+1).split('&').forEach(p=>{const j=p.indexOf('=');if(j>0)o[p.slice(0,j)]=p.slice(j+1)});return o};
const dec=d=>{try{return JSON.parse(Buffer.from(d,'base64url').toString('utf8'))}catch(e){return null}};
const enc=o=>Buffer.from(JSON.stringify(o)).toString('base64url');

function part1(){ // ===== 1부: 서버 =====
  const S=makeServer({props:{FIELD_STAFF_KEY:KEY}});S.setPw('pw-test-77');const tok=S.post({a:'ticket',k:S.ticket(KEY,{who:'정진혁'})}).token;const PW='T:'+tok;
  const sch=[{n:'철거',a:'2026-11-05',b:'2026-11-06'},{n:'타일',a:'2026-11-10',b:'2026-11-15'}];
  ok('서버 1: 출입증·비밀번호 없으면 projSite 거절 (틀린 비밀번호도)',S.post({a:'projSite',proj:'P-2611-901'}).ok===false&&S.post({a:'projSite',proj:'P-2611-901',pw:'nope'}).ok===false&&S.post({a:'projSite',proj:'P-2611-901',pw:'T:'+'0'.repeat(64)}).ok===false&&S.rowsOf('현장').length===0);
  delete S.st.cache.pwfail;
  ok('서버 2: 프로젝트 번호 모양이 틀리면 거절 (만들지 않음)',/프로젝트 번호/.test(S.post({a:'projSite',pw:PW,proj:'P-26-1'}).error||'')&&S.rowsOf('현장').length===0);
  const r1=S.post({a:'projSite',pw:PW,proj:'P-2611-901',name:'시험 현장 욕실',cust:'홍길동',pin:'5678',manager:'정진혁 실장',start:'2026-11-05',end:'2026-12-20',stages:sch});
  const row=S.rowsOf('현장')[0]||[];
  ok('서버 3: 없으면 자동 생성 — 24자리 코드·현장명·담당·착공/준공·확인 번호·고객 이름·메모에 프로젝트 번호·공정표 날짜',r1.ok&&r1.created===true&&/^[A-Za-z0-9]{24}$/.test(r1.code)&&row[0]===r1.code&&row[1]==='시험 현장 욕실'&&row[2]==='정진혁 실장'&&row[5]==='2026-11-05'&&row[6]==='2026-12-20'&&row[16]==='5678'&&row[17]==='홍길동'&&row[14]==='인트라넷 P-2611-901'&&JSON.stringify(JSON.parse(row[7]))===JSON.stringify([{n:'철거',s:0,a:'2026-11-05',b:'2026-11-06'},{n:'타일',s:0,a:'2026-11-10',b:'2026-11-15'}])&&r1.pinOn===true&&r1.sched===2,JSON.stringify(r1));
  const r2=S.post({a:'projSite',pw:PW,proj:'P-2611-901',name:'다른 이름',cust:'홍길동',pin:'1111',stages:sch});
  ok('서버 4: 같은 프로젝트 번호 다시 → 같은 현장(새로 안 만듦) · 이름·확인 번호는 그대로',r2.ok&&r2.created===false&&r2.code===r1.code&&S.rowsOf('현장').length===1&&S.rowsOf('현장')[0][1]==='시험 현장 욕실'&&S.rowsOf('현장')[0][16]==='5678'&&r2.sched===0);
  ok('서버 5: 공정표가 같으면 옛 값 탭에 아무것도 안 씀',S.rowsOf('옛 값').length===0);
  // 진행 상태 바꾼 뒤 공정표 날짜가 바뀜
  S.post({a:'updateSite',pw:PW,s:r1.code,fields:{stages:[{n:'철거',s:2,a:'2026-11-05',b:'2026-11-06'},{n:'타일',s:1,a:'2026-11-10',b:'2026-11-15'},{n:'샷시',s:1}]}});
  const before=S.rowsOf('현장')[0][7];const h0=S.rowsOf('옛 값').length;
  const r3=S.post({a:'projSite',pw:PW,proj:'P-2611-901',stages:[{n:'철거',a:'2026-11-05',b:'2026-11-07'},{n:'타일',a:'2026-11-11',b:'2026-11-16'},{n:'도장',a:'2026-11-18',b:'2026-11-18'}]});
  const now=JSON.parse(S.rowsOf('현장')[0][7]);const hist=S.rowsOf('옛 값');
  ok('서버 6: 공정표 날짜로 고침 — 같은 이름 단계의 진행 상태 이어받음 · 새 단계는 대기 · 공정표에 없지만 진행 중이던 단계(샷시)는 남김',r3.ok&&r3.code===r1.code&&JSON.stringify(now)===JSON.stringify([{n:'철거',s:2,a:'2026-11-05',b:'2026-11-07'},{n:'타일',s:1,a:'2026-11-11',b:'2026-11-16'},{n:'도장',s:0,a:'2026-11-18',b:'2026-11-18'},{n:'샷시',s:1,a:'',b:''}]),JSON.stringify(now));
  ok('서버 7: 바꾸기 전 공정은 ‘옛 값’ 탭에 통째로 (관리 화면 고침도 옛 값 남김)',h0===1&&hist.length===2&&hist[1][1]===r1.code&&hist[1][2]==='공정(JSON)'&&hist[1][3]===before&&hist[1][4]==='정진혁'&&/인트라넷 공정표/.test(hist[1][5]),JSON.stringify(hist.map(h=>h.slice(1,3))));
  const c=S.post({a:'site',s:r1.code,pin:'5678'});
  ok('서버 8: 고객 화면 응답에 고객 이름·확인 번호·프로젝트 번호 없음 · 공정표는 나감',c.ok&&!/홍길동|5678|P-2611-901|인트라넷/.test(JSON.stringify(c))&&c.site.stages.length===4,JSON.stringify(c.site).slice(0,120));
  const L=S.post({a:'sites',pw:PW});const ls=(L.sites||[])[0]||{};
  ok('서버 9: 관리 현장 목록 응답에 고객 이름·확인 번호(검색용) · 비밀번호로 들어와도 같음',L.ok&&ls.cust==='홍길동'&&ls.pin==='5678'&&ls.proj==='P-2611-901'&&S.post({a:'sites',pw:'pw-test-77'}).sites[0].cust==='홍길동');
  // s(코드)로 오면 그 현장
  const a2=S.post({a:'addSite',pw:PW,name:'손으로 만든 현장',cust:''});
  const r4=S.post({a:'projSite',pw:PW,s:a2.code,proj:'P-2611-955',cust:'김영희',stages:[{n:'목공',a:'2026-12-01',b:'2026-12-03'}]});const row2=S.rowsOf('현장').find(x=>x[0]===a2.code);
  ok('서버 10: s(코드)로 오면 그 현장의 공정만 맞춤 · 빈 고객 이름만 채움 · 새 현장 안 만듦',r4.ok&&r4.code===a2.code&&r4.created===false&&S.rowsOf('현장').length===2&&JSON.parse(row2[7]).some(x=>x.n==='목공'&&x.a==='2026-12-01')&&row2[17]==='김영희');
  // 숨긴 현장은 찾지 않음 · 행은 지우지 않음
  S.st.sheets['현장'].rows[1][13]='Y';const r5=S.post({a:'projSite',pw:PW,proj:'P-2611-901',name:'시험 현장 욕실 2'});
  ok('서버 11: 숨긴 현장(숨김 Y)은 찾지 않고 새로 만듦 · 숨긴 행은 그대로 남음',r5.ok&&r5.created&&r5.code!==r1.code&&S.rowsOf('현장').length===3&&S.rowsOf('현장')[0][0]===r1.code);
  const r6=S.post({a:'projSite',pw:PW,proj:'P-2611-960',cust:'박고객'});const row6=S.rowsOf('현장').find(x=>x[0]===r6.code)||[];
  ok('서버 12: 공정표 없이 만들면 기본 단계(철거~마감) · 현장명이 비면 고정 글 ‘홈퍼니싱 현장’(고객 이름·프로젝트 번호 안 씀) · 고객 이름은 18번째 칸에만 · 확인 번호 없음 표시',r6.created&&row6[1]==='홈퍼니싱 현장'&&row6[17]==='박고객'&&JSON.parse(row6[7]).length===7&&r6.pinOn===false);
  const long=Array.from({length:40},(x,i)=>({n:'가'.repeat(60)+i,a:'2026-11-01',b:'2026-11-02'}));const r7=S.post({a:'projSite',pw:PW,proj:'P-2611-961',stages:long,pin:'12a4'});const row7=S.rowsOf('현장').find(x=>x[0]===r7.code)||[];
  ok('서버 13: 단계는 30개·이름 40자까지 · 숫자 4자리가 아닌 확인 번호는 넣지 않음',r7.created&&JSON.parse(row7[7]).length===30&&JSON.parse(row7[7]).every(x=>x.n.length<=40)&&row7[16]==='');
  ok('서버 14: 잠금은 모두 풀림 · 기록 탭에 ‘현장 자동 생성’·‘인트라넷 맞춤’ (누가 = 직원 이름) · 시트 어디에도 비밀번호·출입증 없음',S.st.locks===0&&S.rowsOf('기록').some(r=>r[1]==='현장 자동 생성'&&r[3]==='정진혁')&&S.rowsOf('기록').some(r=>r[1]==='인트라넷 맞춤')&&!JSON.stringify(Object.values(S.st.sheets).map(s=>s.rows)).includes(tok));
  // v4 검토 반영: 확인 번호는 자르기 전 원래 값이 숫자 4자리일 때만
  {const p1=S.post({a:'projSite',pw:PW,proj:'P-2611-962',name:'긴 번호',pin:'1'.repeat(1000)}),rp=S.rowsOf('현장').find(x=>x[0]===p1.code)||[];
   const p2=S.post({a:'addSite',pw:PW,name:'긴 번호 2',pin:'1'.repeat(1000)}),p3=S.post({a:'addSite',pw:PW,name:'다섯 자리',pin:'12345'}),p4=S.post({a:'addSite',pw:PW,name:'빈칸 번호',pin:' 4321 '});
   const rp4=S.rowsOf('현장').find(x=>x[0]===p4.code)||[];const u1=S.post({a:'updateSite',pw:PW,s:p4.code,fields:{pin:'9'.repeat(1000)}});const rp4b=S.rowsOf('현장').find(x=>x[0]===p4.code)||[];
   ok('서버 16: 확인 번호 — 1000자리 ‘1…’는 projSite 빈 값 · addSite/updateSite 거절 (‘1111’로 저장 안 됨) · 다섯 자리 거절 · 앞뒤 빈칸만 있는 4자리는 OK',p1.ok&&rp[16]===''&&p1.pinOn===false&&p2.ok===false&&p3.ok===false&&p4.ok&&rp4[16]==='4321'&&u1.ok===false&&rp4b[16]==='4321'&&!S.rowsOf('현장').some(x=>x[16]==='1111'||x[16]==='9999'),JSON.stringify([rp[16],p2.error,u1.error]))}
  // 고객 화면 응답(site)에 고객 이름이 어떤 경우에도 없음
  {const names=['홍길동','김영희','박고객','최고객'];const leaks=S.rowsOf('현장').filter(x=>x[13]!=='Y').map(x=>{const pin=x[16];return JSON.stringify(S.post({a:'site',s:x[0],pin}))}).filter(j=>names.some(n=>j.includes(n)));
   const q=S.post({a:'projSite',pw:PW,proj:'P-2611-963',cust:'정고객이름',pin:'2222'});const j=JSON.stringify(S.post({a:'site',s:q.code,pin:'2222'}));
   const pno=S.rowsOf('현장').filter(x=>x[13]!=='Y').map(x=>JSON.stringify(S.post({a:'site',s:x[0],pin:x[16]}))).filter(t=>/P-\d{4}-\d{3}/.test(t));
   ok('서버 17: 고객 화면 응답(site)에 고객 이름·프로젝트 번호(P-) 없음 — 모든 현장(현장명 빈 자동 생성 포함)',leaks.length===0&&pno.length===0&&j.includes('"ok":true')&&!j.includes('정고객이름')&&!/P-\d{4}-\d{3}/.test(j)&&j.includes('홈퍼니싱 현장'),leaks.length+' '+j.slice(0,120))}
  ok('서버 18: Code.gs v4 이상 머리말 · doGet v:4 이상 (v5 직원 번호 2026-11-23)',/현장소통 Code\.gs 2026-11-23 v[4-9]/.test(GS)&&JSON.parse(S.ctx.doGet({parameter:{}}).text).v>=4);
  ok('서버 15: Code.gs 에 지우는 동작(deleteRow·clear·setTrashed·removeFile) 없음 · 같은 proj 찾기·만들기가 한 잠금 안',!/deleteRow|deleteRows|\.clear\(|setTrashed|removeFile|deleteSheet/.test(GS)&&(()=>{const i=GS.indexOf('projSite: function'),seg=GS.slice(i,GS.indexOf('addSite: function',i));const w=seg.indexOf('waitLock'),f=seg.indexOf('projOf_(x) === proj'),ap=seg.indexOf("append_('sites'"),rl=seg.indexOf('releaseLock');return i>0&&w>0&&w<f&&f<ap&&ap<rl})());
}

(async()=>{part1();
 const b=await chromium.launch();const errs=[],dialogs=[];
 // ===== 2부: 인트라넷 =====
 {const ctx=await b.newContext({viewport:{width:1280,height:900},timezoneId:'Asia/Seoul'});
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|github\.io/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});
   await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);
   await p.evaluate(()=>{window.__hrefs=[];document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[data-fadm]');if(a){window.__hrefs.push(a.href);e.preventDefault()}})});return p};
  const sheetOf=async(P,id)=>{await P.evaluate(()=>window.__hfT.closeSheet());await wait(250);await P.evaluate(()=>{location.hash='#projects'});await wait(500);await P.evaluate(i=>window.__hfT.open('projects',i),id);await wait(1200);return P.locator('#pjHub .hubshare')};
  const lastHref=P=>P.evaluate(()=>window.__hrefs[window.__hrefs.length-1]||'');
  const A0=await open('admin',12000);const SP={admin:A0};for(const w of ['jjh','bom','cja'])SP[w]=await open(w);
  for(const w of ['admin','jjh','bom','cja']){const P=SP[w],tag=USERS[w].name+': ';
   // p1: 계약 뒤(시공) · 코드 없음
   let sh=await sheetOf(P,'p1');const n1=await sh.count();
   if(!n1){ok(tag+'p1 고객 공유 칸이 보여야 함 (담당·전체 담당·대표)',false);continue}
   const txt=await sh.innerText();const a=sh.locator('a[data-fadm]');const href0=await a.getAttribute('href');
   ok(tag+'p1(시공·코드 없음): ‘고객 공유 페이지 열기’ 하나 · 주소는 ?admin 뿐 · 복사 버튼은 아직 없음',/고객 공유 페이지 열기/.test(txt)&&!/고객 공유 페이지 만들기/.test(txt)&&href0===BASE+'?admin'&&await sh.locator('[data-fcopy]').count()===0,href0);
   await a.click();await wait(300);const h=await lastHref(P);const H=hashOf(h),D=dec(H.d||'');
   ok(tag+'누르면 # 뒤에 입장권(k)과 값(d) · 쿼리(?)는 ?admin 그대로',h.split('#')[0]===BASE+'?admin'&&sigOk(KEY,H.k)&&!!D&&Object.keys(H).sort().join()==='d,k',h.slice(0,80));
   ok(tag+'값: 찾기/만들기(auto)·프로젝트 번호·현장명·담당·착공/준공·고객 이름·휴대폰 뒷 4자리',D&&D.m==='auto'&&D.proj==='P-2611-901'&&D.name==='시험 현장 욕실'&&D.mgr==='정진혁 실장'&&D.start==='2026-11-05'&&D.end==='2026-12-20'&&D.cust==='홍길동'&&D.pin==='5678',JSON.stringify(D));
   ok(tag+'공정표 날짜: 같은 공정은 가장 이른 시작~가장 늦은 끝, 끝이 없으면 시작일',D&&JSON.stringify(D.sch)===JSON.stringify([{n:'철거',a:'2026-11-05',b:'2026-11-06'},{n:'타일',a:'2026-11-10',b:'2026-11-15'},{n:'도장',a:'2026-11-18',b:'2026-11-18'}]),JSON.stringify(D&&D.sch));
   const all=h+' '+JSON.stringify(D);
   ok(tag+'주소 어디에도 전체 전화번호·금액·원가·성과금·비밀번호·열쇠 없음 · 정해진 칸만',!FULLTEL.test(all)&&!MONEY.test(all)&&!all.includes(KEY)&&!/pw|pass|비밀번호/i.test(JSON.stringify(D))&&Object.keys(D).every(k=>['v','m','proj','name','mgr','start','end','cust','pin','sch'].includes(k)),Object.keys(D||{}).join());
   await wait(700);ok(tag+'연 뒤에는 링크가 ?admin 으로 돌아감 (값을 화면에 남기지 않음)',await a.getAttribute('href')===BASE+'?admin');
   // p2: 계약 뒤 · 코드 있음
   sh=await sheetOf(P,'p2');if(await sh.count()){const t2=await sh.innerText();const a2=sh.locator('a[data-fadm]');
    ok(tag+'p2(사후관리·코드 있음): ‘고객 공유 페이지 열기’(?admin&s=코드)·‘고객 주소 복사’·‘고객 화면 보기’',/고객 공유 페이지 열기/.test(t2)&&/고객 주소 복사/.test(t2)&&/고객 화면 보기/.test(t2)&&await a2.getAttribute('href')===BASE+'?admin&s='+CODE&&await sh.locator('a:not([data-fadm])').getAttribute('href')===BASE+'?s='+CODE,t2);
    await a2.click();await wait(300);const h2=await lastHref(P),H2=hashOf(h2),D2=dec(H2.d||'');
    ok(tag+'p2 누르면: # 뒤 입장권 + 공정 날짜만(sch) — 고객 이름·번호는 안 넘김',h2.split('#')[0]===BASE+'?admin&s='+CODE&&sigOk(KEY,H2.k)&&D2&&D2.m==='sch'&&D2.sch.length===1&&D2.sch[0].n==='주방 철거'&&!('cust' in D2)&&!('pin' in D2),JSON.stringify(D2));
    await P.evaluate(()=>{window.__clip='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:t=>{window.__clip=t;return Promise.resolve()}}})});await sh.locator('[data-fcopy]').click();await wait(400);
    ok(tag+'‘고객 주소 복사’ → 고객 주소(?s=코드)만',await P.evaluate(()=>window.__clip)===BASE+'?s='+CODE)}
   else ok(tag+'p2 고객 공유 칸 없음 (가린 줄)',w==='jjh',w);
   // p3: 계약 전
   sh=await sheetOf(P,'p3');if(await sh.count()){const t3=await sh.innerText(),a3=sh.locator('a[data-fadm]');
    ok(tag+'p3(상담·계약 전): 지금처럼 ‘고객 공유 페이지 만들기’ · 주소는 ?admin 뿐(옛 ?new=1&name= 없음)',/고객 공유 페이지 만들기/.test(t3)&&await a3.getAttribute('href')===BASE+'?admin',await a3.getAttribute('href'));
    await a3.click();await wait(300);const h3=await lastHref(P),D3=dec(hashOf(h3).d||'');
    ok(tag+'p3 누르면: # 뒤 new(현장명·담당·착공·프로젝트 번호) · 고객 이름·번호 없음 · 쿼리 그대로',h3.split('#')[0]===BASE+'?admin'&&D3&&D3.m==='new'&&D3.name==='상담 중 현장'&&D3.proj==='P-2611-903'&&D3.start==='2026-12-01'&&!('cust' in D3)&&!('pin' in D3)&&!('sch' in D3),JSON.stringify(D3))}
   else ok(tag+'p3 고객 공유 칸 없음 (가린 줄)',w!=='admin'&&w!=='cja',w);
   const lk=await P.evaluate(()=>document.body.innerText);ok(tag+'화면에 성과금·원가 숫자 안 샘',w==='admin'||!/13,131,313|20,202,020|1,515,151/.test(lk))}
  // 가린 줄은 버튼·값 없음
  {const r=await SP.jjh.evaluate(()=>{const f=window.__hfT.hubShareHTML;return [f({id:'x',no:'P-2611-909',stage:'시공',title:'가린'},{__masked:true}),f({id:'x',no:'P-2611-909',stage:'시공'},null)]});ok('가린 줄·줄 없음: 버튼 없음',r[0]===''&&r[1]==='')}
  {const r=await SP.jjh.evaluate(()=>window.__hfT.fsData('없는id','auto'));ok('없는 프로젝트 → 값 없음',r==='')}
  for(const w of ['admin','jjh','bom','cja'])await SP[w].close();await ctx.close()}
 // 열쇠 없는 저장소: 직원이 눌러도 값은 # 뒤 d= 만
 {const ctx=await b.newContext({viewport:{width:412,height:900},timezoneId:'Asia/Seoul'});const S2=Object.assign({},SEED);delete S2['config/fstaff'];
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|github\.io/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[S2,RULES]);
  const mk=async who=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(who==='admin'?12000:7000);await p.evaluate(()=>{window.__hrefs=[];document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[data-fadm]');if(a){window.__hrefs.push(a.href);e.preventDefault()}})});return p};
  const A=await mk('admin'),P=await mk('jjh');await P.evaluate(()=>{location.hash='#projects'});await wait(500);await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);
  await P.locator('#pjHub .hubshare a[data-fadm]').click();await wait(300);const h=await P.evaluate(()=>window.__hrefs.pop()||'');const H=hashOf(h),toastTxt=await P.evaluate(()=>Array.from(document.querySelectorAll('.toast')).map(t=>t.textContent).join('|'));
  ok('Pixel 폭 정진혁(열쇠 없음): 입장권 없이 # 뒤 d= 만 · 안내 · 가로 넘침 없음',h.split('#')[0]===BASE+'?admin'&&!H.k&&dec(H.d||'')&&dec(H.d).m==='auto'&&/아직 연결되지 않았어요/.test(toastTxt)&&await P.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),h.slice(0,60));
  await A.close();await P.close();await ctx.close()}
 ok('인트라넷 소스(고객 공유 구간): 새 alert/confirm/prompt/window.open/iframe/fetch 없음',(()=>{const i=HTML.indexOf('const FS_AFTER='),j=HTML.indexOf('async function fcCopy');const seg=HTML.slice(i,j)+HTML.slice(HTML.indexOf('function fstGo('),HTML.indexOf('["pointerdown","touchstart"'));return i>0&&j>i&&!/alert\(|confirm\(|prompt\(|window\.open|<iframe|fetch\(|\.delete\(/.test(seg)})());
 ok('인트라넷: 화면 오류·브라우저 대화상자 0',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));

 // ===== 3부: 현장소통 화면 =====
 const errs3=[];
 const fieldCtx=async(api,S)=>{const ctx=await b.newContext({viewport:{width:420,height:820}});
  await ctx.route('http://f.test/field/**',r=>{const u=r.request().url();if(/config\.js/.test(u))return r.fulfill({contentType:'application/javascript',body:'window.FIELD_API='+JSON.stringify(api)+';'});if(/\/field\/(\?|#|$)/.test(u))return r.fulfill({contentType:'text/html',body:FIELD});return r.abort()});
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());ctx.__posts=[];
  if(S)await ctx.route('http://api.test/**',r=>{const req=r.request();ctx.__posts.push(req.url()+' '+(req.postData()||''));r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(S.post(req.postData()||'{}'))})});
  ctx.__reqs=[];ctx.on('request',q=>ctx.__reqs.push(q.url()));return ctx};
 const fopen=async(ctx,url,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs3.push(e.message));p.on('dialog',d=>{errs3.push('dialog '+d.type());d.dismiss()});await p.goto(url);await wait(ms||1500);return p};
 const st=p=>p.evaluate(()=>({url:location.href,hash:location.hash,list:/현장 목록/.test(document.body.innerText),login:!!document.getElementById('lp'),bar:(document.getElementById('bar')||{}).innerText||'',body:document.body.innerText,modal:(document.querySelector('.modal')||{}).innerText||'',toast:Array.from(document.querySelectorAll('.toast')).map(t=>t.textContent).join('|')}));
 const AUTO={v:1,m:'auto',proj:'P-2611-901',name:'시험 현장 욕실',mgr:'정진혁 실장',start:'2026-11-05',end:'2026-12-20',cust:'홍길동',pin:'5678',sch:[{n:'철거',a:'2026-11-05',b:'2026-11-06'},{n:'타일',a:'2026-11-10',b:'2026-11-15'}]};
 { const S=makeServer({props:{FIELD_STAFF_KEY:KEY}});S.setPw('pw-test-77');
  S.post({a:'addSite',pw:'pw-test-77',name:'반포 아파트',cust:'김영희',pin:'2468',manager:'이봄이 실장'});S.post({a:'addSite',pw:'pw-test-77',name:'잠실 주택',cust:'',pin:'',manager:'정진혁 실장'});
  const ctx=await fieldCtx('http://api.test/exec',S);const d=enc(AUTO);
  let p=await fopen(ctx,'http://f.test/field/?admin#k='+S.ticket(KEY,{who:'정진혁'})+'&d='+d,2500);let s=await st(p);const sites=S.rowsOf('현장');const made=sites.find(r=>r[14]==='인트라넷 P-2611-901')||[];
  ok('현장소통 1: 입장권+값(#) → 현장 자동 생성 → 그 현장 관리 화면 · 주소는 ?admin&s=코드, # 지워짐',made[0]&&s.url==='http://f.test/field/?admin&s='+made[0]&&s.hash===''&&/관리 모드/.test(s.bar)&&/시험 현장 욕실/.test(s.body),s.url);
  ok('현장소통 2: 만든 직후 고객 주소 창 (주소·카톡 안내문 복사·주소만 복사 · 확인 번호 켜짐 표시)',/현장을 만들었어요/.test(s.modal)&&s.modal.includes('http://f.test/field/?s='+made[0])&&/카톡용 안내문 복사/.test(s.modal)&&/주소만 복사/.test(s.modal)&&/확인 번호/.test(s.modal),s.modal.slice(0,120));
  ok('현장소통 3: 서버로 간 주소(쿼리)에 값(d)·입장권·고객 이름 없음 · 값은 요청 본문으로만',ctx.__reqs.every(u=>!u.includes(d)&&!/[?&](d|k)=/.test(u)&&!/%ED%99%8D/.test(u))&&ctx.__posts.some(x=>/"a":"projSite"/.test(x)&&/"proj":"P-2611-901"/.test(x)));
  ok('현장소통 4: 공정표 날짜가 고객 공정표에 채워짐 · 확인 번호·고객 이름 저장',made[16]==='5678'&&made[17]==='홍길동'&&JSON.parse(made[7]).map(x=>x.n+x.a+x.b).join()==='철거2026-11-052026-11-06,타일2026-11-102026-11-15');
  await p.close();
  // 두 번째: 같은 프로젝트 · 공정 날짜 바뀜
  const d2=enc(Object.assign({},AUTO,{sch:[{n:'철거',a:'2026-11-05',b:'2026-11-07'},{n:'타일',a:'2026-11-10',b:'2026-11-15'}]}));
  p=await fopen(ctx,'http://f.test/field/?admin#k='+S.ticket(KEY,{who:'이봄이'})+'&d='+d2,2500);s=await st(p);
  ok('현장소통 5: 같은 프로젝트로 다시 → 새로 안 만들고 같은 현장 · 공정 날짜 맞춤 안내 · 옛 공정은 옛 값 탭',S.rowsOf('현장').filter(r=>/P-2611-901/.test(r[14])).length===1&&s.url==='http://f.test/field/?admin&s='+made[0]&&/공정 2단계를 맞췄어요/.test(s.toast)&&!s.modal&&S.rowsOf('옛 값').length===1&&JSON.parse(S.rowsOf('현장').find(r=>r[0]===made[0])[7])[0].b==='2026-11-07',s.toast);
  await p.close();
  // 고객 화면: 확인 번호 · 고객 이름·proj 안 보임 · 공정표
  p=await fopen(ctx,'http://f.test/field/?s='+made[0],1200);const gate=await p.locator('#pinIn').count();await p.fill('#pinIn','5678');await p.keyboard.press('Enter');await wait(1300);s=await st(p);
  ok('현장소통 6: 고객 화면 — 확인 번호(5678) 넣어야 열림 · 공정표 날짜 보임 · 고객 이름·프로젝트 번호 안 보임',gate===1&&/공정표/.test(s.body)&&/2026\.11\.05/.test(s.body)&&!/홍길동|P-2611-901/.test(s.body)&&!/관리 모드/.test(s.bar),s.body.slice(0,100));
  await p.close();
  // 고객 주소에 # d= 가 붙어 와도 무시·지움
  p=await fopen(ctx,'http://f.test/field/?s='+made[0]+'#d='+d,1200);s=await st(p);
  ok('현장소통 7: 고객 화면에 # 값이 붙어 와도 무시하고 지움 (관리 요청 없음)',s.hash===''&&!/관리 모드/.test(s.bar)&&!ctx.__posts.slice(-3).some(x=>/projSite/.test(x)&&/5678/.test(x)&&x.indexOf('"pw"')<0));
  await p.close();
  // 검색
  p=await fopen(ctx,'http://f.test/field/?admin',1200);if(await p.locator('#lp').count()){await p.fill('#lp','pw-test-77');await p.click('#lf button');await wait(1500)}const cnt=async q=>{await p.fill('#sQ',q);await wait(150);return p.evaluate(()=>Array.from(document.querySelectorAll('.sc[data-q]')).filter(e=>!e.hidden).length)};
  const tot=await cnt('');
  ok('현장소통 8: 현장 목록 위 검색 칸 · 고객 이름(홍길)·현장명(반포)·전화 뒷번호(2468)·담당(정진혁)·없는 말 → 바로 거름',await p.locator('#sQ').count()===1&&tot===3&&await cnt('홍길')===1&&await cnt('반포')===1&&await cnt('2468')===1&&await cnt('정진혁')===2&&await cnt('없는현장')===0&&/0곳 찾음/.test(await p.locator('#sQn').innerText()),tot);
  await p.fill('#sQ','');await p.locator('[data-share]').first().click();await wait(300);
  ok('현장소통 9: 목록의 ‘고객 주소 복사’ 버튼이 고객 주소 창을 엶',/고객 주소/.test(await p.evaluate(()=>(document.querySelector('.modal')||{}).innerText||'')));
  await p.close();
  // 입장권 없이(비밀번호) 값만 → 로그인 뒤 이어서
  const ctx2=await fieldCtx('http://api.test/exec',S);
  p=await fopen(ctx2,'http://f.test/field/?admin#d='+enc(Object.assign({},AUTO,{proj:'P-2611-977',name:'비번 현장',cust:'최고객',pin:'9999'})),1200);s=await st(p);
  ok('현장소통 10: 열쇠 없이 값만(#d=) → 비밀번호 화면 · # 바로 지워짐',s.login&&s.hash==='',s.url);
  await p.fill('#lp','pw-test-77');await p.click('#lf button');await wait(2200);s=await st(p);const m2=S.rowsOf('현장').find(r=>/P-2611-977/.test(r[14]))||[];
  ok('현장소통 11: 비밀번호로 들어가면 이어서 자동 생성 → 그 현장',m2[0]&&s.url==='http://f.test/field/?admin&s='+m2[0]&&/현장을 만들었어요/.test(s.modal)&&m2[17]==='최고객');
  await p.close();
  // 코드 있는 현장 + sch
  p=await fopen(ctx,'http://f.test/field/?admin&s='+made[0]+'#k='+S.ticket(KEY)+'&d='+enc({v:1,m:'sch',proj:'P-2611-901',sch:[{n:'철거',a:'2026-11-05',b:'2026-11-08'},{n:'타일',a:'2026-11-10',b:'2026-11-15'}]}),2200);s=await st(p);
  ok('현장소통 12: 코드 있는 현장(sch) → 그 현장 그대로 열고 공정 날짜만 맞춤',s.url==='http://f.test/field/?admin&s='+made[0]&&s.hash===''&&JSON.parse(S.rowsOf('현장').find(r=>r[0]===made[0])[7])[0].b==='2026-11-08'&&S.rowsOf('현장').filter(r=>/P-2611-901/.test(r[14])).length===1,s.toast);
  await p.close();
  // 나쁜 값
  p=await fopen(ctx,'http://f.test/field/?admin#k='+S.ticket(KEY)+'&d=%3Cscript%3E',1500);s=await st(p);
  ok('현장소통 13: 모양이 틀린 값 → 무시하고 현장 목록 (만들지 않음)',s.list&&s.hash===''&&!errs3.length);
  await p.close();await ctx.close();await ctx2.close()}
 { // 대표가 이미 배포한 v3 서버(커밋 5e72917)도 이 화면이 그대로 받아 주는지
  let v3='';try{v3=require('child_process').execSync('git -C '+JSON.stringify(ROOT)+' show 5e72917:intranet/field-script/Code.gs',{encoding:'utf8'})}catch(e){}
  const tmp=path.join(require('os').tmpdir(),'fsauto_v3_Code.gs');if(v3)fs.writeFileSync(tmp,v3);
  const S3=v3?makeServer({file:tmp,props:{FIELD_STAFF_KEY:KEY}}):null;
  if(S3){S3.setPw('pw-test-77');const ctx=await fieldCtx('http://api.test/exec',S3);const p=await fopen(ctx,'http://f.test/field/?admin#k='+S3.ticket(KEY)+'&d='+enc(AUTO),2500);const s=await st(p);const made=S3.rowsOf('현장').find(r=>/P-2611-901/.test(r[14]))||[];
   ok('현장소통 17: v3 서버(이미 배포된 것)와도 자동 생성·같은 화면 흐름 그대로',/v3/.test(v3.slice(0,300))&&made[0]&&s.url==='http://f.test/field/?admin&s='+made[0]&&/현장을 만들었어요/.test(s.modal),s.url);
   await p.close();await ctx.close();try{fs.unlinkSync(tmp)}catch(e){}}
  else ok('현장소통 17: v3 서버 원본을 git 에서 읽지 못함',false)}
 { // 미리보기(서버 주소 없음) · 계약 전 미리 채움
  const ctx=await fieldCtx('');const tk=makeServer().ticket(KEY);
  let p=await fopen(ctx,'http://f.test/field/?admin#k='+tk+'&d='+enc(AUTO),1800);let s=await st(p);
  ok('현장소통 14: 미리보기에서도 자동 생성 → 현장 화면 + 고객 주소 창 · # 지움',/\?admin&s=[A-Za-z0-9]{24}$/.test(s.url)&&/현장을 만들었어요/.test(s.modal)&&s.hash==='',s.url);
  await p.close();p=await fopen(ctx,'http://f.test/field/?admin#k='+makeServer().ticket(KEY)+'&d='+enc(AUTO),1800);s=await st(p);
  ok('현장소통 15: 미리보기 두 번째 → 같은 현장(새로 안 만듦)',/\?admin&s=/.test(s.url)&&!s.modal&&await p.evaluate(()=>JSON.parse(localStorage.getItem('field_preview_v1')).sites.filter(x=>x.proj==='P-2611-901').length)===1);
  await p.close();p=await fopen(ctx,'http://f.test/field/?admin#k='+makeServer().ticket(KEY)+'&d='+enc({v:1,m:'new',proj:'P-2611-903',name:'상담 중 현장',mgr:'정진혁 실장',start:'2026-12-01'}),1800);
  const pre=await p.evaluate(()=>({n:(document.getElementById('fN')||{}).value,m:(document.getElementById('fM')||{}).value,s:(document.getElementById('fS')||{}).value,hash:location.hash,url:location.href}));
  ok('현장소통 16: 계약 전(new) → ‘현장 추가’ 창 미리 채움 (현장명·담당·착공) · # 지움 · 고객 이름 칸 있음',pre.n==='상담 중 현장'&&pre.m==='정진혁 실장'&&pre.s==='2026-12-01'&&pre.hash===''&&pre.url==='http://f.test/field/?admin'&&await p.locator('#fC').count()===1,JSON.stringify(pre));
  await p.close();await ctx.close()}
 ok('현장소통 화면: 오류·대화상자 0 · 값은 # 에서만 읽음(쿼리 name/proj 읽기 없음) · 새 alert/confirm/prompt/window.open 늘지 않음',!errs3.length&&/\(\?:\^#\|&\)d=/.test(FIELD)&&!/Q\.get\("(name|proj|manager)"/.test(FIELD)&&(FIELD.match(/confirm\(|prompt\(|window\.open\(|alert\(/g)||[]).length===4,errs3.slice(0,3).join('|')+' '+(FIELD.match(/confirm\(|prompt\(|window\.open\(|alert\(/g)||[]).length);
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
