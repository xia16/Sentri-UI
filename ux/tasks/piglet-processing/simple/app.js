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
    return { lens: 'todo', chip: '', sel: {}, chipDone: null, pen: null, over: null, treat: null, death: null, move: null, count: null, idf: null,
      confirm: null, end: null, flash: null, open: {}, demoOpen: keep ? keep.demoOpen : false };
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
  function pen() { return P.s.pens[V.pen]; }
  function newest(list) { return list.slice().sort(function (a, b) { return b.at - a.at; })[0]; }
  /* the ID step in words: `4 of 12 tagged`, `1 breeder picked` */
  function idWhat(p) { return scheme() === 'breeders' ? T('id.picked', { n: P.breeders(p) }) : T('id.of.' + scheme(), { n: P.idCount(p), m: p.alive }); }
  function stepAmount(p, k) { return k === 'id' ? idWhat(p) : pigs(P.need(p, k)); }

  /* ================= the pen list ================= */
  /* the meta line for a pen with something to do: `due today · 12 piglets`, `late · day 6 · 11 piglets`, `2 left · weak` */
  function todoMeta(p) {
    var td = P.todo(p), sts = td.map(function (k) { return P.status(p, k); });
    var tk = td.filter(function (k) { return k !== 'id'; });
    if (tk.length && tk.every(function (k) { return P.status(p, k) === 'left'; }) && td.length === tk.length) return [T('left', { n: P.need(p, tk[0]) }), SEP, T('why.' + (p.tr[tk[0]].why || 'weak'))];
    var amount = tk.length ? pigs(Math.max.apply(null, tk.map(function (k) { return P.need(p, k); }))) : idWhat(p);
    return [sts.indexOf('late') >= 0 ? { text: T('late') + ' · ' + T('day.n', { d: p.age }), tone: 'amber' } : T('due.today'), SEP, amount];
  }
  function penChip(p) {
    var sts = P.todo(p).map(function (k) { return P.status(p, k); });
    if (!P.s.ended && sts.indexOf('late') >= 0) return { text: T('chip.late'), tone: 'amber' };
    if (p.missing) return { text: T('chip.missing', { n: p.missing }), tone: 'amber' };
    if (p.sowDied) return { text: T('chip.sow'), tone: 'red' };
    return null;
  }
  function penRow(p) {
    var ended = !!P.s.ended, td = P.todo(p), headline, meta, tone = '';
    var lastR = newest(P.recs(p.code).filter(function (r) { return !!P.plan(r.tr); })), c = P.coming(p);
    if (ended) {
      headline = T('ended.row'); tone = 'forecast';
      meta = td.concat(c).length ? T('not.given.list', { list: td.concat(c).map(tr).join(', ') }) : T('all.given');
    } else if (td.length) {
      headline = td.map(chipName).join(' · ');
      meta = todoMeta(p);
    } else if (c.length) {
      headline = T('nothing.due'); tone = 'forecast';
      var next = T('from.day', { tr: trl(c[0]), d: P.plan(c[0]).from });
      meta = lastR ? [T('done.at', { t: when(lastR) }), SEP, next] : next;
    } else {
      headline = T('all.given');
      meta = lastR ? T('done.at', { t: when(lastR) }) : '';
    }
    return K.row({ id: p.code, chip: penChip(p), headline: headline, tone: tone, meta: meta, action: 'pen', value: p.code });
  }
  function isDone(p) { return P.todo(p).length === 0; }
  function groupsBy(list, rowFn) {
    return ['A', 'B'].map(function (r) {
      var rows = list.filter(function (p) { return p.row === r; });
      if (!rows.length) return '';
      return K.group({ title: T('row', { r: r }), face: 'word', meta: T('row.pens', { n: rows.length }), rows: rows.map(rowFn) });
    }).join('');
  }
  /* the filter chips: one per step due or late today, with how many pens need it */
  function chipCounts() {
    var all = P.pens();
    return P.steps().map(function (k) {
      return { k: k, n: all.filter(function (p) { var s = P.status(p, k); return s === 'due' || s === 'late' || s === 'left'; }).length };
    }).filter(function (c) { return c.n > 0; });
  }
  function chipsRow() {
    var list = chipCounts();
    var b = function (val, label, n) {
      return '<button type="button" class="sp-chip" aria-pressed="' + (V.chip === val) + '" data-action="chip" data-value="' + val + '"><span>' + esc(label) + '</span>' +
        (n != null ? '<span class="sp-chip-n">' + n + '</span>' : '') + '</button>';
    };
    return '<div class="sp-chips" role="group" aria-label="' + esc(T('chips.label')) + '">' + b('', T('chips.all')) +
      list.map(function (c) { return b(c.k, chipName(c.k), c.n); }).join('') + '</div>';
  }
  function chipStart(k) {
    V.chip = k; V.sel = {}; V.chipDone = null;
    if (k && k !== 'id') P.pens().forEach(function (p) { if (P.status(p, k) === 'due') V.sel[p.code] = ''; });
  }
  function chipTotals() {
    var codes = Object.keys(V.sel), n = 0;
    codes.forEach(function (c) { n += P.need(P.s.pens[c], V.chip); });
    return { pens: codes.length, n: n };
  }
  /* a pen under a chip: the row opens the pen; a treatment chip adds a tick at the end */
  function chipRow(p) {
    var k = V.chip, place = P.bulkPlace(p, k), st = P.status(p, k), amber = place === 'early' || place === 'late' ? place : '';
    var meta = st === 'left' ? T('bulk.left', { n: P.need(p, k), why: T('why.' + (p.tr[k].why || 'weak')) })
      : amber ? [{ text: T('day.n', { d: p.age }), tone: 'amber' }] : T('day.n', { d: p.age });
    var chip = amber ? { text: T(amber === 'late' ? 'Late' : 'Early'), tone: 'amber' } : penChip(p);
    var row = K.row({ id: p.code, chip: chip, headline: stepAmount(p, k), meta: meta, action: 'pen', value: p.code, trail: k === 'id' ? 'chevron' : '' });
    if (k === 'id' || P.s.ended) return row;
    var on = V.sel[p.code] != null;
    return '<div class="sp-tickrow">' + row + '<label class="sp-tick"><input type="checkbox" data-action="tick" value="' + p.code + '"' + (on ? ' checked' : '') +
      ' aria-label="' + esc(p.code) + '"></label></div>';
  }
  function chipFooter() {
    if (V.chipDone) {
      var undo = P.s.undo && P.s.undo.kind === 'bulk' ? UI.button({ label: T('undo'), register: 'secondary', action: 'chip-undo' }) : '';
      return '<p class="sp-foot-receipt" role="status">' + esc(V.chipDone) + '</p><div class="tk-footer sp-two">' + undo +
        UI.button({ label: T('done.btn'), register: 'primary', action: 'chip', value: '' }) + '</div>';
    }
    var tot = chipTotals();
    var label = T('bulk.hold', { tr: trl(V.chip), p: T('pens.n', { n: tot.pens }), n: pigs(tot.n) });
    return K.footer({ back: null, hold: { label: label, caption: T('bulk.caption'), action: 'bulk-commit', tone: 'primary', waiting: tot.pens === 0 },
      status: { text: tot.pens ? label : T('bulk.none'), id: 'sp-bulk-status' } });
  }
  function listScreen(inert) {
    var all = P.pens(), done = all.filter(isDone), todo = all.filter(function (p) { return !isDone(p); }), ended = P.s.ended;
    if (V.chip && !chipCounts().some(function (c) { return c.k === V.chip; }) && !V.chipDone) V.chip = '';
    var last = P.last();
    var body = K.latest(last ? { lead: T('last'), value: hm(last.at), rest: '· ' + last.who } : { lead: T('last.none') });
    if (V.flash && !V.pen) body += flashLine();
    P.s.notes.forEach(function (n, i) {
      if (n.seen) return;
      body += '<div class="sp-note">' + K.warning({ tone: 'amber', text: T('note.clash', { Tr: tr(n.tr), pen: n.pen, who: n.who, t: hm(n.at) }),
        actions: UI.button({ label: T('ok'), register: 'text', action: 'note-ok', value: String(i) }) }) + '</div>';
    });
    // the summary card: the first step on the plan with pens due today | the task (pens done), the door to End
    var best = { k: '', n: 0 };
    P.steps().forEach(function (k) {
      var n = all.filter(function (p) { return P.status(p, k) === 'due'; }).length;
      if (n && !best.n) best = { k: k, n: n };
    });
    var unit = ended ? { icon: 'treat', heading: T('sum.notdone'), value: String(todo.length), description: T('sum.pens', { n: todo.length }), support: T('batch', { b: P.BATCH.name }) }
      : { icon: 'treat', heading: best.n ? T('sum.due', { Tr: tr(best.k) }) : T('sum.none'), value: String(best.n),
        description: best.n ? T('sum.pens', { n: best.n }) : T('sum.nothing'), support: T('batch', { b: P.BATCH.name }) };
    body += K.summary({
      unit: unit,
      task: { icon: 'record', heading: ended ? T('sum.ended') : T('sum.task'), count: String(done.length), of: '/ ' + all.length, description: T('sum.done'),
        segments: [{ tone: 'done', share: done.length / all.length * 100 }, { tone: 'rest', share: 100 - done.length / all.length * 100 }], max: all.length, now: done.length,
        support: ended ? hm(ended.at) + ' · ' + ended.who : T('sum.end'), action: 'end', label: T('end.title') }
    });
    var foot = '';
    if (!ended) body += chipsRow();
    if (V.chip && !ended) {
      // the list filtered to the pens that need this step: inside the window first, then too early, then late
      var order = { now: 0, early: 1, late: 2 };
      var need = all.filter(function (p) { return P.bulkPlace(p, V.chip) !== 'done'; })
        .sort(function (a, b) { return order[P.bulkPlace(a, V.chip)] - order[P.bulkPlace(b, V.chip)] || (a.code < b.code ? -1 : 1); });
      var t = P.plan(V.chip);
      body += '<p class="sp-chip-head">' + esc(tr(V.chip) + ' · ' + T('given.days', { a: t.from, b: t.to })) + '</p>';
      if (V.chip === 'id') body += '<p class="sp-chip-tip">' + esc(T('chip.id.tip')) + '</p>';
      body += need.length ? K.list(groupsBy(need, chipRow)) : '<p class="sp-empty">' + esc(T('chip.none')) + '</p>';
      var nd = all.length - need.length;
      if (nd) body += '<p class="sp-empty">' + esc(T('chip.done.in', { n: nd })) + '</p>';
      if (V.chip !== 'id') foot = chipFooter();
    } else {
      var shown = V.lens === 'todo' ? todo : V.lens === 'done' ? done : all;
      body += K.lens({ action: 'lens', tabs: [
        { text: T('lens.todo'), count: String(todo.length), value: 'todo', pressed: V.lens === 'todo' },
        { text: T('lens.done'), count: String(done.length), value: 'done', pressed: V.lens === 'done' },
        { text: T('lens.all'), count: String(all.length), value: 'all', pressed: V.lens === 'all' }] });
      var groups = groupsBy(shown, penRow);
      body += groups ? K.list(groups) : '<p class="sp-empty">' + esc(T(V.lens === 'done' ? 'empty.done' : 'empty.todo')) + '</p>';
    }
    return K.screen({ inert: inert, label: T('task'), header: K.header({ title: T('task'), back: null }), body: body, dock: foot });
  }

  /* The receipt line after a save: what was recorded, and Undo while it is the last change */
  function flashLine() {
    var f = V.flash;
    var undo = f.undo && P.s.undo ? UI.button({ label: T('undo'), register: 'text', action: 'undo' }) : '';
    return '<div class="sp-flash" role="status"><span>' + esc(f.text) + '</span>' + undo + '</div>';
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
  function openStep(p, k, ended) {
    var st = P.status(p, k), t = P.plan(k), n = P.need(p, k), win = T('given.days', { a: t.from, b: t.to });
    var meta;
    if (k === 'id') meta = st === 'late' ? [{ text: T('late'), tone: 'amber' }, SEP, win, SEP, idWhat(p)] : [win, SEP, idWhat(p)];
    else if (st === 'left') meta = [T('tl.given', { n: p.tr[k].got }), SEP, T('left', { n: n }), SEP, T('why.' + (p.tr[k].why || 'weak'))];
    else meta = st === 'late' ? [{ text: T('late'), tone: 'amber' }, SEP, win, SEP, pigs(n)] : [win, SEP, pigs(n)];
    var act = ended ? '' : k === 'id' ? UI.button({ label: T('id.act.' + scheme()), register: 'secondary', action: 'id-open', value: 'id' })
      : UI.button({ label: T('record.n', { n: n }), register: 'secondary', action: 'one', value: k });
    return '<div class="sp-step">' + '<button type="button" class="sp-step-main" data-action="' + (ended ? 'noop' : k === 'id' ? 'id-open' : 'treat') + '" data-value="' + k + '">' +
      '<span class="sp-ring" aria-hidden="true"></span><span class="sp-step-copy"><strong>' + esc(tr(k)) + '</strong><small>' + metaHtml(meta) + '</small></span></button>' + act + '</div>';
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
      if (st === 'done') node(d0).done.push(k);
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
    if (p.missing) lines.push('<span data-tone="amber">' + esc(T('line.missing', { n: p.missing })) + '</span>');
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
  function moveAsks(p) {
    var ks = P.PLAN.filter(function (t) { return p.tr[t.key].got > 0; }).map(function (t) { return t.key; });
    if ((scheme() === 'tag' || scheme() === 'notch') && P.idCount(p) > 0) ks.push('id');
    return ks;
  }
  function movePage() {
    var p = pen(), d = V.move;
    var others = P.pens().filter(function (o) { return P.sameBatch(p, o); });
    var body = '<section class="sp-pick">' + UI.heading({ title: T('move.to'), kind: 'section', level: 3 }) +
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
    if (d.n < p.alive) {
      body += K.radios({ label: '', action: 'count-why', key: 'cwhy', selected: d.why, options: [
        { value: 'unsure', label: T('count.unsure') }, { value: 'wrong', label: T('count.wrong') }] });
    }
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
    var focusSel = null, a = document.activeElement, caret = null;
    if (a && phone.contains(a)) {
      if (a.id) focusSel = '#' + CSS.escape(a.id);
      else if (a.getAttribute('data-action')) focusSel = '[data-action="' + a.getAttribute('data-action') + '"][data-value="' + (a.getAttribute('data-value') || '') + '"]';
      if (a.tagName === 'INPUT' && a.type !== 'checkbox') caret = a.selectionStart;
    }
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
    phone.innerHTML = html;
    phone.querySelectorAll('.tk-scroll, .tk-sheet-body, .tk-page-body').forEach(function (el) {
      var host = el.closest('[data-view]'), k = (host ? host.getAttribute('data-view') : 'list') + el.className;
      if (keep[k] != null) el.scrollTop = keep[k];
    });
    if (V.pageTop) { phone.querySelectorAll('.tk-page-body').forEach(function (x) { x.scrollTop = 0; }); V.pageTop = false; }
    if (V.toTop) { var sc = phone.querySelector('.tk-scroll'); if (sc) sc.scrollTop = 0; V.toTop = false; }
    if (focusSel) {
      var f = phone.querySelector(focusSel);
      if (f && f.focus) { f.focus({ preventScroll: true }); if (caret != null && f.setSelectionRange) try { f.setSelectionRange(caret, caret); } catch (e) { /* not a text input */ } }
    }
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
    else if (V.end) V.end = null;
    else if (V.over) V.over = null;
    else if (V.pen) { V.pen = null; V.flash = null; V.open = {}; }
  }
  function saved(text) { V.flash = { pen: V.pen, text: text, undo: true }; }
  function idBlank(f) { return { no: '', sex: '', kg: '', keep: scheme() === 'breeders', flash: f || '' }; }
  function act(a, v, el) {
    var p = V.pen ? pen() : null;
    switch (a) {
      case 'lens': V.lens = v; break;
      case 'chip': chipStart(V.chip === v && v ? '' : v); V.toTop = false; break;
      case 'pen': V.pen = v; V.flash = null; V.open = {}; break;
      case 'dismiss': case 'back': closeTop(); break;
      case 'noop': return;
      case 'end': V.end = true; break;
      case 'tick': {
        var place = P.bulkPlace(P.s.pens[v], V.chip);
        V.chipDone = null;
        if (V.sel[v] != null) delete V.sel[v];
        else if (place === 'early' || place === 'late') { el.checked = false; V.confirm = { pen: v, mark: place }; }
        else V.sel[v] = '';
        break;
      }
      case 'confirm-yes': V.sel[V.confirm.pen] = V.confirm.mark; V.confirm = null; break;
      case 'confirm-no': V.confirm = null; break;
      case 'chip-undo': P.undo(); V.chipDone = null; chipStart(V.chip); break;
      case 'tl-toggle': V.open[v] = !V.open[v]; break;
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
        V.over = null; saved(T('flash.pick', { n: T('breeders.n', { n: nb }) }));
        break;
      }
      case 'miss': V.death.miss = v; break;
      case 'death-save': {
        var k = P.death(p.code, V.death.c, V.death.miss === 'yes');
        V.over = null; saved(T('flash.death', { n: pigs(k) }));
        break;
      }
      case 'move-to': V.move.to = v; break;
      case 'had': { var fl = el.closest('[data-field]'); V.move.had[fl.getAttribute('data-field')] = v === 'yes'; break; }
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
        var recs = P.bulk(V.chip, picks) || [], n = recs.reduce(function (s, r) { return s + r.n; }, 0);
        V.sel = {};
        V.chipDone = T('flash.bulk', { Tr: tr(V.chip), tr: trl(V.chip), p: T('pens.n', { n: recs.length }), n: pigs(n) });
      }
      if (a === 'end-commit') { P.end(); V.pageTop = true; V.chip = ''; }
      render();
    }, 250);
  } });

  render();
})();
