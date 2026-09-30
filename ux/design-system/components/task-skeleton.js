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
  const parts = v => (Array.isArray(v) ? v.map(p => { const o = obj(p); if (o.sep) return '<span class="tk-sep" data-str="ds.sep">·</span>'; return o.tone ? `<span class="tk-tone" data-tone="${esc(o.tone)}">${T(o)}</span>` : T(o); }).join('') : T(v));
  /* A Button from SentriUI (Button card), from a { label, action, value, register, waiting } spec. */
  function button(b) {
    if (!b) return '';
    if (typeof b === 'string') return b;
    const l = obj(b.label);
    const UI = root.SentriUI;
    const props = { label: l.text ?? '', register: b.register || 'primary', action: b.action || '', value: b.value || '', waiting: !!b.waiting, describedby: b.describedby || '' };
    if (l.str) { props.strs = { label: l.str }; if (l.args) props.args = { label: l.args }; }
    if (UI && UI.button) return UI.button(props);
    return `<button type="button" class="button ${esc(props.register)}" data-ds="Button"${A(props.action, props.value)}>${T(l)}</button>`;
  }
  /* A hold from SentriUI (Button holdButton): { label, caption, action, value, tone, phase, statusId }. */
  function hold(h) {
    const UI = root.SentriUI, l = obj(h.label), c = obj(h.caption);
    const props = { label: l.text ?? '', caption: c.text ?? '', action: h.action || 'hold', value: h.value || '', tone: h.tone || 'primary', phase: h.phase || 'idle', statusId: h.statusId || '', waiting: !!h.waiting, describedby: h.describedby || '' };
    const strs = {}, args = {};
    if (l.str) { strs.label = l.str; if (l.args) args.label = l.args; }
    if (c.str) { strs.caption = c.str; if (c.args) args.caption = c.args; }
    props.strs = strs; props.args = args;
    return UI.holdButton(props);
  }

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

  /* ---- TaskLens: tabs, the count under each label; the filter at the end ---- */
  function lens({ tabs = [], action = 'lens', filter } = {}) {
    const b = tabs.map(t => `<button type="button" class="tk-lens-tab" aria-pressed="${t.pressed ? 'true' : 'false'}"${A(action, t.value)}${L(t.label)}><span>${T(t.text)}</span><span class="tk-lens-count">${T(t.count)}</span></button>`).join('');
    const f = filter ? `<button type="button" class="tk-lens-filter"${A(filter.action || 'filter', filter.value)}${L(filter.label)}>${glyph('filter')}</button>` : '';
    return `<div class="tk-lens" data-ds="TaskLens"><div class="tk-lens-bar"><div class="tk-lens-tabs" role="group"${L(tabs.label)}>${b}</div>${f}</div></div>`;
  }

  /* ---- TaskGroup: a pen / crate-row card ---- */
  function list(groups) { return `<div class="tk-list">${Array.isArray(groups) ? groups.join('') : groups || ''}</div>`; }
  function group({ title, meta, door, rows = '' } = {}) {
    const inner = `<strong class="tk-group-title">${T(title)}</strong>${meta ? `<small class="tk-group-meta">${T(meta)}</small>` : ''}`;
    const head = door
      ? `<button type="button" class="tk-group-door"${A(door.action, door.value)}${L(door.label)}>${inner}${glyph('chevron')}</button>`
      : `<span class="tk-group-door">${inner}</span>`;
    return `<section class="tk-group" data-ds="TaskGroup"><header class="tk-group-head">${head}</header>${Array.isArray(rows) ? rows.join('') : rows}</section>`;
  }
  /* ---- TaskRow: id + chip | headline + meta | chevron, edit or tick ----
     trail 'tick' (with tick: { action = 'toggle', value, checked, label }): the row is a <label> around ChoiceList's multi
     trail, a checkbox (the selection of a bulk act); the whole row is the target. still: a row with no action (a <div>,
     e.g. one that holds its place after a record). data: { name: value } becomes data-name="value" on the row. */
  function row({ id, chip, headline, tone, meta, trail = 'chevron', action = 'open', value = '', label, tick, still = false, data } = {}) {
    const c = chip ? `<span class="tk-chip"${chip.tone ? ` data-tone="${esc(chip.tone)}"` : ''}>${T(chip)}</span>` : '';
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

  /* ---- TaskTotals: the few figures a sheet commits, at farrowing's Finish size (Born 14 · Alive 9 · Dead 5) ----
     items: [{ label, value }] (text slots); columns: 2 | 3 (default 3). */
  function totals(items = [], { columns = 3, label } = {}) {
    return `<dl class="st-panel tk-totals" data-ds="TaskTotals" data-columns="${columns === 2 ? 2 : 3}"${L(label)}>${items.map(i => `<div class="tk-total"><dt>${T(i.label)}</dt><dd>${T(i.value)}</dd></div>`).join('')}</dl>`;
  }

  /* ---- TaskDock ---- */
  function dock({ primary, tools = [] } = {}) {
    const p = primary ? `<button type="button" class="tk-dock-primary"${A(primary.action, primary.value)}>${primary.icon ? glyph(primary.icon) : ''}<span>${T(primary.label)}</span></button>` : '';
    const t = tools.map(x => `<button type="button" class="tk-dock-tool"${A(x.action, x.value)}${L(x.label)}>${glyph(x.icon)}</button>`).join('');
    return `<nav class="tk-dock" data-ds="TaskDock"${L(tools.label)}>${p}${t}</nav>`;
  }

  /* ---- Footer: Back + one primary (a Button spec, a hold spec, or raw HTML) ---- */
  function back({ action = 'back', value = '', label = { text: 'Back', str: 'act.back' } } = {}) {
    return `<button type="button" class="tk-back"${A(action, value)}>${glyph('back-chevron')}<span>${T(label)}</span></button>`;
  }
  function footer({ back: b = {}, primary, hold: h } = {}) {
    return `<div class="tk-footer" data-ds="TaskFooter">${b ? back(b) : ''}${h ? hold(h) : button(primary)}</div>`;
  }

  /* ---- TaskSheet: the drawer ---- */
  function scrim({ action = 'dismiss', label = { text: 'Dismiss sheet', str: 'tk.sheet.dismiss' } } = {}) {
    return `<button type="button" class="tk-scrim" data-ds="TaskSheet"${A(action)}${L(label)}></button>`;
  }
  /* size: compact | short | medium | long (the max height). height: 'content' (default) | 'full'.
     close: { action, label } draws the ✕; aside: raw HTML in its place (a text action such as Clear). */
  function sheet({ title, subtitle, close = { action: 'dismiss' }, aside = '', body = '', footer: f = '', size = 'medium', height = 'content', label, view = '' } = {}) {
    const x = aside || (close ? `<button type="button" class="tk-sheet-close"${A(close.action || 'dismiss', close.value)}${L(close.label, { text: 'Close', str: 'act.close' })}>${glyph('close')}</button>` : '');
    const sub = subtitle ? `<p class="tk-sheet-subtitle">${parts(subtitle)}</p>` : '';
    return `<section class="tk-sheet" data-ds="TaskSheet" role="dialog" aria-modal="true" tabindex="-1" data-st-context="drawer" data-size="${esc(size)}"${height === 'full' ? ' data-height="full"' : ''}${view ? ` data-view="${esc(view)}"` : ''}${L(label ?? title)}>
      <div class="tk-grab" aria-hidden="true"></div>
      <header class="tk-sheet-head"><div class="tk-sheet-titles"><h2 class="tk-sheet-title">${T(title)}</h2>${sub}</div>${x}</header>
      <div class="tk-sheet-body">${body}</div>${f}</section>`;
  }
  function drawer(o = {}) { return scrim(o.scrim) + sheet(o); }

  /* ---- TaskPage: the record page ----
     aside: raw HTML at the right end of the title line (text actions such as Clear), as a sheet's aside.
     inert: while a drawer or dialog is over the page. */
  function page({ title, description, body = '', footer: f = '', label, bar = true, aside = '', inert = false } = {}) {
    const t = `<h2 class="tk-page-title">${T(title)}</h2>`;
    return `<section class="tk-page" data-ds="TaskPage" role="region" tabindex="-1" data-st-context="page"${inert ? ' inert' : ''}${L(label ?? title)}>${bar ? statusbar() : ''}
      <header class="tk-page-head"${aside ? ' data-aside' : ''}>${aside ? `<div class="tk-page-titleline">${t}<div class="tk-page-aside">${aside}</div></div>` : t}${description ? `<p class="tk-page-desc">${parts(description)}</p>` : ''}</header>
      <div class="tk-page-body">${body}</div>${f || footer({})}</section>`;
  }

  /* ---- TaskDialog ---- */
  function dialog({ title, icon = '', description, body = '', footer: f = '', label } = {}) {
    return `<div class="tk-dialog-backdrop" data-ds="TaskDialog"><div class="tk-dialog" role="dialog" aria-modal="true"${L(label ?? title)}>
      <div class="tk-dialog-body"><h2 class="tk-dialog-title">${icon ? glyph(icon) : ''}${T(title)}</h2>${description ? `<p class="tk-dialog-desc">${parts(description)}</p>` : ''}${body}</div>${f}</div></div>`;
  }

  const api = { T, statusbar, phone, screen, header, latest, summary, lens, list, group, row, totals, dock, back, footer, scrim, sheet, drawer, page, dialog, glyph };
  root.SentriTask = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
