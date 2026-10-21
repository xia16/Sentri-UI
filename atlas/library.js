/* Components (a host for the mobile design system in ux/design-system) and Copy (the string registry). */
'use strict';

const DS = '/ux/design-system';
const cache = {};
const getJson = (u) => (cache[u] = cache[u] || fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); }));
const getText = (u) => (cache[u] = cache[u] || fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.text(); }));
const loadStrings = () => getJson('/ux/laws/strings.json').catch(() => ({ verbs: {}, banned: {}, strings: {} }));
/* One icon source: the bundle's SentriIcons registry (paths, aliases, icon()). */
const loadIcons = () => cache.icons || (cache.icons = new Promise((res) => { const t = document.createElement('script'); t.src = '/ux/design-system/components/bundle.js'; t.onload = () => res(globalThis.SentriIcons || null); t.onerror = () => res(null); document.head.append(t); }));
const iconSvg = (icons, name, size, style) => icons ? icons.icon(name).replace('<svg ', `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"${style ? ` style="${style}"` : ''} `) : '';
const FAILED = (what) => `<p class="none">Could not read ${esc(what)}.</p>`;

/* one nav + one pane, shared by Components and Copy */
function libShell(title, blurb) {
  const main = document.getElementById('main'); main.innerHTML = '';
  const wrap = el(`<div class="lib"><aside><h1>${esc(title)}</h1><p>${blurb}</p><nav></nav></aside><div class="pane"></div></div>`);
  main.append(wrap);
  return { pane: wrap.querySelector('.pane'), nav: wrap.querySelector('nav') };
}
const navItem = (nav, key, html, count, onclick) => {
  const b = el(`<button data-k="${esc(key)}"><span class="l">${html}</span>${count == null ? '' : `<span>${count}</span>`}</button>`);
  b.onclick = onclick; nav.append(b); return b;
};

/* ---------- Components ---------- */
let initialVariant = new URLSearchParams(location.search).get('variant');
/* the groups come from atlas.json (ux/design-system/components/_groups.json), filled in renderComponents; they follow the
   developer's job (owner, 2026-10-21), the task page's parts last, then the old names that still resolve */
let COMPONENT_GROUPS = [];
const TASK_GROUP = 'Task page parts', COMPAT_GROUP = 'Compatibility and retired';
const SKELETON_DEMO = `${DS}/components/task-skeleton-demo.html`;
/* measured, not guessed: which atlas screens draw each part (scripts/component-usage.mjs) */
const USAGE = '/atlas/component-usage.json';
const MATURITY = Object.assign({}, STATUS, { candidate: 'Candidate', retired: 'Retired' });
const nameWords = (n) => n.replace(/([a-z])([A-Z])/g, '$1 $2');

/* what a component's README says first: its job (the first plain sentence; a status line is history, as in
   scripts/component-jobs.mjs), the APIs it names, the parts it links to, and whether it calls itself a candidate */
