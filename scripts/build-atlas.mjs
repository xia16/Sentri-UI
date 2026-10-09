#!/usr/bin/env node
// Writes atlas/atlas.json from sections/sections.json, features/*/feature.json (+ PRD.md)
// and references/figma/index.json. The contract is atlas/SCHEMA.md.
// It refuses to write when a source is inconsistent, and lists every problem.
//   node scripts/build-atlas.mjs [--check]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const problems = [];
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const sections = read('sections/sections.json');
const oldUi = existsSync(join(root, 'references/figma/index.json')) ? read('references/figma/index.json') : [];

const features = readdirSync(join(root, 'features'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(root, 'features', d.name, 'feature.json')))
  .map((d) => {
    const f = read(`features/${d.name}/feature.json`);
    if (f.id !== d.name) problems.push(`features/${d.name}: id "${f.id}" is not its folder's name`);
    const prd = join(root, 'features', d.name, 'PRD.md');
    f.prd = existsSync(prd) ? readFileSync(prd, 'utf8') : '';
    return f;
  });

// every screen id, unique across features
const owner = {};
for (const f of features) for (const s of f.screens || []) {
  if (owner[s.id]) problems.push(`screen ${s.id} is in both ${owner[s.id]} and ${f.id}`);
  owner[s.id] = f.id;
}

const STATUSES = ['placeholder', 'in-design', 'agent-checked', 'approved'];
for (const f of features) {
  const own = new Set((f.screens || []).map((s) => s.id));
  const where = `features/${f.id}`;
  if (!f.screens?.length) problems.push(`${where}: no screens`);
  for (const s of f.screens || []) {
    if (!STATUSES.includes(s.status)) problems.push(`${where}: ${s.id} has status "${s.status}"`);
    if (s.status === 'placeholder' && s.url) problems.push(`${where}: ${s.id} is a placeholder with a url`);
    if (s.status !== 'placeholder' && !s.url) problems.push(`${where}: ${s.id} is ${s.status} but has no url`);
    if (s.steps && (!Array.isArray(s.steps) || !s.steps.every((t) => typeof t === 'string' || (t && typeof t.tap === 'string')))) problems.push(`${where}: ${s.id} steps must be a list of strings or { tap, hold }`);
    if (s.steps && !s.url) problems.push(`${where}: ${s.id} has steps but no url`);
    if (!s.id.startsWith(f.id + '.')) problems.push(`${where}: ${s.id} does not start with "${f.id}."`);
    for (const e of s.notes?.elements || []) {
      if (!(e.states?.length || e.logic || e.rule)) problems.push(`${where}: ${s.id} element "${e.name}" has no states, logic or rule — the demo shows it; drop it (SCHEMA.md, screen notes)`);
    }
  }
  // each screen sits in exactly one place of the layout
  const placed = [];
  const a = f.anchor;
  if (a) {
    for (const st of [...(a.statuses || []), ...(a.exits || []), ...(a.task || [])]) placed.push(...(st.screens || []));
    placed.push(...(a.any || []));
  } else for (const [, ids] of f.groups || []) placed.push(...ids);
  const seen = new Set();
  for (const id of placed) {
    if (!own.has(id)) problems.push(`${where}: layout names ${id}, which is not one of its screens`);
    if (seen.has(id)) problems.push(`${where}: ${id} is placed twice`);
    seen.add(id);
  }
  if (a || f.groups) for (const id of own) if (!seen.has(id)) problems.push(`${where}: ${id} is not placed in the anchor or groups`);
  for (const [from, to] of f.flow || []) for (const id of [from, to]) if (!own.has(id)) problems.push(`${where}: flow names ${id}, not one of its screens`);
  for (const e of f.entryPoints || []) {
    if (!own.has(e.lands)) problems.push(`${where}: entry "${e.label}" lands on ${e.lands}, not one of its screens`);
    if (e.from !== null && e.from !== undefined && !owner[e.from]) problems.push(`${where}: entry "${e.label}" comes from ${e.from}, which no feature has`);
  }
  for (const x of f.addsTo || []) if (!owner[x.screen]) problems.push(`${where}: adds to ${x.screen}, which no feature has`);
  if (!sections.platforms.some((p) => p.id === f.platform && p.sections.some((s) => s.id === f.section)))
    problems.push(`${where}: platform/section ${f.platform}/${f.section} is not in sections.json`);
}

