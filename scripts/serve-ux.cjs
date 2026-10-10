// Zero-dependency static server for browsing ux/ locally.
// Usage: node scripts/serve-ux.cjs [port]
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const port = Number(process.argv[2]) || Number(process.env.PORT) || 4317;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// /@<commit>/<path> serves the file as it was at that commit, straight from git: the atlas shows a screen's approved
// version this way (pages load their assets by relative paths, so the whole screen renders from that commit).
const { execFile } = require('child_process');
function fromGit(res, sha, rel) {
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  execFile('git', ['cat-file', 'blob', `${sha}:${rel}`], { cwd: root, encoding: 'buffer', maxBuffer: 64 << 20 }, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not at that commit'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(rel)] || 'application/octet-stream', 'Cache-Control': sha.length === 40 ? 'max-age=86400, immutable' : 'no-store' });
    res.end(data);
  });
}

http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/') {
      res.writeHead(302, { Location: '/atlas/' });
      return res.end();
    }
    const at = pathname.match(/^\/@([0-9a-f]{7,40})\/(.*)$/);
    if (at) {
      if (at[2].split('/').includes('..')) { res.writeHead(403); return res.end(); }
      return fromGit(res, at[1], at[2]);
    }
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    fs.stat(file, (statErr, stat) => {
      if (!statErr && stat.isDirectory()) {
        if (!pathname.endsWith('/')) {
          res.writeHead(302, { Location: pathname + '/' });
          return res.end();
        }
        file = path.join(file, 'index.html');
      }
      fs.readFile(file, (err, data) => {
        if (err) {
          res.writeHead(404);
          return res.end('Not found');
        }
        const type = TYPES[path.extname(file)] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
        res.end(data);
      });
    });
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Sentri UX preview: http://127.0.0.1:${port}/ux/system/home-astra-prototype.html`);
    console.log(`Design system index: http://127.0.0.1:${port}/ux/README.md`);
  });
