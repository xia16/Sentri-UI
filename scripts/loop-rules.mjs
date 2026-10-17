// The rules the gate and the polish loop apply, as pure functions (tested in tests/loop-rules.test.mjs).
// Scripts: scripts/gate.mjs (the mechanical gate), scripts/polish-loop.mjs (the round ledger), scripts/shoot-screens.mjs.
// Briefs: docs/design-workflow/briefs/gate.md and polish-loop.md.
import path from 'node:path';

export const CLASSES = ['copy', 'presentation', 'behaviour', 'shared'];
export const DIMENSIONS = ['hierarchy', 'alignment', 'legibility', 'touch', 'state', 'native'];
export const HARD = ['wrong-fact', 'lost-draft', 'dead-end', 'unreachable-control', 'broken-ruling', 'rejected-example'];

export { screensOf, DS_FEATURE, componentPage, idPath, componentPagesOf, componentsTouched, pageOf, pageAssets } from './atlas-screens.mjs';
import { DS_FEATURE, componentPage, componentsTouched, pageOf } from './atlas-screens.mjs';

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

// The shared-component queue: the older open, non-draft PRs that also touch the shared system AND whose current head has passed
// the gate (a sentri/gate success status, or a local pass record). A PR still being built or fixed does not hold the line; it is
// gated against main again when its turn comes. prs: gh pr list --json number,headRefName,headRefOid,createdAt,isDraft,files,statusCheckRollup
export function queueAhead(prs, mine, shared = {}, passedLocally = () => false) {
  const gated = (p) => passedLocally(p.headRefOid) || (p.statusCheckRollup || []).some((c) => c.context === 'sentri/gate' && c.state === 'SUCCESS');
  return prs.filter((p) => p.number !== mine.number && !p.isDraft && p.createdAt < mine.createdAt && gated(p) && touchesSystem((p.files || []).map((f) => f.path), shared).length);
}

// The outcome leaves of a features/<id>/scenarios.json tree.
export function outcomeLeaves(spec) {
  let n = 0;
  (function walk(nodes) { for (const x of nodes || []) { if (x.type === 'outcome') n++; walk(x.children); } })(spec?.tree);
  return n;
}

// Behaviour coverage a candidate drops, per side { runner: bool, specs: { feature: parsed scenarios.json | null } }:
// the runner, a feature's scenarios.json, or outcome leaves. Removing coverage is a workflow change, never a design PR's.
export function coverageLost(base, cand) {
  const lost = [];
  if (base.runner && !cand.runner) lost.push('scripts/run-scenarios.mjs is gone');
  for (const [f, spec] of Object.entries(base.specs || {})) {
    if (!spec) continue;
    const c = cand.specs?.[f];
    if (!c) { lost.push(`features/${f}/scenarios.json is gone or unreadable`); continue; }
    const nb = outcomeLeaves(spec), nc = outcomeLeaves(c);
    if (nc < nb) lost.push(`${f} has ${nc} outcome leaves, ${nb} on base`);
  }
  return lost;
}

// The gate's own tools and the workflow's text. A design PR that also changes these grades itself with tools it rewrote;
// the README rule: change the workflow in its own pull request, never inside a design PR.
const TOOLS = [
  /^scripts\/(gate|evaluate|evidence|scheduler|visit|settle|machine|png|github|static-reach|bundle-graph|scenario-runner|atlas-screens|shoot-screens|loop-rules|polish-loop|check-states|check-legibility|check-headers|run-scenarios|serve-ux|build-atlas)\.(mjs|cjs)$/,
  /^scripts\/vendor\//,
  /^scripts\/check-(states|legibility|headers)\.fixtures\//,
  /^docs\/design-workflow\//,
  /^\.claude\/skills\//,
];
export const touchesTools = (files) => files.filter((f) => TOOLS.some((re) => re.test(f)));

// The class the gate runs: never lower than declared; shared when the system changed or screens outside the scope changed.
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

