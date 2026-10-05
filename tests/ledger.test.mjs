// The shared piglet-processing ledger (ticket #18): one test per ruled scenario.
// node --test tests/ledger.test.mjs — no dependencies.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as LG from '../ux/tasks/piglet-processing/ledger.js';
const { derive, append, balances } = LG;
const select = LG.select || {};

// ---- fixtures -------------------------------------------------------------------------------
// Litters are born on Sep 20 (day 0). `on(d)` stamps day-age d.
const on = (d, hh = '09:00') => { const x = new Date(Date.UTC(2026, 8, 20 + d)); return x.toISOString().slice(0, 10) + 'T' + hh; };
const TODAY = (d) => ({ today: on(d) });

const CONFIG = {
  doses: [
    { id: 'iron3', tx: 'iron', due: 3, product: 'Gleptosil', amount: '1 ml' },
    { id: 'teeth', tx: 'teeth', due: 3, last: 7, visible: true },
    { id: 'castrate', tx: 'castrate', due: 3, visible: true, castration: true },
    { id: 'cocci', tx: 'coccidiosis', due: 3, last: 7, product: 'Baycox', amount: '1 ml' },
    { id: 'iron14', tx: 'iron', due: 14, product: 'Gleptosil', amount: '1 ml' }
  ],
  identity: { scheme: 'notch', who: 'all', day: 3 }
};
const IRON_ONLY = { doses: [CONFIG.doses[0]], identity: { scheme: 'tag', who: 'all' } };

function book() {
  let n = 0;
  const ev = [];
  const mk = (type, o) => { const e = Object.assign({ id: 'e' + (++n), type, at: on(3), who: 'G.H' }, o); ev.push(e); return e; };
  return {
    ev,
    farrowed: (litter, born, dead = {}, o = {}) => mk('farrowed', Object.assign({ litter, room: 'R3', birthDate: on(0).slice(0, 10), born, dead, locked: true, at: on(0) }, o)),
    count: (litter, observed, o = {}) => mk('count', Object.assign({ litter, observed }, o)),
    death: (litter, lines, o = {}) => mk('death', Object.assign({ litter, lines }, o)),
    move: (from, to, n, o = {}) => mk('move', Object.assign({ from, to, n }, o)),
    treat: (litter, dose, n, o = {}) => mk('treat', Object.assign({ litter, dose, n }, o)),
    castrate: (litter, castration, o = {}) => mk('treat', Object.assign({ litter, dose: 'castrate', castration }, o)),
    check: (litter, dose, had, lacks, o = {}) => mk('check', Object.assign({ litter, dose, had, lacks }, o)),
    identity: (litter, op, o = {}) => mk('identity', Object.assign({ litter, op }, o)),
    sowDied: (litter, o = {}) => mk('sow_died', Object.assign({ litter, cause: 'prolapse' }, o)),
    weaned: (litter, o = {}) => mk('weaned', Object.assign({ litter }, o)),
    correction: (target, o = {}) => mk('correction', Object.assign({ target }, o))
  };
}
const run = (b, cfg = CONFIG, day = 3) => derive(b.ev, cfg, TODAY(day));
const rejectedReason = (d, e) => (d.rejected.find((r) => r.id === e.id) || {}).reason;
function allBalanced(d) {
  for (const L of Object.values(d.litters)) assert.ok(balances(L), 'litter ' + L.id + ' balances');
}

// ---- treatments -----------------------------------------------------------------------------

test('one tap records all: owed = alive, one record, done', () => {
  const b = book();
  b.farrowed('A02', 13, { stillborn: 1 });
  b.treat('A02', 'iron3', 12);
  const d = run(b);
  const x = d.litters.A02.doses.iron3;
  assert.equal(d.litters.A02.alive, 12);
  assert.equal(x.owed, 0);
  assert.equal(x.treated, 12);
  assert.equal(x.done, true);
  assert.equal(x.records[0].product, 'Gleptosil');   // snapshot from config
  assert.equal(x.records[0].timing, 'on_time');
});

test('a record that leaves piglets without a reason is refused', () => {
  const b = book();
  b.farrowed('A02', 12);
  const t = b.treat('A02', 'iron3', 10);
  assert.equal(rejectedReason(run(b), t), 'reason_missing');
});

test('short count deferred, then caught up next visit', () => {
  const b = book();
  b.farrowed('A02', 12);
  b.treat('A02', 'iron3', 10, { deferred: { n: 2, reason: 'weak' } });
  let x = run(b).litters.A02.doses.iron3;
  assert.equal(x.owed, 2);
  assert.equal(x.deferred, 2);
  assert.equal(x.deferReason, 'weak');
  b.treat('A02', 'iron3', 2, { at: on(4) });
  x = run(b, CONFIG, 4).litters.A02.doses.iron3;
  assert.equal(x.owed, 0);
  assert.equal(x.deferred, 0);
  assert.equal(x.treated, 12);
  assert.equal(x.records[1].timing, 'late');
});

test('exempt leaves the obligation for good', () => {
  const b = book();
  b.farrowed('A02', 12);
  b.treat('A02', 'iron3', 11, { exempt: { n: 1, reason: 'vet' } });
  const x = run(b).litters.A02.doses.iron3;
  assert.equal(x.owed, 0);
  assert.equal(x.exempt, 1);
});

test('castration: first record counts males; catch-up keeps prior exemptions and owes only deferred', () => {
  const b = book();
  b.farrowed('A02', 12);
  assert.equal(run(b).litters.A02.doses.castrate.owed, null);   // males unknown before the first record
  b.castrate('A02', { castrated: 5, hernia: 1, deferred: 2 });
  let d = run(b), x = d.litters.A02.doses.castrate;
  assert.equal(x.owed, 2);
  assert.equal(x.exempt, 1);
  assert.deepEqual(x.castration, { castrated: 5, notCastrated: { hernia: 1, cryptorchid: 0, kept: 0, deferred: 2 }, females: 0, males: 8 });
  assert.deepEqual(d.litters.A02.notes.map((n) => [n.kind, n.n]), [['hernia', 1]]);
  // a catch-up must account for the 2 owed only
  const bad = b.castrate('A02', { castrated: 5 }, { at: on(5) });
  assert.equal(rejectedReason(run(b, CONFIG, 5), bad), 'more_than_owed');
  b.ev.pop();
  b.castrate('A02', { castrated: 1, cryptorchid: 1 }, { at: on(5) });
  d = run(b, CONFIG, 5); x = d.litters.A02.doses.castrate;
  assert.equal(x.owed, 0);
  assert.equal(x.exempt, 2);
  assert.equal(x.castration.castrated, 6);
  assert.equal(x.castration.notCastrated.hernia, 1);           // kept from the first record
  assert.equal(x.castration.notCastrated.cryptorchid, 1);
  assert.equal(x.castration.notCastrated.deferred, 0);
  assert.equal(x.castration.males, 8);
});

test('all-female litter: castration recorded as none, nothing owed', () => {
  const b = book();
  b.farrowed('A05', 9);
  b.castrate('A05', { castrated: 0 });
  const x = run(b).litters.A05.doses.castrate;
  assert.equal(x.owed, 0);
  assert.equal(x.castration.males, 0);
  assert.equal(x.done, true);
});

test('early counts on time', () => {
  const b = book();
  b.farrowed('C04', 9);
  b.treat('C04', 'iron3', 9, { at: on(2) });
  const r = run(b, CONFIG, 2).litters.C04.doses.iron3.records[0];
  assert.equal(r.timing, 'early');
  assert.equal(r.onTime, true);
});

test('late: stays owed, then records late with its real date', () => {
  const b = book();
  b.farrowed('B01', 14);
  let x = run(b, CONFIG, 5).litters.B01.doses.iron3;
  assert.equal(x.status, 'late');
  assert.equal(x.owed, 14);
  b.treat('B01', 'iron3', 14, { at: on(5) });
  x = run(b, CONFIG, 5).litters.B01.doses.iron3;
  assert.equal(x.records[0].timing, 'late');
  assert.equal(x.records[0].onTime, false);
  assert.equal(x.records[0].dayAge, 5);
});

test('missed after the window: shown as missed, still owed; iron has no window', () => {
  const b = book();
  b.farrowed('B04', 10);
  const d = run(b, CONFIG, 9).litters.B04.doses;
  assert.equal(d.teeth.status, 'missed');
  assert.equal(d.teeth.missed, 10);
  assert.equal(d.teeth.owed, 10);           // missed is inside owed
  assert.equal(d.iron3.status, 'late');
  assert.equal(d.iron3.missed, 0);
  b.treat('B04', 'teeth', 10, { at: on(9) });
  assert.equal(run(b, CONFIG, 9).litters.B04.doses.teeth.records[0].timing, 'after_window');
});

test('a stale second tap (device already saw it done) records nothing', () => {
  const b = book();
  b.farrowed('A02', 12);
  const first = b.treat('A02', 'iron3', 12, { at: on(3, '08:40'), who: 'L.M' });
  const second = b.treat('A02', 'iron3', 12, { seen: ['e1', first.id] });
  const d = run(b);
  assert.equal(rejectedReason(d, second), 'nothing_owed');
  assert.equal(d.rejected.find((r) => r.id === second.id).detail.by, 'L.M');
  assert.equal(d.litters.A02.doses.iron3.treated, 12);
  assert.equal(d.flags.length, 0);
});

test('offline collision: two records neither saw → both kept, possible double treatment', () => {
  const b = book();
  const f = b.farrowed('A05', 11);
  const a = b.treat('A05', 'iron3', 11, { seen: [f.id], device: 'p1', who: 'L.M' });
  const c = b.treat('A05', 'iron3', 11, { seen: [f.id], device: 'p2' });
  const d = run(b);
  const x = d.litters.A05.doses.iron3;
  assert.equal(x.records.length, 2);
  assert.equal(x.treated, 22);
  assert.equal(x.owed, 0);
  assert.deepEqual(x.possibleDoubleTreatment, [[a.id, c.id]]);
  assert.equal(d.flags.filter((g) => g.kind === 'possible_double_treatment').length, 1);
});

test('a death the treating phone had not seen is no collision (Σn > alive is not the test)', () => {
  const b = book();
  const f = b.farrowed('A05', 11);
  b.death('A05', [{ cause: 'crushed', n: 1 }], { seen: [f.id] });
  b.treat('A05', 'iron3', 11, { seen: [f.id] });            // treated 11 on 10 alive
  const d = run(b);
  const x = d.litters.A05.doses.iron3;
  assert.equal(x.treated, 11);
  assert.equal(x.owed, 0);
  assert.deepEqual(x.possibleDoubleTreatment, []);
  assert.equal(d.flags.filter((g) => g.kind === 'possible_double_treatment').length, 0);
});

test('owed is a stored count shown as min(owed, alive): a death lowers it only past alive', () => {
  const b = book();
  b.farrowed('A02', 12);
  b.treat('A02', 'iron3', 9, { deferred: { n: 3, reason: 'weak' } });
  b.death('A02', [{ cause: 'crushed', n: 1 }]);
  let x = run(b).litters.A02.doses.iron3;
  assert.equal(x.owed, 3);                  // the dead one may have been treated: never hide an untreated piglet
  b.death('A02', [{ cause: 'scours', n: 9 }]);
  x = run(b).litters.A02.doses.iron3;
  assert.equal(run(b).litters.A02.alive, 2);
  assert.equal(x.owed, 2);
  assert.equal(x.owedStored, 3);                           // stored; only a zero point (alive 0) extinguishes it (round 3, item 5)
});

// ---- counts, losses, deaths -----------------------------------------------------------------

test('count lower → one open unexplained loss; a recount never closes it (RULINGS round 3): it writes its own line', () => {
  const b = book();
  b.farrowed('B14', 11, { stillborn: 1 });
  const c1 = b.count('B14', 9, { baseAlive: 10 });
  let L = run(b).litters.B14;
  assert.equal(L.alive, 9);
  assert.equal(L.unexplained.openLoss, 1);
  assert.equal(L.unexplained.losses[0].id, c1.id);
  const c2 = b.count('B14', 10, { baseAlive: 9 });
  L = run(b).litters.B14;
  assert.equal(L.alive, 10);
  assert.equal(L.unexplained.openLoss, 1);                  // never netted, never closed by a count
  assert.equal(L.unexplained.openGain, 1);
  assert.equal(L.unexplained.gains[0].id, c2.id);
  assert.deepEqual(L.unexplained.losses[0].explainedBy, []);
  assert.ok(balances(L));
});

test('two offline counts of one crate: the later stands, differences never sum', () => {
  const b = book();
  const f = b.farrowed('B14', 10);
  b.count('B14', 9, { seen: [f.id], baseAlive: 10 });
  b.count('B14', 9, { seen: [f.id], baseAlive: 10 });
  const d = run(b);
  assert.equal(d.litters.B14.alive, 9);
  assert.equal(d.litters.B14.unexplained.openLoss, 1);
  assert.equal(d.flags.length, 0);
});

test('a count crossing an unseen death is flagged sync review', () => {
  const b = book();
  const f = b.farrowed('B14', 10);
  b.count('B14', 9, { seen: [f.id], baseAlive: 10 });
  b.death('B14', [{ cause: 'crushed', n: 1 }], { seen: [f.id] });
  const d = run(b);
  assert.deepEqual(d.flags.map((g) => [g.kind, g.reason]), [['sync_review', 'count_concurrent']]);
  allBalanced(d);
});

test('counts are refused before the lock (the farrowing sheet owns the count)', () => {
  const b = book();
  b.farrowed('B08', 7, {}, { locked: false });
  const c = b.count('B08', 6);
  assert.equal(rejectedReason(run(b), c), 'farrowing_open');
});

test('body found later draws from the loss: no double subtraction', () => {
  const b = book();
  b.farrowed('B14', 10);
  const c = b.count('B14', 9);
  b.death('B14', [{ cause: 'crushed', n: 1 }], { lossAlloc: [{ lossId: c.id, qty: 1 }], at: on(4) });
  const L = run(b).litters.B14;
  assert.equal(L.alive, 9);
  assert.equal(L.dead.total, 1);
  assert.equal(L.unexplained.openLoss, 0);
  assert.deepEqual(L.unexplained.losses[0].explainedBy.map((x) => [x.kind, x.qty]), [['death', 1]]);
  assert.ok(balances(L));
});

test('split: two bodies, one of the 2 missing + one new death', () => {
  const b = book();
  b.farrowed('B14', 10);
  b.count('B14', 8);
  b.death('B14', [{ cause: 'crushed', n: 2 }], { fromMissing: 1 });
  const L = run(b).litters.B14;
  assert.equal(L.alive, 7);
  assert.equal(L.dead.total, 2);
  assert.equal(L.unexplained.openLoss, 1);
  assert.equal(L.unexplained.losses[0].open, 1);
  assert.ok(balances(L));
});

test('oldest loss consumed first', () => {
  const b = book();
  b.farrowed('B14', 10);
  const c1 = b.count('B14', 9, { at: on(3) });
  const c2 = b.count('B14', 8, { at: on(4) });
  b.death('B14', [{ cause: 'crushed', n: 1 }], { fromMissing: 1, at: on(5) });
  const L = run(b).litters.B14;
  assert.equal(L.unexplained.losses.find((x) => x.id === c1.id).open, 0);
  assert.equal(L.unexplained.losses.find((x) => x.id === c2.id).open, 1);
});

test('over-allocation is refused: alive never goes below 0', () => {
  const b = book();
  b.farrowed('B14', 2);
  const d1 = b.death('B14', [{ cause: 'crushed', n: 3 }]);
  const d = run(b);
  assert.ok(['more_than_alive', 'alive_negative'].includes(rejectedReason(d, d1)));
  assert.equal(d.litters.B14.alive, 2);
  const d2 = b.death('B14', [{ cause: 'crushed', n: 1 }], { fromMissing: 2 });
  assert.equal(rejectedReason(run(b), d2), 'alloc_exceeds_bodies');
});

test('two phones consume one loss → the second body is held for review (RULINGS round 3), never a second death', () => {
  const b = book();
  const f = b.farrowed('B14', 10);
  const c = b.count('B14', 9);
  const p1 = b.death('B14', [{ cause: 'crushed', n: 1 }], { seen: [f.id, c.id], lossAlloc: [{ lossId: c.id, qty: 1 }] });
  const p2 = b.death('B14', [{ cause: 'crushed', n: 1 }], { seen: [f.id, c.id], lossAlloc: [{ lossId: c.id, qty: 1 }] });
  let d = run(b);
  let L = d.litters.B14;
  assert.equal(L.unexplained.openLoss, 0);
  assert.equal(L.dead.total, 1);                            // Dead 1, Alive 9: the duplicate is not applied
  assert.equal(L.alive, 9);
  assert.deepEqual(L.held.map((h) => [h.event, h.n, h.resolved]), [[p2.id, 1, null]]);
  assert.deepEqual(d.flags.map((g) => [g.kind, g.reason, g.events[0]]), [['sync_review', 'held_body', p2.id]]);
  assert.equal(L.deaths.find((x) => x.id === p1.id).held, 0);
  assert.ok(balances(L));
  // one body: the duplicate is withdrawn
  const one = { id: 'res1', type: 'resolve', litter: 'B14', held: p2.id, answer: 'one', at: on(3, '11:00'), who: 'G.H' };
  L = derive(b.ev.concat([one]), CONFIG, TODAY(3)).litters.B14;
  assert.deepEqual([L.dead.total, L.alive, L.held[0].resolved], [1, 9, 'one']);
  // two bodies: the second applies as a plain death
  const two = { id: 'res2', type: 'resolve', litter: 'B14', held: p2.id, answer: 'two', at: on(3, '11:00'), who: 'G.H' };
  d = derive(b.ev.concat([two]), CONFIG, TODAY(3)); L = d.litters.B14;
  assert.deepEqual([L.dead.total, L.alive, L.held[0].resolved], [2, 8, 'two']);
  assert.ok(balances(L));
  const again = { id: 'res3', type: 'resolve', litter: 'B14', held: p2.id, answer: 'one', at: on(3, '11:05') };
  assert.equal(rejectedReason(derive(b.ev.concat([two, again]), CONFIG, TODAY(3)), again), 'already_resolved');
});

test('open-phase deaths never touch Alive: Born derives', () => {
  const b = book();
  b.farrowed('B08', 7, { stillborn: 1 }, { locked: false });
  b.death('B08', [{ cause: 'crushed', n: 1 }]);
  const L = run(b).litters.B08;
  assert.equal(L.phase, 'open');
  assert.equal(L.alive, 6);
  assert.equal(L.born, 8);
  assert.equal(L.dead.total, 2);
  assert.ok(balances(L));
});

test("sow died ends her session: Move opens, schedule continues", () => {
  const b = book();
  b.farrowed('B01', 8, {}, { locked: false });
  b.farrowed('B02', 9);
  b.sowDied('B01');
  b.move('B01', 'B02', 2);
  const d = run(b);
  assert.equal(d.litters.B01.phase, 'locked');
  assert.equal(d.litters.B01.sowDied.cause, 'prolapse');
  assert.equal(d.litters.B01.alive, 6);
  assert.equal(d.litters.B01.doses.iron3.owed, 6);
  assert.equal(d.rejected.length, 0);
});

// ---- moves ----------------------------------------------------------------------------------

test('Move untagged: one record, both litters; none-done source → arrivals owe in a done litter', () => {
  const b = book();
  b.farrowed('B06', 13, { stillborn: 1 });   // 12 alive, nothing done
  b.farrowed('B04', 10, { crushed: 1 });     // 9 alive, iron done
  b.treat('B04', 'iron3', 9);
  b.move('B06', 'B04', 2, { at: on(3, '09:42') });
  const d = run(b);
  assert.equal(d.litters.B06.alive, 10);
  assert.equal(d.litters.B04.alive, 11);
  assert.equal(d.litters.B04.movedIn, 2);
  assert.equal(d.litters.B06.movedOut, 2);
  assert.equal(d.litters.B04.doses.iron3.owed, 2);         // a done crate goes back to due for them
  assert.equal(d.litters.B04.moves[0].packets.iron3, 'owed');
  assert.equal(d.litters.B06.doses.iron3.owed, 10);
  allBalanced(d);
});

test('Move from an all-done source carries the evidence; the receiver does not owe it', () => {
  const b = book();
  b.farrowed('C01', 12); b.treat('C01', 'iron3', 12);
  b.farrowed('B10', 11);
  b.move('C01', 'B10', 1);
  const d = run(b);
  assert.equal(d.litters.B10.doses.iron3.carriedFromMove, 1);
  assert.equal(d.litters.B10.doses.iron3.owed, 11);        // 12 alive − 1 carried
  assert.equal(d.litters.C01.doses.iron3.owed, 0);
});

test('Move tagged: rows are picked, never counted; custody moves', () => {
  const b = book();
  b.farrowed('B09', 10); b.farrowed('B02', 8);
  b.identity('B09', 'add', { rowId: 'r1', tag: '271004' });
  b.identity('B09', 'add', { rowId: 'r2', tag: '271005' });
  b.move('B09', 'B02', undefined, { rows: ['r1'] });
  const d = run(b, IRON_ONLY);
  assert.equal(d.litters.B09.alive, 9);
  assert.equal(d.litters.B02.alive, 9);
  assert.equal(d.litters.B09.identity.identified, 1);
  assert.equal(d.litters.B02.identity.identified, 1);
  assert.equal(d.litters.B02.identity.rows.find((r) => r.rowId === 'r1').birthLitter, 'B09');
});

test('Move from a part-done source: Yes / No / Don\'t know — and source coverage moves too', () => {
  // B09: 10 alive, iron 7 treated + 3 deferred (owed 3). Three moves of 1 each to three done litters.
  const b = book();
  b.farrowed('B09', 10);
  b.treat('B09', 'iron3', 7, { deferred: { n: 3, reason: 'weak' } });
  for (const c of ['X1', 'X2', 'X3']) { b.farrowed(c, 9); b.treat(c, 'iron3', 9); }
  b.move('B09', 'X1', 1, { answers: { iron3: 'yes' } });
  b.move('B09', 'X2', 1, { answers: { iron3: 'no' } });
  b.move('B09', 'X3', 1, { answers: { iron3: 'unknown' } });
  const d = run(b, IRON_ONLY);
  assert.equal(d.litters.X1.doses.iron3.carriedFromMove, 1);
  assert.equal(d.litters.X1.doses.iron3.owed, 0);
  assert.equal(d.litters.X2.doses.iron3.owed, 1);
  assert.equal(d.litters.X3.doses.iron3.unknownAfterMove, 1);
  assert.equal(d.litters.X3.doses.iron3.owed, 0);
  assert.equal(d.litters.X3.doses.iron3.done, false);
  // source: the No took one untreated piglet with it (3 → 2); Yes and Don't know left owed at 2
  assert.equal(d.litters.B09.alive, 7);
  assert.equal(d.litters.B09.doses.iron3.owed, 2);
  assert.equal(d.litters.B09.doses.iron3.owedStored, 2);
  allBalanced(d);
});

test('visible dose from a part-done source is checked on the pig, no question asked', () => {
  const b = book();
  b.farrowed('B09', 10);
  b.treat('B09', 'teeth', 7, { deferred: { n: 3, reason: 'weak' } });
  b.farrowed('B02', 8); b.treat('B02', 'teeth', 8);
  b.move('B09', 'B02', 1, { answers: { teeth: 'yes' } });   // an answer for a visible dose is ignored
  const x = run(b).litters.B02;
  assert.equal(x.moves[0].packets.teeth, 'check');
  assert.equal(x.doses.teeth.unknownAfterMove, 1);
});

