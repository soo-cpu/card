(()=>{const U=window.__MOCKUSER;const BC=new BroadcastChannel("mockdb");const LK="mockdb";
const RULES=JSON.parse(localStorage.getItem("mockrules")||"[]");
const lv={view:1,interact:2,admin:3,owner:4};const myLv=U.isOwner?4:2;
const ld=()=>{try{return JSON.parse(localStorage.getItem(LK)||"{}")}catch(e){return {}}};
const sv=o=>localStorage.setItem(LK,JSON.stringify(o));
function rule(path,op){const seg=path.split("/");let best=null,bl=-1;RULES.forEach(r=>{const rs=r.path.split("/");if(rs.length>seg.length)return;for(let i=0;i<rs.length;i++){if(rs[i]==="{self}"){if(seg[i]!==U.id)return}else if(rs[i]!==seg[i])return}if(rs.length>bl){bl=rs.length;best=r}});const need=best?best[op]:(op==="read"?"view":"interact");return myLv>=lv[need]}
window.__mockDenied=[];
const listeners=[];
function snapCol(path){const D=ld(),n=path.split("/").length+1;const docs=Object.keys(D).filter(k=>k.startsWith(path+"/")&&k.split("/").length===n).map(k=>({id:k.split("/").pop(),exists:true,data:()=>JSON.parse(JSON.stringify(D[k]))}));return {docs,size:docs.length,empty:!docs.length}}
function snapDoc(path){const D=ld();const v=D[path];return {id:path.split("/").pop(),exists:v!==undefined,data:()=>v===undefined?undefined:JSON.parse(JSON.stringify(v))}}
function fire(){listeners.forEach(l=>{try{l.cb(l.kind==="c"?snapCol(l.path):snapDoc(l.path))}catch(e){console.error(e)}})}
BC.onmessage=()=>fire();
function write(path,val){if(!rule(path,"write")){window.__mockDenied.push(path);return Promise.reject(new Error("permission denied "+path))}if(val!==undefined&&JSON.stringify(val).length>262144){const e=new Error("document too large");e.code="invalid_argument";return Promise.reject(e)}const D=ld();if(val===undefined)delete D[path];else D[path]=JSON.parse(JSON.stringify(val));sv(D);setTimeout(()=>{fire();BC.postMessage(1)},0);return Promise.resolve()}
function docRef(path){return {id:path.split("/").pop(),path,set:v=>write(path,v),update:v=>write(path,Object.assign({},ld()[path]||{},v)),delete:()=>write(path,undefined),get:()=>rule(path,"read")?Promise.resolve(snapDoc(path)):Promise.reject(new Error("denied")),
 onSnapshot:(cb,err)=>{if(!rule(path,"read")){err&&setTimeout(()=>err(new Error("denied")),0);return ()=>{}}const l={kind:"d",path,cb};listeners.push(l);setTimeout(()=>cb(snapDoc(path)),0);return ()=>{const i=listeners.indexOf(l);if(i>=0)listeners.splice(i,1)}},collection:c=>colRef(path+"/"+c)}}
function colRef(path){const c={path,doc:id=>docRef(path+"/"+(id||Math.random().toString(36).slice(2))),add:v=>{const id=Math.random().toString(36).slice(2);return write(path+"/"+id,v).then(()=>docRef(path+"/"+id))},orderBy:()=>c,limit:()=>c,where:()=>c,
 get:()=>rule(path,"read")?Promise.resolve(snapCol(path)):Promise.reject(new Error("denied")),
 onSnapshot:(cb,err)=>{if(!rule(path,"read")){err&&setTimeout(()=>err(new Error("denied")),0);return ()=>{}}const l={kind:"c",path,cb};listeners.push(l);setTimeout(()=>cb(snapCol(path)),0);return ()=>{const i=listeners.indexOf(l);if(i>=0)listeners.splice(i,1)}}};return c}
const db={collection:p=>colRef(p),doc:p=>docRef(p)};
const user={me:async()=>({id:U.id,name:U.name,email:U.email,isOwner:U.isOwner,canEdit:true,avatarUrl:""})};
// 파일 저장소 흉내 (2026-11-12 첨부 시험용): window.__MOCKASSETS=false 로 끄면 실제처럼 없음
const assets={upload:async(blob,o)=>{if(window.__MOCKPDFDENY&&((o&&o.type)||blob.type)==="application/pdf"){const e=new Error("invalid");e.code="invalid_argument";throw e}const id="as_"+Math.random().toString(36).slice(2,10);(window.__mockUploads=window.__mockUploads||[]).push({id,name:blob.name||"",size:blob.size,type:(o&&o.type)||blob.type});return {id,url:"/_blob/"+id,sizeBytes:blob.size,contentType:(o&&o.type)||blob.type}}};
window.claude={use:async n=>{if(n==="db")return db;if(n==="user")return user;if(n==="assets"&&window.__MOCKASSETS!==false)return assets;throw new Error("no "+n)}};
})();
