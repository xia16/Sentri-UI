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
    return { lens: 'todo', chip: '', pen: null, tab: 'proc', draft: {}, over: null, adj: null, death: null, move: null, count: null, weight: null, give: null,
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
  /* a Status chip for a row: kind picks the colour (Status's one map) */
  function chipOf(kind, k) { var o = S(k); o.kind = kind; return o; }
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
  var reduced = function () { return (window.AtlasBare && window.AtlasBare.bare) || window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
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
  function penChip(p) {   // the End page's rows
    var sts = P.todo(p).map(function (k) { return P.status(p, k); });
    if (!P.s.ended && sts.indexOf('late') >= 0) return chipOf('late', 'chip.late');
    if (p.sowDied) return chipOf('died', 'chip.sow');
    return null;
  }
  function names(keys) { return keys.reduce(function (acc, k, i) { return (i ? acc.concat([SEP]) : acc).concat([S(chipKey(k))]); }, []); }
  /* One status chip under the sow ID, in farrowing's chip style (its Active / Done / Sow died): Late, Sow died, To do,
     Done — one at most. */
  function sowChip(p) {
    var sts = P.todo(p).map(function (k) { return P.status(p, k); });
    if (P.s.ended) return null;
    if (sts.indexOf('late') >= 0) return chipOf('late', 'chip.late');
    if (p.sowDied) return chipOf('died', 'chip.sow');
    /* the lens above already says To do / Done; the row keeps only what differs (Late, Sow died) */
    return null;
  }
  /* The pen's card, exactly farrowing's room list: the pen header (`A03 · 1 sow ›`, TaskGroup) and the sow's row under it
     (TaskRow): mono sow ID with its one chip; the headline is what is due (or, with nothing due, farrowing's figure:
     `12 piglets`, or the forecast `Iron in 2 days` as farrowing's `Due tomorrow`); the meta is one mono line,
     `12 piglets · day 4 · 08:20 · G.H` (farrowing's `born 14 · 1h ago · G.H`). Done rows end in farrowing's edit pencil. */
  function penCard(p) {
    var td = P.todo(p), c = P.coming(p), headline, tone = '', figure = false;
    var lastR = newest(P.recs(p.code));
    if (P.s.ended) { headline = [S('ended.row')]; tone = 'forecast'; }
    else if (td.length) headline = names(td);
    else if (c.length) {
      var next = Math.min.apply(null, c.map(function (k) { return P.plan(k).from; }));
      headline = [S('st.in', { tr: chipName(c.filter(function (k) { return P.plan(k).from === next; })[0]), n: next - p.age })]; tone = 'forecast';
    } else { headline = [S('piglets', { n: p.alive })]; figure = true; }
    var meta = figure ? [] : [S('piglets', { n: p.alive }), SEP];
    meta.push(S('day.n', { d: p.age }));
    if (lastR) meta.push(SEP, S('fig', { v: sameDay(lastR.at) ? hm(lastR.at) : md(lastR.at) }), SEP, S('fig', { v: short(lastR.who) }));
    var done = !P.s.ended && !td.length && !c.length;
    var row = K.row({ id: S('code', { c: p.sow }), chip: sowChip(p), headline: headline, tone: tone, meta: meta, action: 'pen', value: p.code, trail: 'chevron' });
    return K.group({ title: S('code', { c: p.code }), meta: S('sows.one'), door: { action: 'pen', value: p.code, label: T('pen.aria', { pen: p.code }) }, rows: row });
  }
  function isDone(p) { return P.todo(p).length === 0; }
  /* The lens selects To do / Done; tags narrow jobs within To do. */
  function chipCounts() {
    var all = P.pens().filter(function(p){return !isDone(p);});
    if (P.s.ended) return [];
    return P.steps().map(function (k) { return { k: k, n: all.filter(function (p) { return needsToday(p, k); }).length }; })
      .filter(function (c) { return c.n > 0 || c.k === V.chip; });
  }
  function chipsRow() {
    var all = P.pens(), done = all.filter(isDone).length;
    var items = [{ value: '', label: S('chips.all'), checked: V.chip === '', aria: T('chips.all') }]
      .concat(chipCounts().map(function (c) { return { value: c.k, label: S(chipKey(c.k)), count: S('fig', { v: c.n }), checked: V.chip === c.k, aria: T('chip.aria', { name: chipName(c.k), n: c.n }) }; }))
      ;
    return '<div class="sp-list-lens">'+UI.segment({variant:'two-line-lens',options:[['todo',K.T(S('lens.todo')),{count:all.length-done}],['done',K.T(S('lens.done'))]],active:V.lens,action:'list-lens',ariaLabel:T('chips.label')})+'</div>' + (V.lens==='todo'?K.chips({ items: items, action: 'chip', key: 'chips', label: T('chips.label') }):'');
  }
  /* the task's overall checker: piglets the records cannot account for (set counts lower than the record), batch level only */
  function batchLine() { var u = P.s.unaccounted || 0; return u > 0 ? S('batch.unacc', { b: P.BATCH.name, n: u }) : S('batch', { b: P.BATCH.name }); }
  function listScreen(inert) {
    var all = P.pens(), done = all.filter(isDone), todo = all.filter(function (p) { return !isDone(p); }), ended = P.s.ended;
    var last = P.last();
    var clash = P.s.notes.some(function (n) { return !n.seen; });
    var body = clash ? '' : K.latest(last ? { lead: S('last'), value: S('fig', { v: hm(last.at) }), rest: S('last.who', { who: last.who }) } : { lead: S('last.none') });
    if (V.flash && !V.pen) body += flashLine();
    P.s.notes.forEach(function (n, i) {
      if (n.seen) return;
      body += '<div class="sp-note">' + K.warning({ tone: 'amber', title: S('note.title'), text: S('note.clash', { Tr: tr(n.tr), pen: n.pen, who: n.who, t: hm(n.at) }),
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
    var shown = V.lens === 'done' ? done : todo.filter(function (p) { return !V.chip || needsToday(p, V.chip); });
    body += shown.length ? K.list(shown.map(penCard))
      : '<p class="sp-empty">' + H(V.lens === 'done' ? 'empty.done' : 'chip.none') + '</p>';
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
      if (typeof x === 'object') return '<span class="st-part" data-tone="' + esc(x.tone) + '">' + esc(x.text) + '</span>';
      return esc(x);
    }).join('');
  }
  var dayDate = function (p, d) { return md(Date.now() - (p.age - d) * 864e5); };
  /* Processing: one TaskDay card per age-day (the skeleton's day card, farrowing's Piglet processing · Care). Each item is
     one row of that card — its whole row ticks it: the open ring becomes the check disc; Submit saves the ticked ones. A
     ticked item carries its count as the card's one-tap slot (fewer piglets: tap it). A day with everything done folds to
     one row (`2 done · Iron · Dock tail`); tap it to open. Later days say they can be done early. The ID item opens the
     ID form. */
  var dayDate = function (p, d) { return md(Date.now() - (p.age - d) * 864e5); };
  function doneMeta(p, k) {
    if (k === 'id') {
      var r = newest(P.recs(p.code, 'id').concat(P.recs(p.code, 'pick')));
      return r ? [short(r.who) + ' ' + when(r), SEP, idWhat(p)] : [idWhat(p)];
    }
    var rs = P.recs(p.code, k), r2 = newest(rs), n = rs.reduce(function (s2, x) { return s2 + x.n; }, 0);
    var meta = r2 ? [short(r2.who) + ' ' + when(r2), SEP, pigs(n || p.tr[k].got)] : [pigs(p.tr[k].got)];
    var mk = rs.filter(function (x) { return x.mark; })[0];
    if (mk) meta.push(SEP, { text: T(mk.mark === 'early' ? 'item.early' : mk.mark), tone: 'amber' });
    var note = P.s.notes.filter(function (x) { return x.pen === p.code && x.tr === k; })[0];
    if (note) meta.push(SEP, T('kept.note') + ' (' + hm(note.mine.at) + ')');
    return meta;
  }
  function dayItem(p, k, ended, future) {
    var t = P.plan(k), st = P.status(p, k), n = P.need(p, k);
    if (st === 'done') return { title: tr(k), meta: doneMeta(p, k), mark: 'done', action: k === 'id' ? 'id-open' : 'noop', value: k, id: 'sp-done-' + k,
      fresh: V.justRec.some(function (id) { var r = P.s.records.filter(function (x) { return x.id === id; })[0]; return r && r.tr === k; }) };
    if (k === 'id') {
      var filled = scheme() === 'breeders' ? !!p.picked : P.recs(p.code, 'id').length > 0;   // opens Give IDs
      var m = [{ text: T(filled ? 'item.filled' : 'item.notfilled'), tone: filled ? 'green' : 'amber' }, SEP, idWhat(p)];
      if (st === 'late') m.push(SEP, { text: T('late'), tone: 'amber' });
      return { title: tr(k), meta: m, mark: 'due', action: ended ? 'noop' : 'id-open', value: 'id', id: 'sp-id-' + k };
    }
    var dft = V.draft[k], meta = st === 'left' ? [T('tl.given', { n: p.tr[k].got }), SEP, T('left', { n: n }), SEP, T('why.' + (p.tr[k].why || 'weak'))]
      : [T('given.days', { a: t.from, b: t.to })];
    if (st === 'late') meta.push(SEP, { text: T('late'), tone: 'amber' });
    if (future && dft) meta.push(SEP, { text: T('item.early'), tone: 'amber' });
    if (dft && dft.n < n) meta.push(SEP, { text: T('left', { n: n - dft.n }) + ' · ' + T('why.' + (dft.why || 'weak')), tone: 'amber' });
    return { title: tr(k), meta: meta, mark: dft ? 'ticked' : 'due', action: ended ? 'noop' : 'item', value: k, id: 'sp-tk-' + k, label: tr(k),
      act: dft ? { label: pigs(dft.n), action: 'adjust', value: k } : null };
  }
  function processing(p) {
    var ended = !!P.s.ended, days = {}, doneKs = [];
    P.steps().forEach(function (k) {
      var st = P.status(p, k), d = P.plan(k).from;
      // a step saved on this visit stays in its day card a few seconds (in place), then goes to Done
      if (st === 'done' && !V.keepOpen[k]) doneKs.push(k);
      else (days[d] = days[d] || []).push(k);
    });
    var html = UI.heading({ title: T('proc.title'), kind: 'section', level: 3, icon: I('treat') });
    html += Object.keys(days).map(Number).sort(function (a, b) { return a - b; }).map(function (d) {
      var future = d > p.age;
      var items = days[d].map(function (k) { return dayItem(p, k, ended, future); });
      var day = K.day({ title: T('day.open', { d: d }), status: future ? T('day.early') : T('day.plan', { date: dayDate(p, d) }), items: items });
      return day.replace('class="tk-day"', 'class="tk-day" data-when="' + (future ? 'future' : 'today') + '"');
    }).join('');
    if (!Object.keys(days).length) html += '<p class="sp-quiet">' + esc(T('proc.nothing')) + '</p>';
    if (doneKs.length) {
      var open = !!V.open.done;
      var rows = open ? doneKs.map(function (k) { var x = dayItem(p, k, ended, false); x.meta = [T('day.n', { d: P.plan(k).from }), SEP].concat(x.meta); return x; }) : [];
      rows.push({ title: T(open ? 'tl.close' : 'tl.open'), meta: open ? '' : [doneKs.map(tr).join(' · ')], mark: '', action: 'day', value: 'done', id: 'sp-done-toggle' });
      html += K.day({ title: T('proc.done'), status: T('proc.done.n', { n: doneKs.length }), items: rows }).replace('class="tk-day"', 'class="tk-day" data-when="done"');
    }
    return '<section class="sp-proc">' + html + '</section>';
  }
  /* Piglets: what is in the pen now, then the identified piglets. Born and deaths are history: they live in the pen log. */
  /* The Piglets card: farrowing's "Litter summary · View log ›" — a section heading with its link, then the facts. Facts
     only read; each figure's act lives elsewhere: Tag piglets opens the identified piglets (tagged, breeders), the weight
     and the boars · gilts count are in More, and a litter not yet weighed shows one link below the facts. */
  function pigletsCard(p) {
    var w = lastWeight(p), every = P.hasId() && scheme() !== 'breeders' && P.idCount(p) >= p.alive && p.alive > 0;
    var sex = every ? { boar: p.ids.filter(function (x) { return x.sex === 'boar'; }).length, gilt: p.ids.filter(function (x) { return x.sex === 'gilt'; }).length } : p.sex;
    var items = [
      { label: T('pg.sex'), value: sex ? T('pg.sexv', { b: sex.boar, g: sex.gilt }) : null },
      { label: T('pg.weight'), value: w ? T('kg', { w: w.kg }) : null }];
    if (P.hasId()) {
      items.push({ label: T(scheme() === 'notch' ? 'pc.notched' : 'pc.tagged'), value: T('pc.of', { n: P.idCount(p), m: p.alive }) });
      items.push({ label: T('pg.breeders'), value: String(P.breeders(p)) });
    }
    return '<section class="sp-pcard">' + UI.heading({ title: T('pc.title'), kind: 'section', level: 3, icon: I('record'), action: { label: T('pc.log'), action: 'log-open' } }) +
      UI.facts(items, { columns: 2 }) +
      (w || P.s.ended ? '' : UI.button({ label: T('pg.weight.hint'), register: 'text', action: 'weight-open', className: 'sp-weigh' }).replace(/<\/button>$/, I('chevron') + '</button>')) + '</section>';
  }
  /* The tool row, as farrowing's (Edit · Record death · More actions): Tag piglets (per farm scheme; none on a no-ID farm) ·
     Record death · More */
  function toolRow() {
    var tools = [];
    if (P.hasId()) tools.push(['id-open', 'scan', T('tr.id.' + scheme())]);
    tools.push(['tool-death', 'alert', T('tool.death')], ['more', 'more', T('more.title')]);
    return '<div class="sp-toolrow" data-count="' + tools.length + '">' + tools.map(function (x) {
      return UI.button({register: 'tool', action: x[0], label: x[2]});  /* label only: icon + 'Record death' will not fit on one line at 111px */
    }).join('') + '</div>';
  }
  function penSheet(inert) {
    var p = pen(), ended = !!P.s.ended, body = '';
    if (V.flash && V.flash.pen === p.code) body += flashLine();
    if (ended) body += K.warning({ tone: 'notice', text: T('ended.note') });
    body += pigletsCard(p);
    if (!ended) body += toolRow();
    body += processing(p);
    var n = Object.keys(V.draft).length;
    var foot = K.footer({ back: { action: 'back', label: T('back') }, primary: ended ? null : { label: T('submit.n', { n: n }), action: 'submit', register: 'primary', waiting: !n }, status: !n ? T('sr.items') : null });
    var sub = [T('sheet.pen', { pen: p.code, p: p.parity }), SEP, T('piglets', { n: p.alive }), SEP, T('day.n', { d: p.age })];
    return K.drawer({ title: p.sow, subtitle: sub, size: 'long', height: 'full', view: 'pen', inert: inert, close: { action: 'back', label: T('close.pen') },
      body: body, footer: foot });
  }
  /* ---- boars · gilts: two steppers ---- */
  function countsSheet() {
    var p = pen(), c = V.counts;
    return K.drawer({ title: T('cnt.title'), subtitle: T('w.sub', { pen: p.code, d: p.age }), size: 'long', view: 'counts',
      body: stepper('boar', T('idf.boars'), c.boar) + stepper('gilt', T('idf.gilts'), c.gilt),
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('rec.counts'), action: 'counts-save', register: 'primary' } }) });
  }
  /* ---- Piglets: the pen's identified piglets (tag/notch · sex · weight), each with its breeder flag; tap a row to fix it;
     one primary "Tag a piglet" opens the one-piglet run, which comes back here ---- */
  function taggedPage() {
    var p = pen(), ended = !!P.s.ended;
    var rows = p.ids.slice().reverse().map(function (x) {
      var id = [x.tag, x.notch].filter(Boolean).join(' · ');
      var mark = UI.iconButton({ action: ended ? 'noop' : 'breeder', value: x.no, icon: I('bookmark'), label: T(x.keep ? 'mark.off' : 'mark.on', { no: x.no }), variant: 'plain', selected: !!x.keep, className: 'sp-mark' });
      var row = K.row({ id: id, headline: T(x.sex) + (x.kg != null ? ' · ' + T('kg', { w: x.kg }) : ''),
        meta: (sameDay(x.at) ? hm(x.at) + ' · ' : '') + short(x.who), action: ended ? '' : 'give-fix', value: x.no, trail: '', still: ended, label: T('fix.aria', { no: x.no }) });
      return '<div class="sp-pigrow" data-ds="Row">' + row + mark + '</div>';
    });
    var body = (!ended && p.ids.length ? '<p class="sp-quiet">' + esc(T('tagged.hint')) + '</p>' : '') +
      K.list([K.group({ title: T(scheme() === 'notch' ? 'pc.notched' : 'pc.tagged'), face: 'word', meta: '· ' + idWhat(p) + ' · ' + T('breeders.n', { n: P.breeders(p) }),
        rows: rows.length ? rows : '<p class="sp-empty">' + esc(T('id.none.yet')) + '</p>' })]);
    if (scheme() === 'breeders' && !p.picked && !ended) body += UI.button({ label: T('id.done.pick', { n: P.breeders(p) }), register: 'secondary', action: 'pick-done', className: 'sp-wide' });
    return K.page({ title: T('pl.title'), description: p.code + ' · ' + T('sow', { tag: p.sow }), view: 'tagged', body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: ended ? null : { label: T('add.' + scheme()), action: 'give-new', register: 'primary' } }) });
  }

  /* ---- More: Move piglets · Set count · Litter weight · Boars and gilts (the figures the Piglets card only reads) ---- */
  function moreSheet() {
    return K.drawer({ title: T('more.title'), size: 'medium', view: 'more',
      body: K.doors({ card: true, items: [{ title: T('move.title'), icon: 'transfer', action: 'tool', value: 'move' }, { title: T('tool.count'), icon: 'edit', action: 'tool', value: 'count' },
        { title: T('w.title'), icon: 'weight', action: 'weight-open', value: '' }, { title: T('cnt.title'), icon: 'profile', action: 'counts-open', value: '' }] }),
      footer: K.footer({ back: { action: 'back', label: T('back') } }) });
  }
  /* ---- fewer piglets for one ticked item: a stepper; a shortfall asks one reason ---- */
  function stepper(key, label, value, o) {
    return UI.stepper(Object.assign({ label: label, value: value, key: key, action: 'step', min: 0, reserveHint: false }, o || {}));
  }
  function adjustSheet() {
    var p = pen(), d = V.adj, n = P.need(p, d.k), less = d.n < n;
    var body = stepper('adj', T('treat.given'), d.n, { max: n, min: 1 });
    if (less) {
      body += K.radios({ label: T('treat.why'), action: 'why', key: 'why', selected: d.why, options: [
        { value: 'weak', label: T('treat.weak') }, { value: 'sick', label: T('treat.sick') }] });
      body += '<p class="sp-quiet">' + esc(T('treat.later', { n: n - d.n })) + '</p>';
    }
    return K.drawer({ title: tr(d.k), subtitle: T('adj.sub', { pen: p.code, n: n }), size: 'long', view: 'adjust', body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('adj.use', { n: d.n }), action: 'adjust-use', register: 'primary', waiting: less && !d.why }, status: less && !d.why ? T('sr.why') : null }) });
  }

  /* ---- Give IDs: one piglet at a time (farrowing's identity pattern, research/per-piglet-proposal.md flow a) ----
     The tag readout holds the next number on the strip ("Use 001237"); a scan replaces it; the digits are editable on the
     skeleton's Numpad. Boar · Gilt are two big tiles. Weight is optional, on the same pad. Gilts can be kept for breeding
     where the farm picks breeders here. "Record · next piglet" saves this piglet now and moves to the next number. The
     recorded piglets are listed under it; tap one to fix it. After the last, the litter's weight (and its boar/gilt
     counts, from the rows — steppers only when some piglets have no ID). */
  var notch = function () { return scheme() === 'notch'; };
  function giveBlank(p, last) {
    var nx = P.nextNo(p.code);
    return { field: '', id: { value: notch() ? nx.split('-')[1] : nx, suggested: true, suggestion: notch() ? nx.split('-')[1] : nx }, kg: '', sex: '', keep: scheme() === 'breeders',
      last: last || null, edit: '', litterKg: '', boar: p.sex ? p.sex.boar : 0, gilt: p.sex ? p.sex.gilt : 0, litterSaved: false };
  }
  function giveNo(p) { var g = V.give, v = UI.numpadCommit(g.id.value); return v == null ? '' : notch() ? p.litter + '-' + v : v; }
  function giveUsed(p) { var g = V.give, no = giveNo(p); return no && no !== g.edit && P.taken(no) ? no : ''; }
  var PADS = { id: function () { return notch() ? { maxLength: 2 } : { maxLength: 6 }; }, kg: function () { return { decimals: 1, intLength: 2 }; }, litter: function () { return { decimals: 1, intLength: 3 }; } };
  function givePad() {
    var g = V.give, f = g.field;
    if (!f) return '';
    var st = f === 'id' ? g.id : { value: f === 'kg' ? g.kg : g.litterKg, suggested: false };
    return UI.numpad(Object.assign({ value: st.value, suggested: !!st.suggested, unit: f === 'id' ? '' : 'kg', action: 'pad', key: f, compact: true,
      hint: f === 'id' && giveUsed(pen()) ? T('id.taken', { no: giveUsed(pen()) }) : '', tone: f === 'id' && giveUsed(pen()) ? 'warn' : '' }, PADS[f]()));
  }
  function givePage() {
    var p = pen(), g = V.give, br = scheme() === 'breeders', ended = !!P.s.ended, body = '';
    var left = Math.max(0, p.alive - P.idCount(p)), allDone = false;
    if (g.last) body += '<div class="sp-flash" role="status"><span>' + esc(T('give.last', { no: g.last.no, sex: T(g.last.sex), kg: g.last.kg != null ? ' · ' + T('kg', { w: g.last.kg }) : '' })) + '</span>' +
      UI.button({ label: T('undo'), register: 'text', action: 'give-undo' }) + '</div>';
    if (!allDone && !ended) {
      var used = giveUsed(p), no = giveNo(p);
      var idLabel = T(notch() ? 'give.notch' : 'give.tag');
      body += '<div class="sp-give-id">' + UI.measure({ label: idLabel, value: no || '', placeholder: '—', action: 'give-field', key: 'id', active: g.field === 'id',
        tone: used ? 'refused' : '', hint: used ? T('id.taken', { no: used }) : g.id.suggested ? T(notch() ? 'give.use.n' : 'give.use', { no: no }) : '', className: 'sp-give-measure' }) +
        (notch() ? '' : UI.iconButton({ action: 'give-scan', icon: I('scan'), label: T('pg.scan'), className: 'sp-give-scan' })) + '</div>';
      body += K.choice({ action: 'give-sex', label: T('id.sex'), options: [{ value: 'boar', label: T('boar'), pressed: g.sex === 'boar' }, { value: 'gilt', label: T('gilt'), pressed: g.sex === 'gilt' }] });
      /* weight is optional: the optional row until it is being typed, then the Measure on the Numpad */
      body += g.field === 'kg' ? UI.measure({ label: T('give.kg'), optional: T('optional'), value: g.kg, unit: 'kg', placeholder: '—', action: 'give-field', key: 'kg', active: true, className: 'sp-give-measure' })
        : UI.optionalRow({ label: T('give.kg'), optionalWord: T('optional'), value: g.kg ? T('kg', { w: g.kg }) : '', icon: I('plus'), editIcon: I('edit'), action: 'give-field', key: 'kg' });
    }
    var ready = !giveUsed(p) && giveNo(p) && g.sex;
    var primary = { label: T(g.edit ? 'give.fix' : 'give.save'), action: 'give-save', register: 'primary', waiting: !ready };
    var sub = T('give.sub', { pen: p.code, sow: p.sow, n: left });
    return K.page({ title: T(br ? 'tr.id.breeders' : 'give.title'), description: g.edit ? T('give.fixing', { no: g.edit }) : sub, view: 'give', body: body,
      footer: givePad() + K.footer({ back: { action: 'back', label: T('back') }, primary: ended ? null : primary, status: !ended && !ready ? T('sr.id') : null }) });
  }
  /* the litter weight from the Piglets tab: one Measure on the same Numpad */
  function weightSheet() {
    var p = pen(), w = V.weight;
    return K.drawer({ title: T('w.title'), subtitle: T('w.sub', { pen: p.code, d: p.age }), size: 'long', view: 'weight',
      body: UI.measure({ label: T('w.kg'), value: w.kg, unit: 'kg', placeholder: '—', active: true, action: 'noop', key: 'w', className: 'sp-give-measure' }),
      footer: UI.numpad({ value: w.kg, unit: 'kg', action: 'pad', key: 'w', compact: true, decimals: 1, intLength: 3 }) +
        K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('rec.weight'), action: 'weight-save', register: 'primary', waiting: !(+w.kg > 0) }, status: !(+w.kg > 0) ? T('sr.kg') : null }) });
  }
  /* ---- the pen log: born, deaths, moves, counts, treatments, IDs — the history, newest first ---- */
  /* One recorded act is one entry: the IDs given on one day are one line ("IDs given · 8", the range under it); the group is the
     day (Today · Yesterday · weekday · date), the stamp is time · initials. */
  function logPage() {
    var p = pen(), list = [], ids = {};
    var day = function (ms) { return new Date(ms).toDateString(); };
    P.recs(p.code).forEach(function (r) {
      if (r.tr === 'id') {
        var g = ids[day(r.at)];
        if (!g) { g = ids[day(r.at)] = { at: r.at, who: r.who, nos: [] }; list.push({ id: g }); }
        g.nos.push(r.no); g.at = Math.max(g.at, r.at);
        return;
      }
      var what = r.tr === 'death' ? T('log.death', { n: r.n }) : r.tr === 'move' ? T('log.move', { n: pigs(r.n), to: r.to }) : r.tr === 'count' ? T('log.count', { n: r.n })
        : r.tr === 'pick' ? T('log.pick') : r.tr === 'breeder' ? T(r.n ? 'log.breeder' : 'log.notbreeder', { no: r.no }) : T('log.treat', { tr: tr(r.tr), n: pigs(r.n) });
      list.push({ title: what, at: r.at, by: short(r.who) });
    });
    list = list.map(function (e) {
      if (!e.id) return e;
      var nos = e.id.nos.slice().sort();
      return nos.length === 1 ? { title: T('log.id', { no: nos[0] }), at: e.id.at, by: short(e.id.who) }
        : { title: T('log.ids', { n: nos.length }), detail: nos[0] + '–' + nos[nos.length - 1], at: e.id.at, by: short(e.id.who) };
    });
    // a record known only by its day of life carries a date, no clock time
    var ymd = function (daysAgo) { var d = new Date(Date.now() - daysAgo * 864e5), z = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); };
    p.weights.forEach(function (w) { list.push({ title: T('log.weight', { w: w.kg }), at: w.at || ymd(p.age - w.day), by: w.who ? short(w.who) : undefined }); });
    list.push({ title: T('log.born', { n: p.born }), detail: p.dead ? T('log.dead.birth', { n: p.dead }) : '', at: p.bornAt || ymd(p.age), by: p.bornWho ? short(p.bornWho) : undefined });
    var groups = UI.logGroups(list, { lang: L.lang === 'zh' ? 'zh-CN' : 'en', today: T('sec.today'), yesterday: T('log.yest') });
    return K.page({ title: T('log.title'), description: p.code + ' · ' + T('sow', { tag: p.sow }), view: 'log', body: UI.log(groups, { empty: T('log.none') }) });
  }

  /* ---- record death ---- */
  var CAUSES = ['crushed', 'scours', 'starve', 'other'];
  function deathSheet() {
    var p = pen(), d = V.death, k = CAUSES.reduce(function (s, c) { return s + d.c[c]; }, 0);
    var body = CAUSES.map(function (c) { return stepper(c, T('c.' + c), d.c[c], { max: p.alive }); }).join('');
    return K.drawer({ title: T('death.title'), subtitle: T('death.sub', { pen: p.code, n: p.alive }), size: 'long', view: 'death', body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('rec.death', { n: k }), action: 'death-save', register: 'primary', waiting: !k }, status: !k ? T('sr.dead') : null }) });
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
      UI.choiceGroup(others.map(function (o) {
        return UI.choiceRow({ label: o.code, mono: true, meta: T('day.n', { d: o.age }), mode: 'single', selected: d.to === o.code, action: 'move-to', value: o.code });
      })) + '</section>';
    body += stepper('move', T('move.how'), d.n, { min: 1, max: p.alive, variant: 'well', hint: '' });
    var asks = moveAsks(p);
    asks.forEach(function (k) {
      body += K.radios({ layout: 'row', label: k === 'id' ? T('move.hadid.' + scheme()) : T('move.had', { tr: trl(k) }), action: 'had', key: k,
        selected: d.had[k] == null ? '' : d.had[k] ? 'yes' : 'no', options: [{ value: 'no', label: T('no') }, { value: 'yes', label: T('yes') }] });
    });
    var ready = d.to && d.n > 0 && asks.every(function (k) { return d.had[k] != null; });
    return K.page({ title: T('move.title'), description: T('move.sub', { pen: p.code, n: p.alive }), view: 'move', body: body,
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('move.save', { n: pigs(d.n) }), action: 'move-save', register: 'primary', waiting: !ready }, status: !ready ? T(d.to ? 'sr.had' : 'move.pick') : null }) });
  }
  /* ---- set count: the record becomes what is there now ---- */
  function countSheet() {
    var p = pen(), d = V.count;
    return K.drawer({ title: T('count.title'), subtitle: T('count.sub', { pen: p.code, n: p.alive }), size: 'long', view: 'count',
      body: stepper('count', T('count.label'), d.n, { variant: 'count', min: 0, hint: '' }),
      footer: K.footer({ back: { action: 'back', label: T('back') }, primary: { label: T('rec.count', { n: d.n }), action: 'count-save', register: 'primary', waiting: d.n === p.alive }, status: d.n === p.alive ? T('sr.count') : null }) });
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
    return Array.prototype.filter.call(root.children, function (el) { return el.matches('.sheet, .sheet[data-presentation="page"], .dialog-backdrop'); });
  }
  var keyOf = function (el) { return el.getAttribute('data-view') || (el.matches('.dialog-backdrop') ? 'dialog' : ''); };
  function render() {
    if (leaving) return;
    document.documentElement.lang = L.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = T('task');
    if (window.AtlasBare) AtlasBare.watch(atlasScreen);
    var html = K.statusbar() + listScreen(!!(V.pen || V.end));
    if (V.pen && !V.over && !V.end) html += penSheet(false);   // a second sheet replaces the pen sheet (its state stays in V.pen and comes back on Back)
    var o = V.pen && V.over;
    if (o === 'more') html += moreSheet();
    if (o === 'adjust') html += adjustSheet();
    if (o === 'death') html += deathSheet();
    if (o === 'count') html += countSheet();
    if (o === 'weight') html += weightSheet();
    if (o === 'move') html += movePage();
    if (o === 'counts') html += countsSheet();
    if (o === 'tagged') html += taggedPage();
    if (o === 'tagged' && V.sub === 'give') html += givePage();
    if (o === 'log') html += logPage();
    if (V.end) html += endPage();
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    var next = overlays(tmp).map(keyOf);
    var gone = overlays(phone).filter(function (el) { return next.indexOf(keyOf(el)) < 0; });
    if (gone.length && !reduced()) {
      leaving = true; phone.style.pointerEvents = 'none';   // no tap lands on a screen that is about to be redrawn
      gone.forEach(function (el) { el.setAttribute('data-leave', ''); var s = el.previousElementSibling; if (s && s.matches('.scrim')) s.setAttribute('data-leave', ''); });
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
    phone.querySelectorAll('.tk-scroll, .sheet-body, .sheet-body').forEach(function (el) {
      var host = el.closest('[data-view]'); keep[(host ? host.getAttribute('data-view') : 'list') + el.className] = el.scrollTop;
    });
    var chipsX = phone.querySelector('.st-filter-chips-track'), cx = chipsX ? chipsX.scrollLeft : 0;
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
      var s = el.previousElementSibling; if (s && s.matches('.scrim')) s.setAttribute('data-enter', '');
    });
    shownKeys = next;
    phone.querySelectorAll('.tk-scroll, .sheet-body, .sheet-body').forEach(function (el) {
      var host = el.closest('[data-view]'), k = (host ? host.getAttribute('data-view') : 'list') + el.className;
      if (keep[k] != null) el.scrollTop = keep[k];
    });
    var ct = phone.querySelector('.st-filter-chips-track'); if (ct) ct.scrollLeft = cx;
    if (V.pageTop) { phone.querySelectorAll('.sheet-body, .sheet-body').forEach(function (x) { x.scrollTop = 0; }); V.pageTop = false; }
    if (V.toTop) { var sc = phone.querySelector('.tk-scroll'); if (sc) sc.scrollTop = 0; V.toTop = false; }
    if (focusSel) {
      var f = phone.querySelector(focusSel);
      if (f && f.focus) { f.focus({ preventScroll: true }); if (caret != null && f.setSelectionRange) try { f.setSelectionRange(caret, caret); } catch (e) { /* not a text input */ } }
    }
    if (V.sub === 'give' && V.give && V.give.field) { var m = phone.querySelector('[data-action="give-field"][data-value="' + V.give.field + '"]'); if (m && m.scrollIntoView) m.scrollIntoView({ block: 'nearest' }); }
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
  function closePen() { V.sub = null; V.pen = null; V.flash = null; V.open = {}; V.keepOpen = {}; V.draft = {}; V.tab = 'proc'; clearTimeout(openTimer); }
  function closeTop() {
    if (V.end) V.end = null;
    else if (V.sub) V.sub = null;
    else if (V.over) V.over = null;
    else if (V.pen) closePen();
  }
  function saved(key, args) { V.flash = { pen: V.pen, key: key, args: args, undo: true }; }
  function act(a, v, el) {
    var p = V.pen ? pen() : null;
    switch (a) {
      case 'list-lens': V.lens = v; break;
      case 'chip': if (v === V.chip) return; V.chip = v; break;
      case 'pen': V.pen = v; V.flash = null; V.open = {}; V.draft = {}; V.tab = 'proc'; break;
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
        recs.forEach(function (r) { V.keepOpen[r.tr] = true; });
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
        if (V.over === 'counts') V.counts[v] = Math.max(0, V.counts[v] + d);
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
      case 'weight-save': P.setWeight(p.code, UI.numpadCommit(V.weight.kg, { decimals: 1 })); V.over = null; saved('log.weight', { w: UI.numpadCommit(V.weight.kg, { decimals: 1 }) }); break;
      case 'log-open': V.over = 'log'; V.pageTop = true; break;
      case 'tool-death': V.over = 'death'; V.death = { c: { crushed: 0, scours: 0, starve: 0, other: 0 } }; break;
      case 'counts-open': { var sx = p.sex || { boar: 0, gilt: 0 }; if (P.hasId() && scheme() !== 'breeders' && P.idCount(p) >= p.alive) sx = { boar: p.ids.filter(function (x) { return x.sex === 'boar'; }).length, gilt: p.ids.filter(function (x) { return x.sex === 'gilt'; }).length }; V.over = 'counts'; V.counts = { boar: sx.boar, gilt: sx.gilt }; break; }
      case 'counts-save': P.setLitter(p.code, { boar: V.counts.boar, gilt: V.counts.gilt }); V.over = null; saved('flash.counts', { b: V.counts.boar, g: V.counts.gilt }); break;
      case 'tagged-open': V.over = 'tagged'; V.pageTop = true; break;
      case 'breeder': P.toggleBreeder(p.code, v); break;
      case 'pick-done': { var nb = P.donePicking(p.code); V.flash = { pen: p.code, key: 'flash.pick', args: { n: T('breeders.n', { n: nb }) } }; V.over = null; break; }
      case 'id-open': V.over = 'tagged'; V.sub = null; V.pageTop = true; break;
      case 'give-new': V.sub = 'give'; V.give = giveBlank(p); V.pageTop = true; break;
      case 'give-field': V.give.field = V.give.field === v ? '' : v; break;
      case 'pad': padKey(v, el.getAttribute('data-key')); break;
      case 'give-scan': {   // a scan reads the tag in the ear (the demo reads the next one on the strip): it replaces what is there
        var sc = UI.numpadScan(V.give.id, V.give.id.suggestion, { maxLength: 6 }); V.give.id = { value: sc.value, suggested: false, suggestion: sc.suggestion }; V.give.field = '';
        break;
      }
      case 'give-sex': V.give.sex = v; if (v === 'boar' && scheme() !== 'breeders') V.give.keep = false; break;
      case 'give-keep': V.give.keep = !!el.checked; break;
      case 'give-save': {
        var g = V.give, no = giveNo(p), pig = { tag: notch() ? '' : no, notch: notch() ? no : '', sex: g.sex, kg: UI.numpadCommit(g.kg, { decimals: 1 }), keep: g.edit ? (p.ids.filter(function (z) { return z.no === g.edit; })[0] || {}).keep : false };
        if (g.edit) { P.fixPig(p.code, g.edit, pig); V.sub = null; V.give = null; break; }   // a fix goes back to the list
        else { var x = P.givePig(p.code, pig); V.give = giveBlank(p, x); }
        V.pageTop = true;   // the next piglet's tag readout is back at the top
        break;
      }
      case 'give-undo': P.removePig(p.code, V.give.last.no); V.give = giveBlank(p); V.pageTop = true; break;
      case 'give-fix': {
        var y = p.ids.filter(function (z) { return z.no === v; })[0]; if (!y) break;
        var idv = notch() ? String(y.notch).split('-')[1] : y.tag;
        V.give = Object.assign(giveBlank(p), { id: { value: idv, suggested: false, suggestion: idv }, sex: y.sex, kg: y.kg == null ? '' : String(y.kg), keep: y.keep, edit: y.no }); V.sub = 'give';
        V.pageTop = true;
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
  /* The Numpad's keys (and a hardware keyboard's digits) type into the open readout */
  function padKey(field, k) {
    var g = V.give;
    if (field === 'w') { V.weight.kg = UI.numpadInput({ value: V.weight.kg }, k, { decimals: 1, intLength: 3 }).value; return; }
    if (field === 'id') { var r = UI.numpadInput(g.id, k, PADS.id()); g.id = { value: r.value, suggested: r.suggested, suggestion: r.suggestion }; return; }
    if (field === 'kg') g.kg = UI.numpadInput({ value: g.kg }, k, PADS.kg()).value;
    if (field === 'litter') g.litterKg = UI.numpadInput({ value: g.litterKg }, k, PADS.litter()).value;
  }
  document.addEventListener('keydown', function (e) {
    var k = UI.numpadKey(e), f = V.sub === 'give' && V.give ? V.give.field : V.over === 'weight' ? 'w' : '';
    if (!k || k === 'enter' || !f) return;
    e.preventDefault(); padKey(f, k); render();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && (V.pen || V.end)) { closeTop(); render(); }
  });
  var holds = UI.holdBind(phone, { onCommit: function (b) {
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
    var c = q.get('chip'); if (c === 'done') V.lens = 'done'; else if(c) V.chip = c;
    var pn = q.get('pen'); if (pn && P.s.pens[pn]) { V.pen = pn; V.tab = q.get('tab') === 'pig' ? 'pig' : 'proc'; }
  })();
  /* the atlas (?screen=): a bare screen is reached by the taps a worker would make, and the screen the state is in is announced back */
  var ATLAS_STEPS = {
    'adjust-count': [['pen', 'A03'], ['item', 'iron'], ['adjust', 'iron']], 'tagged-list': [['pen', 'A02'], ['tagged-open']], 'give-ids': [['pen', 'A02'], ['tagged-open'], ['give-new']],
    'counts': [['pen', 'A03'], ['counts-open']], 'weight': [['pen', 'A03'], ['weight-open']], 'more-actions': [['pen', 'A03'], ['more']], 'record-death': [['pen', 'A03'], ['tool-death']],
    'move-piglets': [['pen', 'A03'], ['more'], ['tool', 'move']], 'set-count': [['pen', 'A03'], ['more'], ['tool', 'count']], 'pen-log': [['pen', 'A01'], ['log-open']], 'end-task': [['end']]
  };
  function atlasScreen(screens) {
    var b = 'piglet-processing.';
    if (V.end) return b + 'end-task';
    if (!V.pen) return P.s.ended ? b + 'list-ended' : V.lens === 'done' ? b + 'chip-done' : V.chip ? b + 'job-chip' : scheme() === 'none' ? b + 'list-no-id' : b + 'pen-list';
    if (V.sub === 'give') return b + 'give-ids';
    var by = { tagged: 'tagged-list', log: 'pen-log', adjust: 'adjust-count', counts: 'counts', weight: 'weight', more: 'more-actions', death: 'record-death', move: 'move-piglets', count: 'set-count' };
    if (V.over) return by[V.over] ? b + by[V.over] : null;
    var hit = (screens || []).filter(function (c) {
      var u = new URL(c.url, location.href).searchParams;
      return c.id.indexOf(b + 'sheet-') === 0 && u.get('pen') === V.pen && (u.get('scheme') || 'tag') === scheme();
    })[0];
    return hit ? hit.id : null;
  }
  if (window.AtlasBare && AtlasBare.bare) {
    var sid = AtlasBare.id.replace('piglet-processing.', '');
    if (sid === 'list-ended') P.end();
    if (sid === 'phone-clash') { P.submit('A05', [{ k: 'iron', n: P.need(P.s.pens.A05, 'iron'), why: '' }]); P.otherPhone(); }
    (ATLAS_STEPS[sid] || []).forEach(function (s) { act(s[0], s[1]); });
  }
  render();
})();
