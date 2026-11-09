// Round 5 (9 Nov): notes live in My day (report page before the task), feeding a plain line, walks as rounds. Helpers from gen-stops-r3 + round 4; writes pub/project/AgentNotesR4 and R5 (copy R5 into phone/project/).
// Phone: My day as a quest line from the agent; agent in the dock's middle; scan floats (hides while scrolling). Built on live main screens.
const fs = require('fs'), path = require('path');
const S = __dirname;
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(S, f)).toString('base64');
const HOME = b64('home/workbench.today/en-390.png'), TREAT = b64('home/treat.record/en-390.png');
const PH = { bg: '#f6f7f1', line: '#dfe4d8', ink: '#20291f', muted: '#657060', green: '#276640', soft: '#eef1e7', dark: '#20291f' };
const JK = "'Plus Jakarta Sans', Arial, sans-serif";
const svg = (d, w, sw, c) => '<svg viewBox="0 0 24 24" style="width: ' + w + 'px; height: ' + w + 'px; flex: none; fill: none; stroke: ' + (c || 'currentColor') + '; stroke-width: ' + sw + '; stroke-linecap: round; stroke-linejoin: round;"><path d="' + d + '"/></svg>';
const IC = { spark: 'M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7Z', scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16', chev: 'm9 6 6 6-6 6', back: 'm15 6-6 6 6 6', clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2', send: 'M12 19V5M6 11l6-6 6 6', home: 'M3 10.5 12 3l9 7.5V21H3V10.5Z', tool: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16', flag: 'M5 21V4M5 4h11l-2 4 2 4H5' };
const slice = (src, y0, y1, dy) => '<div style="position: absolute; left: 0; top: ' + (y0 + dy) + 'px; width: 390px; height: ' + (y1 - y0) + 'px; background: url(' + src + ') 0 ' + (-y0) + 'px / 390px 844px no-repeat;"></div>';
const phone = (inner) => '<div style="width: 414px; height: 868px; border-radius: 62px; background: #111; padding: 12px; box-sizing: border-box; box-shadow: 0 20px 50px rgba(17,21,17,.25); flex: none;"><div style="position: relative; width: 390px; height: 844px; border-radius: 50px; overflow: hidden; background: ' + PH.bg + '; font-family: ' + JK + '; color: ' + PH.ink + ';">' + inner + '</div></div>';
const status = '<div style="height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 22px 0 24px; font-size: 13px; font-weight: 700;"><span>9:41</span><span style="font-size: 11px;">&#9679;&#9679;&#9679; &#9646;</span></div>';
const card = (h, m) => '<div style="margin: ' + (m || '0 18px 12px') + '; background: #fff; border: 1px solid ' + PH.line + '; border-radius: 16px; overflow: hidden;">' + h + '</div>';
const tile = (w, dark) => '<span style="width: ' + w + 'px; height: ' + w + 'px; flex: none; border-radius: ' + Math.round(w * 0.3) + 'px; background: ' + (dark ? PH.dark : PH.soft) + '; color: ' + (dark ? '#fff' : PH.ink) + '; display: grid; place-items: center;">' + svg(IC.spark, Math.round(w * 0.5), 1.7) + '</span>';
const clockChip = (t) => '<span style="display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 7px; border-radius: 7px; background: ' + PH.soft + '; font-size: 13px; font-weight: 700;">' + svg(IC.clock, 13, 2.2) + t + '</span>';

// the day (Sun Qing, Thu 5 Nov), the same jobs as the console's Work schedule
const DAY = [['Feeding', 'Farrowing 3 and 4', '~1½ h'], ['Pen-strep, morning', 'Farrowing 2', null, '07:00'], ['Second feed', 'Farrowing 3 and 4', null, '13:30'], ['Pen-strep, evening', 'Farrowing 2', null, '15:00']];

// dock: Home · agent (middle) · Toolbox, drawn over the live dock
const dock = (on) => '<div style="position: absolute; left: 0; right: 0; top: 760px; bottom: 0; background: #fff; border-top: 1px solid ' + PH.line + ';">' +
  '<div style="position: absolute; left: 52px; top: 16px; width: 60px; display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: ' + (on === 'home' ? PH.ink : PH.muted) + ';">' + svg(IC.home, 20, 1.8) + 'Home</div>' +
  '<div style="position: absolute; left: 278px; top: 16px; width: 60px; display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 13px; font-weight: 500; color: ' + PH.muted + ';">' + svg(IC.tool, 20, 1.8) + 'Toolbox</div>' +
  '<div style="position: absolute; left: 143px; bottom: 7px; width: 104px; height: 4px; border-radius: 2px; background: #c7cebe;"></div></div>' +
  '<div style="position: absolute; left: 161px; top: 746px; width: 68px; height: 68px; border-radius: 22px; background: ' + PH.bg + ';"></div>' +
  '<div style="position: absolute; left: 166px; top: 751px; width: 58px; height: 58px; border-radius: 18px; background: ' + PH.dark + '; color: #fff; display: grid; place-items: center;' + (on === 'agent' ? ' box-shadow: 0 0 0 3px #c8f26b;' : '') + '">' + svg(IC.spark, 26, 1.7) + '</div>';
const scanFab = (o) => { o = o || {}; return '<div style="position: absolute; left: ' + (316 + (o.dx || 0)) + 'px; top: 688px; width: 56px; height: 56px; border-radius: 99px; background: #fff; border: 1px solid ' + PH.line + '; box-shadow: 0 8px 20px rgba(32,41,31,.18); display: grid; place-items: center; color: ' + PH.ink + '; opacity: ' + (o.op === undefined ? 1 : o.op) + ';">' + svg(IC.scan, 24, 2) + '</div>'; };

// A · Home, still: Your day on top, agent in the dock, scan floating
const yourDay = '<div style="position: absolute; left: 0; right: 0; top: 168px;">' + card('<div style="display: flex; align-items: center; gap: 12px; padding: 14px 8px 12px 14px;">' + tile(36) +
  '<div style="flex: 1; min-width: 0;"><div style="display: flex; align-items: baseline; gap: 8px;"><span style="font-size: 17px; font-weight: 700;">Your day</span><span style="font-size: 13px; color: ' + PH.muted + ';">4 jobs &middot; about 5&frac12; h</span></div>' +
  '<div style="font-size: 14px; margin-top: 3px;"><span style="color: ' + PH.muted + ';">First:</span> <b style="font-weight: 600;">Feeding</b> <span style="color: ' + PH.muted + ';">&middot; Farrowing 3 and 4</span></div></div>' +
  '<span style="width: 44px; height: 44px; display: grid; place-items: center; color: ' + PH.muted + ';">' + svg(IC.chev, 20, 2) + '</span></div>', '0 18px') + '</div>';
const homeA = '<div style="position: absolute; left: 0; top: 0; width: 390px; height: 760px; overflow: hidden;">' + slice(HOME, 0, 158, 0) +
  '<div style="position: absolute; left: 202px; top: 36px; width: 120px; height: 56px; background: ' + PH.bg + ';"></div>' + yourDay + slice(HOME, 158, 760, 84) + '</div>' + dock('home') + scanFab();

// C · the agent, from the dock's middle: the morning message carries the day
const step = (n, t, p, dur, at, o) => { o = o || {}; return '<div style="display: flex; align-items: stretch; gap: 12px; min-height: 58px;">' +
  '<div style="width: 26px; flex: none; display: flex; flex-direction: column; align-items: center;"><span style="width: 26px; height: 26px; border-radius: 99px; display: grid; place-items: center; font-size: 13px; font-weight: 700; margin-top: 6px; ' + (n === 1 ? 'background: ' + PH.green + '; color: #fff;' : 'background: #fff; box-shadow: inset 0 0 0 1.5px #a3aa9f; color: ' + PH.ink + ';') + '">' + n + '</span>' + (o.last ? '' : '<span style="flex: 1; width: 2px; background: #d5dccb; margin: 3px 0 -3px;"></span>') + '</div>' +
  '<div style="flex: 1; min-width: 0; padding: 6px 0 10px;"><div style="font-size: 15px; font-weight: 700;">' + t + '</div><div style="display: flex; align-items: center; gap: 8px; margin-top: 3px; font-size: 13px; color: ' + PH.muted + ';">' + (at ? clockChip(at) : '<span>' + dur + '</span><span>&middot;</span>') + '<span>' + p + '</span></div></div>' +
  '<span style="width: 36px; display: grid; place-items: center; color: #a3aa9f;">' + svg(IC.chev, 18, 2) + '</span></div>'; };
const agentHead = status + '<div style="display: flex; align-items: center; gap: 12px; padding: 8px 18px 14px;">' + tile(44, true) + '<div style="flex: 1;"><div style="font-size: 22px; font-weight: 700; letter-spacing: -.01em;">General Manager</div><div style="font-size: 14px; color: ' + PH.muted + '; margin-top: 2px;">Farrowing</div></div></div><div style="height: 1px; background: ' + PH.line + ';"></div>';
const msg = (time, t) => '<div style="display: flex; align-items: center; gap: 8px; margin: 16px 18px 8px; font-size: 13px; color: ' + PH.muted + ';"><b style="color: ' + PH.ink + '; font-weight: 700;">General Manager</b>&middot; ' + time + '</div><div style="margin: 0 18px; font-size: 16px; line-height: 23px;">' + t + '</div>';
const questCompact = card('<div style="padding: 8px 4px 2px 14px;">' + DAY.map((d, i) => step(i + 1, d[0], d[1], d[2], d[3], { last: i === DAY.length - 1 })).join('') + '</div>' +
  '<div style="border-top: 1px solid ' + PH.line + '; height: 52px; display: grid; place-items: center; font-size: 15px; font-weight: 700; color: ' + PH.green + ';">Open My day</div>', '12px 18px 0');
const finding = '<div style="margin: 14px 18px 0; display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 14px; background: #fff; border: 1px solid ' + PH.line + ';"><div style="flex: 1;"><div style="font-size: 13px; color: ' + PH.muted + ';">From last night</div><div style="font-size: 15px; font-weight: 700; margin-top: 2px;">Where did the 4 pigs from Unit 7 go?</div></div><span style="height: 44px; display: grid; place-items: center; color: ' + PH.muted + ';">' + svg(IC.chev, 18, 2) + '</span></div>';
const composer = '<div style="position: absolute; left: 0; right: 0; top: 684px; height: 76px; display: flex; align-items: center; gap: 10px; padding: 0 18px; background: ' + PH.bg + ';"><div style="flex: 1; height: 52px; border-radius: 14px; background: #fff; border: 1px solid #b6c0ad; display: flex; align-items: center; padding: 0 14px; font-size: 15px; color: ' + PH.muted + ';">Ask about your work</div><span style="width: 52px; height: 52px; border-radius: 14px; background: ' + PH.dark + '; color: #fff; display: grid; place-items: center;">' + svg(IC.send, 20, 2.2) + '</span></div>';
const agentC = agentHead + msg('05:30', 'Morning, Sun Qing. Your day, in the order I&rsquo;d go:') + questCompact + finding + composer + dock('agent');

// D · My day: the quest line, each step opens its task
const bigStep = (n, t, p, dur, at, o) => { o = o || {}; const first = n === 1;
  return '<div style="display: flex; align-items: stretch; gap: 12px;">' +
    '<div style="width: 34px; flex: none; display: flex; flex-direction: column; align-items: center;"><span style="width: 34px; height: 34px; border-radius: 99px; display: grid; place-items: center; font-size: 15px; font-weight: 700; margin-top: 18px; ' + (first ? 'background: ' + PH.green + '; color: #fff; box-shadow: 0 0 0 5px #dcebdd;' : 'background: #fff; box-shadow: inset 0 0 0 2px #a3aa9f;') + '">' + n + '</span><span style="flex: 1; width: 2px; background: #cdd5c3; margin-top: 4px;"></span></div>' +
    '<div style="flex: 1; min-width: 0; margin-bottom: 12px; background: #fff; border: 1px solid ' + (o.pressed ? PH.ink : PH.line) + '; border-radius: 16px; padding: 14px 6px 14px 16px; display: flex; align-items: center; gap: 6px;' + (o.pressed ? ' background: #f1f3ec; box-shadow: 0 0 0 1px ' + PH.ink + ';' : '') + '">' +
    '<div style="flex: 1; min-width: 0;">' + (first ? '<div style="font-size: 13px; font-weight: 700; color: ' + PH.green + '; margin-bottom: 3px;">Start here</div>' : '') + '<div style="font-size: 17px; font-weight: 700;">' + t + '</div><div style="font-size: 14px; color: ' + PH.muted + '; margin-top: 3px;">' + p + '</div>' +
    '<div style="margin-top: 8px;">' + (at ? clockChip(at) : '<span style="font-size: 13px; color: ' + PH.muted + ';">' + dur + '</span>') + '</div></div>' +
    '<span style="width: 44px; height: 44px; display: grid; place-items: center; color: ' + PH.muted + ';">' + svg(IC.chev, 20, 2) + '</span></div></div>'; };
const mydayHead = status + '<div style="padding: 4px 18px 6px;"><div style="display: inline-flex; align-items: center; gap: 2px; height: 44px; padding: 0 14px 0 8px; border-radius: 12px; border: 1px solid #b6c0ad; background: #fff; font-size: 15px; font-weight: 600;">' + svg(IC.back, 18, 2) + 'Home</div>' +
  '<h1 style="margin: 14px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -.02em;">My day</h1><div style="display: flex; align-items: center; gap: 6px; font-size: 14px; color: ' + PH.muted + '; margin-top: 4px;">Thu 5 Nov &middot; about 5&frac12; h &middot; ' + svg(IC.spark, 14, 1.8) + 'from the General Manager</div></div>';
const endFlag = '<div style="display: flex; align-items: center; gap: 12px; margin-top: -6px;"><div style="width: 34px; display: grid; place-items: center; color: #a3aa9f;">' + svg(IC.flag, 20, 2) + '</div><span style="font-size: 14px; color: ' + PH.muted + ';">That&rsquo;s your day. Hold a step to change the order.</span></div>';
const myday = (pressed) => mydayHead + '<div style="padding: 14px 18px 0 14px;">' + DAY.map((d, i) => bigStep(i + 1, d[0], d[1], d[2], d[3], { pressed: pressed === i })).join('') + endFlag + '</div>';

// ===== phone: My day as stops; the agent's heads-up as prose on entering a task =====
const FARROW = b64('home/farrowing.room/en-390.png'), WALK = b64('home/inspection.walk/en-390.png');
Object.assign(IC, { feed: 'M5 9h14l-1.5 10h-11L5 9ZM8.5 9V7a3.5 3.5 0 0 1 7 0v2', walk: 'M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-12a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7', dose: 'm18 3 3 3M16.5 4.5l3 3M15 6l3 3-8.5 8.5-3-3L15 6ZM6.5 14.5l3 3M7 17l-4 4M10 9.5l1.5 1.5M12.5 7l1.5 1.5',
  foster: 'M7 7h11l-3-3M17 17H6l3 3', birth: 'M4 16a8 8 0 0 1 16 0M12 4v3M5.5 7.5l2 2M18.5 7.5l-2 2M3 20h18', x: 'M7 7l10 10M17 7 7 17' });
const STOPS_P = [
  { place: 'Farrowing 3 and 4', time: '~2½ h', rows: [['feed', 'Feeding'], ['birth', 'Farrowing']] },
  { place: 'Farrowing 2', at: '09:00', rows: [['foster', 'Fostering checks'], ['walk', 'Walk-through', 'Give the morning Pen-strep to the litter in B3 as you go.']] },
  { place: 'Farrowing 3 and 4', at: '13:30', rows: [['feed', 'Second feed']] },
  { place: 'Farrowing 2', at: '15:00', rows: [['dose', 'Pen-strep, evening']] }
];
const taskRow = (r, first) => '<div style="border-top: ' + (first ? '0' : '1px solid #e8eddf') + ';"><div style="display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 6px 0 14px;"><span style="width: 30px; height: 30px; flex: none; border-radius: 9px; background: ' + PH.soft + '; display: grid; place-items: center; color: ' + PH.ink + ';">' + svg(IC[r[0]], 17, 1.8) + '</span><span style="flex: 1; font-size: 16px; font-weight: 600;">' + r[1] + '</span><span style="width: 44px; height: 44px; display: grid; place-items: center; color: ' + PH.muted + ';">' + svg(IC.chev, 18, 2) + '</span></div>' +
  (r[2] ? '<div style="margin: -6px 14px 12px 56px; font-size: 14px; line-height: 20px; color: ' + PH.muted + ';">' + r[2] + '</div>' : '') + '</div>';
const stopBlock = (s, n, last) => '<div style="display: flex; align-items: stretch; gap: 10px;">' +
  '<div style="width: 30px; flex: none; display: flex; flex-direction: column; align-items: center;"><span style="width: 30px; height: 30px; border-radius: 99px; display: grid; place-items: center; font-size: 14px; font-weight: 700; margin-top: 2px; ' + (n === 1 ? 'background: ' + PH.green + '; color: #fff; box-shadow: 0 0 0 5px #dcebdd;' : 'background: #fff; box-shadow: inset 0 0 0 2px #a3aa9f;') + '">' + n + '</span>' + (last ? '' : '<span style="flex: 1; width: 2px; background: #cdd5c3; margin-top: 4px;"></span>') + '</div>' +
  '<div style="flex: 1; min-width: 0; margin-bottom: 14px;"><div style="display: flex; align-items: center; gap: 8px; min-height: 34px; padding: 0 2px 6px;"><span style="flex: 1; font-size: 18px; font-weight: 700;">' + s.place + '</span>' + (s.at ? clockChip(s.at) : '<span style="font-size: 14px; color: ' + PH.muted + ';">' + s.time + '</span>') + '</div>' +
  '<div style="background: #fff; border: 1px solid ' + PH.line + '; border-radius: 16px; overflow: hidden;">' + s.rows.map((r, i) => taskRow(r, i === 0)).join('') + '</div></div></div>';
const mydayStops = mydayHead.replace(/about 5&frac12; h &middot; .*?from the General Manager/, '4 stops &middot; about 5&frac12; h') + '<div style="padding: 14px 18px 0 14px;">' + STOPS_P.map((s, i) => stopBlock(s, i + 1, i === STOPS_P.length - 1)).join('') + '</div>';

// agent's morning message, as stops
const stopLine = (s, n, last) => '<div style="display: flex; align-items: stretch; gap: 12px; min-height: 56px;"><div style="width: 26px; flex: none; display: flex; flex-direction: column; align-items: center;"><span style="width: 26px; height: 26px; border-radius: 99px; display: grid; place-items: center; font-size: 13px; font-weight: 700; margin-top: 6px; ' + (n === 1 ? 'background: ' + PH.green + '; color: #fff;' : 'background: #fff; box-shadow: inset 0 0 0 1.5px #a3aa9f;') + '">' + n + '</span>' + (last ? '' : '<span style="flex: 1; width: 2px; background: #d5dccb; margin: 3px 0 -3px;"></span>') + '</div>' +
  '<div style="flex: 1; min-width: 0; padding: 6px 0 10px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="flex: 1; font-size: 15px; font-weight: 700;">' + s.place + '</span>' + (s.at ? clockChip(s.at) : '<span style="font-size: 13px; color: ' + PH.muted + ';">' + s.time + '</span>') + '</div><div style="font-size: 14px; color: ' + PH.muted + '; margin-top: 3px;">' + s.rows.map((r, i) => i && !/^Pen/.test(r[1]) ? r[1][0].toLowerCase() + r[1].slice(1) : r[1]).join(', then ') + '</div></div></div>';
const morning = agentHead + msg('05:30', 'Morning, Sun Qing. Four stops today:') + card('<div style="padding: 8px 14px 2px;">' + STOPS_P.map((s, i) => stopLine(s, i + 1, i === STOPS_P.length - 1)).join('') + '</div><div style="border-top: 1px solid ' + PH.line + '; height: 52px; display: grid; place-items: center; font-size: 15px; font-weight: 700; color: ' + PH.green + ';">Open My day</div>', '12px 18px 0') + composer + dock('agent');

// heads-up: prose sheet on entering a task; afterwards a sparkle button in the header reopens it
const fixLabel = (src, x, y, w, h, html, bg) => '<div style="position: absolute; left: ' + x + 'px; top: ' + y + 'px; width: ' + w + 'px; height: ' + h + 'px; background: ' + (bg || '#fff') + '; display: flex; align-items: center; font-family: ' + JK + ';">' + html + '</div>';
const farrowBase = slice(FARROW, 0, 844, 0) + fixLabel(FARROW, 52, 132, 110, 20, '<span style="font-size: 13px; color: ' + PH.muted + ';">Farrowing 3</span>');
const walkBase = slice(WALK, 0, 844, 0) + fixLabel(WALK, 76, 76, 196, 20, '<span style="font-size: 13px; color: ' + PH.muted + ';">Gestation 2 &middot; <b style="color: ' + PH.ink + '; font-weight: 600;">06:40</b> &middot; G.H</span>', PH.bg);
const headBtn = (x, dot) => '<div style="position: absolute; left: ' + x + 'px; top: 47px; width: 46px; height: 46px; border-radius: 13px; background: #fff; border: 1px solid ' + PH.line + '; display: grid; place-items: center; color: ' + PH.ink + ';">' + svg(IC.spark, 20, 1.8) + (dot ? '<span style="position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; border-radius: 99px; background: ' + PH.green + ';"></span>' : '') + '</div>';
const para = (t) => '<p style="margin: 0 0 14px; font-size: 16px; line-height: 24px;">' + t + '</p>';
const sheet = (top, title, paras) => '<div style="position: absolute; inset: 0; background: rgba(20,24,19,.40);"></div><div style="position: absolute; left: 0; right: 0; top: ' + top + 'px; bottom: 0; background: ' + PH.bg + '; border-radius: 24px 24px 0 0;">' +
  '<div style="width: 40px; height: 4px; border-radius: 2px; background: #c7cebe; margin: 10px auto 0;"></div>' +
  '<div style="display: flex; align-items: center; gap: 10px; padding: 12px 10px 12px 18px;">' + tile(32, true) + '<div style="flex: 1;"><div style="font-size: 17px; font-weight: 700;">' + title + '</div><div style="font-size: 13px; color: ' + PH.muted + '; margin-top: 1px;">General Manager &middot; 05:30</div></div><span style="width: 44px; height: 44px; display: grid; place-items: center;">' + svg(IC.x, 22, 2.2, PH.ink) + '</span></div>' +
  card('<div style="padding: 16px 16px 4px;">' + paras.map(para).join('') + '</div>', '0 16px') +
  '<div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 16px 30px; background: #fff; border-top: 1px solid ' + PH.line + ';">' + '<div style="height: 56px; border-radius: 14px; background: ' + PH.green + '; color: #fff; display: grid; place-items: center; font-size: 16px; font-weight: 700;">Got it</div></div></div>';
const farrowSheet = farrowBase + headBtn(326, true) + sheet(330, 'Before you start', [
  '000392 in B2 is due tomorrow and has been off her feed since last night. Look at her first.',
  '000418 in B1 lost 5 yesterday. Check the heat lamp in B1 is on before you count again.']);
const farrowAfter = farrowBase + headBtn(326, false);
// the walk header already has History at the right; the agent's button sits left of it
const walkSheetFull = walkBase + headBtn(274, true) + sheet(330, 'While you walk', [
  'Score body condition on 000267 and 000281 in C1, and on 000306 and 000312 in C2. It&rsquo;s the usual record on each pig, about 3 minutes.',
  '000306 had a fever yesterday. Take her temperature again when you&rsquo;re at C2.']);

const consoleFrag = fs.readFileSync(path.join(S, 'stops-console.frag.html'), 'utf8');
const pf = (title, cap, ph) => '<figure style="margin: 0; width: 414px; flex: none;"><figcaption style="font-size: 17px; font-weight: 600; margin-bottom: 6px;">' + title + '</figcaption><div style="font-size: 14.5px; line-height: 22px; color: #3B4540; margin-bottom: 14px; min-height: 132px;">' + cap + '</div>' + phone(ph) + '</figure>';
const ruleCard = '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px 12px;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">The rule: a card is a stop</div><ul style="margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + [
  '<b>A stop is a place:</b> a room or rooms walked together. A new stop only when you move somewhere else, or come back later (a dose at 15:00).',
  '<b>Inside a stop, its tasks in order,</b> one row each with a plain icon. A row opens that task&rsquo;s own page; nothing of the task is redrawn here.',
  '<b>&ldquo;As you go&rdquo; is a sentence,</b> not a row: work done inside another task&rsquo;s page (the Pen-strep during the walk).',
  '<b>Everything else is prose inside the task:</b> what to watch, what to measure, what to do while there. No new controls in the task pages.'].map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ul></div>';
