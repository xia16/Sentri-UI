/* Piglet processing (仔猪处理) — the shared litter ledger. Events in, derived facts out.

   One module for every page and for the developers' contract (ticket #18). Plain ES module;
   in a browser it also attaches `window.PPLedger`. No dependencies, no clock: the caller passes
   `today` for anything that depends on the date.

   Law (RULINGS, Piglet processing round 2):
     Alive = Born − Dead − Moved out + Moved in − open loss + open gain − Weaned
   Alive is derived, never entered, never negative. A Count is an observation: it writes an
   unexplained gain or loss, one item each, never netted. A loss is explained by a death (the
   dead picker's "from the missing") or a Move naming it; explaining relabels, Alive does not move.

   Obligations. Owed is a stored count per scheduled dose from the litter's birth: every live-born
   piglet owes every dose. A record sets it to what the record left (deferred); arrivals that owe
   it, births after a pre-lock mark, gains before the first record and a check's "did not" raise
   it; a Move taking untreated piglets away lowers it. Deaths never lower it — it is shown as
   min(owed, alive), so an untreated piglet is never hidden (over-owing is the accepted cost).
   Evidence that moved piglets carry (coverage) and piglets whose status is unknown are kept in
   groups, one per arrival or gain, so each is resolved or retired on its own.

   Causality. Every event may carry `seen`: the ids its device had when it wrote it. Concurrent
   records (neither saw the other) are kept and flagged; device clocks never decide a conflict.

   API
     derive(events, config, { today })   → Derived (README: ux/laws/glossary.md, Ledger module)
     append(events, event, config, opts) → { ok, reason, detail, event, events, derived, dependents }
     balances(litter)                    → the ledger identity for one derived litter
     select.room / litter / deathDraft / moveDraft / end — what pages render, no arithmetic in pages
*/

const DAY_MS = 86400000;

// ---------------------------------------------------------------------------------------------
// small helpers

export function dayNumber(stamp) {
  if (stamp == null) return null;
  if (typeof stamp === 'number') return stamp;              // a bare day number is accepted
  const s = String(stamp).slice(0, 10);
  const t = Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Number.isNaN(t) ? null : Math.round(t / DAY_MS);
}
const isCount = (v) => Number.isInteger(v) && v >= 0;
const sum = (o) => Object.values(o || {}).reduce((s, v) => s + (v || 0), 0);
const clone = (o) => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
const time = (s) => { const t = Date.parse(s); return Number.isNaN(t) ? null : t; };

const ALIVE_CHANGING = new Set(['count', 'death', 'move', 'weaned']);
const EXEMPT_REASONS = ['hernia', 'cryptorchid', 'kept'];      // castration reasons that leave the task
const NOTE_REASONS = ['hernia', 'cryptorchid'];                 // …and become a litter note
const RAISES = new Set(['born', 'born_after_mark', 'arrival', 'gain', 'lacks']);

class Reject extends Error {
  constructor(reason, detail) { super(reason); this.reason = reason; this.detail = detail || null; }
}

// ---------------------------------------------------------------------------------------------
// log preparation and causality

function prepare(events) {
  const rejected = [];
  const byId = new Map();
  const log = [];
  for (const e of events || []) {
    if (!e || !e.id || !e.type) { rejected.push({ id: e && e.id, type: e && e.type, reason: 'malformed' }); continue; }
    if (byId.has(e.id)) { rejected.push({ id: e.id, type: e.type, reason: 'duplicate_id' }); continue; }
    byId.set(e.id, e);
    log.push(e);
  }
  return { log, byId, rejected };
}

/* Ancestors are the transitive closure of `seen`. Without `seen` the event saw the whole log
   before it (an online write). */
function ancestry(log) {
  const anc = new Map();
  const all = new Set();
  for (const e of log) {
    let set;
    if (Array.isArray(e.seen)) {
      set = new Set();
      for (const s of e.seen) {
        if (!anc.has(s)) continue;
        set.add(s);
        for (const a of anc.get(s)) set.add(a);
      }
    } else set = new Set(all);
    anc.set(e.id, set);
    all.add(e.id);
  }
  // a correction's fresh mark (`<id>:fresh`) has its correction's causal view
  const key = (id) => (anc.has(id) ? id : String(id).replace(/:fresh$/, ''));
  const saw = (later, earlier) => { const s = anc.get(key(later)); return !!s && s.has(key(earlier)); };
  return { saw, concurrent: (a, b) => !saw(a, b) && !saw(b, a) };
}

// ---------------------------------------------------------------------------------------------
// state

function newDose(cfg) {
  return {
    stored: null,          // owed, stored (null: castration before its first record)
    recorded: false,
    deferred: 0, deferReason: null,
    exempt: 0, exemptBy: {},
    treated: 0,            // piglets marked by this litter's own records (history, never retired)
    coverage: [],          // carried evidence groups { id, kind: move|had|gain, n, rows|null, from, at }
    unknowns: [],          // unresolved groups { id, kind: move|gain, n, from, at }
    log: [],               // stored-owed changes { event, kind, delta, after }
    records: [], collisions: [], castration: null, fullAt: null, checks: [], catchUp: 0,
    visible: cfg.visible
  };
}

function newLitter(id) {
  return {
    id, room: null, phase: 'none', sowDied: null, birthDay: null, atBirth: null,
    born: 0, deadByCause: {}, deadTotal: 0, movedIn: 0, movedOut: 0, weaned: 0, alive: 0,
    losses: [], gains: [], moves: [], counts: [], deaths: [], notes: [],
    doses: {}, idClosed: false, flags: [], accepted: [], types: {}, lastEvent: null, lastRecord: null,
    movedOutAfterEnd: []
  };
}

const total = (groups) => groups.reduce((s, g) => s + g.n, 0);
function shown(L, D) { return D.stored == null ? null : Math.min(D.stored, L.alive); }
function logOwed(D, e, kind, delta) { D.log.push({ event: e.id, kind, delta, after: D.stored }); }
function raise(D, e, kind, n) {
  if (n <= 0 || D.stored == null) return;
  D.stored += n; logOwed(D, e, kind, n);
}
function lower(D, e, kind, n) {
  if (n <= 0 || D.stored == null) return;
  const before = D.stored;
  D.stored = Math.max(0, D.stored - n);
  D.deferred = Math.min(D.deferred, D.stored);
  logOwed(D, e, kind, D.stored - before);
}
function cover(D, e, kind, n, rows, from) {
  if (n <= 0) return;
  D.coverage.push({ id: e.id, kind, n, rows: rows ? rows.slice() : null, from: from || null, at: e.at || null });
}
function takeUnknown(D, n, groupId) {
  let left = n;
  for (const g of D.unknowns) {
    if (!left) break;
    if (groupId && g.id !== groupId) continue;
    const t = Math.min(left, g.n);
    g.n -= t; left -= t;
  }
  D.unknowns = D.unknowns.filter((g) => g.n > 0);
  return n - left;
}
function retireRow(L, rowId) {
  for (const D of Object.values(L.doses)) {
    for (const g of D.coverage) if (g.rows && g.rows.includes(rowId)) { g.rows = g.rows.filter((x) => x !== rowId); g.n = g.rows.length; }
    D.coverage = D.coverage.filter((g) => g.n > 0);
  }
}

/* What moved piglets carry for one dose (RULINGS Q14): the source did it for all → done;
   did none → the arrivals owe it; partly → asked (invisible) or checked on the pig (visible). */
function classify(L, D) {
  if (total(D.unknowns) > 0) return 'part';
  if (!D.recorded) return total(D.coverage) > 0 ? 'part' : 'none';
  if (shown(L, D) === 0) return 'done';
  if (D.treated + total(D.coverage) === 0) return 'none';
  return 'part';
}
function outcomeFor(cls, d, answer) {
  if (cls === 'done') return 'done';
  if (cls === 'none') return 'owed';
  if (d.visible) return 'check';
  return ({ yes: 'done', no: 'owed' })[answer] || 'unknown';
}

// ---------------------------------------------------------------------------------------------
// derive

function normalizeConfig(config) {
  const c = config || {};
  const task = c.task ? { id: c.task.id || null, litters: (c.task.litters || []).slice(), ended: c.task.ended ? Object.assign({}, c.task.ended) : null } : null;
  return {
    doses: (c.doses || []).map((d) => ({
      id: d.id, tx: d.tx || d.id, due: d.due, last: d.last == null ? null : d.last,
      visible: !!d.visible, castration: !!d.castration,
      product: d.product == null ? null : d.product, amount: d.amount == null ? null : d.amount
    })),
    identity: Object.assign({ scheme: 'none', who: 'all', day: null }, c.identity || {}),
    task
  };
}

/* Corrections are transactional: each is tried against the replay; one that would make its
   target invalid is refused (`correction_invalid`) and the record in force stays. A correction
   may void a wrong-litter mark and carry the `fresh` treat for the right litter. */
