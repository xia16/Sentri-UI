/* Bare screens: open any built prototype page with ?screen=<stable id> (ids are atlas/atlas.json's) and it shows only
   that screen: the phone's content at 390 x 844 in the page's top-left, no study chrome and no phone frame (the atlas
   draws the frame). Without the param this file does nothing, so the study page works as before.
   - Putting the page in the state: the screen's `preset` goes through the page's select.scenario; pages driven by their own
     URL params (Home, Piglet processing) already carry them in the screen's url.
   - Ready: parent.postMessage({ atlasReady: id }).
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

  function check() {
    if (!ready || !fn) return;
    var sid = null; try { sid = fn(AB.screens); } catch (e) { return; }
    if (sid === prev) return;
    prev = sid;
    if (sid) parent.postMessage({ atlasScreen: sid }, '*');
  }
  AB.watch = function (f) { fn = f; check(); };

  function start() {
    data.then(function (d) {
      findScreen(d);
      var sel = document.querySelector('select.scenario');
      var phone = (sel && sel.closest('.spec') && sel.closest('.spec').querySelector('.phone')) || document.querySelector('.phone, section.device, .tk-phone');
      if (!phone) { console.error('atlas-bare: no phone found'); return; }
      var preset = AB.screen && AB.screen.preset;
      if (preset && sel) {
        if (![].some.call(sel.options, function (o) { return o.value === preset; })) console.warn('atlas-bare: preset "' + preset + '" is not in the page');
        else if (sel.value !== preset) { sel.value = preset; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      if (!AB.screen) console.warn('atlas-bare: unknown screen ' + id);
      hideAround(phone);
      var fonts = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 250); })]) : Promise.resolve();
      fonts.then(function () { requestAnimationFrame(function () { requestAnimationFrame(function () {
        root.classList.add('atlas-ready'); ready = true;
        if (fn) { try { prev = fn(AB.screens); } catch (e) { prev = null; } }   // the state the screen opens in is not a change
        parent.postMessage({ atlasReady: id }, '*');
      }); }); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