test('arrival check resolves the unknown: already had / did not', () => {
  const b = book();
  b.farrowed('B09', 10); b.treat('B09', 'iron3', 7, { deferred: { n: 3, reason: 'weak' } });
  b.farrowed('B02', 8); b.treat('B02', 'iron3', 8);
  b.move('B09', 'B02', 2, { answers: { iron3: 'unknown' } });
  b.check('B02', 'iron3', 1, 1);
  const x = run(b, IRON_ONLY).litters.B02.doses.iron3;
  assert.equal(x.unknownAfterMove, 0);
  assert.equal(x.carriedFromMove, 1);
  assert.equal(x.owed, 1);
  const bad = b.check('B02', 'iron3', 1, 0);
  assert.equal(rejectedReason(run(b, IRON_ONLY), bad), 'more_than_unknown');
});

test('arrivals owe what the source owed, per dose (iron d3 and iron d14 are two obligations)', () => {
  const b = book();
  b.farrowed('S', 10);
  b.treat('S', 'iron3', 10);                                  // iron d3 done, iron d14 not yet
  b.farrowed('R', 9);
  b.treat('R', 'iron3', 9);
  b.treat('R', 'iron14', 9, { at: on(14) });                   // R is older, done both
  b.move('S', 'R', 1, { at: on(14, '10:00') });
  const x = run(b, CONFIG, 14).litters.R;
  assert.equal(x.doses.iron3.owed, 0);
  assert.equal(x.doses.iron3.carriedFromMove, 1);
  assert.equal(x.doses.iron14.owed, 1);
});

test('explaining Move: loss and gain relabelled, zero Alive effect', () => {
  const b = book();
  b.farrowed('B14', 10); b.farrowed('B16', 9);
  const loss = b.count('B14', 9);
  const gain = b.count('B16', 10);
  let d = run(b);
  assert.equal(d.rooms.R3.openLoss, 1);
  assert.equal(d.rooms.R3.openGain, 1);
  assert.equal(d.rooms.R3.netDrift, 0);                      // net 0, yet two open items
  b.move('B14', 'B16', 1, { explains: [loss.id, gain.id] });
  d = run(b);
  assert.equal(d.litters.B14.alive, 9);
  assert.equal(d.litters.B16.alive, 10);
  assert.equal(d.litters.B14.movedOut, 1);
  assert.equal(d.litters.B16.movedIn, 1);
  assert.equal(d.rooms.R3.openLoss, 0);
  assert.equal(d.rooms.R3.openGain, 0);
  allBalanced(d);
});

test('explaining Move: Move rules as the source stood when its count found the piglet missing, never its present state', () => {
  const b = book();
  b.farrowed('B14', 10); b.farrowed('B16', 9);
  b.treat('B16', 'iron3', 9);
  const loss = b.count('B14', 9);
  const gain = b.count('B16', 10);                            // a counted gain owes nothing new (round 4)
  assert.equal(run(b, IRON_ONLY).litters.B16.doses.iron3.unknownAfterMove, 0);
  b.treat('B14', 'iron3', 9);                                 // source treated after the stray left: not the stray
  b.move('B14', 'B16', 1, { explains: [loss.id, gain.id], answers: { iron3: 'yes' } });   // an answer the app need not ask
  const x = run(b, IRON_ONLY).litters.B16.doses.iron3;
  assert.equal(x.unknownAfterMove, 0);
  assert.equal(x.owed, 1);
});

test('Move clamped to source alive, flagged sync review', () => {
  const b = book();
  const f1 = b.farrowed('B06', 3), f2 = b.farrowed('B04', 9);
  b.move('B06', 'B04', 2, { seen: [f1.id, f2.id] });
  b.move('B06', 'B04', 2, { seen: [f1.id, f2.id] });
  const d = run(b);
  assert.equal(d.litters.B06.alive, 0);
  assert.equal(d.litters.B04.alive, 12);
  assert.equal(d.litters.B04.movedIn, 3);
  assert.deepEqual(d.flags.map((g) => g.reason), ['move_clamped']);
  allBalanced(d);
});

test('Move refused before the lock', () => {
  const b = book();
  b.farrowed('B08', 7, {}, { locked: false }); b.farrowed('B04', 9);
  const m = b.move('B08', 'B04', 1);
  assert.equal(rejectedReason(run(b), m), 'farrowing_open');
});

// ---- identity -------------------------------------------------------------------------------

test('identified piglet dies: row kept with status dead, leaves Identified, stays on record', () => {
  const b = book();
  b.farrowed('B01', 3);
  b.identity('B01', 'add', { rowId: 'r1', notch: '12-1', sex: 'm' });
  b.identity('B01', 'add', { rowId: 'r2', notch: '12-2' });
  b.death('B01', [{ cause: 'crushed', rowId: 'r1' }]);
  const L = run(b).litters.B01;
  assert.equal(L.alive, 2);
  assert.equal(L.identity.identified, 1);
  assert.equal(L.identity.onRecord, 2);
  const r1 = L.identity.rows.find((r) => r.rowId === 'r1');
  assert.equal(r1.status, 'dead');
  assert.equal(r1.cause, 'crushed');
  // a second death of the same row: earliest stands, the later is flagged
  b.death('B01', [{ cause: 'scours', rowId: 'r1' }]);
  const d = run(b);
  assert.equal(d.litters.B01.alive, 2);
  assert.deepEqual(d.flags.map((g) => g.reason), ['row_already_dead']);
});

test('identity rows: edit and withdraw are stamped, never deleted; done rule', () => {
  const b = book();
  b.farrowed('B01', 2);
  b.identity('B01', 'add', { rowId: 'r1', tag: '271004' });
  b.identity('B01', 'add', { rowId: 'r2', tag: '271009' });
  let L = run(b).litters.B01;
  assert.equal(L.identity.done, true);
  b.identity('B01', 'edit', { rowId: 'r2', set: { tag: '271006', weight: 1.4 } });
  b.identity('B01', 'withdraw', { rowId: 'r1' });
  L = run(b).litters.B01;
  assert.equal(L.identity.identified, 1);
  assert.equal(L.identity.onRecord, 1);
  assert.equal(L.identity.rows.length, 2);
  assert.equal(L.identity.rows.find((r) => r.rowId === 'r2').edits[0].before.tag, '271009');
  assert.equal(L.identity.done, false);
  const extra = b.identity('B01', 'add', { rowId: 'r3', tag: '1' });
  b.identity('B01', 'add', { rowId: 'r4', tag: '2' });
  assert.equal(rejectedReason(run(b), extra), undefined);
  assert.equal(rejectedReason(run(b), b.ev[b.ev.length - 1]), 'more_rows_than_alive');
});

test('candidates scheme: done when the worker closes the set', () => {
  const cfg = { doses: [], identity: { scheme: 'notch', who: 'candidates' } };
  const b = book();
  b.farrowed('B01', 20);
  b.identity('B01', 'add', { rowId: 'r1', notch: '1-1' });
  assert.equal(run(b, cfg).litters.B01.identity.done, false);
  b.identity('B01', 'close');
  assert.equal(run(b, cfg).litters.B01.identity.done, true);
});

// ---- corrections, weaning, rooms -------------------------------------------------------------

test('correction replaces a record in place; original kept; void un-records', () => {
  const b = book();
  b.farrowed('A02', 12);
  const t = b.treat('A02', 'iron3', 12);
  b.correction(t.id, { set: { n: 10, deferred: { n: 2, reason: 'sick' } }, who: 'L.M' });
  let d = run(b);
  let x = d.litters.A02.doses.iron3;
  assert.equal(x.owed, 2);
  assert.equal(x.records[0].corrected, true);
  assert.equal(d.corrections[t.id][0].who, 'L.M');
  assert.equal(b.ev.find((e) => e.id === t.id).n, 12);       // the original event is untouched
  b.correction(t.id, { void: true });
  x = run(b).litters.A02.doses.iron3;
  assert.equal(x.records.length, 0);
  assert.equal(x.owed, 12);
});

test('weaned closes the equation', () => {
  const b = book();
  b.farrowed('A02', 12, { stillborn: 1 });
  b.identity('A02', 'add', { rowId: 'r1', tag: '9' });
  b.weaned('A02', { at: on(21) });
  const L = run(b, CONFIG, 21).litters.A02;
  assert.equal(L.alive, 0);
  assert.equal(L.weaned, 11);
  assert.equal(L.identity.rows[0].status, 'weaned');
  assert.ok(balances(L));
  const w = b.weaned('A02', { n: 1 });
  assert.equal(rejectedReason(run(b), w), 'alive_negative');
});

test('room: open loss and open gain heads beside net drift; open only; cross-room move', () => {
  const b = book();
  b.farrowed('A1', 10); b.farrowed('A2', 10); b.farrowed('B1', 10, {}, { room: 'R4' });
  const l = b.count('A1', 8);
  b.count('A2', 11);
  b.death('A1', [{ cause: 'crushed', n: 1 }], { lossAlloc: [{ lossId: l.id, qty: 1 }] });
  b.move('A2', 'B1', 2);
  const d = run(b);
  assert.equal(d.rooms.R3.openLoss, 1);
  assert.equal(d.rooms.R3.openGain, 1);
  assert.equal(d.rooms.R3.netDrift, 0);
  assert.equal(d.rooms.R4.alive, 12);
  assert.equal(d.rooms.R4.netDrift, 0);
});

test('append snapshots product and dose and reports refusals', () => {
  const b = book();
  b.farrowed('A02', 12);
  const r = append(b.ev, { id: 'n1', type: 'treat', litter: 'A02', dose: 'cocci', n: 12, at: on(3) }, CONFIG, TODAY(3));
  assert.equal(r.ok, true);
  assert.equal(r.event.product, 'Baycox');
  assert.equal(r.derived.litters.A02.doses.cocci.records[0].amount, '1 ml');
  const r2 = append(r.events, { id: 'n2', type: 'treat', litter: 'A02', dose: 'cocci', n: 12, at: on(3) }, CONFIG, TODAY(3));
  assert.equal(r2.ok, false);
  assert.equal(r2.reason, 'nothing_owed');
});

// ---- property: balance identity after every event -------------------------------------------

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

test('balance identity holds after every event (random sequences, incl. offline writes)', () => {
  const LITTERS = ['P1', 'P2', 'P3', 'Q1'];
  const tally = { events: 0, rejected: 0, flags: 0 };
  for (let seed = 1; seed <= 60; seed++) {
    const r = rng(seed);
    const pick = (a) => a[Math.floor(r() * a.length)];
    const int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    const b = book();
    for (const l of LITTERS) b.farrowed(l, int(6, 14), { stillborn: int(0, 2) }, { room: l[0] === 'Q' ? 'R4' : 'R3' });
    let rowN = 0;
    for (let step = 0; step < 40; step++) {
      const d0 = run(b);
      const l = pick(LITTERS), m = pick(LITTERS.filter((x) => x !== l));
      const L = d0.litters[l];
      if (!L || !d0.litters[m]) continue;                      // a corrected farrowing may have voided a litter
      // offline: sometimes the device saw only a random prefix of the log
      const o = r() < 0.3 ? { seen: b.ev.slice(0, int(1, b.ev.length)).map((e) => e.id) } : {};
      const k = pick(['count', 'death', 'deathMissing', 'move', 'explain', 'treat', 'treatShort', 'check', 'id', 'rowDeath', 'weanSome', 'correct']);
      if (k === 'count') b.count(l, Math.max(0, L.alive + int(-2, 2)), o);
      if (k === 'death') b.death(l, [{ cause: 'crushed', n: int(1, 3) }], o);
      if (k === 'deathMissing') b.death(l, [{ cause: 'scours', n: int(1, 2) }], Object.assign({ fromMissing: 1 }, o));
      if (k === 'move') b.move(l, m, int(1, 3), Object.assign({ answers: { iron3: pick(['yes', 'no', 'unknown']) } }, o));
      if (k === 'explain') {
        const loss = L.unexplained.losses.find((x) => x.open > 0), gain = d0.litters[m].unexplained.gains.find((x) => x.open > 0);
        b.move(l, m, 1, Object.assign({ explains: [loss ? loss.id : null, gain ? gain.id : null], answers: { iron3: 'unknown' } }, o));
      }
      if (k === 'treat') { const ow = L.doses.iron3.owed; b.treat(l, pick(['iron3', 'cocci']), ow || 1, o); }
      if (k === 'treatShort') { const ow = L.doses.iron3.owed || 1; const n = int(0, ow); b.treat(l, 'iron3', n, Object.assign({ deferred: { n: ow - n, reason: 'weak' } }, o)); }
      if (k === 'check') b.check(l, 'iron3', int(0, 1), int(0, 1), o);
      if (k === 'id') b.identity(l, 'add', Object.assign({ rowId: 'row' + (++rowN), tag: String(rowN) }, o));
      if (k === 'rowDeath') { const row = L.identity.rows.find((x) => x.status === 'alive' && x.litter === l); if (row) b.death(l, [{ cause: 'crushed', rowId: row.rowId }], o); }
      if (k === 'weanSome') b.weaned(l, Object.assign({ n: int(1, 2) }, o));
      if (k === 'correct') { const t = pick(b.ev.filter((e) => e.type === 'count' || e.type === 'treat') .concat([b.ev[0]])); b.correction(t.id, r() < 0.5 ? { void: true } : { set: t.type === 'count' ? { observed: int(0, 12) } : {} }); }
      const d = run(b);
      let inSum = 0, outSum = 0;
      for (const X of Object.values(d.litters)) {
        assert.ok(X.alive >= 0, `seed ${seed} step ${step}: alive ≥ 0`);
        assert.ok(balances(X), `seed ${seed} step ${step} ${k}: ${X.id} balances`);
        assert.ok(X.unexplained.openLoss >= 0 && X.unexplained.openGain >= 0);
        for (const D of Object.values(X.doses)) {
          if (D.owed != null) assert.ok(D.owed >= 0 && D.owed <= X.alive, `seed ${seed}: owed within alive`);
          assert.ok(D.unknownAfterMove >= 0);
        }
        assert.ok(X.identity.identified <= X.alive);
        inSum += X.movedIn; outSum += X.movedOut;
      }
      assert.equal(inSum, outSum, 'every move has two legs');
      for (const R of Object.values(d.rooms)) assert.equal(R.netDrift, R.openGain - R.openLoss);
    }
    const d = run(b);
    tally.events += b.ev.length; tally.rejected += d.rejected.length; tally.flags += d.flags.length;
  }
  // the sequences must exercise the ledger, not just bounce off it
  assert.ok(tally.rejected / tally.events < 0.5, JSON.stringify(tally));
  assert.ok(tally.flags > 0, 'offline writes produce some flags');
});

// =============================================================================================
// Round 2 — counterexamples from the other model family (all accepted), then the selectors.

test('CX1 concurrent partial treatments: overlap never proves the deferred were treated', () => {
  const b = book();
  const f = b.farrowed('A02', 10);
  const x = b.treat('A02', 'iron3', 8, { seen: [f.id], deferred: { n: 2, reason: 'weak' }, device: 'p1' });
  const y = b.treat('A02', 'iron3', 8, { seen: [f.id], deferred: { n: 2, reason: 'weak' }, device: 'p2' });
  const d = run(b, IRON_ONLY);
  const D = d.litters.A02.doses.iron3;
  assert.equal(D.owed, 2);
  assert.equal(D.done, false);
  assert.deepEqual(D.possibleDoubleTreatment, [[x.id, y.id]]);
});

test('CX2 carried evidence dies with its identified carrier; owed never shrinks with the population', () => {
  const b = book();
  b.farrowed('S', 5); b.treat('S', 'iron3', 5);
  b.identity('S', 'add', { rowId: 'c1', tag: '500001' });
  b.farrowed('R', 9);
  b.move('S', 'R', 1, { rows: ['c1'] });
  let D = run(b, IRON_ONLY).litters.R.doses.iron3;
  assert.equal(D.owed, 9);
  assert.equal(D.carriedFromMove, 1);
  b.death('R', [{ cause: 'crushed', rowId: 'c1' }]);
  D = run(b, IRON_ONLY).litters.R.doses.iron3;
  assert.equal(D.carriedFromMove, 0);                        // evidence retired with its carrier
  assert.equal(D.owed, 9);                                   // the 9 untreated are still owed
});

test('CX2b unidentified carrier: an unidentified death keeps the untreated owed (over-owe, never under)', () => {
  const b = book();
  b.farrowed('S', 5); b.treat('S', 'iron3', 5);
  b.farrowed('R', 9);
  b.move('S', 'R', 1);
  b.death('R', [{ cause: 'crushed', n: 1 }]);
  const L = run(b, IRON_ONLY).litters.R, D = L.doses.iron3;
  assert.equal(L.alive, 9);
  assert.equal(D.owed, 9);
  assert.ok(D.carriedFromMove <= L.alive);
});

test('CX3 explaining G1 does not touch G2', () => {
  const b = book();
  b.farrowed('S', 10); b.farrowed('R', 9); b.treat('R', 'iron3', 9);
  const loss = b.count('S', 9);
  const g1 = b.count('R', 10);
  b.move('S', 'R', 1, { explains: [loss.id, g1.id] });       // S had done nothing: G1's stray owes
  const g2 = b.count('R', 11);                                // G2: its own line
  const L = run(b, IRON_ONLY).litters.R;
  assert.equal(L.doses.iron3.owed, 1);
  assert.equal(L.doses.iron3.unknownAfterMove, 0);
  assert.deepEqual(L.unexplained.gains.map((x) => [x.id, x.open]), [[g1.id, 0], [g2.id, 1]]);
});

test('CX3b explained gain into an unrecorded receiver from a done source owes one, not two', () => {
  const b = book();
  b.farrowed('S', 10); b.farrowed('R', 1);
  b.treat('S', 'iron3', 10);                                  // done before its count found one missing
  const loss = b.count('S', 9);
  const g = b.count('R', 2);
  b.move('S', 'R', 1, { explains: [loss.id, g.id] });
  const D = run(b, IRON_ONLY).litters.R.doses.iron3;
  assert.equal(D.owed, 1);
  assert.equal(D.carriedFromMove, 1);
});

test('CX4 births after a pre-lock mark re-open owed for the new heads', () => {
  const b = book();
  b.farrowed('B08', 10, {}, { locked: false });
  b.treat('B08', 'iron3', 10, { at: on(0, '10:00') });
  b.farrowed('B08', 11, {}, { locked: false, at: on(0, '11:00') });
  const D = run(b, IRON_ONLY, 0).litters.B08.doses.iron3;
  assert.equal(D.owed, 1);
  assert.deepEqual(D.owedFrom, [{ kind: 'born_after_mark', n: 1 }]);
});

test('CX5 tap guard is decided in the writer\'s view before collisions', () => {
  const b = book();
  const f = b.farrowed('A02', 12);
  const t1 = b.treat('A02', 'iron3', 12);
  const t2 = b.treat('A02', 'iron3', 12, { seen: [f.id] });
  const t3 = b.treat('A02', 'iron3', 12, { seen: [f.id, t1.id] });
  const d = run(b, IRON_ONLY);
  assert.equal(rejectedReason(d, t3), 'nothing_owed');
  assert.deepEqual(d.litters.A02.doses.iron3.possibleDoubleTreatment, [[t1.id, t2.id]]);
});

test('CX6 an invalid correction is rejected and the previous record kept; dependents surface', () => {
  const b = book();
  b.farrowed('A02', 12);
  const t = b.treat('A02', 'iron3', 12);
  const c = b.correction(t.id, { set: { n: 50 } });
  const d = run(b, IRON_ONLY);
  assert.equal(rejectedReason(d, c), 'correction_invalid');
  assert.equal(d.litters.A02.doses.iron3.records[0].n, 12);
  assert.equal(d.litters.A02.doses.iron3.records[0].corrected, false);
  // a correction that would drop a later record is refused and names it (S8 review 1: gated on the whole log)
  const r = append(b.ev, { id: 'v1', type: 'correction', target: 'e1', void: true }, IRON_ONLY, TODAY(3));
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'changes_later');
  assert.deepEqual(r.detail.records.map((x) => x.id), [t.id]);
});

test('CX7 loss allocations aggregate by loss id; one missing piglet is consumed once', () => {
  const b = book();
  b.farrowed('B14', 10);
  const c = b.count('B14', 9);
  const dd = b.death('B14', [{ cause: 'crushed', n: 2 }], { lossAlloc: [{ lossId: c.id, qty: 1 }, { lossId: c.id, qty: 1 }] });
  const d = run(b, IRON_ONLY);
  const L = d.litters.B14;
  assert.equal(L.unexplained.openLoss, 0);
  assert.equal(L.alive, 9);                                  // one from the loss; the second allocation is held for review
  assert.equal(L.held[0].n, 1);
  assert.deepEqual(d.flags.map((g) => [g.reason, g.events[0]]), [['held_body', dd.id]]);
  const bad = b.death('B14', [{ cause: 'crushed', n: 1 }], { lossAlloc: [{ lossId: c.id, qty: -1 }] });
  assert.equal(rejectedReason(run(b, IRON_ONLY), bad), 'bad_numbers');
});

test('CX8 identity conservation: rows name who leaves a fully identified litter', () => {
  const b = book();
  b.farrowed('T1', 2); b.farrowed('T2', 5);
  b.identity('T1', 'add', { rowId: 'r1', tag: '1' });
  b.identity('T1', 'add', { rowId: 'r2', tag: '2' });
  const dup = b.move('T1', 'T2', 2, { rows: ['r1', 'r1'] });
  const mv = b.move('T1', 'T2', 1);
  const wn = b.weaned('T1', { n: 1 });
  const dt = b.death('T1', [{ cause: 'crushed', n: 1 }]);
  const ct = b.count('T1', 1);
  const d = run(b, IRON_ONLY);
  assert.equal(rejectedReason(d, dup), 'duplicate_row');
  assert.equal(rejectedReason(d, mv), 'name_the_rows');
  assert.equal(rejectedReason(d, wn), 'name_the_rows');
  assert.equal(rejectedReason(d, dt), 'name_the_rows');
  assert.equal(rejectedReason(d, ct), 'name_the_rows');
  // a count that names the missing piglet: the row is missing, and a body found later draws from that loss
  b.count('T1', 1, { missingRows: ['r1'] });
  b.death('T1', [{ cause: 'crushed', rowId: 'r1' }]);
  const L = run(b, IRON_ONLY).litters.T1;
  assert.equal(L.alive, 1);
  assert.equal(L.unexplained.openLoss, 0);
  assert.equal(L.identity.liveRows, 1);
  assert.equal(L.identity.rows.find((r) => r.rowId === 'r1').status, 'dead');
  assert.ok(balances(L));
});

test('CX9 row custody: an identity op naming the wrong litter is refused', () => {
  const b = book();
  b.farrowed('B09', 3); b.farrowed('B02', 3);
  b.identity('B09', 'add', { rowId: 'r1', tag: '9' });
  b.move('B09', 'B02', 1, { rows: ['r1'] });
  const stale = b.identity('B09', 'edit', { rowId: 'r1', set: { weight: 1.2 } });
  const d = run(b, IRON_ONLY);
  assert.equal(rejectedReason(d, stale), 'row_in_other_litter');
  assert.equal(d.rejected.find((x) => x.id === stale.id).detail.litter, 'B02');
});

