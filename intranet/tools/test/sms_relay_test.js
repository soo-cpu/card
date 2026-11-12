// 문자 중계 스크립트(sms_relay.ps1) 시험 (2026-11-12): 가짜 알리고(로컬 HTTP)로 실제 돌려 봄. 실제 문자는 나가지 않음
// 쓰는 법: PWSH=/경로/pwsh node intranet/tools/test/sms_relay_test.js   (PowerShell 7 이 있어야 함. Windows PowerShell 5.1 은 대표 PC에서 확인)
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),{spawnSync,spawn}=require('child_process');
const PWSH=process.env.PWSH||'pwsh',PS1=path.join(__dirname,'..','sms_relay','sms_relay.ps1');
const R=[];const ok=(n,v,x)=>{R.push(v);console.log(v?'통과':'실패',n,x===undefined?'':String(x).slice(0,300))};
const KEY='FAKEKEY_abc123xyz',calls=[];let mode='ok';
const srv=http.createServer((q,s)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{const f=Object.fromEntries(new URLSearchParams(b));calls.push(f);
  if(mode==='down'){q.socket.destroy();return}
  const bad=f.receiver==='01099990000';s.setHeader('Content-Type','application/json');
  s.end(JSON.stringify(bad?{result_code:"-101",message:"인증오류입니다"}:{result_code:"1",message:"success",msg_id:"M"+calls.length,success_cnt:1,error_cnt:0,msg_type:f.msg_type}))})});
