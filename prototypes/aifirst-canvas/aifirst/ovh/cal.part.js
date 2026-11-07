// ===== a week calendar for any course: Mon–Sun across, a row per week, each day its doses as small circles (a pig) or rings (the whole task) =====
const mdot = (s, sz, hot) => '<span style="' + st({ display: 'inline-block', width: sz + 'px', height: sz + 'px', borderRadius: '99px', background: DOTC[s][0], boxShadow: [DOTC[s][1] === 'none' ? '' : DOTC[s][1].replace('2.5px', '2px'), hot ? '0 0 0 2px #FFFFFF, 0 0 0 3.5px ' + K.ink : ''].filter(Boolean).join(', ') || 'none', boxSizing: 'border-box' }) + '"></span>';
const mring = (g, a, d, n, hot) => { const C = 2 * Math.PI * 7, seg = (v, off, col) => v ? '<circle cx="10" cy="10" r="7" fill="none" stroke="' + col + '" stroke-width="4" stroke-dasharray="' + (C * v / n).toFixed(1) + ' ' + C.toFixed(1) + '" stroke-dashoffset="' + (-C * off / n).toFixed(1) + '" transform="rotate(-90 10 10)"></circle>' : ''; return '<svg viewBox="0 0 20 20" style="width: 20px; height: 20px;' + (hot ? ' border-radius: 99px; box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 3.5px ' + K.ink + ';' : '') + '"><circle cx="10" cy="10" r="7" fill="none" stroke="' + HANDLE + '" stroke-width="4"></circle>' + seg(g, 0, DM) + seg(a, g, LM) + seg(d, g + a, PM) + '</svg>'; };
// weeks: [label, [7 cells]]; a cell is null (no dose), an array of states (a pig), or {r:[g,a,d,n]} (a task ring); hot = [week, day, dose]
const cal = (weeks, hot, tipHead, tipLine) => {
  let h = '<div style="display: grid; grid-template-columns: 40px repeat(7, 1fr); row-gap: 6px; align-items: center; justify-items: center; margin-top: 10px;"><span></span>' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => t(d, { fontSize: '11px', color: K.muted })).join('');
  weeks.forEach((w, wi) => { h += t(w[0], { fontSize: '11px', color: K.muted, justifySelf: 'start' }); w[1].forEach((c, di) => {
    const isHot = (k) => hot && hot[0] === wi && hot[1] === di && (k == null || hot[2] === k);
    if (!c) h += '<span style="width: 6px; height: 6px; border-radius: 99px; background: #EEF0EA;"></span>';
    else if (c.r) h += mring(c.r[0], c.r[1], c.r[2], c.r[3], isHot());
    else { const sz = c.length > 1 ? 11 : 16; h += '<span style="display: inline-flex; gap: 3px;">' + c.map((s, k) => mdot(s, sz, isHot(k))).join('') + '</span>'; }
  }); });
  h += '</div>';
  const tip = hot ? '<div style="' + st(Object.assign({ position: 'absolute', top: 'calc(100% + 6px)', padding: '7px 10px', borderRadius: '10px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.08), 0 8px 22px rgba(17,21,17,.16)', whiteSpace: 'nowrap', zIndex: 3 }, hot[1] < 4 ? { left: 0 } : { right: 0 })) + '">' + t(tipHead, { display: 'block', fontSize: '13px', fontWeight: 600 }) + mu(tipLine, { display: 'block', fontSize: '12px' }) + '</div>' : '';
  return '<div style="position: relative;">' + h + tip + '</div>';
};
// the headline: one number, the dates quiet beside it
const bigHead = (n, of, dates) => '<div style="display: flex; align-items: baseline; gap: 6px;">' + t(String(n), { fontSize: '22px', lineHeight: '26px', fontWeight: 600 }) + mu('of ' + of + ' doses given', { fontSize: '13px' }) + '<span style="flex: 1;"></span>' + mu(dates, { fontSize: '12.5px' }) + '</div>';
const pigCal = (n, of, dates, weeks, hot, th, tl, chip) => card2(bigHead(n, of, dates) + cal(weeks, hot, th, tl) + (chip || ''));
const _ = null;

