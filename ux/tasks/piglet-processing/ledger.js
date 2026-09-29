/* Piglet processing (仔猪处理) — the shared litter ledger. Events in, derived facts out.

   One module for every page and for the developers' contract (ticket #18). Plain ES module;
   in a browser it also attaches `window.PPLedger`. No dependencies, no clock: the caller passes
   `today` for anything that depends on the date.

   Law (RULINGS, Piglet processing round 2):
     Alive = Born − Dead − Moved out + Moved in − open loss + open gain − Weaned
   Alive is derived, never entered, never negative. A Count is an observation: it writes an
   unexplained gain or loss, one item each, never netted. A loss is explained by a death (the
   dead picker's "from the missing") or a Move naming it; explaining relabels, Alive does not move.

   Obligations. Owed per scheduled dose is a function of the records and of the changes around
   them, not of the order they arrived in:
     - every live-born piglet owes every dose (castration: nothing until its first record counts
       the males); births after a pre-lock mark, arrivals that owe it, gains before the first
       record and a check's "did not" add to it; untreated piglets moving out take from it;
     - a record leaves what it left in its writer's view (`left`: the deferred piglets);
     - the reading is the minimum, over the records no other record saw (the frontier), of that
       record's `left` plus the changes it did not see — so concurrent records reconcile to the
       same figure in any replay order, and overlap never proves a deferred piglet treated beyond
       what some record's own count proves;
     - when a litter's alive reaches 0 its population is gone, and its debt, unknowns and carried
       evidence with it (a zero point); arrivals start afresh.
   Shown per dose, exclusively: owed = min(owed, alive); unknown ≤ alive − owed; carried ≤ the rest.
   Evidence and unknowns are kept in groups, one per arrival or gain; groups carried by named rows
   retire with the row.

   Causality. Every event may carry `seen`: the ids its device had when it wrote it. Concurrent
   records (neither saw the other) are kept and flagged; device clocks never decide a conflict.

   API
     derive(events, config, { today })   → Derived (README: ux/laws/glossary.md, Ledger module)
     append(events, event, config, opts) → { ok, reason, detail, event, events, derived, dependents }
     balances(litter)                    → the ledger identity for one derived litter
     select.room / litter / deathDraft / moveDraft / end / bulkDraft / countDraft / explain / counts / record /
       edit — what pages render; drafts are validated by the same replay `append` runs
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
const total = (groups) => groups.reduce((s, g) => s + g.n, 0);

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
   before it (an online write). A correction's fresh mark (`<id>:fresh`) has its correction's view. */
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
  const key = (id) => (anc.has(id) ? id : String(id).replace(/:(fresh|\d+)$/, ''));
  const saw = (later, earlier) => { const s = anc.get(key(later)); return !!s && s.has(key(earlier)); };
  return { saw, concurrent: (a, b) => a !== b && !saw(a, b) && !saw(b, a) };
}

// ---------------------------------------------------------------------------------------------
// state

function newDose(cfg) {
  return {
    isCastration: cfg.castration, visible: cfg.visible,
    stored: null,          // the owed reading (cached): null for castration before its first record
    recs: [],              // own records for the owed reading { event, index, left, deferN, deferReason }
    entries: [],           // changes to what is owed { event, index, kind, delta }
    exempt: 0, exemptBy: {},
    treated: 0,            // piglets marked by this litter's own records (history, never retired)
    coverage: [],          // carried evidence groups { id, kind: move|had|gain, n, rows|null, from, at }
    unknowns: [],          // unresolved groups { id, kind: move|gain, n, rows|null, from, at }
    records: [], collisions: [], collided: [], castration: null, fullAt: null, checks: [], catchUp: 0, afterEnd: []
  };
}

function newLitter(id) {
  return {
    id, room: null, phase: 'none', sowDied: null, birthDay: null, atBirth: null,
    born: 0, deadByCause: {}, deadTotal: 0, movedIn: 0, movedOut: 0, weaned: 0, alive: 0,
    aliveLog: [], zeros: [],
    losses: [], gains: [], moves: [], counts: [], deaths: [], notes: [],
    doses: {}, idClosed: false, flags: [], accepted: [], types: {}, lastEvent: null, lastRecord: null,
    movedOutAfterEnd: [], held: [], sow: null, birthWeight: null, birthWeightConflicts: [], weights: [], sexCountsRec: null
  };
}

/* The owed reading over the events `keep` admits (null filter: everything). */
function owedAt(ctx, L, D, keep) {
  const ok = keep || (() => true);
  const ents = D.entries.filter((x) => ok(x.event));
  const recs = D.recs.filter((r) => ok(r.event));
  const zeros = L.zeros.filter((z) => ok(z.event));
  const lastZero = zeros.length ? zeros[zeros.length - 1].index : -1;
  if (!recs.length) {
    if (D.isCastration) return null;
    return Math.max(0, ents.filter((x) => x.index > lastZero).reduce((s, x) => s + x.delta, 0));
  }
  const saw = ctx.causal.saw;
  const frontier = recs.filter((r) => !recs.some((o) => o !== r && saw(o.event, r.event)));
  let best = Infinity;
  for (const r of frontier) {
    const unseenZero = zeros.filter((z) => !saw(r.event, z.event) && z.event !== r.event).pop();
    const unseen = ents.filter((x) => x.event !== r.event && !saw(r.event, x.event));
    const v = unseenZero
      ? unseen.filter((x) => x.index > unseenZero.index).reduce((s, x) => s + x.delta, 0)
      : r.left + unseen.reduce((s, x) => s + x.delta, 0);
    best = Math.min(best, v);
  }
  return Math.max(0, best);
}
function frontierInfo(ctx, L, D) {
  const saw = ctx.causal.saw;
  const frontier = D.recs.filter((r) => !D.recs.some((o) => o !== r && saw(o.event, r.event)));
  const live = frontier.filter((r) => !L.zeros.some((z) => z.index > r.index && !saw(r.event, z.event)));
  let best = null;
  for (const r of live) if (!best || r.deferN > best.deferN) best = r;
  return { frontier, deferred: best ? best.deferN : 0, reason: best ? best.deferReason : null, lastIndex: frontier.reduce((m, r) => Math.max(m, r.index), -1) };
}
function refresh(ctx, L, D) { D.stored = owedAt(ctx, L, D, null); }
function refreshAll(ctx, L) { for (const D of Object.values(L.doses)) refresh(ctx, L, D); }
function owedShown(L, D) { return D.stored == null ? null : Math.min(D.stored, L.alive); }
function unknownShown(L, D) { return Math.min(total(D.unknowns), Math.max(0, L.alive - (owedShown(L, D) || 0))); }
function change(ctx, L, D, e, kind, delta) {
  if (!delta) return;
  D.entries.push({ event: e.id, index: ctx.index, kind, delta });
  refresh(ctx, L, D);
}
function raise(ctx, L, D, e, kind, n) { if (n > 0 && !(D.isCastration && !D.recs.length)) change(ctx, L, D, e, kind, n); }
function lower(ctx, L, D, e, kind, n) {
  if (n <= 0 || D.stored == null) return;
  change(ctx, L, D, e, kind, -Math.min(n, D.stored));
}
function cover(D, e, kind, n, rows, from) {
  if (n <= 0) return;
  D.coverage.push({ id: e.id, kind, n, rows: rows ? rows.slice() : null, from: from || null, at: e.at || null });
}
function unknownGroup(D, e, kind, n, rows, from) {
  if (n <= 0) return;
  D.unknowns.push({ id: e.id, kind, n, rows: rows ? rows.slice() : null, from: from || null, at: e.at || null });
}
function takeUnknown(D, n, groupId) {
  let left = n;
  for (const g of D.unknowns) {
    if (!left) break;
    if (groupId && g.id !== groupId) continue;
    const t = Math.min(left, g.n);
    g.n -= t; left -= t;
    if (g.rows) g.rows = g.rows.slice(0, g.n);
  }
  D.unknowns = D.unknowns.filter((g) => g.n > 0);
  return n - left;
}
/* A named piglet leaves (dies, goes missing, moves, is weaned or withdrawn): the evidence and the
   unknown it carried leave with it. */
function retireRow(L, rowId) {
  for (const D of Object.values(L.doses)) {
    for (const list of [D.coverage, D.unknowns]) {
      for (const g of list) if (g.rows && g.rows.includes(rowId)) { g.rows = g.rows.filter((x) => x !== rowId); g.n = g.rows.length; }
    }
    D.coverage = D.coverage.filter((g) => g.n > 0);
    D.unknowns = D.unknowns.filter((g) => g.n > 0);
  }
}
function aliveChange(ctx, L, e, delta) {
  L.alive += delta;
  L.aliveLog.push({ event: e.id, delta });
  if (L.alive === 0 && delta < 0) {
    // the population is gone: its debt, unknowns and evidence do not re-attach to later arrivals
    L.zeros.push({ event: e.id, index: ctx.index });
    for (const D of Object.values(L.doses)) { D.unknowns = []; D.coverage = []; }
    refreshAll(ctx, L);
  }
}
function aliveView(ctx, L, e) { return L.aliveLog.reduce((s, x) => s + (ctx.causal.saw(e.id, x.event) ? x.delta : 0), 0); }

/* What moved piglets carry for one dose (RULINGS Q14): the source did it for all → done;
   did none → the arrivals owe it; partly → asked (invisible) or checked on the pig (visible). */
function classify(L, D) {
  if (total(D.unknowns) > 0) return 'part';
  if (!D.recs.length) return total(D.coverage) > 0 ? 'part' : 'none';
  if (owedShown(L, D) === 0) return 'done';
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
  const list = Array.isArray(c.tasks) ? c.tasks : c.task ? [c.task] : [];
  const tasks = list.map((t, i) => ({
    id: t.id || 'task' + (i + 1), litters: (t.litters || []).slice(),
    ended: t.ended ? Object.assign({}, t.ended) : null,
    farrowingTask: t.farrowingTask === 'open' ? 'open' : 'ended'
  }));
  return {
    doses: (c.doses || []).map((d) => ({
      id: d.id, tx: d.tx || d.id, due: d.due, last: d.last == null ? null : d.last,
      visible: !!d.visible, castration: !!d.castration,
      product: d.product == null ? null : d.product, amount: d.amount == null ? null : d.amount
    })),
    identity: Object.assign({ scheme: 'none', who: 'all', day: null }, c.identity || {}),
    tasks, task: tasks[0] || null
  };
}

/* A correction is one stamped act (one Save): `changes: [{ target, void | restore | set, fresh? },
   { identity: { litter, op, rowId, set } }, …]`; the older single form `{ target, void, set, fresh }`
   reads as one change. What a change carries (a fresh treat, an identity op) replays at the
   correction's place as `<correction id>:<n>` (`:fresh` in the single form), and can itself be
   corrected by that id. */
function changesOf(c) {
  if (Array.isArray(c.changes)) return c.changes.map((x, i) => Object.assign({}, x, { synth: c.id + ':' + (i + 1) }));
  return [{ target: c.target, void: c.void, restore: c.restore, set: c.set, fresh: c.fresh, synth: c.id + ':fresh' }];
}

/* Corrections are transactional: each is tried against the replay of the whole log and refused
   when it would make one of its own targets invalid (`correction_invalid`) or drop or invalidate
   any record after it (`changes_later`, naming them); the record in force stays. Withdrawing a
   withdrawn record is refused; `restore` brings a withdrawn one back. Two corrections of one
   record neither saw are both kept (the later in the log stands) and flagged sync review. */
export function derive(events, config, opts) {
  const cfg = normalizeConfig(config);
  const today = dayNumber(opts && opts.today);
  const { log, byId, rejected } = prepare(events);
  const causal = ancestry(log);
  const rootOf = (id) => { let e = byId.get(id); while (e && e.type === 'correction') e = byId.get(e.target); return e; };
  const effective = new Map();          // record id → the record in force (null: withdrawn)
  const lastLive = new Map();           // record id → the last version in force before a withdrawal
  const corrections = new Map();        // record id (or synthetic id) → the corrections that touched it
  const synth = new Map();              // synthetic id → the event a correction carries (fresh treat, identity op)
  const corrRejected = [], corrFlags = [];
  let base = replay(log, effective, synth, cfg, causal, today);
  const endAt = new Map([...base.ctx.ends].filter(([, E]) => E && E.event).map(([t, E]) => [t, log.findIndex((x) => x.id === E.event)]));
  const atEnd = new Map();              // task id → { effective, synth } as they stood when End was written
  const describe = (r) => {
    const e = byId.get(r.id) || synth.get(r.id) || {};
    return { id: r.id, type: r.type, reason: r.reason, detail: r.detail || null, litter: e.litter || e.from || null, to: e.to || null, dose: e.dose || null, at: e.at || null, who: e.who || null, op: e.op || null, rowId: e.rowId || null };
  };
  log.forEach((c, index) => {
    for (const [t, i] of endAt) if (i < index && !atEnd.has(t)) atEnd.set(t, { effective: new Map(effective), synth: new Map(synth) });
    if (c.type !== 'correction') return;
    const refuse = (reason, detail) => corrRejected.push({ id: c.id, type: c.type, reason, detail: detail || null });
    const trial = new Map(effective), trialSynth = new Map(synth), trialLive = new Map(lastLive);
    const live = [], made = [], touched = [];
    let err = null;
    for (const ch of changesOf(c)) {
      if (ch.identity) {
        trialSynth.set(ch.synth, Object.assign({}, ch.identity, { id: ch.synth, type: 'identity', at: c.at || null, who: c.who || null, viaCorrection: c.id }, c.seen ? { seen: c.seen } : {}));
        made.push(ch.synth);
        continue;
      }
      if (ch.set && ('id' in ch.set || 'type' in ch.set)) { err = ['cannot_change_id_or_type']; break; }
      if (!byId.has(ch.target) && trialSynth.has(ch.target)) {        // a mark a correction recorded: edit it the same way
        const cur = trialSynth.get(ch.target);
        if (ch.void) { if (cur.withdrawn) { err = ['already_withdrawn', { target: ch.target }]; break; } trialSynth.set(ch.target, Object.assign({}, cur, { withdrawn: true })); }
        else if (ch.restore) { if (!cur.withdrawn) { err = ['not_withdrawn', { target: ch.target }]; break; } const x = Object.assign({}, cur); delete x.withdrawn; trialSynth.set(ch.target, x); live.push(ch.target); }
        else { if (cur.withdrawn) { err = ['withdrawn', { target: ch.target }]; break; } trialSynth.set(ch.target, Object.assign(clone(cur), ch.set || {}, { id: cur.id, type: cur.type })); live.push(ch.target); }
        touched.push(ch.target);
        continue;
      }
      const root = rootOf(ch.target);
      if (!root) { err = ['unknown_target', { target: ch.target }]; break; }
      const cur = trial.has(root.id) ? trial.get(root.id) : root;
      let cand;
      if (ch.restore) { if (cur !== null) { err = ['not_withdrawn', { target: root.id }]; break; } cand = clone(trialLive.get(root.id) || root); }
      else if (ch.void) { if (cur === null) { err = ['already_withdrawn', { target: root.id }]; break; } trialLive.set(root.id, cur); cand = null; }
      else { if (cur === null) { err = ['withdrawn', { target: root.id }]; break; } cand = Object.assign(clone(cur), ch.set || {}, { id: root.id, type: root.type }); }
      trial.set(root.id, cand);
      if (cand) live.push(root.id);
      touched.push(root.id);
      if (ch.fresh) {
        // the fresh record keeps the original act's time and hand; the correction carries its own
        trialSynth.set(ch.synth, Object.assign({ at: root.at || c.at || null, who: root.who || c.who || null }, clone(ch.fresh), { id: ch.synth, type: 'treat', viaCorrection: c.id, from: root.litter || null }, c.seen ? { seen: c.seen } : {}));
        made.push(ch.synth);
      }
    }
    if (err) { refuse(err[0], err[1]); return; }
    const res = replay(log, trial, trialSynth, cfg, causal, today);
    const bad = res.rejected.find((r) => live.includes(r.id) || made.includes(r.id));
    if (bad) { refuse('correction_invalid', { target: bad.id, reason: bad.reason, detail: bad.detail }); return; }
    // gated on the whole log: a correction never drops or invalidates a later record silently
    const was = new Set(base.rejected.map((r) => r.id));
    const later = res.rejected.filter((r) => !was.has(r.id));
    if (later.length) { refuse('changes_later', { records: later.map(describe) }); return; }
    for (const id of touched) {
      const prior = corrections.get(id) || [];
      const clash = prior.filter((p) => causal.concurrent(p.id, c.id));
      if (clash.length) {
        const e = byId.get(id) || trialSynth.get(id) || {};
        corrFlags.push({ kind: 'sync_review', reason: 'correction_concurrent', litter: e.litter || e.from || null, events: clash.map((p) => p.id).concat(c.id), target: id });
      }
    }
    effective.clear(); for (const [k, v] of trial) effective.set(k, v);
    lastLive.clear(); for (const [k, v] of trialLive) lastLive.set(k, v);
    synth.clear(); for (const [k, v] of trialSynth) synth.set(k, v);
    base = res;
    for (const id of touched) {
      if (!corrections.has(id)) corrections.set(id, []);
      corrections.get(id).push({ id: c.id, at: c.at || null, who: c.who || null, index });
    }
  });
  const res = base;
  for (const f of corrFlags) {
    const L = res.litters.get(f.litter);
    if (L) L.flags.push(f);
    res.flags.push(f);
  }
  // after End: what a correction written after End leaves untreated is a fact (`not done · corrected
  // after End`), never an actionable owed; End's own figures stay frozen (the snapshot below)
  const short = new Map();
  for (const [t, i] of endAt) {
    const snap = atEnd.get(t);
    if (!snap || ![...corrections.values()].flat().some((x) => x.index > i)) continue;
    const pre = replay(log, snap.effective, snap.synth, cfg, causal, today);
    const T = cfg.tasks.find((x) => x.id === t);
    for (const id of T ? T.litters : []) {
      const L = res.litters.get(id), P = pre.litters.get(id);
      if (!L || !P) continue;
      for (const d of cfg.doses) {
        const a = owedShown(L, dose(res.ctx, L, d.id)), b = owedShown(P, dose(pre.ctx, P, d.id));
        if (a != null && a > (b || 0)) short.set(id + ':' + d.id, a - (b || 0));
      }
    }
  }
  res.ctx.short = short;
  const out = {
    litters: {}, rooms: {}, rejected: rejected.concat(corrRejected, res.rejected), flags: res.flags,
    corrections: Object.fromEntries(corrections), config: cfg, today,
    ended: res.ctx.ends.get(cfg.task ? cfg.task.id : null) || null,
    tasks: cfg.tasks.map((t) => ({ id: t.id, litters: t.litters.slice(), ended: res.ctx.ends.get(t.id) || null }))
  };
  for (const L of res.litters.values()) {
    if (L.phase === 'none') continue;
    out.litters[L.id] = view(res.ctx, L, corrections, today);
  }
  out.rooms = rooms(out.litters);
  // closure facts are frozen as the log stood at End: corrections and arrivals after it do not
  // rewrite them (they replay at their original place in the live figures only)
  for (const [taskId, E] of res.ctx.ends) {
    if (!E || !E.event) continue;
    const endAt = (events || []).findIndex((x) => x && x.id === E.event);
    if (endAt >= 0 && endAt < (events || []).length - 1) {
      const pre = derive(events.slice(0, endAt + 1), config, opts);
      const P = pre.tasks.find((t) => t.id === taskId);
      if (P && P.ended && P.ended.event === E.event) E.snapshot = P.ended.snapshot;
    }
  }
  // the input, for selectors that validate drafts through the same replay (not enumerable)
  Object.defineProperty(out, 'input', { value: { events: events || [], config, opts: opts || {} }, enumerable: false });
  return out;
}