const iso=ms=>new Date(Date.now()+ms).toISOString();
const kid=(n)=>'2026111213'+String(1000+n)+'_abc'+String(100+n);
srv.listen(0,'127.0.0.1',async()=>{const url='http://127.0.0.1:'+srv.address().port+'/send/';
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'smsrelay-')),Q=path.join(root,'문자 발송함'),ST=path.join(root,'state');fs.mkdirSync(Q);
  const envP=path.join(root,'.env');const env=o=>fs.writeFileSync(envP,Object.entries(Object.assign({ALIGO_API_KEY:KEY,ALIGO_USER_ID:'hfuser',ALIGO_SENDER:'1566-5904'},o)).map(([k,v])=>k+'='+v).join('\n'));
  const run=(extra)=>new Promise(done=>{const c=spawn(PWSH,['-NoLogo','-NoProfile','-File',PS1,'-Queue',Q,'-EnvFile',envP,'-ApiUrl',url,'-StateDir',ST].concat(extra||[]));let stderr='',stdout='';c.stdout.on('data',d=>stdout+=d);c.stderr.on('data',d=>stderr+=d);c.on('close',status=>done({status,stdout,stderr}))});/* 가짜 알리고가 같은 node 안에서 돌아서 기다리는 방식(spawnSync)은 못 씀 */
  const req=(n,o,raw)=>{const id=kid(n);fs.writeFileSync(path.join(Q,'sms_req_'+id+'.json'),raw!==undefined?raw:JSON.stringify(Object.assign({v:1,id,at:iso(0),by:'정진혁',test:false,tpl:'직접 쓰기',items:[{to:'01011112222',name:'홍길동',cust:'C-1',msg:'홍길동 고객님 안녕하세요'}]},o)));return id};
  const res=id=>{const p=path.join(Q,'sms_res_'+id+'.json');if(!fs.existsSync(p))return null;const b=fs.readFileSync(p);return Object.assign(JSON.parse(b.toString('utf8').replace(/^﻿/,'')),{__bom:b[0]===0xEF})};
  const b=fs.readFileSync(PS1);ok('스크립트가 UTF-8 BOM 으로 저장됨',b[0]===0xEF&&b[1]===0xBB&&b[2]===0xBF);
  const v=spawnSync(PWSH,['-NoLogo','-NoProfile','-Command','$PSVersionTable.PSVersion.ToString()'],{encoding:'utf8'});if(v.error){console.log('PowerShell 을 찾지 못했어요:',v.error.message);process.exit(2)}console.log('PowerShell',v.stdout.trim());
  // 1) SMS_FORCE_TEST 없음 = Y: 요청이 실제여도 testmode_yn=Y
  env({});const a=req(1,{});let r=await run();let x=res(a);
  ok('1 기본(SMS_FORCE_TEST 없음): 실제 요청도 시험으로 (testmode_yn=Y), 결과 파일 형식',r.status===0&&x&&x.v===1&&x.id===a&&x.test===true&&x.ok===1&&x.fail===0&&x.error===''&&x.results.length===1&&x.results[0].to==='01011112222'&&x.results[0].ok===true&&x.results[0].code==='1'&&x.results[0].msg_id==='M1'&&x.results[0].type==='SMS'&&calls[0].testmode_yn==='Y'&&!x.__bom,JSON.stringify(x)+' '+r.stderr);
  ok('1 알리고로 보낸 값: key·user_id·sender(숫자만)·receiver·msg(한글 그대로)·msg_type',calls[0].key===KEY&&calls[0].user_id==='hfuser'&&calls[0].sender==='15665904'&&calls[0].receiver==='01011112222'&&calls[0].msg==='홍길동 고객님 안녕하세요'&&calls[0].msg_type==='SMS'&&calls[0].title===undefined,JSON.stringify(calls[0]));
  ok('1 요청 파일은 그대로 · 임시 파일 안 남음',fs.existsSync(path.join(Q,'sms_req_'+a+'.json'))&&!fs.readdirSync(Q).some(f=>/\.tmp$/.test(f)),fs.readdirSync(Q).join(','));
  // 2) 다시 돌려도 같은 요청을 또 보내지 않음
  const n0=calls.length;await run();ok('2 결과 파일이 있는 요청은 다시 안 보냄',calls.length===n0);
  // 3) 실제 모드 + SMS_ONLY_TO: 그 번호만 실제, 나머지는 시험 · LMS 는 title · 틀린 번호·알리고 실패는 그 건만 실패
  env({SMS_FORCE_TEST:'N',SMS_ONLY_TO:'010-1111-2222',SMS_TITLE:'아르띠꼬 스튜디오'});const c0=calls.length;
  const long='가'.repeat(45)+'a',b90='가'.repeat(45);
  const c=req(2,{items:[{to:'01011112222',name:'가',cust:'',msg:b90},{to:'01033334444',name:'나',cust:'',msg:long},{to:'02-123-4567',name:'다',cust:'',msg:'집 전화'},{to:'01099990000',name:'라',cust:'',msg:'알리고가 거절'},{to:'01055556666',name:'마',cust:'',msg:'줄\n바꿈'}]});
  r=await run();x=res(c);const cc=calls.slice(c0);
  ok('3 실제 모드: ONLY_TO 번호만 실제(testmode 없음), 나머지는 시험',x&&cc.length===4&&cc[0].receiver==='01011112222'&&cc[0].testmode_yn===undefined&&cc[1].testmode_yn==='Y'&&x.results[0].test===false&&x.results[1].test===true&&x.test===false,JSON.stringify(cc.map(f=>[f.receiver,f.testmode_yn,f.msg_type])));
  ok('3 90바이트 = SMS, 91바이트 = LMS + title(회사명)',cc[0].msg_type==='SMS'&&cc[1].msg_type==='LMS'&&cc[1].title==='아르띠꼬 스튜디오'&&x.results[1].type==='LMS');
  ok('3 틀린 번호는 그 건만 실패(알리고에 안 보냄), 알리고 거절도 그 건만 실패',x.results[2].ok===false&&x.results[2].code==='-900'&&x.results[3].ok===false&&x.results[3].code==='-101'&&x.results[3].message==='인증오류입니다'&&x.results[4].ok===true&&x.ok===3&&x.fail===2,JSON.stringify(x.results.map(q=>[q.ok,q.code])));
  ok('3 줄바꿈이 그대로 전달됨',cc[3].msg==='줄\n바꿈');
  // 4) 하루 한도
  env({SMS_FORCE_TEST:'N',SMS_DAILY_MAX:'2'});const d0=calls.length;const d=req(3,{items:[{to:'01011110001',name:'',cust:'',msg:'a'},{to:'01011110002',name:'',cust:'',msg:'b'},{to:'01011110003',name:'',cust:'',msg:'c'}]});await run();x=res(d);
  ok('4 하루 실제 발송 한도(2건, 앞에서 1건 씀): 넘는 건은 보내지 않고 실패',x&&x.results[0].ok===true&&x.results[1].ok===false&&x.results[1].code==='-901'&&x.results[2].code==='-901'&&calls.length===d0+1,JSON.stringify(x&&x.results.map(q=>[q.ok,q.code])));
  // 5) 24시간 지난 요청
  env({SMS_FORCE_TEST:'N'});const e0=calls.length;const e=req(4,{at:iso(-25*36e5)});await run();x=res(e);
  ok('5 24시간 지난 요청: 보내지 않고 ‘시간 지남’',x&&/시간 지남/.test(x.error)&&x.ok===0&&x.fail===1&&x.results[0].code==='-902'&&calls.length===e0,JSON.stringify(x));
  // 6) 깨진 JSON: 방금 만든 파일은 기다리고, 2분 지난 파일은 그 건만 실패
  const f1=req(5,null,'{"v":1,"id":');await run();ok('6 방금 만든 깨진 파일은 결과를 쓰지 않고 기다림 (드라이브가 내려받는 중일 수 있음)',res(f1)===null);
  const old=new Date(Date.now()-5*60e3);fs.utimesSync(path.join(Q,'sms_req_'+f1+'.json'),old,old);const g=req(6,{test:true});await run();x=res(f1);
  ok('6 2분 지난 깨진 파일은 그 건만 실패, 다른 요청은 정상',x&&/JSON/.test(x.error)&&x.ok===0&&res(g)&&res(g).ok===1&&res(g).test===true,JSON.stringify(x));
  // 7) 50명 넘음
  const h=req(7,{items:Array.from({length:51},(_,i)=>({to:'0101234'+String(1000+i),name:'',cust:'',msg:'x'}))});const h0=calls.length;await run();x=res(h);
  ok('7 51명 요청: 한 건도 보내지 않고 실패',x&&/50명/.test(x.error)&&x.fail===51&&calls.length===h0,x&&x.error);
  // 8) 알리고에 연결이 안 됨: 결과를 쓰지 않고 다음 번에 다시 → 연결되면 나감
  mode='down';const k=req(8,{test:true});await run();const noRes=res(k)===null;mode='ok';await run();x=res(k);
  ok('8 연결 실패 때는 결과를 쓰지 않고, 다음 번에 다시 보내 성공',noRes&&x&&x.ok===1,JSON.stringify(x));
  // 9) 키 없음: 요청을 실패로 끝내지 않고 그대로 둠
  fs.writeFileSync(envP,'SMS_FORCE_TEST=Y\n');const m=req(9,{});r=await run();ok('9 .env 에 키가 없으면 보내지 않고 그대로 둠 (종료 코드 2)',res(m)===null&&r.status===2,'status '+r.status+' '+r.stderr.slice(0,200));
  env({});await run();ok('9 키를 채우면 다음 번에 나감',res(m)&&res(m).ok===1);
  // 10) 로그
  const log=fs.readFileSync(path.join(ST,'sms_relay.log'),'utf8');
  ok('10 로그에 키·전체 전화번호 없음 (뒤 4자리만) · 보낸 사람 이름 있음',!log.includes(KEY)&&!/01\d{8,9}/.test(log)&&/\*\*\*2222/.test(log)&&/보낸 사람=정진혁/.test(log),log.split('\n').slice(0,4).join(' | '));
  ok('10 결과 파일에 키 없음',fs.readdirSync(Q).filter(f=>/^sms_res_/.test(f)).every(f=>!fs.readFileSync(path.join(Q,f),'utf8').includes(KEY)));
  ok('요청 파일 9개 모두 그대로 남아 있음',fs.readdirSync(Q).filter(f=>/^sms_req_/.test(f)).length===9);
  srv.close();const bad=R.filter(v=>!v).length;console.log('\n결과: 통과 '+(R.length-bad)+' / 실패 '+bad);process.exit(bad?1:0)});
