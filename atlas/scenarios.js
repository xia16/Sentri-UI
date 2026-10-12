/* A feature's Scenarios view: its scenario tree as the runner reads it (features/<id>/scenarios.json), drawn from
   atlas.json's feature.scenarios (SCHEMA.md, "Scenarios"). Branches (entry points) → states (where every leaf below
   starts) → actions → outcomes. Each outcome carries its last run's result; colour only where it means something:
   a failure is red, an open question amber, a pass plain ink. A run result is an agent's, never an approval.
   Branches start folded to one line with their tally; a result filter or a search opens the paths that match.
   Clicking a state shows the screen it starts on in the docked phone. */
'use strict';

const SCN = {
  fail: { word: 'Fail', glyph: '✕', title: 'Failed on the last run' },
  question: { word: 'Open question', glyph: '?', title: 'A decision-blocker: an open question for the owner, never run' },
  blocked: { word: 'Blocked', glyph: '!', title: 'Ran, but a language could not be rendered: not counted as covered' },
  pending: { word: 'Pending', glyph: '', title: 'The prototype cannot run this leaf yet' },
  'not-run': { word: 'Not run', glyph: '–', title: 'Added after the last run' },
  pass: { word: 'Pass', glyph: '✓', title: 'Passed on the last run (an agent run, not an approval)' },
};
const SCN_ORDER = ['fail', 'question', 'blocked', 'pending', 'not-run', 'pass'];
const scnKind = (n) => (n.type === 'decision-blocker' ? 'question' : SCN[n.result] ? n.result : 'not-run');
const scnGlyph = (k) => `<i class="rg r-${k}" title="${esc(SCN[k].title)}" aria-label="${esc(SCN[k].word)}">${SCN[k].glyph}</i>`;
const scnLeaf = (n) => n.type === 'outcome' || n.type === 'decision-blocker';
const scnLeaves = (n) => (scnLeaf(n) ? [n] : (n.children || []).flatMap(scnLeaves));
const scnTitle = (id) => { const t = String(id).replace(/[-_.]+/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); };
const scnDate = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };

/* gwt: { given, when, then } (each a string or a list), or a list of lines, or one line */
function scnGwt(g) {
  if (!g) return '';
  const val = (v) => (Array.isArray(v) ? v.map((x) => esc(x)).join('<br>') : esc(v));
  if (typeof g === 'string' || Array.isArray(g)) return `<div class="gwt"><span class="gk">Test</span><span>${val(g)}</span></div>`;
  const rows = [['Given', g.given], ['When', g.when], ['Then', g.then]].filter(([, v]) => v && String(v).trim());
  return rows.length ? `<div class="gwt">${rows.map(([k, v]) => `<span class="gk">${k}</span><span>${val(v)}</span>`).join('')}</div>` : '';
}
const scnSrc = (a) => `<li><span class="sk">${esc(a.src || '')}${a.at ? ` · ${esc(a.at)}` : ''}</span>${a.says ? ` <q>${esc(a.says)}</q>` : ''}</li>`;

