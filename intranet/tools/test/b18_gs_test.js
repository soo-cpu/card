// 18번 A안: 간편견적 Apps Script 덧붙이기(sian_intranet.gs) 함수 단위 시험 — 가짜 DriveApp·UrlFetchApp·PropertiesService
// 실제 Gemini·드라이브는 부르지 않음. 실행: node intranet/tools/test/b18_gs_test.js
const fs=require("fs"),vm=require("vm"),crypto=require("crypto"),path=require("path");
const SRC=fs.readFileSync(path.join(__dirname,"../../apps-script/sian_intranet.gs"),"utf8");
let pass=0,fail=0;const ok=(c,m)=>{if(c){pass++}else{fail++;console.log("실패:",m)}};
const TOKEN="t".repeat(48);
function world(o){o=o||{};
  const props=Object.assign({IMG_TOKEN:TOKEN,GEMINI_API_KEY:"k-test"},o.props||{});
  let fid=0;const items={};
  function mkFolder(name,parent){const id="fo"+(++fid)+"xxxxxxxxxx";const f={kind:"folder",id,name,parents:parent?[parent]:[],files:[],folders:[]};items[id]=f;if(parent)parent.folders.push(f);return f}
  function mkFile(name,parent,mime,size){const id="fi"+(++fid)+"xxxxxxxxxx";const f={kind:"file",id,name,parents:[parent],mime:mime||"image/jpeg",size:size||1000,bytes:[1,2,3],desc:""};items[id]=f;parent.files.push(f);return f}
  const iter=a=>{let i=0;return {hasNext:()=>i<a.length,next:()=>a[i++]}};
  const wrapFo=f=>({getId:()=>f.id,getName:()=>f.name,getParents:()=>iter(f.parents.map(wrapFo)),getFolders:()=>iter(f.folders.map(wrapFo)),getFiles:()=>iter(f.files.map(wrapFi)),
    getFoldersByName:n=>iter(f.folders.filter(x=>x.name===n).map(wrapFo)),getFilesByName:n=>iter(f.files.filter(x=>x.name===n).map(wrapFi)),
    createFolder:n=>wrapFo(mkFolder(n,f)),createFile:b=>{const x=mkFile(b.name,f,b.mime,b.bytes.length);x.bytes=b.bytes;return wrapFi(x)}});
  const wrapFi=f=>({getId:()=>f.id,getName:()=>f.name,getParents:()=>iter(f.parents.map(wrapFo)),getMimeType:()=>f.mime,getSize:()=>f.size,getBlob:()=>({getBytes:()=>f.bytes}),setDescription:d=>{f.desc=d}});
  const root=mkFolder("인트라넷 첨부",null),other=mkFolder("다른 폴더",null);
  const proj=mkFolder("P-2611-001 시험 현장",root);
  const calls=[];let gem=o.gem||(()=>({code:200,body:{candidates:[{content:{parts:[{text:"ok"},{inlineData:{mimeType:"image/png",data:Buffer.from("PNG").toString("base64")}}]}}],usageMetadata:{promptTokenCount:10,candidatesTokenCount:20}}}));
  const ctx={console,JSON,Math,Date,String,Number,Object,Array,RegExp,Error,parseInt,Buffer,
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]===undefined?null:props[k],setProperty:(k,v)=>{props[k]=String(v)},deleteProperty:k=>{delete props[k]},getProperties:()=>Object.assign({},props)})},
    LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},
    CacheService:{getScriptCache:()=>({get:()=>null,put:()=>{},remove:()=>{}})},
    Utilities:{Charset:{UTF_8:"UTF-8"},computeHmacSha256Signature:(v,k)=>Array.from(crypto.createHmac("sha256",k).update(v,"utf8").digest()).map(b=>b>127?b-256:b),
      base64Encode:b=>Buffer.from(b.map?b.map(x=>x<0?x+256:x):b).toString("base64"),base64Decode:s=>Array.from(Buffer.from(s,"base64")),
      newBlob:(bytes,mime,name)=>({bytes,mime,name}),formatDate:(d,tz,f)=>new Date(d.getTime()+9*36e5).toISOString().slice(0,10)},
    DriveApp:{getFolderById:id=>{const f=items[id];if(!f||f.kind!=="folder")throw new Error("no folder");return wrapFo(f)},getFileById:id=>{const f=items[id];if(!f||f.kind!=="file")throw new Error("no file");return wrapFi(f)}},
    UrlFetchApp:{fetch:(url,opt)=>{calls.push({url,opt,body:JSON.parse(opt.payload)});const r=gem(calls.length,JSON.parse(opt.payload));return {getResponseCode:()=>r.code,getContentText:()=>JSON.stringify(r.body||{})}}},
    ContentService:{MimeType:{JSON:"json"},createTextOutput:t=>({t,setMimeType(){return this}})},
    HtmlService:{createHtmlOutput:h=>({h,setTitle(){return this},addMetaTag(){return this}})},
    Logger:{log:x=>{ctx.__log=x}}};
  props.ISIAN_ROOT=root.id;
  vm.createContext(ctx);vm.runInContext(SRC,ctx);
  return {ctx,props,items,root,proj,other,mkFile,mkFolder,calls}}
