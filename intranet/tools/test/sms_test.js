// 알리고 문자 발송 시험 (2026-11-12, v0.99-23): node intranet/tools/test/sms_test.js [index.html]
// 가짜 드라이브(mcp)를 넣어 요청 파일 → 가짜 중계가 결과 파일 → 고객 카드 문자 기록까지. 실제 문자는 나가지 않음
const {chromium,devices}=require('playwright');const fs=require('fs');
const HTML=fs.readFileSync(process.argv[2]||'/home/user/card/intranet/index.html','utf8');const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');const OUT=process.env.OUT||'/tmp';
const RULES=[["hr","owner","owner"],["catalog","view","owner"],["acct","owner","owner"],["acct/{self}","interact","interact"],["config","view","owner"],["knock","owner","owner"],["knock/{self}","interact","interact"],["access","owner","owner"],["access/{self}","interact","interact"],["devok","interact","owner"],["members","owner","owner"],["members/{self}","interact","owner"],["creq","owner","owner"],["creq/{self}","interact","interact"],["cgrant","interact","owner"],["cpriv","owner","owner"],["ppriv","owner","owner"],["cshare","owner","owner"],["cshare/{self}","interact","interact"],["ccost","owner","owner"],["fin","owner","owner"],["fincf","owner","owner"],["customers","owner","owner"],["projects","owner","owner"],["quotes","owner","owner"],["sites","owner","owner"],["reports","owner","owner"],["activity","owner","owner"],["mine","owner","owner"],["mine/{self}","interact","interact"],["seal","owner","owner"],["certs","owner","owner"],["work","interact","interact"]].map(([path,read,write])=>({path,read,write}));
const SMS_DIR="1zy6FTTRsu89AnXjlafO55cqV90-Y4mfH";
const cu=(code,name,mgr,x)=>Object.assign({code,name,mgr,status:"진행중",steps:[1,2],stage:"1-상담영업",inq:"2026-11-01",tel:"",addr:"",createdAt:"2026-11-01T00:00:00Z",updatedAt:"2026-11-01T00:00:00Z",__at:"2026-11-01T00:00:00Z"},x||{});
const SEED={"staff/st_boss":{name:"최윤수",uid:"u_boss",level:"관리자",state:"재직",pos:"대표"},"staff/st_jjh":{name:"정진혁",uid:"u_jjh",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_bom":{name:"이봄이",uid:"u_bom",level:"실무 팀",state:"재직",pos:"실장"},"staff/st_cja":{name:"채진아",uid:"u_cja",level:"전체 담당",state:"재직",pos:"차장"},
 "members/u_jjh":{active:true,staffId:"st_jjh",name:"정진혁"},"members/u_bom":{active:true,staffId:"st_bom",name:"이봄이"},"members/u_cja":{active:true,staffId:"st_cja",name:"채진아"},
 "config/company":{name:"주식회사 홈퍼니싱",brand:"아르띠꼬 스튜디오",tel:"1566-5904"},
 "customers/c1":cu("C-2611-901","홍길동","정진혁"),"cpriv/c1":{tel:"010-1111-2222",addr:"서울 시험동 1",updatedAt:"2026-11-01T00:00:00Z"},
 "customers/c2":cu("C-2611-902","김영희","이봄이"),"cpriv/c2":{tel:"01033334444",addr:"",updatedAt:"2026-11-01T00:00:00Z"},
 "customers/c3":cu("C-2611-903","박무전","정진혁"),
 "customers/c4":cu("C-2611-904","최집전화","정진혁"),"cpriv/c4":{tel:"02-123-4567",addr:"",updatedAt:"2026-11-01T00:00:00Z"},
 "customers/c5":cu("C-2611-905","홍길동 배우자","정진혁"),"cpriv/c5":{tel:"010 1111 2222",addr:"",updatedAt:"2026-11-01T00:00:00Z"},
 "projects/p1":{no:"P-2611-901",title:"시험 현장",custName:"홍길동",custCode:"C-2611-901",stage:"상담",mgr:"정진혁",contractAmt:"33000000",estCost:"21212121",cat:"주거",inq:"2026-11-01",updatedAt:"2026-11-01T00:00:00Z"},
 "ppriv/p1":{estCost:"20202020"}};
const USERS={admin:{id:"u_boss",name:"최윤수",email:"boss@test",isOwner:true},jjh:{id:"u_jjh",name:"정진혁",email:"jjh@test",isOwner:false},bom:{id:"u_bom",name:"이봄이",email:"bom@test",isOwner:false},cja:{id:"u_cja",name:"채진아",email:"cja@test",isOwner:false}};
// 가짜 드라이브: localStorage 'mockdrive' 에 파일을 둠 (create_file · search_files · download_file_content)
const FAKEMCP=`window.__mcpCalls=[];window.__MOCKMCP={callTool:async(sv,tool,inp)=>{window.__mcpCalls.push([sv,tool,JSON.stringify(inp)]);const D=JSON.parse(localStorage.getItem('mockdrive')||'{}');const wrap=o=>({content:[{type:'text',text:JSON.stringify(o)}]});
 if(tool==='create_file'&&window.__MCPDENYCREATE)return {isError:true,content:[{type:'text',text:'The caller does not have permission'}]};
 if(tool==='search_files'&&window.__MCPSEARCHFAIL>0){window.__MCPSEARCHFAIL--;throw new Error('deadline exceeded')}
 if(tool==='create_file'&&window.__MCPFLAKY>0){window.__MCPFLAKY--;const id='f_'+Math.random().toString(36).slice(2,9);D[id]={id,title:inp.title,parentId:inp.parentId||'',text:inp.textContent||'',mime:inp.contentMimeType||'',modifiedTime:new Date().toISOString()};localStorage.setItem('mockdrive',JSON.stringify(D));return {isError:true,content:[{type:'text',text:'deadline exceeded'}]}}
 if(tool==='create_file'){const id='f_'+Math.random().toString(36).slice(2,9);D[id]={id,title:inp.title,parentId:inp.parentId||'',text:inp.textContent||'',mime:inp.contentMimeType||'',noconv:!!inp.disableConversionToGoogleType,modifiedTime:new Date().toISOString()};localStorage.setItem('mockdrive',JSON.stringify(D));return wrap({id,title:inp.title,viewUrl:'http://drive.test/'+id})}
 if(tool==='search_files'){const q=inp.query||'',m=/title = '([^']+)'/.exec(q),c=/title contains '([^']+)'/.exec(q),p=/parentId = '([^']+)'/.exec(q);return wrap({files:Object.values(D).filter(f=>(!m||f.title===m[1])&&(!c||f.title.includes(c[1]))&&(!p||f.parentId===p[1])).map(f=>({id:f.id,title:f.title,parentId:f.parentId,modifiedTime:f.modifiedTime}))})}
 if(tool==='download_file_content'){const f=D[inp.fileId];if(!f)return wrap({});const u=new TextEncoder().encode(f.text);let b='';u.forEach(x=>b+=String.fromCharCode(x));return wrap({content:btoa(b)})}
 return wrap({})}};`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));const R=[];const ok=(n,v,x)=>{R.push([v?"통과":"실패",n,x||""]);console.log(v?"통과":"실패",n,x===undefined?"":String(x).slice(0,300))};
