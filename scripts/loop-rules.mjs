// The rules the gate and the polish loop apply, as pure functions (tested in tests/loop-rules.test.mjs).
// Scripts: scripts/gate.mjs (the mechanical gate), scripts/polish-loop.mjs (the round ledger), scripts/shoot-screens.mjs.
// Briefs: docs/design-workflow/briefs/gate.md and polish-loop.md.
import path from 'node:path';

export const CLASSES = ['copy', 'presentation', 'behaviour', 'shared'];
export const DIMENSIONS = ['hierarchy', 'alignment', 'legibility', 'touch', 'state', 'native'];
export const HARD = ['wrong-fact', 'lost-draft', 'dead-end', 'unreachable-control', 'broken-ruling', 'rejected-example'];

// Every atlas screen that renders, with its feature.
export function screensOf(atlas, { features = [], screens = [] } = {}) {
  const list = [];
  for (const p of atlas.platforms) for (const s of p.sections) for (const f of s.features) for (const c of f.screens) {
    if (!c.url) continue;
    if (features.length && !features.includes(f.id)) continue;
    if (screens.length && !screens.includes(c.id)) continue;
    list.push({ id: c.id, feature: f.id, url: c.url, status: c.status });
  }
  return list;
}

// The page an atlas screen opens, as a repo path.
export const pageOf = (url) => { const p = url.split(/[?#]/)[0].replace(/^\//, ''); return !p || p.endsWith('/') ? p + 'index.html' : p; };

// The repo files a page loads itself (scripts, stylesheets, images, frames), resolved from the page. Links it only points
// to, anything off this server and markup built inside a script string are left out.
export function pageAssets(html, page) {
  const dir = path.posix.dirname(page);
  const out = new Set();
  for (const m of html.matchAll(/<(?:script|link|img|iframe|source)\b[^>]*?\s(?:src|href)\s*=\s*(["'])(.*?)\1/gis)) {
    const ref = m[2].split(/[?#]/)[0].trim();
    if (!ref || /^([a-z][a-z\d+.-]*:|\/\/)/i.test(ref) || /['"+\s<>]/.test(ref)) continue;
    const f = ref.startsWith('/') ? path.posix.normalize(ref.slice(1)) : path.posix.normalize(path.posix.join(dir, ref));
    if (!f.startsWith('../')) out.add(f);
  }
  return [...out];
}

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
  /^scripts\/(gate|shoot-screens|loop-rules|polish-loop|check-states|check-legibility|run-scenarios|serve-ux|build-atlas)\.(mjs|cjs)$/,
  /^scripts\/check-(states|legibility)\.fixtures\//,
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
  const outside = diffs.filter((d) => !scope.includes(d.feature));
  if (outside.length) why.push(`changes ${outside.length} screen(s) outside the scope (${[...new Set(outside.map((d) => d.feature))].join(', ')})`);
  const cls = why.length ? 'shared' : declared;
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
  const acked = new Set((verdict.gone || []).filter((g) => g.why).map((g) => g.screen));
  for (const g of mech.screens?.gone || []) if (!acked.has(g.id)) problems.push(`screen ${g.id} was removed from the atlas: the verdict must say why under "gone"`);
  const name = (p) => `${p.screen} ${p.lang}-${p.width}`;
  const pairs = verdict.pairs || [], listed = mech.pairs || [];
  const said = new Map();
  for (const p of pairs) said.set(name(p), [...(said.get(name(p)) || []), p.verdict]);
  const paired = new Set(listed.map((p) => p.screen));
  for (const s of [...(mech.screens?.diff || []), ...(mech.screens?.new || []), ...(mech.screens?.gone || [])]) if (!paired.has(s.id)) problems.push(`screen ${s.id} moved but has no pair to judge: gate again`);
  for (const p of listed) {
    const kind = p.kind || 'changed', allowed = VERDICTS[kind] || [], v = said.get(name(p)) || [];
    if (!v.length) { problems.push(`no judgement for pair ${name(p)}`); continue; }
    if (new Set(v).size > 1) problems.push(`pair ${name(p)} is judged ${[...new Set(v)].join(' and ')}`);
    for (const x of new Set(v)) if (!allowed.includes(x)) problems.push(`pair ${name(p)} has ${kind === 'changed' ? 'both sides' : 'one side'}: its verdict is ${allowed.join(' or ') || '(unknown pair kind)'}, not "${x}"`);
    if (kind === 'changed' && p.pct === 0 && v.some((x) => x !== 'same')) problems.push(`pair ${name(p)} is pixel-identical: it can only be same`);
  }
  const moving = listed.filter((p) => (p.kind || 'changed') === 'changed' && p.pct !== 0);
  const better = moving.filter((p) => (said.get(name(p)) || []).includes('better'));
  const worse = pairs.filter((p) => p.verdict === 'worse' || p.verdict === 'fail');
  if (verdict.pass) {
    if (worse.length) problems.push(`passes with ${worse.length} worse or failed pair(s): ${worse.map(name).slice(0, 3).join(', ')}`);
    if ((verdict.defects || []).length) problems.push(`passes with ${verdict.defects.length} cold-look defect(s)`);
    if ((verdict.contradicted || []).length) problems.push('passes with contradicted claims');
    if ((verdict.walk || []).some((w) => w.ok !== true)) problems.push('passes with a walk entry that is not ok');
    if (mech.mode === 'refactor') { if (pairs.some((p) => p.verdict !== 'same')) problems.push('a refactor passes with a pair that is not the same'); }
    else if (moving.length && !better.length) problems.push('passes with no pair better (same is not enough)');
    else if (!(mech.screens?.diff || []).length && !(mech.screens?.new || []).length) {
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
// (briefs/build.md §1b) in features/<id>/budget.md with an Inventory, the worker's Questions and the attention Levels.
export const BUDGET_HEADINGS = ['## Inventory', '## Questions', '## Levels'];
// The critique of the original (briefs/build.md §1a, §1d) in features/<id>/critique.md: what to keep, what is broken, what draws
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
// marked `ds-exception` is a workaround and counts too: the part is built in the design system instead (briefs/build.md §1c).
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
