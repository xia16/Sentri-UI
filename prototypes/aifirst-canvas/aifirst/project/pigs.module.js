// pigs.module.js: believable low-poly pigs for the Sentri 3D barn view.
// ES module, loaded with dynamic import('./pigs.module.js'). Everything is built from a THREE passed in.
//   const kit = pigKit(THREE);
//   const field = kit.field();                       // one InstancedMesh per variety, per detail level
//   field.add('sow-stand', { x, y, z, yaw, s, sx, sz, tone });
//   const g = field.build();                         // { hi, lo, base } groups (base = soft shadows, lamp glow)
// Metres, +x is the way a pig faces, +y up. Sows are 180 cm, finishers 120 cm, weaners 65 cm, piglets 34 cm.

export function makeRng(seed) {
  let a = seed >>> 0;
  const f = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.n = (lo, hi) => lo + (hi - lo) * f();
  f.i = (lo, hi) => Math.floor(lo + (hi - lo + 1) * f());
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  f.chance = (p) => f() < p;
  f.sgn = () => (f() < 0.5 ? -1 : 1);
  return f;
}

export const CLASSES = { sow: 1.8, finisher: 1.2, weaner: 0.65, piglet: 0.34 };
// How big every pig is drawn, against the 1.8 m sow above: one scale for every variety. Pen and rail sizes stay real, so the pen reads around each animal.
export const PIG_SCALE = 0.7;

// the varieties, in the order of the pig sheet
export const VARIETIES = [
  { key: 'sow-stand', name: 'Sow, standing', cm: 180 },
  { key: 'sow-sternal', name: 'Sow, lying on her belly', cm: 180 },
  { key: 'sow-side', name: 'Sow, lying on her side', cm: 180 },
  { key: 'piglet-suckle', name: 'Piglets, suckling', cm: 34, group: true },
  { key: 'piglet-sternal', name: 'Piglets, sleeping', cm: 34, group: true },
  { key: 'weaner-stand', name: 'Weaner, standing', cm: 65 },
  { key: 'weaner-sternal', name: 'Weaners, lying in a huddle', cm: 65, group: true },
  { key: 'finisher-stand', name: 'Finisher, standing', cm: 120 },
  { key: 'finisher-sternal', name: 'Finisher, lying', cm: 120 }
];

const COL = { skin: '#EED0C6', belly: '#F1D6CD', ear: '#E5B3AA', snout: '#E5ADA6', hoof: '#CDBFB8', eye: '#2A2523', teat: '#E6B2AB' };

// ---- geometry helpers ----------------------------------------------------------------------
function accum(T) {
  const P = [], N = [], C = [];
  const v = new T.Vector3();
  return {
    add(geo, m, color) {
      const g = geo.index ? geo.toNonIndexed() : geo.clone();
      g.applyMatrix4(m);
      const p = g.attributes.position.array, n = g.attributes.normal.array;
      const c = new T.Color(color);
      for (let i = 0; i < p.length; i += 3) { P.push(p[i], p[i + 1], p[i + 2]); v.set(n[i], n[i + 1], n[i + 2]).normalize(); N.push(v.x, v.y, v.z); C.push(c.r, c.g, c.b); }
      g.dispose();
    },
    finish(ground) {
      let minY = 0;
      if (ground) { minY = 1e9; for (let i = 1; i < P.length; i += 3) minY = Math.min(minY, P[i]); }
      const col = new Float32Array(C.length);
      for (let i = 0; i < P.length; i += 3) {
        P[i + 1] -= minY;
        const ny = N[i + 1], y = P[i + 1];
        const down = Math.max(0, Math.min(1, ny * 0.5 + 0.5));
        const ao = (0.8 + 0.2 * down) * (0.86 + 0.14 * Math.max(0, Math.min(1, y / 0.14)));
        col[i] = C[i] * ao; col[i + 1] = C[i + 1] * ao; col[i + 2] = C[i + 2] * ao;
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(P, 3));
      g.setAttribute('normal', new T.Float32BufferAttribute(N, 3));
      g.setAttribute('color', new T.BufferAttribute(col, 3));
      g.computeBoundingSphere();
      return g;
    }
  };
}

