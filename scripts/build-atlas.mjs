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

const STATUSES = ['placeholder', 'in-design', 'agent-checked', 'approved', 'earlier'];
// an alias screen renders its target: it takes the target's page (url, preset, steps, notes) and shows as the same screen
const byId = {};
for (const f of features) for (const s of f.screens || []) byId[s.id] = s;
for (const f of features) for (const s of f.screens || []) {
  if (!s.aliasOf) continue;
  const t = byId[s.aliasOf];
  if (!t) { problems.push(`features/${f.id}: ${s.id} is an alias of ${s.aliasOf}, which no feature has`); continue; }
  if (t.aliasOf) { problems.push(`features/${f.id}: ${s.id} is an alias of ${s.aliasOf}, which is itself an alias`); continue; }
  s.status = t.status;   // the same screen has the same status
  for (const k of ['url', 'preset', 'steps', 'notes']) if (s[k] === undefined && t[k] !== undefined) s[k] = t[k];
}
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
  let st = (f.screens || []).map((s) => s.status);
  if (!st.length || st.every((x) => x === 'placeholder')) return 'placeholder';
  // superseded designs do not hold a feature back; a feature with only those is itself earlier
  if (st.every((x) => x === 'earlier')) return 'earlier';
  st = st.filter((x) => x !== 'earlier');
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
  ['Base', ['Button', 'IconButton', 'Icon', 'Heading', 'Row', 'Panel', 'Facts', 'Log', 'Sheet', 'Segment', 'FilterChips', 'ChoiceList', 'CategoryFooter']],
  ['Inputs and filters', ['FilterSheet', 'RangeSlider']],
  ['Fields', ['Field', 'PickerField', 'Stepper', 'Measure', 'Numpad']],
  ['Status and feedback', ['Status', 'ConditionTag', 'Banner', 'Photos']],
  ['Task skeleton', ['TaskPhone', 'TaskHeader', 'TaskSummary', 'TaskLens', 'TaskGroup', 'TaskDock', 'TaskHold', 'TaskTotals', 'TaskProgress', 'TaskStepper', 'TaskPhotos', 'TaskChoice', 'TaskRadios', 'TaskWarning', 'TaskTable', 'TaskMetrics', 'TaskSection', 'TaskReceipt', 'TaskDay', 'TaskChips']],
];
const components = [];
for (const [group, names] of GROUPS) for (const name of names) {
  const gp = join(root, 'ux/design-system/components', name, 'gate.json');
  let gate = null;
  if (existsSync(gp)) { try { gate = JSON.parse(readFileSync(gp, 'utf8')); } catch (e) { problems.push(`components/${name}/gate.json: ${e.message}`); } }
  if (gate && !['in-design', 'agent-checked', 'approved', 'retired'].includes(gate.status)) problems.push(`components/${name}/gate.json: status "${gate.status}"`);
  // which files exist, so the atlas page asks only for those (a missing variants.json or variant page is a 404 in the console)
  const cdir = join(root, 'ux/design-system/components', name), vdir = join(cdir, 'variants');
  const files = { variantsJson: existsSync(join(cdir, 'variants.json')), variants: existsSync(vdir) ? readdirSync(vdir).filter((n) => n.endsWith('.html')).map((n) => n.slice(0, -5)).sort() : [] };
  components.push({ name, group, status: gate?.status || 'in-design', gate, files });
}
const proposedPath = join(root, 'ux/design-system/components/_proposed.json');
if (existsSync(proposedPath)) for (const c of read('ux/design-system/components/_proposed.json')) {
  for (const id of c.seenIn || []) if (!owner[id]) problems.push(`components/_proposed.json: ${c.name} is seen in ${id}, which no feature has`);
  components.push({ name: c.name, group: c.group, status: 'placeholder', seenIn: c.seenIn || [], note: c.note || '' });
}
for (const p of sections.platforms) for (const s of p.sections) for (const pt of s.patterns || []) for (const id of pt.screens || []) if (!owner[id]) problems.push(`sections.json: pattern "${pt.name}" names ${id}, which no feature has`);

