// The legibility check must fail every known-bad fixture (10px meta, pale grey, a 36px button) and pass the good one.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const r = spawnSync(process.execPath, [path.join(__dirname, '../../scripts/check-legibility.mjs'), '--self-test'], { encoding: 'utf8' });
process.stdout.write(r.stdout + r.stderr);
process.exit(r.status);
