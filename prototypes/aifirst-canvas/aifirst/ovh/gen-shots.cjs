// A static board of screenshots, grouped under headings (so the canvas keeps one live frame per page).
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const [specFile, shotsDir, out, shell] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
(async () => {
  const W = 640, cols = 3, gap = 32, pad = 48, BW = cols * W + (cols - 1) * gap + 2 * pad;
  let body = '', n = 0;
  for (const [head, items] of spec.sections) {
    let cells = '';
    for (const [file, cap] of items) {
      const f = path.join(shotsDir, file + '.png'); if (!fs.existsSync(f)) { console.log('missing', file); continue; }
      const m = await sharp(f).metadata(), h = Math.round(W * m.height / m.width);
      const b = await sharp(f).resize(W * 2).jpeg({ quality: 70, mozjpeg: true }).toBuffer(); n++;
      cells += '<figure style="margin: 0;"><img alt="' + esc(cap) + '" src="data:image/jpeg;base64,' + b.toString('base64') + '" style="display: block; width: ' + W + 'px; height: ' + h + 'px; border-radius: 12px; box-shadow: 0 0 0 1px #DADFD5, 0 8px 22px rgba(17,21,17,.08);"><figcaption style="margin-top: 10px; font-size: 14px; line-height: 20px; color: #20291F;">' + esc(cap) + '</figcaption></figure>';
    }
    body += '<h2 style="margin: 48px 0 20px; font-size: 20px; line-height: 28px; font-weight: 600;">' + esc(head) + '</h2><div style="display: grid; grid-template-columns: repeat(' + cols + ', ' + W + 'px); gap: 36px ' + gap + 'px; align-items: start;">' + cells + '</div>';
  }
  const sh = fs.readFileSync(shell, 'utf8'), pre = sh.slice(0, sh.indexOf('<div style="width: 1760px;')).replace(/<title>[^<]*<\/title>/, '<title>' + esc(spec.title) + '</title>');
  const html = pre + '<div style="width: ' + BW + 'px; padding: 40px ' + pad + 'px 64px; box-sizing: border-box; background: #F3F4F1; font-family: \'Geist\', system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;"><h1 style="margin: 0; font-size: 28px; line-height: 36px; font-weight: 600; letter-spacing: -.025em;">' + esc(spec.title) + '</h1><div style="margin-top: 6px; font-size: 15px; line-height: 23px; color: #5D665F; max-width: 1400px;">' + esc(spec.sub) + '</div>' + body + '</div>\n</x-dc>\n</body>\n</html>\n';
  fs.writeFileSync(out, html); console.log('wrote', out, n, 'shots', Math.round(html.length / 1024) + ' KB', 'width', BW);
})();
