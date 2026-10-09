/* Components (a host for the mobile design system in ux/design-system) and Copy (the string registry). */
'use strict';

const DS = '/ux/design-system';
const cache = {};
const getJson = (u) => (cache[u] = cache[u] || fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); }));
const getText = (u) => (cache[u] = cache[u] || fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.text(); }));
const loadStrings = () => getJson('/ux/laws/strings.json').catch(() => ({ verbs: {}, banned: {}, strings: {} }));
const loadIconPaths = () => cache.icons || (cache.icons = new Promise((res) => { const t = document.createElement('script'); t.src = '/ux/system/sentri-icons.js'; t.onload = () => res((globalThis.SentriIcons && SentriIcons.paths) || {}); t.onerror = () => res({}); document.head.append(t); }));
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
const COMPONENT_GROUPS = [
  ['Base', ['Button', 'IconButton', 'Icon', 'Heading', 'Row', 'Panel', 'Facts', 'Log', 'Sheet', 'Segment', 'ChoiceList', 'CategoryFooter']],
  ['Fields', ['Field', 'PickerField', 'Stepper', 'Measure', 'Numpad']],
  ['Status and feedback', ['Status', 'Banner', 'Photos']],
  ['Task skeleton', ['TaskPhone', 'TaskHeader', 'TaskSummary', 'TaskLens', 'TaskGroup', 'TaskRow', 'TaskDock', 'TaskSheet', 'TaskHold', 'TaskTotals', 'TaskProgress', 'TaskStepper', 'TaskPhotos', 'TaskChoice', 'TaskRadios', 'TaskWarning', 'TaskTable', 'TaskMetrics', 'TaskSection', 'TaskReceipt', 'TaskDay', 'TaskPage', 'TaskDialog', 'TaskChips']],
];
const SKELETON_DEMO = `${DS}/components/task-skeleton-demo.html`;
const nameWords = (n) => n.replace(/([a-z])([A-Z])/g, '$1 $2');

