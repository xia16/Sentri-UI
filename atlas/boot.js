/* Start: load atlas.json (generated), fall back to fixture.json, then draw where the URL says. */
'use strict';
(async function () {
  const read = async (u) => { const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw new Error(u); return r.json(); };
  try { S.data = await read('atlas.json'); } catch (_) {
    try { S.data = await read('fixture.json'); } catch (e) { document.getElementById('main').innerHTML = '<div class="empty"><b>No atlas data</b><span>atlas.json and fixture.json are both missing.</span></div>'; return; }
  }
  document.getElementById('brand').title = `Generated ${S.data.generated || ''}${S.data.commit ? ' · ' + S.data.commit : ''}`;
  const v = q.get('view'); S.view = VIEWS.some(([id]) => id === v) ? v : 'atlas';
  S.platformId = (S.data.platforms.find((p) => p.id === q.get('platform')) || S.data.platforms[0]).id;
  render();
  if (S.view === 'atlas' && q.get('feature')) openFeature(q.get('feature'), q.get('screen'));
})();
