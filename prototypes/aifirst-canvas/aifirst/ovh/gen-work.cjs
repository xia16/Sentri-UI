// Work schedule: Sentri suggests each person's day (order, morning and afternoon); each person adjusts their own. Mock-up board.
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const S = __dirname;
const K = { ink: '#1c1917', muted: '#57534e', faint: '#a8a29e', line: '#efeeec', line2: '#f1f0ee', page: '#f5f5f4', green: '#28734F', card: '#e7e5e4',
  doneI: '#28734F', nowF: '#EAF1FC', nowI: '#3972B7', lateI: '#B34B43', amberF: '#FCF4E2', amberI: '#7A5410', amberB: '#EBD9AE' };
const st = (o) => Object.entries(o).map(([k, v]) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ': ' + v).join('; ');
const CHECK = (c, w) => '<svg viewBox="0 0 24 24" style="width: ' + (w || 13) + 'px; height: ' + (w || 13) + 'px; flex: none; fill: none; stroke: ' + c + '; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round;"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const CHEV = (d) => '<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><path d="' + (d < 0 ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6') + '"/></svg>';
const X = '<svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round;"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const SPARK = '<svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M6.3 17.7l2.4-2.4M15.3 8.7l2.4-2.4"/></svg>';
const GRIP = (c) => '<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: ' + c + ';"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';

// ---------- the farm's people and today's jobs (Thu 5 Nov, 09:20) ----------
// state: d done, n now, x to do; late: carried over
const P = [
  { ini: 'LW', bg: '#FDE7C2', fg: '#6B4300', name: 'Li Wei', role: 'Farrowing manager', load: [7.7, 8],
    am: [['d', 'Walk-through', 'Farrowing 1–4'], ['n', 'Fostering checks', '8 litters · Farrowing 2'], ['x', 'A5 and B10', 'From Wed · Farrowing 2', 'late']], pm: [['x', 'Ready for farrowing', 'B33 · Farrowing 1']] },
  { ini: 'LY', bg: '#E4ECF7', fg: '#2B4A73', name: 'Liu Yang', role: 'Farrowing technician', load: [7.2, 8],
    am: [['d', 'Feeding', 'Farrowing 1 and 2'], ['n', 'Piglet processing', 'B32 · 34 piglets']], pm: [['x', 'Second feed', 'Farrowing 1 and 2'], ['x', 'Get ready to wash', 'Farrowing 3']] },
  { ini: 'SQ', bg: '#EDE7F6', fg: '#4B3577', name: 'Sun Qing', role: 'Farrowing technician', load: [5.5, 8],
    am: [['d', 'Feeding', 'Farrowing 3 and 4'], ['d', 'Pen-strep, morning', '6 piglets · Farrowing 2']], pm: [['x', 'Second feed', 'Farrowing 3 and 4'], ['x', 'Pen-strep, evening', '6 piglets · Farrowing 2']] },
  { ini: 'WF', bg: '#E2F0DA', fg: '#203D2B', name: 'Wang Fang', role: 'Nursery manager', load: [6.5, 8],
    am: [['d', 'Walk-through', 'Nursery 1 and 2'], ['n', 'PRRS vaccine', '3 weaners · Nursery 1']], pm: [['x', 'Weigh', 'B30 · Nursery 1']] },
  { ini: 'ZM', bg: '#F3E8F7', fg: '#5B2D6E', name: 'Zhao Min', role: 'Gestation lead', load: [6.8, 8],
    am: [['d', 'Heat check', 'B35 · Gestation 1'], ['n', 'Amox, dose 2', '4 sows · Gestation 2']], pm: [['x', 'Walk-through', 'Gestation 1–3']] },
  { ini: 'ML', bg: '#E6F1EE', fg: '#1F5A50', name: 'Ma Lin', role: 'Gestation technician', load: [7.0, 8],
    am: [['d', 'Feeding', 'Gestation 1–3'], ['x', 'Body condition', 'B34 · Gestation 1']], pm: [['x', 'Second feed', 'Gestation 1–3']] },
  { ini: 'GF', bg: '#FBE5E3', fg: '#A23B33', name: 'Gao Feng', role: 'Maintenance', load: [5.0, 8],
    am: [['n', 'Water line B', 'Gestation 2']], pm: [['x', 'Heat lamps', 'Farrowing 2']] }
];

