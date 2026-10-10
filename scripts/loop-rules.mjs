// The rules the gate and the polish loop apply, as pure functions (tested in tests/loop-rules.test.mjs).
// Scripts: scripts/gate.mjs (the mechanical gate), scripts/polish-loop.mjs (the round ledger), scripts/shoot-screens.mjs.
// Briefs: docs/design-workflow/briefs/gate.md and polish-loop.md.

export const CLASSES = ['copy', 'presentation', 'behaviour', 'shared'];
export const DIMENSIONS = ['hierarchy', 'alignment', 'legibility', 'touch', 'state'];
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

// Files whose change reaches every feature that draws with them: the one component implementation, the tokens, the bare-screen
// harness and the shared prototype stylesheets. A change here is a shared-component change whatever the builder declared.
const SYSTEM = [
  /^ux\/design-system\/components\/bundle\.(js|css)$/,
  /^ux\/design-system\/components\/index\.d\.ts$/,
  /^ux\/design-system\/tokens\.(css|json)$/,
  /^ux\/system\/atlas-bare\.js$/,
  /^ux\/system\/[^/]+\.css$/,
];
export const touchesSystem = (files) => files.filter((f) => SYSTEM.some((re) => re.test(f)));

// The class the gate runs: never lower than declared; shared when the system changed or screens outside the scope changed.
export function effectiveClass({ declared, files, diffs, scope }) {
  const why = [];
  const sys = touchesSystem(files);
  if (sys.length) why.push(`changes the shared system: ${sys.slice(0, 4).join(', ')}${sys.length > 4 ? ' …' : ''}`);
  const outside = diffs.filter((d) => !scope.includes(d.feature));
  if (outside.length) why.push(`changes ${outside.length} screen(s) outside the scope (${[...new Set(outside.map((d) => d.feature))].join(', ')})`);
  const cls = why.length ? 'shared' : declared;
  return { cls: CLASSES.indexOf(cls) < CLASSES.indexOf(declared) ? declared : cls, why, outside };
}

// A screen diff, from the two capture runs: same / diff / new / gone / broken.
export function classifyScreens(baseRuns, candRuns, pctOf) {
  const key = (r) => r.screen;
  const b = new Map(baseRuns.map((r) => [key(r), r])), c = new Map(candRuns.map((r) => [key(r), r]));
  const out = { same: [], diff: [], new: [], gone: [], broken: [], bothBroken: [] };
  for (const [id, cr] of c) {
    const br = b.get(id);
    if (!br) { (cr.ok ? out.new : out.broken).push({ id, feature: cr.feature }); continue; }
    if (!cr.ok && !br.ok) { out.bothBroken.push({ id, feature: cr.feature, error: cr.error }); continue; }
    if (!cr.ok) { out.broken.push({ id, feature: cr.feature, error: cr.error }); continue; }
    if (!br.ok) { out.new.push({ id, feature: cr.feature, note: 'did not render on base' }); continue; }
    const pct = pctOf(id);
    (pct > 0.01 ? out.diff : out.same).push({ id, feature: cr.feature, pct: Math.round(pct * 100) / 100 });
  }
  for (const [id, br] of b) if (!c.has(id)) out.gone.push({ id, feature: br.feature });
  return out;
}

// The judge's verdict must be about this candidate, cover every changed screen, and agree with the mechanical result.
export function checkVerdict(verdict, mech) {
  const problems = [];
  if (!verdict || typeof verdict !== 'object') return { ok: false, problems: ['no verdict'] };
  if (verdict.candidate !== mech.candidate) problems.push(`verdict is for ${verdict.candidate}, the candidate is ${mech.candidate}`);
  if (verdict.base !== mech.base) problems.push(`verdict compares against ${verdict.base}, the base is ${mech.base}`);
  if (verdict.pass && !mech.pass) problems.push('verdict passes a candidate whose mechanical gate failed');
  const pairs = verdict.pairs || [];
  const judged = new Set(pairs.filter((p) => p.lang === 'en' && p.width === 390).map((p) => p.screen));
  for (const d of [...(mech.screens?.diff || []), ...(mech.screens?.new || [])]) if (!judged.has(d.id)) problems.push(`no en-390 judgement for changed screen ${d.id}`);
  const worse = pairs.filter((p) => p.verdict === 'worse');
  const better = pairs.filter((p) => p.verdict === 'better');
  if (verdict.pass) {
    if (worse.length) problems.push(`passes with ${worse.length} worse pair(s): ${worse.map((p) => `${p.screen} ${p.lang}-${p.width}`).slice(0, 3).join(', ')}`);
    if ((verdict.defects || []).length) problems.push(`passes with ${verdict.defects.length} cold-look defect(s)`);
    if ((verdict.contradicted || []).length) problems.push('passes with contradicted claims');
    if ((verdict.walk || []).some((w) => w.ok === false)) problems.push('passes with a failed walk');
    if (mech.mode === 'refactor' && pairs.some((p) => p.verdict !== 'same')) problems.push('a refactor passes with a pair that is not the same');
    if (mech.mode !== 'refactor' && (mech.screens?.diff || []).length && !better.length) problems.push('passes with no pair better (same is not enough)');
  }
  return { ok: problems.length === 0, problems };
}

// ---------- the polish loop ----------

// grades.json: { round, commit, states: [{ screen, state, lang, width, scores: { hierarchy, ... 0|1|2 }, lost: [{ dimension, what, shot }], hard: [{ type, what, shot }] }] }
export function checkGrades(grades, screenIds) {
  const problems = [];
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

const sameResult = (a, b) => a && b && JSON.stringify(a.scores) === JSON.stringify(b.scores) && JSON.stringify(a.leaves) === JSON.stringify(b.leaves);

// done · stopped (cap or no progress) · continue
export function loopStatus(ledger) {
  const r = ledger.rounds || [];
  const cap = ledger.cap || 5;
  const last = r[r.length - 1], prev = r[r.length - 2];
  if (r.length >= 2 && isClean(last) && isClean(prev)) {
    const open = (last.leaves?.fail || 0) + (last.leaves?.uncovered || 0);
    if (!open) return { status: 'done', why: last.leaves?.none ? 'two clean rounds in a row; no executable leaves yet, so behaviour is unverified (a declared gap)' : 'two clean rounds in a row; every leaf covered or blocked' };
    return { status: 'continue', why: `two clean rounds but ${open} leaf/leaves failing or uncovered` };
  }
  if (r.length >= cap) return { status: 'stopped', why: `round cap (${cap}) reached` };
  if (r.length >= 2 && !last.fix?.merged && sameResult(last, prev)) return { status: 'stopped', why: 'no progress: grades and leaf results unchanged and nothing merged' };
  return { status: 'continue', why: r.length ? `round ${r.length} of at most ${cap}` : 'not started' };
}
