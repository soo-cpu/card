# 매일 19시 자금일보 자동 반영 — 순서 (예약 작업이 이 순서대로 한다)

직원이 매일 18시쯤 공유드라이브에 `cash flow(연도)월.xlsx`(예: `cash flow(2026)11월.xlsx`, 다음 달은 `12월`)를 올린다.
매일 19시(한국 시간)에 아래를 한다.

## 지킬 것
- 원본 엑셀은 **읽기만**. 수정·이동·삭제 금지. 내려받은 사본은 끝나면 지운다.
- 숫자는 원본 **그대로**. 고치거나 계산해서 바꾸지 않는다.
- 이미 들어간 날짜가 원본과 다르면 **고치지 말고 차이 목록에만** 적는다.
- 계좌번호는 넣지 않는다. 급여·퇴직연금·상여, 대표 차입·가수금 줄은 내용을 가린다 (스크립트가 한다).
- 저장소(GitHub)에는 돈 숫자를 넣지 않는다. 작업 파일은 스크래치 폴더에만 둔다.

## 주소
- 인트라넷: https://claude.ai/artifact/YKp7VvPpkG9aVuWQLsFCJY
- 홈퍼니싱 자금 관리: https://claude.ai/artifact/Vsg67RNuBJCkzaX8eRLw4H
- 드라이브 인트라넷 폴더: `1ZQiRja_aLNH_l6_m2HI5Praaqyrwl17B`
- 스크립트: 이 저장소 `intranet/tools/cf_daily.py` (브랜치 `claude/company-intranet-draft-eoogkh`)

## 순서
1. 오늘 날짜(한국 시간)로 이번 달 파일 이름을 정한다: `cash flow(YYYY)M월.xlsx`. 드라이브에서 `title contains 'cash flow(YYYY)M월'`로 찾는다.
   - 매달 1일처럼 이번 달 파일이 아직 없으면 지난달 파일을 쓴다.
   - 파일이 없으면 4번(보고)만 하고 끝낸다: "파일 없음".
2. 파일을 내려받아 스크래치 폴더에 xlsx로 저장한다 (base64 → 파일).
3. 자금 관리 대시보드의 `datasets` 컬렉션에서 `cf_days`·`cf_items`·`cf_banks`의 `source.url`(`/_blob/<id>`)을 읽는다.
   각 id를 Artifact `read`(`path`=id, `out_dir`=작업 폴더)로 받아 `cf_days.json`·`cf_items.json`·`cf_banks.json` 이름으로 둔다.
   인트라넷 `fin/cfnew` 문서(작은 문서)를 읽어 둔다.
   `cfhist.json`은 `{"days": [[d,in,out,close] ...]}` 모양으로 만든다: `cf_days.json`의 줄 + `fin/cfnew.days`를 날짜로 합친 것.
   인트라넷 `fincf` 컬렉션을 모두 읽어 `fincf.json`으로 둔다: `[{"id","d","io","amt","xl","plan"} ...]` (입출금 줄, 2026-11-06 추가).
4. `python3 -I intranet/tools/cf_daily.py "<xlsx>" <작업폴더> <오늘 YYYY-MM-DD>`를 실행한다. 결과 `report.json`을 본다.
   - `added`가 비어 있으면 5~7번은 건너뛴다.
   - `added`의 각 날짜에서 `open_in_out_close_ok`·`lines_sum_ok`·`banks_ok`가 false면 반영은 하되 보고에 적는다.
5. 인트라넷 반영:
   - `fin/cfnew`를 `set` (if_version 고정): `days` = 기존 `cfnew.days` + `added` 날짜 줄(`new_cfhist.json`에서 해당 날짜 줄), 날짜 순. `at`=지금, `src` 유지.
   - 직원 사본: `members` 컬렉션의 각 uid에 대해 `acct/<uid>/fin` 문서 `all`이 있고 `revoked`가 아니면, `update`로 `histNew` = 위 `cfnew.days` 전체, `newAt`=지금. (버전이 다르다고 거절되면 그 버전으로 다시 — 이 두 칸만 바꾼다.)