function scenariosView(f, opts = {}) {
  const sc = f.scenarios || {}, tree = sc.tree;
  const page = el('<div class="scn"></div>');
  const notSupported = () => {
    const ns = sc.notSupported;
    if (!ns || !(ns.items || []).length) return el(`<p class="scn-foot">No not-supported list yet: the scenario framework’s cut (step 2) writes it into the PRD’s <b>Not supported</b> section.</p>`);
    const g = el(`<section class="scn-branch ns" data-open="${ns.items.length <= 8}"><button class="bh" aria-expanded="${ns.items.length <= 8}"><span class="caret">›</span><span class="bn">Not supported</span><span class="bl">Deliberately left out, so nobody builds or tests it · ${esc(ns.source.split('/').pop())}</span><span class="tally"><span class="tn">${ns.items.length}</span></span></button><ul class="nslist">${ns.items.map((x) => `<li><b>${esc(x.what)}</b>${x.why ? `<span>${esc(x.why)}</span>` : ''}</li>`).join('')}</ul></section>`);
    const b = g.querySelector('.bh'); b.onclick = () => { const on = g.dataset.open !== 'true'; g.dataset.open = on; b.setAttribute('aria-expanded', on); };
    return g;
  };
  if (!tree) {
    const step = sc.treeDoc // one line: what is missing, and the framework step that writes it
      ? `needs step 7 of the scenario framework, the executable leaves in <code>features/${esc(f.id)}/scenarios.json</code>`
      : `needs the scenario framework from step 3, the scenario tree, to its leaves in <code>features/${esc(f.id)}/scenarios.json</code>`;
    page.append(el(`<p class="scn-empty"><b>No scenarios yet:</b> ${step}.</p>`));
    if (sc.notSupported) page.append(notSupported());
    return { el: page, firstState: () => null };
  }

  const all = tree.flatMap(scnLeaves), count = (k) => all.filter((n) => scnKind(n) === k).length;
  const failing = tree.filter((b) => scnLeaves(b).some((n) => scnKind(n) === 'fail')).map((b) => b.id);
  const st = { kind: '', q: '', open: new Set(failing.length ? failing : tree.slice(0, 1).map((b) => b.id)), leaf: new Set(), state: null }; // the failing branches open, else the first: the tree shows at once, the rest fold to a line each
  const run = sc.run;
  const langs = (run?.langs || []).map((l) => l.toUpperCase());
  const runLine = run
    ? `Agent run ${esc(scnDate(run.ran))} on <code>${esc(run.commit)}</code>${run.dirty ? ' with uncommitted changes' : ''} · ${esc(langs.join(', ') || '—')} at ${esc((run.widths || []).join(' and '))} px${langs.length && !langs.includes('ZH') ? ' · Chinese not run' : ''} · a test result, not an approval`
    : 'Never run: <code>node scripts/run-scenarios.mjs ' + esc(f.id) + '</code> writes the results';
  const bar = el(`<div class="scn-bar"><div class="bkbar"><button class="bkc" data-k="" aria-pressed="true"><b>${all.length}</b> All</button>${SCN_ORDER.filter((k) => count(k) || k === 'fail').map((k) => `<button class="bkc" data-k="${k}" aria-pressed="false"${count(k) ? '' : ' disabled'}>${scnGlyph(k)}<b>${count(k)}</b> ${SCN[k].word}${k === 'question' && count(k) !== 1 ? 's' : ''}</button>`).join('')}<input class="search" type="search" placeholder="Search scenarios" aria-label="Search scenarios"><button class="scn-all" data-all>Expand all</button></div><p class="scn-run">${runLine}</p></div>`);
  const body = el('<div class="scn-tree"></div>');
  page.append(bar, body);

  const matches = (n) => (!st.kind || scnKind(n) === st.kind) && (!st.q || JSON.stringify([n.id, n.label, n.tree, n.question, n.gwt || '']).toLowerCase().includes(st.q));
  const filtering = () => !!(st.kind || st.q);
  /* a node is drawn when it is a matching leaf or leads to one */
  const keep = (n) => (scnLeaf(n) ? matches(n) : (n.children || []).some(keep));

  const leafRow = (n) => {
    const k = scnKind(n), open = st.leaf.has(n.id);
    const tags = (n.hard || []).map((h) => `<span class="htag">${esc(h.replace(/-/g, ' '))}</span>`).join('');
    const detail = [];
    if (n.gwt) detail.push(scnGwt(n.gwt));
    if (n.failures) detail.push(`<div class="why fail"><b>Failed</b><ul>${n.failures.map((x) => `<li>${esc(x.what)}${x.got !== '' ? ` — got <code>${esc(x.got)}</code>` : ''} <span class="muted">· ${esc(x.runs.join(', '))}</span></li>`).join('')}</ul></div>`);
    if (n.notes) detail.push(`<div class="why"><b>Blocked</b><ul>${n.notes.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`);
    if (k === 'pending') detail.push(`<div class="why"><b>Pending</b><span>${esc(n.why || 'the prototype cannot run it yet')}</span></div>`);
    if (k === 'not-run') detail.push('<div class="why"><b>Not run</b><span>added after the last run</span></div>');
    const srcs = n.type === 'decision-blocker' ? n.sources : n.authority;
    if ((srcs || []).length) detail.push(`<div class="srcs"><b>${n.type === 'decision-blocker' ? 'Sources that disagree or are silent' : 'Authority'}</b><ul>${srcs.map(scnSrc).join('')}</ul></div>`);
    detail.push(`<div class="lid">${esc(n.id)}</div>`);
    return `<li class="leaf k-${k}${open ? ' open' : ''}" data-leaf="${esc(n.id)}"><button class="lr" aria-expanded="${open}">${scnGlyph(k)}${n.question ? `<span class="qtag">${esc(n.question)}</span>` : ''}<span class="lt">${esc(n.label)}</span>${tags}<span class="tid">${esc(n.tree || '')}</span></button><div class="ld"${open ? '' : ' hidden'}>${detail.join('')}</div></li>`;
  };
  const nodeHtml = (n) => {
    if (filtering() && !keep(n)) return '';
    if (scnLeaf(n)) return leafRow(n);
    const kids = (n.children || []).map(nodeHtml).join('');
    if (n.type === 'state') {
      const s = opts.screenName && n.screen ? opts.screenName(n.screen) : '';
      return `<li class="state${st.state === n.id ? ' cur' : ''}"><button class="sr" data-state="${esc(n.id)}"${n.screen ? '' : ' disabled'} title="${n.screen ? 'Show where these scenarios start on the phone' : ''}"><span class="sl">${esc(n.label)}</span>${s ? `<span class="ss"><svg viewBox="0 0 12 16" width="9" height="12" aria-hidden="true"><rect x="1" y="1" width="10" height="14" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>${esc(s)}</span>` : ''}</button>${kids ? `<ul>${kids}</ul>` : ''}</li>`;
    }
    return `<li class="act"><span class="ar">${esc(n.label)}</span>${kids ? `<ul>${kids}</ul>` : ''}</li>`;
  };
  const present = SCN_ORDER.filter((k) => count(k)); // one column per result the feature has, so the tallies line up branch under branch
  const tally = (b) => { const ls = scnLeaves(b); return present.map((k) => { const c = ls.filter((n) => scnKind(n) === k).length; return c ? `<span class="tp">${scnGlyph(k)}${c}</span>` : '<span class="tp"></span>'; }).join(''); };

  function draw(top) {
    if (top && page.parentElement) page.parentElement.scrollTop = 0;
    const shown = tree.filter((b) => !filtering() || keep(b));
    body.innerHTML = shown.map((b) => {
      const open = filtering() || st.open.has(b.id);
      return `<section class="scn-branch" data-b="${esc(b.id)}" data-open="${open}"><button class="bh" aria-expanded="${open}"><span class="caret">›</span><span class="bn">${esc(scnTitle(b.id))}</span>${b.label.toLowerCase() === scnTitle(b.id).toLowerCase() ? '<span class="bl"></span>' : `<span class="bl">${esc(b.label)}</span>`}<span class="tally">${tally(b)}</span></button>${open ? `<ul class="tr">${(b.children || []).map(nodeHtml).join('')}</ul>` : ''}</section>`;
    }).join('') || '<p class="none">Nothing matches.</p>';
    body.append(notSupported());
    body.querySelectorAll('.scn-branch[data-b] > .bh').forEach((h) => { h.onclick = () => { if (filtering()) return; const id = h.parentElement.dataset.b; st.open.has(id) ? st.open.delete(id) : st.open.add(id); draw(); }; });
    body.querySelectorAll('.lr').forEach((r) => { r.onclick = () => { const li = r.parentElement, id = li.dataset.leaf, d = li.querySelector('.ld'); d.hidden = !d.hidden; li.classList.toggle('open', !d.hidden); r.setAttribute('aria-expanded', String(!d.hidden)); d.hidden ? st.leaf.delete(id) : st.leaf.add(id); }; });
    body.querySelectorAll('.sr[data-state]').forEach((r) => { r.onclick = () => pickState(r.dataset.state); });
    bar.querySelector('[data-all]').textContent = tree.every((b) => st.open.has(b.id)) ? 'Collapse all' : 'Expand all';
    bar.querySelector('[data-all]').hidden = filtering();
  }
  const states = []; const walk = (b) => (n) => { if (n.type === 'state') states.push(Object.assign({ branch: b.id }, n)); (n.children || []).forEach(walk(b)); }; tree.forEach((b) => walk(b)(b));
  function pickState(id) {
    const n = states.find((x) => x.id === id); if (!n || !n.screen) return;
    st.state = id; body.querySelectorAll('li.state').forEach((li) => li.classList.toggle('cur', li.querySelector(':scope > .sr').dataset.state === id));
    if (opts.onState) opts.onState(n);
  }
  bar.querySelectorAll('.bkc').forEach((b) => { b.onclick = () => { st.kind = b.dataset.k === st.kind ? '' : b.dataset.k; bar.querySelectorAll('.bkc').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.k === st.kind))); draw(true); }; });
  bar.querySelector('.search').oninput = (e) => { st.q = e.target.value.trim().toLowerCase(); draw(true); };
  bar.querySelector('[data-all]').onclick = () => { if (tree.every((b) => st.open.has(b.id))) st.open.clear(); else tree.forEach((b) => st.open.add(b.id)); draw(); };
  draw();
  return { el: page, firstState: () => { const n = states.find((x) => x.screen && st.open.has(x.branch)) || states.find((x) => x.screen); return n ? n.id : null; }, pickState };
}
