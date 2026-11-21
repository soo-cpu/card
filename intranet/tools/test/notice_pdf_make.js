// 공사 안내문 PDF 한 장 뽑기 (v0.99-42, 2026-11-21) — 인트라넷의 실제 안내문 그리기 코드(가짜 저장소)로 A4 한 장 PDF 를 만든다
// 쓰는 법: node intranet/tools/test/notice_pdf_make.js [나올 PDF 경로] [값 파일.json]
//   값 파일(없어도 됨)은 아래 JOB 과 같은 모양. 안에 적은 칸만 바뀜. 예: {"fields":{"period":"2026년 11월 24일 ~ 12월 9일"}}
// 고객 이름·고객 전화는 안내문에 찍지 않는다 (프로젝트 줄에도 넣지 않음 — 파일 이름에만 씀). QR 은 만든 뒤 실제로 읽어 주소가 맞는지 확인한다.
if(!process.env.LANG&&!process.env.LC_ALL)process.env.LANG='C.UTF-8';
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ROOT=path.join(__dirname,'../../..');
const JOB={
  out:'공사 안내문 김정래 2026-11-21 v0.pdf',
  // 프로젝트 기본 정보 (인트라넷 프로젝트 줄과 같은 칸)
  project:{no:'P-2611-004',title:'아름마을 LG 202동 708호',addr:'경기도 구리시 아름마을 LG아파트 202동 708호',mgr:'정진혁',work:'창호 포함 전체',start:'2026-11-20',endPlan:'2026-12-09',wish:'26년 11월23-26년 12월 9일',stage:'시공',cat:'주거'},
  mgrPos:'실장',
  // 초안 위에 손으로 고칠 칸 (적은 칸만 바뀜 · 빈 글자 "" 를 주면 그 칸을 비움). 칸: unit period hours work noise co mgr tel greet
  fields:{period:'2026년 11월 23일 ~ 12월 9일',hours:'평일 오전 9시 ~ 오후 6시'},
  png:''  // 그림 파일도 같이 보고 싶으면 경로
};
const a2=process.argv[2],a3=process.argv[3];
if(a3){const j=JSON.parse(fs.readFileSync(a3,'utf8'));Object.keys(j).forEach(k=>{JOB[k]=(j[k]&&typeof j[k]==='object'&&!Array.isArray(j[k]))?Object.assign({},JOB[k],j[k]):j[k]})}
if(a2)JOB.out=a2;
function loadJsQR(){const tries=[process.env.JSQR_DIR,'jsqr',path.join(os.tmpdir(),'hf-jsqr/node_modules/jsqr')].filter(Boolean);for(const t of tries){try{return require(t)}catch(e){}}
  try{const d=path.join(os.tmpdir(),'hf-jsqr');fs.mkdirSync(d,{recursive:true});cp.execSync('npm install jsqr --no-audit --no-fund --prefix '+JSON.stringify(d),{stdio:'ignore',timeout:120000});return require(path.join(d,'node_modules/jsqr'))}catch(e){return null}}
const HTML=fs.readFileSync(path.join(ROOT,'intranet/index.html'),'utf8'),MOCK=fs.readFileSync(path.join(__dirname,'mock.js'),'utf8');
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const T0='2026-11-01T00:00:00Z';
const SEED={'staff/st-choi':{name:'최윤수',uid:'u_boss',state:'재직',pos:'대표이사'},'staff/st-mgr':{name:JOB.project.mgr,uid:'u_mgr',level:'실무 팀',state:'재직',pos:JOB.mgrPos},
  'projects/p1':Object.assign({custName:'',updatedAt:T0,inq:'2026-11-01'},JOB.project)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const jsQR=loadJsQR();const b=await chromium.launch();const ctx=await b.newContext({timezoneId:'Asia/Seoul',acceptDownloads:true,viewport:{width:1280,height:900}});
  await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg|github\.io/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
  const P=await ctx.newPage();const errs=[];P.on('pageerror',e=>errs.push(e.message));
  await P.addInitScript(`window.__MOCKUSER=${JSON.stringify({id:'u_boss',name:'최윤수',email:'boss@test',isOwner:true})};`+MOCK);await P.goto('http://hf.test/');await wait(12000);
  await P.evaluate(()=>{location.hash='#projects'});await wait(500);await P.evaluate(()=>window.__hfT.open('projects','p1'));await wait(1200);
  await P.locator('#pjHub [data-gnopen]').click();await wait(1500);
  const draft=await P.evaluate(()=>Object.fromEntries(Array.from(document.querySelectorAll('#gnVeil [data-gnf]')).map(i=>[i.dataset.gnf,i.value])));
  for(const [k,v] of Object.entries(JOB.fields||{})){await P.fill('#gn_'+k,String(v))}
  await wait(900);
  const g=await P.evaluate(()=>window.__hfT.gn());
  const dl=P.waitForEvent('download',{timeout:15000});await P.locator('#gnVeil [data-gnout="pdf"]').click();const d=await dl;
  const out=path.resolve(JOB.out);fs.mkdirSync(path.dirname(out),{recursive:true});await d.saveAs(out);
  const png=await P.evaluate(()=>document.getElementById('gnImg').src);if(JOB.png)fs.writeFileSync(path.resolve(JOB.png),Buffer.from(png.split(',')[1],'base64'));
  const q=await P.evaluate(async()=>{const im=document.getElementById('gnImg'),q=window.__hfT.gn().last.qr,c=document.createElement('canvas');c.width=c.height=q.size;c.getContext('2d').drawImage(im,q.x,q.y,q.size,q.size,0,0,q.size,q.size);return {w:q.size,px:Array.from(c.getContext('2d').getImageData(0,0,q.size,q.size).data)}});
  const read=jsQR?(jsQR(Uint8ClampedArray.from(q.px),q.w,q.w)||{}).data:null;
  const pdf=fs.readFileSync(out),pages=(pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length,box=/\/MediaBox\s*\[([^\]]+)\]/.exec(pdf.toString('latin1'));
  const bad=[];if(!g.last.fit)bad.push('한 장에 다 안 들어감');if(pages!==1)bad.push('PDF 쪽수 '+pages);if(jsQR&&read!==g.last.url)bad.push('QR 을 읽은 주소가 다름: '+read);if(!jsQR)bad.push('QR 판독기(jsQR)를 쓸 수 없어 읽기 확인 못 함');
  if(/[가-힣]{2,4}\s*(님|고객)/.test(g.last.log.join(' ')))bad.push('안내문에 고객 호칭이 있음');if(errs.length)bad.push('화면 오류 '+errs[0]);
  console.log('초안(자동):',JSON.stringify(draft));console.log('찍힌 글:',g.last.log.join(' / '));console.log('QR 주소:',g.last.url,'| 읽은 값:',read);
  console.log('PDF:',out,'·',pdf.length,'바이트 ·',pages,'쪽 · 종이',box&&box[1]);console.log(bad.length?'확인 필요: '+bad.join(' · '):'확인: A4 한 장 · QR 읽힘(주소 일치)');
  await b.close();process.exit(bad.length?1:0)})();
