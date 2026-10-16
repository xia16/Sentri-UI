// Evidence by identity (scripts/evidence.mjs, docs/design-workflow/gate-v2.md §3): hashing, reuse, the store, and the inventory.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { canonical, identityOf, importsOf, codeClosure, codeHash, blobsHash, planEvidence, reconcileInventory, EvidenceStore, SCHEME } from '../scripts/evidence.mjs';
import { checkVerdict } from '../scripts/loop-rules.mjs';

test('identity: the same inputs in any order are one identity; any input changing is another', () => {
  const a = { screen: { id: 's', url: '/p.html', steps: ['Open'] }, width: 390, lang: 'en', files: 'f1' };
  const b = { lang: 'en', files: 'f1', width: 390, screen: { steps: ['Open'], url: '/p.html', id: 's' } };
  assert.equal(identityOf('shot', a), identityOf('shot', b));
  assert.equal(canonical({ y: 1, x: [2, { b: 1, a: 0 }] }), '{"x":[2,{"a":0,"b":1}],"y":1}');
  for (const change of [{ width: 360 }, { lang: 'zh' }, { files: 'f2' }, { screen: { ...a.screen, steps: ['Open', 'Done'] } }]) assert.notEqual(identityOf('shot', { ...a, ...change }), identityOf('shot', a), JSON.stringify(change));
  assert.notEqual(identityOf('shot', a), identityOf('check-spacing', a), 'the kind is part of the identity');
  assert.equal(typeof SCHEME, 'number');
});

test('identity: a stricter checker changes only the identities of the results it produces', () => {
  const visit = { screen: 's', width: 390, lang: 'en', code: 'visit-v1' };
  const ids = (spacing) => ({ shot: identityOf('shot', visit), spacing: identityOf('check-spacing', { ...visit, checker: spacing }), headers: identityOf('check-headers', { ...visit, checker: 'headers-v1' }) });
  const before = ids('spacing-v1'), after = ids('spacing-v2');
  assert.equal(after.shot, before.shot);
  assert.equal(after.headers, before.headers);
  assert.notEqual(after.spacing, before.spacing);
});

test('blobs: a set of paths hashes by path and blob, missing ones marked', () => {
  const t1 = new Map([['a.js', '1'], ['b.css', '2']]), t2 = new Map([['a.js', '1'], ['b.css', '3']]);
  assert.equal(blobsHash(t1, ['b.css', 'a.js']), blobsHash(t1, ['a.js', 'b.css']));
  assert.notEqual(blobsHash(t1, ['a.js', 'b.css']), blobsHash(t2, ['a.js', 'b.css']));
  assert.equal(blobsHash(t1, ['a.js']), blobsHash(t2, ['a.js']), 'a file outside the set does not count');
  assert.notEqual(blobsHash(t1, ['a.js', 'gone.js']), blobsHash(t1, ['a.js']));
});

