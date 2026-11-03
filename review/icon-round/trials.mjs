// Round 3 trials (owner, 2026-11-03): move needs more work, batch needs its own glyph (not two pigs), piglet must differ
// from a small pig, missing needs no pig. Writes each variant into icons.js's `trial` block for the blind test.
// Usage: node review/icon-round/trials.mjs
import fs from 'node:fs';
import { pig } from './pig-family.mjs';

// A dashed circle: n arcs of radius r round (cx, cy), each covering `fill` of its slot.
function dashed(cx, cy, r, n, fill = 0.55) {
  const out = [], f = (v) => +v.toFixed(2);
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = a0 + (fill * 2 * Math.PI) / n;
    out.push(`M${f(cx + r * Math.cos(a0))} ${f(cy + r * Math.sin(a0))}A${r} ${r} 0 0 1 ${f(cx + r * Math.cos(a1))} ${f(cy + r * Math.sin(a1))}`);
  }
  return out.join('');
}
const fence = (x, w, y0 = 13, y1 = 21) => { // pickets every 4 units with two rails
  const p = [];
  for (let px = x; px <= x + w; px += 4) p.push(`M${px} ${y1}V${y0 + 1.5}l1-1.5 1 1.5`);
  // rails run between the pickets' outer edges
  p.push(`M${x} ${y0 + 3.5}H${x + w + 2}M${x} ${y1 - 2.5}H${x + w + 2}`);
  return p.join('');
};
const trial = {
  // Move: over the fence, a pig walking with an arrow, an arrow through an open gate, two pens and a curved path.
  'move-over': 'M9 21v-7l1.25-1.5L11.5 14v7M14.5 21v-7l1.25-1.5L17 14v7M7 16.5h12M7 19h12M3 14.5A9 9 0 0 1 19 6.5M19.6 2.4 19.3 7l-4.5-.5',
  'move-pig': pig({ x: 3, y: 10.5, w: 14, h: 8, legs: 2.5 }) + 'M4 5h13M14 2.5 17 5l-3 2.5',
  'move-curve': 'M2.5 14.5h7v6.5h-7zM14.5 14.5h7v6.5h-7zM6 11.5C6 6 18 6 18 11.5M15.5 9.5 18 12l2.5-2.5',
  // Batch: stacked layers, a frame of individuals, a crate, a stack of numbered cards.
  'batch-layers': 'M12 3.5 21 8l-9 4.5L3 8zM3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5',
  'batch-dots': 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 9h.01M12 9h.01M16 9h.01M8 15h.01M12 15h.01M16 15h.01',
  'batch-crate': 'M3 8h18v12H3zM2.5 4h19v4h-19zM7 8v12M17 8v12M10 12h4',
  'batch-cards': 'M8 3h11a2 2 0 0 1 2 2v11M5 6h11a2 2 0 0 1 2 2v11M4 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM7 15h4',
  'batch-hash': 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10.5 7 9 17M15 7l-1.5 10M7.5 10h10M6.5 14h10',
  'batch-week': 'M4 5h16v15H4zM8 3v4M16 3v4M4 9.5h16M6.5 13h11a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5z',
  'batch-ring': 'M3 12a9 6.5 0 1 0 18 0 9 6.5 0 1 0-18 0M8 12h.01M12 12h.01M16 12h.01',
  // Piglet: a baby bottle beside it, a chubby baby proportion (big head, short legs), a curly-tail baby with a bow-less big ear.
  'piglet-bottle': pig({ x: 2, y: 11, w: 11.5, h: 7, legs: 2.5 }) + 'M17.5 11h4v8.5a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5zM18.3 11V9h2.4v2M19.5 9V7M17.5 15h2',
  'piglet-chubby': 'M12 7.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM18.4 12.5h1.6a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1h-1.6M13 7.7 15.2 4l1.5 4.6M9 20v1.5M15 20v1.5M5.6 13c-1.4-.2-1.8-1.9-.5-2.4M16 12h.01',
  // Missing: a dashed circle with a question mark, a map pin with a question mark, a magnifier with a question mark.
  'missing-dashed': dashed(12, 12, 9, 10) + 'M9.6 9.8a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.6v.4M12 16.6h.01',
  'missing-pin': 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M9.8 8.4a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.5v.3M12 15h.01',
  'missing-search': 'M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15M16 16l5 5M8.4 8.6a2.2 2.2 0 1 1 3 2c-.5.2-.9.7-.9 1.3v.3M10.5 14.6h.01',
};
const file = new URL('./icons.js', import.meta.url);
let s = fs.readFileSync(file, 'utf8');
const body = Object.entries(trial).map(([k, v]) => `    '${k}':'${v}'`).join(',\n');
const block = `  // Round 3 trials, for the blind test only (trials.mjs).\n  const trial={\n${body}\n  };\n`;
s = s.includes('const trial={') ? s.replace(/  \/\/ Round 3 trials[\s\S]*?\n  \};\n/, block) : s.replace('  // Old names keep working', block + '  // Old names keep working');
s = s.replace('root.SentriIconsNext={paths:add,aliases:alias,cut};', 'root.SentriIconsNext={paths:add,aliases:alias,cut,trial};');
fs.writeFileSync(file, s);
console.log('trials', Object.keys(trial).join(' '));
