// Reach by caller: which exported functions of the design-system bundle a change touches, decided from the parsed bundle (acorn),
// never from a regex. The bundle is a list of IIFEs `(function(root){ … root.<Namespace> = api; })(globalThis)`; inside each, every
// top-level declaration is a unit (a function, or a constant), every other statement is setup (event listeners, alias loops, the
// export lines). A unit that changed taints every unit that references it, through the bundle's own call graph; the exports it
// taints are the functions whose callers are in reach (scripts/gate.mjs, gate.md "Reach by caller"). Whatever this cannot decide
// is `all: true` with the reason: a changed constant or setup statement, a changed wrapper, a name it cannot resolve (dynamic
// dispatch on root/api/a namespace, eval, Function), a taint that reaches setup code (an event listener runs on every page).
import { parse } from './vendor/acorn.mjs';
import { createHash } from 'node:crypto';

// Content hashes for evidence identity (gate-v2 §3): { units: { 'ns:name': sha256 of that unit's source }, setup: sha256 of everything
// else }. Every byte of the bundle is in exactly one of them: a unit's own source (a declarator's for `const a = …, b = …`), or the rest
// (the IIFE wrappers, setup statements, export tables, comments between units, code outside the IIFEs). Only line endings are
// normalised, never whitespace or comments, so any edit counts. null when the bundle can't be read (hash it whole).
export function bundleHashes(src) {
  let shape;
  try { shape = bundleShape(src); } catch { return null; }
  if (shape.problems.length) return null;
  const sha = (t) => createHash('sha256').update(t.replace(/\r\n?/g, '\n')).digest('hex');
  const units = {}, cuts = [];
  for (const f of shape.iifes) for (const [n, u] of f.units) { units[`${f.namespace}:${n}`] = sha(src.slice(u.start, u.end)); cuts.push([u.start, u.end, `${f.namespace}:${n}`]); }
  cuts.sort((a, b) => a[0] - b[0]);
  let rest = '', at = 0;
  for (const [s, e, k] of cuts) { rest += src.slice(at, s) + `\u0000${k}\u0000`; at = e; }
  rest += src.slice(at);
  return { units, setup: sha(rest) };
}

const ROOTISH = new Set(['root', 'globalThis', 'window', 'self', 'api', 'module', 'exports']);

// The methods that change the object they are called on.
const MUTATORS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin', 'set', 'add', 'delete', 'clear']);
// The identifier a member chain starts from (`a.b[c].d` → a), or null.
const rootName = (n) => { while (n && n.type === 'MemberExpression') n = n.object; return n && n.type === 'Identifier' ? n.name : null; };

// Every Identifier a node reads, over-approximated: property names of `a.b` and object keys are left out (they are names, not
// references); a shorthand `{a}` is a reference. Shadowing is ignored, so an edge may be extra, never missing.
// writes: the names it may change: the root of an assignment, ++/--, delete, a mutating method's object, Object.assign's target.
// passed: the bare names it hands to a call (the callee may change them).
function references(node, out = new Set(), dyn = [], writes = new Set(), passed = new Set()) {
  (function walk(n, parent, key) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'AssignmentExpression') { const r = rootName(n.left); if (r) writes.add(r); }
    if (n.type === 'UpdateExpression') { const r = rootName(n.argument); if (r) writes.add(r); }
    if (n.type === 'UnaryExpression' && n.operator === 'delete') { const r = rootName(n.argument); if (r) writes.add(r); }
    if (n.type === 'CallExpression' || n.type === 'NewExpression') {
      const c = n.callee;
      if (c.type === 'MemberExpression' && !c.computed && MUTATORS.has(c.property.name)) { const r = rootName(c.object); if (r) writes.add(r); }
      if (c.type === 'MemberExpression' && !c.computed && /^(Object|Reflect)$/.test(c.object.name || '') && /^(assign|defineProperty|defineProperties|set|setPrototypeOf|deleteProperty)$/.test(c.property.name)) { const r = rootName(n.arguments[0]); if (r) writes.add(r); }
      for (const a of n.arguments) if (a.type === 'Identifier') passed.add(a.name); else if (a.type === 'SpreadElement' && a.argument.type === 'Identifier') passed.add(a.argument.name);
    }
    if (n.type === 'Identifier') {
      const isProp = (parent?.type === 'MemberExpression' && key === 'property' && !parent.computed)
        || (parent?.type === 'Property' && key === 'key' && !parent.computed && !parent.shorthand)
        || (parent?.type === 'MethodDefinition' && key === 'key' && !parent.computed)
        || parent?.type === 'LabeledStatement' || parent?.type === 'BreakStatement' || parent?.type === 'ContinueStatement';
      if (!isProp) out.add(n.name);
      if (n.name === 'eval' || n.name === 'Function') dyn.push(n.name);
    }
    // `this` in a part can be the export table (api.row() calls row with this = api): a call the graph cannot follow
    if (n.type === 'ThisExpression') dyn.push('this');
    // `root.SentriIcons`, `globalThis.SentriUI`: a namespace read through the global object is a reference to that namespace
    if (n.type === 'MemberExpression' && !n.computed && n.object.type === 'Identifier' && ROOTISH.has(n.object.name) && n.property.type === 'Identifier') out.add(n.property.name);
    if (n.type === 'MemberExpression' && n.computed) {
      const o = n.object;
      if ((o.type === 'Identifier' && ROOTISH.has(o.name)) || o.type === 'ThisExpression' || (o.type === 'MemberExpression' && !o.computed && o.object.type === 'Identifier' && ROOTISH.has(o.object.name)))
        dyn.push(`${o.type === 'Identifier' ? o.name : o.type === 'ThisExpression' ? 'this' : o.object.name + '.' + o.property.name}[…]`);
    }
    for (const k of Object.keys(n)) {
      if (k === 'start' || k === 'end' || k === 'loc' || k === 'range') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach((c) => walk(c, n, k)); else if (v && typeof v.type === 'string') walk(v, n, k);
    }
  })(node, null, null);
  return { refs: out, dyn, writes, passed };
}

