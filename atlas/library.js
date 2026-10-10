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
let COMPONENT_GROUPS = [
  ['Base', ['Button', 'IconButton', 'Icon', 'Heading', 'Row', 'Panel', 'Facts', 'Log', 'Sheet', 'Segment', 'ChoiceList', 'CategoryFooter']],
  ['Inputs and filters', ['FilterSheet', 'RangeSlider']],
  ['Fields', ['Field', 'PickerField', 'Stepper', 'Measure', 'Numpad']],
  ['Status and feedback', ['Status', 'ConditionTag', 'Banner', 'Photos']],
  ['Task skeleton', ['TaskPhone', 'TaskHeader', 'TaskSummary', 'TaskLens', 'TaskGroup', 'TaskDock', 'TaskHold', 'TaskTotals', 'TaskProgress', 'TaskStepper', 'TaskPhotos', 'TaskChoice', 'TaskRadios', 'TaskWarning', 'TaskTable', 'TaskMetrics', 'TaskSection', 'TaskReceipt', 'TaskDay', 'TaskChips']],
];
const SKELETON_DEMO = `${DS}/components/task-skeleton-demo.html`;
const nameWords = (n) => n.replace(/([a-z])([A-Z])/g, '$1 $2');

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

function usedBy(name) {
  const re = new RegExp('\\b(' + [name, nameWords(name)].filter((v, i, a) => a.indexOf(v) === i).map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i');
  return Object.values(screenIndex()).filter((s) => s.notes && re.test(JSON.stringify([s.notes.elements, s.notes.controls])));
}

const SCORE_KEYS = ['clarity', 'budget', 'hierarchy', 'spacing', 'broken'], PASS = 8;
const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
function verdictOf(g) {
  const sc = (g && g.scores) || {}, ks = SCORE_KEYS.filter((k) => sc[k] != null);
  if (!ks.length) return null;
  const low = ks.reduce((m, k) => (sc[k] < sc[m] ? k : m), ks[0]), n = (g.findings || []).length, pass = sc[low] >= PASS;
  return { pass, low, text: pass ? `Passing · lowest ${sc[low]}/10` : `Not passing · lowest: ${cap(low)} ${sc[low]}/10${n ? ` · ${n} finding${n === 1 ? '' : 's'}` : ''}` };
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
    const cell = el(`<figure class="scell"><figcaption>${esc(opts.caption || s.getAttribute('data-state'))}</figcaption></figure>`), f = el('<iframe title="State"></iframe>');
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
  if (S.data.components) {
    S.data.components.forEach((c) => { CI[c.name] = c; });
    const order = [], by = {};
    S.data.components.forEach((c) => { if (!by[c.group]) { by[c.group] = []; order.push(c.group); } by[c.group].push(c.name); });
    COMPONENT_GROUPS = order.map((g) => [g, by[g]]);
  }
  const stOf = (n) => (CI[n] && CI[n].status) || 'in-design';
  const { pane, nav } = libShell('Components', 'The mobile design system. A component is set when the first feature that uses it freezes.');
  const count = COMPONENT_GROUPS.reduce((n, g) => n + g[1].length, 0) + 1;
  let ds = {}; try { ds = await getJson(`${DS}/design-system.json`); } catch (_) {}
  const pages = { _brand: 'Brand book', _foundations: 'Foundations', _icons: 'Icons' };
  const go = (key) => {
    setParam('component', key === 'Cover' ? null : key);
    setParam('variant', null);
    nav.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', b.dataset.k === key));
    pane.scrollTop = 0; pane.innerHTML = '';
    ({ Cover: pageCover, _brand: pageBrand, _foundations: pageFoundations, _icons: pageIcons, _task: pageTask }[key] || pageComponent)(key);
  };
  navItem(nav, 'Cover', 'Cover', null, () => go('Cover'));
  Object.entries(pages).forEach(([k, n]) => navItem(nav, k, n, null, () => go(k)));
  COMPONENT_GROUPS.filter((g) => g[0] !== 'Task skeleton').forEach(([g, names]) => {
    nav.append(el(`<h5>${esc(g)}</h5>`));
    names.forEach((n) => navItem(nav, n, `${dot(stOf(n))}${esc(n)}`, null, () => go(n)));
  });
  nav.append(el('<h5>Task skeleton</h5>'));
  navItem(nav, '_task', `${dot('in-design')}Task skeleton (to be organised)`, null, () => go('_task'));
  document.querySelector('.lib aside > p').textContent = `Mobile design system · ${count} parts. ` + 'A part is set when the first feature using it freezes.';

  const compLink = (u) => { const m = u.match(/(?:^|\/)([A-Za-z]+)\/README\.md$/); return m && COMPONENT_GROUPS.some((g) => g[1].includes(m[1])) ? '?view=components&component=' + m[1] : null; };
  pane.addEventListener('click', (e) => { const a = e.target.closest('a[href^="?view=components&component="]'); if (a) { e.preventDefault(); go(new URLSearchParams(a.getAttribute('href')).get('component')); } });

  async function pageCover() {
    const f = await styledPreview('Cover'); pane.append(f || el(FAILED('the cover')));
    const by = (st) => (S.data.components || []).filter((c) => c.status === st);
    const bits = [['agent-checked', 'agent-checked'], ['in-design', 'in design'], ['placeholder', 'placeholder']].filter(([st]) => by(st).length)
      .map(([st, w]) => `<a href="#" data-st="${st}">${by(st).length} ${w}</a>`);
    if (bits.length) { const line = el(`<p class="cstat">${bits.join(' · ')}</p>`); pane.append(line); line.querySelectorAll('a').forEach((a) => { a.onclick = (e) => { e.preventDefault(); go(by(a.dataset.st)[0].name); }; }); }
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
    let readme = ''; try { readme = await getText(`${DS}/components/${name}/README.md`); } catch (_) {}
    const cand = /candidate/i.test(readme.slice(0, 300)), adr = (readme.slice(0, 400).match(/ADR (\d{4})/) || [])[1];
    if (cand) meta.querySelector('.t').textContent += ` · candidate${adr ? ' (ADR ' + adr + ')' : ''}`;
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
    const chipsFor = (ids) => {
      const ix = screenIndex(), ok = (ids || []).map((x) => String(x).split(' ')[0]).filter((x) => ix[x]);
      if (!ok.length) return '<p class="none">No screen uses this yet.</p>';
      return `<div class="usedby">${ok.slice(0, 16).map((x) => `<a href="?feature=${esc(ix[x].feature.id)}&screen=${esc(x)}" data-sid="${esc(x)}">${esc(ix[x].feature.name)} · ${esc(ix[x].name)}</a>`).join('')}${ok.length > 16 ? `<span class="muted">+${ok.length - 16} more</span>` : ''}</div>`;
    };
    const wireChips = (root) => root.querySelectorAll('a[data-sid]').forEach((a2) => { a2.onclick = (e) => { e.preventDefault(); const s = screenIndex()[a2.dataset.sid]; openFeature(s.feature.id, s.id); }; });
    const same = (v) => JSON.stringify([v.scores || null, v.findings || null]) === JSON.stringify([gate && gate.scores || null, gate && gate.findings || null]);
    async function show(id) {
      bar.querySelectorAll('button').forEach((b2) => b2.setAttribute('aria-pressed', String(b2.dataset.id === id)));
      setParam('variant', id === 'overview' ? null : id); body.innerHTML = '';
      if (id === 'overview') {
        body.append(gateBlock(gate, st));
        if (withStates.length > 1) { // one captioned example per variant; the states live in the variant tabs
          const g = el('<div class="sgrid ovgrid"></div>');
          for (const v of withStates) { const one = await stateGridAt(dirOf, v.id, { one: true, bare: true, caption: v.name }); if (one) g.append(...one.children); }
          body.append(g);
        } else {
          const prev = await styledPreview(name);
          body.append(prev || el('<div class="nopreview">No preview of its own yet — built in the component pass</div>'));
        }
        if (without.length) body.append(el(`<p class="muted" style="margin:0 0 14px;font-size:12.5px">Variants (to be drawn in the component pass): ${without.map((v) => esc(v.name)).join(' · ')}</p>`));
        else if (!variants.length) body.append(el('<p class="muted" style="margin:0 0 14px;font-size:12px">Variants and their states are written in the component pass.</p>'));
        if (readme) { body.append(el('<h3>Guidelines</h3>')); body.append(el(`<div class="guide doc">${md(readme.replace(/^\s*#\s+.*\r?\n/, ''), { link: compLink })}</div>`)); }
        /* real screen ids: the variants' own usedBy plus any screen whose notes name the component */
        const ids = [...new Set([...variants.flatMap((v) => v.usedBy || []), ...usedBy(name).map((x) => x.id)])];
        body.append(el('<h3>Used by</h3>')); body.append(el(chipsFor(ids)));
        wireChips(body); return;
      }
      const v = variants.find((x) => x.id === id); if (!v) return;
      if (v.use || v.notUse) {
        const bare = (t) => esc(String(t).replace(/^\s*(use for|not for|use|not)\s+/i, '')).replace(/(—\s*use\s+)([a-z][a-z-]*)/gi, (m, a, w) => (variants.some((x) => x.id === w.toLowerCase()) ? `${a}<a href="#" data-vt="${w.toLowerCase()}">${w}</a>` : m));
        const u = el(`<p class="vuse1">${v.use ? `<b>Use for</b> ${bare(v.use)}` : ''}${v.notUse ? `${v.use ? ' · ' : ''}<b>Not for</b> ${bare(v.notUse)}` : ''}</p>`);
        u.querySelectorAll('[data-vt]').forEach((a2) => { a2.onclick = (e) => { e.preventDefault(); if (tabs.some((t) => t.id === a2.dataset.vt)) show(a2.dataset.vt); }; });
        body.append(u);
      }
      if (!same(v) && (v.scores || v.findings)) body.append(gateBlock({ scores: v.scores, findings: v.findings }, v.status || 'in-design'));
      body.append(drawn[v.id]);
      body.append(el('<h3>Used by</h3>')); body.append(el(chipsFor(v.usedBy))); wireChips(body);
    }
    tabs.forEach((t) => { const b2 = el(`<button role="tab" data-id="${esc(t.id)}" aria-pressed="false">${t.id !== 'overview' ? dot(t.status || 'in-design') : ''}${esc(t.name)}</button>`); b2.onclick = () => show(t.id); bar.append(b2); });
    show(tabs.some((t) => t.id === want) ? want : 'overview');
  }
  const want = q.get('component');
  const inTask = want && (COMPONENT_GROUPS.find((g) => g[0] === 'Task skeleton') || [0, []])[1].includes(want);
  go(inTask || want === '_task' ? '_task' : want && (pages[want] || want === 'Cover' || COMPONENT_GROUPS.some((g) => g[1].includes(want))) ? want : 'Cover');
}

/* ---------- Copy: one registry; screens refer to strings by id ---------- */
const NS_NAMES = { act: 'Shared actions', label: 'Shared labels', pp: 'Piglet processing', sp: 'Piglet processing · simple', tk: 'Task skeleton', ds: 'Design-system demos', fr: 'Farrowing', time: 'Time', dead: 'Deaths', pointer: 'Pointer', preview: 'Previews', receipt: 'Receipts', row: 'Rows', status: 'Status' };
const CAP = 300;
const DEMOS = ['pp', 'sp', 'ds']; // prototype and demo strings, one item at the foot of the nav

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
  const main = document.getElementById('main'); main.innerHTML = '';
  const items = S.data.backlog || [], idx = screenIndex(), feats = Object.fromEntries(allFeatures().map((f) => [f.id, f]));
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
