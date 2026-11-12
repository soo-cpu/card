// 채용공고 HTML → PNG(가로 860px) + PDF(A4) 만들기
// 사용: node build_posting.js "경력직 채용공고 2026-11-13 v0.html"
// 결과: 같은 폴더에 같은 이름의 .png, .pdf
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const src = process.argv[2];
  if (!src) { console.error('HTML 파일 이름을 적어 주세요.'); process.exit(1); }
  const abs = path.resolve(src);
  const base = abs.replace(/\.html?$/i, '');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 860, height: 1200 }, deviceScaleFactor: 1 });
  await page.goto('file://' + abs, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: base + '.png', fullPage: true });
  await page.pdf({ path: base + '.pdf', format: 'A4', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' } });
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  await browser.close();
  console.log('완료:', path.basename(base) + '.png (가로 ' + width + 'px),', path.basename(base) + '.pdf');
})();
