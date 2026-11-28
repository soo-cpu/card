#!/usr/bin/env python3
"""자금일보 시트 미리 보기 자료 만들기 (원본은 읽기만).

cash flow(YYYY)M월.xlsx 의 날짜 시트(예: '11.04일')를 그대로 표 모양(글자·병합·굵게·칸 색·열 너비)으로 옮긴다.
인트라넷 캐시플로우 '엑셀 원본 보기'가 이 자료로 그날 시트를 보여 준다 (보기만, 수정 불가).
보안: 계좌번호·주민번호 모양 숫자는 지우고, 급여·퇴직연금·상여 줄과 대표 차입·가수금 줄은 cf_daily.py 와 같은 규칙으로 내용을 가린다.
이 파일에는 회사 숫자를 넣지 않는다 (코드만).

사용:
  python3 -I cf_sheet.py 원본.xlsx 작업폴더 [시작날짜 YYYY-MM-DD]
만드는 것: 작업폴더/cf_sheets.json = {"cfsheet-YYYY-MM": {"days": {"YYYY-MM-DD": {...}}}}
  각 날짜: file, sheet, rows(글자 2차원 배열), m(병합 [행,열,행끝,열끝] 0부터), w(열 너비), b(굵은 칸 "행,열"), f({"행,열": "#색"}), al({"행,열": "r|c"})
  ar: 그날 시트 오른쪽 아래 '미수금(물대+시공)' 표 그대로 (대표 지시 2026-11-10, 인트라넷 미수금 메뉴의 정답)
      {"rows": [{"r","tot","mon","name","left","cost","pj","memo"}], "total", "totalLabel"}
      열: 총 계약금(VAT포함) / 월 / 업체명 / 현재 미수액(VAT포함) / 실행가 / PJ 담당 / 비고. 맨 아래 'N/N일 기준 미수금' 줄 = total
"""
import datetime, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import openpyxl
from cf_daily import clean, mask, sheet_date

MAXR, MAXC = 40, 16


def txt(v):
    if v is None:
        return ""
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime("%m.%d")
    if isinstance(v, bool):
        return str(v)
    if isinstance(v, (int, float)):
        if float(v).is_integer():
            return "{:,}".format(int(v))
        return "{:,.2f}".format(v)
    t = clean(v)
    return re.sub(r"\)\s*\d{4,}$", ")", t)  # 은행 이름 뒤 계좌 끝자리도 지움


def color(c):
    try:
        f = c.fill
        if f is None or f.fill_type != "solid":
            return ""
        rgb = f.fgColor.rgb if f.fgColor is not None and f.fgColor.type == "rgb" else None
        if isinstance(rgb, str) and len(rgb) == 8 and rgb not in ("00000000", "FFFFFFFF"):
            return "#" + rgb[2:]
    except Exception:
        pass
    return ""


def snap(ws):
    rows = []
    b, f, al = [], {}, {}
    for r in range(1, MAXR + 1):
        row = []
        for c in range(1, MAXC + 1):
            cell = ws.cell(r, c)
            row.append(txt(cell.value))
            try:
                if cell.font is not None and cell.font.b:
                    b.append("%d,%d" % (r - 1, c - 1))
            except Exception:
                pass
            col = color(cell)
            if col:
                f["%d,%d" % (r - 1, c - 1)] = col
            if isinstance(cell.value, (int, float)) and not isinstance(cell.value, bool):
                al["%d,%d" % (r - 1, c - 1)] = "r"
            else:
                try:
                    if cell.alignment is not None and cell.alignment.horizontal in ("center", "centerContinuous"):
                        al["%d,%d" % (r - 1, c - 1)] = "c"
                except Exception:
                    pass
        rows.append(row)
    # 급여·대표 차입 줄 가리기 (8~26행: 입금 C·H·I열, 지출 K·M열)
    for i in range(7, 26):
        r = rows[i]
        if r[2] and r[6]:
            d, w = mask("입금", r[2], r[7])
            if d != r[2]:
                r[2], r[7], r[8] = d, "", ""
        if r[10] and r[11]:
            d, w = mask("지출", r[10], r[12])
            if d != r[10]:
                r[10], r[12] = d, ""
    while rows and not any(rows[-1]):
        rows.pop()
    used = max([max([j for j, v in enumerate(r) if v] or [-1]) for r in rows] or [-1]) + 1
    used = max(used, 1)
    rows = [r[:used] for r in rows]
    m = []
    for rg in ws.merged_cells.ranges:
        if rg.min_row <= len(rows) and rg.min_col <= used:
            m.append([rg.min_row - 1, rg.min_col - 1, min(rg.max_row, len(rows)) - 1, min(rg.max_col, used) - 1])
    w = []
    for c in range(1, used + 1):
        L = openpyxl.utils.get_column_letter(c)
        d = ws.column_dimensions.get(L)
        w.append(round(d.width, 1) if d is not None and d.width else 9)
    keep = lambda k: int(k.split(",")[0]) < len(rows) and int(k.split(",")[1]) < used
    return {"rows": rows, "m": m, "w": w, "b": [k for k in b if keep(k)], "f": {k: v for k, v in f.items() if keep(k)}, "al": {k: v for k, v in al.items() if keep(k)}}