// a smooth body of revolution-ish shape: stations [x, centreY, radiusY, radiusZ], Catmull-Rom between them
function loft(T, st, nA, nR) {
  const N = st.length;
  const cr = (p0, p1, p2, p3, t) => 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  const g = (k) => st[Math.max(0, Math.min(N - 1, k))];
  const rows = [];
  for (let a = 0; a <= nA; a++) {
    const u = a / nA * (N - 1), i = Math.min(N - 2, Math.floor(u)), t = u - i;
    const r = [0, 1, 2, 3].map((c) => cr(g(i - 1)[c], g(i)[c], g(i + 1)[c], g(i + 2)[c], t));
    r[2] = Math.max(0.012, r[2]); r[3] = Math.max(0.012, r[3]);
    rows.push(r);
  }
  const pos = [], idx = [];
  rows.forEach((r) => { for (let j = 0; j < nR; j++) { const an = j / nR * Math.PI * 2; pos.push(r[0], r[1] + r[2] * Math.sin(an), r[3] * Math.cos(an)); } });
  for (let a = 0; a < nA; a++) for (let j = 0; j < nR; j++) {
    const j2 = (j + 1) % nR, p = a * nR, q = (a + 1) * nR;
    idx.push(p + j, q + j, q + j2, p + j, q + j2, p + j2);
  }
  const f0 = pos.length / 3; pos.push(rows[0][0] - 0.02, rows[0][1], 0);
  const f1 = pos.length / 3; pos.push(rows[nA][0] + 0.02, rows[nA][1], 0);
  for (let j = 0; j < nR; j++) { const j2 = (j + 1) % nR; idx.push(f0, j2, j); idx.push(f1, nA * nR + j, nA * nR + j2); }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

const BASE = [
  [-0.90, 0.56, 0.05, 0.05],
  [-0.86, 0.58, 0.17, 0.15],
  [-0.76, 0.61, 0.31, 0.235],
  [-0.58, 0.62, 0.38, 0.285],
  [-0.28, 0.60, 0.375, 0.27],
  [0.06, 0.585, 0.385, 0.275],
  [0.34, 0.58, 0.385, 0.27],
  [0.50, 0.56, 0.34, 0.245],
  [0.62, 0.52, 0.27, 0.205],
  [0.72, 0.485, 0.245, 0.19],
  [0.85, 0.44, 0.185, 0.145],
  [0.96, 0.405, 0.13, 0.10],
  [1.05, 0.385, 0.095, 0.078],
  [1.12, 0.38, 0.075, 0.068],
  [1.15, 0.378, 0.03, 0.03]
];
const LM = 2.04;
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function stationsFor(spec) {
  const kid = spec.kid || 0;
  return BASE.map((s) => {
    let [x, cy, ry, rz] = s;
    const head = sm(0.5, 0.7, x);
    ry *= (1 + 0.28 * head * kid) * (1 - 0.1 * kid); rz *= (1 + 0.3 * head * kid) * (1 - 0.04 * kid);
    cy += 0.07 * kid;
    if (spec.headDrop) cy -= spec.headDrop * sm(0.45, 1.0, x);
    if (spec.pose === 'sternal') {
      const body = 1 - sm(0.45, 0.8, x);
      const ry2 = ry * (0.8 - 0.02 * head), rz2 = rz * 1.07;
      const cyB = ry2 + 0.012;
      const cyH = Math.max(0.3 + 0.04 * sm(0.7, 1, x) * 0, ry2 + 0.012);
      ry = ry2; rz = rz2; cy = cyB * body + Math.max(cyH, cyB) * (1 - body);
      if (x > 0.7) cy = Math.max(cy - 0.06 * sm(0.7, 1.05, x), ry + 0.012);
    }
    return [x, cy, ry, rz];
  });
}

function interp(st, x) {
  for (let i = 0; i < st.length - 1; i++) if (x >= st[i][0] && x <= st[i + 1][0]) { const t = (x - st[i][0]) / (st[i + 1][0] - st[i][0]); return [1, 2, 3].map((c) => st[i][c] + (st[i + 1][c] - st[i][c]) * t); }
  return st[st.length - 1].slice(1);
}

function buildGeo(T, spec, lod) {
  const hi = lod === 'hi', xs = lod === 'xs';
  const acc = accum(T);
  const k = spec.len / LM;
  const st = stationsFor(spec);
  const M = new T.Matrix4(), A = new T.Matrix4(), B = new T.Matrix4(), E = new T.Euler();
  const pose = new T.Matrix4();
  const lateral = spec.pose === 'side' || spec.pose === 'sideB';
  if (lateral) {
    const th = spec.pose === 'side' ? -Math.PI / 2 : Math.PI / 2;
    pose.makeRotationX(th);
    pose.premultiply(new T.Matrix4().makeTranslation(0, 0, spec.pose === 'side' ? 0.58 : -0.58));
  }
  const scale = new T.Matrix4().makeScale(k, k, k);
  const put = (geo, local, color) => { M.copy(scale).multiply(pose).multiply(local); acc.add(geo, M, color); };
  const rot = (rx, ry, rz) => B.makeRotationFromEuler(E.set(rx, ry, rz, 'XYZ'));
  const tr = (x, y, z) => new T.Matrix4().makeTranslation(x, y, z);
  const sc = (x, y, z) => new T.Matrix4().makeScale(x, y, z);

  // body, neck and head in one smooth piece
  const body = loft(T, st, hi ? 24 : xs ? 6 : 9, hi ? 12 : xs ? 5 : 6);
  put(body, new T.Matrix4(), COL.skin);
  body.dispose();

  const sph = (w, h) => new T.SphereGeometry(1, w, h);
  const cyl = (rt, rb, h, seg) => new T.CylinderGeometry(rt, rb, h, seg);
  const seg = hi ? 9 : 5;

  // snout disc and ears
  const tip = interp(st, 1.12);
  const snout = cyl(0.057, 0.052, 0.05, 12);
  if (hi) put(snout, tr(1.14, tip[0] - 0.002, 0).multiply(rot(0, 0, Math.PI / 2)), COL.snout);
  snout.dispose();
  const ear = sph(10, 7);
  const hp = interp(st, 0.70);
  if (hi) [1, -1].forEach((sd) => {
    const m = tr(0.71, hp[0] + hp[1] * 0.74, sd * 0.135).multiply(rot(sd * 0.9, 0, -0.65)).multiply(sc(0.13, 0.016, 0.082));
    put(ear, m, COL.ear);
  });
  ear.dispose();
  if (hi) {
    const eye = sph(6, 5);
    const ep = interp(st, 0.9);
    [1, -1].forEach((sd) => put(eye, tr(0.93, ep[0] + ep[1] * 0.3, sd * ep[2] * 0.88).multiply(sc(0.014, 0.014, 0.014)), COL.eye));
    eye.dispose();
    const tail = new T.TorusGeometry(0.045, 0.011, 5, 12, Math.PI * 1.55);
    put(tail, tr(-0.9, 0.55, 0).multiply(rot(0, 0, 2.2)), COL.skin);
    tail.dispose();
  }

  // legs: a thick upper leg and a slimmer lower one, a hoof at the end
  const leg = (x, z, top, uLen, lLen, rTop, rBot, phiU, phiL) => {
    if (xs) return;
    if (!hi) {
      const one = new T.CylinderGeometry(rTop * 0.8, rBot, uLen + lLen, 4, 1, true);
      put(one, tr(x, top, z).multiply(rot(0, 0, (phiU + phiL) / 2)).multiply(tr(0, -(uLen + lLen) / 2, 0)), COL.skin);
      one.dispose();
      return;
    }
    const up = cyl(rTop, (rTop + rBot) / 2, uLen, seg);
    const m1 = tr(x, top, z).multiply(rot(0, 0, phiU)).multiply(tr(0, -uLen / 2, 0));
    put(up, m1, COL.skin);
    up.dispose();
    const kx = x + uLen * Math.sin(phiU), ky = top - uLen * Math.cos(phiU);
    const lo = cyl((rTop + rBot) / 2, rBot, lLen, seg);
    const m2 = tr(kx, ky, z).multiply(rot(0, 0, phiL)).multiply(tr(0, -lLen / 2, 0));
    put(lo, m2, COL.skin);
    lo.dispose();
    const hf = cyl(rBot * 0.97, rBot * 1.05, 0.04, hi ? 8 : 5);
    put(hf, tr(kx, ky, z).multiply(rot(0, 0, phiL)).multiply(tr(0, -lLen - 0.015, 0)), COL.hoof);
    hf.dispose();
  };
  if (lateral) {
    // lying on her side: legs and udder are on the same side. Legs reach out from the belly, bent, resting low.
    const S = spec.pose === 'side' ? 1 : -1, tk = spec.tuck ? 0.42 : 1;
    const P = (a) => new T.Vector3(a[0], a[1], S * (0.30 + (a[2] - 0.30) * tk));
    const Z = new T.Vector3(0, 1, 0), qq = new T.Quaternion();
    const tube = (a, b, r0, r1, color, sg) => {
      const d = b.clone().sub(a), len = d.length();
      qq.setFromUnitVectors(Z, d.clone().normalize());
      const g = new T.CylinderGeometry(r1, r0, len, sg);
      M.copy(scale).multiply(new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), qq, new T.Vector3(1, 1, 1)));
      acc.add(g, M, color); g.dispose();
    };
    const hoofAt = (a, b, r) => {
      const d = b.clone().sub(a).normalize();
      qq.setFromUnitVectors(Z, d);
      const g = new T.CylinderGeometry(r * 0.95, r * 1.05, 0.045, hi ? 8 : 5);
      M.copy(scale).multiply(new T.Matrix4().compose(b.clone().addScaledVector(d, 0.01), qq, new T.Vector3(1, 1, 1)));
      acc.add(g, M, COL.hoof); g.dispose();
    };
    const legs = [
      [[0.40, 0.17, 0.30], [0.52, 0.0, 0.52], [0.50, -0.2, 0.64], 0.088, 0.06, 0.044],
      [[0.40, -0.15, 0.30], [0.52, -0.2, 0.52], [0.64, -0.235, 0.62], 0.088, 0.06, 0.044],
      [[-0.58, 0.17, 0.30], [-0.68, 0.02, 0.50], [-0.64, -0.2, 0.62], 0.108, 0.07, 0.046],
      [[-0.58, -0.15, 0.30], [-0.70, -0.21, 0.50], [-0.82, -0.235, 0.58], 0.108, 0.07, 0.046]
    ];
    legs.forEach((l) => {
      const a = P(l[0]), b = P(l[1]), c = P(l[2]);
      if (!hi) { tube(a, c, l[3] * 0.8, l[5], COL.skin, 4); return; }
      tube(a, b, l[3], l[4], COL.skin, seg);
      const kn = sph(8, 6);
      M.copy(scale).multiply(new T.Matrix4().compose(b, new T.Quaternion(), new T.Vector3(l[4], l[4], l[4])));
      acc.add(kn, M, COL.skin); kn.dispose();
      tube(b, c, l[4], l[5], COL.skin, seg);
      hoofAt(b, c, l[5]);
    });
  } else if (spec.pose === 'stand' || spec.pose === 'suckle') {
    const fr = spec.pose === 'suckle' ? 0.12 : 0;
    const pf = lateral ? 0.55 : 0, pr = lateral ? -0.4 : 0;
    const lift = 0.07 * (spec.kid || 0);
    const topF = (lateral ? 0.5 : 0.42) + lift, topR = (lateral ? 0.52 : 0.44) + lift;
    const kk = (lateral ? 1.18 : 1) * (1 + lift * 1.6);
    [1, -1].forEach((sd) => {
      const jit = lateral ? (sd > 0 ? 1.15 : 0.8) : 1;
      leg(0.38, sd * 0.17, topF, 0.22 * kk, 0.16 * kk, lateral ? 0.082 : 0.1, 0.04, 0.06 + pf * jit - fr, -0.04 + pf * 0.45 * jit - fr);
      leg(-0.56, sd * 0.185, topR, 0.22 * kk, 0.17 * kk, lateral ? 0.09 : 0.118, 0.043, -0.3 + pr * jit, lateral ? -0.5 * jit : 0.3);
    });
  } else {
    // lying on the belly: forelegs folded forward, hind feet tucked at the flanks
    const flat = (x0, y, z, len, r) => {
      if (!hi) return;
      const geoL = cyl(r * 0.9, r, len, seg);
      put(geoL, tr(x0 + len / 2, y, z).multiply(rot(0, 0, -Math.PI / 2)), COL.skin);
      geoL.dispose();
      const hf = cyl(r * 1.0, r * 1.05, 0.045, hi ? 8 : 5);
      put(hf, tr(x0 + len + 0.02, y, z).multiply(rot(0, 0, -Math.PI / 2)), COL.hoof);
      hf.dispose();
    };
    [1, -1].forEach((sd) => {
      flat(0.36, 0.055, sd * 0.2, 0.3, 0.055);
      flat(-0.5, 0.05, sd * 0.285, 0.23, 0.052);
    });
  }

  // teats along the belly of the sow lying on her side
  if (hi && lateral && spec.len > 1.5) {
    const tg = sph(6, 4);
    for (let i = 0; i < 8; i++) {
      const x = -0.56 + i * 0.1;
      const s = interp(st, x);
      [1, -1].forEach((sd) => put(tg, tr(x, s[0] - s[1] * 0.955, sd * 0.088).multiply(sc(0.017, 0.019, 0.017)), COL.teat));
    }
    tg.dispose();
  }
  return acc.finish(true);
}

