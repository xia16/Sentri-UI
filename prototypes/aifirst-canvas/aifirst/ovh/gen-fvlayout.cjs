// FarmViewLayout board: the farm view rearranged (canvas first; static frames over real farm renders, no 3D change).
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = __dirname, R = process.argv[2], OUT = process.argv[3];
const sharp = require('sharp');
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(S + '/ovh-lib.js', 'utf8') + ';this.OVH=OVH;', ctx);
const H = ctx.OVH, K = H.K, st = H.st, t = H.t, mu = H.mu, sm = H.sm, I = H.I, esc = H.esc;
const icon = (d, s, o) => H.icon(d, s || 18, o);
const X = { cube: 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z M4 7.5 12 12l8-4.5 M12 12v9', rotL: 'M4 12a8 8 0 1 0 2.4-5.7 M4 4v4.5h4.5', rotR: 'M20 12a8 8 0 1 1-2.4-5.7 M20 4v4.5h-4.5', fit: 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5', moon: 'M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z', edit: 'M4 20h4L19 9l-4-4L4 16v4Z M13.5 6.5l4 4' };
const dump = (f) => fs.readFileSync(S + '/fv/' + f + '.html', 'utf8');
function outer(h, i) { const tag = /^<([a-z]+)/.exec(h.slice(i))[1]; let d = 0; const re = new RegExp('<\\/?' + tag + '\\b[^>]*>', 'g'); re.lastIndex = i; let m; while ((m = re.exec(h))) { if (m[0][1] === '/') d--; else d++; if (d === 0) return h.slice(i, re.lastIndex); } }
const grab = (h, marker) => outer(h, h.lastIndexOf('<', h.indexOf(marker)));
const need = (h, a, b) => { if (!h.includes(a)) throw new Error('MISS ' + a.slice(0, 60)); return h.split(a).join(b); };

// ---------- backdrops ----------
async function bg(name, w) { const f = path.join(R, 'L3JS_' + name + '_' + (w || 1360) + '.png'); const b = await sharp(f).jpeg({ quality: 62, mozjpeg: true }).toBuffer(); return 'data:image/jpeg;base64,' + b.toString('base64'); }