function rooms(litters) {
  const out = {};
  for (const L of Object.values(litters)) {
    const r = out[L.room] || (out[L.room] = { room: L.room, litters: [], openLoss: 0, openGain: 0, netDrift: 0, alive: 0 });
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
    ends: new Map(cfg.tasks.filter((t) => t.ended).map((t) => [t.id, Object.assign({ index: null, event: null, snapshot: null, task: t.id }, t.ended)])),
    farrowing: new Map(cfg.tasks.map((t) => [t.id, t.farrowingTask])),
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
  const carried = new Map();            // correction id → the events it carries, in change order
  for (const s of fresh.values()) {
    if (s.withdrawn) continue;
    if (!carried.has(s.viaCorrection)) carried.set(s.viaCorrection, []);
    carried.get(s.viaCorrection).push(s);
  }
  log.forEach((raw, index) => {
    if (raw.type === 'correction') { for (const s of carried.get(raw.id) || []) run(s, index); return; }
    const e = effective.has(raw.id) ? effective.get(raw.id) : raw;
    if (e === null) return;                              // voided by a correction
    run(e, index);
  });
  return { litters, rejected, flags: ctx.flags, ctx };
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
/* A departure the untagged piglets cannot cover must name its rows. Online that is refused; an
   offline writer that could not know the rows is kept and raises an identity conflict. */
function identityGate(ctx, L, e, ok, detail) {
  if (ok) return;
  if (!stale(ctx, L, e)) throw new Reject('name_the_rows', detail);
  flag(ctx, L, 'sync_review', 'identity_reconcile', [e.id], detail);
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
function taskOf(ctx, id) { return ctx.cfg.tasks.find((t) => t.litters.includes(id)) || null; }
function inTask(ctx, id) { return !ctx.cfg.tasks.length || !!taskOf(ctx, id); }

/* Where an event stands against End. Causal knowledge first: a writer that saw End is after it,
   whatever its clock says. Then the log: applied after End but not having seen it → stamped
   before End = arrived after End; stamped after = after End. Without an End event, the stamp. */
function endRelation(ctx, e, taskId) {
  const E = taskId ? ctx.ends.get(taskId) : null;
  if (!E) return 'before';
  if (E.event) {
    if (ctx.causal.saw(e.id, E.event)) return 'after_seen';
    if (E.index != null && ctx.index > E.index) {
      const a = time(e.at), b = time(E.at);
      return a != null && b != null && a <= b ? 'arrived' : 'after_unseen';
    }
    return 'before';
  }
  // End known from config only: nothing tells what the writer knew; the stamp decides
  const a = time(e.at), b = time(E.at);
  return a == null || b == null || a > b ? 'after_seen' : 'before';
}
function relationOf(ctx, e, litterId) { const T = taskOf(ctx, litterId); return T ? endRelation(ctx, e, T.id) : 'before'; }

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
    case 'farrowing_task_ended': ctx.farrowing.set(e.task || (ctx.cfg.task ? ctx.cfg.task.id : null), 'ended'); return [];
    case 'birth_weight': return applyBirthWeight(ctx, e);
    case 'resolve': return applyResolve(ctx, e);
    case 'litter_weight': return applyLitterWeight(ctx, e);
    case 'sex_counts': return applySexCounts(ctx, e);
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
  if (e.sow) L.sow = { tag: e.sow.tag == null ? null : e.sow.tag, parity: e.sow.parity == null ? null : e.sow.parity };
  if (e.birthWeight != null && !L.birthWeight) L.birthWeight = { kg: String(e.birthWeight), by: 'finish', at: e.at || null, who: e.who || null, event: e.id };
  L.born = e.born;
  L.deadByCause = Object.assign({}, dead);
  L.deadTotal = deadN;
  L.phase = e.locked ? 'locked' : 'open';
  L.alive += aliveNew - L.alive; L.aliveLog.push({ event: e.id, delta: first ? aliveNew : 0 });
  if (!first) L.aliveLog[L.aliveLog.length - 1].delta = aliveNew - (L.aliveLog.slice(0, -1).reduce((s, x) => s + x.delta, 0));
  for (const d of ctx.cfg.doses) {
    const D = dose(ctx, L, d.id);
    if (first) { if (!d.castration) { D.stored = 0; raise(ctx, L, D, e, 'born', aliveNew); } }
    else raise(ctx, L, D, e, D.recs.length ? 'born_after_mark' : 'born', newHeads);
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

/* end_task { at, who } — End as a log event, so "applied after End" is a log position. Refused
   while the batch's farrowing task is open (RULINGS Q5). Snapshots the closure figures. */
function applyEndTask(ctx, e) {
  const taskId = e.task || (ctx.cfg.task ? ctx.cfg.task.id : null);
  const T = ctx.cfg.tasks.find((t) => t.id === taskId) || null;
  if (ctx.cfg.tasks.length && !T) throw new Reject('unknown_task', { task: taskId });
  const had = ctx.ends.get(taskId);
  if (had && had.event) throw new Reject('already_ended', { at: had.at, who: had.who });
  if (ctx.farrowing.get(taskId) === 'open') throw new Reject('farrowing_task_open');
  const day = dayNumber(e.at);
  const views = {};
  for (const L of ctx.litters.values()) if (L.phase !== 'none') views[L.id] = view(ctx, L, new Map(), day);
  const E = { task: taskId, at: e.at || null, who: e.who || null, index: ctx.index, event: e.id, snapshot: null };
  ctx.ends.set(taskId, E);
  E.snapshot = endFigures(ctx.cfg, views, { task: taskId, closing: true, endDay: day });
  return [];
}

/* resolve { litter, held: <death id>, answer: 'one' | 'two' } — a held body answered: one body (the
   duplicate is withdrawn, nothing applied) or two (applied now as a plain death). */
function applyResolve(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const h = L.held.find((x) => x.event === e.held);
  if (!h) throw new Reject('unknown_held', { held: e.held });
  if (h.resolved) throw new Reject('already_resolved', { answer: h.resolved, by: h.resolvedBy });
  if (e.answer !== 'one' && e.answer !== 'two') throw new Reject('bad_answer');
  if (e.answer === 'two') {
    const rowsHere = liveRows(ctx, L.id);
    const rows = h.rows.filter((id) => { const r = ctx.rows.get(id); return r && r.litter === L.id && r.status === 'missing'; });
    if (h.untagged + rows.length > L.alive) throw new Reject('alive_negative', { alive: L.alive });
    if (h.untagged > L.alive - rowsHere) throw new Reject(rowsHere > 0 ? 'name_the_rows' : 'more_than_alive');
    const byCause = Object.assign({}, h.causes);
    for (const id of rows) { const c = h.rowCauses[id]; byCause[c] = (byCause[c] || 0) + 1; const r = ctx.rows.get(id); r.status = 'dead'; r.cause = c; r.deathAt = e.at || null; r.deathEvent = e.id; delete r.lossId; retireRow(L, id); }
    for (const [c, k] of Object.entries(byCause)) L.deadByCause[c] = (L.deadByCause[c] || 0) + k;
    const n = h.untagged + rows.length;
    L.deadTotal += n;
    aliveChange(ctx, L, e, -n);
    L.deaths.push({ id: e.id, byCause, plain: n, rows: 0, fromMissing: 0, held: 0, excess: 0, at: e.at || null, who: e.who || null, phase: L.phase, resolves: h.event });
  }
  h.resolved = e.answer; h.resolvedBy = { event: e.id, at: e.at || null, who: e.who || null };
  return [L];
}

/* birth_weight { litter, kg } — the birth litter weight, recorded in processing only when missing.
   A writer that saw it set is refused; one that could not have (offline) is kept as a conflict. */
function applyBirthWeight(ctx, e) {
  const L = needLitter(ctx, e.litter);
  needLocked(L);
  const kg = parseFloat(e.kg);
  if (!(kg > 0)) throw new Reject('bad_numbers');
  const W = L.birthWeight;
  if (W) {
    if (ctx.causal.saw(e.id, W.event)) throw new Reject('already_recorded', { kg: W.kg, by: W.by, at: W.at, who: W.who });
    L.birthWeightConflicts.push({ kg: String(e.kg), at: e.at || null, who: e.who || null, event: e.id });
    flag(ctx, L, 'sync_review', 'birth_weight_conflict', [W.event, e.id]);
    return [L];
  }
  // `source: 'farrowing'`: set through farrowing's own Edit (reads as set at Finish)
  L.birthWeight = { kg: String(e.kg), by: e.source === 'farrowing' ? 'finish' : 'here', at: e.at || null, who: e.who || null, event: e.id };
  return [L];
}

/* litter_weight { litter, kg, day? } — the weigh-day litter weight: one per weigh day (day-age); a
   second weighing that day replaces the first, which stays in `replaced`. */
function applyLitterWeight(ctx, e) {
  const L = needLitter(ctx, e.litter);
  needLocked(L);
  const kg = parseFloat(e.kg);
  if (!(kg > 0)) throw new Reject('bad_numbers');
  const day = e.day != null ? e.day : (L.birthDay == null || dayNumber(e.at) == null ? null : dayNumber(e.at) - L.birthDay);
  const rec = { day, kg: String(e.kg), at: e.at || null, who: e.who || null, event: e.id, replaced: [], conflicts: [] };
  const i = L.weights.findIndex((w) => w.day === day);
  if (i >= 0) {
    const old = L.weights[i];
    // a phone that had not seen the day's value: both kept, flagged — never "the later save wins" by clock
    if (!ctx.causal.saw(e.id, old.event)) {
      old.conflicts.push({ kg: rec.kg, at: rec.at, who: rec.who, event: e.id });
      flag(ctx, L, 'sync_review', 'litter_weight_conflict', [old.event, e.id], { day });
      return [L];
    }
    rec.replaced = old.replaced.concat([{ kg: old.kg, at: old.at, who: old.who, event: old.event }], old.conflicts.filter((c) => ctx.causal.saw(e.id, c.event)).map((c) => Object.assign({}, c)));
    rec.conflicts = old.conflicts.filter((c) => !ctx.causal.saw(e.id, c.event));
    L.weights[i] = rec;
  }
  else { L.weights.push(rec); L.weights.sort((a, b) => (a.day == null ? 0 : a.day) - (b.day == null ? 0 : b.day)); }
  return [L];
}

/* sex_counts { litter, boars, gilts } — boars and gilts among the piglets without an identity row,
   as counted on the weigh day. Later rows consume them by sex (see `sexCounts` in the view). */
function applySexCounts(ctx, e) {
  const L = needLitter(ctx, e.litter);
  if (!isCount(e.boars) || !isCount(e.gilts)) throw new Reject('bad_numbers');
  const keys = distinctKeys(ctx, L.id);
  const unidentified = Math.max(0, L.alive - Math.min(keys.length, L.alive));
  if (e.boars + e.gilts > unidentified) throw new Reject('more_than_unidentified', { unidentified });
  L.sexCountsRec = { boars: e.boars, gilts: e.gilts, keys, at: e.at || null, who: e.who || null, event: e.id };
  return [L];
}
function rowKey(r) { return r.tag ? 't:' + r.tag : 'n:' + r.notch; }
function distinctKeys(ctx, litterId) {
  const seen = [];
  for (const r of ctx.rows.values()) if (r.litter === litterId && r.status === 'alive' && !seen.includes(rowKey(r))) seen.push(rowKey(r));
  return seen;
}

/* count { litter, observed, baseAlive, missingRows? } — an observation. The difference against
   Alive now (not against the device's base) becomes one unexplained item, so two offline counts
   of one crate never sum. On a litter with identity rows the count names which rows are missing. */
/* A recount never closes a line (RULINGS round 3, Q12 kept): unexplained lines close only by a death or a
   confirmed Move; a mistaken count is corrected through Edit (a `correction` on the count: withdrawn or
   `observed` set, stamped, original kept), which removes its line. A later count is an observation like
   any other: sized against Alive now, it writes its own line.
   Two causally concurrent counts (neither saw the other) of different numbers disagree: both stay as
   observations under `sync review` (`count_conflict`), neither writes a line — the line the first one
   wrote is held as `disputed` — so the result is the same in either arrival order. A later count that
   saw them settles it (`settledBy`) and writes its own line. A count that arrives after a count that saw
   it stands for nothing (`count_order`). Device clocks never order two counts. */
function applyCount(ctx, e) {
  const L = needLitter(ctx, e.litter);
  needLocked(L);
  if (!isCount(e.observed)) throw new Reject('bad_numbers');
  if (L.weaned > 0 && L.alive === 0) throw new Reject('weaned', { weaned: L.weaned });
  const missing = e.missingRows || [];
  uniqueIds(missing);
  const later = L.counts.filter((c) => ctx.causal.saw(c.id, e.id)).pop();
  if (later) {
    flag(ctx, L, 'sync_review', 'count_order', [e.id, later.id]);
    L.counts.push({ id: e.id, observed: e.observed, baseAlive: e.baseAlive == null ? null : e.baseAlive, aliveBefore: L.alive, sizedAgainst: null, wrote: 0,
      missingRows: missing.slice(), at: e.at || null, who: e.who || null, supersededBy: later.id, late: true, disputed: false, settledBy: null });
    return [L];
  }
  // concurrent counts that saw the same number agree: nothing to settle, they are one observation
  const concurrent = L.counts.filter((c) => !c.late && !ctx.causal.saw(e.id, c.id) && c.observed !== e.observed);
  const disputedIds = new Set(concurrent.map((c) => c.id));
  // only the lines the concurrent counts themselves wrote are held as disputed; every other line stays open
  const openL = L.losses.filter((x) => x.remaining > 0 && disputedIds.has(x.id)), openG = L.gains.filter((x) => x.remaining > 0 && disputedIds.has(x.id));
  const lossBack = openL.reduce((s, x) => s + x.remaining, 0), gainBack = openG.reduce((s, x) => s + x.remaining, 0);
  const lossIds = new Set(openL.map((x) => x.id));
  const giveBack = [...ctx.rows.values()].filter((r) => r.litter === L.id && r.status === 'missing' && lossIds.has(r.lossId));
  for (const id of missing) {
    const r = ctx.rows.get(id);
    if (!r || r.litter !== L.id) throw new Reject(r ? 'row_in_other_litter' : 'unknown_row', r ? { rowId: id, litter: r.litter } : { rowId: id });
    if (r.status !== 'alive' && !giveBack.includes(r)) throw new Reject('row_not_alive', { rowId: id, status: r.status });
  }
  const before = L.alive;
  const base = before + lossBack - gainBack;
  const diff = e.observed - base;
  const disputed = concurrent.length > 0;
  if (!disputed) {
    if (missing.length && missing.length > -diff) throw new Reject('bad_numbers', { missingRows: missing.length, loss: Math.max(0, -diff) });
    const rowsLeft = liveRows(ctx, L.id) + giveBack.length - missing.length;
    identityGate(ctx, L, e, e.observed >= rowsLeft, { rows: rowsLeft, observed: e.observed });
  }
  concurrentCountFlag(ctx, L, e);
  if (disputed) flag(ctx, L, 'sync_review', 'count_conflict', [e.id].concat([...disputedIds]));
  for (const c of L.counts) {
    if (disputedIds.has(c.id)) c.disputed = true;
    else if (!disputed && c.disputed && !c.settledBy && ctx.causal.saw(e.id, c.id)) c.settledBy = e.id;
  }
  const hold = (x) => ({ event: e.id, kind: 'disputed', qty: x.remaining });
  for (const x of openL) { x.explainedBy.push(hold(x)); x.remaining = 0; }
  for (const r of giveBack) { r.status = 'alive'; delete r.lossId; }
  for (const x of openG) {
    for (const d of ctx.cfg.doses) {
      const D = L.doses[d.id];
      if (!D || !x.doses) continue;
      if (x.doses[d.id] === 'owed') lower(ctx, L, D, e, 'disputed', x.remaining);
      else if (x.doses[d.id] === 'unknown') takeUnknown(D, x.remaining, x.id);
    }
    x.explainedBy.push(hold(x)); x.remaining = 0;
  }
  if (lossBack !== gainBack) aliveChange(ctx, L, e, lossBack - gainBack);
  const rec = { id: e.id, observed: e.observed, baseAlive: e.baseAlive == null ? null : e.baseAlive, aliveBefore: before, sizedAgainst: base, wrote: 0,
    missingRows: missing.slice(), at: e.at || null, who: e.who || null, supersededBy: null, late: false, disputed, settledBy: null };
  if (disputed) { L.counts.push(rec); return [L]; }
  const item = { id: e.id, qty: Math.abs(diff), remaining: Math.abs(diff), at: e.at || null, who: e.who || null, explainedBy: [] };
  if (diff < 0) {
    item.rows = missing.slice();
    for (const id of missing) { const r = ctx.rows.get(id); r.status = 'missing'; r.lossId = e.id; retireRow(L, id); }
    L.losses.push(item);
  }
  if (diff > 0) {
    // an unexplained gain has no known origin: before a dose's first record it simply owes it
    // (everyone does); after, its status is unknown
    item.doses = {};
    for (const d of ctx.cfg.doses) {
      const D = dose(ctx, L, d.id);
      if (D.stored == null) continue;
      if (!D.recs.length) { raise(ctx, L, D, e, 'gain', diff); item.doses[d.id] = 'owed'; }
      else { unknownGroup(D, e, 'gain', diff, null, null); item.doses[d.id] = 'unknown'; }
    }
    L.gains.push(item);
  }
  aliveChange(ctx, L, e, diff);
  rec.wrote = diff;
  L.counts.push(rec);
  return [L];
}

function namedOpen(ctx, loss, except) {
  let n = 0;
  for (const r of ctx.rows.values()) if (r.status === 'missing' && r.lossId === loss.id && !(except && except.has(r.rowId))) n++;
  return n;
}

/* death { litter, lines:[{cause,n}|{cause,rowId}], lossAlloc?:[{lossId,qty}], fromMissing? }
   Open phase: tallies never touch Alive, Born derives. Locked: an identified piglet counted
   missing draws from its own loss; untagged bodies may draw only the unnamed part of open losses
   (each named piglet is reserved once); the rest leave Alive. Allocations aggregate by loss. A body
   allocated to a loss already spent (two offline deaths for one missing piglet) is HELD for review
   (RULINGS round 3): not applied — Dead and Alive stay — flagged `sync review` (`held_body`) until a
   worker answers `resolve`: one body (the duplicate is withdrawn) or two (applied as a plain death). */
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
  const resolving = new Set(missingRowDeaths.map((l) => l.rowId));

  const take = new Map();                 // loss → qty taken by this event
  let excess = 0;
  const heldRows = [];
  const room = (loss) => loss.remaining - (take.get(loss) || 0);
  const unnamedFree = (loss) => Math.max(0, room(loss) - namedOpen(ctx, loss, resolving));
  let missingPlain = 0;
  for (const ln of missingRowDeaths) {
    const r = ctx.rows.get(ln.rowId);
    const loss = L.losses.find((x) => x.id === r.lossId);
    if (loss && room(loss) > 0) take.set(loss, (take.get(loss) || 0) + 1);
    else { heldRows.push(ln); excess++; }
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
      if (e.fromMissing > untagged) throw new Reject('alloc_exceeds_bodies');
      let left = e.fromMissing;
      for (const loss of L.losses) {                     // oldest first: losses are kept in log order
        if (!left) break;
        const t = Math.min(left, unnamedFree(loss));
        if (t > 0) { want.set(loss, t); left -= t; }
      }
      excess += left;
    }
    const wantTotal = [...want.values()].reduce((s, v) => s + v, 0);
    if (wantTotal > untagged) throw new Reject('alloc_exceeds_bodies');
    for (const [loss, q] of want) {
      const t = Math.min(q, unnamedFree(loss));
      if (t > 0) take.set(loss, (take.get(loss) || 0) + t);
      allocated += t;
      excess += q - t;
    }
  }
  const heldUntagged = locked ? excess - heldRows.length : 0;       // allocated to a spent loss: held, not applied
  const plain = locked ? untagged - allocated - heldUntagged : 0;

  if (locked) {
    const rowsHere = liveRows(ctx, L.id);
    const leaving = plain + missingPlain + aliveRowDeaths.length;
    if (leaving > L.alive) throw new Reject(rowsHere > 0 ? 'name_the_rows' : 'more_than_alive', { leaving, alive: L.alive });
    const unidentified = L.alive - rowsHere;
    if (plain + missingPlain > unidentified) {
      if (rowsHere === 0) throw new Reject('more_than_alive', { plain: plain + missingPlain, unidentified });
      identityGate(ctx, L, e, false, { plain: plain + missingPlain, unidentified });
    }
  }

  // the held bodies take their causes from the last tallies
  const heldCauses = {};
  let h = heldUntagged;
  for (const l of tallies.slice().reverse()) { if (!h) break; const k = Math.min(h, l.n); heldCauses[l.cause] = (heldCauses[l.cause] || 0) + k; h -= k; }
  const appliedRows = missingRowDeaths.filter((l) => !heldRows.includes(l));
  const byCause = {};
  for (const l of tallies) byCause[l.cause] = (byCause[l.cause] || 0) + l.n;
  for (const [c, k] of Object.entries(heldCauses)) { byCause[c] -= k; if (!byCause[c]) delete byCause[c]; }
  for (const l of aliveRowDeaths.concat(appliedRows)) byCause[l.cause] = (byCause[l.cause] || 0) + 1;
  const n = untagged - heldUntagged + aliveRowDeaths.length + appliedRows.length;
  for (const [c, k] of Object.entries(byCause)) L.deadByCause[c] = (L.deadByCause[c] || 0) + k;
  L.deadTotal += n;
  for (const l of aliveRowDeaths.concat(locked ? appliedRows : missingRowDeaths)) {
    const r = ctx.rows.get(l.rowId);
    r.status = 'dead'; r.cause = l.cause; r.deathAt = e.at || null; r.deathEvent = e.id;
    retireRow(L, l.rowId);
  }
  if (!locked) {
    L.born += untagged + missingRowDeaths.length;         // open: Born = Alive + Σ Dead (nothing held before the lock)
    aliveChange(ctx, L, e, -aliveRowDeaths.length);
  } else {
    for (const [loss, q] of take) { loss.remaining -= q; loss.explainedBy.push({ event: e.id, kind: 'death', qty: q }); }
    aliveChange(ctx, L, e, -(plain + missingPlain + aliveRowDeaths.length));
  }
  const heldN = locked ? heldUntagged + heldRows.length : 0;
  if (heldN > 0) {
    L.held.push({ event: e.id, n: heldN, untagged: heldUntagged, rows: heldRows.map((l) => l.rowId), causes: heldCauses,
      rowCauses: Object.fromEntries(heldRows.map((l) => [l.rowId, l.cause])), at: e.at || null, who: e.who || null, resolved: null, resolvedBy: null });
    flag(ctx, L, 'sync_review', 'held_body', [e.id], { held: heldN });
  }
  const fromLoss = [...take.values()].reduce((s, v) => s + v, 0);
  L.deaths.push({ id: e.id, byCause, plain: locked ? plain : untagged, rows: aliveRowDeaths.length + (locked ? appliedRows.length : missingRowDeaths.length), fromMissing: fromLoss, held: heldN, excess: heldN, at: e.at || null, who: e.who || null, phase: L.phase });
  return [L];
}

/* move { from, to, n, rows[], answers:{doseId:'yes'|'no'|'unknown'}, explains?:[lossId|null, gainId|null] }
   One record, both litters. A side named in `explains` relabels its open item (zero Alive effect
   there); untagged piglets may spend only a loss's unnamed part — a named missing piglet's share
   is spent only by moving that row. Rows are named and unique; a source with rows names who
   leaves. Untagged n above the source's Alive is clamped and flagged. */
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

  const untaggedAsked = n - rowIds.length;
  const unnamed = loss ? Math.max(0, loss.remaining - missingRows.length - namedOpen(ctx, loss, new Set(missingRows))) : 0;
  const lossUntagged = Math.min(untaggedAsked, unnamed);
  const lossQ = missingRows.length + lossUntagged;
  if (loss && lossUntagged < untaggedAsked) flag(ctx, S, 'sync_review', 'explained_more_than_open', [e.id], { lossId: loss.id });
  let untaggedOut = untaggedAsked - lossUntagged;
  const rowsS = liveRows(ctx, S.id);
  const unidentified = S.alive - rowsS;
  if (untaggedOut > unidentified) {
    if (rowsS > 0 && untaggedOut + aliveRows.length <= S.alive) identityGate(ctx, S, e, false, { untagged: untaggedOut, unidentified });
    else {
      if (rowsS > 0 && !stale(ctx, S, e)) throw new Reject('name_the_rows', { untagged: untaggedOut, unidentified });
      flag(ctx, S, 'sync_review', 'move_clamped', [e.id], { asked: n, alive: S.alive });
      untaggedOut = Math.max(0, S.alive - aliveRows.length);
    }
  }
  n = lossQ + aliveRows.length + untaggedOut;
  if (n === 0) throw new Reject('nothing_to_move');
  const plainOut = n - lossQ;
  if (plainOut > S.alive) throw new Reject('alive_negative', { alive: S.alive, leaving: plainOut });   // rows under an open identity conflict
  const gainQ = gain ? Math.min(n, gain.remaining) : 0;
  if (gain && gainQ < n) flag(ctx, R, 'sync_review', 'explained_more_than_open', [e.id], { gainId: gain.id });
  const plainIn = n - gainQ;
  identityGate(ctx, R, e, liveRows(ctx, R.id) + rowIds.length <= R.alive + plainIn, { receiver: R.id });
  concurrentCountFlag(ctx, S, e); concurrentCountFlag(ctx, R, e);
  const explaining = !!(loss || gain);
  const after = relationOf(ctx, e, S.id) !== 'before';
  // arrivals owe their doses here; only a litter outside every task (a nurse sow) records them (no catch-up after End)
  const catchUpR = ctx.cfg.tasks.length > 0 && !taskOf(ctx, R.id);
  const allNamed = gainQ === 0 && rowIds.length === n;

  const packets = {}, owedOut = {};
  for (const d of ctx.cfg.doses) {
    const DS = dose(ctx, S, d.id), DR = dose(ctx, R, d.id);
    const answer = (e.answers || {})[d.id];
    // the explained gain's piglets: resolve what the gain parked, by the answer only (challenge #6).
    // An owed gain absorbed by a record since (the record saw it) is part of that record's figure:
    // no deduction without attribution.
    if (gain && gainQ) {
      const st = gain.doses && gain.doses[d.id];
      const ans = d.visible ? 'unknown' : answer;
      const absorbed = DR.recs.some((r) => ctx.causal.saw(r.event, gain.id));
      if (st === 'owed' && ans === 'yes') { if (!absorbed) lower(ctx, R, DR, e, 'explained', gainQ); cover(DR, e, 'gain', gainQ, null, S.id); }
      if (st === 'unknown') {
        const grp = DR.unknowns.find((g) => g.id === gain.id);
        const k = grp ? Math.min(gainQ, grp.n) : 0;
        if (k && ans === 'yes') { takeUnknown(DR, k, gain.id); cover(DR, e, 'gain', k, null, S.id); }
        if (k && ans === 'no') { takeUnknown(DR, k, gain.id); raise(ctx, R, DR, e, 'arrival', k); }
      }
    }
    const cls = explaining ? 'asked' : classify(S, DS);
    const outcome = outcomeFor(cls, d, answer);
    packets[d.id] = outcome;
    if (plainIn) {
      if (outcome === 'done') cover(DR, e, 'move', plainIn, allNamed ? rowIds : null, S.id);
      if (outcome === 'owed') { raise(ctx, R, DR, e, 'arrival', plainIn); if (catchUpR) DR.catchUp += plainIn; }
      if (outcome === 'check' || outcome === 'unknown') unknownGroup(DR, e, 'move', plainIn, allNamed ? rowIds : null, S.id);
    }
    // untreated piglets leaving lower the source's owed; Yes and Don't know leave it (over-owe)
    if (outcome === 'owed') { const before = owedShown(S, DS); lower(ctx, S, DS, e, 'moved_out', n); if (before) owedOut[d.id] = Math.min(n, before); }
  }

  S.movedOut += n; R.movedIn += n;
  if (loss && lossQ) { loss.remaining -= lossQ; loss.explainedBy.push({ event: e.id, kind: 'move', qty: lossQ, to: R.id }); }
  if (gain && gainQ) { gain.remaining -= gainQ; gain.explainedBy.push({ event: e.id, kind: 'move', qty: gainQ, from: S.id }); }
  for (const id of rowIds) {
    const r = ctx.rows.get(id);
    retireRow(S, id);
    r.litter = R.id; r.status = 'alive'; delete r.lossId;
  }
  aliveChange(ctx, S, e, -plainOut);
  aliveChange(ctx, R, e, plainIn);
  const rec = { id: e.id, n, rows: rowIds.slice(), explains: [loss ? loss.id : null, gain ? gain.id : null], packets, answers: Object.assign({}, e.answers || {}), at: e.at || null, who: e.who || null, afterEnd: after };
  S.moves.push(Object.assign({ dir: 'out', other: R.id, aliveEffect: -plainOut }, rec));
  R.moves.push(Object.assign({ dir: 'in', other: S.id, aliveEffect: plainIn }, rec));
  if (after && taskOf(ctx, S.id)) S.movedOutAfterEnd.push({ move: e.id, n, to: R.id, owed: owedOut });
  return [S, R];
}

/* treat's task gate (RULINGS round 3, Q5 clarified): after End no new treatment marks. A mark done
   after End on a phone that had not seen End is kept as evidence, stamped and flagged `after_end`, never
   counted; a writer that saw End is refused; arrivals into an ended litter stay not done. A mark stamped
   before End and synced after it is applied, flagged (map provisional). */
function taskGate(ctx, L, e, D, unknownTarget) {
  if (!ctx.cfg.tasks.length) return {};
  const T = taskOf(ctx, L.id);
  if (!T) {
    // a litter outside every task (a nurse sow from a previous batch): only its arrivals' doses are recordable
    if (D && !unknownTarget && D.catchUp > 0) return { catchUp: true };
    if (D && unknownTarget && total(D.unknowns) > 0) return {};
    throw new Reject('no_task', { litter: L.id });
  }
  const rel = endRelation(ctx, e, T.id);
  if (rel === 'before') return {};
  if (e.viaCorrection) return { flag: 'correction_after_end' };
  if (rel === 'arrived') return { flag: 'arrived_after_end' };
  if (rel === 'after_unseen') return { evidence: true, flag: 'after_end' };
  const E = ctx.ends.get(T.id);
  throw new Reject('task_ended', { at: E.at, who: E.who });
}

function readTreat(d, e) {
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
  return { treated, deferN, exemptN, females, deferReason, castr, exemptBy };
}

function completed(ctx, L, D, e) {
  if (D.fullAt == null && owedShown(L, D) === 0 && unknownShown(L, D) === 0) {
    D.fullAt = L.birthDay == null || dayNumber(e.at) == null ? null : dayNumber(e.at) - L.birthDay;
  }
}

/* treat { litter, dose, n, deferred?:{n,reason}, exempt?:{n,reason}, castration?, product?, amount? }
   castration: { castrated, hernia, cryptorchid, kept, deferred, females?, deferReason? }
   Judged first in the writer's view: a writer that had seen the dose done records nothing. An
   online record accounts for every owed piglet. Concurrent records are both kept and flagged
   `possible double treatment`; the owed reading reconciles them (see Obligations above). */
function applyTreat(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const d = needDose(ctx, e.dose);
  const D = dose(ctx, L, d.id);
  const gate = taskGate(ctx, L, e, D);
  if (gate.evidence) return afterEndEvidence(ctx, L, d, D, e, readTreat(d, e).treated);
  const own = D.records.filter((r) => r.target !== 'unknown');
  const seen = (id) => ctx.causal.saw(e.id, id);
  const V = owedAt(ctx, L, D, seen);
  const nothing = (r) => new Reject('nothing_owed', r ? { by: r.who, at: r.at, record: r.id } : null);
  const seenRecs = own.filter((r) => seen(r.id));
  if (seenRecs.length && V === 0) throw nothing(seenRecs[seenRecs.length - 1]);
  const isStale = stale(ctx, L, e);
  const collided = own.filter((r) => ctx.causal.concurrent(r.id, e.id));
  const sh = owedShown(L, D);
  if (!collided.length && sh === 0) throw nothing(own[own.length - 1]);

  const t = readTreat(d, e);
  const accounted = t.treated + t.deferN + t.exemptN + t.females;
  if (gate.catchUp && t.treated + t.exemptN + t.females > D.catchUp) throw new Reject('task_ended', { catchUp: D.catchUp });
  if (!collided.length && !isStale && !gate.catchUp) {
    if (sh == null) {                                    // castration's first record: males are counted now
      if (t.treated + t.deferN + t.exemptN > L.alive) throw new Reject('more_than_alive');
    } else if (accounted !== sh) {
      throw new Reject(accounted > sh ? 'more_than_owed' : 'reason_missing', { owed: sh, accounted });
    }
  } else if (accounted === 0 && sh !== null) {
    throw new Reject('empty');
  }

  // what this record left, in its writer's view
  const left = V == null ? t.deferN : Math.max(0, Math.min(V, aliveView(ctx, L, e)) - t.treated - t.exemptN - t.females);
  D.recs.push({ event: e.id, index: ctx.index, left, deferN: t.deferN, deferReason: t.deferReason });
  refresh(ctx, L, D);
  if (gate.catchUp) D.catchUp = Math.max(0, D.catchUp - t.treated - t.exemptN - t.females);
  D.treated += t.treated;
  D.exempt += t.exemptN;
  for (const [k, v] of Object.entries(t.exemptBy)) D.exemptBy[k] = (D.exemptBy[k] || 0) + v;
  if (t.castr) {
    const C = D.castration || (D.castration = { castrated: 0, notCastrated: { hernia: 0, cryptorchid: 0, kept: 0, deferred: 0 }, females: 0 });
    C.castrated += t.treated;
    for (const k of EXEMPT_REASONS) C.notCastrated[k] += t.castr[k] || 0;
    C.females += t.females;
    for (const k of NOTE_REASONS) if (t.castr[k]) L.notes.push({ kind: k, n: t.castr[k], event: e.id, at: e.at || null });
  }
  D.records.push(record(ctx, L, d, e, { n: t.treated, deferred: t.deferN, deferReason: t.deferReason, exempt: t.exemptN, exemptBy: t.exemptBy, females: t.females, castration: t.castr ? clone(t.castr) : null, catchUp: !!gate.catchUp }));
  completed(ctx, L, D, e);
  if (collided.length) {
    D.collisions.push([collided[0].id, e.id]);
    for (const r of collided) if (!D.collided.includes(r.id)) D.collided.push(r.id);
    D.collided.push(e.id);
    flag(ctx, L, 'possible_double_treatment', 'sync_collision', collided.map((r) => r.id).concat(e.id), { dose: d.id });
  }
  if (gate.flag) flag(ctx, L, 'task', gate.flag, [e.id], { dose: d.id });
  return [L];
}

/* A treatment done after End that synced later: kept on the record, stamped, flagged — never counted
   (not in owed, treated or on-time). */
function afterEndEvidence(ctx, L, d, D, e, n) {
  D.afterEnd.push({ id: e.id, dose: d.id, n, target: e.target || null, castration: e.castration ? clone(e.castration) : null,
    deferred: e.deferred ? Object.assign({}, e.deferred) : null, at: e.at || null, who: e.who || null, device: e.device || null });
  flag(ctx, L, 'task', 'after_end', [e.id], { dose: d.id });
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
    at: e.at || null, who: e.who || null, device: e.device || null, viaCorrection: e.viaCorrection || null, from: e.viaCorrection ? e.from || null : null
  }, fields);
  L.lastRecord = { id: e.id, dose: d.id, at: e.at || null, who: e.who || null, day: dayNumber(e.at) };
  return rec;
}

