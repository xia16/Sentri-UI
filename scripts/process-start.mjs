// Who holds the gate lock (scripts/gate.mjs) or a browser-run record (sentri-gate/runs/, scripts/playwright-path.mjs): a process is
// its pid AND when it started. A pid alone is not enough: after a reboot Windows hands old pids to new processes, and on 2026-10-18 a
// svchost.exe took a killed gate's pid 2348, so its lock read as held and the next gate waited forever. Kept apart from the gate's
// rules and from playwright-path (which finds Playwright when it is imported), so both can use it without side effects.
import { execFileSync } from 'node:child_process';

// How far the OS's start time for a pid may sit from the one a record holds and still be the same process: the two clocks are read
// differently (the OS's creation time; Date.now() - uptime here), never hours apart, which is what a reused pid is.
export const START_SLACK_MS = 5000;

export const pidAlive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };

// This process's start, in ms since the epoch: what a record stores.
export const selfStart = () => Math.round(Date.now() - process.uptime() * 1000);

// When the process with this pid started, in ms since the epoch, as the OS says; null when it can't be read (no such process, no
// permission, the tool missing). On Windows through CIM, which reads system processes Get-Process can't.
export function startOf(pid) {
  const n = Number(pid);
  if (!Number.isInteger(n) || n <= 0) return null;
  try {
    const out = process.platform === 'win32'
      ? execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', `$p = Get-CimInstance Win32_Process -Filter 'ProcessId=${n}'; if ($p) { $p.CreationDate.ToUniversalTime().ToString('o') }`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15000, windowsHide: true })
      : execFileSync('ps', ['-o', 'lstart=', '-p', String(n)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15000 });
    const t = Date.parse(String(out).trim());
    return Number.isFinite(t) ? t : null;
  } catch { return null; }
}

// Is the process a record names still the one that wrote it? A dead pid is not; a live pid whose start time is readable and far from
// the recorded one is a reused pid, so not either. A start time that can't be read, or a record written before records carried one,
// falls back to the pid alone: never take over a lock that may still be held.
export function holderAlive(rec, { alive = pidAlive, start = startOf } = {}) {
  if (!rec || !Number.isInteger(rec.pid) || !alive(rec.pid)) return false;
  if (!Number.isFinite(rec.start)) return true;
  const s = start(rec.pid);
  return s === null || Math.abs(s - rec.start) <= START_SLACK_MS;
}
