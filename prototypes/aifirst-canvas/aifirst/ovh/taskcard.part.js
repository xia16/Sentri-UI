// ===== the treatment card: the whole course, then the prescription as set fields; one free-text note at most =====
const factsBox = (rows) => '<div style="background: #FFFFFF; border: 1px solid ' + K.line + '; border-radius: 16px; padding: 4px 14px;">' + rows.map((r, i) => '<div style="' + st({ display: 'grid', gridTemplateColumns: '92px 1fr', columnGap: '10px', alignItems: 'baseline', padding: '8px 0', borderTop: i ? '1px solid #EEF0EA' : '0' }) + '">' + t(r[0], { fontSize: '12.5px', color: K.muted }) + '<span style="display: flex; flex-direction: column; min-width: 0;">' + t(r[1], { fontSize: '13.5px', fontWeight: 500, whiteSpace: 'normal' }) + (r[2] ? t(r[2], { fontSize: '12px', color: K.muted, whiteSpace: 'normal' }) : '') + '</span></div>').join('') + '</div>';
const statusChips = (list) => '<div style="display: flex; flex-wrap: wrap; gap: 5px; margin: -2px 0 12px;">' + list.map((x, i) => '<span style="' + st({ display: 'inline-flex', alignItems: 'center', height: '22px', padding: '0 8px', borderRadius: '6px', background: i ? '#F1F2EE' : PF, color: i ? K.ink : PFI, fontSize: '12px', fontWeight: 500 }) + '">' + x + '</span>').join('') + '</div>';
const rxFull = (top) => { const h = paneSlim(theadC({ title: 'Treatment RX-25G009', sub: '4 sows · Batch 32 · Gestation 2' }),
  statusChips(['Running', 'Lameness', 'Fever']) +
  gauge([[DM, 'Given', 5], [LM, 'Skipped', 1], [PM, 'Due today', 2], [HANDLE, 'Planned', 4]], 12, '5', 'of 12 doses') +
  sec('Prescription') + factsBox([
    ['Medicine', 'Amoxicillin 15% LA'],
    ['Dose', '15 mL a sow', 'Intramuscular, neck'],
    ['Schedule', '3 doses, every 24 h', 'Thu 5 – Sat 7 Nov'],
    ['Withdrawal', '14 days', 'Ends 21 Nov, if the last dose is Sat'],
    ['Prescribed', 'Vet', 'Wed 4 Nov 16:10'],
    ['Note', 'Keep D40 and D41 on straw']
  ]) + '<div style="display: flex; gap: 8px; margin-top: 12px;">' + fbtn(ic(SC2.ext, 15) + '&nbsp; Open page') + '</div>');
  return top === 'chips' ? under(h) : h; };

frames.k1.html = () => tabsStrip('Farm view') + fbar() + rxFull('chips') + chips(two, 'rx') + vctl;
frames.k4.html = () => tabsStrip('Farm view') + fbar() + rxFull('chips') + chips(five, 'rx', '+2', ovMenu) + vctl;
frames.k1.cap = 'Open a second task and it is added as a chip, never replacing the first. The active task\'s card is about the whole course: 5 of 12 doses, then the prescription as set fields (medicine, dose, schedule, withdrawal, who prescribed), and at most one free-text note. The arrow collapses, × closes.';
if (frames.r1) { frames.r1.html = () => tabsStrip('Farm view') + fbar() + rxFull() + vctl + hovOne(420, 434, 'D41 · 205901', mini('due'), 'Dose 2 due 08:30'); frames.r1.cap = 'The task on the map: the card is the whole course (5 of 12 doses) and the prescription as set fields. Hover a sow: one line, where she is now.'; }
