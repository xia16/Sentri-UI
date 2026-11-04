// ===== OVP: the pages of the overhauled UI (demo data from the canvas boards) =====
const OVP = (function () {
  const H = OVH, K = H.K, st = H.st, t = H.t, mu = H.mu, sm = H.sm, icon = H.icon, I = H.I, A = H.A, TIP = H.TIP, esc = H.esc;
  const G = K.green, B = K.blue, AM = K.amberBar, N = K.grey;
  // ----- demo data (the boards) -----
  const BATCHES = [
    { id: '34', name: 'Batch 34', stage: 'Breeding', d: 2, of: 5 }, { id: '33', name: 'Batch 33', stage: 'Moving in', d: 1, of: 2 },
    { id: '32', name: 'Batch 32', stage: 'Farrowing', d: 3, of: 7 }, { id: '31', name: 'Batch 31', stage: 'Nursery', d: 24, of: 42 },
    { id: '30', name: 'Batch 30', stage: 'Nursery', d: 31, of: 42 }, { id: '35G', name: 'Batch 35G', stage: 'Quarantine', d: 18, of: 42 },
  ];
  const FAR = [{ id: 'done', label: 'Done', n: 31, col: G }, { id: 'active', label: 'Active', n: 4, col: B }, { id: 'await', label: 'Awaiting', n: 15, col: N, skip: true }];
  const PFC = [{ id: 'checked', label: 'Checked', n: 25, col: G }, { id: 'recheck', label: 'Recheck', n: 3, col: AM, warn: true }, { id: 'todo', label: 'To do', n: 3, col: N, skip: true }];
  const parts = (L) => L.map((x) => [x.n, x.label, x.col, x.skip]);
  const DATES = [
    ['done', '13 Jul', 'Heat check', '', 1], ['done', '15 Jul', 'Breeding', '', 1], ['done', '7 Sep', 'Pregnancy check', '', 1], ['done', '28 Oct', 'Into Farrowing Room 2', 'late 1 day', 1],
    ['now', 'Now', 'Farrowing', '', 'task'], ['now', 'Now', 'Post-farrowing check', '', 'post'],
    ['next', '6 Nov', 'Piglet processing', 'in 2 days'], ['next', '27 Nov', 'Weaning check', 'in 23 days'], ['next', '30 Nov', 'Wean to Nursery 1', 'in 26 days'], ['next', '7 Dec', 'Heat check', 'in 5 weeks'], ['next', '11 Jan', 'Out of nursery', 'in 10 weeks'],
  ];

  // ----- the bottom bar: Select · Batches · Equipment · Actions -----
  function bar(O) {
    const b = (ic, l, a, on) => '<button type="button"' + A(a) + ' style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '44px', padding: '0 14px', borderRadius: '12px', border: 0, background: on ? K.press : 'transparent', boxShadow: on ? 'inset 0 0 0 1.5px ' + K.ink : 'none', fontSize: '14px', fontWeight: on ? 600 : 500, color: K.ink, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit' }) + '">' + icon(ic, 18) + esc(l) + '</button>';
    if (O.barCtl) return O.barCtl;
    return b(I.select, 'Select', 'select', O.selecting) + b(I.layers, 'Batches', 'batches', O.panel && O.panel !== 'pig' && O.panel !== 'pigperf' && O.panel !== 'piglog' && O.panel !== 'pen') + b(I.tool, 'Equipment', 'equip', !!O.pop && O.pop.indexOf('eq') === 0) + '<span style="flex: 1;"></span><button type="button"' + A('actions') + ' style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '44px', padding: '0 18px', borderRadius: '12px', border: 0, background: K.ink, color: '#FFFFFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }) + '">Actions</button>';
  }

  // ----- the batch panel -----
  function list(O) {
    return H.head('Batches', '', '') + '<div style="margin-top: 16px;">' + H.card(BATCHES.map((b, i) => '<div' + A('open:' + b.id) + ' style="' + st({ display: 'flex', alignItems: 'center', gap: '14px', height: '64px', padding: '0 16px', margin: '0 -16px', borderTop: i ? '1px solid ' + K.line : '0', cursor: 'pointer' }) + '">' + H.radial({ size: 30, sw: 4, parts: [[b.d, '', B], [b.of - b.d, '', N, true]], total: b.of }) + '<span style="' + st({ flex: 1, display: 'flex', flexDirection: 'column' }) + '">' + t(b.name, { fontWeight: 600, fontSize: '15px' }) + mu(b.stage + ' · day ' + b.d + ' of ' + b.of) + '</span>' + H.chev + '</div>').join(''), { pad: '0 16px' }) + '</div>';
  }
  function tile(name, metaTxt, L, total, attn, a, tipKey) {
    return H.card('<div style="' + st({ display: 'flex', alignItems: 'center', gap: '14px' }) + '">' + H.radial({ size: 52, sw: 7, parts: parts(L), total: total, center: t(String(L[0].n), { fontSize: '14px', fontWeight: 600 }), tip: tipKey }) +
      '<span style="' + st({ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }) + '">' + t(name, { fontSize: '15px', fontWeight: 600 }) + '<span style="' + st({ display: 'flex', alignItems: 'center', gap: '8px' }) + '">' + mu(metaTxt) + (attn ? H.badge('amber', attn) : '') + '</span></span>' + H.chev + '</div>', { pad: '14px 16px', a: a });
  }
  function batch(O) {
    const b = BATCHES.find((x) => x.id === O.batchId) || BATCHES[2];
    if (b.id !== '32') return H.head(b.name, b.stage + ' · day ' + b.d + ' of ' + b.of, 'back') + H.sec('Running now', '', 20) + H.card(mu('This batch is shown on the farm. Its pages in this demo are Batch 32\'s.'));
    return H.head('Batch 32', 'Farrowing Room 2 · 50 sows', 'back') + H.sec('Running now', '', 20) + '<div style="' + st({ display: 'flex', flexDirection: 'column', gap: '8px' }) + '">' +
      tile('Farrowing', 'day 3 of 7', FAR, 50, '', 'task:farrow', 'ring-far') + tile('Post-farrowing check', 'day 3', PFC, 31, '3 recheck', 'task:post', 'ring-pfc') + '</div>' +
      H.sec('Upcoming') + H.card([['Fri 6 Nov', 'Piglet processing', 'in 2 days'], ['Fri 27 Nov', 'Weaning check', 'in 23 days'], ['Mon 30 Nov', 'Wean to Nursery 1', 'in 26 days']].map((r, i) => H.row('<span style="display: flex; align-items: center;">' + t(r[0], { fontSize: '13px', color: K.muted, width: '84px', display: 'inline-block' }) + t(r[1]) + '</span>', mu(r[2]), !i)).join(''), { pad: '0 16px' }) +
      '<div style="' + st({ display: 'flex', marginTop: '20px' }) + '">' + H.wbtn(I.cal, 'All dates', 'dates') + '</div>';
  }
  function task(O) {
    const isPost = O.taskId === 'post', L = isPost ? PFC : FAR, total = isPost ? 31 : 50;
    const done = L[0].n;
    return H.head(isPost ? 'Post-farrowing check' : 'Farrowing', 'Batch 32 · day 3' + (isPost ? '' : ' of 7'), 'back') +
      '<div style="' + st({ display: 'flex', gap: '8px', marginTop: '16px' }) + '">' + H.field(O.parity || 'All parities', 'filter', { on: O.pop === 'filter' }) + H.field('Farrowing Room 2', 'noop') + '</div>' +
      H.sec('Whole-task progress', H.meta(total + ' sows')) +
      H.card('<div style="' + st({ display: 'flex', alignItems: 'center', gap: '20px' }) + '">' + H.radial({ size: 132, sw: 16, parts: parts(L), total: total, half: true, center: H.centre(String(done), 'of ' + total + ' ' + (isPost ? 'checked' : 'done')), tip: isPost ? 'ring-pfc' : 'ring-far' }) + H.legend(L, { a: 'only', only: O.only }) + '</div>') +
      (isPost ? '' : H.sec('Performance so far', H.meta('31 finished litters')) + '<div style="' + st({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }) + '">' + H.kpi('Born alive / litter', '11.8', '', H.badge('amber', '0.2 under target'), 'Target 12') + H.kpi('Stillborn rate', '6.1', '%', '', '', 'kpi-still') + '</div>');
  }
  function dates(O) {
    const rows = DATES.map((d) => '<div' + (d[4] ? A(d[4] === 1 ? 'donetask' : 'task:' + (d[4] === 'post' ? 'post' : 'farrow')) : '') + ' style="' + st({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', height: '40px', paddingRight: '10px', cursor: d[4] ? 'pointer' : 'default' }) + '"><span style="' + st({ display: 'flex', alignItems: 'center', gap: '12px' }) + '"><span style="' + st({ width: '12px', height: '12px', borderRadius: '999px', boxSizing: 'border-box', background: d[0] === 'done' ? N : d[0] === 'now' ? B : '#FFFFFF', border: d[0] === 'next' ? '2px solid #858D86' : '0', position: 'relative', zIndex: 1 }) + '"></span>' + t(d[1], { fontSize: '13px', color: d[0] === 'now' ? B : K.muted, fontWeight: d[0] === 'now' ? 600 : 400, width: '48px', display: 'inline-block' }) + t(d[2], { color: d[0] === 'done' ? K.muted : K.ink, fontWeight: d[0] === 'now' ? 600 : 400 }) + '</span><span style="' + st({ display: 'flex', alignItems: 'center', gap: '4px' }) + '">' + (d[3] ? t(d[3], { fontSize: '13px', color: d[3].indexOf('late') === 0 ? K.amber : K.muted, fontWeight: d[3].indexOf('late') === 0 ? 500 : 400 }) : '') + (d[4] ? H.chev : '') + '</span></div>').join('');
    return H.head('All dates', 'Batch 32', 'back') + H.card('<div data-scroll="dates" data-scroll-to="160" style="' + st({ position: 'relative', height: '400px', overflowY: 'auto' }) + '"><div style="' + st({ position: 'absolute', left: '5px', top: '20px', height: (DATES.length * 40 - 40) + 'px', width: '2px', background: K.line }) + '"></div>' + rows + '</div>', { mt: 16, pad: '8px 16px' });
  }

  // ----- tooltips by key -----
  const TIPS = {
    'ring-far': () => H.tip('Farrowing · 50 sows', [[G, 'Done', '31'], [B, 'Active', '4'], [N, 'Awaiting', '15']], 'Click to open the task'),
    'ring-pfc': () => H.tip('Post-farrowing check · 31 sows', [[G, 'Checked', '25'], [AM, 'Recheck', '3', true], [N, 'To do', '3']], 'Click to open the task'),
    'kpi-still': () => H.tip('Stillborn rate · 31 litters', [['', 'Stillborn', '6.1 %', true, 'none'], ['', 'Mummified', '2.0 %', false, 'none']]),
  };

  // ----- popovers -----
  function filterPop(O) {
    const opts = ['All parities', 'Parity 1', 'Parity 2–4', 'Parity 5+'], cur = O.parity || 'All parities';
    return opts.map((l) => '<div' + A('parity:' + l) + ' style="' + st({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '44px', padding: '0 14px', fontSize: '14px', color: K.ink, fontWeight: l === cur ? 600 : 400, cursor: 'pointer' }) + '">' + esc(l) + (l === cur ? icon(I.check, 16, { strokeWidth: 2 }) : '') + '</div>').join('');
  }
  function actionsPop() {
    const it = (ic, l) => '<div' + A('noop') + ' style="' + st({ display: 'flex', alignItems: 'center', gap: '12px', height: '40px', padding: '0 14px', fontSize: '14px', color: K.ink, cursor: 'pointer' }) + '">' + icon(ic, 18) + esc(l) + '</div>';
    return '<div style="' + st({ padding: '6px 14px 4px', fontSize: '12px', color: K.muted }) + '">Actions</div>' + [[I.syringe, 'Treatment'], [I.shield, 'Vaccination'], [I.flask, 'Sampling'], [I.out, 'Culling'], [I.move, 'Move'], [I.feeder, 'Feed'], [I.note, 'Note']].map((x) => it(x[0], x[1])).join('') + '<div style="' + st({ height: '1px', background: K.line, margin: '6px 0' }) + '"></div>' + [[I.plan, 'Vaccination plan'], [I.report, 'Open batch report'], [I.stop, 'End batch']].map((x) => it(x[0], x[1])).join('');
  }

  return { BATCHES, list, batch, task, dates, bar, TIPS, filterPop, actionsPop, FAR, PFC };
})();
