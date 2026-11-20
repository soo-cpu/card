// 사무실 유리문 QR 시안 만들기: node make.js  (시안 3개 × 낮용 시트지 판·밤용 A2 라이트패널 판 → PDF·미리 보기 PNG)
// 실제 크기 + 재단 여유 3mm + 재단선. QR 주소는 인쇄 뒤 바꾸지 않음 (현장 코드 OFFICE)
const fs=require('fs'),path=require('path');const NPM=process.env.NPM_DIR||path.join(__dirname,'node_modules');
const QR=require(path.join(NPM,'qrcode'));const {chromium}=require('playwright');
const b64=f=>fs.readFileSync(f).toString('base64');
const font=(fam,w,f)=>`@font-face{font-family:"${fam}";font-weight:${w};src:url(data:font/woff2;base64,${b64(path.join(NPM,f))}) format("woff2")}`;
const korSerif=w=>fs.readdirSync(path.join(NPM,'@fontsource/noto-serif-kr/files')).filter(f=>new RegExp('^noto-serif-kr-(\\d+|latin)-'+w+'-normal\\.woff2$').test(f));
const URLS={est:'https://soo-cpu.github.io/card/event/?src=OFFICE&go=est',ask:'https://soo-cpu.github.io/card/event/?src=OFFICE'};
const qrSvg=(url,dark,light)=>{const q=QR.create(url,{errorCorrectionLevel:'Q'}),n=q.modules.size,d=q.modules.data;let p='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(d[y*n+x])p+=`M${x+4} ${y+4}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n+8} ${n+8}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${light}"/><path d="${p}" fill="${dark}"/></svg>`};
const mark=c=>`data:image/png;base64,${b64(path.join(__dirname,'mark-'+c+'.png'))}`;
// 문구 (한 줄씩 · 이모지 없음)
const T={brand:'ARTICO STUDIO',brandKo:'아르띠꼬 스튜디오',head:'문이 닫혀 있어도 상담은 열려 있습니다',q1:'우리 집 견적 10초 확인',q1s:'평수만 넣으면 예상 금액이 나옵니다',q2:'상담 문의 남기기',q2s:'주말·부재중에도 접수됩니다',cam:'휴대폰 카메라로 비춰 주세요',telL:'대표번호',tel:'1566-5904',hours:'평일 9시 ~ 18시 · 저녁과 주말은 예약제'};
// 시안 3개. day = 낮용 시트지(유리 바깥에서 보는 면), night = 밤용 A2 반투명 판(안쪽 LED 라이트패널 위)
const DESIGNS={
 A:{name:'웜 베이지',day:{bg:'#f5f0e8',ink:'#2a2420',sub:'#7d7065',pt:'#9a7b56',card:'#ffffff',cardInk:'#2a2420',line:'#d9cebf',mark:'ink',tel:'#2a2420'},
    night:{bg:'#2a2420',ink:'#ffffff',sub:'#e6dccd',pt:'#e0c39a',card:'#ffffff',cardInk:'#2a2420',line:'#5b4a3a',mark:'white',tel:'#ffffff'}},
 B:{name:'딥 브라운',day:{bg:'#7a5f3f',ink:'#fbf8f3',sub:'#efe6d8',pt:'#f0dcc0',card:'#ffffff',cardInk:'#2a2420',line:'#9a7b56',mark:'white',tel:'#ffffff'},
    night:{bg:'#3a2c1e',ink:'#ffffff',sub:'#efe6d8',pt:'#f0dcc0',card:'#ffffff',cardInk:'#2a2420',line:'#7a5f3f',mark:'white',tel:'#ffffff'}},
 C:{name:'유리 살린 최소형',day:{bg:'#ffffff',ink:'#2a2420',sub:'#5d534a',pt:'#7a5f3f',card:'#ffffff',cardInk:'#2a2420',line:'#2a2420',mark:'ink',tel:'#2a2420',frame:1},
    night:{bg:'#ffffff',ink:'#1b1714',sub:'#3d342d',pt:'#5c4630',card:'#ffffff',cardInk:'#1b1714',line:'#1b1714',mark:'ink',tel:'#1b1714',frame:1}}};
const SIZES={day:{w:+(process.env.DAY_W||500),h:+(process.env.DAY_H||700),label:'낮용 시트지 판'},night:{w:420,h:594,label:'밤용 A2 라이트패널 반투명 판'}};
const BLEED=3,MARK=8; // 재단 여유 3mm, 재단선 자리 8mm
function page(key,mode){const D=DESIGNS[key][mode],Z=SIZES[mode],W=Z.w,H=Z.h,u=W/500; // u = 500mm 폭 기준 배율
  const PW=W+(BLEED+MARK)*2,PH=H+(BLEED+MARK)*2,o=MARK,t=MARK+BLEED;
  const crop=[];[[t,t,-1,-1],[t+W,t,1,-1],[t,t+H,-1,1],[t+W,t+H,1,1]].forEach(([x,y,sx,sy])=>{crop.push(`<line x1="${x+sx*(BLEED+1)}" y1="${y}" x2="${x+sx*(BLEED+MARK)}" y2="${y}"/><line x1="${x}" y1="${y+sy*(BLEED+1)}" x2="${x}" y2="${y+sy*(BLEED+MARK)}"/>`)});
  const qw=172*u,card=(q,l,s,url)=>`<div class="card"><div class="no">${q}</div><div class="qr">${qrSvg(url,'#000000','#ffffff')}</div><b>${l}</b><span>${s}</span></div>`;
  return {PW,PH,html:`<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
${font('Pretendard',400,'pretendard/dist/web/static/woff2/Pretendard-Regular.woff2')}${font('Pretendard',600,'pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2')}${font('Pretendard',800,'pretendard/dist/web/static/woff2/Pretendard-ExtraBold.woff2')}
${font('Cormorant',500,'@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2')}
@page{size:${PW}mm ${PH}mm;margin:0}*{box-sizing:border-box}html,body{margin:0}body{width:${PW}mm;height:${PH}mm;position:relative;font-family:Pretendard,sans-serif;word-break:keep-all;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}
.bleed{position:absolute;left:${o}mm;top:${o}mm;width:${W+BLEED*2}mm;height:${H+BLEED*2}mm;background:${D.bg}}
.art{position:absolute;left:${t}mm;top:${t}mm;width:${W}mm;height:${H}mm;color:${D.ink};display:flex;flex-direction:column;align-items:center;text-align:center;padding:${36*u}mm ${24*u}mm ${32*u}mm}
${D.frame?`.art::before{content:"";position:absolute;inset:${12*u}mm;border:${1.6*u}mm solid ${D.line}}`:''}
.logo{display:flex;align-items:center;gap:${7*u}mm}.logo img{height:${34*u}mm}.logo div{text-align:left}
.logo b{display:block;font-family:Cormorant,serif;font-weight:500;letter-spacing:.3em;font-size:${33*u}pt;line-height:1.1}.logo span{display:block;font-size:${16*u}pt;letter-spacing:.14em;color:${D.sub};margin-top:${1.5*u}mm}
h1{font-weight:800;font-size:${78*u}pt;line-height:1.2;margin:auto 0 0;white-space:nowrap;letter-spacing:-.01em}
.cam{font-size:${29*u}pt;color:${D.pt};font-weight:600;margin:${7*u}mm 0 0;letter-spacing:.02em}
.cards{display:flex;gap:${12*u}mm;margin-top:auto}
.card{width:${214*u}mm;background:${D.card};color:${D.cardInk};border-radius:${8*u}mm;padding:${12*u}mm ${10*u}mm ${11*u}mm;position:relative;${D.frame?`border:${1.6*u}mm solid ${D.line};`:''}}
.card .qr{width:${qw}mm;height:${qw}mm;margin:0 auto}.card .qr svg{display:block;width:100%;height:100%}
.card b{display:block;font-weight:800;font-size:${36*u}pt;margin-top:${7*u}mm;white-space:nowrap;letter-spacing:-.02em}.card span{display:block;font-size:${18*u}pt;color:#5d534a;margin-top:${2.5*u}mm;white-space:nowrap}
.card .no{position:absolute;left:${9*u}mm;top:${8*u}mm;width:${13*u}mm;height:${13*u}mm;border-radius:50%;background:${D.cardInk};color:#fff;font-weight:800;font-size:${17*u}pt;line-height:${13*u}mm}
.tel{margin-top:auto}.tel small{display:block;font-size:${26*u}pt;font-weight:600;letter-spacing:.3em;color:${D.pt}}
.tel b{display:block;font-weight:800;font-size:${170*u}pt;line-height:1.05;letter-spacing:.01em;color:${D.tel};white-space:nowrap}
.hours{font-size:${26*u}pt;color:${D.sub};margin-top:${5*u}mm;white-space:nowrap}
svg.crop{position:absolute;left:0;top:0;width:${PW}mm;height:${PH}mm}svg.crop line{stroke:#000;stroke-width:.25}
</style></head><body><div class="bleed"></div><div class="art">
<div class="logo"><img src="${mark(D.mark)}" alt=""><div><b>${T.brand}</b><span>${T.brandKo}</span></div></div>
<h1>${T.head}</h1><p class="cam">${T.cam}</p>
<div class="cards">${card(1,T.q1,T.q1s,URLS.est)}${card(2,T.q2,T.q2s,URLS.ask)}</div>
<div class="tel"><small>${T.telL}</small><b>${T.tel}</b></div><p class="hours">${T.hours}</p>
</div><svg class="crop" viewBox="0 0 ${PW} ${PH}">${crop.join('')}</svg></body></html>`}}
(async()=>{const out=path.join(__dirname,'pdf');fs.mkdirSync(out,{recursive:true});const b=await chromium.launch();const made=[];
 for(const k of Object.keys(DESIGNS))for(const m of ['day','night']){const P=page(k,m),Z=SIZES[m],name=`사무실 유리문 QR 시안 ${k} ${m==='day'?'낮용 시트지 '+Z.w+'x'+Z.h+'mm':'밤용 A2 라이트패널 420x594mm'}`;
  const pg=await b.newPage({viewport:{width:Math.round(P.PW*3.78),height:Math.round(P.PH*3.78)}});await pg.setContent(P.html,{waitUntil:'load'});await pg.evaluate(()=>document.fonts.ready);
  await pg.pdf({path:path.join(out,name+'.pdf'),width:P.PW+'mm',height:P.PH+'mm',printBackground:true,preferCSSPageSize:true});
  await pg.screenshot({path:path.join(out,`preview-${k}-${m}.png`)});made.push(name);await pg.close()}
 console.log(made.join('\n'));await b.close()})();