const bytes=t=>{let n=0;for(const ch of t){const c=ch.codePointAt(0);n+=c===10?2:c<128?1:2}return n};
(async()=>{const b=await chromium.launch();const __tzSeoul=b.newContext.bind(b);b.newContext=o=>__tzSeoul(Object.assign({timezoneId:'Asia/Seoul'},o||{})) /* 시험 시간대 서울 고정 (검토 권고 2026-11-13: 한국 새벽에 날짜가 하루 어긋남) */;const errs=[],dialogs=[];
 async function mkctx(opts){const ctx=await b.newContext(opts);await ctx.route('http://hf.test/**',r=>r.fulfill({contentType:'text/html',body:r.request().url().includes('seed')?'<html></html>':HTML}));await ctx.route(/fonts\.|cdnjs|jsdelivr|unpkg/,r=>r.abort());
  const seed=await ctx.newPage();await seed.goto('http://hf.test/seed');await seed.evaluate(([s,r])=>{localStorage.setItem('mockdb',JSON.stringify(s));localStorage.setItem('mockrules',JSON.stringify(r));localStorage.setItem('mockdrive','{}')},[SEED,RULES]);
  const D=async()=>JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdb')));const F=async()=>Object.values(JSON.parse(await seed.evaluate(()=>localStorage.getItem('mockdrive'))));
  const setDb=(k,v)=>seed.evaluate(([k,v])=>{const d=JSON.parse(localStorage.getItem('mockdb'));d[k]=v;localStorage.setItem('mockdb',JSON.stringify(d))},[k,v]);
  // 가짜 중계: 결과 파일이 없는 요청마다 결과 파일을 씀 (실제 중계 스크립트와 같은 형식)
  const relay=async(fn)=>{const fl=await F();let n=0;for(const f of fl.filter(x=>/^sms_req_.*\.json$/.test(x.title))){const id=f.title.slice(8,-5);if(fl.some(x=>x.title==='sms_res_'+id+'.json'))continue;const q=JSON.parse(f.text);
    const results=q.items.map((it,i)=>fn?fn(it,i,q):{to:it.to,ok:true,code:"1",message:"success",msg_id:"T"+i,type:bytes(it.msg)<=90?"SMS":"LMS",test:q.test});
    const res={v:1,id,at:new Date().toISOString(),test:q.test,ok:results.filter(x=>x.ok).length,fail:results.filter(x=>!x.ok).length,error:"",results};
    await seed.evaluate(([t,p,txt])=>{const d=JSON.parse(localStorage.getItem('mockdrive'));const id='r_'+Math.random().toString(36).slice(2,9);d[id]={id,title:t,parentId:p,text:txt,modifiedTime:new Date().toISOString()};localStorage.setItem('mockdrive',JSON.stringify(d))},['sms_res_'+id+'.json',SMS_DIR,'\ufeff'+JSON.stringify(res)]);n++}return n};
  async function open(who,opt){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(who+': '+e.message));p.on('dialog',d=>{dialogs.push(who+' '+d.type()+': '+d.message().slice(0,60));d.dismiss()});await p.addInitScript(`window.__MOCKUSER=${JSON.stringify(USERS[who])};`+((opt&&opt.nomcp)?'':FAKEMCP)+MOCK);await p.goto('http://hf.test/');await wait(7000);return p}
  return {ctx,seed,D,F,setDb,relay,open}}
 const go=async(p,h)=>{await p.evaluate(x=>{location.hash=x},h);await wait(900)};
 const txt=p=>p.evaluate(()=>document.body.innerText);
 const E=await mkctx({viewport:{width:1280,height:900}});

 // ── ④ 권한 기본값(team, 대표 결정 2026-11-12): 설정 문서가 없어도 직원 3명 화면에 문자 버튼이 보임 · 설정 칸·전체 기록은 대표만
 for(const w of ['jjh','bom','cja']){const P=await E.open(w);await go(P,'#customers');const n1=await P.locator('[data-smssel]').count();await go(P,'#forms');const n4=await P.locator('#smsCfg,#smsAll').count();
  ok('4 기본값(직원 전원): '+USERS[w].name+' 화면에 ‘선택한 고객에게 문자’ 버튼 보임 · 설정·전체 기록 칸 없음',n1===1&&n4===0,[n1,n4].join('/'));await P.close()}

 // ── ① 대표: 고객 2명 체크 → 미리보기 → 보내기 → 요청 파일 → 결과 → 기록
 const A=await E.open('admin');await wait(2500);await go(A,'#customers');
 ok('1 대표 고객 목록에 체크 칸 5개 + ‘선택한 고객에게 문자’ 버튼',(await A.locator('#view tbody [data-sel]').count())===5&&/선택한 고객에게 문자/.test(await A.locator('[data-smssel]').innerText()));
 const drive0=(await E.F()).length;
 await A.locator('#view [data-selall]').check();await wait(300);
 ok('1 전체 선택 → 버튼에 5명',/선택한 5명에게 문자/.test(await A.locator('[data-smssel]').innerText()),await A.locator('[data-smssel]').innerText());
 await A.locator('[data-smssel]').click();await wait(500);
 const toT=await A.locator('#smsTo').innerText(),skT=await A.locator('#smsSkip').innerText();
 ok('1 받는 사람 2명 (홍길동·김영희, 번호 형식 맞춤)',/홍길동 010-1111-2222/.test(toT)&&/김영희 010-3333-4444/.test(toT)&&(await A.locator('#smsTo .pill').count())===2,toT.replace(/\n/g,' | '));
 ok('2 전화 없는 고객은 빠짐 (박무전 · 전화번호 없음)',/박무전 · 전화번호 없음/.test(skT),skT.replace(/\n/g,' | '));
 ok('2 집 전화(형식 틀림)·같은 번호 중복도 빠짐',/최집전화 · 휴대폰 번호 형식이 아니에요/.test(skT)&&/홍길동 배우자 · 같은 번호가 이미 있어요/.test(skT));
 ok('1 시험 발송 체크가 처음엔 켜져 있음',await A.locator('#smsTest').isChecked());
 ok('1 문구 고르기: 기존 4가지 + 단계별 7가지 (v0.99-30 13번)',(await A.locator('#smsTpl option').allInnerTexts()).join(',')==='상담 후 안내,상담 후 1차,상담 후 2차,견적 후 1차,견적 후 2차,계약 직전,계약 유도 1차,계약 유도 2차,사후관리 안내,재방문 안내,직접 쓰기');
 // ③ 90바이트 경계
 const t90='가'.repeat(45),t91='가'.repeat(45)+'a';
 await A.locator('#smsText').fill(t90);await wait(200);const b90=await A.locator('#smsBytes').evaluate(e=>[e.dataset.b,e.dataset.t]);
 await A.locator('#smsText').fill(t91);await wait(200);const b91=await A.locator('#smsBytes').evaluate(e=>[e.dataset.b,e.dataset.t]);
 await A.locator('#smsText').fill('abc 가나');await wait(200);const b7=await A.locator('#smsBytes').evaluate(e=>[e.dataset.b,e.dataset.t]);
 ok('3 90바이트 = SMS, 91바이트 = LMS, 한글 2바이트·영문 1바이트',b90.join()==='90,SMS'&&b91.join()==='91,LMS'&&b7.join()==='8,SMS',[b90,b91,b7].join(' / '));
 // 재방문(광고): 수신거부 번호 없으면 경고
 await A.locator('#smsTpl').selectOption('재방문 안내');await wait(300);
 ok('1 재방문 안내 기본 문구: 맨 앞 (광고), 끝에 무료수신거부 자리',/^\(광고\)/.test(await A.locator('#smsText').inputValue())&&/무료수신거부 \{수신거부\}$/.test(await A.locator('#smsText').inputValue()));
 await A.locator('[data-smsact="preview"]').click();await wait(400);
 ok('1 재방문 미리보기: 수신거부 번호 경고',/수신거부 번호를 설정에 넣어 주세요/.test(await A.locator('#smsVeil').innerText()));
 await A.locator('#smsVeil [data-smsact="back"]').click();await wait(300);
 // 자리 바꿈 + 미리보기
 await A.locator('#smsTpl').selectOption('직접 쓰기');await wait(200);
 await A.locator('#smsText').fill('{고객명} 고객님, {회사} {담당}입니다. 문의 {전화}');await wait(200);
 await A.locator('[data-smsact="preview"]').click();await wait(400);
 const pv=await A.locator('#smsPrev').innerText(),sum=await A.locator('#smsSum').innerText(),md=await A.locator('#smsMode').innerText();
 ok('1 미리보기: 사람마다 자리 바꿈된 글 (고객명·담당·회사·전화)',/홍길동 고객님, 아르띠꼬 스튜디오 정진혁입니다\. 문의 1566-5904/.test(pv)&&/김영희 고객님, 아르띠꼬 스튜디오 이봄이입니다\. 문의 1566-5904/.test(pv)&&!/\{/.test(pv),pv.replace(/\n/g,' | '));
 ok('1 미리보기: 총 2명 · SMS 2건 · LMS 0건 · 시험 표시 크게',/총 2명/.test(sum)&&/SMS 2건/.test(sum)&&/LMS 0건/.test(sum)&&/시험 발송/.test(md)&&(await A.locator('#smsMode').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)))>=18,sum+' / '+md);
 ok('1 시험이면 빨간 실제 발송 안내 없음',(await A.locator('#smsReal').count())===0);
 await A.screenshot({path:OUT+'/sms_preview_pc.png'});
 await A.locator('[data-smsact="send"]').click();await wait(2500);
 let fl=await E.F();const reqF=fl.filter(f=>/^sms_req_\d{14}_[a-z0-9]{6}\.json$/.test(f.title));
 ok('1 요청 파일 1개가 문자 발송함 폴더에 (json · 변환 안 함)',reqF.length===1&&reqF[0].parentId===SMS_DIR&&reqF[0].mime==='application/json'&&reqF[0].noconv===true,fl.map(f=>f.title).join(','));
 const req=JSON.parse(reqF[0].text);
 ok('1 요청 내용: v·id·at·by·test=true·tpl·items 2건(to·name·cust·msg)',req.v===1&&reqF[0].title==='sms_req_'+req.id+'.json'&&!isNaN(Date.parse(req.at))&&req.by==='최윤수'&&req.test===true&&req.tpl==='직접 쓰기'&&req.items.length===2&&req.items[0].to==='01011112222'&&req.items[0].name==='홍길동'&&req.items[0].cust==='C-2611-901'&&/^홍길동 고객님/.test(req.items[0].msg)&&req.items[1].to==='01033334444',JSON.stringify(req).slice(0,260));
 ok('1 요청 파일에 키·아이디·발신번호 없음',!/key|user_id|sender|ALIGO|apikey|secret|token/i.test(reqF[0].text)&&Object.keys(req).sort().join()==='at,by,id,items,test,tpl,v'&&Object.keys(req.items[0]).sort().join()==='cust,msg,name,to');
 let d=await E.D();
 ok('1 고객 카드에 ‘대기’ 기록 (전화·주소는 원본 줄에 안 들어감)',(d['customers/c1'].smsLog||[]).length===1&&d['customers/c1'].smsLog[0].status==='대기'&&d['customers/c1'].smsLog[0].id===req.id&&d['customers/c1'].tel===''&&d['customers/c2'].smsLog[0].to==='01033334444'&&!d['customers/c3'].smsLog,JSON.stringify(d['customers/c1'].smsLog));
 ok('1 창에 ‘요청을 보냈어요 · 창은 닫아도 돼요’',/요청을 보냈어요 \(2명\)/.test(await A.locator('#smsVeil').innerText())&&/닫아도/.test(await A.locator('#smsVeil').innerText()));
 await E.relay((it,i,q)=>i===0?{to:it.to,ok:true,code:"1",message:"success",msg_id:"M100",type:"SMS",test:true}:{to:it.to,ok:false,code:"-101",message:"인증오류",msg_id:"",type:"SMS",test:true});
 await wait(12500);
 d=await E.D();const l1=d['customers/c1'].smsLog[0],l2=d['customers/c2'].smsLog[0];
 ok('1 결과 파일 반영: 홍길동 ‘시험 성공’(msg_id), 김영희 ‘실패’(사유)',l1.status==='시험 성공'&&l1.msg_id==='M100'&&l1.type==='SMS'&&l2.status==='실패'&&l2.code==='-101'&&l2.message==='인증오류',JSON.stringify([l1.status,l1.msg_id,l2.status,l2.message]));
 ok('1 창에 결과 (성공 1건 · 실패 1건)',/성공 1건 · 실패 1건/.test(await A.locator('#smsDone').innerText().catch(()=>'')));
 await A.locator('#smsVeil [data-smsact="close"]').first().click();await wait(300);
 ok('1 창 닫힘 · 요청 파일은 그대로 (지우지 않음)',(await A.locator('#smsVeil').count())===0&&(await E.F()).some(f=>f.title===reqF[0].title));
 // 고객 카드: 기록 보임
 await A.locator('button[data-open="customers"]').first().click();await wait(900);
 const cardName=await A.locator('.sheet h3').first().innerText();const box=await A.locator('#smsLogBox').innerText().catch(()=>'');
 ok('1 고객 카드 ‘문자’ 칸: 문자 보내기 버튼 + 기록 1건 + 지우기 버튼 없음',(await A.locator('[data-smsone]').count())===1&&/문자 기록 1건/.test(box)&&/시험 성공|실패/.test(box)&&(await A.locator('#smsLogBox button').allInnerTexts()).every(t=>!/삭제|지우/.test(t)),cardName+' / '+box.replace(/\n/g,' | '));
 await A.keyboard.press('Escape');await wait(300);

 // ── 실제 발송 1명 (한 명은 시간 제한 없음): 빨간 안내 → 요청 test=false → 창·화면을 닫은 뒤 결과가 생김 → 고객 카드를 열면 자동 반영
 await go(A,'#customers');await A.locator('#view tbody [data-sel]').first().check();await wait(200);await A.locator('[data-smssel]').click();await wait(400);
 await A.locator('#smsTest').uncheck();await A.locator('[data-smsact="preview"]').click();await wait(400);
 const md2=await A.locator('#smsMode').innerText(),realC=await A.locator('#smsReal').evaluate(e=>getComputedStyle(e).color).catch(()=>'');
 ok('실제 발송 미리보기: ‘실제 발송’ 크게 + 빨간 안내 한 줄 + ‘실제로 보내기 (1명)’',/실제 발송/.test(md2)&&/rgb\(1[0-9]{2}, 1[0-9], 1[0-9]\)/.test(realC)&&/실제로 보내기 \(1명\)/.test(await A.locator('[data-smsact="send"]').innerText())&&!(await A.locator('[data-smsact="send"]').isDisabled()),md2+' / '+realC);
 ok('미리보기 안내: PC가 꺼져 있으면 켤 때 발송 (24시간 지나면 안 보냄)',/PC가 꺼져 있으면 켤 때 발송돼요 \(24시간이 지나면 안 보내요\)/.test(await A.locator('#smsPcNote').innerText()));
 await A.locator('[data-smsact="send"]').click();await wait(2500);
 ok('보낸 뒤 체크가 모두 풀림 (빠졌던 고객이 다음 발송에 섞이지 않음)',(await A.locator('#view [data-sel]:checked').count())===0&&/선택한 고객에게 문자/.test(await A.locator('[data-smssel]').innerText()));
 fl=await E.F();const req2=fl.filter(f=>/^sms_req_/.test(f.title)).map(f=>JSON.parse(f.text)).find(q=>q.test===false)||{};
 ok('실제 발송 요청 파일: test=false · by=최윤수 · 1명',req2.test===false&&req2.by==='최윤수'&&req2.items&&req2.items.length===1,JSON.stringify(req2).slice(0,120));
 await A.locator('#smsVeil [data-smsact="close"]').first().click();await wait(200);
 await A.close();await E.relay((it,i,q)=>({to:it.to,ok:true,code:"1",message:"success",msg_id:"R"+i,type:"SMS",test:true}));/* 중계 PC가 SMS_FORCE_TEST=Y 인 경우: 요청은 실제여도 시험으로 처리 */
 const A2=await E.open('admin');await wait(2500);await go(A2,'#customers');
 d=await E.D();const k2=Object.keys(d).find(k=>/^customers\//.test(k)&&(d[k].smsLog||[]).some(e=>e.id===req2.id));const e2=()=>d[k2].smsLog.find(e=>e.id===req2.id);
 ok('새로 연 화면: 실제 발송 기록은 아직 ‘대기’ (실패로 바뀌지 않음) · 보낸 사람 기록',!!k2&&e2().status==='대기'&&e2().test===false&&e2().by==='최윤수',k2);
 await A2.locator('button[data-open="customers"]').first().click();await wait(4000);
 d=await E.D();ok('고객 카드를 열면 ‘대기’ 건 결과를 다시 찾아 반영 (중계가 시험 모드면 ‘시험 성공’)',e2().status==='시험 성공'&&e2().msg_id==='R0',JSON.stringify(e2()).slice(0,200));
 ok('문자 기록은 줄지 않음 (옛 기록 내용 그대로 + 새 기록)',d[k2].smsLog.length===2&&d['customers/c1'].smsLog.some(e=>e.id===req.id&&e.status==='시험 성공')&&d['customers/c2'].smsLog.some(e=>e.id===req.id&&e.status==='실패'));
 const boxT=await A2.locator('#smsLogBox').innerText().catch(()=>'');ok('고객 카드 기록에 ‘보낸 사람’과 시험/실제 표시',/보낸 사람 최윤수/.test(boxT)&&/실제/.test(boxT)&&/시험/.test(boxT),boxT.replace(/\n/g,' | '));
 await A2.keyboard.press('Escape');await wait(300);

 // ── 설정 (대표): 서식 자료실 › 문자 발송
 await go(A2,'#forms');ok('6 대표 설정 칸 ‘문자 발송’ 있음',(await A2.locator('#smsCfg').count())===1);
 await A2.locator('#smsCfg summary').click();await wait(300);await A2.locator('[data-smsrelay]').click();await wait(1500);
 ok('6 중계 PC 상태: 마지막 결과 파일 시각',/중계 PC가 마지막으로 일한 때: 20\d\d-\d\d-\d\d \d\d:\d\d/.test(await A2.locator('#smsRelaySt').innerText()),await A2.locator('#smsRelaySt').innerText());
 await A2.locator('#smsCfOpt').fill('080-123-4567');await A2.locator('[data-smstpl="after"]').fill('{고객명} 고객님, 사후 점검 안내드립니다. {회사} {전화}');await A2.locator('#smsCfWho').selectOption('admin');
 await A2.locator('[data-smscfsave]').click();await wait(600);
 // okAsk: window.confirm 이 막힌(시험에서는 dismiss) 뒤 화면 안 확인 창
 if(await A2.locator('.okask [data-ok="1"]').count()){await A2.locator('.okask [data-ok="1"]').click();await wait(800)}
 d=await E.D();const sc=d['config/sms']||{};
 ok('6 설정 저장: who=admin(대표만) · 수신거부 번호 · 고친 문구 · 시험 기본값 켜짐',sc.who==='admin'&&sc.optout==='080-123-4567'&&/사후 점검 안내/.test((sc.tpls||{}).after||'')&&sc.test===true&&!sc.tpls.consult,JSON.stringify(sc).slice(0,200));
 ok('6 설정 문서에 키·발신번호 없음',!/key|sender|user_id/i.test(JSON.stringify(sc)));
 // 재방문 문구: 수신거부 번호가 들어가면 경고 없음
 await go(A2,'#customers');await A2.locator('#view tbody [data-sel]').first().check();await wait(200);await A2.locator('[data-smssel]').click();await wait(400);
 await A2.locator('#smsTpl').selectOption('재방문 안내');await wait(200);await A2.locator('[data-smsact="preview"]').click();await wait(400);
 const adT=await A2.locator('#smsVeil').innerText()+'\n'+await A2.evaluate(()=>[...document.querySelectorAll('#smsVeil textarea')].map(t=>t.value).join('\n')) /* v0.99-34: 한 명이면 미리보기 글이 고칠 수 있는 칸 */;ok('재방문 안내: 수신거부 번호가 설정에 있으면 글 끝에 ‘무료수신거부 080-123-4567’, 경고 없음',/무료수신거부 080-123-4567/.test(adT)&&!/수신거부 번호를 설정에/.test(adT)&&/\(광고\)\[아르띠꼬 스튜디오\]/.test(adT));
 await A2.locator('#smsVeil [data-smsact="back"]').click();await wait(200);await A2.locator('#smsTpl').selectOption('사후관리 안내');await wait(200);
 ok('6 대표가 고친 문구가 문자 창에 나옴',/사후 점검 안내드립니다/.test(await A2.locator('#smsText').inputValue()));
 await A2.locator('#smsVeil [data-smsact="close"]').first().click();await wait(200);

 // ── ④ who=admin 으로 바꾸면 직원 3명 화면에서 버튼·체크 칸이 사라짐 → 다시 team 으로 (화면 안 확인 창, 옛 설정은 hist 에 남음)
 for(const w of ['jjh','bom','cja']){const P=await E.open(w);await go(P,'#customers');const n1=await P.locator('[data-smssel]').count(),n2=await P.locator('#view [data-sel]').count();
  await P.locator('button[data-open="customers"]').first().click().catch(()=>{});await wait(900);const n3=await P.locator('[data-smsone]').count();
  ok('4 who=admin: '+USERS[w].name+' 화면에 문자 버튼·체크 칸 없음',n1===0&&n2===0&&n3===0,[n1,n2,n3].join('/'));await P.close()}
 await go(A2,'#forms');await A2.locator('#smsCfWho').selectOption('team');await A2.locator('[data-smscfsave]').click();await wait(600);
 const askT=await A2.locator('.okask').innerText().catch(()=>'');if(await A2.locator('.okask [data-ok="1"]').count()){await A2.locator('.okask [data-ok="1"]').click();await wait(800)}
 d=await E.D();ok('6 직원 전원으로 되돌림: 화면 안 확인 창 → who=team · 옛 설정(admin)이 hist 에 남음',/직원 전원/.test(askT)&&d['config/sms'].who==='team'&&(d['config/sms'].hist||[]).some(h=>h.who==='admin')&&d['config/sms'].optout==='080-123-4567',askT.replace(/\n/g,' ')+' / hist '+(d['config/sms'].hist||[]).length);

 // ── ⑤ 미리 보기(PV) 중 발송 막힘
 const callsBefore=await A2.evaluate(()=>window.__mcpCalls.filter(c=>c[1]==='create_file'&&/sms_req_/.test(c[2])).length);
 await go(A2,'#preview');await A2.locator('[data-pvgo="st_jjh"]').click();await wait(2500);await go(A2,'#customers');
 const pvBtn=A2.locator('[data-smssel]');const pvDis=(await pvBtn.count())?await pvBtn.isDisabled():true;
 await A2.locator('button[data-open="customers"]').first().click().catch(()=>{});await wait(900);const pvOne=A2.locator('[data-smsone]');const pvOneDis=(await pvOne.count())?await pvOne.isDisabled():true;
 await A2.evaluate(()=>{document.querySelectorAll('[data-smsone],[data-smssel]').forEach(b=>{b.disabled=false;b.click()})});await wait(600);
 const filesPV=(await E.F()).filter(f=>/^sms_req_/.test(f.title)).length;
 ok('5 미리 보기 중: 문자 버튼 잠김 · 억지로 눌러도 창 안 열림 · 요청 파일 안 생김',pvDis&&pvOneDis&&(await A2.locator('#smsVeil').count())===0&&filesPV===2&&/* 요청 파일은 앞의 2개 그대로 */(await A2.evaluate(()=>window.__mcpCalls.filter(c=>c[1]==='create_file'&&/sms_req_/.test(c[2])).length))===callsBefore,[pvDis,pvOneDis,filesPV].join('/'));
 await A2.close();

 // ── ④ who=team → 정진혁·이봄이·채진아 화면에 버튼 보임 (대표 화면을 열어 공용 칸에 전화가 맞춰진 뒤)
 const A3=await E.open('admin');await wait(4000);
 for(const w of ['jjh','bom','cja']){const P=await E.open(w);await go(P,'#customers');const n1=await P.locator('[data-smssel]').count(),n2=await P.locator('#view tbody [data-sel]').count();
  await P.locator('button[data-open="customers"]').first().click().catch(()=>{});await wait(900);const n3=await P.locator('[data-smsone]').count();await P.keyboard.press('Escape');
  await go(P,'#forms');const n4=await P.locator('#smsCfg').count();const t=await txt(P);
  ok('4 who=team: '+USERS[w].name+' 화면에 문자 버튼·체크 칸·고객 카드 버튼 보임 (설정 칸은 없음 · 원가 숫자 없음)',n1===1&&n2===5&&n3===1&&n4===0&&!/21212121|21,212,121|20202020|20,202,020/.test(t),[n1,n2,n3,n4].join('/'));
  if(w==='bom'){ // 문자 발송함 폴더가 아직 공유되지 않은 직원: create_file 실패 → 안내, 기록 안 남김
   await go(P,'#customers');await P.evaluate(()=>{window.__MCPDENYCREATE=true});await P.locator('#view tbody [data-sel]').first().check();await wait(200);await P.locator('[data-smssel]').click();await wait(500);
   const b0=JSON.stringify(Object.entries(await E.D()).filter(([k])=>/customers\//.test(k)).map(([k,v])=>[k,(v.smsLog||[]).length]));const f0=(await E.F()).length;
   await P.locator('[data-smsact="preview"]').click();await wait(300);await P.locator('[data-smsact="send"]').click();await wait(1500);const tt=await P.locator('.toast').allInnerTexts();
   ok('직원(이봄이) 폴더 공유 전: ‘문자 발송함 폴더 공유가 아직 안 됐어요 · 대표에게 알려 주세요’ + 기록·요청 파일 안 남음',tt.some(t=>/문자 발송함 폴더 공유가 아직 안 됐어요 · 대표에게 알려 주세요/.test(t))&&b0===JSON.stringify(Object.entries(await E.D()).filter(([k])=>/customers\//.test(k)).map(([k,v])=>[k,(v.smsLog||[]).length]))&&f0===(await E.F()).length,tt.join(' | '))}
  if(w!=='jjh')await P.close();else{
   // 정진혁이 보냄 → 요청 by=정진혁 → 내 사본·공용 칸 기록 → 대표 화면이 원본에 합침 (옛 기록 2건 + 1건)
   const dB=await E.D();const nBof=k=>(dB[k].smsLog||[]).length;
   await go(P,'#customers');await P.locator('#view tbody [data-sel]').first().check();await wait(200);const lbl=await P.locator('[data-smssel]').innerText();await P.locator('[data-smssel]').click();await wait(500);
   const jt=await P.locator('#smsTo').innerText().catch(()=>'');await P.locator('[data-smsact="preview"]').click();await wait(400);await P.locator('[data-smsact="send"]').click();await wait(2500);
   const f3=(await E.F()).filter(f=>/^sms_req_/.test(f.title)).map(f=>JSON.parse(f.text)).find(q=>q.by==='정진혁');
   ok('직원(정진혁) 발송: 요청 파일 by=정진혁 · 시험 · 받는 사람 1명',!!f3&&f3.test===true&&f3.items.length===1&&/^01\d{8,9}$/.test(f3.items[0].to),lbl+' / '+jt);
   await E.relay();await wait(13000);await wait(4000);
   d=await E.D();const tgt=Object.keys(d).find(k=>/^customers\//.test(k)&&(d[k].smsLog||[]).some(e=>f3&&e.id===f3.id));
   const mine=tgt&&d['mine/u_jjh/'+tgt],wk=tgt&&d['work/all/'+tgt],nB=tgt?nBof(tgt):-9;
   ok('직원 발송 기록: 내 사본·공용 칸·대표 원본 모두 ‘시험 성공’, 옛 기록 안 줄어듦',!!tgt&&d[tgt].smsLog.length===nB+1&&d[tgt].smsLog.find(e=>e.id===f3.id).status==='시험 성공'&&d[tgt].smsLog.find(e=>e.id===f3.id).by==='정진혁'&&!!mine&&mine.smsLog.length===nB+1&&!!wk&&wk.smsLog.length===nB+1,tgt+' '+JSON.stringify(tgt&&d[tgt].smsLog.map(e=>e.status))+' mine '+(mine&&mine.smsLog.length)+' work '+(wk&&wk.smsLog.length));
   ok('공용 칸 고객 줄에 금지 칸(원가·마진·성과금) 없음',!!wk&&!['estCost','perf','qCost','approvals','pc','margin','marginRate','bonus','bonusBase'].some(k=>k in wk),wk?Object.keys(wk).join(','):'');
   await P.close()}}
 // 대표 화면: 전체 발송 기록 모아 보기 (누가·언제·누구에게·시험/실제·결과)
 await go(A3,'#forms');await A3.locator('#smsAll summary').click();await wait(400);const allT=await A3.locator('#smsAll').innerText();const allRows=await A3.locator('#smsAll tbody tr').count();
 ok('대표 전체 발송 기록: 보낸 사람(최윤수·정진혁)·받는 사람·시험/실제·결과가 한 표에',allRows===4&&/보낸 사람/.test(allT)&&/정진혁/.test(allT)&&/최윤수/.test(allT)&&/시험 성공/.test(allT)&&/실패/.test(allT)&&/실제/.test(allT)&&/김영희 010-3333-4444|홍길동 010-1111-2222/.test(allT),allRows+'줄 / '+allT.replace(/\n/g,' | ').slice(0,260));
 await A3.screenshot({path:OUT+'/sms_all_pc.png',fullPage:false});
 await A3.close();

 // ── ③-2 상담 끝 화면 '카톡·문자로 보내기' → 문자 창 (소스 확인 + 드라이브 연결 없을 때 안내)
 ok('3-상담: csSend 가 고객 전화가 있으면 문자 창(상담 후 안내)을 엶',/smsOpen\(\{targets:\[cu\],tpl:"상담 후 안내",text:t,from:"consult"\}\)/.test(HTML));
 const N=await E.open('admin',{nomcp:true});await wait(2000);await go(N,'#customers');await N.locator('#view tbody [data-sel]').first().check();await wait(200);await N.locator('[data-smssel]').click();await wait(400);
 await N.locator('[data-smsact="preview"]').click();await wait(300);const before=JSON.stringify((await E.D())['customers/c1'].smsLog)+JSON.stringify((await E.D())['customers/c2'].smsLog);
 await N.locator('[data-smsact="send"]').click();await wait(1500);const toastT=await N.locator('.toast').allInnerTexts();
 ok('드라이브 연결 없음: 안내 toast + 기록 안 남김 + 창 그대로(문구 복사 버튼 있음)',toastT.some(t=>/구글 드라이브 연결이 없어/.test(t))&&before===JSON.stringify((await E.D())['customers/c1'].smsLog)+JSON.stringify((await E.D())['customers/c2'].smsLog)&&(await N.locator('#smsVeil [data-smsact="copy"]').count())===1,toastT.join(' | '));
 await N.close();

 // ── ⑦ 휴대폰 (Pixel 7)
 const M=await mkctx(Object.assign({},devices['Pixel 7']));const MA=await M.open('admin');await wait(2500);await go(MA,'#customers');
 const vw=await MA.evaluate(()=>window.innerWidth);
 const vis=async l=>{const bb=await l.boundingBox();return !!bb&&bb.width>0&&bb.x>=-1&&bb.x+bb.width<=vw+1};
 ok('7 휴대폰: 체크 칸과 ‘선택한 고객에게 문자’ 버튼이 보임',await MA.locator('#view tbody [data-sel]').first().isVisible()&&await MA.locator('[data-smssel]').isVisible()&&await vis(MA.locator('[data-smssel]')),JSON.stringify(await MA.locator('[data-smssel]').boundingBox()));
 await MA.locator('#view tbody [data-sel]').nth(0).check();await MA.locator('#view tbody [data-sel]').nth(1).check();await MA.locator('#view tbody [data-sel]').nth(2).check();await wait(200);
 await MA.locator('[data-smssel]').click();await wait(500);await MA.screenshot({path:OUT+'/sms_write_m.png'});
 const inView=async sel=>MA.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=window.innerWidth+1&&r.top>=-1&&r.bottom<=window.innerHeight+1},sel);
 ok('7 휴대폰: 쓰기 창이 화면 안에 들어옴 (가로 넘침 없음)',await inView('#smsVeil .sheet')&&await MA.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
 await MA.locator('#smsText').fill('{고객명} 고객님, 안녕하세요. '+'가'.repeat(60));await MA.locator('[data-smsact="preview"]').click();await wait(400);await MA.screenshot({path:OUT+'/sms_preview_m.png'});
 const sb=MA.locator('[data-smsact="send"]');await sb.scrollIntoViewIfNeeded();
 ok('7 휴대폰: 미리보기 창이 화면 안에 들어오고 보내기 버튼이 눌림 (LMS 표시)',await inView('#smsVeil .sheet')&&await vis(sb)&&/LMS/.test(await MA.locator('#smsPrev').innerText())&&/LMS [12]건/.test(await MA.locator('#smsSum').innerText()),await MA.locator('#smsSum').innerText());
 await MA.close();await M.ctx.close();

 // ── 2분 안에 결과가 없으면 ‘대기’ 그대로 (실패 아님) + 시간 제한 (따로 연 저장소 · 시계 고정)
 const T=await mkctx({viewport:{width:1280,height:900}});const TA=await T.open('admin');await wait(2500);await go(TA,'#customers');
 await TA.locator('#view tbody [data-sel]').first().check();await wait(200);await TA.locator('[data-smssel]').click();await wait(400);await TA.locator('[data-smsact="preview"]').click();await wait(300);await TA.locator('[data-smsact="send"]').click();
 await wait(126000);const lateT=await TA.locator('#smsVeil').innerText();const dT=await T.D();const eT=Object.entries(dT).filter(([k])=>/^customers\//.test(k)).flatMap(([k,v])=>v.smsLog||[]);
 ok('중계 PC가 꺼져 있을 때: 2분 뒤에도 ‘대기’ 그대로 (실패 아님) + ‘PC가 꺼져 있으면 켤 때 발송 · 24시간 지나면 안 보냄’ 안내',eT.length===1&&eT[0].status==='대기'&&/실패가 아니라 ‘대기’/.test(lateT)&&/켤 때 발송돼요 \(24시간이 지나면 안 보내요\)/.test(lateT),eT.map(e=>e.status).join()+' / '+lateT.replace(/\n/g,' ').slice(0,160));
 await TA.locator('#smsVeil [data-smsact="close"]').first().click();await wait(200);
 await TA.locator('#view [data-selall]').check();await wait(200);await TA.locator('[data-smssel]').click();await wait(400);await TA.locator('#smsTest').uncheck();
 await TA.clock.setFixedTime(new Date('2026-11-13T14:30:00Z'));/* 한국 시간 밤 11시 30분 */await TA.locator('[data-smsact="preview"]').click();await wait(400);
 ok('밤 11시 30분(한국): 여러 명 실제 발송 잠김 + 안내',/오전 8시 ~ 밤 9시/.test(await TA.locator('#smsVeil').innerText())&&await TA.locator('[data-smsact="send"]').isDisabled());
 await TA.locator('#smsVeil [data-smsact="back"]').click();await wait(200);await TA.locator('#smsTest').check();await TA.locator('[data-smsact="preview"]').click();await wait(300);
 ok('밤이라도 시험 발송은 열림',!(await TA.locator('[data-smsact="send"]').isDisabled()));
 await TA.locator('#smsVeil [data-smsact="back"]').click();await wait(200);await TA.locator('#smsTest').uncheck();
 await TA.clock.setFixedTime(new Date('2026-11-14T03:00:00Z'));/* 한국 시간 낮 12시 */await TA.locator('[data-smsact="preview"]').click();await wait(400);
 ok('낮 12시(한국): 여러 명 실제 발송 열림 + 빨간 안내 한 줄',!(await TA.locator('[data-smsact="send"]').isDisabled())&&/실제로 보내기 \(2명\)/.test(await TA.locator('[data-smsact="send"]').innerText())&&(await TA.locator('#smsReal').count())===1);
 await TA.close();await T.ctx.close();

 // ── ⑦ 검토 반려 2026-11-12: (A) 원본이 더 새것이어도 문자 기록이 안 사라짐 (C) 드라이브가 파일을 만들고도 오류를 돌려줄 때 다시 눌러도 요청 파일 1개
 {const E7=await mkctx({viewport:{width:1280,height:900}});let A7=await E7.open('admin');await wait(6000);await A7.close();let d7=await E7.D();
  const en={id:'20261112120000_abc123',at:'2026-11-12T03:00:00.000Z',by:'정진혁',tpl:'직접 쓰기',msg:'시험',to:'01011112222',test:true,status:'시험 성공',code:'1',message:'',msg_id:'T0',type:'SMS'};
  const m0=d7['mine/u_jjh/customers/c1'],w0=d7['work/all/customers/c1'];
  ok('7A 준비: 정진혁 사본·공용 칸에 고객 줄이 있음',!!m0&&!!w0);
  if(m0&&w0){await E7.setDb('mine/u_jjh/customers/c1',Object.assign({},m0,{smsLog:[en]}));await E7.setDb('work/all/customers/c1',Object.assign({},w0,{smsLog:[en],__by:'u_jjh'}));const nw=new Date().toISOString();await E7.setDb('customers/c1',Object.assign({},d7['customers/c1'],{memo:'대표가 나중에 고침',updatedAt:nw,__at:nw}));
   A7=await E7.open('admin');await wait(14000);d7=await E7.D();const n=k=>((d7[k]||{}).smsLog||[]).length;
   ok('7A 원본이 직원 사본보다 새것이어도 문자 기록 유지: 원본·정진혁 사본·공용 칸 모두 1건 · 대표가 고친 메모도 그대로',n('customers/c1')===1&&n('mine/u_jjh/customers/c1')===1&&n('work/all/customers/c1')===1&&d7['customers/c1'].memo==='대표가 나중에 고침'&&d7['customers/c1'].tel==='',[n('customers/c1'),n('mine/u_jjh/customers/c1'),n('work/all/customers/c1')].join('/'));
   ok('7A 다른 직원(이봄이) 사본에도 문자 기록이 내려감',n('mine/u_bom/customers/c1')===1,String(n('mine/u_bom/customers/c1')));await A7.close()}
  const P7=await E7.open('jjh');await go(P7,'#customers');await P7.evaluate(()=>{window.__MCPFLAKY=1;window.__MCPSEARCHFAIL=1});
  await P7.locator('#view tbody [data-sel]').first().check();await wait(200);await P7.locator('[data-smssel]').click();await wait(500);await P7.locator('[data-smsact="preview"]').click();await wait(400);await P7.locator('[data-smsact="send"]').click();await wait(1800);
  const t7=await P7.locator('.toast').allInnerTexts();const f7a=(await E7.F()).filter(f=>/^sms_req_/.test(f.title)).length;
  ok('7C 드라이브가 파일을 만들고도 오류 + 확인도 실패: ‘잠깐 끊겼어요 · 다시 눌러 주세요’ 안내 (폴더 공유 안내 아님)',t7.some(t=>/잠깐 끊겼어요/.test(t))&&!t7.some(t=>/폴더 공유가 아직/.test(t))&&f7a===1,t7.join(' | ')+' 파일 '+f7a);
  await P7.locator('[data-smsact="send"]').click();await wait(2500);const f7=(await E7.F()).filter(f=>/^sms_req_/.test(f.title));d7=await E7.D();const lg7=Object.keys(d7).filter(k=>/^mine\/u_jjh\/customers\//.test(k)).flatMap(k=>(d7[k].smsLog||[]).filter(e=>f7[0]&&e.id===JSON.parse(f7[0].text).id));
  ok('7C 다시 누름: 새 요청 파일을 만들지 않고(1개 그대로) 성공 처리 · 기록 1건 · create_file 은 1번만 불림',f7.length===1&&lg7.length===1&&(await P7.evaluate(()=>window.__mcpCalls.filter(c=>c[1]==='create_file'&&/sms_req_/.test(c[2])).length))===1,'파일 '+f7.length+' 기록 '+lg7.length);
  await P7.close();await E7.ctx.close()}

 // ── ⑥ confirm/alert/prompt: 문자 코드에 0건 + 화면 대화상자는 okAsk(기존 방식)가 부른 confirm 뿐
 const blk=HTML.slice(HTML.indexOf('// ===== 문자 발송 (알리고'),HTML.indexOf('// ===== v0.95 (다음 지시 2026-11-09 v1)'));
 ok('6 문자 코드에 alert/confirm/prompt/window.open 0건',blk.length>5000&&!/\b(alert|confirm|prompt)\s*\(|window\.open/.test(blk),blk.length+'자');
 ok('6 시험 중 뜬 대화상자: okAsk(설정 저장 확인) 말고 없음',dialogs.every(x=>/confirm: (직원 전원|문자 창의 기본값)/.test(x)),dialogs.join(' | '));
 ok('문자 코드에 알리고 주소·키 없음',!/apis\.aligo\.in|ALIGO_API_KEY/.test(HTML));
 ok('화면 오류 0건',!errs.length,errs.slice(0,3).join(' | '));
 await b.close();const bad=R.filter(r=>r[0]==='실패');console.log('\n결과: 통과 '+(R.length-bad.length)+' / 실패 '+bad.length);process.exit(bad.length?1:0)})();
