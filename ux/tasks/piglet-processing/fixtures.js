/* Piglet processing (仔猪处理) — the one fixture every page renders from (ticket #19).

   Unit 7 (the room the pages walk) and Unit 8 (cross-room cases) as an EVENT LOG + CONFIG. Pages keep
   no litters of their own: they open a variant, derive it with the shared ledger (`ledger.js`) and
   render its selectors. Every page state is `variant (?data=) + UI state`; commits go through
   `append` and stay in this tab's log (sessionStorage), so room → litter → drawers → back agree.

   Today is Tue 29 Sep 2026, 10:30. Day-age: the birth day is day 0. The farm tags every piglet by
   day 3 (scheme tag · all · day 3); variants switch the farm to keepers or to notches.

   One story, one crate each (the page states that show it in brackets):
     A02 000231 · day 3 · 12 alive · owes iron and tail today; nobody tagged yet     [room, litter, dead, id, edit, record page]
     A04 000236 · day 3 · 11 · owes iron and tail                                    [id notch farm]
     A05 000240 · day 3 · 11 · iron recorded twice offline (possible double); tail 6 + 5 weak  [room, litter double-flag]
     A07 000245 · day 3 · 14 · owes iron and tail                                    [id keepers, dead farrowing record]
     B01 000187 · day 5 · 13 · sow died Sep 28 (prolapse); iron 2 days late; castration due; no birth weight  [room, litter late, edge orphan, move orphan]
     B02 000241 · day 4 · 8  · done so far                                           [move ask, unknown-check]
     B03 000199 · day 7 · 11 · castrated 4 + cryptorchid 1 + 2 sick deferred; coccidiosis due  [litter castrate-catchup]
     B04 000254 · day 9 · 10 · coccidiosis missed (window ended day 7); iron on the old product; 004512 crushed  [room, litter missed, id table]
     B06 000261 · day 3 · 12 · 9 identified (8 tags, a notch); nothing past day 0    [dead tagged, move source]
     B08 000270 · day 4 · 9  · done so far                                           [move receiver]
     B09 000247 · day 4 · 10 · iron 8 + 2 weak, tail 7 + 3 weak                      [move ask]
     B10 000265 · day 3 · 11 · owes iron and tail                                    [move into]
     C02 000462 · day 1 · 14 · iron and tail in 2 days; no birth weight              [room, edge birth weight, id early]
     C03 000288 · day 4 · 10 · done; 9 identified (8 tags + a notch)                 [move tagged]
     C04 000266 · day 3 · 9  · iron and tail recorded today 08:30                    [room done]
     C05 000292 · day 4 · 8  · iron and tail a day late                              [move arrivals, litter no-males]
     D01 000437 · day 0 · farrowing still open; cord marked at 8, one born after     [room chip, edge prelock, move prelock, dead farrowing]
     D02 000233 · day 26 · weaned Sep 28: a sow with no piglets (previous batch)     [move orphan → nurse]
     D03 000312 · day 5 · 11 · Set count 11 at 10:25 wrote a loss of 2; castration due  [room, dead open loss]
     D05 000296 · day 6 · 10 · iron and tail recorded late; castrated; coccidiosis tomorrow  [room]
     D06 000429 · day 1 · 6  · sow died mid-farrowing (Born derived: 8)              [edge orphan-unlocked]
     E01 000395 · day 2 · 7  · outside the task (a late farrower)                    [room, edge no-task]
     Unit 8: A03 · F02 (piglet 000512) · F03 · F05 (outside this task)               [move cross, room find, end moves]

   Not in the ledger — page facts carried here and reported as ledger issues: the sow's tag and parity,
   the birth litter weight, weigh-day litter weights and boar/gilt counts, drafts held on this phone. */

import { derive, append, select, dayNumber } from './ledger.js';

// ---------------------------------------------------------------------------------------------
// config

export const TODAY = '2026-09-29';
export const NOW = '2026-09-29T10:30';
export const ME = 'G.H';

const TASK7 = ['A02', 'A04', 'A05', 'A07', 'B01', 'B02', 'B03', 'B04', 'B06', 'B08', 'B09', 'B10', 'C02', 'C03', 'C04', 'C05', 'D01', 'D03', 'D05', 'D06'];

export const FARMS = {
  tag: { scheme: 'tag', who: 'all', day: 3 },
  keepers: { scheme: 'tag', who: 'candidates', day: 3 },
  notch: { scheme: 'notch', who: 'all', day: 3 }
};

export const CONFIG = {
  doses: [
    { id: 'cord', tx: 'cord', due: 0, visible: true },
    { id: 'nasal', tx: 'nasal', due: 0 },
    { id: 'iron3', tx: 'iron', due: 3, product: 'iron', amount: '1 mL' },
    { id: 'tail', tx: 'tail', due: 3, last: 7, visible: true },
    { id: 'castrate', tx: 'castrate', due: 5, visible: true, castration: true },
    { id: 'cocci', tx: 'coccidiosis', due: 7, last: 7, product: 'cocci', amount: '1 mL' },
    { id: 'iron14', tx: 'iron', due: 14, product: 'iron', amount: '1 mL' },
    { id: 'health', tx: 'health', due: 21 }
  ],
  identity: FARMS.tag,
  task: { id: 'PP-U7-0926', litters: TASK7, farrowingTask: 'open' }
};

/* The sow and her crate: facts the ledger does not hold. `weight`: the birth litter weight
   (farrowing's optional fact at Finish), null while missing. `notchLitter`: the litter number a
   notch farm cuts. */
