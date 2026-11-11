// Render the five current move screens at 390×844 from the live repository pages.
// The generated images are baseline evidence for the owner decision canvas, not a new prototype.
// Usage: SENTRI_PLAYWRIGHT=/path/to/playwright node features/move/review-canvas/mock.mjs
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const out = path.join(here, 'shots');
const ids = ['move.tagged', 'move.picker', 'move.mixed', 'move.after', 'move.transfer-sow'];
if (!process.argv.includes('--sow-only')) {
  const shot = spawnSync(process.execPath, [path.join(root, 'scripts/shoot-screens.mjs'), out,
    '--screens', ids.join(','), '--widths', '390', '--langs', 'en,zh'],
    { cwd: root, env: process.env, stdio: 'inherit' });
  if (shot.status !== 0) process.exit(shot.status || 1);
}

// The atlas bare replay currently stops at the sow's Actions layer. Take the final
// in-design sheet from that same live iframe by tapping its Transfer action.
const port = await new Promise((resolve) => {
  const server = createServer();
  server.listen(0, '127.0.0.1', () => {
    const value = server.address().port;
    server.close(() => resolve(value));
  });
});
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)],
  { cwd: root, stdio: 'ignore' });
const base = `http://127.0.0.1:${port}`;
try {
  for (let i = 0; i < 30; i++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  const browser = await playwright().chromium.launch();
  try {
    for (const lang of ['en', 'zh']) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
      try {
        const url = `${base}/ux/system/farrowing-astra-concept.html?layout=focus${lang === 'zh' ? '&lang=zh' : ''}`;
        await page.goto(url);
        await page.getByText('000418').first().click();
        await page.waitForTimeout(400);
        await page.locator('[data-action="sowActions"]').first().click({ timeout: 3000 });
        await page.waitForTimeout(400);
        const frame = page.frames().find((f) => f.url().includes('inspection-astra-concept.html'));
        if (!frame) throw new Error('The sow Actions iframe did not load');
        const action = frame.locator('[data-action="sow-host-action"][data-value="transfer"]');
        if (!(await action.count())) throw new Error('The live Transfer sow action was not found');
        await action.first().click();
        await frame.getByText(lang === 'zh' ? '转移母猪' : 'Transfer sow').first().waitFor();
        await page.addStyleTag({ content: '[data-card="0"] .phone{width:390px!important;height:843px!important;min-width:390px!important;max-width:390px!important;min-height:843px!important;max-height:843px!important;box-sizing:border-box!important}' });
        await page.locator('[data-card="0"] .phone').screenshot({ path: path.join(out, 'move.transfer-sow', `${lang}-390.png`) });
        console.log(`live sow transfer sheet: ${lang}-390`);
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
} finally { server.kill(); }
