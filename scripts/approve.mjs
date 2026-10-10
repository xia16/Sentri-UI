// Records the owner's approval of screens, or marks approved screens changed since approval (atlas/SCHEMA.md, "Approval records").
// Only on the owner's word: an agent runs this when the owner says "approve <screens or feature>", never on its own judgement.
//   node scripts/approve.mjs <feature | screen id,...> [--commit <sha>] [--note "<text>"]
//   node scripts/approve.mjs <feature | screen id,...> --changed --since <commit or PR> --why "<one line>"
// Writes features/<id>/approvals.json; then `npm run atlas` shows Approved, or Changed since approval with the approved version.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const target = argv[0];
if (!target || target.startsWith('--')) { console.error(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//   node')).map((l) => l.slice(3)).join('\n')); process.exit(2); }

const features = fs.readdirSync(path.join(root, 'features')).filter((d) => fs.existsSync(path.join(root, 'features', d, 'feature.json')));
const byScreen = {};
for (const id of features) for (const s of JSON.parse(fs.readFileSync(path.join(root, 'features', id, 'feature.json'), 'utf8')).screens || []) byScreen[s.id] = { feature: id, s };
const ids = features.includes(target)
  ? Object.keys(byScreen).filter((k) => byScreen[k].feature === target && byScreen[k].s.url && byScreen[k].s.status !== 'earlier')
  : target.split(',').map((x) => x.trim());
for (const id of ids) if (!byScreen[id]) { console.error(`no screen ${id}`); process.exit(2); }

const commit = execSync(`git rev-parse ${opt('commit') || 'HEAD'}`, { cwd: root }).toString().trim();
const today = new Date().toISOString().slice(0, 10);
const files = {};
const load = (f) => (files[f] ||= fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : []);
for (const id of ids) {
  const file = path.join(root, 'features', byScreen[id].feature, 'approvals.json');
  const recs = load(file);
  if (argv.includes('--changed')) {
    const last = [...recs].reverse().find((r) => r.screen === id);
    if (!last) continue; // never approved: nothing to mark
    if (!opt('since') || !opt('why')) { console.error('--changed needs --since and --why'); process.exit(2); }
    last.changed = { since: opt('since'), why: opt('why') };
  } else {
    recs.push({ screen: id, commit, date: today, by: 'owner', ...(opt('note') ? { note: opt('note') } : {}) });
  }
}
for (const [f, recs] of Object.entries(files)) fs.writeFileSync(f, JSON.stringify(recs, null, 2) + '\n');
console.log(`${argv.includes('--changed') ? 'marked changed since approval' : `approved at ${commit.slice(0, 7)}`}: ${ids.length} screen(s). Run npm run atlas.`);