export function derive(events, config, opts) {
  const cfg = normalizeConfig(config);
  const today = dayNumber(opts && opts.today);
  const { log, byId, rejected } = prepare(events);
  const causal = ancestry(log);
  const rootOf = (id) => { let e = byId.get(id); while (e && e.type === 'correction') e = byId.get(e.target); return e; };
  const effective = new Map();
  const corrections = new Map();
  const fresh = new Map();              // correction id → synthetic treat
  const corrRejected = [];
  for (const c of log) {
    if (c.type !== 'correction') continue;
    const root = rootOf(c.target);
    if (!root) { corrRejected.push({ id: c.id, type: c.type, reason: 'unknown_target' }); continue; }
    if (c.set && ('id' in c.set || 'type' in c.set)) { corrRejected.push({ id: c.id, type: c.type, reason: 'cannot_change_id_or_type' }); continue; }
    const base = effective.has(root.id) ? effective.get(root.id) : root;
    const candidate = c.void ? null : Object.assign(clone(base || root), c.set || {}, { id: root.id, type: root.type });
    const trial = new Map(effective); trial.set(root.id, candidate);
    const trialFresh = new Map(fresh);
    if (c.fresh) trialFresh.set(c.id, Object.assign({}, c.fresh, { id: c.id + ':fresh', type: 'treat', at: c.at, who: c.who, viaCorrection: c.id, seen: c.seen }));
    const res = replay(log, trial, trialFresh, cfg, causal, today);
    const bad = res.rejected.find((r) => (candidate && r.id === root.id) || r.id === c.id + ':fresh');
    if (bad) { corrRejected.push({ id: c.id, type: c.type, reason: 'correction_invalid', detail: { target: root.id, reason: bad.reason, detail: bad.detail } }); continue; }
    effective.set(root.id, candidate);
    if (c.fresh) fresh.set(c.id, trialFresh.get(c.id));
    if (!corrections.has(root.id)) corrections.set(root.id, []);
    corrections.get(root.id).push({ id: c.id, at: c.at || null, who: c.who || null, void: !!c.void, set: c.set || null, fresh: c.fresh ? c.id + ':fresh' : null });
  }
  const res = replay(log, effective, fresh, cfg, causal, today);
  const out = {
    litters: {}, rooms: {}, rejected: rejected.concat(corrRejected, res.rejected), flags: res.flags,
    corrections: Object.fromEntries(corrections), config: cfg, today, ended: res.ended
  };
  for (const L of res.litters.values()) {
    if (L.phase === 'none') continue;
    out.litters[L.id] = view(res.ctx, L, corrections);
  }
  for (const L of Object.values(out.litters)) {
    const r = out.rooms[L.room] || (out.rooms[L.room] = { room: L.room, litters: [], openLoss: 0, openGain: 0, netDrift: 0, alive: 0 });
    r.litters.push(L.id);
    r.openLoss += L.unexplained.openLoss;
    r.openGain += L.unexplained.openGain;
    r.netDrift = r.openGain - r.openLoss;
    r.alive += L.alive;
  }
  return out;
}

function replay(log, effective, fresh, cfg, causal, today) {
  const litters = new Map();
  const ctx = {
    cfg, causal, today, litters, rows: new Map(), flags: [], pending: [],
    doseCfg: new Map(cfg.doses.map((d) => [d.id, d])),
    ended: cfg.task && cfg.task.ended ? Object.assign({ index: null }, cfg.task.ended) : null,
    lit: (id) => { if (!litters.has(id)) litters.set(id, newLitter(id)); return litters.get(id); }
  };
  const rejected = [];
  const run = (e, index) => {
    ctx.pending = [];
    ctx.index = index;
    try {
      const touched = apply(ctx, e);
      for (const p of ctx.pending) { p.L.flags.push(p.f); ctx.flags.push(p.f); }
      for (const L of touched) {
        L.accepted.push(e.id); L.types[e.id] = e.type;
        L.lastEvent = { id: e.id, type: e.type, at: e.at || null, who: e.who || null };
      }
    } catch (err) {
      if (!(err instanceof Reject)) throw err;
      rejected.push({ id: e.id, type: e.type, reason: err.reason, detail: err.detail });
    }
  };
  log.forEach((raw, index) => {
    if (raw.type === 'correction') { if (fresh.has(raw.id)) run(fresh.get(raw.id), index); return; }
    const e = effective.has(raw.id) ? effective.get(raw.id) : raw;
    if (e === null) return;                              // voided by a correction
    run(e, index);
  });
  return { litters, rejected, flags: ctx.flags, ctx, ended: ctx.ended };
}

function flag(ctx, L, kind, reason, eventIds, extra) {
  ctx.pending.push({ L, f: Object.assign({ kind, reason, litter: L.id, events: eventIds }, extra || {}) });
}
function stale(ctx, L, e) { return L.accepted.some((id) => id !== e.id && !ctx.causal.saw(e.id, id)); }
function concurrentCountFlag(ctx, L, e) {
  for (const id of L.accepted) {
    const p = L.types[id];
    if (!ALIVE_CHANGING.has(p)) continue;
    if (p === 'count' && e.type === 'count') continue;       // two counts: the later stands, never summed
    if (p !== 'count' && e.type !== 'count') continue;
    if (ctx.causal.concurrent(id, e.id)) flag(ctx, L, 'sync_review', 'count_concurrent', [id, e.id]);
  }
}
function needLitter(ctx, id) {
  const L = ctx.litters.get(id);
  if (!L || L.phase === 'none') throw new Reject('unknown_litter', { litter: id });
  return L;
}
function needLocked(L) { if (L.phase !== 'locked') throw new Reject('farrowing_open', { litter: L.id }); }
function needDose(ctx, id) { const d = ctx.doseCfg.get(id); if (!d) throw new Reject('unknown_dose', { dose: id }); return d; }
function dose(ctx, L, id) { const d = ctx.doseCfg.get(id); if (!L.doses[id]) L.doses[id] = newDose(d); return L.doses[id]; }
function liveRows(ctx, litterId) {
  let n = 0;
  for (const r of ctx.rows.values()) if (r.litter === litterId && r.status === 'alive') n++;
  return n;
}
function uniqueIds(ids) { if (new Set(ids).size !== ids.length) throw new Reject('duplicate_row'); }
function inTask(ctx, id) { return !ctx.cfg.task || ctx.cfg.task.litters.includes(id); }
/* After End: by log position when End is an event in the log, else by stamp. */
function afterEnd(ctx, e) {
  const E = ctx.ended;
  if (!E) return false;
  if (E.index != null) return ctx.index > E.index;
  const a = time(e.at), b = time(E.at);
  return a == null || b == null ? true : a > b;
}
function stampedAfterEnd(ctx, e) {
  const a = time(e.at), b = time(ctx.ended.at);
  return a == null || b == null ? true : a > b;
}

// ---------------------------------------------------------------------------------------------
// apply one event; returns the litters it touched; throws Reject

function apply(ctx, e) {
  switch (e.type) {
    case 'farrowed': return applyFarrowed(ctx, e);
    case 'count': return applyCount(ctx, e);
    case 'death': return applyDeath(ctx, e);
    case 'sow_died': return applySowDied(ctx, e);
    case 'move': return applyMove(ctx, e);
    case 'treat': return e.target === 'unknown' ? applyTreatUnknown(ctx, e) : applyTreat(ctx, e);
    case 'check': return applyCheck(ctx, e);
    case 'identity': return applyIdentity(ctx, e);
    case 'weaned': return applyWeaned(ctx, e);
    case 'end_task': return applyEndTask(ctx, e);
    default: throw new Reject('unknown_type');
  }
}

/* farrowed { litter, room, birthDate?, born, dead:{cause:n}, locked }
   Farrowing's current totals, absolute; repeated while open, refused once locked (a locked Born
   changes only through a correction). New live heads after a mark owe every dose. */
function applyFarrowed(ctx, e) {
  const existing = ctx.litters.get(e.litter);
  if (existing && existing.phase === 'locked') throw new Reject('locked');
  const dead = e.dead || {};
  const deadN = sum(dead);
  if (!isCount(e.born) || Object.values(dead).some((v) => !isCount(v)) || deadN > e.born) throw new Reject('bad_numbers');
  const aliveNew = e.born - deadN;
  if (existing && aliveNew < liveRows(ctx, existing.id)) throw new Reject('name_the_rows');
  const L = ctx.lit(e.litter);
  const first = L.phase === 'none';
  const newHeads = first ? aliveNew : Math.max(0, (e.born - L.born) - (deadN - L.deadTotal));
  L.room = e.room != null ? e.room : L.room;
  L.birthDay = dayNumber(e.birthDate != null ? e.birthDate : (first ? e.at : null)) ?? L.birthDay;
  L.atBirth = { born: e.born, dead: Object.assign({}, dead) };
  L.born = e.born;
  L.deadByCause = Object.assign({}, dead);
  L.deadTotal = deadN;
  L.alive = aliveNew;
  L.phase = e.locked ? 'locked' : 'open';
  for (const d of ctx.cfg.doses) {
    const D = dose(ctx, L, d.id);
    if (first) { if (!d.castration) { D.stored = 0; raise(D, e, 'born', aliveNew); if (!aliveNew) logOwed(D, e, 'born', 0); } }
    else raise(D, e, D.recorded ? 'born_after_mark' : 'born', newHeads);
  }
  return [L];
}