// ---------- console ----------
const job = (j, o) => { o = o || {}; const done = j[0] === 'd', now = j[0] === 'n', late = j[3] === 'late';
  return '<div style="' + st({ flex: '1 1 0', minWidth: 0, maxWidth: '200px', height: '54px', boxSizing: 'border-box', padding: '0 10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px',
    background: o.ghost ? 'transparent' : now ? K.nowF : done ? '#FAFAF9' : '#fff', boxShadow: o.ghost ? 'none' : now ? 'inset 0 0 0 1.5px ' + K.nowI : o.lift ? '0 10px 26px rgba(28,25,23,.22), 0 0 0 1px ' + K.card : 'inset 0 0 0 1px ' + K.card,
    border: o.ghost ? '1.5px dashed #b9b4ae' : '0', transform: o.lift ? 'rotate(-1.5deg)' : 'none', opacity: o.dim ? 0.35 : 1 }) + '">' +
    (o.ghost ? '' : '<div style="display: flex; align-items: center; gap: 5px; min-width: 0;">' + (done ? CHECK(K.doneI, 12) : '') + '<span style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ' + (now ? K.nowI : done ? K.muted : K.ink) + ';">' + j[1] + '</span></div>' +
    '<span style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ' + (late ? K.lateI : K.muted) + ';">' + j[2] + '</span>') + '</div>'; };
const GRID = 'display: grid; grid-template-columns: 214px minmax(0, 1.5fr) minmax(0, 1fr) 118px;';
const loadCell = (l) => { const pct = Math.min(100, l[0] / l[1] * 100), h = Math.floor(l[0]), m = Math.round((l[0] - h) * 60);
  return '<div style="display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 0 18px 0 14px;"><span style="font-size: 12.5px; color: ' + K.muted + '; white-space: nowrap;"><b style="color: ' + K.ink + '; font-weight: 600; font-variant-numeric: tabular-nums;">' + h + ' h' + (m ? ' ' + m : '') + '</b> of ' + l[1] + ' h</span><span style="height: 4px; border-radius: 2px; background: #EDECEA; overflow: hidden;"><span style="display: block; height: 100%; width: ' + pct + '%; background: #A8A29E;"></span></span></div>'; };
const personRow = (p, o) => { o = o || {};
  const half = (list, k) => '<div style="display: flex; align-items: center; gap: 6px; padding: 0 8px; border-left: 1px solid ' + K.line2 + '; min-width: 0;">' + list.map((j, i) => job(j, (o[k] || {})[i])).join('') + (o[k + 'Extra'] || '') + '</div>';
  return '<div style="' + GRID + ' height: 74px; border-bottom: 1px solid ' + K.line2 + '; background: ' + (o.hl ? '#FBFAF7' : 'transparent') + ';">' +
    '<div style="display: flex; align-items: center; gap: 10px; padding-left: 18px; min-width: 0;"><span style="width: 32px; height: 32px; flex: none; border-radius: 99px; background: ' + p.bg + '; color: ' + p.fg + '; display: grid; place-items: center; font-size: 12px; font-weight: 600;">' + p.ini + '</span><span style="display: flex; flex-direction: column; gap: 2px; min-width: 0;"><span style="font-size: 13.5px; font-weight: 600; white-space: nowrap;">' + p.name + '</span><span style="font-size: 12px; color: ' + K.muted + '; white-space: nowrap;">' + p.role + '</span></span></div>' +
    half(p.am, 'am') + half(p.pm, 'pm') + loadCell(o.load || p.load) + '</div>' + (o.note || ''); };
