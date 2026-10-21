// Claude Code PreToolUse hook: our sessions merge only in one form, pinned to the gated commit, and nothing they run can move main
// another way. Registered in .claude/settings.json. Reads the hook's JSON on stdin; exit 2 blocks the command and shows the reason.
// Whether the commit passed the gate is GitHub's to say: branch protection on main requires the sentri/gate status, with the branch
// up to date with main (gate-simplify.md G2), so a pass made against an older main can't merge however it is attempted.
//
// A convenience, not a security boundary: a command line can always be spelled past a hook. The boundary is GitHub's branch
// protection requiring the gate's `sentri/gate` status. So this is an allowlist, and it fails closed:
//   merge: exactly  gh pr merge <n> [-R owner/repo] --squash [--delete-branch] --match-head-commit <40-hex sha>
//   push:  each git push it runs exactly  git push [-q] [-u|--set-upstream] origin <branch>   (a named branch that isn't main)
//          or, to delete a finished or stale branch (2026-10-20),  git push origin --delete <branch>   (one named branch, never main)
//   auto-merge: never.
//   worktrees: removed only through  node scripts/worktree-remove.mjs <dir>  (git deletes through a node_modules junction on Windows
//              and empties the main checkout's), and node_modules is never linked into one (SENTRI_PLAYWRIGHT finds Playwright).

const block = (why) => { console.error(`merge guard: ${why}\nMerges run only behind a green sentri/gate (the machine gate: node scripts/gate.mjs --candidate <ref>), then, as a command of its own:\n  gh pr merge <n> --squash --match-head-commit <sha>\nPushes name their branch: git push origin <branch>.`); process.exit(2); };
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

// Worktrees (2026-10-19): a hand-typed removal can delete through a link; a node_modules link is what it deletes through.
const wtBlock = (why) => { console.error(`worktree guard: ${why}`); process.exit(2); };
if (/\bgit\b[^;&|\n]*\bworktree\s+remove\b/i.test(plain)) wtBlock('remove a worktree with "node scripts/worktree-remove.mjs <dir>": it unlinks a junction or symlink inside first. git worktree remove --force deletes through a node_modules junction on Windows and empties the main checkout\'s node_modules.');
if (/node_modules/i.test(plain) && /\bmklink\b|ItemType\s+(Junction|SymbolicLink)|\bln\s+-\w*s|symlinkSync/i.test(plain)) wtBlock('never link node_modules into a worktree: a removal can delete through the link. Set SENTRI_PLAYWRIGHT to the main checkout\'s node_modules/playwright instead.');
const SAFE_PR = /^(view|list|create|edit|comment|checks|diff|status|checkout|ready|close|reopen|review)$/;
const isMerge = /pulls\/\d+\/merge|\/merges\b|mergePullRequest|PullRequestAutoMerge|auto-merge|git\/refs/i.test(plain);