const day=new Date(Date.now()+9*36e5).toISOString().slice(0,10);
const tk=(uid,d,tok)=>crypto.createHmac("sha256",tok||TOKEN).update("isian|"+uid+"|"+(d||day),"utf8").digest("hex").slice(0,32);
let rn=0;const rid=()=>"r"+(++rn).toString().padStart(6,"0");
const Q=(w,o)=>Object.assign({k:tk("u_jung"),u:"u_jung",d:day,p:"P-2611-001",n:"시험 현장",f:w.proj.id,sp:"거실",st:"모던",mt:"white oak wood",ex:"아일랜드 식탁",prompt:"",by:"정진혁",rid:rid()},o||{});

// 1. 입장권: 인트라넷(브라우저 HMAC) 계산과 같음
{const w=world();ok(w.ctx.isianTicket_("u_jung",day)===tk("u_jung"),"입장권 계산이 브라우저와 같아야 함");
 const r=w.ctx.isianRun_(Q(w));ok(r.ok,"정상 요청 성공 "+JSON.stringify(r).slice(0,200));
 ok(r.name==="시안 P-2611-001 "+day+" v0.png","이름 v0: "+r.name);
 const r2=w.ctx.isianRun_(Q(w));ok(r2.ok&&r2.name==="시안 P-2611-001 "+day+" v1.png","두 번째 v1: "+r2.name);
 const sub=w.proj.folders.find(x=>x.name==="시안 이미지");ok(sub&&sub.files.length===2,"프로젝트 폴더 › 시안 이미지에 2장");
 const ds=JSON.parse(sub.files[0].desc);ok(ds.engine==="gemini"&&ds.space==="거실"&&ds.style==="모던"&&ds.by==="정진혁","설명 JSON");
 // Gemini 요청 형식 (간편견적 v12 와 같음)
 const b=w.calls[0].body;ok(/v1beta\/models\/.+:generateContent$/.test(w.calls[0].url),"주소 형식 "+w.calls[0].url);
 ok(w.calls[0].opt.headers["x-goog-api-key"]==="k-test"&&!/k-test/.test(w.calls[0].url),"키는 머리글로만");
 ok(b.generationConfig.responseModalities.join()==="TEXT,IMAGE"&&b.generationConfig.imageConfig.aspectRatio==="4:3","generationConfig");
 ok(b.contents[0].parts[0].text.includes("living room")&&b.contents[0].parts[0].text.includes("아일랜드 식탁"),"프롬프트(입력 글로 만듦)");
 ok(!JSON.stringify(b).includes(TOKEN),"Gemini 로 토큰 안 보냄");}
// 2. 입장권 틀림·날짜 틀림·다른 사람 입장권·토큰 없음
{const w=world();
 ok(w.ctx.isianRun_(Q(w,{k:"0".repeat(32)})).code==="ticket","틀린 입장권 거절");
 ok(w.ctx.isianRun_(Q(w,{k:tk("u_lee")})).code==="ticket","다른 사람 입장권 거절");
 const y=new Date(Date.now()+9*36e5-864e5).toISOString().slice(0,10);ok(w.ctx.isianRun_(Q(w,{d:y,k:tk("u_jung",y)})).code==="ticket_day","어제 입장권 거절");
 ok(w.ctx.isianRun_(Q(w,{k:tk("u_jung",day,"x".repeat(48))})).code==="ticket","다른 토큰으로 만든 입장권 거절");
 ok(w.calls.length===0,"거절 때 Gemini 안 부름");
 const w2=world({props:{IMG_TOKEN:null}});ok(w2.ctx.isianRun_(Q(w2)).code==="no_token","토큰 없으면 거절");
 ok(w.ctx.isianRun_(Q(w,{p:"P-26"})).code==="bad_project","프로젝트 번호 형식");}
