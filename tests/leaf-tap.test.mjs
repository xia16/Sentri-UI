// A leaf's tap waits for its control (scripts/scenario-runner.mjs, tap): the step before may have opened a drawer that is still
// drawing. On a loaded machine a single look 120ms after the tap read "control not found" and was stored as a design failure (#192,
// 2026-10-17: "Record abortion" in More actions, zh-360, the scheduler at 2 workers). A control that never appears still fails.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { playwright } from '../scripts/playwright-path.mjs';
import { leafRunner, CONTROL_WAIT_MS } from '../scripts/scenario-runner.mjs';

// More actions opens a drawer that renders its rows 800ms later and slides them in over 400ms; Record abortion then says so.
const PAGE = `<!doctype html><html><body><div class="phone">
<button id="more">More actions</button><p id="out"></p>
<div id="sheet" style="transition: transform 400ms linear"></div>
</div><script>
document.getElementById('more').onclick = () => setTimeout(() => {
  const s = document.getElementById('sheet');
  s.style.transform = 'translateY(200px)';
  s.innerHTML = '<button id="abort">Record abortion</button>';
  requestAnimationFrame(() => requestAnimationFrame(() => { s.style.transform = 'translateY(0)'; }));
  document.getElementById('abort').onclick = () => { document.getElementById('out').textContent = 'Abortion recorded'; };
}, 800);
</script></body></html>`;

test('a tap waits for a control that a drawer draws late, and still fails one that never appears', async (t) => {
  let pw;
  try { pw = playwright(); } catch { t.skip('Playwright is not installed'); return; }
  const server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': req.url.endsWith('.json') ? 'application/json' : 'text/html' }); res.end(req.url.endsWith('.json') ? '{}' : PAGE); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await pw.chromium.launch();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leaf-tap-'));
  try {
    const run = leafRunner({ base, defaults: { url: '/p.html', clipCheck: false }, verbs: {}, evidenceDir: dir });
    const leaf = (id, taps) => ({ node: { id, type: 'outcome', clip: false, visible: [{ text: 'Abortion recorded' }] }, state: { reset: { url: '/p.html' } }, taps });

    const late = await run(browser, leaf('late', ['More actions', 'Record abortion']), 'en', 360);
    assert.equal(late.result, 'pass', JSON.stringify(late.failures));

    const t0 = Date.now();
    const missing = await run(browser, leaf('missing', ['More actions', 'Record death']), 'en', 360);
    assert.equal(missing.result, 'fail');
    assert.equal(missing.failures[0].category, 'missing-control', JSON.stringify(missing.failures));
    assert.ok(Date.now() - t0 >= CONTROL_WAIT_MS, 'a missing control is looked for until the bound, then fails');
  } finally {
    await browser.close(); server.close(); fs.rmSync(dir, { recursive: true, force: true });
  }
});
