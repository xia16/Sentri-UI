// The scenario framework's rules (scripts/scenario-rules.mjs): the operations inventory and the cut, the matrix ledger's rows
// and marks, how a round closes, and the stop rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import { closeRound as closeIt, reclassify, parseOperations, checkOperations, notSupportedGaps, notSupportedSection, rowsFromLeaves, rowsFromTree, buildRows,
  checkMark, summarize, scenarioStatus, rowStatus, statusCounts, undone } from '../scripts/scenario-rules.mjs';

// ---------- the inventory and the cut ----------

const OPS = `# Operations

| Operation | How often | At stake | Recorded? | Where | Least UI | Reason |
|---|---|---|---|---|---|---|
| Count the litter | S — every farrowing (PRD) | the herd number | yes | here | the + / − counter | |
| Fostering | I — most litters on big farms | piglet survival | yes | handoff:fostering | a link | |
| Weigh each piglet at birth | I — rare on commercial farms | little | no | not supported | | needs a scale integration |
| Name the sow a pet name | I — farmers joke about it | none | no | not supported | | noise |
`;

test('the inventory table parses into operations with their place', () => {
  const { rows, problems } = parseOperations(OPS);
  assert.deepEqual(problems, []);
  assert.deepEqual(rows.map((r) => r.kind), ['here', 'handoff', 'not-supported', 'not-supported']);
  assert.equal(rows[1].handoff, 'fostering');
  assert.deepEqual(checkOperations(rows), []);
});

test('an inventory row needs S or I with why, a place, its least UI, and a reason when not supported', () => {
  const rows = parseOperations(`| Operation | How often | At stake | Recorded? | Where | Least UI | Reason |
|---|---|---|---|---|---|---|
| A | often | x | yes | here | ui | |
| B | S — daily | x | yes | maybe | ui | |
| C | I — weekly | x | no | not supported | | |
| D | I — weekly | x | no | here | | |`).rows;
  const p = checkOperations(rows).join('\n');
  assert.match(p, /"A": "how often" starts with S/);
  assert.match(p, /"B": "where" is here, handoff/);
  assert.match(p, /"C": not supported needs its reason/);
  assert.match(p, /"D": supported here, so it names its least UI/);
});

test("the PRD's Not supported list must name every not-supported operation", () => {
  const rows = parseOperations(OPS).rows;
  const prd = `# PRD\n\n## Scope\nIn: counting.\n\n## Not supported\n\n- Weigh each piglet at birth (needs a scale)\n\n## Decisions\n\n- Name the sow a pet name is not here.\n`;
  assert.match(notSupportedSection(prd), /Weigh each piglet/);
  assert.doesNotMatch(notSupportedSection(prd), /pet name/); // the next heading ends the section
  assert.deepEqual(notSupportedGaps(rows, prd), { section: true, missing: ['Name the sow a pet name'] });
  assert.deepEqual(notSupportedGaps(rows, prd.replace('## Decisions', '- Name the sow a pet name\n\n## Decisions')).missing, []);
  assert.deepEqual(notSupportedGaps(rows, '# PRD\n## Scope\nOut: x').section, false);
});

// ---------- the ledger's rows ----------

const TREE = `| # | State | Event | Result | Src |
|---|---|---|---|---|
| E-1 | E0 | tap the card | → the room list | S |
| E-2 | E0 | filter by due | ? Q3 — does it hide Active? | S |
| E-3 | E0 | old path | *retired* | owner |
| not a row | x | y | z | w |
`;
const SPEC = { tree: [{ type: 'entry', id: 'room', children: [{ type: 'state', id: 's', children: [
  { type: 'action', id: 'a', children: [{ type: 'outcome', id: 'fa-e1', tree: 'E-1', label: 'card lands on the room' }] },
  { type: 'decision-blocker', id: 'fa-e2', tree: 'E-2', question: 'Q3', label: 'due filter scope' }] }] }] };

test('rows come from the leaves, plus the tree rows no leaf carries; retired rows are skipped', () => {
  assert.deepEqual(rowsFromLeaves(SPEC).map((r) => [r.id, r.kind, r.question || null]), [['fa-e1', 'leaf', null], ['fa-e2', 'blocker', 'Q3']]);
  assert.deepEqual(rowsFromTree(TREE).map((r) => [r.id, r.kind, r.question]), [['E-1', 'tree', null], ['E-2', 'blocker', 'Q3']]);
  const both = buildRows(SPEC, TREE + '| E-4 | E0 | tree only | → x | S |\n');
  assert.deepEqual(both.rows.map((r) => r.id), ['fa-e1', 'fa-e2', 'E-4']);
  assert.ok(both.rows.every((r) => r.status === 'pending'));
  const noLeaves = buildRows(null, TREE);
  assert.equal(noLeaves.source, 'scenario-tree.md');
  assert.deepEqual(noLeaves.rows.map((r) => r.id), ['E-1', 'E-2']);
});

