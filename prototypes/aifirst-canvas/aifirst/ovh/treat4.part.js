// ===== v5: a group pen has no card; zooming in lines its pigs up in sections by state; tagged pigs click through =====
const SECF = { skip: AF, due: PF, done: DF }, SECI = { skip: AFI, due: PFI, done: DFI };
// one pig seen from above: body and head along the pen's axis, all the same way
const pigGlyph = (x, y, ang, s, o) => { o = o || {}; const rx = 13 * s, ry = 7.5 * s, hx = rx * 0.95; const rad = ang * Math.PI / 180, hxp = x + Math.cos(rad) * hx, hyp = y + Math.sin(rad) * hx;
  return '<g' + (o.hot ? ' filter="url(#pigsh)"' : '') + '><ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" transform="rotate(' + ang.toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + (o.untagged ? '#EBC9BE' : '#E3A999') + '" stroke="' + (o.hot ? K.ink : '#C98F82') + '" stroke-width="' + (o.hot ? 2.2 : 0.8) + '"></ellipse><ellipse cx="' + hxp.toFixed(1) + '" cy="' + hyp.toFixed(1) + '" rx="' + (ry * 0.75).toFixed(1) + '" ry="' + (ry * 0.62).toFixed(1) + '" transform="rotate(' + ang.toFixed(1) + ' ' + hxp.toFixed(1) + ' ' + hyp.toFixed(1) + ')" fill="' + (o.untagged ? '#EBC9BE' : '#E3A999') + '" stroke="' + (o.hot ? K.ink : '#C98F82') + '" stroke-width="' + (o.hot ? 2.2 : 0.8) + '"></ellipse></g>'; };
// sections: [state, label, pigs: tags or '' for untagged]; the pen is split along its length by count; each section a tinted floor, pigs in rows
const penSections = (q, secs, o) => {
  o = o || {}; const total = secs.reduce((a, s) => a + Math.max(s[2].length, 3), 0); let u0 = 0, svg = '', lab = '';
  const ang = Math.atan2(q[3][1] - q[0][1], q[3][0] - q[0][0]) * 180 / Math.PI;
  svg += '<polygon points="' + q.map((p) => p.join(',')).join(' ') + '" fill="#F5F3EC" stroke="' + K.ink + '" stroke-width="2"></polygon>';
  secs.forEach((sec) => {
    const w = Math.max(sec[2].length, 3) / total, u1 = u0 + w, g = 0.012;
    const poly = [bil(q, u0 + g, 0.03), bil(q, u1 - g, 0.03), bil(q, u1 - g, 0.97), bil(q, u0 + g, 0.97)];
    svg += '<polygon points="' + poly.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ') + '" fill="' + SECF[sec[0]] + '" fill-opacity=".85"></polygon>';
    const n = sec[2].length, cols = Math.max(1, Math.round(Math.sqrt(n * w * 2.2))), rows = Math.ceil(n / cols);
    const sc = Math.max(0.45, Math.min(o.maxScale || 1, (o.scale || 1) * Math.min(1, 3.2 / Math.max(rows, cols / 1.6))));
    sec[2].forEach((tag, i) => {
      const c = i % cols, r = Math.floor(i / cols), at = bil(q, u0 + w * (c + 0.5) / cols, 0.1 + (r + 0.5) / rows * 0.8), hot = o.hot === tag && tag;
      svg += pigGlyph(at[0], at[1], ang, sc, { untagged: !tag, hot: hot });
      if (tag && !o.noTags) lab += '<span style="' + st({ position: 'absolute', left: at[0] + 'px', top: (at[1] - 12 * sc - 12) + 'px', transform: 'translate(-50%, -50%)', padding: '1px 5px', borderRadius: '5px', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(17,21,17,.18)', fontSize: '10.5px', fontWeight: 600, whiteSpace: 'nowrap' }) + '">' + tag + '</span>';
    });
    if (sec[3]) { const at = bil(q, u0 + w * 0.82, 0.86); lab += '<span style="' + st({ position: 'absolute', left: at[0] + 'px', top: at[1] + 'px', transform: 'translate(-50%, -50%)', padding: '2px 7px', borderRadius: '6px', background: '#FFFFFF', fontSize: '11.5px', fontWeight: 600, color: K.ink, boxShadow: '0 1px 3px rgba(17,21,17,.16)', whiteSpace: 'nowrap' }) + '">' + sec[3] + '</span>'; }
    const lp = bil(q, (u0 + u1) / 2, 1.0); lab += '<span style="' + st({ position: 'absolute', left: lp[0] + 'px', top: (lp[1] + 14) + 'px', transform: 'translate(-50%, 0)', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '7px', background: SECF[sec[0]], color: SECI[sec[0]], fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }) + '">' + sec[1] + '</span>';
    u0 = u1;
  });
  return '<svg viewBox="0 0 950 830" style="position: absolute; inset: 0; width: 950px; height: 830px; pointer-events: none;"><defs><filter id="pigsh"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity=".35"></feDropShadow></filter></defs>' + svg + '</svg>' + lab;
};
const QB12 = ZP.zb12.B12;
const grpPane = () => paneSlim(thead({ title: 'Treatment RX-25G011', sub: 'Florfenicol · day 3 of 3 today' }), gauge([[DM, 'Given', 41], [PM, 'Due', 20], [LM, 'Skipped', 2]], 63, '41', 'of 63 today') + '<div style="display: flex; gap: 8px; margin-top: 12px;">' + fbtn(ic(SC2.ext, 15) + '&nbsp; Open page') + '</div>');
const B12secs = [['skip', 'Skipped 2', ['310422', '']], ['due', 'Due 2', ['310418', '']], ['done', 'Given 5', ['310412', '', '', '', '']]];
const p422 = () => paneSlim(backHead('Treatment RX-25G011'), who('310422', 'Weaner · Pen B12', I.pig, profBtn) + course2('Day 3 skipped today', '2 of 3 skipped', segBarHot(['done', 'skip', 'skip'], 1, 'Day 2 · Skipped', 'Thu 08:14 · could not catch · G.H'), 'Wed', 'Fri', wChip('Withdrawal ends 25 Nov')));
const crowd = [['skip', 'Skipped 1', ['']], ['due', 'Due 6', ['310455', '', '', '', '', '']], ['done', 'Given 23', ['310441', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''], '+5']];

frames.p1 = { bg: 'zb12', cap: 'Click a group pen: no pen card. The pane stays on the task; the camera flies in and the pigs line up in sections by state, Skipped, Due, Given, each on a tinted floor, all facing the same way. Tagged pigs carry their tag; untagged ones are drawn plainer and counted.', html: () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G011') + penBar('9', 'Pen B12') + penSections(QB12, B12secs) + grpPane() + vctl };
frames.p2 = { bg: 'zb12', cap: 'Click a tagged pig: her treatment view, one segment per day; hover a day for what happened. Untagged pigs only say "Untagged · counted at the pen" on hover.', html: () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G011') + penBar('9', 'Pen B12') + penSections(QB12, B12secs, { hot: '310422' }) + vctl + p422() };
frames.p3 = { bg: 'zb12', cap: 'A small pen holding 30: the figures shrink to fit the grid, down to a floor size; past that, Given folds to a few and "+5", because the pigs still to do matter most. Zoom out, click empty map or ‹ and the pigs go back to where they lie.', html: () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G011') + penBar('30', 'Pen B12') + penSections(QB12, crowd, { scale: 0.62 }) + grpPane() + vctl };
