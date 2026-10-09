/* A feature page: the flow in the centre, a live phone docked on the right, notes behind a button.
   Organising rule: a feature with an anchor (Farrowing's sow) is laid out by the anchor's statuses,
   left to right, inside the task's status bands; each screen sits in the status where it can be reached.
   A feature without an anchor uses its named groups as stacked strips. Arrows: only the selected node's. */
'use strict';

let CURRENT = null; // the open feature page: { follow(id) } so a bare screen can announce where a tap took it

/* ---------- a live screen ----------
   A screen opens bare: the prototype page with ?screen=<id> (ux/system/atlas-bare.js) renders only the phone's content at
   390 x 844 and posts { atlasReady: id }; the atlas draws the device frame and scales the iframe into it.
   Only when no ready message comes in 4 s (a page without the script) is the old crop of the whole study page used. */
const READY_MS = 4000;
const AMBER = '#e0a100';
function shot(screen, opts = {}) {
  const H = (opts.height || 760) - 20, k = H / 844, W = Math.round(390 * k); // opts.height is the frame's; the 10px bezel sits outside the screen
  const frame = el('<div class="devframe"></div>');
  const box = el(`<div class="shot" style="width:${W}px;height:${H}px" data-k="${k}"></div>`); frame.append(box);
  if (!screen || !screen.url) {
    box.append(el(`<div class="blank">${screen?.name ? `<b>${esc(screen.name)}</b>` : ''}<span>${esc(screen?.blank || 'Not designed yet.')}</span></div>`));
    return frame;
  }
  const wait = el('<div class="wait" aria-hidden="true"></div>'); box.append(wait);
  const f = el('<iframe class="bare" title="Live screen"></iframe>');
  f.style.transform = `scale(${k})`;
  f.src = screen.url + (screen.url.includes('?') ? '&' : '?') + 'screen=' + encodeURIComponent(screen.id);
  box.append(f);
  let ok = false, timer = 0;
  const onMsg = (m) => {
    if (!f.isConnected) return removeEventListener('message', onMsg);
    if (m.source !== f.contentWindow || !m.data || m.data.atlasReady !== screen.id) return;
    ok = true; removeEventListener('message', onMsg); clearTimeout(timer);
    try { decorate(f, screen, opts); } catch (e) { console.warn('atlas: could not mark the screen', e); }
    f.style.visibility = 'visible'; wait.remove(); frame.dataset.ready = '1'; frame.dispatchEvent(new Event('atlas-ready'));
  };
  addEventListener('message', onMsg);
  timer = setTimeout(() => {
    if (ok || !f.isConnected) return;
    console.warn(`atlas: no ready message from ${screen.url} for ${screen.id} within ${READY_MS / 1000}s: falling back to the crop shim`);
    removeEventListener('message', onMsg); f.remove(); wait.remove(); cropShot(box, W, screen, opts);
  }, READY_MS);
  return frame;
}

/* What the atlas adds on a bare screen: open a sheet, outline the way in (or what a feature adds), make the way in a link. */
function decorate(f, screen, opts) {
  const d = f.contentDocument, p = d.querySelector('.atlas-phone');
  if (!p) return;
  const visible = (e) => e.getBoundingClientRect().height > 0;
  const smallest = (list) => list.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height)[0];
  const amber = (e, fill) => { e.style.outline = `3px solid ${AMBER}`; e.style.outlineOffset = '-2px'; if (fill) e.style.background = fill; };
  const link = (c) => { if (opts.onControl) c.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); opts.onControl(); }, true); };
  if (opts.open) { const o = [...p.querySelectorAll('button, a, [role=button]')].find((e) => e.textContent.trim().startsWith(opts.open)); if (o) o.click(); }
  if (opts.addPlaceholder) { // a dashed amber card under the heading: this feature adds here, not designed yet
    const heads = [...p.querySelectorAll('*')].filter((e) => e.childElementCount <= 2 && e.textContent.trim() === opts.addPlaceholder.after && visible(e) && !e.closest('[role=tab], nav, footer'));
    let head = heads[0] && (heads.length > 1 ? smallest(heads.slice()) : heads[0]);
    if (head) {
      const pw = p.getBoundingClientRect().width; // climb to the heading's full-width row, then insert under it
      while (head.parentElement && head.parentElement !== p && head.getBoundingClientRect().width < pw * 0.8) head = head.parentElement;
      const ph = d.createElement('div'); ph.textContent = opts.addPlaceholder.text;
      ph.style.cssText = 'margin:10px 18px;padding:16px;border:2px dashed #e0a100;border-radius:16px;color:#896017;font:600 13px Plus Jakarta Sans,Arial,sans-serif;background:#fff8e6;text-align:center';
      head.insertAdjacentElement('afterend', ph);
    }
  }
  if (opts.markAdded) { const hit = smallest([...p.querySelectorAll('*')].filter((e) => e.childElementCount <= 3 && visible(e) && e.textContent.trim().startsWith(opts.markAdded))); if (hit) amber(hit.closest('button, a, li, [role=button]') || hit); }
  if (opts.entry) { // the page marks its ways in: data-entry="<feature id>" (space-separated for several); data-entry-via tells apart two ways on one screen into the same feature
    const marked = [...p.querySelectorAll(`[data-entry~="${opts.entry}"]`)].filter(visible);
    const onTop = (e) => { const r = e.getBoundingClientRect(), t = d.elementFromPoint(r.left + r.width / 2, Math.min(r.top + r.height / 2, 840)); return t && e.contains(t); }; // not hidden behind a sheet
    const all = marked.filter(onTop).length ? marked.filter(onTop) : marked;
    const via = opts.via ? all.filter((e) => e.getAttribute('data-entry-via') === opts.via) : all.filter((e) => !e.hasAttribute('data-entry-via'));
    const word = String(opts.control || '').split(/[ (]/)[0].toLowerCase(); // several markers for one feature on a screen: the one whose text opens with the control's name, else the first
    const pool = via.length ? via : all, c = (word && pool.find((e) => e.textContent.trim().toLowerCase().startsWith(word))) || pool[0];
    if (c) { amber(c); link(c); return; }
    console.warn(`atlas: no data-entry="${opts.entry}" on ${screen.id}: matching the control's text instead`);
  }
  if (opts.control) textControl(f, p, opts, visible, smallest, amber, link);
}

/* Fallback for a screen with no entry marker: find the control by its text, then climb to the whole tap target. */
function textControl(f, p, opts, visible, smallest, amber, link) {
  const hit = smallest([...p.querySelectorAll('*')].filter((e) => e.childElementCount <= 3 && visible(e) && e.textContent.trim().startsWith(opts.control)));
  const act = hit && hit.closest('button, a, [role=button], [role=tab], [data-action]');
  let c = act && act.getBoundingClientRect().height < 140 ? act : hit;
  const cur = (e) => f.contentWindow.getComputedStyle(e).cursor;
  while (c && c.parentElement && p.contains(c.parentElement) && c.parentElement !== p && cur(c.parentElement) === 'pointer') c = c.parentElement;
  if (c) { amber(c); link(c); }
}

