// 상세 자동견적 2·3번 시험 (v0.99-37, 2026-11-17): node intranet/tools/test/detail_quote_test.js [index.html]
// 2번: 평형→수량 규칙 · 등급별 금액 · 단가 = 견적서_ver1 '단가' 시트(tools/qa/qa_price.json) · 단가 미정 0원 · 간접비(5% + 평당 22,000원) · 부가세 별도/포함 · 덮어쓰기 확인 창 · 기존 저장 방식
// 3번: HF-RO 코드(1,234,500 → HOMEFSS) · 원가 칸 기본 코드 · '숫자로 보기' · 고객용 PDF 글자에 원가·마진·코드·메모 없음 · 권한별 화면(대표·정진혁 담당·이봄이 비담당·채진아) · 공용 칸·미리 보기
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const PRICE=JSON.parse(fs.readFileSync(__dirname+'/../qa/qa_price.json','utf8'));
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const CAT={ver:"시험 단가표",updatedAt:T0,cols:["k","space","proc","name","unit","price","desc"],items:[["t_demo","전체","철거","철거 기본","식",500000,""]]};
// 세부 단가표(detail2026)에는 ver1 행 번호 몇 개만 (가격을 일부러 다르게 넣어도 자동 채우기는 ver1 '단가' 시트 값을 써야 함)
const DET={ver:"단가표 시험 v0",updatedAt:T0,cols:["k","space","proc","name","unit","price","desc","mat","lab","chk"],items:[["U0738","전체","도배공사","벽지_개나리 로하스(실크)","롤",11111,"",0,0,""],["U0067","욕실","철거공사","욕실철거_전체철거","EA",1373890,"",0,1373890,""]]};
const COSTS={"U0738":41150,"U0067":1234500}; // 원가표(대표 전용) · 화면·PDF·공용 칸에 이 숫자가 숫자로 새면 안 됨
const STAFF={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"}};
const PC={lines:[{proc:"철거공사",sale:3000000,est:1234500,act:"",st:"예상",hist:[]}],post:[],by:"u_boss",updatedAt:T0};
const SEED=Object.assign({},STAFF,{"catalog/current":CAT,"catalog/detail2026":DET,"ccost/current":{items:COSTS,updatedAt:T0},
 "config/company":{name:"주식회사 홈퍼니싱",ceo:"최윤수",bizno:"1234567890",addr:"경기도 구리시",tel:"031-000-0000",fax:"031-000-0001",biztype:"건설",bizitem:"실내건축",brand:"아르띠꼬 스튜디오",email:"test@test"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",py:32,status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",createdAt:T0,updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 아파트",custName:"홍길동",custCode:"C-2611-901",stage:"계약",mgr:"정진혁",cat:"주거",py:32,inq:"2026-11-01",work:"전체 리모델링",updatedAt:T0},
 "ppriv/p1":{pc:PC,updatedAt:T0},"acct/u_jjh/pcost/p1":PC,"acct/u_cja/pcost/p1":PC,
 "quotes/q1":{qno:"P-2611-901-1차",ver:"1차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"본견적 진행",d:"2026-11-03",amount:"",items:[],memo:"내부메모-비밀-원가조정",createdAt:T0,updatedAt:T0},
 "quotes/q2":{qno:"P-2611-901-2차",ver:"2차",pno:"P-2611-901",code:"C-2611-901",name:"홍길동",staff:"정진혁",status:"본견적 진행",d:"2026-11-04",amount:110000,items:[{space:"거실",name:"손으로 넣은 아트월",q:1,unit:"식",price:100000,edited:true},{k:"U0738",space:"전체",name:"손으로 넣은 실크 벽지",q:3,unit:"롤",price:70000,edited:true}],memo:"",createdAt:"2026-11-04T00:00:00Z",updatedAt:T0}});
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const HF=n=>String(n).replace(/\d/g,c=>"SHOMEFURNI"[+c]);
const COSTNUM=[["1,234,500",HF(1234500)]]; // 원가 숫자와 그 코드
(async()=>{const b=await chromium.launch();const errs=[];
 const ctx=await b.newContext({viewport:{width:1280,height:900},timezoneId:'Asia/Seoul',acceptDownloads:true});await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
 const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
 const open=async(who,ms,o)=>{const p=await (o||ctx).newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>d.dismiss());await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);return p};
 const D=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')||'{}'));
 const okask=async(p,yes)=>{for(let i=0;i<20&&!(await p.locator('.okask').count());i++)await wait(150);const t=(await p.locator('.okask').count())?(await p.locator('.okask').last().innerText()).replace(/\s+/g,' '):'';if(t)await p.locator('.okask [data-ok="'+(yes?1:0)+'"]').last().click();await wait(500);return t};
 const openQ=async(p,id,tab)=>{await p.evaluate(()=>{location.hash='#quotes'});await wait(400);await p.evaluate(([i,t])=>{window.__hfT.open('quotes',i)},[id,tab]);await wait(1200);await p.locator('#veil [data-qtab="'+(tab||'detail')+'"]').first().click();await wait(700)};
 const qe=p=>p.evaluate(()=>(window.__hfT.qaSheet()||{}).qe||[]);
 const A=await open('admin',12000);
 // ── 1. HF-RO 코드 ──
 const H=await A.evaluate(()=>[window.__hfT.hfro(1234500),window.__hfT.hfro(1234567890),window.__hfT.hfro(0),window.__hfT.hfro(-1500),window.__hfT.hfro("2,000,000원")]);
 ok('HF-RO: 1,234,500 → HOMEFSS · 1234567890 → HOMEFURNIS · 0 → S · 음수 · 글자 섞인 금액',H.join('|')==='HOMEFSS|HOMEFURNIS|S|-HFSS|OSSSSSS',H.join('|'));
 // ── 2. 단가 = 견적서_ver1 '단가' 시트 ──
 const QP=await A.evaluate(()=>window.__hfT.qaP());const pk=Object.keys(PRICE);
 ok('앱 안 단가표 = ver1 단가 시트에서 뽑은 값 (줄 수·이름·단위·단가 모두 같음)',pk.length===Object.keys(QP).length&&pk.every(k=>JSON.stringify(PRICE[k])===JSON.stringify(QP[k])),pk.length+'줄');
 ok('대표 단가 확인: 욕실 전체철거 1,373,890 · 실크 65,900 · 천장몰딩(금액+노무) 23,840 · 도어셋트 690,595 · 강마루 153,010',QP.U0067[2]===1373890&&QP.U0738[2]===65900&&QP.U0222[2]===23840&&QP.U0241[2]===690595&&QP.U0758[2]===153010);
 // ── 3. 수량 규칙·등급 ──
 const B=await A.evaluate(()=>{const T=window.__hfT,base=Object.assign(T.qaInit({}),{py:32,bath:2,balc:3});const run=(g,o)=>T.qaBuild(Object.assign({},base,{g},o||{}));const m=L=>Object.fromEntries(L.map(l=>[l.k,l]));
   const sum=L=>L.reduce((t,l)=>t+Math.round(l.price*l.q),0);return {mid:m(run("중급")),lo:m(run("기본")),hi:m(run("고급")),s:[sum(run("기본")),sum(run("중급")),sum(run("고급"))],py40:m(run("중급",{py:40})),py24:m(run("중급",{py:24,bath:1})),win:m(run("중급",{win:"전체",exL:true,exR:1})),mix:m(Object.assign([],run("중급",{pg:{wp:"고급",fl:"기본"}})))}});
 const M=B.mid;
 ok('32평 중급 수량: 벽지 18롤(평×0.55) · 강마루 30.1평(평×0.94) · 걸레받이·천장몰딩·몰딩철거 32평(평×1) · 마루 철거 28.8평(평×0.9)',M.U0738.q===18&&M.U0758.q===30.1&&M.U0234.q===32&&M.U0222.q===32&&M.U0053.q===32&&M.U0054.q===32&&M.U0027.q===28.8,[M.U0738.q,M.U0758.q,M.U0234.q,M.U0027.q].join(','));
 ok('32평 중급: 방문 6개 도어셋트 + 문틀까지 철거 6 · 욕실 2칸 전체 철거 · 공용·부부욕실 철거면 타일 · 도기 세트 ×2 · 다운라이트 18 · 공사 마감 35평 이하',M.U0241.q===6&&M.U0045.q===6&&M.U0067.q===2&&M.U0415.q===1&&M.U0419.q===1&&M.U0430.q===2&&M.U0716.q===4&&M.U0849.q===18&&!!M.U0120&&!M.U0121);
 ok('발코니 3실: 탄성코트 3실 단가(275,003) × 3 · 발코니 타일 거실·안방·주방 1실씩',M.U0382.q===3&&M.U0382.price===275003&&M.U0399.q===1&&M.U0404.q===1&&M.U0409.q===1);
 ok('단가표에 없는 항목 = 0원 + 단가 미정 표시 (폐기물·입주청소·도배 인원·퍼티·조명 노무)',['qa_np_waste','qa_np_clean','qa_np_wp_lab','qa_np_wp_putty','qa_np_lt_lab'].every(k=>M[k]&&M[k].price===0&&M[k].np===1)&&M.qa_np_waste.q===32&&M.qa_np_clean.q===32);
 ok('등급: 기본 = 장판 2.2T·덧방 철거·필름 리폼 6·실크 일반 / 고급 = 고급 마루·고급 실크·라인문틀·도막방수·세라믹',!!B.lo.U0749&&!!B.lo.U0069&&B.lo.U0338.q===6&&!!B.lo.U0738&&!B.lo.U0241&&!!B.hi.U0760&&!!B.hi.U0741&&!!B.hi.U0242&&!!B.hi.U0076&&!!B.hi.U0385);
 ok('도배: 기본 = 중급 같은 제품 (실크 일반 65,900) · 필름: 세 등급 모두 한샘 필름 1.5롤',B.lo.U0738.price===B.mid.U0738.price&&!B.mid.U0741&&[B.lo,B.mid,B.hi].every(x=>x.U0318&&x.U0318.q===1.5&&!x.U0316));
 ok('등급별 직접공사비: 기본 < 중급 < 고급',B.s[0]<B.s[1]&&B.s[1]<B.s[2],B.s.join(' < '));
 ok('평형 구간: 40평 = 공사 마감 45평 이하 · 방등 4 / 24평 = 욕실 1칸 · 방문 4 · 필름 리폼 없음(중급)',!!B.py40.U0121&&B.py40.U0790.q===4&&B.py24.U0430.q===1&&!B.py24.U0419&&B.py24.U0241.q===4);
 ok('창호: 등급 대신 전체 → 창 본체 단가 미정 + 사다리차·사춤 · 확장 거실+방1 → 확장 설비 + 분합창 철거 2 + 행위허가 단가 미정',B.win.qa_np_win&&B.win.qa_np_win.price===0&&!!B.win.U0131&&!!B.win.U0141&&!!B.win.U0151&&B.win.U0155.q===1&&B.win.U0135.q===2&&!!B.win.qa_np_permit&&!B.mid.qa_np_win);
 ok('공정별 등급 따로: 도배만 고급 · 바닥만 기본',!!B.mix.U0741&&!!B.mix.U0749&&!B.mix.U0758);
 // ── 4. 화면: 자동 채우기 → 고치기 → 저장 (대표) ──
 await openQ(A,'q1');ok('상세 견적(공종별) 위에 자동 채우기 칸 (평형 32 · 욕실 2칸 기본값)',(await A.locator('#qaBox').count())===1&&(await A.locator('#qaBox [data-qa="py"]').inputValue())==='32'&&(await A.locator('#qaBox [data-qa="bath"]').inputValue())==='2');
 await A.locator('#qaBox [data-qag="고급"]').click();await wait(700);const pv=(await A.locator('#qaPrev').innerText()).replace(/\s+/g,' ');
 ok('미리 보기 합계: 부가세 별도 · 포함 둘 다',/부가세 별도/.test(pv)&&/부가세 포함/.test(pv),pv);
 await A.locator('#qaBox [data-qag="중급"]').click();await wait(700);await A.locator('#qaBox [data-qafill]').click();await wait(1200);
 let E=await qe(A);const dir=E.filter(l=>!l.ind).reduce((t,l)=>t+Math.round(l.price*l.q),0),i5=E.find(l=>l.ind==='p5'),mg=E.find(l=>l.ind==='mg');
 ok('빈 견적은 확인 창 없이 채움 · 간접비: 공사진행비 = 직접공사비 5% · 기본시공관리비 = 32평 × 22,000원',(await A.locator('.okask').count())===0&&E.length>60&&i5&&i5.price===Math.round(dir*0.05)&&mg&&mg.q===32&&mg.price===22000,E.length+'줄 직접 '+dir+' 5% '+(i5&&i5.price));
 ok('채운 단가 = ver1 단가 시트 (세부 단가표에 다른 값이 있어도: 실크 65,900)',E.find(l=>l.k==='U0738').price===65900);
 const st=await A.locator('#qStep').getAttribute('data-step');ok('견적 단계 ② 단가 미정 (0원 줄 있음)',st==='1',st);
 const resT=(await A.locator('#qaRes').innerText()).replace(/\s+/g,' ');ok('자동 표: 단가 미정 표시 · 합계 (부가세 별도) · 합계 (부가세 포함)',/단가 미정/.test(resT)&&/합계 \(부가세 별도\)/.test(resT)&&/합계 \(부가세 포함\)/.test(resT));
 const ix=E.findIndex(l=>l.k==='U0738');await A.locator('#qaRes [data-qaq="'+ix+'"]').fill('20');await A.locator('#qaRes [data-qaq="'+ix+'"]').dispatchEvent('change');await wait(800);
 E=await qe(A);const dir2=E.filter(l=>!l.ind).reduce((t,l)=>t+Math.round(l.price*l.q),0);
 ok('사람이 고침: 벽지 18 → 20롤 · 공사진행비 5% 다시 계산',E[ix].q===20&&E.find(l=>l.ind==='p5').price===Math.round(dir2*0.05)&&dir2===dir+2*65900,dir2-dir);
 const net=E.reduce((t,l)=>t+Math.round(l.price*l.q),0);
 await A.locator('#veil .qtb[data-qt="detail"] [data-qesave]').first().click();await wait(1800);let d=await D();const q1=d['quotes/q1'];
 const KEYS=new Set(['k','proc','space','name','unit','q','price','qa','np','ind','indMan','qaEd','edited','amt']);
 ok('저장 = 기존 견적 저장 그대로 (q1 품목·합계 = 공급가 × 1.1)',q1&&q1.items.length===E.length&&q1.amount===Math.round(net*1.1),q1&&q1.amount+' / '+Math.round(net*1.1));
 ok('저장된 품목에 원가·마진 칸 없음 (품목·수량·단위·단가만)',q1.items.every(l=>Object.keys(l).every(k=>KEYS.has(k))),[...new Set(q1.items.flatMap(l=>Object.keys(l)))].join(','));
 ok('새 저장 칸 없음 (quotes 문서 하나만 바뀜 · 자동 채우기 입력값은 저장 안 함)',!('qa' in q1)&&!Object.keys(d).some(k=>/qa|autoq/i.test(k.split('/')[0])));
 // ── 5. 덮어쓰기 확인 창 (손으로 넣은 줄이 있는 견적) ──
 await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);await openQ(A,'q2');await A.locator('#qaBox [data-qafill]').click();
 let t=await okask(A,false);E=await qe(A);
 ok('손으로 넣은 줄이 있으면 확인 창: 그대로 둘 줄 1개 · 같은 품목(실크) 1개는 자동 값으로 바뀜 · 새 합계 부가세 별도/포함',/손으로 넣은 줄 1개는 그대로/.test(t)&&/같은 품목 1개/.test(t)&&/부가세 별도/.test(t)&&/부가세 포함/.test(t),t);
 ok('취소 → 줄 그대로 (2줄)',E.length===2&&E[1].price===70000);
 await A.locator('#qaBox [data-qafill]').click();t=await okask(A,true);E=await qe(A);
 ok('확인 → 손으로 넣은 아트월은 남고 자동 줄이 들어옴 (실크는 자동 값 65,900)',E.some(l=>l.name==='손으로 넣은 아트월')&&E.filter(l=>l.k==='U0738').length===1&&E.find(l=>l.k==='U0738').price===65900&&E.length>60);
 await A.locator('#qaBox [data-qafill]').click();t=await okask(A,false);ok('다시 채울 때도 확인 (이전 자동 줄 바꿈 안내)',/이전에 자동으로 채운 줄/.test(t),t);
 await A.locator('#veil .qtb[data-qt="detail"] [data-qecancel]').first().click();await wait(600);ok('되돌리기 → 저장된 2줄',(await qe(A)).length===2);
 // ── 6. 원가 칸 HF-RO (대표 견적 원가 탭) ──
 await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);await openQ(A,'q1','cost');let ct=await A.locator('#veil .qtb[data-qt="cost"]').innerText();
 const c738=41150*20;ok('견적 원가 탭: 원가 금액이 기본 HF-RO 코드 (숫자 없음)',ct.includes(HF(c738))&&!ct.includes(c738.toLocaleString('ko-KR')),HF(c738));
 await A.locator('#veil .qtb[data-qt="cost"] [data-costplain]').first().click();await wait(700);ct=await A.locator('#veil .qtb[data-qt="cost"]').innerText();
 ok('‘숫자로 보기’ → 숫자 · 다시 누르면 코드',ct.includes(c738.toLocaleString('ko-KR'))&&/코드로 감추기/.test(ct));
 // ── 7. 고객용 PDF ──
 await A.locator('#veil [data-qtab="print"]').first().click();await wait(600);const dl=A.waitForEvent('download',{timeout:15000}).catch(()=>null);await A.locator('#veil .qtb[data-qt="print"] [data-qapdf]').first().click();await wait(500);if(await A.locator('.okask').count())await okask(A,true);
 const dn=await dl;const fname=dn?dn.suggestedFilename():'';await wait(800);const LOG=(await A.evaluate(()=>window.__qaPdfLog||[])).join('\n');
 ok('PDF 파일 이름 = 견적서 현장명 날짜 vN',fname==='견적서 시험 현장 아파트 2026-11-03 v1.pdf',fname);
 ok('PDF: 갑지(공종별 집계) + 공종별 내역 + 부가세 별도 합계 + 부가세 포함 합계',/공종별 집계 \(갑지\)/.test(LOG)&&/공종별 내역/.test(LOG)&&/합계 \(부가세 별도\)/.test(LOG)&&/합계 \(부가세 포함\)/.test(LOG)&&LOG.includes(Math.round(net*1.1).toLocaleString('ko-KR')),LOG.length);
 const bad=['원가','마진','HF-RO','내부메모','비밀',HF(c738),HF(1234500),c738.toLocaleString('ko-KR'),'1,234,500','41,150'].filter(s=>LOG.includes(s));
 ok('PDF 글자에 원가·마진·HF-RO 코드·내부 메모 없음',!bad.length,bad.join(','));
 ok('PDF: 단가 미정 품목은 ‘별도 협의’',/별도 협의/.test(LOG));
 // ── 8. 프로젝트 원가 관리 표: 코드 · 숫자로 보기 · 권한별 ──
 const openPc=async(p,id)=>{await p.evaluate(()=>{location.hash='#projects'});await wait(400);await p.evaluate(i=>window.__hfT.open('projects',i),id);await wait(1000);if(!(await p.locator('#veil [data-pctop]').count()))return false;await p.locator('#veil [data-pctop]').first().click();await wait(1500);await p.locator('#veil [data-pctab="est"]').click();await wait(700);return true};
 await A.evaluate(()=>window.__hfT.closeSheet());await wait(300);
 for(const who of ['admin','jjh','cja']){const P=who==='admin'?A:await open(who);const tag=USERS[who].name+': ';
  const o=await openPc(P,'p1');let tx=o?await P.locator('#veil .pcbox').innerText():'';
  const sec=o?await P.evaluate(()=>{const i=document.querySelector('#veil .pcbox input[data-pcv^="est|"]');return i?getComputedStyle(i).webkitTextSecurity||'':'none'}):'';
  ok(tag+'원가 관리 표: 실행 원가 1,234,500 → HOMEFSS 코드 (숫자 없음, 입력 칸도 가림)',o&&tx.includes('HOMEFSS')&&!tx.includes('1,234,500')&&(sec==='disc'||sec==='none'),sec);
  await P.locator('#veil [data-costplain]').first().click();await wait(900);tx=await P.locator('#veil .pcbox').innerText();
  ok(tag+'‘숫자로 보기’ → 1,234,500',tx.includes('1,234,500'));
  await P.evaluate(()=>window.__hfT.closeSheet());await wait(300);
  if(who==='jjh'){await openQ(P,'q1');ok(tag+'견적 화면에 대표 원가 탭 없음 · 자동 채우기 칸 있음',(await P.locator('#veil [data-qtab="cost"]').count())===0&&(await P.locator('#qaBox').count())===1);
   await P.locator('#qaBox [data-qafill]').click();await okask(P,false);await P.evaluate(()=>window.__hfT.closeSheet());await wait(300)}
  if(who!=='admin'){ok(tag+'대표 전용 칸 쓰기 거절 0',(await P.evaluate(()=>window.__mockDenied.length))===0,await P.evaluate(()=>window.__mockDenied.join(',')));await P.close()}}
 {const P=await open('bom');await P.evaluate(()=>{location.hash='#projects'});await wait(400);await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);const tx=await P.evaluate(()=>(document.querySelector('#veil')||{}).innerText||'');
  ok('이봄이(담당 아님): 원가 관리 버튼·표·원가 숫자·코드 없음 (권한 그대로)',(await P.locator('#veil [data-pctop]').count())===0&&(await P.locator('.pcbox').count())===0&&!tx.includes('1,234,500')&&!tx.includes('HOMEFSS'));await P.close()}
 // ── 9. 공용 칸·직원 사본에 원가 없음 ──
 // (acct/*/ccost = 기존 품목 원가표 사본 · 인사카드 costOk 설정으로 직원에게 가는 기존 방식이라 이 시험에서 제외)
 d=await D();const leak=Object.keys(d).filter(k=>!/^(ppriv\/|ccost\/|acct\/u_(jjh|cja)\/pcost\/|acct\/u_\w+\/ccost\/|knock\/|activity\/)/.test(k)).filter(k=>{const s=JSON.stringify(d[k]);return s.includes('1234500')||s.includes('HOMEFSS')||s.includes(String(c738))||/"(est|cost|mcost)":/.test(s)});
 ok('공용 칸(work)·견적·프로젝트 문서에 원가 숫자·코드 없음',!leak.length,leak.join(','));
 // ── 10. 대표 '직원 화면 미리 보기' (정진혁) ──
 {await A.evaluate(()=>{location.hash='#preview'});await wait(1200);const g=A.locator('[data-pvgo]').filter({hasText:''});const ids=await A.locator('[data-pvgo]').evaluateAll(els=>els.map(e=>[e.dataset.pvgo,(e.closest('.item')||e).innerText]));const id=(ids.find(x=>/정진혁/.test(x[1]))||[])[0];
  if(id){const w0=(await D());await A.locator('[data-pvgo="'+id+'"]').click();await wait(2500);await openQ(A,'q1');const tx=await A.evaluate(()=>(document.querySelector('#veil')||{}).innerText||'');
   ok('미리 보기(정진혁): 견적 화면에 대표 원가 탭·원가 숫자 없음',(await A.locator('#veil [data-qtab="cost"]').count())===0&&!tx.includes(c738.toLocaleString('ko-KR'))&&!tx.includes('1,234,500'));
   if(await A.locator('#qaBox [data-qafill]').count()){await A.locator('#qaBox [data-qafill]').click();await okask(A,false)}await wait(1500);const w1=await D();
   ok('미리 보기: 견적 저장소에 쓰기 0',JSON.stringify(w0['quotes/q1'])===JSON.stringify(w1['quotes/q1'])&&Object.keys(w1).filter(k=>/^quotes\//.test(k)).length===Object.keys(w0).filter(k=>/^quotes\//.test(k)).length)}
  else ok('미리 보기 진입 버튼 찾기',false,JSON.stringify(ids).slice(0,200))}
 await A.close();
 // ── 11. 휴대폰 폭 ──
 {const c2=await b.newContext(Object.assign({},devices['Pixel 7'],{timezoneId:'Asia/Seoul'}));await c2.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:HTML}));await c2.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const s2=await c2.newPage();await s2.goto('http://hf.test/seed');await s2.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const P=await open('jjh',8000,c2);await openQ(P,'q1');const w=await P.evaluate(()=>{const s=document.querySelector('.sheet');return document.documentElement.scrollWidth<=window.innerWidth+2&&!!s&&s.scrollWidth<=s.clientWidth+2});
  ok('휴대폰(Pixel 7): 자동 채우기 칸 가로 넘침 없음',(await P.locator('#qaBox').count())===1&&w);await c2.close()}
 ok('화면 오류 0',!errs.length,errs.slice(0,3).join(' | '));
 await b.close();const nb=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-nb)+' / 실패 '+nb);process.exit(nb?1:0)})();