test('code: a module is hashed with its local imports, static, dynamic and required; a computed import is flagged', () => {
  const src = "import fs from 'node:fs';\nimport { a } from './a.mjs';\nexport { b } from \"../lib/b.mjs\";\nimport './side.mjs';\nconst c = await import('./c.mjs');\nconst d = require('./d.cjs');";
  assert.deepEqual(importsOf(src).local.sort(), ['../lib/b.mjs', './a.mjs', './c.mjs', './d.cjs', './side.mjs']);
  assert.equal(importsOf(src).computed, false);
  assert.equal(importsOf('const m = await import(name);').computed, true);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ev-code-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.writeFileSync(path.join(dir, 'scripts/check.mjs'), "import { x } from './helper.mjs';\nexport const y = x;");
  fs.writeFileSync(path.join(dir, 'scripts/helper.mjs'), 'export const x = 1;');
  fs.writeFileSync(path.join(dir, 'scripts/other.mjs'), 'export const z = 1;');
  const c = codeClosure(dir, ['scripts/check.mjs']);
  assert.deepEqual(Object.keys(c.files), ['scripts/check.mjs', 'scripts/helper.mjs']);
  const h1 = codeHash(dir, ['scripts/check.mjs']);
  fs.writeFileSync(path.join(dir, 'scripts/other.mjs'), 'export const z = 2;');
  assert.equal(codeClosure(dir, ['scripts/check.mjs']).files['scripts/helper.mjs'], c.files['scripts/helper.mjs'], 'a file it does not import does not count');
  fs.writeFileSync(path.join(dir, 'scripts/helper.mjs'), 'export const x = 2;');
  assert.notEqual(codeClosure(dir, ['scripts/check.mjs']).files['scripts/helper.mjs'], c.files['scripts/helper.mjs'], 'a helper it imports does');
  assert.equal(typeof h1, 'string');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('reuse: only on a matching identity; two items with one identity are computed once', () => {
  const held = new Set(['k1']);
  const items = [{ kind: 'shot', id: 'k1', side: 'base' }, { kind: 'shot', id: 'k2', side: 'base' }, { kind: 'shot', id: 'k2', side: 'cand' }, { kind: 'shot', id: 'k3', side: 'cand' }];
  const p = planEvidence(items, (k, id) => (held.has(id) ? { ok: true } : null));
  assert.deepEqual(p.reuse.map((r) => r.item.id), ['k1']);
  assert.deepEqual(p.compute.map((i) => `${i.side} ${i.id}`), ['base k2', 'cand k3']);
  // an unchanged rerun: everything held, nothing to compute
  const all = new Set(items.map((i) => i.id));
  assert.equal(planEvidence(items, (k, id) => (all.has(id) ? { ok: true } : null)).compute.length, 0);
});

test('store: put, get by kind and identity, files beside it; a missing file is a miss; the sweep keeps what kept bases name', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ev-store-'));
  const st = new EvidenceStore(dir);
  st.put('shot', 'ab12', { ok: true, text: 'x' }, { png: Buffer.from('png') });
  st.put('shot', 'cd34', { ok: true });
  st.put('check-spacing', 'ef56', { ok: true, result: [] });
  assert.equal(st.get('shot', 'ab12').text, 'x');
  assert.equal(fs.readFileSync(st.file('shot', 'ab12', 'png'), 'utf8'), 'png');
  assert.equal(st.get('shot', 'zz99'), null);
  assert.equal(st.get('check-headers', 'ab12'), null, 'the kind is part of the key');
  fs.rmSync(st.file('shot', 'ab12', 'png'));
  assert.equal(st.get('shot', 'ab12'), null, 'a record whose png is gone is not evidence');
  st.indexBase('main1', { shot: ['cd34'] });
  const old = new Date(Date.now() - 10 * 864e5);
  for (const [k, id] of [['shot', 'cd34'], ['check-spacing', 'ef56']]) fs.utimesSync(st.file(k, id), old, old);
  assert.equal(st.sweep(['main1'], 3), 1, 'only the unindexed, unused one goes');
  assert.ok(st.get('shot', 'cd34'));
  assert.equal(st.get('check-spacing', 'ef56'), null);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('inventory: added and removed screens get explicit outcomes; missing evidence is never unchanged', () => {
  const base = [{ id: 'a', feature: 'f' }, { id: 'gone', feature: 'f' }], cand = [{ id: 'a', feature: 'f' }, { id: 'new', feature: 'f' }];
  const runs = [{ width: 390, lang: 'en' }, { width: 360, lang: 'en' }];
  const ev = { 'base a en-390': { ok: true }, 'base a en-360': { ok: true }, 'base gone en-390': { ok: true }, 'base gone en-360': { ok: true }, 'cand a en-390': { ok: true }, 'cand a en-360': { unstable: 'moved after it settled' }, 'cand new en-390': { ok: false, error: 'does not render' } };
  const inv = reconcileInventory({ base, cand, runsOf: () => runs, have: (side, id, r) => ev[`${side} ${id} ${r.lang}-${r.width}`] || null });
  assert.deepEqual(inv.both.map((s) => s.id), ['a']);
  assert.deepEqual(inv.added.map((s) => s.id), ['new']);
  assert.deepEqual(inv.removed.map((s) => s.id), ['gone']);
  assert.deepEqual(inv.missing.map((m) => `${m.side} ${m.id} ${m.run}`), ['cand a en-360', 'cand new en-360'], 'an unstable run and a run with nothing are missing; a run that rendered broken is a result');
  assert.match(inv.missing[0].why, /unstable/);
});

test('verdict: every pair of the manifest judged, none outside it; a blocked gate passes nothing; an added screen passes or fails on its own', () => {
  const mech = { candidate: 'c', base: 'b', pass: true, outcome: 'pass', mode: 'normal', class: { declared: 'presentation' },
    screens: { diff: [{ id: 's1' }], new: [{ id: 'n1' }], gone: [{ id: 'g1' }] },
    pairs: [{ screen: 's1', lang: 'en', width: 390, kind: 'changed', pct: 2 }, { screen: 'n1', lang: 'en', width: 390, kind: 'new', pct: null }, { screen: 'g1', lang: 'en', width: 390, kind: 'gone', pct: null }] };
  const good = { pass: true, candidate: 'c', base: 'b', pairs: [{ screen: 's1', lang: 'en', width: 390, verdict: 'better' }, { screen: 'n1', lang: 'en', width: 390, verdict: 'pass' }, { screen: 'g1', lang: 'en', width: 390, verdict: 'pass' }], gone: [{ screen: 'g1', why: 'its job moved to s1' }] };
  assert.deepEqual(checkVerdict(good, mech).problems, []);
  assert.match(checkVerdict({ ...good, gone: [] }, mech).problems.join(' | '), /g1 was removed from the atlas: the verdict must say why/);
  assert.match(checkVerdict({ ...good, pairs: good.pairs.filter((p) => p.screen !== 'n1') }, mech).problems.join(' | '), /no judgement for pair n1 en-390/);
  assert.match(checkVerdict({ ...good, pairs: good.pairs.map((p) => (p.screen === 'n1' ? { ...p, verdict: 'better' } : p)) }, mech).problems.join(' | '), /n1 en-390 has one side/);
  assert.match(checkVerdict({ ...good, pairs: [...good.pairs, { screen: 'old', lang: 'en', width: 360, verdict: 'same' }] }, mech).problems.join(' | '), /old en-360, which is not in the evidence manifest/);
  assert.match(checkVerdict(good, { ...mech, outcome: 'blocked', pass: false, blocked: ['s1 cand en-390: unstable'] }).problems.join(' | '), /blocked \(s1 cand en-390: unstable\)/);
  assert.match(checkVerdict({ ...good, pairs: good.pairs.map((p) => (p.screen === 's1' ? { ...p, verdict: 'same' } : p)) }, mech).problems.join(' | '), /no pair better/);
});
