  // ===================== open tasks in the Farm view: tabs on the card, one active, collapse to step out, × to close =====================
  tkC() { return { done: '#d5e8cc', due: '#c1ddfd', skip: '#fede82', dm: '#5fae6e', pm: '#6f9fdc', lm: '#e8b33c', handle: '#dce0d4', fade: '#F1F0EA' }; }
  tkDefs() {
    const n1 = (c) => { const L = c[0], k = +c.slice(1); if (L === 'A' || k <= 10) return 'done'; if (k === 11) return 'due'; if (k === 12) return 'skip'; return 'due'; };
    const n2 = (c) => { const L = c[0], k = +c.slice(1); if (L === 'A' && k <= 8) return 'done'; return 'due'; };
    return {
      rx09: { kind: 'rx', tab: 'RX-25G009', title: 'Treatment RX-25G009', sub: '4 sows · Batch 32 · Gestation 2', chips: ['Running', 'Lameness', 'Fever'], go: { room: 'g2' }, rooms: ['g2'],
        state: (rid, c) => rid === 'g2' ? ({ B15: 'done', B20: 'done', D40: 'due', D41: 'skip' })[c] : undefined,
        num: [5, 12, 'doses given'], dates: '5 – 7 Nov', week: '2 Nov', days: [null, null, null, { r: [3, 1, 0, 4], tip: ['Thu 5 Nov · Dose 1', '3 given · 1 skipped'] }, { r: [2, 0, 2, 4], tip: ['Fri 6 Nov · Dose 2', '2 given · 2 due'] }, { r: [0, 0, 0, 4], tip: ['Sat 7 Nov · Dose 3', 'Planned'] }, null],
        facts: [['Medicine', 'Amoxicillin 15% LA'], ['Dose', '15 mL a sow', 'Intramuscular, neck'], ['Schedule', '3 doses, every 24 h'], ['Withdrawal', '14 days', 'Ends 21 Nov, if the last dose is Sat'], ['Prescribed', 'Vet', 'Wed 4 Nov 16:10'], ['Note', 'Keep D40 and D41 on straw']],
        pig: { D41: [['skip', 'Dose 1 · Skipped', 'Thu 08:40 · could not stand · G.H'], ['due', 'Dose 2 · Due', 'Today 08:30'], ['plan', 'Dose 3 · Planned', 'Sat 08:30']], D40: [['done', 'Dose 1 · Given', 'Thu 08:35 · G.H'], ['due', 'Dose 2 · Due', 'Today 08:30'], ['plan', 'Dose 3 · Planned', 'Sat 08:30']], B15: [['done', 'Dose 1 · Given', 'Thu 08:20 · G.H'], ['done', 'Dose 2 · Given', 'Today 08:12 · G.H'], ['plan', 'Dose 3 · Planned', 'Sat 08:30']], B20: [['done', 'Dose 1 · Given', 'Thu 08:24 · G.H'], ['done', 'Dose 2 · Given', 'Today 08:15 · G.H'], ['plan', 'Dose 3 · Planned', 'Sat 08:30']] },
        pigDays: [3, 4, 5], withdraw: 'Withdrawal ends 21 Nov',
        hover: { D41: 'Dose 2 due 08:30', D40: 'Dose 2 due 08:30', B15: 'Dose 2 given 08:12', B20: 'Dose 2 given 08:15' } },
      prrs: { kind: 'vax', tab: 'PRRS vaccine', title: 'PRRS vaccine', sub: 'Batch 30 and 31 · Nursery 1 and 2', chips: ['Running'], go: { sec: true }, rooms: ['n1', 'n2'],
        state: (rid, c) => rid === 'n1' ? n1(c) : rid === 'n2' ? n2(c) : undefined,
        num: [44, 104, 'pens done'], dates: 'Fri 6 Nov', week: '2 Nov', days: [null, null, null, null, { r: [44, 1, 59, 104], tip: ['Fri 6 Nov', '44 done · 1 skipped · 59 due'] }, null, null],
        roomsLeft: [['n1', 'Nursery 1', '16 left'], ['n2', 'Nursery 2', '44 left']],
        facts: [['Vaccine', 'PRRS MLV'], ['Dose', '2 mL a weaner', 'Intramuscular'], ['Schedule', 'Once'], ['Withdrawal', '21 days'], ['Planned', 'Vet', 'Mon 2 Nov']],
        group: { B11: [6, 0, 3, 9], B12: [7, 2, 0, 9], A9: [5, 0, 4, 9] } }
    };
  }
  tkTask() { const O = this.ovS(); return O.tk ? this.tkDefs()[O.tk] : null; }
  tkLive() { const O = this.ovS(); return !!(O.tk && O.tkOpen && this.ovOn && this.ovOn()); }
  tkCol(rid, code) { if (!this.tkLive()) return undefined; const T = this.tkTask(), s = T.state(rid, code), C = this.tkC(); if (s) return T.kind === 'rx' ? ({ done: C.dm, due: C.pm, skip: C.lm })[s] : C[s]; return T.rooms.indexOf(rid) >= 0 || rid === this.ui().roomId ? C.fade : undefined; }
  tkSave() { const O = this.ovS(); try { window.__sentriTasks = { tks: (O.tks || []).slice(), tk: O.tk || '', open: !!O.tkOpen }; } catch (e) { /* ignore */ } }
  tkRestore() { const W = window.__sentriTasks, O = this.ovS(); if (!W || !W.tks || !W.tks.length || (O.tks || []).length) return false; O.tks = W.tks.slice(); O.tk = W.tk; if (W.tk && W.open) this.tkActivate(W.tk); else { O.tkOpen = false; this.ovPaint(); } return true; }
  // a page or a chat card asks for a task: start 'task:<id>' (anything after @ is ignored) or the window event sentri:task {id}
  tkHook() { if (this.tkEvt) return; this.tkEvt = (e) => { const d = (e && e.detail) || {}; if (d.id && this.alive !== false) this.tkOpen(d.id); }; window.addEventListener('sentri:task', this.tkEvt); }
  tkUnhook() { if (this.tkEvt) window.removeEventListener('sentri:task', this.tkEvt); this.tkEvt = null; }
  tkCodes(T) { return T && T.kind === 'rx' ? Object.keys(T.pig || {}) : []; }
  tkFocus(codes) { const O = this.ovS(), T = this.tkTask(); O.focus = T && T.go.room && codes.length ? { roomId: T.go.room, codes: codes } : null; this.dirty = true; }
  // pen tags while a single-pig task is live: only its pens, in the status fill with dark ink
  tkLabel(L, roomView, u) { if (!this.tkLive() || L.kind !== 'pen' || !roomView || L.roomId !== u.roomId) return null; const T = this.tkTask(); if (T.kind !== 'rx' || T.rooms.indexOf(L.roomId) < 0) return null; return !!T.state(L.roomId, L.pen.code); }
  tkTagStyle(L) { const T = this.tkLive() ? this.tkTask() : null, s = T && T.kind === 'rx' && L.pen ? T.state(L.roomId, L.pen.code) : '', k = s ? s + ':' + L.on : ''; if ((L.tkS || '') === k) return; L.tkS = k; if (!s) { L.el.style.cssText = this.labelCss(L.kind, L.on, L); L.el.style.display = ''; return; } const F = { done: ['#d5e8cc', '#1d4d2e', '#5fae6e'], due: ['#c1ddfd', '#1f4470', '#6f9fdc'], skip: ['#fede82', '#5c3f00', '#e8b33c'] }[s]; L.el.style.background = F[0]; L.el.style.color = F[1]; L.el.style.boxShadow = '0 0 0 1.5px ' + F[2] + ', 0 2px 6px rgba(17,21,17,.25)'; L.el.style.borderColor = 'transparent'; L.w = 0; }
  // neighbouring task pens: a tag that would cover another is lifted above it, so every pen keeps its tag
  tkNudge(cands, rectOf) { const u = this.ui(), ts = cands.filter((L) => L.vis && L.kind === 'pen' && this.tkLabel(L, u.view === 'room', u) === true).sort((x, y) => x.sx - y.sx), placed = []; ts.forEach((L) => { let r = rectOf(L), g = 0; while (g++ < 4 && placed.some((b) => r.l < b.r + 2 && r.r > b.l - 2 && r.t < b.b + 2 && r.b > b.t - 2)) { L.sy -= L.h + 4; r = rectOf(L); } placed.push(r); }); }
  tkTop() { return (this.ovS().tks || []).length ? 134 : 84; }
  tkOpen(id) { const O = this.ovS(), T = this.tkDefs()[id]; if (!T) return; O.tks = O.tks || []; if (O.tks.indexOf(id) < 0) O.tks.push(id); this.tkActivate(id); }
  // Open page: the console opens the task's own page in its tab
  tkPage() { const O = this.ovS(), T = this.tkTask(); if (!T) return; try { window.dispatchEvent(new CustomEvent('sentri:open', { detail: { action: T.kind === 'rx' ? 'rxpage' : 'vaxpage', id: O.tk, from: { title: T.title, many: true } } })); } catch (e) { /* ignore */ } }
  tkActivate(id) {
    const O = this.ovS(), T = this.tkDefs()[id]; O.tk = id; O.tkOpen = true; O.tkPen = ''; O.panel = 'tk'; O.hist = []; this.setSel([]); O.focus = T.go.room && this.tkCodes(T).length ? { roomId: T.go.room, codes: this.tkCodes(T) } : null;
    if (T.go.room) { if (this.ui().roomId !== T.go.room || this.ui().view !== 'room') this.goRoom(T.go.room); }
    else { const s = this.M().sections.find((x) => /nurs/i.test(x.name)); if (s) this.goScope(s.zone || '', s.id, { ms: 650 }); }
    this.tkSave(); this.repaintBv(); this.ovPaint();
  }
  tkCollapse() { const O = this.ovS(); O.tkOpen = false; O.tkPen = ''; O.focus = null; this.dirty = true; if (['tk', 'tkpig'].indexOf(O.panel) >= 0) { O.panel = ''; O.hist = []; } this.setSel([]); this.tkSave(); this.repaintBv(); this.ovPaint(); }
  tkClose(id) { const O = this.ovS(); O.tks = (O.tks || []).filter((x) => x !== id); if (O.tk === id) { O.tk = ''; this.tkCollapse(); } else { this.tkSave(); this.ovPaint(); } }
  tkStart() { const O = this.ovS(); O.tks = ['rx09', 'prrs']; this.tkActivate('rx09'); }
  // returns true when it handled the action
  tkAct(k, v) {
    const O = this.ovS();
    if (k === 'tk') { if (O.tk === v && O.tkOpen) this.tkCollapse(); else this.tkActivate(v); return true; }
    if (k === 'tkx') { this.tkClose(v); return true; }
    if (k === 'tkc') { this.tkCollapse(); return true; }
    if (k === 'tkpage') { this.tkPage(); return true; }
    if (k === 'tkroom') { this.goRoom(v); return true; }
    if (k === 'tkwhole') { O.tkPen = ''; this.setSel([]); O.panel = 'tk'; this.tkFocus(this.tkCodes(this.tkTask())); this.ovPaint(); return true; }
    if (k === 'tkback') { O.panel = 'tk'; O.tkPig = null; this.setSel([]); this.tkFocus(this.tkCodes(this.tkTask())); this.ovPaint(); return true; }
    if (k === 'tkprof') { this.ovPush(); O.pig = O.tkPig; O.panel = 'pig'; this.ovPaint(); return true; }
    if ((k === 'close' || k === 'back') && ['tk', 'tkpig'].indexOf(O.panel) >= 0 && !(k === 'back' && O.panel === 'tkpig')) { this.tkCollapse(); return true; }
    if (k === 'back' && O.panel === 'tkpig') { return this.tkAct('tkback'); }
    return false;
  }
  // a pen clicked while a task is open: one pig opens her part of the task, a group pen scopes the card
  tkPicked(u) {
    const O = this.ovS(), ps = u.psel || [];
    if (!this.tkLive() || ps.length !== 1 || u.view !== 'room') return false;
    const T = this.tkTask(), code = ps[0], s = T.state(u.roomId, code); if (!s) return false;
    const cell = ((this.IP && this.IP.cell[u.roomId]) || {})[code] || {};
    if ((cell.n || 1) > 1 || T.kind === 'vax') { O.tkPen = code; O.panel = 'tk'; return true; }
    O.tkPig = { roomId: u.roomId, code: code }; O.panel = 'tkpig'; this.tkFocus([code]); return true;
  }
  // ----- parts -----
  tkRing(r, hot) { const C = this.tkC(), L = 2 * Math.PI * 7, n = r[3], seg = (v, off, col) => v ? '<circle cx="10" cy="10" r="7" fill="none" stroke="' + col + '" stroke-width="4" stroke-dasharray="' + (L * v / n).toFixed(1) + ' ' + L.toFixed(1) + '" stroke-dashoffset="' + (-L * off / n).toFixed(1) + '" transform="rotate(-90 10 10)"></circle>' : ''; return '<svg viewBox="0 0 20 20" style="width: 20px; height: 20px; flex: none;"><circle cx="10" cy="10" r="7" fill="none" stroke="' + C.handle + '" stroke-width="4"></circle>' + seg(r[0], 0, C.dm) + seg(r[1], r[0], C.lm) + seg(r[2], r[0] + r[1], C.pm) + '</svg>'; }
  tkDot(s) { const C = this.tkC(), m = { done: [C.dm, 'none'], skip: [C.lm, 'none'], due: ['#FFFFFF', 'inset 0 0 0 2px ' + C.pm], plan: ['#FFFFFF', 'inset 0 0 0 1.5px ' + C.handle] }[s]; return '<span style="display: inline-block; width: 16px; height: 16px; border-radius: 99px; box-sizing: border-box; background: ' + m[0] + '; box-shadow: ' + m[1] + ';"></span>'; }
  // the week calendar; each cell carries its own hover line (title attribute)
  tkCal(week, cells) {
    const H = OVH, K = H.K;
    return '<div style="display: grid; grid-template-columns: 40px repeat(7, 1fr); row-gap: 6px; align-items: center; justify-items: center; margin-top: 10px;"><span></span>' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => '<span style="font-size: 11px; color: ' + K.muted + ';">' + d + '</span>').join('') +
      '<span style="font-size: 11px; color: ' + K.muted + '; justify-self: start;">' + week + '</span>' + cells.map((c) => !c ? '<span style="width: 6px; height: 6px; border-radius: 99px; background: #EEF0EA;"></span>' : '<span title="' + H.esc(c.tip[0] + ' · ' + c.tip[1]) + '" style="display: inline-flex; cursor: default;">' + c.html + '</span>').join('') + '</div>';
  }
  tkNum(n, of, unit, dates) { const H = OVH, K = H.K; return '<div style="display: flex; align-items: baseline; gap: 6px;"><span style="font-size: 22px; line-height: 26px; font-weight: 600;">' + n + '</span><span style="font-size: 13px; color: ' + K.muted + ';">of ' + of + ' ' + unit + '</span><span style="flex: 1;"></span><span style="font-size: 12.5px; color: ' + K.muted + ';">' + dates + '</span></div>'; }
  tkBox(inner, pad) { return '<div style="padding: ' + (pad || '14px') + '; background: #FFFFFF; border: 1px solid ' + OVH.K.line + '; border-radius: 16px;">' + inner + '</div>'; }
  tkHead(T, o) {
    const H = OVH, K = H.K; o = o || {};
    const ico = T.kind === 'vax' ? 'M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z' : 'm18 2 4 4m-6-2 4 4M14 6l4 4-9 9H5v-4l9-9Zm-5 5 2 2m1-5 2 2';
    return '<div style="display: flex; align-items: center; gap: 10px;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: ' + (T.kind === 'vax' ? K.greenT : K.blueT) + '; color: ' + (T.kind === 'vax' ? K.green : K.blue) + '; flex: none;">' + H.icon(ico, 18) + '</span><span style="flex: 1; display: flex; flex-direction: column; min-width: 0;"><span style="font-size: 15.5px; line-height: 21px; font-weight: 600;">' + H.esc(T.title) + '</span><span style="font-size: 13px; color: ' + K.muted + ';">' + H.esc(T.sub) + '</span></span><button type="button"' + H.A('tkc') + ' aria-label="Collapse" title="Collapse" style="display: inline-flex; border: 0; background: transparent; color: ' + K.muted + '; padding: 6px; cursor: pointer;">' + H.icon('m6 9 6 6 6-6', 17) + '</button></div>';
  }
  tkTabsHtml(O) {
    const H = OVH, K = H.K, D = this.tkDefs(), list = O.tks || [];
    if (!list.length) return '';
    const shown = list.slice(0, 2), rest = list.slice(2);
    const tab = (id) => { const T = D[id], on = O.tk === id && O.tkOpen; return '<span' + H.A('tk:' + id) + ' style="' + H.st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 4px 0 9px', borderRadius: '9px', background: on ? '#FFFFFF' : 'transparent', boxShadow: on ? 'inset 0 0 0 1.5px ' + K.ink : 'none', fontSize: '13px', fontWeight: on ? 600 : 500, color: K.ink, whiteSpace: 'nowrap', cursor: 'pointer' }) + '"><span style="display: inline-flex; color: ' + (T.kind === 'vax' ? K.green : K.blue) + ';">' + H.icon(T.kind === 'vax' ? 'M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z' : 'm18 2 4 4m-6-2 4 4M14 6l4 4-9 9H5v-4l9-9Zm-5 5 2 2m1-5 2 2', 14) + '</span>' + H.esc(T.tab) + '<button type="button"' + H.A('tkx:' + id) + ' aria-label="Close ' + H.esc(T.tab) + '" style="display: inline-flex; border: 0; background: transparent; color: ' + K.muted + '; padding: 4px; cursor: pointer;">' + H.icon(H.I.x, 12) + '</button></span>'; };
    return this.ovCard({ right: '12px', top: '84px', width: '320px' }, shown.map(tab).join('') + '<span style="flex: 1;"></span>' + (rest.length ? '<span style="font-size: 13px; padding: 0 8px;">+' + rest.length + '</span>' : ''), { display: 'flex', alignItems: 'center', gap: '2px', padding: '5px', background: 'rgba(255,255,255,.94)' });
  }
  tkCardHtml(u) {
    const H = OVH, K = H.K, O = this.ovS(), T = this.tkTask(); if (!T) return '';
    const days = T.days.map((d) => d ? { html: this.tkRing(d.r), tip: d.tip } : null);
    let scope = '', num = this.tkNum(T.num[0], T.num[1], T.num[2], T.dates), whole = '';
    if (O.tkPen && T.group) {
      const g = T.group[O.tkPen] || [7, 0, 2, 9], cell = ((this.IP && this.IP.cell[u.roomId]) || {})[O.tkPen] || {};
      scope = '<div style="display: flex; align-items: center; gap: 8px; margin: 12px 2px 10px;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: ' + K.press + ';">' + H.icon('M5 5h14v14H5zM9.7 5v14M14.3 5v14', 13) + '</span><span style="font-size: 13px; font-weight: 600;">In Pen ' + H.esc(O.tkPen) + '</span><span style="font-size: 12.5px; color: ' + K.muted + ';">' + (cell.n || g[3]) + ' ' + (cell.kind || 'pigs') + '</span></div>';
      num = this.tkNum(g[0], g[3], 'vaccinated', T.dates);
      days[4] = { html: this.tkRing(g), tip: ['Pen ' + O.tkPen, g[0] + ' done · ' + g[1] + ' skipped · ' + g[2] + ' due'] };
      whole = '<button type="button"' + H.A('tkwhole') + ' style="' + H.st({ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', padding: '10px 12px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid ' + K.line, fontFamily: 'inherit', fontSize: '13px', cursor: 'pointer' }) + '"><span style="color: ' + K.muted + ';">Whole task</span><span style="display: inline-flex; align-items: center; gap: 2px; font-weight: 600; color: ' + K.ink + ';">' + T.num[0] + ' of ' + T.num[1] + ' ' + T.num[2] + H.icon(H.I.chev, 14) + '</span></button>';
    }
    const chips = '<div style="display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0 12px;">' + T.chips.map((x, i) => '<span style="display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 6px; background: ' + (i ? '#F1F2EE' : '#c1ddfd') + '; color: ' + (i ? K.ink : '#1f4470') + '; font-size: 12px; font-weight: 500;">' + H.esc(x) + '</span>').join('') + '</div>';
    const facts = this.tkBox(T.facts.map((r, i) => '<div style="display: grid; grid-template-columns: 88px 1fr; column-gap: 10px; align-items: baseline; padding: 8px 0; border-top: ' + (i ? '1px solid #EEF0EA' : '0') + ';"><span style="font-size: 12.5px; color: ' + K.muted + ';">' + r[0] + '</span><span style="display: flex; flex-direction: column;"><span style="font-size: 13.5px; font-weight: 500;">' + H.esc(r[1]) + '</span>' + (r[2] ? '<span style="font-size: 12px; color: ' + K.muted + ';">' + H.esc(r[2]) + '</span>' : '') + '</span></div>').join(''), '4px 14px');
    const rooms = !O.tkPen && T.roomsLeft ? '<div style="margin: 16px 4px 8px; font-size: 13px; font-weight: 600; color: ' + K.muted + '; display: flex; justify-content: space-between;"><span>Rooms</span><span style="font-weight: 400;">pens left</span></div>' + this.tkBox(T.roomsLeft.map((r, i) => '<div' + H.A('tkroom:' + r[0]) + ' style="display: flex; align-items: center; gap: 8px; min-height: 42px; border-top: ' + (i ? '1px solid #EEF0EA' : '0') + '; cursor: pointer;"><span style="flex: 1; font-weight: 500;">' + r[1] + '</span><span style="color: ' + K.muted + '; font-size: 13px;">' + r[2] + '</span>' + H.icon(H.I.chev, 14, { color: K.faint }) + '</div>').join(''), '0 14px') : '';
    return this.tkHead(T) + (scope || chips) + this.tkBox(num + this.tkCal(T.week, days)) + whole + rooms +
      '<div style="margin: 16px 4px 8px; font-size: 13px; font-weight: 600; color: ' + K.muted + ';">' + (T.kind === 'vax' ? 'Plan' : 'Prescription') + '</div>' + facts +
      '<div style="display: flex; margin-top: 12px;">' + H.wbtn('M14 4h6v6M20 4l-9 9M18 14v6H4V6h6', 'Open page', 'tkpage') + '</div>';
  }
  tkPigHtml() {
    const H = OVH, K = H.K, O = this.ovS(), T = this.tkTask(), g = O.tkPig; if (!T || !g) return '';
    const P = this.ovPigData(g.roomId, g.code), list = (T.pig || {})[g.code] || [], done = list.filter((x) => x[0] === 'done').length;
    const cells = [null, null, null, null, null, null, null]; (T.pigDays || []).forEach((d, i) => { if (list[i]) cells[d] = { html: this.tkDot(list[i][0]), tip: [list[i][1], list[i][2]] }; });
    return '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><button type="button"' + H.A('tkback') + ' style="display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 10px 0 6px; border-radius: 8px; border: 0; background: #FFFFFF; box-shadow: inset 0 0 0 1px ' + K.line + '; font-family: inherit; font-size: 12.5px; font-weight: 500; cursor: pointer;">' + H.icon(H.I.back, 14) + H.esc(T.title) + '</button></div>' +
      '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: ' + K.press + ';">' + H.icon(H.I.pig, 18) + '</span><span style="flex: 1; display: flex; flex-direction: column;"><span style="font-size: 16px; font-weight: 600;">' + H.esc(g.code + ' · ' + P.tag) + '</span><span style="font-size: 12.5px; color: ' + K.muted + ';">Sow · P' + P.parity + ' · Pen ' + H.esc(g.code) + '</span></span><button type="button"' + H.A('tkprof') + ' style="display: inline-flex; align-items: center; gap: 2px; height: 30px; padding: 0 6px 0 11px; border-radius: 9px; border: 0; background: #FFFFFF; box-shadow: inset 0 0 0 1px ' + K.line + '; font-family: inherit; font-size: 12.5px; font-weight: 500; cursor: pointer;">Profile' + H.icon(H.I.chev, 14) + '</button></div>' +
      this.tkBox(this.tkNum(done, list.length, 'doses given', T.dates) + this.tkCal(T.week, cells) + (T.withdraw ? '<span style="display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 9px; border-radius: 8px; background: #F1F2EE; font-size: 12.5px; font-weight: 500; margin-top: 12px;">' + H.icon('M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z', 13, { color: K.muted }) + H.esc(T.withdraw) + '</span>' : ''));
  }
  // hover, while a task is open: who, and one line in the task's words
  tkTip(hit) {
    if (!this.tkLive()) return null;
    const H = OVH, K = H.K, T = this.tkTask(), code = hit.pen.code, s = T.state(hit.rm.id, code); if (!s) return null;
    const cell = ((this.IP && this.IP.cell[hit.rm.id]) || {})[code] || {}, group = (cell.n || 1) > 1;
    let head, line;
    if (group || T.kind === 'vax') { const g = (T.group || {})[code] || (s === 'done' ? [cell.n || 9, 0, 0, cell.n || 9] : [0, 0, cell.n || 9, cell.n || 9]); head = 'Pen ' + code + ' · ' + (cell.n || g[3]) + ' ' + (cell.kind || 'pigs'); line = g[0] + ' of ' + g[3] + ' vaccinated' + (g[1] ? ' · ' + g[1] + ' skipped' : ''); }
    else { const P = this.ovPigData(hit.rm.id, code); head = code + ' · ' + P.tag; line = (T.hover || {})[code] || ''; }
    const col = { done: this.tkC().dm, due: this.tkC().pm, skip: this.tkC().lm }[s];
    return '<div style="font-size: 12.5px; font-weight: 600; color: ' + K.muted + ';">' + H.esc(head) + '</div><div style="display: flex; align-items: center; gap: 7px; margin-top: 3px; font-size: 14px; font-weight: 600; color: ' + K.ink + ';"><i style="width: 10px; height: 10px; border-radius: 99px; background: ' + col + ';"></i>' + H.esc(line) + '</div>';
  }