/* SHIM, only when a page sends no ready message: the whole study page in an iframe at 1400px, switched to the screen's
   `preset` through its select.scenario, cropped to its own phone by the phone's viewport rect. */
function cropShot(box, W, screen, opts) {
  const f = el('<iframe title="Live screen"></iframe>'); f.src = screen.url; box.append(f);
  const find = (d) => [...d.querySelectorAll('.phone, section.device, .tk-phone')].find((p) => p.getBoundingClientRect().width > 300);
  const smallest = (list) => list.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height)[0];
  f.onload = async () => {
    try {
      const d = f.contentDocument;
      let p; for (let i = 0; i < 25 && !(p = find(d)); i++) await wait(100);
      if (!p || !f.isConnected) return;
      if (screen.preset) {
        const sel = p.closest('.spec')?.querySelector('select.scenario');
        if (sel && sel.value !== screen.preset) { sel.value = screen.preset; sel.dispatchEvent(new Event('change', { bubbles: true })); await wait(500); for (let i = 0; i < 20 && !(p = find(d)); i++) await wait(100); }
      }
      if (opts.open) { const o = [...p.querySelectorAll('button, a, [role=button]')].find((e) => e.textContent.trim().startsWith(opts.open)); if (o) { o.click(); await wait(400); p = find(d) || p; } }
      const visible = (e) => e.getBoundingClientRect().height > 0;
      const amber = (e, fill) => { e.style.outline = '3px solid #e0a100'; e.style.outlineOffset = '-2px'; if (fill) e.style.background = fill; };
      if (opts.addPlaceholder) { // a dashed amber card under the heading: this feature adds here, not designed yet
        const heads = [...p.querySelectorAll('*')].filter((e) => e.childElementCount <= 2 && e.textContent.trim() === opts.addPlaceholder.after && visible(e) && !e.closest('[role=tab], nav, footer'));
        let head = heads[0] && (heads.length > 1 ? smallest(heads.slice()) : heads[0]);
        if (head) {
          const pw = p.getBoundingClientRect().width; // climb to the heading's full-width row, then insert under it
          while (head.parentElement && head.parentElement !== p && head.getBoundingClientRect().width < pw * 0.8) head = head.parentElement;
          const ph = d.createElement('div'); ph.textContent = opts.addPlaceholder.text;
          ph.style.cssText = 'margin:10px 18px;padding:16px;border:2px dashed #e0a100;border-radius:16px;color:#896017;font:600 13px Plus Jakarta Sans,Arial,sans-serif;background:#fff8e6;text-align:center';
          head.insertAdjacentElement('afterend', ph);
        }
      }
      if (opts.markAdded) { const hit = smallest([...p.querySelectorAll('*')].filter((e) => e.childElementCount <= 3 && visible(e) && e.textContent.trim().startsWith(opts.markAdded))); if (hit) amber(hit.closest('button, a, li, [role=button]') || hit); }
      if (opts.control) { // the whole tap target: climb from the control's text while the parent is still pointer-cursor
        const hit = smallest([...p.querySelectorAll('*')].filter((e) => e.childElementCount <= 3 && visible(e) && e.textContent.trim().startsWith(opts.control)));
        const act = hit && hit.closest('button, a, [role=button], [role=tab], [data-action]');
        let c = act && act.getBoundingClientRect().height < 140 ? act : hit;
        const cur = (e) => f.contentWindow.getComputedStyle(e).cursor;
        while (c && c.parentElement && p.contains(c.parentElement) && c.parentElement !== p && cur(c.parentElement) === 'pointer') c = c.parentElement;
        if (c) { amber(c); if (opts.onControl) c.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); opts.onControl(); }, true); }
      }
      { let last = '', same = 0; for (let i = 0; i < 10 && same < 2; i++) { await wait(100); const q2 = find(d) || p, rr = q2.getBoundingClientRect(), sig = [rr.x, rr.y, rr.width, rr.height, q2.innerHTML.length].join(); same = sig === last ? same + 1 : 0; last = sig; } }
      d.scrollingElement.scrollTo(0, 0);
      let r = p.getBoundingClientRect(); f.style.height = Math.ceil(r.bottom + 40) + 'px'; await wait(80);
      r = p.getBoundingClientRect(); const kk = W / r.width;
      f.style.transform = `scale(${kk})`; f.style.left = -r.left * kk + 'px'; f.style.top = -r.top * kk + 'px';
      box.style.height = Math.round(r.height * kk) + 'px'; f.style.visibility = 'visible';
    } catch (e) { box.append(el('<div class="blank"><b>Could not show this screen</b></div>')); }
  };
}

/* a bare screen (#49) will announce its id; the flow follows the demo */
addEventListener('message', (m) => { if (m.data && m.data.atlasScreen && CURRENT) CURRENT.follow(m.data.atlasScreen); });

/* ---------- layout ----------
   One flat canvas: only screens are boxes. A band is an uppercase label with a hairline rule and its nodes below it; statuses inside a band
   are small labels on one vertical timeline line, their nodes indented from it; an exit is a dashed branch off the line.
   `avail` is the width the flow can use; nodes take as many columns as fit it at about 85% scale. */
