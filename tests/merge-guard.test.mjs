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

test('a pinned merge without a gate pass is blocked, and so is a direct push to main', () => {
  assert.equal(guard(`gh pr merge 7 --squash --match-head-commit ${sha}`), 2);
  for (const c of ['git push origin HEAD:main', 'git push origin HEAD:refs/heads/main', 'git push --all origin', 'git push --mirror origin',
    'git checkout main && git merge feature && git push', 'git push -u origin HEAD', 'git push', 'git -C ../main-checkout push', 'git push origin main']) assert.equal(guard(c), 2, c);
});

test('auto-merge is never allowed, and a guard that cannot read its input blocks', () => {
  assert.equal(run({ tool_name: 'mcp__ccd_pr__set_auto_merge', tool_input: { enabled: true } }), 2);
  assert.equal(spawnSync(process.execPath, ['scripts/merge-guard.mjs'], { input: 'not json', encoding: 'utf8' }).status, 2);
});
