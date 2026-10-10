// The state check must flag every known-bad fixture and pass every known-good one.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const r = spawnSync(process.execPath, [path.join(__dirname, '../../scripts/check-states.mjs'), '--self-test'], { encoding: 'utf8' });
process.stdout.write(r.stdout + r.stderr);
process.exit(r.status);
