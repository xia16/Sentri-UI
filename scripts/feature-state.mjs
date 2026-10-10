// Where a feature stands in the design workflow, and what /design drives next. One answer for every session, read from the repo
// (and the feature's Wayfinder map on GitHub, when gh can reach it), so two sessions never disagree about a feature's step.
// Usage: node scripts/feature-state.mjs <feature> [--json]
// Modes, in order: chart → plan → scenarios → build → polish → freeze → frozen (docs/design-workflow/README.md, "The three modes").
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scenarioStatus, parseOperations, checkOperations, notSupportedGaps } from './scenario-rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [feature] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const json = process.argv.includes('--json');
if (!feature) { console.error('usage: node scripts/feature-state.mjs <feature> [--json]'); process.exit(2); }
const dir = path.join(root, 'features', feature);
if (!fs.existsSync(path.join(dir, 'feature.json'))) { console.error(`no features/${feature}/feature.json`); process.exit(2); }

const f = JSON.parse(fs.readFileSync(path.join(dir, 'feature.json'), 'utf8'));
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
const prd = read(path.join(dir, 'PRD.md'));
const screens = (f.screens || []).filter((s) => s.status !== 'earlier');
const placeholders = screens.filter((s) => s.status === 'placeholder' || !s.url);
const approvals = (() => { try { return JSON.parse(read(path.join(dir, 'approvals.json')) || '[]'); } catch { return []; } })();
const approved = new Set(approvals.filter((a) => !a.changed).map((a) => a.screen));
const polish = (() => { try { return JSON.parse(read(path.join(root, 'review', `polish-${feature}.json`)) || 'null'); } catch { return null; } })();

// The feature's map: an open or closed wayfinder:map issue whose title names the feature. gh may be unavailable; then unknown.
function findMap() {
  const r = spawnSync('gh', ['issue', 'list', '--label', 'wayfinder:map', '--state', 'all', '--limit', '100', '--json', 'number,title,state'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) return { unknown: true };
  const names = [f.name, f.zh, feature].filter(Boolean).map((n) => n.toLowerCase());
  const map = JSON.parse(r.stdout).find((m) => names.some((n) => m.title.toLowerCase().includes(n)));
  if (!map) return { none: true };
  const subs = spawnSync('gh', ['api', `repos/{owner}/{repo}/issues/${map.number}/sub_issues`, '--jq', '[.[] | select(.state=="open") | {number, title, labels: [.labels[].name], assignees: [.assignees[].login]}]'], { cwd: root, encoding: 'utf8' });
  const open = subs.status === 0 ? JSON.parse(subs.stdout || '[]') : [];
  return { number: map.number, title: map.title, state: map.state, open };
}

const hasNotSupported = /^#+\s*not supported/im.test(prd);
const hasScenarios = fs.existsSync(path.join(dir, 'scenarios.json'));

// The scenario ledger (scripts/scenario-ledger.mjs): the working ledger when this checkout has one, else the committed summary
// of the verdict (review/scenario-ledger-<feature>.json). Settled is the only verdict that ends the scenarios step.
const ledger = (() => {
  try {
    const wf = path.join(root, 'review', 'scenarios', feature, 'ledger.json');
    if (fs.existsSync(wf)) { const l = JSON.parse(read(wf)); const st = scenarioStatus(l); return { status: st.status, why: st.why, rounds: l.rounds.filter((r) => r.closed).length, rows: l.rows.length, counts: st.counts }; }
    const sf = path.join(root, 'review', `scenario-ledger-${feature}.json`);
    if (fs.existsSync(sf)) { const s = JSON.parse(read(sf)); return { status: s.status.status, why: s.status.why, rounds: s.rounds.length, counts: s.counts }; }
  } catch { /* an unreadable ledger is no ledger */ }
  return null;
})();
// The operations inventory, when the feature has one, must be well formed and match the PRD's not-supported list.
const operations = (() => {
  const f = path.join(dir, 'operations.md');
  if (!fs.existsSync(f)) return null;
  const { rows, problems } = parseOperations(read(f));
  const gaps = notSupportedGaps(rows, prd);
  return { rows: rows.length, problems: [...problems, ...checkOperations(rows), ...gaps.missing.map((m) => `the PRD's "Not supported" list does not name "${m}"`)] };
})();
const isNew = placeholders.length === screens.length; // nothing designed yet: the new-feature road
const map = isNew || !prd ? findMap() : null;

let mode, why, next;
if (isNew && (!map || map.none)) {
  mode = 'chart'; why = 'nothing designed yet and no Wayfinder map'; next = 'chart a map with the Wayfinder method (destination: a PRD and a settled scenario base ready to build)';
} else if (map && map.number && map.state === 'OPEN' && map.open.length) {
  const grill = map.open.filter((t) => t.labels.includes('wayfinder:grilling'));
  mode = 'plan'; why = `map #${map.number} has ${map.open.length} open ticket(s), ${grill.length} of them grilling (the owner's)`; next = 'work the frontier: research, prototype and task tickets now; grilling tickets wait for the owner while independent work goes on';
} else if (!prd) {
  mode = 'chart'; why = 'no PRD'; next = 'write the PRD from the map or the baseline';
} else if (!hasNotSupported || !hasScenarios || ledger?.status !== 'settled' || operations?.problems.length) {
  mode = 'scenarios';
  why = [!hasNotSupported && 'the PRD has no "Not supported" list (the 95% cut)', operations?.problems.length && `the operations inventory has ${operations.problems.length} problem(s) (scenario-ledger check)`,
    !hasScenarios && 'no executable leaves (scenarios.json)',
    ledger?.status !== 'settled' && (ledger ? `the scenario ledger is ${ledger.status}: ${ledger.why}` : 'no scenario ledger (scenario-ledger init)')].filter(Boolean).join('; ');
  next = ledger?.status === 'stuck' || ledger?.status === 'capped' ? 'the walks stopped without settling: report what is open, file the product questions, and let the owner rule; do not walk again'
    : 'run the scenario framework: operations inventory from the baseline, the cut, the tree, the ledger and walks until settled, leaves (docs/design-workflow/briefs/walk.md)';
} else if (placeholders.length) {
  mode = 'build'; why = `${placeholders.length} of ${screens.length} screens not designed yet`; next = 'build the screens (build.md), then gate each';
} else if (screens.length && screens.every((s) => approved.has(s.id))) {
  mode = 'freeze'; why = 'every screen approved by the owner'; next = 'run the freeze checklist (freeze-checklist.md)';
} else if (!polish || polish.status?.status !== 'done') {
  mode = 'polish'; why = polish ? `the last polish loop ${polish.status?.status}: ${polish.status?.why}` : 'no polish loop has run'; next = 'run the polish loop (.claude/skills/polish-loop/SKILL.md)';
} else {
  mode = 'review'; why = 'the polish loop is done; screens wait for the owner\'s approval'; next = 'send the review packet; approvals are the owner\'s';
}

const out = { feature, mode, why, next, map: map && map.number ? { number: map.number, state: map.state, open: map.open.length } : map?.unknown ? 'unknown (gh unavailable)' : null,
  screens: screens.length, placeholders: placeholders.length, approved: approved.size, scenarios: hasScenarios, notSupported: hasNotSupported,
  ledger: ledger ? { status: ledger.status, why: ledger.why, rounds: ledger.rounds } : null, operations: operations ? { rows: operations.rows, problems: operations.problems } : null };
if (json) console.log(JSON.stringify(out, null, 2));
else console.log(`${feature}: ${mode} — ${why}\nnext: ${next}`);