AR_COLS = [("tot", "총계약금"), ("mon", "월"), ("name", "업체명"), ("left", "현재미수액"), ("cost", "실행가"), ("pj", "PJ담당"), ("memo", "비고")]


def amt(v):
    """숫자 칸은 원본 숫자 그대로 (반올림만). 글자면 쉼표를 뺀 숫자, 아니면 None."""
    if isinstance(v, bool) or v is None:
        return None
    if isinstance(v, (int, float)):
        return int(round(v))
    t = re.sub(r"[,\s원]", "", str(v))
    return int(t) if re.fullmatch(r"-?\d+", t) else None


def ar_txt(v):
    """미수금 표 글자: 호수·지번(예: 2321-501호, 172-16)은 그대로 두고, 주민번호·계좌번호 모양(숫자 10자리 이상)만 지운다."""
    if v is None:
        return ""
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime("%m.%d")
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return txt(v)
    t = re.sub(r"\d{6}-\d{7}", "", str(v).strip())
    t = re.sub(r"[\d][\d\-\s]{8,}[\d]", lambda m: "" if len(re.sub(r"\D", "", m.group(0))) >= 10 else m.group(0), t)
    return re.sub(r"\s{2,}", " ", t).strip()


def ar_table(ws):
    """'미수금(물대+시공)' 표를 찾아 줄을 그대로 옮긴다. 못 찾으면 None."""
    key = lambda v: re.sub(r"\s|\(|\)", "", str(v or ""))
    anchor = None
    for row in ws.iter_rows():
        for c in row:
            if isinstance(c.value, str) and "미수금" in key(c.value) and "물대" in key(c.value):
                anchor = c
                break
        if anchor:
            break
    if not anchor:
        return None
    # 머리 줄: 표 이름 칸 바로 위쪽(3줄 안)에서 '업체명'이 있는 줄
    head = None
    for hr in range(anchor.row - 1, max(anchor.row - 4, 0), -1):
        if any("업체명" in key(ws.cell(hr, c).value) for c in range(1, ws.max_column + 1)):
            head = hr
            break
    if not head:
        return None
    cols = {}
    for c in range(1, ws.max_column + 1):
        h = key(ws.cell(head, c).value).replace("(VAT포함)", "").replace("VAT포함", "")
        for k, lab in AR_COLS:
            if k not in cols and h.startswith(lab):
                cols[k] = c
    if "name" not in cols or "left" not in cols:
        return None
    # 병합된 칸(예: 월 'D83:D89')은 맨 위 칸 값을 그 아래 줄에도 쓴다
    merged = {}
    for rg in ws.merged_cells.ranges:
        v = ws.cell(rg.min_row, rg.min_col).value
        for r in range(rg.min_row, rg.max_row + 1):
            for c in range(rg.min_col, rg.max_col + 1):
                merged[(r, c)] = v

    def val(r, k):
        if k not in cols:
            return None
        c = cols[k]
        v = ws.cell(r, c).value
        return merged.get((r, c)) if v is None else v

    rows, total, label = [], None, ""
    for r in range(head + 1, ws.max_row + 1):
        name = ar_txt(val(r, "name"))
        if "기준미수금" in key(name):
            total, label = amt(val(r, "left")), name
            break
        left, tot = amt(val(r, "left")), amt(val(r, "tot"))
        if not name and left is None and tot is None:
            continue
        mon = val(r, "mon")
        rows.append({"r": r, "tot": tot, "mon": ar_txt(mon), "name": name,
                     "left": left, "cost": amt(val(r, "cost")), "pj": ar_txt(val(r, "pj")), "memo": ar_txt(val(r, "memo"))})
    return {"rows": rows, "total": total, "totalLabel": label}


def main():
    xlsx, wd = sys.argv[1], sys.argv[2]
    since = sys.argv[3] if len(sys.argv) > 3 else ""
    ym = re.search(r"\((\d{4})\)\s*(\d{1,2})\s*월", os.path.basename(xlsx))
    if not ym:
        sys.exit("파일 이름에서 연·월을 못 읽었어요: " + xlsx)
    year, mon = int(ym.group(1)), int(ym.group(2))
    pmon = 12 if mon == 1 else mon - 1
    wb = openpyxl.load_workbook(xlsx, data_only=True)
    out = {}
    for sn in wb.sheetnames:
        mm = re.match(r"\s*(\d{1,2})\s*\.", sn)
        if not mm or int(mm.group(1)) not in (mon, pmon):
            continue
        d = sheet_date(sn, year - 1 if (mon == 1 and int(mm.group(1)) == 12) else year)
        if not d or (since and d < since):
            continue
        s = snap(wb[sn])
        s.update({"file": os.path.basename(xlsx), "sheet": sn})
        a = ar_table(wb[sn])
        if a:
            s["ar"] = a
        out.setdefault("cfsheet-" + d[:7], {"days": {}})["days"][d] = s
    json.dump(out, open(os.path.join(wd, "cf_sheets.json"), "w", encoding="utf8"), ensure_ascii=False)
    print(json.dumps({k: sorted(v["days"]) for k, v in out.items()}, ensure_ascii=False))
    noar = sorted(d for v in out.values() for d, x in v["days"].items() if "ar" not in x)
    if noar:
        print("미수금 표 못 찾은 날짜:", ", ".join(noar))


if __name__ == "__main__":
    main()
