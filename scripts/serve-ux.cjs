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

http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403);
      return res.end();
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
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Sentri UX preview: http://127.0.0.1:${port}/ux/system/home-astra-prototype.html`);
    console.log(`Design system index: http://127.0.0.1:${port}/ux/README.md`);
  });
