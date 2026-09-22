/* Navigation between the Home prototype and the existing detail studies. */
(() => {
  const query = new URLSearchParams(location.search);
  if (query.get('from') !== 'home' || window.parent !== window) return;
  const home = new URL('home-astra-prototype.html', location.href);
  const section = query.get('section');
  if (['breeding', 'gestation', 'farrowing', 'nursery'].includes(section)) home.searchParams.set('section', section);
  const returnUnit = query.get('returnUnit');
  home.searchParams.set('view', returnUnit ? 'unit' : 'overview');
  if (/^\d+$/.test(returnUnit || '')) home.searchParams.set('unit', returnUnit);
  const unit = /^\d+$/.test(query.get('unit') || '') ? query.get('unit') : null;
  window.SentriHomeLink = {
    unit,
    entry: query.get('entry'),
    back: () => location.assign(home.href)
  };
  document.documentElement.classList.add('from-home');
  document.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action !== 'home' && action !== 'room-home') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.SentriHomeLink.back();
  }, true);
})();
