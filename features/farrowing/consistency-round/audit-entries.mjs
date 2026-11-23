// Replay every Farrowing atlas screen against the current prototype and record
// which runtime screen actually opens. This is evidence for the entrance audit;
// it does not change prototype or atlas sources.
// SENTRI_PLAYWRIGHT=/path/to/playwright node features/farrowing/consistency-round/audit-entries.mjs
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const feature = JSON.parse(readFileSync(path.join(root, 'features/farrowing/feature.json'), 'utf8'));
const port = 4734;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
const browser = await playwright().chromium.launch();

async function replay(screen) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', message => { if (message.type() === 'error' || /atlas-bare: (step not found|preset)/.test(message.text())) errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (let attempt = 0; attempt < 30; attempt++) {
      try { await page.goto(`${base}${screen.url}&screen=${screen.id}`, { waitUntil: 'domcontentloaded' }); break; }
      catch (error) { if (attempt === 29) throw error; await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    await page.locator('html.atlas-ready').waitFor({ timeout: 20000 });
    const observed = await page.evaluate(() => ({
      current: window.AtlasBare?.current?.() ?? null,
      view: document.querySelector('[data-card="0"]')?.getAttribute('data-view') ?? null,
      text: document.querySelector('[data-card="0"] .phone')?.innerText?.replace(/\s+/g, ' ').slice(0, 180) ?? ''
    }));
    return { id: screen.id, name: screen.name, preset: screen.preset, steps: screen.steps ?? [], ...observed, errors };
  } catch (error) {
    return { id: screen.id, name: screen.name, preset: screen.preset, steps: screen.steps ?? [], current: null, view: null, text: '', errors: [...errors, String(error)] };
  } finally {
    await page.close();
  }
}

try {
  const results = [];
  for (let i = 0; i < feature.screens.length; i += 4) {
    results.push(...await Promise.all(feature.screens.slice(i, i + 4).map(replay)));
  }
  const output = path.join(here, 'entry-render-results.json');
  writeFileSync(output, JSON.stringify(results, null, 2) + '\n');
  console.log(`Replayed ${results.length} Farrowing screens → ${path.relative(root, output)}`);
  for (const r of results.filter(r => r.current !== r.id || r.errors.length)) {
    console.log(`${r.id}: runtime=${r.current || 'none'}, view=${r.view || 'none'}${r.errors.length ? ', errors=' + r.errors.join(' | ') : ''}`);
  }
} finally {
  await browser.close();
  server.kill();
}
