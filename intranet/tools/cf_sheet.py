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
        out.setdefault("cfsheet-" + d[:7], {"days": {}})["days"][d] = s
    json.dump(out, open(os.path.join(wd, "cf_sheets.json"), "w", encoding="utf8"), ensure_ascii=False)
    print(json.dumps({k: sorted(v["days"]) for k, v in out.items()}, ensure_ascii=False))


if __name__ == "__main__":
    main()