/* treat { litter, dose, n, target:'unknown', group? } — record the dose on unknown arrivals
   (RULINGS Q14: resolved by recording). Concurrent records on unknowns collide like any other:
   both kept, flagged; the unknown never goes below 0. */
function applyTreatUnknown(ctx, e) {
  const L = needLitter(ctx, e.litter);
  const d = needDose(ctx, e.dose);
  const D = dose(ctx, L, d.id);
  const gate = taskGate(ctx, L, e, D, true);
  if (!isCount(e.n) || e.n === 0) throw new Reject('bad_numbers');
  if (gate.evidence) return afterEndEvidence(ctx, L, d, D, e, e.n);
  const mine = D.records.filter((r) => r.target === 'unknown' && (!e.group || r.group === e.group));
  const collided = mine.filter((r) => ctx.causal.concurrent(r.id, e.id));
  const avail = Math.min(e.group ? total(D.unknowns.filter((g) => g.id === e.group)) : total(D.unknowns), L.alive);
  if (!collided.length && e.n > avail) throw new Reject('more_than_unknown', { unknown: avail });
  takeUnknown(D, Math.min(e.n, avail), e.group);
  D.treated += e.n;
  if (d.castration && D.castration) D.castration.castrated += e.n;
  D.records.push(record(ctx, L, d, e, { n: e.n, group: e.group || null, deferred: 0, deferReason: null, exempt: 0, exemptBy: {}, females: 0, castration: null, catchUp: false }));
  completed(ctx, L, D, e);
  if (collided.length) {
    D.collisions.push([collided[0].id, e.id]);
    for (const r of collided) if (!D.collided.includes(r.id)) D.collided.push(r.id);
    D.collided.push(e.id);
    flag(ctx, L, 'possible_double_treatment', 'sync_collision', collided.map((r) => r.id).concat(e.id), { dose: d.id, target: 'unknown' });
  }
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
  raise(ctx, L, D, e, 'lacks', lacks);
  D.checks.push({ id: e.id, had, lacks, group: e.group || null, at: e.at || null, who: e.who || null });
  completed(ctx, L, D, e);
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
    if (liveRows(ctx, L.id) + 1 > L.alive) {
      if (!stale(ctx, L, e)) throw new Reject('more_rows_than_alive');
      flag(ctx, L, 'sync_review', 'identity_reconcile', [e.id], { rows: liveRows(ctx, L.id) + 1, alive: L.alive });
    }
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
    if (r.status === 'dead') throw new Reject('row_dead', { rowId: r.rowId, event: r.deathEvent || null });
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
  identityGate(ctx, L, e, n === L.alive || n - named.length <= L.alive - rowsHere, { untagged: n - named.length, unidentified: L.alive - rowsHere });
  concurrentCountFlag(ctx, L, e);
  L.weaned += n;
  const set = new Set(named);
  const allOut = n === L.alive;
  for (const r of ctx.rows.values()) {
    if (r.litter !== L.id || r.status !== 'alive') continue;
    if (set.has(r.rowId) || allOut) { r.status = 'weaned'; r.weanedAt = e.at || null; retireRow(L, r.rowId); }
  }
  aliveChange(ctx, L, e, -n);
  return [L];
}