/* sow_died { litter, cause } — ends her farrowing session (Move opens); the litter keeps its schedule. */
function applySowDied(ctx, e) {
  const L = needLitter(ctx, e.litter);
  if (L.sowDied) throw new Reject('already_recorded', { by: L.sowDied.who, at: L.sowDied.at });
  L.sowDied = { cause: e.cause || null, at: e.at || null, who: e.who || null, event: e.id };
  if (L.phase === 'open') { L.phase = 'locked'; L.endedBySowDeath = true; }
  return [L];
}

/* end_task { at, who } — End as a log event, so "applied after End" is a log position. */
function applyEndTask(ctx, e) {
  if (ctx.ended && ctx.ended.index != null) throw new Reject('already_ended', { at: ctx.ended.at, who: ctx.ended.who });
  ctx.ended = { at: e.at || null, who: e.who || null, index: ctx.index, event: e.id };
  return [];
}

/* count { litter, observed, baseAlive, missingRows? } — an observation. The difference against
   Alive now (not against the device's base) becomes one unexplained item, so two offline counts
   of one crate never sum. On a litter with identity rows the count names which rows are missing:
   a count cannot drop below the rows still present. */
function applyCount(ctx, e) {
  const L = needLitter(ctx, e.litter);
  needLocked(L);
  if (!isCount(e.observed)) throw new Reject('bad_numbers');
  const missing = e.missingRows || [];
  uniqueIds(missing);
  for (const id of missing) {
    const r = ctx.rows.get(id);
    if (!r || r.litter !== L.id) throw new Reject(r ? 'row_in_other_litter' : 'unknown_row', r ? { rowId: id, litter: r.litter } : { rowId: id });
    if (r.status !== 'alive') throw new Reject('row_not_alive', { rowId: id, status: r.status });
  }
  const before = L.alive;
  const diff = e.observed - before;
  if (missing.length && missing.length > -diff) throw new Reject('bad_numbers', { missingRows: missing.length, loss: Math.max(0, -diff) });
  if (e.observed < liveRows(ctx, L.id) - missing.length) throw new Reject('name_the_rows', { rows: liveRows(ctx, L.id), observed: e.observed });
  concurrentCountFlag(ctx, L, e);
  const item = { id: e.id, qty: Math.abs(diff), remaining: Math.abs(diff), at: e.at || null, who: e.who || null, explainedBy: [] };
  if (diff < 0) {
    item.rows = missing.slice();
    for (const id of missing) { const r = ctx.rows.get(id); r.status = 'missing'; r.lossId = e.id; retireRow(L, id); }
    L.losses.push(item);
  }
  if (diff > 0) {
    // an unexplained gain has no known origin: before a dose's first record it simply owes it (everyone
    // does); after, its status is unknown
    item.doses = {};
    for (const d of ctx.cfg.doses) {
      const D = dose(ctx, L, d.id);
      if (D.stored == null) continue;
      if (!D.recorded) { raise(D, e, 'gain', diff); item.doses[d.id] = 'owed'; }
      else { D.unknowns.push({ id: e.id, kind: 'gain', n: diff, from: null, at: e.at || null }); item.doses[d.id] = 'unknown'; }
    }
    L.gains.push(item);
  }
  L.alive = e.observed;
  L.counts.push({ id: e.id, observed: e.observed, baseAlive: e.baseAlive == null ? null : e.baseAlive, aliveBefore: before, wrote: diff, missingRows: missing.slice(), at: e.at || null, who: e.who || null });
  return [L];
}

function namedOpen(ctx, loss) {
  let n = 0;
  for (const r of ctx.rows.values()) if (r.status === 'missing' && r.lossId === loss.id) n++;
  return n;
}

/* death { litter, lines:[{cause,n}|{cause,rowId}], lossAlloc?:[{lossId,qty}], fromMissing? }
   Open phase: tallies never touch Alive, Born derives. Locked: an identified piglet counted
   missing draws from its loss; untagged bodies drawn from open losses leave Alive untouched; the
   rest leave Alive and may not exceed the unidentified alive. Allocations aggregate by loss; a
   loss already spent turns the excess into a plain death flagged `sync review`. */
function applyDeath(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const lines = e.lines || [];
  const tallies = [], idLines = [];
  for (const ln of lines) {
    if (ln.rowId != null) idLines.push(ln);
    else if (isCount(ln.n) && ln.n > 0) tallies.push(ln);
    else throw new Reject('bad_numbers');
  }
  const untagged = tallies.reduce((s, l) => s + l.n, 0);
  if (!untagged && !idLines.length) throw new Reject('empty');
  uniqueIds(idLines.map((l) => l.rowId));
  const locked = L.phase === 'locked';
  if (locked) concurrentCountFlag(ctx, L, e);

  const aliveRowDeaths = [], missingRowDeaths = [];
  for (const ln of idLines) {
    const r = ctx.rows.get(ln.rowId);
    if (!r) throw new Reject('unknown_row', { rowId: ln.rowId });
    if (r.litter !== L.id) throw new Reject('row_in_other_litter', { rowId: ln.rowId, litter: r.litter });
    if (r.status === 'dead') { flag(ctx, L, 'sync_review', 'row_already_dead', [r.deathEvent, e.id], { rowId: r.rowId }); continue; }
    if (r.status === 'missing') missingRowDeaths.push(ln);
    else if (r.status === 'alive') aliveRowDeaths.push(ln);
    else throw new Reject('row_not_alive', { rowId: ln.rowId, status: r.status });
  }

  // allocation: named missing piglets first, then untagged bodies (aggregated per loss)
  const take = new Map();                 // loss → qty taken by this event
  let excess = 0;
  const room = (loss) => loss.remaining - (take.get(loss) || 0);
  let missingPlain = 0;
  for (const ln of missingRowDeaths) {
    const r = ctx.rows.get(ln.rowId);
    const loss = L.losses.find((x) => x.id === r.lossId);
    if (loss && room(loss) > 0) take.set(loss, (take.get(loss) || 0) + 1);
    else { missingPlain++; excess++; }
  }
  let allocated = 0;
  if (locked && untagged > 0) {
    const want = new Map();
    if (Array.isArray(e.lossAlloc) && e.lossAlloc.length) {
      for (const a of e.lossAlloc) {
        if (!isCount(a.qty)) throw new Reject('bad_numbers');
        const loss = L.losses.find((x) => x.id === a.lossId);
        if (!loss) throw new Reject('unknown_loss', { lossId: a.lossId });
        want.set(loss, (want.get(loss) || 0) + a.qty);
      }
    } else if (e.fromMissing) {
      if (!isCount(e.fromMissing)) throw new Reject('bad_numbers');
      let left = e.fromMissing;
      for (const loss of L.losses) {                     // oldest first: losses are kept in log order
        if (!left) break;
        const free = Math.max(0, room(loss) - namedOpen(ctx, loss));
        const t = Math.min(left, free);
        if (t > 0) { want.set(loss, t); left -= t; }
      }
      if (e.fromMissing > untagged) throw new Reject('alloc_exceeds_bodies');
      excess += left;
    }
    const wantTotal = [...want.values()].reduce((s, v) => s + v, 0);
    if (wantTotal > untagged) throw new Reject('alloc_exceeds_bodies');
    for (const [loss, q] of want) {
      const free = Math.max(0, room(loss) - namedOpen(ctx, loss));
      const t = Math.min(q, free);
      if (t > 0) take.set(loss, (take.get(loss) || 0) + t);
      allocated += t;
      excess += q - t;
    }
  }
  const plain = locked ? untagged - allocated : 0;

  if (locked) {
    const rowsHere = liveRows(ctx, L.id);
    const unidentified = L.alive - rowsHere;
    if (plain + missingPlain > unidentified) throw new Reject(rowsHere > 0 ? 'name_the_rows' : 'more_than_alive', { plain: plain + missingPlain, unidentified });
  }

  const byCause = {};
  for (const l of tallies) byCause[l.cause] = (byCause[l.cause] || 0) + l.n;
  for (const l of aliveRowDeaths.concat(missingRowDeaths)) byCause[l.cause] = (byCause[l.cause] || 0) + 1;
  const n = untagged + aliveRowDeaths.length + missingRowDeaths.length;
  for (const [c, k] of Object.entries(byCause)) L.deadByCause[c] = (L.deadByCause[c] || 0) + k;
  L.deadTotal += n;
  if (!locked) {
    L.born += untagged;                                  // open: Born = Alive + Σ Dead
    L.alive -= aliveRowDeaths.length;
    L.born += missingRowDeaths.length;
  } else {
    L.alive -= plain + missingPlain + aliveRowDeaths.length;
    for (const [loss, q] of take) { loss.remaining -= q; loss.explainedBy.push({ event: e.id, kind: 'death', qty: q }); }
  }
  for (const l of aliveRowDeaths.concat(missingRowDeaths)) {
    const r = ctx.rows.get(l.rowId);
    r.status = 'dead'; r.cause = l.cause; r.deathAt = e.at || null; r.deathEvent = e.id;
    retireRow(L, l.rowId);
  }
  if (excess > 0) flag(ctx, L, 'sync_review', 'loss_over_consumed', [e.id], { excess });
  const fromLoss = [...take.values()].reduce((s, v) => s + v, 0);
  L.deaths.push({ id: e.id, byCause, plain: locked ? plain + missingPlain : untagged, rows: aliveRowDeaths.length + missingRowDeaths.length, fromMissing: fromLoss, excess, at: e.at || null, who: e.who || null, phase: L.phase });
  return [L];
}

