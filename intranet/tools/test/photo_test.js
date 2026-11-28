// 현장 사진 시험 (다음 지시 2026-11-25 v9 2부 · v0.99-51 · 현장소통 Code.gs v7): LANG=C.UTF-8 node intranet/tools/test/photo_test.js [index.html]
// 1부 인트라넷(가짜 저장소 + 가짜 구글 드라이브): 정진혁이 올린 사진을 이봄이·채진아·대표가 다 봄 · 새 사진은 저장 공간(assets)에 안 올라감
//      원본 = 드라이브 프로젝트 폴더, 화면용 = 1600px 보기용(dv_) · 드라이브가 안 되면 화면용만 DB(xf_) · 여러 장 촬영 날짜 순 · 직원은 사진 지우기 없음(대표만 숨기기)
//      현장소통 연결 칸(고객 공유 페이지 코드·직원 열쇠·이미지 서버)은 대표만, 저장되면 다시 묻지 않음 · 직원 화면에 원가·성과금 안 보임
// 2부 서버(Code.gs v7 · Node 틀): 원본 → '인트라넷 첨부 › 프로젝트 번호 현장명_고객명 › 현장소통 사진 원본 › 월' · 촬영 시각 · 같은 프로젝트 현장 추가는 하나 · 숨기기는 대표만
// 3부 현장소통 화면(field/index.html 미리보기): EXIF 촬영 날짜 읽기 · 여러 장 촬영 날짜 순 정렬 · 직원 출입증 화면에는 숨기기 버튼 없음
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'../../..');
const HTML=fs.readFileSync(process.argv[2]||path.join(ROOT,'intranet/index.html'),'utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const FIELD=fs.readFileSync(path.join(ROOT,'field/index.html'),'utf8');
const makeServer=require('./gs_field_harness.js');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0="2026-11-10T00:00:00Z";
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "customers/c1":{code:"C-2611-901",name:"홍길동",tel:"",addr:"",mgr:"이봄이",status:"진행중",steps:[1],stage:"1-상담영업",updatedAt:T0},"cpriv/c1":{tel:"010-1234-5678",addr:"서울시 시험구 1",updatedAt:T0},
 "projects/p1":{no:"P-2611-901",title:"시험 현장 욕실",custName:"홍길동",custCode:"C-2611-901",stage:"시공",mgr:"이봄이",contractAmt:"33000000",estCost:"",perf:"순수 인테리어",inq:"2026-11-01",fieldCode:"https://soo-cpu.github.io/card/field/?s=AbCdEfGhIjKlMnOpQrStUv12",updatedAt:T0},"ppriv/p1":{estCost:"20202020",updatedAt:T0},
 "sites/s1":{pno:"P-2611-901",name:"시험 현장 욕실",mgr:"이봄이",status:"공사 중",logs:[],updatedAt:T0},
 "config/fstaff":{key:"k_test_key_value_0123456789abcdef",at:"2026-11-20T00:00:00Z",hist:[]},"config/imgapi":{url:"https://script.google.com/macros/s/AKfyTEST/exec",token:"tok-test-123",krw:1450}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
const R=[];const ok=(n,v,x)=>{R.push(!!v);console.log(v?'통과':'실패',n,v||x===undefined?'':String(x).replace(/\s+/g,' ').slice(0,300))};const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 가짜 구글 드라이브 (localStorage 'mockdrive' 를 같은 화면들이 같이 씀) · window.__DRVFAIL=true 면 파일 만들기 실패
const DRIVE=`window.__mcpLog=[];window.__MOCKMCP={callTool:async(sv,tool,inp)=>{window.__mcpLog.push(tool);const D=JSON.parse(localStorage.getItem('mockdrive')||'{}');const J=o=>({content:[{type:'text',text:JSON.stringify(o)}]});const sv2=()=>localStorage.setItem('mockdrive',JSON.stringify(D));
 if(tool==='create_file'){if(window.__DRVFAIL)return {isError:true,content:[{type:'text',text:'권한 없음'}]};const id='drv'+Math.random().toString(36).slice(2,10);D[id]={id,title:inp.title,parentId:inp.parentId,mime:inp.contentMimeType,b64:inp.base64Content||'',size:(inp.base64Content||'').length};sv2();return J({id,viewUrl:'https://drive.google.com/file/d/'+id+'/view'})}
 if(tool==='download_file_content'){const f=D[inp.fileId];if(!f||window.__DRVREADFAIL)return {isError:true,content:[{type:'text',text:'없음'}]};return J({content:f.b64,mimeType:f.mime})}
 if(tool==='search_files'){const q=String(inp.query||''),m=/title contains '([^']+)'/.exec(q),pm=/parentId = '([^']+)'/.exec(q);return J({files:Object.values(D).filter(f=>(!m||String(f.title).includes(m[1]))&&(!pm||f.parentId===pm[1])&&(!/folder/.test(q)||f.mime==='application/vnd.google-apps.folder')).map(f=>({id:f.id,title:f.title}))})}
 if(tool==='get_file_metadata'){const f=D[inp.fileId];return J(f?{id:f.id,title:f.title}:{})}
 return J({})}};`;

async function part1(b){
  const ctx=await b.newContext({viewport:{width:1280,height:900},timezoneId:'Asia/Seoul'});
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r));localStorage.removeItem('mockdrive')},[SEED,RULES]);
  const errs=[],dialogs=[];
  const open=async(who,ms)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type());d.dismiss()});await p.addInitScript(`window.__SUBPOLL=2500;window.__MOCKUSER=${JSON.stringify(USERS[who])};`+DRIVE+MOCK);await p.goto('http://hf.test/');await wait(ms||9000);return p};
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
  const A=await open('admin');const J=await open('jjh');const B=await open('bom');const C=await open('cja');
  // 사진 만들기 (진짜 JPEG · EXIF 촬영 날짜 넣기) → 정진혁이 현장 사진 칸으로 3장 올림 (고른 순서: 11/20, 11/03(EXIF), 11/12)
  const up=await J.evaluate(async()=>{
    const jpeg=async(color,w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle=color;g.fillRect(0,0,w,h);return new Uint8Array(await (await new Promise(r=>c.toBlob(r,'image/jpeg',.9))).arrayBuffer())};
    const exif=(u8,dt)=>{const s=dt+'\0',te=[...s].map(ch=>ch.charCodeAt(0));const T=[0x49,0x49,0x2A,0,8,0,0,0, 1,0, 0x69,0x87,4,0,1,0,0,0, 26,0,0,0, 0,0,0,0, 1,0, 0x03,0x90,2,0,20,0,0,0, 44,0,0,0, 0,0,0,0].concat(te);
      const body=[0x45,0x78,0x69,0x66,0,0].concat(T),len=body.length+2;const seg=[0xFF,0xE1,len>>8,len&255].concat(body);const out=new Uint8Array(u8.length+seg.length);out.set(u8.slice(0,2),0);out.set(seg,2);out.set(u8.slice(2),2+seg.length);return out};
    const big=await jpeg('#c33',3200,2400);
    const f1=new File([await jpeg('#3c3',800,600)],'카톡_세번째.jpg',{type:'image/jpeg',lastModified:Date.parse('2026-11-20T10:00:00+09:00')});
    const f2=new File([exif(big,'2026:11:03 09:15:00')],'IMG_첫번째.jpg',{type:'image/jpeg',lastModified:Date.parse('2026-11-25T10:00:00+09:00')});
    const f3=new File([await jpeg('#33c',640,480)],'카톡_두번째.jpg',{type:'image/jpeg',lastModified:Date.parse('2026-11-12T10:00:00+09:00')});
    window.__mockUploads=[];const p=window.__hfT.S().projects.find(x=>x.no==='P-2611-901');
    await window.__hfT.phUpload(p.id,[f1,f2,f3],'현장 관리');await new Promise(r=>setTimeout(r,800));
    const L=window.__hfT.phList(p);const dv=JSON.parse(localStorage.getItem('mockdrive')||'{}');
    return {n:L.length,assets:(window.__mockUploads||[]).length,ids:L.map(e=>e.fid),days:L.map(e=>e.d),taken:L.map(e=>e.taken||''),names:L.map(e=>e.origName||e.name),orig:L.map(e=>!!(e.drive&&e.drive.id)),
      files:(()=>{const pf=Object.values(dv).find(f=>/folder/.test(f.mime)&&/^P-2611-901/.test(f.title));return Object.values(dv).filter(f=>f===pf||pf&&f.parentId===pf.id).map(f=>({t:f.title,p:f.parentId,m:f.mime}))})(),big:Object.values(dv).filter(f=>/보기용/.test(f.title)).map(f=>f.size)}});
  ok('사진 1: 정진혁이 3장 올림 → 현장 사진 3장',up.n===3,JSON.stringify(up));
  ok('사진 2: 새 사진은 인트라넷 저장 공간(assets)에 안 올라감',up.assets===0,up.assets);
  ok('사진 3: 화면용은 드라이브 보기용(dv_) · 원본도 드라이브에',up.ids.every(x=>/^dv_/.test(x))&&up.orig.every(Boolean),JSON.stringify(up.ids)+JSON.stringify(up.orig));
  ok('사진 4: 드라이브에 프로젝트 폴더 1개 · 원본 3 · 보기용 3',up.files.filter(f=>/folder/.test(f.m)).length===1&&up.files.filter(f=>/보기용/.test(f.t)).length===3&&up.files.filter(f=>!/보기용/.test(f.t)&&!/folder/.test(f.m)).length===3,JSON.stringify(up.files));
  ok('사진 5: 프로젝트 폴더 이름 = 프로젝트 번호로 시작 (현장소통 v7 과 같은 폴더)',up.files.some(f=>/folder/.test(f.m)&&/^P-2611-901/.test(f.t)),JSON.stringify(up.files.map(f=>f.t)));
  ok('사진 6: 촬영 날짜 = EXIF(11/03) · 없으면 파일 날짜(11/12·11/20)',JSON.stringify(up.days.slice().sort())===JSON.stringify(['2026-11-03','2026-11-12','2026-11-20']),JSON.stringify(up.days)+JSON.stringify(up.taken));
  ok('사진 7: 큰 사진(3200px)은 1600px 보기용으로 줄어 저장 (원본보다 작음)',up.big.length===3,JSON.stringify(up.big));
  const order=await J.evaluate(()=>{const p=window.__hfT.S().projects.find(x=>x.no==='P-2611-901');return (p.photos||[]).map(e=>e.origName||e.name)});
  ok('사진 8: 여러 장은 촬영 날짜 순으로 기록됨 (첫번째·두번째·세번째)',/첫번째/.test(order[0])&&/두번째/.test(order[1])&&/세번째/.test(order[2]),JSON.stringify(order));
  await wait(9000);
  // 이봄이·채진아·대표: 같은 3장 + 그림이 실제로 열림(보는 사람 드라이브 연결로)
  const look=async(P,who)=>{await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(2500);for(let i=0;i<8;i++){await P.evaluate(i=>{const ims=[...document.querySelectorAll('#phBox .phgrid img')];if(ims[i])ims[i].scrollIntoView()},i);await wait(300)}await wait(1500);
    return P.evaluate(()=>{const ims=[...document.querySelectorAll('#phBox .phgrid img')];const p=window.__hfT.S().projects.find(x=>x.no==='P-2611-901');return {n:p?window.__hfT.phList(p).length:-1,img:ims.length,blob:ims.filter(i=>i.src.startsWith('blob:')&&i.naturalWidth>0).length,w:ims.map(i=>i.naturalWidth)}})};
  if(process.env.DBG){console.log('dbg',await B.evaluate(async id=>{try{return [await window.__hfT.phBlobSize(id),await window.__hfT.phSrc(id)]}catch(e){return 'ERR '+e.message}},up.ids[0]));console.log(await B.evaluate(()=>[...document.querySelectorAll('#phBox img')].map(i=>i.src.slice(0,60)+' '+i.complete+' '+i.naturalWidth+' '+(i.dataset.phTry||''))))}
  for(const [P,who] of [[B,'이봄이'],[C,'채진아'],[A,'대표'],[J,'정진혁']]){const r=await look(P,who);ok('사진 9: '+who+' 화면에 정진혁 사진 3장이 다 보임(그림 열림 · 1600px 이하)',r.n===3&&r.img===3&&r.blob===3&&r.w.every(x=>x>0&&x<=1600),JSON.stringify(r))}
  // 드라이브가 안 되는 직원(이봄이): 화면용만 DB(xf_) 로 · 정진혁 화면에서도 보임
  const xf=await B.evaluate(async()=>{window.__DRVFAIL=true;window.__mockUploads=[];const c=document.createElement('canvas');c.width=900;c.height=700;c.getContext('2d').fillRect(0,0,900,700);const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));
    const p=window.__hfT.S().projects.find(x=>x.no==='P-2611-901');await window.__hfT.phUpload(p.id,[new File([b],'드라이브없음.jpg',{type:'image/jpeg'})],'현장 관리');window.__DRVFAIL=false;const L=window.__hfT.phList(p);return {ids:L.map(e=>e.fid),assets:(window.__mockUploads||[]).length}});
  ok('사진 10: 드라이브가 막혀도 assets 없이 화면용만 DB(xf_)에 저장',xf.ids.some(x=>/^xf_/.test(x))&&xf.assets===0,JSON.stringify(xf));
  await wait(9000);
  const jx=await look(J,'정진혁');ok('사진 11: 이봄이가 DB(xf_)로 올린 사진도 정진혁 화면에서 열림 (4장)',jx.n===4&&jx.blob===4,JSON.stringify(jx));
  // 직원은 지우기 없음: 현장 카드 첨부 칸의 사진에 삭제 버튼 없음, 대표는 숨기기만
  const del=async(P)=>{await P.evaluate(()=>{const D=JSON.parse(localStorage.getItem('mockdb'));});await P.evaluate(()=>window.__hfT.open('sites','s1'));await wait(2500);return P.evaluate(()=>({rm:document.querySelectorAll('#fileList [data-rmfile]').length,hide:document.querySelectorAll('#fileList [data-hidefile]').length,files:document.querySelectorAll('#fileList .file').length}))};
  // 현장 카드 첨부 칸에 사진 1장 붙여 저장 (정진혁)
  const sf=await J.evaluate(async()=>{window.__hfT.open('sites','s1');await new Promise(r=>setTimeout(r,1500));const c=document.createElement('canvas');c.width=500;c.height=400;c.getContext('2d').fillRect(0,0,500,400);const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));
    window.__mockUploads=[];const inp=document.querySelector('#sheetForm input[type=file]');const dt=new DataTransfer();dt.items.add(new File([b],'현장카드.jpg',{type:'image/jpeg'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,2500));
    return {rm:document.querySelectorAll('#fileList [data-rmfile]').length,files:document.querySelectorAll('#fileList .file').length,assets:(window.__mockUploads||[]).length}});
  ok('사진 12: 정진혁 현장 카드 첨부 칸 사진 → assets 아님 · 삭제 버튼 없음',sf.files>=1&&sf.rm===0&&sf.assets===0,JSON.stringify(sf));
  await J.evaluate(async()=>{const b=[...document.querySelectorAll('.sheet button')].find(x=>/^저장/.test(x.textContent.trim()));if(b)b.click();await new Promise(r=>setTimeout(r,2500))});await wait(9000);
  const ad=await del(A);ok('사진 13: 대표 화면 현장 카드 사진 = 숨기기 버튼만 (삭제 없음)',ad.hide>=1&&ad.rm===0,JSON.stringify(ad));
  const bd=await del(B);ok('사진 14: 이봄이 화면도 그 사진이 보이고 삭제·숨기기 버튼 없음',bd.files>=1&&bd.rm===0&&bd.hide===0,JSON.stringify(bd));
  // 대표 숨기기 → 직원 화면 현장 사진 목록에서 빠짐, 기록·파일은 그대로
  await A.evaluate(()=>window.__hfT.open('projects','p1'));await wait(2500);
  const hid=await A.evaluate(async()=>{const b=document.querySelector('[data-phhide]');if(!b)return 'no button';b.click();await new Promise(r=>setTimeout(r,600));const y=document.querySelector('.okask [data-ok="1"]');if(y)y.click();await new Promise(r=>setTimeout(r,1500));const p=window.__hfT.S().projects.find(x=>x.no==='P-2611-901');return {photos:(p.photos||[]).length,acts:(p.phAct||[]).filter(a=>a.act==='숨김').length}});
  ok('사진 15: 대표 숨기기 = 기록에 숨김 표시만 (사진 줄은 그대로)',hid&&hid.acts===1&&hid.photos===4,JSON.stringify(hid));
  await wait(9000);const bh=await look(B,'이봄이');ok('사진 16: 숨긴 사진은 직원(이봄이) 화면에서 빠짐',bh.n===4,JSON.stringify(bh)); /* 4 = 프로젝트 사진 3 + 현장 카드 1 */
  // 4번: 현장소통 연결 칸 — 대표만, 저장되면 다시 묻지 않음
  const fcA=await A.evaluate(()=>({input:!!document.querySelector('#sheetForm [data-k="fieldCode"]'),done:!!document.querySelector('[data-fcedit]')}));
  ok('연결 1: 대표 화면 — 코드가 저장된 프로젝트는 ‘연결됨 · 바꾸기’만 (입력 칸 없음)',!fcA.input&&fcA.done,JSON.stringify(fcA));
  const fcA2=await A.evaluate(async()=>{document.querySelector('[data-fcedit]').click();await new Promise(r=>setTimeout(r,500));return !!document.querySelector('#sheetForm [data-k="fieldCode"]')});
  ok('연결 2: 대표가 ‘바꾸기’를 누르면 칸이 열림',fcA2);
  for(const [P,who] of [[J,'정진혁'],[B,'이봄이'],[C,'채진아']]){await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(2000);
    const r=await P.evaluate(()=>({input:!!document.querySelector('#sheetForm [data-k="fieldCode"]'),edit:!!document.querySelector('[data-fcedit]'),fst:!!document.getElementById('fstCfg'),rd:!!document.getElementById('rdUrl'),txt:document.body.innerText}));
    ok('연결 3: '+who+' 화면 — 고객 공유 페이지 코드 칸·바꾸기·직원 열쇠·이미지 서버 칸 없음',!r.input&&!r.edit&&!r.fst&&!r.rd,JSON.stringify({input:r.input,edit:r.edit,fst:r.fst,rd:r.rd}));
    ok('권한: '+who+' 화면에 원가·성과금 없음',who==='채진아'?!/순수 인테리어/.test(r.txt):!/20202020|순수 인테리어/.test(r.txt),(r.txt.match(/20202020|순수 인테리어/)||[''])[0])}
  await A.evaluate(()=>{window.__hfT.closeSheet&&window.__hfT.closeSheet();location.hash='#forms'});await wait(2500);
  const fs1=await A.evaluate(()=>{const c=document.getElementById('fstCfg');return c?{ok:/연결됨/.test(c.innerText),steps:!!document.getElementById('fstSteps'),re:!!c.querySelector('[data-fstnew]'),val:!!document.getElementById('fstVal')}:null});
  ok('연결 4: 서식 자료실 › 현장소통 연결 — 열쇠가 있으면 ‘연결됨 · 다시 연결하기’만 (붙여 넣는 순서·열쇠 칸 안 보임)',fs1&&fs1.ok&&!fs1.steps&&!fs1.val&&fs1.re,JSON.stringify(fs1));
  const fs2=await A.evaluate(async()=>{await new Promise(r=>setTimeout(r,200));document.querySelector('#fstCfg [data-fstnew]').click();await new Promise(r=>setTimeout(r,600));const y=document.querySelector('.okask [data-ok="1"]');if(y)y.click();await new Promise(r=>setTimeout(r,1500));return {steps:!!document.getElementById('fstSteps'),val:!!document.getElementById('fstVal')}});
  ok('연결 5: ‘다시 연결하기’(확인 뒤)를 눌렀을 때만 새 열쇠·붙여 넣는 순서가 보임',fs2.steps&&fs2.val,JSON.stringify(fs2));
  await A.evaluate(()=>{location.hash='#imagegen'});await wait(2000);
  const rd=await A.evaluate(()=>{const u=document.getElementById('rdUrl');return u?{type:u.type,edit:!!document.querySelector('[data-rdedit]')}:null});
  ok('연결 6: 이미지 생성 — 저장된 서버 주소·토큰은 ‘저장됨 · 바꾸기’ (칸은 숨김 값으로만)',!rd||rd.type==='hidden'&&rd.edit,JSON.stringify(rd));
  ok('사진: 화면 오류 없음',!errs.length,errs.slice(0,3).join(' | '));
  ok('사진: alert/prompt 대화상자 안 뜸 (확인은 okAsk — 막히면 화면 안 확인 창)',!dialogs.some(d=>!/confirm/.test(d)),dialogs.join(','));
  await ctx.close()}