const W = (kg, at, who) => ({ kg, by: 'finish', at, who });
export const SOWS = {
  A02: { unit: 7, sow: '000231', parity: 3, weight: W('15.2', '2026-09-26T18:05', 'G.H') },
  A04: { unit: 7, sow: '000236', parity: 2, weight: W('13.4', '2026-09-26T16:30', 'L.M'), notchLitter: '118' },
  A05: { unit: 7, sow: '000240', parity: 4, weight: W('14.1', '2026-09-26T17:40', 'L.M') },
  A07: { unit: 7, sow: '000245', parity: 2, weight: W('18.6', '2026-09-26T20:10', 'L.M') },
  B01: { unit: 7, sow: '000187', parity: 5, weight: null },
  B02: { unit: 7, sow: '000241', parity: 3, weight: W('11.0', '2026-09-25T19:00', 'G.H') },
  B03: { unit: 7, sow: '000199', parity: 3, weight: W('14.4', '2026-09-22T18:30', 'L.M') },
  B04: { unit: 7, sow: '000254', parity: 2, weight: W('13.9', '2026-09-20T17:10', 'G.H') },
  B06: { unit: 7, sow: '000261', parity: 2, weight: W('16.8', '2026-09-26T21:15', 'L.M') },
  B08: { unit: 7, sow: '000270', parity: 2, weight: W('12.1', '2026-09-25T16:40', 'G.H') },
  B09: { unit: 7, sow: '000247', parity: 1, weight: W('12.6', '2026-09-25T15:20', 'L.M') },
  B10: { unit: 7, sow: '000265', parity: 4, weight: W('15.5', '2026-09-26T14:00', 'G.H') },
  C02: { unit: 7, sow: '000462', parity: 4, weight: null },
  C03: { unit: 7, sow: '000288', parity: 2, weight: W('13.0', '2026-09-25T18:50', 'L.M') },
  C04: { unit: 7, sow: '000266', parity: 1, weight: W('11.9', '2026-09-26T19:30', 'G.H') },
  C05: { unit: 7, sow: '000292', parity: 3, weight: W('10.2', '2026-09-25T20:05', 'L.M') },
  D01: { unit: 7, sow: '000437', parity: 2, weight: null },
  D02: { unit: 7, sow: '000233', parity: 5, weight: W('15.0', '2026-09-03T18:00', 'G.H') },
  D03: { unit: 7, sow: '000312', parity: 3, weight: W('17.3', '2026-09-24T18:20', 'L.M') },
  D05: { unit: 7, sow: '000296', parity: 2, weight: W('13.2', '2026-09-23T19:10', 'G.H') },
  D06: { unit: 7, sow: '000429', parity: 1, weight: null },
  E01: { unit: 7, sow: '000395', parity: 2, weight: null },
  A03: { unit: 8, sow: '000318', parity: 3, weight: W('13.5', '2026-09-25T18:00', 'A.K') },
  F02: { unit: 8, sow: '000506', parity: 2, weight: null },
  F03: { unit: 8, sow: '000511', parity: 4, weight: null },
  F05: { unit: 8, sow: '000517', parity: 1, weight: null }
};

/* Weigh-day litter weights (identity and weigh, S4) and the weigh-day 21 weights End hands to
   weaning: not in the ledger. */
export const LITTER_WEIGHTS = {
  base: { B04: [{ kg: '15.9', day: 3, at: '2026-09-23T08:40', who: 'L.M' }] },
  late: {
    A02: [{ kg: '66.0', day: 21 }], A05: [{ kg: '63.8', day: 21 }], B01: [{ kg: '51.3', day: 21 }], B04: [{ kg: '15.9', day: 3 }, { kg: '57.5', day: 21 }],
    B03: [{ kg: '58.9', day: 21 }], B02: [{ kg: '49.4', day: 21 }], B06: [{ kg: '61.1', day: 21 }], B08: [{ kg: '55.2', day: 21 }], B09: [{ kg: '54.0', day: 21 }],
    B10: [{ kg: '59.6', day: 21 }], C03: [{ kg: '52.8', day: 21 }], C04: [{ kg: '68.4', day: 21 }], C05: [{ kg: '47.9', day: 21 }], D03: [{ kg: '62.7', day: 21 }],
    D05: [{ kg: '60.2', day: 21 }], A04: [{ kg: '58.1', day: 21 }], A07: [{ kg: '70.3', day: 21 }]
  }
};

/* Drafts held on this phone: the ledger cannot see them; the End review warns from them. */
export const DEVICE_DRAFTS = [{ kind: 'death', litter: 'D03' }, { kind: 'edit', litter: 'A05' }];

// ---------------------------------------------------------------------------------------------
// event helpers

function builder() {
  const events = [];
  let k = 0;
  const push = (e, prefix) => { const ev = Object.assign({ id: e.id || (prefix || e.type) + '-' + String(++k).padStart(3, '0') }, e); events.push(ev); return ev; };
  const ids = () => events.map((e) => e.id);
  return {
    events, ids, push,
    farrowed(litter, room, birthDate, born, dead, at, who, locked = true) {
      return push({ type: 'farrowed', litter, room, birthDate, born, dead, locked, at, who }, 'F-' + litter);
    },
    treat(litter, dose, at, who, n, extra) { return push(Object.assign({ type: 'treat', litter, dose, n, at, who }, extra || {}), 'T-' + litter); },
    castrate(litter, at, who, c, extra) { return push(Object.assign({ type: 'treat', litter, dose: 'castrate', castration: c, at, who }, extra || {}), 'T-' + litter); },
    rows(litter, at, who, list, extra) {
      list.forEach((r, i) => {
        // one row a minute, as a hand works the litter
        const t = at.length > 10 ? new Date(Date.parse(at) + i * 60000) : null;
        const stamp = t ? at.slice(0, 11) + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') : at;
        push(Object.assign({ type: 'identity', op: 'add', litter, at: stamp, who }, extra || {}, r), 'I-' + litter);
      });
    },
    death(litter, at, who, lines, extra) { return push(Object.assign({ type: 'death', litter, lines, at, who }, extra || {}), 'D-' + litter); },
    count(litter, at, who, observed, extra) { return push(Object.assign({ type: 'count', litter, observed, at, who }, extra || {}), 'C-' + litter); },
    move(from, to, n, at, who, extra) { return push(Object.assign({ type: 'move', from, to, n, at, who }, extra || {}), 'MV'); }
  };
}