const isFn = (init) => !!init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression');

// The bundle's shape: { iifes: [{ namespace, params, units: Map(name -> { kind, text, refs, dyn }), setup: [{ text, refs, dyn }],
// exports: Map(exportName -> localName) }], outside: [text of top-level statements that are not an IIFE], problems: [] }.
export function bundleShape(src) {
  const ast = parse(src, { ecmaVersion: 'latest', sourceType: 'script' });
  const text = (n) => src.slice(n.start, n.end);
  const shape = { iifes: [], outside: [], problems: [] };
  for (const st of ast.body) {
    const call = st.type === 'ExpressionStatement' ? st.expression : null;
    const fn = call?.type === 'CallExpression' ? call.callee : null;
    if (!fn || !(fn.type === 'FunctionExpression' || fn.type === 'ArrowFunctionExpression') || fn.body.type !== 'BlockStatement') { shape.outside.push(text(st)); continue; }
    const iife = { namespace: null, params: fn.params.map(text).join(',') + '|' + call.arguments.map(text).join(','), units: new Map(), setup: [], exports: new Map() };
    let apiName = null;
    for (const s of fn.body.body) {
      if (s.type === 'FunctionDeclaration') {
        const r = references(s.body);
        for (const p of s.params) references(p, r.refs, r.dyn, r.writes, r.passed);
        if (iife.units.has(s.id.name)) shape.problems.push(`${s.id.name} is declared twice`);
        iife.units.set(s.id.name, { kind: 'function', text: text(s), start: s.start, end: s.end, ...r });
        continue;
      }
      if (s.type === 'VariableDeclaration') {
        for (const d of s.declarations) {
          if (d.id.type !== 'Identifier') { shape.problems.push(`a destructuring declaration (${text(d).slice(0, 40)})`); continue; }
          const r = d.init ? references(d.init) : { refs: new Set(), dyn: [], writes: new Set(), passed: new Set() };
          // the export table: const api = Object.freeze({ name, other: local, … })
          const obj = d.init?.type === 'CallExpression' && d.init.arguments[0]?.type === 'ObjectExpression' ? d.init.arguments[0] : d.init?.type === 'ObjectExpression' ? d.init : null;
          if (obj && /^(api|exports)$/.test(d.id.name)) {
            apiName = d.id.name;
            for (const p of obj.properties) {
              if (p.type !== 'Property' || p.computed) { shape.problems.push(`an export the graph cannot name (${text(p).slice(0, 40)})`); continue; }
              // an export is the units its value references: `measure`, or `paths: Object.freeze(paths)`
              const v = p.value.type === 'Identifier' ? { refs: new Set([p.value.name]), dyn: [] } : references(p.value);
              if (v.dyn.length) shape.problems.push(`an export reads ${v.dyn[0]}`);
              iife.exports.set(p.key.name ?? p.key.value, [...v.refs].sort().join(','));
            }
            iife.exportText = text(d);
            continue;
          }
          if (iife.units.has(d.id.name)) shape.problems.push(`${d.id.name} is declared twice`);
          iife.units.set(d.id.name, { kind: isFn(d.init) ? 'function' : 'constant', object: !!d.init && /^(ObjectExpression|ArrayExpression|NewExpression|CallExpression)$/.test(d.init.type), text: `${s.kind} ${text(d)}`, start: d.start, end: d.end, ...r });
        }
        continue;
      }
      const r = references(s);
      const ns = s.type === 'ExpressionStatement' && s.expression.type === 'AssignmentExpression' && s.expression.left.type === 'MemberExpression'
        && !s.expression.left.computed && s.expression.left.object.type === 'Identifier' && s.expression.right.type === 'Identifier' && s.expression.right.name === apiName
        ? s.expression.left.property.name : null;
      if (ns) { iife.namespace = ns; iife.setup.push({ text: text(s), refs: new Set(), dyn: [], writes: new Set(), passed: new Set(), exportLine: true }); continue; }
      iife.setup.push({ text: text(s), ...r });
    }
    shape.iifes.push(iife);
  }
  return shape;
}

