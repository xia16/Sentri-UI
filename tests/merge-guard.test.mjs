// The merge guard (scripts/merge-guard.mjs): every bypass a gate judge found on #105 stays blocked.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const run = (input) => spawnSync(process.execPath, ['scripts/merge-guard.mjs'], { input: JSON.stringify(input), encoding: 'utf8' }).status;
const guard = (command) => run({ tool_name: 'Bash', tool_input: { command } });
const sha = 'a'.repeat(40);

test('ordinary commands pass untouched', () => {
  for (const c of ['git status', 'git merge origin/main', 'gh pr view 5 && git merge origin/main', 'git push origin workflow/x', 'git push -q -u origin workflow/x && cd ../y && git merge -q --no-edit workflow/x']) assert.equal(guard(c), 0, c);
});

test('a merge that is not exactly one pinned command is blocked', () => {
  for (const c of [
    'gh pr merge 6 --squash',
    `gh pr merge 7 --squash --match-head-commit ${sha} & gh pr merge 6 --squash`,
    `gh pr merge 7 --squash --match-head-commit ${sha}; gh pr merge 9`,
    `echo --match-head-commit ${sha} && gh pr merge 9 --squash`,
    `gh pr merge 6 --squash --subject "x --match-head-commit ${sha}"`,
    `gh pr merge 6 --squash # --match-head-commit ${sha}`,
    `gh pr merge 6 --squash --match-head-commit ${sha} --match-head-commit ${'1'.repeat(40)}`,
    'gh pr merge 9 --squash --match-head-commit $(cat x)',
    'gh.exe pr merge 6 --squash',
    '"gh" pr "merge" 6',
    'gh api -X PUT repos/xia16/Sentri-UI/pulls/6/merge',
    'gh pr m\erge 6 --squash',
    'X=merge; gh pr $X 6',
    "gh api graphql -f query='mutation { mergePullRequest(input:{pullRequestId:\"x\"}) { clientMutationId } }'",
    'gh api -X POST repos/xia16/Sentri-UI/merges -f base=main -f head=x',
    'gh api -X PATCH repos/xia16/Sentri-UI/git/refs/heads/main -f sha=abc',
  ]) assert.equal(guard(c), 2, c);
});

test('a pinned merge in the one form passes (GitHub requires the gate, up to date: G2), and a direct push to main is blocked', () => {
  assert.equal(guard(`gh pr merge 7 --squash --match-head-commit ${sha}`), 0, "whether it passed the gate is GitHub's to say");
  assert.equal(guard(`gh pr merge 7 --squash --match-head-commit ${sha} --auto`), 2, 'only the one form');
  for (const c of ['git push origin HEAD:main', 'git push origin HEAD:refs/heads/main', 'git push --all origin', 'git push --mirror origin',
    'git checkout main && git merge feature && git push', 'git push -u origin HEAD', 'git push', 'git -C ../main-checkout push', 'git push origin main']) assert.equal(guard(c), 2, c);
});

test('auto-merge is never allowed, and a guard that cannot read its input blocks', () => {
  assert.equal(run({ tool_name: 'mcp__ccd_pr__set_auto_merge', tool_input: { enabled: true } }), 2);
  assert.equal(spawnSync(process.execPath, ['scripts/merge-guard.mjs'], { input: 'not json', encoding: 'utf8' }).status, 2);
});

test('a worktree is removed only through scripts/worktree-remove.mjs, and node_modules is never linked into one (2026-10-19)', () => {
  for (const c of [
    'git worktree remove --force ../Sentri-UI-x',
    'git -C ../Sentri-UI worktree remove ../Sentri-UI-x',
    'cd ../Sentri-UI && git worktree   remove "../Sentri-UI-x"',
    'New-Item -ItemType Junction -Path ..\\Sentri-UI-x\\node_modules -Target ..\\Sentri-UI\\node_modules',
    'cmd /c mklink /J node_modules ..\\Sentri-UI\\node_modules',
    'ln -s ../Sentri-UI/node_modules node_modules',
  ]) assert.equal(guard(c), 2, c);
  for (const c of ['node scripts/worktree-remove.mjs ../Sentri-UI-x', 'git worktree add --detach ../Sentri-UI-x HEAD', 'git worktree list', 'git worktree prune',
    'SENTRI_PLAYWRIGHT=../Sentri-UI/node_modules/playwright node scripts/gate.mjs --candidate origin/x --out o']) assert.equal(guard(c), 0, c);
  assert.equal(run({ tool_name: 'PowerShell', tool_input: { command: 'git worktree remove --force C:\\wt' } }), 2, 'PowerShell too');
});