/* move { from, to, n, rows[], answers:{doseId:'yes'|'no'|'unknown'}, explains?:[lossId|null, gainId|null] }
   One record, both litters. A side named in `explains` relabels its open item (zero Alive effect
   there). Rows are named, unique, and a fully identified source must name who leaves. Untagged n
   above the source's Alive is clamped and flagged. */
function applyMove(ctx, e) {
  const S = needLitter(ctx, e.from), R = needLitter(ctx, e.to);
  if (S === R) throw new Reject('same_litter');
  needLocked(S); needLocked(R);
  const ex = e.explains || [];
  const loss = ex[0] ? S.losses.find((x) => x.id === ex[0]) : null;
  const gain = ex[1] ? R.gains.find((x) => x.id === ex[1]) : null;
  if (ex[0] && !loss) throw new Reject('unknown_loss', { lossId: ex[0] });
  if (ex[1] && !gain) throw new Reject('unknown_gain', { gainId: ex[1] });
  const rowIds = e.rows || [];
  uniqueIds(rowIds);
  const aliveRows = [], missingRows = [];
  for (const id of rowIds) {
    const r = ctx.rows.get(id);
    if (!r) throw new Reject('unknown_row', { rowId: id });
    if (r.litter !== S.id) throw new Reject('row_in_other_litter', { rowId: id, litter: r.litter });
    if (r.status === 'alive') aliveRows.push(id);
    else if (r.status === 'missing' && loss && r.lossId === loss.id) missingRows.push(id);
    else throw new Reject('row_not_alive', { rowId: id, status: r.status });
  }
  let n = e.n != null ? e.n : rowIds.length;
  if (!isCount(n) || n < rowIds.length) throw new Reject('bad_numbers');

  const lossQ = loss ? Math.min(n - aliveRows.length, loss.remaining) : 0;
  if (lossQ < missingRows.length) throw new Reject('bad_numbers', { missingRows: missingRows.length });
  if (loss && loss.remaining < n - aliveRows.length) flag(ctx, S, 'sync_review', 'explained_more_than_open', [e.id], { lossId: loss.id });
  let untaggedOut = n - lossQ - aliveRows.length;
  const rowsS = liveRows(ctx, S.id);
  const unidentified = S.alive - rowsS;
  if (untaggedOut > unidentified) {
    if (rowsS > 0) throw new Reject('name_the_rows', { untagged: untaggedOut, unidentified });
    flag(ctx, S, 'sync_review', 'move_clamped', [e.id], { asked: n, alive: S.alive });
    untaggedOut = unidentified;
    n = lossQ + aliveRows.length + untaggedOut;
  }
  if (n === 0) throw new Reject('nothing_to_move');
  const plainOut = n - lossQ;
  const gainQ = gain ? Math.min(n, gain.remaining) : 0;
  if (gain && gainQ < n) flag(ctx, R, 'sync_review', 'explained_more_than_open', [e.id], { gainId: gain.id });
  const plainIn = n - gainQ;
  if (liveRows(ctx, R.id) + rowIds.length > R.alive + plainIn) throw new Reject('name_the_rows', { receiver: R.id });
  concurrentCountFlag(ctx, S, e); concurrentCountFlag(ctx, R, e);
  const explaining = !!(loss || gain);
  const after = afterEnd(ctx, e);

  const packets = {}, owedOut = {};
  for (const d of ctx.cfg.doses) {
    const DS = dose(ctx, S, d.id), DR = dose(ctx, R, d.id);
    const answer = (e.answers || {})[d.id];
    // the explained gain's piglets: resolve what the gain parked, by the answer only (challenge #6)
    if (gain && gainQ) {
      const st = gain.doses && gain.doses[d.id];
      const ans = d.visible ? 'unknown' : answer;
      if (st === 'owed' && ans === 'yes') { lower(DR, e, 'explained', gainQ); cover(DR, e, 'gain', gainQ, null, S.id); }
      if (st === 'unknown') {
        const grp = DR.unknowns.find((g) => g.id === gain.id);
        const k = grp ? Math.min(gainQ, grp.n) : 0;
        if (k && ans === 'yes') { takeUnknown(DR, k, gain.id); cover(DR, e, 'gain', k, null, S.id); }
        if (k && ans === 'no') { takeUnknown(DR, k, gain.id); raise(DR, e, 'arrival', k); }
      }
    }
    const cls = explaining ? 'asked' : classify(S, DS);
    const outcome = outcomeFor(cls, d, answer);
    packets[d.id] = outcome;
    if (plainIn) {
      if (outcome === 'done') cover(DR, e, 'move', plainIn, gainQ === 0 && aliveRows.length + missingRows.length === n ? rowIds : null, S.id);
      if (outcome === 'owed') { raise(DR, e, 'arrival', plainIn); if (after) DR.catchUp += plainIn; }
      if (outcome === 'check' || outcome === 'unknown') DR.unknowns.push({ id: e.id, kind: 'move', n: plainIn, from: S.id, at: e.at || null });
    }
    // source coverage moves too (challenge #2): untreated piglets leaving lower the source's owed;
    // Yes and Don't know leave it (the source can only over-owe)
    if (outcome === 'owed') { const before = shown(S, DS); lower(DS, e, 'moved_out', n); if (before) owedOut[d.id] = Math.min(n, before); }
  }

  S.alive -= plainOut; S.movedOut += n;
  R.alive += plainIn; R.movedIn += n;
  if (loss && lossQ) { loss.remaining -= lossQ; loss.explainedBy.push({ event: e.id, kind: 'move', qty: lossQ, to: R.id }); }
  if (gain && gainQ) { gain.remaining -= gainQ; gain.explainedBy.push({ event: e.id, kind: 'move', qty: gainQ, from: S.id }); }
  for (const id of rowIds) {
    const r = ctx.rows.get(id);
    retireRow(S, id);
    r.litter = R.id; r.status = 'alive'; delete r.lossId;
  }
  const rec = { id: e.id, n, rows: rowIds.slice(), explains: [loss ? loss.id : null, gain ? gain.id : null], packets, answers: Object.assign({}, e.answers || {}), at: e.at || null, who: e.who || null, afterEnd: after };
  S.moves.push(Object.assign({ dir: 'out', other: R.id, aliveEffect: -plainOut }, rec));
  R.moves.push(Object.assign({ dir: 'in', other: S.id, aliveEffect: plainIn }, rec));
  if (after && inTask(ctx, S.id)) S.movedOutAfterEnd.push({ move: e.id, n, to: R.id, owed: owedOut });
  return [S, R];
}

function taskGate(ctx, L, e, D) {
  if (!inTask(ctx, L.id)) throw new Reject('no_task', { litter: L.id });
  if (!ctx.ended) return {};
  if (e.viaCorrection) return { flag: 'correction_after_end' };
  if (!afterEnd(ctx, e)) return {};
  if (!stampedAfterEnd(ctx, e)) return { flag: 'arrived_after_end' };
  if (D && D.catchUp > 0) return { catchUp: true };
  throw new Reject('task_ended', { at: ctx.ended.at, who: ctx.ended.who });
}

/* The dose as the writer saw it: the owed the latest record it had seen left, plus the changes it
   had seen since. null when it had seen no record. */
function viewOwed(ctx, D, e) {
  let v = null;
  for (const x of D.log) {
    if (!ctx.causal.saw(e.id, x.event)) continue;
    if (x.kind === 'record') v = x.after;
    else if (v != null) v = Math.max(0, v + x.delta);
  }
  return v;
}

/* treat { litter, dose, n, deferred?:{n,reason}, exempt?:{n,reason}, castration?, product?, amount? }
   castration: { castrated, hernia, cryptorchid, kept, deferred, females?, deferReason? }
   A record the writer made on a dose it saw done records nothing (the tap guard, decided in the
   writer's causal view before any collision). An online record accounts for every owed piglet.
   Concurrent records are both kept, flagged `possible double treatment`, and never prove the
   deferred piglets were treated: the owed they leave is the larger of the sequential result and
   what this record itself left plus the raises it had not seen. */
