// Icon tiles in one livelier colour (owner, 2026-11-03: "make the icons colors better … just use a single color", Actions too):
// renders each candidate from the live prototype at 390, one PNG per screen and option, into this folder. Every icon tile (row icons,
// Actions tiles, condition marks) reads two tokens, row-icon-bg and row-icon-ink, so an option is those two values laid over the page.
// Usage: node features/inspection/icon-colour-round/mock.mjs [base url]   (default http://localhost:4317, `npm run ux`)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = (process.argv[2] || 'http://localhost:4317').replace(/\/$/, '');
const { chromium } = playwright();

const page = (screen) => `/ux/system/inspection-astra-concept.html?layout=focus&screen=${screen}`;
const screens = { actions: page('inspection.actions'), medicines: page('treat.medicine-picker') };
// [tile, icon]; icon on tile is 5.4:1 or better for each (scripts/check-colours.mjs contrast).
const options = {
  now: null,
  sage: ['#dde8d2', '#35512d'],   // the same family, one step deeper
  teal: ['#dcefec', '#1d6359'],   // a cool accent outside the status hues
  violet: ['#ebe7f7', '#4f3f8f'], // a distinct accent outside the status hues
  forest: ['#ddefe2', '#1f6a3c'], // the brand green (shares a hue with done and the ticked box)
  ink: ['#2a3628', '#ffffff'],    // a dark tile, white icon
  tealSolid: ['#1f7a6d', '#ffffff'],   // a solid teal tile, white icon (the iOS Settings pattern, one colour)
  violetSolid: ['#5b4ba8', '#ffffff'], // a solid violet tile, white icon
};

const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const browser = await chromium.launch();
for (const [name, url] of Object.entries(screens)) {
  for (const [opt, pair] of Object.entries(options)) {
    if (only && !only.includes(opt)) continue;
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await p.goto(base + url);
    await p.waitForTimeout(1500);
    if (pair) await p.addStyleTag({ content: `:root{--row-icon-bg:${pair[0]};--row-icon-ink:${pair[1]}}` });
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(here, `${name}-${opt}.png`) });
    await p.close();
    console.log(`${name}-${opt}`);
  }
}
await browser.close();
