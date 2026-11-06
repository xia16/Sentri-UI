  // ===================== Schedule in the Farm view (replaces Batches): Home's timeline, scoped to where you are =====================
  // every row is a real task of this farm: its batch, its task, its rooms; pens only where the task names them
  ovSchedTasks() {
    return [
      { b: '33', name: 'Move into Farrowing Room 4', cells: ['', '', 'd9', 'o8', 'p9', '', ''], rooms: ['fr4'], task: 'move' },
      { b: '33', name: 'Farrowing', cells: ['', '', '', '', 'e6', 'e14', 'e12>'], rooms: ['fr4'] },
      { b: '32', name: 'Post-farrowing check', cells: ['d8', 'd8', 'w6', 'o8', 'p8', 'p8', 'p8>'], rooms: ['fr2'], task: 'post' },
      { b: '34', name: 'Breeding', cells: ['', 'd24', 'd28', 'o12', '', '', ''], rooms: ['g1'], task: 'breed' },
      { b: '30', name: 'PRRS sampling', cells: ['d10', '', '', '', '', '', ''], rooms: ['n1'] },
      { g: 'Health', name: 'Amox treatment', cells: ['', '', '', 'o4', 'p4', 'p4', ''], tag: '4', pig: true, rooms: ['g2'], pens: ['B15', 'B20', 'D40', 'D41'], rx: true },
      { g: 'Health', name: 'PRRS vaccine', cells: ['', '', '', 'u', 'p3', '', ''], tag: '3', pig: true, rooms: ['n2'], pick: 3 },
      { g: 'Other', name: 'Wash', cells: ['', '', '', '', 'p1', '', ''], tag: '1', roomTag: true, rooms: ['fr3'] }
    ];
  }
  // a task is here when one of its rooms is; in a pen, only what touches that pen
  ovSchedHere(t, P) {
    if (P.cur.kind === 'farm') return true;
    const inRoom = (r) => t.rooms.indexOf(r.id) >= 0;
    if (P.pen) { const r = P.r; if (!r || !inRoom(r)) return false; if (t.pens) return t.pens.indexOf(P.pen) >= 0; if (t.b) { const c = ((this.IP && this.IP.cell[r.id]) || {})[P.pen]; return !c || !c.batch || String(c.batch) === t.b; } return !t.pig; }
    return (P.rooms || []).some(inRoom);
  }
  // the pens a task touches in its room: named ones, the batch's pigs, or the first few pigs for a short list
  ovSchedPens(t) {
    const rid = t.rooms[0], cells = (this.IP && this.IP.cell[rid]) || {}, codes = Object.keys(cells).filter((c) => cells[c] && cells[c].kind).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    if (t.pens) return t.pens.slice();
    if (t.b) return codes.filter((c) => String(cells[c].batch) === t.b);
    if (t.pick) return codes.slice(0, t.pick);
    return [];
  }
  // a row clicked: the map goes to the task's room and lights its pens; a batch task opens itself, a treatment its record
  ovSchedOpen(i) {
    const t = this.ovSchedTasks()[i], B = this.batchData(); if (!t) return;
    const rid = t.rooms[0], O = this.ovS(), go = () => {
      const pens = this.ovSchedPens(t);
      if (t.task && B[t.b] && this.bvTask(t.b, t.task)) { O.focus = { roomId: rid, codes: pens }; this.ovAct('task:' + t.b + '/' + t.task); return; }
      if (t.rx) { this.ovPush(); O.focus = { roomId: rid, codes: pens }; this.ovSet({ panel: 'rx', pop: '' }); }
      else if (t.b && B[t.b]) { O.focus = { roomId: rid, codes: pens }; this.ovAct('open:' + t.b); return; }
      else { O.focus = { roomId: rid, codes: pens }; this.ovPaint(); }
      if (!t.b && pens.length) setTimeout(() => this.setSel(pens), 30);
      this.reframe(650);
    };
    if (this.ui().view !== 'room' || this.ui().roomId !== rid) { this.goRoom(rid); setTimeout(go, 650); } else go();
  }
  ovSchedHtml(u) {
    const H = OVH, K = H.K, O = this.ovS(), P = this.ovPlace(u), wk = O.swk || 0, B = this.batchData();
    const all = this.ovSchedTasks(), here = all.map((t, i) => Object.assign({ i: i }, t)).filter((t) => this.ovSchedHere(t, P));
    this.ovSchedT = all;
    const start = new Date(Date.UTC(2026, 10, 2 + wk * 7)), end = new Date(Date.UTC(2026, 10, 8 + wk * 7)), mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const DN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], cols = '112px repeat(7, minmax(0, 1fr))';
    const nav = (lab, a, sq) => '<button type="button"' + H.A(a) + (sq ? ' aria-label="' + lab + '"' : '') + ' style="' + H.st({ height: '36px', minWidth: sq ? '36px' : '0', padding: sq ? '0' : '0 12px', border: '1px solid ' + K.line, borderRadius: '10px', background: '#FFFFFF', color: K.ink, fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }) + '">' + (sq ? H.icon(lab === 'Previous week' ? H.I.back : H.I.chev, 16) : lab) + '</button>';
    const head = H.head('Schedule', P.name, '') +
      '<div style="' + H.st({ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px' }) + '">' + nav('Today', 'swk:0') + nav('Previous week', 'swk:-1', true) + nav('Next week', 'swk:1', true) + H.t(start.getUTCDate() + ' – ' + end.getUTCDate() + ' ' + mon[end.getUTCMonth()], { fontWeight: 600, marginLeft: '6px' }) + '<span style="flex: 1;"></span>' + H.mu('Week ' + (45 + wk)) + '</div>';
    const days = '<div style="' + H.st({ display: 'grid', gridTemplateColumns: cols, height: '48px', borderBottom: '1px solid ' + K.line }) + '"><span></span>' + DN.map((d, i) => { const dt = new Date(+start + i * 864e5), today = wk === 0 && i === 3, past = +dt < Date.UTC(2026, 10, 5); return '<span style="' + H.st({ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', borderLeft: '1px solid #F1F2EE' }) + '"><span style="' + H.st({ fontSize: '10.5px', fontWeight: 500, color: K.muted, letterSpacing: '.02em', textTransform: 'uppercase' }) + '">' + d + '</span><span style="' + H.st({ display: 'grid', placeItems: 'center', width: '22px', height: '22px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, background: today ? K.green : 'transparent', color: today ? '#FFFFFF' : past ? K.faint : K.ink }) + '">' + dt.getUTCDate() + '</span></span>'; }).join('') + '</div>';
    const cell = (code, prev, next) => {
      if (!code || code === 'n') return '<span style="border-left: 1px solid #F1F2EE;"></span>';
      const ty = code[0], n = (code.match(/\d+/) || [''])[0], on = (c) => !!c && c !== 'n', open = code.slice(-1) === '>', lr = (on(prev) ? '3px' : '8px'), rr = (on(next) || open ? '3px' : '8px');
      const done = ty === 'd' || ty === 'w', today = ty === 'o' || ty === 'u', est = ty === 'e';
      const bg = done ? K.greenT : today ? K.blueT : est ? 'transparent' : '#F1F3EE', ink = ty === 'w' ? K.red : done ? K.green : today ? K.blue : est ? K.muted : K.ink;
      return '<span style="' + H.st({ display: 'flex', alignItems: 'center', padding: '0 1.5px', borderLeft: '1px solid #F1F2EE' }) + '"><span style="' + H.st({ flex: 1, height: '26px', display: 'grid', placeItems: 'center', borderRadius: lr + ' ' + rr + ' ' + rr + ' ' + lr, background: bg, boxShadow: today ? 'inset 0 0 0 1.5px ' + K.blue : 'none', border: est ? '1px dashed ' + K.faint : '0', boxSizing: 'border-box', fontSize: '11.5px', fontWeight: 600, color: ink }) + '">' + (ty === 'u' ? '–' : est ? '~' + n : n) + '</span></span>';
    };
    const groups = [];
    here.forEach((t) => { const g = t.b ? 'Batch ' + t.b : t.g; let x = groups.find((q) => q.name === g); if (!x) { x = { name: g, b: t.b, rows: [] }; groups.push(x); } x.rows.push(t); });
    const order = (g) => g.b ? 0 : g.name === 'Health' ? 1 : 2;
    groups.sort((a, b) => order(a) - order(b) || (b.b || '').localeCompare(a.b || ''));
    const tagH = (t) => t.tag ? '<span style="' + H.st({ display: 'inline-flex', alignItems: 'center', gap: '3px', alignSelf: 'flex-start', height: '18px', padding: '0 6px', borderRadius: '5px', background: '#F1F3EE', color: K.muted, fontSize: '11.5px', fontWeight: 600 }) + '">' + H.icon(t.pig ? H.I.pig : (H.I.home || H.I.grid), 12) + t.tag + '</span>' : '';
    const body = !here.length ? '<div style="' + H.st({ padding: '28px 16px', textAlign: 'center', color: K.muted, fontSize: '13.5px' }) + '">Nothing planned here this week.</div>' :
      groups.map((g) => '<div' + (g.b && B[g.b] ? H.A('open:' + g.b) : '') + ' style="' + H.st({ display: 'flex', alignItems: 'center', gap: '4px', height: '32px', padding: '0 12px', background: '#FAFAF7', borderBottom: '1px solid ' + K.line, fontSize: '12.5px', fontWeight: 600, color: K.muted, cursor: g.b && B[g.b] ? 'pointer' : 'default' }) + '">' + g.name + (g.b && B[g.b] ? H.icon(H.I.chev, 14) : '') + '</div>' +
        g.rows.map((t) => { const cs = wk === 0 ? t.cells : ['', '', '', '', '', '', ''], opens = true; return '<div' + (opens ? H.A('srow:' + t.i) : '') + ' style="' + H.st({ display: 'grid', gridTemplateColumns: cols, minHeight: '52px', borderBottom: '1px solid #F1F2EE', cursor: opens ? 'pointer' : 'default' }) + '"><span style="' + H.st({ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', padding: '6px 8px 6px 12px' }) + '"><span style="' + H.st({ fontSize: '13px', lineHeight: '16px', fontWeight: 500 }) + '">' + t.name + '</span>' + tagH(t) + '</span>' + cs.map((c, i) => cell(c, cs[i - 1], cs[i + 1])).join('') + '</div>'; }).join('')).join('');
    const todayCol = wk === 0 ? '<div style="' + H.st({ position: 'absolute', top: '48px', bottom: 0, left: 'calc(112px + (100% - 112px) * 3 / 7)', width: 'calc((100% - 112px) / 7)', background: '#F4F8F4', zIndex: 0, pointerEvents: 'none' }) + '"></div>' : '';
    const key = '<div style="' + H.st({ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', margin: '12px 4px 0', fontSize: '12px', color: K.muted }) + '">' + [[K.greenT, 'none', 'Done'], [K.blueT, 'inset 0 0 0 1.5px ' + K.blue, 'Today'], ['#F1F3EE', 'none', 'Planned'], ['transparent', 'inset 0 0 0 1px ' + K.faint, 'Expected']].map((x) => '<span style="display: inline-flex; align-items: center; gap: 6px;"><i style="' + H.st({ width: '14px', height: '10px', borderRadius: '3px', background: x[0], boxShadow: x[1] }) + '"></i>' + x[2] + '</span>').join('') + '</div>';
    return head + '<div style="' + H.st({ position: 'relative', marginTop: '14px', background: '#FFFFFF', border: '1px solid ' + K.line, borderRadius: '16px', overflow: 'hidden' }) + '">' + todayCol + '<div style="position: relative; z-index: 1;">' + days + body + '</div></div>' + key;
  }
  // a running treatment, opened from its row: the record in the Farm view's own panel
  ovRxHtml() {
    const H = OVH, K = H.K;
    const chip = (t, o) => '<span style="' + H.st(Object.assign({ display: 'inline-flex', alignItems: 'center', height: '24px', padding: '0 8px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, background: '#FFFFFF', boxShadow: 'inset 0 0 0 1px ' + K.line }, o || {})) + '">' + t + '</span>';
    const mark = (k) => ({ done: '<span role="img" aria-label="given" style="display: grid; place-items: center; width: 22px; height: 22px; border-radius: 999px; background: ' + K.greenT + '; color: ' + K.green + '; font-size: 12px; font-weight: 700;">✓</span>', skip: '<span role="img" aria-label="skipped" style="display: grid; place-items: center; width: 22px; height: 22px; border-radius: 999px; background: ' + K.amberT + '; color: ' + K.amber + '; font-size: 11px; font-weight: 700;">–</span>', due: '<span role="img" aria-label="due today" style="width: 14px; height: 14px; border-radius: 999px; box-shadow: inset 0 0 0 1.5px ' + K.blue + ';"></span>', later: '<span role="img" aria-label="waiting" style="width: 14px; height: 14px; border-radius: 999px; box-shadow: inset 0 0 0 1.5px #C9CEC4;"></span>' })[k];
    const sows = [['B15', ['done', 'done', 'later']], ['B20', ['done', 'done', 'later']], ['D40', ['done', 'due', 'later']], ['D41', ['skip', 'due', 'later'], 'Dose 1 skipped: could not stand']];
    const seg = (n, k) => '<span style="' + H.st({ flex: 1, height: '6px', borderRadius: '3px', background: k === 'done' ? '#5FAE6E' : 'transparent', boxShadow: k === 'done' ? 'none' : 'inset 0 0 0 1.5px #6F9FDC' }) + '"></span>';
    return H.head('Treatment RX-25G009', 'Amoxicillin 15% LA · 4 sows · Batch 32', 'back') +
      '<div style="' + H.st({ display: 'flex', gap: '6px', marginTop: '10px' }) + '">' + chip('Running', { background: K.blueT, color: K.blue, boxShadow: 'none' }) + chip('Lameness') + chip('Fever') + '</div>' +
      H.sec('Now') + H.card('<div style="' + H.st({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }) + '">' + H.t('Dose 2 of 3', { fontSize: '17px', fontWeight: 600 }) + H.mu('Fri 6 Nov') + '</div>' + H.mu('2 of 4 sows given') + '<div style="' + H.st({ display: 'flex', gap: '3px', marginTop: '10px' }) + '">' + seg(1, 'done') + seg(2, 'done') + seg(3, '') + seg(4, '') + '</div><div style="margin-top: 10px;">' + H.mu('Next dose Sat 7 Nov 08:30 · every 24 hours') + '</div>', { pad: '14px 16px' }) +
      H.sec('Sows', '<span style="' + H.st({ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', textAlign: 'center', fontSize: '11.5px', color: K.muted, paddingRight: '12px' }) + '"><span>1</span><span>2</span><span>3</span></span>') +
      H.card(sows.map((s, i) => '<div style="' + H.st({ display: 'flex', alignItems: 'center', minHeight: '44px', borderTop: i ? '1px solid ' + K.line : '0' }) + '"><span style="' + H.st({ flex: 1, display: 'flex', flexDirection: 'column', padding: s[2] ? '6px 0' : '0' }) + '">' + H.t(s[0], { fontWeight: 600 }) + (s[2] ? H.t(s[2], { fontSize: '12px', color: K.amber, whiteSpace: 'normal' }) : '') + '</span><span style="' + H.st({ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', justifyItems: 'center', alignItems: 'center' }) + '">' + s[1].map(mark).join('') + '</span></div>').join(''), { pad: '0 16px' }) +
      H.sec('Prescription') + H.card('<div style="font-weight: 600;">Amoxicillin 15% LA</div>' + H.t('Intramuscular · 15 mL a sow · 3 doses, 24 h apart', { display: 'block', whiteSpace: 'normal' }) + H.mu('Withdrawal 14 days · Keep D40 and D41 on straw'), { pad: '12px 16px' }) +
      '<div style="' + H.st({ display: 'flex', gap: '8px', marginTop: '16px' }) + '">' + H.wbtn(H.I.log, 'Log', 'noop') + H.wbtn(H.I.more || H.I.dots || H.I.log, 'Actions', 'noop') + '</div>';
  }
