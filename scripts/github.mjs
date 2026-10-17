// The gate's GitHub calls (the shared-component queue, PR files, the sentri/gate status). A network error (EOF, TLS, a timeout, a
// 5xx) is tried twice more after a short wait, then reported as "GitHub could not be reached", never read as an answer. An answer
// is never retried.
import { spawnSync } from 'node:child_process';
import { ghNetworkError } from './loop-rules.mjs';

export function gh(args, cwd) {
  for (let n = 1; ; n++) {
    const r = spawnSync('gh', args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20, timeout: 60e3 });
    if (r.status === 0) return { ok: true, out: r.stdout || '' };
    const err = `${r.stderr || ''} ${r.error?.code || ''} ${r.error?.message || ''}`.trim();
    const line = (err.split('\n').find((l) => l.trim()) || `exit ${r.status}`).trim();
    if (!ghNetworkError(err)) return { ok: false, why: `GitHub answered: ${line}` };
    if (n === 3) return { ok: false, why: `GitHub could not be reached (3 tries): ${line}` };
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000 * n);
  }
}

export const postStatus = (cwd, sha, state, description) => gh(['api', '--method', 'POST', `repos/{owner}/{repo}/statuses/${sha}`, '-f', `state=${state}`, '-f', 'context=sentri/gate', '-f', `description=${description}`], cwd);

// The open PRs in the shape `gh pr list --json number,headRefName,headRefOid,createdAt,isDraft,files,statusCheckRollup` gives,
// read over REST: GraphQL (which gh pr list uses) is blocked in cloud sessions.
export function openPrs(cwd) {
  // Pages by number: --paginate follows Link headers with numeric-ID paths, which the cloud proxy refuses.
  const page = (p, jq) => { const r = gh(['api', p, '--jq', jq], cwd); if (!r.ok) throw new Error(`gh api ${p}: ${r.why}`); return r.out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)); };
  const api = (p, jq) => { const all = []; for (let n = 1; n <= 30; n++) { const got = page(`${p}&page=${n}`, jq); all.push(...got); if (got.length < 100) break; } return all; };
  try {
    return api('repos/{owner}/{repo}/pulls?state=open&per_page=100', '.[] | {number, headRefName: .head.ref, headRefOid: .head.sha, createdAt: .created_at, isDraft: .draft}').map((p) => ({
      ...p,
      files: api(`repos/{owner}/{repo}/pulls/${p.number}/files?per_page=100`, '.[] | {path: .filename}'),
      statusCheckRollup: api(`repos/{owner}/{repo}/commits/${p.headRefOid}/statuses?per_page=100`, '.[] | {context, state: (.state | ascii_upcase)}'),
    }));
  } catch (e) { return { error: e.message }; }
}
