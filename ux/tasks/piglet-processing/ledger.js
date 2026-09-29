/* Piglet processing (仔猪处理) — the shared litter ledger. Events in, derived facts out.

   One module for every page and for the developers' contract (ticket #18). Plain ES module;
   in a browser it also attaches `window.PPLedger`. No dependencies, no clock: the caller passes
   `today` for anything that depends on the date.

   Law (RULINGS, Piglet processing round 2):
     Alive = Born − Dead − Moved out + Moved in − open loss + open gain − Weaned
   Alive is derived, never entered, never negative. A Count is an observation: it writes an
   unexplained gain or loss, one item each, never netted. A loss is explained by a death (the
   dead picker's "from the missing") or a Move naming it; explaining relabels, Alive does not move.

   API
     derive(events, config, { today })  → Derived (see README section in ux/laws/glossary.md)
     append(events, event, config, opts) → { ok, reason, event, derived }  (snapshots product+dose)
     balances(litter)                    → true when the ledger identity holds for one derived litter
*/

const DAY_MS = 86400000;

// ---------------------------------------------------------------------------------------------
// small helpers

function dayNumber(stamp) {
  if (stamp == null) return null;
  if (typeof stamp === 'number') return stamp;              // a bare day number is accepted
  const s = String(stamp).slice(0, 10);
  const t = Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Number.isNaN(t) ? null : Math.round(t / DAY_MS);
}
const isCount = (v) => Number.isInteger(v) && v >= 0;
const sum = (o) => Object.values(o || {}).reduce((s, v) => s + (v || 0), 0);
const clone = (o) => JSON.parse(JSON.stringify(o));

const ALIVE_CHANGING = new Set(['count', 'death', 'move', 'weaned']);
const CASTRATION_REASONS = ['hernia', 'cryptorchid', 'kept', 'deferred'];
const EXEMPT_REASONS = ['hernia', 'cryptorchid', 'kept'];      // castration reasons that leave the task
const NOTE_REASONS = ['hernia', 'cryptorchid'];                 // …and become a litter note

class Reject extends Error {
  constructor(reason, detail) { super(reason); this.reason = reason; this.detail = detail || null; }
}

// ---------------------------------------------------------------------------------------------
// replay preparation: corrections and causality

/* A correction { type:'correction', target, set?, void? } replaces its target's payload at the
   target's own place in the log (or voids it). The original is kept in `history`. Corrections of
   corrections chain to the root event. `id` and `type` cannot be corrected: a wrong litter is a
   void here plus a fresh record there (RULINGS Q7). */
function effectiveLog(events, rejected) {
  const byId = new Map();
  const log = [];
  for (const e of events) {
    if (!e || !e.id || !e.type) { rejected.push({ id: e && e.id, type: e && e.type, reason: 'malformed' }); continue; }
    if (byId.has(e.id)) { rejected.push({ id: e.id, type: e.type, reason: 'duplicate_id' }); continue; }
    byId.set(e.id, e);
    log.push(e);
  }
  const rootOf = (id) => { let e = byId.get(id); while (e && e.type === 'correction') e = byId.get(e.target); return e; };
  const effective = new Map();        // root id → payload in force (or null when voided)
  const corrections = new Map();      // root id → [correction events]
  for (const c of log) {
    if (c.type !== 'correction') continue;
    const root = rootOf(c.target);
    if (!root) { rejected.push({ id: c.id, type: c.type, reason: 'unknown_target' }); continue; }
    if (c.set && ('id' in c.set || 'type' in c.set)) { rejected.push({ id: c.id, type: c.type, reason: 'cannot_change_id_or_type' }); continue; }
    const base = effective.has(root.id) ? effective.get(root.id) : root;
    effective.set(root.id, c.void ? null : Object.assign(clone(base || root), c.set || {}, { id: root.id, type: root.type }));
    if (!corrections.has(root.id)) corrections.set(root.id, []);
    corrections.get(root.id).push({ id: c.id, at: c.at, who: c.who, void: !!c.void, set: c.set || null });
  }
  return { log, byId, effective, corrections };
}

/* Causality. An event's `seen` lists the ids the device had when it wrote it (its heads);
   ancestors are the transitive closure. Without `seen` the event saw everything before it in the
   log (an online write). Two events are concurrent when neither saw the other. Device clocks are
   never used (merge contract). */
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
  return {
    saw: (later, earlier) => { const s = anc.get(later); return !!s && s.has(earlier); },
    concurrent(a, b) { return !(anc.get(a) || new Set()).has(b) && !(anc.get(b) || new Set()).has(a); }
  };
}