/* a preview rendered styled: the previews expect a host that preloads tokens, the bundle and the fonts */
async function styledPreview(name) {
  const dir = `${DS}/components/${name}/`;
  let html; try { html = await getText(dir + 'preview.html'); } catch (e) { return null; }
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

function usedBy(name) {
  const re = new RegExp('\\b(' + [name, nameWords(name)].filter((v, i, a) => a.indexOf(v) === i).map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i');
  return Object.values(screenIndex()).filter((s) => s.notes && re.test(JSON.stringify([s.notes.elements, s.notes.controls])));
}

async function renderComponents() {
  const { pane, nav } = libShell('Components', 'The mobile design system. A component is set when the first feature that uses it freezes.');
  const count = COMPONENT_GROUPS.reduce((n, g) => n + g[1].length, 0) + 1;
  let ds = {}; try { ds = await getJson(`${DS}/design-system.json`); } catch (_) {}
  const pages = { _brand: 'Brand book', _foundations: 'Foundations', _icons: 'Icons' };
  const go = (key) => {
    setParam('component', key === 'Cover' ? null : key);
    nav.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', b.dataset.k === key));
    pane.scrollTop = 0; pane.innerHTML = '';
    ({ Cover: pageCover, _brand: pageBrand, _foundations: pageFoundations, _icons: pageIcons, _task: pageTask }[key] || pageComponent)(key);
  };
  navItem(nav, 'Cover', 'Cover', null, () => go('Cover'));
  Object.entries(pages).forEach(([k, n]) => navItem(nav, k, n, null, () => go(k)));
  COMPONENT_GROUPS.filter((g) => g[0] !== 'Task skeleton').forEach(([g, names]) => {
    nav.append(el(`<h5>${esc(g)}</h5>`));
    names.forEach((n) => navItem(nav, n, `${dot('in-design')}${esc(n)}`, null, () => go(n)));
  });
  nav.append(el('<h5>Task skeleton</h5>'));
  navItem(nav, '_task', `${dot('in-design')}Task skeleton (to be organised)`, null, () => go('_task'));
  document.querySelector('.lib aside > p').textContent = `Mobile design system · ${count} parts. ` + 'A part is set when the first feature using it freezes.';

  const compLink = (u) => { const m = u.match(/(?:^|\/)([A-Za-z]+)\/README\.md$/); return m && COMPONENT_GROUPS.some((g) => g[1].includes(m[1])) ? '?view=components&component=' + m[1] : null; };
  pane.addEventListener('click', (e) => { const a = e.target.closest('a[href^="?view=components&component="]'); if (a) { e.preventDefault(); go(new URLSearchParams(a.getAttribute('href')).get('component')); } });

  async function pageCover() {
    pane.append(el('<h2>Cover</h2>')); const f = await styledPreview('Cover'); pane.append(f || el(FAILED('the cover')));
  }
  async function pageBrand() {
    pane.append(el('<h2>Brand book</h2>'));
    try { pane.append(el(`<div class="guide doc">${md(await getText(`${DS}/README.md`), { link: compLink })}</div>`)); } catch (_) { pane.append(el(FAILED('the brand book'))); }
  }
  async function pageIcons() {
    pane.append(el('<h2>Icons</h2>'));
    const order = ds?.assetGroups?.Icons?.order || [];
    if (!order.length) { pane.append(el(FAILED('the icon list'))); return; }
    // The listed assets/Icons/*.svg are not all in the repo; the registry holds every glyph, drawn here as the files are (ink, stroke 1.6).
    const paths = await loadIconPaths();
    const glyph = (n) => (paths[n] ? `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#20291f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 8px"><path d="${esc(paths[n])}"/></svg>` : `<img src="${DS}/assets/Icons/${esc(n)}.svg" alt="">`);
    pane.append(el(`<div class="icons">${order.map((f) => { const n = f.replace(/\.svg$/, ''); return `<div>${glyph(n)}${esc(n)}</div>`; }).join('')}</div>`));
  }
  async function pageFoundations() {
    pane.append(el('<h2>Foundations</h2>'));
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
    pane.append(el('<h2>Task skeleton (to be organised)</h2>'));
    pane.append(el(`<div class="cmeta">${dot('in-design')}<span class="t">${esc(STATUS['in-design'])}</span></div>`));
    pane.append(el('<p class="muted" style="max-width:720px;margin:0 0 14px">Extracted from Farrowing in one go (ADR 0003). Most of these are the task page’s structure (they belong on the Tasks section’s Task skeleton page), some duplicate base components, two belong to Piglet processing. Organised in the component pass (#45).</p>'));
    pane.append(el(`<iframe class="preview" title="Task skeleton demo" src="${SKELETON_DEMO}" style="width:100%;height:900px;border:1px solid var(--line)"></iframe>`));
    pane.append(el('<h3>Parts</h3>'));
    const names = (COMPONENT_GROUPS.find((g) => g[0] === 'Task skeleton') || [0, []])[1];
    pane.append(el(`<div class="usedby">${names.map((n) => `<a href="${DS}/components/${esc(n)}/README.md" target="_blank" rel="noopener">${esc(n)}</a>`).join('')}</div>`));
  }
  async function pageComponent(name) {
    const group = (COMPONENT_GROUPS.find((g) => g[1].includes(name)) || [''])[0];
    const head = el(`<h2>${esc(name)}</h2>`); pane.append(head);
    const meta = el(`<div class="cmeta">${dot('in-design')}<span class="t">${esc(STATUS['in-design'])} · ${esc(group)}</span></div>`); pane.append(meta);
    pane.append(el('<p class="muted" style="margin:-6px 0 14px;font-size:12px">Variants and their states are written in the component pass.</p>'));
    let readme = ''; try { readme = await getText(`${DS}/components/${name}/README.md`); } catch (_) {}
    const cand = /candidate/i.test(readme.slice(0, 300)), adr = (readme.slice(0, 400).match(/ADR (\d{4})/) || [])[1];
    if (cand) meta.querySelector('.t').textContent += ` · candidate${adr ? ' (ADR ' + adr + ')' : ''}`;
    let prev = await styledPreview(name);
    if (!prev) {
      prev = el('<div class="nopreview">No preview of its own yet — built in the component pass</div>');
    }
    pane.append(prev);
    const used = usedBy(name);
    pane.append(el('<h3>Used by</h3>'));
    if (!used.length) pane.append(el('<p class="none">Not mapped yet.</p>'));
    else {
      const u = el('<div class="usedby"></div>');
      used.slice(0, 16).forEach((s) => { const a = el(`<a href="?feature=${esc(s.feature.id)}&screen=${esc(s.id)}">${esc(s.feature.name)} · ${esc(s.name)}</a>`); a.onclick = (e) => { e.preventDefault(); openFeature(s.feature.id, s.id); }; u.append(a); });
      if (used.length > 16) u.append(el(`<span class="muted">+${used.length - 16} more</span>`));
      pane.append(u);
    }
    pane.append(el('<h3>Guidelines</h3>'));
    pane.append(el(readme ? `<div class="guide doc">${md(readme, { link: compLink })}</div>` : '<p class="none">No README written yet.</p>'));
  }
  const want = q.get('component');
  const inTask = want && (COMPONENT_GROUPS.find((g) => g[0] === 'Task skeleton') || [0, []])[1].includes(want);
  go(inTask || want === '_task' ? '_task' : want && (pages[want] || want === 'Cover' || COMPONENT_GROUPS.some((g) => g[1].includes(want))) ? want : 'Cover');
}

/* ---------- Copy: one registry; screens refer to strings by id ---------- */
const NS_NAMES = { act: 'Shared actions', label: 'Shared labels', pp: 'Piglet processing', sp: 'Piglet processing · simple', tk: 'Task skeleton', ds: 'Design-system demos', fr: 'Farrowing', time: 'Time', dead: 'Deaths', pointer: 'Pointer', preview: 'Previews', receipt: 'Receipts', row: 'Rows', status: 'Status' };
const CAP = 300;

async function renderCopy() {
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
    else { const rows = strings.filter(([id]) => id.split('.')[0] === key); body.innerHTML = `<h2>${esc(nameOf(key))} <span class="muted" style="font-size:14px;font-weight:500">${rows.length}${rows.length > CAP ? ` · showing ${CAP}, search for the rest` : ''}</span></h2>` + table(['Id', 'English', '中文'], strRows(rows)); }
  }
  [['@verbs', 'Shared vocabulary', Object.keys(reg.verbs || {}).length], ['@banned', 'Banned words', Object.keys(reg.banned || {}).length]].forEach(([k, n, c]) => navItem(nav, k, esc(n), c, () => { key = k; search.value = ''; draw(); }));
  nav.append(el('<h5>Strings</h5>'));
  Object.entries(ns).sort((a, b) => b[1] - a[1]).forEach(([k, c]) => navItem(nav, k, esc(nameOf(k)), c, () => { key = k; search.value = ''; draw(); }));
  search.oninput = draw; pane.append(search, body); draw();
}
