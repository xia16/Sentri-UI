// Guard for the owner's 2026-10-12 rulings (ux/design-system/SURFACES.md):
//  1. Footer and dock buttons are 56px tall: the `footer-height` token is at least 56, and no rule sizes a footer or dock button under it.
//  2. Current and selected are ink, never green: no rule paints an aria-current, selected, ticked, pressed-on or checked state with a green
//     token (green means done, recorded or synced). The active category tab's underline is the one marker kept.
//  3. The one green choice is the multi-select box (owner, 2026-11-03): every checkbox ticks in `select-mark` (the count-key green, white
//     tick), and a ticked row stays white: no rule fills a row that holds a checked box.
//  4. One surface (owner, 2026-11-03): every page, drawer and dialog is the tint with white cards. No rule gives a card (`--st-panel-bg`)
//     any colour but paper, and the drawer, menu and dialog bases are the tint.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (p) => fs.readFileSync(p, 'utf8');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const root = path.join(__dirname, '../..');
const systemDir = __dirname, compDir = path.join(__dirname, '../design-system/components');

/* A flat list of { selector, body } rules: at-rule blocks (@media, @layer, @container, @supports) are walked into; @keyframes are skipped. */
function rules(css) {
  const out = [];
  const walk = (src) => {
    let i = 0;
    while (i < src.length) {
      const open = src.indexOf('{', i);
      if (open < 0) break;
      const head = src.slice(i, open).trim();
      let depth = 1, j = open + 1;
      while (j < src.length && depth) { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; j++; }
      const body = src.slice(open + 1, j - 1);
      if (/^@(media|layer|container|supports)/.test(head)) walk(body);
      else if (!head.startsWith('@')) out.push({ selector: head.replace(/\s+/g, ' '), body });
      i = j;
    }
  };
  walk(strip(css));
  return out;
}
const decls = (body) => body.split(';').map((d) => { const k = d.indexOf(':'); return k < 0 ? null : [d.slice(0, k).trim().toLowerCase(), d.slice(k + 1).trim()]; }).filter(Boolean);

const cssFiles = [
  ...fs.readdirSync(compDir).filter((n) => n.endsWith('.css')).map((n) => path.join(compDir, n)),
  ...fs.readdirSync(systemDir).filter((n) => n.endsWith('.css')).map((n) => path.join(systemDir, n)),
];
const rel = (f) => path.relative(root, f).split(path.sep).join('/');
/* A stylesheet whose first line says it is retired is loaded by no page. */
const live = cssFiles.filter((f) => !/^\/\*\s*Retired/.test(read(f)));
const all = live.flatMap((f) => rules(read(f)).map((r) => ({ ...r, file: rel(f) })));

test('the footer-height token is at least 56px', () => {
  const tokens = JSON.parse(read(path.join(__dirname, '../design-system/tokens.json')));
  const t = tokens.size.tokens.find((x) => x.name === 'footer-height');
  assert.ok(t, 'tokens.json has no footer-height token');
  assert.ok(parseFloat(t.value) >= 56, `footer-height is ${t.value}; footer and dock buttons are 56px`);
  const css = read(path.join(__dirname, '../design-system/tokens.css'));
  const m = /--footer-height:\s*([\d.]+)px/.exec(css);
  assert.ok(m && +m[1] >= 56, 'tokens.css does not carry footer-height >= 56 (run scripts/tokens-css.py)');
});

/* A footer or dock button: a button, back, primary or dock control inside (or being) a footer or dock. */
const inFooter = /(sheet-footer|st-category-footer|tk-dock|room-dock|inspect-dock|bulk-dock|page-footer|dock-pen|dock-scan|dock-search|pig-detail-footer|actions-bottom-bar|surface-back|bottom-nav)/;
const isControl = /(button|\.primary|\.secondary|surface-back|dock-pen|dock-scan|dock-search|tk-dock-primary|tk-dock-tool|tk-dock-unit|pig-actions-entry|\.tab)/;
test('no footer or dock button is sized under 56px', () => {
  const bad = [];
  for (const r of all) {
    for (const sel of r.selector.split(',').map((s) => s.trim())) {
      if (!inFooter.test(sel) || !isControl.test(sel) || /svg\s*$/.test(sel)) continue; // an icon inside the button is not the button
      for (const [k, v] of decls(r.body)) {
        if (k !== 'min-height' && k !== 'height') continue;
        const px = /^(\d+(?:\.\d+)?)px$/.exec(v);
        const small = (px && +px[1] < 56 && +px[1] > 0)
          || /var\(--(tap-min|control-height|field-height)\)/.test(v)
          || /var\(--size-(3[2-9]|4\d|5[0-5])\)/.test(v);
        if (small) bad.push(`${r.file}: ${sel} { ${k}: ${v} }`);
      }
    }
  }
  assert.deepEqual([...new Set(bad)], [], 'footer and dock buttons use var(--footer-height) (56px)');
});

