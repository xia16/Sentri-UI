// Draws the pig family from one body so every animal glyph shares its proportions, and writes the paths into icons.js.
// A pig is a stadium (round ends) facing right: snout block, pointed ear on the back, two legs, a curled tail, an eye dot.
// Usage: node review/icon-round/pig-family.mjs
import fs from 'node:fs';
const f = (n) => +n.toFixed(2);
// x,y = top-left of the body; w,h = body size; parts toggles the details a small pig can't carry.
function pig({ x, y, w, h, ear = true, tail = true, eye = true, legs = 3, top = true, bottom = true }) {
  const r = h / 2, x1 = x + r, x2 = x + w - r, yb = y + h, cy = y + r;
  const sh = Math.max(1.6, h * 0.36), sw = Math.max(1.3, h * 0.22);
  const p = [];
  if (top && bottom) p.push(`M${f(x1)} ${f(y)}H${f(x2)}A${f(r)} ${f(r)} 0 0 1 ${f(x2)} ${f(yb)}H${f(x1)}A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y)}z`);
  p.push(`M${f(x + w)} ${f(cy - sh / 2)}h${f(sw - 0.5)}a.5.5 0 0 1 .5.5v${f(sh - 1)}a.5.5 0 0 1-.5.5H${f(x + w)}`);
  if (ear) { const ex = x2 - r * 0.35; p.push(`M${f(ex - h * 0.2)} ${f(y + 0.1)}L${f(ex + h * 0.02)} ${f(y - h * 0.3)}L${f(ex + h * 0.26)} ${f(y + 0.25)}`); }
  if (legs) { p.push(`M${f(x1 + 0.2)} ${f(yb)}v${legs}M${f(x2 - 0.2)} ${f(yb)}v${legs}`); }
  if (tail) p.push(`M${f(x + 0.15)} ${f(cy - h * 0.12)}c-1.2-.3-1.4-1.6-.3-2`);
  if (eye) p.push(`M${f(x2 + r * 0.25)} ${f(cy - h * 0.12)}h.01`);
  return p.join('');
}
const base = { x: 3, y: 6.5, w: 16, h: 10 };
const big = pig(base);
const sowDots = 'M9.8 18.6h.01M12.2 18.6h.01';
const out = {
  pig: big,
  sow: big + sowDots,
  boar: big + 'M18.4 15c1.6.6 3.3-.1 3.9-1.8',
  gilt: pig({ x: 5, y: 9.5, w: 13, h: 8, legs: 2.5 }) + 'M5.5 3.2l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z',
  piglet: pig({ x: 6, y: 10, w: 11, h: 7, legs: 2.5 }),
  pregnancy: big + 'M12 11.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  'not-pregnant': big + 'M12 11.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0M3 3l18 18',
  // Two pigs: the front one whole, the one behind only where it shows (its back, ear and snout, and its far leg).
  pigs: pig({ x: 2, y: 11, w: 12.5, h: 7.5, legs: 2.2 }) + 'M9.6 9.3A3.75 3.75 0 0 1 12.95 6.5H17.3A3.75 3.75 0 0 1 17.3 14H16.4M21.05 8.6h1.15a.4.4 0 0 1 .4.4v1.6a.4.4 0 0 1-.4.4H21.05M15.6 6.6L16.5 4.3L17.5 6.7M17.3 14v2.2',
  litter: pig({ x: 3, y: 12.5, w: 10, h: 6, legs: 2, tail: false }) + 'M9.4 10.9A3 3 0 0 1 12 9H16.5A3 3 0 0 1 16.5 15H14.6M19.5 10.9h1a.4.4 0 0 1 .4.4v1.4a.4.4 0 0 1-.4.4H19.5M14.7 9.1L15.4 7.3L16.3 9.2M16.5 15v2',
  farrow: pig({ x: 3, y: 5, w: 16, h: 9, legs: 0 }) + pig({ x: 7, y: 16.5, w: 8, h: 4.5, legs: 0, tail: false, ear: false }),
  foster: pig({ x: 6, y: 13, w: 11, h: 7, legs: 0, tail: false }) + 'M4 10a8 6 0 0 1 15.5-2.5M20 3.5v4.3h-4.3',
  wean: pig({ x: 10, y: 9.5, w: 10.5, h: 6.5, legs: 2.5 }) + 'M2.5 12.75h4M4.8 10.75l2 2-2 2',
};
const file = new URL('./icons.js', import.meta.url);
let s = fs.readFileSync(file, 'utf8');
for (const [k, v] of Object.entries(out)) {
  const re = new RegExp(`(\\n    '?${k}'?:)'[^']*'`);
  if (!re.test(s)) throw new Error('no entry ' + k);
  s = s.replace(re, (m, a) => `${a}'${v}'`);
}
fs.writeFileSync(file, s);
console.log('wrote', Object.keys(out).join(', '));