function applyTreat(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const d = needDose(ctx, e.dose);
  const D = dose(ctx, L, d.id);
  const gate = taskGate(ctx, L, e, D);
  const own = D.records.filter((r) => r.target !== 'unknown');
  const seenRecs = own.filter((r) => ctx.causal.saw(e.id, r.id));
  const nothing = (r) => new Reject('nothing_owed', r ? { by: r.who, at: r.at, record: r.id } : null);
  if (seenRecs.length && viewOwed(ctx, D, e) === 0) throw nothing(seenRecs[seenRecs.length - 1]);
  const isStale = stale(ctx, L, e);
  const collided = own.filter((r) => ctx.causal.concurrent(r.id, e.id));
  const sh = shown(L, D);
  if (!collided.length && sh === 0) throw nothing(own[own.length - 1]);

  let treated, deferN, exemptN, females = 0, deferReason = null, castr = null;
  const exemptBy = {};
  if (d.castration) {
    const c = e.castration || {};
    for (const k of ['castrated', 'females', 'deferred', ...EXEMPT_REASONS]) if (c[k] != null && !isCount(c[k])) throw new Reject('bad_numbers');
    treated = c.castrated || 0;
    deferN = c.deferred || 0;
    exemptN = EXEMPT_REASONS.reduce((s, k) => s + (c[k] || 0), 0);
    for (const k of EXEMPT_REASONS) if (c[k]) exemptBy[k] = c[k];
    females = c.females || 0;
    deferReason = deferN ? (c.deferReason || 'deferred') : null;
    castr = c;
  } else {
    treated = e.n || 0;
    deferN = (e.deferred && e.deferred.n) || 0;
    exemptN = (e.exempt && e.exempt.n) || 0;
    if (![treated, deferN, exemptN].every(isCount)) throw new Reject('bad_numbers');
    if (exemptN) exemptBy[e.exempt.reason || 'other'] = exemptN;
    deferReason = deferN ? (e.deferred.reason || null) : null;
  }
  const accounted = treated + deferN + exemptN + females;
  if (gate.catchUp && treated + exemptN + females > D.catchUp) throw new Reject('task_ended', { catchUp: D.catchUp });

  if (!collided.length && !isStale && !gate.catchUp) {
    if (sh == null) {                                    // castration's first record: males are counted now
      if (treated + deferN + exemptN > L.alive) throw new Reject('more_than_alive');
    } else if (accounted !== sh) {
      throw new Reject(accounted > sh ? 'more_than_owed' : 'reason_missing', { owed: sh, accounted });
    }
  } else if (accounted === 0 && sh !== null) {
    throw new Reject('empty');
  }

  const base = sh == null ? treated + deferN + exemptN + females : sh;
  const seq = Math.max(0, base - treated - exemptN - females);
  let owedAfter = seq;
  if (gate.catchUp) owedAfter = Math.max(0, (D.stored || 0) - treated - exemptN - females);
  else if (collided.length || isStale) {
    const unseenRaise = D.log.filter((x) => x.delta > 0 && x.kind !== 'record' && !ctx.causal.saw(e.id, x.event)).reduce((s, x) => s + x.delta, 0);
    owedAfter = Math.max(seq, deferN + unseenRaise);
  }
  const prevDeferred = D.deferred;
  D.recorded = true;
  D.stored = owedAfter;
  logOwed(D, e, 'record', 0);
  D.deferred = Math.min(owedAfter, gate.catchUp ? prevDeferred : deferN + (isStale || collided.length ? prevDeferred : 0));
  if (deferN) D.deferReason = deferReason;
  if (!D.deferred) D.deferReason = null;
  if (gate.catchUp) D.catchUp = Math.max(0, D.catchUp - treated - exemptN - females);
  D.treated += treated;
  D.exempt += exemptN;
  for (const [k, v] of Object.entries(exemptBy)) D.exemptBy[k] = (D.exemptBy[k] || 0) + v;
  if (castr) {
    const C = D.castration || (D.castration = { castrated: 0, notCastrated: { hernia: 0, cryptorchid: 0, kept: 0, deferred: 0 }, females: 0 });
    C.castrated += treated;
    for (const k of EXEMPT_REASONS) C.notCastrated[k] += castr[k] || 0;
    C.notCastrated.deferred = D.deferred;               // only deferred stays due; it is a current figure
    C.females += females;
    for (const k of NOTE_REASONS) if (castr[k]) L.notes.push({ kind: k, n: castr[k], event: e.id, at: e.at || null });
  }
  const rec = record(ctx, L, d, e, { n: treated, deferred: deferN, deferReason, exempt: exemptN, exemptBy, females, castration: castr ? clone(castr) : null, catchUp: !!gate.catchUp });
  if (owedAfter === 0 && D.fullAt == null) D.fullAt = rec.dayAge;
  D.records.push(rec);
  if (collided.length) {
    D.collisions.push([collided[0].id, e.id]);
    flag(ctx, L, 'possible_double_treatment', 'sync_collision', collided.map((r) => r.id).concat(e.id), { dose: d.id });
  }
  if (gate.flag) flag(ctx, L, 'task', gate.flag, [e.id], { dose: d.id });
  return [L];
}

function record(ctx, L, d, e, fields) {
  const dayAge = L.birthDay == null || dayNumber(e.at) == null ? null : dayNumber(e.at) - L.birthDay;
  let timing = null;
  if (dayAge != null) {
    if (d.last != null && dayAge > d.last) timing = 'after_window';
    else if (dayAge < d.due) timing = 'early';
    else if (dayAge > d.due) timing = 'late';
    else timing = 'on_time';
  }
  const rec = Object.assign({
    id: e.id, dose: d.id, target: e.target || null,
    product: e.product !== undefined ? e.product : d.product, amount: e.amount !== undefined ? e.amount : d.amount,
    dayAge, timing, onTime: timing === 'early' || timing === 'on_time',
    at: e.at || null, who: e.who || null, device: e.device || null, viaCorrection: e.viaCorrection || null
  }, fields);
  L.lastRecord = { id: e.id, dose: d.id, at: e.at || null, who: e.who || null, day: dayNumber(e.at) };
  return rec;
}

/* treat { litter, dose, n, target:'unknown', group? } — record the dose on unknown arrivals
   (RULINGS Q14: resolved by recording). */
function applyTreatUnknown(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const d = needDose(ctx, e.dose);
  const D = dose(ctx, L, d.id);
  const gate = taskGate(ctx, L, e, null);
  if (!isCount(e.n) || e.n === 0) throw new Reject('bad_numbers');
  const avail = e.group ? total(D.unknowns.filter((g) => g.id === e.group)) : total(D.unknowns);
  if (e.n > Math.min(avail, L.alive)) throw new Reject('more_than_unknown', { unknown: avail });
  takeUnknown(D, e.n, e.group);
  D.treated += e.n;
  if (d.castration && D.castration) D.castration.castrated += e.n;
  D.records.push(record(ctx, L, d, e, { n: e.n, deferred: 0, deferReason: null, exempt: 0, exemptBy: {}, females: 0, castration: null, catchUp: false }));
  if (gate.flag) flag(ctx, L, 'task', gate.flag, [e.id], { dose: d.id });
  return [L];
}

/* check { litter, dose, had, lacks?, group? } — unknown arrivals resolved on the pig or by the
   spray mark: `had` already had it (evidence), `lacks` did not (they owe it). */
function applyCheck(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const d = needDose(ctx, e.dose);
  const D = dose(ctx, L, d.id);
  const had = e.had || 0, lacks = e.lacks || 0;
  if (!isCount(had) || !isCount(lacks) || had + lacks === 0) throw new Reject('bad_numbers');
  const avail = e.group ? total(D.unknowns.filter((g) => g.id === e.group)) : total(D.unknowns);
  if (had + lacks > Math.min(avail, L.alive)) throw new Reject('more_than_unknown', { unknown: avail });
  takeUnknown(D, had + lacks, e.group);
  cover(D, e, 'had', had, null, null);
  raise(D, e, 'lacks', lacks);
  D.checks.push({ id: e.id, had, lacks, group: e.group || null, at: e.at || null, who: e.who || null });
  return [L];
}

/* identity { litter, op:'add'|'edit'|'withdraw'|'close', rowId, tag?, notch?, sex?, weight?, set? }
   Rows are never deleted. Tag or notch identifies; sex and weight never block. The op names the
   litter that holds the row; a stale op after a Move is refused with the row's current litter. */
