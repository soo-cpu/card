#!/usr/bin/env python3
"""rules.json 의 등급 묶음(24·32·42평 수량)을 화면 계산 규칙(recipe.json)으로 바꾼다.
수량 규칙
  - 욕실에 딸린 품목(24평 1·32평 2·42평 2 꼴) → 욕실 수 × (32평 값 ÷ 2)
  - 그 밖 → 24·32·42평 값을 이은 꺾은선(평형 비례). 개수 단위는 반올림
  - '35평 이하/45평 이하' 마감 → 평형 조건
  - 타일 부자재 → 간편견적 확정 구간(28평 미만·28~37평·38평 이상)
  - 샷시 → 공급평수 × 평당 단가(간편견적 확정 450,000원)
사용: python3 make_recipe.py DATA   (DATA/rules.json, prices.json 읽고 DATA/recipe.json 씀)
"""
import json, os, sys

PROCS = [  # key, 이름, 기본 선택
    ("demolition", "철거·보양", True), ("sash", "샷시(창호)", False), ("carpentry", "목공·도어", True),
    ("electric", "전기·조명", True), ("film", "필름", True), ("paint", "도장", True), ("tile", "타일", True),
    ("bath", "욕실 도기·부속", True), ("wallpaper", "도배", True), ("floor", "바닥", True),
    ("furniture", "주방·수납가구", True), ("misc", "청소·기타", True),
]
COUNT_UNITS = {"EA", "SET", "개", "식", "조", None, ""}

def interp(q):
    a, b, c = (float(q.get(k, 0) or 0) for k in ("24", "32", "42"))
    lo = f"{a}+({b}-{a})*(py-24)/8"
    hi = f"{b}+({c}-{b})*(py-32)/10"
    return f"max(0,py<=32?{lo}:{hi})"

def qty_expr(item, unit, proc):
    q = item["qty"]
    a, b, c = (float(q.get(k, 0) or 0) for k in ("24", "32", "42"))
    name = item["item"]
    if "35평이하" in name.replace(" ", ""):
        return "1", "py<=35"
    if "45평이하" in name.replace(" ", ""):
        return "1", "py>35"
    bathish = proc == "bath" or "욕실" in name
    if bathish and a > 0 and abs(b - 2 * a) < 1e-9 and abs(c - b) < 1e-9:
        return f"bath*{b/2:g}", None
    if a == b == c:
        return f"{a:g}", None
    e = interp(q)
    if unit in COUNT_UNITS and all(float(x).is_integer() for x in (a, b, c)):
        e = f"max(1,round({e}))"
    else:
        e = f"round(({e})*10)/10"
    return e, None

def main(data):
    rules = json.load(open(os.path.join(data, "rules.json"), encoding="utf-8"))
    prices = {p["id"]: p for p in json.load(open(os.path.join(data, "prices.json"), encoding="utf-8"))}
    g = rules["grades"]
    out = []
    for key, name, d in PROCS:
        lines = []
        if key == "sash":
            per = rules["easy"]["sashPerPy"]
            lines.append({"name": "샷시 전체 교체 (철거·양중·사춤 포함)", "spec": "공급평수 기준", "unit": "평",
                          "qty": "py", "price": per, "note": "간편견적 확정 단가 평당 " + format(per, ",") + "원"})
        for it in g.get(key, {}).get("items", []):
            ids = {k: it.get(k) or [] for k in ("basic", "mid", "high")}
            if key == "carpentry" and it["item"] == "방문":
                ids["basic"] = []  # 기본 등급은 방문 교체 대신 필름 리폼 (인트라넷 v0.99-37 결정과 같게)
            groups = {}
            for gr in ("basic", "mid", "high"):
                groups.setdefault(tuple(ids[gr]), []).append(gr)
            for idl, grs in groups.items():
                if not idl:
                    continue
                for pid in idl:
                    if pid not in prices:
                        continue
                    e, when = qty_expr(it, prices[pid].get("unit"), key)
                    ln = {"id": pid, "qty": e, "note": it["item"]}
                    if len(grs) < 3:
                        ln["grades"] = grs
                    if when:
                        ln["when"] = when
                    lines.append(ln)
        if key == "wallpaper":
            # 도배 노무 수량은 간편견적 확정식(전용면적 ≈ 공급평×3.3058×0.76 를 15로 나눔)으로 바꿈
            for ln in lines:
                if ln.get("id") == "X09":
                    ln["qty"] = "round(round(py*3.3058*0.76)/15*10)/10"
                    ln["note"] = "도배 노무 (간편견적 수량식: 전용면적÷15)"
            if "X10" in prices:  # 실제 견적 23곳에 들어간 샤시·문틀 퍼티 바탕작업
                lines.append({"id": "X10", "qty": "1", "note": "바탕작업 퍼티 (샤시·문틀) — 실제 견적 대부분 포함"})
        if key == "film" and "U0338" in prices:
            # 기본 등급은 방문을 바꾸지 않고 필름 리폼 (상세견적 분석: 기본=필름 리폼, 중급 이상=방문 교체)
            lines.append({"id": "U0338", "qty": "room", "grades": ["basic"], "note": "방문 필름 리폼 (문틀·문짝 세트)"})
        if key == "tile":
            for t in rules["easy"]["tileSub"]:
                w = t["rule"].replace("28<=py<38", "py>=28?py<38:0")
                lines.append({"id": t["id"], "qty": "1", "when": w, "note": "타일 부자재 (간편견적 평형 구간)"})
        if lines:
            out.append({"key": key, "name": name, "def": d, "lines": lines})
    json.dump({"procs": out}, open(os.path.join(data, "recipe.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("recipe:", {p["key"]: len(p["lines"]) for p in out})

if __name__ == "__main__":
    main(sys.argv[1])
