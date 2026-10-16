// The gate's one entry point (docs/design-workflow/gate-v2.md §1):
//   evaluate({ base, candidate, mode, ... }) → { outcome: 'pass' | 'fail' | 'blocked', mech, findings, blocked }
// Reach, scheduling, evidence reuse, failure accounting and the evidence manifest the judge decides on all live here; scripts/gate.mjs
// only parses arguments, holds the machine's gate lock and writes mechanical.json. A gate that can't decide checks everything; one
// that can't finish blocks. It never passes on missing evidence.
//   pass     every mechanical check passed and every piece of evidence exists: the judge decides on mech.pairs (gate.md §3-4)
//   fail     a check failed (findings say which)
//   blocked  the gate could not establish the evidence: an unstable capture, a machine error twice, a run that produced nothing,
//            the gate's tools not the base's own. Run it again on a quiet machine, or fix the screen that won't hold still.
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pwPath, playwright } from './playwright-path.mjs';
import { CLASSES, DS_FEATURE, componentPage, componentPagesOf, componentsTouched, idPath, screensOf, pageOf, pageAssets, sharedFiles, coverageLost, effectiveClass, classifyScreens, touchesSystem, touchesTools, queueAhead as queueOf, budgetProblems, critiqueProblems, pageStyling, addedLines, scenarioDebt } from './loop-rules.mjs';
// The reach analyser (gate-v2 §2). Until scripts/static-reach.mjs lands this is its stand-in: every screen, whole-file identities.
// The swap is this one import.
import { reachOf, identityInputs } from './static-reach-stub.mjs';
import { EvidenceStore, identityOf, treeOf, blobsHash, codeHash, sha, reconcileInventory, planEvidence } from './evidence.mjs';
import { createScheduler } from './scheduler.mjs';
import { WORKERS, LAUNCH_ARGS, machineErrorOf, classifyMachineError } from './machine.mjs';
import { BOUNDS } from './settle.mjs';
import { prepareVisit, captureShot, VISIT_CODE, CLOCK, HEIGHT } from './visit.mjs';
import { pctDiff } from './png.mjs';
import { routeFonts } from './font-route.mjs';
import { auditSpacingPage } from './check-spacing.mjs';
import { auditHeadersPage, RUNS as HEADER_RUNS, dedupe as dedupeHeaders } from './check-headers.mjs';
import { auditLegibilityPage, legibilityWorse, count as legCount, failing as legFailing } from './check-legibility.mjs';
import { checkStatesHtml, VW as STATE_VW } from './check-states.mjs';
import { walkTree } from './scenario-tree.mjs';
import { leafRunner, leafRow, reportOf } from './scenario-runner.mjs';
import { openPrs } from './github.mjs';

export const WIDTHS = [390, 360], LANGS = ['en', 'zh'];
const TRIP = { width: 390, lang: 'en' };
const BUNDLE_JS = 'ux/design-system/components/bundle.js';
// What no page can load: the analyser's own rule (static-reach), repeated for the files an `unbounded` load folds in.
const NOT_LOADED = [/^docs\//, /^\.github\//, /^tests\//, /^\.claude\//, /^scripts\//, /^(?!ux\/).*\.md$/i];
const MEDIA = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|mp4|webm|mov|mp3|wav|ogg|m4a|vtt)$/i;
const fileType = (f) => (MEDIA.test(f) ? 'media' : /\.(m?js|cjs)$/i.test(f) ? 'script' : /\.css$/i.test(f) ? 'style' : 'other');
const short = (s) => String(s || '?').slice(0, 7);
const secs = (ms) => Math.round(ms / 100) / 10;
const CHECKERS = { legibility: ['scripts/check-legibility.mjs'], spacing: ['scripts/check-spacing.mjs'], headers: ['scripts/check-headers.mjs'], states: ['scripts/check-states.mjs'], leaf: ['scripts/scenario-runner.mjs'] };

function git(args, cwd) { const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 256 << 20 }); return { code: r.status, out: r.stdout || '', err: r.stderr || '' }; }