test('CX10 unknown arrivals resolved by recording the dose on them', () => {
  const b = book();
  b.farrowed('S', 10); b.treat('S', 'iron3', 7, { deferred: { n: 3, reason: 'weak' } });
  b.farrowed('R', 8); b.treat('R', 'iron3', 8);
  b.move('S', 'R', 2, { answers: { iron3: 'unknown' } });
  b.treat('R', 'iron3', 2, { target: 'unknown' });
  const D = run(b, IRON_ONLY).litters.R.doses.iron3;
  assert.equal(D.unknownAfterMove, 0);
  assert.equal(D.treated, 10);
  assert.equal(D.owed, 0);
  const over = b.treat('R', 'iron3', 1, { target: 'unknown' });
  assert.equal(rejectedReason(run(b, IRON_ONLY), over), 'more_than_unknown');
});

test('CX11 task context: no task, task ended; other records keep their permissions', () => {
  const cfg = Object.assign({}, IRON_ONLY, { task: { id: 'T', litters: ['A02'], ended: { at: on(5, '12:00'), who: 'G.H' } } });
  const b = book();
  b.farrowed('A02', 12); b.farrowed('E01', 7);
  const nt = b.treat('E01', 'iron3', 7);
  const ok = b.treat('A02', 'iron3', 12, { at: on(3) });
  const late = b.treat('A02', 'iron3', 1, { at: on(6), target: 'unknown' });
  const dt = b.death('A02', [{ cause: 'crushed', n: 1 }], { at: on(6) });
  const id = b.identity('A02', 'add', { rowId: 'r1', notch: '1-1', at: on(6) });
  const co = b.correction(ok.id, { set: { n: 10, deferred: { n: 2, reason: 'weak' } }, at: on(6) });
  const after = b.treat('A02', 'iron3', 2, { at: on(6) });
  const d = run(b, cfg, 6);
  assert.equal(rejectedReason(d, nt), 'no_task');
  assert.equal(rejectedReason(d, after), 'task_ended');
  assert.equal(rejectedReason(d, late), 'task_ended');
  for (const e of [ok, dt, id, co]) assert.equal(rejectedReason(d, e), undefined);
  assert.equal(d.litters.A02.doses.iron3.owed, 2);
});

// ---- selectors ------------------------------------------------------------------------------

function roomBook() {
  const b = book();
  const cfg = { doses: CONFIG.doses, identity: { scheme: 'none' }, task: { id: 'T', litters: ['A02', 'A05', 'B04', 'C02', 'C04'] } };
  const bd = (d) => on(d).slice(0, 10);
  b.farrowed('A02', 12, {}, { birthDate: bd(0) });            // day 3, nothing done; a count leaves 1 missing
  b.farrowed('A05', 11, {}, { birthDate: bd(0) });            // day 3, every day-3 dose recorded today
  for (const x of ['iron3', 'teeth', 'cocci']) b.treat('A05', x, 11);
  b.castrate('A05', { castrated: 5 });
  b.farrowed('B04', 10, {}, { birthDate: bd(-6) });           // day 9: iron3 late, teeth/cocci missed, castrated late
  b.castrate('B04', { castrated: 4 });
  b.farrowed('C02', 14, {}, { birthDate: bd(2) });            // day 1: nothing due
  b.farrowed('C04', 9, {}, { birthDate: bd(0) });             // day 3, all day-3 doses recorded early (day 2)
  for (const x of ['iron3', 'teeth', 'cocci']) b.treat('C04', x, 9, { at: on(2) });
  b.castrate('C04', { castrated: 4 }, { at: on(2) });
  b.farrowed('E01', 7, {}, { birthDate: bd(1) });             // not in the task
  b.count('A02', 11);
  return { b, cfg };
}

test('select.room: lenses partition by the room glossary; rows, lead, strip', () => {
  const { b, cfg } = roomBook();
  const d = derive(b.ev, cfg, TODAY(3));
  const owed = select.room(d, { lens: 'owed' });
  assert.deepEqual(owed.counts, { owed: 2, done: 1, later: 2, all: 6 });
  assert.deepEqual(owed.rows.map((r) => r.litter), ['B04', 'A02']);   // the late one walks first
  const a02 = owed.rows.find((r) => r.litter === 'A02');
  assert.deepEqual(a02.doses.map((x) => x.dose), ['iron3', 'teeth', 'castrate', 'cocci']);
  assert.equal(a02.doses[0].n, 11);
  assert.equal(a02.doses.find((x) => x.dose === 'castrate').n, null);   // males unknown before the first record
  assert.equal(a02.loss, 1);
  const b04 = owed.rows.find((r) => r.litter === 'B04');
  assert.equal(b04.lateBy, 6);
  assert.deepEqual(b04.missed.map((x) => [x.dose, x.last]), [['teeth', 7], ['cocci', 7]]);
  assert.equal(owed.lead, 2);
  assert.deepEqual(select.room(d, { lens: 'owed', filter: ['teeth'] }).rows.map((r) => r.litter), ['A02']);
  assert.deepEqual(select.room(d, { lens: 'done' }).rows.map((r) => r.litter), ['A05']);
  const later = select.room(d, { lens: 'later' });
  assert.deepEqual(later.rows.map((r) => r.litter), ['C02', 'C04']);
  assert.deepEqual(later.rows[0].next, { inDays: 2, doses: ['iron3', 'teeth', 'castrate', 'cocci'] });
  assert.deepEqual(owed.strip, { openLoss: 1, openGain: 0, lossLitters: ['A02'], gainLitters: [], netDrift: -1, showNet: false });
  assert.equal(select.room(d, { lens: 'all' }).rows.find((r) => r.litter === 'E01').kind, 'none');
});

test('select.litter: owed today with one-tap, recorded, later; a treat draft', () => {
  const { b, cfg } = roomBook();
  const d = derive(b.ev, cfg, TODAY(3));
  const v = select.litter(d, 'B04', { drafts: { teeth: { n: 8 } } });
  assert.deepEqual(v.owed.map((x) => [x.dose, x.status, x.owed, x.oneTap]), [['iron3', 'late', 10, 10], ['teeth', 'missed', 10, 10], ['cocci', 'missed', 10, 10]]);
  assert.deepEqual(v.dosesLeft, { left: 1, total: 4 });              // missed doses are not treatments left (map provisional)…
  assert.deepEqual(v.unfinished, { n: 3, missed: 2 });              // …but they are unfinished (rulings round 3 check)
  assert.deepEqual(v.recorded.map((x) => x.dose), ['castrate']);
  assert.deepEqual(v.later.map((x) => [x.dose, x.inDays]), [['iron14', 5]]);
  assert.deepEqual(v.drafts.teeth, { owed: 10, treated: 8, notTreated: 2, why: 'reason_missing', event: null });
  const ok = select.litter(d, 'B04', { drafts: { teeth: { n: 8, deferred: { n: 2, reason: 'weak' } } } }).drafts.teeth;
  assert.equal(ok.why, null);
  assert.equal(ok.event.type, 'treat');
  assert.equal(append(b.ev, Object.assign({ id: 'z1', at: on(3) }, ok.event), cfg, TODAY(3)).ok, true);
});

test('select.deathDraft: caps, kMin/kMax, why', () => {
  const b = book();
  b.farrowed('B14', 4);
  b.identity('B14', 'add', { rowId: 'r1', tag: '1' });
  b.count('B14', 3);
  const dd0 = run(b, IRON_ONLY), L = 'B14';                   // alive 3, 1 row, loss 1 → unidentified 2
  let s = select.deathDraft(dd0, L, { tallies: { crushed: 3 } });
  assert.equal(s.cap, 3);
  assert.equal(s.kMin, 1);
  assert.equal(s.kMax, 1);
  assert.equal(s.why, 'missing');
  s = select.deathDraft(dd0, L, { tallies: { crushed: 3 }, k: 1 });
  assert.equal(s.why, null);
  assert.deepEqual(s.event.lines, [{ cause: 'crushed', n: 3 }]);
  assert.equal(s.event.fromMissing, 1);
  assert.equal(append(b.ev, Object.assign({ id: 'z1' }, s.event), IRON_ONLY, TODAY(3)).ok, true);
  assert.equal(select.deathDraft(dd0, L, { picks: { r1: null } }).why, 'cause_one');
  assert.equal(select.deathDraft(dd0, L, {}).why, 'empty');
  assert.equal(select.deathDraft(dd0, L, { tallies: { crushed: 4 }, k: 1 }).why, 'over_cap');
});

test('select.moveDraft: clamp, carry preview, pairing deltas', () => {
  const b = book();
  b.farrowed('B09', 10); b.treat('B09', 'iron3', 7, { deferred: { n: 3, reason: 'weak' } });
  b.farrowed('B02', 8); b.treat('B02', 'iron3', 8);
  const d = run(b, IRON_ONLY);
  const m = select.moveDraft(d, { from: 'B09', to: 'B02', n: 40 });
  assert.equal(m.n, 10);
  assert.deepEqual(m.delta, { from: [10, 0], to: [8, 18] });
  assert.deepEqual(m.asks, ['iron3']);
  assert.equal(m.carry.iron3, 'unknown');
  assert.deepEqual(m.sourceAfter, []);                            // every piglet left: the source closes (R1-19)
  const three = select.moveDraft(d, { from: 'B09', to: 'B02', n: 3, answers: { iron3: 'unknown' } });
  assert.deepEqual(three.sourceAfter, [{ dose: 'iron3', lo: 0, hi: 3, of: 7, owedBefore: 3 }]);   // the ledger's own range (R1-3)
  const one = select.moveDraft(d, { from: 'B09', to: 'B02', n: 1, answers: { iron3: 'yes' } });
  assert.equal(one.carry.iron3, 'done');
  assert.deepEqual(one.sourceAfter, []);
  assert.equal(one.why, null);
  assert.equal(append(b.ev, Object.assign({ id: 'z1' }, one.event), IRON_ONLY, TODAY(3)).ok, true);
  // pairing: an explaining move changes neither side's Alive
  const l = b.count('B09', 9), g = b.count('B02', 9);
  const p = select.moveDraft(run(b, IRON_ONLY), { from: 'B09', to: 'B02', n: 1, explains: [l.id, g.id] });
  assert.deepEqual(p.delta, { from: [9, 9], to: [9, 9] });
});

test('select.end: unfinished litters (not-yet-due-only apart, R2-26) and piglet-doses (incl. not yet due), on-time KPI', () => {
  const { b, cfg } = roomBook();
  const d = derive(b.ev, cfg, TODAY(3));
  const e = select.end(d);
  assert.deepEqual(e.now.unfinishedLitters.slice().sort(), ['A02', 'B04']);
  assert.deepEqual(e.now.notYetDueOnly.slice().sort(), ['A05', 'C02', 'C04']);
  assert.deepEqual(e.now.byLitter.A05.map((x) => [x.dose, x.kind, x.n]), [['iron14', 'not_due', 11]]);
  // treatments: A05 ×4 on time, C04 ×4 early (on time); B04 iron3 late-owed, castration late, teeth/cocci missed;
  // A02 due today unrecorded and everything not yet due are left out
  assert.deepEqual(e.now.onTime, { n: 8, k: 12 });
});

// ---- property, strengthened -----------------------------------------------------------------

test('property: raw identity rows never exceed alive; coverage never exceeds its carriers', () => {
  const LITTERS = ['P1', 'P2', 'P3'];
  for (let seed = 101; seed <= 140; seed++) {
    const r = rng(seed);
    const pick = (a) => a[Math.floor(r() * a.length)];
    const int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    const b = book();
    for (const l of LITTERS) { const n0 = int(3, 8); b.farrowed(l, n0); if (r() < 0.5) b.treat(l, 'iron3', n0); }
    let rowN = 0;
    for (let step = 0; step < 40; step++) {
      const d0 = run(b, IRON_ONLY);
      const l = pick(LITTERS), m = pick(LITTERS.filter((x) => x !== l));
      const L = d0.litters[l];
      if (!L || !d0.litters[m]) continue;
      const o = r() < 0.3 ? { seen: b.ev.slice(0, int(1, b.ev.length)).map((e) => e.id) } : {};
      const rows = L.identity.rows.filter((x) => x.litter === l && x.status === 'alive').map((x) => x.rowId);
      const k = pick(['id', 'id', 'moveRows', 'move', 'rowDeath', 'death', 'count', 'countNamed', 'wean', 'treat', 'check', 'unknownTreat']);
      if (k === 'id') b.identity(l, 'add', Object.assign({ rowId: 'x' + (++rowN), tag: String(rowN) }, o));
      if (k === 'moveRows' && rows.length) b.move(l, m, undefined, Object.assign({ rows: rows.slice(0, int(1, rows.length)), answers: { iron3: pick(['yes', 'no', 'unknown']) } }, o));
      if (k === 'move') b.move(l, m, int(1, 2), Object.assign({ answers: { iron3: pick(['yes', 'no', 'unknown']) } }, o));
      if (k === 'rowDeath' && rows.length) b.death(l, [{ cause: 'crushed', rowId: pick(rows) }], o);
      if (k === 'death') b.death(l, [{ cause: 'crushed', n: 1 }], o);
      if (k === 'count') b.count(l, Math.max(0, L.alive + int(-1, 1)), o);
      if (k === 'countNamed' && rows.length) b.count(l, L.alive - 1, Object.assign({ missingRows: [pick(rows)] }, o));
      if (k === 'wean') b.weaned(l, Object.assign({ n: int(1, 2), rows: rows.slice(0, 1) }, o));
      if (k === 'treat') b.treat(l, 'iron3', L.doses.iron3.owed || 1, o);
      if (k === 'check') b.check(l, 'iron3', int(0, 1), int(0, 1), o);
      if (k === 'unknownTreat') b.treat(l, 'iron3', 1, Object.assign({ target: 'unknown' }, o));
      const d = run(b, IRON_ONLY);
      for (const X of Object.values(d.litters)) {
        const tag = `seed ${seed} step ${step} ${k} ${X.id}`;
        assert.ok(balances(X), tag + ' balances');
        const live = X.identity.rows.filter((x) => x.litter === X.id && x.status === 'alive').length;
        assert.equal(X.identity.liveRows, live, tag);
        assert.ok(live <= X.alive || X.flags.some((g) => g.reason === 'identity_reconcile'), tag + ': raw rows ≤ alive unless an offline conflict is open');
        assert.equal(X.identity.conflict, Math.max(0, live - X.alive), tag);
        const D = X.doses.iron3;
        assert.ok(D.carriedFromMove <= X.alive, tag + ': coverage ≤ alive');
        assert.ok((D.owed || 0) + D.unknownAfterMove + D.carriedFromMove <= X.alive, tag + ': owed, unknown and carried are exclusive');
        assert.ok(D.unknownAfterMove <= X.alive, tag + ': unknown ≤ alive');
        assert.ok(D.owed === null || D.owed <= X.alive);
        for (const g of D.coverage) {
          if (!g.rows) continue;
          assert.ok(g.rows.length >= g.n, tag + ': an identified group counts only its rows');
          for (const id of g.rows) assert.ok(X.identity.rows.find((x) => x.rowId === id && x.litter === X.id && x.status === 'alive'), tag + ': carrier rows alive here');
        }
      }
    }
  }
});

// ---- End task, from the map's provisional ledger ---------------------------------------------

const TASKED = (litters) => Object.assign({}, IRON_ONLY, { task: { id: 'T', litters } });

test('END-a a mark stamped before End but applied after it is accepted, flagged arrived_after_end', () => {
  const b = book();
  const f = b.farrowed('A02', 12);
  const end = b.ev.push({ id: 'end', type: 'end_task', at: on(5, '12:00'), who: 'G.H' }) && b.ev[b.ev.length - 1];
  const before = b.treat('A02', 'iron3', 12, { at: on(5, '09:00'), seen: [f.id] });   // offline, synced after End
  const afterStamp = b.treat('A02', 'iron3', 12, { at: on(5, '13:00'), seen: [f.id] });
  const d = run(b, TASKED(['A02']), 5);
  assert.equal(rejectedReason(d, before), undefined);
  // done after End on a phone that had not seen End: kept, stamped, flagged — never counted (RULINGS round 3)
  assert.equal(rejectedReason(d, afterStamp), undefined);
  assert.equal(d.litters.A02.doses.iron3.treated, 12);
  assert.deepEqual(d.litters.A02.doses.iron3.afterEnd.map((x) => x.id), [afterStamp.id]);
  assert.deepEqual(d.flags.filter((g) => g.kind === 'task').map((g) => [g.reason, g.events[0]]), [['arrived_after_end', before.id], ['after_end', afterStamp.id]]);
  assert.equal(d.ended.event, end.id);
});

test('END-b a correction after End voids a wrong-litter mark and carries the fresh mark for the right litter', () => {
  const b = book();
  b.farrowed('A02', 12); b.farrowed('A05', 11);
  const wrong = b.treat('A02', 'iron3', 12, { at: on(3) });
  b.ev.push({ id: 'end', type: 'end_task', at: on(5, '12:00'), who: 'G.H' });
  const c = b.correction(wrong.id, { void: true, fresh: { litter: 'A05', dose: 'iron3', n: 11 }, at: on(6) });
  const d = run(b, TASKED(['A02', 'A05']), 6);
  assert.equal(rejectedReason(d, c), undefined);
  assert.equal(d.litters.A02.doses.iron3.owed, 0);                 // S8 review 2: not owed after End…
  assert.equal(d.litters.A02.doses.iron3.notDoneAfterEnd, 12);     // …a fact: not done · corrected after End
  assert.equal(d.litters.A05.doses.iron3.owed, 0);
  assert.equal(d.litters.A05.doses.iron3.records[0].viaCorrection, c.id);
  assert.deepEqual(d.flags.filter((g) => g.kind === 'task').map((g) => g.reason), ['correction_after_end']);
  // a fresh mark that cannot stand makes the whole correction invalid (withdrawing twice is refused
  // as already_withdrawn since S8 review 1, so the bad one corrects the fresh mark itself)
  const bad = b.correction(c.id + ':fresh', { set: { n: 99 }, at: on(6) });
  const d2 = run(b, TASKED(['A02', 'A05']), 6);
  assert.equal(rejectedReason(d2, bad), 'correction_invalid');
});

test('END-c piglets moved out after End reduce the ended task\'s not-done; arrivals after End stay not done (RULINGS round 3)', () => {
  const b = book();
  b.farrowed('A02', 12); b.farrowed('A05', 11); b.farrowed('X', 6);
  b.treat('A05', 'iron3', 11);
  b.ev.push({ id: 'end', type: 'end_task', at: on(3, '12:00'), who: 'G.H' });
  const out = b.move('A02', 'X', 2, { at: on(3, '13:00') });
  b.move('X', 'A05', 1, { at: on(3, '13:05') });
  let d = run(b, TASKED(['A02', 'A05']), 3);
  assert.deepEqual(d.litters.A02.movedOutAfterEnd, [{ move: out.id, n: 2, to: 'X', owed: { iron3: 2 } }]);
  const e = select.end(d);
  assert.deepEqual(e.now.byLitter.A02, [{ dose: 'iron3', kind: 'owed', n: 10 }]);
  assert.equal(d.litters.A05.doses.iron3.owed, 1);            // not done: never recordable as catch-up
  assert.equal(d.litters.A05.doses.iron3.catchUp, undefined);
  assert.deepEqual(e.now.byLitter.A05, [{ dose: 'iron3', kind: 'owed', n: 1 }]);
  const late = b.treat('A05', 'iron3', 1, { at: on(3, '14:00') });
  d = run(b, TASKED(['A02', 'A05']), 3);
  assert.equal(rejectedReason(d, late), 'task_ended');
});

// =============================================================================================
// Round 3 — the second attack (all accepted but catch-up, which stays provisional).

function twoOrders(build) {
  // build(b, f, first) returns the ids; the two concurrent records are appended in both orders
  const out = [];
  for (const order of [0, 1]) {
    const b = book();
    const f = b.farrowed('A02', 10);
    const recs = build(f);
    for (const r of order ? recs.slice().reverse() : recs) b.treat('A02', 'iron3', r.n, Object.assign({ seen: [f.id] }, r.o));
    out.push(run(b, IRON_ONLY).litters.A02.doses.iron3);
  }
  return out;
}

test('R3-1 unequal concurrent records give the same outstanding reading in either replay order', () => {
  const [ab, ba] = twoOrders(() => [{ n: 2, o: { deferred: { n: 8, reason: 'weak' } } }, { n: 8, o: { deferred: { n: 2, reason: 'weak' } } }]);
  assert.equal(ab.owed, 2);
  assert.equal(ba.owed, 2);
  assert.equal(ab.possibleDoubleTreatment.length, 1);
  const [fp, pf] = twoOrders(() => [{ n: 10, o: {} }, { n: 8, o: { deferred: { n: 2, reason: 'weak' } } }]);
  assert.equal(fp.owed, 0);
  assert.equal(pf.owed, 0);
});

test('R3-1b a catch-up that saw both concurrent records starts from their reconciled reading', () => {
  const b = book();
  const f = b.farrowed('A02', 10);
  const a = b.treat('A02', 'iron3', 2, { seen: [f.id], deferred: { n: 8, reason: 'weak' } });
  const c = b.treat('A02', 'iron3', 8, { seen: [f.id], deferred: { n: 2, reason: 'weak' } });
  const catchUp = b.treat('A02', 'iron3', 2, { seen: [f.id, a.id, c.id] });
  const d = run(b, IRON_ONLY);
  assert.equal(rejectedReason(d, catchUp), undefined);
  assert.equal(d.litters.A02.doses.iron3.owed, 0);
});

test('R3-2 unknown-target records collide like any treatment', () => {
  const b = book();
  b.farrowed('S', 10); b.treat('S', 'iron3', 7, { deferred: { n: 3, reason: 'weak' } });
  b.farrowed('R', 8); b.treat('R', 'iron3', 8);
  const m = b.move('S', 'R', 1, { answers: { iron3: 'unknown' } });
  const heads = b.ev.map((e) => e.id);
  const p1 = b.treat('R', 'iron3', 1, { target: 'unknown', seen: heads });
  const p2 = b.treat('R', 'iron3', 1, { target: 'unknown', seen: heads });
  const d = run(b, IRON_ONLY);
  assert.equal(rejectedReason(d, p2), undefined);
  const D = d.litters.R.doses.iron3;
  assert.equal(D.unknownAfterMove, 0);
  assert.deepEqual(D.possibleDoubleTreatment, [[p1.id, p2.id]]);
  assert.ok(m);
});

test('R3-3 explaining an old gain never erases another piglet\'s confirmed deferral', () => {
  const b = book();
  b.farrowed('S', 10); b.farrowed('R', 9);
  const loss = b.count('S', 9);
  const g = b.count('R', 10);                                 // before any record: the stray owes
  b.treat('R', 'iron3', 9, { deferred: { n: 1, reason: 'weak' } });
  b.move('S', 'R', 1, { explains: [loss.id, g.id], answers: { iron3: 'yes' } });
  const D = run(b, IRON_ONLY).litters.R.doses.iron3;
  assert.equal(D.owed, 1);                                    // the weak one is still owed
  assert.equal(D.deferred, 1);
});

