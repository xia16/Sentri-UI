// Builds dist/app.html: index.html with every stylesheet and script it loads inlined (Google Fonts stays a link),
// so the one file opens on a phone with no server.  Usage: node ux/tasks/piglet-processing/simple/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel) => readFileSync(resolve(here, rel), 'utf8');
const FONTS = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap';

let html = read('index.html');
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) => {
  // an @import inside an inlined sheet would be ignored after other rules: the fonts become a <link> in the head instead
  const css = read(href).replace(/@import\s+url\([^)]*\);?/g, '');
  return `<style>/* ${href} */\n${css}\n</style>`;
});
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => `<script>/* ${src} */\n${read(src).replace(/<\/script/gi, '<\\/script')}\n</script>`);
html = html.replace('<title>', `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONTS}">\n<title>`);

mkdirSync(join(here, 'dist'), { recursive: true });
writeFileSync(join(here, 'dist', 'app.html'), html);
console.log(`dist/app.html ${(html.length / 1024).toFixed(0)} KB`);
