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
    el.addEventListener('mouseover', (e) => { const h = e.target.closest('[data-tip]'); if (h && el.contains(h)) this.ovTip(h.getAttribute('data-tip'), h); const cr = e.target.closest('[data-crumb]'); if (cr && el.contains(cr) && this.ovS().crumb !== +cr.getAttribute('data-crumb')) { this.ovSet({ crumb: +cr.getAttribute('data-crumb'), loc: 'hover' }); return; } const lc = e.target.closest('[data-zone="loc"]'); if (lc && !this.ovS().loc) this.ovSet({ loc: 'hover' }); });
    el.addEventListener('mouseout', (e) => { const h = e.target.closest('[data-tip]'); if (h && (!e.relatedTarget || !h.contains(e.relatedTarget))) this.ovTipHide(); const lc = e.target.closest('[data-zone="loc"]'), to = e.relatedTarget; if (lc && this.ovS().loc && !(to && to.closest && to.closest('[data-zone="loc"]'))) this.ovSet({ loc: '', crumb: -1 }); });
    if (!this.ovKey) { this.ovKey = (e) => { if (e.key !== 'Escape' || !this.ovOn()) return; const O = this.ovS(); if (O.pop) { this.ovSet({ pop: '' }); return; } if (O.selecting || (O.ticks && O.ticks.length)) { this.ovAct('selcancel'); return; } if (O.picking) { this.ovAct('pickcancel'); return; } if (O.showing) { this.ovAct('showdone'); return; } if (O.panel) this.ovAct(O.hist.length ? 'back' : 'close'); }; window.addEventListener('keydown', this.ovKey); }
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
    if (this.ovAct3 && this.ovAct3(k, v, h, at)) return;
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
    if (k === 'task') { const pr = v.split('/'), bid = pr.length > 1 ? pr[0] : (O.batchId || '32'), tid = pr.length > 1 ? pr[1] : v; this.ovPush(); if (!this.ui().bv || String(this.ui().bv.id) !== bid) this.openBatch(bid); this.put({ bvOnly: '' }); this.openBatchTask(tid); this.ovSet({ panel: 'task', batchId: bid, taskId: tid, only: '', pop: '' }); return; }
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
    if (k === 'gofarm') { this.ovSet({ loc: '', crumb: -1 }); if (this.ui().bv) this.closeBatch(); this.goScope('', ''); return; }
    if (k === 'gozone') { this.ovSet({ loc: '', crumb: -1 }); if (this.ui().bv) this.closeBatch(); this.goScope(v, ''); return; }
    if (k === 'gosec') { const sc = this.secById(v); this.ovSet({ loc: '', crumb: -1 }); if (this.ui().bv) this.closeBatch(); this.goScope(sc ? (sc.zone || '') : '', v); return; }
    if (this.ovAct2 && this.ovAct2(k, v, h, at)) return;
  }
  // ----- the location card, v2: every level switchable; pigs at every level -----
  ovPlace(u) {
    const M = this.M(), r = u.view === 'room' ? this.roomById(u.roomId) : null, ps = u.psel || [];
    const pen = r && ps.length === 1 ? ps[0] : '';
    const secId = r ? (r.section || '') : (u.secId || ''), sec = secId ? this.secById(secId) : null;
    const zoneId = r ? this.zoneOfRoom(r) : (sec ? (sec.zone || u.zoneId || '') : (u.zoneId || '')), zone = zoneId ? this.zoneById(zoneId) : null;
    const levels = [{ kind: 'farm', label: M.name || 'Your farm', a: 'gofarm' }];
    if (zone) levels.push({ kind: 'zone', id: zone.id, label: zone.name, a: 'gozone:' + zone.id });
    if (sec) levels.push({ kind: 'section', id: sec.id, zoneId: zoneId, label: sec.name, a: 'gosec:' + sec.id });
    if (r) levels.push({ kind: 'room', id: r.id, secId: secId, zoneId: zoneId, label: r.name, a: 'goroom:' + r.id });
    if (pen) levels.push({ kind: 'pen', label: 'Pen ' + pen, a: 'noop' });
    const cur = levels[levels.length - 1];
    const rooms = r ? [r] : sec ? this.roomsOf(sec.id) : zone ? M.rooms.filter((x) => this.zoneOfRoom(x) === zone.id) : M.rooms;
    return { r: r, pen: pen, name: cur.label, cur: cur, crumbs: levels.slice(0, -1), rooms: rooms, levels: levels };
  }
  ovPigsIn(rooms) { const n = {}; rooms.forEach((x) => this.ovPigs(x.id).forEach((k) => { n[k[1]] = (n[k[1]] || 0) + k[0]; })); return Object.keys(n).map((k) => [n[k], k]).sort((a, b) => b[0] - a[0]); }
  ovSibs(lv) {
    const M = this.M();
    if (lv.kind === 'zone') return M.zones.map((z) => ({ id: z.id, label: z.name, a: 'gozone:' + z.id, rooms: M.rooms.filter((x) => this.zoneOfRoom(x) === z.id) }));
    if (lv.kind === 'section') return M.sections.filter((s) => (s.zone || '') === (lv.zoneId || '')).map((s) => ({ id: s.id, label: s.name, a: 'gosec:' + s.id, rooms: this.roomsOf(s.id) }));
    if (lv.kind === 'room') return M.rooms.filter((x) => (x.section || '') === (lv.secId || '') && (lv.secId || this.zoneOfRoom(x) === lv.zoneId)).map((x) => ({ id: x.id, label: x.name, a: 'goroom:' + x.id, rooms: [x] }));
    return [];
  }
  ovLoc(u) {
    const H = OVH, K = H.K, O = this.ovS(), P = this.ovPlace(u), A = H.A;
    const kinds = P.pen ? this.ovPigs(P.r.id, P.pen) : this.ovPigsIn(P.rooms), fault = P.rooms.some((x) => this.ovFault(x.id, P.pen));
    this.ovTips = this.ovTips || {};
    const word = (x) => x[0] + ' ' + (x[0] === 1 ? x[1].replace(/s$/, '') : x[1]);
    const total = kinds.reduce((a, x) => a + x[0], 0), vf = u.vf && u.vf.kind === 'stage' ? u.vf.id : '', SW = ['2F3A33', '4F5D53', '718075', '93A096', 'B4BFB6', 'D3DBD4'];
    this.ovKinds = kinds;
    this.ovTips.kinds = () => H.tip(total + ' pigs', kinds.map((x, j) => ['#' + SW[Math.min(j, 5)], x[1].charAt(0).toUpperCase() + x[1].slice(1), String(x[0])]), 'Click to show one kind on the farm');
    const vk = vf ? kinds.find((x) => this.ovKindId(x[1]) === vf) : null;
    let chips = total ? H.lchip(H.I.pig, vk ? word(vk) + ' shown' : total + (total === 1 ? ' pig' : ' pigs'), { tip: 'kinds', a: 'kinds', on: O.pop === 'kinds' || !!vk }) : '';
    if (P.r && !P.pen) { const gest = /gest/i.test(P.r.name); chips += H.lchip(H.I.temp, '22.4 °C', { a: 'trend:temp', on: O.pop === 'trend' && O.trendKind === 'temp' }) + H.lchip(H.I.drop, '61 %', { a: 'trend:hum', on: O.pop === 'trend' && O.trendKind === 'hum' }) + H.lchip(H.I.air, gest ? 'NH₃ 9.4' : 'NH₃ 6.8', gest ? { bg: K.amberT, color: K.amber, a: 'trend:nh3', on: O.pop === 'trend' && O.trendKind === 'nh3' } : { a: 'trend:nh3', on: O.pop === 'trend' && O.trendKind === 'nh3' }); }
    // the crumbs (ancestors) and the name each open their siblings on hover
    const all = P.levels, curIdx = all.length - 1;
    const crumb = (lv, i) => '<span' + A(lv.kind === 'farm' ? 'gofarm' : 'crumb:' + i) + (lv.kind === 'farm' ? '' : ' data-crumb="' + i + '"') + ' style="' + H.st({ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', lineHeight: '18px', padding: '1px 5px', borderRadius: '6px', color: i === O.crumb ? K.ink : K.muted, background: i === O.crumb ? K.press : 'transparent', fontWeight: i === O.crumb ? 600 : 400, whiteSpace: 'nowrap', cursor: 'pointer' }) + '">' + H.esc(lv.label) + (lv.kind !== 'farm' ? H.icon(H.I.down, 11) : '') + '</span><span style="color: #B5BDB2; font-size: 11px;">›</span>';
    const crumbsHtml = O.loc && P.crumbs.length ? '<div data-zone="crumbs" style="' + H.st({ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '6px', flexWrap: 'wrap' }) + '">' + P.crumbs.map(crumb).join('') + '</div>' : '';
    const nameHtml = '<span' + (P.cur.kind !== 'farm' && P.cur.kind !== 'pen' ? A('crumb:' + curIdx) + ' data-crumb="' + curIdx + '"' : '') + ' style="' + H.st({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 6px', margin: '-2px -6px', borderRadius: '8px', background: O.crumb === curIdx ? K.press : 'transparent', cursor: P.cur.kind !== 'farm' && P.cur.kind !== 'pen' ? 'pointer' : 'default' }) + '">' + H.t(P.name, { fontSize: '15px', fontWeight: 600 }) + (fault ? H.dot(K.red, 8) : '') + (O.loc && P.cur.kind !== 'farm' && P.cur.kind !== 'pen' ? H.icon(H.I.down, 13) : '') + '</span>';
    let menu = '';
    const lv = O.crumb >= 0 ? all[O.crumb] : null;
    if (O.loc && lv && lv.kind !== 'farm' && lv.kind !== 'pen') {
      const sibs = this.ovSibs(lv);
      menu = '<div data-pop="1" style="' + H.st({ position: 'absolute', left: '8px', top: '100%', marginTop: '6px', width: '280px', maxHeight: '360px', overflowY: 'auto', padding: '6px 0', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 14px 32px rgba(17,21,17,.16)', zIndex: 6 }) + '"><div style="' + H.st({ padding: '4px 12px 6px', fontSize: '12px', color: K.muted }) + '">' + ({ zone: 'Zones', section: 'Sections', room: 'Rooms' }[lv.kind]) + '</div>' + sibs.map((x) => { const k = this.ovPigsIn(x.rooms).reduce((a, y) => a + y[0], 0), on = x.id === lv.id, f = x.rooms.some((y) => this.ovFault(y.id)); return '<div' + A(x.a) + ' style="' + H.st({ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 12px', fontSize: '13.5px', color: K.ink, fontWeight: on ? 600 : 400, background: on ? K.press : 'transparent', cursor: 'pointer' }) + '"><span style="flex: 1;">' + H.esc(x.label) + '</span>' + H.mu(k ? k + ' pigs' : 'empty') + (f ? H.dot(K.red, 7) : '') + (on ? H.icon(H.I.check, 14) : '') + '</div>'; }).join('') + '</div>';
    }
    return '<div data-zone="loc" style="' + H.st({ position: 'absolute', left: '16px', top: '16px', padding: '10px 12px', borderRadius: '16px', background: '#FFFFFF', boxShadow: (O.loc ? '0 0 0 1.5px ' + K.ink + ', ' : '') + '0 1px 2px rgba(17,21,17,.06), 0 10px 26px rgba(17,21,17,.14)', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", maxWidth: 'calc(100% - 580px)', minWidth: '180px' }) + '">' + crumbsHtml + '<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }) + '">' + nameHtml + chips + '</div>' + menu + '</div>';
  }
  ovPigs(roomId, code) {
    const cells = (this.IP && this.IP.cell[roomId]) || {}, n = {};
    Object.keys(cells).forEach((c) => { if (code && c !== code) return; const x = cells[c]; if (!x || !x.kind) return; const k = x.kind === 'sow' || x.kind === 'litter' ? 'sows' : x.kind === 'boar' ? 'boars' : x.kind === 'gilts' ? 'gilts' : x.kind === 'weaners' ? 'weaners' : x.kind; n[k] = (n[k] || 0) + (x.kind === 'sow' || x.kind === 'boar' || x.kind === 'litter' ? 1 : (x.n || 1)); });
    return Object.keys(n).map((k) => [n[k], n[k] === 1 ? k.replace(/s$/, '') : k]).sort((a, b) => b[0] - a[0]);
  }
  ovFault(roomId, code) { const cells = (this.IP && this.IP.cell[roomId]) || {}; return Object.keys(cells).some((c) => (!code || c === code) && cells[c] && cells[c].flag && cells[c].flag.lvl === 'urgent'); }
  ovPanelHtml(O, u) {
    const p = O.panel;
    if (p === 'list') return this.ovListHtml();
    if (p === 'batch') return this.ovBatchHtml(O.batchId);
    if (p === 'task') return this.ovTaskHtml(O.batchId || '32', O.taskId, O);
    if (p === 'dates') return this.ovDatesHtml(O.batchId || '32');
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
      '<div data-zone="bar" role="toolbar" aria-label="Actions bar" style="' + H.st({ position: 'absolute', left: '16px', right: '16px', bottom: '16px', height: '60px', padding: '0 8px', boxSizing: 'border-box', borderRadius: '18px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 10px 26px rgba(17,21,17,.14)', display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif" }) + '">' + OVP.bar(Object.assign({}, O, { barCtl: O.picking && this.ovBarCtl ? this.ovBarCtl(O) : '', eqOk: u.view === 'room' })) + '</div>' +
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
    this.ovVals = r;
    if (this.ovOn() || (this.ui().ready && this.ui().mode === 'intro')) r.camStyle = (r.camStyle || '') + ' display: none;';
    if (r.P) r.P = Object.assign({}, r.P, { cIco: r.P.cIco || (r.ic && r.ic.x), cStyle: r.P.cStyle || r.closeStyle });
    this.ovEdTask = false;
    if (this.ovEdOn && this.ovEdOn(this.ui()) && r.P && r.P.isTask && r.barStyle) { this.ovEdTask = true; r.barStyle = r.barStyle.replace('left: 16px; right: 16px; bottom: 16px;', 'right: 16px; top: 16px; width: 360px;').replace(/max-height: calc\(100% - \d+px\);/, 'max-height: calc(100% - 104px);'); r.cardStyle = (r.cardStyle || '') + '; display: none;'; r.camStyle = (r.camStyle || '') + ' display: none;'; r.P = Object.assign({}, r.P, { cIco: r.ic && r.ic.chevL, cStyle: (r.closeStyle || '').replace('margin: -6px -2px -6px auto;', 'margin: -6px 2px -6px -8px; order: -1;'), closeLabel: 'Back' }); }
    if (this.ovEdOn && this.ovEdOn(this.ui()) && !this.ovEdTask) { r.camStyle = (r.camStyle || '') + ' display: none;'; if (r.barStyle) { const lw = 16 + (this.ovEdW || 200); r.barStyle = r.barStyle.replace('left: 16px; right: 16px; bottom: 16px;', 'left: ' + lw + 'px; top: 16px; max-width: calc(100% - ' + (lw + 408) + 'px);').replace('border-radius: 16px;', 'border-radius: 0 16px 16px 0; border-left: 0;'); } if (r.P) r.P = Object.assign({}, r.P, { hasTopRow: false, canBack: false }); if (r.cardStyle) r.cardStyle = r.cardStyle.replace('left: 16px; top: 16px;', 'right: 16px; top: 16px;').replace(/max-height: calc\(100% - \d+px\);/, 'max-height: calc(100% - 104px);'); }
    if (this.ovOn() && this.O && this.O.panel === 'devices' && /^cam:/.test(this.O.dev || '') && r.vidStyle) r.vidStyle = r.vidStyle.replace(/right: 16px; bottom: [^;]+;/, 'right: 32px; top: 92px;').replace('width: 360px;', 'width: 348px;').replace('z-index: 4;', 'z-index: 31;').replace(/animation: [^;]+;?/, '');
    if (this.ovOn()) { r.showProf = false; r.showBatch = false; r.showCard = false; r.showBar = false; r.showCrumbMenu = false; }
    return r;
  }
