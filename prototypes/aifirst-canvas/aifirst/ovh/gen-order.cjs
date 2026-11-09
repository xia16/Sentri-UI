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

// ===== Work schedule: morning/afternoon halves vs one ordered sequence with rough times =====
// durations (h) per job, in order; 'at' = a job tied to a clock time
const DUR = [[1.5, 2, 1.5, 2.5], [1, 3, 1, 2], [1.5, 1, 2, 1], [1.5, 3, 2], [2, 1.5, 3], [2, 2.5, 2.5], [3, 2]];
const AT = { '2-1': '07:00', '2-2': '13:30', '2-3': '15:00', '1-2': '13:30', '5-2': '13:30' };
const seqOf = (p) => p.am.concat(p.pm);
const hrs = (x) => { const h = Math.floor(x), half = x - h >= 0.5; return (h ? h : '') + (half ? '½' : '') + ' h'; };
const clock = svg('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2', 11, 2);
const jobB = (j, d, at, o) => { o = o || {}; const now = j[0] === 'n', done = j[0] === 'd', late = j[3] === 'late';
  return '<div style="' + st({ flex: o.w ? 'none' : '1 1 0', width: o.w ? o.w + 'px' : 'auto', minWidth: 0, maxWidth: o.w ? 'none' : '168px', height: '52px', boxSizing: 'border-box', padding: '0 8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px',
    background: now ? K.todayF : done ? '#FAFAF9' : '#fff', boxShadow: now ? 'inset 0 0 0 1.5px ' + K.todayI : 'inset 0 0 0 1px ' + (done ? '#efeeec' : K.card) }) + '">' +
    '<span style="display: flex; align-items: center; gap: 4px; min-width: 0;">' + (done ? CHECK(K.doneI, 12) : '') + '<span style="flex: 1; min-width: 0; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ' + (now ? K.todayI : done ? K.muted : K.ink) + ';">' + j[1] + '</span>' +
    (o.noDur ? '' : '<span style="flex: none; font-size: 11.5px; color: ' + (done ? K.faint : K.muted) + '; font-variant-numeric: tabular-nums;">' + (at ? '' : '~' + hrs(d)) + '</span>') + '</span>' +
    '<span style="display: flex; align-items: center; gap: 4px; min-width: 0; font-size: 12px; color: ' + (late ? K.lateI : done ? K.faint : K.muted) + ';">' + (at ? '<span style="flex: none; display: inline-flex; align-items: center; gap: 3px; height: 16px; padding: 0 4px; border-radius: 4px; background: #F1F1EE; color: ' + K.ink + '; font-weight: 600; font-size: 11px;">' + clock + at + '</span>' : '') + '<span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + j[2] + '</span></span></div>'; };
const nameCell = (p) => '<div style="display: flex; align-items: center; gap: 9px; padding-left: 16px; min-width: 0;"><span style="width: 30px; height: 30px; flex: none; border-radius: 99px; background: ' + p.bg + '; color: ' + p.fg + '; display: grid; place-items: center; font-size: 11.5px; font-weight: 600;">' + p.ini + '</span><span style="font-size: 13.5px; font-weight: 600; white-space: nowrap;">' + p.name + '</span></div>';
// B · one sequence, equal cards, rough time on each
const GB = 'display: grid; grid-template-columns: 150px minmax(0, 1fr) 76px;';
const headB = '<div style="' + GB + ' height: 36px; border-bottom: 1px solid ' + K.line + '; font-size: 12px; font-weight: 600; color: ' + K.muted + ';"><div style="display: flex; align-items: center; padding-left: 16px;">7 people</div><div style="display: flex; align-items: center; padding-left: 10px; border-left: 1px solid ' + K.line2 + ';">In order, first to last</div><div style="display: flex; align-items: center; padding-left: 10px;">Of 8 h</div></div>';
const rowB = (p, i) => '<div style="' + GB + ' height: 70px; border-bottom: 1px solid ' + K.line2 + ';">' + nameCell(p) + '<div style="display: flex; align-items: center; gap: 5px; padding: 0 7px; border-left: 1px solid ' + K.line2 + '; min-width: 0;">' +
  seqOf(p).map((j, k) => jobB(j, DUR[i][k], AT[i + '-' + k])).join('') + '</div>' + loadCell(p.load) + '</div>';
const pageB = wsPage(P.map(rowB).join('')).replace(wsHead, headB);
// C · one sequence, card width = rough time, the 8 h line drawn
const PX = 84, GC = 'display: grid; grid-template-columns: 150px minmax(0, 1fr) 76px;';
const ruler = '<div style="position: relative; height: 36px;">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((h) => '<span style="position: absolute; left: ' + (7 + h * PX) + 'px; bottom: 7px; font-size: 11px; white-space: nowrap; color: ' + (h === 8 ? K.ink : K.faint) + '; font-weight: ' + (h === 8 ? 600 : 400) + '; transform: translateX(' + (h ? '-50%' : '0') + ');">' + h + ' h</span>').join('') + '</div>';
const headC = '<div style="' + GC + ' height: 36px; border-bottom: 1px solid ' + K.line + '; font-size: 12px; font-weight: 600; color: ' + K.muted + ';"><div style="display: flex; align-items: center; padding-left: 16px;">7 people</div><div style="border-left: 1px solid ' + K.line2 + ';">' + ruler + '</div><div style="display: flex; align-items: center; padding-left: 10px;">Of 8 h</div></div>';
const rowC = (p, i) => '<div style="' + GC + ' height: 70px; border-bottom: 1px solid ' + K.line2 + ';">' + nameCell(p) + '<div style="position: relative; display: flex; align-items: center; gap: 4px; padding: 0 7px; border-left: 1px solid ' + K.line2 + '; min-width: 0;">' +
  seqOf(p).map((j, k) => jobB(j, DUR[i][k], AT[i + '-' + k], { w: DUR[i][k] * PX - 4, noDur: true })).join('') +
  '<span style="position: absolute; left: ' + (7 + 8 * PX - 2) + 'px; top: 0; bottom: 0; border-left: 1.5px dashed #a8a29e;"></span></div>' + loadCell(p.load) + '</div>';
const pageC = wsPage(P.map(rowC).join('')).replace(wsHead, headC);
const pageA = wsPage(ws1);

(async () => {
  const doc = (title, w, h, body) => '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>' + title + '</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Inter:wght@400..700&display=swap" rel="stylesheet">\n<style>body{margin:0}</style>\n</helmet>\n' +
    '<div style="width: ' + w + 'px; padding: 44px 48px 60px; box-sizing: border-box; background: #F3F4F1; font-family: Geist, system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' + body + '</div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":' + w + ',"height":' + h + '}}\'>\nclass Component extends DCLogic {\n  renderVals() { return {}; }\n}\n</script>\n</body>\n</html>\n';
  const frame = (title, cap, page) => '<figure style="margin: 0; width: 950px;"><figcaption style="font-size: 17px; font-weight: 600; margin-bottom: 6px;">' + title + '</figcaption><div style="font-size: 14.5px; line-height: 22px; color: #3B4540; margin-bottom: 14px; min-height: 110px;">' + cap + '</div>' +
    '<div style="position: relative; width: 950px; height: 640px; border-radius: 13px; overflow: hidden; box-shadow: 0 0 0 1px #E2E5DE, 0 8px 28px rgba(17,21,17,.10);"><div style="position: absolute; left: -481px; top: -9px;">' + pane('ws', page) + '</div></div></figure>';
  const A1 = frame('A · Morning and afternoon (today&rsquo;s board)', 'Two halves per person. Easy to scan &ldquo;what&rsquo;s left this afternoon&rdquo;, but it forces every job into a half: Gao Feng&rsquo;s day looks empty, a long job can&rsquo;t cross lunch, and the phone&rsquo;s My day doesn&rsquo;t have halves.', pageA);
  const B1 = frame('B · One order, a rough time on each (recommended)', 'Do this, then this. Each job says about how long (~2 h); a job tied to a clock time says the time instead (Pen-strep 15:00, second feed 13:30). Same order as the phone&rsquo;s My day. The total stays on the right.', pageB);
  const C1 = frame('C · One order, width is the rough time', 'The same order, drawn to scale against the 8 h line, so who finishes early or runs over shows at a glance. Short jobs get too narrow to read, and it looks more exact than a guess is.', pageC);
  const note = '<div style="margin-top: 48px; background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px 12px; max-width: 1900px;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">My call: B</div><ul style="margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + [
    'Farm work runs in an order more than in halves: feed, then the walk, then the litters. The order is what Sentri actually suggests, and what the phone already shows.',
    'Times are guesses from past records (how long Liu Yang&rsquo;s piglet processing usually takes), so they read as &ldquo;~2 h&rdquo;, never a clock slot. They add up to the total on the right.',
    'Only what really has a clock gets one: doses due at a time, the second feed. Everything else just follows.',
    'Moving a job is still drag or ask, now along one line; Sentri warns as before (clean to dirty, a dose that would miss its time).',
    'C stays an option for a manager&rsquo;s &ldquo;who&rsquo;s overloaded&rdquo; look, but the bar on the right already answers that.'].map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ul></div>';
  fs.writeFileSync(path.join(S, 'pub/project/WorkScheduleOrder.dc.html'), doc('Work schedule order', 3008, 1263,
    '<h1 style="margin: 0; font-size: 30px; line-height: 38px; font-weight: 600; letter-spacing: -.025em;">Work schedule: morning and afternoon, or one order with rough times?</h1><p style="margin: 8px 0 34px; font-size: 16px; line-height: 24px; color: #5D665F;">The same day (Thu 5 Nov, same people, same jobs) three ways.</p>' +
    '<div style="display: flex; gap: 31px; align-items: flex-start;">' + A1 + B1 + C1 + '</div>' + note));
  console.log('ok');
})();
