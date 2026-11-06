// Serve aifirst/project with the design runtime as support.js; screenshot boards.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PW || 'playwright');
const root = path.resolve(__dirname, '../aifirst/project');
const runtime = path.resolve(__dirname, '../artifact-files/15394c53-c767-4178-a99f-287167e3eb10/artifact-type/dc-runtime.js');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const blobs={'76e02f596530fd38451f14aa477483ae':'fvbase.png','9d8de934a0b5ec79c5ee377e57a95dde':'fvfarm.png','02b1b2b81c7b1158e7f4b0260c9406ce':'fvb1.png','4d63609bf90d716a88d5f7b4716df84d':'fvb2.png'};const bm=u.match(new RegExp('_blob.([0-9a-f]+)'));const f = bm ? 'C:/Users/ying_/AppData/Local/Temp/claude/f2c70f4c5bbf3ca1/fa89ae91-5efe-4092-aad1-1b322d3ff1d5/scratchpad/tx/shots/'+blobs[bm[1]] : u.endsWith('/support.js') ? runtime : path.join(root, u);
  fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(b); });
}).listen(0, async () => {
  const port = srv.address().port;
  const boards = (process.argv[2] || 'Main').split(',');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(process.env.VW || 1440), height: Number(process.env.VH || 900) }, deviceScaleFactor: Number(process.env.DPR || 1) });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.type(), m.text().slice(0, 300)); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  for (const b of boards) {
    const [file, ...steps] = b.split(':');
    await page.goto(`http://localhost:${port}/${file}.dc.html`);
    await page.waitForTimeout(2500);
    for (const st of steps) { if (st.startsWith('wait=')) { await page.waitForTimeout(+st.slice(5)); continue; } if (st.startsWith('scroll=')) { await page.evaluate((y) => { const el = [...document.querySelectorAll('section div')].find((d) => getComputedStyle(d).overflowY === 'auto'); if (el) el.scrollTop = y; }, +st.slice(7)); await page.waitForTimeout(400); continue; } if (st.startsWith('aria=')) { await page.locator('[aria-label="' + st.slice(5) + '"]').first().click().catch((e) => console.log('aria fail', st)); await page.waitForTimeout(600); continue; } if (st.startsWith('type=')) { await page.fill('#home-search', st.slice(5)); await page.waitForTimeout(500); continue; } // click by visible text
      await page.getByText(st, { exact: false }).first().click().catch((e) => console.log('click fail', st, e.message.slice(0, 80)));
      await page.waitForTimeout(500);
    }
    const out = path.resolve(__dirname, `${file}${steps.length ? '-' + steps.join('-').replace(/[^\w]+/g, '_') : ''}.png`);
    await page.screenshot({ path: out, fullPage: !!process.env.FULL });
    console.log('shot', out);
  }
  await browser.close(); srv.close();
});
