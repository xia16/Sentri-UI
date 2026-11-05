// Edit layout gets the farm view's chrome: 3D bottom left, Done on its own top right, the edit tools along the bottom beside 3D.
const fs = require('fs'), S = process.argv[2];
let c = fs.readFileSync(S + '/ovh-comp3.js', 'utf8'), cm = fs.readFileSync(S + '/ovh-comp.js', 'utf8');
const rep = (s, a, b) => { if (s.includes(b)) return s; if (!s.includes(a)) { console.log('MISS ' + a.slice(0, 80)); process.exit(1); } return s.split(a).join(b); };
// when the editor is up, paint just its chrome
c = rep(c, "  ovPaint() {\n    if (!this.ovBody) return;\n    const u = this.ui();\n    if (!this.ovOn(u)) { if (this.ovLast !== '') { this.ovBody.innerHTML = ''; this.ovLast = ''; this.ovTipHide(); } return; }",
  "  ovEdOn(u) { return !!(u.ready && !u.err && this.IP && u.vm === 'edit' && u.mode === 'saved' && !(this.props.start || '').match(/^intro/)); }\n  ovPaint() {\n    if (!this.ovBody) return;\n    const u = this.ui();\n    if (!this.ovOn(u) && this.ovEdOn(u)) { const O = this.ovS(), H = OVH, html = this.ovViewHtml(O, u, true) + this.ovCard({ right: '16px', top: '16px' }, this.ovBtn(H.icon(H.I.check, 18) + 'Done', 'vw:modeToggle', false, { background: H.K.ink, color: '#FFFFFF', fontWeight: 600, padding: '0 16px' })); if (html !== this.ovLast) { this.ovBody.innerHTML = html; this.ovLast = html; } return; }\n    if (!this.ovOn(u)) { if (this.ovLast !== '') { this.ovBody.innerHTML = ''; this.ovLast = ''; this.ovTipHide(); } return; }");
// in the editor the 3D menu has no Edit layout line (Done is the way out)
c = rep(c, "  ovViewHtml(O, u) {", "  ovViewHtml(O, u, ed) {");
c = rep(c, "      '</div><div style=\"' + H.st({ height: '1px', background: K.line, margin: '6px 0' }) + '\"></div>' + this.ovBtn(H.icon(I.edit, 18) + 'Edit layout', 'vw:modeToggle', false, { width: '100%', justifyContent: 'flex-start', padding: '0 4px' }) + '</div>';",
  "      '</div>' + (ed ? '' : '<div style=\"' + H.st({ height: '1px', background: K.line, margin: '6px 0' }) + '\"></div>' + this.ovBtn(H.icon(I.edit, 18) + 'Edit layout', 'vw:modeToggle', false, { width: '100%', justifyContent: 'flex-start', padding: '0 4px' })) + '</div>';");
// the old camera bar goes in the editor too; the edit bar starts right of the 3D button
cm = rep(cm, "    if (this.ovOn()) r.camStyle = (r.camStyle || '') + ' display: none;';\n", "    if (this.ovOn()) r.camStyle = (r.camStyle || '') + ' display: none;';\n    if (this.ovEdOn && this.ovEdOn(this.ui())) { r.camStyle = (r.camStyle || '') + ' display: none;'; if (r.barStyle) r.barStyle = r.barStyle.replace('left: 16px; right: 16px; bottom: 16px;', 'left: 132px; right: 16px; bottom: 16px;'); }\n");
fs.writeFileSync(S + '/ovh-comp3.js', c); fs.writeFileSync(S + '/ovh-comp.js', cm); console.log('ok');
