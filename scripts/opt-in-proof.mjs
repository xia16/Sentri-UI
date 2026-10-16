// The opt-in proof: when a change touches the design-system bundle only (bundle.js, bundle.css, index.d.ts), prove that every
// existing call renders the same markup and that every CSS change can only match markup no existing call emits. Then the bundle
// files reach the component pages and the features that use the new option, not every screen (gate.md §1, "Opt-in component
// change"). Anything the proof cannot show keeps the full shared gate. Pure functions; scripts/record-calls.mjs records the calls.
import vm from 'node:vm';

// The system files an opt-in change may touch. Tokens, the bare-screen harness and the shared prototype stylesheets are never
// opt-in: they restyle what exists by design.
export const OPT_IN_FILES = [
  'ux/design-system/components/bundle.js',
  'ux/design-system/components/bundle.css',
  'ux/design-system/components/index.d.ts',
];

// ---------- CSS ----------
const squash = (s) => s.replace(/\s+/g, ' ').replace(/\s*([{};:,>+~()])\s*/g, '$1').trim();

// Every rule of a stylesheet, flattened: { media, head, body, key }. @media/@supports/@layer/@container blocks are walked (their
// condition prefixes the rule); any other at-rule (@keyframes, @font-face) is one rule, compared whole.
export function cssRules(text) {
  const src = String(text).replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  (function walk(s, media) {
    let i = 0;
    while (i < s.length) {
      const open = s.indexOf('{', i);
      if (open < 0) break;
      let head = s.slice(i, open);
      head = head.slice(head.lastIndexOf(';') + 1).trim(); // an @import or @charset before the rule is not part of it
      let d = 1, j = open + 1;
      while (j < s.length && d) { if (s[j] === '{') d++; else if (s[j] === '}') d--; j++; }
      const body = s.slice(open + 1, j - 1);
      if (/^@(media|supports|layer|container)\b/i.test(head)) walk(body, (media ? media + ' & ' : '') + squash(head));
      else out.push({ media, head: squash(head), body: squash(body) });
      i = j;
    }
  })(src, '');
  return out.map((r) => ({ ...r, key: `${r.media}|${r.head}{${r.body}}` }));
}

// What a stylesheet change does to the existing rules: removed (a base rule gone or edited), reordered (the base rules no longer
// in base order: the cascade between them changed), and the rules it adds.
export function cssChange(baseText, candText) {
  const b = cssRules(baseText), c = cssRules(candText);
  const bk = new Map(), ck = new Map();
  for (const r of b) bk.set(r.key, (bk.get(r.key) || 0) + 1);
  for (const r of c) ck.set(r.key, (ck.get(r.key) || 0) + 1);
  const removed = [...bk].filter(([k, n]) => (ck.get(k) || 0) < n).map(([k]) => k);
  const kept = c.filter((r) => bk.has(r.key)).map((r) => r.key);
  const reordered = !removed.length && kept.join('\n') !== b.map((r) => r.key).join('\n');
  const added = c.filter((r) => !bk.has(r.key) || (ck.get(r.key) || 0) > (bk.get(r.key) || 0));
  return { removed, reordered, added };
}

