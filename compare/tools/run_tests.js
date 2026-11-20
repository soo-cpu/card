// 시험: 읽기 결과 3건 → 비교 → 문서 → reviewer. 결과 JSON + 고객용 PDF + 메모 md
const fs=require('fs'),Q=require('../engine.js'),D=require('../docs.js'),{chromium}=require('playwright');
const T=[
 {n:1,name:'시험1 — 24평 · PDF 13쪽 (2026년 견적)',input:'시험1_24평_PDF_가림.pdf',src:{직접공사비:51928620,총액:55000000}},
 {n:2,name:'시험2 — 34평 · PDF 21쪽 (2026년 견적)',input:'시험2_34평_PDF_가림.pdf',src:{직접공사비:63269030,총액:64000000}},
 {n:3,name:'시험3 — 31평 · 휴대폰 사진 22장 (2025년 견적)',input:'시험3_사진_가림/사진01~22.jpg',src:{직접공사비:58481741,총액:59900000}},
];
const EXTRA=fs.existsSync('work/banned-nums.json')?JSON.parse(fs.readFileSync('work/banned-nums.json','utf8')):[];
(async()=>{
 fs.mkdirSync('work/out',{recursive:true}); const b=await chromium.launch(); const res=[];
 for(const t of T){ if(!fs.existsSync('work/read_'+t.n+'.json')) continue;
  const q=JSON.parse(fs.readFileSync('work/read_'+t.n+'.json','utf8'));
  const lineSum=q.lines.reduce((a,l)=>a+(Number(l.금액)||0),0), secSum=q.공정합계.reduce((a,s)=>a+(Number(s.금액)||0),0);
  const r=Q.compare(q,{}); const meta={title:'시험'+t.n,date:'2026-11-21'}; const g=D.gate(r,meta,EXTRA);
  fs.writeFileSync(`work/out/시험${t.n} 고객용 한 장.html`,g.customer); fs.writeFileSync(`work/out/시험${t.n} 직원용 메모.md`,g.memo);
  const p=await b.newPage(); await p.setContent(g.customer); await p.pdf({path:`work/out/시험${t.n} 고객용 한 장.pdf`,format:'A4',printBackground:true,margin:{top:'0',bottom:'0',left:'0',right:'0'}});
  const pages=await p.evaluate(()=>Math.ceil(document.body.scrollHeight/(1123-90))); await p.close();
  res.push({...t,평형:r.평형,vat:r.vat,lines:q.lines.length,lineSum,secSum,읽기일치:lineSum===t.src.직접공사비&&secSum===t.src.직접공사비,총액일치:q.총액===t.src.총액,
   totals:Object.fromEntries(Object.entries(r.totals).map(([k,v])=>[k,Math.round(v)])),counts:r.counts,
   findings:r.findings.map(f=>({level:f.level,kind:f.kind,title:f.title,say:f.say,info:!!f.info})),gate:{pass:g.pass,hits:g.hits},읽기메모:q.읽기메모,custPages:pages});
 }
 // reviewer 자체 시험: 일부러 원가·마진을 넣은 문서는 반드시 반려돼야 함
 const FAKE=['999.9%'];  // 가짜 숫자: 숫자 검사가 도는지만 확인 (실제 내부 숫자는 work/banned-nums.json)
 const neg=['고객님, 이 공정 원가는 낮아요','마진 30%','<p>margin</p>','내부 숫자 999.9%'].map(s=>({s,pass:Q.review(s,EXTRA.concat(FAKE)).pass}));
 fs.writeFileSync('work/out/test_results.json',JSON.stringify({res,neg},null,1)); await b.close();
 res.forEach(x=>console.log(x.n,x.평형,x.vat,'lines',x.lines,'읽기일치',x.읽기일치,'총액',x.총액일치,'gate',x.gate.pass,JSON.stringify(x.counts),'pages',x.custPages));
 console.log('neg',JSON.stringify(neg));
})();
