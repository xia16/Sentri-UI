  // ===================== the farm view, rearranged (canvas: Farm view rearranged) =====================
  // the bar top left (‹, the place, its panels), 3D bottom left, Select bottom right; while acting, the actions take the bottom
  ovBtn(inner, a, on, o) { const H = OVH, K = H.K; return '<button type="button"' + H.A(a) + ' style="' + H.st(Object.assign({ display: 'inline-flex', alignItems: 'center', gap: '7px', height: '40px', padding: '0 10px', borderRadius: '12px', border: 0, background: on ? K.press : 'transparent', boxShadow: on ? 'inset 0 0 0 1.5px ' + K.ink : 'none', color: K.ink, fontSize: '14px', fontWeight: on ? 600 : 500, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }, o || {})) + '">' + inner + '</button>'; }
  ovCard(pos, inner, o) { return '<div style="' + OVH.st(Object.assign({ position: 'absolute', padding: '8px', borderRadius: '16px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 10px 26px rgba(17,21,17,.14)', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", color: OVH.K.ink, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }, pos, o || {})) + '">' + inner + '</div>'; }
  ovSq(d, a, label) { const K = OVH.K; return '<button type="button"' + OVH.A(a) + (label ? ' aria-label="' + label + '"' : '') + ' style="' + OVH.st({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', border: 0, background: K.tint, color: K.ink, cursor: 'pointer', padding: 0, flexShrink: 0 }) + '">' + OVH.icon(d, 18) + '</button>'; }
  ovDevDot(u) { const E = this.ovEqCtx(u); if (!E.room) return ''; const h = OVP2.tiles(E), K = OVH.K; return h.indexOf(K.red) >= 0 ? K.red : h.indexOf(K.amber) >= 0 ? K.amber : ''; }
  ovLoc(u) {
    const H = OVH, K = H.K, O = this.ovS(), P = this.ovPlace(u);
    const kinds = P.pen ? this.ovPigs(P.r.id, P.pen) : this.ovPigsIn(P.rooms), fault = P.rooms.some((x) => this.ovFault(x.id, P.pen));
    this.ovKinds = kinds;
    const total = kinds.reduce((a, x) => a + x[0], 0), canSwitch = P.cur.kind !== 'farm' && P.cur.kind !== 'pen', pnl = O.panel;
    const name = this.ovBtn(H.t(P.name, { fontSize: '17px', lineHeight: '22px', fontWeight: 600, letterSpacing: '-.01em' }) + (fault ? H.dot(K.red, 8) : '') + (canSwitch ? H.icon(H.I.down, 16, { color: K.muted }) : ''), canSwitch ? 'switch' : 'noop', O.pop === 'switch', { cursor: canSwitch ? 'pointer' : 'default' });
    const isBatch = ['list', 'batch', 'task', 'dates', 'done', 'compare'].indexOf(pnl) >= 0, isPigs = ['pigs', 'pig', 'pigperf', 'piglog', 'pen'].indexOf(pnl) >= 0;
    const dd = P.r ? this.ovDevDot(u) : '';
    const tabs = (P.pen ? '' : this.ovBtn(H.icon(H.I.layers, 18) + 'Batches', 'batches', isBatch)) +
      (total ? this.ovBtn(H.icon(H.I.pig, 18) + 'Pigs' + (P.pen && total < 2 ? '' : '<span style="' + H.st({ color: isPigs ? K.ink : K.muted, fontWeight: 600 }) + '">' + total + '</span>'), 'pigspanel', isPigs) : '') +
      (P.r ? this.ovBtn(H.icon(H.I.tool, 18) + 'Devices' + (dd ? H.dot(dd, 8) : ''), 'devices', pnl === 'devices') : '');
    const menu = O.pop === 'switch' ? this.ovSwitchHtml(u, P) : '';
    return this.ovCard({ left: '16px', top: '16px' }, (P.levels.length > 1 ? this.ovSq(H.I.back, 'up', 'Up one level') : '') + name + '<i style="' + H.st({ width: '1px', height: '24px', background: K.line, margin: '0 6px', flexShrink: 0 }) + '"></i>' + tabs + menu, { display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' });
  }
  // click the name: the places at this level, current one ticked; ‹ on the bar is the way up
  ovSwitchHtml(u, P) {
    const H = OVH, K = H.K;
    let rows;
    if (P.cur.kind === 'pen') { const cells = (this.IP && this.IP.cell[P.r.id]) || {}; rows = Object.keys(cells).filter((c) => cells[c] && cells[c].kind).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).map((c) => { const n = this.ovPigs(P.r.id, c).reduce((q, y) => q + y[0], 0); return { label: 'Pen ' + c, a: 'gopen:' + c, on: c === P.pen, n: n + (n === 1 ? ' pig' : ' pigs'), f: this.ovFault(P.r.id, c) }; }); }
    else rows = this.ovSibs(P.cur).map((x) => { const k = this.ovPigsIn(x.rooms).reduce((q, y) => q + y[0], 0); return { label: x.label, a: x.a, on: x.id === P.cur.id, n: this.ui().vm === 'edit' ? (P.cur.kind === 'room' ? '' : x.rooms.length + (x.rooms.length === 1 ? ' room' : ' rooms')) : (k ? k + ' pigs' : 'empty'), f: x.rooms.some((y) => this.ovFault(y.id)) }; });
    return '<div data-pop="1" style="' + H.st({ position: 'absolute', left: P.levels.length > 1 ? '48px' : '8px', top: '60px', width: '280px', maxHeight: '420px', overflowY: 'auto', padding: '6px', boxSizing: 'border-box', borderRadius: '16px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 14px 32px rgba(17,21,17,.16)', zIndex: 6 }) + '">' + rows.map((r) => '<div' + H.A(r.a) + ' style="' + H.st({ display: 'flex', alignItems: 'center', gap: '8px', height: '44px', padding: '0 10px', borderRadius: '10px', background: r.on ? K.press : 'transparent', cursor: 'pointer' }) + '">' + H.t(r.label, { fontWeight: r.on ? 600 : 400 }) + (r.f ? H.dot(K.red, 8) : '') + '<span style="flex: 1;"></span>' + H.t(r.n, { color: r.on ? K.ink : K.muted }) + '<span style="' + H.st({ display: 'inline-flex', width: '16px', justifyContent: 'center' }) + '">' + (r.on ? H.icon(H.I.check, 16) : '') + '</span></div>').join('') + '</div>';
  }
  ovUp(u) {
    const P = this.ovPlace(u), lv = P.levels; if (lv.length < 2) return;
    if (P.cur.kind === 'pen') { const O = this.ovS(); this.setSel([]); if (['pig', 'pigperf', 'piglog', 'pen'].indexOf(O.panel) >= 0) this.ovSet({ panel: '', hist: [], ticks: [] }); return; }
    this.ovAct(lv[lv.length - 2].a);
  }
  // Pigs: the kinds here; one picked shows only its pens; Clear brings every pen back
  ovPigsPanel(u) {
    const H = OVH, K = H.K, P = this.ovPlace(u), ks = this.ovKinds || [], vf = u.vf && u.vf.kind === 'stage' ? u.vf.id : '', SW = ['2F3A33', '4F5D53', '718075', '93A096', 'B4BFB6', 'D3DBD4'];
    return H.head('Pigs', P.name, '') + H.sec('Show on the farm', vf ? '<span' + H.A('kindall') + ' style="' + H.st({ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }) + '">Clear</span>' : '', 20) +
      H.card(ks.map((x, j) => { const id = this.ovKindId(x[1]), on = vf === id; return '<div' + H.A('kind:' + id) + ' style="' + H.st({ display: 'flex', alignItems: 'center', gap: '10px', height: '44px', padding: '0 10px', borderRadius: '10px', background: on ? K.press : 'transparent', cursor: 'pointer' }) + '"><i style="' + H.st({ width: '10px', height: '10px', borderRadius: '3px', background: '#' + SW[Math.min(j, 5)], flexShrink: 0 }) + '"></i>' + H.t(x[1].charAt(0).toUpperCase() + x[1].slice(1), { flex: 1, fontWeight: on ? 600 : 400 }) + H.t(String(x[0]), { fontWeight: 600 }) + '<span style="' + H.st({ display: 'inline-flex', width: '16px', justifyContent: 'center' }) + '">' + (on ? H.icon(H.I.check, 16) : '') + '</span></div>'; }).join(''), { pad: '6px' });
  }
  // Devices: the room's readings first, then its equipment; a tile opens its card in the panel
  ovDevPanel(O, u) {
    const E = Object.assign(this.ovEqCtx(u), O.eqs || {});
    const pg = this.ovDevPage(O, E) || this.ovDevPage2(O, E); if (pg != null) return pg;
    if (O.dev === 'fan') return OVP2.fan(E);
    if (O.dev === 'lamps') return OVP2.lamps(E);
    if (O.dev === 'floor') return OVP2.floor(E);
    let t = OVP2.tiles(E); const i = t.indexOf('</div>'); if (t.indexOf('<div style="display: flex; justify-content: space-between; align-items: baseline; margin: 4px 4px 8px;">') === 0) t = t.slice(i + 6);
    if (O.devShow) { const a = { feed: 'devshow:feed', lamps: 'dev:lamps', floor: 'dev:floor', climate: 'devshow:climate', nh3: 'trendt:nh3', lights: 'devshow:lights', drinkers: 'devshow:drinkers' }[O.devShow]; if (a) t = t.replace('data-a="' + a + '" style="', 'data-a="' + a + '" style="box-shadow: inset 0 0 0 2px ' + OVH.K.ink + '; '); }
    return OVH.head('Devices', E.pen ? 'Pen ' + E.pen : E.room, '') + '<div style="margin-top: 16px;">' + t + '</div>';
  }
  // 3D: the camera tools, bottom left, opening upward
  ovViewHtml(O, u, ed) {
    const H = OVH, K = H.K, open = O.pop === 'view';
    const btn = this.ovCard({ left: '16px', bottom: '16px' }, this.ovBtn(H.icon('M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z M4 7.5 12 12l8-4.5 M12 12v9', 18) + (u.plan ? 'Plan' : '3D') + H.icon('m6 15 6-6 6 6', 14, { color: K.muted }), 'viewmenu', open, { fontWeight: 600, padding: '0 12px' }));
    if (!open) return btn;
    const seg = '<div style="' + H.st({ display: 'flex', padding: '3px', borderRadius: '12px', background: K.tint }) + '">' + [['3D', 'toAngle', !u.plan], ['Plan', 'toPlan', !!u.plan]].map((x) => '<button type="button"' + H.A('vw:' + x[1]) + ' style="' + H.st({ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', borderRadius: '10px', border: 0, background: x[2] ? '#FFFFFF' : 'transparent', boxShadow: x[2] ? '0 1px 2px rgba(17,21,17,.08)' : 'none', fontSize: '14px', fontWeight: x[2] ? 600 : 500, color: K.ink, cursor: 'pointer', fontFamily: 'inherit' }) + '">' + x[0] + '</button>').join('') + '</div>';
    const line = (l, btns) => '<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '6px', height: '48px' }) + '">' + H.t(l, { flex: 1, color: K.muted, fontSize: '13px' }) + btns + '</div>';
    const I = { rl: 'M4 12a8 8 0 1 0 2.4-5.7 M4 4v4.5h4.5', rr: 'M20 12a8 8 0 1 1-2.4-5.7 M20 4v4.5h-4.5', fit: 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5', moon: 'M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z', edit: 'M4 20h4L19 9l-4-4L4 16v4Z M13.5 6.5l4 4' };
    const menu = '<div data-pop="1" style="' + H.st({ position: 'absolute', left: '16px', bottom: '80px', width: '272px', padding: '12px', boxSizing: 'border-box', borderRadius: '16px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 14px 32px rgba(17,21,17,.16)', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", zIndex: 6 }) + '">' + seg + '<div style="margin-top: 6px;">' +
      line('Rotate', this.ovSq(I.rl, 'vw:turnLeft', 'Turn left') + this.ovSq(I.rr, 'vw:turnRight', 'Turn right')) + line('Zoom', this.ovSq(H.I.minus, 'vw:zoomOut', 'Zoom out') + this.ovSq(H.I.plus, 'vw:zoomIn', 'Zoom in')) + line('Fit to view', this.ovSq(I.fit, 'vw:fit', 'Fit to the screen')) + line('Night', this.ovSq(I.moon, 'vw:toNight', 'Night')) +
      '</div>' + (ed ? '' : '<div style="' + H.st({ height: '1px', background: K.line, margin: '6px 0' }) + '"></div>' + this.ovBtn(H.icon(I.edit, 18) + 'Edit layout', 'vw:modeToggle', false, { width: '100%', justifyContent: 'flex-start', padding: '0 4px' })) + '</div>';
    return btn + menu;
  }
  // what is picked, as the actions will count it: the pigs, and how many pens they come from
  ovPickCount(O, u) {
    if (O.selecting) {
      const codes = O.picked || [], roomId = u.roomId; if (!codes.length || !roomId) return null;
      const ks = {}; codes.forEach((c) => this.ovPigs(roomId, c).forEach((x) => { ks[x[1].replace(/s$/, '')] = (ks[x[1].replace(/s$/, '')] || 0) + x[0]; }));
      const n = Object.keys(ks).reduce((a, k) => a + ks[k], 0), one = Object.keys(ks).length === 1 ? Object.keys(ks)[0] : 'pig';
      return [n + ' ' + (n === 1 ? one : one + 's'), 'from ' + codes.length + (codes.length === 1 ? ' pen' : ' pens')];
    }
    const n = (O.ticks || []).length; return n ? [n + (n === 1 ? ' pig' : ' pigs'), 'from 1 pen'] : null;
  }
  ovActsHtml(O, u) {
    const H = OVH, K = H.K, c = this.ovPickCount(O, u), off = !c;
    const ACT = [[H.I.syringe, 'Treatment'], [H.I.shield, 'Vaccination'], [H.I.flask, 'Sampling'], [H.I.move, 'Move'], [H.I.feeder, 'Feed'], [H.I.note, 'Note'], [H.I.out, 'Culling']];
    const W = (this.ovEl && this.ovEl.clientWidth) || 1360, avail = W - 32 - 16 - 150 - 130 - 24, wOf = (l) => l.length * 7.6 + 46;
    let shown = ACT, arrows = false;
    if (ACT.reduce((a, x) => a + wOf(x[1]), 0) > avail) {
      arrows = true; const off0 = ((O.actOff || 0) % ACT.length + ACT.length) % ACT.length; let room = avail - 88; shown = [];
      for (let k = 0; k < ACT.length; k++) { const x = ACT[(off0 + k) % ACT.length]; if (wOf(x[1]) > room) break; room -= wOf(x[1]); shown.push(x); }
    }
    const tab = (x) => this.ovBtn(H.icon(x[0], 18) + H.esc(x[1]), off ? 'noop' : 'act:' + x[1], false, { color: off ? K.faint : K.ink, cursor: off ? 'default' : 'pointer' });
    const arw = (d, a) => '<button type="button"' + H.A(a) + ' style="' + H.st({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '999px', border: 0, background: K.tint, color: K.ink, cursor: 'pointer', padding: 0, flexShrink: 0 }) + '">' + H.icon(d, 16) + '</button>';
    const vl = '<i style="' + H.st({ width: '1px', height: '24px', background: K.line, margin: '0 6px', flexShrink: 0 }) + '"></i>';
    const head = '<span style="' + H.st({ display: 'inline-flex', flexDirection: 'column', padding: '0 12px 0 8px', minWidth: '104px' }) + '">' + (c ? H.t(c[0], { fontSize: '15px', fontWeight: 600 }) + H.sm(c[1]) : H.t('Pick pens', { color: K.muted }) + H.sm('nothing picked yet')) + '</span>';
    const mid = '<span style="' + H.st({ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '2px', justifyContent: arrows ? 'space-between' : 'flex-start' }) + '">' + (arrows ? arw(H.I.back, 'actstep:-1') : '') + shown.map(tab).join('') + (arrows ? arw(H.I.chev, 'actstep:1') : '') + '</span>';
    return this.ovCard({ left: '16px', right: '16px', bottom: '16px' }, head + vl + mid + vl + this.ovBtn(H.icon(H.I.x, 18) + 'Cancel', 'selcancel', false, { background: K.tint, fontWeight: 600, padding: '0 14px' }), { display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' });
  }
  ovAct3(k, v, h, at) {
    const O = this.ovS(), u = this.ui();
    if (k === 'up') { this.ovSet({ pop: '' }); this.ovUp(u); return true; }
    if (k === 'switch') { this.ovSet({ pop: O.pop === 'switch' ? '' : 'switch' }); return true; }
    if (k === 'gopen') { this.ovSet({ pop: '', ticks: [] }); this.setSel([v]); return true; }
    if (k === 'pigspanel') {
      const P = this.ovPlace(u);
      if (P.pen) { if (['pig', 'pigperf', 'piglog', 'pen'].indexOf(O.panel) >= 0) this.ovSet({ panel: '', hist: [] }); else { this.ovPsel = ''; this.ovPicked(u); this.ovPaint(); } return true; }
      if (O.panel === 'pigs') { this.ovAct('close'); return true; }
      if (u.bv) this.closeBatch(); this.ovSet({ panel: 'pigs', hist: [], pop: '' }); return true;
    }
    if (k === 'devshow') { this.ovSet({ dev: v, devShow: v }); return true; }
    if (k === 'cam' && O.panel === 'devices') { this.ovSet({ dev: 'cam:' + (+v || 0), devShow: '', pop: '' }); try { this.put({ icam: { kind: 'room', i: +v || 0 } }); this.syncCamVis(); this.reframe(600); } catch (e) { /* ignore */ } return true; }
    if (k === 'dev') { O.devShow = v === 'lamp1' ? 'lamps' : v; return false; }
    if (k === 'devback') { O.devShow = ''; if (this.ui().icam) { this.put({ icam: null }); this.syncCamVis(); } return false; }
    if (k === 'trendt' && O.panel === 'devices') { this.ovSet({ dev: 'r:' + v, devShow: v === 'nh3' ? 'nh3' : '', pop: '' }); return true; }
    if (k === 'devices' || k === 'equip') { if (O.panel === 'devices') { this.ovSet({ panel: '', dev: '', pop: '', devShow: '' }); return true; } if (u.bv) this.closeBatch(); this.ovSet({ panel: 'devices', dev: '', hist: [], pop: '' }); return true; }
    if (k === 'popclose' && O.panel === 'devices') { if (this.ui().icam) { this.put({ icam: null }); this.syncCamVis(); } this.ovSet({ panel: '', dev: '', pop: '', devShow: '' }); return true; }
    if (k === 'kind') { const vf = u.vf && u.vf.kind === 'stage' ? u.vf.id : ''; if (vf === v) { this.put({ vf: null }); this.repaintBv(); this.ovPaint(); } else { this.locationFilter('stage', v); this.ovPaint(); } return true; }
    if (k === 'viewmenu') { this.ovSet({ pop: O.pop === 'view' ? '' : 'view' }); return true; }
    if (k === 'vw') { const R = this.ovVals, f = R && R[v]; if (v === 'modeToggle') this.ovSet({ pop: '' }); if (typeof f === 'function') { try { f({ preventDefault() {}, stopPropagation() {}, currentTarget: h, target: h }); } catch (e) { /* ignore */ } } setTimeout(() => this.ovPaint(), 30); return true; }
    if (k === 'select') { if (O.selecting) { this.ovAct('selcancel'); return true; } const cur = ['pig', 'pen', 'pigperf', 'piglog'].indexOf(O.panel) >= 0 && (u.psel || []).length === 1 ? u.psel.slice() : []; if (cur.length) { O.panel = ''; O.hist = []; } O.ticks = []; this.ovPlanIn(); this.ovPsel = cur.join(','); this.setSel(cur); this.ovSet({ selecting: true, picked: cur.slice(), pop: '', actOff: 0 }); return true; }
    if (k === 'selcancel') { const was = O.selecting; this.ovSet({ selecting: false, picked: [], ticks: [], actOff: 0 }); if (was) { this.setSel([]); this.ovPlanOut(); } return true; }
    if (k === 'actstep') { this.ovSet({ actOff: (O.actOff || 0) + (+v || 1) }); return true; }
    if (k === 'act') { const c = this.ovPickCount(O, u); if (this.say) this.say(v + (c ? ' for ' + c[0] : '') + ' (preview: nothing is sent)'); this.ovAct('selcancel'); return true; }
    if (k === 'tick') { const t = (O.ticks || []).slice(), i = t.indexOf(v); if (i >= 0) t.splice(i, 1); else t.push(v); this.ovSet({ ticks: t }); return true; }
    return false;
  }
  // a pen picked on the farm: her card or the pen's list; in select mode (or picking for a device) a pen toggles in the pick
  ovPicked(u) {
    const O = this.ovS(), ps = u.psel || [];
    if (O.picking || O.selecting) {
      O.picked = O.picked || [];
      const last = ps[ps.length - 1];
      if (last && ps.length === 1) { const i = O.picked.indexOf(last); if (i >= 0) O.picked.splice(i, 1); else O.picked.push(last); this.ovPsel = O.picked.join(','); setTimeout(() => this.setSel(O.picked.slice()), 0); this.ovPaint(); }
      return;
    }
    if (O.showing) return;
    if (ps.length !== 1 || u.view !== 'room') { if (['pig', 'pigperf', 'piglog', 'pen'].indexOf(O.panel) >= 0 && !ps.length) { O.panel = ''; O.hist = []; O.ticks = []; } return; }
    const code = ps[0], cell = ((this.IP && this.IP.cell[u.roomId]) || {})[code] || {};
    if (!cell.kind) return;
    if (O.panel === 'compare') { const P = this.ovPigData(u.roomId, code); O.her = code; O.herTag = P.tag; return; }
    const group = cell.kind === 'weaners' || cell.kind === 'gilts' || (cell.n || 1) > 1;
    if (O.panel && ['pig', 'pigperf', 'piglog', 'pen', 'pigs', 'devices'].indexOf(O.panel) < 0) this.ovPush();
    if (!O.pig || O.pig.code !== code || O.pig.roomId !== u.roomId) O.ticks = [];
    O.pig = { roomId: u.roomId, code: code };
    O.panel = group ? 'pen' : 'pig';
  }
  ovPanel3(p, O, u) {
    if (p === 'pigs') return this.ovPigsPanel(u);
    if (p === 'devices') return this.ovDevPanel(O, u);
    if (p === 'pen') {
      const g = O.pig || { roomId: 'n1', code: 'B7' }, ticks = O.ticks || [], K = OVH.K;
      const box = (on) => '<span style="' + OVH.st({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, boxSizing: 'border-box', border: on ? '0' : '1.5px solid #B9C1B5', background: on ? K.ink : '#FFFFFF', color: '#FFFFFF' }) + '">' + (on ? OVH.icon(OVH.I.check, 14) : '') + '</span>';
      return OVP2.pen(this.ovPenData(g.roomId, g.code)).replace(/<div data-a="pigtag:(\d+)" style="display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 16px; border-top: ([^;]+); cursor: pointer;">/g, (m, id, bt) => { const on = ticks.indexOf(id) >= 0; return '<div data-a="pigtag:' + id + '" style="display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 16px; border-top: ' + bt + '; cursor: pointer; background: ' + (on ? K.press : 'transparent') + ';"><span data-a="tick:' + id + '" role="checkbox" aria-checked="' + on + '" style="display: inline-flex; padding: 12px; margin: -12px;">' + box(on) + '</span>'; });
    }
    return null;
  }
  ovPanelHtml(O, u) {
    const p = O.panel, x = this.ovPanel3(p, O, u);
    if (x != null) return x;
    if (p === 'list') return this.ovListHtml();
    if (p === 'batch') return this.ovBatchHtml(O.batchId);
    if (p === 'task') return this.ovTaskHtml(O.batchId || '32', O.taskId, O);
    if (p === 'dates') return this.ovDatesHtml(O.batchId || '32');
    if (this.ovPanel2) return this.ovPanel2(p, O, u);
    return '';
  }
  ovSide(O, u) {
    let h = '';
    if (O.her && O.panel === 'compare') h += '<section data-zone="her" style="' + OVH.st({ position: 'absolute', right: '412px', top: '16px', maxHeight: 'calc(100% - 104px)', width: '360px', boxSizing: 'border-box', padding: '16px 16px 20px', borderRadius: '22px', background: OVH.K.tint, boxShadow: '0 2px 6px rgba(17,21,17,.05), 0 16px 36px rgba(17,21,17,.12)', overflowY: 'auto', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", fontVariantNumeric: 'tabular-nums', color: OVH.K.ink, fontSize: '14px', lineHeight: '20px' }) + '">' + OVP2.her(O) + '</section>';
    if (O.showing) h += '<div style="' + OVH.st({ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '80px', display: 'flex', alignItems: 'center', gap: '10px', height: '48px', padding: '0 6px 0 14px', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 10px 26px rgba(17,21,17,.14)', pointerEvents: 'auto', whiteSpace: 'nowrap', zIndex: 5 }) + '">' + OVH.icon(OVH.I.floor, 16) + OVH.t('Lane C · 10:00 run', { fontWeight: 600 }) + OVH.mu('9 ran · 3 skipped') + '<button type="button"' + OVH.A('showdone') + ' style="' + OVH.st({ display: 'inline-flex', alignItems: 'center', height: '36px', padding: '0 14px', borderRadius: '10px', border: 0, background: OVH.K.ink, color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }) + '">Done</button></div>';
    return h;
  }
  ovEdOn(u) { return !!(u.ready && !u.err && u.vm === 'edit' && u.mode === 'saved' && !(this.props.start || '').match(/^intro/)); }
  ovPaint() {
    if (!this.ovBody) return;
    const u = this.ui();
    if (!this.ovOn(u) && this.ovEdOn(u)) { const O = this.ovS(), H = OVH, html = this.ovEdLoc(u) + this.ovViewHtml(O, u, true) + this.ovCard({ right: '16px', bottom: '16px' }, this.ovBtn(H.icon(H.I.check, 18) + 'Done', 'vw:modeToggle', false, { background: H.K.ink, color: '#FFFFFF', fontWeight: 600, padding: '0 16px' })); if (html !== this.ovLast) { this.ovBody.innerHTML = html; this.ovLast = html; } this.ovEdFit(); return; }
    if (!this.ovOn(u)) { if (this.ovLast !== '') { this.ovBody.innerHTML = ''; this.ovLast = ''; this.ovTipHide(); } return; }
    const O = this.ovS(), st0 = this.props.start || 'saved';
    if (this.ovStarted !== st0) { this.ovStarted = st0; this.ovStart(st0); }
    const ps = (u.psel || []).join(',');
    if (ps !== this.ovPsel) { this.ovPsel = ps; this.ovPicked(u); }
    try { this.ovDevApply(u); } catch (e) { console.warn('ovDev', e); }
    const H = OVH, K = H.K;
    // the panel's own header stays put while its body scrolls
    let panel = O.panel ? this.ovPanelHtml(O, u) : '';
    panel = panel.replace('display: flex; align-items: center; gap: 12px; min-height: 44px;', 'display: flex; align-items: center; gap: 12px; min-height: 44px; position: sticky; top: -16px; z-index: 3; background: ' + K.tint + '; margin: -16px -16px 0; padding: 16px 16px 10px;');
    const acting = O.selecting || (O.panel === 'pen' && (O.ticks || []).length > 0);
    const bottom = O.picking ? this.ovCard({ left: '16px', right: '16px', bottom: '16px' }, this.ovBarCtl(O), { display: 'flex', alignItems: 'center', gap: '6px', height: '60px', padding: '0 8px', whiteSpace: 'nowrap' })
      : acting ? this.ovActsHtml(O, u)
      : this.ovViewHtml(O, u) + this.ovCard({ right: '16px', bottom: '16px' }, this.ovBtn(H.icon(H.I.select, 18) + 'Select', 'select', false, { fontWeight: 600, padding: '0 12px' }));
    const html = this.ovLoc(u) +
      (panel ? '<section data-zone="panel" aria-label="Panel" style="' + H.st({ position: 'absolute', right: '16px', top: '16px', maxHeight: 'calc(100% - 104px)', width: '380px', boxSizing: 'border-box', padding: '16px 16px 20px', borderRadius: '22px', background: K.tint, boxShadow: '0 2px 6px rgba(17,21,17,.05), 0 16px 36px rgba(17,21,17,.12)', overflowY: 'auto', overflowX: 'hidden', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", fontVariantNumeric: 'tabular-nums', color: K.ink, fontSize: '14px', lineHeight: '20px' }) + '">' + panel + '</section>' : '') +
      this.ovSide(O, u) + bottom + this.ovPopHtml(O, u) + (this.ovExtra ? this.ovExtra(O, u) : '');
    if (html === this.ovLast) return;
    const pEl = this.ovBody.querySelector('[data-zone="panel"]'), keep = pEl ? pEl.scrollTop : 0, sc = {};
    this.ovBody.querySelectorAll('[data-scroll]').forEach((x) => { sc[x.getAttribute('data-scroll')] = x.scrollTop; });
    const samePanel = this.ovLastPanel === O.panel;
    this.ovBody.innerHTML = html; this.ovLast = html; this.ovLastPanel = O.panel;
    const p2 = this.ovBody.querySelector('[data-zone="panel"]'); if (p2 && samePanel) p2.scrollTop = keep;
    this.ovBody.querySelectorAll('[data-scroll]').forEach((x) => { const id = x.getAttribute('data-scroll'); if (sc[id] != null && samePanel) x.scrollTop = sc[id]; else if (x.getAttribute('data-scroll-to')) x.scrollTop = +x.getAttribute('data-scroll-to'); });
  }
  // ----- a device shown on the farm: its icon in every pen it serves, its line lit; a room device shows where it sits -----
  ovDevSpec(id, u) {
    const rid = u.roomId, dd = (this.Dv().room[rid] || { devices: [] }).devices, rm = this.rooms && this.rooms.find((x) => x.id === rid), I = OVH.I;
    const model = (kind) => dd.find((x) => x.kind === kind);
    const lane = (L) => rm ? rm.pens.filter((p) => String(p.code).charAt(0) === L).map((p) => p.code) : [];
    if (id === 'feed') { const m = model('feeder'); return m ? { line: m.id, room: m.id } : { pens: lane('C').slice(0, 12), icon: I.feeder, draw: true }; }
    if (id === 'lamps') { const m = model('heat'); return m ? { line: m.id, room: m.id } : { pens: lane('A'), icon: I.lamp, draw: true }; }
    if (id === 'floor') return { pens: lane('C').slice(0, 12), icon: I.floor, draw: true };
    if (id === 'temp') return { spot: 'far', icon: I.temp };
    if (id === 'lights') return { spot: 'mid', icon: I.lamp };
    if (id === 'drinkers') return { pens: lane('B'), icon: I.water, draw: true };
    if (id === 'climate') { const m = model('climate'); return m ? { room: m.id } : null; }
    if (id === 'nh3') { const m = model('nh3'); return m ? { room: m.id } : null; }
    return null;
  }
  ovDevWant(L) { const sp = this.ovDevCur; return !!sp && !!sp.room && L.key === 'dev:' + this.ui().roomId + ':' + sp.room; }
  ovDevApply(u) {
    const O = this.ovS(), show = O.devShow || ({ floor: 'floor', lamps: 'lamps', feed: 'feed', climate: 'climate', 'r:nh3': 'nh3', 'r:temp': 'temp', 'r:hum': 'temp', lights: 'lights', drinkers: 'drinkers' })[O.dev] || '', key = (O.panel === 'devices' && show && u.view === 'room' ? u.roomId + ':' + show : '');
    if (key === (this.ovDevKey || '')) return;
    this.ovDevKey = key;
    this.labels.forEach((L, k) => { if (L.kind === 'odev') { L.el.remove(); this.labels.delete(k); } });
    (this.ovDevMs || []).forEach((m) => { if (m.parent) m.parent.remove(m); }); this.ovDevMs = [];
    this.ovDevCur = key ? this.ovDevSpec(show, u) : null;
    const sp = this.ovDevCur, rm = sp && this.rooms.find((x) => x.id === u.roomId);
    if (sp && rm && sp.spot && rm.pens.length) { const xs = rm.pens.map((p) => p.x), zs = rm.pens.map((p) => p.z), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2; this.label('odev:' + rm.id + ':spot', 'odev', sp.icon, sp.spot === 'mid' ? cx : Math.max(...xs) + 1.6, this.Y.YF + (sp.spot === 'mid' ? 2.4 : 1.4), sp.spot === 'mid' ? cz : Math.min(...zs) - 0.6, { rm: rm, roomId: rm.id }); }
    if (sp && rm && sp.pens) {
      const ps = sp.pens.map((c) => this.penByCode(rm, c)).filter(Boolean);
      if (ps.length) { const q0 = ps.slice().sort((a, b) => b.z - a.z)[0]; this.label('odev:' + rm.id + ':head', 'odev', sp.icon, q0.x + q0.sx / 2 + 0.35, this.Y.YF + 0.2, q0.z + q0.sz / 2 + 0.6, { rm: rm, roomId: rm.id }); }
      // a lane-bound device with no line of its own: one dark line through the pens it serves, row by row
      if (sp.draw && ps.length && this.mat.devLineOn) {
        const rows = {}; ps.forEach((p) => { const r = String(p.code).charAt(0); (rows[r] = rows[r] || []).push(p); });
        const bar = (x, z, sx, sz) => { const m = new this.T.Mesh(this.unitBox, this.mat.devLineOn); m.scale.set(sx, 0.012, sz); m.position.set(x, this.Y.YF + 0.012, z); m.renderOrder = 3; rm.g.add(m); this.ovDevMs.push(m); };
        Object.keys(rows).forEach((r) => { const q = rows[r], sx = q[0].sx, xe = q[0].x + sx / 2 + 0.35, z0 = Math.min(...q.map((p) => p.z)), z1 = Math.max(...q.map((p) => p.z));
          bar(xe, (z0 + z1) / 2 + 0.3, 0.07, z1 - z0 + 0.67); q.forEach((p) => bar(p.x + sx / 2 + 0.175, p.z, 0.35, 0.05)); });
      }
    }
    this.syncDevLines(); this.dirty = true;
    if (key && sp && (sp.spot || (sp.room && !sp.line))) this.reframe(600);
  }
  ovDevLines() {
    const sp = this.ovDevCur, u = this.ui(), rm = sp && sp.line && this.rooms && this.rooms.find((x) => x.id === u.roomId);
    if (rm && rm.devLines && rm.devLines[sp.line]) rm.devLines[sp.line].forEach((m) => { m.visible = true; m.material = this.mat.devLineOn; });
  }
  // ----- a device's own page in the Devices panel: readings with their trend; the climate controller; the feed line -----
  ovDevPage(O, E) {
    const H = OVH, K = H.K, d = O.dev, room = E.room;
    const page = (title, sub, body) => H.head(title, sub, 'devback', { close: 'popclose' }) + body;
    const trend = (kind) => H.card(this.ovTrend(kind).replace('padding: 6px 14px 10px;', 'padding: 0;'), { pad: '14px 16px' });
    const facts = (rows) => H.card(rows.map((r, i) => H.row(H.mu(r[0], { fontSize: '14px' }), H.t(r[1], Object.assign({ fontWeight: 600 }, r[2] || {})), !i)).join(''), { pad: '0 16px' });
    if (d === 'r:temp') return page('Temperature', room + ' · sensor at the far wall', '<div style="margin-top: 16px;">' + trend('temp') + '</div>' + H.sec('This sensor') + facts([['Range', '18 – 24 °C'], ['Today', '20.4 – 23.6 °C'], ['Reading every', '5 min']]));
    if (d === 'r:hum') return page('Humidity', room + ' · sensor at the far wall', '<div style="margin-top: 16px;">' + trend('hum') + '</div>' + H.sec('This sensor') + facts([['Range', '50 – 75 %'], ['Today', '58 – 66 %'], ['Reading every', '5 min']]));
    if (d === 'r:nh3') return page('Ammonia', room + ' · sensor on the right wall', '<div style="margin-top: 16px;">' + trend('nh3') + '</div>' + H.sec('This sensor') + facts([['Limit', '8 ppm'], ['Above it for', '2 h', { color: K.amber }], ['Reading every', '5 min']]));
    if (d === 'climate') return page('Climate', room + ' · controller on the back wall', H.sec('Now', '', 18) + '<div style="' + H.st({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }) + '">' + H.kpi('Set to', '22', '°C', '', 'Auto') + H.kpi('Room', '22.4', '°C', '', 'in range') + '</div>' + '<div style="height: 8px;"></div>' + trend('temp') + '<div style="height: 8px;"></div>' + trend('hum'));
    if (d === 'feed') return page('Feed line', room + ' · serves 12 pens on lane C', '<div style="margin-top: 16px;">' + H.card('<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '10px' }) + '">' + H.dot(K.red, 10) + H.t('Stopped', { fontSize: '17px', fontWeight: 600, color: K.red }) + '<span style="margin-left: auto;">' + H.mu('since 09:40') + '</span></div><div style="margin-top: 6px;">' + H.mu('Motor fault · the 10:00 feed did not run', { whiteSpace: 'normal' }) + '</div>', { pad: '14px 16px' }) + '</div>' + H.sec('Feeds today') + facts([['06:00', 'Ran · 12 pens'], ['10:00', 'Missed', { color: K.red }], ['14:00', 'Next']]));
    return null;
  }
  // ----- more device pages: the cameras (the feed sits in the panel), lights, drinkers -----
  ovDevPage2(O, E) {
    const H = OVH, d = O.dev, room = E.room;
    const page = (title, sub, body) => H.head(title, sub, 'devback', { close: 'popclose' }) + body;
    const facts = (rows) => H.card(rows.map((r, i) => H.row(H.mu(r[0], { fontSize: '14px' }), H.t(r[1], Object.assign({ fontWeight: 600 }, r[2] || {})), !i)).join(''), { pad: '0 16px' });
    const big = (v, sub) => '<div style="margin-top: 16px;">' + H.card('<div style="' + H.st({ display: 'flex', alignItems: 'baseline', gap: '8px' }) + '">' + H.t(v, { fontSize: '22px', fontWeight: 600 }) + H.mu(sub) + '</div>', { pad: '14px 16px' }) + '</div>';
    if (d === 'cam:0' || d === 'cam:1') { const one = d === 'cam:0'; return page('Camera ' + (one ? 1 : 2), room + ' · ' + (one ? 'door end' : 'far end'), '<div data-camslot="1" style="' + H.st({ marginTop: '16px', aspectRatio: '16 / 9', borderRadius: '14px', background: '#0E1411' }) + '"></div>' + H.sec('This camera') + facts([['Sees', one ? 'Lanes A–D, door half' : 'Lanes A–D, far half'], ['Recording', 'Always'], ['Kept for', '14 days']])); }
    if (d === 'lights') return page('Lights', room + ' · whole room', big('Off', 'on at 06:00') + H.sec('Schedule') + facts([['On', '06:00 – 18:00'], ['Level', '80 %']]));
    if (d === 'drinkers') return page('Drinkers', room + ' · water line on lane B', big('On', '1.6 l/min a pen') + H.sec('Today') + facts([['Water used', '2,840 l'], ['Pens served', '50']]));
    return null;
  }

  // the editor's place piece: ‹ up a level, the name switches places; it starts the tools bar
  ovEdLoc(u) {
    const H = OVH, K = H.K, O = this.ovS(), P = this.ovPlace(u), canSwitch = P.cur.kind !== 'farm' && P.cur.kind !== 'pen';
    const hgt = Math.max(56, Math.min(66, (this.barEl && this.barEl.offsetHeight) || 66));
    const name = this.ovBtn(H.t(P.name, { fontSize: '17px', lineHeight: '22px', fontWeight: 600, letterSpacing: '-.01em' }) + (canSwitch ? H.icon(H.I.down, 16, { color: K.muted }) : ''), canSwitch ? 'switch' : 'noop', O.pop === 'switch', { cursor: canSwitch ? 'pointer' : 'default' });
    return '<div data-zone="edloc" style="' + H.st({ position: 'absolute', left: '16px', top: '16px', height: hgt + 'px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '2px', padding: '0 0 0 10px', background: '#FFFFFF', border: '1px solid #E3E6E1', borderRight: 0, borderRadius: '16px 0 0 16px', boxShadow: '0 1px 2px rgba(18, 24, 21, 0.05), -4px 10px 28px rgba(18, 24, 21, 0.10)', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", color: K.ink, whiteSpace: 'nowrap', zIndex: 5 }) + '">' + (P.levels.length > 1 ? this.ovSq(H.I.back, 'up', 'Up one level') : '') + name + '<i style="' + H.st({ width: '1px', height: '28px', background: K.line, margin: '0 0 0 8px', flexShrink: 0 }) + '"></i>' + (O.pop === 'switch' ? this.ovSwitchHtml(u, P) : '') + '</div>';
  }
  ovEdFit() {
    const el = this.ovBody && this.ovBody.querySelector('[data-zone="edloc"]'); if (!el) return;
    const w = Math.round(el.getBoundingClientRect().width);
    if (w && w !== this.ovEdW) { this.ovEdW = w; if (this.barEl) { this.barEl.style.left = (16 + w) + 'px'; this.barEl.style.maxWidth = 'calc(100% - ' + (16 + w + 408) + 'px)'; } }
  }
