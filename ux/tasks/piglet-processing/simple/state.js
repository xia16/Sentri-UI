/* Simple piglet processing: the whole state model. Plain JS, kept in sessionStorage.
   A pen is a litter. Each step on the farm's plan (a treatment, or the ID step) has a window in days of the pen's age.
   Treatments: for every pen we keep `got`, how many of the piglets alive now have had it; still to do = alive − got.
   Identity: the farm's scheme says who gets an ID — 'tag' or 'notch' every piglet, 'breeders' (tag only the piglets kept
   for breeding), or 'none' (fatteners raised as a batch: no ID step at all). */
(function (root) {
  'use strict';
  var KEY = 'pp-simple-v2';
  var ME = 'G. Hansen', OTHER = 'L. Madsen';
  var PLAN = [
    { key: 'iron', from: 2, to: 4 },
    { key: 'tail', from: 2, to: 4 },
    { key: 'castrate', from: 3, to: 7 },
    { key: 'cocci', from: 3, to: 5 }
  ];
  var ID = { key: 'id', from: 3, to: 7 };   // the farm's ID day: day 3, until day 7
  var SCHEMES = ['tag', 'notch', 'breeders', 'none'];
  var BATCH = { name: '40', firstDay: 1, lastDay: 6 };   // the batch farrowed over these pen ages
  var FIRST_TAG = 4201;

  function todayAt(h, m) { var d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); }
  function daysAgoAt(n, h, m) { return todayAt(h, m) - n * 864e5; }

  /* ---- sample farm: 12 pens in two rows of one batch, day 1–6 ---- */
  function seed(scheme) {
    scheme = SCHEMES.indexOf(scheme) >= 0 ? scheme : 'tag';
    var pens = {}, records = [], seq = 0, litter = 21;
    function pen(code, age, born, dead, extra) {
      var p = { code: code, row: code[0], age: age, born: born, alive: born - dead, dead: dead, missing: 0, sowDied: false, movedIn: 0, movedOut: 0,
        litter: litter++, ids: [], idIn: 0, idOut: 0, picked: null, tr: {} };
      PLAN.forEach(function (t) { p.tr[t.key] = { got: 0, why: '' }; });
      Object.assign(p, extra || {});
      pens[code] = p;
      return p;
    }
    function give(code, tr, n, ago, h, m, who, mark, why) {
      var p = pens[code];
      records.push({ id: 'r' + (++seq), pen: code, tr: tr, n: n, at: daysAgoAt(ago, h, m), day: p.age - ago, who: who || ME, mark: mark || '' });
      p.tr[tr].got += n;
      if (why) p.tr[tr].why = why;
    }
    var tagNo = FIRST_TAG;
    function ident(code, count, ago, h, m, breeders, who) {
      var p = pens[code];
      for (var i = 0; i < count; i++) {
        var keep = breeders.indexOf(i) >= 0;
        var no = scheme === 'notch' ? p.litter + '-' + (p.ids.length + 1) : String(tagNo++);
        var at = daysAgoAt(ago, h, m + i);
        p.ids.push({ no: no, sex: i % 2 ? 'boar' : 'gilt', kg: i === 0 ? 1.6 : null, keep: keep, at: at, who: who || ME });
        records.push({ id: 'r' + (++seq), pen: code, tr: 'id', n: 1, no: no, at: at, day: p.age - ago, who: who || ME, mark: '' });
      }
    }
    pen('A01', 6, 13, 1); pen('A02', 5, 12, 0); pen('A03', 4, 13, 1); pen('A04', 3, 11, 0); pen('A05', 3, 12, 0); pen('A06', 2, 14, 1);
    pen('B01', 6, 12, 1); pen('B02', 5, 12, 1, { sowDied: true }); pen('B03', 4, 13, 0); pen('B04', 2, 12, 1); pen('B05', 1, 11, 0); pen('B06', 1, 13, 0);
    // A01: everything given
    give('A01', 'iron', 12, 3, 8, 5); give('A01', 'tail', 12, 3, 8, 12); give('A01', 'castrate', 12, 2, 9, 30); give('A01', 'cocci', 12, 2, 9, 40);
    // A02: iron and tail by the other worker; castrate and cocci due
    give('A02', 'iron', 12, 2, 8, 30, OTHER); give('A02', 'tail', 12, 2, 8, 34, OTHER);
    // A03: iron 10 of 12, 2 weak ones left for later; tail done
    give('A03', 'iron', 10, 1, 8, 40, ME, '', 'weak'); give('A03', 'tail', 12, 1, 8, 46);
    // A05: tail this morning, iron still due
    give('A05', 'tail', 12, 0, 8, 20);
    // B01: iron missed (late); tail, castrate, cocci given
    give('B01', 'tail', 11, 3, 9, 2); give('B01', 'castrate', 11, 1, 9, 10); give('B01', 'cocci', 11, 1, 9, 14);
    // B02: sow died; iron and tail given
    give('B02', 'iron', 11, 2, 9, 20); give('B02', 'tail', 11, 2, 9, 24);
    // B03: iron this morning
    give('B03', 'iron', 13, 0, 7, 52);
    // identity: A01 all done; A02 four of twelve so far, one kept for breeding
    if (scheme === 'tag' || scheme === 'notch') { ident('A01', 12, 2, 10, 0, []); ident('A02', 4, 0, 7, 30, [1]); }
    if (scheme === 'breeders') {
      ident('A01', 1, 2, 10, 0, [0]); pens.A01.picked = { at: daysAgoAt(2, 10, 5), who: ME };
      ident('A02', 1, 0, 7, 30, [0]);
    }
    return { scheme: scheme, pens: pens, records: records, notes: [], ended: null, seq: seq, undo: null };
  }

  var S;
  function load() {
    try { S = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
    if (!S || !S.pens) S = seed('tag');
  }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private window: the demo still runs */ } }
  function reset() { S = seed(S ? S.scheme : 'tag'); save(); }
  /* A different farm: switching the scheme starts the demo again on that farm */
  function setScheme(s) { S = seed(s); save(); }

  /* ---- reading ---- */
  function hasId() { return S.scheme !== 'none'; }
  function steps() { return PLAN.map(function (t) { return t.key; }).concat(hasId() ? ['id'] : []); }
  function plan(k) { return k === 'id' ? (hasId() ? ID : null) : PLAN.filter(function (t) { return t.key === k; })[0] || null; }
  function idCount(p) { return Math.max(0, Math.min(p.alive, p.ids.length - p.idOut + p.idIn)); }
  function breeders(p) { return p.ids.filter(function (x) { return x.keep; }).length; }
  function need(p, k) {
    if (k === 'id') return S.scheme === 'breeders' ? 0 : Math.max(0, p.alive - idCount(p));
    return Math.max(0, p.alive - p.tr[k].got);
  }
  function recs(code, k) { return S.records.filter(function (r) { return r.pen === code && (!k || r.tr === k); }); }
  /* One step in one pen: 'done' | 'left' (given, some held back for later) | 'due' | 'late' | 'coming' */
  function status(p, k) {
    var t = plan(k);
    var window = p.age < t.from ? 'coming' : p.age > t.to ? 'late' : 'due';
    if (k === 'id') {
      if (S.scheme === 'breeders') return p.picked ? 'done' : window;
      return need(p, k) === 0 ? 'done' : window;
    }
    var n = need(p, k), given = recs(p.code, k).length > 0;
    if (n === 0) return given || p.tr[k].got > 0 ? 'done' : (p.age < t.from ? 'coming' : 'done');
    if (given) return 'left';
    return window;
  }
  function todo(p) { return steps().filter(function (k) { var s = status(p, k); return s === 'due' || s === 'late' || s === 'left'; }); }
  function coming(p) { return steps().filter(function (k) { return status(p, k) === 'coming'; }); }
  function pens() { return Object.keys(S.pens).sort().map(function (c) { return S.pens[c]; }); }
  function last() { var r = S.records.slice().sort(function (a, b) { return b.at - a.at; })[0]; return r || null; }
  /* Several pens at once: where a pen sits for one step — 'now' (inside the window, or left from before), 'early', 'late', 'done' */
  function bulkPlace(p, k) {
    var s = status(p, k);
    if (s === 'done') return 'done';
    if (s === 'left' || s === 'due') return 'now';
    return s === 'coming' ? 'early' : 'late';
  }
  function sameBatch(a, b) { return a.code !== b.code && b.age >= BATCH.firstDay && b.age <= BATCH.lastDay; }
  /* The next ID to suggest: the farm's next tag number, or this litter's next notch */
  function nextNo(code) {
    var p = S.pens[code];
    if (S.scheme === 'notch') {
      var used = p.ids.map(function (x) { return +String(x.no).split('-')[1] || 0; });
      return p.litter + '-' + ((used.length ? Math.max.apply(null, used) : 0) + 1);
    }
    var max = FIRST_TAG - 1;
    Object.keys(S.pens).forEach(function (c) { S.pens[c].ids.forEach(function (x) { if (+x.no > max) max = +x.no; }); });
    return String(max + 1);
  }
  function taken(no) {
    return Object.keys(S.pens).some(function (c) { return S.pens[c].ids.some(function (x) { return String(x.no) === String(no); }); });
  }

  /* ---- writing: every change keeps the state before it, so the last one can be undone ---- */
  function change(kind, fn) {
    if (S.ended) return null;
    var before = JSON.stringify(Object.assign({}, S, { undo: null }));
    var out = fn();
    S.undo = { kind: kind, before: before };
    save();
    return out;
  }
  function undo() {
    if (!S.undo) return false;
    S = JSON.parse(S.undo.before); S.undo = null; save();
    return true;
  }
  /* Take back treatment records by id (the in-place "Recorded · Undo"): each one's piglets come off, the reason before it
     comes back. Works for any of this phone's records, not only the last change. */
  function unrecord(ids) {
    if (S.ended) return;
    [].concat(ids).forEach(function (id) {
      var r = S.records.filter(function (x) { return x.id === id; })[0];
      if (!r || !S.pens[r.pen].tr[r.tr]) return;
      var t = S.pens[r.pen].tr[r.tr];
      t.got = Math.max(0, t.got - r.n); t.why = r.prevWhy || '';
      S.records.splice(S.records.indexOf(r), 1);
    });
    S.undo = null; save();
  }
  function record(code, k, n, opts) {
    opts = opts || {};
    var p = S.pens[code], r = { id: 'r' + (++S.seq), pen: code, tr: k, n: n, at: Date.now(), day: p.age, who: ME, mark: opts.mark || '', prevWhy: p.tr[k].why };
    S.records.push(r);
    p.tr[k].got += n;
    p.tr[k].why = need(p, k) > 0 ? (opts.why || p.tr[k].why || '') : '';
    return r;
  }
  function treat(code, k, n, why) {
    return change('treat', function () {
      var p = S.pens[code], st = status(p, k);
      return record(code, k, n, { why: why, mark: st === 'late' ? 'late' : '' });
    });
  }
  function bulk(k, picks) {   // picks: [{ pen, mark }]
    return change('bulk', function () {
      return picks.map(function (x) { return record(x.pen, k, need(S.pens[x.pen], k), { mark: x.mark || '' }); });
    });
  }
  /* One piglet's ID: { no, sex: 'boar'|'gilt', kg (or null), keep } */
  function identify(code, pig) {
    return change('id', function () {
      var p = S.pens[code], st = status(p, 'id');
      var x = { no: String(pig.no), sex: pig.sex, kg: pig.kg == null || pig.kg === '' ? null : +pig.kg, keep: !!pig.keep, at: Date.now(), who: ME };
      p.ids.push(x);
      S.records.push({ id: 'r' + (++S.seq), pen: code, tr: 'id', n: 1, no: x.no, at: x.at, day: p.age, who: ME, mark: st === 'late' ? 'late' : '' });
      return x;
    });
  }
  /* Breeders-only farm: the worker says this litter's breeders are all picked */
  function donePicking(code) {
    return change('pick', function () {
      var p = S.pens[code];
      p.picked = { at: Date.now(), who: ME };
      S.records.push({ id: 'r' + (++S.seq), pen: code, tr: 'pick', n: breeders(p), at: Date.now(), day: p.age, who: ME, mark: '' });
      return breeders(p);
    });
  }
  function clamp(p) { PLAN.forEach(function (t) { p.tr[t.key].got = Math.min(p.tr[t.key].got, p.alive); if (need(p, t.key) === 0) p.tr[t.key].why = ''; }); }
  /* Deaths: { crushed, scours, starve, other }; fromMissing: the dead were among the missing ones */
  function death(code, causes, fromMissing) {
    return change('death', function () {
      var p = S.pens[code], k = 0;
      Object.keys(causes).forEach(function (c) { k += causes[c] || 0; });
      var m = fromMissing ? Math.min(k, p.missing) : 0;
      p.missing -= m; p.alive = Math.max(0, p.alive - (k - m)); p.dead += k;
      clamp(p);
      S.records.push({ id: 'r' + (++S.seq), pen: code, tr: 'death', n: k, at: Date.now(), day: p.age, who: ME, mark: '' });
      return k;
    });
  }
  /* Move n piglets; had: { stepKey: true|false } for what was given (or the ID) in the pen they leave */
  function move(from, to, n, had) {
    return change('move', function () {
      var a = S.pens[from], b = S.pens[to];
      a.alive -= n; b.alive += n; a.movedOut += n; b.movedIn += n;
      PLAN.forEach(function (t) {
        var k = t.key;
        if (had[k]) { a.tr[k].got = Math.max(0, a.tr[k].got - n); b.tr[k].got += n; }
        if (!had[k] && need(b, k) > 0 && recs(to, k).length) b.tr[k].why = 'moved';
      });
      if (had.id) { a.idOut += n; b.idIn += n; }
      clamp(a); clamp(b);
      S.records.push({ id: 'r' + (++S.seq), pen: from, tr: 'move', n: n, to: to, at: Date.now(), day: a.age, who: ME, mark: '' });
      return n;
    });
  }
  /* Set count. why: 'unsure' (the difference is missing) | 'wrong' (just correct it). More than before: just correct. */
  function setCount(code, n, why) {
    return change('count', function () {
      var p = S.pens[code], diff = p.alive - n;
      // treatments that were all given stay all given when the count is corrected
      var full = PLAN.filter(function (t) { return need(p, t.key) === 0 && recs(code, t.key).length; }).map(function (t) { return t.key; });
      if (diff > 0 && why === 'unsure') p.missing += diff;
      p.alive = n;
      if (why === 'wrong' || diff < 0) full.forEach(function (k) { p.tr[k].got = n; });
      clamp(p);
      S.records.push({ id: 'r' + (++S.seq), pen: code, tr: 'count', n: n, at: Date.now(), day: p.age, who: ME, mark: '' });
      return n;
    });
  }
  function end() { if (S.ended) return; S.ended = { at: Date.now(), who: ME }; S.undo = null; save(); }

  /* Two phones: the other phone recorded iron on A05 at 08:40 while this one was offline. First record in wins. */
  function otherPhone() {
    var code = 'A05', k = 'iron', p = S.pens[code], at = todayAt(8, 40);
    if (S.ended) return { kind: 'ended' };
    var theirs = recs(code, k).filter(function (r) { return r.who === OTHER; })[0];
    if (theirs) return { kind: 'again' };
    var mine = recs(code, k).filter(function (r) { return r.who === ME; });
    if (mine.length) {
      var n = mine.reduce(function (s, r) { return s + r.n; }, 0) + need(p, k);
      S.records = S.records.filter(function (r) { return mine.indexOf(r) < 0; });
      S.records.push({ id: 'r' + (++S.seq), pen: code, tr: k, n: n, at: at, day: p.age, who: OTHER, mark: '' });
      p.tr[k].got = p.alive; p.tr[k].why = '';
      S.notes.push({ pen: code, tr: k, who: OTHER, at: at, mine: { at: mine[0].at, n: mine[0].n, who: ME }, seen: false });
      S.undo = null; save();
      return { kind: 'clash', note: S.notes[S.notes.length - 1] };
    }
    var all = need(p, k);
    S.records.push({ id: 'r' + (++S.seq), pen: code, tr: k, n: all, at: at, day: p.age, who: OTHER, mark: '' });
    p.tr[k].got = p.alive; p.tr[k].why = '';
    S.undo = null; save();
    return { kind: 'arrived', at: at };
  }
  function seeNote(i) { if (S.notes[i]) { S.notes[i].seen = true; save(); } }

  load();
  root.PPS = {
    PLAN: PLAN, ID: ID, SCHEMES: SCHEMES, BATCH: BATCH, ME: ME, OTHER: OTHER,
    get s() { return S; },
    hasId: hasId, steps: steps, plan: plan, need: need, idCount: idCount, breeders: breeders, recs: recs, status: status, todo: todo, coming: coming,
    pens: pens, last: last, bulkPlace: bulkPlace, sameBatch: sameBatch, nextNo: nextNo, taken: taken,
    treat: treat, bulk: bulk, unrecord: unrecord, identify: identify, donePicking: donePicking, death: death, move: move, setCount: setCount, end: end, undo: undo,
    otherPhone: otherPhone, seeNote: seeNote, reset: reset, setScheme: setScheme
  };
})(globalThis);
