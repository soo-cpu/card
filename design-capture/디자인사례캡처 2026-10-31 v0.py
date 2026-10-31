# -*- coding: utf-8 -*-
"""
디자인사례캡처 2026-10-31 v0

매일 밤 다른 인테리어 회사의 디자인 사례를 검색·캡처해서
구글 드라이브 'Claude 자료함/디자인 사례/YYYY-MM-DD/' 에 저장한다.

안전 규칙
- 기존 파일은 읽기만 한다. 이름이 겹치면 v1, v2 … 를 붙여 항상 새 파일로 만든다.
- 캡처 이미지는 내부 참고용이다. 제안서·홍보물에 그대로 쓰지 않는다.
- 외부로 게시·발송하는 동작은 하지 않는다 (검색·열람·캡처만).

사용법
    python "디자인사례캡처 2026-10-31 v0.py"            # 자동으로 구글 드라이브 폴더 찾기
    python "디자인사례캡처 2026-10-31 v0.py" --root "G:\\내 드라이브"
"""

import argparse
import datetime as dt
import os
import re
import sys
import time
import traceback
from pathlib import Path
from urllib.parse import quote, urlparse

SCRIPT_NAME = "디자인사례캡처 2026-10-31 v0"
MAX_CASES = 5  # 하루 최대 캡처 건수 (5건 초과 금지)

# 검색어 묶음: 날짜마다 돌아가며 써서 매일 다른 사례가 나오게 한다.
QUERIES = {
    "아파트": [
        "30평대 아파트 인테리어", "20평대 아파트 인테리어", "40평대 아파트 인테리어",
        "구축 아파트 리모델링", "신축 아파트 인테리어 시공사례", "아파트 주방 리모델링",
    ],
    "거실": [
        "모던 거실 인테리어", "화이트 우드 거실", "미니멀 거실 인테리어",
        "호텔식 거실 인테리어", "간접조명 거실",
    ],
    "관공서": [
        "관공서 사무실 인테리어", "주민센터 리모델링", "민원실 인테리어",
        "공공기관 회의실 인테리어", "도서관 리모델링 인테리어", "사무실 인테리어 시공사례",
    ],
}

# 사이트별 검색 주소와 사례 링크 모양
SOURCES = {
    "오늘의집": {
        "search": "https://ohou.se/projects?query={q}",
        "pattern": re.compile(r"^https://(?:www\.)?ohou\.se/projects/\d+"),
    },
    "인테리어 블로그": {
        "search": "https://search.naver.com/search.naver?ssc=tab.blog.all&query={q}",
        "pattern": re.compile(r"^https://(?:m\.)?blog\.naver\.com/[A-Za-z0-9_\-]+/\d+"),
    },
    "핀터레스트": {
        "search": "https://www.pinterest.com/search/pins/?q={q}",
        "pattern": re.compile(r"^https://(?:[a-z]+\.)?pinterest\.[a-z.]+/pin/\d+"),
    },
}

LOGIN_URL_WORDS = ("login", "signin", "sign_in", "accounts", "auth", "nidlogin")
LOGIN_TEXT_WORDS = (
    "로그인이 필요", "로그인 후 이용", "로그인하고", "Log in to see more", "Sign up to see more",
    "로그인하여 더 보기", "가입하여 더 보기", "captcha", "자동입력 방지", "비정상적인 접근",
)

# 본문에서 찾을 키워드 (자동 정리용)
SPACE_WORDS = ["거실", "주방", "다이닝", "침실", "안방", "아이방", "서재", "욕실", "현관", "드레스룸",
               "발코니", "팬트리", "사무실", "민원실", "회의실", "로비", "대기공간", "강당", "탕비실"]