// ---------------------------------------------------------------------------------------------
// view: the derived facts a page renders

function view(ctx, L, corrections, today) {
  const dayAge = L.birthDay != null && today != null ? today - L.birthDay : null;
  const doses = {};
  for (const d of ctx.cfg.doses) {
    const D = dose(ctx, L, d.id);
    const rawOwed = owedShown(L, D);
    // corrected after End: the shortfall is a fact, not an actionable owed (derive computes `short`)
    const notDoneAfterEnd = rawOwed == null ? 0 : Math.min(rawOwed, (ctx.short && ctx.short.get(L.id + ':' + d.id)) || 0);
    const owed = rawOwed == null ? null : rawOwed - notDoneAfterEnd;
    let status = null;
    if (dayAge != null) {
      if (dayAge < d.due) status = 'later';
      else if (d.last != null && dayAge > d.last) status = 'missed';
      else if (dayAge > d.due) status = 'late';
      else status = 'due';
    }
    const unknown = unknownShown(L, D);
    const carried = Math.min(total(D.coverage), Math.max(0, L.alive - (rawOwed || 0) - unknown));
    const fi = frontierInfo(ctx, L, D);
    const deferred = Math.min(fi.deferred, owed == null ? fi.deferred : owed);
    const lastZero = L.zeros.length ? L.zeros[L.zeros.length - 1].index : -1;
    const owedFrom = [];
    if (deferred) owedFrom.push({ kind: 'deferred', n: deferred, reason: fi.reason });
    if (fi.frontier.length) {
      for (const x of D.entries) {
        if (!(x.delta > 0) || !RAISES.has(x.kind) || x.index <= Math.max(fi.lastIndex, lastZero)) continue;
        const f = owedFrom.find((o) => o.kind === x.kind);
        if (f) f.n += x.delta; else owedFrom.push({ kind: x.kind, n: x.delta });
      }
    }
    doses[d.id] = {
      dose: d.id, tx: d.tx, due: d.due, last: d.last, visible: d.visible, isCastration: d.castration, product: d.product, amount: d.amount,
      status,
      owed,                                          // shown: min(owed, alive); null = castration before its first record
      owedStored: D.stored,
      notDoneAfterEnd,
      owedFrom,
      treated: D.treated,
      deferred,
      deferReason: deferred ? fi.reason : null,
      exempt: D.exempt, exemptBy: Object.assign({}, D.exemptBy),
      missed: status === 'missed' && owed ? owed : 0,
      unknownAfterMove: unknown,
      unknownGroups: D.unknowns.map((g) => clone(g)),
      carriedFromMove: carried,
      coverage: D.coverage.map((g) => clone(g)),
      fullAt: D.fullAt,
      afterEnd: D.afterEnd.map((x) => clone(x)),
      done: owed === 0 && unknown === 0,
      records: D.records.map((r) => Object.assign({}, r, { corrected: corrections.has(r.id) })),
      possibleDoubleTreatment: D.collisions.map((p) => p.slice()),
      collidedRecords: D.collided.slice()
    };
    if (d.castration) {
      // before the first record nobody has counted the males: pages print `males counted as you cut`
      doses[d.id].males = D.castration ? D.castration.castrated + sum(D.castration.notCastrated) - D.castration.notCastrated.deferred + deferred : 'uncounted';
      doses[d.id].castration = D.castration ? {
        castrated: D.castration.castrated,
        notCastrated: Object.assign({}, D.castration.notCastrated, { deferred }),
        females: D.castration.females,
        males: D.castration.castrated + sum(D.castration.notCastrated) - D.castration.notCastrated.deferred + deferred
      } : null;
    }
  }
  const rowsHere = [...ctx.rows.values()].filter((r) => r.litter === L.id);
  const live = rowsHere.filter((r) => r.status === 'alive').length;
  const distinct = distinctKeys(ctx, L.id).length;          // a same-tag pair within the litter counts once
  const scheme = ctx.cfg.identity;
  let idDone = null;
  if (scheme.scheme !== 'none') idDone = scheme.who === 'candidates' ? L.idClosed : distinct >= L.alive;
  const groups = sameTagGroups(ctx);
  const mine = groups.filter((g) => g.rows.some((r) => r.litter === L.id));
  const alsoOn = (r) => { const g = groups.find((x) => x.rows.some((y) => y.rowId === r.rowId)); return g ? g.rows.filter((y) => y.rowId !== r.rowId).map((y) => ({ litter: y.litter, rowId: y.rowId })) : []; };
  const openL = L.losses.reduce((s, x) => s + x.remaining, 0), openG = L.gains.reduce((s, x) => s + x.remaining, 0);
  const item = (x) => ({ id: x.id, qty: x.qty, open: x.remaining, rows: x.rows || [], at: x.at, who: x.who, explainedBy: x.explainedBy.map((b) => Object.assign({}, b)) });
  const out = {
    id: L.id, room: L.room, phase: L.phase, endedBySowDeath: !!L.endedBySowDeath,
    inTask: inTask(ctx, L.id), task: taskOf(ctx, L.id) ? taskOf(ctx, L.id).id : null,
    sowDied: L.sowDied ? Object.assign({}, L.sowDied) : null,
    birthDay: L.birthDay, dayAge,
    born: L.born, dead: { total: L.deadTotal, byCause: Object.assign({}, L.deadByCause) },
    alive: L.alive, movedIn: L.movedIn, movedOut: L.movedOut, weaned: L.weaned,
    unexplained: { openLoss: openL, openGain: openG, losses: L.losses.map(item), gains: L.gains.map(item) },
    moves: L.moves.map((m) => clone(m)),
    movedOutAfterEnd: L.movedOutAfterEnd.map((m) => clone(m)),
    held: L.held.map((h) => clone(h)),
    counts: L.counts.map((c) => clone(c)),
    deaths: L.deaths.map((x) => clone(x)),
    doses,
    identity: {
      scheme: scheme.scheme, who: scheme.who,
      identified: Math.min(distinct, L.alive), liveRows: live, distinct, pairs: live - distinct, conflict: Math.max(0, live - L.alive),
      missing: rowsHere.filter((r) => r.status === 'missing').length,
      onRecord: rowsHere.filter((r) => r.status !== 'withdrawn').length,
      rows: [...ctx.rows.values()].filter((r) => r.litter === L.id || r.birthLitter === L.id).map((r) => Object.assign(clone(r), { alsoOn: alsoOn(r) })),
      sameTag: mine.map((g) => ({ tag: g.tag, rows: g.rows.map((y) => Object.assign({}, y)) })),
      closed: L.idClosed, done: idDone
    },
    sow: L.sow ? Object.assign({}, L.sow) : null,
    birthWeight: L.birthWeight ? Object.assign({}, L.birthWeight) : null,
    birthWeightConflicts: L.birthWeightConflicts.map((x) => Object.assign({}, x)),
    weights: L.weights.map((w) => clone(w)),
    sexCounts: sexCounts(ctx, L),
    notes: L.notes.map((n) => Object.assign({}, n)),
    flags: L.flags.map((f) => clone(f)),
    lastEvent: L.lastEvent, lastRecord: L.lastRecord
  };
  // a litter outside every task (a nurse sow): the doses its arrivals owe stay recordable (`catchUp`)
  if (!out.inTask) for (const d of ctx.cfg.doses) out.doses[d.id].catchUp = dose(ctx, L, d.id).catchUp;
  // treatments can be recorded here: a litter in a task, or one outside every task holding arrivals
  // that owe a dose (a nurse sow from a previous batch)
  out.recordable = out.inTask || Object.values(doses).some((x) => x.catchUp > 0 && x.owed > 0) || Object.values(doses).some((x) => x.unknownAfterMove > 0 && !out.inTask && ctx.cfg.tasks.length > 0);
  out.balanced = balances(out);
  return out;
}

