/* Atlas core: state, URL, header, pan-zoom, a tiny markdown renderer, the board and the Old UI view.
   feature.js draws a feature page; library.js draws Components and Copy; boot.js starts everything. */
'use strict';

const q = new URLSearchParams(location.search);
const S = { data: null, view: 'atlas', platformId: 'mobile' };
const VIEWS = [['atlas', 'Features'], ['components', 'Components'], ['copy', 'Copy'], ['backlog', 'Backlog'], ['old', 'Old UI']];
const STATUS = { 'in-design': 'In design', 'agent-checked': 'Agent-checked', approved: 'Approved', frozen: 'Frozen', placeholder: 'Placeholder' };

const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstElementChild; };
const esc = (x) => String(x ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dot = (st) => `<span class="dot st-${esc(st)}" title="${esc(STATUS[st] || st)}"></span>`;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const platform = () => S.data.platforms.find((p) => p.id === S.platformId) || S.data.platforms[0];
const backlogItems = () => platform().backlog || [];
/* a platform with nothing yet says so in one line, naming what will appear */
function emptyView(what) { const pl = platform(), main = document.getElementById('main'); main.innerHTML = ''; main.append(el(`<div class="empty"><b>No ${esc(pl.name)} ${esc(what)} yet</b><span>${esc(pl.name)} ${esc(what)} will appear here when the ${esc(pl.name)} app has them.</span></div>`)); }
const allFeatures = () => S.data.platforms.flatMap((p) => p.sections.flatMap((s) => s.features.map((f) => Object.assign({}, f, { sectionRef: s }))));
const screenIndex = () => Object.fromEntries(allFeatures().flatMap((f) => f.screens.map((s) => [s.id, Object.assign({}, s, { feature: f })])));
const setParam = (k, v) => { const u = new URLSearchParams(location.search); v == null || v === '' ? u.delete(k) : u.set(k, v); history.replaceState(null, '', u.toString() ? '?' + u : location.pathname); };

/* ---------- header ---------- */
function header(crumb) {
  const v = document.getElementById('views'); v.innerHTML = '';
  VIEWS.forEach(([id, n]) => { const b = el(`<button aria-pressed="${S.view === id}">${n}</button>`); b.onclick = () => setView(id); v.append(b); });
  const p = document.getElementById('platforms'); p.innerHTML = '';
  S.data.platforms.forEach((pl) => { const b = el(`<button aria-pressed="${pl.id === S.platformId}">${esc(pl.name)}</button>`); b.onclick = () => { S.platformId = pl.id; closeFeature(); ['component', 'key', 'variant'].forEach((k) => setParam(k, null)); render(); }; p.append(b); });
  document.getElementById('crumb').innerHTML = crumb || '';
}
function setView(id) { S.view = id; ['feature', 'screen', 'component', 'key'].forEach((k) => setParam(k, null)); closeFeature(); render(); }
function render() {
  setParam('view', S.view === 'atlas' ? null : S.view); setParam('platform', S.platformId === 'mobile' ? null : S.platformId);
  header('');
  ({ old: renderOld, components: renderComponents, copy: renderCopy, backlog: renderBacklog }[S.view] || renderBoard)();
}

/* ---------- pan and zoom, shared by the board and the flow. A drag never clicks or selects. ---------- */
function panzoom(wrap, plane, fitFn, opts = {}) {
  const t = { x: 0, y: 0, k: 1 }, MIN = 0.25, MAX = 1.8;
  const apply = () => { plane.style.transform = `translate(${t.x}px,${t.y}px) scale(${t.k})`; };
  let start = null;
  wrap.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('.zoom, .edgechip')) return;
    e.preventDefault(); start = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y, id: e.pointerId }; wrap.dataset.moved = '';
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!wrap.dataset.moved) { if (Math.abs(dx) + Math.abs(dy) < 6) return; wrap.dataset.moved = '1'; wrap.classList.add('drag'); try { wrap.setPointerCapture(start.id); } catch (_) {} }
    t.x = start.tx + dx; t.y = start.ty + dy; apply();
  });
  const end = () => { start = null; wrap.classList.remove('drag'); setTimeout(() => { wrap.dataset.moved = ''; }, 0); };
  wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (opts.scroll && !(e.ctrlKey || e.metaKey)) { // a plain wheel scrolls; ctrl/cmd + wheel zooms
      const sz = opts.size(), r = wrap.getBoundingClientRect(), pad = 14;
      t.y = Math.max(Math.min(pad, r.height - sz.height * t.k), Math.min(pad, t.y - e.deltaY));
      if (sz.width * t.k > r.width - 2 * pad) t.x = Math.max(r.width - sz.width * t.k - pad, Math.min(pad, t.x - e.deltaX));
      apply(); return;
    }
    const k = Math.min(MAX, Math.max(MIN, t.k * Math.exp(-e.deltaY * 0.0015)));
    const r = wrap.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    t.x = mx - (mx - t.x) * (k / t.k); t.y = my - (my - t.y) * (k / t.k); t.k = k; apply();
  }, { passive: false });
  wrap.addEventListener('click', (e) => { if (wrap.dataset.moved) { e.stopPropagation(); e.preventDefault(); } }, true);
  wrap.addEventListener('selectstart', (e) => e.preventDefault());
  wrap.addEventListener('dragstart', (e) => e.preventDefault());
  const fit = () => { Object.assign(t, fitFn()); apply(); };
  const step = (f) => { const r = wrap.getBoundingClientRect(), cx = r.width / 2, cy = r.height / 2, k = Math.min(MAX, Math.max(MIN, t.k * f)); t.x = cx - (cx - t.x) * (k / t.k); t.y = cy - (cy - t.y) * (k / t.k); t.k = k; apply(); };
  const reveal = (n) => { const r = wrap.getBoundingClientRect(), b = n.getBoundingClientRect(), m = 24; let dx = 0, dy = 0;
    if (b.left < r.left + m) dx = r.left + m - b.left; else if (b.right > r.right - m) dx = r.right - m - b.right;
    if (b.top < r.top + m) dy = r.top + m - b.top; else if (b.bottom > r.bottom - m) dy = r.bottom - m - b.bottom;
    t.x += dx; t.y += dy; apply(); };
  return { fit, step, reveal, pan: (dx, dy) => { t.x += dx; t.y += dy; apply(); }, state: t };
}
/* scale that fits a (w x h) drawing into a wrapper, centred */
function fitTo(wrap, w, h, maxK = 1, pad = 24, minK = 0.25) {
  const r = wrap.getBoundingClientRect(), k = Math.max(minK, Math.min(maxK, (r.width - pad * 2) / w, (r.height - pad * 2) / h));
  return { k, x: Math.max(pad, (r.width - w * k) / 2), y: pad }; // top-aligned; pan for the rest
}

