// Claude Code PreToolUse hook: a merge runs only behind a gate pass on that exact commit, against main as it is now.
// Registered in .claude/settings.json. Reads the hook's JSON on stdin; exit 2 blocks the command and shows the reason.
// The pass record is written by `node scripts/gate.mjs --verdict <out>` on GATE PASS; never write one by hand.
//
// An allowlist, not a parser: any command that looks like a merge (or a push to main) is blocked unless the whole command is
// exactly one pinned merge:  gh pr merge <n> [-R owner/repo] --squash [--delete-branch] --match-head-commit <40-hex sha>
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let cmd = '';
try { const j = JSON.parse(input || '{}'); if (j.tool_name === 'Bash' || j.tool_name === 'PowerShell') cmd = String(j.tool_input?.command || ''); } catch { process.exit(0); }

const block = (why) => { console.error(`merge guard: ${why}\nMerges run only behind GATE PASS (docs/design-workflow/briefs/gate.md): node scripts/gate.mjs --verdict <out>, then, as a command of its own:\n  gh pr merge <n> --squash --match-head-commit <sha>`); process.exit(2); };

// Looks like a merge or a push to main, however it is quoted or spelled (gh.exe, "pr" "merge", the REST endpoint).
const plain = cmd.replace(/["'`^]/g, '').replace(/\.exe\b/gi, '');
const isMerge = /\bpr\s+merge\b/i.test(plain) || /pulls\/\d+\/merge\b/i.test(plain);
const isPushToMain = /\bgit\b[^\n]*\bpush\b[^\n]*(\s|:)(main|master)\b/i.test(plain);
if (isPushToMain) block('direct pushes to main are not allowed; main changes only through a gated PR');
if (!isMerge) process.exit(0);

const m = cmd.trim().match(/^gh pr merge (\d+)(?: (?:-R|--repo) [\w.-]+\/[\w.-]+)? --squash(?: --delete-branch)? --match-head-commit ([0-9a-f]{40})$/);
if (!m) block('a merge must be one command on its own, exactly: gh pr merge <n> --squash --match-head-commit <full sha>');
const sha = m[2];
const git = (args) => spawnSync('git', args, { encoding: 'utf8' });
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