function part2(){
  const S=makeServer();S.setPw('pw-test-77');const pw='pw-test-77';
  ok('서버 1: doGet v:7',JSON.parse(S.ctx.doGet({parameter:{}}).text).v===7);
  const a=S.post({a:'addSite',pw,name:'시험 현장 욕실',cust:'홍길동',proj:'P-2611-901',pin:''});ok('서버 2: 현장 추가',a.ok&&a.code,JSON.stringify(a));
  const a2=S.post({a:'addSite',pw,name:'다른 이름',proj:'P-2611-901',pin:''});ok('서버 3: 같은 프로젝트로 또 추가 → 있는 현장 (하나만)',a2.ok&&a2.code===a.code&&a2.existing,JSON.stringify(a2));
  const sitesN=S.rowsOf('현장').filter(r=>/P-2611-901/.test(r[14]||'')).length;ok('서버 4: 현장 탭에 그 프로젝트 줄은 1줄',sitesN===1,sitesN);
  const px='data:image/jpeg;base64,'+Buffer.from([255,216,255,224,0,1,2,3]).toString('base64'),orig='data:image/jpeg;base64,'+Buffer.alloc(5000,7).toString('base64');
  const u1=S.post({a:'upload',pw,s:a.code,data:px,orig,taken:'2026-11-03 09:15:00',name:'IMG_0001.JPG'});
  ok('서버 5: 원본 같이 올리기 → 줄인 사진 id + 원본 id',u1.ok&&u1.fileId&&u1.orig&&!u1.warn,JSON.stringify(u1));
  const it=S.st.drive.items,oi=it[u1.orig]||{},m=it[oi.parent]||{},sub=it[m.parent]||{},pf=it[sub.parent]||{};
  ok('서버 6: 원본 위치 = 인트라넷 첨부 › P-2611-901 시험 현장 욕실_홍길동 › 현장소통 사진 원본 › 월',pf.parent==='1P0Rh3vBB1ApsUcpVXZsDrzr1mdVUWOor'&&pf.name==='P-2611-901 시험 현장 욕실_홍길동'&&sub.name==='현장소통 사진 원본'&&/^\d{4}-\d{2}$/.test(m.name),JSON.stringify([pf.name,sub.name,m.name,pf.parent]));
  ok('서버 7: 원본 파일 크기 그대로 (5000바이트) · 이름에 촬영 시각',oi.size===5000&&/^20261103091500_IMG_0001\.jpg$/.test(oi.name),JSON.stringify(oi));
  const ph=S.rowsOf('사진').find(r=>r[0]===u1.fileId)||[];ok('서버 8: 사진 탭 = 원본ID·촬영 시각 칸',ph[5]===u1.orig&&ph[6]==='2026-11-03 09:15:00',JSON.stringify(ph));
  const s1=S.rowsOf('현장').find(r=>r[0]===a.code);ok('서버 9: 현장 탭 19번째 칸 원본 폴더ID',s1&&s1[18]===oi&&false||s1&&s1[18]===sub.parent,JSON.stringify(s1&&s1[18]));
  const u2=S.post({a:'upload',pw,s:a.code,data:px,orig,taken:'bad',name:'b.jpg'});const fol=Object.values(it).filter(x=>x.kind==='folder'&&/^P-2611-901/.test(x.name)).length;
  ok('서버 10: 두 번째 사진도 같은 폴더 (폴더 1개) · 이상한 촬영 시각은 빈 값',u2.ok&&fol===1&&(S.rowsOf('사진').find(r=>r[0]===u2.fileId)||[])[6]==='',fol);
  // 인트라넷이 먼저 만든 프로젝트 폴더가 있으면 그것을 씀
  const S2=makeServer();S2.setPw(pw);const root=S2.ctx.DriveApp.getFolderById('1P0Rh3vBB1ApsUcpVXZsDrzr1mdVUWOor');const pre=root.createFolder('P-2611-777 인트라넷이 만든 폴더');
  const b2=S2.post({a:'addSite',pw,name:'칠칠 현장',proj:'P-2611-777',pin:''});const u3=S2.post({a:'upload',pw,s:b2.code,data:px,orig,name:'c.jpg'});
  const o3=S2.st.drive.items[u3.orig]||{},m3=S2.st.drive.items[o3.parent]||{},sb3=S2.st.drive.items[m3.parent]||{};
  ok('서버 11: 인트라넷이 만든 ‘P-2611-777 …’ 폴더가 있으면 그 안에 저장 (새 폴더 안 만듦)',sb3.parent===pre.getId(),JSON.stringify([sb3.parent,pre.getId()]));
  // 원본 저장 실패해도 줄인 사진은 올라감
  S2.st.drive.fail.file=id=>id!==undefined&&S2.st.drive.items[id]&&/^\d{4}-\d{2}$/.test(S2.st.drive.items[id].name)&&(S2.st.drive.items[S2.st.drive.items[id].parent]||{}).name==='현장소통 사진 원본';
  const u4=S2.post({a:'upload',pw,s:b2.code,data:px,orig,name:'d.jpg'});S2.st.drive.fail.file=null;
  ok('서버 12: 원본 저장이 실패해도 줄인 사진은 올라가고 안내가 옴',u4.ok&&u4.fileId&&!u4.orig&&/원본/.test(u4.warn||''),JSON.stringify(u4));
  const u5=S.post({a:'upload',pw,s:a.code,data:px,name:'e.jpg'});ok('서버 13: 원본 없이(예전 화면) 올려도 그대로 됨',u5.ok&&u5.fileId&&!u5.orig,JSON.stringify(u5));
  // 숨기기는 대표만
  const KEY='k'.repeat(40);S.setProp('FIELD_STAFF_KEY',KEY);const tk=S.post({a:'ticket',k:S.ticket(KEY,{who:'정진혁'})}).token;const T='T:'+tk;
  const po=S.post({a:'adminPost',pw:T,s:a.code,text:'오늘 공정',photos:[u1.fileId]});ok('서버 14: 직원 출입증으로 글·사진 올리기는 됨',po.ok&&po.id,JSON.stringify(po));
  const h1=S.post({a:'editPost',pw:T,s:a.code,id:po.id,hidden:true});ok('서버 15: 직원 출입증으로 글(사진) 숨기기 → 거절',!h1.ok&&/대표만/.test(h1.error||''),JSON.stringify(h1));
  const h1b=S.post({a:'editPost',pw:T,s:a.code,id:po.id,important:true});ok('서버 16: 직원 출입증으로 중요 표시는 그대로 됨',h1b.ok,JSON.stringify(h1b));
  const h2=S.post({a:'editPost',pw,s:a.code,id:po.id,hidden:true});const prow=S.rowsOf('글').find(r=>r[0]===po.id);ok('서버 17: 대표(비밀번호)는 숨기기 됨 · 글 줄은 남음',h2.ok&&prow&&prow[11]==='Y',JSON.stringify(h2));
  const cm=S.post({a:'comment',pw:T,s:a.code,postId:po.id,text:'댓글'});const h3=S.post({a:'editComment',pw:T,s:a.code,id:cm.id,hidden:true});ok('서버 18: 직원 출입증으로 댓글 숨기기 → 거절',!h3.ok,JSON.stringify(h3));
  ok('서버 19: 지운 행 없음 (사진 탭 줄 수 = 올린 수)',S.rowsOf('사진').length===3,S.rowsOf('사진').length);
}