// ---------------------------------------------------------------------------------------------
// state

function newDose() {
  return {
    recorded: false,      // any own record exists; from then on owed is a stored count
    owed: 0,              // stored count (meaningful once recorded)
    deferred: 0, deferReason: null,
    exempt: 0, exemptBy: {},
    treated: 0,           // piglets marked by this litter's own records (history, never retired)
    carried: 0,           // arrivals whose treatment evidence came with them (Move Yes / source all done / Already had)
    unknown: 0,           // arrivals and unexplained gains whose status is unknown (invisible) or to check on the pig (visible)
    records: [], collisions: [],
    castration: null      // { castrated, notCastrated:{hernia,cryptorchid,kept,deferred}, females }
  };
}

function newLitter(id) {
  return {
    id, room: null, phase: 'none', sowDied: null, birthDay: null,
    born: 0, deadByCause: {}, deadTotal: 0, movedIn: 0, movedOut: 0, weaned: 0, alive: 0,
    losses: [], gains: [], moves: [], counts: [], deaths: [], notes: [],
    doses: {}, idClosed: false, flags: [], accepted: [], lastEvent: null
  };
}

function dose(L, d) { if (!L.doses[d.id]) L.doses[d.id] = newDose(); return L.doses[d.id]; }

function openLoss(L) { return L.losses.reduce((s, x) => s + x.remaining, 0); }
function openGain(L) { return L.gains.reduce((s, x) => s + x.remaining, 0); }

/* Owed as shown: `min(stored owed, alive)` once recorded. Before the first record everybody owes
   it except arrivals that carried the dose in or are unknown; castration has no figure before its
   first record (males are unknown until counted). */
function owedShown(L, cfg, D) {
  if (!D.recorded) {
    if (cfg.castration) return null;
    return Math.max(0, L.alive - D.carried - D.unknown);
  }
  return Math.min(D.owed, L.alive);
}

/* What moved piglets carry for one dose (RULINGS Q14): the source did it for all → done;
   did none → the arrivals owe it; partly → asked (invisible) or checked on the pig (visible). */
function classify(L, cfg, D) {
  if (D.unknown > 0) return 'part';
  if (!D.recorded) return D.carried > 0 ? 'part' : 'none';
  if (owedShown(L, cfg, D) === 0) return 'done';
  if (D.treated + D.carried === 0) return 'none';
  return 'part';
}

// ---------------------------------------------------------------------------------------------
// derive

