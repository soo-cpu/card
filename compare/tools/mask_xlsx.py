import openpyxl, sys, re
src, dst, label = sys.argv[1], sys.argv[2], sys.argv[3]
wb = openpyxl.load_workbook(src, data_only=True)
for name in ['표준계약서', '단가']:
    if name in wb.sheetnames: del wb[name]
phone = re.compile(r'01[0-9]-?\d{3,4}-?\d{4}')
for ws in wb:
    for row in ws.iter_rows():
        for c in row:
            v = c.value
            if isinstance(v, str):
                nv = phone.sub('010-****-****', v)
                nv = re.sub(r'\d{3,4}동\s*\d{3,4}호', '○○○동 ○○○호', nv)
                nv = nv.replace('홈퍼니싱', '(가림)업체').replace('최윤수', '(가림)').replace('정진혁', '(가림)')
                nv = nv.replace('449-81-01936', '***-**-*****').replace('동구릉로 129번길 2-1', '(가림)')
                nv = re.sub(r'https?://\S+', '', nv)
                if nv != v: c.value = nv
    if ws.title == '갑지':
        for r in range(40, 60):
            if ws.cell(r, 1).value == '성함': ws.cell(r, 2).value = '(고객 이름 가림)'
        for row in ws.iter_rows(min_col=16):
            for c in row:
                if type(c).__name__ != "MergedCell": c.value = None
    ws.print_area = None
wb['갑지']['F23'].value = None
wb.save(dst)
print('ok', label)
