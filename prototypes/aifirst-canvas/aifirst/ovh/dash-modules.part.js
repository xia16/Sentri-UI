// ----- Health and Finance: more widgets, each its own shape -----
const loss = [10.4, 9.9, 10.8, 9.6, 9.2, 9.8, 8.9, 9.4, 8.7, 9.1, 8.8, 9.0, 9.8];
// small · pre-weaning losses, stock style
function lossW() {
  return W(199, 150, '<div style="padding: 14px 16px 0;">' + title(null, 'Piglet losses', K.blue) + '<div style="' + st({ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '4px' }) + '">' + t('9.8', { fontSize: '30px', lineHeight: '34px', fontWeight: 600, letterSpacing: '-.02em' }) + t('% before weaning', { fontSize: '12px', color: K.muted }) + '</div>' + t('13 weeks · plan 8%', { fontSize: '12px', lineHeight: '16px', color: K.muted }) + '</div><div style="' + st({ position: 'absolute', left: 0, right: 0, bottom: 0 }) + '">' + area(loss, 199, 46, K.blue, K.blueL, { id: 'l', min: 8, max: 11.2 }) + '</div>');
}
// small · top problem: the word big, three thin bars
function topW() {
  const rows = [['Lameness', 14], ['Fever', 9], ['Diarrhoea', 6]];
  return W(199, 150, '<div style="padding: 14px 16px;">' + title(null, 'Top problem', K.blue) + '<div style="' + st({ marginTop: '6px', fontSize: '24px', lineHeight: '30px', fontWeight: 600, letterSpacing: '-.02em' }) + '">Lameness</div></div><div style="' + st({ position: 'absolute', left: '16px', right: '16px', bottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }) + '">' + rows.map((r, i) => '<div style="' + st({ display: 'flex', alignItems: 'center', gap: '8px' }) + '"><span style="' + st({ flex: 1, height: '6px', borderRadius: '3px', background: '#EEF0EB' }) + '"><i style="' + st({ display: 'block', height: '100%', width: (r[1] / 14 * 100).toFixed(0) + '%', borderRadius: '3px', background: i ? '#A9C1DF' : K.blue }) + '"></i></span>' + t(r[0] + ' ' + r[1], { fontSize: '11.5px', lineHeight: '14px', color: K.muted, width: '78px' }) + '</div>').join('') + '</div>');
}
// wide · feed spend by month, bars to the bottom edge, this month dark
const feed = [172, 168, 181, 176, 179, 183, 188, 185, 190, 184, 192, 186];
function feedW() {
  const w = 228, h = 96, bw = w / feed.length, hi = 200, lo = 140;
  const bars = '<svg viewBox="0 0 ' + w + ' ' + h + '" style="display: block; width: ' + w + 'px; height: ' + h + 'px;">' + feed.map((v, i) => { const bh = ((v - lo) / (hi - lo)) * (h - 6) + 6; return '<rect x="' + (i * bw + 2).toFixed(1) + '" y="' + (h - bh).toFixed(1) + '" width="' + (bw - 4).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="3" fill="' + (i === feed.length - 1 ? K.amber : '#EAD9B8') + '"></rect>'; }).join('') + '</svg>';
  return W(408, 150, '<div style="' + st({ position: 'absolute', left: '16px', top: '14px' }) + '">' + title(null, 'Feed spend', K.amber) + '<div style="' + st({ marginTop: '6px', fontSize: '30px', lineHeight: '36px', fontWeight: 600, letterSpacing: '-.03em' }) + '">¥186,400</div>' + t('this month', { fontSize: '12px', color: K.muted, display: 'block' }) + t('3.1 kg per kg gained', { fontSize: '12px', color: K.muted, display: 'block', marginTop: '10px' }) + '</div><div style="' + st({ position: 'absolute', right: '14px', bottom: '14px' }) + '">' + bars + '</div>');
}
// small · cost per weaned pig, stock style
const cost = [436, 431, 428, 433, 425, 421, 418, 422, 416, 414, 415, 412];
function costW() {
  return W(199, 150, '<div style="padding: 14px 16px 0;">' + title(null, 'Cost per piglet', K.amber) + '<div style="' + st({ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '4px' }) + '">' + t('¥412', { fontSize: '30px', lineHeight: '34px', fontWeight: 600, letterSpacing: '-.02em' }) + t('weaned', { fontSize: '12px', color: K.muted }) + '</div>' + t('12 months', { fontSize: '12px', lineHeight: '16px', color: K.muted }) + '</div><div style="' + st({ position: 'absolute', left: 0, right: 0, bottom: 0 }) + '">' + area(cost, 199, 46, K.amber, '#F3E7CF', { id: 'c', min: 405, max: 440 }) + '</div>');
}
// small · medicines against the month's budget: one fat bar
function medW() {
  const used = 18.4, budget = 24;
  return W(199, 150, '<div style="padding: 14px 16px;">' + title(null, 'Medicines', K.amber) + '<div style="' + st({ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '4px' }) + '">' + t('¥18,400', { fontSize: '26px', lineHeight: '32px', fontWeight: 600, letterSpacing: '-.02em' }) + '</div></div><div style="' + st({ position: 'absolute', left: '16px', right: '16px', bottom: '16px' }) + '"><div style="' + st({ height: '14px', borderRadius: '7px', background: '#F3EEE3', overflow: 'hidden' }) + '"><i style="' + st({ display: 'block', height: '100%', width: (used / budget * 100).toFixed(0) + '%', borderRadius: '7px', background: K.amber }) + '"></i></div><div style="' + st({ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }) + '">' + t('this month', { fontSize: '11.5px', color: K.muted }) + t('budget ¥24,000', { fontSize: '11.5px', color: K.muted }) + '</div></div>');
}
const modHead = (s) => '<div style="' + st({ margin: '22px 4px 10px' }) + '">' + t(s, { fontSize: '15px', fontWeight: 600 }) + '</div>';
const row2 = (a, b) => '<div style="display: flex; gap: 10px;">' + a + b + '</div>';
const col = (...xs) => '<div style="' + st({ display: 'flex', flexDirection: 'column', gap: '10px' }) + '">' + xs.join('') + '</div>';
const modules = (hv) => { hv = hv || {}; return modHead('Production') + col(herdW(hv.herd), row2(psyW(), bornW())) + modHead('Health') + col(healthW(hv.deaths), row2(lossW(), topW())) + modHead('Finance') + col(feedW(), row2(costW(), medW())); };
