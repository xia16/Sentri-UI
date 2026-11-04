  // ----- the location card, v2: every level switchable; pigs at every level -----
  ovPlace(u) {
    const M = this.M(), r = u.view === 'room' ? this.roomById(u.roomId) : null, ps = u.psel || [];
    const pen = r && ps.length === 1 ? ps[0] : '';
    const secId = r ? (r.section || '') : (u.secId || ''), sec = secId ? this.secById(secId) : null;
    const zoneId = r ? this.zoneOfRoom(r) : (sec ? (sec.zone || u.zoneId || '') : (u.zoneId || '')), zone = zoneId ? this.zoneById(zoneId) : null;
    const levels = [{ kind: 'farm', label: M.name || 'Hillside Sow Farm', a: 'gofarm' }];
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
    let chips = kinds.slice(0, kinds.length > 3 ? 2 : 3).map((x, i) => H.lchip(i ? '' : H.I.pig, word(x))).join('');
    if (kinds.length > 3) { this.ovTips.kinds = () => H.tip(kinds.reduce((a, x) => a + x[0], 0) + ' pigs', kinds.map((x, j) => ['#' + ['2F3A33', '4F5D53', '718075', '93A096', 'B4BFB6', 'D3DBD4'][Math.min(j, 5)], x[1].charAt(0).toUpperCase() + x[1].slice(1), String(x[0])])); chips += H.lchip('', '+' + (kinds.length - 2), { tip: 'kinds' }); }
    if (P.r && !P.pen) chips += H.lchip(H.I.temp, '22.4 °C') + H.lchip(H.I.drop, '61 %') + (/gest/i.test(P.r.name) ? H.lchip(H.I.air, 'NH₃ 9.4', { bg: K.amberT, color: K.amber, a: 'trend', on: O.pop === 'trend' }) : H.lchip(H.I.air, 'NH₃ 6.8', { a: 'trend' }));
    // the crumbs (ancestors) and the name each open their siblings on hover
    const all = P.levels, curIdx = all.length - 1;
    const crumb = (lv, i) => '<span' + A(lv.kind === 'farm' ? 'gofarm' : 'crumb:' + i) + ' style="' + H.st({ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', lineHeight: '18px', padding: '1px 5px', borderRadius: '6px', color: i === O.crumb ? K.ink : K.muted, background: i === O.crumb ? K.press : 'transparent', fontWeight: i === O.crumb ? 600 : 400, whiteSpace: 'nowrap', cursor: 'pointer' }) + '">' + H.esc(lv.label) + (lv.kind !== 'farm' ? H.icon(H.I.down, 11) : '') + '</span><span style="color: #B5BDB2; font-size: 11px;">›</span>';
    const crumbsHtml = O.loc && P.crumbs.length ? '<div data-zone="crumbs" style="' + H.st({ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '6px', flexWrap: 'wrap' }) + '">' + P.crumbs.map(crumb).join('') + '</div>' : '';
    const nameHtml = '<span' + (P.cur.kind !== 'farm' && P.cur.kind !== 'pen' ? A('crumb:' + curIdx) : '') + ' style="' + H.st({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 6px', margin: '-2px -6px', borderRadius: '8px', background: O.crumb === curIdx ? K.press : 'transparent', cursor: P.cur.kind !== 'farm' && P.cur.kind !== 'pen' ? 'pointer' : 'default' }) + '">' + H.t(P.name, { fontSize: '15px', fontWeight: 600 }) + (fault ? H.dot(K.red, 8) : '') + (O.loc && P.cur.kind !== 'farm' && P.cur.kind !== 'pen' ? H.icon(H.I.down, 13) : '') + '</span>';
    let menu = '';
    const lv = O.crumb >= 0 ? all[O.crumb] : null;
    if (O.loc && lv && lv.kind !== 'farm' && lv.kind !== 'pen') {
      const sibs = this.ovSibs(lv);
      menu = '<div data-pop="1" style="' + H.st({ position: 'absolute', left: '8px', top: '100%', marginTop: '6px', width: '280px', maxHeight: '360px', overflowY: 'auto', padding: '6px 0', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 14px 32px rgba(17,21,17,.16)', zIndex: 6 }) + '"><div style="' + H.st({ padding: '4px 12px 6px', fontSize: '12px', color: K.muted }) + '">' + ({ zone: 'Zones', section: 'Sections', room: 'Rooms' }[lv.kind]) + '</div>' + sibs.map((x) => { const k = this.ovPigsIn(x.rooms).reduce((a, y) => a + y[0], 0), on = x.id === lv.id, f = x.rooms.some((y) => this.ovFault(y.id)); return '<div' + A(x.a) + ' style="' + H.st({ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 12px', fontSize: '13.5px', color: K.ink, fontWeight: on ? 600 : 400, background: on ? K.press : 'transparent', cursor: 'pointer' }) + '"><span style="flex: 1;">' + H.esc(x.label) + '</span>' + H.mu(k ? k + ' pigs' : 'empty') + (f ? H.dot(K.red, 7) : '') + (on ? H.icon(H.I.check, 14) : '') + '</div>'; }).join('') + '</div>';
    }
    return '<div data-zone="loc" style="' + H.st({ position: 'absolute', left: '16px', top: '16px', padding: '10px 12px', borderRadius: '16px', background: '#FFFFFF', boxShadow: (O.loc ? '0 0 0 1.5px ' + K.ink + ', ' : '') + '0 1px 2px rgba(17,21,17,.06), 0 10px 26px rgba(17,21,17,.14)', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", maxWidth: 'calc(100% - 580px)', minWidth: '180px' }) + '">' + crumbsHtml + '<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }) + '">' + nameHtml + chips + '</div>' + menu + '</div>';
  }