const SPECS = (() => {
  const mk = (cls, pose, o) => Object.assign({ cls: cls, pose: pose, len: CLASSES[cls], kid: { sow: 0, finisher: 0.15, weaner: 0.45, piglet: 0.85 }[cls] }, o || {});
  const out = {};
  ['sow', 'finisher', 'weaner', 'piglet'].forEach((c) => {
    ['stand', 'sternal', 'side', 'sideB'].forEach((p) => { if ((p === 'side' || p === 'sideB') && c === 'finisher') return; out[c + '-' + p] = mk(c, p); });
  });
  out['piglet-suckle'] = mk('piglet', 'suckle', { headDrop: 0.15 });
  out['weaner-suckle'] = mk('weaner', 'suckle', { headDrop: 0.15 });
  out['sow-sideT'] = mk('sow', 'side', { tuck: true });
  out['sow-sideTB'] = mk('sow', 'sideB', { tuck: true });
  out['finisher-side'] = mk('finisher', 'side');
  out['finisher-sideB'] = mk('finisher', 'sideB');
  return out;
})();

// ---- rails and panels (barn furniture), one InstancedMesh each ------------------------------
export function railSet(T) {
  const bars = [], panels = [];
  return {
    bar(x0, y0, z0, x1, y1, z1, r) { bars.push([x0, y0, z0, x1, y1, z1, r || 0.018]); },
    panel(cx, cy, cz, sx, sy, sz) { panels.push([cx, cy, cz, sx, sy, sz]); },
    count() { return bars.length + panels.length; },
    build(matBar, matPanel, shadow) {
      const g = new T.Group();
      if (bars.length) {
        const geo = new T.CylinderGeometry(1, 1, 1, 6, 1);
        const im = new T.InstancedMesh(geo, matBar, bars.length);
        const m = new T.Matrix4(), q = new T.Quaternion(), a = new T.Vector3(), b = new T.Vector3(), d = new T.Vector3(), up = new T.Vector3(0, 1, 0), s = new T.Vector3(), p = new T.Vector3();
        bars.forEach((r, i) => {
          a.set(r[0], r[1], r[2]); b.set(r[3], r[4], r[5]); d.subVectors(b, a); const len = Math.max(0.001, d.length()); d.normalize();
          q.setFromUnitVectors(up, d); p.addVectors(a, b).multiplyScalar(0.5); s.set(r[6], len, r[6]);
          m.compose(p, q, s); im.setMatrixAt(i, m);
        });
        im.frustumCulled = false; im.castShadow = !!shadow; im.receiveShadow = false;
        g.add(im);
      }
      if (panels.length) {
        const geo = new T.BoxGeometry(1, 1, 1);
        const im = new T.InstancedMesh(geo, matPanel, panels.length);
        const m = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(), p = new T.Vector3();
        panels.forEach((r, i) => { p.set(r[0], r[1], r[2]); s.set(r[3], r[4], r[5]); m.compose(p, q, s); im.setMatrixAt(i, m); });
        im.frustumCulled = false; im.castShadow = !!shadow; im.receiveShadow = true;
        g.add(im);
      }
      return g;
    },
    dispose() { }
  };
}