MATERIAL_WORDS = ["원목", "무늬목", "강마루", "원목마루", "합판마루", "포세린", "포세린타일", "대리석",
                  "세라믹", "타일", "테라조", "인테리어필름", "필름", "도장", "친환경페인트", "실크벽지",
                  "합지벽지", "패브릭", "가죽", "스테인리스", "황동", "알루미늄", "유리", "템바보드",
                  "루바", "아트월", "카펫타일", "데코타일", "흡음재", "흡음패널", "석고보드", "PET"]
LIGHT_WORDS = ["간접조명", "라인조명", "매입등", "다운라이트", "펜던트", "레일조명", "무드등",
               "T5", "스포트", "브라켓", "샹들리에", "우물천장", "커튼박스", "무몰딩", "LED바"]
STORAGE_WORDS = ["붙박이장", "팬트리", "키큰장", "수납장", "히든도어", "슬라이딩도어", "아일랜드",
                 "벽수납", "신발장", "현관수납", "드레스룸", "선반", "오픈장", "하부장", "상부장",
                 "캐비닛", "사물함", "문서고"]
COLOR_WORDS = ["화이트", "아이보리", "베이지", "그레이", "그레이지", "차콜", "블랙", "우드톤",
               "월넛", "오크", "네이비", "그린", "세이지", "테라코타", "브라운", "크림", "모노톤"]

# 사진 색을 부르는 이름 (가장 가까운 색으로 이름 붙임)
NAMED_COLORS = {
    "화이트": (245, 245, 242), "아이보리": (238, 232, 214), "베이지": (214, 196, 168),
    "그레이지": (186, 178, 166), "라이트그레이": (200, 200, 200), "그레이": (140, 140, 140),
    "차콜": (64, 64, 66), "블랙": (20, 20, 20), "오크(밝은 우드)": (196, 154, 108),
    "월넛(짙은 우드)": (110, 74, 50), "테라코타": (190, 100, 70), "세이지그린": (150, 165, 130),
    "딥그린": (50, 85, 65), "네이비": (35, 50, 85), "스카이블루": (150, 185, 215),
    "머스터드": (205, 160, 60), "핑크베이지": (225, 190, 180),
}


# ───────────────────────── 파일 안전 장치 ─────────────────────────

def new_path(path: Path) -> Path:
    """같은 이름 파일이 있으면 덮어쓰지 않고 ' v1', ' v2' … 를 붙인 새 이름을 돌려준다."""
    if not path.exists():
        return path
    m = re.match(r"^(.*) v(\d+)$", path.stem)  # 이미 ' v0' 이 붙어 있으면 숫자만 올림
    stem, n = (m.group(1), int(m.group(2)) + 1) if m else (path.stem, 1)
    while True:
        cand = path.with_name(f"{stem} v{n}{path.suffix}")
        if not cand.exists():
            return cand
        n += 1


def write_new_text(path: Path, text: str) -> Path:
    path = new_path(path)
    with open(path, "x", encoding="utf-8") as f:  # 'x' = 새 파일만 만들기 (있으면 오류)
        f.write(text)
    return path


class Log:
    def __init__(self):
        self.lines = []

    def __call__(self, msg):
        line = f"[{dt.datetime.now():%H:%M:%S}] {msg}"
        self.lines.append(line)
        print(line, flush=True)


# ───────────────────────── 폴더 찾기 ─────────────────────────

def find_drive_root(arg_root):
    """구글 드라이브 데스크톱 동기화 폴더를 찾는다."""
    if arg_root:
        p = Path(arg_root)
        return p if p.is_dir() else None
    cands = []
    for letter in "GHIJKLMNOPQRSTUVWXYZDEF":
        for name in ("내 드라이브", "My Drive"):
            cands.append(Path(f"{letter}:/{name}"))
    home = Path.home()
    for sub in ("Google Drive/내 드라이브", "Google Drive/My Drive", "내 드라이브", "My Drive", "Google Drive"):
        cands.append(home / sub)
    for c in cands:
        try:
            if c.is_dir():
                return c
        except OSError:
            continue
    return None