// What a judge may say about a pair: a pair with both sides is better, same or worse; a pair with one side (a new screen,
// or a removed one) passes or fails.
const VERDICTS = { changed: ['better', 'same', 'worse'], new: ['pass', 'fail'], gone: ['pass', 'fail'] };

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
    const kind = p.kind || 'changed', allowed = VERDICTS[kind] || [], v = said.get(name(p)) || [];
    if (!v.length) { problems.push(`no judgement for pair ${name(p)}`); continue; }
    if (new Set(v).size > 1) problems.push(`pair ${name(p)} is judged ${[...new Set(v)].join(' and ')}`);
    for (const x of new Set(v)) if (!allowed.includes(x)) problems.push(`pair ${name(p)} has ${kind === 'changed' ? 'both sides' : 'one side'}: its verdict is ${allowed.join(' or ') || '(unknown pair kind)'}, not "${x}"`);
    if (kind === 'changed' && p.pct === 0 && v.some((x) => x !== 'same')) problems.push(`pair ${name(p)} is pixel-identical: it can only be same`);
  }
  const moving = listed.filter((p) => (p.kind || 'changed') === 'changed' && p.pct !== 0 && !(mech.flaky || []).includes(p.screen));
  const better = moving.filter((p) => (said.get(name(p)) || []).includes('better'));
  const worse = pairs.filter((p) => p.verdict === 'worse' || p.verdict === 'fail');
  if (verdict.pass) {
    if (worse.length) problems.push(`passes with ${worse.length} worse or failed pair(s): ${worse.map(name).slice(0, 3).join(', ')}`);
    if ((verdict.defects || []).length) problems.push(`passes with ${verdict.defects.length} cold-look defect(s)`);
    if ((verdict.contradicted || []).length) problems.push('passes with contradicted claims');
    if ((verdict.walk || []).some((w) => w.ok !== true)) problems.push('passes with a walk entry that is not ok');
    if (mech.mode === 'refactor') { if (pairs.some((p) => p.verdict !== 'same')) problems.push('a refactor passes with a pair that is not the same'); }
    else if (moving.length && !better.length) problems.push('passes with no pair better (same is not enough)');
    else if (!(mech.screens?.diff || []).filter((d) => !(mech.flaky || []).includes(d.id)).length && !(mech.screens?.new || []).length) {
      // Nothing visible changed: only a behaviour fix (which may leave every first frame alone) passes, and on a walk.
      const behaviour = ['behaviour', 'shared'].includes(mech.class?.declared);
      const walked = (verdict.walk || []).length > 0 && verdict.walk.every((w) => w.ok === true);
      if (!behaviour || !walked) problems.push(`no screen changed: only a change declared behaviour (or shared) passes that way, with a walk where every entry is ok (declared ${mech.class?.declared || 'nothing'}, ${(verdict.walk || []).length} walk entries)`);
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

// ---------- the lighter gate: reach by files, the lock ----------

// Files that decide pixels on every screen besides SYSTEM: the shooter and what it loads, the server, the atlas and its sections,
// the vendored fonts and the installed packages (Playwright's version is the browser's).
const RENDERS = [
  /^scripts\/(shoot-screens|serve-ux|font-route|playwright-path)\.(mjs|cjs)$/,
  /^(atlas|sections|vendor)\//,
  /^package(-lock)?\.json$/,
];
// Files that can't draw a pixel: the workflow's text and other prose outside ux/, CI, tests, agent settings and every other
// script (the gate and the checks). A page that loads one of them reaches its feature first (pages are read before this list).
const NO_PIXEL = [/^docs\//, /^\.github\//, /^tests\//, /^\.claude\//, /^scripts\//, /^(?!ux\/).*\.md$/i];

// What a change can reach, from its files alone (P2): { all, features, why }. files: the changed paths (both sides of a rename);
// screens: every atlas screen on base and candidate; assets: page -> the files it loads (pageAssets); shared: sharedFiles of the
// same. Unsure is all: a file nothing says is harmless reaches every screen.
export function reachOf({ files, screens = [], assets = {}, shared = {}, scope = [] }) {
  const users = new Map();
  for (const s of screens) { const p = pageOf(s.url); for (const f of [p, ...(assets[p] || [])]) { if (!users.has(f)) users.set(f, new Set()); users.get(f).add(s.feature); } }
  const features = new Set(scope), notes = new Map();
  let all = false;
  const note = (why, f) => { if (!notes.has(why)) notes.set(why, []); notes.get(why).push(f); };
  for (const f of files) {
    const own = f.match(/^features\/([^/]+)\//);
    if (own) { features.add(own[1]); note(`${own[1]}'s own files`, f); continue; }
    if (SYSTEM.some((re) => re.test(f)) || RENDERS.some((re) => re.test(f))) { all = true; note('draws on every screen', f); continue; }
    const u = users.get(f);
    if (Object.hasOwn(shared, f) || u?.size > 1) { all = true; note(`loaded by pages of ${(shared[f] || [...u]).length} features`, f); continue; }
    if (u) { for (const x of u) features.add(x); note(`a page of ${[...u][0]} or what it loads`, f); continue; }
    // A component's own pages and notes (its variant pages, variants.json, gate.json, README) are read by the atlas, never loaded
    // by a screen's page: they reach that component's pages (ds:<Name>/…, feature design-system), not every screen.
    const doc = f.match(/^ux\/design-system\/components\/([^/]+)\/(variants\/[^/]+\.html|variants\.json|gate\.json|README\.md)$/);
    if (doc) { features.add(DS_FEATURE); note(`${doc[1]}'s component pages`, f); continue; }
    if (NO_PIXEL.some((re) => re.test(f))) { note('draws no pixel', f); continue; }
    all = true;
    note(f.startsWith('ux/') ? 'no page loads it by name, and a page may fetch it' : 'not known to draw nothing', f);
  }
  const list = (fs) => fs.slice(0, 3).join(', ') + (fs.length > 3 ? ` and ${fs.length - 3} more` : '');
  const why = [...notes].sort(([a], [b]) => (a === 'draws no pixel') - (b === 'draws no pixel')).map(([w, fs]) => `${list(fs)}: ${w}`);
  if (scope.length) why.push(`scope ${scope.join(', ')}`);
  return { all, features: [...features].sort(), why };
}

// The one line the gate prints, given how many screens the reach covers.
export function reachLine(reach, n) {
  const why = reach.why.length ? ` (${reach.why.join('; ')})` : '';
  if (reach.all) return `reach: all screens${why}`;
  if (!reach.features.length) return `reach: no screen${why}`;
  return `reach: ${n} screen(s) in features ${reach.features.join(', ')}${why}`;
}

// Machine errors, the navigation-timeout retry and the AIMD window live in scripts/machine.mjs (the runner and the scheduler use them
// without the gate's rules); re-exported here for the callers that import them from the rules.
export { timedOutOnly, aimdStep, classifyMachineError, machineErrorOf } from './machine.mjs';

// A failed gh / GitHub API call that is the network, not an answer: EOF, TLS, a timeout, a reset or refused connection, a name that
// doesn't resolve, a 5xx. It is retried; anything else is GitHub's answer and never is.
export const ghNetworkError = (stderr) => /\bEOF\b|\bTLS\b|handshake|timed? ?out|timeout|connection (was )?(reset|refused|closed)|dial tcp|proxyconnect|actively refused|forcibly closed|network is unreachable|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|could not resolve|no such host|HTTP 5\d\d|\b50[0234]\b|Bad Gateway|Service Unavailable/i.test(String(stderr || ''));

// The gate's lock (one gate per machine): free, held by a live gate, or stale (its process is gone).
export function lockState(lock, alive) {
  if (!lock) return 'free';
  return Number.isInteger(lock.pid) && alive(lock.pid) ? 'held' : 'stale';
}

// Scenario leaves, base against candidate (owner, 2026-10-15): a leaf the candidate fails is the change's only when the same leaf
// passes on base. One already failing on main is main's debt, named as a gap, the way check-states and the header checks already
// count a problem main has. candFailed: the leaf ids the candidate's report marks fail. baseOut: the base runner's stdout for those
// leaves (`run-scenarios.mjs <feature> --only a,b`, one "<result>  <id>" line per leaf). A leaf base doesn't have, or doesn't print,
// is new, so its failure is the change's.
export function newScenarioFailures(candFailed, baseOut) {
  const onBase = new Map();
  for (const line of String(baseOut || '').split('\n')) { const m = /^(pass|fail|blocked|pending)\s+(\S+)/.exec(line); if (m) onBase.set(m[2], m[1]); }
  const debt = candFailed.filter((id) => onBase.get(id) === 'fail');
  return { added: candFailed.filter((id) => onBase.get(id) !== 'fail'), debt };
}

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
// no pair for a judge, so the gate itself posts the sentri/gate status and the pass record. Fail closed: the run must be a full
// one (not --quick) whose screens were classified, with nothing changed, new or gone and no pair listed.
export function passesWithoutJudge(mech) {
  if (!mech || mech.pass !== true || (mech.outcome && mech.outcome !== 'pass') || mech.quick || !mech.candidate || !mech.base || !mech.screens) return false;
  if ((mech.pairs || []).length) return false;
  return ['diff', 'new', 'gone'].every((k) => Array.isArray(mech.screens[k]) && mech.screens[k].length === 0);
}

// Gate v2: a moved main (or a PR head that merged it forward) never voids work by itself (gate-v2.md §3). The gate runs again on
// the new head and main, reusing every result whose identity is unchanged; then every judgement is carried to the pair of the new
// manifest with the same identity (the same screen, run and kind, the same base shot and the same candidate shot: the same two
// images), and a removed screen's reason with it. Only pairs whose images changed need a new judgement.
//   old: { mech, parts: [verdict files] } of the judged run · now: the new run's mechanical.json
// → { carried: a verdict part for the new run (or null when nothing carries), need: [pair names], goneNeed: [screen ids] }
export function carryJudgements(old, now) {
  const name = (p) => `${p.screen} ${p.lang}-${p.width}`;
  const idOf = (p) => (p.identity ? `${name(p)} ${p.kind || 'changed'} ${p.identity.base || '-'} ${p.identity.cand || '-'}` : null);
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
  for (const p of old.mech?.pairs || []) { const k = idOf(p), j = said.get(name(p)); if (k && j) judged.set(k, j); }
  const pairs = [], need = [];
  for (const p of now.pairs || []) { const j = idOf(p) && judged.get(idOf(p)); if (j) pairs.push({ ...j, carried: true }); else need.push(name(p)); }
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
  const carried = pairs.length || gone.length ? {
    pass: (old.parts || []).every((p) => p.pass === true), candidate: now.candidate, base: now.base, class: first.class, mode: first.mode,
    mechanical: first.mechanical || [], walk: cat('walk'), pairs, defects: cat('defects'), gone, calibration: first.calibration || [],
    rejected: cat('rejected'), contradicted: cat('contradicted'),
    notes: `carried by identity from the verdict on ${String(old.mech?.candidate).slice(0, 7)} against ${String(old.mech?.base).slice(0, 7)}${first.notes ? `; ${first.notes}` : ''}`,
    carriedFrom: { candidate: old.mech?.candidate, base: old.mech?.base },
  } : null;
  return { carried, need, goneNeed, problems: [] };
}
