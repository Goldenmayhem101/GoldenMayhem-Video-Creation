// world.js - town, bridge, river, lighting built from toonkit pieces (all original geometry)
import {
  THREE, INK, LIGHTS, sunDir, rng, toon, flat, box, cyl, ell, mesh, ink,
  texPlaster, texBrick, texRoof, texPlanks, texStone, texGrass, texCobble, texWater, makeSky, makeClouds, makeSunRays, inkUniforms,
} from './toonkit.js';

const css = (n) => '#' + n.toString(16).padStart(6, '0');
function rep(tex, x, y) { const t = tex.clone(); t.repeat.set(x, y); t.needsUpdate = true; return t; }
const M = {}; // shared material cache per world
function mat(key, f) { return M[key] || (M[key] = f()); }

/* ---------------- house ---------------- */
export function house(o = {}) {
  const { w = 8, d = 6.5, floors = 2, wall = 'plaster', color = 0xf0dcb0, roof = 0xb4493b, trim = 0xf7efd8, shutter = 0x3e8a78, seed = 1, glow = false, door = 0x7a4630 } = o;
  const r = rng(seed), g = new THREE.Group(), fh = 3.3, h = floors * fh + .6;
  const wallTex = wall === 'brick' ? texBrick(css(color), seed) : texPlaster(css(color), seed);
  const sc = wall === 'brick' ? 1.84 : 4;
  const body = box(w, h, d, toon(0xffffff, rep(wallTex, w / sc, h / sc)), { px: 3.2 }); body.position.y = h / 2; g.add(body);
  const plinth = box(w + .3, .7, d + .3, toon(0x8a7c78, rep(texStone('#9a8c88', 5), (w + .3) / 4, .25)), { px: 3 }); plinth.position.y = .35; g.add(plinth);
  const cornice = box(w + .5, .35, d + .5, toon(trim), { px: 3 }); cornice.position.y = h; g.add(cornice);
  const rh = d * .46, shape = new THREE.Shape(); const ov = d / 2 + .55;
  shape.moveTo(-ov, 0); shape.lineTo(ov, 0); shape.lineTo(0, rh); shape.closePath();
  const rg = new THREE.ExtrudeGeometry(shape, { depth: w + 1.1, bevelEnabled: false }); rg.translate(0, 0, -(w + 1.1) / 2); rg.rotateY(Math.PI / 2);
  const rm = mesh(rg, toon(roof, rep(texRoof(css(roof), seed + 3), 1 / 3.4, 1 / 3.4)), { px: 3.2 }); rm.position.y = h + .15; g.add(rm);
  if (o.chimney !== false) {
    const ch = box(1, 2.6, 1, toon(0xffffff, rep(texBrick('#b5594a', 9), .6, 1.4)), { px: 3 }); ch.position.set(w * (r() > .5 ? .26 : -.26), h + rh * .7, -d * .1); g.add(ch);
    const cp = box(1.25, .3, 1.25, toon(0xd8cbb8), { px: 3 }); cp.position.set(ch.position.x, h + rh * .7 + 1.4, ch.position.z); g.add(cp);
    const pot = cyl(.28, .32, .6, toon(0xc2693e), { px: 3 }); pot.position.set(ch.position.x, h + rh * .7 + 1.8, ch.position.z); g.add(pot);
  }
  const cols = Math.max(2, Math.round(w / 2.9)), z0 = d / 2;
  const glass = glow ? flat(0xffd88a) : toon(0x7fa6d4, null, { emissive: 0x16243c });
  const mTrim = toon(trim), mShut = toon(shutter), mBar = toon(0x3a2a2a);
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const x = (c - (cols - 1) / 2) * (w / cols), y = f * fh + 2.3;
    if (f === 0 && Math.abs(x) < w / cols * .55 && cols % 2 === 1) {
      const dr = box(1.5, 2.6, .24, toon(door), { px: 3 }); dr.position.set(x, 1.65, z0 + .02); g.add(dr);
      const dt = box(2.1, .3, .5, mTrim, { px: 3 }); dt.position.set(x, 3.1, z0 + .1); g.add(dt);
      const st = box(2.2, .26, .9, toon(0x9a8c88), { px: 3 }); st.position.set(x, .62, z0 + .35); g.add(st); continue;
    }
    const fr = box(1.4, 1.9, .26, mTrim, { px: 3 }); fr.position.set(x, y, z0 + .02); g.add(fr);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), glass); gl.position.set(x, y, z0 + .17); g.add(gl);
    const b1 = box(.09, 1.6, .06, mBar, { px: 0 }); b1.position.set(x, y, z0 + .2); g.add(b1);
    const b2 = box(1.1, .09, .06, mBar, { px: 0 }); b2.position.set(x, y + .1, z0 + .2); g.add(b2);
    const sl = box(1.7, .22, .55, mTrim, { px: 3 }); sl.position.set(x, y - 1.05, z0 + .18); g.add(sl);
    if (o.shutters !== false) for (const s of [-1, 1]) { const sh = box(.5, 1.9, .14, mShut, { px: 3 }); sh.position.set(x + s * 1.0, y, z0 + .08); g.add(sh); }
  }
  g.userData.height = h + rh; return g;
}