/* Every tag held by two or more rows that are still in a litter (alive or missing), in the order
   the tags were first recorded: a sync duplicate within a litter, or the same tag on two crates. */
function sameTagGroups(ctx) {
  const by = new Map();
  for (const r of ctx.rows.values()) {
    if (!r.tag || (r.status !== 'alive' && r.status !== 'missing')) continue;
    if (!by.has(r.tag)) by.set(r.tag, []);
    by.get(r.tag).push({ litter: r.litter, rowId: r.rowId, status: r.status });
  }
  return [...by.entries()].filter(([, rows]) => rows.length > 1).map(([tag, rows]) => ({ tag, rows }));
}

/* Boars and gilts: identified rows by sex, plus the saved counts for piglets without a row, which
   later rows consume — a boar row a boar count, a gilt a gilt; an unsexed row consumes the pool,
   and which bucket it came from is unknowable (then the split is unresolved; never past Alive). */
function sexCounts(ctx, L) {
  const rec = L.sexCountsRec;
  const keys = [];
  let b = 0, g = 0, u = 0, nb = 0, ng = 0, nu = 0;
  for (const r of ctx.rows.values()) {
    if (r.litter !== L.id || r.status !== 'alive' || keys.includes(rowKey(r))) continue;
    keys.push(rowKey(r));
    const fresh = !rec || !rec.keys.includes(rowKey(r));
    if (r.sex === 'b') { b++; if (fresh) nb++; } else if (r.sex === 'g') { g++; if (fresh) ng++; } else { u++; if (fresh) nu++; }
  }
  const rem = Math.max(0, L.alive - Math.min(keys.length, L.alive));
  const rb = rec ? Math.max(0, rec.boars - nb) : 0, rg = rec ? Math.max(0, rec.gilts - ng) : 0;
  const cb = Math.min(rb, rem), cg = Math.min(rg, rem - cb);
  return {
    saved: rec ? { boars: rec.boars, gilts: rec.gilts, at: rec.at, who: rec.who, event: rec.event } : null,
    boars: b + cb, gilts: g + cg, sexedBoars: b, sexedGilts: g, unsexed: u,
    residualBoars: cb, residualGilts: cg, remaining: rem, unresolved: !!rec && rb + rg > rem
  };
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
// selectors: what the pages render. Pages hold no ledger arithmetic; drafts go through `append`.

function doseOrder(cfg) { const ix = new Map(cfg.doses.map((d, i) => [d.id, i])); return (a, b) => a.due - b.due || ix.get(a.dose) - ix.get(b.dose); }
function population(D) { return typeof D.males === 'number' ? D.males : null; }
const todoOf = (D) => (D.owed == null ? !D.records.length : D.owed > 0 || D.unknownAfterMove > 0);

/* Try a draft exactly as `append` would, with the page's stamp. */
function trial(derived, event, stamp) {
  const input = derived.input || { events: [], config: {}, opts: {} };
  const st = stamp || {};
  const e = Object.assign({ id: st.id || '__draft', at: st.at || input.opts.today || null, who: st.who || null }, st.seen ? { seen: st.seen } : {}, event);
  return append(input.events, e, input.config, input.opts);
}

/* One litter as the room sees it (room glossary, slice S1). */
function roomFacts(derived, L) {
  const cfg = derived.config, order = doseOrder(cfg), today = derived.today;
  const Ds = Object.values(L.doses);
  const live = Ds.filter((D) => (D.status === 'due' || D.status === 'late') && todoOf(D)).sort(order);
  const lapsed = Ds.filter((D) => D.status === 'missed' && todoOf(D)).sort(order);
  const ahead = Ds.filter((D) => D.status === 'later' && todoOf(D)).sort(order);
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
  const doseRow = (D) => Object.assign({ dose: D.dose, tx: D.tx, due: D.due, n: D.owed == null ? null : D.owed, of: D.isCastration ? population(D) : L.alive, unknown: D.unknownAfterMove, status: D.status },
    D.isCastration ? { males: D.males } : {});
  // `n records — check`: every record that took part in a collision, not the pairs
  const collide = Ds.reduce((s, D) => s + D.collidedRecords.length, 0);
  return {
    litter: L.id, lens, kind, day: L.dayAge, alive: L.alive,
    unfinished: { n: live.length + lapsed.length, missed: lapsed.length },
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

/* A treat draft against one dose: owed, the not-treated remainder, why Save is gray, and the
   event — refused exactly as `append` would refuse it. */
function treatDraft(derived, L, D, draft, stamp) {
  const dr = draft || {};
  let out, ev;
  if (D.isCastration) {
    const c = dr.castration || {};
    const males = (c.castrated || 0) + (c.hernia || 0) + (c.cryptorchid || 0) + (c.kept || 0) + (c.deferred || 0);
    out = { owed: D.owed, males, why: null, event: null };
    ev = { type: 'treat', litter: L.id, dose: D.dose, castration: Object.assign({ castrated: 0 }, c) };
  } else {
    const owed = D.owed;
    const n = dr.n == null ? owed : dr.n;
    const k = (dr.deferred && dr.deferred.n) || 0, x = (dr.exempt && dr.exempt.n) || 0;
    out = { owed, treated: n, notTreated: Math.max(0, (owed || 0) - n - k - x), why: null, event: null };
    ev = { type: 'treat', litter: L.id, dose: D.dose, n };
    if (k) ev.deferred = Object.assign({}, dr.deferred);
    if (x) ev.exempt = Object.assign({}, dr.exempt);
  }
  const r = trial(derived, ev, stamp);
  if (!r.ok) out.why = r.reason;
  else { out.event = ev; out.after = r.derived.litters[L.id].doses[D.dose]; }
  return out;
}

function litterSelect(derived, id, opts) {
  const L = derived.litters[id];
  if (!L) return null;
  const o = opts || {};
  const order = doseOrder(derived.config);
  const Ds = Object.values(L.doses);
  const now = Ds.filter((D) => D.status !== 'later' && todoOf(D)).sort(order);
  const drafts = {};
  for (const [doseId, dr] of Object.entries(o.drafts || {})) if (L.doses[doseId]) drafts[doseId] = treatDraft(derived, L, L.doses[doseId], dr, o.stamp);
  return {
    id: L.id, inTask: L.inTask,
    header: { born: L.born, alive: L.alive, dead: L.dead.total, dayAge: L.dayAge, phase: L.phase, sowDied: !!L.sowDied },
    owed: now.map((D) => ({
      dose: D.dose, tx: D.tx, due: D.due, status: D.status, lateBy: D.status === 'late' ? L.dayAge - D.due : 0,
      missedAfter: D.status === 'missed' ? D.last : null,
      owed: D.owed, oneTap: D.owed == null ? null : D.owed, deferred: D.deferred, deferReason: D.deferReason,
      unknown: D.unknownAfterMove, owedFrom: D.owedFrom.map((x) => Object.assign({}, x)),
      males: D.isCastration ? D.males : undefined
    })),
    // treatments left: what can be done now (a missed dose is not one); unfinished: owed or missed
    dosesLeft: { left: now.filter((D) => D.status !== 'missed').length, total: Ds.filter((D) => D.status !== 'later').length },
    unfinished: { n: now.length, missed: now.filter((D) => D.status === 'missed').length },
    correctedAfterEnd: Ds.filter((D) => D.notDoneAfterEnd > 0).sort(order).map((D) => ({ dose: D.dose, tx: D.tx, n: D.notDoneAfterEnd })),
    afterEnd: Ds.flatMap((D) => D.afterEnd.map((x) => Object.assign({ tx: D.tx }, x))),
    held: L.held.map((h) => Object.assign({}, h)),
    recorded: Ds.filter((D) => D.records.length).sort(order).map((D) => ({ dose: D.dose, tx: D.tx, records: D.records.map((r) => Object.assign({}, r)), collisions: D.possibleDoubleTreatment })),
    later: Ds.filter((D) => D.status === 'later').sort(order).map((D) => ({ dose: D.dose, tx: D.tx, due: D.due, inDays: D.due - L.dayAge })),
    identity: L.identity, unexplained: L.unexplained, notes: L.notes, flags: L.flags,
    drafts
  };
}

/* The shared dead drawer (slice S5): caps, the from-the-missing range, why Save is gray — the
   drawer's own steps first, then whatever `append` would refuse — and the effect of Save. */
function deathDraftSelect(derived, litterId, draft, stamp) {
  const L = derived.litters[litterId];
  if (!L) return { why: 'unknown_litter', event: null };
  const dr = draft || {};
  const locked = L.phase === 'locked';
  const tallies = dr.tallies || {};
  const picks = dr.picks || {};
  const lossN = L.unexplained.openLoss;
  const roster = L.identity.rows.filter((r) => r.litter === L.id && (r.status === 'alive' || r.status === 'missing'));
  const unidentified = Math.max(0, L.alive - L.identity.liveRows);
  const bodies = sum(tallies);
  const pickIds = Object.keys(picks);
  // a named missing piglet's share of the loss is its own (its row's death spends it): untagged bodies draw only the rest
  const named = roster.filter((r) => r.status === 'missing').length;
  const unnamed = Math.max(0, lossN - named);
  const cap = locked ? unidentified + unnamed : Infinity;
  const kMax = Math.min(bodies, unnamed);
  const kMin = locked ? Math.max(0, bodies - unidentified) : 0;
  const asksLoss = locked && unnamed > 0;
  const k = dr.k == null ? null : dr.k;
  let why = null;
  const bare = pickIds.filter((r) => !picks[r]);
  if (!bodies && !pickIds.length) why = 'empty';
  else if (bare.length) why = bare.length === 1 ? 'cause_one' : 'cause_many';
  else if (bodies > cap) why = 'over_cap';
  else if (asksLoss && bodies > 0 && (k == null || k < kMin || k > kMax)) why = 'missing';
  const lines = Object.entries(tallies).filter(([, n]) => n > 0).map(([cause, n]) => ({ cause, n }))
    .concat(pickIds.map((rowId) => ({ cause: picks[rowId], rowId })));
  const ev = Object.assign({ type: 'death', litter: L.id, lines }, locked && bodies && k ? { fromMissing: k } : {});
  let after = null;
  if (!why) {
    const r = trial(derived, ev, stamp);
    if (!r.ok) why = r.reason;
    else { const A = r.derived.litters[L.id]; after = { alive: A.alive, dead: A.dead.total, openLoss: A.unexplained.openLoss }; }
  }
  return {
    phase: L.phase,
    causes: locked ? ['crushed', 'scours', 'starve-out', 'other'] : ['stillborn', 'mummified', 'crushed', 'scours', 'starve-out', 'other'],
    roster: roster.map((r) => ({ rowId: r.rowId, tag: r.tag, notch: r.notch, status: r.status })),
    bodies, picks: pickIds.length, unidentified, openLoss: lossN, cap, kMin, kMax, asksLoss,
    needK: asksLoss && bodies > 0 && k == null, why, after,
    event: why ? null : ev
  };
}

/* The Move sheet (slice S7): the clamp, then the same replay `append` runs gives the before → after
   on both sides, what each dose carries, the questions to ask, and why Save is gray. */
function moveDraftSelect(derived, draft, stamp) {
  const dr = draft || {};
  const S = derived.litters[dr.from], R = derived.litters[dr.to];
  let why = null;
  if (!S) why = 'no_source'; else if (!R) why = 'no_receiver'; else if (S === R) why = 'same_litter';
  if (why) return { why, event: null };
  const ex = dr.explains || [];
  const loss = ex[0] ? S.unexplained.losses.find((x) => x.id === ex[0]) : null;
  const rows = dr.rows || [];
  const maxN = (loss ? loss.open : 0) + S.alive;
  let n = dr.n == null ? rows.length : dr.n;
  n = Math.max(rows.length, Math.min(n, maxN));
  const ev = { type: 'move', from: S.id, to: R.id, n, rows: rows.slice(), answers: Object.assign({}, dr.answers || {}) };
  if (ex.length) ev.explains = [ex[0] || null, ex[1] || null];
  const r = trial(derived, ev, stamp);
  const blank = trial(derived, Object.assign({}, ev, { answers: {} }), stamp);
  if (!r.ok) return { n, max: maxN, why: r.reason, event: null, delta: null, carry: {}, asks: [], sourceAfter: [] };
  const mv = r.derived.litters[R.id].moves[r.derived.litters[R.id].moves.length - 1];
  const mv0 = blank.ok ? blank.derived.litters[R.id].moves[blank.derived.litters[R.id].moves.length - 1] : mv;
  // doses not yet due at the receiver are left out: nothing is carried, asked or ranged for them
  const dueHere = (d) => R.dayAge == null || R.dayAge >= d.due;
  const doses = derived.config.doses.filter(dueHere);
  const asks = doses.filter((d) => !d.visible && mv0.packets[d.id] === 'unknown').map((d) => d.id);
  const carry = {};
  for (const d of doses) if (mv.packets[d.id]) carry[d.id] = mv.packets[d.id];
  const after = r.derived.litters[S.id].alive;
  const sourceAfter = [];
  for (const d of doses) {
    const D = S.doses[d.id];
    if ((mv.packets[d.id] === 'unknown' || mv.packets[d.id] === 'check') && D.owed != null && !d.castration) {
      const covered = S.alive - D.owed;
      sourceAfter.push({ dose: d.id, lo: Math.max(0, covered - mv.n), hi: Math.min(covered, after), of: after });
    }
  }
  return {
    n: mv.n, max: maxN, unidentified: Math.max(0, S.alive - S.identity.liveRows),
    delta: { from: [S.alive, after], to: [R.alive, r.derived.litters[R.id].alive] },
    carry, asks, sourceAfter, why: null, event: ev
  };
}

/* Set count (slice #10): the number seen against the ledger's Alive, the item Save would write, which
   identified piglets the count must name (the untagged remainder cannot cover the rest), and why Save
   is gray — the same replay `append` runs. A matching count is a valid observation that writes nothing. */
function countDraftSelect(derived, litterId, draft, stamp) {
  const L = derived.litters[litterId];
  if (!L) return { why: 'unknown_litter', event: null };
  const dr = draft || {};
  const observed = dr.observed == null ? L.alive : dr.observed;
  // a count is an observation like any other (RULINGS round 3): sized against Alive, it never closes a line
  const openLoss = L.unexplained.openLoss, openGain = L.unexplained.openGain;
  const base = L.alive;
  const rows = L.identity.rows.filter((r) => r.litter === L.id && r.status === 'alive');
  const picked = (dr.missingRows || []).filter((id) => rows.some((r) => r.rowId === id));
  const diff = observed - base;
  const out = {
    phase: L.phase, alive: L.alive, base, observed, diff, kind: diff < 0 ? 'loss' : diff > 0 ? 'gain' : 'match',
    roster: rows.map((r) => ({ rowId: r.rowId, tag: r.tag || null, notch: r.notch || null })),
    untagged: Math.max(0, base - rows.length),
    needRows: Math.max(0, rows.length - observed),        // rows the untagged piglets cannot account for
    maxRows: Math.max(0, -diff), picked: picked.slice(),
    open: { loss: openLoss, gain: openGain },
    why: null, event: null, after: null
  };
  if (L.phase !== 'locked') { out.why = 'farrowing_open'; return out; }
  if (L.weaned > 0 && L.alive === 0) { out.why = 'weaned'; return out; }
  if (picked.length < out.needRows) out.why = 'name_the_rows';
  else if (picked.length > out.maxRows) out.why = 'too_many_rows';
  const ev = { type: 'count', litter: L.id, observed, baseAlive: L.alive };
  if (dr.at) ev.at = dr.at;
  if (picked.length) ev.missingRows = picked.slice();
  if (!out.why) {
    const r = trial(derived, ev, stamp);
    if (!r.ok) out.why = r.reason;
    else {
      const A = r.derived.litters[L.id];
      const c = A.counts.find((k) => k.id === r.event.id) || {};
      out.after = { alive: A.alive, openLoss: A.unexplained.openLoss, openGain: A.unexplained.openGain, stands: !c.late };
      if (c.late) { out.kind = 'late'; out.diff = 0; }
      out.event = ev;
    }
  }
  return out;
}

/* Explain (slice #10): every open unexplained line, one by one, never netted, with what could explain it —
   a death (losses only; the dead drawer takes the body from the open loss) and the Moves the app suggests
   between an open loss and an open gain on another litter. Suggestions are ranked by room (the same room
   first, cross-room allowed), then by how close the two counts were in time; each is validated by the same
   replay `append` runs. A suggestion is never proof and is never paired by itself: the worker saves the Move. */
function explainSelect(derived, opts, stamp) {
  const o = opts || {};
  const all = Object.values(derived.litters).filter((L) => L.phase === 'locked');
  const scope = all.filter((L) => (o.litter ? L.id === o.litter : o.room == null || L.room === o.room));
  const opens = (L, kind) => (kind === 'loss' ? L.unexplained.losses : L.unexplained.gains).filter((x) => x.open > 0);
  const gapMin = (a, b) => { const x = time(a), y = time(b); return x == null || y == null ? null : Math.round(Math.abs(x - y) / 60000); };
  const lines = [];
  for (const L of scope) {
    for (const kind of ['loss', 'gain']) {
      for (const x of opens(L, kind)) {
        const other = kind === 'loss' ? 'gain' : 'loss';
        const suggestions = [];
        for (const M of all) {
          if (M.id === L.id) continue;
          for (const y of opens(M, other)) {
            const lossL = kind === 'loss' ? L : M, loss = kind === 'loss' ? x : y;
            const gainL = kind === 'loss' ? M : L, gain = kind === 'loss' ? y : x;
            const n = Math.min(loss.open, gain.open);
            const named = lossL.identity.rows.filter((r) => r.litter === lossL.id && r.status === 'missing' && r.lossId === loss.id).map((r) => r.rowId);
            // more named missing piglets than the Move carries: the worker picks which (validated with the first ones)
            const pick = named.length > n;
            const rows = pick ? [] : named.slice();
            const d = moveDraftSelect(derived, { from: lossL.id, to: gainL.id, n, rows: pick ? named.slice(0, n) : rows, explains: [loss.id, gain.id] }, stamp);
            if (!d.event) continue;
            suggestions.push({
              litter: M.id, room: M.room, sameRoom: M.room === L.room, kind: other, id: y.id, qty: y.qty, open: y.open, at: y.at, who: y.who,
              observed: (M.counts.find((c) => c.id === y.id) || {}).observed ?? null, gapMin: gapMin(x.at, y.at),
              pickFrom: pick ? named.slice() : null,
              move: { from: lossL.id, to: gainL.id, n: d.n, rows, explains: [loss.id, gain.id] },
              // what the Move leaves open on each side (0: that line closes)
              left: { loss: loss.open - d.n, gain: gain.open - d.n }
            });
          }
        }
        suggestions.sort((a, b) => (b.sameRoom - a.sameRoom) || ((a.gapMin ?? 1e9) - (b.gapMin ?? 1e9)) || (a.litter < b.litter ? -1 : 1));
        const c = L.counts.find((k) => k.id === x.id) || {};
        lines.push({
          litter: L.id, room: L.room, kind, id: x.id, qty: x.qty, open: x.open, rows: x.rows.slice(), at: x.at, who: x.who,
          observed: c.observed ?? null, aliveBefore: c.aliveBefore ?? null,
          // the base the difference was taken from, and the count whose line this one replaced (a recount)
          sizedAgainst: c.sizedAgainst ?? null,
          replaced: null,                                   // no count replaces another (RULINGS round 3)
          wrongCount: { count: x.id, edit: L.id },          // `Wrong count? Edit`: the count is corrected through Edit
          explainedBy: x.explainedBy.map((b) => Object.assign({}, b)),
          review: L.flags.some((f) => f.kind === 'sync_review' && (f.events || []).includes(x.id)),
          death: kind === 'loss' ? { litter: L.id, max: x.open } : null,
          suggestions
        });
      }
    }
  }
  lines.sort((a, b) => (a.litter < b.litter ? -1 : a.litter > b.litter ? 1 : (time(a.at) || 0) - (time(b.at) || 0)));
  return {
    lines,
    openLoss: lines.filter((l) => l.kind === 'loss').reduce((s, l) => s + l.open, 0),
    openGain: lines.filter((l) => l.kind === 'gain').reduce((s, l) => s + l.open, 0)
  };
}

/* The counts on one litter, newest last, each with what it wrote against the ledger (never against the
   device's base, so two counts never sum) and whether it crossed a death, Move or weaning it did not see. */
function countsSelect(derived, litterId) {
  const L = derived.litters[litterId];
  if (!L) return null;
  const flags = L.flags.filter((f) => f.kind === 'sync_review' && ['count_concurrent', 'count_order', 'count_conflict'].includes(f.reason));
  // in log order; every count not disputed and not late stands as an observation; the latest one leads
  const list = L.counts.map((c) => {
    const mine = flags.filter((f) => (f.events || []).includes(c.id));
    const others = (reason) => mine.filter((f) => f.reason === reason).flatMap((f) => f.events.filter((id) => id !== c.id));
    const crossed = others('count_concurrent'), order = others('count_order'), against = others('count_conflict');
    return Object.assign({}, c, { stands: !c.disputed && !c.late, crossed, order, against,
      review: crossed.length + order.length > 0, deviceDiff: c.baseAlive == null ? null : c.observed - c.baseAlive });
  });
  const standing = list.filter((c) => c.stands).pop() || null;
  // two counts disagree until a later count saw them (`settledBy`): `count again`
  const open = list.filter((c) => c.disputed && !c.settledBy);
  const conflict = open.length > 0;
  // under review while the counts disagree, or the standing count crossed an unseen change or was overtaken; a later count settles it
  return { litter: L.id, alive: L.alive, counts: list, standing: standing ? standing.id : null, conflict, disputed: open.map((c) => c.id),
    review: conflict || !!(standing && standing.review) };
}

/* One dose for several litters (slice #7, bulk). Each litter's record is its one-tap: every owed piglet,
   no reasons. Rows: every litter of the room (or `litters`) that can hold a record of this dose, alive, where
   the dose is owed now, was recorded today, or is not yet due — each with what a bulk record would do there:
     record   owed now, nothing to ask: `n` piglets (late by `lateBy` days; `catchUp` after End)
     done     nothing owed and recorded today: the records (who, when, piglets, collided)
     not_due  due in `inDays` days — early is deliberate, on the litter's own sheet
     sheet    owed with something to ask (`why`: castration — males are counted on the sheet · deferred with its
              reason · unknown arrivals · missed window): the bulk act never asks, so the litter goes to its sheet
   After its task's End a litter lists only catch-up (arrivals after End that owe the dose); `ended` says so.
   The plan: `selected` litters replayed in order exactly as the store's commitAll appends them (one stamp).
   `reviewed` ({ litter: { n, alive, dead } }, what the review showed) makes the review a contract: a litter whose
   owed or alive moved since is not recorded (`changed`), unless the only change is deaths (`died`: recorded at the
   lower number, named); every selected litter gets one outcome. */
function bulkDraftSelect(derived, opts) {
  const o = opts || {};
  const doseId = o.dose;
  const cfgD = derived.config.doses.find((d) => d.id === doseId);
  if (!cfgD) return { why: 'unknown_dose', rows: [], plan: null };
  const today = derived.today;
  const endedOf = (L) => { const T = (derived.tasks || []).find((t) => t.id === L.task); return T && T.ended ? T.ended : null; };
  let ended = null;
  const pool = Object.values(derived.litters).filter((L) => L.alive > 0 && (L.inTask || L.recordable) &&
    (o.litters ? o.litters.includes(L.id) : o.room == null || L.room === o.room));
  const rows = [];
  for (const L of pool) {
    const D = L.doses[doseId];
    if (!D || D.status == null) continue;
    const E = endedOf(L);
    if (E) ended = ended || { at: E.at, who: E.who };
    const row = { litter: L.id, alive: L.alive, dead: L.dead.total, moved: L.movedIn + L.movedOut, counted: L.counts.length, day: L.dayAge, status: D.status, lateBy: D.status === 'late' ? L.dayAge - D.due : 0,
      sowDied: !!L.sowDied, phase: L.phase, catchUp: false };
    const collided = (r) => D.possibleDoubleTreatment.some((p) => p.includes(r.id));
    const todays = D.records.filter((r) => dayNumber(r.at) === today).map((r) => ({ id: r.id, at: r.at, who: r.who, n: r.n, collided: collided(r) }));
    const last = todays.length ? todays[todays.length - 1] : null;
    if (E) continue;                                     // after End no new marks (RULINGS round 3): no rows
    if (!L.inTask) {
      // outside every task (a nurse sow): only arrivals that owe the dose, and only as many as arrived
      if (!(D.catchUp > 0 && D.owed > 0) || D.isCastration) continue;
      Object.assign(row, { kind: 'record', n: Math.min(D.catchUp, D.owed), catchUp: true, outside: !L.inTask });
    }
    else if (D.status === 'later') Object.assign(row, { kind: 'not_due', inDays: D.due - L.dayAge });
    else if (D.done) { if (!todays.length) continue; Object.assign(row, { kind: 'done', records: todays, collided: todays.some((r) => r.collided) }); }
    else if (D.isCastration) Object.assign(row, { kind: 'sheet', why: 'castration', n: D.owed });
    else if (D.status === 'missed') Object.assign(row, { kind: 'sheet', why: 'missed', n: D.owed, last: D.last });
    else if (D.deferred > 0) Object.assign(row, { kind: 'sheet', why: 'deferred', n: D.owed, reason: D.deferReason, last });
    else if (D.unknownAfterMove > 0) Object.assign(row, { kind: 'sheet', why: 'unknown', n: D.unknownAfterMove });
    else Object.assign(row, { kind: 'record', n: D.owed });
    rows.push(row);
  }
  rows.sort((a, b) => (a.litter < b.litter ? -1 : a.litter > b.litter ? 1 : 0));
  const counts = { record: 0, done: 0, not_due: 0, sheet: 0 };
  for (const r of rows) counts[r.kind] += 1;
  const byId = new Map(rows.map((r) => [r.litter, r]));
  const plan = { outcomes: [], record: [], done: [], notDue: [], sheet: [], changed: [], gone: [], refused: [], litters: 0, piglets: 0, events: [] };
  const input = derived.input || { events: [], config: {}, opts: {} };
  const st = o.stamp || {};
  const reviewed = o.reviewed || null;
  let events = input.events;
  (o.selected || []).forEach((id, i) => {
    const row = byId.get(id), rev = reviewed ? reviewed[id] : null;
    const out = { litter: id };
    plan.outcomes.push(out);
    if (!row) {
      // left the list: every piglet gone, or (catch-up) another phone recorded the arrivals — then who and when
      const L = derived.litters[id], D = L && L.doses[doseId];
      const recs = D ? D.records.filter((r) => dayNumber(r.at) === today) : [];
      const other = recs.length ? { id: recs[recs.length - 1].id, at: recs[recs.length - 1].at, who: recs[recs.length - 1].who, n: recs[recs.length - 1].n } : null;
      Object.assign(out, { outcome: 'gone', was: rev ? rev.n : null, alive: L ? L.alive : 0, other: L && L.alive > 0 ? other : null });
      plan.gone.push(id); return;
    }
    if (row.kind === 'done') {
      const other = row.records[row.records.length - 1];
      Object.assign(out, { outcome: rev ? 'nothing' : 'done', other, records: row.records }); plan.done.push(id); return;
    }
    if (row.kind === 'not_due') { Object.assign(out, { outcome: 'not_due', inDays: row.inDays }); plan.notDue.push(id); return; }
    if (row.kind === 'sheet') { Object.assign(out, { outcome: 'sheet', why: row.why, n: row.n, was: rev ? rev.n : null, other: row.last || null }); plan.sheet.push(id); return; }
    let died = 0;
    // Deaths alone may lower the number (named); a move, a count or anything else since the review is `changed`.
    const other = rev && (rev.moved !== undefined && (row.moved !== rev.moved || row.counted !== rev.counted));
    if (rev && (other || row.n !== rev.n || row.alive !== rev.alive || row.dead !== rev.dead)) {
      died = row.dead - rev.dead;
      const onlyDeaths = !other && died > 0 && rev.n - row.n === died && rev.alive - row.alive === died;
      if (!onlyDeaths) { Object.assign(out, { outcome: 'changed', was: rev.n, n: row.n, alive: row.alive }); plan.changed.push(id); return; }
    }
    const ev = { type: 'treat', litter: id, dose: doseId, n: row.n };
    const e = Object.assign({ id: (st.id || '__bulk') + ':' + i, at: st.at || input.opts.today || null, who: st.who || null }, st.seen ? { seen: st.seen } : {}, ev);
    const r = append(events, e, input.config, input.opts);
    if (!r.ok) { Object.assign(out, { outcome: 'refused', why: r.reason, detail: r.detail }); plan.refused.push({ litter: id, why: r.reason, detail: r.detail }); return; }
    events = r.events;
    Object.assign(out, { outcome: died ? 'died' : 'record', n: row.n, was: rev ? rev.n : row.n, died, lateBy: row.lateBy, catchUp: row.catchUp });
    plan.record.push({ litter: id, n: row.n, lateBy: row.lateBy, died, catchUp: row.catchUp });
    plan.events.push(ev);
    plan.litters += 1;
    plan.piglets += row.n;
  });
  return { dose: doseId, castration: !!cfgD.castration, rows, counts, ended, plan, why: null };
}

/* End task figures (slice S9 glossary) over a set of derived litters, for one task.
   On time: a treatment (litter × dose) recorded fully — owed and unknown both 0 — by its planned
   day, over the treatments recorded or due. Before End, a dose due today and unrecorded is left
   out; at End (and after), a dose due on or before the End day and never recorded counts against. */
function endFigures(cfg, litterViews, opts) {
  const o = opts || {};
  const order = doseOrder(cfg);
  const litters = Object.values(litterViews).filter((L) => (o.task ? L.task === o.task : L.inTask));
  const byLitter = {}, per = {}, unfinished = [];
  const progress = { done: 0, owed: 0, unknown: 0, missed: 0, ahead: 0 };
  let n = 0, k = 0, idDone = 0;
  for (const L of litters) {
    const list = [];
    const t = { done: 0, owed: 0, unknown: 0, missed: 0, notDue: 0, malesUncounted: false, onTime: { n: 0, k: 0 }, excluded: 0, unfinished: false };
    const age = o.closing && o.endDay != null && L.birthDay != null ? o.endDay - L.birthDay : L.dayAge;
    for (const D of Object.values(L.doses).sort(order)) {
      t.done += D.treated;
      const kind = D.status === 'later' ? 'not_due' : D.status === 'missed' ? 'missed' : 'owed';
      const owed = D.owed == null ? 0 : D.owed, unk = D.unknownAfterMove;
      if (D.owed == null) {
        if (!D.records.length) { list.push({ dose: D.dose, kind, n: null, males: 'uncounted' }); if (kind !== 'not_due') t.malesUncounted = true; }
      } else if (owed + unk > 0) {
        list.push({ dose: D.dose, kind, n: owed + unk });
      }
      if (kind === 'not_due') t.notDue += owed + unk;
      else { t.owed += owed; t.unknown += unk; if (kind === 'missed') t.missed += owed; }
      const counted = D.records.length > 0 || age > D.due || (o.closing && age >= D.due);
      if (counted) { t.onTime.k++; if (D.fullAt != null && D.fullAt <= D.due) t.onTime.n++; }
      else t.excluded++;
    }
    t.unfinished = list.length > 0 || L.identity.done === false;
    byLitter[L.id] = list;
    per[L.id] = t;
    progress.done += t.done; progress.owed += t.owed; progress.unknown += t.unknown; progress.missed += t.missed; progress.ahead += t.notDue;
    n += t.onTime.n; k += t.onTime.k;
    if (L.identity.done === true) idDone++;
    if (t.unfinished) unfinished.push(L.id);
  }
  progress.total = progress.done + progress.owed + progress.unknown + progress.ahead;
  return {
    unfinishedLitters: unfinished, finishedLitters: litters.map((L) => L.id).filter((id) => !unfinished.includes(id)),
    correctedAfterEnd: litters.flatMap((L) => Object.values(L.doses).filter((D) => D.notDoneAfterEnd).map((D) => ({ litter: L.id, dose: D.dose, n: D.notDoneAfterEnd }))),
    byLitter, litters: per, unfinishedPigletDoses: Object.values(byLitter).flat().reduce((s, x) => s + (x.n || 0), 0), progress,
    onTime: { n, k }, identityDone: { n: idDone, k: litters.length },
    movedOutAfterEnd: litters.flatMap((L) => L.movedOutAfterEnd.map((m) => Object.assign({ litter: L.id }, m)))
  };
}

/* One task's End figures: `atEnd`, frozen by `end_task` from the log as it stood at End; `now`,
   live, amendments since End included. Both carry per-litter totals (`litters`). */
function endSelect(derived, opts) {
  const o = opts || {};
  const taskId = o.task || (derived.config.task ? derived.config.task.id : null);
  const T = (derived.tasks || []).find((x) => x.id === taskId);
  const E = T ? T.ended : derived.ended;
  const closed = !!(E && (E.event || E.at));
  return {
    task: taskId,
    atEnd: E && E.snapshot ? clone(E.snapshot) : null,
    now: endFigures(derived.config, derived.litters, { task: taskId, closing: closed, endDay: E ? dayNumber(E.at) : null }),
    ended: E ? Object.assign({}, E, { snapshot: undefined }) : null
  };
}

/* ---- corrections and the litter record (slice S8, ticket #12) ---- */

// The fields of a record a correction can change, as the page prints them.
function recFields(e) {
  if (!e) return null;
  if (e.type === 'treat') return { litter: e.litter, dose: e.dose, n: e.n == null ? null : e.n, deferred: e.deferred ? Object.assign({}, e.deferred) : null, exempt: e.exempt ? Object.assign({}, e.exempt) : null, castration: e.castration ? Object.assign({}, e.castration) : null, at: e.at || null, who: e.who || null, from: e.from || null };
  if (e.type === 'move') return { from: e.from, to: e.to, n: e.n, rows: (e.rows || []).slice() };
  if (e.type === 'count') return { litter: e.litter, observed: e.observed };
  if (e.type === 'identity') return { litter: e.litter, op: e.op || 'add', rowId: e.rowId || null, set: e.set ? Object.assign({}, e.set) : null };
  return { litter: e.litter || null };
}
const touches = (e, id) => !!e && (e.litter === id || e.from === id || e.to === id);
const dayOf = (at) => String(at || '').slice(0, 10);

/* The corrections in force, walked in log order: each accepted correction with its changes, and for
   each change what it stood on (`before`, as the writer's phone saw it) and what it left (`after`). */
function correctionWalk(derived) {
  const input = derived.input || { events: [] };
  const events = input.events || [];
  const bad = new Set(derived.rejected.map((r) => r.id));
  const byId = new Map(events.map((e) => [e.id, e]));
  const causal = ancestry(prepare(events).log);
  const rootOf = (tid) => { let e = byId.get(tid); while (e && e.type === 'correction') e = byId.get(e.target); return e; };
  const hist = new Map();                 // record id → [{ by, value }] in log order (value null: withdrawn)
  const synth = new Map();                // synthetic id → the event a correction carried
  const origin = new Map();               // synthetic fresh id → the record it came from
  const walked = [];
  const valueSeen = (id, c) => {
    const h = hist.get(id) || [];
    let v = byId.get(id) || null;
    for (const x of h) if (causal.saw(c.id, x.by)) v = x.value;
    if (!byId.has(id)) { const first = h.length ? h[0].value : synth.get(id) || null; if (!h.some((x) => causal.saw(c.id, x.by))) v = first; }
    return v;
  };
  events.forEach((c, index) => {
    if (c.type !== 'correction' || bad.has(c.id)) return;
    const out = [];
    for (const ch of changesOf(c)) {
      if (ch.identity) {
        const ev = Object.assign({}, ch.identity, { id: ch.synth, type: 'identity' });
        synth.set(ch.synth, ev);
        out.push({ kind: ch.identity.op === 'withdraw' ? 'withdraw' : 'row', synth: ch.synth, litter: ch.identity.litter, rowId: ch.identity.rowId, set: ch.identity.set ? Object.assign({}, ch.identity.set) : null });
        continue;
      }
      const isSynth = !byId.has(ch.target);
      const root = isSynth ? synth.get(ch.target) : rootOf(ch.target);
      if (!root) continue;
      const before = valueSeen(root.id, c);
      const prev = (hist.get(root.id) || []).slice(-1)[0];
      const cur = prev ? prev.value : isSynth ? synth.get(root.id) : root;
      let after;
      if (ch.void) after = null;
      else if (ch.restore) { const live = (hist.get(root.id) || []).map((x) => x.value).filter(Boolean).pop(); after = clone(live || root); }
      else after = Object.assign(clone(cur || root), ch.set || {}, { id: root.id, type: root.type });
      if (!hist.has(root.id)) hist.set(root.id, []);
      hist.get(root.id).push({ by: c.id, value: after });
      let fresh = null;
      if (ch.fresh) {
        fresh = Object.assign({ at: root.at || c.at || null, who: root.who || c.who || null }, clone(ch.fresh), { id: ch.synth, type: 'treat', from: root.litter || null });
        synth.set(ch.synth, fresh);
        origin.set(ch.synth, root.id);
      }
      const kind = root.type === 'identity' && root.op === 'close' ? 'reopen'
        : root.type === 'move' ? (after ? 'move' : 'move_void')
          : root.type === 'count' ? (after ? 'count' : 'count_void')
          : ch.restore ? 'restore' : fresh ? 'wrong' : !after ? 'void' : 'mark';
      out.push({ kind, target: { id: root.id, type: root.type, at: root.at || null, who: root.who || null, litter: root.litter || root.from || null, synth: isSynth, dose: root.dose || null },
        before: recFields(before), after: after ? recFields(after) : null, fresh: fresh ? recFields(fresh) : null });
    }
    walked.push({ id: c.id, at: c.at || null, who: c.who || null, index, changes: out });
  });
  return { walked, synth, origin, byId };
}

/* The litter record page: the litter's ledger as a timeline. Every accepted event that touched the
   litter, as it was written (a corrected one says when: `corrected 10:31`), and each correction as
   ONE entry listing the acts it touched with their before → after (a withdrawn mark stays on the
   page). Newest first, grouped by day; a day carries its hand when one hand wrote all of it. */
function recordSelect(derived, id) {
  const L = derived.litters[id];
  if (!L) return null;
  const input = derived.input || { events: [] };
  const events = input.events || [];
  const bad = new Set(derived.rejected.map((r) => r.id));
  const W = correctionWalk(derived);
  const T = (derived.tasks || []).find((t) => t.id === L.task);
  const endAt = T && T.ended && T.ended.event ? events.findIndex((e) => e.id === T.ended.event) : -1;
  const rows = new Map(L.identity.rows.map((r) => [r.rowId, r]));
  const rowLabel = (rowId) => { const r = rows.get(rowId); return r ? { tag: r.tag, notch: r.notch } : { tag: null, notch: null }; };
  const corrOf = (rid) => ((derived.corrections || {})[rid] || []).map((x) => ({ id: x.id, at: x.at, who: x.who }));
  const out = [];
  let run = null;
  const walked = new Map(W.walked.map((w) => [w.id, w]));
  events.forEach((e, index) => {
    if (bad.has(e.id)) return;
    const base = { id: e.id, at: e.at || null, who: e.who || null, index };
    if (e.type === 'correction') {
      run = null;
      const w = walked.get(e.id);
      if (!w) return;
      const mine = w.changes.filter((ch) => (ch.target && (ch.target.litter === id || touches(ch.before, id) || touches(ch.after, id))) || (ch.fresh && ch.fresh.litter === id) || ch.litter === id)
        .map((ch) => Object.assign({}, ch, { row: ch.rowId ? rowLabel(ch.rowId) : null, here: !(ch.fresh && ch.fresh.litter === id && ch.target && ch.target.litter !== id) }));
      if (!mine.length) return;
      out.push(Object.assign(base, {
        kind: 'correction', changes: mine,
        afterEnd: endAt >= 0 && index > endAt,
        flagged: L.flags.some((f) => (f.reason === 'correction_after_end' && f.events.some((x) => String(x).startsWith(e.id + ':'))) || (f.reason === 'correction_concurrent' && f.events.includes(e.id))),
        concurrent: L.flags.some((f) => f.reason === 'correction_concurrent' && f.events.includes(e.id))
      }));
      return;
    }
    if (!touches(e, id) && !(e.type === 'end_task' && L.inTask)) { run = null; return; }
    const corrected = corrOf(e.id);
    if (e.type === 'identity' && (e.op || 'add') === 'add') {
      if (run && run.who === (e.who || null) && dayOf(run.at) === dayOf(e.at)) { run.n++; run.last = rowLabel(e.rowId); run.lastAt = e.at || null; return; }
      run = Object.assign(base, { kind: 'rows', n: 1, first: rowLabel(e.rowId), last: rowLabel(e.rowId), lastAt: e.at || null });
      out.push(run);
      return;
    }
    run = null;
    if (e.type === 'farrowed') out.push(Object.assign(base, { kind: 'farrowed', born: e.born, dead: sum(e.dead), alive: e.born - sum(e.dead), locked: !!e.locked }));
    else if (e.type === 'treat') out.push(Object.assign(base, recFields(e), { kind: 'treat', target: e.target || null, corrected }));
    else if (e.type === 'death') {
      const d = L.deaths.find((x) => x.id === e.id);
      const byCause = {};
      for (const l of e.lines || []) byCause[l.cause] = (byCause[l.cause] || 0) + (l.rowId ? 1 : l.n || 0);
      out.push(Object.assign(base, { kind: 'death', byCause, n: sum(byCause), fromMissing: d ? d.fromMissing : 0, rows: (e.lines || []).filter((l) => l.rowId).map((l) => rowLabel(l.rowId)) }));
    } else if (e.type === 'count') {
      const c = L.counts.find((x) => x.id === e.id);
      out.push(Object.assign(base, { kind: 'count', observed: e.observed, wrote: c ? c.wrote : null, corrected }));
    } else if (e.type === 'move') out.push(Object.assign(base, { kind: 'move', dir: e.from === id ? 'out' : 'in', other: e.from === id ? e.to : e.from, n: e.n, corrected }));
    else if (e.type === 'identity' && e.op === 'edit') {
      const r = rows.get(e.rowId), x = r ? r.edits.find((y) => y.event === e.id) : null;
      out.push(Object.assign(base, { kind: 'row_edit', row: rowLabel(e.rowId), rowId: e.rowId, before: x ? Object.assign({}, x.before) : {}, set: Object.assign({}, e.set || {}) }));
    } else if (e.type === 'identity' && e.op === 'withdraw') out.push(Object.assign(base, { kind: 'row_withdraw', row: rowLabel(e.rowId), rowId: e.rowId }));
    else if (e.type === 'identity' && e.op === 'close') out.push(Object.assign(base, { kind: 'closed', corrected }));
    else if (e.type === 'sow_died') out.push(Object.assign(base, { kind: 'sow_died', cause: e.cause || null }));
    else if (e.type === 'weaned') out.push(Object.assign(base, { kind: 'weaned', n: e.n == null ? null : e.n }));
    else if (e.type === 'end_task') out.push(Object.assign(base, { kind: 'end_task' }));
    else if (e.type === 'resolve') out.push(Object.assign(base, { kind: 'resolve', held: e.held, answer: e.answer }));
  });
  out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : b.index - a.index));
  const days = [];
  for (const x of out) {
    const d = dayOf(x.at);
    let g = days[days.length - 1];
    if (!g || g.date !== d) { g = { date: d, who: null, entries: [] }; days.push(g); }
    g.entries.push(x);
  }
  for (const g of days) { const hands = new Set(g.entries.map((x) => x.who)); g.who = hands.size === 1 ? g.entries[0].who : null; }
  return { litter: id, days, entries: out.length, newest: out[0] || null };
}

/* The one Edit screen for a litter (slice S8): what it can correct, and the draft checked by the
   same replay `append` runs. Save commits ONE correction event carrying every change.
     draft = { marks: { <record id>: { n, reason } | { void: true } | { to, n?, reason? } | { back: true } },
               moves: { <move id>: { n?, to?, rows?, void? } },
               rows: { <row id>: { set: {…} } | { withdraw: true } }, reopen: true }
   A mark lowered leaves the rest deferred with a reason (after End: a fact, `not done`); `void`
   withdraws it (stamped, the original kept); `to` withdraws it here and records the act on the right
   litter at its original time (n defaults to the original, capped at what that litter owes; the
   deferred part travels); `back` reverses a wrong-litter correction from the right litter. A Move is
   corrected by id (count, crate, rows) or withdrawn; identity rows are edited or withdrawn; a
   closed candidate set reopens by withdrawing its close. `later` names the records a change would
   drop or invalidate: Save waits until they are corrected too (in the same draft). */
function editSelect(derived, id, draft, stamp) {
  const L = derived.litters[id];
  if (!L) return null;
  const dr = draft || {};
  const input = derived.input || { events: [], config: {}, opts: {} };
  const events = input.events || [];
  const cfg = derived.config;
  const order = doseOrder(cfg);
  const W = correctionWalk(derived);
  const T = (derived.tasks || []).find((t) => t.id === L.task);
  const ended = !!(T && T.ended && T.ended.event);
  const marks = [];
  for (const D of Object.values(L.doses).sort(order)) {
    for (const r of D.records) {
      if (r.target === 'unknown') continue;
      marks.push({ id: r.id, dose: r.dose, tx: D.tx, at: r.at, who: r.who, n: r.castration ? r.castration.castrated : r.n,
        deferred: r.deferred || 0, deferReason: r.deferReason || null, exempt: r.exempt || 0, castration: r.castration ? Object.assign({}, r.castration) : null,
        whole: r.castration ? (r.castration.castrated || 0) + (r.castration.deferred || 0) : (r.n || 0) + (r.deferred || 0) + (r.exempt || 0),
        corrected: !!r.corrected || !!r.viaCorrection, viaCorrection: r.viaCorrection || null, from: r.from || null,
        origin: r.viaCorrection ? W.origin.get(r.id) || null : null });
    }
  }
  marks.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const rowFields = new Map();              // row id → the fields a correction or edit ever changed (amber forever)
  const rows = L.identity.rows.filter((r) => r.litter === id && r.status !== 'withdrawn').map((r) => {
    const f = {};
    for (const x of r.edits) for (const k of Object.keys(x.set || {})) f[k] = true;
    rowFields.set(r.rowId, f);
    return Object.assign({}, r, { corrected: r.edits.length > 0, correctedFields: f });
  });
  const moves = L.moves.map((m) => Object.assign({}, clone(m), { corrected: !!(derived.corrections && derived.corrections[m.id]) }));
  let closeEv = null;
  if (L.identity.closed) for (const e of events) if (e.type === 'identity' && e.op === 'close' && e.litter === id) closeEv = e;
  const closed = closeEv ? { id: closeEv.id, at: closeEv.at || null, who: closeEv.who || null, k: L.identity.identified } : null;
  const owedOf = (c, dose) => { const X = derived.litters[c]; return X && X.doses[dose] ? X.doses[dose].owed : null; };
  // where a mark recorded on the wrong litter can go: litters in a task that owe that dose now, this unit first
  const targets = (dose) => Object.values(derived.litters).filter((X) => X.id !== id && X.inTask && X.phase === 'locked' && X.alive > 0 && X.doses[dose] &&
      (X.doses[dose].owed > 0 || (X.doses[dose].owed == null && !X.doses[dose].records.length)))
    .sort((a, b) => (a.room === L.room ? 0 : 1) - (b.room === L.room ? 0 : 1) || (a.room - b.room) || (a.id < b.id ? -1 : 1))
    .map((X) => ({ litter: X.id, room: X.room, owed: X.doses[dose].owed, alive: X.alive }));
  // where a Move can go or come from: every locked litter, this unit first, other units after
  const crates = () => Object.values(derived.litters).filter((X) => X.id !== id && X.phase === 'locked')
    .sort((a, b) => (a.room === L.room ? 0 : 1) - (b.room === L.room ? 0 : 1) || (a.room - b.room) || (a.id < b.id ? -1 : 1))
    .map((X) => ({ litter: X.id, room: X.room, alive: X.alive, sowDied: !!X.sowDied }));

  // counts on this litter (RULINGS round 3: a mistaken count is corrected through Edit)
  const counts = L.counts.map((c) => ({ id: c.id, observed: c.observed, wrote: c.wrote, aliveBefore: c.aliveBefore, at: c.at, who: c.who,
    disputed: !!c.disputed, late: !!c.late, corrected: !!(derived.corrections && derived.corrections[c.id]) }));
  const changes = [], list = [];
  let step = null;                                     // the draft's own step still missing (Save waits)
  const need = (s) => { if (!step) step = s; };
  for (const m of marks) {
    const x = (dr.marks || {})[m.id];
    if (!x) continue;
    if (x.back && m.viaCorrection && m.origin) {
      list.push({ target: m.id, void: true }, { target: m.origin, restore: true });
      changes.push({ kind: 'back', mark: m.id, dose: m.dose, n: m.n, from: m.from });
    } else if (x.to !== undefined) {
      if (!x.to) { need({ why: 'crate', mark: m.id }); changes.push({ kind: 'wrong', mark: m.id, dose: m.dose, from: m.n, to: null, n: null }); continue; }
      const owedThere = owedOf(x.to, m.dose);
      const n = x.n != null ? x.n : owedThere == null ? m.n : Math.min(m.n, owedThere);
      let fresh;
      if (m.castration) fresh = { litter: x.to, dose: m.dose, castration: { castrated: n }, at: m.at, who: m.who };
      else {
        fresh = { litter: x.to, dose: m.dose, n, at: m.at, who: m.who };
        const rest = owedThere == null ? 0 : owedThere - n;
        const reason = x.reason || m.deferReason || null;
        if (rest > 0) { if (reason) fresh.deferred = { n: rest, reason }; else need({ why: 'reason_there', mark: m.id, n: rest, litter: x.to }); }
      }
      list.push({ target: m.id, void: true, fresh });
      changes.push({ kind: 'wrong', mark: m.id, dose: m.dose, from: m.n, to: x.to, n, owedThere, rest: fresh.deferred ? fresh.deferred.n : 0, reason: fresh.deferred ? fresh.deferred.reason : null });
    } else if (x.void) {
      list.push({ target: m.id, void: true });
      changes.push({ kind: 'void', mark: m.id, dose: m.dose, from: m.n, afterEnd: ended });
    } else if (x.n != null && x.n !== m.n) {
      const rest = m.whole - x.n - (m.castration ? 0 : m.exempt);
      const reason = x.reason || (rest > 0 && ended ? 'not_done' : null) || (rest > 0 && m.deferReason) || null;
      if (rest > 0 && !reason) need({ why: 'reason', mark: m.id, n: rest });
      let set;
      if (m.castration) set = { castration: Object.assign({}, m.castration, { castrated: x.n, deferred: rest || 0 }, rest > 0 ? { deferReason: reason } : {}) };
      else set = { n: x.n, deferred: rest > 0 ? { n: rest, reason } : null };
      list.push({ target: m.id, set });
      changes.push({ kind: 'mark', mark: m.id, dose: m.dose, from: m.n, to: x.n, rest: Math.max(0, rest), reason, afterEnd: ended });
    }
  }
  for (const m of moves) {
    const x = (dr.moves || {})[m.id];
    if (!x) continue;
    const source = m.dir === 'out' ? id : m.other, legOther = m.dir === 'out' ? 'to' : 'from';
    if (x.void) {
      list.push({ target: m.id, void: true });
      changes.push({ kind: 'move_void', move: m.id, dir: m.dir, fromN: m.n, other: m.other, source, receiver: m.dir === 'out' ? m.other : id });
      continue;
    }
    const set = {};
    if (x.rows) { const untagged = m.n - (m.rows || []).length; set.rows = x.rows.slice(); set.n = x.rows.length + untagged; }
    else if (x.n != null && x.n !== m.n) set.n = x.n;
    if (x.to && x.to !== m.other) set[legOther] = x.to;
    if (!Object.keys(set).length || (set.n === m.n && !set[legOther] && JSON.stringify(set.rows || null) === JSON.stringify(m.rows || null))) continue;
    list.push({ target: m.id, set });
    changes.push({ kind: 'move', move: m.id, dir: m.dir, fromN: m.n, toN: set.n != null ? set.n : m.n, fromOther: m.other, toOther: set[legOther] || m.other, source, rows: set.rows || null });
  }
  const warnings = [];
  for (const r of rows) {
    const x = (dr.rows || {})[r.rowId];
    if (!x) continue;
    if (x.withdraw) {
      if (r.status === 'dead') need({ why: 'row_dead', rowId: r.rowId, tag: r.tag, notch: r.notch, death: r.deathEvent || null });
      list.push({ identity: { litter: id, op: 'withdraw', rowId: r.rowId } });
      changes.push({ kind: 'withdraw', rowId: r.rowId, tag: r.tag, notch: r.notch });
      continue;
    }
    const set = {};
    for (const k of Object.keys(x.set || {})) if ((x.set[k] ?? null) !== (r[k] ?? null)) set[k] = x.set[k];
    if (!Object.keys(set).length) continue;
    list.push({ identity: { litter: id, op: 'edit', rowId: r.rowId, set } });
    const before = {};
    for (const k of Object.keys(set)) before[k] = r[k] ?? null;
    changes.push({ kind: 'row', rowId: r.rowId, tag: r.tag, notch: r.notch, before, set });
    // a tag or notch typed to one another live record holds warns, as entry does (it never blocks)
    for (const k of ['tag', 'notch']) {
      if (!set[k]) continue;
      for (const X of Object.values(derived.litters)) for (const o of X.identity.rows) {
        if (o.litter !== X.id || o.rowId === r.rowId || (o.status !== 'alive' && o.status !== 'missing') || o[k] !== set[k]) continue;
        warnings.push({ rowId: r.rowId, field: k, value: set[k], litter: X.id, other: o.rowId, here: X.id === id });
      }
    }
  }
  for (const c of counts) {
    const x = (dr.counts || {})[c.id];
    if (!x) continue;
    if (x.void) { list.push({ target: c.id, void: true }); changes.push({ kind: 'count_void', count: c.id, from: c.observed }); }
    else if (x.observed != null && x.observed !== c.observed) {
      if (!isCount(x.observed)) { need({ why: 'bad_numbers', count: c.id }); continue; }
      list.push({ target: c.id, set: { observed: x.observed } });
      changes.push({ kind: 'count', count: c.id, from: c.observed, to: x.observed });
    }
  }
  if (dr.reopen && closed) {
    list.push({ target: closed.id, void: true });
    changes.push({ kind: 'reopen', k: closed.k });
  }

  let why = step ? step.why : null, whyDetail = step, after = null, flags = [], later = [];
  const event = list.length ? { type: 'correction', changes: list } : null;
  if (!why && event) {
    const st = stamp || {};
    const e = Object.assign({ id: st.id || '__edit', at: st.at || input.opts.today || null, who: st.who || null }, st.seen ? { seen: st.seen } : {}, event);
    const r = append(events, e, input.config, input.opts);
    if (!r.ok) {
      why = r.reason === 'correction_invalid' && r.detail ? r.detail.reason : r.reason;
      whyDetail = r.detail;
      if (r.reason === 'changes_later') later = r.detail.records;
    } else {
      after = r.derived;
      const had = new Set(derived.flags.map((f) => f.reason + ':' + f.events.join(',')));
      flags = after.flags.filter((f) => !had.has(f.reason + ':' + f.events.join(','))).map((f) => clone(f));
    }
  }
  // what each touched litter's alive does (a Move names both litters: `B06 2 → 1 · B08 gets 1 fewer`)
  const effects = {};
  if (after) {
    const ids = new Set([id]);
    for (const c of changes) { if (c.to) ids.add(c.to); if (c.fromOther) ids.add(c.fromOther); if (c.toOther) ids.add(c.toOther); if (c.other) ids.add(c.other); }
    for (const c of ids) if (derived.litters[c] && after.litters[c]) effects[c] = [derived.litters[c].alive, after.litters[c].alive];
  }
  const A = after ? after.litters[id] : null;
  return {
    litter: id, marks, rows, moves, counts, closed, targets, crates, ended,
    changes, step, why, whyDetail, later, warnings,
    events: why || !event ? null : [event],
    afterEnd: ended && !!event,
    flags, effects,
    after: A ? { alive: A.alive, owed: Object.fromEntries(Object.entries(A.doses).map(([k, v]) => [k, v.owed])), notDone: Object.fromEntries(Object.entries(A.doses).map(([k, v]) => [k, v.notDoneAfterEnd])) } : null
  };
}

/* Where a tag or notch is held now (rows alive or missing), except in one litter: the lookup a
   page runs on a value being typed, before it is a row. */
function findId(derived, id, exceptLitter) {
  const out = [];
  for (const L of Object.values(derived.litters)) {
    if (L.id === exceptLitter) continue;
    for (const r of L.identity.rows) {
      if (r.litter !== L.id || (r.status !== 'alive' && r.status !== 'missing')) continue;
      if ((id.tag && r.tag === id.tag) || (id.notch && r.notch === id.notch)) out.push({ litter: L.id, rowId: r.rowId, status: r.status });
    }
  }
  return out;
}

export const select = { findId, room: roomSelect, litter: litterSelect, deathDraft: deathDraftSelect, moveDraft: moveDraftSelect, end: endSelect, bulkDraft: bulkDraftSelect, countDraft: countDraftSelect, explain: explainSelect, counts: countsSelect, record: recordSelect, edit: editSelect };
export const PPLedger = { derive, append, balances, dayNumber, select };
export default PPLedger;
if (typeof window !== 'undefined') window.PPLedger = PPLedger;
