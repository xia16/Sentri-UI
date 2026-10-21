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
import { removeWorktree } from './worktree-remove.mjs';
import { CLASSES, classOfFiles, DS_FEATURE, componentPage, componentPagesOf, componentsTouched, idPath, screensOf, pageOf, pageAssets, sharedFiles, coverageLost, effectiveClass, classifyScreens, touchesSystem, touchesTools, budgetProblems, critiqueProblems, pageStyling, addedLines, scenarioDebt, isMotionFile, unheldMotion, heldOf, confirmLeaf, reusableLeaf, IN_PROGRESS, readInProgress, ownFeatures, scopeReach, componentScope, exportStamps, readLibrary, libraryProblems, newExportProblems, frozenFeatures, checksChinese } from './loop-rules.mjs';
import { bundleShape, bundleChange } from './bundle-graph.mjs';
// The analyser (gate-v2 §2): static and conservative, over both revisions. It says what each screen's and each leaf's evidence
// depends on; the reach is every screen and leaf whose evidence identity that makes differs between the two (gate-simplify.md X1).
import { identityInputs, leafInputs } from './static-reach.mjs';
import { EvidenceStore, identityOf, treeOf, blobsHash, codeHash, sha, canonical, reconcileInventory, planEvidence, inputsDigest, identityDiff } from './evidence.mjs';
import { createScheduler } from './scheduler.mjs';
import { WORKERS, LAUNCH_ARGS, machineErrorOf, classifyMachineError } from './machine.mjs';
import { BOUNDS } from './settle.mjs';
import { prepareVisit, captureShot, contextPool, VISIT_CODE, CLOCK, HEIGHT } from './visit.mjs';
import { pctDiff } from './png.mjs';
import { routeFonts } from './font-route.mjs';
import { auditSpacingPage } from './check-spacing.mjs';
import { auditHeadersPage, RUNS as HEADER_RUNS, dedupe as dedupeHeaders } from './check-headers.mjs';
import { auditLegibilityPage, legibilityWorse, count as legCount, failing as legFailing } from './check-legibility.mjs';
import { checkStatesHtml, VW as STATE_VW } from './check-states.mjs';
import { walkTree, leafEntryUrl } from './scenario-tree.mjs';
import { renderDef } from './atlas-screens.mjs';
import { leafRunner, leafRow, reportOf, leafContextPool } from './scenario-runner.mjs';

// The runs of a screen in the reach (gate-simplify.md S4): EN at 390 and 360, ZH at 360. ZH at the narrowest width is its worst case
// for fit; ZH at 390 showed nothing ZH 360 didn't. A component page is EN only (its Chinese cells are its own states).
export const RUNS = [{ width: 390, lang: 'en' }, { width: 360, lang: 'en' }, { width: 360, lang: 'zh' }];
const BUNDLE_JS = 'ux/design-system/components/bundle.js';
// What no page can load: the analyser's own rule (static-reach), repeated for the files an `unbounded` load folds in.
const NOT_LOADED = [/^docs\//, /^\.github\//, /^tests\//, /^\.claude\//, /^scripts\//, /^(?!ux\/).*\.md$/i];
const short = (s) => String(s || '?').slice(0, 7);
const secs = (ms) => Math.round(ms / 100) / 10;
const CHECKERS = { legibility: ['scripts/check-legibility.mjs'], spacing: ['scripts/check-spacing.mjs'], headers: ['scripts/check-headers.mjs'], states: ['scripts/check-states.mjs'], leaf: ['scripts/scenario-runner.mjs'] };

function git(args, cwd) { const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 256 << 20 }); return { code: r.status, out: r.stdout || '', err: r.stderr || '' }; }

// The gate's tools in a checkout that differ from a base commit (uncommitted edits included): what the gate judges with.
export const TOOL_PATHS = ['scripts', 'docs/design-workflow', 'package.json'];
export const toolsDiffer = (root, base) => git(['diff', '--name-only', base, '--', ...TOOL_PATHS], root).out.trim().split(/\r?\n/).filter(Boolean);

