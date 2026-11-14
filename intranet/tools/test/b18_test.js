// 18번 A안 시험 (v0.99-32, 2026-11-14): 간편견적 Gemini(인트라넷 시안) — node intranet/tools/test/b18_test.js [index.html]
// 대표·채진아·정진혁·이봄이 × PC·Pixel 7: 설정은 대표만 · 토큰은 직원 화면·메모리·읽을 수 있는 칸에 없음 · 직원은 그날 입장권만
// 사진 고르기·새로 올리기 → ① 준비(드라이브 올림·프롬프트·입장권) → ② 새 탭 주소(입장권·사진 ID·요청 ID, 토큰 없음) → 가짜 드라이브로 ③ 결과 불러오기
// 미리 보기·연습 모드 막음 · 퇴사자 입장권 비움 · 토큰 바꾸면 옛 값은 대표 칸에 남고 입장권 다시 · Imagen 방식은 그대로
// Apps Script 쪽 함수 시험은 b18_gs_test.js
const {chromium,devices}=require('playwright');const fs=require('fs'),crypto=require('crypto');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-01T00:00:00Z";
const STAFF={"staff/st-chae":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장",finOk:"허락"},"staff/st-choi":{name:"최윤수",uid:"u_boss",state:"재직",pos:"대표이사"},"staff/st-jung":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st-lee":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},
 "staff/st-old":{name:"퇴사자",uid:"u_old",level:"실무 팀",state:"퇴사",pos:"사원"},
 "members/u_jjh":{active:true,staffId:"st-jung",name:"정진혁"},"members/u_bom":{active:true,staffId:"st-lee",name:"이봄이"},"members/u_cja":{active:true,staffId:"st-chae",name:"채진아"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const WHO=['admin','cja','jjh','bom'];const VPS=[['PC',{viewport:{width:1280,height:900}}],['Pixel 7',devices['Pixel 7']]];
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,320))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
const TOK="SECRET-"+"q7Zp".repeat(12),TOK2="NEWSECRET-"+"m3Xk".repeat(12);const GURL="https://script.google.com/macros/s/AKfyTESTDEPLOY123/exec";
const sday=()=>new Date(Date.now()+9*36e5).toISOString().slice(0,10);
const tk=(uid,tok,d)=>crypto.createHmac('sha256',tok).update('isian|'+uid+'|'+(d||sday()),'utf8').digest('hex').slice(0,32);
const STUB=`window.confirm=()=>false;`;
// 가짜 드라이브: 폴더·파일 만들기, 시안 찾기(search_files) · 내려받기(download_file_content) · 부른 것은 __mcpLog
const PNG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const MCPW=`window.__mcpLog=[];window.__MOCKMCP={callTool:async(sv,tool,inp)=>{window.__mcpLog.push(tool+'|'+String(inp.title||inp.query||inp.fileId||'').slice(0,80)+'|'+String(inp.parentId||''));
 if(tool==='search_files'){const m=/'시안 (P-[0-9-]+) '/.exec(inp.query||'');return {content:[{type:'text',text:JSON.stringify({files:m&&m[1]==='P-2611-901'?[{id:'DRV_OUT1',title:'시안 P-2611-901 '+(window.__DAY||'2026-11-14')+' v0.png',mimeType:'image/png',createdTime:new Date().toISOString(),description:JSON.stringify({engine:'gemini',space:'주방',style:'북유럽',by:'정진혁',usd:0.039})}]:[]})}]}}
 if(tool==='download_file_content')return {content:[{type:'text',text:JSON.stringify({content:'${PNG}'})}]};
 const id='D_'+Math.random().toString(36).slice(2,8);return {content:[{type:'text',text:JSON.stringify({id,title:inp.title})}]}}};`;
