// toonkit.js  -  original toon-3D toolkit (three.js). Painted textures, ink outlines, characters, post.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export { THREE };
const SC = parseFloat(new URLSearchParams(location.search).get('s') || '1');
export const W = Math.round(1080 * SC), H = Math.round(1920 * SC), SCALE = SC;
export const INK = new THREE.Color(0x1b1020);

export function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/* ------------------------------------------------------------------ painted textures */
function jit(hex, r, dh = .02, ds = .06, dl = .06) {
  const c = new THREE.Color(hex), o = {}; c.getHSL(o, THREE.SRGBColorSpace);
  const cl = (v) => Math.max(0, Math.min(100, v * 100)).toFixed(1);
  return `hsl(${(((o.h + (r() - .5) * dh) * 360 + 360) % 360).toFixed(1)} ${cl(o.s + (r() - .5) * ds)}% ${cl(o.l + (r() - .5) * dl)}%)`;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function wrap(w, h, x, y, f) { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) f(x + dx * w, y + dy * h); }
const cache = {};
function once(key, f) { return cache[key] || (cache[key] = f()); }

export function texPlaster(hex, seed = 1) {
  return once('pl' + hex + seed, () => { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = hex; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 240; i++) {
      g.globalAlpha = .08 + r() * .14; g.fillStyle = jit(hex, r, .02, .07, .15);
      const x = r() * w, y = r() * h, rw = 18 + r() * 90, rh = 12 + r() * 60, a = r() * .6 - .3;
      wrap(w, h, x, y, (xx, yy) => { g.beginPath(); g.ellipse(xx, yy, rw, rh, a, 0, 7); g.fill(); });
    }
    g.globalAlpha = .06; g.strokeStyle = '#2a1a10'; g.lineWidth = 2;
    for (let i = 0; i < 50; i++) { const x = r() * w, y = r() * h, l = 40 + r() * 120; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y + l); g.stroke(); }
  }); });
}
export function texBrick(hex, seed = 2) {
  return once('br' + hex + seed, () => { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#4a2c28'; g.fillRect(0, 0, w, h);
    const bw = 64, bh = 32;
    for (let row = 0; row < 16; row++) for (let i = -1; i < 9; i++) {
      const x = i * bw + (row % 2) * (bw / 2), y = row * bh;
      g.fillStyle = jit(hex, r, .02, .08, .12); g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
      g.fillStyle = 'rgba(255,235,200,.16)'; g.fillRect(x + 2, y + 2, bw - 4, 4);
      g.fillStyle = 'rgba(40,10,20,.18)'; g.fillRect(x + 2, y + bh - 7, bw - 4, 5);
    }
  }); });
}
export function texRoof(hex, seed = 3) {
  return once('rf' + hex + seed, () => { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#2a1720'; g.fillRect(0, 0, w, h);
    const tw = 64, th = 32;
    for (let row = 0; row < 16; row++) for (let i = -1; i < 9; i++) {
      const x = i * tw + (row % 2) * (tw / 2), y = row * th;
      g.fillStyle = jit(hex, r, .02, .08, .13);
      g.beginPath(); g.moveTo(x + 3, y); g.lineTo(x + tw - 3, y); g.lineTo(x + tw - 3, y + th * .62); g.quadraticCurveTo(x + tw / 2, y + th * 1.25, x + 3, y + th * .62); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,230,200,.2)'; g.fillRect(x + 6, y + 2, tw - 12, 4);
      g.strokeStyle = 'rgba(30,10,25,.65)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 3, y + th * .62); g.quadraticCurveTo(x + tw / 2, y + th * 1.25, x + tw - 3, y + th * .62); g.stroke();
    }
  }); });
}
export function texPlanks(hex, seed = 4) {
  return once('pk' + hex + seed, () => { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#2b180e'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      const x = i * 64; g.fillStyle = jit(hex, r, .02, .07, .1); g.fillRect(x + 3, 0, 58, h);
      g.globalAlpha = .12; g.strokeStyle = '#3a1f10'; g.lineWidth = 2;
      for (let k = 0; k < 7; k++) { const gx = x + 8 + r() * 48; g.beginPath(); g.moveTo(gx, 0); g.bezierCurveTo(gx + (r() - .5) * 8, h * .3, gx + (r() - .5) * 8, h * .7, gx, h); g.stroke(); }
      g.globalAlpha = .2; g.fillStyle = '#fff2cf'; g.fillRect(x + 4, 0, 5, h); g.globalAlpha = 1;
    }
  }); });
}
export function texStone(hex, seed = 5) {
  return once('st' + hex + seed, () => { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#3d3238'; g.fillRect(0, 0, w, h);
    let y = 0;
    while (y < h) {
      const bh = Math.min(h - y, 44 + r() * 28 | 0); let x = -r() * 80;
      while (x < w) {
        const bw = 70 + r() * 80; g.fillStyle = jit(hex, r, .02, .07, .12); g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
        g.fillStyle = 'rgba(255,245,225,.18)'; g.fillRect(x + 2, y + 2, bw - 4, 5);
        g.fillStyle = 'rgba(50,30,60,.18)'; g.fillRect(x + 2, y + bh - 8, bw - 4, 6); x += bw;
      }
      y += bh;
    }
  }); });
}
export function texGrass(hex, seed = 6) {
  return once('gr' + hex + seed, () => { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = hex; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { g.globalAlpha = .12 + r() * .14; g.fillStyle = jit(hex, r, .05, .1, .2); const x = r() * w, y = r() * h, rw = 30 + r() * 90, rh = 20 + r() * 50; wrap(w, h, x, y, (xx, yy) => { g.beginPath(); g.ellipse(xx, yy, rw, rh, r() * 3, 0, 7); g.fill(); }); }
    g.globalAlpha = .5; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 520; i++) { g.strokeStyle = jit(hex, r, .05, .1, .3); const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 8, y - 8 - r() * 12); g.stroke(); }
  }); });
}
export function texCobble(hex, seed = 7) {
  return once('cb' + hex + seed, () => { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#4b3a3f'; g.fillRect(0, 0, w, h);
    for (let row = 0; row < 14; row++) for (let i = 0; i < 10; i++) {
      const x = (i + (row % 2) * .5) * 52 + (r() - .5) * 5, y = row * 37 + (r() - .5) * 4;
      wrap(w, h, x, y, (xx, yy) => { g.fillStyle = jit(hex, r, .03, .08, .12); g.beginPath(); g.ellipse(xx, yy, 24, 16, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,245,220,.2)'; g.beginPath(); g.ellipse(xx, yy - 5, 17, 7, 0, 0, 7); g.fill(); });
    }
  }); });
}
export function texWater(base, seed = 8) {
  return once('wa' + base + seed, () => { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.globalAlpha = .12 + r() * .12; g.fillStyle = jit(base, r, .03, .1, .22); const x = r() * w, y = r() * h; wrap(w, h, x, y, (xx, yy) => { g.beginPath(); g.ellipse(xx, yy, 40 + r() * 80, 6 + r() * 14, 0, 0, 7); g.fill(); }); }
    g.globalAlpha = .75; g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.lineCap = 'round';
    for (let i = 0; i < 34; i++) { const x = r() * w, y = r() * h, l = 24 + r() * 46; wrap(w, h, x, y, (xx, yy) => { g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + l / 2, yy - 7, xx + l, yy); g.stroke(); }); }
  }); });
}

