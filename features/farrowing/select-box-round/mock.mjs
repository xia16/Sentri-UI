// The multi-select box (owner, 2026-11-03, canvas pick B): renders the canvas's screens from the live prototypes at 390, one PNG
// each, into this folder. "before" is the base commit's page (served from git: /@<sha>/…), "after" this checkout's. The task-item
// question has no "after" yet: its B face is drawn by laying the proposed rule over the live page (TASK_B).
// Usage: node features/farrowing/select-box-round/mock.mjs [base url] [base sha]   (default http://localhost:4317, `npm run ux`; origin/main)
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = (process.argv[2] || 'http://localhost:4317').replace(/\/$/, '');
const sha = process.argv[3] || execSync('git merge-base HEAD origin/main', { encoding: 'utf8' }).trim();
const { chromium } = playwright();

// The task item, B: the ticked disc in the multi-select green, the row left white (the proposal, not built).
const TASK_B = '.st-row-mark[data-mark="ticked"]{border-color:var(--select-mark,#258048);background:var(--select-mark,#258048)}.st-row[data-ticked]{background:transparent}';

// Each shot: an atlas screen (bare, ?screen=), then taps (CSS selectors) inside the phone.
const shots = {
  'choose-pigs': { url: '/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.batch-pick' },
  'walk': { url: '/ux/system/inspection-astra-concept.html?layout=focus&screen=disease.add-select' },
  'picker': { url: '/ux/system/inspection-astra-concept.html?layout=focus&screen=disease.catalogue', taps: ['[data-condition="Coughing"]', '[data-condition="Diarrhoea (watery)"]'] },
  'scan-list': { url: '/ux/system/home-astra-prototype.html?section=gestation&scan=list&screen=find-pig.scan-list' },
  'task-item': { url: '/ux/tasks/piglet-processing/simple/index.html?pen=A03&screen=piglet-processing.sheet-todo', taps: ['#sp-tk-iron', '[data-action="item"][aria-pressed="false"]'], after: false },
};

const browser = await chromium.launch();
async function shoot(name, shot, side, css) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(base + (side === 'before' ? `/@${sha}` : '') + shot.url);
  await page.waitForTimeout(1500);
  for (const t of shot.taps || []) { const el = page.locator(t).first(); if (await el.count()) { await el.click(); await page.waitForTimeout(400); } else console.warn(`${name}: no ${t}`); }
  if (css) await page.addStyleTag({ content: css });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(here, `${name}-${side}.png`) });
  await page.close();
  console.log(`${name}-${side}`);
}
for (const [name, shot] of Object.entries(shots)) {
  await shoot(name, shot, 'before');
  if (shot.after !== false) await shoot(name, shot, 'after');
  else await shoot(name, shot, 'b', TASK_B);
}
await browser.close();
