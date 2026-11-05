// FarmViewLayout board: the farm view rearranged (canvas first; static frames over real farm renders, no 3D change).
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = __dirname, R = process.argv[2], OUT = process.argv[3];
const sharp = require('sharp');
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(S + '/ovh-lib.js', 'utf8') + ';this.OVH=OVH;', ctx);
const H = ctx.OVH, K = H.K, st = H.st, t = H.t, mu = H.mu, sm = H.sm, I = H.I, esc = H.esc;
const icon = (d, s, o) => H.icon(d, s || 18, o);
const X = { menu: 'M4 7h16 M4 12h16 M4 17h16', cube: 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z M4 7.5 12 12l8-4.5 M12 12v9', rotL: 'M4 12a8 8 0 1 0 2.4-5.7 M4 4v4.5h4.5', rotR: 'M20 12a8 8 0 1 1-2.4-5.7 M20 4v4.5h-4.5', fit: 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5', moon: 'M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z', edit: 'M4 20h4L19 9l-4-4L4 16v4Z M13.5 6.5l4 4' };
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
// one connected bar across the top: ‹ (one level up), the place (click: switch), its sensors, then the panels, the view tools folded into 3D ▾, Actions
const tab = (ic, label, on, count, warn) => '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '7px', height: '40px', padding: '0 10px', borderRadius: '12px', background: on ? K.press : 'transparent', boxShadow: on ? 'inset 0 0 0 1.5px ' + K.ink : 'none', fontSize: '14px', fontWeight: on ? 600 : 500, whiteSpace: 'nowrap' }) + '">' + icon(ic, 18) + esc(label) + (count != null ? '<span style="' + st({ color: on ? K.ink : K.muted, fontWeight: 600 }) + '">' + count + '</span>' : '') + (warn ? '<i style="' + st({ width: '8px', height: '8px', borderRadius: '999px', background: warn === true ? K.red : warn, flexShrink: 0, marginLeft: '-2px' }) + '"></i>' : '') + '</span>';
const vline = '<i style="' + st({ width: '1px', height: '24px', background: K.line, margin: '0 6px', flexShrink: 0 }) + '"></i>';
let POS = 'top', SELPOS = 'br';
const edge = (v) => (POS === 'top' ? { top: v } : { bottom: v });
function top(o) {
  o = o || {};
  const nameBtn = '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 10px', borderRadius: '12px', background: o.open ? K.press : 'transparent', boxShadow: o.open ? 'inset 0 0 0 1.5px ' + K.ink : 'none', whiteSpace: 'nowrap' }) + '">' + t(o.name, { fontSize: '17px', lineHeight: '22px', fontWeight: 600, letterSpacing: '-.01em' }) + (o.dot ? '<i style="' + st({ width: '8px', height: '8px', borderRadius: '999px', background: K.red, flexShrink: 0 }) + '"></i>' : '') + icon(I.down, 16, { color: K.muted }) + '</span>';
  const view = '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 10px', borderRadius: '12px', background: o.viewOpen ? K.press : 'transparent', boxShadow: o.viewOpen ? 'inset 0 0 0 1.5px ' + K.ink : 'none', fontSize: '14px', fontWeight: 500 }) + '">' + icon(X.cube, 18) + '3D' + icon(I.down, 14, { color: K.muted }) + '</span>';
  const act = '<span style="' + st({ display: 'inline-flex', alignItems: 'center', height: '40px', padding: '0 16px', marginLeft: '6px', borderRadius: '12px', background: K.ink, color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }) + '">Actions</span>';
  const menu = '<div style="' + floatCard({ left: '16px', bottom: '16px', padding: '8px' }) + '"><span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 12px', borderRadius: '12px', background: o.viewOpen ? K.press : 'transparent', boxShadow: o.viewOpen ? 'inset 0 0 0 1.5px ' + K.ink : 'none', fontSize: '14px', fontWeight: 600 }) + '">' + icon(X.cube, 18) + (o.plan ? 'Plan' : '3D') + icon('m6 15 6-6 6 6', 14, { color: K.muted }) + '</span></div>';
  const acting = o.on === 'select' || o.acts;
  const actRow = (ic, label, off) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px', height: '44px', padding: '0 12px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: off ? K.faint : K.ink, whiteSpace: 'nowrap' }) + '">' + icon(ic, 18) + esc(label) + '</div>';
  const ACTL = [[I.syringe, 'Treatment'], [I.shield, 'Vaccination'], [I.flask, 'Sampling'], [I.move, 'Move'], [I.feeder, 'Feed'], [I.note, 'Note']];
  const hr6 = '<div style="' + st({ height: '1px', background: K.line, margin: '4px 6px' }) + '"></div>';
  const sel = acting ? '<div style="' + floatCard({ right: o.beside ? '404px' : '16px', bottom: '16px', width: '220px', padding: '6px' }) + '">' + (o.actsOff ? '<div style="' + st({ padding: '8px 12px 4px', fontSize: '13px', color: K.muted }) + '">Pick pens to act on</div>' : '') + ACTL.map((a) => actRow(a[0], a[1], o.actsOff)).join('') + hr6 + actRow(I.out, 'Culling', o.actsOff) + hr6 + '<div style="' + st({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '44px', borderRadius: '12px', background: K.tint, fontSize: '14px', fontWeight: 600 }) + '">' + icon(I.x, 18) + 'Cancel</div></div>'
    : '<div style="' + floatCard({ right: '16px', bottom: '16px', padding: '8px' }) + '"><span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }) + '">' + icon(I.select, 18) + 'Select</span></div>';
  return sel + '<div style="' + floatCard(Object.assign({ left: '16px', padding: '8px', display: 'flex', alignItems: 'center', gap: '2px' }, edge('16px'))) + '">' + sqBtn(I.back) + nameBtn + vline +
    (o.noBatch ? '' : tab(I.layers, 'Batches', o.on === 'batches')) + tab(I.pig, 'Pigs', o.on === 'pigs', o.pigs) + tab(I.tool, 'Devices', o.on === 'equip', null, o.warn) + (o.under || '') + '</div>' + menu;
}
// the view controls, opened from 3D ▾ (folded the rest of the time)
function viewMenu() {
  const seg = '<div style="' + st({ display: 'flex', padding: '3px', borderRadius: '12px', background: K.tint }) + '">' + ['3D', 'Plan'].map((x, i) => '<span style="' + st({ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', borderRadius: '10px', background: i ? 'transparent' : K.paper, boxShadow: i ? 'none' : '0 1px 2px rgba(17,21,17,.08)', fontSize: '14px', fontWeight: i ? 500 : 600 }) + '">' + x + '</span>').join('') + '</div>';
  const line = (label, btns) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '6px', height: '48px' }) + '">' + t(label, { flex: 1, color: K.muted, fontSize: '13px' }) + btns + '</div>';
  const hr = '<div style="' + st({ height: '1px', background: K.line, margin: '6px 0' }) + '"></div>';
  return '<div style="' + floatCard({ left: '16px', bottom: '80px', width: '272px', padding: '12px' }) + '">' + seg + '<div style="margin-top: 6px;">' + line('Rotate', sqBtn(X.rotL) + sqBtn(X.rotR)) + line('Zoom', sqBtn(I.minus) + sqBtn(I.plus)) + line('Fit to view', sqBtn(X.fit)) + line('Night', sqBtn(X.moon)) + '</div>' + hr + '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px', height: '44px', padding: '0 4px', fontSize: '14px', fontWeight: 500 }) + '">' + icon(X.edit, 18) + 'Edit layout</div></div>';
}
// a list of choices: the fill sits inside the box; a red dot follows the name; counts line up on the right
const choice = (r) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '8px', height: '44px', padding: '0 10px', borderRadius: '10px', background: r.on ? K.press : 'transparent' }) + '">' + (r.sw ? '<i style="' + st({ width: '10px', height: '10px', borderRadius: '3px', background: r.sw, flexShrink: 0 }) + '"></i>' : '') + t(r.name, { fontWeight: r.on ? 600 : 400 }) + (r.dot ? '<i style="' + st({ width: '8px', height: '8px', borderRadius: '999px', background: K.red, flexShrink: 0 }) + '"></i>' : '') + '<span style="flex: 1;"></span>' + t(r.n, { color: r.on ? K.ink : K.muted, fontWeight: r.bold ? 600 : 400 }) + '<span style="' + st({ display: 'inline-flex', width: '16px', justifyContent: 'center' }) + '">' + (r.on ? icon(I.check, 16) : '') + '</span></div>';
// the switcher: only the places at this level; ‹ on the bar is the way up
const switcher = (rows) => '<div style="' + floatCard(Object.assign({ left: '48px', width: '280px', padding: '6px' }, edge('60px'))) + '">' + rows.map(choice).join('') + '</div>';
// a main panel on the right, under the bar: grey with white cards
const panel = (inner) => '<div style="' + floatCard({ right: '16px', top: '16px', width: '380px', maxHeight: 'calc(100% - 104px)', overflow: 'hidden', padding: '16px 16px 20px', borderRadius: '22px', background: K.tint }) + '">' + inner + '</div>';
const movePanel = (h) => need(need(h, 'top: 72px;', 'top: 16px;'), 'max-height: calc(100% - 164px);', 'max-height: calc(100% - 104px);');
// the day strip, as on the phone's Home card
const strip = (day, of) => '<div style="' + st({ display: 'flex', gap: '4px', marginTop: '12px' }) + '">' + Array.from({ length: of }, (_, i) => '<i style="' + st({ flex: 1, height: '6px', borderRadius: '999px', background: i < day - 1 ? K.green : i === day - 1 ? K.blue : '#E7EAE3' }) + '"></i>').join('') + '</div>';
const callout = (x, y, n) => '<span style="' + st({ position: 'absolute', left: x + 'px', top: y + 'px', width: '26px', height: '26px', borderRadius: '999px', background: '#C2410C', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px #FFFFFF', zIndex: 5 }) + '">' + n + '</span>';

(async () => {
  const B = { room: await bg('bgroom'), room960: await bg('bgroom', 960), panel: await bg('bgpanel'), task: await bg('bgtask'), pig: await bg('bgpig'), pen: await bg('bgpen') };
  const frame = (no, title, note, img, over, w) => { w = w || 1360; return '<div><div style="' + st({ display: 'flex', alignItems: 'baseline', gap: '12px', fontSize: '15px', lineHeight: '22px' }) + '"><b style="font-weight: 600;">' + no + ' · ' + esc(title) + '</b></div><div style="' + st({ marginTop: '4px', color: '#5D665F', fontSize: '14px', lineHeight: '21px', maxWidth: (w - 40) + 'px' }) + '">' + note + '</div><div style="' + st({ position: 'relative', width: w + 'px', height: '830px', marginTop: '14px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 0 0 1px #DADFD5, 0 12px 32px rgba(17,21,17,.10)', background: '#E9EDE4' }) + '"><img alt="" src="' + img + '" style="position: absolute; left: 0; top: 0; width: ' + w + 'px; height: 830px; display: block;">' + over + '</div></div>'; };
  const roomTop = (on, o) => top(Object.assign({ name: 'Gestation 2', dot: true, warn: true, on: on, pigs: 186 }, o || {}));

  // panels from the live view, moved under the new top
  const pig = dump('pig'), task = dump('task'), eq = dump('eq'), room = dump('room');
  let pigP = movePanel(grab(pig, 'data-zone="panel"'));
  const perfLink = pigP.slice(pigP.indexOf('<span data-a="pigperf"'), pigP.indexOf('</span>', pigP.indexOf('<span data-a="pigperf"') + 30) + 7);
  pigP = need(pigP, perfLink, '');
  // shown scrolled to the bottom, where the one Performance sits
  pigP = need(pigP, 'max-height: calc(100% - 104px);', 'height: calc(100% - 104px);');
  pigP = need(pigP, 'overflow-y: auto; overflow-x: hidden;', 'overflow: hidden; display: flex; flex-direction: column;');
  { const o0 = pigP.indexOf('>') + 1, hd = outer(pigP, pigP.indexOf('<div', o0)), h1 = pigP.indexOf(hd) + hd.length, body = pigP.slice(h1, pigP.lastIndexOf('</section>'));
    pigP = pigP.slice(0, h1) + '<div style="' + st({ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', margin: '12px -16px 0', padding: '0 16px', borderTop: '1px solid ' + K.line, WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 28px)', maskImage: 'linear-gradient(to bottom, transparent 0, #000 28px)' }) + '">' + body + '</div></section>'; }
  let taskP = movePanel(grab(task, 'data-zone="panel"'));
  // the legend row chosen: a quiet fill inside the card, no outline running past it
  taskP = need(taskP, 'data-a="only:active" style="display: flex; align-items: center; gap: 10px; height: 36px; margin: 0 -8px; padding: 0 8px; border-radius: 8px; border-top: 1px solid #DFE4D8; background: transparent;', 'data-a="only:active" style="display: flex; align-items: center; gap: 10px; height: 36px; margin: 0; padding: 0 8px; border-radius: 8px; border-top: 1px solid #DFE4D8; background: #EEF0EA;');
  taskP = taskP.replace(/margin: 0 -8px; padding: 0 8px; border-radius: 8px;/g, 'margin: 0; padding: 0 8px; border-radius: 8px;');
  const eqPop = grab(eq, 'data-pop="1"'), eqTiles = eqPop.slice(eqPop.indexOf('<div style="display: grid;'), eqPop.lastIndexOf('</div>'));
  const taskTop = (on) => top({ name: 'Farrowing Room 2', on: on, pigs: 50 });

  // 1–8 · the bar and 3D as a pair: once on top, once at the bottom
  const colHead = (h, sub) => '<div style="' + st({ marginBottom: '-36px' }) + '"><div style="' + st({ fontSize: '20px', lineHeight: '28px', fontWeight: 600 }) + '">' + h + '</div><div style="' + st({ color: '#5D665F', fontSize: '14px' }) + '">' + sub + '</div></div>';
  const variant = (pos, n0, where) => {
    POS = pos;
    const pigsInner = H.head('Pigs', 'Gestation 2', '') + H.sec('Show on the farm', '<span style="font-size: 13px; font-weight: 500;">Clear</span>', 20) + H.card([{ name: 'Sows', n: '182', sw: '#2F3A33', on: true, bold: true }, { name: 'Boars', n: '4', sw: '#718075', bold: true }].map(choice).join(''), { pad: '6px' });
    const out = [
      frame(n0, 'The bar, 3D and Select', 'Three things, each in its own place. Top left, the bar sized to what it holds: ‹ goes one level up, the name switches between places at this level, then the panels: Batches, Pigs with how many there are, Devices (a dot in the worst colour inside, red here because the feed line has stopped). Panels open on the right, from the top. Bottom left, 3D: the camera tools, kept away from the panels so it never reads as one of them. Bottom right, Select: a mode, not a panel; its actions open upward from it (frames 5–7).', B.room, roomTop('')),
      frame(n0 + 1, '3D opened: the camera tools', 'It opens upward. 3D and Plan are one switch; rotate, zoom, fit and night; Edit layout sits apart. Click only: it stays open while you rotate or zoom and closes when you click the farm.', B.room, roomTop('', { viewOpen: true }) + viewMenu()),
      frame(n0 + 2, 'Click the name: switch rooms', 'Just the places at this level, the current one ticked, a red dot where something is wrong; it opens ' + (pos === 'top' ? 'down' : 'up') + ' from the name. To go up, use ‹, then the name again.', B.room,
        roomTop('', { open: true, under: switcher([{ name: 'Gestation 1', n: '152 pigs' }, { name: 'Gestation 2', n: '186 pigs', dot: true, on: true }, { name: 'Sick room', n: '3 pigs', dot: true }]) })),
      frame(n0 + 3, 'Pigs 186 opens its panel', 'Panels open on the right, ' + (pos === 'top' ? 'under' : 'above') + ' the bar. Pick a kind and only those pens keep their colour; <b>Clear</b> brings every pen back.', B.room, roomTop('pigs') + panel(pigsInner)),
    ];
    POS = 'top'; return out;
  };
  const A = variant('top', 1, 'on top');
  // 9–11 · select, then act: Actions only exists for what you picked
  const tick = (on) => '<span style="' + st({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, boxSizing: 'border-box', border: on ? '0' : '1.5px solid #B9C1B5', background: on ? K.ink : K.paper, color: '#FFFFFF' }) + '">' + (on ? icon(I.check, 14) : '') + '</span>';
  const ACTS = [[I.syringe, 'Treatment'], [I.shield, 'Vaccination'], [I.flask, 'Sampling'], [I.move, 'Move'], [I.feeder, 'Feed'], [I.note, 'Note']];
  const selBar = (count, sub) => '<span style="' + st({ display: 'inline-flex', flexDirection: 'column', padding: '0 12px 0 8px' }) + '">' + t(count, { fontSize: '15px', fontWeight: 600 }) + sm(sub) + '</span>' + vline + ACTS.map((a) => tab(a[0], a[1])).join('') + vline + tab(I.out, 'Culling') + vline + '<span style="' + st({ padding: '0 10px', fontSize: '14px', fontWeight: 500 }) + '">Clear</span>';
  const hint = '<span style="' + st({ padding: '0 12px 0 10px' }) + '">' + t('Click pens to select them', { color: K.muted }) + '</span>';
  const B2 = { selplan: await bg('bgselplan'), pickplan: await bg('bgpickplan'), pen: await bg('bgpen') };
  const s1 = frame(5, "Select: the farm goes to Plan; the actions open, waiting", "Select turns on select mode. The farm turns to Plan so pens are easy to hit, and the actions open upward from the button, greyed until something is picked. Cancel, at the bottom where Select was, ends it.",
    B2.selplan, top({ name: 'Gestation 2', dot: true, warn: true, pigs: 186, plan: true, on: 'select', actsOff: true }));
  const s2 = frame(6, "Pens picked: the actions wake up", "Click pens to add or remove them; the outlines say what is picked, so the card does not repeat it. One Cancel: it drops the pick and leaves select mode (Done, Clear and Cancel were one job). After an action is done, the pick ends by itself.",
    B2.pickplan, top({ name: 'Gestation 2', dot: true, warn: true, pigs: 186, plan: true, on: 'select' }));
  // a group pen: its pig list ticks pigs, and the same bar acts on them
  let penP = movePanel(grab(dump('pen'), 'data-zone="panel"'));
  const ticked = ['906660', '793326'];
  penP = penP.replace(/<div data-a="pigtag:(\d+)" style="display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 16px; border-top: ([^;]+); cursor: pointer;">/g, (m, id, bt) => '<div data-a="pigtag:' + id + '" style="display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 16px; border-top: ' + bt + '; cursor: pointer; background: ' + (ticked.includes(id) ? K.press : 'transparent') + ';">' + tick(ticked.includes(id)));
  const s3 = frame(7, "Pigs in a pen: tick them in its list", "Inside a pen there is no select mode: tick pigs in its list (the box; the row still opens her card) and the same actions open at the bottom, next to the panel, with Cancel. The ticks already show what is picked, so there is no count line. Pigs without ID have no box.",
    B2.pen, top({ name: 'Pen B7', pigs: 9, noBatch: true, on: 'pigs', acts: true, beside: true }) + penP);

  // 5 · equipment on the right
  const t0 = eqTiles.indexOf('<div data-a="trendt"'), tTile = eqTiles.slice(t0, eqTiles.indexOf('<div data-a', t0 + 10));
  const hTile = tTile.replace('Temperature', 'Humidity').replace('22.4 °C', '61 %').replace(/<svg[\s\S]*?<\/svg>/, icon(I.drop, 16));
  const eqTiles2 = eqTiles.replace(tTile, tTile + hTile);
  const eqInner = H.head('Devices', 'Gestation 2', '') + '<div style="margin-top: 16px;">' + eqTiles2 + '</div>';
  const f6 = frame(8, 'Devices: the sensors and the equipment, on the right', 'Equipment is renamed Devices and holds the room readings that used to sit on the bar: temperature, humidity, ammonia first, then climate, fans, lights, drinkers, cameras. Same place and size as Batches and Pigs; a tile opens its card in the same panel, with Back. Ammonia out of range is the amber tile; the stopped feed line is red, so the dot on Devices is red.', B.panel,
    roomTop('equip') + panel(eqInner));
  // 6 · the task: legend is the key, no tooltip
  const f7 = frame(9, 'A task: the legend is the key, so no tooltip', 'The ring has no hover card: the legend beside it already says the same. Clicking a legend row shows only those pens; the chosen row is a quiet fill that stays inside its card.', B.task,
    taskTop('batches') + taskP);
  // 7 · pig profile: one Performance
  const f8 = frame(10, 'At a pen: no pig count; one Performance', 'At a pen there are no batches, so Batches leaves the bar (her batch is a link on her card); the bar names the pen and Pigs has no count (her card is the panel, shown scrolled to the bottom). Her litters loses its “Performance ›” link; Performance is the button at the bottom, next to Log.', B.pig,
    top({ name: 'Pen A7', noBatch: true }) + pigP);
  // 8 · 960
  const f9 = frame(11, 'At 960 wide: the same bar', 'The bar and the 3D button keep their size; the farm gets the rest.', B.room960,
    top({ name: 'Gestation 2', dot: true, warn: true, pigs: 186 }), 960);
  // 10 · batch cards from the last round
  const tcard = (title, big, word, day, of, sub) => H.card('<div style="' + st({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }) + '">' + t(title, { fontSize: '15px', fontWeight: 600 }) + H.chev + '</div><div style="' + st({ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }) + '">' + t(big, { fontSize: '28px', lineHeight: '32px', fontWeight: 600, letterSpacing: '-.02em' }) + mu(word, { fontSize: '15px' }) + (sub ? '<span style="margin-left: auto;">' + H.badge('amber', sub) + '</span>' : '') + '</div>' + strip(day, of) + '<div style="margin-top: 8px;">' + mu('Day ' + day + ' of ' + of) + '</div>', { pad: '14px 16px' });
  const up = (rows) => H.sec('Upcoming') + H.card(rows.map((x, i) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '48px', borderTop: i ? '1px solid ' + K.line : '0' }) + '">' + t(x[0], { width: '80px', fontSize: '13px', color: K.muted }) + t(x[1], { flex: 1, whiteSpace: 'normal' }) + mu(x[2]) + '</div>').join(''), { pad: '0 16px' });
  const b32 = H.head('Batch 32', 'Farrowing Room 2 · 50 sows', 'back') + H.sec('Running now', '', 20) + tcard('Farrowing', '4', 'farrowing', 3, 7, '1 past due') + '<div style="height: 8px;"></div>' + tcard('Post-farrowing check', '6', 'due today', 3, 7) + up([['Sat 7 Nov', 'Piglet processing', 'in 2 days'], ['Fri 27 Nov', 'Wean, to Nursery 1', 'in 3 weeks']]);
  const f10 = frame(12, 'Batch page: the phone’s task card (from last round, for your call)', 'Each running task says what is happening now in one number (Home’s rules: farrowing underway, then past due, then due today, then the next date) and the days as the phone’s strip. No ring: the ring read as “% done” but counted days.', B.task,
    taskTop('batches') + panel(b32));
  const quiet = H.card('<div style="' + st({ display: 'flex', alignItems: 'center', gap: '10px' }) + '">' + t('No task running', { fontWeight: 600 }) + '<span style="margin-left: auto;">' + mu('next: Weigh 10 pigs, in 3 days') + '</span></div>', { pad: '14px 16px' });
  const b31 = H.head('Batch 31', 'Nursery, day 24 of 42 · 488 weaners', 'back') + '<div style="margin: 20px 4px 0;">' + mu('No task running', { fontSize: '14px' }) + '</div>' + up([['Fri 6 Nov', 'Weigh 10 pigs', 'in 3 days'], ['Wed 2 Dec', 'End of nursery, to Finisher 2', 'in 4 weeks']]);
  const f11 = frame(13, 'A batch in a stage: no card to fill', 'Nursery and Quarantine are stages, not tasks. The stage and its day live in the header; the page says plainly that no task is running, and Upcoming already says what comes next, so it is not said twice.', B.task,
    taskTop('batches') + panel(b31));

  const shell = fs.readFileSync(path.join(path.dirname(OUT), 'LocationCard.dc.html'), 'utf8');
  const pre = shell.slice(0, shell.indexOf('<div style="width: 1760px;')).replace('<title>Location card</title>', '<title>Farm view layout</title>');
  const W = 1360 * 2 + 56 + 96;
  const html = pre + '<div style="' + st({ width: W + 'px', padding: '40px 48px 64px', boxSizing: 'border-box', background: '#F3F4F1', fontFamily: "'Geist', system-ui, sans-serif", fontSize: '14px', lineHeight: '20px', color: '#111511', WebkitFontSmoothing: 'antialiased', fontVariantNumeric: 'tabular-nums' }) + '">' +
    '<h1 style="margin: 0; font-size: 28px; line-height: 36px; font-weight: 600; letter-spacing: -.025em;">Farm view, rearranged</h1>' +
    '<div style="margin-top: 6px; color: #5D665F; max-width: 1500px; font-size: 15px; line-height: 23px;">A proposal on the farm as it renders today; the 3D is untouched. One rule throughout: <b>nothing on the edges reacts to hover</b>. Hovers stay on the farm (a pen) and on charts where they add detail the screen does not already show. Everything else is a click, and every panel opens in the same place on the right.</div>' +
    '<div style="' + st({ display: 'grid', gridTemplateColumns: 'repeat(2, 1360px)', gap: '64px 56px', marginTop: '36px', alignItems: 'start' }) + '">' + [A[0], A[1], A[2], A[3]].join('\n') + '</div>' +
    '<h2 style="margin: 64px 0 0; padding-top: 28px; border-top: 1px solid #DFE4D8; font-size: 22px; line-height: 28px; font-weight: 600;">Select, then act</h2>' +
    '<div style="' + st({ display: 'grid', gridTemplateColumns: 'repeat(2, 1360px)', gap: '64px 56px', marginTop: '24px', alignItems: 'start' }) + '">' + [s1, s2, s3].join('\n') + '</div>' +
    '<h2 style="margin: 64px 0 0; padding-top: 28px; border-top: 1px solid #DFE4D8; font-size: 22px; line-height: 28px; font-weight: 600;">The rest</h2>' +
    '<div style="' + st({ display: 'grid', gridTemplateColumns: 'repeat(2, 1360px)', gap: '64px 56px', marginTop: '24px', alignItems: 'start' }) + '">' + [f6, f7, f8, f9].join('\n') + '</div>' +
    '<h2 style="margin: 64px 0 0; padding-top: 28px; border-top: 1px solid #DFE4D8; font-size: 22px; line-height: 28px; font-weight: 600;">Batch cards</h2>' +
    '<div style="' + st({ display: 'grid', gridTemplateColumns: 'repeat(2, 1360px)', gap: '64px 56px', marginTop: '24px', alignItems: 'start' }) + '">' + [f10, f11].join('\n') + '</div></div>\n</x-dc>\n</body>\n</html>\n';
  fs.writeFileSync(OUT, html); console.log('wrote', OUT, html.length);
})();
