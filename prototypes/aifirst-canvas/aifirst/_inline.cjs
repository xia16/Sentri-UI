// Builds the engine, the pig models and the farm docs INTO the pages: claude.ai can't load sibling .js/.json files.
// Sources of truth stay project/layout.engine.js, project/pigs.module.js, project/farms/*.json. Re-run after editing them.
// Usage: node _inline.cjs [ActLayout3JS|ActBarn3JS|PigKit]   (no argument = all three; running twice is safe)
const fs = require('fs'), P = 'project/';
const wrap = (file, name) => {
  const src = fs.readFileSync(P + file, 'utf8');
  const names = [...src.matchAll(/^export (?:const|function|let) ([A-Za-z0-9_$]+)/gm)].map((m) => m[1]);
  const body = src.replace(/^export /gm, '');
  return `const ${name} = (function () {\n${body}\nreturn { ${names.join(', ')} };\n})();\n`;
};
const farms = {}; ['acres', 'groupgest', 'weaner', 'sketch'].forEach((id) => { farms[id] = JSON.parse(fs.readFileSync(P + 'farms/' + id + '.json', 'utf8')); });
const only = process.argv[2] || '';
const put = (page, block, marker, reps) => {
  if (only && page.indexOf(only) !== 0) return;
  let s = fs.readFileSync(P + page, 'utf8');
  const a0 = s.indexOf('// <' + marker + '>\n'), b0 = s.indexOf('// </' + marker + '>\n');
  if (a0 >= 0 && b0 > a0) s = s.slice(0, a0) + s.slice(b0 + ('// </' + marker + '>\n').length);
  s = s.replace(/(<script type="text\/x-dc" data-dc-script[^>]*>\n)/, (m0, g1) => g1 + `// <${marker}>\n${block}// </${marker}>\n`);
  reps.forEach(([a, b]) => { if (s.includes(a)) s = s.split(a).join(b); else if (!s.includes(b)) throw new Error(page + ': missing ' + a); });
  fs.writeFileSync(P + page, s); console.log(page, (s.length / 1024).toFixed(0) + ' KB');
};
put('ActLayout3JS.dc.html', wrap('layout.engine.js', 'LAYOUT_ENGINE') + wrap('pigs.module.js', 'PIGS_MODULE') + 'const FARM_DOCS = ' + JSON.stringify(farms) + ';\n', 'inlined', [
  ["import('./layout.engine.js')", 'Promise.resolve(LAYOUT_ENGINE)']
]);
put('ActBarn3JS.dc.html', wrap('pigs.module.js', 'PIGS_MODULE'), 'inlined', [['import(pigsUrl)', 'Promise.resolve(PIGS_MODULE)']]);
put('PigKit.dc.html', wrap('pigs.module.js', 'PIGS_MODULE'), 'inlined', [['import(pigsUrl)', 'Promise.resolve(PIGS_MODULE)']]);
