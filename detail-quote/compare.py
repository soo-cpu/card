#!/usr/bin/env python3
"""실제 견적(quotes_*.json) 품목을 기준 단가(prices.json)에 맞춰 보고, 품목별 실제 단가 통계를 만든다.
맞추는 방법: 같은 공정 우선(다른 공정은 유사도 0.9 이상만), 이름(+규격) 글자 유사도 0.8 이상(이름+규격) + 단위가 둘 다 있으면 같아야 함 + 숫자(규격·크기)가 둘 다 있으면 같아야 함.
출력: DATA/stats.json {id:{n,med,min,max,sites}}, DATA/match_report.md (맞춘 예·못 맞춘 수)
사용: python3 compare.py DATA
"""
import glob, json, os, re, statistics, sys
from difflib import SequenceMatcher

def norm(s):
    s = str(s or "")
    s = re.sub(r"\(\s*단위[^)]*\)|단위\s*:\s*[^\s)]+", " ", s)
    s = re.sub(r"[^0-9A-Za-z가-힣]+", "", s)
    return s.lower()

def nums(*a):
    t = re.sub(r"\(\s*단위[^)]*\)", " ", " ".join(str(x or "") for x in a))
    return frozenset(re.findall(r"\d+(?:\.\d+)?", t))

UNIT = {"m2": "㎡", "㎡": "㎡", "m": "m", "M": "m", "ea": "ea", "EA": "ea", "개": "ea", "set": "set", "SET": "set", "조": "set",
        "평": "평", "py": "평", "식": "식", "롤": "롤", "R": "롤"}
def unit(u):
    u = str(u or "").strip()
    return UNIT.get(u, UNIT.get(u.upper(), u.lower())) if u else ""

def main(data):
    prices = json.load(open(os.path.join(data, "prices.json"), encoding="utf-8"))
    by_proc = {}
    for p in prices:
        if not p.get("price"):
            continue
        by_proc.setdefault(p["proc"], []).append((p, norm(p.get("spec")), norm(p["name"]) + norm(p.get("spec")), unit(p.get("unit"))))
    hits, miss, sites = {}, 0, 0
    examples = []
    for f in sorted(glob.glob(os.path.join(data, "quotes_20*.json"))):
        for q in json.load(open(f, encoding="utf-8")):
            sites += 1
            for it in q.get("items", []):
                up = it.get("unitPrice") or 0
                try:
                    up = float(up)
                except (TypeError, ValueError):
                    continue
                if up <= 0:
                    continue
                nm, nms, u = norm(it.get("name")), norm(it.get("name")) + norm(it.get("spec")), unit(it.get("unit"))
                if len(nm) < 2:
                    continue
                best, bs = None, 0
                same = it.get("proc")
                cands = [(c, True) for c in by_proc.get(same, [])] + [(c, False) for k, v in by_proc.items() if k != same for c in v]
                for (p, pn, pns, pu), insame in cands:
                    if u and pu and u != pu:
                        continue
                    qn, pnn = nums(it.get("name"), it.get("spec")), nums(p["name"], p.get("spec"))
                    if qn and pnn and qn != pnn:
                        continue
                    sc = SequenceMatcher(None, nms, pns).ratio()
                    qs = norm(it.get("spec"))
                    if len(qs) >= 4 and len(pn) >= 4:
                        sc = max(sc, SequenceMatcher(None, qs, pn).ratio(), SequenceMatcher(None, nms, pn).ratio())
                    if not insame:
                        sc -= 0.1  # 공정이 다르면 더 엄격하게 (0.9 이상이어야 통과)
                    if sc > bs:
                        best, bs = p, sc
                if best and bs >= 0.8:
                    hits.setdefault(best["id"], []).append((up, q.get("site", ""), q.get("date", "")))
                    if len(examples) < 60:
                        examples.append(f"| {it.get('name')} {it.get('spec') or ''} | {best['name']} {best.get('spec') or ''} | {bs:.2f} |")
                else:
                    miss += 1
    stats = {}
    for pid, v in hits.items():
        ups = [x[0] for x in v]
        stats[pid] = {"n": len(ups), "med": round(statistics.median(ups)), "min": round(min(ups)), "max": round(max(ups)),
                      "sites": sorted({x[1] for x in v})[:8]}
    json.dump(stats, open(os.path.join(data, "stats.json"), "w", encoding="utf-8"), ensure_ascii=False)
    with open(os.path.join(data, "match_report.md"), "w", encoding="utf-8") as fo:
        fo.write(f"현장 {sites}개, 맞춘 품목 {sum(len(v) for v in hits.values())}줄 → 기준 단가 {len(stats)}개, 못 맞춘 줄 {miss}\n\n")
        fo.write("| 실제 견적 품목 | 맞춘 기준 품목 | 유사도 |\n|---|---|---|\n" + "\n".join(examples) + "\n")
    print(f"sites={sites} matchedIds={len(stats)} lines={sum(len(v) for v in hits.values())} miss={miss}")

if __name__ == "__main__":
    main(sys.argv[1])