const d41e = () => paneSlim(backHead('Treatment RX-25G009'), who('D41 · 205901', 'Sow · P4 · Pen D41', I.pig, profBtn) +
  pigCal(0, 3, '5 – 7 Nov', [['2 Nov', [_, _, _, ['skip'], ['due'], ['plan'], _]]], [0, 3, 0], 'Dose 1 · Skipped', 'Thu 08:40 · could not stand · G.H', wChip('Withdrawal ends 21 Nov')));
// three weeks, twice a day: 42 doses
const D = ['done', 'done'], wk3 = [['2 Nov', [D, D, D, D, D, D, D]], ['9 Nov', [D, D, ['done', 'skip'], D, ['due', 'plan'], ['plan', 'plan'], ['plan', 'plan']]], ['16 Nov', Array(7).fill(['plan', 'plan'])]];
const c30e = () => paneSlim(backHead('Treatment RX-25G014'), who('C30 · 207118', 'Sow · P2 · Pen C30', I.pig, profBtn) +
  pigCal(19, 42, '2 – 22 Nov', wk3, [1, 2, 1], 'Wed 11 Nov PM · Skipped', '20:10 · off feed, vet called · L.W', wChip('Withdrawal ends 6 Dec')));
const p422e = () => paneSlim(backHead('Treatment RX-25G011'), who('310422', 'Weaner · Pen B12', I.pig, profBtn) +
  pigCal(1, 3, '4 – 6 Nov', [['2 Nov', [_, _, ['done'], ['skip'], ['skip'], _, _]]], [0, 3, 0], 'Thu 5 Nov · Skipped', '08:14 · could not catch · G.H', wChip('Withdrawal ends 25 Nov')));
// the task card: the same calendar, a ring per day across the sows
const rxFull3 = (top, hot) => { const h = paneSlim(theadC({ title: 'Treatment RX-25G009', sub: '4 sows · Batch 32 · Gestation 2' }),
  statusChips(['Running', 'Lameness', 'Fever']) +
  card2(bigHead(5, 12, '5 – 7 Nov') + cal([['2 Nov', [_, _, _, { r: [3, 1, 0, 4] }, { r: [2, 0, 2, 4] }, { r: [0, 0, 0, 4] }, _]]], hot, 'Thu 5 Nov · Dose 1', '3 given · 1 skipped')) +
  sec('Prescription') + factsBox([['Medicine', 'Amoxicillin 15% LA'], ['Dose', '15 mL a sow', 'Intramuscular, neck'], ['Schedule', '3 doses, every 24 h'], ['Withdrawal', '14 days', 'Ends 21 Nov, if the last dose is Sat'], ['Prescribed', 'Vet', 'Wed 4 Nov 16:10'], ['Note', 'Keep D40 and D41 on straw']]) +
  '<div style="display: flex; gap: 8px; margin-top: 12px;">' + fbtn(ic(SC2.ext, 15) + '&nbsp; Open page') + '</div>');
  return top === 'chips' ? under(h) : h; };

if (frames.r1) { frames.r1.html = () => tabsStrip('Farm view') + fbar() + rxFull3(null, [0, 3]) + vctl; frames.r1.cap = 'The task card: one number (5 of 12 doses given), then the course on a week calendar, a ring per day across the four sows. Hover a day for it; here Thursday, 3 given and 1 skipped. Then the prescription as set fields.'; }
if (frames.r2) { frames.r2.html = () => tabsStrip('Farm view') + fbar() + vctl + d41e(); frames.r2.cap = 'Click D41: one number (0 of 3 given) and her doses on the same calendar. The amber one is skipped; hover it for why.'; }
if (frames.r3) { frames.r3.html = () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G014') + fbar() + vctl + c30e(); frames.r3.cap = 'Three weeks, twice a day, 42 doses: a row per week, two small circles per day. Any length of course reads the same way.'; }
if (frames.p2) { frames.p2.html = () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G011') + penBar('9', 'Pen B12') + penSections(QB12, B12secs, { hot: '310422' }) + vctl + p422e(); }
if (frames.k1) { frames.k1.html = () => tabsStrip('Farm view') + fbar() + collapseOnly(rxFull3('chips')) + chipsR(two, 'rx') + vctl; }
if (frames.k4) { frames.k4.html = () => tabsStrip('Farm view') + fbar() + collapseOnly(rxFull3('chips')) + chipsR(two, 'rx', '+4', menu4) + vctl; }
if (frames.k5) { frames.k5.html = () => tabsStrip('Farm view') + fbar() + chipsR(two, 'rx') + vctl + collapseOnly(under(d41e())); }
