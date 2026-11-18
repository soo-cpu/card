// 폐기물 기본값 시험 (v0.99-40, 2026-11-18 · 상세 자동견적 지시 2026-11-12 v1 2번): node intranet/tools/test/dq_waste_test.js [index.html]
// 단가표에서 '폐기물' 평당 1.5만~5만 줄을 싼 순으로 · 기본=1/4 · 중급=가운데 · 고급=3/4 · 없으면 빈 값(→ U0115 그대로) · 단가는 시험용 가짜
const fs=require('fs');const H=fs.readFileSync(process.argv[2]||__dirname+'/../../index.html','utf8');
const pick=re=>{const m=H.match(re);if(!m)throw new Error('못 찾음 '+re);return m[0]};
const src=pick(/const num=v=>\{[^\n]*/)+"\n"+pick(/function daWasteK\(c,g\)\{[\s\S]*?\n  if\(!W\.length\)[^\n]*\n/);
const daWasteK=new Function(src+";return daWasteK")();
let R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':x)};
const cols=["k","name","price"],C=items=>({cols,items});
const five=C([["W5","폐기물 처리 5",50000],["W1","폐기물 처리 1",15000],["W3","폐기물 처리 3",30000],["W2","폐기물 처리 2",25000],["W4","폐기물 처리 4",40000],["Z","철거 기본",20000],["W9","폐기물 큰 것",120000]]);
ok("기본 = 싼 쪽 1/4",daWasteK(five,0)==="W2",daWasteK(five,0));
ok("중급 = 가운데",daWasteK(five,1)==="W3",daWasteK(five,1));
ok("고급 = 비싼 쪽 3/4",daWasteK(five,2)==="W4",daWasteK(five,2));
ok("범위 밖(12만)·폐기물 아닌 줄은 안 고름",![0,1,2].map(g=>daWasteK(five,g)).some(k=>k==="W9"||k==="Z"));
ok("폐기물 줄 없으면 빈 값",daWasteK(C([["Z","철거",20000]]),1)==="");
ok("등급 값이 이상해도 멈추지 않음",daWasteK(five,undefined)==="W2"&&daWasteK(five,9)==="W4");
const t=R.filter(Boolean).length;console.log(`\n${t}/${R.length} 통과`);process.exit(t===R.length?0:1);
