# 타사 견적 비교기 (compare) 2026-11-21 v0

고객이 받은 다른 업체 견적서(사진·PDF)를 Claude가 읽어 우리 10공정(철거·목공·전기·설비·타일·욕실·도배·필름·바닥·주방)으로 나누고,
빠진 공정·수량·자재 등급·나중에 추가될 항목을 찾아 고객용 한 장과 직원용 메모를 만듭니다.

- 직원 화면은 비공개 Claude 화면으로 배포합니다 (이 저장소의 GitHub Pages에는 올리지 않음).
- 사용법·시험 결과: 드라이브 'Claude 자료함' › `타사 견적 비교기 2026-11-21 v0`

## 파일
| 파일 | 역할 |
|---|---|
| `engine.js` | 비교 담당: 10공정 분류, 빠진 공정·금액 범위·수량·자재 등급·추가 가능 항목·별도 문구·부가세 점검, “형, 이렇게 설명하세요” 문장, reviewer 검사, 읽기 지시문 |
| `docs.js` | 문서 담당: 고객용 한 장(HTML·A4) + 직원용 설명 메모(Markdown) + 내보내기 전 검사 |
| `page.tpl.html` | 직원 화면 틀 (읽기는 Claude `sample` 기능으로 사진·PDF 쪽을 읽음) |
| `base-data.sample.js` | 기준 표 형식 예시. **실제 값(`base-data.js`)은 비공개라 저장소에 없음** |
| `tools/` | 시험 견적 가리기(`mask_*.py`), 화면 만들기(`build.js`), 시험(`run_tests.js`), 시험 결과 PDF(`report.js`) |

## 실행 (compare/ 에서)
```
node tools/build.js        # work/타사 견적 비교기.html
node tools/run_tests.js    # work/out/ 시험 산출물 + 자동 검사
node tools/report.js       # work/out/타사 견적 비교기 시험 결과 ….pdf
```
`base-data.js`(비공개)와 `work/read_*.json`(읽기 결과)이 있어야 합니다.

## 보안
- 원가·마진·실행원가·원가율 숫자와 낱말은 어떤 산출물에도 넣지 않습니다. `review()`에 걸리면 내보내기가 잠깁니다.
- 고객 이름·전화번호·동호수는 읽기 단계에서 옮기지 않습니다.

ⓒ HOME FURNISHING CO. all rights reserved.
