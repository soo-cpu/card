#!/usr/bin/env python3
"""목표 관리 매일 갱신 (19시 자동 작업 5-3, 대표 지시 2026-11-10). 회사 숫자는 넣지 않는다 (코드만).

1) 사업계획 파일 읽기: 드라이브에서 받은 '2027 사업계획 YYYY-MM-DD vN.md'를 인트라넷 화면과 같은 규칙으로 읽는다
   (3-2 월별 목표표 · 현장 마진율 · 매출 구성 비중 · 연 고정비 합계 · 손익분기 매출 · 5-3 성과급 기준)
2) 계약 실적 줄: 인트라넷 projects 문서들에서 계약 금액이 있는 프로젝트를 모아 config/goal 의 act 를 새로 만든다.
   계약 금액 = 계약 금액 ÷ 1.1 (공급가), 구분 = '구분' 칸(주거 / 관공서·학교 / 기타), 계약일 = '계약일'(없으면 예전 줄의 날짜 유지).
   현장 마진율은 대표 화면의 현장 원가(주간) 집계 값이라, 예전 config/goal 의 같은 프로젝트 값을 그대로 쓴다 (대표 화면이 열리면 다시 계산).

사용:
  python3 -I goal_snap.py plan 사업계획.md 파일이름 > goalplan.json
  python3 -I goal_snap.py act projects폴더 이전_goal.json 연도 > act.json
"""
import json, os, re, sys


def n(s):
    t = re.sub(r"[^\d]", "", str(s or ""))
    return int(t) if t else 0


def parse(md):
    L = md.replace("\r", "").split("\n")
    cells = lambda l: [re.sub(r"[*=`\\]", "", c).strip() for c in l.split("|")[1:-1]]
    months = []
    i = next((k for k, l in enumerate(L) if re.match(r"^#+\s*3-2\b", l.strip())), -1)
    if i >= 0:
        head = None
        for l in L[i + 1:]:
            l = l.strip()
            if l.startswith("#"):
                break
            if not l.startswith("|"):
                continue
            c = cells(l)
            if head is None:
                head = c
                continue
            if all(re.fullmatch(r":?-+:?", x) for x in c):
                continue
            mm = re.fullmatch(r"(\d{1,2})\s*월", c[0])
            if not mm:
                continue
            ix = lambda k: next((j for j, h in enumerate(head) if k in h), -1)
            it, ir, ip = ix("월 목표"), ix("주거"), ix("관공서")
            months.append({"m": int(mm.group(1)), "tot": n(c[it if it >= 0 else 1]), "res": n(c[ir]) if ir >= 0 else 0, "pub": n(c[ip]) if ip >= 0 else 0})
    txt = re.sub(r"[*=`\\]", "", "\n".join(L))
    m = re.search(r"현장 마진율\s*\|\s*([\d.]+)\s*%", txt)
    margin = float(m.group(1)) if m else None
    if margin is not None and margin.is_integer():
        margin = int(margin)
    mx = re.search(r"매출 구성\s*\|[^\n]*?주거[^\n|]*?(\d+(?:\.\d+)?)%[^\n]*?관공서[^\n|]*?(\d+(?:\.\d+)?)%", txt)
    w = lambda p: n(re.search(p, txt).group(1)) if re.search(p, txt) else 0
    s53 = []
    k = next((j for j, l in enumerate(L) if re.match(r"^#+\s*5-3\b", l.strip())), -1)
    if k >= 0:
        for j in range(k, len(L)):
            l = L[j]
            if j > k and (re.match(r"^#{1,3}\s", l.strip()) or l.strip().startswith("---")):
                break
            if l.strip():
                s53.append(re.sub(r"^#+\s*", "", re.sub(r"[*=`\\]", "", l)).strip())
    months.sort(key=lambda x: x["m"])
    tot = sum(x["tot"] for x in months)
    res = sum(x["res"] for x in months)
    pub = sum(x["pub"] for x in months)
    mr = int(mx.group(1)) if mx else (round(res / tot * 100) if tot else None)
    mp = int(mx.group(2)) if mx else (round(pub / tot * 100) if tot else None)
    return {"months": months, "margin": margin, "mixRes": mr, "mixPub": mp, "fixed": w(r"연 고정비 합계\s*\|\s*([\d,]+)"),
            "bep": w(r"손익분기 매출\s*\|\s*([\d,]+)"), "sec53": s53, "total": tot, "ok": len(months) == 12 and tot > 0}


def kind(cat):
    cat = str(cat or "")
    return "주거" if cat == "주거" else "관공서" if re.search(r"관공서|학교", cat) else "기타"


def act(pdir, prev_path, year):
    prev = json.load(open(prev_path, encoding="utf8")) if prev_path and os.path.exists(prev_path) else {}
    prev = prev.get("data", prev)
    old = {x["no"]: x for x in ((prev.get("act") or {}).get("list") or [])}
    out, nodate = [], []
    for f in sorted(os.listdir(pdir)):
        if not f.endswith(".json") or f.startswith("."):
            continue
        try:
            d = json.load(open(os.path.join(pdir, f), encoding="utf8"))
        except Exception:
            continue
        p = d.get("data", d)
        no = p.get("no") or f[:-5]
        amt = n(p.get("contractAmt"))
        if not amt or p.get("stage") == "미계약 종료":
            continue
        dt = str(p.get("cdate") or "")[:10] or (old.get(no) or {}).get("d", "")
        if not dt:
            nodate.append(no)
            continue
        y = int(dt[:4])
        if y < year - 1 or y > year:
            continue
        out.append({"d": dt, "no": no, "t": p.get("title") or "", "amt": round(amt / 1.1), "kind": kind(p.get("cat")), "mg": (old.get(no) or {}).get("mg")})
    out.sort(key=lambda x: x["d"])
    return {"list": out, "noDate": nodate}


if __name__ == "__main__":
    if sys.argv[1] == "plan":
        g = parse(open(sys.argv[2], encoding="utf8").read())
        m = re.search(r"(\d{4}-\d{2}-\d{2})\s*v(\d+)", sys.argv[3])
        g["src"] = {"title": sys.argv[3], "date": m.group(1) if m else "", "v": int(m.group(2)) if m else 0}
        print(json.dumps(g, ensure_ascii=False))
    else:
        print(json.dumps(act(sys.argv[2], sys.argv[3], int(sys.argv[4])), ensure_ascii=False))