def previous_urls(base: Path):
    """지난 날짜 사례정리 파일을 읽기만 해서, 이미 캡처한 링크를 모은다 (중복 방지)."""
    urls = set()
    if not base.is_dir():
        return urls
    for md in base.glob("*/사례정리*.md"):
        try:
            text = md.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        urls.update(normalize_url(u) for u in re.findall(r"https?://[^\s)>\]]+", text))
    return urls


def normalize_url(u: str) -> str:
    u = u.split("#")[0].split("?")[0].rstrip("/")
    return u.replace("://m.blog.naver.com", "://blog.naver.com")


# ───────────────────────── 검색어 고르기 ─────────────────────────

def todays_queries(day: dt.date):
    k = day.toordinal()
    return {group: words[k % len(words)] for group, words in QUERIES.items()}


# ───────────────────────── 브라우저 작업 ─────────────────────────

def is_blocked(page, response) -> str:
    """로그인·캡처 차단 페이지면 이유를 돌려준다. 정상이면 빈 문자열."""
    if response is not None and response.status >= 400:
        return f"접속 오류 (HTTP {response.status})"
    url = page.url.lower()
    if any(w in url for w in LOGIN_URL_WORDS):
        return "로그인 페이지로 이동됨"
    try:
        if page.locator("input[type=password]:visible").count() > 0:
            return "로그인 입력창이 뜸"
        body = page.inner_text("body", timeout=5000)[:20000]
    except Exception:
        body = ""
    for w in LOGIN_TEXT_WORDS:
        if w.lower() in body.lower():
            return f"로그인/차단 문구 감지 ('{w}')"
    if len(body.strip()) < 80:
        return "본문이 비어 있음 (차단 가능성)"
    return ""


def collect_links(page, source, query, log, limit=8):
    info = SOURCES[source]
    url = info["search"].format(q=quote(query))
    try:
        resp = page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(2500)
    except Exception as e:
        log(f"  {source} 검색 실패: {e.__class__.__name__}")
        return [], url, "검색 페이지 열기 실패"
    reason = ""
    if resp is not None and resp.status >= 400:
        reason = f"검색 페이지 HTTP {resp.status}"
    hrefs = page.eval_on_selector_all("a[href]", "els => els.map(e => e.href)")
    found, seen = [], set()
    for h in hrefs:
        if info["pattern"].match(h):
            n = normalize_url(h)
            if n not in seen:
                seen.add(n)
                found.append(n)
        if len(found) >= limit:
            break
    if not found and not reason:
        reason = "검색 결과에서 사례 링크를 못 찾음 (로그인 필요 가능성)"
    log(f"  {source} '{query}' → 후보 {len(found)}건")
    return found, url, reason


def auto_scroll(page, max_steps=25):
    """지연 로딩 이미지가 뜨도록 천천히 끝까지 내렸다가 맨 위로 돌아간다."""
    last = 0
    for _ in range(max_steps):
        page.mouse.wheel(0, 1400)
        page.wait_for_timeout(400)
        h = page.evaluate("document.body ? document.body.scrollHeight : 0")
        if h == last:
            break
        last = h
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(800)


# ───────────────────────── 자동 정리 ─────────────────────────

def find_words(text, words, limit=6):
    hits = []
    for w in words:
        if w in text and w not in hits:
            hits.append(w)
        if len(hits) >= limit:
            break
    return hits


def nearest_color_name(rgb):
    best, best_d = None, 10 ** 9
    for name, c in NAMED_COLORS.items():
        d = sum((a - b) ** 2 for a, b in zip(rgb, c))
        if d < best_d:
            best, best_d = name, d
    return best


