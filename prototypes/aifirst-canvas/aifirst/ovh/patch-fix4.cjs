const fs = require('fs'), S = process.argv[2];
let c = fs.readFileSync(S + '/ovh-comp3.js', 'utf8'), p = fs.readFileSync(S + '/ovh-pages2.js', 'utf8'), lib = fs.readFileSync(S + '/ovh-lib.js', 'utf8');
const rep = (s, a, b) => { if (s.includes(b)) return s; if (!s.includes(a)) { console.log('MISS ' + a.slice(0, 80)); process.exit(1); } return s.split(a).join(b); };
// a pen is not switched from the bar: its name is just its name
c = rep(c, "canSwitch = P.cur.kind !== 'farm',", "canSwitch = P.cur.kind !== 'farm' && P.cur.kind !== 'pen',");
// her litters live in Performance only
p = rep(p, "H.sec('Her litters', '') + H.card(littersMini(P.litters, P)) +", "");
// Select while a pen is open: that pen is already picked
c = rep(c, "    if (k === 'select') { if (O.selecting) { this.ovAct('selcancel'); return true; } if (O.panel === 'pen') O.ticks = []; this.ovPlanIn(); this.setSel([]); this.ovSet({ selecting: true, picked: [], pop: '', actOff: 0 }); return true; }",
  "    if (k === 'select') { if (O.selecting) { this.ovAct('selcancel'); return true; } const cur = ['pig', 'pen', 'pigperf', 'piglog'].indexOf(O.panel) >= 0 && (u.psel || []).length === 1 ? u.psel.slice() : []; if (cur.length) { O.panel = ''; O.hist = []; } O.ticks = []; this.ovPlanIn(); this.ovPsel = cur.join(','); this.setSel(cur); this.ovSet({ selecting: true, picked: cur.slice(), pop: '', actOff: 0 }); return true; }");
// a long legend label wraps under itself, never into its number
lib = rep(lib, "t(x.label, { flex: 1, fontSize: '14px', color: x.warn ? K.amber : K.ink, fontWeight: x.warn || on ? 500 : 400 })", "t(x.label, { flex: 1, minWidth: 0, whiteSpace: 'normal', lineHeight: '18px', fontSize: '14px', color: x.warn ? K.amber : K.ink, fontWeight: x.warn || on ? 500 : 400 })");
lib = rep(lib, "height: (o.h || 36) + 'px'", "minHeight: (o.h || 36) + 'px', paddingTop: '4px', paddingBottom: '4px', boxSizing: 'border-box'");
fs.writeFileSync(S + '/ovh-comp3.js', c); fs.writeFileSync(S + '/ovh-pages2.js', p); fs.writeFileSync(S + '/ovh-lib.js', lib); console.log('ok');
