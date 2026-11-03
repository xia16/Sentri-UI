// Writes the icon round into the component library docs: the Icon card README (rules + the one-meaning table, generated from
// meanings.json), the Icons asset README, and the design-system README's Iconography section. Safe to rerun.
// Usage (from the repo root): node review/icon-round/write-docs.mjs
import fs from 'node:fs';

const m = JSON.parse(fs.readFileSync('review/icon-round/meanings.json', 'utf8'));
const keepEol = (file, text) => { const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; const eol = old.includes('\r\n') ? '\r\n' : '\n'; fs.writeFileSync(file, text.replace(/\r*\n/g, eol)); };
const cell = (t) => t.replace(/\|/g, '\\|');

// 1. The Icon card README.
const icon = 'ux/design-system/components/Icon/README.md';
let r = fs.readFileSync(icon, 'utf8').replace(/\r\n/g, '\n');
const rules = `## Meaning rules

The rules come from the owner (2026-11-03). How the icons were drawn and tested is in [review/icon-round](../../../../review/icon-round/PROPOSAL.md).

1. **One meaning per icon.** The table below is the source. A label whose meaning has no icon gets the word alone; never borrow an icon for another meaning (a person for a sow, a warning for a death, a chart for a task).
2. **Use an icon wherever its meaning applies.** Reuse an icon that passed before drawing a near-copy.
3. **Never repeat an icon across the section headings of one page.** Repeated list items of the same kind may share one.
4. **One pig for every kind and age.** \`pig\` stands for a sow, gilt, boar or piglet; the word beside it says which. At 16 px the kinds can't be told apart.
5. **Generic where the farm makes it obvious:** \`transfer\` moves pigs, \`bookmark\` marks a pig, and \`more\` (···) is every Actions button. \`grid\` is only the pen map and a unit.
6. **Good enough or not at all.** A new glyph passes a blind naming test first: a fresh tester names it unlabelled at 16–18 px, then matches it to the labels. A glyph that fails isn't added. \`batch\` and \`farrow\` passed as borderline: they read only beside their word.

## One meaning per icon

${m.groups.map(([g, items]) => `**${g}**\n\n| Icon | Meaning | Used on |\n|---|---|---|\n${items.map(([n, , mean, use]) => `| \`${n}\` | ${cell(mean)} | ${cell(use)} |`).join('\n')}`).join('\n\n')}
`;
r = r.replace(/\n## Meaning rules[\s\S]*?(?=\n## Content rules)/, '\n');
r = r.replace('\n## Content rules', '\n' + rules + '\n## Content rules');
r = r.replace('Compatibility aliases are non-enumerable: origin → place, arrow → chevron, condition → plus. Condition was a longer plus cross; use plus for that glyph.',
  'Compatibility aliases are non-enumerable: origin → place, arrow → chevron, condition → plus, return → undo, up → back-chevron. Condition was a longer plus cross; use plus for that glyph. Return was the Undo arrow and now means only undo; the return-heat check has its own glyph. Up was a second copy of back-chevron.');
r = r.replace("The Home task card uses this registry too: `production` and `care` are shared glyphs; its location, clock, transfer, check and chevron use `place`, `clock`, `transfer`, `check` and `chevron`. Its ended-task mark uses `minus`. The card carries no SVG path definitions of its own.",
  "The Home task card uses this registry too: its identity icon is the task's own (`farrow`, `pig`, `service`…, falling back to `production`), and its location, clock, transfer, check and chevron use `place`, `clock`, `transfer`, `check` and `chevron`. Its ended-task mark uses `minus`. The card carries no SVG path definitions of its own.");
if (!r.includes('2026-11-03: icon round')) r = r.replace('## Changelog\n', `## Changelog\n\n2026-11-03: icon round (review/icon-round). New: missing, batch, service, return-heat, death, truck, sample, count, history, tasks, undo, pen, fan. Redrawn: pig (one body for every kind), farrow (a sow with her piglet; no longer the pregnancy pulse), note (a sticky note) and record (a clipboard), no longer the same page, and chart (a line on axes; production keeps the bars). return and up became aliases. Added the meaning rules and the one-meaning table; usage swapped across Farrowing, Inspection (names only) and Home.\n`);
keepEol(icon, r);

// 2. The Icons asset README: the common meanings point at the table.
const asset = 'ux/design-system/assets/Icons/README.md';
let a = fs.readFileSync(asset, 'utf8').replace(/\r\n/g, '\n');
a = a.replace(/\*\*What the common glyphs mean\*\*[\s\S]*?(?=\n\*\*Current source\*\*)/, `**What the glyphs mean**
- Each glyph has one meaning: the table and the rules are in the [Icon card](../../components/Icon/README.md#one-meaning-per-icon).
- The farm glyphs most screens use: \`pig\` (any pig: sow, gilt, boar, piglet), \`batch\`, \`farrow\`, \`pregnancy\`, \`service\`, \`heat\`, \`return-heat\`, \`death\`, \`transfer\` (move pigs), \`truck\` (pigs leaving the farm), \`sample\`, \`count\`, \`pen\`, \`feed\`, \`health\`, \`treat\`.
- Controls: \`chevron\` means more, \`back\` returns, \`check\` is done or selected, \`filter\` opens filters, \`scan\` reads an ear tag, \`more\` (···) is every Actions button, \`undo\` undoes the last save.
- \`offline\` means no signal, and \`upload\` means records waiting to upload.
- \`backspace\` (candidate, ADR 0001) deletes the last typed character on the Numpad. Its standalone export is \`backspace.svg\`; the live glyph is in \`SentriIcons\`.
`);
keepEol(asset, a);

// 3. The design-system README's Iconography section: one pointer line to the rules.
const ds = 'ux/design-system/README.md';
let d = fs.readFileSync(ds, 'utf8').replace(/\r\n/g, '\n');
const line = '- One meaning per icon, used wherever that meaning applies, never twice across the section headings of one page; one `pig` for every kind of pig. The rules and the meaning table are in the [Icon card](components/Icon/README.md#meaning-rules).';
if (!d.includes(line)) d = d.replace('- Every icon keeps its word.', line + '\n- Every icon keeps its word.');
keepEol(ds, d);
console.log('wrote', icon, asset, ds);
