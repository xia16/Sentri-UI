// The machine's one-gate lock, taken in turn (docs/design-workflow/gate-machine.md). Before, every waiting gate polled the lock and
// whoever's link won took it: on 2026-10-20 a gate waited 3.5h while later ones went first, and a judged PR's seconds-long re-check
// (--verdict after main moved) queued behind full gates. Now a gate takes a ticket in sentri-gate/queue/ and takes the lock only when
// no live ticket sorts before its own: FIFO, with --verdict re-gates ("a" lane) ahead of ordinary gates ("b" lane). A ticket, the lock
// and a browser-run record are one process each (pid + start time, scripts/process-start.mjs): one whose process is gone is dropped.
// A browser run (sentri-gate/runs/, scripts/playwright-path.mjs) beats while it works; one that hasn't for RUN_STALE_MS is not
// waited for. Everything takes the gate's folder as an argument, so tests run against a temp folder.
import fs from 'node:fs';
import path from 'node:path';
import { holderAlive, selfStart } from './process-start.mjs';

export const RUN_STALE_MS = 10 * 60e3; // a browser run that hasn't beaten for 10 minutes is a leftover, not a run
export const BEAT_MS = 60e3;
export const BEAT_CPU_US = 20e3; // a beat is a minute in which the run used at least 20ms of CPU: an idle leftover doesn't beat

const short = (s) => String(s || '?').slice(0, 7);
const mins = (ms) => (ms < 60e3 ? `${Math.max(0, Math.round(ms / 1e3))}s` : `${Math.round(ms / 60e3)} min`);
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
// Whole or not at all, so a reader never sees half a record.
const writeWhole = (f, rec) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(`${f}.tmp${process.pid}`, JSON.stringify(rec)); fs.renameSync(`${f}.tmp${process.pid}`, f); };

const ticketName = (priority, at, pid) => `${priority ? 'a' : 'b'}-${String(at).padStart(15, '0')}-${pid}.json`;
const tickets = (q) => (fs.existsSync(q) ? fs.readdirSync(q).filter((f) => /^[ab]-\d+-\d+\.json$/.test(f)).sort() : []);

// The first live ticket before `mine` (all of them when mine is null), dropping the dead ones it meets. Only the tickets up to the
// first live one are checked: a start-time read is a process spawn on Windows.
function firstLive(q, mine, live) {
  for (const f of tickets(q)) {
    if (mine && f >= mine) return null;
    const t = readJson(path.join(q, f));
    if (t && live(t)) return { ...t, file: f };
    fs.rmSync(path.join(q, f), { force: true });
  }
  return null;
}

// Who a new browser run waits for: the gate holding the lock, else the first gate in the queue. Sync: playwright-path waits with
// Atomics.wait before it hands Playwright out.
export function gateAhead(dir, { live = holderAlive } = {}) {
  const lock = readJson(path.join(dir, 'gate.lock'));
  if (lock && live(lock)) return lock;
  return firstLive(path.join(dir, 'queue'), null, live);
}

// Wait for this gate's turn and take the lock. Returns { waited (s), release(), relabel(sha) }.
export async function takeTurn(dir, { ref = null, sha = null, priority = false, self = { pid: process.pid, start: selfStart() }, live = holderAlive, poll = 5000, now = Date.now, log = console.log, quiet = 5 * 60e3 } = {}) {
  const q = path.join(dir, 'queue'), lockFile = path.join(dir, 'gate.lock');
  fs.mkdirSync(q, { recursive: true });
  const t0 = now(), name = ticketName(priority, t0, self.pid), ticket = path.join(q, name);
  const at = new Date(t0).toISOString();
  const lockRec = (s) => ({ pid: self.pid, start: self.start, sha: s, ref, priority, at: new Date(lockedAt).toISOString() });
  let lockedAt = t0;
  const dropTicket = () => fs.rmSync(ticket, { force: true });
  if (self.pid === process.pid) process.on('exit', dropTicket);
  let said = '', saidAt = 0;
  try {
    for (;;) {
      if (!fs.existsSync(ticket)) writeWhole(ticket, { pid: self.pid, start: self.start, ref, sha, priority, at });
      const ahead = firstLive(q, name, live);
      let holder = null;
      if (!ahead) {
        lockedAt = now();
        const got = tryLock(lockFile, lockRec(sha), self, live, log);
        if (got === true) break;
        holder = got;
      } else {
        holder = readJson(lockFile);
        if (holder && !live(holder)) holder = null;
      }
      const behind = tickets(q).filter((f) => f < name).length;
      const who = holder ? `the gate on ${short(holder.sha)} (${holder.ref || '?'}, pid ${holder.pid}${holder.priority ? ', a re-check' : ''}) for ${mins(now() - Date.parse(holder.at))}` : ahead ? `the gate queued for ${short(ahead.sha)} (${ahead.ref || '?'}, pid ${ahead.pid})` : 'the lock';
      const line = `waiting for ${who} · ${behind ? `${behind} ahead in the queue` : 'next'}${priority ? ' (a re-check: ahead of ordinary gates)' : ''} …`;
      const key = [holder?.pid, ahead?.pid, behind].join(); // said again when who or where changes, else every `quiet` ms
      if (key !== said || now() - saidAt >= quiet) { log(line); said = key; saidAt = now(); }
      await sleep(poll);
    }
  } finally {
    dropTicket();
    if (self.pid === process.pid) process.off('exit', dropTicket);
  }
  const release = () => { const l = readJson(lockFile); if (l && l.pid === self.pid) fs.rmSync(lockFile, { force: true }); };
  if (self.pid === process.pid) process.on('exit', release);
  // the lock names what it gates once the ref has been resolved
  const relabel = (s) => { try { writeWhole(lockFile, lockRec(s)); } catch {} };
  return { waited: Math.round((now() - t0) / 1000), release, relabel };
}

