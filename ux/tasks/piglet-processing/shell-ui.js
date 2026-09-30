/* Piglet processing shared UI: what two or more pages draw (ticket #19). Built from the design system's
   factories plus four compositions (CSS in shell.css, tokens only):
     litterHeader  the litter's identity header: `A02 · 000231 ›` (the door to the sow), parity, day
     tools         `Record dead · Set count`: Button's tool register (adopted, ADR 0002)
     recordGroup   the Record group: Move, identity, birth litter weight (and why, outside a task)
     weightRow     the birth-litter-weight row, missing or set
     litterRow     Candidate:LitterRow — the room's row law (room, End)
     receipt       Candidate:Receipt — one body line, colour on the value only
     toolRow       Candidate:ToolRow — farrowing's in-sheet tools (Edit · Record dead · Set count · Move), skeleton pages
   Plus the words every page stamps with: span, stamp, date, ago. Needs window.SentriUI and PP. */
(function () {
  var UI = window.SentriUI, ICON = window.SentriIcons;
  var U = (window.PPUI = {});

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  U.esc = esc;
  /* A registered string as a span (filled now and by PP.apply); tone colours the value. */
  U.span = function (id, args, o) {
    o = o || {};
    var cls = [o.cls, o.tone ? 'pp-tone' : ''].filter(Boolean).join(' ');
    return '<span' + (cls ? ' class="' + cls + '"' : '') + (o.ds ? ' data-ds="' + o.ds + '"' : '') + (o.tone ? ' data-tone="' + o.tone + '"' : '') +
      ' data-str="' + id + '"' + (args ? " data-args='" + esc(JSON.stringify(args)) + "'" : '') + '>' + esc(PP.t(id, args)) + '</span>';
  };

  /* ---- time words: `09:14 · G.H` today, `Sep 27 · 07:52 · L.M` before ---- */
  function parts(iso) { var s = String(iso); return { y: +s.slice(0, 4), m: +s.slice(5, 7), d: +s.slice(8, 10), t: s.slice(11, 16) }; }
  U.date = function (iso) { var p = parts(iso); return PP.t('pp.common.date.m' + p.m, { d: p.d }); };
  U.time = function (iso) { return parts(iso).t; };
  U.stamp = function (iso, who, today) {
    var p = parts(iso), same = today && String(iso).slice(0, 10) === String(today).slice(0, 10);
    return same ? PP.t('pp.common.stamp.today', { t: p.t, who: who }) : PP.t('pp.common.stamp.date', { date: U.date(iso), t: p.t, who: who });
  };
  /* Recency ladder (room): `just now` under a minute (and a stamp ahead of now: never "1h ago"), `N min ago` under an hour,
     `Nh ago` (whole hours, rounded down) under a day, `yesterday`, `N days ago` to six, the date from seven. `now` is the
     store's clock (`store.now()`), which advances with the records made in the session (R1-15). */
  U.ago = function (iso, now) {
    var mins = (Date.parse(now) - Date.parse(iso)) / 60000;
    if (!(mins >= 1)) return PP.t('time.just_now');
    if (mins < 60) return PP.t('time.minutes_ago', { n: Math.floor(mins) });
    if (mins < 1440) return PP.t('time.hours_ago', { n: Math.floor(mins / 60) });
    var days = Math.floor(mins / 1440);
    if (days === 1) return PP.t('time.yesterday');
    if (days < 7) return PP.t('time.days_ago', { n: days });
    return U.date(iso);
  };

  /* ---- the litter header: crate first (the first fact), the one door to the sow page ----
     o: { crate, sow, parity, day?, sub? (html replacing the parity line), action? } */
  U.litterHeader = function (o) {
    var a = { crate: o.crate, tag: o.sow };
    var ctx = o.sub ? '<p>' + o.sub + '</p>' : o.day != null
      ? '<p class="pp-hdr-context">' + U.span('pp.common.hdr.parity', { n: o.parity }) + U.span('pp.common.unit.day', { n: o.day }) + '</p>'
      : '<p>' + U.span('pp.common.hdr.parity', { n: o.parity }) + '</p>';
    return '<header class="utility-header"' + (o.attrs || '') + '><div class="pp-hdr-title"><h3><button type="button" class="pp-door" data-action="open-sow" data-value="' + esc(o.sow) +
      '" data-str-attr="aria-label:pp.common.hdr.sow_aria" data-args=\'' + esc(JSON.stringify(a)) + '\' aria-label="' + esc(PP.t('pp.common.hdr.sow_aria', a)) + '">' +
      U.span('pp.common.hdr.door', a, { cls: 'pp-mono' }) + ICON.icon('chevron') + '</button></h3>' + ctx + '</div>' + (o.action || '') + '</header>';
  };

  /* ---- tools: the two quick acts on the litter's numbers, in the tool register ---- */
  U.tools = function (crate) {
    // Button's tool register (ADR 0002 adoption: Candidate:Tool → `button({ register: 'tool' })`, `.pp-tool` deleted)
    function tool(action, id) {
      return UI.button({ label: PP.t(id), register: 'tool', action: action, value: crate, strs: { label: id } });
    }
    return '<div class="pp-tools">' + tool('open-dead', 'act.record_dead') + tool('open-count', 'pp.count.title') + '</div>';
  };

  /* ---- Candidate:ToolRow: farrowing's in-sheet tool row under the litter summary (shell.css). A draft this phone keeps for
     a tool is a small line inside it (farrowing's `Record death · Unsaved`).
     list: [{ action, value, icon, label: stringId, kept: [stringId, args] | null }] ---- */
  U.toolRow = function (list, o) {
    o = o || {};
    return '<div class="pp-toolrow pp-tools" role="group" data-ds="Candidate:ToolRow"' + (o.label ? ' data-str-attr="aria-label:' + o.label + '" aria-label="' + esc(PP.t(o.label)) + '"' : '') + '>' +
      list.map(function (t) {
        // fold: 'wide' — shown at 390, folded into More actions at narrow widths; 'narrow' — the More actions tool itself
        return '<button type="button" class="pp-tool" data-action="' + esc(t.action) + '" data-value="' + esc(t.value || '') + '"' + (t.fold ? ' data-fold="' + esc(t.fold) + '"' : '') + '>' + (t.icon ? ICON.icon(t.icon) : '') +
          U.span(t.label) + (t.kept ? '<small>' + U.span(t.kept[0], t.kept[1]) + '</small>' : '') + '</button>';
      }).join('') + '</div>';
  };

  /* ---- the birth litter weight row: missing (optional, a door to record it) or set (value and who set it) ---- */
  U.weightRow = function (w, crate, today) {
    if (!w) return UI.row({ title: '', trailing: '', action: 'open-weight', value: crate, strs: { title: 'pp.common.weight.record', trailing: 'pp.common.weight.optional' } });
    return UI.row({ title: '', description: '', trailing: '', action: 'open-farrowing-edit', value: 'birth-weight',
      strs: { title: 'pp.common.weight.title', trailing: 'pp.common.kg', description: w.by === 'finish' ? 'pp.common.weight.by_finish' : 'pp.common.weight.by_here' },
      args: { trailing: { w: w.kg }, description: { stamp: U.stamp(w.at, w.who, today) } } });
  };

  /* ---- the Record group: the other acts on this litter ----
     o: { crate, move: true, identity: { scheme, k, n } | null, weight: <SOWS weight> | undefined, weightSet: show the set weight too, why: id } */
  U.recordGroup = function (o) {
    var rows = '';
    if (o.move !== false) rows += UI.row({ title: '', description: '', action: 'open-move', value: o.crate, strs: { title: 'pp.move.title', description: 'pp.common.record.move_desc' } });
    if (o.identity) rows += UI.row({ title: '', description: '', action: 'open-identity', value: o.crate,
      strs: { title: 'pp.common.record.identity', description: 'pp.common.record.id_line.' + o.identity.scheme }, args: { description: { k: o.identity.k, n: o.identity.n } } });
    if (o.weight !== undefined && (!o.weight || o.weightSet)) rows += U.weightRow(o.weight, o.crate, o.today);
    if (!rows) return '';
    return '<section class="pp-group" data-ds="Section">' + UI.heading({ title: '', description: o.why ? '' : undefined, kind: 'group', level: 3,
      strs: Object.assign({ title: 'pp.common.record.title' }, o.why ? { description: o.why } : {}) }) + UI.rowGroup(rows) + '</section>';
  };

  /* ---- Candidate:LitterRow: the Row card's geometry with the row law's mono line 2, one named chip and the rail ----
     o: { code, l1: [tok], toks: [tok], chip: ['red'|'amber', 'sowdied'|'unlocked'] | null, static, select, selected, action, value, attrs, flash }
     tok: [wordId, args, valueId?, tone?] — the value carries the colour; without a value id the tone colours the word. */
  // t[4]: a word after the value (`due 2 days ago`); t[5]: no spaces between the parts (zh). A null word leads with the value.
  function tok(t) {
    if (t[2] && (t[4] || !t[0])) {
      var sp = t[5] ? '' : ' ';
      return '<span class="pp-tok">' + (t[0] ? U.span(t[0], t[1]) + sp : '') + U.span(t[2], t[1], { tone: t[3] }) + (t[4] ? sp + U.span(t[4], t[1]) : '') + '</span>';
    }
    if (t[2]) return '<span class="pp-tok">' + U.span(t[0], t[1]) + ' ' + U.span(t[2], t[1], { tone: t[3] }) + '</span>';
    return '<span class="pp-tok"' + (t[3] ? ' data-tone="' + t[3] + '"' : '') + '>' + U.span(t[0], t[1]) + '</span>';
  }
  U.tok = function (word, args, val, tone, after, tight) { return [word, args || {}, val || null, tone || null, after || null, !!tight]; };
  U.litterRow = function (o) {
    // select: the row is a <label> around ChoiceList's multi trail (a checkbox) in place of the chevron (bulk, slice #7).
    if (o.select) {
      return '<label class="st-row pp-litter" data-ds="Candidate:LitterRow" data-select' + (o.flash ? ' data-flash' : '') + (o.attrs || '') + '>' +
        '<span class="pp-code">' + U.span('pp.room.code', { code: o.code }) + '</span>' +
        '<span class="st-row-copy"><strong>' + o.l1.map(tok).join('') + '</strong><small class="pp-mono">' + o.toks.map(tok).join('') + '</small></span>' +
        (o.chip ? '<span class="pp-chip" data-tone="' + o.chip[0] + '">' + U.span('pp.room.chip.' + o.chip[1]) + '</span>' : '') +
        '<span class="st-choice-trail"><input type="checkbox" data-action="' + (o.action || 'toggle') + '" value="' + esc(o.value || o.code) + '"' + (o.selected ? ' checked' : '') + '></span></label>';
    }
    var tag = o.static ? 'div' : 'button';
    return '<' + tag + (o.static ? '' : ' type="button" data-action="' + (o.action || 'open-litter') + '" data-value="' + esc(o.value || o.code) + '"') + (o.attrs || '') +
      ' class="st-row pp-litter" data-ds="Candidate:LitterRow"' + (o.flash ? ' data-flash' : '') + '>' +
      '<span class="pp-code">' + U.span('pp.room.code', { code: o.code }) + '</span>' +
      '<span class="st-row-copy"><strong>' + o.l1.map(tok).join('') + '</strong><small class="pp-mono">' + o.toks.map(tok).join('') + '</small></span>' +
      (o.chip ? '<span class="pp-chip" data-tone="' + o.chip[0] + '">' + U.span('pp.room.chip.' + o.chip[1]) + '</span>' : '') +
      (o.static ? '' : '<span class="st-row-chevron">' + ICON.icon('chevron') + '</span>') + '</' + tag + '>';
  };

  /* ---- a stamp as a registered span: `09:14 · G.H` today, `Sep 26 · 18:20 · L.M` before ---- */
  U.stampSpan = function (iso, who, today) {
    var same = today && String(iso).slice(0, 10) === String(today).slice(0, 10);
    return same ? U.span('pp.common.stamp.today', { t: U.time(iso), who: who }) : U.span('pp.common.stamp.date', { date: U.date(iso), t: U.time(iso), who: who });
  };
  /* ---- a mark's evidence line (ticket #12): `09:14 · G.H · 10 piglets · 2 deferred: weak`. A corrected mark, or one
     recorded through a correction, prints its value amber forever (RULINGS Q7); the words stay ink. r: a ledger record. ---- */
  U.markLine = function (r, today) {
    var tone = r.corrected || r.viaCorrection ? 'amber' : null, out = [U.stampSpan(r.at, r.who, today)];
    var why = function (k) { return PP.t('pp.litter.why.' + k); };
    if (r.castration) {
      var c = r.castration;
      out.push(U.span('pp.common.mark.castrated', { c: c.castrated || 0 }, { tone: tone }));
      ['hernia', 'cryptorchid', 'kept', 'deferred'].forEach(function (k) {
        if (c[k]) out.push(U.span('pp.common.mark.part', { n: c[k], reason: why(k === 'deferred' && c.deferReason ? c.deferReason : k) }));
      });
    } else {
      out.push(U.span(PP.one('pp.common.unit.piglet', r.n), { n: r.n }, { tone: tone }));
      // corrected after End, the rest is a fact (`2 not done · corrected after End`), not a deferral
      if (r.deferred && r.deferReason === 'not_done') out.push(U.span('pp.common.mark.not_done', { k: r.deferred }, { tone: tone }));
      else if (r.deferred) out.push(U.span('pp.common.mark.deferred', { k: r.deferred, reason: why(r.deferReason || 'deferred') }, { tone: tone }));
      if (r.product) out.push(U.span('pp.litter.product.' + r.product));
    }
    return '<span class="pp-mark">' + out.join(' ' + U.span('pp.common.sep') + ' ') + '</span>';
  };

  /* ---- Candidate:Receipt: the change the last record made, one line; parts [{ id, args, tone }] ---- */
  U.receipt = function (list, o) {
    o = o || {};
    return '<p class="pp-receipt" data-ds="Candidate:Receipt" role="status" aria-live="polite"' + (o.attrs || '') + '>' +
      list.filter(Boolean).map(function (p) { return U.span(p.id, p.args, { tone: p.tone }); }).join(' ') + '</p>';
  };
})();