const birth = (day) => new Date(Date.UTC(2026, 8, 29) - day * 86400000).toISOString().slice(0, 10);
const on = (date, t) => date + 'T' + t;
const sep = (d, t) => '2026-09-' + String(d).padStart(2, '0') + 'T' + t;
const oct = (d, t) => '2026-10-' + String(d).padStart(2, '0') + 'T' + t;
/* Tag rows: consecutive 6-digit ear tags. */
function tags(litter, first, n, from = 1, extra) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(Object.assign({ rowId: litter + '-r' + (from + i), tag: String(first + i).padStart(6, '0') }, extra ? extra(i) : {}));
  return out;
}

// ---------------------------------------------------------------------------------------------
// base: the task on 29 Sep 10:30

function base(b) {
  const L = (crate, day, born, room = 7) => {
    const date = birth(day);
    b.farrowed(crate, room, date, born, { stillborn: 1 }, on(date, '18:00'), 'L.M');
    return date;
  };
  const day0 = (crate, date, who, n) => { b.treat(crate, 'cord', on(date, '18:20'), who, n); b.treat(crate, 'nasal', on(date, '18:22'), who, n); };
  let d;

  // day 3: iron and tail due today
  d = L('A02', 3, 13); day0('A02', d, 'L.M', 12);
  d = L('A04', 3, 12); day0('A04', d, 'L.M', 11);
  d = L('A05', 3, 12); day0('A05', d, 'L.M', 11);
  d = L('A07', 3, 15); day0('A07', d, 'G.H', 14);
  d = L('B06', 3, 13); day0('B06', d, 'L.M', 12);
  b.rows('B06', sep(27, '16:00'), 'L.M', [
    { rowId: 'B06-r1', tag: '271001', sex: 'g', weight: 1.6 }, { rowId: 'B06-r2', tag: '271002', sex: 'b', weight: 1.5 },
    { rowId: 'B06-r3', tag: '271003', sex: 'g', weight: 1.4 }, { rowId: 'B06-r4', tag: '271004', sex: 'b', weight: 1.1 },
    { rowId: 'B06-r5', tag: '271005', sex: 'g' }, { rowId: 'B06-r6', tag: '271006', sex: 'b', weight: 1.7 },
    { rowId: 'B06-r7', tag: '271007', sex: 'b', weight: 1.3 }, { rowId: 'B06-r8', tag: '271008', sex: 'g', weight: 1.5 },
    { rowId: 'B06-r9', notch: '27-14' }]);
  d = L('B10', 3, 12); day0('B10', d, 'G.H', 11);
  d = L('C04', 3, 10); day0('C04', d, 'G.H', 9);
  b.rows('C04', sep(29, '08:25'), 'G.H', [{ rowId: 'C04-r1', notch: '7-3' }]);

  // day 4: done so far
  d = L('B02', 4, 9); day0('B02', d, 'G.H', 8);
  b.treat('B02', 'iron3', sep(28, '08:10'), 'G.H', 8); b.treat('B02', 'tail', sep(28, '08:12'), 'G.H', 8);
  b.rows('B02', sep(28, '08:20'), 'G.H', tags('B02', 4201, 8, 1, (i) => (i === 6 ? { notch: '118-7' } : {})));
  d = L('B08', 4, 10); day0('B08', d, 'L.M', 9);
  b.treat('B08', 'iron3', sep(28, '08:30'), 'G.H', 9); b.treat('B08', 'tail', sep(28, '08:32'), 'G.H', 9);
  b.rows('B08', sep(28, '08:40'), 'G.H', tags('B08', 4281, 9));
  d = L('B09', 4, 11); day0('B09', d, 'L.M', 10);
  b.treat('B09', 'iron3', sep(28, '08:40'), 'L.M', 8, { deferred: { n: 2, reason: 'weak' } });
  b.treat('B09', 'tail', sep(28, '08:42'), 'L.M', 7, { deferred: { n: 3, reason: 'weak' } });
  b.rows('B09', sep(28, '08:50'), 'L.M', tags('B09', 4221, 10));
  d = L('C03', 4, 11); day0('C03', d, 'L.M', 10);
  b.treat('C03', 'iron3', sep(28, '09:00'), 'G.H', 10); b.treat('C03', 'tail', sep(28, '09:02'), 'G.H', 10);
  b.rows('C03', sep(28, '09:10'), 'G.H', tags('C03', 301, 8).concat([{ rowId: 'C03-r9', notch: '12-9' }]));
  d = L('C05', 4, 9); day0('C05', d, 'G.H', 8);
  L('A03', 4, 11, 8);                           // Unit 8: outside this task, so nothing can be treated here

  // day 5
  d = L('B01', 5, 14); day0('B01', d, 'G.H', 13);
  b.treat('B01', 'tail', sep(27, '07:52'), 'L.M', 13);
  b.rows('B01', sep(27, '08:00'), 'L.M', tags('B01', 4101, 12).concat([{ rowId: 'B01-r13', tag: '000391', notch: '9-2' }]));
  b.push({ type: 'sow_died', litter: 'B01', cause: 'prolapse', at: sep(28, '06:20'), who: 'L.M' }, 'S-B01');
  d = L('D03', 5, 14); day0('D03', d, 'L.M', 13);
  b.treat('D03', 'iron3', sep(27, '08:20'), 'L.M', 13); b.treat('D03', 'tail', sep(27, '08:22'), 'L.M', 13);
  b.rows('D03', sep(27, '08:30'), 'L.M', [{ rowId: 'D03-r1', tag: '000733', notch: '4-2' }]);

  // day 6
  d = L('D05', 6, 11); day0('D05', d, 'G.H', 10);
  b.treat('D05', 'iron3', sep(27, '09:00'), 'L.M', 10); b.treat('D05', 'tail', sep(27, '09:02'), 'L.M', 10);
  b.rows('D05', sep(27, '09:10'), 'L.M', tags('D05', 4351, 10));
  b.castrate('D05', sep(28, '09:30'), 'L.M', { castrated: 5 });
  L('F02', 6, 12, 8);
  b.rows('F02', sep(26, '09:00'), 'A.K', [{ rowId: 'F02-r1', tag: '000512', notch: '4-1' }]);

  // day 7: castrated 4 + cryptorchid 1 + 2 deferred (sick); coccidiosis due today
  d = L('B03', 7, 12); day0('B03', d, 'L.M', 11);
  b.treat('B03', 'iron3', sep(25, '07:50'), 'L.M', 11); b.treat('B03', 'tail', sep(25, '07:52'), 'L.M', 11);
  b.rows('B03', sep(25, '08:00'), 'L.M', tags('B03', 4131, 11));
  b.castrate('B03', sep(27, '08:02'), 'L.M', { castrated: 4, cryptorchid: 1, deferred: 2, deferReason: 'sick' });

  // day 9: coccidiosis missed (window ended day 7); iron on the old product; 004512 crushed on Sep 25;
  // 004517 was typed offline by L.M while A05 already had it (the same tag on two crates)
  d = L('B04', 9, 12); day0('B04', d, 'G.H', 11);
  b.treat('B04', 'iron3', sep(23, '08:05'), 'G.H', 11, { product: 'iron_old' });
  b.treat('B04', 'tail', sep(23, '08:07'), 'G.H', 11);
  b.rows('B04', sep(23, '08:05'), 'G.H', [
    { rowId: 'B04-r1', tag: '004510', notch: '4-2', sex: 'b', weight: 1.46 }, { rowId: 'B04-r2', tag: '004511', sex: 'g', weight: 1.38 },
    { rowId: 'B04-r3', tag: '004512', sex: 'b', weight: 1.21 }, { rowId: 'B04-r4', tag: '004513', sex: 'g', weight: 1.52 },
    { rowId: 'B04-r5', tag: '004514', sex: 'b' }, { rowId: 'B04-r6', tag: '004515', sex: 'g', weight: 1.44 }]);
  b.rows('B04', sep(23, '08:31'), 'L.M', [
    { rowId: 'B04-r7', tag: '004516', sex: 'b', weight: 1.6 }, { rowId: 'B04-r8', tag: '004517', sex: 'g', weight: 1.35 },
    { rowId: 'B04-r9', tag: '004518', weight: 1.29 }, { rowId: 'B04-r10', tag: '004519', sex: 'b', weight: 1.41 },
    { rowId: 'B04-r11', tag: '004520', sex: 'g', weight: 1.33 }]);
  b.death('B04', sep(25, '06:40'), 'G.H', [{ cause: 'crushed', rowId: 'B04-r3' }]);
  b.castrate('B04', sep(25, '08:12'), 'G.H', { castrated: 5, hernia: 1 });

  // day 1, day 2, outside the task
  d = L('C02', 1, 15); day0('C02', d, 'L.M', 14);
  L('E01', 2, 8);
  L('F05', 2, 10, 8);
  L('F03', 1, 11, 8);
  // D02: a sow with no piglets: her litter was weaned yesterday (previous batch)
  L('D02', 26, 12);
  b.rows('D02', sep(6, '09:00'), 'G.H', [{ rowId: 'D02-r1', tag: '000188', notch: '2-9' }]);
  b.push({ type: 'weaned', litter: 'D02', n: 11, at: sep(28, '07:30'), who: 'G.H' }, 'W-D02');

  // D06: the sow died mid-farrowing: 7 counted (1 stillborn), 1 crushed after, the session ended without a lock
  b.farrowed('D06', 7, '2026-09-28', 7, { stillborn: 1 }, sep(28, '02:10'), 'L.M', false);
  b.death('D06', sep(28, '05:00'), 'L.M', [{ cause: 'crushed', n: 1 }]);
  b.push({ type: 'sow_died', litter: 'D06', cause: null, at: sep(28, '06:20'), who: 'L.M' }, 'S-D06');

  // today, in walk order
  // A05: two phones recorded iron offline, neither saw the other: possible double treatment
  const before = b.ids();
  b.treat('A05', 'iron3', sep(29, '08:40'), 'L.M', 11, { seen: before.slice(), device: 'P-LM' });
  b.treat('A05', 'iron3', sep(29, '08:52'), 'G.H', 11, { seen: before.slice(), device: 'P-GH' });
  // D01: farrowing still open; cord marked at 8 heads, then one more born alive
  b.farrowed('D01', 7, TODAY, 9, { stillborn: 1 }, sep(29, '06:30'), 'L.M', false);
  b.treat('D01', 'cord', sep(29, '07:10'), 'L.M', 8);
  b.farrowed('D01', 7, TODAY, 10, { stillborn: 1 }, sep(29, '08:30'), 'L.M', false);
  // C04: iron and tail recorded today
  b.treat('C04', 'iron3', sep(29, '08:30'), 'G.H', 9); b.treat('C04', 'tail', sep(29, '08:31'), 'G.H', 9);
  // A05: tail 6, 5 weak deferred; two of its piglets tagged, and 004517 (also on B04)
  b.treat('A05', 'tail', sep(29, '09:30'), 'L.M', 6, { deferred: { n: 5, reason: 'weak' } });
  b.rows('A05', sep(29, '09:35'), 'L.M', [{ rowId: 'A05-r1', tag: '000354', notch: '12-5' }, { rowId: 'A05-r2', tag: '000355', notch: '12-6' }, { rowId: 'A05-r3', tag: '004517' }]);
  // D03: Set count 11 against 13 alive: an unexplained loss of 2, open
  b.count('D03', sep(29, '10:25'), 'G.H', 11, { baseAlive: 13 });
  return b;
}

