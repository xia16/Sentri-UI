// Review images from the live Farrowing and Inspection prototypes. The response route substitutes only the room geometry;
// it leaves the hosts and the shared PenMap unchanged. Nothing is written to ux/ before canvas agreement.
// Usage: SENTRI_PLAYWRIGHT=/path/to/playwright node features/farrowing/penmap-sync-round/mock.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const port = await new Promise(resolve => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
const base = `http://localhost:${port}`;
const { chromium } = playwright();
const browser = await chromium.launch();

const rooms = {
  long: `lanes:['A','B','C','D'].map(()=>({runs:[{n:50,type:'Farrowing crate',size:180}]})),depth:50`,
  mixed: `lanes:[{runs:[{n:10,type:'Group pen',size:483},{n:12,type:'Gestation stall',size:65}]},{runs:[{n:10,type:'Group pen',size:483},{n:12,type:'Gestation stall',size:65}]}],rows:[{letter:'C',at:'far',runs:[{n:24,type:'Gestation stall',size:65}]}],depth:22`,
};
const tasks = {
  farrowing: { script: 'farrowing-astra-concept.js', screen: 'farrowing.pen-map', source: 'lanes:penLanes,depth:penDepth', room: 'long' },
  inspection: { script: 'inspection-astra-concept.js', screen: 'inspection.go-to-pen', source: 'lanes:PEN_LANES,depth:PEN_DEPTH', room: 'long' },
};

async function shoot(task, state, room = '') {
  const spec = tasks[task];
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  if (room) await page.route(`**/${spec.script}*`, async route => {
    const file = path.join(root, 'ux/system', spec.script);
    const src = fs.readFileSync(file, 'utf8');
    if (!src.includes(spec.source)) throw new Error(`${spec.script}: map props changed`);
    let proposed = src.replace(spec.source, rooms[room]);
    // The host's generic [data-action] listener otherwise redraws on the new Whole room button's empty action.
    if (state !== 'old-whole') proposed = proposed.replaceAll("gallery.addEventListener('click',e=>{const el=e.target.closest('[data-action]');", "gallery.addEventListener('click',e=>{if(e.target.closest('.st-pen-whole-toggle'))return;const el=e.target.closest('[data-action]');");
    await route.fulfill({ body: proposed, contentType: 'text/javascript' });
  });
  const url = `${base}/ux/system/${spec.script.replace(/\.js$/, '.html')}?layout=focus&screen=${spec.screen}`;
  await page.goto(url);
  await page.waitForSelector('.st-pen-map');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  if (state === 'whole' || state === 'old-whole' || state === 'group') {
    await page.locator('.st-pen-whole-toggle').click();
    await page.waitForTimeout(350);
    const pressed = await page.locator('.st-pen-whole-toggle').getAttribute('aria-pressed');
    if (pressed !== (state === 'old-whole' ? 'false' : 'true')) throw new Error(`${task}: unexpected Whole room state ${pressed}`);
    if (state === 'group') {
      await page.locator('.st-pen-group[data-from="B1"]').click();
      await page.waitForTimeout(350);
      if (await page.locator('.st-pen-whole-toggle').getAttribute('aria-pressed') !== 'false') throw new Error(`${task}: shared tile did not return to pen by pen`);
    }
  }
  const name = `${task}-${state}.png`;
  await page.screenshot({ path: path.join(here, name), clip: { x: 0, y: 0, width: 390, height: 844 } });
  console.log(name);
  await page.close();
}

try {
  for (const task of Object.keys(tasks)) {
    await shoot(task, 'now');
    await shoot(task, 'long', 'long');
    await shoot(task, 'old-whole', 'long');
    await shoot(task, 'whole', 'long');
  }
  await shoot('farrowing', 'mixed', 'mixed');
  await shoot('farrowing', 'group', 'long');
} finally {
  await browser.close();
  server.kill();
}