// ---- the kit ----------------------------------------------------------------------------------
export function pigKit(T) {
  const geos = {};
  const geoFor = (key, lod) => {
    const id = key + ':' + lod;
    if (!geos[id]) {
      if (!SPECS[key]) throw new Error('No pig variety ' + key);
      geos[id] = buildGeo(T, SPECS[key], lod);
    }
    return geos[id];
  };
  const radial = (stops, size) => {
    const c = document.createElement('canvas'); c.width = c.height = size || 128;
    const x = c.getContext('2d'); const g = x.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width / 2);
    stops.forEach((s) => g.addColorStop(s[0], s[1]));
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  };
  const shadowTex = radial([[0, 'rgba(40,30,28,0.62)'], [0.45, 'rgba(40,30,28,0.34)'], [1, 'rgba(40,30,28,0)']]);
  const glowTex = radial([[0, 'rgba(255,170,70,0.62)'], [0.35, 'rgba(255,184,96,0.34)'], [1, 'rgba(255,200,120,0)']]);
  const mat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });
  const shadowMat = new T.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const glowMat = new T.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const hoodMat = new T.MeshStandardMaterial({ color: '#D9D6CE', roughness: 0.5, metalness: 0.1, emissive: '#FF8A2A', emissiveIntensity: 0.0 });
  const hoodOnMat = new T.MeshStandardMaterial({ color: '#E9E4DA', roughness: 0.5, metalness: 0.1, emissive: '#FF8B2B', emissiveIntensity: 0.55 });
  const bulbMat = new T.MeshBasicMaterial({ color: '#FFD08A' });
  const unitPlane = new T.PlaneGeometry(1, 1); unitPlane.rotateX(-Math.PI / 2);
  const hoodGeo = new T.ConeGeometry(0.15, 0.13, 14, 1, true); hoodGeo.translate(0, 0.065, 0);
  const bulbGeo = new T.SphereGeometry(0.045, 8, 6);

  // soft contact shadow footprint (length, width) per variety, metres
  const foot = (key) => { const s = SPECS[key], L = s.len; const lat = s.pose === 'side' || s.pose === 'sideB'; return lat ? [L * 1.1, L * 0.62] : s.pose === 'sternal' ? [L * 1.18, L * 0.5] : [L * 1.12, L * 0.36]; };

  const kit = {
    THREE: T, mat: mat, geo: geoFor, specs: SPECS, shadowMat: shadowMat, glowMat: glowMat, hoodMat: hoodMat, hoodOnMat: hoodOnMat, bulbMat: bulbMat,
    rng: makeRng,
    field() {
      const list = {}, lamps = [], glows = [];
      const f = {
        add(key, o) {
          (list[key] = list[key] || []).push(o);
        },
        // a heat lamp hood centred at (x, y, z); glow puts the warm light on the floor at (x, gy, z)
        lamp(x, y, z, on, gy) { lamps.push({ x: x, y: y, z: z, on: on, gy: gy }); },
        count() { let n = 0; Object.keys(list).forEach((k) => { n += list[k].length; }); return n; },
        build() {
          const hi = new T.Group(), lo = new T.Group(), xs = new T.Group(), base = new T.Group(), fix = new T.Group();
          const m = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3(), c = new T.Color(), Y = new T.Vector3(0, 1, 0);
          const shadowItems = [];
          Object.keys(list).forEach((key) => {
            const arr = list[key];
            ['hi', 'lo', 'xs'].forEach((lod) => {
              const im = new T.InstancedMesh(geoFor(key, lod), mat, arr.length);
              arr.forEach((o, i) => {
                const k = o.s == null ? 1 : o.s;
                q.setFromAxisAngle(Y, o.yaw || 0); p.set(o.x, o.y || 0, o.z); s.set(k * PIG_SCALE * (o.sx == null ? 1 : o.sx), k * PIG_SCALE * (o.sy == null ? 1 : o.sy), k * PIG_SCALE * (o.sz == null ? 1 : o.sz));
                m.compose(p, q, s); im.setMatrixAt(i, m);
                const t = o.tone == null ? 1 : o.tone; c.setRGB(t, t * 0.992, t * 0.985); im.setColorAt(i, c);
              });
              im.frustumCulled = false; im.castShadow = false; im.receiveShadow = true;
              (lod === 'hi' ? hi : lod === 'lo' ? lo : xs).add(im);
            });
            const fp = foot(key);
            arr.forEach((o) => { if (o.shadow !== false) shadowItems.push({ o: o, fp: fp, key: key }); });
          });
          if (shadowItems.length) {
            const im = new T.InstancedMesh(unitPlane, shadowMat, shadowItems.length);
            shadowItems.forEach((it, i) => {
              const o = it.o, k = o.s == null ? 1 : o.s;
              q.setFromAxisAngle(Y, o.yaw || 0); p.set(o.x, (o.y || 0) + 0.012, o.z); s.set(it.fp[0] * k * PIG_SCALE * (o.sx == null ? 1 : o.sx), 1, it.fp[1] * k * PIG_SCALE * (o.sz == null ? 1 : o.sz));
              // the footprint is centred on the body, a little ahead of the pivot
              const fw = 0.05 * SPECS[it.key].len * PIG_SCALE; p.x += Math.cos(o.yaw || 0) * fw * k; p.z -= Math.sin(o.yaw || 0) * fw * k;
              m.compose(p, q, s); im.setMatrixAt(i, m);
            });
            im.frustumCulled = false; im.renderOrder = 1; base.add(im);
          }
          if (lamps.length) {
            const on = lamps.filter((l) => l.on), off = lamps.filter((l) => !l.on);
            [[on, hoodOnMat], [off, hoodMat]].forEach((pair) => {
              const ls = pair[0]; if (!ls.length) return;
              const im = new T.InstancedMesh(hoodGeo, pair[1], ls.length);
              ls.forEach((l, i) => { p.set(l.x, l.y, l.z); q.identity(); s.set(1, 1, 1); m.compose(p, q, s); im.setMatrixAt(i, m); });
              im.frustumCulled = false; fix.add(im);
            });
            if (on.length) {
              const bi = new T.InstancedMesh(bulbGeo, bulbMat, on.length);
              const gi = new T.InstancedMesh(unitPlane, glowMat, on.length);
              on.forEach((l, i) => {
                p.set(l.x, l.y - 0.01, l.z); q.identity(); s.set(1, 1, 1); m.compose(p, q, s); bi.setMatrixAt(i, m);
                p.set(l.x, l.gy + 0.016, l.z); s.set(1.35, 1, 1.35); m.compose(p, q, s); gi.setMatrixAt(i, m);
              });
              bi.frustumCulled = false; gi.frustumCulled = false; gi.renderOrder = 2; fix.add(bi); base.add(gi);
            }
          }
          return { hi: hi, lo: lo, xs: xs, base: base, fix: fix };
        }
      };
      void glows;
      return f;
    },
    dispose() { Object.keys(geos).forEach((k) => geos[k].dispose()); mat.dispose(); shadowTex.dispose(); glowTex.dispose(); }
  };
  return kit;
}

