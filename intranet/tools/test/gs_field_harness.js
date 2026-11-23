// 현장소통 서버(intranet/field-script/Code.gs)를 Node 에서 그대로 돌려 보는 시험 틀 (2026-11-19, v0.99-40)
// Apps Script 의 Utilities·CacheService·PropertiesService·LockService·SpreadsheetApp·DriveApp·ContentService 를 흉내 냄 — 실제 시트·드라이브는 건드리지 않음
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),path=require('path');
module.exports=function makeServer(opt){opt=opt||{};
  const src=fs.readFileSync(opt.file||path.join(__dirname,'../../field-script/Code.gs'),'utf8');
  const st={now:0,props:Object.assign({},opt.props||{}),cache:{},sheets:{},locks:0,mails:[]};  // v5(2026-11-23): setProperty·MailApp 흉내 더함
  const sb=a=>Array.from(a,b=>b>127?b-256:b),ub=a=>Buffer.from(Array.from(a,b=>b&255));
  const Utilities={
    computeHmacSha256Signature:(v,k)=>sb(crypto.createHmac('sha256',Buffer.from(String(k),'utf8')).update(Buffer.from(String(v),'utf8')).digest()),
    computeDigest:(alg,v)=>sb(crypto.createHash('sha256').update(String(v)).digest()),DigestAlgorithm:{SHA_256:1},
    base64EncodeWebSafe:b=>ub(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_'),
    base64DecodeWebSafe:s=>{if(/[^A-Za-z0-9_=-]/.test(s)||s.length%4)throw new Error('bad base64');return sb(Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'),'base64'))},
    base64Encode:b=>ub(b).toString('base64'),base64Decode:s=>sb(Buffer.from(s,'base64')),
    newBlob:(b,t,n)=>({getDataAsString:()=>ub(b).toString('utf8'),getBytes:()=>b,getContentType:()=>t||'',setName(){return this}}),
    getUuid:()=>crypto.randomUUID(),
    formatDate:(d,tz,f)=>{const x=new Date(d.getTime()+9*36e5).toISOString();return f==='yyyy-MM-dd'?x.slice(0,10):f==='yyyy-MM'?x.slice(0,7):x.slice(0,19).replace('T',' ')}};
  const cacheObj={get:k=>{const e=st.cache[k];if(!e)return null;if(e.exp<=Date.now()+st.now){delete st.cache[k];return null}return e.v},put:(k,v,ttl)=>{st.cache[k]={v:String(v),exp:Date.now()+st.now+(ttl||600)*1000}}};
  function sheet(name){const rows=[];const sh={name,rows,getLastRow:()=>rows.length,setFrozenRows(){},
    getRange(r,c,nr,nc){nr=nr||1;nc=nc||1;const R={setNumberFormat:()=>R,setFontWeight:()=>R,setBackground:()=>R,
      setValues(v){for(let i=0;i<nr;i++){rows[r-1+i]=rows[r-1+i]||[];for(let j=0;j<nc;j++)rows[r-1+i][c-1+j]=String(v[i][j])}return R},
      setValue(v){rows[r-1]=rows[r-1]||[];rows[r-1][c-1]=String(v);return R},
      getDisplayValues(){const o=[];for(let i=0;i<nr;i++){const a=[];for(let j=0;j<nc;j++)a.push(String((rows[r-1+i]||[])[c-1+j]||''));o.push(a)}return o}};return R}};return sh}
  const ss={getSheetByName:n=>st.sheets[n]||null,insertSheet:n=>(st.sheets[n]=sheet(n)),getId:()=>'ss'};
  let fid=0;const folder=n=>({getId:()=>'folder'+(++fid),getUrl:()=>'https://drive.test/f',getName:()=>n,createFolder:x=>folder(x),getFoldersByName:()=>({hasNext:()=>false}),getFiles:()=>({hasNext:()=>false}),createFile:()=>({getId:()=>'file'+(++fid),getUrl:()=>'https://drive.test/x'})});
  const ctx={Utilities,CacheService:{getScriptCache:()=>cacheObj},PropertiesService:{getScriptProperties:()=>({getProperty:k=>st.props[k]===undefined?null:st.props[k],setProperty:(k,v)=>{st.props[k]=String(v)}})},MailApp:{sendEmail:(to,subj,body)=>{if(st.mailFail)throw new Error('mail fail');st.mails.push({to,subj,body})}},
    LockService:{getScriptLock:()=>({waitLock(){st.locks++},releaseLock(){st.locks--}})},SpreadsheetApp:{openById:()=>ss,getActiveSpreadsheet:()=>ss,flush:()=>{st.flushes=(st.flushes||0)+1}},
    DriveApp:{getFolderById:id=>folder(id),getFileById:()=>{throw new Error('no file')},getFilesByName:()=>({hasNext:()=>false}),getRootFolder:()=>folder('root')},
    ContentService:{createTextOutput:t=>({text:t,setMimeType(){return this}}),MimeType:{JSON:'json'}},UrlFetchApp:{fetch:()=>{throw new Error('no net')}},ScriptApp:{getOAuthToken:()=>''},console};
  vm.createContext(ctx);vm.runInContext(src,ctx,{filename:'Code.gs'});
  const post=o=>JSON.parse(ctx.doPost({postData:{contents:typeof o==='string'?o:JSON.stringify(o)}}).text);
  const rowsOf=n=>(st.sheets[n]?st.sheets[n].rows.slice(1):[]);
  return {post,st,ctx,rowsOf,advance:ms=>{st.now+=ms},setProp:(k,v)=>{if(v===undefined)delete st.props[k];else st.props[k]=v},
    setPw:pw=>{post({a:'login',pw:'x-init'});const sh=st.sheets['설정'];const r=sh.rows.find(x=>x&&x[0]==='관리 비밀번호');r[1]=pw;delete st.cache.pwfail},
    ticket:(key,o)=>{o=o||{};const b=x=>Buffer.from(x).toString('base64url');const msg=(o.ts||Date.now())+'.'+(o.who64||b(o.who||'정진혁'))+'.'+(o.nonce||crypto.randomBytes(16).toString('base64url'));return msg+'.'+crypto.createHmac('sha256',key).update(msg).digest('base64url')}}};
