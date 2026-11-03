// Colour in the health and treatment pickers (owner, 2026-11-03: "conditions … looks really grey and dull", treatment and medicine
// too): renders the canvas's screens from the live prototype at 390, one PNG each, into this folder. "now" is the page as it is; each
// option is laid over the live page (a surface attribute, a rule, a few words), nothing is built.
// Usage: node features/inspection/picker-colour-round/mock.mjs [base url]   (default http://localhost:4317, `npm run ux`)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const base = (process.argv[2] || 'http://localhost:4317').replace(/\/$/, '');
const { chromium } = playwright();
const days = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root, 'ux/system/medicines-catalogue.json'), 'utf8')).medicines.map((m) => [m.en, m.withdrawal]));

const page = (screen) => `/ux/system/inspection-astra-concept.html?layout=focus&screen=${screen}`;
const screens = {
  conditions: { url: page('disease.catalogue'), taps: ['[data-condition="Coughing"]', '[data-condition="Lame (swollen joint)"]'] },
  area: { url: page('disease.catalogue'), taps: ['[data-condition="Coughing"]', '[data-action="condition-level"][data-value="g:breathing"]'] },
  medicines: { url: page('treat.medicine-picker') },
  treatment: { url: page('treat.record') },
};

// The options, each a function run in the page after the taps (cumulative: B includes A, C includes B).
// A · White rows: a picker is a menu drawer (every row an option), so it takes the tint with white cards (SURFACES rule 1;
//     the open question under rule 6). One attribute on the sheet.
const white = () => { for (const s of document.querySelectorAll('.sheet[data-st-context="drawer"]')) if (s.querySelector('.st-choice-row, .st-picker-option, .catalog-item')) s.setAttribute('data-st-context', 'menu'); };
// B · The selection in green: what you ticked is the only green on the sheet. A row that holds ticks inside it (a body area)
//     shows the count as a select-mark pill in place of the muted "1 selected".
const counts = () => {
  for (const m of document.querySelectorAll('.st-choice-meta, small')) {
    const t = /^(\d+) selected$/.exec(m.textContent.trim());
    if (!t) continue;
    m.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px 2px 6px;border-radius:999px;background:var(--select-mark);color:#fff;font:600 13px/1.4 var(--font-sans)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${t[1]} selected</span>`;
  }
};
// C · Treatment says its consequence: each medicine row shows its meat withdrawal on the right ("14 d"), and the form's
//     withdrawal line becomes the amber caution it is (banner-wash, the TaskWarning amber): no pig leaves before that date.
const consequence = (days) => {
  for (const r of document.querySelectorAll('.st-choice-row, .st-picker-option, .medicine-option')) {
    const label = r.querySelector('.st-choice-label, strong');
    const d = label && days[label.textContent.trim()];
    if (!d || r.querySelector('[data-mock-wd]')) continue;
    const tag = document.createElement('span');
    tag.dataset.mockWd = '';
    tag.textContent = `${d} d`;
    tag.style.cssText = 'flex:none;margin-left:auto;font:500 13px/1.4 var(--font-sans);color:var(--amber-fill-ink)';
    r.appendChild(tag);
  }
  for (const e of document.querySelectorAll('.st-picker-hint, .st-field-message')) {
    if (!/^Withdrawal period/.test(e.textContent.trim())) continue;
    e.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:8px;padding:10px 12px;border:1px solid var(--banner-border);border-radius:12px;background:var(--banner-wash);color:var(--amber-fill-ink);font:500 14px/1.4 var(--font-sans)';
    e.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>${e.textContent.trim().replace(/^Withdrawal period (\d+) days · until (.*)$/, 'No sale before $2 · $1-day withdrawal')}</span>`;
  }
};
// D · Hue by kind: each body area and medicine category keeps one hue on its icon tile (a pale tile, the icon in the deep tone),
//     so a worker finds Breathing or Parasite control by colour as well as by word. The hues sit outside the status set (no
//     green, blue, amber or red), so a tile never reads as a status. New tokens if built.
const hues = () => {
  const H = { teal: ['#e2f0ee', '#25615a'], violet: ['#ece8f5', '#55468a'], rose: ['#f6e5ea', '#8a3550'], clay: ['#f4e7df', '#81462a'], slate: ['#e7eaee', '#3f4a5a'], olive: ['#eceedd', '#545a22'] };
  const by = { 'Whole animal': 'slate', Breathing: 'teal', Head: 'violet', Gut: 'clay', Skin: 'rose', Legs: 'olive', Antibiotics: 'teal', 'Pain relief and anti-inflammatory': 'rose', 'Parasite control': 'olive', Vaccines: 'violet' };
  const order = Object.keys(H);
  let n = 0;
  for (const r of document.querySelectorAll('.st-row[data-variant="navigation"], .st-choice-row')) {
    const tile = r.querySelector('.st-row-icon');
    const label = r.querySelector('.st-row-copy > strong, .st-choice-label');
    if (!tile || !label || !tile.querySelector('svg')) continue;
    const [bg, ink] = H[by[label.textContent.trim()] || order[n++ % order.length]];
    tile.style.background = bg; tile.style.color = ink;
  }
};
const options = { now: [], a: [white], b: [white, counts], c: [white, counts, consequence], d: [white, counts, consequence, hues] };

const browser = await chromium.launch();
for (const [name, shot] of Object.entries(screens)) {
  for (const [opt, steps] of Object.entries(options)) {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await p.goto(base + shot.url);
    await p.waitForTimeout(1500);
    for (const t of shot.taps || []) { const el = p.locator(t).first(); if (await el.count()) { await el.click(); await p.waitForTimeout(400); } else console.warn(`${name}: no ${t}`); }
    for (const f of steps) await p.evaluate(f, days);
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(here, `${name}-${opt}.png`) });
    await p.close();
    console.log(`${name}-${opt}`);
  }
}
await browser.close();
