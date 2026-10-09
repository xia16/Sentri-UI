/* A feature page: the flow in the centre, a live phone docked on the right, notes behind a button.
   Organising rule: a feature with an anchor (Farrowing's sow) is laid out by the anchor's statuses,
   left to right, inside the task's status bands; each screen sits in the status where it can be reached.
   A feature without an anchor uses its named groups as stacked strips. Arrows: only the selected node's. */
'use strict';

let CURRENT = null; // the open feature page: { mark(id) } so a bare screen can announce itself

/* ---------- a live screen ----------
   SHIM: until screens open bare by URL, a screen is the existing prototype in an iframe at 1400px,
   switched to the screen's `preset` through its select.scenario, cropped to its own phone by the
   phone's viewport rect. The iframe grows instead of scrolling. Replace with the bare URL when it lands. */
function shot(screen, opts = {}) {
  const H = opts.height || 760, k = H / 844, W = Math.round(390 * k);
  const box = el(`<div class="shot" style="width:${W}px;height:${H}px"></div>`);
  if (!screen || !screen.url) {
    box.append(el(`<div class="blank"><b>${esc(screen?.name || 'Not designed yet')}</b><span>${esc(screen?.blank || 'Not designed yet.')}</span></div>`));
    return box;
  }
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
        if (sel && sel.value !== screen.preset) { sel.value = screen.preset; sel.dispatchEvent(new Event('change', { bubbles: true })); await wait(300); for (let i = 0; i < 20 && !(p = find(d)); i++) await wait(100); }
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
      await wait(200);
      d.scrollingElement.scrollTo(0, 0);
      let r = p.getBoundingClientRect(); f.style.height = Math.ceil(r.bottom + 40) + 'px'; await wait(80);
      r = p.getBoundingClientRect(); const kk = W / r.width;
      f.style.transform = `scale(${kk})`; f.style.left = -r.left * kk + 'px'; f.style.top = -r.top * kk + 'px';
      box.style.height = Math.round(r.height * kk) + 'px'; f.style.visibility = 'visible';
    } catch (e) { box.append(el('<div class="blank"><b>Could not show this screen</b></div>')); }
  };
  return box;
}

/* a bare screen (#49) will announce its id; the flow follows the demo */
addEventListener('message', (m) => { if (m.data && m.data.atlasScreen && CURRENT) CURRENT.mark(m.data.atlasScreen); });

/* ---------- layout ---------- */
function layoutFlow(f, entries) {
  const NW = 176, NH = 44, CP = 14, HEAD = 32, PAD = 16, GAP = 18, VG = 12;
  const pos = {}, boxes = [], x0 = 20;
  let y = 20, maxX = 0; const placed = new Set();
  const rowW = (n) => n * NW + (n - 1) * GAP;
  const strip = (name, kind, ids) => {
    ids = ids.filter((i) => !placed.has(i) || i.includes(':')); if (!ids.length) return;
    boxes.push({ name, kind, x: x0, y, w: 0, h: HEAD + NH + PAD });
    ids.forEach((id, i) => { pos[id] = { x: x0 + PAD + i * (NW + GAP), y: y + HEAD }; placed.add(id); });
    maxX = Math.max(maxX, x0 + PAD + rowW(ids.length) + PAD); y += HEAD + NH + PAD + 22;
  };
  strip('Ways in', 'entry', entries.map((e) => e.id));
  const a = f.anchor, ownIds = f.screens.map((s) => s.id);
  if (a) {
    strip('In any status', 'any', a.any || []);
    const col = (name, ids, x, yy, kind) => {
      ids = ids || []; const h = HEAD + Math.max(1, ids.length) * NH + Math.max(0, ids.length - 1) * VG + PAD;
      boxes.push({ name, kind, x, y: yy, w: NW + CP * 2, h });
      ids.forEach((id, i) => { pos[id] = { x: x + CP, y: yy + HEAD + i * (NH + VG) }; placed.add(id); }); return h;
    };
    const bandY = y, inner = bandY + HEAD; let x = x0 + PAD, hMax = 0;
    const sts = a.statuses || [], exits = a.exits || [];
    sts.forEach((s, i) => { hMax = Math.max(hMax, col(s.name, s.screens, x, inner, 'status')); if (i < sts.length - 1) boxes[boxes.length - 1].arrow = true; x += NW + CP * 2 + GAP; });
    exits.forEach((s) => { hMax = Math.max(hMax, col(s.name + ' · exit', s.screens, x, inner, 'exit')); x += NW + CP * 2 + GAP; });
    const [t1, t2] = a.task || [];
    boxes.push({ name: t1 ? t1.name : a.name, kind: 'band', x: x0, y: bandY, w: x - x0 - GAP + PAD, h: HEAD + hMax + PAD });
    let endX = x - GAP + PAD;
    if (t2) {
      const bx = endX + 24, h2 = col('End task', t2.screens, bx + PAD, inner, 'status');
      boxes.push({ name: t2.name, kind: 'band', x: bx, y: bandY, w: NW + CP * 2 + PAD * 2, h: HEAD + Math.max(hMax, h2) + PAD });
      endX = bx + NW + CP * 2 + PAD * 2;
    }
    maxX = Math.max(maxX, endX); y = bandY + HEAD + hMax + PAD + 22;
  } else {
    const owned = new Set(ownIds);
    (f.groups || []).forEach(([name, ids]) => strip(name, '', ids.filter((i) => owned.has(i))));
  }
  strip(a || (f.groups || []).length ? 'Other' : 'Screens', '', ownIds); // anything not placed above
  strip('Adds to', 'adds', (f.addsTo || []).map((_, i) => 'adds:' + i));
  boxes.forEach((b) => { if (!b.w) b.w = maxX - x0; });
  return { pos, boxes, width: maxX + 20, height: y, NW, NH };
}

