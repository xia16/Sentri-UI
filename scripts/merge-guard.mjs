// Claude Code PreToolUse hook: our workflow's merges run only behind a gate pass on that exact commit, against main as it is now.
// Registered in .claude/settings.json. Reads the hook's JSON on stdin; exit 2 blocks the command and shows the reason.
// The pass record is written by `node scripts/gate.mjs --verdict <out>` on GATE PASS; never write one by hand.
//
// A convenience, not a security boundary: it stops ungated merges by our own sessions and says why, early. A command line can
// always be spelled past a hook; the boundary is GitHub's own branch protection requiring the gate's status on the commit.
// So it is an allowlist: anything that could merge or move main is blocked unless the whole command is exactly one pinned merge:
//   gh pr merge <n> [-R owner/repo] --squash [--delete-branch] --match-head-commit <40-hex sha>
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let cmd = '';
try { const j = JSON.parse(input || '{}'); if (j.tool_name === 'Bash' || j.tool_name === 'PowerShell') cmd = String(j.tool_input?.command || ''); } catch { process.exit(0); }

const block = (why) => { console.error(`merge guard: ${why}\nMerges run only behind GATE PASS (docs/design-workflow/briefs/gate.md): node scripts/gate.mjs --verdict <out>, then, as a command of its own:\n  gh pr merge <n> --squash --match-head-commit <sha>`); process.exit(2); };
const git = (args) => spawnSync('git', args, { encoding: 'utf8' });

// Normalise away quoting, escapes and .exe, then look for anything that could merge a PR or move main.
const plain = cmd.replace(/["'`^\\]/g, '').replace(/\.exe\b/gi, '');
const SAFE_PR = /^(view|list|create|edit|comment|checks|diff|status|checkout|ready|close|reopen|review)$/;
const prSub = [...plain.matchAll(/\bgh\s+pr\s+(\S+)/gi)].map((m) => m[1]);
const isMerge = prSub.some((s) => !SAFE_PR.test(s))                        // gh pr merge, gh pr $X, gh pr m*: anything not known safe
  || /pulls\/\d+\/merge|\/merges\b|mergePullRequest|enablePullRequestAutoMerge|git\/refs/i.test(plain); // REST, GraphQL, refs
const pushes = /\bgit\b[^\n;&|]*\bpush\b/i.test(plain);
const onMain = () => ['main', 'master'].includes(git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim());
const pushArgs = plain.split(/\bpush\b/i).slice(1).join(' ').split(/[;&|\n]/)[0].trim().split(/\s+/).filter((a) => a && !a.startsWith('-'));
if (pushes && (/(^|[\s:/+])(main|master)\b/i.test(pushArgs.join(' ')) || /--(all|mirror)\b/i.test(plain) || (pushArgs.length <= 1 && onMain())))
  block('pushes that could move main are not allowed; main changes only through a gated PR');
if (!isMerge) process.exit(0);

const m = cmd.trim().match(/^gh pr merge (\d+)(?: (?:-R|--repo) [\w.-]+\/[\w.-]+)? --squash(?: --delete-branch)? --match-head-commit ([0-9a-f]{40})$/);
if (!m) block('a merge must be one command on its own, exactly: gh pr merge <n> --squash --match-head-commit <full sha>');
const sha = m[2];
const common = git(['rev-parse', '--git-common-dir']).stdout.trim();
if (!common) block('not inside the repository');
const file = path.join(path.resolve(common), 'sentri-gate', `${sha}.json`);
if (!fs.existsSync(file)) block(`no gate pass for ${sha.slice(0, 7)}`);
let pass;
try { pass = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { block(`the gate pass for ${sha.slice(0, 7)} can't be read`); }
if (git(['fetch', '-q', 'origin']).status !== 0) block("git fetch failed, so main can't be checked");
const main = git(['rev-parse', 'origin/main']).stdout.trim();
if (main !== pass.base) block(`main moved to ${main.slice(0, 7)} since ${sha.slice(0, 7)} was gated against ${String(pass.base).slice(0, 7)}: merge main forward and gate again`);
process.exit(0);
