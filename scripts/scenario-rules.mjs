// The rules of the scenario framework as pure functions (tested in tests/scenario-rules.test.mjs): the operations inventory
// and the cut, the matrix ledger's rows and marks, how a walk round closes, and when the walks stop.
// Scripts: scripts/scenario-ledger.mjs (the ledger), scripts/feature-state.mjs. Briefs: docs/design-workflow/README.md
// ("The scenario framework"), briefs/walk.md, operations-template.md. Same pattern as scripts/loop-rules.mjs.

export const MAX_ROUNDS = 4;
export const RESULTS = ['passed', 'failed', 'blocked'];
// handled: found on a second look (the screens cope). defect: the design lets the worker down. missing: a branch the tree
// lacked. question: a product rule nobody has ruled (the row is blocked, never guessed).
export const CLASSES = ['handled', 'defect', 'missing', 'question'];
// walk.md: hard defects count from one walker.
export const HARD = ['wrong-fact', 'lost-work', 'dead-end', 'unreachable-control', 'double-write', 'broken-ruling'];

// ---------- the operations inventory and the cut ----------

const clean = (s) => String(s ?? '').replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();
const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const isRule = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

// Every markdown table as { header: [lowercased names], rows: [[cells]] }. Rows whose cells are all empty are dropped.
export function tables(md) {
  const out = [];
  const lines = String(md ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*\|/.test(lines[i]) || !lines[i + 1] || !isRule(lines[i + 1])) continue;
    const header = cells(lines[i]).map((h) => clean(h).toLowerCase());
    const rows = [];
    for (i += 2; i < lines.length && /^\s*\|/.test(lines[i]); i++) {
      const r = cells(lines[i]);
      if (r.some((c) => c)) rows.push(r);
    }
    out.push({ header, rows });
    i--;
  }
  return out;
}

