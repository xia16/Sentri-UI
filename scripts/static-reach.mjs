// Gate v2 §2 (docs/design-workflow/gate-v2.md): static, conservative reach over both revisions. Nothing here runs a browser; a
// recording of what pages call is never an input: nothing here is narrowed by what a run happened to do.
//
//   reachOf(base, candidate, { files }) -> { all, screens: [ids], functions: [exports] | [] | null, leaves: [ids], why: [] }
//   identityInputs(side, screenId)       -> { files, unbounded, bundle: { all, exports, units, unitHashes, setupHash }, screen }
//   leafInputs(side, { url, screen })    -> the same for a scenario leaf's run: its entry page and everything its taps can reach
//
// base / candidate: { dir: a checkout, atlas: its parsed atlas/atlas.json }. files: the changed paths (default: git diff of the two
// checkouts' HEADs). Unsure is everything: a file that won't parse, a namespace used any way but `SentriUI.X` / `SentriUI['X']`, a
// load whose URL can't be bounded, CSS, the harness, the shooter, fonts and packages all widen the reach; owning a feature only adds.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse } from './vendor/acorn.mjs';
import { bundleShape, bundleChange, bundleHashes } from './bundle-graph.mjs';
import { screensOf, pageOf, renderDef } from './atlas-screens.mjs';
import { leafEntryUrl } from './scenario-tree.mjs';