const head = '<div style="display: flex; align-items: center; gap: 10px; padding: 18px 20px 14px 24px;">' +
  '<h2 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -.01em; margin-right: 10px;">Work schedule</h2>' +
  '<span style="height: 32px; padding: 0 11px; border: 1px solid #d6d3d1; background: #fff; border-radius: 9px; font-size: 13px; display: inline-flex; align-items: center;">Today</span>' +
  '<span style="display: inline-flex;">' + CHEV(-1) + '</span><span style="display: inline-flex;">' + CHEV(1) + '</span><b style="font-size: 14px; font-weight: 600;">Thu 5 Nov</b><span style="flex: 1;"></span>' +
  '<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: ' + K.muted + ';">' + SPARK + 'Suggested by Sentri at 05:30</span>' +
  '<span style="width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; color: ' + K.muted + '; margin-left: 10px;">' + X + '</span></div>';
const colHead = '<div style="' + GRID + ' height: 38px; border-bottom: 1px solid ' + K.line + '; font-size: 12px; font-weight: 600; color: ' + K.muted + ';"><div style="display: flex; align-items: center; padding-left: 18px;">7 people</div><div style="display: flex; align-items: center; padding-left: 12px; border-left: 1px solid ' + K.line2 + ';">Morning</div><div style="display: flex; align-items: center; padding-left: 12px; border-left: 1px solid ' + K.line2 + ';">Afternoon</div><div style="display: flex; align-items: center; padding-left: 14px;">Their day</div></div>';
const board = (rowsHtml) => '<div class="dim"></div><div style="' + st({ position: 'absolute', left: '100px', top: '110px', width: '1240px', paddingBottom: '16px', boxSizing: 'border-box', borderRadius: '18px', background: K.page, boxShadow: '0 28px 70px rgba(28,25,23,.30), 0 0 0 1px rgba(28,25,23,.08)', overflow: 'hidden', fontFamily: 'Inter, sans-serif', color: K.ink }) + '">' + head +
  '<div style="margin: 0 16px; background: #fff; border-radius: 14px; box-shadow: 0 1px 3px #1c19170f; overflow: hidden;">' + colHead + rowsHtml + '</div></div>';
const c1 = board(P.map((p) => personRow(p)).join(''));
// moving a job: Li Wei's A5 and B10 dragged onto Zhao Min's afternoon
const note = '<div style="display: flex; align-items: center; gap: 10px; margin: 0; padding: 10px 18px 10px 256px; background: ' + K.amberF + '; border-bottom: 1px solid ' + K.amberB + '; font-size: 13px; color: ' + K.amberI + ';"><span style="width: 18px; height: 18px; border-radius: 99px; background: #e8b33c; color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 700; flex: none;">!</span><span style="flex: 1;">Zhao Min would walk from Gestation 2 into Farrowing 2: sows&rsquo; rooms before piglets&rsquo; breaks clean to dirty. First thing in her afternoon, after a change of boots?</span><span style="font-weight: 600; white-space: nowrap; text-decoration: underline; text-underline-offset: 3px;">Put it first</span></div>';
const c2rows = P.map((p, i) => i === 0 ? personRow(p, { am: { 2: { dim: true } }, load: [6.9, 8] }) : i === 4 ? personRow(p, { hl: true, pmExtra: '<div style="position: relative; flex: 1 1 0; max-width: 200px; min-width: 0;">' + job(['x', 'A5 and B10', 'Wed · Farrowing 2', 'late'], { lift: true }) + '<svg viewBox="0 0 24 24" style="position: absolute; left: 92px; top: 6px; width: 22px; height: 22px;"><path d="M5 3l14 8-6 1.5L10 19z" fill="#1c1917" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg></div>', load: [7.6, 8], note: note }) : personRow(p)).join('');
const c2 = board(c2rows);