// What a bundle change touches: { all, why, exports: ['SentriUI.measure', …], units: ['SentriUI:fieldId', …] }.
// exports are the exported functions whose behaviour may differ (changed, removed, or tainted through the graph).
export function bundleChange(baseSrc, candSrc) {
  let B, C;
  try { B = bundleShape(baseSrc); C = bundleShape(candSrc); } catch (e) { return { all: true, why: [`the bundle does not parse (${e.message})`], exports: [], units: [] }; }
  const why = [];
  const all = (w) => { why.push(w); return { all: true, why, exports: [], units: [] }; };
  if (B.problems.length || C.problems.length) return all(`the graph cannot read the bundle: ${[...B.problems, ...C.problems][0]}`);
  if (B.outside.join('\n') !== C.outside.join('\n')) return all('top-level code outside the IIFEs changed');
  if (B.iifes.length !== C.iifes.length) return all(`the bundle has ${C.iifes.length} IIFEs, ${B.iifes.length} on base`);
  const dynamic = [];
  for (const side of [B, C]) for (const f of side.iifes) {
    for (const [n, u] of f.units) if (u.dyn.length) dynamic.push(`${f.namespace}:${n} uses ${u.dyn[0]}`);
    for (const s of f.setup) if (s.dyn.length) dynamic.push(`${f.namespace} setup uses ${s.dyn[0]}`);
  }
  if (dynamic.length) return all(`dynamic dispatch the graph cannot resolve: ${dynamic[0]}`);

  const seeds = []; // [iifeIndex, unitName]
  for (let i = 0; i < B.iifes.length; i++) {
    const b = B.iifes[i], c = C.iifes[i];
    if (b.namespace !== c.namespace || !b.namespace) return all(`IIFE ${i + 1} exports ${c.namespace || 'nothing it names'}, ${b.namespace || 'nothing it names'} on base`);
    if (b.params !== c.params) return all(`the ${b.namespace} wrapper changed`);
    if (b.setup.map((s) => s.text).join('\n') !== c.setup.map((s) => s.text).join('\n')) return all(`${b.namespace}'s setup code changed (event listeners, alias loops or the export lines)`);
    // every top-level binding is a unit: a function, a constant, an object built at start-up. A changed one is a seed.
    for (const [name, u] of b.units) {
      const v = c.units.get(name);
      if (v && v.text === u.text) continue;
      seeds.push([i, name]);
    }
    // an export pointed at other units, or gone: callers of that export are affected
    for (const [e, locals] of b.exports) if (c.exports.get(e) !== locals) for (const l of locals.split(',')) seeds.push([i, l]);
  }
  // taint through references: a unit that references a tainted unit is tainted, in the same IIFE, or across IIFEs through
  // `root.<Namespace>` / `<Namespace>` (a tainted export of one namespace taints every unit of another that names it)
  const tainted = new Set(seeds.map(([i, n]) => `${i}:${n}`));
  const nsTainted = new Set();
  for (let changed = true; changed;) {
    changed = false;
    C.iifes.forEach((f, i) => {
      const exportedTaint = [...f.exports].some(([, locals]) => locals.split(',').some((l) => tainted.has(`${i}:${l}`)));
      if (exportedTaint && !nsTainted.has(f.namespace)) { nsTainted.add(f.namespace); changed = true; }
    });
    const scan = (side) => side.iifes.forEach((f, i) => {
      for (const [n, u] of f.units) {
        const k = `${i}:${n}`;
        if (!tainted.has(k) && [...u.refs].some((r) => (f.units.has(r) && tainted.has(`${i}:${r}`)) || nsTainted.has(r))) { tainted.add(k); changed = true; }
        // a tainted unit that writes a top-level binding (or hands an object one to a call) taints that binding, and so its readers
        if (tainted.has(k)) for (const w of [...u.writes, ...[...u.passed].filter((p) => f.units.get(p)?.object)]) {
          const wk = `${i}:${w}`;
          if (w !== n && f.units.has(w) && !tainted.has(wk)) { tainted.add(wk); changed = true; }
        }
      }
    });
    scan(B); scan(C);
  }
  // a taint that setup code reaches runs on every page (an event listener, the alias loop)
  for (const side of [B, C]) side.iifes.forEach((f, i) => {
    for (const s of f.setup) if ([...s.refs].some((r) => (f.units.has(r) && tainted.has(`${i}:${r}`)) || nsTainted.has(r))) why.push(`${f.namespace}'s setup code calls a changed function`);
  });
  if (why.length) return { all: true, why: [why[0]], exports: [], units: [] };
  const exports = new Set();
  const hit = (i, locals) => locals.split(',').some((l) => tainted.has(`${i}:${l}`));
  C.iifes.forEach((f, i) => { for (const [e, locals] of f.exports) if (hit(i, locals)) exports.add(`${f.namespace}.${e}`); });
  B.iifes.forEach((f, i) => { for (const [e, locals] of f.exports) if (hit(i, locals) || C.iifes[i].exports.get(e) !== locals) exports.add(`${f.namespace}.${e}`); });
  return { all: false, why: [`${seeds.length} changed binding(s) taint ${exports.size} export(s)`], exports: [...exports].sort(), units: [...tainted].map((k) => { const [i, n] = k.split(':'); return `${B.iifes[+i].namespace}:${n}`; }).sort() };
}

