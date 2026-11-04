#!/usr/bin/env python3
"""매일 자금일보 반영 도구 (원본은 읽기만).

cash flow(YYYY)M월.xlsx 의 날짜 시트(예: '11.04일')를 읽어서
 - 인트라넷 fin/cfhist 의 days 줄  [날짜, 입금, 지출, 잔액]
 - 「홈퍼니싱 자금 관리」 cf_days / cf_items / cf_banks 줄
을 새로 만든다. 이미 있는 날짜는 고치지 않고, 원본과 다르면 차이 목록에만 적는다.

계좌번호는 지우고, 급여·퇴직연금·상여 줄과 대표 차입·가수금 줄은 내용을 가린다.
이 파일에는 회사 숫자를 넣지 않는다 (코드만).

사용:
  python3 -I cf_daily.py 원본.xlsx 작업폴더 [오늘날짜 YYYY-MM-DD]
작업폴더에 있어야 하는 것: cfhist.json (fin/cfhist 문서), cf_days.json, cf_items.json, cf_banks.json
만드는 것: 같은 폴더에 new_cfhist.json, new_cf_days.json, new_cf_items.json, new_cf_banks.json, report.json
"""
import datetime, json, os, re, sys

import openpyxl

SAL = ("급여", "퇴직연금", "퇴직금", "상여", "인건비")
LOAN_IN = ("가수금", "차입")
LOAN_OUT = ("가수금 상환", "차입금 상환", "가수금 일부", "가수금상환", "차입금상환")
ORG = re.compile(r"은행|농협|신한|국민|하나|우리|기업|공제|보증|재단|공단|캐피탈|저축|대출|기보|신보|중진공|소진공|금고")
ACC = re.compile(r"(?<!\d)[\d*][\d*\-]{4,}[\d*](?!\d)")


def clean(s):
    """계좌번호·주민번호 모양 숫자를 지운다 (날짜는 둔다)."""
    s = str(s or "").strip()
    s = re.sub(r"\d{6}-\d{7}", "", s)

    def rep(m):
        t = m.group(0)
        if re.fullmatch(r"\d{4}-\d{1,2}-\d{1,2}", t):
            return t
        if len(re.sub(r"\D", "", t)) >= 5 or "*" in t:
            return ""
        return t

    s = ACC.sub(rep, s)
    return re.sub(r"\s+", " ", s).strip()[:80]


def mask(kind, desc, who):
    txt = desc + " " + who
    if any(w in txt for w in SAL):
        return "급여·인건비 (대표 전용)", ""
    if kind == "지출" and any(w in txt for w in LOAN_OUT):
        return "대표 차입·가수금 상환", ""
    if kind == "입금" and any(w in txt for w in LOAN_IN) and not ORG.search(txt):
        return "대표 차입·가수금", ""
    if "대표" in txt and ("차입" in txt or "가수" in txt):
        return ("대표 차입·가수금" if kind == "입금" else "대표 차입·가수금 상환"), ""
    return desc, who


def n(v):
    if v in (None, ""):
        return None
    if isinstance(v, (int, float)):
        return v
    try:
        return float(str(v).replace(",", "").strip())
    except ValueError:
        return None


def ival(v):
    v = n(v)
    return None if v is None else (int(v) if float(v).is_integer() else v)


def sheet_date(name, year):
    m = re.match(r"\s*(\d{1,2})\s*\.\s*(\d{1,2})", name)
    if not m:
        return None
    try:
        return datetime.date(year, int(m.group(1)), int(m.group(2))).isoformat()
    except ValueError:
        return None


def read_sheet(ws):
    rows = [list(r) + [None] * 16 for r in ws.iter_rows(max_row=80, max_col=16, values_only=True)]
    op = ival(rows[5][6]) if len(rows) > 5 else None
    inn = out = close = None
    its = []
    for i, r in enumerate(rows):
        if isinstance(r[2], str) and "입금계" in r[2].replace(" ", ""):
            inn = ival(r[6])
        if isinstance(r[10], str) and "지출계" in r[10].replace(" ", ""):
            out = ival(r[11])
        if 7 <= i <= 25:
            if r[2] and n(r[6]) is not None:
                d, w = mask("입금", clean(r[2]), clean(r[7]))
                its.append(("입금", d, w, ival(r[6]), clean(r[8]) if w else ""))
            if r[10] and n(r[11]) is not None:
                d, w = mask("지출", clean(r[10]), clean(r[12]))
                its.append(("지출", d, w, ival(r[11]), ""))
    bals = []
    for r in rows[29:37]:
        lab = r[5].strip() if isinstance(r[5], str) else ""
        if lab == "합계":
            close = ival(r[11])
        elif lab:
            bals.append(ival(r[11]) or 0)
    return op, inn, out, close, its, bals