/* ------------------------------------------------------------------ materials + ink */
const rampData = new Uint8Array([0, 0, 0, 255, 0, 0, 0, 255, 200, 200, 200, 255, 255, 255, 255, 255]);
export const RAMP = new THREE.DataTexture(rampData, 4, 1, THREE.RGBAFormat);
RAMP.minFilter = RAMP.magFilter = THREE.NearestFilter; RAMP.needsUpdate = true;

export function toon(color, map = null, extra = {}) { return new THREE.MeshToonMaterial({ color, map, gradientMap: RAMP, ...extra }); }
export function flat(color, extra = {}) { return new THREE.MeshBasicMaterial({ color, ...extra }); }

export const inkUniforms = { uRes: { value: new THREE.Vector2(W, H) }, uFog: { value: new THREE.Color(0xbcd3ef) } };
const inkMats = {};
function inkMat(px) {
  return inkMats[px] || (inkMats[px] = new THREE.ShaderMaterial({
    uniforms: { uPx: { value: px * SC }, uRes: inkUniforms.uRes, uFog: inkUniforms.uFog, uCol: { value: INK } },
    vertexShader: `uniform float uPx; uniform vec2 uRes; varying float vD;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vD = -mv.z; vec4 c = projectionMatrix*mv;
        vec3 n = normalize(normalMatrix*normal); vec2 d = (projectionMatrix*vec4(n,0.0)).xy; d = normalize(d+1e-6);
        c.xy += d*(uPx*1.4*2.0/uRes)*c.w; gl_Position = c; }`,
    fragmentShader: `uniform vec3 uCol; uniform vec3 uFog; varying float vD;
      void main(){ gl_FragColor = vec4(mix(uCol, uFog, smoothstep(80.0,320.0,vD)*0.55),1.0); }`,
    side: THREE.BackSide,
  }));
}
function inkGeo(g) {
  if (g.userData.inkGeo) return g.userData.inkGeo;
  let c = g.clone(); c.deleteAttribute('uv'); c.deleteAttribute('normal'); if (c.getAttribute('uv1')) c.deleteAttribute('uv1');
  c = mergeVertices(c, 1e-4); c.computeVertexNormals(); g.userData.inkGeo = c; return c;
}
export function ink(mesh, px = 3) {
  const h = new THREE.Mesh(inkGeo(mesh.geometry), inkMat(px)); h.userData.isInk = true; h.castShadow = false; h.receiveShadow = false;
  mesh.add(h); return mesh;
}
export function mesh(geo, mat, { px = 3, shadow = true } = {}) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; if (px) ink(m, px); return m;
}
export function box(w, h, d, mat, o) { return mesh(new THREE.BoxGeometry(w, h, d), mat, o); }
export function cyl(rt, rb, h, mat, o, seg = 20) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, o); }
const UNIT = new THREE.SphereGeometry(1, 30, 18);
export function ell(rx, ry, rz, mat, o) { const m = mesh(UNIT, mat, o); m.scale.set(rx, ry, rz); return m; }

