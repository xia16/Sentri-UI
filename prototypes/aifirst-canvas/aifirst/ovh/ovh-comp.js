  // ===================== the overhauled view-mode UI (OVH parts, OVP pages) =====================
  ovOn(u) { u = u || this.ui(); return !!(u.ready && !u.err && u.mode !== 'intro' && this.IP && u.vm === 'view'); }
  ovS() { return this.O || (this.O = { panel: '', batchId: '', taskId: '', only: '', pop: '', popAt: null, parity: '', hist: [], loc: '', crumb: -1 }); }
  ovSet(p) { Object.assign(this.ovS(), p || {}); this.ovPaint(); }
  setOvh(el) {
    if (!el || el === this.ovEl) return;
    this.ovEl = el;
    el.innerHTML = '';
    const body = document.createElement('div'); body.style.cssText = 'position:absolute; inset:0; pointer-events:none';
    const tip = document.createElement('div'); tip.setAttribute('role', 'tooltip');
    tip.style.cssText = "position:absolute; left:0; top:0; z-index:40; pointer-events:none; display:none; min-width:220px; max-width:300px; box-sizing:border-box; padding:10px 12px; border-radius:8px; background:#FFFFFF; border:1px solid #DFE4D8; box-shadow:0 4px 16px rgba(32,41,31,.14); font-family:'Geist', system-ui, sans-serif; font-variant-numeric: tabular-nums";
    el.appendChild(body); el.appendChild(tip);
    this.ovBody = body; this.ovTipEl = tip;
    el.addEventListener('click', (e) => { const h = e.target.closest('[data-a]'); if (!h || !el.contains(h)) { if (this.ovS().pop && !e.target.closest('[data-pop]')) this.ovSet({ pop: '' }); return; } e.preventDefault(); e.stopPropagation(); this.ovAct(h.getAttribute('data-a'), h); });
    el.addEventListener('mouseover', (e) => { const h = e.target.closest('[data-tip]'); if (h && el.contains(h)) this.ovTip(h.getAttribute('data-tip'), h); const lc = e.target.closest('[data-zone="loc"]'); if (lc && !this.ovS().loc) this.ovSet({ loc: 'hover' }); });
    el.addEventListener('mouseout', (e) => { const h = e.target.closest('[data-tip]'); if (h && (!e.relatedTarget || !h.contains(e.relatedTarget))) this.ovTipHide(); const lc = e.target.closest('[data-zone="loc"]'), to = e.relatedTarget; if (lc && this.ovS().loc && !(to && to.closest && to.closest('[data-zone="loc"]'))) this.ovSet({ loc: '', crumb: -1 }); });
    if (!this.ovKey) { this.ovKey = (e) => { if (e.key !== 'Escape' || !this.ovOn()) return; const O = this.ovS(); if (O.pop) { this.ovSet({ pop: '' }); return; } if (O.picking) { this.ovAct('pickcancel'); return; } if (O.showing) { this.ovAct('showdone'); return; } if (O.panel) this.ovAct(O.hist.length ? 'back' : 'close'); }; window.addEventListener('keydown', this.ovKey); }
    this.ovPaint();
  }
  ovTip(key, h) {
    const O = this.ovS(), f = (OVP.TIPS[key] || (this.ovTips && this.ovTips[key]));
    if (!f || !this.ovTipEl || !this.ovEl) return;
    const el = this.ovTipEl; el.innerHTML = typeof f === 'function' ? f(O) : f; el.style.display = 'block';
    const R = this.ovEl.getBoundingClientRect(), r = h.getBoundingClientRect(), w = el.offsetWidth, hh = el.offsetHeight;
    let x = r.left - R.left + r.width / 2 - w / 2, y = r.top - R.top - hh - 8;
    if (y < 8) y = r.bottom - R.top + 8;
    x = Math.max(8, Math.min(R.width - w - 8, x));
    el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  }
  ovTipHide() { if (this.ovTipEl) this.ovTipEl.style.display = 'none'; }
  ovPush() { const O = this.ovS(); O.hist.push({ panel: O.panel, batchId: O.batchId, taskId: O.taskId }); }
  ovAct(a, h) {
    const O = this.ovS(), u = this.ui(), i = a.indexOf(':'), k = i < 0 ? a : a.slice(0, i), v = i < 0 ? '' : a.slice(i + 1);
    this.ovTipHide();
    const at = () => { if (!h || !this.ovEl) return null; const R = this.ovEl.getBoundingClientRect(), r = h.getBoundingClientRect(); return { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height, bottom: R.height - (r.top - R.top) }; };
    if (k === 'noop') return;
    if (k === 'batches') { if (O.panel && ['list', 'batch', 'task', 'dates', 'done', 'compare'].indexOf(O.panel) >= 0) { this.ovAct('close'); return; } if (u.bv) this.closeBatch(); this.ovSet({ panel: 'list', hist: [], pop: '' }); return; }
    if (k === 'close') { if (this.ui().ovCmp) this.put({ ovCmp: false }); if (this.ui().bv) { this.put({ bvOnly: '' }); this.closeBatch(); } this.ovSet({ panel: '', hist: [], only: '', pop: '' }); return; }
    if (k === 'back') {
      const prev = O.hist.pop();
      if (O.panel === 'compare' && this.ui().ovCmp) { this.put({ ovCmp: false }); this.repaintBv(); }
      if (!prev) { this.ovAct('close'); return; }
      if (O.panel === 'task' && prev.panel !== 'task') { this.put({ bvOnly: '' }); this.closeBatchTask(); }
      if (prev.panel === 'list' && this.ui().bv) { this.put({ bvOnly: '' }); this.closeBatch(); }
      this.ovSet(Object.assign({}, prev, { only: '', pop: '' }));
      return;
    }
    if (k === 'open') { this.ovPush(); this.ovSet({ panel: 'batch', batchId: v, pop: '' }); if (this.batchData()[v]) this.openBatch(v); return; }
    if (k === 'task') { this.ovPush(); if (!this.ui().bv) this.openBatch('32'); this.put({ bvOnly: '' }); this.openBatchTask(v === 'post' ? 'post' : 'farrow'); this.ovSet({ panel: 'task', taskId: v === 'post' ? 'post' : 'farrow', only: '', pop: '' }); return; }
    if (k === 'dates') { this.ovPush(); this.ovSet({ panel: 'dates', pop: '' }); return; }
    if (k === 'donetask') { this.ovPush(); this.ovSet({ panel: 'done', pop: '' }); return; }
    if (k === 'only') { const nv = O.only === v ? '' : v; this.put({ bvOnly: nv }); this.repaintBv(); this.ovSet({ only: nv }); return; }
    if (k === 'filter') { this.ovSet({ pop: O.pop === 'filter' ? '' : 'filter', popAt: at() }); return; }
    if (k === 'parity') { this.ovSet({ parity: v, pop: '' }); return; }
    if (k === 'actions') { this.ovSet({ pop: O.pop === 'actions' ? '' : 'actions', popAt: at() }); return; }
    if (k === 'equip') { this.ovSet({ pop: O.pop === 'eq' ? '' : 'eq', popAt: at() }); return; }
    if (k === 'select') { this.ovSet({ selecting: !O.selecting }); return; }
    if (k === 'crumb') { this.ovSet({ crumb: +v, loc: 'hover' }); return; }
    if (k === 'goroom') { this.ovSet({ loc: '', crumb: -1 }); if (this.ui().bv) this.closeBatch(); this.goRoom(v); return; }
    if (k === 'gofarm') { this.ovSet({ loc: '', crumb: -1 }); this.goScope('', ''); return; }
    if (this.ovAct2 && this.ovAct2(k, v, h, at)) return;
  }
  // the location card: only where you are; hover → the breadcrumb; a crumb → its siblings
  ovPlace(u) {
    const r = u.view === 'room' ? this.roomById(u.roomId) : null, ps = u.psel || [];
    const pen = r && ps.length === 1 ? ps[0] : (r && u.pen ? u.pen : '');
    const crumbs = [{ label: 'Farm', a: 'gofarm' }];
    const sec = r && r.section ? this.secById(r.section) : (u.secId ? this.secById(u.secId) : null);
    if (sec) crumbs.push({ label: sec.name, a: 'noop' });
    if (r) crumbs.push({ label: r.name, a: 'goroom:' + r.id, sibs: true, roomId: r.id });
    const name = pen ? 'Pen ' + pen : r ? r.name : (sec ? sec.name : (this.M().name || 'Hillside Sow Farm'));
    if (pen) crumbs.push({ label: 'Pen ' + pen, a: 'noop' });
    return { r: r, pen: pen, name: name, crumbs: crumbs.slice(0, -1) };
  }
  ovPigs(roomId, code) {
    const cells = (this.IP && this.IP.cell[roomId]) || {}, n = {};
    Object.keys(cells).forEach((c) => { if (code && c !== code) return; const x = cells[c]; if (!x || !x.kind) return; const k = x.kind === 'sow' || x.kind === 'litter' ? 'sows' : x.kind === 'boar' ? 'boars' : x.kind === 'gilts' ? 'gilts' : x.kind === 'weaners' ? 'weaners' : x.kind; n[k] = (n[k] || 0) + (x.kind === 'sow' || x.kind === 'boar' || x.kind === 'litter' ? 1 : (x.n || 1)); });
    return Object.keys(n).map((k) => [n[k], n[k] === 1 ? k.replace(/s$/, '') : k]).sort((a, b) => b[0] - a[0]);
  }
  ovFault(roomId, code) { const cells = (this.IP && this.IP.cell[roomId]) || {}; return Object.keys(cells).some((c) => (!code || c === code) && cells[c] && cells[c].flag && cells[c].flag.lvl === 'urgent'); }
  ovLoc(u) {
    const H = OVH, K = H.K, O = this.ovS(), P = this.ovPlace(u), A = H.A;
    const kinds = P.r ? this.ovPigs(P.r.id, P.pen) : [], fault = P.r ? this.ovFault(P.r.id, P.pen) : false;
    this.ovTips = this.ovTips || {};
    let chips = kinds.slice(0, kinds.length > 3 ? 2 : 3).map((x, i) => H.lchip(i ? '' : H.I.pig, x[0] + ' ' + x[1])).join('');
    if (kinds.length > 3) { this.ovTips.kinds = () => H.tip(kinds.reduce((a, x) => a + x[0], 0) + ' pigs', kinds.map((x, j) => ['#' + ['2F3A33', '4F5D53', '718075', '93A096', 'B4BFB6', 'D3DBD4'][Math.min(j, 5)], x[1].charAt(0).toUpperCase() + x[1].slice(1), String(x[0])]), 'Click a kind → only those pens'); chips += H.lchip('', '+' + (kinds.length - 2), { tip: 'kinds' }); }
    if (P.r && !P.pen) { chips += H.lchip(H.I.temp, '22.4 °C') + H.lchip(H.I.drop, '61 %') + (/gest/i.test(P.r.name) ? H.lchip(H.I.air, 'NH₃ 9.4', { bg: K.amberT, color: K.amber, a: 'trend', on: O.pop === 'trend' }) : H.lchip(H.I.air, 'NH₃ 6.8', { a: 'trend' })); }
    const crumbsHtml = O.loc ? '<div data-zone="crumbs" style="' + H.st({ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }) + '">' + P.crumbs.map((c, i) => '<span' + A(c.sibs ? 'crumb:' + i : c.a) + ' style="' + H.st({ fontSize: '12px', lineHeight: '18px', padding: '1px 5px', borderRadius: '6px', color: i === O.crumb ? K.ink : K.muted, background: i === O.crumb ? K.press : 'transparent', fontWeight: i === O.crumb ? 600 : 400, whiteSpace: 'nowrap', cursor: 'pointer' }) + '">' + H.esc(c.label) + '</span>' + (i < P.crumbs.length - 1 || true ? '<span style="color: #B5BDB2; font-size: 11px;">›</span>' : '')).join('') + '</div>' : '';
    let menu = '';
    const cc = O.crumb >= 0 ? P.crumbs[O.crumb] : null;
    if (O.loc && cc && cc.sibs) {
      const me = this.roomById(cc.roomId), sibs = this.M().rooms.filter((x) => (x.section || '') === (me.section || ''));
      menu = '<div data-pop="1" style="' + H.st({ position: 'absolute', left: '40px', top: '100%', marginTop: '6px', width: '270px', padding: '6px 0', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 14px 32px rgba(17,21,17,.16)', zIndex: 6 }) + '">' + sibs.map((x) => { const k = this.ovPigs(x.id).reduce((a, y) => a + y[0], 0), on = x.id === cc.roomId, f = this.ovFault(x.id); return '<div' + A('goroom:' + x.id) + ' style="' + H.st({ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 12px', fontSize: '13.5px', color: K.ink, fontWeight: on ? 600 : 400, background: on ? K.press : 'transparent', cursor: 'pointer' }) + '"><span style="flex: 1;">' + H.esc(x.name) + '</span>' + H.mu(k ? k + ' pigs' : 'empty') + (f ? H.dot(K.red, 7) : '') + (on ? H.icon(H.I.check, 14) : '') + '</div>'; }).join('') + '</div>';
    }
    return '<div data-zone="loc" style="' + H.st({ position: 'absolute', left: '16px', top: '16px', padding: '10px 12px', borderRadius: '16px', background: '#FFFFFF', boxShadow: (O.loc ? '0 0 0 1.5px ' + K.ink + ', ' : '') + '0 1px 2px rgba(17,21,17,.06), 0 10px 26px rgba(17,21,17,.14)', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", maxWidth: 'calc(100% - 580px)', minWidth: '180px' }) + '">' + crumbsHtml + '<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }) + '"><span style="display: inline-flex; align-items: center; gap: 6px;">' + H.t(P.name, { fontSize: '15px', fontWeight: 600 }) + (fault ? H.dot(K.red, 8) : '') + '</span>' + chips + '</div>' + menu + '</div>';
  }
  ovPanelHtml(O, u) {
    const p = O.panel;
    if (p === 'list') return OVP.list(O);
    if (p === 'batch') return OVP.batch(O);
    if (p === 'task') return OVP.task(O);
    if (p === 'dates') return OVP.dates(O);
    if (this.ovPanel2) return this.ovPanel2(p, O, u);
    return '';
  }
  ovPopHtml(O, u) {
    if (!O.pop) return '';
    const at = O.popAt || { x: 16, y: 80, w: 0, h: 0, bottom: 100 }, sh = '0 1px 2px rgba(17,21,17,.06), 0 14px 32px rgba(17,21,17,.16)';
    const box = (inner, pos, w) => '<div data-pop="1" style="' + OVH.st(Object.assign({ position: 'absolute', width: (w || 220) + 'px', padding: '6px 0', borderRadius: '14px', background: '#FFFFFF', boxShadow: sh, pointerEvents: 'auto', zIndex: 30, fontFamily: "'Geist', system-ui, sans-serif" }, pos)) + '">' + inner + '</div>';
    if (O.pop === 'filter') return box(OVP.filterPop(O), { left: at.x + 'px', top: (at.y + at.h + 6) + 'px' }, Math.max(180, at.w));
    if (O.pop === 'actions') return box(OVP.actionsPop(O), { left: Math.max(16, at.x + at.w - 240) + 'px', bottom: (at.bottom + 8) + 'px' }, 240);
    if (this.ovPop2) return this.ovPop2(O, u, at, box);
    return '';
  }
  // the canvas frames open straight onto a screen
  ovStart(st) {
    const L = { panel: 'list' }, B = { panel: 'batch', batchId: '32' };
    const S = {
      bxlist: { O: { panel: 'list', hist: [] } },
      bxbatch: { O: { panel: 'batch', batchId: '32', hist: [L] }, b: '32' },
      bxtask: { O: { panel: 'task', batchId: '32', taskId: 'farrow', hist: [L, B] }, b: '32', t: 'farrow' },
      bxfilter: { O: { panel: 'task', batchId: '32', taskId: 'farrow', hist: [L, B] }, b: '32', t: 'farrow', pop: 'filter' },
      bxdates: { O: { panel: 'dates', batchId: '32', hist: [L, B] }, b: '32' },
    }[st] || (this.ovStart2 ? this.ovStart2(st) : null);
    if (!S) return;
    Object.assign(this.ovS(), S.O);
    if (S.b) this.openBatch(S.b);
    if (S.t) this.openBatchTask(S.t);
    if (S.pop) setTimeout(() => { const h = this.ovBody && this.ovBody.querySelector('[data-a="' + S.pop + '"]'); if (h) this.ovAct(S.pop, h); }, 60);
    if (S.after) setTimeout(() => S.after(), 80);
  }
  ovPaint() {
    if (!this.ovBody) return;
    const u = this.ui();
    if (!this.ovOn(u)) { if (this.ovLast !== '') { this.ovBody.innerHTML = ''; this.ovLast = ''; this.ovTipHide(); } return; }
    const O = this.ovS(), st0 = this.props.start || 'saved';
    if (this.ovStarted !== st0) { this.ovStarted = st0; this.ovStart(st0); }
    // a pen picked on the farm: her profile (O3) takes the main panel
    const ps = (u.psel || []).join(',');
    if (ps !== this.ovPsel) { this.ovPsel = ps; if (this.ovPicked) this.ovPicked(u); }
    const panel = O.panel ? this.ovPanelHtml(O, u) : '';
    const H = OVH, K = H.K;
    const html = this.ovLoc(u) +
      (panel ? '<section data-zone="panel" aria-label="Panel" style="' + H.st({ position: 'absolute', right: '16px', top: '72px', maxHeight: 'calc(100% - 164px)', width: '380px', boxSizing: 'border-box', padding: '16px 16px 20px', borderRadius: '22px', background: K.tint, boxShadow: '0 2px 6px rgba(17,21,17,.05), 0 16px 36px rgba(17,21,17,.12)', overflowY: 'auto', overflowX: 'hidden', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", fontVariantNumeric: 'tabular-nums', color: K.ink, fontSize: '14px', lineHeight: '20px' }) + '">' + panel + '</section>' : '') +
      (this.ovSide ? this.ovSide(O, u) : '') +
      '<div data-zone="bar" role="toolbar" aria-label="Actions bar" style="' + H.st({ position: 'absolute', left: '16px', right: '16px', bottom: '16px', height: '60px', padding: '0 8px', boxSizing: 'border-box', borderRadius: '18px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 10px 26px rgba(17,21,17,.14)', display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif" }) + '">' + OVP.bar(Object.assign({}, O, { barCtl: O.picking && this.ovBarCtl ? this.ovBarCtl(O) : '' })) + '</div>' +
      this.ovPopHtml(O, u) + (this.ovExtra ? this.ovExtra(O, u) : '');
    if (html === this.ovLast) return;
    const pEl = this.ovBody.querySelector('[data-zone="panel"]'), keep = pEl ? pEl.scrollTop : 0, sc = {};
    this.ovBody.querySelectorAll('[data-scroll]').forEach((x) => { sc[x.getAttribute('data-scroll')] = x.scrollTop; });
    const samePanel = this.ovLastPanel === O.panel;
    this.ovBody.innerHTML = html; this.ovLast = html; this.ovLastPanel = O.panel;
    const p2 = this.ovBody.querySelector('[data-zone="panel"]'); if (p2 && samePanel) p2.scrollTop = keep;
    this.ovBody.querySelectorAll('[data-scroll]').forEach((x) => { const id = x.getAttribute('data-scroll'); if (sc[id] != null && samePanel) x.scrollTop = sc[id]; else if (x.getAttribute('data-scroll-to')) x.scrollTop = +x.getAttribute('data-scroll-to'); });
  }
  renderVals() {
    const r = this.renderValsBase();
    r.setOvh = (el) => this.setOvh(el);
    if (this.ovOn()) { r.showProf = false; r.showBatch = false; r.showCard = false; r.showBar = false; r.showCrumbMenu = false; }
    return r;
  }
