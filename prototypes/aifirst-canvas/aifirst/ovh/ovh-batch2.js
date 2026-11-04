  // ----- every batch from the farm's own data: list, batch, task, dates -----
  ovCol(c) { return ({ '#A7CDAE': OVH.K.green, '#A9C2E2': OVH.K.blue, '#EBC27E': OVH.K.amberBar, '#D9D6CC': OVH.K.grey })[c] || OVH.K.grey; }
  ovDay(w) { const m = /Day (\d+) of (\d+)/.exec(w || ''); return m ? [+m[1], +m[2]] : [1, 1]; }
  ovParts(id, t) {
    const n = this.bvCounts(id, t.id);
    return t.states.map((x) => { const col = this.ovCol(x.col); return { id: x.id, label: x.label, n: n[x.id] || 0, col: col, skip: col === OVH.K.grey, warn: col === OVH.K.amberBar }; });
  }
  ovBatches() { const B = this.batchData(); return Object.keys(B).map((k) => B[k]).sort((a, b) => (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0)); }
  ovListHtml() {
    const H = OVH, K = H.K;
    return H.head('Batches', '', '') + '<div style="margin-top: 16px;">' + H.card(this.ovBatches().map((b, i) => { const t = (b.tasks || [])[0] || {}, d = this.ovDay(t.when); return '<div' + H.A('open:' + b.id) + ' style="' + H.st({ display: 'flex', alignItems: 'center', gap: '14px', height: '64px', padding: '0 16px', margin: '0 -16px', borderTop: i ? '1px solid ' + K.line : '0', cursor: 'pointer' }) + '">' + H.radial({ size: 30, sw: 4, parts: [[d[0], '', K.blue], [Math.max(0, d[1] - d[0]), '', K.grey, true]], total: d[1] }) + '<span style="' + H.st({ flex: 1, display: 'flex', flexDirection: 'column' }) + '">' + H.t(b.name, { fontWeight: 600, fontSize: '15px' }) + H.mu((t.title || '') + ' · day ' + d[0] + ' of ' + d[1]) + '</span>' + H.chev + '</div>'; }).join(''), { pad: '0 16px' }) + '</div>';
  }
  ovBatchHtml(id) {
    const H = OVH, K = H.K, b = this.batchData()[id];
    if (!b) return OVP.batch(this.ovS());
    this.ovTips = this.ovTips || {};
    const tiles = (b.tasks || []).map((t) => {
      const P = this.ovParts(id, t), tot = P.reduce((a, x) => a + x.n, 0) || 1, goal = P.find((x) => x.id === t.goal) || P[0], d = this.ovDay(t.when), attn = P.filter((x) => x.warn && x.n).map((x) => x.n + ' ' + x.label.toLowerCase()).join(' · ');
      this.ovTips['ring-' + id + '-' + t.id] = () => H.tip(t.title + ' · ' + tot + ' ' + (b.kind === 'growers' ? 'pens' : 'sows'), P.map((x) => [x.col, x.label, String(x.n), x.warn]), 'Click to open the task');
      return H.card('<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '14px' }) + '">' + H.radial({ size: 52, sw: 7, parts: P.map((x) => [x.n, x.label, x.col, x.skip]), total: tot, center: H.t(String(goal ? goal.n : 0), { fontSize: '14px', fontWeight: 600 }), tip: 'ring-' + id + '-' + t.id }) + '<span style="' + H.st({ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }) + '">' + H.t(t.title, { fontSize: '15px', fontWeight: 600 }) + '<span style="' + H.st({ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }) + '">' + H.mu('day ' + d[0] + ' of ' + d[1]) + (attn ? H.badge('amber', attn) : '') + '</span></span>' + H.chev + '</div>', { pad: '14px 16px', a: 'task:' + t.id });
    }).join('<div style="height: 8px;"></div>');
    const next = (b.sched || []).filter((x) => x.st === 'next').slice(0, 3);
    return H.head(b.name, (b.sub || '').replace(/^Line \d+ · /, ''), 'back') + H.sec('Running now', '', 20) + tiles +
      (next.length ? H.sec('Upcoming') + H.card(next.map((x, i) => H.row('<span style="display: flex; align-items: center;">' + H.t(x.d, { fontSize: '13px', color: K.muted, width: '84px', display: 'inline-block' }) + H.t(x.t) + '</span>', H.mu(x.meta), !i)).join(''), { pad: '0 16px' }) : '') +
      '<div style="' + H.st({ display: 'flex', marginTop: '20px' }) + '">' + H.wbtn(H.I.cal, 'All dates', 'dates') + '</div>';
  }
  ovTaskHtml(id, tid, O) {
    const H = OVH, b = this.batchData()[id], t = b && this.bvTask(id, tid);
    if (!t) return OVP.task(O);
    const P = this.ovParts(id, t), tot = P.reduce((a, x) => a + x.n, 0) || 1, goal = P.find((x) => x.id === t.goal) || P[0], d = this.ovDay(t.when), unit = b.kind === 'growers' ? 'pens' : 'sows';
    this.ovTips['ring-task'] = () => H.tip(t.title, P.map((x) => [x.col, x.label, String(x.n), x.id === O.only]), 'Click a part → only those pens');
    return H.head(t.title, b.name + ' · day ' + d[0] + ' of ' + d[1], 'back') +
      '<div style="' + H.st({ display: 'flex', gap: '8px', marginTop: '16px' }) + '">' + H.field(O.parity || 'All parities', 'filter', { on: O.pop === 'filter' }) + H.field('All rooms', 'noop') + '</div>' +
      H.sec('Whole-task progress', H.meta(tot + ' ' + unit)) +
      H.card('<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '20px' }) + '">' + H.radial({ size: 132, sw: 16, parts: P.map((x) => [x.n, x.label, x.col, x.skip]), total: tot, half: true, center: H.centre(String(goal ? goal.n : 0), 'of ' + tot + ' ' + (t.goalWord || '')), tip: 'ring-task' }) + H.legend(P, { a: 'only', only: O.only }) + '</div>') +
      (id === '32' && tid === 'farrow' ? H.sec('Performance so far', H.meta('31 finished litters')) + '<div style="' + H.st({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }) + '">' + H.kpi('Born alive / litter', '11.8', '', H.badge('amber', '0.2 under target'), 'Target 12') + H.kpi('Stillborn rate', '6.1', '%', '', '', 'kpi-still') + '</div>' : '');
  }
  ovDatesHtml(id) {
    const H = OVH, K = H.K, b = this.batchData()[id];
    if (!b) return OVP.dates(this.ovS());
    const S = b.sched || [], nowIdx = Math.max(0, S.findIndex((x) => x.st === 'now'));
    const rows = S.map((x) => { const st = x.st === 'late' ? 'done' : x.st, open = st === 'now' ? 'task:' + (((b.tasks || []).find((t) => t.title === x.t) || {}).id || '') : st === 'done' && /Farrowing/.test(x.t) ? 'donetask' : ''; return '<div' + (open && open !== 'task:' ? H.A(open) : '') + ' style="' + H.st({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', height: '40px', paddingRight: '10px', cursor: open ? 'pointer' : 'default' }) + '"><span style="' + H.st({ display: 'flex', alignItems: 'center', gap: '12px' }) + '"><span style="' + H.st({ width: '12px', height: '12px', borderRadius: '999px', boxSizing: 'border-box', background: st === 'done' ? K.grey : st === 'now' ? K.blue : '#FFFFFF', border: st === 'next' ? '2px solid #858D86' : '0', position: 'relative', zIndex: 1 }) + '"></span>' + H.t(st === 'now' ? 'Now' : x.d.replace(/^\w+ /, ''), { fontSize: '13px', color: st === 'now' ? K.blue : K.muted, fontWeight: st === 'now' ? 600 : 400, width: '48px', display: 'inline-block' }) + H.t(x.t, { color: st === 'done' ? K.muted : K.ink, fontWeight: st === 'now' ? 600 : 400 }) + '</span><span style="' + H.st({ display: 'flex', alignItems: 'center', gap: '4px' }) + '">' + (x.st === 'late' || st === 'next' ? H.t(x.meta, { fontSize: '13px', color: x.st === 'late' ? K.amber : K.muted, fontWeight: x.st === 'late' ? 500 : 400 }) : '') + (open && open !== 'task:' ? H.chev : '') + '</span></div>'; }).join('');
    return H.head('All dates', b.name, 'back') + H.card('<div data-scroll="dates" data-scroll-to="' + Math.max(0, nowIdx * 40 - 160) + '" style="' + H.st({ position: 'relative', height: Math.min(400, S.length * 40 + 8) + 'px', overflowY: 'auto' }) + '"><div style="' + H.st({ position: 'absolute', left: '5px', top: '20px', height: (S.length * 40 - 40) + 'px', width: '2px', background: K.line }) + '"></div>' + rows + '</div>', { mt: 16, pad: '8px 16px' });
  }
  // her tasks with her status in each, from the batch she is in; no batch → non-productive days
  ovPigTasks(roomId, code) {
    const cell = ((this.IP && this.IP.cell[roomId]) || {})[code] || {}, id = cell.batch != null ? String(cell.batch) : '', b = id ? this.batchData()[id] : null;
    if (!b) return { npd: 8 + (this.hs(roomId + code) % 30) };
    return { batch: b, tasks: (b.tasks || []).map((t) => { const s = this.bvState(id, roomId, code, t.id), d = this.bvStateDef(id, s, t.id) || {}; const col = this.ovCol(d.col); return [t.title, col === OVH.K.green ? 'green' : col === OVH.K.blue ? 'blue' : col === OVH.K.amberBar ? 'amber' : 'grey', d.label || '', 'task:' + t.id, (t.why || {})[s] || '']; }) };
  }
