// The widget set from gen-dash4 (the three modules), as HTML for another board; figures scaled down so Inbox and Today lead; optional black-and-white.
const fs = require('fs'), vm = require('vm'), path = require('path');
module.exports = function widgetsHtml(mono) {
  const src = fs.readFileSync(path.join(__dirname, 'gen-dash4.cjs'), 'utf8');
  const a = src.indexOf('const K = '), b = src.indexOf('const PH = ');
  let body = src.slice(a, b);
  // drop the board's own tabs and Home top (only the widgets are wanted)
  const ctx = { require, console };
  vm.createContext(ctx);
  vm.runInContext(body + '\nthis.__out = modules();', ctx);
  let h = ctx.__out;
  // quieter figures: the widgets sit under Inbox and Today
  h = h.split('font-size: 34px; line-height: 38px').join('font-size: 26px; line-height: 30px')
    .split('font-size: 30px; line-height: 36px').join('font-size: 24px; line-height: 30px')
    .split('font-size: 30px; line-height: 34px').join('font-size: 24px; line-height: 30px')
    .split('font-size: 26px; line-height: 32px').join('font-size: 22px; line-height: 28px')
    .split('font-size: 24px; line-height: 30px; font-weight: 600; letter-spacing: -.02em;">Lameness').join('font-size: 20px; line-height: 26px; font-weight: 600; letter-spacing: -.02em;">Lameness')
    .split('font-size="26"').join('font-size="22"');
  // module titles: small grey caps, not headings
  h = h.replace(/<div style="margin: 22px 4px 10px;"><span style="([^"]*)">(Production|Health|Finance)<\/span><\/div>/g, (m, s, n) => '<div style="margin: 18px 2px 8px;"><span style="font-size: 12px; line-height: 16px; color: #6B726D; white-space: nowrap; font-weight: 600; letter-spacing: .04em;">' + n.toUpperCase() + '</span></div>');
  if (mono) {
    const map = { '#2F7A55': '#18181B', '#3972B7': '#18181B', '#946015': '#18181B', '#7FB096': '#52525B', '#BBD6C6': '#A1A1AA', '#DCE9E1': '#D4D4D8', '#A9C1DF': '#A1A1AA', '#EAD9B8': '#D4D4D8', '#F3EEE3': '#F4F4F5', '#F3E7CF': '#F4F4F5', '#E6F0EA': '#E4E4E7', '#E9F0FA': '#E4E4E7', '#D6DAD3': '#D4D4D8', '#8A928A': '#52525B', '#EDEFE9': '#F4F4F5', '#EEF0EB': '#F4F4F5', '#6B726D': '#71717A', '#1B211C': '#09090B', '#A3AAA5': '#A1A1AA' };
    Object.keys(map).forEach((k) => { h = h.split(k).join(map[k]).split(k.toLowerCase()).join(map[k]); });
    h = h.split('border-radius: 22px').join('border-radius: 14px').split('box-shadow: 0 1px 2px rgba(17,21,17,.05), 0 6px 18px rgba(17,21,17,.06)').join('box-shadow: 0 1px 2px rgba(0,0,0,.04); border: 1px solid #E4E4E7');
    // titles in muted ink, not black
    h = h.replace(/(color: )#18181B(; font-size: 12\.5px; font-weight: 600)/g, '$1#71717A$2');
  }
  const u = 'w' + (module.exports.n = (module.exports.n || 0) + 1);
  h = h.replace(/id="g([a-z])"/g, 'id="' + u + '$1"').replace(/url\(#g([a-z])\)/g,'url(#' + u + '$1)');
  return h;
};
