// 유리문에 붙였을 때 모습 (그림 · 실제 사진 아님): node mock.js  — 유리문 900×2100mm 가정, 사람 키 170cm 옆에 세움
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');const img=f=>'data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'pdf',f)).toString('base64');
const S=0.42; // 1mm = 0.42px
const door=(k,mode,w,h,title)=>{const night=mode==='night',px=v=>v*S+'px';
 return `<div class="scene ${night?'n':''}"><h3>${title}</h3><div class="wall"><div class="door"><div class="glass"></div><img class="sheet${night?' glow':''}" src="${img('preview-'+k+'-'+mode+'.png')}" style="width:${px(w)};height:${px(h)};left:${px((900-w)/2)};top:${px(2100-1650-h/2+ (h>650?80:0))}"><div class="handle"></div><div class="dim">문 폭 900mm (가정)</div></div>
 <svg class="man" viewBox="0 0 60 170" style="height:${px(1700)}"><circle cx="30" cy="14" r="10"/><rect x="18" y="29" width="24" height="68" rx="10"/><rect x="19" y="95" width="10" height="74" rx="5"/><rect x="31" y="95" width="10" height="74" rx="5"/></svg></div><p>${night?'밤: 안쪽 A2 라이트패널(420×594mm)에 반투명 판':'낮: 유리 바깥에서 보이게 붙인 시트지('+w+'×'+h+'mm)'} · 가운데 높이 약 1.5m</p></div>`};
(async()=>{const b=await chromium.launch();const DW=+(process.env.DAY_W||500),DH=+(process.env.DAY_H||700);
 for(const k of ['A','B','C']){const pg=await b.newPage({viewport:{width:1560,height:1150}});
  await pg.setContent(`<html><body style="margin:0;font-family:sans-serif;background:#ece7df"><style>.row{display:flex;gap:30px;padding:26px;justify-content:center}.scene{background:#d8d2c8;padding:16px 26px 12px;border-radius:14px}.scene.n{background:#15171c;color:#eee}
  h3{margin:0 0 10px;font-size:20px}.wall{display:flex;align-items:flex-end;gap:26px}.door{position:relative;width:${900*S}px;height:${2100*S}px;border:9px solid #3b3d40;background:#3b3d40}.glass{position:absolute;inset:0;background:linear-gradient(135deg,#cfdde2,#a9bcc4 60%,#c3d2d8)}.n .glass{background:linear-gradient(135deg,#232a31,#12161b)}
  .sheet{position:absolute;box-shadow:0 1px 3px rgba(0,0,0,.25);object-fit:cover}.glow{box-shadow:0 0 60px 18px rgba(255,244,220,.55)}.handle{position:absolute;right:26px;top:${930*S}px;width:9px;height:${420*S}px;background:#8d9093;border-radius:5px}.dim{position:absolute;left:0;right:0;bottom:-30px;text-align:center;font-size:13px}
  .man{fill:#8a8f96;opacity:.8}.n .man{fill:#4a4f57}p{margin:36px 0 0;font-size:14px;max-width:${900*S+120}px}</style>
  <div class="row">${door(k,'day',DW,DH,'시안 '+k+' · 낮')}${door(k,'night',420,594,'시안 '+k+' · 밤')}</div><div style="text-align:center;font-size:13px;color:#555;padding-bottom:14px">그림으로 그린 예시입니다 (실제 매장 사진이 아니고, 문 크기 900×2100mm 는 가정). 재단선 바깥 여백은 실제로는 잘려 나갑니다.</div></body></html>`);
  await pg.screenshot({path:path.join(__dirname,'pdf','유리문에 붙인 모습 시안 '+k+'.png'),fullPage:true});await pg.close()}
 await b.close()})();