/* ---------------- tree / props ---------------- */
export function tree(seed = 1, s = 1) {
  const r = rng(seed), g = new THREE.Group();
  const tr = cyl(.28, .42, 3.2, toon(0x7a5238), { px: 3 }); tr.position.y = 1.6; g.add(tr);
  const cols = [0x4ea34a, 0x62b64f, 0x3f8e45];
  for (let i = 0; i < 4; i++) {
    const sp = ell(1.9 - i * .15, 1.6, 1.9 - i * .15, toon(cols[i % 3]), { px: 3.2 }); sp.position.set((r() - .5) * 2, 4.2 + i * .9 + r() * .4, (r() - .5) * 2); g.add(sp);
  }
  g.scale.setScalar(s); return g;
}
export function barrel() { const g = new THREE.Group(); const b = cyl(.5, .5, .9, toon(0xa8693b, texPlanks('#a8693b', 3)), { px: 3 }); b.position.y = .45; g.add(b); for (const y of [.2, .7]) { const h = cyl(.52, .52, .08, toon(0x2e2a34), { px: 0 }); h.position.y = y; g.add(h); } return g; }
export function crate(sz = .9) { const c = box(sz, sz, sz, toon(0xffffff, rep(texPlanks('#c8884e', 6), 1, 1)), { px: 3 }); c.position.y = sz / 2; return c; }
export function lamp() { const g = new THREE.Group(); const p = cyl(.08, .1, 4, toon(0x2e3042), { px: 3 }); p.position.y = 2; g.add(p); const l = box(.5, .7, .5, flat(0xffd88a), { px: 3 }); l.position.y = 4.3; g.add(l); const c = box(.7, .2, .7, toon(0x2e3042), { px: 3 }); c.position.y = 4.75; g.add(c); return g; }
export function swingSet() {
  const g = new THREE.Group(), wood = toon(0xffffff, rep(texPlanks('#b97a45', 4), 1, 1)), iron = toon(0x3a3d52);
  for (const z of [-1.5, 1.5]) for (const sgn of [-1, 1]) { const l = cyl(.1, .1, 4.1, wood, { px: 3 }); l.position.set(sgn * .75, 1.95, z); l.rotation.z = sgn * .32; g.add(l); }
  const beam = cyl(.11, .11, 3.6, wood, { px: 3 }); beam.rotation.x = Math.PI / 2; beam.position.y = 3.85; g.add(beam);
  const sw = new THREE.Group(); sw.position.y = 3.85; g.add(sw);
  const seat = box(.9, .09, .4, toon(0xd8522e), { px: 3 }); seat.position.set(0, -3.13, 0); sw.add(seat);
  for (const z of [-.36, .36]) { const rp = cyl(.025, .025, 3.1, iron, { px: 2 }, 6); rp.position.set(0, -1.58, z); sw.add(rp); }
  g.userData.sw = sw; return g;
}
export function star(r = 1, color = 0xffe45e) {
  const sh = new THREE.Shape(), n = 9;
  for (let i = 0; i < n * 2; i++) { const a = Math.PI * i / n, rr = i % 2 ? r * .52 : r; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const m = mesh(new THREE.ExtrudeGeometry(sh, { depth: .1, bevelEnabled: false }), flat(color), { px: 4, shadow: false }); return m;
}

/* ---------------- bridge ---------------- */
export function bridge({ snap = 0 } = {}) {
  const g = new THREE.Group();
  const wood = toon(0xffffff, rep(texPlanks('#cf9a55', 4), 21 / 2.4, 5.2 / 4));
  const iron = toon(0x3b3f56), stone = toon(0xffffff, rep(texStone('#b9a798', 5), 1, 1.8));
  const deckHalf = (len, sign) => {
    const grp = new THREE.Group(), d = box(len, .4, 5.2, wood, { px: 3.2 }); d.position.x = sign * len / 2; grp.add(d);
    const under = box(len, .5, 4.6, iron, { px: 3 }); under.position.set(sign * len / 2, -.45, 0); grp.add(under);
    for (const z of [-2.5, 2.5]) {
      const rail = box(len, .14, .14, iron, { px: 2.5 }); rail.position.set(sign * len / 2, 1.1, z); grp.add(rail);
      const rail2 = box(len, .1, .1, iron, { px: 2 }); rail2.position.set(sign * len / 2, .55, z); grp.add(rail2);
      for (let x = 1; x < len; x += 2.2) { const p = box(.12, 1.1, .12, iron, { px: 2.5 }); p.position.set(sign * x, .65, z); grp.add(p); }
    }
    return grp;
  };
  const A = deckHalf(23, 1); A.position.set(-23, 4.8, 0); A.rotation.z = -snap * .05; g.add(A);
  const B = deckHalf(23, -1); B.position.set(23, 4.8, 0); B.rotation.z = snap * .62; g.add(B);
  g.userData = { A, B };
  for (const sx of [-1, 1]) {
    const t = box(3.4, 12, 4.4, stone, { px: 3.4 }); t.position.set(sx * 25.5, 11, 0); g.add(t);
    const c1 = box(4.1, .7, 5.1, toon(0xd9cdbb), { px: 3.4 }); c1.position.set(sx * 25.5, 17.3, 0); g.add(c1);
    const c2 = cyl(0, 2.6, 2.4, toon(0x4a4d78), { px: 3.4 }, 4); c2.rotation.y = Math.PI / 4; c2.position.set(sx * 25.5, 18.9, 0); g.add(c2);
    const ar = box(2, 4.2, 4.6, toon(0x1d1626), { px: 0 }); ar.position.set(sx * 25.5, 7.6, 0); ar.scale.set(.001, 1, 1); // marker only
  }
  for (const z of [-2.5, 2.5]) {
    const pts = []; for (let i = 0; i <= 44; i++) { const x = -25.5 + i * (51 / 44), k = x / 25.5; pts.push(new THREE.Vector3(x, 7 + (16.8 - 7) * k * k, z)); }
    const ch = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, .13, 8), iron, { px: 2.8 }); g.add(ch);
    for (let x = -21; x <= 21; x += 2.1) {
      const k = x / 25.5, top = 7 + (16.8 - 7) * k * k, hgt = top - 5.5;
      const h = cyl(.035, .035, hgt, iron, { px: 2 }, 6); h.position.set(x, 5.5 + hgt / 2, z); h.userData.hanger = x; g.add(h);
    }
  }
  return g;
}