// 3. 입력 사진: 프로젝트 폴더 안만, 사진만, 크기, 순서·종류
{const w=world();const a=w.mkFile("현장 거실.jpg",w.proj,"image/jpeg",2000),pl=w.mkFile("평면도.png",w.proj,"image/png",3000),out=w.mkFile("남의 파일.jpg",w.other,"image/jpeg",100),pdf=w.mkFile("도면.pdf",w.proj,"application/pdf",100),big=w.mkFile("큰 사진.jpg",w.proj,"image/jpeg",5*1024*1024);
 const r=w.ctx.isianRun_(Q(w,{img:pl.id+","+a.id,kd:"p,s"}));ok(r.ok,"사진 2장 성공");
 const parts=w.calls[0].body.contents[0].parts;ok(parts.length===3&&parts[1].inline_data.mime_type==="image/png"&&parts[2].inline_data.mime_type==="image/jpeg","inline_data 순서");
 ok(/image 1 is the floor plan/.test(parts[0].text)&&/image 2 is a photo of the actual site/.test(parts[0].text),"도면/현장 사진 설명");
 const before=w.props["isian:"+day];
 ok(w.ctx.isianRun_(Q(w,{img:out.id,kd:"s"})).code==="img_outside","폴더 밖 파일 거절");
 ok(w.ctx.isianRun_(Q(w,{img:pdf.id,kd:"p"})).code==="img_type","PDF 거절");
 ok(w.ctx.isianRun_(Q(w,{img:big.id,kd:"s"})).code==="img_big","4MB 넘으면 거절");
 ok(JSON.parse(w.props["isian:"+day]).t===JSON.parse(before).t,"실패한 장은 횟수 되돌림");
 ok(w.calls.length===1,"사진 거절 때 Gemini 안 부름");
 const sub2=w.mkFolder("현장 사진",w.proj),deep=w.mkFile("하위.jpg",sub2,"image/jpeg",100);ok(w.ctx.isianRun_(Q(w,{img:deep.id,kd:"s"})).ok,"프로젝트 하위 폴더 사진 허용");
 const ids=[1,2,3,4,5].map(i=>w.mkFile("s"+i+".jpg",w.proj,"image/jpeg",100).id);w.calls.length=0;ok(w.ctx.isianRun_(Q(w,{img:ids.join(","),kd:"s,s,s,s,s"})).ok&&w.calls[0].body.contents[0].parts.length===5,"최대 4장만");}
// 4. 하루 한도 (프로젝트 10 · 사람 15 · 전체 30) · 같은 요청 ID 한 번 · 손님 'sian:' 카운터와 따로
{const w=world({props:{ISIAN_PROJ_MAX:"2",ISIAN_USER_MAX:"3",ISIAN_DAY_MAX:"4",["sian:"+day]:'{"t":30,"d":{}}'}});
 ok(w.ctx.isianRun_(Q(w)).ok&&w.ctx.isianRun_(Q(w)).ok,"한도 안 2장");ok(w.ctx.isianRun_(Q(w)).code==="limit_project","프로젝트 한도");
 w.mkFolder("P-2611-002 다른 현장",w.root);ok(w.ctx.isianRun_(Q(w,{p:"P-2611-002",f:""})).ok,"다른 프로젝트는 됨 (이름으로 폴더 찾음)");
 ok(w.ctx.isianRun_(Q(w,{p:"P-2611-003",f:""})).code==="limit_user","사람 한도");
 ok(w.ctx.isianRun_(Q(w,{p:"P-2611-003",f:"",u:"u_lee",k:tk("u_lee")})).ok,"다른 사람은 됨");
 ok(w.ctx.isianRun_(Q(w,{p:"P-2611-004",f:"",u:"u_chae",k:tk("u_chae")})).code==="limit_total","전체 한도");
 ok(w.props["sian:"+day]==='{"t":30,"d":{}}',"손님 카운터는 그대로 (손님이 30장 써도 인트라넷은 따로)");
 const w2=world();const q=Q(w2);ok(w2.ctx.isianRun_(q).ok,"첫 요청");ok(w2.ctx.isianRun_(Object.assign({},q)).code==="dup","같은 요청 ID 거절");
 ok(w2.root.folders.some(x=>x.name==="P-2611-001 시험 현장"),"폴더 있음");const w3=world();ok(w3.ctx.isianRun_(Q(w3,{p:"P-2611-009",f:"",n:"새 현장"})).ok&&w3.root.folders.some(x=>x.name==="P-2611-009 새 현장"),"폴더 없으면 첨부 폴더 안에 새로");
 const w4=world();const r4=w4.ctx.isianRun_(Q(w4,{f:w4.other.id}));ok(r4.ok&&w4.proj.folders.some(x=>x.name==="시안 이미지")&&!w4.other.folders.length,"첨부 폴더 밖 폴더 ID 는 무시");}
