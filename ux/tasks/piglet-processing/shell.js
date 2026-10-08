/* Piglet processing shell: ?state=, ?data= and ?lang=, the string registry, [data-str] fill, and the
   shared ledger + fixture (ledger.js and fixtures.js load as modules in each page's head).
   PP.ready resolves once the registry is in and the modules have run; PP.open(variant) opens the
   fixture's store (its log, the derived ledger, commit through append). */
(function () {
  var q = new URLSearchParams(location.search);
  var PP = (window.PP = { state: q.get('state') || '', data: q.get('data') || '', lang: q.get('lang') === 'zh' ? 'zh' : 'en', strings: {}, ready: null, q: q });

  function fill(text, args) {
    return String(text).replace(/\{(\w+)\}/g, function (m, k) { return args && args[k] != null ? args[k] : m; });
  }
  PP.t = function (id, args) {
    var e = PP.strings[id];
    if (!e) return id;
    return fill(e[PP.lang] || e.en || id, args);
  };
  // Plural: PP.tn('pp.common.unit.piglet', 3) picks '.one' when n is 1 (en only; zh has one form).
  PP.tn = function (base, n, args) {
    var a = Object.assign({ n: n }, args || {});
    return PP.t(base + (n === 1 && PP.lang === 'en' ? '.one' : '.many'), a);
  };
  PP.one = function (base, n) { return base + (n === 1 && PP.lang === 'en' ? '.one' : '.many'); };
  PP.apply = function (root) {
    (root || document).querySelectorAll('[data-str]').forEach(function (el) {
      var args = null;
      try { args = el.dataset.args ? JSON.parse(el.dataset.args) : null; } catch (err) { args = null; }
      el.textContent = PP.t(el.dataset.str, args);
    });
    // data-str-attr="aria-label:id;placeholder:id" fills attributes the same way; data-args applies to all.
    (root || document).querySelectorAll('[data-str-attr]').forEach(function (el) {
      var args = null;
      try { args = el.dataset.args ? JSON.parse(el.dataset.args) : null; } catch (err) { args = null; }
      el.dataset.strAttr.split(';').forEach(function (pair) {
        var i = pair.indexOf(':');
        if (i > 0) el.setAttribute(pair.slice(0, i).trim(), PP.t(pair.slice(i + 1).trim(), args));
      });
    });
  };
  /* A link to another page of the task, carrying the language. */
  PP.href = function (page, params) {
    var p = new URLSearchParams();
    Object.keys(params || {}).forEach(function (k) { if (params[k] != null && params[k] !== '') p.set(k, params[k]); });
    if (PP.lang === 'zh') p.set('lang', 'zh');
    var s = p.toString();
    return page + (s ? '?' + s : '');
  };
  /* The fixture store for a variant (`?data=` wins over the page's own choice when it names one). */
  PP.open = function (variant, opts) {
    var F = window.PPFixtures;
    var name = PP.data && F.VARIANTS[PP.data] ? PP.data : variant;
    return F.open(name, Object.assign({ fresh: q.get('fresh') === '1' }, opts || {}));
  };

  /* R1-24: the phone's (or browser's) Back with a drawer open closes the drawer — the page's own Back, so the draft is
     kept for Resume — and never leaves the page. A page calls PP.drawerBack(onBack) when a drawer opens (one history
     entry is pushed for it) and PP.drawerBack(null) when it closes the drawer itself (the entry is taken back). */
  var drawerEntry = null, skipPop = 0;
  PP.drawerBack = function (onBack) {
    if (onBack) {
      if (!drawerEntry) { try { history.pushState({ ppDrawer: true }, ''); } catch (e) { return; } }
      drawerEntry = { onBack: onBack };
      return;
    }
    if (!drawerEntry) return;
    drawerEntry = null;
    if (history.state && history.state.ppDrawer) { skipPop++; history.back(); }
  };
  window.addEventListener('popstate', function () {
    if (skipPop) { skipPop--; return; }
    if (!drawerEntry) return;
    var f = drawerEntry.onBack;
    drawerEntry = null;
    f();
  });

  document.documentElement.lang = PP.lang === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.setAttribute('data-state', PP.state);
  // Module scripts (ledger.js, fixtures.js) run before DOMContentLoaded.
  var modules = new Promise(function (resolve) {
    if (document.readyState !== 'loading') resolve(); else document.addEventListener('DOMContentLoaded', resolve);
  });
  PP.ready = Promise.all([fetch('/ux/laws/strings.json').then(function (r) { return r.json(); }), modules])
    .then(function (res) {
      PP.strings = res[0].strings || {};
      PP.apply();
      document.documentElement.setAttribute('data-ready', '');
      return PP;
    });
})();
