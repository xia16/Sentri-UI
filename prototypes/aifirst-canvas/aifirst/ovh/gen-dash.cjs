// Home dashboards as chart cards: farm-wide only (never a batch), lines first, detail on hover. From the old web Home: PSY, herd on hand, health.
const fs = require('fs');
const [out, shell] = process.argv.slice(2);
const K = { tint: '#F6F7F1', paper: '#FFFFFF', line: '#E4E6E0', ink: '#1B211C', muted: '#6B726D', faint: '#9AA19C', grid: '#EEF0EB', green: '#2F7A55', greenA: 'rgba(47,122,85,.12)', blue: '#3972B7', blueA: 'rgba(57,114,183,.12)', grey: '#C9CEC6', red: '#B34B43' };
const st = (o) => Object.entries(o).map(([k, v]) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ': ' + v).join('; ') + ';';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const t = (s, o) => '<span style="' + st(Object.assign({ fontSize: '14px', lineHeight: '20px', color: K.ink, whiteSpace: 'nowrap' }, o || {})) + '">' + esc(s) + '</span>';
const mu = (s, o) => t(s, Object.assign({ fontSize: '12.5px', lineHeight: '18px', color: K.muted }, o || {}));
const icon = (d, n) => '<svg viewBox="0 0 24 24" aria-hidden="true" style="width: ' + (n || 16) + 'px; height: ' + (n || 16) + 'px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;"><path d="' + d + '"></path></svg>';
const I = { search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z M20 20l-4-4', chev: 'm9 5 7 7-7 7', home: 'M4 11 12 4l8 7v9H4z', map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14', expand: 'M14 4h6v6 M10 20H4v-14 M20 4l-7 7', inbox: 'M4 13h4l2 3h4l2-3h4 M4 13l2-8h12l2 8v6H4z', cal: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4' };

// ----- charts (inline SVG) -----
const W = 376;
function line(vals, o) {
  o = o || {}; const h = o.h || 92, lo = o.min != null ? o.min : Math.min(...vals), hi = o.max != null ? o.max : Math.max(...vals), pad = 6;
  const x = (i) => (i / (vals.length - 1)) * W, y = (v) => pad + (1 - (v - lo) / (hi - lo)) * (h - 2 * pad);
  const pts = vals.map((v, i) => [x(i), y(v)]), d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const col = o.col || K.green, area = o.area || K.greenA;
  let s = '<svg viewBox="0 0 ' + W + ' ' + h + '" style="display: block; width: ' + W + 'px; height: ' + h + 'px; overflow: visible;">';
  [0.25, 0.5, 0.75].forEach((f) => { s += '<line x1="0" x2="' + W + '" y1="' + (pad + f * (h - 2 * pad)).toFixed(1) + '" y2="' + (pad + f * (h - 2 * pad)).toFixed(1) + '" stroke="' + K.grid + '"></line>'; });
  if (o.target != null) s += '<line x1="0" x2="' + W + '" y1="' + y(o.target).toFixed(1) + '" y2="' + y(o.target).toFixed(1) + '" stroke="' + K.faint + '" stroke-dasharray="4 4"></line><text x="0" y="' + (y(o.target) - 5).toFixed(1) + '" text-anchor="start" font-size="11" fill="' + K.muted + '" font-family="Geist, system-ui">target ' + o.target + '</text>';
  s += '<path d="' + d + ' L' + W + ' ' + h + ' L0 ' + h + ' Z" fill="' + area + '"></path><path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linejoin="round"></path>';
  if (o.hover != null) { const p = pts[o.hover]; s += '<line x1="' + p[0].toFixed(1) + '" x2="' + p[0].toFixed(1) + '" y1="0" y2="' + h + '" stroke="' + K.ink + '" stroke-opacity=".25"></line><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" fill="#fff" stroke="' + col + '" stroke-width="2"></circle>'; }
  else { const p = pts[pts.length - 1]; s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="' + col + '"></circle>'; }
  s += '</svg>';
  const ax = o.axis ? '<div style="' + st({ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }) + '">' + o.axis.map((a) => mu(a, { fontSize: '11px', lineHeight: '14px', color: K.faint })).join('') + '</div>' : '';
  return { svg: s + ax, pts: pts };
}
function bars(vals, o) {
  o = o || {}; const h = o.h || 56, hi = Math.max(...vals), bw = W / vals.length;
  let s = '<svg viewBox="0 0 ' + W + ' ' + h + '" style="display: block; width: ' + W + 'px; height: ' + h + 'px;">';
  vals.forEach((v, i) => { const bh = Math.max(2, (v / hi) * (h - 4)); s += '<rect x="' + (i * bw + 2).toFixed(1) + '" y="' + (h - bh).toFixed(1) + '" width="' + (bw - 4).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2" fill="' + (o.hover === i ? K.ink : K.grey) + '"></rect>'; });
  return s + '</svg>';
}
const hbars = (rows, hover) => { const hi = Math.max(...rows.map((r) => r[1])); return rows.map((r, i) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px', height: '28px' }) + '">' + t(r[0], { width: '96px', fontSize: '13px', color: hover === i ? K.ink : K.muted, fontWeight: hover === i ? 600 : 400 }) + '<span style="' + st({ flex: 1, height: '10px', borderRadius: '5px', background: K.grid, overflow: 'hidden' }) + '"><i style="' + st({ display: 'block', height: '100%', width: (r[1] / hi * 100).toFixed(0) + '%', borderRadius: '5px', background: hover === i ? K.blue : '#9DB7D8' }) + '"></i></span>' + t(String(r[1]), { width: '24px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }) + '</div>').join(''); };
const tip = (title, rows, x, y) => '<div style="' + st({ position: 'absolute', left: x + 'px', top: y + 'px', minWidth: '170px', padding: '10px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid ' + K.line, boxShadow: '0 4px 16px rgba(32,41,31,.14)', zIndex: 3 }) + '">' + t(title, { fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '6px' }) + rows.map((r) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '22px' }) + '">' + (r[2] ? '<i style="' + st({ width: '8px', height: '8px', borderRadius: '2px', background: r[2], flexShrink: 0 }) + '"></i>' : '') + t(r[0], { flex: 1, fontSize: '12.5px', color: K.muted }) + t(r[1], { fontSize: '12.5px', fontWeight: 600 }) + '</div>').join('') + '</div>';

// ----- data: one farm, farm-wide -----
const herd = [1872, 1880, 1891, 1905, 1898, 1910, 1922, 1931, 1925, 1918, 1930, 1944, 1951, 1940, 1936, 1948, 1960, 1971, 1965, 1958, 1949, 1955, 1962, 1970, 1966, 1959, 1950, 1946, 1949, 1953];
const psy = [26.1, 26.4, 26.9, 27.2, 27.0, 27.5, 27.8, 28.1, 27.9, 28.2, 28.4, 28.5];
const born = [11.6, 11.9, 12.1, 11.8, 12.3, 12.0, 12.4, 12.2, 12.6, 12.3, 12.5, 12.4, 12.4];
const sick = [6, 7, 7, 9, 11, 12, 12, 10, 9, 8, 8, 7, 9, 10, 9, 8, 7, 7, 6, 8, 9, 11, 12, 10, 9, 9, 8, 9, 9, 9];
const deaths = [5, 4, 6, 3, 4, 7, 5, 4, 6, 9, 8, 5];
const issues = [['Lameness', 14], ['Fever', 9], ['Diarrhoea', 6], ['Cough', 4], ['Skin', 2]];
const kinds = [['Sows', '412', '#2F7A55'], ['Boars', '6', '#5E8F74'], ['Gilts', '24', '#8DB39D'], ['Piglets', '553', '#B9D3C2'], ['Weaners', '958', '#DCE9E0']];

const card = (title, sub, big, unit, side, chart, o) => { o = o || {}; return '<div style="' + st({ position: 'relative', padding: '14px 16px 14px', background: K.paper, border: '1px solid ' + K.line, borderRadius: '14px' }) + '"><div style="' + st({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }) + '">' + t(title, { fontSize: '14px', fontWeight: 600 }) + mu(sub) + '</div><div style="' + st({ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0 10px' }) + '">' + t(big, { fontSize: '26px', lineHeight: '30px', fontWeight: 600, letterSpacing: '-.02em' }) + mu(unit, { fontSize: '13px' }) + (side ? '<span style="margin-left: auto;">' + side + '</span>' : '') + '</div>' + chart + (o.extra || '') + '</div>'; };
const head = (s) => '<div style="' + st({ margin: '22px 4px 10px' }) + '">' + t(s, { fontSize: '15px', fontWeight: 600 }) + '</div>';
const legend = '<div style="' + st({ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: '10px' }) + '">' + kinds.map((k) => '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '5px' }) + '"><i style="' + st({ width: '8px', height: '8px', borderRadius: '2px', background: k[2] }) + '"></i>' + mu(k[0] + ' ' + k[1], { fontSize: '12px' }) + '</span>').join('') + '</div>';
const stack = '<div style="' + st({ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px', marginTop: '12px' }) + '">' + kinds.map((k) => '<i style="' + st({ flex: k[1].replace(',', ''), background: k[2] }) + '"></i>').join('') + '</div>';

function dashboards(hv) {
  hv = hv || {};
  const hl = line(herd, { min: 1840, max: 1990, hover: hv.herd, axis: ['7 Oct', '21 Oct', '5 Nov'] });
  const pl = line(psy, { min: 25.5, max: 29, target: 28, axis: ['Dec', 'Jun', 'Nov'] });
  const bl = line(born, { min: 11.2, max: 13, target: 12, col: K.green, axis: ['13 weeks ago', 'this week'] });
  const sl = line(sick, { min: 0, max: 14, col: K.blue, area: K.blueA, h: 70, hover: hv.sick });
  let herdTip = '', sickTip = '';
  if (hv.herd != null) { const p = hl.pts[hv.herd]; herdTip = tip('Thu 23 Oct', [['On hand', '1,966'], ['In', '+38 born'], ['Out', '−31 sold, −4 died']], Math.min(p[0] + 26, 200), p[1] + 70); }
  if (hv.sick != null) { const p = sl.pts[hv.sick]; sickTip = tip('Mon 13 Oct', [['On treatment', '12', K.blue], ['Lameness', '5'], ['Fever', '4'], ['Other', '3']], Math.min(p[0] - 60, 200), p[1] + 64); }
  return head('Production') +
    card('Pigs on hand', 'last 30 days', '1,953', 'pigs', mu('+81 since 7 Oct'), hl.svg, { extra: stack + legend + herdTip }) + '<div style="height: 10px;"></div>' +
    card('PSY', 'rolling 12 months', '28.5', 'weaned per sow a year', '', pl.svg) + '<div style="height: 10px;"></div>' +
    card('Born alive per litter', 'every litter, by week', '12.4', 'piglets', '', bl.svg) +
    head('Health') +
    card('Pigs on treatment', 'last 30 days', '9', 'pigs', '', sl.svg + '<div style="' + st({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '14px 0 6px' }) + '">' + t('Deaths a week', { fontSize: '13px', fontWeight: 500 }) + mu('5 this week') + '</div>' + bars(deaths, { hover: hv.deaths }), { extra: sickTip }) + '<div style="height: 10px;"></div>' +
    card('Top health problems', 'last 30 days', '35', 'cases', '', '<div style="margin-top: 2px;">' + hbars(issues, hv.issue) + '</div>');
}

const tabs = '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '4px', height: '48px', padding: '0 10px', background: K.paper, borderBottom: '1px solid ' + K.line }) + '"><span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 10px', borderRadius: '8px', background: '#EEF0EA', fontSize: '13px', fontWeight: 600 }) + '">' + icon(I.home, 15) + 'Home<span style="' + st({ minWidth: '18px', height: '18px', borderRadius: '9px', background: K.ink, color: '#FFF', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }) + '">6</span></span><span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 10px', fontSize: '13px', color: K.muted }) + '">' + icon(I.map, 15) + 'Farm view</span><span style="flex: 1;"></span><span style="' + st({ color: K.muted, display: 'inline-flex', width: '32px', height: '32px', alignItems: 'center', justifyContent: 'center' }) + '">' + icon(I.expand, 15) + '</span></div>';
const entr = (ic, title, big, word, sub, red) => '<div style="' + st({ flex: 1, padding: '12px 14px', background: K.paper, border: '1px solid ' + K.line, borderRadius: '14px' }) + '"><div style="' + st({ display: 'flex', alignItems: 'center', gap: '8px' }) + '"><span style="' + st({ display: 'inline-flex', width: '26px', height: '26px', alignItems: 'center', justifyContent: 'center', borderRadius: '7px', background: '#EEF0EA' }) + '">' + icon(ic, 14) + '</span>' + t(title, { fontWeight: 600, flex: 1 }) + '<span style="color: ' + K.faint + '; display: inline-flex;">' + icon(I.chev, 14) + '</span></div><div style="' + st({ display: 'flex', alignItems: 'baseline', gap: '5px', marginTop: '14px' }) + '">' + t(big, { fontSize: '26px', lineHeight: '30px', fontWeight: 600 }) + mu(word, { fontSize: '13px' }) + '</div>' + mu(sub, { color: red ? K.red : K.muted }) + '</div>';
const top = '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 12px', borderRadius: '10px', background: K.paper, border: '1px solid ' + K.line, color: K.muted, fontSize: '14px' }) + '">' + icon(I.search, 16) + 'Find a page or action</div><div style="' + st({ display: 'flex', gap: '10px', marginTop: '12px' }) + '">' + entr(I.inbox, 'Inbox', '6', 'waiting', '2 before 10:00', true) + entr(I.cal, 'Today', '6', 'of 10 jobs done', '4 still to do') + '</div>';

const pane = (inner, h) => '<div style="' + st({ width: '440px', height: h + 'px', overflow: 'hidden', background: K.tint, fontFamily: "'Geist', system-ui, sans-serif", color: K.ink, fontVariantNumeric: 'tabular-nums' }) + '">' + inner + '</div>';
const frame = (label, note, inner, h) => '<div><div style="' + st({ fontSize: '17px', fontWeight: 600, lineHeight: '24px' }) + '">' + label + '</div><div style="' + st({ fontSize: '14px', lineHeight: '21px', color: '#5D665F', margin: '4px 0 14px', width: '440px', minHeight: '63px' }) + '">' + note + '</div><div style="' + st({ width: '440px', height: h + 'px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 0 1px #DADFD5, 0 12px 32px rgba(17,21,17,.10)' }) + '">' + inner + '</div></div>';

const H1 = 1560;
const f1 = frame('Home, scrolled through', 'The entrances on top, then the dashboards: farm-wide charts only, never a batch. A line, today\'s figure, a quiet comparison; the rest is on hover.', pane(tabs + '<div style="padding: 14px 16px 20px;">' + top + dashboards() + '</div>', H1), H1);
const f2 = frame('Hover a point', 'Pigs on hand: that day\'s count and what came in and went out. Pigs on treatment: that day, split by problem. White tooltip, as the tooltip study says.', pane('<div style="padding: 14px 16px 20px;">' + dashboards({ herd: 16, sick: 5 }).replace(head('Production'), '<div style="height: 4px;"></div>') + '</div>', H1 - 250), H1 - 250);
const f3 = frame('What came from the old web Home', 'Kept, farm-wide: PSY forecast, herd on hand and its trend (by kind on hover), health overview and the top health problems. Left out: today\'s batch counts (farrowing, piglet processing, heat, moves: that is the daily report\'s job), the decision centre (Inbox), biosecurity (no dashboard), the camera.', '<div style="' + st({ height: '100%', background: '#FFFFFF', padding: '20px', boxSizing: 'border-box', fontFamily: "'Geist', system-ui, sans-serif" }) + '">' + [['PSY forecast', 'kept', 'a line by month, dashed target'], ['Herd on hand (存栏)', 'kept', 'a 30-day line; kinds as a split bar; in and out on hover'], ['Health overview', 'kept', 'pigs on treatment, a 30-day line; deaths a week as bars'], ['Top 5 health problems', 'kept', 'one bar per problem, last 30 days'], ['Born alive per litter', 'added', 'the farm\'s litters by week (the old Home showed it per batch only)'], ['Health triage donut', 'dropped', 'a total of every diagnosis says less than the top problems'], ['Today\'s progress by stage', 'dropped', 'batch work: the daily report and Today'], ['Decision centre', 'dropped', 'it is the Inbox'], ['Biosecurity, camera', 'dropped', 'no biosecurity dashboard']].map((r, i) => '<div style="' + st({ display: 'flex', gap: '10px', padding: '12px 0', borderTop: i ? '1px solid ' + K.line : '0' }) + '"><span style="' + st({ flexShrink: 0, width: '64px', fontSize: '12px', fontWeight: 600, color: r[1] === 'dropped' ? K.muted : K.green }) + '">' + r[1] + '</span><span style="display: flex; flex-direction: column;">' + t(r[0], { fontWeight: 600, whiteSpace: 'normal' }) + mu(r[2], { whiteSpace: 'normal' }) + '</span></div>').join('') + '</div>', 720);

const sh = fs.readFileSync(shell, 'utf8'), pre = sh.slice(0, sh.indexOf('<div style="width: 1760px;')).replace(/<title>[^<]*<\/title>/, '<title>Home dashboards</title>');
const html = pre + '<div style="' + st({ width: '1608px', padding: '40px 48px 56px', boxSizing: 'border-box', background: '#F3F4F1', fontFamily: "'Geist', system-ui, sans-serif", color: '#111511', WebkitFontSmoothing: 'antialiased' }) + '"><h1 style="margin: 0; font-size: 26px; line-height: 34px; font-weight: 600; letter-spacing: -.02em;">Home dashboards, as charts</h1><div style="margin-top: 6px; font-size: 15px; color: #5D665F; max-width: 1100px;">A baseline set of charts for the whole farm, shown right on Home. Lines and bars first; numbers and splits on hover. Anything that moves day to day is the daily report\'s job, in chat.</div><div style="' + st({ display: 'flex', gap: '64px', marginTop: '28px', alignItems: 'flex-start' }) + '">' + f1 + f2 + f3 + '</div></div>\n</x-dc>\n</body>\n</html>\n';
fs.writeFileSync(out, html); console.log('wrote', out, Math.round(html.length / 1024) + ' KB');