def image_colors(png_path: Path, k=6):
    """캡처 이미지에서 많이 쓰인 색 3가지를 뽑는다 (본문 사진 영역 위주)."""
    try:
        from PIL import Image
    except ImportError:
        return []
    try:
        with Image.open(png_path) as im:
            im = im.convert("RGB")
            w, h = im.size
            # 상단 메뉴·하단 댓글을 덜 보도록 가운데 영역만
            box = (int(w * 0.1), int(h * 0.08), int(w * 0.9), int(h * 0.75)) if h > 600 else (0, 0, w, h)
            im = im.crop(box)
            im.thumbnail((300, 300))
            q = im.quantize(colors=k, method=Image.Quantize.MEDIANCUT)
            pal = q.getpalette()[: k * 3]
            counts = sorted(q.getcolors(), reverse=True)
    except Exception:
        return []
    out, names = [], set()
    for cnt, idx in counts:
        rgb = tuple(pal[idx * 3: idx * 3 + 3])
        name = nearest_color_name(rgb)
        if name in names:
            continue
        names.add(name)
        out.append(f"{name}(#{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X})")
        if len(out) >= 3:
            break
    return out


def space_type(text, group):
    m = re.search(r"(\d{2})\s*평", text)
    size = f"{m.group(1)}평대 " if m else ""
    spaces = find_words(text, SPACE_WORDS, 4)
    base = {"아파트": "아파트", "거실": "주거(거실)", "관공서": "관공서·사무공간"}[group]
    return f"{size}{base}" + (f" — {', '.join(spaces)}" if spaces else "")


def reflect_points(group, mats, lights, stores):
    tips = []
    if "간접조명" in lights or "커튼박스" in lights or "우물천장" in lights:
        tips.append("천장 우물·커튼박스 간접조명 라인 위치를 도면 단계에서 미리 잡기")
    if "라인조명" in lights or "무몰딩" in lights:
        tips.append("라인조명·무몰딩은 목공 마감 정밀도가 관건 → 목공 일정·검수 여유 확보")
    if any(x in lights for x in ("매입등", "다운라이트")):
        tips.append("매입등 배치 간격·색온도(3000K/4000K) 고객과 사전 합의")
    if any(x in stores for x in ("붙박이장", "키큰장", "벽수납", "팬트리")):
        tips.append("벽면 일체형 수납으로 동선 정리 — 가구 실측 후 문짝 마감재 통일")
    if "히든도어" in stores:
        tips.append("히든도어 적용 시 하드웨어(경첩·마그네틱) 사양 견적 반영")
    if any(x in mats for x in ("포세린", "포세린타일", "대리석", "세라믹")):
        tips.append("대형 포세린·석재는 줄눈 간격·하중·반입 경로 확인")
    if any(x in mats for x in ("원목", "무늬목", "템바보드", "루바")):
        tips.append("우드 포인트 면은 한 면에 집중해 단가 대비 효과 높이기")
    if group == "관공서":
        tips.append("관공서는 흡음·내구성 자재와 민원 동선·안내 사인 계획을 함께 검토")
    if not tips:
        tips.append("사진을 보고 담당자가 직접 보완 필요 (본문에서 자동 추출할 키워드가 적음)")
    return tips[:4]


def case_markdown(i, c):
    lines = [f"## 사례 {i}. {c['title']}", ""]
    lines.append(f"- **원본 링크**: {c['url']}")
    lines.append(f"- **출처**: {c['source']} (검색어: {c['query']})")
    if c.get("skipped"):
        lines.append(f"- **상태**: ⚠️ 캡처 건너뜀 — {c['skipped']} (링크만 기록)")
        lines.append("")
        return "\n".join(lines)
    lines.append(f"- **캡처 파일**: `{c['png']}`")
    lines.append(f"- **공간 유형**: {c['space']}")
    colors = c["colors_img"] + [w for w in c["colors_txt"] if w not in " ".join(c["colors_img"])]
    lines.append(f"- **색 조합**: {', '.join(colors) if colors else '확인 필요'}")
    lines.append(f"- **주요 자재**: {', '.join(c['materials']) if c['materials'] else '본문에 언급 없음 — 사진 확인'}")
    lines.append(f"- **조명 포인트**: {', '.join(c['lights']) if c['lights'] else '본문에 언급 없음 — 사진 확인'}")
    lines.append(f"- **수납 포인트**: {', '.join(c['storage']) if c['storage'] else '본문에 언급 없음 — 사진 확인'}")
    lines.append("- **우리 현장에 반영할 점**:")
    for t in c["tips"]:
        lines.append(f"  - {t}")
    lines.append("")
    return "\n".join(lines)


