// node shoot3js.cjs state@width[~step...][,state@width...]
// steps (separated by ~): click:Text  btn:Name  label:Aria  fill:Label=value  xy:x_y (click)  sxy:x_y (shift-click)  dbl:x_y  move:x_y
//   drag:x1_y1_x2_y2  sdrag:...(shift)  rdrag:...(right button)  hold:...  key:Meta+d  wait:ms  eval:js  snap:name  tag:name (file suffix)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../aifirst/project');
const runtime = path.resolve(__dirname, '../artifact-files/15394c53-c767-4178-a99f-287167e3eb10/artifact-type/dc-runtime.js');
const head = fs.readFileSync(path.join(root, 'ActLayout3JS.dc.html'), 'utf8').match(/<helmet>[\s\S]*?<\/helmet>/)[0];
const H = +(process.env.VH || 830);
const srv = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]); const f = u.endsWith('/support.js') ? runtime : path.join(root, u); fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); res.end(b); }); }).listen(0, async () => {
  const port = srv.address().port; const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const spec of process.argv[2].split(/,(?=[a-z]+@)/)) {
    const [main, ...steps] = spec.split('~'); const [state, w] = main.split('@');
    const wrap = `_pv_ActLayout3JS_${state}.dc.html`;
    fs.writeFileSync(path.join(root, wrap), `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>pv</title><script src="./support.js"></script></head><body><x-dc>${head}<dc-import name="ActLayout3JS" start="${state}" hint-size="100%,${H}px"></dc-import></x-dc><script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${+w || 1360},"height":${H}}}'>class Component extends DCLogic { renderVals() { return {}; } }</script></body></html>`);
    const page = await browser.newPage({ viewport: { width: +w || 1360, height: H } }); if (process.env.HOSTLIKE) await page.route((u) => ['/vendor/', 'layout.engine', 'pigs.module', '/farms/'].some((k) => u.pathname.includes(k)), (r) => r.abort());
    page.on('console', (m) => { if (m.type() === 'error' && !/moveto|Expected length|fonts.g/.test(m.text())) console.log('[console]', m.text().slice(0, 300)); });
    page.on('pageerror', (e) => console.log('[pageerror]', e.message));
    await page.addInitScript(() => { window.__dbg = true; });
    await page.goto(`http://localhost:${port}/${wrap}`); await page.waitForTimeout(3200);
    let tag = '';
    for (const st of steps) {
      const i = st.indexOf(':'); const [k, v] = [st.slice(0, i), st.slice(i + 1)];
      const nums = () => v.split('_').map(Number);
      try {
        if (k === 'click') await page.getByText(v, { exact: false }).first().click({ timeout: 3000 });
        if (k === 'bx') await page.getByRole('button', { name: v, exact: true }).first().click({ timeout: 3000 });
        if (k === 'btn') await page.getByRole('button', { name: v }).first().click({ timeout: 3000 });
        if (k === 'label') await page.locator(`[aria-label="${v}"]`).first().click({ force: true, timeout: 3000 });
        if (k === 'fill') { const [lab, val] = v.split('='); await page.getByLabel(lab, { exact: true }).first().fill(val); }
        if (k === 'type') { const [lab, val] = v.split('='); const el = page.getByLabel(lab, { exact: true }).first(); await el.click(); await el.press('Control+a'); await el.type(val, { delay: 30 }); }
        if (k === 'xy') { const [a, b] = nums(); await page.mouse.click(a, b); }
        if (k === 'sxy') { const [a, b] = nums(); await page.keyboard.down('Shift'); await page.mouse.click(a, b); await page.keyboard.up('Shift'); }
        if (k === 'dbl') { const [a, b] = nums(); await page.mouse.dblclick(a, b); }
        if (k === 'move') { const [a, b] = nums(); await page.mouse.move(a, b, { steps: 6 }); }
        if (k === 'drag' || k === 'sdrag' || k === 'rdrag' || k === 'hold') {
          const [a, b, c, d] = nums();
          if (k === 'sdrag') await page.keyboard.down('Shift');
          await page.mouse.move(a, b); await page.mouse.down({ button: k === 'rdrag' ? 'right' : 'left' });
          for (let j = 1; j <= 10; j++) { await page.mouse.move(a + (c - a) * j / 10, b + (d - b) * j / 10); await page.waitForTimeout(30); }
          if (k !== 'hold') await page.mouse.up({ button: k === 'rdrag' ? 'right' : 'left' });
          if (k === 'sdrag') await page.keyboard.up('Shift');
        }
        if (k === 'file') await page.setInputFiles('#ins-photo', v);
        if (k === 'key') await page.keyboard.press(v);
        if (k === 'wait') await page.waitForTimeout(+v);
        if (k === 'eval') console.log(JSON.stringify(await page.evaluate(v)));
        if (k === 'tag') tag = v;
        if (k === 'snap') await page.screenshot({ path: path.resolve(__dirname, `L3JS_${v}.png`) });
      } catch (e) { console.log('step fail', st, e.message.split('\n')[0].slice(0, 120)); }
      await page.waitForTimeout(k === 'wait' ? 0 : 900);
    }
    const out = path.resolve(__dirname, `L3JS_${tag || state}_${w}.png`);
    await page.screenshot({ path: out }); console.log('shot', out);
    await page.close(); fs.unlinkSync(path.join(root, wrap));
  }
  await browser.close(); srv.close(); });
