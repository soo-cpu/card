#!/usr/bin/env python3
"""실제 원가(실행가)가 적힌 고객 견적서에서 원가표를 만든다.
입력: DATA/cost_rows_*.json  {rows:[{site,kind,proc,name,spec,unit,qty,saleUnit,costUnit,costUnitExVat?,...}], procTotals:[{site,proc,saleSum,costSum}]}
      DATA/prices.json (기준 단가)
규칙
  1) 품목 원가: 원가 줄을 기준 단가 품목에 맞춤(compare.py 와 같은 방법). 맞은 값들의 가운데 값.
     - 원가가 부가세 포함이면 1.1로 나눈 값을 씀
     - 원가가 기준 판매 단가보다 높으면 그 품목은 쓰지 않고 '확인 필요'로 남김
  2) 공정 원가율: 주거 현장의 공정별 (원가 합 ÷ 판매 합)의 가운데 값. 품목 원가가 없는 줄에 판매 단가 × 원가율로 씀
  3) 둘 다 없으면 화면의 추정 마진율(기본 28%)
출력: prices.json 에 cost·costSrc 채움(원본은 prices_base.json 으로 한 번 보관), meta.json 에 procCostRate, DATA/costs_table.json
사용: python3 make_costs.py DATA
"""
import glob, json, os, shutil, statistics, sys
from difflib import SequenceMatcher
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compare import norm, unit, nums

TOOL_PROC = {"plumbing": "electric"}  # 화면 공정에 맞춤 (설비는 전기·설비로 묶음)

def match(it, by_proc):
    nms, u = norm(it.get("name")) + norm(it.get("spec")), unit(it.get("unit"))
    if len(norm(it.get("name"))) < 2:
        return None, 0
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
            sc -= 0.1
        if sc > bs:
            best, bs = p, sc
    return (best, bs) if best and bs >= 0.8 else (None, bs)

def main(data):
    base_path, cur_path = os.path.join(data, "prices_base.json"), os.path.join(data, "prices.json")
    if not os.path.exists(base_path):
        shutil.copy(cur_path, base_path)
    prices = json.load(open(base_path, encoding="utf-8"))
    by_proc = {}
    for p in prices:
        if p.get("price"):
            by_proc.setdefault(p["proc"], []).append((p, norm(p.get("spec")), norm(p["name"]) + norm(p.get("spec")), unit(p.get("unit"))))
    rows, totals = [], []
    for f in sorted(glob.glob(os.path.join(data, "cost_rows_*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        rows += d.get("rows", [])
        totals += d.get("procTotals", [])
    sites_kind = {r["site"]: r.get("kind", "residential") for r in rows}
    hits, unmatched, over = {}, 0, []
    for r in rows:
        c = r.get("costUnitExVat") or r.get("costUnit")
        try:
            c = float(c)
        except (TypeError, ValueError):
            continue
        if c <= 0 or r.get("proc") == "indirect":
            continue
        p, sc = match(r, by_proc)
        if not p:
            unmatched += 1
            continue
        hits.setdefault(p["id"], []).append({"cost": c, "site": r["site"], "kind": r.get("kind"), "name": r.get("name"), "spec": r.get("spec"), "score": round(sc, 2)})
    table = []
    pmap = {p["id"]: p for p in prices}
    for pid, v in hits.items():
        med = statistics.median(x["cost"] for x in v)
        p = pmap[pid]
        ok = med < p["price"]
        rec = {"id": pid, "proc": p["proc"], "name": p["name"], "spec": p.get("spec"), "unit": p.get("unit"), "price": p["price"],
               "cost": round(med), "n": len(v), "min": round(min(x["cost"] for x in v)), "max": round(max(x["cost"] for x in v)),
               "rate": round(med / p["price"], 3) if p["price"] else None, "use": ok, "sites": sorted({x["site"] for x in v}),
               "from": [f"{x['name']} {x.get('spec') or ''}".strip() for x in v][:4]}
        table.append(rec)
        if ok:
            p["cost"], p["costSrc"] = round(med), f"실제 원가 {len(v)}건"
        else:
            over.append(pid)
    # 공정 원가율 (주거 현장, 현장별 원가율의 가운데 값)
    per = {}
    for t in totals:
        if sites_kind.get(t["site"], "residential") != "residential":
            continue
        k = TOOL_PROC.get(t["proc"], t["proc"])
        if k == "indirect" or not t.get("saleSum") or not t.get("costSum"):
            continue
        per.setdefault(k, {}).setdefault(t["site"], [0, 0])
        per[k][t["site"]][0] += t["costSum"]
        per[k][t["site"]][1] += t["saleSum"]
    rate = {}
    for k, sites in per.items():
        rs = [c / s for c, s in sites.values() if s > 0 and 0 < c / s < 1.2]
        if rs:
            rate[k] = {"rate": round(statistics.median(rs), 3), "n": len(rs), "min": round(min(rs), 3), "max": round(max(rs), 3)}
    json.dump(prices, open(cur_path, "w", encoding="utf-8"), ensure_ascii=False)
    mp = os.path.join(data, "meta.json")
    meta = json.load(open(mp, encoding="utf-8"))
    meta["procCostRate"] = rate
    json.dump(meta, open(mp, "w", encoding="utf-8"), ensure_ascii=False)
    json.dump({"items": sorted(table, key=lambda x: (x["proc"], x["id"])), "procRate": rate, "unmatched": unmatched, "rows": len(rows),
               "sites": sorted(sites_kind), "over": over}, open(os.path.join(data, "costs_table.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    used = sum(1 for p in prices if p.get("cost") is not None)
    print(f"rows={len(rows)} matchedIds={len(table)} used={used} over(원가>판매가)={len(over)} unmatched={unmatched} procRate={ {k: v['rate'] for k, v in rate.items()} }")

if __name__ == "__main__":
    main(sys.argv[1])
