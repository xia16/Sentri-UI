// The leaf runner's context pool (scripts/scenario-runner.mjs): contexts are reused between runs, and a run never sees what the run
// before it left: storage, cookies, IndexedDB, offline, or a faked clock. Real leaves, in a real browser, on a page that prints what it
// finds and then dirties everything.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { playwright } from '../scripts/playwright-path.mjs';
import { leafRunner, leafContextPool } from '../scripts/scenario-runner.mjs';

const PAGE = `<!doctype html><html><body><div class="phone"><p id="out">loading</p></div><script>
(async () => {
  const dbs = (await indexedDB.databases()).map((d) => d.name).join(',') || 'none';
  document.getElementById('out').textContent = 'storage:' + (localStorage.getItem('x') || 'none') + ' session:' + (sessionStorage.getItem('y') || 'none')
    + ' cookie:' + (document.cookie || 'none') + ' db:' + dbs + ' online:' + navigator.onLine + ' year:' + new Date().getFullYear();
  localStorage.setItem('x', 'dirty'); sessionStorage.setItem('y', 'dirty'); document.cookie = 'c=dirty; path=/';
  await new Promise((r) => { const q = indexedDB.open('leftover'); q.onsuccess = () => { q.result.close(); r(); }; q.onerror = r; });
})();
</script></body></html>`;

test('a reused context is clean: no storage, cookie, database, offline or clock left by the run before', async (t) => {
  let pw;
  try { pw = playwright(); } catch { t.skip('Playwright is not installed'); return; }
  const server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': req.url.endsWith('.json') ? 'application/json' : 'text/html' }); res.end(req.url.endsWith('.json') ? '{}' : PAGE); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await pw.chromium.launch();
  const pool = leafContextPool();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leaf-pool-'));
  try {
    const run = leafRunner({ base, defaults: { url: '/p.html', clipCheck: false }, verbs: {}, evidenceDir: dir, pool });
    const leaf = (id, clock, year, extra = []) => ({
      node: { id, type: 'outcome', clip: false, visible: [{ text: `storage:none session:none cookie:none db:none online:true year:${year}` }] },
      state: { reset: { url: '/p.html' }, ...(clock ? { clock } : {}) },
      taps: [{ wait: 300 }, ...extra],
    });
    const now = new Date().getFullYear();
    const a = await run(browser, leaf('a', '2030-03-03T09:00:00', 2030, [{ offline: true }, { advance: '400d' }]), 'en', 390);
    assert.equal(a.result, 'pass', JSON.stringify(a.failures));
    const b = await run(browser, leaf('b', '2034-01-01T09:00:00', 2034), 'en', 390);
    assert.equal(b.result, 'pass', `the second clock leaf, on the same context: ${JSON.stringify(b.failures)}`);
    assert.equal(pool.size, 1, 'the two clock runs shared one context');
    const c = await run(browser, leaf('c', null, now), 'en', 390);
    assert.equal(c.result, 'pass', `a real-time leaf never gets a context whose clock was faked: ${JSON.stringify(c.failures)}`);
    assert.equal(pool.size, 2);
    const failing = { node: { id: 'f', type: 'outcome', clip: false, visible: [{ text: 'never shown' }] }, state: { reset: { url: '/p.html' } }, taps: [] };
    const f = await run(browser, failing, 'en', 390);
    assert.equal(f.result, 'fail');
    assert.equal(pool.size, 1, 'a failed run closes its context: a retry starts fresh');
  } finally {
    await pool.close(); await browser.close(); server.close(); fs.rmSync(dir, { recursive: true, force: true });
  }
});
