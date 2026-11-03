// Screenshots one page of the icon round at a given width. Usage: node review/icon-round/shoot.mjs <page.html?query> <out.png> [width]
import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const { playwright } = await import(pathToFileURL(path.join(root, 'scripts/playwright-path.mjs')).href);
const { chromium } = playwright();
const [page, out, width = '900'] = process.argv.slice(2);
const port = 4741;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve-ux.cjs'), String(port)], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 500));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(width), height: 600 }, deviceScaleFactor: 2 });
p.on('console', (m) => m.type() === 'warning' && console.log('warn:', m.text()));
await p.goto(`http://localhost:${port}/review/icon-round/${page}`);
await p.waitForTimeout(400);
await p.screenshot({ path: out, fullPage: true });
await b.close(); server.kill();
console.log('wrote', out);