// backlog: review/*.json (written by review sweeps) plus every component gate finding and proposal.
// review/scenarios*.json (and review/scenarios/) are the behaviour gate's run results (scripts/run-scenarios.mjs), not backlog.
const backlog = [];
const KINDS = ['decision', 'design', 'broken', 'unclear'];
const reviewDir = join(root, 'review');
if (existsSync(reviewDir)) for (const fn of readdirSync(reviewDir).filter((n) => n.endsWith('.json') && !n.startsWith('scenarios'))) {
  let data; try { data = JSON.parse(readFileSync(join(reviewDir, fn), 'utf8')); } catch (e) { problems.push(`review/${fn}: ${e.message}`); continue; }
  for (const it of Array.isArray(data) ? data : data.items || [data]) {
    if (!it || !it.id || !it.title || !it.target) { problems.push(`review/${fn}: an item needs id, target and title`); continue; }
    if (!KINDS.includes(it.kind)) problems.push(`review/${fn}: ${it.id} has kind "${it.kind}"`);
    backlog.push({ severity: 'medium', source: fn.replace(/\.json$/, ''), ...it });
  }
}
const BROKEN = /overflow|clipp|target|\b4[0-7]px\b|not working|doesn.t work|console|error|swallow|vanish|loses|cannot|broken/i;
for (const c of components) {
  if (!c.gate) continue;
  (c.gate.findings || []).forEach((f, i) => {
    const text = typeof f === 'string' ? f : f.text || '';
    const title = text.length > 100 ? text.slice(0, 97).replace(/\s+\S*$/, '') + '…' : text;
    backlog.push({ id: `gate:${c.name}:${i}`, target: { kind: 'component', id: c.name }, kind: BROKEN.test(text) ? 'broken' : 'design', severity: f.severity || 'medium', title, detail: text + (f.fix ? `\nFix: ${f.fix}` : ''), source: 'gate' });
  });
  (c.gate.proposals || []).forEach((p, i) => {
    const title = p.kind === 'merge' ? `Merge ${p.name}?` : p.kind === 'new-variant' ? `New variant: ${p.name}?` : `New component: ${p.name}?`;
    backlog.push({ id: `gate:${c.name}:p${i}`, target: { kind: 'component', id: c.name }, kind: 'decision', severity: 'medium', title, detail: (p.why || '') + ((p.seenIn || []).length ? `\nSeen in: ${p.seenIn.join(', ')}` : ''), source: 'gate' });
  });
}

if (problems.length) {
  console.error(`atlas: ${problems.length} problem(s), atlas.json not written:\n  - ` + problems.join('\n  - '));
  process.exit(1);
}

let commit = '';
try { commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch {}
// Components, copy, backlog and the Old UI catalogue belong to a platform. Everything that exists today is mobile.
// A backlog item inherits the platform of the feature or screen it targets; component, section and unknown targets are mobile.
const platOfFeature = Object.fromEntries(features.map((f) => [f.id, f.platform]));
const backlogPlatform = (b) => {
  const t = b.target || {};
  if (t.kind === 'feature') return platOfFeature[t.id] || 'mobile';
  if (t.kind === 'screen') return platOfFeature[owner[t.id]] || 'mobile';
  return 'mobile';
};
const atlas = {
  generated: new Date().toISOString(),
  commit,
  platforms: sections.platforms.map((p) => {
    const mobile = p.id === 'mobile';
    return {
      id: p.id, name: p.name,
      sections: p.sections.map((s) => ({ ...s, features: features.filter((f) => f.platform === p.id && f.section === s.id).map((f) => ({ ...f, status: statusOf(f) })) })),
      components: mobile ? components : [],
      copy: mobile ? { registry: 'ux/laws/strings.json' } : null,
      backlog: backlog.filter((b) => backlogPlatform(b) === p.id),
      oldUi: mobile ? oldUi : [],
    };
  }),
};
const counts = features.reduce((c, f) => ((c[statusOf(f)] = (c[statusOf(f)] || 0) + 1), c), {});
if (check) { console.log(`atlas: ok — ${features.length} features`, counts); process.exit(0); }
writeFileSync(join(root, 'atlas/atlas.json'), JSON.stringify(atlas, null, 1) + '\n');
console.log(`atlas: wrote atlas/atlas.json — ${features.length} features`, counts);
