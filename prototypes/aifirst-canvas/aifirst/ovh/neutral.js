(() => { const L = window.__l3, rm = L.rooms.find((r) => r.id === 'n1'), i = rm.pens.findIndex((q) => q.code === 'B7');
  const C = new L.T.Color('#c9cec1'); const go = () => { rm.im.setColorAt(i, C); rm.im.instanceColor.needsUpdate = true; Array.from(L.labels.values ? L.labels.values() : Object.values(L.labels)).filter((x) => x.kind === 'flag' || (x.kind === 'pen' && x.pen && x.pen.code === 'B7' && x.roomId === 'n1')).forEach((x) => { x.el.style.visibility = 'hidden'; }); L.dirty = true; };
  go(); setInterval(go, 50); return i; })()