// ---------- phone ----------
const PH = { bg: '#f6f7f1', paper: '#fff', line: '#dfe4d8', ink: '#20291f', muted: '#657060', green: '#276640', prog: '#466888', progW: '#e9f0f6', doneM: '#5fae6e' };
const phone = (inner) => '<div style="width: 414px; height: 868px; border-radius: 62px; background: #111; padding: 12px; box-sizing: border-box; box-shadow: 0 20px 50px rgba(17,21,17,.25);"><div style="position: relative; width: 390px; height: 844px; border-radius: 50px; overflow: hidden; background: ' + PH.bg + '; font-family: Inter, sans-serif; color: ' + PH.ink + ';">' +
  '<div style="height: 54px; display: flex; align-items: center; justify-content: space-between; padding: 0 30px 0 36px; font-size: 16px; font-weight: 600;"><span>09:20</span><span style="width: 120px; height: 34px; border-radius: 20px; background: #111; position: absolute; left: 135px; top: 10px;"></span><span style="font-size: 13px;">●●● 5G</span></div>' + inner + '</div></div>';
const pHead = '<div style="padding: 6px 20px 14px;"><div style="display: inline-flex; align-items: center; gap: 2px; height: 36px; padding: 0 12px 0 6px; border-radius: 10px; border: 1px solid #b6c0ad; background: #fff; font-size: 14px; font-weight: 500;">' + CHEV(-1) + 'Home</div>' +
  '<h1 style="margin: 16px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -.02em;">My day</h1><div style="font-size: 14px; color: ' + PH.muted + '; margin-top: 4px;">Thu 5 Nov · suggested by Sentri</div></div>';
const pRow = (n, t, s, o) => { o = o || {}; return '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '64px', padding: '0 8px 0 16px', borderTop: o.first ? '0' : '1px solid #e8eddf', background: o.lift ? '#fff' : 'transparent', boxShadow: o.lift ? '0 12px 28px rgba(32,41,31,.22), 0 0 0 1px ' + PH.line : 'none', borderRadius: o.lift ? '12px' : '0', transform: o.lift ? 'scale(1.03)' : 'none', position: 'relative', zIndex: o.lift ? 2 : 0 }) + '">' +
  '<span style="width: 26px; height: 26px; border-radius: 99px; flex: none; display: grid; place-items: center; font-size: 13px; font-weight: 600; background: #eef1e7; color: ' + PH.muted + ';">' + n + '</span>' +
  '<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;"><span style="font-size: 15px; font-weight: 600;">' + t + '</span><span style="font-size: 13px; color: ' + (o.late ? '#98362b' : PH.muted) + ';">' + s + '</span></span>' +
  '<span style="width: 44px; height: 44px; display: grid; place-items: center;">' + GRIP(o.lift ? PH.ink : '#a3aa9f') + '</span></div>'; };
const pCard = (h) => '<div style="margin: 0 16px 12px; background: #fff; border: 1px solid ' + PH.line + '; border-radius: 16px; overflow: visible;">' + h + '</div>';
const lab = (t) => '<div style="padding: 10px 22px 8px; font-size: 13px; font-weight: 600; color: ' + PH.muted + ';">' + t + '</div>';
const nowCard = pCard('<div style="padding: 16px;"><div style="font-size: 13px; font-weight: 600; color: ' + PH.prog + ';">Now</div><div style="font-size: 19px; font-weight: 700; margin-top: 4px;">Piglet processing</div><div style="font-size: 14px; color: ' + PH.muted + '; margin-top: 3px;">B32 · 34 piglets · Farrowing 2</div>' +
  '<div style="height: 56px; margin-top: 16px; border-radius: 14px; background: ' + PH.green + '; color: #fff; font-size: 16px; font-weight: 600; display: grid; place-items: center;">Open</div></div>');
