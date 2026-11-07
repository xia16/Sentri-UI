(async () => {
  const W = 950, Hh = 830, gap = 40, pad = 48;
  const frame = async (k, n) => {
    const f = frames[k]; let img = '';
    if (f.bg) { const b = await sharp(path.join(bgDir, 'L3JS_' + f.bg + '_950.png')).jpeg({ quality: 80 }).toBuffer(); img = '<img alt="" src="data:image/jpeg;base64,' + b.toString('base64') + '" style="position: absolute; inset: 0; width: ' + W + 'px; height: ' + Hh + 'px;">'; }
    return '<figure style="margin: 0; width: ' + W + 'px;"><div style="' + st({ position: 'relative', width: W + 'px', height: Hh + 'px', overflow: 'hidden', borderRadius: '16px', background: K.tint, boxShadow: '0 0 0 1px #D9DDD3, 0 10px 30px rgba(17,21,17,.10)', fontFamily: "'Geist', system-ui, sans-serif", color: K.ink, fontSize: '14px', lineHeight: '20px', fontVariantNumeric: 'tabular-nums' }) + '">' + img + f.html() + '</div><figcaption style="margin-top: 12px; font-size: 14px; line-height: 21px; color: #3B4540;"><b style="font-weight: 600; color: #111511;">' + n + '</b> · ' + esc(f.cap) + '</figcaption></figure>';
  };
  const row = async (title, keys, base) => '<h2 style="margin: 44px 0 18px; font-size: 21px; line-height: 28px; font-weight: 600;">' + title + '</h2><div style="display: flex; gap: ' + gap + 'px; align-items: flex-start;">' + (await Promise.all(keys.map((k, i) => frame(k, base + i + 1)))).join('') + '</div>';
  const rules = [
    ['The map helps you find the pens', 'A task opened on the map answers where the work is and what is left. The full list of pigs stays on the task page.'],
    ['The pane, under a task', 'Header (icon, title, one line), progress, the status filters. Rooms only when the task spans more than one. Open page.'],
    ['The pen is the unit', 'Each pen carries one state. Hover shows its numbers; click opens it: one pig opens her page, a group pen opens the pen.'],
    ['Untagged pigs', 'They count toward their pen. A group pen lists its tagged pigs as rows and the rest as one counted row.']
  ];
  const legend = [[ST.done[0], 'Done', 'all of the pen'], [ST.part[0], 'Under way', 'some done, only group pens'], [ST.todo[0], 'To do', 'none done yet'], [ST.look[0], 'Needs a look', 'skipped, recheck, sick: wins over the rest'], ['#E9E8E2', 'Not in this task', 'steps back']];
  const body = '<h1 style="margin: 0; font-size: 28px; line-height: 36px; font-weight: 600; letter-spacing: -.02em;">A task on the Farm view</h1><div style="margin-top: 6px; font-size: 15px; line-height: 22px; color: #5D665F;">What the map is for when a task is open, the pane it shows, and one quiet rule for pen colours. The chat stays on the left; these frames are the console\'s right pane.</div>' +
    '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 22px;">' + rules.map((r, i) => '<div style="padding: 16px 18px; background: #FFFFFF; border: 1px solid #DFE4D8; border-radius: 16px;"><div style="font-size: 15px; font-weight: 600;">' + (i + 1) + '. ' + r[0] + '</div><div style="margin-top: 4px; font-size: 14px; line-height: 21px; color: #3B4540;">' + esc(r[1]) + '</div></div>').join('') + '</div>' +
    '<div style="display: flex; align-items: center; gap: 26px; flex-wrap: wrap; margin-top: 14px; padding: 16px 20px; background: #FFFFFF; border: 1px solid #DFE4D8; border-radius: 16px;"><span style="font-size: 15px; font-weight: 600;">One fill per pen</span>' + legend.map((x) => '<span style="display: inline-flex; align-items: center; gap: 9px; font-size: 14px;"><i style="width: 22px; height: 14px; border-radius: 4px; background: ' + x[0] + ';"></i><b style="font-weight: 600;">' + x[1] + '</b><span style="color: #5D665F;">' + x[2] + '</span></span>').join('') + '<span style="font-size: 13px; color: #5D665F;">No numbers, stripes or tags on the map.</span></div>' +
    await row('One room: a treatment of four sows', ['f1', 'f2', 'f3'], 0) + await row('Two rooms, group pens: a vaccination of weaners', ['f4', 'f5', 'f6'], 3);
  const BW = 3 * W + 2 * gap + 2 * pad;
  const sh = fs.readFileSync(shell, 'utf8'), pre = sh.slice(0, sh.indexOf('<div style="width: 1760px;')).replace(/<title>[^<]*<\/title>/, '<title>A task on the Farm view</title>');
  const html = pre + '<div style="width: ' + BW + 'px; padding: 40px ' + pad + 'px 64px; box-sizing: border-box; background: #F3F4F1; font-family: \'Geist\', system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' + body + '</div>\n</x-dc>\n</body>\n</html>\n';
  fs.writeFileSync(out, html); console.log('wrote', out, Math.round(html.length / 1024) + ' KB', 'width', BW);
})();
