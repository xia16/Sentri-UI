// The settling protocol (docs/design-workflow/gate-v2.md §4): when a screen is still enough to be evidence, and when it is not.
// After the page says Ready, the visit samples every frame until the screen settles: fonts loaded, no scroll moving, no timer due
// soon, no finite animation running, no request in flight, and then no DOM change for a quiet window. It is shot, and shot again
// at the end of a second quiet window; the two must be the same image and nothing may have changed between them. A screen that
// doesn't settle within the bound, or moves after it settled, is unstable: the gate blocks. It never picks the good-looking shot.
// The decision is pure (settleDecision, verifyCapture; tests/settle.test.mjs); settleProbe and settleSample run in the page.

export const BOUNDS = {
  settle: 5000,   // ms from Ready to settled, at most; past it, whatever still moves makes the screen unstable
  timers: 1500,   // a timeout due within this many ms, or an interval at least this frequent, is pending work the screen waits for
  quiet: 300,     // ms with nothing changing before the first shot, and again before the second
  scroll: 100,    // ms since the last scroll event that still counts as scrolling
  sample: 50,     // ms between samples
};

// One sample, aggregated over every frame of the page:
//   { t: ms since Ready, fonts: 'loaded' | 'loading', scrolling, timers, animations, requests, mutations: running count }
const busy = (s) => [
  s.fonts !== 'loaded' && 'fonts still loading',
  s.scrolling && 'a scroll still moving',
  s.timers > 0 && `${s.timers} timer(s) due within ${BOUNDS.timers}ms`,
  s.animations > 0 && `${s.animations} animation(s) running`,
  s.requests > 0 && `${s.requests} request(s) in flight`,
].filter(Boolean);

// The samples so far → { state: 'wait' | 'settled' | 'unstable', why, at }. Settled at the first sample from which nothing is busy
// and the DOM hasn't changed for `quiet` ms. Unstable when the bound passes first; why names what kept the screen from settling.
export function settleDecision(samples, bounds = BOUNDS) {
  if (!samples.length) return { state: 'wait', why: 'no sample yet' };
  let from = null;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    if (busy(s).length || (from !== null && s.mutations !== samples[from].mutations)) { from = busy(s).length ? null : i; continue; }
    if (from === null) from = i;
    if (s.t - samples[from].t >= bounds.quiet) return { state: 'settled', at: samples[from].t, why: `still from ${Math.round(samples[from].t)}ms after Ready` };
  }
  const last = samples[samples.length - 1];
  if (last.t < bounds.settle) return { state: 'wait', why: busy(last).join(', ') || 'quiet window not over' };
  const why = busy(last);
  return { state: 'unstable', why: `not settled ${bounds.settle}ms after Ready: ${why.length ? why.join(', ') : 'the page kept changing'}` };
}

// After the first shot: the second shot, taken a quiet window later, must be the same image, and nothing may have changed in the
// page between them (a, b: the two PNG buffers; before, after: the samples taken with them).
export function verifyCapture({ a, b, before, after }) {
  const why = [];
  if (!a || !b) why.push('a shot is missing');
  else if (!Buffer.from(a).equals(Buffer.from(b))) why.push(`the screen moved after it settled: two shots ${BOUNDS.quiet}ms apart differ`);
  if (before && after && after.mutations !== before.mutations) why.push(`the page changed after it settled (${after.mutations - before.mutations} DOM change(s) between the two shots)`);
  if (after && busy(after).length) why.push(`after the first shot: ${busy(after).join(', ')}`);
  return why.length ? { stable: false, why: why.join('; ') } : { stable: true };
}

// In every frame, at document start (context.addInitScript). It counts DOM changes, notes scroll events and keeps the page's own
// pending timers. The timers are tracked through the page clock the visit installs (page.clock): its fake setTimeout/setInterval
// is wrapped when it is assigned, so the clock's own real-time ticks are never counted. Time is the real clock's.
export function settleProbe() {
  if (window.__sentriSettle) return;
  const realNow = performance.now.bind(performance);
  const S = window.__sentriSettle = { mutations: 0, lastScroll: -1e9, timeouts: new Map(), intervals: new Map(), now: realNow, tracking: false };
  const wrapTimeout = (inner) => function (fn, ms, ...rest) {
    let id;
    const due = realNow() + (Number(ms) || 0);
    id = inner.call(this, function () { S.timeouts.delete(id); return typeof fn === 'function' ? fn.apply(this, arguments) : undefined; }, ms, ...rest);
    S.timeouts.set(id, due);
    return id;
  };
  const wrapInterval = (inner) => function (fn, ms, ...rest) { const id = inner.call(this, fn, ms, ...rest); S.intervals.set(id, Number(ms) || 0); return id; };
  const wrapClear = (inner, map) => function (id) { S[map].delete(id); return inner.call(this, id); };
  const hook = (name, wrap) => {
    let inner = window[name], current = inner;
    try {
      Object.defineProperty(window, name, { configurable: true, get: () => current, set: (v) => { inner = v; current = wrap(v); S.tracking = true; } });
    } catch { /* not configurable: untracked */ }
  };
  hook('setTimeout', wrapTimeout);
  hook('setInterval', wrapInterval);
  hook('clearTimeout', (f) => wrapClear(f, 'timeouts'));
  hook('clearInterval', (f) => wrapClear(f, 'intervals'));
  try { new MutationObserver((list) => { S.mutations += list.length; }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true }); } catch {}
  document.addEventListener('scroll', () => { S.lastScroll = realNow(); }, true);
}

// In one frame: what is still moving there. Summed over the frames by the visit.
export function settleSample(bounds) {
  const S = window.__sentriSettle;
  if (!S) return null;
  const now = S.now();
  let timers = 0;
  for (const due of S.timeouts.values()) if (due - now <= bounds.timers && due - now > -bounds.timers) timers++;
  for (const every of S.intervals.values()) if (every <= bounds.timers) timers++;
  const animations = document.getAnimations ? document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getComputedTiming().endTime !== Infinity).length : 0;
  return { fonts: document.fonts ? document.fonts.status : 'loaded', scrolling: now - S.lastScroll < bounds.scroll, timers, animations, mutations: S.mutations };
}
