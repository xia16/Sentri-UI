// The finished record as an overview, Litter details as the place for depth (owner, 2026-11-02:
// "this page does not look clean … the one outside is an overview, if they go into the details they should see more
// information, maybe even past performances").
// Real prototype screens at 390; the bodies are rebuilt with the design system's own parts (SentriUI.*) and the Alive card.
// Usage (from the repo root): node features/farrowing/edit-record-round/mock-details.mjs <out dir>
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const { playwright } = await import(pathToFileURL(path.join(root, 'scripts/playwright-path.mjs')).href);
const { chromium } = playwright();
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const port = 4739;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 500));
const b = await chromium.launch();
async function open(screen) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`http://localhost:${port}/ux/system/farrowing-astra-concept.html?layout=focus&screen=${screen}`);
  await p.waitForSelector('html.atlas-ready', { timeout: 15000 });
  return p;
}
const shot = async (p, name) => { await p.waitForTimeout(500); await p.screenshot({ path: path.join(out, name) }); };

// The litter as a picture: of 14 born, 7 alive now · 5 died after birth · 2 born dead. Palette validated with the dataviz
// validator (#1d7444 / #de8a6e pass CVD 14.4 protan); grey is the neutral rest; every segment is labelled with its number.
const CSS = `
.mock-alive-stats{display:flex;flex-direction:column;align-items:flex-end;gap:6px;font:400 14px/18px var(--font-sans);color:var(--muted)}
.mock-alive-stats b{font:600 16px/18px var(--font-mono);color:var(--ink);margin-right:4px}
.mock-run{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 16px;padding:12px 0 14px;border-top:1px solid var(--line)}
.mock-run-copy{display:flex;flex-direction:column;gap:8px;min-width:0}
.mock-run-copy small{font:400 13px/18px var(--font-sans);color:var(--muted)}
.mock-run-chips{display:flex;flex-wrap:wrap;gap:5px}
.mock-run .alive-chip{display:inline-flex;align-items:center;gap:5px;height:24px;box-sizing:border-box;padding:0 7px;border-radius:999px;font:500 13px/1 var(--font-sans);background:#eceee7;color:#4b5547;white-space:nowrap}
.mock-run .alive-chip b{font:600 14px/1 var(--font-mono)}
.farrowing-phone .mock-undo{flex:none;display:inline-flex;align-items:center;gap:5px;height:44px;min-height:44px;margin-right:-8px;padding:0 8px;border:0;background:none;font:600 13px/16px var(--font-sans);color:var(--ink)}
.farrowing-phone .mock-undo svg{width:16px;height:16px;stroke-width:2}
.farrowing-phone .mock-alive{margin:0 0 16px;border:1px solid var(--line);border-radius:20px;background:#f6f7f1;overflow:hidden}
.farrowing-phone .mock-alive .alive-card{margin:0;border:0;border-radius:0;background:transparent}
.mock-stamp{font-weight:400;color:var(--muted)}
/* Litter details */
.mock-litter{display:flex;flex-direction:column;gap:14px}
.mock-bar{display:flex;gap:2px;height:12px;margin-top:2px}
.mock-bar span{display:block;height:100%}
.mock-bar span:first-child{border-radius:4px 0 0 4px}.mock-bar span:last-child{border-radius:0 4px 4px 0}
.mock-legend{display:flex;flex-wrap:wrap;gap:6px 16px;font:400 13px/18px var(--font-sans);color:var(--ink-2,#4a524c)}
.mock-legend span{display:inline-flex;align-items:center;gap:6px}
.mock-legend i{display:inline-block;width:10px;height:10px;border-radius:3px}
.mock-legend b{font:600 14px/18px var(--font-mono);color:var(--ink)}
.mock-rule{height:1px;background:var(--line)}
.mock-section{margin-top:24px}
.mock-fig .st-row-trailing{font:600 16px/20px var(--font-mono);color:var(--ink)}
.mock-fig .st-row{min-height:52px;padding-top:10px;padding-bottom:10px}
.mock-fig + .mock-fig{margin-top:10px}
.mock-parity .st-row-trailing{font:600 16px/20px var(--font-mono);color:var(--ink)}
`;
const style = async (p) => p.addStyleTag({ content: CSS });

