// ===== circles, not bars: one circle per dose, columns are days, rows are the day's doses; the headline is the whole course =====
const DOTC = { done: [DM, 'none'], skip: [LM, 'none'], due: ['#FFFFFF', 'inset 0 0 0 2.5px ' + PM], plan: ['#FFFFFF', 'inset 0 0 0 1.5px ' + HANDLE] };
const dot = (s, hot) => '<span style="' + st({ display: 'inline-block', width: '18px', height: '18px', borderRadius: '99px', background: DOTC[s][0], boxShadow: [DOTC[s][1] === 'none' ? '' : DOTC[s][1], hot ? '0 0 0 2px #FFFFFF, 0 0 0 3.5px ' + K.ink : ''].filter(Boolean).join(', ') || 'none', boxSizing: 'border-box' }) + '"></span>';
// grid: days across, doses per day down; hot = [col,row]; the tip sits under the grid, anchored to the nearer side
const doseGrid = (days, rowsLbl, cells, hot, tipHead, tipLine) => {
  const cols = days.length, tmpl = (rowsLbl ? '30px ' : '') + 'repeat(' + cols + ', 1fr)';
  let h = '<div style="display: grid; grid-template-columns: ' + tmpl + '; row-gap: 8px; align-items: center; justify-items: center; margin-top: 12px;">' + (rowsLbl ? '<span></span>' : '') + days.map((d) => t(d, { fontSize: '11.5px', color: K.muted })).join('');
  cells.forEach((row, r) => { if (rowsLbl) h += t(rowsLbl[r], { fontSize: '11.5px', color: K.muted, justifySelf: 'start' }); row.forEach((s, c) => { h += s ? dot(s, hot && hot[0] === c && hot[1] === r) : '<span></span>'; }); });
  h += '</div>';
  const tip = hot ? '<div style="' + st(Object.assign({ position: 'absolute', top: 'calc(100% + 6px)', padding: '7px 10px', borderRadius: '10px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.08), 0 8px 22px rgba(17,21,17,.16)', whiteSpace: 'nowrap', zIndex: 3 }, hot[0] < cols / 2 ? { left: 0 } : { right: 0 })) + '">' + t(tipHead, { display: 'block', fontSize: '13px', fontWeight: 600 }) + mu(tipLine, { display: 'block', fontSize: '12px' }) + '</div>' : '';
  return '<div style="position: relative;">' + h + tip + '</div>';
};
const courseHead = (title, side) => '<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px;">' + t(title, { fontSize: '15px', fontWeight: 600 }) + mu(side, { fontSize: '12.5px' }) + '</div>';
const pigCourse = (title, side, grid, chip) => card2(courseHead(title, side) + grid + (chip || ''));

const d41d = () => paneSlim(backHead('Treatment RX-25G009'), who('D41 · 205901', 'Sow · P4 · Pen D41', I.pig, profBtn) +
  pigCourse('1 skipped · 2 to go', 'Thu – Sat', doseGrid(['Thu', 'Fri', 'Sat'], null, [['skip', 'due', 'plan']], [0, 0], 'Dose 1 · Skipped', 'Thu 08:40 · could not stand · G.H'), wChip('Withdrawal ends 21 Nov')));
const c30d = () => paneSlim(backHead('Treatment RX-25G014'), who('C30 · 207118', 'Sow · P2 · Pen C30', I.pig, profBtn) +
  pigCourse('7 given · 1 skipped · 6 to go', 'Mon – Sun', doseGrid(['M', 'T', 'W', 'T', 'F', 'S', 'S'], ['AM', 'PM'], [['done', 'done', 'done', 'done', 'due', 'plan', 'plan'], ['done', 'done', 'skip', 'done', 'plan', 'plan', 'plan']], [2, 1], 'Dose 6 · Skipped', 'Wed 20:10 · off feed, vet called · L.W'), wChip('Withdrawal ends 28 Nov')));
const p422d = () => paneSlim(backHead('Treatment RX-25G011'), who('310422', 'Weaner · Pen B12', I.pig, profBtn) +
  pigCourse('1 given · 2 skipped', 'Wed – Fri', doseGrid(['Wed', 'Thu', 'Fri'], null, [['done', 'skip', 'skip']], [1, 0], 'Day 2 · Skipped', 'Thu 08:14 · could not catch · G.H'), wChip('Withdrawal ends 25 Nov')));