// ---------------------------------------------------------------------------------------------
// identity and weigh (S4): A02's tags, the keepers farm, the notch farm

const A02_GH = [['004301', 'g', 1.42], ['004302', 'b', null], ['004303', 'b', 1.38]];
const A02_LM = [['004301', 'g', 1.42], ['004302', 'b', 1.38], ['004303', 'b', null], ['004304', 'g', 1.51], ['004305', 'b', 1.29]];
const A02_REST = [['004304', 'g', 1.51], ['004305', 'b', 1.29], ['004306', 'g', 1.47], ['004307', 'b', 1.55], ['004308', 'g', 1.33], ['004309', 'g', null],
  ['004310', 'b', 1.61], ['004311', 'g', 1.36], ['004312', 'b', 1.44]];
const row = (litter, i, x) => Object.assign({ rowId: litter + '-r' + i, tag: x[0] }, x[1] ? { sex: x[1] } : {}, x[2] != null ? { weight: x[2] } : {});
function a02(b, list, at, who, from = 1) { b.rows('A02', at, who, list.map((x, i) => row('A02', from + i, x))); }

// ---------------------------------------------------------------------------------------------
// the same task on 17 Oct: every due dose recorded on its day, with the exceptions the End review
// shows (B01 castration 1 owed, B04 coccidiosis missed, D01 identity 5 of 9, D03's loss still open)

