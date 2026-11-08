// Farm view audit fixes (mock first, 8 Nov): one colour ladder at every level, batch without pink, neutral empties at night,
// no stale hover, tags at their own stall's end, lamps quiet by day.
const fs = require('fs');
const F = process.argv[2];
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 100)); process.exit(1); } s = s.replace(a, () => b); };

// 1. farm and section level: the same ladder as a room (amber / a sow / empty), not the pen type's colour
once("      if (amt > 0) c.lerp(paper, amt);\n      if (vt > 0 && vp) {",
  "      if (this.penLadder && !(vt > 0)) { const lc = this.penLadder(rm, p.code); if (lc) { c.set(lc); if (amt > 0) c.lerp(paper, amt); } }\n      if (amt > 0 && !(this.penLadder && !(vt > 0) && this.penLadder(rm, p.code))) c.lerp(paper, amt);\n      if (vt > 0 && vp) {");
once("      const sa = Math.max(rm.dim * 0.86, (rm.fd || 0) * 0.65, this.hlType && sp.t !== this.hlType ? 0.84 : 0);\n      if (sa > 0) c.lerp(paper, sa);",
  "      const sa = Math.max(rm.dim * 0.86, (rm.fd || 0) * 0.65, this.hlType && sp.t !== this.hlType ? 0.84 : 0);\n      { const lc = this.penLadder ? this.penLadder(rm, sp.code) : null; if (lc) c.set(lc); }\n      if (sa > 0) c.lerp(paper, sa);");
// the ladder applies in the Farm view itself (not in Edit, where the pen types are the point)
once("  penOcc() {", "  penLadder(rm, code) { const u = this.ui(), ip = this.IPfull || this.IP; if (!ip || u.mode !== 'saved' || u.vm === 'edit') return null; const cc = (ip.cell[rm.id] || {})[code]; return cc && cc.flag ? this.penAmber() : (cc && cc.kind ? this.penOcc() : this.penEmpty()); }\n  penOcc() {");

// 2. batch view: the batch's stalls a step darker than occupied, every other stall near-white; no pink
once("    return '#E8B9AC';\n", "    return '#b4bba9';\n");

// 3. night: a warm off-white for empty stalls so the blue night light doesn't make them read as "in progress"
once("  penEmpty() { return '#f6f7f3'; }", "  penEmpty() { return (this.nt || 0) > 0.5 ? '#ece6d8' : '#f6f7f3'; }");
once("  toggleNight() {\n", "  toggleNight() {\n    clearTimeout(this.ntPaint); this.ntPaint = setTimeout(() => { if (!this.alive) return; this.rooms.forEach((r) => this.paintRoom(r)); this.dirty = true; }, 650);\n");

// 4. a hover card never outlives the place it was about
once("  goRoom(id) {\n    const u = this.ui();\n", "  goRoom(id) {\n    this.tipHide();\n    const u = this.ui();\n");
once("  goScope(zoneId, secId, o) {\n", "  goScope(zoneId, secId, o) {\n    this.tipHide();\n");

// 5 + 6. a pen code stands at its own stall's end, just inside it, at every zoom; not on the middle of the stall, not across the aisle
once("        ps.forEach((p) => { p.lx = labLeft[ln.i] ? xA - 0.45 : xB + 0.45; });", "        ps.forEach((p) => { p.lx = labLeft[ln.i] ? xA + 0.32 : xB - 0.32; });");
once("        tv.set(p.x + (tx - p.x) * k, by + (ty - by) * k, p.z + (tz - p.z) * k);", "        { const bx = p.lx != null ? p.lx : p.x; tv.set(bx + (tx - bx) * k, by + (ty - by) * k, p.z + (tz - p.z) * k); }");
once("        if (!vt && !own) return;\n        const p = L.pen,", "        if (!vt && !own && L.pen.lx == null) return;\n        const p = L.pen,");

// 7. heat lamps: their warm pool on the floor is faint by day and full at night, so it never reads as amber
once("  applyLook() {\n    const T = this.T, k = this.nt;\n", "  applyLook() {\n    const T = this.T, k = this.nt;\n    if (this.pigKit && this.pigKit.glowMat) this.pigKit.glowMat.opacity = 0.18 + 0.82 * k;\n");

fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
// 7b. the lamps are built after the look is set: give them the same day/night strength when they appear, hood glow included
s = fs.readFileSync(F, 'utf8');
const once2 = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 100)); process.exit(1); } s = s.replace(a, () => b); };
once2("    if (!this.pigKit) this.pigKit = P.pigKit(T);", "    if (!this.pigKit) this.pigKit = P.pigKit(T);\n    { const k = this.nt || 0; this.pigKit.glowMat.opacity = 0.18 + 0.82 * k; this.pigKit.hoodOnMat.emissiveIntensity = 0.12 + 0.43 * k; }");
once2("    if (this.pigKit && this.pigKit.glowMat) this.pigKit.glowMat.opacity = 0.18 + 0.82 * k;", "    if (this.pigKit && this.pigKit.glowMat) { this.pigKit.glowMat.opacity = 0.18 + 0.82 * k; this.pigKit.hoodOnMat.emissiveIntensity = 0.12 + 0.43 * k; }");
fs.writeFileSync(F, s);
console.log('lamps patched');
// 7c. the pig fade drives every pig material's opacity, the glow included: scale the glow by the time of day there too
s = fs.readFileSync(F, 'utf8');
once2("      m.opacity = k;\n    });\n    rm.pg.visible = k > 0;", "      m.opacity = k;\n    });\n    this.pigKit.glowMat.opacity = k * (0.18 + 0.82 * (this.nt || 0));\n    rm.pg.visible = k > 0;");
fs.writeFileSync(F, s);
console.log('glow fade patched');