// 1. Overview: the finished record is the drawer she had while farrowing. The Alive card (alive now, with born and dead at
//    its right, "Finished Aug 27" beside the label), the last save under its divider, then the bar: Back · Record dead · ···.
//    The facts wall, the Litter summary heading, View log, Death causes and the tool row all move to Litter details.
{
  const p = await open('farrowing.locked');
  await style(p);
  await p.evaluate(() => {
    const U = window.SentriUI, ic = (k) => window.SentriIcons.icon(k);
    const sheet = document.querySelector('.sheet[data-view="locked"]');
    sheet.querySelector('.sheet-body').innerHTML = `<div class="mock-alive">
      <button type="button" class="alive-card" data-action="litter" aria-label="Alive now 7. Open litter details">
        <span class="alive-label">Alive now <span class="mock-stamp">· Finished Aug 27</span></span>
        <span class="alive-go">Details${ic('chevron')}</span>
        <span class="alive-row"><span class="alive-figure">7</span><span class="mock-alive-stats"><span><b>14</b>born</span><span><b>7</b>dead</span></span></span>
      </button>
      <div class="mock-run"><div class="mock-run-copy"><small>Saved 14:02 · G.H</small><span class="mock-run-chips"><span class="alive-chip"><b>−1</b>died</span></span></div>
      <button type="button" class="st-text-action mock-undo" data-ds="Button" data-register="text">${ic('return')}<span>Undo</span></button></div></div>`;
    const footer = sheet.querySelector('.sheet-footer');
    footer.className = 'sheet-footer execution-completion count-footer';
    footer.innerHTML = U.backButton({ action: 'close' }) + U.button({ label: 'Record dead', register: 'primary', action: 'death' }) + U.iconButton({ action: 'sowActions', icon: ic('more'), label: 'Actions for sow 000418' });
    sheet.dataset.size = 'medium';
  });
  await shot(p, 'details-1-overview.png');
  await p.close();
}

// 2–3. Litter details, a page: the litter as a picture, losses by cause, the finish facts, her litters, then the log.
{
  const p = await open('farrowing.history');
  await style(p);
  await p.evaluate(() => {
    const U = window.SentriUI, ic = (k) => window.SentriIcons.icon(k);
    const sec = document.querySelector('.sheet');
    const bar = sec.querySelector('.statusbar').outerHTML;
    const fig = (title, n) => U.row({ title, trailing: String(n) });
    const litter = U.heading({ title: 'This litter', icon: ic('farrow'), meta: 'Finished Aug 27 · G.H', kind: 'section', level: 3 })
      + U.panel(`<div class="mock-litter">${U.facts([{ label: 'Total born', value: 14 }, { label: 'Born alive', value: 12 }, { label: 'Alive now', value: 7 }], { variant: 'figures', panel: false })}
        <div class="mock-bar" role="img" aria-label="Of 14 born: 7 alive now, 5 died after birth, 2 born dead"><span style="flex:7;background:#1d7444"></span><span style="flex:5;background:#de8a6e"></span><span style="flex:2;background:#c9cdc4"></span></div>
        <div class="mock-legend"><span><i style="background:#1d7444"></i><b>7</b>alive now</span><span><i style="background:#de8a6e"></i><b>5</b>died after birth</span><span><i style="background:#c9cdc4"></i><b>2</b>born dead</span></div></div>`);
    const losses = `<div class="mock-section">${U.heading({ title: 'Losses', icon: ic('trend-down'), meta: '7 dead', kind: 'section', level: 3 })}
      ${U.rowGroup(fig('Crushed', 4) + fig('Other', 1), { title: 'Died after birth', className: 'mock-fig' })}
      ${U.rowGroup(fig('Stillborn', 1) + fig('Mummified', 1), { title: 'Born dead', className: 'mock-fig' })}</div>`;
    const finish = `<div class="mock-section">${U.heading({ title: 'At finish', icon: ic('record'), kind: 'section', level: 3 })}
      ${U.facts([{ label: 'Weak', value: 1 }, { label: 'Deformed', value: 1 }, { label: 'Assisted', value: 'Yes' }, { label: 'Litter weight', value: '12.6 kg' }])}</div>`;
    const parity = (title, desc, n) => U.row({ title, description: desc, trailing: String(n) });
    const hers = `<div class="mock-section">${U.heading({ title: 'Her litters', icon: ic('chart'), meta: 'Born alive', kind: 'section', level: 3 })}
      ${U.rowGroup(parity('Parity 3 · this litter', 'Aug 2026 · 7 alive now', 12) + parity('Parity 2', 'Jun 2026 · 13 weaned', 14) + parity('Parity 1', 'Jan 2026 · 11 weaned', 12), { className: 'mock-parity' })}</div>`;
    const doors = `<div class="mock-section">${U.rowGroup(U.row({ title: 'Farrowing log', description: '9 records · last today 14:02 · G.H', icon: ic('record'), action: 'history', trail: 'chevron' }) + U.row({ title: 'Production stats', description: 'All her batches', icon: ic('chart'), action: 'profile', trail: 'chevron' }))}</div>`;
    sec.outerHTML = U.sheet({ variant: 'page', title: 'Litter details', line: '000418 · B1 · Parity 3', back: { action: 'back' }, body: litter + losses + finish + hers + doors, footer: '', className: 'detail-sheet mock-details', label: 'Litter details', bar });
  });
  await shot(p, 'details-2-page-top.png');
  await p.evaluate(() => { const b = document.querySelector('.mock-details .sheet-body'); b.scrollTop = b.scrollHeight; });
  await shot(p, 'details-3-page-bottom.png');
  await p.close();
}

await b.close(); server.kill();