const WHO = ['G.H', 'L.M'];
function late(b) {
  base(b);
  a02(b, A02_GH.concat(A02_REST), sep(29, '09:14'), 'G.H');
  const special = {
    'B01:castrate': (date) => b.castrate('B01', on(date, '10:40'), 'G.H', { castrated: 6, deferred: 1, deferReason: 'weak' }),
    'B03:castrate': (date) => b.castrate('B03', on(date, '10:50'), 'L.M', { castrated: 1, deferred: 1, deferReason: 'sick' }),
    'A05:castrate': (date) => b.castrate('A05', on(date, '08:44'), 'L.M', { castrated: 5 }),
    'B04:cocci': null
  };
  const start = dayNumber(TODAY), stop = dayNumber('2026-10-17');
  const scripted = {
    '2026-09-29': () => b.farrowed('D01', 7, TODAY, 10, { stillborn: 1 }, sep(29, '20:00'), 'L.M', true),
    '2026-10-02': () => b.death('A02', oct(2, '06:40'), 'G.H', [{ cause: 'crushed', rowId: 'A02-r9' }]),
    '2026-10-03': () => {
      b.push({ type: 'farrowing_task_ended', at: oct(3, '17:00'), who: 'G.H' }, 'FT');
      b.move('B01', 'C04', 3, oct(3, '09:10'), 'G.H', { rows: ['B01-r1', 'B01-r2', 'B01-r3'], answers: { iron3: 'yes', nasal: 'yes' } });
    },
    '2026-10-04': () => b.death('B01', oct(4, '07:05'), 'L.M', [{ cause: 'scours', rowId: 'B01-r4' }]),
    '2026-10-06': () => b.death('C02', oct(6, '06:55'), 'G.H', [{ cause: 'crushed', rowId: 'C02-r10' }])
  };
  let w = 0;
  for (let day = start; day <= stop; day++) {
    const date = new Date(day * 86400000).toISOString().slice(0, 10);
    if (scripted[date]) scripted[date]();
    const D = derive(b.events, CONFIG, { today: date });
    let minute = 0;
    const t = () => { minute += 2; return on(date, (day === start ? '11:' : '08:') + String(minute).padStart(2, '0')); };
    for (const id of TASK7) {
      const L = D.litters[id];
      if (!L || L.phase !== 'locked' || !L.alive) continue;
      // identity from day 3: every alive piglet (D01 stops at 5)
      const want = id === 'D01' ? 5 : L.alive;
      if (L.dayAge >= 3 && L.identity.liveRows < want && (id !== 'D01' || L.dayAge >= 12)) {
        const have = L.identity.rows.filter((r) => r.birthLitter === id).length;
        b.rows(id, t(), WHO[w++ % 2], tags(id, 6000 + TASK7.indexOf(id) * 20 + have, want - L.identity.liveRows, have + 1));
      }
      for (const dose of CONFIG.doses) {
        const X = L.doses[dose.id];
        if (!(X.status === 'due' || X.status === 'late')) continue;
        const key = id + ':' + dose.id;
        if (key in special) { if (special[key] && !X.records.some((r) => dayNumber(r.at) >= start)) special[key](date); continue; }
        if (dose.castration) { if (!X.records.length) b.castrate(id, t(), WHO[w++ % 2], { castrated: Math.round(L.alive / 2) }); continue; }
        if (X.owed > 0) b.treat(id, dose.id, t(), WHO[w++ % 2], X.owed);
      }
    }
  }
  // the wrong-litter mark End's corrections fix: meant for B01, tapped on B03
  b.castrate('B03', oct(17, '15:40'), 'L.M', { castrated: 1 }, { id: 'T-B03-wrong' });
  return b;
}

/* Every dose owed today recorded, walk order (the room's `all done`). */
function recordAllOwed(b, date, hour) {
  const D = derive(b.events, CONFIG, { today: date });
  let m = 0;
  for (const id of TASK7) {
    const L = D.litters[id];
    if (!L || !L.alive) continue;
    for (const dose of CONFIG.doses) {
      const X = L.doses[dose.id];
      if (!(X.status === 'due' || X.status === 'late')) continue;
      const at = on(date, hour + String(10 + (m++ % 49)).padStart(2, '0'));
      if (dose.castration) { if (X.owed == null) b.castrate(id, at, ME, { castrated: Math.round(L.alive / 2) }); else if (X.owed) b.castrate(id, at, ME, { castrated: X.owed }); }
      else if (X.owed > 0) b.treat(id, dose.id, at, ME, X.owed);
    }
  }
}

