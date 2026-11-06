// Home, calmer: the console's Home pane as it is now, beside a quieter version (tint + white cards, lists not carousels).
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const [nowPng, out, shell] = process.argv.slice(2);
const K = { tint: '#F6F7F1', paper: '#FFFFFF', line: '#E4E6E0', ink: '#1B211C', muted: '#6B726D', faint: '#9AA19C', green: '#28734F', blue: '#3972B7', grey: '#DDE1DA', amber: '#946015', amberT: '#FCF0DB', red: '#B34B43' };
const st = (o) => Object.entries(o).map(([k, v]) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ': ' + v).join('; ') + ';';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const t = (s, o) => '<span style="' + st(Object.assign({ fontSize: '14px', lineHeight: '20px', color: K.ink }, o || {})) + '">' + esc(s) + '</span>';
const icon = (d, n) => '<svg viewBox="0 0 24 24" aria-hidden="true" style="width: ' + (n || 16) + 'px; height: ' + (n || 16) + 'px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;"><path d="' + d + '"></path></svg>';
const I = { search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z M20 20l-4-4', chev: 'm9 5 7 7-7 7', home: 'M4 11 12 4l8 7v9H4z', map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14', expand: 'M14 4h6v6 M10 20H4v-14 M20 4l-7 7', chart: 'M5 20V10 M12 20V4 M19 20v-7', heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z', shield: 'M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z' };
const av = (txt, bg, fg) => '<span style="' + st({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: bg, color: fg, fontSize: '11px', fontWeight: 600, flexShrink: 0 }) + '">' + txt + '</span>';
const card = (inner) => '<div style="' + st({ background: K.paper, border: '1px solid ' + K.line, borderRadius: '14px', overflow: 'hidden' }) + '">' + inner + '</div>';
const head = (title, link) => '<div style="' + st({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '22px 4px 8px' }) + '">' + t(title, { fontSize: '15px', fontWeight: 600 }) + (link ? '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '13px', fontWeight: 500, color: K.ink }) + '">' + esc(link) + icon(I.chev, 14) + '</span>' : '') + '</div>';
const btn = (l, dark) => '<span style="' + st({ display: 'inline-flex', alignItems: 'center', height: '32px', padding: '0 12px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, background: dark ? K.green : K.paper, color: dark ? '#FFFFFF' : K.ink, border: dark ? '0' : '1px solid ' + K.line }) + '">' + esc(l) + '</span>';
const row = (inner, first) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderTop: first ? '0' : '1px solid ' + K.line }) + '">' + inner + '</div>';
const col = (a, b) => '<span style="' + st({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }) + '">' + a + b + '</span>';
const one = (s, o) => t(s, Object.assign({ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }, o || {}));

// the console's tab strip, as it is
const tabs = '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '4px', height: '48px', padding: '0 10px', background: K.paper, borderBottom: '1px solid ' + K.line }) + '"><span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 10px', borderRadius: '8px', background: '#EEF0EA', fontSize: '13px', fontWeight: 600 }) + '">' + icon(I.home, 15) + 'Home<span style="' + st({ minWidth: '18px', height: '18px', borderRadius: '9px', background: K.ink, color: '#FFF', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }) + '">6</span></span><span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 10px', fontSize: '13px', color: K.muted }) + '">' + icon(I.map, 15) + 'Farm view</span><span style="flex: 1;"></span><span style="' + st({ color: K.muted, display: 'inline-flex', width: '32px', height: '32px', alignItems: 'center', justifyContent: 'center' }) + '">' + icon(I.expand, 15) + '</span></div>';

const inbox = [
  [av('VT', '#E5F1EF', '#2E6D64'), 'Revaccinate Batch 29 against PRRS', 'Vet · Batch 29 · 3h ago', btn('Approve')],
  [av('BS', '#ECEAF7', '#5B4FA0'), '5 visitors want to come in next week', 'Biosecurity · 3h ago', btn('Approve')],
  [av('PR', '#FBF1DD', '#8A5A12'), 'Batch 33: keep Farrowing 1?', 'Production · a question · 2h ago', btn('Answer')],
];
const bar = (d, a, w, n) => '<span style="' + st({ display: 'flex', gap: '3px', marginTop: '7px' }) + '">' + Array.from({ length: n }, (_, i) => '<i style="' + st({ flex: 1, height: '4px', borderRadius: '2px', background: i < d ? K.green : i < d + a ? K.blue : K.grey }) + '"></i>').join('') + '</span>';
const today = [
  ['Fostering checks', 'Batch 32 · day 3 of 7', '6', 'of 8', bar(2, 1, 4, 7)],
  ['Amox treatment', '4 sows · dose 2 of 3', '4', 'due', bar(1, 1, 1, 3)],
  ['PRRS top-up', '3 pigs missed in Batch 31', '3', 'waiting', ''],
  ['Farrowing', 'Batch 33 · starts Fri', '~6', 'expected', ''],
];
const dash = [[I.chart, 'Production', '6 batches running'], [I.heart, 'Health', '4 sows on treatment'], [I.shield, 'Biosecurity', 'Next sampling Mon 9 Nov']];

const pane = '<div style="' + st({ width: '440px', height: '860px', overflow: 'hidden', background: K.tint, fontFamily: "'Geist', system-ui, sans-serif", color: K.ink, fontVariantNumeric: 'tabular-nums' }) + '">' + tabs + '<div style="padding: 14px 16px 20px;">' +
  '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 12px', borderRadius: '10px', background: K.paper, border: '1px solid ' + K.line, color: K.muted, fontSize: '14px' }) + '">' + icon(I.search, 16) + 'Find a page or action</div>' +
  head('Waiting for you', 'All 6') + card(inbox.map((x, i) => row(x[0] + col(one(x[1], { fontWeight: 600 }), one(x[2], { fontSize: '12.5px', lineHeight: '18px', color: K.muted })) + x[3], !i)).join('')) +
  head('Today', 'Schedule') + card(today.map((x, i) => row(col(one(x[0], { fontWeight: 600 }), one(x[1], { fontSize: '12.5px', lineHeight: '18px', color: K.muted }) + x[4]) + '<span style="' + st({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: '56px' }) + '">' + t(x[2], { fontSize: '18px', lineHeight: '22px', fontWeight: 600 }) + t(x[3], { fontSize: '12px', lineHeight: '16px', color: K.muted }) + '</span>', !i)).join('')) +
  head('Dashboards') + card(dash.map((x, i) => row('<span style="' + st({ display: 'inline-flex', width: '28px', height: '28px', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: '#EEF0EA', color: K.ink }) + '">' + icon(x[0], 15) + '</span>' + col(one(x[1], { fontWeight: 600 }), one(x[2], { fontSize: '12.5px', lineHeight: '18px', color: K.muted })) + '<span style="color: ' + K.faint + '; display: inline-flex;">' + icon(I.chev, 16) + '</span>', !i)).join('')) +
  '</div></div>';

