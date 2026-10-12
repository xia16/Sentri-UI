// The scenario tree's pure parts: walk features/<id>/scenarios.json into executable leaves and check its format.
// No browser, no I/O: scripts/run-scenarios.mjs (the runner) and tests/scenarios-format.test.mjs (npm test) both use it.
// Format: docs/design-workflow/scenarios.md.

export const NODE_TYPES = ['entry', 'state', 'action', 'outcome', 'decision-blocker'];

// A step is a tap (a bare string, or an object with `tap`) or an object with exactly one of these keys.
export const STEP_KINDS = ['tap', 'fill', 'expect', 'wait', 'reload', 'offline', 'advance', 'back', 'device'];
const STEP_EXTRA = { tap: ['hold', 'hard'], fill: ['value'], expect: [] };   // keys a kind may carry beside its own
export const ASSERTION_KINDS = ['expr', 'screen', 'el', 'noClip', 'verb', 'text'];
const ASSERTION_EXTRA = ['says', 'hard', 'in', 'is', 'absent'];
export const DEVICES = ['a', 'b'];
export const GWT_PARTS = ['given', 'when', 'then'];

const UNITS = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
/** "30m" / "2h" / "1d" / "45s" → milliseconds, or null when it is not a duration. */
export function parseDuration(text) {
  const m = /^(\d+(?:\.\d+)?)(s|m|h|d)$/.exec(String(text).trim());
  return m ? Math.round(Number(m[1]) * UNITS[m[2]]) : null;
}

/** Which kind a step is, or null when it is not a known step. */
export function stepKind(step) {
  if (typeof step === 'string') return 'tap';
  if (!step || typeof step !== 'object' || Array.isArray(step)) return null;
  const kinds = STEP_KINDS.filter((k) => k in step);
  return kinds.length === 1 ? kinds[0] : null;
}

const assertionKind = (a) => (a && typeof a === 'object' ? ASSERTION_KINDS.find((k) => k in a) || null : null);

/** The problems in one step (an empty list when it is fine). */
export function checkStep(step, { tapsOnly = false } = {}) {
  const kind = stepKind(step), out = [];
  const show = JSON.stringify(step);
  if (!kind) return [`unknown step ${show}`];
  if (tapsOnly && kind !== 'tap') return [`${kind} step ${show} is not allowed here (setup taps are taps only)`];
  if (typeof step === 'object') {
    for (const k of Object.keys(step)) if (k !== kind && !(STEP_EXTRA[kind] || []).includes(k)) out.push(`step ${show}: unexpected key "${k}" for a ${kind} step`);
  }
  switch (kind) {
    case 'tap': if (typeof (typeof step === 'string' ? step : step.tap) !== 'string' || !(typeof step === 'string' ? step : step.tap)) out.push(`step ${show}: tap needs a control`); if (typeof step === 'object' && 'hold' in step && !(step.hold > 0)) out.push(`step ${show}: hold is milliseconds`); break;
    case 'fill': if (typeof step.fill !== 'string' || !step.fill) out.push(`step ${show}: fill needs a selector`); if (!('value' in step)) out.push(`step ${show}: fill needs a value`); break;
    case 'wait': if (!(step.wait >= 0)) out.push(`step ${show}: wait is milliseconds`); break;
    case 'reload': case 'back': if (step[kind] !== true) out.push(`step ${show}: ${kind} is { "${kind}": true }`); break;
    case 'offline': if (typeof step.offline !== 'boolean') out.push(`step ${show}: offline is true or false`); break;
    case 'advance': if (parseDuration(step.advance) == null) out.push(`step ${show}: advance is a duration like "30m", "2h" or "1d"`); break;
    case 'device': if (!DEVICES.includes(step.device)) out.push(`step ${show}: device is one of ${DEVICES.map((d) => `"${d}"`).join(', ')}`); break;
    case 'expect': {
      const list = [].concat(step.expect);
      if (!list.length) out.push(`step ${show}: expect needs an assertion`);
      for (const a of list) out.push(...checkAssertion(a, 'expect'));
      break;
    }
  }
  return out;
}