const headsCard = '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px 12px;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">The heads-up: prose, out of the way</div><ul style="margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + [
  'Opening a task with something to say shows it once as a sheet: a few sentences, then Got it. Nothing on the page itself moves or changes.',
  'After that, one button in the header (the agent&rsquo;s mark) reopens it; a dot until it&rsquo;s been read. A task with nothing to say has no button.',
  'Pigs and pens are named in the sentences; no tags in the list. This replaces the earlier comment card and &ldquo;Body condition&rdquo; tags in the walk.',
  'Short by rule: at most three sentences, only what changes what you do today.'].map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ul></div>';
const html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Stops and heads-up</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Inter:wght@400..700&family=Plus+Jakarta+Sans:wght@400..800&display=swap" rel="stylesheet">\n<style>body{margin:0}</style>\n</helmet>\n' +
  '<div style="width: 3008px; padding: 44px 48px 60px; box-sizing: border-box; background: #F3F4F1; font-family: Geist, system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' +
  '<h1 style="margin: 0; font-size: 30px; line-height: 38px; font-weight: 600; letter-spacing: -.025em;">The day as stops, and the agent&rsquo;s heads-up as prose inside each task (mock-up)</h1><p style="margin: 8px 0 34px; font-size: 16px; line-height: 24px; color: #5D665F; max-width: 2300px;">The plan points you to where to work and in what order; each task page stays as it is and carries what the agent has to say as a few sentences. Built on the live phone screens from main.</p>' +
  '<div style="display: flex; gap: 36px; align-items: flex-start;">' +
  pf('1 · My day: stops', 'Four stops, each a place with its time. Inside, the tasks in order, each with a plain icon; a row opens that task. The Pen-strep rides in the walk as one sentence.', mydayStops) +
  pf('2 · The morning message', 'The agent sends the same stops: place, time, and the tasks as words. Open My day for the rows.', morning) +
  '<figure style="margin: 0; width: 950px; flex: none;"><figcaption style="font-size: 17px; font-weight: 600; margin-bottom: 6px;">3 · Console: the Work schedule as stops</figcaption><div style="font-size: 14.5px; line-height: 22px; color: #3B4540; margin-bottom: 14px; min-height: 132px;">Same rule for every row: a card per place. Wang Fang and Zhao Min work in one building all day, so one card each; Ma Lin goes back to Gestation for the 13:30 feed, so two.</div>' + consoleFrag + '</figure>' +
  '<div style="flex: 1; display: flex; flex-direction: column; gap: 20px; padding-top: 168px;">' + ruleCard + '</div></div>' +
  '<div style="height: 56px;"></div><div style="display: flex; gap: 36px; align-items: flex-start;">' +
  pf('4 · Opening a task: the heads-up', 'Sun Qing opens Farrowing 3. The agent&rsquo;s note shows once, in plain sentences, over the page; Got it and the list is untouched.', farrowSheet) +
  pf('5 · After: one button, nothing else', 'The page is exactly the live page, plus the agent&rsquo;s mark in the header to read the note again.', farrowAfter) +
  pf('6 · A walk: what to do while there', 'Zhao Min&rsquo;s walk in Gestation 2. The data ask and the temperature are sentences naming the pigs; the list has no tags. Recording is the usual record on each pig.', walkSheetFull) +
  '<div style="flex: 1; display: flex; flex-direction: column; gap: 20px; padding-top: 168px;">' + headsCard + '</div></div></div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":3008,"height":2300}}\'>\nclass Component extends DCLogic {\n  renderVals() { return {}; }\n}\n</script>\n</body>\n</html>\n';