// the task card: the course, then one ring per dose round across the sows
const ringR = (g, a, d, n) => { const C = 2 * Math.PI * 15, seg = (v, off, col) => v ? '<circle cx="20" cy="20" r="15" fill="none" stroke="' + col + '" stroke-width="6" stroke-dasharray="' + (C * v / n).toFixed(1) + ' ' + C.toFixed(1) + '" stroke-dashoffset="' + (-C * off / n).toFixed(1) + '" transform="rotate(-90 20 20)"></circle>' : ''; return '<svg viewBox="0 0 40 40" style="width: 40px; height: 40px;"><circle cx="20" cy="20" r="15" fill="none" stroke="' + HANDLE + '" stroke-width="6"></circle>' + seg(g, 0, DM) + seg(a, g, LM) + seg(d, g + a, PM) + '</svg>'; };
const rounds = (list) => '<div style="display: grid; grid-template-columns: repeat(' + list.length + ', 1fr); gap: 4px; margin-top: 12px;">' + list.map((x) => '<div style="display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center;">' + ringR(x[1], x[2], x[3], x[4]) + t(x[0], { fontSize: '12.5px', fontWeight: 600 }) + x[5].split(' · ').map((z) => t(z, { fontSize: '11.5px', lineHeight: '15px', color: K.muted })).join('') + '</div>').join('') + '</div>';
const rxFull2 = (top) => { const h = paneSlim(theadC({ title: 'Treatment RX-25G009', sub: '4 sows · Batch 32 · Gestation 2' }),
  statusChips(['Running', 'Lameness', 'Fever']) +
  card2(courseHead('3 doses · Thu 5 – Sat 7 Nov', 'day 2') + rounds([['Dose 1', 3, 1, 0, 4, '3 given · 1 skipped'], ['Dose 2', 2, 0, 2, 4, '2 given · 2 due'], ['Dose 3', 0, 0, 0, 4, 'Sat']])) +
  sec('Prescription') + factsBox([['Medicine', 'Amoxicillin 15% LA'], ['Dose', '15 mL a sow', 'Intramuscular, neck'], ['Schedule', '3 doses, every 24 h'], ['Withdrawal', '14 days', 'Ends 21 Nov, if the last dose is Sat'], ['Prescribed', 'Vet', 'Wed 4 Nov 16:10'], ['Note', 'Keep D40 and D41 on straw']]) +
  '<div style="display: flex; gap: 8px; margin-top: 12px;">' + fbtn(ic(SC2.ext, 15) + '&nbsp; Open page') + '</div>');
  return top === 'chips' ? under(h) : h; };

if (frames.r1) { frames.r1.html = () => tabsStrip('Farm view') + fbar() + rxFull2() + vctl + hovOne(420, 434, 'D41 · 205901', dot('due'), 'Dose 2 due 08:30'); frames.r1.cap = 'The task card is the whole course: its dates, then a ring per dose round across the four sows (Dose 1: 3 given, 1 skipped). Then the prescription as set fields. Hover a sow: one line.'; }
if (frames.r2) { frames.r2.html = () => tabsStrip('Farm view') + fbar() + vctl + d41d(); frames.r2.cap = 'Click D41: her whole course in one line (1 skipped, 2 to go) and a circle per dose under its day. Hover a circle for that dose: what, when, who.'; }
if (frames.r3) { frames.r3.html = () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G014') + fbar() + vctl + c30d(); frames.r3.cap = 'Fourteen doses, twice a day: days across, morning and evening down. The skipped evening dose stands out; hover it for the reason.'; }
if (frames.p2) { frames.p2.html = () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G011') + penBar('9', 'Pen B12') + penSections(QB12, B12secs, { hot: '310422' }) + vctl + p422d(); }
if (frames.k1) { frames.k1.html = () => tabsStrip('Farm view') + fbar() + collapseOnly(rxFull2('chips')) + chipsR(two, 'rx') + vctl; }
if (frames.k4) { frames.k4.html = () => tabsStrip('Farm view') + fbar() + collapseOnly(rxFull2('chips')) + chipsR(two, 'rx', '+4', menu4) + vctl; }
if (frames.k5) { frames.k5.html = () => tabsStrip('Farm view') + fbar() + chipsR(two, 'rx') + vctl + collapseOnly(under(d41d())); }