function layoutFlow(f, entries, avail, open = new Set()) {
  const NW = 190, NH = 48, GAP = 18, VG = 12, x0 = 20, IND = 20, LAB = 28, LH = 16;
  const per = Math.max(2, Math.min(6, Math.floor(((avail || 1000) / 0.85 - 2 * x0 - IND + GAP) / (NW + GAP))));
  const cw = per * (NW + GAP) - GAP + IND;
  const pos = {}, boxes = [], placed = new Set(), folds = []; let y = 12;
  const nodes = (ids, x, yy, w) => {
    const cols = Math.max(1, Math.floor((w + GAP) / (NW + GAP))), rows = Math.max(1, Math.ceil(ids.length / cols));
    ids.forEach((id, i) => { pos[id] = { x: x + (i % cols) * (NW + GAP), y: yy + Math.floor(i / cols) * (NH + VG) }; placed.add(id); });
    return rows * NH + (rows - 1) * VG;
  };
  const band = (name) => { y += LAB; boxes.push({ name, kind: 'band', x: x0, y, w: cw, h: LH }); y += LH + 12; };
  const strip = (name, ids) => { ids = ids.filter((i) => !placed.has(i) || i.includes(':')); if (!ids.length) return; band(name); y += nodes(ids, x0, y, cw); };
  /* a long band that is not the main road starts folded to one line ("In any status · 13 ›"); its nodes still exist, hidden */
  const foldable = (name, ids, label) => {
    ids = ids.filter((i) => !placed.has(i)); if (!ids.length) return;
    const isOpen = open.has(name); folds.push({ name, label, ids, open: isOpen, x: x0, y: y + LAB, w: cw });
    if (isOpen) return strip(name, ids);
    y += LAB + 22; ids.forEach((i) => { placed.add(i); pos[i] = { x: x0, y: 0 }; });
  };
  strip('Ways in', entries.map((e) => e.id));
  const a = f.anchor, ownIds = f.screens.map((s) => s.id);
  if (a) {
    (a.any || []).length > 6 ? foldable('In any status', a.any, 'In any status') : strip('In any status', a.any || []);
    const [t1, t2] = a.task || [];
    band(t1 ? t1.name : a.name);
    const top = ((t1 && t1.screens) || []).filter((i) => !placed.has(i));
    if (top.length) y += nodes(top, x0, y, cw);
    const sts = (a.statuses || []).filter((s) => (s.screens || []).length), exits = (a.exits || []).filter((s) => (s.screens || []).length);
    const lineY = y + 4; let lastY = lineY;
    const lane = (name, ids, exit) => {
      y += 16;
      boxes.push({ name, kind: exit ? 'lane exit' : 'lane', x: x0 + IND, y, w: 200, h: LH });
      boxes.push(exit ? { name: '', kind: 'branch', x: x0 + 1, y: y + LH / 2, w: IND - 4, h: 0 } : { name: '', kind: 'dot', x: x0 - 3, y: y + 4, w: 8, h: 8 });
      lastY = y + LH / 2; y += LH + 8; y += nodes(ids, x0 + IND, y, cw - IND);
    };
    sts.forEach((s) => lane(s.name, s.screens, false));
    exits.forEach((s) => lane(s.name + ' · exit', s.screens, true));
    if (sts.length || exits.length) boxes.push({ name: '', kind: 'tline', x: x0, y: lineY, w: 2, h: Math.max(0, lastY - lineY) });
    if (t2 && (t2.screens || []).length) { band(t2.name); y += nodes(t2.screens.filter((i) => !placed.has(i)), x0, y, cw); }
  } else {
    const owned = new Set(ownIds);
    (f.groups || []).forEach(([name, ids]) => {
      const own = ids.filter((i) => owned.has(i));
      if (/not reachable/i.test(name)) foldable(name, own, 'Built, not reachable'); else strip(name === 'Old UI' ? 'Screens in the old UI' : name, own);
    });
  }
  strip(a || (f.groups || []).length ? 'Other' : 'Screens', ownIds);
  strip('Adds to', (f.addsTo || []).map((_, i) => 'adds:' + i));
  return { pos, boxes, folds, width: x0 + cw + 20, height: y + 100, NW, NH };
}

