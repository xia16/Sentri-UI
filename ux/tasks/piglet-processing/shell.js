/* Piglet processing shell: ?state= and ?lang=, the string registry, [data-str] fill. */
(function () {
  var q = new URLSearchParams(location.search);
  var PP = (window.PP = { state: q.get('state') || '', lang: q.get('lang') === 'zh' ? 'zh' : 'en', strings: {}, ready: null });

  function fill(text, args) {
    return String(text).replace(/\{(\w+)\}/g, function (m, k) { return args && args[k] != null ? args[k] : m; });
  }
  PP.t = function (id, args) {
    var e = PP.strings[id];
    if (!e) return id;
    return fill(e[PP.lang] || e.en || id, args);
  };
  PP.apply = function (root) {
    (root || document).querySelectorAll('[data-str]').forEach(function (el) {
      var args = null;
      try { args = el.dataset.args ? JSON.parse(el.dataset.args) : null; } catch (err) { args = null; }
      el.textContent = PP.t(el.dataset.str, args);
    });
  };

  document.documentElement.lang = PP.lang === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.setAttribute('data-state', PP.state);
  PP.ready = fetch('/ux/laws/strings.json')
    .then(function (r) { return r.json(); })
    .then(function (reg) {
      PP.strings = reg.strings || {};
      PP.apply();
      document.documentElement.setAttribute('data-ready', '');
      return PP;
    });
})();
