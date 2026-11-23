// 소개 카드 시험 (v0.99-47, 추가 지시 2026-11-23 소개 보상 카드)
// node intranet/tools/test/referral_card_test.js [index.html]   · REF_SHOTS=폴더 를 주면 앞·뒤 미리 보기와 PDF 를 저장
// 유입 경로 '소개 카드'(목록·자동 고르기·소개 코드 저장) · 서식 자료실 '소개 카드 만들기'(대표만 · 고객 고르기 → 코드 자동 → QR 실제 읽기 → PDF 2쪽 실제 크기) · 상품권 지급 표시(두 번 누름) · 직원 화면에는 없음
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ROOT=path.join(__dirname,'../../..');const HTML=fs.readFileSync(process.argv[2]||path.join(ROOT,'intranet/index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const SHOTS=process.env.REF_SHOTS||'';
function loadJsQR(){const tries=[process.env.JSQR_DIR,'jsqr',path.join(os.tmpdir(),'hf-jsqr/node_modules/jsqr')].filter(Boolean);for(const t of tries){try{return require(t)}catch(e){}}
  try{const d=path.join(os.tmpdir(),'hf-jsqr');fs.mkdirSync(d,{recursive:true});cp.execSync('npm install jsqr --no-audit --no-fund --prefix '+JSON.stringify(d),{stdio:'ignore',timeout:120000});return require(path.join(d,'node_modules/jsqr'))}catch(e){return null}}
const jsQR=loadJsQR();
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["notify","interact","interact"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";const PJ=o=>Object.assign({custName:"홍길동",stage:"상담",mgr:"정진혁",cat:"주거",inq:"2026-11-20",route:"간편견적",updatedAt:T0},o);
const LEADTXT="[아르띠꼬 간편 견적 · 상담 신청]\n[소개 카드] 소개 코드 R-2611-001 · src=referral (실측 무료 대상)\n\n■ 고객\n이름: 김소개";
const SEED={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"},
 "projects/p1":PJ({no:"P-2611-911",title:"소개 접수",stage:"계약",custName:"김소개",lead:{at:T0,name:"김소개",phone:"010-1111-2222",work:"욕실",text:LEADTXT}}),
 "projects/p2":PJ({no:"P-2611-912",title:"보통 접수",custName:"박보통",lead:{at:T0,name:"박보통",work:"도배",text:"도배 견적 부탁드려요. 고객코드 C-2611-001 · 견적 R-26 아님"}}),
 "projects/p3":PJ({no:"P-2611-913",title:"오늘의집",custName:"이오늘",route:"오늘의집",lead:{at:T0,name:"이오늘",work:"주방",text:"소개 카드 받았어요 R-2611-001"}}),
 "customers/c1":{code:"C-2611-901",name:"홍길동",refCode:"R-2611-001",memo:"소개 카드 R-2611-001 드림",mgr:"정진혁",status:"완료",steps:[1],stage:"1-상담영업",updatedAt:T0},
 "customers/c2":{code:"C-2611-902",name:"최준공",mgr:"정진혁",status:"완료",steps:[1],stage:"1-상담영업",updatedAt:T0},
 "customers/c3":{code:"C-2611-903",name:"진행중고객",mgr:"정진혁",status:"진행중",steps:[1],stage:"1-상담영업",updatedAt:T0},
 "config/referral":{list:[{code:"R-2611-001",cust:"c1",ccode:"C-2611-901",at:"2026-11-20",until:"2027-11-19",by:"u_boss"}],at:T0,by:"u_boss"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false}};
const EST='https://soo17115-cmyk.github.io/?src=referral&code=';
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,v||x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:1000},timezoneId:'Asia/Seoul',acceptDownloads:true});
 await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const errs=[];const open=async who=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};window.__printed=0;window.print=()=>{window.__printed++};window.__dl=[];const __ac=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){window.__dl.push(this.download);return __ac.call(this)};`+MOCK);await p.goto('http://hf.test/');return p};
 const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
 ok('QR 읽기 도구(jsQR) 준비',!!jsQR);
 const A=await open('admin');await wait(9000);
 // ── 유입 경로 ──
 {const t=await A.evaluate(()=>{const f=window.__hfT;return {a:f.routeAuto("x src=referral&code=R-2611-001"),b:f.routeAuto("[소개 카드] 소개 코드 R-2611-007"),c:f.routeAuto("고객코드 C-2611-001 P-2611-001"),d:f.routeAuto("매장 QR을 보고"),e:f.routeAuto("소개 코드 r-2611-003"),
   r1:f.refCodeOf("소개 코드 R-2611-001 · src"),r2:f.refCodeOf("XR-2611-001"),r3:f.refCodeOf("R-26110-001"),r4:f.refCodeOf("R-2611-0011")}});
  {const m=HTML.match(/const ROUTES=(\[[^\]]*\])/),rt=m?JSON.parse(m[1]):[];ok('유입 경로 목록(모든 화면 공통 ROUTES)에 ‘소개 카드’ (‘소개’ 바로 뒤) · 프로젝트·고객 칸에 ‘소개 코드’',rt.indexOf('소개 카드')===rt.indexOf('소개')+1&&rt.indexOf('소개')>=0&&(HTML.match(/\["refCode","소개 코드 \(소개 카드로 온 고객만/g)||[]).length===2,JSON.stringify(rt))}
  ok('자동 고르기: src=referral · ‘소개 카드’ · 소개 코드 → 소개 카드 / 고객·프로젝트 코드는 아님 / 매장 QR 그대로',t.a==='소개 카드'&&t.b==='소개 카드'&&t.c===''&&t.d==='매장 QR'&&t.e==='소개 카드',JSON.stringify(t));
  ok('소개 코드 뽑기: R-2611-001 만 · 앞뒤에 글자·숫자가 붙은 것은 아님',t.r1==='R-2611-001'&&t.r2===''&&t.r3===''&&t.r4==='',JSON.stringify(t))}
 {let d=await D();const p1=d['projects/p1'],p2=d['projects/p2'],p3=d['projects/p3'];
  ok('간편견적 접수 글에 ‘[소개 카드] 소개 코드 R-2611-001’ → 유입 경로 ‘소개 카드’ + 소개 코드 칸 저장 + 옛 값 기록',p1&&p1.route==='소개 카드'&&p1.refCode==='R-2611-001'&&p1.routeAuto&&p1.routeAuto.from==='간편견적',JSON.stringify(p1&&{route:p1.route,refCode:p1.refCode,ra:p1.routeAuto}));
  ok('표시 없는 접수는 그대로 (간편견적) · 직원이 고른 ‘오늘의집’은 안 바꿈',p2&&p2.route==='간편견적'&&!p2.refCode&&p3&&p3.route==='오늘의집'&&!p3.refCode,JSON.stringify([p2&&p2.route,p3&&p3.route]))}
 // ── 서식 자료실 ──
 await A.evaluate(()=>{location.hash='#forms'});await wait(1500);
 ok('대표: 서식 자료실에 ‘소개 카드 만들기 (대표만)’',/소개 카드 만들기 \(대표만\)/.test(await A.locator('#rfCard > summary').innerText().catch(()=>'')));
 await A.locator('#rfCard > summary').click();await wait(800);
 {const rows=await A.locator('#rfCard tbody tr').allInnerTexts();
  ok('발급 목록: R-2611-001 · 홍길동 · 이 코드로 온 문의(김소개 프로젝트 · 계약) · 카드 받은 고객 본인(소개 코드 칸에 자기 코드)은 문의로 안 셈 · 계약 건이 있어 지급 표시 버튼',rows.length===1&&/R-2611-001/.test(rows[0])&&/홍길동/.test(rows[0])&&/김소개/.test(rows[0])&&!/고객 홍길동/.test(rows[0])&&/상품권 지급 표시/.test(rows[0]),JSON.stringify(rows))}
 {const opts=await A.locator('#rf_c option').allInnerTexts();ok('고객 고르기: 완료 고객이 먼저',opts.length===4&&/완료/.test(opts[1])&&/완료/.test(opts[2])&&/진행중/.test(opts[3]),JSON.stringify(opts))}
 {const nx=await A.evaluate(()=>window.__hfT.rfNext());ok('다음 코드 = 이번 달 다음 번호 (기록·프로젝트의 001 다음 → R-2611-002)',nx==='R-2611-002',nx)}
 await A.locator('#rfCard [data-rfissue]').click();await wait(700);
 ok('고객을 안 고르면 발급 안 함',((await D())['config/referral'].list||[]).length===1);
 await A.selectOption('#rf_c','c2');await A.locator('#rfCard [data-rfissue]').click();await wait(2500);
 {const d=await D(),l=d['config/referral'].list||[],x=l[1]||{};
  ok('발급 → config/referral 에 R-2611-002 · 고객 c2(C-2611-902) · 발급일 오늘 · 만료일 1년 뒤 하루 전 · 이름·전화는 기록에 없음',l.length===2&&x.code==='R-2611-002'&&x.cust==='c2'&&x.ccode==='C-2611-902'&&/^\d{4}-\d{2}-\d{2}$/.test(x.at)&&x.until===await A.evaluate(a=>window.__hfT.rfUntil(a),x.at)&&!/최준공|010-/.test(JSON.stringify(l)),JSON.stringify(x))}
 ok('만료일 계산: 2026-11-23 → 2027-11-22 · 2028-02-29 → 2029-02-28',await A.evaluate(()=>window.__hfT.rfUntil('2026-11-23')==='2027-11-22'&&window.__hfT.rfUntil('2028-02-29')==='2029-02-28'));
 await wait(1500);
 {const g=await A.evaluate(()=>window.__hfT.rf());
  ok('미리 보기: 방금 발급한 R-2611-002 · QR 주소 = 간편견적 ?src=referral&code=R-2611-002 (고객 정보 없음)',g&&g.code==='R-2611-002'&&g.url===EST+'R-2611-002',JSON.stringify(g&&{code:g.code,url:g.url}));
  ok('앞면 문구: 큰 글씨·작은 글씨(백화점 상품권 30만 원)·대표번호·실측 무료·회사명',g&&['좋은 집, 좋은 분께','소개해 주세요','소개로 계약되면 소개해 주신 분께 백화점 상품권 30만 원을 드립니다','1566-5904','실측 무료','ARTICO STUDIO','아르띠꼬 스튜디오'].every(t=>g.logF.includes(t)),JSON.stringify(g&&g.logF));
  ok('뒷면 문구: 소개 코드·소개해 주신 분(이름·연락처 뒷자리)·계약 완료 후 지급, 1회 계약당 1회·발급일로부터 1년·1분 간편견적 확인하기',g&&['R-2611-002','소개해 주신 분','이름','연락처 뒷자리','계약 완료 후 지급, 1회 계약당 1회','1분 간편견적 확인하기'].every(t=>g.logB.includes(t))&&g.logB.some(t=>/발급일로부터 1년/.test(t)),JSON.stringify(g&&g.logB));
  ok('쪽 크기 108×68mm @400dpi (1701×1071) · 재단 영역 90×50mm',g&&g.w===1701&&g.h===1071&&g.trim[2]===1417&&g.trim[3]===787,JSON.stringify(g&&[g.w,g.h,g.trim]));
  ok('이모지·원가·마진 글 없음',g&&!/[\u{1F300}-\u{1FAFF}☀-➿]|원가|마진/u.test(g.logF.join(' ')+g.logB.join(' ')));
  // QR 실제로 읽기: 뒷면 미리 보기 그림에서 QR 자리를 잘라 읽음 (원래 크기 + 절반 크기)
  const px=await A.evaluate(async()=>{const im=document.getElementById('rfImgB'),g=window.__hfT.rf();if(!im.complete)await new Promise(r=>{im.onload=r});const q=g.qr,t=g.trim,out=[];
    for(const k of [1,.5]){const pad=Math.round(q.cell*4),w=Math.round((q.size+pad*2)*k),c=document.createElement('canvas');c.width=w;c.height=w;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,w);x.drawImage(im,q.x-t[0]-pad,q.y-t[1]-pad,q.size+pad*2,q.size+pad*2,0,0,w,w);out.push({w,px:Array.from(x.getImageData(0,0,w,w).data)})}
    return {out,cell:q.cell,n:q.n}});
  const r1=jsQR&&jsQR(Uint8ClampedArray.from(px.out[0].px),px.out[0].w,px.out[0].w),r2=jsQR&&jsQR(Uint8ClampedArray.from(px.out[1].px),px.out[1].w,px.out[1].w);
  ok('QR 실제로 읽힘 (원래 크기·절반 크기) · 한 칸 0.5mm 이상(400dpi 에서 8픽셀 이상)',r1&&r1.data===EST+'R-2611-002'&&r2&&r2.data===EST+'R-2611-002'&&px.cell>=8,JSON.stringify([r1&&r1.data,r2&&r2.data,px.cell,px.n]))}
 if(SHOTS){for(const [id,nm] of [['rfImgF','앞면'],['rfImgB','뒷면']]){const u=await A.evaluate(i=>document.getElementById(i).src,id);fs.writeFileSync(path.join(SHOTS,'소개 카드 미리 보기 '+nm+'.png'),Buffer.from(u.split(',')[1],'base64'))}}
 {const dl=A.waitForEvent('download',{timeout:10000}).catch(()=>null);await A.locator('#rfCard [data-rfout="pdf"]').click();const f=await dl;await wait(500);const nm=(await A.evaluate(()=>window.__dl)).slice(-1)[0]||'';let pages=0,box='';
  if(f){const buf=fs.readFileSync(await f.path()),s=buf.toString('latin1');pages=(s.match(/\/Type \/Page /g)||[]).length;const m=s.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);box=m?m[1]+'x'+m[2]:'';if(SHOTS)fs.writeFileSync(path.join(SHOTS,nm||'소개 카드.pdf'),buf)}
  ok('인쇄용 PDF = ‘소개 카드 R-2611-002 날짜 인쇄용.pdf’ · 2쪽(앞·뒤) · 쪽 크기 108×68mm(306.14×192.76pt)',/^소개 카드 R-2611-002 \d{4}-\d{2}-\d{2} 인쇄용\.pdf$/.test(nm)&&pages===2&&box==='306.14x192.76',nm+' '+pages+' '+box)}
 {const dl=A.waitForEvent('download',{timeout:10000}).catch(()=>null);await A.locator('#rfCard [data-rfout="png"]').click();await dl;await wait(500);const nm=(await A.evaluate(()=>window.__dl)).slice(-1)[0]||'';
  ok('공유용 PNG = ‘소개 카드 R-2611-002 날짜 공유용.png’',/^소개 카드 R-2611-002 \d{4}-\d{2}-\d{2} 공유용\.png$/.test(nm),nm)}
 // 상품권 지급 표시: 첫 번째 누름은 확인 문구만, 두 번째에 저장
 {const btn=A.locator('#rfCard [data-rfpaid="R-2611-001"]');await btn.click();await wait(600);const t1=await btn.innerText().catch(()=>'');const p0=((await D())['config/referral'].list||[]).find(x=>x.code==='R-2611-001');
  ok('지급 표시: 첫 번째 누름은 ‘한 번 더 누르면…’ 문구만 (저장 안 함)',/한 번 더 누르면/.test(t1)&&p0&&!p0.paid,t1);
  await btn.click();await wait(2000);const p1=((await D())['config/referral'].list||[]).find(x=>x.code==='R-2611-001');
  ok('두 번째 누름 → paid 기록(날짜·누가) · 다른 코드는 그대로',p1&&p1.paid&&p1.paid.by==='u_boss'&&!((await D())['config/referral'].list||[]).find(x=>x.code==='R-2611-002').paid,JSON.stringify(p1))}
 {const rows=await A.locator('#rfCard tbody tr').allInnerTexts(),r2=rows.find(x=>/R-2611-002/.test(x))||'';ok('문의가 없는 코드(R-2611-002)는 지급 표시 버튼 없음',r2&&!/상품권 지급 표시/.test(r2)&&!(await A.locator('#rfCard [data-rfpaid="R-2611-002"]').count()),r2)}
 ok('대표 화면: 권한 밖 쓰기 0 · 화면 오류 0',!(await A.evaluate(()=>window.__mockDenied||[])).filter(x=>!/^(activity|access|knock)/.test(x)).length&&!errs.length,errs.slice(0,3).join(' | '));
 // ── 직원 ──
 {const J=await open('jjh');await wait(8000);await J.evaluate(()=>{location.hash='#forms'});await wait(1500);
  ok('직원(정진혁): 서식 자료실에 소개 카드 만들기 없음',!(await J.locator('#rfCard').count()));
}
 // ── 소스 점검 ──
 {const i=HTML.indexOf('// ===== 소개 카드 만들기'),j=HTML.indexOf('// ===== 프로젝트 통합 화면'),seg=HTML.slice(i,j);
  ok('새 코드에 alert/confirm/prompt/window.open/iframe/외부 QR 서비스·.delete(·innerHTML 에 고객 이름 날것 0건',i>0&&seg.length>3000&&!/\b(alert|confirm|prompt)\s*\(|window\.open|<iframe|chart\.googleapis|qrserver|\.delete\(/.test(seg)&&!/\$\{c\.name\b/.test(seg))}
 ok('전체 화면 오류 0',!errs.length,errs.slice(0,3).join(' | '));
 const f=R.filter(x=>!x).length;console.log('\n결과: 통과 '+(R.length-f)+' / 실패 '+f);await b.close();process.exit(f?1:0)})();
