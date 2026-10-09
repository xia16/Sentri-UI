/* SentriTask — the task skeleton (candidate, ADR 0003): farrowing's task anatomy as shared parts.
   Every factory returns an HTML string; the host inserts it and handles [data-action] clicks.
   Styles: task-skeleton.css (load after tokens.css and bundle.css). Uses SentriIcons and SentriUI when present.

   Text slots: every text slot takes a plain string or { text, str, args }. With `str` the text is wrapped in
   <span data-str="id" data-args="…"> for the screen shell to fill (the same twin as SentriUI's `strs`).
   Label slots (aria-label only) take a plain string or { text, str, args } too; `str` becomes data-str-attr. */
(function (root) {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const obj = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : { text: v };
  const argsAttr = a => (a && Object.keys(a).length ? ` data-args="${esc(JSON.stringify(a))}"` : '');
  /* A text slot: escaped text, or a span carrying its registry id. */
  function T(v) {
    if (v == null || v === '') return '';
    const o = obj(v);
    return o.str ? `<span data-str="${esc(o.str)}"${argsAttr(o.args)}>${esc(o.text ?? '')}</span>` : esc(o.text);
  }
  /* A label slot: aria-label, with a data-str-attr twin when it has an id. */
  function L(v, fallback) {
    const o = obj(v == null || v === '' ? fallback : v);
    if (o.text == null && !o.str) return '';
    return ` aria-label="${esc(o.text ?? '')}"` + (o.str ? ` data-str-attr="aria-label:${esc(o.str)}"${argsAttr(o.args)}` : '');
  }
  const A = (action, value) => (action ? ` data-action="${esc(action)}" data-value="${esc(value ?? '')}"` : '');
  const own = { 'back-chevron': 'M15 5l-7 7 7 7' };
  const glyph = k => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${own[k] || (root.SentriIcons && root.SentriIcons.paths && root.SentriIcons.paths[k]) || ''}"/></svg>`;
  /* A line of parts, each a text slot with an optional tone: [{ text, str, args, tone }]; { sep: true } is the
     shared separator, a real text node (ds.sep, the same · as Status lines). */
  const parts = v => (Array.isArray(v) ? v.map(p => { const o = obj(p); if (o.sep) return '<span class="tk-sep" data-str="ds.sep">·</span>'; return o.tone ? `<span class="st-part" data-tone="${esc(o.tone)}">${T(o)}</span>` : T(o); }).join('') : T(v));
  /* ---- TaskPhone ---- */
  function statusbar({ time = { text: '9:41', str: 'tk.statusbar.time' } } = {}) {
    return `<div class="tk-statusbar" aria-hidden="true"><span>${T(time)}</span><span class="tk-statusbar-icons">${glyph('signal')}${glyph('battery')}</span></div>`;
  }
  /* The phone root. Put it straight in <body class="tk-stage">: framed 390×844 when the window is wider than a
     phone, full-bleed at phone width. `inner` is a screen() plus any overlays (drawer(), page(), dialog()). */
  function phone(inner, { label, bar = true, id = '' } = {}) {
    return `<main class="tk-phone inspection-phone" data-ds="TaskPhone" data-st-context="page"${id ? ` id="${esc(id)}"` : ''}${L(label)}>${bar ? statusbar() : ''}${inner || ''}</main>`;
  }
  /* The task surface: header, the one scroller, the dock. `inert` while a drawer, page or dialog is over it. */
  function screen({ header = '', body = '', dock = '', inert = false, label } = {}) {
    return `<div class="tk-screen"${inert ? ' inert' : ''}>${header}<div class="tk-scroll" role="region" tabindex="-1"${L(label)}>${body}</div>${dock}</div>`;
  }

  /* ---- TaskHeader ---- */
  function header({ title, back = { action: 'back' }, backLabel } = {}) {
    const b = back ? `<button type="button" class="tk-header-back"${A(back.action, back.value)}${L(backLabel, { text: 'Back', str: 'act.back' })}>${glyph('back-chevron')}</button>` : '';
    return `<header class="tk-header" data-ds="TaskHeader">${b}<h1 class="tk-header-title">${T(title)}</h1></header>`;
  }
  /* ---- TaskLatest: `Last record 08:41 · G. Hansen` ---- */
  function latest({ lead, value, rest } = {}) {
    return `<div class="tk-latest" data-ds="TaskLatest"><p><span>${T(lead)}</span> <strong>${T(value)}</strong>${rest ? ` <span>${T(rest)}</span>` : ''}</p></div>`;
  }

  /* ---- TaskSummary ---- */
  function summary({ unit = {}, task = {} } = {}) {
    const seg = (task.segments || []).map(s => `<i data-tone="${esc(s.tone)}" style="width:${Math.max(0, Math.min(100, +s.share || 0))}%"></i>`).join('');
    const bar = task.segments ? `<span class="tk-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${esc(task.max ?? 100)}" aria-valuenow="${esc(task.now ?? 0)}"${L(task.barLabel)}>${seg}</span>` : '';
    const u = `<div class="tk-summary-half tk-summary-unit">
      <span class="tk-summary-heading">${unit.icon ? glyph(unit.icon) : ''}${T(unit.heading)}</span>
      <div class="tk-summary-value"><strong>${T(unit.value)}</strong></div>
      <span class="tk-summary-desc">${T(unit.description)}</span>
      ${unit.support ? `<span class="tk-summary-support"${unit.supportTone ? ` data-tone="${esc(unit.supportTone)}"` : ''}>${T(unit.support)}</span>` : ''}</div>`;
    const t = `<button type="button" class="tk-summary-half tk-summary-task"${A(task.action || 'task-overview', task.value)}${L(task.label)}>
      <span class="tk-summary-heading">${task.icon ? glyph(task.icon) : ''}${T(task.heading)}<span class="tk-summary-go">${glyph('chevron')}</span></span>
      <div class="tk-summary-value"><strong>${T(task.count)}</strong>${task.of ? `<span class="tk-summary-of">${T(task.of)}</span>` : ''}</div>
      <span class="tk-summary-desc">${T(task.description)}${task.scope ? ` <span class="tk-summary-scope">${T(task.scope)}</span>` : ''}</span>
      ${bar}${task.support ? `<span class="tk-summary-support">${T(task.support)}</span>` : ''}</button>`;
    return `<section class="tk-summary" data-ds="TaskSummary"${L(unit.label)}>${u}${t}</section>`;
  }

  /* ---- TaskProgress: farrowing's Whole-task progress card (Task overview): a panel head (title, meta), the segmented
     bar, then one count per segment (figure over a dotted label). segments: [{ tone: done|active|rest, share }];
     counts: [{ value, label, tone }] (text slots; tone draws the label's dot in its segment's colour). ---- */
  function progress({ title, meta, segments = [], max, now, barLabel, counts = [], label } = {}) {
    const seg = segments.map(s => `<i data-tone="${esc(s.tone)}" style="width:${Math.max(0, Math.min(100, +s.share || 0))}%"></i>`).join('');
    const c = counts.map(x => `<div class="tk-progress-count"><strong>${T(x.value)}</strong><span>${x.tone ? `<i class="tk-progress-dot" data-tone="${esc(x.tone)}" aria-hidden="true"></i>` : ''}${T(x.label)}</span></div>`).join('');
    return `<section class="st-panel tk-progress-card" data-ds="TaskProgress"${L(label ?? title)}>
      <header class="tk-progress-head"><h3 class="tk-progress-title">${T(title)}</h3>${meta ? `<span class="tk-progress-meta">${T(meta)}</span>` : ''}</header>
      <span class="tk-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${esc(max ?? 100)}" aria-valuenow="${esc(now ?? 0)}"${L(barLabel)}>${seg}</span>
      ${counts.length ? `<div class="tk-progress-counts" style="--tk-count:${counts.length}">${c}</div>` : ''}</section>`;
  }

  /* ---- TaskLens: tabs, the count under each label; the filter at the end ---- */
  function lens({ tabs = [], action = 'lens', filter } = {}) {
    const b = tabs.map(t => `<button type="button" class="tk-lens-tab" aria-pressed="${t.pressed ? 'true' : 'false'}"${A(action, t.value)}${L(t.label)}><span>${T(t.text)}</span><span class="tk-lens-count">${T(t.count)}</span></button>`).join('');
    const f = filter ? `<button type="button" class="tk-lens-filter"${A(filter.action || 'filter', filter.value)}${L(filter.label)}>${glyph('filter')}</button>` : '';
    return `<div class="tk-lens" data-ds="TaskLens"><div class="tk-lens-bar"><div class="tk-lens-tabs" role="group"${L(tabs.label)}>${b}</div>${f}</div></div>`;
  }

  /* ---- TaskGroup: a pen / crate-row card ---- */
  function list(groups) { return `<div class="tk-list">${Array.isArray(groups) ? groups.join('') : groups || ''}</div>`; }
  /* face: 'code' (default: a place code in mono, `B1`) | 'word' (a word in the sans face, `Row A`, `Arrivals`). */
  function group({ title, meta, door, rows = '', face = 'code' } = {}) {
    const inner = `<strong class="tk-group-title"${face === 'word' ? ' data-face="word"' : ''}>${T(title)}</strong>${meta ? `<small class="tk-group-meta">${T(meta)}</small>` : ''}`;
    const head = door
      ? `<button type="button" class="tk-group-door"${A(door.action, door.value)}${L(door.label)}>${inner}${glyph('chevron')}</button>`
      : `<span class="tk-group-door">${inner}</span>`;
    return `<section class="tk-group" data-ds="TaskGroup"><header class="tk-group-head">${head}</header>${Array.isArray(rows) ? rows.join('') : rows}</section>`;
  }
  /* The row's one chip is SentriUI's Status chip: { text, str, args, kind } (kind: awaiting · active · done · late · overdue · died). */
  function statusChip(chip) {
    const o = obj(chip), UI = root.SentriUI;
    const p = { text: o.text ?? '', kind: o.kind || '', tone: o.tone || undefined, variant: 'chip' };
    if (o.str) { p.strs = { text: o.str }; if (o.args) p.args = { text: o.args }; }
    return UI.status(p);
  }
  /* ---- TaskRow: id + chip | headline + meta | chevron, edit or tick ----
     trail 'tick' (with tick: { action = 'toggle', value, checked, label }): the row is a <label> around ChoiceList's multi
     trail, a checkbox (the selection of a bulk act); the whole row is the target. still: a row with no action (a <div>,
     e.g. one that holds its place after a record). data: { name: value } becomes data-name="value" on the row. */
  function row({ id, chip, headline, tone, meta, trail = 'chevron', action = 'open', value = '', label, tick, still = false, data } = {}) {
    const c = chip ? statusChip(chip) : '';
    const g = trail === 'edit' ? glyph('edit') : trail === 'chevron' ? glyph('chevron') : '';
    const d = data ? Object.keys(data).map(k => ` data-${esc(k)}="${esc(data[k])}"`).join('') : '';
    const inner = `
      <span class="tk-row-identity"><span class="tk-row-id">${T(id)}</span>${c}</span>
      <span class="tk-row-detail"><span class="tk-row-headline"${tone ? ` data-tone="${esc(tone)}"` : ''}>${parts(headline)}</span>${meta ? `<span class="tk-row-meta">${parts(meta)}</span>` : ''}</span>`;
    if (trail === 'tick') {
      const t = tick || {};
      return `<label class="tk-row" data-ds="TaskRow" data-trail="tick"${d}>${inner}<span class="tk-row-tick st-choice-trail"><input type="checkbox" data-action="${esc(t.action || 'toggle')}" value="${esc(t.value ?? value)}"${t.checked ? ' checked' : ''}${L(t.label)}></span></label>`;
    }
    if (still) return `<div class="tk-row" data-ds="TaskRow"${d}>${inner}${g}</div>`;
    return `<button type="button" class="tk-row" data-ds="TaskRow"${A(action, value)}${L(label)}${d}>${inner}${g}</button>`;
  }

  /* ---- TaskStepper: the design system's Stepper card (its behaviour, strings and a11y) in farrowing's face ----
     Every prop is SentriUI.stepper's. face: 'row' (default for variant 'row': farrowing's entry row, outlined keys) |
     'well' (default for variant 'hero': the Foster / Reconcile stepper on a well, its label as the section title above) |
     'count' (the count sheet's hero on the green area: a filled green +). */
  function stepper(props = {}) {
    const UI = root.SentriUI;
    const face = props.face || (props.variant === 'hero' ? 'well' : 'row');
    // Farrowing reserves no hint line: a stepper with no hint and no pointers takes no space under its keys.
    const quiet = props.reserveHint == null && !props.hint && !(props.strs && props.strs.hint) && !(props.pointers && props.pointers.length);
    const html = UI.stepper(Object.assign({}, props, quiet ? { reserveHint: false } : {}, { className: `tk-stepper${props.className ? ' ' + props.className : ''}` }));
    return html.replace('data-ds="Stepper"', `data-ds="Stepper" data-face="${esc(face)}"`);
  }

  /* ---- TaskPhotos: the design system's Photos card in farrowing's face (a line, not a well: a camera glyph, the label,
     `Optional`, and an outlined camera key at the right; 50px thumbnails under it). Every prop is SentriUI.photos'. ---- */
  function photos(props = {}) {
    const UI = root.SentriUI;
    const html = UI.photos(Object.assign({}, props, { className: `tk-photos${props.className ? ' ' + props.className : ''}` }));
    return html.replace(/(<span class="st-photos-label"[^>]*>)/, `$1<span class="tk-photos-glyph">${glyph('camera')}</span>`);
  }

  /* ---- TaskRow door: a row with no id column (farrowing's .disclosure): a title, one muted description line, a chevron.
     For a non-animal door inside a sheet or a page (`Record here › Move piglets`). ---- */
  let doorSeq = 0;
  function door({ title, description, action = 'open', value = '', label, trail = 'chevron', act, id = '' } = {}) {
    /* act: a Button spec ({ label, action, value, register = 'secondary', waiting, busy }) — the row's one-tap at its end
       (`Record 12`), beside the door; its accessible name is its label plus the row's title. */
    if (act) {
      const rid = id || `tk-door-${++doorSeq}`, tid = rid + '-title', aid = rid + '-act';
      const g = trail === 'chevron' ? glyph('chevron') : trail === 'edit' ? glyph('edit') : '';
      const main = `<button type="button" class="tk-door-main"${A(action, value)}${L(label)}><span class="tk-door-copy"><strong id="${esc(tid)}">${parts(title)}</strong>${description ? `<small>${parts(description)}</small>` : ''}</span>${g}</button>`;
      const UI = root.SentriUI, l = obj(act.label);
      const props = { label: l.text ?? '', register: act.register || 'secondary', action: act.action || 'act', value: act.value ?? value, waiting: !!act.waiting, busy: !!act.busy, id: aid, labelledby: `${aid} ${tid}` };
      if (l.str) { props.strs = { label: l.str }; if (l.args) props.args = { label: l.args }; }
      return `<div class="tk-door" data-ds="TaskRow" data-variant="door" data-act="" id="${esc(rid)}">${main}${UI.button(props)}</div>`;
    }
    return `<button type="button" class="tk-door" data-ds="TaskRow" data-variant="door"${A(action, value)}${L(label)}><span class="tk-door-copy"><strong>${parts(title)}</strong>${description ? `<small>${parts(description)}</small>` : ''}</span>${trail === 'chevron' ? glyph('chevron') : trail === 'edit' ? glyph('edit') : ''}</button>`;
  }

  /* ---- TaskChoice: farrowing's choice tiles (Foster piglets: Send / Receive): two (or three) big outlined tiles, an icon
     over the label; the chosen one on green-wash. options: [{ value, label, icon, pressed }]; one action for all. ---- */
  function choice({ options = [], action = 'choose', label } = {}) {
    const b = options.map(o => `<button type="button" class="tk-choice-tile" aria-pressed="${o.pressed ? 'true' : 'false'}"${A(action, o.value)}${L(o.aria)}>${o.icon ? glyph(o.icon) : ''}<span>${T(o.label)}</span></button>`).join('');
    return `<div class="tk-choice" data-ds="TaskChoice" role="group" data-count="${options.length}"${L(label)}>${b}</div>`;
  }

  /* ---- TaskRadios: farrowing's flat radio rows (.radio-row: 60px, a line under each, a 14px label, the radio at the
     right). The design system's ChoiceList radio field (SentriUI.choiceRadios: role=radio buttons, roving tab stop,
     radioBind, an optional Clear) in farrowing's face. Every prop is choiceRadios'; layout is always 'rows'. ---- */
  /* layout 'row': farrowing's inline field (Finish · Assisted farrowing: No | Yes): the label (with its Optional tag and
     Clear) left, the options as two 44px outlined pills right, all on one row (the ChoiceList's 'inline' layout). */
  function radios(props = {}) {
    const UI = root.SentriUI, row = props.layout === 'row';
    const html = UI.choiceRadios(Object.assign({}, props, { layout: row ? 'inline' : 'rows', className: `tk-radios${props.className ? ' ' + props.className : ''}` }));
    return html.replace('data-ds="ChoiceList"', `data-ds="ChoiceList" data-face="${row ? 'row' : 'flat'}"`);
  }

  /* ---- TaskWarning: farrowing's danger band (.danger-band): a pale red box, the warning in 12px red, then (optional)
     text actions, then one 10px muted consequence line. tone: 'red' (default) | 'amber'. ---- */
  /* title: a bold first line (farrowing's banners and bands lead with it; the text under it drops to 11px).
     icon + door: farrowing's End banner (⚠ `9 sows will be removed from this batch` ›): the icon left, the copy, a chevron;
     with door ({ action, value, label }) the whole band is one button. tone 'amber' is the banner's colours. */
  function warning({ title, text, actions = '', detail, tone = 'red', icon = '', door: d, label } = {}) {
    const copy = `${title ? `<strong class="tk-warning-title">${parts(title)}</strong>` : ''}${text ? `<p class="tk-warning-text">${parts(text)}</p>` : ''}${actions ? `<div class="tk-warning-actions">${actions}</div>` : ''}${detail ? `<small class="tk-warning-detail">${parts(detail)}</small>` : ''}`;
    const t = esc(tone === 'amber' ? 'amber' : 'red');
    if (!icon && !d) return `<div class="tk-warning" data-ds="TaskWarning" data-tone="${t}" role="note"${L(label)}>${copy}</div>`;
    const inner = `${icon ? `<span class="tk-warning-icon">${glyph(icon)}</span>` : ''}<span class="tk-warning-copy">${copy}</span>${d ? `<span class="tk-warning-go">${glyph('chevron')}</span>` : ''}`;
    return d
      ? `<button type="button" class="tk-warning" data-ds="TaskWarning" data-tone="${t}" data-banner=""${A(d.action || 'open', d.value)}${L(d.label ?? label)}>${inner}</button>`
      : `<div class="tk-warning" data-ds="TaskWarning" data-tone="${t}" data-banner="" role="note"${L(label)}>${inner}</div>`;
  }

  /* ---- TaskSection: farrowing's icon-headed card section (Task outcomes, Other outcomes): a section heading with its
     icon and meta, then one card. body: HTML for the card, or items (below). items: [{ label, value, action, value2 }] —
     rows: false (default) farrowing's outcomes list (label 12px left, 14px mono figure right); rows: true the design
     system's Rows (label 13px/500, the figure as trailing muted text, a chevron when the row has an action). ---- */
  function section({ title, icon = '', meta, body, items = [], rows = false, label } = {}) {
    const UI = root.SentriUI;
    let card = body || '';
    if (!body && items.length && !rows) card = `<dl class="st-panel tk-outcomes">${items.map(i => `<div><dt>${T(i.label)}</dt><dd>${T(i.value)}</dd></div>`).join('')}</dl>`;
    if (!body && items.length && rows) {
      card = UI.rowGroup(items.map(i => {
        const o = obj(i.label), v = obj(i.value == null ? '' : i.value), strs = {}, args = {};
        if (o.str) { strs.title = o.str; if (o.args) args.title = o.args; }
        if (v.str) { strs.trailing = v.str; if (v.args) args.trailing = v.args; }
        return UI.row(Object.assign({ title: o.text ?? '', trailing: v.text ?? '', strs, args }, i.action ? { action: i.action, value: i.target || '' } : {}));
      }).join(''));
    }
    return `<section class="tk-section" data-ds="TaskSection"${L(label ?? title)}>${sectionHead(title, icon, meta)}${card}</section>`;
  }

  /* ---- TaskReceipt: farrowing's ✓ receipt row (Farrowing task ended · 30 Sept, 23:09 · G. Hansen): a 36px green-wash
     disc with a check, a 14px/600 title, an 11px muted meta line. ---- */
  function receipt({ title, meta, icon = 'check', label } = {}) {
    return `<div class="tk-receipt" data-ds="TaskReceipt" role="status"${L(label)}><span class="tk-receipt-mark">${glyph(icon)}</span><div><h3 class="tk-receipt-title">${parts(title)}</h3>${meta ? `<p class="tk-receipt-meta">${parts(meta)}</p>` : ''}</div></div>`;
  }

  /* ---- TaskDay: farrowing's day card (Piglet processing · Care): a tinted header band (bold `Day 3`, a mono status right),
     then one row per item — the whole row is the door (a mark left: 'done' a check disc, 'due' an open ring, '' none; a
     12px/700 title; a 10px mono meta line); act: an optional trailing one-tap (Record 12), beside the door. No chevron.
     items: [{ title, meta, mark, action, value, label, act, id }]. ---- */
  let daySeq = 0;
  function day({ title, status, items = [], label } = {}) {
    const UI = root.SentriUI;
    const rows = items.map(i => {
      const mark = i.mark === 'done' ? `<span class="tk-day-mark" data-mark="done">${glyph('check')}</span>` : i.mark === 'due' ? '<span class="tk-day-mark" data-mark="due"></span>' : '';
      const rid = i.id || `tk-day-${++daySeq}`, tid = rid + '-title';
      const main = `<button type="button" class="tk-day-door"${A(i.action || 'open', i.value)}${L(i.label)}>${mark}<span class="tk-day-copy"><strong id="${esc(tid)}">${parts(i.title)}</strong>${i.meta ? `<small>${parts(i.meta)}</small>` : ''}</span></button>`;
      if (!i.act) return `<div class="tk-day-row"${i.mark === 'done' ? ' data-done=""' : ''}>${main}</div>`;
      const a = i.act, l = obj(a.label), aid = rid + '-act';
      const props = { label: l.text ?? '', register: a.register || 'secondary', action: a.action || 'act', value: a.value ?? i.value ?? '', waiting: !!a.waiting, busy: !!a.busy, id: aid, labelledby: `${aid} ${tid}` };
      if (l.str) { props.strs = { label: l.str }; if (l.args) props.args = { label: l.args }; }
      return `<div class="tk-day-row" data-act=""${i.mark === 'done' ? ' data-done=""' : ''}>${main}${UI.button(props)}</div>`;
    }).join('');
    return `<section class="tk-day" data-ds="TaskDay"${L(label ?? title)}><header class="tk-day-head"><strong>${parts(title)}</strong>${status ? `<span>${parts(status)}</span>` : ''}</header>${rows}</section>`;
  }

  /* ---- TaskHold binding: SentriUI.holdBind, with farrowing's caption — the caption (`HOLD TO END`) stays as it is through
     the hold (farrowing shows only the sweep); the cues still reach the hold's status line (statusId) when there is one.
     The unknown phase keeps the Button card's message. Same options and return as SentriUI.holdBind. ---- */
  function holdBind(scope, opts = {}) {
    const UI = root.SentriUI, sel = opts.selector || '.st-hold', idle = new WeakMap();
    const keep = b => { const c = b && b.querySelector('.st-hold-caption'); if (c && b.getAttribute('data-phase') === 'idle') idle.set(b, c.outerHTML); };
    scope.querySelectorAll(sel).forEach(keep);
    const early = e => { const b = e.target.closest && e.target.closest(sel); if (b) keep(b); };
    scope.addEventListener('pointerdown', early, true);
    scope.addEventListener('keydown', early, true);
    const onPhase = opts.onPhase;
    return UI.holdBind(scope, Object.assign({}, opts, { onPhase(b, phase, cue) {
      const c = b.querySelector('.st-hold-caption');
      if (phase !== 'unknown' && c && idle.has(b) && c.outerHTML !== idle.get(b)) c.outerHTML = idle.get(b);
      if (onPhase) onPhase(b, phase, cue);
    } }));
  }

  /* ---- TaskDoors: a list of doors. card: false (default) — flat door rows (SentriTask.door, no id column).
     card: true — farrowing's Pen page / sow-actions list: an optional section title with its icon, then the doors in one
     card, each with a 34px tinted icon tile, a title and one description line, a chevron (the design system's Row).
     items: [{ title, description, icon, action, value, label }] (text slots); title / icon: the section's. ---- */
  function doors({ card = false, title, icon = '', items = [], label } = {}) {
    if (!card) return `<div class="tk-doors" data-ds="TaskDoors"${L(label)}>${items.map(door).join('')}</div>`;
    const UI = root.SentriUI, u = v => obj(v == null ? '' : v);
    const st = (slot, key, out) => { const o = u(slot); if (o.str) { out.strs[key] = o.str; if (o.args) out.args[key] = o.args; } return o.text ?? ''; };
    const head = sectionHead(title, icon);
    const rows = items.map(i => { const r = { strs: {}, args: {} }; const t = st(i.title, 'title', r); const d = i.description != null ? st(i.description, 'description', r) : undefined;
      return UI.row(Object.assign({ title: t, icon: i.icon ? glyph(i.icon) : undefined, action: i.action || 'open', value: i.value || '', strs: r.strs, args: r.args }, d !== undefined ? { description: d } : {})); }).join('');
    return `<section class="tk-doors" data-ds="TaskDoors" data-card=""${L(label)}>${head}${UI.rowGroup(rows)}</section>`;
  }

  /* A section heading (SentriUI.heading, kind 'section') from text slots: title, meta and a glyph name. */
  function sectionHead(title, icon, meta) {
    if (!title) return '';
    const UI = root.SentriUI, h = { strs: {}, args: {} };
    const slot = (v, k) => { const o = obj(v); if (o.str) { h.strs[k] = o.str; if (o.args) h.args[k] = o.args; } return o.text ?? ''; };
    const t = slot(title, 'title'), m = meta ? slot(meta, 'meta') : undefined;
    return UI.heading(Object.assign({ title: t, icon: icon ? glyph(icon) : '', kind: 'section', level: 3, strs: h.strs, args: h.args }, m !== undefined ? { meta: m } : {}));
  }

  /* ---- TaskTable: farrowing's comparison table (Task overview · Choose a unit): a section heading, then one card —
     a column-heading line (9px, as farrowing) and one door row per place: its name (and a 9px subline), a mono figure per
     column, a green chevron. columns: [text slots]; rows: [{ name, sub, values: [text slots], action, value, label,
     current }]. ---- */
  function table({ title, icon = '', meta, nameColumn = '', columns = [], rows = [], label } = {}) {
    const n = columns.length;
    const cols = `<div class="tk-table-columns" aria-hidden="true"><span>${T(nameColumn)}</span>${columns.map(c => `<span>${T(c)}</span>`).join('')}<span></span></div>`;
    const body = rows.map(r => `<div role="listitem"><button type="button" class="tk-table-row"${A(r.action || 'open', r.value)}${L(r.label)}${r.current ? ' aria-current="true"' : ''}>
      <span class="tk-table-name"><strong>${T(r.name)}</strong>${r.sub ? `<small>${T(r.sub)}</small>` : ''}</span>${(r.values || []).map(v => `<span class="tk-table-figure">${T(v)}</span>`).join('')}${glyph('chevron')}</button></div>`).join('');
    return `<section class="tk-table" data-ds="TaskTable" style="--tk-cols:${n}"${L(label ?? title)}>${sectionHead(title, icon, meta)}<div class="tk-table-surface">${cols}<div role="list">${body}</div></div></section>`;
  }

  /* ---- TaskMetrics: farrowing's performance card (Task overview · Performance metrics): a section heading, then one
     card — two headline measures (label, a 28px mono figure with an optional unit, a subline; subTone 'amber' when below
     target), a rule, then small totals. measures: [{ label, value, unit, sub, subTone }]; totals: [{ label, value }]. ---- */
  function metrics({ title, icon = '', meta, measures = [], totals: tt = [], label } = {}) {
    const m = measures.map(x => `<div><span>${T(x.label)}</span><strong>${T(x.value)}${x.unit ? `<small>${T(x.unit)}</small>` : ''}</strong>${x.sub ? `<small${x.subTone ? ` data-tone="${esc(x.subTone)}"` : ''}>${T(x.sub)}</small>` : ''}</div>`).join('');
    const t = tt.length ? `<dl class="tk-metrics-totals">${tt.map(x => `<div><dt>${T(x.label)}</dt><dd>${T(x.value)}</dd></div>`).join('')}</dl>` : '';
    return `<section class="tk-metrics" data-ds="TaskMetrics"${L(label ?? title)}>${sectionHead(title, icon, meta)}<div class="tk-metrics-surface"><div class="tk-metrics-pair">${m}</div>${t}</div></section>`;
  }

  /* ---- TaskTotals: the few figures a sheet commits, at farrowing's Finish size (Born 14 · Alive 9 · Dead 5) ----
     items: [{ label, value }] (text slots); columns: 2 | 3 (default 3). */
  function totals(items = [], { columns = 3, label } = {}) {
    return `<dl class="st-panel tk-totals" data-ds="TaskTotals" data-columns="${columns === 2 ? 2 : 3}"${L(label)}>${items.map(i => `<div class="tk-total"><dt>${T(i.label)}</dt><dd>${T(i.value)}</dd></div>`).join('')}</dl>`;
  }

  /* ---- TaskDock ---- */
  /* unit: farrowing's labelled place control at the dock's start (B1 / Go to pen): { icon = 'grid', label, caption, action,
     value, aria } — the place in 13px/600 mono over a 9px caption, the icon left, no frame. */
  function dock({ primary, tools = [], unit } = {}) {
    const u = unit ? `<button type="button" class="tk-dock-unit"${A(unit.action || 'unit', unit.value)}${L(unit.aria)}>${glyph(unit.icon || 'grid')}<span><strong>${T(unit.label)}</strong>${unit.caption ? `<small>${T(unit.caption)}</small>` : ''}</span></button>` : '';
    const p = u + (primary ? `<button type="button" class="tk-dock-primary"${A(primary.action, primary.value)}>${primary.icon ? glyph(primary.icon) : ''}<span>${T(primary.label)}</span></button>` : '');
    const t = tools.map(x => `<button type="button" class="tk-dock-tool"${A(x.action, x.value)}${L(x.label)}>${glyph(x.icon)}</button>`).join('');
    return `<nav class="tk-dock" data-ds="TaskDock"${L(tools.label)}>${p}${t}</nav>`;
  }

  /* ---- Footer, Back, drawer, page, dialog: the Sheet card (SentriUI.sheet / sheetFooter / backButton) — one implementation.
     These keep the skeleton's call signatures; see Sheet/README.md. ---- */
  const back = o => root.SentriUI.backButton(o || {});
  const footer = o => root.SentriUI.sheetFooter(o || {});
  function scrim(o = {}) { return root.SentriUI.scrim(o); }
  /* sheet: the drawer without its scrim (the host places scrim() before it); drawer: scrim + sheet. height 'full' = Sheet's
     sizing 'full'. The ✕ is always drawn (close only renames its action); aside sits left of it. */
  function sheet(o = {}) { return root.SentriUI.sheet(Object.assign({}, o, { variant: 'drawer', sizing: o.height === 'full' ? 'full' : 'content', scrim: false })); }
  function drawer(o = {}) { return root.SentriUI.sheet(Object.assign({}, o, { variant: 'drawer', sizing: o.height === 'full' ? 'full' : 'content', scrim: Object.assign({ layer: o.layer || 0 }, o.scrim) })); }
  /* page: description -> subtitle; bar draws the skeleton's status bar. */
  function page(o = {}) {
    const { description, descriptionTone, bar = true, ...rest } = o;
    return root.SentriUI.sheet(Object.assign({}, rest, { variant: 'page', subtitle: description, subtitleTone: descriptionTone, bar: bar ? statusbar() : '' }));
  }
  function dialog(o = {}) { const { description, ...rest } = o; return root.SentriUI.sheet(Object.assign({}, rest, { variant: 'dialog', subtitle: description })); }

  /* ---- TaskChips (candidate): one row of filter chips over a task list — `All · Iron 4 · Castrate 6 · Done 3`. One is
     chosen at a time (a radio group: role=radiogroup, each chip role=radio with aria-checked and a roving tab stop; wire the
     arrow keys with SentriUI.radioBind). The row scrolls sideways; its end keeps a gutter so the last chip is never cut.
     items: [{ value, label, count, checked, aria }] (label and count are text slots; count is drawn in mono inside the
     chip). action: the one data-action for every chip. key: the group's data-field (radioBind's field). ---- */
  function chips({ items = [], action = 'chip', key = 'chips', label } = {}) {
    const on = items.some(i => i.checked) ? items.find(i => i.checked).value : (items[0] && items[0].value);
    const b = items.map(i => `<button type="button" class="tk-chips-chip" role="radio" aria-checked="${i.value === on ? 'true' : 'false'}" tabindex="${i.value === on ? 0 : -1}"${A(action, i.value)}${L(i.aria)}><span class="tk-chips-label">${T(i.label)}</span>${i.count != null && i.count !== '' ? `<span class="tk-chips-count">${T(i.count)}</span>` : ''}</button>`).join('');
    return `<div class="tk-chips" data-ds="TaskChips" data-field="${esc(key)}"><div class="tk-chips-track" role="radiogroup"${L(label)}>${b}</div></div>`;
  }

  const api = { T, statusbar, phone, screen, header, latest, summary, progress, lens, chips, list, group, row, door, doors, radios, warning, section, receipt, day, holdBind, table, metrics, stepper, photos, choice, totals, dock, back, footer, scrim, sheet, drawer, page, dialog, glyph };
  root.SentriTask = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
