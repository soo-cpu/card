// usage: node render2503.js <html> <out.pdf>  (960x540pt pages)
const { chromium } = require('playwright'); const path = require('path');
(async () => { const [h, o] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve(h), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: o, width: '13.3333in', height: '7.5in', printBackground: true, preferCSSPageSize: true }); await b.close(); })();
