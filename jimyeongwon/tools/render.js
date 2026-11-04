// usage: node render.js <html> <out.pdf>
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [html, out] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.resolve(html), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: out, width: '540px', height: '960px', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