/* ---------- the page ---------- */
function openFeature(id, sel) {
  const f = allFeatures().find((x) => x.id === id); if (!f) return;
  const plat = S.data.platforms.find((p) => p.sections.some((s) => s.id === f.sectionRef.id && s.features.some((x) => x.id === id)));
  if (plat) S.platformId = plat.id;
  S.view = 'atlas';
  const idx = screenIndex(); setParam('feature', id);
  const n = f.screens.length;
  const ownIds = new Set(f.screens.map((s) => s.id)), mine = (S.data.backlog || []).filter((b) => (b.target.kind === 'feature' && b.target.id === f.id) || (b.target.kind === 'screen' && ownIds.has(b.target.id)));
  const todos = mine.filter((b) => b.kind !== 'decision').length, confirm = mine.length - todos; // the same sets the Backlog opens on
  const planned = f.status === 'placeholder', prd = hasPrd(f), sameName = String(f.name).toLowerCase() === String(f.sectionRef.name).toLowerCase();
  header(`${sameName ? '' : `<a href="#" id="crumb-back">${esc(f.sectionRef.name)}</a> / `}<b>${esc(f.name)}</b> <span class="zh">${esc(f.zh || '')}</span>
    <span class="meta">${dot(f.status)}${f.status === 'frozen' ? '<span>Frozen</span> · ' : ''}<span>${plural(n, 'screen')}</span>${planned ? ' · <span>Not designed yet</span>' : ''}${prd ? ' · <a href="#" id="l-prd">PRD</a> · <a href="#" id="l-dec">Decisions</a>' : ''}${todos ? ` · <a href="#" id="l-todo" title="Open to-dos for this feature in the Backlog">To-dos ${todos}</a>` : ''}${confirm ? ` · <a href="#" id="l-conf" title="Questions waiting for the owner, in the Backlog">To confirm ${confirm}</a>` : ''}</span>`);
  const toBacklog = (kind) => (e) => { e.preventDefault(); Object.assign(bkState, { kind, sec: '', feature: f.id }); S.view = 'backlog'; closeFeature(); render(); };
  document.getElementById('l-todo')?.addEventListener('click', toBacklog('@todo')); document.getElementById('l-conf')?.addEventListener('click', toBacklog('decision'));
  const back = document.getElementById('crumb-back'); if (back) back.onclick = (e) => { e.preventDefault(); closeFeature(); };
  const page = document.getElementById('feature'); page.hidden = false; page.innerHTML = '';

  const entries = (f.entryPoints || []).map((e, i) => Object.assign({}, e, { id: 'entry:' + i }));
  const availW = () => innerWidth - 440 - (document.querySelector('.feature .notes.open') ? 440 : 0) - 28;
  const unfolded = new Set(); let L = layoutFlow(f, entries, availW(), unfolded), pos = L.pos; const NW = L.NW, NH = L.NH;
  const edges = [...entries.filter((e) => e.lands).map((e) => [e.id, e.lands, e.control || e.label]), ...(f.flow || [])];

  const col = el('<div class="flowcol"></div>');
  const wrap = el('<div class="flowwrap"><div class="flowplane"><svg width="10" height="10"></svg></div><div class="zoom"><button data-z="-1" title="Zoom out">−</button><button data-z="0" title="Fit">⤢</button><button data-z="1" title="Zoom in">+</button></div></div>');
  const plane = wrap.querySelector('.flowplane'), svg = plane.querySelector('svg');
  const groups = el('<div class="groups"></div>'); plane.prepend(groups);
  const drawGroups = () => {
    groups.innerHTML = L.boxes.map((b) => `<div class="group ${b.kind || ''}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px"><span>${esc(b.name)}</span></div>`).join('')
      + L.folds.map((x) => x.open ? `<button class="fold open" data-fold="${esc(x.name)}" style="left:${x.x + x.w - 60}px;top:${x.y - 3}px">Fold ‹</button>` : `<button class="fold" data-fold="${esc(x.name)}" title="${esc(x.name)}" style="left:${x.x}px;top:${x.y - 4}px">${esc(x.label)} · ${x.ids.length} ›</button>`).join('');
    groups.querySelectorAll('[data-fold]').forEach((b) => { b.onclick = () => { const k = b.dataset.fold; unfolded.has(k) ? unfolded.delete(k) : unfolded.add(k); relayout(); }; });
  };
  const applyFolds = () => { const hid = new Set(L.folds.filter((x) => !x.open).flatMap((x) => x.ids)); Object.entries(nodes).forEach(([id, n]) => { n.hidden = hid.has(id); }); };
  drawGroups();
  function relayout() {
    L = layoutFlow(f, entries, availW(), unfolded); pos = L.pos; drawGroups();
    Object.entries(nodes).forEach(([id, n]) => { if (pos[id]) { n.style.left = pos[id].x + 'px'; n.style.top = pos[id].y + 'px'; } });
    applyFolds(); drawEdges(selected && nodes[selected] ? selected : null);
  }
  addEventListener('resize', () => { if (wrap.isConnected) { relayout(); pz.fit(); } });
  const dock = el('<div class="dock"></div>'), nodes = {};
  const place = (nid, html, cls, title, onclick) => { if (!pos[nid]) return; const b = el(`<button class="node ${cls}" title="${esc(title)}">${html}</button>`); b.style.left = pos[nid].x + 'px'; b.style.top = pos[nid].y + 'px'; b.onclick = onclick; plane.append(b); nodes[nid] = b; };
  entries.forEach((e) => place(e.id, `<span><b>${esc(e.section)}</b> · ${esc(e.label)}</span>`, 'entry', `${e.section} · ${e.label}`, () => select(e.id)));
  f.screens.forEach((s) => place(s.id, `${dot(s.status)}<span>${esc(s.name)}</span>`, s.status === 'placeholder' ? 'placeholder' : '', s.status === 'placeholder' ? 'Placeholder — not designed yet' : (s.zh ? `${s.name} · ${s.zh}` : s.name), () => select(s.id)));
  (f.addsTo || []).forEach((a, i) => place('adds:' + i, `<span>${esc(a.what)}</span>`, 'adds', `Adds to ${a.feature}`, () => select('adds:' + i)));

  const showNode = (id) => { const x = L.folds.find((g) => !g.open && g.ids.includes(id)); if (x) { unfolded.add(x.name); relayout(); } };
  showNode(sel); applyFolds();
  const defs = '<defs><marker id="aron" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#276640"/></marker></defs>';
  const trim = (t) => { t = String(t || ''); return t.length > 40 ? t.slice(0, 39) + '…' : t; };
  function drawEdges(active) {
    svg.innerHTML = defs;
    Object.entries(nodes).forEach(([k, n]) => { n.classList.remove('nb-out', 'nb-in', 'dim'); n.querySelector('.bdg')?.remove(); if (n.dataset.t != null) n.title = n.dataset.t; else n.dataset.t = n.title; });
    return; // a plain sitemap: only the selected node is marked (aria-current); the flow data is not drawn
    const rel = edges.filter(([a, b]) => (a === active || b === active) && a !== b && pos[a] && pos[b]);
    const mk = {}; // neighbour -> { dir, label }
    rel.forEach(([a, b, label]) => { const o = a === active ? b : a, dir = a === active ? 'out' : 'in'; if (!mk[o] || (dir === 'out' && mk[o].dir === 'in')) mk[o] = { dir, label }; });
    Object.entries(nodes).forEach(([k, n]) => {
      const m = mk[k];
      if (!m) { if (k !== active) n.classList.add('dim'); return; }
      n.classList.add(m.dir === 'out' ? 'nb-out' : 'nb-in'); n.insertAdjacentHTML('beforeend', `<i class="bdg" title="${m.dir === 'out' ? 'The selected screen leads here' : 'Leads here from the selected screen'}">${m.dir === 'out' ? '→' : '←'}</i>`);
      if (m.label) n.title = (m.dir === 'out' ? 'Tap: ' : 'Comes from: ') + trim(m.label);
    });
    if (rel.length > 4) return; // a hub: marks only, no lines
    rel.forEach(([a, b]) => {
      const A = pos[a], B = pos[b]; let d;
      if (Math.abs(A.x - B.x) < NW) { const x = A.x + NW, y1 = A.y + NH / 2, y2 = B.y + NH / 2; d = `M${x},${y1} C${x + 44},${y1} ${x + 44},${y2} ${x},${y2}`; }
      else { const r = B.x > A.x, x1 = r ? A.x + NW : A.x, x2 = r ? B.x : B.x + NW, c = r ? 50 : -50; d = `M${x1},${A.y + NH / 2} C${x1 + c},${A.y + NH / 2} ${x2 - c},${B.y + NH / 2} ${x2},${B.y + NH / 2}`; }
      svg.insertAdjacentHTML('beforeend', `<path class="edge" d="${d}" marker-end="url(#aron)"/>`);
    });
  }
  const mark = (nid) => { Object.entries(nodes).forEach(([k, b]) => b.setAttribute('aria-current', k === nid)); drawEdges(nid); setParam('screen', nid); };
  // the phone shows another screen of this feature after a tap: the flow follows (node, arrows, ?screen=, notes) without reloading the phone
  const countOf = (sid) => { const n = idx[sid] && idx[sid].notes; return n ? (n.elements || []).filter((e) => !CHROME.test(`${e.name} ${e.shows}`)).length : 0; };
  CURRENT = { follow: (sid) => { if (!nodes[sid] || sid === shown) return; showNode(sid); selected = shown = sid; mark(sid); const nc = dock.querySelector('.notesbtn .nc'); if (nc) nc.textContent = 'Notes' + (countOf(sid) ? ' · ' + countOf(sid) : ''); if (notes.classList.contains('open')) fillNotes(); pz && pz.reveal(nodes[sid]); } };
  wrap.addEventListener('click', (e) => { if (!e.target.closest('.node, .zoom')) drawEdges(null); });

  /* the notes panel follows what the phone shows */
  const notes = el('<div class="notes"><header><button class="tab" data-t="screen">Screen notes</button><button class="tab" data-t="prd">Feature PRD</button><button class="x" title="Close notes" aria-label="Close notes">✕</button></header><div class="body"></div></div>');
  let notesTab = 'screen', shown = null, pz = null, selected = null;
  const setNotes = (on) => { if (!on) clearPins(); notes.classList.toggle('open', on); col.classList.toggle('notes-open', on); dock.querySelector('[data-notes]')?.setAttribute('aria-pressed', String(on)); if (pz) { relayout(); pz.fit(); const sel = nodes[selected]; if (sel) pz.reveal(sel); } };
  const goto = (sid) => { const t = idx[sid]; if (!t) return; if (t.feature.id === f.id) select(sid); else openFeature(t.feature.id, sid); };
  /* ---------- the Notes panel: a screen spec ---------- */
  const ICON = { warn: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 1.8 14.8 13.5H1.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6.2v3.6M8 11.6v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>', caret: '<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' };
  const CHROME = /status bar|home indicator|9:41|battery|signal/i; // prototype phone chrome, not product UI
  const goesTo = (t) => {
    if (!t) return '<span class="muted">—</span>';
    let out = '', last = 0; const re = /[a-z0-9-]+\.[a-z0-9-]+/g; let m;
    while ((m = re.exec(t))) { if (!idx[m[0]]) continue; out += esc(t.slice(last, m.index)) + `<button class="chip" data-go="${esc(m[0])}">${dot(idx[m[0]].status)}${esc(idx[m[0]].name)}</button>`; last = m.index + m[0].length; }
    return out + esc(t.slice(last));
  };
  const table = (cls, heads, rows) => `<table class="spec ${cls}"><thead><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  const splitState = (t, i) => { const m = String(t).match(/^([^:]{1,60}):\s+([\s\S]+)$/); const title = m ? m[1] : `State ${i + 1}`; const trig = title.match(/\(([^)]+)\)\s*$/); return { title: trig ? title.replace(/\s*\([^)]+\)\s*$/, '') : title, what: m ? m[2] : t, how: trig ? trig[1] : '' }; };
  let pinTok = 0;
  const lit = (card, on) => { if (card._pin) card._pin.classList.toggle('on', on); if (card._ring) card._ring.hidden = !on; if (card._lead) card._lead.classList.toggle('on', on); };
  function expandCard(card, scroll) {
    card.closest('.body').querySelectorAll('.ecard.open').forEach((c) => { if (c !== card) { c.classList.remove('open'); lit(c, false); } });
    card.classList.add('open'); lit(card, true);
    if (scroll) card.scrollIntoView({ block: 'center' });
  }
  function collapseCard(card) { const sl = card.querySelector('.srcl'); if (sl) { sl.hidden = true; card.querySelector('.srct').textContent = 'Source ▸'; } card.classList.remove('open'); lit(card, false); }
  let phoneObs = null;
  function clearPins() { pinTok++; if (phoneObs) phoneObs.disconnect(); dock.querySelectorAll('.pins').forEach((p) => p.remove()); setForeign(false); }
  /* the phone shows a state that has no notes of its own: say so, quietly, in the Notes header */
  function setForeign(on) {
    const body = notes.querySelector('.body'), had = body.querySelector('.foreign');
    if (!on) { if (had) had.remove(); return; }
    if (had || notesTab !== 'screen') return;
    const head = body.querySelector('.spechead'); if (head) head.insertAdjacentHTML('afterend', '<p class="foreign">The phone is showing a state without its own notes — tap Back, or pick a screen in the flow.</p>');
  }

  /* find each element on the live phone (by its quoted text, its sample value, then its name) and draw its number over it */
  function locate(items) {
    const tok = ++pinTok, frame = dock.querySelector('.devframe'); if (phoneObs) phoneObs.disconnect();
    dock.querySelectorAll('.pins').forEach((p) => p.remove());
    if (!frame || !items.length) return;
    const run = () => {
      if (tok !== pinTok) return;
      const fr = frame.querySelector('iframe.bare'), box = frame.querySelector('.shot');
      if (!fr || !fr.isConnected) return;
      let doc, phone; try { doc = fr.contentDocument; phone = doc.querySelector('.atlas-phone'); } catch (_) { return; }
      if (!phone) return;
      const k = parseFloat(box.dataset.k) || 1, W = 390 * k, H = 844 * k, S = 16; // S: the largest pin, tested for room
      const norm = (t) => String(t || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const pool = [...phone.querySelectorAll('*')].filter((e) => e.childElementCount <= 3 && !/^(script|style|svg|path)$/i.test(e.tagName)).map((e) => { const r = e.getBoundingClientRect(); return { e, r, t: norm(e.textContent), a: r.width * r.height }; }).filter((c) => c.r.width > 2 && c.r.height > 2 && c.r.top < 844 && c.r.bottom > 0 && c.t);
      const find = (needle) => {
        const n = norm(needle).replace(/…+$/, ''); if (n.length < 2) return null;
        for (const test of [(c) => c.t === n, (c) => c.t.startsWith(n) && c.t.length <= n.length * 2 + 8, (c) => c.t.includes(n) && c.t.length <= n.length * 3 + 12]) {
          const hit = pool.filter(test).sort((a, b) => a.a - b.a)[0]; if (hit) return hit;
        }
        return null;
      };
      /* every text rect of the screen, in the pins' coordinates */
      const texts = []; const tw = doc.createTreeWalker(phone, NodeFilter.SHOW_TEXT); const rg = doc.createRange();
      for (let n; (n = tw.nextNode());) { if (!n.nodeValue.trim()) continue; rg.selectNodeContents(n); for (const r of rg.getClientRects()) if (r.width > 1 && r.height > 1) texts.push([r.left * k, r.top * k, r.right * k, r.bottom * k]); }
      const hits = (x, y, list) => list.some(([a, b, c, d]) => x < c + 1 && x + S > a - 1 && y < d + 1 && y + S > b - 1);
      const inside = (x, y) => x >= 1 && y >= 1 && x + S <= W - 1 && y + S <= H - 1;
      const layer = el('<div class="pins"></div>'); box.append(layer);
      const taken = []; let missing = [], located = 0, covered = 0;
      items.forEach(({ card }) => card.classList.remove('off'));
      items.forEach(({ n, e, card }) => {
        const sh = e.shows || '', cand = [];
        let m; const re = /["“]([^"”]{2,})["”]/g; while ((m = re.exec(sh))) cand.push(m[1]);
        sh.replace(/\([^)]*\)/g, '').split(/\s[+·]\s|,|;/).forEach((p) => cand.push(p));
        cand.push(String(e.name || '').split('·').pop());
        let hit = null, viaAt = false;
        for (const t of [].concat(e.at || [])) { // `at`: a CSS selector (starts with [ . #), else visible text, else an aria-label / title
          if (/^[\[.#]/.test(t)) { let n = null; try { n = [...phone.querySelectorAll(t)].find((x) => { const r = x.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top < 844; }); } catch (_) {} if (n) { hit = { e: n, r: n.getBoundingClientRect() }; viaAt = 'sel'; break; } continue; }
          hit = find(t);
          if (!hit) { const nt = norm(t), n = [...phone.querySelectorAll('[aria-label],[title]')].find((x) => { const r = x.getBoundingClientRect(); return r.width > 2 && r.height > 2 && [x.getAttribute('aria-label'), x.getAttribute('title')].some((v) => norm(v) === nt); }); if (n) { hit = { e: n, r: n.getBoundingClientRect() }; viaAt = 'sel'; break; } }
          if (hit) { viaAt = true; break; }
        }
        if (!hit) for (const c of cand) { hit = find(c); if (hit) break; }
        if (hit && viaAt === true) { const box2 = hit.e.closest('button, a, li, [role=button], [role=tab], [data-action], [class*="card"], [class*="row"]'); if (box2 && phone.contains(box2) && box2 !== phone) { const r2 = box2.getBoundingClientRect(); if (r2.width > 2 && r2.height > 2 && r2.height < 400) hit = { e: box2, r: r2 }; } }
        if (!hit) { card.classList.add('off'); missing.push(e.name); return; }
        located++;
        { const hr = hit.e.getBoundingClientRect(), top = doc.elementFromPoint(Math.min(389, Math.max(0, hr.left + hr.width / 2)), Math.min(843, Math.max(0, hr.top + hr.height / 2))); // hidden or covered by another layer: no pin
          if (!top || !hit.e.contains(top)) { covered++; card.classList.add('off'); missing.push(e.name); return; } }
        const r = hit.r, L = r.left * k, T = r.top * k, R = r.right * k, B = r.bottom * k, cy = Math.max(1, Math.min(H - S - 1, (T + B) / 2 - S / 2)), G = 4;
        const free = (x, y) => inside(x, y) && !hits(x, y, texts) && !hits(x, y, taken);
        let spot = [[L - S - G, T - S - G], [R + G, T - S - G], [L - S - G, cy], [R + G, cy]].find(([x, y]) => free(x, y)), leader = false;
        if (!spot) { // a pin in the phone's left or right margin, with a hairline to the element
          const sides = [2, W - S - 2].sort((p, q) => Math.abs(p - (L + R) / 2) - Math.abs(q - (L + R) / 2));
          for (const dy of [0, 1, -1]) { const y = cy + dy * (S + 2); const x = sides.find((sx) => inside(sx, y) && !hits(sx, y, taken) && !hits(sx, y, texts)); if (x != null) { spot = [x, y]; break; } }
          if (!spot) { const x = sides.find((sx) => !hits(sx, cy, taken)); if (x != null) spot = [x, cy]; }
          leader = !!spot;
        }
        if (!spot) { card.classList.add('off'); missing.push(e.name); return; }
        taken.push([spot[0], spot[1], spot[0] + S, spot[1] + S]);
        const ring = el('<i class="ring" hidden></i>');
        Object.assign(ring.style, { left: L - 2 + 'px', top: T - 2 + 'px', width: R - L + 4 + 'px', height: B - T + 4 + 'px' });
        const pin = el(`<button class="pin" aria-label="Element ${n}: ${esc(e.name)}">${n}</button>`);
        pin.style.left = spot[0] + S / 2 + 'px'; pin.style.top = spot[1] + S / 2 + 'px';
        let lead = null;
        if (leader) { const px = spot[0] + S / 2, py = spot[1] + S / 2; lead = el(`<svg class="lead" width="${W}" height="${H}"><line x1="${px}" y1="${py}" x2="${Math.min(R, Math.max(L, px))}" y2="${Math.min(B, Math.max(T, py))}"/></svg>`); layer.append(lead); }
        const hot = (on) => { pin.classList.toggle('hot', on); ring.hidden = !(on || card.classList.contains('open')); if (lead) lead.classList.toggle('on', on || card.classList.contains('open')); };
        card._pin = pin; card._ring = ring; card._lead = lead; card._hot = hot;
        card.addEventListener('mouseenter', () => hot(true)); card.addEventListener('mouseleave', () => hot(false));
        pin.addEventListener('mouseenter', () => expandCard(card, true)); pin.addEventListener('mouseleave', () => hot(false));
        pin.onclick = () => expandCard(card, true);
        layer.append(ring, pin);
        if (card.classList.contains('open')) lit(card, true);
      });
      const foreign = located > 0 && covered >= Math.ceil(located / 2); // most annotated elements are gone or covered: the phone is elsewhere
      if (foreign) { layer.remove(); items.forEach(({ card }) => card.classList.remove('off')); }
      setForeign(foreign);
      if (!foreign) { const nn0 = document.querySelector('#sec-elements .n'); if (nn0 && !missing.length) nn0.textContent = String(items.length); }
      let tmr = 0; phoneObs = new MutationObserver(() => { clearTimeout(tmr); tmr = setTimeout(() => { if (tok === pinTok && frame.isConnected) locate(items); }, 150); });
      phoneObs.observe(phone, { subtree: true, childList: true, attributes: true, characterData: true });
      const nn = foreign ? null : document.querySelector('#sec-elements .n');
      if (nn && missing.length) { nn.textContent = `${items.length} · ${missing.length} not on screen`; nn.title = 'Not found on the screen: ' + missing.join('; '); }
    };
    if (frame.dataset.ready) setTimeout(run, 180); else frame.addEventListener('atlas-ready', run, { once: true });
  }

  function specHtml(s, nt) {
    const issues = nt.issues || [], confirm = (JSON.stringify(nt).match(/to confirm/gi) || []).concat((S.data.backlog || []).filter((b) => b.kind === 'decision' && b.target.kind === 'screen' && b.target.id === s.id));
    const els = (nt.elements || []).filter((e) => !CHROME.test(`${e.name} ${e.shows}`));
    const states = (nt.states || []).map(splitState), ctrls = nt.controls || [], copy = nt.copy || [], edge = nt.edge || [], rules = nt.rules || [];
    const sec = (id, label, n, open, inner) => `<section class="sec" id="sec-${id}" data-open="${open}"><h3 class="sh" tabindex="0" role="button" aria-expanded="${open}"><span class="lbl">${label}</span><span class="n">${n}</span><span class="caret">${ICON.caret}</span></h3><div class="sb">${inner}</div></section>`;
    const none = '<p class="none">None written yet.</p>';
    const gate = s.gate ? `<span class="badge">Gate <b>${esc(Array.isArray(s.gate) ? s.gate.join(' ') : s.gate)}</b></span>` : '';
    const head = `<div class="spechead"><div class="t"><h2>${esc(s.name)}</h2>${s.zh ? `<span class="zh">${esc(s.zh)}</span>` : ''}<span class="pill">${dot(s.status)}${esc(STATUS[s.status] || s.status)}</span>${gate}</div>
      ${confirm.length ? `<div class="badges"><span class="badge">To confirm <b>${confirm.length}</b></span></div>` : ''}</div>
      ${nt.purpose ? `<p class="lead">${esc(nt.purpose)}</p>` : ''}`;
    const split = (t) => { const ss = String(t).match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)\s*/g) || [t]; let a = '', i = 0; while (i < ss.length && (!a || a.length + ss[i].length <= 190)) a += ss[i++]; return [a.trim(), ss.slice(i).join('').trim()]; };
    const cards = els.map((e, i) => { const [la, lb] = split(e.logic || ''), st = e.states || []; return `<article class="ecard" data-i="${i}"><div class="eh" role="button" tabindex="0"><span class="num">${i + 1}</span><b>${esc(e.name)}</b>${st.length ? `<span class="nst">${st.length} state${st.length === 1 ? '' : 's'}</span>` : ''}</div><div class="ex">${e.shows ? `<code class="cv">${esc(e.shows)}</code>` : ''}${st.length ? table('est', ['State', 'When', 'Shows'], st.map((x) => `<tr><td><span class="stag">${esc(x.state)}</span></td><td>${esc(x.when)}</td><td>${esc(x.shows)}</td></tr>`)) : ''}${la ? `<p class="lg">${esc(la)}${lb ? `<span class="rest" hidden> ${esc(lb)}</span>` : ''}</p>` : ''}${e.rule ? `<p class="rl"><span class="rk">Rule</span>${esc(e.rule)}</p>` : ''}${lb || e.source ? `<div class="lnk">${lb ? '<button class="more">more</button>' : ''}${e.source ? '<button class="srct">Source ▸</button>' : ''}</div>` : ''}${e.source ? `<div class="srcl" hidden>${esc(e.source)}</div>` : ''}</div></article>`; });
    const body = [
      (issues.length ? `<section class="sec issues" id="sec-issues" data-open="false"><h3 class="sh" tabindex="0" role="button" aria-expanded="false"><span class="lbl">${issues.length} issue${issues.length === 1 ? '' : 's'}</span><span class="caret">${ICON.caret}</span></h3><div class="sb">${issues.map((t) => `<div class="callout iss" role="button" tabindex="0">${ICON.warn}<p>${esc(t)}</p><span class="chev">${ICON.caret}</span></div>`).join('')}</div></section>` : ''),
      sec('elements', 'Annotations', els.length, els.length > 0, els.length ? `<div class="ecards">${cards.join('')}</div>` : none),
      sec('states', 'States', states.length, states.length > 0 && states.length <= 6, states.length ? table('states', ['State', 'What changes', 'How you get there'], states.map((x) => `<tr><td class="k">${esc(x.title)}</td><td>${esc(x.what)}</td><td class="how">${x.how ? esc(x.how) : '<span class="muted">—</span>'}</td></tr>`)) : none),
      !ctrls.length ? '' : sec('controls', 'Controls', ctrls.length, ctrls.length > 0 && ctrls.length <= 6, ctrls.length ? table('controls', ['Control', 'Does', 'Goes to'], ctrls.map((c) => `<tr><td class="k">${esc(c.control)}</td><td>${esc(c.does)}</td><td class="to">${goesTo(c.goesTo)}</td></tr>`)) : none),
      sec('copy', 'Copy', copy.length, false, copy.length ? table('copy', ['Id', 'English', '中文'], copy.map((c, i) => `<tr data-copy="${i}"></tr>`)) : none),
      sec('edge', 'Edge cases', edge.length, false, edge.length ? table('edge', ['Case', 'Handled?'], edge.map((t) => `<tr><td>${esc(t)}</td><td class="how"><span class="muted">unknown</span></td></tr>`)) : none),
      sec('rules', 'PRD rules applied', rules.length, false, rules.length ? rules.map((t) => `<a class="quote" href="#" data-prd>${esc(t)}</a>`).join('') : none),
    ];
    return { html: head + body.join(''), els, copy };
  }

  function fillNotes() {
    notes.querySelectorAll('.tab').forEach((b) => b.setAttribute('aria-pressed', b.dataset.t === notesTab));
    const body = notes.querySelector('.body'); body.scrollTop = 0; clearPins();
    if (notesTab === 'prd') { body.innerHTML = f.prd ? `<div class="doc">${md(prdSource(f.prd))}</div>` : '<p class="none">No PRD written yet.</p>'; collapsePrd(body); return; }
    const s = idx[shown], nt = s && s.notes;
    if (!s) { body.innerHTML = '<p class="none">Select a screen in the flow.</p>'; return; }
    if (!nt || !Object.keys(nt).length) { body.innerHTML = `<div class="spechead"><div class="t"><h2>${esc(s.name)}</h2>${s.zh ? `<span class="zh">${esc(s.zh)}</span>` : ''}<span class="pill">${dot(s.status)}${esc(STATUS[s.status] || s.status)}</span></div></div><p class="none">No notes written yet.</p>`; return; }
    const spec = specHtml(s, nt); body.innerHTML = spec.html;
    body.querySelectorAll('.sh').forEach((h) => {
      const toggle = () => { const sec = h.parentElement, on = sec.dataset.open !== 'true'; sec.dataset.open = on; h.setAttribute('aria-expanded', on); };
      h.onclick = toggle; h.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); } };
    });
    body.querySelectorAll('.callout.iss').forEach((c) => { const t = () => c.classList.toggle('open'); c.onclick = t; c.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); t(); } }; });
    body.querySelectorAll('.ecard tbody tr').forEach((tr) => { const c = tr.closest('.ecard'); tr.addEventListener('mouseenter', () => c._hot && c._hot(true)); tr.addEventListener('mouseleave', () => c._hot && c._hot(false)); });
    body.querySelectorAll('.ecard').forEach((c) => {
      const row = c.querySelector('.eh'), toggle = () => (c.classList.contains('open') ? collapseCard(c) : expandCard(c, false));
      row.onclick = toggle; row.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); } };
      const st = c.querySelector('.srct'); if (st) st.onclick = () => { const sl = c.querySelector('.srcl'); sl.hidden = !sl.hidden; st.textContent = sl.hidden ? 'Source ▸' : 'Source ▾'; };
      const more = c.querySelector('.more'); if (more) more.onclick = () => { const r = c.querySelector('.rest'); r.hidden = !r.hidden; more.textContent = r.hidden ? 'more' : 'less'; };
    });
    body.querySelectorAll('[data-go]').forEach((b) => { b.onclick = () => goto(b.dataset.go); });
    body.querySelectorAll('[data-prd]').forEach((a) => { a.onclick = (ev) => { ev.preventDefault(); notesTab = 'prd'; fillNotes(); }; });
    const cards = [...body.querySelectorAll('.ecard')]; locate(spec.els.map((e, i) => ({ n: i + 1, e, card: cards[i] })));
    loadStrings().then((reg) => {
      if (!body.isConnected || idx[shown] !== s) return;
      body.querySelectorAll('tr[data-copy]').forEach((tr) => {
        const c = spec.copy[+tr.dataset.copy], x = reg.strings && reg.strings[c];
        tr.innerHTML = x ? `<td class="id">${esc(c)}</td><td>${esc(x.en)}</td><td>${esc(x.zh || '—')}</td>` : `<td class="id muted">—</td><td>${esc(String(c).replace(/\s*\(raw\)\s*/g, ' ').trim())} <span class="tag">not in registry</span></td><td class="muted">—</td>`;
      });
    });
  }
  function collapsePrd(body) {
    const doc = body.querySelector('.doc'); if (!doc) return;
    [...doc.querySelectorAll('h2')].forEach((h) => {
      const sb = el('<div class="sb"></div>'); let n = h.nextSibling; while (n && !(n.nodeType === 1 && n.tagName === 'H2')) { const nx = n.nextSibling; sb.append(n); n = nx; }
      const sec = el(`<section class="sec" data-open="${/^(problem|rules)$/i.test(h.textContent.trim())}"></section>`);
      const hd = el(`<h3 class="sh" tabindex="0" role="button"><span class="lbl">${esc(h.textContent)}</span><span class="caret">${ICON.caret}</span></h3>`);
      const pv = (sb.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140);
      h.replaceWith(sec); sec.append(hd, el(`<p class="prev">${esc(pv)}</p>`), sb); hd.setAttribute('aria-expanded', sec.dataset.open);
      const toggle = () => { const on = sec.dataset.open !== 'true'; sec.dataset.open = on; hd.setAttribute('aria-expanded', on); };
      hd.onclick = toggle; hd.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); } };
    });
  }
  /* the PRD tab: a Decisions list of "heading — gist" lines becomes a table */
  function prdSource(src) {
    const lines = String(src).split('\n'), i = lines.findIndex((l) => /^##\s+Decisions\s*$/.test(l));
    if (i < 0) return src;
    let j = i + 1; while (j < lines.length && !/^##\s/.test(lines[j])) j++;
    const sec = lines.slice(i + 1, j), items = sec.filter((l) => /^[-*]\s/.test(l));
    if (!items.length || !items.every((l) => l.includes(' — '))) return src;
    const rows = items.map((l) => { const t = l.replace(/^[-*]\s+/, ''), k = t.indexOf(' — '); return `| ${t.slice(0, k).replace(/\|/g, '/')} | ${t.slice(k + 3).replace(/\|/g, '/')} |`; });
    return [...lines.slice(0, i + 1), '', '| Decision | Basis |', '| --- | --- |', ...rows, '', ...lines.slice(j)].join('\n');
  }
  const openNotes = (tab, anchor) => { if (tab) notesTab = tab; setNotes(true); fillNotes(); if (anchor) notes.querySelector('#' + anchor)?.scrollIntoView(); };
  notes.querySelectorAll('.tab').forEach((b) => { b.onclick = () => { notesTab = b.dataset.t; fillNotes(); }; });
  notes.querySelector('.x').onclick = () => setNotes(false);
  const lp = document.getElementById('l-prd'), ld = document.getElementById('l-dec');
  if (lp) lp.onclick = (e) => { e.preventDefault(); openNotes('prd'); };
  if (ld) ld.onclick = (e) => { e.preventDefault(); openNotes('prd', 'h-decisions'); };

  function select(nid) {
    selected = nid; mark(nid); dock.innerHTML = '';
    const H = Math.max(420, Math.min(760, innerHeight - 56 - 130));
    let other = null;
    if (nid.startsWith('entry:')) {
      const e = entries.find((x) => x.id === nid), src = e.from ? idx[e.from] : { name: 'App start', blank: 'The app opens here.' };
      shown = e.from;
      dock.append(el(`<div class="cap">${e.control ? 'Tap the <span class="hl">outlined</span> part' : esc(src.name)}</div>`), shot(src, { height: H, control: e.control, entry: f.id, via: /choose unit/i.test(e.label || '') ? 'choose-unit' : /toolbox/i.test(e.control || '') ? 'toolbox' : '', onControl: () => e.lands && select(e.lands) }));
    } else if (nid.startsWith('adds:')) {
      const a = f.addsTo[+nid.split(':')[1]], target = idx[a.screen]; other = allFeatures().find((x) => x.id === a.feature) || { id: a.feature, name: a.feature };
      shown = a.screen;
      dock.append(el('<div class="cap">&nbsp;</div>'), shot(target, { height: H, open: a.open, markAdded: a.added ? a.what : null, addPlaceholder: a.added ? null : { after: a.under, text: `Added by ${f.name} — not designed yet` } }));
    } else { shown = nid; dock.append(el('<div class="cap">&nbsp;</div>'), shot(idx[nid], { height: H })); }
    const ns = idx[shown] && idx[shown].notes, noteCount = ns ? (ns.elements || []).filter((e) => !CHROME.test(`${e.name} ${e.shows}`)).length : 0;
    const hasNotes = !!(ns && Object.keys(ns).length) && !(idx[shown] && idx[shown].status === 'placeholder');
    const tools = el(`<div class="tools">${hasNotes ? `<button class="notesbtn" data-notes aria-pressed="${notes.classList.contains('open')}"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 2.5h10v11H3z M5.5 5.5h5 M5.5 8h5 M5.5 10.5h3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="nc">Notes${noteCount ? ` · ${noteCount}` : ''}</span></button>` : ''}${other ? `<a href="#" data-other>Open ${esc(other.name)}</a>` : ''}</div>`);

    const ol = tools.querySelector('[data-other]'); if (ol) ol.onclick = (ev) => { ev.preventDefault(); openFeature(other.id); };
    dock.append(tools); if (notes.classList.contains('open')) fillNotes();
  }

  col.append(wrap, notes); page.append(col, dock);
  let pdown = false; const toggleNotes = () => { if (notes.classList.contains('open')) setNotes(false); else openNotes(); };
  dock.addEventListener('pointerdown', (ev) => { if (ev.button === 0 && ev.target.closest('[data-notes]')) { pdown = true; toggleNotes(); } });
  dock.addEventListener('click', (ev) => { if (!ev.target.closest('[data-notes]')) return; if (pdown) { pdown = false; return; } toggleNotes(); });
  pz = panzoom(wrap, plane, () => { const r = wrap.getBoundingClientRect(), k = Math.max(0.7, Math.min(1, (r.width - 28) / L.width)); return { k, x: Math.max(14, (r.width - L.width * k) / 2), y: 14 }; },
    { scroll: true, size: () => L });
  wrap.querySelectorAll('[data-z]').forEach((b) => { b.onclick = () => { const z = +b.dataset.z; z ? pz.step(z > 0 ? 1.2 : 1 / 1.2) : pz.fit(); }; });
  requestAnimationFrame(() => pz.fit());
  const chip = el('<button class="edgechip" title="More to the right" aria-label="Pan right" hidden>→</button>'); wrap.append(chip);
  const cutBy = () => pz.state.x + (L.width - 20) * pz.state.k - wrap.clientWidth;
  const belowBy = () => pz.state.y + L.height * pz.state.k - wrap.clientHeight;
  chip.onclick = (ev) => { ev.stopPropagation(); pz.pan(-Math.min(300, cutBy() + 24), 0); };
  const iv = setInterval(() => { if (!wrap.isConnected) return clearInterval(iv); const cut = cutBy() > 6; chip.hidden = !cut; wrap.classList.toggle('cut', cut); wrap.classList.toggle('cutb', belowBy() > 8); }, 200);
  const firstOf = () => { const a = f.anchor; const own = new Set(f.screens.map((s) => s.id)); const pick = (ids) => (ids || []).find((i) => own.has(i)); return (a && pick((a.statuses || []).flatMap((s) => s.screens || []))) || pick((f.groups || []).flatMap((g) => g[1])) || f.screens[0]?.id; };
  select(sel && nodes[sel] ? sel : (nodes[firstOf()] ? firstOf() : Object.keys(nodes)[0]));
}

function closeFeature() {
  CURRENT = null; const p = document.getElementById('feature'); p.hidden = true; p.innerHTML = '';
  setParam('feature', null); setParam('screen', null); header('');
}
