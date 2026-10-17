// The machine, not the design: the one scheduler setting, the browser's launch flags, the errors that say the machine was busy or
// the network blinked, and the AIMD window. No gate rules here: the scenario runner, the visits and the scheduler import this, and
// what imports it is part of their evidence identity (docs/design-workflow/gate-v2.md §3), so it stays small.

// How many browser tasks run at once on this machine: one scheduler for every shot, check, state check and leaf (gate-v2.md §4).
// A measured setting (four gates' worth of nav timeouts at 6+, none at 4 on an 8-core laptop), set here and nowhere else. The
// scheduler may go lower under load (aimdStep); it never goes higher. SENTRI_WORKERS overrides it for one run.
export const WORKERS = Math.max(1, Math.min(16, Number(process.env.SENTRI_WORKERS) || 4));

// One raster thread: Chromium's parallel raster anti-aliases a curve a hair differently from run to run (a channel off by 1-2 at
// a chip's rounded corners), so the same commit shot twice differed (#173). With one thread, 8 runs of 8 are identical.
export const LAUNCH_ARGS = ['--num-raster-threads=1', '--disable-partial-raster'];

// A scenario run that failed only because a navigation timed out (page.goto, a reload, Back, waitForLoadState), or was refused by
// the network (net::ERR_*, e.g. ERR_NO_BUFFER_SPACE when Windows ran out of sockets under parallel runs, #187 2026-10-17), says
// nothing about the design: it is run once more. An assertion failure, a missing control or a page error never retries.
const NAV_TIMEOUT = /\b(page|frame)\.(goto|reload|goBack|goForward|waitForLoadState|waitForURL|waitForNavigation): (Timeout \d+ms exceeded|net::ERR_[A-Z_]+)/;
export const timedOutOnly = (failures) => failures.length > 0 && failures.every((f) => NAV_TIMEOUT.test(String(f.got)));

// The recognised machine errors (gate-v2.md §4): a navigation that timed out, and a request the network or the server dropped
// (net::ERR_*). Everything else — an assertion, a missing control, a page error, a Ready that never came — is a design result
// and stands. Returns 'navigation-timeout', 'net-error' or null.
const NET_ERROR = /\bnet::ERR_[A-Z_]+\b/;
export function classifyMachineError(text) {
  const s = String(text || '');
  if (NET_ERROR.test(s)) return 'net-error';
  if (NAV_TIMEOUT.test(s)) return 'navigation-timeout';
  return null;
}
// A run's failures ({ got } or strings) are a machine error only when every one of them is: one design failure among them and the
// run stands as it is. Returns the first failure's machine class, or null.
export function machineErrorOf(failures) {
  const list = [].concat(failures || []).map((f) => (f && typeof f === 'object' ? f.got ?? f.error ?? f.message : f));
  if (!list.length) return null;
  const kinds = list.map(classifyMachineError);
  return kinds.every(Boolean) ? kinds[0] : null;
}

// How many scenario runs go at once (run-scenarios.mjs), found like TCP finds its window: additive increase, multiplicative
// decrease. It starts at `start`; the first runs set a baseline (their median time); after each round (as many runs as the window),
// it adds one while the round's median stays within 1.5x the baseline, and halves when it passes 2.5x (the machine is crowded,
// e.g. another session's tests). A run that hit a navigation timeout halves it at once. Never below 1 or above max.
// state: { limit, min, max, baseline, warm: [ms], window: [ms], round }; returns the next state and why it changed (or null).
export function aimdStep(state, { ms, timedOut = false }) {
  const s = { ...state, warm: [...(state.warm || [])], window: [...(state.window || [])] };
  const median = (a) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.floor((b.length - 1) / 2)] : 0; };
  if (timedOut) { const limit = Math.max(s.min, Math.floor(s.limit / 2)); const why = limit !== s.limit ? 'a navigation timed out' : null; return { state: { ...s, limit, window: [], round: 0 }, why }; }
  if (s.baseline == null) { s.warm.push(ms); if (s.warm.length >= 6) { s.baseline = median(s.warm); s.round = 0; } return { state: s, why: null }; }
  s.window.push(ms); s.round = (s.round || 0) + 1;
  if (s.round < s.limit || s.window.length < 3) return { state: s, why: null };
  const m = median(s.window), next = { ...s, window: [], round: 0 };
  if (m > 2.5 * s.baseline) { next.limit = Math.max(s.min, Math.floor(s.limit / 2)); return { state: next, why: next.limit !== s.limit ? `runs slowed to ${(m / s.baseline).toFixed(1)}x` : null }; }
  if (m <= 1.5 * s.baseline && s.limit < s.max) { next.limit = s.limit + 1; return { state: next, why: `runs at ${(m / s.baseline).toFixed(1)}x` }; }
  return { state: next, why: null };
}
