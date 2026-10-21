// The rules the gate and the polish loop apply, as pure functions (tested in tests/loop-rules.test.mjs).
// Scripts: scripts/gate.mjs (the mechanical gate), scripts/polish-loop.mjs (the round ledger), scripts/shoot-screens.mjs.
// Briefs: docs/design-workflow/briefs/gate.md and polish-loop.md.
import path from 'node:path';
import _fs from 'node:fs';

export const CLASSES = ['copy', 'presentation', 'behaviour', 'shared'];
export const DIMENSIONS = ['hierarchy', 'alignment', 'legibility', 'touch', 'state', 'native'];
export const HARD = ['wrong-fact', 'lost-draft', 'dead-end', 'unreachable-control', 'broken-ruling', 'rejected-example'];

export { screensOf, DS_FEATURE, componentPage, idPath, componentPagesOf, componentsTouched, pageOf, pageAssets } from './atlas-screens.mjs';
import { DS_FEATURE, componentPage, componentsTouched, pageOf } from './atlas-screens.mjs';
import { ASSERTION_KINDS } from './scenario-tree.mjs';
import { parse } from './vendor/acorn.mjs';
import { holderAlive, pidAlive, startOf } from './process-start.mjs';

// file -> the features whose screens load it: each screen's page, and what that page loads (assetsOf: page -> files).
// A file pages of two or more features load is shared: changing it reaches them all, whatever their first frames show.
export function sharedFiles(screens, assetsOf) {
  const users = new Map();
  for (const s of screens) {
    const page = pageOf(s.url);
    for (const f of [page, ...(assetsOf[page] || [])]) { if (!users.has(f)) users.set(f, new Set()); users.get(f).add(s.feature); }
  }
  return Object.fromEntries([...users].filter(([, u]) => u.size > 1).map(([f, u]) => [f, [...u].sort()]).sort(([a], [b]) => (a < b ? -1 : 1)));
}

// Files whose change reaches every feature that draws with them: the one component implementation, the tokens, the bare-screen
// harness and the shared prototype stylesheets. A change here is a shared-component change whatever the builder declared.
const SYSTEM = [
  /^ux\/design-system\/components\/bundle\.(js|css)$/,
  /^ux\/design-system\/components\/index\.d\.ts$/,
  /^ux\/design-system\/tokens\.(css|json)$/,
  /^ux\/system\/atlas-bare\.js$/,
  /^ux\/system\/[^/]+\.css$/,
];
// The shared system: SYSTEM, plus `shared` (sharedFiles on the base checkout). The gate's escalation and its queue both use it.
export const touchesSystem = (files, shared = {}) => files.filter((f) => SYSTEM.some((re) => re.test(f)) || Object.hasOwn(shared, f));

// The outcome leaves of a features/<id>/scenarios.json tree.
export function outcomeLeaves(spec) {
  let n = 0;
  (function walk(nodes) { for (const x of nodes || []) { if (x.type === 'outcome') n++; walk(x.children); } })(spec?.tree);
  return n;
}

// A spec's outcome leaves by id: { status, checks: how many assertions the leaf makes (visible and record), node, runs: the
// language-width pairs it asks for }.
function outcomesById(spec) {
  const m = new Map(), D = spec?.defaults || {};
  const runs = (x) => (x.langs || D.langs || ['en']).flatMap((g) => (x.widths || D.widths || [390]).map((w) => `${g}-${w}`));
  (function walk(nodes) { for (const x of nodes || []) { if (x.type === 'outcome') m.set(x.id, { status: x.status || null, checks: (x.visible || []).length + (x.record || []).length, node: x, runs: runs(x) }); walk(x.children); } })(spec?.tree);
  return m;
}

