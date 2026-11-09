// Schedule as a pop-up: the current screen, then three versions (grid, timeline bars, timeline + detail). Mock-up board.
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const S = __dirname;
const K = { ink: '#1c1917', muted: '#57534e', faint: '#a8a29e', line: '#efeeec', line2: '#f1f0ee', page: '#f5f5f4', green: '#28734F',
  doneF: '#E3F0E8', doneI: '#28734F', todayF: '#EAF1FC', todayI: '#3972B7', planF: '#F1F3EE', planI: '#20291F', lateF: '#FBECEA', lateI: '#B34B43', fc: '#9CA59D', fcI: '#657060', todayCol: '#f5f9f5' };
const st = (o) => Object.entries(o).map(([k, v]) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ': ' + v).join('; ');
const DAYS = [['Mon', 2], ['Tue', 3], ['Wed', 4], ['Thu', 5], ['Fri', 6], ['Sat', 7], ['Sun', 8]], TODAY = 3;
const ROWS = [
  { g: 'Production', name: 'Farrowing', sub: 'B33 · Farrowing 1', cells: ['', '', '', '', 'e6', 'e14', 'e12'], more: true },
  { g: 'Production', name: 'Fostering checks', sub: 'B32 · Farrowing 2', cells: ['d8', 'd8', 'w6', 'o8', 'p8', 'p8', 'p8'], more: true },
  { g: 'Production', name: 'Pregnancy check', sub: 'B35 · Gestation 1', cells: ['', 'd24', 'd28', '', '', '', ''] },
  { g: 'Health', name: 'Amox treatment', sub: '4 sows · Gestation 2', cells: ['', '', '', 'o4', 'p4', 'p4', ''] },
  { g: 'Health', name: 'Pen-strep treatment', sub: '6 piglets · Farrowing 2 · twice a day', cells: ['', '', 'd6|d6', 'd6|o6', 'p6|p6', '', ''], aOnly: true },
  { g: 'Health', name: 'PRRS vaccine', sub: '3 weaners · Nursery 1', cells: ['', '', '', 'o3', '', '', ''] },
  { g: 'Health', name: 'PRRS sampling', sub: 'B30 · Nursery 1', cells: ['d10', '', '', '', '', '', ''] },
  { g: 'Other', name: 'Move', sub: 'Gestation 2, 3 → Farrowing 1', cells: ['d48', '', '', '', '', '', ''] },
  { g: 'Other', name: 'Wash', sub: 'Farrowing 3', cells: ['', '', '', '', 'p1', '', ''] }
];
const GROUPS = ['Production', 'Health', 'Other'];
const CHECK = '<svg viewBox="0 0 24 24" style="width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const CHEV = (d) => '<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><path d="' + (d < 0 ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6') + '"/></svg>';
const X = '<svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round;"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const kind = (c) => ({ d: 'done', w: 'late', o: 'today', p: 'plan', e: 'fc' })[c[0]];
const num = (c) => +c.replace(/\D/g, '');
const look = (k) => ({ done: [K.doneF, K.doneI, 'none'], late: [K.lateF, K.lateI, 'none'], today: [K.todayF, K.todayI, 'inset 0 0 0 1.5px ' + K.todayI], plan: [K.planF, K.planI, 'none'], fc: ['transparent', K.fcI, 'inset 0 0 0 1px ' + K.fc] })[k];
const label = (c) => { const k = kind(c), n = num(c); return k === 'done' ? CHECK + n : k === 'late' ? n + ' of 8' : k === 'fc' ? '~' + n : String(n); };

// ---------- shared pop-up shell ----------
const header = (extra) => '<div style="display: flex; align-items: center; gap: 10px; padding: 18px 20px 14px 24px;">' +
  '<h2 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -.01em; margin-right: 10px;">Schedule</h2>' +
  '<span style="height: 32px; padding: 0 11px; border: 1px solid #d6d3d1; background: #fff; border-radius: 9px; font-size: 13px; display: inline-flex; align-items: center;">Today</span>' +
  '<span style="display: inline-flex; color: ' + K.ink + ';">' + CHEV(-1) + '</span><span style="display: inline-flex; color: ' + K.ink + ';">' + CHEV(1) + '</span>' +
  '<b style="font-size: 14px; font-weight: 600;">Mon 2 – Sun 8 Nov</b>' + (extra || '') + '<span style="flex: 1;"></span>' +
  '<span style="display: flex; background: #eaeae7; border-radius: 8px; padding: 3px;"><span style="background: #fff; box-shadow: 0 1px 2px #1c19171a; border-radius: 6px; padding: 5px 11px; font-size: 13px;">Week</span><span style="padding: 5px 11px; font-size: 13px; color: ' + K.muted + ';">2 weeks</span></span>' +
  '<span style="width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; color: ' + K.muted + '; margin-left: 6px;">' + X + '</span></div>';
