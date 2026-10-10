// The merge guard (scripts/merge-guard.mjs): every bypass a gate judge found on #105 stays blocked.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const guard = (command) => spawnSync(process.execPath, ['scripts/merge-guard.mjs'], { input: JSON.stringify({ tool_name: 'Bash', tool_input: { command } }), encoding: 'utf8' }).status;
const sha = 'a'.repeat(40);

test('ordinary commands pass untouched', () => {
  for (const c of ['git status', 'git merge origin/main', 'gh pr view 5 && git merge origin/main', 'git push origin workflow/x']) assert.equal(guard(c), 0, c);
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
  ]) assert.equal(guard(c), 2, c);
});

test('a pinned merge without a gate pass is blocked, and so is a direct push to main', () => {
  assert.equal(guard(`gh pr merge 7 --squash --match-head-commit ${sha}`), 2);
  assert.equal(guard('git push origin HEAD:main'), 2);
});
