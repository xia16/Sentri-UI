'use strict';
/* Copy budgets: the string keys that feed buttons, segments, chips and tabs stay within their component's copy budget
   (README "Copy budget" in ux/design-system/components/<Name>/README.md; the rule is docs/design-workflow/research/component-standard.md,
   checklist line 9). Over-budget copy is rewritten in ux/laws/strings.json (the sp.* keys: ux/tasks/piglet-processing/simple/strings.js,
   then `node ux/tasks/piglet-processing/simple/register.mjs`), never wrapped or shrunk.

   How the keys are found. Every visible label is a registry key; the registry has no "this key feeds a Button" field, so the
   test selects by the registry's own kind and by key shape, the same shapes the call sites use:
     Button   kind "action" (the Button factory's labels: act.*, *.act.*, pp.*.act.*), minus the hold captions below
     Hold     an uppercase action or label ("HOLD TO SAVE") is a hold caption; a hold label is a Button label
     Segment  keys ending .lens.<word> / .lens.w.<word> / .seg.<word>, plus the task-skeleton demo's segment keys (tk.demo.lens.*,
              tk.demo.piglets, tk.demo.sow, tk.demo.born.more, tk.demo.born.wrong); option count 2-3 is the budget used
     Chip     keys ending .chip.<word> / .chips.<word> (Status chips and FilterChips), minus aria, tip, none, and the
              prose line "Already done in {n} pens"
     Tab      keys ending .tab.<word> (the Piglet processing pen tabs)
     Site     simple/app.js call sites (see fromSite below): the label: / caption: keys of UI.button, hold and sheetFooter calls
     Tool     the Button tool register's labels in the pen sheet: sp.tr.id.*, sp.tool.*, sp.more.title
   Budgets are in characters. A slot such as {n} or {tag} counts as 3 characters (a count slot beside a segment label is
   stripped: the count is its own property). Run with COPY_BUDGET_REPORT=1 to list every key checked. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const strings = JSON.parse(fs.readFileSync(path.join(__dirname, '../laws/strings.json'), 'utf8')).strings;

// { en, zh } characters; one line each (see the READMEs).
const BUDGET = {
  button: { en: 24, zh: 12 },   // Button: footer primary, secondary, destructive
  caption: { en: 20, zh: 10 },  // Button: hold caption (uppercase)
  segment: { en: 12, zh: 6 },   // Segment: 2-3 options
  chip: { en: 12, zh: 6 },      // FilterChips and Status chips
  tab: { en: 12, zh: 6 },       // Segment view-switch used as tabs
  tool: { en: 13, zh: 6 },      // Button tool register, three in a row
};

const SEGMENT_KEYS = /(^|\.)(lens\.w\.[a-z]+|lens\.(?!aria)[a-z]+|seg\.[a-z]+)$|^tk\.demo\.(piglets|sow|born\.more|born\.wrong)$/;
const TOOL_KEYS = /^sp\.(tr\.id\.[a-z]+|tool\.[a-z]+|more\.title)$/;
const CHIP_KEYS = /(^|\.)chips?\.(id\.)?[a-z_]+$/;
const CHIP_NOT = /\.(aria|tip|none|label)$/;
const TAB_KEYS = /(^|\.)tabs?\.[a-z_]+$/;
const TAB_NOT = /\.(label)$/;

const len = (s, { strip = false } = {}) => {
  let t = String(s);
  if (strip) t = t.replace(/\s*\{n\}/g, '');
  return [...t.replace(/\{[^}]*\}/g, 'xxx')].length;
};
const isCaption = (v) => /[A-Z]/.test(v.en) && v.en === v.en.toUpperCase();

// Entries are exceptions the rewrite deliberately keeps. Each needs a reason.
const ALLOW = {
  'pp.move.act.move': 'R1-18 (ux/research): the Move button states the count and the crates it records; the pen codes are data, so the string cannot be cut without losing what the button records. Owner decision pending: move the crates to the line above the button.',
  'pp.move.act.move_with': 'R1-18: the button also names each answer given for a partly done source (the {what} slot joins several), which cannot be bounded here. Owner decision pending, as for pp.move.act.move.',
  'tk.demo.born.wrong': '“Count was wrong” is a ruled term of the farrowing Edit ceremony (RULINGS.md), shown as a radio row in farrowing; only the task-skeleton demo draws it as a segment.',
};

function classify(key, v) {
  if (fromSite(key)) return fromSite(key);
  if (TOOL_KEYS.test(key)) return 'tool';
  if (CHIP_KEYS.test(key) && !CHIP_NOT.test(key)) return 'chip';
  if (SEGMENT_KEYS.test(key)) return 'segment';
  if (TAB_KEYS.test(key) && !TAB_NOT.test(key)) return 'tab';
  if (v.kind === 'action' || (v.kind === 'label' && isCaption(v) && /hold|caption/.test(key))) return isCaption(v) ? 'caption' : 'button';
  return null;
}

// The Piglet processing prototype (simple/) is plain JS with its words in strings.js; its Button labels are found at the call
// sites: a line with UI.button( / primary: / hold: / sheetFooter(, and a label: or caption: that is T('key') or S('key').
const SIMPLE = path.join(__dirname, '../tasks/piglet-processing/simple/app.js');
const siteKeys = { button: new Set(), caption: new Set() };
if (fs.existsSync(SIMPLE)) {
  for (const line of fs.readFileSync(SIMPLE, 'utf8').split(/\r?\n/)) {
    if (!/UI\.button\(|primary:|hold:|sheetFooter\(/.test(line)) continue;
    for (const m of line.matchAll(/\b(label|caption)\s*:\s*(?:K\.)?[TS]\('([a-z0-9_.]+)'/g)) siteKeys[m[1] === 'caption' ? 'caption' : 'button'].add('sp.' + m[2]);
  }
}
const fromSite = (key) => {
  const base = key.replace(/\.(0|1)$/, '');
  return siteKeys.caption.has(base) ? 'caption' : siteKeys.button.has(base) ? 'button' : null;
};

const checked = Object.entries(strings).map(([key, v]) => [key, v, classify(key, v)]).filter((x) => x[2]);

test('the key selection finds every group', () => {
  for (const g of ['button', 'caption', 'segment', 'chip', 'tab', 'tool']) assert.ok(checked.some((x) => x[2] === g), `no key found for ${g}`);
});

test('allowlist entries each give a reason and name a real key', () => {
  for (const [k, why] of Object.entries(ALLOW)) {
    assert.ok(strings[k], `${k} is not in strings.json`);
    assert.ok(String(why).length > 12, `${k}: say why`);
  }
});

test('every button, hold caption, segment, chip and tab string is within its copy budget (EN and ZH)', () => {
  const over = [];
  for (const [key, v, group] of checked) {
    if (ALLOW[key]) continue;
    const b = BUDGET[group], strip = group === 'segment';
    const en = len(v.en, { strip }), zh = len(v.zh, { strip });
    if (process.env.COPY_BUDGET_REPORT) console.log(group.padEnd(8), String(en).padStart(3), String(zh).padStart(3), key, '|', v.en, '|', v.zh);
    if (en > b.en) over.push(`${key} [${group}] EN ${en} > ${b.en}: "${v.en}"`);
    if (zh > b.zh) over.push(`${key} [${group}] ZH ${zh} > ${b.zh}: "${v.zh}"`);
  }
  assert.deepStrictEqual(over, [], 'over budget: rewrite the copy (shortest that still names the act), do not wrap it:\n' + over.join('\n'));
});

test('English and Chinese stay in step: neither is empty, and Chinese adds no slot English lacks', () => {
  for (const [key, v] of checked) {
    assert.ok(v.en && v.zh, `${key}: missing a language`);
    if (/.(0|1)$/.test(key)) continue; // a singular/zero variant hard-codes its number in English and shares the base Chinese
    const slots = (s) => (String(s).match(/\{[^}]*\}/g) || []).sort().join(',');
    // a Chinese string may drop a slot the English needs for grammar ("1 piglet"), never add one
    const zs = slots(v.zh).split(',').filter(Boolean), es = slots(v.en).split(',').filter(Boolean);
    for (const s of zs) assert.ok(es.includes(s), `${key}: ZH has ${s} that EN lacks`);
  }
});
