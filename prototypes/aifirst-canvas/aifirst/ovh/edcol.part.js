  // ===================== Edit layout, rebuilt (canvas: Edit layout, one column) =====================
  // Top left: only the place. Right: one panel, the same as the Farm view's, with every action and form as a page.
  // The map is only for placing and picking: then the panel steps aside and a guide names the task.
  edMapTask(u) { return !!(u.tool === 'room' || u.tool === 'zone' || u.tool === 'sec' || u.tool === 'lane' || u.tool === 'row' || u.addDoor || u.reshape || (u.devT && u.devT.kind) || u.dp); }
  edDevGroups() {
    return [
      ['Climate', [['climate', 'Runs the fans and heat for the room'], ['fan', 'Moves air through the room'], ['temp', 'Reads temperature and humidity where it hangs'], ['nh3', 'Reads ammonia where it hangs']]],
      ['Feed and water', [['feeder', 'Feeds the pens along its line'], ['water', 'Drinkers for the pens along its line']]],
      ['Comfort', [['heat', 'Warms the pens it hangs over'], ['floor', 'Clears the floor under its pens']]],
      ['Other', [['camera', 'Watches the pens in view'], ['scale', 'Weighs pigs from the pens it serves']]]
    ];
  }
  edCursor(kind) {
    const d = (this.devPaths && this.devPaths()[kind]) || '';
    if (!d) return 'crosshair';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#20291F"/><g transform="translate(6 6) scale(.8333)" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></g></svg>';
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '") 16 16, crosshair';
  }
  edHtml(u) {
    const V = this.ovVals || {}, P = V.P;
    this.edF = {}; this.edI = {}; this.edN = 0;
    if (!P) return '';
    const H = OVH, K = H.K, esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const A = (fn) => { if (!fn) return ''; const k = 'f' + (this.edN++); this.edF[k] = fn; return ' data-a="ed:' + k + '"'; };
    const IN = (id, onIn, onKey) => { this.edI[id] = { input: onIn, key: onKey }; return ' id="ed-' + id + '" data-in="' + id + '"'; };
    const sv = (d, s, w) => d ? '<svg viewBox="0 0 24 24" aria-hidden="true" style="width: ' + (s || 18) + 'px; height: ' + (s || 18) + 'px; flex: none; fill: none; stroke: currentColor; stroke-width: ' + (w || 1.8) + '; stroke-linecap: round; stroke-linejoin: round;"><path d="' + d + '"></path></svg>' : '';
    const I = H.I, ic = V.ic || {};
    const PEN = 'M4 20h4L19 9l-4-4L4 16v4Z', CHK = 'm5 12 5 5 9-10', X = 'M18 6 6 18M6 6l12 12';
    // ----- the parts -----
    const iconBtn = (d, fn, label) => '<button type="button"' + A(fn) + ' aria-label="' + esc(label) + '" title="' + esc(label) + '" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; flex: none; border: 0; border-radius: 12px; background: transparent; color: ' + K.muted + '; cursor: pointer; padding: 0;">' + sv(d, 18) + '</button>';
    const backBtn = (fn) => '<button type="button"' + A(fn) + ' aria-label="Back" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; flex: none; border: 1px solid ' + K.line + '; border-radius: 12px; background: #FFFFFF; color: ' + K.ink + '; cursor: pointer; padding: 0; box-sizing: border-box;">' + sv(I.back, 18) + '</button>';
    const hdr = (title, sub, o) => { o = o || {}; return '<!--H--><div style="display: flex; align-items: flex-start; gap: 10px; flex: none; padding: 16px 16px 10px;">' + (o.back ? backBtn(o.back) : '') +
      '<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding-top: ' + (o.back ? '0' : '6px') + ';"><span style="font-size: 19px; line-height: 24px; font-weight: 600; letter-spacing: -.015em; color: ' + K.ink + ';">' + esc(title) + '</span>' +
      (sub ? '<span style="font-size: 13px; line-height: 18px; color: ' + K.muted + ';">' + esc(sub) + '</span>' : '') + (o.tag ? '<span style="align-self: flex-start; margin-top: 4px; display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 6px; background: #ECEEE8; color: ' + K.muted + '; font-size: 12px; font-weight: 500;">' + esc(o.tag) + '</span>' : '') + '</span>' +
      (o.edit ? iconBtn(PEN, o.edit, o.editLabel || 'Edit') : '') + (o.close ? iconBtn(X, o.close, o.closeLabel || 'Close') : '') + '</div><!--/H-->'; };
    const sec = (label, meta) => '<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 16px 4px 8px; font-size: 13px; line-height: 18px; font-weight: 600; color: ' + K.muted + ';"><span>' + esc(label) + '</span>' + (meta ? '<span style="font-weight: 400;">' + esc(meta) + '</span>' : '') + '</div>';
    const box = (rows) => rows.length ? '<div style="background: #FFFFFF; border: 1px solid ' + K.line + '; border-radius: 16px; padding: 0 4px; overflow: hidden;">' + rows.join('') + '</div>' : '';
    // one row: a lead (icon or swatch), a name with an optional line under it, a fact, and a check or a chevron
    const row = (o, i) => {
      const lead = o.sw ? '<span style="display: inline-flex; width: 20px; justify-content: center; flex: none;"><span style="' + o.sw + '"></span></span>' : o.ico ? '<span style="display: inline-flex; color: ' + (o.red ? K.red : K.ink) + ';">' + sv(o.ico, 18) + '</span>' : '';
      const tail = (o.fact ? '<span style="flex: none; font-size: 13px; color: ' + K.muted + '; white-space: nowrap;">' + esc(o.fact) + '</span>' : '') + (o.on ? '<span style="display: inline-flex; color: ' + K.ink + ';">' + sv(CHK, 16, 2.4) + '</span>' : o.chev ? '<span style="display: inline-flex; color: ' + K.faint + ';' + (o.down ? ' transform: rotate(90deg);' : '') + '">' + sv(I.chev, 16) + '</span>' : '');
      const tag = o.fn ? 'button type="button"' + A(o.fn) : 'div';
      return '<' + tag + (o.aria ? ' aria-label="' + esc(o.aria) + '"' : '') + (o.pressed != null ? ' aria-pressed="' + !!o.pressed + '"' : '') + ' style="width: 100%; display: flex; align-items: center; gap: 12px; min-height: ' + (o.sub ? 60 : 48) + 'px; padding: ' + (o.sub ? '9px' : '0') + ' 12px; box-sizing: border-box; border: 0; border-top: ' + (i ? '1px solid ' + K.line : '0') + '; border-radius: ' + (o.on ? '12px' : '0') + '; background: ' + (o.on ? K.press : 'transparent') + '; font: inherit; font-size: 14.5px; color: ' + (o.red ? K.red : K.ink) + '; text-align: left; cursor: ' + (o.fn ? 'pointer' : 'default') + ';">' + lead +
        '<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;"><span style="font-weight: ' + (o.on ? 600 : 500) + '; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + esc(o.name) + '</span>' + (o.sub ? '<span style="font-size: 13px; line-height: 18px; color: ' + K.muted + '; font-weight: 400;">' + esc(o.sub) + '</span>' : '') + '</span>' + tail + '</' + (o.fn ? 'button' : 'div') + '>';
    };
    const label = (id, text, opt) => '<label for="ed-' + id + '" style="display: block; margin: 0 2px 6px; font-size: 13px; font-weight: 500; color: ' + K.muted + ';">' + esc(text) + (opt ? ' <span style="font-weight: 400;">(optional)</span>' : '') + '</label>';
    const inputCss = (o) => 'width: 100%; box-sizing: border-box; height: 44px; padding: 0 12px; border: 1px solid #D5DACF; border-radius: 10px; background: #FFFFFF; font: inherit; font-size: 15px; color: ' + K.ink + '; outline-color: ' + K.ink + ';' + (o && o.mono ? " font-family: 'Geist Mono', ui-monospace, monospace;" : '');
    const field = (id, text, value, onIn, onKey, o) => { o = o || {}; return '<div style="margin-top: ' + (o.mt == null ? 14 : o.mt) + 'px;' + (o.flex ? ' flex: ' + o.flex + '; min-width: 0;' : '') + '">' + label(id, text, o.opt) + '<input' + IN(id, onIn, onKey) + ' value="' + esc(value) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.num ? ' inputmode="numeric"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.af ? ' data-af="1"' : '') + ' autocomplete="off" spellcheck="false" style="' + inputCss(o) + '">' + (o.hint ? '<div style="margin: 6px 2px 0; font-size: 13px; line-height: 18px; color: ' + (o.warn ? K.red : K.muted) + ';">' + esc(o.hint) + '</div>' : '') + '</div>'; };
    const sq = (d, fn, lab) => '<button type="button"' + A(fn) + ' aria-label="' + esc(lab) + '" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; flex: none; border: 1px solid #D5DACF; border-radius: 10px; background: #FFFFFF; color: ' + K.ink + '; cursor: pointer; padding: 0;">' + sv(d, 16, 2.2) + '</button>';
    const stepper = (id, less, n, onN, onKey, more, lab) => '<span style="display: inline-flex; align-items: center; gap: 4px; flex: none;">' + sq(I.minus, less, 'One fewer') + '<input' + IN(id, onN, onKey) + ' aria-label="' + esc(lab) + '" inputmode="numeric" value="' + esc(n) + '" style="' + inputCss() + ' width: 48px; height: 40px; padding: 0; text-align: center; font-weight: 600;">' + sq(I.plus, more, 'One more') + '</span>';
    const seg = (items) => '<div role="group" style="display: flex; gap: 2px; padding: 4px; border-radius: 12px; background: #E9ECE4;">' + items.map((o) => '<button type="button"' + A(o.pick) + ' aria-pressed="' + !!o.on + '" style="flex: 1; height: 36px; border: 0; border-radius: 9px; background: ' + (o.on ? '#FFFFFF' : 'transparent') + '; box-shadow: ' + (o.on ? '0 1px 2px rgba(17,21,17,.12)' : 'none') + '; font: inherit; font-size: 14px; font-weight: ' + (o.on ? 600 : 500) + '; color: ' + K.ink + '; cursor: pointer;">' + esc(o.label) + '</button>').join('') + '</div>';
    const btn = (text, fn, kind, off) => '<button type="button"' + (off ? ' aria-disabled="true"' : A(fn)) + ' style="flex: ' + (kind === 'sec' ? '1' : '1.4') + '; height: 48px; border-radius: 12px; font: inherit; font-size: 15px; font-weight: 600; cursor: ' + (off ? 'not-allowed' : 'pointer') + '; ' + (kind === 'sec' ? 'background: #FFFFFF; color: ' + K.ink + '; border: 1px solid #D5DACF;' : off ? 'background: #E7E9E4; color: #7C857F; border: 0;' : kind === 'red' ? 'background: #8E2F28; color: #FFFFFF; border: 0;' : 'background: ' + K.ink + '; color: #FFFFFF; border: 0;') + '">' + esc(text) + '</button>';
    const foot = (inner) => inner ? '<!--F--><div style="flex: none; display: flex; gap: 8px; padding: 12px 16px 16px; border-top: 1px solid ' + K.line + ';">' + inner + '</div><!--/F-->' : '';
    const note = (text, warn) => text ? '<div style="margin: 10px 4px 0; font-size: 13.5px; line-height: 20px; color: ' + (warn ? K.red : K.muted) + ';">' + esc(text) + '</div>' : '';
    const panel = (inner) => { const cut = (src, a, b) => { const i = src.indexOf(a), j = i < 0 ? -1 : src.indexOf(b, i); return i < 0 || j < 0 ? [null, src] : [[null, src.slice(i + a.length, j)], src.slice(0, i) + src.slice(j + b.length)]; };
      const c1 = cut(inner, '<!--H-->', '<!--/H-->'), c2 = cut(c1[1], '<!--F-->', '<!--/F-->'), hm = c1[0], fm = c2[0], body = c2[1]; return panelBox((hm ? hm[1] : '') + '<div data-zone="edbody" style="flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 0 16px ' + (fm ? 12 : 18) + 'px;">' + body + '</div>' + (fm ? fm[1] : '')); };
    const narrow = (this.W || 950) < 760, place = narrow ? 'left: 12px; right: 12px; bottom: 12px; max-height: calc(55% - 20px);' : 'right: 12px; top: 84px; bottom: 12px; width: 380px;';
    const panelBox = (inner) => '<section data-zone="edcol" aria-label="Edit" style="position: absolute; ' + place + ' max-width: calc(100% - 32px); box-sizing: border-box; display: flex; flex-direction: column; border-radius: 22px; background: ' + K.tint + '; box-shadow: 0 2px 6px rgba(17,21,17,.05), 0 16px 36px rgba(17,21,17,.12); overflow: hidden; pointer-events: auto; font-family: \'Geist\', system-ui, sans-serif; color: ' + K.ink + '; font-size: 14px; line-height: 20px; font-variant-numeric: tabular-nums;">' + inner + '</section>';
    const isRed = (s) => /#7A2C2C/i.test(s || '');

    // ----- on the map: placing, a door, the walls, a device, its pens -----
    if (this.edMapTask(u)) {
      let title = P.taskTitle || '', sub = P.taskSub || '', act = P.cancelLabel || 'Cancel', fn = P.cancel, ico = '';
      const gd = this.edGuide(u, P); if (gd) { title = gd[0]; sub = gd[1]; }
      if (u.tool === 'zone' || u.tool === 'sec') { act = 'Cancel'; fn = () => this.setTool(''); ico = u.tool === 'zone' ? 'M4 4h16v16H4z' : 'M4 4h16v16H4zM4 12h16'; }
      else if (u.tool === 'lane' || u.tool === 'row') { act = 'Cancel'; fn = () => { this.edHideGhost(); this.put({ tool: '' }); }; ico = u.tool === 'lane' ? 'M7 4v16M12 4v16M17 4v16' : 'M4 7h16M4 12h16M4 17h16'; }
      else if (u.tool === 'room') { ico = 'M4 10 12 4l8 6v10H4V10Z'; }
      else if (u.devT && u.devT.kind) { act = 'Cancel'; fn = () => this.put({ devT: null }); ico = (this.devPaths && this.devPaths()[u.devT.kind]) || ''; }
      else if (u.dp) { act = 'Done'; }
      else if (u.addDoor) { ico = ic.door || ''; }
      const pill = '<div data-zone="edguide" role="status" style="position: absolute; left: 12px; right: 12px; top: 12px; min-height: 60px; box-sizing: border-box; display: flex; align-items: center; gap: 12px; padding: 8px 8px 8px 10px; border-radius: 16px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(17,21,17,.06), 0 12px 30px rgba(17,21,17,.16); pointer-events: auto; font-family: \'Geist\', system-ui, sans-serif; color: ' + K.ink + '; z-index: 6;">' +
        (ico ? '<span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; flex: none; border-radius: 10px; background: ' + K.ink + '; color: #FFFFFF;">' + sv(ico, 18) + '</span>' : '') +
        '<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;"><span style="font-size: 15px; line-height: 20px; font-weight: 600;">' + esc(title) + '</span>' + (sub ? '<span style="font-size: 13px; line-height: 18px; color: ' + K.muted + ';">' + esc(sub) + '</span>' : '') + '</span>' +
        '<button type="button"' + A(fn) + ' style="flex: none; height: 40px; padding: 0 14px; border-radius: 10px; border: ' + (act === 'Done' ? '0' : '1px solid #D5DACF') + '; background: ' + (act === 'Done' ? K.ink : '#FFFFFF') + '; color: ' + (act === 'Done' ? '#FFFFFF' : K.ink) + '; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;">' + esc(act) + '</button></div>';
      return pill;
    }

    const F = V.form || {};
    // ----- a page inside the add-pens task: the pen types, or a new pen type -----
    const typeForm = (back, backLabel, next, nextLabel, nextOff, title) => {
      let b = hdr(title || 'New pen type', F.stepText || '');
      if (F.showKind) { b += sec('What it is'); const KD = { 'Gestation stall': 'One sow, in a row of stalls', 'Farrowing crate': 'A sow and her litter', 'Nursery pen': 'Weaners together after weaning', 'Group pen': 'Several pigs: sows, gilts, boars or finishers' }; b += box((F.kinds || []).map((k, i) => row({ name: k.name, sub: KD[k.name] || '', on: k.on, pressed: k.on, fn: k.pick }, i))); }
      if (F.showWho) { b += sec('Who lives here', 'one or more'); b += box((F.whos || []).map((w, i) => row({ name: w.label, on: w.on, pressed: w.on, fn: w.pick }, i))); }
      if (F.showDetails) {
        b += '<div style="margin-top: 4px;">' + field('pt-name', 'Name', F.name, F.onName, null, { ph: 'For example: Gilt pen', af: !F.showKind, hint: F.nameTaken ? 'You already have a pen type with this name' : '', warn: F.nameTaken }) + '</div>';
        b += '<div style="display: flex; gap: 10px;">' + field('pt-w', 'Width, cm', F.w, F.onW, null, { num: true, flex: 1 }) + field('pt-l', 'Length, cm', F.l, F.onL, null, { num: true, flex: 1 }) + (F.hasPer ? field('pt-per', 'Pigs per pen', F.perOne, F.onPerOne, null, { num: true, flex: 1 }) : '') + '</div>';
        if (F.hasFixed) b += note(F.fixedText);
      }
      if (F.usedDel) { b += note(F.usedText); b += box((F.reps || []).map((c, i) => row({ name: c.name, fn: c.pick, chev: true }, i))); }
      return b + foot(btn(backLabel || 'Back', back, 'sec') + btn(nextLabel || 'Next', next, 'pri', nextOff));
    };

    let h = '';
    if (P.bAdd && P.add) {
      // add pens (or a row): what, how many, where; every choice is a page, never a popover
      const a = P.add;
      if (a.tpOpen && a.tpForm) return panel(typeForm(a.formBack, F.backLabel, F.next, F.nextLabel, F.nextOff));
      if (a.tpOpen) {
        h = hdr('Pen type', a.lead || '', { back: a.tpToggle });
        h += box((a.tps || []).map((t, i) => row({ name: t.name, fact: t.size, sw: t.sw, on: t.on, pressed: t.on, fn: t.pick }, i)));
        h += '<div style="margin-top: 10px;">' + box([row({ name: 'New pen type', ico: I.plus, fn: a.newType, chev: true }, 0)]) + '</div>';
        return panel(h);
      }
      h = hdr(a.lead || 'Add pens', '');
      if (a.hasWhere && !(u.arT && u.arT.placed)) h += sec('Where') + seg((a.where || []).map((w) => ({ label: w.label, on: w.on, pick: w.pick })));
      h += sec('Pen type') + box([row({ name: a.tName, sw: a.sw, fn: a.tpToggle, chev: true, aria: a.tpAria }, 0)]);
      h += sec('How many', a.hint ? 'New: ' + a.hint : '') + '<div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #FFFFFF; border: 1px solid ' + K.line + '; border-radius: 16px;"><span style="flex: 1; font-weight: 500;">Pens</span>' + stepper('ar-n', a.less, a.n, a.onN, a.onKey, a.more, 'How many pens') + '</div>';
      h += foot(btn('Cancel', a.cancel, 'sec') + btn(a.goLabel || 'Add', a.go, 'pri', a.off));
      return panel(h);
    }
    if (P.isTask) {
      const f = this.ui().ptForm;
      if (P.bForm && f) return panel(typeForm(P.cancel, P.cancelLabel, P.confirm, P.confirmLabel, P.confirmOff, P.taskTitle) + (P.foot && P.foot.length ? '<div style="margin-top: 12px;">' + box(P.foot.map((d, i) => row({ name: d.label, ico: ic.trash || I.x, red: true, fn: d.off ? null : d.run }, i))) + '</div>' : ''));
      const devPick = u.devT && !u.devT.kind;
      h = hdr(devPick ? 'Add a device' : P.taskTitle, devPick ? 'Pick what it is. You place it on the map next.' : (P.hasTaskSub ? P.taskSub : ''), { tag: P.hasTag ? P.tag : '' });
      if (P.bNote && P.note) h += note(P.note);
      if (devPick) {
        const paths = this.devPaths ? this.devPaths() : {}, kinds = this.devKinds();
        this.edDevGroups().forEach((g) => { h += sec(g[0]) + box(g[1].map((x, i) => { const kd = kinds.find((k) => k.id === x[0]); return row({ name: kd ? kd.name : x[0], sub: x[1], ico: paths[x[0]] || '', fn: () => this.pickDeviceKind(x[0]), chev: true }, i); })); });
      } else if (P.bList) {
        if (P.hasListLabel) h += sec(P.listLabel); else h += '<div style="height: 6px;"></div>';
        h += box((P.list || []).filter((c) => c.name !== 'New pen type').map((c, i) => row({ name: c.name, fact: c.fact, sw: c.hasSw ? c.sw : '', ico: c.hasIco ? c.ico : '', on: c.on, pressed: c.on, fn: c.pick, aria: c.aria }, i)));
        const nt = (P.list || []).find((c) => c.name === 'New pen type'); if (nt) h += '<div style="margin-top: 10px;">' + box([row({ name: 'New pen type', ico: I.plus, fn: nt.pick, chev: true }, 0)]) + '</div>';
      }
      if (P.bText && P.tx) h += field('vt-text', P.tx.label, P.tx.value, P.tx.onInput, P.tx.onKey, { ph: P.tx.placeholder, af: true });
      if (P.bName && P.nn) {
        h += field('nn-name', 'Name', P.nn.name, P.nn.onName, P.nn.onKey, { ph: P.nn.placeholder, af: true, mt: 6 });
        if (P.nn.hasCode) h += field('nn-code', 'Short code', P.nn.code, P.nn.onCode, P.nn.onKey, { ph: P.nn.codeHint, max: 3, mono: true, hint: 'Three letters on its labels and records' });
        if (P.nn.hasZoneCode) h += note('Its code is ' + P.nn.zoneCode + ', set for you.');
      }
      if (P.bDev && P.dv) {
        const e = this.ui().dvE || {}, dd = this.Dv().room[this.ui().roomId], others = dd ? dd.devices.filter((x) => x.id !== e.id && (x.kind === 'climate' || x.kind === 'feeder')) : [];
        h += field('dv-code', 'Device code', P.dv.code, P.dv.onCode, P.dv.onKey, { ph: 'As printed on its label', af: true, mono: true, mt: 6, hint: 'On its label. Leave it empty to bind it later.' });
        h += field('dv-model', 'Model', P.dv.model, P.dv.onModel, P.dv.onKey, { ph: 'As on the label', opt: true });
        const opts = [['', 'Nothing']].concat(others.map((x) => [x.id, x.name])).concat([['hub', 'Farm hub']]);
        this.edI['dv-conn'] = { input: (ev) => this.put({ dvE: Object.assign({}, this.ui().dvE, { conn: ev.target.value }) }) };
        h += '<div style="margin-top: 14px;">' + label('dv-conn', 'Connects to', true) + '<select id="ed-dv-conn" data-in="dv-conn" style="' + inputCss() + ' appearance: auto;">' + opts.map((o) => '<option value="' + esc(o[0]) + '"' + ((e.conn || '') === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select></div>';
      }
      if (P.bDup && P.dup) {
        h += sec('Copies') + '<div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #FFFFFF; border: 1px solid ' + K.line + '; border-radius: 16px;"><span style="flex: 1; font-weight: 500;">How many</span>' + stepper('dup-n', P.dup.less, P.dup.n, P.dup.onN, P.dup.onKey, P.dup.more, 'How many copies') + '</div>';
        h += '<div style="margin-top: 10px;">' + box([row({ name: 'Rooms share a wall', sub: 'Copies sit against each other, no gap', on: !!P.dup.touch, pressed: !!P.dup.touch, fn: P.dup.toggleTouch }, 0)]) + '</div>' + note(P.dup.hint);
      }
      if (P.bEd && P.ed) {
        const e = P.ed;
        h += field('ed-name', 'Name', e.name, e.onName, e.onKey, { af: true, mt: 6 });
        if (e.isRoom && e.rect) h += '<div style="display: flex; gap: 10px;">' + field('ed-w', 'Width, m', e.w, e.onW, e.onKey, { flex: 1 }) + field('ed-l', 'Length, m', e.l, e.onL, e.onKey, { flex: 1 }) + '</div>';
        if (e.isRoom && e.irregular) h += note(e.areaText);
        if (e.hasSide) h += sec(e.sideLabel) + seg((e.sides || []).map((o) => ({ label: o.label, on: o.on, pick: o.pick })));
        if (e.isSec) h += field('ed-code', 'Short code', e.code, e.onCode, e.onKey, { max: 3, mono: true });
        if (e.hasNote) h += note(e.note);
      }
      if (P.foot && P.foot.length) h += '<div style="margin-top: 14px;">' + box(P.foot.map((d, i) => row({ name: d.label, ico: ic.trash || I.x, red: true, fn: d.off ? null : d.run }, i))) + '</div>';
      const cl = P.cancelLabel || 'Cancel';
      h += foot((P.hasCancel ? btn(cl, P.cancel, 'sec') : '') + (P.hasConfirm ? btn(P.confirmLabel, P.confirm, isRed(P.confirmStyle) ? 'red' : 'pri', P.confirmOff) : ''));
      return panel(h);
    }

    // a place at rest opens no pane: the bar holds its actions and the map shows it
    if (!this.edPicked(u)) return '';
    // ----- the thing picked: what it is, what is inside, what you can do -----
    const closer = (P.cRuns || P.cHead || P.cNote) ? P.close : null;
    if (P.cNote && P.note) {
      const ix = P.note.indexOf(','), t1 = ix > 0 ? P.note.slice(0, ix) : P.note, t2 = ix > 0 ? P.note.slice(ix + 1).trim() : '';
      h = hdr(t1, t2.charAt(0).toUpperCase() + t2.slice(1), { close: closer, closeLabel: P.closeLabel });
      const da = [], dd = [];
      (P.actions || []).forEach((a) => (a.danger ? dd : da).push({ name: a.label, ico: a.icon, fn: a.run, red: a.danger, aria: a.aria }));
      if (da.length) h += sec('Actions') + box(da.map((a, i) => row(a, i)));
      if (dd.length) h += '<div style="margin-top: 10px;">' + box(dd.map((a, i) => row(a, i))) + '</div>';
      return panel(h);
    }
    h = hdr(P.title || '', P.hasKindLine ? P.kind : '', { edit: P.hasEdit ? P.edit : null, editLabel: P.editTitle || 'Edit', close: closer, closeLabel: P.closeLabel });
    if (P.bNote && P.note && !P.hasRows) h += note(P.note);
    if (P.hasRows) {
      let facts = [], grp = [];
      const flush = () => { if (grp.length) { h += box(grp); grp = []; } };
      const actNames = (P.actions || []).map((a) => a.label).concat(P.hasLead && P.lead ? [P.lead.label] : []);
      (P.rows || []).filter((r) => !(r.isFold && actNames.indexOf(r.label) >= 0)).forEach((r) => {
        if (r.isFact) { flush(); h += '<div style="margin: 2px 4px 10px; font-size: 13.5px; line-height: 20px; color: ' + K.ink + ';">' + esc(r.text) + '</div>'; }
        else if (r.isNote) { flush(); h += note(r.text); }
        else if (r.isWarn) { flush(); h += note(r.text, true); }
        else if (r.isHead) { flush(); h += sec(r.label); }
        else if (r.isText) grp.push(row({ name: r.label, fact: r.value, sw: r.hasSw ? r.sw : '' }, grp.length));
        else if (r.isFold) grp.push(row({ name: r.label, fn: r.toggle, chev: true, down: !!r.open }, grp.length));
        else if (r.isGrid) { flush(); h += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 6px 0 4px;">' + (r.items || []).map((g) => '<div style="padding: 10px 12px; background: #FFFFFF; border: 1px solid ' + K.line + '; border-radius: 12px;"><div style="font-size: 12.5px; color: ' + K.muted + ';">' + esc(g.label) + '</div><div style="font-size: 15px; font-weight: 600;">' + esc(g.value) + '</div></div>').join('') + '</div>'; }
        else if (r.isLinks) { flush(); h += box((r.items || []).map((t, i) => row({ name: t.label, fact: t.fact, fn: t.pick, chev: true, aria: t.aria }, i))); }
        void facts;
      });
      flush();
    }
    if (P.hasHead && P.headTitle && P.headTitle !== P.title) h += note(P.headTitle + (P.headSub ? ' · ' + P.headSub : ''));
    if (P.hasRuns) {
      h += sec('Pens', 'from the door');
      h += box((P.runs || []).map((r, i) => '<div style="display: flex; align-items: center; gap: 10px; min-height: 60px; padding: 8px 8px 8px 12px; border-top: ' + (i ? '1px solid ' + K.line : '0') + ';"><button type="button"' + A(r.pick) + ' aria-label="' + esc(r.pickLabel || 'Change type') + '" style="flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; border: 0; background: transparent; padding: 0; font: inherit; text-align: left; cursor: pointer; color: ' + K.ink + ';"><span style="' + r.sw + '"></span><span style="display: flex; flex-direction: column; min-width: 0;"><span style="font-size: 14.5px; line-height: 19px; font-weight: 500;">' + esc(r.name) + '</span><span style="font-size: 13px; color: ' + K.muted + ';">' + esc(r.range) + '</span></span></button>' + stepper('run-' + i, r.less, r.n, r.onN, null, r.more, r.nLabel || 'How many') + (r.canX ? iconBtn(X, r.remove, r.removeLabel || 'Remove') : '') + '</div>'));
    }
    if (P.hasInside && (P.inside || []).length) {
      h += sec(P.insideLabel || 'Inside');
      h += box(P.inside.map((c, i) => row({ name: c.name, fact: c.fact, ico: c.hasIco ? c.ico : '', sw: c.hasSw ? c.sw : '', fn: c.pick, chev: true, aria: c.aria }, i)));
    }
    // the actions: add first, then the rest; the one that deletes stands alone at the end
    const acts = [], danger = [];
    if (P.hasAdd) {
      if (P.addMenu) (P.addItems || []).forEach((a) => acts.push({ name: 'Add ' + String(a.label).toLowerCase(), sub: String(a.hint || '').replace(/\.?\s*Not ready yet\.?/, ''), ico: a.icon, fn: a.run }));
      else acts.push({ name: P.addLabel, ico: I.plus, fn: P.addClick });
    }
    if (P.hasLead && P.lead) acts.push({ name: P.lead.label, ico: P.lead.icon, fn: P.lead.run });
    (P.actions || []).forEach((a) => (a.danger ? danger : acts).push({ name: a.label, ico: a.icon, fn: a.run, fact: a.hasKey ? a.key : '', red: a.danger, aria: a.aria }));
    if (P.hasMore) (P.more || []).forEach((a) => (a.danger ? danger : acts).push({ name: a.label, ico: a.icon, fn: a.run, red: a.danger, aria: a.aria }));
    if (acts.length) h += sec('Actions') + box(acts.map((a, i) => row(a, i)));
    if (danger.length) h += '<div style="margin-top: 10px;">' + box(danger.map((a, i) => row(a, i))) + '</div>';
    return panel(h);
  }
  // undo and redo, and the draft's save while setting up: bottom left, beside the 3D control
  edUndoHtml() {
    const V = this.ovVals || {}, hs = V.hist, H = OVH, K = H.K, P = V.P || {}, d = P.draft || {};
    if (!hs) return '';
    this.edF = this.edF || {};
    const A = (fn, off) => { if (!fn || off) return ' aria-disabled="true"'; const k = 'f' + (this.edN = (this.edN || 0) + 1); this.edF[k] = fn; return ' data-a="ed:' + k + '"'; };
    const b = (path, fn, off, lab) => '<button type="button"' + A(fn, off) + ' aria-label="' + lab + '" title="' + lab + '" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 0; border-radius: 12px; background: transparent; color: ' + (off ? '#B5BCB3' : K.ink) + '; cursor: ' + (off ? 'default' : 'pointer') + '; padding: 0;"><svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round;"><path d="' + path + '"></path></svg></button>';
    const ic = V.ic || {};
    let inner = b(ic.undo || 'M9 14L4 9l5-5 M4 9h10.5a5.5 5.5 0 0 1 0 11H11', hs.undo, hs.undoOff, hs.undoLabel) + b(ic.redo || 'M15 14l5-5-5-5 M20 9H9.5a5.5 5.5 0 0 0 0 11H13', hs.redo, hs.redoOff, hs.redoLabel);
    if (d.hasText) inner += '<i style="width: 1px; height: 24px; background: ' + K.line + '; margin: 0 6px;"></i><span style="font-size: 13.5px; color: ' + K.ink + '; white-space: nowrap; padding: 0 6px;">' + String(d.text || '').replace(/</g, '&lt;') + '</span><button type="button"' + A(d.save, d.saveOff) + ' style="height: 40px; padding: 0 14px; border: 0; border-radius: 10px; background: ' + (d.saveOff ? '#E7E9E4' : K.ink) + '; color: ' + (d.saveOff ? '#7C857F' : '#FFFFFF') + '; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;">' + String(d.saveLabel || 'Save').replace(/</g, '&lt;') + '</button>';
    return this.ovCard({ left: '120px', bottom: '16px' }, inner, { display: 'flex', alignItems: 'center', gap: '2px', padding: '6px' });
  }