export const BUNDLE_JS = 'ux/design-system/components/bundle.js';
const ROOTISH = new Set(['window', 'globalThis', 'self', 'root', 'parent', 'top']);
// Always every screen: any stylesheet (no CSS proof in v1), the harness, the shooter and server, fonts, vendored assets, packages,
// the atlas's own code.
const EVERYTHING = [
  /^ux\/design-system\/components\/bundle\.css$/, /^ux\/design-system\/tokens\.(css|json)$/, /^ux\/system\/atlas-bare\.js$/,
  /^scripts\/(shoot-screens|serve-ux|font-route|playwright-path)\.(mjs|cjs)$/, /^vendor\//, /^package(-lock)?\.json$/,
  /^sections\//, /^atlas\/(?!atlas\.json$)/,
];
// Files that can't draw or run on a page: the workflow's text, prose outside ux/, CI, tests, agent settings, the other scripts.
const INERT = [/^docs\//, /^\.github\//, /^tests\//, /^\.claude\//, /^scripts\//, /^(?!ux\/).*\.md$/i, /^features\/[^/]+\/.*\.md$/i, /^ux\/design-system\/components\/index\.d\.ts$/];

const read = (dir, f) => { try { return fs.readFileSync(path.join(dir, f), 'utf8'); } catch { return null; } };
const isLocal = (u) => !!u && !/^([a-z][a-z\d+.-]*:|\/\/|#)/i.test(u);
// A literal reference resolved to a repo path: absolute from the server root, else against `from` (a page or a module file).
function resolveRef(ref, from) {
  const clean = String(ref).split(/[?#]/)[0].trim();
  if (!clean || !isLocal(clean)) return null;
  const p = clean.startsWith('/') ? path.posix.normalize(clean.slice(1)) : path.posix.normalize(path.posix.join(path.posix.dirname(from), clean));
  return p.startsWith('../') ? null : (p.endsWith('/') ? p + 'index.html' : p);
}

// ---------- scripts: namespace use and loads ----------
function parseJs(src) {
  for (const sourceType of ['script', 'module']) { try { return parse(src, { ecmaVersion: 'latest', sourceType, allowHashBang: true }); } catch {} }
  return null;
}
function walk(node, visit) {
  (function w(n, parent, key) {
    if (!n || typeof n.type !== 'string') return;
    visit(n, parent, key);
    for (const k of Object.keys(n)) {
      if (k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach((c) => w(c, n, k)); else if (v && typeof v.type === 'string') w(v, n, k);
    }
  })(node, null, null);
}
const literalOf = (n) => (n?.type === 'Literal' && typeof n.value === 'string' ? n.value : n?.type === 'TemplateLiteral' && !n.expressions.length ? n.quasis[0].value.cooked : null);

// How a script uses each namespace: { use: { [ns]: { all, names: Set, why } }, globals: [{ name, ns }] }.
// A supported access is `NS.X` or `NS['X']` (also through window/globalThis/self/root/parent/top), or a static destructuring with
// no rest (`const { X, Y: z } = NS`). A *provable alias* is resolved too (gate-v2 review: "only when its possible targets are
// provable"): a `const` declared once in the script, set from a namespace (or from another provable alias), whose every use is a
// supported access, `typeof`, `!` or a test. Anything else uses every export: passing it, storing it, returning it, a computed key,
// `...rest`, `let`/`var`, a second binding of the name, `with`. A top-level alias of a classic script is a global: it is returned in
// `globals`, so the page checks the other scripts' uses of it too (aliasUses).
const TEST_PARENTS = new Set(['IfStatement', 'ConditionalExpression', 'WhileStatement', 'DoWhileStatement', 'ForStatement']);
function bindingsOf(ast) {
  const decls = new Map();
  const add = (name, info) => { if (!decls.has(name)) decls.set(name, []); decls.get(name).push(info); };
  const pattern = (p, info) => {
    if (!p) return;
    if (p.type === 'Identifier') add(p.name, info);
    else if (p.type === 'ObjectPattern') p.properties.forEach((q) => pattern(q.type === 'RestElement' ? q.argument : q.value, info));
    else if (p.type === 'ArrayPattern') p.elements.forEach((e) => pattern(e, info));
    else if (p.type === 'AssignmentPattern') pattern(p.left, info);
    else if (p.type === 'RestElement') pattern(p.argument, info);
  };
  walk(ast, (n, parent) => {
    if (n.type === 'VariableDeclaration') for (const d of n.declarations) pattern(d.id, { kind: n.kind, declarator: d, top: parent?.type === 'Program' });
    if ((n.type === 'FunctionDeclaration' || n.type === 'ClassDeclaration') && n.id) add(n.id.name, { kind: 'function' });
    if (/Function/.test(n.type)) n.params.forEach((p) => pattern(p, { kind: 'param' }));
    if (n.type === 'CatchClause' && n.param) pattern(n.param, { kind: 'param' });
    if (n.type === 'ImportSpecifier' || n.type === 'ImportDefaultSpecifier' || n.type === 'ImportNamespaceSpecifier') add(n.local.name, { kind: 'import' });
  });
  return decls;
}
// Classify every reference to `name` in a script as a use of namespace `ns`, into u ({ all, names, why }). aliases: name -> ns of the
// provable aliases already known (their own declarations are not uses).
function classify(ast, parents, name, ns, u, aliases) {
  const isRef = (n, parent, key) => !((parent?.type === 'MemberExpression' && key === 'property' && !parent.computed)
    || (parent?.type === 'Property' && key === 'key' && !parent.computed && !parent.shorthand)
    || (parent?.type === 'MethodDefinition' && key === 'key') || (parent?.type === 'VariableDeclarator' && key === 'id'));
  const all = (why) => { if (!u.all) { u.all = true; u.why = why; } };
  walk(ast, (n, parent, key) => {
    if (n.type !== 'Identifier' || n.name !== name || !isRef(n, parent, key)) return;
    if (parent?.type === 'MemberExpression' && key === 'object') {
      if (!parent.computed) u.names.add(parent.property.name);
      else { const k = literalOf(parent.property); if (k !== null) u.names.add(k); else all(`${name}[computed]`); }
      return;
    }
    if (parent?.type === 'VariableDeclarator' && key === 'init') {
      if (parent.id.type === 'Identifier' && aliases.get(parent.id.name) === ns) return; // a provable alias of it: classified on its own
      if (parent.id.type === 'ObjectPattern' && parent.id.properties.every((p) => p.type === 'Property' && !p.computed)) { parent.id.properties.forEach((p) => u.names.add(p.key.name ?? p.key.value)); return; }
      return all(`${name} bound by ${parent.id.type === 'ObjectPattern' ? 'a destructuring with a rest or a computed key' : 'an alias that is not provable'}`);
    }
    if (parent?.type === 'UnaryExpression' && (parent.operator === 'typeof' || parent.operator === '!')) return;
    if (TEST_PARENTS.has(parent?.type) && key === 'test') return;
    all(`${name} used as a value (${parent?.type || 'top'})`);
  });
}
function namespaceUse(ast, namespaces, { module = false } = {}) {
  const use = Object.fromEntries(namespaces.map((n) => [n, { all: false, names: new Set(), why: '' }]));
  const parents = new Map();
  let hasWith = false;
  walk(ast, (n, parent, key) => { parents.set(n, { parent, key }); if (n.type === 'WithStatement') hasWith = true; });
  const decls = bindingsOf(ast);
  // the namespace a node names: NS, window.NS / root['NS'] …
  const nsOf = (n) => {
    if (!n) return null;
    if (n.type === 'Identifier' && use[n.name] && !decls.has(n.name)) return n.name;
    if (n.type === 'MemberExpression' && n.object.type === 'Identifier' && ROOTISH.has(n.object.name)) { const k = n.computed ? literalOf(n.property) : n.property.name; return k !== null && use[k] ? k : null; }
    return null;
  };
  // provable aliases, to a fixed point (an alias of an alias)
  const aliases = new Map(), globals = [];
  for (let grew = true; grew;) {
    grew = false;
    for (const [name, list] of decls) {
      if (aliases.has(name)) continue;
      // every binding of the name (one per scope, e.g. `const UI = root.SentriUI` in several functions) must be a provable alias of
      // the same namespace: then any reference to the name is one of them. One other binding (a parameter, a let) and it is not.
      const nsOfDecl = (x) => (x.declarator && x.declarator.id.type === 'Identifier' ? nsOf(x.declarator.init) || (x.declarator.init?.type === 'Identifier' && aliases.get(x.declarator.init.name)) : null);
      const each = list.map(nsOfDecl);
      const ns = each.find(Boolean);
      if (!ns) continue;
      const loose = list.find((x, i) => x.kind !== 'const' || each[i] !== ns);
      if (loose) { const u = use[ns]; if (!u.all) { u.all = true; u.why = loose.kind !== 'const' ? `${loose.kind} ${name} = ${ns}: not a provable alias` : `${name} is also bound to something else`; } continue; }
      aliases.set(name, ns); grew = true;
      if (list.some((x) => x.top) && !module) globals.push({ name, ns });
    }
  }
  if (hasWith) for (const ns of namespaces) { use[ns].all = true; use[ns].why = 'a with statement'; }
  // every direct reference to a namespace, and every use of a provable alias
  for (const ns of namespaces) if (!decls.has(ns)) classify(ast, parents, ns, ns, use[ns], aliases);
  for (const [name, ns] of aliases) classify(ast, parents, name, ns, use[ns], aliases);
  // window.NS / root['NS'] used other than as a member read or a provable alias's value; window[expr] can be any namespace
  walk(ast, (n, parent, key) => {
    if (n.type !== 'MemberExpression' || n.object.type !== 'Identifier' || !ROOTISH.has(n.object.name)) return;
    const k = n.computed ? literalOf(n.property) : n.property.name;
    if (k === null && n.computed) { for (const ns of namespaces) if (!use[ns].all) { use[ns].all = true; use[ns].why = `${n.object.name}[computed]`; } return; }
    if (k === null || !use[k]) return;
    const u = use[k];
    if (parent?.type === 'MemberExpression' && key === 'object') {
      if (!parent.computed) u.names.add(parent.property.name);
      else { const x = literalOf(parent.property); if (x !== null) u.names.add(x); else if (!u.all) { u.all = true; u.why = `${k}[computed]`; } }
      return;
    }
    if (parent?.type === 'VariableDeclarator' && key === 'init') {
      if (parent.id.type === 'Identifier' && aliases.get(parent.id.name) === k) return;
      if (parent.id.type === 'ObjectPattern' && parent.id.properties.every((p) => p.type === 'Property' && !p.computed)) { parent.id.properties.forEach((p) => u.names.add(p.key.name ?? p.key.value)); return; }
    }
    if (parent?.type === 'UnaryExpression' && (parent.operator === 'typeof' || parent.operator === '!')) return;
    if (TEST_PARENTS.has(parent?.type) && key === 'test') return;
    if (parent?.type === 'LogicalExpression' && parents.get(parent)?.parent?.type === 'ExpressionStatement' && parent.left === n) return; // window.NS && go()
    if (!u.all) { u.all = true; u.why = `${n.object.name}.${k} used as a value (${parent?.type || 'top'})`; }
  });
  return { use, globals };
}
// Another script's uses of a global alias `name` (declared top-level in a classic script of the same page): its namespace `ns`.
function aliasUses(ast, name, ns) {
  const u = { all: false, names: new Set(), why: '' };
  const decls = bindingsOf(ast);
  if (decls.has(name)) return u; // its own binding of the name: not the global
  const parents = new Map();
  walk(ast, (n, parent, key) => parents.set(n, { parent, key }));
  classify(ast, parents, name, ns, u, new Map());
  return u;
}

// What a load can fetch, by how it loads: an <img> loads only images and media, a <script> only scripts; fetch, import(), a frame,
// an unknown tag and a navigation can load anything. A changed file reaches a page with an unbounded load only when its type fits.
const MEDIA = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|mp4|webm|mov|mp3|wav|ogg|m4a|vtt)$/i;
export const fileType = (f) => (MEDIA.test(f) ? 'media' : /\.(m?js|cjs)$/i.test(f) ? 'script' : /\.css$/i.test(f) ? 'style' : 'other');
const TAG_TYPE = { img: 'media', source: 'media', video: 'media', audio: 'media', track: 'media', input: 'media', script: 'script' };
const typeFits = (mask, f) => mask.has('any') || mask.has(fileType(f));

// The paths a URL expression can name, or null when it can't be bounded: a literal; new URL(literal, base) (against the script when
// the base is its own src or import.meta.url, against the page when it is location/document, against both when unknown); .href,
// .pathname or .toString() of one; a ternary, ||, ?? or && over bounded values; a variable whose every assignment is bounded.
function urlBound(node, env, file, page, depth = 0) {
  if (!node || depth > 12 || node === UNBOUNDED) return null;
  const lit = literalOf(node);
  if (lit !== null) { const f = resolveRef(lit, page); return new Set(f ? [f] : []); }
  // the page itself: location, location.href, document.URL, document.baseURI (a query or hash change is the same file)
  const isHere = (x) => x && ((x.type === 'Identifier' && x.name === 'location') || (x.type === 'MemberExpression' && !x.computed
    && ((x.object.type === 'Identifier' && x.object.name === 'location' && x.property.name === 'href')
      || (x.object.type === 'Identifier' && x.object.name === 'document' && ['URL', 'baseURI'].includes(x.property.name))
      || (x.object.type === 'MemberExpression' && !x.object.computed && x.object.property.name === 'location' && x.property.name === 'href'))));
  if (isHere(node)) return new Set([page]);
  if (node.type === 'NewExpression' && node.callee.type === 'Identifier' && node.callee.name === 'URL' && node.arguments.length && isHere(node.arguments[0])) return new Set([page]);
  if (node.type === 'NewExpression' && node.callee.type === 'Identifier' && node.callee.name === 'URL' && node.arguments.length) {
    const l = literalOf(node.arguments[0]);
    if (l === null) {
      // new URL(x, base) with x bounded relative paths: resolve each against the base the same way
      const inner = urlBound(node.arguments[0], env, file, page, depth + 1);
      return inner;
    }
    const baseNode = node.arguments[1], src = baseNode ? JSON.stringify(baseNode, (k, v) => (k === 'start' || k === 'end' ? undefined : v)) : '';
    const towardScript = /currentScript|import\.meta|"meta"/.test(src) || (baseNode?.type === 'Identifier' && env.scriptBased.has(baseNode.name));
    const towardPage = !baseNode || /location|baseURI|"document"/.test(src);
    const out = new Set();
    for (const from of towardScript ? [file] : towardPage ? [page] : [file, page]) { const f = resolveRef(l, from); if (f) out.add(f); }
    return out;
  }
  if (node.type === 'MemberExpression' && !node.computed && ['href', 'pathname', 'toString'].includes(node.property.name)) return urlBound(node.object, env, file, page, depth + 1);
  if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && !node.callee.computed && node.callee.property.name === 'toString') return urlBound(node.callee.object, env, file, page, depth + 1);
  const union = (...ns) => { const out = new Set(); for (const n of ns) { const b = urlBound(n, env, file, page, depth + 1); if (!b) return null; b.forEach((x) => out.add(x)); } return out; };
  if (node.type === 'ConditionalExpression') return union(node.consequent, node.alternate);
  if (node.type === 'LogicalExpression') return node.operator === '&&' ? union(node.right) : union(node.left, node.right);
  if (node.type === 'Identifier' && env.values.has(node.name)) {
    const vals = env.values.get(node.name), out = new Set();
    for (const v of vals) { if (env.seen.has(v)) continue; env.seen.add(v); const b = urlBound(v, env, file, page, depth + 1); env.seen.delete(v); if (!b) return null; b.forEach((x) => out.add(x)); }
    return out;
  }
  return null;
}
// Every value assigned to each name in a script (declarations, plain assignments, and a local function's parameters bound to its
// call-site arguments), and the names that hold a script's own URL. Names are pooled across scopes: a pool holds every value any
// binding of that name gets, so a bound pool is bound for each of them. A function that escapes (passed, stored, exported) leaves
// its parameters unbounded.
const UNBOUNDED = { type: 'Unbounded' };
function valueEnv(ast) {
  const values = new Map(), scriptBased = new Set();
  const put = (name, v) => { if (!values.has(name)) values.set(name, []); values.get(name).push(v); };
  const fns = new Map(); // name -> params
  walk(ast, (n) => {
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init) put(n.id.name, n.init);
    if (n.type === 'AssignmentExpression' && n.left.type === 'Identifier') put(n.left.name, n.right);
    if (n.type === 'FunctionDeclaration' && n.id) fns.set(n.id.name, n.params);
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init && /^(Arrow)?FunctionExpression$/.test(n.init.type)) fns.set(n.id.name, n.init.params);
    // every other function's parameters (callbacks, methods) can hold anything
    if (/Function/.test(n.type)) for (const p of n.params) { const id = p.type === 'AssignmentPattern' ? p.left : p; if (id.type === 'Identifier') put(id.name, UNBOUNDED); }
  });
  // a local function used only as a callee: its parameters are its arguments (a default when an argument is left out)
  const calls = new Map(), escaped = new Set();
  const parents = new Map();
  walk(ast, (n, parent, key) => parents.set(n, { parent, key }));
  walk(ast, (n, parent, key) => {
    if (n.type !== 'Identifier' || !fns.has(n.name)) return;
    if (parent?.type === 'CallExpression' && key === 'callee') { if (!calls.has(n.name)) calls.set(n.name, []); calls.get(n.name).push(parent.arguments); return; }
    const declaring = (parent?.type === 'FunctionDeclaration' && key === 'id') || (parent?.type === 'VariableDeclarator' && key === 'id');
    const isName = parent?.type === 'MemberExpression' && key === 'property' && !parent.computed;
    if (!declaring && !isName) escaped.add(n.name);
  });
  for (const [name, params] of fns) {
    params.forEach((p, i) => {
      const id = p.type === 'AssignmentPattern' ? p.left : p;
      if (id.type !== 'Identifier') return;
      const pool = values.get(id.name) || [];
      const at = pool.indexOf(UNBOUNDED);
      if (escaped.has(name) || !calls.has(name)) return; // stays unbounded
      if (at >= 0) pool.splice(at, 1); // this binding's values are its call sites'
      for (const args of calls.get(name)) put(id.name, args[i] ?? (p.type === 'AssignmentPattern' ? p.right : { type: 'Literal', value: '' }));
    });
  }
  for (const [name, vs] of values) if (vs.some((v) => /currentScript|import\.meta/.test(JSON.stringify(v, (k, x) => (k === 'start' || k === 'end' ? undefined : x))))) scriptBased.add(name);
  return { values, scriptBased, seen: new Set() };
}

// The loads and navigations a script makes: { files: Set, unbounded: [{ why, type }], nav: Set, navUnbounded: [why] }. A load shapes
// what the page draws (modules, fetch, XHR, workers, src/data/srcset/poster, setAttribute, markup in strings); a navigation only
// matters once something taps (location, window.open, an <a href>). Module specifiers resolve against the module file, everything
// else against the page. A URL that can't be bounded (urlBound) is unbounded: a load typed by what it can fetch, a navigation anywhere.
const LOAD_PROPS = new Set(['src', 'href', 'data', 'action', 'srcset', 'poster']);
function scriptLoads(ast, file, page) {
  const files = new Set(), unbounded = [], nav = new Set(), navUnbounded = [];
  const env = valueEnv(ast);
  const add = (lit, from) => { const f = resolveRef(lit, from); if (f) files.add(f); };
  const arg = (node, from, what, type = 'any') => {
    const lit = literalOf(node);
    if (lit !== null) return add(lit, from);
    const b = urlBound(node, env, file, page);
    if (b) b.forEach((f) => files.add(f)); else unbounded.push({ why: `${file}: ${what} with a computed URL`, type });
  };
  const go = (node, what) => {
    const lit = literalOf(node);
    const b = lit !== null ? new Set([resolveRef(lit, page)].filter(Boolean)) : urlBound(node, env, file, page);
    if (b) b.forEach((f) => nav.add(f)); else navUnbounded.push(`${file}: ${what} with a computed URL`);
  };
  const isLocation = (x) => (x.type === 'Identifier' && x.name === 'location') || (x.type === 'MemberExpression' && !x.computed && x.property.name === 'location');
  walk(ast, (n) => {
    if ((n.type === 'ImportDeclaration' || n.type === 'ExportAllDeclaration' || n.type === 'ExportNamedDeclaration') && n.source) add(n.source.value, file);
    if (n.type === 'ImportExpression') arg(n.source, file, 'import()');
    if (n.type === 'CallExpression' || n.type === 'NewExpression') {
      const c = n.callee, name = c.type === 'Identifier' ? c.name : c.type === 'MemberExpression' && !c.computed ? c.property.name : '';
      if (['fetch', 'importScripts'].includes(name) || (n.type === 'NewExpression' && ['Worker', 'SharedWorker', 'EventSource'].includes(name))) { if (n.arguments.length) arg(n.arguments[0], page, `${name}()`); }
      if (name === 'open' && c.type === 'MemberExpression' && n.arguments.length >= 2 && literalOf(n.arguments[0]) !== null && /^[A-Z]+$/.test(literalOf(n.arguments[0]))) arg(n.arguments[1], page, 'XMLHttpRequest.open()');
      if (name === 'open' && c.type === 'MemberExpression' && c.object.type === 'Identifier' && ROOTISH.has(c.object.name) && n.arguments.length) go(n.arguments[0], 'window.open()');
      if (['assign', 'replace'].includes(name) && c.type === 'MemberExpression' && isLocation(c.object) && n.arguments.length) go(n.arguments[0], `location.${name}()`);
      if (name === 'setAttribute' && n.arguments.length >= 2 && LOAD_PROPS.has(literalOf(n.arguments[0]))) arg(n.arguments[1], page, `setAttribute('${literalOf(n.arguments[0])}')`);
    }
    // `x.src = url` loads; `PP.href = function () {…}` only stores a function
    if (n.type === 'AssignmentExpression' && !/Function/.test(n.right.type)) {
      const l = n.left;
      if (isLocation(l) || (l.type === 'MemberExpression' && !l.computed && l.property.name === 'href' && isLocation(l.object))) go(n.right, 'location =');
      else if (l.type === 'MemberExpression' && !l.computed && LOAD_PROPS.has(l.property.name)) arg(n.right, page, `.${l.property.name} =`);
    }
    // markup built in strings: src="…" / href="…" inside a literal or a template's fixed parts. A value with an expression in it
    // (<img src="${url}">) can't be bounded; the tag says what it can load. A link (<a href>) is navigation, not a load.
    const markup = (text) => { for (const m of text.matchAll(/<(\w+)\b[^<>]*?\b(?:src|href|data|srcset|poster)\s*=\s*(["'])([^"']*)\2/gi)) { if (m[1].toLowerCase() !== 'a') add(m[3], page); else { const f = resolveRef(m[3], page); if (f) nav.add(f); } } };
    if (n.type === 'Literal' && typeof n.value === 'string') markup(n.value);
    if (n.type === 'TemplateLiteral') {
      n.quasis.forEach((q, i) => {
        const s = q.value.cooked || '';
        markup(s);
        const open = i < n.expressions.length && s.match(/<(\w+)\b[^<>]*\b(src|href|data|srcset|poster)\s*=\s*["']?([^"'\s>]*)$/i);
        // The file is fixed once the literal part reaches a query or a fragment: href="page.html?entry=${x}" can only open
        // page.html (a value of "?…" alone is the page itself). Not for srcset, which can list further URLs after the expression.
        const fixed = open && open[2].toLowerCase() !== 'srcset' && /[?#]/.test(open[3]) ? (open[3].split(/[?#]/)[0] ? resolveRef(open[3].split(/[?#]/)[0], page) : page) : null;
        if (fixed) { if (open[1].toLowerCase() === 'a') nav.add(fixed); else files.add(fixed); }
        else if (open && open[1].toLowerCase() !== 'a') unbounded.push({ why: `${file}: <${open[1]}> markup with a computed URL`, type: TAG_TYPE[open[1].toLowerCase()] || 'any' });
        else if (open) navUnbounded.push(`${file}: <a> markup with a computed href`);
      });
    }
  });
  return { files, unbounded, nav, navUnbounded };
}

// ---------- pages ----------
// A page's closure: { files: Set (the page, everything it loads, transitively), unbounded: [{ why, type }], use: { [ns]: { all, names } },
// nav: Set (pages it can open: frames, links, location), navUnbounded: bool }.
// The bundle's own computed loads, by the unit that makes them: [{ unit: 'SentriUI:photos', type, why }]. They count for a page only
// when it uses an export that can run that unit (the page hands it the URL); the bundle's literal loads count for every page.
function bundleLoads(shape) {
  const out = [];
  if (!shape) return out;
  const re = /<(\w+)\b[^<>]*\b(?:src|href|data|srcset|poster)\s*=\s*\\?["']?\$\{/gi;
  for (const f of shape.iifes) for (const [n, u] of f.units) for (const m of u.text.matchAll(re)) {
    const tag = m[1].toLowerCase();
    if (tag !== 'a') out.push({ unit: `${f.namespace}:${n}`, type: TAG_TYPE[tag] || 'any', why: `${BUNDLE_JS}: ${f.namespace}:${n} draws <${tag}> with a URL its caller gives` });
  }
  return out;
}

function pageAnalyser(dir, namespaces, shape) {
  const fromBundle = bundleLoads(shape);
  const memoScript = new Map(), memoPage = new Map();
  const blank = () => Object.fromEntries(namespaces.map((n) => [n, { all: false, names: new Set(), why: '' }]));
  const merge = (into, from) => { for (const ns of namespaces) { if (from[ns].all && !into[ns].all) { into[ns].all = true; into[ns].why = from[ns].why; } for (const x of from[ns].names) into[ns].names.add(x); } };
  const script = (file, page, src) => {
    const key = `${file}|${page}`;
    if (src === undefined && memoScript.has(key)) return memoScript.get(key);
    const text = src ?? read(dir, file);
    let r;
    if (text === null) r = { files: new Set(), unbounded: [], nav: new Set(), navUnbounded: [], use: blank(), missing: true };
    else {
      const ast = parseJs(text);
      if (!ast) {
        const use = blank();
        for (const ns of namespaces) if (text.includes(ns)) { use[ns].all = true; use[ns].why = `${file} does not parse`; }
        r = { files: new Set(), unbounded: [{ why: `${file} does not parse`, type: 'any' }], nav: new Set(), navUnbounded: [`${file} does not parse`], use };
      } else {
        // the bundle defines the namespaces (root.SentriUI = api): its own references are not a page's use of them
        const ns = file === BUNDLE_JS ? { use: blank(), globals: [] } : namespaceUse(ast, namespaces, { module: ast.sourceType === 'module' });
        r = { ...scriptLoads(ast, file, page), use: ns.use, globals: ns.globals, ast: file === BUNDLE_JS ? null : ast };
        if (file === BUNDLE_JS && shape) r.unbounded = r.unbounded.filter((u) => !/markup with a computed URL/.test(u.why));
      }
    }
    if (src === undefined) memoScript.set(key, r);
    return r;
  };
  const css = (file) => {
    const text = read(dir, file) || '', files = new Set();
    for (const m of text.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)|@import\s+(["'])([^"']+)\3/g)) { const f = resolveRef(m[2] || m[4], file); if (f) files.add(f); }
    return files;
  };
  const page = (p, stack = new Set()) => {
    if (memoPage.has(p)) return memoPage.get(p);
    const out = { files: new Set([p]), unbounded: [], use: blank(), nav: new Set(), navUnbounded: false };
    memoPage.set(p, out);
    const html = read(dir, p);
    if (html === null) { out.missing = true; return out; }
    // every reference in the markup (tags, inline styles), and the inline scripts parsed against this page
    const scripts = [];
    const markup = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (all, attrs, body) => { if (!/\bsrc\s*=/.test(attrs) && body.trim()) scripts.push(body); return `<script${attrs}></script>`; });
    for (const ns of namespaces) if (new RegExp(`\\b${ns}\\b`).test(markup.replace(/<script\b[^>]*><\/script>/gi, ''))) { out.use[ns].all = true; out.use[ns].why = `${p} names ${ns} outside a script`; }
    const queue = [];
    for (const m of markup.matchAll(/<(a|script|link|img|iframe|frame|source|embed|object|video|audio|track|input)\b([^>]*)>/gi)) {
      for (const a of m[2].matchAll(/\b(src|href|data|srcset|poster)\s*=\s*(["'])([^"']*)\2/gi)) {
        const f = resolveRef(a[3].split(/\s/)[0], p);
        if (!f) continue;
        if (m[1].toLowerCase() === 'a') { if (/\.html?$/.test(f)) out.nav.add(f); continue; } // a link is navigation, not a load
        queue.push(f);
      }
    }
    for (const m of markup.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)) { const f = resolveRef(m[2], p); if (f) queue.push(f); }
    for (const body of scripts) queue.push({ inline: body });
    const seen = new Set(), ran = []; // every script of this document, for its global aliases
    while (queue.length) {
      const q = queue.shift();
      if (q.inline !== undefined) { const r = script(`${p}#inline`, p, q.inline); ran.push(r); r.files.forEach((f) => queue.push(f)); out.unbounded.push(...r.unbounded); r.nav.forEach((f) => out.nav.add(f)); if (r.navUnbounded.length) out.navUnbounded = true; merge(out.use, r.use); continue; }
      if (seen.has(q)) continue;
      seen.add(q); out.files.add(q);
      if (/\.(m?js|cjs)$/.test(q)) { const r = script(q, p); ran.push(r); r.files.forEach((f) => queue.push(f)); out.unbounded.push(...r.unbounded); r.nav.forEach((f) => out.nav.add(f)); if (r.navUnbounded.length) out.navUnbounded = true; merge(out.use, r.use); }
      else if (/\.css$/.test(q)) css(q).forEach((f) => queue.push(f));
      else if (/\.html?$/.test(q) && q !== p && !stack.has(q)) {
        // a frame is a page of its own: its closure, its use of the bundle and its loads are this page's too
        const sub = page(q, new Set([...stack, p]));
        sub.files.forEach((f) => out.files.add(f)); out.unbounded.push(...sub.unbounded); merge(out.use, sub.use);
        out.nav.add(q); sub.nav.forEach((n) => out.nav.add(n)); if (sub.navUnbounded) out.navUnbounded = true;
      }
    }
    // a top-level const alias in a classic script is a global: every other script of this document is checked for its uses
    for (const g of ran.flatMap((x) => x.globals || [])) for (const x of ran) {
      if (!x.ast || (x.globals || []).some((h) => h.name === g.name)) continue;
      const u = aliasUses(x.ast, g.name, g.ns);
      if (u.all && !out.use[g.ns].all) { out.use[g.ns].all = true; out.use[g.ns].why = u.why; }
      u.names.forEach((n) => out.use[g.ns].names.add(n));
    }
    for (const f of out.files) if (/\.html?$/.test(f) && f !== p) out.nav.add(f);
    // the bundle's computed loads, for the exports this page can run
    if (fromBundle.length && out.files.has(BUNDLE_JS)) {
      const usedAll = Object.values(out.use).some((u) => u.all);
      const exports = Object.entries(out.use).flatMap(([ns, u]) => [...u.names].map((x) => `${ns}.${x}`));
      const runs = usedAll ? null : new Set(forwardUnits(shape, exports));
      for (const b of fromBundle) if (!runs || runs.has(b.unit)) out.unbounded.push({ why: b.why, type: b.type });
    }
    if (out.unbounded.some((u) => u.type === 'any')) out.navUnbounded = true;
    return out;
  };
  return page;
}

// What one screen depends on: its page's closure; for a screen whose atlas steps tap through it, every page it can navigate to as
// well (a tap may leave the page). An unbounded navigation makes it depend on anything.
function screenDeps(S, s) {
  const def = S.defs.get(s.id);
  if (!def?.steps?.length) return S.page(pageOf(s.url));
  return navClosure(S, pageOf(s.url), s.id);
}
// A page and every page it can navigate to (links, location, window.open, frames), with their loads and their use of the bundle.
// A navigation to a computed URL can go anywhere: the closure is then unbounded (type any).
function navClosure(S, start, label) {
  const first = S.page(start);
  const out = { files: new Set(first.files), unbounded: [...first.unbounded], use: JSON.parse(JSON.stringify(first.use, (k, v) => (v instanceof Set ? [...v] : v))), missing: first.missing, pages: [start] };
  for (const u of Object.values(out.use)) u.names = new Set(u.names);
  const seen = new Set([start]), q = [...first.nav];
  if (first.navUnbounded) out.unbounded.push({ why: `${label}: it may navigate anywhere`, type: 'any' });
  while (q.length) {
    const p = q.shift();
    if (seen.has(p)) continue;
    seen.add(p); out.pages.push(p);
    const pg = S.page(p);
    // a link to a page that isn't there lands on a 404: nothing of the repo runs there
    pg.files.forEach((f) => out.files.add(f)); out.unbounded.push(...pg.unbounded);
    for (const [ns, u] of Object.entries(pg.use)) { if (u.all && !out.use[ns].all) { out.use[ns].all = true; out.use[ns].why = `it may reach ${p}: ${u.why}`; } u.names.forEach((x) => out.use[ns].names.add(x)); }
    if (pg.navUnbounded) out.unbounded.push({ why: `${p}: navigation to a computed URL`, type: 'any' });
    pg.nav.forEach((n) => q.push(n));
  }
  return out;
}

// ---------- one side ----------
// A side's analysis is kept per revision, never per folder alone: a folder that is checked out again, or edited, is a new side.
// The key is the folder plus its HEAD and the state of its working tree (git), or the side's own `rev` when the caller gives one.
const sides = new Map();
export const clearReachCache = () => sides.clear();
function revisionOf(dir) {
  try {
    const head = execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const dirty = execFileSync('git', ['-C', dir, 'status', '--porcelain', '--untracked-files=all'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (!dirty.trim()) return head;
    // edited files count by content, not only by name
    const h = createHash('sha256').update(dirty);
    for (const line of dirty.split(/\r?\n/).filter(Boolean)) { const f = line.slice(3).replace(/^"|"$/g, ''); try { h.update(fs.readFileSync(path.join(dir, f))); } catch {} }
    return `${head}+${h.digest('hex').slice(0, 16)}`;
  } catch { return `t${Date.now()}${Math.random()}`; } // not a git checkout: never reuse
}
function sideOf(side) {
  const key = `${path.resolve(side.dir)}|${side.rev || revisionOf(side.dir)}`;
  if (sides.has(key)) return sides.get(key);
  const src = read(side.dir, BUNDLE_JS);
  let shape = null;
  try { shape = src ? bundleShape(src) : null; } catch {}
  const namespaces = shape ? shape.iifes.map((f) => f.namespace).filter(Boolean) : ['SentriUI', 'SentriIcons'];
  const screens = screensOf(side.atlas);
  const defs = new Map();
  for (const p of side.atlas.platforms || []) for (const s of p.sections || []) for (const f of s.features || []) for (const c of f.screens || []) if (c.url) defs.set(c.id, c);
  const s = { dir: side.dir, src, shape, namespaces, screens, defs, page: pageAnalyser(side.dir, namespaces, shape) };
  sides.set(key, s);
  return s;
}

// The leaves of a feature's scenarios.json: [{ id, feature, entry: the page its nearest reset opens, or null }]. The entry comes
// from leafEntryUrl, the resolver the gate's leaf identities use: it read `defaults.reset.url`, which no spec has (they say
// `defaults.url`), so 95 of Farrowing's 97 leaves had no entry and counted as in reach on every change.
function leavesOf(dir, feature) {
  const spec = (() => { try { return JSON.parse(read(dir, `features/${feature}/scenarios.json`) || 'null'); } catch { return null; } })();
  const D = spec?.defaults || {}, out = [];
  const entryOf = (reset) => { const u = leafEntryUrl(reset, D); return u ? pageOf(u) : null; };
  (function w(nodes, entry) {
    for (const n of nodes || []) {
      const e = n.reset ? entryOf(n.reset) : entry;
      if (n.type === 'outcome') out.push({ id: n.id, feature, entry: e });
      w(n.children, e);
    }
  })(spec?.tree, entryOf(null));
  return out;
}

// ---------- reach ----------
export function reachOf(base, candidate, { files } = {}) {
  const B = sideOf(base), C = sideOf(candidate);
  const changed = files || gitDiff(base.dir, candidate.dir);
  const why = [];
  const allIds = [...new Set([...B.screens, ...C.screens].map((s) => s.id))].sort();
  const featureOf = new Map([...B.screens, ...C.screens].map((s) => [s.id, s.feature]));
  const everything = (w, functions = null) => ({ all: true, screens: allIds, functions, leaves: allLeaves(base, candidate, [...new Set(featureOf.values())]), why: [w] });

  // 1. what can't be narrowed
  // any stylesheet is every screen: there is no CSS proof in v1 (gate-v2 §2), so not even one page's own stylesheet is narrowed
  const wide = changed.filter((f) => EVERYTHING.some((re) => re.test(f)) || /\.css$/i.test(f));
  if (wide.length) return everything(`${wide.slice(0, 3).join(', ')}: CSS, the harness, the shooter, fonts or packages reach every screen`);

  // 2. the bundle
  let functions = [];
  if (changed.includes(BUNDLE_JS)) {
    const ch = bundleChange(B.src || '', C.src || '');
    if (ch.all) return everything(`the bundle: ${ch.why[0]}`);
    functions = ch.exports;
    why.push(`the bundle: ${ch.why[0]}${functions.length ? ` (${functions.slice(0, 4).join(', ')}${functions.length > 4 ? ' …' : ''})` : ''}`);
  }
  const fnSet = new Set(functions);
  const usesChanged = (use) => Object.entries(use).some(([ns, u]) => (u.all && functions.some((f) => f.startsWith(ns + '.'))) || [...u.names].some((x) => fnSet.has(`${ns}.${x}`)));

  // 3. screens
  const reach = new Set(), reasons = new Map();
  const hit = (id, w) => { reach.add(id); if (!reasons.has(w)) reasons.set(w, 0); reasons.set(w, reasons.get(w) + 1); };
  const rest = changed.filter((f) => f !== BUNDLE_JS && !INERT.some((re) => re.test(f)));
  const runtime = rest.filter((f) => f !== 'atlas/atlas.json' && !/^features\//.test(f));
  const inClosure = new Set();
  for (const side of [B, C]) for (const s of side.screens) {
    const pg = screenDeps(side, s);
    if (pg.missing) hit(s.id, 'its page is missing on one side');
    if (functions.length && usesChanged(pg.use)) hit(s.id, 'its page uses a changed export (or the namespace as a whole)');
    for (const f of runtime) if (pg.files.has(f)) { inClosure.add(f); hit(s.id, 'its page loads a changed file'); }
    // a load the analyser can't bound depends on every changed runtime file it could fetch, even one another page names literally
    for (const f of runtime) { const u = pg.unbounded.find((x) => typeFits(new Set([x.type]), f)); if (u) hit(s.id, `its page loads by a computed URL (${u.why})`); }
  }
  // the atlas: a screen whose definition (url, preset, steps: what renders) changed, and a screen only one side has
  for (const id of allIds) {
    const b = B.defs.get(id), c = C.defs.get(id);
    if (!b || !c) hit(id, 'only one side has it');
    else if (JSON.stringify(renderDef(b)) !== JSON.stringify(renderDef(c))) hit(id, 'its atlas definition changed');
  }
  // a feature's own files add its screens; owning a feature never removes a dependency
  const ownFeatures = new Set(changed.map((f) => f.match(/^features\/([^/]+)\//)?.[1]).filter(Boolean));
  for (const id of allIds) if (ownFeatures.has(featureOf.get(id))) hit(id, "its feature's own files changed");
  for (const [w, n] of reasons) why.push(`${n} screen(s): ${w}`);
  const orphans = runtime.filter((f) => !inClosure.has(f));
  if (orphans.length) why.push(`${orphans.slice(0, 3).join(', ')}: no page loads it (pages with computed loads are in reach)`);

  // 4. behaviour: every leaf of an affected feature, and any leaf whose entry page can navigate to a page in reach
  const features = [...new Set([...reach].map((id) => featureOf.get(id)).concat([...ownFeatures]))];
  const leaves = leavesInReach(base, candidate, features, reach);
  return { all: false, screens: [...reach].sort(), functions, leaves, why };
}

function allLeaves(base, candidate, features) {
  return [...new Set([base, candidate].flatMap((side) => features.flatMap((f) => leavesOf(side.dir, f).map((l) => l.id))))].sort();
}
function leavesInReach(base, candidate, features, reach) {
  const out = new Set(allLeaves(base, candidate, features));
  for (const side of [base, candidate]) {
    const S = sideOf(side);
    const reachPages = new Set(S.screens.filter((s) => reach.has(s.id)).map((s) => pageOf(s.url)));
    if (!reachPages.size) continue;
    const allFeatures = [...new Set(S.screens.map((s) => s.feature))];
    for (const f of allFeatures) for (const l of leavesOf(side.dir, f)) {
      if (out.has(l.id)) continue;
      if (!l.entry) { out.add(l.id); continue; } // an entry it can't name: unsure
      // the pages it can reach by navigation, from its entry; an unbounded one can reach anything
      const seen = new Set([l.entry]), q = [l.entry];
      let touches = false;
      while (q.length && !touches) {
        const p = q.shift(), pg = S.page(p);
        if (reachPages.has(p) || pg.navUnbounded) { touches = true; break; }
        for (const n of pg.nav) if (!seen.has(n)) { seen.add(n); q.push(n); }
      }
      if (touches) out.add(l.id);
    }
  }
  return [...out].sort();
}

function gitDiff(a, b) {
  const sha = (d) => execFileSync('git', ['-C', d, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  return execFileSync('git', ['-C', b, 'diff', '--name-only', '--no-renames', sha(a), sha(b)], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
}

// ---------- identity ----------
// What one screen's evidence depends on (gate-v2 §3): its page closure, the supported binding closure of the bundle it uses (every
// unit when it uses a namespace as a whole), and its atlas definition. The evidence half hashes these.
export function identityInputs(side, screenId) {
  const S = sideOf(side);
  const s = S.screens.find((x) => x.id === screenId);
  if (!s) return null;
  const pg = screenDeps(S, s);
  return { files: [...pg.files].sort(), unbounded: pg.unbounded, bundle: bundleInputs(S, pg), screen: renderDef(S.defs.get(screenId)) };
}

// What one scenario leaf's run depends on (gate-v2 §3): its entry page (the fixture's url) and every page its taps can navigate to,
// as for a screen with atlas steps; the units of the bundle that closure can run (a page aliasing the namespace, e.g. through let,
// anywhere in it means every unit); and, when the fixture opens an atlas screen, that screen's definition. A navigation it can't
// bound, or a page it can reach that is missing, is in `unbounded` (type any): the caller then hashes everything.
// fixture: { url, screen }. null when there is no entry url.
export function leafInputs(side, { url, screen } = {}) {
  if (!url) return null;
  const S = sideOf(side), start = pageOf(url);
  const pg = navClosure(S, start, `the leaf from ${start}`);
  if (pg.missing) pg.unbounded.push({ why: `its entry page ${start} is missing`, type: 'any' });
  return { files: [...pg.files].sort(), unbounded: pg.unbounded, bundle: bundleInputs(S, pg), screen: screen ? S.defs.get(screen) || null : null, pages: pg.pages };
}

// The bundle part of an identity: the exports a closure uses, the units those can run (all when a namespace is used as a whole), and
// the content hash of each unit and of the setup, so a body edit changes exactly the identities whose closure runs that unit.
function bundleInputs(S, pg) {
  const bundle = { all: false, exports: [], units: [], setup: true };
  if (S.shape) {
    const usedAll = Object.values(pg.use).some((u) => u.all);
    bundle.all = usedAll;
    for (const [ns, u] of Object.entries(pg.use)) for (const x of u.names) bundle.exports.push(`${ns}.${x}`);
    bundle.exports.sort();
    // a page that loads the bundle runs its start-up effects whatever it calls: they are part of its identity (eagerUnits)
    const eager = pg.files.has(BUNDLE_JS) ? eagerUnits(S.shape) : { units: [], all: false, why: [] };
    if (eager.all) { bundle.all = true; pg.use = { ...pg.use, [S.namespaces[0] || 'SentriUI']: { all: true, names: new Set(), why: `a start-up effect the analyser can't bound (${eager.why[0]})` } }; }
    bundle.units = bundle.all ? S.shape.iifes.flatMap((f) => [...f.units.keys()].map((n) => `${f.namespace}:${n}`)).sort() : [...new Set([...forwardUnits(S.shape, bundle.exports), ...eager.units])].sort();
    // content hashes, so a body edit changes exactly that unit's evidence (gate-v2 §3); missing: hash the whole bundle
    S.hashes = S.hashes === undefined ? bundleHashes(S.src) : S.hashes;
    if (S.hashes) {
      bundle.unitHashes = Object.fromEntries(bundle.units.map((u) => [u, S.hashes.units[u]]));
      bundle.setupHash = S.hashes.setup;
    }
  } else bundle.all = true;
  bundle.why = Object.values(pg.use).filter((u) => u.all).map((u) => u.why);
  return bundle;
}

// The units a set of exports may run or read: their locals, everything those reference (also across namespaces), and every unit that
// writes a binding one of them reads.
function forwardUnits(shape, exports, seeds = []) {
  const byNs = new Map(shape.iifes.map((f, i) => [f.namespace, i]));
  const done = new Set(), q = [];
  const push = (i, n) => { const k = `${i}:${n}`; if (!done.has(k) && shape.iifes[i].units.has(n)) { done.add(k); q.push([i, n]); } };
  for (const e of exports) { const [ns, x] = e.split('.'); const i = byNs.get(ns); const locals = i === undefined ? '' : shape.iifes[i].exports.get(x) || ''; for (const l of locals.split(',').filter(Boolean)) push(i, l); }
  for (const [i, n] of seeds) push(i, n);
  while (q.length) {
    const [i, n] = q.shift(), f = shape.iifes[i], u = f.units.get(n);
    for (const r of u.refs) { if (f.units.has(r)) push(i, r); if (byNs.has(r)) for (const [, locals] of shape.iifes[byNs.get(r)].exports) for (const l of locals.split(',')) push(byNs.get(r), l); }
    // a unit that writes a top-level binding this one reads (or hands an object binding to a call) shapes what it sees
    for (const [wn, w] of f.units) if ([...w.writes, ...[...w.passed].filter((p) => f.units.get(p)?.object)].some((x) => f.units.has(x) && u.refs.has(x))) push(i, wn);
  }
  return [...done].map((k) => { const [i, n] = k.split(':'); return `${shape.iifes[+i].namespace}:${n}`; }).sort();
}

// What runs on every page that loads the bundle, whichever export it calls (review of #194, 2026-10-17): every top-level constant's
// initialiser (it runs at load: `new Map()`, a call, an object built eagerly) and every setup statement (listeners, alias loops),
// with everything those read or call, through the same graph. Its units belong to the identity of every screen that loads the
// bundle. A start-up effect the graph can't bound (dynamic dispatch in an initialiser or a setup statement) is all of it.
function eagerUnits(shape) {
  if (shape.eager) return shape.eager;
  const byNs = new Map(shape.iifes.map((f, i) => [f.namespace, i]));
  const seeds = [], why = [];
  shape.iifes.forEach((f, i) => {
    for (const [n, u] of f.units) if (u.kind !== 'function') { seeds.push([i, n]); if (u.dyn?.length) why.push(`${f.namespace}:${n}'s initialiser reads ${u.dyn[0]}`); }
    for (const st of f.setup) {
      if (st.dyn?.length) why.push(`${f.namespace}'s setup reads ${st.dyn[0]}`);
      for (const r of st.refs || []) { if (f.units.has(r)) seeds.push([i, r]); if (byNs.has(r)) for (const [, locals] of shape.iifes[byNs.get(r)].exports) for (const l of locals.split(',').filter(Boolean)) seeds.push([byNs.get(r), l]); }
    }
  });
  shape.eager = { units: forwardUnits(shape, [], seeds), all: why.length > 0, why };
  return shape.eager;
}
