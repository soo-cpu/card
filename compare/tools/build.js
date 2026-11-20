const fs=require('fs'),Q=require('../engine.js');
const ex={title:'예시 — 시험1 24평 견적 (고객 이름 가림)', q:JSON.parse(fs.readFileSync('work/read_1.json','utf8'))};
let h=fs.readFileSync('page.tpl.html','utf8');
const sub=(k,v)=>{ h=h.split(k).join(v); };
sub('__VERSION__',Q.VERSION); sub('__BASE__',Q.BASE_NAME);
h=h.replace('__ENGINE__',()=>fs.readFileSync('base-data.js','utf8')+'\n'+fs.readFileSync('engine.js','utf8')).replace('__DOCS__',()=>fs.readFileSync('docs.js','utf8')).replace('__EXAMPLE__',()=>JSON.stringify(ex));
fs.writeFileSync('work/타사 견적 비교기.html',h);
// reviewer on the page itself: 화면 글자에 원가·마진이 있으면 안 됨 (코드 속 금지어 목록은 제외)
const vis=h.replace(/<script[\s\S]*?<\/script>/g,' ');
console.log('page bytes',h.length,'visible review',JSON.stringify(Q.review(vis)));
