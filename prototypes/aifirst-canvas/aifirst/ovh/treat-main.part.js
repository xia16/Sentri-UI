(async () => {
  const W = 950, Hh = 830, gap = 40, pad = 48;
  const frame = async (k, n) => {
    const f = frames[k]; let img = '';
    if (f.bg) { const b = await sharp(path.join(bgDir, 'L3JS_' + f.bg + '_950.png')).jpeg({ quality: 80 }).toBuffer(); img = '<img alt="" src="data:image/jpeg;base64,' + b.toString('base64') + '" style="position: absolute; inset: 0; width: ' + W + 'px; height: ' + Hh + 'px;">'; }
    return '<figure style="margin: 0; width: ' + W + 'px;"><div style="' + st({ position: 'relative', width: W + 'px', height: Hh + 'px', overflow: 'hidden', borderRadius: '16px', background: K.tint, boxShadow: '0 0 0 1px #D9DDD3, 0 10px 30px rgba(17,21,17,.10)', fontFamily: "'Geist', system-ui, sans-serif", color: K.ink, fontSize: '14px', lineHeight: '20px', fontVariantNumeric: 'tabular-nums' }) + '">' + img + f.html() + '</div><figcaption style="margin-top: 12px; font-size: 14px; line-height: 21px; color: #3B4540;"><b style="font-weight: 600; color: #111511;">' + n + '</b> · ' + esc(f.cap) + '</figcaption></figure>';
  };
  const rules = [
    ['Words from the task', 'Treatment says Given, Due, Skipped. No generic labels (To do, Needs a look). Colours follow the mobile convention: green done, blue today, amber skipped; tonal fills for shapes, marks for thin parts, ink for words.'],
    ['Hover: one glance', 'Who, and the one state line in this task (Dose 2 due 08:30). Reasons, counts and history are behind the click.'],
    ['Click: this task, for her', 'One number, then her doses on a week calendar: Mon to Sun across, a row per week, a small circle per dose. Three doses or three weeks read the same. Hover a circle for that dose. Withdrawal is a chip; Profile pushes her profile in the pane.'],
    ['Group pens', 'No pen card: the pane stays on the task. Zooming into the pen lines its pigs up in sections by state; tagged pigs click through to their view, untagged ones are counted. Crowded pens shrink the figures; zooming out puts them back']
  ];
  const body = '<h1 style="margin: 0; font-size: 28px; line-height: 36px; font-weight: 600; letter-spacing: -.02em;">Treatment on the Farm view</h1><div style="margin-top: 6px; font-size: 15px; line-height: 22px; color: #5D665F;">What the hover says and what the task-pig view holds, for a sow and for a group pen. Panes are 320 wide (display). The chat stays on the left.</div>' +
    '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 22px;">' + rules.map((r, i) => '<div style="padding: 16px 18px; background: #FFFFFF; border: 1px solid #DFE4D8; border-radius: 16px;"><div style="font-size: 15px; font-weight: 600;">' + (i + 1) + '. ' + r[0] + '</div><div style="margin-top: 4px; font-size: 14px; line-height: 21px; color: #3B4540;">' + esc(r[1]) + '</div></div>').join('') + '</div>' +
    '<div style="display: flex; gap: ' + gap + 'px; align-items: flex-start; margin-top: 36px;">' + (await Promise.all(['r1', 'r2', 'r3'].map((k, i) => frame(k, i + 1)))).join('') + '</div>' + '<div style="display: flex; gap: ' + gap + 'px; align-items: flex-start; margin-top: 36px;">' + (await Promise.all(['p1', 'p2', 'p3'].map((k, i) => frame(k, i + 4)))).join('') + '</div>' + '<div style="display: flex; gap: ' + gap + 'px; align-items: flex-start; margin-top: 36px;">' + (await frame('r5', 7)) + '</div>';
  const BW = 3 * W + 2 * gap + 2 * pad;
  const sh = fs.readFileSync(shell, 'utf8'), pre = sh.slice(0, sh.indexOf('<div style="width: 1760px;')).replace(/<title>[^<]*<\/title>/, '<title>Treatment on the Farm view</title>');
  const html = pre + '<div style="width: ' + BW + 'px; padding: 40px ' + pad + 'px 64px; box-sizing: border-box; background: #F3F4F1; font-family: \'Geist\', system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' + body + '</div>\n</x-dc>\n</body>\n</html>\n';
  fs.writeFileSync(out, html); console.log('wrote', out, Math.round(html.length / 1024) + ' KB', 'width', BW);
})();
