// 재직·경력증명서 대표자 전원 표기 + 도장 위치 시험 (2026-11-12, v0.99-24): node intranet/tools/test/cert_test.js [index.html]
// 대표자 1명·2명·3명. 증명서는 화면에서 A4(1240x1754) 한 장으로 그려 PDF에 넣는 한 가지 길뿐이라, 그린 그림을 PC 화면·A4 출력 미디어로 띄워 스크린샷을 남김
const {chromium}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장",dept:"본사",joined:"2024-03-04"},
 "hr/st_jjh":{birth:"1988-05-06",addr:"서울 시험구 시험로 12"},"members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true}};
// 그리는 호출을 엿봄: 이름 줄(대표이사 …)과 도장(drawImage)의 좌표, 다 그린 그림(JPEG)
const HOOK=`window.__cert=[];window.__certImg=[];window.__dl=[];(()=>{const P=CanvasRenderingContext2D.prototype,ft=P.fillText,di=P.drawImage,td=HTMLCanvasElement.prototype.toDataURL;
 P.fillText=function(t,x,y){if(this.canvas.width===1240&&this.canvas.height===1754&&/대표이사/.test(t)){const w=this.measureText(t).width,last=t.trim().split(/[ ,]+/).pop();window.__cert.push({k:'text',t,x,y,align:this.textAlign,w,font:this.font,lastName:last,lastW:this.measureText(last).width,chW:this.measureText(last.slice(-1)).width})}return ft.apply(this,arguments)};
 P.drawImage=function(img,x,y,w,h){if(this.canvas.width===1240&&this.canvas.height===1754)window.__cert.push({k:'seal',x,y,w,h});return di.apply(this,arguments)};
 HTMLCanvasElement.prototype.toDataURL=function(){const r=td.apply(this,arguments);if(this.width===1240&&this.height===1754)window.__certImg.push(r);return r}})();`;
