(() => { const L = window.__l3, rm = L.rooms.find((r) => r.id === 'n1'), T = L.T, p = rm.pens.find((q) => q.code === 'B7'); rm.g.updateMatrixWorld(true);
  const th = (rm.r.rot || 0) * Math.PI / 180, bx = new T.Box3(), m = 0.35, YF = L.Y.YF;
  [[-1, -1], [1, 1], [-1, 1], [1, -1]].forEach((q) => bx.expandByPoint(L.wpos(rm, p.x + q[0] * (p.sx / 2 + m), YF, p.z + q[1] * (p.sz / 2 + m)).clone()));
  const pr = L.fitCam(bx, 1.22 + th, 1.15, L.insets(L.ui())); L.tweenTo(pr, 10); return 1; })()