/* ---------- a tiny, safe markdown renderer: headings, paragraphs, lists, tables, bold, code, links ---------- */
function md(src, opts = {}) {
  const href = (u) => { if (/^(https?:|mailto:)/i.test(u)) return { h: u, ext: true }; const r = opts.link && opts.link(u); return r ? { h: r } : null; };
  const inline = (t) => {
    const codes = [];
    t = t.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    t = esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, u) => { const l = href(u.replace(/&amp;/g, '&')); return l ? `<a href="${esc(l.h)}"${l.ext ? ' target="_blank" rel="noopener"' : ''}>${a}</a>` : a; });
    return t.replace(/\u0000(\d+)\u0000/g, (_, n) => `<code>${esc(codes[n])}</code>`);
  };
  const lines = String(src || '').replace(/\r/g, '').split('\n'), out = [];
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  for (let i = 0; i < lines.length;) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (/^```/.test(l)) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`); continue; }
    let m = l.match(/^(#{1,4})\s+(.*)$/);
    if (m) { out.push(`<h${m[1].length} id="h-${esc(m[2].toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${inline(m[2])}</h${m[1].length}>`); i++; continue; }
    if (/^\s*\|/.test(l) && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] || '')) {
      const head = cells(l); i += 2; const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`); continue;
    }
    m = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (m) {
      const ord = /\d/.test(m[2]), items = [];
      while (i < lines.length && (m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/))) {
        let t = m[3]; i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s/.test(lines[i])) t += ' ' + lines[i++].trim();
        items.push(`<li>${inline(t)}</li>`);
      }
      out.push(`<${ord ? 'ol' : 'ul'}>${items.join('')}</${ord ? 'ol' : 'ul'}>`); continue;
    }
    const para = [l]; i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|\s*([-*]|\d+\.)\s|\s*\|)/.test(lines[i])) para.push(lines[i++]);
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

/* ---------- board ---------- */
const FEATURE_ICON = { farrowing: 'farrow', 'farrowing-record': 'record', 'piglet-processing': 'spark', inspection: 'monitor', 'pig-list': 'grid', 'pig-profile': 'profile', disease: 'alert', 'health-record': 'health', prescriptions: 'treat', triage: 'hospital', treat: 'treat', 'report-death': 'alert', abortion: 'alert', 'feed-plan': 'feed', 'data-sync': 'upload', sampling: 'details', environment: 'temperature', workbench: 'home', breeding: 'heat', 'heat-check': 'heat', heat: 'heat', pregnancy: 'pregnancy', 'return-heat': 'return', 'post-farrowing': 'farrow', weaning: 'calendar', wean: 'calendar', weight: 'weight', backfat: 'chart', temperature: 'temperature', move: 'transfer', missing: 'place', 'keep-breeding': 'bookmark', 'unexpected-pregnancy': 'pregnancy', fostering: 'link', 'end-finishing': 'check', 'end-nursery': 'check' };
const hasPrd = (f) => !!(f.prd && f.prd.trim() && !/not designed yet/i.test(f.prd));
async function renderPattern(sec, pt) {
  const main = document.getElementById('main'); main.innerHTML = '';
  header(`<a href="#" id="pat-back">${esc(sec.name)}</a> / <b>${esc(pt.name)}</b> <span class="zh">Pattern</span>`);
  document.getElementById('pat-back').onclick = (e) => { e.preventDefault(); render(); };
  const idx = screenIndex(), pid = String(pt.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), dir = `/sections/${sec.id}/patterns/${pid}/`;
  const page = el(`<div class="patternpage"><h2>${esc(pt.name)}</h2><div class="pbody"></div></div>`), body = page.querySelector('.pbody');
  main.append(page);
  let vj = null; try { vj = await getJson(dir + 'variants.json'); } catch (_) {}
  const chips = () => `<div class="seen"><h3>Seen on</h3><div class="usedby">${(pt.screens || []).filter((id) => idx[id]).map((id) => `<a href="#" data-sid="${esc(id)}">${esc(idx[id].feature.name)} · ${esc(idx[id].name)}</a>`).join("")}</div></div>`;
  const wire = (root) => root.querySelectorAll('a[data-sid]').forEach((a2) => { a2.onclick = (e) => { e.preventDefault(); const s = idx[a2.dataset.sid]; openFeature(s.feature.id, s.id); }; });
  const phones = () => { const row = el('<div class="phones"></div>'); (pt.screens || []).forEach((id) => { const s = idx[id]; if (!s) return; const cell = el(`<figure><figcaption>${dot(s.status)}<a href="#">${esc(s.feature.name)} · ${esc(s.name)}</a></figcaption></figure>`); cell.querySelector('a').onclick = (e) => { e.preventDefault(); openFeature(s.feature.id, s.id); }; cell.append(shot(s, { height: 640 })); row.append(cell); }); return row; };
  const drawn = {};
  if (pt.note && !(vj || []).some((v) => v.use || v.notUse)) page.querySelector('h2').insertAdjacentHTML('afterend', `<p class="muted">${esc(pt.note)}</p>`); // Use for / Not for say the same, so the note only stands when they are missing
  if (vj) await Promise.all(vj.map(async (v) => { drawn[v.id] = await stateGridAt(dir, v.id, { bare: true }); }));
  const tabs = (vj || []).filter((v) => drawn[v.id]);
  if (!tabs.length) { // no states drawn yet: the live screens, behind a closed disclosure
    body.append(el('<p class="muted" style="margin:0 0 12px">This pattern’s states haven’t been drawn yet — the component pass draws them.</p>'));
    const d = el('<details class="cur"><summary>Current view ›</summary></details>'); let done = false;
    d.addEventListener('toggle', () => { if (d.open && !done) { done = true; d.append(phones()); } });
    body.append(d, el(chips())); wire(body); return;
  }
  const bar = el('<div class="vtabs" role="tablist"></div>'), inner = el('<div class="vbody"></div>'); if (tabs.length > 1) body.append(bar); body.append(inner);
  const show = (id) => {
    bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id))); inner.innerHTML = '';
    const v = tabs.find((x) => x.id === id);
    if (v.use || v.notUse) inner.append(el(`<p class="vuse1">${v.use ? `<b>Use for</b> ${esc(v.use)}` : ''}${v.notUse ? `${v.use ? ' · ' : ''}<b>Not for</b> ${esc(v.notUse)}` : ''}</p>`));
    inner.append(drawn[id], el(chips())); wire(inner);
  };
  tabs.forEach((v) => { const b = el(`<button role="tab" data-id="${esc(v.id)}" aria-pressed="false">${esc(v.name)}</button>`); b.onclick = () => show(v.id); bar.append(b); });
  show(tabs[0].id);
}
function renderBoard() {
  const main = document.getElementById('main'); main.innerHTML = '';
  const pl = platform();
  if (!pl.sections.length) { emptyView('features'); return; }
  const board = el(`<div class="board"><div class="plane"></div></div>`);
  const zoomEl = el('<div class="zoom"><button data-z="-1" title="Zoom out">−</button><button data-z="0" title="Fit everything">⤢</button><button data-z="1" title="Zoom in">+</button></div>');
  const plane = board.querySelector('.plane'); main.append(board, zoomEl);
  let x = 40, y = 40, rowH = 0, maxX = 0; const ROW = 1500;
  pl.sections.forEach((s) => {
    const r = el(`<section class="region"><h2 ${s.shared ? `title="${esc(s.shared)}"` : ''}>${esc(s.name)} <small>${esc(s.zh)}</small></h2>${(s.patterns || []).length ? `<div class="patterns">Patterns ${(s.patterns || []).map((p, i) => `<button data-p="${i}">${esc(p.name)}</button>`).join('')}</div>` : ''}<div class="cards"></div></section>`);
    r.querySelectorAll('[data-p]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); renderPattern(s, s.patterns[+b.dataset.p]); }; });
    r.querySelector('.cards').style.gridTemplateColumns = `repeat(${Math.min(3, s.features.length)}, 200px)`;
    s.features.forEach((f) => {
      const n = f.screens.length;
      const c = el(`<button class="card ${f.status === 'placeholder' ? 'placeholder' : ''}"><div class="name">${dot(f.status)}<span class="ico" data-i="${esc(FEATURE_ICON[f.id] || '')}"></span>${esc(f.name)}</div><div class="zh">${esc(f.zh || '')}</div><div class="size">${plural(n, 'screen')}${hasPrd(f) ? '<span class="prdtag">PRD</span>' : ''}</div></button>`);
      c.onclick = () => openFeature(f.id); r.querySelector('.cards').append(c);
    });
    plane.append(r);
    const rw = r.offsetWidth, rh = r.offsetHeight;
    if (x > 40 && x + rw > ROW) { x = 40; y += rowH + 32; rowH = 0; }
    r.style.left = x + 'px'; r.style.top = y + 'px'; x += rw + 32; rowH = Math.max(rowH, rh); maxX = Math.max(maxX, x);
  });
  loadIcons().then((icons) => plane.querySelectorAll('.ico').forEach((n) => { n.innerHTML = icons && (n.dataset.i in icons.paths || n.dataset.i in icons.aliases) ? iconSvg(icons, n.dataset.i, 16, '') : '<i class="neutral"></i>'; }));
  const W = maxX + 8, H = y + rowH + 90; // room under the last row for the zoom controls
  const pz = panzoom(board, plane, () => { const t = fitTo(board, W, H, 1, 0, 0.9); return { k: t.k, x: 0, y: 0 }; });
  zoomEl.querySelectorAll('[data-z]').forEach((b) => { b.onclick = () => { const z = +b.dataset.z; z ? pz.step(z > 0 ? 1.2 : 1 / 1.2) : pz.fit(); }; });
  pz.fit();
}

/* ---------- Old UI: the only place Figma appears ---------- */
function renderOld() {
  const main = document.getElementById('main'); main.innerHTML = '';
  const files = platform().oldUi || [];
  if (!files.length) { emptyView('old UI'); return; }
  const total = files.reduce((n, f) => n + f.screens, 0);
  const wrap = el(`<div class="index"><aside><h1>Old UI</h1><p>The mobile app as it is today, in Figma: ${plural(files.length, 'file')}, about ${total} screens. Reference for research; not part of the atlas.</p></aside><div class="list"></div></div>`);
  const list = wrap.querySelector('.list');
  files.forEach((f) => {
    list.append(el(`<h2><span>${esc(f.file)}</span> <span class="n">${plural(f.screens, 'screen')}</span><a class="fileopen" href="https://www.figma.com/design/${esc(f.key)}/" target="_blank" rel="noopener">Open file ↗</a></h2>`));
    f.flows.forEach(([name, n, node]) => list.append(el(`<a class="row" target="_blank" rel="noopener" href="https://www.figma.com/design/${esc(f.key)}/?node-id=${esc(String(node).replace(':', '-'))}"><b>${esc(name)}</b><span class="muted n">${plural(n, 'screen')}</span><span class="muted">↗</span></a>`)));
  });
  main.append(wrap);
}

addEventListener('keydown', (e) => { if (e.key === 'Escape' && !document.getElementById('feature').hidden) closeFeature(); });