/* ---------- the page ---------- */
function openFeature(id, sel) {
  const f = allFeatures().find((x) => x.id === id); if (!f) return;
  const plat = S.data.platforms.find((p) => p.sections.some((s) => s.id === f.sectionRef.id && s.features.some((x) => x.id === id)));
  if (plat) S.platformId = plat.id;
  S.view = 'atlas';
  const idx = screenIndex(); setParam('feature', id);
  const n = f.screens.length;
  const todos = f.screens.filter((s) => s.status === 'placeholder').length + f.screens.reduce((t, s) => t + ((s.notes && s.notes.issues) || []).length, 0);
  const confirm = ((f.prd || '').match(/to confirm/gi) || []).length;
  header(`<a href="#" id="crumb-back">${esc(f.sectionRef.name)}</a> / <b>${esc(f.name)}</b> <span class="zh">${esc(f.zh || '')}</span>
    <span class="meta">${dot(f.status)}<span>${plural(n, 'screen')}</span> · <a href="#" id="l-prd">PRD</a> · <a href="#" id="l-dec">Decisions</a> · <span title="Placeholder screens plus issues written in screen notes">To-dos ${todos}</span> · <span title="Open questions marked “to confirm” in the PRD">To confirm ${confirm}</span></span>`);
  document.getElementById('crumb-back').onclick = (e) => { e.preventDefault(); closeFeature(); };
  const page = document.getElementById('feature'); page.hidden = false; page.innerHTML = '';

  const entries = (f.entryPoints || []).map((e, i) => Object.assign({}, e, { id: 'entry:' + i }));
  const { pos, boxes, width, height, NW, NH } = layoutFlow(f, entries);
  const edges = [...entries.filter((e) => e.lands).map((e) => [e.id, e.lands, e.control || e.label]), ...(f.flow || [])];

  const col = el('<div class="flowcol"></div>');
  const wrap = el('<div class="flowwrap"><div class="flowplane"><svg width="10" height="10"></svg></div><div class="zoom"><button data-z="-1" title="Zoom out">−</button><button data-z="0" title="Fit">⤢</button><button data-z="1" title="Zoom in">+</button></div></div>');
  const plane = wrap.querySelector('.flowplane'), svg = plane.querySelector('svg');
  boxes.forEach((b) => plane.append(el(`<div class="group ${b.kind || ''}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px"><span>${esc(b.name)}</span>${b.arrow ? '<i class="next">→</i>' : ''}</div>`)));
  const dock = el('<div class="dock"></div>'), nodes = {};
  const place = (nid, html, cls, title, onclick) => { if (!pos[nid]) return; const b = el(`<button class="node ${cls}" title="${esc(title)}">${html}</button>`); b.style.left = pos[nid].x + 'px'; b.style.top = pos[nid].y + 'px'; b.onclick = onclick; plane.append(b); nodes[nid] = b; };
  entries.forEach((e) => place(e.id, `<span><b>${esc(e.section)}</b> · ${esc(e.label)}</span>`, 'entry', `${e.section} · ${e.label}`, () => select(e.id)));
  f.screens.forEach((s) => place(s.id, `${dot(s.status)}<span>${esc(s.name)}</span>`, s.status === 'placeholder' ? 'placeholder' : '', s.zh ? `${s.name} · ${s.zh}` : s.name, () => select(s.id)));
  (f.addsTo || []).forEach((a, i) => place('adds:' + i, `<span>${esc(a.what)}</span>`, 'adds', `Adds to ${a.feature}`, () => select('adds:' + i)));

  const defs = '<defs><marker id="aron" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#276640"/></marker></defs>';
  function drawEdges(active) {
    svg.innerHTML = defs; if (!active) return;
    edges.filter(([a, b]) => (a === active || b === active) && a !== b).forEach(([a, b, label]) => {
      if (!pos[a] || !pos[b]) return;
      const A = pos[a], B = pos[b]; let d, lx, ly;
      if (Math.abs(A.x - B.x) < 2) { const x = A.x + NW, y1 = A.y + NH / 2, y2 = B.y + NH / 2; d = `M${x},${y1} C${x + 40},${y1} ${x + 40},${y2} ${x},${y2}`; lx = x + 36; ly = (y1 + y2) / 2 + 4; }
      else if (Math.abs(A.y - B.y) < 2 && B.x > A.x) { d = `M${A.x + NW},${A.y + NH / 2} L${B.x},${B.y + NH / 2}`; lx = (A.x + NW + B.x) / 2; ly = A.y - 6; }
      else if (B.y > A.y + NH) { const x1 = A.x + NW / 2, x2 = B.x + NW / 2; d = `M${x1},${A.y + NH} C${x1},${A.y + NH + 40} ${x2},${B.y - 40} ${x2},${B.y}`; lx = x2; ly = B.y - 8; }
      else { const r = B.x > A.x, x1 = r ? A.x + NW : A.x, x2 = r ? B.x : B.x + NW, c = r ? 50 : -50; d = `M${x1},${A.y + NH / 2} C${x1 + c},${A.y + NH / 2} ${x2 - c},${B.y + NH / 2} ${x2},${B.y + NH / 2}`; lx = (x1 + x2) / 2; ly = Math.min(A.y, B.y) - 4; }
      svg.insertAdjacentHTML('beforeend', `<path class="edge" d="${d}" marker-end="url(#aron)"/>`);
      if (label) svg.insertAdjacentHTML('beforeend', `<text class="elabel" x="${lx}" y="${ly}" text-anchor="middle">${esc(label)}</text>`);
    });
  }
  const mark = (nid) => { Object.entries(nodes).forEach(([k, b]) => b.setAttribute('aria-current', k === nid)); drawEdges(nid); setParam('screen', nid); };
  CURRENT = { mark: (sid) => nodes[sid] && mark(sid) };
  wrap.addEventListener('click', (e) => { if (!e.target.closest('.node, .zoom')) drawEdges(null); });

  /* the notes panel follows what the phone shows */
  const notes = el('<div class="notes"><header><button class="tab" data-t="screen">Screen notes</button><button class="tab" data-t="prd">Feature PRD</button><button class="x" title="Close notes" aria-label="Close notes">✕</button></header><div class="body"></div></div>');
  let notesTab = 'screen', shown = null;
  const goto = (sid) => { const t = idx[sid]; if (!t) return; if (t.feature.id === f.id) select(sid); else openFeature(t.feature.id, sid); };
  const li = (xs) => (xs && xs.length ? `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="none">None written yet.</p>');
  const goesTo = (t) => {
    if (!t) return '<span class="muted">—</span>';
    let out = '', last = 0; const re = /[a-z0-9-]+\.[a-z0-9-]+/g; let m;
    while ((m = re.exec(t))) { if (!idx[m[0]]) continue; out += esc(t.slice(last, m.index)) + `<button class="goto" data-go="${esc(m[0])}">${esc(idx[m[0]].name)}</button>`; last = m.index + m[0].length; }
    return out + esc(t.slice(last));
  };
  function fillNotes() {
    notes.querySelectorAll('.tab').forEach((b) => b.setAttribute('aria-pressed', b.dataset.t === notesTab));
    const body = notes.querySelector('.body');
    if (notesTab === 'prd') { body.innerHTML = f.prd ? `<div class="doc">${md(f.prd)}</div>` : '<p class="none">No PRD written yet.</p>'; return; }
    const s = idx[shown], nt = s && s.notes;
    if (!s) { body.innerHTML = '<p class="none">Select a screen in the flow.</p>'; return; }
    if (!nt || !Object.keys(nt).length) { body.innerHTML = `<h4>${esc(s.name)}</h4><p class="none">No notes written for this screen yet.</p>`; return; }
    const table = (heads, rows) => rows && rows.length ? `<table><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.join('')}</table>` : '<p class="none">None written yet.</p>';
    body.innerHTML = `<h4>${esc(s.name)}${s.zh ? ' · ' + esc(s.zh) : ''}</h4>${nt.purpose ? `<p>${esc(nt.purpose)}</p>` : '<p class="none">None written yet.</p>'}
      <h4>States</h4>${li(nt.states)}
      <h4>Elements</h4>${table(['Element', 'Shows', 'Display logic', 'Source'], (nt.elements || []).map((e) => `<tr><td>${esc(e.name)}</td><td>${esc(e.shows)}</td><td>${esc(e.logic)}</td><td>${esc(e.source)}</td></tr>`))}
      <h4>Controls</h4>${table(['Control', 'Does', 'Goes to'], (nt.controls || []).map((c) => `<tr><td>${esc(c.control)}</td><td>${esc(c.does)}</td><td>${goesTo(c.goesTo)}</td></tr>`))}
      <h4>Copy ids</h4>${nt.copy && nt.copy.length ? `<p>${nt.copy.map((c) => `<code data-copy="${esc(c)}">${esc(c)}</code>`).join(' ')}</p>` : '<p class="none">None written yet.</p>'}
      <h4>Edge cases</h4>${li(nt.edge)}<h4>PRD rules applied</h4>${li(nt.rules)}<h4>Issues</h4>${li(nt.issues)}`;
    body.querySelectorAll('[data-go]').forEach((b) => { b.onclick = () => goto(b.dataset.go); });
    loadStrings().then((reg) => body.querySelectorAll('[data-copy]').forEach((c) => { const x = reg.strings && reg.strings[c.dataset.copy]; if (x) c.title = x.en; }));
  }
  const openNotes = (tab, anchor) => { if (tab) notesTab = tab; notes.classList.add('open'); fillNotes(); const b = dock.querySelector('[data-notes]'); if (b) b.setAttribute('aria-pressed', 'true'); if (anchor) notes.querySelector('#' + anchor)?.scrollIntoView(); };
  notes.querySelectorAll('.tab').forEach((b) => { b.onclick = () => { notesTab = b.dataset.t; fillNotes(); }; });
  notes.querySelector('.x').onclick = () => { notes.classList.remove('open'); dock.querySelector('[data-notes]')?.setAttribute('aria-pressed', 'false'); };
  document.getElementById('l-prd').onclick = (e) => { e.preventDefault(); openNotes('prd'); };
  document.getElementById('l-dec').onclick = (e) => { e.preventDefault(); openNotes('prd', 'h-decisions'); };

  function select(nid) {
    mark(nid); dock.innerHTML = '';
    const H = Math.max(420, Math.min(760, innerHeight - 56 - 130));
    if (nid.startsWith('entry:')) {
      const e = entries.find((x) => x.id === nid), src = e.from ? idx[e.from] : { name: 'App start', blank: 'The app opens here.' };
      shown = e.from;
      dock.append(el(`<div class="cap">${esc(e.section)} · ${esc(src?.name || '')}${e.control ? ' — tap the <span class="hl">outlined</span> part' : ''}</div>`),
        shot(src, { height: H, control: e.control, onControl: () => e.lands && select(e.lands) }));
    } else if (nid.startsWith('adds:')) {
      const a = f.addsTo[+nid.split(':')[1]], target = idx[a.screen], other = allFeatures().find((x) => x.id === a.feature);
      shown = a.screen;
      dock.append(el(`<div class="cap">${esc(other?.name || a.feature)} · ${esc(target?.name || '')} — <span class="hl">outlined</span>: what ${esc(f.name)} adds</div>`),
        shot(target, { height: H, open: a.open, markAdded: a.added ? a.what : null, addPlaceholder: a.added ? null : { after: a.under, text: `Added by ${f.name} — not designed yet` } }));
      const go = el(`<div class="cap"><a href="#">Open ${esc(other?.name || a.feature)}</a></div>`);
      go.querySelector('a').onclick = (ev) => { ev.preventDefault(); openFeature(a.feature); }; dock.append(go);
    } else {
      const s = idx[nid]; shown = nid;
      dock.append(el(`<div class="cap">${dot(s.status)} ${esc(s.name)}</div>`), shot(s, { height: H }));
    }
    const tools = el(`<div class="tools"><button data-notes aria-pressed="${notes.classList.contains('open')}">Notes</button></div>`);
    tools.firstChild.onclick = () => { if (notes.classList.contains('open')) { notes.classList.remove('open'); tools.firstChild.setAttribute('aria-pressed', 'false'); } else openNotes(); };
    dock.append(tools); if (notes.classList.contains('open')) fillNotes();
  }

  col.append(wrap, notes); page.append(col, dock);
  const pz = panzoom(wrap, plane, () => fitTo(wrap, width, height, 1, 14));
  wrap.querySelectorAll('[data-z]').forEach((b) => { b.onclick = () => { const z = +b.dataset.z; z ? pz.step(z > 0 ? 1.2 : 1 / 1.2) : pz.fit(); }; });
  requestAnimationFrame(() => pz.fit());
  select(sel && nodes[sel] ? sel : (entries[0]?.id || f.screens[0]?.id));
}

function closeFeature() {
  CURRENT = null; const p = document.getElementById('feature'); p.hidden = true; p.innerHTML = '';
  setParam('feature', null); setParam('screen', null); header('');
}
