// Edit layout: the farm view's place piece (‹, the name ▾) starts the top bar, joined to the edit tools; the card on the right loses its breadcrumb.
const fs = require('fs'), S = process.argv[2];
let c = fs.readFileSync(S + '/ovh-comp3.js', 'utf8'), cm = fs.readFileSync(S + '/ovh-comp.js', 'utf8');
const rep = (s, a, b) => { if (s.includes(b)) return s; if (!s.includes(a)) { console.log('MISS ' + a.slice(0, 80)); process.exit(1); } return s.split(a).join(b); };
// the tools bar sits right after the place piece, its left edge joined
cm = rep(cm, "r.barStyle = r.barStyle.replace('left: 16px; right: 16px; bottom: 16px;', 'left: 16px; top: 16px; max-width: calc(100% - 440px);');",
  "{ const lw = 16 + (this.ovEdW || 200); r.barStyle = r.barStyle.replace('left: 16px; right: 16px; bottom: 16px;', 'left: ' + lw + 'px; top: 16px; max-width: calc(100% - ' + (lw + 408) + 'px);').replace('border-radius: 16px;', 'border-radius: 0 16px 16px 0; border-left: 0;'); } if (r.P) r.P = Object.assign({}, r.P, { hasTopRow: false, canBack: false });");
// the place piece in the editor
c = rep(c, "    if (!this.ovOn(u) && this.ovEdOn(u)) { const O = this.ovS(), H = OVH, html = this.ovViewHtml(O, u, true) +",
  "    if (!this.ovOn(u) && this.ovEdOn(u)) { const O = this.ovS(), H = OVH, html = this.ovEdLoc(u) + this.ovViewHtml(O, u, true) +");
c = rep(c, "if (html !== this.ovLast) { this.ovBody.innerHTML = html; this.ovLast = html; } return; }",
  "if (html !== this.ovLast) { this.ovBody.innerHTML = html; this.ovLast = html; } this.ovEdFit(); return; }");
c += `
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
`;
// in the editor the switcher counts places, not pigs
c = rep(c, "n: k ? k + ' pigs' : 'empty',", "n: this.ui().vm === 'edit' ? (x.rooms.length + (x.rooms.length === 1 ? ' room' : ' rooms')) : (k ? k + ' pigs' : 'empty'),");
fs.writeFileSync(S + '/ovh-comp3.js', c); fs.writeFileSync(S + '/ovh-comp.js', cm); console.log('ok');