// A selector list split at its top-level commas (not the ones inside :is(), :not() …).
export function splitSelectors(head) {
  const out = [];
  let d = 0, cur = '';
  for (const ch of head) {
    if (ch === '(' || ch === '[') d++;
    else if (ch === ')' || ch === ']') d--;
    if (ch === ',' && !d) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// The hooks a selector requires on the element or its ancestors. Functional pseudo-classes are dropped first: a hook inside
// :not() or one branch of :is() is not required (`:not([data-new])` matches everything that exists).
export function hooksOf(selector) {
  let s = selector, prev;
  do { prev = s; s = s.replace(/:{1,2}[\w-]+\([^()]*\)/g, ''); } while (s !== prev);
  const hooks = [];
  for (const m of s.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) hooks.push({ kind: 'class', name: m[1] });
  for (const m of s.matchAll(/#(-?[_a-zA-Z][\w-]*)/g)) hooks.push({ kind: 'id', name: m[1] });
  for (const m of s.matchAll(/\[\s*([\w-]+)\s*(?:(=)\s*("([^"]*)"|'([^']*)'|([^\]\s]+)))?(?:\s*[~|^$*]=\s*(?:"[^"]*"|'[^']*'|[^\]\s]+))?\s*[is]?\s*\]/g)) {
    const value = m[4] ?? m[5] ?? m[6];
    hooks.push(m[2] ? { kind: 'attr', name: m[1], value } : { kind: 'attr', name: m[1] });
  }
  return hooks;
}

const word = (name) => new RegExp(`(?<![\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);

// The values a template expression can write, when it is closed: one string literal, or `cond ? 'a' : 'b'` of two. null: open
// (a variable, a call, anything else), which can write any value.
export function templateValues(expr) {
  const m = String(expr).trim().match(/^(?:[\w.$!()\s&|=<>'"-]+\?\s*)?(['"`])([^'"`$]*)\1\s*(?::\s*(['"`])([^'"`$]*)\3\s*)?$/);
  if (!m) return null;
  if (m[3] === undefined && /\?/.test(expr)) return null; // `cond ? 'a' : open`
  return [m[2], ...(m[4] !== undefined ? [m[4]] : [])];
}

// Is a hook new: can nothing on base carry it? known: { markup (every recorded call's output on base), sources: { file: text }
// (base's ux/ sources and the base bundle) }. A class, an id or a bare attribute is new when its name appears nowhere on base. An
// attribute with a value is new when its name is new, or when no base markup or source writes name="value" and every template
// that builds that attribute (name="${expr}") is closed and cannot write the value. An open template (a variable) can write it.
export function hookIsNew(hook, known) {
  const texts = [known.markup || '', ...Object.values(known.sources || {})];
  if (hook.kind !== 'attr' || hook.value === undefined) return !texts.some((t) => word(hook.name).test(t));
  if (!texts.some((t) => word(hook.name).test(t))) return true;
  const v = hook.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), n = hook.name.replace(/[-]/g, '\\-');
  const literal = new RegExp(`${n}=(\\\\?["'])${v}\\1|${n}=${v}(?![\\w-])`);
  if (texts.some((t) => literal.test(t))) return false;
  const builds = new RegExp(`${n}=\\\\?["']\\$\\{([^{}]*)\\}`, 'g');
  for (const t of Object.values(known.sources || {})) {
    for (const m of t.matchAll(builds)) {
      const vals = templateValues(m[1]);
      if (!vals || vals.includes(hook.value)) return false;
    }
  }
  return true;
}

// The CSS half of the proof: no base rule removed, edited or reordered, and every added rule's every selector requires a new hook.
export function cssProof(baseText, candText, known) {
  const ch = cssChange(baseText, candText), why = [];
  if (ch.removed.length) why.push(`${ch.removed.length} existing rule(s) removed or edited (${ch.removed[0].slice(0, 90)})`);
  if (ch.reordered) why.push('the existing rules changed order (the cascade between them)');
  const loose = [];
  for (const r of ch.added) {
    if (r.head.startsWith('@')) { loose.push(r.head); continue; } // @keyframes, @font-face: global by name
    for (const sel of splitSelectors(r.head)) if (!hooksOf(sel).some((h) => hookIsNew(h, known))) loose.push(r.media ? `${r.media} ${sel}` : sel);
  }
  if (loose.length) why.push(`${loose.length} added selector(s) can match existing markup (no new hook): ${loose.slice(0, 3).join(' · ')}`);
  return { ok: !why.length, why, added: ch.added.length };
}

// ---------- JS ----------
// The api a bundle source exports, loaded alone in a fresh context (no DOM: the string builders need none).
export function loadApi(src, name = 'SentriUI') {
  const sandbox = { console: { log() {}, warn() {}, error() {}, info() {} }, setTimeout, clearTimeout };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'bundle.js', timeout: 10000 });
  return sandbox[name];
}

// The JS half: every recorded call [fn, args] replayed in order through the base bundle and the candidate bundle; each output
// (or thrown message) must be identical. A function the candidate no longer exports is a difference.
export function replayProof(baseSrc, candSrc, calls, name = 'SentriUI') {
  const B = loadApi(baseSrc, name), C = loadApi(candSrc, name);
  const diffs = [];
  const once = (api, fn, args) => {
    if (typeof api[fn] !== 'function') return { gone: true };
    try { return { out: api[fn](...structuredClone(args)) }; } catch (e) { return { threw: String(e && e.message) }; }
  };
  for (const [fn, args] of calls) {
    const b = once(B, fn, args), c = once(C, fn, args);
    if (b.gone) continue; // not a base function: a recorder artefact
    if (JSON.stringify(b) !== JSON.stringify(c)) diffs.push({ fn, args: JSON.stringify(args).slice(0, 160), base: JSON.stringify(b).slice(0, 160), cand: JSON.stringify(c).slice(0, 160) });
  }
  return { ok: !diffs.length, diffs, calls: calls.length };
}

// ---------- the proof ----------
// files: the change's files. base/cand: { js, css } bundle sources. calls: the base corpus. known: as hookIsNew.
// Returns { applies, ok, why, files } — applies is false when the change touches a system file outside OPT_IN_FILES (or none).
export function optInProof({ files, systemFiles, base, cand, calls, known }) {
  const sys = systemFiles || [];
  if (!sys.length || sys.some((f) => !OPT_IN_FILES.includes(f))) return { applies: false, ok: false, why: ['touches a system file an opt-in change may not'], files: [] };
  const why = [];
  if (!calls || !calls.length) why.push('no recorded calls for the base: the defaults cannot be proved');
  else {
    const r = replayProof(base.js, cand.js, calls);
    if (!r.ok) why.push(`${r.diffs.length} existing call(s) render differently (${r.diffs[0].fn}: ${r.diffs[0].base} → ${r.diffs[0].cand})`);
  }
  const c = cssProof(base.css, cand.css, known);
  why.push(...c.why);
  return { applies: true, ok: !why.length, why, files: sys.filter((f) => files.includes(f)), calls: calls ? calls.length : 0, addedRules: c.added };
}
