// Evidence by identity (docs/design-workflow/gate-v2.md §3): every piece of evidence — a shot, a visit check, a state check, a leaf
// run, a repository check — has an identity that hashes everything it transitively depends on, and is reused only on a matching
// identity. One store for base and candidate: the side is never an input, so equal identities are equal evidence.
// The pure parts (identityOf, canonical, importsOf, reconcileInventory, planEvidence) are tested in tests/evidence.test.mjs.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Bumped when what an identity means changes (an input added or dropped): every stored result is then computed again.
export const SCHEME = 1;

// JSON with sorted keys, so an identity never depends on the order inputs were assembled in.
export function canonical(v) {
  if (v === undefined) return 'null';
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
}
export const sha = (s) => createHash('sha256').update(s).digest('hex');
export const identityOf = (kind, inputs) => sha(`sentri-evidence ${SCHEME} ${kind}\0${canonical(inputs)}`);

// ---------- what files hash to: git blobs of the side's commit ----------

// Every tracked path of a commit and its blob: the worktree the gate serves is that commit, untouched.
export function treeOf(dir, rev = 'HEAD') {
  const r = spawnSync('git', ['ls-tree', '-r', '-z', '--full-tree', rev], { cwd: dir, encoding: 'utf8', maxBuffer: 256 << 20 });
  if (r.status !== 0) throw new Error(`git ls-tree ${rev} in ${dir}: ${(r.stderr || '').trim()}`);
  const tree = new Map();
  for (const rec of r.stdout.split('\0')) { const m = /^\d+ \w+ ([0-9a-f]+)\t(.+)$/s.exec(rec); if (m) tree.set(m[2], m[1]); }
  return tree;
}
// A set of paths as one hash: each path with its blob, or "missing". Memoised by the list itself, since many items share one.
const listMemo = new WeakMap();
export function blobsHash(tree, paths) {
  let byTree = listMemo.get(paths);
  if (byTree?.has(tree)) return byTree.get(tree);
  const h = createHash('sha256');
  for (const p of [...new Set(paths)].sort()) h.update(p).update('\0').update(tree.get(p) || 'missing').update('\n');
  const out = h.digest('hex');
  if (Array.isArray(paths)) { if (!byTree) listMemo.set(paths, (byTree = new Map())); byTree.set(tree, out); }
  return out;
}
// The paths under one folder (a prefix ending in /).
export const under = (tree, prefix) => [...tree.keys()].filter((p) => p.startsWith(prefix));

// What a screen's or a leaf's evidence hashes of its side (gate-v2 §3), from the analyser's inputs (identityInputs / leafInputs):
//   files     the page closure, by blob; the bundle file is left out when its units are named (else a one-function edit would be a
//             new identity for everything that loads the bundle)
//   unbounded a load or navigation the analyser can't bound: every page-loadable file of a fitting type (any: all of them)
//   bundle    the content hashes of the units the closure can run and of the setup; or the whole bundle file
//   screen    the atlas definition, when there is one
// tree: path -> blob of the side's commit; runtime: every page-loadable path. Returns { digest, gap } (gap: units named without hashes).
const MEDIA = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|mp4|webm|mov|mp3|wav|ogg|m4a|vtt)$/i;
export const fileType = (f) => (MEDIA.test(f) ? 'media' : /\.(m?js|cjs)$/i.test(f) ? 'script' : /\.css$/i.test(f) ? 'style' : 'other');
export const BUNDLE_JS = 'ux/design-system/components/bundle.js';
export function inputsDigest(ii, tree, runtime) {
  const unb = ii.unbounded || [];
  const types = new Set(unb.map((u) => u.type || 'any'));
  const unbounded = unb.length ? blobsHash(tree, types.has('any') ? runtime : runtime.filter((f) => types.has(fileType(f)))) : null;
  const b = ii.bundle || { all: true };
  let bundle, gap = false;
  if (b.all) bundle = tree.get(BUNDLE_JS) || 'missing';
  else if (b.unitHashes && b.setupHash) bundle = { units: Object.fromEntries((b.units || []).map((u) => [u, b.unitHashes[u] || 'missing'])), setup: b.setupHash };
  else { bundle = tree.get(BUNDLE_JS) || 'missing'; gap = true; }
  const own = (ii.files || runtime).filter((f) => f !== BUNDLE_JS || typeof bundle === 'string');
  return { digest: { files: blobsHash(tree, own), unbounded, bundle, screen: ii.screen ?? null }, gap };
}