export function checkAssertion(a, where) {
  const kind = assertionKind(a);
  if (!kind) return [`${where}: unknown assertion ${JSON.stringify(a)}`];
  const extra = Object.keys(a).filter((k) => k !== kind && !ASSERTION_EXTRA.includes(k) && !(kind === 'verb' && k === 'verb'));
  const own = Object.keys(a).filter((k) => ASSERTION_KINDS.includes(k));
  if (own.length > 1) return [`${where}: assertion ${JSON.stringify(a)} mixes ${own.join(' and ')}`];
  return extra.length ? [`${where}: assertion ${JSON.stringify(a)} has unexpected key "${extra[0]}"`] : [];
}

const SELECTORISH = /data-|\[data|===|=>|\bexpr\b|\bs\.|\bF\.|\.atlas|\bselector\b/;
/** The problems in a leaf's plain given / when / then (empty list when it is fine). */
export function checkGwt(gwt) {
  if (!gwt || typeof gwt !== 'object') return ['no gwt'];
  const out = [];
  for (const p of GWT_PARTS) {
    if (typeof gwt[p] !== 'string' || gwt[p].trim().length < 8) out.push(`gwt.${p} is missing or empty`);
    else if (SELECTORISH.test(gwt[p])) out.push(`gwt.${p} reads like a selector or prototype state: "${gwt[p]}"`);
  }
  for (const k of Object.keys(gwt)) if (!GWT_PARTS.includes(k)) out.push(`gwt has an unexpected key "${k}"`);
  return out;
}

/**
 * Walk the tree into executable leaves.
 * A leaf's run = the reset fixture of its nearest `state` ancestor + the steps of every `action` between them + its own.
 * Returns { leaves, nodeCount, ids, problems, gwtProblems }:
 *  - problems: the tree is malformed (the runner refuses to run; npm test fails);
 *  - gwtProblems: outcomes without a good given / when / then (the runner warns; npm test fails).
 */
export function walkTree(spec) {
  const leaves = [], nodeCount = {}, problems = [], gwtProblems = [], ids = new Set();
  if (!spec || !Array.isArray(spec.tree)) return { leaves, nodeCount, ids, problems: ['no "tree" array'], gwtProblems };
  (function walk(node, path) {
    if (node.type !== 'root') {
      nodeCount[node.type] = (nodeCount[node.type] || 0) + 1;
      if (!NODE_TYPES.includes(node.type)) problems.push(`${node.id || '(no id)'}: unknown node type "${node.type}"`);
      if (!node.id) problems.push(`a ${node.type} node has no id`);
    }
    if (node.id) { if (ids.has(node.id)) problems.push(`duplicate id ${node.id}`); ids.add(node.id); }
    const here = [...path, node], at = node.id || node.type;
    if (node.type === 'state' && node.reset) for (const t of node.reset.taps || []) for (const p of checkStep(t, { tapsOnly: true })) problems.push(`${at}: reset.taps: ${p}`);
    for (const t of node.taps || []) for (const p of checkStep(t)) problems.push(`${at}: ${p}`);
    if (node.type === 'outcome') for (const key of ['visible', 'record']) for (const a of node[key] || []) for (const p of checkAssertion(a, `${at}: ${key}`)) problems.push(p);
    if (node.type === 'outcome' || node.type === 'decision-blocker') {
      const state = [...here].reverse().find((n) => n.type === 'state');
      const from = state ? here.slice(here.indexOf(state) + 1) : here;
      const branch = here.find((n) => n.type === 'entry');
      const taps = from.flatMap((n) => n.taps || []);
      if (node.type === 'outcome' && !(node.authority || []).length) problems.push(`${node.id}: an outcome needs authority (else it is a decision-blocker)`);
      // a pending leaf may still lack a prototype fixture; every leaf that runs needs its reset state
      if (node.type === 'outcome' && node.status !== 'pending' && !state) problems.push(`${node.id}: no state (reset fixture) above it`);
      if (node.type === 'outcome') for (const p of checkGwt(node.gwt)) gwtProblems.push(`${node.id}: ${p}`);
      leaves.push({ node, branch: branch?.id, state, taps, path: here.map((n) => n.id).filter(Boolean) });
    }
    for (const c of node.children || []) walk(c, here);
  })({ type: 'root', children: spec.tree }, []);
  return { leaves, nodeCount, ids, problems, gwtProblems };
}
