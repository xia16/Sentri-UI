// Reach by rule: which component pages a bundle.css edit can move, decided from the stylesheet's rules and the markup each page can
// make, never from a run. A rule can style a page only when every class its selector requires can occur in that page's markup, and
// the classes a page can carry are the class-shaped words of everything that draws it: the variant file, what it loads, and the
// bundle units its scripts can run (static-reach.mjs variantInputs). A word that ends at a string boundary can be continued by
// concatenation ('st-toast--' + tone), so it stands for every class it starts; one that starts at a boundary, for every class it ends.
// Whatever this cannot decide reaches every page: a rule with no class to require (elements, :root, attribute-only selectors, *), an
// at-rule other than @media/@supports/@layer/@container blocks, a selector it can't read, a stylesheet it can't split, a page whose
// loads can't be bounded. It narrows the gate's scope (which component pages and state checks a shared change keeps), never an
// evidence identity: every identity still hashes bundle.css whole (gate-v2 §3).
// The proof is scripts/css-reach-proof.mjs: on every component page, every rule that matches the rendered DOM is one this says may.

const BLOCKS = /^@(media|supports|layer|container|scope|document)\b/i;

// Comments become one marker, so a comment-only edit changes nothing and `a/**/b` stays apart from `ab`.
function stripComments(src) {
  let out = '', i = 0, q = null;
  while (i < src.length) {
    const c = src[i];
    if (q) { out += c; if (c === '\\') { out += src[i + 1] ?? ''; i += 2; continue; } if (c === q) q = null; i++; continue; }
    if (c === '"' || c === "'") { q = c; out += c; i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); out += '\u0000'; i = e < 0 ? src.length : e + 2; continue; }
    out += c; i++;
  }
  return out;
}

// The end of the block opened at src[open] === '{' (index of its '}'), or -1.
function blockEnd(src, open) {
  let depth = 0, q = null;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return -1;
}

// Split at top-level commas (outside (), [] and strings).
export function splitList(s) {
  const out = [];
  let depth = 0, q = null, at = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) { out.push(s.slice(at, i)); at = i + 1; }
  }
  out.push(s.slice(at));
  return out.map((x) => x.trim()).filter(Boolean);
}

// The classes a selector requires of the elements it matches (all of them must occur in the document), or null when it requires
// none the analyser can name: then it can match any page. The arguments of functional pseudo-classes (:not, :is, :where, :has,
// :nth-child(… of …)) and attribute selectors are dropped, so what is left is required (dropping only ever widens the match).
export function requiredClasses(selector) {
  let s = String(selector);
  if (/\\|\u0000/.test(s)) return null;
  // drop attribute selectors and strings first, then functional pseudo-class arguments, innermost first
  s = s.replace(/\[(?:[^\]"']|"[^"]*"|'[^']*')*\]/g, ' ');
  for (let prev = null; prev !== s;) { prev = s; s = s.replace(/:{1,2}[\w-]+\([^()]*\)/g, ' '); }
  if (/[()[\]]/.test(s)) return null;
  const classes = [...s.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]);
  return classes.length ? [...new Set(classes)] : null;
}

// The stylesheet as units: [{ key, kind, selectors: [string] | null, reaches: 'all' | 'classes' | 'keyframes', name?, why? }].
// key is the unit's text with its enclosing at-rule preludes (so moving a rule into another @media changes it). A style rule is one
// unit; one with rules nested in it reaches every page. @keyframes is one unit named by its animation name; every other at-rule
// (@import, @font-face, @property, a @layer statement…) reaches every page. problems: text it couldn't split.
export function cssUnits(text) {
  const src = stripComments(String(text || '').replace(/\r\n?/g, '\n'));
  const units = [], problems = [];
  (function walk(from, to, context) {
    let i = from;
    while (i < to) {
      while (i < to && /[\s\u0000;]/.test(src[i])) i++;
      if (i >= to) break;
      // the prelude runs to the first top-level '{' or ';'
      let j = i, q = null, depth = 0;
      for (; j < to; j++) {
        const c = src[j];
        if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; }
        if (c === '"' || c === "'") q = c;
        else if (c === '(' || c === '[') depth++;
        else if (c === ')' || c === ']') depth--;
        else if (depth === 0 && (c === '{' || c === ';' || c === '}')) break;
      }
      const prelude = src.slice(i, j).trim();
      if (j >= to || src[j] === '}') { problems.push(`stray text: ${prelude.slice(0, 40)}`); break; }
      if (src[j] === ';') {
        units.push({ key: context + prelude + ';', kind: 'statement', selectors: null, reaches: 'all', why: `${prelude.slice(0, 40)}` });
        i = j + 1; continue;
      }
      const end = blockEnd(src, j);
      if (end < 0 || end > to) { problems.push(`an unclosed block: ${prelude.slice(0, 40)}`); break; }
      const body = src.slice(j + 1, end);
      if (prelude.startsWith('@')) {
        if (BLOCKS.test(prelude)) {
          // the block itself is a unit that styles nothing, so an empty `@media x{}` still ends the stylesheet's head (@import)
          units.push({ key: `${context}${prelude.replace(/\s+/g, ' ')}{`, kind: 'group', selectors: [], reaches: 'classes' });
          walk(j + 1, end, `${context}${prelude.replace(/\s+/g, ' ')}{`);
        }
        else {
          const kf = /^@(?:-webkit-)?keyframes\s+([\w-]+)$/i.exec(prelude);
          units.push({ key: `${context}${prelude}{${body}}`, kind: 'at-rule', selectors: null, reaches: kf ? 'keyframes' : 'all', ...(kf ? { name: kf[1] } : {}), why: prelude.slice(0, 40) });
        }
      } else {
        // a rule with rules nested in it reaches every page: a nested selector need not require the outer one (`:is(&, .x)`)
        const nested = /[{}]/.test(body.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, ''));
        units.push({ key: `${context}${prelude}{${body}}`, kind: 'rule', selectors: splitList(prelude), reaches: nested ? 'all' : 'classes', ...(nested ? { why: `${prelude.slice(0, 40)} has nested rules` } : {}) });
      }
      i = end + 1;
    }
  })(0, src.length, '');
  return { units, problems };
}

