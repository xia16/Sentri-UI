// One machine scheduler for all browser work (docs/design-workflow/gate-v2.md §4): shots, visit checks, state checks and leaves
// all run through it, in one browser, at most WORKERS (scripts/machine.mjs) at once. It may go lower under load: leaf runs feed the
// AIMD window (aimdStep), and any recognised machine error halves it. A process that opens browsers of its own (npm test) holds
// slots by weight.
// Machine errors (scripts/machine.mjs classifyMachineError: a navigation timeout, net::ERR_*) are retried once, under controlled
// conditions: after the queue has drained, one task at a time, nothing else running, in a fresh context (each task opens its own).
// A second machine error is reported as such ({ machine, retried }): the caller blocks, never passes. Any other failure stands:
// nothing is ever re-run because it failed, and nothing passes because it passed alone.
import { WORKERS, LAUNCH_ARGS, aimdStep, classifyMachineError } from './machine.mjs';

// task: { kind, label, weight = 1, priority = 0 (lower first), run: async ({ browser }) => result }
// A result with `machine` set (or a throw whose message is a machine error) is a machine error. Another throw is { error }.
export function createScheduler({ playwright, workers = WORKERS, log = () => {} }) {
  let browser = null, launching = null;
  const ensure = () => browser ? Promise.resolve(browser) : (launching ||= playwright().chromium.launch({ args: LAUNCH_ARGS }).then((b) => (browser = b)));
  const queue = [], retries = [];
  let busy = 0, running = 0, ctl = { limit: workers, min: 1, max: workers, baseline: null };
  const stats = { byKind: {}, retried: 0, machineTwice: 0, lowest: workers, started: Date.now(), firstAt: {}, lastAt: {} };
  let solo = false;
  const idleWaiters = [];
  const note = (kind, ms) => {
    const k = (stats.byKind[kind] ||= { n: 0, ms: 0 });
    k.n++; k.ms += ms;
    stats.lastAt[kind] = Date.now();
  };
  const halve = (why) => { const limit = Math.max(1, Math.floor(ctl.limit / 2)); if (limit !== ctl.limit) log(`scheduler: ${ctl.limit} → ${limit} at once (${why})`); ctl = { ...ctl, limit, window: [], round: 0 }; stats.lowest = Math.min(stats.lowest, limit); };
  const machineOf = (r) => (r && typeof r === 'object' && r.machine ? r.machine : null);

  async function exec(t, alone) {
    const s = Date.now();
    stats.firstAt[t.kind] ??= s;
    let r;
    try { r = await t.run({ browser: t.browserless ? null : await ensure(), alone }); }
    catch (e) { const msg = String(e?.message || e).split('\n')[0]; r = classifyMachineError(msg) ? { machine: classifyMachineError(msg), error: msg } : { error: msg }; }
    note(t.kind, Date.now() - s);
    if (t.kind === 'leaf' && !alone) { const { state, why } = aimdStep(ctl, { ms: Date.now() - s, timedOut: !!machineOf(r) }); if (why && state.limit !== ctl.limit) log(`scheduler: ${ctl.limit} → ${state.limit} at once (${why})`); ctl = state; stats.lowest = Math.min(stats.lowest, ctl.limit); }
    else if (machineOf(r) && !alone) halve(`${t.label}: ${machineOf(r)}`);
    return r;
  }
  function pump() {
    queue.sort((a, b) => a.priority - b.priority || a.seq - b.seq);
    while (queue.length && !solo) {
      const t = queue[0], w = Math.min(t.weight, ctl.limit);
      if (running && busy + w > ctl.limit) break;
      queue.shift(); busy += w; running++;
      exec(t, false).then((r) => {
        busy -= w; running--;
        if (machineOf(r)) { stats.retried++; log(`machine error, retried alone once the queue drains: ${t.label} (${r.machine}: ${String(r.error || '').slice(0, 120)})`); retries.push({ t, first: r }); }
        else t.resolve(r);
        pump();
      });
    }
    if (!queue.length && !running && retries.length) {
      // controlled conditions: alone, one at a time
      const { t, first } = retries.shift();
      running++; solo = true;
      exec(t, true).then((r) => {
        running--; solo = false;
        if (machineOf(r)) { stats.machineTwice++; t.resolve({ ...r, retried: true, firstError: first.error }); }
        else t.resolve({ ...r, retried: true, firstError: first.error });
        pump();
      });
      return;
    }
    if (!queue.length && !running && !retries.length) { for (const w of idleWaiters.splice(0)) w(); }
  }
  let seq = 0;
  return {
    run(task) { return new Promise((resolve) => { queue.push({ weight: 1, priority: 0, ...task, seq: seq++, resolve }); pump(); }); },
    drained() { return new Promise((r) => { if (!queue.length && !running && !retries.length) r(); else idleWaiters.push(r); }); },
    browser: ensure,
    get limit() { return ctl.limit; },
    stats,
    async close() { if (browser) await browser.close().catch(() => {}); browser = null; launching = null; },
  };
}
