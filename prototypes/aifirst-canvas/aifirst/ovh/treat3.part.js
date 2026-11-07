// ===== v4: the bar is the whole story; hover a segment for it; no legend, no task details, no log; Profile pushes in the pane =====
// the bar with one segment hovered: a small tip above it says what that dose (or round) was
const segBarHot = (steps, hot, tipHead, tipLine) => {
  const n = steps.length, pct = Math.min(86, Math.max(14, (hot + 0.5) / n * 100));
  const segs = steps.map((s, i) => { const ring = i === hot ? ' box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 3.5px ' + K.ink + ';' : (s === 'due' ? ' box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 3.5px ' + PM + ';' : ''); return Array.isArray(s) ? '<span style="flex: 1; display: flex; border-radius: 3px; overflow: hidden;' + ring + '"><i style="flex: ' + s[0] + '; background: ' + DM + ';"></i><i style="flex: ' + s[1] + '; background: ' + LM + ';"></i></span>' : '<i style="flex: 1; border-radius: 3px; background: ' + SEGC[s] + ';' + ring + '"></i>'; }).join('');
  const tip = hot == null ? '' : '<div style="' + st(Object.assign({ position: 'absolute', top: '18px' }, pct < 50 ? { left: 0 } : { right: 0 }, { padding: '7px 10px', borderRadius: '10px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,21,17,.08), 0 8px 22px rgba(17,21,17,.16)', whiteSpace: 'nowrap', zIndex: 3 })) + '">' + t(tipHead, { display: 'block', fontSize: '13px', fontWeight: 600 }) + mu(tipLine, { display: 'block', fontSize: '12px' }) + '</div>';
  return '<div style="position: relative; display: flex; gap: 2px; height: 10px; margin: 12px 0 6px;">' + segs + tip + '</div>';
};
const wChip = (s) => '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '26px', padding: '0 9px', borderRadius: '8px', background: '#F1F2EE', fontSize: '12.5px', fontWeight: 500, color: K.ink, marginTop: '12px' }) + '">' + ic(SHIELD, 13, 1.9, K.muted) + s + '</span>';
const course2 = (now, side, bar, a, b, chip) => card2('<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px;">' + t(now, { fontSize: '15px', fontWeight: 600 }) + mu(side, { fontSize: '12.5px' }) + '</div>' + bar + ends(a, b) + (chip || ''));
// Profile: pushes her profile into this pane; Back comes back here
const profBtn = '<span style="' + st({ display: 'inline-flex', alignItems: 'center', gap: '2px', height: '30px', padding: '0 6px 0 11px', borderRadius: '9px', background: '#FFFFFF', boxShadow: 'inset 0 0 0 1px ' + K.line, fontSize: '12.5px', fontWeight: 500, whiteSpace: 'nowrap' }) + '">Profile' + ic(I.chev, 14, 2) + '</span>';

const d41c = (hot) => paneSlim(backHead('Treatment RX-25G009'), who('D41 · 205901', 'Sow · P4 · Pen D41', I.pig, profBtn) +
  course2('Dose 2 of 3 due 08:30', '1 skipped', segBarHot(['skip', 'due', 'plan'], hot, 'Dose 1 · Skipped', 'Thu 08:40 · could not stand · G.H'), 'Thu', 'Sat', wChip('Withdrawal ends 21 Nov')));
const c30c = () => paneSlim(backHead('Treatment RX-25G014'), who('C30 · 207118', 'Sow · P2 · Pen C30', I.pig, profBtn) +
  course2('Dose 9 of 14 due 08:00', '1 skipped', segBarHot(long, 4, 'Dose 5 · Skipped', 'Wed 20:10 · off feed, vet called · L.W'), 'Mon', 'Sun', wChip('Withdrawal ends 28 Nov')));
const b12c = () => paneSlim(backHead('Treatment RX-25G011'), who('Pen B12', '9 weaners · Nursery 1', PEN2) +
  course2('Day 3 of 3 due today', '2 skipped', segBarHot([[9, 0], [7, 2], 'due'], 1, 'Day 2 · 7 given, 2 skipped', 'Could not catch: 310422 and 1 untagged'), 'Wed', 'Fri', wChip('Withdrawal ends 25 Nov')));
// her profile, pushed into the same pane; the chip goes back to where you were
const prof = () => paneSlim(backHead('D41 in RX-25G009'), who('D41 · 205901', 'Sow · Gestation 2 · Pen D41', I.pig) +
  sec('Now') + card2(t('Gestation', { fontSize: '15px', fontWeight: 600 }) + mu('  day 78 of 115', { fontSize: '13px' }), '12px 14px') +
  sec('Details') + '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">' + [['Parity', '4'], ['Breed', 'LY'], ['Weight', '204 kg'], ['Backfat', '12 mm']].map((x) => '<div style="padding: 9px 12px; background: #FFFFFF; border: 1px solid ' + K.line + '; border-radius: 12px;"><div style="font-size: 12px; color: ' + K.muted + ';">' + x[0] + '</div><div style="font-size: 15px; font-weight: 600;">' + x[1] + '</div></div>').join('') + '</div>' +
  sec('Tasks now') + box([{ h: ic(SC2.syr, 16, 1.8, K.muted) + t('Treatment RX-25G009', { flex: 1, fontWeight: 500 }) + mu('dose 2 due') + ic(I.chev, 14, 1.8, K.faint) }]) +
  '<div style="display: flex; gap: 8px; margin-top: 12px;">' + fbtn(ic(I.chart, 15) + '&nbsp; Performance') + fbtn(ic(I.log, 15) + '&nbsp; Log') + '</div>');

frames.r2 = { bg: 'tx', cap: 'Click D41: who she is, then the bar. One segment per dose; hover a segment and it says what that dose was, when, and who. No legend, no drug details (those are the treatment\'s), no log: the bar is the story. Withdrawal is a chip.', html: () => tabsStrip('Farm view') + fbar() + vctl + d41c(0) };
frames.r3 = { bg: 'tx', cap: 'A 14-dose course reads the same: the skipped one stands out in the bar, and hovering it gives the reason.', html: () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G014') + fbar() + vctl + c30c() };
frames.r4 = { bg: 'zb12', cap: 'A group pen: one segment per round, given and skipped side by side inside it; hovering a round names the tagged pigs and counts the rest.', html: () => tabsStrip('Farm view').replace('Treatment RX-25G009', 'Treatment RX-25G011') + penBar('9', 'Pen B12') + vctl + b12c() };
frames.r5 = { bg: 'tx', cap: 'Profile › pushes her profile into the same pane, nothing opens elsewhere. The chip on top goes back to her treatment view, where you were.', html: () => tabsStrip('Farm view') + fbar() + vctl + prof() };