test('a finished or stale branch may be deleted, one named branch at a time, never main (2026-10-20)', () => {
  for (const c of ['git push origin --delete treat/category-rows', 'git push origin -d workflow/x']) assert.equal(guard(c), 0, c);
  for (const c of [
    'git push origin --delete main', 'git push origin -d master', 'git push origin --delete HEAD',
    'git push origin --delete a b', 'git push origin --delete', 'git push origin :treat/x', 'git push --delete origin main',
    'git push origin --all', 'git push origin --mirror', 'git push origin --tags',
  ]) assert.equal(guard(c), 2, c);
});

test('the word "push" is not a push: only a command that runs git push is checked (2026-10-20)', () => {
  for (const c of [
    'grep -n push scripts/merge-guard.mjs',
    'git log --oneline -5 | grep -i push',
    'git -C ../x log --grep push',
    'cat .git/config && echo push',
    'node -e "const out = []; out.push(\'git\'); console.log(out)" && git status',
    'git commit -m "push the fix; git push origin main stays blocked"',
    "cat > notes.md <<'EOF'\nThe guard used to block this.\n// s = s.push(x)\nj.commits.push(c)\ngit push origin main\nEOF\ngit status",
    "git commit -q -m \"$(cat <<'EOF'\nGuard: a push word is not a push\n\ngit push origin HEAD:main stays blocked\nEOF\n)\" && git push -u origin workflow/x",
  ]) assert.equal(guard(c), 0, c);
  assert.equal(run({ tool_name: 'PowerShell', tool_input: { command: "git commit -m @'\nconst x = a.push(1)\ngit push origin main\n'@; if ($?) { git push origin workflow/x }" } }), 0, 'PowerShell here-string');
  for (const c of [
    'git push origin main', 'git push origin HEAD:main', 'git -C x push origin main', 'git -C x push origin feat', 'git --git-dir=x/.git push origin feat',
    'git push --force origin feat', 'git push -f origin feat', 'git checkout main && git push origin feat', 'git switch master; git push origin feat',
    'git push origin "main"', '"git" push origin main', 'git.exe push origin main', 'GIT_TRACE=1 git push origin main', 'cd x && git push origin main',
    '(git push origin main)', 'echo $(git push origin main)', 'if git push origin main; then echo ok; fi', 'git commit -m "x" && git push origin HEAD',
    'node -e "a.push(1)" && git push origin main', 'bash -c "git push origin main"', "sh -c 'cd x && git push origin main'", 'cmd /c "git push origin main"',
    "bash <<'EOF'\ngit push origin main\nEOF", 'git push origin feat \\\n  main',
  ]) assert.equal(guard(c), 2, c);
});

test('a redirection is not part of a push, and a merge named in a message or heredoc is not a merge (2026-10-21)', () => {
  const merge = ['gh', 'pr', 'merge'].join(' ');
  for (const c of [
    'git push origin workflow/x 2>&1',
    'git push origin workflow/x 2>&1 | tail -2',
    'git push origin workflow/x > push.log 2>&1',
    'git push origin feat > log.txt',
    'git push -q origin workflow/x 2>/dev/null',
    `cat > notes.md <<'EOF'\nthen: ${merge} 7 --squash --match-head-commit ${sha}\nEOF\ngit status`,
    `git commit -q -m "merge with ${merge} 7 later" && git push origin workflow/x`,
    `node -e "console.log('${merge} 6 --squash')"`,
  ]) assert.equal(guard(c), 0, c);
  for (const c of [
    'git push origin main 2>&1',
    'git push origin HEAD:main > x.log 2>&1',
    'git push --force origin workflow/x 2>&1',
    `echo \`${merge} 6 --squash\``,
    `echo $(${merge} 6 --squash)`,
    `bash <<'EOF'\n${merge} 6 --squash\nEOF`,
    `${merge} 6 --squash --match-head-commit ${sha} 2>&1`,
    // Codex review round 1: substitutions inside double quotes and expanding heredocs run
    `echo "$(${merge} 6 --squash)"`,
    `cat <<EOF\n$(${merge} 6 --squash)\nEOF`,
    `git commit -m "done $(git push origin main)"`,
    // round 2: a quote inside the substitution ends the string scan early; an unclosed $( still counts
    `echo "$(${merge} "6" --squash)"`,
    // round 3: a quoted subcommand cuts the scan off after `gh pr`; that fails closed
    `echo "$(gh pr "merge" 6 --squash)"`,
  ]) assert.equal(guard(c), 2, c);
  for (const c of [
    `git commit -m "built on $(date +%F)" && git push origin workflow/x`,
    `cat <<'EOF'\n$(${merge} 6 --squash)\nEOF`, // a quoted delimiter: the body is data
  ]) assert.equal(guard(c), 0, c);
});