const COLUMNS = { operation: /^operation/, often: /^how often/, stake: /^(what'?s )?at stake/, recorded: /^recorded/, where: /^where/, ui: /^least ui/, reason: /^reason/ };

// features/<id>/operations.md -> { rows: [{ operation, often, stake, recorded, where, kind, handoff, ui, reason }], problems }.
// `kind` is here · handoff · not-supported (or null when the cell says none of them).
export function parseOperations(md) {
  const problems = [];
  const t = tables(md).find((x) => x.header.some((h) => COLUMNS.operation.test(h)) && x.header.some((h) => COLUMNS.where.test(h)));
  if (!t) return { rows: [], problems: ['no operations table (a header with "Operation" and "Where")'] };
  const at = Object.fromEntries(Object.entries(COLUMNS).map(([k, re]) => [k, t.header.findIndex((h) => re.test(h))]));
  for (const [k, i] of Object.entries(at)) if (i < 0) problems.push(`the table has no "${k}" column`);
  const rows = t.rows.map((r) => {
    const get = (k) => (at[k] >= 0 ? clean(r[at[k]]) : '');
    const where = get('where').toLowerCase();
    const handoff = where.match(/^handoff\s*:\s*([\w-]+)$/);
    const kind = where === 'here' ? 'here' : handoff ? 'handoff' : where === 'not supported' ? 'not-supported' : null;
    return { operation: get('operation'), often: get('often'), stake: get('stake'), recorded: get('recorded'), where: get('where'), kind, handoff: handoff ? handoff[1] : null, ui: get('ui'), reason: get('reason') };
  });
  return { rows, problems };
}

// What an inventory must hold to be a cut: sourced or inferred estimates, a place for each operation, a reason for each
// not-supported one, the least UI for each supported one.
export function checkOperations(rows) {
  const problems = [];
  const seen = new Set();
  for (const r of rows) {
    const who = `"${r.operation || '(no name)'}"`;
    if (!r.operation) problems.push('a row has no operation');
    if (seen.has(r.operation.toLowerCase())) problems.push(`${who} is listed twice`);
    seen.add(r.operation.toLowerCase());
    if (!/^[SI]\b\W*\S/.test(r.often)) problems.push(`${who}: "how often" starts with S (sourced) or I (inferred) and says why`);
    if (!r.stake) problems.push(`${who}: no "at stake"`);
    if (!r.recorded) problems.push(`${who}: no "recorded?"`);
    if (!r.kind) problems.push(`${who}: "where" is here, handoff:<feature> or not supported (got "${r.where}")`);
    if (r.kind === 'here' && !r.ui) problems.push(`${who}: supported here, so it names its least UI`);
    if (r.kind === 'not-supported' && !r.reason) problems.push(`${who}: not supported needs its reason`);
  }
  return problems;
}

// The PRD's "## Not supported" section (up to the next heading of the same or a higher level), or null.
export function notSupportedSection(prd) {
  const lines = String(prd ?? '').split(/\r?\n/);
  const at = lines.findIndex((l) => /^#+\s*not supported\b/i.test(l));
  if (at < 0) return null;
  const level = lines[at].match(/^#+/)[0].length;
  const end = lines.findIndex((l, i) => i > at && /^#+\s/.test(l) && l.match(/^#+/)[0].length <= level);
  return lines.slice(at + 1, end < 0 ? undefined : end).join('\n');
}

// The PRD's not-supported list must name every not-supported operation of the inventory (by its name, as written).
export function notSupportedGaps(rows, prd) {
  const section = notSupportedSection(prd);
  if (section === null) return { section: false, missing: rows.filter((r) => r.kind === 'not-supported').map((r) => r.operation) };
  const text = clean(section).toLowerCase();
  return { section: true, missing: rows.filter((r) => r.kind === 'not-supported' && !text.includes(clean(r.operation).toLowerCase())).map((r) => r.operation) };
}

// ---------- the ledger's rows ----------

// One row per branch. Executable leaves first (outcomes, and decision-blockers, which carry their question); then the tree's
// own rows that no leaf carries (tree-only rows are still branches). `treeRows` come from rowsFromTree.
export function rowsFromLeaves(spec) {
  const rows = [];
  const walk = (n) => {
    if (n.type === 'outcome') rows.push({ id: n.id, tree: n.tree || null, label: n.label || n.id, kind: 'leaf' });
    else if (n.type === 'decision-blocker') rows.push({ id: n.id, tree: n.tree || null, label: n.label || n.question || n.id, kind: 'blocker', question: n.question || null });
    for (const c of n.children || []) walk(c);
  };
  for (const n of spec?.tree || []) walk(n);
  return rows;
}

// Rows of features/<id>/scenario-tree.md: a table whose first column is the row id (E-1, K-7) and that has an Event or Result.
// Rows marked *retired* are skipped: their ids stay out of use.
export function rowsFromTree(md) {
  const rows = [];
  const question = (s) => (clean(s).match(/\bQ\d+\b/) || [null])[0];
  for (const t of tables(md)) {
    const ev = t.header.findIndex((h) => /^event/.test(h)), st = t.header.findIndex((h) => /^state/.test(h)), res = t.header.findIndex((h) => /^(result|outcome)/.test(h));
    if (ev < 0 && res < 0) continue;
    for (const r of t.rows) {
      const id = clean(r[0]);
      if (!/^[A-Z]{1,3}-\d+[a-z]?$/.test(id)) continue;
      if (/retired/i.test(r.join(' '))) continue;
      const result = res >= 0 ? clean(r[res]) : '';
      const label = [st >= 0 ? clean(r[st]) : '', ev >= 0 ? clean(r[ev]) : ''].filter(Boolean).join(': ') || result;
      rows.push({ id, tree: id, label, kind: result.startsWith('?') ? 'blocker' : 'tree', question: result.startsWith('?') ? question(result) : null });
    }
  }
  return rows;
}

// Leaves when the feature has them; the tree rows no leaf names are added so every branch is a row (a tree row a leaf names
// is that leaf's). Without leaves, the tree rows alone. Duplicate ids are a problem the init refuses.
export function buildRows(spec, treeMd) {
  const tree = treeMd ? rowsFromTree(treeMd) : [];
  const leaves = spec ? rowsFromLeaves(spec) : [];
  const named = new Set(leaves.map((l) => l.tree).filter(Boolean));
  const rows = [...leaves, ...tree.filter((r) => !named.has(r.tree))];
  const ids = rows.map((r) => r.id);
  const dups = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  return { rows: rows.map((r) => ({ ...r, status: 'pending' })), source: leaves.length ? 'scenarios.json' : 'scenario-tree.md', problems: dups.map((d) => `row id ${d} appears twice`) };
}

// ---------- marks and statuses ----------

const WORST = { failed: 3, blocked: 2, passed: 1 };

// The marks of a round for a row, and the row's result in that round (worst of: failed, blocked, passed).
export const marksOf = (round, row) => (round?.marks || []).filter((m) => m.row === row);
// A failed mark the driver closed as noted (one walker's unconfirmed stumble: noted, not fixed) stands as passed.
export function roundResult(round, row) {
  const ms = marksOf(round, row);
  const res = (m) => (m.result === 'failed' && m.noted ? 'passed' : m.result);
  return ms.length ? ms.reduce((w, m) => (WORST[res(m)] > WORST[w] ? res(m) : w), 'passed') : null;
}

// A row's standing across rounds: its latest round with a mark; pending when never marked.
export function rowStatus(ledger, row) {
  for (const r of [...(ledger.rounds || [])].reverse()) { const s = roundResult(r, row); if (s) return s; }
  return 'pending';
}
export function statusCounts(ledger) {
  const c = { pending: 0, passed: 0, failed: 0, blocked: 0 };
  for (const r of ledger.rows) c[rowStatus(ledger, r.id)]++;
  return c;
}

// Why a mark is refused: a round is open and the walker is on its commit, a row exists, a blocked row has its question and is
// never re-marked without naming the question that is now answered, a failure says what broke, a row never goes back to pending.
export function checkMark(ledger, m) {
  const problems = [];
  const round = (ledger.rounds || []).find((r) => !r.closed);
  if (!round) return ['no round is open: round first'];
  if (!RESULTS.includes(m.result)) problems.push(`result is ${RESULTS.join(', ')} (a row never goes back to pending)`);
  if (!m.by) problems.push('--by names the walker');
  if (!m.commit) problems.push('--commit is the commit the walker walked (git rev-parse HEAD)');
  else if (!round.commit.startsWith(m.commit) && !m.commit.startsWith(round.commit)) problems.push(`the walker walked ${m.commit.slice(0, 7)}, the round is on ${round.commit.slice(0, 7)}: its findings are not valid for this round`);
  if (m.cls && !CLASSES.includes(m.cls)) problems.push(`class is ${CLASSES.join(', ')}`);
  if (m.hard && !HARD.includes(m.hard)) problems.push(`hard is ${HARD.join(', ')}`);
  if (m.hard && m.result !== 'failed') problems.push('a hard defect is a failed row');
  if (m.result === 'failed') {
    if (!m.finding) problems.push('a failed row needs --finding "<one line>"');
    if (m.cls && !['defect', 'missing'].includes(m.cls)) problems.push('a failed row is a defect or a missing branch (a product question blocks the row)');
  }
  if (m.result === 'passed' && m.cls && !['handled', 'missing'].includes(m.cls)) problems.push('a passed row can only carry a handled or missing-branch finding');
  if (m.result === 'blocked' && m.cls && m.cls !== 'question') problems.push('a blocked row is a product question, not a ' + m.cls);
  if (m.cls && m.cls !== 'question' && !m.finding) problems.push(`class ${m.cls} needs --finding`);
  const known = new Map(ledger.rows.map((r) => [r.id, r]));
  for (const id of m.rows || []) {
    const row = known.get(id);
    if (!row) { problems.push(`no row ${id}`); continue; }
    if (marksOf(round, id).some((x) => x.by === m.by)) problems.push(`${m.by} already marked ${id} in round ${round.n}`);
    const was = [...ledger.rounds].filter((r) => r !== round).reverse().map((r) => roundResult(r, id)).find(Boolean);
    if (was === 'blocked' && m.result !== 'blocked' && !m.unblocks) problems.push(`${id} is blocked: a blocked row is never quietly re-queued; --unblocks <Qn> names the question that is now ruled`);
    if (was === 'blocked' && m.unblocks) {
      const q = [...ledger.rounds].reverse().flatMap((r) => marksOf(r, id)).find((x) => x.result === 'blocked')?.question || row.question;
      if (q && m.unblocks !== q) problems.push(`${id} is blocked on ${q}, not ${m.unblocks}`);
    }
    if (m.result === 'blocked' && !m.question && !row.question) problems.push(`${id}: a blocked row needs --question Qn`);
  }
  if (!(m.rows || []).length) problems.push('name at least one row');
  return problems;
}

// ---------- closing a round ----------

const uniq = (a) => [...new Set(a)];

// The round's findings, classified. Each mark with a finding (or blocked on a question) is one; the walker's class stands unless
// the driver reclassified it. Defects count when two or more walkers hit the same row, or from one when hard; a missing branch
// counts from one. A product question is new when no earlier round and no row of the tree carried it.
export function findingsOf(ledger, round) {
  const earlier = (ledger.rounds || []).filter((r) => r.n < round.n && r.closed);
  const knownQuestions = new Set([...(ledger.knownQuestions || []), ...earlier.flatMap((r) => (r.marks || []).filter((m) => m.question).map((m) => m.question))]);
  const priorCounted = new Set(earlier.flatMap((r) => r.summary?.counted || []));
  const found = (round.marks || []).filter((m) => m.finding || m.question || m.result === 'blocked').map((m) => ({
    mark: m.id, row: m.row, by: m.by, text: m.finding || '', hard: m.hard || null, question: m.question || null,
    cls: m.result === 'blocked' ? 'question' : m.cls || (m.result === 'failed' ? 'defect' : 'handled'),
  }));
  const byKey = new Map();
  for (const f of found) { const k = f.cls === 'question' ? `${f.cls}|${f.question || f.row}` : `${f.cls}|${f.row}`; byKey.set(k, [...(byKey.get(k) || []), f]); }
  const out = [];
  for (const [key, fs] of byKey) {
    const walkers = uniq(fs.map((f) => f.by));
    const f = fs[0];
    const hard = fs.find((x) => x.hard)?.hard || null;
    if (f.cls === 'handled') out.push({ key, cls: 'handled', row: f.row, walkers, text: f.text, marks: fs.map((x) => x.mark), counted: false, repeat: false });
    else if (f.cls === 'defect') out.push({ key, cls: 'defect', row: f.row, walkers, hard, text: fs.map((x) => x.text).join(' / '), marks: fs.map((x) => x.mark), counted: !!hard || walkers.length >= 2, repeat: priorCounted.has(key) });
    else if (f.cls === 'missing') out.push({ key, cls: 'missing', row: f.row, walkers, text: fs.map((x) => x.text).join(' / '), marks: fs.map((x) => x.mark), counted: true, repeat: priorCounted.has(key) });
    else out.push({ key, cls: 'question', row: f.row, question: f.question, walkers, text: f.text, marks: fs.map((x) => x.mark), counted: false, repeat: false, isNew: !!f.question && !knownQuestions.has(f.question) });
  }
  return out;
}

// A round: findings classified and counted, and whether it was clean. Clean means nothing changes the design and nothing waits
// for the owner: no counted defect, no missing branch, no new product question.
export function summarize(ledger, round) {
  const findings = findingsOf(ledger, round);
  const counted = findings.filter((f) => f.counted);
  const newQuestions = findings.filter((f) => f.cls === 'question' && f.isNew);
  const marks = round.marks || [];
  return {
    n: round.n, commit: round.commit, fresh: !!round.fresh,
    marks: marks.length, rows: uniq(marks.map((m) => m.row)).length,
    passed: marks.filter((m) => m.result === 'passed').length, failed: marks.filter((m) => m.result === 'failed').length, blocked: marks.filter((m) => m.result === 'blocked').length,
    findings, counted: counted.map((f) => f.key),
    handled: findings.filter((f) => f.cls === 'handled').length,
    defects: counted.filter((f) => f.cls === 'defect').length,
    noted: findings.filter((f) => f.cls === 'defect' && !f.counted).length,
    missing: counted.filter((f) => f.cls === 'missing').length,
    questions: newQuestions.length,
    repeats: counted.filter((f) => f.repeat).length,
    clean: counted.length === 0 && newQuestions.length === 0,
  };
}

// The driver's reclassification of a finding (m3=handled): handled means the screens cope, so the row passes; defect fails it.
// Returns the problems, or [] when applied. A blocked row is a product question and stays one.
export function reclassify(round, specs) {
  const problems = [];
  for (const spec of specs) {
    const [id, cls] = String(spec).split('=');
    const m = (round.marks || []).find((x) => x.id === id);
    if (!m) { problems.push(`no mark ${id} in round ${round.n}`); continue; }
    if (!['handled', 'defect', 'missing'].includes(cls)) { problems.push(`${spec}: the class is handled, defect or missing`); continue; }
    if (m.result === 'blocked') { problems.push(`${id} is a blocked row: a product question is not reclassified`); continue; }
    if (!m.finding) { problems.push(`${id} has no finding to classify`); continue; }
    m.reclassed = { from: m.cls || (m.result === 'failed' ? 'defect' : 'handled') };
    m.cls = cls;
    if (cls === 'handled') m.result = 'passed'; else if (cls === 'defect') m.result = 'failed';
  }
  return problems;
}

// Close a round: classify, count, and mark the defects that did not count (one walker, not hard) as noted so their rows stand
// as passed. Returns the summary, stored on the round.
export function closeRound(ledger, round, now = new Date().toISOString()) {
  const s = summarize(ledger, round);
  const notedMarks = new Set(s.findings.filter((f) => f.cls === 'defect' && !f.counted).flatMap((f) => f.marks));
  for (const m of round.marks) if (notedMarks.has(m.id) && m.result === 'failed') m.noted = true;
  round.summary = s;
  round.closed = now;
  return s;
}

// ---------- the stop rules ----------

const closed = (ledger) => (ledger.rounds || []).filter((r) => r.closed);
const sumOf = (ledger, r) => r.summary || summarize(ledger, r);
// Findings that change the design: counted defects and missing branches.
const designFindings = (s) => s.defects + s.missing;

// Rows that passed in an earlier round and now carry a counted defect or missing branch, on a commit that moved: a fix undid
// something. (One walker's unconfirmed stumble is noted, not counted, so it never trips this.)
export function undone(ledger) {
  const rs = closed(ledger);
  const last = rs[rs.length - 1];
  if (!last || rs.length < 2) return [];
  const rows = sumOf(ledger, last).findings.filter((f) => f.counted && f.cls !== 'question').map((f) => f.row);
  return uniq(rows).filter((row) => rs.slice(0, -1).some((r) => roundResult(r, row) === 'passed' && r.commit !== last.commit));
}

// Findings growing round on round: counted design findings rising over the last three closed rounds.
export function growing(ledger) {
  const h = closed(ledger).slice(-3).map((r) => designFindings(sumOf(ledger, r)));
  return h.length === 3 && h[0] < h[1] && h[1] < h[2];
}

// settled · capped · stuck · continue. Verdicts read closed rounds only: an open round has no classified findings yet.
export function scenarioStatus(ledger) {
  const cap = ledger.cap || MAX_ROUNDS;
  const rs = closed(ledger);
  const open = (ledger.rounds || []).find((r) => !r.closed);
  const counts = statusCounts(ledger);
  const n = rs.length;
  if (!n) return { status: 'continue', why: open ? `round ${open.n} is open` : 'no round yet', counts };
  const sums = rs.map((r) => sumOf(ledger, r));
  const last = sums[n - 1], prev = sums[n - 2];
  if (n >= 2 && last.clean && prev.clean) {
    const left = [counts.pending && `${counts.pending} row(s) never walked`, counts.failed && `${counts.failed} row(s) still failing`].filter(Boolean);
    if (!left.length && last.fresh) return { status: 'settled', why: 'two clean rounds in a row, every row walked or blocked, the last by fresh walkers', counts };
    if (!left.length) left.push('the last round was not walked by fresh walkers (round --fresh)');
    return finish({ status: 'continue', why: `two clean rounds, but ${left.join('; ')}`, counts });
  }
  const u = undone(ledger);
  if (u.length) return { status: 'stuck', why: `a fix undid another: ${u.slice(0, 3).join(', ')} passed before and fails again on a newer commit`, counts };
  if (growing(ledger)) return { status: 'stuck', why: `findings are growing round on round (${sums.slice(-3).map(designFindings).join(' → ')}); more rounds make it worse`, counts };
  const actionable = last.findings.filter((f) => f.cls !== 'handled' && (f.counted || f.cls === 'question' && f.isNew));
  const fresh = actionable.filter((f) => !f.repeat && f.cls !== 'question');
  if (actionable.length && !fresh.length) {
    const qs = actionable.filter((f) => f.cls === 'question'), reps = actionable.filter((f) => f.cls !== 'question');
    const said = [reps.length && `repeats (${reps.map((f) => f.row).slice(0, 3).join(', ')}): the last fix did not hold`, qs.length && `product questions (${qs.map((f) => f.question || f.row).join(', ')}): they go to the owner and walking again changes nothing`].filter(Boolean).join('; ');
    return { status: 'stuck', why: `round ${last.n} found only ${said}`, counts };
  }
  return finish({ status: 'continue', why: `round ${n} of at most ${cap} (${last.clean ? 'clean' : 'not clean'})`, counts });
  function finish(v) {
    return n >= cap ? { status: 'capped', why: `round cap (${cap}) reached; open: ${counts.pending} pending, ${counts.failed} failing, ${counts.blocked} blocked`, counts } : v;
  }
}