test('R3-4 unknown groups carried by named rows retire and travel with the row', () => {
  const b = book();
  b.farrowed('S', 10); b.treat('S', 'iron3', 7, { deferred: { n: 3, reason: 'weak' } });
  b.identity('S', 'add', { rowId: 'r1', tag: '1' });
  b.identity('S', 'add', { rowId: 'r2', tag: '2' });
  b.farrowed('R', 8); b.treat('R', 'iron3', 8);
  b.farrowed('T', 5); b.treat('T', 'iron3', 5);
  b.move('S', 'R', undefined, { rows: ['r1', 'r2'], answers: { iron3: 'unknown' } });
  assert.equal(run(b, IRON_ONLY).litters.R.doses.iron3.unknownAfterMove, 2);
  b.death('R', [{ cause: 'crushed', rowId: 'r1' }]);
  let d = run(b, IRON_ONLY);
  assert.equal(d.litters.R.doses.iron3.unknownAfterMove, 1);
  b.move('R', 'T', undefined, { rows: ['r2'], answers: { iron3: 'unknown' } });
  d = run(b, IRON_ONLY);
  assert.equal(d.litters.R.doses.iron3.unknownAfterMove, 0);
  assert.equal(d.litters.T.doses.iron3.unknownAfterMove, 1);
  assert.deepEqual(d.litters.T.doses.iron3.unknownGroups[0].rows, ['r2']);
});

test('R3-5 a debt whose population is gone does not re-attach to unrelated arrivals', () => {
  const b = book();
  b.farrowed('A', 10); b.treat('A', 'iron3', 8, { deferred: { n: 2, reason: 'weak' } });
  b.death('A', [{ cause: 'scours', n: 10 }]);
  b.farrowed('S', 6); b.treat('S', 'iron3', 6);
  b.move('S', 'A', 3);
  const D = run(b, IRON_ONLY).litters.A.doses.iron3;
  assert.equal(D.owed, 0);
  assert.equal(D.carriedFromMove, 3);
});

test('R3-6 outstanding populations are exclusive: owed + unknown never exceed alive', () => {
  const b = book();
  b.farrowed('S', 10); b.treat('S', 'iron3', 7, { deferred: { n: 3, reason: 'weak' } });
  b.farrowed('R', 10);                                        // unrecorded: all 10 owe
  b.move('S', 'R', 2, { answers: { iron3: 'unknown' } });     // 12 alive: 10 owed + 2 unknown
  b.death('R', [{ cause: 'crushed', n: 3 }]);                 // 9 alive
  const d = run(b, Object.assign({}, IRON_ONLY, { task: { id: 'T', litters: ['R'] } }));
  const D = d.litters.R.doses.iron3;
  assert.ok(D.owed + D.unknownAfterMove <= d.litters.R.alive);
  const e = select.end(d);
  assert.ok(e.now.unfinishedPigletDoses <= d.litters.R.alive);
});

test('R3-7 a mixed death (named missing row + fromMissing) reserves each named loss once', () => {
  const b = book();
  b.farrowed('T1', 4);
  b.identity('T1', 'add', { rowId: 'r1', tag: '1' });
  b.count('T1', 2, { missingRows: ['r1'] });                  // loss 2: r1 named + 1 unnamed
  b.death('T1', [{ cause: 'crushed', rowId: 'r1' }, { cause: 'crushed', n: 1 }], { fromMissing: 1 });
  const d = run(b, IRON_ONLY);
  assert.equal(d.litters.T1.alive, 2);
  assert.equal(d.litters.T1.unexplained.openLoss, 0);
  assert.deepEqual(d.flags, []);
});

test('R3-8 an explaining Move cannot spend a named missing piglet\'s loss without moving that row', () => {
  const b = book();
  b.farrowed('T1', 3); b.farrowed('T2', 3);
  b.identity('T1', 'add', { rowId: 'r1', tag: '1' });
  const loss = b.count('T1', 2, { missingRows: ['r1'] });
  b.move('T1', 'T2', 1, { explains: [loss.id, null] });       // untagged: the loss stays open for r1
  let d = run(b, IRON_ONLY);
  assert.equal(d.litters.T1.unexplained.openLoss, 1);
  assert.equal(d.litters.T1.alive, 1);
  assert.equal(d.litters.T1.identity.rows.find((r) => r.rowId === 'r1').status, 'missing');
  b.move('T1', 'T2', 1, { rows: ['r1'], explains: [loss.id, null] });
  d = run(b, IRON_ONLY);
  assert.equal(d.litters.T1.unexplained.openLoss, 0);
  assert.equal(d.litters.T2.identity.rows.find((r) => r.rowId === 'r1').status, 'alive');
  assert.ok(balances(d.litters.T1) && balances(d.litters.T2));
});

test('R3-9 an offline count that could not name rows is kept and raises identity_reconcile', () => {
  const b = book();
  const f = b.farrowed('T1', 2);
  b.identity('T1', 'add', { rowId: 'r1', tag: '1' });
  b.identity('T1', 'add', { rowId: 'r2', tag: '2' });
  const c = b.count('T1', 1, { seen: [f.id] });
  const d = run(b, IRON_ONLY);
  assert.equal(rejectedReason(d, c), undefined);
  assert.equal(d.litters.T1.alive, 1);
  assert.equal(d.litters.T1.identity.conflict, 1);
  assert.deepEqual(d.flags.map((g) => g.reason), ['identity_reconcile']);
  const online = b.count('T1', 0);
  assert.equal(rejectedReason(run(b, IRON_ONLY), online), 'name_the_rows');
});

test('R3-10 selectors run the same validation and effects as append', () => {
  const cfg = Object.assign({}, IRON_ONLY, { task: { id: 'T', litters: ['A02'] } });
  const b = book();
  b.farrowed('A02', 12); b.farrowed('T2', 4);
  b.identity('T2', 'add', { rowId: 'r1', tag: '1' });
  b.ev.push({ id: 'end', type: 'end_task', at: on(3, '12:00') });
  const d = derive(b.ev, cfg, TODAY(3));
  const lit = select.litter(d, 'A02', { drafts: { iron3: { n: 12 } }, stamp: { at: on(3, '13:00') } });
  assert.equal(lit.drafts.iron3.why, 'task_ended');
  assert.equal(lit.drafts.iron3.event, null);
  const mv = select.moveDraft(d, { from: 'T2', to: 'A02', n: 4 });
  assert.equal(mv.why, 'name_the_rows');
  const dd = select.deathDraft(d, 'T2', { tallies: { crushed: 4 } });
  assert.equal(dd.why, 'over_cap');
  const ok = select.deathDraft(d, 'T2', { tallies: { crushed: 3 } });
  assert.equal(ok.why, null);
  assert.equal(ok.after.alive, 1);                             // the effect, from the same replay append runs
});

test('R3-11 a writer that saw End is after End whatever its clock says', () => {
  const b = book();
  const f = b.farrowed('A02', 12);
  const end = { id: 'end', type: 'end_task', at: on(5, '12:00') };
  b.ev.push(end);
  const t = b.treat('A02', 'iron3', 12, { at: on(5, '09:00'), seen: [f.id, end.id] });
  const d = run(b, TASKED(['A02']), 5);
  assert.equal(rejectedReason(d, t), 'task_ended');
});

test('R3-12 End waits for the batch\'s farrowing task', () => {
  const cfg = Object.assign({}, IRON_ONLY, { task: { id: 'T', litters: ['A02'], farrowingTask: 'open' } });
  const b = book();
  b.farrowed('A02', 12);
  const e1 = { id: 'end1', type: 'end_task', at: on(5) };
  b.ev.push(e1);
  assert.equal(rejectedReason(run(b, cfg, 5), e1), 'farrowing_task_open');
  b.ev.push({ id: 'ft', type: 'farrowing_task_ended', at: on(5, '10:00') });
  const e2 = { id: 'end2', type: 'end_task', at: on(5, '11:00') };
  b.ev.push(e2);
  const d = run(b, cfg, 5);
  assert.equal(rejectedReason(d, e2), undefined);
  assert.equal(d.ended.event, 'end2');
});

test('R3-13 End snapshots the closure figures; select.end gives atEnd and now', () => {
  const b = book();
  b.farrowed('A02', 12); b.farrowed('A05', 11);
  const wrong = b.treat('A02', 'iron3', 12, { at: on(3) });
  b.ev.push({ id: 'end', type: 'end_task', at: on(5, '12:00'), who: 'G.H' });
  b.correction(wrong.id, { void: true, fresh: { litter: 'A05', dose: 'iron3', n: 11 }, at: on(6) });
  const cfg = { doses: IRON_ONLY.doses, identity: { scheme: 'none' }, task: { id: 'T', litters: ['A02', 'A05'] } };
  const e = select.end(run(b, cfg, 6));
  assert.deepEqual(e.atEnd.unfinishedLitters, ['A05']);
  assert.deepEqual(e.now.unfinishedLitters, []);                  // S8 review 2: the withdrawn mark is not owed after End
  assert.deepEqual(e.now.correctedAfterEnd, [{ litter: 'A02', dose: 'iron3', n: 12 }]);
  assert.deepEqual(e.atEnd.onTime, { n: 1, k: 2 });
});

test('R3-14 on time only if owed and unknown both reached 0 by the due day', () => {
  const b = book();
  const bd = on(0).slice(0, 10);
  b.farrowed('S', 10, {}, { birthDate: bd }); b.treat('S', 'iron3', 7, { deferred: { n: 3, reason: 'weak' }, at: on(2) });
  b.farrowed('R', 8, {}, { birthDate: bd });
  b.move('S', 'R', 1, { answers: { iron3: 'unknown' }, at: on(2, '10:00') });
  b.treat('R', 'iron3', 8, { at: on(3) });
  b.check('R', 'iron3', 1, 0, { at: on(5) });
  const e = select.end(run(b, TASKED(['R']), 5));
  assert.deepEqual(e.now.onTime, { n: 0, k: 1 });
});

// ---- property: concurrent records reconcile to one reading in every replay order ----------------

test('property: concurrent records give the same owed in every permutation', () => {
  const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).map((p) => [x].concat(p))));
  for (let seed = 201; seed <= 260; seed++) {
    const r = rng(seed);
    const int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    const N = int(3, 12), k = int(2, 3);
    const recs = [];
    for (let i = 0; i < k; i++) { const n = int(0, N); recs.push({ n, def: N - n }); }
    const withDeath = r() < 0.5;
    const readings = new Set();
    for (const order of perms(recs.map((_, i) => i))) {
      const b = book();
      const f = b.farrowed('A02', N);
      if (withDeath) b.death('A02', [{ cause: 'crushed', n: 1 }], { seen: [f.id] });
      for (const i of order) {
        const x = recs[i];
        b.treat('A02', 'iron3', x.n, Object.assign({ seen: [f.id], device: 'p' + i }, x.def ? { deferred: { n: x.def, reason: 'weak' } } : {}));
      }
      const D = run(b, IRON_ONLY).litters.A02.doses.iron3;
      readings.add(D.owed + '/' + D.deferred);
    }
    assert.equal(readings.size, 1, `seed ${seed}: ${JSON.stringify(recs)} ${[...readings]}`);
  }
});

// ---- the Edit screen and the litter record (slice S8, ticket #12) ----------------------------

test('S8 edit: a lowered mark asks a reason, then Save is one stamped correction; the original is kept', () => {
  const b = book();
  b.farrowed('A02', 12);
  const t = b.treat('A02', 'iron3', 12);
  let d = run(b);
  let e = select.edit(d, 'A02', { marks: { [t.id]: { n: 10 } } }, { id: 'x1', who: 'L.M' });
  assert.equal(e.why, 'reason');
  assert.equal(e.events, null);
  e = select.edit(d, 'A02', { marks: { [t.id]: { n: 10, reason: 'weak' } } }, { id: 'x1', who: 'L.M' });
  assert.equal(e.why, null);
  assert.deepEqual(e.changes[0], { kind: 'mark', mark: t.id, dose: 'iron3', from: 12, to: 10, rest: 2, reason: 'weak', afterEnd: false });
  assert.equal(e.after.owed.iron3, 2);
  for (const ev of e.events) b.ev.push(Object.assign({ id: 'x1', who: 'L.M', at: on(3, '10:31') }, ev));
  d = run(b);
  assert.equal(d.litters.A02.doses.iron3.records[0].corrected, true);
  const rec = select.record(d, 'A02');
  const corr = rec.days[0].entries[0];
  assert.equal(corr.kind, 'correction');
  assert.equal(corr.changes[0].before.n, 12);
  assert.equal(corr.changes[0].after.n, 10);
  assert.deepEqual(rec.days[0].entries.find((x) => x.id === t.id).corrected.map((x) => x.id), ['x1']);
  assert.equal(rec.days[0].entries.find((x) => x.id === t.id).n, 12);      // the record as it was written
});

test('S8 edit: un-record and wrong litter are corrections, never deletions; the fresh record lands on the right litter', () => {
  const b = book();
  b.farrowed('A02', 12); b.farrowed('A04', 11);
  const t = b.treat('A02', 'teeth', 12);
  const d = run(b);
  let e = select.edit(d, 'A02', { marks: { [t.id]: { void: true } } }, { id: 'x1' });
  assert.equal(e.changes[0].kind, 'void');
  assert.equal(e.after.owed.teeth, 12);
  e = select.edit(d, 'A02', { marks: { [t.id]: { to: 'A04' } } }, { id: 'x2' });
  assert.deepEqual(e.events[0].changes[0].fresh, { litter: 'A04', dose: 'teeth', n: 11, at: t.at, who: t.who });
  assert.ok(e.targets('teeth').some((x) => x.litter === 'A04'));
  for (const ev of e.events) b.ev.push(Object.assign({ id: 'x2', who: 'G.H', at: on(3, '10:31') }, ev));
  const d2 = run(b);
  assert.equal(d2.litters.A02.doses.teeth.owed, 12);
  assert.equal(d2.litters.A04.doses.teeth.owed, 0);
  const there = select.record(d2, 'A04').days[0].entries[0];
  assert.equal(there.kind, 'correction');
  assert.equal(there.changes[0].kind, 'wrong');
  assert.equal(there.changes[0].here, false);
  assert.equal(select.record(d2, 'A02').days[0].entries[0].kind, 'correction');
});

test('S8 edit: identity rows edit and withdraw; a closed set reopens by voiding its close; a Move is corrected by id', () => {
  const cfg = { doses: [], identity: { scheme: 'tag', who: 'candidates' } };
  const b = book();
  b.farrowed('B06', 12); b.farrowed('B08', 9);
  b.identity('B06', 'add', { rowId: 'r1', tag: '271001', weight: 1.51 });
  b.identity('B06', 'add', { rowId: 'r2', tag: '271001' });
  b.identity('B06', 'close');
  const mv = b.move('B06', 'B08', 2);
  const d = run(b, cfg);
  const e = select.edit(d, 'B06', { rows: { r1: { set: { weight: 1.15 } }, r2: { withdraw: true } }, reopen: true, moves: { [mv.id]: { n: 1 } } }, { id: 'x' });
  assert.equal(e.why, null);
  assert.deepEqual(e.changes.map((c) => c.kind), ['move', 'row', 'withdraw', 'reopen']);
  assert.equal(e.after.alive, 11);
  for (const [i, ev] of e.events.entries()) b.ev.push(Object.assign({ id: 'x-' + (i + 1) }, ev));
  const L = run(b, cfg).litters.B06;
  assert.equal(L.identity.closed, false);
  assert.equal(L.identity.liveRows, 1);
  assert.equal(L.alive, 11);
  assert.equal(run(b, cfg).litters.B08.alive, 10);
});

// ---- S8 review round 1: corrections gated on the whole log, after End, wrong litter, one event --

const put = (b, ev, id, o = {}) => { const e = Object.assign({ id, at: on(3, '10:31'), who: 'G.H' }, ev, o); b.ev.push(e); return e; };

test('S8-1 a correction that would invalidate a later record is refused and names it; fixing both in one Save passes', () => {
  const b = book();
  b.farrowed('A02', 12);
  const t1 = b.treat('A02', 'iron3', 10, { deferred: { n: 2, reason: 'weak' } });
  const t2 = b.treat('A02', 'iron3', 2, { at: on(4) });                     // the follow-up for the 2 weak
  const d = run(b);
  let e = select.edit(d, 'A02', { marks: { [t1.id]: { n: 12 } } }, { id: 'x1' });
  assert.equal(e.why, 'changes_later');
  assert.deepEqual(e.later.map((x) => [x.id, x.reason]), [[t2.id, 'nothing_owed']]);
  assert.equal(e.after, null);                                              // never hides a dropped record
  e = select.edit(d, 'A02', { marks: { [t1.id]: { n: 12 }, [t2.id]: { void: true } } }, { id: 'x1' });
  assert.equal(e.why, null);
  assert.equal(e.events.length, 1);
  // written straight into the log, the ledger refuses it the same way
  const c = put(b, { type: 'correction', target: t1.id, set: { n: 12, deferred: null } }, 'x2');
  const r = run(b).rejected.find((x) => x.id === c.id);
  assert.equal(r.reason, 'changes_later');
  assert.equal(r.detail.records[0].id, t2.id);
});

test('S8-1b voiding a Move with deaths after it on the receiver is gated; Recorded by mistake voids both legs', () => {
  const b = book();
  b.farrowed('B06', 12); b.farrowed('B08', 9);
  const mv = b.move('B06', 'B08', 2);
  const d0 = run(b);
  let e = select.edit(d0, 'B06', { moves: { [mv.id]: { void: true } } }, { id: 'x' });
  assert.equal(e.why, null);
  assert.equal(e.after.alive, 12);
  b.death('B08', [{ cause: 'crushed', n: 11 }], { at: on(4) });
  e = select.edit(run(b), 'B06', { moves: { [mv.id]: { void: true } } }, { id: 'x' });
  assert.equal(e.why, 'changes_later');
  assert.equal(e.later[0].type, 'death');
});

test('S8-2 after End a mark can be lowered or withdrawn as a fact: not done · corrected after End, never owed, End frozen', () => {
  const b = book();
  b.farrowed('A02', 12);
  const t = b.treat('A02', 'iron3', 12, { at: on(3) });
  b.ev.push({ id: 'end', type: 'end_task', at: on(5, '12:00'), who: 'G.H' });
  const cfg = TASKED(['A02']);
  const d = run(b, cfg, 6);
  const frozen = JSON.stringify(select.end(d).atEnd);
  const e = select.edit(d, 'A02', { marks: { [t.id]: { n: 10 } } }, { id: 'x', at: on(6) });
  assert.equal(e.why, null);                                                // no reason asked: it is a fact
  put(b, e.events[0], 'x', { at: on(6) });
  const D = run(b, cfg, 6).litters.A02.doses.iron3;
  assert.equal(D.owed, 0);
  assert.equal(D.notDoneAfterEnd, 2);
  const s = select.end(run(b, cfg, 6));
  assert.equal(JSON.stringify(s.atEnd), frozen);
  assert.equal(s.now.byLitter.A02.length, 0);
  assert.deepEqual(s.now.correctedAfterEnd, [{ litter: 'A02', dose: 'iron3', n: 2 }]);
  put(b, { type: 'correction', target: t.id, void: true }, 'y', { at: on(6, '11:00') });
  assert.equal(run(b, cfg, 6).litters.A02.doses.iron3.notDoneAfterEnd, 12);
});

test('S8-3 wrong litter carries the act: n set by the worker, deferred travels, the original time kept, flagged from A02', () => {
  const b = book();
  b.farrowed('A02', 12); b.farrowed('A04', 12);
  const t = b.treat('A02', 'iron3', 10, { deferred: { n: 2, reason: 'weak' }, at: on(3, '08:40'), who: 'L.M' });
  const d = run(b);
  let e = select.edit(d, 'A02', { marks: { [t.id]: { to: 'A04' } } }, { id: 'x' });
  assert.deepEqual(e.events[0].changes[0].fresh, { litter: 'A04', dose: 'iron3', n: 10, deferred: { n: 2, reason: 'weak' }, at: on(3, '08:40'), who: 'L.M' });
  e = select.edit(d, 'A02', { marks: { [t.id]: { to: 'A04', n: 9, reason: 'sick' } } }, { id: 'x' });
  assert.equal(e.why, null);
  assert.deepEqual(e.events[0].changes[0].fresh.deferred, { n: 3, reason: 'sick' });
  put(b, select.edit(d, 'A02', { marks: { [t.id]: { to: 'A04' } } }, { id: 'x' }).events[0], 'x');
  const r = run(b).litters.A04.doses.iron3.records[0];
  assert.equal(r.at, on(3, '08:40'));
  assert.equal(r.onTime, true);
  assert.equal(r.from, 'A02');
  assert.equal(r.viaCorrection, 'x');
});

test('S8-4 one Save is one correction event; concurrent corrections of one mark are both kept and flagged', () => {
  const b = book();
  b.farrowed('A02', 12);
  b.identity('A02', 'add', { rowId: 'r1', notch: '4-1', weight: 1.51 });
  const t = b.treat('A02', 'iron3', 12);
  const d = run(b);
  const e = select.edit(d, 'A02', { marks: { [t.id]: { n: 11, reason: 'weak' } }, rows: { r1: { set: { weight: 1.15 } } } }, { id: 'x' });
  assert.equal(e.events.length, 1);
  assert.equal(e.events[0].changes.length, 2);
  const seen = b.ev.map((x) => x.id);
  put(b, e.events[0], 'x', { seen });
  put(b, { type: 'correction', changes: [{ target: t.id, set: { n: 10, deferred: { n: 2, reason: 'sick' } } }] }, 'y', { seen, who: 'L.M' });
  const d2 = run(b);
  assert.ok(d2.litters.A02.flags.some((f) => f.reason === 'correction_concurrent'));
  assert.equal(d2.litters.A02.identity.rows[0].weight, 1.15);
  const rec = select.record(d2, 'A02');
  const ys = rec.days[0].entries.filter((x) => x.kind === 'correction');
  assert.equal(ys.length, 2);
  assert.ok(ys.every((x) => x.changes[0].before.n === 12));                // each saw 12
});

test('S8-5 the fresh mark is editable; voiding a void is refused; reversing a wrong-litter correction is atomic', () => {
  const b = book();
  b.farrowed('A02', 12); b.farrowed('A04', 11);
  const t = b.treat('A02', 'teeth', 12);
  put(b, { type: 'correction', changes: [{ target: t.id, void: true, fresh: { litter: 'A04', dose: 'teeth', n: 11 } }] }, 'x');
  let d = run(b);
  const f = d.litters.A04.doses.teeth.records[0];
  assert.equal(f.id, 'x:1');
  const e = select.edit(d, 'A04', { marks: { [f.id]: { n: 10, reason: 'weak' } } }, { id: 'y' });
  assert.equal(e.why, null);
  const again = put(b, { type: 'correction', changes: [{ target: t.id, void: true }] }, 'z');
  assert.equal(run(b).rejected.find((r) => r.id === again.id).reason, 'already_withdrawn');
  b.ev.pop();
  const back = select.edit(d, 'A04', { marks: { [f.id]: { back: true } } }, { id: 'w' });
  assert.equal(back.why, null);
  put(b, back.events[0], 'w');
  d = run(b);
  assert.equal(d.litters.A02.doses.teeth.owed, 0);
  assert.equal(d.litters.A04.doses.teeth.owed, 11);
});

