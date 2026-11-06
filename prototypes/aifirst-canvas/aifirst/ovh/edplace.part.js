  // ===================== every Add works like Add room: choose, the pointer carries its shape, click to put it down, then the details =====================
  edStartPlace(k) {
    this.hideGhost(); this.edHideGhost();
    this.put({ tool: k, sel: null, pen: '', corner: null, ed: null, arT: null, ptForm: null, nn: null, cf: null, dupT: null, mvT: false, chT: false, ptList: false, devT: null, moreOpen: false, addDoor: false });
  }
  // the guide's two lines, the same words for every Add
  edGuide(u, P) {
    const g = (title, shape, where, noun) => [title, shape + ' follows your pointer. Click ' + where + ' to put the ' + noun + ' down.'];
    if (u.tool === 'zone') return g('Place a new zone', 'A green box', 'the ground', 'zone');
    if (u.tool === 'sec') return g('Place a new section', 'A green box', 'the ground', 'section');
    if (u.tool === 'room') return g((P && P.taskTitle) || 'Place a room', 'A green box', 'the ground', 'room');
    if (u.tool === 'lane') return g('Place a lane', 'A green box', 'inside the room', 'lane');
    if (u.tool === 'row') return g('Place a row', 'A green box', 'by the door or at the far end', 'row');
    if (u.addDoor) return g('Place a door', 'A green box', 'a wall', 'door');
    if (u.devT && u.devT.kind) {
      const kd = this.devKinds().find((x) => x.id === u.devT.kind), sv = this.devServes(u.devT.kind), nm = kd ? kd.name.toLowerCase() : 'device';
      return g('Place the ' + nm, 'Its icon', sv === 'pens' ? 'the lane it runs along' : sv === 'room' ? 'a wall' : 'a wall or the ceiling', nm);
    }
    return null;
  }
  // the floor under the pointer, in the room's own frame (rooms can be turned)
  edRoomPick(e) {
    const u = this.ui(), rm = this.rooms && this.rooms.find((x) => x.id === u.roomId), T = this.T;
    if (!rm || !this.renderer) return null;
    const b = this.renderer.domElement.getBoundingClientRect(), ndc = new T.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    this.ray.setFromCamera(ndc, this.camera);
    const p = new T.Vector3();
    if (!this.ray.ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), -this.Y.YF), p)) return null;
    rm.g.updateMatrixWorld(true);
    return { rm: rm, lp: rm.g.worldToLocal(p.clone()) };
  }
  edLanes(rm) { const by = {}; (rm.pens || []).forEach((p) => { const m = /^([A-Z]+)(\d+)$/.exec(p.code || ''); if (!m) return; (by[m[1]] = by[m[1]] || []).push(p); }); return Object.keys(by).sort().map((k) => ({ k: k, ps: by[k].slice().sort((a, b) => parseInt(a.code.replace(/\D/g, ''), 10) - parseInt(b.code.replace(/\D/g, ''), 10)) })); }
  edBox(ps) { let b = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 }; ps.forEach((p) => { b = { x0: Math.min(b.x0, p.x - p.sx / 2), x1: Math.max(b.x1, p.x + p.sx / 2), z0: Math.min(b.z0, p.z - p.sz / 2), z1: Math.max(b.z1, p.z + p.sz / 2) }; }); return b; }
  // where a new lane or row would go, in the room's frame
  edSlot(rm, kind, lp) {
    const lanes = this.edLanes(rm), W = rm.gm.fw, L = rm.gm.fl, X0 = rm.X0, Z0 = rm.Z0, TW = rm.gm.TW || 0.25;
    const first = lanes[0] ? this.edBox(lanes[0].ps) : null, alongZ = !first || (first.z1 - first.z0) >= (first.x1 - first.x0);
    if (kind === 'lane') {
      if (!lanes.length) return { x0: X0 + 1, x1: X0 + 3, z0: Z0 - L + 1.5, z1: Z0 - 1.5 };
      const a = this.edBox(lanes[lanes.length - 1].ps), pv = lanes.length > 1 ? this.edBox(lanes[lanes.length - 2].ps) : null;
      if (alongZ) { const d = pv ? (a.x0 + a.x1) / 2 - (pv.x0 + pv.x1) / 2 : (a.x1 - a.x0) + 1.2; return { x0: a.x0 + d, x1: a.x1 + d, z0: a.z0, z1: a.z1 }; }
      const d = pv ? (a.z0 + a.z1) / 2 - (pv.z0 + pv.z1) / 2 : (a.z1 - a.z0) + 1.2; return { x0: a.x0, x1: a.x1, z0: a.z0 + d, z1: a.z1 + d };
    }
    // a row: across the room, by the door or at the far end; the door end is where lane A starts
    const p1 = lanes[0] ? lanes[0].ps[0] : null, D = 2.4;
    if (alongZ) {
      const doorHigh = p1 ? p1.z > Z0 - L / 2 : true, mid = Z0 - L / 2, nearHigh = lp ? lp.z > mid : doorHigh, at = nearHigh === doorHigh ? 'door' : 'far';
      const z1 = nearHigh ? Z0 - TW - 0.2 : Z0 - L + TW + 0.2 + D;
      return { x0: X0 + 0.6, x1: X0 + W - 0.6, z0: z1 - D, z1: z1, at: at };
    }
    const doorLow = p1 ? p1.x < X0 + W / 2 : true, midX = X0 + W / 2, nearLow = lp ? lp.x < midX : doorLow, at = nearLow === doorLow ? 'door' : 'far';
    const x0 = nearLow ? X0 + TW + 0.2 : X0 + W - TW - 0.2 - D;
    return { x0: x0, x1: x0 + D, z0: Z0 - L + 0.6, z1: Z0 - 0.6, at: at };
  }
  edHideGhost() {
    if (this.edGh && this.edGh.visible) { this.edGh.visible = false; this.dirty = true; }
    if (this.labels && this.labels.has('edgh')) { const L = this.labels.get('edgh'); if (L && L.el) L.el.remove(); this.labels.delete('edgh'); }
  }
  edRoomGhost(e) {
    const u = this.ui(), h = this.edRoomPick(e), T = this.T;
    if (!h) return;
    const s = this.edSlot(h.rm, u.tool, h.lp), rm = h.rm;
    if (!this.edGh) { const g = new T.Group(), mf = this.mat.ghost.clone(), ml = this.mat.ghostLine.clone(); mf.depthTest = false; ml.depthTest = false; mf.opacity = Math.max(mf.opacity || 0.5, 0.55); const a1 = new T.Mesh(this.unitBox, mf), a2 = new T.LineSegments(this.unitEdges, ml); a1.renderOrder = 9; a2.renderOrder = 10; g.add(a1); g.add(a2); this.scene.add(g); this.edGh = g; }
    const c = rm.g.localToWorld(new T.Vector3((s.x0 + s.x1) / 2, this.Y.YF + 0.15, (s.z0 + s.z1) / 2));
    this.edGh.position.copy(c); this.edGh.rotation.y = rm.g.rotation.y; this.edGh.scale.set(Math.abs(s.x1 - s.x0), 0.3, Math.abs(s.z1 - s.z0));
    this.edGh.visible = true; this.dirty = true;
    this.label('edgh', 'ghost', u.tool === 'lane' ? 'New lane' : s.at === 'door' ? 'Row by the door' : 'Row at the far end', c.x, c.y + 0.9, c.z, {});
  }
  edRoomDrop(e) {
    const u = this.ui(), h = this.edRoomPick(e);
    if (!h) return;
    const s = this.edSlot(h.rm, u.tool, h.lp), k = u.tool;
    this.edHideGhost();
    this.put({ tool: '' });
    if (k === 'lane') { this.addLane(h.rm.id); return; }
    this.openEndRow();
    const a = this.ui().arT; if (a) this.put({ arT: Object.assign({}, a, { at: s.at || a.at, placed: true }) });
  }