const doneRow = pCard('<div style="display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 0 16px;">' + CHECK(PH.doneM, 18) + '<span style="flex: 1; font-size: 15px; color: ' + PH.muted + ';">1 done · Feeding, Farrowing 1 and 2</span></div>');
const f3 = phone(pHead + doneRow + nowCard + lab('Afternoon') + pCard(pRow(2, 'Second feed', 'Farrowing 1 and 2', { first: true }) + pRow(3, 'Get ready to wash', 'Farrowing 3')) +
  '<div style="padding: 6px 22px; font-size: 13px; line-height: 19px; color: ' + PH.muted + ';">Hold <span style="display: inline-flex; vertical-align: middle;">' + GRIP('#a3aa9f') + '</span> to change the order. The to-do list doesn&rsquo;t change.</div>');
const f4 = phone(pHead + doneRow + nowCard + lab('Afternoon') + pCard(pRow(2, 'Get ready to wash', 'Farrowing 3', { first: true, lift: true }) + pRow(3, 'Second feed', 'Farrowing 1 and 2')) +
  '<div style="position: absolute; left: 20px; right: 20px; bottom: 34px; height: 52px; border-radius: 14px; background: ' + PH.ink + '; color: #fff; font-size: 14px; display: flex; align-items: center; padding: 0 16px; gap: 10px;">' + CHECK('#fff', 16) + '<span>Order changed. Li Wei can see it.</span></div>');