test('S8-6 a tagged Move is corrected by picking rows; withdrawing a dead piglet\'s record is refused', () => {
  const b = book();
  b.farrowed('B06', 12); b.farrowed('B08', 9);
  b.identity('B06', 'add', { rowId: 'r1', notch: '1-1' }); b.identity('B06', 'add', { rowId: 'r2', notch: '1-2' });
  const mv = b.move('B06', 'B08', 2, { rows: ['r1', 'r2'] });
  let d = run(b);
  const e = select.edit(d, 'B06', { moves: { [mv.id]: { rows: ['r1'] } } }, { id: 'x' });
  assert.equal(e.why, null);
  assert.equal(e.after.alive, 11);
  b.farrowed('C01', 10);
  b.identity('C01', 'add', { rowId: 'c1', notch: '2-1' });
  b.death('C01', [{ cause: 'crushed', rowId: 'c1' }]);
  d = run(b);
  const w = select.edit(d, 'C01', { rows: { c1: { withdraw: true } } }, { id: 'y' });
  assert.equal(w.why, 'row_dead');
});

// ---- Set count and Explain (slice #10) -----------------------------------------------------

test('select.countDraft: an observation against Alive; a match writes nothing; the rows the remainder cannot cover must be named', () => {
  const b = book();
  b.farrowed('A', 12);
  for (let i = 1; i <= 3; i++) b.identity('A', 'add', { rowId: 'r' + i, tag: '00000' + i });
  b.farrowed('P', 9, {}, { locked: false });
  const d = run(b, IRON_ONLY);
  const m = select.countDraft(d, 'A', { observed: 12 });
  assert.equal(m.kind, 'match'); assert.equal(m.why, null);
  assert.deepEqual(m.after, { alive: 12, openLoss: 0, openGain: 0, stands: true });
  const g = select.countDraft(d, 'A', { observed: 13 });
  assert.equal(g.kind, 'gain'); assert.deepEqual(g.after, { alive: 13, openLoss: 0, openGain: 1, stands: true });
  // 12 alive, 3 tagged, 9 untagged: a count of 2 must name 1 tagged piglet (at most 10)
  const n = select.countDraft(d, 'A', { observed: 2 });
  assert.equal(n.why, 'name_the_rows'); assert.equal(n.needRows, 1); assert.equal(n.maxRows, 10); assert.equal(n.untagged, 9);
  const ok = select.countDraft(d, 'A', { observed: 2, missingRows: ['r2'] });
  assert.equal(ok.why, null); assert.deepEqual(ok.event.missingRows, ['r2']);
  assert.equal(append(b.ev, Object.assign({ id: 'z' }, ok.event), IRON_ONLY, TODAY(3)).ok, true);
  assert.equal(select.countDraft(d, 'A', { observed: 11, missingRows: ['r1', 'r2'] }).why, 'too_many_rows');
  assert.equal(select.countDraft(d, 'P', { observed: 8 }).why, 'farrowing_open');
});

test('select.explain: each open line with a death door (losses) and ranked Move suggestions, never netted', () => {
  const b = book();
  b.farrowed('A', 10); b.farrowed('B', 10); b.farrowed('C', 10, {}, { room: 'R4' }); b.farrowed('D', 10);
  const l = b.count('A', 9, { at: on(3, '09:00') });
  b.count('B', 11, { at: on(3, '11:00') });            // same room, 2h later
  b.count('C', 11, { at: on(3, '09:05') });            // another room, 5 min later
  b.count('D', 8, { at: on(3, '09:30') });             // a second loss: never netted against A's
  const d = run(b, IRON_ONLY);
  const x = select.explain(d, { room: 'R3' });
  assert.equal(x.openLoss, 3); assert.equal(x.openGain, 1);
  const a = x.lines.find((y) => y.id === l.id);
  assert.deepEqual(a.death, { litter: 'A', max: 1 });
  assert.deepEqual(a.suggestions.map((s) => s.litter), ['B', 'C']);   // same room first, cross-room allowed
  assert.deepEqual(a.suggestions[0].move, { from: 'A', to: 'B', n: 1, rows: [], explains: [l.id, a.suggestions[0].id] });
  // saving the suggested Move closes both lines; Alive does not move
  const mv = select.moveDraft(d, a.suggestions[0].move);
  b.move('A', 'B', 1, Object.assign({}, mv.event));
  const d2 = run(b, IRON_ONLY);
  assert.equal(d2.litters.A.alive, 9); assert.equal(d2.litters.B.alive, 11);
  assert.equal(select.explain(d2, { litter: 'A' }).lines.length, 0);
  assert.equal(select.explain(d2, { litter: 'B' }).lines.length, 0);
  // nothing left in this room to pair with D's loss: the other room's gain is still suggested, and it stays open until saved
  const dd = select.explain(d2, { litter: 'D' }).lines[0];
  assert.equal(dd.open, 2); assert.deepEqual(dd.suggestions.map((s) => s.litter), ['C']);
  allBalanced(d2);
});

test('select.counts: the latest count stands (none supersedes); a count that crossed an unseen death is flagged', () => {
  const b = book();
  b.farrowed('A', 14);
  const g = b.count('A', 13, { baseAlive: 14, at: on(3, '09:40') });
  const dd = b.death('A', [{ cause: 'crushed', n: 1 }], { at: on(3, '09:45') });
  const late = b.count('A', 12, { baseAlive: 14, seen: [g.id], at: on(3, '09:50') });   // saw G.H's count, not the death
  const d = run(b, IRON_ONLY);
  const c = select.counts(d, 'A');
  assert.equal(d.litters.A.alive, 12);                  // never summed: not 14 − 1 − 1 − 2
  assert.equal(d.litters.A.unexplained.openLoss, 1);    // one line at most: 14 − 1 dead − 12 seen
  assert.equal(c.standing, late.id);
  const k = c.counts.find((x) => x.id === late.id);
  // the earlier count's loss stays open; this count is sized against Alive (12 after the death) and writes nothing
  assert.equal(k.stands, true); assert.equal(k.wrote, 0); assert.equal(k.deviceDiff, -2); assert.equal(k.sizedAgainst, 12);
  assert.deepEqual(k.crossed, [dd.id]); assert.equal(c.review, true); assert.equal(c.conflict, false);
  allBalanced(d);
  // a later count, online, settles the review; the flagged count stays in the trail
  b.count('A', 12, { baseAlive: 12, at: on(3, '10:00') });
  const d2 = run(b, IRON_ONLY), c2 = select.counts(d2, 'A');
  assert.equal(c2.review, false); assert.equal(c2.counts[1].review, true); assert.equal(c2.counts[2].stands, true);
  assert.equal(d2.litters.A.unexplained.openLoss, 1);
});

test('no clock ordering: two causally concurrent counts disagree — neither stands, neither writes a line, in either arrival order', () => {
  const mk = (first) => {
    const b = book();
    const f = b.farrowed('A', 12);
    const a = () => b.count('A', 13, { seen: [f.id], at: on(3, '09:30'), id: 'cA' });
    const z = () => b.count('A', 9, { seen: [f.id], at: on(3, '09:00'), id: 'cZ' });   // an earlier clock must not matter
    if (first) { a(); z(); } else { z(); a(); }
    return b;
  };
  for (const first of [true, false]) {
    const b = mk(first);
    const d = run(b, IRON_ONLY), L = d.litters.A, c = select.counts(d, 'A');
    assert.equal(L.alive, 12); assert.equal(L.unexplained.openLoss, 0); assert.equal(L.unexplained.openGain, 0);
    assert.equal(c.standing, null); assert.equal(c.conflict, true); assert.equal(c.review, true);
    assert.ok(c.counts.every((k) => !k.stands && k.disputed));
    assert.ok(L.flags.some((x) => x.reason === 'count_conflict'));
    assert.ok(balances(L));
    // a fresh count that saw both settles it: one line at most
    b.count('A', 13, { at: on(3, '10:00') });
    const d2 = run(b, IRON_ONLY), c2 = select.counts(d2, 'A');
    assert.equal(d2.litters.A.alive, 13); assert.equal(d2.litters.A.unexplained.openGain, 1);
    assert.equal(c2.conflict, false); assert.equal(c2.review, false);
  }
});

test('explain lines say what their count was sized against; no count replaces another', () => {
  const b = book();
  b.farrowed('A', 12);
  const p = b.count('A', 10, { at: on(3, '09:00') });
  const r = b.count('A', 13, { at: on(3, '09:20') });
  const l = select.explain(run(b, IRON_ONLY), { litter: 'A' }).lines[0];
  // both lines open (a recount never closes a line): the loss of 2, then the gain of 3 sized against Alive 10
  const g = select.explain(run(b, IRON_ONLY), { litter: 'A' }).lines.find((x) => x.id === r.id);
  assert.equal(l.id, p.id); assert.equal(g.kind, 'gain'); assert.equal(g.open, 3);
  assert.equal(g.aliveBefore, 10); assert.equal(g.sizedAgainst, 10);
  assert.equal(g.replaced, null);
});

test('deathDraft: kMax leaves out the named missing piglets (their loss is theirs)', () => {
  const b = book();
  b.farrowed('A', 6);
  for (let i = 1; i <= 2; i++) b.identity('A', 'add', { rowId: 'r' + i, tag: '00000' + i });
  b.count('A', 3, { missingRows: ['r1'] });                 // loss 3: r1 named + 2 unnamed
  const d = run(b, IRON_ONLY);
  const s = select.deathDraft(d, 'A', { tallies: { crushed: 3 } });
  assert.equal(s.kMax, 2);
  const ok = select.deathDraft(d, 'A', { tallies: { crushed: 3 }, k: 2 });
  assert.equal(ok.why, null);
  b.death('A', [{ cause: 'crushed', n: 3 }], { fromMissing: 2 });
  assert.ok(!run(b, IRON_ONLY).litters.A.flags.some((f) => f.reason === 'loss_over_consumed'));
});

test('explain: a suggested Move with fewer piglets than the named missing rows asks which row', () => {
  const b = book();
  b.farrowed('A', 4); b.farrowed('B', 8);
  for (let i = 1; i <= 4; i++) b.identity('A', 'add', { rowId: 'r' + i, tag: '00000' + i });
  const loss = b.count('A', 2, { missingRows: ['r1', 'r2'] });
  b.count('B', 9);
  const s = select.explain(run(b, IRON_ONLY), { litter: 'A' }).lines[0].suggestions[0];
  assert.equal(s.move.n, 1); assert.deepEqual(s.pickFrom, ['r1', 'r2']); assert.deepEqual(s.move.rows, []);
  assert.equal(s.move.explains[0], loss.id);
  assert.equal(select.moveDraft(run(b, IRON_ONLY), Object.assign({}, s.move, { rows: ['r2'] })).why, null);
});

test('a recount never closes a line: 10 then 12 → a loss of 2 and a gain of 2, both open', () => {
  const b = book();
  b.farrowed('A', 12);
  b.count('A', 10, { at: on(3, '09:00') });
  const r = b.count('A', 12, { at: on(3, '09:20') });
  const L = run(b, IRON_ONLY).litters.A;
  assert.equal(L.alive, 12); assert.equal(L.unexplained.openLoss, 2); assert.equal(L.unexplained.openGain, 2);
  assert.equal(L.unexplained.gains[0].id, r.id);
  assert.equal(L.counts[0].supersededBy, null);
  assert.ok(balances(L));
});

test('a recount never closes a line: 13 then 12 → both lines stay; the gain owes nothing new (round 4)', () => {
  const b = book();
  b.farrowed('A', 12); b.treat('A', 'iron3', 12);
  b.count('A', 13, { at: on(3, '09:00') });
  b.count('A', 12, { at: on(3, '09:20') });
  const L = run(b, IRON_ONLY).litters.A;
  assert.equal(L.alive, 12); assert.equal(L.unexplained.openGain, 1); assert.equal(L.unexplained.openLoss, 1);
  assert.equal(L.doses.iron3.unknownAfterMove, 0);
  assert.equal(L.doses.iron3.owed, 0);
  assert.ok(balances(L));
});

test('concurrent counts still disagree under sync review; a fresh count writes its own line against Alive', () => {
  const b = book();
  const f = b.farrowed('A', 12);
  b.count('A', 13, { at: on(3, '09:30') });                             // online, arrives first
  const off = b.count('A', 9, { seen: [f.id], at: on(3, '09:00') });   // offline: saw neither the online count nor its line
  let d = run(b, IRON_ONLY), L = d.litters.A;
  assert.equal(L.alive, 12); assert.equal(L.unexplained.openLoss, 0); assert.equal(L.unexplained.openGain, 0);
  const c = select.counts(d, 'A');
  assert.equal(c.counts.find((k) => k.id === off.id).stands, false);
  assert.equal(c.conflict, true); assert.equal(c.review, true);
  b.count('A', 13, { at: on(3, '10:00') });
  d = run(b, IRON_ONLY); L = d.litters.A;
  assert.equal(L.alive, 13); assert.equal(L.unexplained.openGain, 1);
  assert.equal(select.counts(d, 'A').review, false);
  assert.ok(balances(L));
});

test('a recount never gives back a named missing piglet: only a death or a Move closes its line', () => {
  const b = book();
  b.farrowed('A', 4);
  for (let i = 1; i <= 4; i++) b.identity('A', 'add', { rowId: 'r' + i, tag: '00000' + i });
  b.count('A', 3, { missingRows: ['r2'], at: on(3, '09:00') });
  b.count('A', 4, { at: on(3, '09:20') });
  const L = run(b, IRON_ONLY).litters.A;
  assert.equal(L.identity.missing, 1); assert.equal(L.alive, 4); assert.equal(L.unexplained.openLoss, 1); assert.equal(L.unexplained.openGain, 1);
});

test('counts are accepted after End (litter facts, RULINGS Q5); a weaned-out litter refuses a count', () => {
  const b = book();
  b.farrowed('A', 10); b.farrowed('W', 8);
  const cfg = Object.assign({}, IRON_ONLY, { task: { id: 'T', litters: ['A', 'W'] } });
  b.weaned('W', { n: 8 });
  b.ev.push({ id: 'END', type: 'end_task', at: on(3, '12:00'), who: 'G.H' });
  const c = b.count('A', 9, { at: on(3, '13:00') });
  const w = b.count('W', 1, { at: on(3, '13:05') });
  const d = run(b, cfg);
  assert.ok(d.ended && d.ended.event === 'END');
  assert.equal(rejectedReason(d, c), undefined); assert.equal(d.litters.A.unexplained.openLoss, 1);
  assert.equal(rejectedReason(d, w), 'weaned');
  assert.equal(select.countDraft(d, 'W', { observed: 0 }).why, 'weaned');
});

// =============================================================================================
// Round 4 — integration follow-ups (#19): rulings contradictions, then the gaps the pages worked around.

const R4 = {
  doses: [
    { id: 'iron3', tx: 'iron', due: 3 },
    { id: 'tail', tx: 'tail', due: 3, last: 4, visible: true },
    { id: 'castrate', tx: 'castrate', due: 5, visible: true, castration: true },
    { id: 'iron14', tx: 'iron', due: 14 }
  ],
  identity: { scheme: 'none' }
};
const R4T = (litters, extra) => Object.assign({}, R4, { task: Object.assign({ id: 'T', litters }, extra || {}) });

test('R4-1 a dose due on or before the End day and never recorded counts as not on time', () => {
  const b = book();
  b.farrowed('A02', 12); b.farrowed('A05', 11);
  for (const x of ['iron3', 'tail']) b.treat('A05', x, 11, { at: on(3) });
  b.ev.push({ id: 'end', type: 'end_task', at: on(3, '12:00') });
  const e = select.end(run(b, R4T(['A02', 'A05']), 3));
  // A02: iron3 and tail due today, never recorded → not on time; A05 both on time; castration and iron14 not due
  assert.deepEqual(e.atEnd.onTime, { n: 2, k: 4 });
  assert.deepEqual(e.now.onTime, { n: 2, k: 4 });
  // before End the overview still leaves due-today-unrecorded out
  const b2 = book();
  b2.farrowed('A02', 12);
  assert.deepEqual(select.end(run(b2, R4T(['A02']), 3)).now.onTime, { n: 0, k: 0 });
});

test('R4-2 a treatment done after End on a phone that had not seen End is kept, stamped, flagged after_end', () => {
  const b = book();
  const f = b.farrowed('A02', 12);
  const end = { id: 'end', type: 'end_task', at: on(5, '12:00') };
  b.ev.push(end);
  const off = b.treat('A02', 'iron3', 12, { at: on(5, '15:00'), seen: [f.id], who: 'L.M' });
  const knew = b.treat('A02', 'tail', 12, { at: on(5, '15:05'), seen: [f.id, end.id] });
  const d = run(b, R4T(['A02']), 5);
  assert.equal(rejectedReason(d, off), undefined);
  assert.equal(rejectedReason(d, knew), 'task_ended');
  assert.deepEqual(d.flags.filter((g) => g.kind === 'task').map((g) => [g.reason, g.events[0]]), [['after_end', off.id]]);
  const e = select.end(d);
  assert.deepEqual(e.atEnd.byLitter.A02.find((x) => x.dose === 'iron3'), { dose: 'iron3', kind: 'owed', n: 12 });
  // kept as evidence, never counted (RULINGS round 3): owed, treated and on-time unchanged
  assert.deepEqual(e.now.byLitter.A02.find((x) => x.dose === 'iron3'), { dose: 'iron3', kind: 'owed', n: 12 });
  const D = d.litters.A02.doses.iron3;
  assert.deepEqual([D.treated, D.records.length], [0, 0]);
  assert.deepEqual(D.afterEnd.map((x) => [x.id, x.n, x.at, x.who]), [[off.id, 12, on(5, '15:00'), 'L.M']]);
  assert.deepEqual(e.now.onTime, e.atEnd.onTime);
  assert.deepEqual(select.litter(d, 'A02').afterEnd.map((x) => [x.dose, x.n]), [['iron3', 12]]);
});

test('R4-3 a correction after End that brings a dose to 0 shows in now, never in atEnd', () => {
  const b = book();
  b.farrowed('A02', 12);
  const t = b.treat('A02', 'iron3', 10, { at: on(3), deferred: { n: 2, reason: 'weak' } });
  b.ev.push({ id: 'end', type: 'end_task', at: on(5, '12:00') });
  b.correction(t.id, { set: { n: 12, deferred: undefined }, at: on(6) });
  const e = select.end(run(b, R4T(['A02']), 6));
  // iron3 2 owed at End (tail's 12 missed stays in both)
  assert.equal(e.atEnd.litters.A02.owed, 14);
  assert.equal(e.now.litters.A02.owed, 12);
  assert.equal(e.atEnd.byLitter.A02.find((x) => x.dose === 'iron3').n, 2);
  assert.equal(e.now.byLitter.A02.find((x) => x.dose === 'iron3'), undefined);
});

test('R4-4 select.end gives per-litter totals', () => {
  const b = book();
  b.farrowed('S', 10); b.treat('S', 'iron3', 7, { deferred: { n: 3, reason: 'weak' } });
  b.farrowed('A02', 10);
  b.treat('A02', 'iron3', 8, { deferred: { n: 2, reason: 'weak' } });
  b.move('S', 'A02', 1, { answers: { iron3: 'unknown' } });
  const e = select.end(run(b, R4T(['A02', 'S']), 5));
  // day 5: iron3 owed 2 + unknown 1; tail missed (window day 4) 11; castration due, males uncounted; iron14 not due 11
  assert.deepEqual(e.now.litters.A02, {
    done: 8, owed: 13, unknown: 1, missed: 11, notDue: 11, malesUncounted: true,
    onTime: { n: 0, k: 2 }, excluded: 2, unfinished: true
  });
});

test('R4-5 same tag within and across litters: identity.sameTag and per-row alsoOn; findId for a typed value', () => {
  const b = book();
  const f = b.farrowed('B04', 6); b.farrowed('A05', 6);
  b.identity('B04', 'add', { rowId: 'B04-r8', tag: '004517' });
  b.identity('A05', 'add', { rowId: 'A05-r3', tag: '004517' });
  b.identity('A05', 'add', { rowId: 'A05-r1', tag: '000354' });
  b.identity('A05', 'add', { rowId: 'A05-r9', tag: '000354', seen: [f.id] });      // a pair within the litter, offline
  const d = run(b, IRON_ONLY);
  const A = d.litters.A05.identity;
  assert.deepEqual(A.sameTag.map((g) => [g.tag, g.rows.map((r) => r.litter + ':' + r.rowId).sort()]), [
    ['004517', ['A05:A05-r3', 'B04:B04-r8']], ['000354', ['A05:A05-r1', 'A05:A05-r9']]]);
  assert.deepEqual(A.rows.find((r) => r.rowId === 'A05-r3').alsoOn, [{ litter: 'B04', rowId: 'B04-r8' }]);
  assert.equal(A.distinct, 2);
  assert.equal(A.pairs, 1);
  assert.deepEqual(select.findId(d, { tag: '004517' }, 'A05'), [{ litter: 'B04', rowId: 'B04-r8', status: 'alive' }]);
});

test('R4-6a birth litter weight: only when missing; a concurrent second is kept as a conflict', () => {
  const b = book();
  const f = b.farrowed('C02', 15, { stillborn: 1 }, { sow: { tag: '000462', parity: 4 } });
  b.farrowed('A02', 13, {}, { birthWeight: '15.2', at: on(0, '18:05') });
  const w1 = b.ev.push({ id: 'w1', type: 'birth_weight', litter: 'C02', kg: '16.4', at: on(1, '09:38'), who: 'A.K' }) && b.ev[b.ev.length - 1];
  const again = { id: 'w2', type: 'birth_weight', litter: 'C02', kg: '17.0', at: on(1, '09:40'), who: 'G.H' };
  const mine = { id: 'w3', type: 'birth_weight', litter: 'C02', kg: '16.9', at: on(1, '09:42'), who: 'G.H', seen: [f.id] };
  b.ev.push(again, mine);
  const d = run(b, IRON_ONLY, 1);
  assert.deepEqual(d.litters.C02.sow, { tag: '000462', parity: 4 });
  assert.equal(d.litters.A02.birthWeight.by, 'finish');
  assert.equal(d.litters.C02.birthWeight.kg, '16.4');
  assert.equal(d.litters.C02.birthWeight.event, w1.id);
  assert.equal(rejectedReason(d, again), 'already_recorded');
  assert.deepEqual(d.litters.C02.birthWeightConflicts.map((x) => [x.kg, x.event]), [['16.9', 'w3']]);
  assert.deepEqual(d.flags.map((g) => g.reason), ['birth_weight_conflict']);
});

test('R4-6b weigh-day litter weight: one per weigh day, the later replaces and keeps history', () => {
  const b = book();
  b.farrowed('B04', 12);
  b.ev.push({ id: 'lw1', type: 'litter_weight', litter: 'B04', kg: '15.9', at: on(3, '08:40'), who: 'L.M' });
  b.ev.push({ id: 'lw2', type: 'litter_weight', litter: 'B04', kg: '16.1', at: on(3, '09:10'), who: 'G.H' });
  b.ev.push({ id: 'lw3', type: 'litter_weight', litter: 'B04', kg: '57.5', at: on(21, '08:00'), who: 'G.H' });
  const W = run(b, IRON_ONLY, 21).litters.B04.weights;
  assert.deepEqual(W.map((x) => [x.day, x.kg, x.replaced.map((r) => r.kg)]), [[3, '16.1', ['15.9']], [21, '57.5', []]]);
});

