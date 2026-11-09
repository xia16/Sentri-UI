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
  { ini: 'LW', bg: '#FDE7C2', fg: '#6B4300', name: 'Li Wei', role: 'Farrowing manager', load: [7.5, 8], am: [['x', 'Walk-through', 'Farrowing 1–4', '', 1.5], ['x', 'Fostering checks', 'B32 · Farrowing 2', '', 2]], pm: [['x', 'A5 and B10', 'Wed · Farrowing 2', 'late', 1.5], ['x', 'Ready for farrowing', 'B33 · Farrowing 1', '', 2.5]] },
  { ini: 'LY', bg: '#E4ECF7', fg: '#2B4A73', name: 'Liu Yang', role: 'Farrowing technician', load: [7, 8], am: [['x', 'Feeding', 'Farrowing 1 and 2', '', 1], ['x', 'Piglet processing', 'B32 · Farrowing 2', '', 3]], pm: [['x', 'Second feed', 'Farrowing 1 and 2', '', 1, '13:30'], ['x', 'Get ready to wash', 'Farrowing 3', '', 2]] },
  { ini: 'SQ', bg: '#EDE7F6', fg: '#4B3577', name: 'Sun Qing', role: 'Farrowing technician', load: [5.5, 8], am: [['x', 'Feeding', 'Farrowing 3 and 4', '', 1.5], ['x', 'Pen-strep, morning', 'Farrowing 2', '', 1, '07:00']], pm: [['x', 'Second feed', 'Farrowing 3 and 4', '', 2, '13:30'], ['x', 'Pen-strep, evening', 'Farrowing 2', '', 1, '15:00']] },
  { ini: 'WF', bg: '#E2F0DA', fg: '#203D2B', name: 'Wang Fang', role: 'Nursery manager', load: [6.5, 8], am: [['x', 'Walk-through', 'Nursery 1 and 2', '', 1.5], ['x', 'PRRS vaccine', 'Nursery 1', '', 3]], pm: [['x', 'Weigh', 'B30 · Nursery 1', '', 2]] },
  { ini: 'ZM', bg: '#F3E8F7', fg: '#5B2D6E', name: 'Zhao Min', role: 'Gestation manager', load: [6.5, 8], am: [['x', 'Heat check', 'B35 · Gestation 1', '', 2], ['x', 'Amox treatment', 'Gestation 2', '', 1.5]], pm: [['x', 'Walk-through', 'Gestation 1–3', '', 3]] },
  { ini: 'ML', bg: '#E6F1EE', fg: '#1F5A50', name: 'Ma Lin', role: 'Gestation technician', load: [7, 8], am: [['x', 'Feeding', 'Gestation 1–3', '', 2], ['x', 'Body condition', 'B34 · Gestation 1', '', 2.5]], pm: [['x', 'Second feed', 'Gestation 1–3', '', 2.5, '13:30']] },
  { ini: 'GF', bg: '#FBE5E3', fg: '#A23B33', name: 'Gao Feng', role: 'Maintenance', load: [5, 8], am: [['x', 'Water line B', 'Gestation 2', '', 3]], pm: [['x', 'Heat lamps', 'Farrowing 2 +2', '', 2]] }
];
const roughH = (x) => { const h = Math.floor(x), half = x - h >= 0.5; return '~' + (h ? h : '') + (half ? '½' : '') + ' h'; };
const CLK = svg('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2', 11, 2);
const job = (j, o) => { o = o || {}; const late = j[3] === 'late', dur = j[4], at = j[5];
  return '<div style="' + st({ flex: '1 1 0', minWidth: 0, maxWidth: '168px', height: '78px', boxSizing: 'border-box', padding: '0 10px', borderRadius: '9px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px',
    background: '#fff', boxShadow: o.moved ? 'inset 0 0 0 2px ' + K.green : o.lift ? '0 10px 26px rgba(28,25,23,.22), 0 0 0 1px ' + K.card : 'inset 0 0 0 1px ' + K.card,
    transform: o.lift ? 'rotate(-1.5deg)' : 'none', opacity: o.dim ? 0.35 : 1, position: 'relative' }) + '">' +
    '<span style="font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + j[1] + '</span>' +
    '<span style="font-size: 12.5px; color: ' + (late ? K.lateI : K.muted) + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + j[2] + '</span>' +
    (at ? '<span style="align-self: flex-start; display: inline-flex; align-items: center; gap: 3px; height: 18px; padding: 0 5px; border-radius: 5px; background: #F1F1EE; color: ' + K.ink + '; font-weight: 600; font-size: 11.5px;">' + CLK + at + '</span>' : dur ? '<span style="font-size: 12px; color: ' + K.muted + '; font-variant-numeric: tabular-nums;">' + roughH(dur) + '</span>' : '') +
    (o.moved ? '<span style="position: absolute; top: -9px; right: 8px; height: 17px; padding: 0 6px; border-radius: 5px; background: ' + K.green + '; color: #fff; font-size: 10.5px; font-weight: 600; display: flex; align-items: center;">Moved</span>' : '') + '</div>'; };
