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
    box.append(el(`<div class="blank">${screen?.name ? `<b>${esc(screen.name)}</b>` : ''}<span>${esc(screen?.blank || 'Not designed yet.')}</span></div>`));
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
  return box;
}

/* a bare screen (#49) will announce its id; the flow follows the demo */
addEventListener('message', (m) => { if (m.data && m.data.atlasScreen && CURRENT) CURRENT.mark(m.data.atlasScreen); });

/* ---------- layout ---------- */
function layoutFlow(f, entries) {
  const NW = 190, NH = 48, CP = 14, HEAD = 32, PAD = 16, GAP = 18, VG = 12, PER = 5;
  const pos = {}, boxes = [], x0 = 20;
  let y = 20, maxX = 0, y0top = 0; const placed = new Set();
  const strip = (name, kind, ids) => {
    ids = ids.filter((i) => !placed.has(i) || i.includes(':')); if (!ids.length) return;
    const rows = Math.ceil(ids.length / PER), cols = Math.min(PER, ids.length), h = HEAD + rows * NH + (rows - 1) * VG + PAD;
    boxes.push({ name, kind, x: x0, y, w: 0, h });
    ids.forEach((id, i) => { pos[id] = { x: x0 + PAD + (i % PER) * (NW + GAP), y: y + HEAD + Math.floor(i / PER) * (NH + VG) }; placed.add(id); });
    maxX = Math.max(maxX, x0 + PAD + cols * NW + (cols - 1) * GAP + PAD); y += h + 22;
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
    const bandY = y; let inner = bandY + HEAD, x = x0 + PAD, hMax = 0, topW = 0;
    const [t1, t2] = a.task || [];
    const top = ((t1 && t1.screens) || []).filter((i) => !placed.has(i));
    if (top.length) { // screens of the first task band sit in a strip at the top of the band
      const rows = Math.ceil(top.length / PER);
      top.forEach((id, i) => { pos[id] = { x: x0 + PAD + (i % PER) * (NW + GAP), y: inner + Math.floor(i / PER) * (NH + VG) }; placed.add(id); });
      topW = PAD * 2 + Math.min(PER, top.length) * NW + (Math.min(PER, top.length) - 1) * GAP;
      const th = rows * NH + (rows - 1) * VG + 14; inner += th; y0top = th;
    }
    const sts = a.statuses || [], exits = a.exits || [];
    sts.forEach((s, i) => { hMax = Math.max(hMax, col(s.name, s.screens, x, inner, 'status')); if (i < sts.length - 1) boxes[boxes.length - 1].arrow = true; x += NW + CP * 2 + GAP; });
    exits.forEach((s) => { hMax = Math.max(hMax, col(s.name + ' · exit', s.screens, x, inner, 'exit')); x += NW + CP * 2 + GAP; });
    hMax += y0top;
    boxes.push({ name: t1 ? t1.name : a.name, kind: 'band', x: x0, y: bandY, w: Math.max(topW, x - x0 - GAP + PAD), h: HEAD + hMax + PAD });
    let endX = x0 + Math.max(topW, x - x0 - GAP + PAD);
    if (t2) {
      const bx = endX + 24, h2 = col('End task', t2.screens, bx + PAD, inner, 'status');
      boxes.push({ name: t2.name, kind: 'band', x: bx, y: bandY, w: NW + CP * 2 + PAD * 2, h: HEAD + Math.max(hMax, h2) + PAD });
      endX = bx + NW + CP * 2 + PAD * 2;
    }
    maxX = Math.max(maxX, endX); y = bandY + HEAD + hMax + PAD + 22;
  } else {
    const owned = new Set(ownIds);
    (f.groups || []).forEach(([name, ids]) => strip(name === 'Old UI' ? 'Screens in the old UI' : name, '', ids.filter((i) => owned.has(i))));
  }
  strip(a || (f.groups || []).length ? 'Other' : 'Screens', '', ownIds); // anything not placed above
  strip('Adds to', 'adds', (f.addsTo || []).map((_, i) => 'adds:' + i));
  boxes.forEach((b) => { if (!b.w) b.w = maxX - x0; });
  return { pos, boxes, width: maxX + 20 + 96, height: y + 96, NW, NH };
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
    <span class="meta">${dot(f.status)}<span>${plural(n, 'screen')}</span> · <a href="#" id="l-prd">PRD</a> · <a href="#" id="l-dec">Decisions</a>${todos ? ` · <span title="Placeholder screens plus issues written in screen notes">To-dos ${todos}</span>` : ''}${confirm ? ` · <span title="Open questions marked “to confirm” in the PRD">To confirm ${confirm}</span>` : ''}</span>`);
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
  f.screens.forEach((s) => place(s.id, `${dot(s.status)}<span>${esc(s.name)}</span>`, s.status === 'placeholder' ? 'placeholder' : '', s.status === 'placeholder' ? 'Placeholder — not designed yet' : (s.zh ? `${s.name} · ${s.zh}` : s.name), () => select(s.id)));
  (f.addsTo || []).forEach((a, i) => place('adds:' + i, `<span>${esc(a.what)}</span>`, 'adds', `Adds to ${a.feature}`, () => select('adds:' + i)));

  const defs = '<defs><marker id="aron" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#276640"/></marker></defs>';
  const trim = (t) => { t = String(t || ''); return t.length > 40 ? t.slice(0, 39) + '…' : t; };
  function drawEdges(active) {
    svg.innerHTML = defs;
    Object.entries(nodes).forEach(([k, n]) => { n.classList.remove('nb-out', 'nb-in', 'dim'); n.querySelector('.bdg')?.remove(); if (n.dataset.t != null) n.title = n.dataset.t; else n.dataset.t = n.title; });
    if (!active) return;
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
  CURRENT = { mark: (sid) => nodes[sid] && mark(sid) };
  wrap.addEventListener('click', (e) => { if (!e.target.closest('.node, .zoom')) drawEdges(null); });

  /* the notes panel follows what the phone shows */
  const notes = el('<div class="notes"><header><button class="tab" data-t="screen">Screen notes</button><button class="tab" data-t="prd">Feature PRD</button><button class="x" title="Close notes" aria-label="Close notes">✕</button></header><div class="body"></div></div>');
  let notesTab = 'screen', shown = null, pz = null, selected = null;
  const setNotes = (on) => { notes.classList.toggle('open', on); col.classList.toggle('notes-open', on); dock.querySelector('[data-notes]')?.setAttribute('aria-pressed', String(on)); if (pz) { pz.fit(); const sel = nodes[selected]; if (sel) pz.reveal(sel); } };
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
    const blocks = (rows) => (rows && rows.length ? rows.join('') : '<p class="none">None written yet.</p>');
    body.innerHTML = `<h4>${esc(s.name)}${s.zh ? ' · ' + esc(s.zh) : ''}</h4>${nt.purpose ? `<p>${esc(nt.purpose)}</p>` : '<p class="none">None written yet.</p>'}
      <h4>States</h4>${li(nt.states)}
      <h4>Elements</h4>${blocks((nt.elements || []).map((e) => `<div class="nb"><b>${esc(e.name)}</b><div>${esc(e.shows)}</div>${e.logic ? `<div class="m">Logic: ${esc(e.logic)}</div>` : ''}${e.source ? `<div class="m">Source: ${esc(e.source)}</div>` : ''}</div>`))}
      <h4>Controls</h4>${blocks((nt.controls || []).map((c) => `<div class="nb"><b>${esc(c.control)}</b><div>${esc(c.does)}</div>${c.goesTo ? `<div class="m">Goes to: ${goesTo(c.goesTo)}</div>` : ''}</div>`))}
      <h4>Copy ids</h4>${nt.copy && nt.copy.length ? `<p>${nt.copy.map((c) => `<code data-copy="${esc(c)}">${esc(c)}</code>`).join(' ')}</p>` : '<p class="none">None written yet.</p>'}
      <h4>Edge cases</h4>${li(nt.edge)}<h4>PRD rules applied</h4>${li(nt.rules)}<h4>Issues</h4>${li(nt.issues)}`;
    body.querySelectorAll('[data-go]').forEach((b) => { b.onclick = () => goto(b.dataset.go); });
    loadStrings().then((reg) => body.querySelectorAll('[data-copy]').forEach((c) => { const x = reg.strings && reg.strings[c.dataset.copy]; if (x) c.title = x.en; }));
  }
  const openNotes = (tab, anchor) => { if (tab) notesTab = tab; setNotes(true); fillNotes(); if (anchor) notes.querySelector('#' + anchor)?.scrollIntoView(); };
  notes.querySelectorAll('.tab').forEach((b) => { b.onclick = () => { notesTab = b.dataset.t; fillNotes(); }; });
  notes.querySelector('.x').onclick = () => setNotes(false);
  document.getElementById('l-prd').onclick = (e) => { e.preventDefault(); openNotes('prd'); };
  document.getElementById('l-dec').onclick = (e) => { e.preventDefault(); openNotes('prd', 'h-decisions'); };

  function select(nid) {
    selected = nid; mark(nid); dock.innerHTML = '';
    const H = Math.max(420, Math.min(760, innerHeight - 56 - 130));
    let other = null;
    if (nid.startsWith('entry:')) {
      const e = entries.find((x) => x.id === nid), src = e.from ? idx[e.from] : { name: 'App start', blank: 'The app opens here.' };
      shown = e.from;
      dock.append(el(`<div class="cap">${e.control ? 'Tap the <span class="hl">outlined</span> part' : esc(src.name)}</div>`), shot(src, { height: H, control: e.control, onControl: () => e.lands && select(e.lands) }));
    } else if (nid.startsWith('adds:')) {
      const a = f.addsTo[+nid.split(':')[1]], target = idx[a.screen]; other = allFeatures().find((x) => x.id === a.feature) || { id: a.feature, name: a.feature };
      shown = a.screen;
      dock.append(el('<div class="cap">&nbsp;</div>'), shot(target, { height: H, open: a.open, markAdded: a.added ? a.what : null, addPlaceholder: a.added ? null : { after: a.under, text: `Added by ${f.name} — not designed yet` } }));
    } else { shown = nid; dock.append(el('<div class="cap">&nbsp;</div>'), shot(idx[nid], { height: H })); }
    const tools = el(`<div class="tools"><button data-notes aria-pressed="${notes.classList.contains('open')}">Notes</button>${other ? `<a href="#" data-other>Open ${esc(other.name)}</a>` : ''}</div>`);
    tools.firstChild.onclick = () => { if (notes.classList.contains('open')) setNotes(false); else openNotes(); };
    const ol = tools.querySelector('[data-other]'); if (ol) ol.onclick = (ev) => { ev.preventDefault(); openFeature(other.id); };
    dock.append(tools); if (notes.classList.contains('open')) fillNotes();
  }

  col.append(wrap, notes); page.append(col, dock);
  pz = panzoom(wrap, plane, () => fitTo(wrap, width, height, 1, 14, 0.75));
  wrap.querySelectorAll('[data-z]').forEach((b) => { b.onclick = () => { const z = +b.dataset.z; z ? pz.step(z > 0 ? 1.2 : 1 / 1.2) : pz.fit(); }; });
  requestAnimationFrame(() => pz.fit());
  const firstOf = () => { const a = f.anchor; const own = new Set(f.screens.map((s) => s.id)); const pick = (ids) => (ids || []).find((i) => own.has(i)); return (a && pick((a.statuses || []).flatMap((s) => s.screens || []))) || pick((f.groups || []).flatMap((g) => g[1])) || f.screens[0]?.id; };
  select(sel && nodes[sel] ? sel : (nodes[firstOf()] ? firstOf() : Object.keys(nodes)[0]));
}

function closeFeature() {
  CURRENT = null; const p = document.getElementById('feature'); p.hidden = true; p.innerHTML = '';
  setParam('feature', null); setParam('screen', null); header('');
}
