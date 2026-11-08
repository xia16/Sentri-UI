  // ===================== group pens: a pen opens on the map, its pigs line up by status, each pig is clicked on its own =====================
  gpS() { return this.ovS().gp || null; }
  gpIs(rid, code) { const g = this.gpS(); return !!(g && g.roomId === rid && g.code === code); }
  gpCol(rid, code) { return this.gpIs(rid, code) ? this.penOcc() : undefined; }
  gpGroupCell(rid, code) { const c = ((this.IP && this.IP.cell[rid]) || {})[code]; return c && (c.n || 1) > 1 && (c.kind === 'weaners' || c.kind === 'gilts') ? c : null; }
  // who is in the pen: the ones that need a look, then those with an ID, then those without
  gpPeople(rid, code) {
    const c = this.gpGroupCell(rid, code) || {}, D = this.ovPenData(rid, code), out = [];
    D.tagged.forEach((t, k) => { const st = c.flag && k === 0 ? 'urgent' : c.flag && k === 1 ? 'look' : ''; out.push({ id: t[0], st: st, why: st === 'urgent' ? 'Fever · 40.1 °C' : st === 'look' ? 'Thin' : 'Fine' }); });
    for (let k = out.length; k < D.n; k++) out.push({ id: '', st: '', why: 'Fine' });
    out.forEach((p, i) => { p.i = i; p.r = p.st === 'urgent' ? 0 : p.st === 'look' ? 1 : p.id ? 2 : 3; });
    return out.slice().sort((a, b) => a.r - b.r || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }
  gpMeshes(rm) { const out = []; if (rm.pg) rm.pg.traverse((o) => { if (o.isInstancedMesh && o.userData.items && o.userData.place) out.push(o); }); return out; }
  // lay the pen's pigs out in rows, heads to the feeder (on), or put them back where they were (off)
  gpLine(rm, code, on) {
    const rec = rm.penRec && rm.penRec[code], pen = rec && rec.pen; if (!rec || !pen) return [];
    const ms = this.gpMeshes(rm), maps = ms.map((m) => { const mp = new Map(); m.userData.items.forEach((o, i) => mp.set(o, i)); return mp; });
    const objs = rec.adds.map((a) => a[1]);
    const place = (o, to) => ms.forEach((m, j) => { const i = maps[j].get(o); if (i != null) m.userData.place(i, to); });
    if (!on) { objs.forEach((o) => place(o, o)); this.dirty = true; return []; }
    const people = this.gpPeople(rm.id, code).filter((p) => p.i < objs.length);
    const len = pen.len, h = pen.head, gap = len * 0.68, per = Math.max(1, Math.floor((pen.sz - 0.15) / gap) + 1);
    const groups = [people.filter((p) => p.r <= 1), people.filter((p) => p.r === 2), people.filter((p) => p.r === 3)].filter((x) => x.length);
    const rows = []; groups.forEach((gr) => { for (let k = 0; k < gr.length; k += per) rows.push(gr.slice(k, k + per)); });
    const back = pen.feeder ? 0.34 : 0.15, front = pen.x + h * (pen.sx / 2 - back) - h * (len * 0.62);
    const avail = pen.sx - back - len * 1.2 - 0.1, step = rows.length > 1 ? Math.min(len * 1.22, avail / (rows.length - 1)) : 0;
    const yaw = h > 0 ? 0 : Math.PI, pigs = [];
    rows.forEach((row, r) => row.forEach((p, j) => {
      const o = objs[p.i], to = Object.assign({}, o, { x: front - h * r * step, z: pen.z + (j - (row.length - 1) / 2) * gap, y: pen.y, yaw: yaw });
      place(o, to); pigs.push({ o: o, p: p, x: to.x, y: pen.y, z: to.z, yaw: yaw, len: len * (o.s == null ? 1 : o.s), h: h });
    }));
    this.dirty = true; return pigs;
  }
  gpOpen(rid, code) {
    const rm = this.rooms.find((r) => r.id === rid); if (!rm || !rm.penRec || !rm.penRec[code] || !rm.penRec[code].pen) return false;
    if (this.gpS()) this.gpClose(true);
    const O = this.ovS(); O.gp = { roomId: rid, code: code, sel: -1 }; O.panel = 'gp'; O.hist = [];
    O.gp.pigs = this.gpLine(rm, code, true); O.gp.people = this.gpPeople(rid, code);
    this.tipHide(); this.setSel([]); this.repaintBv(); this.reframe(750); this.ovPaint(); this.dirty = true; return true;
  }
  gpClose(quiet) {
    const O = this.ovS(), g = O.gp; if (!g) return;
    const rm = this.rooms.find((r) => r.id === g.roomId);
    if (rm) { this.gpLine(rm, g.code, false); this.gpRingAt(rm, 'hov', null); this.gpRingAt(rm, 'sel', null); }
    O.gp = null; if (['gp', 'gppig'].indexOf(O.panel) >= 0) { O.panel = ''; O.hist = []; }
    if (this.gpTagEl) { this.gpTagEl.innerHTML = ''; this.gpTagKey = ''; }
    if (!quiet) { this.tipHide(); this.setSel([]); this.repaintBv(); this.reframe(700); this.ovPaint(); }
    this.dirty = true;
  }
  // the camera, while a pen is open: the pen alone, close enough to click every pig
  gpFrame(rm, u) {
    const g = this.gpS(); if (!g || g.roomId !== rm.id) return null;
    const p = rm.pens.concat(rm.spens || []).find((q) => q.code === g.code); if (!p) return null;
    const T = this.T, th = (rm.r.rot || 0) * Math.PI / 180, bx = new T.Box3(), m = 0.3, YF = this.Y.YF; rm.g.updateMatrixWorld(true);
    [[-1, -1], [1, 1], [-1, 1], [1, -1]].forEach((q) => bx.expandByPoint(this.wpos(rm, p.x + q[0] * (p.sx / 2 + m), YF, p.z + q[1] * (p.sz / 2 + m)).clone()));
    return this.fitCam(bx, 1.22 + th, 1.12, this.insets(u));
  }
  // which pig is under the pointer
  gpHitAt(e) {
    const g = this.gpS(); if (!g || !g.pigs || !g.pigs.length || !e) return null;
    const rm = this.rooms.find((r) => r.id === g.roomId); if (!rm || !rm.pgp) return null;
    const T = this.T, c = this.renderer.domElement.getBoundingClientRect(), nd = new T.Vector2(((e.clientX - c.left) / c.width) * 2 - 1, -((e.clientY - c.top) / c.height) * 2 + 1);
    const rc = this.gpRay || (this.gpRay = new T.Raycaster()); rc.setFromCamera(nd, this.camera);
    const his = []; rm.pgp.hi.traverse((m) => { if (m.isInstancedMesh && m.userData.items) his.push(m); });
    const hits = rc.intersectObjects(his, false);
    for (let n = 0; n < hits.length; n++) { const o = hits[n].object.userData.items[hits[n].instanceId]; const k = g.pigs.findIndex((q) => q.o === o); if (k >= 0) return { k: k, pig: g.pigs[k] }; }
    // between legs or just off the back: the nearest pig on the floor, within half a pig
    const Y = this.Y.YF + 0.05, pl = new T.Plane(new T.Vector3(0, 1, 0), -Y), w = new T.Vector3(); if (!rc.ray.intersectPlane(pl, w)) return null;
    const lp = w.clone().applyMatrix4(rm.g.matrixWorld.clone().invert()); let best = -1, bd = 1e9;
    g.pigs.forEach((q, k) => { const d = Math.hypot(q.x - lp.x, (q.z - lp.z) * 1.6); if (d < bd) { bd = d; best = k; } });
    return best >= 0 && bd < g.pigs[best].len * 0.55 ? { k: best, pig: g.pigs[best] } : null;
  }
  gpRing(rm, which) {
    const key = which === 'sel' ? 'gpSelR' : 'gpHovR'; let r = rm[key];
    if (!r) { const T = this.T; r = new T.Mesh(new T.RingGeometry(0.43, 0.5, 56), new T.MeshBasicMaterial({ color: '#121815', transparent: true, opacity: which === 'sel' ? 1 : 0.6, depthWrite: false, side: T.DoubleSide })); r.rotation.order = 'YXZ'; r.renderOrder = 5; r.userData.ownMat = true; r.visible = false; rm.g.add(r); rm[key] = r; }
    return r;
  }
  gpRingAt(rm, which, pig) { const r = this.gpRing(rm, which); if (!pig) { if (r.visible) { r.visible = false; this.dirty = true; } return; } r.visible = true; r.position.set(pig.x, pig.y + 0.02, pig.z); r.rotation.set(-Math.PI / 2, pig.yaw, 0); r.scale.set(pig.len * 1.3, pig.len * 0.62, 1); this.dirty = true; }
  gpHov(ph) { const g = this.gpS(); if (!g) return; const rm = this.rooms.find((r) => r.id === g.roomId); if (!rm) return; const k = ph ? ph.k : -1; if (k === g.hov) return; g.hov = k; this.gpRingAt(rm, 'hov', ph && k !== g.sel ? ph.pig : null); }
  gpClick(e, hit) {
    const g = this.gpS(); if (!g) return false;
    const O = this.ovS(), rm = this.rooms.find((r) => r.id === g.roomId), ph = this.gpHitAt(e);
    if (ph) { g.sel = ph.k; O.panel = 'gppig'; this.gpRingAt(rm, 'sel', ph.pig); this.gpRingAt(rm, 'hov', null); this.tipHide(); this.ovPaint(); return true; }
    if (hit && hit.pen && hit.rm && hit.rm.id === g.roomId && hit.pen.code === g.code) { if (g.sel >= 0) this.gpAct('gpback'); return true; }
    this.gpClose();
    return !(hit && hit.pen);
  }
  gpPicked(u) {
    const O = this.ovS(), ps = u.psel || [];
    if (O.gp) { if (!ps.length) return true; this.gpClose(true); }
    if (ps.length !== 1 || O.picking || O.selecting || u.sm || u.view !== 'room' || (this.tkLive && this.tkLive())) return false;
    return this.gpGroupCell(u.roomId, ps[0]) ? this.gpOpen(u.roomId, ps[0]) : false;
  }
  gpAct(k) {
    const O = this.ovS(), g = O.gp; if (!g) return false;
    if (k === 'back' || k === 'close' || k === 'esc') { const now = performance.now(); if (now - (this.gpEscT || 0) < 80) return true; this.gpEscT = now; if (k === 'esc') k = 'back'; }
    if (k === 'gpx') { this.gpClose(); return true; }
    if (k === 'gpback') { const rm = this.rooms.find((r) => r.id === g.roomId); g.sel = -1; O.panel = 'gp'; if (rm) this.gpRingAt(rm, 'sel', null); this.ovPaint(); return true; }
    if (k === 'back' || k === 'close') { if (O.panel === 'gppig') return this.gpAct('gpback'); this.gpClose(); return true; }
    return false;
  }
  // a tag on every pig (its ID, or a dashed "No ID") and a pin on the ones that need a look; drawn every frame
  gpTags() {
    const g = this.gpS();
    if (!this.labelsEl) return;
    if (!this.gpTagEl) { const el = this.gpTagEl = document.createElement('div'); el.style.cssText = 'position:absolute; left:0; top:0; width:0; height:0; z-index:6; pointer-events:none;'; this.labelsEl.appendChild(el); }
    const el = this.gpTagEl;
    if (!g || !g.pigs || !g.pigs.length || (this.pk || 0) < 0.5) { if (el.childNodes.length) { el.innerHTML = ''; this.gpTagKey = ''; } return; }
    const key = g.roomId + ':' + g.code + ':' + g.pigs.length;
    if (this.gpTagKey !== key) {
      this.gpTagKey = key;
      el.innerHTML = g.pigs.map((q) => {
        const p = q.p, no = !p.id, pin = p.st ? '<span data-gp="pin" style="position:absolute; left:0; top:0; display:none; width:18px; height:18px; border-radius:6px; background:' + (p.st === 'urgent' ? '#B3261E' : '#9a6a00') + '; color:#fff; font:700 12px/18px Geist, system-ui, sans-serif; text-align:center; box-shadow:0 2px 5px rgba(0,0,0,.25);">!</span>' : '';
        return '<span data-gp="tag" style="position:absolute; left:0; top:0; display:none; height:18px; padding:0 5px; border-radius:5px; box-sizing:border-box; white-space:nowrap; font:600 11px/16px \'Geist Mono\', ui-monospace, monospace; ' + (no ? 'background:rgba(255,255,255,.88); border:1px dashed #8E9890; color:#5D665F;' : 'background:#fff; border:1px solid #DCE0D4; color:#121815;') + ' box-shadow:0 1px 3px rgba(17,21,17,.12);">' + (no ? 'No ID' : p.id) + '</span>' + pin;
      }).join('');
    }
    const rm = this.rooms.find((r) => r.id === g.roomId); if (!rm) return;
    const T = this.T, cv = this.renderer.domElement, W = cv.clientWidth, H = cv.clientHeight, v = new T.Vector3();
    const P = (x, y, z) => { v.set(x, y, z).applyMatrix4(rm.g.matrixWorld).project(this.camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z < 1]; };
    const tags = el.querySelectorAll('[data-gp="tag"]'), pins = el.querySelectorAll('[data-gp="pin"]'); let pi = 0;
    g.pigs.forEach((q, k) => {
      const t = tags[k]; if (!t) return;
      const a = P(q.x, q.y + q.len * 0.5, q.z); t.style.display = a[2] ? 'block' : 'none'; t.style.transform = 'translate(' + Math.round(a[0] - t.offsetWidth / 2) + 'px,' + Math.round(a[1] - 9) + 'px)';
      if (q.p.st) { const pn = pins[pi++]; if (pn) { pn.style.display = a[2] ? 'block' : 'none'; pn.style.transform = 'translate(' + Math.round(a[0] - t.offsetWidth / 2 - 22) + 'px,' + Math.round(a[1] - 9) + 'px)'; } }
    });
  }
  gpTipHtml(ph) {
    const p = ph.pig.p, K = OVH.K, word = (this.gpGroupCell(this.gpS().roomId, this.gpS().code) || {}).kind === 'gilts' ? 'gilt' : 'weaner';
    const dot = p.st ? '<span style="display:inline-block; width:8px; height:8px; border-radius:99px; background:' + (p.st === 'urgent' ? '#B3261E' : '#e8b33c') + '; margin-right:6px;"></span>' : '';
    return '<div style="font-size:12px; color:' + K.muted + '">' + (p.id ? "<span style=\"font-family: 'Geist Mono', ui-monospace, monospace\">" + p.id + '</span>' : 'No ID · ' + word) + '</div><div style="font-weight:600; display:flex; align-items:center">' + dot + OVH.esc(p.why) + '</div>';
  }
  // ----- the panels: the pen (no list), and one pig -----
  gpWord(g) { return (this.gpGroupCell(g.roomId, g.code) || {}).kind === 'gilts' ? ['gilt', 'gilts'] : ['weaner', 'weaners']; }
  gpFacts(rows) { const K = OVH.K; return '<div style="display: grid; grid-template-columns: 1fr 1fr; row-gap: 10px; column-gap: 12px;">' + rows.map((r) => '<div><div style="font-size: 12px; color: ' + K.muted + ';">' + r[0] + '</div><div style="font-size: 14px; font-weight: 600;">' + OVH.esc(r[1]) + '</div></div>').join('') + '</div>'; }
  gpCardHtml() {
    const H = OVH, K = H.K, g = this.gpS(); if (!g) return '';
    const D = this.ovPenData(g.roomId, g.code), ppl = g.people || [], wd = this.gpWord(g), gilt = wd[0] === 'gilt';
    const need = ppl.filter((p) => p.r <= 1).length, fine = ppl.filter((p) => p.r === 2).length, noid = ppl.filter((p) => p.r === 3).length;
    const sw = (st) => '<span style="width: 10px; height: 10px; border-radius: 3px; box-sizing: border-box; flex: none; ' + st + '"></span>';
    const key = (s, a, b) => '<div style="display: flex; align-items: center; gap: 8px; padding: 5px 0;">' + s + '<span style="flex: 1; font-size: 13px;">' + a + '</span><span style="font-size: 13px; font-weight: 600;">' + b + '</span></div>';
    const keys = [need ? key(sw('background: #e8b33c;'), 'Front · need a look', need) : '', fine ? key(sw('background: #c9cec1;'), (need ? (noid ? 'Middle' : 'Back') : 'Front') + ' · fine', fine) : '', noid ? key(sw('border: 1px dashed #8E9890;'), 'Back · no ID', noid) : ''].join('');
    return '<div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px;"><span style="flex: 1; display: flex; flex-direction: column;"><span style="font-size: 18px; font-weight: 600; letter-spacing: -.01em;">Pen ' + H.esc(g.code) + '</span><span style="font-size: 12.5px; color: ' + K.muted + ';">' + H.esc(D.meta) + '</span></span><button type="button"' + H.A('gpx') + ' aria-label="Close the pen" style="display: inline-flex; border: 0; background: transparent; color: ' + K.muted + '; padding: 6px; cursor: pointer;">' + H.icon('m18 6-12 12M6 6l12 12', 16) + '</button></div>' +
      this.tkBox('<div style="display: flex; align-items: baseline; gap: 6px;"><span style="font-size: 22px; line-height: 26px; font-weight: 600;">' + ppl.length + '</span><span style="font-size: 13px; color: ' + K.muted + ';">' + (ppl.length === 1 ? wd[0] : wd[1]) + '</span></div><div style="margin-top: 8px; border-top: 1px solid #EEF0EA; padding-top: 4px;">' + keys + '</div>') +
      '<div style="height: 12px;"></div>' + this.tkBox(this.gpFacts(gilt ? [['Age', '7 months'], ['Average weight', '128 kg'], ['Feed', 'Gilt developer'], ['In since', 'Mon 19 Oct']] : [['Age', '38 days'], ['Average weight', '11.2 kg'], ['Feed', 'Nursery 2'], ['In since', 'Mon 26 Oct']])) +
      '<div style="font-size: 12.5px; color: ' + K.muted + '; margin: 12px 2px 0;">Click a pig to open it.</div>';
  }
  gpPigHtml() {
    const H = OVH, K = H.K, g = this.gpS(); if (!g || g.sel < 0 || !g.pigs[g.sel]) return this.gpCardHtml();
    const p = g.pigs[g.sel].p, D = this.ovPenData(g.roomId, g.code), wd = this.gpWord(g), gilt = wd[0] === 'gilt', r = this.roomById(g.roomId);
    const chip = (t, bg, ink) => '<span style="display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 7px; background: ' + bg + '; color: ' + ink + '; font-size: 12.5px; font-weight: 500; white-space: nowrap;">' + H.esc(t) + '</span>';
    const task = (a, b, c, top) => '<div style="display: flex; align-items: center; gap: 8px; padding: ' + (top ? '8px 0 2px' : '0 0 8px') + '; border-top: ' + (top ? '1px solid #EEF0EA' : '0') + ';"><span style="flex: 1; display: flex; flex-direction: column;"><span style="font-size: 13.5px;">' + a + '</span><span style="font-size: 12px; color: ' + K.muted + ';">' + b + '</span></span>' + c + '</div>';
    const head = '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><button type="button"' + H.A('gpback') + ' style="display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 10px 0 6px; border-radius: 8px; border: 0; background: #FFFFFF; box-shadow: inset 0 0 0 1px ' + K.line + '; font-family: inherit; font-size: 12.5px; font-weight: 500; cursor: pointer;">' + H.icon(H.I.back, 14) + 'Pen ' + H.esc(g.code) + '</button></div>' +
      '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: ' + K.press + ';">' + H.icon(H.I.pig, 18) + '</span><span style="flex: 1; display: flex; flex-direction: column;"><span style="font-size: 16px; font-weight: 600;' + (p.id ? " font-family: 'Geist Mono', ui-monospace, monospace;" : '') + '">' + (p.id ? H.esc(p.id) : (gilt ? 'Gilt' : 'Weaner') + ' without an ID') + '</span><span style="font-size: 12.5px; color: ' + K.muted + ';">' + (gilt ? 'Gilt' : 'Weaner') + ' · Pen ' + H.esc(g.code) + ' · ' + H.esc(r ? r.name : '') + '</span></span></div>' +
      '<div style="display: flex; gap: 6px; margin-bottom: 12px;">' + (p.st ? chip(p.why, '#fede82', '#5c3f00') : chip('Fine', '#F1F2EE', K.ink)) + '</div>';
    if (!p.id) return head + this.tkBox(this.gpFacts([['Batch', D.batch || '–'], ['Age', gilt ? '7 months' : '38 days'], ['Pen average', gilt ? '128 kg' : '11.2 kg'], ['Last seen', 'Today 07:40']])) + '<div style="font-size: 12.5px; color: ' + K.muted + '; margin: 12px 2px 0;">It shares the batch&rsquo;s tasks and the pen&rsquo;s notes.</div>';
    const tasks = (p.st === 'urgent' ? task('Treatment RX-25G011', 'Dose 2 of 3 · today', chip('Due', '#c1ddfd', '#1f4470')) : '') + task(gilt ? 'Heat check' : 'PRRS vaccine', gilt ? 'With the pen · daily' : 'With the pen · Fri', chip('Planned', '#F1F2EE', K.ink), p.st === 'urgent');
    return head + this.tkBox('<div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Its tasks</div>' + tasks) + '<div style="height: 12px;"></div>' +
      this.tkBox(this.gpFacts([['Batch', D.batch || '–'], ['Age', gilt ? '7 months' : '38 days'], ['Weight', gilt ? '131 kg' : (p.st ? '10.4 kg' : '11.6 kg')], ['Sex', 'Gilt']]));
  }