const WG = 'display: grid; grid-template-columns: 180px minmax(0, 1fr) 76px;';
const hours = (x) => { const h = Math.floor(x), half = x - h >= 0.5; return h + (half ? '½' : '') + ' h'; };
const loadCell = (l) => '<div style="display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 0 14px 0 10px;"><b style="font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap;">' + hours(l[0]) + '</b><span style="height: 4px; border-radius: 2px; background: #EDECEA; overflow: hidden;"><span style="display: block; height: 100%; width: ' + Math.min(100, l[0] / l[1] * 100) + '%; background: #A8A29E;"></span></span></div>';
const HALF = '<div style="display: flex; align-items: center; gap: 5px; padding: 0 7px; border-left: 1px solid ' + K.line2 + '; min-width: 0;">';
const pRow = (p, o) => { o = o || {}; const list = (l, k) => l.map((j, i) => (o[k] || {})[i] === 'drop' ? '' : job(j, (o[k] || {})[i])).join('');
  return '<div style="' + WG + ' height: 96px; border-bottom: 1px solid ' + K.line2 + '; background: ' + (o.hl ? '#FBFAF7' : 'transparent') + ';"><div style="display: flex; align-items: center; gap: 10px; padding-left: 16px; min-width: 0;"><span style="width: 32px; height: 32px; flex: none; border-radius: 99px; background: ' + p.bg + '; color: ' + p.fg + '; display: grid; place-items: center; font-size: 12px; font-weight: 600;">' + p.ini + '</span><span style="min-width: 0;"><span style="display: block; font-size: 13.5px; font-weight: 600; white-space: nowrap;">' + p.name + '</span><span style="display: block; font-size: 12px; color: ' + K.muted + '; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (p.role || '') + '</span></span></div>' +
    HALF + (o.amLead || '') + list(p.am, 'am') + (o.pmLead || '') + list(p.pm, 'pm') + (o.pmExtra || '') + '</div>' + loadCell(o.load || p.load) + '</div>' + (o.note || ''); };
const wsHead = '<div style="' + WG + ' height: 36px; border-bottom: 1px solid ' + K.line + '; font-size: 12px; font-weight: 600; color: ' + K.muted + ';"><div style="display: flex; align-items: center; padding-left: 16px;">7 people</div><div style="display: flex; align-items: center; padding-left: 10px; border-left: 1px solid ' + K.line2 + ';">In order, first to last</div><div style="display: flex; align-items: center; padding-left: 10px;">Of 8 h</div></div>';
const wsPage = (rows) => pageHead('Work schedule', '<b style="font-size: 14px; font-weight: 600;">Thu 5 Nov</b><span style="flex: 1;"></span><span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: ' + K.muted + ';">' + svg(I.spark, 14, 1.8) + 'Suggested by Sentri at 05:30</span>') + whiteCard(wsHead + rows);
const A5 = ['x', 'A5 and B10', 'Wed · Farrowing 2', 'late', 1.5];
const ws1 = P.map((p) => pRow(p)).join('');
// asked in the chat: A5 and B10 leaves Li Wei's afternoon and leads Zhao Min's
const ws2rows = P.map((p, i) => i === 0 ? pRow(p, { pm: { 0: 'drop' }, load: [6, 8] }) : i === 4 ? pRow(p, { amLead: job(A5, { moved: true }), load: [8, 8] }) : pRow(p)).join('');
const wsChat = me('Li Wei has a full day. Give A5 and B10 to Zhao Min.') + gm('09:24', 'Done. A5 and B10 goes first in Zhao Min&rsquo;s day, before her work in Gestation, so she goes from piglets to sows and not back.');
const note = '<div style="display: flex; align-items: center; gap: 10px; padding: 9px 16px 9px 196px; background: ' + K.amberF + '; border-bottom: 1px solid ' + K.amberB + '; font-size: 13px; line-height: 19px; color: ' + K.amberI + ';"><span style="width: 18px; height: 18px; border-radius: 99px; background: #e8b33c; color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 700; flex: none;">!</span><span style="flex: 1;">Gestation into Farrowing 2 breaks clean to dirty. First in her day?</span><span style="font-weight: 600; white-space: nowrap; text-decoration: underline; text-underline-offset: 3px;">Put it first</span></div>';
// dragged by hand behind her walk-through
const ws3 = P.map((p, i) => i === 0 ? pRow(p, { pm: { 0: { dim: true } }, load: [6, 8] }) : i === 4 ? pRow(p, { hl: true, pmExtra: '<div style="position: relative; flex: 1 1 0; max-width: 170px; min-width: 0;">' + job(A5, { lift: true }) + '<svg viewBox="0 0 24 24" style="position: absolute; left: 84px; top: 6px; width: 22px; height: 22px;"><path d="M5 3l14 8-6 1.5L10 19z" fill="#1c1917" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg></div>', load: [8, 8], note: note }) : pRow(p)).join('');