const popup = (inner, w, h, extra) => '<div class="dim"></div><div style="' + st({ position: 'absolute', left: ((1440 - w) / 2) + 'px', top: ((900 - h) / 2) + 'px', width: w + 'px', height: h + 'px', boxSizing: 'border-box', borderRadius: '18px', background: K.page, boxShadow: '0 28px 70px rgba(28,25,23,.30), 0 0 0 1px rgba(28,25,23,.08)', overflow: 'hidden', fontFamily: 'Inter, sans-serif', color: K.ink }) + '">' + header(extra) + inner + '</div>';

// ---------- grid pieces ----------
const LBL = 236;
const cols = (lbl) => 'display: grid; grid-template-columns: ' + lbl + 'px repeat(7, minmax(0, 1fr)) 22px;';
const dayHead = (lbl, compact) => '<div style="' + cols(lbl) + ' height: ' + (compact ? 54 : 60) + 'px; border-bottom: 1px solid ' + K.line + ';"><div></div>' +
  DAYS.map((d, i) => { const t = i === TODAY, past = i < TODAY; return '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; position: relative; border-left: 1px solid ' + K.line2 + ';"><span style="font-size: 10.5px; font-weight: 500; letter-spacing: .03em; text-transform: uppercase; color: ' + K.muted + ';">' + d[0] + '</span><b style="display: grid; place-items: center; width: 26px; height: 26px; border-radius: 99px; font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; background: ' + (t ? K.green : 'transparent') + '; color: ' + (t ? '#fff' : past ? K.faint : K.ink) + ';">' + d[1] + '</b></div>'; }).join('') + '<div></div></div>';
const groupHead = (g, lbl) => '<div style="height: 32px; display: flex; align-items: flex-end; padding: 0 0 6px 18px; box-sizing: border-box; font-size: 12px; font-weight: 600; color: ' + K.muted + '; border-bottom: 1px solid ' + K.line2 + ';">' + g + '</div>';
const rowLabel = (r, sel) => '<div style="display: flex; flex-direction: column; justify-content: center; gap: 3px; padding: 0 10px 0 18px; min-width: 0;"><span style="font-size: 13.5px; font-weight: ' + (sel ? 600 : 500) + '; white-space: nowrap;">' + r.name + '</span><span style="font-size: 12px; color: ' + K.muted + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + r.sub + '</span></div>';
const todayTint = (lbl, top) => '<div style="position: absolute; top: ' + top + 'px; bottom: 0; left: calc(' + lbl + 'px + (100% - ' + lbl + 'px - 22px) * ' + TODAY + ' / 7); width: calc((100% - ' + lbl + 'px - 22px) / 7); background: ' + K.todayCol + '; z-index: 0;"></div>';
const more = (r) => '<div style="display: flex; align-items: center; color: ' + K.faint + ';">' + (r.more ? CHEV(1) : '') + '</div>';