// ---------- marks ----------

const row = (id, question) => ({ id, label: id, kind: 'leaf', question: question || null, status: 'pending' });
const mk = (n, marks, extra = {}) => ({ n, commit: 'c' + n + 'aaaaaaa', fresh: false, marks, ...extra });
let seq = 0;
const m = (rowId, result, by, extra = {}) => ({ id: 'm' + ++seq, row: rowId, result, by, ...extra });
// A closed round with its summary, as close writes it.
function closeRound(ledger, round) { closeIt(ledger, round, 'x'); return round; }
function led(rounds, rows = ['a', 'b', 'c'].map((i) => row(i)), extra = {}) {
  const l = { cap: 4, rows, rounds: [], knownQuestions: [], ...extra };
  for (const r of rounds) { l.rounds.push(r); if (r.closed !== false) closeRound(l, r); }
  return l;
}

test('a mark needs an open round, a walker, a commit on that round, and a reason for every failure', () => {
  const l = led([], undefined);
  assert.match(checkMark(l, { rows: ['a'], result: 'passed', by: 'w1', commit: 'c1aaaaaaa' })[0], /no round is open/);
  l.rounds.push(mk(1, [], { closed: false }));
  const ok = { rows: ['a'], result: 'passed', by: 'w1', commit: 'c1aaaaaaa' };
  assert.deepEqual(checkMark(l, ok), []);
  assert.match(checkMark(l, { ...ok, commit: 'zzzzzzz' }).join(), /not valid for this round/);
  assert.match(checkMark(l, { ...ok, result: 'pending' }).join(), /never goes back to pending/);
  assert.match(checkMark(l, { ...ok, result: 'failed' }).join(), /needs --finding/);
  assert.match(checkMark(l, { ...ok, result: 'blocked' }).join(), /needs --question/);
  assert.deepEqual(checkMark(l, { ...ok, result: 'blocked', question: 'Q2' }), []);
  assert.match(checkMark(l, { ...ok, rows: ['nope'] }).join(), /no row nope/);
  assert.match(checkMark(l, { ...ok, result: 'passed', hard: 'dead-end', finding: 'x' }).join(), /hard defect is a failed row/);
});

test('a blocked row is never quietly re-queued: it needs the question it was blocked on', () => {
  const l = led([mk(1, [m('a', 'blocked', 'w1', { question: 'Q2' })])]);
  l.rounds.push(mk(2, [], { closed: false }));
  const next = { rows: ['a'], by: 'w1', commit: 'c2aaaaaaa' };
  assert.match(checkMark(l, { ...next, result: 'passed' }).join(), /never quietly re-queued/);
  assert.match(checkMark(l, { ...next, result: 'passed', unblocks: 'Q9' }).join(), /blocked on Q2, not Q9/);
  assert.deepEqual(checkMark(l, { ...next, result: 'passed', unblocks: 'Q2' }), []);
  assert.equal(rowStatus(l, 'a'), 'blocked');
});

test('one walker marks a row once per round; a row stands at its worst mark of the latest round that walked it', () => {
  const l = led([mk(1, [m('a', 'passed', 'w1'), m('a', 'failed', 'w2', { finding: 'x', hard: 'dead-end' }), m('b', 'passed', 'w1')])]);
  assert.equal(rowStatus(l, 'a'), 'failed');
  assert.equal(rowStatus(l, 'b'), 'passed');
  assert.equal(rowStatus(l, 'c'), 'pending');
  assert.deepEqual(statusCounts(l), { pending: 1, passed: 1, failed: 1, blocked: 0 });
  l.rounds.push(mk(2, [m('a', 'passed', 'w1')], { closed: false }));
  assert.match(checkMark(l, { rows: ['a'], result: 'passed', by: 'w1', commit: 'c2aaaaaaa' }).join(), /already marked a in round 2/);
  assert.equal(rowStatus(l, 'a'), 'passed'); // the fix held
});

// ---------- closing a round ----------

test('a design-defect confusion counts only when two or more walkers hit the same row', () => {
  const one = led([mk(1, [m('a', 'failed', 'w1', { finding: 'unclear label', cls: 'defect' }), m('b', 'passed', 'w1')])]);
  const s = one.rounds[0].summary;
  assert.equal(s.defects, 0);
  assert.equal(s.noted, 1);
  assert.equal(s.clean, true);
  const two = led([mk(1, [m('a', 'failed', 'w1', { finding: 'unclear label', cls: 'defect' }), m('a', 'failed', 'w2', { finding: 'could not find it', cls: 'defect' })])]);
  assert.equal(two.rounds[0].summary.defects, 1);
  assert.equal(two.rounds[0].summary.clean, false);
  assert.deepEqual(two.rounds[0].summary.findings[0].walkers, ['w1', 'w2']);
});

