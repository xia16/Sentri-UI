// Schedule and Work schedule as tabs beside the live chat (the Farm view's layout), instead of pop-ups. Two mock-up boards.
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const S = __dirname;
const K = { ink: '#1c1917', muted: '#57534e', faint: '#a8a29e', line: '#efeeec', line2: '#f1f0ee', page: '#f5f5f4', green: '#28734F', card: '#e7e5e4',
  doneF: '#E3F0E8', doneI: '#28734F', todayF: '#EAF1FC', todayI: '#3972B7', planF: '#F1F3EE', planI: '#20291F', lateF: '#FBECEA', lateI: '#B34B43', fc: '#9CA59D', fcI: '#657060', todayCol: '#f5f9f5',
  amberF: '#FCF4E2', amberI: '#7A5410', amberB: '#EBD9AE' };
const st = (o) => Object.entries(o).map(([k, v]) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ': ' + v).join('; ');
const svg = (d, w, sw, c) => '<svg viewBox="0 0 24 24" style="width: ' + w + 'px; height: ' + w + 'px; flex: none; fill: none; stroke: ' + (c || 'currentColor') + '; stroke-width: ' + sw + '; stroke-linecap: round; stroke-linejoin: round;"><path d="' + d + '"/></svg>';
const CHECK = (c, w) => svg('m5 12.5 4.5 4.5L19 7.5', w || 13, 2.6, c);
const CHEV = (d) => svg(d < 0 ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6', 16, 2);
const I = { home: 'M3 10.5 12 3l9 7.5V21H3V10.5Z', map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14', cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', team: 'M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c.6-3.2 3-5 6-5s5.4 1.8 6 5M16 4.5a3.2 3.2 0 0 1 0 6.3M18 15c2 .6 3.4 2.2 4 5',
  x: 'M7 7l10 10M17 7 7 17', spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M6.3 17.7l2.4-2.4M15.3 8.7l2.4-2.4' };

// ---------- the pane: tabs, then the page ----------
const tab = (icon, label, on, badge) => '<span style="display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 11px; border-radius: 10px; font-size: 13.5px; font-weight: ' + (on ? 600 : 400) + '; color: ' + (on ? K.ink : '#6b716a') + '; background: ' + (on ? '#f1f1ee' : 'transparent') + ';">' + svg(icon, 16, 1.7) + label + (badge ? '<span style="width: 19px; height: 19px; border-radius: 99px; background: #111; color: #c8f26b; font-size: 11px; font-weight: 600; display: grid; place-items: center;">' + badge + '</span>' : '') + (on ? '<span style="display: inline-flex; color: #8b918a; margin-left: 2px;">' + svg(I.x, 14, 2) + '</span>' : '') + '</span>';
const pane = (active, page) => '<div style="' + st({ position: 'absolute', left: '481px', top: '9px', width: '950px', height: '882px', borderRadius: '13px', overflow: 'hidden', background: K.page, fontFamily: 'Inter, sans-serif', color: K.ink }) + '">' +
  '<div style="height: 51px; background: #fff; display: flex; align-items: center; gap: 2px; padding: 0 10px; box-sizing: border-box; border-bottom: 1px solid #ecebe8;">' + tab(I.home, 'Home', false, 6) + tab(I.map, 'Farm view', false) +
  (active === 'sched' ? tab(I.cal, 'Schedule', true) : tab(I.team, 'Work schedule', true)) + '</div>' + page + '</div>';
const pageHead = (title, right) => '<div style="display: flex; align-items: center; gap: 10px; padding: 16px 18px 12px 20px;"><h2 style="margin: 0 8px 0 0; font-size: 19px; font-weight: 600; letter-spacing: -.01em;">' + title + '</h2>' +
  '<span style="height: 30px; padding: 0 10px; border: 1px solid #d6d3d1; background: #fff; border-radius: 9px; font-size: 13px; display: inline-flex; align-items: center;">Today</span><span style="display: inline-flex;">' + CHEV(-1) + '</span><span style="display: inline-flex;">' + CHEV(1) + '</span>' + right + '</div>';
const whiteCard = (h) => '<div style="margin: 0 14px; background: #fff; border-radius: 14px; box-shadow: 0 1px 3px #1c19170f; overflow: hidden; position: relative;">' + h + '</div>';

// ---------- chat overlay ----------
const chatLook = (name) => '<div style="' + st({ position: 'absolute', left: '119px', top: '723px', height: '25px', padding: '0 8px', borderRadius: '7px', background: '#f1f1ee', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#6b716a', fontFamily: 'Inter, sans-serif' }) + '">' + svg(name === 'Schedule' ? I.cal : I.team, 13, 1.7) + 'Looking at <b style="color: ' + K.ink + '; font-weight: 600;">' + name + '</b></div>';
const chat = (msgs, name) => '<div style="' + st({ position: 'absolute', left: '73px', top: '69px', width: '398px', height: '637px', background: '#fff', fontFamily: 'Inter, sans-serif', color: K.ink, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 20px 14px', boxSizing: 'border-box', gap: '18px', overflow: 'hidden' }) + '">' + msgs + '</div>' + chatLook(name);
const me = (t) => '<div style="align-self: flex-end; max-width: 300px; background: #f1f1ee; border-radius: 14px; padding: 11px 14px; font-size: 14.5px; line-height: 22px;">' + t + '</div>';
const gm = (time, t, extra) => '<div style="display: grid; grid-template-columns: 26px 1fr; column-gap: 10px;"><span style="width: 26px; height: 26px; border-radius: 7px; background: #15241a; color: #c8f26b; font-size: 10px; font-weight: 700; display: grid; place-items: center;">GM</span><div><div style="font-size: 13.5px; font-weight: 600;">General Manager <span style="font: 400 12px ui-monospace, monospace; color: ' + K.muted + '; margin-left: 4px;">' + time + '</span></div><div style="font-size: 14.5px; line-height: 23px; margin-top: 4px;">' + t + '</div>' + (extra || '') + '</div></div>';
const btn = (t, dark) => '<span style="height: 36px; padding: 0 14px; border-radius: 10px; display: inline-flex; align-items: center; font-size: 13.5px; font-weight: 500; ' + (dark ? 'background: #15201a; color: #fff;' : 'background: #fff; box-shadow: inset 0 0 0 1px #dcdad6;') + '">' + t + '</span>';

// ---------- Schedule (version A, at pane width) ----------
const DAYS = [['Mon', 2], ['Tue', 3], ['Wed', 4], ['Thu', 5], ['Fri', 6], ['Sat', 7], ['Sun', 8]], TODAY = 3;
const ROWS = [
  { g: 'Production', name: 'Farrowing', sub: 'B33 · Farrowing 1', cells: ['', '', '', '', 'e6', 'e14', 'e12'], more: true },
  { g: 'Production', name: 'Fostering checks', sub: 'B32 · Farrowing 2', cells: ['d8', 'd8', 'w6', 'o8', 'p8', 'p8', 'p8'], more: true },
  { g: 'Production', name: 'Pregnancy check', sub: 'B35 · Gestation 1', cells: ['', 'd24', 'd28', '', '', '', ''] },
  { g: 'Health', name: 'Amox treatment', sub: '4 sows · Gestation 2', cells: ['', '', '', 'o4', 'p4', 'p4', ''] },
  { g: 'Health', name: 'Pen-strep treatment', sub: '6 piglets · twice a day', cells: ['', '', 'd6|d6', 'd6|o6', 'p6|p6', '', ''] },
  { g: 'Health', name: 'PRRS vaccine', sub: '3 weaners · Nursery 1', cells: ['', '', '', 'o3', '', '', ''] },
  { g: 'Health', name: 'PRRS sampling', sub: 'B30 · Nursery 1', cells: ['d10', '', '', '', '', '', ''] },
  { g: 'Other', name: 'Move', sub: 'Gestation 2, 3 → Farrowing 1', cells: ['d48', '', '', '', '', '', ''] },
  { g: 'Other', name: 'Wash', sub: 'Farrowing 3', cells: ['', '', '', '', 'p1', '', ''] }
];
const kind = (c) => ({ d: 'done', w: 'late', o: 'today', p: 'plan', e: 'fc', m: 'moving', g: 'gone' })[c[0]];
const num = (c) => +c.replace(/\D/g, '');
const look = (k) => ({ done: [K.doneF, K.doneI, 'none'], late: [K.lateF, K.lateI, 'none'], today: [K.todayF, K.todayI, 'inset 0 0 0 1.5px ' + K.todayI], plan: [K.planF, K.planI, 'none'], fc: ['transparent', K.fcI, 'inset 0 0 0 1px ' + K.fc],
  moving: ['#fff', K.ink, 'none'], gone: [K.planF, K.faint, 'none'] })[k];
const label = (c) => { const k = kind(c), n = num(c); return k === 'done' ? CHECK(K.doneI, 12) + n : k === 'late' ? n + ' of 8' : k === 'fc' ? '~' + n : String(n); };
const LBL = 190;
const cols = 'display: grid; grid-template-columns: ' + LBL + 'px repeat(7, minmax(0, 1fr)) 18px;';
const slot = (c, rad) => { const k = kind(c), L = look(k); return '<span style="' + st({ flex: 1, minWidth: 0, height: '32px', borderRadius: rad, background: L[0], color: L[1], boxShadow: L[2], border: k === 'moving' ? '1.5px dashed ' + K.ink : '0', boxSizing: 'border-box', opacity: k === 'gone' ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }) + '">' + label(c) + '</span>'; };
const cell = (c) => { if (!c) return '<div style="border-left: 1px solid ' + K.line2 + ';"></div>'; const p = c.split('|');
  return '<div style="display: flex; align-items: center; gap: 2px; padding: 0 4px; border-left: 1px solid ' + K.line2 + ';">' + p.map((x, i) => slot(x, p.length === 1 ? '4px' : i === 0 ? '4px 1px 1px 4px' : '1px 4px 4px 1px')).join('') + '</div>'; };
const schedGrid = (rows) => { const gh = (g) => '<div style="height: 30px; display: flex; align-items: flex-end; padding: 0 0 5px 16px; box-sizing: border-box; font-size: 12px; font-weight: 600; color: ' + K.muted + '; border-bottom: 1px solid ' + K.line2 + ';">' + g + '</div>';
  const head = '<div style="' + cols + ' height: 56px; border-bottom: 1px solid ' + K.line + '; position: relative; z-index: 1;"><div></div>' + DAYS.map((d, i) => '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border-left: 1px solid ' + K.line2 + ';"><span style="font-size: 10.5px; font-weight: 500; letter-spacing: .03em; text-transform: uppercase; color: ' + K.muted + ';">' + d[0] + '</span><b style="display: grid; place-items: center; width: 25px; height: 25px; border-radius: 99px; font-size: 14.5px; font-weight: 600; background: ' + (i === TODAY ? K.green : 'transparent') + '; color: ' + (i === TODAY ? '#fff' : i < TODAY ? K.faint : K.ink) + ';">' + d[1] + '</b></div>').join('') + '<div></div></div>';
  let h = ''; ['Production', 'Health', 'Other'].forEach((g) => { h += gh(g); rows.filter((r) => r.g === g).forEach((r) => { h += '<div style="' + cols + ' height: 54px; border-bottom: 1px solid ' + K.line2 + '; position: relative; z-index: 1; background: ' + (r.hl ? 'rgba(40,115,79,.05)' : 'transparent') + ';"><div style="display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 0 8px 0 16px; min-width: 0;"><span style="font-size: 13px; font-weight: 500; white-space: nowrap;">' + r.name + '</span><span style="font-size: 12px; color: ' + K.muted + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + r.sub + '</span></div>' + r.cells.map(cell).join('') + '<div style="display: flex; align-items: center; color: ' + K.faint + ';">' + (r.more ? CHEV(1) : '') + '</div></div>'; }); });
  const tint = '<div style="position: absolute; top: 56px; bottom: 0; left: calc(' + LBL + 'px + (100% - ' + LBL + 'px - 18px) * 3 / 7); width: calc((100% - ' + LBL + 'px - 18px) / 7); background: ' + K.todayCol + ';"></div>';
  return whiteCard(tint + head + h); };
const schedPage = (rows) => pageHead('Schedule', '<b style="font-size: 14px; font-weight: 600;">Mon 2 – Sun 8 Nov</b><span style="flex: 1;"></span><span style="display: flex; background: #eaeae7; border-radius: 8px; padding: 3px;"><span style="background: #fff; box-shadow: 0 1px 2px #1c19171a; border-radius: 6px; padding: 4px 10px; font-size: 13px;">Week</span><span style="padding: 4px 10px; font-size: 13px; color: ' + K.muted + ';">2 weeks</span></span>') + schedGrid(rows);
const movedRows = ROWS.map((r) => r.name === 'Wash' ? Object.assign({}, r, { hl: true, cells: ['', '', '', '', 'g1', 'm1', ''] }) : r);
const washCard = '<div style="margin-top: 10px; border: 1px solid #e4e2de; border-radius: 12px; padding: 12px 14px;"><div style="font-size: 13.5px; font-weight: 600;">Move Wash · Farrowing 3</div><div style="font-size: 13px; color: ' + K.muted + '; margin-top: 2px;">Fri 6 Nov &rarr; Sat 7 Nov · Sun Qing</div><div style="display: flex; gap: 8px; margin-top: 12px;">' + btn('Approve', true) + btn('Change something') + '</div></div>';
const schedChat = me('Can the wash in Farrowing 3 move to Saturday? Sun Qing is short on time Friday.') + gm('09:24', 'Yes. Farrowing 3 stays empty until Batch 34 moves in on Mon 9 Nov, so Saturday still leaves two days to dry. The dashed box on the Schedule is where it goes.', washCard);

// ---------- Work schedule (at pane width) ----------
// a job is the task and where it happens (no counts); state d done, n now, x to do; late = carried over
const P = [
  { ini: 'LW', bg: '#FDE7C2', fg: '#6B4300', name: 'Li Wei', load: [7.5, 8], am: [['d', 'Walk-through', 'Farrowing 1–4'], ['n', 'Fostering checks', 'B32 · Farrowing 2']], pm: [['x', 'A5 and B10', 'Wed · Farrowing 2', 'late'], ['x', 'Ready for farrowing', 'B33 · Farrowing 1']] },
  { ini: 'LY', bg: '#E4ECF7', fg: '#2B4A73', name: 'Liu Yang', load: [7, 8], am: [['d', 'Feeding', 'Farrowing 1 and 2'], ['n', 'Piglet processing', 'B32 · Farrowing 2']], pm: [['x', 'Second feed', 'Farrowing 1 and 2'], ['x', 'Get ready to wash', 'Farrowing 3']] },
  { ini: 'SQ', bg: '#EDE7F6', fg: '#4B3577', name: 'Sun Qing', load: [5.5, 8], am: [['d', 'Feeding', 'Farrowing 3 and 4'], ['d', 'Pen-strep, morning', 'Farrowing 2']], pm: [['x', 'Second feed', 'Farrowing 3 and 4'], ['x', 'Pen-strep, evening', 'Farrowing 2']] },
  { ini: 'WF', bg: '#E2F0DA', fg: '#203D2B', name: 'Wang Fang', load: [6.5, 8], am: [['d', 'Walk-through', 'Nursery 1 and 2'], ['n', 'PRRS vaccine', 'Nursery 1']], pm: [['x', 'Weigh', 'B30 · Nursery 1']] },
  { ini: 'ZM', bg: '#F3E8F7', fg: '#5B2D6E', name: 'Zhao Min', load: [6.5, 8], am: [['d', 'Heat check', 'B35 · Gestation 1'], ['n', 'Amox treatment', 'Gestation 2']], pm: [['x', 'Walk-through', 'Gestation 1–3']] },
  { ini: 'ML', bg: '#E6F1EE', fg: '#1F5A50', name: 'Ma Lin', load: [7, 8], am: [['d', 'Feeding', 'Gestation 1–3'], ['x', 'Body condition', 'B34 · Gestation 1']], pm: [['x', 'Second feed', 'Gestation 1–3']] },
  { ini: 'GF', bg: '#FBE5E3', fg: '#A23B33', name: 'Gao Feng', load: [5, 8], am: [['n', 'Water line B', 'Gestation 2']], pm: [['x', 'Heat lamps', 'Farrowing 2 +2']] }
];
const job = (j, o) => { o = o || {}; const now = j[0] === 'n', done = j[0] === 'd', late = j[3] === 'late';
  return '<div style="' + st({ flex: '1 1 0', minWidth: 0, maxWidth: '170px', height: '52px', boxSizing: 'border-box', padding: '0 9px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px',
    background: now ? K.todayF : done ? '#FAFAF9' : '#fff', boxShadow: now ? 'inset 0 0 0 1.5px ' + K.todayI : o.moved ? 'inset 0 0 0 2px ' + K.green : o.lift ? '0 10px 26px rgba(28,25,23,.22), 0 0 0 1px ' + K.card : 'inset 0 0 0 1px ' + (done ? '#efeeec' : K.card),
    transform: o.lift ? 'rotate(-1.5deg)' : 'none', opacity: o.dim ? 0.35 : 1, position: 'relative' }) + '">' +
    '<span style="display: flex; align-items: center; gap: 4px; min-width: 0;">' + (done ? CHECK(K.doneI, 12) : '') + '<span style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ' + (now ? K.todayI : done ? K.muted : K.ink) + ';">' + j[1] + '</span></span>' +
    '<span style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ' + (late ? K.lateI : done ? K.faint : K.muted) + ';">' + j[2] + '</span>' +
    (o.moved ? '<span style="position: absolute; top: -9px; right: 8px; height: 17px; padding: 0 6px; border-radius: 5px; background: ' + K.green + '; color: #fff; font-size: 10.5px; font-weight: 600; display: flex; align-items: center;">Moved</span>' : '') + '</div>'; };
const WG = 'display: grid; grid-template-columns: 150px minmax(0, 1fr) minmax(0, 1fr) 76px;';
const hours = (x) => { const h = Math.floor(x), half = x - h >= 0.5; return h + (half ? '½' : '') + ' h'; };
const loadCell = (l) => '<div style="display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 0 14px 0 10px;"><b style="font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap;">' + hours(l[0]) + '</b><span style="height: 4px; border-radius: 2px; background: #EDECEA; overflow: hidden;"><span style="display: block; height: 100%; width: ' + Math.min(100, l[0] / l[1] * 100) + '%; background: #A8A29E;"></span></span></div>';
const HALF = '<div style="display: flex; align-items: center; gap: 5px; padding: 0 7px; border-left: 1px solid ' + K.line2 + '; min-width: 0;">';
const pRow = (p, o) => { o = o || {}; const half = (list, k) => HALF + (o[k + 'Lead'] || '') + list.map((j, i) => (o[k] || {})[i] === 'drop' ? '' : job(j, (o[k] || {})[i])).join('') + (o[k + 'Extra'] || '') + '</div>';
  return '<div style="' + WG + ' height: 70px; border-bottom: 1px solid ' + K.line2 + '; background: ' + (o.hl ? '#FBFAF7' : 'transparent') + ';"><div style="display: flex; align-items: center; gap: 9px; padding-left: 16px; min-width: 0;"><span style="width: 30px; height: 30px; flex: none; border-radius: 99px; background: ' + p.bg + '; color: ' + p.fg + '; display: grid; place-items: center; font-size: 11.5px; font-weight: 600;">' + p.ini + '</span><span style="font-size: 13.5px; font-weight: 600; white-space: nowrap;">' + p.name + '</span></div>' +
    half(p.am, 'am') + half(p.pm, 'pm') + loadCell(o.load || p.load) + '</div>' + (o.note || ''); };
const wsHead = '<div style="' + WG + ' height: 36px; border-bottom: 1px solid ' + K.line + '; font-size: 12px; font-weight: 600; color: ' + K.muted + ';"><div style="display: flex; align-items: center; padding-left: 16px;">7 people</div><div style="display: flex; align-items: center; padding-left: 10px; border-left: 1px solid ' + K.line2 + ';">Morning</div><div style="display: flex; align-items: center; padding-left: 10px; border-left: 1px solid ' + K.line2 + ';">Afternoon</div><div style="display: flex; align-items: center; padding-left: 10px;">Of 8 h</div></div>';
const wsPage = (rows) => pageHead('Work schedule', '<b style="font-size: 14px; font-weight: 600;">Thu 5 Nov</b><span style="flex: 1;"></span><span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: ' + K.muted + ';">' + svg(I.spark, 14, 1.8) + 'Suggested by Sentri at 05:30</span>') + whiteCard(wsHead + rows);
const A5 = ['x', 'A5 and B10', 'Wed · Farrowing 2', 'late'];
const ws1 = P.map((p) => pRow(p)).join('');
// asked in the chat: A5 and B10 leaves Li Wei's afternoon and leads Zhao Min's
const ws2rows = P.map((p, i) => i === 0 ? pRow(p, { pm: { 0: 'drop' }, load: [6.5, 8] }) : i === 4 ? pRow(p, { pmLead: job(A5, { moved: true }), load: [7.5, 8] }) : pRow(p)).join('');
const wsChat = me('Li Wei has a full afternoon. Give A5 and B10 to Zhao Min.') + gm('09:24', 'Done. A5 and B10 is first in Zhao Min&rsquo;s afternoon, before her walk-through in Gestation, so she goes from piglets to sows and not back.');
const note = '<div style="display: flex; align-items: center; gap: 10px; padding: 9px 16px 9px 166px; background: ' + K.amberF + '; border-bottom: 1px solid ' + K.amberB + '; font-size: 13px; line-height: 19px; color: ' + K.amberI + ';"><span style="width: 18px; height: 18px; border-radius: 99px; background: #e8b33c; color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 700; flex: none;">!</span><span style="flex: 1;">Gestation into Farrowing 2 breaks clean to dirty. First in her afternoon?</span><span style="font-weight: 600; white-space: nowrap; text-decoration: underline; text-underline-offset: 3px;">Put it first</span></div>';
// dragged by hand behind her walk-through
const ws3 = P.map((p, i) => i === 0 ? pRow(p, { pm: { 0: { dim: true } }, load: [6.5, 8] }) : i === 4 ? pRow(p, { hl: true, pmExtra: '<div style="position: relative; flex: 1 1 0; max-width: 170px; min-width: 0;">' + job(A5, { lift: true }) + '<svg viewBox="0 0 24 24" style="position: absolute; left: 84px; top: 6px; width: 22px; height: 22px;"><path d="M5 3l14 8-6 1.5L10 19z" fill="#1c1917" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg></div>', load: [7.5, 8], note: note }) : pRow(p)).join('');

// ===================== Roles screens + Time away (Users page) =====================
I.person = 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 10c.7-4 3.6-6 7.5-6s6.8 2 7.5 6';
I.away = 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M9 14l6 4M15 14l-6 4';
const A = { amberF: K.amberF, amberI: K.amberI, amberB: K.amberB };
const paneT = (tabs, page) => '<div style="' + st({ position: 'absolute', left: '481px', top: '9px', width: '950px', height: '882px', borderRadius: '13px', overflow: 'hidden', background: K.page, fontFamily: 'Inter, sans-serif', color: K.ink }) + '">' +
  '<div style="height: 51px; background: #fff; display: flex; align-items: center; gap: 2px; padding: 0 10px; box-sizing: border-box; border-bottom: 1px solid #ecebe8;">' + tabs + '</div>' + page + '</div>';
const tabsPeople = tab(I.home, 'Home', false, 6) + tab(I.map, 'Farm view', false) + tab(I.person, 'People', true);
const tabsWork = tab(I.home, 'Home', false, 6) + tab(I.map, 'Farm view', false) + tab(I.team, 'Work schedule', true);
const look2 = (icon, name) => '<div style="position: absolute; left: 114px; top: 719px; width: 200px; height: 33px; background: #fff;"></div><div style="' + st({ position: 'absolute', left: '119px', top: '723px', height: '25px', padding: '0 8px', borderRadius: '7px', background: '#f1f1ee', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#6b716a', fontFamily: 'Inter, sans-serif' }) + '">' + svg(icon, 13, 1.7) + 'Looking at <b style="color: ' + K.ink + '; font-weight: 600;">' + name + '</b></div>';
const chat2 = (msgs, icon, name) => '<div style="' + st({ position: 'absolute', left: '73px', top: '69px', width: '398px', height: '637px', background: '#fff', fontFamily: 'Inter, sans-serif', color: K.ink, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 20px 14px', boxSizing: 'border-box', gap: '18px', overflow: 'hidden' }) + '">' + msgs + '</div>' + look2(icon, name);
const greenBtn = (t) => '<span style="height: 40px; padding: 0 18px; border-radius: 10px; display: inline-flex; align-items: center; font-size: 14px; font-weight: 600; background: ' + K.green + '; color: #fff;">' + t + '</span>';
const segTabs = (on) => '<span style="display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: #ecebe8;">' + ['People', 'Agents', 'Roles'].map((t) => '<span style="height: 28px; padding: 0 12px; border-radius: 8px; display: inline-flex; align-items: center; font-size: 13px; font-weight: ' + (t === on ? 600 : 400) + '; background: ' + (t === on ? '#fff' : 'transparent') + '; box-shadow: ' + (t === on ? '0 1px 2px #1c19171a' : 'none') + '; color: ' + (t === on ? K.ink : K.muted) + ';">' + t + '</span>').join('') + '</span>';
const headP = (on, right) => '<div style="display: flex; align-items: center; gap: 14px; padding: 14px 18px 12px 16px;">' + segTabs(on) + '<span style="flex: 1;"></span>' + (right || '') + '</div>';
const cardHead = (t, s) => '<div style="padding: 14px 18px 10px; border-bottom: 1px solid ' + K.line + ';"><div style="font-size: 14px; font-weight: 600;">' + t + '</div>' + (s ? '<div style="font-size: 12.5px; color: ' + K.muted + '; margin-top: 2px;">' + s + '</div>' : '') + '</div>';
const card2 = (h, o) => { o = o || {}; return '<div style="' + (o.m === undefined ? 'margin: 0 14px 12px;' : 'margin: ' + o.m + ';') + ' background: #fff; border-radius: 14px; box-shadow: 0 1px 3px #1c19170f; overflow: hidden;">' + h + '</div>'; };

// ---------- R1 · Roles list ----------
const roleRow = (name, sum, who, o) => { o = o || {}; return '<div style="display: grid; grid-template-columns: 170px 1fr 230px 20px; gap: 14px; align-items: center; min-height: 56px; padding: 0 14px 0 18px; border-top: ' + (o.first ? '0' : '1px solid ' + K.line2) + ';">' +
  '<span style="font-size: 14px; font-weight: 600;">' + name + '</span><span style="font-size: 13px; line-height: 19px; color: ' + K.muted + ';">' + sum + '</span><span style="font-size: 13px; color: ' + (o.none ? K.faint : K.ink) + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + who + '</span><span style="display: inline-flex; color: ' + K.faint + ';">' + CHEV(1) + '</span></div>'; };
const rolesList = headP('Roles', btn('New role', true)) +
  card2(cardHead('Sentri&rsquo;s base roles', 'Kept up to date by Sentri as it learns new kinds of data. To change one, start a farm role from it.') +
    roleRow('Owner', 'Everything, the bill and the agents', 'Adam', { first: true }) +
    roleRow('Manager', 'Whole farm. Plans their team&rsquo;s day. Money as totals', 'Zhao Min, Wang Fang') +
    roleRow('Worker', 'Their rooms. Their own day, work and hours', 'Liu Yang, Sun Qing, Ma Lin, Gao Feng') +
    roleRow('Temp', 'Like Worker; ends on a date', 'No one now', { none: true }) +
    roleRow('Vet or advisor', 'Health, farm-wide. Prescribes. No money', 'Dr Chen')) +
  card2(cardHead('This farm&rsquo;s roles', 'A base role with changes. When Sentri updates the base, the role follows it except where it was changed.') +
    roleRow('Farrowing lead', 'From Manager, 2 changes: no prices or costs; can stop a treatment', 'Li Wei', { first: true }) +
    roleRow('Night check', 'From Worker, 1 change: all rooms', 'No one yet', { none: true }));
const r1Chat = me('Who can see feed prices?') + gm('10:12', 'Only you see them in full. Zhao Min and Wang Fang see feed as totals, as Managers. Li Wei doesn&rsquo;t: Farrowing lead takes prices and costs away. Nobody else sees them.');
const R1 = paneT(tabsPeople, rolesList) + chat2(r1Chat, I.person, 'People &rsaquo; Roles');

// ---------- R2 · a farm role, drafted from the chat ----------
const LVL = ['In lists', 'Totals only', 'Their own', 'Never'];
const seg = (sel, changed, opts) => '<span style="display: inline-flex; gap: 2px; padding: 2px; border-radius: 9px; background: #f1f1ee;">' + (opts || LVL).map((t, i) => { const on = i === sel;
  return '<span style="height: 28px; padding: 0 9px; border-radius: 7px; display: inline-flex; align-items: center; font-size: 12.5px; white-space: nowrap; font-weight: ' + (on ? 600 : 400) + '; color: ' + (on ? (changed ? A.amberI : K.ink) : K.muted) + '; background: ' + (on ? (changed ? A.amberF : '#fff') : 'transparent') + '; box-shadow: ' + (on ? (changed ? 'inset 0 0 0 1px ' + A.amberB : '0 1px 2px #1c19171a') : 'none') + ';">' + t + '</span>'; }).join('') + '</span>';
const was = (t) => '<div style="font-size: 12px; color: ' + A.amberI + '; margin-top: 3px;">' + t + ' &middot; <u style="text-underline-offset: 2px;">Reset</u></div>';
const seeRow = (t, sel, ch) => '<div style="display: flex; align-items: center; gap: 10px; min-height: ' + (ch ? 56 : 42) + 'px; padding: 0 14px 0 18px; border-top: 1px solid ' + K.line2 + ';"><div style="flex: 1; min-width: 0;"><div style="font-size: 13px;">' + t + '</div>' + (ch ? was(ch) : '') + '</div>' + seg(sel, !!ch) + '</div>';
const tog = (on, ch) => '<span style="width: 36px; height: 22px; flex: none; border-radius: 99px; background: ' + (on ? (ch ? '#c98a1a' : K.green) : '#d6d3d1') + '; position: relative;"><span style="position: absolute; top: 3px; ' + (on ? 'right' : 'left') + ': 3px; width: 16px; height: 16px; border-radius: 99px; background: #fff;"></span></span>';
const doRow = (t, on, o) => { o = o || {}; return '<div style="display: flex; align-items: center; gap: 10px; min-height: ' + (o.ch || o.sub ? 56 : 44) + 'px; padding: 0 16px 0 18px; border-top: 1px solid ' + K.line2 + ';"><div style="flex: 1; min-width: 0;"><div style="font-size: 13px; color: ' + (o.fixed ? K.faint : K.ink) + ';">' + t + '</div>' + (o.ch ? was(o.ch) : o.sub ? '<div style="font-size: 12px; color: ' + K.faint + '; margin-top: 3px;">' + o.sub + '</div>' : '') + '</div>' + (o.fixed ? '' : tog(on, !!o.ch)) + '</div>'; };
const roleHead = '<div style="padding: 14px 20px 12px;"><div style="display: inline-flex; align-items: center; gap: 2px; height: 32px; padding: 0 11px 0 5px; border-radius: 9px; border: 1px solid #d6d3d1; background: #fff; font-size: 13px;">' + CHEV(-1) + 'Roles</div>' +
  '<div style="display: flex; align-items: center; gap: 10px; margin-top: 12px;"><h2 style="margin: 0; font-size: 19px; font-weight: 600; letter-spacing: -.01em;">Farrowing lead</h2>' + '<span style="height: 22px; padding: 0 8px; border-radius: 6px; background: #f1f1ee; font-size: 12px; font-weight: 600; color: ' + K.muted + '; display: inline-flex; align-items: center;">Draft</span></div>' +
  '<div style="font-size: 13px; color: ' + K.muted + '; margin-top: 3px;">From Manager &middot; 2 changes &middot; for Li Wei</div></div>';
const seeCard = card2(cardHead('What they may see') +
  seeRow('Pigs and their records', 0) + seeRow('Treatments and withdrawal', 0) + seeRow('Plans and the Work schedule', 0) + seeRow('Who did what', 0) + seeRow('Phone numbers', 0) + seeRow('Hours and days worked', 0) +
  seeRow('Prices, costs, sales', 3, 'Manager: Totals only') + seeRow('Farm results', 0) + seeRow('The bill and agent budgets', 3), { m: '0' });
const whereCard = card2(cardHead('Where') + '<div style="display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 16px 0 18px;"><span style="flex: 1; font-size: 13px;">Rooms</span>' + seg(0, false, ['Whole farm', 'Their rooms']) + '</div>', { m: '0 0 12px' });
const doCard = card2(cardHead('What they may do') + doRow('Record on the floor', true) + doRow('Plan their team&rsquo;s moves and day', true) + doRow('Stop a treatment', true, { ch: 'Manager: off' }) +
  doRow('Add workers and temps to their team', true) + doRow('Prescribe', false, { fixed: true, sub: 'Vet roles only' }) + doRow('Hire agents, see the bill', false, { fixed: true, sub: 'Owner only' }), { m: '0' });
const r2Foot = '<div style="position: absolute; left: 0; right: 0; bottom: 0; height: 64px; background: #fff; border-top: 1px solid #ecebe8; display: flex; align-items: center; gap: 12px; padding: 0 18px 0 20px;"><span style="flex: 1; font-size: 13px; color: ' + K.muted + ';">Seat as Manager: console. Saving gives it to Li Wei at once.</span>' + btn('Discard') + greenBtn('Save') + '</div>';
const rolePage = roleHead + '<div style="display: grid; grid-template-columns: 1fr 330px; gap: 12px; padding: 0 14px; align-items: start;">' + seeCard + '<div>' + whereCard + doCard + '</div></div>' + r2Foot;
const r2Chat = me('Li Wei should be able to stop a treatment, but not see prices.') +
  gm('10:14', 'Li Wei is a Manager, and the base roles don&rsquo;t change, so I drafted a farm role from Manager with those two changes: Farrowing lead. Only Li Wei would have it.') +
  gm('10:14', 'Ready when you are. Approve here, or press Save on the page.', '<div style="display: flex; gap: 8px; margin-top: 10px;">' + btn('Approve and save', true) + btn('Change something') + '</div>');
const R2 = paneT(tabsPeople, rolePage) + chat2(r2Chat, I.person, 'Farrowing lead');

// ---------- R3 · giving a person a role, from their profile ----------
const PPL = [
  ['LW', '#FDE7C2', '#6B4300', 'Li Wei', 'Farrowing lead', 'Farrowing 1&ndash;4', 'On farm since 06:12'],
  ['LY', '#E4ECF7', '#2B4A73', 'Liu Yang', 'Worker', 'Farrowing 1 and 2', 'On farm since 06:05'],
  ['SQ', '#EDE7F6', '#4B3577', 'Sun Qing', 'Worker', 'Farrowing 3 and 4', 'On farm since 06:18'],
  ['WF', '#E2F0DA', '#203D2B', 'Wang Fang', 'Manager', 'Nursery 1 and 2', 'On farm since 06:20'],
  ['ZM', '#F3E8F7', '#5B2D6E', 'Zhao Min', 'Manager', 'Gestation 1&ndash;3', 'On farm since 06:02'],
  ['ML', '#E6F1EE', '#1F5A50', 'Ma Lin', 'Worker', 'Gestation 1&ndash;3', 'On farm since 06:31'],
  ['GF', '#FBE5E3', '#A23B33', 'Gao Feng', 'Worker', 'All rooms', 'On farm since 06:40'],
  ['DC', '#EEF0EA', '#3B4540', 'Dr Chen', 'Vet or advisor', 'Whole farm', 'Visits Tuesdays']
];
const awayPill = (t) => '<span style="display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 8px; border-radius: 6px; background: #EEF0F6; color: #3E4A6B; font-size: 12.5px; font-weight: 600; white-space: nowrap;">' + svg(I.away, 13, 1.8) + t + '</span>';
const pplRow = (p, o) => { o = o || {}; return '<div style="display: grid; grid-template-columns: 200px 150px 1fr 200px; gap: 12px; align-items: center; min-height: 54px; padding: 0 18px; border-top: ' + (o.first ? '0' : '1px solid ' + K.line2) + '; background: ' + (o.hl ? '#FBFAF7' : 'transparent') + ';">' +
  '<span style="display: flex; align-items: center; gap: 10px; min-width: 0;"><span style="width: 30px; height: 30px; flex: none; border-radius: 99px; background: ' + p[1] + '; color: ' + p[2] + '; display: grid; place-items: center; font-size: 11.5px; font-weight: 600;">' + p[0] + '</span><span style="font-size: 13.5px; font-weight: 600; white-space: nowrap;">' + p[3] + '</span></span>' +
  '<span style="font-size: 13px;">' + p[4] + '</span><span style="font-size: 13px; color: ' + K.muted + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + p[5] + '</span><span style="font-size: 13px; color: ' + K.muted + ';">' + (o.today || p[6]) + '</span></div>'; };
const pplHeadRow = '<div style="display: grid; grid-template-columns: 200px 150px 1fr 200px; gap: 12px; height: 36px; align-items: center; padding: 0 18px; border-bottom: 1px solid ' + K.line + '; font-size: 12px; font-weight: 600; color: ' + K.muted + ';"><span>Name</span><span>Role</span><span>Works in</span><span>Today</span></div>';
const pplPage = (over) => headP('People', btn('Add a person', true)) + card2(pplHeadRow + PPL.map((p, i) => pplRow(p, Object.assign({ first: i === 0 }, (over || {})[i] || {}))).join(''));
const drawerR = (inner) => '<div style="' + st({ position: 'absolute', right: '0', top: '51px', width: '440px', bottom: '0', background: K.page, boxShadow: '-12px 0 32px rgba(28,25,23,.12), -1px 0 0 #ecebe8', fontFamily: 'Inter, sans-serif', color: K.ink, boxSizing: 'border-box', overflow: 'hidden' }) + '">' + inner + '</div>';
const dTop = (p, sub) => '<div style="display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 14px;"><span style="width: 44px; height: 44px; flex: none; border-radius: 99px; background: ' + p[1] + '; color: ' + p[2] + '; display: grid; place-items: center; font-size: 15px; font-weight: 600;">' + p[0] + '</span><div style="flex: 1;"><div style="font-size: 19px; font-weight: 600; letter-spacing: -.01em;">' + p[3] + '</div><div style="font-size: 13px; color: ' + K.muted + '; margin-top: 2px;">' + sub + '</div></div><span style="color: ' + K.faint + '; display: inline-flex;">' + svg(I.x, 18, 2) + '</span></div>';
const radio = (on) => '<span style="width: 18px; height: 18px; flex: none; border-radius: 99px; box-shadow: inset 0 0 0 ' + (on ? '5px ' + K.green : '1.5px #a8a29e') + '; background: #fff;"></span>';
const pick = (t, s, on, o) => { o = o || {}; return '<div style="display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 6px 16px; border-top: ' + (o.first ? '0' : '1px solid ' + K.line2) + '; background: ' + (on ? '#F4F8F5' : 'transparent') + ';">' + radio(on) + '<div style="flex: 1; min-width: 0;"><div style="font-size: 13.5px; font-weight: ' + (on ? 600 : 500) + ';">' + t + (o.cur ? '<span style="font-weight: 400; color: ' + K.muted + ';"> &middot; now</span>' : '') + '</div><div style="font-size: 12.5px; color: ' + K.muted + '; margin-top: 2px;">' + s + '</div></div></div>'; };
const sqDrawer = drawerR(dTop(PPL[2], 'Farrowing technician &middot; started Mon 26 Oct') +
  '<div style="padding: 0 20px 8px; font-size: 13px; font-weight: 600; color: ' + K.muted + ';">Role</div>' +
  card2(pick('Worker', 'Her rooms; her own day, work and hours &middot; billed by active day', false, { first: true, cur: true }) + pick('Night check', 'From Worker: all rooms &middot; billed by active day', true) + pick('Temp', 'Like Worker; ends on a date', false) +
    pick('Farrowing lead', 'From Manager &middot; console seat, about $X a month', false) + pick('Manager', 'Whole farm; plans her team&rsquo;s day &middot; console seat', false), { m: '0 16px 12px' }) +
  card2('<div style="padding: 13px 16px; font-size: 13px; line-height: 19px;"><div style="font-weight: 600;">What changes for her</div><div style="color: ' + K.muted + '; margin-top: 3px;">She sees all rooms instead of Farrowing 3 and 4. Everything else stays. Same seat.</div></div>', { m: '0 16px 12px' }) +
  '<div style="position: absolute; left: 0; right: 0; bottom: 0; height: 64px; background: #fff; border-top: 1px solid #ecebe8; display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 0 16px;">' + btn('Cancel') + greenBtn('Give her Night check') + '</div>');
const r3Chat = me('What can Sun Qing see?') + gm('10:20', 'As a Worker: Farrowing 3 and 4, the pigs and treatments there, her own day, work and hours, and her team&rsquo;s phone numbers. No prices, costs or farm results.');
const R3 = paneT(tabsPeople, pplPage({ 2: { hl: true } }) + sqDrawer) + chat2(r3Chat, I.person, 'People');

// ---------- phone (Plus Jakarta Sans, the phone design system) ----------
const PH = { bg: '#f6f7f1', line: '#dfe4d8', ink: '#20291f', muted: '#657060', green: '#276640', soft: '#eef1e7' };
const JK = "'Plus Jakarta Sans', Arial, sans-serif";
const phone2 = (inner, time) => '<div style="width: 414px; height: 868px; border-radius: 62px; background: #111; padding: 12px; box-sizing: border-box; box-shadow: 0 20px 50px rgba(17,21,17,.25); flex: none;"><div style="position: relative; width: 390px; height: 844px; border-radius: 50px; overflow: hidden; background: ' + PH.bg + '; font-family: ' + JK + '; color: ' + PH.ink + ';">' +
  '<div style="height: 54px; display: flex; align-items: center; justify-content: space-between; padding: 0 30px 0 36px; font-size: 16px; font-weight: 600;"><span>' + (time || '06:40') + '</span><span style="width: 120px; height: 34px; border-radius: 20px; background: #111; position: absolute; left: 135px; top: 10px;"></span><span style="font-size: 13px;">&#9679;&#9679;&#9679; 5G</span></div>' + inner + '</div></div>';
const phBack = (t) => '<div style="display: inline-flex; align-items: center; gap: 2px; height: 44px; padding: 0 14px 0 8px; border-radius: 12px; border: 1px solid #b6c0ad; background: #fff; font-size: 15px; font-weight: 600;">' + CHEV(-1) + t + '</div>';
const phTitle = (t, s) => '<div style="padding: 4px 20px 14px;">' + phBack('Home') + '<h1 style="margin: 16px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -.02em;">' + t + '</h1>' + (s ? '<div style="font-size: 14px; color: ' + PH.muted + '; margin-top: 4px;">' + s + '</div>' : '') + '</div>';
const phCard = (h, m) => '<div style="margin: ' + (m || '0 16px 12px') + '; background: #fff; border: 1px solid ' + PH.line + '; border-radius: 16px; overflow: hidden;">' + h + '</div>';
const phLab = (t) => '<div style="padding: 8px 22px 8px; font-size: 13px; font-weight: 600; color: ' + PH.muted + ';">' + t + '</div>';
const phItem = (n, t, s, o) => { o = o || {}; return '<div style="display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 0 16px; border-top: ' + (o.first ? '0' : '1px solid #e8eddf') + ';"><span style="width: 26px; height: 26px; border-radius: 99px; flex: none; display: grid; place-items: center; font-size: 13px; font-weight: 600; background: ' + PH.soft + '; color: ' + PH.muted + ';">' + n + '</span><span style="flex: 1; min-width: 0;"><span style="display: block; font-size: 15px; font-weight: 600;">' + t + '</span><span style="display: block; font-size: 13px; color: ' + PH.muted + '; margin-top: 2px;">' + s + '</span></span></div>'; };
const phBtn = (t, o) => { o = o || {}; return '<div style="height: 56px; border-radius: 14px; display: grid; place-items: center; font-size: 16px; font-weight: 700; ' + (o.out ? 'background: #fff; border: 1px solid #b6c0ad; color: ' + PH.ink + ';' : 'background: ' + PH.green + '; color: #fff;') + (o.m ? ' margin: ' + o.m + ';' : '') + '">' + t + '</div>'; };
const phFoot = (h) => '<div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 16px 30px; background: #fff; border-top: 1px solid ' + PH.line + ';">' + h + '</div>';
const tick = (c) => svg('m5 12.5 4.5 4.5L19 7.5', 16, 2.4, c || PH.green);
const dash = svg('M6 12h12', 16, 2.2, '#a3aa9f');
const line = (ic, t) => '<div style="display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; font-size: 14.5px; line-height: 20px;"><span style="padding-top: 2px; display: inline-flex;">' + ic + '</span><span>' + t + '</span></div>';

// R4 · phone: What I can access (the profile in sentences)
const R4 = phone2('<div style="padding: 4px 20px 14px;">' + phBack('Me') + '<h1 style="margin: 16px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -.02em;">What I can access</h1><div style="font-size: 14px; color: ' + PH.muted + '; margin-top: 4px;">Worker &middot; set by Adam</div></div>' +
  phCard('<div style="padding: 14px 16px;"><div style="font-size: 13px; font-weight: 600; color: ' + PH.muted + ';">Rooms</div><div style="font-size: 16px; font-weight: 700; margin-top: 4px;">Farrowing 3 and 4</div></div>') +
  phCard('<div style="padding: 12px 16px 8px;"><div style="font-size: 13px; font-weight: 600; color: ' + PH.muted + '; margin-bottom: 2px;">You see</div>' + line(tick(), 'Pigs and treatments in your rooms') + line(tick(), 'Your own day, work and hours') + line(tick(), 'Your team&rsquo;s phone numbers') + '</div>') +
  phCard('<div style="padding: 12px 16px 8px;"><div style="font-size: 13px; font-weight: 600; color: ' + PH.muted + '; margin-bottom: 2px;">Not on your role</div>' + line(dash, 'Other people&rsquo;s work and hours') + line(dash, 'Prices, costs and farm results') + '</div>') +
  phFoot(phBtn('Ask for more', { out: true })), '10:22');

// ---------- Time away ----------
// T1 · My day with "Working today" and Time away
const phNow = phCard('<div style="padding: 16px;"><div style="font-size: 13px; font-weight: 600; color: #466888;">Now</div><div style="font-size: 19px; font-weight: 700; margin-top: 4px;">Feeding</div><div style="font-size: 14px; color: ' + PH.muted + '; margin-top: 3px;">Farrowing 3 and 4</div>' + phBtn('Open', { m: '16px 0 0' }) + '</div>');
const workRow = (ring) => phCard('<div style="display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 0 8px 0 16px;"><span style="width: 10px; height: 10px; border-radius: 99px; background: #5fae6e; flex: none;"></span><span style="flex: 1; font-size: 15px; font-weight: 600;">Working today</span><span style="height: 44px; padding: 0 10px; display: inline-flex; align-items: center; gap: 2px; font-size: 15px; font-weight: 600; color: ' + PH.green + ';">Time away' + CHEV(1) + '</span></div>', '0 16px 12px; ' + (ring ? 'box-shadow: 0 0 0 3px ' + PH.ink + ';' : ''));
const T1 = phone2(phTitle('My day', 'Thu 5 Nov &middot; suggested by Sentri') + workRow(true) + phNow + phLab('Later') +
  phCard(phItem(2, 'Pen-strep, morning', 'Farrowing 2', { first: true }) + phItem(3, 'Second feed', 'Farrowing 3 and 4') + phItem(4, 'Pen-strep, evening', 'Farrowing 2')));
// T2 · Time away sheet: a drawer on the tint, white cards
const day = (d, n, st8) => { const on = st8 === 'on', off = st8 === 'off'; return '<div style="flex: 1; height: 62px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: ' + (on ? PH.green : off ? 'transparent' : '#fff') + '; border: 1px solid ' + (on ? PH.green : off ? 'transparent' : PH.line) + '; color: ' + (on ? '#fff' : off ? '#a3aa9f' : PH.ink) + ';"><span style="font-size: 12px; font-weight: 600;">' + d + '</span><span style="font-size: 16px; font-weight: 700;">' + n + '</span></div>'; };
const radioP = (on) => '<span style="width: 22px; height: 22px; flex: none; border-radius: 99px; box-shadow: inset 0 0 0 ' + (on ? '7px ' + PH.green : '2px #a3aa9f') + '; background: #fff;"></span>';
const choice = (t, on, first) => '<div style="display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 16px; border-top: ' + (first ? '0' : '1px solid #e8eddf') + ';">' + radioP(on) + '<span style="font-size: 15px; font-weight: ' + (on ? 700 : 500) + ';">' + t + '</span></div>';
const chipP = (t, on) => '<span style="height: 44px; padding: 0 16px; border-radius: 12px; display: inline-flex; align-items: center; font-size: 15px; font-weight: 600; background: ' + (on ? PH.ink : '#fff') + '; color: ' + (on ? '#fff' : PH.ink) + '; border: 1px solid ' + (on ? PH.ink : '#b6c0ad') + ';">' + t + '</span>';
const sheet = '<div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: rgba(20,24,19,.38);"></div><div style="position: absolute; left: 0; right: 0; top: 96px; bottom: 0; background: ' + PH.bg + '; border-radius: 24px 24px 0 0;">' +
  '<div style="display: flex; align-items: center; padding: 16px 12px 12px 20px;"><span style="flex: 1; font-size: 20px; font-weight: 700;">Time away</span><span style="width: 44px; height: 44px; display: grid; place-items: center;">' + svg(I.x, 22, 2.2, PH.ink) + '</span></div>' +
  phCard(choice('Not in today', false, true) + choice('Tomorrow, Fri 6 Nov', false) + choice('Pick days', true) +
    '<div style="display: flex; gap: 5px; padding: 4px 12px 14px;">' + day('Thu', 5) + day('Fri', 6, 'on') + day('Sat', 7, 'on') + day('Sun', 8, 'off') + day('Mon', 9) + day('Tue', 10) + '</div>') +
  phCard('<div style="padding: 14px 16px;"><div style="font-size: 13px; font-weight: 600; color: ' + PH.muted + ';">Why, if you want to say</div><div style="display: flex; gap: 8px; margin-top: 10px;">' + chipP('Holiday', true) + chipP('Sick') + chipP('Other') + '</div><div style="font-size: 13px; color: ' + PH.muted + '; margin-top: 10px;">Only Li Wei sees why.</div></div>') +
  phCard('<div style="padding: 14px 16px; font-size: 14px; line-height: 20px;">Your jobs on those days go to the team. The to-do list stays as it is: whoever is on does it.</div>') +
  phFoot(phBtn('Away Fri 6 and Sat 7')) + '</div>';
const T2 = phone2(phTitle('My day', 'Thu 5 Nov &middot; suggested by Sentri') + workRow(false) + phNow + sheet);
// T3 · while away
const T3 = phone2(phTitle('My day', 'Fri 6 Nov') +
  phCard('<div style="padding: 18px 16px 16px;"><div style="display: flex; align-items: center; gap: 10px;"><span style="width: 36px; height: 36px; border-radius: 10px; background: #EEF0F6; color: #3E4A6B; display: grid; place-items: center;">' + svg(I.away, 20, 1.8) + '</span><div><div style="font-size: 19px; font-weight: 700;">You&rsquo;re away</div><div style="font-size: 14px; color: ' + PH.muted + '; margin-top: 2px;">Holiday &middot; back Mon 9 Nov</div></div></div>' +
    phBtn('I&rsquo;m back', { m: '18px 0 0' }) + '<div style="height: 44px; display: grid; place-items: center; margin-top: 6px; font-size: 15px; font-weight: 600; color: ' + PH.green + ';">Change days</div></div>') +
  phCard('<div style="padding: 14px 16px; font-size: 14px; line-height: 20px; color: ' + PH.muted + ';">Came in after all? The to-do list is open as usual; recording anything marks you back for today.</div>'), '07:05');

// T4 · console Work schedule on Fri 6 Nov: Sun Qing away, her jobs moved
const awayRow = (p, back) => '<div style="' + WG + ' height: 70px; border-bottom: 1px solid ' + K.line2 + '; background: #FAFAF9;"><div style="display: flex; align-items: center; gap: 9px; padding-left: 16px; min-width: 0;"><span style="width: 30px; height: 30px; flex: none; border-radius: 99px; background: ' + p.bg + '; color: ' + p.fg + '; display: grid; place-items: center; font-size: 11.5px; font-weight: 600; opacity: .55;">' + p.ini + '</span><span style="font-size: 13.5px; font-weight: 600; white-space: nowrap; color: ' + K.muted + ';">' + p.name + '</span></div>' +
  '<div style="grid-column: span 2; display: flex; align-items: center; padding: 0 12px; border-left: 1px solid ' + K.line2 + ';">' + awayPill('Away &middot; back ' + back) + '</div><div></div></div>';
const ws4 = P.map((p, i) => i === 2 ? awayRow(p, 'Mon 9 Nov') :
  i === 1 ? pRow(Object.assign({}, p, { am: [['x', 'Feeding', 'Farrowing 1&ndash;4'], p.am[1]], pm: [['x', 'Second feed', 'Farrowing 1&ndash;4'], p.pm[1]] }), { am: { 0: { moved: true } }, pm: { 0: { moved: true } }, load: [8.5, 8] }) :
  i === 6 ? pRow(p, { amLead: job(['x', 'Pen-strep, morning', 'Farrowing 2'], { moved: true }), pmLead: job(['x', 'Pen-strep, evening', 'Farrowing 2'], { moved: true }), load: [6.5, 8] }) : pRow(p)).join('');
const wsPageFri = wsPage(ws4).replace('Thu 5 Nov', 'Fri 6 Nov');
const t4Chat = gm('05:30', 'Sun Qing is away today and tomorrow, so her feeds in Farrowing 3 and 4 joined Liu Yang&rsquo;s next door, now Farrowing 1&ndash;4, and her two Pen-strep doses to Gao Feng. To-dos are on the list as usual.') + me('Is Liu Yang over his hours now?') + gm('07:12', 'About half an hour over. Getting Farrowing 3 ready to wash can move to Monday without holding anything up. Move it?', '<div style="display: flex; gap: 8px; margin-top: 10px;">' + btn('Move to Monday', true) + btn('Leave it') + '</div>');
const T4 = paneT(tabsWork, wsPageFri) + chat2(t4Chat, I.team, 'Work schedule');

// T5 · a manager marks someone away from the chat; People shows it
const t5Chat = me('Gao Feng called in sick. He&rsquo;s out today.') +
  gm('06:52', 'Marked him away today, back tomorrow. His water line in Gestation 2 went to Ma Lin and the heat lamps to Liu Yang. Nothing was waiting on him.', '<div style="display: flex; gap: 8px; margin-top: 10px;">' + btn('Undo') + '</div>');
const T5 = paneT(tabsPeople, pplPage({ 2: { today: awayPill('Away Fri 6 &ndash; Sat 7') }, 6: { hl: true, today: awayPill('Away &middot; back Fri 6') } })) + chat2(t5Chat, I.person, 'People');

// ---------- boards ----------
(async () => {
  const base = 'data:image/jpeg;base64,' + (await sharp(path.join(S, 'walk-t1-farm.png')).jpeg({ quality: 82 }).toBuffer()).toString('base64');
  const fig = (title, cap, over) => '<figure style="margin: 0;"><figcaption style="font-size: 17px; font-weight: 600; margin-bottom: 6px;">' + title + '</figcaption><div style="font-size: 14.5px; line-height: 22px; color: #3B4540; margin-bottom: 14px; min-height: 66px; max-width: 1400px;">' + cap + '</div>' +
    '<div style="position: relative; width: 1440px; height: 900px; border-radius: 14px; overflow: hidden; box-shadow: 0 0 0 1px #E2E5DE, 0 8px 28px rgba(17,21,17,.10); background: url(' + base + ') 0 0 / 1440px 900px no-repeat;">' + over + '</div></figure>';
  const pfig = (title, cap, ph) => '<figure style="margin: 0; width: 414px;"><figcaption style="font-size: 17px; font-weight: 600; margin-bottom: 6px;">' + title + '</figcaption><div style="font-size: 14.5px; line-height: 22px; color: #3B4540; margin-bottom: 14px; min-height: 88px;">' + cap + '</div>' + ph + '</figure>';
  const doc = (title, w, h, body) => '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>' + title + '</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Inter:wght@400..700&family=Plus+Jakarta+Sans:wght@400..800&display=swap" rel="stylesheet">\n<style>body{margin:0}</style>\n</helmet>\n' +
    '<div style="width: ' + w + 'px; padding: 44px 48px 60px; box-sizing: border-box; background: #F3F4F1; font-family: Geist, system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' + body + '</div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":' + w + ',"height":' + h + '}}\'>\nclass Component extends DCLogic {\n  renderVals() { return {}; }\n}\n</script>\n</body>\n</html>\n';
  const h1 = (t, p) => '<h1 style="margin: 0; font-size: 30px; line-height: 38px; font-weight: 600; letter-spacing: -.025em;">' + t + '</h1><p style="margin: 8px 0 34px; font-size: 16px; line-height: 24px; color: #5D665F; max-width: 2200px;">' + p + '</p>';
  const grid2 = (a, b) => '<div style="display: grid; grid-template-columns: 1440px 1440px; gap: 56px 32px;">' + a + b + '</div>';
  const rules = (title, items, w) => '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px 12px; ' + (w ? 'width: ' + w + 'px; box-sizing: border-box;' : '') + '"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">' + title + '</div><ul style="margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + items.map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ul></div>';

  // board 1 · Roles
  const F1 = fig('1 · People &rsaquo; Roles', 'Admins only. Sentri&rsquo;s base roles on top, kept up to date by Sentri; this farm&rsquo;s roles below, each a base with a few changes. Each row says what the role sees in one line and who has it. The agent answers questions about access from the same roles.', R1);
  const F2 = fig('2 · A farm role: start from a base, change a few things', 'Asked in the chat, drafted on the page. Every level the farm changed is marked with what the base says and Reset. Prescribing and the bill stay fixed to their base roles. Approve in the chat or Save on the page, as with any plan.', R2);
  const F3 = fig('3 · Give someone a role, from their profile', 'One role per person. The picker shows each role in a line with its seat, and what changes for this person before you save. A role from Manager brings a console seat; from Worker, billing by active day.', R3);
  const roleRules = rules('How roles work', [
    '<b>Base roles are Sentri&rsquo;s.</b> Owner, Manager, Worker, Temp, Vet or advisor. A farm can&rsquo;t edit them; Sentri updates them when it adds new kinds of data or actions.',
    '<b>A farm role is a base plus changes.</b> Each change shows the base&rsquo;s value and Reset. When Sentri updates the base, the farm role follows it except where the farm changed it.',
    '<b>One role per person; no one-off exceptions.</b> To give one person something different, make a role; a role can have one person. Every person&rsquo;s access is then readable from the Roles list.',
    '<b>The seat follows the base:</b> from Owner or Manager, a console seat; from Worker or Temp, billing by active day; from Vet or advisor, as decided (open question 1).',
    '<b>Who changes roles:</b> only an admin makes or edits a role or gives one above Worker. A manager can give Worker or Temp in their team.',
    '<b>A change applies at once</b> to everyone on the role; the page says who before Save. Deleting a farm role moves its people back to its base.',
    '<b>Testing roles comes later:</b> the questions that check a role depend on how Sentri&rsquo;s data is marked, which isn&rsquo;t done yet.'
  ]);
  const phoneCol = '<div style="display: flex; gap: 32px; align-items: flex-start;">' + pfig('4 · Phone: What I can access', 'The same role in sentences, from Me or on first sign-in. Read-only; Ask for more sends the admin a request to approve.', R4) + '<div style="flex: 1; padding-top: 108px;">' + roleRules + '</div></div>';
  fs.writeFileSync(path.join(S, 'pub/project/RolesScreens.dc.html'), doc('Roles', 3008, 2140, h1('Roles: base roles from Sentri, farm roles with overrides (screens)', 'An admin picks a base role for each person, or makes a farm role from one with a few changes. The levels and actions are the ones on the Users design board. Mock-ups for review; nothing built.') + grid2(F1, F2) + '<div style="height: 56px;"></div>' + grid2(F3, phoneCol)));

  // board 2 · Time away
  const P1 = pfig('1 · Phone: My day says you&rsquo;re working', 'One line on top of My day: Working today, and Time away. Nothing else changes on the page.', T1);
  const P2 = pfig('2 · Time away', 'Today, tomorrow, or pick days; the farm&rsquo;s day off is skipped. Why is optional and only their manager sees it. One sentence says what happens.', T2);
  const P3 = pfig('3 · While away', 'My day turns into one card: back on Mon 9 Nov, I&rsquo;m back to end it early. The to-do list stays open; a record counts as being back.', T3);
  const awayRules = rules('What away changes, and what it doesn&rsquo;t', [
    '<b>To-dos don&rsquo;t change.</b> They&rsquo;re the farm&rsquo;s list; whoever is on does them, as today.',
    '<b>Only what names the person moves:</b> their jobs in the Work schedule (Sentri re-plans them), and decisions or approvals waiting on them (to their manager until they&rsquo;re back).',
    '<b>The person sets it on the phone</b>; a manager or the admin can set it for them, in the chat or on their profile. No approval step; their manager sees it at once (open question 7).',
    '<b>Back by itself</b> on the date. I&rsquo;m back ends it early; any record on an away day counts as back for that day.',
    '<b>Why stays private:</b> only their manager and the admin see it. Everyone else, the agents included, sees just Away.',
    '<b>Seat:</b> nothing is billed for a worker&rsquo;s away days (no active days). A console seat keeps running. Someone gone for good is Left the farm, not Away.',
    '<b>Sentri plans around known days away:</b> no multi-day job starts on someone away later that week.'
  ], 1440);
  const phones = '<div style="display: flex; gap: 32px; align-items: flex-start;">' + P1 + P2 + P3 + '</div>';
  const T4f = fig('4 · Console: the Work schedule plans around her', 'Fri 6 Nov. Sun Qing&rsquo;s row says Away and when she&rsquo;s back; her jobs went to others and are marked Moved. Sentri says what it did in the morning report; change it by asking, as any day.', T4);
  const T5f = fig('5 · A manager marks someone away', 'Gao Feng called in sick. Said in the chat, done at once with Undo, like any change to the day. People shows who is away and who will be.', T5);
  fs.writeFileSync(path.join(S, 'pub/project/TimeAway.dc.html'), doc('Time away', 3008, 2200, h1('Time away: pause a person, back on a date (screens)', 'A person marks days away on the phone, or a manager does it for them. To-dos stay the farm&rsquo;s list; only what was given to that person moves, and they come back by themselves. Mock-ups for review; nothing built.') +
    '<div style="display: grid; grid-template-columns: 1440px 1440px; gap: 32px; align-items: start;">' + phones + '<div style="padding-top: 108px;">' + awayRules + '</div></div><div style="height: 56px;"></div>' + grid2(T4f, T5f)));
  console.log('ok');
})();