// The units of base and candidate that differ: those outside a longest common subsequence of the two unit lists (by key). A rule that
// moved is in it on one side, so the elements whose cascade the move can change (those it matches) are in its reach.
const HEAD = /^@(charset|import|layer)\b[^{]*;$/i;
export function cssChange(baseText, candText) {
  const B = cssUnits(baseText), C = cssUnits(candText);
  if (B.problems.length || C.problems.length) return { all: true, why: [`the stylesheet can't be split into rules: ${[...B.problems, ...C.problems][0]}`], units: [] };
  // an @import counts only before every other rule (after @charset and @layer statements): a rule added before it, or one anywhere
  // the analyser can't place, turns it on or off for every page
  const head = (side) => { const i = side.units.findIndex((u) => !HEAD.test(u.key)); return i < 0 ? side.units.length : i; };
  const late = (side) => side.units.slice(head(side)).some((u) => /^[^\w{]*@import\b/i.test(u.key));
  if (late(B) || late(C) || head(B) !== head(C)) return { all: true, why: ['an @import is not (or no longer) at the head of the stylesheet'], units: [] };
  const a = B.units, b = C.units, n = a.length, m = b.length;
  // trim the common head and tail, then LCS on the middle
  let s = 0; while (s < n && s < m && a[s].key === b[s].key) s++;
  let e = 0; while (e < n - s && e < m - s && a[n - 1 - e].key === b[m - 1 - e].key) e++;
  const A = a.slice(s, n - e), Bm = b.slice(s, m - e);
  const L = Array.from({ length: A.length + 1 }, () => new Uint32Array(Bm.length + 1));
  for (let x = A.length - 1; x >= 0; x--) for (let y = Bm.length - 1; y >= 0; y--) L[x][y] = A[x].key === Bm[y].key ? L[x + 1][y + 1] + 1 : Math.max(L[x + 1][y], L[x][y + 1]);
  const changed = [];
  let x = 0, y = 0;
  while (x < A.length && y < Bm.length) {
    if (A[x].key === Bm[y].key) { x++; y++; } else if (L[x + 1][y] >= L[x][y + 1]) changed.push({ side: 'base', ...A[x++] }); else changed.push({ side: 'cand', ...Bm[y++] });
  }
  while (x < A.length) changed.push({ side: 'base', ...A[x++] });
  while (y < Bm.length) changed.push({ side: 'cand', ...Bm[y++] });
  // a changed @keyframes reaches what every rule naming it reaches (on either side), and any page whose markup names it
  const named = (name) => [...a, ...b].filter((u) => u.kind === 'rule' && new RegExp(`(?<![\\w-])${name}(?![\\w-])`).test(u.key.slice(u.key.indexOf('{'))));
  const out = [];
  for (const u of changed) {
    if (u.reaches === 'keyframes') { const users = named(u.name); out.push({ ...u, selectors: [...new Set(users.flatMap((r) => r.selectors))], users: users.length }); }
    else out.push(u);
  }
  const all = out.find((u) => u.reaches === 'all' || (u.reaches === 'classes' && u.selectors.some((sel) => !requiredClasses(sel))) || (u.reaches === 'keyframes' && u.selectors.some((sel) => !requiredClasses(sel))));
  if (all) return { all: true, why: [`a changed rule can match any page: ${(all.reaches === 'classes' ? all.selectors.find((sel) => !requiredClasses(sel)) : all.why || all.name).slice(0, 60)}`], units: out };
  return { all: false, why: [`${out.length} changed rule(s)`], units: out };
}

// What markup a page can make, as class-shaped words (lowercased): exact words, words that may be continued (prefixes) and words
// that may be preceded (suffixes) by concatenation. A word written as a selector or a property (`.name`) is left out: reading a
// class makes none. texts: every text that draws the page.
const STEM = 3;
const BOUNDARY_AFTER = /^(?:['"`]|\$\{)/, BOUNDARY_BEFORE = /(?:['"`]|\})$/;
export function markupWords(texts) {
  const exact = new Set(), prefixes = new Set(), suffixes = new Set();
  for (const t of texts) {
    const s = String(t || '');
    for (const m of s.matchAll(/-?[A-Za-z_][\w-]*|[\w-]+/g)) {
      const w = m[0].toLowerCase(), at = m.index, end = at + m[0].length;
      // `.name` reads a class (querySelector, closest, matches, a property): it makes none
      if (s[at - 1] === '.') continue;
      exact.add(w);
      if (w.length >= STEM && BOUNDARY_AFTER.test(s.slice(end, end + 2))) prefixes.add(w);
      if (w.length >= STEM && BOUNDARY_BEFORE.test(s.slice(Math.max(0, at - 1), at))) suffixes.add(w);
    }
  }
  return { exact, prefixes: [...prefixes], suffixes: [...suffixes] };
}
export function canCarry(words, cls) {
  const c = cls.toLowerCase();
  return words.exact.has(c) || words.prefixes.some((p) => c.startsWith(p)) || words.suffixes.some((x) => c.endsWith(x));
}

// May this changed unit style a page whose markup is `words`? A keyframes unit also reaches a page whose markup names it.
export function unitMayReach(unit, words) {
  if (unit.reaches === 'all') return true;
  if (unit.reaches === 'keyframes' && words.exact.has(String(unit.name).toLowerCase())) return true;
  return unit.selectors.some((sel) => { const req = requiredClasses(sel); return !req || req.every((c) => canCarry(words, c)); });
}

// The texts that draw a component page on one side: every file of its closure but the bundle (inputs: static-reach.mjs
// variantInputs), and of the bundle the units it can run, every setup statement and export table and whatever sits outside the
// IIFEs (the whole bundle when the closure uses a namespace whole, or the bundle can't be read). null, so the page is styled by any
// rule, when its closure makes a load it can't bound that could bring markup (anything but an image or a stylesheet), or a file of
// it can't be read. read(file) -> its text or null.
export function variantTexts({ inputs, read, shape, bundleSrc, bundle = 'ux/design-system/components/bundle.js' }) {
  if (inputs.unbounded.some((u) => u.type !== 'media' && u.type !== 'style')) return null;
  const texts = [];
  for (const f of inputs.files) { if (f === bundle) continue; const t = read(f); if (t == null) return null; texts.push(t); }
  if (inputs.bundle.all || !shape) { texts.push(bundleSrc); return texts; }
  const runs = new Set(inputs.bundle.units);
  texts.push(...shape.outside);
  for (const f of shape.iifes) {
    for (const [n, u] of f.units) if (runs.has(`${f.namespace}:${n}`)) texts.push(u.text);
    for (const s of f.setup) texts.push(s.text);
    if (f.exportText) texts.push(f.exportText);
  }
  return texts;
}