// ===== round 2: rounds and coming back; a rich morning brief; the heads-up as a notification, not a forced pop-up =====
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
// B · an interrupted day: a task, a feeding round across five rooms, then back to the task
const routeLine = (rooms) => '<div style="display: flex; gap: 6px; overflow: hidden; padding: 2px 0 12px 56px; white-space: nowrap; -webkit-mask-image: linear-gradient(90deg, #000 78%, transparent); mask-image: linear-gradient(90deg, #000 78%, transparent);">' + rooms.map((r, i) => '<span style="flex: none; display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 9px 0 4px; border-radius: 8px; background: ' + PH.soft + '; font-size: 13px; font-weight: 600;"><b style="width: 20px; height: 20px; border-radius: 6px; background: #fff; display: grid; place-items: center; font-size: 11px;">' + (i + 1) + '</b>' + r + '</span>').join('') + '</div>';
const STOPS_B = [
  { place: 'Farrowing 3', at: '06:00', rows: [['birth', 'Farrowing']] },
  { place: 'Feeding round', sub: '5 rooms, in walking order', at: '07:00', rows: [['feed', 'Feeding']], route: ['Farrowing 1', 'Farrowing 2', 'Farrowing 3', 'Farrowing 4', 'Nursery 1'] },
  { place: 'Back to Farrowing 3', time: '~2 h', rows: [['birth', 'Farrowing, carry on']] },
  { place: 'Farrowing 2', at: '15:00', rows: [['dose', 'Pen-strep, evening']] }
];
const stopBlockB = (s, n, last) => '<div style="display: flex; align-items: stretch; gap: 10px;">' +
  '<div style="width: 30px; flex: none; display: flex; flex-direction: column; align-items: center;"><span style="width: 30px; height: 30px; border-radius: 99px; display: grid; place-items: center; font-size: 14px; font-weight: 700; margin-top: 2px; ' + (n === 1 ? 'background: ' + PH.green + '; color: #fff; box-shadow: 0 0 0 5px #dcebdd;' : 'background: #fff; box-shadow: inset 0 0 0 2px #a3aa9f;') + '">' + n + '</span>' + (last ? '' : '<span style="flex: 1; width: 2px; background: #cdd5c3; margin-top: 4px;"></span>') + '</div>' +
  '<div style="flex: 1; min-width: 0; margin-bottom: 14px;"><div style="display: flex; align-items: center; gap: 8px; min-height: 34px; padding: 0 2px 6px;"><span style="flex: 1; min-width: 0;"><span style="display: block; font-size: 18px; font-weight: 700;">' + s.place + '</span>' + (s.sub ? '<span style="display: block; font-size: 13px; color: ' + PH.muted + '; margin-top: 1px;">' + s.sub + '</span>' : '') + '</span>' + (s.at ? clockChip(s.at) : '<span style="font-size: 14px; color: ' + PH.muted + ';">' + s.time + '</span>') + '</div>' +
  '<div style="background: #fff; border: 1px solid ' + PH.line + '; border-radius: 16px; overflow: hidden;">' + s.rows.map((r, i) => taskRow(r, i === 0)).join('') + (s.route ? routeLine(s.route) : '') + '</div></div></div>';
