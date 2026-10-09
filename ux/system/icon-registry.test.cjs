const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const context = {};
vm.runInNewContext(read('../design-system/components/bundle.js'), context);
const registry = context.SentriIcons;

const apps = ['home-astra-prototype', 'inspection-astra-concept', 'farrowing-astra-concept'];

// Every literal icon('key') / roomIcon('key') call must resolve in the shared
// registry — otherwise the app silently renders the chevron fallback.
for (const app of apps) {
  test(`${app}: all literal icon keys exist in the shared registry`, () => {
    const source = read(app + '.js');
    const keys = new Set([...source.matchAll(/(?:\bicon|roomIcon)\('([a-z-]+)'\)/g)].map(m => m[1]));
    assert.ok(keys.size > 0, 'expected literal icon calls');
    for (const key of keys) assert.ok(key in registry.paths, `${app} uses icon('${key}'), missing from the design-system bundle`);
  });

  test(`${app}: icon rendering delegates to SentriIcons`, () => {
    assert.match(read(app + '.js'), /SentriIcons\.icon/);
  });

  test(`${app}: page loads the registry before its app script`, () => {
    const html = read(app + '.html');
    const registryAt = html.indexOf('design-system/components/bundle.js');
    const appAt = html.indexOf(`<script src="${app}.js`);
    assert.ok(registryAt > -1, 'design-system bundle.js not loaded');
    assert.ok(registryAt < appAt, 'bundle.js must load before the app script');
  });
}

// Icon names supplied dynamically from data (sensors, sections, symbol maps)
// must resolve too — these never appear as literal icon('key') calls.
test('registry covers the data-driven icon vocabulary', () => {
  const dynamic = ['temperature', 'humidity', 'air', 'heat', 'pregnancy', 'farrow', 'barn',
    'feed', 'wrench', 'record', 'profile', 'weight', 'chart', 'origin', 'clock', 'filter',
    'home', 'toolbox', 'spark', 'upload', 'offline', 'down', 'arrow', 'place', 'return', 'send', 'health'];
  for (const key of dynamic) assert.ok(key in registry.paths, `data-driven icon '${key}' missing`);
});
