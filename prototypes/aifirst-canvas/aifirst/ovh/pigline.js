(() => { const L = window.__l3, T = L.T, rm = L.rooms.find((r) => r.id === 'n1'); rm.g.updateMatrixWorld(true);
  const meshes = []; rm.pg.traverse((o) => { if (o.isInstancedMesh) meshes.push(o); });
  const room = rm.g.matrixWorld.clone(), roomInv = room.clone().invert();
  const A = [0, 4, 8], B = [1, 5, 9], C = [2, 6, 10];
  const pig = (ms, i, sh) => ({ ms: ms, i: i, sh: sh });
  const P = { fever: pig(A, 91, 91), thin: pig(B, 107, 260), id1: pig(A, 90, 90), id2: pig(A, 92, 92), id3: pig(C, 48, 375), n1: pig(B, 108, 261), n2: pig(B, 109, 262), n3: pig(B, 110, 263), n4: pig(B, 111, 264) };
  const rows = [[1.42, ['fever', 'thin']], [2.02, ['id1', 'id2', 'id3']], [2.62, ['n1', 'n2', 'n3', 'n4']]], gap = 0.31, zc = 9.25;
  const m = new T.Matrix4(), v = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3(), out = {};
  const toRoom = (o, i) => { o.getMatrixAt(i, m); return m.clone().premultiply(o.matrixWorld).premultiply(roomInv); };
  const put = (o, i, R) => { const W = R.clone().premultiply(room); const Mi = W.premultiply(o.matrixWorld.clone().invert()); o.setMatrixAt(i, Mi); o.instanceMatrix.needsUpdate = true; };
  rows.forEach((r) => { const n = r[1].length; r[1].forEach((k, j) => {
    const p = P[k], body = meshes[p.ms[0]], R0 = toRoom(body, p.i); R0.decompose(v, q, s); const old = v.clone(), yaw0 = new T.Euler().setFromQuaternion(q, 'YXZ').y;
    const nz = zc + (j - (n - 1) / 2) * gap, to = new T.Vector3(r[0], old.y, nz);
    const D = new T.Matrix4().makeTranslation(to.x, 0, to.z).multiply(new T.Matrix4().makeRotationY(Math.PI - yaw0)).multiply(new T.Matrix4().makeTranslation(-old.x, 0, -old.z));
    p.ms.forEach((mi) => { const o = meshes[mi]; put(o, p.i, toRoom(o, p.i).premultiply(D)); });
    { const o = meshes[12]; put(o, p.sh, toRoom(o, p.sh).premultiply(D)); }
    const w = to.clone().applyMatrix4(room).project(L.camera), c = L.renderer.domElement.getBoundingClientRect();
    out[k] = [Math.round((w.x + 1) / 2 * c.width), Math.round((1 - w.y) / 2 * c.height)];
  }); });
  L.dirty = true; return JSON.stringify(out); })()