function readmeFacts(readme, name) {
  const lines = readme.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !/^[#>|`!-]/.test(l));
  const plain = lines.find((l) => !l.startsWith('**')) || lines[0] || '';
  const job = plain.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*`]/g, '').split(/(?<=\.)\s/)[0];
  const all = [...new Set(readme.match(/\bSentri(?:UI|Task)\.[a-zA-Z]+\b/g) || [])], own = '.' + name.replace(/^Task(?=[A-Z])/, '').toLowerCase();
  const rank = (a) => (a.toLowerCase().endsWith(own) ? 0 : a.toLowerCase().includes(own) ? 1 : 2);
  const apis = all.map((a, i) => [a, i]).sort((x, y) => rank(x[0]) - rank(y[0]) || x[1] - y[1]).map((x) => x[0]); // its own first
  const near = [...new Set([...readme.matchAll(/\(\.\.\/([A-Z][A-Za-z]+)\/README\.md[^)]*\)/g)].map((m) => m[1]).filter((n) => n !== name))];
  return { job, apis, near, candidate: /\bcandidate\b/i.test(readme.slice(0, 400)) };
}

/* a preview rendered styled: the previews expect a host that preloads tokens, the bundle and the fonts */
async function styledPreview(name, file = 'preview.html') {
  const dir = `${DS}/components/${name}/`;
  let html; try { html = await getText(dir + file); } catch (e) { return null; }
  const hint = (html.match(/dsCard[^>]*?height=(\d+)/) || [])[1];
  const inject = `<base href="${dir}"><link rel="stylesheet" href="${DS}/tokens.css"><link rel="stylesheet" href="${DS}/components/bundle.css"><script src="${DS}/components/bundle.js"><\/script>`;
  const doc = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + inject) : inject + html;
  const wide = name === 'Cover', f = el('<iframe class="preview" title="Preview"></iframe>');
  const box = el('<div class="pv"></div>'); box.append(f);
  f.style.width = wide ? '960px' : '440px'; f.style.height = (hint ? +hint + 8 : 420) + 'px'; f.srcdoc = doc;
  f.onload = async () => {
    try {
      const d = f.contentDocument;
      if (wide) { f.style.width = Math.max(960, d.documentElement.scrollWidth) + 'px'; await new Promise((r) => setTimeout(r, 60)); }
      const h = Math.max(d.documentElement.scrollHeight, d.body.scrollHeight), w = f.offsetWidth;
      f.style.height = h + 'px';
      if (wide) { box.style.display = 'block'; box.style.padding = '0'; box.style.border = '0'; box.style.background = 'none'; const k = Math.min(1, box.clientWidth / w); if (k < 1) { f.style.transformOrigin = '0 0'; f.style.transform = `scale(${k})`; box.style.height = h * k + 'px'; } }
    } catch (_) {}
  };
  return box;
}

/* a part with no specimen of its own (most task page parts): the first atlas screen that draws it, live at 390 */
function sourceFrame(id) {
  const s = screenIndex()[id];
  if (!s || !s.url) return null;
  const box = el(`<figure class="srcframe"><figcaption>On its screen: <a href="?feature=${esc(s.feature.id)}&screen=${esc(id)}" data-sid="${esc(id)}">${esc(s.feature.name)} · ${esc(s.name)}</a></figcaption></figure>`);
  const f = el('<iframe title="Source screen"></iframe>');
  f.src = s.url + (s.url.includes('?') ? '&' : '?') + 'screen=' + encodeURIComponent(id);
  box.append(f);
  return box;
}

const SCORE_KEYS = ['clarity', 'budget', 'hierarchy', 'spacing', 'broken'], PASS = 8;
const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
function verdictOf(g) {
  const sc = (g && g.scores) || {}, ks = SCORE_KEYS.filter((k) => sc[k] != null);
  if (!ks.length) return null;
  const low = ks.reduce((m, k) => (sc[k] < sc[m] ? k : m), ks[0]), n = (g.findings || []).length, pass = sc[low] >= PASS;
  // an agent's score, never approval (gate.md R11): only the owner approves
  return { pass, low, text: `Agent score ${sc[low]}/10 · lowest: ${cap(low)}${n ? ` · ${n} finding${n === 1 ? '' : 's'}` : ''}` };
}
/* a gate, collapsed to one line: status pill, verdict, "Gate details"; the bars and the findings open on demand */
function gateBlock(g, status) {
  const v = verdictOf(g), pill = `<span class="pill">${dot(status)}${esc(STATUS[status] || status)}</span>`;
  const box = el(`<div class="gate2"><div class="gline">${pill}<span class="gv ${v ? (v.pass ? (status === 'approved' ? 'ok' : '') : 'bad') : ''}">${esc(v ? v.text : g ? 'No scores yet' : 'Not gated yet')}</span>${g ? '<button class="gdet" aria-expanded="false">Gate details ›</button>' : ''}</div><div class="gbody" hidden></div></div>`);
  if (!g) return box;
  const sc = g.scores || {}, low = v && v.low;
  const bars = SCORE_KEYS.filter((k) => sc[k] != null).map((k) => `<div class="gbar${k === low ? ' low' : ''}${sc[k] < PASS ? ' fail' : ''}"><span class="k">${k}</span><span class="tr"><i style="width:${sc[k] * 10}%"></i><u style="left:${PASS * 10}%"></u></span><b>${sc[k]}</b></div>`).join('');
  const fs = (g.findings || []).map((f) => { const o = typeof f === 'string' ? { text: f } : f; return `<li><button class="fl"><span class="sev">${esc(o.severity || 'note')}</span><span class="ft">${esc(o.text)}</span></button><div class="ff" hidden><p>${esc(o.text)}</p>${o.fix ? `<p class="fx"><b>Fix</b> ${esc(o.fix)}</p>` : ''}</div></li>`; }).join('');
  const foot = [g.judged, g.model].filter(Boolean).join(' · ');
  box.querySelector('.gbody').innerHTML = `<div class="gbars">${bars}</div>${fs ? `<ul class="gfind">${fs}</ul>` : ''}${foot ? `<div class="gfoot">${esc(foot)} · pass mark ${PASS}</div>` : ''}`;
  const btn = box.querySelector('.gdet'), body = box.querySelector('.gbody');
  btn.onclick = () => { body.hidden = !body.hidden; btn.setAttribute('aria-expanded', String(!body.hidden)); btn.textContent = body.hidden ? 'Gate details ›' : 'Gate details ⌄'; };
  box.querySelectorAll('.fl').forEach((b2) => { b2.onclick = () => { const d = b2.nextElementSibling; d.hidden = !d.hidden; b2.classList.toggle('open', !d.hidden); }; });
  return box;
}
/* the agent review, last on a page and closed: a developer reads the job and the API first */
function reviewBlock(g, status) {
  const v = verdictOf(g), box = el(`<details class="crev"><summary>Review history${v ? ' · ' + esc(v.text) : ''}</summary></details>`);
  box.append(gateBlock(g, status));
  return box;
}

/* the state grid: every [data-state] element of <dir>variants/<id>.html in its own labelled cell, at phone width (null when the file is missing or has no states) */
async function stateGridAt(dir, id, opts = {}) {
  let html = null; try { html = await getText(`${dir}variants/${id}.html`); } catch (_) {}
  if (!html) return null;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let states = [...doc.querySelectorAll('[data-state]')].filter((x) => !x.parentElement.closest('[data-state]'));
  if (!states.length) return null;
  if (opts.one) states = [states.find((x) => /^default$/i.test(x.getAttribute('data-state'))) || states[0]]; // the Overview shows one example per variant
  const head = [...doc.head.querySelectorAll('style, link[rel=stylesheet]')].map((x) => x.outerHTML).join('');
  const tail = [...doc.querySelectorAll('script')].filter((x) => !x.closest('[data-state]')).map((x) => x.outerHTML).join('');
  const inject = `<base href="${dir}"><link rel="stylesheet" href="${DS}/tokens.css"><link rel="stylesheet" href="${DS}/components/bundle.css"><script src="${DS}/components/bundle.js"><\/script>`;
  const grid = el(`<div class="sgrid${opts.bare ? ' bare' : ''}"></div>`);
  states.forEach((s) => {
    { const h = s.querySelector(':scope > h2, :scope > h3'); if (h && h.textContent.trim().toLowerCase() === s.getAttribute('data-state').trim().toLowerCase()) h.remove(); } // the cell caption already names the state
    const cell = el(`<figure class="scell"><figcaption>${opts.captionHtml || esc(opts.caption || s.getAttribute('data-state'))}</figcaption></figure>`), f = el('<iframe title="State"></iframe>');
    f.style.height = '20px'; f.scrolling = 'no'; f.srcdoc = `<!doctype html><html><head>${inject}${head}<style>html,body{margin:0;overflow:hidden;background:var(--app-background);color:var(--ink);font-family:var(--font-sans)}body{padding:${opts.bare ? '0' : 'var(--space-16)'}}</style></head><body>${s.outerHTML}${tail}</body></html>`;
    f.onload = () => { try { const d = f.contentDocument, w = d.defaultView;
      const own = [...d.querySelectorAll('[data-state] *')].slice(0, 12).find((x) => { const c = w.getComputedStyle(x), r = x.getBoundingClientRect(); return parseFloat(c.borderTopWidth) > 0 && c.borderTopStyle !== 'none' && r.width > d.documentElement.clientWidth * 0.8; });
      if (own) { f.style.border = '0'; f.style.borderRadius = '0'; d.body.style.padding = '0'; } /* the item draws its own surface: it sits directly on the ground, no cell padding */
      d.documentElement.style.overflow = d.body.style.overflow = 'hidden';
      const fit = () => { f.style.height = Math.max(60, Math.ceil(d.body.getBoundingClientRect().height + parseFloat(w.getComputedStyle(d.body).marginTop || 0) * 2)) + 'px'; };
      fit(); new w.ResizeObserver(fit).observe(d.body); if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit); } catch (_) {} };
    cell.append(f); grid.append(cell);
  });
  return grid;
}

async function renderComponents() {
  const CI = {};
  const comps = platform().components || [];
  if (!comps.length) { emptyView('components'); return; }
  {
    comps.forEach((c) => { CI[c.name] = c; });
    const order = [], by = {};
    comps.forEach((c) => { if (!by[c.group]) { by[c.group] = []; order.push(c.group); } by[c.group].push(c.name); });
    COMPONENT_GROUPS = order.map((g) => [g, by[g]]);
  }
  let usage = null; try { usage = await getJson(USAGE); } catch (_) {}
  /* a "see" entry names a part documented inside another component (Optional input → Field), so it is found by its own name */
  /* and a part's job words ("Stepper": "count pigs …"), what a developer types for the job, searched with its name */
  let sees = [], jobWords = {}; try { const gs = await getJson(`${DS}/components/_groups.json`); sees = gs.flatMap((g) => (g.see || []).map((s) => Object.assign({ group: g.group }, s))); jobWords = Object.assign({}, ...gs.map((g) => g.words || {})); } catch (_) {}
  const groupOf = (n) => (COMPONENT_GROUPS.find((g) => g[1].includes(n)) || [''])[0];
  const stOf = (n) => (CI[n] && CI[n].status) || 'in-design';
  const lifeOf = (n) => (groupOf(n) !== COMPAT_GROUP ? 'Current' : stOf(n) === 'retired' ? 'Retired' : 'Compatibility');
  const readmes = {};
  const factsOf = (n) => readmes[n] || (readmes[n] = getText(`${DS}/components/${n}/README.md`).then((t) => Object.assign({ text: t }, readmeFacts(t, n)), () => ({ text: '', job: '', apis: [], near: [], candidate: false })));
  const maturityOf = (n, f) => (stOf(n) === 'in-design' && f && f.candidate ? 'candidate' : stOf(n));
  const count = COMPONENT_GROUPS.filter((g) => g[0] !== COMPAT_GROUP).reduce((n, g) => n + g[1].length, 0);
  const { pane, nav } = libShell('Mobile app components', `Mobile app · ${count} parts, grouped by the job they do. A part is set when the first feature using it freezes.`);
  let ds = {}; try { ds = await getJson(`${DS}/design-system.json`); } catch (_) {}
  const pages = { _brand: 'Brand book', _foundations: 'Tokens', _icons: 'Icons' };
  const compat = el(`<details class="compat"><summary>${esc(COMPAT_GROUP)}</summary></details>`);
  const go = (key) => {
    setParam('component', key === 'Overview' ? null : key);
    setParam('variant', null);
    nav.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', b.dataset.k === key));
    if (groupOf(key) === COMPAT_GROUP) compat.open = true;
    pane.scrollTop = 0; pane.innerHTML = '';
    ({ Overview: pageOverview, _brand: pageBrand, _foundations: pageFoundations, _icons: pageIcons, _task: pageTask }[key] || pageComponent)(key);
  };

  /* navigation: the job search, the start pages, then the groups; the old names collapse at the foot */
  const search = el('<input class="libsearch" type="search" placeholder="Find a part: count pigs, choose a medicine…" aria-label="Find a component by its job, name or API">');
  nav.before(search);
  navItem(nav, 'Overview', 'Overview', null, () => go('Overview'));
  Object.entries(pages).forEach(([k, n]) => navItem(nav, k, n, null, () => go(k)));
  for (const [g, names] of COMPONENT_GROUPS) {
    const host = g === COMPAT_GROUP ? compat : nav;
    if (g === COMPAT_GROUP) { compat.querySelector('summary').textContent = `${g} · ${names.length}`; nav.append(compat); } else nav.append(el(`<h5>${esc(g)}</h5>`));
    if (g === TASK_GROUP) navItem(host, '_task', `${dot('in-design')}Task skeleton`, null, () => go('_task'));
    names.forEach((n) => navItem(host, n, `${dot(stOf(n))}${esc(n)}`, null, () => go(n)));
    sees.filter((s) => s.group === g).forEach((s) => navItem(host, 'see:' + s.name, `<span class="see">${esc(s.name)} → ${esc(s.component)}</span>`, null, () => go(s.component)));
  }
  /* the search reads each part's name, its APIs, its job and its README; every word typed must appear somewhere. The nav keeps
     the matches in their groups; the best ones (name or API first, then the job, then how often the README says it) are listed
     under the field, and Enter opens the first */
  const index = {};
  const entry = (k, head, job, text) => { index[k] = { head: head.toLowerCase(), job: (job || '').toLowerCase(), text: (text || '').toLowerCase() }; };
  Object.entries(pages).forEach(([k, n]) => entry(k, n));
  entry('Overview', 'overview start'); entry('_task', 'task skeleton', 'how a task page is built from shared parts');
  sees.forEach((s) => entry('see:' + s.name, `${s.name} ${s.component}`, s.words));
  const label = (k) => (k.startsWith('see:') ? k.slice(4) : pages[k] || (k === '_task' ? 'Task skeleton' : k));
  const words = (q) => q.toLowerCase().split(/\s+/).filter((w) => w.length > 1).map((w) => (w.length > 3 ? w.replace(/s$/, '') : w));
  const score = (k, ws) => {
    const x = index[k] || { head: k.toLowerCase(), job: '', text: '' };
    // every word somewhere, or one in the name or the job (the job says "animals" where the worker types "pigs")
    let s = 0, all = true, strong = false;
    for (const w of ws) { if (x.head.includes(w)) { s += 1000; strong = true; } else if (x.job.includes(w)) { s += 50; strong = true; } else if (x.text.includes(w)) s += Math.min(9, x.text.split(w).length - 1); else all = false; }
    return all || strong ? s : 0;
  };
  const best = el('<div class="libbest" hidden></div>');
  search.after(best);
  function filter() {
    const ws = words(search.value), on = !!ws.length;
    const scored = [...nav.querySelectorAll('button[data-k]')].map((b) => [b, on ? score(b.dataset.k, ws) : 1]);
    scored.forEach(([b, s]) => { b.hidden = !s; });
    nav.querySelectorAll('h5').forEach((h) => { let n = h.nextElementSibling, any = false; while (n && n.tagName === 'BUTTON') { if (!n.hidden) any = true; n = n.nextElementSibling; } h.hidden = on && !any; });
    compat.hidden = on && ![...compat.querySelectorAll('button')].some((b) => !b.hidden); if (on && !compat.hidden) compat.open = true;
    const top = on ? scored.filter(([, s]) => s).sort((a, b) => b[1] - a[1]).slice(0, 4) : [];
    best.hidden = !top.length; best.innerHTML = '';
    top.forEach(([b]) => { const a = el(`<button type="button">${esc(label(b.dataset.k))}</button>`); a.onclick = () => b.click(); best.append(a); });
  }
  Promise.all(COMPONENT_GROUPS.flatMap((g) => g[1]).map(async (n) => { const f = await factsOf(n); entry(n, [n, nameWords(n), jobWords[n] || '', f.apis.join(' ')].join(' '), f.job, f.text); })).then(() => { if (search.value) filter(); });
  search.addEventListener('input', filter);
  search.addEventListener('keydown', (e) => { if (e.key !== 'Enter') return; const b = best.querySelector('button'); if (b) b.click(); });

  const compLink = (u) => { const m = u.match(/(?:^|\/)([A-Za-z]+)\/README\.md$/); return m && COMPONENT_GROUPS.some((g) => g[1].includes(m[1])) ? '?view=components&component=' + m[1] : null; };
  pane.addEventListener('click', (e) => { const a = e.target.closest('a[href^="?view=components&component="]'); if (a) { e.preventDefault(); go(new URLSearchParams(a.getAttribute('href')).get('component')); } });
  const wireChips = (root) => root.querySelectorAll('a[data-sid]').forEach((a2) => { a2.onclick = (e) => { e.preventDefault(); const s = screenIndex()[a2.dataset.sid]; openFeature(s.feature.id, s.id); }; });
  const compA = (n) => `<a href="?view=components&component=${esc(n)}">${esc(n)}</a>`;

  /* the start page: every part with its job, by group, so a developer finds the one part whose job it is */
  async function pageOverview() {
    pane.append(el('<h2>Mobile app components</h2>'));
    pane.append(el(`<p class="cjob" style="max-width:760px">Grouped by the job a part does. Search above by a job (“count pigs”), a part or an API name. Each page opens with the job, its status, its API and the screens that draw it.</p>`));
    pane.append(el(`<p class="cline">${['agent-checked', 'in-design'].map((s) => `${dot(s)} ${esc(MATURITY[s])}`).join(' &nbsp; ')} &nbsp; Agent-checked is an agent's review, never the owner's approval.</p>`));
    for (const [g, names] of COMPONENT_GROUPS) {
      const facts = await Promise.all(names.map(factsOf));
      const rows = names.map((n, i) => `<div class="jobrow">${dot(stOf(n))}${compA(n)}<span>${esc(facts[i].job)}</span></div>`).join('') +
        sees.filter((s) => s.group === g).map((s) => `<div class="jobrow"><span class="see">${esc(s.name)}</span><span>Documented with ${compA(s.component)}</span></div>`).join('');
      const block = g === COMPAT_GROUP ? el(`<details class="jobgroup"><summary>${esc(g)} · ${names.length}: old names that still resolve, and retired parts</summary><div class="jobs">${rows}</div></details>`) : el(`<section class="jobgroup"><h3>${esc(g)}</h3><div class="jobs">${g === TASK_GROUP ? `<div class="jobrow">${dot('in-design')}<a href="?view=components&component=_task">Task skeleton</a><span>How Farrowing's task page is built from the parts below.</span></div>` : ''}${rows}</div></section>`);
      pane.append(block);
    }
  }
  async function pageBrand() {
    pane.append(el('<h2>Brand book</h2>'));
    try { pane.append(el(`<div class="guide doc">${md(await getText(`${DS}/README.md`), { link: compLink })}</div>`)); } catch (_) { pane.append(el(FAILED('the brand book'))); }
  }
  async function pageIcons() {
    pane.append(el('<h2>Icons</h2>'));
    const icons = await loadIcons();
    if (!icons) { pane.append(el(FAILED('the icon registry'))); return; }
    // Every glyph comes from the bundle registry, drawn as the app draws it. Aliases are names that resolve to a glyph, not glyphs.
    const names = Object.keys(icons.paths);
    pane.append(el(`<div class="icons">${names.map((n) => `<div>${iconSvg(icons, n, 28, 'display:block;margin:0 auto 8px;color:#20291f')}${esc(n)}</div>`).join('')}</div>`));
    const al = Object.entries(icons.aliases);
    pane.append(el('<h3>Aliases</h3>'));
    pane.append(el('<p class="muted" style="margin:0 0 10px">Names that draw another glyph. Use the glyph name in new work.</p>'));
    pane.append(el(`<ul class="aliases">${al.map(([a, n]) => `<li><span>${esc(a)}</span><span class="muted">draws</span><span>${esc(n)}</span></li>`).join('')}</ul>`));
  }
  async function pageFoundations() {
    pane.append(el('<h2>Tokens</h2>'));
    let t; try { t = await getJson(`${DS}/tokens.json`); } catch (_) { pane.append(el(FAILED('the tokens'))); return; }
    const themes = t.color.themes || [{ id: 'light', name: 'Light' }];
    themes.forEach((th) => {
      pane.append(el(`<h3>Colour${themes.length > 1 ? ' · ' + esc(th.name) : ''}</h3>`));
      pane.append(el(`<div class="swatches">${t.color.tokens.map((c) => { const v = (c.values && c.values[th.id]) || c.value; return `<div class="sw"><i style="background:${esc(v)}"></i><div><b>${esc(c.name)}<code>${esc(v)}</code></b><p title="${esc(c.usage)}">${esc(c.usage)}</p></div></div>`; }).join('')}</div>`));
    });
    const fam = t.type.families;
    t.type.groups.forEach((g) => {
      pane.append(el(`<h3>Type · ${esc(g.name)}</h3>`));
      pane.append(el(`<div>${g.styles.map((s) => `<div class="tstyle"><div><b>${esc(s.name)}</b><small>${esc(s.fontSize)} / ${esc(s.lineHeight)} / ${esc(s.fontWeight)}${s.letterSpacing ? ' / ' + esc(s.letterSpacing) : ''}</small></div><div style="font-family:${esc(fam[g.family] || fam.sans)};font-size:${esc(s.fontSize)};line-height:${esc(s.lineHeight)};font-weight:${esc(s.fontWeight)};${s.letterSpacing ? 'letter-spacing:' + esc(s.letterSpacing) : ''}">${esc(s.sample)}</div><p title="${esc(s.usage)}">${esc(s.usage)}</p></div>`).join('')}</div>`));
    });
    pane.append(el('<h3>Spacing</h3>'));
    pane.append(el(`<div class="scale">${t.spacing.tokens.map((s) => { const px = parseFloat(s.value); return `<div>${esc(s.name)}<code>${esc(s.value)}</code></div><div>${px > 0 ? `<div class="bar" style="width:${Math.min(px * 4, 480)}px"></div>` : ''}</div><small>${esc(s.usage)}</small>`; }).join('')}</div>`));
    pane.append(el('<h3>Radius</h3>'));
    pane.append(el(`<div class="scale">${t.radius.tokens.map((s) => `<div>${esc(s.name)}<code>${esc(s.value)}</code></div><div><div class="box" style="border-radius:${esc(s.value)}"></div></div><small>${esc(s.usage)}</small>`).join('')}</div>`));
  }
  async function pageTask() {
    pane.append(el('<h2>Task skeleton</h2>'));
    pane.append(el(`<div class="cmeta"><span class="t">${esc(TASK_GROUP)}</span></div>`));
    pane.append(el('<p class="cjob" style="max-width:760px">How Farrowing’s task page is built from shared parts (ADR 0003): the signed-off reference beside the same screen built from the parts. Each part has its own page.</p>'));
    const names = (COMPONENT_GROUPS.find((g) => g[0] === TASK_GROUP) || [0, []])[1];
    pane.append(el(`<p class="cline">Parts: ${names.map(compA).join(' · ')}</p>`));
    pane.append(el(`<iframe class="preview" title="Task skeleton demo" src="${SKELETON_DEMO}" style="width:100%;height:900px;border:1px solid var(--line)"></iframe>`));
  }
  /* the screens that draw a part, measured; zero is "not observed", never "unused" (a later state may draw it) */
  function drawnOn(n) {
    const u = usage && usage.components && usage.components[n];
    if (!usage) return { ids: [], line: 'Usage not measured yet (node scripts/component-usage.mjs).' };
    const when = `measured ${esc(usage.measured)} at ${esc(usage.commit)}`;
    if (!u) return { ids: [], line: `Not measured (${when}).` };
    const feats = u.features.map((f) => esc((allFeatures().find((x) => x.id === f) || { name: f }).name)).join(', ');
    const files = u.files.length ? ` · <details class="cfiles"><summary>called from ${u.files.length} source file${u.files.length === 1 ? '' : 's'}</summary>${u.files.map((f) => `<code>${esc(f)}</code>`).join('<br>')}</details>` : '';
    const seen = u.screens.length ? `Drawn on <b>${u.screens.length}</b> atlas screen${u.screens.length === 1 ? '' : 's'} in ${u.features.length} feature${u.features.length === 1 ? '' : 's'}: ${feats}` : 'Not observed on the atlas’s screens (each is measured in its first state)';
    return { ids: u.screens, line: `${seen} <span class="muted">(${when})</span>${files}` };
  }
  /* the screen a part is shown on: one of a feature in progress first (features/_in-progress.json), the newest designs */
  let inProgress = []; try { inProgress = (await getJson('/features/_in-progress.json')).features || []; } catch (_) {}
  const firstShown = (ids) => { // in the atlas's own screen order, so a feature's main screen comes before its drawers
    const ix = screenIndex(), order = Object.keys(ix).filter((id) => ids.includes(id));
    return order.find((id) => inProgress.includes(ix[id].feature.id)) || order[0];
  };
  async function pageComponent(name) {
    const group = groupOf(name);
    const head = el(`<h2>${esc(name)}</h2>`); pane.append(head);
    const st = stOf(name), meta = el(`<div class="cmeta">${st === 'placeholder' ? dot(st) : ''}<span class="t">${st === 'placeholder' ? esc(STATUS[st]) + ' · ' : ''}${esc(group)}</span></div>`); pane.append(meta);
    if (st === 'placeholder') {
      const c = CI[name], idx2 = screenIndex();
      const links = (c.seenIn || []).map((id) => idx2[id] ? `<a href="?feature=${esc(idx2[id].feature.id)}&screen=${esc(id)}" data-sid="${esc(id)}">${esc(idx2[id].feature.name)} · ${esc(idx2[id].name)}</a>` : '').filter(Boolean).join(', ');
      pane.append(el(`<div class="nopreview">Not in the design system yet — seen in ${links || 'a screen'}.</div>`));
      if (c.note) pane.append(el(`<p class="muted" style="max-width:640px">${esc(c.note)}</p>`));
      pane.querySelectorAll('a[data-sid]').forEach((a) => { a.onclick = (e) => { e.preventDefault(); const s = idx2[a.dataset.sid]; openFeature(s.feature.id, s.id); }; });
      return;
    }
    const gate = CI[name] && CI[name].gate;
    const slug = (t) => String(t).split(' (')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const facts = await factsOf(name), readme = facts.text;
    /* the first screen: the job, maturity and lifecycle, the API, the screens that draw it, the parts nearby */
    const mat = maturityOf(name, facts), life = lifeOf(name), use = drawnOn(name);
    const near = facts.near.filter((n) => groupOf(n)).slice(0, 6);
    const api = facts.apis.slice(0, 5).map((a) => `<code>${esc(a)}</code>`).join(' · ');
    pane.append(el(`<div class="cintro">${facts.job ? `<p class="cjob">${esc(facts.job)}</p>` : ''}<p class="clabels"><span class="pill">${dot(mat === 'candidate' ? 'in-design' : mat)}${esc(MATURITY[mat] || mat)}</span><span class="pill life-${esc(life.toLowerCase())}">${esc(life)}</span></p>${api ? `<p class="cline">${api}${facts.apis.some((a) => a.startsWith('SentriUI.')) ? ' <span class="muted">· types in <code>components/index.d.ts</code></span>' : facts.apis.length ? ' <span class="muted">· <code>components/task-skeleton.js</code></span>' : ''}</p>` : ''}<div class="cline">${use.line}</div>${near.length ? `<p class="cline">Nearby: ${near.map(compA).join(' · ')}</p>` : ''}</div>`));
    /* variants: variants.json (the component pass) wins; else the gate's own list. A variant gets a tab only when its states are drawn. */
    const have = (CI[name] && CI[name].files) || null;   // what exists on disk (atlas.json); asking only for those keeps the console free of 404s
    let vj = null; if (!have || have.variantsJson) { try { vj = await getJson(`${DS}/components/${name}/variants.json`); } catch (_) {} }
    const fromGate = ((gate && gate.variants) || []).map((v) => ({ id: slug(v.name), name: String(v.name).split(' (')[0], status: v.status, scores: v.scores, findings: v.findings, usedBy: v.usedBy || [] }));
    const variants = vj && vj.length ? vj.map((v) => Object.assign({ usedBy: [] }, fromGate.find((g) => g.id === v.id || g.id === slug(v.name)) || {}, v)) : fromGate;
    const dirOf = `${DS}/components/${name}/`;
    const drawn = {};
    await Promise.all(variants.map(async (v) => { drawn[v.id] = !have || have.variants.includes(v.id) ? await stateGridAt(dirOf, v.id) : null; }));
    const withStates = variants.filter((v) => drawn[v.id]), without = variants.filter((v) => !drawn[v.id]);
    const tabs = [{ id: 'overview', name: 'Overview' }, ...withStates];
    const want = initialVariant; initialVariant = null;
    const bar = el('<div class="vtabs" role="tablist"></div>'), body = el('<div class="vbody"></div>');
    if (withStates.length) pane.append(bar);
    pane.append(body);
    const chipsFor = (ids, none) => {
      const ix = screenIndex(), ok = (ids || []).map((x) => String(x).split(' ')[0]).filter((x) => ix[x]);
      if (!ok.length) return `<p class="none">${esc(none)}</p>`;
      return `<div class="usedby">${ok.slice(0, 16).map((x) => `<a href="?feature=${esc(ix[x].feature.id)}&screen=${esc(x)}" data-sid="${esc(x)}">${esc(ix[x].feature.name)} · ${esc(ix[x].name)}</a>`).join('')}${ok.length > 16 ? `<span class="muted">+${ok.length - 16} more</span>` : ''}</div>`;
    };
    const same = (v) => JSON.stringify([v.scores || null, v.findings || null]) === JSON.stringify([gate && gate.scores || null, gate && gate.findings || null]);
    async function show(id) {
      bar.querySelectorAll('button').forEach((b2) => b2.setAttribute('aria-pressed', String(b2.dataset.id === id)));
      setParam('variant', id === 'overview' ? null : id); body.innerHTML = '';
      if (id === 'overview') {
        // a single-variant component shows its own preview.html; without one (or with several variants) the overview is one
        // captioned example per drawn variant, each with its own status; a part with neither shows the first screen that draws it
        const own = withStates.length > 1 ? null : await styledPreview(name);
        if (own) body.append(own);
        else if (withStates.length) { // the states live in the variant tabs
          const g = el('<div class="sgrid ovgrid"></div>');
          for (const v of withStates) { const vs = v.status || st; const one = await stateGridAt(dirOf, v.id, { one: true, bare: true, captionHtml: `${esc(v.name)}${vs !== st ? ` <span class="vst">${dot(vs)}${esc(MATURITY[vs] || vs)}</span>` : ''}` }); if (one) g.append(...one.children); }
          body.append(g);
        } else body.append(sourceFrame(firstShown(use.ids)) || el('<div class="nopreview">No specimen of its own yet, and not observed on an atlas screen</div>'));
        if (without.length) body.append(el(`<p class="muted" style="margin:0 0 14px;font-size:12.5px">Variants (to be drawn in the component pass): ${without.map((v) => esc(v.name)).join(' · ')}</p>`));
        if (readme) { body.append(el('<h3>Guidelines</h3>')); body.append(el(`<div class="guide doc">${md(readme.replace(/^\s*#\s+.*\r?\n/, ''), { link: compLink })}</div>`)); }
        body.append(el('<h3>Screens that draw it</h3>')); body.append(el(chipsFor(use.ids, 'Not observed on the atlas’s screens.')));
        body.append(reviewBlock(gate, st));
        wireChips(body); return;
      }
      const v = variants.find((x) => x.id === id); if (!v) return;
      if (v.use || v.notUse) {
        const bare = (t) => esc(String(t).replace(/^\s*(use for|not for|use|not)\s+/i, '')).replace(/(—\s*use\s+)([a-z][a-z-]*)/gi, (m, a, w) => (variants.some((x) => x.id === w.toLowerCase()) ? `${a}<a href="#" data-vt="${w.toLowerCase()}">${w}</a>` : m));
        const u = el(`<p class="vuse1">${v.use ? `<b>Use for</b> ${bare(v.use)}` : ''}${v.notUse ? `${v.use ? ' · ' : ''}<b>Not for</b> ${bare(v.notUse)}` : ''}</p>`);
        u.querySelectorAll('[data-vt]').forEach((a2) => { a2.onclick = (e) => { e.preventDefault(); if (tabs.some((t) => t.id === a2.dataset.vt)) show(a2.dataset.vt); }; });
        body.append(u);
      }
      body.append(drawn[v.id]);
      body.append(el('<h3>Listed for this variant</h3>')); body.append(el(chipsFor(v.usedBy, 'No screen listed for this variant.')));
      if (!same(v) && (v.scores || v.findings)) body.append(reviewBlock({ scores: v.scores, findings: v.findings }, v.status || 'in-design'));
      wireChips(body);
    }
    tabs.forEach((t) => { const b2 = el(`<button role="tab" data-id="${esc(t.id)}" aria-pressed="false">${t.id !== 'overview' ? dot(t.status || 'in-design') : ''}${esc(t.name)}</button>`); b2.onclick = () => show(t.id); bar.append(b2); });
    show(tabs.some((t) => t.id === want) ? want : 'overview');
  }
  const want = q.get('component');
  go(want && (pages[want] || want === '_task' || COMPONENT_GROUPS.some((g) => g[1].includes(want))) ? want : 'Overview');
}

/* ---------- Copy: one registry; screens refer to strings by id ---------- */
const NS_NAMES = { act: 'Shared actions', label: 'Shared labels', pp: 'Piglet processing', sp: 'Piglet processing · simple', tk: 'Task skeleton', ds: 'Design-system demos', fr: 'Farrowing', time: 'Time', dead: 'Deaths', pointer: 'Pointer', preview: 'Previews', receipt: 'Receipts', row: 'Rows', status: 'Status' };
const CAP = 300;
const DEMOS = ['pp', 'sp', 'ds']; // prototype and demo strings, one item at the foot of the nav

async function renderCopy() {
  if (!platform().copy) { emptyView('copy'); return; }
  const { pane, nav } = libShell('Copy', 'One registry, English and Chinese. Screens refer to strings by id, never raw text: change it here and it changes everywhere.');
  let reg; try { reg = await loadStrings(); } catch (_) { pane.innerHTML = FAILED('the string registry'); return; }
  const strings = Object.entries(reg.strings || {}), ns = {};
  strings.forEach(([id]) => { const k = id.split('.')[0]; ns[k] = (ns[k] || 0) + 1; });
  let key = q.get('key') || '@verbs';
  const search = el('<input class="search" type="search" placeholder="Search every string by English, 中文 or id">');
  const body = el('<div></div>');
  const nameOf = (k) => NS_NAMES[k] || k.charAt(0).toUpperCase() + k.slice(1);
  const table = (heads, rows) => `<table class="copy-table"><thead><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  const strRows = (list) => list.slice(0, CAP).map(([id, x]) => `<tr><td class="id">${esc(id)}</td><td>${esc(x.en)}</td><td>${esc(x.zh)}</td></tr>`);
  function draw() {
    nav.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', !search.value && b.dataset.k === key));
    const term = search.value.trim().toLowerCase();
    if (term) {
      const hits = strings.filter(([id, x]) => (id + ' ' + x.en + ' ' + x.zh).toLowerCase().includes(term));
      body.innerHTML = `<h2>Search <span class="muted" style="font-size:14px;font-weight:500">${hits.length}${hits.length > CAP ? ` · showing ${CAP}` : ''}</span></h2>` + (hits.length ? table(['Id', 'English', '中文'], strRows(hits)) : '<p class="none">No string matches.</p>'); return;
    }
    setParam('key', key === '@verbs' ? null : key);
    if (key === '@verbs') body.innerHTML = '<h2>Shared vocabulary</h2><p class="muted" style="margin:-6px 0 14px">Each verb has one meaning, everywhere.</p>' + table(['Verb', '中文', 'Means'], Object.entries(reg.verbs || {}).map(([v, x]) => `<tr><td><b>${esc(v)}</b></td><td>${esc(x.zh)}</td><td>${esc(x.meaning)}</td></tr>`));
    else if (key === '@banned') body.innerHTML = '<h2>Banned words</h2>' + table(['Word', 'Why'], Object.entries(reg.banned || {}).map(([w, why]) => `<tr><td><b>${esc(w)}</b></td><td>${esc(why)}</td></tr>`));
    else if (key === '@demos') body.innerHTML = '<h2>Demos</h2><p class="muted" style="margin:-6px 0 14px">Strings used only by prototypes and design-system demos. Search for a specific one.</p>' + DEMOS.map((k) => { const rows = strings.filter(([id]) => id.split('.')[0] === k); return `<h3>${esc(nameOf(k))} <span class="muted">${rows.length}${rows.length > CAP ? ` · showing ${CAP}` : ''}</span></h3>` + table(['Id', 'English', '中文'], strRows(rows)); }).join('');
    else { const rows = strings.filter(([id]) => id.split('.')[0] === key); body.innerHTML = `<h2>${esc(nameOf(key))} <span class="muted" style="font-size:14px;font-weight:500">${rows.length}${rows.length > CAP ? ` · showing ${CAP}, search for the rest` : ''}</span></h2>` + table(['Id', 'English', '中文'], strRows(rows)); }
  }
  [['@verbs', 'Shared vocabulary', Object.keys(reg.verbs || {}).length], ['@banned', 'Banned words', Object.keys(reg.banned || {}).length]].forEach(([k, n, c]) => navItem(nav, k, esc(n), c, () => { key = k; search.value = ''; draw(); }));
  nav.append(el('<h5>Strings</h5>'));
  Object.entries(ns).filter(([k]) => !DEMOS.includes(k)).sort((a, b) => b[1] - a[1]).forEach(([k, c]) => navItem(nav, k, esc(nameOf(k)), c, () => { key = k; search.value = ''; draw(); }));
  const demoN = DEMOS.reduce((n, k) => n + (ns[k] || 0), 0);
  if (demoN) navItem(nav, '@demos', 'Demos', demoN, () => { key = '@demos'; search.value = ''; draw(); });
  search.oninput = draw; pane.append(search, body); draw();
}


/* ---------- Backlog: what the reviews found, one line each until opened ---------- */
const BK = [['decision', 'Decision'], ['design', 'Design'], ['broken', 'Broken'], ['unclear', 'Unclear']];
const bkState = { kind: '', sec: '', feature: '' }; // kind '@todo' is every kind but decision
function renderBacklog() {
  if (!backlogItems().length) { emptyView('backlog'); return; }
  const main = document.getElementById('main'); main.innerHTML = '';
  const items = backlogItems(), idx = screenIndex(), feats = Object.fromEntries(allFeatures().map((f) => [f.id, f]));
  const where = (t) => {
    if (t.kind === 'screen' && idx[t.id]) { const s = idx[t.id]; return { fid: s.feature.id, key: 'screen:' + t.id, name: `${s.feature.name} · ${s.name}`, sec: s.feature.sectionRef.name, open: () => openFeature(s.feature.id, s.id) }; }
    if (t.kind === 'feature' && feats[t.id]) { const f = feats[t.id]; return { fid: f.id, key: 'feature:' + t.id, name: f.name, sec: f.sectionRef.name, open: () => openFeature(f.id) }; }
    if (t.kind === 'component') return { key: 'component:' + t.id, name: t.id, sec: 'Components', open: () => { S.view = 'components'; setParam('view', 'components'); setParam('component', t.id); setParam('variant', null); closeFeature(); render(); } };
    return { key: t.kind + ':' + t.id, name: String(t.id), sec: t.kind === 'section' ? String(t.id) : 'Other', open: null };
  };
  const secs = [...new Set(items.map((b) => where(b.target).sec))];
  const page = el('<div class="backlog"></div>'); main.append(page);
  const inScope = (b) => (!bkState.sec || where(b.target).sec === bkState.sec) && (!bkState.feature || where(b.target).fid === bkState.feature);
  const kindOk = (b) => !bkState.kind || (bkState.kind === '@todo' ? b.kind !== 'decision' : b.kind === bkState.kind);
  const counts = (k) => items.filter((b) => b.kind === k && inScope(b)).length;
  const fname = bkState.feature && feats[bkState.feature] ? feats[bkState.feature].name : '';
  const bar = el(`<div class="bkbar">${BK.map(([k, n]) => `<button class="bkc k-${k}" aria-pressed="${bkState.kind === k}" data-k="${k}"><b>${counts(k)}</b> ${n}</button>`).join('')}${fname ? `<button class="bkc bkfeat" data-clear title="Show every feature"><span>${esc(fname)}${bkState.kind === '@todo' ? ' · To-dos' : ''}</span><span aria-hidden="true">✕</span></button>` : ''}<select class="bksec" aria-label="Section"><option value="">All sections</option>${secs.map((s) => `<option${bkState.sec === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></div>`);
  const list = el('<div class="bklist"></div>'); page.append(bar, list);
  bar.querySelectorAll('.bkc').forEach((b) => { b.onclick = () => { bkState.kind = bkState.kind === b.dataset.k ? '' : b.dataset.k; renderBacklog(); }; });
  const clr = bar.querySelector('[data-clear]'); if (clr) clr.onclick = () => { bkState.feature = ''; if (bkState.kind === '@todo') bkState.kind = ''; renderBacklog(); };
  bar.querySelector('.bksec').onchange = (e) => { bkState.sec = e.target.value; renderBacklog(); };
  const shown = items.filter((b) => kindOk(b) && inScope(b));
  if (!shown.length) { list.append(el(`<p class="none">${items.length ? 'Nothing matches.' : 'No review items yet.'}</p>`)); return; }
  const groups = new Map();
  shown.forEach((b) => { const w = where(b.target); if (!groups.has(w.key)) groups.set(w.key, { w, items: [] }); groups.get(w.key).items.push(b); });
  const sevRank = { high: 0, medium: 1, low: 2 }, kRank = { decision: 0, broken: 1, design: 2, unclear: 3 };
  [...groups.values()].sort((a, b) => b.items.filter((x) => x.kind === 'decision').length - a.items.filter((x) => x.kind === 'decision').length || b.items.length - a.items.length).forEach((g) => {
    const sec = el(`<section class="bkgroup"><h3><span class="gname">${g.w.open ? '<a href="#"></a>' : '<span></span>'}</span><small>${esc(g.w.sec)} · ${g.items.length}</small></h3></section>`);
    const nm = sec.querySelector('.gname').firstElementChild; nm.textContent = g.w.name; if (g.w.open) nm.onclick = (e) => { e.preventDefault(); g.w.open(); };
    g.items.sort((a, b) => kRank[a.kind] - kRank[b.kind] || (sevRank[a.severity] ?? 1) - (sevRank[b.severity] ?? 1)).forEach((b) => {
      const opts = (b.options || []).map((o) => `<li>${esc(typeof o === 'string' ? o : o.label || o.name || JSON.stringify(o))}</li>`).join('');
      const row = el(`<div class="bkitem"><button class="bi" aria-expanded="false"><span class="ktag k-${esc(b.kind)}">${esc(cap(b.kind))}</span><span class="bt"></span></button><div class="bd" hidden>${b.detail ? `<p>${esc(b.detail).replace(/\n/g, '<br>')}</p>` : ''}${opts ? `<div class="bopt"><b>Options</b><ul>${opts}</ul></div>` : ''}${b.recommendation ? `<p class="brec"><b>Recommendation</b> ${esc(b.recommendation)}</p>` : ''}<small>${esc(b.source || '')}</small></div></div>`);
      row.querySelector('.bt').textContent = b.title;
      const btn = row.querySelector('.bi'), d = row.querySelector('.bd');
      btn.onclick = () => { d.hidden = !d.hidden; btn.setAttribute('aria-expanded', String(!d.hidden)); row.classList.toggle('open', !d.hidden); };
      sec.append(row);
    });
    list.append(sec);
  });
}