# ───────────────────────── 메인 ─────────────────────────

def run(args):
    log = Log()
    today = dt.date.today() if not args.date else dt.date.fromisoformat(args.date)
    ds = today.isoformat()

    root = find_drive_root(args.root)
    if root is None:
        print("구글 드라이브 동기화 폴더를 찾지 못했습니다. --root 로 직접 지정해 주세요.", file=sys.stderr)
        return 2
    base = root / "Claude 자료함" / "디자인 사례"
    out_dir = base / ds
    out_dir.mkdir(parents=True, exist_ok=True)  # 폴더만 만든다. 기존 파일은 건드리지 않음.
    log(f"{SCRIPT_NAME} 시작 — 저장 위치: {out_dir}")

    done = previous_urls(base)
    log(f"지난 기록에서 이미 본 링크 {len(done)}건 (중복 제외)")

    queries = todays_queries(today)
    log("오늘 검색어: " + ", ".join(f"{g}={q}" for g, q in queries.items()))
    limit = max(1, min(args.max, MAX_CASES))

    from playwright.sync_api import sync_playwright

    cases, link_only = [], []
    with sync_playwright() as p:
        exe = os.environ.get("CHROMIUM_PATH")  # 보통 비워 둠 (Playwright 기본 브라우저 사용)
        browser = p.chromium.launch(headless=True, executable_path=exe or None)
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900}, locale="ko-KR",
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"),
        )
        page = ctx.new_page()

        # 1) 후보 모으기: 사이트 × 검색어
        pool = []  # (source, group, query, url)
        for source in (args.sources or list(SOURCES)):
            for group, q in queries.items():
                links, search_url, reason = collect_links(page, source, q, log)
                if reason and not links:
                    link_only.append({"source": source, "query": q, "url": search_url, "reason": reason})
                for u in links:
                    if u not in done:
                        pool.append((source, group, q, u))
                time.sleep(1.5)

        # 2) 사이트·검색어가 고루 섞이도록 순서 정하기
        picked, seen_keys = [], set()
        buckets = {}
        for item in pool:
            buckets.setdefault((item[0], item[1]), []).append(item)
        while buckets and len(picked) < limit * 3:
            for key in list(buckets):
                if buckets[key]:
                    it = buckets[key].pop(0)
                    if it[3] not in seen_keys:
                        seen_keys.add(it[3])
                        picked.append(it)
                if not buckets[key]:
                    del buckets[key]

        # 3) 하나씩 열어서 캡처 (성공 limit 건까지)
        captured = 0
        for source, group, q, url in picked:
            if captured >= limit:
                break
            open_url = url.replace("://blog.naver.com", "://m.blog.naver.com")  # 모바일 주소가 캡처가 잘 됨
            log(f"열기: {open_url}")
            c = {"source": source, "query": q, "url": url, "title": source}
            try:
                resp = page.goto(open_url, wait_until="domcontentloaded", timeout=40000)
                page.wait_for_timeout(2500)
                title = (page.title() or source).strip()
                c["title"] = re.sub(r"\s+", " ", title)[:60]
                reason = is_blocked(page, resp)
                if reason:
                    c["skipped"] = reason
                    log(f"  건너뜀: {reason}")
                    cases.append(c)
                    continue
                auto_scroll(page)
                text = page.inner_text("body", timeout=10000)[:30000]
                png = new_path(out_dir / f"사례{captured + 1:02d} {source} {ds} v0.png")
                page.screenshot(path=str(png), full_page=True, timeout=60000)
                captured += 1
                c.update({
                    "png": png.name,
                    "space": space_type(text, group),
                    "colors_img": image_colors(png),
                    "colors_txt": find_words(text, COLOR_WORDS, 4),
                    "materials": find_words(text, MATERIAL_WORDS),
                    "lights": find_words(text, LIGHT_WORDS),
                    "storage": find_words(text, STORAGE_WORDS),
                })
                c["tips"] = reflect_points(group, c["materials"], c["lights"], c["storage"])
                log(f"  캡처 완료: {png.name}")
                cases.append(c)
            except Exception as e:
                c["skipped"] = f"열기/캡처 실패 ({e.__class__.__name__})"
                log(f"  {c['skipped']}: {str(e).splitlines()[0][:150]}")
                cases.append(c)
            time.sleep(2)

        browser.close()

    # 4) 사례정리 문서 (새 파일로만)
    ok = [c for c in cases if not c.get("skipped")]
    skipped = [c for c in cases if c.get("skipped")]
    md = [f"# 디자인 사례 정리 {ds}", "",
          f"> 자동 수집: {SCRIPT_NAME} · 실행 {dt.datetime.now():%Y-%m-%d %H:%M}",
          "> ⚠️ 캡처 이미지는 **내부 참고용**입니다. 제안서·홍보물에 그대로 쓰지 마세요.",
          "> 공간 유형·자재·조명·수납은 본문 키워드와 사진 색에서 자동으로 뽑은 것이라, 담당자 검토 후 활용하세요.",
          "",
          f"- 오늘 검색어: {', '.join(queries.values())}",
          f"- 캡처 {len(ok)}건 / 건너뜀 {len(skipped)}건", ""]
    for i, c in enumerate(ok, 1):
        md.append(case_markdown(i, c))
    if skipped or link_only:
        md += ["## 링크만 기록 (로그인 필요·캡처 차단·오류)", ""]
        for c in skipped:
            md.append(f"- [{c['source']}] {c['url']} — {c['skipped']}")
        for s in link_only:
            md.append(f"- [{s['source']}] 검색 '{s['query']}': {s['url']} — {s['reason']}")
        md.append("")
    if not ok:
        md += ["오늘은 캡처된 사례가 없습니다. 위 링크를 직접 확인해 주세요.", ""]
    md_path = write_new_text(out_dir / f"사례정리 {ds}.md", "\n".join(md))
    log(f"정리 문서 저장: {md_path.name}")
    write_new_text(out_dir / f"실행로그 {ds} v0.txt", "\n".join(log.lines) + "\n")
    return 0


def main():
    ap = argparse.ArgumentParser(description=SCRIPT_NAME)
    ap.add_argument("--root", help="구글 드라이브 동기화 폴더 (예: G:\\내 드라이브)")
    ap.add_argument("--max", type=int, default=MAX_CASES, help="최대 캡처 건수 (최대 5)")
    ap.add_argument("--date", help="날짜 지정 YYYY-MM-DD (기본: 오늘)")
    ap.add_argument("--sources", nargs="*", choices=list(SOURCES), help="특정 사이트만")
    args = ap.parse_args()
    for stream in (sys.stdout, sys.stderr):  # 윈도우 콘솔에서 한글 깨짐·오류 방지
        try:
            stream.reconfigure(errors="replace")
        except Exception:
            pass
    try:
        return run(args)
    except Exception:
        err = traceback.format_exc()
        print(err, file=sys.stderr)
        # 새벽 자동 실행 중 오류가 나도 원인을 볼 수 있게, 스크립트 폴더에 새 오류 로그를 남긴다.
        try:
            write_new_text(Path(__file__).with_name(f"오류로그 {dt.date.today().isoformat()} v0.txt"), err)
        except Exception:
            pass
        return 1


if __name__ == "__main__":
    sys.exit(main())
