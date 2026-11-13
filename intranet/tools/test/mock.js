(()=>{const U=window.__MOCKUSER;const BC=new BroadcastChannel("mockdb");const LK="mockdb";
const RULES=JSON.parse(localStorage.getItem("mockrules")||"[]");
const lv={view:1,interact:2,admin:3,owner:4};const myLv=U.isOwner?4:2;
const ld=()=>{try{return JSON.parse(localStorage.getItem(LK)||"{}")}catch(e){return {}}};
const sv=o=>localStorage.setItem(LK,JSON.stringify(o));
function rule(path,op){const seg=path.split("/");let best=null,bl=-1;RULES.forEach(r=>{const rs=r.path.split("/");if(rs.length>seg.length)return;for(let i=0;i<rs.length;i++){if(rs[i]==="{self}"){if(seg[i]!==U.id)return}else if(rs[i]!==seg[i])return}if(rs.length>bl){bl=rs.length;best=r}});const need=best?best[op]:(op==="read"?"view":"interact");return myLv>=lv[need]}
window.__mockDenied=[];
// 읽기 실패 흉내 (2026-11-13 깜빡임 시험): 그 경로로 시작하는 구독의 오류 콜백을 한 번 부름
window.__mockFireErr=(pre,code)=>{let n=0;listeners.forEach(l=>{if(l.path.startsWith(pre)&&l.err){n++;try{l.err(Object.assign(new Error("mock error"),{code:code||"internal"}))}catch(e){}}});return n};
const listeners=[];
// 실제 저장소처럼: 화면 하나에 실시간 구독 64개까지 (2026-11-12, v0.99-25). 65번째부터는 오류 콜백으로 resource_exhausted. window.__MOCKNOCAP=true 로 끔
window.__mockCapHit=0;const capFull=()=>{if(window.__MOCKNOCAP)return false;if(listeners.length>=64){window.__mockCapHit++;return true}return false};window.__mockSubs=()=>listeners.length;
function snapCol(path){const D=ld(),n=path.split("/").length+1;const docs=Object.keys(D).filter(k=>k.startsWith(path+"/")&&k.split("/").length===n).map(k=>({id:k.split("/").pop(),exists:true,data:()=>JSON.parse(JSON.stringify(D[k]))}));return {docs,size:docs.length,empty:!docs.length}}
function snapDoc(path){const D=ld();const v=D[path];return {id:path.split("/").pop(),exists:v!==undefined,data:()=>v===undefined?undefined:JSON.parse(JSON.stringify(v))}}
// window.__MOCKEXACT=true (2026-11-13): 실제 저장소처럼 바뀐 문서를 보는 구독만 부름 (끄면 예전처럼 쓸 때마다 모든 구독을 부름 — 그러면 '다른 칸이 바뀌어야만 다시 읽는' 버그가 가려짐)
function fire(p){listeners.forEach(l=>{if(window.__MOCKEXACT&&typeof p==="string"&&!(l.kind==="d"?l.path===p:(p.startsWith(l.path+"/")&&p.split("/").length===l.path.split("/").length+1)))return;try{l.cb(l.kind==="c"?snapCol(l.path):snapDoc(l.path))}catch(e){console.error(e)}})}
BC.onmessage=e=>fire(e&&e.data);
function write(path,val){if(!rule(path,"write")){window.__mockDenied.push(path);return Promise.reject(new Error("permission denied "+path))}if(val!==undefined&&JSON.stringify(val).length>262144){const e=new Error("document too large");e.code="invalid_argument";return Promise.reject(e)}const D=ld();if(val===undefined)delete D[path];else D[path]=JSON.parse(JSON.stringify(val));sv(D);setTimeout(()=>{fire(path);BC.postMessage(path)},0);return Promise.resolve()}
function docRef(path){return {id:path.split("/").pop(),path,set:v=>write(path,v),update:v=>write(path,Object.assign({},ld()[path]||{},v)),delete:()=>write(path,undefined),get:()=>rule(path,"read")?Promise.resolve(snapDoc(path)):Promise.reject(new Error("denied")),
 onSnapshot:(cb,err)=>{if(!rule(path,"read")){err&&setTimeout(()=>err(new Error("denied")),0);return ()=>{}}if(capFull()){err&&setTimeout(()=>err(Object.assign(new Error("subscription cap"),{code:"resource_exhausted"})),0);return ()=>{}}const l={kind:"d",path,cb,err};listeners.push(l);setTimeout(()=>cb(snapDoc(path)),0);return ()=>{const i=listeners.indexOf(l);if(i>=0)listeners.splice(i,1)}},collection:c=>colRef(path+"/"+c)}}
function colRef(path){const c={path,doc:id=>docRef(path+"/"+(id||Math.random().toString(36).slice(2))),add:v=>{const id=Math.random().toString(36).slice(2);return write(path+"/"+id,v).then(()=>docRef(path+"/"+id))},orderBy:()=>c,limit:()=>c,where:()=>c,
 get:()=>rule(path,"read")?Promise.resolve(snapCol(path)):Promise.reject(new Error("denied")),
 onSnapshot:(cb,err)=>{if(!rule(path,"read")){err&&setTimeout(()=>err(new Error("denied")),0);return ()=>{}}if(capFull()){err&&setTimeout(()=>err(Object.assign(new Error("subscription cap"),{code:"resource_exhausted"})),0);return ()=>{}}const l={kind:"c",path,cb,err};listeners.push(l);setTimeout(()=>cb(snapCol(path)),0);return ()=>{const i=listeners.indexOf(l);if(i>=0)listeners.splice(i,1)}}};return c}
const db={collection:p=>colRef(p),doc:p=>docRef(p)};
const user={me:async()=>({id:U.id,name:U.name,email:U.email,isOwner:U.isOwner,canEdit:true,avatarUrl:""})};
// 파일 저장소 흉내 (2026-11-12 첨부 시험용): window.__MOCKASSETS=false 로 끄면 실제처럼 없음
const assets={upload:async(blob,o)=>{if(window.__MOCKPDFDENY&&((o&&o.type)||blob.type)==="application/pdf"){const e=new Error("invalid");e.code="invalid_argument";throw e}const id="as_"+Math.random().toString(36).slice(2,10);(window.__mockUploads=window.__mockUploads||[]).push({id,name:blob.name||"",size:blob.size,type:(o&&o.type)||blob.type});return {id,url:"/_blob/"+id,sizeBytes:blob.size,contentType:(o&&o.type)||blob.type}}};
// 구글 드라이브 커넥터 흉내 (2026-11-12 문자 시험용): window.__MOCKMCP 를 넣은 시험에서만 있음
window.claude={use:async n=>{if(n==="db")return db;if(n==="mcp"&&window.__MOCKMCP)return window.__MOCKMCP;if(n==="user")return user;if(n==="assets"&&window.__MOCKASSETS!==false)return assets;throw new Error("no "+n)}};
})();