// The screens in reach because of the changed files whose evidence identity is the same on both sides (review of #194): their
// stored evidence would be reused for a screen the analyser says the change can affect, so the identity missed an input. In reach
// because of the files: a changed page-loadable file is in its page closure or fits a load it can't bound; or the bundle changed,
// the screen loads it, and the analyser says every screen (a bundle change), or the screen uses a changed export or the namespace
// as a whole. ids: screens in reach on both sides; same(id): equal identity inputs; inputs(id): the analyser's inputs, both sides.
// → [ 'id (the file that should have changed it)' ]
export function identityContradictions({ ids, files, runtime, reach, same, inputs }) {
  const out = [];
  const changed = files.filter((f) => f !== BUNDLE_JS && runtime.has(f));
  const bundleAll = !!reach?.all && (reach.why || []).some((w) => /^the bundle:/.test(w));
  const fn = new Set(reach?.functions || []);
  for (const id of ids) {
    if (!same(id)) continue;
    const ii = inputs(id);
    if (!ii.length) continue;
    const loads = new Set(ii.flatMap((v) => v.files || []));
    const types = new Set(ii.flatMap((v) => (v.unbounded || []).map((u) => u.type || 'any')));
    const cause = changed.find((f) => loads.has(f)) || changed.find((f) => types.has('any') || types.has(fileType(f)))
      || (files.includes(BUNDLE_JS) && loads.has(BUNDLE_JS) && (bundleAll || ii.some((v) => v.bundle?.all || (v.bundle?.exports || []).some((e) => fn.has(e)))) ? BUNDLE_JS : null);
    if (cause) out.push(`${id} (${cause})`);
  }
  return out;
}

// ---------- what code hashes to: a module and its local imports ----------

