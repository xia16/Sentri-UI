/* Simple piglet processing: the screens. Built from the task skeleton (window.SentriTask) and the design-system cards
   (window.SentriUI); the data is state.js (window.PPS), the words strings.js (window.PPT). One render() draws the phone. */
(function () {
  'use strict';
  var K = window.SentriTask, UI = window.SentriUI, P = window.PPS, L = window.PPT, I = window.SentriIcons.icon;
  var T = function (k, a) { return L.t(k, a); };
  var phone = document.getElementById('phone'), demo = document.getElementById('demo');
  var SEP = { sep: true };

  /* What is open on the phone (not kept: a reload starts on the pen list) */
  function fresh(keep) {
    return { chip: '', sel: {}, chipRec: null, pen: null, over: null, treat: null, death: null, move: null, count: null, idf: null,
      confirm: null, end: null, flash: null, open: {}, pin: {}, justRec: '', demoOpen: keep ? keep.demoOpen : false };
  }
  var V = fresh();

  /* ---- small helpers ---- */
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  function hm(ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function sameDay(ms) { return new Date(ms).toDateString() === new Date().toDateString(); }
  function when(r) { return sameDay(r.at) ? hm(r.at) : T('day.n', { d: r.day }); }
  function short(who) { var p = who.split(/[.\s]+/).filter(Boolean); return p.length > 1 ? p[0] + '.' + p[p.length - 1][0] : who; }
  var scheme = function () { return P.s.scheme; };
  var tr = function (k) { return k === 'id' ? T('tr.id.' + scheme()) : T('tr.' + k); };
  var trl = function (k) { return k === 'id' ? T('trl.id.' + scheme()) : T('trl.' + k); };
  var chipName = function (k) { return k === 'id' ? T('chip.id.' + scheme()) : T('tr.' + k); };
  var pigs = function (n) { return T('piglets', { n: n }); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  /* The same words with their registry id (ux/laws/strings.json, `sp.<key>`): S for a skeleton text slot, H for raw HTML,
     btn for a design-system Button. The strict design lint checks every visible string through these. */
  function S(k, a, tone) { var o = { text: T(k, a), str: 'sp.' + L.key(k, a), args: a || undefined }; if (tone) o.tone = tone; return o; }
  function H(k, a) { return '<span data-str="sp.' + esc(L.key(k, a)) + '">' + esc(T(k, a)) + '</span>'; }
  function btn(k, a, o) { return UI.button(Object.assign({ label: T(k, a), strs: { label: 'sp.' + L.key(k, a) } }, o || {})); }
  var stepKey = function (k) { return k === 'id' ? 'tr.id.' + scheme() : 'tr.' + k; };
  var chipKey = function (k) { return k === 'id' ? 'chip.id.' + scheme() : 'tr.' + k; };
  function pen() { return P.s.pens[V.pen]; }
  function newest(list) { return list.slice().sort(function (a, b) { return b.at - a.at; })[0]; }
  /* the ID step in words: `4 of 12 tagged`, `1 breeder picked` */
  function idKey(p) { return scheme() === 'breeders' ? ['id.picked', { n: P.breeders(p) }] : ['id.of.' + scheme(), { n: P.idCount(p), m: p.alive }]; }
  function idWhat(p) { var x = idKey(p); return T(x[0], x[1]); }
  function idS(p) { var x = idKey(p); return S(x[0], x[1]); }
  function stepAmount(p, k) { return k === 'id' ? idS(p) : S('piglets', { n: P.need(p, k) }); }
  var reduced = function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

  /* ================= the pen list ================= */
  /* One rule for "needs it today": the step is due, late, or has piglets left from before. The summary card, the chip's
     count and the chip's list all use it. */
  function needsToday(p, k) { var s = P.status(p, k); return s === 'due' || s === 'late' || s === 'left'; }
  /* the meta line for a pen with something to do: `due today · 12 piglets`, `late · day 6 · 11 piglets`, `2 left · weak` */
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
  function penRow(p) {
    var ended = !!P.s.ended, td = P.todo(p), headline, meta, tone = '';
    var lastR = newest(P.recs(p.code).filter(function (r) { return !!P.plan(r.tr); })), c = P.coming(p);
    if (ended) {
      headline = [S('ended.row')]; tone = 'forecast';
      meta = td.concat(c).length ? [S('not.given.list', { list: td.concat(c).map(tr).join(', ') })] : [S('all.given')];
    } else if (td.length) {
      headline = names(td);
      meta = todoMeta(p);
    } else if (c.length) {
      headline = [S('nothing.due')]; tone = 'forecast';
      var next = S('from.day', { tr: trl(c[0]), d: P.plan(c[0]).from });
      meta = lastR ? [S('done.at', { t: when(lastR) }), SEP, next] : [next];
    } else {
      headline = [S('all.given')];
      meta = lastR ? [S('done.at', { t: when(lastR) })] : '';
    }
    return K.row({ id: S('code', { c: p.code }), chip: penChip(p), headline: headline, tone: tone, meta: meta, action: 'pen', value: p.code });
  }
  function isDone(p) { return P.todo(p).length === 0; }
  function groupsBy(list, rowFn) {
    return ['A', 'B'].map(function (r) {
      var rows = list.filter(function (p) { return p.row === r; });
      if (!rows.length) return '';
      return K.group({ title: S('row', { r: r }), face: 'word', meta: S('row.pens', { n: rows.length }), rows: rows.map(rowFn) });
    }).join('');
  }
  /* the chips: All · one per job that pens need today (with how many) · Done */
  function chipCounts() {
    var all = P.pens();
    if (P.s.ended) return [];   // nothing can be recorded: All and Done only
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
  function chipStart(k) { V.chip = k; V.sel = {}; V.chipRec = null; V.justTick = ''; }   // round 9: nothing is pre-ticked
  function chipTotals() {
    var codes = Object.keys(V.sel), n = 0;
    codes.forEach(function (c) { n += P.need(P.s.pens[c], V.chip); });
    return { pens: codes.length, n: n, of: P.pens().filter(function (p) { return needsToday(p, V.chip); }).length };
  }
  /* A pen under a job chip. The worker walks the pens and taps each row as they treat it: the circle at its end fills with
     a tick in place (tap again to take it off). The small chevron beside it still opens the pen. After Finish, a recorded
     pen stays where it is and says "Recorded ✓" until the chip changes. */
  var openPen = function (p) {
    return '<button type="button" class="sp-open" data-action="pen" data-value="' + p.code + '" aria-label="' + esc(T('open.pen', { pen: p.code })) + '">' + I('chevron') + '</button>';
  };
  function chipRow(p) {
    var k = V.chip, rec = V.chipRec && V.chipRec[p.code];
    var place = P.bulkPlace(p, k), st = P.status(p, k), amber = !rec && (place === 'early' || place === 'late') ? place : '';
    var meta = rec ? [S('day.n', { d: p.age })] : st === 'left' ? [S('bulk.left', { n: P.need(p, k), why: T('why.' + (p.tr[k].why || 'weak')) })]
      : amber ? [S('day.n', { d: p.age }, 'amber')] : [S('day.n', { d: p.age })];
    var on = V.sel[p.code] != null, mark = on && V.sel[p.code];
    var chip = amber ? S(amber === 'late' ? 'Late' : 'Early', null, 'amber') : penChip(p);
    var amount = rec ? S('piglets', { n: rec.n }) : stepAmount(p, k);
    if (k === 'id' || P.s.ended) return K.row({ id: S('code', { c: p.code }), chip: chip, headline: [amount], meta: meta, action: 'pen', value: p.code, trail: 'chevron' });
    var ring = '<span class="sp-ring" aria-hidden="true">' + I('check') + '</span>';
    if (rec) {
      return '<div class="sp-tickrow" data-ds="TaskRow" data-ticked=""' + (V.justRec === 'bulk' ? ' data-fresh=""' : '') + '>' +
        K.row({ id: S('code', { c: p.code }), chip: rec.mark ? S(rec.mark === 'late' ? 'Late' : 'Early', null, 'amber') : chip, headline: [amount], meta: meta, still: true, trail: '' })
          .replace(/<\/div>$/, '<span class="sp-recorded">' + H('recorded.tick') + '</span></div>') + openPen(p) + '</div>';
    }
    var row = K.row({ id: S('code', { c: p.code }), chip: mark ? S(mark === 'late' ? 'Late' : 'Early', null, 'amber') : chip, headline: [amount], meta: meta,
      action: 'tick', value: p.code, trail: '', label: T(on ? 'untick.pen' : 'tick.pen', { pen: p.code }) });
    row = row.replace('data-ds="TaskRow"', 'data-ds="TaskRow" aria-pressed="' + on + '"').replace(/<\/button>$/, ring + '</button>');
    return '<div class="sp-tickrow" data-ds="TaskRow"' + (on ? ' data-ticked=""' : '') + (V.justTick === p.code ? ' data-fresh=""' : '') + '>' + row + openPen(p) + '</div>';
  }
  function chipFooter() {
    if (V.chipRec) {
      var r = V.chipRec._sum;
      return '<p class="sp-foot-receipt" role="status">' + H('flash.bulk', { Tr: tr(V.chip), tr: trl(V.chip), p: T('pens.n', { n: r.pens }), n: pigs(r.n) }) + '</p>' +
        '<div class="tk-footer sp-two" data-ds="TaskFooter">' + btn('undo', null, { register: 'secondary', action: 'chip-undo' }) + btn('done.btn', null, { register: 'primary', action: 'chip', value: '' }) + '</div>';
    }
    var tot = chipTotals(), a = { tr: trl(V.chip), k: tot.pens, m: tot.of };
    return K.footer({ back: null, hold: { label: S('bulk.finish', a), caption: S('bulk.finish.caption'), action: 'bulk-commit', tone: 'primary', waiting: tot.pens === 0 },
      status: Object.assign(tot.pens ? S('bulk.finish', a) : S('bulk.none'), { id: 'sp-bulk-status' }) });
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
    var foot = '';
    body += chipsRow();
    var job = V.chip && V.chip !== 'done';
    if (job) {
      // the pens that need this job today, plus the too-early ones (amber), plus the ones just recorded (they stay put)
      var order = { now: 0, early: 1, late: 2, done: 3 };
      var list = all.filter(function (p) { return P.bulkPlace(p, V.chip) !== 'done' || (V.chipRec && V.chipRec[p.code]); })
        .sort(function (a, b) { return order[P.bulkPlace(a, V.chip)] - order[P.bulkPlace(b, V.chip)] || (a.code < b.code ? -1 : 1); });
      if (V.chipRec) list.sort(function (a, b) { return a.code < b.code ? -1 : 1; });
      var t = P.plan(V.chip);
      body += '<p class="sp-chip-head">' + H(stepKey(V.chip)) + '<span class="tk-sep" data-str="ds.sep">·</span>' + H('given.days', { a: t.from, b: t.to }) + '</p>';
      body += '<p class="sp-chip-tip">' + H(V.chip === 'id' ? 'chip.id.tip' : 'bulk.none') + '</p>';
      body += list.length ? K.list(groupsBy(list, chipRow)) : '<p class="sp-empty">' + H('chip.none') + '</p>';
      var nd = all.length - list.length;
      if (nd) body += '<p class="sp-empty">' + H('chip.done.in', { n: nd }) + '</p>';
      if (V.chip !== 'id' && !ended) foot = chipFooter();
    } else {
      var shown = V.chip === 'done' ? done : all;
      var groups = groupsBy(shown, penRow);
      body += groups ? K.list(groups) : '<p class="sp-empty">' + H('empty.done') + '</p>';
    }
    return K.screen({ inert: inert, label: T('task'), header: K.header({ title: S('task'), back: null }), body: body, dock: foot });
  }

  /* The receipt line after a save: what was recorded, and Undo while it is the last change */
  function flashLine() {
    var f = V.flash;
    var undo = f.undo && P.s.undo ? btn('undo', null, { register: 'text', action: 'undo' }) : '';
    return '<div class="sp-flash" role="status"><span>' + (f.key ? H(f.key, f.args) : esc(f.text)) + '</span>' + undo + '</div>';
  }

  /* ================= the pen sheet: facts, tools, and the pen's timeline by day ================= */
  function doneLine(p, k) {
    if (k === 'id') {
      var r = newest(P.recs(p.code, scheme() === 'breeders' ? 'pick' : 'id'));
      var what = scheme() === 'breeders' ? T('breeders.n', { n: P.breeders(p) }) : idWhat(p);
      return { title: tr(k), meta: r ? [T('done.meta', { t: when(r), who: short(r.who), n: what })] : [what] };
    }
    var rs = P.recs(p.code, k), r2 = newest(rs), n = rs.reduce(function (s, x) { return s + x.n; }, 0);
    var meta = r2 ? [T('done.meta', { t: when(r2), who: short(r2.who), n: pigs(n || p.tr[k].got) })] : [pigs(p.tr[k].got)];
    if (rs.some(function (x) { return x.mark; })) meta.push(SEP, { text: T(rs.filter(function (x) { return x.mark; })[0].mark), tone: 'amber' });
    var note = P.s.notes.filter(function (x) { return x.pen === p.code && x.tr === k; })[0];
    if (note) meta.push(SEP, T('kept.note') + ' (' + hm(note.mine.at) + ')');
    return { title: tr(k), meta: meta };
  }
  /* One step in today's card. A step recorded on this visit stays here (pinned): its circle fills with a tick and its
     button becomes "Recorded · Undo" in place; it moves to its day's done line when the worker leaves the sheet or after
     a few seconds idle. */
  function openStep(p, k, ended) {
    var pinId = V.pin[k], st = P.status(p, k), t = P.plan(k), n = P.need(p, k), win = T('given.days', { a: t.from, b: t.to });
    var meta, act;
    if (pinId) {
      var r = P.s.records.filter(function (x) { return x.id === pinId; })[0];
      meta = [win, SEP, pigs(r ? r.n : 0)];
      if (r && r.mark) meta.push(SEP, { text: T(r.mark), tone: 'amber' });
      act = UI.button({ label: T('recorded.undo'), register: 'secondary', action: 'unrecord', value: k, className: 'sp-recorded-btn' });
    } else {
      if (k === 'id') meta = st === 'late' ? [{ text: T('late'), tone: 'amber' }, SEP, win, SEP, idWhat(p)] : [win, SEP, idWhat(p)];
      else if (st === 'left') meta = [T('tl.given', { n: p.tr[k].got }), SEP, T('left', { n: n }), SEP, T('why.' + (p.tr[k].why || 'weak'))];
      else meta = st === 'late' ? [{ text: T('late'), tone: 'amber' }, SEP, win, SEP, pigs(n)] : [win, SEP, pigs(n)];
      act = ended ? '' : k === 'id' ? UI.button({ label: T('id.act.' + scheme()), register: 'secondary', action: 'id-open', value: 'id' })
        : UI.button({ label: T('record.n', { n: n }), register: 'secondary', action: 'one', value: k });
    }
    var main = pinId || ended ? 'noop' : k === 'id' ? 'id-open' : 'treat';
    return '<div class="sp-step"' + (pinId ? ' data-recorded=""' : '') + (pinId && V.justRec === pinId ? ' data-fresh=""' : '') + '>' +
      '<button type="button" class="sp-step-main" data-action="' + main + '" data-value="' + k + '">' +
      '<span class="sp-ring" aria-hidden="true">' + I('check') + '</span><span class="sp-step-copy"><strong>' + esc(tr(k)) + '</strong><small>' + metaHtml(meta) + '</small></span></button>' + act + '</div>';
  }
  function metaHtml(parts) {
    return parts.map(function (x) {
      if (x.sep) return '<span class="tk-sep">·</span>';
      if (typeof x === 'object') return '<span class="tk-tone" data-tone="' + esc(x.tone) + '">' + esc(x.text) + '</span>';
      return esc(x);
    }).join('');
  }
  function timeline(p) {
    var ended = !!P.s.ended, today = p.age, nodes = {};
    var node = function (d) { return nodes[d] || (nodes[d] = { d: d, open: [], done: [], later: [] }); };
    node(today); node(1);
    P.steps().forEach(function (k) {
      var st = P.status(p, k), d0 = P.plan(k).from;
      if (V.pin[k]) node(today).open.push(k);
      else if (st === 'done') node(d0).done.push(k);
      else if (st === 'coming') node(d0).later.push(k);
      else node(today).open.push(k);
    });
    var days = Object.keys(nodes).map(Number).sort(function (a, b) { return a - b; });
    var html = days.map(function (d) {
      var n = nodes[d], isToday = d === today, part = '';
      var head = isToday ? '<span class="sp-tl-today">' + esc(T('tl.today', { d: d })) + '</span>' : '<span class="sp-tl-day">' + esc(T('tl.day', { d: d })) + '</span>';
      if (d === 1) part += '<p class="sp-tl-line">' + esc(T('tl.born', { n: p.born })) + '</p>';
      if (n.open.length) part += '<div class="sp-steps">' + n.open.map(function (k) { return openStep(p, k, ended); }).join('') + '</div>';
      if (n.done.length) {
        var exp = !!V.open[d];
        part += '<button type="button" class="sp-tl-done" data-action="tl-toggle" data-value="' + d + '" aria-expanded="' + exp + '">' +
          '<span class="sp-tick-disc" aria-hidden="true">' + I('check') + '</span><span>' + esc(T('tl.done', { n: n.done.length })) + '</span>' +
          '<span class="sp-tl-names">' + esc(n.done.map(tr).join(' · ')) + '</span>' + I('chevron') + '</button>';
        if (exp) part += '<ul class="sp-tl-list">' + n.done.map(function (k) { var x = doneLine(p, k); return '<li><strong>' + esc(x.title) + '</strong><small>' + metaHtml(x.meta) + '</small></li>'; }).join('') + '</ul>';
      }
      if (n.later.length) part += '<ul class="sp-tl-later">' + n.later.map(function (k) { var t = P.plan(k); return '<li><strong>' + esc(tr(k)) + '</strong><small>' + esc(T('given.days', { a: t.from, b: t.to })) + '</small></li>'; }).join('') + '</ul>';
      var w = isToday ? 'today' : d < today ? 'past' : 'future';
      return '<li class="sp-tl-node" data-when="' + w + '"><div class="sp-tl-head">' + head + '</div>' + part + '</li>';
    }).join('');
    return '<ol class="sp-tl" aria-label="' + esc(T('task')) + '">' + html + '</ol>';
  }
  function penSheet(inert) {
    var p = pen(), ended = !!P.s.ended, body = '';
    if (V.flash && V.flash.pen === p.code) body += flashLine();
    if (ended) body += K.warning({ tone: 'amber', text: T('ended.note') });
    body += UI.facts([{ label: T('born'), value: String(p.born) }, { label: T('alive'), value: String(p.alive) }, { label: T('dead'), value: String(p.dead) }], { columns: 3 });
    var lines = [];
    if (p.sowDied) lines.push('<span data-tone="red">' + esc(T('line.sow')) + '</span>');
    if (p.movedOut) lines.push('<span>' + esc(T('line.out', { n: p.movedOut })) + '</span>');
    if (p.movedIn) lines.push('<span>' + esc(T('line.in', { n: p.movedIn })) + '</span>');
    if (lines.length) body += '<p class="sp-lines">' + lines.join(' ') + '</p>';
    if (!ended) {
      var tools = [['death', 'alert', 'tool.death'], ['move', 'transfer', 'tool.move'], ['count', 'edit', 'tool.count']];
      if (P.hasId()) tools.push(['id', 'bookmark', 'tool.id']);
      body += '<div class="sp-toolrow" data-count="' + tools.length + '">' + tools.map(function (x) {
        return '<button type="button" class="sp-tool" data-action="' + (x[0] === 'id' ? 'id-open' : 'tool') + '" data-value="' + x[0] + '">' + I(x[1]) + '<span>' + esc(T(x[2])) + '</span></button>';
      }).join('') + '</div>';
    }
    body += timeline(p);
    var sub = [T('sheet.sub', { d: p.age, r: p.row })];
    if (P.hasId() && P.breeders(p)) sub.push(SEP, { text: T('breeders.n', { n: P.breeders(p) }), tone: 'green' });
    return K.drawer({ title: p.code, subtitle: sub, size: 'long', height: 'full', view: 'pen', inert: inert, close: null,
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

  /* ---- ID: one piglet at a time — number (the next one suggested), boar or gilt, weight, keep for breeding ---- */
  function idPage() {
    var p = pen(), f = V.idf, br = scheme() === 'breeders', next = P.nextNo(p.code), body = '';
    if (f.flash) {
      var undo = P.s.undo && P.s.undo.kind === 'id' ? UI.button({ label: T('undo'), register: 'text', action: 'id-undo' }) : '';
      body += '<div class="sp-flash" role="status"><span>' + esc(f.flash) + '</span>' + undo + '</div>';
    }
    var used = f.no && P.taken(f.no);
    body += '<div class="sp-idno"><label class="field"><span>' + esc(T(scheme() === 'notch' ? 'id.no.notch' : 'id.no.tag')) + '</span>' +
      '<input id="sp-id-no" inputmode="' + (scheme() === 'notch' ? 'text' : 'numeric') + '" autocomplete="off" value="' + esc(f.no) + '"' + (used ? ' aria-invalid="true" aria-describedby="sp-id-used"' : '') + '></label>' +
      (f.no === next ? '' : UI.button({ label: T('id.use', { no: next }), register: 'secondary', action: 'id-use', value: next })) + '</div>';
    if (used) body += '<p class="sp-warn" id="sp-id-used">' + esc(T('id.taken', { no: f.no })) + '</p>';
    body += K.radios({ layout: 'row', label: T('id.sex'), action: 'id-sex', key: 'sex', selected: f.sex, options: [{ value: 'boar', label: T('boar') }, { value: 'gilt', label: T('gilt') }] });
    body += '<label class="field sp-kg"><span>' + esc(T('id.kg')) + ' <small>' + esc(T('optional')) + '</small></span><input id="sp-id-kg" inputmode="decimal" autocomplete="off" value="' + esc(f.kg) + '"></label>';
    if (!br) body += K.radios({ layout: 'row', label: T('id.keep'), action: 'id-keep', key: 'keep', selected: f.keep ? 'yes' : 'no', options: [{ value: 'no', label: T('no') }, { value: 'yes', label: T('yes') }] });
    if (br && !p.picked) body += UI.button({ label: T('id.done.pick', { n: P.breeders(p) }), register: 'secondary', action: 'pick-done', className: 'sp-wide' });
    // the piglets with an ID in this pen, newest first; breeders carry a chip
    var rows = p.ids.slice().reverse().map(function (x) {
      return K.row({ id: x.no, chip: x.keep ? { text: T('breeder'), tone: 'green' } : null, headline: T(x.sex) + (x.kg != null ? ' · ' + T('kg', { w: x.kg }) : ''),
        meta: (sameDay(x.at) ? hm(x.at) : '') + (sameDay(x.at) ? ' · ' : '') + short(x.who), still: true, trail: '' });
    });
    body += K.list([K.group({ title: T('id.list'), face: 'word', meta: '· ' + idWhat(p), rows: rows.length ? rows : '<p class="sp-empty">' + esc(T('id.none.yet')) + '</p>' })]);
    var ready = f.no && !used && f.sex;
    return K.page({ title: tr('id'), description: T('id.page.sub', { pen: p.code, d: p.age, what: idWhat(p) }), view: 'id', body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('id.save'), action: 'id-save', register: 'primary', waiting: !ready } }) });
  }

  /* ---- record death ---- */
  var CAUSES = ['crushed', 'scours', 'starve', 'other'];
  function deathSheet() {
    var p = pen(), d = V.death, k = CAUSES.reduce(function (s, c) { return s + d.c[c]; }, 0);
    var body = CAUSES.map(function (c) { return stepper(c, T('c.' + c), d.c[c], { max: p.alive }); }).join('');
    var ready = k > 0;
    return K.drawer({ title: T('death.title'), subtitle: T('death.sub', { pen: p.code, n: p.alive }), size: 'long', view: 'death', close: null, body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('save'), action: 'death-save', register: 'primary', waiting: !ready } }) });
  }

  /* ---- move piglets: the other pen (same batch), how many, and for what was given here: had it? ---- */
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

  /* ---- set count: a big stepper from Alive; lower asks one quiet choice ---- */
  function countSheet() {
    var p = pen(), d = V.count;
    var body = stepper('count', T('count.label'), d.n, { variant: 'hero', face: 'count', min: 0, hint: '' });
    return K.drawer({ title: T('count.title'), subtitle: T('count.sub', { pen: p.code, n: p.alive }), size: 'long', view: 'count', close: null, body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('save'), action: 'count-save', register: 'primary', waiting: d.n === p.alive } }) });
  }

  /* ---- ticking a pen outside the window asks once ---- */
  function confirmDialog() {
    var c = V.confirm, p = P.s.pens[c.pen], t = P.plan(V.chip);
    return K.dialog({ icon: 'alert', title: T('confirm.title'),
      description: T('confirm.text', { pen: p.code, d: p.age, Tr: tr(t.key), a: t.from, b: t.to, mark: T(c.mark) }),
      footer: '<div class="tk-footer sp-two">' + UI.button({ label: T('cancel'), register: 'secondary', action: 'confirm-no' }) +
        UI.button({ label: T('confirm.ok'), register: 'primary', action: 'confirm-yes' }) + '</div>' });
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
      var names = []; soon.forEach(function (p) { P.coming(p).forEach(function (k) { if (names.indexOf(tr(k)) < 0) names.push(tr(k)); }); });
      body += '<p class="sp-quiet">' + esc(T('end.coming', { n: soon.length, list: names.join(', ') })) + '</p>';
    }
    if ((P.s.unaccounted || 0) > 0) body += '<p class="sp-quiet">' + esc(T('end.unacc', { n: P.s.unaccounted })) + '</p>';
    var f = ended ? K.footer({ back: { action: 'back', label: T('back') } })
      : K.footer({ back: { action: 'back', label: T('back') }, hold: { label: T('end.hold'), caption: T('end.caption'), action: 'end-commit', tone: 'danger' } });
    return K.page({ title: ended ? T('end.done.title') : T('end.title'), description: T('end.sub', { b: P.BATCH.name }), view: 'end', body: body, footer: f });
  }

  /* ================= render ================= */
  /* Each overlay on the phone has a key (its data-view, or 'dialog'). An overlay that is new on this render slides in
     (data-enter); one that is gone slides out first (data-leave), then the phone is redrawn. A re-render never replays. */
  var shownKeys = [], leaving = false;
  function overlays(root) {
    return Array.prototype.filter.call(root.children, function (el) { return el.matches('.tk-sheet, .tk-page, .tk-dialog-backdrop'); });
  }
  var keyOf = function (el) { return el.getAttribute('data-view') || (el.matches('.tk-dialog-backdrop') ? 'dialog' : ''); };
  function render() {
    if (leaving) return;
    document.documentElement.lang = L.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = T('task');
    var over = !!(V.pen || V.end || V.confirm);
    var html = K.statusbar() + listScreen(over);
    if (V.confirm) html += confirmDialog();
    if (V.pen) html += penSheet(!!(V.over || V.end));
    if (V.pen && V.over === 'treat') html += treatSheet();
    if (V.pen && V.over === 'death') html += deathSheet();
    if (V.pen && V.over === 'count') html += countSheet();
    if (V.pen && V.over === 'move') html += movePage();
    if (V.pen && V.over === 'id') html += idPage();
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
    // keep each scroller where it was when the same surface is drawn again
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
    if (V.pageTop) { phone.querySelectorAll('.tk-page-body').forEach(function (x) { x.scrollTop = 0; }); V.pageTop = false; }
    if (V.toTop) { var sc = phone.querySelector('.tk-scroll'); if (sc) sc.scrollTop = 0; V.toTop = false; }
    if (focusSel) {
      var f = phone.querySelector(focusSel);
      if (f && f.focus) { f.focus({ preventScroll: true }); if (caret != null && f.setSelectionRange) try { f.setSelectionRange(caret, caret); } catch (e) { /* not a text input */ } }
    }
    V.justRec = ''; V.justTick = '';
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
  /* Steps recorded on this visit stay in today's card until the worker leaves the sheet or a few seconds pass idle. */
  var pinTimer = 0;
  function unpinSoon() {
    clearTimeout(pinTimer);
    if (!Object.keys(V.pin).length) return;
    pinTimer = setTimeout(function () { if (V.over || V.end) { unpinSoon(); return; } V.pin = {}; render(); }, 4000);
  }
  function closeTop() {
    if (V.confirm) V.confirm = null;
    else if (V.end) V.end = null;
    else if (V.over) V.over = null;
    else if (V.pen) { V.pen = null; V.flash = null; V.open = {}; V.pin = {}; clearTimeout(pinTimer); }
  }
  function saved(key, args) { V.flash = { pen: V.pen, key: key, args: args, undo: true }; }
  function pinned(k, rec) { if (!rec) return; V.pin[k] = rec.id; V.justRec = rec.id; V.flash = null; unpinSoon(); }
  function idBlank(f) { return { no: '', sex: '', kg: '', keep: scheme() === 'breeders', flash: f || '' }; }
  function act(a, v, el) {
    var p = V.pen ? pen() : null;
    switch (a) {
      case 'chip': if (v === V.chip && !V.chipRec) return; chipStart(v); break;
      case 'pen': V.pen = v; V.flash = null; V.open = {}; V.pin = {}; break;
      case 'dismiss': case 'back': closeTop(); break;
      case 'noop': return;
      case 'end': V.end = true; break;
      case 'tick': {
        var place = P.bulkPlace(P.s.pens[v], V.chip);
        if (V.sel[v] != null) delete V.sel[v];
        else if (place === 'early' || place === 'late') V.confirm = { pen: v, mark: place };
        else { V.sel[v] = ''; V.justTick = v; }
        break;
      }
      case 'confirm-yes': V.sel[V.confirm.pen] = V.confirm.mark; V.justTick = V.confirm.pen; V.confirm = null; break;
      case 'confirm-no': V.confirm = null; break;
      case 'chip-undo': {
        var ids = Object.keys(V.chipRec).filter(function (c) { return c !== '_sum'; }).map(function (c) { return V.chipRec[c].id; });
        P.unrecord(ids); chipStart(V.chip); break;
      }
      case 'tl-toggle': V.open[v] = !V.open[v]; break;
      case 'one': pinned(v, P.treat(p.code, v, P.need(p, v))); break;
      case 'unrecord': P.unrecord(V.pin[v]); delete V.pin[v]; unpinSoon(); break;
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
        var t = V.treat, all = t.n >= P.need(p, t.k);
        var rec = P.treat(p.code, t.k, t.n, all ? '' : t.why);
        V.over = null;
        if (all) pinned(t.k, rec); else saved('flash.treat', { tr: tr(t.k), n: pigs(t.n) });
        break;
      }
      case 'tool':
        V.over = v;
        if (v === 'death') V.death = { c: { crushed: 0, scours: 0, starve: 0, other: 0 } };
        if (v === 'move') V.move = { to: '', n: 1, had: {} };
        if (v === 'count') V.count = { n: p.alive };
        break;
      case 'id-open': V.over = 'id'; V.idf = idBlank(); V.pageTop = true; break;
      case 'id-use': V.idf.no = v; break;
      case 'id-sex': V.idf.sex = v; break;
      case 'id-keep': V.idf.keep = v === 'yes'; break;
      case 'id-save': {
        var f = V.idf, x = P.identify(p.code, { no: f.no, sex: f.sex, kg: f.kg, keep: f.keep });
        V.idf = idBlank(T('id.recorded', { no: x.no }) + (x.keep ? ' · ' + T('breeder') : ''));
        break;
      }
      case 'id-undo': P.undo(); V.idf = idBlank(T('undone')); break;
      case 'pick-done': {
        var nb = P.donePicking(p.code);
        V.over = null; saved('flash.pick', { n: T('breeders.n', { n: nb }) });
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
    if (V.pen && Object.keys(V.pin).length) unpinSoon();   // the worker is still busy here: the pinned rows wait
    var el = e.target.closest('[data-action]');
    if (!el || !phone.contains(el) || el.classList.contains('st-hold')) return;
    if (UI.guard(el)) return;
    act(el.getAttribute('data-action'), el.getAttribute('data-value') != null ? el.getAttribute('data-value') : el.value, el);
  });
  // the chips are one radio group: arrow keys, Home and End move the choice
  UI.radioBind(phone, { onChange: function (field, value) { if (field === 'chips') act('chip', value); } });
  // typing in the ID fields
  phone.addEventListener('input', function (e) {
    if (!V.idf) return;
    if (e.target.id === 'sp-id-no') { V.idf.no = e.target.value.trim(); render(); }
    if (e.target.id === 'sp-id-kg') { V.idf.kg = e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && (V.pen || V.end || V.confirm)) { closeTop(); render(); }
  });
  var holds = K.holdBind(phone, { onCommit: function (b) {
    var a = b.getAttribute('data-action');
    setTimeout(function () {
      holds.settle(b, 'done');
      if (a === 'bulk-commit') {
        var picks = Object.keys(V.sel).sort().map(function (c) { return { pen: c, mark: V.sel[c] }; });
        var recs = P.bulk(V.chip, picks) || [];
        V.sel = {}; V.chipRec = { _sum: { pens: recs.length, n: recs.reduce(function (s, r) { return s + r.n; }, 0) } };
        recs.forEach(function (r) { V.chipRec[r.pen] = r; });
        V.justRec = 'bulk';
      }
      if (a === 'end-commit') { P.end(); V.pageTop = true; V.chip = ''; V.chipRec = null; }
      render();
    }, 250);
  } });

  /* a link can open a state: ?chip=iron|done|id, ?scheme=tag|notch|breeders|none (the design lint's pages) */
  (function () {
    var q = new URLSearchParams(location.search);
    var s = q.get('scheme'); if (s && P.SCHEMES.indexOf(s) >= 0 && s !== scheme()) P.setScheme(s);
    var c = q.get('chip'); if (c) chipStart(c);
  })();
  render();
})();
