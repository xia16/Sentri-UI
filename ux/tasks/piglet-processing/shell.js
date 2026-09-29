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
  // Plural: PP.tn('pp.common.unit.piglet', 3) picks '.one' when n is 1 (en only; zh has one form).
  PP.tn = function (base, n, args) {
    var a = Object.assign({ n: n }, args || {});
    return PP.t(base + (n === 1 && PP.lang === 'en' ? '.one' : '.many'), a);
  };
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