/* Green tokens and the pale greens still hard-coded. */
const GREEN = /var\(--(green|green-wash|current-marker|choice-pressed-border|count-key|count-surface|chip-green-border|progress-active)\b|#(eaf2e5|eef3e7|edf2e7|eaf0e2|526847|8ea88a|eff8f1|276640|28734b)\b/i;
const STATE = /(\[aria-current|\[aria-selected|\[aria-pressed=["']?true|\[aria-checked=["']?true|:checked|\[data-ticked|\[data-selected|\[data-mark=["']?ticked|\.selected\b|\.is-selected\b|\.current\b|\.is-current\b|\[data-current)/;
const FILL = new Set(['background', 'background-color', 'border', 'border-color', 'border-left-color', 'box-shadow', 'outline', 'outline-color']);
test('no current, selected or ticked state is painted green', () => {
  const bad = [];
  for (const r of all) {
    for (const sel of r.selector.split(',').map((s) => s.trim())) {
      if (!STATE.test(sel)) continue;
      if (/st-category-tabs/.test(sel)) continue; // the active category tab keeps its underline (a tab, not a row)
      for (const [k, v] of decls(r.body)) if (FILL.has(k) && GREEN.test(v)) bad.push(`${r.file}: ${sel} { ${k}: ${v} }`);
    }
  }
  assert.deepEqual([...new Set(bad)], [], 'current/selected is ink: a check, a checkbox or an ink ring (SURFACES.md)');
});
test('the multi-select box is select-mark, the count-key green', () => {
  const tokens = JSON.parse(read(path.join(__dirname, '../design-system/tokens.json')));
  const t = tokens.color.tokens.find((x) => x.name === 'select-mark');
  assert.ok(t, 'tokens.json has no select-mark token');
  assert.equal(t.value, 'var(--count-key)', 'select-mark is the count-key green (owner, 2026-11-03)');
});

/* A checkbox: an input that is not a range slider (a range keeps its own fill colour). */
const isBox = (sel) => /\binput\b/.test(sel) && !/range/.test(sel);
test('every checkbox ticks in select-mark', () => {
  const bad = [];
  for (const r of all) {
    for (const sel of r.selector.split(',').map((s) => s.trim())) {
      if (!isBox(sel)) continue;
      for (const [k, v] of decls(r.body)) if (k === 'accent-color' && v !== 'var(--select-mark)') bad.push(`${r.file}: ${sel} { ${k}: ${v} }`);
    }
  }
  assert.deepEqual([...new Set(bad)], [], 'a multi-select box is accent-color: var(--select-mark) (SURFACES.md rule 4)');
});

/* A row around a ticked box: a :has() that finds a checked input. */
const TICKED_ROW = /:has\([^)]*:checked/;
test('a ticked multi-select row stays white', () => {
  const bad = [];
  for (const r of all) {
    for (const sel of r.selector.split(',').map((s) => s.trim())) {
      if (!TICKED_ROW.test(sel) || /:has\([^)]*:checked[^)]*\)\s+\S/.test(sel)) continue; // a part inside the row (its label) may change
      for (const [k, v] of decls(r.body)) if ((k === 'background' || k === 'background-color') && !/^(transparent|none|var\(--(paper|st-paper)\))$/.test(v)) bad.push(`${r.file}: ${sel} { ${k}: ${v} }`);
    }
  }
  assert.deepEqual([...new Set(bad)], [], 'the green box says it is ticked; the row takes no fill (SURFACES.md rule 4)');
});

/* The colour a context hands its cards: paper, or transparent for a panel inside a panel (no nested card). */
const CARD_OK = /^(var\(--(st-paper|paper)\)|transparent)$/;
test('every card is white: no context or screen paints a card the tint', () => {
  const bad = [];
  for (const r of all) {
    if (r.selector === '[data-st-context="skeleton"]') continue; // the task skeletons nobody has designed yet keep the old drawer (owner, 2026-11-03)
    for (const [k, v] of decls(r.body)) if (k === '--st-panel-bg' && !CARD_OK.test(v)) bad.push(`${r.file}: ${r.selector} { ${k}: ${v} }`);
  }
  assert.deepEqual([...new Set(bad)], [], 'a card is paper on the tint (SURFACES.md rule 2)');
});
test('drawers, menus and dialogs are the tint', () => {
  const bundle = rules(read(path.join(compDir, 'bundle.css')));
  const tint = (want) => bundle.some((r) => r.selector.split(/,(?![^(]*\))/).some((s) => want(s.trim())) && decls(r.body).some(([k, v]) => k === 'background' && v === 'var(--st-canvas)'));
  assert.ok(tint((s) => /^\.sheet:is\(/.test(s) && /data-st-context="drawer"/.test(s) && /data-st-context="menu"/.test(s)), 'a drawer and a menu drawer are the tint (SURFACES.md rule 1)');
  assert.ok(tint((s) => s === '.dialog'), 'a dialog is the tint (SURFACES.md rule 1)');
});
test('the guard itself sees a tinted card', () => {
  const rs = rules('[data-st-context="drawer"]{--st-panel-bg:var(--st-inset)} .st-panel .st-panel{--st-panel-bg:transparent}');
  assert.ok(!CARD_OK.test(decls(rs[0].body)[0][1]));
  assert.ok(CARD_OK.test(decls(rs[1].body)[0][1]));
});

test('the guard itself sees a green current row and an under-height footer button', () => {
  const css = 'button.st-row[aria-current="location"]{background:var(--green-wash)} .sheet-footer>.button{min-height:var(--control-height)}';
  const rs = rules(css);
  assert.equal(rs.length, 2);
  assert.ok(STATE.test(rs[0].selector) && GREEN.test(decls(rs[0].body)[0][1]));
  assert.ok(inFooter.test(rs[1].selector) && isControl.test(rs[1].selector) && /var\(--(tap-min|control-height)/.test(decls(rs[1].body)[0][1]));
});
test('the guard itself sees an ink box and a tinted ticked row', () => {
  const rs = rules('.st-choice-trail input[type="checkbox"]{accent-color:var(--ink)} .st-row:has(input:checked){background:var(--well)} .st-row:has(:checked) .st-choice-label{font-weight:600}');
  assert.ok(isBox(rs[0].selector) && decls(rs[0].body)[0][1] !== 'var(--select-mark)');
  assert.ok(TICKED_ROW.test(rs[1].selector));
  assert.ok(/:has\([^)]*:checked[^)]*\)\s+\S/.test(rs[2].selector), 'a part inside a ticked row is not the row');
});