/* ---------------- whole world ---------------- */
export function buildWorld(stage, lightName, { sunAz, sunEl, seed = 7 } = {}) {
  const { scene, renderer, bokeh, bloom, grade } = stage;
  for (const c of [...scene.children]) scene.remove(c);
  for (const k in M) delete M[k];
  const L = LIGHTS[lightName], r = rng(seed), az = sunAz ?? L.az, el = sunEl ?? L.el, sd = sunDir(az, el);
  scene.background = null; scene.fog = new THREE.Fog(L.fog, L.fogN, L.fogF); inkUniforms.uFog.value.set(L.fog);
  const hemi = new THREE.HemisphereLight(L.hemiSky, L.hemiGnd, L.hemiI); scene.add(hemi);
  const sun = new THREE.DirectionalLight(L.sun, L.sunI); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06; scene.add(sun); scene.add(sun.target);
  const sky = makeSky(L, sd); scene.add(sky); scene.add(makeClouds(L, seed + 3)); scene.add(makeSunRays(L, sd));
  grade.uniforms.uSat.value = L.sat; grade.uniforms.uLift.value = L.lift; grade.uniforms.uLiftCol.value.set(...L.liftCol); grade.uniforms.uVig.value = L.vig; bloom.strength = L.bloom;

  // river
  const wt = rep(texWater('#4a9fd8', 8), 40, 40); const water = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), toon(0xffffff, wt, { emissive: 0x0b2f55 })); water.rotation.x = -Math.PI / 2; water.receiveShadow = true; scene.add(water);
  // banks
  const bankMat = (top) => [toon(0xffffff, rep(texStone('#a99a8c', 5), 6, 1)), toon(0xffffff, rep(texStone('#a99a8c', 5), 6, 1)), top, toon(0x333333), toon(0xffffff, rep(texStone('#a99a8c', 5), 6, 1)), toon(0xffffff, rep(texStone('#a99a8c', 5), 6, 1))];
  for (const sx of [-1, 1]) {
    const bank = new THREE.Mesh(new THREE.BoxGeometry(120, 5, 260), bankMat(toon(0xffffff, rep(texGrass('#6fbd54', 6), 30, 60)))); ink(bank, 3.2); bank.castShadow = bank.receiveShadow = true;
    bank.position.set(sx * (22 + 60), 2.5, 0); scene.add(bank);
    const street = new THREE.Mesh(new THREE.PlaneGeometry(52, 15), toon(0xffffff, rep(texCobble('#b09a86', 7), 14, 4))); street.rotation.x = -Math.PI / 2; street.position.set(sx * 48, 5.02, 0); street.receiveShadow = true; scene.add(street);
    // far bank wall of river further out
  }
  const br = bridge({ snap: 0 }); scene.add(br);

  // town
  const palette = [[0xf0dcb0, 0xb4493b], [0xd8896a, 0x4e5a86], [0xf0c870, 0xa3452f], [0xcfe0e8, 0x6a4b6a], [0xe8a58a, 0x546a6a], [0xe2d6a0, 0x8f3f36], [0xb85a42, 0x3f4a6a, 'brick']];
  let hs = seed;
  for (const sx of [-1, 1]) for (const [rowZ, dir, hFl] of [[-15, 0, 2], [15, Math.PI, 2], [-36, 0, 3], [36, Math.PI, 3]]) {
    let x = 29; let i = 0;
    while (x < 80) {
      const p = palette[Math.floor(r() * palette.length)], w = 7 + r() * 3.5, fl = hFl + (r() > .6 ? 1 : 0);
      const hz = house({ w, d: 6.5, floors: fl, color: p[0], roof: p[1], wall: p[2] || 'plaster', seed: hs++, shutter: [0x3e8a78, 0x2f6aa8, 0xb4493b, 0x4a4d78][i % 4], glow: lightName === 'golden' });
      hz.position.set(sx * (x + w / 2), 5, rowZ); hz.rotation.y = dir; scene.add(hz); x += w + .8 + r() * .8; i++;
    }
  }
  for (let i = 0; i < 6; i++) { for (const sx of [-1, 1]) { const t = tree(i + 2, .8 + r() * .5); t.position.set(sx * (28 + r() * 40), 5, (r() > .5 ? 1 : -1) * (7 + r() * 5)); scene.add(t); } }
  for (const sx of [-1, 1]) for (let z = -6; z <= 6; z += 12) { const l = lamp(); l.position.set(sx * 30, 5, z); scene.add(l); }

  // ---- props: fences, flowers, boats, flags, foam, street furniture
  const wood = toon(0xe9dcc0), flag = [0xc8323a, 0xf4ebcf];
  for (const sx of [-1, 1]) {
    for (const zs of [-1, 1]) for (let z = 8; z < 62; z += 1.7) { const p = box(.16, 1.1, .16, wood, { px: 2.4 }); p.position.set(sx * 22.9, 5.55, zs * z); scene.add(p); }
    for (const zs of [-1, 1]) for (const y of [5.5, 5.95]) { const rl = box(.1, .1, 54, wood, { px: 2 }); rl.position.set(sx * 22.9, y, zs * 35); scene.add(rl); }
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 400), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .75 })); foam.rotation.x = -Math.PI / 2; foam.position.set(sx * 21.3, .04, 0); scene.add(foam);
    const fp = cyl(.06, .06, 3.2, toon(0x3a3d52), { px: 2 }); fp.position.set(sx * 25.5, 22.4, 0); scene.add(fp);
    const fl = box(.04, 1.1, 1.8, flat(flag[0]), { px: 2.5 }); fl.position.set(sx * 25.5, 23.4, .95); scene.add(fl);
    for (let i = 0; i < 70; i++) {
      const x = sx * (23.5 + r() * 50), z = (r() > .5 ? 1 : -1) * (8.2 + r() * 3.2); const col = [0xffd84a, 0xff7aa8, 0xffffff, 0xff6a4a][i % 4];
      const st = cyl(.015, .015, .3, toon(0x3f8e45), { px: 0 }, 5); st.position.set(x, 5.15, z); scene.add(st);
      const fh = ell(.11, .06, .11, toon(col), { px: 0 }); fh.position.set(x, 5.33, z); scene.add(fh);
    }
    const bn = box(2.2, .12, .6, toon(0x9a6a3f), { px: 2.4 }); bn.position.set(sx * 30, 5.55, 7.9); scene.add(bn);
    for (const dz of [-.9, .9]) { const lg = box(.12, .5, .5, toon(0x3a3d52), { px: 2 }); lg.position.set(sx * 30 + dz, 5.28, 7.9); scene.add(lg); }
    const b1 = barrel(); b1.position.set(sx * 33, 5, -7.3); scene.add(b1); const b2 = barrel(); b2.position.set(sx * 34.1, 5, -7.6); scene.add(b2); const c1 = crate(); c1.position.set(sx * 35.5, 5, -7.4); c1.rotation.y = .4; scene.add(c1);
  }
  [[-12, 26, .2], [9, -28, -.4], [-6, -46, .6], [14, 40, 1.2]].forEach(([x, z, a], i) => {
    const bt = new THREE.Group(); const hull = ell(2.1, .6, .85, toon([0x8a5a36, 0x2f6aa8, 0xb4493b, 0x4a4d78][i]), { px: 3 }); hull.position.y = .15; bt.add(hull);
    const cab = box(1.1, .7, .9, toon(0xf4ebcf), { px: 3 }); cab.position.set(-.3, .8, 0); bt.add(cab);
    const mast = cyl(.05, .05, 3, toon(0x3a2a22), { px: 2 }, 6); mast.position.set(.7, 1.7, 0); bt.add(mast);
    const sail = box(.03, 2.1, 1.4, toon(0xfff6e0), { px: 2.5 }); sail.position.set(.7, 1.9, .75); bt.add(sail);
    bt.position.set(x, .05, z); bt.rotation.y = a; scene.add(bt);
  });
  // distant hills
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + .3, hh = ell(120 + r() * 90, 40 + r() * 40, 100, toon(i % 2 ? 0x6fa68a : 0x7fb98c), { px: 0, shadow: false }); hh.position.set(Math.cos(a) * 520, -8, Math.sin(a) * 520); scene.add(hh); }

  const hang = br.children.filter((c) => c.userData.hanger !== undefined);
  return { scene, br, hang, L, sun, sunDirection: sd, water, wt };
}
export function aimSun(world, target, size = 60) {
  const { sun, sunDirection } = world; sun.position.copy(target).addScaledVector(sunDirection, 120); sun.target.position.copy(target);
  const c = sun.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 1; c.far = 300; c.updateProjectionMatrix(); sun.target.updateMatrixWorld();
}

export function addBirds(scene, t, center, seed = 5) {
  const r = rng(seed), g = new THREE.Group(), m = flat(0x2b2433);
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Group(), body = ell(.28, .12, .14, m, { px: 0, shadow: false }); b.add(body);
    for (const sgn of [-1, 1]) { const pv = new THREE.Group(); const w = box(.12, .035, .95, m, { px: 0, shadow: false }); w.position.z = sgn * .5; pv.add(w); pv.rotation.x = sgn * Math.sin(t * 9 + i * 1.3) * .6; b.add(pv); }
    const ph = i * 1.7 + r() * 3;
    b.position.set(center.x + (i % 4) * 4 - 6 + t * 2.2 + Math.sin(ph) * 1.5, center.y + Math.floor(i / 4) * 2.5 + Math.sin(t * 1.5 + ph) * .6, center.z - Math.floor(i / 3) * 3);
    b.rotation.y = 0; b.scale.setScalar(2.6); g.add(b);
  }
  scene.add(g); return g;
}
