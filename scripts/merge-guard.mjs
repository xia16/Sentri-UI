// Claude Code PreToolUse hook: our sessions merge only in one form, pinned to the gated commit, and nothing they run can move main
// another way. Registered in .claude/settings.json. Reads the hook's JSON on stdin; exit 2 blocks the command and shows the reason.
// Whether the commit passed the gate is GitHub's to say: branch protection on main requires the sentri/gate status, with the branch
// up to date with main (gate-simplify.md G2), so a pass made against an older main can't merge however it is attempted.
//
// A convenience, not a security boundary: a command line can always be spelled past a hook. The boundary is GitHub's branch
// protection requiring the gate's `sentri/gate` status. So this is an allowlist, and it fails closed:
//   merge: exactly  gh pr merge <n> [-R owner/repo] --squash [--delete-branch] --match-head-commit <40-hex sha>
//   push:  each push exactly  git push [-q] [-u|--set-upstream] origin <branch>   (a named branch that isn't main)
//   auto-merge: never.

const block = (why) => { console.error(`merge guard: ${why}\nMerges run only behind GATE PASS (docs/design-workflow/briefs/gate.md): node scripts/gate.mjs --verdict <out>, then, as a command of its own:\n  gh pr merge <n> --squash --match-head-commit <sha>\nPushes name their branch: git push origin <branch>.`); process.exit(2); };
process.on('uncaughtException', (e) => block(`the guard failed (${e.message}), so it blocks`));

let input = '';
for await (const chunk of process.stdin) input += chunk;
let j;
try { j = JSON.parse(input || '{}'); } catch { block('unreadable hook input'); }
if (/auto_?merge/i.test(String(j.tool_name || ''))) block('auto-merge would merge without the gate; merge behind GATE PASS instead');
if (j.tool_name !== 'Bash' && j.tool_name !== 'PowerShell') process.exit(0);
const cmd = String(j.tool_input?.command || '');

// Normalise away quoting, escapes and .exe before looking for anything that could merge a PR or move main.
const plain = cmd.replace(/["'`^\\]/g, '').replace(/\.exe\b/gi, '');
const SAFE_PR = /^(view|list|create|edit|comment|checks|diff|status|checkout|ready|close|reopen|review)$/;
const prSub = [...plain.matchAll(/\bgh\s+pr\s+(\S+)/gi)].map((m) => m[1]);
const isMerge = prSub.some((s) => !SAFE_PR.test(s))
  || /pulls\/\d+\/merge|\/merges\b|mergePullRequest|PullRequestAutoMerge|auto-merge|git\/refs/i.test(plain);

// Pushes: every push segment must name a branch that isn't main; a command that pushes may not switch to main first.
if (/\bpush\b/i.test(plain) && /\bgit\b/i.test(plain)) {
  const segs = plain.split(/;|&&|\|\||\||&|\r?\n/).map((s) => s.trim()).filter((s) => /\bpush\b/i.test(s));
  for (const seg of segs) {
    const m = seg.match(/^git push(?: -q| --quiet)?(?: -u| --set-upstream)? origin ([\w./-]+)$/);
    if (!m || /^(main|master|HEAD)$/i.test(m[1]) || m[1].includes(':')) block(`a push must be one plain "git push origin <branch>" naming a branch that isn't main: "${seg}"`);
  }
  if (/\b(checkout|switch)\b[^;&|\n]*\b(main|master)\b/i.test(plain)) block('a command that pushes may not switch to main');
}
if (!isMerge) process.exit(0);

const m = cmd.trim().match(/^gh pr merge (\d+)(?: (?:-R|--repo) [\w.-]+\/[\w.-]+)? --squash(?: --delete-branch)? --match-head-commit ([0-9a-f]{40})$/);
if (!m) block('a merge must be one command on its own, exactly: gh pr merge <n> --squash --match-head-commit <full sha>');
process.exit(0);
