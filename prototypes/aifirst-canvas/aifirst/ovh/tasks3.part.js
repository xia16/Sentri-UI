// ===== into a group pen: the camera flies in, the pigs are arranged by state inside the pen; no pig list anywhere on the map =====
const ZP = JSON.parse(fs.readFileSync(path.join(__dirname, 'zpoly.json'), 'utf8'));
const PIGC = { look: '#D9A441', todo: '#3972B7', done: '#4F9E62' };
const bil = (q, u, v) => [(1 - u) * (1 - v) * q[0][0] + u * (1 - v) * q[1][0] + u * v * q[2][0] + (1 - u) * v * q[3][0], (1 - u) * (1 - v) * q[0][1] + u * (1 - v) * q[1][1] + u * v * q[2][1] + (1 - u) * v * q[3][1]];
// pigs: [state, tag or ''] in the order they are drawn (needs a look, to do, done); rows run across the pen
const penIn = (q, pigs, cols, o) => {
  o = o || {};
  const rows = Math.ceil(pigs.length / cols), ang = Math.atan2(q[1][1] - q[0][1], q[1][0] - q[0][0]) * 180 / Math.PI;
  const lu = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]), lv = Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]);
  const rx = Math.min(lu / cols * 0.34, 24), ry = Math.min(lv / rows * 0.24, 13);
  let s = '<polygon points="' + q.map((p) => p.join(',')).join(' ') + '" fill="#F5F3EC" stroke="' + K.ink + '" stroke-width="2.2"></polygon>', labels = '';
  pigs.forEach((p, i) => {
    const c = i % cols, r = Math.floor(i / cols), at = bil(q, (c + 0.5) / cols, 0.08 + (r + 0.5) / rows * 0.84), col = PIGC[p[0]], tagged = !!p[1];
    s += '<ellipse cx="' + at[0].toFixed(1) + '" cy="' + at[1].toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" transform="rotate(' + ang.toFixed(1) + ' ' + at[0].toFixed(1) + ' ' + at[1].toFixed(1) + ')" fill="' + col + '" fill-opacity="' + (tagged ? 1 : 0.42) + '" stroke="' + (o.hot === p[1] && tagged ? K.ink : '#FFFFFF') + '" stroke-width="' + (o.hot === p[1] && tagged ? 2.4 : tagged ? 1.4 : 0.8) + '"></ellipse>';
    if (tagged && (!o.tagsOnly || o.tagsOnly.indexOf(p[0]) >= 0)) labels += '<span style="' + st({ position: 'absolute', left: at[0] + 'px', top: (at[1] - ry - 11) + 'px', transform: 'translate(-50%, -50%)', padding: '1px 5px', borderRadius: '5px', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(17,21,17,.18)', fontSize: '10.5px', fontWeight: 600, color: K.ink, whiteSpace: 'nowrap' }) + '">' + p[1] + '</span>';
  });
  const bot = bil(q, 0.5, 1);
  return { svg: s, labels: labels + (o.note ? '<span style="' + st({ position: 'absolute', left: bot[0] + 'px', top: (bot[1] + 18) + 'px', transform: 'translate(-50%, 0)', padding: '3px 8px', borderRadius: '7px', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(17,21,17,.16)', fontSize: '12px', color: K.muted, whiteSpace: 'nowrap' }) + '">' + o.note + '</span>' : '') };
};
const penLayer = (parts) => '<svg viewBox="0 0 950 830" style="position: absolute; inset: 0; width: 950px; height: 830px; pointer-events: none;">' + parts.map((x) => x.svg).join('') + '</svg>' + parts.map((x) => x.labels).join('');
const penBar = (kind, name) => card({ left: '12px', right: '12px', top: BT + 'px' }, sq(I.back) + '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '9px', height: '40px', padding: '0 10px 0 6px' }) + '"><span style="' + st({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '9px', background: K.press }) + '">' + ic(PENI, 17) + '</span>' + t(name, { fontSize: '17px', fontWeight: 600 }) + '</span>' + sep + btn(I.pig, 'Pigs', { n: kind }) + btn(I.tool, 'Devices') + '<span style="flex: 1;"></span>' + btn(I.select, 'Select'), { display: 'flex', alignItems: 'center', gap: '2px', padding: '0 8px', height: '56px' });
const penPane = (back, title, sub, parts, total, big, small, note) => paneSlim(thead({ back: back, title: title, sub: sub, ico: PENI, icoBg: K.press, icoInk: K.ink }), gauge(parts, total, big, small) + (note ? mu(note, { display: 'block', margin: '8px 4px 0', fontSize: '12.5px', whiteSpace: 'normal' }) : ''));
const tabsG = () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Gilt vaccine · Batch 35G');
const fill = (st0, n, tags) => Array.from({ length: n }, (_, i) => [st0, (tags || [])[i] || '']);

const B11p = fill('todo', 3, ['310418']).concat(fill('done', 6, ['310412']));
const B12p = fill('look', 2, ['310422']).concat(fill('done', 7));
const A3p = fill('look', 1, ['35G-018']).concat(fill('todo', 5, ['35G-004', '35G-011', '35G-019', '35G-022', '35G-031'])).concat(fill('done', 18, Array.from({ length: 18 }, (_, i) => '35G-0' + (40 + i))));
const at418 = bil(ZP.zb11.B11, 0.5 / 3, 0.08 + 0.5 / 3 * 0.84);

frames.g1 = { bg: 'zb11', cap: 'Click a group pen: the camera flies in and its nine weaners are arranged by state, to do first, then done. Tagged pigs are solid with their tag; untagged ones are drawn lighter, as a count, never as known individuals. The pane is the pen\'s own gauge. Hover a tagged pig for her line.', html: () => tabsV() + penBar('9', 'Pen B11') + penLayer([penIn(ZP.zb11.B11, B11p, 3, { hot: '310418', note: '7 untagged · counted at the pen' })]) + penPane('PRRS vaccine', 'Pen B11', 'Nursery 1 · 9 weaners', [[ST.done[0], 'Done', 6], [ST.todo[0], 'To do', 3]], 9, '6', 'of 9 done', '2 tagged, 7 untagged') + vctl + hov(436, at418[1] - 10, 178, '310418', 'Weaner · B11', [['', 'To do', 'PRRS vaccine, not given yet', '#3972B7']], 'Click to open her profile') };
frames.g2 = { bg: 'zb12', cap: 'A pen that needs a look: the two coughing weaners come first, amber; the reason is in the pane, with who said so. The other seven are done.', html: () => tabsV() + penBar('9', 'Pen B12') + penLayer([penIn(ZP.zb12.B12, B12p, 3, { note: '8 untagged · counted at the pen' })]) + penPane('PRRS vaccine', 'Pen B12', 'Nursery 1 · 9 weaners', [[ST.look[0], 'Needs a look', 2], [ST.done[0], 'Done', 7]], 9, '7', 'of 9 done', '2 coughing, not vaccinated · 08:20 G.H') + vctl };
frames.g3 = { bg: 'zq', cap: 'A big pen, 24 gilts, all tagged: still three blocks. Tags show only where there is something left to do (amber and blue); the 18 done stay unlabelled so the pen stays readable.', html: () => tabsG() + penBar('24', 'Pen A3') + penLayer([penIn(ZP.zq.A3, A3p, 6, { tagsOnly: ['look', 'todo'] })]) + penPane('Gilt vaccine', 'Pen A3', 'Quarantine 1 · 24 gilts', [[ST.look[0], 'Needs a look', 1], [ST.todo[0], 'To do', 5], [ST.done[0], 'Done', 18]], 24, '18', 'of 24 done', '35G-018 lame, not vaccinated · 09:05 Li Wei') + vctl };