function end(b, who = 'G.H') { b.push({ type: 'end_task', at: oct(17, '16:20'), who, id: 'END' }); return b; }
const beforeEnd = (b) => b.ids().slice(0, b.ids().indexOf('END'));
const POST = {
  // stamped before End on an offline phone, synced after it
  lateMark(b) { b.treat('C02', 'health', oct(17, '16:05'), 'L.M', 13, { seen: beforeEnd(b), id: 'T-C02-late', syncedAt: oct(17, '18:40') }); },
  // physically done after End on an offline phone, synced later
  afterEnd(b) { b.castrate('B01', oct(17, '17:05'), 'L.M', { castrated: 1 }, { seen: beforeEnd(b), id: 'T-B01-afterend', syncedAt: oct(17, '19:10') }); },
  correct(b) {
    POST.lateMark(b);
    b.death('A02', oct(18, '07:10'), 'G.H', [{ cause: 'crushed', rowId: 'A02-r10' }]);
    b.push({ type: 'correction', target: 'T-B03-wrong', void: true, fresh: { litter: 'B01', dose: 'castrate', castration: { castrated: 1 } }, at: oct(18, '08:20'), who: 'L.M' }, 'X');
    const a05 = b.events.find((e) => e.litter === 'A05' && e.dose === 'castrate');
    b.push({ type: 'correction', target: a05.id, set: { castration: { castrated: 4, cryptorchid: 1 } }, at: oct(18, '08:40'), who: 'L.M' }, 'X');
    b.rows('D01', oct(18, '09:05'), 'L.M', tags('D01', 6000 + TASK7.indexOf('D01') * 20 + 5, 3, 6));
    b.count('D03', oct(18, '09:30'), 'G.H', 11, { baseAlive: 11 });
  },
  moves(b) {
    b.death('C02', oct(18, '06:50'), 'G.H', [{ cause: 'crushed', rowId: 'C02-r11' }, { cause: 'crushed', rowId: 'C02-r12' }]);
    b.move('C02', 'F03', 4, oct(18, '07:30'), 'L.M', { rows: ['C02-r1', 'C02-r2', 'C02-r3', 'C02-r4'], answers: {} });
    b.move('F05', 'D01', 2, oct(18, '07:40'), 'L.M', { answers: {} });
    b.treat('D01', 'health', oct(18, '08:00'), 'L.M', 2);
  }
};

// ---------------------------------------------------------------------------------------------
// variants: base + the deltas a state needs. Each builds { events, today, config }.

const V = (fn, today = TODAY, over) => () => {
  const b = builder(); fn(b);
  const config = Object.assign({}, CONFIG, over || {});
  return { events: b.events, today, config };
};