const mydayB = mydayHead.replace(/about 5&frac12; h &middot; .*?from the General Manager/, '4 stops &middot; about 6 h') + '<div style="padding: 14px 18px 0 14px;">' + STOPS_B.map((s, i) => stopBlockB(s, i + 1, i === STOPS_B.length - 1)).join('') + '</div>';

// the morning brief: written by the agent as a formatted page, not a chat line
const pen = (t) => '<span style="display: inline-flex; align-items: center; height: 22px; padding: 0 6px; border-radius: 6px; background: ' + PH.soft + '; font: 700 12.5px ' + MONO + '; vertical-align: 1px;">' + t + '</span>';
const pig = (t) => '<b style="font: 700 14.5px ' + MONO + ';">' + t + '</b>';
const node = (ic, t, on) => '<div style="display: flex; flex-direction: column; align-items: center; gap: 5px; width: 54px;"><span style="width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; ' + (on ? 'background: ' + PH.green + '; color: #fff;' : 'background: #fff; color: ' + PH.ink + '; box-shadow: inset 0 0 0 1px ' + PH.line + ';') + '">' + svg(IC[ic], 20, 1.8) + '</span><span style="font-size: 12px; font-weight: 700; color: ' + (on ? PH.green : PH.muted) + ';">' + t + '</span></div>';
const dash = '<span style="flex: 1; height: 2px; margin-top: 19px; background: repeating-linear-gradient(90deg, #b9c2ae 0 4px, transparent 4px 8px);"></span>';
const brief = '<div style="margin: 12px 14px 0; border-radius: 20px; overflow: hidden; background: #fff; border: 1px solid ' + PH.line + ';">' +
  '<div style="padding: 16px 16px 14px; background: linear-gradient(180deg, #eef3e6, #fff);"><div style="font-size: 12px; font-weight: 700; letter-spacing: .06em; color: ' + PH.muted + ';">THURSDAY 5 NOV</div><div style="font-size: 22px; font-weight: 800; letter-spacing: -.02em; margin-top: 4px;">Four stops, about 6 hours</div>' +
  '<div style="display: flex; align-items: flex-start; margin-top: 14px;">' + node('birth', '06:00', true) + dash + node('feed', '07:00') + dash + node('birth', '~2 h') + dash + node('dose', '15:00') + '</div></div>' +
  '<div style="padding: 4px 16px 6px;"><div style="font-size: 13px; font-weight: 700; color: ' + PH.muted + '; margin: 8px 0 6px;">Start with</div><div style="font-size: 16px; line-height: 23px;"><b>Farrowing 3.</b> B33 is farrowing; three sows are close. At 07:00 leave them for the feeding round, then come back.</div>' +
  '<div style="font-size: 13px; font-weight: 700; color: ' + PH.muted + '; margin: 14px 0 6px;">Worth knowing</div>' +
  '<div style="font-size: 15px; line-height: 23px; padding-left: 12px; border-left: 3px solid #c8d8b8;">' + pig('000392') + ' in ' + pen('B2') + ' is due tomorrow and off her feed since last night.</div>' +
  '<div style="font-size: 15px; line-height: 23px; padding-left: 12px; border-left: 3px solid #c8d8b8; margin-top: 10px;">In Farrowing 2, the litter in ' + pen('B3') + ' gets Pen-strep at 15:00.</div></div>' +
  '<div style="margin: 14px 16px 16px; height: 50px; border-radius: 14px; border: 1px solid #b6c0ad; display: grid; place-items: center; font-size: 15px; font-weight: 700;">Open My day</div></div>';
const morningRich = agentHead + '<div style="display: flex; align-items: center; gap: 8px; margin: 14px 18px 0; font-size: 13px; color: ' + PH.muted + ';"><b style="color: ' + PH.ink + '; font-weight: 700;">General Manager</b>&middot; 05:30</div>' + brief + composer + dock('agent');

// the heads-up: slides in like a notification above the task's footer; the page stays usable
const toast = '<div style="position: absolute; left: 12px; right: 12px; top: 650px; z-index: 3; background: #fff; border-radius: 18px; box-shadow: 0 12px 30px rgba(32,41,31,.22), 0 0 0 1px ' + PH.line + '; display: flex; align-items: center; gap: 12px; padding: 12px 4px 12px 12px;">' + tile(36, true) +
  '<div style="flex: 1; min-width: 0;"><div style="font-size: 15px; font-weight: 700;">2 things in Farrowing 3</div><div style="font-size: 13.5px; color: ' + PH.muted + '; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">000392 in B2 is due tomorrow and off her feed&hellip;</div></div>' +
  '<span style="width: 44px; height: 44px; display: grid; place-items: center; color: ' + PH.muted + ';">' + svg(IC.x, 20, 2.2) + '</span></div>';
const farrowToast = farrowBase + headBtn(326, true) + toast;
// opened by tapping it: the same note, formatted, closable
const item = (penT, pigT, text) => '<div style="display: flex; gap: 12px; padding: 14px 0; border-top: 1px solid #e8eddf;"><div style="flex: none; width: 48px;">' + pen(penT) + '</div><div style="flex: 1; font-size: 15.5px; line-height: 23px;">' + (pigT ? pig(pigT) + ' ' : '') + text + '</div></div>';
const readSheetOf = (kicker, title, items) => '<div style="position: absolute; inset: 0; background: rgba(20,24,19,.32);"></div><div style="position: absolute; left: 0; right: 0; bottom: 0; padding-bottom: 34px; background: #fff; border-radius: 24px 24px 0 0;">' +
  '<div style="width: 40px; height: 4px; border-radius: 2px; background: #c7cebe; margin: 10px auto 0;"></div>' +
  '<div style="display: flex; align-items: flex-start; gap: 10px; padding: 12px 8px 4px 18px;">' + tile(32, true) + '<div style="flex: 1;"><div style="font-size: 12px; font-weight: 700; letter-spacing: .06em; color: ' + PH.muted + ';">' + kicker + '</div><div style="font-size: 20px; font-weight: 800; letter-spacing: -.01em; margin-top: 3px;">' + title + '</div></div><span style="width: 44px; height: 44px; display: grid; place-items: center;">' + svg(IC.x, 22, 2.2, PH.ink) + '</span></div>' +
  '<div style="padding: 6px 18px 0;">' + items +
  '<div style="font-size: 13px; color: ' + PH.muted + '; padding-top: 12px; border-top: 1px solid #e8eddf;">General Manager &middot; 05:30 &middot; reopen any time from ' + '<span style="display: inline-flex; vertical-align: -3px;">' + svg(IC.spark, 15, 1.8) + '</span> in the header</div></div></div>';
const farrowRead = farrowBase + headBtn(326, false) + readSheetOf('FARROWING 3 &middot; TODAY', 'Two sows to watch', item('B2', '000392', 'is due tomorrow and has been off her feed since last night. <b>Look at her first.</b>') + item('B1', '000418', 'lost 5 yesterday. Check the heat lamp is on before you count again.'));
const walkRead = walkBase + headBtn(274, false) + readSheetOf('GESTATION 2 &middot; WHILE YOU WALK', 'Body condition on four sows', item('C1', null, '<b>Score</b> ' + pig('000267') + ' and ' + pig('000281') + '. It&rsquo;s the usual record on each pig.') + item('C2', null, '<b>Score</b> ' + pig('000306') + ' and ' + pig('000312') + '. ' + pig('000306') + ' had a fever yesterday: take her temperature again.'));

const consoleFrag2 = fs.readFileSync(path.join(S, 'stops-console.frag.html'), 'utf8');
const pf2 = (title, cap, ph) => '<figure style="margin: 0; width: 414px; flex: none;"><figcaption style="font-size: 17px; font-weight: 600; margin-bottom: 6px;">' + title + '</figcaption><div style="font-size: 14.5px; line-height: 22px; color: #3B4540; margin-bottom: 14px; min-height: 132px;">' + cap + '</div>' + phone(ph) + '</figure>';
const rc = (t, items) => '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px 12px;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">' + t + '</div><ul style="margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + items.map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ul></div>';
const rule2 = rc('The rule, round 2: a card is a stop, one trip', [
  '<b>A place:</b> several tasks in one room or block. <b>A round:</b> one task across several rooms (feeding, a walk); its rooms sit on one scrolling line inside, in walking order.',
  '<b>Coming back is its own card,</b> named &ldquo;Back to Farrowing 3&rdquo;, so an interrupted task reads as leave, round, return; never five room cards.',
  'A new card only for a new trip: another place, a round, or a return later. Tasks in the same trip are rows; &ldquo;as you go&rdquo; work is a sentence.',
  'The console Work schedule follows: a round is one card with its first room and how many more (&ldquo;Feeding &middot; Farrowing 1 +4&rdquo;).']);
const heads2 = rc('The heads-up, round 2: a notification, never forced', [
  'Opening a task with something to say slides a small card in above the footer: what it&rsquo;s about and the first line. The page stays usable; nothing is dimmed or blocked.',
  'Tap it to read the whole note; &#10005; to put it away. Either way the agent&rsquo;s mark in the header keeps it, with a dot until it&rsquo;s been read.',
  'The agent writes it formatted: a title, one item per pen with the pig named, the one thing to do in bold. Same for the morning brief: a laid-out page, not a chat line.',
  'Still short by rule: only what changes what you do today in this task.']);

