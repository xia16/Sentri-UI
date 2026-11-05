  // ----- O2–O6: data for a pig or a pen, from the farm (tag, kind, batch, flag) plus the boards' demo -----
  ovPigData(roomId, code) {
    const rm = this.rooms && this.rooms.find((x) => x.id === roomId), p = rm ? this.penByCode(rm, code) : null, r = this.roomById(roomId);
    let i = {}; try { i = p ? this.pigInfo(rm, p) : {}; } catch (e) { i = {}; }
    const cell = ((this.IP && this.IP.cell[roomId]) || {})[code] || {};
    const farrow = /farrow/i.test((r && r.name) || ''), parity = i.parity || 3;
    const P = { code: code, room: r ? r.name : '', tag: i.tag || (/^\d+$/.test(String(i.who || '')) ? i.who : String(200000 + (this.hs(roomId + code) % 9999))), parity: parity, batch: cell.batch != null ? String(cell.batch) : '', kind: cell.kind || '' };
    P.meta = (cell.kind === 'boar' ? 'Boar' : 'Sow') + ' · ' + code + ' · ' + P.room;
    if (farrow) Object.assign(P, { stage: 'Lactating', d: 3, of: 21, headN: '14', headL: 'born alive this litter', litters: [['1st', 11, 10], ['2nd', 13, 12], ['This', 14, 12, 1]], cycle: [[OVH.K.green, 'Served', '15 Jul'], [OVH.K.green, 'Farrowed', '1 Nov'], [OVH.K.blue, 'Lactating', 'day 3', true], ['#D3D8D0', 'Wean due', '22 Nov']] });
    else Object.assign(P, { stage: 'Gestation', d: 78, of: 115, headN: '12.4', headL: 'born alive a litter', litters: [['1', 11, 10], ['2', 12, 11], ['3', 14, 12], ['4', 13, 12], ['5', 12, 11, 1]], cycle: [[OVH.K.green, 'Served', '16 Aug'], [OVH.K.blue, 'Gestation', 'day 78', true], ['#D3D8D0', 'Due', '9 Dec']] });
    if (!farrow) { const L = [[11, 10], [12, 11], [14, 12], [13, 12], [12, 11], [13, 12]].slice(0, Math.max(1, parity)); P.litters = L.map((x, k) => [String(k + 1), x[0], x[1], k === L.length - 1 ? 1 : 0]); P.headN = (L.reduce((q, x) => q + x[0], 0) / L.length).toFixed(1); }
    P.facts = [['Parity', String(parity)], ['Breed', 'LY'], ['Weight', farrow ? '228' : '192', 'kg'], ['Backfat', farrow ? '17' : '13', 'mm'], ['Teats', '14'], ['Feed', farrow ? '5.8' : '2.6', 'kg / day']];
    const tags = [];
    if (cell.flag) tags.push(cell.flag.lvl === 'urgent' ? ['red', OVH.I.temp, 'Fever', 'Treat · day 2', ['Fever · Treat', [[OVH.K.red, 'Temperature', '40.1 °C', true], ['', 'Since', 'Tue 3 Nov', false, 'none'], ['', 'Treatment', 'Amoxicillin · day 2 of 5', false, 'none']]]] : ['amber', OVH.I.eye, 'Thin', 'Monitor · day 12', ['Thin · Monitor', [[OVH.K.amberBar, 'Body condition', '2 of 5', true], ['', 'Since', '24 Oct', false, 'none'], ['', 'Feed', '+10 %', false, 'none'], ['', 'Recorded by', 'G. Hansen', false, 'none']]]]);
    if (this.hs(roomId + code) % 3 === 0 || farrow) tags.push(['grey', OVH.I.note, 'Note', farrow ? 'today' : 'until 15 Sep', ['Note · Z. Min', [['', '', farrow ? 'Two piglets slow to suckle.' : 'Watch the left hind leg.', true, 'none']]]]);
    P.tags = tags.map((x) => [x[0], x[1], x[2], x[3]]);
    this.ovTips = this.ovTips || {};
    tags.forEach((x, k) => { this.ovTips['tag-' + k] = () => x[2] === 'Note' ? OVH.tipText(x[4][0], x[4][1][0][2], x[3]) : OVH.tip(x[4][0], x[4][1], 'Click to keep this open'); });
    this.ovTips.cycle = () => OVH.tip('Her cycle', P.cycle);
    const T = this.ovPigTasks(roomId, code);
    P.npd = T.npd; P.batchName = T.batch ? T.batch.name : ''; P.tasks = T.batch ? T.tasks.map((x) => [x[0], x[1], x[2], 'task:' + T.batch.id + '/' + x[3].slice(5), x[4]]) : [];
    if (T.npd != null) P.meta = P.meta.replace(/^Sow/, 'Sow · non-productive');
    return P;
  }
  ovPenData(roomId, code) {
    const r = this.roomById(roomId), cell = ((this.IP && this.IP.cell[roomId]) || {})[code] || {}, n = cell.n || 1, h = this.hs(roomId + code);
    const tagged = Math.max(1, Math.min(n, Math.round(n * 0.55))), word = cell.kind === 'gilts' ? 'gilts' : cell.kind === 'weaners' ? 'weaners' : 'pigs';
    const list = []; for (let k = 0; k < tagged; k++) { const id = String(300000 + ((h * (k + 7)) % 699999)); list.push([id, k === 0 ? 'Fever' : k === 1 ? 'Thin' : '', k === 0 ? 'red' : 'amber']); }
    return { code: code, meta: (r ? r.name : '') + (cell.batch != null ? ' · Batch ' + cell.batch : ''), n: n, word: word, tagged: list, noId: n - tagged, batch: cell.batch != null ? String(cell.batch) : '' };
  }
  // a pen picked on the farm: her profile, or the pen's pigs; while picking pens, a tick
  ovPicked(u) {
    const O = this.ovS(), ps = u.psel || [];
    if (O.picking) {
      const last = ps[ps.length - 1];
      if (last && ps.length === 1) { const i = O.picked.indexOf(last); if (i >= 0) O.picked.splice(i, 1); else O.picked.push(last); this.ovPsel = O.picked.join(','); setTimeout(() => this.setSel(O.picked.slice()), 0); this.ovPaint(); }
      return;
    }
    if (O.showing) return;
    if (ps.length !== 1 || u.view !== 'room') { if (['pig', 'pigperf', 'piglog', 'pen'].indexOf(O.panel) >= 0 && !ps.length) { O.panel = ''; O.hist = []; } return; }
    const code = ps[0], cell = ((this.IP && this.IP.cell[u.roomId]) || {})[code] || {};
    if (!cell.kind) return;
    // in Compare a pig opens her card beside the batch
    if (O.panel === 'compare') { const P = this.ovPigData(u.roomId, code); O.her = code; O.herTag = P.tag; return; }
    const group = cell.kind === 'weaners' || cell.kind === 'gilts' || (cell.n || 1) > 1;
    if (O.panel && ['pig', 'pigperf', 'piglog', 'pen'].indexOf(O.panel) < 0) this.ovPush();
    O.pig = { roomId: u.roomId, code: code };
    O.panel = group ? 'pen' : 'pig';
  }
  ovPanel2(p, O, u) {
    if (p === 'done') return OVP2.done(O);
    if (p === 'compare') return OVP2.compare(O);
    if (p === 'pig' || p === 'pigperf' || p === 'piglog') { const g = O.pig || { roomId: 'fr2', code: 'A7' }, P = this.ovPigData(g.roomId, g.code); P.back = O.hist.length > 0; return p === 'pig' ? OVP2.pig(P) : p === 'pigperf' ? OVP2.pigperf(P) : OVP2.piglog(P); }
    if (p === 'pen') { const g = O.pig || { roomId: 'n1', code: 'B7' }; return OVP2.pen(this.ovPenData(g.roomId, g.code)); }
    return '';
  }
  ovEqCtx(u) { const r = u.view === 'room' ? this.roomById(u.roomId) : null, ps = u.psel || []; return { room: r ? r.name : '', roomId: r ? r.id : '', pen: r && ps.length === 1 ? ps[0] : '' }; }
  ovPop2(O, u, at, box) {
    if (O.pop === 'trend') return box(this.ovTrend(O.trendKind || 'nh3', u), { left: Math.max(16, Math.min(at.x, ((this.ovEl && this.ovEl.clientWidth) || 1360) - 308)) + 'px', top: (at.y + at.h + 8) + 'px' }, 292);
    if (O.pop === 'kinds') { const H = OVH, K = H.K, ks = this.ovKinds || [], vf = u.vf && u.vf.kind === 'stage' ? u.vf.id : '', SW = ['2F3A33', '4F5D53', '718075', '93A096', 'B4BFB6', 'D3DBD4']; return box('<div style="' + H.st({ padding: '4px 14px 6px', fontSize: '12px', color: K.muted }) + '">Show on the farm</div>' + ks.map((x, j) => { const id = this.ovKindId(x[1]), on = vf === id; return '<div' + H.A('kind:' + id) + ' style="' + H.st({ display: 'flex', alignItems: 'center', gap: '10px', height: '40px', padding: '0 14px', fontSize: '14px', fontWeight: on ? 600 : 400, background: on ? K.press : 'transparent', cursor: 'pointer' }) + '"><i style="' + H.st({ width: '10px', height: '10px', borderRadius: '3px', background: '#' + SW[Math.min(j, 5)] }) + '"></i><span style="flex: 1;">' + H.esc(x[1].charAt(0).toUpperCase() + x[1].slice(1)) + '</span>' + H.t(String(x[0]), { fontWeight: 600 }) + (on ? H.icon(H.I.check, 15) : '') + '</div>'; }).join('') + (vf ? '<div style="' + H.st({ height: '1px', background: K.line, margin: '6px 0' }) + '"></div><div' + H.A('kindall') + ' style="' + H.st({ display: 'flex', alignItems: 'center', height: '40px', padding: '0 14px', fontSize: '14px', cursor: 'pointer' }) + '">Show all pigs</div>' : ''), { left: at.x + 'px', top: (at.y + at.h + 8) + 'px' }, 240); }
    if (O.pop === 'eq') {
      const E = Object.assign(this.ovEqCtx(u), O.eqs || {}), inner = O.dev === 'fan' ? OVP2.fan(E) : O.dev === 'lamps' ? OVP2.lamps(E) : O.dev === 'floor' ? OVP2.floor(E) : OVP2.tiles(E);
      return '<div data-pop="1" style="' + OVH.st({ position: 'absolute', left: Math.max(16, Math.min(at.x - 12, (this.W || 1200) - 400)) + 'px', bottom: (at.bottom + 8) + 'px', width: '380px', maxHeight: 'calc(100% - 120px)', overflowY: 'auto', boxSizing: 'border-box', padding: '12px', borderRadius: '20px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 18px 40px rgba(17,21,17,.18)', pointerEvents: 'auto', zIndex: 30, fontFamily: "'Geist', system-ui, sans-serif", color: OVH.K.ink, fontVariantNumeric: 'tabular-nums' }) + '">' + inner + '</div>';
    }
    return '';
  }
  // her card beside Compare; the task pill while Plan is open for a task
  ovSide(O, u) {
    let h = '';
    if (O.her && O.panel === 'compare') h += '<section data-zone="her" style="' + OVH.st({ position: 'absolute', right: '412px', top: '72px', maxHeight: 'calc(100% - 164px)', width: '360px', boxSizing: 'border-box', padding: '16px 16px 20px', borderRadius: '22px', background: OVH.K.tint, boxShadow: '0 2px 6px rgba(17,21,17,.05), 0 16px 36px rgba(17,21,17,.12)', overflowY: 'auto', pointerEvents: 'auto', fontFamily: "'Geist', system-ui, sans-serif", fontVariantNumeric: 'tabular-nums', color: OVH.K.ink, fontSize: '14px', lineHeight: '20px' }) + '">' + OVP2.her(O) + '</section>';
    if (O.showing) h += '<div style="' + OVH.st({ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '80px', display: 'flex', alignItems: 'center', gap: '10px', height: '48px', padding: '0 6px 0 14px', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 10px 26px rgba(17,21,17,.14)', pointerEvents: 'auto', whiteSpace: 'nowrap', zIndex: 5 }) + '">' + OVH.icon(OVH.I.floor, 16) + OVH.t('Lane C · 10:00 run', { fontWeight: 600 }) + OVH.mu('9 ran · 3 skipped') + '<button type="button"' + OVH.A('showdone') + ' style="' + OVH.st({ display: 'inline-flex', alignItems: 'center', height: '36px', padding: '0 14px', borderRadius: '10px', border: 0, background: OVH.K.ink, color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }) + '">Done</button></div>';
    return h;
  }
  // Plan for a task: save the view, tilt down; the task ends → back to the view you had
  ovPlanIn() { const u = this.ui(); if (!this.ovSaved) this.ovSaved = { plan: !!u.plan }; if (!u.plan) { this.put({ plan: true }); this.reframe(450); } }
  ovPlanOut() { const s = this.ovSaved; this.ovSaved = null; if (s && !s.plan && this.ui().plan) { this.put({ plan: false }); this.reframe(450); } }
  ovBarCtl(O) {
    const B = (l, a, dark) => '<button type="button"' + OVH.A(a) + ' style="' + OVH.st({ display: 'inline-flex', alignItems: 'center', height: '44px', padding: '0 18px', borderRadius: '12px', border: 0, background: dark ? OVH.K.ink : 'transparent', color: dark ? '#FFFFFF' : OVH.K.ink, fontSize: '14px', fontWeight: dark ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit' }) + '">' + OVH.esc(l) + '</button>';
    const n = O.picked.length, name = O.pickWhat === 'floor' ? 'Moving floor · lane C' : 'Heat lamps';
    const lvl = O.pickWhat === 'floor' ? '' : '<span style="display: inline-flex; align-items: center; gap: 6px;">' + B('−', 'lvl:-5') + OVH.t((O.lvl || 75) + ' %', { fontSize: '15px', fontWeight: 600, width: '52px', display: 'inline-block', textAlign: 'center' }) + B('+', 'lvl:5') + '</span>';
    return '<span style="' + OVH.st({ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0 10px' }) + '">' + OVH.icon(O.pickWhat === 'floor' ? OVH.I.floor : OVH.I.lamp, 18) + OVH.t(name, { fontWeight: 600 }) + OVH.mu('· ' + (n ? n + (n === 1 ? ' pen' : ' pens') : 'click pens to pick them')) + '</span><span style="' + OVH.st({ width: '1px', height: '28px', background: OVH.K.line, margin: '0 4px' }) + '"></span>' + (O.pickWhat === 'floor' ? '' : '<span style="width: 140px; display: inline-block;">' + OVH.seg(['On', 'Off'], O.off ? 1 : 0, 'onoff') + '</span>') + lvl + '<span style="flex: 1;"></span>' + B('Cancel', 'pickcancel') + B(n ? (O.pickWhat === 'floor' ? 'Run ' : 'Apply to ') + n + (n === 1 ? ' pen' : ' pens') : (O.pickWhat === 'floor' ? 'Run' : 'Apply'), n ? 'pickapply' : 'noop', true);
  }
  ovAct2(k, v, h, at) {
    const O = this.ovS(), u = this.ui();
    if (k === 'compare') { this.ovPush(); if (!u.bv) this.openBatch('32'); this.put({ ovCmp: true, bvOnly: '' }); this.closeBatchTask(); this.repaintBv(); this.ovSet({ panel: 'compare', her: '', pop: '' }); return true; }
    if (k === 'herclose') { this.ovSet({ her: '' }); return true; }
    if (k === 'pigperf' || k === 'piglog') { this.ovPush(); this.ovSet({ panel: k }); return true; }
    if (k === 'pigtag') { this.ovPush(); this.ovSet({ panel: 'pig' }); return true; }
    if (k === 'trend' || k === 'trendt') { const kind = v || 'nh3'; this.ovSet({ pop: O.pop === 'trend' && O.trendKind === kind ? '' : 'trend', trendKind: kind, popAt: at() }); return true; }
    if (k === 'kinds') { this.ovSet({ pop: O.pop === 'kinds' ? '' : 'kinds', popAt: at() }); return true; }
    if (k === 'kind') { this.locationFilter('stage', v); this.ovPaint(); return true; }
    if (k === 'kindall') { this.put({ vf: null }); this.repaintBv(); this.ovSet({ pop: '' }); return true; }
    if (k === 'popclose') { this.ovSet({ pop: '', dev: '' }); return true; }
    if (k === 'devback') { this.ovSet({ dev: '', eqs: Object.assign({}, O.eqs, { fpin: null }) }); return true; }
    if (k === 'dev') { this.ovSet({ dev: v === 'lamp1' ? 'lamps' : v }); return true; }
    if (k === 'cam') { this.ovSet({ pop: '' }); try { this.put({ icam: { kind: 'room', i: +v || 0 } }); } catch (e) { /* ignore */ } return true; }
    if (k === 'fanmode') { this.ovSet({ eqs: Object.assign({}, O.eqs, { fanMode: v, fanSaved: false }) }); return true; }
    if (k === 'fanpill') { const r = h.getBoundingClientRect(), y = (window.event && window.event.clientY) || (r.top + r.height / 2), pct = Math.max(0, Math.min(100, Math.round((1 - (y - r.top) / r.height) * 20) * 5)); this.ovSet({ eqs: Object.assign({}, O.eqs, { fan: pct, fanMode: 'manual', fanSaved: false }) }); return true; }
    if (k === 'fanapply') { this.ovSet({ eqs: Object.assign({}, O.eqs, { fanSaved: true }) }); this.say && this.say('Fan set (preview: nothing is sent)'); return true; }
    if (k === 'fmode') { this.ovSet({ eqs: Object.assign({}, O.eqs, { fmode: +v === 1 ? 'manual' : 'auto', fpin: null }) }); return true; }
    if (k === 'fpin') { const cur = (O.eqs || {}).fpin; this.ovSet({ eqs: Object.assign({}, O.eqs, { fpin: String(cur) === v ? null : v }) }); return true; }
    if (k === 'floorrun') { this.ovSet({ eqs: Object.assign({}, O.eqs, { ranNow: true }) }); return true; }
    if (k === 'onoff') { this.ovSet({ off: +v === 1 }); return true; }
    if (k === 'lvl') { this.ovSet({ lvl: Math.max(0, Math.min(100, (O.lvl || 75) + (+v))) }); return true; }
    if (k === 'pick') { if (u.view !== 'room') this.goRoom(v === 'floor' ? 'g2' : 'fr2'); this.ovPlanIn(); this.setSel([]); this.ovSet({ picking: true, pickWhat: v, picked: [], pop: '', dev: '' }); return true; }
    if (k === 'pickcancel' || k === 'pickapply') { this.ovSet({ picking: false, picked: [] }); this.setSel([]); this.ovPlanOut(); return true; }
    if (k === 'showpens') { if (u.roomId !== 'g2') this.goRoom('g2'); this.ovPlanIn(); const ran = ['C1', 'C2', 'C3', 'C5', 'C6', 'C8', 'C10', 'C11', 'C12']; this.ovSet({ showing: true, pop: '', dev: '', eqs: Object.assign({}, O.eqs, { fpin: null }) }); this.ovPsel = ran.join(','); setTimeout(() => this.setSel(ran), 0); return true; }
    if (k === 'showdone') { this.ovSet({ showing: false }); this.setSel([]); this.ovPlanOut(); return true; }
    return false;
  }
  // the pen hover on the farm: the pen's tasks with their status; in Compare, her figure against the batch
  ovPenTip(hit) {
    const O = this.ovS(), H = OVH, K = H.K, code = hit.pen.code;
    let i = {}; try { i = this.pigInfo(hit.rm, hit.pen); } catch (e) { i = {}; }
    if (i.empty) return '<div style="' + H.st({ fontSize: '13px', fontWeight: 600 }) + '">' + H.esc(code) + '</div><div style="' + H.st({ fontSize: '12px', color: K.muted }) + '">Empty</div>';
    const P = this.ovPigData(hit.rm.id, code), cell = ((this.IP && this.IP.cell[hit.rm.id]) || {})[code] || {}, group = (cell.n || 1) > 1;
    const headH = '<div style="' + H.st({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '14px' }) + '">' + H.t(code + (group ? '' : ' · ' + P.tag), { fontSize: '13px', fontWeight: 600 }) + H.t(group ? cell.n + ' ' + (cell.kind || 'pigs') : 'Sow · P' + P.parity, { fontSize: '12px', color: K.muted }) + '</div>';
    if (O.panel === 'compare') { const mine = 10 + (this.hs(hit.rm.id + code) % 6); return headH + H.tip('', [[K.green, 'Her litter', String(mine), true], ['', 'Batch average', '12.9', false, 'tick']], 'Click for her card').replace(/^<div[^>]*><\/div>/, ''); }
    const line = (l, r) => '<div style="' + H.st({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: '30px', borderTop: '1px solid ' + K.line, marginTop: '6px', paddingTop: '6px' }) + '">' + H.t(l, { fontSize: '13px' }) + r + '</div>';
    let body = P.tasks.length ? P.tasks.map((x) => line(x[0], H.badge(x[1], x[2]))).join('') : line(P.npd != null ? 'Non-productive' : P.stage, H.t(P.npd != null ? P.npd + ' days' : 'day ' + P.d, { fontSize: '13px', fontWeight: 600 }));
    if (P.tags.length) body += '<div style="' + H.st({ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }) + '">' + P.tags.map((x) => H.badge(x[0] === 'grey' ? 'grey' : x[0], x[2])).join('') + '</div>';
    return headH + body;
  }
  ovStart2(st) {
    const L = { panel: 'list' }, B = { panel: 'batch', batchId: '32' }, D = { panel: 'dates', batchId: '32' };
    const pick = (room, code, after) => () => { if (this.ui().roomId !== room || this.ui().view !== 'room') this.goRoom(room); setTimeout(() => { this.setSel([code]); if (after) setTimeout(after, 120); }, 400); };
    const eq = (room, o) => () => { if (this.ui().roomId !== room || this.ui().view !== 'room') this.goRoom(room); setTimeout(() => { this.ovAct('devices'); if (o) this.ovSet(o); }, 400); };
    return {
      bxdone: { O: { panel: 'done', batchId: '32', hist: [L, B, D] }, b: '32' },
      bxcompare: { O: { panel: 'compare', batchId: '32', hist: [L, B, D, { panel: 'done' }] }, b: '32', after: () => this.put({ ovCmp: true }) },
      bxher: { O: { panel: 'compare', batchId: '32', her: 'A7', herTag: '203976', hist: [L, B, D, { panel: 'done' }] }, b: '32', after: () => this.put({ ovCmp: true }) },
      pgprofile: { O: {}, after: pick('fr2', 'A7') },
      pgflagged: { O: {}, after: pick('g2', 'B14') },
      pgperf: { O: {}, after: pick('fr2', 'A7', () => { this.ovPush(); this.ovSet({ panel: 'pigperf' }); }) },
      pglog: { O: {}, after: pick('fr2', 'A7', () => { this.ovPush(); this.ovSet({ panel: 'piglog' }); }) },
      pgpen: { O: {}, after: pick('n1', 'B7') },
      lcroom: { O: {}, after: () => this.goRoom('g2') },
      lctrend: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => { this.ovAct('devices'); setTimeout(() => { const h = this.ovBody && this.ovBody.querySelector('[data-a="trendt:nh3"]'); if (h) this.ovAct('trendt:nh3', h); }, 120); }, 500); } },
      lcsiblings: { O: {}, after: () => { this.goRoom('fr2'); setTimeout(() => this.ovSet({ pop: 'switch' }), 500); } },
      lcview: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => this.ovSet({ pop: 'view' }), 500); } },
      lcselect: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => { this.ovPlanIn(); this.ovSet({ selecting: true, picked: ['B15', 'B20', 'D40'], actOff: 0 }); this.ovPsel = 'B15,B20,D40'; this.setSel(['B15', 'B20', 'D40']); }, 400); } },
      lcticks: { O: {}, after: pick('n1', 'B7', () => { const O = this.ovS(), q = this.ovPenData('n1', 'B7'); this.ovSet({ ticks: q.tagged.slice(0, 2).map((x) => x[0]) }); }) },
      lcpigs: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => this.ovAct('pigspanel'), 500); } },
      eqtiles: { O: {}, after: eq('g2') },
      eqfan: { O: {}, after: eq('g2', { dev: 'fan' }) },
      eqpick: { O: {}, after: () => { this.goRoom('fr2'); setTimeout(() => { this.ovPlanIn(); this.ovSet({ picking: true, pickWhat: 'lamps', picked: ['A3', 'A7', 'B2', 'B3'] }); this.ovPsel = 'A3,A7,B2,B3'; this.setSel(['A3', 'A7', 'B2', 'B3']); }, 400); } },
      flauto: { O: {}, after: eq('g2', { dev: 'floor' }) },
      flpinned: { O: {}, after: eq('g2', { dev: 'floor', eqs: { fpin: '10' } }) },
      flmanual: { O: {}, after: eq('g2', { dev: 'floor', eqs: { fmode: 'manual' } }) },
      flshow: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => this.ovAct('showpens'), 400); } },
    }[st] || null;
  }

  // ----- every batch from the farm's own data: list, batch, task, dates -----
  ovCol(c) { return ({ '#A7CDAE': OVH.K.green, '#A9C2E2': OVH.K.blue, '#EBC27E': OVH.K.amberBar, '#D9D6CC': OVH.K.grey })[c] || OVH.K.grey; }
  ovDay(w) { const m = /Day (\d+)(?: of (\d+))?/.exec(w || ''); return m ? [+m[1], +(m[2] || m[1])] : [1, 1]; }
  ovParts(id, t) {
    const n = this.bvCounts(id, t.id);
    return t.states.map((x) => { const col = this.ovCol(x.col); return { id: x.id, label: x.label, n: n[x.id] || 0, col: col, skip: col === OVH.K.grey, warn: col === OVH.K.amberBar }; });
  }
  ovIsStage(t) { return !!t && (t.id === 'nurs' || t.id === 'quar'); }
  ovBatches() { const B = this.batchData(); return Object.keys(B).map((k) => B[k]).sort((a, b) => (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0)); }
  ovListHtml() {
    const H = OVH, K = H.K;
    return H.head('Batches', '', '') + '<div style="margin-top: 16px;">' + H.card(this.ovBatches().map((b, i) => { const t = (b.tasks || [])[0] || {}, d = this.ovDay(t.when); return '<div' + H.A('open:' + b.id) + ' style="' + H.st({ display: 'flex', alignItems: 'center', gap: '14px', height: '64px', padding: '0 16px', margin: '0 -16px', borderTop: i ? '1px solid ' + K.line : '0', cursor: 'pointer' }) + '">' + H.radial({ size: 30, sw: 4, parts: [[d[0], '', K.blue], [Math.max(0, d[1] - d[0]), '', K.grey, true]], total: d[1] }) + '<span style="' + H.st({ flex: 1, display: 'flex', flexDirection: 'column' }) + '">' + H.t(b.name, { fontWeight: 600, fontSize: '15px' }) + H.mu((t.title || '') + ' · day ' + d[0] + ' of ' + d[1]) + '</span>' + H.chev + '</div>'; }).join(''), { pad: '0 16px' }) + '</div>';
  }
  ovBatchHtml(id) {
    const H = OVH, K = H.K, b = this.batchData()[id];
    if (!b) return OVP.batch(this.ovS());
    this.ovTips = this.ovTips || {};
    const stageT = (b.tasks || []).find((t) => this.ovIsStage(t)), sd = stageT ? this.ovDay(stageT.when) : null;
    const tiles = (b.tasks || []).filter((t) => !this.ovIsStage(t)).map((t) => {
      const P = this.ovParts(id, t), tot = P.reduce((a, x) => a + x.n, 0) || 1, goal = P.find((x) => x.id === t.goal) || P[0], d = this.ovDay(t.when), attn = P.filter((x) => x.warn && x.n).map((x) => x.n + ' ' + x.label.toLowerCase()).join(' · ');
      this.ovTips['ring-' + id + '-' + t.id] = () => H.tip(t.title + ' · ' + tot + ' ' + (b.kind === 'growers' ? 'pens' : 'sows'), P.map((x) => [x.col, x.label, String(x.n), x.warn]), 'Click to open the task');
      return H.card('<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '14px' }) + '">' + H.radial({ size: 52, sw: 7, parts: P.map((x) => [x.n, x.label, x.col, x.skip]), total: tot, center: H.t(String(goal ? goal.n : 0), { fontSize: '14px', fontWeight: 600 }), tip: 'ring-' + id + '-' + t.id }) + '<span style="' + H.st({ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }) + '">' + H.t(t.title, { fontSize: '15px', fontWeight: 600 }) + '<span style="' + H.st({ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }) + '">' + H.mu('day ' + d[0] + (d[1] !== d[0] ? ' of ' + d[1] : '')) + (attn ? H.badge('amber', attn) : '') + '</span></span>' + H.chev + '</div>', { pad: '14px 16px', a: 'task:' + t.id });
    }).join('<div style="height: 8px;"></div>');
    const next = (b.sched || []).filter((x) => x.st === 'next').slice(0, 3);
    const nowH = tiles ? H.sec('Running now', '', 20) + tiles : H.sec('Now', '', 20) + H.card('<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '14px' }) + '">' + H.radial({ size: 52, sw: 7, parts: [[sd ? sd[0] : 1, '', K.blue], [sd ? Math.max(0, sd[1] - sd[0]) : 0, '', K.grey, true]], total: sd ? sd[1] : 1 }) + '<span style="' + H.st({ display: 'flex', flexDirection: 'column', gap: '4px' }) + '">' + H.t(stageT ? stageT.title : 'No task running', { fontSize: '15px', fontWeight: 600 }) + H.mu(sd ? 'day ' + sd[0] + ' of ' + sd[1] + ' · no task running' : '') + '</span></div>', { pad: '14px 16px' });
    return H.head(b.name, (b.sub || '').replace(/^Line \d+ · /, ''), 'back') + nowH +
      (next.length ? H.sec('Upcoming') + H.card(next.map((x, i) => H.row('<span style="display: flex; align-items: center;">' + H.t(x.d, { fontSize: '13px', color: K.muted, width: '80px', flexShrink: 0, display: 'inline-block' }) + H.t(x.t, { padding: '6px 0', whiteSpace: 'normal' }) + '</span>', H.mu(x.meta), !i)).join(''), { pad: '0 16px' }) : '') +
      '<div style="' + H.st({ display: 'flex', marginTop: '20px' }) + '">' + H.wbtn(H.I.cal, 'All dates', 'dates') + '</div>';
  }
  ovTaskHtml(id, tid, O) {
    const H = OVH, b = this.batchData()[id], t = b && this.bvTask(id, tid);
    if (!t) return OVP.task(O);
    this.ovTips = this.ovTips || {};
    const P = this.ovParts(id, t), tot = P.reduce((a, x) => a + x.n, 0) || 1, goal = P.find((x) => x.id === t.goal) || P[0], d = this.ovDay(t.when), unit = b.kind === 'growers' ? 'pens' : 'sows';
    this.ovTips['ring-task'] = () => H.tip(t.title, P.map((x) => [x.col, x.label, String(x.n), x.id === O.only]), 'Click a part → only those pens');
    return H.head(t.title, b.name + ' · day ' + d[0] + (d[1] !== d[0] ? ' of ' + d[1] : ''), 'back') +
      '<div style="' + H.st({ display: 'flex', gap: '8px', marginTop: '16px' }) + '">' + H.field(O.parity || 'All parities', 'filter', { on: O.pop === 'filter' }) + H.field('All rooms', 'noop') + '</div>' +
      H.sec('Whole-task progress', H.meta(tot + ' ' + unit)) +
      H.card('<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '20px' }) + '">' + H.radial({ size: 132, sw: 16, parts: P.map((x) => [x.n, x.label, x.col, x.skip]), total: tot, half: true, center: H.centre(String(goal ? goal.n : 0), 'of ' + tot + ' ' + (t.goalWord || '')) }) + H.legend(P, { a: 'only', only: O.only }) + '</div>') +
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
    if (!b) { const rr = this.roomById(roomId); return /gest|farrow/i.test((rr && rr.name) || '') ? {} : { npd: 8 + (this.hs(roomId + code) % 30) }; }
    return { batch: b, tasks: (b.tasks || []).filter((t) => !this.ovIsStage(t)).map((t) => { const s = this.bvState(id, roomId, code, t.id), d = this.bvStateDef(id, s, t.id) || {}; const col = this.ovCol(d.col); return [t.title, col === OVH.K.green ? 'green' : col === OVH.K.blue ? 'blue' : col === OVH.K.amberBar ? 'amber' : 'grey', d.label || '', 'task:' + t.id, (t.why || {})[s] || '']; }) };
  }

  ovKindId(word) { return ({ sows: 'sow', sow: 'sow', boars: 'boar', boar: 'boar', gilts: 'gilts', weaners: 'weaners' })[word] || word; }
  // a sensor's trend: today against its range; amber when out of it
  ovTrend(kind) {
    const H = OVH, K = H.K, T = { temp: { name: 'Temperature', unit: '°C', now: 22.4, lo: 18, hi: 24, min: 16, max: 26, v: [20.6, 20.4, 20.6, 21.6, 22.6, 23.3, 23.6, 23.1, 22.7, 22.5, 22.4, 22.4], note: 'in range all day', col: K.blue },
      hum: { name: 'Humidity', unit: '%', now: 61, lo: 50, hi: 75, min: 40, max: 85, v: [58, 60, 63, 66, 64, 62, 61, 61, 60, 61, 61, 61], note: 'in range all day', col: K.blue },
      nh3: { name: 'Ammonia', unit: 'ppm', now: 9.4, lo: 0, hi: 8, min: 0, max: 12, v: [6.2, 6.4, 6.8, 7.0, 7.6, 8.1, 8.6, 8.9, 9.1, 9.3, 9.4, 9.4], note: 'above 8 for 2 h', col: K.amberBar } }[kind] || {};
    const W = 260, Hh = 70, y = (v) => Hh - ((v - T.min) / (T.max - T.min)) * Hh, xy = T.v.map((v, i) => [(i / (T.v.length - 1)) * W, y(v)]), l = xy.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'), out = T.now > T.hi || T.now < T.lo;
    return '<div style="padding: 6px 14px 10px;"><div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '6px' }) + '">' + H.t(T.name, { fontWeight: 600 }) + '<span style="margin-left: auto; display: inline-flex; gap: 4px;">' + H.lchip('', '24 h', { on: true }) + H.lchip('', '7 d', { bg: 'transparent', color: K.muted }) + '</span></div><div style="' + H.st({ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }) + '">' + H.t(String(T.now), { fontSize: '24px', lineHeight: '30px', fontWeight: 600, color: out ? K.amber : K.ink }) + H.mu(T.unit + ' · ' + T.note) + '</div>' +
      '<svg viewBox="0 0 ' + W + ' ' + Hh + '" style="width: ' + W + 'px; height: ' + Hh + 'px; display: block; margin-top: 10px; overflow: visible;">' + (kind !== 'nh3' ? '<rect x="0" y="' + y(T.hi).toFixed(1) + '" width="' + W + '" height="' + (y(T.lo) - y(T.hi)).toFixed(1) + '" fill="#EEF4EF"></rect>' : '<line x1="0" x2="' + W + '" y1="' + y(T.hi) + '" y2="' + y(T.hi) + '" stroke="' + K.amber + '" stroke-opacity=".6" stroke-dasharray="4 3"></line>') + '<path d="M0 ' + Hh + ' L' + l + ' L' + W + ' ' + Hh + ' Z" fill="' + T.col + '" fill-opacity=".16"></path><path d="M' + l + '" fill="none" stroke="' + T.col + '" stroke-width="2"></path><circle cx="' + W + '" cy="' + xy[xy.length - 1][1] + '" r="3.5" fill="' + T.col + '"></circle></svg>' +
      '<div style="' + H.st({ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }) + '">' + H.sm('00:00') + H.sm(kind === 'nh3' ? 'limit ' + T.hi : 'range ' + T.lo + '–' + T.hi + ' ' + T.unit) + H.sm('now') + '</div></div>';
  }
