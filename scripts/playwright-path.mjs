// Where the tooling finds Playwright: SENTRI_PLAYWRIGHT or PLAYWRIGHT_DIR if set, else the project's own install
// (`playwright` is a pinned devDependency, so `npm install` provides it), else a global install (a cloud container has one).
// Nothing here depends on one person's machine. The browser itself comes from `npx playwright install chromium`.
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const HELP = 'Playwright not found. Run `npm install` and `npx playwright install chromium` in the repo, or set SENTRI_PLAYWRIGHT to a Playwright install.';
function find() {
  const set = process.env.SENTRI_PLAYWRIGHT || process.env.PLAYWRIGHT_DIR;
  if (set) return set;
  const req = createRequire(import.meta.url);
  try { return path.dirname(req.resolve('playwright/package.json')); } catch {}
  try { const g = path.join(execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(), 'playwright'); if (fs.existsSync(g)) return g; } catch {}
  return null;
}
export const pwPath = find();
export const playwright = () => {
  if (!pwPath) throw new Error(HELP);
  return createRequire(import.meta.url)(pwPath);
};