test('R4-6c boar/gilt counts for piglets without a record are consumed by matching-sex records', () => {
  const b = book();
  b.farrowed('A02', 13, { stillborn: 1 });                                          // 12 alive
  const sx = ['g', 'b', 'b', 'g', 'b'];
  sx.forEach((s, i) => b.identity('A02', 'add', { rowId: 'r' + i, tag: '00430' + i, sex: s }));
  b.ev.push({ id: 'sc', type: 'sex_counts', litter: 'A02', boars: 4, gilts: 3, at: on(3, '09:00'), who: 'G.H' });
  b.identity('A02', 'add', { rowId: 'r6', tag: '004306', sex: 'b' });
  b.identity('A02', 'add', { rowId: 'r7', tag: '004307', sex: 'b' });
  let S = run(b, IRON_ONLY).litters.A02.sexCounts;
  assert.deepEqual([S.saved.boars, S.saved.gilts, S.residualBoars, S.residualGilts, S.boars, S.gilts, S.unresolved], [4, 3, 2, 3, 7, 5, false]);
  b.identity('A02', 'add', { rowId: 'r8', tag: '004308' });                          // unsexed: which bucket is unknowable
  S = run(b, IRON_ONLY).litters.A02.sexCounts;
  assert.equal(S.unresolved, true);
  const over = { id: 'sc2', type: 'sex_counts', litter: 'A02', boars: 9, gilts: 0, at: on(3, '09:30') };
  b.ev.push(over);
  assert.equal(rejectedReason(run(b, IRON_ONLY), over), 'more_than_unidentified');
});

test('R4-7 the room counts collision records; moveDraft omits doses not yet due for the moved piglets (their own age, R1-4)', () => {
  const b = book();
  const f = b.farrowed('A05', 11);
  b.treat('A05', 'iron3', 11, { seen: [f.id] }); b.treat('A05', 'iron3', 11, { seen: [f.id] });
  b.treat('A05', 'iron3', 11, { seen: [f.id] });
  const d = run(b, R4T(['A05']), 3);
  assert.equal(select.room(d, { lens: 'all' }).rows[0].collide, 3);
  const b2 = book();
  b2.farrowed('S', 10);
  b2.farrowed('R', 8, {}, { birthDate: on(2).slice(0, 10) });                        // day 1 at the receiver
  const m = select.moveDraft(run(b2, R4, 3), { from: 'S', to: 'R', n: 1 });
  assert.deepEqual(Object.keys(m.carry), ['iron3', 'tail']);                          // day 3 piglets: due for them, wherever they go
  assert.deepEqual(m.asks, []);
  const back = select.moveDraft(run(b2, R4, 3), { from: 'R', to: 'S', n: 1 });        // day 1 piglets: nothing due yet
  assert.deepEqual(Object.keys(back.carry), []);
});

test('R4-8 castration before its first record: selectors say males uncounted', () => {
  const b = book();
  b.farrowed('B01', 14, {}, { birthDate: on(-2).slice(0, 10) });                    // day 5
  const d = run(b, R4T(['B01']), 3);
  assert.equal(d.litters.B01.doses.castrate.males, 'uncounted');
  assert.equal(select.room(d, { lens: 'owed' }).rows[0].doses.find((x) => x.dose === 'castrate').males, 'uncounted');
  assert.equal(select.litter(d, 'B01').owed.find((x) => x.dose === 'castrate').males, 'uncounted');
  assert.equal(select.end(d).now.byLitter.B01.find((x) => x.dose === 'castrate').males, 'uncounted');
  b.castrate('B01', { castrated: 6 });
  assert.equal(run(b, R4T(['B01']), 3).litters.B01.doses.castrate.males, 6);
});

test('R4-9 several tasks per config; a nurse sow outside every task joins the task of the piglets moved onto her (RULINGS round 4)', () => {
  const cfg = Object.assign({}, R4, { tasks: [{ id: 'T7', litters: ['A02', 'S'] }, { id: 'T8', litters: ['F02'] }] });
  const b = book();
  b.farrowed('A02', 12); b.farrowed('F02', 10); b.farrowed('S', 10); b.farrowed('D02', 12);
  b.weaned('D02', { at: on(3, '07:00') });
  const tF = b.treat('F02', 'iron3', 10);
  b.ev.push({ id: 'end8', type: 'end_task', task: 'T8', at: on(3, '12:00') });
  const afterF = b.treat('F02', 'tail', 10, { at: on(3, '13:00') });
  const a02 = b.treat('A02', 'iron3', 12, { at: on(3, '13:00') });
  b.move('S', 'D02', 3, { at: on(3, '13:10') });                                     // S did nothing yet: the arrivals owe
  const nurse = b.treat('D02', 'iron3', 3, { at: on(3, '13:20') });
  const more = b.treat('D02', 'tail', 3, { at: on(3, '13:25') });
  const d = run(b, cfg, 3);
  for (const e of [tF, a02]) assert.equal(rejectedReason(d, e), undefined, e.id);
  assert.equal(rejectedReason(d, afterF), 'task_ended');
  // round 4 (supersedes Q18 for this case): the nurse joins T7 with the arrivals; they are treated there
  assert.equal(rejectedReason(d, nurse), undefined);
  assert.equal(rejectedReason(d, more), undefined);
  assert.deepEqual([d.litters.D02.doses.iron3.owed, d.litters.D02.doses.tail.owed, d.litters.D02.recordable], [0, 0, true]);
  assert.equal(d.litters.F02.task, 'T8');
  assert.equal(d.litters.D02.task, 'T7');
  assert.deepEqual(d.tasks.find((t) => t.id === 'T7').litters, ['A02', 'S', 'D02']);
  assert.equal(d.litters.D02.earlier.born, 12);
  assert.equal(select.end(d, { task: 'T8' }).atEnd.unfinishedLitters.length, 1);
  assert.equal(select.end(d, { task: 'T7' }).atEnd, null);
  const extra = b.treat('D02', 'iron3', 1, { at: on(3, '13:30') });
  assert.equal(rejectedReason(run(b, cfg, 3), extra), 'nothing_owed');
  // a litter with no task piglets still records no treatments
  const c = book(); c.farrowed('E01', 7);
  const t = c.treat('E01', 'iron3', 7);
  assert.equal(rejectedReason(run(c, cfg, 3), t), 'no_task');
});

// ---- bulk (slice #7): one dose for several litters ------------------------------------------------

test('bulk: each litter is classified; the plan records only the one-tap litters, in one replay', () => {
  const b = book();
  const cfg = { doses: IRON_ONLY.doses, identity: { scheme: 'none' } };
  b.farrowed('A02', 12); b.farrowed('A04', 11); b.farrowed('B09', 10); b.farrowed('C04', 9);
  b.farrowed('C02', 14, {}, { birthDate: on(2).slice(0, 10), at: on(2) });
  b.treat('B09', 'iron3', 8, { deferred: { n: 2, reason: 'weak' }, at: on(3, '08:00') });
  b.treat('C04', 'iron3', 9, { at: on(3, '08:30'), who: 'L.M' });
  const d = run(b, cfg, 3);
  const r = select.bulkDraft(d, { room: 'R3', dose: 'iron3', selected: ['A02', 'A04', 'C04', 'C02', 'B09'], stamp: { at: on(3, '10:31'), who: 'G.H' } });
  const kind = Object.fromEntries(r.rows.map((x) => [x.litter, x.kind]));
  assert.deepEqual(kind, { A02: 'record', A04: 'record', B09: 'sheet', C02: 'not_due', C04: 'done' });
  assert.equal(r.rows.find((x) => x.litter === 'C04').records[0].who, 'L.M');
  assert.deepEqual([r.plan.litters, r.plan.piglets, r.plan.done, r.plan.notDue, r.plan.sheet], [2, 23, ['C04'], ['C02'], ['B09']]);
  // the plan's events commit as they were replayed
  let ev = b.ev;
  r.plan.events.forEach((e, i) => { const a = append(ev, Object.assign({ id: 'bk' + i, at: on(3, '10:31'), who: 'G.H' }, e), cfg, TODAY(3)); assert.ok(a.ok); ev = a.events; });
  const after = select.bulkDraft(derive(ev, cfg, TODAY(3)), { room: 'R3', dose: 'iron3' });
  assert.deepEqual(after.rows.filter((x) => x.kind === 'done').map((x) => x.litter), ['A02', 'A04', 'C04']);
});

test('bulk: a litter another phone finished is no longer in the plan; an offline twin is kept and flagged', () => {
  const b = book();
  const cfg = { doses: IRON_ONLY.doses, identity: { scheme: 'none' } };
  const f = b.farrowed('B06', 12);
  b.treat('B06', 'iron3', 12, { at: on(3, '10:30'), who: 'L.M' });
  assert.equal(select.bulkDraft(run(b, cfg, 3), { room: 'R3', dose: 'iron3', selected: ['B06'] }).plan.litters, 0);
  // offline: this phone had only the farrowing when it recorded
  const r = select.bulkDraft(derive([f], cfg, TODAY(3)), { room: 'R3', dose: 'iron3', selected: ['B06'] });
  const a = append(b.ev, Object.assign({ id: 'mine', at: on(3, '10:31'), who: 'G.H', seen: [f.id] }, r.plan.events[0]), cfg, TODAY(3));
  assert.ok(a.ok);
  const done = select.bulkDraft(a.derived, { room: 'R3', dose: 'iron3' }).rows[0];
  assert.equal(done.kind, 'done');
  assert.ok(done.collided);
});

test('bulk: the review is a contract — changed, died, gone and castration each get their own outcome', () => {
  const b = book();
  const cfg = { doses: [IRON_ONLY.doses[0], CONFIG.doses[2]], identity: { scheme: 'none' } };
  b.farrowed('A02', 12); b.farrowed('A04', 11); b.farrowed('B06', 12); b.farrowed('B10', 11); b.farrowed('B09', 10); b.farrowed('A05', 11);
  const sel = ['A02', 'A04', 'B06', 'B10', 'A05'];
  const d0 = run(b, cfg, 3);
  const reviewed = {};
  select.bulkDraft(d0, { room: 'R3', dose: 'iron3' }).rows.forEach((r) => { reviewed[r.litter] = { n: r.n, alive: r.alive, dead: r.dead, moved: r.moved, counted: r.counted }; });
  assert.equal(select.bulkDraft(d0, { room: 'R3', dose: 'castrate' }).rows[0].kind, 'sheet');
  b.death('B06', [{ cause: 'crushed', n: 2 }], { at: on(3, '10:32') });
  b.move('B09', 'A02', 1, { answers: { iron3: 'no' }, at: on(3, '10:33') });
  b.move('B10', 'B09', 11, { answers: {}, at: on(3, '10:34') });
  // a death and an arrival in one litter: the number is the same, the litter is not
  b.death('A05', [{ cause: 'crushed', n: 1 }], { at: on(3, '10:35') });
  b.move('B09', 'A05', 1, { answers: { iron3: 'no' }, at: on(3, '10:36') });
  const p = select.bulkDraft(run(b, cfg, 3), { room: 'R3', dose: 'iron3', selected: sel, reviewed }).plan;
  const out = Object.fromEntries(p.outcomes.map((x) => [x.litter, x.outcome]));
  assert.deepEqual(out, { A02: 'changed', A04: 'record', B06: 'died', B10: 'gone', A05: 'changed' });
  assert.equal(p.outcomes.find((x) => x.litter === 'A02').n, 13);
  assert.deepEqual([p.litters, p.piglets], [2, 21]);
  assert.equal(p.outcomes.find((x) => x.litter === 'B06').died, 2);
});

test('bulk: after End no rows — arrivals stay not done (RULINGS round 3); the result says the task ended', () => {
  const b = book();
  const cfg = { doses: IRON_ONLY.doses, identity: { scheme: 'none' }, task: { id: 'T', litters: ['A02', 'A04'] } };
  b.farrowed('A02', 12); b.farrowed('A04', 11); b.farrowed('Z01', 5);
  b.treat('A02', 'iron3', 12, { at: on(3, '08:00') }); b.treat('A04', 'iron3', 11, { at: on(3, '08:05') });
  b.ev.push({ id: 'end', type: 'end_task', at: on(5, '12:00'), who: 'G.H' });
  b.move('Z01', 'A04', 2, { answers: { iron3: 'no' }, at: on(6, '09:00') });
  const r = select.bulkDraft(run(b, cfg, 6), { room: 'R3', dose: 'iron3', selected: ['A04'] });
  assert.ok(r.ended);
  assert.deepEqual(r.rows, []);
  assert.equal(r.plan.litters, 0);
});

// =============================================================================================
// Rulings round 3 (owner, 2026-09-30) and the provisional check's bugs.

test('R5-2 a mistaken count is corrected through Edit: withdrawn or set, stamped, original kept, its line goes', () => {
  const b = book();
  b.farrowed('B14', 10);
  const c = b.count('B14', 9, { at: on(3, '09:00') });
  let d = run(b, IRON_ONLY);
  // the Edit screen lists the count and writes one correction
  const ed = select.edit(d, 'B14', { counts: { [c.id]: { void: true } } }, { id: 'X1', at: on(3, '09:30'), who: 'L.M' });
  assert.deepEqual(ed.counts.map((k) => [k.id, k.observed, k.wrote]), [[c.id, 9, -1]]);
  assert.deepEqual(ed.changes.map((x) => [x.kind, x.count]), [['count_void', c.id]]);
  assert.equal(ed.why, null);
  b.ev.push(Object.assign({ id: 'X1', at: on(3, '09:30'), who: 'L.M' }, ed.events[0]));
  d = run(b, IRON_ONLY);
  let L = d.litters.B14;
  assert.deepEqual([L.alive, L.unexplained.openLoss, L.unexplained.losses.length], [10, 0, 0]);
  assert.equal(d.corrections[c.id][0].who, 'L.M');
  assert.equal(b.ev.find((e) => e.id === c.id).observed, 9);        // the original event is untouched
  const rec = select.record(d, 'B14').days.flatMap((g) => g.entries).find((x) => x.kind === 'correction');
  assert.deepEqual(rec.changes.map((x) => x.kind), ['count_void']);
  // set observed: the line is resized
  const b2 = book();
  b2.farrowed('B14', 10);
  const c2 = b2.count('B14', 9);
  b2.correction(c2.id, { set: { observed: 8 }, at: on(3, '10:00') });
  L = run(b2, IRON_ONLY).litters.B14;
  assert.deepEqual([L.alive, L.unexplained.openLoss], [8, 2]);
  // gated on the whole log: a body drawn from that loss would lose its loss
  const b3 = book();
  b3.farrowed('B14', 10);
  const c3 = b3.count('B14', 9);
  b3.death('B14', [{ cause: 'crushed', n: 1 }], { lossAlloc: [{ lossId: c3.id, qty: 1 }] });
  const x3 = b3.correction(c3.id, { void: true, at: on(3, '10:00') });
  assert.equal(rejectedReason(run(b3, IRON_ONLY), x3), 'changes_later');
});

test('R5-5 on time keeps a future dose recorded early (iron d14 on d3); only unrecorded not-yet-due doses are left out', () => {
  const b = book();
  b.farrowed('A02', 12);
  for (const x of ['iron3', 'tail', 'iron14']) b.treat('A02', x, 12, { at: on(3) });
  let e = select.end(run(b, R4T(['A02']), 3));
  assert.deepEqual(e.now.onTime, { n: 3, k: 3 });
  assert.equal(e.now.litters.A02.excluded, 1);                         // castration: unrecorded, not yet due
  b.ev.push({ id: 'end', type: 'end_task', at: on(3, '12:00') });
  e = select.end(run(b, R4T(['A02']), 3));
  assert.deepEqual(e.atEnd.onTime, { n: 3, k: 3 });
});

test('R5-6 a wrong-litter fresh record keeps the original act\'s time and hand; on-time is judged at the receiving litter', () => {
  const b = book();
  b.farrowed('A02', 12);
  b.farrowed('A05', 11, {}, { birthDate: on(1).slice(0, 10) });      // day 2 on the act's day: iron3 due tomorrow there
  const t = b.treat('A02', 'iron3', 12, { at: on(3, '08:40'), who: 'G.H' });
  b.ev.push({ id: 'X', type: 'correction', changes: [{ target: t.id, void: true, fresh: { litter: 'A05', dose: 'iron3', n: 11 } }], at: on(4, '09:00'), who: 'L.M' });
  const d = run(b, IRON_ONLY, 4);
  const r = d.litters.A05.doses.iron3.records[0];
  assert.deepEqual([r.at, r.who, r.dayAge, r.timing], [on(3, '08:40'), 'G.H', 2, 'early']);
  assert.deepEqual(d.corrections[t.id].map((x) => [x.at, x.who]), [[on(4, '09:00'), 'L.M']]);
});

test('R5-8 two same-day litter weights from two offline phones are both kept as a conflict', () => {
  const b = book();
  const f = b.farrowed('B04', 12);
  b.ev.push({ id: 'lw1', type: 'litter_weight', litter: 'B04', kg: '15.9', at: on(3, '09:10'), who: 'L.M', seen: [f.id] });
  b.ev.push({ id: 'lw2', type: 'litter_weight', litter: 'B04', kg: '16.4', at: on(3, '08:40'), who: 'G.H', seen: [f.id] });
  let d = run(b, IRON_ONLY, 3);
  const W = d.litters.B04.weights;
  assert.deepEqual(W.map((x) => [x.day, x.kg, x.conflicts.map((c) => c.kg)]), [[3, '15.9', ['16.4']]]);
  assert.deepEqual(d.flags.map((g) => g.reason), ['litter_weight_conflict']);
  // a weighing that saw the day's value replaces it (history kept)
  b.ev.push({ id: 'lw3', type: 'litter_weight', litter: 'B04', kg: '16.0', at: on(3, '10:00'), who: 'G.H' });
  d = run(b, IRON_ONLY, 3);
  assert.deepEqual(d.litters.B04.weights.map((x) => [x.kg, x.replaced.map((r) => r.kg), x.conflicts.length]), [['16.0', ['15.9', '16.4'], 0]]);
});

test('R5-9 treatments left and unfinished differ: a missed dose is unfinished, not a treatment left', () => {
  const b = book();
  const cfg = Object.assign({}, R4T(['B04']));
  b.farrowed('B04', 10, {}, { birthDate: on(-2).slice(0, 10) });      // day 5: tail (window day 4) missed
  b.treat('B04', 'iron3', 10, { at: on(3) });
  const d = run(b, cfg, 3);
  const v = select.litter(d, 'B04');
  assert.deepEqual(v.dosesLeft, { left: 1, total: 3 });                // castration only: tail missed is not left
  assert.deepEqual(v.unfinished, { n: 2, missed: 1 });
  const row = select.room(d, { lens: 'all' }).rows.find((r) => r.litter === 'B04');
  assert.deepEqual(row.unfinished, { n: 2, missed: 1 });
});

test('R5-10 a mark withdrawn after End reads not done · corrected after End on the litter sheet', () => {
  const b = book();
  b.farrowed('A02', 12);
  const t = b.treat('A02', 'iron3', 12, { at: on(3) });
  b.ev.push({ id: 'end', type: 'end_task', at: on(5, '12:00') });
  b.ev.push({ id: 'X', type: 'correction', changes: [{ target: t.id, void: true }], at: on(6), who: 'L.M' });
  const v = select.litter(run(b, R4T(['A02']), 6), 'A02');
  assert.deepEqual(v.correctedAfterEnd.map((x) => [x.dose, x.n]), [['iron3', 12]]);
  assert.equal(v.owed.find((x) => x.dose === 'iron3'), undefined);
});

// ---- scenario round 1 (R1-n) and owner round 4 ------------------------------------------------
// R1: iron (invisible) and tail (visible) due day 3, castration day 5; one task unless a test says otherwise.
const R1 = {
  doses: [
    { id: 'iron3', tx: 'iron', due: 3 },
    { id: 'tail', tx: 'tail', due: 3, last: 7, visible: true },
    { id: 'castrate', tx: 'castrate', due: 5, visible: true, castration: true }
  ],
  identity: { scheme: 'none' }
};
const R1T = (litters, extra) => Object.assign({}, R1, extra || {}, { task: { id: 'T', litters } });
const bornOn = (d) => ({ birthDate: on(d).slice(0, 10), at: on(d) });

test('R1-3 a Don\'t-know move leaves the source an owed RANGE, never a one-tap number; the receiver narrows it', () => {
  const b = book();
  b.farrowed('S', 11); b.farrowed('R', 9);
  b.treat('S', 'iron3', 9, { deferred: { n: 2, reason: 'weak' } });
  b.treat('R', 'iron3', 9);
  const mv = b.move('S', 'R', 3, { answers: { iron3: 'unknown' }, at: on(3, '10:00') });
  let d = run(b, R1);
  let D = d.litters.S.doses.iron3;
  assert.equal(d.litters.S.alive, 8);
  assert.deepEqual([D.owedLo, D.owed], [0, 2]);                  // 0–2 of 8: the 2 weak may have left
  assert.equal(D.range, true);
  const row = select.litter(d, 'S').owed.find((x) => x.dose === 'iron3');
  assert.equal(row.oneTap, null);                                 // no one-tap exact number
  assert.deepEqual(row.range, { lo: 0, hi: 2, of: 8, doubt: [{ move: mv.id, to: 'R', n: 3 }] });
  // the receiver checks the spray mark: 1 had it, 2 did not → the 2 weak were among the 3
  b.check('R', 'iron3', 1, 2, { group: mv.id, at: on(3, '10:10') });
  d = run(b, R1);
  D = d.litters.S.doses.iron3;
  assert.deepEqual([D.owedLo, D.owed, D.range], [0, 0, false]);
  assert.equal(D.done, true);
  allBalanced(d);
});

test('R1-3b a partial resolution narrows; a source record or check that saw the move settles the range', () => {
  const b = book();
  b.farrowed('S', 11); b.farrowed('R', 9);
  b.treat('S', 'iron3', 9, { deferred: { n: 2, reason: 'weak' } });
  b.treat('R', 'iron3', 9);
  const mv = b.move('S', 'R', 3, { answers: { iron3: 'unknown' } });
  b.check('R', 'iron3', 2, 0, { group: mv.id });                 // 2 had it, 1 still unknown
  let D = run(b, R1).litters.S.doses.iron3;
  assert.deepEqual([D.owedLo, D.owed], [1, 2]);
  const over = b.treat('S', 'iron3', 3);
  assert.equal(rejectedReason(run(b, R1), over), 'more_than_owed');
  b.ev.pop();
  b.treat('S', 'iron3', 1);                                       // counted on the pig: 1 without the mark
  D = run(b, R1).litters.S.doses.iron3;
  assert.deepEqual([D.owedLo, D.owed, D.range, D.done], [0, 0, false, true]);
  // …or a check on the source: `owed` names what still owes after looking
  const c = book();
  c.farrowed('S', 11); c.farrowed('R', 9);
  c.treat('S', 'iron3', 9, { deferred: { n: 2, reason: 'weak' } });
  c.treat('R', 'iron3', 9);
  c.move('S', 'R', 3, { answers: { iron3: 'unknown' } });
  c.ev.push({ id: 'chk', type: 'check', litter: 'S', dose: 'iron3', owed: 1, at: on(3, '11:00'), who: 'G.H' });
  D = run(c, R1).litters.S.doses.iron3;
  assert.deepEqual([D.owedLo, D.owed, D.range], [1, 1, false]);
  assert.equal(select.litter(run(c, R1), 'S').owed.find((x) => x.dose === 'iron3').oneTap, 1);
});