export function derive(events, config, opts) {
  const cfg = normalizeConfig(config);
  const today = dayNumber(opts && opts.today);
  const rejected = [];
  const { log, effective, corrections } = effectiveLog(events || [], rejected);
  const causal = ancestry(log);
  const litters = new Map();
  const rows = new Map();
  const flags = [];
  const lit = (id) => { if (!litters.has(id)) litters.set(id, newLitter(id)); return litters.get(id); };
  const doseCfg = new Map(cfg.doses.map((d) => [d.id, d]));

  const ctx = { cfg, doseCfg, causal, rows, lit, litters, flags, today };

  for (const raw of log) {
    if (raw.type === 'correction') continue;
    const e = effective.has(raw.id) ? effective.get(raw.id) : raw;
    if (e === null) continue;                              // voided by a correction
    ctx.pending = [];
    try {
      const touched = apply(ctx, e);
      for (const p of ctx.pending) { p.L.flags.push(p.f); flags.push(p.f); }
      for (const L of touched) { L.accepted.push(e.id); L.lastEvent = { id: e.id, type: e.type, at: e.at, who: e.who }; }
    } catch (err) {
      if (!(err instanceof Reject)) throw err;
      rejected.push({ id: e.id, type: e.type, reason: err.reason, detail: err.detail });
    }
  }

  const out = { litters: {}, rooms: {}, rejected, flags, corrections: Object.fromEntries(corrections) };
  for (const L of litters.values()) {
    if (L.phase === 'none') continue;
    out.litters[L.id] = view(ctx, L, corrections);
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

function normalizeConfig(config) {
  const c = config || {};
  return {
    doses: (c.doses || []).map((d) => ({
      id: d.id, tx: d.tx || d.id, due: d.due, last: d.last == null ? null : d.last,
      visible: !!d.visible, castration: !!d.castration,
      product: d.product == null ? null : d.product, amount: d.amount == null ? null : d.amount
    })),
    identity: Object.assign({ scheme: 'none', who: 'all', day: null }, c.identity || {})
  };
}

/* Flags wait in `pending` and are committed only when the event is accepted. */
function flag(ctx, L, kind, reason, eventIds, extra) {
  ctx.pending.push({ L, f: Object.assign({ kind, reason, litter: L.id, events: eventIds }, extra || {}) });
}

/* Stale: the event did not see some event already applied to this litter. */
function stale(ctx, L, e) { return L.accepted.some((id) => !ctx.causal.saw(e.id, id)); }

function concurrentCountFlag(ctx, L, e) {
  for (const id of L.accepted) {
    const p = L.acceptedTypes && L.acceptedTypes[id];
    if (!p || !ALIVE_CHANGING.has(p)) continue;
    if (p === 'count' && e.type === 'count') continue;       // two counts: the later stands, never summed
    if (p !== 'count' && e.type !== 'count') continue;
    if (ctx.causal.concurrent(id, e.id)) flag(ctx, L, 'sync_review', 'count_concurrent', [id, e.id]);
  }
}
function markType(L, e) { (L.acceptedTypes || (L.acceptedTypes = {}))[e.id] = e.type; }

function needLitter(ctx, id) {
  const L = ctx.litters.get(id);
  if (!L || L.phase === 'none') throw new Reject('unknown_litter', { litter: id });
  return L;
}
function needLocked(L) { if (L.phase !== 'locked') throw new Reject('farrowing_open', { litter: L.id }); }
function needDose(ctx, id) { const d = ctx.doseCfg.get(id); if (!d) throw new Reject('unknown_dose', { dose: id }); return d; }

function liveRows(ctx, litterId) {
  let n = 0;
  for (const r of ctx.rows.values()) if (r.litter === litterId && r.status === 'alive') n++;
  return n;
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
    case 'treat': return applyTreat(ctx, e);
    case 'check': return applyCheck(ctx, e);
    case 'identity': return applyIdentity(ctx, e);
    case 'weaned': return applyWeaned(ctx, e);
    default: throw new Reject('unknown_type');
  }
}

/* farrowed { litter, room, birthDate?, born, dead:{cause:n}, locked }
   Farrowing's figures, absolute. Repeated while open (the farrowing sheet re-posts); refused once
   locked — a locked Born changes only through a correction (Edit). */
function applyFarrowed(ctx, e) {
  const L = ctx.lit(e.litter);
  if (L.phase === 'locked') throw new Reject('locked');
  const dead = e.dead || {};
  const deadN = sum(dead);
  if (!isCount(e.born) || Object.values(dead).some((v) => !isCount(v)) || deadN > e.born) throw new Reject('bad_numbers');
  // Farrowing's current totals, absolute: they include any deaths its picker posted before.
  L.room = e.room != null ? e.room : L.room;
  L.birthDay = dayNumber(e.birthDate != null ? e.birthDate : e.at);
  L.atBirth = { born: e.born, dead: Object.assign({}, dead) };
  L.born = e.born;
  L.deadByCause = Object.assign({}, dead);
  L.deadTotal = deadN;
  L.alive = L.born - L.deadTotal;
  L.phase = e.locked ? 'locked' : 'open';
  if (L.alive < 0) throw new Reject('alive_negative');
  markType(L, e);
  return [L];
}

/* sow_died { litter, cause } — ends her farrowing session (Move opens), litter keeps its schedule. */
function applySowDied(ctx, e) {
  const L = needLitter(ctx, e.litter);
  if (L.sowDied) throw new Reject('already_recorded', { by: L.sowDied.who, at: L.sowDied.at });
  L.sowDied = { cause: e.cause || null, at: e.at || null, who: e.who || null, event: e.id };
  if (L.phase === 'open') { L.phase = 'locked'; L.endedBySowDeath = true; }
  markType(L, e);
  return [L];
}

/* count { litter, observed, baseAlive } — an observation. The difference against Alive now (not
   against the device's base) becomes one unexplained item, so two offline counts of the same crate
   never sum: the later stands. A count concurrent with a death/move/weaning is flagged. */
function applyCount(ctx, e) {
  const L = needLitter(ctx, e.litter);
  needLocked(L);
  if (!isCount(e.observed)) throw new Reject('bad_numbers');
  concurrentCountFlag(ctx, L, e);
  const before = L.alive;
  const diff = e.observed - before;
  const item = { id: e.id, qty: Math.abs(diff), remaining: Math.abs(diff), at: e.at || null, who: e.who || null, explainedBy: [] };
  if (diff < 0) L.losses.push(item);
  if (diff > 0) {
    // an unexplained gain has no known origin: for doses already recorded here its piglets are unknown
    item.unknownDoses = [];
    for (const d of ctx.cfg.doses) {
      const D = dose(L, d);
      if (D.recorded) { D.unknown += diff; item.unknownDoses.push(d.id); }
    }
    L.gains.push(item);
  }
  L.alive = e.observed;
  L.counts.push({ id: e.id, observed: e.observed, baseAlive: e.baseAlive == null ? null : e.baseAlive, aliveBefore: before, wrote: diff, at: e.at || null, who: e.who || null });
  markType(L, e);
  return [L];
}

/* death { litter, phase?, lines:[{cause,n}|{cause,rowId}], lossAlloc?:[{lossId,qty}], fromMissing? }
   Open phase: tallies never touch Alive, Born derives. Locked: untagged bodies drawn from open
   losses leave Alive untouched; the rest leave Alive. Allocation is `lossAlloc` as the device made
   it, or `fromMissing` allocated here oldest first. A loss already spent turns the excess into a
   plain death flagged `sync review`. An event that would take Alive below 0 is refused. */
function applyDeath(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const lines = e.lines || [];
  if (!lines.length) throw new Reject('empty');
  const tallies = [], idLines = [];
  for (const ln of lines) {
    if (ln.rowId != null) idLines.push(ln);
    else if (isCount(ln.n) && ln.n > 0) tallies.push(ln);
    else throw new Reject('bad_numbers');
  }
  const untagged = tallies.reduce((s, l) => s + l.n, 0);
  if (!untagged && !idLines.length) throw new Reject('empty');
  const isStale = stale(ctx, L, e);
  if (L.phase === 'locked') concurrentCountFlag(ctx, L, e);

  // identified piglets: never missing, never drawn from a loss; one death per row, earliest stands
  const rowDeaths = [];
  for (const ln of idLines) {
    const r = ctx.rows.get(ln.rowId);
    if (!r || r.litter !== L.id) throw new Reject('unknown_row', { rowId: ln.rowId });
    if (r.status === 'dead') { flag(ctx, L, 'sync_review', 'row_already_dead', [r.deathEvent, e.id], { rowId: r.rowId }); continue; }
    if (r.status !== 'alive') throw new Reject('row_not_alive', { rowId: ln.rowId, status: r.status });
    rowDeaths.push(ln);
  }

  // allocation against open losses
  const alloc = [];
  let excess = 0;
  if (L.phase === 'locked' && untagged > 0) {
    if (Array.isArray(e.lossAlloc) && e.lossAlloc.length) {
      const want = e.lossAlloc.reduce((s, a) => s + a.qty, 0);
      if (want > untagged) throw new Reject('alloc_exceeds_bodies');
      for (const a of e.lossAlloc) {
        const loss = L.losses.find((x) => x.id === a.lossId);
        const take = loss ? Math.min(a.qty, loss.remaining) : 0;
        if (take > 0) alloc.push({ loss, qty: take });
        excess += a.qty - take;
      }
    } else if (e.fromMissing) {
      if (e.fromMissing > untagged) throw new Reject('alloc_exceeds_bodies');
      let left = e.fromMissing;
      for (const loss of L.losses) {                    // oldest first: losses are kept in log order
        if (!left) break;
        const take = Math.min(left, loss.remaining);
        if (take > 0) { alloc.push({ loss, qty: take }); left -= take; }
      }
      excess = left;
    }
  }
  const allocated = alloc.reduce((s, a) => s + a.qty, 0);
  const plain = L.phase === 'locked' ? untagged - allocated : 0;

  if (L.phase === 'locked') {
    // the drawer's cap: plain bodies ≤ unidentified alive; across devices only Alive ≥ 0 binds
    const unidentified = L.alive - liveRows(ctx, L.id);
    if (!isStale && plain > unidentified) throw new Reject('more_than_alive', { plain, unidentified });
    if (plain + rowDeaths.length > L.alive) throw new Reject('alive_negative', { alive: L.alive, leaving: plain + rowDeaths.length });
  }

  // commit
  const byCause = {};
  for (const l of tallies) byCause[l.cause] = (byCause[l.cause] || 0) + l.n;
  for (const l of rowDeaths) byCause[l.cause] = (byCause[l.cause] || 0) + 1;
  for (const [c, n] of Object.entries(byCause)) L.deadByCause[c] = (L.deadByCause[c] || 0) + n;
  const total = untagged + rowDeaths.length;
  L.deadTotal += total;
  if (L.phase === 'open') {
    L.born += untagged;                                  // open: Born = Alive + Σ Dead
    L.alive -= rowDeaths.length;
  } else {
    L.alive -= plain + rowDeaths.length;
    for (const a of alloc) { a.loss.remaining -= a.qty; a.loss.explainedBy.push({ event: e.id, kind: 'death', qty: a.qty }); }
  }
  for (const l of rowDeaths) {
    const r = ctx.rows.get(l.rowId);
    r.status = 'dead'; r.cause = l.cause; r.deathAt = e.at || null; r.deathEvent = e.id;
  }
  if (excess > 0) flag(ctx, L, 'sync_review', 'loss_over_consumed', [e.id], { excess });
  L.deaths.push({ id: e.id, byCause, plain: L.phase === 'open' ? untagged : plain, rows: rowDeaths.length, fromMissing: allocated, excess, at: e.at || null, who: e.who || null, phase: L.phase });
  markType(L, e);
  return [L];
}

/* move { from, to, n, rows[], answers:{doseId:'yes'|'no'|'unknown'}, explains?:[lossId|null, gainId|null] }
   One record, both litters. A side named in `explains` relabels its open item (zero Alive effect
   on that side). n above the source's Alive is clamped and flagged `sync review`. */
function applyMove(ctx, e) {
  const S = needLitter(ctx, e.from), R = needLitter(ctx, e.to);
  if (S === R) throw new Reject('same_litter');
  needLocked(S); needLocked(R);
  concurrentCountFlag(ctx, S, e); concurrentCountFlag(ctx, R, e);
  const ex = e.explains || [];
  const loss = ex[0] ? S.losses.find((x) => x.id === ex[0]) : null;
  const gain = ex[1] ? R.gains.find((x) => x.id === ex[1]) : null;
  if (ex[0] && !loss) throw new Reject('unknown_loss', { lossId: ex[0] });
  if (ex[1] && !gain) throw new Reject('unknown_gain', { gainId: ex[1] });

  // tagged piglets are picked, never counted
  const rowIds = [];
  for (const id of e.rows || []) {
    const r = ctx.rows.get(id);
    if (r && r.litter === S.id && r.status === 'alive') rowIds.push(id);
    else flag(ctx, S, 'sync_review', 'row_not_in_source', [e.id], { rowId: id });
  }
  let n = e.n != null ? e.n : rowIds.length;
  if (!isCount(n)) throw new Reject('bad_numbers');
  n = Math.max(n, rowIds.length);
  if (loss && loss.remaining < n) flag(ctx, S, 'sync_review', 'explained_more_than_open', [e.id], { lossId: loss.id });

  let lossQ = loss ? Math.min(n, loss.remaining) : 0;
  let plainOut = n - lossQ;
  if (plainOut > S.alive) {
    flag(ctx, S, 'sync_review', 'move_clamped', [e.id], { asked: n, alive: S.alive });
    plainOut = S.alive;
    n = lossQ + plainOut;
    if (rowIds.length > n) rowIds.length = n;
  }
  if (n === 0) throw new Reject('nothing_to_move');
  const gainQ = gain ? Math.min(n, gain.remaining) : 0;
  if (gain && gainQ < n) flag(ctx, R, 'sync_review', 'explained_more_than_open', [e.id], { gainId: gain.id });
  const plainIn = n - gainQ;
  const explaining = !!(loss || gain);

  // doses: what the moved piglets carry
  const packets = {};
  for (const d of ctx.cfg.doses) {
    const DS = dose(S, d), DR = dose(R, d);
    // the explained gain's piglets were parked as unknown on recorded doses — resolve, don't add
    const reKnown = gain && gain.unknownDoses && gain.unknownDoses.includes(d.id) ? Math.min(gainQ, DR.unknown) : 0;
    DR.unknown -= reKnown;
    const fresh = plainIn + reKnown;      // piglets whose status this move now decides for R
    const cls = explaining ? 'asked' : classify(S, d, DS);
    let outcome;
    if (cls === 'done') outcome = 'done';
    else if (cls === 'none') outcome = 'owed';
    else if (d.visible) outcome = 'check';
    else outcome = ({ yes: 'done', no: 'owed' })[(e.answers || {})[d.id]] || 'unknown';
    packets[d.id] = outcome;
    if (outcome === 'done') DR.carried += fresh;
    if (outcome === 'owed' && DR.recorded) DR.owed += fresh;
    if (outcome === 'check' || outcome === 'unknown') DR.unknown += fresh;
    // source coverage moves too (ledger-challenge #2): never infer coverage from a shrinking
    // denominator. Recorded source: a No takes untreated piglets out of its stored owed; Yes and
    // Don't know leave it (over-owing is the accepted cost). Unrecorded source (owed = alive −
    // carried − unknown): Yes takes carried evidence with them; Don't know / check may have been
    // carried piglets, so carried evidence leaves too and the source can only over-owe.
    if (DS.recorded) {
      if (cls !== 'done' && cls !== 'none' && outcome === 'owed') {
        DS.owed = Math.max(0, DS.owed - n);
        DS.deferred = Math.min(DS.deferred, DS.owed);
      }
    } else if (outcome === 'done' || outcome === 'unknown' || outcome === 'check') {
      DS.carried = Math.max(0, DS.carried - n);
    }
  }

  // counts
  S.alive -= plainOut; S.movedOut += n;
  R.alive += plainIn; R.movedIn += n;
  if (loss && lossQ) { loss.remaining -= lossQ; loss.explainedBy.push({ event: e.id, kind: 'move', qty: lossQ, to: R.id }); }
  if (gain && gainQ) { gain.remaining -= gainQ; gain.explainedBy.push({ event: e.id, kind: 'move', qty: gainQ, from: S.id }); }
  for (const id of rowIds) ctx.rows.get(id).litter = R.id;
  const rec = { id: e.id, n, rows: rowIds.slice(), explains: [loss ? loss.id : null, gain ? gain.id : null], packets, answers: Object.assign({}, e.answers || {}), at: e.at || null, who: e.who || null };
  S.moves.push(Object.assign({ dir: 'out', other: R.id, aliveEffect: -plainOut }, rec));
  R.moves.push(Object.assign({ dir: 'in', other: S.id, aliveEffect: plainIn }, rec));
  markType(S, e); markType(R, e);
  return [S, R];
}

/* treat { litter, dose, n, deferred?:{n,reason}, exempt?:{n,reason}, castration?, product?, amount? }
   castration: { castrated, hernia, cryptorchid, kept, deferred, females?, deferReason? }
   An online record accounts for every owed piglet (n + deferred + exempt = owed shown); a record
   whose device had already seen this dose done records nothing. Two records of one dose written
   without either seeing the other are both kept and flagged `possible double treatment`. */
function applyTreat(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const d = needDose(ctx, e.dose);
  const D = dose(L, d);
  const isStale = stale(ctx, L, e);
  const collided = D.records.filter((r) => ctx.causal.concurrent(r.id, e.id));
  const shown = owedShown(L, d, D);

  let treated, deferN, exemptN, females = 0, exemptBy = {}, deferReason = null, castr = null;
  if (d.castration) {
    const c = e.castration || {};
    for (const k of ['castrated', 'females', ...CASTRATION_REASONS]) if (c[k] != null && !isCount(c[k])) throw new Reject('bad_numbers');
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

  if (!collided.length && shown === 0) {             // a done dose: a second tap does nothing
    const last = D.records[D.records.length - 1];
    throw new Reject('nothing_owed', last ? { by: last.who, at: last.at, record: last.id } : null);
  }
  if (!collided.length && !isStale) {
    if (shown == null) {                                 // castration's first record: males are counted now
      if (treated + deferN + exemptN > L.alive) throw new Reject('more_than_alive');
    } else if (accounted !== shown) {
      throw new Reject(accounted > shown ? 'more_than_owed' : 'reason_missing', { owed: shown, accounted });
    }
  } else if (accounted === 0 && shown !== null) {
    throw new Reject('empty');
  }

  const base = shown == null ? treated + deferN + exemptN + females : shown;
  const owedAfter = Math.max(0, base - treated - exemptN - females);
  const prevDeferred = D.deferred;
  D.recorded = true;
  D.owed = owedAfter;
  D.deferred = Math.min(owedAfter, deferN + (isStale ? prevDeferred : 0));
  if (deferN) D.deferReason = deferReason;
  if (!D.deferred) D.deferReason = null;
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
  const dayAge = L.birthDay == null ? null : dayNumber(e.at) - L.birthDay;
  let timing = null;
  if (dayAge != null) {
    if (d.last != null && dayAge > d.last) timing = 'after_window';
    else if (dayAge < d.due) timing = 'early';
    else if (dayAge > d.due) timing = 'late';
    else timing = 'on_time';
  }
  const rec = {
    id: e.id, n: treated, deferred: deferN, deferReason, exempt: exemptN, exemptBy, females,
    castration: castr ? clone(castr) : null,
    product: e.product !== undefined ? e.product : d.product, amount: e.amount !== undefined ? e.amount : d.amount,
    dayAge, timing, onTime: timing === 'early' || timing === 'on_time',
    at: e.at || null, who: e.who || null, device: e.device || null
  };
  D.records.push(rec);
  if (collided.length) {
    const pair = [collided[0].id, e.id];
    D.collisions.push(pair);
    flag(ctx, L, 'possible_double_treatment', 'sync_collision', collided.map((r) => r.id).concat(e.id), { dose: d.id });
  }
  markType(L, e);
  return [L];
}

/* check { litter, dose, had, lacks? } — the arrivals' unknown resolved on the pig or by the spray
   mark: `had` already had it (evidence), `lacks` did not (they owe it). */
function applyCheck(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const d = needDose(ctx, e.dose);
  const D = dose(L, d);
  const had = e.had || 0, lacks = e.lacks || 0;
  if (!isCount(had) || !isCount(lacks) || had + lacks === 0) throw new Reject('bad_numbers');
  if (had + lacks > D.unknown) throw new Reject('more_than_unknown', { unknown: D.unknown });
  D.unknown -= had + lacks;
  D.carried += had;
  if (D.recorded) D.owed += lacks;
  D.checks = (D.checks || []).concat({ id: e.id, had, lacks, at: e.at || null, who: e.who || null });
  markType(L, e);
  return [L];
}

/* identity { litter, op:'add'|'edit'|'withdraw'|'close', rowId, tag?, notch?, sex?, weight?, set? }
   Rows are never deleted. Tag or notch identifies; sex and weight never block. */
function applyIdentity(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const op = e.op || 'add';
  if (op === 'close') { L.idClosed = true; markType(L, e); return [L]; }
  if (op === 'add') {
    if (ctx.rows.has(e.rowId)) throw new Reject('duplicate_row', { rowId: e.rowId });
    if (!e.tag && !e.notch) throw new Reject('tag_or_notch');
    if (liveRows(ctx, L.id) + 1 > L.alive) {
      if (!stale(ctx, L, e)) throw new Reject('more_rows_than_alive');
      flag(ctx, L, 'sync_review', 'more_rows_than_alive', [e.id]);
    }
    ctx.rows.set(e.rowId, {
      rowId: e.rowId, litter: L.id, birthLitter: L.id, tag: e.tag || null, notch: e.notch || null,
      sex: e.sex || null, weight: e.weight == null ? null : e.weight, status: 'alive',
      addedAt: e.at || null, addedBy: e.who || null, edits: []
    });
    markType(L, e);
    return [L];
  }
  const r = ctx.rows.get(e.rowId);
  if (!r) throw new Reject('unknown_row', { rowId: e.rowId });
  if (op === 'edit') {
    const set = e.set || {};
    for (const k of Object.keys(set)) if (!['tag', 'notch', 'sex', 'weight'].includes(k)) throw new Reject('bad_field', { field: k });
    if (set.tag === null && set.notch === null) throw new Reject('tag_or_notch');
    const before = {};
    for (const k of Object.keys(set)) { before[k] = r[k]; r[k] = set[k]; }
    if (!r.tag && !r.notch) { Object.assign(r, before); throw new Reject('tag_or_notch'); }
    r.edits.push({ event: e.id, before, set: Object.assign({}, set), at: e.at || null, who: e.who || null });
  } else if (op === 'withdraw') {
    if (r.withdrawn) throw new Reject('already_withdrawn');
    r.withdrawn = { event: e.id, at: e.at || null, who: e.who || null, statusBefore: r.status };
    r.status = 'withdrawn';
  } else throw new Reject('unknown_op');
  const touched = [L];
  markType(L, e);
  return touched;
}

/* weaned { litter, n? , rows? } — n defaults to every alive piglet. */
function applyWeaned(ctx, e) {
  const L = needLitter(ctx, e.litter);
  needLocked(L);
  const n = e.n == null ? L.alive : e.n;
  if (!isCount(n) || n === 0) throw new Reject('bad_numbers');
  if (n > L.alive) throw new Reject('alive_negative', { alive: L.alive });
  concurrentCountFlag(ctx, L, e);
  L.alive -= n; L.weaned += n;
  const named = new Set(e.rows || []);
  for (const r of ctx.rows.values()) {
    if (r.litter !== L.id || r.status !== 'alive') continue;
    if (named.has(r.rowId) || L.alive === 0) { r.status = 'weaned'; r.weanedAt = e.at || null; }
  }
  markType(L, e);
  return [L];
}

// ---------------------------------------------------------------------------------------------
// view: the derived facts a page renders

function view(ctx, L, corrections) {
  const today = ctx.today;
  const dayAge = L.birthDay != null && today != null ? today - L.birthDay : null;
  const doses = {};
  for (const d of ctx.cfg.doses) {
    const D = dose(L, d);
    const owed = owedShown(L, d, D);
    let status = null;
    if (dayAge != null) {
      if (dayAge < d.due) status = 'later';
      else if (d.last != null && dayAge > d.last) status = 'missed';
      else if (dayAge > d.due) status = 'late';
      else status = 'due';
    }
    const unknown = Math.min(D.unknown, L.alive);
    doses[d.id] = {
      dose: d.id, tx: d.tx, due: d.due, last: d.last, visible: d.visible, product: d.product, amount: d.amount,
      status,
      owed,                                          // shown: min(stored, alive); null = castration before its first record
      owedStored: D.recorded ? D.owed : null,
      treated: D.treated,
      deferred: owed == null ? D.deferred : Math.min(D.deferred, owed),
      deferReason: D.deferReason,
      exempt: D.exempt, exemptBy: Object.assign({}, D.exemptBy),
      missed: status === 'missed' && owed ? owed : 0,
      unknownAfterMove: unknown,
      carriedFromMove: D.carried,
      done: owed === 0 && unknown === 0,
      records: D.records.map((r) => Object.assign({}, r, { corrected: corrections.has(r.id) })),
      possibleDoubleTreatment: D.collisions.map((p) => p.slice()),
      castration: d.castration ? (D.castration ? {
        castrated: D.castration.castrated,
        notCastrated: Object.assign({}, D.castration.notCastrated),
        females: D.castration.females,
        males: D.castration.castrated + sum(D.castration.notCastrated)
      } : null) : undefined
    };
  }
  const rowsHere = [...ctx.rows.values()].filter((r) => r.litter === L.id);
  const identified = rowsHere.filter((r) => r.status === 'alive').length;
  const scheme = ctx.cfg.identity;
  let idDone = null;
  if (scheme.scheme !== 'none') idDone = scheme.who === 'candidates' ? L.idClosed : identified >= L.alive;
  const openL = openLoss(L), openG = openGain(L);
  const item = (x) => ({ id: x.id, qty: x.qty, open: x.remaining, at: x.at, who: x.who, explainedBy: x.explainedBy.map((b) => Object.assign({}, b)) });
  const out = {
    id: L.id, room: L.room, phase: L.phase, endedBySowDeath: !!L.endedBySowDeath,
    sowDied: L.sowDied ? Object.assign({}, L.sowDied) : null,
    birthDay: L.birthDay, dayAge,
    born: L.born, dead: { total: L.deadTotal, byCause: Object.assign({}, L.deadByCause) },
    alive: L.alive, movedIn: L.movedIn, movedOut: L.movedOut, weaned: L.weaned,
    unexplained: {
      openLoss: openL, openGain: openG,
      losses: L.losses.map(item), gains: L.gains.map(item)
    },
    moves: L.moves.map((m) => clone(m)),
    counts: L.counts.map((c) => Object.assign({}, c)),
    deaths: L.deaths.map((d) => clone(d)),
    doses,
    identity: {
      scheme: scheme.scheme, who: scheme.who,
      identified: Math.min(identified, L.alive),
      onRecord: rowsHere.filter((r) => r.status !== 'withdrawn').length,
      rows: [...ctx.rows.values()].filter((r) => r.litter === L.id || r.birthLitter === L.id).map((r) => clone(r)),
      closed: L.idClosed, done: idDone
    },
    notes: L.notes.map((n) => Object.assign({}, n)),
    flags: L.flags.map((f) => clone(f)),
    lastEvent: L.lastEvent
  };
  out.balanced = balances(out);
  return out;
}

/* The ledger identity for one derived litter. */
export function balances(L) {
  return L.alive >= 0 &&
    L.alive === L.born - L.dead.total - L.movedOut + L.movedIn - L.unexplained.openLoss + L.unexplained.openGain - L.weaned;
}

/* Append one event and say whether the ledger took it. Treat records get the configured product
   and dose snapshotted onto them (RULINGS Q2: the worker enters nothing extra). */
export function append(events, event, config, opts) {
  const e = Object.assign({}, event);
  if (e.type === 'treat') {
    const d = normalizeConfig(config).doses.find((x) => x.id === e.dose);
    if (d) { if (e.product === undefined) e.product = d.product; if (e.amount === undefined) e.amount = d.amount; }
  }
  const next = (events || []).concat(e);
  const derived = derive(next, config, opts);
  const r = derived.rejected.find((x) => x.id === e.id);
  return { ok: !r, reason: r ? r.reason : null, detail: r ? r.detail : null, event: e, events: r ? events : next, derived };
}

export const PPLedger = { derive, append, balances, dayNumber };
export default PPLedger;
if (typeof window !== 'undefined') window.PPLedger = PPLedger;