// ---------- board ----------
(async () => {
  const home = 'data:image/jpeg;base64,' + (await sharp(path.join(S, 'walk-s1-home.png')).jpeg({ quality: 80 }).toBuffer()).toString('base64');
  const fig = (w, title, cap, inner) => '<figure style="margin: 0; width: ' + w + 'px;"><figcaption style="font-size: 17px; font-weight: 600; margin-bottom: 6px;">' + title + '</figcaption><div style="font-size: 14.5px; line-height: 22px; color: #3B4540; margin-bottom: 14px; min-height: 66px;">' + cap + '</div>' + inner + '</figure>';
  const con = (over) => '<div style="position: relative; width: 1440px; height: 900px; border-radius: 14px; overflow: hidden; box-shadow: 0 0 0 1px #E2E5DE, 0 8px 28px rgba(17,21,17,.10); background: url(' + home + ') 0 0 / 1440px 900px no-repeat;">' + over + '</div>';
  const F1 = fig(1440, '1 · Console: everyone&rsquo;s day, as Sentri suggests it', 'Opens from Home&rsquo;s &ldquo;Your team today&rdquo;. One row a person: their jobs in order, morning then afternoon, and how full their day is. Done jobs go quiet with &#10003;; what each one is on now is blue. Nothing to approve: it is a suggestion, and the to-do lists do not change.', con(c1));
  const F2 = fig(1440, '2 · Console: move a job to someone else', 'Drag a job onto another person or into another place in their day. Sentri checks the move and says so in one line when it breaks a rule (here: clean to dirty), with the fix it would make. You can still drop it; the line stays until you change it or close it.', con(c2));
  const F3 = fig(414, '3 · Phone: My day', 'Its own page, from Home. What to do now in a card, then the rest in order. Open goes to the same task as the to-do list.', f3);
  const F4 = fig(414, '4 · Phone: change your own order', 'Hold the handle and drag. Only your own day; your manager sees the change.', f4);
  const checks = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 44px;">' +
    '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px; font-size: 15px; line-height: 23px; color: #3B4540;"><div style="font-size: 16px; font-weight: 600; color: #111511; margin-bottom: 8px;">House pattern</div>' +
    '<b>Console:</b> the sibling is the Schedule pop-up (when), so this is the same pop-up shell, grey page and one white card, with people as rows instead of tasks; the job blocks use the Schedule&rsquo;s colours (blue = now, &#10003; = done, red ink = carried over). It opens from Home&rsquo;s &ldquo;Your team today&rdquo;, which already says who is doing what. <b>Phone:</b> its own page beside the to-do list, on the tint with white cards (Surfaces rule), a 56 px Open button, rows with a drag handle.</div>' +
    '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px; font-size: 15px; line-height: 23px; color: #3B4540;"><div style="font-size: 16px; font-weight: 600; color: #111511; margin-bottom: 8px;">Attention budget</div>' +
    '<b>Manager at 09:20:</b> 1 is anyone overloaded or idle (their day, per row) &middot; 2 what is each person on now (blue) &middot; 3 what is left, in order &middot; 4 what is done (quiet). <b>Worker:</b> 1 what now &middot; 2 then what &middot; 3 can I change it.<br>' +
    '<b>Cut:</b> clock times on each job (only the order, morning or afternoon), clock-in times and phone numbers (the People page has them), why each job sits where it does (Sentri speaks only when a move breaks a rule).</div></div>';
  const rules = '<div style="width: 2012px; background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px; font-size: 15px; line-height: 23px; color: #3B4540; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 36px; align-content: start;">' +
    '<div style="grid-column: 1 / -1; font-size: 16px; font-weight: 600; color: #111511;">How it works (my calls, for you to react to)</div>' +
    ['<b>Suggested, never approved.</b> Sentri plans tomorrow overnight and again at 05:30 from who is in, the Schedule, each job&rsquo;s size and the rules. Nobody signs it off.',
     '<b>The rules Sentri plans by:</b> fit each shift; skills (who is trained for each job); whoever gave dose 1 gives dose 2; clean to dirty (piglets, nursery, then sows; the sick room last).',
     '<b>Who changes what:</b> everyone reorders their own day, on the phone or here. A manager can also move jobs between people in their team. The owner can move anything.',
     '<b>When the day goes wrong:</b> someone off sick or a job running long, and Sentri re-plans the rest of the day and says so in the team chat. Nothing lands in the Inbox.',
     '<b>One job, two people:</b> a big job can be split by room (Fostering checks: Farrowing 2 to Li Wei, Farrowing 3 to Liu Yang). Not drawn yet.',
     '<b>The to-do list is untouched:</b> it keeps every task a person can do; My day only puts theirs in order. Ticking a task in either place ticks it in both.'].map((x) => '<div>' + x + '</div>').join('') + '</div>';
  const html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Work schedule</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Inter:wght@400..700&display=swap" rel="stylesheet">\n<style>body{margin:0} .dim{position:absolute;inset:0;background:rgba(28,25,23,.34)}</style>\n</helmet>\n' +
    '<div style="width: 3008px; padding: 44px 48px 60px; box-sizing: border-box; background: #F3F4F1; font-family: Geist, system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' +
    '<h1 style="margin: 0; font-size: 30px; line-height: 38px; font-weight: 600; letter-spacing: -.025em;">Work schedule: everyone&rsquo;s day, suggested by Sentri (mock-up)</h1>' +
    '<p style="margin: 8px 0 30px; font-size: 16px; line-height: 24px; color: #5D665F; max-width: 1800px;">Sentri suggests who does which job today and in what order; each person adjusts their own day, in the console and on the phone. The Schedule (Home) stays about when; this is about who and in what order. Hillside Sow Farm, Thu 5 Nov, 09:20.</p>' +
    checks + '<div style="display: grid; grid-template-columns: 1440px 1440px; gap: 56px 32px;">' + F1 + F2 + '</div>' +
    '<div style="display: flex; gap: 32px; margin-top: 56px; align-items: flex-start;">' + F3 + F4 + '<div style="padding-top: 102px;">' + rules + '</div></div></div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":3008,"height":2400}}\'>\nclass Component extends DCLogic {\n  renderVals() { return {}; }\n}\n</script>\n</body>\n</html>\n';
  fs.writeFileSync(path.join(S, 'pub/project/WorkSchedule.dc.html'), html);
  console.log('board', Math.round(html.length / 1024) + ' KB');
})();
