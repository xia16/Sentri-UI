(async () => {
  const W = 950, Hh = 830, gap = 40, pad = 48;
  const frame = async (k, n) => {
    const f = frames[k]; let img = '';
    if (f.bg) { const b = await sharp(path.join(bgDir, 'L3JS_' + f.bg + '_950.png')).jpeg({ quality: 80 }).toBuffer(); img = '<img alt="" src="data:image/jpeg;base64,' + b.toString('base64') + '" style="position: absolute; inset: 0; width: ' + W + 'px; height: ' + Hh + 'px;">'; }
    return '<figure style="margin: 0; width: ' + W + 'px;"><div style="' + st({ position: 'relative', width: W + 'px', height: Hh + 'px', overflow: 'hidden', borderRadius: '16px', background: K.tint, boxShadow: '0 0 0 1px #D9DDD3, 0 10px 30px rgba(17,21,17,.10)', fontFamily: "'Geist', system-ui, sans-serif", color: K.ink, fontSize: '14px', lineHeight: '20px', fontVariantNumeric: 'tabular-nums' }) + '">' + img + f.html() + '</div><figcaption style="margin-top: 12px; font-size: 14px; line-height: 21px; color: #3B4540;"><b style="font-weight: 600; color: #111511;">' + n + '</b> · ' + esc(f.cap) + '</figcaption></figure>';
  };
  const rules = [
    ['Tasks add, never replace', 'Each task opened from a page, the chat or the Schedule becomes a tab on top of the card, left to right. What does not fit goes under +N.'],
    ['One task at a time on the map', 'The active chip shows its card and colours the map. Clicking another chip switches; the map flies to its rooms.'],
    ['Collapse to leave, × to close', 'The arrow by ×, a click on empty map or Esc collapses: the map is plain again and the chip stays. Only × on a tab closes a task.'],
    ['Scope follows the bar', 'Room or pen in the bar: the card counts it. A group pen zooms in and lines its pigs up; a one-sow pen opens her view directly.']
  ];
  const row = async (keys, base) => '<div style="display: flex; gap: ' + gap + 'px; align-items: flex-start; margin-top: 36px;">' + (await Promise.all(keys.map((k, i) => frame(k, base + i + 1)))).join('') + '</div>';
  const body = '<h1 style="margin: 0; font-size: 28px; line-height: 36px; font-weight: 600; letter-spacing: -.02em;">Open tasks in the Farm view</h1><div style="margin-top: 6px; font-size: 15px; line-height: 22px; color: #5D665F;">How several tasks live on the map at once: tabs on top of the card, one active, collapse to step out, × to close.</div>' +
    '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 22px;">' + rules.map((r, i) => '<div style="padding: 16px 18px; background: #FFFFFF; border: 1px solid #DFE4D8; border-radius: 16px;"><div style="font-size: 15px; font-weight: 600;">' + (i + 1) + '. ' + r[0] + '</div><div style="margin-top: 4px; font-size: 14px; line-height: 21px; color: #3B4540;">' + esc(r[1]) + '</div></div>').join('') + '</div>' +
    await row(['k1', 'k2', 'k3'], 0) + await row(['k4', 'k5'], 3);
  const BW = 3 * W + 2 * gap + 2 * pad;
  const sh = fs.readFileSync(shell, 'utf8'), pre = sh.slice(0, sh.indexOf('<div style="width: 1760px;')).replace(/<title>[^<]*<\/title>/, '<title>Open tasks in the Farm view</title>');
  const html = pre + '<div style="width: ' + BW + 'px; padding: 40px ' + pad + 'px 64px; box-sizing: border-box; background: #F3F4F1; font-family: \'Geist\', system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' + body + '</div>\n</x-dc>\n</body>\n</html>\n';
  fs.writeFileSync(out, html); console.log('wrote', out, Math.round(html.length / 1024) + ' KB', 'width', BW);
})();
