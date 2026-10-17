// The settling protocol's decisions (scripts/settle.mjs, docs/design-workflow/gate-v2.md §4), and the PNG diff the comparison uses.
import test from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import { settleDecision, verifyCapture, BOUNDS } from '../scripts/settle.mjs';
import { pctDiff, decodePng } from '../scripts/png.mjs';

const still = (t, mutations = 5, extra = {}) => ({ t, fonts: 'loaded', scrolling: false, timers: 0, animations: 0, requests: 0, mutations, ...extra });
const run = (list) => { const out = []; let d; for (const s of list) { out.push(s); d = settleDecision(out); if (d.state !== 'wait') return d; } return d; };
const every = (ms, from = 0, to = 6000) => { const t = []; for (let x = from; x <= to; x += ms) t.push(x); return t; };

test('settled: nothing busy and no DOM change for the quiet window', () => {
  const d = run(every(50).map((t) => still(t)));
  assert.equal(d.state, 'settled');
  assert.equal(d.at, 0);
  assert.ok(BOUNDS.quiet >= 200);
});

test('settling waits for fonts, a scroll, a pending timer, an animation and a request, then for the quiet window after them', () => {
  for (const busy of [{ fonts: 'loading' }, { scrolling: true }, { timers: 1 }, { animations: 1 }, { requests: 2 }]) {
    const d = run(every(50).map((t) => still(t, 5, t < 600 ? busy : {})));
    assert.equal(d.state, 'settled', JSON.stringify(busy));
    assert.equal(d.at, 600, JSON.stringify(busy));
  }
});

test('a one-off change (a timer firing once) restarts the quiet window; the screen settles after it', () => {
  const d = run(every(50).map((t) => still(t, t < 200 ? 5 : 9)));
  assert.equal(d.state, 'settled');
  assert.equal(d.at, 200);
});

test('unstable: a page that keeps changing, or a timer that keeps coming due, past the bound', () => {
  const moving = run(every(50).map((t) => still(t, Math.floor(t / 100))));
  assert.equal(moving.state, 'unstable');
  assert.match(moving.why, /kept changing/);
  const ticking = run(every(50).map((t) => still(t, 5, { timers: 1 })));
  assert.equal(ticking.state, 'unstable');
  assert.match(ticking.why, /timer\(s\) due/);
  assert.equal(run(every(50).map((t) => still(t, 5, { fonts: 'loading' }))).why.includes('fonts still loading'), true);
});

test('waiting is not a verdict: before the bound a busy page is still waiting', () => {
  assert.equal(settleDecision([still(0, 5, { timers: 1 })]).state, 'wait');
  assert.equal(settleDecision([]).state, 'wait');
});

test('the second shot must be the same image with nothing changed between: a page that moves after it settled is unstable', () => {
  const a = Buffer.from('aaaa'), b = Buffer.from('bbbb');
  assert.deepEqual(verifyCapture({ a, b: Buffer.from(a), before: still(0), after: still(300) }), { stable: true });
  assert.match(verifyCapture({ a, b, before: still(0), after: still(300) }).why, /moved after it settled/);
  assert.match(verifyCapture({ a, b: Buffer.from(a), before: still(0, 5), after: still(300, 6) }).why, /changed after it settled/);
  assert.match(verifyCapture({ a, b: Buffer.from(a), before: still(0), after: still(300, 5, { timers: 1 }) }).why, /timer/);
  assert.equal(verifyCapture({ a, b: null }).stable, false);
});

// a tiny RGBA PNG, built here (filter 0 per row)
function png(w, h, px) {
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'latin1'), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px(x, y).forEach((v, i) => { raw[y * (w * 4 + 1) + 1 + x * 4 + i] = v; });
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

test('pixel diff: identical bytes are 0, one changed pixel of 16 is 6.25%, a size change counts the extra pixels', () => {
  const white = () => [255, 255, 255, 255];
  const a = png(4, 4, white), b = png(4, 4, (x, y) => (x === 1 && y === 2 ? [254, 255, 255, 255] : white()));
  assert.equal(pctDiff(a, Buffer.from(a)), 0);
  assert.equal(pctDiff(a, b), 6.25);
  assert.equal(pctDiff(a, png(4, 8, white)), 50);
  assert.equal(decodePng(b).data[(2 * 4 + 1) * 4], 254);
  assert.equal(pctDiff(a, Buffer.from('not a png')), 100);
});
