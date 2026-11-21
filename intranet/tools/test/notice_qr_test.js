// 공사 안내문 만들기 + QR + 고객 안내 페이지 시험 (v0.99-41, 2026-11-20 · v0.99-42 보강 2026-11-21: 작업 시간·현장 담당·초안 자동·QR 유입 현황·고객 페이지 첫 화면·방문 집계): node intranet/tools/test/notice_qr_test.js [index.html]
// 1부 인트라넷(가짜 저장소): 대표·정진혁·이봄이·채진아 — 버튼·자동 채움·A4 한 장·QR(실제로 읽어 주소 확인)·주소에 금지 값 없음·이벤트 설정 비움/채움·기록 덧붙이기·고객 번호 막기·미리 보기·연습 모드
// 2부 고객 안내 페이지(event/index.html): n·t 정상/이상 값 · 문자 링크(안드로이드 ?body= / 아이폰 &body=) · 스크립트 주입 · 저장·전송 없음
// QR 읽기: jsQR (없으면 임시 폴더에 한 번 내려받음 — 저장소에는 넣지 않음. 이미 있으면 JSQR_DIR=…/node_modules/jsqr 로 알려 줘도 됨)
// 스크린샷: NOTICE_SHOTS=폴더 를 주면 A4 미리 보기·고객 페이지(휴대폰 폭)를 그 폴더에 저장
if(!process.env.LANG&&!process.env.LC_ALL)process.env.LANG='C.UTF-8'; // 글자 설정이 없는 환경에서는 내려받는 파일의 한글 이름이 'download' 로 바뀜
const {chromium,devices}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ROOT=path.join(__dirname,'../../..');
const HTML=fs.readFileSync(process.argv[2]||path.join(ROOT,'intranet/index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const EVENT=fs.readFileSync(path.join(ROOT,'event/index.html'),'utf8');const SHOTS=process.env.NOTICE_SHOTS||'';
function loadJsQR(){const tries=[process.env.JSQR_DIR,'jsqr',path.join(os.tmpdir(),'hf-jsqr/node_modules/jsqr')].filter(Boolean);for(const t of tries){try{return require(t)}catch(e){}}
  try{const d=path.join(os.tmpdir(),'hf-jsqr');fs.mkdirSync(d,{recursive:true});cp.execSync('npm install jsqr --no-audit --no-fund --prefix '+JSON.stringify(d),{stdio:'ignore',timeout:120000});return require(path.join(d,'node_modules/jsqr'))}catch(e){return null}}
const jsQR=loadJsQR();
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const P1={no:"P-2611-901",title:"시험마을 8단지",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",approvals:[{amt:1515151,t:"자재"}],cat:"주거",inq:"2026-11-01",addr:"시험마을 8단지 804동 603호",work:"욕실",start:"2026-11-05",endPlan:"2026-12-20",sched:[{proc:"철거",start:"2026-11-05",end:"2026-11-07"},{proc:"목공",start:"2026-11-09",end:"2026-11-14"},{proc:"타일",start:"2026-11-16",end:"2026-11-20"},{proc:"철거",start:"2026-11-21",end:"2026-11-21"}],acLog:[{id:"ac1",at:T0,by:"u_boss",text:"옛 기록"}],updatedAt:T0};
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-kim":{name:"김일반",uid:"u_kim",state:"재직",pos:"사원"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},"members/u_kim":{active:true,staffId:"st-kim",name:"김일반"},
 "acct/u_jjh/sms/my":{cardPos:"실장",cardTel:"010-9999-0001",tpls:{}},
 "config/smscard":{cards:{"st-jung":{name:"정진혁",pos:"실장",tel:"010-9999-0001"}},at:T0},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "projects/p1":P1,"ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "projects/p2":{no:"P-2605-902",title:"지난 현장 주방",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"이봄이",contractAmt:"12000000",cat:"주거",inq:"2026-04-01",work:"주방, 타일",start:"2026-04-10",end:"2026-05-01",updatedAt:T0},
 "customers/c2":{code:"C-2611-902",name:"박하나",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1],stage:"1-상담영업",inq:"2026-11-10",route:"공사 안내문 QR",qrCoupon:"hf-2611901",createdAt:T0,updatedAt:T0},"cpriv/c2":{tel:"010-7777-8888",addr:"다른마을 1동 101호",updatedAt:T0},
 "customers/c3":{code:"C-2611-903",name:"박두리",tel:"",addr:"",mgr:"이봄이",status:"진행중",steps:[1],stage:"1-상담영업",inq:"2026-11-11",route:"공사 안내문 QR",createdAt:T0,updatedAt:T0},
 "projects/p3":{no:"P-2611-903",title:"다른마을 1동",custName:"박하나",custCode:"C-2611-902",stage:"상담",mgr:"정진혁",contractAmt:"",cat:"주거",inq:"2026-11-10",addr:"다른마을 1동 101호",work:"도배, 장판",wish:"26년 12월 1일 - 12월 20일",route:"공사 안내문 QR",qrCoupon:"HF2611901",updatedAt:T0},
 "projects/p4":{no:"P-2611-904",title:"또다른 현장",custName:"박세찌",stage:"상담",mgr:"이봄이",contractAmt:"",cat:"주거",inq:"2026-11-12",work:"욕실",route:"공사 안내문 QR",qrCoupon:"HF2611901",updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",code:"C-2611-901",name:"시험마을 8단지",customer:"홍길동",mgr:"정진혁",status:"공사 중",proc:"타일",progress:"40",start:"2026-11-05",logs:[],updatedAt:T0}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false},kim:{id:"u_kim",name:"김일반",email:"kim@test",isOwner:false}};
const BASE='https://soo-cpu.github.io/card/event/',URL1=BASE+'?n=HF2611901&t=15665904',URLM=BASE+'?n=HF2611901&t=01099990001',URL2=BASE+'?n=HF2611901&t=021234567';
const LEAK=/홍길동|박하나|박두리|박세찌|77778888|7777-8888|%ED%99%8D|12345678|1234-5678|33000000|12000000|20202020|1515151|원가|마진|시험마을|804|603|%EC%8B%9C%ED%97%98/; // 고객 이름·고객 전화·금액·원가·주소
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 화면에 보이는 미리 보기 그림(img)에서 QR 자리만 잘라 읽음
const readQr=async P=>{const d=await P.evaluate(async()=>{const im=document.getElementById('gnImg'),g=window.__hfT.gn();if(!im||!g||!g.last||!g.last.qr)return null;if(!im.complete)await new Promise(r=>{im.onload=r});const q=g.last.qr,c=document.createElement('canvas');c.width=c.height=q.size;c.getContext('2d').drawImage(im,q.x,q.y,q.size,q.size,0,0,q.size,q.size);return {w:q.size,px:Array.from(c.getContext('2d').getImageData(0,0,q.size,q.size).data),nat:[im.naturalWidth,im.naturalHeight]}});
  if(!d||!jsQR)return {data:null,nat:d&&d.nat};const r=jsQR(Uint8ClampedArray.from(d.px),d.w,d.w);return {data:r&&r.data,nat:d.nat}};

(async()=>{
 ok('준비: QR 판독기(jsQR)를 쓸 수 있음',!!jsQR);
 const b=await chromium.launch();const errs=[],dialogs=[];let acceptConfirm=false;
 // ===== 1부: 인트라넷 =====
 for(const [vn,opt,whos] of [['PC',{viewport:{width:1280,height:900}},['jjh','bom','cja']],['Pixel 7',devices['Pixel 7'],['jjh']]]){
  const ctx=await b.newContext(Object.assign({timezoneId:'Asia/Seoul',acceptDownloads:true},opt));const reqs=[];ctx.on('request',q=>reqs.push(q.url()));
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|github\.io/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const dbNow=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')||'{}'));
  const open=async(who,ms,extra)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(vn+' '+who+': '+e.message));p.on('dialog',d=>{if(acceptConfirm&&d.type()==='confirm')return d.accept();dialogs.push(who+' '+d.type());d.dismiss()});
   await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK+(extra||'')+`;window.__printed=0;window.print=()=>{window.__printed++;window.dispatchEvent(new Event('beforeprint'));setTimeout(()=>window.dispatchEvent(new Event('afterprint')),50)};`);await p.goto('http://hf.test/');await wait(ms||7000);return p};
  const sheetOf=async(P,id)=>{await P.evaluate(()=>{const v=document.getElementById('gnVeil');if(v){const c=v.querySelector('[data-gnclose]');c&&c.click()}window.__hfT.closeSheet()});await wait(250);await P.evaluate(()=>{location.hash='#projects'});await wait(500);await P.evaluate(i=>window.__hfT.open('projects',i),id);await wait(1200);return P.locator('#pjHub [data-gnopen]')};
  const win=async(P,id)=>{const btn=await sheetOf(P,id);await btn.click();await wait(1500);return P.evaluate(()=>window.__hfT.gn())};
  const vals=P=>P.evaluate(()=>Object.fromEntries(Array.from(document.querySelectorAll('#gnVeil [data-gnf]')).map(i=>[i.dataset.gnf,i.value])));
  const toasts=P=>P.evaluate(()=>Array.from(document.querySelectorAll('.toast')).map(t=>t.textContent).join('|'));
  const A0=await open('admin',12000);const SP={admin:A0};for(const w of whos)SP[w]=await open(w);
  const all=['admin'].concat(whos);

  // (가) 이벤트 설정 비움(기본): 버튼·자동 채움·A4 한 장·QR
  ok(vn+' 처음: 설정 문서 config/notice 없음 (이벤트 기본값 비움)',(await dbNow())['config/notice']===undefined);
  for(const w of all){const P=SP[w],tag=vn+' '+USERS[w].name+': ';
   const btn=await sheetOf(P,'p1');const hubTxt=await P.locator('#pjHub').innerText();
   ok(tag+'프로젝트 화면 ‘현장 진행 상황’ 칸에 ‘안내문 보기·출력’ 버튼 하나 + 초안 요약(공사 세대·기간·담당 · 고객 이름 없음)',await btn.count()===1&&await btn.isVisible()&&await P.locator('#pjHub .hubc[data-pt="prog"] [data-gnopen]').count()===1&&(await btn.innerText()).trim()==='안내문 보기·출력'&&/초안이 자동으로 채워져 있어요[^\n]*시험마을 8단지 804동 603호 · 2026년 11월 5일 ~ 12월 20일 · 담당 정진혁 실장/.test(hubTxt)&&!/홍길동/.test(await P.locator('#pjHub .gnbox').innerText()),await P.locator('#pjHub .gnbox').innerText());
   await btn.click();await wait(1500);const g=await P.evaluate(()=>window.__hfT.gn()),v=await vals(P);
   ok(tag+'화면 안 창(새 창·대화상자 아님) · 자동 채움: 공사 세대·공사기간·공사내용(공정표)·업체명 · 소음 심한 날은 빈칸',await P.locator('#gnVeil.veil .sheet').count()===1&&v.unit==='시험마을 8단지 804동 603호'&&v.period==='2026년 11월 5일 ~ 12월 20일'&&v.work==='철거, 목공, 타일'&&v.noise===''&&v.co==='(주)홈퍼니싱 & 아르띠꼬 스튜디오'&&v.hours==='평일 오전 9시 ~ 오후 6시'&&v.mgr==='정진혁 실장'&&Object.keys(v).join()==='unit,period,hours,work,noise,co,mgr,tel,greet'&&!/홍길동|1234/.test(JSON.stringify(v)),JSON.stringify(v));
   ok(tag+'연락처 기본 = 회사 대표번호만 (담당자 문자 명함 번호·‘담당 OOO’ 꼬리 없음 · 고객 전화번호 아님) + 대표번호·고객 이름 안내 글',v.tel==='1566-5904'&&/대표번호로는 QR 페이지에 문자 예약 버튼이 안 나오고 전화 걸기만/.test(await P.locator('#gnVeil').innerText())&&/‘공사 세대’ 칸에 고객 이름이 들어 있으면 지우고/.test(await P.locator('#gnVeil').innerText()),v.tel);
   ok(tag+'창 오른쪽 위 ‘닫기’ 버튼이 한 줄 (꺾이지 않음)',await P.locator('#gnVeil [data-gnclose]').first().evaluate(b=>b.getBoundingClientRect().height<48&&b.scrollWidth<=b.clientWidth+2));
   ok(tag+'QR 주소 = 고객 안내 페이지 + 쿠폰 번호(HF2611901) + 안내문 연락처(대표번호) 숫자뿐',g&&g.coupon==='HF2611901'&&g.last&&g.last.url===URL1&&(await P.locator('#gnUrl').innerText())===URL1,g&&g.last&&g.last.url);
   ok(tag+'QR 주소에 고객 이름·고객 전화·주소·금액·원가·마진 없음 · 칸은 n·t 둘뿐',!LEAK.test(g.last.url)&&!LEAK.test(decodeURIComponent(g.last.url))&&[...new URL(g.last.url).searchParams.keys()].join()==='n,t');
   const q=await readQr(P);
   ok(tag+'미리 보기 그림의 QR을 실제로 읽으면 그 주소 그대로',q.data===URL1,String(q.data));
   ok(tag+'A4 세로 한 장(1654×2339 · 200dpi) · 한 장에 다 들어감',q.nat&&q.nat[0]===1654&&q.nat[1]===2339&&g.last.fit===true,JSON.stringify(q.nat));
   const cm=g.last.qr.size/200*2.54,cmPrint=cm*186/210,mod=g.last.qr.n;
   ok(tag+'QR 크기 3.5cm 이상 (PDF '+cm.toFixed(2)+'cm · 여백 12mm 인쇄 '+cmPrint.toFixed(2)+'cm) · 흰 여백 4칸 포함',cmPrint>=3.5&&g.last.qr.size===(mod+8)*g.last.qr.cell,cm.toFixed(2));
   const L=g.last.log,idx=s=>L.findIndex(x=>x.includes(s)),order=['공 사 안 내 문','공사 세대','공사기간','작업 시간','평일 오전 9시 ~ 오후 6시','공사내용','소음 심한 날','업체명','현장 담당','정진혁 실장','연락처','1566-5904','우리 집도 바꿔 볼까요?','① 간편견적 · 디자인 시안','② 상담 문의 · 예약','③ 회사 소개 · 시공 사례','ⓒ HOME FURNISHING CO. all rights reserved.'].map(idx);
   ok(tag+'안내문 글: 기존 항목명·순서 그대로 + 작업 시간·현장 담당 + 대표번호 + 이웃 고객 칸(간편견적·상담 문의·회사 소개) + 바닥글',order.every((n,i)=>n>=0&&(i===0||n>order[i-1])),JSON.stringify(order));
   ok(tag+'이벤트 설정이 비어 있으면 이벤트 칸·쿠폰 번호·할인 글 없음 (QR 안내만)',!L.some(x=>/이웃 혜택|쿠폰|할인|%|만원/.test(x))&&g.last.ev===false&&/이벤트 칸: 안 나옴/.test(await P.locator('#gnEv').innerText()),L.join(' / ').slice(0,200));
   ok(tag+'안내문 글에 고객 이름·고객 전화·금액·원가 없음',!L.some(x=>/홍길동|1234-5678|33000000|20202020|1515151|원가|마진|성과/.test(x)));
   ok(tag+'가로 넘침 없음',await P.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2&&(()=>{const s=document.querySelector('#gnVeil .sheet');return s.scrollWidth<=s.clientWidth+2})()));
   if(SHOTS&&vn==='PC'&&w==='jjh'){fs.mkdirSync(SHOTS,{recursive:true});const u=await P.evaluate(()=>document.getElementById('gnImg').src);fs.writeFileSync(path.join(SHOTS,'안내문 A4 이벤트 없음 2026-11-21 v2.png'),Buffer.from(u.split(',')[1],'base64'));await P.screenshot({path:path.join(SHOTS,'인트라넷 창 PC 2026-11-21 v2.png')})}
   if(SHOTS&&vn!=='PC')await P.screenshot({path:path.join(SHOTS,'인트라넷 창 휴대폰 2026-11-21 v2.png')})}

  // 현장 관리의 현장 카드에서도 같은 버튼 → 같은 창
  {const P=SP.jjh;await P.evaluate(()=>{const c=document.getElementById('gnVeil');if(c)c.querySelector('[data-gnclose]').click();window.__hfT.closeSheet();location.hash='#sites'});await wait(600);await P.evaluate(()=>window.__hfT.open('sites','s1'));await wait(1200);
   const sb=P.locator('.sheet [data-gnopen="p1"]');const n=await sb.count();if(n){await sb.first().click();await wait(1500)}const g=await P.evaluate(()=>window.__hfT.gn());
   ok(vn+' 정진혁: 현장 관리 › 현장 카드에도 ‘안내문 보기·출력’ → 같은 창(같은 프로젝트·같은 QR 주소)',n===1&&g&&g.pid==='p1'&&g.last&&g.last.url===URL1,String(n));
   await P.evaluate(()=>{const c=document.getElementById('gnVeil');if(c)c.querySelector('[data-gnclose]').click();window.__hfT.closeSheet()});await win(P,'p1')}
  // (나) 고치기: 소음 심한 날 입력 → 그림에 반영 · 프로젝트는 안 바뀜
  {const P=SP.jjh;await P.fill('#gn_noise','11월 5일(목) ~ 7일(토) 철거');await wait(700);const g=await P.evaluate(()=>window.__hfT.gn());
   ok(vn+' 정진혁: 소음 심한 날 직접 입력 → 안내문에 찍힘 · 주소는 그대로',g.last.log.some(x=>x.includes('11월 5일(목) ~ 7일(토) 철거'))&&g.last.url===URL1);
   await P.fill('#gn_tel','010-9999-0001 (담당 정진혁 실장)');await wait(700);const g2=await P.evaluate(()=>window.__hfT.gn());
   ok(vn+' 정진혁: 연락처를 손으로 휴대폰 번호로 바꾸면 그 번호가 안내문·QR 주소에 (실제로 읽힘)',g2.last.url===URLM&&g2.last.log.some(x=>x.includes('010-9999-0001 (담당 정진혁 실장)'))&&(await readQr(P)).data===URLM,g2.last.url);
   await P.fill('#gn_tel','1566-5904');await wait(700)}

  // (다) 출력·PDF → 기록 덧붙이기 (한 번 연 창에서는 한 줄)
  for(const w of whos){const P=SP[w],tag=vn+' '+USERS[w].name+': ';if(w!=='jjh')await win(P,'p1');
   const before=(await dbNow())['projects/p1'];
   await P.locator('#gnVeil [data-gnout="print"]').click();await wait(1800);
   const dl=P.waitForEvent('download',{timeout:8000}).catch(()=>null);await P.locator('#gnVeil [data-gnout="pdf"]').click();const d=await dl;await wait(1200);
   const D=await dbNow(),wk=D['work/all/projects/p1']||{},mine=(wk.noticeLog||[]).filter(e=>e.by===USERS[w].id);
   ok(tag+'‘출력’ → 화면 안 인쇄(새 창 없음) · ‘PDF 저장’ → 파일 이름 ‘공사 안내문 현장명 날짜 vN.pdf’',await P.evaluate(()=>window.__printed)>=1&&!!d&&/^공사 안내문 시험마을 8단지 \d{4}-\d{2}-\d{2} v\d+\.pdf$/.test(d.suggestedFilename()),d&&d.suggestedFilename());
   ok(tag+'만든 기록이 프로젝트에 한 줄 덧붙음 (누가·언제·쿠폰 번호) — 출력+PDF 를 눌러도 한 줄',mine.length>=1&&mine.filter(e=>e.at>=new Date(Date.now()-20000).toISOString()).length===1&&mine.every(e=>e.byName===USERS[w].name&&e.coupon==='HF2611901'&&e.id&&/^\d{4}-/.test(e.at)),JSON.stringify(mine).slice(0,160));
   ok(tag+'공용 칸 줄: 옛 기록(acLog)·현장명·계약 금액 그대로 · 원가·성과금·결재 칸은 들어가지 않음',wk.title===P1.title&&wk.contractAmt===P1.contractAmt&&(wk.acLog||[]).some(e=>e.id==='ac1')&&wk.estCost===undefined&&wk.perf===undefined&&wk.approvals===undefined&&!/20202020/.test(JSON.stringify(wk)));
   ok(tag+'기록에 고객 전화·원가 없음 · 창 아래 ‘만든 기록’에 보임',!/1234|20202020/.test(JSON.stringify(wk.noticeLog))&&/만든 기록 \d+건/.test(await P.locator('#gnLogs').innerText()));
   const den=(await P.evaluate(()=>window.__mockDenied)).filter(x=>!/^(activity|access|knock)/.test(x));ok(tag+'권한 밖 쓰기 0',!den.length,den.join(','));
   void before}
  await wait(9000);
  {const D=await dbNow(),o=D['projects/p1']||{};
   if(o.perf!==P1.perf)console.log('참고 (이번 작업 전부터 있던 것 · 라이브 v0.99-40 도 같음): 직원 여러 명이 잇달아 저장하면 원본의 ‘성과금 실적 구분(perf)’ 칸이 비워짐 — perf 가 WORK_DROP 에는 있고 isoSync 의 STAFF_HIDE 보존 목록에는 없음. 안내문 기록과는 별개라 여기서는 실패로 세지 않음');
   ok(vn+' 대표 화면이 받아 원본에도 기록이 붙음 · 원본의 다른 칸(결재·옛 기록·공정·현장명·예상 원가) 그대로',(o.noticeLog||[]).length>=whos.length&&JSON.stringify(o.approvals)===JSON.stringify(P1.approvals)&&(o.acLog||[]).some(e=>e.id==='ac1')&&JSON.stringify(o.sched)===JSON.stringify(P1.sched)&&o.title===P1.title&&D['ppriv/p1'].estCost==='20202020',JSON.stringify([(o.noticeLog||[]).length,o.perf,o.approvals,(o.acLog||[]).length,JSON.stringify(o.sched)===JSON.stringify(P1.sched),o.title,D['ppriv/p1']]))}
  // 낡은 창 저장에 기록이 지워지지 않음
  {const P=SP[whos[whos.length-1]];const n0=((await dbNow())['work/all/projects/p1'].noticeLog||[]).length;
   await P.evaluate(async()=>{const T=window.__hfT,r=T.S().projects.find(x=>x.id==='p1'),o=JSON.parse(JSON.stringify(r));delete o.id;delete o.noticeLog;o.memo='낡은 창에서 저장';await T.put('projects','p1',o)});await wait(1500);
   const wk=(await dbNow())['work/all/projects/p1'];
   ok(vn+' 낡은 창(기록이 없는 옛 모습)으로 저장해도 만든 기록이 지워지지 않음 (덧붙이는 기록 칸)',(wk.noticeLog||[]).length===n0&&wk.memo==='낡은 창에서 저장'&&await P.evaluate(()=>window.__hfT.keepLog().projects.includes('noticeLog')),n0+' → '+(wk.noticeLog||[]).length)}

  // (라) 고객 전화번호는 넣을 수 없음 (대표 화면 — 고객 번호가 보이는 화면)
  {const P=A0;await win(P,'p1');const n0=((await dbNow())['projects/p1'].noticeLog||[]).length,pr0=await P.evaluate(()=>window.__printed);
   await P.fill('#gn_tel','010-1234-5678');await wait(700);const g=await P.evaluate(()=>window.__hfT.gn());
   ok(vn+' 대표: 연락처에 고객 전화번호를 적으면 경고 · QR 주소에서 번호가 빠짐',g.last.cust===true&&g.last.url===BASE+'?n=HF2611901'&&/고객 전화번호/.test(await P.locator('#gnWarn').innerText())&&(await readQr(P)).data===BASE+'?n=HF2611901',g.last.url);
   await P.locator('#gnVeil [data-gnout="print"]').click();await wait(1500);
   ok(vn+' 대표: 그 상태로는 출력·기록이 막힘',await P.evaluate(()=>window.__printed)===pr0&&((await dbNow())['projects/p1'].noticeLog||[]).length===n0&&/고객 전화번호/.test(await toasts(P)));
   await P.fill('#gn_tel','연락처 없음');await wait(700);const g2=await P.evaluate(()=>window.__hfT.gn());
   ok(vn+' 대표: 연락처에 번호가 없으면 주소에 t 없음 + 안내',g2.last.url===BASE+'?n=HF2611901'&&/전화번호가 없어요/.test(await P.locator('#gnWarn').innerText()));
   const many=await P.evaluate(()=>{const T=window.__hfT;return [T.gnTelOf('02-123-4567'),T.gnTelOf('1566-5904'),T.gnTelOf('담당 010 9999 0001 / 02-1'),T.gnTelOf('12345'),T.gnTelOf('2026-11-20'),T.gnUrl('HF<script>',"010'"),T.gnCoupon('P-2611-012'),T.gnCoupon('').slice(0,3)]});
   ok(vn+' 번호·쿠폰 규칙: 지역번호·대표번호·휴대폰만 숫자로, 그 밖은 뺌 · 주소 값은 영문·숫자만 · P-2611-012 → HF2611012 · 번호 없으면 HFD+날짜',JSON.stringify(many)===JSON.stringify(['021234567','15665904','01099990001','','',BASE+'?n=HFscript','HF2611012','HFD']),JSON.stringify(many))}

  // (마) 다른 프로젝트(p2 · 담당 이봄이): 같은 대표번호 · 공정표 없으면 공사 내용 칸
  if(SP.bom){const P=SP.bom;await win(P,'p2');const v=await vals(P),g=await P.evaluate(()=>window.__hfT.gn());
   ok(vn+' 이봄이: p2 연락처도 회사 기본 정보의 대표 전화(1566-5904) · 공정표가 없으면 ‘공사 내용’ 칸 · 준공일까지',v.tel==='1566-5904'&&g.last.url===BASE+'?n=HF2605902&t=15665904'&&v.work==='주방, 타일'&&v.period==='2026년 4월 10일 ~ 5월 1일'&&(await readQr(P)).data===g.last.url,JSON.stringify(v))}
  // 권한 단계가 없는 일반 직원: 내 담당이 아니어서 가려진 프로젝트에는 버튼 없음 · 억지로 열어도 창 안 뜸
  if(vn==='PC'){const P=await open('kim');const r=await P.evaluate(async()=>{const T=window.__hfT,S=T.S(),p=S.projects.find(x=>x.id==='p1');if(!p)return {row:false};location.hash='#projects';await new Promise(r=>setTimeout(r,500));T.open('projects','p1');await new Promise(r=>setTimeout(r,1200));const hub=!!document.getElementById('pjHub'),btn=document.querySelectorAll('[data-gnopen]').length,share=document.querySelectorAll('#pjHub .hubshare').length;await T.gnOpen('p1');await new Promise(r=>setTimeout(r,600));return {row:true,hub,btn,share,veil:!!document.getElementById('gnVeil'),html:T.gnBtnHTML(p,{__masked:true}),toast:Array.from(document.querySelectorAll('.toast')).map(t=>t.textContent).join('|')}});
   ok('PC 김일반(권한 단계 없는 일반 직원): 가려진 프로젝트(p1 · 줄은 보이지만 연결 칸은 안 열림)에는 ‘공사 안내문 만들기’ 버튼 없음 · 억지로 불러도 창이 안 뜨고 안내',r.row&&r.btn===0&&r.share===0&&!r.veil&&r.html===''&&/내 담당 프로젝트에서만/.test(r.toast),JSON.stringify(r));await P.close()}
  // (바) 서식 자료실 › 공사 안내문 이벤트 설정 (대표만)
  for(const w of whos){const P=SP[w],tag=vn+' '+USERS[w].name+': ';
   const r=await P.evaluate(async()=>{const c=document.getElementById('gnVeil');if(c)c.querySelector('[data-gnclose]').click();window.__hfT.closeSheet();location.hash='#forms';await new Promise(r=>setTimeout(r,800));const db=await window.claude.use('db');let wr='ok';try{await db.doc('config/notice').set({on:true,text:'직원이 쓴 글'})}catch(e){wr='denied'}return {card:!!document.getElementById('gnCfg'),save:!!document.querySelector('[data-gncfsave]'),txt:/공사 안내문 이벤트 설정/.test(document.getElementById('view')?document.getElementById('view').innerText:document.body.innerText),wr}});
   ok(tag+'직원 화면에는 ‘공사 안내문 이벤트 설정’ 칸 없음 · 설정 문서 쓰기 거절',!r.card&&!r.save&&!r.txt&&r.wr==='denied'&&(await dbNow())['config/notice']===undefined,JSON.stringify(r))}
  await A0.evaluate(()=>{const c=document.getElementById('gnVeil');if(c)c.querySelector('[data-gnclose]').click();window.__hfT.closeSheet();location.hash='#forms'});await wait(1200);
  ok(vn+' 대표: 서식 자료실에 ‘공사 안내문 이벤트 설정 (대표만)’ — 문자 발송·현장소통 연결 옆 · 처음엔 전부 비어 있음',await A0.locator('#gnCfg').count()===1&&/공사 안내문 이벤트 설정 \(대표만\)/.test(await A0.locator('#gnCfg summary').innerText())&&/이벤트 칸 안 나옴/.test(await A0.locator('#gnCfg summary').innerText())&&await A0.evaluate(()=>!!document.getElementById('smsCfg')&&!!document.getElementById('fstCfg')&&document.getElementById('gnCfText').value===''&&document.getElementById('gnCfUntil').value===''&&document.getElementById('gnCfTel').value===''&&!document.getElementById('gnCfOn').checked));
  await A0.locator('#gnCfg summary').click();await wait(300);await A0.check('#gnCfOn');await A0.locator('[data-gncfsave]').click();await wait(800);
  ok(vn+' 대표: 문구 없이 켜면 저장 안 됨 + 안내',(await dbNow())['config/notice']===undefined&&/이벤트 문구를 적어 주세요/.test(await toasts(A0)));
  const EV='시험 문구: 이웃 세대 상담 때 사은품 증정 (시험)';
  acceptConfirm=true;await A0.check('#gnCfOn');await A0.fill('#gnCfText',EV);await A0.fill('#gnCfUntil','2099-12-31');await A0.fill('#gnCfTel','02-123-4567');await A0.locator('[data-gncfsave]').click();await wait(1500);
  let N=(await dbNow())['config/notice']||{};
  ok(vn+' 대표: 문구·기한·대표번호 저장 (확인 한 번) → config/notice',N.on===true&&N.text===EV&&N.until==='2099-12-31'&&N.tel==='02-123-4567'&&N.by==='u_boss'&&(N.hist||[]).length===0,JSON.stringify(N).slice(0,160));
  await wait(2500);
  // (사) 이벤트 설정 채움: 모든 화면의 안내문에 이벤트 칸
  for(const w of all){const P=SP[w],tag=vn+' '+USERS[w].name+': ';const g=await win(P,'p1'),L=g.last.log,i=s=>L.findIndex(x=>x.includes(s));
   ok(tag+'이벤트 켬: 안내문에 ‘이웃 혜택’ + 대표가 적은 문구 그대로 + 기한 + 쿠폰 번호 (이웃 고객 칸 아래)',g.last.ev===true&&i('이웃 혜택')>i('③ 회사 소개')&&i(EV)>0&&i('기한: 2099년 12월 31일까지')>0&&i('쿠폰 번호 HF2611901')>0&&g.last.fit===true,L.slice(-8).join(' / '));
   const q=await readQr(P);ok(tag+'이벤트 켬: QR 주소에 문구·기한 없음 · 연락처는 설정의 회사 대표번호(02-123-4567)로 · 실제로 읽힘',g.last.url===URL2&&q.data===URL2&&!LEAK.test(g.last.url)&&(await vals(P)).tel==='02-123-4567');
   if(SHOTS&&vn==='PC'&&w==='jjh'){const u=await P.evaluate(()=>document.getElementById('gnImg').src);fs.writeFileSync(path.join(SHOTS,'안내문 A4 이벤트 있음 2026-11-21 v2.png'),Buffer.from(u.split(',')[1],'base64'))}}
  if(SP.bom){const P=SP.bom;await win(P,'p2');const v=await vals(P);ok(vn+' 이봄이: 설정의 회사 대표번호가 p2 기본 연락처로',v.tel==='02-123-4567'&&(await P.evaluate(()=>window.__hfT.gn())).last.url===BASE+'?n=HF2605902&t=021234567',v.tel)}
  // 긴 글도 한 장
  {const P=SP.jjh;await win(P,'p1');await P.fill('#gn_work','철거, 창호, 목공, 타일, 필름 도배, 마루, 가구, 전기, 조명, 설비, 방수, 도장, 유리, 금속, 준공 청소, 입주 청소, 폐기물 반출, 보양, 엘리베이터 보호');await P.fill('#gn_noise','11월 5일(목) ~ 7일(토) 철거, 11월 9일(월) ~ 10일(화) 창호·설비, 11월 16일(월) 타일 절단 — 오전 9시 ~ 오후 5시');await wait(800);const g=await P.evaluate(()=>window.__hfT.gn());
   ok(vn+' 정진혁: 글이 길어도 한 장에 들어감(글자 자동 줄임) · QR 그대로 읽힘',g.last.fit===true&&(await readQr(P)).data===URL2);
   if(SHOTS&&vn==='PC'){const u=await P.evaluate(()=>document.getElementById('gnImg').src);fs.writeFileSync(path.join(SHOTS,'안내문 A4 긴 글 2026-11-21 v2.png'),Buffer.from(u.split(',')[1],'base64'))}}
  // (아) 설정 고치기: 옛 값 hist · 기한 지남 · 끄기
  await A0.evaluate(()=>{const c=document.getElementById('gnVeil');if(c)c.querySelector('[data-gnclose]').click();window.__hfT.closeSheet();location.hash='#forms'});await wait(1000);if(!(await A0.locator('#gnCfText').isVisible()))await A0.locator('#gnCfg summary').click();
  await A0.fill('#gnCfUntil','2026-01-01');await A0.locator('[data-gncfsave]').click();await wait(1500);N=(await dbNow())['config/notice']||{};
  ok(vn+' 대표: 다시 저장하면 옛 값은 hist 에 남음 (덮어써 지우지 않음)',N.until==='2026-01-01'&&(N.hist||[]).length===1&&N.hist[0].text===EV&&N.hist[0].until==='2099-12-31');
  await wait(2500);{const g=await win(SP.jjh,'p1');ok(vn+' 정진혁: 이벤트 기한이 지나면 이벤트 칸이 빠짐',g.last.ev===false&&!g.last.log.some(x=>/이웃 혜택|쿠폰/.test(x))&&/기한이 지났어요/.test(await SP.jjh.locator('#gnEv').innerText()))}
  await A0.evaluate(()=>{location.hash='#forms'});await wait(800);if(!(await A0.locator('#gnCfText').isVisible()))await A0.locator('#gnCfg summary').click();
  await A0.fill('#gnCfUntil','');await A0.uncheck('#gnCfOn');await A0.locator('[data-gncfsave]').click();await wait(1500);acceptConfirm=false;N=(await dbNow())['config/notice']||{};await wait(2500);
  {const g=await win(SP.jjh,'p1');ok(vn+' 대표가 끄면: 문구는 남아 있어도 이벤트 칸 없음 · hist 2개',N.on===false&&N.text===EV&&(N.hist||[]).length===2&&g.last.ev===false)}

  // (카) v0.99-42: 초안 자동 (희망 일정·담당자) · 빈 칸은 빠짐
  {const P=SP.jjh,g=await win(P,'p3'),v=await vals(P),box=await P.locator('#pjHub .gnbox').innerText();
   ok(vn+' 정진혁: 착공·준공일이 없는 프로젝트(p3)는 공사기간 = 희망 일정 · 공사 세대 = 주소 · 공사내용 · 현장 담당 · 작업 시간 기본값 — 고객 이름·전화 없음',v.period==='26년 12월 1일 - 12월 20일'&&v.unit==='다른마을 1동 101호'&&v.work==='도배, 장판'&&v.mgr==='정진혁 실장'&&v.hours==='평일 오전 9시 ~ 오후 6시'&&v.tel!==''&&!/박하나|7777/.test(JSON.stringify(v)+g.last.log.join('|')+g.last.url+box)&&g.last.url.startsWith(BASE+'?n=HF2611903'),JSON.stringify(v));
   const b0=JSON.stringify((await dbNow())['work/all/projects/p3']||null),o0=JSON.stringify((await dbNow())['projects/p3']);
   await P.fill('#gn_hours','');await P.fill('#gn_mgr','');await wait(700);const g2=await P.evaluate(()=>window.__hfT.gn());
   ok(vn+' 정진혁: 작업 시간·현장 담당을 비우면 그 줄이 안내문에서 빠짐 (다른 줄은 그대로)',!g2.last.log.includes('작업 시간')&&!g2.last.log.includes('현장 담당')&&g2.last.log.includes('공사기간')&&g2.last.log.includes('연락처')&&g2.last.fit===true);
   await P.fill('#gn_hours','평일 오전 9시 ~ 오후 6시 (토요일 오전만)');await wait(700);const g3=await P.evaluate(()=>window.__hfT.gn());
   ok(vn+' 정진혁: 작업 시간을 고치면 안내문에 그대로 · 초안을 보고 고치기만 해서는 프로젝트 줄(원본·공용 칸)이 바뀌지 않음',g3.last.log.includes('평일 오전 9시 ~ 오후 6시 (토요일 오전만)')&&JSON.stringify((await dbNow())['work/all/projects/p3']||null)===b0&&JSON.stringify((await dbNow())['projects/p3'])===o0)}
  {const u=await SP.jjh.evaluate(()=>{const f=window.__hfT.gnUnit;return [f('경기도 구리시 아름마을 LG아파트 202동 708호'),f('서울특별시 강남구 시험아파트 1동 101호'),f('시험마을 8단지 804동 603호'),f('구리시 인창동'),f(''),f('경기 남양주시 진접읍 시험단지 3동')]});
   ok(vn+' 공사 세대 = 주소에서 단지·동·호까지 (앞의 시·도·시·군·구만 뺌 · 짧은 주소는 그대로)',JSON.stringify(u)===JSON.stringify(['아름마을 LG아파트 202동 708호','시험아파트 1동 101호','시험마을 8단지 804동 603호','구리시 인창동','','진접읍 시험단지 3동']),JSON.stringify(u))}
  // (타) v0.99-42: QR 유입 현황 (서식 자료실) — 대표·전체 담당·실무 팀 · 방문 수는 ‘연결 전’
  const statOf=async P=>{await P.evaluate(()=>{const c=document.getElementById('gnVeil');if(c)c.querySelector('[data-gnclose]').click();window.__hfT.closeSheet();location.hash='#forms'});await wait(1000);
   return P.evaluate(()=>{const d=document.getElementById('gnStat');if(!d)return null;d.open=true;return {sum:d.querySelector('summary').innerText,txt:d.innerText,rows:Array.from(d.querySelectorAll('tbody tr')).map(tr=>Array.from(tr.cells).map(c=>c.textContent.trim())),pull:d.querySelectorAll('[data-gnqpull]').length,wide:document.documentElement.scrollWidth<=window.innerWidth+2}})};
  for(const w of all){const P=SP[w],tag=vn+' '+USERS[w].name+': ',st=await statOf(P),made=((await dbNow())[w==='admin'?'projects/p1':'work/all/projects/p1'].noticeLog||[]).length;
   const r1=st&&st.rows.find(r=>r[1]==='HF2611901'),r0=st&&st.rows.find(r=>r[1]==='-');
   ok(tag+'서식 자료실에 ‘QR 유입 현황’ 표 — 현장별 안내문 만든 횟수·QR 방문 수·접수 건수',!!st&&/QR 유입 현황/.test(st.sum)&&!!r1&&/시험마을 8단지/.test(r1[0])&&/P-2611-901/.test(r1[0])&&+r1[2]===made&&made>=1,st&&JSON.stringify(st.rows));
   ok(tag+'접수 건수 = 유입 경로 ‘공사 안내문 QR’ + 쿠폰 번호(대소문자·줄표 무시) · 같은 고객의 고객 카드+프로젝트는 한 건 · 쿠폰 번호를 안 적은 접수는 따로 한 줄',!!r1&&r1[5]==='2'&&!!r0&&r0[5]==='1'&&/쿠폰 번호를 안 적은 접수/.test(r0[0]),st&&JSON.stringify(st.rows));
   ok(tag+'QR 방문 수는 집계 설치 전이라 ‘연결 전’ · 설정 문서 config/noticeqr 없음',!!r1&&r1[3]==='연결 전'&&/방문 수 연결 전/.test(st.sum)&&(await dbNow())['config/noticeqr']===undefined);
   ok(tag+'표에 고객 이름·전화·금액·원가·성과금 없음 · 가로 넘침 없음 · ‘새로 읽기’ 버튼은 대표만',!!st&&!/홍길동|박하나|박두리|박세찌|1234|7777|33000000|12000000|20202020|원가|마진|성과/.test(st.txt.replace(/금액·고객 이름·전화번호는 여기에 없어요/,''))&&st.wide&&st.pull===(w==='admin'?1:0),st&&st.txt.slice(0,200));
   if(w!=='admin'){const wr=await P.evaluate(async()=>{const db=await window.claude.use('db');try{await db.doc('config/noticeqr').set({codes:{HF2611901:{visit:999}},at:'x'});return 'ok'}catch(e){return 'denied'}});ok(tag+'직원은 방문 수 문서(config/noticeqr)를 쓸 수 없음',wr==='denied'&&(await dbNow())['config/noticeqr']===undefined)}}
  if(vn==='PC'){const P=await open('kim');await P.evaluate(()=>{location.hash='#forms'});await wait(1000);ok('PC 김일반(권한 단계 없는 일반 직원): ‘QR 유입 현황’ 표 없음',await P.locator('#gnStat').count()===0&&await P.evaluate(()=>window.__hfT.gnStatSees())===false);await P.close()}
  {const P=SP.jjh;await P.evaluate(()=>{location.hash='#customers'});await wait(600);await P.evaluate(()=>window.__hfT.open('customers','c2'));await wait(1200);const t1=await P.locator('#sheetForm').innerText();await P.evaluate(()=>{window.__hfT.closeSheet();location.hash='#projects'});await wait(500);await P.evaluate(()=>window.__hfT.open('projects','p3'));await wait(1200);const t2=await P.locator('#sheetForm').innerText();
   ok(vn+' 정진혁: 고객 카드·프로젝트 화면에 ‘공사 안내문 쿠폰 번호’ 칸 (유입 경로 옆)',/공사 안내문 쿠폰 번호/.test(t1)&&/공사 안내문 쿠폰 번호/.test(t2));await P.evaluate(()=>window.__hfT.closeSheet())}
  // 집계 파일이 있는 경우(가짜 드라이브): 대표 화면이 읽어 config/noticeqr 로 옮기고 직원 화면에 보임
  if(vn==='PC'){const FILE=JSON.stringify({v:1,at:'2026-11-21T01:00:00.000Z',codes:{HF2611901:{visit:7,est:2,consult:1,about:1,sms:0,call:-3},'BAD<x':{visit:5},HF9999999:{visit:3},hf1:{visit:1}}});
   const A2=await open('admin',12000,`;window.__mcpCalls=[];window.__MOCKMCP={callTool:async(sv,tool,inp)=>{window.__mcpCalls.push([sv,tool,JSON.stringify(inp)]);const wrap=o=>({content:[{type:'text',text:JSON.stringify(o)}]});if(tool==='search_files')return wrap({files:/hf_qr_count\\.json/.test(inp.query)?[{id:'fq1',title:'hf_qr_count.json'}]:[]});if(tool==='download_file_content'&&inp.fileId==='fq1')return wrap({content:btoa(unescape(encodeURIComponent(${JSON.stringify(FILE)})))});return wrap({})}};`);
   let st=await statOf(A2);await A2.locator('#gnStat [data-gnqpull]').click().catch(()=>{});await wait(2500);st=await statOf(A2);const Q=(await dbNow())['config/noticeqr']||{};
   ok('PC 대표: ‘QR 방문 수 새로 읽기’ → 드라이브 집계 파일을 읽어 config/noticeqr 에 (정해진 모양의 현장 코드·숫자만 · 이상한 값은 버림)',JSON.stringify(Q.codes)===JSON.stringify({HF2611901:{visit:7,est:2,consult:1,about:1},HF9999999:{visit:3}})&&Q.by==='u_boss'&&Q.fileId==='fq1'&&Array.isArray(Q.hist),JSON.stringify(Q).slice(0,200));
   const r1=st.rows.find(r=>r[1]==='HF2611901'),r9=st.rows.find(r=>r[1]==='HF9999999');
   ok('PC 대표: 표에 방문 수 7 · 누른 버튼(간편견적 2 · 상담 문의 1 · 회사 소개 1) · 모르는 현장 코드는 ‘현장을 찾지 못한 번호’',/방문 수 연결됨/.test(st.sum)&&r1&&r1[3]==='7'&&/간편견적 2 · 상담 문의 1 · 회사 소개 1/.test(r1[4])&&r9&&/현장을 찾지 못한 번호/.test(r9[0])&&r9[3]==='3',JSON.stringify(st.rows));
   const calls=await A2.evaluate(()=>window.__mcpCalls.filter(c=>/"(query|fileId|title)":"[^"]*(hf_qr_count|fq1)/.test(c[2])));
   ok('PC 대표: 드라이브는 읽기만 (search_files · download_file_content) — 만들기·고치기 없음',calls.length>=2&&calls.length<=6&&calls.every(c=>c[0]==='Google Drive'&&/^(search_files|download_file_content)$/.test(c[1])),calls.map(c=>c[1]).join(','));
   await wait(3000);const sj=await statOf(SP.jjh),rj=sj&&sj.rows.find(r=>r[1]==='HF2611901');
   ok('PC 정진혁: 대표 화면이 옮겨 둔 방문 수가 직원 화면 표에도 보임 (7)',!!rj&&rj[3]==='7'&&/방문 수 연결됨/.test(sj.sum),sj&&JSON.stringify(sj.rows));await A2.close()}
  // (자) 미리 보기(대표가 정진혁 화면 보기): 볼 수는 있지만 만들기·기록 막힘
  if(vn==='PC'){const P=A0;await P.evaluate(()=>{const c=document.getElementById('gnVeil');if(c)c.querySelector('[data-gnclose]').click();window.__hfT.closeSheet();location.hash='#preview'});await wait(900);await P.locator('[data-pvgo="st-jung"]').click();await wait(3000);
   const n0=((await dbNow())['projects/p1'].noticeLog||[]).length,w0=((await dbNow())['work/all/projects/p1'].noticeLog||[]).length,pr0=await P.evaluate(()=>window.__printed);
   await win(P,'p1');const dis=await P.locator('#gnVeil [data-gnout]').evaluateAll(a=>a.map(x=>x.disabled));await P.evaluate(()=>document.querySelectorAll('#gnVeil [data-gnout]').forEach(x=>{x.disabled=false;x.click()}));await wait(1500);const D=await dbNow();
   ok('PC 미리 보기(정진혁 화면): 창은 보이고 ‘출력’·‘PDF 저장’은 잠김 · 억지로 눌러도 인쇄·기록 없음',dis.length===2&&dis.every(Boolean)&&await P.evaluate(()=>window.__printed)===pr0&&(D['projects/p1'].noticeLog||[]).length===n0&&(D['work/all/projects/p1'].noticeLog||[]).length===w0,JSON.stringify(dis));
   await P.evaluate(()=>{location.hash='#forms'});await wait(800);ok('PC 미리 보기: 직원 화면처럼 설정 칸 없음',await P.locator('#gnCfg').count()===0)}
  // 유입 경로
  ok(vn+' 유입 경로 선택지에 ‘공사 안내문 QR’ 추가 · 기존 값 순서 그대로',/const ROUTES=\["간편견적","오늘의집","소개","매장방문","유튜브","인스타그램","블로그","전화","공사 안내문 QR","기타"\];/.test(HTML));
  ok(vn+' 바깥으로 나간 요청 0 (QR·안내문을 만들면서 외부 서비스에 주소를 보내지 않음)',reqs.filter(u=>!/^http:\/\/hf\.test\/|^data:|^blob:/.test(u)&&!/fonts\.(googleapis|gstatic)/.test(u)).length===0,reqs.filter(u=>!/^http:\/\/hf\.test\/|^data:|^blob:/.test(u)).slice(0,3).join(' '));
  for(const w of all)await SP[w].close();
  // (차) 연습 모드(저장소 연결 안 됨): 만들 수는 있어도 기록은 남기지 않음
  if(vn==='PC'){const p=await open('jjh',9000,`;(()=>{const u=window.claude.use;window.claude.use=async n=>{if(n==='db')throw new Error('no db');return u(n)};try{localStorage.setItem('hf-intranet-v1',JSON.stringify({projects:[Object.assign({id:'px'},${JSON.stringify(P1)})]}))}catch(e){}})();`);
   const before=await p.evaluate(()=>localStorage.getItem('hf-intranet-v1'));await p.evaluate(()=>{location.hash='#projects'});await wait(800);
   const row=p.locator('[data-open="projects"][data-id="px"]').first();const has=await row.count();if(has){await row.click();await wait(1200)}
   const btn=p.locator('#pjHub [data-gnopen]');const bc=await btn.count();if(bc){await btn.click();await wait(1500);await p.locator('#gnVeil [data-gnout="print"]').click();await wait(1500)}
   const after=await p.evaluate(()=>localStorage.getItem('hf-intranet-v1')),t=await toasts(p);
   ok('PC 연습 모드: 안내문은 뽑을 수 있지만 만든 기록은 저장하지 않음 (프로젝트 줄 그대로) + 안내',has>0&&bc===1&&!/noticeLog/.test(after||'')&&/연습 모드라 만든 기록은 남기지 않았어요/.test(t)&&await p.evaluate(()=>window.__printed)===1,has+'/'+bc+' '+t);await p.close()}
  await A0.close().catch(()=>{});await ctx.close()}
 {const i=HTML.indexOf('// ===== 공사 안내문 만들기 (대표 지시 2026-11-20'),j=HTML.indexOf('function hubHTML(p){'),seg=HTML.slice(i,j);
  ok('인트라넷 소스(안내문 코드 구간): alert·confirm·prompt·window.open·iframe·fetch·삭제 0 · 외부 QR 서비스 주소 0 · 할인 금액·율을 지어낸 글 0',i>0&&j>i&&!/alert\(|[^k]confirm\(|prompt\(|window\.open|<iframe|fetch\(|\.delete\(|XMLHttpRequest|api\.qrserver|chart\.googleapis|quickchart/.test(seg)&&!/\d+\s*(%|만\s*원|원)\s*할인|할인\s*\d/.test(seg)&&!/<script[^>]+src=/.test(HTML.slice(0,2000)));
  ok('인트라넷 소스: 주소 조립은 gnUrl 한 곳 — n(영문·숫자)·t(숫자)만',(seg.match(/GN_EVENT\+/g)||[]).length===1&&/const gnUrl=\(n,t\)=>GN_EVENT\+"\?n="\+String\(n\|\|""\)\.replace\(\/\[\^A-Za-z0-9\]\/g,""\)/.test(seg));
  ok('버전: APP_VER v0.99-42 · APP_DATE 2026-11-21 · v0.99-41·v0.99-40 설명 그대로 뒤에',/const APP_VER="v0\.99-42 \(공사 안내문 보강/.test(HTML)&&/\/ v0\.99-41 \(공사 안내문 만들기/.test(HTML)&&/\/ v0\.99-40 \(묶음: 드라이브 파일 새 탭 열기/.test(HTML)&&/APP_DATE="2026-11-21"/.test(HTML));
  ok('인트라넷 소스: 이번 작업이 perf·STAFF_HIDE·WORK_DROP 을 건드리지 않음 (v0.99-41 과 같은 줄)',/const STAFF_HIDE=\["approvals","costTotal"\];/.test(HTML)&&/const WORK_DROP=\["estCost","perf","qCost","approvals","costTotal","pc","margin","marginRate","bonus","bonusBase","__leak","__leakCost","__masked","__rawTel","__deleted","__gone","__goneAt","__goneWhy"\];/.test(HTML))}
 ok('인트라넷: 화면 오류 0 · 브라우저 대화상자 0 (설정 저장 확인은 okAsk)',!errs.length&&!dialogs.length,errs.slice(0,3).join(' | ')+dialogs.join(','));

 // ===== 2부: 고객 안내 페이지 (event/index.html) =====
 const errs2=[];const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==','base64');
 for(const [vn,opt,ios] of [['안드로이드',devices['Pixel 7'],false],['아이폰',devices['iPhone 13'],true]]){
  const ctx=await b.newContext(opt);const reqs=[];ctx.on('request',q=>reqs.push(q.url()));
  let SITES='{}',PAGE=EVENT;await ctx.route('http://e.test/**',r=>{const u=r.request().url();if(/\/sites\.json/.test(u))return SITES===null?r.fulfill({status:404,body:'no'}):r.fulfill({contentType:'application/json',body:SITES});if(/\/photos\/ok/.test(u))return r.fulfill({contentType:'image/png',body:PNG});if(/\/photos\//.test(u))return r.fulfill({status:404,body:'no'});return r.fulfill({contentType:'text/html',body:PAGE})});await ctx.route(/img\.test|script\.google\.com|soo17115-cmyk/,r=>/img\.test/.test(r.request().url())?r.fulfill({contentType:'image/png',body:PNG}):r.fulfill({status:200,contentType:'text/plain',body:'ok'}));
  const go=async qs=>{const p=await ctx.newPage();p.on('pageerror',e=>errs2.push(vn+': '+e.message));p.on('dialog',d=>{errs2.push(vn+' 대화상자 '+d.message());d.dismiss()});await p.goto('http://e.test/card/event/'+qs);await wait(400);return p};
  const st=p=>p.evaluate(()=>({coupon:document.getElementById('couponBox').hidden?null:document.getElementById('couponNo').textContent,sms:!document.getElementById('btnSms').hidden,call:document.getElementById('btnCall').hidden?null:document.getElementById('btnCall').getAttribute('href'),noTel:document.getElementById('noTel').hidden?null:document.getElementById('noTel').textContent,est:document.getElementById('btnEst').href,view:['vHome','vConsult','vAbout'].filter(v=>!document.getElementById(v).hidden).join(),photo:!document.getElementById('photoBox').hidden,body:document.body.innerText,xss:window.__xss||0,scripts:document.scripts.length,imgs:document.images.length,ls:localStorage.length+sessionStorage.length,ck:document.cookie}));
  let p=await go('?n=HF2611901&t=01099990001'),s=await st(p);const s0=s;
  ok(vn+' 첫 화면: 사과 인사 · (사진 없으면 사진 칸 숨김) · 이웃 혜택(쿠폰 번호) · 버튼 3개 간편견적·상담 문의·회사 소개 — 상담 예약서는 첫 화면에 없음',/이웃 공사로 불편을 드려\s*죄송합니다/.test(s.body)&&s.coupon==='HF2611901'&&s.view==='vHome'&&!s.photo&&/이웃 혜택/.test(s.body)&&!/희망 상담 날짜|남길 말|문자로 예약 보내기/.test(s.body)&&/요청 칸에 쿠폰 번호를 적어 주세요/.test(s.body)&&JSON.stringify(await p.evaluate(()=>Array.from(document.querySelectorAll('#vHome .stack a.btn')).map(a=>a.firstChild.textContent.trim())))===JSON.stringify(['간편견적','상담 문의','회사 소개'])&&await p.evaluate(()=>document.getElementById('couponBox').getBoundingClientRect().top<document.getElementById('btnEst').getBoundingClientRect().top),s.body.slice(0,200));
  ok(vn+' 간편견적 버튼: 아무것도 묻지 않고 바로 간편견적 주소로(새 탭) · 쿠폰 번호만 붙음 — 이름·전화 없음',s.est==='https://soo17115-cmyk.github.io/?coupon=HF2611901'&&await p.evaluate(()=>{const a=document.getElementById('btnEst');return a.target==='_blank'&&/noopener/.test(a.rel)&&!document.querySelector('#vHome input,#vHome select,#vHome textarea')}));
  if(SHOTS&&!ios)await p.screenshot({path:path.join(SHOTS,'고객 페이지 첫 화면 휴대폰 2026-11-21 v2.png'),fullPage:true});
  await p.locator('#btnAbout').click();await wait(250);s=await st(p);
  ok(vn+' ‘회사 소개’ → 회사 소개 화면(홈페이지·블로그·유튜브 · 전화 걸기) · ‘← 처음으로’',s.view==='vAbout'&&/회사 소개/.test(s.body)&&await p.evaluate(()=>document.getElementById('lnkHome').href==='https://soo-cpu.github.io/card/site/'&&/blog\.naver\.com/.test(document.getElementById('lnkBlog').href)&&/youtube\.com/.test(document.getElementById('lnkYt').href)&&document.getElementById('btnCall2').getAttribute('href')==='tel:01099990001'));
  await p.locator('#vAbout .back').click();await wait(250);s=await st(p);ok(vn+' ‘← 처음으로’ → 첫 화면',s.view==='vHome');
  await p.locator('#btnConsult').click();await wait(250);s=await st(p);
  ok(vn+' ‘상담 문의’ → 상담 화면(전화 걸기 + 상담 예약서)',s.view==='vConsult'&&/상담 예약서/.test(s.body)&&await p.locator('#rName').isVisible()&&await p.locator('#btnCall').isVisible());
  ok(vn+' 쿠폰 안내: ‘상담 때 쿠폰 번호를 알려 주시면 적용’ · 페이지에 금액·할인율 없음',/상담 때 쿠폰 번호를 알려 주시면/.test(s0.body)&&!/\d+\s*%|\d+\s*만\s*원|\d+원/.test(s0.body+s.body));
  ok(vn+' 문자·전화 버튼 보임 · 전화 = tel:안내문 번호',s.sms&&s.call==='tel:01099990001'&&s.noTel===null);
  await p.locator('#btnSms').evaluate(a=>a.addEventListener('click',e=>{window.__h=a.getAttribute('href');e.preventDefault()}));
  await p.locator('#btnSms').click();await wait(200);
  ok(vn+' 이름 없이 누르면 문자 앱을 열지 않고 안내',await p.evaluate(()=>window.__h)==='#consult'&&/이름을 적어 주세요/.test(await p.locator('#rMsg').innerText()));
  await p.fill('#rName','김이웃');await p.fill('#rTel','010-5555-6666');await p.fill('#rAddr','시험아파트 34평');await p.fill('#rDate','2026-12-01');await p.selectOption('#rTime',{index:2});await p.check('#rWork input[value="욕실"]');await p.check('#rWork input[value="주방"]');await p.fill('#rMemo','문의 & 상담?\n두 줄 <b>');
  await p.locator('#btnSms').click();await wait(200);const h=await p.evaluate(()=>window.__h),sep=ios?'&':'?',body=decodeURIComponent((h||'').split('body=')[1]||'');
  ok(vn+' 문자 링크: sms:안내문 번호'+sep+'body=… (받는 번호 = t)',(h||'').startsWith('sms:01099990001'+sep+'body=')&&!/[\n ]/.test(h),(h||'').slice(0,60));
  ok(vn+' 문자 본문: 예약 내용 + 쿠폰 번호가 미리 채워짐',body==='[상담 예약] 공사 안내문 QR\n이름: 김이웃\n연락처: 010-5555-6666\n주소: 시험아파트 34평\n희망 상담: 2026-12-01 오후 (12시~18시)\n원하는 공사: 욕실, 주방\n남길 말: 문의 & 상담? 두 줄 <b>\n쿠폰 번호: HF2611901',body);
  s=await st(p);ok(vn+' 입력값을 저장·전송하지 않음 (localStorage·sessionStorage·쿠키 0 · 바깥 요청 0 · form 전송 없음)',s.ls===0&&s.ck===''&&reqs.every(u=>u.startsWith('http://e.test/card/event/'))&&!/XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie|WebSocket/.test(EVENT)&&(EVENT.match(/fetch\(/g)||[]).length===2&&/var COUNT_URL="";/.test(EVENT),reqs.filter(u=>!u.startsWith('http://e.test/')).join(' '));
  ok(vn+' 가로 넘침 없음 · 버튼 높이 44px 이상',await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1&&Array.from(document.querySelectorAll('a.btn:not([hidden]),button.btn')).filter(x=>x.offsetParent!==null).every(x=>x.getBoundingClientRect().height>=44)&&['vHome','vAbout'].every(v=>{const h=document.getElementById(v),was=h.hidden;h.hidden=false;const r=Array.from(h.querySelectorAll('a.btn:not([hidden]),button.btn')).every(x=>x.getBoundingClientRect().height>=44);h.hidden=was;return r})));
  if(SHOTS&&!ios){await p.evaluate(()=>{document.getElementById('rName').blur();window.scrollTo(0,0)});await p.screenshot({path:path.join(SHOTS,'고객 페이지 휴대폰 2026-11-21 v2.png'),fullPage:true})}
  await p.close();
  // 번호가 없거나 이상한 값
  p=await go('?n=HF2611901#consult');s=await st(p);ok(vn+' t 없음: 문자·전화 버튼 대신 ‘안내문에 적힌 번호로 연락 주세요’ · 예약 내용 복사는 됨',!s.sms&&s.call===null&&/안내문에 적힌 번호로 연락 주세요/.test(s.noTel||'')&&s.coupon==='HF2611901');
  await p.fill('#rName','김이웃');await p.fill('#rTel','01055556666');await p.locator('#btnCopy').click();await wait(300);
  ok(vn+' t 없음: ‘예약 내용 복사’ → 화면에 예약 글(쿠폰 번호 포함)',/\[상담 예약\] 공사 안내문 QR[\s\S]*쿠폰 번호: HF2611901/.test(await p.locator('#rPreview').innerText()));await p.close();
  for(const bad of ['0109999','010-9999-0001','01099990001;rm','+821099990001','99999999999','javascript:alert(1)','01099990001%26body%3Dx','0109999000199'])
  {p=await go('?n=HF1&t='+bad);s=await st(p);ok(vn+' 이상한 t ('+bad+'): 문자·전화 버튼 없음',!s.sms&&s.call===null&&!!s.noTel,String(s.call));await p.close()}
  p=await go('?n=HF1&t=15665904');s=await st(p);ok(vn+' 대표번호(15xx)·지역번호: 전화 걸기만 (문자 버튼 없음 + 안내)',!s.sms&&s.call==='tel:15665904'&&/문자를 받지 못할 수 있어요/.test(s.noTel||''));await p.close();
  p=await go('?n=HF1&t=021234567');s=await st(p);ok(vn+' 지역번호(02): 전화 걸기만',!s.sms&&s.call==='tel:021234567');await p.close();
  // 주입 시도
  for(const bad of ['%3Cscript%3Ewindow.__xss%3D1%3C%2Fscript%3E','%3Cimg%20src%3Dx%20onerror%3D%22window.__xss%3D1%22%3E','HF-1%22%3E%3Cb%3E','AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA','%EC%BF%A0%ED%8F%B0','HF%201']){
   p=await go('?n='+bad+'&t=01099990001%3Cscript%3Ewindow.__xss%3D1%3C%2Fscript%3E');s=await st(p);
   ok(vn+' 주입·이상한 n ('+bad.slice(0,22)+'): 쿠폰 칸 숨김 · 스크립트 실행·태그 삽입 없음 · 문자 버튼 없음',s.coupon===null&&s.xss===0&&s.scripts===1&&s.imgs===0&&!s.sms&&s.call===null&&await p.evaluate(()=>document.querySelectorAll('[onerror],main script,main b b').length)===0);await p.close()}
  p=await go('?n=hf2611901&t=01099990001&x=%3Cscript%3E#%3Cimg%20onerror%3D1%3E');s=await st(p);ok(vn+' 소문자 쿠폰은 대문자로 · 모르는 칸·# 뒤는 무시',s.coupon==='HF2611901'&&s.xss===0&&s.sms);await p.close();
  p=await go('');s=await st(p);ok(vn+' 값 없이 열어도 화면이 나옴 (쿠폰 칸 없음 · 버튼 3개 · 번호 안내 · 방문 집계 주소가 비어 있어 아무것도 안 보냄)',s.coupon===null&&!s.sms&&s.view==='vHome'&&s.est==='https://soo17115-cmyk.github.io/'&&/간편견적/.test(s.body)&&/상담 문의/.test(s.body)&&/회사 소개/.test(s.body)&&/공사 안내문을 보고 왔어요/.test(s.body));await p.close();
  // v0.99-42: 옛 주소·옛 닻(#reserve)·모르는 칸(src)도 그대로 열림
  p=await go('?n=HF2611901&t=15665904&src=store#reserve');s=await st(p);ok(vn+' 이미 인쇄된 QR(n·t) + 모르는 칸(src) + 옛 #reserve → 열림(상담 화면) · 쿠폰 그대로',s.coupon==='HF2611901'&&s.view==='vConsult'&&s.call==='tel:15665904');await p.close();
  p=await go('?n=HF2611901&t=15665904#%3Cimg%20src%3Dx%3E');s=await st(p);ok(vn+' 모르는 # 값 → 첫 화면',s.view==='vHome'&&s.imgs===0);await p.close();
  // 단지별 내용(sites.json): 사진 → 혜택 → 버튼 순서 · 글은 글자로만 · 이상한 사진 주소는 버림
  SITES=JSON.stringify({HF2611901:{name:'시험마을 8단지<b>',photos:['photos/ok-1.jpg','https://img.test/b.png','javascript:alert(1)','../photos/ok-x.jpg','photos/ok 2.jpg','http://img.test/c.png','photos/"onerror="window.__xss=1.jpg',{a:1}],benefit:'시험 혜택: 상담 때 사은품 <img src=x onerror=window.__xss=1>'},HF2:{name:'깨진 단지',photos:['photos/none.jpg']}});
  p=await go('?n=HF2611901&t=01099990001');await wait(500);s=await st(p);
  const o=await p.evaluate(()=>({title:document.getElementById('photoTitle').textContent,n:document.querySelectorAll('#photoList img').length,src:Array.from(document.querySelectorAll('#photoList img')).map(i=>i.getAttribute('src')),ben:document.getElementById('benefitText').hidden?null:document.getElementById('benefitText').textContent,kids:document.querySelectorAll('#benefitText *,#photoTitle *').length,top:['photoBox','couponBox','btnEst'].map(i=>document.getElementById(i).getBoundingClientRect().top)}));
  ok(vn+' sites.json 있음: ① 이 단지 공사 사진(정해진 모양의 주소 2장만) → ② 이웃 혜택 문구 → ③ 버튼 순서',s.photo&&o.n===2&&JSON.stringify(o.src)===JSON.stringify(['photos/ok-1.jpg','https://img.test/b.png'])&&/^시험마을 8단지/.test(o.title)&&/공사 사진$/.test(o.title)&&/시험 혜택: 상담 때 사은품/.test(o.ben||'')&&o.top[0]<o.top[1]&&o.top[1]<o.top[2],JSON.stringify(o));
  ok(vn+' sites.json 글에 태그가 있어도 글자로만 (스크립트 실행·태그 삽입 없음) · 가로 넘침 없음',s.xss===0&&o.kids===0&&s.scripts===1&&await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1&&document.querySelectorAll('[onerror]').length===0));
  if(SHOTS&&!ios)await p.screenshot({path:path.join(SHOTS,'고객 페이지 첫 화면 사진 있음 휴대폰 2026-11-21 v2.png'),fullPage:true});await p.close();
  p=await go('?n=HF1&t=01099990001');await wait(400);s=await st(p);ok(vn+' sites.json 에 없는 현장: 사진 칸 숨김 · 기본 혜택 안내',!s.photo&&s.coupon==='HF1'&&/상담 때 쿠폰 번호를 알려 주시면/.test(s.body));await p.close();
  p=await go('?n=HF2&t=01099990001');await wait(600);s=await st(p);ok(vn+' 사진이 안 열리면(404) 사진 칸이 다시 숨겨짐',!s.photo&&s.imgs===0);await p.close();
  for(const bad of [null,'{"HF2611901":','[1,2]','"x"','{"HF2611901":"x"}','{"HF2611901":{"photos":"photos/ok-1.jpg","benefit":{"a":1}}}']){SITES=bad;p=await go('?n=HF2611901&t=01099990001');await wait(400);s=await st(p);ok(vn+' sites.json 이 없거나 깨짐('+String(bad).slice(0,24)+'): 기본 화면 그대로',!s.photo&&s.coupon==='HF2611901'&&s.view==='vHome'&&s.xss===0);await p.close()}
  SITES='{}';
  // 방문 집계: 주소를 넣었을 때만 · 현장 코드 + 버튼 종류만
  {const CU='https://script.google.com/macros/s/AKtest_1-x/exec';PAGE=EVENT.replace('var COUNT_URL="";','var COUNT_URL="'+CU+'";');const n0=reqs.length;
   p=await go('?n=HF2611901&t=01099990001');await wait(400);await p.locator('#btnAbout').click();await wait(200);await p.locator('#vAbout .back').click();await wait(200);await p.locator('#btnConsult').click();await wait(200);
   await p.fill('#rName','김이웃');await p.fill('#rTel','010-5555-6666');await p.fill('#rMemo','비밀 메모');await p.locator('#btnSms').evaluate(a=>a.addEventListener('click',e=>e.preventDefault()));await p.locator('#btnSms').click();await wait(200);
   await p.evaluate(()=>{location.hash='#home'});await wait(200);await p.locator('#btnEst').evaluate(a=>{a.addEventListener('click',e=>e.preventDefault());a.click()});await wait(400);
   const cs=reqs.slice(n0).filter(u=>!u.startsWith('http://e.test/'));
   ok(vn+' 집계 주소가 있으면: 열림·회사 소개·상담 문의·문자·간편견적을 한 번씩 — ‘현장 코드 + 버튼 종류’만 (이름·전화·메모·연락처 t 없음)',JSON.stringify(cs)===JSON.stringify(['visit','about','consult','sms','est'].map(k=>CU+'?c=HF2611901&b='+k))&&!/김이웃|5555|6666|%EA|01099990001|비밀/.test(cs.join(' '))&&await p.evaluate(()=>!document.getElementById('countNote').hidden),cs.join(' '));await p.close();
   p=await go('');await wait(300);const c2=reqs.slice(n0).filter(u=>!u.startsWith('http://e.test/')).slice(cs.length);ok(vn+' 쿠폰 번호 없이 열면 현장 코드 자리에 NONE',JSON.stringify(c2)===JSON.stringify([CU+'?c=NONE&b=visit']),c2.join(' '));await p.close();
   for(const badU of ['http://script.google.com/macros/s/AK/exec','https://evil.test/macros/s/AK/exec','https://script.google.com/macros/s/AK/exec?x=1','javascript:alert(1)']){PAGE=EVENT.replace('var COUNT_URL="";','var COUNT_URL="'+badU+'";');const n1=reqs.length;p=await go('?n=HF2611901');await wait(300);ok(vn+' 집계 주소가 Apps Script 웹앱 모양이 아니면('+badU.slice(0,30)+') 보내지 않음',reqs.slice(n1).every(u=>u.startsWith('http://e.test/')));await p.close()}
   PAGE=EVENT}
  await ctx.close()}
 ok('고객 페이지 소스: 외부 스크립트·추적 코드·innerHTML·eval 0 · noindex · 주소 값은 textContent 로만 · 간편견적 주소는 맨 위 상수',!/<script[^>]+src=|gtag|analytics|innerHTML|insertAdjacentHTML|document\.write|eval\(|new Function/.test(EVENT)&&/<meta name="robots" content="noindex/.test(EVENT)&&/var EST_URL="https:\/\/soo17115-cmyk\.github\.io\/";/.test(EVENT)&&/Content-Security-Policy/.test(EVENT)&&/ⓒ HOME FURNISHING CO\. all rights reserved\./.test(EVENT)&&/blog\.naver\.com\/artico_studio/.test(EVENT));
 {const GS=fs.readFileSync(path.join(ROOT,'intranet/qr-count-script/Code.gs'),'utf8'),SJ=fs.readFileSync(path.join(ROOT,'event/sites.json'),'utf8');
  ok('event/sites.json 기본은 빈 파일 {} (사진·혜택은 대표 승인 뒤 채움)',JSON.stringify(JSON.parse(SJ))==='{}');
  ok('집계 스크립트(Code.gs): 문법 OK · 현장 코드(영문·숫자)·정해진 버튼 종류만 받음 · 날짜는 일까지만 · 이름·전화·IP 를 읽거나 적는 코드 없음 · 시트·파일을 지우는 코드 없음',(()=>{try{new Function(GS)}catch(e){return false}return /\^\[A-Z0-9\]\{1,16\}\$/.test(GS)&&/KINDS\.indexOf\(b\) < 0/.test(GS)&&/'yyyy-MM-dd'/.test(GS)&&/appendRow\(\[day, c, b\]\)/.test(GS)&&!/setTrashed|deleteRow|deleteSheet|clear\(|removeFile|postData|getActiveUser|getEmail|p\.(name|tel|t|n)\b/.test(GS)})());
  ok('고객 페이지 소스: 간편견적 버튼을 누르기 전에 정보를 묻지 않음(첫 화면에 입력 칸 없음) · 집계는 fetch(no-cors · 쿠키 없음)로 현장 코드·버튼만',/id="vHome">(?:(?!id="vConsult")[\s\S])*id="vConsult"/.test(EVENT)&&!/<(input|select|textarea)/.test(EVENT.slice(EVENT.indexOf('id="vHome"'),EVENT.indexOf('id="vConsult"')))&&/COUNT_URL\+"\?c="\+\(coupon\|\|"NONE"\)\+"&b="\+kind/.test(EVENT)&&/credentials:"omit"/.test(EVENT))}
 ok('고객 페이지: 화면 오류·대화상자 0',!errs2.length,errs2.slice(0,3).join(' | '));
 await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
