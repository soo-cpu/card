#!/usr/bin/env python3
"""콘텐츠 자동 점검 (brand-reviewer 보조).

사용법
  python3 check_content.py dup  <주제표.md> [used-topics.md]   # 주제 중복 검사
  python3 check_content.py lint <폴더 또는 파일> [...]          # 이모지·금지어·개인정보 검사

dup  : 주제표의 각 행(| 번호 | 주제 | 키워드 | ...)을 used-topics.md 키워드와 비교해
       겹치는 키워드 수를 보여 준다. 3개 이상이면 '확인 필요', 같은 현장+공간이면 '중복'.
lint : 기계적으로 잡을 수 있는 것만 잡는다. 통과해도 사람이 읽는 검토는 따로 한다.
종료 코드: lint 에서 '막음' 등급이 하나라도 있으면 1.
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_USED = os.path.join(HERE, "..", "references", "used-topics.md")

EMOJI = re.compile(
    "[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F000-\U0001F2FF"
    "\U00002B00-\U00002BFF\U0000FE0F\U0001F900-\U0001F9FF]"
)

# (패턴, 등급, 설명)  등급: 막음 = 그대로 올리면 안 됨, 확인 = 사람이 판단
RULES = [
    (r"원가|원가율|마진|이윤|매입가|단가표|노임|인건비 단가", "막음", "원가·마진 정보"),
    (r"010[-. ]?\d{3,4}[-. ]?\d{4}", "막음", "휴대폰 번호"),
    (r"031[-. ]?513|02[-. ]?\d{3,4}[-. ]?\d{4}", "확인", "대표번호 외 전화번호"),
    (r"\d{2,4}\s*동\s*\d{2,4}\s*호|\d{3,4}호", "막음", "동·호수"),
    (r"(고객|님)\s*[가-힣]{2,3}\s*님|[가-힣]{2,3}\s*고객님", "확인", "고객 이름일 수 있음"),
    (r"최저가|최고급|업계 ?1위|업계 ?최초|유일한|무조건|100 ?%|완벽 시공|하자 ?제로|추가금 ?없|평생 ?보증|국내 ?최고", "막음", "과장 광고 표현"),
    (r"알아보겠습니다|살펴볼까요|결론적으로|다양한|효과적인|의 모든 것|꿀팁|놓치지 마세요|여러분|대박|역대급", "확인", "AI 티·과장 말투"),
    (r"계약금|계약 금액|총 ?\d{1,3},?\d{3}만 ?원에 계약", "확인", "개별 현장 금액일 수 있음"),
]

AMOUNT = re.compile(r"\d[\d,]*\s*만\s*원|\d[\d,]*\s*만~|\d+억")
CONDITION = re.compile(r"부가세|샷시 제외|실측 후|현장마다|범위")


def lint_text(path, text):
    out = []
    for i, line in enumerate(text.splitlines(), 1):
        if EMOJI.search(line):
            out.append((path, i, "막음", "이모지", line.strip()[:80]))
        for pat, level, desc in RULES:
            if re.search(pat, line):
                out.append((path, i, level, desc, line.strip()[:80]))
        if line.count("!") + line.count("！") >= 2:
            out.append((path, i, "확인", "느낌표 여러 개", line.strip()[:80]))
    # 금액이 나오는데 조건 문구가 같은 파일 어디에도 없으면 확인
    if AMOUNT.search(text) and not CONDITION.search(text):
        out.append((path, 0, "확인", "금액은 있는데 '부가세 포함·샷시 제외·실측 후 확정' 조건 없음", ""))
    return out


def iter_files(targets):
    for t in targets:
        if os.path.isdir(t):
            for root, _, files in os.walk(t):
                for f in sorted(files):
                    if f in INTERNAL:
                        continue
                    if f.endswith((".md", ".txt", ".csv")):
                        yield os.path.join(root, f)
        else:
            yield t


def cmd_lint(targets):
    results = []
    for p in iter_files(targets):
        with open(p, encoding="utf-8") as fh:
            results += lint_text(p, fh.read())
    block = [r for r in results if r[2] == "막음"]
    for r in results:
        print(f"[{r[2]}] {r[0]}:{r[1]} {r[3]} | {r[4]}")
    print(f"\n합계: 막음 {len(block)}건, 확인 {len(results) - len(block)}건")
    return 1 if block else 0


def parse_rows(path):
    rows = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            if not line.startswith("|") or set(line.strip()) <= set("|-: "):
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            rows.append(cells)
    return rows


def kw(cells):
    text = " ".join(cells)
    parts = re.split(r"[,·/\s]+", text)
    return {p for p in parts if len(p) >= 2 and p not in STOP}


# 내부 자료라 공개 검사에서 빼는 파일 (폴더 단위 검사일 때만)
INTERNAL = {"현장사진_목록.md", "99_검토 결과.md"}

# 어느 주제에나 나오는 말은 비교에서 뺀다
STOP = {
    "-", "주제", "키워드", "현장", "출처", "같은", "다른", "공사", "전체", "아파트", "인테리어",
    "집", "있음", "일부", "확인", "필요", "촬영", "사진", "불필요", "유튜브", "인스타", "블로그",
    "쇼츠", "릴스", "카드뉴스", "글", "장면", "진행", "묶음", "근거", "기준", "응대", "견적서",
    "기초데이터", "지명원", "실적", "과정형", "사례", "콘텐츠", "중", "주", "월", "화", "수", "목",
    "금", "토", "일", "10일치", "2026-11-19", "v2", "v1",
}


def cmd_dup(plan, used):
    used_rows = [r for r in parse_rows(used) if len(r) >= 5 and r[0] != "출처"]
    plan_rows = [r for r in parse_rows(plan) if r and not r[0].startswith(("번호", "#"))]
    worst = 0
    for r in plan_rows:
        k = kw(r)
        best, hit = 0, None
        for u in used_rows:
            uk = kw([u[1], u[2], u[4]])
            n = len(k & uk)
            if n > best:
                best, hit = n, u
        if best >= 4:
            verdict = "중복 의심"
            worst = max(worst, 2)
        elif best == 3:
            verdict = "확인 필요"
            worst = max(worst, 1)
        else:
            verdict = "통과"
        ref = f" ← {hit[0]} / {hit[3]}" if hit and best >= 3 else ""
        print(f"{verdict:6} 겹친 키워드 {best}개 | {' | '.join(r[:2])}{ref}")
    return 1 if worst == 2 else 0


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in {"dup", "lint"}:
        print(__doc__)
        sys.exit(2)
    if sys.argv[1] == "lint":
        sys.exit(cmd_lint(sys.argv[2:]))
    used = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_USED
    sys.exit(cmd_dup(sys.argv[2], used))