function applyIdentity(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const op = e.op || 'add';
  if (op === 'close') { L.idClosed = true; return [L]; }
  if (op === 'add') {
    if (ctx.rows.has(e.rowId)) throw new Reject('duplicate_row', { rowId: e.rowId });
    if (!e.tag && !e.notch) throw new Reject('tag_or_notch');
    if (liveRows(ctx, L.id) + 1 > L.alive) throw new Reject('more_rows_than_alive');
    ctx.rows.set(e.rowId, {
      rowId: e.rowId, litter: L.id, birthLitter: L.id, tag: e.tag || null, notch: e.notch || null,
      sex: e.sex || null, weight: e.weight == null ? null : e.weight, status: 'alive',
      addedAt: e.at || null, addedBy: e.who || null, edits: []
    });
    return [L];
  }
  const r = ctx.rows.get(e.rowId);
  if (!r) throw new Reject('unknown_row', { rowId: e.rowId });
  if (r.litter !== L.id) throw new Reject('row_in_other_litter', { rowId: e.rowId, litter: r.litter });
  if (op === 'edit') {
    const set = e.set || {};
    for (const k of Object.keys(set)) if (!['tag', 'notch', 'sex', 'weight'].includes(k)) throw new Reject('bad_field', { field: k });
    const next = Object.assign({ tag: r.tag, notch: r.notch }, set);
    if (!next.tag && !next.notch) throw new Reject('tag_or_notch');
    const before = {};
    for (const k of Object.keys(set)) { before[k] = r[k]; r[k] = set[k]; }
    r.edits.push({ event: e.id, before, set: Object.assign({}, set), at: e.at || null, who: e.who || null });
  } else if (op === 'withdraw') {
    if (r.withdrawn) throw new Reject('already_withdrawn');
    r.withdrawn = { event: e.id, at: e.at || null, who: e.who || null, statusBefore: r.status };
    r.status = 'withdrawn';
    retireRow(L, r.rowId);
  } else throw new Reject('unknown_op');
  return [L];
}

/* weaned { litter, n?, rows? } — n defaults to every alive piglet; a partial wean from a litter
   with rows names the rows that leave when the untagged remainder cannot cover it. */
function applyWeaned(ctx, e) {
  const L = needLitter(ctx, e.litter);
  needLocked(L);
  const n = e.n == null ? L.alive : e.n;
  if (!isCount(n) || n === 0) throw new Reject('bad_numbers');
  if (n > L.alive) throw new Reject('alive_negative', { alive: L.alive });
  const named = e.rows || [];
  uniqueIds(named);
  for (const id of named) {
    const r = ctx.rows.get(id);
    if (!r || r.litter !== L.id) throw new Reject(r ? 'row_in_other_litter' : 'unknown_row', r ? { rowId: id, litter: r.litter } : { rowId: id });
    if (r.status !== 'alive') throw new Reject('row_not_alive', { rowId: id, status: r.status });
  }
  if (named.length > n) throw new Reject('bad_numbers');
  const rowsHere = liveRows(ctx, L.id);
  if (n < L.alive && n - named.length > L.alive - rowsHere) throw new Reject('name_the_rows', { untagged: n - named.length, unidentified: L.alive - rowsHere });
  concurrentCountFlag(ctx, L, e);
  L.alive -= n; L.weaned += n;
  const set = new Set(named);
  for (const r of ctx.rows.values()) {
    if (r.litter !== L.id || r.status !== 'alive') continue;
    if (set.has(r.rowId) || L.alive === 0) { r.status = 'weaned'; r.weanedAt = e.at || null; retireRow(L, r.rowId); }
  }
  return [L];
}

// ---------------------------------------------------------------------------------------------
// view: the derived facts a page renders

function view(ctx, L, corrections) {
  const today = ctx.today;
  const dayAge = L.birthDay != null && today != null ? today - L.birthDay : null;
  const doses = {};
  for (const d of ctx.cfg.doses) {
    const D = dose(ctx, L, d.id);
    const owed = shown(L, D);
    let status = null;
    if (dayAge != null) {
      if (dayAge < d.due) status = 'later';
      else if (d.last != null && dayAge > d.last) status = 'missed';
      else if (dayAge > d.due) status = 'late';
      else status = 'due';
    }
    const unknown = Math.min(total(D.unknowns), L.alive);
    // why the stored owed stands: the latest record's deferral, then raises since
    let lastRec = -1;
    D.log.forEach((x, i) => { if (x.kind === 'record') lastRec = i; });
    const owedFrom = [];
    if (D.deferred) owedFrom.push({ kind: 'deferred', n: D.deferred, reason: D.deferReason });
    if (lastRec >= 0) {
      for (const x of D.log.slice(lastRec + 1)) {
        if (!(x.delta > 0) || !RAISES.has(x.kind)) continue;
        const f = owedFrom.find((o) => o.kind === x.kind);
        if (f) f.n += x.delta; else owedFrom.push({ kind: x.kind, n: x.delta });
      }
    }
    doses[d.id] = {
      dose: d.id, tx: d.tx, due: d.due, last: d.last, visible: d.visible, isCastration: d.castration, product: d.product, amount: d.amount,
      status,
      owed,                                          // shown: min(stored, alive); null = castration before its first record
      owedStored: D.stored,
      owedFrom,
      treated: D.treated,
      deferred: owed == null ? D.deferred : Math.min(D.deferred, owed),
      deferReason: D.deferReason,
      exempt: D.exempt, exemptBy: Object.assign({}, D.exemptBy),
      missed: status === 'missed' && owed ? owed : 0,
      unknownAfterMove: unknown,
      unknownGroups: D.unknowns.map((g) => Object.assign({}, g)),
      carriedFromMove: Math.min(total(D.coverage), L.alive),
      coverage: D.coverage.map((g) => clone(g)),
      catchUp: D.catchUp,
      fullAt: D.fullAt,
      done: owed === 0 && unknown === 0,
      records: D.records.map((r) => Object.assign({}, r, { corrected: corrections.has(r.id) })),
      possibleDoubleTreatment: D.collisions.map((p) => p.slice()),
      castrationFacts: d.castration ? (D.castration ? {
        castrated: D.castration.castrated,
        notCastrated: Object.assign({}, D.castration.notCastrated),
        females: D.castration.females,
        males: D.castration.castrated + sum(D.castration.notCastrated)
      } : null) : undefined
    };
    if (d.castration) doses[d.id].castration = doses[d.id].castrationFacts;
    delete doses[d.id].castrationFacts;
  }
  const rowsHere = [...ctx.rows.values()].filter((r) => r.litter === L.id);
  const live = rowsHere.filter((r) => r.status === 'alive').length;
  const scheme = ctx.cfg.identity;
  let idDone = null;
  if (scheme.scheme !== 'none') idDone = scheme.who === 'candidates' ? L.idClosed : live >= L.alive;
  const openL = L.losses.reduce((s, x) => s + x.remaining, 0), openG = L.gains.reduce((s, x) => s + x.remaining, 0);
  const item = (x) => ({ id: x.id, qty: x.qty, open: x.remaining, rows: x.rows || [], at: x.at, who: x.who, explainedBy: x.explainedBy.map((b) => Object.assign({}, b)) });
  const out = {
    id: L.id, room: L.room, phase: L.phase, endedBySowDeath: !!L.endedBySowDeath,
    inTask: inTask(ctx, L.id),
    sowDied: L.sowDied ? Object.assign({}, L.sowDied) : null,
    birthDay: L.birthDay, dayAge,
    born: L.born, dead: { total: L.deadTotal, byCause: Object.assign({}, L.deadByCause) },
    alive: L.alive, movedIn: L.movedIn, movedOut: L.movedOut, weaned: L.weaned,
    unexplained: { openLoss: openL, openGain: openG, losses: L.losses.map(item), gains: L.gains.map(item) },
    moves: L.moves.map((m) => clone(m)),
    movedOutAfterEnd: L.movedOutAfterEnd.map((m) => clone(m)),
    counts: L.counts.map((c) => clone(c)),
    deaths: L.deaths.map((d) => clone(d)),
    doses,
    identity: {
      scheme: scheme.scheme, who: scheme.who,
      identified: live, liveRows: live,
      missing: rowsHere.filter((r) => r.status === 'missing').length,
      onRecord: rowsHere.filter((r) => r.status !== 'withdrawn').length,
      rows: [...ctx.rows.values()].filter((r) => r.litter === L.id || r.birthLitter === L.id).map((r) => clone(r)),
      closed: L.idClosed, done: idDone
    },
    notes: L.notes.map((n) => Object.assign({}, n)),
    flags: L.flags.map((f) => clone(f)),
    lastEvent: L.lastEvent, lastRecord: L.lastRecord
  };
  out.balanced = balances(out);
  return out;
}

/* The ledger identity for one derived litter. */
export function balances(L) {
  return L.alive >= 0 &&
    L.alive === L.born - L.dead.total - L.movedOut + L.movedIn - L.unexplained.openLoss + L.unexplained.openGain - L.weaned;
}

/* Append one event and say whether the ledger took it, and which earlier records it made
   invalid (`dependents`). Treat records get the configured product and dose snapshotted. */
