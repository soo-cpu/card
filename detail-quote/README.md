# 상세 자동견적 (직원 전용) — 코드만

단가·원가·계정은 이 공개 저장소에 두지 않습니다. 빌드한 화면 파일과 진행 기록은 드라이브 인트라넷 폴더에 있습니다.

| 파일 | 하는 일 |
|---|---|
| template.html | 화면 틀 (로그인·견적 계산·차이 표시·인쇄). 단가 없음 |
| make_recipe.py | 등급 묶음(24·32·42평 수량) → 평형별 계산 규칙 |
| compare.py | 실제 고객 견적 품목을 기준 단가에 맞춰 품목별 통계 |
| make_costs.py | 실제 원가(실행가)가 적힌 견적서 줄 → 품목 원가·공정 원가율 (원가표) |
| build.py | 단가(판매가)·원가를 각각 AES-256으로 잠그고, 계정별 비밀번호(PBKDF2 60만 회)로 열쇠를 나눠 한 파일 HTML 생성 |

빌드: `python3 make_recipe.py DATA && python3 compare.py DATA && python3 build.py DATA OUT.html PASSWORDS.md`
(DATA 폴더는 로컬 전용. 다시 빌드하면 모든 비밀번호가 바뀜)

계정 그대로 내용만 바꿀 때: `python3 make_costs.py DATA && python3 build.py DATA NEW.html --keep OLD.html OLDPW.md`
