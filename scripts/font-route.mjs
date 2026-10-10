// Serves the prototypes' Google Fonts from vendor/fonts/ (scripts/vendor-fonts.mjs), so a render never waits on the network:
// the same glyphs every run, on every machine. A font request the vendor folder doesn't have is aborted, and named, so a new font
// link shows up instead of silently rendering the fallback face.
import fs from 'node:fs';
import path from 'node:path';

export async function routeFonts(context, root, missing = new Set()) {
  const dir = path.join(root, 'vendor', 'fonts');
  const file = path.join(dir, 'manifest.json');
  if (!fs.existsSync(file)) return false;
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  const norm = (u) => decodeURIComponent(u).replace(/&amp;/g, '&');
  const css = new Map(Object.entries(manifest.css).map(([u, f]) => [norm(u), f]));
  const files = new Map(Object.entries(manifest.files).map(([u, f]) => [norm(u), f]));
  await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => {
    const url = norm(route.request().url());
    const hit = css.get(url) || files.get(url);
    if (!hit) { missing.add(url); return route.abort(); }
    const type = hit.endsWith('.css') ? 'text/css; charset=utf-8' : hit.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream';
    return route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(path.join(dir, hit)), headers: { 'access-control-allow-origin': '*' } });
  });
  return true;
}