5-1. 입출금 줄 (2026-11-06 대표 지시): `new_fincf.json`의 각 줄을 인트라넷 `fincf/<id>`로 `batch` set (새 문서, `id` 칸은 빼고). `fincf_xl_marks.json`의 각 줄은 직원이 이미 넣은 같은 줄(날짜·구분·금액 같음)이라 새로 만들지 않고 `update`로 `xl`·`xlWhat`만 넣는다 (if_version 고정). `added`가 비어 있어도 `fincf_new`·`fincf_marks`가 있으면 이 단계는 한다.
5-2. 엑셀 원본 보기 (2026-11-10 대표 지시): `python3 -I intranet/tools/cf_sheet.py "<xlsx>" <작업폴더> <지난달 1일 YYYY-MM-01>`을 실행해 `cf_sheets.json`을 만든다.
   그 안의 각 키(`cfsheet-YYYY-MM`)마다 인트라넷 `fin/<키>` 문서를 읽어(없으면 새로) `days`에 **새 날짜와 원본이 바뀐 날짜**를 더해 `set` (if_version 고정, 이미 있는 다른 날짜는 그대로 둔다). `at`=지금, `src`=파일 이름.
   이 자료는 대표 저장소(fin)라 직원은 직접 못 읽고, 대표 화면이 열릴 때 채진아 사본에 최근 14일만 들어간다. 이 단계는 `added`가 비어 있어도 한다.
   - (2026-11-10 대표 지시) 각 날짜에 `ar` 칸이 같이 들어간다: 그날 시트 오른쪽 아래 '미수금(물대+시공)' 표 그대로(총 계약금·월·업체명·현재 미수액·실행가·PJ 담당·비고, 맨 아래 'N/N일 기준 미수금' 합계).
     인트라넷 **미수금 메뉴는 이 표가 정답**이다 (입금 내역 계산 아님). 원본 숫자는 그대로, 고치지 않는다.
     스크립트가 '미수금 표 못 찾은 날짜'를 출력하면 보고(8번)에 적는다. 이미 있는 날짜에 `ar`만 없으면 `update`로 그 날짜의 `ar`만 더한다.
5-3. 목표 관리 (2026-11-10 대표 지시, 이 단계는 `added`가 비어 있어도 한다):
   - 드라이브 전체에서 `title contains '2027 사업계획' and trashed = false`로 찾고, 이름이 '2027 사업계획'으로 **시작**하고 `YYYY-MM-DD vN`이 있는 것 중 **vN이 가장 큰 것**(같으면 늦은 날짜)을 고른다 ('_조각 …'·'대화 기록 …'·'손익분기점' 같은 다른 파일은 빠짐).
   - 경영 대시보드의 손익분기 목표도 이 파일의 '손익분기 매출'을 쓴다 (`fin/goalplan.bep`).
   - 인트라넷 `fin/goalplan`의 `src.title`과 다르면 그 파일을 받아 `python3 -I intranet/tools/goal_snap.py plan <md> "<파일 이름>"` → 결과로 `fin/goalplan`을 `set`(if_version, `src`·`checkedAt`·`at`=지금 포함), `config/goal`은 `update`로 `year`·`src`(title·date·v)·`months`·`margin`·`mixRes`·`mixPub`·`total`·`planAt`만 넣는다 (**고정비·손익분기·5-3은 config에 절대 넣지 않는다** — 직원도 읽는 문서). 3-2 표가 12달이 아니면 바꾸지 말고 보고에 적는다.
   - 계약 실적: `projects` 컬렉션 전체를 out_dir로 받고, `config/goal`을 파일로 받아 `python3 -I intranet/tools/goal_snap.py act <projects폴더> <goal.json> 2027` → `config/goal`을 `update`로 `act`(결과 그대로)·`actAt`=지금 (if_version).
   - 마진율은 대표 화면의 현장 원가 집계라 예전 값을 그대로 이어 쓴다 (대표 화면이 열리면 다시 계산됨).
6. 자금 관리 반영: `new_cf_days.json`·`new_cf_items.json`·`new_cf_banks.json`을 각각 `cf_days.json`·`cf_items.json`·`cf_banks.json` 이름으로 바꿔
   Artifact `publish` (`url`=자금 관리, `asset: true`)로 올리고, 나온 url로 `datasets/<id>`를 `update`(if_version): `source.url`, `updated` = `{at: 지금, by: "클로드 매일 19시 자동 (cash flow ... 에서 MM/DD 추가, 원본 그대로)"}`. `cf_days` 설명의 기간·일수도 새 값으로.
7. 원본 사본과 작업 파일을 지운다.
8. 보고: 드라이브 인트라넷 폴더에 `자금일보 자동 반영 YYYY-MM-DD vN.md`를 새로 만든다 (N은 같은 이름 중 가장 큰 번호 + 1, 처음이면 v0. 옛 파일은 그대로).
   - 넣을 것: 읽은 파일, 추가한 날짜와 잔액, 원본과 다른 날짜(차이 목록), 건너뛴 시트와 이유, 최신 잔액 날짜.
   - 넣은 입출금 줄 수(`fincf_new`), '엑셀 확인'만 표시한 줄 수(`fincf_marks`)도 적는다.
   - **새로 추가한 날짜도, 입출금 줄도, 차이도, 건너뛴 것도 없으면 보고 파일을 만들지 않는다.**
