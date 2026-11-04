const fs = require('fs'), path = require('path');
const dir = process.argv[2], states = process.argv[3].split(','); // name=Wrapper Title
const f = path.join(dir, 'ActLayout3JS.dc.html'); let s = fs.readFileSync(f, 'utf8');
const m = s.match(/"start":\{"editor":"enum","options":\[([^\]]*)\]/); const opts = JSON.parse('[' + m[1] + ']');
const tmpl = fs.readFileSync(path.join(dir, 'L3JS_BatchList.dc.html'), 'utf8');
for (const x of states) { const [st, wrap, title] = x.split('='); if (opts.indexOf(st) < 0) opts.push(st);
  const w = tmpl.replace(/start="[^"]*"/, 'start="' + st + '"').replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>');
  fs.writeFileSync(path.join(dir, wrap + '.dc.html'), w); }
s = s.replace(m[0], '"start":{"editor":"enum","options":' + JSON.stringify(opts));
fs.writeFileSync(f, s); console.log('starts', opts.length);