// ===== round 3 (9 Nov): the agent's own look; notes about the whole task or room; a place in the task where the notes live =====
const FOOT = 750; // top of the live task footer
// three looks for the agent; all keep the Toast's door-and-dismiss anatomy (✕ at the left, the rest one door with a chevron)
const LOOK = {
  A: { box: PH.ink, line: 'none', title: '#fff', sub: 'rgba(255,255,255,.78)', icon: 'rgba(255,255,255,.8)', disc: '#6f62c4', discInk: '#fff', name: 'Ink, with the agent&rsquo;s mark' },
  B: { box: '#eeebfa', line: '#d3cdef', title: '#2b2459', sub: '#4f4880', icon: '#4f4880', disc: '#5b4fb0', discInk: '#fff', name: 'The agent&rsquo;s own tint' },
  C: { box: '#3b3473', line: 'none', title: '#fff', sub: '#d9d5f2', icon: '#d9d5f2', disc: 'rgba(255,255,255,.16)', discInk: '#fff', name: 'The agent&rsquo;s own deep colour' }
};
const disc = (L, w) => '<span style="width: ' + w + 'px; height: ' + w + 'px; flex: none; border-radius: 99px; background: ' + L.disc + '; color: ' + L.discInk + '; display: grid; place-items: center;">' + svg(IC.spark, Math.round(w * 0.6), 1.9) + '</span>';
const agentToast = (L, title, line) => '<div style="position: absolute; left: 18px; right: 18px; top: ' + (FOOT - 10 - 60) + 'px; height: 60px; z-index: 3; box-sizing: border-box; background: ' + L.box + '; border-radius: 14px; ' + (L.line === 'none' ? '' : 'box-shadow: 0 0 0 1px ' + L.line + ', 0 10px 24px rgba(43,36,89,.16); ') + (L.line === 'none' ? 'box-shadow: 0 10px 24px rgba(20,24,19,.24); ' : '') + 'display: flex; align-items: center; padding: 0 2px 0 0;">' +
  '<span style="width: 44px; height: 44px; flex: none; display: grid; place-items: center; color: ' + L.icon + ';">' + svg(IC.x, 18, 2.2) + '</span>' + disc(L, 30) +
  '<div style="flex: 1; min-width: 0; margin-left: 10px;"><div style="font-size: 15px; font-weight: 700; color: ' + L.title + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + title + '</div><div style="font-size: 13px; color: ' + L.sub + '; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + line + '</div></div>' +
  '<span style="width: 40px; height: 44px; flex: none; display: grid; place-items: center; color: ' + L.icon + ';">' + svg(IC.chev, 18, 2.2) + '</span></div>';
const toastTitle = 'The room ran hot overnight', toastLine = 'and 3 more notes for Farrowing 3';
const farrowToast3 = (k) => farrowBase + agentToast(LOOK[k], toastTitle, toastLine);

// the note format: whole-room and whole-task lines run full width with no badge; pen lines keep the pen badge
const wide = (text, first) => '<div style="padding: 13px 0; border-top: ' + (first ? '0' : '1px solid #e8eddf') + '; font-size: 16px; line-height: 23px;">' + text + '</div>';
const penLine = (penT, text) => '<div style="display: flex; gap: 12px; padding: 13px 0; border-top: 1px solid #e8eddf;"><div style="flex: none; width: 32px; padding-top: 1px;">' + pen(penT) + '</div><div style="flex: 1; font-size: 16px; line-height: 23px;">' + text + '</div></div>';
const L3 = LOOK.B;
// a drawer in the house pattern of the pen note (tint sheet, centred title, white card, Back footer); the card's byline carries the agent
const notesSheet = (title, sub, byline, items, top) => '<div style="position: absolute; inset: 0; background: rgba(20,24,19,.32);"></div><div style="position: absolute; left: 0; right: 0; top: ' + top + 'px; bottom: 0; background: ' + PH.bg + '; border-radius: 24px 24px 0 0; overflow: hidden;">' +
  '<div style="width: 40px; height: 4px; border-radius: 2px; background: #c7cebe; margin: 10px auto 0;"></div>' +
  '<div style="text-align: center; padding: 12px 18px 12px; border-bottom: 1px solid ' + PH.line + ';"><div style="font-size: 20px; font-weight: 600;">' + title + '</div><div style="font-size: 13px; color: ' + PH.muted + '; margin-top: 3px;">' + sub + '</div></div>' +
  '<div style="margin: 16px 18px 0; background: #fff; border: 1px solid ' + PH.line + '; border-radius: 16px; padding: 14px 16px 2px;">' +
  '<div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: ' + PH.muted + '; padding-bottom: 4px;">' + disc(L3, 24) + '<b style="color: ' + PH.ink + '; font-weight: 700;">General Manager</b>&middot; ' + byline + '</div>' + items + '</div>' +
  '<div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 18px 26px; background: #fff; border-top: 1px solid ' + PH.line + ';"><div style="height: 56px; border-radius: 14px; border: 1px solid #b6c0ad; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 16px; font-weight: 600;">' + svg(IC.back, 16, 2.2) + 'Back</div></div></div>';
const farrowNotes = farrowBase + notesSheet('Notes for this task', 'Farrowing 3', 'today 05:30',
  wide('The room ran hot overnight, 29&nbsp;&deg;C at 03:00. <b>Check every sow is drinking.</b>', true) +
  wide('You&rsquo;re 2 days late on fostering checks here. <b>Do them after this count.</b>') +
  penLine('B1', pig('000418') + ' lost 5 yesterday. <b>Check the heat lamp before you count again.</b>') +
  penLine('B2', pig('000392') + ' is due tomorrow and off her feed since last night. <b>Look at her first.</b>'), 268);
const walkNotes = walkBase + notesSheet('Notes for this task', 'Gestation 2 &middot; walk-through', 'today 05:30',
  wide('Gestation 2 ran hot overnight. <b>Check the drinkers in every pen as you go.</b>', true) +
  penLine('C1', '<b>Score</b> ' + pig('000267') + ' and ' + pig('000281') + '. It&rsquo;s the usual record on each pig.') +
  penLine('C2', pig('000306') + ' had a fever yesterday: <b>take her temperature again.</b> <b>Score</b> her and ' + pig('000312') + '.'), 330);

// where the notes live: three spots in the Farrowing task page, all in the agent's tint
const chev = (c) => '<span style="width: 40px; height: 44px; flex: none; display: grid; place-items: center; color: ' + c + ';">' + svg(IC.chev, 18, 2.2) + '</span>';
const withInsert = (src, at, dy, ins, extra) => '<div style="position: absolute; left: 0; top: 0; width: 390px; height: ' + FOOT + 'px; overflow: hidden;">' + slice(src, 0, at, 0) + (extra || '') + slice(src, at, FOOT, dy) + ins + '</div>' + slice(src, FOOT, 844, 0);
const unitFix = fixLabel(FARROW, 52, 132, 110, 20, '<span style="font-size: 13px; color: ' + PH.muted + ';">Farrowing 3</span>');
// V1 · a row under the summary card
const spotRow = '<div style="position: absolute; left: 18px; right: 18px; top: 264px; height: 60px; box-sizing: border-box; background: ' + L3.box + '; border-radius: 16px; box-shadow: inset 0 0 0 1px ' + L3.line + '; display: flex; align-items: center; gap: 12px; padding-left: 14px;">' + disc(L3, 30) +
  '<div style="flex: 1; min-width: 0;"><div style="font-size: 15px; font-weight: 700; color: ' + L3.title + ';">4 notes for this task</div><div style="font-size: 13px; color: ' + L3.sub + '; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">The room ran hot overnight</div></div>' + chev(L3.icon) + '</div>';
const spotV1 = withInsert(FARROW, 258, 72, spotRow, unitFix);
// V2 · a section in the list, above the first pen, in the pen sections' own shape (header line, then a row)
const spotSection = '<div style="position: absolute; left: 18px; right: 18px; top: 336px; box-sizing: border-box; background: #fff; border-radius: 16px; box-shadow: inset 0 0 0 1px ' + PH.line + '; overflow: hidden;">' +
  '<div style="height: 44px; display: flex; align-items: center; gap: 8px; padding: 0 14px; background: ' + L3.box + '; border-bottom: 1px solid ' + L3.line + ';">' + svg(IC.spark, 16, 1.9, L3.disc) + '<span style="font-size: 14px; font-weight: 700; color: ' + L3.title + ';">For this task</span></div>' +
  '<div style="display: flex; align-items: center; padding: 10px 0 10px 14px;"><div style="flex: 1; font-size: 15px; line-height: 22px;">The room ran hot overnight, 29&nbsp;&deg;C at 03:00. <b>Check every sow is drinking.</b></div>' + chev(PH.muted) + '</div></div>';
const spotV2 = withInsert(FARROW, 330, 132, spotSection, unitFix);
// V3 · the header button as a labelled chip (the page is untouched)
const spotChip = '<div style="position: absolute; left: 262px; top: 47px; width: 110px; height: 46px; box-sizing: border-box; border-radius: 14px; background: ' + L3.box + '; box-shadow: inset 0 0 0 1px ' + L3.line + '; display: flex; align-items: center; justify-content: center; gap: 7px; color: ' + L3.title + '; font-size: 15px; font-weight: 700;">' + svg(IC.spark, 18, 1.9, L3.disc) + 'Notes<span style="position: absolute; top: 7px; right: 8px; width: 8px; height: 8px; border-radius: 99px; background: ' + L3.disc + ';"></span></div>';
const spotV3 = farrowBase + spotChip;