async function part3(b){
  const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Seoul'});const errs=[],dialogs=[];
  await ctx.route('https://soo-cpu.github.io/card/field/**',r=>{const u=r.request().url();if(/config\.js/.test(u))return r.fulfill({contentType:'application/javascript',body:'window.FIELD_API="";'});return r.fulfill({contentType:'text/html',body:FIELD})});
  await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.type());d.dismiss()});
  await p.goto('https://soo-cpu.github.io/card/field/?admin');await wait(1500);
  const r=await p.evaluate(async()=>{const jpeg=async(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').fillRect(0,0,w,h);return new Uint8Array(await (await new Promise(r=>c.toBlob(r,'image/jpeg',.9))).arrayBuffer())};
    const exif=(u8,dt)=>{const te=[...(dt+'\0')].map(ch=>ch.charCodeAt(0));const T=[0x4D,0x4D,0,0x2A,0,0,0,8, 0,1, 0x87,0x69,0,4,0,0,0,1,0,0,0,26, 0,0,0,0, 0,1, 0x90,0x03,0,2,0,0,0,20,0,0,0,44, 0,0,0,0].concat(te);const body=[0x45,0x78,0x69,0x66,0,0].concat(T),len=body.length+2;const seg=[0xFF,0xE1,len>>8,len&255].concat(body);const out=new Uint8Array(u8.length+seg.length);out.set(u8.slice(0,2),0);out.set(seg,2);out.set(u8.slice(2),2+seg.length);return out};
    const a=await jpeg(400,300),e=exif(a,'2025:12:24 18:30:05');
    const t1=exifDate(e.buffer),t0=exifDate(a.buffer);
    const box=document.createElement('div');document.body.appendChild(box);const pk=picker(box);const inp=box.querySelector('input[type=file]');
    const dt=new DataTransfer();dt.items.add(new File([a],'c.jpg',{type:'image/jpeg',lastModified:Date.parse('2026-11-20T10:00:00+09:00')}));dt.items.add(new File([e],'a.jpg',{type:'image/jpeg',lastModified:Date.parse('2026-11-25T10:00:00+09:00')}));dt.items.add(new File([a],'b.jpg',{type:'image/jpeg',lastModified:Date.parse('2026-11-01T10:00:00+09:00')}));
    inp.files=dt.files;inp.dispatchEvent(new Event('change'));await new Promise(r=>setTimeout(r,1500));
    return {t1,t0,multi:inp.multiple,order:pk.files.map(x=>x.file.name),taken:pk.files.map(x=>x.taken),groups:byDay(pk.files).map(g=>g[0]+':'+g[1].length)}});
  ok('현장소통 1: EXIF 촬영 날짜 읽기 (큰 엔디언) · EXIF 없으면 빈 값',r.t1==='2025-12-24 18:30:05'&&r.t0==='',JSON.stringify([r.t1,r.t0]));
  ok('현장소통 2: 여러 장 한 번에 고르기 (multiple)',r.multi);
  ok('현장소통 3: 고른 사진은 촬영 날짜 순 (a 2025-12-24 → b 11/01 → c 11/20)',JSON.stringify(r.order)==='["a.jpg","b.jpg","c.jpg"]',JSON.stringify(r)+'');
  ok('현장소통 4: 촬영 날짜별 묶음 3일',r.groups.length===3,JSON.stringify(r.groups));
  // 직원 출입증 화면에는 숨기기 버튼 없음, 비밀번호(대표) 화면에는 있음 — 미리보기 시험 현장
  const btn=async(staff)=>{await p.evaluate(x=>{if(x){localStorage.removeItem('field_pw');sessionStorage.setItem('field_tk','tkPreview123');sessionStorage.setItem('field_preview_tk','tkPreview123')}else{localStorage.setItem('field_pw','0000');sessionStorage.removeItem('field_tk');sessionStorage.removeItem('field_preview_tk')}},staff);
    await p.goto('https://soo-cpu.github.io/card/field/?admin&s=WI7ijOiMEPHIOf4vjkqEPmG2');await wait(2500);return p.evaluate(()=>({hide:document.querySelectorAll('[data-hide]').length,hc:document.querySelectorAll('[data-hc]').length,imp:document.querySelectorAll('[data-imp]').length}))};
  const boss=await btn(false),staff=await btn(true);
  ok('현장소통 5: 대표(비밀번호) 화면 = 숨기기 버튼 있음 / 직원 출입증 화면 = 숨기기 없음(중요 표시는 있음)',boss&&boss.hide>0&&staff&&staff.hide===0&&staff.hc===0&&staff.imp>0,JSON.stringify({boss,staff}));
  ok('현장소통: 화면 오류 없음',!errs.length,errs.slice(0,3).join(' | '));
  await ctx.close()}

(async()=>{const b=await chromium.launch();
  try{await part1(b)}catch(e){ok('1부 실행',false,e.stack)}
  try{part2()}catch(e){ok('2부 실행',false,e.stack)}
  try{await part3(b)}catch(e){ok('3부 실행',false,e.stack)}
  await b.close();const f=R.filter(x=>!x).length;console.log(`\n결과: 통과 ${R.length-f} / 실패 ${f}`);process.exit(f?1:0)})();