export function append(events, event, config, opts) {
  const e = Object.assign({}, event);
  if (e.type === 'treat') {
    const d = normalizeConfig(config).doses.find((x) => x.id === e.dose);
    if (d) { if (e.product === undefined) e.product = d.product; if (e.amount === undefined) e.amount = d.amount; }
  }
  const prev = derive(events, config, opts);
  const next = (events || []).concat(e);
  const derived = derive(next, config, opts);
  const r = derived.rejected.find((x) => x.id === e.id);
  const was = new Set(prev.rejected.map((x) => x.id));
  const dependents = derived.rejected.filter((x) => x.id !== e.id && !was.has(x.id) && !String(x.id).startsWith(e.id + ':'));
  return { ok: !r, reason: r ? r.reason : null, detail: r ? r.detail : null, event: e, events: r ? events : next, derived, dependents };
}

// ---------------------------------------------------------------------------------------------
// selectors: what the pages render. Pages hold no ledger arithmetic.

function doseOrder(cfg) { const ix = new Map(cfg.doses.map((d, i) => [d.id, i])); return (a, b) => a.due - b.due || ix.get(a.dose) - ix.get(b.dose); }
function population(D) { return D.castration ? D.castration.males : null; }

/* One litter as the room sees it (room glossary, slice S1). */
function roomFacts(derived, L) {
  const cfg = derived.config, order = doseOrder(cfg), today = derived.today;
  const Ds = Object.values(L.doses);
  const todo = (D) => D.owed == null ? !D.records.length : D.owed > 0 || D.unknownAfterMove > 0;
  const live = Ds.filter((D) => (D.status === 'due' || D.status === 'late') && todo(D)).sort(order);
  const lapsed = Ds.filter((D) => D.status === 'missed' && todo(D)).sort(order);
  const ahead = Ds.filter((D) => D.status === 'later' && todo(D)).sort(order);
  const recToday = L.lastRecord && L.lastRecord.day === today ? L.lastRecord : null;
  const doneToday = Ds.filter((D) => D.records.some((r) => dayNumber(r.at) === today)).map((D) => D.dose);
  let next = null;
  if (ahead.length) { const due = ahead[0].due; next = { inDays: due - L.dayAge, doses: ahead.filter((D) => D.due === due).map((D) => D.dose) }; }
  const lateBy = Math.max(0, ...live.map((D) => L.dayAge - D.due));
  let lens;
  if (!L.inTask) lens = null;
  else if (live.length) lens = 'owed';
  else if (!lapsed.length && recToday) lens = 'done';
  else lens = 'later';
  let kind;
  if (!L.inTask) kind = 'none';
  else if (live.length) kind = 'owes';
  else if (lens === 'done') kind = 'done';
  else if (lapsed.length) kind = 'missed';
  else if (next) kind = 'next';
  else kind = 'finished';
  const doseRow = (D) => ({ dose: D.dose, tx: D.tx, due: D.due, n: D.owed == null ? null : D.owed, of: D.isCastration ? population(D) : L.alive, unknown: D.unknownAfterMove, status: D.status });
  const collide = Ds.reduce((s, D) => s + D.possibleDoubleTreatment.length, 0);
  return {
    litter: L.id, lens, kind, day: L.dayAge, alive: L.alive,
    doses: live.map(doseRow), lateBy, partly: lens === 'owed' && !!recToday,
    missed: lapsed.map((D) => ({ dose: D.dose, tx: D.tx, last: D.last, n: D.owed })),
    next, lastRecord: L.lastRecord, doneToday,
    collide, loss: L.unexplained.openLoss, gain: L.unexplained.openGain,
    chip: L.sowDied ? 'sowdied' : L.phase === 'open' ? 'unlocked' : null
  };
}

function roomSelect(derived, opts) {
  const o = opts || {};
  const lens = o.lens || 'owed', filter = o.filter || [];
  const litters = Object.values(derived.litters).filter((L) => o.room == null || L.room === o.room);
  const facts = litters.map((L) => roomFacts(derived, L));
  const inLens = (f, l) => l === 'all' || f.lens === l;
  const doseSet = (f, l) => {
    const owed = f.doses.map((x) => x.dose), later = (f.next ? f.next.doses : []).concat(f.missed.map((x) => x.dose));
    return l === 'owed' ? owed : l === 'done' ? f.doneToday : l === 'later' ? later : owed.concat(f.doneToday, later);
  };
  const cfgDose = new Map(derived.config.doses.map((d) => [d.id, d]));
  const matches = (f, l) => {
    if (o.missedOnly && !f.missed.length) return false;
    if (!filter.length) return true;
    const ids = doseSet(f, l);
    return filter.some((x) => ids.some((id) => id === x || (cfgDose.get(id) || {}).tx === x));
  };
  const rank = (f) => (f.lateBy ? 0 : f.partly ? 2 : 1);
  const byCode = (a, b) => (a.litter < b.litter ? -1 : a.litter > b.litter ? 1 : 0);
  const sorters = {
    owed: (a, b) => rank(a) - rank(b) || (rank(a) === 0 ? b.lateBy - a.lateBy : 0) || byCode(a, b),
    later: (a, b) => (a.next ? a.next.inDays : 999) - (b.next ? b.next.inDays : 999) || byCode(a, b),
    done: byCode, all: byCode
  };
  const rows = facts.filter((f) => inLens(f, lens) && matches(f, lens)).sort(sorters[lens]);
  const counts = { owed: 0, done: 0, later: 0, all: facts.length };
  for (const f of facts) if (f.lens) counts[f.lens]++;
  const strip = { openLoss: 0, openGain: 0, lossLitters: [], gainLitters: [], netDrift: 0, showNet: false };
  for (const f of facts) {
    if (f.loss) { strip.openLoss += f.loss; strip.lossLitters.push(f.litter); }
    if (f.gain) { strip.openGain += f.gain; strip.gainLitters.push(f.litter); }
  }
  strip.lossLitters.sort(); strip.gainLitters.sort();
  strip.netDrift = strip.openGain - strip.openLoss;
  strip.showNet = strip.openLoss > 0 && strip.openGain > 0;
  const comingUp = counts.owed === 0 ? facts.filter((f) => f.lens && f.next).sort(sorters.later) : [];
  let last = null;
  for (const L of litters) {
    const ev = L.lastEvent;
    if (ev && (!last || (time(ev.at) || 0) > (time(last.at) || 0))) last = Object.assign({ litter: L.id }, ev);
  }
  return {
    lens, counts, rows, lead: lens === 'owed' ? rows.length : facts.filter((f) => f.lens === 'owed' && matches(f, 'owed')).length,
    strip, doses: derived.config.doses.map((d) => d.id).filter((id) => facts.some((f) => doseSet(f, 'all').includes(id))),
    missedLitters: facts.filter((f) => f.lens && f.missed.length).length,
    comingUp, lastRecord: last
  };
}

/* A treat draft against one dose: owed, the not-treated remainder, why Save is gray. */
function treatDraft(L, D, draft) {
  const dr = draft || {};
  if (D.isCastration) {
    const c = dr.castration || {};
    const males = (c.castrated || 0) + (c.hernia || 0) + (c.cryptorchid || 0) + (c.kept || 0) + (c.deferred || 0);
    const owed = D.owed;
    let why = null;
    if (owed === 0) why = 'nothing_owed';
    else if (owed == null ? males > L.alive : males + (c.females || 0) !== owed) why = owed != null && males + (c.females || 0) > owed ? 'more_than_owed' : owed == null ? 'more_than_alive' : 'reason_missing';
    return { owed, males, why, event: why ? null : { type: 'treat', litter: L.id, dose: D.dose, castration: Object.assign({ castrated: 0 }, c) } };
  }
  const owed = D.owed;
  const n = dr.n == null ? owed : dr.n;
  const k = (dr.deferred && dr.deferred.n) || 0, x = (dr.exempt && dr.exempt.n) || 0;
  const notTreated = Math.max(0, owed - n - k - x);
  let why = null;
  if (owed === 0) why = 'nothing_owed';
  else if (n + k + x > owed) why = 'more_than_owed';
  else if (notTreated > 0) why = 'reason_missing';
  const ev = { type: 'treat', litter: L.id, dose: D.dose, n };
  if (k) ev.deferred = Object.assign({}, dr.deferred);
  if (x) ev.exempt = Object.assign({}, dr.exempt);
  return { owed, treated: n, notTreated, why, event: why ? null : ev };
}