// ---------- assertion contracts (Codex audit, 2026-10-21) ----------
// What an assertion holds is its contract: everything but its prose (`says`). Comparing counts let `window.saved === true` become
// `true`. A contract can't be ranked in general, so a kept leaf's assertions are compared by target (the kind and what it looks
// at): the same target with a weaker qualifier, or a new assertion that holds on any page, is lost coverage; a new target (a design
// change rewrote what the leaf checks) is listed for the owner and kept.
const kindOf = (a) => (a && typeof a === 'object' ? ASSERTION_KINDS.find((k) => k in a) || null : null);
const enOf = (t) => (typeof t === 'string' ? t : t && typeof t === 'object' ? t.en ?? null : null);
// keys sorted at every depth ({ en, zh } included: a replacer list would drop nested keys)
const sortedJson = (v) => (Array.isArray(v) ? `[${v.map(sortedJson).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${sortedJson(v[k])}`).join(',')}}` : JSON.stringify(v ?? null));
const contractOf = (a) => { const { says, ...rest } = a || {}; return sortedJson(rest); };
const shown = (a) => !(a.absent || a.is === 'absent');
const targetOf = (a) => { const k = kindOf(a); return JSON.stringify([k, k === 'text' || k === 'verb' ? enOf(a[k]) : a[k], shown(a)]); };
const scopeOf = (a) => (a.in && a.in !== 'phone' ? a.in : 'phone');
// why c (same target) holds less than b, or null
function weaker(b, c) {
  if (b.hard && !c.hard) return `drops hard ${b.hard}`;
  const k = kindOf(b);
  if ((k === 'text' || k === 'verb') && b[k]?.zh && !c[k]?.zh) return 'no longer checks zh';
  if (k === 'el' && ['enabled', 'disabled'].includes(b.is) && c.is !== b.is) return `${b.is} → ${c.is || 'present'}`;
  if (scopeOf(b) !== scopeOf(c)) {
    // looking wider is weaker for something shown; looking narrower is weaker for something absent
    if (shown(b) && scopeOf(c) === 'phone') return `looks in the phone, not ${scopeOf(b)}`;
    if (!shown(b) && scopeOf(b) === 'phone') return `looks for its absence only in ${scopeOf(c)}`;
  }
  return null;
}
// An assertion any page satisfies: a constant expression (or one ORed with a truthy literal), the whole document, the empty text.
function vacuous(a) {
  const k = kindOf(a);
  if (k === 'el') return shown(a) && /^\s*(\*|html|body|:root|html\s+body)\s*$/i.test(String(a.el));
  if (k === 'text' || k === 'verb') return shown(a) && typeof enOf(a[k]) === 'string' && !enOf(a[k]).trim();
  if (k !== 'expr') return false;
  let ast; try { ast = parse(String(a.expr), { ecmaVersion: 'latest' }); } catch { return false; }
  const e = ast.body.length === 1 && ast.body[0].type === 'ExpressionStatement' ? ast.body[0].expression : null;
  if (!e) return false;
  const constant = (n) => { let named = false; (function w(x) { if (!x || typeof x.type !== 'string') return; if ((x.type === 'Identifier' && !['undefined', 'NaN', 'Infinity'].includes(x.name)) || x.type === 'ThisExpression' || x.type === 'MetaProperty') named = true; for (const v of Object.values(x)) if (Array.isArray(v)) v.forEach(w); else if (v && typeof v.type === 'string') w(v); })(n); return !named; };
  const truthy = (n) => n.type === 'Literal' && !!n.value;
  return constant(e) || (e.type === 'LogicalExpression' && e.operator === '||' && (truthy(e.left) || truthy(e.right)));
}
// A kept leaf b → c: { lost: [why], rewritten: [why] }.
function contractChanges(b, c) {
  const lost = [], rewritten = [];
  const all = (x) => [...(x.visible || []), ...(x.record || [])];
  const B = all(b), C = all(c), had = new Set(B.map(contractOf)), has = new Set(C.map(contractOf)), explained = new Set();
  for (const a of C) if (!had.has(contractOf(a)) && vacuous(a)) {
    const was = B.find((x) => !has.has(contractOf(x)) && !explained.has(x) && kindOf(x) === kindOf(a));
    if (was) explained.add(was);
    lost.push(`asserts nothing: ${contractOf(a)}${was ? ` (was ${contractOf(was)})` : ''}`);
  }
  for (const a of B) {
    if (has.has(contractOf(a))) continue;
    const same = C.filter((x) => targetOf(x) === targetOf(a));
    if (!same.length) { if (!explained.has(a)) rewritten.push(`no longer asserts ${contractOf(a)}`); continue; }
    const why = same.map((x) => weaker(a, x));
    if (why.every(Boolean)) lost.push(`${contractOf(a)} ${why[0]}`);
  }
  if (b.clip !== false && c.clip === false) lost.push('no longer checks clipping (clip: false)');
  return { lost, rewritten };
}

// Behaviour coverage a candidate drops, per side { runner: bool, specs: { feature: parsed scenarios.json | null } }:
// the runner, a feature's scenarios.json, or a leaf. Removing coverage is a workflow change, never a design PR's. A kept leaf is also
// compared assertion by assertion (contractChanges): one weakened is lost; one rewritten to a new target goes in `rewritten`.
// A leaf is compared by its id, not counted (G14): a leaf that runs on base and is gone, made pending, or makes fewer assertions on
// the candidate is lost coverage, even when the feature's count of leaves holds (a failing leaf made pending kept the count).
// A leaf that moves to another feature keeping its id (features merged or split) is kept coverage where it lands, under the
// same tests; a scenarios.json whose every leaf moved is not lost.
export function coverageLost(base, cand, rewritten = []) {
  const lost = [];
  if (base.runner && !cand.runner) lost.push('scripts/run-scenarios.mjs is gone');
  const landed = new Map();
  for (const [g, s] of Object.entries(cand.specs || {})) for (const [id, x] of outcomesById(s)) if (!landed.has(id)) landed.set(id, { ...x, feature: g });
  for (const [f, spec] of Object.entries(base.specs || {})) {
    if (!spec) continue;
    const c = cand.specs?.[f], B = outcomesById(spec), C = outcomesById(c);
    const moved = (id) => !C.has(id) && landed.has(id) && landed.get(id).feature !== f;
    const away = [...B.keys()].filter(moved).length;
    if (!c && away < B.size) { lost.push(`features/${f}/scenarios.json is gone or unreadable`); continue; }
    const nb = outcomeLeaves(spec), nc = outcomeLeaves(c) + away;
    if (nc < nb) lost.push(`${f} has ${nc} outcome leaves, ${nb} on base`);
    for (const [id, b] of B) {
      if (b.status === 'pending') continue;
      const x = C.get(id) || (moved(id) ? landed.get(id) : null);
      if (!x) lost.push(`${f}: leaf ${id} is gone`);
      else if (x.status === 'pending') lost.push(`${f}: leaf ${id} runs on base and is pending here`);
      else if (x.checks < b.checks) lost.push(`${f}: leaf ${id} makes ${x.checks} assertion(s), ${b.checks} on base`);
      else {
        const ch = contractChanges(b.node, x.node);
        for (const w of ch.lost) lost.push(`${f}: leaf ${id} ${w}`);
        for (const w of ch.rewritten) rewritten.push(`${f}: leaf ${id} ${w}`);
        const fewer = b.runs.filter((r) => !x.runs.includes(r));
        if (fewer.length) lost.push(`${f}: leaf ${id} runs at fewer widths or languages (${fewer.join(', ')} no longer)`);
      }
    }
  }
  return lost;
}

// The gate's own tools and the workflow's text. A design PR that also changes these grades itself with tools it rewrote;
// the README rule: change the workflow in its own pull request, never inside a design PR.
const TOOLS = [
  /^scripts\/(gate|process-start|evaluate|evidence|scheduler|visit|settle|machine|png|github|static-reach|bundle-graph|scenario-runner|atlas-screens|shoot-screens|loop-rules|polish-loop|check-states|check-legibility|check-headers|run-scenarios|serve-ux|build-atlas|worktree-remove|merge-guard)\.(mjs|cjs)$/,
  /^scripts\/vendor\//,
  /^scripts\/check-(states|legibility|headers)\.fixtures\//,
  /^docs\/design-workflow\//,
  /^\.claude\/skills\//,
];
export const touchesTools = (files) => files.filter((f) => TOOLS.some((re) => re.test(f)));

// The class the gate runs: never lower than declared; shared when the system changed or screens outside the scope changed.
// The class a change's files give it (gate-simplify.md X6), before the shared system or what moved raises it: behaviour when it
// changes a script a page can run, copy when it changes only the strings registry, presentation otherwise.
export function classOfFiles(files) {
  const runtime = files.filter((f) => /^(ux|atlas|vendor)\//.test(f) && !/\.md$/i.test(f));
  if (runtime.some((f) => /\.(m?js|cjs)$/i.test(f))) return 'behaviour';
  if (runtime.length && runtime.every((f) => f === 'ux/laws/strings.json')) return 'copy';
  return 'presentation';
}

export function effectiveClass({ declared, files, diffs, scope, shared = {} }) {
  const why = [];
  const sys = touchesSystem(files, shared);
  const users = (f) => (shared[f] ? ` (${shared[f].slice(0, 5).join(', ')}${shared[f].length > 5 ? ` and ${shared[f].length - 5} more` : ''})` : '');
  if (sys.length) why.push(`changes the shared system: ${sys.slice(0, 4).map((f) => f + users(f)).join('; ')}${sys.length > 4 ? ' …' : ''}`);
  // A component page is in scope when the scope names design-system, or when the change edits that component's own folder.
  const own = componentsTouched(files);
  const outside = diffs.filter((d) => !scope.includes(d.feature) && !own.includes(componentPage(d.id)?.component));
  if (outside.length) why.push(`changes ${outside.length} screen(s) outside the scope (${[...new Set(outside.map((d) => d.feature))].join(', ')})`);
  let cls = why.length ? 'shared' : declared;
  // A moved component page is judged before/after like a screen: a change that moves one is never a copy-only change.
  const pages = diffs.filter((d) => componentPage(d.id));
  if (pages.length && CLASSES.indexOf(cls) < CLASSES.indexOf('presentation')) { cls = 'presentation'; why.push(`moves ${pages.length} component page(s) (${pages.slice(0, 3).map((d) => d.id).join(', ')}): a page that teaches the law is judged like a screen`); }
  return { cls: CLASSES.indexOf(cls) < CLASSES.indexOf(declared) ? declared : cls, why, outside };
}

// A screen diff from the two captures, one run per screen × lang × width: same / diff / new / gone / broken.
// A screen changed when any of its runs differs (`runs` names them); it is broken when the candidate fails a run the base
// rendered; a run that fails on both sides is main's (bothBroken) and the screen is judged on its other runs.
export function classifyScreens(baseRuns, candRuns, pctOf) {
  const group = (runs) => { const m = new Map(); for (const r of runs) { if (!m.has(r.screen)) m.set(r.screen, []); m.get(r.screen).push(r); } return m; };
  const tag = (r) => (r.lang ? `${r.lang}-${r.width}` : 'run');
  const B = group(baseRuns), C = group(candRuns);
  const out = { same: [], diff: [], new: [], gone: [], broken: [], bothBroken: [] };
  for (const [id, cr] of C) {
    const feature = cr[0].feature, br = B.get(id) || [];
    const at = (r) => br.find((x) => x.lang === r.lang && x.width === r.width);
    const broke = cr.find((r) => !r.ok && at(r)?.ok !== false);
    if (broke) { out.broken.push({ id, feature, error: `${tag(broke)}: ${broke.error || 'does not render'}` }); continue; }
    const both = cr.find((r) => !r.ok);
    if (both) out.bothBroken.push({ id, feature, error: `${tag(both)}: ${both.error || 'does not render'}` });
    if (!cr.some((r) => r.ok && at(r)?.ok)) { if (cr.some((r) => r.ok)) out.new.push({ id, feature, ...(br.length ? { note: 'did not render on base' } : {}) }); continue; }
    // Any changed pixel counts: rendering is deterministic on one machine, and a 1px shift of a small element is a few dozen pixels.
    const runs = [];
    let pct = 0;
    for (const r of cr.filter((x) => x.ok)) {
      if (!at(r)?.ok) { runs.push(tag(r)); continue; } // renders only on the candidate
      const p = pctOf(id, r);
      if (p > 0) runs.push(tag(r));
      pct = Math.max(pct, p);
    }
    (runs.length ? out.diff : out.same).push({ id, feature, pct: pct > 0 ? Math.max(0.0001, Math.round(pct * 1e4) / 1e4) : 0, ...(runs.length ? { runs } : {}) });
  }
  for (const [id, br] of B) if (!C.has(id)) out.gone.push({ id, feature: br[0].feature });
  return out;
}

// ---------- the scoped reach of a shared change (owner, 2026-10-20) ----------
// A shared change is checked in full on the PR's own features and on the component pages it moves. Of every other feature, only
// those in progress (features/_in-progress.json, read from the base) are checked, and only for propagation: the shared part arrived
// and renders correctly there. Every other feature is not checked.
export const IN_PROGRESS = 'features/_in-progress.json';
// The in-progress features, or null when the list can't be read (the gate then scopes nothing: it checks everything, as before).
export function readInProgress(text) {
  try { const j = JSON.parse(text); return Array.isArray(j?.features) && j.features.every((f) => typeof f === 'string' && f) ? [...j.features] : null; } catch { return null; }
}
// The PR's own features: those whose features/<id>/ files it changes, those its scope names, and the one feature of a page file only
// that feature's pages load (usersOf: file -> the features whose screens' closures hold it). A file two or more features load is
// shared, like the system files, the design system, the strings registry and the atlas: it owns no feature, and its other users are
// checked only where they are in progress (owner, 2026-10-20). On main 81 of the 84 files the closures hold are loaded by two or more
// features, so a PR names its features by its features/<id>/ files or its scope; "every feature that loads it" owned 15 features for
// one Home change (PR 243's dry run).
const SHARED_PART = [...SYSTEM, /^ux\/design-system\//, /^ux\/laws\//, /^atlas\//];
export function ownFeatures({ files, scope = [], usersOf = () => null }) {
  const own = new Set(scope), loaders = new Set();
  for (const f of files) {
    const m = /^features\/([^/]+)\//.exec(f);
    if (m) { own.add(m[1]); continue; }
    if (SHARED_PART.some((re) => re.test(f))) continue;
    const users = [...(usersOf(f) || [])];
    if (users.length === 1) own.add(users[0]);
    for (const u of users) loaders.add(u);
  }
  own.delete(DS_FEATURE);
  // A change that edits page files and names no feature (no features/<id>/ file, no scope, no page file only one feature loads)
  // owns every feature that loads them, as before scoping: otherwise a stylesheet-only edit to one feature's page would check
  // nothing of its own (2026-10-21, a try run of a Home stylesheet change owned no feature).
  if (!own.size) for (const u of loaders) if (u !== DS_FEATURE) own.add(u);
  return [...own].sort();
}
// The reach, scoped: every screen of an own feature; a component page when keepPage says so; a screen of an in-progress feature,
// as a propagation screen. Everything else is out of scope and not shot. inProgress null: nothing is scoped (the list is unreadable).
export function scopeReach({ reach, featureOf, own = [], inProgress, keepPage = () => true }) {
  const keep = new Set(), propagation = new Set(), dropped = new Map();
  let pages = 0;
  for (const id of reach) {
    if (componentPage(id)) { if (keepPage(id)) keep.add(id); else pages++; continue; }
    const f = featureOf(id);
    if (!inProgress || own.includes(f)) keep.add(id);
    else if (inProgress.includes(f)) { keep.add(id); propagation.add(id); }
    else dropped.set(f, (dropped.get(f) || 0) + 1);
  }
  const screens = [...dropped.values()].reduce((a, b) => a + b, 0);
  return { keep, propagation, outOfScope: { screens, features: [...dropped.keys()].sort(), componentPages: pages } };
}
// The SentriUI exports a component page's variant file calls: `SentriUI.x`, `SentriUI['x']`, and the same through a plain alias
// (`var UI = window.SentriUI`). null when it uses the namespace any other way: it may call anything.
export function variantCalls(html) {
  const src = String(html || '');
  const names = ['SentriUI'];
  for (const m of src.matchAll(/\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:window\.)?SentriUI\s*[;,\n]/g)) names.push(m[1]);
  const calls = new Set();
  for (const n of names) {
    const esc = n.replace(/\$/g, '\\$');
    for (const m of src.matchAll(new RegExp(`(?<![\\w$.])${esc}\\s*(?:\\.\\s*([A-Za-z_$][\\w$]*)|\\[\\s*['"]([\\w$]+)['"]\\s*\\])`, 'g'))) calls.add(m[1] || m[2]);
  }
  // any other use of the namespace (passed along, aliased some other way, indexed by a variable) can't be bounded
  const bare = src.replace(/\b(?:var|let|const)\s+[A-Za-z_$][\w$]*\s*=\s*(?:window\.)?SentriUI\s*(?=[;,\n])/g, '').replace(/(?<![\w$.])SentriUI\s*(?:\.\s*[A-Za-z_$][\w$]*|\[\s*['"][\w$]+['"]\s*\])/g, '');
  if (/(?<![\w$])SentriUI(?![\w$])/.test(bare)) return null;
  return [...calls].map((x) => `SentriUI.${x}`).sort();
}
// Which component pages a shared change keeps, and the exports it touches. touched: the exports the bundle graph says may behave
// differently (change: bundleChange's answer, null when the bundle is untouched) and those that draw a component whose folder it
// edits (stamps: exportStamps). keepPage(id): a touched component's page always; any page when a design-system input other than
// the bundle's JS changed (CSS, tokens, the atlas's code, the strings: no proof of which parts they draw) or the bundle can't be
// narrowed; otherwise a page whose variant calls a touched export, or whose calls can't be bounded (readVariant: its html or null).
export function componentScope({ files, change = null, stamps = new Map(), readVariant = () => null }) {
  const BUNDLE = 'ux/design-system/components/bundle.js';
  const own = componentsTouched(files);
  const touched = new Set([...(change && !change.all ? change.exports : []), ...[...stamps].filter(([, st]) => st.some((c) => own.includes(c))).map(([e]) => e)]);
  const dsInputs = files.filter((f) => /^(atlas|ux\/design-system|ux\/laws|vendor|review)\//.test(f) && f !== 'atlas/atlas.json' && !/^ux\/design-system\/components\/[A-Z][^/]*\//.test(f));
  const narrow = !(change && change.all) && dsInputs.every((f) => f === BUNDLE);
  const keepPage = (id) => {
    const p = componentPage(id);
    if (!p || !narrow || own.includes(p.component)) return true;
    const html = readVariant(p.component, p.variant), calls = html == null ? null : variantCalls(html);
    return calls === null || calls.some((c) => touched.has(c));
  };
  return { touched, keepPage, narrow };
}
// The components each export of a bundle shape stamps (`data-ds="<Name>"` in the export's own units), by export: SentriUI.row → [Row].
export function exportStamps(shape, namespace = 'SentriUI') {
  const out = new Map();
  for (const f of shape?.iifes || []) {
    if (f.namespace !== namespace) continue;
    for (const [e, locals] of f.exports) {
      const st = new Set();
      for (const l of String(locals).split(',')) { const u = f.units.get(l); if (u) for (const m of String(u.text).matchAll(/data-ds=\\?["']([A-Z]\w*)|dataset\.ds\s*=\s*["']([A-Z]\w*)/g)) st.add(m[1] || m[2]); }
      out.set(`${namespace}.${e}`, [...st].sort());
    }
  }
  return out;
}

// ---------- library organisation (owner, 2026-10-20) ----------
// Every component folder (a PascalCase folder under ux/design-system/components/ holding a README.md, gate.json, variants.json or
// variants/) is listed in _groups.json or marked retired in its gate.json. A folder with none of these (Cover: the library's cover
// card) is not a part. A new SentriUI export stamps a grouped component or is named in a grouped component's README.
const COMPONENTS_DIR = 'ux/design-system/components';
export function readLibrary(dir, { fsImpl } = {}) {
  const fsx = fsImpl || _fs;
  const root = path.join(dir, COMPONENTS_DIR);
  const readJson = (f) => { try { return JSON.parse(fsx.readFileSync(f, 'utf8')); } catch { return null; } };
  const groups = readJson(path.join(root, '_groups.json'));
  const folders = [];
  let names = [];
  try { names = fsx.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory() && /^[A-Z]/.test(d.name)).map((d) => d.name).sort(); } catch {}
  for (const name of names) {
    const has = (f) => fsx.existsSync(path.join(root, name, f));
    const gate = has('gate.json') ? readJson(path.join(root, name, 'gate.json')) : null;
    let readme = '';
    try { readme = has('README.md') ? fsx.readFileSync(path.join(root, name, 'README.md'), 'utf8') : ''; } catch {}
    folders.push({ name, component: ['README.md', 'gate.json', 'variants.json', 'variants'].some(has), retired: gate?.status === 'retired', readme });
  }
  return { groups, folders };
}
export function libraryProblems({ groups, folders }) {
  if (!Array.isArray(groups)) return [`${COMPONENTS_DIR}/_groups.json is unreadable`];
  const grouped = new Set(groups.flatMap((g) => g.components || []));
  return folders.filter((f) => f.component && !grouped.has(f.name) && !f.retired).map((f) => `${f.name}: in no group of _groups.json and not retired (gate.json "status": "retired")`);
}
// before: the exports base has; after: export -> the components it stamps (exportStamps); library: readLibrary of the candidate.
export function newExportProblems({ before, after, library }) {
  const grouped = new Set((Array.isArray(library?.groups) ? library.groups : []).flatMap((g) => g.components || []));
  const live = (library?.folders || []).filter((f) => grouped.has(f.name));
  const out = [];
  for (const [e, stamps] of after) {
    if (before.has(e)) continue;
    const word = e.split('.').pop();
    if (stamps.some((s) => grouped.has(s))) continue;
    if (live.some((f) => new RegExp(`(?<![\\w$])${word.replace(/\$/g, '\\$')}(?![\\w$])`).test(f.readme))) continue;
    out.push(`${e} is new and belongs to no grouped component: stamp data-ds="<Name>" of a component in _groups.json, or name it in that component's README`);
  }
  return out;
}
// The judge's library fit, over every verdict part: the worst one decides, and the notes are kept together.
export const LIBRARY_FIT = ['ok', 'restructure-needed', 'extend-existing'];
export function mergeLibrary(parts) {
  const libs = (parts || []).map((p) => p?.library).filter(Boolean);
  if (!libs.length) return undefined;
  const rank = (x) => (LIBRARY_FIT.includes(x) ? LIBRARY_FIT.indexOf(x) : LIBRARY_FIT.length); // an unknown fit is the worst: checkVerdict names it
  const fit = libs.map((l) => l.fit).reduce((a, b) => (rank(b) > rank(a) ? b : a));
  return { fit, note: [...new Set(libs.map((l) => String(l.note || '').trim()).filter(Boolean))].join(' · ') };
}

// What a judge may say about a pair: a pair with both sides is better, same or worse; a pair with one side (a new screen,
// or a removed one) passes or fails. A propagation pair (a screen of an in-progress feature a shared change reaches) is
// propagated or broken: only whether the shared part arrived and renders correctly is judged there.
const VERDICTS = { changed: ['better', 'same', 'worse'], new: ['pass', 'fail'], gone: ['pass', 'fail'] };
const PROPAGATION = ['propagated', 'broken'];

// The judge's verdict must be about this candidate, judge every pair the gate built, and agree with the mechanical result.
export function checkVerdict(verdict, mech) {
  const problems = [];
  if (!verdict || typeof verdict !== 'object') return { ok: false, problems: ['no verdict'] };
  if (!mech?.candidate || !mech?.base) return { ok: false, problems: ['mechanical.json names no candidate or base: gate again'] };
  if (verdict.candidate !== mech.candidate) problems.push(`verdict is for ${verdict.candidate}, the candidate is ${mech.candidate}`);
  if (verdict.base !== mech.base) problems.push(`verdict compares against ${verdict.base}, the base is ${mech.base}`);
  if (verdict.pass && !mech.pass) problems.push('verdict passes a candidate whose mechanical gate failed');
  if (mech.quick) problems.push('the mechanical run was --quick (a builder self-check): gate it in full');
  // Gate v2: a blocked gate could not establish its evidence (an unstable capture, a machine error twice, a run that produced nothing);
  // nothing can pass it, whatever the judge saw.
  if (mech.outcome === 'blocked') problems.push(`the mechanical gate was blocked (${(mech.blocked || [])[0] || 'no reason recorded'}): gate again; no verdict passes a blocked gate`);
  const acked = new Set((verdict.gone || []).filter((g) => g.why).map((g) => g.screen));
  for (const g of mech.screens?.gone || []) if (!acked.has(g.id)) problems.push(`screen ${g.id} was removed from the atlas: the verdict must say why under "gone"`);
  const name = (p) => `${p.screen} ${p.lang}-${p.width}`;
  const pairs = verdict.pairs || [], listed = mech.pairs || [];
  const said = new Map();
  for (const p of pairs) said.set(name(p), [...(said.get(name(p)) || []), p.verdict]);
  const paired = new Set(listed.map((p) => p.screen));
  for (const s of [...(mech.screens?.diff || []), ...(mech.screens?.new || []), ...(mech.screens?.gone || [])]) if (!paired.has(s.id)) problems.push(`screen ${s.id} moved but has no pair to judge: gate again`);
  // A judgement of a pair the manifest doesn't list is about other evidence (an earlier run, another commit): the verdict is stale.
  const manifest = new Set(listed.map(name));
  for (const p of pairs) if (!manifest.has(name(p))) problems.push(`the verdict judges pair ${name(p)}, which is not in the evidence manifest (mechanical.json pairs): judge this run's pairs`);
  for (const p of listed) {
    const kind = p.kind || 'changed', allowed = p.propagation ? PROPAGATION : VERDICTS[kind] || [], v = said.get(name(p)) || [];
    if (!v.length) { problems.push(`no judgement for pair ${name(p)}`); continue; }
    if (new Set(v).size > 1) problems.push(`pair ${name(p)} is judged ${[...new Set(v)].join(' and ')}`);
    for (const x of new Set(v)) if (!allowed.includes(x)) problems.push(`pair ${name(p)} ${p.propagation ? 'is a propagation pair (an in-progress feature the shared change reaches)' : `has ${kind === 'changed' ? 'both sides' : 'one side'}`}: its verdict is ${allowed.join(' or ') || '(unknown pair kind)'}, not "${x}"`);
    if (!p.propagation && kind === 'changed' && p.pct === 0 && v.some((x) => x !== 'same')) problems.push(`pair ${name(p)} is pixel-identical: it can only be same`);
  }
  // Gate v2 has no flaky list: a changed screen is visited again on both sides and either draws its own shot again or blocks.
  // A propagation pair is judged only propagated or broken, so it never counts toward "at least one better".
  const shows = (p) => (p.kind || 'changed') !== 'changed' || p.pct !== 0;
  const moving = listed.filter((p) => !p.propagation && (p.kind || 'changed') === 'changed' && p.pct !== 0);
  const better = moving.filter((p) => (said.get(name(p)) || []).includes('better'));
  const worse = pairs.filter((p) => p.verdict === 'worse' || p.verdict === 'fail' || p.verdict === 'broken');
  // The library fit (owner, 2026-10-20): a change that touches a component says whether it belongs where it was built. A new parallel
  // part where an existing component or variant has the job fails; a grouping that no longer makes sense passes, naming the restructure.
  if (mech.library?.required) {
    const lib = verdict.library;
    if (!lib || !LIBRARY_FIT.includes(lib.fit)) problems.push(`this change touches a component: the verdict needs "library": { "fit": "ok" | "extend-existing" | "restructure-needed", "note" }${lib ? `, not fit "${lib.fit}"` : ''}`);
    else if (lib.fit === 'extend-existing') problems.push(`library fit is extend-existing: a new parallel part where an existing component or variant has the job (${lib.note || 'no note'}): extend that one instead`);
    else if (lib.fit === 'restructure-needed' && !String(lib.note || '').trim()) problems.push('library fit is restructure-needed: its note must name the restructure');
  }
  if (verdict.pass) {
    if (worse.length) problems.push(`passes with ${worse.length} worse or failed pair(s) (broken counts as failed): ${worse.map(name).slice(0, 3).join(', ')}`);
    if ((verdict.defects || []).length) problems.push(`passes with ${verdict.defects.length} cold-look defect(s)`);
    if ((verdict.contradicted || []).length) problems.push('passes with contradicted claims');
    if ((verdict.walk || []).some((w) => w.ok !== true)) problems.push('passes with a walk entry that is not ok');
    if (mech.mode === 'refactor') { if (pairs.some((p) => p.verdict !== 'same')) problems.push('a refactor passes with a pair that is not the same'); }
    else if (moving.length && !better.length) problems.push('passes with no pair better (same is not enough)');
    else if (!listed.some((p) => !p.propagation && shows(p)) && listed.some((p) => p.propagation && shows(p))) problems.push("only propagation pairs moved: the change shows on no page of its own (its component's atlas page ds:<Name>/… or the PR's own feature), so nothing is judged better");
    else if (!(mech.screens?.diff || []).length && !(mech.screens?.new || []).length) {
      // Nothing visible changed: only a behaviour fix (which may leave every first frame alone) passes, and on a walk.
      const behaviour = ['behaviour', 'shared'].includes(mech.class?.effective || mech.class?.declared);
      const walked = (verdict.walk || []).length > 0 && verdict.walk.every((w) => w.ok === true);
      if (!behaviour || !walked) problems.push(`no screen changed: only a change declared behaviour (or shared) passes that way, with a walk where every entry is ok (class ${mech.class?.effective || mech.class?.declared || 'nothing'}, ${(verdict.walk || []).length} walk entries)`);
    }
  }
  return { ok: problems.length === 0, problems };
}

// ---------- the polish loop ----------

// grades.json: { round, commit, states: [{ screen, state, lang, width, scores: { hierarchy, ... 0|1|2 }, lost: [{ dimension, what, shot }], hard: [{ type, what, shot }] }] }
// screenIds is the round's own inventory; with the round ({ n, start }), the grades must name that round and its commit.
export function checkGrades(grades, screenIds, round) {
  const problems = [];
  if (round && grades?.round !== round.n) problems.push(`graded as round ${grades?.round ?? '(none)'}, this is round ${round.n}`);
  if (round && grades?.commit !== round.start) problems.push(`graded on ${grades?.commit ? String(grades.commit).slice(0, 7) : '(no commit)'}, the round started on ${round.start.slice(0, 7)}`);
  const states = grades?.states || [];
  if (!states.length) problems.push('no graded states');
  const seen = new Set(states.map((s) => s.screen));
  for (const id of screenIds) if (!seen.has(id)) problems.push(`screen ${id} is not graded`);
  for (const s of states) {
    const at = `${s.screen}${s.state ? ' / ' + s.state : ''}`;
    for (const d of DIMENSIONS) {
      const v = s.scores?.[d];
      if (![0, 1, 2].includes(v)) { problems.push(`${at}: ${d} must be 0, 1 or 2`); continue; }
      const lost = (s.lost || []).filter((l) => l.dimension === d);
      if (v < 2 && !lost.some((l) => l.what && l.shot)) problems.push(`${at}: ${d} = ${v} with no evidence (what + shot) for the lost point`);
    }
    for (const h of s.hard || []) {
      if (!HARD.includes(h.type)) problems.push(`${at}: hard failure "${h.type}" is not one of ${HARD.join(', ')}`);
      if (!h.what || !h.shot) problems.push(`${at}: hard failure without evidence`);
    }
  }
  return { ok: problems.length === 0, problems };
}

const total = (s) => DIMENSIONS.reduce((n, d) => n + (s.scores?.[d] ?? 0), 0);

// Worst first: hard failures, then the lowest total, then the lowest single dimension.
export function worstFirst(grades) {
  return [...(grades?.states || [])]
    .map((s) => ({ ...s, total: total(s), min: Math.min(...DIMENSIONS.map((d) => s.scores?.[d] ?? 0)) }))
    .sort((a, b) => (b.hard || []).length - (a.hard || []).length || a.total - b.total || a.min - b.min)
    .filter((s) => (s.hard || []).length || s.total < DIMENSIONS.length * 2);
}

export const hardCount = (grades) => (grades?.states || []).reduce((n, s) => n + (s.hard || []).length, 0);

// A round: { n, start, grades: {...summary}, hard, leaves: { pass, fail, blocked }, fix?: { kind: 'defect'|'enhancement', pr, merged } }
export function isClean(round) {
  if (round.hard > 0) return false;
  if (round.fix?.kind === 'defect') return false;
  if (round.fix?.kind === 'enhancement' && round.fix.merged) return false;
  return true;
}

// Keep the best version, not the last: a screen whose total fell since the round before points at the fix merged between them.
export function regressions(prev, cur) {
  return Object.keys(cur || {}).filter((k) => prev && k in prev && cur[k] < prev[k]).map((k) => ({ screen: k, from: prev[k], to: cur[k] }));
}

// Risk budget: reverted fixes count 1, best-effort ones 0.5, over all merged fixes (gstack design-review's stop-and-ask).
export const RISK_BUDGET = 0.2;
export function riskOf(rounds) {
  const f = rounds.map((r) => r.fix).filter((x) => x && x.merged);
  if (!f.length) return 0;
  return f.reduce((n, x) => n + (x.outcome === 'reverted' ? 1 : x.outcome === 'best-effort' ? 0.5 : 0), 0) / f.length;
}

// Oscillation: over the last three recorded rounds a screen went up then down, or down then up.
export function oscillating(rounds) {
  const s = rounds.filter((r) => r.scores).slice(-3).map((r) => r.scores);
  if (s.length < 3) return [];
  return Object.keys(s[2]).filter((k) => k in s[0] && k in s[1] && Math.sign(s[1][k] - s[0][k]) * Math.sign(s[2][k] - s[1][k]) < 0);
}

// Growth: hard failures rising two rounds in a row (the Piglet processing walks grew until the owner stopped them).
export function growing(rounds) {
  const h = rounds.filter((r) => typeof r.hard === 'number').slice(-3).map((r) => r.hard);
  return h.length === 3 && h[0] < h[1] && h[1] < h[2];
}

const sorted = (o) => JSON.stringify(Object.entries(o || {}).sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)));
const sameResult = (a, b) => a && b && sorted(a.scores) === sorted(b.scores) && sorted(a.leaves) === sorted(b.leaves);

// done · stopped (cap or no progress) · continue
export function loopStatus(ledger) {
  const r = ledger.rounds || [];
  const cap = ledger.cap || 5;
  const last = r[r.length - 1], prev = r[r.length - 2];
  if (r.length >= 2 && isClean(last) && isClean(prev)) {
    const open = (last.leaves?.fail || 0) + (last.leaves?.uncovered || 0);
    if (!open) return { status: 'done', why: last.leaves?.none ? 'two clean rounds in a row; no executable leaves yet, so behaviour is unverified (a declared gap)' : 'two clean rounds in a row; every leaf covered or blocked' };
    // clean but incomplete: the cap and the other stops still apply
  }
  if (r.length >= cap) return { status: 'stopped', why: `round cap (${cap}) reached` };
  const risk = riskOf(r);
  if (risk > RISK_BUDGET) return { status: 'stopped', why: `risk budget spent: ${Math.round(risk * 100)}% of merged fixes were reverted or best-effort (budget ${RISK_BUDGET * 100}%)` };
  const osc = oscillating(r);
  if (osc.length) return { status: 'stopped', why: `oscillating: ${osc.slice(0, 3).join(', ')} went up and down again; a fix is undoing another` };
  if (growing(r)) return { status: 'stopped', why: 'growing: hard failures rose two rounds in a row; more rounds make it worse' };
  if (r.length >= 2 && !last.fix?.merged && sameResult(last, prev)) return { status: 'stopped', why: 'no progress: grades and leaf results unchanged and nothing merged' };
  return { status: 'continue', why: r.length ? `round ${r.length} of at most ${cap}` : 'not started' };
}

// Information before layout (owner, 2026-10-11): a feature's screens change only after its information budget is written down
// (P3, briefs/build.md §2) in features/<id>/budget.md with an Inventory, the worker's Questions and the attention Levels.
export const BUDGET_HEADINGS = ['## Inventory', '## Questions', '## Levels'];
// The critique of the original (P1, P4, briefs/build.md §1, §4) in features/<id>/critique.md: what to keep, what is broken, what draws
// each part, and the self-crit of the directions against the original.
export const CRITIQUE_HEADINGS = ['## Keep', '## Problems', '## Parts', '## Self-crit'];
function notesProblems(file, headings) {
  return (features, read) => {
    const out = [];
    for (const f of [...new Set(features)].filter(Boolean)) {
      const text = read(`features/${f}/${file}`);
      if (text == null) { out.push(`${f}: no features/${f}/${file}`); continue; }
      const lines = text.split(/\r?\n/).map((l) => l.trim());
      const miss = headings.filter((h) => !lines.some((l) => l === h || l.startsWith(h + ' ')));
      if (miss.length) out.push(`${f}: ${file} lacks ${miss.join(', ')}`);
    }
    return out;
  };
}
export const budgetProblems = notesProblems('budget.md', BUDGET_HEADINGS);
export const critiqueProblems = notesProblems('critique.md', CRITIQUE_HEADINGS);

// A leaf's failure is a design result only once it repeats (rules ledger L26). The store keeps a result by identity ("the same
// identity gives the same result"), so a one-off failure (a tap racing a sheet's arrival) would stand for every later gate. A fresh
// failure gets one confirming run on the same identity: the same failure again is stored, confirmed; a pass (or any other result)
// is an unstable leaf, which blocks and is stored as nothing; a confirming run lost to a machine error confirms nothing.
// The same failure is the same assertion contract broken the same way (as scenarioDebt reads it); a failure the runner gave no
// contract is compared by what failed. A confirming run that fails differently is a disagreement, so unstable (Codex audit,
// 2026-10-21: a second, different failure confirmed the first); one that could not run confirms nothing and blocks.
// x, y: the scheduler's results ({ run } or { machine } or { error }).
const failureKeys = (run) => [...new Set((run?.failures || []).map((f) => (f.contract && f.category ? `${f.contract}|${f.category}` : `what:${f.what}`)))].sort().join('\n');
// A stored failure confirmed this way carries CONFIRMED; `confirmed: true` was written when any second failure confirmed the first,
// so it is run again (Codex review, 2026-10-21), not reused.
export const CONFIRMED = 'same-failure';
export function confirmLeaf(x, y) {
  if (!y || y.machine || y.error) return { store: false, unstable: false, blocked: `its confirming run could not run (${y?.machine || String(y?.error || 'no result').split('\n')[0].slice(0, 100)})` };
  if (y.run?.result === 'fail') return failureKeys(y.run) === failureKeys(x?.run) ? { store: true, unstable: false } : { store: false, unstable: true, why: 'failed differently' };
  return { store: false, unstable: true, why: y.run?.result === 'pass' ? 'passed' : `came back ${y.run?.result}` };
}
// A fresh leaf run, before anything is stored: a pass is stored (the same identity gives the same result); a failure gets its
// confirming run; a run that came back blocked could not render its language (only required languages run in the gate: ZH only on a
// frozen feature), so it is no evidence: it blocks the gate and is never stored. A declared decision-blocker is a row, never a run.
export function firstRun(run) {
  if (run?.result === 'pass') return { store: true };
  if (run?.result === 'fail') return { confirm: true };
  return { blocked: `could not run (${(run?.notes || [])[0] || `came back ${run?.result}`})` };
}
// A stored leaf result is reused only when it is a pass, or a failure that was confirmed (a store written before L26 holds
// unconfirmed failures, and one written before 2026-10-21 may hold a blocked run or a failure confirmed by a different one: they are
// run again).
export const reusableLeaf = (record) => !!record?.run && (record.run.result === 'pass' || (record.run.result === 'fail' && record.confirmed === CONFIRMED));

// Design-system components only (owner, 2026-10-11): visual styling added in a page's own CSS, markup or scripts is an improvised
// component. Layout (margin, padding, gap, grid, flex, size, position) is the page's; looks belong to ux/design-system. A line
// marked `ds-exception` is a workaround and counts too: the part is built in the design system instead (P2, briefs/build.md §3).
const VISUAL = /^(color|background(-color|-image)?|border(-(top|right|bottom|left))?(-(color|width|style))?|border(-[a-z]+)?-radius|box-shadow|outline(-[a-z]+)?|font(-(size|weight|family|style))?|text-decoration(-[a-z]+)?|text-transform|letter-spacing|opacity|fill|stroke(-width)?|filter|backdrop-filter)$/;
export const isPageFile = (f) => /^ux\//.test(f) && !/^ux\/(design-system|archive)\//.test(f) && /\.(css|html|js|mjs)$/.test(f);
export function pageStyling(addedByFile) {
  const out = [];
  for (const [file, lines] of Object.entries(addedByFile)) {
    if (!isPageFile(file)) continue;
    for (const line of lines) {
      const chunks = /\.css$/.test(file) ? [line]
        : [...line.matchAll(/style\s*=\s*["'`]([^"'`]*)/g)].map((m) => m[1])
          .concat([...line.matchAll(/\.style\.([a-zA-Z]+)\s*=/g)].map((m) => ' ' + m[1].replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) + ':x'));
      for (const c of chunks) for (const m of c.matchAll(/(?:^|[{;\s])([a-z-]+)\s*:\s*[^;{}]+/g)) if (VISUAL.test(m[1])) { out.push({ file, prop: m[1], line: line.trim().slice(0, 120) }); break; }
    }
  }
  return out;
}
// Motion has a held frame (rules ledger L25, owner 2026-10-17). The atlas freezes motion (atlas-still), so a keyframe animation is
// never shot unless a screen holds it: a still render that shows the cue at its hold. Every @keyframes a change adds, or whose body
// it alters, in a stylesheet under ux/ must be named in some candidate screen's `holds`; one that is not is motion no gate has seen.
export function keyframesOf(css) {
  const out = new Map();
  const re = /@keyframes\s+([\w-]+)\s*\{/g;
  for (let m; (m = re.exec(css));) {
    let depth = 1, i = re.lastIndex;
    for (; i < css.length && depth; i++) depth += css[i] === '{' ? 1 : css[i] === '}' ? -1 : 0;
    out.set(m[1], css.slice(re.lastIndex, i - 1).replace(/\s+/g, ''));
    re.lastIndex = i;
  }
  return out;
}
export const isMotionFile = (f) => /^ux\//.test(f) && !/^ux\/archive\//.test(f) && /\.css$/.test(f);
// base, cand: { file: css text } for the changed stylesheets (a file missing on one side is ''); held: the names screens hold.
export function unheldMotion({ base = {}, cand = {}, held = [] }) {
  const has = new Set(held), before = new Map(), out = [];
  for (const [f, css] of Object.entries(base)) if (isMotionFile(f)) for (const [k, v] of keyframesOf(css || '')) before.set(k, v);
  for (const [f, css] of Object.entries(cand)) {
    if (!isMotionFile(f)) continue;
    for (const [k, v] of keyframesOf(css || '')) if (before.get(k) !== v && !has.has(k)) out.push({ file: f, name: k, kind: before.has(k) ? 'changed' : 'new' });
  }
  return out;
}
// The keyframes the atlas's screens hold (feature.json screens: "holds": ["name", …]).
export function heldOf(atlas) {
  const out = [];
  for (const p of atlas?.platforms || []) for (const s of p.sections || []) for (const f of s.features || []) for (const c of f.screens || []) out.push(...(c.holds || []));
  return out;
}

// The added lines of a unified diff, by file.
export function addedLines(diff) {
  const out = {}; let file = null;
  for (const l of diff.split(/\r?\n/)) {
    if (l.startsWith('+++ ')) { file = l.slice(4).replace(/^b\//, ''); continue; }
    if (file && l.startsWith('+') && !l.startsWith('+++')) (out[file] ||= []).push(l.slice(1));
  }
  return out;
}

// Judge calibration (owner, 2026-10-11): every judge rates the owner-ruled pairs in docs/design-workflow/calibration/ first.
// A judge that misses one, or rates a "not-better" pair better, is not used: its verdict can't pass the gate.
export function calibrationProblems(parts, answers) {
  const out = [];
  for (const [i, p] of parts.entries()) {
    const got = Object.fromEntries((p.calibration || []).map((c) => [c.pair, c.verdict]));
    for (const [id, a] of Object.entries(answers || {})) {
      if (!got[id]) out.push(`judge ${i + 1}: calibration pair ${id} not rated`);
      else if (a.owner === 'not-better' && got[id] === 'better') out.push(`judge ${i + 1}: rated calibration pair ${id} better; the owner ruled it not better ("${a.said}"), so this judge is not used`);
    }
  }
  return out;
}

// Machine errors, the navigation-timeout retry and the AIMD window live in scripts/machine.mjs (the runner and the scheduler use them
// without the gate's rules); re-exported here for the callers that import them from the rules.
export { timedOutOnly, aimdStep, classifyMachineError, machineErrorOf } from './machine.mjs';

// A failed gh / GitHub API call that is the network, not an answer: EOF, TLS, a timeout, a reset or refused connection, a name that
// doesn't resolve, a 5xx. It is retried; anything else is GitHub's answer and never is.
export const ghNetworkError = (stderr) => /\bEOF\b|\bTLS\b|handshake|timed? ?out|timeout|connection (was )?(reset|refused|closed)|dial tcp|proxyconnect|actively refused|forcibly closed|network is unreachable|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|could not resolve|no such host|HTTP 5\d\d|\b50[0234]\b|Bad Gateway|Service Unavailable/i.test(String(stderr || ''));

// Main's scenario debt, run by run (review of the gate, 2026-10-16). A candidate failure is main's debt only when base fails the
// same leaf in the same language at the same width with the same failure: the same assertion contract and failure category.
// A leaf the candidate fails differently from base, at another width or language, that base passes, doesn't have, or didn't
// report, is the change's: "already failing on main" never hides a new regression in the same leaf. Inputs are the two runners'
// reports (run-scenarios --report); base may hold only the leaves it was asked about.
export function scenarioDebt(candReport, baseReport) {
  // the same failure (review of #194): the same assertion contract (what was defined to hold) and the same failure category (how it
  // broke). A failure without both, on either side, is never debt: a base "preset missing" and a candidate "timeout" in one leaf are
  // two failures, not one.
  const known = (f) => !!f.contract && !!f.category && f.category !== 'unknown';
  const key = (id, r, f) => [id, r.lang, r.width, f.contract, f.category].join('|');
  const onBase = new Set();
  for (const lf of (baseReport && baseReport.leaves) || []) for (const r of lf.runs || []) if (r.result === 'fail') for (const f of r.failures || []) if (known(f)) onBase.add(key(lf.id, r, f));
  const added = [], debt = [];
  for (const lf of (candReport && candReport.leaves) || []) {
    if (lf.result !== 'fail') continue;
    const fresh = [];
    for (const r of lf.runs || []) if (r.result === 'fail') for (const f of r.failures || []) if (!known(f) || !onBase.has(key(lf.id, r, f))) fresh.push(r.lang + '-' + r.width + ': ' + f.what + (f.category ? ` (${f.category})` : ''));
    if (fresh.length) added.push({ id: lf.id, why: fresh }); else debt.push(lf.id);
  }
  return { added, debt };
}

// A change that moves no screen merges on the mechanical gate alone (docs/design-workflow/README.md, "Who decides what"): there is
// no pair for a judge, so the gate itself posts the sentri/gate status. Fail closed: the run must be a full
// one (not --quick) whose screens were classified, with nothing changed, new or gone and no pair listed.
// The PR's Results block (gate-simplify.md S8), from one gate run's mechanical.json: every number in it was measured on the gated
// commit, so a PR body that pastes it never carries a stale claim (#163, #192). Markdown; the driver pastes it whole.
// English first (owner, 2026-10-21): Chinese is checked only on a frozen feature, one whose every current screen is approved (the
// atlas's own status, build-atlas.mjs statusOf). Until a feature freezes, its ZH runs and ZH leaves don't gate: copy and layout are
// still moving, and the Chinese pass belongs to the freeze (freeze-checklist.md). A feature frozen on either side keeps its Chinese.
export function frozenFeatures(atlas) {
  const out = new Set();
  for (const p of atlas?.platforms || []) for (const s of p.sections || []) for (const f of s.features || []) if (f?.status === 'frozen') out.add(f.id);
  return out;
}
export const checksChinese = (feature, frozen) => !!feature && frozen.has(feature);

export function resultsBlock(mech) {
  const short = (s) => String(s || '?').slice(0, 7);
  const n = (a) => (Array.isArray(a) ? a.length : 0);
  const r = mech.reach || {}, sc = mech.screens || {};
  const word = { pass: 'MECHANICAL PASS', fail: 'MECHANICAL FAIL', blocked: 'MECHANICAL BLOCKED' }[mech.outcome] || 'MECHANICAL ?';
  const out = [`### Results`, '', `The gate's, on \`${short(mech.candidate)}\` against main \`${short(mech.base)}\` (\`node scripts/gate.mjs\`, ${mech.timings?.total ?? '?'} s).`, ''];
  out.push(`- **${word}**${mech.gatePass ? ' · GATE PASS' : ''}, class **${mech.class?.effective || '?'}**${mech.stoppedEarly ? ` · stopped before any browser work: ${mech.stoppedEarly}` : ''}`);
  if (r.of) out.push(`- Reach: ${r.screens} of ${r.of} screens${r.changed !== undefined ? ` (${r.changed} changed identity, ${r.added} added, ${r.removed} removed)` : ''}${r.leaves !== undefined ? `, ${r.leaves} leaves` : ''}`);
  // the scoped reach of a shared change (owner, 2026-10-20), in one line, and the propagation pairs
  const os = mech.outOfScope;
  if (os) out.push(`- Scope: checked in full on ${(mech.ownFeatures || []).join(', ') || 'no feature of its own'} and the component pages; propagation only on ${(mech.inProgress || []).join(', ') || 'none'} (in progress)${os.screens ? `; ${os.screens} screens in ${os.features.length} features not checked: not in progress` : ''}${os.componentPages ? `; ${os.componentPages} component page(s) of parts the change doesn't call` : ''}`);
  const prop = (mech.pairs || []).filter((p) => p.propagation).length, notUsing = (mech.propagation || []).filter((p) => p.notUsingShared).map((p) => p.screen);
  if (prop || notUsing.length) out.push(`- Propagation: ${prop} pair(s) checked by the machine${notUsing.length ? `; calls none of the changed exports (a local copy?): ${notUsing.slice(0, 4).join(', ')}${notUsing.length > 4 ? ' …' : ''}` : ''}`);
  if (mech.zh) out.push(`- Chinese: checked only on frozen features (English first, owner 2026-10-21): ${mech.zh.frozen.length ? mech.zh.frozen.join(', ') : 'none frozen, so no ZH runs or ZH leaves'}`);
  if (mech.screens) out.push(`- Screens: ${n(sc.diff)} changed, ${n(sc.new)} new, ${n(sc.gone)} gone, ${n(sc.broken)} broken; ${n(mech.pairs)} pair(s) to judge${n(mech.walkNeed) ? `; ${mech.walkNeed.length} screen(s) to walk (${mech.walkNeed.slice(0, 4).join(', ')}${mech.walkNeed.length > 4 ? ' …' : ''})` : ''}`);
  for (const c of mech.checks || []) out.push(`- ${c.result === 'pass' ? '✓' : c.result === 'fail' ? '✗' : '–'} ${c.check}${c.detail ? `: ${String(c.detail).split('\n')[0].slice(0, 160)}` : ''}`);
  for (const b of mech.blocked || []) out.push(`- ⛔ ${String(b).slice(0, 200)}`);
  for (const g of mech.gaps || []) out.push(`- gap: ${String(g).slice(0, 200)}`);
  return out.join('\n') + '\n';
}

// Owner ruling (2026-10-20): the owner's "PR it" is the design approval, so the machine's pass is the merge gate. Moved screens,
// walks and the judge no longer hold a merge; the judge is advice the builder may ask for before the owner looks (briefs/gate.md).
export function machinePass(mech) {
  if (!mech || mech.pass !== true || (mech.outcome && mech.outcome !== 'pass') || mech.quick || !mech.candidate || !mech.base || !mech.screens) return false;
  return ['diff', 'new', 'gone'].every((k) => Array.isArray(mech.screens[k]));
}

// Gate v2: a moved main (or a PR head that merged it forward) never voids work by itself (gate-v2.md §3). The gate runs again on
// the new head and main, reusing every result whose identity is unchanged; then every judgement is carried to the pair of the new
// manifest that shows the same two images (the same screen, run and kind, and each side's shot byte for byte), and a removed
// screen's reason with it. Only pairs whose images changed need a new judgement. A pair is matched by its images when both runs
// recorded them (`image`, G17): a change to an input nothing renders from (strings another page uses, a shared stylesheet rule
// this screen doesn't match) gives every shot a new identity and the same picture, and judging the same picture again proves
// nothing (#192, 2026-10-17: 0 of 112 judgements carried twice, with 108 and then 112 pairs pixel-identical). Older runs, without
// `image`, match by shot identity as before.
//   old: { mech, parts: [verdict files] } of the judged run · now: the new run's mechanical.json
// → { carried: a verdict part for the new run (null when there is no verdict to carry), need: [pair names], goneNeed: [screen ids],
//     walkNeed: [screens to walk again] }
export function carryJudgements(old, now) {
  const name = (p) => `${p.screen} ${p.lang}-${p.width}`;
  // a pair's keys: by its two images when the run recorded them, and by its two shot identities; a judgement carries on either
  const keysOf = (p) => [
    p.image && (p.image.base || p.image.cand) ? `${name(p)} ${p.kind || 'changed'} image ${p.image.base || '-'} ${p.image.cand || '-'}` : null,
    p.identity ? `${name(p)} ${p.kind || 'changed'} ${p.identity.base || '-'} ${p.identity.cand || '-'}` : null,
  ].filter(Boolean);
  // Only the judged run's own verdicts carry (review of #194): a part stamped for another candidate or base, or two parts that judge
  // one pair differently, carry nothing; the problems read as checkVerdict reads them on the original verdict.
  const problems = [];
  for (const part of old.parts || []) {
    if (part.candidate !== old.mech?.candidate) problems.push(`verdict is for ${part.candidate}, the candidate is ${old.mech?.candidate}`);
    if (part.base !== old.mech?.base) problems.push(`verdict compares against ${part.base}, the base is ${old.mech?.base}`);
  }
  const all = new Map();
  for (const part of old.parts || []) for (const j of part.pairs || []) all.set(name(j), [...(all.get(name(j)) || []), j]);
  for (const [k, js] of all) { const v = new Set(js.map((j) => j.verdict)); if (v.size > 1) problems.push(`pair ${k} is judged ${[...v].join(' and ')}`); }
  if (problems.length) return { carried: null, need: (now.pairs || []).map(name), goneNeed: (now.screens?.gone || []).map((g) => g.id), problems: [...new Set(problems)] };
  const said = new Map([...all].map(([k, js]) => [k, js[0]]));
  const judged = new Map();
  for (const p of old.mech?.pairs || []) { const j = said.get(name(p)); if (j) for (const k of keysOf(p)) judged.set(k, j); }
  const pairs = [], need = [], sameImageNewInputs = new Set();
  const idKey = (p) => keysOf(p).find((x) => !x.includes(' image '));
  for (const p of now.pairs || []) {
    const k = keysOf(p).find((x) => judged.has(x));
    if (!k) { need.push(name(p)); continue; }
    pairs.push({ ...judged.get(k), carried: true });
    // the same picture from changed inputs (a page script, a handler): what it looks like carries, how it behaves does not
    if (!judged.has(idKey(p))) sameImageNewInputs.add(p.screen);
  }
  // a removed screen's reason carries when it was removed before too and every one of its pairs carried
  const goneSaid = new Map((old.parts || []).flatMap((p) => p.gone || []).filter((g) => g.why).map((g) => [g.screen, g]));
  const wasGone = new Set((old.mech?.screens?.gone || []).map((g) => g.id));
  const gone = [], goneNeed = [];
  for (const g of now.screens?.gone || []) {
    const mine = (now.pairs || []).filter((p) => p.screen === g.id);
    if (wasGone.has(g.id) && goneSaid.has(g.id) && mine.every((p) => !need.includes(name(p)))) gone.push(goneSaid.get(g.id)); else goneNeed.push(g.id);
  }
  const first = (old.parts || [])[0] || {};
  const cat = (k) => (old.parts || []).flatMap((p) => p[k] || []);
  // A walk is about behaviour, so it carries only for screens whose inputs are unchanged; a screen carried by its picture alone
  // is walked again (walkNeed). Its pair judgements still carry. A screen the new run must walk because it runs changed code and
  // draws the same (G15) has no pair to compare: its walk carries when both runs recorded its candidate inputs (walkIdentity) and
  // they are equal, so a main merged forward that touches nothing it runs keeps its walk (PR 240, 2026-10-20: main moved four
  // times under a walked, judged, 0-pair change, and each move cost the whole walk and judge again).
  const before = old.mech?.walkIdentity || {}, after = now.walkIdentity || {};
  const g15 = new Set(now.walkNeed || []);
  const walkAgain = (s) => sameImageNewInputs.has(s) || (g15.has(s) && !(before[s] && before[s] === after[s]));
  const walk = cat('walk').filter((w) => !walkAgain(w.screen));
  const walked = new Set(walk.map((w) => w.screen));
  const walkNeed = [...new Set([...cat('walk').map((w) => w.screen).filter(walkAgain), ...[...g15].filter((s) => !walked.has(s))])];
  // The judged run's verdict carries whole, even with no pair to carry: its walks, calibration and claims are still this change's.
  const carried = (old.parts || []).length ? {
    // a part's pass is about its own pairs (no worse, no defect); "at least one better" is checkVerdict's, over every part (G13)
    pass: (old.parts || []).every((p) => p.pass === true), candidate: now.candidate, base: now.base, class: first.class, mode: first.mode,
    mechanical: first.mechanical || [], walk, pairs, defects: cat('defects'), gone, calibration: first.calibration || [],
    rejected: cat('rejected'), contradicted: cat('contradicted'), ...(mergeLibrary(old.parts) ? { library: mergeLibrary(old.parts) } : {}),
    notes: `carried by image or identity from the verdict on ${String(old.mech?.candidate).slice(0, 7)} against ${String(old.mech?.base).slice(0, 7)}${first.notes ? `; ${first.notes}` : ''}`,
    carriedFrom: { candidate: old.mech?.candidate, base: old.mech?.base },
  } : null;
  return { carried, need, goneNeed, walkNeed, problems: [] };
}
