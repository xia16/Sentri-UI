// Where the tooling finds Playwright: SENTRI_PLAYWRIGHT or PLAYWRIGHT_DIR if set, else the design lint's cache on the owner's
// machine, else a project or global install (a cloud container has one globally).
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const CACHE = 'C:/Users/ying_/.cache/adam-design/playwright-1.63.0/node_modules/playwright';
function find() {
  const set = process.env.SENTRI_PLAYWRIGHT || process.env.PLAYWRIGHT_DIR;
  if (set) return set;
  if (fs.existsSync(CACHE)) return CACHE;
  const req = createRequire(import.meta.url);
  try { return path.dirname(req.resolve('playwright/package.json')); } catch {}
  try { const g = path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright'); if (fs.existsSync(g)) return g; } catch {}
  return CACHE;
}
export const pwPath = find();
export const playwright = () => createRequire(import.meta.url)(pwPath);
