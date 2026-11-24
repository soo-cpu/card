// 안심 약속 A4(PDF)·카톡 이미지(PNG) 만들기 · 사용법: node promise/render.js
// 한글 글꼴: 이 컴퓨터에 한글 글꼴이 없으면 FONT_DIR 에 @fontsource/noto-sans-kr·noto-serif-kr 를 풀어 두고
//   FONT_DIR=/경로 node promise/render.js  (FONT_DIR/sans/package/400.css 처럼 찾음)
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const dir = __dirname;
const FONT_DIR = process.env.FONT_DIR || "";
const OUT_PDF = path.join(dir, "안심 약속 A4 2026-11-24 v1.pdf");
const OUT_PNG = path.join(dir, "안심 약속 카톡 2026-11-24 v1.png");

function fontLinks() {
  if (!FONT_DIR) return "";
  const css = [];
  for (const w of ["400", "500", "700"]) {
    for (const f of ["sans", "serif"]) {
      const p = path.join(FONT_DIR, f, "package", w + ".css");
      if (fs.existsSync(p)) css.push('<link rel="stylesheet" href="file://' + p + '">');
    }
  }
  return css.join("");
}

(async () => {
  const browser = await chromium.launch();
  const links = fontLinks();
  async function open(file, viewport) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    let html = fs.readFileSync(path.join(dir, file), "utf8");
    if (links) html = html.replace("</head>", links + "</head>");
    const tmp = path.join(require("os").tmpdir(), "promise-" + file);
    fs.writeFileSync(tmp, html);
    await page.goto("file://" + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    return page;
  }
  const a4 = await open("a4.html", { width: 794, height: 1123 });
  await a4.pdf({ path: OUT_PDF, format: "A4", printBackground: true, preferCSSPageSize: true });
  const kk = await open("kakao.html", { width: 1080, height: 1350 });
  await kk.screenshot({ path: OUT_PNG, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  await browser.close();
  console.log("만듦:", OUT_PDF, OUT_PNG);
})();