function litterSelect(derived, id, opts) {
  const L = derived.litters[id];
  if (!L) return null;
  const o = opts || {};
  const order = doseOrder(derived.config);
  const Ds = Object.values(L.doses);
  const todo = (D) => D.owed == null ? !D.records.length : D.owed > 0 || D.unknownAfterMove > 0;
  const now = Ds.filter((D) => D.status !== 'later' && todo(D)).sort(order);
  const drafts = {};
  for (const [doseId, dr] of Object.entries(o.drafts || {})) if (L.doses[doseId]) drafts[doseId] = treatDraft(L, L.doses[doseId], dr);
  return {
    id: L.id, inTask: L.inTask,
    header: { born: L.born, alive: L.alive, dead: L.dead.total, dayAge: L.dayAge, phase: L.phase, sowDied: !!L.sowDied },
    owed: now.map((D) => ({
      dose: D.dose, tx: D.tx, due: D.due, status: D.status, lateBy: D.status === 'late' ? L.dayAge - D.due : 0,
      missedAfter: D.status === 'missed' ? D.last : null,
      owed: D.owed, oneTap: D.owed == null ? null : D.owed, deferred: D.deferred, deferReason: D.deferReason,
      unknown: D.unknownAfterMove, owedFrom: D.owedFrom.map((x) => Object.assign({}, x))
    })),
    dosesLeft: { left: now.length, total: Ds.filter((D) => D.status !== 'later').length },
    recorded: Ds.filter((D) => D.records.length).sort(order).map((D) => ({ dose: D.dose, tx: D.tx, records: D.records.map((r) => Object.assign({}, r)), collisions: D.possibleDoubleTreatment })),
    later: Ds.filter((D) => D.status === 'later').sort(order).map((D) => ({ dose: D.dose, tx: D.tx, due: D.due, inDays: D.due - L.dayAge })),
    identity: L.identity, unexplained: L.unexplained, notes: L.notes, flags: L.flags,
    drafts
  };
}

/* The shared dead drawer's arithmetic (slice S5): caps, the from-the-missing range, why Save is gray. */
function deathDraftSelect(L, draft) {
  const dr = draft || {};
  const locked = L.phase === 'locked';
  const tallies = dr.tallies || {};
  const picks = dr.picks || {};
  const lossN = L.unexplained.openLoss;
  const roster = L.identity.rows.filter((r) => r.litter === L.id && (r.status === 'alive' || r.status === 'missing'));
  const liveRowsN = L.identity.liveRows;
  const unidentified = L.alive - liveRowsN;
  const bodies = sum(tallies);
  const pickIds = Object.keys(picks);
  const cap = locked ? unidentified + lossN : Infinity;
  const kMax = Math.min(bodies, lossN);
  const kMin = locked ? Math.max(0, bodies - unidentified) : 0;
  const asksLoss = locked && lossN > 0;
  const k = dr.k == null ? null : dr.k;
  let why = null;
  const bare = pickIds.filter((r) => !picks[r]);
  if (!bodies && !pickIds.length) why = 'empty';
  else if (bare.length) why = bare.length === 1 ? 'cause_one' : 'cause_many';
  else if (bodies > cap) why = 'over_cap';
  else if (asksLoss && bodies > 0 && (k == null || k < kMin || k > kMax)) why = 'missing';
  const lines = Object.entries(tallies).filter(([, n]) => n > 0).map(([cause, n]) => ({ cause, n }))
    .concat(pickIds.map((rowId) => ({ cause: picks[rowId], rowId })));
  return {
    phase: L.phase,
    causes: locked ? ['crushed', 'scours', 'starve-out', 'other'] : ['stillborn', 'mummified', 'crushed', 'scours', 'starve-out', 'other'],
    roster: roster.map((r) => ({ rowId: r.rowId, tag: r.tag, notch: r.notch, status: r.status })),
    bodies, picks: pickIds.length, unidentified, openLoss: lossN, cap, kMin, kMax, asksLoss,
    needK: asksLoss && bodies > 0 && k == null, why,
    event: why ? null : Object.assign({ type: 'death', litter: L.id, lines }, locked && bodies && k ? { fromMissing: k } : {})
  };
}

/* The Move sheet's arithmetic (slice S7): clamp, before → after both sides, carry preview. */
function moveDraftSelect(derived, draft) {
  const dr = draft || {};
  const S = derived.litters[dr.from], R = derived.litters[dr.to];
  let why = null;
  if (!S) why = 'no_source'; else if (!R) why = 'no_receiver'; else if (S === R) why = 'same_litter';
  else if (S.phase !== 'locked' || R.phase !== 'locked') why = 'farrowing_open';
  if (why) return { why, event: null };
  const ex = dr.explains || [];
  const loss = ex[0] ? S.unexplained.losses.find((x) => x.id === ex[0]) : null;
  const gain = ex[1] ? R.unexplained.gains.find((x) => x.id === ex[1]) : null;
  const rows = dr.rows || [];
  const unidentified = S.alive - S.identity.liveRows;
  const maxN = (loss ? loss.open : 0) + S.alive;
  let n = dr.n == null ? rows.length : dr.n;
  n = Math.max(rows.length, Math.min(n, maxN));
  const lossQ = loss ? Math.min(n - rows.length, loss.open) : 0;
  const untagged = n - lossQ - rows.length;
  if (untagged > unidentified) why = 'name_the_rows';
  if (n === 0) why = why || 'empty';
  const gainQ = gain ? Math.min(n, gain.open) : 0;
  const explaining = !!(loss || gain);
  const carry = {}, asks = [], sourceAfter = [];
  const after = S.alive - (n - lossQ);
  for (const d of derived.config.doses) {
    const D = S.doses[d.id];
    let cls;
    if (explaining) cls = 'asked';
    else if (D.unknownAfterMove > 0) cls = 'part';
    else if (!D.records.length) cls = D.carriedFromMove > 0 ? 'part' : 'none';
    else if (D.owed === 0) cls = 'done';
    else if (D.treated + D.carriedFromMove === 0) cls = 'none';
    else cls = 'part';
    const outcome = outcomeFor(cls, d, (dr.answers || {})[d.id]);
    carry[d.id] = outcome;
    if ((cls === 'part' || cls === 'asked') && !d.visible) asks.push(d.id);
    if ((outcome === 'unknown' || outcome === 'check') && D.owed != null && !d.castration) {
      const covered = S.alive - D.owed;
      sourceAfter.push({ dose: d.id, lo: Math.max(0, covered - n), hi: Math.min(covered, after), of: after });
    }
  }
  const delta = { from: [S.alive, S.alive - (n - lossQ)], to: [R.alive, R.alive + (n - gainQ)] };
  const ev = { type: 'move', from: S.id, to: R.id, n, rows: rows.slice(), answers: Object.assign({}, dr.answers || {}) };
  if (explaining) ev.explains = [loss ? loss.id : null, gain ? gain.id : null];
  return { n, max: maxN, unidentified, delta, carry, asks, sourceAfter, why, event: why ? null : ev };
}

/* End task figures (slice S9 glossary): unfinished litters and piglet-doses (incl. not yet due),
   progress, the on-time share of treatments (litter × dose, fully recorded by the planned day;
   due today unrecorded and not yet due unrecorded are left out). */
function endSelect(derived) {
  const order = doseOrder(derived.config);
  const litters = Object.values(derived.litters).filter((L) => L.inTask);
  const byLitter = {}, unfinished = [];
  const progress = { done: 0, owed: 0, missed: 0, ahead: 0 };
  let n = 0, k = 0, idDone = 0;
  for (const L of litters) {
    const list = [];
    for (const D of Object.values(L.doses).sort(order)) {
      progress.done += D.treated;
      const left = D.owed == null ? null : D.owed + D.unknownAfterMove;
      const kind = D.status === 'later' ? 'not_due' : D.status === 'missed' ? 'missed' : 'owed';
      if (left == null) { if (!D.records.length) list.push({ dose: D.dose, kind, n: null }); }
      else if (left > 0) {
        list.push({ dose: D.dose, kind, n: left });
        if (kind === 'not_due') progress.ahead += left; else progress.owed += left;
        if (kind === 'missed') progress.missed += left;
      }
      const recorded = D.records.length > 0;
      if (recorded || L.dayAge > D.due) {
        k++;
        if (D.fullAt != null && D.fullAt <= D.due) n++;
      }
    }
    byLitter[L.id] = list;
    const idOk = L.identity.done !== false;
    if (L.identity.done === true) idDone++;
    if (list.length || !idOk) unfinished.push(L.id);
  }
  progress.total = progress.done + progress.owed + progress.ahead;
  const pieces = Object.values(byLitter).flat().reduce((s, x) => s + (x.n || 0), 0);
  return {
    unfinishedLitters: unfinished, finishedLitters: litters.map((L) => L.id).filter((id) => !unfinished.includes(id)),
    byLitter, unfinishedPigletDoses: pieces, progress,
    onTime: { n, k }, identityDone: { n: idDone, k: litters.length },
    movedOutAfterEnd: litters.flatMap((L) => L.movedOutAfterEnd.map((m) => Object.assign({ litter: L.id }, m))),
    ended: derived.ended
  };
}

export const select = { room: roomSelect, litter: litterSelect, deathDraft: deathDraftSelect, moveDraft: moveDraftSelect, end: endSelect };
export const PPLedger = { derive, append, balances, dayNumber, select };
export default PPLedger;
if (typeof window !== 'undefined') window.PPLedger = PPLedger;
