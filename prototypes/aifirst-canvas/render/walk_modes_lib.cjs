const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../aifirst/project');
const runtime = path.resolve(__dirname, '../artifact-files/15394c53-c767-4178-a99f-287167e3eb10/artifact-type/dc-runtime.js');
module.exports = async function run(state, w, fn, opts) {
  opts = opts || {};
  const H = opts.H || 830;
  const head = fs.readFileSync(path.join(root, 'ActLayout3JS.dc.html'), 'utf8').match(/<helmet>[\s\S]*?<\/helmet>/)[0];
  const srv = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]); const f = u.endsWith('/support.js') ? runtime : path.join(root, u); fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); res.end(b); }); });
  await new Promise((r) => srv.listen(0, r));
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const wrap = `_pv_wm_${state}_${w}.dc.html`;
  fs.writeFileSync(path.join(root, wrap), `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>pv</title><script src="./support.js"></script></head><body><x-dc>${head}<dc-import name="ActLayout3JS" start="${state}" hint-size="100%,${H}px"></dc-import></x-dc><script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${H}}}'>class Component extends DCLogic { renderVals() { return {}; } }</script></body></html>`);
  const page = await browser.newPage({ viewport: { width: w, height: H } });
  if (process.env.HOSTLIKE) await page.route((u) => ['/vendor/', 'layout.engine', 'pigs.module', '/farms/'].some((k) => u.pathname.includes(k)), (r) => r.abort());
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/moveto|Expected length|fonts.g|Failed to load resource/.test(m.text())) { errs.push(m.text().slice(0, 300)); console.log('[console]', m.text().slice(0, 300)); } });
  page.on('pageerror', (e) => { errs.push(e.message); console.log('[pageerror]', e.message); });
  await page.addInitScript(() => { window.__dbg = true; });
  await page.goto(`http://localhost:${port}/${wrap}`); await page.waitForTimeout(3200);
  const snap = async (name) => { const p = path.resolve(__dirname, `WM_${name}.png`); await page.screenshot({ path: p }); console.log('shot', name); };
  const wait = (ms) => page.waitForTimeout(ms);
  const st = () => page.evaluate(() => { const u = window.__l3.ui(); return { vm: u.vm, view: u.view, roomId: u.roomId, ip: u.ip, psel: u.psel, sm: u.sm, vt: u.vt && u.vt.kind, dn: u.dn, icam: u.icam, nl: u.nl, pk: window.__l3.pk, dist: window.__l3.cam.dist, ppm: window.__l3.ppm && window.__l3.ppm() }; });
  try { await fn({ page, snap, wait, st, errs }); } catch (e) { console.log('WALK ERROR', e.message); }
  await page.close(); fs.unlinkSync(path.join(root, wrap)); await browser.close(); srv.close();
  return errs;
};