// Everything of a bundle the tainted units are not: the other units, the setup and the export tables, as one text. A hook found
// here can be emitted by something the change did not touch. tainted: ['SentriUI:measure', …] (bundleChange's units).
export function bundleRest(src, tainted = []) {
  const t = new Set(tainted), parts = [];
  const shape = bundleShape(src);
  parts.push(...shape.outside);
  for (const f of shape.iifes) {
    for (const [n, u] of f.units) if (!t.has(`${f.namespace}:${n}`)) parts.push(u.text);
    for (const s of f.setup) parts.push(s.text);
    if (f.exportText) parts.push(f.exportText);
  }
  return parts.join('\n');
}

// The screens a bundle change reaches by caller. recordings: { key, screens: { id: { ok, fns: ['SentriUI.measure', …] } } },
// made on base after each screen's preset and steps; ids: base and candidate screen ids. A screen with no recording, a failed one,
// or one from another key is in reach, as is a screen only one side has.
export function screensByCaller({ change, recordings, key, baseIds, candIds }) {
  if (change.all) return { all: true, screens: [], why: change.why };
  const fresh = recordings && recordings.key === key ? recordings.screens || {} : {};
  const hit = new Set(change.exports), screens = new Set(), why = [];
  const unrecorded = [], calling = [];
  for (const id of baseIds) {
    const r = fresh[id];
    if (!r || !r.ok) { screens.add(id); unrecorded.push(id); continue; }
    if (r.fns.some((f) => hit.has(f))) { screens.add(id); calling.push(id); }
  }
  const b = new Set(baseIds), c = new Set(candIds);
  const sides = [...candIds.filter((id) => !b.has(id)), ...baseIds.filter((id) => !c.has(id))];
  for (const id of sides) screens.add(id);
  if (calling.length) why.push(`${calling.length} screen(s) call ${change.exports.slice(0, 3).join(', ')}${change.exports.length > 3 ? ' …' : ''}`);
  if (unrecorded.length) why.push(`${unrecorded.length} screen(s) have no current recording`);
  if (sides.length) why.push(`${sides.length} screen(s) only one side has`);
  return { all: false, screens: [...screens].sort(), why };
}