// ---- arranging pigs and their furniture ---------------------------------------------------------
// Every helper works in the pen's own frame: (x, z) is the pen centre, y the floor top, head = +1 or -1 is
// the side of the feeder (x), and +z is toward the door. rng is a makeRng() function.

const vary = (rng, o) => Object.assign({ tone: 1 + rng.n(-0.04, 0.04) }, o);
const sizeJ = (rng) => 1 + rng.n(-0.06, 0.06);

// the sow in a gestation stall. pose: stand | sternal | side. belly = +1 or -1 (z side of her belly)
export function stallSow(field, rng, o) {
  const h = o.head, k = sizeJ(rng), tone = 1 + rng.n(-0.04, 0.04);
  if (o.pose === 'stand') {
    field.add('sow-stand', { x: o.x + h * rng.n(0.0, 0.07), y: o.y, z: o.z + rng.n(-0.04, 0.04), yaw: h > 0 ? 0 : Math.PI, s: k, sz: 1, tone: tone });
  } else if (o.pose === 'sternal') {
    field.add('sow-sternal', { x: o.x + h * rng.n(-0.2, 0.05), y: o.y, z: o.z + rng.n(-0.03, 0.03), yaw: h > 0 ? 0 : Math.PI, s: k, sz: 0.97, tone: tone });
  } else {
    const key = (h > 0) === (o.belly > 0) ? 'sow-sideT' : 'sow-sideTB';
    field.add(key, { x: o.x + h * rng.n(-0.2, 0.05), y: o.y, z: o.z, yaw: h > 0 ? 0 : Math.PI, s: k * 0.97, sz: 0.88, tone: tone });
  }
}