def main():
    xlsx, wd = sys.argv[1], sys.argv[2]
    today = sys.argv[3] if len(sys.argv) > 3 else datetime.date.today().isoformat()
    ym = re.search(r"\((\d{4})\)\s*(\d{1,2})\s*월", os.path.basename(xlsx))
    if not ym:
        sys.exit("파일 이름에서 연·월을 못 읽었어요: " + xlsx)
    year, mon = int(ym.group(1)), int(ym.group(2))
    pmon = 12 if mon == 1 else mon - 1
    L = lambda f: json.load(open(os.path.join(wd, f), encoding="utf8"))
    hist = L("cfhist.json")
    days, items, banks = L("cf_days.json"), L("cf_items.json"), L("cf_banks.json")
    H = {r[0]: r for r in hist["days"]}
    D = {r["d"]: r for r in days}
    last_bank_d = max(b["d"] for b in banks)
    names = [b["name"] for b in banks if b["d"] == last_bank_d]

    wb = openpyxl.load_workbook(xlsx, data_only=True, read_only=True)
    rep = {"file": os.path.basename(xlsx), "today": today, "added": [], "same": [], "diff": [], "skip": []}  # added[].to = 새로 넣을 곳 (인트라넷 / 자금 관리)
    new_h, new_d, new_i, new_b = [], [], [], []
    for sn in wb.sheetnames:
        m = re.match(r"\s*(\d{1,2})\s*\.", sn)
        if not m or int(m.group(1)) not in (mon, pmon):
            continue  # 이번 달·지난달 시트만 (1월 파일의 12월 시트는 작년)
        d = sheet_date(sn, year - 1 if (mon == 1 and int(m.group(1)) == 12) else year)
        if not d or d > today:
            continue
        op, inn, out, close, its, bals = read_sheet(wb[sn])
        if close is None or inn is None or out is None:
            rep["skip"].append({"d": d, "sheet": sn, "why": "잔액·입금계·지출계 칸이 비어 있음"})
            continue
        in_h, in_d = d in H, d in D
        if in_h:
            h = H[d]
            if [h[1], h[2], h[3]] == [inn, out, close]:
                rep["same"].append(d)
            else:
                rep["diff"].append({"d": d, "sheet": sn, "intranet": h[1:4], "original": [inn, out, close]})
        if in_d:
            x = D[d]
            if [x.get("in"), x.get("out"), x.get("close")] != [inn, out, close]:
                rep["diff"].append({"d": d, "sheet": sn, "dashboard": [x.get("in"), x.get("out"), x.get("close")], "original": [inn, out, close]})
        if in_h and in_d:
            continue
        ok = (op or 0) + inn - out == close
        si = sum(x[3] or 0 for x in its if x[0] == "입금")
        so = sum(x[3] or 0 for x in its if x[0] == "지출")
        bank_ok = len(bals) == len(names) and sum(bals) == close
        if not in_h:
            new_h.append([d, inn, out, close])
        if not in_d:
            new_d.append({"d": d, "open": op, "in": inn, "out": out, "close": close, "ok": ok, "sheet": sn})
            for k, (t, desc, who, amt, note) in enumerate(its, 1):
                new_i.append({"id": "%s-%03d" % (d, k), "d": d, "t": t, "desc": desc, "who": who, "amt": amt, "note": note})
            if len(bals) == len(names):
                new_b += [{"d": d, "name": nm, "bal": b} for nm, b in zip(names, bals)]
        rep["added"].append({"d": d, "sheet": sn, "to": ([] if in_h else ["인트라넷"]) + ([] if in_d else ["자금 관리"]),
                             "in": inn, "out": out, "close": close, "lines": len(its),
                             "open_in_out_close_ok": ok, "lines_sum_ok": si == inn and so == out, "banks_ok": bank_ok})

    # 날짜 순서 유지 (월이 바뀌어도 맨 뒤가 가장 최신)
    srt = lambda a, key: sorted(a, key=key)
    hist2 = dict(hist)
    hist2["days"] = srt(hist["days"] + new_h, lambda r: r[0])
    W = lambda f, o: json.dump(o, open(os.path.join(wd, f), "w", encoding="utf8"), ensure_ascii=False)
    W("new_cfhist.json", hist2)
    W("new_cf_days.json", srt(days + new_d, lambda r: r["d"]))
    W("new_cf_items.json", srt(items + new_i, lambda r: r["id"]))
    W("new_cf_banks.json", srt(banks + new_b, lambda r: r["d"]))
    rep["latest"] = hist2["days"][-1] if hist2["days"] else None
    W("report.json", rep)
    print(json.dumps({k: rep[k] for k in ("added", "diff", "skip", "latest")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