export async function evaluate(opts) {
  const { root, out, mode = 'normal', scope = [], audit = false, keep = false, log = console.log, env = process.env } = opts;
  const t0 = Date.now(), at = {};
  const mark = (k) => { at[k] = Date.now(); };
  const checks = [], gaps = [], blocked = [];
  const check = (name, ok, detail = '') => { checks.push({ check: name, result: ok === null ? 'skipped' : ok ? 'pass' : 'fail', detail }); log((ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL').padEnd(5), name, detail ? '— ' + String(detail).split('\n')[0] : ''); };
  const block = (why) => { blocked.push(why); log('BLOCK', why); };
  const mech = { outcome: null, pass: false, candidate: '', base: '', ref: opts.ref || opts.candidate, mode, scope, class: {}, checks, gaps, blocked, screens: null, pairs: [], inventory: null, evidence: null, timings: {} };
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
  {
    // gate.mjs runs itself from a worktree of the base when its checkout's tools differ; this is the backstop for a base that moved
    // while it started
    const stale = opts.ownTools ? [] : toolsDiffer(root, mech.base); // --try runs this checkout's tools on purpose
    if (opts.ownTools) mech.tryRun = true;
    if (stale.length) { block(`the gate runs the base's own tools: this checkout's ${stale.slice(0, 3).join(', ')} differ from ${short(mech.base)} (the base moved while the gate started: run it again)`); return finish(); }
  }
  const contains = git(['merge-base', '--is-ancestor', mech.base, mech.candidate], root).code === 0;
  check('candidate contains the base', contains, contains ? short(mech.base) : 'merge main forward first: node scripts/merge-main.mjs (R10, R12)');
  if (!contains) return finish();
  const files = git(['diff', '--name-only', '--no-renames', mech.base, mech.candidate], root).out.split(/\r?\n/).filter(Boolean);
  mech.files = files;

  // ---------- the two sides: worktrees, trees, atlases ----------
  const wtRoot = path.join(os.tmpdir(), `sg-${process.pid.toString(36)}${Date.now().toString(36).slice(-4)}`);
  const S = { base: { sha: mech.base, dir: path.join(wtRoot, 'base') }, cand: { sha: mech.candidate, dir: path.join(wtRoot, 'cand') } };
  mech.worktrees = { base: S.base.dir, cand: S.cand.dir };
  cleanups.push(() => { if (keep) return; for (const k of ['base', 'cand']) removeWorktree(S[k].dir, { cwd: root }); try { fs.rmSync(wtRoot, { recursive: true, force: true, maxRetries: 5 }); } catch {} });
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
    s.dsFiles = Object.freeze(s.runtime.filter((f) => /^(atlas|ux\/design-system|ux\/laws|vendor|review)\//.test(f)));
    s.fontsRoot = s.dir;
  }
  // Shared files from the base checkout: each atlas screen's page and what that page loads (the class and the queue use them).
  const assets = {};
  for (const p of new Set(S.base.screens.map((x) => pageOf(x.url)))) { const f = path.join(S.base.dir, p); assets[p] = fs.existsSync(f) ? pageAssets(fs.readFileSync(f, 'utf8'), p).filter((a) => fs.existsSync(path.join(S.base.dir, a))) : []; }
  const shared = sharedFiles(S.base.screens, assets);
  const touched = touchesSystem(files, shared);
  mech.shared = { files: Object.keys(shared).length, touched: Object.fromEntries(touched.map((f) => [f, shared[f] || []])) };

  // each side as the analyser reads it (identityInputs, leafInputs): its checkout, its atlas, and its commit
  for (const k of ['base', 'cand']) S[k].side = { dir: S[k].dir, atlas: S[k].atlas, rev: S[k].sha };
  const allIds = [...S.base.screens, ...S.base.ds, ...S.cand.screens, ...S.cand.ds].map((x) => x.id);
  const total = new Set(allIds).size;
  // The reach (gate-simplify.md X1) is filled once the identities are known, under "plan the evidence" below.
  const reachIds = new Set();
  const inReach = (x) => reachIds.has(x.id);
  // The class is the gate's, from the change itself (gate-simplify.md X6): shared when it touches the shared system, behaviour when
  // it changes a script a page can run, copy when it changes only the strings, presentation otherwise; then raised by what moved.
  const fileClass = classOfFiles(files);
  const sharedByFiles = touched.length > 0;
  const byFiles = effectiveClass({ declared: fileClass, files, diffs: [], scope, shared });
  mech.class = { effective: byFiles.cls, why: byFiles.why };
  log(`class: ${byFiles.cls}${byFiles.why.length ? ` (${byFiles.why.join('; ')})` : ''}`);
  // A shared-component change is held to no worse than main on legibility (README, Legibility gate); otherwise strict while the
  // README says so. Known before anything is shot, so the visits know whether base needs its legibility audit.
  // English first (owner, 2026-10-21): ZH runs and ZH leaves only for frozen features
  const zhFrozen = new Set([...frozenFeatures(S.base.atlas), ...frozenFeatures(S.cand.atlas)]);
  // A feature that freezes in this change gets its Chinese shots now (2026-10-21): approvals render nothing, so no identity changes
  const wasFrozen = frozenFeatures(S.base.atlas);
  const newlyFrozen = [...frozenFeatures(S.cand.atlas)].filter((f) => !wasFrozen.has(f));
  mech.zh = { frozen: [...zhFrozen].sort(), ...(newlyFrozen.length ? { newlyFrozen } : {}) };
  const strictLeg = !sharedByFiles && /^Legibility gate: strict\s*$/m.test(fs.readFileSync(path.join(S.cand.dir, 'docs/design-workflow/README.md'), 'utf8'));
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
  const pwVersion = (() => { try { return JSON.parse(fs.readFileSync(path.join(pwPath, 'package.json'), 'utf8')).version; } catch { return '?'; } })();
  const code = Object.fromEntries(Object.entries(CHECKERS).map(([k, f]) => [k, codeHash(root, f)]));
  code.visit = codeHash(root, VISIT_CODE);
  const blob = (side, f) => S[side].tree.get(f) || 'missing';
  const harness = (side) => ({ bare: blob(side, 'ux/system/atlas-bare.js'), server: blob(side, 'scripts/serve-ux.cjs'), fonts: blobsHash(S[side].tree, S[side].runtime.filter((f) => f.startsWith('vendor/fonts/'))) });
  const bundleGap = new Set();
  const inputsMemo = new Map(), iiOf = new Map();
  // atlas/atlas.json reaches every page through the bare harness, which hands a page only what renders of the screens on it (the
  // harness's rendered(); renderDef in scripts/atlas-screens.mjs). So an identity whose closure holds atlas.json hashes that, per page
  // in the closure, instead of the file's blob: a notes edit, an approval or a regenerated atlas re-shoots nothing (#192, 2026-10-17:
  // every forward merge re-shot every screen). A closure with a load the analyser can't bound that could fetch JSON keeps the file.
  const ATLAS = 'atlas/atlas.json';
  const atlasDigest = (side, ii) => {
    if (!ii?.files?.includes(ATLAS) || (ii.unbounded || []).some((u) => ['any', 'other'].includes(u.type || 'any'))) return { ii, atlas: null };
    const s = S[side];
    if (!s.onPage) { s.onPage = new Map(); for (const x of s.screens) { const p = pageOf(x.url); if (!s.onPage.has(p)) s.onPage.set(p, []); s.onPage.get(p).push(renderDef(x)); } }
    const pages = ii.files.filter((f) => /\.html?$/i.test(f)).sort();
    return { ii: { ...ii, files: ii.files.filter((f) => f !== ATLAS) }, atlas: sha(canonical(pages.map((p) => [p, s.onPage.get(p) || []]))) };
  };
  // A screen's share of its identity: what the analyser says it depends on, hashed by blob on its side.
  const screenInputs = (side, id) => {
    const k = side + ' ' + id;
    if (inputsMemo.has(k)) return inputsMemo.get(k);
    const tree = S[side].tree;
    let ii = null;
    try { ii = identityInputs(S[side].side, id); iiOf.set(side + ' ' + id, ii); } catch (e) { gaps.push(`identityInputs(${side}, ${id}) threw (${e.message}): its identity hashes every page-loadable file`); }
    const ds = componentPage(id);
    // a feature screen's definition is what renders of its atlas entry (renderDef): its notes and status draw nothing
    const def = ds ? S[side].ds.find((x) => x.id === id) : renderDef(S[side].screens.find((x) => x.id === id));
    let v;
    // A component page (ds:<Name>/<variant>) is the atlas drawing a component's specimen: the atlas's code, the design system, the
    // strings it reads and the fonts. Of atlas.json it reads only the components (stateGridAt draws the variant's own file), so
    // the screens' entries are not hashed: a notes edit, which rewrites atlas.json, must not re-shoot every component page.
    // Anything else the analyser can't name: every page-loadable file.
    if (!ii && ds) v = { files: blobsHash(tree, S[side].dsFiles.filter((f) => f !== 'atlas/atlas.json')), components: sha(canonical(S[side].atlas.platforms.map((p) => p.components || []))), bundle: blob(side, BUNDLE_JS), screen: def, why: 'a component page' };
    else if (!ii) v = { files: blobsHash(tree, S[side].runtime), bundle: blob(side, BUNDLE_JS), screen: def, why: 'no identity inputs: every page-loadable file' };
    else {
      // the analyser's inputs, hashed by blob (inputsDigest: the bundle once, by the units this screen can run); the atlas by what renders
      const a = atlasDigest(side, ii);
      const d = inputsDigest(a.ii, tree, S[side].runtime);
      if (d.gap) bundleGap.add(id);
      v = { ...d.digest, ...(a.atlas ? { atlas: a.atlas } : {}), screen: ii.screen || def };
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
    // features with leaves on either side: a leaf may move into a feature that had none on base
    const leavesIn = (dir) => (fs.existsSync(path.join(dir, 'features')) ? fs.readdirSync(path.join(dir, 'features')) : []).filter((f) => fs.existsSync(path.join(dir, 'features', f, 'scenarios.json')));
    const withLeaves = [...new Set([...leavesIn(S.base.dir), ...leavesIn(S.cand.dir)])];
    const coverage = (dir) => ({ runner: fs.existsSync(path.join(dir, 'scripts/run-scenarios.mjs')), specs: Object.fromEntries(withLeaves.map((f) => { try { return [f, JSON.parse(fs.readFileSync(path.join(dir, 'features', f, 'scenarios.json'), 'utf8'))]; } catch { return [f, null]; } })) });
    const lost = coverageLost(coverage(S.base.dir), coverage(S.cand.dir));
    check('behaviour coverage kept', !lost.length, lost.length ? `removes behaviour coverage (${lost.slice(0, 3).join('; ')}): do it in its own workflow PR` : `${withLeaves.length} feature(s) with leaves`);
  }
  {
    // P2: visual declarations belong to the design system. Read from the diff, so it holds whether or not a screen moves.
    const ps = pageStyling(addedLines(git(['diff', '-U0', mech.base, mech.candidate, '--', 'ux'], root).out));
    mech.pageStyling = ps;
    check('design-system components only', !ps.length, ps.length ? `${ps.length} visual declaration(s) added outside ux/design-system (${ps.slice(0, 3).map((p) => p.file.split('/').pop() + ' ' + p.prop).join(', ')}): use a SentriUI component, or build the part in the design system (P2, briefs/build.md §3)` : '');
  }
  // the bundle as the graph reads it, each side (the library check and the scoped reach use it); null when it won't parse
  for (const k of ['base', 'cand']) {
    try { S[k].bundleSrc = fs.readFileSync(path.join(S[k].dir, BUNDLE_JS), 'utf8'); } catch { S[k].bundleSrc = ''; }
    try { S[k].shape = bundleShape(S[k].bundleSrc); } catch { S[k].shape = null; }
  }
  {
    // Library organisation (owner, 2026-10-20): every component folder is in _groups.json or retired in its gate.json, and a new
    // SentriUI export belongs to a grouped component. A folder main already leaves out is main's. A change that touches a component
    // also needs the judge's library fit (gate.md §5), which --verdict asks for.
    const libs = { base: readLibrary(S.base.dir), cand: readLibrary(S.cand.dir) };
    const was = new Set(libraryProblems(libs.base)), now = libraryProblems(libs.cand);
    const lp = now.filter((p) => !was.has(p));
    if (S.base.shape && S.cand.shape) lp.push(...newExportProblems({ before: new Set(exportStamps(S.base.shape).keys()), after: exportStamps(S.cand.shape), library: libs.cand }));
    else if (files.includes(BUNDLE_JS)) gaps.push('the bundle does not parse on one side: new exports are not checked against the groups');
    mech.library = { required: files.some((f) => f.startsWith('ux/design-system/components/')), problems: lp };
    check('library organisation (every part in a group)', !lp.length, lp.length ? `${lp.length}: ${lp.slice(0, 3).join(' | ')}` : '');
    const debt = now.filter((p) => was.has(p));
    if (debt.length) gaps.push(`library: ${debt.length} folder(s) already outside every group on main (${debt.slice(0, 3).join('; ')})`);
  }
  // Fail fast (gate-simplify.md S1): a rule the diff decides has failed, so nothing a browser could show changes the outcome. The
  // gate stops before it starts one: such failures used to arrive after full runs of 3 to 15 minutes (2026-10-17/18).
  if (checks.some((c) => c.result === 'fail')) {
    mech.stoppedEarly = 'a check the diff decides failed: no browser work ran (fix it and gate again)';
    log(`STOP  ${mech.stoppedEarly}`);
    return finish();
  }

  // ---------- the browser ----------
  const sched = createScheduler({ playwright, log });
  cleanups.push(() => { sched.close(); });
  const browser = await sched.browser();
  const pool = contextPool();
  cleanups.push(() => { pool.close(); });
  const render = { playwright: pwVersion, browser: browser.version(), platform: process.platform, launch: LAUNCH_ARGS, clock: CLOCK, height: HEIGHT, dsf: 1, bounds: BOUNDS };

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
  // The reach (gate-simplify.md X1) is what the evidence identities say the change can alter: every screen (and component page)
  // whose shot identity differs between base and candidate, and every screen only one side has. A screen with the same identity on
  // both sides shares one shot, so its diff is 0 by definition: shooting it proved nothing, and the tripwire and "every screen" for
  // CSS that did were removed. Identity completeness is the guarantee (gate-v2.md §3, the stylesheet syntax the analyser checks), and
  // `--audit` checks it off the merge path. The scope is a declaration only (X7): it brings in no screen of its own. A screen in the
  // reach is shot at RUNS (EN 390 and 360, and ZH 360 for a frozen feature's screen; a
  // component page in EN only) and gets its visit checks; nothing else is shot.
  const sideList = (k) => [...S[k].screens, ...S[k].ds];
  const idAt = (side, x) => shotId(side, x, 390, 'en', componentPage(x.id) ? 'grid' : 'screen');
  const identityChanged = new Set();
  if (audit) { for (const x of sideList('base')) reachIds.add(x.id); mech.reach = { screens: reachIds.size, of: total, why: ['audit: every screen of the base'] }; }
  else {
    const d = identityDiff({ base: sideList('base'), cand: sideList('cand'), idOf: idAt });
    for (const id of [...d.changed, ...d.added, ...d.removed]) reachIds.add(id);
    for (const id of d.changed) identityChanged.add(id);
    mech.reach = { screens: reachIds.size, of: total, changed: d.changed.length, added: d.added.length, removed: d.removed.length };
  }
  // The scoped reach of a shared change (owner, 2026-10-20; gate.md §4). Of what the identities reach, a shared change keeps: every
  // screen of the PR's own features (ownFeatures), the component pages of the parts it touches or calls (a page whose variant calls
  // none of the changed exports is left out only when the bundle's JS is the one design-system input that changed), and the screens
  // of the in-progress features (features/_in-progress.json, read from the base so a change can't set its own scope), which are
  // propagation screens: judged only on whether the shared part arrived and renders correctly. Every other screen is out of scope
  // and not shot. The identities themselves are untouched. A change that isn't shared, a refactor (identical is checked everywhere,
  // with no judge to pay for it) and an audit keep the whole reach.
  let scoped = null;
  if (!audit && sharedByFiles && mode !== 'refactor') {
    let inProgress = null;
    try { inProgress = readInProgress(fs.readFileSync(path.join(S.base.dir, IN_PROGRESS), 'utf8')); } catch {}
    if (!inProgress) gaps.push(`${IN_PROGRESS} is missing or unreadable on the base: this shared change is checked in full on every feature it reaches`);
    else {
      const users = new Map();
      for (const side of ['base', 'cand']) for (const x of S[side].screens) for (const f of iiOf.get(`${side} ${x.id}`)?.files || []) { if (!users.has(f)) users.set(f, new Set()); users.get(f).add(x.feature); }
      const own = ownFeatures({ files, scope, usersOf: (f) => users.get(f) });
      const bc = files.includes(BUNDLE_JS) ? bundleChange(S.base.bundleSrc, S.cand.bundleSrc) : null;
      const readVariant = (c, v) => { for (const k of ['cand', 'base']) { try { return fs.readFileSync(path.join(S[k].dir, `ux/design-system/components/${c}/variants/${v}.html`), 'utf8'); } catch {} } return null; };
      const { touched, keepPage } = componentScope({ files, change: bc, stamps: exportStamps(S.cand.shape), readVariant });
      const featureOf = new Map([...S.base.screens, ...S.cand.screens].map((x) => [x.id, x.feature]));
      const sc = scopeReach({ reach: reachIds, featureOf: (id) => featureOf.get(id), own, inProgress, keepPage });
      mech.reach.identity = reachIds.size;
      reachIds.clear();
      for (const id of sc.keep) reachIds.add(id);
      for (const id of [...identityChanged]) if (!reachIds.has(id)) identityChanged.delete(id);
      mech.reach.screens = reachIds.size;
      scoped = { own, inProgress, propagation: sc.propagation, touched };
      mech.ownFeatures = own;
      mech.inProgress = inProgress;
      mech.outOfScope = sc.outOfScope;
      // what each propagation screen calls of the touched exports (its page closure's SentriUI calls); all when it uses the namespace whole
      mech.propagation = [...sc.propagation].sort().map((id) => {
        const ii = iiOf.get(`cand ${id}`) || iiOf.get(`base ${id}`), all = !ii || ii.bundle?.all;
        return { screen: id, feature: featureOf.get(id), uses: all ? [...touched].sort() : (ii.bundle?.exports || []).filter((e) => touched.has(e)), ...(all ? { all: true } : {}) };
      });
      log(`scope: own ${own.join(', ') || '(none)'}; propagation only on ${inProgress.join(', ')} (${sc.propagation.size} screen(s)); ${sc.outOfScope.screens} screens in ${sc.outOfScope.features.length} features not checked: not in progress${sc.outOfScope.componentPages ? `; ${sc.outOfScope.componentPages} component page(s) of parts the change doesn't call` : ''}`);
    }
  }
  if (!audit) for (const x of S.cand.screens) if (newlyFrozen.includes(x.feature)) reachIds.add(x.id);
  log(`reach: ${reachIds.size} of ${total} screens${mech.reach.changed !== undefined ? ` (${mech.reach.changed} whose identity changed, ${mech.reach.added} added, ${mech.reach.removed} removed)` : ` (${mech.reach.why[0]})`}`);
  const runsOf = (x) => (inReach(x) ? RUNS.filter((r) => (!componentPage(x.id) || r.lang === 'en') && (r.lang === 'en' || checksChinese(x.feature, zhFrozen))).map(({ width, lang }) => ({ width, lang })) : []);
  const visitChecks = (side, x, width, lang) => {
    if (audit || !inReach(x) || componentPage(x.id)) return [];
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
  for (const side of audit ? ['base'] : ['base', 'cand']) for (const x of [...S[side].screens, ...S[side].ds]) for (const { width, lang } of runsOf(x)) {
    const vmode = componentPage(x.id) ? 'grid' : 'screen';
    items.push({ kind: 'shot', id: shotId(side, x, width, lang, vmode), side, x, width, lang, vmode });
    for (const c of visitChecks(side, x, width, lang)) items.push({ kind: `check-${c.name}`, id: checkId(side, x, width, lang, c.name, c.params), side, x, width, lang, name: c.name, params: c.params, vmode });
  }
  // an audit draws every run afresh, whatever the store holds, and compares (below)
  const plan = audit ? { reuse: [], compute: items } : plan_(items);
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
      const vis = await prepareVisit(b, { url: urlOf(v.side, v.x), mode: v.vmode, width: v.width, lang: v.lang, fontsRoot: S[v.side].fontsRoot, pool });
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
          try { got.checks[it.id] = { ok: true, result: await auditFor[it.name](vis.page, it) }; } catch (e) { const msg = String(e.message || e).split('\n')[0]; if (classifyMachineError(msg)) { vis.machine = classifyMachineError(msg); return { machine: vis.machine, error: msg }; } got.checks[it.id] = { ok: false, error: msg }; }
        }
        if (vis.netErrors.length) { vis.machine = 'net-error'; return { machine: 'net-error', error: vis.netErrors[0] }; }
        return got;
      } finally { await vis.close(); }
    },
  });

  // ---------- state checks: every variant file on each side ----------
  const variantFiles = (side) => [...S[side].tree.keys()].filter((f) => /^ux\/design-system\/components\/[^/]+\/variants\/[^/]+\.html$/.test(f)).sort();
  const dsInputs = (side) => ({ tokens: blob(side, 'ux/design-system/tokens.css'), css: blob(side, 'ux/design-system/components/bundle.css'), js: blob(side, BUNDLE_JS), fonts: harness(side).fonts });
  const stateItems = [];
  for (const side of audit ? [] : ['base', 'cand']) for (const f of variantFiles(side)) {
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
  const npmTest = audit ? Promise.resolve({ skipped: true }) : testHad ? Promise.resolve({ ...testHad, reused: true }) : sched.run({
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
  // Each visit's results are filed under its items' identities as it finishes (design results stored at once, so a gate that dies
  // keeps what it finished); progress is printed every 250 visits.
  let filed = 0;
  const audited = { compared: 0, stored: 0, differ: [] };
  const fileVisit = (v, r) => {
    if (++filed % 250 === 0) log(`visits: ${filed} of ${visits.size} (${secs(Date.now() - at.submit)}s, ${sched.limit} at once)`);
    const sk = `${v.side}|${v.x.id}|${v.width}|${v.lang}`, shotItem = shotOf.get(sk);
    if (r.machine || r.unstable) { for (const it of v.items) results.set(it.id, { machine: r.machine, unstable: r.unstable, error: r.error }); if (!v.items.includes(shotItem)) results.set(`visit ${sk}`, { machine: r.machine, unstable: r.unstable, error: r.error }); return; }
    if (r.error && !r.shot) { for (const it of v.items) results.set(it.id, { ok: false, error: r.error }); return; }
    if (audit) {
      // the fresh shot against the stored one of the same identity; both kept for a look when they differ
      results.set(shotItem.id, { ok: true });
      const f = store.file('shot', shotItem.id, 'png'), run = `${v.lang}-${v.width}`;
      if (!fs.existsSync(f)) { audited.stored++; store.put('shot', shotItem.id, { ok: true, screen: v.x.id, feature: v.x.feature, width: v.width, lang: v.lang, text: r.shot.text }, { png: r.shot.png }); return; }
      audited.compared++;
      const stored = fs.readFileSync(f), fresh = Buffer.from(r.shot.png);
      if (stored.equals(fresh)) return;
      const dir = path.join(out, 'audit', idPath(v.x.id));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${run}-stored.png`), stored);
      fs.writeFileSync(path.join(dir, `${run}-fresh.png`), fresh);
      audited.differ.push({ screen: v.x.id, feature: v.x.feature, run, identity: shotItem.id, pct: pctDiff(stored, fresh) });
      return;
    }
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
  };
  const visitDone = Promise.all([...visits.values()].map((v) => sched.run(visitTask(v)).then((r) => fileVisit(v, r))));
  const stateDone = Promise.all(statePlan.compute.map((it) => sched.run(stateTask(it)).then((r) => results.set(it.id, r))));
  await visitDone;
  mark('visits');
  for (const [k, r] of results) if (k.startsWith('visit ') && r.unstable) block(`${k.slice(6).replace(/\|/g, ' ')}: unstable: ${r.unstable}`);
  // ---------- --audit: the identities, checked off the merge path (gate-simplify.md K12) ----------
  // Every run of every screen on the base, drawn afresh and compared with the stored shot of the same identity. A difference is an
  // identity that misses an input (something changed that the identity doesn't hash) or a screen that doesn't draw the same twice.
  if (audit) {
    for (const it of items) {
      const r = results.get(it.id);
      if (r?.machine || r?.unstable) block(`${it.x.id} ${it.lang}-${it.width}: ${r.machine ? `machine error twice (${r.machine})` : `unstable: ${r.unstable}`}`);
      else if (!r?.ok) gaps.push(`${it.x.id} ${it.lang}-${it.width}: did not render (${r?.error || 'no evidence'})`);
    }
    mech.audit = { runs: items.length, compared: audited.compared, storedNew: audited.stored, differ: audited.differ };
    check('audit: every stored shot draws the same again', !audited.differ.length, audited.differ.length
      ? `${audited.differ.length} run(s) drew differently from the stored shot of the same identity, an identity that misses an input or a screen that doesn't draw the same twice (${audited.differ.slice(0, 3).map((d) => `${d.screen} ${d.run}`).join(', ')}); both images are in ${path.join(out, 'audit')}`
      : `${audited.compared} run(s) compared, ${audited.stored} with no stored shot yet (now stored)`);
    mech.timings = { worktrees: secs(at.setup - t0), prepare: secs(at.submit - at.setup), visits: secs(at.visits - at.submit) };
    return finish();
  }
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
  // a propagation screen that moved but calls none of the touched exports draws the part some other way: likely a local copy
  if (scoped?.touched.size) { const movedIds = new Set([...screens.diff, ...screens.new].map((s) => s.id)); for (const p of mech.propagation || []) if (!p.uses.length && movedIds.has(p.screen)) p.notUsingShared = true; }
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
      const vis = await prepareVisit(b, { url: urlOf(c.side, x), mode: componentPage(x.id) ? 'grid' : 'screen', width: c.width, lang: c.lang, fontsRoot: S[c.side].fontsRoot, pool });
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
  for (const s of moved) for (const { width, lang } of RUNS) {
    const k = `${s.id} ${lang}-${width}`, b = baseAt.get(k), c = candAt.get(k);
    const noZh = (x) => lang === 'zh' && x?.ok && x.zh === 'ignored';
    const sides = [b, c].filter((x) => x?.ok);
    if (!sides.length) continue;
    if (sides.every(noZh) && !(pct[k] > 0 && !(pct[`${s.id} en-${width}`] > 0))) { zhIgnored.add(s.id); continue; }
    if (noZh(c) && b?.ok && !noZh(b)) zhLost.add(s.id);
    const kind = b?.ok && c?.ok ? 'changed' : c?.ok ? 'new' : 'gone';
    const file = path.join(out, 'pairs', idPath(s.id), `${lang}-${width}.png`);
    // image: each side's shot by its bytes, so a judgement carries to a pair that shows the same two pictures even when an input
    // nothing renders from changed both shots' identities (carryJudgements, G17)
    const imageOf = (x) => { try { return x?.ok && x.png ? sha(fs.readFileSync(x.png)) : null; } catch { return null; } };
    mech.pairs.push({ screen: s.id, feature: s.feature, lang, width, kind, ...(scoped?.propagation.has(s.id) ? { propagation: true } : {}), pct: kind === 'changed' ? round4(pct[k] ?? 0) : null, file: path.relative(out, file).replace(/\\/g, '/'), identity: { base: b?.ok ? b.id : null, cand: c?.ok ? c.id : null }, image: { base: imageOf(b), cand: imageOf(c) } });
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
  const ec = effectiveClass({ declared: fileClass, files, diffs: moved, scope, shared });
  mech.class = { effective: ec.cls, why: ec.why };
  // P2, known reach: a change that touches no shared file moves only the scope's screens. A change to the shared system is judged on
  // every feature it moves instead.
  if (!sharedByFiles && mode !== 'refactor') {
    const outside = ec.outside || [];
    check('known reach: only SCOPE moved (P2)', !outside.length, outside.length ? `scope ${scope.join(', ') || '(none)'}, but it moves ${outside.length} screen(s) of ${[...new Set(outside.map((d) => d.feature))].join(', ')} (${outside.slice(0, 3).map((d) => d.id).join(', ')}): give your part its own rule or token, or name those features in --scope` : '');
  }
  if (ec.cls !== byFiles.cls) log(`class: ${byFiles.cls} → ${ec.cls} (${ec.why.join('; ')})`);
  // G15 (owner, 2026-10-18): a change that alters what a screen runs (a page script, a shared helper, a bundle unit) but leaves it
  // drawn the same needs a walk, refactors included. One screen per page is named; the verdict walks each one named.
  {
    const scripts = files.filter((f) => /\.(m?js|cjs)$/i.test(f) && S.cand.runtime.includes(f));
    const same = new Set((screens.same || []).map((s) => s.id));
    const perPage = new Map();
    for (const id of [...identityChanged].filter((i) => same.has(i) && !componentPage(i)).sort()) {
      const ii = iiOf.get('cand ' + id), x = S.cand.screens.find((s) => s.id === id);
      if (!ii || !x || !scripts.some((f) => ii.files.includes(f))) continue;
      if (!perPage.has(pageOf(x.url))) perPage.set(pageOf(x.url), id);
    }
    mech.walkNeed = [...perPage.values()];
    // what each named screen runs on the candidate, so a walk of it carries across a main move that leaves those inputs alone
    // (carryJudgements): the screen's inputs by blob, the harness that serves it and the visit code
    mech.walkIdentity = Object.fromEntries(mech.walkNeed.map((id) => [id, sha(canonical({ screen: screenInputs('cand', id), harness: harness('cand'), code: code.visit }))]));
    if (mech.walkNeed.length) log(`walk: ${mech.walkNeed.length} screen(s) run changed code and draw the same (G15): ${mech.walkNeed.slice(0, 5).join(', ')}${mech.walkNeed.length > 5 ? ' …' : ''}`);
  }
  if (mode === 'refactor') check('refactor: every screen identical', !moved.length, moved.map((s) => s.id).slice(0, 5).join(', '));
  const tools = touchesTools(files);
  const readCand = (p) => { const f = path.join(S.cand.dir, p); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; };
  if (moved.length) {
    // a propagation screen is not redesigned: its feature's budget and critique are not asked for
    const feats = [...screens.diff, ...screens.new].filter((s) => !scoped?.propagation.has(s.id)).map((s) => s.feature).filter((f) => f !== DS_FEATURE);
    const bp = budgetProblems(feats, readCand);
    check('information budget before layout', !bp.length, bp.length ? bp.join('; ') + ' (P3: write it first, briefs/build.md §2)' : '');
    const cp = critiqueProblems(feats, readCand);
    check('critique of the original before the change', !cp.length, cp.length ? cp.join('; ') + ' (P1, P4: keep, problems, parts and self-crit, briefs/build.md §1, §4)' : '');
    const proposed = files.includes('ux/design-system/components/_proposed.json') && /^\+\s*[\[{"]/m.test(git(['diff', '-U0', mech.base, mech.candidate, '--', 'ux/design-system/components/_proposed.json'], root).out);
    check('no workaround beside a component proposal', !proposed, proposed ? 'this change proposes a component and changes screens: build the component in the design system in this change (P2, briefs/build.md §3), never a workaround' : '');
  }
  // motion has a held frame (L25): run whether or not a screen moved, since a frozen atlas shows no motion change as a moved screen
  const motionFiles = files.filter(isMotionFile);
  if (motionFiles.length) {
    const read = (dir) => Object.fromEntries(motionFiles.map((f) => { const p = path.join(dir, f); return [f, fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '']; }));
    const unheld = unheldMotion({ base: read(S.base.dir), cand: read(S.cand.dir), held: heldOf(S.cand.atlas) });
    mech.unheldMotion = unheld;
    check('motion has a held frame (P4)', !unheld.length, unheld.length ? `${unheld.length} keyframe animation(s) no screen holds (${unheld.slice(0, 3).map((m) => `${m.name}, ${m.kind}`).join('; ')}): add a still render that shows the cue at its hold and name it in that screen's "holds" (atlas/SCHEMA.md)` : '');
  }
  if (tools.length && moved.length) check('workflow changes in their own PR', false, `this change moves ${moved.length} screen(s) and also edits the workflow or the gate's tools (${tools.slice(0, 3).join(', ')}): split it`);
  // There is no shared-component queue (gate-simplify.md X4): main requires a branch to be up to date before it merges, so a change
  // merges only on a gate against main as it is, and a re-gate after main moves reuses every result whose identity is unchanged.
  if (ec.cls === 'shared') {
    gaps.push(scoped
      ? `shared-component change: judged in full on ${scoped.own.join(', ') || 'no feature of its own'} and the component pages; ${scoped.propagation.size} screen(s) of ${scoped.inProgress.join(', ')} for propagation only (propagated or broken); ${mech.outOfScope.screens} screens in ${mech.outOfScope.features.length} features not checked: not in progress`
      : 'shared-component change: every changed screen on every feature it reaches is judged (split the judges by feature if needed)');
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
        // English first (#254): a ZH header run exists only for a frozen feature's screen
        const feat = (S.cand.screens.find((s) => s.id === id) || S.base.screens.find((s) => s.id === id))?.feature;
        for (const r of HEADER_RUNS.filter((h) => h.lang === 'en' || checksChinese(feat, zhFrozen))) {
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
      const vis = await prepareVisit(b, { url: urlOf(it.side, it.x), mode: 'atlas', width: 360, lang: 'en', fontsRoot: S[it.side].fontsRoot, pool });
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
  // The reach's leaves (gate-simplify.md X1): every leaf whose evidence identity differs between base and candidate at some run, and
  // every leaf base doesn't have.
  const specOf = (side, f) => { try { return JSON.parse(fs.readFileSync(path.join(S[side].dir, 'features', f, 'scenarios.json'), 'utf8')); } catch { return null; } };
  const featuresWithLeaves = (side) => (fs.existsSync(path.join(S[side].dir, 'features')) ? fs.readdirSync(path.join(S[side].dir, 'features')).filter((f) => fs.existsSync(path.join(S[side].dir, 'features', f, 'scenarios.json'))) : []);
  const leafPlan = [];
  const verbsOf = (side) => { try { return JSON.parse(fs.readFileSync(path.join(S[side].dir, 'ux/laws/strings.json'), 'utf8')).verbs || {}; } catch { return {}; } };
  // What a leaf's run can reach, hashed (gate-v2 §3): its entry page (the fixture's url) and every page its taps can navigate to,
  // with the bundle units that closure can run (leafInputs). Whatever it can't bound means the leaf hashes every page-loadable file.
  // one context pool per side (its server's origin), shared by every leaf run of that side
  const leafPools = { base: leafContextPool(), cand: leafContextPool() };
  cleanups.push(() => { leafPools.base.close(); leafPools.cand.close(); });
  const leafMemo = new Map();
  const leafReach = (side, l, D) => {
    const fx = l.state?.reset || {}, url = leafEntryUrl(fx, D), k = `${side} ${url} ${fx.screen || ''}`;
    if (leafMemo.has(k)) return leafMemo.get(k);
    let ii = null;
    try { ii = leafInputs(S[side].side, { url, screen: fx.screen }); } catch (e) { gaps.push(`leafInputs(${side}, ${url}) threw (${e.message}): its leaves hash every page-loadable file`); }
    const a = ii ? atlasDigest(side, ii) : null;
    const v = ii ? { ...inputsDigest(a.ii, S[side].tree, S[side].runtime).digest, ...(a.atlas ? { atlas: a.atlas } : {}) } : { files: blobsHash(S[side].tree, S[side].runtime), why: 'no leaf inputs: every page-loadable file' };
    leafMemo.set(k, v);
    return v;
  };
  const leafItemsOf = (side, f, only) => {
    const spec = specOf(side, f); if (!spec) return null;
    const { leaves, nodeCount, problems } = walkTree(spec);
    // an empty run list would run nothing and look like a pass (2026-10-21)
    const empty = (a) => Array.isArray(a) && !a.length;
    if (empty(spec.defaults?.langs) || empty(spec.defaults?.widths)) problems.push('defaults.langs or defaults.widths is empty: no leaf would run');
    for (const l of leaves) if (empty(l.node.langs) || empty(l.node.widths)) problems.push(`${l.node.id}: langs or widths is empty: the leaf would never run`);
    if (problems.length) return { problems };
    // S5: a leaf runs at the narrowest width its spec lists (360), unless the leaf names its own widths
    const D = spec.defaults || {}, langs = (D.langs || ['en']).filter((g) => g === 'en' || checksChinese(f, zhFrozen)), widths = [Math.min(...(D.widths || [390]))];
    const its = [];
    for (const l of leaves) {
      if (only && !only.has(l.node.id)) continue;
      if (l.node.type !== 'outcome' || l.node.status === 'pending') { its.push({ leaf: l, row: true }); continue; }
      const { children, ...node } = l.node;
      const walked = { node, state: l.state ? { reset: l.state.reset, clock: l.state.clock } : null, taps: l.taps, defaults: D };
      for (const lang of (l.node.langs || langs).filter((g) => g === 'en' || checksChinese(f, zhFrozen))) for (const width of l.node.widths || widths) its.push({ kind: 'leaf', leaf: l, lang, width, side, feature: f, id: identityOf('leaf', { walked, lang, width, reach: leafReach(side, l, D), strings: blob(side, 'ux/laws/strings.json'), render: { ...render, locale: lang === 'zh' ? 'zh-CN' : 'en-GB' }, runner: code.leaf }) });
    }
    return { its, nodeCount, D, langs, widths };
  };
  const runLeaves = async (side, f, plan) => {
    const runner = leafRunner({ base: S[side].url, defaults: plan.D, verbs: verbsOf(side), evidenceDir: path.join(out, 'leaves', side, f), pool: leafPools[side] });
    const planned = plan_(plan.its.filter((i) => i.kind));
    // an unconfirmed stored failure (written before L26) is run again, not reused
    // a stored machine error is never reused (2026-10-21: crashed leaves from a killed gate were stored before crashes were machine errors)
    const reuseOk = (r) => reusableLeaf(r) && !(r.run?.result === 'fail' && machineErrorOf(r.run.failures));
    const stale = planned.reuse.filter((x) => !reuseOk(x.record));
    for (const { item } of stale) { tally[item.kind].reused--; tally[item.kind].computed++; }
    const todo = { reuse: planned.reuse.filter((x) => reuseOk(x.record)), compute: [...planned.compute, ...stale.map((x) => x.item)] };
    for (const { item, record } of todo.reuse) results.set(item.id, { ...record.run, reused: true });
    const runOnce = (it, again = false) => sched.run({ kind: 'leaf', label: `${side} ${it.leaf.node.id} ${it.lang}-${it.width}${again ? ' (confirming)' : ''}`, priority: 2, run: async ({ browser: b }) => {
      let r;
      try { r = await runner(b, it.leaf, it.lang, it.width); } catch (e) { r = { lang: it.lang, width: it.width, result: 'fail', failures: [{ what: 'run', got: String(e?.message || e), tag: null }], skipped: [], notes: [], evidence: [] }; }
      // a machine error: every failure is one (a navigation timed out or refused), or a page's own file did not arrive (#190)
      const m = r.result === 'fail' ? machineErrorOf(r.failures) || ((r.loadFailures || []).length ? 'net-error' : null) : null;
      return m ? { machine: m, error: r.failures[0]?.got, run: r } : { run: r };
    } });
    const runIt = (it) => runOnce(it).then(async (x) => {
      if (x.machine) { results.set(it.id, { ...x.run, machine: x.machine }); return; }
      if (x.error) { results.set(it.id, { lang: it.lang, width: it.width, result: 'fail', failures: [{ what: 'run', got: x.error, tag: null }], skipped: [], notes: [], evidence: [] }); return; }
      results.set(it.id, x.run);
      if (x.run.result !== 'fail') { store.put('leaf', it.id, { run: x.run }); return; } // a pass: the same identity gives the same result
      // a fresh failure is a design result only once it repeats (L26): one confirming run on the same identity
      const c = confirmLeaf(x, await runOnce(it, true));
      if (c.store) store.put('leaf', it.id, { run: x.run, confirmed: true });
      if (c.unstable) block(`scenarios ${f}: ${it.leaf.node.id} ${side} ${it.lang}-${it.width} failed, then ${c.why} on the same identity: an unstable leaf, not a design result (fix the leaf or the page's race)`);
    });
    // X8: another language only where its start renders it. The runner checks that once a leaf's start is set up (its reset
    // fixture: page, preset, fixture taps); one run per start and language goes first, and when it finds no rendering, the other
    // runs from that start are blocked the same way without running. A blocked run never passes, so nothing is let through.
    const startOf = (it) => `${it.lang} ${it.width} ${canonical(it.leaf.state?.reset || {})} ${plan.D.url || ''}`;
    const other = todo.compute.filter((it) => it.lang !== 'en'), firsts = new Map();
    for (const it of other) if (!firsts.has(startOf(it))) firsts.set(startOf(it), it);
    await Promise.all([...todo.compute.filter((it) => it.lang === 'en'), ...firsts.values()].map(runIt));
    const NONE = /^no \w+ rendering:/;
    await Promise.all(other.filter((it) => firsts.get(startOf(it)) !== it).map((it) => {
      const r = results.get(firsts.get(startOf(it)).id);
      if (!(r?.result === 'blocked' && (r.notes || []).some((n) => NONE.test(n)))) return runIt(it);
      results.set(it.id, { lang: it.lang, width: it.width, result: 'blocked', failures: [], skipped: [], notes: [...r.notes.filter((n) => NONE.test(n)), `not run: ${firsts.get(startOf(it)).leaf.node.id} from the same start found no ${it.lang} rendering`], evidence: [], loadFailures: [] });
      return null;
    }));
    for (const it of plan.its.filter((i) => i.kind)) { const r = results.get(it.id); if (r?.machine) block(`scenarios ${f}: ${it.leaf.node.id} ${side} ${it.lang}-${it.width}: machine error twice (${r.machine}: ${String(r.failures?.[0]?.got || '').slice(0, 100)})`); }
    const rows = [];
    for (const l of new Set(plan.its.map((i) => i.leaf))) rows.push(leafRow(l, plan.its.filter((i) => i.leaf === l && i.kind).map((i) => results.get(i.id)).filter((r) => r && !r.machine)));
    return reportOf({ feature: f, commit: S[side].sha, base: S[side].url, langs: plan.langs, widths: plan.widths, nodeCount: plan.nodeCount, rows });
  };
  const leafSet = new Set(), unreadable = new Set();
  {
    const idOf = (p) => new Map(p.its.filter((i) => i.kind).map((i) => [`${i.leaf.node.id} ${i.lang}-${i.width}`, i.id]));
    for (const f of featuresWithLeaves('cand')) {
      const pc = leafItemsOf('cand', f, null);
      if (!pc || pc.problems) { unreadable.add(f); continue; } // its check below says why
      const pb = featuresWithLeaves('base').includes(f) ? leafItemsOf('base', f, null) : null;
      const b = pb && !pb.problems ? idOf(pb) : new Map(), c = idOf(pc);
      // a leaf is in reach when one of its runs has another identity on base, or none
      for (const id of new Set(pc.its.filter((i) => i.kind).map((i) => i.leaf.node.id))) if ([...c].some(([k, v]) => k.startsWith(id + ' ') && b.get(k) !== v)) leafSet.add(id);
    }
    // a feature that freezes now runs every leaf, its new ZH runs included (2026-10-21: identities alone left 16 of 94 out)
    for (const f of newlyFrozen) { const spec = specOf('cand', f); if (spec) for (const l of walkTree(spec).leaves) leafSet.add(l.node.id); }
    mech.reach.leaves = leafSet.size;
  }
  const leafFeatures = featuresWithLeaves('cand').filter((f) => {
    const spec = specOf('cand', f);
    const ids = spec ? walkTree(spec).leaves.map((l) => l.node.id) : [];
    return unreadable.has(f) || ids.some((id) => leafSet.has(id));
  }).filter((f) => {
    // a shared change runs the leaves of its own and the in-progress features only (owner, 2026-10-20)
    if (!scoped || scoped.own.includes(f) || scoped.inProgress.includes(f)) return true;
    (mech.outOfScope.leafFeatures ||= []).push(f);
    return false;
  });
  const noLeaves = [...new Set([...scope, ...moved.map((s) => s.feature)])].filter((f) => f !== DS_FEATURE && !featuresWithLeaves('cand').includes(f));
  mech.leaves = {};
  await Promise.all(leafFeatures.map(async (f) => {
    const only = unreadable.has(f) ? null : new Set(walkTree(specOf('cand', f)).leaves.map((l) => l.node.id).filter((id) => leafSet.has(id)));
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