test("a single walker's stumble is noted, not fixed: its row stands as passed, and a reclassification moves a row", () => {
  const l = led([mk(1, [m('a', 'failed', 'w1', { finding: 'unclear label', cls: 'defect' }), m('b', 'failed', 'w1', { finding: 'could not find it', cls: 'defect' }), ...pass(['c'])])]);
  assert.equal(rowStatus(l, 'a'), 'passed');
  assert.equal(l.rounds[0].marks[0].noted, true);
  // the driver rules b was really a hard defect found twice: reclassify before closing
  const open = { n: 1, commit: 'c1aaaaaaa', marks: [m('x', 'failed', 'w1', { finding: 'f', cls: 'defect' }), m('y', 'passed', 'w1', { finding: 'g', cls: 'handled' }), m('z', 'blocked', 'w1', { question: 'Q1' })] };
  open.marks.forEach((k, i) => { k.id = 'k' + i; });
  assert.deepEqual(reclassify(open, ['k0=handled', 'k1=defect']), []);
  assert.deepEqual(open.marks.map((k) => k.result), ['passed', 'failed', 'blocked']);
  assert.match(reclassify(open, ['k2=defect']).join(), /blocked row/);
  assert.match(reclassify(open, ['k9=defect']).join(), /no mark k9/);
});

test('a hard defect counts from one walker; so does a missing branch; handled findings never count', () => {
  const l = led([mk(1, [m('a', 'failed', 'w1', { finding: 'count shows 11, record holds 12', cls: 'defect', hard: 'wrong-fact' }),
    m('b', 'passed', 'w2', { finding: 'second look found it', cls: 'handled' }), m('c', 'passed', 'w3', { finding: 'a sow that dies mid-count', cls: 'missing' })])]);
  const s = l.rounds[0].summary;
  assert.deepEqual([s.defects, s.missing, s.handled, s.noted], [1, 1, 1, 0]);
  assert.equal(s.clean, false);
});

test('a product question is new once; the same question on another row is known', () => {
  const l = led([mk(1, [m('a', 'blocked', 'w1', { question: 'Q7' })]), mk(2, [m('b', 'blocked', 'w1', { question: 'Q7' })])], undefined, { knownQuestions: ['Q3'] });
  assert.equal(l.rounds[0].summary.questions, 1);
  assert.equal(l.rounds[0].summary.clean, false);
  assert.equal(l.rounds[1].summary.questions, 0);
  const prefilled = led([mk(1, [m('a', 'blocked', 'w1', { question: 'Q3' })])], undefined, { knownQuestions: ['Q3'] });
  assert.equal(prefilled.rounds[0].summary.clean, true); // a question the tree already carried is not a new finding
});

// ---------- the stop rules ----------

const pass = (ids, by = 'w1') => ids.map((i) => m(i, 'passed', by));
const cleanRound = (n, extra = {}) => mk(n, pass(['a', 'b', 'c']), extra);
const hardFail = (id, text = 'x') => m(id, 'failed', 'w1', { finding: text, cls: 'defect', hard: 'dead-end' });
const hardRound = (n) => mk(n, [hardFail('a', 'r' + n), ...pass(['b', 'c'])]);

test('settled: two clean rounds in a row, every row walked or blocked, the last by fresh walkers', () => {
  const l = led([cleanRound(1), cleanRound(2, { fresh: true })]);
  assert.equal(scenarioStatus(l).status, 'settled');
  assert.equal(scenarioStatus(led([cleanRound(1), cleanRound(2)])).status, 'continue');
  assert.match(scenarioStatus(led([cleanRound(1), cleanRound(2)])).why, /fresh walkers/);
  // a row nobody walked, or one still failing, keeps it open
  assert.match(scenarioStatus(led([mk(1, pass(['a', 'b'])), mk(2, pass(['a', 'b']), { fresh: true })])).why, /1 row\(s\) never walked/);
  const blockedOk = led([mk(1, [...pass(['a', 'b']), m('c', 'blocked', 'w1', { question: 'Q3' })]), mk(2, [...pass(['a', 'b']), m('c', 'blocked', 'w2', { question: 'Q3' })], { fresh: true })], undefined, { knownQuestions: ['Q3'] });
  assert.equal(scenarioStatus(blockedOk).status, 'settled');
  // one clean round is not enough, and a dirty round in between restarts the count
  assert.equal(scenarioStatus(led([cleanRound(1)])).status, 'continue');
  assert.equal(scenarioStatus(led([cleanRound(1), mk(2, [hardFail('a'), ...pass(['b', 'c'])]), cleanRound(3, { fresh: true })])).status, 'continue');
});

