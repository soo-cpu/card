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
4. `python3 -I intranet/tools/cf_daily.py "<xlsx>" <작업폴더> <오늘 YYYY-MM-DD>`를 실행한다. 결과 `report.json`을 본다.
   - `added`가 비어 있으면 5~7번은 건너뛴다.
   - `added`의 각 날짜에서 `open_in_out_close_ok`·`lines_sum_ok`·`banks_ok`가 false면 반영은 하되 보고에 적는다.
5. 인트라넷 반영:
   - `fin/cfnew`를 `set` (if_version 고정): `days` = 기존 `cfnew.days` + `added` 날짜 줄(`new_cfhist.json`에서 해당 날짜 줄), 날짜 순. `at`=지금, `src` 유지.
   - 직원 사본: `members` 컬렉션의 각 uid에 대해 `acct/<uid>/fin` 문서 `all`이 있고 `revoked`가 아니면, `update`로 `histNew` = 위 `cfnew.days` 전체, `newAt`=지금. (버전이 다르다고 거절되면 그 버전으로 다시 — 이 두 칸만 바꾼다.)
6. 자금 관리 반영: `new_cf_days.json`·`new_cf_items.json`·`new_cf_banks.json`을 각각 `cf_days.json`·`cf_items.json`·`cf_banks.json` 이름으로 바꿔
   Artifact `publish` (`url`=자금 관리, `asset: true`)로 올리고, 나온 url로 `datasets/<id>`를 `update`(if_version): `source.url`, `updated` = `{at: 지금, by: "클로드 매일 19시 자동 (cash flow ... 에서 MM/DD 추가, 원본 그대로)"}`. `cf_days` 설명의 기간·일수도 새 값으로.
7. 원본 사본과 작업 파일을 지운다.
8. 보고: 드라이브 인트라넷 폴더에 `자금일보 자동 반영 YYYY-MM-DD vN.md`를 새로 만든다 (N은 같은 이름 중 가장 큰 번호 + 1, 처음이면 v0. 옛 파일은 그대로).
   - 넣을 것: 읽은 파일, 추가한 날짜와 잔액, 원본과 다른 날짜(차이 목록), 건너뛴 시트와 이유, 최신 잔액 날짜.
   - **새로 추가한 날짜도, 차이도, 건너뛴 것도 없으면 보고 파일을 만들지 않는다.**