// A: the grid, given room
const slotA = (c, rad) => { const L = look(kind(c)); return '<span style="' + st({ flex: 1, minWidth: 0, height: '34px', borderRadius: rad, background: L[0], color: L[1], boxShadow: L[2], display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '13.5px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }) + '">' + label(c) + '</span>'; };
const cellA = (c) => { if (!c) return '<div style="border-left: 1px solid ' + K.line2 + ';"></div>'; if (c.includes('|')) { const p = c.split('|'); return '<div style="display: flex; align-items: center; gap: 2px; padding: 0 5px; border-left: 1px solid ' + K.line2 + ';">' + p.map((x, i) => slotA(x, i === 0 ? '4px 1px 1px 4px' : i === p.length - 1 ? '1px 4px 4px 1px' : '1px')).join('') + '</div>'; } const L = look(kind(c)); return '<div style="display: flex; align-items: center; justify-content: center; padding: 0 5px; border-left: 1px solid ' + K.line2 + ';"><span style="' + st({ width: '100%', height: '34px', borderRadius: '4px', background: L[0], color: L[1], boxShadow: L[2], display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '13.5px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }) + '">' + label(c) + '</span></div>'; };
const gridA = () => { let h = ''; GROUPS.forEach((g) => { h += groupHead(g, LBL); ROWS.filter((r) => r.g === g).forEach((r) => { h += '<div style="' + cols(LBL) + ' height: 58px; border-bottom: 1px solid ' + K.line2 + '; position: relative; z-index: 1;">' + rowLabel(r) + r.cells.map(cellA).join('') + more(r) + '</div>'; }); });
  return '<div style="margin: 0 16px; background: #fff; border-radius: 14px; box-shadow: 0 1px 3px #1c19170f; overflow: hidden; position: relative;">' + todayTint(LBL, 60) + '<div style="position: relative; z-index: 1;">' + dayHead(LBL) + '</div>' + h + '</div>'; };

// B: timeline bars (one bar per run of days)
const runs = (cells) => { const out = []; let cur = null; cells.forEach((c, i) => { if (c) { if (!cur) { cur = { a: i, cs: [] }; out.push(cur); } cur.cs.push(c); } else cur = null; }); return out; };
const barRow = (r, lbl, h, sel, nowX) => {
  const bars = runs(r.cells).map((run) => { const open = r.more && run.a + run.cs.length === 7;
    const segs = run.cs.map((c, j) => { const L = look(kind(c)), first = j === 0, last = j === run.cs.length - 1;
      const rad = (first ? '15px' : '3px') + ' ' + (last && !open ? '15px' : '3px') + ' ' + (last && !open ? '15px' : '3px') + ' ' + (first ? '15px' : '3px');
      return '<span style="' + st({ flex: 1, minWidth: 0, height: '30px', borderRadius: rad, background: L[0], color: L[1], boxShadow: L[2], display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }) + '">' + label(c) + '</span>'; }).join('');
    return '<div style="' + st({ position: 'absolute', top: ((h - 30) / 2) + 'px', left: 'calc(' + lbl + 'px + (100% - ' + lbl + 'px - 22px) * ' + run.a + ' / 7 + 6px)', width: 'calc((100% - ' + lbl + 'px - 22px) * ' + run.cs.length + ' / 7 - ' + (open ? 6 : 12) + 'px' + (open ? ' + 22px' : '') + ')', display: 'flex', gap: '2px' }) + (open ? '; -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 26px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 26px), transparent);' : '') + '">' + segs + '</div>'; }).join('');
  return '<div style="' + cols(lbl) + ' height: ' + h + 'px; border-bottom: 1px solid ' + K.line2 + '; position: relative; z-index: 1; background: ' + (sel ? 'rgba(40,115,79,.05)' : 'transparent') + ';">' + rowLabel(r, sel) + DAYS.map(() => '<div style="border-left: 1px solid ' + K.line2 + ';"></div>').join('') + '<div></div>' + bars + '</div>';
};
const nowLine = (lbl, top) => '<div style="position: absolute; z-index: 0; top: ' + top + 'px; bottom: 0; left: calc(' + lbl + 'px + (100% - ' + lbl + 'px - 22px) * ' + (TODAY + 0.39) + ' / 7); width: 2px; margin-left: -1px; background: ' + K.green + '; opacity: .9;"></div>' +
  '<div style="position: absolute; z-index: 3; top: ' + (top - 9) + 'px; left: calc(' + lbl + 'px + (100% - ' + lbl + 'px - 22px) * ' + (TODAY + 0.39) + ' / 7); transform: translateX(-50%); height: 18px; padding: 0 6px; border-radius: 6px; background: ' + K.green + '; color: #fff; font-size: 11px; font-weight: 600; display: flex; align-items: center; font-variant-numeric: tabular-nums;">09:20</div>';
const gridB = (lbl, rowH, selName) => { let h = ''; GROUPS.forEach((g) => { h += groupHead(g, lbl); ROWS.filter((r) => r.g === g && !r.aOnly).forEach((r) => { h += barRow(r, lbl, rowH, r.name === selName); }); });
  return '<div style="margin: 0 16px; background: #fff; border-radius: 14px; box-shadow: 0 1px 3px #1c19170f; overflow: hidden; position: relative; flex: 1; min-width: 0;">' + todayTint(lbl, 60) + '<div style="position: relative; z-index: 1;">' + dayHead(lbl) + '</div>' + h + nowLine(lbl, 60) + '</div>'; };

// C: timeline + the picked task beside it
const detail = () => {
  const seg = (c, i) => { const L = c ? look(kind(c)) : ['#F4F4F2', K.faint, 'none']; return '<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;"><span style="font-size: 10.5px; color: ' + (i === TODAY ? K.green : K.muted) + '; font-weight: ' + (i === TODAY ? 700 : 500) + ';">' + DAYS[i][0][0] + '</span><span style="' + st({ width: '100%', height: '26px', borderRadius: '7px', background: L[0], color: L[1], boxShadow: L[2], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }) + '">' + (c ? (kind(c) === 'late' ? '6' : num(c)) : '') + '</span></div>'; };
  const line = (a, b, ink) => '<div style="display: flex; gap: 12px; padding: 11px 0; border-top: 1px solid ' + K.line2 + '; font-size: 13px; line-height: 19px;"><span style="width: 74px; flex: none; color: ' + K.muted + ';">' + a + '</span><span style="color: ' + (ink || K.ink) + ';">' + b + '</span></div>';
  return '<div style="width: 340px; flex: none; margin-right: 16px; background: #fff; border-radius: 14px; box-shadow: 0 1px 3px #1c19170f; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; align-self: flex-start;">' +
    '<div style="font-size: 12px; font-weight: 600; color: ' + K.muted + ';">Production</div>' +
    '<div style="font-size: 18px; font-weight: 600; margin-top: 4px; letter-spacing: -.01em;">Fostering checks</div>' +
    '<div style="font-size: 13px; color: ' + K.muted + '; margin-top: 3px;">Batch 32 · Farrowing 2 · Li Wei</div>' +
    '<div style="display: flex; align-items: baseline; gap: 7px; margin-top: 18px;"><span style="font-size: 30px; font-weight: 600; font-variant-numeric: tabular-nums; color: ' + K.todayI + ';">8</span><span style="font-size: 13.5px; color: ' + K.muted + ';">litters to check today</span></div>' +
    '<div style="height: 16px;"></div>' +
    line('Behind', 'Wed: 6 of 8 checked. A5 and B10 not reported.', K.lateI) +
    line('Runs', 'Mon 2 to Mon 9 Nov, 8 litters a day') +
    '<div style="height: 20px;"></div>' +
    '<div style="height: 42px; border-radius: 10px; background: ' + K.ink + '; color: #fff; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">Show in Farm view</div></div>';
};
const bodyC = () => '<div style="display: flex; gap: 0; align-items: flex-start;">' + gridB(214, 56, 'Fostering checks') + detail() + '</div>';

// ---------- board ----------
(async () => {
  const jpg = async (f) => 'data:image/jpeg;base64,' + (await sharp(f).jpeg({ quality: 80 }).toBuffer()).toString('base64');
  const home = await jpg(path.join(S, 'walk-s1-home.png')), before = await jpg(path.join(S, 'walk-s2-sched.png'));
  const frame = (bg, over, title, cap) => '<figure style="margin: 0;"><figcaption style="font-size: 17px; font-weight: 600; margin-bottom: 6px;">' + title + '</figcaption><div style="font-size: 14.5px; line-height: 22px; color: #3B4540; margin-bottom: 14px; min-height: 66px; max-width: 1380px;">' + cap + '</div>' +
    '<div style="position: relative; width: 1440px; height: 900px; border-radius: 14px; overflow: hidden; box-shadow: 0 0 0 1px #E2E5DE, 0 8px 28px rgba(17,21,17,.10); background: url(' + bg + ') 0 0 / 1440px 900px no-repeat;">' + over + '</div></figure>';
  const fBefore = frame(before, '', 'Today · Schedule replaces Home in the side pane', 'Home &rsaquo; Schedule swaps the whole pane: 467 px for seven days, so names clip, every cell is a 40 px box and the batch hides in a chip with a pig or house icon (a pig icon and 4: four what?). Back is &lsaquo; Home.');
  const fA = frame(home, popup('<div style="height: 8px;"></div>' + gridA(), 1180, 774), 'A · The same week grid, in a pop-up (chosen 9 Nov)',
    'The approved grid with room to breathe: each row says what and where in words (B32 · Farrowing 2), done reads &#10003;&nbsp;8, the late day reads &ldquo;6 of 8&rdquo; in red, a forecast is dashed. A day with two doses splits into two slots, morning then evening (Pen-strep: Thursday&rsquo;s morning dose done, the evening one due). Square corners. Click a cell: the pop-up closes and the Farm view opens that task, as today.');
  const fB = frame(home, popup('<div style="height: 8px;"></div>' + gridB(LBL, 58), 1180, 716), 'B · Timeline bars',
    'A task is one bar across its days instead of a row of boxes, split per day by status. A bar that carries on next week fades out at the edge. A green line marks now. Click a day on a bar: the Farm view opens that task, as in A.');
  const fC = frame(home, popup('<div style="height: 8px;"></div>' + bodyC(), 1260, 696), 'C · Timeline bars, and the picked task beside them',
    'Same bars, a narrower label column. A click picks a task instead of leaving: its day-by-day, what is behind and who is on it stay in a panel on the right, so nothing hides in a hover card. Show in Farm view leaves the pop-up.');
  const checks = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 44px;">' +
    '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px; font-size: 15px; line-height: 23px; color: #3B4540;"><div style="font-size: 16px; font-weight: 600; color: #111511; margin-bottom: 8px;">House pattern</div>' +
    'The console has no dialog yet. The nearest overlays are the chat&rsquo;s / Actions popover and the Farm view&rsquo;s floating panel. The Schedule keeps its approved look (grey page, one white card, the schedule-b colours) and moves out of the pane into a centred pop-up over the dimmed console, the way a calendar opens its week view. Esc, &#10005; or a click outside closes it; Home underneath never changes.</div>' +
    '<div style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #E6E9E2; padding: 22px 26px; font-size: 15px; line-height: 23px; color: #3B4540;"><div style="font-size: 16px; font-weight: 600; color: #111511; margin-bottom: 8px;">Attention budget: a manager opening the week</div>' +
    '<b>1 Act now:</b> what is due today and what is behind (the today column; a late day in red, one per row). <b>2 Coming up:</b> planned days and forecasts (dashed). <b>3 Where:</b> batch and room in words on the row. <b>4 Settled:</b> done days, quiet green with &#10003;. <b>5 One level down:</b> who and which pigs (C&rsquo;s panel; the Farm view for A and B).<br>' +
    '<b>Cut:</b> &ldquo;Week 45&rdquo; (the dates say it), the &ldquo;Task&rdquo; heading, the icon counts (a pig icon and 4), now said in words, and &ldquo;Click to open&rdquo; in the hover.</div></div>';
  const legend = '<div style="display: flex; gap: 22px; align-items: center; margin: -20px 0 40px; font-size: 14px; color: #3B4540;">' +
    [['done', '&#10003; 8', 'Done'], ['today', '8', 'Due today'], ['plan', '8', 'Planned'], ['late', '6 of 8', 'Behind'], ['fc', '~6', 'Forecast']].map((x) => { const L = look(x[0]); return '<span style="display: inline-flex; align-items: center; gap: 8px;"><span style="' + st({ height: '26px', padding: '0 10px', borderRadius: '8px', background: L[0], color: L[1], boxShadow: L[2], display: 'inline-flex', alignItems: 'center', fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }) + '">' + x[1] + '</span>' + x[2] + '</span>'; }).join('') + '</div>';
  const html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Schedule pop-up</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Inter:wght@400..700&display=swap" rel="stylesheet">\n<style>body{margin:0} .dim{position:absolute;inset:0;background:rgba(28,25,23,.34)}</style>\n</helmet>\n' +
    '<div style="width: 3008px; padding: 44px 48px 60px; box-sizing: border-box; background: #F3F4F1; font-family: Geist, system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' +
    '<h1 style="margin: 0; font-size: 30px; line-height: 38px; font-weight: 600; letter-spacing: -.025em;">Schedule opens as a pop-up: A chosen (mock-up)</h1>' +
    '<p style="margin: 8px 0 30px; font-size: 16px; line-height: 24px; color: #5D665F; max-width: 1800px;">Today Home &rsaquo; Schedule turns the side pane into a second screen. Instead it opens in a pop-up over the console, from Schedule &rsaquo; and from a Today tile. Same week, same data, same colours; A keeps the grid, B draws each task as a bar, C adds a panel for the picked task. <b style="color: #111511;">Chosen 9 Nov: A.</b> B&rsquo;s round bars added nothing; C&rsquo;s panel repeated the Farm view card, which stays the one place a task&rsquo;s details live.</p>' +
    checks + legend +
    '<div style="display: grid; grid-template-columns: 1440px 1440px; gap: 56px 32px;">' + fBefore + fA + fB + fC + '</div></div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":3008,"height":2560}}\'>\nclass Component extends DCLogic {\n  renderVals() { return {}; }\n}\n</script>\n</body>\n</html>\n';
  fs.writeFileSync(path.join(S, 'pub/project/SchedulePopup.dc.html'), html);
  console.log('board', Math.round(html.length / 1024) + ' KB');
})();
