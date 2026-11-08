(() => { const L = window.__l3, rm = L.rooms.find((r) => r.id === 'n1'), T = L.T, out = [], m = new T.Matrix4(), v = new T.Vector3();
  const pen = rm.pens.find((p) => p.code === 'B7'); rm.g.updateMatrixWorld(true);
  const c = L.renderer.domElement.getBoundingClientRect();
  const inPen = (lp) => Math.abs(lp.x - pen.x) < pen.sx / 2 + 0.1 && Math.abs(lp.z - pen.z) < pen.sz / 2 + 0.1;
  const inv = new T.Matrix4().copy(rm.g.matrixWorld).invert();
  rm.pg.traverse((o) => { if (!o.isInstancedMesh) return; for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); v.setFromMatrixPosition(m).applyMatrix4(o.matrixWorld); const lp = v.clone().applyMatrix4(inv); if (!inPen(lp)) continue; const q = v.clone().project(L.camera); out.push([o.name || o.uuid.slice(0, 4), Math.round((q.x + 1) / 2 * c.width), Math.round((1 - q.y) / 2 * c.height)]); } });
  return JSON.stringify({ pen: [pen.x, pen.z, pen.sz], n: out.length, pts: out.slice(0, 60) }); })()
