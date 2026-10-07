/* Simple piglet processing: the screens. Built from the task skeleton (window.SentriTask) and the design-system cards
   (window.SentriUI); the data is state.js (window.PPS), the words strings.js (window.PPT). One render() draws the phone.
   Structure and flow follow the farm's existing design (Figma 生产任务 · 仔猪处理, research/inventory.md §2): a list by pen,
   and inside a pen two tabs — Processing (a checklist by age-day, one tick per item, one Submit) and Piglets (what is in
   the pen now, and the identified piglets) — with [⋯] More for Move · Record death · Set count. */
(function () {
  'use strict';
  var K = window.SentriTask, UI = window.SentriUI, P = window.PPS, L = window.PPT, I = window.SentriIcons.icon;
  var T = function (k, a) { return L.t(k, a); };
  var phone = document.getElementById('phone'), demo = document.getElementById('demo');
  var SEP = { sep: true };

  /* What is open on the phone (not kept: a reload starts on the pen list) */
  function fresh(keep) {
    return { chip: '', pen: null, tab: 'proc', draft: {}, over: null, adj: null, death: null, move: null, count: null, weight: null, idf: null,
      end: null, flash: null, open: {}, keepOpen: {}, justRec: [], demoOpen: keep ? keep.demoOpen : false };
  }
  var V = fresh();

  /* ---- small helpers ---- */
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  function hm(ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function md(ms) { var d = new Date(ms); return pad(d.getMonth() + 1) + '/' + pad(d.getDate()); }
  function sameDay(ms) { return new Date(ms).toDateString() === new Date().toDateString(); }
  function when(r) { return sameDay(r.at) ? hm(r.at) : md(r.at) + ' ' + hm(r.at); }
  function short(who) { var p = who.split(/[.\s]+/).filter(Boolean); return p.length > 1 ? p[0] + '.' + p[p.length - 1][0] : who; }
  var scheme = function () { return P.s.scheme; };
  var tr = function (k) { return k === 'id' ? T('tr.id.' + scheme()) : T('tr.' + k); };
  var trl = function (k) { return k === 'id' ? T('trl.id.' + scheme()) : T('trl.' + k); };
  var chipName = function (k) { return k === 'id' ? T('chip.id.' + scheme()) : T('tr.' + k); };
  var pigs = function (n) { return T('piglets', { n: n }); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  /* The same words with their registry id (ux/laws/strings.json, `sp.<key>`): S for a skeleton text slot, H for raw HTML,
     btn for a design-system Button. The strict design lint checks every visible string on the list through these. */
  function S(k, a, tone) { var o = { text: T(k, a), str: 'sp.' + L.key(k, a), args: a || undefined }; if (tone) o.tone = tone; return o; }
  function H(k, a) { return '<span data-str="sp.' + esc(L.key(k, a)) + '">' + esc(T(k, a)) + '</span>'; }
  function btn(k, a, o) { return UI.button(Object.assign({ label: T(k, a), strs: { label: 'sp.' + L.key(k, a) } }, o || {})); }
  var chipKey = function (k) { return k === 'id' ? 'chip.id.' + scheme() : 'tr.' + k; };
  function pen() { return P.s.pens[V.pen]; }
  function newest(list) { return list.slice().sort(function (a, b) { return b.at - a.at; })[0]; }
  /* the ID step in words: `4 of 12 tagged`, `1 breeder picked` */
  function idKey(p) { return scheme() === 'breeders' ? ['id.picked', { n: P.breeders(p) }] : ['id.of.' + scheme(), { n: P.idCount(p), m: p.alive }]; }
  function idWhat(p) { var x = idKey(p); return T(x[0], x[1]); }
  function idS(p) { var x = idKey(p); return S(x[0], x[1]); }
  var reduced = function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  function lastWeight(p) { return p.weights.length ? p.weights[p.weights.length - 1] : null; }

  /* ================= the pen list: one row per pen ================= */
  /* One rule for "needs it today": the step is due, late, or has piglets left from before. The summary card, the chip's
     count and the chip's list all use it. */
  function needsToday(p, k) { var s = P.status(p, k); return s === 'due' || s === 'late' || s === 'left'; }
  /* `due today · 12 piglets`, `late · day 6 · 11 piglets`, `2 left · weak` (the End page's not-done list) */
  function todoMeta(p) {
    var td = P.todo(p), sts = td.map(function (k) { return P.status(p, k); });
    var tk = td.filter(function (k) { return k !== 'id'; });
    if (tk.length && td.length === tk.length && tk.every(function (k) { return P.status(p, k) === 'left'; })) return [S('left', { n: P.need(p, tk[0]) }), SEP, S('why.' + (p.tr[tk[0]].why || 'weak'))];
    var amount = tk.length ? S('piglets', { n: Math.max.apply(null, tk.map(function (k) { return P.need(p, k); })) }) : idS(p);
    return [sts.indexOf('late') >= 0 ? S('late.day', { d: p.age }, 'amber') : S('due.today'), SEP, amount];
  }
  function penChip(p) {
    var sts = P.todo(p).map(function (k) { return P.status(p, k); });
    if (!P.s.ended && sts.indexOf('late') >= 0) return S('chip.late', null, 'amber');
    if (p.sowDied) return S('chip.sow', null, 'red');
    return null;
  }
  function names(keys) { return keys.reduce(function (acc, k, i) { return (i ? acc.concat([SEP]) : acc).concat([S(chipKey(k))]); }, []); }
  /* the row: pen code (and a chip) · one status with what it needs · `Sow 000231 · 12 piglets · day 3` */
  function penRow(p) {
    var td = P.todo(p), c = P.coming(p), headline, tone = '';
    if (P.s.ended) { headline = [S('ended.row')]; tone = 'forecast'; }
    else if (td.length) headline = [S('st.todo'), SEP].concat(names(td));
    else if (c.length) {
      var next = Math.min.apply(null, c.map(function (k) { return P.plan(k).from; }));
      headline = [S('st.next', { n: next - p.age }), SEP].concat(names(c.filter(function (k) { return P.plan(k).from === next; }))); tone = 'forecast';
    } else { headline = [S('st.done')]; tone = 'forecast'; }
    var meta = [S('sow', { tag: p.sow }), SEP, S('piglets', { n: p.alive }), SEP, S('day.n', { d: p.age })];
    return K.row({ id: S('code', { c: p.code }), chip: penChip(p), headline: headline, tone: tone, meta: meta, action: 'pen', value: p.code });
  }
  function isDone(p) { return P.todo(p).length === 0; }
  /* the chips: All · one per job that pens need today (with how many) · Done. A chip only filters the pens. */
  function chipCounts() {
    var all = P.pens();
    if (P.s.ended) return [];
    return P.steps().map(function (k) { return { k: k, n: all.filter(function (p) { return needsToday(p, k); }).length }; })
      .filter(function (c) { return c.n > 0 || c.k === V.chip; });
  }
  function chipsRow() {
    var all = P.pens(), done = all.filter(isDone).length;
    var items = [{ value: '', label: S('chips.all'), count: S('fig', { v: all.length }), checked: V.chip === '', aria: T('chips.all') }]
      .concat(chipCounts().map(function (c) { return { value: c.k, label: S(chipKey(c.k)), count: S('fig', { v: c.n }), checked: V.chip === c.k, aria: T('chip.aria', { name: chipName(c.k), n: c.n }) }; }))
      .concat([{ value: 'done', label: S('chips.done'), count: S('fig', { v: done }), checked: V.chip === 'done', aria: T('chips.done') }]);
    return K.chips({ items: items, action: 'chip', key: 'chips', label: T('chips.label') });
  }
  /* the task's overall checker: piglets the records cannot account for (set counts lower than the record), batch level only */
  function batchLine() { var u = P.s.unaccounted || 0; return u > 0 ? S('batch.unacc', { b: P.BATCH.name, n: u }) : S('batch', { b: P.BATCH.name }); }
  function listScreen(inert) {
    var all = P.pens(), done = all.filter(isDone), todo = all.filter(function (p) { return !isDone(p); }), ended = P.s.ended;
    var last = P.last();
    var body = K.latest(last ? { lead: S('last'), value: S('fig', { v: hm(last.at) }), rest: S('last.who', { who: last.who }) } : { lead: S('last.none') });
    if (V.flash && !V.pen) body += flashLine();
    P.s.notes.forEach(function (n, i) {
      if (n.seen) return;
      body += '<div class="sp-note">' + K.warning({ tone: 'amber', text: S('note.clash', { Tr: tr(n.tr), pen: n.pen, who: n.who, t: hm(n.at) }),
        actions: btn('ok', null, { register: 'text', action: 'note-ok', value: String(i) }) }) + '</div>';
    });
    // the summary card: the first job on the plan that pens need today (the same count as its chip) | the task, the door to End
    var best = { k: '', n: 0 };
    P.steps().forEach(function (k) {
      var n = all.filter(function (p) { return needsToday(p, k); }).length;
      if (n && !best.n) best = { k: k, n: n };
    });
    var unit = ended ? { icon: 'treat', heading: S('sum.notdone'), value: S('fig', { v: todo.length }), description: S('sum.pens', { n: todo.length }), support: batchLine() }
      : { icon: 'treat', heading: best.n ? S('sum.due', { Tr: tr(best.k) }) : S('sum.none'), value: S('fig', { v: best.n }),
        description: best.n ? S('sum.pens', { n: best.n }) : S('sum.nothing'), support: batchLine() };
    body += K.summary({
      unit: unit,
      task: { icon: 'record', heading: ended ? S('sum.ended') : S('sum.task'), count: S('fig', { v: done.length }), of: S('of', { n: all.length }), description: S('sum.done'),
        segments: [{ tone: 'done', share: done.length / all.length * 100 }, { tone: 'rest', share: 100 - done.length / all.length * 100 }], max: all.length, now: done.length,
        support: ended ? S('ended.at', { t: hm(ended.at), who: ended.who }) : S('sum.end'), action: 'end', label: T('end.title') }
    });
    body += chipsRow();
    var shown = !V.chip ? all : V.chip === 'done' ? done : all.filter(function (p) { return needsToday(p, V.chip); });
    body += shown.length ? K.list([K.group({ title: S('pens.n', { n: shown.length }), face: 'word', rows: shown.map(penRow) })])
      : '<p class="sp-empty">' + H(V.chip === 'done' ? 'empty.done' : 'chip.none') + '</p>';
    return K.screen({ inert: inert, label: T('task'), header: K.header({ title: S('task'), back: null }), body: body });
  }

  /* The receipt line after a save: what was saved, and Undo while it can still be taken back */
  function flashLine() {
    var f = V.flash;
    var undo = f.undoIds ? btn('undo', null, { register: 'text', action: 'undo-items' }) : f.undo && P.s.undo ? btn('undo', null, { register: 'text', action: 'undo' }) : '';
    return '<div class="sp-flash" role="status"><span>' + (f.key ? H(f.key, f.args) : esc(f.text)) + '</span>' + undo + '</div>';
  }

  /* ================= inside a pen: Processing | Piglets ================= */
  function metaHtml(parts) {
    return parts.map(function (x) {
      if (x.sep) return '<span class="tk-sep">·</span>';
      if (typeof x === 'object') return '<span class="tk-tone" data-tone="' + esc(x.tone) + '">' + esc(x.text) + '</span>';
      return esc(x);
    }).join('');
  }
  var dayDate = function (p, d) { return md(Date.now() - (p.age - d) * 864e5); };
  /* A done item: grey tick, who and when, how many (and an early / late mark). Rows saved on this visit fill in place. */
  function doneItem(p, k) {
    var meta;
    if (k === 'id') {
      var r = newest(P.recs(p.code, 'id').concat(P.recs(p.code, 'pick')));
      meta = r ? [short(r.who) + ' ' + when(r), SEP, idWhat(p)] : [idWhat(p)];
      return '<button type="button" class="sp-item" data-state="done" data-action="id-open" data-value="id"><span class="sp-done-mark" aria-hidden="true">' + I('check') + '</span>' +
        '<span class="sp-item-copy"><strong>' + esc(tr(k)) + '</strong><small>' + metaHtml(meta) + '</small></span>' + I('chevron') + '</button>';
    }
    var rs = P.recs(p.code, k), r2 = newest(rs), n = rs.reduce(function (s, x) { return s + x.n; }, 0);
    meta = r2 ? [short(r2.who) + ' ' + when(r2), SEP, pigs(n || p.tr[k].got)] : [pigs(p.tr[k].got)];
    var mk = rs.filter(function (x) { return x.mark; })[0];
    if (mk) meta.push(SEP, { text: T(mk.mark === 'early' ? 'item.early' : mk.mark), tone: 'amber' });
    var note = P.s.notes.filter(function (x) { return x.pen === p.code && x.tr === k; })[0];
    if (note) meta.push(SEP, T('kept.note') + ' (' + hm(note.mine.at) + ')');
    var fresh = r2 && V.justRec.indexOf(r2.id) >= 0;
    return '<div class="sp-item" data-state="done"' + (fresh ? ' data-fresh=""' : '') + '><span class="sp-done-mark" aria-hidden="true">' + I('check') + '</span>' +
      '<span class="sp-item-copy"><strong>' + esc(tr(k)) + '</strong><small>' + metaHtml(meta) + '</small></span></div>';
  }
  /* An item still to do: ONE checkbox row. Ticked, it shows its count as a small button (fewer piglets: tap it). The
     identity item is a chevron row to the ID form instead. */
  function todoItem(p, k, ended, future) {
    var t = P.plan(k), st = P.status(p, k), n = P.need(p, k);
    if (k === 'id') {
      var filled = scheme() === 'breeders' ? !!p.picked : P.recs(p.code, 'id').length > 0;
      var meta = [{ text: T(filled ? 'item.filled' : 'item.notfilled'), tone: filled ? 'green' : 'amber' }, SEP, idWhat(p)];
      if (st === 'late') meta.push(SEP, { text: T('late'), tone: 'amber' });
      return '<button type="button" class="sp-item" data-state="door" data-action="' + (ended ? 'noop' : 'id-open') + '" data-value="id"><span class="sp-ring" aria-hidden="true"></span>' +
        '<span class="sp-item-copy"><strong>' + esc(tr(k)) + '</strong><small>' + metaHtml(meta) + '</small></span>' + I('chevron') + '</button>';
    }
    var d = V.draft[k], on = !!d;
    var meta2 = st === 'left' ? [T('tl.given', { n: p.tr[k].got }), SEP, T('left', { n: n }), SEP, T('why.' + (p.tr[k].why || 'weak'))]
      : [T('given.days', { a: t.from, b: t.to })];
    if (st === 'late') meta2.push(SEP, { text: T('late'), tone: 'amber' });
    if (future && on) meta2.push(SEP, { text: T('item.early'), tone: 'amber' });
    if (on && d.n < n) meta2.push(SEP, { text: T('left', { n: n - d.n }) + ' · ' + T('why.' + (d.why || 'weak')), tone: 'amber' });
    var count = on ? '<button type="button" class="sp-count" data-action="adjust" data-value="' + k + '" aria-label="' + esc(T('treat.given') + ': ' + d.n) + '">' + esc(pigs(d.n)) + I('chevron') + '</button>' : '';
    var box = '<button type="button" class="sp-box" role="checkbox" aria-checked="' + on + '" data-action="' + (ended ? 'noop' : 'item') + '" data-value="' + k + '" aria-label="' + esc(tr(k)) + '">' + I('check') + '</button>';
    return '<div class="sp-item" data-state="' + (on ? 'ticked' : 'todo') + '"' + (V.justTick === k ? ' data-fresh=""' : '') + '>' +
      '<button type="button" class="sp-item-main" data-action="' + (ended ? 'noop' : 'item') + '" data-value="' + k + '" tabindex="-1"><span class="sp-item-copy"><strong>' + esc(tr(k)) + '</strong><small>' + metaHtml(meta2) + '</small></span></button>' +
      count + box + '</div>';
  }
  /* Processing: one section per age-day on the plan. A day with everything done folds to one line (it stays open while
     rows saved on this visit are fresh); today's and overdue days are open; later days are grey but can be done early. */
  function processing(p) {
    var ended = !!P.s.ended, days = {};
    P.steps().forEach(function (k) { var d = P.plan(k).from; (days[d] = days[d] || []).push(k); });
    return '<div class="sp-days">' + Object.keys(days).map(Number).sort(function (a, b) { return a - b; }).map(function (d) {
      var ks = days[d], done = ks.filter(function (k) { return P.status(p, k) === 'done'; }), todo = ks.filter(function (k) { return P.status(p, k) !== 'done'; });
      var future = d > p.age, allDone = !todo.length;
      var open = allDone ? (!!V.open[d] || !!V.keepOpen[d]) : true;
      var state = allDone ? 'done' : future ? 'future' : 'todo';
      var head = '<button type="button" class="sp-day-head" data-action="day" data-value="' + d + '" aria-expanded="' + open + '"' + (allDone ? '' : ' tabindex="-1"') + '>' +
        '<span class="sp-day-mark" data-state="' + state + '" aria-hidden="true">' + I(state === 'done' ? 'check' : state === 'future' ? 'clock' : 'chevron') + '</span>' +
        '<strong>' + esc(allDone ? T('day.done', { d: d }) : T('day.open', { d: d })) + '</strong>' + (allDone ? I('chevron') : '') + '</button>';
      var sub = allDone ? '' : '<p class="sp-day-sub">' + esc(future ? T('day.early') : T('day.plan', { date: dayDate(p, d) })) + '</p>';
      var items = open ? '<div class="sp-items">' + todo.map(function (k) { return todoItem(p, k, ended, future); }).join('') + done.map(function (k) { return doneItem(p, k); }).join('') + '</div>' : '';
      return '<section class="sp-day" data-state="' + state + '"' + (allDone && open ? ' data-open=""' : '') + '>' + head + sub + items + '</section>';
    }).join('') + '</div>';
  }
  /* Piglets: what is in the pen now, then the identified piglets. Born and deaths are history: they live in the pen log. */
  function piglets(p) {
    var w = lastWeight(p), items = [
      { label: T('pg.now'), value: pigs(p.alive), action: P.s.ended ? '' : 'count-open' },
      { label: T('pg.age'), value: T('pg.agev', { d: p.age }) }];
    if (p.sex) items.push({ label: T('pg.sex'), value: T('pg.sexv', { b: p.sex.boar, g: p.sex.gilt }) });
    if (P.hasId() && p.ids.length) items.push({ label: T('pg.ident'), value: idWhat(p) });
    if (P.hasId() && P.breeders(p)) items.push({ label: T('pg.breeders'), value: String(P.breeders(p)) });
    items.push({ label: T('pg.weight'), value: w ? T('pg.weightv', { w: w.kg, d: w.day }) : T('pg.noweight'), action: P.s.ended ? '' : 'weight-open' });
    var body = K.section({ title: T('pg.summary'), rows: true, items: items });
    if (!w) body += '<p class="sp-warn">' + esc(T('pg.weight.hint')) + '</p>';
    if (P.hasId()) {
      var rows = p.ids.slice().reverse().map(function (x) {
        var id = [x.tag, x.notch].filter(Boolean).join(' · ');
        return K.row({ id: id, chip: x.keep ? { text: T('breeder'), tone: 'green' } : null, headline: T(x.sex) + (x.kg != null ? ' · ' + T('kg', { w: x.kg }) : ''),
          meta: (sameDay(x.at) ? hm(x.at) + ' · ' : '') + short(x.who), still: true, trail: '' });
      });
      var acts = P.s.ended ? '' : '<div class="sp-id-acts">' + [['scan', 'scan', 'pg.scan'], ['notch', 'edit', 'pg.notch'], ['manual', 'plus', 'pg.manual']].map(function (a) {
        return '<button type="button" class="sp-id-act" data-action="id-add" data-value="' + a[0] + '">' + I(a[1]) + '<span>' + esc(T(a[2])) + '</span></button>';
      }).join('') + '</div>';
      body += '<section class="sp-ids">' + UI.heading({ title: T('pg.ids'), meta: idWhat(p), kind: 'section', level: 3 }) +
        '<div class="st-panel sp-ids-card">' + (rows.length ? rows.join('') : '<p class="sp-empty">' + esc(T('id.none.yet')) + '</p>') + acts + '</div></section>';
    }
    body += K.doors({ items: [{ title: T('pg.log'), description: T('pg.log.sub'), action: 'log-open' }] });
    return body;
  }
  function penSheet(inert) {
    var p = pen(), ended = !!P.s.ended, body = '';
    body += UI.segment({ options: [['proc', esc(T('tab.proc'))], ['pig', esc(T('tab.pig'))]], active: V.tab, action: 'tab', ariaLabel: T('tabs.label'), className: 'sp-tabs' });
    if (V.flash && V.flash.pen === p.code) body += flashLine();
    if (ended) body += K.warning({ tone: 'amber', text: T('ended.note') });
    body += V.tab === 'pig' ? piglets(p) : processing(p);
    var n = Object.keys(V.draft).length;
    var more = '<button type="button" class="button secondary sp-more" data-ds="Button" data-action="more" data-value="" aria-label="' + esc(T('more.title')) + '">' + I('more') + '</button>';
    var main = V.tab === 'pig' || ended ? UI.button({ label: T('back'), register: 'secondary', action: 'back' })
      : UI.button({ label: T('submit.n', { n: n }), register: 'primary', action: 'submit', waiting: !n });
    var sub = [T('sheet.sow', { tag: p.sow, p: p.parity }), SEP, T('piglets', { n: p.alive }), SEP, T('day.n', { d: p.age })];
    return K.drawer({ title: p.code, subtitle: sub, size: 'long', height: 'full', view: 'pen', inert: inert, close: { action: 'back', label: T('back') },
      body: body, footer: '<div class="tk-footer" data-ds="TaskFooter">' + (ended ? '' : more) + main + '</div>' });
  }

  /* ---- More: Move piglets · Record death · Set count ---- */
  function moreSheet() {
    return K.drawer({ title: T('more.title'), size: 'medium', view: 'more', close: null,
      body: K.doors({ items: [{ title: T('move.title'), action: 'tool', value: 'move' }, { title: T('tool.death'), action: 'tool', value: 'death' }, { title: T('tool.count'), action: 'tool', value: 'count' }] }),
      footer: K.footer({ back: { action: 'back', label: T('back') } }) });
  }
  /* ---- fewer piglets for one ticked item: a stepper; a shortfall asks one reason ---- */
  function stepper(key, label, value, o) {
    return K.stepper(Object.assign({ label: label, value: value, key: key, action: 'step', min: 0 }, o || {}));
  }
  function adjustSheet() {
    var p = pen(), d = V.adj, n = P.need(p, d.k), less = d.n < n;
    var body = stepper('adj', T('treat.given'), d.n, { max: n, min: 1 });
    if (less) {
      body += K.radios({ label: T('treat.why'), action: 'why', key: 'why', selected: d.why, options: [
        { value: 'weak', label: T('treat.weak') }, { value: 'sick', label: T('treat.sick') }] });
      body += '<p class="sp-quiet">' + esc(T('treat.later', { n: n - d.n })) + '</p>';
    }
    return K.drawer({ title: tr(d.k), subtitle: T('adj.sub', { pen: p.code, n: n }), size: 'long', view: 'adjust', close: null, body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('adj.use', { n: d.n }), action: 'adjust-use', register: 'primary', waiting: less && !d.why } }) });
  }

  /* ---- the ID form (tag / notch / weigh): litter weight, boars and gilts, and the identified piglets as rows ---- */
  function nextNumbers(p) {
    var f = V.idf, tag = +P.nextNo(p.code), notchBase = String(p.litter), notchN = 0;
    if (scheme() === 'notch') notchN = +P.nextNo(p.code).split('-')[1];
    else { var used = p.ids.filter(function (x) { return x.notch; }).map(function (x) { return +String(x.notch).split('-')[1] || 0; }); notchN = (used.length ? Math.max.apply(null, used) : 0) + 1; }
    f.rows.forEach(function (r) { if (r.tag && +r.tag >= tag) tag = +r.tag + 1; if (r.notch) { var m = +String(r.notch).split('-')[1] || 0; if (m >= notchN) notchN = m + 1; } });
    return { tag: String(tag), notch: notchBase + '-' + notchN };
  }
  var rowOk = function (r) { return (r.tag || r.notch) && r.sex && !(r.tag && P.taken(r.tag)) && !(r.notch && P.taken(r.notch)); };
  var rowEmpty = function (r) { return !r.tag && !r.notch && !r.sex && !r.kg; };
  function idPage() {
    var p = pen(), f = V.idf, br = scheme() === 'breeders', body = '';
    body += '<section class="st-panel sp-idf-card"><label class="field sp-idf-kg"><span>' + esc(T('idf.kg')) + '</span><span class="sp-kg-box"><input id="sp-idf-kg" inputmode="decimal" autocomplete="off" value="' + esc(f.kg) + '"><small>kg</small></span></label>' +
      (f.kg ? '' : '<p class="sp-warn">' + esc(T('pg.weight.hint')) + '</p>') + '</section>';
    body += '<section class="st-panel sp-idf-card">' + stepper('boar', T('idf.boars'), f.boar) + stepper('gilt', T('idf.gilts'), f.gilt) + '</section>';
    var rows = f.rows.map(function (r, i) {
      var bad = f.tried && !rowOk(r) && !rowEmpty(r);
      return '<div class="sp-idrow"' + (bad ? ' data-bad=""' : '') + '>' +
        '<input id="sp-r' + i + '-tag" data-row="' + i + '" data-f="tag" inputmode="numeric" autocomplete="off" placeholder="' + esc(T('idf.tag')) + '" aria-label="' + esc(T('idf.tag')) + '" value="' + esc(r.tag) + '">' +
        '<input id="sp-r' + i + '-notch" data-row="' + i + '" data-f="notch" autocomplete="off" placeholder="' + esc(T('idf.notch')) + '" aria-label="' + esc(T('idf.notch')) + '" value="' + esc(r.notch) + '">' +
        '<select id="sp-r' + i + '-sex" data-row="' + i + '" data-f="sex" aria-label="' + esc(T('idf.sex')) + '"><option value="">' + esc(T('idf.sex')) + '</option><option value="boar"' + (r.sex === 'boar' ? ' selected' : '') + '>' + esc(T('boar')) + '</option><option value="gilt"' + (r.sex === 'gilt' ? ' selected' : '') + '>' + esc(T('gilt')) + '</option></select>' +
        '<input id="sp-r' + i + '-kg" data-row="' + i + '" data-f="kg" inputmode="decimal" autocomplete="off" placeholder="kg" aria-label="' + esc(T('id.kg')) + '" value="' + esc(r.kg) + '">' +
        '<button type="button" class="sp-idrow-x" data-action="id-del" data-value="' + i + '" aria-label="' + esc(T('idf.remove', { n: i + 1 })) + '">' + I('close') + '</button>' +
        (br ? '' : '<label class="sp-keep"><input type="checkbox" data-row="' + i + '" data-f="keep"' + (r.keep ? ' checked' : '') + '> ' + esc(T('id.keep')) + '</label>') + '</div>';
    }).join('');
    var bad = f.rows.some(function (r) { return !rowOk(r) && !rowEmpty(r); });
    body += '<section class="sp-ids">' + UI.heading({ title: T('pg.ids'), kind: 'section', level: 3 }) +
      '<div class="st-panel sp-ids-card">' + (rows || '<p class="sp-empty">' + esc(T('idf.add')) + '</p>') +
      (f.tried && bad ? '<p class="sp-warn">' + esc(T('idf.row')) + '</p>' : '') +
      '<div class="sp-id-acts">' + [['scan', 'scan', 'pg.scan'], ['notch', 'edit', 'pg.notch'], ['manual', 'plus', 'pg.manual']].map(function (a) {
        return '<button type="button" class="sp-id-act" data-action="id-add" data-value="' + a[0] + '">' + I(a[1]) + '<span>' + esc(T(a[2])) + '</span></button>';
      }).join('') + '</div></div></section>';
    var n = f.rows.filter(rowOk).length, something = n || f.kg || f.boar !== f.boar0 || f.gilt !== f.gilt0;
    return K.page({ title: T('idf.title'), description: T('id.page.sub', { pen: p.code, d: p.age, what: idWhat(p) }), view: 'id', body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('idf.submit', { n: n }), action: 'id-submit', register: 'primary', waiting: !something } }) });
  }
  function weightSheet() {
    var p = pen();
    return K.drawer({ title: T('w.title'), subtitle: T('w.sub', { pen: p.code, d: p.age }), size: 'short', view: 'weight', close: null,
      body: '<label class="field sp-idf-kg"><span>' + esc(T('w.kg')) + '</span><span class="sp-kg-box"><input id="sp-w-kg" inputmode="decimal" autocomplete="off" value="' + esc(V.weight.kg) + '"><small>kg</small></span></label>',
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('save'), action: 'weight-save', register: 'primary', waiting: !(+V.weight.kg > 0) } }) });
  }
  /* ---- the pen log: born, deaths, moves, counts, treatments, IDs — the history, newest first ---- */
  function logPage() {
    var p = pen(), recs = P.recs(p.code).slice().sort(function (a, b) { return b.at - a.at; });
    var line = function (r) {
      var what = r.tr === 'death' ? T('log.death', { n: r.n }) : r.tr === 'move' ? T('log.move', { n: pigs(r.n), to: r.to }) : r.tr === 'count' ? T('log.count', { n: r.n })
        : r.tr === 'id' ? T('log.id', { no: r.no }) : r.tr === 'pick' ? T('log.pick') : T('log.treat', { tr: tr(r.tr), n: pigs(r.n) });
      return K.row({ id: T('day.n', { d: r.day }), headline: what, meta: short(r.who) + ' · ' + when(r), still: true, trail: '' });
    };
    var ent = recs.map(function (r) { return { day: r.day, at: r.at, html: line(r) }; });
    p.weights.forEach(function (w, i) { if (w.day > 0) ent.push({ day: w.day, at: w.at || i, html: K.row({ id: T('day.n', { d: w.day }), headline: T('log.weight', { w: w.kg }), meta: '', still: true, trail: '' }) }); });
    ent.sort(function (a, b) { return b.day - a.day || b.at - a.at; });
    var rows = ent.map(function (e) { return e.html; });
    var bw = p.weights.filter(function (w) { return w.day === 0; })[0];
    if (bw) rows.push(K.row({ id: T('day.n', { d: 0 }), headline: T('log.weight', { w: bw.kg }), meta: '', still: true, trail: '' }));
    rows.push(K.row({ id: T('day.n', { d: 0 }), headline: T('log.born', { n: p.born }), meta: p.dead && !recs.some(function (r) { return r.tr === 'death'; }) ? T('log.dead.birth', { n: p.dead }) : '', still: true, trail: '' }));
    return K.page({ title: T('log.title'), description: p.code + ' · ' + T('sow', { tag: p.sow }), view: 'log', body: K.list([K.group({ title: p.code, rows: rows })]) });
  }

  /* ---- record death ---- */
  var CAUSES = ['crushed', 'scours', 'starve', 'other'];
  function deathSheet() {
    var p = pen(), d = V.death, k = CAUSES.reduce(function (s, c) { return s + d.c[c]; }, 0);
    var body = CAUSES.map(function (c) { return stepper(c, T('c.' + c), d.c[c], { max: p.alive }); }).join('');
    return K.drawer({ title: T('death.title'), subtitle: T('death.sub', { pen: p.code, n: p.alive }), size: 'long', view: 'death', close: null, body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('save'), action: 'death-save', register: 'primary', waiting: !k } }) });
  }
  /* ---- move piglets: only the other pens of this batch (there is nowhere else); for what was given here: had it? ---- */
  function moveAsks(p) {
    var ks = P.PLAN.filter(function (t) { return p.tr[t.key].got > 0; }).map(function (t) { return t.key; });
    if ((scheme() === 'tag' || scheme() === 'notch') && P.idCount(p) > 0) ks.push('id');
    return ks;
  }
  function movePage() {
    var p = pen(), d = V.move;
    var others = P.pens().filter(function (o) { return P.sameBatch(p, o); });
    var body = '<section class="sp-pick">' + UI.heading({ title: T('move.to'), meta: T('move.batch', { b: P.BATCH.name }), kind: 'section', level: 3 }) +
      '<div class="tk-choice sp-pens" role="group" aria-label="' + esc(T('move.to')) + '">' + others.map(function (o) {
        return '<button type="button" class="tk-choice-tile" aria-pressed="' + (d.to === o.code) + '" data-action="move-to" data-value="' + o.code + '">' +
          '<strong>' + o.code + '</strong><small>' + esc(T('day.n', { d: o.age })) + '</small></button>';
      }).join('') + '</div></section>';
    body += stepper('move', T('move.how'), d.n, { min: 1, max: p.alive, variant: 'hero', hint: '' });
    var asks = moveAsks(p);
    asks.forEach(function (k) {
      body += K.radios({ layout: 'row', label: k === 'id' ? T('move.hadid.' + scheme()) : T('move.had', { tr: trl(k) }), action: 'had', key: k,
        selected: d.had[k] == null ? '' : d.had[k] ? 'yes' : 'no', options: [{ value: 'no', label: T('no') }, { value: 'yes', label: T('yes') }] });
    });
    var ready = d.to && d.n > 0 && asks.every(function (k) { return d.had[k] != null; });
    return K.page({ title: T('move.title'), description: T('move.sub', { pen: p.code, n: p.alive }), view: 'move', body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('move.save', { n: pigs(d.n) }), action: 'move-save', register: 'primary', waiting: !ready } }) });
  }
  /* ---- set count: the record becomes what is there now ---- */
  function countSheet() {
    var p = pen(), d = V.count;
    return K.drawer({ title: T('count.title'), subtitle: T('count.sub', { pen: p.code, n: p.alive }), size: 'long', view: 'count', close: null,
      body: stepper('count', T('count.label'), d.n, { variant: 'hero', face: 'count', min: 0, hint: '' }),
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('save'), action: 'count-save', register: 'primary', waiting: d.n === p.alive } }) });
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
        return K.row({ id: p.code, headline: P.todo(p).map(chipName).join(' · '), meta: ended ? '' : todoMeta(p), still: true, trail: '' });
      }) })]);
    }
    var soon = all.filter(function (p) { return P.coming(p).length; });
    if (soon.length && !ended) {
      var nm = []; soon.forEach(function (p) { P.coming(p).forEach(function (k) { if (nm.indexOf(tr(k)) < 0) nm.push(tr(k)); }); });
      body += '<p class="sp-quiet">' + esc(T('end.coming', { n: soon.length, list: nm.join(', ') })) + '</p>';
    }
    if ((P.s.unaccounted || 0) > 0) body += '<p class="sp-quiet">' + esc(T('end.unacc', { n: P.s.unaccounted })) + '</p>';
    var f = ended ? K.footer({ back: { action: 'back', label: T('back') } })
      : K.footer({ back: { action: 'back', label: T('back') }, hold: { label: T('end.hold'), caption: T('end.caption'), action: 'end-commit', tone: 'danger' } });
    return K.page({ title: ended ? T('end.done.title') : T('end.title'), description: T('end.sub', { b: P.BATCH.name }), view: 'end', body: body, footer: f });
  }

  /* ================= render ================= */
  /* Each overlay on the phone has a key (its data-view). An overlay that is new on this render slides in (data-enter); one
     that is gone slides out first (data-leave), then the phone is redrawn. A re-render never replays. */
  var shownKeys = [], leaving = false;
  function overlays(root) {
    return Array.prototype.filter.call(root.children, function (el) { return el.matches('.tk-sheet, .tk-page, .tk-dialog-backdrop'); });
  }
  var keyOf = function (el) { return el.getAttribute('data-view') || (el.matches('.tk-dialog-backdrop') ? 'dialog' : ''); };
  function render() {
    if (leaving) return;
    document.documentElement.lang = L.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = T('task');
    var html = K.statusbar() + listScreen(!!(V.pen || V.end));
    if (V.pen) html += penSheet(!!(V.over || V.end));
    var o = V.pen && V.over;
    if (o === 'more') html += moreSheet();
    if (o === 'adjust') html += adjustSheet();
    if (o === 'death') html += deathSheet();
    if (o === 'count') html += countSheet();
    if (o === 'weight') html += weightSheet();
    if (o === 'move') html += movePage();
    if (o === 'id') html += idPage();
    if (o === 'log') html += logPage();
    if (V.end) html += endPage();
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    var next = overlays(tmp).map(keyOf);
    var gone = overlays(phone).filter(function (el) { return next.indexOf(keyOf(el)) < 0; });
    if (gone.length && !reduced()) {
      leaving = true; phone.style.pointerEvents = 'none';   // no tap lands on a screen that is about to be redrawn
      gone.forEach(function (el) { el.setAttribute('data-leave', ''); var s = el.previousElementSibling; if (s && s.matches('.tk-scrim')) s.setAttribute('data-leave', ''); });
      setTimeout(function () {
        leaving = false; phone.style.pointerEvents = '';
        phone.querySelectorAll('[data-leave]').forEach(function (el) { el.remove(); });
        shownKeys = shownKeys.filter(function (k) { return next.indexOf(k) >= 0; });
        render();
      }, 180);
      return;
    }
    paint(html, next);
  }
  function paint(html, next) {
    var keep = {};
    phone.querySelectorAll('.tk-scroll, .tk-sheet-body, .tk-page-body').forEach(function (el) {
      var host = el.closest('[data-view]'); keep[(host ? host.getAttribute('data-view') : 'list') + el.className] = el.scrollTop;
    });
    var chipsX = phone.querySelector('.tk-chips-track'), cx = chipsX ? chipsX.scrollLeft : 0;
    var focusSel = null, a = document.activeElement, caret = null;
    if (a && phone.contains(a)) {
      if (a.id) focusSel = '#' + CSS.escape(a.id);
      else if (a.getAttribute('data-action')) focusSel = '[data-action="' + a.getAttribute('data-action') + '"][data-value="' + (a.getAttribute('data-value') || '') + '"]';
      if (a.tagName === 'INPUT' && a.type !== 'checkbox') caret = a.selectionStart;
    }
    phone.innerHTML = html;
    overlays(phone).forEach(function (el) {
      if (shownKeys.indexOf(keyOf(el)) >= 0) return;
      el.setAttribute('data-enter', '');
      var s = el.previousElementSibling; if (s && s.matches('.tk-scrim')) s.setAttribute('data-enter', '');
    });
    shownKeys = next;
    phone.querySelectorAll('.tk-scroll, .tk-sheet-body, .tk-page-body').forEach(function (el) {
      var host = el.closest('[data-view]'), k = (host ? host.getAttribute('data-view') : 'list') + el.className;
      if (keep[k] != null) el.scrollTop = keep[k];
    });
    var ct = phone.querySelector('.tk-chips-track'); if (ct) ct.scrollLeft = cx;
    if (V.pageTop) { phone.querySelectorAll('.tk-page-body, .tk-sheet-body').forEach(function (x) { x.scrollTop = 0; }); V.pageTop = false; }
    if (V.toTop) { var sc = phone.querySelector('.tk-scroll'); if (sc) sc.scrollTop = 0; V.toTop = false; }
    if (focusSel) {
      var f = phone.querySelector(focusSel);
      if (f && f.focus) { f.focus({ preventScroll: true }); if (caret != null && f.setSelectionRange) try { f.setSelectionRange(caret, caret); } catch (e) { /* not a text input */ } }
    }
    V.justTick = ''; V.justRec = [];
    renderDemo();
  }

  /* ---- outside the phone: the farm's ID setting, language, the other phone, reset ---- */
  function renderDemo() {
    demo.setAttribute('data-open', V.demoOpen ? 'true' : 'false');
    demo.innerHTML = '<button type="button" class="sp-demo-toggle" data-demo="toggle" aria-expanded="' + !!V.demoOpen + '">' + esc(T('demo.open')) + '</button>' +
      '<div class="sp-demo-panel"><div class="sp-demo-lang" role="group" aria-label="' + esc(T('demo.lang')) + '">' +
      '<button type="button" data-demo="lang" data-value="en" aria-pressed="' + (L.lang === 'en') + '">en</button>' +
      '<button type="button" data-demo="lang" data-value="zh" aria-pressed="' + (L.lang === 'zh') + '">中文</button></div>' +
      '<div class="sp-demo-farm" role="radiogroup" aria-label="' + esc(T('demo.farm')) + '"><p class="sp-demo-label">' + esc(T('demo.farm')) + '</p>' +
      P.SCHEMES.map(function (s) {
        return '<button type="button" role="radio" data-demo="scheme" data-value="' + s + '" aria-checked="' + (scheme() === s) + '"><span class="sp-demo-dot" aria-hidden="true"></span>' + esc(T('scheme.' + s)) + '</button>';
      }).join('') + '<p class="sp-demo-tip">' + esc(T('demo.farm.note')) + '</p></div>' +
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
    if (w === 'reset') { P.reset(); V = fresh(V); }
    if (w === 'scheme') { P.setScheme(b.getAttribute('data-value')); V = fresh(V); }
    if (w === 'other') {
      var r = P.otherPhone();
      if (r.kind === 'arrived') V.flash = { pen: V.pen, key: 'note.arrived', args: { who: P.OTHER, tr: trl('iron'), pen: 'A05', t: hm(r.at) } };
      if (r.kind === 'clash') { V.flash = null; V.toTop = true; }
      if (r.kind === 'again') V.demoMsg = T('demo.again');
      if (r.kind === 'ended') V.demoMsg = T('demo.ended');
      if (r.kind === 'clash' && V.pen === 'A05') V.flash = { pen: 'A05', key: 'note.clash', args: { Tr: tr('iron'), pen: 'A05', who: P.OTHER, t: hm(r.note.at) } };
    }
    render();
  });

  /* ================= what a tap does ================= */
  /* After Submit the ticked rows turn done where they are; a day that became all done stays open a few seconds. */
  var openTimer = 0;
  function keepOpenSoon() {
    clearTimeout(openTimer);
    if (!Object.keys(V.keepOpen).length) return;
    openTimer = setTimeout(function () { if (V.over || V.end) { keepOpenSoon(); return; } V.keepOpen = {}; render(); }, 4000);
  }
  function closePen() { V.pen = null; V.flash = null; V.open = {}; V.keepOpen = {}; V.draft = {}; V.tab = 'proc'; clearTimeout(openTimer); }
  function closeTop() {
    if (V.end) V.end = null;
    else if (V.over) V.over = null;
    else if (V.pen) closePen();
  }
  function saved(key, args) { V.flash = { pen: V.pen, key: key, args: args, undo: true }; }
  function idBlank(p) { return { kg: '', boar: p.sex ? p.sex.boar : 0, gilt: p.sex ? p.sex.gilt : 0, boar0: p.sex ? p.sex.boar : 0, gilt0: p.sex ? p.sex.gilt : 0, rows: [], tried: false }; }
  function addRow(kind) {
    var p = pen(), nx = nextNumbers(p), r = { tag: '', notch: '', sex: '', kg: '', keep: false };
    if (kind === 'scan') r.tag = nx.tag;          // a scan reads the next tag in the box (demo)
    if (kind === 'notch') r.notch = nx.notch;     // the notch picker offers this litter's next notch
    V.idf.rows.push(r);
  }
  function act(a, v, el) {
    var p = V.pen ? pen() : null;
    switch (a) {
      case 'chip': if (v === V.chip) return; V.chip = v; break;
      case 'pen': V.pen = v; V.flash = null; V.open = {}; V.draft = {}; V.tab = 'proc'; break;
      case 'tab': V.tab = v; V.pageTop = true; break;
      case 'dismiss': case 'back': closeTop(); break;
      case 'noop': return;
      case 'end': V.end = true; break;
      case 'day': V.open[v] = !V.open[v]; break;
      case 'item':
        if (V.draft[v]) delete V.draft[v];
        else { V.draft[v] = { n: P.need(p, v), why: '' }; V.justTick = v; }
        break;
      case 'adjust': V.over = 'adjust'; V.adj = { k: v, n: V.draft[v].n, why: V.draft[v].why }; break;
      case 'adjust-use': V.draft[V.adj.k] = { n: V.adj.n, why: V.adj.n < P.need(p, V.adj.k) ? V.adj.why : '' }; V.over = null; break;
      case 'why': V.adj.why = v; break;
      case 'submit': {
        var items = Object.keys(V.draft).map(function (k) { return { k: k, n: V.draft[k].n, why: V.draft[k].why }; });
        var recs = P.submit(p.code, items) || [];
        recs.forEach(function (r) { V.keepOpen[P.plan(r.tr).from] = true; });
        V.justRec = recs.map(function (r) { return r.id; });
        V.draft = {};
        V.flash = { pen: p.code, key: 'flash.items', args: { n: recs.length }, undoIds: V.justRec.slice() };
        keepOpenSoon();
        break;
      }
      case 'undo-items': P.unrecord(V.flash.undoIds); V.flash = { pen: V.pen, key: 'undone' }; break;
      case 'more': V.over = 'more'; break;
      case 'step': {
        var d = +el.getAttribute('data-step');
        if (V.over === 'adjust') V.adj.n = Math.max(1, Math.min(P.need(p, V.adj.k), V.adj.n + d));
        if (V.over === 'death') V.death.c[v] = Math.max(0, V.death.c[v] + d);
        if (V.over === 'count') V.count.n = Math.max(0, V.count.n + d);
        if (V.over === 'move') V.move.n = Math.max(1, Math.min(p.alive, V.move.n + d));
        if (V.over === 'id') V.idf[v] = Math.max(0, V.idf[v] + d);
        break;
      }
      case 'tool':
        V.over = v;
        if (v === 'death') V.death = { c: { crushed: 0, scours: 0, starve: 0, other: 0 } };
        if (v === 'move') V.move = { to: '', n: 1, had: {} };
        if (v === 'count') V.count = { n: p.alive };
        break;
      case 'count-open': V.over = 'count'; V.count = { n: p.alive }; break;
      case 'weight-open': V.over = 'weight'; V.weight = { kg: '' }; break;
      case 'weight-save': P.setWeight(p.code, V.weight.kg); V.over = null; saved('log.weight', { w: V.weight.kg }); break;
      case 'log-open': V.over = 'log'; V.pageTop = true; break;
      case 'id-open': V.over = 'id'; V.idf = idBlank(p); V.pageTop = true; break;
      case 'id-add':
        if (V.over !== 'id') { V.over = 'id'; V.idf = idBlank(p); V.pageTop = true; }
        addRow(v);
        break;
      case 'id-del': V.idf.rows.splice(+v, 1); break;
      case 'id-submit': {
        var f = V.idf, bad = f.rows.some(function (r) { return !rowOk(r) && !rowEmpty(r); });
        if (bad) { f.tried = true; break; }
        var n = P.identifyForm(p.code, { kg: f.kg, boar: f.boar !== f.boar0 || f.gilt !== f.gilt0 ? f.boar : null, gilt: f.gilt, rows: f.rows.filter(rowOk) });
        V.over = null; V.tab = 'pig'; saved('idf.saved', { n: n });
        break;
      }
      case 'death-save': {
        var k = P.death(p.code, V.death.c);
        V.over = null; saved('flash.death', { n: pigs(k) });
        break;
      }
      case 'move-to': V.move.to = v; break;
      case 'had': { var fl = el.closest('[data-field]'); V.move.had[fl.getAttribute('data-field')] = v === 'yes'; break; }
      case 'move-save': {
        var m = V.move;
        P.move(p.code, m.to, m.n, m.had);
        V.over = null; saved('flash.move', { n: pigs(m.n), to: m.to });
        break;
      }
      case 'count-save': {
        var c = V.count;
        P.setCount(p.code, c.n);
        V.over = null; saved('flash.count', { n: c.n });
        break;
      }
      case 'undo': P.undo(); V.flash = { pen: V.pen, key: 'undone' }; break;
      case 'note-ok': P.seeNote(+v); break;
      default: return;
    }
    render();
  }
  phone.addEventListener('click', function (e) {
    if (leaving) return;
    if (V.pen && Object.keys(V.keepOpen).length) keepOpenSoon();   // still busy here: a fresh day stays open
    var el = e.target.closest('[data-action]');
    if (!el || !phone.contains(el) || el.classList.contains('st-hold')) return;
    if (UI.guard(el)) return;
    act(el.getAttribute('data-action'), el.getAttribute('data-value') != null ? el.getAttribute('data-value') : el.value, el);
  });
  // the chips are one radio group: arrow keys, Home and End move the choice
  UI.radioBind(phone, { onChange: function (field, value) { if (field === 'chips') act('chip', value); } });
  // typing in the ID form and the weight sheet
  phone.addEventListener('input', function (e) {
    var t = e.target, num = function (s) { return s.replace(',', '.').replace(/[^0-9.]/g, ''); };
    if (t.id === 'sp-w-kg') { V.weight.kg = num(t.value); render(); return; }
    if (!V.idf) return;
    if (t.id === 'sp-idf-kg') { V.idf.kg = num(t.value); render(); return; }
    var i = t.getAttribute('data-row'), f = t.getAttribute('data-f');
    if (i == null) return;
    var r = V.idf.rows[+i];
    if (f === 'keep') r.keep = t.checked; else if (f === 'kg') r.kg = num(t.value); else r[f] = t.value.trim();
    render();
  });
  phone.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT' && V.idf) { var r = V.idf.rows[+e.target.getAttribute('data-row')]; r.sex = e.target.value; render(); } });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && (V.pen || V.end)) { closeTop(); render(); }
  });
  var holds = K.holdBind(phone, { onCommit: function (b) {
    var a = b.getAttribute('data-action');
    setTimeout(function () {
      holds.settle(b, 'done');
      if (a === 'end-commit') { P.end(); V.pageTop = true; V.chip = ''; }
      render();
    }, 250);
  } });

  /* a link can open a state: ?chip=iron|done|id, ?scheme=tag|notch|breeders|none, ?pen=A03&tab=pig (the design lint's pages) */
  (function () {
    var q = new URLSearchParams(location.search);
    var s = q.get('scheme'); if (s && P.SCHEMES.indexOf(s) >= 0 && s !== scheme()) P.setScheme(s);
    var c = q.get('chip'); if (c) V.chip = c;
    var pn = q.get('pen'); if (pn && P.s.pens[pn]) { V.pen = pn; V.tab = q.get('tab') === 'pig' ? 'pig' : 'proc'; }
  })();
  render();
})();
