/* Simple piglet processing: the screens. Built from the task skeleton (window.SentriTask) and the design-system cards
   (window.SentriUI); the data is state.js (window.PPS), the words strings.js (window.PPT). One render() draws the phone. */
(function () {
  'use strict';
  var K = window.SentriTask, UI = window.SentriUI, P = window.PPS, L = window.PPT, I = window.SentriIcons.icon;
  var T = function (k, a) { return L.t(k, a); };
  var phone = document.getElementById('phone'), demo = document.getElementById('demo');
  var SEP = { sep: true };

  /* What is open on the phone (not kept: a reload starts on the pen list) */
  var V = { lens: 'todo', pen: null, over: null, treat: null, death: null, move: null, count: null, bulk: null, confirm: null, end: null, flash: null };

  /* ---- small helpers ---- */
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  function hm(ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function sameDay(ms) { return new Date(ms).toDateString() === new Date().toDateString(); }
  function when(r) { return sameDay(r.at) ? hm(r.at) : T('day.n', { d: r.day }); }
  function short(who) { var p = who.split(/[.\s]+/).filter(Boolean); return p.length > 1 ? p[0] + '.' + p[p.length - 1][0] : who; }
  var tr = function (k) { return T('tr.' + k); }, trl = function (k) { return T('trl.' + k); };
  var pigs = function (n) { return T('piglets', { n: n }); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function pen() { return P.s.pens[V.pen]; }
  function treatRecs(code) { return P.recs(code).filter(function (r) { return !!P.plan(r.tr); }); }
  function newest(list) { return list.slice().sort(function (a, b) { return b.at - a.at; })[0]; }

  /* ================= the pen list ================= */
  /* the meta line for a pen with something to do: `due today · 12 piglets`, `late · day 6 · 11 piglets`, `2 left · weak` */
  function todoMeta(p) {
    var td = P.todo(p), sts = td.map(function (k) { return P.status(p, k); });
    var n = Math.max.apply(null, td.map(function (k) { return P.need(p, k); }));
    if (sts.every(function (s) { return s === 'left'; })) return [T('left', { n: P.need(p, td[0]) }), SEP, T('why.' + (p.tr[td[0]].why || 'weak'))];
    return [sts.indexOf('late') >= 0 ? { text: T('late') + ' · ' + T('day.n', { d: p.age }), tone: 'amber' } : T('due.today'), SEP, pigs(n)];
  }
  function penRow(p) {
    var ended = !!P.s.ended, td = P.todo(p), sts = td.map(function (k) { return P.status(p, k); });
    var late = sts.indexOf('late') >= 0, chip = null, headline, meta, tone = '';
    if (!ended && late) chip = { text: T('chip.late'), tone: 'amber' };
    else if (p.missing) chip = { text: T('chip.missing', { n: p.missing }), tone: 'amber' };
    else if (p.sowDied) chip = { text: T('chip.sow'), tone: 'red' };
    var lastR = newest(treatRecs(p.code)), c = P.coming(p);
    if (ended) {
      headline = T('ended.row'); tone = 'forecast';
      meta = td.concat(c).length ? T('not.given.list', { list: td.concat(c).map(tr).join(', ') }) : T('all.given');
    } else if (td.length) {
      headline = td.map(tr).join(' · ');
      meta = todoMeta(p);
    } else if (c.length) {
      headline = T('nothing.due'); tone = 'forecast';
      var next = T('from.day', { tr: trl(c[0]), d: P.plan(c[0]).from });
      meta = lastR ? [T('done.at', { t: when(lastR) }), SEP, next] : next;
    } else {
      headline = T('all.given');
      meta = lastR ? T('done.at', { t: when(lastR) }) : '';
    }
    return K.row({ id: p.code, chip: chip, headline: headline, tone: tone, meta: meta, action: 'pen', value: p.code });
  }
  function isDone(p) { return P.todo(p).length === 0; }
  function listScreen(inert) {
    var all = P.pens(), done = all.filter(isDone), todo = all.filter(function (p) { return !isDone(p); });
    var shown = V.lens === 'todo' ? todo : V.lens === 'done' ? done : all;
    var last = P.last();
    var body = K.latest(last ? { lead: T('last'), value: hm(last.at), rest: '· ' + last.who } : { lead: T('last.none') });
    if (V.flash && !V.pen) body += flashLine();
    P.s.notes.forEach(function (n, i) {
      if (n.seen) return;
      body += '<div class="sp-note">' + K.warning({ tone: 'amber', text: T('note.clash', { Tr: tr(n.tr), pen: n.pen, who: n.who, t: hm(n.at) }),
        actions: UI.button({ label: T('ok'), register: 'text', action: 'note-ok', value: String(i) }) }) + '</div>';
    });
    // the summary card: the treatment most pens need today | the task (pens done), the door to End
    var best = { k: '', n: 0 };
    P.PLAN.forEach(function (t) {
      var n = all.filter(function (p) { return P.status(p, t.key) === 'due'; }).length;
      if (n && !best.n) best = { k: t.key, n: n };
    });
    var ended = P.s.ended;
    var unit = ended ? { icon: 'treat', heading: T('sum.notdone'), value: String(todo.length), description: T('sum.pens', { n: todo.length }), support: T('batch', { b: P.BATCH.name }) }
      : { icon: 'treat', heading: best.n ? T('sum.due', { Tr: tr(best.k) }) : T('sum.none'), value: String(best.n),
        description: best.n ? T('sum.pens', { n: best.n }) : T('sum.nothing'), support: T('batch', { b: P.BATCH.name }) };
    body += K.summary({
      unit: unit,
      task: { icon: 'record', heading: ended ? T('sum.ended') : T('sum.task'), count: String(done.length), of: '/ ' + all.length, description: T('sum.done'),
        segments: [{ tone: 'done', share: done.length / all.length * 100 }, { tone: 'rest', share: 100 - done.length / all.length * 100 }], max: all.length, now: done.length,
        support: ended ? hm(ended.at) + ' · ' + ended.who : T('sum.end'), action: 'end', label: T('end.title') }
    });
    body += K.lens({ action: 'lens', tabs: [
      { text: T('lens.todo'), count: String(todo.length), value: 'todo', pressed: V.lens === 'todo' },
      { text: T('lens.done'), count: String(done.length), value: 'done', pressed: V.lens === 'done' },
      { text: T('lens.all'), count: String(all.length), value: 'all', pressed: V.lens === 'all' }] });
    var groups = ['A', 'B'].map(function (r) {
      var rows = shown.filter(function (p) { return p.row === r; });
      if (!rows.length) return '';
      return K.group({ title: T('row', { r: r }), face: 'word', meta: T('row.pens', { n: rows.length }), rows: rows.map(penRow) });
    }).join('');
    body += groups ? K.list(groups) : '<p class="sp-empty">' + esc(T(V.lens === 'done' ? 'empty.done' : 'empty.todo')) + '</p>';
    var dock = ended ? '' : K.dock({ primary: { icon: 'treat', label: T('dock.bulk'), action: 'bulk' } });
    return K.screen({ inert: inert, label: T('task'), header: K.header({ title: T('task'), back: null }), body: body, dock: dock });
  }

  /* The receipt line after a save: what was recorded, and Undo while it is the last change */
  function flashLine() {
    var f = V.flash;
    var undo = f.undo && P.s.undo ? UI.button({ label: T('undo'), register: 'text', action: 'undo' }) : '';
    return '<div class="sp-flash" role="status"><span>' + esc(f.text) + '</span>' + undo + '</div>';
  }

  /* ================= the pen sheet ================= */
  function penSheet(inert) {
    var p = pen(), ended = !!P.s.ended, body = '';
    if (V.flash && V.flash.pen === p.code) body += flashLine();
    if (ended) body += K.warning({ tone: 'amber', text: T('ended.note') });
    body += UI.facts([{ label: T('born'), value: String(p.born) }, { label: T('alive'), value: String(p.alive) }, { label: T('dead'), value: String(p.dead) }], { columns: 3 });
    var lines = [];
    if (p.sowDied) lines.push('<span data-tone="red">' + esc(T('line.sow')) + '</span>');
    if (p.missing) lines.push('<span data-tone="amber">' + esc(T('line.missing', { n: p.missing })) + '</span>');
    if (p.movedOut) lines.push('<span>' + esc(T('line.out', { n: p.movedOut })) + '</span>');
    if (p.movedIn) lines.push('<span>' + esc(T('line.in', { n: p.movedIn })) + '</span>');
    if (lines.length) body += '<p class="sp-lines">' + lines.join(' ') + '</p>';
    if (!ended) {
      body += '<div class="sp-toolrow">' + [['death', 'alert', 'tool.death'], ['move', 'transfer', 'tool.move'], ['count', 'edit', 'tool.count']].map(function (x) {
        return '<button type="button" class="sp-tool" data-action="tool" data-value="' + x[0] + '">' + I(x[1]) + '<span>' + esc(T(x[2])) + '</span></button>';
      }).join('') + '</div>';
    }
    // Today: what is due now, late, or left from before — each with its one-tap
    var td = P.todo(p);
    if (td.length) {
      body += K.day({ title: T(ended ? 'sec.notgiven' : 'sec.today'), status: T('sec.today.status', { d: p.age }), items: td.map(function (k) {
        var st = P.status(p, k), t = P.plan(k), n = P.need(p, k);
        var meta = st === 'left' ? [T('left', { n: n }), SEP, T('why.' + (p.tr[k].why || 'weak'))]
          : st === 'late' ? [{ text: T('late'), tone: 'amber' }, SEP, T('given.days', { a: t.from, b: t.to }), SEP, pigs(n)]
          : [T('given.days', { a: t.from, b: t.to }), SEP, pigs(n)];
        return { title: tr(k), meta: meta, mark: 'due', action: ended ? 'noop' : 'treat', value: k, id: 'sp-' + p.code + '-' + k,
          act: ended ? null : { label: T('record.n', { n: n }), action: 'one', value: k } };
      }) });
    }
    // Done: a tick with time and who
    var given = treatRecs(p.code).sort(function (a, b) { return a.at - b.at; });
    if (given.length) {
      body += K.day({ title: T('sec.done'), items: given.map(function (r) {
        var meta = [T('done.meta', { t: when(r), who: short(r.who), n: pigs(r.n) })];
        if (r.mark) meta.push(SEP, { text: T(r.mark), tone: 'amber' });
        var note = P.s.notes.filter(function (n) { return n.pen === r.pen && n.tr === r.tr; })[0];
        if (note) meta.push(SEP, T('kept.note') + ' (' + hm(note.mine.at) + ')');
        return { title: tr(r.tr), meta: meta, mark: 'done', action: 'noop', value: r.id };
      }) });
    }
    var c = P.coming(p);
    if (c.length) {
      body += K.day({ title: T('sec.coming'), items: c.map(function (k) {
        var t = P.plan(k);
        return { title: tr(k), meta: [T('coming.meta', { d: t.from }), SEP, T('given.days', { a: t.from, b: t.to })], mark: '', action: 'noop', value: k };
      }) });
    }
    return K.drawer({ title: p.code, subtitle: T('sheet.sub', { d: p.age, r: p.row }), size: 'long', height: 'full', view: 'pen', inert: inert, close: null,
      body: body, footer: K.footer({ back: { action: 'back', label: T('back') } }) });
  }

  /* ---- treating fewer: a stepper; a shortfall asks one reason ---- */
  function stepper(key, label, value, o) {
    return K.stepper(Object.assign({ label: label, value: value, key: key, action: 'step', min: 0 }, o || {}));
  }
  function treatSheet() {
    var p = pen(), d = V.treat, n = P.need(p, d.k), less = d.n < n;
    var body = stepper('treat', T('treat.given'), d.n, { max: n });
    if (less) {
      body += K.radios({ label: T('treat.why'), action: 'why', key: 'why', selected: d.why, options: [
        { value: 'weak', label: T('treat.weak') }, { value: 'sick', label: T('treat.sick') }] });
      body += '<p class="sp-quiet">' + esc(T('treat.later', { n: n - d.n })) + '</p>';
    }
    var ready = d.n > 0 && (!less || d.why);
    return K.drawer({ title: tr(d.k), subtitle: T('treat.sub', { pen: p.code, d: p.age, n: n }), size: 'long', view: 'treat', close: null, body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('record.n', { n: d.n }), action: 'treat-save', register: 'primary', waiting: !ready } }) });
  }

  /* ---- record death ---- */
  var CAUSES = ['crushed', 'scours', 'starve', 'other'];
  function deathSheet() {
    var p = pen(), d = V.death, k = CAUSES.reduce(function (s, c) { return s + d.c[c]; }, 0);
    var body = CAUSES.map(function (c) { return stepper(c, T('c.' + c), d.c[c], { max: p.alive + p.missing }); }).join('');
    if (p.missing && k > 0) {
      body += K.radios({ layout: 'row', label: T(k === 1 ? 'death.missing' : 'death.missing.n'), action: 'miss', key: 'miss', selected: d.miss,
        options: [{ value: 'no', label: T('no') }, { value: 'yes', label: T('yes') }] });
    }
    var ready = k > 0 && (!p.missing || d.miss);
    return K.drawer({ title: T('death.title'), subtitle: T('death.sub', { pen: p.code, n: p.alive }), size: 'long', view: 'death', close: null, body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('save'), action: 'death-save', register: 'primary', waiting: !ready } }) });
  }

  /* ---- move piglets: the other pen (same batch), how many, and for what was given here: had it? ---- */
  function movePage() {
    var p = pen(), d = V.move;
    var others = P.pens().filter(function (o) { return P.sameBatch(p, o); });
    var body = '<section class="sp-pick">' + UI.heading({ title: T('move.to'), kind: 'section', level: 3 }) +
      '<div class="tk-choice sp-pens" role="group" aria-label="' + esc(T('move.to')) + '">' + others.map(function (o) {
        return '<button type="button" class="tk-choice-tile" aria-pressed="' + (d.to === o.code) + '" data-action="move-to" data-value="' + o.code + '">' +
          '<strong>' + o.code + '</strong><small>' + esc(T('day.n', { d: o.age })) + '</small></button>';
      }).join('') + '</div></section>';
    body += stepper('move', T('move.how'), d.n, { min: 1, max: p.alive, variant: 'hero', hint: '' });
    P.PLAN.forEach(function (t) {
      if (p.tr[t.key].got > 0) {
        body += K.radios({ layout: 'row', label: T('move.had', { tr: trl(t.key) }), action: 'had', key: t.key, selected: d.had[t.key] == null ? '' : d.had[t.key] ? 'yes' : 'no',
          options: [{ value: 'no', label: T('no') }, { value: 'yes', label: T('yes') }] });
      }
    });
    var asked = P.PLAN.filter(function (t) { return p.tr[t.key].got > 0; });
    var ready = d.to && d.n > 0 && asked.every(function (t) { return d.had[t.key] != null; });
    return K.page({ title: T('move.title'), description: T('move.sub', { pen: p.code, n: p.alive }), view: 'move', body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('move.save', { n: pigs(d.n) }), action: 'move-save', register: 'primary', waiting: !ready } }) });
  }

  /* ---- set count: a big stepper from Alive; lower asks one quiet choice ---- */
  function countSheet() {
    var p = pen(), d = V.count;
    var body = stepper('count', T('count.label'), d.n, { variant: 'hero', face: 'count', min: 0, hint: '' });
    if (d.n < p.alive) {
      body += K.radios({ label: '', action: 'count-why', key: 'cwhy', selected: d.why, options: [
        { value: 'unsure', label: T('count.unsure') }, { value: 'wrong', label: T('count.wrong') }] });
    }
    return K.drawer({ title: T('count.title'), subtitle: T('count.sub', { pen: p.code, n: p.alive }), size: 'long', view: 'count', close: null, body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('save'), action: 'count-save', register: 'primary', waiting: d.n === p.alive } }) });
  }

  /* ================= bulk: one treatment over several pens ================= */
  function bulkPick() {
    var items = P.PLAN.map(function (t) {
      var n = P.pens().filter(function (p) { return P.status(p, t.key) === 'due'; }).length;
      return { title: tr(t.key), description: n ? T('bulk.pens.now', { n: n }) : T('bulk.pens.none'), action: 'bulk-tr', value: t.key };
    });
    return K.drawer({ title: T('bulk.title'), subtitle: T('bulk.pick'), size: 'long', view: 'bulk-pick', close: null, body: K.doors({ items: items }),
      footer: K.footer({ back: { action: 'back', label: T('back') } }) });
  }
  function bulkStart(k) {
    var sel = {};
    P.pens().forEach(function (p) { if (P.status(p, k) === 'due') sel[p.code] = ''; });
    V.bulk = { step: 'list', k: k, sel: sel };
  }
  function bulkTotals() {
    var b = V.bulk, codes = Object.keys(b.sel), n = 0;
    codes.forEach(function (c) { n += P.need(P.s.pens[c], b.k); });
    return { pens: codes.length, n: n };
  }
  function bulkPage() {
    var b = V.bulk, k = b.k, t = P.plan(k), place = { now: [], early: [], late: [], done: [] };
    P.pens().forEach(function (p) { place[P.bulkPlace(p, k)].push(p); });
    function tick(p, amber) {
      var on = b.sel[p.code] != null, st = P.status(p, k), n = P.need(p, k);
      var meta = st === 'left' ? T('bulk.left', { n: n, why: T('why.' + (p.tr[k].why || 'weak')) }) : amber ? [{ text: T('day.n', { d: p.age }), tone: 'amber' }] : T('day.n', { d: p.age });
      return K.row({ id: p.code, chip: amber ? { text: T(amber === 'late' ? 'Late' : 'Early'), tone: 'amber' } : null, headline: pigs(n), meta: meta,
        trail: 'tick', tick: { action: 'tick', value: p.code, checked: on, label: p.code } });
    }
    function done(p) {
      var r = newest(P.recs(p.code, k));
      return K.row({ id: p.code, chip: { text: T('g.done'), tone: 'green' }, headline: r ? T('done.at', { t: when(r) }) : T('all.given'), tone: 'forecast',
        meta: r ? short(r.who) + ' · ' + pigs(r.n) : '', still: true, trail: '' });
    }
    var g = function (key, rows) { return rows.length ? K.group({ title: T('g.' + key), face: 'word', meta: T('row.pens', { n: rows.length }), rows: rows }) : ''; };
    var body = K.list([
      g('now', place.now.map(function (p) { return tick(p, ''); })),
      g('early', place.early.map(function (p) { return tick(p, 'early'); })),
      g('late', place.late.map(function (p) { return tick(p, 'late'); })),
      g('done', place.done.map(done))]);
    var tot = bulkTotals();
    var label = T('bulk.hold', { tr: trl(k), p: T('pens.n', { n: tot.pens }), n: pigs(tot.n) });
    return K.page({ title: T('bulk.page', { tr: tr(k) }), description: T('bulk.window', { a: t.from, b: t.to }), view: 'bulk', body: body, inert: !!V.confirm,
      footer: K.footer({ back: { action: 'back', label: T('back') }, hold: { label: label, caption: T('bulk.caption'), action: 'bulk-commit', tone: 'primary', waiting: tot.pens === 0 },
        status: { text: tot.pens ? label : T('bulk.none'), id: 'sp-bulk-status' } }) });
  }
  function confirmDialog() {
    var c = V.confirm, p = P.s.pens[c.pen], t = P.plan(V.bulk.k);
    return K.dialog({ icon: 'alert', title: T('confirm.title'),
      description: T('confirm.text', { pen: p.code, d: p.age, Tr: tr(t.key), a: t.from, b: t.to, mark: T(c.mark) }),
      footer: '<div class="tk-footer sp-two">' + UI.button({ label: T('cancel'), register: 'secondary', action: 'confirm-no' }) +
        UI.button({ label: T('confirm.ok'), register: 'primary', action: 'confirm-yes' }) + '</div>' });
  }
  function bulkReceipt() {
    var b = V.bulk, n = b.recs.reduce(function (s, r) { return s + r.n; }, 0);
    var rows = b.recs.map(function (r) {
      return K.row({ id: r.pen, chip: r.mark ? { text: T(r.mark === 'late' ? 'Late' : 'Early'), tone: 'amber' } : null, headline: pigs(r.n), meta: T('day.n', { d: r.day }), still: true, trail: '' });
    });
    var body = K.receipt({ title: T('receipt.title', { Tr: tr(b.k) }), meta: [T('receipt.line', { p: T('pens.n', { n: b.recs.length }), n: pigs(n) }), SEP, T('receipt.meta', { t: hm(b.at), who: P.ME })] }) +
      K.list([K.group({ title: tr(b.k), face: 'word', meta: T('row.pens', { n: rows.length }), rows: rows })]);
    var undo = P.s.undo && P.s.undo.kind === 'bulk' ? UI.button({ label: T('undo'), register: 'secondary', action: 'bulk-undo' }) : '';
    return K.page({ title: T('receipt.title', { Tr: tr(b.k) }), view: 'bulk-receipt', body: body,
      footer: '<div class="tk-footer sp-two">' + undo + UI.button({ label: T('done.btn'), register: 'primary', action: 'bulk-close' }) + '</div>' });
  }

  /* ================= End task (the supervisor) ================= */
  function endPage() {
    var all = P.pens(), notDone = all.filter(function (p) { return !isDone(p); }), d = all.length - notDone.length, ended = P.s.ended;
    var body = '';
    if (ended) body += K.receipt({ title: T('end.done.line'), meta: hm(ended.at) + ' · ' + ended.who });
    body += K.progress({ title: T('end.count', { d: d, n: all.length }), meta: notDone.length ? T('end.not', { n: notDone.length }) : T('end.all'),
      segments: [{ tone: 'done', share: d / all.length * 100 }, { tone: 'rest', share: notDone.length / all.length * 100 }], max: all.length, now: d });
    if (notDone.length) {
      body += K.list([K.group({ title: T(ended ? 'sec.notgiven' : 'end.notdone'), face: 'word', meta: T('row.pens', { n: notDone.length }), rows: notDone.map(function (p) {
        return K.row({ id: p.code, headline: P.todo(p).map(tr).join(' · '), meta: ended ? '' : todoMeta(p), still: true, trail: '' });
      }) })]);
    }
    var soon = all.filter(function (p) { return P.coming(p).length; });
    if (soon.length && !ended) {
      var names = []; soon.forEach(function (p) { P.coming(p).forEach(function (k) { if (names.indexOf(tr(k)) < 0) names.push(tr(k)); }); });
      body += '<p class="sp-quiet">' + esc(T('end.coming', { n: soon.length, list: names.join(', ') })) + '</p>';
    }
    var f = ended ? K.footer({ back: { action: 'back', label: T('back') } })
      : K.footer({ back: { action: 'back', label: T('back') }, hold: { label: T('end.hold'), caption: T('end.caption'), action: 'end-commit', tone: 'danger' } });
    return K.page({ title: ended ? T('end.done.title') : T('end.title'), description: T('end.sub', { b: P.BATCH.name }), view: 'end', body: body, footer: f });
  }

  /* ================= render ================= */
  function render() {
    document.documentElement.lang = L.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = T('task');
    // keep each scroller where it was when the same surface is drawn again
    var keep = {};
    phone.querySelectorAll('.tk-scroll, .tk-sheet-body, .tk-page-body').forEach(function (el) {
      var host = el.closest('[data-view]'); keep[(host ? host.getAttribute('data-view') : 'list') + el.className] = el.scrollTop;
    });
    var focusSel = null, a = document.activeElement;
    if (a && phone.contains(a)) {
      if (a.id) focusSel = '#' + CSS.escape(a.id);
      else if (a.getAttribute('data-action')) focusSel = '[data-action="' + a.getAttribute('data-action') + '"][data-value="' + (a.getAttribute('data-value') || '') + '"]';
    }
    var over = !!(V.pen || V.bulk || V.end);
    var html = K.statusbar() + listScreen(over);
    if (V.pen) html += penSheet(!!(V.over || V.bulk || V.end));
    if (V.pen && V.over === 'treat') html += treatSheet();
    if (V.pen && V.over === 'death') html += deathSheet();
    if (V.pen && V.over === 'count') html += countSheet();
    if (V.pen && V.over === 'move') html += movePage();
    if (V.bulk && V.bulk.step === 'pick') html += bulkPick();
    if (V.bulk && V.bulk.step === 'list') html += bulkPage() + (V.confirm ? confirmDialog() : '');
    if (V.bulk && V.bulk.step === 'receipt') html += bulkReceipt();
    if (V.end) html += endPage();
    phone.innerHTML = html;
    phone.querySelectorAll('.tk-scroll, .tk-sheet-body, .tk-page-body').forEach(function (el) {
      var host = el.closest('[data-view]'), k = (host ? host.getAttribute('data-view') : 'list') + el.className;
      if (keep[k] != null) el.scrollTop = keep[k];
    });
    if (V.pageTop) { phone.querySelectorAll('.tk-page-body').forEach(function (x) { x.scrollTop = 0; }); V.pageTop = false; }
    if (V.toTop) { var sc = phone.querySelector('.tk-scroll'); if (sc) sc.scrollTop = 0; V.toTop = false; }
    if (focusSel) { var f = phone.querySelector(focusSel); if (f && f.focus) f.focus({ preventScroll: true }); }
    renderDemo();
  }

  /* ---- outside the phone: language, reset, the other phone ---- */
  function renderDemo() {
    demo.setAttribute('data-open', V.demoOpen ? 'true' : 'false');
    demo.innerHTML = '<button type="button" class="sp-demo-toggle" data-demo="toggle" aria-expanded="' + !!V.demoOpen + '">' + esc(T('demo.open')) + '</button>' +
      '<div class="sp-demo-panel"><div class="sp-demo-lang" role="group" aria-label="' + esc(T('demo.lang')) + '">' +
      '<button type="button" data-demo="lang" data-value="en" aria-pressed="' + (L.lang === 'en') + '">en</button>' +
      '<button type="button" data-demo="lang" data-value="zh" aria-pressed="' + (L.lang === 'zh') + '">中文</button></div>' +
      '<button type="button" class="sp-demo-btn" data-demo="other">' + esc(T('demo.other')) + '</button>' +
      '<p class="sp-demo-tip">' + esc(T('demo.tip')) + '</p>' +
      (V.demoMsg ? '<p class="sp-demo-msg" role="status">' + esc(V.demoMsg) + '</p>' : '') +
      '<button type="button" class="sp-demo-link" data-demo="reset">' + esc(T('demo.reset')) + '</button></div>';
  }
  demo.addEventListener('click', function (e) {
    var b = e.target.closest('[data-demo]'); if (!b) return;
    var w = b.getAttribute('data-demo');
    V.demoMsg = '';
    if (w === 'toggle') { V.demoOpen = !V.demoOpen; renderDemo(); return; }
    if (w === 'lang') L.setLang(b.getAttribute('data-value'));
    if (w === 'reset') { P.reset(); V = { lens: 'todo', pen: null, over: null, bulk: null, confirm: null, end: null, flash: null, demoOpen: V.demoOpen }; }
    if (w === 'other') {
      var r = P.otherPhone();
      if (r.kind === 'arrived') { V.flash = { text: T('note.arrived', { who: P.OTHER, tr: trl('iron'), pen: 'A05', t: hm(r.at) }) }; if (V.pen) V.flash.pen = V.pen; }
      if (r.kind === 'clash') { V.flash = null; V.toTop = true; }
      if (r.kind === 'again') V.demoMsg = T('demo.again');
      if (r.kind === 'ended') V.demoMsg = T('demo.ended');
      if (r.kind === 'clash' && V.pen === 'A05') V.flash = { pen: 'A05', text: T('note.clash', { Tr: tr('iron'), pen: 'A05', who: P.OTHER, t: hm(r.note.at) }) };
    }
    render();
  });

  /* ================= what a tap does ================= */
  function closeTop() {
    if (V.confirm) V.confirm = null;
    else if (V.bulk) V.bulk = V.bulk.step === 'list' ? { step: 'pick' } : null;
    else if (V.end) V.end = null;
    else if (V.over) V.over = null;
    else if (V.pen) { V.pen = null; V.flash = null; }
  }
  function saved(text) { V.flash = { pen: V.pen, text: text, undo: true }; }
  function act(a, v, el) {
    var p = V.pen ? pen() : null;
    switch (a) {
      case 'lens': V.lens = v; break;
      case 'pen': V.pen = v; V.flash = null; break;
      case 'dismiss': case 'back': closeTop(); break;
      case 'noop': return;
      case 'end': V.end = true; break;
      case 'bulk': V.bulk = { step: 'pick' }; break;
      case 'bulk-tr': bulkStart(v); break;
      case 'tick': {
        var place = P.bulkPlace(P.s.pens[v], V.bulk.k);
        if (V.bulk.sel[v] != null) delete V.bulk.sel[v];
        else if (place === 'early' || place === 'late') { el.checked = false; V.confirm = { pen: v, mark: place }; }
        else V.bulk.sel[v] = '';
        break;
      }
      case 'confirm-yes': V.bulk.sel[V.confirm.pen] = V.confirm.mark; V.confirm = null; break;
      case 'confirm-no': V.confirm = null; break;
      case 'bulk-undo': P.undo(); V.bulk = null; V.flash = { text: T('undone') }; break;
      case 'bulk-close': V.bulk = null; break;
      case 'one': {
        var n1 = P.need(p, v);
        P.treat(p.code, v, n1);
        saved(T('flash.treat', { tr: tr(v), n: pigs(n1) }));
        break;
      }
      case 'treat': V.over = 'treat'; V.treat = { k: v, n: P.need(p, v), why: '' }; break;
      case 'step': {
        var d = +el.getAttribute('data-step');
        if (V.over === 'treat') V.treat.n = Math.max(0, Math.min(P.need(p, V.treat.k), V.treat.n + d));
        if (V.over === 'death') V.death.c[v] = Math.max(0, V.death.c[v] + d);
        if (V.over === 'count') V.count.n = Math.max(0, V.count.n + d);
        if (V.over === 'move') V.move.n = Math.max(1, Math.min(p.alive, V.move.n + d));
        break;
      }
      case 'why': V.treat.why = v; break;
      case 'treat-save': {
        var t = V.treat;
        P.treat(p.code, t.k, t.n, t.n < P.need(p, t.k) ? t.why : '');
        V.over = null; saved(T('flash.treat', { tr: tr(t.k), n: pigs(t.n) }));
        break;
      }
      case 'tool':
        V.over = v;
        if (v === 'death') V.death = { c: { crushed: 0, scours: 0, starve: 0, other: 0 }, miss: '' };
        if (v === 'move') V.move = { to: '', n: 1, had: {} };
        if (v === 'count') V.count = { n: p.alive, why: 'unsure' };
        break;
      case 'miss': V.death.miss = v; break;
      case 'death-save': {
        var k = P.death(p.code, V.death.c, V.death.miss === 'yes');
        V.over = null; saved(T('flash.death', { n: pigs(k) }));
        break;
      }
      case 'move-to': V.move.to = v; break;
      case 'had': { var f = el.closest('[data-field]'); V.move.had[f.getAttribute('data-field')] = v === 'yes'; break; }
      case 'move-save': {
        var m = V.move;
        P.move(p.code, m.to, m.n, m.had);
        V.over = null; saved(T('flash.move', { n: pigs(m.n), to: m.to }));
        break;
      }
      case 'count-why': V.count.why = v; break;
      case 'count-save': {
        var c = V.count;
        P.setCount(p.code, c.n, c.n < p.alive ? c.why : 'wrong');
        V.over = null; saved(T('flash.count', { n: c.n }));
        break;
      }
      case 'undo': P.undo(); V.flash = { pen: V.pen, text: T('undone') }; break;
      case 'note-ok': P.seeNote(+v); break;
      default: return;
    }
    render();
  }
  phone.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || !phone.contains(el) || el.classList.contains('st-hold')) return;
    if (UI.guard(el)) return;
    act(el.getAttribute('data-action'), el.getAttribute('data-value') != null ? el.getAttribute('data-value') : el.value, el);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && (V.pen || V.bulk || V.end)) { closeTop(); render(); }
  });
  var holds = K.holdBind(phone, { onCommit: function (b) {
    var a = b.getAttribute('data-action');
    setTimeout(function () {
      holds.settle(b, 'done');
      if (a === 'bulk-commit') {
        var bk = V.bulk, picks = Object.keys(bk.sel).sort().map(function (c) { return { pen: c, mark: bk.sel[c] }; });
        var recs = P.bulk(bk.k, picks);
        V.bulk = { step: 'receipt', k: bk.k, recs: recs || [], at: Date.now() };
      }
      if (a === 'end-commit') { P.end(); V.pageTop = true; }
      render();
    }, 250);
  } });

  render();
})();