test('R1-4 moved piglets keep their own age: arrivals are grouped by origin age, lateness per group', () => {
  const b = book();
  b.farrowed('R', 10);                                            // day 5 on on(5)
  b.treat('R', 'iron3', 10, { at: on(3) }); b.treat('R', 'tail', 10, { at: on(3) });
  b.farrowed('Y', 6, {}, bornOn(4));                              // day 1 on on(5)
  b.move('Y', 'R', 2, { at: on(5, '08:00') });
  let d = run(b, R1, 5);
  let D = d.litters.R.doses.iron3;
  assert.equal(D.owed, 2);
  assert.deepEqual(D.groups.map((g) => [g.kind, g.n, g.from, g.dayAge, g.status, g.lateBy, g.inDays]), [['arrival', 2, 'Y', 1, 'later', 0, 2]]);
  assert.equal(D.status, 'later');                                // not late 2 days: they are day 1
  assert.equal(D.owedNow, 0);
  assert.equal(select.room(d, { lens: 'all' }).rows.find((r) => r.litter === 'R').doses.some((x) => x.dose === 'iron3'), false);
  assert.equal(select.litter(d, 'R').owed.find((x) => x.dose === 'iron3'), undefined);
  // …and older piglets into a younger litter owe now, late by their own age
  const c = book();
  c.farrowed('Y2', 8, {}, bornOn(4));                             // day 1
  c.farrowed('O', 9);                                             // day 5, nothing done
  c.move('O', 'Y2', 1, { at: on(5, '08:00') });
  d = run(c, R1, 5);
  D = d.litters.Y2.doses.iron3;
  assert.deepEqual(D.groups.map((g) => [g.kind, g.n, g.dayAge, g.status, g.lateBy]), [['arrival', 1, 5, 'late', 2], ['own', 8, 1, 'later', 0]]);
  assert.equal(D.status, 'late'); assert.equal(D.owedNow, 1);
  const row = select.litter(d, 'Y2').owed.find((x) => x.dose === 'iron3');
  assert.equal(row.lateBy, 2); assert.equal(row.owedNow, 1);
  assert.deepEqual(row.groups.map((g) => g.kind), ['arrival', 'own']);
  // recording the arrivals only: the own piglets are deferred `not_due` and stay due on their own day
  c.treat('Y2', 'iron3', 1, { deferred: { n: 8, reason: 'not_due' }, at: on(5, '09:00') });
  D = run(c, R1, 5).litters.Y2.doses.iron3;
  assert.equal(D.owed, 8); assert.equal(D.status, 'later');
});

test('R1-6 round 4: a counted gain owes nothing new; the gain line reads check on the pig', () => {
  const b = book();
  b.farrowed('R', 9);
  b.treat('R', 'iron3', 9); b.treat('R', 'tail', 9);
  const g = b.count('R', 10);
  let d = run(b, R1);
  const x = d.litters.R;
  assert.equal(x.alive, 10);
  assert.equal(x.doses.iron3.owed, 0); assert.equal(x.doses.iron3.unknownAfterMove, 0); assert.equal(x.doses.iron3.done, true);
  assert.equal(x.doses.tail.unknownAfterMove, 0);
  assert.equal(x.unexplained.gains[0].check, true);
  assert.notEqual(select.room(d, { lens: 'all' }).rows.find((r) => r.litter === 'R').kind, 'owes');
  // when the gain is explained as a Move, Move rules apply to those piglets: a none-done source → they owe
  b.farrowed('S', 10);
  const loss = b.count('S', 9);
  b.move('S', 'R', 1, { explains: [loss.id, g.id] });
  d = run(b, R1);
  assert.equal(d.litters.R.doses.iron3.owed, 1);
  assert.equal(d.litters.R.moves[0].packets.iron3, 'owed');
  allBalanced(d);
});

test('R1-18 known sources carry, only a partial source asks; visible doses are checked on the pig, never unknown', () => {
  const b = book();
  b.farrowed('S', 10); b.treat('S', 'iron3', 10); b.treat('S', 'tail', 10);   // all done
  b.farrowed('R', 9); b.treat('R', 'iron3', 9);
  const loss = b.count('S', 9, { at: on(3, '10:00') });
  const gain = b.count('R', 10, { at: on(3, '10:01') });
  let d = run(b, R1);
  const dr = select.moveDraft(d, { from: 'S', to: 'R', n: 1, explains: [loss.id, gain.id] });
  assert.deepEqual(dr.asks, []);                                  // the app knows: no question
  assert.equal(dr.carry.iron3, 'done'); assert.equal(dr.carry.tail, 'done');
  assert.deepEqual(dr.sourceAfter, []);                            // no invented doubt on the source
  // a part-done source: iron asked, tail checked on the pig
  const c = book();
  c.farrowed('P', 10); c.treat('P', 'iron3', 7, { deferred: { n: 3, reason: 'weak' } }); c.treat('P', 'tail', 7, { deferred: { n: 3, reason: 'weak' } });
  c.farrowed('Q', 9); c.treat('Q', 'iron3', 9); c.treat('Q', 'tail', 9);
  d = run(c, R1);
  const pd = select.moveDraft(d, { from: 'P', to: 'Q', n: 1 });
  assert.deepEqual(pd.asks, ['iron3']);
  assert.equal(pd.carry.tail, 'check');
  assert.equal(pd.unanswered, 1);                                  // Move reads what it records only once answered
  const done = select.moveDraft(d, { from: 'P', to: 'Q', n: 1, answers: { iron3: 'yes' } });
  assert.equal(done.unanswered, 0);
  c.move('P', 'Q', 1);
  const Q = run(c, R1).litters.Q.doses.tail;
  assert.equal(Q.unknownAfterMove, 1); assert.equal(Q.checkOnPig, 1);   // tail: `check on the pig`, not `unknown`
});

test('R1-19 a litter emptied by moves closes: nothing owed, not unfinished at End', () => {
  const b = book();
  b.farrowed('S', 5, {}, bornOn(-2));                              // day 5 on on(3): castration due, not counted
  b.farrowed('N', 9);
  b.move('S', 'N', 5);
  const d = run(b, R1T(['S', 'N']), 3);
  const S = d.litters.S;
  assert.equal(S.alive, 0); assert.equal(S.closed, true);
  for (const k of ['iron3', 'tail', 'castrate']) { assert.equal(S.doses[k].owed, 0, k); assert.equal(S.doses[k].done, true, k); }
  assert.notEqual(select.room(d, { lens: 'all' }).rows.find((r) => r.litter === 'S').kind, 'owes');
  assert.equal(select.end(d).now.unfinishedLitters.includes('S'), false);
});

test('R1-20 concurrent counts that agree net of a death one phone had not seen do not disagree', () => {
  const b = book();
  b.farrowed('A', 14);
  const seen = b.ev.map((e) => e.id);
  b.count('A', 13, { at: on(3, '09:40') });
  b.death('A', [{ cause: 'crushed', n: 1 }], { at: on(3, '09:45') });
  const late = b.count('A', 12, { at: on(3, '09:50'), seen, who: 'L.M' });
  const d = run(b, R1);
  const A = d.litters.A;
  assert.equal(A.alive, 12);
  assert.equal(A.unexplained.openLoss, 1);                         // the first count's missing piglet stays open
  assert.equal(d.flags.some((f) => f.reason === 'count_conflict'), false);
  const c = select.counts(d, 'A');
  assert.equal(c.conflict, false); assert.equal(c.review, false);
  assert.equal(c.counts.find((k) => k.id === late.id).agreesNet, true);
  // …but two that disagree net still disagree
  const x = book();
  x.farrowed('A', 14);
  const s2 = x.ev.map((e) => e.id);
  x.count('A', 13); x.death('A', [{ cause: 'crushed', n: 1 }]);
  x.count('A', 11, { seen: s2 });
  assert.equal(run(x, R1).flags.some((f) => f.reason === 'count_conflict'), true);
});

test('round 4 a nurse sow outside every task joins the task; her earlier facts stay on her earlier litter', () => {
  const b = book();
  b.farrowed('S', 10);                                             // in the task, nothing done, day 3
  b.farrowed('N', 12, { stillborn: 1 }, bornOn(-23));              // a previous batch: day 26
  b.weaned('N', { at: on(2) });
  const mv = b.move('S', 'N', 4, { at: on(3, '10:00') });
  const d = run(b, R1T(['S']), 3);
  const N = d.litters.N;
  assert.equal(N.inTask, true); assert.equal(N.task, 'T'); assert.equal(N.recordable, true);
  assert.deepEqual(N.nurse, { since: mv.id, at: on(3, '10:00'), from: 'S' });
  assert.deepEqual([N.born, N.dead.total, N.weaned, N.movedIn, N.alive], [0, 0, 0, 4, 4]);
  assert.deepEqual([N.earlier.born, N.earlier.dead, N.earlier.weaned, N.earlier.dayAge], [12, 1, 11, 26]);
  assert.equal(N.dayAge, 3);                                       // the arrivals' age
  assert.equal(N.doses.iron3.owed, 4); assert.equal(N.doses.iron3.status, 'due');
  assert.ok(balances(N));
  b.treat('N', 'iron3', 4, { at: on(3, '10:30') });
  const d2 = run(b, R1T(['S']), 3);
  assert.equal(d2.rejected.length, 0);
  assert.equal(d2.litters.N.doses.iron3.done, true);
  assert.deepEqual(d2.tasks[0].litters, ['S', 'N']);
  // a litter with no task piglets still records no treatments
  const c = book();
  c.farrowed('E', 7); const t = c.treat('E', 'iron3', 7);
  assert.equal(rejectedReason(run(c, R1T(['S'])), t), 'no_task');
});

test('round 4 possible double: `same` withdraws one record, `twice` keeps both, a double dose for the vet, counted once', () => {
  const mk = () => {
    const b = book();
    b.farrowed('A', 11);
    const seen = b.ev.map((e) => e.id);
    const p1 = b.treat('A', 'iron3', 11, { seen, who: 'G.H', at: on(3, '09:00') });
    const p2 = b.treat('A', 'iron3', 11, { seen, who: 'L.M', at: on(3, '09:05') });
    return { b, p1, p2 };
  };
  let { b, p1, p2 } = mk();
  assert.equal(select.reviews(run(b, R1)).items.filter((i) => i.kind === 'double').length, 1);
  const dd = select.doubleDraft(run(b, R1), { litter: 'A', dose: 'iron3', records: [p1.id, p2.id], answer: 'twice' });
  assert.deepEqual([dd.why, dd.after], [null, { treated: 11, owed: 0, doubleDoses: 1 }]);
  assert.equal(select.doubleDraft(run(b, R1), { litter: 'A', dose: 'iron3', records: [p1.id, p2.id], answer: 'same' }).event.withdraw, p2.id);
  b.ev.push({ id: 'dbl', type: 'double', litter: 'A', dose: 'iron3', records: [p1.id, p2.id], answer: 'twice', at: on(3, '10:00'), who: 'G.H' });
  let d = run(b, R1);
  let D = d.litters.A.doses.iron3;
  assert.equal(D.records.length, 2);
  assert.equal(D.treated, 11);                                      // counted once toward done
  assert.deepEqual(D.doubleDoses.map((x) => [x.records.join(','), x.n, x.event]), [[p1.id + ',' + p2.id, 11, 'dbl']]);
  assert.deepEqual(D.possibleDoubleTreatment, []);
  assert.equal(select.reviews(d).items.length, 0);
  ({ b, p1, p2 } = mk());
  b.ev.push({ id: 'dbl', type: 'double', litter: 'A', dose: 'iron3', records: [p1.id, p2.id], answer: 'same', withdraw: p2.id, at: on(3, '10:00'), who: 'G.H' });
  d = run(b, R1);
  D = d.litters.A.doses.iron3;
  assert.deepEqual(D.records.map((r) => r.id), [p1.id]);
  assert.equal(D.treated, 11); assert.equal(D.done, true);
  assert.deepEqual(D.possibleDoubleTreatment, []);
  assert.deepEqual(D.doubles.map((x) => [x.answer, x.withdrawn]), [['same', p2.id]]);
  assert.equal(select.reviews(d).items.length, 0);
});

test('round 4 End is allowed with review items open; they freeze as unresolved at End and stay answerable', () => {
  const b = book();
  b.farrowed('A', 11);
  const seen = b.ev.map((e) => e.id);
  const p1 = b.treat('A', 'iron3', 11, { seen, at: on(3, '09:00') });
  const p2 = b.treat('A', 'iron3', 11, { seen, at: on(3, '09:05'), who: 'L.M' });
  b.ev.push({ id: 'END', type: 'end_task', at: on(5, '16:00'), who: 'G.H' });
  b.ev.push({ id: 'dbl', type: 'double', litter: 'A', dose: 'iron3', records: [p1.id, p2.id], answer: 'twice', at: on(6), who: 'G.H' });
  const d = run(b, R1T(['A']), 6);
  assert.equal(d.rejected.length, 0);
  const e = select.end(d);
  assert.deepEqual(e.atEnd.reviews.map((r) => [r.kind, r.litter, r.status]), [['double', 'A', 'unresolved_at_end']]);
  const r = select.reviews(d);
  assert.deepEqual(r.items, []);
  assert.deepEqual(r.answeredAfterEnd.map((x) => [x.kind, x.litter, x.answer]), [['double', 'A', 'twice']]);
});

test('death corrections: withdraw a death, or move it to another litter (through Edit)', () => {
  const b = book();
  b.farrowed('A', 12); b.farrowed('B', 10);
  const dth = b.death('A', [{ cause: 'crushed', n: 1 }]);
  let d = run(b, R1);
  const ed = select.edit(d, 'A');
  assert.deepEqual(ed.deaths.map((x) => [x.id, x.n, x.movable]), [[dth.id, 1, true]]);
  const w = select.edit(d, 'A', { deaths: { [dth.id]: { void: true } } });
  assert.equal(w.why, null);
  assert.deepEqual(w.changes, [{ kind: 'death_void', death: dth.id, n: 1 }]);
  assert.deepEqual(w.effects.A, [11, 12]);
  const m = select.edit(d, 'A', { deaths: { [dth.id]: { to: 'B' } } });
  assert.deepEqual(m.changes, [{ kind: 'death_move', death: dth.id, n: 1, to: 'B' }]);
  assert.deepEqual([m.effects.A, m.effects.B], [[11, 12], [10, 9]]);
  b.ev.push(Object.assign({ id: 'X', at: on(3, '11:00'), who: 'G.H' }, m.events[0]));
  d = run(b, R1);
  assert.deepEqual([d.litters.A.alive, d.litters.B.alive, d.litters.B.dead.total], [12, 9, 1]);
  const rec = select.record(d, 'B').days[0].entries.find((x) => x.kind === 'correction');
  assert.equal(rec.changes[0].kind, 'death_move');
});

test('R1-9 a body with the tag of a piglet a count found missing closes that loss', () => {
  const b = book();
  b.farrowed('A', 12);
  b.identity('A', 'add', { rowId: 'r1', tag: '004101' });
  b.identity('A', 'add', { rowId: 'r2', tag: '004102' });
  const loss = b.count('A', 11);                                    // unnamed: 10 untagged could cover it
  let d = run(b, R1);
  const dd = select.deathDraft(d, 'A', { picks: { r1: 'crushed' }, fromLoss: { r1: loss.id } });
  assert.equal(dd.why, null);
  assert.deepEqual(dd.after, { alive: 11, dead: 1, openLoss: 0 });
  assert.equal(dd.roster.find((r) => r.rowId === 'r1').canBeMissing, true);
  b.death('A', [{ cause: 'crushed', rowId: 'r1', fromLoss: loss.id }]);
  d = run(b, R1);
  assert.deepEqual([d.litters.A.alive, d.litters.A.unexplained.openLoss, d.litters.A.dead.total], [11, 0, 1]);
  assert.equal(d.litters.A.identity.rows.find((r) => r.rowId === 'r1').status, 'dead');
  allBalanced(d);
});

test('R1-10 select.balance: the header identity born + in − out − dead − weaned ± unexplained = alive', () => {
  const b = book();
  b.farrowed('A', 12, { stillborn: 1 }); b.farrowed('B', 10);
  b.move('A', 'B', 2); b.death('A', [{ cause: 'crushed', n: 1 }]); b.count('A', 7); b.count('B', 13);
  const d = run(b, R1);
  const A = select.balance(d, 'A'), B = select.balance(d, 'B');
  assert.deepEqual(A, { litter: 'A', born: 12, dead: 2, movedIn: 0, movedOut: 2, weaned: 0, gain: 0, loss: 1, alive: 7, holds: true, earlier: null });
  assert.equal(B.gain, 1); assert.equal(B.alive, 13); assert.equal(B.holds, true);
});

test('R1-17 identity is owed on its configured day (Q17)', () => {
  const cfg = Object.assign({}, R1, { identity: { scheme: 'tag', who: 'all', day: 3 } });
  const b = book();
  b.farrowed('A', 4); b.farrowed('C', 3, {}, bornOn(4));
  let d = run(b, cfg, 5);
  assert.deepEqual(select.identityDue(d, 'A'), { litter: 'A', scheme: 'tag', who: 'all', day: 3, status: 'late', lateBy: 2, inDays: 0, owed: 4, identified: 0, of: 4, done: false });
  assert.equal(select.identityDue(d, 'C').status, 'later');
  for (let i = 1; i <= 4; i++) b.identity('A', 'add', { rowId: 'a' + i, tag: 'T' + i });
  d = run(b, cfg, 5);
  assert.equal(select.identityDue(d, 'A').status, 'done');
  // the room counts it as owed only when asked (the room page opts in)
  const e = book(); e.farrowed('A', 4); e.treat('A', 'iron3', 4); e.treat('A', 'tail', 4);
  const r = select.room(run(e, cfg, 3), { lens: 'all', identity: true }).rows.find((x) => x.litter === 'A');
  assert.equal(r.kind, 'owes'); assert.deepEqual(r.identity, { status: 'due', owed: 4, lateBy: 0 });
});

test('N4 select.reviews lists what is held for review in a room: doubles, disputed counts, held bodies, concurrent corrections', () => {
  const b = book();
  b.farrowed('A', 11); b.farrowed('C', 14); b.farrowed('H', 14);
  const seen = b.ev.map((e) => e.id);
  b.treat('A', 'iron3', 11, { seen }); b.treat('A', 'iron3', 11, { seen });
  b.count('C', 13, { seen }); b.count('C', 11, { seen });
  const loss = b.count('H', 13);
  const s2 = b.ev.map((e) => e.id);
  b.death('H', [{ cause: 'crushed', n: 1 }], { seen: s2, lossAlloc: [{ lossId: loss.id, qty: 1 }] });
  b.death('H', [{ cause: 'crushed', n: 1 }], { seen: s2, lossAlloc: [{ lossId: loss.id, qty: 1 }] });
  const t = b.treat('A', 'tail', 11);
  const s3 = b.ev.map((e) => e.id);
  b.correction(t.id, { set: { n: 10, deferred: { n: 1, reason: 'weak' } }, seen: s3 });
  b.correction(t.id, { set: { n: 9, deferred: { n: 2, reason: 'weak' } }, seen: s3 });
  const r = select.reviews(run(b, R1), { room: 'R3' });
  assert.deepEqual(r.items.map((i) => [i.kind, i.litter]).sort(), [['correction', 'A'], ['count', 'C'], ['double', 'A'], ['held', 'H']]);
  assert.equal(r.n, 4);
});

test('R1-15 the room\'s last record is the latest by causal order, and names its dose', () => {
  const b = book();
  b.farrowed('A', 11, {}, { at: on(0) }); b.farrowed('B', 11, {}, { at: on(0) });
  const seen = b.ev.map((e) => e.id);
  const off = b.treat('B', 'iron3', 11, { at: on(3, '11:00'), seen, who: 'L.M' });   // a phone with a fast clock
  const t = b.treat('A', 'iron3', 11, { at: on(3, '10:40'), seen: seen.concat([off.id]) });
  const last = select.room(run(b, R1), { lens: 'all' }).lastRecord;
  assert.equal(last.id, t.id);                                      // it saw the other: later, whatever the clocks say
  assert.equal(last.dose, 'iron3'); assert.equal(last.tx, 'iron');
});

test('N7 a double-issued tag: an add with twinOf is a separate piglet (identified, done, sex counts, pairs)', () => {
  const cfg = Object.assign({}, R1, { identity: { scheme: 'tag', who: 'all', day: 3 } });
  const b = book();
  b.farrowed('A', 3);
  b.identity('A', 'add', { rowId: 'r1', tag: '004301', sex: 'b' });
  b.identity('A', 'add', { rowId: 'r2', tag: '004301', sex: 'g', twinOf: 'r1' });   // a second piglet with the same printed number
  let I = run(b, cfg).litters.A.identity;
  assert.deepEqual([I.identified, I.distinct, I.pairs, I.done], [2, 2, 0, false]);
  assert.deepEqual(I.sameTag.map((g) => [g.tag, g.twin, g.rows.length]), [['004301', true, 2]]);
  const sc = run(b, cfg).litters.A.sexCounts;
  assert.deepEqual([sc.boars, sc.gilts], [1, 1]);
  b.identity('A', 'add', { rowId: 'r3', tag: '004301', sex: 'b' });                // a sync duplicate of r1 on top: one pair, not two
  I = run(b, cfg).litters.A.identity;
  assert.deepEqual([I.identified, I.pairs, I.done], [2, 1, false]);
  const c = book();
  c.farrowed('A', 2);
  c.identity('A', 'add', { rowId: 'r1', tag: '004301' });
  c.identity('A', 'add', { rowId: 'r2', tag: '004301', twinOf: 'r1' });
  assert.equal(run(c, cfg).litters.A.identity.done, true);                         // both piglets identified
});

test('R1-15 every fixture log is causally consistent with its stamps: the causal last record is the latest-stamped', async () => {
  const F = await import('../ux/tasks/piglet-processing/fixtures.js');
  for (const [name, make] of Object.entries(F.VARIANTS)) {
    const v = make();
    const d = derive(v.events, v.config, { today: v.today });
    assert.deepEqual(d.rejected.map((r) => r.id), [], name + ': every fixture event is accepted');
    // an online write (no `seen`) is never stamped before an event it counts as having seen
    let latest = '';
    for (const e of v.events) {
      if (!Array.isArray(e.seen)) assert.ok(e.at >= latest || e.type === 'correction', name + ': ' + e.id + ' at ' + e.at + ' comes after ' + latest);
      if (!Array.isArray(e.seen) && e.at > latest) latest = e.at;
    }
    // among the litter events no other write is concurrent with, the latest stamp is the room's Last record
    const bad = new Set(d.rejected.map((r) => r.id));
    const free = v.events.filter((e) => (e.litter || e.from) && !bad.has(e.id) && !v.events.some((o) => d.causal.concurrent(o.id, e.id)));
    const top = free.reduce((m, e) => (!m || e.at > m.at ? e : m), null);
    const last = select.room(d, { lens: 'all' }).lastRecord;
    if (top) assert.equal(last.at >= top.at, true, name + ': Last record ' + last.at + ' ' + last.type + ' is not before ' + top.at + ' ' + top.type);
  }
});