// One attempt at the lock: true when taken, else the live holder (or null when it was just released). A lock whose process is gone
// is taken over; only the stale lock read is removed, never one another gate took since.
function tryLock(lockFile, rec, self, live, log) {
  for (let i = 0; i < 5; i++) {
    const tmp = `${lockFile}.${self.pid}`;
    fs.writeFileSync(tmp, JSON.stringify(rec));
    try { fs.linkSync(tmp, lockFile); fs.rmSync(tmp, { force: true }); return true; } catch (e) { fs.rmSync(tmp, { force: true }); if (e.code !== 'EEXIST') throw e; }
    let raw;
    try { raw = fs.readFileSync(lockFile, 'utf8'); } catch { continue; } // released between the two calls
    let lock = null;
    try { lock = JSON.parse(raw); } catch {}
    if (lock && lock.pid !== self.pid && live(lock)) return lock;
    try { if (fs.readFileSync(lockFile, 'utf8') === raw) { fs.rmSync(lockFile); log(`taking over a stale gate lock: pid ${lock?.pid ?? '?'} (the gate on ${short(lock?.sha)}) is gone, or its pid is another process now`); } } catch {}
  }
  return null;
}

// Under the lock: wait for the browser runs registered before it, each while its process lives and beats.
export async function waitForRuns(dir, { self = { pid: process.pid }, live = holderAlive, poll = 5000, now = Date.now, log = console.log, staleAfter = RUN_STALE_MS } = {}) {
  const runs = path.join(dir, 'runs');
  const told = new Set();
  for (let said = ''; ;) {
    const waitFor = [];
    for (const f of (fs.existsSync(runs) ? fs.readdirSync(runs) : []).filter((x) => x.endsWith('.json'))) {
      const r = readJson(path.join(runs, f));
      if (!r || r.pid === self.pid || !live(r)) { fs.rmSync(path.join(runs, f), { force: true }); continue; }
      const quiet = now() - Date.parse(r.beat || r.at);
      if (quiet > staleAfter) { if (!told.has(f)) { log(`not waiting for pid ${r.pid} ${r.what || ''}: it has not worked for ${mins(quiet)} (a leftover)`.replace('  ', ' ')); told.add(f); } continue; }
      waitFor.push({ ...r, quiet });
    }
    if (!waitFor.length) return;
    const line = `waiting for ${waitFor.length} other browser run(s) from this repo: ${waitFor.slice(0, 3).map((r) => `pid ${r.pid} ${r.what || '?'}, running ${mins(now() - Date.parse(r.at))}, last beat ${mins(r.quiet)} ago`).join('; ')} …`;
    const key = waitFor.map((r) => r.pid).join();
    if (key !== said) { log(line); said = key; }
    await sleep(poll);
  }
}

// A browser run's record, with its beat: refreshed each minute in which the process used the CPU.
export function registerRun(file, rec, { cpu = () => { const u = process.cpuUsage(); return u.user + u.system; }, every = BEAT_MS } = {}) {
  writeWhole(file, { ...rec, beat: rec.at });
  let last = cpu();
  const timer = setInterval(() => {
    const c = cpu();
    if (c - last >= BEAT_CPU_US) { try { writeWhole(file, { ...rec, beat: new Date().toISOString() }); } catch {} }
    last = c;
  }, every);
  timer.unref();
  return () => { clearInterval(timer); fs.rmSync(file, { force: true }); };
}