(async () => {
  const b = await sharp(nowPng).resize(880).jpeg({ quality: 82 }).toBuffer();
  const m = await sharp(nowPng).metadata();
  const frame = (label, note, inner) => '<div><div style="' + st({ fontSize: '17px', fontWeight: 600, lineHeight: '24px' }) + '">' + label + '</div><div style="' + st({ fontSize: '14px', lineHeight: '21px', color: '#5D665F', margin: '4px 0 14px', width: '440px', minHeight: '63px' }) + '">' + note + '</div><div style="' + st({ width: '440px', height: '860px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 0 1px #DADFD5, 0 12px 32px rgba(17,21,17,.10)', background: K.tint }) + '">' + inner + '</div></div>';
  const now = frame('Now', 'Green band, two carousels, the inbox card on the seam.', tabs + '<img alt="Home as it is now" src="data:image/jpeg;base64,' + b.toString('base64') + '" style="display: block; width: 440px; height: ' + Math.round(440 * m.height / m.width) + 'px;">');
  const next = frame('Calmer', 'Tint with white cards like every other page. No greeting (the chat says it). The inbox and Today become short lists; every button quiet, so nothing shouts.', pane);
  const sh = fs.readFileSync(shell, 'utf8'), pre = sh.slice(0, sh.indexOf('<div style="width: 1760px;')).replace(/<title>[^<]*<\/title>/, '<title>Home, calmer</title>');
  const html = pre + '<div style="' + st({ width: '1072px', padding: '40px 48px 56px', boxSizing: 'border-box', background: '#F3F4F1', fontFamily: "'Geist', system-ui, sans-serif", color: '#111511', WebkitFontSmoothing: 'antialiased' }) + '"><h1 style="margin: 0; font-size: 26px; line-height: 34px; font-weight: 600; letter-spacing: -.02em;">Home, calmer</h1><div style="margin-top: 6px; font-size: 15px; color: #5D665F;">The console\'s Home pane at its real width, as it is and quieter.</div><div style="' + st({ display: 'flex', gap: '96px', marginTop: '28px', alignItems: 'flex-start' }) + '">' + now + next + '</div></div>\n</x-dc>\n</body>\n</html>\n';
  fs.writeFileSync(out, html); console.log('wrote', out, Math.round(html.length / 1024) + ' KB');
})();