const MONEY=/12,345,678|원가|마진|성과금/;
(async()=>{const b=await chromium.launch();const __tz=b.newContext.bind(b);b.newContext=o=>__tz(Object.assign({timezoneId:'Asia/Seoul'},o||{}));const errs=[],dialogs=[];
 const mk=async(opt,seedObj,init)=>{const ctx=await b.newContext(opt);await ctx.route('http://hf.test/**',r=>{const u=r.request().url();if(u.includes('/_blob/'))return r.fulfill({contentType:'image/png',body:Buffer.from(PNG,'base64')});return r.fulfill({contentType:'text/html',body:u.includes('seed')?'<html></html>':HTML})});
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|script\.google\.com/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[seedObj,RULES]);
  const open=async(who,ms,extra)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});p.on('popup',pp=>pp.close().catch(()=>{}));await p.addInitScript(`window.__SUBPOLL=2500;window.__DAY=${JSON.stringify(sday())};window.__MOCKUSER=${JSON.stringify(USERS[who])};`+init+(extra||'')+MOCK);await p.goto('http://hf.test/');await wait(ms||7000);for(let i=0;i<40&&!(await p.evaluate(()=>!!window.__hfT));i++)await wait(500);return p};
  const dbv=()=>seed.evaluate(()=>JSON.parse(localStorage.getItem('mockdb')));
  return {ctx,open,seed,dbv}};
 const go=async(p,h)=>{await p.evaluate(x=>{location.hash=x},h);await wait(700)};
 const openS=async(p,col,id)=>{await go(p,'#'+col);await p.evaluate(([c,i])=>window.__hfT.open(c,i),[col,id||null]);await wait(1000)};
 const close=async p=>{await p.evaluate(()=>window.__hfT.closeSheet());await wait(300)};
 const tab=async(p,k)=>{const t=p.locator('#veil .pttabs [data-pttab="'+k+'"]');if(await t.count()){await t.first().evaluate(el=>el.click());await wait(400)}};
 const gemOpen=async p=>{await tab(p,'prog');await p.evaluate(()=>{const d=document.querySelector('[data-gembox]');if(d&&!d.open){d.open=true;d.dispatchEvent(new Event('toggle'))}});await wait(300)};
 const leak=(p)=>p.evaluate(([a,b2])=>{const has=s=>typeof s==='string'&&(s.includes(a)||s.includes(b2));let st='';try{st=JSON.stringify(window.__hfT.S())}catch(e){st='ERR'}
   let mem='';try{mem=String(window.__hfT.gemTok())}catch(e){mem='ERR'}return {dom:has(document.documentElement.outerHTML),S:has(st),mem:has(mem)}},[TOK,TOK2]);
 const SEED=Object.assign({},STAFF,{
  "config/imgapi":{engine:"gemini",gurl:GURL,url:"",krw:1450,at:T0},
  "acct/_img/k/c":{token:TOK,at:T0,by:"u_boss"},
  "acct/u_old/img/t":{tk:{"2026-11-13":"oldticket"},at:T0},
  "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"정진혁",status:"진행중",steps:[1,2],inq:"2026-11-01",createdAt:T0,updatedAt:T0},
  "projects/p1":{no:"P-2611-901",title:"사진 현장 101동",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"정진혁",contractAmt:12345678,cat:"주거",inq:"2026-11-01",start:"2026-11-02",endPlan:"2026-11-20",files:[],
    photos:[{id:"ph1",fid:"as_ph1",name:"현장 거실.jpg",type:"image/jpeg",size:2000,d:"2026-11-03",at:"2026-11-03T01:00:00Z",by:"u_jjh",byName:"정진혁",from:"현장 관리"},{id:"ph2",fid:"as_ph2",name:"평면도.png",type:"image/png",size:2000,d:"2026-11-04",at:"2026-11-04T01:00:00Z",by:"u_jjh",byName:"정진혁",from:"프로젝트"}],
    phAct:[{id:"pa1",ph:"ph1",act:"drive",drive:{id:"DRV_PH1",folder:"FOLD1",url:"https://drive.google.com/file/d/DRV_PH1/view"},at:"2026-11-03T01:00:00Z",by:"u_jjh"}],updatedAt:T0},
  "config/attdrv":{root:"1P0Rh3vBB1ApsUcpVXZsDrzr1mdVUWOor",pf:{"P-2611-901":"FOLD1"},at:T0}});
 for(const [vn,opt] of VPS){
  const {ctx,open,dbv}=await mk(opt,SEED,STUB+MCPW);const A=await open('admin',12000);
  // 대표 화면이 열리면 직원 입장권 7일치 (4초 뒤)
  let d;for(let i=0;i<20;i++){d=await dbv();if(d['acct/u_jjh/img/t'])break;await wait(700)}
  const T=k=>(d[k]||{}).tk||{};
  ok(vn+' 대표 화면이 열리면 직원(채진아·정진혁·이봄이)마다 오늘부터 7일치 입장권 · 계산이 서버(HMAC)와 같음',['u_cja','u_jjh','u_bom'].every(u=>Object.keys(T('acct/'+u+'/img/t')).length===7&&T('acct/'+u+'/img/t')[sday()]===tk(u,TOK)),JSON.stringify(T('acct/u_jjh/img/t')).slice(0,120));
  ok(vn+' 입장권 칸·공용 설정에 토큰 값 없음',!JSON.stringify([d['acct/u_cja/img/t'],d['acct/u_jjh/img/t'],d['acct/u_bom/img/t'],d['config/imgapi']]).includes(TOK));
  ok(vn+' 퇴사자 입장권은 비움 (지우지 않고 빈 값)',d['acct/u_old/img/t']&&Object.keys(T('acct/u_old/img/t')).length===0,JSON.stringify(d['acct/u_old/img/t']));
  ok(vn+' 대표 자신 입장권은 칸에 안 씀(화면에서 바로 계산)',!d['acct/u_boss/img/t']);
  // 대표 설정 화면
  await go(A,'#imagegen');
  const cf=await A.evaluate(()=>{const e=document.getElementById('rdEng'),u=document.getElementById('rdGUrl'),t=document.getElementById('rdGTok');return e&&{eng:e.value,url:u.value,tt:t.type,tv:t.value,ph:t.placeholder}});
  ok(vn+' 대표: 이미지 생성 설정에 방식(간편견적 Gemini)·주소·토큰 칸 (토큰은 비밀번호 칸 · 값은 화면에 안 넣고 ‘저장됨’)',cf&&cf.eng==='gemini'&&cf.url===GURL&&cf.tt==='password'&&cf.tv===''&&/저장됨/.test(cf.ph),JSON.stringify(cf));
  ok(vn+' 대표 화면 글(HTML)에 토큰 값 없음',!(await leak(A)).dom);
  for(const who of WHO){const P=who==='admin'?A:await open(who,9000);const tag=vn+' '+USERS[who].name+': ';
   if(who!=='admin'){await go(P,'#imagegen');ok(tag+'이미지 생성 메뉴에 대표 설정 없음',(await P.locator('#rdEng,#rdGUrl,#rdGTok').count())===0);
     const den=await P.evaluate(async()=>{const db=await window.claude.use('db');try{await db.doc('acct/_img/k/c').get();return 'read'}catch(e){return 'denied'}});ok(tag+'대표 토큰 칸은 읽기 막힘',den==='denied',den)}
   await openS(P,'projects','p1');await gemOpen(P);
   const box=await P.evaluate(()=>{const b=document.querySelector('[data-gembox]');return b?{picks:b.querySelectorAll('[data-gempick]').length,up:!!b.querySelector('input[type=file][data-gemup]'),prep:!!b.querySelector('[data-rdgo="gprep"]'),old:!!document.querySelector('[data-rdgo="prompt"]'),t:b.innerText}:null});
   ok(tag+'프로젝트 진행 상황에 ‘간편견적 Gemini’ 시안 칸 · 현장 사진 2장 고르기 · 새로 올리기 · ① 준비 (옛 Imagen 버튼 대신)',box&&box.picks===2&&box.up&&box.prep&&!box.old&&/간편견적 Gemini/.test(box.t),JSON.stringify(box&&Object.assign({},box,{t:box.t.slice(0,80)})));
   ok(tag+'시안 칸에 돈 정보 없음',box&&!MONEY.test(box.t));
   // 사진 고르기: 드라이브에 있는 사진(ph1) + 없는 사진(ph2, 이름에 평면 → 도면)
   await P.locator('[data-gempick="as_ph1"]').click();await wait(300);await P.locator('[data-gempick="as_ph2"]').click();await wait(300);
   const kinds=await P.evaluate(()=>[...document.querySelectorAll('[data-gemkind]')].map(x=>x.innerText.trim()));
   ok(tag+'고른 사진 2장 · 이름으로 도면/현장 사진 자동',kinds.join()==='도면,현장 사진',kinds.join());
   await P.evaluate(()=>{document.querySelector('[data-gembox] [data-rd="extra"]').value='';});
   await P.locator('[data-rdgo="gprep"]').click();let href='';for(let i=0;i<20;i++){await wait(500);href=await P.evaluate(()=>{const a=document.querySelector('[data-gembox] [data-rdopen]');return a?a.href:''});if(href)break}
   const q=href?Object.fromEntries(new URL(href).searchParams):{};const ml=await P.evaluate(()=>window.__mcpLog.slice());
   ok(tag+'① 준비 → 드라이브에 없는 사진(ph2)만 현장 폴더(FOLD1)에 올림',ml.filter(x=>/^create_file\|.*평면도/.test(x)&&/\|FOLD1$/.test(x)).length===1&&!ml.some(x=>/^create_file\|.*현장 거실/.test(x)),JSON.stringify(ml));
   ok(tag+'② 새 탭 주소 = 간편견적 주소 · a=isian · 오늘 입장권(그 사람 것) · 사진 드라이브 ID 2개·종류 · 프로젝트·폴더·요청 ID',href.startsWith(GURL+'?')&&q.a==='isian'&&q.u===USERS[who].id&&q.d===sday()&&q.k===tk(USERS[who].id,TOK)&&q.img.split(',')[0]==='DRV_PH1'&&q.img.split(',').length===2&&q.kd==='s,p'&&q.p==='P-2611-901'&&q.f==='FOLD1'&&/^[a-z0-9]{6,16}$/.test(q.rid)&&q.prompt.length>40,JSON.stringify(q).slice(0,300));
   ok(tag+'새 탭 주소에 토큰 값 없음',!!href&&!href.includes(TOK));
   const lk=await leak(P);ok(tag+(who==='admin'?'대표 화면 글·자료에 토큰 없음 (메모리에만)':'직원 화면 글·자료·메모리 어디에도 토큰 없음'),!lk.dom&&!lk.S&&(who==='admin'?true:!lk.mem),JSON.stringify(lk));
   ok(tag+'창 가로 넘침 없음',await P.evaluate(()=>{const s=[...document.querySelectorAll('.veil .sheet')].pop();return document.documentElement.scrollWidth<=window.innerWidth+2&&(!s||s.scrollWidth<=s.clientWidth+2)}));
   // ② 누르면 요청 ID 가 새로 (같은 요청 두 번 안 감)
   const rid0=q.rid;await P.locator('[data-gembox] [data-rdopen]').click();await wait(1500);const rid1=await P.evaluate(()=>{const a=document.querySelector('[data-gembox] [data-rdopen]');return a?new URL(a.href).searchParams.get('rid'):''});
   ok(tag+'② 누른 뒤 요청 ID 새로',rid1&&rid1!==rid0,rid0+' → '+rid1);
   if(who==='admin'||who==='jjh'){await P.locator('[data-gembox] [data-rdgo="load"]').click();let x;for(let i=0;i<20;i++){await wait(600);d=await dbv();x=((who==='admin'?d['projects/p1']:(d['work/all/projects/p1']||d['projects/p1']))||{}).renders||[];if(x.length)break}
     const r0=(x||[]).find(e=>e.drive==='DRV_OUT1');ok(tag+'③ 결과 불러오기 → 새 이름(시안 P-… 날짜 vN) 시안을 프로젝트에 붙임 · 공간·스타일·직원은 드라이브 설명에서 · Gemini 표시',!!r0&&r0.engine==='gemini'&&r0.space==='주방'&&r0.style==='북유럽'&&r0.by==='정진혁'&&r0.v==='0'&&r0.file,JSON.stringify(r0));
     await wait(800);ok(tag+'붙인 시안이 화면에 보임',/Gemini/.test(await P.locator('[data-gembox]').innerText()))}
   await close(P);if(who!=='admin')await P.close()}
  // 연습 모드 (저장소 없음): 요청 막음
  const prac=await A.evaluate(()=>window.__hfT.gemHtmlAs("p1","local"));
  ok(vn+' 연습 모드: ② 생성 대신 ‘연습 모드에서는 시안을 요청할 수 없어요’ · ① 막힘',/연습 모드에서는 시안을 요청할 수 없어요/.test(prac)&&!/data-rdopen/.test(prac)&&/data-rdgo="gprep" disabled/.test(prac));
  // 토큰 바꾸기: 옛 값은 대표 칸 prev 에 · 공용 설정엔 토큰 없음 · 입장권 다시
  await go(A,'#imagegen');await A.fill('#rdGTok',TOK2);await A.locator('[data-rdsave]').click();for(let i=0;i<20;i++){await wait(600);d=await dbv();if(T('acct/u_jjh/img/t')[sday()]===tk('u_jjh',TOK2))break}
  const kd=d['acct/_img/k/c']||{};ok(vn+' 토큰 바꾸면 대표 칸에 새 값 · 옛 값은 prev 에 남김',kd.token===TOK2&&(kd.prev||[]).some(x=>x.token===TOK),JSON.stringify(Object.keys(kd)));
  ok(vn+' 공용 설정(config/imgapi)에는 새·옛 토큰 모두 없음',!JSON.stringify(d['config/imgapi']).includes(TOK2)&&!JSON.stringify(d['config/imgapi']).includes(TOK));
  ok(vn+' 직원 입장권이 새 토큰으로 다시',T('acct/u_jjh/img/t')[sday()]===tk('u_jjh',TOK2)&&T('acct/u_cja/img/t')[sday()]===tk('u_cja',TOK2));
  // 방식 바꾸기 → hist 에 옛 값 · Imagen 방식은 옛 화면 그대로
  await A.selectOption('#rdEng','imagen');await A.locator('[data-rdsave]').click();await wait(1500);d=await dbv();
  ok(vn+' 방식을 Imagen 으로 바꾸면 옛 값(gemini·주소)은 hist 에 남음',d['config/imgapi'].engine==='imagen'&&(d['config/imgapi'].hist||[]).some(h=>h.engine==='gemini'&&h.gurl===GURL)&&d['config/imgapi'].gurl===GURL);
  await openS(A,'projects','p1');await tab(A,'prog');ok(vn+' Imagen 방식: 기존 ‘① 영어 프롬프트 만들기’ 화면 그대로',(await A.locator('[data-rdgo="prompt"]').count())===1&&(await A.locator('[data-gembox]').count())===0);await close(A);
  await A.selectOption('#rdEng','gemini').catch(()=>{});await go(A,'#imagegen');await A.selectOption('#rdEng','gemini');await A.locator('[data-rdsave]').click();await wait(1200);
  // 미리 보기(정진혁 화면): 요청 막음
  await go(A,'#preview');await A.locator('[data-pvgo="st-jung"]').click();await wait(3000);await openS(A,'projects','p1');await gemOpen(A);
  const pvt=await A.evaluate(()=>{const b=document.querySelector('[data-gembox]');return b?{t:b.innerText,open:!!b.querySelector('[data-rdopen]'),dis:!!b.querySelector('[data-rdgo="gprep"][disabled]')}:null});
  ok(vn+' 직원 화면 미리 보기: ‘미리 보기에서는 시안을 요청할 수 없어요’ · ② 없음 · ① 막힘',pvt&&/미리 보기에서는 시안을 요청할 수 없어요/.test(pvt.t)&&!pvt.open&&pvt.dis,JSON.stringify(pvt&&{open:pvt.open,dis:pvt.dis}));
  // 미리 보기에서 사진 올리기를 막을 때 화면 오류(preview)가 남지 않음 (v0.99-33)
  const e0=errs.length;await A.evaluate(()=>{const i=document.querySelector('input[data-phin]');if(!i)return;const dt=new DataTransfer();dt.items.add(new File([new Uint8Array([137,80,78,71])],'현장.png',{type:'image/png'}));i.files=dt.files;i.dispatchEvent(new Event('change',{bubbles:true}))});await wait(1500);
  const hasIn=await A.evaluate(()=>!!document.querySelector('input[data-phin]'));ok(vn+' 미리 보기: 사진 올리기는 막히고 화면 오류 없음',hasIn&&errs.length===e0,errs.slice(e0).join(' | '));
  await A.close();await ctx.close()}
 ok('브라우저 확인·알림 창 안 뜸',dialogs.length===0,dialogs.join(','));
 ok('화면 오류 없음',errs.length===0,errs.slice(0,5).join(' | '));
 await b.close();const n=R.filter(x=>x).length;console.log('b18 시험: 통과 '+n+' / '+R.length);process.exitCode=n===R.length?0:1})();
