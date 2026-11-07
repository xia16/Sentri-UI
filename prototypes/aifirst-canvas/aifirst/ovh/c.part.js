  // ===================== Proposal C, built: one bar across the top, one main pane under it, 3D/Plan and zoom at the bottom left =====================
  ovKindPath(kind) { return ({ farm: 'M4 21V9m5 12V9m5 12V9m5 12V9M2 12h20M2 17h20', zone: 'M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Zm6-2.5v13.5m6-11v13.5', section: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', sec: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', room: 'M4 10 12 4l8 6v10H4V10Z', pen: 'M5 5h14v14H5zM9.7 5v14M14.3 5v14' })[kind] || 'M4 10 12 4l8 6v10H4V10Z'; }
  // the place: ‹ up, its kind as an icon, its name
  ovWhere(P, o) {
    const H = OVH, K = H.K; o = o || {};
    const kind = P.cur && P.cur.kind === 'pen' ? 'pen' : (P.cur && P.cur.kind) || 'farm';
    return (P.levels.length > 1 ? this.ovSq(H.I.back, 'up', 'Up one level') : '') + '<span title="' + H.esc(({ farm: 'Farm', zone: 'Zone', section: 'Section', sec: 'Section', room: 'Room', pen: 'Pen' })[kind] || '') + '" style="' + H.st({ display: 'inline-flex', alignItems: 'center', gap: '9px', height: '40px', padding: '0 10px 0 6px', whiteSpace: 'nowrap', flexShrink: 0 }) + '"><span style="' + H.st({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '9px', background: K.press, color: K.ink, flexShrink: 0 }) + '">' + H.icon(this.ovKindPath(kind), 17) + '</span>' + H.t(P.name, { fontSize: '17px', lineHeight: '22px', fontWeight: 600, letterSpacing: '-.01em' }) + (o.fault ? H.dot(K.red, 8) : '') + '</span>';
  }
  ovBarSep() { return '<i style="' + OVH.st({ width: '1px', height: '24px', background: OVH.K.line, margin: '0 6px', flexShrink: 0 }) + '"></i>'; }
  ovTopCard(inner) { return this.ovCard({ left: '12px', right: '12px', top: '12px' }, inner, { display: 'flex', alignItems: 'center', gap: '2px', minHeight: '60px', padding: '0 8px', whiteSpace: 'nowrap' }); }
  // the Farm view's bar: the place, what you can open, Select at the right end
  ovTopBar(u, O) {
    const H = OVH, K = H.K, P = this.ovPlace(u);
    const kinds = P.pen ? this.ovPigs(P.r.id, P.pen) : this.ovPigsIn(P.rooms), fault = P.rooms.some((x) => this.ovFault(x.id, P.pen));
    this.ovKinds = kinds;
    const total = kinds.reduce((a, x) => a + x[0], 0), pnl = O.panel;
    const isBatch = ['sched', 'rx', 'list', 'batch', 'task', 'dates', 'done', 'compare'].indexOf(pnl) >= 0, isPigs = ['pigs', 'pig', 'pigperf', 'piglog', 'pen'].indexOf(pnl) >= 0, dd = P.r ? this.ovDevDot(u) : '';
    const nw = (this.W || 950) < 760, L = (x) => nw ? '' : x;
    const tabs = this.ovBtn(H.icon(H.I.cal, 18) + L('Schedule'), 'sched', isBatch) +
      (total && !P.pen ? this.ovBtn(H.icon(H.I.pig, 18) + L('Pigs') + '<span style="' + H.st({ color: isPigs ? K.ink : K.muted, fontWeight: 600 }) + '">' + total.toLocaleString('en-GB') + '</span>', 'pigspanel', isPigs) : '') +
      (P.r ? this.ovBtn(H.icon(H.I.tool, 18) + L('Devices') + (dd ? H.dot(dd, 8) : ''), 'devices', pnl === 'devices') : '');
    return this.ovTopCard(this.ovWhere(P, { fault: fault }) + this.ovBarSep() + tabs + '<span style="flex: 1;"></span>' + this.ovBtn(H.icon(H.I.select, 18) + L('Select'), 'select', !!O.selecting, { fontWeight: 600, padding: nw ? '0 10px' : '0 12px' }));
  }
  // bottom left: 3D or Plan, zoom, fit, and ··· for the rest of the view
  ovViewCtl(O, u, ed) {
    const H = OVH, K = H.K, open = O.pop === 'view';
    const seg = '<span style="' + H.st({ display: 'inline-flex', gap: '2px', padding: '3px', borderRadius: '11px', background: K.press }) + '">' + [['3D', 'toAngle', !u.plan], ['Plan', 'toPlan', !!u.plan]].map((x) => '<button type="button"' + H.A('vw:' + x[1]) + ' style="' + H.st({ display: 'inline-flex', alignItems: 'center', height: '34px', padding: '0 12px', borderRadius: '8px', border: 0, background: x[2] ? '#FFFFFF' : 'transparent', boxShadow: x[2] ? '0 1px 2px rgba(17,21,17,.12)' : 'none', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: x[2] ? 600 : 500, color: K.ink, cursor: 'pointer' }) + '">' + x[0] + '</button>').join('') + '</span>';
    const sb = (d, a, lab) => '<button type="button"' + H.A(a) + ' aria-label="' + lab + '" title="' + lab + '" style="' + H.st({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', border: 0, background: a === 'viewmenu' && open ? K.press : 'transparent', color: K.ink, cursor: 'pointer', padding: 0 }) + '">' + H.icon(d, 17) + '</button>';
    const I = { rl: 'M4 12a8 8 0 1 0 2.4-5.7 M4 4v4.5h4.5', rr: 'M20 12a8 8 0 1 1-2.4-5.7 M20 4v4.5h-4.5', fit: 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5', moon: 'M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z', edit: 'M4 20h4L19 9l-4-4L4 16v4Z M13.5 6.5l4 4', more: 'M5 12h.01M12 12h.01M19 12h.01' };
    const ctl = this.ovCard({ left: '12px', bottom: '12px' }, seg + this.ovBarSep() + sb(H.I.minus, 'vw:zoomOut', 'Zoom out') + sb(H.I.plus, 'vw:zoomIn', 'Zoom in') + sb(I.fit, 'vw:fit', 'Fit to the screen') + sb(I.more, 'viewmenu', 'More view'), { display: 'flex', alignItems: 'center', gap: '2px', padding: '6px' });
    if (!open) return ctl;
    const row = (d, l, a) => '<button type="button"' + H.A(a) + ' style="' + H.st({ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', height: '42px', padding: '0 10px', borderRadius: '10px', border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: '14px', color: K.ink, cursor: 'pointer', textAlign: 'left' }) + '">' + H.icon(d, 17) + l + '</button>';
    return ctl + '<div data-pop="1" style="' + H.st({ position: 'absolute', left: '12px', bottom: '72px', width: '230px', padding: '6px', boxSizing: 'border-box', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 14px 32px rgba(17,21,17,.16)', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", zIndex: 7 }) + '">' +
      row(I.rl, 'Turn left', 'vw:turnLeft') + row(I.rr, 'Turn right', 'vw:turnRight') + row(I.moon, 'Night', 'vw:toNight') + (ed ? '' : '<div style="' + H.st({ height: '1px', background: K.line, margin: '4px 6px' }) + '"></div>' + row(I.edit, 'Edit layout', 'vw:modeToggle')) + '</div>';
  }
  // Edit: something picked on the map (a lane, a pen, a door, a device, rooms) opens its page in the pane
  edPicked(u) { return !!(u.sel || u.pen || (u.selKind === 'room' && (u.selIds || []).length)); }
  edPaneOpen(u) { return !this.edMapTask(u) && (this.edPicked(u) || !!(u.nn || u.ed || u.cf || u.dupT || u.mvT || u.chT || u.ptList || u.ptForm || u.arT || u.dvE || (u.devT && !u.devT.kind) || u.vt)); }
  // Edit's bar: the place, Add ▾ and the place's actions (the rest under More ▾), then undo · redo · Done
  edTopBar(u) {
    if (this.edMapTask(u)) return '';
    const V = this.ovVals || {}, P = V.P || {}, H = OVH, K = H.K, PL = this.ovPlace(u), picked = this.edPicked(u);
    this.edF = this.edF || {};
    const A = (fn) => { const k = 'f' + (this.edN = (this.edN || 0) + 1); this.edF[k] = fn; return 'ed:' + k; };
    const repaint = () => { this.ovLast = null; this.ovPaint(); };
    const toggle = (m) => A(() => { this.edMenu = this.edMenu === m ? '' : m; repaint(); });
    const run = (fn) => A(() => { this.edMenu = ''; if (fn) fn(); repaint(); });
    if (!this.edMenuOff) { this.edMenuOff = (e) => { if (!this.edMenu) return; if (e.target && e.target.closest && e.target.closest('[data-edmenu]')) return; this.edMenu = ''; this.ovLast = null; this.ovPaint(); }; window.addEventListener('pointerdown', this.edMenuOff, true); }
    const caret = H.icon('m6 9 6 6 6-6', 14, { color: K.muted });
    const menu = (m, items) => this.edMenu !== m ? '' : '<div data-edmenu="1" style="' + H.st({ position: 'absolute', left: 0, top: '50px', minWidth: '270px', padding: '6px', boxSizing: 'border-box', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 14px 32px rgba(17,21,17,.16)', zIndex: 8, whiteSpace: 'normal' }) + '">' + items.map((x) => (x.sep ? '<div style="' + H.st({ height: '1px', background: K.line, margin: '4px 6px' }) + '"></div>' : '') + '<button type="button"' + H.A(run(x.fn)) + ' style="' + H.st({ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '9px 10px', borderRadius: '10px', border: 0, background: 'transparent', fontFamily: 'inherit', textAlign: 'left', color: x.red ? K.red : K.ink, cursor: 'pointer' }) + '"><span style="display: inline-flex; margin-top: 1px;">' + H.icon(x.ico || H.I.plus, 17) + '</span><span style="' + H.st({ display: 'flex', flexDirection: 'column', gap: '1px' }) + '">' + H.t(x.label, { fontSize: '14px', fontWeight: 500 }) + (x.hint ? H.t(x.hint, { fontSize: '12.5px', lineHeight: '17px', color: K.muted, whiteSpace: 'normal' }) : '') + '</span></button>').join('') + '</div>';
    let mid = '';
    if (!picked) {
      if (P.hasAdd) {
        if (P.addMenu) mid += '<span data-edmenu="1" style="position: relative; display: inline-flex;">' + this.ovBtn(H.icon(H.I.plus, 18) + 'Add' + caret, toggle('add'), this.edMenu === 'add') + menu('add', (P.addItems || []).map((a) => ({ label: a.label, hint: String(a.hint || '').replace(/\.?\s*Not ready yet\.?/, ''), ico: a.icon, fn: a.run }))) + '</span>';
        else mid += this.ovBtn(H.icon(H.I.plus, 18) + H.esc(P.addLabel || 'Add'), run(P.addClick), false);
      }
      const acts = [], rest = [];
      if (P.hasLead && P.lead) acts.push({ label: P.lead.label, ico: P.lead.icon, fn: P.lead.run });
      (P.actions || []).forEach((a) => (a.danger ? rest : acts).push({ label: a.label, ico: a.icon, fn: a.run, red: a.danger }));
      if (P.hasMore) (P.more || []).forEach((a) => rest.unshift({ label: a.label, ico: a.icon, fn: a.run, red: a.danger }));
      const nw = (this.W || 950) < 760, shown = acts.slice(0, nw ? 0 : 3), over = acts.slice(nw ? 0 : 3);
      mid += shown.map((a) => this.ovBtn(H.icon(a.ico || H.I.plus, 18) + H.esc(a.label), run(a.fn), false)).join('');
      const moreItems = over.concat(P.hasEdit && P.edit ? [{ label: P.editTitle || 'Edit details', ico: 'M4 20h4L19 9l-4-4L4 16v4Z', fn: P.edit }] : []);
      const dangers = rest.filter((x) => x.red), others = rest.filter((x) => !x.red), list = moreItems.concat(others).concat(dangers.map((d, i) => Object.assign({}, d, { sep: i === 0 && (moreItems.length + others.length) > 0 })));
      if (list.length) mid += '<span data-edmenu="1" style="position: relative; display: inline-flex;">' + this.ovBtn(H.icon('M5 12h.01M12 12h.01M19 12h.01', 18) + 'More', toggle('more'), this.edMenu === 'more') + menu('more', list) + '</span>';
    }
    const done = (this.ovVals && this.ovVals.showMode === false) ? '' : this.ovBarSep() + this.ovBtn(H.icon(H.I.check, 18) + H.esc((this.ovVals && this.ovVals.modeLabel) || 'Done'), 'vw:modeToggle', false, { background: K.ink, color: '#FFFFFF', fontWeight: 600, padding: '0 16px' });
    return this.ovTopCard(this.ovWhere(PL) + (mid ? this.ovBarSep() + mid : '') + '<span style="flex: 1;"></span>' + this.edUndoHtml() + done);
  }