export const VARIANTS = {
  base: V(base),

  // room (S1)
  'all-done': V((b) => { base(b); recordAllOwed(b, TODAY, '09:'); }),
  behind: V(base, '2026-10-02'),
  drift: V((b) => {
    base(b);
    b.count('A02', sep(29, '09:05'), 'L.M', 11, { baseAlive: 12 });
    b.count('E01', sep(29, '10:10'), 'G.H', 8, { baseAlive: 7 });
  }),
  // Unit 8's own task: every litter recorded up to yesterday, nothing falls due today
  quiet: V((b) => {
    base(b);
    b.treat('A03', 'cord', sep(25, '18:20'), 'A.K', 10); b.treat('A03', 'nasal', sep(25, '18:22'), 'A.K', 10);
    b.treat('A03', 'iron3', sep(28, '08:00'), 'A.K', 10); b.treat('A03', 'tail', sep(28, '08:02'), 'A.K', 10);
    b.treat('F02', 'cord', sep(23, '18:20'), 'A.K', 11); b.treat('F02', 'nasal', sep(23, '18:22'), 'A.K', 11);
    b.treat('F02', 'iron3', sep(26, '08:10'), 'A.K', 11); b.treat('F02', 'tail', sep(26, '08:12'), 'A.K', 11);
    b.castrate('F02', sep(28, '08:20'), 'A.K', { castrated: 6 });
    b.treat('F03', 'cord', sep(28, '18:20'), 'A.K', 10); b.treat('F03', 'nasal', sep(28, '18:22'), 'A.K', 10);
    b.treat('F05', 'cord', sep(27, '18:20'), 'A.K', 9); b.treat('F05', 'nasal', sep(27, '18:22'), 'A.K', 9);
  }, TODAY, { task: { id: 'PP-U7-U8-0925', litters: TASK7.concat(['A03', 'F02', 'F03', 'F05']), farrowingTask: 'open' } }),

  // litter sheet (S2)
  'a02-partial': V((b) => { base(b); b.treat('A02', 'tail', sep(29, '08:40'), 'L.M', 12); b.treat('A02', 'iron3', sep(29, '09:14'), ME, 12, { id: 'T-A02-visit' }); }),
  'a02-short': V((b) => { base(b); b.treat('A02', 'iron3', sep(29, '09:14'), ME, 10, { id: 'T-A02-visit', deferred: { n: 2, reason: 'weak' } }); }),
  'a02-by-other': V((b) => { base(b); b.treat('A02', 'iron3', sep(29, '08:40'), 'L.M', 12); }),
  'a02-stale': V((b) => { base(b); b.treat('A02', 'iron3', sep(29, '09:10'), 'L.M', 10, { deferred: { n: 2, reason: 'sick' } }); }),
  'a02-all-done': V((b) => { base(b); b.treat('A02', 'iron3', sep(29, '09:14'), ME, 12); b.treat('A02', 'tail', sep(29, '09:16'), ME, 12, { id: 'T-A02-visit' }); }),
  'a02-castrate': V((b) => { base(b); b.treat('A02', 'iron3', sep(29, '09:14'), ME, 12); b.treat('A02', 'tail', sep(29, '09:16'), ME, 12); }, '2026-10-01'),
  'a02-castrated': V((b) => {
    base(b); b.treat('A02', 'iron3', sep(29, '09:14'), ME, 12); b.treat('A02', 'tail', sep(29, '09:16'), ME, 12);
    b.castrate('A02', oct(1, '09:20'), ME, { castrated: 3, hernia: 1, deferred: 2, deferReason: 'weak' }, { id: 'T-A02-visit' });
  }, '2026-10-01'),
  'c05-no-males': V((b) => {
    base(b); b.treat('C05', 'iron3', sep(29, '09:30'), ME, 8); b.treat('C05', 'tail', sep(29, '09:31'), ME, 8);
    b.castrate('C05', sep(29, '09:32'), ME, { castrated: 0 }, { id: 'T-C05-visit' });
  }),
  'c02-early': V((b) => { base(b); b.treat('C02', 'iron3', sep(29, '09:30'), ME, 14, { id: 'T-C02-visit' }); }),

  // corrections and the litter record (S8): A02 with tail (L.M 08:40) and iron (G.H 09:14) recorded today
  'a02-marked': V((b) => { base(b); b.treat('A02', 'tail', sep(29, '08:40'), 'L.M', 12, { id: 'T-A02-tail' }); b.treat('A02', 'iron3', sep(29, '09:14'), ME, 12, { id: 'T-A02-visit' }); }),
  // …then G.H corrected iron at 10:31: 10 treated, 2 weak deferred (the amber value on the sheet and the record page)
  'a02-corrected': V((b) => {
    base(b); b.treat('A02', 'tail', sep(29, '08:40'), 'L.M', 12, { id: 'T-A02-tail' }); b.treat('A02', 'iron3', sep(29, '09:14'), ME, 12, { id: 'T-A02-visit' });
    b.push({ type: 'correction', target: 'T-A02-visit', set: { n: 10, deferred: { n: 2, reason: 'weak' } }, at: sep(29, '10:31'), who: ME, id: 'X-A02-iron' });
  }),
  // …or L.M's tail was done on A04, not A02: un-recorded on A02 and recorded fresh on A04 (A04's 11), one stamped act
  'a02-wrong-litter': V((b) => {
    base(b); b.treat('A02', 'tail', sep(29, '08:40'), 'L.M', 12, { id: 'T-A02-tail' }); b.treat('A02', 'iron3', sep(29, '09:14'), ME, 12, { id: 'T-A02-visit' });
    b.push({ type: 'correction', target: 'T-A02-tail', void: true, fresh: { litter: 'A04', dose: 'tail', n: 11 }, at: sep(29, '10:31'), who: ME, id: 'X-A02-tail' });
  }),

  // Move (S7): records already posted
  'moved-b06-b08': V((b) => { base(b); b.move('B06', 'B08', 2, sep(29, '09:42'), ME, { id: 'MV-0929-01', answers: {} }); }),
  'moved-orphan': V((b) => { base(b); b.move('B01', 'D02', 13, sep(29, '11:05'), ME, { id: 'MV-0929-04', rows: tags('B01', 4101, 12).map((r) => r.rowId).concat(['B01-r13']), answers: {} }); }),
  'moved-to-c05': V((b) => {
    base(b);
    b.move('C03', 'C05', 2, sep(29, '09:10'), ME, { id: 'MV-0929-02', rows: ['C03-r4', 'C03-r7'], answers: {} });
    b.move('B06', 'C05', 1, sep(29, '10:20'), ME, { id: 'MV-0929-03', answers: {} });
  }),
  'moved-unknown': V((b) => { base(b); b.move('B09', 'B02', 2, sep(29, '10:05'), ME, { id: 'MV-0929-05', rows: ['B09-r9', 'B09-r10'], answers: { iron3: 'unknown' } }); }),
  'explain': V((b) => {
    base(b);
    b.count('B06', sep(29, '09:50'), 'L.M', 11, { baseAlive: 12, id: 'C-B06-loss' });
    b.count('B08', sep(29, '09:55'), 'L.M', 10, { baseAlive: 9, id: 'C-B08-gain' });
  }),

  // identity and weigh (S4)
  'a02-tags-gh': V((b) => { base(b); a02(b, A02_GH, sep(29, '09:14'), ME); }),
  'a02-tags-lm': V((b) => { base(b); a02(b, A02_LM, sep(29, '08:10'), 'L.M'); }),
  'a02-tags-all': V((b) => { base(b); a02(b, A02_GH.concat(A02_REST), sep(29, '09:14'), ME); }),
  // L.M tagged offline while G.H tagged all 12: the same 004305 twice (a pair), and a 13th row
  'a02-tags-over': V((b) => {
    base(b); const seen = b.ids();
    a02(b, A02_GH.concat(A02_REST), sep(29, '09:14'), ME);
    b.rows('A02', sep(29, '09:18'), 'L.M', [row('A02', 13, ['004305', 'b', 1.30])], { seen });
    b.rows('A02', sep(29, '09:26'), ME, [row('A02', 14, ['004313', 'g', 1.40])], { seen: seen.concat(['__none']) });
  }),
  'a02-tags-pair': V((b) => {
    base(b); const seen = b.ids();
    a02(b, A02_LM, sep(29, '08:10'), 'L.M');
    b.rows('A02', sep(29, '09:12'), ME, [row('A02', 6, ['004305', 'b', 1.31])], { seen });
  }),
  // A02 with 7 tagged (two boars since the counts were saved at 5)
  'a02-tags-seven': V((b) => { base(b); a02(b, A02_LM, sep(29, '08:10'), 'L.M'); a02(b, [['004306', 'b', 1.44], ['004307', 'b', 1.52]], sep(29, '09:15'), ME, 6); }),
  keepers: V((b) => {
    base(b);
    b.rows('A07', sep(29, '09:00'), ME, tags('A07', 4601, 9, 1, (i) => ({ sex: i === 4 ? 'b' : 'g', weight: [1.62, 1.58, 1.66, 1.71, 1.8, 1.59, 1.64, 1.69, 1.57][i] })));
  }, TODAY, { identity: FARMS.keepers }),
  'keepers-closed': V((b) => {
    base(b);
    b.rows('A07', sep(29, '09:00'), ME, tags('A07', 4601, 9, 1, (i) => ({ sex: i === 4 ? 'b' : 'g', weight: [1.62, 1.58, 1.66, 1.71, 1.8, 1.59, 1.64, 1.69, 1.57][i] })));
    b.push({ type: 'identity', op: 'close', litter: 'A07', at: sep(29, '09:10'), who: ME });
  }, TODAY, { identity: FARMS.keepers }),
  notch: V((b) => {
    base(b);
    b.rows('A04', sep(29, '09:10'), ME, [{ rowId: 'A04-r1', notch: '118-1', sex: 'b', weight: 1.3 }, { rowId: 'A04-r2', notch: '118-2', sex: 'g', weight: 1.25 }, { rowId: 'A04-r3', notch: '118-3', sex: 'g' }]);
  }, TODAY, { identity: FARMS.notch }),

  // End (S9): today (the batch's farrowing still open) and 17 Oct
  late: V(late, '2026-10-17'),
  'late-changed': V((b) => { late(b); b.castrate('B01', oct(17, '16:12'), 'L.M', { castrated: 1 }); }, '2026-10-17'),
  ended: V((b) => { late(b); end(b); }, '2026-10-17'),
  'ended-by-other': V((b) => { late(b); end(b, 'A.K'); }, '2026-10-17'),
  'ended-late-mark': V((b) => { late(b); end(b); POST.lateMark(b); }, '2026-10-17'),
  'ended-after-end': V((b) => { late(b); end(b); POST.afterEnd(b); }, '2026-10-17'),
  'ended-correct': V((b) => { late(b); end(b); POST.correct(b); }, '2026-10-18'),
  'ended-moves': V((b) => { late(b); end(b); POST.moves(b); }, '2026-10-18'),
  'ended-after': V((b) => { late(b); end(b); POST.correct(b); POST.moves(b); }, '2026-10-18')
};