// poses for the stalls of one lane, filled[] says which stalls hold a sow
export function stallPoses(rng, filled) {
  const n = filled.length, out = [];
  for (let j = 0; j < n; j++) {
    if (!filled[j]) { out.push(null); continue; }
    const r = rng();
    out.push(r < 0.3 ? { pose: 'stand' } : r < 0.3 + 0.7 * 0.8 ? { pose: 'sternal' } : { pose: 'side', belly: rng() < 0.65 ? 1 : -1 });
  }
  // a sow on her side stretches her legs a little into the stall she faces: that stall may not hold a standing sow
  for (let j = 0; j < n; j++) {
    const p = out[j];
    if (p && p.pose === 'side') [j - 1, j + 1].forEach((q) => { if (out[q] && out[q].pose === 'stand') out[q] = { pose: 'sternal' }; });
  }
  return out;
}

// piglets in a heap: piled two or three deep around (cx, cz)
export function pigletHeap(field, rng, cx, cz, y, n) {
  for (let i = 0; i < n; i++) {
    const layer = i < 5 ? 0 : i < 9 ? 1 : 2;
    const a = i * 2.39996 + rng.n(-0.3, 0.3), r = PIG_SCALE * (layer === 0 ? 0.1 + rng.n(0, 0.06) : layer === 1 ? 0.05 + rng.n(0, 0.06) : rng.n(0, 0.05));
    const side = rng() < 0.4;
    field.add(side ? (rng() < 0.5 ? 'piglet-side' : 'piglet-sideB') : 'piglet-sternal', vary(rng, { x: cx + Math.cos(a) * r, y: y + layer * 0.075 * PIG_SCALE, z: cz + Math.sin(a) * r * 0.9, yaw: rng.n(0, Math.PI * 2), s: sizeJ(rng), shadow: layer === 0 }));
  }
}