// The local modules a source imports or requires by a literal path (static, dynamic or require). A computed import can't be
// followed, so the module's identity can't be bounded: computed is returned true and the caller hashes more.
export function importsOf(source) {
  const out = new Set();
  let computed = false;
  const lit = /(?:\bimport\s*(?:[\w*{}\s,$]+\s*from\s*)?|\bexport\s*[\w*{}\s,$]*\s*from\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)(['"])([^'"]+)\1/g;
  for (const m of source.matchAll(lit)) if (/^\.\.?\//.test(m[2])) out.add(m[2]);
  if (/\bimport\s*\(\s*[^'")\s]|\brequire\s*\(\s*[^'")\s]/.test(source)) computed = true;
  return { local: [...out], computed };
}
// A module's closure from a checkout: every local file it reaches, with its content hash (line endings normalised). Content, not
// blobs: the gate's own tools may be a working copy (its tools are checked equal to the base's before it starts).
export function codeClosure(root, entries) {
  const seen = new Map(), stack = [...entries].map((e) => path.posix.normalize(e));
  let computed = false;
  while (stack.length) {
    const rel = stack.pop();
    if (seen.has(rel)) continue;
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) { seen.set(rel, 'missing'); continue; }
    const text = fs.readFileSync(file);
    // Line endings normalised: two checkouts of one commit (autocrlf on one, not the other) are the same code.
    seen.set(rel, sha(text.toString('utf8').replace(/\r\n/g, '\n')));
    if (!/\.(mjs|cjs|js)$/.test(rel)) continue;
    const imp = importsOf(text.toString('utf8'));
    computed ||= imp.computed;
    for (const i of imp.local) stack.push(path.posix.normalize(path.posix.join(path.posix.dirname(rel), i)));
  }
  return { files: Object.fromEntries([...seen].sort(([a], [b]) => (a < b ? -1 : 1))), computed };
}
const codeMemo = new Map();
export function codeHash(root, entries) {
  const k = root + '\0' + entries.join('\0');
  if (!codeMemo.has(k)) { const c = codeClosure(root, entries); codeMemo.set(k, sha(canonical(c))); }
  return codeMemo.get(k);
}

// ---------- the store ----------
// <dir>/<kind>/<id[0:2]>/<id>.json (+ <id>.<name> files beside it). Written whole or not at all. A base's index names the
// identities it used, so its evidence outlives a sweep; anything else unused for `keepDays` is swept.
export class EvidenceStore {
  constructor(dir) { this.dir = dir; this.hits = 0; this.misses = 0; this.used = new Map(); }
  file(kind, id, name = 'json') { return path.join(this.dir, kind, id.slice(0, 2), `${id}.${name}`); }
  get(kind, id) {
    const f = this.file(kind, id);
    try {
      const rec = JSON.parse(fs.readFileSync(f, 'utf8'));
      for (const n of rec.files || []) if (!fs.existsSync(this.file(kind, id, n))) { this.misses++; return null; }
      const now = new Date(); fs.utimesSync(f, now, now);
      this.hits++; this.use(kind, id);
      return rec;
    } catch { this.misses++; return null; }
  }
  // record: JSON; files: { name: Buffer } stored beside it (a shot's png)
  put(kind, id, record, files = {}) {
    const f = this.file(kind, id);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    for (const [n, buf] of Object.entries(files)) { const t = `${this.file(kind, id, n)}.${process.pid}`; fs.writeFileSync(t, buf); fs.renameSync(t, this.file(kind, id, n)); }
    const t = `${f}.${process.pid}`;
    fs.writeFileSync(t, JSON.stringify({ ...record, kind, id, files: Object.keys(files), at: new Date().toISOString() }));
    fs.renameSync(t, f);
    this.use(kind, id);
  }
  use(kind, id) { if (!this.used.has(kind)) this.used.set(kind, new Set()); this.used.get(kind).add(id); }
  // The identities a base commit's gate used: kept while that base is one of main's last commits.
  indexBase(commit, kinds) {
    const f = path.join(this.dir, 'bases', `${commit}.json`);
    let had = {};
    try { had = JSON.parse(fs.readFileSync(f, 'utf8')); } catch {}
    for (const [k, ids] of Object.entries(kinds)) had[k] = [...new Set([...(had[k] || []), ...ids])];
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(`${f}.${process.pid}`, JSON.stringify(had));
    fs.renameSync(`${f}.${process.pid}`, f);
  }
  // Removes what no kept base names and nothing used within keepDays. keepBases: main's last commits.
  sweep(keepBases, keepDays = 3) {
    const bases = path.join(this.dir, 'bases'), keep = new Set();
    for (const b of fs.existsSync(bases) ? fs.readdirSync(bases) : []) {
      const commit = b.replace(/\.json$/, '');
      if (!keepBases.includes(commit)) { fs.rmSync(path.join(bases, b), { force: true }); continue; }
      try { for (const ids of Object.values(JSON.parse(fs.readFileSync(path.join(bases, b), 'utf8')))) for (const id of ids) keep.add(id); } catch {}
    }
    const cutoff = Date.now() - keepDays * 864e5;
    let removed = 0;
    for (const kind of fs.existsSync(this.dir) ? fs.readdirSync(this.dir) : []) {
      if (kind === 'bases') continue;
      const kd = path.join(this.dir, kind);
      if (!fs.statSync(kd).isDirectory()) continue;
      for (const pre of fs.readdirSync(kd)) for (const f of fs.readdirSync(path.join(kd, pre)).filter((x) => x.endsWith('.json'))) {
        const id = f.slice(0, -5), full = path.join(kd, pre, f);
        if (keep.has(id) || fs.statSync(full).mtimeMs > cutoff) continue;
        for (const g of fs.readdirSync(path.join(kd, pre)).filter((x) => x.startsWith(id + '.'))) fs.rmSync(path.join(kd, pre, g), { force: true });
        removed++;
      }
    }
    return removed;
  }
}

// ---------- planning and reconciling ----------

// Which items the store already holds and which must be computed: items [{ kind, id, ... }] → { reuse: [{ item, record }], compute: [item] }.
// Two items with one identity (base and candidate drawing the same thing) are computed once.
export function planEvidence(items, get) {
  const reuse = [], compute = [], queued = new Set();
  for (const it of items) {
    const rec = get(it.kind, it.id);
    if (rec) { reuse.push({ item: it, record: rec }); continue; }
    if (queued.has(it.kind + ' ' + it.id)) continue;
    queued.add(it.kind + ' ' + it.id);
    compute.push(it);
  }
  return { reuse, compute };
}

// The screen inventory, reconciled on both sides (gate-v2.md §4). base, cand: [{ id, feature }]; runsOf(screen, side): the runs that
// side needs ([{ width, lang }]); have(side, id, run): that run's evidence, or null. Every screen gets an explicit outcome:
//   both     on both sides; compared run by run
//   added    only on the candidate: it needs its own verdict (pass or fail), since there is no better without a base
//   removed  only on base: it needs a stated reason
// and every run a side needs must have evidence: one that doesn't is `missing`, never unchanged.
export function reconcileInventory({ base, cand, runsOf, have }) {
  const b = new Map(base.map((s) => [s.id, s])), c = new Map(cand.map((s) => [s.id, s]));
  const out = { both: [], added: [], removed: [], missing: [] };
  for (const [id, s] of c) (b.has(id) ? out.both : out.added).push({ id, feature: s.feature });
  for (const [id, s] of b) if (!c.has(id)) out.removed.push({ id, feature: s.feature });
  for (const [side, list] of [['base', b], ['cand', c]]) for (const s of list.values()) for (const run of runsOf(s, side)) {
    const ev = have(side, s.id, run);
    if (!ev) out.missing.push({ id: s.id, side, run: `${run.lang}-${run.width}`, why: 'no evidence was produced' });
    else if (ev.machine) out.missing.push({ id: s.id, side, run: `${run.lang}-${run.width}`, why: `machine error twice (${ev.machine}): ${ev.error || ''}`.trim() });
    else if (ev.unstable) out.missing.push({ id: s.id, side, run: `${run.lang}-${run.width}`, why: `unstable: ${ev.unstable}` });
  }
  return out;
}
