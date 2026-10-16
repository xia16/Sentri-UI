/* The defaults proof's base bundle: Measure and ChoiceList render from options, the way the real bundle's components do. */
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function measure({ label = '', value = '', unit = '', input = 'pad' } = {}) {
    return `<div class="x-measure" data-input="${esc(input)}" inputmode="numeric"><span>${esc(label)}</span><b>${esc(value || '—')} ${esc(unit)}</b><i class="x-measure-hint"></i></div>`;
  }
  function choices({ options = [], value = '' } = {}) {
    return `<div class="x-choice" role="radiogroup">${options.map((o) => `<div class="x-choice-opt${o === value ? ' is-on' : ''}" role="radio" aria-checked="${o === value}">${esc(o)}</div>`).join('')}</div>`;
  }
  window.SentriFix = { measure, choices };
})();
