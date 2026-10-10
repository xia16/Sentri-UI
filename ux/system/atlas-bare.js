/* Bare screens: open any built prototype page with ?screen=<stable id> (ids are atlas/atlas.json's) and it shows only
   that screen: the phone's content at 390 x 844 in the page's top-left, no study chrome and no phone frame (the atlas
   draws the frame). Without the param this file does nothing, so the study page works as before.
   - Putting the page in the state: the screen's `preset` goes through the page's select.scenario; pages driven by their own
     URL params (Home, Piglet processing) already carry them in the screen's url.
   - Static decks (ux/archive/workflows.html and the other archive decks): the screen's url carries `?sec=<section>&slide=<n>`;
     <section> is a section id (wf-fault) or the start of its heading (03, 04b), and slide is the n-th phone in it (1-based, default 1).
   - Ready: parent.postMessage({ atlasReady: id }).
   - Screens only a tap reaches: the screen's `steps` (ordered; each a string or { tap, hold }) are replayed after the preset.
     A step is visible text, an aria-label / title, or a CSS selector (starts with [ . #), matched inside the phone,
     then inside its same-origin iframes (so a host screen can reach an embedded page's controls, e.g. farrowing's Actions →
     Remove from batch inside the embedded inspection).
   - The flow follows the demo: a page calls AtlasBare.watch(fn) after every render, fn() returns the screen id of the
     state it is in (or null); when that changes, parent.postMessage({ atlasScreen: id }).
   One convention for every prototype: new pages include this script in <head> and call AtlasBare.watch where they can.
   Entry markers live in the pages' own markup: data-entry="<feature id>" (space-separated for several) on a control that
   is a way into that feature; the atlas outlines it. */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search), id = q.get('screen');
  var AB = window.AtlasBare = { id: id || null, screen: null, screens: [], bare: !!id, watch: function () {} };
  if (!id) return;

  var root = document.documentElement, ready = false, fn = null, prev = null;
  root.classList.add('atlas-bare');
  var css = document.createElement('style');
  css.textContent =
    'html.atlas-bare,html.atlas-bare body{margin:0!important;padding:0!important;width:390px!important;height:844px!important;overflow:hidden!important;background:#fff!important}' +
    'html.atlas-bare:not(.atlas-ready) body{opacity:0}' +
    'html.atlas-bare [data-atlas-hide]{display:none!important}' +
    'html.atlas-bare .atlas-path{display:block!important;position:static!important;margin:0!important;padding:0!important;border:0!important;width:auto!important;height:auto!important;min-height:0!important;max-width:none!important;' +
    'overflow:visible!important;transform:none!important;filter:none!important;background:none!important;box-shadow:none!important;border-radius:0!important;contain:none!important;opacity:1!important}' +
    'html.atlas-bare .atlas-phone{position:fixed!important;left:0!important;top:0!important;right:auto!important;bottom:auto!important;width:390px!important;height:844px!important;min-width:0!important;max-width:none!important;min-height:0!important;max-height:none!important;' +
    'margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;outline:0!important;transform:none!important;overflow:hidden!important;z-index:1}' +
    'html.atlas-bare *,html.atlas-bare *::before,html.atlas-bare *::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent}' +
    'html.atlas-bare *,html.atlas-bare *::before,html.atlas-bare *::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent}' +
    'html.atlas-bare .atlas-phone::before,html.atlas-bare .atlas-phone::after{box-shadow:none!important}';
  document.head.appendChild(css);

  /* the atlas data starts loading at once */
  var here = document.currentScript && document.currentScript.src;
  var dataUrl = here ? new URL('../../atlas/atlas.json', here).href : '/atlas/atlas.json';
  var data = fetch(dataUrl).then(function (r) { return r.json(); }).catch(function () { return null; });

  function findScreen(d) {
    var found = null, path = location.pathname;
    if (!d) return;
    d.platforms.forEach(function (p) { p.sections.forEach(function (s) { s.features.forEach(function (f) { f.screens.forEach(function (c) {
      if (c.id === id) found = c;
      if (c.url && c.url.split('?')[0] === path) AB.screens.push(c);
    }); }); }); });
    AB.screen = found;
  }

  function hideAround(phone) {
    for (var el = phone; el && el !== document.body; el = el.parentElement) {
      var par = el.parentElement; if (!par) break;
      Array.prototype.forEach.call(par.children, function (sib) {
        if (sib !== el && !/^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(sib.tagName)) sib.setAttribute('data-atlas-hide', '');
      });
      if (par !== document.body) par.classList.add('atlas-path');
    }
    phone.classList.add('atlas-phone');
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function frames() { return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); }
  function shown(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }
  function norm(t) { return (t || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
  var TAPPABLE = 'button,a,[data-action],[role=button],label,summary,[tabindex]';
  function findStep(phone, key) {
    var k = String(key), want = norm(k), el, list, i;
    if (/^[\[.#]/.test(k)) { list = phone.querySelectorAll(k); for (i = 0; i < list.length; i++) if (shown(list[i])) return list[i]; return null; }
    var all = Array.prototype.filter.call(phone.querySelectorAll('*'), shown), best = null;
    for (i = 0; i < all.length; i++) {   // smallest visible element whose text is the step, then its nearest control
      el = all[i];
      if (norm(el.textContent) === want && (!best || best.contains(el))) best = el;
    }
    if (best) return best.closest(TAPPABLE) && phone.contains(best.closest(TAPPABLE)) ? best.closest(TAPPABLE) : best;
    for (i = 0; i < all.length; i++) {   // a control whose text begins with the step (its other words are a hint line)
      el = all[i];
      if (el.matches(TAPPABLE) && norm(el.textContent).indexOf(want) === 0 && (!best || best.contains(el))) best = el;
    }
    if (best) return best;
    for (i = 0; i < all.length; i++) if (norm(all[i].getAttribute('aria-label')) === want || norm(all[i].getAttribute('title')) === want) return all[i];
    return null;
  }
  function findDeep(phone, key) {   // in the phone, else inside its same-origin iframes (farrowing embeds inspection's sow sheet that way)
    var el = findStep(phone, key); if (el) return el;
    var fr = phone.querySelectorAll('iframe');
    for (var i = 0; i < fr.length; i++) {
      var d; try { d = fr[i].contentDocument; } catch (e) { d = null; }
      if (d && d.body && (el = findStep(d.body, key))) return el;
    }
    return null;
  }
  function findWait(phone, key) {   // an iframe may still be loading: look for up to 2 s
    var t0 = Date.now();
    return new Promise(function (res) { (function poll() { var el = findDeep(phone, key); if (el || Date.now() - t0 > 2000) res(el); else setTimeout(poll, 100); })(); });
  }
  function replay(phone, steps) {
    var chain = Promise.resolve();
    steps.forEach(function (st) {
      chain = chain.then(function () {
        var key = typeof st === 'string' ? st : st.tap, hold = typeof st === 'object' && st.hold;
        var el = findStep(phone, key);
        if (!el) { console.error('atlas-bare: step not found: ' + key); return; }
        if (hold) {
          var o = { bubbles: true, cancelable: true, button: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true };
          var PE = el.ownerDocument.defaultView.PointerEvent;
          el.dispatchEvent(new PE('pointerdown', o));
          return wait(hold).then(function () { el.dispatchEvent(new PointerEvent('pointerup', o)); });
        }
        el.click();
      }).then(frames).then(function () { return wait(60); });
    });
    return chain;
  }

  function check() {
    if (!ready || !fn) return;
    var sid = null; try { sid = fn(AB.screens); } catch (e) { return; }
    if (sid === prev) return;
    prev = sid;
    if (sid) parent.postMessage({ atlasScreen: sid }, '*');
  }
  AB.watch = function (f) { fn = f; check(); };
  AB.current = function () { try { return fn ? fn(AB.screens) : null; } catch (e) { return null; } };   // the screen the page is on now (for checks)

  function deckPhone() {   // a phone of a static deck: ?sec=<section id or heading start>&slide=<n>
    var key = q.get('sec'); if (!key) return null;
    var sec = document.getElementById(key);
    if (!sec) Array.prototype.some.call(document.querySelectorAll('section'), function (s) {
      var h = s.querySelector('h2'); if (h && h.textContent.trim().toLowerCase().indexOf(key.toLowerCase() + ' ') === 0) { sec = s; return true; }
    });
    var n = parseInt(q.get('slide') || '1', 10) || 1, list = sec ? sec.querySelectorAll('.phone') : [];
    if (!list[n - 1]) console.error('atlas-bare: no phone ' + n + ' in section "' + key + '"');
    return list[n - 1] || null;
  }

  function start() {
    data.then(function (d) {
      findScreen(d);
      var sel = document.querySelector('select.scenario');
      var phone = deckPhone() || (sel && sel.closest('.spec') && sel.closest('.spec').querySelector('.phone')) || document.querySelector('.phone, section.device, .tk-phone');
      if (!phone) { console.error('atlas-bare: no phone found'); return; }
      var preset = AB.screen && AB.screen.preset;
      if (preset && sel) {
        if (![].some.call(sel.options, function (o) { return o.value === preset; })) console.warn('atlas-bare: preset "' + preset + '" is not in the page');
        else if (sel.value !== preset) { sel.value = preset; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      if (!AB.screen) console.warn('atlas-bare: unknown screen ' + id);
      var steps = (AB.screen && AB.screen.steps) || [];
      (steps.length ? frames().then(function () { return replay(phone, steps); }) : Promise.resolve()).then(function () {
      hideAround(phone);
      var fonts = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 250); })]) : Promise.resolve();
      fonts.then(function () { requestAnimationFrame(function () { requestAnimationFrame(function () {
        root.classList.add('atlas-ready'); ready = true;
        if (fn) { try { prev = fn(AB.screens); } catch (e) { prev = null; } }   // the state the screen opens in is not a change
        parent.postMessage({ atlasReady: id }, '*');
      }); }); });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
