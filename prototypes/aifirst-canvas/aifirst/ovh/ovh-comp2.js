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
    P.facts = [['Parity', String(parity)], ['Breed', 'LY'], ['Weight', farrow ? '228' : '192', 'kg'], ['Backfat', farrow ? '17' : '13', 'mm'], ['Teats', '14'], ['Feed', farrow ? '5.8' : '2.6', 'kg / day']];
    const tags = [];
    if (cell.flag) tags.push(cell.flag.lvl === 'urgent' ? ['red', OVH.I.temp, 'Fever', 'Treat · day 2', ['Fever · Treat', [[OVH.K.red, 'Temperature', '40.1 °C', true], ['', 'Since', 'Tue 3 Nov', false, 'none'], ['', 'Treatment', 'Amoxicillin · day 2 of 5', false, 'none']]]] : ['amber', OVH.I.eye, 'Thin', 'Monitor · day 12', ['Thin · Monitor', [[OVH.K.amberBar, 'Body condition', '2 of 5', true], ['', 'Since', '24 Oct', false, 'none'], ['', 'Feed', '+10 %', false, 'none'], ['', 'Recorded by', 'G. Hansen', false, 'none']]]]);
    if (this.hs(roomId + code) % 3 === 0 || farrow) tags.push(['grey', OVH.I.note, 'Note', farrow ? 'today' : 'until 15 Sep', ['Note · Z. Min', [['', '', farrow ? 'Two piglets slow to suckle.' : 'Watch the left hind leg.', true, 'none']]]]);
    P.tags = tags.map((x) => [x[0], x[1], x[2], x[3]]);
    this.ovTips = this.ovTips || {};
    tags.forEach((x, k) => { this.ovTips['tag-' + k] = () => OVH.tip(x[4][0], x[4][1], 'Click to keep this open'); });
    this.ovTips.cycle = () => OVH.tip('Her cycle', P.cycle);
    P.tasks = P.batch === '32' ? [['Farrowing', 'green', 'Done · 12 alive', 'task:farrow'], ['Post-farrowing check', 'amber', 'Recheck', 'task:post']] : [];
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
    if (O.pop === 'trend') return box(OVP2.trend(), { left: at.x + 'px', top: (at.y + at.h + 8) + 'px' }, 292);
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
    if (k === 'trend' || k === 'trendt') { this.ovSet({ pop: O.pop === 'trend' ? '' : 'trend', popAt: at() }); return true; }
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
    const O = this.ovS(), H = OVH, i = (() => { try { return this.pigInfo(hit.rm, hit.pen); } catch (e) { return {}; } })(), code = hit.pen.code;
    if (i.empty) return H.tip(code, [['', '', 'Empty', false, 'none']]);
    const P = this.ovPigData(hit.rm.id, code);
    if (O.panel === 'compare') { const mine = 10 + (this.hs(hit.rm.id + code) % 6); return H.tip(code + ' · ' + P.tag + ' · born alive', [[H.K.green, 'Her litter', String(mine), true], ['', 'Batch average', '12.9', false, 'tick']], 'Click for her card'); }
    const rows = P.tasks.length ? [[H.K.green, 'Farrowing', 'Done · 12 alive'], [H.K.amberBar, 'Post-farrowing check', this.hs(code) % 4 === 0 ? 'Recheck' : 'Checked']] : [['', P.stage, 'day ' + P.d, true, 'none']];
    return H.tip(code + ' · ' + P.tag, rows, P.tags.length ? P.tags.map((x) => x[2]).join(' · ') : '');
  }
  ovStart2(st) {
    const L = { panel: 'list' }, B = { panel: 'batch', batchId: '32' }, D = { panel: 'dates', batchId: '32' };
    const pick = (room, code, after) => () => { if (this.ui().roomId !== room || this.ui().view !== 'room') this.goRoom(room); setTimeout(() => { this.setSel([code]); if (after) setTimeout(after, 120); }, 400); };
    const eq = (room, o) => () => { if (this.ui().roomId !== room || this.ui().view !== 'room') this.goRoom(room); setTimeout(() => { const h = this.ovBody && this.ovBody.querySelector('[data-a="equip"]'); if (h) this.ovAct('equip', h); if (o) this.ovSet(o); }, 400); };
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
      lctrend: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => { const h = this.ovBody && this.ovBody.querySelector('[data-a="trend"]'); if (h) this.ovAct('trend', h); }, 500); } },
      lcsiblings: { O: {}, after: () => { this.goRoom('fr2'); setTimeout(() => this.ovSet({ loc: 'hover', crumb: 1 }), 500); } },
      eqtiles: { O: {}, after: eq('g2') },
      eqfan: { O: {}, after: eq('g2', { dev: 'fan' }) },
      eqpick: { O: {}, after: () => { this.goRoom('fr2'); setTimeout(() => { this.ovPlanIn(); this.ovSet({ picking: true, pickWhat: 'lamps', picked: ['A3', 'A7', 'B2', 'B3'] }); this.ovPsel = 'A3,A7,B2,B3'; this.setSel(['A3', 'A7', 'B2', 'B3']); }, 400); } },
      flauto: { O: {}, after: eq('g2', { dev: 'floor' }) },
      flpinned: { O: {}, after: eq('g2', { dev: 'floor', eqs: { fpin: '10' } }) },
      flmanual: { O: {}, after: eq('g2', { dev: 'floor', eqs: { fmode: 'manual' } }) },
      flshow: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => this.ovAct('showpens'), 400); } },
    }[st] || null;
  }