// 5. Gemini 실패: 400 → 비율 빼고 다시 · 500 → 이유 JSON·횟수 되돌림 · 그림 없음
{let n=0;const w=world({gem:(i,b)=>{n++;return i===1?{code:400,body:{error:{message:"bad imageConfig"}}}:{code:200,body:{candidates:[{content:{parts:[{inline_data:{mime_type:"image/png",data:"UE5H"}}]}}]}}}});
 ok(w.ctx.isianRun_(Q(w)).ok&&w.calls.length===2&&!w.calls[1].body.generationConfig.imageConfig,"400 이면 비율 빼고 다시");
 const w2=world({gem:()=>({code:500,body:{error:{message:"server"}}})});const r=w2.ctx.isianRun_(Q(w2));ok(!r.ok&&r.code==="gemini_500"&&/Gemini .* 500/.test(r.error),"500 이유");
 ok(JSON.parse(w2.props["isian:"+day]).t===0,"실패는 횟수 안 셈");ok(!w2.proj.folders.length,"실패 때 파일 안 만듦");
 const w3=world({gem:()=>({code:200,body:{candidates:[{finishReason:"SAFETY",content:{parts:[{text:"no"}]}}]}})});const r3=w3.ctx.isianRun_(Q(w3));ok(r3.code==="no_image"&&/SAFETY/.test(r3.error),"그림 없음 이유");
 const w4=world({props:{GEMINI_API_KEY:null}});ok(w4.ctx.isianRun_(Q(w4)).code==="no_key","키 없음");}
// 6. 새 탭 GET / JSON / 같은 이름 있으면 다음 번호 / 모델 고정
{const w=world({props:{ISIAN_MODEL:"models/gemini-x-image"}});const page=w.ctx.isianDoGet_({parameter:Q(w)});ok(/시안 이미지를 만들었어요/.test(page.h)&&/data:image\/png;base64,/.test(page.h)&&/결과 불러오기/.test(page.h),"성공 화면");
 ok(/models\/gemini-x-image:generateContent/.test(w.calls[0].url),"ISIAN_MODEL 고정");
 const j=w.ctx.isianDoGet_({parameter:Q(w,{fmt:"json",k:"bad"})});const o=JSON.parse(j.t);ok(o.ok===false&&o.code==="ticket"&&!("b64" in o),"JSON 실패 이유");
 const j2=JSON.parse(w.ctx.isianDoGet_({parameter:Q(w,{fmt:"json"})}).t);ok(j2.ok&&!j2.b64&&j2.fileId,"JSON 성공(그림 데이터 빼고)");
 const sub=w.proj.folders.find(x=>x.name==="시안 이미지");w.mkFile("시안 P-2611-001 "+day+" v7.png",sub,"image/png",1);ok(w.ctx.isianRun_(Q(w)).name==="시안 P-2611-001 "+day+" v8.png","가장 큰 번호 + 1");
 const fp=w.ctx.isianDoGet_({parameter:Q(w,{k:"bad"})});ok(/만들지 못했어요/.test(fp.h)&&!fp.h.includes(TOKEN),"실패 화면에 토큰 없음");
 w.ctx.isianCheck();ok(/IMG_TOKEN: 있음/.test(w.ctx.__log)&&!w.ctx.__log.includes(TOKEN),"확인 함수 (값은 안 보임)");}
// 7. 코드에 비밀값 없음
ok(!/AIza[0-9A-Za-z_-]{20,}/.test(SRC)&&!/IMG_TOKEN\s*=\s*['"]/.test(SRC),"코드에 키·토큰 값 없음");
console.log("b18 Apps Script 시험: 통과 "+pass+" · 실패 "+fail);process.exitCode=fail?1:0;