// ---------- the new top ----------
const floatCard = (o) => st(Object.assign({ position: 'absolute', background: K.paper, borderRadius: '16px', boxShadow: '0 1px 2px rgba(17,21,17,.06), 0 10px 26px rgba(17,21,17,.14)', fontFamily: "'Geist', system-ui, sans-serif", color: K.ink, boxSizing: 'border-box' }, o));
const chip = (ic, label, o) => { o = o || {}; return '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '32px', padding: '0 10px', borderRadius: '999px', background: o.bg || '#F2F4EF', color: o.color || K.ink, fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }) + '">' + (ic ? icon(ic, 15) : '') + esc(label) + '</span>'; };
const sensors = (amber) => chip(I.temp, '22.4 °C') + chip(I.drop, '61 %') + (amber ? chip(I.air, 'NH₃ 9.4', { bg: K.amberT, color: K.amber }) : chip(I.air, 'NH₃ 6.8'));
const sqBtn = (d, on) => '<span style="' + st({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', background: on ? K.press : K.tint, color: K.ink, flexShrink: 0 }) + '">' + icon(d, 18) + '</span>';
// the location: ‹ goes one level up; the name opens the switcher; no hover anywhere
function loc(name, o) {
  o = o || {};
  const nameBtn = '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 10px', margin: '0 2px', borderRadius: '12px', background: o.open ? K.press : 'transparent', boxShadow: o.open ? 'inset 0 0 0 1.5px ' + K.ink : 'none' }) + '">' + t(name, { fontSize: '17px', lineHeight: '22px', fontWeight: 600, letterSpacing: '-.01em' }) + (o.dot ? '<i style="' + st({ width: '8px', height: '8px', borderRadius: '999px', background: K.red, flexShrink: 0 }) + '"></i>' : '') + icon(I.down, 16, { color: K.muted }) + '</span>';
  const row1 = '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '4px' }) + '">' + sqBtn(I.back) + nameBtn + (o.chips && !o.wrap ? '<span style="' + st({ display: 'inline-flex', gap: '6px', marginLeft: '6px' }) + '">' + o.chips + '</span>' : '') + '</div>';
  const row2 = o.chips && o.wrap ? '<div style="' + st({ display: 'flex', gap: '6px', marginTop: '8px', paddingLeft: '2px' }) + '">' + o.chips + '</div>' : '';
  return '<div style="' + floatCard({ left: '16px', top: '16px', padding: '8px' }) + '">' + row1 + row2 + '</div>';
}
const tab = (ic, label, on) => '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 12px', borderRadius: '12px', background: on ? K.press : 'transparent', boxShadow: on ? 'inset 0 0 0 1.5px ' + K.ink : 'none', fontSize: '14px', fontWeight: on ? 600 : 500, whiteSpace: 'nowrap' }) + '">' + icon(ic, 18) + esc(label) + '</span>';
const vline = '<i style="' + st({ width: '1px', height: '24px', background: K.line, margin: '0 4px' }) + '"></i>';
function bar(on, o) {
  o = o || {};
  const view = '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 10px', borderRadius: '12px', background: o.viewOpen ? K.press : 'transparent', boxShadow: o.viewOpen ? 'inset 0 0 0 1.5px ' + K.ink : 'none', fontSize: '14px', fontWeight: 500 }) + '">' + icon(X.cube, 18) + (o.plan ? 'Plan' : '3D') + icon(I.down, 14, { color: K.muted }) + '</span>';
  const act = '<span style="' + st({ display: 'inline-flex', alignItems: 'center', height: '40px', padding: '0 16px', borderRadius: '12px', background: K.ink, color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }) + '">Actions</span>';
  return '<div style="' + floatCard({ right: '16px', top: '16px', padding: '8px', display: 'flex', alignItems: 'center', gap: '2px' }) + '">' + tab(I.select, 'Select', on === 'select') + tab(I.layers, 'Batches', on === 'batches') + tab(I.pig, 'Pigs', on === 'pigs') + tab(I.tool, 'Equipment', on === 'equip') + vline + view + '<span style="width: 6px;"></span>' + act + '</div>';
}
// the view controls, opened from 3D ▾ (collapsed the rest of the time)
function viewMenu() {
  const seg = '<div style="' + st({ display: 'flex', padding: '3px', borderRadius: '12px', background: K.tint }) + '">' + ['3D', 'Plan'].map((x, i) => '<span style="' + st({ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', borderRadius: '10px', background: i ? 'transparent' : K.paper, boxShadow: i ? 'none' : '0 1px 2px rgba(17,21,17,.08)', fontSize: '14px', fontWeight: i ? 500 : 600 }) + '">' + x + '</span>').join('') + '</div>';
  const line = (label, btns) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '6px', height: '48px' }) + '">' + t(label, { flex: 1, color: K.muted, fontSize: '13px' }) + btns + '</div>';
  const hr = '<div style="' + st({ height: '1px', background: K.line, margin: '6px 0' }) + '"></div>';
  return '<div style="' + floatCard({ right: '112px', top: '76px', width: '272px', padding: '12px' }) + '">' + seg + '<div style="margin-top: 6px;">' + line('Rotate', sqBtn(X.rotL) + sqBtn(X.rotR)) + line('Zoom', sqBtn(I.minus) + sqBtn(I.plus)) + line('Fit to view', sqBtn(X.fit)) + line('Night', sqBtn(X.moon)) + '</div>' + hr + '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px', height: '44px', padding: '0 4px', fontSize: '14px', fontWeight: 500 }) + '">' + icon(X.edit, 18) + 'Edit layout</div></div>';
}
// the switcher: the level above is its back
function switcher(parent, rows, o) {
  o = o || {};
  const head = '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 2px 8px' }) + '">' + (o.top ? '' : sqBtn(I.back)) + '<span style="display: flex; flex-direction: column;">' + t(parent, { fontSize: '15px', fontWeight: 600 }) + sm(o.kind || '') + '</span></div>';
  const list = rows.map((r, i) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px', height: '48px', padding: '0 12px', borderRadius: '12px', background: r.on ? K.press : 'transparent', fontSize: '14px' }) + '">' + t(r.name, { flex: 1, fontWeight: r.on ? 600 : 400 }) + (r.dot ? '<i style="' + st({ width: '8px', height: '8px', borderRadius: '999px', background: K.red }) + '"></i>' : '') + mu(r.n) + (r.on ? icon(I.check, 16) : '<span style="width: 16px;"></span>') + '</div>').join('');
  return '<div style="' + floatCard({ left: '16px', top: '76px', width: '300px', padding: '10px' }) + '">' + head + '<div style="' + st({ borderTop: '1px solid ' + K.line, paddingTop: '6px' }) + '">' + list + '</div></div>';
}
// a main panel on the right, under the bar: grey with white cards
const panel = (inner) => '<div style="' + floatCard({ right: '16px', top: '84px', width: '380px', maxHeight: 'calc(100% - 100px)', overflow: 'hidden', padding: '16px 16px 20px', borderRadius: '22px', background: K.tint }) + '">' + inner + '</div>';
const movePanel = (h) => need(need(h, 'top: 72px;', 'top: 84px;'), 'max-height: calc(100% - 164px);', 'max-height: calc(100% - 100px);');
// the day strip, as on the phone's Home card
const strip = (day, of) => '<div style="' + st({ display: 'flex', gap: '4px', marginTop: '12px' }) + '">' + Array.from({ length: of }, (_, i) => '<i style="' + st({ flex: 1, height: '6px', borderRadius: '999px', background: i < day - 1 ? K.green : i === day - 1 ? K.blue : '#E7EAE3' }) + '"></i>').join('') + '</div>';
const callout = (x, y, n) => '<span style="' + st({ position: 'absolute', left: x + 'px', top: y + 'px', width: '26px', height: '26px', borderRadius: '999px', background: '#C2410C', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px #FFFFFF', zIndex: 5 }) + '">' + n + '</span>';

(async () => {
  const B = { room: await bg('bgroom'), room960: await bg('bgroom', 960), panel: await bg('bgpanel'), task: await bg('bgtask'), pig: await bg('bgpig'), pen: await bg('bgpen') };
  const frame = (no, title, note, img, over, w) => { w = w || 1360; return '<div><div style="' + st({ display: 'flex', alignItems: 'baseline', gap: '12px', fontSize: '15px', lineHeight: '22px' }) + '"><b style="font-weight: 600;">' + no + ' · ' + esc(title) + '</b></div><div style="' + st({ marginTop: '4px', color: '#5D665F', fontSize: '14px', lineHeight: '21px', maxWidth: (w - 40) + 'px' }) + '">' + note + '</div><div style="' + st({ position: 'relative', width: w + 'px', height: '830px', marginTop: '14px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 0 0 1px #DADFD5, 0 12px 32px rgba(17,21,17,.10)', background: '#E9EDE4' }) + '"><img alt="" src="' + img + '" style="position: absolute; left: 0; top: 0; width: ' + w + 'px; height: 830px; display: block;">' + over + '</div></div>'; };
  const roomTop = (on, o) => loc('Gestation 2', Object.assign({ dot: true, chips: sensors(true) }, o || {})) + bar(on, o);

  // panels from the live view, moved under the new top
  const pig = dump('pig'), task = dump('task'), eq = dump('eq'), room = dump('room');
  let pigP = movePanel(grab(pig, 'data-zone="panel"'));
  const perfLink = pigP.slice(pigP.indexOf('<span data-a="pigperf"'), pigP.indexOf('</span>', pigP.indexOf('<span data-a="pigperf"') + 30) + 7);
  pigP = need(pigP, perfLink, '');
  // shown scrolled to the bottom, where the one Performance sits
  pigP = need(pigP, 'max-height: calc(100% - 100px);', 'height: calc(100% - 100px);');
  pigP = need(pigP, 'overflow-y: auto; overflow-x: hidden;', 'overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end;');
  let taskP = movePanel(grab(task, 'data-zone="panel"'));
  // the legend row chosen: a quiet fill inside the card, no outline running past it
  taskP = need(taskP, 'data-a="only:active" style="display: flex; align-items: center; gap: 10px; height: 36px; margin: 0 -8px; padding: 0 8px; border-radius: 8px; border-top: 1px solid #DFE4D8; background: transparent;', 'data-a="only:active" style="display: flex; align-items: center; gap: 10px; height: 36px; margin: 0; padding: 0 8px; border-radius: 8px; border-top: 1px solid #DFE4D8; background: #EEF0EA;');
  taskP = taskP.replace(/margin: 0 -8px; padding: 0 8px; border-radius: 8px;/g, 'margin: 0; padding: 0 8px; border-radius: 8px;');
  const eqPop = grab(eq, 'data-pop="1"'), eqTiles = eqPop.slice(eqPop.indexOf('<div style="display: grid;'), eqPop.lastIndexOf('</div>'));
  const taskLoc = '<div style="' + floatCard({ left: '16px', top: '16px', padding: '8px' }) + '"><div style="display: flex; align-items: center; gap: 4px;">' + sqBtn(I.back) + '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 10px' }) + '">' + t('Farrowing Room 2', { fontSize: '17px', fontWeight: 600 }) + icon(I.down, 16, { color: K.muted }) + '</span><span style="display: inline-flex; gap: 6px; margin-left: 6px;">' + sensors(false) + '</span></div></div>';

  // 1 · the top, at a room
  const f1 = frame(1, 'At a room: one bar on top, the view tools folded away', 'The bar moves up beside the location. Select, Batches, Pigs and Equipment each open a main panel on the right; Actions stays the one dark button. 3D, Plan, rotate, zoom, fit, night and Edit layout fold into <b>3D ▾</b>. The location card has no pigs chip and no breadcrumb, and nothing in it reacts to hover, so it never jumps.', B.room,
    roomTop('') + callout(10, 10, 1) + callout(1328, 10, 2) + callout(1184, 64, 3));
  // 2 · view tools open
  const f2 = frame(2, '3D ▾ opened: the view tools', 'Click only; it stays open while you rotate or zoom and closes when you click the farm. Plan and 3D are one switch at the top. Edit layout leaves the farm view, so it sits apart at the bottom.', B.room, roomTop('', { viewOpen: true }) + viewMenu());
  // 3 · the switcher
  const f3 = frame(3, 'Click the name: switch rooms', 'The list shows where you could go at this level, the current one ticked, with a red dot where something is wrong. Its header is the level above, and ‹ there shows that level’s list (frame 4). Click only: it stays open until you pick or click away. ‹ on the card itself takes the farm one level up.', B.room,
    loc('Gestation 2', { dot: true, chips: sensors(true), open: true }) + bar('') + switcher('Gestation', [{ name: 'Gestation 1', n: '152 pigs' }, { name: 'Gestation 2', n: '186 pigs', dot: true, on: true }, { name: 'Sick room', n: '3 pigs', dot: true }], { kind: 'Rooms in this section' }));
  const f4 = frame(4, '‹ in the list: the level above', 'Now the sections of Production Zone 1. Clicking a row takes the farm there; ‹ again shows the zones. The farm does not move while you browse the list.', B.room,
    loc('Gestation 2', { dot: true, chips: sensors(true), open: true }) + bar('') + switcher('Production Zone 1', [{ name: 'Gestation', n: '341 pigs', dot: true, on: true }, { name: 'Farrowing', n: '76 pigs' }, { name: 'Nursery', n: '958 pigs' }], { kind: 'Sections' }));
  // 5 · pigs is a main panel
  const kinds = [['Sows', 182, true], ['Boars', 4, false]];
  const pigsInner = H.head('Pigs', 'Gestation 2 · 186 pigs', '') + H.sec('Show on the farm', '<span style="font-size: 13px; font-weight: 500;">Clear</span>', 20) + H.card(kinds.map((k, i) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px', height: '48px', margin: '0 -8px', padding: '0 8px', borderRadius: '10px', borderTop: i ? '1px solid ' + K.line : '0', background: k[2] ? K.press : 'transparent' }) + '"><i style="' + st({ width: '10px', height: '10px', borderRadius: '3px', background: i ? '#718075' : '#2F3A33' }) + '"></i>' + t(k[0], { flex: 1, fontWeight: k[2] ? 600 : 400 }) + t(String(k[1]), { fontWeight: 600 }) + (k[2] ? icon(I.check, 16) : '<span style="width: 16px;"></span>') + '</div>').join(''), { pad: '4px 16px' });
  const f5 = frame(5, 'Pigs opens on the right, like Batches', 'The pigs chip was really a filter, so it becomes a main panel from the bar. Pick a kind and only those pens keep their colour; <b>Clear</b> brings every pen back. No hover card on top of it.', B.room,
    roomTop('pigs') + panel(pigsInner));
  // 6 · equipment on the right
  const eqInner = H.head('Equipment', 'Gestation 2', '') + '<div style="margin-top: 16px;">' + eqTiles + '</div>';
  const f6 = frame(6, 'Equipment opens on the right too', 'Same place and size as Batches and Pigs, so the bar behaves one way. The tiles are unchanged; a tile opens its card in the same panel, with Back.', B.panel,
    roomTop('equip') + panel(eqInner));
  // 7 · the task: legend is the key, no tooltip
  const f7 = frame(7, 'A task: the legend is the key, so no tooltip', 'The ring has no hover card: the legend beside it already says the same. Clicking a legend row shows only those pens; the chosen row is a quiet fill that stays inside its card.', B.task,
    taskLoc + bar('batches') + taskP);
  // 8 · pig profile: one Performance
  const penLoc = '<div style="' + floatCard({ left: '16px', top: '16px', padding: '8px' }) + '"><div style="display: flex; align-items: center; gap: 4px;">' + sqBtn(I.back) + '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 10px' }) + '">' + t('Pen A7', { fontSize: '17px', fontWeight: 600 }) + icon(I.down, 16, { color: K.muted }) + '</span></div></div>';
  const f8 = frame(8, 'At a pen: no pigs on top; one Performance', 'At a pen the card is just the pen: her card is the panel (shown scrolled to the bottom). Her litters loses its “Performance ›” link; Performance is the button at the bottom, next to Log.', B.pig,
    penLoc + bar('') + pigP);
  // 9 · 960
  const f9 = frame(9, 'At 960 wide: the sensors drop to a second line', 'The bar keeps its labels; the location card wraps its sensor chips under the name instead of squeezing the bar.', B.room960,
    loc('Gestation 2', { dot: true, chips: sensors(true), wrap: true }) + bar(''), 960);
  // 10 · batch cards from the last round
  const tcard = (title, big, word, day, of, sub) => H.card('<div style="' + st({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }) + '">' + t(title, { fontSize: '15px', fontWeight: 600 }) + H.chev + '</div><div style="' + st({ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }) + '">' + t(big, { fontSize: '28px', lineHeight: '32px', fontWeight: 600, letterSpacing: '-.02em' }) + mu(word, { fontSize: '15px' }) + (sub ? '<span style="margin-left: auto;">' + H.badge('amber', sub) + '</span>' : '') + '</div>' + strip(day, of) + '<div style="margin-top: 8px;">' + mu('Day ' + day + ' of ' + of) + '</div>', { pad: '14px 16px' });
  const up = (rows) => H.sec('Upcoming') + H.card(rows.map((x, i) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '48px', borderTop: i ? '1px solid ' + K.line : '0' }) + '">' + t(x[0], { width: '80px', fontSize: '13px', color: K.muted }) + t(x[1], { flex: 1, whiteSpace: 'normal' }) + mu(x[2]) + '</div>').join(''), { pad: '0 16px' });
  const b32 = H.head('Batch 32', 'Farrowing Room 2 · 50 sows', 'back') + H.sec('Running now', '', 20) + tcard('Farrowing', '4', 'farrowing', 3, 7, '1 past due') + '<div style="height: 8px;"></div>' + tcard('Post-farrowing check', '6', 'due today', 3, 7) + up([['Sat 7 Nov', 'Piglet processing', 'in 2 days'], ['Fri 27 Nov', 'Wean, to Nursery 1', 'in 3 weeks']]);
  const f10 = frame(10, 'Batch page: the phone’s task card (from last round, for your call)', 'Each running task says what is happening now in one number (Home’s rules: farrowing underway, then past due, then due today, then the next date) and the days as the phone’s strip. No ring: the ring read as “% done” but counted days.', B.task,
    taskLoc + bar('batches') + panel(b32));
  const quiet = H.card('<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px' }) + '">' + t('No task running', { fontWeight: 600 }) + '<span style="margin-left: auto;">' + mu('next: Weigh 10 pigs, in 3 days') + '</span></div>', { pad: '14px 16px' });
  const b31 = H.head('Batch 31', 'Nursery, day 24 of 42 · 488 weaners', 'back') + '<div style="margin: 20px 4px 0;">' + mu('No task running', { fontSize: '14px' }) + '</div>' + up([['Fri 6 Nov', 'Weigh 10 pigs', 'in 3 days'], ['Wed 2 Dec', 'End of nursery, to Finisher 2', 'in 4 weeks']]);
  const f11 = frame(11, 'A batch in a stage: no card to fill', 'Nursery and Quarantine are stages, not tasks. The stage and its day live in the header; the page says plainly that no task is running, and Upcoming already says what comes next, so it is not said twice.', B.task,
    taskLoc + bar('batches') + panel(b31));

  const shell = fs.readFileSync(path.join(path.dirname(OUT), 'LocationCard.dc.html'), 'utf8');
  const pre = shell.slice(0, shell.indexOf('<div style="width: 1760px;')).replace('<title>Location card</title>', '<title>Farm view layout</title>');
  const W = 1360 * 2 + 56 + 96;
  const html = pre + '<div style="' + st({ width: W + 'px', padding: '40px 48px 64px', boxSizing: 'border-box', background: '#F3F4F1', fontFamily: "'Geist', system-ui, sans-serif", fontSize: '14px', lineHeight: '20px', color: '#111511', WebkitFontSmoothing: 'antialiased', fontVariantNumeric: 'tabular-nums' }) + '">' +
    '<h1 style="margin: 0; font-size: 28px; line-height: 36px; font-weight: 600; letter-spacing: -.025em;">Farm view, rearranged</h1>' +
    '<div style="margin-top: 6px; color: #5D665F; max-width: 1500px; font-size: 15px; line-height: 23px;">A proposal on the farm as it renders today; the 3D is untouched. One rule throughout: <b>nothing on the edges reacts to hover</b>. Hovers stay on the farm (a pen) and on charts where they add detail the screen does not already show. Everything else is a click, and every panel opens in the same place on the right.</div>' +
    '<div style="' + st({ display: 'grid', gridTemplateColumns: 'repeat(2, 1360px)', gap: '64px 56px', marginTop: '36px', alignItems: 'start' }) + '">' + [f1, f2, f3, f4, f5, f6, f7, f8, f9].join('\n') + '</div>' +
    '<h2 style="margin: 64px 0 0; padding-top: 28px; border-top: 1px solid #DFE4D8; font-size: 22px; line-height: 28px; font-weight: 600;">Batch cards</h2>' +
    '<div style="' + st({ display: 'grid', gridTemplateColumns: 'repeat(2, 1360px)', gap: '64px 56px', marginTop: '24px', alignItems: 'start' }) + '">' + [f10, f11].join('\n') + '</div></div>\n</x-dc>\n</body>\n</html>\n';
  fs.writeFileSync(OUT, html); console.log('wrote', OUT, html.length);
})();