const statusOf = (f) => {
  const st = (f.screens || []).map((s) => s.status);
  if (!st.length || st.every((x) => x === 'placeholder')) return 'placeholder';
  if (st.every((x) => x === 'approved')) return 'frozen';
  if (st.every((x) => x === 'approved' || x === 'agent-checked')) return 'agent-checked';
  return 'in-design';
};

if (problems.length) {
  console.error(`atlas: ${problems.length} problem(s), atlas.json not written:\n  - ` + problems.join('\n  - '));
  process.exit(1);
}

// components: the mobile design system's parts (group, status from the gate result), plus the proposed ones not built yet
const GROUPS = [
  ['Base', ['Button', 'IconButton', 'Icon', 'Heading', 'Row', 'Panel', 'Facts', 'Log', 'Sheet', 'Segment', 'ChoiceList', 'CategoryFooter']],
  ['Fields', ['Field', 'PickerField', 'Stepper', 'Measure', 'Numpad']],
  ['Status and feedback', ['Status', 'Banner', 'Photos']],
  ['Task skeleton', ['TaskPhone', 'TaskHeader', 'TaskSummary', 'TaskLens', 'TaskGroup', 'TaskRow', 'TaskDock', 'TaskSheet', 'TaskHold', 'TaskTotals', 'TaskProgress', 'TaskStepper', 'TaskPhotos', 'TaskChoice', 'TaskRadios', 'TaskWarning', 'TaskTable', 'TaskMetrics', 'TaskSection', 'TaskReceipt', 'TaskDay', 'TaskPage', 'TaskDialog', 'TaskChips']],
];
const components = [];
for (const [group, names] of GROUPS) for (const name of names) {
  const gp = join(root, 'ux/design-system/components', name, 'gate.json');
  let gate = null;
  if (existsSync(gp)) { try { gate = JSON.parse(readFileSync(gp, 'utf8')); } catch (e) { problems.push(`components/${name}/gate.json: ${e.message}`); } }
  if (gate && !['in-design', 'agent-checked', 'approved'].includes(gate.status)) problems.push(`components/${name}/gate.json: status "${gate.status}"`);
  components.push({ name, group, status: gate?.status || 'in-design', gate });
}
const proposedPath = join(root, 'ux/design-system/components/_proposed.json');
if (existsSync(proposedPath)) for (const c of read('ux/design-system/components/_proposed.json')) {
  for (const id of c.seenIn || []) if (!owner[id]) problems.push(`components/_proposed.json: ${c.name} is seen in ${id}, which no feature has`);
  components.push({ name: c.name, group: c.group, status: 'placeholder', seenIn: c.seenIn || [], note: c.note || '' });
}
for (const p of sections.platforms) for (const s of p.sections) for (const pt of s.patterns || []) for (const id of pt.screens || []) if (!owner[id]) problems.push(`sections.json: pattern "${pt.name}" names ${id}, which no feature has`);

if (problems.length) {
  console.error(`atlas: ${problems.length} problem(s), atlas.json not written:\n  - ` + problems.join('\n  - '));
  process.exit(1);
}

let commit = '';
try { commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch {}
const atlas = {
  generated: new Date().toISOString(),
  commit,
  platforms: sections.platforms.map((p) => ({
    id: p.id, name: p.name,
    sections: p.sections.map((s) => ({ ...s, features: features.filter((f) => f.platform === p.id && f.section === s.id).map((f) => ({ ...f, status: statusOf(f) })) })),
  })),
  components,
  oldUi,
};
const counts = features.reduce((c, f) => ((c[statusOf(f)] = (c[statusOf(f)] || 0) + 1), c), {});
if (check) { console.log(`atlas: ok — ${features.length} features`, counts); process.exit(0); }
writeFileSync(join(root, 'atlas/atlas.json'), JSON.stringify(atlas, null, 1) + '\n');
console.log(`atlas: wrote atlas/atlas.json — ${features.length} features`, counts);