// ===== console Work schedule as stops: a card is a place (and a return later), its tasks in order inside =====
const STOPS = [
  [['Farrowing 1–4', 'Walk-through', '~1½ h'], ['Farrowing 2', 'Fostering checks, then A5 and B10', '~3½ h'], ['Farrowing 1', 'Ready for farrowing', '~2½ h']],
  [['Farrowing 1 and 2', 'Feeding', '~1 h'], ['Farrowing 2', 'Piglet processing', '~3 h'], ['Farrowing 1 and 2', 'Second feed', null, '13:30'], ['Farrowing 3', 'Get ready to wash', '~2 h']],
  [['Farrowing 3 and 4', 'Feeding, then farrowing', '~2½ h'], ['Farrowing 2', 'Fostering checks, walk-through', null, '09:00'], ['Farrowing 3 and 4', 'Second feed', null, '13:30'], ['Farrowing 2', 'Pen-strep, evening', null, '15:00']],
  [['Nursery 1 and 2', 'Walk-through, PRRS vaccine, weigh B30', '~6½ h']],
  [['Gestation 1–3', 'Heat check, Amox, walk-through', '~6½ h']],
  [['Gestation 1–3', 'Feeding, then body condition', '~4½ h'], ['Gestation 1–3', 'Second feed', null, '13:30']],
  [['Gestation 2', 'Water line B', '~3 h'], ['Farrowing 2 +2', 'Heat lamps', '~2 h']]
];
const stopCard = (s) => '<div style="' + st({ flex: '1 1 0', minWidth: 0, maxWidth: '250px', height: '78px', boxSizing: 'border-box', padding: '0 11px', borderRadius: '9px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', background: '#fff', boxShadow: 'inset 0 0 0 1px ' + K.card }) + '">' +
  '<span style="font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + s[0] + '</span>' +
  '<span style="font-size: 12.5px; color: ' + K.muted + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + s[1] + '</span>' +
  (s[3] ? '<span style="align-self: flex-start; display: inline-flex; align-items: center; gap: 3px; height: 18px; padding: 0 5px; border-radius: 5px; background: #F1F1EE; font-weight: 600; font-size: 11.5px;">' + CLK + s[3] + '</span>' : '<span style="font-size: 12px; color: ' + K.muted + ';">' + s[2] + '</span>') + '</div>';
const stopRow = (p, i) => '<div style="' + WG + ' height: 96px; border-bottom: 1px solid ' + K.line2 + ';"><div style="display: flex; align-items: center; gap: 10px; padding-left: 16px; min-width: 0;"><span style="width: 32px; height: 32px; flex: none; border-radius: 99px; background: ' + p.bg + '; color: ' + p.fg + '; display: grid; place-items: center; font-size: 12px; font-weight: 600;">' + p.ini + '</span><span style="min-width: 0;"><span style="display: block; font-size: 13.5px; font-weight: 600; white-space: nowrap;">' + p.name + '</span><span style="display: block; font-size: 12px; color: ' + K.muted + '; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + p.role + '</span></span></div>' +
  '<div style="display: flex; align-items: center; gap: 6px; padding: 0 7px; border-left: 1px solid ' + K.line2 + '; min-width: 0;">' + STOPS[i].map(stopCard).join('') + '</div>' + loadCell(p.load) + '</div>';
const stopsHead = wsHead.replace('In order, first to last', 'Where to work, in order');
const stopsPage = wsPage(P.map(stopRow).join('')).replace(wsHead, stopsHead);
const frag = '<div style="position: relative; width: 950px; height: 880px; border-radius: 13px; overflow: hidden; box-shadow: 0 0 0 1px #E2E5DE, 0 8px 28px rgba(17,21,17,.10);"><div style="position: absolute; left: -481px; top: -9px;">' + pane('ws', stopsPage) + '</div></div>';
fs.writeFileSync(path.join(S, 'stops-console.frag.html'), frag);
console.log('frag ok');
