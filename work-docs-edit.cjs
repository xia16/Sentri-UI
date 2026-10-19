// One-off (deleted after use): docs for the calmer colour and the ready-to-close state (owner, 2026-10-19).
const fs = require('fs');
const edit = (p, pairs) => { let s = fs.readFileSync(p, 'utf8'); for (const [a, b] of pairs) { if (!s.includes(a)) throw new Error(p + ' missing: ' + a.slice(0, 70)); s = s.split(a).join(b); } fs.writeFileSync(p, s); };

edit('ux/design-system/components/TaskTile/README.md', [
  ['red with the solid "!" when part is overdue ("2 overdue"). The line keeps its height when empty.',
   'red with the solid "!" when part is overdue ("2 overdue"), or a quiet tick for "Ready to close". The line keeps its height when empty.'],
  ['A task past its planned end adds one red segment per day over and reads "1 day overdue" in red; its to-do says how many are overdue ("6 overdue", red word).',
   'A task past its planned end adds one red segment per day over and reads "1 day overdue"; its to-do says how many are overdue ("6 overdue"). The red segment is the only colour on that tile.'],
  ['White on the tinted page, 1px `line` border, `radius-panel`, 14px padding. A tile past its plan has a `danger-border` edge.',
   'White on the tinted page, 1px `line` border, `radius-panel`, 14px padding. **One coloured signal at most** (owner, 2026-10-19): red only on the overdue line or the days over; no red edge, no red words beside it.'],
  ['| Past its plan | Red edge; "6 overdue" (red word); a red run segment per day over; "1 day overdue". |',
   '| Past its plan | "6 overdue"; a red run segment per day over (the only colour); "1 day overdue". |\n| Ready to close | Everything recorded, task still open: "All recorded", a tick and "Ready to close", the run full. A reminder only: closing stays inside the task. |'],
]);
edit('ux/design-system/components/TaskTile/variants.json', [['      "Past its plan",\n', '      "Past its plan",\n      "Ready to close",\n']]);
edit('ux/design-system/components/TaskTile/variants/tile.html', [
  ['<section data-state="Past its plan"></section>\n', '<section data-state="Past its plan"></section>\n<section data-state="Ready to close"></section>\n'],
  ["  'Last day':", "  'Ready to close':[T({id:'p28',title:'Pregnancy check',sub:'Batch 28',todo:{none:'All recorded'},next:{text:'Ready to close',tone:'done'},days:{day:3,total:3}})],\n  'Last day':"],
]);
edit('ux/design-system/components/WeekBoard/README.md', [
  ['A row past its plan has a red label.', 'A row past its plan keeps its plain label; the red is on its cells.'],
  ['Past its plan: a red edge (today: red count on `red-wash`).', 'Past its plan: a red edge, nothing else red.'],
  ['| Past its plan | A red edge on every day after the planned end; the label turns red. |', '| Past its plan | A red edge on every day after the planned end; the label stays plain. |'],
]);
edit('features/workbench/PRD.md', [
  ['A task past its planned end says how many are overdue ("6 overdue"), its run grows one red segment per day over and reads "1 day overdue", and the tile takes a red edge.',
   'A task past its planned end says how many are overdue ("6 overdue"), its run grows one red segment per day over and reads "1 day overdue". **One coloured signal per tile at most** (owner, 2026-10-19): the overdue line or the days over, never a red edge or red words beside them. **Ready to close** (owner, 2026-10-19, reversing the 2026-10-12 decision below): when everything the task asks for is recorded and the task is still open, the tile reads "All recorded" with a quiet tick and "Ready to close"; it is a reminder, and closing stays inside the task (Home has no close button).'],
  ['("N waiting since yesterday" in red, else its units;', '("N waiting since yesterday", plain, else its units;'],
  ['past its plan (red edge; the batch label turns red).', 'past its plan (a red edge on the cell; nothing else red).'],
  ['- Decided (2026-10-12; aligned 2026-10-14): remove Home\'s inferred "ready to complete" state.',
   '- Superseded 2026-10-19 (owner): the Overview tile shows "All recorded · Ready to close" when everything is recorded and the task is open; closure still belongs to the task. The Android Home PRD needs the same change.\n- Decided (2026-10-12; aligned 2026-10-14): remove Home\'s inferred "ready to complete" state.'],
]);
edit('features/workbench/budget.md', [
  ['| Pigs marked to treat, aging since yesterday | Act now | Health card, To treat (red line) |', '| Pigs marked to treat, aging since yesterday | Act now | Health card, To treat (plain line) |'],
  ['| Closed today | Settled | One quiet line under Production |', '| Everything recorded, task still open | Act now (quiet) | Tile: "All recorded", tick "Ready to close" |\n| Closed today | Settled | One quiet line under Production |'],
]);
const fp = 'features/workbench/feature.json';
const f = JSON.parse(fs.readFileSync(fp, 'utf8'));
for (const s of f.screens) for (const e of (s.notes && s.notes.elements) || []) {
  if (e.name === 'Production tile') {
    const st = e.states.find(x => x.state === 'Past its plan');
    if (st) st.shows = '"6 overdue"; one red run segment per day over (the only colour on the tile); "1 day overdue"';
    if (!e.states.find(x => x.state === 'Ready to close')) e.states.push({ state: 'Ready to close', when: 'Everything the task asks for is recorded and the task is still open', shows: '"All recorded", a quiet tick and "Ready to close", the run full; closing stays inside the task' });
  }
  if (e.name === 'Health') e.shows = e.shows.replace('("N waiting since yesterday" in red, else its units)', '("N waiting since yesterday", plain, else its units)');
}
fs.writeFileSync(fp, JSON.stringify(f, null, 2) + '\n');
console.log('ok');