test('capped: four rounds without settling, with a report of what is open', () => {
  const rows = ['a', 'b', 'c', 'd', 'e'].map((i) => row(i));
  // a new defect on a new row each round: nothing repeats, nothing grows, no fix undoes another
  const rounds = ['a', 'b', 'c', 'd'].map((id, i) => mk(i + 1, [hardFail(id, 'broken ' + id)]));
  const three = scenarioStatus(led(rounds.slice(0, 3), rows));
  assert.equal(three.status, 'continue');
  const l = led(rounds, rows);
  const s = scenarioStatus(l);
  assert.equal(s.status, 'capped');
  assert.match(s.why, /round cap \(4\) reached; open: 1 pending, 4 failing, 0 blocked/);
  assert.equal(scenarioStatus(led([cleanRound(1)], undefined, { cap: 1 })).status, 'capped');
  // settling on the last allowed round is settled, not capped
  const done = led([cleanRound(1), hardRound(2), cleanRound(3), cleanRound(4, { fresh: true })]);
  assert.equal(scenarioStatus(done).status, 'settled');
});

test('stuck: a round with only repeats', () => {
  const l = led([mk(1, [hardFail('a'), ...pass(['b', 'c'])]), mk(2, [hardFail('a', 'still there'), ...pass(['b', 'c'])])]);
  const s = scenarioStatus(l);
  assert.equal(s.status, 'stuck');
  assert.match(s.why, /only repeats \(a\)/);
  assert.equal(l.rounds[1].summary.repeats, 1);
  // a new defect beside the repeat is progress, not stuck
  const mixed = led([mk(1, [hardFail('a'), ...pass(['b'])]), mk(2, [hardFail('a'), hardFail('c'), ...pass(['b'])])]);
  assert.equal(scenarioStatus(mixed).status, 'continue');
});

test('stuck: a round with only product questions', () => {
  const l = led([mk(1, [m('a', 'blocked', 'w1', { question: 'Q4' }), m('b', 'blocked', 'w2', { question: 'Q5' }), ...pass(['c'])])]);
  const s = scenarioStatus(l);
  assert.equal(s.status, 'stuck');
  assert.match(s.why, /only product questions \(Q4, Q5\)/);
  // questions beside a real defect are not "only questions"
  assert.equal(scenarioStatus(led([mk(1, [m('a', 'blocked', 'w1', { question: 'Q4' }), hardFail('b'), ...pass(['c'])])])).status, 'continue');
});

test('stuck: a fix undid another', () => {
  // row a passed on c1, then fails on a newer commit with a hard defect
  const l = led([mk(1, pass(['a', 'b', 'c'])), mk(2, [hardFail('a', 'broke again'), ...pass(['b', 'c'])])]);
  assert.deepEqual(undone(l), ['a']);
  assert.match(scenarioStatus(l).why, /a fix undid another: a/);
  // a single walker's unconfirmed stumble on a passed row is only noted
  const noted = led([mk(1, pass(['a', 'b', 'c'])), mk(2, [m('a', 'failed', 'w1', { finding: 'hmm', cls: 'defect' }), ...pass(['b', 'c'])])]);
  assert.deepEqual(undone(noted), []);
  // the same commit is walker variance, not a fix
  const same = led([mk(1, pass(['a', 'b', 'c'])), { ...mk(2, [hardFail('a'), ...pass(['b', 'c'])]), commit: 'c1aaaaaaa' }]);
  assert.deepEqual(undone(same), []);
});

test('stuck: findings growing round on round', () => {
  // 1 → 2 → 3 counted defects, each on rows no earlier round walked, so only the growth is wrong
  const rows = ['a', 'b', 'c', 'd', 'e', 'f'].map((i) => row(i));
  const r1 = mk(1, [hardFail('a')]);
  const r2 = mk(2, [hardFail('b'), hardFail('c')]);
  const r3 = mk(3, [hardFail('d'), hardFail('e'), hardFail('f')]);
  const s = scenarioStatus(led([r1, r2, r3], rows));
  assert.equal(s.status, 'stuck');
  assert.match(s.why, /growing round on round \(1 → 2 → 3\)/);
  // falling is progress
  const down = scenarioStatus(led([mk(1, [hardFail('a'), hardFail('b')]), mk(2, [hardFail('c')])], rows));
  assert.equal(down.status, 'continue');
});

test('an open round is not read: only closed rounds decide the verdict', () => {
  const l = led([cleanRound(1)]);
  l.rounds.push(mk(2, pass(['a', 'b', 'c']), { closed: false, fresh: true }));
  assert.equal(scenarioStatus(l).status, 'continue');
});