// ---------------------------------------------------------------------------------------------
// the store a page opens: the variant's log plus what this tab appended (sessionStorage)

const memory = {};
function sessionLog(key) { try { const s = sessionStorage.getItem(key); return s ? JSON.parse(s) : []; } catch (e) { return memory[key] || []; } }
function saveSession(key, list) { try { sessionStorage.setItem(key, JSON.stringify(list)); } catch (e) { memory[key] = list; } }
const cache = {};

export function open(name, opts) {
  const o = opts || {};
  const known = !!VARIANTS[name];
  const vname = known ? name : 'base';
  const v = cache[vname] || (cache[vname] = VARIANTS[vname]());
  const key = 'pp-log:' + vname;
  if (o.fresh) saveSession(key, []);
  let added = o.session === false ? [] : sessionLog(key);
  let events = v.events.concat(added);
  const opt = { today: v.today };
  let derived = derive(events, v.config, opt);
  let clock = 0;
  const pad = (x) => String(x).padStart(2, '0');
  const store = {
    name: vname, config: v.config, today: v.today, opts: opt,
    get events() { return events; },
    get derived() { return derived; },
    get added() { return added.slice(); },
    litter(id) { return derived.litters[id] || null; },
    sow(id) { return SOWS[id] || null; },
    weights(id) { const set = /^(late|ended)/.test(vname) ? LITTER_WEIGHTS.late : LITTER_WEIGHTS.base; return (set[id] || []).slice(); },
    /* The next stamp on this phone: after the fixture's now, one minute per record. */
    stamp() {
      clock++;
      const t = new Date(Date.parse(v.today === TODAY ? NOW : v.today + 'T16:30') + (added.length + clock) * 60000);
      return { id: 'P-' + vname + '-' + (added.length + clock) + '-' + Math.random().toString(36).slice(2, 6), at: t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()) + 'T' + pad(t.getHours()) + ':' + pad(t.getMinutes()), who: ME };
    },
    /* Try an event exactly as commit would (a draft's gate), without keeping it. */
    trial(event) { const st = store.stamp(); clock--; return append(events, Object.assign({ id: st.id, at: st.at, who: st.who }, event), v.config, opt); },
    /* Commit one event through the ledger; kept in this tab's log when accepted. */
    commit(event) {
      const st = store.stamp();
      const r = append(events, Object.assign({ id: st.id, at: st.at, who: st.who }, event), v.config, opt);
      if (r.ok) {
        added = added.concat([r.event]);
        if (o.session !== false) saveSession(key, added);
        events = r.events; derived = r.derived;
      } else clock--;
      return r;
    },
    /* Commit several events as one: every one is accepted, or none is kept (the first refusal is returned). */
    commitAll(list) {
      let evs = events, der = derived, out = [];
      for (const ev of list) {
        const st = store.stamp();
        const r = append(evs, Object.assign({ id: st.id, at: st.at, who: st.who }, ev), v.config, opt);
        if (!r.ok) { clock -= out.length + 1; return r; }
        out.push(r.event); evs = r.events; der = r.derived;
      }
      added = added.concat(out);
      if (o.session !== false) saveSession(key, added);
      events = evs; derived = der;
      return { ok: true, events: out, derived };
    },
    reset() { added = []; saveSession(key, []); events = v.events.slice(); derived = derive(events, v.config, opt); },
    select
  };
  return store;
}

/* Every identity row across units, for Find and for the same-tag lookup. */
export function piglets(derived) {
  const out = [];
  for (const L of Object.values(derived.litters)) {
    for (const r of L.identity.rows) if (r.litter === L.id) out.push({ row: r.rowId, tag: r.tag, notch: r.notch, litter: L.id, room: L.room, status: r.status, weanedAt: r.weanedAt || null });
  }
  return out;
}

export const PPFixtures = { CONFIG, FARMS, SOWS, LITTER_WEIGHTS, DEVICE_DRAFTS, VARIANTS, TODAY, NOW, ME, open, piglets };
export default PPFixtures;
if (typeof window !== 'undefined') window.PPFixtures = PPFixtures;
