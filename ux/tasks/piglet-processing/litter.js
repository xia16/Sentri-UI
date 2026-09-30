/* Piglet processing · the litter drawer (RULINGS round 5): a litter opens as a drawer over the room, like a sow in
   farrowing. One TaskSheet (ADR 0003) with three views that replace each other in the same drawer:
     litter   the litter summary (facts, View log ›), the tools (Edit · Record dead · Set count · Move), what it owes as
              rows, then what was recorded, what is later, and the Record group; footer: Back alone
     dose     a treatment (a dose, arrivals of unknown treatment, a range to check on the pig): Back returns to the litter
     weight   the birth litter weight (only when missing), a Measure and the docked Numpad
   Litters outside the task, before the farrowing lock, orphans and nurse sows are this same drawer; only what it can
   record differs (edge.html and litter.html forward here).
   Hosted by room.html: `PPLitter(host)` returns the drawer; the host renders it over the room (inert behind it), owns the
   URL (`room.html?state=litter&crate=<X>[&dose=<id>]`) and history, and hands it every click. Every figure is the
   ledger's (select.litter over the shared log); drafts are validated by the same replay `append` runs. */
(function () {
  'use strict';
  window.PPLitter = function (host) {
    var UI = window.SentriUI, U = window.PPUI, K = window.SentriTask;
    var zh = PP.lang === 'zh';
    var store, CFG, SOW, TODAY, crate = '';
    var visit = {};                         // record ids this phone made this visit
    var receipt = null;                     // { kind, dose, rec, other, now, undo } | { kind: 'handoff', parts } | { kind: 'weight', … }
    var drawer = null;                      // the open treatment's draft: { kind: dose|resolve|range, key, dose, … }
    var drafts = {};                        // Back keeps a treatment's draft on the device, per key
    var weightView = null;                  // the birth-weight view: { draft, pad, hint }
    var lastCommit = 0, drawerOpenedAt = 0, ceilTap = '';

    /* ---- the ledger ---- */
    function L() { return store.derived.litters[crate]; }
    function view(extra) { return store.select.litter(store.derived, crate, Object.assign({ stamp: { who: PP.me } }, extra || {})); }
    function doseCfg(id) { return CFG.doses.filter(function (d) { return d.id === id; })[0]; }
    function D(id) { return L().doses[id]; }
    function owedOf(id) { return D(id).owed; }
    function isDone(id) { var x = D(id); return x.owed === 0 && x.unknownAfterMove === 0; }
    function recordOf(id) {
      var out = null;
      Object.keys(L().doses).forEach(function (k) { L().doses[k].records.forEach(function (r) { if (r.id === id) out = r; }); });
      return out;
    }
    function rawEvent(id) { return store.events.filter(function (e) { return e.id === id; })[0] || null; }
    function visitRec(id) { var rs = D(id).records.filter(function (r) { return visit[r.id]; }); return rs[rs.length - 1] || null; }
    function unknownGroups(id) { return (D(id).unknownGroups || []).filter(function (g) { return g.n > 0; }); }
    function endedTask() { return (store.derived.tasks || []).filter(function (t) { return t.ended && t.litters.indexOf(crate) >= 0; })[0] || null; }
    function tagOf(rowId) { var r = (L().identity.rows || []).filter(function (x) { return x.rowId === rowId; })[0]; return r ? r.tag || r.notch : null; }
    function locked() { return L().phase === 'locked'; }

    /* ---- strings ---- */
    function P(id, args, tone) { return { text: PP.t(id, args), tone: tone || undefined, strs: { text: id }, args: args ? { text: args } : undefined }; }
    function S(id, args, tone) { return { text: PP.t(id, args), str: id, args: args || undefined, tone: tone || undefined }; }
    var one = PP.one;
    var pigs = function (n) { return PP.tn('pp.common.unit.piglet', n); };
    function btn(o) { return UI.button(Object.assign({ label: PP.t(o.id, o.args) }, o, { id: o.elId || '', strs: { label: o.id }, args: o.args ? { label: o.args } : undefined })); }
    function title(id) { var d = doseCfg(id); return d.tx === 'iron' ? ['pp.litter.tx_day', { tx: PP.t('pp.common.tx.iron'), d: d.due }] : ['pp.common.tx.' + d.tx, null]; }
    function titleText(id) { var t = title(id); return PP.t(t[0], t[1]); }
    function titleTok(id) { var t = title(id); return [P(t[0], t[1])]; }
    function lower(s) { return zh ? s : s.charAt(0).toLowerCase() + s.slice(1); }
    function stampText(at, who) { return U.stamp(at, who, TODAY); }
    function reasonName(k) { return PP.t('pp.litter.why.' + k); }
    function section(titleId, rows, o) {
      o = o || {};
      return '<section class="pp-group" data-ds="Section">' + UI.heading(Object.assign({ title: '', kind: 'section', level: 3, strs: Object.assign({ title: titleId }, o.metaId ? { meta: o.metaId } : {}),
        args: o.metaArgs ? { meta: o.metaArgs } : undefined }, o.metaId ? { meta: '' } : {}, o.action ? { action: o.action } : {})) + UI.rowGroup(rows) + '</section>';
    }
    function castrLine(c) {
      var not = [], k = 0;
      ['hernia', 'cryptorchid', 'deferred', 'kept'].forEach(function (x) { if (c[x]) { not.push([x, c[x]]); k += c[x]; } });
      if (!c.castrated && !k) return PP.t('pp.litter.castr.none_line');
      var label = function (x) { return x === 'deferred' && c.deferReason ? PP.t('pp.litter.castr.deferred_why', { reason: reasonName(c.deferReason) }) : reasonName(x); };
      not = not.length === 1 ? [label(not[0][0])] : not.map(function (p) { return PP.t('pp.litter.castr.part', { n: p[1], reason: label(p[0]) }); });
      return k ? PP.t('pp.litter.castr.line', { c: c.castrated, k: k, why: not.join(zh ? '，' : ', ') }) : PP.t('pp.litter.castr.line_all', { c: c.castrated });
    }
    function deferTok(r, tone) {
      var by = r.deferBy;
      if (by && by.weak && by.sick) return P('pp.litter.def.split', { k: r.deferred, w: by.weak, s: by.sick }, tone);
      return P('pp.common.mark.deferred', { k: r.deferred, reason: reasonName(r.deferReason || 'deferred') }, tone);
    }
    /* A record's evidence line, printed from the record (its product snapshot); a corrected figure is amber with what it was (R1-28). */
    function evidence(r) {
      var tone = r.corrected || r.viaCorrection ? 'amber' : null, out = [P(r.at && r.at.slice(0, 10) === TODAY.slice(0, 10) ? 'pp.common.stamp.today' : 'pp.common.stamp.date', { date: U.date(r.at), t: U.time(r.at), who: r.who })];
      if (r.castration) out.push(P('pp.litter.done.what', { what: castrLine(r.castration) }, tone));
      else if (r.target === 'unknown') out.push(P('pp.litter.done.arrived_n', { pigs: pigs(r.n) }, tone));
      else if (!r.n && r.deferred) out.push(P('pp.litter.done.none_treated', null, tone));
      else out.push(P(one('pp.common.unit.piglet', r.n), { n: r.n }, tone));
      if (!r.castration && r.deferred && r.deferReason === 'not_done') out.push(P('pp.common.mark.not_done', { k: r.deferred }, tone));
      else if (!r.castration && r.deferred) out.push(deferTok(r, tone));
      if (!r.castration && r.product) out.push(P('pp.litter.product.' + r.product));
      if (r.corrected) {
        var ev = rawEvent(r.id), was = ev ? (ev.castration ? ev.castration.castrated : ev.n) : null, now = r.castration ? r.castration.castrated : r.n;
        out.push(was != null && was !== now ? P('pp.litter.rec.was', { n: was }, 'amber') : P('pp.litter.rec.corrected', null, 'amber'));
      }
      if (r.viaCorrection && r.from) out.push(P('pp.litter.rec.from', { code: r.from }, 'amber'));
      return out;
    }
    function collided(r) { return D(r.dose).possibleDoubleTreatment.some(function (p) { return p.indexOf(r.id) >= 0; }); }
    function twice(r) { return (D(r.dose).doubles || []).some(function (x) { return x.answer === 'twice' && x.records.indexOf(r.id) >= 0; }); }
    function recTag(r) {
      if (collided(r)) return P('pp.litter.flag.double_short', null, 'amber');
      if (twice(r)) return P('pp.litter.tag.twice', null, 'amber');
      if (r.timing === 'after_window') return P('pp.litter.tag.after', { d: doseCfg(r.dose).last });
      if (r.timing === 'early') return P('pp.litter.tag.early');
      if (r.timing === 'late') return P('pp.litter.tag.late');
      return null;
    }
    function evidenceRow(r) {
      var tag = recTag(r), desc = evidence(r);
      if (tag) desc.push(tag);
      return UI.row({ title: titleTok(r.dose), description: desc, wrap: true, trail: 'edit', action: 'open-edit', value: r.id });
    }

    /* ---- the drawer head: the crate, then who the litter is (the sow, parity, day) and the one status that changes what
       it can record (sow died · farrowing not locked · not in the task · task ended) ---- */
    function subtitle() {
      var x = L(), parts = [S('pp.litter.sub', { sow: SOW.sow, p: SOW.parity, d: x.dayAge })];
      var st = null;
      if (x.sowDied) st = S('pp.room.chip.sowdied', null, 'red');
      else if (x.phase === 'open') st = S('pp.room.chip.unlocked', null, 'amber');
      else if (!x.recordable) st = S('pp.room.l1.none');
      else if (endedTask()) st = S('pp.room.ended.title');
      if (st) parts.push({ sep: true }, st);
      return parts;
    }

    /* ---- the litter summary (farrowing's `Litter summary · View log ›` over a facts panel): the ledger identity — Born,
       Alive, Dead, and every other term when it is not zero (R1-10); a nurse sow's line and her earlier litter; the birth
       litter weight once set ---- */
    function summary() {
      var b = view().balance, x = L(), items = [];
      var f = function (label, value, meta) { return { label: '', value: '', strs: Object.assign({ label: label[0], value: value[0] }, meta ? { meta: meta[0] } : {}), args: Object.assign({ label: label[1], value: value[1] }, meta ? { meta: meta[1] } : {}) }; };
      var n = function (v) { return ['ds.field.figure', { n: v }]; };
      // Before the lock Born is not final: Alive and Dead only (farrowing owns the count).
      if (locked() && (b.born || !b.earlier)) items.push(f(['label.born'], n(b.born), x.endedBySowDeath ? ['pp.edge.born.derived'] : null));
      items.push(f(['label.alive'], n(b.alive)));
      items.push(f(['label.dead'], n(b.dead)));
      if (b.movedIn) items.push(f(['pp.edge.fact.in'], n(b.movedIn)));
      if (b.movedOut) items.push(f(['pp.edge.fact.out'], n(b.movedOut)));
      if (b.weaned) items.push(f(['pp.edge.fact.weaned'], n(b.weaned)));
      if (b.loss) items.push(f(['pp.edge.fact.loss'], n(b.loss)));
      if (b.gain) items.push(f(['pp.edge.fact.gain'], n(b.gain)));
      var nu = view().nurse, e = view().earlier;
      if (nu) items.push(f(['pp.litter.fact.nurse'], ['pp.litter.fact.nurse_from', { code: nu.from }]));
      if (e) items.push(f(['pp.litter.nurse.earlier'], ['pp.litter.fact.earlier', { b: e.born, d: e.dead, w: e.weaned }]));
      if (SOW.weight) items.push(f(['pp.common.weight.title'], ['pp.common.kg', { w: SOW.weight.kg }]));
      var log = '<button type="button" class="st-heading-link" data-action="open-record" data-value="' + U.esc(crate) + '">' + U.span('pp.litter.view_log') + window.SentriIcons.icon('chevron') + '</button>';
      return '<section class="lt-summary">' + UI.heading({ title: '', kind: 'section', level: 3, icon: window.SentriIcons.icon('record'), action: log, strs: { title: 'pp.litter.summary' } }) +
        UI.facts(items, { columns: 3 }) + '</section>';
    }

    /* ---- the tools (farrowing's tool row): Edit · Record dead · Set count · Move. Before the lock the farrowing sheet owns
       deaths and the count, and Move waits for the lock (Q13): no tools, a door to farrowing instead. A draft another page
       keeps on this phone is said inside its tool. ---- */
    function keptKey(k) { return 'pp-' + k + '-draft:' + store.name + ':' + crate; }
    function kept(k) { try { return JSON.parse(sessionStorage.getItem(keptKey(k)) || 'null'); } catch (e) { return null; } }
    function deadKept() {
      var d = kept('dead');
      if (!d) return null;
      var n = 0;
      if (d.pig) { Object.keys(d.pig.tallies || {}).forEach(function (c) { n += d.pig.tallies[c] || 0; }); n += Object.keys(d.pig.picks || {}).length; }
      return n ? ['pp.litter.tool.dead_n', { n: n }] : d.sow || d.pig ? ['pp.litter.tool.dead_draft', null] : null;
    }
    function hasRecords() { return Object.keys(L().doses).some(function (k) { return L().doses[k].records.length; }) || (L().identity.rows || []).length > 0; }
    function tools() {
      if (!locked()) return '';
      var ck = kept('count'), list = [];
      if (L().recordable || hasRecords()) list.push({ action: 'open-edit', value: crate, icon: 'edit', label: 'act.edit' });
      list.push({ action: 'open-dead', value: crate, icon: 'alert', label: 'act.record_dead', kept: deadKept() });
      list.push({ action: 'open-count', value: crate, icon: 'check', label: 'pp.count.title', kept: ck && ck.observed != null ? ['pp.litter.tool.count_n', { n: ck.observed }] : null });
      list.push({ action: 'open-move', value: crate, icon: 'transfer', label: 'pp.move.title' });
      return U.toolRow(list, { label: 'pp.litter.tools' });
    }
    function prelockDoor() {
      return '<div class="lt-doors">' + K.door({ title: S('pp.edge.prelock.door'), description: S('pp.edge.prelock.door_desc'), action: 'open-farrowing', value: SOW.sow }) + '</div>';
    }

    /* ---- owed today ---- */
    function whenTok(g) {
      if (g.status === 'later') return P(one('pp.litter.when.in', g.inDays), { n: g.inDays });
      if (g.status === 'late') return [P('pp.litter.tag.late'), P(one('pp.litter.days', g.lateBy), { k: g.lateBy }, 'red')];
      if (g.status === 'missed') return P('pp.litter.when.missed');
      return P('pp.litter.when.today');
    }
    function groupToks(g) {
      var tags = (g.rows || []).map(tagOf).filter(Boolean);
      var who = g.kind === 'own' ? P('pp.litter.grp.own', { k: g.n }) : tags.length && tags.length <= 3 ? P('pp.litter.grp.from_tags', { k: g.n, code: g.from, tags: tags.join(', ') }) : P('pp.litter.grp.from', { k: g.n, code: g.from });
      return [who, P('pp.litter.grp.day', { d: g.dayAge }), whenTok(g)];
    }
    function agesDiffer(gs) { return gs.some(function (g) { return g.dayAge !== gs[0].dayAge; }); }
    function hasDraft(id) { return !!(drafts[id] || drafts['range:' + id]); }
    function showGroups(o) { return agesDiffer(o.groups); }
    function arrivalToks(gs) { return gs.filter(function (g) { return g.kind !== 'own'; }).map(function (g) { return groupToks(g)[0]; }); }
    function splitNow(o) { return !doseCfg(o.dose).castration && o.owed != null && o.owedNow < o.owed && o.owedNow > 0; }
    function owedToks(o) {
      var t = [], castrate = doseCfg(o.dose).castration;
      if (hasDraft(o.dose)) return [P('status.unsaved', { n: 1 }, 'green')];
      if (o.status === 'due' && !showGroups(o)) t.push(P('pp.litter.due', { d: o.due }));
      if (o.status === 'late' && !showGroups(o)) t.push([P('pp.litter.tag.late'), P(one('pp.litter.days', o.lateBy), { k: o.lateBy }, 'red')]);
      if (o.status === 'missed') t.push([P('pp.litter.missed_word'), P('pp.litter.missed_day', { d: o.missedAfter }, 'red')]);
      if (o.range) {
        t.push(P('pp.litter.range', { lo: o.range.lo, hi: o.range.hi, of: o.range.of }, 'amber'));
        o.range.doubt.forEach(function (x) { t.push(P('pp.litter.range.doubt', { n: x.n, to: x.to })); });
        return t;
      }
      if (o.owed && o.deferred && o.deferReason && o.deferReason !== 'not_due') t.push(P(castrate ? one('pp.litter.owed_males_reason', o.owed) : 'pp.litter.owed_reason', { n: o.owed, reason: reasonName(o.deferReason) }));
      else if (o.males === 'uncounted') t.push(P('pp.common.males_uncounted'));
      else if (splitNow(o)) t.push(P('pp.litter.owed_now', { n: o.owedNow, of: o.owed }));
      else if (o.owed != null) t.push(P(castrate ? one('pp.litter.castr.owed', o.owed) : 'pp.litter.owed', { n: o.owed }));
      if (showGroups(o)) o.groups.forEach(function (g) { t = t.concat(groupToks(g)); });
      else t = t.concat(arrivalToks(o.groups));
      return t;
    }
    function tapN(o) { return splitNow(o) ? o.owedNow : o.oneTap; }
    var resumeWord = function () { return { text: PP.t('pp.litter.act.resume'), strs: { text: 'pp.litter.act.resume' } }; };
    function txRow(o) {
      var n = tapN(o);
      // A litter outside the task records no treatment: what it owes is a fact, never a door (Q18).
      if (!L().recordable) return UI.row({ title: titleTok(o.dose), description: [P('pp.litter.notask.owed', { n: o.owed })], wrap: true });
      if (o.males === 'uncounted' || o.status === 'missed' || o.range || !n) {
        return UI.row({ title: titleTok(o.dose), description: owedToks(o), wrap: true, action: 'open-dose', value: o.dose, trailing: hasDraft(o.dose) ? resumeWord() : '' });
      }
      var act = hasDraft(o.dose) ? { label: PP.t('pp.litter.act.resume'), action: 'open-dose', value: o.dose, strs: { label: 'pp.litter.act.resume' } }
        : { label: PP.t(one('pp.litter.act.record_n', n), { n: n }), action: 'record', value: o.dose, attrs: { 'data-n': n }, strs: { label: one('pp.litter.act.record_n', n) }, args: { label: { n: n } } };
      return UI.rowAction({ id: 'lt-tx-' + o.dose, title: titleTok(o.dose), description: owedToks(o), wrap: true, action: 'open-dose', value: o.dose, act: act });
    }
    function unknownRows(id, o) {
      var d = doseCfg(id);
      return unknownGroups(id).map(function (g) {
        var key = 'res:' + g.id + ':' + id, tags = (g.rows || []).map(tagOf).filter(Boolean);
        var who = tags.length && tags.length <= 3 ? P('pp.litter.grp.from_tags', { k: g.n, code: g.from, tags: tags.join(', ') }) : P('pp.litter.grp.from', { k: g.n, code: g.from });
        var desc = drafts[key] ? [P('status.unsaved', { n: 1 }, 'green')] : [who, d.visible ? P('pp.litter.arr.check', null, 'amber') : P('pp.litter.arr.unknown', null, 'amber')];
        if (o && o.status === 'late' && !drafts[key]) desc.push([P('pp.litter.tag.late'), P(one('pp.litter.days', o.lateBy), { k: o.lateBy }, 'red')]);
        return UI.row({ title: titleTok(id), description: desc, wrap: true, action: 'open-resolve', value: g.id + ':' + id, trailing: drafts[key] ? resumeWord() : '' });
      }).join('');
    }
    function identityRow() {
      var x = view().identityDue;
      if (x.status !== 'due' && x.status !== 'late') return '';
      var scheme = PP.t('pp.litter.id.scheme.' + x.scheme), t = [];
      if (x.who === 'candidates') t.push(P('pp.litter.id.keepers', { k: x.identified }));
      else t.push(P('pp.litter.id.owed', { n: x.owed }));
      if (x.status === 'due') t.push(P('pp.litter.due', { d: x.day }));
      else t.push([P('pp.litter.tag.late'), P(one('pp.litter.days', x.lateBy), { k: x.lateBy }, 'red')]);
      return UI.row({ title: [P('pp.litter.id.title', { scheme: scheme })], description: t, wrap: true, action: 'open-identity', value: crate });
    }
    function owedRows() {
      var v = view(), byDose = {};
      v.owed.forEach(function (o) { byDose[o.dose] = o; });
      // Nothing moves under the thumb: a dose recorded this visit keeps its place and turns into its stamp.
      return CFG.doses.filter(function (d) { return D(d.id).status && D(d.id).status !== 'later'; }).map(function (d) {
        var r = visitRec(d.id);
        if (r && isDone(d.id)) return evidenceRow(r);
        var o = byDose[d.id], only = o && o.owed === 0 && !o.range && unknownGroups(d.id).length;
        if (!L().recordable && (!o || !o.owed)) return '';
        return (o && !only ? txRow(o) : '') + (L().recordable ? unknownRows(d.id, only ? o : null) : '');
      }).join('') + (L().recordable ? identityRow() : '');
    }
    function owedSection() {
      var v = view(), left = v.dosesLeft.left, missed = v.unfinished.missed;
      var rows = owedRows();
      if (!L().recordable) return rows ? section('pp.edge.section.owed', rows) : '';
      var meta = left ? (missed ? 'pp.litter.owed.meta_missed' : 'pp.litter.owed.meta') : missed ? 'pp.litter.owed.missed_only' : null;
      if (!left && !missed && !identityRow()) {
        var next = laterItems()[0];
        rows += UI.row({ title: [P('pp.litter.owed.none')], description: next ? [P(next.inDays === 1 ? 'pp.litter.next.tomorrow' : 'pp.litter.next.in', { tx: lower(next.label), k: next.inDays })] : '' });
      }
      return section('pp.litter.section.owed', rows, { metaId: meta, metaArgs: { left: left, total: v.dosesLeft.total, m: missed } });
    }
    function closedSection() {
      var b = view().balance;
      return section('pp.litter.section.closed', UI.row({ title: [P('pp.litter.closed.title')], description: [P('pp.litter.closed.desc', { out: b.movedOut, w: b.weaned })], wrap: true }));
    }
    function endedSection(T) {
      var items = ((T.ended.snapshot || {}).byLitter || {})[crate] || [];
      var rows = items.map(function (x) {
        var id = x.kind === 'missed' ? 'pp.litter.end.missed' : x.kind === 'not_due' ? 'pp.litter.end.not_due' : 'pp.litter.end.owed';
        return UI.row({ title: titleTok(x.dose), description: [P(id, { n: x.n })], wrap: true });
      }).join('') || UI.row({ title: [P('pp.litter.end.none')] });
      return '<section class="pp-group" data-ds="Section">' + UI.heading({ title: '', description: '', kind: 'section', level: 3,
        strs: { title: 'pp.litter.section.ended', description: 'pp.litter.end.meta' }, args: { description: { stamp: stampText(T.ended.at, T.ended.who) } } }) + UI.rowGroup(rows) + '</section>';
    }

    /* ---- what this litter holds for review (R1-22), each a door to where it is answered ---- */
    function reviewItems() { return store.select.reviews(store.derived, {}).items.filter(function (x) { return x.litter === crate; }); }
    function reviewRow(x) {
      var t, d = [];
      if (x.kind === 'double') {
        var recs = x.records.map(recordOf).filter(Boolean);
        t = [P('pp.litter.review.double', { tx: titleText(x.dose) })];
        recs.forEach(function (r) { d.push(P('pp.litter.review.rec', { stamp: stampText(r.at, r.who), pigs: pigs(r.n) })); });
        d.push(P('pp.litter.review.double_q'));
      } else if (x.kind === 'held') {
        t = [P('pp.litter.review.held')];
        d.push(P('pp.litter.review.held_desc', { stamp: stampText(x.at, x.who), dead: L().dead.total, alive: L().alive }));
      } else if (x.kind === 'count') {
        t = [P('pp.litter.review.count')];
        x.counts.forEach(function (c) { d.push(P('pp.litter.review.count_one', { who: c.who, t: U.time(c.at), pigs: pigs(c.observed) })); });
        d.push(P('pp.litter.review.count_q'));
      } else {
        t = [P('pp.litter.review.correction')];
        d.push(P('pp.litter.review.correction_q'));
      }
      if (x.status === 'unresolved_at_end') d.push(P('pp.litter.review.at_end', null, 'amber'));
      return UI.row({ title: t, description: d, wrap: true, action: 'open-review', value: x.id });
    }
    function reviewSection() {
      var xs = reviewItems();
      if (!xs.length) return '';
      return section('pp.litter.section.review', xs.map(reviewRow).join(''), { metaId: 'pp.litter.review.meta', metaArgs: { n: xs.length } });
    }

    /* ---- what a count left open (RULINGS round 2: every open gain or loss stays open, one by one, until a body or a Move):
       one row per line — its size, and the Move the app ranks first (a suggestion, never proof) or the count's stamp;
       the doors (the suggestions, a body, a new count, Edit) are one level down, on Explain ---- */
    function unexplainedSection() {
      var lines = store.select.explain(store.derived, { litter: crate }, { who: PP.me }).lines;
      if (!lines.length) return '';
      var rows = lines.map(function (l) {
        var t = [P('pp.count.line.' + l.kind + (l.open < l.qty ? '_part' : ''), { np: pigs(l.open), qp: pigs(l.qty) })], d, sg = l.suggestions[0];
        // round 4: a counted gain owes nothing new — the worker checks on the pig
        var g = l.kind === 'gain' ? L().unexplained.gains.filter(function (x) { return x.id === l.id; })[0] : null;
        if (g && g.check) d = [P('pp.count.line.check')];
        else if (sg) {
          var left = sg.left, eff = !left.loss && !left.gain ? PP.t('pp.count.sug.both') : left.loss ? PP.t('pp.count.sug.gain_closes', { kp: pigs(left.loss) }) : PP.t('pp.count.sug.loss_closes', { kp: pigs(left.gain) });
          d = [P((sg.kind === 'gain' ? 'pp.count.sug.gained' : 'pp.count.sug.lost') + (sg.room !== l.room ? '_unit' : ''), { code: sg.litter, np: pigs(sg.open), u: sg.room }), P('pp.count.sug.desc', { effect: eff })];
        } else d = [P('pp.count.line.stamp', { op: pigs(l.observed), stamp: stampText(l.at, l.who), wp: pigs(l.sizedAgainst) })];
        return UI.row({ title: t, description: d, wrap: true, action: 'open-explain', value: crate });
      });
      return section('pp.count.open.title', rows.join(''));
    }

    /* ---- the receipt: what the last record on this phone changed, one line at the top of the drawer (Undo on a one-tap) ---- */
    function receiptLine() {
      if (!receipt) return '';
      var parts;
      if (receipt.kind === 'correction') parts = [{ id: 'pp.common.saved_correction' }];
      else if (receipt.kind === 'handoff') parts = receipt.parts;
      else if (receipt.kind === 'weight') parts = receipt.out ? [{ id: 'pp.edge.weight.receipt_range', args: { w: receipt.w, min: receipt.min, max: receipt.max }, tone: 'amber' }] : [{ id: 'pp.edge.weight.receipt', args: { w: receipt.w } }];
      else {
        var id = receipt.dose, tx = lower(titleText(id)), r = receipt.rec, k = receipt.kind;
        if (k === 'already') parts = [{ id: 'pp.litter.rcpt.already', args: { tx: tx, t: U.time(receipt.other.at), who: receipt.other.who } }, { id: 'pp.litter.rcpt.nothing' }];
        else if (k === 'stale' && receipt.other) parts = [{ id: 'pp.litter.rcpt.stale', args: { tx: tx, t: U.time(receipt.other.at), who: receipt.other.who, m: receipt.other.n } }, { id: 'pp.litter.rcpt.now_owed', args: { n: receipt.now }, tone: 'amber' }];
        else if (k === 'stale') parts = [{ id: 'pp.litter.rcpt.changed', args: { tx: tx } }, { id: 'pp.litter.rcpt.now_owed', args: { n: receipt.now }, tone: 'amber' }];
        else if (k === 'undone') parts = [{ id: 'pp.litter.rcpt.undone', args: { tx: tx } }, { id: one('pp.litter.rcpt.undone_n', receipt.n), args: { n: receipt.n }, tone: 'amber' }];
        else if (k === 'resolved') {
          parts = [{ id: 'pp.litter.rcpt.saved', args: { tx: tx } }];
          if (receipt.had) parts.push({ id: 'pp.litter.rcpt.had', args: { k: receipt.had }, tone: 'green' });
          if (receipt.rec) parts.push({ id: 'pp.litter.rcpt.now_rec', args: { k: receipt.rec }, tone: 'green' });
          if (receipt.left) parts.push({ id: 'pp.litter.rcpt.left', args: { k: receipt.left }, tone: 'amber' });
          if (!receipt.had && !receipt.rec && !receipt.left) parts.push({ id: 'pp.litter.rcpt.none_owe', tone: 'green' });
        } else if (r.castration) {
          var c = r.castration, not = (c.hernia || 0) + (c.cryptorchid || 0) + (c.deferred || 0) + (c.kept || 0);
          parts = [{ id: 'pp.litter.rcpt.saved', args: { tx: tx } }];
          if (!c.castrated && !not) parts.push({ id: 'pp.litter.castr.none_line', tone: 'green' });
          else { parts.push({ id: 'pp.litter.rcpt.castrated', args: { c: c.castrated }, tone: 'green' }); if (not) parts.push({ id: 'pp.litter.rcpt.not_castrated', args: { k: not } }); }
        } else {
          parts = [{ id: 'pp.litter.rcpt.saved', args: { tx: tx } }];
          if (r.n) parts.push({ id: one('pp.common.unit.piglet', r.n), args: { n: r.n }, tone: 'green' });
          else parts.push({ id: 'pp.litter.rcpt.none_treated' });
          if (r.deferred && r.deferReason === 'not_due') parts.push({ id: 'pp.litter.rcpt.not_due', args: { k: r.deferred } });
          else if (r.deferred) parts.push({ id: 'pp.litter.rcpt.deferred', args: { k: r.deferred } });
          if (r.timing === 'late' || r.timing === 'after_window') parts.push({ id: 'pp.litter.rcpt.late' });
          if (r.timing === 'early') parts.push({ id: 'pp.litter.rcpt.early' });
        }
      }
      var undo = receipt.undo && recordOf(receipt.undo) ? btn({ id: 'pp.litter.act.undo', register: 'text', action: 'undo', value: receipt.undo }) : '';
      return '<div class="lt-receipt" id="lt-receipt">' + U.receipt(parts) + undo + '</div>';
    }

    /* ---- recorded, notes, after End, later ---- */
    function inPlace(r) { return visit[r.id] && isDone(r.dose) && D(r.dose).status !== 'later'; }
    function identityDoneRow() {
      var x = view().identityDue, I = L().identity;
      if (x.scheme === 'none' || (!x.identified && !I.closed)) return '';
      if (x.status !== 'done' && x.status !== 'later' && x.who !== 'candidates') return '';
      var scheme = PP.t('pp.litter.id.scheme.' + x.scheme);
      var d = x.who === 'candidates' ? (I.closed ? P('pp.litter.id.closed', { k: x.identified }) : P('pp.litter.id.keepers', { k: x.identified })) : P('pp.litter.id.done', { k: x.identified, n: x.of });
      return UI.row({ title: [P('pp.litter.id.title', { scheme: scheme })], description: [d], wrap: true, action: 'open-identity', value: crate });
    }
    function recordedSection() {
      var all = [];
      view().recorded.forEach(function (g) { g.records.forEach(function (r) { all.push(r); }); });
      var idRow = identityDoneRow();
      if (!all.length && !idRow) return '';
      var xs = all.filter(function (r) { return !inPlace(r); }).sort(function (a, b) { return a.at < b.at ? 1 : a.at > b.at ? -1 : 0; });
      var rows = xs.map(evidenceRow).join('') + idRow;
      view().recorded.forEach(function (g) { (g.doubleDoses || []).forEach(function (x) {
        rows += UI.row({ title: titleTok(g.dose), description: [P('pp.litter.twice.line', { stamp: stampText(x.at, x.who) }, 'amber')], wrap: true });
      }); });
      return rows ? section('pp.litter.section.recorded', rows) : '';
    }
    function notesSection() {
      var rows = view().notes.map(function (n) {
        var r = recordOf(n.event) || { at: n.at, who: '' };
        return UI.row({ title: [P('pp.litter.reason.' + n.kind)], description: [P('pp.litter.note.line', { pigs: pigs(n.n), stamp: stampText(r.at, r.who) })], wrap: true, action: 'open-identity', value: crate });
      });
      return rows.length ? section('pp.litter.section.notes', rows.join('')) : '';
    }
    function afterEndSection() {
      var v = view(), rows = [];
      v.afterEnd.forEach(function (x) {
        rows.push(UI.row({ title: titleTok(x.dose), description: [P('pp.litter.after_end.line', { pigs: pigs(x.n), stamp: stampText(x.at, x.who) }), P('pp.litter.after_end.tag')], wrap: true }));
      });
      v.correctedAfterEnd.forEach(function (x) { rows.push(UI.row({ title: titleTok(x.dose), description: [P('pp.edit.ch.not_done', { k: x.n })], wrap: true })); });
      return rows.length ? section('pp.litter.sec.after_end', rows.join('')) : '';
    }
    function laterItems() {
      var out = view().later.filter(function (x) { return !isDone(x.dose); }).map(function (x) {
        var g = D(x.dose).groups || [], ins = g.filter(function (y) { return y.status === 'later'; }).map(function (y) { return y.inDays; });
        return { dose: x.dose, due: x.due, inDays: ins.length ? Math.min.apply(null, ins) : x.inDays, label: titleText(x.dose) };
      });
      var id = view().identityDue;
      if (id.status === 'later') out.push({ identity: true, due: id.day, inDays: id.inDays, label: PP.t('pp.litter.id.title', { scheme: PP.t('pp.litter.id.scheme.' + id.scheme) }) });
      return out.sort(function (a, b) { return a.inDays - b.inDays; });
    }
    function laterSection() {
      var xs = laterItems();
      if (!xs.length || !L().recordable) return '';
      var rows = xs.map(function (x) {
        if (x.identity) return UI.row({ title: [P('pp.litter.id.title', { scheme: PP.t('pp.litter.id.scheme.' + view().identityDue.scheme) })], description: [P(x.inDays === 1 ? 'pp.litter.later.tomorrow' : 'pp.litter.later.in', { d: x.due, k: x.inDays })], action: 'open-identity', value: crate });
        var Dx = D(x.dose), t = [];
        if (drafts[x.dose]) t.push(P('status.unsaved', { n: 1 }, 'green'));
        else if (Dx.groups && agesDiffer(Dx.groups)) Dx.groups.forEach(function (g) { t = t.concat(groupToks(g)); });
        else {
          if (Dx.records.length && Dx.owed && !arrivalToks(Dx.groups || []).length) t.push(P(doseCfg(x.dose).castration ? one('pp.litter.castr.owed', Dx.owed) : 'pp.litter.owed', { n: Dx.owed }));
          t = t.concat(arrivalToks(Dx.groups || []));
          t.push(P(x.inDays === 1 ? 'pp.litter.later.tomorrow' : 'pp.litter.later.in', { d: x.due, k: x.inDays }));
        }
        return UI.row({ title: titleTok(x.dose), description: t, wrap: true, action: 'open-dose', value: x.dose });
      });
      return section('pp.litter.section.later', rows.join(''));
    }
    /* ---- the Record group: identity (its page) and the birth litter weight while it is missing ---- */
    function recordGroup() {
      if (!locked()) return '';
      var idc = CFG.identity, id = view().identityDue, rows = '';
      if (idc.scheme !== 'none' && (L().alive || id.identified)) {
        var line = idc.who === 'candidates' ? (L().identity.closed ? ['pp.litter.id.rg_closed', { k: id.identified }] : ['pp.common.record.id_line.candidates', { k: id.identified }])
          : ['pp.common.record.id_line.' + idc.scheme, { k: id.identified, n: L().alive }];
        var ik = kept('id');
        if (ik && (ik.run || ik.lw)) line = [ik.run ? 'pp.litter.id.draft_run' : 'pp.litter.id.draft_lw', null];
        rows += K.door({ title: S('pp.common.record.identity'), description: S(line[0], line[1]), action: 'open-identity', value: crate });
      }
      // missing only (no nag): farrowing's disclosure row, `optional` on its line
      if (!SOW.weight) rows += K.door({ title: S('pp.common.weight.record'), description: S('pp.common.weight.optional'), action: 'open-weight', value: crate });
      // non-animal doors: farrowing's disclosure rows (TaskRow door), no card
      return rows ? '<section class="pp-group" data-ds="Section">' + UI.heading({ title: '', kind: 'section', level: 3, strs: { title: 'pp.common.record.title' } }) + '<div class="lt-doors">' + rows + '</div></section>' : '';
    }

    function faceBody() {
      var T = endedTask(), v = view(), x = L();
      var main = T ? endedSection(T) + reviewSection() + unexplainedSection() : v.closed ? closedSection() + reviewSection() + unexplainedSection() : reviewSection() + unexplainedSection() + owedSection();
      return '<div class="lt-face">' + receiptLine() + summary() + (x.phase === 'open' ? prelockDoor() : tools()) + main + afterEndSection() + recordedSection() + notesSection() +
        (T || v.closed ? '' : laterSection()) + recordGroup() + '</div>';
    }

    /* ---- the treatment views (staged: Back keeps the draft, Clear discards it, Save commits; a waiting Save says why) ---- */
    function stepperRow(key, label, desc, descArgs, value, max, ceilId, ceilArgs, min) {
      var atCeil = ceilTap === key && max != null && value >= max;
      // farrowing's entry row (TaskStepper row face): outlined keys, 15px label, 18px mono value
      return K.stepper({ face: 'row', label: '', description: desc ? '' : undefined, value: value, min: min || 0, max: max, key: key, hint: atCeil ? '' : undefined,
        strs: Object.assign({ label: label, value: 'ds.field.figure', decrease: 'ds.field.aria.decrease', increase: 'ds.field.aria.increase' }, desc ? { description: desc } : {}, atCeil ? { hint: ceilId } : {}),
        args: Object.assign({}, desc ? { description: descArgs } : {}, atCeil ? { hint: ceilArgs } : {}) });
    }
    function radios(key, label, labelArgs, options, selected, lead) {
      return UI.choiceRadios({ label: PP.t(label, labelArgs), layout: 'rows', action: 'radio', key: key, id: 'lt-' + key, selected: selected || '', lead: lead || '',
        options: options.map(function (o) { return { value: o[0], label: PP.t(o[1], o[2]), meta: o[3] ? PP.t(o[3], o[4]) : '', strs: Object.assign({ label: o[1] }, o[3] ? { meta: o[3] } : {}), args: { label: o[2], meta: o[4] } }; }),
        strs: { label: label }, args: { label: labelArgs } });
    }
    function reasonGroup(rest, chosen, castr) {
      var opts = [['weak', 'pp.litter.reason.weak'], ['sick', 'pp.litter.reason.sick']];
      if (!castr && rest > 1) opts.push(['split', 'pp.litter.reason.split']);
      return radios('reason', castr ? 'pp.litter.castr.why' : one('pp.litter.rest.why', rest), { n: rest }, opts, chosen);
    }
    var ZERO = { castrated: 0, hernia: 0, cryptorchid: 0, kept: 0, deferred: 0, deferReason: '' };
    function csum(c) { return c.castrated + c.hernia + c.cryptorchid + c.kept + c.deferred; }
    function restOf() { return owedOf(drawer.dose) - drawer.n; }
    function draftEvent() {
      if (drawer.castr) {
        var c = drawer.castr, e = { castrated: c.castrated };
        ['hernia', 'cryptorchid', 'kept', 'deferred'].forEach(function (k) { if (c[k]) e[k] = c[k]; });
        if (c.deferred && c.deferReason) e.deferReason = c.deferReason;
        return { castration: e };
      }
      var rest = restOf(), d = { n: drawer.n };
      if (rest > 0 && drawer.reason === 'split') {
        var w = Math.min(drawer.weak || 0, rest), s = rest - w;
        d.deferred = { n: rest, reason: w && s ? 'weak_sick' : w ? 'weak' : 'sick', by: { weak: w, sick: s } };
      } else if (rest > 0 && drawer.reason) d.deferred = { n: rest, reason: drawer.reason };
      return d;
    }
    function drawerSel() { var x = {}; x[drawer.dose] = draftEvent(); return view({ drafts: x }).drafts[drawer.dose]; }
    function waiting() {
      var id = drawer.dose, o = owedOf(id);
      if (endedTask()) return ['pp.litter.pointer.ended', null];
      if (drawer.kind === 'resolve') { var r = resolving(), rest = r.n - drawer.had; return rest && !drawer.rest ? [one('pp.litter.pointer.rest', rest), { n: rest }] : null; }
      if (drawer.kind === 'range') return drawer.still && !drawer.rest ? [one('pp.litter.pointer.range', drawer.still), { n: drawer.still }] : null;
      if (drawer.castr) {
        var c = drawer.castr, sum = csum(c);
        if (drawer.confirmNone) return ['pp.litter.pointer.none', null];
        if (o != null && sum !== o) return [one('pp.litter.pointer.males', o - sum), { n: o - sum }];
        if (o == null && !sum && !c.none) return ['pp.litter.pointer.no_males', null];
        if (c.deferred && !c.deferReason) return [one('pp.litter.pointer.reason', c.deferred), { n: c.deferred }];
      } else {
        var rest2 = restOf();
        if (rest2 > 0 && !drawer.reason) return [one('pp.litter.pointer.reason', rest2), { n: rest2 }];
        if (!drawer.n && !rest2) return ['pp.litter.pointer.empty', null];
      }
      var why = drawerSel().why;
      if (!why) return null;
      return [why === 'task_ended' ? 'pp.litter.pointer.ended' : why === 'no_task' ? 'pp.litter.pointer.no_task' : 'pp.litter.pointer.check', null];
    }
    function clearAside(show) { return show ? btn({ id: 'act.clear', register: 'text', action: 'clear' }) : ''; }
    /* A treatment in the drawer: its title, one subtitle line (the crate and what is owed), the body, and Back + Save. The
       reason Save waits for is the footer's status line (TaskSheet's status slot); a tap on the waiting Save flashes it. */
    function doseSheet(titleSlot, sub, body, aside) {
      var w = waiting();
      return K.sheet({ title: titleSlot, subtitle: [S('pp.room.code', { code: crate }), { sep: true }].concat(sub), close: null, aside: aside, size: 'long', view: 'dose',
        body: '<div class="lt-stack">' + body + '</div>',
        footer: K.footer({ back: { action: 'back' }, status: w ? Object.assign(S(w[0], w[1]), { id: 'lt-why' }) : null,
          primary: { label: S('act.save'), register: 'primary', action: 'save', waiting: !!w, describedby: w ? 'lt-why' : '' } }) });
    }
    function doseDrawer() {
      var id = drawer.dose, x = D(id), t = title(id), d = doseCfg(id);
      var body = '', sub;
      if (d.castration) {
        var c = drawer.castr, sum = csum(c), o = owedOf(id);
        var total = o == null ? L().alive : o;
        var cap = function (k) { return total - sum + c[k]; };
        var ceil = o == null ? ['pp.litter.ceil.alive', { n: L().alive }] : [one('pp.litter.ceil.owed', o), { n: o }];
        sub = o == null ? S(one('pp.litter.castr.males', sum), { n: sum }) : S(one('pp.litter.castr.owed', o), { n: o });
        // One label per stepper (farrowing's dead causes): what each reason does is on the record, not repeated here.
        body += stepperRow('castrated', 'pp.litter.castr.castrated', null, null, c.castrated, cap('castrated'), ceil[0], ceil[1]) +
          UI.heading({ title: '', kind: 'group', level: 4, strs: { title: 'pp.litter.castr.not' } }) +
          stepperRow('hernia', 'pp.litter.reason.hernia', null, null, c.hernia, cap('hernia'), ceil[0], ceil[1]) +
          stepperRow('cryptorchid', 'pp.litter.reason.cryptorchid', null, null, c.cryptorchid, cap('cryptorchid'), ceil[0], ceil[1]) +
          stepperRow('deferred', 'pp.litter.reason.deferred', null, null, c.deferred, cap('deferred'), ceil[0], ceil[1]) +
          stepperRow('kept', 'pp.litter.reason.kept', null, null, c.kept, cap('kept'), ceil[0], ceil[1]);
        if (c.deferred) body += reasonGroup(c.deferred, c.deferReason, true);
        if (o == null) {
          body += UI.chooserList(UI.choiceRow({ mode: 'radio', label: PP.t('pp.litter.castr.none'), meta: PP.t('pp.litter.castr.none_meta'), action: 'no-males', value: 'none', selected: !!c.none,
            strs: { label: 'pp.litter.castr.none', meta: 'pp.litter.castr.none_meta' } }), { tone: 'inset', ds: 'ChoiceList' });
          if (drawer.confirmNone) body += '<div class="lt-confirm">' + U.receipt([{ id: one('pp.litter.castr.none_confirm', sum), args: { n: sum }, tone: 'amber' }]) +
            btn({ id: 'pp.litter.castr.none_yes', register: 'text', action: 'no-males-yes' }) + btn({ id: 'pp.litter.castr.none_keep', register: 'text', action: 'no-males-keep' }) + '</div>';
        }
      } else {
        var max = owedOf(id), rest = max - drawer.n;
        sub = d.product ? S('pp.litter.drawer.product', { prod: PP.t('pp.litter.product.' + d.product), n: max }) : S('pp.litter.drawer.owed', { n: max });
        if (x.status !== 'due') body += UI.heading({ title: '', kind: 'group', level: 4, strs: { title: 'pp.litter.drawer.' + x.status }, args: { title: { d: x.status === 'missed' ? d.last : d.due } } });
        body += stepperRow('n', 'pp.litter.stepper.treated', 'pp.litter.stepper.of', { n: max }, drawer.n, max, one('pp.litter.ceil.owed', max), { n: max });
        if (rest > 0) body += reasonGroup(rest, drawer.reason);
        if (rest > 1 && drawer.reason === 'split') {
          var w = Math.min(drawer.weak || 0, rest);
          body += stepperRow('weak', 'pp.litter.reason.weak', 'pp.litter.split.rest', { s: rest - w }, w, rest, one('pp.litter.ceil.rest', rest), { n: rest });
        }
      }
      if (drawer.clamped != null) body += U.receipt([{ id: 'pp.litter.resume.now', args: { n: drawer.clamped }, tone: 'amber' }]);
      return doseSheet(S(t[0], t[1]), [sub], body, clearAside(dirty()));
    }
    function resolving() {
      var p = drawer.group, g = unknownGroups(drawer.dose).filter(function (x) { return x.id === p; })[0];
      return { group: p, dose: drawer.dose, n: g ? g.n : 0, from: g ? g.from : '' };
    }
    function resolveEvents() {
      var r = resolving(), had = Math.max(0, Math.min(drawer.had || 0, r.n)), rest = r.n - had, out = [];
      if (drawer.rest === 'owed') out.push({ type: 'check', litter: crate, dose: r.dose, had: had, lacks: rest, group: r.group });
      else {
        if (had) out.push({ type: 'check', litter: crate, dose: r.dose, had: had, group: r.group });
        if (rest) out.push({ type: 'treat', litter: crate, dose: r.dose, n: rest, target: 'unknown', group: r.group });
      }
      return out;
    }
    function resolveDrawer() {
      var r = resolving(), n = r.n, had = Math.max(0, Math.min(drawer.had || 0, n)), rest = n - had, visible = doseCfg(r.dose).visible;
      var tx = lower(titleText(r.dose));
      var body = stepperRow('had', 'pp.move.res.had', one('pp.move.res.of', n), { n: n }, had, n, one('pp.move.res.ceiling', n), { n: n });
      if (rest) body += radios('rest', one('pp.move.res.rest', rest), { n: rest },
        [['record', one('pp.move.res.record', rest), { tx: tx, n: rest }], ['owed', one('pp.move.res.owed', rest), { n: rest }]], drawer.rest);
      return doseSheet(S(one('pp.move.res.title', n), { tx: titleText(r.dose), n: n, code: r.from }), [S(visible ? 'pp.litter.res.sub_check' : 'pp.litter.res.sub_unknown')],
        body, clearAside(drawer.had || drawer.rest));
    }
    function rangeEvents() {
      var id = drawer.dose;
      if (drawer.still && drawer.rest === 'record') return [{ type: 'treat', litter: crate, dose: id, n: drawer.still }];
      return [{ type: 'check', litter: crate, dose: id, owed: drawer.still }];
    }
    function rangeDrawer() {
      var id = drawer.dose, o = view().owed.filter(function (x) { return x.dose === id; })[0], rg = o.range;
      drawer.still = Math.max(rg.lo, Math.min(rg.hi, drawer.still));
      var body = stepperRow('still', 'pp.litter.range.still', 'pp.litter.range.still_desc', { lo: rg.lo, hi: rg.hi }, drawer.still, rg.hi, one('pp.litter.ceil.owed', rg.hi), { n: rg.hi }, rg.lo);
      if (drawer.still) body += radios('rest', one('pp.litter.range.them', drawer.still), { n: drawer.still },
        [['record', one('pp.litter.range.record', drawer.still), { tx: lower(titleText(id)), n: drawer.still }], ['owed', one('pp.litter.range.leave', drawer.still), { n: drawer.still }]], drawer.rest);
      var doubt = rg.doubt[0] || { n: 0, to: '' };
      return doseSheet(S(title(id)[0], title(id)[1]), [S('pp.litter.range.sub', { lo: rg.lo, hi: rg.hi, of: rg.of, n: doubt.n, to: doubt.to })], body, '');
    }
    function freshDraft(id) {
      var o = view().owed.filter(function (x) { return x.dose === id; })[0];
      if (o && o.range) return { kind: 'range', key: 'range:' + id, dose: id, still: o.range.hi, rest: '' };
      if (doseCfg(id).castration) return { kind: 'dose', key: id, dose: id, castr: Object.assign({}, ZERO) };
      return { kind: 'dose', key: id, dose: id, n: owedOf(id), reason: '', weak: 0 };
    }
    function freshResolve(v) { var p = v.split(':'); return { kind: 'resolve', key: 'res:' + v, group: p[0], dose: p[1], had: 0, rest: '' }; }
    function dirty() {
      var f = drawer.kind === 'resolve' ? freshResolve(drawer.group + ':' + drawer.dose) : freshDraft(drawer.dose);
      var pick = function (x) { return JSON.stringify([x.n, x.reason, x.weak || 0, x.castr, x.had, x.rest, x.still]); };
      return pick(f) !== pick(drawer);
    }
    function resume(key) {
      var dr = JSON.parse(JSON.stringify(drafts[key])), o = owedOf(dr.dose);
      dr.clamped = null;
      if (dr.kind === 'dose' && !dr.castr) {
        if (dr.n > o) { dr.n = o; dr.clamped = o; }
        else if (dr.owed != null && dr.owed !== o) dr.clamped = o;
        if (dr.n >= o) dr.reason = '';
      }
      return dr;
    }
    function saveDrafts() { try { sessionStorage.setItem('pp-drafts:' + store.name + ':' + crate, JSON.stringify(drafts)); } catch (e) {} }
    function keepAndClose() {
      if (!drawer) return;
      if (dirty()) drafts[drawer.key] = Object.assign({}, drawer, { owed: owedOf(drawer.dose), clamped: null }); else delete drafts[drawer.key];
      saveDrafts(); drawer = null;
    }
    /* The URL key of the open view: the dose id, `res:<group>:<dose>` for arrivals, `range:<dose>` never (a range is its dose). */
    function viewKey() { return weightView ? 'weight' : drawer ? (drawer.kind === 'resolve' ? drawer.key : drawer.dose) : ''; }

    /* ---- the birth litter weight (only when missing; a concurrent second is kept as a conflict) ---- */
    function liveBorn() { var c = L().dead.byCause; return L().born - (c.stillborn || 0) - (c.mummified || 0); }
    var usual = function (n) { return [(n * 0.8).toFixed(1), (n * 2.5).toFixed(1)]; };
    var conflict = null;
    function readWeight() {
      SOW = store.sow(crate) || SOW;
      conflict = (L().birthWeightConflicts || []).filter(function (c) { return c.who === window.PPFixtures.ME; })[0] || null;
      if (conflict && !weightView) weightView = { draft: conflict.kg, pad: false, hint: '' };
      else if (conflict) weightView.draft = conflict.kg;
    }
    function weightSheet() {
      var W = weightView, n = liveBorn(), draft = W.draft;
      var min = (n * 0.8).toFixed(1), max = (n * 2.5).toFixed(1), hard = n * 5;
      var num = parseFloat(draft), has = !isNaN(num);
      var refused = has && num > hard, out = has && !refused && (num < +min || num > +max);
      var ms = { label: 'pp.edge.weight.label', optional: 'pp.common.weight.optional', value: 'ds.field.figure', unit: 'ds.field.unit.kg', placeholder: 'ds.field.placeholder' };
      var margs = { value: { n: draft } }, hint = '';
      if (refused) { hint = ' '; ms.hint = 'ds.field.measure.refused'; margs.hint = { max: hard, n: n }; }
      else if (!W.pad && out) { hint = ' '; ms.hint = 'ds.field.measure.range'; margs.hint = { min: min, max: max, v: draft }; }
      var body = UI.measure({ label: '', optional: '', value: draft, unit: 'kg', placeholder: '—', key: 'bw', active: W.pad, controls: 'bw-pad',
        tone: refused ? 'refused' : '', range: W.pad ? null : [+min, +max], hint: hint, strs: ms, args: margs });
      if (conflict && SOW.weight) body += UI.facts([{ label: '', value: '', meta: '', strs: { label: 'pp.edge.weight.conflict_label', value: 'pp.common.kg', meta: 'pp.edge.data.stamp' },
          args: { value: { w: SOW.weight.kg }, meta: { stamp: U.stamp(SOW.weight.at, SOW.weight.who, TODAY) } } }], { columns: 1 }) +
        '<div class="lt-actions">' + btn({ id: 'pp.edge.weight.keep_theirs', register: 'secondary', action: 'keep-theirs' }) + btn({ id: 'act.edit', register: 'secondary', action: 'open-farrowing-edit', value: 'birth-weight' }) + '</div>';
      if (W.pad) body += UI.numpad({ decimals: 1, intLength: 2, value: draft, key: 'bw', id: 'bw-pad', hint: W.hint ? ' ' : '',
        strs: Object.assign({ digit: 'ds.field.figure', decimal: 'ds.field.decimal', back: 'ds.field.aria.backspace', pad: 'ds.field.aria.pad' }, W.hint ? { hint: W.hint } : {}) });
      var ok = has && num > 0 && !refused && !conflict;
      return K.sheet({ title: S('pp.common.weight.title'), subtitle: [S('pp.room.code', { code: crate }), { sep: true }, S('pp.edge.weight.pop', { n: n })], close: null, size: 'long', view: 'weight',
        body: '<div class="lt-stack">' + body + '</div>',
        footer: K.footer({ back: { action: 'back' }, primary: btn({ id: 'act.save', register: 'primary', action: 'save-weight', waiting: !ok }) }) });
    }
    function padKey(k) {
      var r = UI.numpadInput({ value: weightView.draft }, k, { decimals: 1, intLength: 2 });
      weightView.draft = r.value; weightView.hint = '';
      if (r.dead === 'full') weightView.hint = 'pp.edge.weight.dead_places';
      else if (r.dead === 'point') weightView.hint = 'pp.edge.weight.dead_point';
      else if (r.dead === 'empty') weightView.hint = 'ds.field.numpad.dead_empty';
    }

    /* ---- commits ---- */
    function commit(event) {
      var r = store.commit(Object.assign({ type: 'treat', litter: crate }, event));
      lastCommit = Date.now();
      if (!r.ok) return r;
      visit[r.event.id] = true;
      receipt = { kind: 'saved', dose: event.dose, rec: recordOf(r.event.id) };
      return r;
    }
    function otherRecord(id) { var rs = D(id).records.filter(function (r) { return !visit[r.id]; }); return rs[rs.length - 1] || null; }
    function tap(id, label) {
      var o = view().owed.filter(function (x) { return x.dose === id; })[0], n = o ? tapN(o) : 0;
      if (label !== n) { receipt = { kind: n ? 'stale' : 'already', dose: id, other: otherRecord(id), now: owedOf(id) }; return; }
      if (!n) return;
      var ev = doseCfg(id).castration ? { dose: id, castration: { castrated: n } } : { dose: id, n: n };
      if (splitNow(o)) ev.deferred = { n: o.owed - n, reason: 'not_due' };
      var r = commit(ev);
      if (!r.ok) receipt = { kind: r.reason === 'nothing_owed' ? 'already' : 'stale', dose: id, other: otherRecord(id), now: owedOf(id) };
      else receipt.undo = r.event.id;
    }
    function undo(id) {
      var r0 = recordOf(id);
      if (!r0) return;
      var r = store.commit({ type: 'correction', target: id, void: true });
      lastCommit = Date.now();
      if (!r.ok) return;
      delete visit[id];
      receipt = { kind: 'undone', dose: r0.dose, n: r0.castration ? r0.castration.castrated : r0.n };
    }
    function setRadio(field, value) {
      if (!drawer) return;
      if (field === 'reason') { if (drawer.castr) drawer.castr.deferReason = value; else { drawer.reason = value; if (value === 'split' && !drawer.weak) drawer.weak = 1; } }
      else if (field === 'rest') drawer.rest = value;
    }
    function reviewDoor(v) {
      var x = store.select.reviews(store.derived, {}).items.filter(function (y) { return y.id === v; })[0];
      if (!x) return;
      if (x.kind === 'double') nav('edit.html', { state: 'edit', crate: crate, double: x.records.join('+'), dose: x.dose, from: 'litter', data: store.name });
      else if (x.kind === 'held') nav('count.html', { state: 'held-body', crate: crate, unit: host.unitParam(), data: store.name });
      else if (x.kind === 'count') nav('count.html', { state: 'count-conflict', crate: crate, unit: host.unitParam(), data: store.name });
      else nav('edit.html', { state: 'record-page', crate: crate, data: store.name });
    }
    function nav(page, params) { host.go(PP.href(page, Object.assign({ data: store.name !== 'base' ? store.name : '' }, params))); }

    /* ---- opening a view (the host pushes a history entry for each; the phone's Back pops it, R1-24) ---- */
    function openDose(v) {
      if (isDone(v) || endedTask() || !L().recordable) return false;
      var fr = freshDraft(v);
      if (fr.kind !== 'range') delete drafts['range:' + v];
      drawer = fr.kind === 'range' ? (drafts[fr.key] ? resume(fr.key) : fr) : drafts[v] ? resume(v) : fr;
      ceilTap = ''; drawerOpenedAt = Date.now();
      return true;
    }
    function openResolve(v) {
      if (endedTask()) return false;
      drawer = drafts['res:' + v] ? resume('res:' + v) : freshResolve(v);
      ceilTap = ''; drawerOpenedAt = Date.now();
      return true;
    }
    function openKey(k) {
      if (!k) return false;
      if (k === 'weight') { if (SOW.weight && !conflict) return false; weightView = weightView || { draft: '', pad: true, hint: '' }; return true; }
      if (k.indexOf('res:') === 0) return openResolve(k.slice(4));
      if (!doseCfg(k)) return false;
      return openDose(k);
    }
    /* Back from a view to the litter: the draft is kept (Resume brings it back). */
    function closeView() { if (drawer) keepAndClose(); if (weightView) { weightView = null; } }

    var api = {
      get crate() { return crate; },
      get view() { return !crate ? '' : weightView ? 'weight' : drawer ? 'dose' : 'litter'; },
      viewKey: viewKey,
      /* Open the drawer on a litter (fresh state per litter); `o.preset` carries a litter state's fixture moment. */
      open: function (c, o) {
        o = o || {};
        store = host.store(); CFG = store.config; TODAY = store.today; PP.me = window.PPFixtures.ME;
        if (c !== crate) { visit = {}; receipt = null; drawer = null; weightView = null; conflict = null; }
        crate = c;
        SOW = store.sow(crate) || { sow: '', parity: 0, unit: 7, weight: null };
        if (!L()) { crate = ''; return false; }
        try { drafts = JSON.parse(sessionStorage.getItem('pp-drafts:' + store.name + ':' + crate) || 'null') || {}; } catch (e) { drafts = {}; }
        var st = o.preset || {};
        if (st.drafts) drafts = JSON.parse(JSON.stringify(st.drafts));
        (st.pre || []).forEach(function (e) { var r = store.commit(e); if (r.ok && st.preVisit) { visit[r.event.id] = true; receipt = { kind: 'saved', dose: e.dose, rec: recordOf(r.event.id) }; } });
        SOW = store.sow(crate) || SOW;
        (st.visit || []).forEach(function (id) { visit[id] = true; });
        if (st.receipt) { var r0 = recordOf(st.visit[0]); receipt = { kind: 'saved', dose: r0.dose, rec: r0 }; }
        if (o.saved === 'correction') receipt = { kind: 'correction' };
        // back from Set count (Save): the count's receipt, handed over on this phone
        if (o.saved === 'count') {
          try { var hc = JSON.parse(sessionStorage.getItem('pp-receipt:count') || 'null'); sessionStorage.removeItem('pp-receipt:count'); if (hc && hc.parts && hc.litter === crate) receipt = { kind: 'handoff', parts: hc.parts }; } catch (e) {}
        }
        if (o.saved === 'dead' || o.saved === 'sow' || st.saved) {
          var hr = st.handoff || null;
          try { hr = hr || JSON.parse(sessionStorage.getItem('pp-receipt:dead') || 'null'); sessionStorage.removeItem('pp-receipt:dead'); } catch (e) {}
          if (hr && hr.parts && (hr.litter === crate || hr.from === crate)) receipt = { kind: 'handoff', parts: hr.parts };
        }
        if (st.kept) {
          try {
            sessionStorage.setItem(keptKey('dead'), JSON.stringify(st.kept.dead));
            sessionStorage.setItem(keptKey('count'), JSON.stringify(st.kept.count));
            sessionStorage.setItem(keptKey('id'), JSON.stringify(st.kept.id));
          } catch (e) {}
        }
        if (st.weight) weightView = { draft: st.weight.draft || '', pad: !!st.weight.pad, hint: st.weight.hint || '' };
        readWeight();
        if (st.weightSaved && SOW.weight) { var u0 = usual(liveBorn()); receipt = { kind: 'weight', w: SOW.weight.kg, out: +SOW.weight.kg < +u0[0] || +SOW.weight.kg > +u0[1], min: u0[0], max: u0[1] }; }
        if (st.tap) tap(st.tap.dose, st.tap.n);
        if (st.drawer) {
          var dr = freshDraft(st.drawer.dose);
          ['n', 'reason', 'weak', 'confirmNone'].forEach(function (k) { if (st.drawer[k] != null) dr[k] = st.drawer[k]; });
          if (st.drawer.castr) dr.castr = Object.assign({}, ZERO, st.drawer.castr);
          drawer = dr; drawerOpenedAt = Date.now();
        }
        if (st.resolve) {
          var g = unknownGroups(st.resolve.dose)[0];
          if (g) { drawer = Object.assign(freshResolve(g.id + ':' + st.resolve.dose), { had: st.resolve.had || 0, rest: st.resolve.rest || '' }); drawerOpenedAt = Date.now(); }
        }
        if (st.range) { drawer = Object.assign(freshDraft(st.range.dose), { still: st.range.still, rest: st.range.rest || '' }); drawerOpenedAt = Date.now(); }
        if (o.dose && !drawer && !weightView) openKey(o.dose);
        return true;
      },
      /* The URL says which view (the phone's Back popped one): close the view it left, keeping its draft. */
      sync: function (c, key) {
        if (!c) { closeView(); crate = ''; return; }
        if (c !== crate) { api.open(c, { dose: key }); return; }
        if (key === viewKey()) return;
        closeView();
        if (key) openKey(key);
      },
      close: function () { closeView(); crate = ''; },
      unit: function () { return SOW ? SOW.unit : null; },
      html: function () {
        if (!crate) return '';
        store = host.store();
        var sheet = weightView ? weightSheet() : drawer ? (drawer.kind === 'resolve' ? resolveDrawer() : drawer.kind === 'range' ? rangeDrawer() : doseDrawer())
          : K.sheet({ title: S('pp.room.code', { code: crate }), subtitle: subtitle(), close: { action: 'close' }, size: 'long', view: 'litter', label: S('pp.litter.aria', { code: crate }),
            body: faceBody(), footer: K.footer({ back: { action: 'close' } }) });
        return K.scrim({ action: 'scrim' }) + sheet;
      },
      radio: function (field, value) { setRadio(field, value); },
      /* A click in the drawer. Returns 'render' (state changed), 'push' (a view opened: the host adds a history entry),
         'pop' (Back from a view), 'close' (the drawer closes), or '' (not the drawer's). */
      click: function (a, v, b) {
        var now = Date.now();
        if (a === 'step') {
          if (!drawer) return '';
          if (b.getAttribute('aria-disabled') === 'true') { ceilTap = +b.dataset.step > 0 ? v : ''; return 'render'; }
          ceilTap = '';
          var step = +b.dataset.step;
          if (drawer.kind === 'resolve') drawer.had = (drawer.had || 0) + step;
          else if (drawer.kind === 'range') { drawer.still += step; if (!drawer.still) drawer.rest = ''; }
          else if (drawer.castr) { drawer.castr[v] += step; drawer.castr.none = false; drawer.confirmNone = false; if (!drawer.castr.deferred) drawer.castr.deferReason = ''; }
          else if (v === 'weak') drawer.weak = (drawer.weak || 0) + step;
          else { drawer.n += step; if (drawer.n === owedOf(drawer.dose)) drawer.reason = ''; if (drawer.weak > restOf()) drawer.weak = restOf(); }
          return 'render';
        }
        if (UI.guard(b)) return 'guarded';
        if (a === 'record') { if (now - lastCommit < 600) return 'guarded'; tap(v, +b.dataset.n); return 'render'; }
        if (a === 'undo') { undo(v); return 'render'; }
        if (a === 'open-dose') return openDose(v) ? 'push' : 'guarded';
        if (a === 'open-resolve') return openResolve(v) ? 'push' : 'guarded';
        if (a === 'open-weight') { weightView = { draft: '', pad: true, hint: '' }; return 'push'; }
        if (a === 'radio') { setRadio(b.closest('[data-field]') ? b.closest('[data-field]').dataset.field : '', v); return 'render'; }
        if (a === 'no-males') {
          if (!drawer.castr.none && csum(drawer.castr)) { drawer.confirmNone = true; return 'render'; }
          drawer.castr = Object.assign({}, ZERO, { none: !drawer.castr.none }); drawer.confirmNone = false; return 'render';
        }
        if (a === 'no-males-yes') { drawer.castr = Object.assign({}, ZERO, { none: true }); drawer.confirmNone = false; return 'render'; }
        if (a === 'no-males-keep') { drawer.confirmNone = false; return 'render'; }
        if (a === 'back') {
          if (weightView && weightView.pad && weightView.draft && !conflict) { weightView.pad = false; weightView.hint = ''; return 'render'; }   // the pad closes first
          return 'pop';
        }
        if (a === 'clear') { var k = drawer.key; delete drafts[k]; saveDrafts(); drawer = drawer.kind === 'resolve' ? freshResolve(drawer.group + ':' + drawer.dose) : freshDraft(drawer.dose); return 'render'; }
        if (a === 'save') {
          if (now - lastCommit < 600 && drawerOpenedAt < lastCommit) return 'guarded';
          var key = drawer.key, dose = drawer.dose;
          if (drawer.kind === 'resolve' || drawer.kind === 'range') {
            var evs = drawer.kind === 'resolve' ? resolveEvents() : rangeEvents(), rr = drawer.kind === 'resolve' ? resolving() : null;
            var res = store.commitAll(evs);
            lastCommit = now;
            if (!res.ok) return 'render';
            res.events.forEach(function (e) { if (e.type === 'treat') visit[e.id] = true; });
            if (rr) {
              var had = Math.min(drawer.had || 0, rr.n);
              receipt = { kind: 'resolved', dose: dose, had: had, rec: drawer.rest === 'owed' ? 0 : rr.n - had, left: drawer.rest === 'owed' ? rr.n - had : 0 };
            } else receipt = { kind: 'resolved', dose: dose, had: 0, rec: drawer.rest === 'record' ? drawer.still : 0, left: drawer.rest === 'record' ? 0 : drawer.still };
          } else {
            var ds = drawerSel();
            if (!ds.event) return 'render';
            var r = commit(ds.event);
            if (!r.ok) return 'render';
          }
          delete drafts[key]; saveDrafts(); drawer = null;
          return 'pop';
        }
        // the birth litter weight
        if (a === 'numpad' && weightView) { padKey(b.dataset.key); return 'render'; }
        if (a === 'open-numpad' && weightView) { if (!weightView.pad) { weightView.pad = true; weightView.hint = ''; } return 'render'; }
        if (a === 'save-weight') {
          var val = UI.numpadCommit(weightView.draft, { decimals: 1 });
          if (val == null || !(parseFloat(val) > 0) || parseFloat(val) > liveBorn() * 5 || conflict) return 'guarded';
          var rw = store.commit({ type: 'birth_weight', litter: crate, kg: val });
          readWeight();
          if (!rw.ok || conflict) { if (weightView) weightView.pad = false; return 'render'; }
          var u = usual(liveBorn());
          receipt = { kind: 'weight', w: val, out: parseFloat(val) < +u[0] || parseFloat(val) > +u[1], min: u[0], max: u[1] };
          weightView = null;
          return 'pop';
        }
        if (a === 'keep-theirs') {
          if (conflict) store.commit({ type: 'correction', target: conflict.event, void: true });
          readWeight(); weightView = null;
          return 'pop';
        }
        if (a === 'close' || a === 'scrim') { closeView(); return 'close'; }
        // doors to other pages; each comes back to this drawer
        if (a === 'open-review') { reviewDoor(v); return 'gone'; }
        if (a === 'open-dead') { nav('dead.html', { state: 'dead', crate: crate, unit: host.unitParam() }); return 'gone'; }
        if (a === 'open-explain') { nav('count.html', { state: 'explain', crate: crate, unit: host.unitParam(), data: store.name }); return 'gone'; }
        if (a === 'open-count') { nav('count.html', { state: 'count', crate: crate, unit: host.unitParam(), data: store.name }); return 'gone'; }
        if (a === 'open-move') { nav('move.html', { state: 'move', crate: crate }); return 'gone'; }
        if (a === 'open-identity') { nav('id.html', { state: 'id-table', crate: crate }); return 'gone'; }
        if (a === 'open-record') { nav('edit.html', { state: 'record-page', crate: crate }); return 'gone'; }
        if (a === 'open-edit') { nav('edit.html', Object.assign({ state: 'edit', crate: crate, from: 'litter' }, v && v !== crate ? { record: v } : {})); return 'gone'; }
        if (a === 'open-farrowing' || a === 'open-farrowing-edit') { document.documentElement.setAttribute('data-door', a + ':' + (v || '')); return 'guarded'; }
        return '';
      }
    };
    return api;
  };
})();
