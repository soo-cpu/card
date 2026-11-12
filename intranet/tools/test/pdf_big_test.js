const {chromium}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync((process.argv[2]||'/home/user/card/intranet/index.html'),'utf8');const MOCK=fs.readFileSync('/home/user/card/intranet/tools/test/mock.js','utf8');
const RULES=[["acct","owner","owner"],["acct/{self}","interact","interact"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["members","owner","owner"],["members/{self}","interact","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["work","interact","interact"],["projects","owner","owner"]].map(([path,read,write])=>({path,read,write}));
const SEED={"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r))},[SEED,RULES]);
const p=await ctx.newPage();await p.addInitScript(`window.__MOCKPDFDENY=true;window.__MOCKUSER={id:"u_cja",name:"채진아",email:"c@t",isOwner:false};`+MOCK);await p.goto('http://hf.test/');await new Promise(r=>setTimeout(r,6000));
await p.evaluate(()=>{location.hash="#approvals"});await new Promise(r=>setTimeout(r,1000));await p.locator('button').filter({hasText:'결재 올리기'}).first().click();await new Promise(r=>setTimeout(r,1000));
await p.setInputFiles('#fileIn',{name:'농협카드 명세서.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(461*1024,65)});
for(let i=0;i<12;i++){await new Promise(r=>setTimeout(r,700));const t=await p.locator('#fileList').innerText();if(/명세서\.pdf · /.test(t)){console.log('OK',t.replace(/\n/g,' / '));break}if(i===11)console.log('FAIL',t, await p.evaluate(()=>(document.querySelector('.toast')||{}).innerText))}
await b.close()})();
