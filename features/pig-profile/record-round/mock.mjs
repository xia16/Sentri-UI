// The pig record's top, round 6 (owner, 2026-11-03): health as one sideways-swiping line of chips, coloured by what the pig needs
// ("no icon, just chips with colours representing what they need to do, or a tiny icon plus colour"), and the task's date tile wide
// enough for "13 SEP". Renders the canvas's screens from the live prototype at 390, one PNG each, into this folder. "old" is main,
// "now" is this branch's record (one-line rows); A and B are laid over the live page, nothing is built.
// Usage: node features/pig-profile/record-round/mock.mjs <now base url> [old base url]
//   e.g. node features/pig-profile/record-round/mock.mjs http://localhost:4400/.claude/worktrees/pig-record-trim http://localhost:4400/.claude/worktrees/main-ref
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const now = (process.argv[2] || 'http://localhost:4317').replace(/\/$/, '');
const old = (process.argv[3] || now).replace(/\/$/, '');
const { chromium } = playwright();

const url = '/ux/system/inspection-astra-concept.html?layout=focus&screen=pig-profile.full';
const note = ['[data-action="pig-actions"]', '.st-row-tile[data-action="note"]', { fill: 'textarea', text: 'Red line on left shoulder · monitor overnight' }, '[data-action="bulk-save"]', '[data-action="pig"][data-value="000306"]'];
// Three sows: busy (two conditions under care, one ongoing, two tasks, a note), typical (Thin, a task tomorrow), quiet (a task only).
const states = { busy: { scenario: 'health-mixed', steps: note }, typical: { scenario: 'profile-full' }, quiet: { scenario: 'profile-partial' } };

// A and B: the Health card becomes one line of chips that swipes sideways (no-piling-up: an edge fade only when it overflows).
// The chip's colour is what she needs: Hospital red wash, Treat amber fill, Monitor amber outline, ongoing quiet. B adds the care glyph.
function chips(withIcon) {
  const sec = document.querySelector('.pig-health');
  if (!sec) return;
  const look = {
    hospital: 'background:var(--red-wash);color:var(--red-ink);border-color:var(--red-wash)',
    treat: 'background:var(--amber-fill);color:var(--amber-fill-ink);border-color:var(--amber-fill)',
    monitor: 'background:var(--amber-wash);color:var(--amber);border-color:var(--pending-border)',
    ongoing: 'background:var(--well);color:var(--ink-2);border-color:var(--well)',
  };
  const glyph = { hospital: 'hospital', treat: 'treat', monitor: 'monitor', ongoing: 'health' };
  const items = [...sec.querySelectorAll('.st-row')].map((r) => {
    const t = (r.querySelector('.st-row-trailing')?.textContent || '').trim();
    const care = /^Hospital/.test(t) ? 'hospital' : /^Treat/.test(t) ? 'treat' : /^Monitor/.test(t) ? 'monitor' : 'ongoing';
    return { name: r.querySelector('.st-row-copy strong').textContent.trim(), day: t.replace(/^(Hospital|Treat|Monitor) · /, ''), care, action: r.dataset.action, value: r.dataset.value };
  });
  const chip = (x) => `<button type="button" data-action="${x.action}" data-value="${x.value}" style="display:inline-flex;align-items:center;gap:6px;flex:none;min-height:44px;padding:0 14px;border:1px solid;border-radius:999px;font:600 15px/1.2 var(--font-sans);white-space:nowrap;${look[x.care]}">${withIcon ? `<span style="display:inline-flex;width:16px;height:16px">${SentriIcons.icon(glyph[x.care]).replace('<svg', '<svg width="16" height="16"')}</span>` : ''}${x.name}<span style="font-weight:400">${x.day}</span></button>`;
  sec.innerHTML = `<div class="st-panel" style="position:relative;padding:10px 0;overflow:hidden"><div data-mock-strip style="display:flex;gap:8px;overflow-x:auto;padding:0 12px;scrollbar-width:none">${items.map(chip).join('')}</div><span data-mock-fade="end" style="position:absolute;top:1px;bottom:1px;right:0;width:56px;display:none;align-items:center;justify-content:flex-end;padding-right:10px;background:linear-gradient(to right,rgba(255,255,255,0),#fff 60%);color:var(--ink-2);pointer-events:none">${SentriIcons.icon('chevron').replace('<svg', '<svg width="16" height="16"')}</span><span data-mock-fade="start" style="position:absolute;top:1px;bottom:1px;left:0;width:56px;display:none;align-items:center;padding-left:10px;background:linear-gradient(to left,rgba(255,255,255,0),#fff 60%);color:var(--ink-2);pointer-events:none">${SentriIcons.icon('chevron').replace('<svg', '<svg width="16" height="16" style="transform:rotate(180deg)"')}</span></div>`;
  const s = sec.querySelector('[data-mock-strip]'), end = sec.querySelector('[data-mock-fade="end"]'), start = sec.querySelector('[data-mock-fade="start"]');
  const fades = () => { const over = s.scrollWidth > s.clientWidth + 1; end.style.display = over && s.scrollLeft + s.clientWidth < s.scrollWidth - 1 ? 'flex' : 'none'; start.style.display = over && s.scrollLeft > 1 ? 'flex' : 'none'; };
  s.addEventListener('scroll', fades); fades();
}
// The date tile in a one-line task row: 64px, so "13 SEP" sits inside it with room either side.
const wideDate = () => { for (const d of document.querySelectorAll('.pig-tasks .st-row-date')) { d.style.width = '64px'; d.style.flex = 'none'; } };

const columns = { old: { base: old, steps: [] }, now: { base: now, steps: [] }, a: { base: now, steps: [[chips, false], [wideDate]] }, b: { base: now, steps: [[chips, true], [wideDate]] } };

const browser = await chromium.launch();
for (const [state, st] of Object.entries(states)) {
  for (const [col, c] of Object.entries(columns)) {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await p.goto(c.base + url);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(800);
    await p.evaluate((s) => { const sel = document.querySelector('select.scenario'); sel.value = s; sel.dispatchEvent(new Event('change', { bubbles: true })); }, st.scenario);
    await p.waitForTimeout(500);
    for (const step of st.steps || []) { if (step.fill) await p.fill(step.fill, step.text); else await p.click(step); await p.waitForTimeout(400); }
    for (const [f, arg] of c.steps) await p.evaluate(f, arg);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(here, `${state}-${col}.png`) });
    // The swipe: the busy sow's chips scrolled to their end.
    if (state === 'busy' && (col === 'a' || col === 'b')) {
      await p.evaluate(() => { const s = document.querySelector('[data-mock-strip]'); s.scrollLeft = s.scrollWidth; });
      await p.waitForTimeout(200);
      await p.screenshot({ path: path.join(here, `${state}-${col}-swiped.png`) });
    }
    await p.close();
  }
}
await browser.close();
console.log('wrote', here);