// a farrowing crate: sow on her side in the middle, belly toward +z. mode: suck | heap | mixed
export function crateFill(field, rails, rng, o) {
  const h = o.head, y = o.y, S = 0.93 * sizeJ(rng);
  const PS = PIG_SCALE;
  const hx = o.x - h * 1.14, hz = o.z + 0.63;
  // pose 'stand' | 'sternal' puts the sow up before she farrows; she lies on her side otherwise
  if (o.sow !== false && (o.pose === 'stand' || o.pose === 'sternal')) field.add('sow-' + o.pose, { x: o.x - h * 0.02, y: y, z: o.z, yaw: h > 0 ? 0 : Math.PI, s: S, tone: 1 + rng.n(-0.04, 0.04) });
  else if (o.sow !== false) field.add(h > 0 ? 'sow-side' : 'sow-sideB', { x: o.x - h * 0.02, y: y, z: o.z, yaw: h > 0 ? 0 : Math.PI, s: S, tone: 1 + rng.n(-0.04, 0.04) });
  const n = o.litter || 0;
  const nS = o.mode === 'suck' ? n : o.mode === 'mixed' ? Math.round(n * 0.58) : 0;
  const nH = n - nS;
  const sp = PS * Math.max(0.072, Math.min(0.088, 0.78 / Math.max(1, nS - 1)));
  for (let i = 0; i < nS; i++) {
    const u = (i - (nS - 1) / 2) * sp - 0.08 * PS;
    field.add('piglet-suckle', vary(rng, { x: o.x + h * u + rng.n(-0.01, 0.01), y: y, z: o.z + 0.55 * PS + rng.n(-0.02, 0.016), yaw: Math.PI / 2 + rng.n(-0.13, 0.13), s: sizeJ(rng), shadow: true }));
  }
  if (nH > 0) pigletHeap(field, rng, hx, hz, y, nH);
  if (o.lamp !== false && n > 0) {
    // pole at the pen corner, an arm over the heap, a cord down to the hood
    heatLamp(field, rails, y, hx, hz, o.x - h * 1.3, o.z + 0.88);
  }
}

// the crate itself (rails the sow lies between)
export function crateRails(rails, o) {
  const h = o.head, y = o.y, x0 = o.x - 0.94, x1 = o.x + 0.94;
  [-0.45, 0.45].forEach((dz) => {
    rails.bar(x0, y + 0.96, o.z + dz, x1, y + 0.96, o.z + dz, 0.02);
    rails.bar(x0, y + 0.64, o.z + dz, x1, y + 0.64, o.z + dz, 0.016);
    [x0, x1].forEach((px) => rails.bar(px, y, o.z + dz, px, y + 0.96, o.z + dz, 0.02));
  });
  [x0, x1].forEach((px) => rails.bar(px, y + 0.96, o.z - 0.45, px, y + 0.96, o.z + 0.45, 0.02));
  // feeder at the head end
  rails.panel(o.x + h * 1.2, y + 0.07, o.z, 0.3, 0.14, 0.52);
}