// Pushes: every push must name a branch that isn't main; a command that pushes may not switch to main first.
// Only what runs as `git push` counts (2026-10-20): the word in a grep, a script, a message or a heredoc body is not a push, but a
// string or heredoc handed to a shell (bash -c "…", bash <<EOF, cmd /c "…") is read as commands too.
const LAUNCHER = /(?:^|[\s;&|(){}/\\])(?:(?:(?:ba|z|da)?sh|pwsh|powershell|cmd)(?:\.exe)?(?:\s+[-/][\w-]+)*|eval|iex|Invoke-Expression)\s*$/i;
const STR = '\x01'; // what a quoted string becomes: never a branch name, never a command
const segments = (src, depth = 0) => {
  const nested = [], lines = String(src).split('\n'), kept = [];
  // Heredoc and PowerShell here-string bodies are data unless a shell reads them.
  for (let k = 0; k < lines.length; k++) {
    const line = lines[k], here = /@(['"])\s*$/.exec(line);
    if (here) {
      let e = k + 1;
      while (e < lines.length && !lines[e].trimStart().startsWith(`${here[1]}@`)) e++;
      kept.push(line.slice(0, here.index) + STR + (e < lines.length ? lines[e].trimStart().slice(2) : ''));
      k = e; continue;
    }
    kept.push(line);
    for (const h of line.matchAll(/(?<!<)<<(?!<)-?\s*(['"]?)([\w.-]+)\1/g)) {
      const body = [];
      for (k++; k < lines.length && lines[k].trim() !== h[2]; k++) body.push(lines[k]);
      if (LAUNCHER.test(line.slice(0, h.index))) nested.push(body.join('\n'));
    }
  }
  // Quoted strings become one placeholder (a bare word in quotes is just that word); escapes and comments go.
  const s = kept.join('\n');
  let out = '';
  const str = (body) => {
    if (LAUNCHER.test(out)) { nested.push(body); return STR; }
    if (/(?:^|[\\/])git(?:\.exe)?$/i.test(body)) return 'git';
    return /^[^\s;&|()<>{}`#$"'\\]*$/.test(body) ? body : STR;
  };
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (c === "'") { const e = s.indexOf("'", i + 1); if (e < 0) { i++; continue; } out += str(s.slice(i + 1, e)); i = e + 1; }
    else if (c === '"') { let e = i + 1; while (e < s.length && s[e] !== '"') e += s[e] === '\\' || s[e] === '`' ? 2 : 1; out += str(s.slice(i + 1, e)); i = e + 1; }
    else if (c === '\\' || c === '`') { const n = /^\r?\n/.exec(s.slice(i + 1)); out += n ? ' ' : c === '\\' ? (s[i + 1] ?? '') : ''; i += n ? 1 + n[0].length : c === '\\' ? 2 : 1; }
    else if (c === '^') i++;
    else if (c === '#' && (i === 0 || /\s/.test(s[i - 1]))) { while (i < s.length && s[i] !== '\n') i++; }
    else { out += c; i++; }
  }
  // A redirection is not part of the command (2026-10-21: `git push origin x 2>&1` read as "git push origin x 2>"): fd duplications
  // (2>&1, >&2) and redirections to a file or from one are dropped before the split, since `&` would otherwise split them.
  out = out.replace(/(^|\s)\d*[<>]{1,2}&(?:\d+|-)(?=\s|$)/g, '$1').replace(/(^|\s)\d*(?:>>?|<)\s*(?![&|;])[^\s;&|()]+/g, '$1');
  const segs = out.split(/;|&&|\|\||\||&|\n|[(){}]/).map((g) => g.replace(/\.exe\b/gi, '').replace(/\s+/g, ' ').trim()
    .replace(/^(?:(?:[A-Za-z_]\w*=\S*|if|then|else|elif|do|while|until|time|exec|command|env|sudo|nohup|xargs|!) )+/, ''));
  if (depth < 4) for (const n of nested) segs.push(...segments(n, depth + 1));
  return segs;
};
// A git command's subcommand, after any global options (-C <dir>, -c <k=v>, --git-dir=…).
const GIT_ARG = /^(?:-C|-c|--git-dir|--work-tree|--namespace|--exec-path|--config-env|--super-prefix|--attr-source)$/;
const gitCmd = (seg) => {
  const t = seg.split(' ');
  if (!/^(?:\S*\/)?git$/i.test(t[0])) return null;
  let k = 1, opts = false;
  while (k < t.length && t[k].startsWith('-')) { opts = true; k += GIT_ARG.test(t[k]) ? 2 : 1; }
  return { seg, sub: (t[k] || '').toLowerCase(), opts, args: t.slice(k + 1) };
};
const segs = segments(cmd);
const gits = segs.map(gitCmd).filter(Boolean);
// A `gh pr <sub>` that runs (not one quoted in a message, a heredoc body or a script): 2026-10-21, a heredoc that only named
// `gh pr merge` was blocked as a merge.
// Anywhere in a parsed command, so `echo \`gh pr merge 6\`` still counts; quoted strings and heredoc bodies are placeholders there.
const ranPr = segs.flatMap((g) => [...g.matchAll(/\bgh pr (\S+)/gi)].map((m) => m[1]));
const ranMerge = ranPr.some((s) => !SAFE_PR.test(s));
const pushes = gits.filter((g) => g.sub === 'push');
for (const { seg, opts } of pushes) {
  const m = !opts && (seg.match(/^git push(?: -q| --quiet)?(?: -u| --set-upstream)? origin ([\w./][\w./-]*)$/) || seg.match(/^git push origin (?:--delete|-d) ([\w./][\w./-]*)$/));
  if (!m || /^(main|master|HEAD)$/i.test(m[1])) block(`a push must be one plain "git push origin <branch>", or "git push origin --delete <branch>", naming a branch that isn't main: "${seg.replaceAll(STR, '"…"')}"`);
}
if (pushes.length && gits.some((g) => /^(checkout|switch)$/.test(g.sub) && g.args.some((a) => /^(main|master)$/i.test(a)))) block('a command that pushes may not switch to main');
if (!isMerge && !ranMerge) process.exit(0);

const m = cmd.trim().match(/^gh pr merge (\d+)(?: (?:-R|--repo) [\w.-]+\/[\w.-]+)? --squash(?: --delete-branch)? --match-head-commit ([0-9a-f]{40})$/);
if (!m) block('a merge must be one command on its own, exactly: gh pr merge <n> --squash --match-head-commit <full sha>');
process.exit(0);