test('N12 a split deferral carries its by-reason counts onto the record and the owed', () => {
  const b = book();
  b.farrowed('A', 12);
  const t = b.treat('A', 'iron3', 9, { deferred: { n: 3, reason: 'weak_sick', by: { weak: 2, sick: 1 } } });
  let d = run(b, R1);
  const D = d.litters.A.doses.iron3;
  assert.deepEqual(D.records[0].deferBy, { weak: 2, sick: 1 });
  assert.equal(D.deferred, 3); assert.equal(D.deferReason, 'weak_sick');
  assert.deepEqual(D.deferBy, { weak: 2, sick: 1 });
  assert.deepEqual(D.owedFrom.find((x) => x.kind === 'deferred').by, { weak: 2, sick: 1 });
  const row = select.litter(d, 'A').owed.find((x) => x.dose === 'iron3');
  assert.deepEqual(row.deferBy, { weak: 2, sick: 1 });
  // a one-reason deferral has no split
  const c = book(); c.farrowed('A', 12); c.treat('A', 'iron3', 10, { deferred: { n: 2, reason: 'weak' } });
  assert.equal(run(c, R1).litters.A.doses.iron3.deferBy, null);
  // the split must add up to the deferred
  const e = book(); e.farrowed('A', 12);
  const bad = e.treat('A', 'iron3', 9, { deferred: { n: 3, reason: 'weak_sick', by: { weak: 1, sick: 1 } } });
  assert.equal(rejectedReason(run(e, R1), bad), 'bad_numbers');
  // a catch-up of one weak piglet leaves the rest by reason unknown: the split is capped, never invented
  b.treat('A', 'iron3', 1, { deferred: { n: 2, reason: 'weak_sick', by: { weak: 1, sick: 1 } } });
  d = run(b, R1);
  assert.deepEqual(d.litters.A.doses.iron3.deferBy, { weak: 1, sick: 1 });
  assert.ok(t);
});

test('R1-21 an open possible double counts once toward End\'s Done (both records kept)', () => {
  const b = book();
  b.farrowed('A', 11);
  const seen = b.ev.map((e) => e.id);
  b.treat('A', 'iron3', 11, { seen }); b.treat('A', 'iron3', 10, { seen, deferred: { n: 1, reason: 'weak' } });
  const d = run(b, R1T(['A']));
  assert.equal(d.litters.A.doses.iron3.treated, 21);                 // the records, as written
  assert.equal(d.litters.A.doses.iron3.treatedOnce, 11);             // the act, counted once: the smaller record comes out
  const e = select.end(d);
  assert.equal(e.now.litters.A.done, 11);
  assert.equal(e.now.progress.done, 11);
});

test('R1-28 Q16 on a corrected castration: hernia, cryptorchid and kept boar leave the task, only deferred stays owed', () => {
  const b = book();
  b.farrowed('A', 12, {}, bornOn(-2));                              // day 5 on on(3)
  const c = b.castrate('A', { castrated: 5, deferred: 1, deferReason: 'weak' });
  const d = run(b, R1);
  const ed = select.edit(d, 'A', { marks: { [c.id]: { n: 3, reason: 'hernia' } } });
  assert.equal(ed.why, null);
  assert.deepEqual(ed.events[0].changes[0].set.castration, { castrated: 3, deferred: 1, deferReason: 'weak', hernia: 2 });
  assert.deepEqual(ed.changes[0].exempt, 2);
  assert.deepEqual(ed.after.owed.castrate, 1);                      // the weak one only
  const dr = select.edit(d, 'A', { marks: { [c.id]: { n: 4, reason: 'sick' } } });
  assert.deepEqual(dr.events[0].changes[0].set.castration, { castrated: 4, deferred: 2, deferReason: 'sick' });
  assert.deepEqual(dr.after.owed.castrate, 2);
});

test('names: people are shown in full (farrowing\'s names) — person(), config.people, whoName on the last record', async () => {
  const cfg = Object.assign({}, R1, { people: { 'G.H': 'G. Hansen', 'L.M': 'L. Madsen' } });
  assert.equal(LG.person('G.H', cfg), 'G. Hansen');
  assert.equal(LG.person('X.Y', cfg), 'X.Y');                       // unknown initials stay as they are
  assert.equal(LG.person(null, cfg), null);
  const b = book();
  b.farrowed('A', 11); b.treat('A', 'iron3', 11, { who: 'L.M' });
  const d = run(b, cfg);
  assert.equal(LG.person('G.H', d), 'G. Hansen');                    // a derived ledger carries its config's people
  assert.equal(d.litters.A.lastEvent.whoName, 'L. Madsen');
  assert.equal(d.litters.A.lastRecord.whoName, 'L. Madsen');
  const last = select.room(d, { lens: 'all' }).lastRecord;
  assert.equal(last.whoName, 'L. Madsen');
  // the fixture farm names its people; with nothing passed, person() uses the people the fixtures defined
  const F = await import('../ux/tasks/piglet-processing/fixtures.js');
  assert.deepEqual(F.PEOPLE, { 'G.H': 'G. Hansen', 'L.M': 'L. Madsen', 'A.K': 'A. Karlsen' });
  assert.equal(LG.person('A.K'), 'A. Karlsen');
  assert.equal(LG.PPLedger.person('G.H'), 'G. Hansen');
  const v = F.VARIANTS.base();
  assert.equal(derive(v.events, v.config, { today: v.today }).config.people['L.M'], 'L. Madsen');
});

// ---- scenario round 2 (R2-n) and owner round 6 ------------------------------------------------

test('R2-3 a Move out of a litter with an open loss can close it: 11 → 11, and the loss line has an "in another crate" door', () => {
  const b = book();
  b.farrowed('A', 12); b.farrowed('B', 11);
  const loss = b.count('A', 11);
  const d = run(b, R1);
  const plain = select.moveDraft(d, { from: 'A', to: 'B', n: 1 });
  assert.deepEqual(plain.openLoss, { id: loss.id, open: 1 });          // the Move offers to close it
  assert.deepEqual(plain.delta.from, [11, 10]);
  const closing = select.moveDraft(d, { from: 'A', to: 'B', n: 1, closesLoss: true });
  assert.deepEqual(closing.delta, { from: [11, 11], to: [11, 12] });
  assert.deepEqual(closing.event.explains, [loss.id, null]);
  assert.equal(closing.closes, loss.id);
  const line = select.explain(d, { litter: 'A' }).lines[0];
  assert.deepEqual(line.elsewhere, { from: 'A', n: 1, closesLoss: true, explains: [loss.id, null] });
  b.ev.push(Object.assign({ id: 'mv', at: on(3, '10:00'), who: 'G.H' }, closing.event));
  const A = run(b, R1).litters.A;
  assert.deepEqual([A.alive, A.unexplained.openLoss, A.movedOut], [11, 0, 1]);
  allBalanced(run(b, R1));
});

test('R2-4 answering the source of a Don\'t-know move narrows the receiver\'s unknown group', () => {
  const mk = () => {
    const b = book();
    b.farrowed('S', 14); b.farrowed('R', 8);
    b.treat('S', 'iron3', 12, { deferred: { n: 2, reason: 'weak' } });
    b.treat('R', 'iron3', 8);
    const mv = b.move('S', 'R', 3, { answers: { iron3: 'unknown' } });
    return { b, mv };
  };
  // the source records the 2 it still owes: so none of the 3 moved were the weak ones — all 3 had it
  let { b } = mk();
  b.treat('S', 'iron3', 2);
  let R = run(b, R1).litters.R.doses.iron3;
  assert.deepEqual([R.unknownAfterMove, R.owed, R.carriedFromMove], [0, 0, 3]);
  // the source finds none still owe: the 2 weak ones were among the 3 — 2 owe at the receiver, 1 had it
  ({ b } = mk());
  b.ev.push({ id: 'chk', type: 'check', litter: 'S', dose: 'iron3', owed: 0, at: on(3, '11:00'), who: 'G.H' });
  R = run(b, R1).litters.R.doses.iron3;
  assert.deepEqual([R.unknownAfterMove, R.owed, R.carriedFromMove], [0, 2, 1]);
  allBalanced(run(b, R1));
});

test('R2-5 arrivals owe their own castration on any receiver; arrivals are late by their own age only', () => {
  const b = book();
  b.farrowed('S', 10, {}, bornOn(-2));                               // day 5 on on(3): castration due, none done
  b.farrowed('R', 8);                                                // day 3: castration in 2 days
  b.treat('R', 'iron3', 8); b.treat('R', 'tail', 8);
  b.treat('S', 'iron3', 10, { at: on(1) }); b.treat('S', 'tail', 10, { at: on(1) });
  b.move('S', 'R', 3);
  let d = run(b, R1);
  const C = d.litters.R.doses.castrate;
  assert.equal(C.status, 'due');                                      // the arrivals' castration is due today
  assert.deepEqual(C.groups.map((g) => [g.kind, g.n, g.dayAge, g.status]), [['arrival', 3, 5, 'due'], ['own', 8, 3, 'later']]);
  assert.equal(C.owed, null);                                         // males are counted as you cut
  assert.ok(select.litter(d, 'R').owed.some((x) => x.dose === 'castrate'));
  assert.equal(select.room(d, { lens: 'all' }).rows.find((r) => r.litter === 'R').kind, 'owes');
  // day-3 arrivals in a day-4 litter are due today, not late (their unknown iron included)
  const c = book();
  c.farrowed('A', 14); c.treat('A', 'iron3', 12, { deferred: { n: 2, reason: 'weak' } });
  c.farrowed('B', 8, {}, bornOn(-1));                                 // day 4
  c.treat('B', 'iron3', 8, { at: on(3) });
  c.move('A', 'B', 3, { answers: { iron3: 'unknown' } });
  d = run(c, R1);
  const I = d.litters.B.doses.iron3;
  assert.equal(I.status, 'due'); assert.equal(I.lateBy, 0);
  assert.deepEqual(I.unknownGroups.map((g) => [g.n, g.dayAge, g.status]), [[3, 3, 'due']]);
});

test('R2-6 after a settled count dispute: the held line is not "explained", the counts say what happened to them', () => {
  const b = book();
  b.farrowed('A', 14);
  const seen = b.ev.map((e) => e.id);
  const gh = b.count('A', 13, { at: on(3, '09:40') });
  b.death('A', [{ cause: 'crushed', n: 1 }], { at: on(3, '09:45') });
  const lm = b.count('A', 11, { at: on(3, '09:50'), seen, who: 'L.M' });
  const settle = b.count('A', 13, { at: on(3, '10:10') });
  const d = run(b, R1);
  const line = d.litters.A.unexplained.losses.find((x) => x.id === gh.id);
  assert.deepEqual([line.qty, line.open, line.held, line.explained], [1, 0, 1, 0]);
  assert.deepEqual(line.explainedBy, []);                             // no false Move
  assert.deepEqual(line.heldBy.map((x) => x.kind), ['disputed']);
  const st = Object.fromEntries(d.litters.A.counts.map((c) => [c.id, c.status]));
  assert.deepEqual(st, { [gh.id]: 'settled', [lm.id]: 'settled', [settle.id]: 'match' });
  const rec = select.record(d, 'A').days[0].entries.filter((x) => x.kind === 'count');
  assert.deepEqual(rec.map((x) => [x.id, x.status, x.settledBy]).sort(), [[gh.id, 'settled', settle.id], [lm.id, 'settled', settle.id], [settle.id, 'match', null]].sort());
});

test('R2-8 a closed litter says why: all dead, all moved out, weaned, or a mix', () => {
  const b = book();
  b.farrowed('A', 3); b.farrowed('B', 3); b.farrowed('C', 9);
  b.death('A', [{ cause: 'crushed', n: 3 }]);
  b.move('B', 'C', 3);
  const d = run(b, R1);
  assert.equal(d.litters.A.closed, true); assert.equal(d.litters.A.closedBy, 'dead');
  assert.equal(d.litters.B.closedBy, 'moved');
  assert.equal(d.litters.C.closedBy, null);
  assert.deepEqual(d.litters.A.closedCounts, { dead: 3, movedOut: 0, weaned: 0 });
});

test('R2-17 a deferral completed later reads as one complete record: 12 of 12, history beneath', () => {
  const b = book();
  b.farrowed('A', 12);
  const t1 = b.treat('A', 'iron3', 10, { deferred: { n: 2, reason: 'weak' }, at: on(3, '09:00') });
  const t2 = b.treat('A', 'iron3', 2, { at: on(3, '10:35') });
  const d = run(b, R1);
  const r = select.litter(d, 'A').recorded.find((x) => x.dose === 'iron3');
  assert.deepEqual(r.whole, { n: 12, of: 12, complete: true, deferredLeft: 0 });
  assert.deepEqual(r.records.map((x) => [x.id, x.deferred, x.deferredLeft]), [[t1.id, 2, 0], [t2.id, 0, 0]]);
  // still open: the whole reads 10 of 12
  const c = book(); c.farrowed('A', 12); c.treat('A', 'iron3', 10, { deferred: { n: 2, reason: 'weak' } });
  assert.deepEqual(select.litter(run(c, R1), 'A').recorded[0].whole, { n: 10, of: 12, complete: false, deferredLeft: 2 });
});

test('round 6 a nurse with her own piglets joins whole; the Move preview lists what her own piglets owe', () => {
  const b = book();
  b.farrowed('S', 6);                                                  // in the task
  b.farrowed('E', 8, { stillborn: 1 }, bornOn(-1));                    // outside: day 4, her own 7, nothing done
  const d = run(b, R1T(['S']));
  const pv = select.moveDraft(d, { from: 'S', to: 'E', n: 1 });
  assert.equal(pv.joins.task, 'T'); assert.equal(pv.joins.earlier, false);
  assert.equal(pv.joins.own.n, 7);
  assert.deepEqual(pv.joins.own.owes.map((x) => [x.dose, x.n, x.status, x.lateBy]), [['iron3', 7, 'late', 1], ['tail', 7, 'late', 1]]);
  b.move('S', 'E', 1);
  const E = run(b, R1T(['S'])).litters.E;
  assert.equal(E.inTask, true); assert.equal(E.born, 8); assert.equal(E.earlier, null);
  assert.equal(E.nurse.own, 7);
});

test('round 6 a possible double answered "different piglets": both records count in full', () => {
  const b = book();
  b.farrowed('A', 12);
  const seen = b.ev.map((e) => e.id);
  const p1 = b.treat('A', 'iron3', 6, { seen, deferred: { n: 6, reason: 'weak' }, who: 'G.H' });
  const p2 = b.treat('A', 'iron3', 6, { seen, deferred: { n: 6, reason: 'weak' }, who: 'L.M' });
  let D = run(b, R1).litters.A.doses.iron3;
  assert.deepEqual([D.treatedOnce, D.owed], [6, 6]);
  b.ev.push({ id: 'dbl', type: 'double', litter: 'A', dose: 'iron3', records: [p1.id, p2.id], answer: 'different', at: on(3, '11:00'), who: 'G.H' });
  const d = run(b, R1);
  D = d.litters.A.doses.iron3;
  assert.deepEqual([D.treated, D.treatedOnce, D.owed, D.done], [12, 12, 0, true]);
  assert.deepEqual(D.doubles.map((x) => [x.answer, x.who]), [['different', 'G.H']]);
  assert.deepEqual(D.possibleDoubleTreatment, []);
  assert.equal(select.doubleDraft(run(b.ev.length ? { ev: b.ev.slice(0, -1) } : b, R1), { litter: 'A', dose: 'iron3', records: [p1.id, p2.id], answer: 'different' }).after.owed, 0);
});

test('R2-11 one "owe today" for room, overview and End; reviews in one unit (items to answer)', () => {
  const cfg = Object.assign({}, R1, { identity: { scheme: 'tag', who: 'all', day: 3 } }, { task: { id: 'T', litters: ['A', 'B', 'C', 'D'] } });
  const b = book();
  b.farrowed('A', 4);                                                  // owes iron, tail, tag
  b.farrowed('B', 4); b.treat('B', 'iron3', 4); b.treat('B', 'tail', 4);   // treatments done, tag left
  b.farrowed('C', 4, {}, bornOn(2));                                   // day 1: nothing due
  b.farrowed('D', 4); b.treat('D', 'iron3', 4); b.treat('D', 'tail', 4);
  for (let i = 1; i <= 4; i++) b.identity('D', 'add', { rowId: 'd' + i, tag: 'D' + i });
  b.count('D', 3, { missingRows: ['d1'] });                           // D: done, one open line to explain
  const d = run(b, cfg);
  assert.deepEqual(d.rejected, []);
  const o = select.oweToday(d);
  assert.deepEqual(o.litters, ['A', 'B']);
  assert.deepEqual([o.n, o.treatments, o.identityOnly], [2, 1, 1]);
  assert.equal(select.room(d, { lens: 'owed', identity: true }).lead, o.n);
  const r = select.reviews(d);
  assert.deepEqual([r.n, r.lines.length, r.toAnswer], [0, 1, 1]);
});

test('R2-12/13 the room row says what is owed now, deferred, open lines, identity vs treatments left', () => {
  const cfg = Object.assign({}, R1, { identity: { scheme: 'tag', who: 'all', day: 3 } });
  const b = book();
  b.farrowed('A', 12); b.treat('A', 'iron3', 10, { deferred: { n: 2, reason: 'weak' } }); b.treat('A', 'tail', 12);
  b.count('A', 11);
  const f = select.room(run(b, cfg), { lens: 'all', identity: true }).rows.find((x) => x.litter === 'A');
  assert.equal(f.owedNow, 2);                                          // piglets owing a treatment now, not the litter size
  assert.equal(f.deferred, 2);
  assert.deepEqual(f.open, { loss: 1, gain: 0, any: true });
  assert.deepEqual(f.left, { treatments: 1, identity: 11 });
  assert.equal(f.lateDays, 0);
});

test('R2-26 End: unfinished leaves out litters with only not-yet-due doses; a late mark accepted after End clears its not-done; rows include joined nurses', () => {
  const b = book();
  b.farrowed('A', 6); b.farrowed('Y', 5, {}, bornOn(2));             // A owes iron/tail; Y only not yet due
  b.farrowed('N', 4, {}, bornOn(-20)); b.weaned('N', { at: on(1) });
  b.move('A', 'N', 1, { at: on(3, '09:00') });
  const before = b.ev.map((e) => e.id);
  b.ev.push({ id: 'END', type: 'end_task', at: on(3, '16:00'), who: 'G.H' });
  b.treat('A', 'iron3', 5, { at: on(3, '15:50'), seen: before });      // stamped before End, synced after
  const d = run(b, R1T(['A', 'Y']), 3);
  const e = select.end(d);
  assert.equal(e.atEnd.unfinishedLitters.includes('Y'), false);
  assert.deepEqual(e.atEnd.notYetDueOnly, ['Y']);
  assert.deepEqual(e.litters, ['A', 'Y', 'N']);
  assert.equal(e.stillNotDone.A.some((x) => x.dose === 'iron3'), false); // the accepted late mark cleared it
  assert.equal(e.stillNotDone.A.some((x) => x.dose === 'tail'), true);
});

test('R2-N5 End lists orphaned litters and where their piglets went', () => {
  const b = book();
  b.farrowed('O', 6); b.farrowed('R', 8); b.farrowed('N', 5);
  b.sowDied('O', { at: on(2) });
  b.move('O', 'R', 4, { at: on(3, '09:00') }); b.move('O', 'N', 2, { at: on(3, '09:10') });
  const e = select.end(run(b, R1T(['O', 'R', 'N'])));
  assert.deepEqual(e.orphans, [{ litter: 'O', sowDied: { at: on(2), cause: 'prolapse' }, alive: 0, dead: 0, moved: [{ to: 'R', n: 4, at: on(3, '09:00') }, { to: 'N', n: 2, at: on(3, '09:10') }] }]);
});

test('R2-25 a death is withdrawn piece by piece: select.edit deaths[i].pieces, draft deaths[id].voidPieces', () => {
  const b = book();
  b.farrowed('A', 12);
  b.identity('A', 'add', { rowId: 'r1', tag: '004101' });
  const dth = b.death('A', [{ cause: 'crushed', n: 2 }, { cause: 'scours', rowId: 'r1' }]);
  const d = run(b, R1);
  const x = select.edit(d, 'A').deaths.find((y) => y.id === dth.id);
  assert.deepEqual(x.pieces.map((p) => [p.key, p.cause, p.rowId || null]), [['0:1', 'crushed', null], ['0:2', 'crushed', null], ['row:r1', 'scours', 'r1']]);
  const ed = select.edit(d, 'A', { deaths: { [dth.id]: { voidPieces: ['0:2', 'row:r1'] } } });
  assert.equal(ed.why, null);
  assert.deepEqual(ed.events[0].changes[0], { target: dth.id, set: { lines: [{ cause: 'crushed', n: 1 }] } });
  assert.deepEqual(ed.changes[0], { kind: 'death_pieces', death: dth.id, n: 2, left: 1 });
  assert.deepEqual(ed.effects.A, [9, 11]);
  // every piece withdrawn is the whole death withdrawn
  const all = select.edit(d, 'A', { deaths: { [dth.id]: { voidPieces: ['0:1', '0:2', 'row:r1'] } } });
  assert.deepEqual(all.events[0].changes[0], { target: dth.id, void: true });
});

test('R2-20 a Sow died mark is correctable: select.edit sow, draft.sow { void } | { to }', () => {
  const b = book();
  b.farrowed('A', 12); b.farrowed('B', 10);
  const sd = b.sowDied('A', { at: on(3, '06:20'), who: 'L.M' });
  const d = run(b, R1);
  assert.deepEqual(select.edit(d, 'A').sow, { id: sd.id, cause: 'prolapse', at: on(3, '06:20'), who: 'L.M' });
  assert.equal(select.edit(d, 'B').sow, null);
  const v = select.edit(d, 'A', { sow: { void: true } });
  assert.deepEqual(v.events[0].changes[0], { target: sd.id, void: true });
  assert.deepEqual(v.changes[0], { kind: 'sow_void', sow: sd.id });
  const m = select.edit(d, 'A', { sow: { to: 'B' } });
  assert.deepEqual(m.events[0].changes[0], { target: sd.id, set: { litter: 'B' } });
  assert.deepEqual(m.changes[0], { kind: 'sow_move', sow: sd.id, to: 'B' });
  b.ev.push(Object.assign({ id: 'X', at: on(3, '11:00'), who: 'G.H' }, m.events[0]));
  const d2 = run(b, R1);
  assert.equal(d2.litters.A.sowDied, null); assert.equal(d2.litters.B.sowDied.cause, 'prolapse');
});

test('R2-23 a body found in another crate: deathDraft foundIn, the death carries it', () => {
  const b = book();
  b.farrowed('A', 12);
  let d = run(b, R1);
  const dd = select.deathDraft(d, 'A', { tallies: { crushed: 1 }, foundIn: 'B10' });
  assert.equal(dd.event.foundIn, 'B10');
  b.ev.push(Object.assign({ id: 'dth', at: on(3, '10:00'), who: 'G.H' }, dd.event));
  d = run(b, R1);
  assert.equal(d.litters.A.deaths[0].foundIn, 'B10');
  assert.equal(select.record(d, 'A').days[0].entries.find((x) => x.kind === 'death').foundIn, 'B10');
});

test('R2-28 a done row keeps its lateness after reload (bulk and room)', () => {
  const { b, cfg } = roomBook();
  const late = book();
  late.farrowed('L', 9, {}, bornOn(-2));                                // day 5 on on(3): iron due day 3 → 2 days late
  late.treat('L', 'iron3', 9, { at: on(3, '08:00') });
  const d = run(late, R1);
  const row = select.bulkDraft(d, { dose: 'iron3' }).rows.find((r) => r.litter === 'L');
  assert.equal(row.kind, 'done'); assert.equal(row.lateBy, 2);
  const f = select.room(d, { lens: 'all' }).rows.find((r) => r.litter === 'L');
  assert.equal(f.doneLate, 2);
  assert.ok(b && cfg);
});