export async function evaluate(opts) {
  const { root, out, mode = 'normal', scope = [], declared = 'presentation', quick = false, all: everything = false, keep = false, log = console.log, env = process.env } = opts;
  const t0 = Date.now(), at = {};
  const mark = (k) => { at[k] = Date.now(); };
  const checks = [], gaps = [], blocked = [];
  const check = (name, ok, detail = '') => { checks.push({ check: name, result: ok === null ? 'skipped' : ok ? 'pass' : 'fail', detail }); log((ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL').padEnd(5), name, detail ? '— ' + String(detail).split('\n')[0] : ''); };
  const block = (why) => { blocked.push(why); log('BLOCK', why); };
  const mech = { outcome: null, pass: false, candidate: '', base: '', ref: opts.ref || opts.candidate, mode, scope, quick, class: { declared }, checks, gaps, blocked, screens: null, pairs: [], inventory: null, evidence: null, timings: {} };
  const kids = [], cleanups = [];
  const finish = () => {
    for (const k of kids) try { k.kill(); } catch {}
    for (const c of cleanups.reverse()) try { c(); } catch {}
    mech.outcome = blocked.length ? 'blocked' : checks.some((c) => c.result === 'fail') ? 'fail' : 'pass';
    mech.pass = mech.outcome === 'pass';
    mech.timings.total = secs(Date.now() - t0);
    return { outcome: mech.outcome, mech, findings: checks.filter((c) => c.result === 'fail'), blocked };
  };

  // ---------- 0. the exact candidate, against the base, judged with the base's own tools ----------
  const rev = (r) => git(['rev-parse', '--verify', '--quiet', `${r}^{commit}`], root).out.trim();
  mech.base = rev(opts.base);
  mech.candidate = rev(opts.candidate);
  if (!mech.base) { block(`the base ${opts.base} does not resolve`); return finish(); }
  if (!mech.candidate) { check('candidate exists', false, `no commit for ${opts.candidate}`); return finish(); }
  if (!quick) {
    const stale = git(['diff', '--name-only', mech.base, '--', 'scripts', 'docs/design-workflow', 'package.json'], root).out.trim().split(/\r?\n/).filter(Boolean);
    if (stale.length) { block(`the gate runs the base's own tools: this checkout's ${stale.slice(0, 3).join(', ')} differ from ${short(mech.base)} (run it from a checkout of the base: git checkout --detach origin/main)`); return finish(); }
  }
  const contains = git(['merge-base', '--is-ancestor', mech.base, mech.candidate], root).code === 0;
  check('candidate contains the base', contains, contains ? short(mech.base) : 'merge main forward first: git fetch origin && git merge origin/main (R10, R12)');
  if (!contains) return finish();
  const files = git(['diff', '--name-only', '--no-renames', mech.base, mech.candidate], root).out.split(/\r?\n/).filter(Boolean);
  mech.files = files;

  // ---------- the two sides: worktrees, trees, atlases ----------
  const wtRoot = path.join(os.tmpdir(), `sg-${process.pid.toString(36)}${Date.now().toString(36).slice(-4)}`);
  const S = { base: { sha: mech.base, dir: path.join(wtRoot, 'base') }, cand: { sha: mech.candidate, dir: path.join(wtRoot, 'cand') } };
  mech.worktrees = { base: S.base.dir, cand: S.cand.dir };
  cleanups.push(() => { if (keep) return; for (const k of ['base', 'cand']) git(['worktree', 'remove', '--force', S[k].dir], root); git(['worktree', 'prune'], root); try { fs.rmSync(wtRoot, { recursive: true, force: true, maxRetries: 5 }); } catch {} });
  for (const k of ['base', 'cand']) {
    const r = git(['worktree', 'add', '--detach', S[k].dir, S[k].sha], root);
    if (r.code || !fs.existsSync(path.join(S[k].dir, 'scripts/serve-ux.cjs'))) { block(`worktree ${k}: ${r.err.split('\n').filter((l) => /error|fatal/.test(l)).slice(0, 2).join(' | ')}`); return finish(); }
  }
  for (const k of ['base', 'cand']) {
    const s = S[k];
    s.tree = treeOf(root, s.sha);
    s.atlas = JSON.parse(fs.readFileSync(path.join(s.dir, 'atlas/atlas.json'), 'utf8'));
    s.screens = screensOf(s.atlas);
    s.ds = componentPagesOf(s.atlas);
    s.runtime = Object.freeze([...s.tree.keys()].filter((f) => !NOT_LOADED.some((re) => re.test(f))).sort());
    s.fontsRoot = s.dir;
  }
  // Shared files from the base checkout: each atlas screen's page and what that page loads (the class and the queue use them).
  const assets = {};
  for (const p of new Set(S.base.screens.map((x) => pageOf(x.url)))) { const f = path.join(S.base.dir, p); assets[p] = fs.existsSync(f) ? pageAssets(fs.readFileSync(f, 'utf8'), p).filter((a) => fs.existsSync(path.join(S.base.dir, a))) : []; }
  const shared = sharedFiles(S.base.screens, assets);
  const touched = touchesSystem(files, shared);
  mech.shared = { files: Object.keys(shared).length, touched: Object.fromEntries(touched.map((f) => [f, shared[f] || []])) };

  // ---------- reach (§2) ----------
  const reach = (() => {
    const r = reachOf({ dir: S.base.dir, atlas: S.base.atlas }, { dir: S.cand.dir, atlas: S.cand.atlas }, { files });
    if (quick) {
      const feats = new Set([...scope, ...(componentsTouched(files).length ? [DS_FEATURE] : [])]);
      const ids = [...S.base.screens, ...S.base.ds, ...S.cand.screens, ...S.cand.ds].filter((x) => feats.has(x.feature)).map((x) => x.id);
      return { ...r, all: false, screens: [...new Set(ids)], why: ['quick: the scope only, and the component pages of a change to a component'] };
    }
    if (everything) return { ...r, all: true, why: ['--all', ...r.why] };
    // functions: null is "the graph is undecided": every screen
    if (r.functions === null && !r.all) return { ...r, all: true, why: [...r.why, 'the bundle graph is undecided: every screen'] };
    return r;
  })();
  const reachIds = new Set(reach.all ? [...S.base.screens, ...S.base.ds, ...S.cand.screens, ...S.cand.ds].map((x) => x.id) : reach.screens);
  // scope is always in
  for (const x of [...S.base.screens, ...S.base.ds, ...S.cand.screens, ...S.cand.ds]) if (scope.includes(x.feature)) reachIds.add(x.id);
  const inReach = (x) => reachIds.has(x.id);
  mech.reach = { all: !!reach.all, screens: [...reachIds].length, functions: reach.functions, leaves: (reach.leaves || []).length, why: reach.why };
  log(`reach: ${reach.all ? 'all screens' : `${reachIds.size} screen(s)`}${reach.why?.length ? ` (${reach.why.join('; ')})` : ''}`);
  const byFiles = effectiveClass({ declared, files, diffs: [], scope, shared });
  mech.class = { declared, effective: byFiles.cls, why: byFiles.why };
  if (byFiles.cls !== declared) log(`class: ${declared} → ${byFiles.cls} (${byFiles.why.join('; ')})`);
  // A shared-component change is held to no worse than main on legibility (README, Legibility gate); otherwise strict while the
  // README says so. Known before anything is shot, so the visits know whether base needs its legibility audit.
  const strictLeg = declared !== 'shared' && /^Legibility gate: strict\s*$/m.test(fs.readFileSync(path.join(S.cand.dir, 'docs/design-workflow/README.md'), 'utf8'));
  mark('setup');

  // ---------- the evidence store and the identities ----------
  const gateDir = path.join(path.resolve(root, git(['rev-parse', '--git-common-dir'], root).out.trim()), 'sentri-gate');
  const store = new EvidenceStore(path.join(gateDir, 'evidence'));
  // reused and computed, per evidence kind: what mechanical.json's evidence.byKind reports
  const tally = {};
  const plan_ = (list) => {
    const p = planEvidence(list, (k, id) => store.get(k, id));
    for (const { item } of p.reuse) (tally[item.kind] ||= { reused: 0, computed: 0 }).reused++;
    for (const it of p.compute) (tally[it.kind] ||= { reused: 0, computed: 0 }).computed++;
    return p;
  };
  const tallyRepo = (kind, reused) => { (tally[kind] ||= { reused: 0, computed: 0 })[reused ? 'reused' : 'computed']++; };
  const sched = createScheduler({ playwright, log });
  cleanups.push(() => { sched.close(); });
  const browser = await sched.browser();
  const pwVersion = (() => { try { return JSON.parse(fs.readFileSync(path.join(pwPath, 'package.json'), 'utf8')).version; } catch { return '?'; } })();
  const render = { playwright: pwVersion, browser: browser.version(), platform: process.platform, launch: LAUNCH_ARGS, clock: CLOCK, height: HEIGHT, dsf: 1, bounds: BOUNDS };
  const code = Object.fromEntries(Object.entries(CHECKERS).map(([k, f]) => [k, codeHash(root, f)]));
  code.visit = codeHash(root, VISIT_CODE);
  const blob = (side, f) => S[side].tree.get(f) || 'missing';
  const harness = (side) => ({ bare: blob(side, 'ux/system/atlas-bare.js'), server: blob(side, 'scripts/serve-ux.cjs'), fonts: blobsHash(S[side].tree, S[side].runtime.filter((f) => f.startsWith('vendor/fonts/'))) });
  const sideName = (side) => (side === 'base' ? 'base' : 'candidate');
  const bundleGap = new Set();
  const inputsMemo = new Map();
  // A screen's share of its identity: what the analyser says it depends on, hashed by blob on its side.
  const screenInputs = (side, id) => {
    const k = side + ' ' + id;
    if (inputsMemo.has(k)) return inputsMemo.get(k);
    const tree = S[side].tree;
    let ii = null;
    try { ii = identityInputs(sideName(side), id); } catch (e) { gaps.push(`identityInputs(${sideName(side)}, ${id}) threw (${e.message}): its identity hashes every page-loadable file`); }
    const def = [...S[side].screens, ...S[side].ds].find((x) => x.id === id);
    let v;
    if (!ii) v = { files: blobsHash(tree, S[side].runtime), bundle: blob(side, BUNDLE_JS), screen: def, why: 'no identity inputs: every page-loadable file' };
    else {
      const unb = ii.unbounded || [];
      const types = new Set(unb.map((u) => u.type || 'any'));
      const folded = unb.length ? blobsHash(tree, types.has('any') ? S[side].runtime : S[side].runtime.filter((f) => types.has(fileType(f)))) : null;
      let bundle;
      const b = ii.bundle || { all: true };
      if (b.all) bundle = blob(side, BUNDLE_JS);
      else if (b.unitHashes && b.setupHash) bundle = { units: Object.fromEntries((b.units || []).map((u) => [u, b.unitHashes[u] || 'missing'])), setup: b.setupHash };
      else { bundle = blob(side, BUNDLE_JS); bundleGap.add(id); }
      v = { files: blobsHash(tree, ii.files || S[side].runtime), unbounded: folded, bundle, screen: ii.screen || def };
    }
    inputsMemo.set(k, v);
    return v;
  };
  const shotId = (side, x, width, lang, vmode) => identityOf('shot', { screen: screenInputs(side, x.id), harness: harness(side), render, width, lang, mode: vmode, code: code.visit });
  const checkId = (side, x, width, lang, name, params) => identityOf(`check-${name}`, { screen: screenInputs(side, x.id), harness: harness(side), render, width, lang, params, code: code.visit, checker: code[name] });

  // ---------- 1. the repository checks (identity: the whole tree) ----------
  const wholeTree = (side) => blobsHash(S[side].tree, [...S[side].tree.keys()]);
  const repoId = (kind) => identityOf(kind, { tree: wholeTree('cand'), node: process.version, playwright: pwVersion, gate: kind === 'atlas' ? codeHash(root, ['scripts/evaluate.mjs']) : null });
  {
    const id = repoId('atlas'), had = store.get('atlas', id);
    tallyRepo('atlas', !!had);
    if (had) check('atlas.json is regenerated', true, 'reused (same tree)');
    else {
      const strip = (s) => { const j = JSON.parse(s); delete j.generated; delete j.commit; return JSON.stringify(j); };
      const fresh = (dir) => {
        const file = path.join(dir, 'atlas/atlas.json'), before = fs.readFileSync(file, 'utf8');
        const r = spawnSync(process.execPath, ['scripts/build-atlas.mjs'], { cwd: dir, encoding: 'utf8', env });
        const same = r.status === 0 && strip(before) === strip(fs.readFileSync(file, 'utf8'));
        git(['checkout', '--', 'atlas/atlas.json'], dir);
        return { same, tail: ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-3).join(' | '), code: r.status };
      };
      const c = fresh(S.cand.dir);
      const sources = files.filter((f) => /^(features|sections|references|review|atlas)\/|^ux\/design-system\/components\/(_proposed\.json$|[^/]+\/(gate\.json|variants\.json|variants\/))|^scripts\/build-atlas\.mjs$/.test(f));
      const debt = !c.same && !sources.length && !fresh(S.base.dir).same;
      if (debt) gaps.push('atlas/atlas.json is stale on main itself (npm run atlas changes it); this change touches none of its sources');
      check('atlas.json is regenerated', c.same || debt, c.same ? '' : debt ? 'stale on main too, so main owns it' : c.code ? c.tail : 'npm run atlas changes atlas/atlas.json beyond its stamps: rebuild and commit it');
      if (c.same) store.put('atlas', id, { ok: true });
    }
  }
  {
    const r = git(['grep', '-n', '-E', '^(<<<<<<<|>>>>>>>)( |$)', mech.candidate], root);
    check('no conflict markers', !r.out.trim(), r.out.trim().split('\n').slice(0, 3).join(' | '));
  }
  {
    const dirs = fs.existsSync(path.join(S.base.dir, 'features')) ? fs.readdirSync(path.join(S.base.dir, 'features')) : [];
    const withLeaves = dirs.filter((f) => fs.existsSync(path.join(S.base.dir, 'features', f, 'scenarios.json')));
    const coverage = (dir) => ({ runner: fs.existsSync(path.join(dir, 'scripts/run-scenarios.mjs')), specs: Object.fromEntries(withLeaves.map((f) => { try { return [f, JSON.parse(fs.readFileSync(path.join(dir, 'features', f, 'scenarios.json'), 'utf8'))]; } catch { return [f, null]; } })) });
    const lost = coverageLost(coverage(S.base.dir), coverage(S.cand.dir));
    check('behaviour coverage kept', !lost.length, lost.length ? `removes behaviour coverage (${lost.slice(0, 3).join('; ')}): do it in its own workflow PR` : `${withLeaves.length} feature(s) with leaves`);
  }

  // ---------- servers ----------
  const freePort = () => new Promise((res) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
  for (const k of ['base', 'cand']) {
    const port = await freePort();
    kids.push(spawn(process.execPath, [path.join(S[k].dir, 'scripts/serve-ux.cjs'), String(port)], { cwd: S[k].dir, stdio: 'ignore' }));
    S[k].url = `http://127.0.0.1:${port}`; // serve-ux listens on IPv4 only
    let up = false;
    for (let i = 0; i < 100 && !up; i++) { try { up = (await fetch(S[k].url + '/atlas/atlas.json')).ok; } catch {} if (!up) await new Promise((r) => setTimeout(r, 100)); }
    if (!up) { block(`the ${k} server did not start`); return finish(); }
  }

  // ---------- 2. plan the evidence: every run each side needs ----------
  // A screen in the reach is shot at 390 and 360 in EN and ZH (a component page in EN: its Chinese cells are its own states); every
  // other screen once at 390 EN, a tripwire (a --quick self-check skips it). A screen in the reach also gets its visit checks.
  const runsOf = (x) => (inReach(x) ? WIDTHS.flatMap((width) => (componentPage(x.id) ? ['en'] : LANGS).map((lang) => ({ width, lang }))) : quick ? [] : [{ width: TRIP.width, lang: TRIP.lang }]);
  const visitChecks = (side, x, width, lang) => {
    if (!inReach(x) || componentPage(x.id)) return [];
    const out = [];
    const hr = HEADER_RUNS.find((r) => r.width === width && r.lang === lang);
    if (hr) out.push({ name: 'headers', params: { checks: hr.checks } });
    if (width === 390 && lang === 'en') {
      out.push({ name: 'spacing', params: {} });
      if (side === 'cand' || !strictLeg) out.push({ name: 'legibility', params: {} });
    }
    return out;
  };
  const items = [];      // every evidence item, { kind, id, side, x, width, lang, name?, params? }
  for (const side of ['base', 'cand']) for (const x of [...S[side].screens, ...S[side].ds]) for (const { width, lang } of runsOf(x)) {
    const vmode = componentPage(x.id) ? 'grid' : 'screen';
    items.push({ kind: 'shot', id: shotId(side, x, width, lang, vmode), side, x, width, lang, vmode });
    for (const c of visitChecks(side, x, width, lang)) items.push({ kind: `check-${c.name}`, id: checkId(side, x, width, lang, c.name, c.params), side, x, width, lang, name: c.name, params: c.params, vmode });
  }
  const plan = plan_(items);
  const results = new Map();  // id → record (stored, or computed now)
  for (const { item, record } of plan.reuse) results.set(item.id, { ...record, reused: true });
  // Group what must be computed into visits: one per side, screen, width and language.
  const visits = new Map();
  for (const it of plan.compute) {
    const k = `${it.side}|${it.x.id}|${it.width}|${it.lang}`;
    if (!visits.has(k)) visits.set(k, { side: it.side, x: it.x, width: it.width, lang: it.lang, vmode: it.vmode, items: [] });
    visits.get(k).items.push(it);
  }
  // Every visit takes its shot (a visit is not evidence unless it held still); a shot item not asked for is compared with the
  // stored one of the same identity instead, and differing is instability.
  const shotOf = new Map(items.filter((i) => i.kind === 'shot').map((i) => [`${i.side}|${i.x.id}|${i.width}|${i.lang}`, i]));
  mech.evidence = { items: items.length, reused: plan.reuse.length, toCompute: plan.compute.length, visits: visits.size };
  log(`evidence: ${items.length} item(s), ${plan.reuse.length} reused, ${plan.compute.length} to compute in ${visits.size} visit(s)`);
  mark('plan');

  const urlOf = (side, x) => { const u = new URL(S[side].url + x.url); if (!componentPage(x.id)) u.searchParams.set('screen', x.id); return u.href; };
  const auditFor = { spacing: (page) => auditSpacingPage(page), headers: async (page, it) => dedupeHeaders((await auditHeadersPage(page, { width: it.width, lang: it.lang, checks: it.params.checks })).defects), legibility: (page) => auditLegibilityPage(page) };
  const visitTask = (v) => ({
    kind: 'visit', label: `${v.side} ${v.x.id} ${v.lang}-${v.width}`, priority: 0,
    run: async ({ browser: b }) => {
      const vis = await prepareVisit(b, { url: urlOf(v.side, v.x), mode: v.vmode, width: v.width, lang: v.lang, fontsRoot: S[v.side].fontsRoot });
      try {
        if (vis.machine) return { machine: vis.machine, error: vis.error };
        if (vis.unstable) return { unstable: vis.unstable };
        if (!vis.ok) return { error: vis.error };
        const shot = await captureShot(vis);
        if (shot.machine) return { machine: shot.machine, error: shot.error };
        if (shot.unstable) return { unstable: shot.unstable };
        const got = { shot, checks: {} };
        // legibility scrolls the page, so it goes last
        for (const it of v.items.filter((i) => i.kind !== 'shot').sort((a, c) => (a.name === 'legibility') - (c.name === 'legibility'))) {
          try { got.checks[it.id] = { ok: true, result: await auditFor[it.name](vis.page, it) }; } catch (e) { const msg = String(e.message || e).split('\n')[0]; if (classifyMachineError(msg)) return { machine: classifyMachineError(msg), error: msg }; got.checks[it.id] = { ok: false, error: msg }; }
        }
        if (vis.netErrors.length) return { machine: 'net-error', error: vis.netErrors[0] };
        return got;
      } finally { await vis.close(); }
    },
  });

  // ---------- state checks: every variant file on each side ----------
  const variantFiles = (side) => [...S[side].tree.keys()].filter((f) => /^ux\/design-system\/components\/[^/]+\/variants\/[^/]+\.html$/.test(f)).sort();
  const dsInputs = (side) => ({ tokens: blob(side, 'ux/design-system/tokens.css'), css: blob(side, 'ux/design-system/components/bundle.css'), js: blob(side, BUNDLE_JS), fonts: harness(side).fonts });
  const stateItems = [];
  for (const side of ['base', 'cand']) for (const f of variantFiles(side)) {
    const html = fs.readFileSync(path.join(S[side].dir, f), 'utf8');
    const loads = pageAssets(html, f);
    // a specimen whose own scripts load by a computed URL depends on the whole page tree
    const computed = /\bfetch\s*\(|\bimport\s*\(|XMLHttpRequest|\.src\s*=|setAttribute\(\s*['"](src|href)/.test(html);
    const id = identityOf('state', { file: blob(side, f), loads: blobsHash(S[side].tree, loads), tree: computed ? blobsHash(S[side].tree, S[side].runtime) : null, ds: dsInputs(side), vw: STATE_VW, render, checker: code.states });
    const [, comp, variant] = /^ux\/design-system\/components\/([^/]+)\/variants\/([^/]+)\.html$/.exec(f);
    stateItems.push({ kind: 'state', id, side, file: f, comp, variant });
  }
  const statePlan = plan_(stateItems);
  for (const { item, record } of statePlan.reuse) results.set(item.id, { ...record, reused: true });
  const stateTask = (it) => ({
    kind: 'state', label: `${it.side} ${it.comp}/${it.variant}`, priority: 1,
    run: async ({ browser: b }) => {
      const context = await b.newContext();
      try {
        await routeFonts(context, S[it.side].fontsRoot);
        const parser = await context.newPage();
        await parser.goto(S[it.side].url + '/ux/design-system/tokens.css', { timeout: 30000 });
        const states = await checkStatesHtml({ context, parser, base: S[it.side].url, html: fs.readFileSync(path.join(S[it.side].dir, it.file), 'utf8'), dir: `/ux/design-system/components/${it.comp}/variants/` });
        // a resource that failed to load, or a render that timed out, is the machine: retried once, never counted
        const machine = states.flatMap((s) => s.problems).map((p) => classifyMachineError(p.detail)).find(Boolean);
        if (machine) return { machine, error: states.flatMap((s) => s.problems).find((p) => classifyMachineError(p.detail)).detail };
        return { ok: true, states };
      } finally { await context.close().catch(() => {}); }
    },
  });
  mech.evidence.states = { items: stateItems.length, reused: statePlan.reuse.length, toCompute: statePlan.compute.length };

  // ---------- npm test (its own browsers: two of the scheduler's slots) ----------
  const testId = repoId('npm-test');
  const testHad = store.get('npm-test', testId);
  tallyRepo('npm-test', !!testHad);
  const npmTest = testHad ? Promise.resolve({ ...testHad, reused: true }) : sched.run({
    kind: 'npm-test', label: 'npm test', weight: 2, priority: 0, browserless: true,
    run: () => new Promise((res) => {
      const logFile = path.join(out, 'npm-test.log'), fd = fs.openSync(logFile, 'w');
      const p = spawn('npm test', { cwd: S.cand.dir, stdio: ['ignore', fd, fd], env, shell: true });
      kids.push(p);
      p.on('exit', (c) => { try { fs.closeSync(fd); } catch {} const text = fs.readFileSync(logFile, 'utf8'); res({ code: c ?? 1, counts: (text.match(/ℹ (pass|fail|skipped) \d+/g) || []).join(', '), failed: [...new Set(text.split('\n').map((l) => /^\s*✖\s+(.+?)(?:\s+\([\d.]+m?s\))?\s*$/.exec(l)?.[1]).filter((t) => t && !/^failing tests:?$/i.test(t)))], tail: text.trim().split('\n').slice(-6).join('\n') }); });
    }),
  });

  // ---------- run the browser work ----------
  mark('submit');
  const visitResults = new Map();
  const visitDone = Promise.all([...visits.values()].map((v) => sched.run(visitTask(v)).then((r) => visitResults.set(v, r))));
  const stateDone = Promise.all(statePlan.compute.map((it) => sched.run(stateTask(it)).then((r) => results.set(it.id, r))));
  await visitDone;
  mark('visits');
  // file each visit's results under its items' identities; store design results only
  for (const [v, r] of visitResults) {
    const sk = `${v.side}|${v.x.id}|${v.width}|${v.lang}`, shotItem = shotOf.get(sk);
    if (r.machine || r.unstable) { for (const it of v.items) results.set(it.id, { machine: r.machine, unstable: r.unstable, error: r.error }); if (!v.items.includes(shotItem)) results.set(`visit ${sk}`, { machine: r.machine, unstable: r.unstable, error: r.error }); continue; }
    if (r.error && !r.shot) { for (const it of v.items) results.set(it.id, { ok: false, error: r.error }); continue; }
    if (v.items.includes(shotItem)) {
      const rec = { ok: true, screen: v.x.id, feature: v.x.feature, width: v.width, lang: v.lang, text: r.shot.text };
      store.put('shot', shotItem.id, rec, { png: r.shot.png });
      results.set(shotItem.id, { ...rec, files: ['png'] });
    } else {
      // the shot was reused: this fresh one must be the same image
      const f = store.file('shot', shotItem.id, 'png');
      if (fs.existsSync(f) && !fs.readFileSync(f).equals(Buffer.from(r.shot.png))) results.set(`visit ${sk}`, { unstable: `rendered differently from its stored shot with the same identity (${short(shotItem.id)})` });
    }
    for (const it of v.items.filter((i) => i.kind !== 'shot')) {
      const c = r.checks[it.id];
      if (c?.ok) { store.put(it.kind, it.id, { ok: true, result: c.result }); results.set(it.id, { ok: true, result: c.result }); }
      else results.set(it.id, { ok: false, error: c?.error || 'not run' });
    }
  }
  for (const [k, r] of results) if (k.startsWith('visit ') && r.unstable) block(`${k.slice(6).replace(/\|/g, ' ')}: unstable: ${r.unstable}`);
  const png = (id) => store.file('shot', id, 'png');

  // ---------- 3. the screen inventory, both sides, and the shot comparison ----------
  const runsFor = (side) => items.filter((i) => i.kind === 'shot' && i.side === side).map((i) => {
    const r = results.get(i.id) || {};
    return { screen: i.x.id, feature: i.x.feature, lang: i.lang, width: i.width, ok: r.ok === true, error: r.error || (r.unstable ? `unstable: ${r.unstable}` : r.machine ? `machine error twice: ${r.machine}` : undefined), id: i.id, text: r.text, png: r.ok ? png(i.id) : null };
  });
  const shots = { base: runsFor('base'), cand: runsFor('cand') };
  // Chinese: a ?lang=zh page that shows the same words as its English run (same side, width) does not render Chinese.
  for (const side of ['base', 'cand']) {
    const en = new Map(shots[side].filter((x) => x.lang === 'en').map((x) => [`${x.screen} ${x.width}`, x.text]));
    for (const x of shots[side]) if (x.lang !== 'en' && x.ok) { const e = en.get(`${x.screen} ${x.width}`); x.zh = e === undefined ? 'unknown' : e === x.text ? 'ignored' : 'rendered'; }
  }
  const inv = reconcileInventory({
    base: [...S.base.screens, ...S.base.ds], cand: [...S.cand.screens, ...S.cand.ds],
    runsOf: (x) => runsOf(x),
    have: (side, id, run) => { const it = shotOf.get(`${side}|${id}|${run.width}|${run.lang}`); const r = it && results.get(it.id); return r ? r : null; },
  });
  mech.inventory = { both: inv.both.length, added: inv.added.map((s) => ({ ...s, needs: 'a verdict: pass or fail (no base to be better than)' })), removed: inv.removed.map((s) => ({ ...s, needs: 'a stated reason under "gone"' })), missing: inv.missing };
  for (const m of inv.missing) block(`${m.id} ${m.side} ${m.run}: no evidence (${m.why}): missing evidence is never unchanged`);
  const key = (x) => `${x.screen} ${x.lang}-${x.width}`;
  const baseAt = new Map(shots.base.map((x) => [key(x), x])), candAt = new Map(shots.cand.map((x) => [key(x), x]));
  const pct = {};
  for (const c of shots.cand) {
    const b = baseAt.get(key(c));
    if (!c.ok || !b?.ok) continue;
    pct[key(c)] = c.id === b.id ? 0 : pctDiff(fs.readFileSync(b.png), fs.readFileSync(c.png));
  }
  const screens = classifyScreens(shots.base, shots.cand, (id, x) => pct[key(x)] ?? 0);
  mech.screens = screens;
  log(`screens: ${screens.same.length} same, ${screens.diff.length} changed, ${screens.new.length} new, ${screens.gone.length} gone, ${screens.broken.length} broken${screens.bothBroken.length ? `, ${screens.bothBroken.length} with a run broken on both` : ''}`);
  for (const d of screens.diff) log(`  DIFF ${String(d.pct).padStart(7)}%  ${d.id}  ${d.runs.join(' ')}`);
  check('no screen broken by the change', !screens.broken.length, screens.broken.map((s) => `${s.id} ${s.error}`).slice(0, 3).join(' | '));
  if (screens.bothBroken.length) gaps.push(`${screens.bothBroken.length} screen(s) have a run that renders on neither base nor candidate (main's debt): ${screens.bothBroken.map((s) => `${s.id} (${s.error})`).slice(0, 5).join(', ')}`);
  mark('compare');

  // A changed screen is visited once more on each side, fresh, at a run that differed: each side must draw exactly its own shot
  // again. One that doesn't is unstable across visits, and its diff can't be told from noise: the gate blocks.
  // A shot already confirmed this way (a fresh visit drew exactly it) is evidence of its own, kept by the shot's identity: an
  // unchanged screen is not visited again because main moved or the gate is run again.
  const confirm = [];
  let confirmedBefore = 0;
  for (const d of screens.diff) {
    const t = d.runs.find((x) => pct[`${d.id} ${x}`] > 0);
    if (!t) continue;
    const [lang, w] = t.split('-');
    for (const side of ['base', 'cand']) {
      const first = (side === 'base' ? baseAt : candAt).get(`${d.id} ${lang}-${w}`);
      if (store.get('confirm', first.id)) { confirmedBefore++; tallyRepo('confirm', true); continue; }
      tallyRepo('confirm', false);
      confirm.push({ side, id: d.id, lang, width: Number(w) });
    }
  }
  await Promise.all(confirm.map((c) => {
    const x = [...S[c.side].screens, ...S[c.side].ds].find((s) => s.id === c.id), first = (c.side === 'base' ? baseAt : candAt).get(`${c.id} ${c.lang}-${c.width}`);
    return sched.run({ kind: 'confirm', label: `confirm ${c.side} ${c.id} ${c.lang}-${c.width}`, priority: 0, run: async ({ browser: b }) => {
      const vis = await prepareVisit(b, { url: urlOf(c.side, x), mode: componentPage(x.id) ? 'grid' : 'screen', width: c.width, lang: c.lang, fontsRoot: S[c.side].fontsRoot });
      try { if (vis.machine) return { machine: vis.machine, error: vis.error }; if (!vis.ok) return { unstable: vis.unstable || vis.error }; return await captureShot(vis); } finally { await vis.close(); }
    } }).then((r) => {
      if (r.machine) block(`${c.id} ${c.side} ${c.lang}-${c.width}: the confirming visit hit a machine error twice (${r.machine}): its diff can't be confirmed`);
      else if (r.unstable) block(`${c.id} ${c.side} ${c.lang}-${c.width}: unstable on the confirming visit: ${r.unstable}`);
      else if (!fs.readFileSync(first.png).equals(Buffer.from(r.png))) block(`${c.id} ${c.side} ${c.lang}-${c.width}: unstable: two visits drew it differently, so its diff can't be told from noise`);
      else store.put('confirm', first.id, { ok: true, screen: c.id, run: `${c.lang}-${c.width}` });
    });
  }));
  mech.confirmed = { visited: confirm.length, before: confirmedBefore };
  mark('confirm');

  // ---------- 4. the pairs the judge decides on: every changed, new or removed screen at each run ----------
  const moved = [...screens.diff, ...screens.new, ...screens.gone];
  const zhIgnored = new Set(), zhLost = new Set(), pairJobs = [];
  const round4 = (p) => (p > 0 ? Math.max(0.0001, Math.round(p * 1e4) / 1e4) : 0);
  for (const s of moved) for (const width of WIDTHS) for (const lang of LANGS) {
    const k = `${s.id} ${lang}-${width}`, b = baseAt.get(k), c = candAt.get(k);
    const noZh = (x) => lang === 'zh' && x?.ok && x.zh === 'ignored';
    const sides = [b, c].filter((x) => x?.ok);
    if (!sides.length) continue;
    if (sides.every(noZh) && !(pct[k] > 0 && !(pct[`${s.id} en-${width}`] > 0))) { zhIgnored.add(s.id); continue; }
    if (noZh(c) && b?.ok && !noZh(b)) zhLost.add(s.id);
    const kind = b?.ok && c?.ok ? 'changed' : c?.ok ? 'new' : 'gone';
    const file = path.join(out, 'pairs', idPath(s.id), `${lang}-${width}.png`);
    mech.pairs.push({ screen: s.id, feature: s.feature, lang, width, kind, pct: kind === 'changed' ? round4(pct[k] ?? 0) : null, file: path.relative(out, file).replace(/\\/g, '/'), identity: { base: b?.ok ? b.id : null, cand: c?.ok ? c.id : null } });
    pairJobs.push({ file, b, c, lang, width, noZh });
  }
  if (pairJobs.length) await sched.run({ kind: 'pairs', label: `${pairJobs.length} pair image(s)`, priority: 0, run: async ({ browser: b }) => {
    const context = await b.newContext(), page = await context.newPage();
    try {
      for (const j of pairJobs) {
        fs.mkdirSync(path.dirname(j.file), { recursive: true });
        const side = (title, x) => `<div><div style="height:28px;line-height:28px">${title} · ${j.lang} ${j.width}${j.noZh(x) ? ' · NO CHINESE' : ''}</div>${x?.ok ? `<img src="data:image/png;base64,${fs.readFileSync(x.png).toString('base64')}" style="display:block">` : `<div style="width:${j.width}px;height:844px;background:#fff;display:grid;place-items:center">not on this side</div>`}</div>`;
        await page.setViewportSize({ width: j.width * 2 + 48, height: 900 });
        await page.setContent(`<body style="margin:0;background:#ddd;font:600 13px system-ui;display:flex;gap:16px;padding:8px 16px;width:max-content">${side('BASE ' + short(mech.base), j.b)}${side('CANDIDATE ' + short(mech.candidate), j.c)}</body>`);
        await page.screenshot({ path: j.file, fullPage: true });
      }
      return { ok: true };
    } finally { await context.close(); }
  } });
  if (zhIgnored.size) gaps.push(`no Chinese rendering (?lang=zh is ignored) on ${zhIgnored.size} moved screen(s): ${[...zhIgnored].slice(0, 6).join(', ')}${zhIgnored.size > 6 ? ' …' : ''}. ZH fit is unverified there.`);
  if (zhLost.size) gaps.push(`${zhLost.size} screen(s) rendered Chinese on base and not on the candidate: ${[...zhLost].slice(0, 6).join(', ')} (their zh pairs say so)`);
  mark('pairs');

  // ---------- 5. the class, now that the screens are known; the checks that follow from it ----------
  const ec = effectiveClass({ declared, files, diffs: moved, scope, shared });
  mech.class = { declared, effective: ec.cls, why: ec.why };
  if (declared !== 'shared' && mode !== 'refactor') {
    const outside = ec.outside || [];
    check('known reach: only SCOPE moved (P2)', !outside.length, outside.length ? `declared ${declared} for ${scope.join(', ')} but moves ${outside.length} screen(s) of ${[...new Set(outside.map((d) => d.feature))].join(', ')} (${outside.slice(0, 3).map((d) => d.id).join(', ')}): give your part its own rule or token, or make it a declared shared change` : '');
  }
  // The tripwire, a diagnostic while the analyser rolls out: a screen outside the reach that moved means the reach was wrong.
  if (!quick && reachIds.size < [...S.cand.screens, ...S.cand.ds].length) {
    const missed = moved.filter((s) => !reachIds.has(s.id));
    check(`reach: nothing outside it moved (tripwire, ${TRIP.width} ${TRIP.lang})`, !missed.length, missed.length ? `${missed.length} screen(s) outside the reach moved (${missed.slice(0, 3).map((s) => s.id).join(', ')}): the change reaches further than the analyser says; gate again with --all` : `${[...S.cand.screens, ...S.cand.ds].filter((s) => !reachIds.has(s.id)).length} other screen(s) unchanged`);
  }
  if (ec.cls !== byFiles.cls) log(`class: ${declared} → ${ec.cls} (${ec.why.join('; ')})`);
  if (mode === 'refactor') check('refactor: every screen identical', !moved.length, moved.map((s) => s.id).slice(0, 5).join(', '));
  const tools = touchesTools(files);
  const readCand = (p) => { const f = path.join(S.cand.dir, p); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; };
  if (moved.length) {
    const feats = [...screens.diff, ...screens.new].map((s) => s.feature).filter((f) => f !== DS_FEATURE);
    const bp = budgetProblems(feats, readCand);
    check('information budget before layout', !bp.length, bp.length ? bp.join('; ') + ' (P3: write it first, briefs/build.md §2)' : '');
    const cp = critiqueProblems(feats, readCand);
    check('critique of the original before the change', !cp.length, cp.length ? cp.join('; ') + ' (P1, P4: keep, problems, parts and self-crit, briefs/build.md §1, §4)' : '');
    const ps = pageStyling(addedLines(git(['diff', '-U0', mech.base, mech.candidate, '--', 'ux'], root).out));
    mech.pageStyling = ps;
    const proposed = files.includes('ux/design-system/components/_proposed.json') && /^\+\s*[\[{"]/m.test(git(['diff', '-U0', mech.base, mech.candidate, '--', 'ux/design-system/components/_proposed.json'], root).out);
    check('no workaround beside a component proposal', !proposed, proposed ? 'this change proposes a component and changes screens: build the component in the design system in this change (P2, briefs/build.md §3), never a workaround' : '');
    check('design-system components only', !ps.length, ps.length ? `${ps.length} visual declaration(s) added outside ux/design-system (${ps.slice(0, 3).map((p) => p.file.split('/').pop() + ' ' + p.prop).join(', ')}): use a SentriUI component, or build the part in the design system (P2, briefs/build.md §3)` : '');
  }
  if (tools.length && moved.length) check('workflow changes in their own PR', false, `this change moves ${moved.length} screen(s) and also edits the workflow or the gate's tools (${tools.slice(0, 3).join(', ')}): split it`);
  if (ec.cls === 'shared') {
    const branch = String(mech.ref).replace(/^origin\//, '');
    const prs = openPrs(root);
    if (prs.error) check('shared-component queue: first in line', false, `cannot read the queue: ${prs.error}`);
    else {
      const mine = prs.find((p) => p.headRefName === branch);
      if (!mine) check('shared-component queue: first in line', false, `no open PR for ${branch}: open one, the queue orders PRs`);
      else { const ahead = queueOf(prs, mine, shared, (h) => !!h && fs.existsSync(path.join(gateDir, `${h}.json`))); check('shared-component queue: first in line', !ahead.length, ahead.length ? `waiting behind ${ahead.map((p) => '#' + p.number).join(', ')}: merge or close those first, then merge main forward and gate again` : `#${mine.number}`); }
    }
    gaps.push('shared-component change: every changed screen on every feature is judged (split the judges by feature if needed)');
  }

  // ---------- 6. the visit checks on the changed and new screens, from the evidence ----------
  const changedAll = [...screens.diff, ...screens.new].map((s) => s.id);
  const changed = changedAll.filter((id) => !componentPage(id)), changedPages = changedAll.filter(componentPage);
  const evOf = (side, id, width, lang, name) => { const it = items.find((i) => i.kind === `check-${name}` && i.side === side && i.x.id === id && i.width === width && i.lang === lang); return it ? results.get(it.id) : null; };
  const onBase = (id) => S.base.screens.some((s) => s.id === id);
  const missingCheck = (name, side, id, run, r) => { block(`${name}: ${id} ${side} ${run}: ${r?.machine ? `machine error twice (${r.machine})` : r?.unstable ? `unstable: ${r.unstable}` : r?.error ? `did not run (${r.error})` : 'no evidence'}`); };
  if (changed.length) {
    // farm legibility: strict (no violation) while the README says so; no worse than base for a shared change
    const name = `farm legibility (${strictLeg ? 'strict' : 'no worse than base'}) on changed screens`, bad = [];
    for (const id of changed) {
      const c = evOf('cand', id, 390, 'en', 'legibility');
      if (!c?.ok) { missingCheck('legibility', 'cand', id, 'en-390', c); continue; }
      if (strictLeg) { if (legFailing(c.result.audit)) bad.push(`${id}: ${legCount(c.result.audit.small)} small, ${legCount(c.result.audit.c45) + legCount(c.result.audit.c7)} contrast, ${legCount(c.result.audit.taps)} targets`); continue; }
      const b = onBase(id) ? evOf('base', id, 390, 'en', 'legibility') : null;
      if (onBase(id) && !b?.ok) { missingCheck('legibility', 'base', id, 'en-390', b); continue; }
      const w = legibilityWorse(b?.ok ? b.result : null, c.result);
      if (w.worse) bad.push(`${id}: ${w.why.join('; ')}`);
    }
    check(name, !bad.length, bad.length ? `${bad.length} screen(s): ${bad.slice(0, 2).join(' | ')}` : `${changed.length} screen(s)`);
    // P4: clearly wrong spacing; a defect main already has on that screen is main's debt
    {
      const k = (d) => d.check + ' ' + d.detail.replace(/\d+px/g, 'Npx');
      const added = [];
      let debt = 0;
      for (const id of changed) {
        const c = evOf('cand', id, 390, 'en', 'spacing'), b = onBase(id) ? evOf('base', id, 390, 'en', 'spacing') : null;
        if (!c?.ok) { missingCheck('spacing', 'cand', id, 'en-390', c); continue; }
        if (onBase(id) && !b?.ok) { missingCheck('spacing', 'base', id, 'en-390', b); continue; }
        const was = new Set((b?.result || []).map(k));
        for (const d of c.result) { if (was.has(k(d))) debt++; else added.push(`${id}: ${d.check} — ${d.detail}`); }
      }
      check('clear spacing on changed screens (P4)', !added.length, added.length ? `${added.length} new: ${added.slice(0, 2).join(' | ')}` : debt ? `${debt} defect(s) already on main` : '');
      if (debt) gaps.push(`spacing: ${debt} defect(s) on changed screens are already on main`);
    }
    // P3: the Headers law, base against candidate
    {
      const k = (d) => d.check + ' ' + d.lang + ' ' + d.detail.replace(/\d+px/g, 'Npx');
      const added = [];
      let debt = 0;
      for (const id of changed) {
        const C = [], B = [];
        for (const r of HEADER_RUNS) {
          const c = evOf('cand', id, r.width, r.lang, 'headers'), b = onBase(id) ? evOf('base', id, r.width, r.lang, 'headers') : null;
          if (!c?.ok) { missingCheck('headers', 'cand', id, `${r.lang}-${r.width}`, c); continue; }
          if (onBase(id) && !b?.ok) { missingCheck('headers', 'base', id, `${r.lang}-${r.width}`, b); continue; }
          C.push(...c.result); B.push(...(b?.result || []));
        }
        const was = new Set(dedupeHeaders(B).map(k));
        for (const d of dedupeHeaders(C)) { if (was.has(k(d))) debt++; else added.push(`${id}: ${d.check} (${d.lang}-${d.width}) — ${d.detail}`); }
      }
      check('headers on changed screens (P3)', !added.length, added.length ? `${added.length} new: ${added.slice(0, 2).join(' | ')}` : debt ? `${debt} defect(s) already on main` : '');
      if (debt) gaps.push(`headers: ${debt} defect(s) on changed screens are already on main`);
    }
  }
  // P3 on the component pages that moved (ledger L23): the atlas page as drawn, at 360 EN, its own visit (it is not the shot's state)
  if (changedPages.length) {
    const dsItems = [];
    for (const side of ['base', 'cand']) for (const id of changedPages) {
      const x = S[side].ds.find((p) => p.id === id);
      if (x) dsItems.push({ kind: 'ds-headers', id: identityOf('ds-headers', { screen: screenInputs(side, id), harness: harness(side), render, width: 360, lang: 'en', code: code.visit, checker: code.headers }), side, x });
    }
    const p = plan_(dsItems);
    for (const { item, record } of p.reuse) results.set(item.id, record);
    await Promise.all(p.compute.map((it) => sched.run({ kind: 'visit', label: `${it.side} ${it.x.id} headers`, priority: 0, run: async ({ browser: b }) => {
      const vis = await prepareVisit(b, { url: urlOf(it.side, it.x), mode: 'atlas', width: 360, lang: 'en', fontsRoot: S[it.side].fontsRoot });
      try {
        if (vis.machine) return { machine: vis.machine, error: vis.error };
        if (vis.unstable) return { unstable: vis.unstable };
        if (!vis.ok) return { ok: false, error: vis.error };
        const r = await auditHeadersPage(vis.page, { width: 360, lang: 'en', checks: ['contents', 'wrap', 'corner', 'room'] });
        return { ok: true, result: { defects: dedupeHeaders(r.defects), headers: r.seen.length } };
      } finally { await vis.close(); }
    } }).then((r) => { results.set(it.id, r); if (r.ok) store.put('ds-headers', it.id, r); })));
    const k = (d) => d.check + ' ' + d.detail.replace(/\d+px/g, 'Npx');
    const added = [];
    let debt = 0;
    for (const id of changedPages) {
      const c = results.get(dsItems.find((i) => i.side === 'cand' && i.x.id === id)?.id), bi = dsItems.find((i) => i.side === 'base' && i.x.id === id), b = bi && results.get(bi.id);
      if (!c?.ok) { if (c?.machine || c?.unstable) missingCheck('component headers', 'cand', id, 'en-360', c); else added.push(`${id}: did not render (${c?.error || 'no evidence'})`); continue; }
      if (bi && !b?.ok && (b?.machine || b?.unstable)) { missingCheck('component headers', 'base', id, 'en-360', b); continue; }
      const was = new Set((b?.result?.defects || []).map(k));
      for (const d of c.result.defects) { if (was.has(k(d))) debt++; else added.push(`${id}: ${d.check} — ${d.detail}`); }
    }
    check('component pages follow the Headers law (P3)', !added.length, added.length ? `${added.length} new: ${added.slice(0, 2).join(' | ')}` : debt ? `${debt} defect(s) already on main` : `${changedPages.length} page(s)`);
    if (debt) gaps.push(`headers: ${debt} defect(s) on moved component pages are already on main`);
  }
  mark('checks');

  // ---------- 7. scenario leaves: the reach's leaves (and the scope's), on the candidate; the failing ones on base ----------
  // --quick: the scope's features only; otherwise the reach's leaves (the stand-in: every leaf of a feature with a screen in reach)
  const leafSet = new Set(quick ? [] : reach.leaves || []);
  const specOf = (side, f) => { try { return JSON.parse(fs.readFileSync(path.join(S[side].dir, 'features', f, 'scenarios.json'), 'utf8')); } catch { return null; } };
  const featuresWithLeaves = (side) => (fs.existsSync(path.join(S[side].dir, 'features')) ? fs.readdirSync(path.join(S[side].dir, 'features')).filter((f) => fs.existsSync(path.join(S[side].dir, 'features', f, 'scenarios.json'))) : []);
  const leafPlan = [];
  const verbsOf = (side) => { try { return JSON.parse(fs.readFileSync(path.join(S[side].dir, 'ux/laws/strings.json'), 'utf8')).verbs || {}; } catch { return {}; } };
  const leafItemsOf = (side, f, only) => {
    const spec = specOf(side, f); if (!spec) return null;
    const { leaves, nodeCount, problems } = walkTree(spec);
    if (problems.length) return { problems };
    const D = spec.defaults || {}, langs = D.langs || ['en'], widths = D.widths || [390];
    const its = [];
    for (const l of leaves) {
      if (only && !only.has(l.node.id)) continue;
      if (l.node.type !== 'outcome' || l.node.status === 'pending') { its.push({ leaf: l, row: true }); continue; }
      const { children, ...node } = l.node;
      const walked = { node, state: l.state ? { reset: l.state.reset, clock: l.state.clock } : null, taps: l.taps, defaults: D };
      for (const lang of l.node.langs || langs) for (const width of l.node.widths || widths) its.push({ kind: 'leaf', leaf: l, lang, width, side, feature: f, id: identityOf('leaf', { walked, lang, width, files: blobsHash(S[side].tree, S[side].runtime), strings: blob(side, 'ux/laws/strings.json'), render: { ...render, locale: lang === 'zh' ? 'zh-CN' : 'en-GB' }, runner: code.leaf }) });
    }
    return { its, nodeCount, D, langs, widths };
  };
  const runLeaves = async (side, f, plan) => {
    const runner = leafRunner({ base: S[side].url, defaults: plan.D, verbs: verbsOf(side), evidenceDir: path.join(out, 'leaves', side, f) });
    const todo = plan_(plan.its.filter((i) => i.kind));
    for (const { item, record } of todo.reuse) results.set(item.id, { ...record.run, reused: true });
    await Promise.all(todo.compute.map((it) => sched.run({ kind: 'leaf', label: `${side} ${it.leaf.node.id} ${it.lang}-${it.width}`, priority: 2, run: async ({ browser: b }) => {
      let r;
      try { r = await runner(b, it.leaf, it.lang, it.width); } catch (e) { r = { lang: it.lang, width: it.width, result: 'fail', failures: [{ what: 'run', got: String(e?.message || e), tag: null }], skipped: [], notes: [], evidence: [] }; }
      const m = r.result === 'fail' ? machineErrorOf(r.failures) : null;
      return m ? { machine: m, error: r.failures[0]?.got, run: r } : { run: r };
    } }).then((x) => {
      if (x.machine) { results.set(it.id, { ...x.run, machine: x.machine }); return; }
      if (x.error) { results.set(it.id, { lang: it.lang, width: it.width, result: 'fail', failures: [{ what: 'run', got: x.error, tag: null }], skipped: [], notes: [], evidence: [] }); return; }
      results.set(it.id, x.run);
      store.put('leaf', it.id, { run: x.run }); // a design result, pass or fail: the same identity gives the same result
    })));
    for (const it of plan.its.filter((i) => i.kind)) { const r = results.get(it.id); if (r?.machine) block(`scenarios ${f}: ${it.leaf.node.id} ${side} ${it.lang}-${it.width}: machine error twice (${r.machine}: ${String(r.failures?.[0]?.got || '').slice(0, 100)})`); }
    const rows = [];
    for (const l of new Set(plan.its.map((i) => i.leaf))) rows.push(leafRow(l, plan.its.filter((i) => i.leaf === l && i.kind).map((i) => results.get(i.id)).filter((r) => r && !r.machine)));
    return reportOf({ feature: f, commit: S[side].sha, base: S[side].url, langs: plan.langs, widths: plan.widths, nodeCount: plan.nodeCount, rows });
  };
  const leafFeatures = featuresWithLeaves('cand').filter((f) => {
    const spec = specOf('cand', f);
    const ids = spec ? walkTree(spec).leaves.map((l) => l.node.id) : [];
    return scope.includes(f) || ids.some((id) => leafSet.has(id)) || (quick && scope.includes(f));
  });
  const noLeaves = [...new Set([...scope, ...moved.map((s) => s.feature)])].filter((f) => f !== DS_FEATURE && !featuresWithLeaves('cand').includes(f));
  mech.leaves = {};
  await Promise.all(leafFeatures.map(async (f) => {
    const only = scope.includes(f) ? null : new Set(walkTree(specOf('cand', f)).leaves.map((l) => l.node.id).filter((id) => leafSet.has(id)));
    const plan = leafItemsOf('cand', f, only);
    if (!plan) { check(`scenarios ${f}`, false, 'features/' + f + '/scenarios.json is unreadable'); return; }
    if (plan.problems) { check(`scenarios ${f}`, false, `the tree is malformed: ${plan.problems.slice(0, 2).join('; ')}`); return; }
    const report = await runLeaves('cand', f, plan);
    fs.mkdirSync(path.join(out, 'scenarios'), { recursive: true });
    fs.writeFileSync(path.join(out, 'scenarios', `cand-${f}.json`), JSON.stringify(report, null, 1));
    const failed = report.leaves.filter((x) => x.result === 'fail').map((x) => x.id);
    mech.leaves[f] = { ...report.summary, runs: plan.its.filter((i) => i.kind).length };
    if (!failed.length) { check(`scenarios ${f}`, true, `pass ${report.summary.pass} · blocked ${report.summary.blocked} · pending ${report.summary.pending}`); return; }
    // the failing leaves on base, run by run: a failure is main's debt only when base fails it the same way (scenarioDebt)
    let baseReport = null;
    if (featuresWithLeaves('base').includes(f)) {
      const bp = leafItemsOf('base', f, new Set(failed));
      if (bp && !bp.problems) { baseReport = await runLeaves('base', f, bp); fs.writeFileSync(path.join(out, 'scenarios', `base-${f}.json`), JSON.stringify(baseReport, null, 1)); }
    }
    const { added, debt } = scenarioDebt(report, baseReport);
    if (debt.length) gaps.push(`scenarios ${f}: ${debt.length} leaf/leaves fail on main exactly as here (same width, language and assertion): ${debt.slice(0, 4).join(', ')}`);
    check(`scenarios ${f}`, !added.length, added.length ? `${added.length} new failure(s): ${added.slice(0, 3).map((a) => `${a.id} (${a.why.slice(0, 2).join('; ')})`).join(', ')}${baseReport ? '' : " — base has no report, so none can be main's debt"}` : `${debt.length} failing leaf/leaves fail on main exactly as here (${debt.slice(0, 4).join(', ')}); none new`);
  }));
  if (noLeaves.length && CLASSES.indexOf(ec.cls) >= 2) gaps.push(`${noLeaves.length} affected feature(s) have no executable leaves (features/<id>/scenarios.json): ${noLeaves.slice(0, 6).join(', ')}. Behaviour there is covered by the walk only.`);
  mark('leaves');

  // ---------- 8. check-states, both sides ----------
  await stateDone;
  {
    for (const it of statePlan.compute) { const r = results.get(it.id); if (r?.ok) store.put('state', it.id, r); }
    const problems = (side) => {
      const n = {};
      for (const it of stateItems.filter((i) => i.side === side)) {
        const r = results.get(it.id);
        if (!r?.ok) { missingCheck('check-states', side, `${it.comp}/${it.variant}`, `${STATE_VW}`, r); continue; }
        for (const s of r.states) for (const p of s.problems || []) { const k = `${it.comp}/${it.variant}/${s.name}: (${p.check}) ${String(p.detail).replace(/\d+(\.\d+)?px/g, 'Npx')}`; n[k] = (n[k] || 0) + 1; }
      }
      return n;
    };
    const pb = problems('base'), pc = problems('cand');
    const added = Object.keys(pc).filter((k) => pc[k] > (pb[k] || 0)), fixed = Object.keys(pb).filter((k) => !pc[k]), debt = Object.keys(pc).length - added.length;
    mech.states = { added, fixed: fixed.length, debt, reused: statePlan.reuse.length, computed: statePlan.compute.length };
    check('check-states (no new problem)', !added.length, added.length ? `${added.length} new: ${added.slice(0, 3).join(' | ')}` : `${debt} problem(s) already on main${fixed.length ? `, ${fixed.length} fixed` : ''}`);
    if (debt) gaps.push(`check-states: ${debt} problem(s) already on main are not this change's`);
  }
  mark('states');

  // ---------- npm test ----------
  {
    const r = await npmTest;
    if (r.machine) block(`npm test: ${r.machine}`);
    else check('npm test', r.code === 0, r.reused ? `${r.counts} (reused: same tree)` : r.code === 0 ? r.counts || r.tail : `${r.counts}${r.failed?.length ? ` — failing: ${r.failed.slice(0, 4).join(' | ')}` : ''} (npm-test.log)`);
    if (!r.reused && r.code === 0) store.put('npm-test', testId, r);
  }
  mark('npmtest');
  await sched.drained();

  // ---------- the evidence, kept: this base's index, and a sweep of what nothing needs ----------
  if (bundleGap.size) gaps.push(`identityInputs gives bundle units without their content hashes (bundle.unitHashes, bundle.setupHash) for ${bundleGap.size} screen(s): their identity hashes the whole bundle`);
  const used = {};
  for (const [k, ids] of store.used) used[k] = [...ids];
  const baseIds = {};
  for (const it of [...items, ...stateItems]) if (it.side === 'base') (baseIds[it.kind] ||= []).push(it.id);
  store.indexBase(mech.base, baseIds);
  const keepBases = git(['rev-list', '--first-parent', '-n', '10', mech.base], root).out.split(/\s+/).filter(Boolean);
  const swept = store.sweep(keepBases);
  const st = sched.stats;
  mech.evidence = { ...mech.evidence, byKind: tally, hits: store.hits, misses: store.misses, swept, scheduler: { workers: WORKERS, lowest: st.lowest, retried: st.retried, machineTwice: st.machineTwice, busy: Object.fromEntries(Object.entries(st.byKind).map(([k, v]) => [k, { n: v.n, s: secs(v.ms) }])) } };
  const span = (a, b) => (at[a] && at[b] ? secs(at[b] - at[a]) : null);
  // Wall-clock phases, in order (the scheduler's busy time per kind is in evidence.scheduler.busy): worktrees and atlases; the
  // repository checks, servers and the evidence plan; the visits (state checks and npm test run beside them); comparing shots; the
  // confirming visits; the pair images; the visit checks; the leaves; what was left of the state checks; what was left of npm test.
  mech.timings = { worktrees: secs(at.setup - t0), prepare: span('setup', 'submit'), visits: span('submit', 'visits'), compare: span('visits', 'compare'), confirm: span('compare', 'confirm'), pairs: span('confirm', 'pairs'), checks: span('pairs', 'checks'), leaves: span('checks', 'leaves'), statesTail: span('leaves', 'states'), npmTestTail: span('states', 'npmtest') };
  return finish();
}
