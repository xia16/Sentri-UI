// ===== v3: built for many steps; hover is one line =====
// one segment per dose (or per round for a pen); a pen's round splits given and skipped inside its segment
const SEGC = { done: DM, skip: LM, due: PM, plan: HANDLE };
const segBar = (steps) => '<div style="display: flex; gap: 2px; height: 10px; margin: 10px 0 6px;">' + steps.map((s) => Array.isArray(s) ? '<span style="flex: 1; display: flex; border-radius: 3px; overflow: hidden;"><i style="flex: ' + s[0] + '; background: ' + DM + ';"></i><i style="flex: ' + s[1] + '; background: ' + LM + ';"></i></span>' : '<i style="flex: 1; border-radius: 3px; background: ' + SEGC[s] + ';' + (s === 'due' ? ' box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 3.5px ' + PM + ';' : '') + '"></i>').join('') + '</div>';
const keyRow = (items) => '<div style="display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 8px; font-size: 12px; color: ' + K.muted + ';">' + items.map((x) => '<span style="display: inline-flex; align-items: center; gap: 5px;"><i style="width: 8px; height: 8px; border-radius: 2px; background: ' + x[0] + ';"></i>' + x[1] + ' <b style="font-weight: 600; color: ' + K.ink + ';">' + x[2] + '</b></span>').join('') + '</div>';
const ends = (a, b) => '<div style="display: flex; justify-content: space-between; font-size: 11.5px; color: ' + K.muted + ';"><span>' + a + '</span><span>' + b + '</span></div>';
const course = (drug, now, side, steps, a, b, keys, foot) => card2(mu(drug, { display: 'block', fontSize: '12.5px' }) + '<div style="display: flex; align-items: baseline; justify-content: space-between; margin-top: 8px;">' + t(now, { fontSize: '15px', fontWeight: 600 }) + mu(side, { fontSize: '12.5px' }) + '</div>' + segBar(steps) + ends(a, b) + keyRow(keys) +
  (foot ? '<div style="display: flex; align-items: center; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid ' + K.line + ';">' + ic(SHIELD, 15, 1.8, K.muted) + mu(foot, { fontSize: '12.5px', whiteSpace: 'normal' }) + '</div>' : ''));
// a run of routine entries folds into one line; exceptions stand alone
const fold = (n) => chipT('Show ' + n + ' ' + ic(I.chev, 12, 2).replace('width: 12px', 'width: 12px; transform: rotate(90deg)'));

const d41b = () => paneSlim(backHead('Treatment RX-25G009'),
  who('D41 · 205901', 'Sow · P4 · Pen D41', I.pig, openProfile) +
  course('Amoxicillin 15% LA · 15 mL, every 24 h', 'Dose 2 of 3 due 08:30', '1 skipped', ['skip', 'due', 'plan'], 'Thu', 'Sat', [[DM, 'Given', 0], [LM, 'Skipped', 1], [PM, 'Due', 1], [HANDLE, 'Planned', 1]], 'Withdrawal ends 21 Nov, if dose 3 is on Sat') +
  sec('Log') + card2(logT([
    { day: 'Wed', time: '16:10', col: NM, title: 'Prescribed · 3 doses', who: ['VT', '#DDF1EF', '#1F6F68'], chips: [chipT('Lameness'), chipT('Fever 40.1 °C')] },
    { day: 'Thu', time: '08:40', col: LM, title: 'Dose 1 skipped', who: ['GH'], chips: [chipT('Could not stand')] }
  ]), '6px 14px'));
// a long course: 14 doses, twice a day for a week
const long = ['done', 'done', 'done', 'done', 'skip', 'done', 'done', 'done', 'due', 'plan', 'plan', 'plan', 'plan', 'plan'];
const c30 = () => paneSlim(backHead('Treatment RX-25G014'),
  who('C30 · 207118', 'Sow · P2 · Pen C30', I.pig, openProfile) +
  course('Penicillin · 10 mL, twice a day for 7 days', 'Dose 9 of 14 due 08:00', '1 skipped', long, 'Mon', 'Sun', [[DM, 'Given', 7], [LM, 'Skipped', 1], [PM, 'Due', 1], [HANDLE, 'Planned', 5]], 'Withdrawal ends 28 Nov, if the course ends Sun') +
  sec('Log') + card2(logT([
    { day: 'Mon', time: '07:50', col: NM, title: 'Prescribed · 14 doses', who: ['VT', '#DDF1EF', '#1F6F68'], chips: [chipT('Mastitis')] },
    { day: 'Mon–Wed', time: '', col: DM, title: 'Doses 1–4 given', who: ['GH'], chips: [chipT('08:00 and 20:00'), fold(4)] },
    { day: 'Wed', time: '20:10', col: LM, title: 'Dose 5 skipped', who: ['LW'], chips: [chipT('Off feed, vet called')] },
    { day: 'Thu–Fri', time: '', col: DM, title: 'Doses 6–8 given', who: ['GH'], chips: [fold(3)] }
  ]), '6px 14px'));
// a pen by rounds, the same bar: each round splits given and skipped
const b12b = () => paneSlim(backHead('Treatment RX-25G011'),
  who('Pen B12', '9 weaners · Nursery 1', PEN2) +
  course('Florfenicol · 1 mL each, once a day for 3 days', 'Day 3 of 3 due today', '9 weaners', [[9, 0], [7, 2], 'due'], 'Wed', 'Fri', [[DM, 'Given', 16], [LM, 'Skipped', 2], [PM, 'Due', 9]]) +
  sec('Log') + card2(logT([
    { day: 'Wed–Thu', time: '', col: DM, title: 'Days 1–2: 16 given', who: ['GH'], chips: [fold(2)] },
    { day: 'Thu', time: '08:14', col: LM, title: 'Day 2: 2 skipped', who: ['GH'], chips: [chipT('Could not catch'), chipT('310422 ›'), chipT('1 untagged')] }
  ]), '6px 14px'));
// hover: who, and the one state line
const hovOne = (x, y, head, glyph, line) => card({ left: x + 'px', top: y + 'px' }, '<div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px 9px;">' + t(head, { fontSize: '12.5px', fontWeight: 600, color: K.muted }) + '<span style="display: inline-flex; align-items: center; gap: 7px;">' + glyph + t(line, { fontSize: '14px', fontWeight: 600 }) + '</span></div>');

frames.r1 = { bg: 'tx', cap: 'Hover is one glance: who, and where she is in this treatment. Anything more is one click away.', html: () => tabsStrip('Farm view') + fbar() + rxPane2() + vctl + hovOne(452, 434, 'D41 · 205901', mini('due'), 'Dose 2 due 08:30') };
frames.r2 = { bg: 'tx', cap: 'Click D41: one segment per dose, so the same bar works for 3 doses or 30. Above it the one line that matters; below it the counts. The log holds only what was recorded in this treatment.', html: () => tabsStrip('Farm view') + fbar() + vctl + d41b() };
frames.r3 = { bg: 'tx', cap: 'A long course, 14 doses: the bar still reads in one look. Routine runs of given doses fold into one line (Show 4); a skip always stands on its own with its reason.', html: () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G014') + fbar() + vctl + c30() };
frames.r4 = { bg: 'zb12', cap: 'A group pen, the same bar by rounds: each day splits given and skipped inside its segment. The log names tagged pigs and counts the rest.', html: () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G011') + penBar('9', 'Pen B12') + vctl + b12b() };