// side cards: the two checks per row, the rules, the questions
const checks = (house, budget) => rc('The two checks', ['<b>House pattern:</b> ' + house, '<b>Attention budget:</b> ' + budget]);
const swatch = (k) => { const L = LOOK[k]; return '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;"><span style="width: 120px; height: 34px; border-radius: 10px; background: ' + L.box + '; box-shadow: ' + (L.line === 'none' ? 'none' : 'inset 0 0 0 1px ' + L.line) + '; display: flex; align-items: center; gap: 8px; padding-left: 8px; box-sizing: border-box; color: ' + L.title + '; font-size: 13px; font-weight: 700;">' + disc(L, 22) + k + '</span><span style="font-size: 14.5px; color: #3B4540;">' + L.name + '</span></div>'; };
const looksCard = '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px 12px;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">The agent&rsquo;s look: pick one</div>' + swatch('A') + swatch('B') + swatch('C') +
  '<ul style="margin: 8px 0 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + [
    '<b>I&rsquo;d pick B.</b> A sits on the same ink as the save toast and the Scan button right below it, so it still reads as the app talking. B and C read as someone else.',
    'Violet is free: not a status (green done, blue today, amber late, red act now) and not an action. It would be one new token, <code>agent</code>, used only for the agent: the toast, its spot in the task, the byline disc, and the dock&rsquo;s middle button.',
    'The shape is the Toast you already ruled for Scan (22 Oct): &#10005; at the left, the rest one door with a chevron, 18&nbsp;px from the edges, above the footer. It stays until closed; it never stacks.'].map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ul></div>';
const formatCard = rc('The note format: three kinds of line', [
  '<b>The room</b> (&ldquo;The room ran hot overnight&rdquo;) and <b>the task</b> (&ldquo;You&rsquo;re 2 days late on fostering checks here&rdquo;) run full width, no badge. They come first.',
  '<b>A pen</b> keeps its badge in the left column; the pig is named in the sentence. Pens follow in walking order.',
  'One line, one thing to do, in bold. Only what changes what you do today in this task; the room is already in the title, so a line never repeats it.',
  'The card&rsquo;s byline says who wrote it once; the lines don&rsquo;t.']);
const spotCard = '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px 12px;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Where the notes live: pick one</div><ul style="margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + [
  '<b>I&rsquo;d pick 6, the row.</b> It&rsquo;s always in view, says what the notes are about in one line, and stays out of the pen list. Closing the toast drops it into this row, so you see where it went.',
  '<b>7, the section</b> reads like the pens, but it scrolls away with the list and looks like one more pen.',
  '<b>7</b> has one door (the whole card), so its header carries no chevron and no count.', '<b>8, the chip</b> changes nothing on the page, but &ldquo;Notes&rdquo; is small and next to pen notes it&rsquo;s easy to confuse. The walk&rsquo;s header has no room for it beside History.',
  'All three open the same drawer (4). A task with nothing to say shows no spot. Pen and pig notes stay where they are, on the pen.'].map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ul></div>';
const qCard = '<div style="background: #fffbea; border-radius: 16px; box-shadow: 0 0 0 1px #efe3b0; padding: 22px 26px 12px;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Three questions still open from round 1</div><ol style="margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + [
  '<b>The agent&rsquo;s name on the phone:</b> &ldquo;General Manager&rdquo; (as on the console) or &ldquo;Assistant&rdquo; (today&rsquo;s phone word)? <i>I&rsquo;d use one name everywhere, General Manager, always with the sparkle so it isn&rsquo;t read as a person.</i>',
  '<b>Should a recorded task quietly tick itself in My day?</b> <i>I&rsquo;d say no: My day is the plan, not a tracker (your ruling); done shows on the console&rsquo;s week Schedule.</i>',
  '<b>Does the morning brief buzz the phone?</b> <i>I&rsquo;d buzz once, at the start of the person&rsquo;s shift, not at 05:30; notes inside tasks never buzz, they show when you open the task.</i>'].map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ol></div>';
const side = (...cards) => '<div style="flex: 1; max-width: 960px; display: flex; flex-direction: column; gap: 20px; padding-top: 168px;">' + cards.join('') + '</div>';
const row = (...items) => '<div style="display: flex; gap: 36px; align-items: flex-start;">' + items.join('') + '</div>';
const sectionHead = (t, p) => '<h2 style="margin: 0 0 6px; font-size: 22px; line-height: 30px; font-weight: 600; letter-spacing: -.015em;">' + t + '</h2><p style="margin: 0 0 22px; font-size: 15px; line-height: 23px; color: #5D665F; max-width: 2300px;">' + p + '</p>';

const r3 = '<h1 style="margin: 0; font-size: 30px; line-height: 38px; font-weight: 600; letter-spacing: -.025em;">Round 3: the agent&rsquo;s own look, notes about the whole room or task, and a place in the task where its notes live (mock-up)</h1><p style="margin: 8px 0 34px; font-size: 16px; line-height: 24px; color: #5D665F; max-width: 2300px;">After your three notes on round 2. The toast is how the agent&rsquo;s notes arrive; the spot in the task is where they live; the drawer is how they read. Built on the live phone screens from main (9 Nov, df82ba5d). Pick a look (1&ndash;3) and a spot (6&ndash;8).</p>' +
  sectionHead('The toast in the agent&rsquo;s own look', 'Same toast, same words, three looks. The first line is a whole-room note, so the format change shows here too.') +
  row(pf2('1 · A: ink, with the agent&rsquo;s mark', 'The system toast&rsquo;s ink with a violet disc. Closest to what&rsquo;s built; the only new colour is the disc.', farrowToast3('A')),
    pf2('2 · B: the agent&rsquo;s own tint (recommended)', 'A light violet box. It is not white like the cards and not ink like the Scan button under it, so it reads as the agent, not the page or an action.', farrowToast3('B')),
    pf2('3 · C: the agent&rsquo;s own deep colour', 'A deep violet box: the loudest of the three. Strong in sunlight, but a second dark block right above Scan.', farrowToast3('C')),
    side(looksCard, checks('the Toast&rsquo;s door-and-dismiss form you ruled on 22 Oct (Scan, &ldquo;No pig with this tag&rdquo;): &#10005; left, door right, above the footer.', 'first, that it&rsquo;s the agent (the look and the disc), then what it&rsquo;s about (the first note as the title). Cut: the agent&rsquo;s name and time (the drawer has them), the count as a title (&ldquo;4 things in&hellip;&rdquo; became the first note itself).'))) +
  '<div style="height: 56px;"></div>' + sectionHead('The note format: the room, the task, then pens', 'Opened from the toast or the spot. A drawer in the pen note&rsquo;s pattern: one white card, the agent&rsquo;s byline once, then the lines.') +
  row(pf2('4 · Farrowing 3: room, task and pen lines', 'A room line and a task line run full width with no badge; the two pen lines keep B1 and B2. Back closes it; nothing to confirm.', farrowNotes),
    pf2('5 · A walk: a room line and pen lines', 'Zhao Min&rsquo;s walk in Gestation 2. The heat is about every pen, so it&rsquo;s one line for the room, not a line per pen.', walkNotes),
    side(formatCard, checks('the pen note drawer (PR 314): tint sheet, centred title, one white card with the byline, Back in the footer. Round 2&rsquo;s white sheet with a big title is gone.', 'first, what to do (bold), then where (badge or the room) and which pig. Cut: a time per line, the agent&rsquo;s name per line, &ldquo;Got it&rdquo; (Back is enough), the room name inside the lines.'))) +
  '<div style="height: 56px;"></div>' + sectionHead('Where the notes live in the task: three spots', 'The task page as built, plus one spot marked as the agent&rsquo;s, in look B. Tapping it opens 4. Pen and pig notes stay on their pens; this is only the agent&rsquo;s notes for this task.') +
  row(pf2('6 · A row under the summary (recommended)', 'One row between the summary and the lens bar: how many notes and the first line. The list moves down by one row.', spotV1),
    pf2('7 · A section in the list', 'Above the first pen, in the pens&rsquo; own shape: a header line, then the first note. It scrolls with the list.', spotV2),
    pf2('8 · A labelled chip in the header', 'The page is untouched; the header gets one chip with a dot until the notes are read.', spotV3),
    side(spotCard, checks('the pen&rsquo;s &ldquo;Needs attention&rdquo; note row (PR 314) for the row; the pen sections for the section; Inspection&rsquo;s History button for the chip.', 'first, that the agent has something for this task; second, what about. Cut: the pen badges and the other lines (they&rsquo;re in the drawer), the header sparkle button from round 2 (the spot replaces it; say it once).'), qCard));