// a nursery or finisher pen: a huddle lying in one corner, a few standing at the feeder. cls: weaner | finisher
export function groupPenFill(field, rails, rng, o) {
  const cls = o.cls || 'weaner', h = o.head, y = o.y, n = o.n;
  const len = CLASSES[cls] * PIG_SCALE;
  const nStand = Math.min(n, rng.i(2, 4));
  const nLie = n - nStand;
  const front = o.x + h * (o.sx / 2 - 0.34);       // front face of the feeder
  const hopW = 0.34;
  rails.panel(o.x + h * (o.sx / 2 - 0.17), y + 0.27, o.z, hopW * 0.8, 0.54, Math.min(0.6, o.sz * 0.4));
  rails.panel(o.x + h * (o.sx / 2 - 0.2), y + 0.05, o.z, 0.46, 0.1, Math.min(1.0, o.sz * 0.66));
  const nose = len / 2.04 * 1.15 + 0.05;
  const stride = Math.min(0.5, (o.sz - 0.3) / Math.max(1, nStand));
  for (let i = 0; i < nStand; i++) {
    const zz = o.z + (i - (nStand - 1) / 2) * stride + rng.n(-0.04, 0.04);
    field.add(cls + '-stand', vary(rng, { x: front - h * (nose + rng.n(0, 0.12)), y: y, z: zz, yaw: (h > 0 ? 0 : Math.PI) + rng.n(-0.22, 0.22), s: sizeJ(rng) }));
  }
  const side = rng.sgn();
  huddle(field, rng, cls, o.x - h * (o.sx / 2 - len * 0.95), o.z + side * Math.max(0, o.sz / 2 - 0.52), y, nLie);
}

// pigs lying side by side in a huddle, a couple on top
export function huddle(field, rng, cls, cx, cz, y, n) {
  const len = CLASSES[cls] * PIG_SCALE;
  const slots = [];
  for (let c = 0; c < 2; c++) for (let r = 0; r < 4; r++) slots.push([(c - 0.5) * len * 0.9, (r - 1.5) * len * 0.32]);
  for (let i = slots.length - 1; i > 0; i--) { const j = rng.i(0, i); const t = slots[i]; slots[i] = slots[j]; slots[j] = t; }
  for (let i = 0; i < n; i++) {
    const sl = slots[i % slots.length];
    const top = i >= slots.length;
    const k = rng() < 0.45 ? (rng() < 0.5 ? cls + '-side' : cls + '-sideB') : cls + '-sternal';
    field.add(k, vary(rng, { x: cx + sl[0] + rng.n(-0.06, 0.06), y: y + (top ? 0.12 * PIG_SCALE : 0), z: cz + sl[1] + rng.n(-0.05, 0.05), yaw: rng.n(-0.45, 0.45) + (rng() < 0.5 ? Math.PI : 0), s: sizeJ(rng), shadow: !top }));
  }
}

// a heat lamp hung over (hx, hz) from a pole standing at (px, pz)
export function heatLamp(field, rails, y, hx, hz, px, pz) {
  rails.bar(px, y, pz, px, y + 1.3, pz, 0.016);
  rails.bar(px, y + 1.3, pz, hx, y + 1.3, hz, 0.014);
  rails.bar(hx, y + 1.3, hz, hx, y + 0.76, hz, 0.006);
  field.lamp(hx, y + 0.62, hz, true, y);
}

// a pen of adult pigs on open floor (gilts, boars, sick sows): spread without overlaps
export function openPenFill(field, rng, o) {
  const pts = [];
  const R = (o.r || 0.62) * PIG_SCALE / 0.7 * 0.8;
  for (let i = 0; i < o.n; i++) {
    let best = null, bd = -1;
    for (let t = 0; t < 40; t++) {
      const x = o.x + rng.n(-o.sx / 2 + 1.0, o.sx / 2 - 1.0), z = o.z + rng.n(-o.sz / 2 + 0.6, o.sz / 2 - 0.6);
      let d = 1e9; pts.forEach((p) => { d = Math.min(d, Math.hypot(p.x - x, (p.z - z) * 1.4)); });
      if (d > bd) { bd = d; best = { x: x, z: z }; }
      if (d > R * 2.2) break;
    }
    pts.push(best);
  }
  pts.forEach((p) => {
    const r = rng(); const k = sizeJ(rng) * (o.scale || 1);
    const yaw = rng.n(0, Math.PI * 2);
    if (r < 0.4) field.add('sow-stand', vary(rng, { x: p.x, y: o.y, z: p.z, yaw: yaw, s: k }));
    else if (r < 0.88) field.add('sow-sternal', vary(rng, { x: p.x, y: o.y, z: p.z, yaw: yaw, s: k, sz: 0.97 }));
    else field.add(rng() < 0.5 ? 'sow-side' : 'sow-sideB', vary(rng, { x: p.x, y: o.y, z: p.z, yaw: yaw, s: k * 0.97 }));
  });
}