const DL=`;(()=>{const u0=window.claude.use;window.claude.use=async n=>n==='downloads'?{save:async o=>{window.__dl.push(o.filename)}}:u0(n)})();`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?"통과":"실패",n,x===undefined?"":String(x).slice(0,320))};
(async()=>{const b=await chromium.launch();const errs=[],shots=[];
 const CASES=[["1명",{ceos:"최윤수"},"주식회사 홈퍼니싱  대표이사  최윤수"],["2명 (설정 없음 = 기본값)",null,"주식회사 홈퍼니싱  대표이사  신혜현, 최윤수"],["2명 (옛 대표이사 칸만 저장돼 있음)",{name:"주식회사 홈퍼니싱",ceo:"최윤수",addr:"경기도 시험시 시험로 1",bizno:"1234567890"},"주식회사 홈퍼니싱  대표이사  신혜현, 최윤수"],["3명",{ceos:"신혜현, 최윤수, 남궁길동",addr:"경기도 시험시 시험로 1"},"주식회사 홈퍼니싱  대표이사  신혜현, 최윤수, 남궁길동"]];
 let ci=0;for(const [label,co,want] of CASES){ci++;
  const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');
  await seed.evaluate(([s,r,co])=>{const c=document.createElement('canvas');c.width=c.height=300;const x=c.getContext('2d');x.strokeStyle='#d0202a';x.lineWidth=14;x.beginPath();x.arc(150,150,135,0,7);x.stroke();x.fillStyle='#d0202a';x.font='700 110px sans-serif';x.textAlign='center';x.fillText('印',150,190);
   s=Object.assign({},s,{"seal/current":{data:c.toDataURL('image/png'),w:300,h:300,name:'시험 직인.png',at:'2026-11-12T00:00:00Z',clear:70}});if(co)s["config/company"]=co;localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES,co]);
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));
  const A=await ctx.newPage();A.on('pageerror',e=>errs.push(label+': '+e.message));A.on('dialog',d=>d.dismiss());await A.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS.admin)};`+HOOK+MOCK+DL);await A.goto('http://hf.test/');await wait(7000);
  await A.evaluate(()=>{location.hash='#staff'});await wait(1000);await A.locator('tr[data-open="staff"]').filter({hasText:'정진혁'}).first().click();await wait(1000);
  for(const kind of ['재직증명서','경력증명서']){const n0=await A.evaluate(()=>window.__certImg.length);
   await A.locator(`[data-certnow][data-t="${kind}"]`).first().click();for(let i=0;i<40&&(await A.evaluate(()=>window.__certImg.length))===n0;i++)await wait(250);await wait(600);
   const g=await A.evaluate(()=>window.__cert.splice(0)),img=await A.evaluate(()=>window.__certImg[window.__certImg.length-1]||''),dl=await A.evaluate(()=>window.__dl.slice());
   const t=g.find(x=>x.k==='text'),sl=g.filter(x=>x.k==='seal');
   if(!t||!sl.length){ok(label+' '+kind+': 증명서가 그려짐',false,JSON.stringify(g).slice(0,200));continue}
   const s=sl[0],right=t.align==='center'?t.x+t.w/2:t.x+t.w,left=right-t.w,sc=s.x+s.w/2,dist=sc-right,overlap=right-s.x,ty=t.y-parseFloat(/(\d+)px/.exec(t.font)[1])*0.36,sy=s.y+s.h/2;
   ok(label+' '+kind+': 대표자 칸 = “'+want.replace(/  /g,' ')+'”',t.t===want,t.t);
   ok(label+' '+kind+': 도장은 하나',sl.length===1,sl.length+'개');
   ok(label+' '+kind+': 도장이 마지막 이름('+t.lastName+') 바로 오른쪽 · 끝 글자와 살짝 겹침 (글자 사이에 찍히지 않음)',overlap>4&&overlap<t.chW*0.7&&s.x>right-t.chW&&dist>s.w*0.3&&dist<s.w*0.5,'이름 줄 오른쪽 끝 x='+right.toFixed(1)+' · 도장 왼쪽 x='+s.x+' · 겹침 '+overlap.toFixed(1)+'px (끝 글자 너비 '+t.chW.toFixed(1)+'px) · 도장 중심이 이름 끝에서 오른쪽으로 '+dist.toFixed(1)+'px');
   ok(label+' '+kind+': 도장 높이 가운데가 이름 줄 가운데와 맞음 · 종이 안에 들어옴',Math.abs(sy-ty)<=2&&left>=60&&s.x+s.w<=1240-60,'세로 차이 '+(sy-ty).toFixed(1)+'px · 왼쪽 '+left.toFixed(0)+' · 오른쪽 '+(s.x+s.w));
   ok(label+' '+kind+': 파일 이름 ‘'+kind+' 정진혁 YYYY-MM-DD vN.pdf’',new RegExp('^'+kind+' 정진혁 \\d{4}-\\d{2}-\\d{2} v\\d+\\.pdf$').test(dl[dl.length-1]||''),dl.join(' | '));
   // 스크린샷: PC 화면 + A4 출력 미디어 (deviceScaleFactor 2) + 도장 둘레 확대
   const vc=await b.newContext({viewport:{width:1280,height:900},deviceScaleFactor:2});const V=await vc.newPage();
   await V.setContent(`<html><head><style>@page{size:A4;margin:0}html,body{margin:0;background:#888}img{display:block;width:794px;height:1123px;margin:12px auto;background:#fff}@media print{html,body{background:#fff}img{width:210mm;height:297mm;margin:0}}</style></head><body><img src="${img}"></body></html>`);await wait(300);
   const base=OUT+'/cert_'+ci+'_'+(kind==='재직증명서'?'jaejik':'career');
   await V.screenshot({path:base+'_pc.png',fullPage:true});shots.push(base+'_pc.png');
   const k=794/1240,bx=await V.locator('img').boundingBox();await V.screenshot({path:base+'_pc_zoom.png',fullPage:true,clip:{x:bx.x+(left-20)*k,y:bx.y+(t.y-150)*k,width:Math.min(794-(left-20)*k,(s.x+s.w-left+60)*k),height:260*k}});shots.push(base+'_pc_zoom.png');
   await V.emulateMedia({media:'print'});await V.setViewportSize({width:794,height:1123});await wait(200);await V.screenshot({path:base+'_a4print.png',fullPage:true});shots.push(base+'_a4print.png');
   const pb=await V.locator('img').boundingBox();ok(label+' '+kind+': A4 출력 미디어에서 한 장에 꽉 차게 (같은 그림이라 도장 위치 같음)',Math.abs(pb.width-794)<3&&Math.abs(pb.height-1123)<3&&pb.x<1,JSON.stringify(pb));
   await vc.close()}
  const dls=await A.evaluate(()=>window.__dl.slice());if(ci===2){await A.locator('[data-certnow][data-t="재직증명서"]').first().click();await wait(2500);const d2=await A.evaluate(()=>window.__dl.slice());ok('같은 날 다시 발급하면 번호가 이어짐 (v0 → v1, 덮어쓰지 않음)',/ v0\.pdf$/.test(dls[0])&&/재직증명서 정진혁 .* v1\.pdf$/.test(d2[d2.length-1]),d2.join(' | '));const d=await D();ok('회사 기본 정보의 옛 값은 그대로 (자동으로 바뀌지 않음)',d['config/company']===undefined)}
  if(ci===3){const d=await D();ok('옛 ‘대표이사’ 칸 값(최윤수)은 지워지지 않고 그대로',d['config/company'].ceo==='최윤수'&&d['config/company'].ceos===undefined);
   await A.keyboard.press('Escape');await A.evaluate(()=>{location.hash='#forms'});await wait(900);const v=await A.locator('[data-co="ceos"]').inputValue().catch(()=>'');const v1=await A.locator('[data-co="ceo"]').inputValue().catch(()=>'');
   ok('회사 기본 정보에 ‘대표자 전원’ 칸 (기본 신혜현, 최윤수) · 옛 ‘대표이사’ 칸도 그대로',v==='신혜현, 최윤수'&&v1==='최윤수',v+' / '+v1);
   await A.locator('[data-co="ceos"]').fill('신혜현, 최윤수, 홍길동');await A.locator('[data-cosave]').first().click();await wait(900);const d3=await D();
   ok('저장: ceos 에 여러 명 · 옛 ceo·주소·사업자번호 그대로',d3['config/company'].ceos==='신혜현, 최윤수, 홍길동'&&d3['config/company'].ceo==='최윤수'&&d3['config/company'].addr==='경기도 시험시 시험로 1'&&d3['config/company'].bizno==='1234567890',JSON.stringify(d3['config/company']).slice(0,200));
   await A.evaluate(()=>{location.hash='#staff'});await wait(900);const sb=A.locator('details [data-cosave]');if(await sb.count()){await A.locator('details:has([data-sealup]) summary').click().catch(()=>{});await wait(200);await sb.first().click().catch(()=>{});await wait(900)}const d4=await D();
   ok('인사 관리 직인 칸의 ‘회사 정보 저장’을 눌러도 회사 정보가 비워지지 않음',d4['config/company'].ceos==='신혜현, 최윤수, 홍길동'&&d4['config/company'].addr==='경기도 시험시 시험로 1',JSON.stringify(d4['config/company']).slice(0,160))}
  await ctx.close()}
 ok('화면 오류 0건',!errs.length,errs.slice(0,3).join(' | '));
 console.log('\n스크린샷:\n'+shots.join('\n'));await b.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)})();