// ===== round 4 (9 Nov): B chosen. A generic daily toast; notes split by scope (the room / this task); only what the screens can't show. My day: whole jobs only. =====
Object.assign(IC, { unit: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', task: 'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6', line: 'M3 12h18M6 8v8M12 8v8M18 8v8' });
const LB = LOOK.B;
// 1 · the toast: a generic daily title; the second line names the two scopes
const toast4 = farrowBase + agentToast(LB, 'Today&rsquo;s notes', 'Farrowing 3 &middot; this room and this task');
// 2 · the drawer: one card per scope, each under its own heading on the tint; the agent named once in the sheet's subtitle
const scopeHead = (ic, t, sub) => '<div style="display: flex; align-items: center; gap: 8px; margin: 18px 22px 8px; font-size: 14px; font-weight: 600;">' + svg(IC[ic], 16, 1.8, PH.muted) + '<span>' + t + '</span><span style="font-weight: 400; color: ' + PH.muted + ';">&middot; ' + sub + '</span></div>';
const scopeCard = (items) => '<div style="margin: 0 18px; background: #fff; border: 1px solid ' + PH.line + '; border-radius: 16px; padding: 0 16px;">' + items + '</div>';
const scopedSheet = (top, place, room, task) => '<div style="position: absolute; inset: 0; background: rgba(20,24,19,.32);"></div><div style="position: absolute; left: 0; right: 0; top: ' + top + 'px; bottom: 0; background: ' + PH.bg + '; border-radius: 24px 24px 0 0; overflow: hidden;">' +
  '<div style="width: 40px; height: 4px; border-radius: 2px; background: #c7cebe; margin: 10px auto 0;"></div>' +
  '<div style="text-align: center; padding: 12px 18px 12px; border-bottom: 1px solid ' + PH.line + ';"><div style="font-size: 20px; font-weight: 600;">Today&rsquo;s notes</div><div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: ' + PH.muted + '; margin-top: 4px;">' + disc(LB, 18) + 'General Manager &middot; 05:30</div></div>' +
  scopeHead('unit', place, 'for anyone in this room') + scopeCard(room) +
  scopeHead('task', 'Farrowing', 'this task') + scopeCard(task) +
  '<div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 18px 26px; background: #fff; border-top: 1px solid ' + PH.line + ';"><div style="height: 56px; border-radius: 14px; border: 1px solid #b6c0ad; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 16px; font-weight: 600;">' + svg(IC.back, 16, 2.2) + 'Back</div></div></div>';
const roomLines = wide('Ran hot overnight, 29&nbsp;&deg;C at 03:00, and the sows in B1 to B4 ate less. <b>Check every sow is drinking.</b>', true);
const taskLines = penLine('B1', pig('000418') + ' lost 5 yesterday, all in the first hour. <b>Check the heat lamp before you count again.</b>').replace('border-top: 1px solid #e8eddf;', 'border-top: 0;') +
  penLine('B2', pig('000392') + ' is due tomorrow and off her feed since last night. <b>Look at her first.</b>');
const scoped4 = farrowBase + scopedSheet(252, 'Farrowing 3', roomLines, taskLines);
// 3 · where they live: the row under the summary, with the same generic name
const row4 = '<div style="position: absolute; left: 18px; right: 18px; top: 264px; height: 60px; box-sizing: border-box; background: ' + LB.box + '; border-radius: 16px; box-shadow: inset 0 0 0 1px ' + LB.line + '; display: flex; align-items: center; gap: 12px; padding-left: 14px;">' + disc(LB, 30) +
  '<div style="flex: 1; min-width: 0;"><div style="font-size: 15px; font-weight: 700; color: ' + LB.title + ';">Today&rsquo;s notes</div><div style="font-size: 13px; color: ' + LB.sub + '; margin-top: 2px;">This room and this task</div></div>' + chev(LB.icon) + '</div>';
const spot4 = withInsert(FARROW, 258, 72, row4, unitFix);

// 4 · My day with whole jobs: feeding is one job as the farm's feed line runs it, never split between people
const STOPS_W = [
  { place: 'Feed line 1', sub: 'All 10 rooms, one crank', at: '06:00', rows: [['feed', 'Feeding', 'Check last night&rsquo;s intake and set the rations in the feed page before you crank.']] },
  { place: 'Farrowing 3', time: '~2&frac12; h', rows: [['birth', 'Farrowing'], ['foster', 'Fostering checks']] },
  { place: 'Farrowing 2', at: '15:00', rows: [['dose', 'Pen-strep, evening']] }
];
const mydayW = mydayHead.replace(/about 5&frac12; h &middot; .*?from the General Manager/, '3 stops &middot; about 5 h') + '<div style="padding: 14px 18px 0 14px;">' + STOPS_W.map((s, i) => stopBlockB(s, i + 1, i === STOPS_W.length - 1)).join('') + '</div>';
// 5 · the same job when two people share it: one job on both phones, never two halves
const STOPS_S = [
  { place: 'Feed line 1', sub: 'All 10 rooms, with Wang Fang', at: '06:00', rows: [['feed', 'Feeding', 'One job for both of you. A room shows as fed on both phones as soon as either of you records it.']] },
  { place: 'Farrowing 3', time: '~2&frac12; h', rows: [['birth', 'Farrowing'], ['foster', 'Fostering checks']] },
  { place: 'Farrowing 2', at: '15:00', rows: [['dose', 'Pen-strep, evening']] }
];
const mydayS = mydayHead.replace(/about 5&frac12; h &middot; .*?from the General Manager/, '3 stops &middot; about 5 h') + '<div style="padding: 14px 18px 0 14px;">' + STOPS_S.map((s, i) => stopBlockB(s, i + 1, i === STOPS_S.length - 1)).join('') + '</div>';

const scopeRule = rc('B, scoped: what the agent says, and where', [
  '<b>The toast is generic and daily:</b> &ldquo;Today&rsquo;s notes&rdquo;, then the place and the two scopes. It no longer leads with one note.',
  '<b>Two scopes, two cards.</b> <b>This room</b> is for anyone working in Farrowing 3 today, whatever their task (heat, water, a fan); it shows in every task opened there and counts as read once read. <b>This task</b> is about the task&rsquo;s own pigs, by pen. An empty scope is absent.',
  '<b>Only what the screens and fixed rules can&rsquo;t catch.</b> No late tasks, due dates or counts: Home and the task page already show them. The agent adds the pattern behind them (ate less after a hot night; all 5 lost in the first hour).',
  'The row under the summary takes the same name, &ldquo;Today&rsquo;s notes&rdquo;, and opens the same drawer.']);
const jobsRule = rc('The middle ground for My day: the agent orders, it never allocates', [
  '<b>My day shows only jobs already yours,</b> each one whole. The agent puts them in order and adds notes; it never invents a job and never splits one into rooms per person. So no room can fall between two people.',
  '<b>A job&rsquo;s size comes from how the farm is set up, not from the agent.</b> If one crank on Line 1 feeds all 10 rooms, Feeding is one row. If the farm feeds by hand, room by room, it&rsquo;s a round with its rooms.',
  '<b>A job&rsquo;s own preparation stays in its page:</b> checking intake and setting rations come before the crank in the feed page, not as stops of their own. My day says it in one sentence at most.',
  '<b>Shared job:</b> both people see the same one job, and a room ticks for both as soon as either records it (task pages already work this way).',
  '<b>Who does what stays with the manager</b> on the console&rsquo;s Work schedule. The agent may suggest; a job with no one on it shows there, not on a phone.']);
const q4 = '<div style="background: #fffbea; border-radius: 16px; box-shadow: 0 0 0 1px #efe3b0; padding: 22px 26px 12px;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">For you to rule</div><ol style="margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + [
  '<b>The agent never splits or creates a job; it only orders yours.</b> Agree? <i>This is the rule that stops &ldquo;3 rooms for you, 2 for her, 5 for nobody&rdquo;.</i>',
  '<b>Do routine jobs like feeding stay in My day?</b> <i>I&rsquo;d keep them, as one whole row: they&rsquo;re usually the first trip of the day and set the order of the rest. The alternative is My day with only non-routine work.</i>',
  '<b>Where the notes live in the task:</b> 6 the row (drawn here), 7 a section in the list, or 8 a chip in the header? <i>I&rsquo;d keep the row.</i>',
  'Still open from round 1: the agent&rsquo;s name on the phone, auto-tick on record, and whether the morning brief buzzes.'].map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ol></div>';

const r4 = '<h1 style="margin: 0; font-size: 30px; line-height: 38px; font-weight: 600; letter-spacing: -.025em;">Round 4: B, scoped to this room and this task; and My day with whole jobs only (mock-up)</h1><p style="margin: 8px 0 34px; font-size: 16px; line-height: 24px; color: #5D665F; max-width: 2300px;">After your notes on round 3: B it is. The toast is a generic daily one; the notes split clearly into the room and the task, and say only what the screens and rules can&rsquo;t. Then the middle ground you asked for on My day, so the plan can never leave rooms unfed. Built on the live phone screens from main (df82ba5d).</p>' +
  sectionHead('B, scoped', 'The same task opened three ways: the toast arriving, the drawer opened, and the row that keeps it.') +
  row(pf2('1 · The toast: generic, daily', '&ldquo;Today&rsquo;s notes&rdquo;, then where and for what. Tap to open; &#10005; puts it in the row (3).', toast4),
    pf2('2 · Opened: the room, then the task', 'Two cards under their own headings. The room&rsquo;s note is for anyone in Farrowing 3 today; the task&rsquo;s notes are about its sows, by pen. No late-task line: Home shows that.', scoped4),
    pf2('3 · Where it stays: the row', 'The same name in the row under the summary. Pen and pig notes stay on their pens.', spot4),
    side(scopeRule, checks('the pen page&rsquo;s sections (an icon heading on the tint, a white card under it) for the two scopes; the task summary&rsquo;s own icons for room (grid) and task (page).', 'first, which scope a note is for; then what to do (bold). Cut: the late-task line (Home has it), the first note as the toast title, the agent&rsquo;s name on each card (once, in the subtitle).'))) +
  '<div style="height: 56px;"></div>' + sectionHead('My day: the middle ground', 'Detailed enough to set the order of the day, never so detailed that it divides a job. The agent orders the jobs you already have; it doesn&rsquo;t hand out rooms.') +
  row(pf2('4 · Feeding as one job', 'Sun Qing feeds the whole site: Line 1, one crank, all 10 rooms, one row. Checking intake and setting rations happen in the feed page first; the plan says so in one sentence.', mydayW),
    pf2('5 · A job shared by two', 'If Wang Fang feeds with her, both phones show the same one job, never 5 rooms each. A room shows as fed on both as soon as either records it.', mydayS),
    side(jobsRule, checks('round 2&rsquo;s stops (a place, a round, a return); the to-do list on Home for which jobs are yours; the console Work schedule for who does what.', 'first, the order of whole jobs and their times. Cut: rooms split per person, feeding prep as separate stops, the round&rsquo;s room chips when one line feeds them all.'), q4));
const html4 = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Agent notes, round 4</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Inter:wght@400..700&family=Plus+Jakarta+Sans:wght@400..800&display=swap" rel="stylesheet">\n<style>body{margin:0}</style>\n</helmet>\n' +
  '<div style="width: 3008px; padding: 44px 48px 60px; box-sizing: border-box; background: #F3F4F1; font-family: Geist, system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' + r4 +
  '</div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":3008,"height":2400}}\'>\nclass Component extends DCLogic {\n  renderVals() { return {}; }\n}\n</script>\n</body>\n</html>\n';
fs.writeFileSync(path.join(S, 'pub/project/AgentNotesR4.dc.html'), html4);
console.log('round 4 ok', Math.round(html4.length / 1024) + ' KB');

// ===== round 5 (9 Nov): notes live in My day only (task pages untouched); feeding is a plain line (nothing to record); walks are rounds with a row per room =====
// a row in a stop: opens its report when the agent has something to say, else the task itself; the note's first line sits under the name in the agent's hue
const noteLine = (t) => '<div style="display: flex; gap: 6px; align-items: flex-start; margin: -8px 14px 12px 56px; font-size: 13.5px; line-height: 19px; color: ' + LB.sub + ';"><span style="padding-top: 2px;">' + svg(IC.spark, 13, 1.9, LB.disc) + '</span><span>' + t + '</span></div>';
const row5 = (ic, name, o) => { o = o || {}; return '<div style="border-top: ' + (o.first ? '0' : '1px solid #e8eddf') + ';"><div style="display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 6px 0 14px;"><span style="width: 30px; height: 30px; flex: none; border-radius: 9px; background: ' + PH.soft + '; display: grid; place-items: center; color: ' + PH.ink + ';">' + svg(IC[ic], 17, 1.8) + '</span>' +
  '<span style="flex: 1; min-width: 0;"><span style="display: block; font-size: 16px; font-weight: 600;">' + name + '</span>' + (o.sub ? '<span style="display: block; font-size: 13px; color: ' + PH.muted + '; margin-top: 1px;">' + o.sub + '</span>' : '') + '</span>' +
  (o.plain ? '<span style="width: 14px;"></span>' : '<span style="width: 44px; height: 44px; display: grid; place-items: center; color: ' + PH.muted + ';">' + svg(IC.chev, 18, 2) + '</span>') + '</div>' + (o.note ? noteLine(o.note) : '') + (o.plain ? '<div style="height: 8px;"></div>' : '') + '</div>'; };
const stop5 = (s, n, last) => '<div style="display: flex; align-items: stretch; gap: 10px;">' +
  '<div style="width: 30px; flex: none; display: flex; flex-direction: column; align-items: center;"><span style="width: 30px; height: 30px; border-radius: 99px; display: grid; place-items: center; font-size: 14px; font-weight: 700; margin-top: 2px; ' + (n === 1 ? 'background: ' + PH.green + '; color: #fff; box-shadow: 0 0 0 5px #dcebdd;' : 'background: #fff; box-shadow: inset 0 0 0 2px #a3aa9f;') + '">' + n + '</span>' + (last ? '' : '<span style="flex: 1; width: 2px; background: #cdd5c3; margin-top: 4px;"></span>') + '</div>' +
  '<div style="flex: 1; min-width: 0; margin-bottom: 14px;"><div style="display: flex; align-items: center; gap: 8px; min-height: 34px; padding: 0 2px 6px;"><span style="flex: 1; min-width: 0;"><span style="display: block; font-size: 18px; font-weight: 700;">' + s.place + '</span>' + (s.sub ? '<span style="display: block; font-size: 13px; color: ' + PH.muted + '; margin-top: 1px;">' + s.sub + '</span>' : '') + '</span>' + (s.at ? clockChip(s.at) : '<span style="font-size: 14px; color: ' + PH.muted + ';">' + s.time + '</span>') + '</div>' +
  (s.body ? '<div style="background: #fff; border: 1px solid ' + PH.line + '; border-radius: 16px; overflow: hidden;">' + s.body + '</div>' : '') + '</div></div>';
const STOPS5 = [
  { place: 'Feeding', sub: 'Feed line 1 &middot; all 10 rooms', at: '06:00' },
  { place: 'Inspection walk', sub: '2 rooms, in walking order', at: '06:30', body: row5('walk', 'Gestation 1', { first: true }) + row5('walk', 'Gestation 2', { note: '000306 had a fever yesterday; the room ran hot' }) },
  { place: 'Farrowing 3', time: '~2&frac12; h', body: row5('birth', 'Farrowing', { first: true, note: 'Ran hot overnight; look at 000392 in B2 first' }) + row5('foster', 'Fostering checks') }
];
const myday5 = mydayHead.replace(/about 5&frac12; h &middot; .*?from the General Manager/, '3 stops &middot; about 5 h') + '<div style="padding: 14px 18px 0 14px;">' + STOPS5.map((s, i) => stop5(s, i + 1, i === STOPS5.length - 1)).join('') + '</div>';
// the report: a page between My day and the task; the agent's notes for that room and task, then the way into the task
const report = (title, sub, open, room, task, taskLabel) => status +
  '<div style="display: flex; align-items: center; gap: 12px; padding: 3px 18px 0;"><span style="width: 48px; height: 48px; flex: none; border-radius: 14px; background: #fff; border: 1px solid ' + PH.line + '; display: grid; place-items: center;">' + svg(IC.back, 20, 2) + '</span><div><div style="font-size: 22px; font-weight: 600; letter-spacing: -.02em;">' + title + '</div><div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: ' + PH.muted + '; margin-top: 2px;">' + disc(LB, 16) + 'General Manager &middot; 05:30</div></div></div>' +
  '<div style="height: 6px;"></div>' + scopeHead('unit', title, 'this room') + scopeCard(room) + scopeHead('task', taskLabel, 'this task') + scopeCard(task) +
  '<div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 18px 26px; background: #fff; border-top: 1px solid ' + PH.line + ';"><div style="height: 56px; border-radius: 14px; background: ' + PH.ink + '; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600;">' + open + '</div></div>';
const firstLine = (s) => s.replace('border-top: 1px solid #e8eddf;', 'border-top: 0;');
const reportFarrow = report('Farrowing 3', 'Farrowing', 'Open Farrowing', roomLines, taskLines, 'Farrowing');
const reportWalk = report('Gestation 2', 'Inspection', 'Open the walk',
  wide('Ran hot overnight. <b>Check the drinkers in every pen as you go.</b>', true),
  firstLine(penLine('C1', '<b>Score</b> ' + pig('000267') + ' and ' + pig('000281') + '. It&rsquo;s the usual record on each pig.')) +
  penLine('C2', pig('000306') + ' had a fever yesterday: <b>take her temperature again.</b>'), 'Inspection');

const rule5 = rc('Round 5: the notes live in My day; the task pages stay as built', [
  '<b>One way in for the agent&rsquo;s notes:</b> My day. A row with something to say shows its first line under the task name, in the agent&rsquo;s violet; tapping it opens the report, then <b>Open Farrowing</b> takes you into the task. A row with nothing to say opens the task straight away.',
  '<b>The report keeps round 4&rsquo;s scopes:</b> this room (for anyone in it today), then this task (its pigs, by pen). Only what the screens and rules can&rsquo;t show.',
  '<b>Nothing in the task pages:</b> no toast, no row, no header button. They stay exactly as built.',
  '<b>Feeding is a plain line,</b> not a task: it has no record, so it has no card and opens nothing. It keeps its time so the day reads in order.']);
const walk5 = rc('Walks: a round with a row per room', [
  'Pen walks, inspections and walk-throughs are one kind of stop: <b>a round</b>. One card, named after the task (&ldquo;Inspection walk&rdquo;), with its rooms as rows in walking order.',
  'Each room row opens that room&rsquo;s walk (Inspection&rsquo;s page per unit, as built), so the rooms are rows, not round 2&rsquo;s small chips: each one is a door and needs the full 44&nbsp;pt.',
  'The agent&rsquo;s notes sit on the room they&rsquo;re about; its report for a room is the same page as for any task (frame 3).']);
const q5 = '<div style="background: #fffbea; border-radius: 16px; box-shadow: 0 0 0 1px #efe3b0; padding: 22px 26px 12px;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">For you to rule</div><ol style="margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 22px; color: #3B4540;">' + [
  '<b>A task opened from Home&rsquo;s to-do list shows no notes,</b> since they live only in My day. OK? <i>I&rsquo;d accept it: the morning brief and the Your day card on top of Home are the way in each morning, and the task pages stay clean.</i>',
  '<b>A walk is a round with a row per room</b> (frame 1, stop 2). Agree?',
  '<b>The agent orders and never splits or creates a job</b> (round 4). Agree?',
  'Still open from round 1: the agent&rsquo;s name on the phone, auto-tick on record, and whether the morning brief buzzes.'].map((x) => '<li style="margin-bottom: 8px;">' + x + '</li>').join('') + '</ol></div>';

const r5 = '<h1 style="margin: 0; font-size: 30px; line-height: 38px; font-weight: 600; letter-spacing: -.025em;">Round 5: the agent&rsquo;s notes live in My day; feeding is a plain line; walks are rounds (mock-up)</h1><p style="margin: 8px 0 34px; font-size: 16px; line-height: 24px; color: #5D665F; max-width: 2300px;">After your notes on round 4: feeding has nothing to record, so it isn&rsquo;t a task; walks need a shape; and the notes come out of the task pages. You tap Farrowing in My day, read the report, then open the task. The task pages are the live ones from main (df82ba5d), untouched.</p>' +
  row(pf2('1 · My day', 'Feeding is a line of text with its time: no card, nothing to open. The Inspection walk is one card with a row per room. Rows with notes show the first line in violet.', myday5),
    pf2('2 · Tap Farrowing: the report', 'This room, then this task, as in round 4. <b>Open Farrowing</b> goes into the task page; the header&rsquo;s back returns to My day.', reportFarrow),
    pf2('3 · Tap Gestation 2: the walk&rsquo;s report', 'The same page for a walk: the room&rsquo;s note, then the pigs to score and check, by pen. <b>Open the walk</b> goes into Inspection.', reportWalk),
    side(rule5, walk5, checks('My day&rsquo;s stops (rounds 2 and 4) for the rows; round 4&rsquo;s scoped drawer for the report, now a page with the live header (square back, title, one dark button in the footer).', 'first, the order of the day; second, which rows have something to read (the violet line). Cut: the toast, the row and the header button inside task pages; feeding&rsquo;s card and task page; the task name repeated in the report&rsquo;s header; round 2&rsquo;s room chips.'), q5));
const html5 = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Agent notes, round 5</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Inter:wght@400..700&family=Plus+Jakarta+Sans:wght@400..800&display=swap" rel="stylesheet">\n<style>body{margin:0}</style>\n</helmet>\n' +
  '<div style="width: 3008px; padding: 44px 48px 60px; box-sizing: border-box; background: #F3F4F1; font-family: Geist, system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' + r5 +
  '</div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":3008,"height":1300}}\'>\nclass Component extends DCLogic {\n  renderVals() { return {}; }\n}\n</script>\n</body>\n</html>\n';
fs.writeFileSync(path.join(S, 'pub/project/AgentNotesR5.dc.html'), html5);
console.log('round 5 ok', Math.round(html5.length / 1024) + ' KB');