/* ------------------------------------------------------------------ light presets */
export const LIGHTS = {
  day: { sun: 0xfff0d6, sunI: 3.3, az: 62, el: 46, hemiSky: 0xa9c0ff, hemiGnd: 0xe6c9a8, hemiI: 1.25, fog: 0xbdd4ef, fogN: 45, fogF: 520,
         skyTop: 0x3a7cd6, skyHor: 0xc4d9f2, cloud: 0xffffff, sat: 1.16, lift: 0.035, liftCol: [1.0, .78, .8], vig: .30, bloom: .16 },
  golden: { sun: 0xff9d52, sunI: 4.0, az: 8, el: 13, hemiSky: 0xb09af0, hemiGnd: 0xf8b47c, hemiI: 2.2, fog: 0xffb98c, fogN: 30, fogF: 380,
         skyTop: 0x6a5aa6, skyHor: 0xffc47e, cloud: 0xffb492, sat: 1.12, lift: 0.045, liftCol: [1.0, .66, .78], vig: .34, bloom: .3 },
};
export function sunDir(az, el) { const a = az * Math.PI / 180, e = el * Math.PI / 180; return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)); }

/* ------------------------------------------------------------------ sky */
export function makeSky(L, sunDirection) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(L.skyTop) }, hor: { value: new THREE.Color(L.skyHor) }, sun: { value: sunDirection.clone() }, sunCol: { value: new THREE.Color(L.sun) }, glow: { value: L === LIGHTS.golden ? 1.0 : 0.35 } },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 sun; uniform vec3 sunCol; uniform float glow; varying vec3 vP;
      void main(){ float t = clamp(vP.y,0.0,1.0); vec3 c = mix(hor, top, pow(t,0.55)); c = mix(c, hor*1.06, smoothstep(0.22,0.0,t)*0.6);
        float d = max(dot(normalize(vP), normalize(sun)),0.0);
        c += sunCol*(pow(d,6.0)*0.22*glow + pow(d,60.0)*0.5*glow);
        c = mix(c, vec3(1.0,0.97,0.88), smoothstep(0.9985,0.9992,d));
        if (vP.y<0.0) c = hor; gl_FragColor = vec4(c,1.0); }`,
  }));
  m.renderOrder = -10; return m;
}
const CLOUD_COLS = { day: [0xffffff, 0xe3ebfb, 0xb3c1e6], golden: [0xffe2bd, 0xffb08f, 0x8b69a8] };
function cloudTex(cols, seed) {
  const r = rng(seed), css = (n) => '#' + n.toString(16).padStart(6, '0');
  return canvasTex(512, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); const n = 9, bl = [];
    for (let i = 0; i < n; i++) { const u = i / (n - 1), m = Math.sin(u * Math.PI); bl.push({ x: 64 + u * (w - 128) + (r() - .5) * 16, y: h * .6 - m * h * .16 + (r() - .5) * 14, r: 30 + m * 38 + r() * 14 }); }
    const paint = (col, dy, k, top) => { g.save(); g.beginPath(); g.rect(0, 0, w, top); g.clip(); g.fillStyle = col; for (const q of bl) { g.beginPath(); g.arc(q.x, q.y + dy, q.r * k, 0, 7); g.fill(); } g.restore(); };
    paint(css(cols[2]), 10, 1, h * .74); paint(css(cols[1]), 0, .95, h * .72); paint(css(cols[0]), -13, .76, h * .66);
  });
}
export function makeClouds(L, seed = 11, n = 18) {
  const r = rng(seed), g = new THREE.Group(), cols = L === LIGHTS.golden ? CLOUD_COLS.golden : CLOUD_COLS.day;
  const mats = [0, 1, 2].map((i) => new THREE.MeshBasicMaterial({ map: cloudTex(cols, seed + i * 7), transparent: true, depthWrite: false, fog: false }));
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, R = 380 + r() * 260, w = 130 + r() * 190, m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), mats[i % 3]);
    m.position.set(Math.cos(a) * R, 50 + r() * 150, Math.sin(a) * R); m.lookAt(0, m.position.y * .6, 0); m.renderOrder = -6; g.add(m);
  }
  return g;
}
export function makeSunRays(L, sd) {
  const t = canvasTex(512, 512, (g, w, h) => {
    g.translate(w / 2, h / 2); const r = rng(4);
    for (let k = 0; k < 28; k++) { const a = (k / 28) * Math.PI * 2 + r() * .1, wd = .035 + r() * .05; const gr = g.createLinearGradient(0, 0, Math.cos(a) * 256, Math.sin(a) * 256); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - wd) * 256, Math.sin(a - wd) * 256); g.lineTo(Math.cos(a + wd) * 256, Math.sin(a + wd) * 256); g.closePath(); g.fill(); }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshBasicMaterial({ map: t, color: L.sun, transparent: true, opacity: L === LIGHTS.golden ? .55 : .22, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.position.copy(sd).multiplyScalar(800); m.lookAt(0, 0, 0); m.renderOrder = -5; return m;
}

/* ------------------------------------------------------------------ characters */
const HEAD = (() => { const g = new THREE.SphereGeometry(1, 34, 22), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = y > 0 ? 1 - .10 * y : 1 + .16 * y; p.setXYZ(i, x * k, y, z * k); }
  g.computeVertexNormals(); return g; })();

export function makeCharacter(o = {}) {
  const { coat = 0xc8323a, trim = 0xf4ebcf, pants = 0x2f3560, skin = 0xf6c49c, hat = 'shako', mood = 'smile', s = 1, hair = 0x5c3a26, boot = 0x2a2230, belts = true, fat = 1, dress = false, hairStyle = 'short', cuffs = (o.hat ?? 'shako') === 'shako' } = o;
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const mCoat = toon(coat), mPants = toon(pants), mSkin = toon(skin), mTrim = toon(trim), mBoot = toon(boot), dark = flat(0x151018);
  const torso = ell(.31 * fat, .40, .23 * fat, mCoat, { px: 3 }); torso.position.y = .98; body.add(torso);
  if (belts) for (const sgn of [-1, 1]) { const b = box(.055, .66, .02, mTrim, { px: 0 }); b.position.set(sgn * .02, .99, .218); b.rotation.z = sgn * .42; body.add(b); }
  const hips = ell(.27 * fat, .19, .2 * fat, mPants, { px: 3 }); hips.position.y = .64; body.add(hips);
  if (dress) { const sk = cyl(.2 * fat, .4 * fat, .52, mCoat, { px: 3 }, 24); sk.position.y = .52; body.add(sk); const hm = cyl(.405 * fat, .405 * fat, .05, mTrim, { px: 2.4 }, 24); hm.position.y = .27; body.add(hm); }
  const legs = [], arms = [];
  for (const sgn of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(sgn * .11, .62, 0);
    const l = cyl(.058, .052, .5, mPants, { px: 3 }); l.position.y = -.25; pv.add(l);
    const b = ell(.088, .066, .155, mBoot, { px: 3 }); b.position.set(0, -.54, .05); pv.add(b); body.add(pv); legs.push(pv);
    const av = new THREE.Group(); av.position.set(sgn * .32 * fat, 1.2, 0);
    if (cuffs) { const cf = cyl(.058, .058, .07, mTrim, { px: 2.4 }); cf.position.y = -.4; av.add(cf); }
    const a = cyl(.05, .045, .46, mCoat, { px: 3 }); a.position.y = -.23; av.add(a);
    const hnd = ell(.075, .085, .06, mTrim, { px: 3 }); hnd.position.y = -.5; av.add(hnd); body.add(av); arms.push(av);
  }
  if (hat === 'shako') {
    for (const sgn of [-1, 1]) { const ep = ell(.07, .035, .085, toon(0xf2c84a), { px: 2 }); ep.position.set(sgn * .3, 1.29, 0); ep.rotation.z = -sgn * .45; body.add(ep); }
    for (let i = 0; i < 5; i++) { const y = .84 + i * .1, z = .23 * Math.sqrt(1 - ((y - .98) / .4) ** 2) + .005; const bt = ell(.02, .02, .014, flat(0xf2c84a), { px: 0, shadow: false }); bt.position.set(0, y, z); body.add(bt); }
  }
  const cr = ell(.075, .06, .05, mTrim, { px: 2.2 }); cr.position.set(0, 1.3, .17); body.add(cr);
  const head = new THREE.Group(); head.position.y = 1.5; body.add(head);
  const hd = mesh(HEAD, mSkin, { px: 3 }); hd.scale.set(.285, .27, .265); head.add(hd);
  const eyes = [], big = mood === 'shock';
  for (const sgn of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(sgn * .105, .03, .236); eg.rotation.y = sgn * .35; if (big) eg.scale.set(1.12, 1.18, 1); eg.userData.base = eg.scale.y;
    const wh = ell(.05, .07, .02, flat(0xffffff), { px: 1.3, shadow: false }); eg.add(wh);
    const pu = ell(big ? .018 : .028, big ? .03 : .045, .016, dark, { px: 0, shadow: false }); pu.position.set(-sgn * .006, big ? 0 : -.006, .013); eg.add(pu);
    head.add(eg); eyes.push(eg);
    const br = box(.095, .02, .012, dark, { px: 0, shadow: false }); br.position.set(sgn * .105, .135 + (mood === 'shock' ? .05 : 0), .23); br.rotation.z = (mood === 'sad' ? sgn * .38 : mood === 'shock' ? 0 : mood === 'angry' ? -sgn * .4 : -sgn * .08); head.add(br);
    const ear = ell(.04, .06, .025, mSkin, { px: 2.2 }); ear.position.set(sgn * .275, 0, -.01); head.add(ear);
  }
  const noseC = new THREE.Color(skin).multiplyScalar(.9);
  const nose = ell(.036, .03, .034, toon(noseC), { px: 1.8 }); nose.position.set(0, -.025, .258); head.add(nose);
  if (o.moustache) for (const sgn of [-1, 1]) { const m = ell(.075, .03, .03, toon(o.moustache), { px: 1.8 }); m.position.set(sgn * .055, -.075, .245); m.rotation.z = -sgn * .3; head.add(m); }
  const mouth = new THREE.Mesh(
    mood === 'shock' ? UNIT : new THREE.TorusGeometry(.065, .011, 8, 20, Math.PI), dark);
  if (mood === 'shock') { mouth.scale.set(.032, .052, .016); mouth.position.set(0, -.1, .243); }
  else { mouth.position.set(0, mood === 'sad' ? -.15 : -.085, .243); mouth.rotation.z = mood === 'sad' ? 0 : Math.PI; mouth.scale.setScalar(mood === 'smirk' ? .8 : 1); }
  head.add(mouth);
  const talkMouth = ell(.045, .03, .015, flat(0x5a1e2a), { px: 1.2, shadow: false }); talkMouth.position.set(0, -.1, .243); talkMouth.visible = false; head.add(talkMouth);
  if (hat === 'shako') {
    const h1 = cyl(.17, .15, .27, toon(0x23233a), { px: 3 }); h1.position.y = .30; head.add(h1);
    const bd = cyl(.156, .156, .05, toon(0xc8323a), { px: 0 }); bd.position.y = .19; head.add(bd);
    const vis = cyl(.19, .19, .018, toon(0x1a1a28), { px: 3 }); vis.position.set(0, .18, .04); vis.scale.set(1, 1, .9); head.add(vis);
    const pl = cyl(.05, .05, .012, flat(0xf2c84a), { px: 0 }); pl.rotation.x = Math.PI / 2; pl.position.set(0, .31, .158); head.add(pl);
    const pm = ell(.04, .06, .04, toon(0xf4ebcf), { px: 2 }); pm.position.y = .47; head.add(pm);
  } else if (hat === 'cap') {
    const cp = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI * .5), toon(0x2f7ec8)); cp.scale.set(.3, .22, .285); cp.position.y = .12; cp.castShadow = true; ink(cp, 3); head.add(cp);
    const br = cyl(.17, .17, .02, toon(0x2f7ec8), { px: 3 }); br.position.set(0, .1, .2); br.scale.set(1, 1, .8); head.add(br);
  } else if (hat === 'hair') {
    const hr = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI * .55), toon(hair)); hr.scale.set(.3, .27, .29); hr.position.y = .035; hr.castShadow = true; ink(hr, 3); head.add(hr);
  }
  const hm = (c) => toon(c);
  if (hat === 'top') { const t1 = cyl(.16, .16, .34, hm(0x1d1d26), { px: 3 }); t1.position.y = .36; head.add(t1); const t2 = cyl(.27, .27, .03, hm(0x1d1d26), { px: 3 }); t2.position.y = .2; head.add(t2); const t3 = cyl(.165, .165, .05, hm(0xc8323a), { px: 0 }); t3.position.y = .24; head.add(t3); }
  if (hat === 'bowler') { const b1 = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI * .5), hm(0x3a2a22)); b1.scale.set(.25, .22, .25); b1.position.y = .17; b1.castShadow = true; ink(b1, 3); head.add(b1); const b2 = cyl(.29, .29, .025, hm(0x3a2a22), { px: 3 }); b2.position.y = .16; head.add(b2); }
  if (hat === 'straw') { const s1 = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI * .5), hm(0xe8c870)); s1.scale.set(.26, .17, .26); s1.position.y = .19; s1.castShadow = true; ink(s1, 3); head.add(s1); const s2 = cyl(.44, .44, .02, hm(0xe8c870), { px: 3 }); s2.position.y = .17; head.add(s2); const s3 = cyl(.262, .262, .04, hm(0xc8323a), { px: 0 }); s3.position.y = .2; head.add(s3); }
  if (hat === 'hair' && hairStyle === 'long') { const lh = ell(.3, .42, .2, hm(hair), { px: 3 }); lh.position.set(0, -.18, -.12); head.add(lh); }
  if (hat === 'hair' && hairStyle === 'bun') { const bn = ell(.1, .1, .1, hm(hair), { px: 3 }); bn.position.set(0, .3, -.1); head.add(bn); }
  g.scale.setScalar(s); g.userData = { mouth: mood === 'shock' ? null : mouth, talkMouth, eyes, body, head, legL: legs[0], legR: legs[1], armR: arms[0], armL: arms[1], torso };
  return g;
}
export function pose(g, { walk = 0, arms = 'swing', lean = .07, bounce = .05, legs = 'walk', tilt = 0, blink = 0, talk = 0 } = {}) {
  const u = g.userData, sn = Math.sin(walk);
  if (u.mouth) { u.talkMouth.visible = talk > 0; u.mouth.visible = !(talk > 0); if (talk > 0) u.talkMouth.scale.set(.045, .008 + .04 * talk, .015); }
  for (const e of u.eyes) e.scale.y = e.userData.base * (1 - .92 * blink);
  if (legs === 'walk') { u.legL.rotation.x = sn * .6; u.legR.rotation.x = -sn * .6; }
  else if (legs === 'sit') { u.legL.rotation.x = u.legR.rotation.x = -1.45; }
  else if (legs === 'jump') { u.legL.rotation.x = -.5; u.legR.rotation.x = .4; u.legL.rotation.z = -.35; u.legR.rotation.z = .35; }
  u.armL.rotation.set(0, 0, 0); u.armR.rotation.set(0, 0, 0);
  if (arms === 'swing') { u.armL.rotation.x = -sn * .55; u.armR.rotation.x = sn * .55; u.armL.rotation.z = .1; u.armR.rotation.z = -.1; }
  else if (arms === 'up') { u.armL.rotation.z = 2.55; u.armR.rotation.z = -2.55; u.armL.rotation.x = -.2; u.armR.rotation.x = -.2; }
  else if (arms === 'side') { u.armL.rotation.z = 1.25; u.armR.rotation.z = -1.25; }
  else if (arms === 'rope') { u.armL.rotation.z = .45; u.armR.rotation.z = -.45; u.armL.rotation.x = -.5; u.armR.rotation.x = -.5; }
  u.body.position.y = Math.abs(sn) * bounce * (legs === 'walk' ? 1 : 0); u.body.rotation.x = lean; g.rotation.z = tilt;
}

/* ------------------------------------------------------------------ post stack */
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uSat: { value: 1.15 }, uLift: { value: .04 }, uLiftCol: { value: new THREE.Vector3(1, .8, .8) }, uVig: { value: .3 }, uCon: { value: 1.08 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uSat,uLift,uVig,uCon; uniform vec3 uLiftCol; varying vec2 vUv;
    void main(){ vec3 c = texture2D(tDiffuse,vUv).rgb; float l = dot(c,vec3(.2126,.7152,.0722));
      c = mix(vec3(l),c,uSat); c = (c-.5)*uCon+.5; c = c*(1.0-uLift)+uLiftCol*uLift;
      vec2 q = (vUv-.5)*vec2(1.0,.8); c *= 1.0-uVig*smoothstep(.28,.85,length(q)); gl_FragColor = vec4(clamp(c,0.,1.),1.0); }`,
};

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(45, W / H, 0.3, 1400);
  const target = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  const rp = new RenderPass(scene, camera); composer.addPass(rp);
  const bokeh = new BokehPass(scene, camera, { focus: 10, aperture: 0.0004, maxblur: 0.012 }); composer.addPass(bokeh);
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), .2, .6, .92); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader); composer.addPass(grade);
  return { renderer, scene, camera, composer, bokeh, bloom, grade };
}
