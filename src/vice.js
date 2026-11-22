// vice.js - original "neon seaside city" world: street, palms, pastel buildings, cars, bus, rooms. All code-built.
import {
  THREE, LIGHTS, sunDir, rng, toon, flat, box, cyl, ell, mesh, ink, canvasTex, inkUniforms,
  texPlanks, texStone, texPlaster, texWater, makeSky, makeClouds, makeSunRays,
} from './toonkit.js';

const css = (n) => '#' + n.toString(16).padStart(6, '0');
const rep = (tex, x, y) => { const t = tex.clone(); t.repeat.set(x, y); t.needsUpdate = true; return t; };

/* ---------- extra light moods ---------- */
LIGHTS.dawn = { sun: 0xffc890, sunI: 3.0, az: 100, el: 14, hemiSky: 0xffc8e0, hemiGnd: 0xffd8b4, hemiI: 1.45, fog: 0xffcab4, fogN: 40, fogF: 420,
  skyTop: 0x5a8fd8, skyHor: 0xffcaa0, cloud: 0xffffff, sat: 1.2, lift: 0.04, liftCol: [1, .7, .8], vig: .3, bloom: .25, glow: .9, cloudCols: [0xfff0dc, 0xffc0b0, 0xb08ac0], rays: .4 };
LIGHTS.room = { sun: 0xffe0bc, sunI: 2.3, az: 40, el: 38, hemiSky: 0xffd8ec, hemiGnd: 0xe8c0a8, hemiI: 1.25, fog: 0xffd0c0, fogN: 40, fogF: 420,
  skyTop: 0x6aa0e8, skyHor: 0xffd0b0, cloud: 0xffffff, sat: 1.15, lift: 0.03, liftCol: [1, .78, .8], vig: .3, bloom: .08, glow: .5, rays: .15 };
LIGHTS.vice = { sun: 0xff7a3a, sunI: 3.8, az: 90, el: 7, hemiSky: 0xff9ad0, hemiGnd: 0xffb890, hemiI: 2.0, fog: 0xff8fb0, fogN: 35, fogF: 360,
  skyTop: 0x4a2a9c, skyHor: 0xff7aa0, cloud: 0xffffff, sat: 1.25, lift: 0.05, liftCol: [1, .5, .8], vig: .38, bloom: .4, glow: 1.2, cloudCols: [0xffc0d0, 0xff7aa8, 0x5a3a9a], rays: .6 };

/* ---------- small helpers ---------- */
export function signTex(text, bg = '#ff3d8b', fg = '#fff6e0', w = 512, h = 160) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = fg; g.font = `bold ${Math.min(96, 640 / Math.max(5, text.length) * 1.5)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4);
  });
}
const sign = (text, w, h, bg, fg) => box(w, h, .12, flat(0xffffff, { map: signTex(text, bg, fg) }), { px: 2.4, shadow: false });

export function addTie(c, col = 0xd8283c) {
  const t = box(.07, .34, .02, flat(col), { px: 1.4, shadow: false }); t.position.set(0, .96, .232); c.userData.body.add(t);
  const k = box(.1, .07, .03, flat(col), { px: 1.4, shadow: false }); k.position.set(0, 1.14, .222); c.userData.body.add(k);
}
export function addShades(c) {
  const h = c.userData.head, m = flat(0x0e0c16);
  const b = box(.3, .075, .05, m, { px: 1.2, shadow: false }); b.position.set(0, .035, .252); h.add(b);
  for (const s of [-1, 1]) { const l = ell(.07, .055, .03, m, { px: 1.2, shadow: false }); l.position.set(s * .105, .03, .255); h.add(l); }
}
export function point(c, ang = 0) { const u = c.userData; u.armR.rotation.set(-1.45, 0, -.05 + ang); }

/* ---------- palm tree ---------- */
export function palm(seed = 1, s = 1) {
  const r = rng(seed * 31 + 5), g = new THREE.Group(), bark = toon(0xb98a5e), n = 6; let x = 0, y = 0;
  for (let i = 0; i < n; i++) { const seg = cyl(.2 - i * .018, .24 - i * .018, 1.35, bark, { px: 2.6 }, 10); seg.position.set(x, y + .67, 0); seg.rotation.z = -.07 * (i + 1) * (seed % 2 ? 1 : -1) * .6; g.add(seg); x += .09 * (seed % 2 ? 1 : -1); y += 1.3; }
  const top = new THREE.Group(); top.position.set(x, y + .1, 0); g.add(top);
  const cols = [0x3fae5a, 0x2f8f4e, 0x58c46a];
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2 + r() * .3, f = new THREE.Group(); f.rotation.y = a;
    const leaf = ell(1.55, .05, .38, toon(cols[i % 3]), { px: 2.4 }); leaf.position.x = 1.35; leaf.rotation.z = -.28; f.add(leaf);
    const tip = ell(.7, .045, .26, toon(cols[(i + 1) % 3]), { px: 2 }); tip.position.set(2.65, -.35, 0); tip.rotation.z = -.6; f.add(tip);
    top.add(f);
  }
  for (let i = 0; i < 3; i++) { const c = ell(.14, .14, .14, toon(0x7a4a2a), { px: 2 }); c.position.set(Math.cos(i * 2.1) * .25, -.18, Math.sin(i * 2.1) * .25); top.add(c); }
  g.scale.setScalar(s); return g;
}

/* ---------- pastel deco building (front faces +z) ---------- */
const PASTEL = [0xff9ec4, 0x5fd8c8, 0xffe08a, 0xb89cff, 0xff8a70, 0x9af0c0, 0xfff3e6, 0x8ac8ff];
const NAMES = ['PALM HOTEL', 'CAFE LUNA', 'DINER', 'MOTEL 7', 'NEON BAR', 'PIZZA', 'ARCADE', 'SUNSET INN', 'TACO', 'SALON'];
const NEON = [['#ff3d8b', '#fff6e0'], ['#13c4d6', '#fff6e0'], ['#7a3dff', '#ffe0f8'], ['#ff9a1f', '#2a1030']];
export function deco(o = {}) {
  const { w = 10, h = 12, d = 8, color = 0xff9ec4, seed = 1, name = 'CAFE', lit = true } = o, r = rng(seed * 13 + 3), g = new THREE.Group();
  const body = box(w, h, d, toon(0xffffff, rep(texPlaster(css(color), seed), w / 5, h / 5)), { px: 3 }); body.position.y = h / 2; g.add(body);
  const roof = box(w + .5, .5, d + .5, toon(0xfff3e6), { px: 3 }); roof.position.y = h + .25; g.add(roof);
  const band = box(w + .1, .55, .1, toon(0x2a2a48), { px: 1.8 }); band.position.set(0, h - 1.2, d / 2 + .04); g.add(band);
  const stripe = box(w + .1, .35, .1, flat(NEON[seed % 4][0] ? new THREE.Color(NEON[seed % 4][0]) : 0xffffff), { px: 0, shadow: false }); stripe.position.set(0, h - .6, d / 2 + .06); g.add(stripe);
  const cols = Math.max(2, Math.round(w / 2.6)), fl = Math.max(1, Math.floor((h - 4) / 2.8));
  for (let f = 0; f < fl; f++) for (let c = 0; c < cols; c++) {
    const x = (c - (cols - 1) / 2) * (w / cols), y = 4.6 + f * 2.8, on = lit && r() > .35;
    const fr = box(1.5, 1.8, .1, toon(0xfff3e6), { px: 2, shadow: false }); fr.position.set(x, y, d / 2 + .03); g.add(fr);
    const gl = box(1.2, 1.5, .1, on ? flat(0xffe08a) : toon(0x5a78a8, null, { emissive: 0x12203a }), { px: 0, shadow: false }); gl.position.set(x, y, d / 2 + .09); g.add(gl);
  }
  const door = box(1.8, 2.6, .12, toon(0x2a2a48), { px: 2.4, shadow: false }); door.position.set(w * .22, 1.3, d / 2 + .05); g.add(door);
  const aw = box(w * .5, .35, 1.7, toon([0xff3d8b, 0x13c4d6, 0xffa01f][seed % 3]), { px: 2.6 }); aw.position.set(-w * .2, 3.1, d / 2 + .85); aw.rotation.x = .25; g.add(aw);
  const nm = NEON[(seed + 1) % 4], sg = sign(name, Math.min(w * .6, 5.2), 1.15, nm[0], nm[1]); sg.position.set(-w * .2, 3.9, d / 2 + .2); g.add(sg);
  const shop = box(w * .5, 2.2, .1, toon(0x9fe8ff, null, { emissive: 0x1a3a50 }), { px: 2, shadow: false }); shop.position.set(-w * .2, 1.4, d / 2 + .04); g.add(shop);
  return g;
}

/* ---------- vehicles ---------- */
export function car(o = {}) {
  const { color = 0xff5fa2, trim = 0xfff3e6, taxi = false, police = false } = o, g = new THREE.Group(), mb = toon(color), mt = toon(trim), dk = toon(0x1c1826);
  const low = box(4.4, .72, 1.9, mb, { px: 3 }); low.position.y = .72; g.add(low);
  const hood = box(1.5, .3, 1.8, mb, { px: 3 }); hood.position.set(1.45, 1.22, 0); g.add(hood);
  const trunk = box(1.3, .3, 1.8, mb, { px: 3 }); trunk.position.set(-1.55, 1.22, 0); g.add(trunk);
  const seat = box(.5, .62, 1.5, toon(0xfff3e6), { px: 2.4 }); seat.position.set(-.85, 1.35, 0); g.add(seat);
  const bk = box(.18, .8, 1.5, toon(0xfff3e6), { px: 2.4 }); bk.position.set(-1.1, 1.5, 0); g.add(bk);
  const fseat = box(.45, .5, 1.5, toon(0xfff3e6), { px: 2.4 }); fseat.position.set(.15, 1.3, 0); g.add(fseat);
  const wsh = box(.07, .75, 1.75, toon(0xbfeaff, null, { transparent: true, opacity: .55 }), { px: 2.4, shadow: false }); wsh.position.set(.85, 1.65, 0); wsh.rotation.z = -.4; g.add(wsh);
  const frame = box(.09, .09, 1.85, mt, { px: 2 }); frame.position.set(.97, 1.98, 0); frame.rotation.z = -.4; g.add(frame);
  for (const sz of [-1, 1]) { const st = box(4.3, .13, .04, mt, { px: 0 }); st.position.set(0, .88, sz * .96); g.add(st); }
  for (const sx of [-1, 1]) { const bp = box(.16, .2, 1.95, mt, { px: 2.4 }); bp.position.set(sx * 2.25, .5, 0); g.add(bp); }
  for (const sz of [-1, 1]) { const hl = ell(.12, .13, .13, flat(0xfff2b0), { px: 1.6, shadow: false }); hl.position.set(2.2, .95, sz * .65); g.add(hl); const tl = ell(.08, .1, .15, flat(0xff2a3a), { px: 1.6, shadow: false }); tl.position.set(-2.2, .95, sz * .7); g.add(tl); }
  const wheels = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const wg = new THREE.Group(); wg.position.set(sx * 1.4, .44, sz * .98);
    const t = cyl(.44, .44, .32, dk, { px: 2.6 }, 18); t.rotation.x = Math.PI / 2; wg.add(t);
    const hub = cyl(.22, .22, .34, mt, { px: 1.6 }, 12); hub.rotation.x = Math.PI / 2; wg.add(hub);
    const sp = box(.08, .5, .36, dk, { px: 0 }); wg.add(sp); g.add(wg); wheels.push(wg);
  }
  g.userData = { wheels, spin(a) { for (const w of wheels) w.rotation.z = -a; } };
  if (taxi) {
    const ck = box(.1, .16, 1.9, toon(0x1c1826), { px: 0 }); ck.position.set(0, 1.0, 0); ck.visible = false;
    const sg = box(.5, .36, 1.1, flat(0xffffff, { map: signTex('TAXI', '#ffd21f', '#1c1826', 256, 128) }), { px: 2.4 }); sg.position.set(-1.7, 1.55, 0); g.add(sg);
    for (let i = 0; i < 9; i++) { const c = box(.3, .12, .03, i % 2 ? flat(0x1c1826) : flat(0xffffff), { px: 0 }); c.position.set(-1.9 + i * .3, .72, .965); g.add(c); const c2 = c.clone(); c2.position.z = -.965; g.add(c2); }
  }
  if (police) {
    const mid = box(1.5, .55, .03, toon(0xfff3e6), { px: 0 }); mid.position.set(0, .7, .97); g.add(mid); const mid2 = mid.clone(); mid2.position.z = -.97; g.add(mid2);
    const post = box(.12, .3, .9, dk, { px: 2 }); post.position.set(-1.1, 1.85, 0); g.add(post);
    const lr = box(.28, .2, .5, flat(0xff2030), { px: 1.8, shadow: false }); lr.position.set(-1.1, 2.05, .27); g.add(lr);
    const lb = box(.28, .2, .5, flat(0x2a5cff), { px: 1.8, shadow: false }); lb.position.set(-1.1, 2.05, -.27); g.add(lb);
    g.userData.lights = (t) => { const k = Math.floor(t * 7) % 2; lr.material.color.set(k ? 0xff2030 : 0x40101a); lb.material.color.set(k ? 0x101a40 : 0x2a8cff); };
  }
  return g;
}
export function seatIn(c, car, which = 'driver') { const p = { driver: [-.15, 1.0, -.45], pass: [-.15, 1.0, .45], back: [-1.35, 1.1, -.45], back2: [-1.35, 1.1, .45] }[which]; c.position.set(...p); c.rotation.y = Math.PI / 2; car.add(c); }

export function bus() {
  const g = new THREE.Group(), teal = toon(0x2fc4b8), pink = toon(0xff5fa2), cream = toon(0xfff3e6), dk = toon(0x1c1826);
  const L = 8.4, Wd = 2.9;
  const fl = box(L, .22, Wd, toon(0x6a5a78), { px: 3 }); fl.position.y = .95; g.add(fl);
  const roof = box(L + .2, .3, Wd + .2, cream, { px: 3 }); roof.position.y = 3.95; g.add(roof);
  const back = box(L, 1.0, .14, teal, { px: 3 }); back.position.set(0, 1.55, -Wd / 2); g.add(back);
  const win = box(L, 1.2, .08, toon(0xbfeaff, null, { emissive: 0x24546a }), { px: 2.4, shadow: false }); win.position.set(0, 2.75, -Wd / 2 + .02); g.add(win);
  const topb = box(L, .5, .14, teal, { px: 3 }); topb.position.set(0, 3.65, -Wd / 2); g.add(topb);
  const front = box(.16, 2.6, Wd, teal, { px: 3 }); front.position.set(L / 2, 2.25, 0); g.add(front);
  const ws = box(.1, 1.3, Wd - .3, toon(0xbfeaff, null, { emissive: 0x24546a }), { px: 2.4, shadow: false }); ws.position.set(L / 2 + .02, 2.9, 0); g.add(ws);
  const rear = box(.16, 2.6, Wd, teal, { px: 3 }); rear.position.set(-L / 2, 2.25, 0); g.add(rear);
  for (const x of [-L / 2, L / 2, -1.4, 1.6]) { const p = cyl(.07, .07, 2.9, cream, { px: 2.4 }, 8); p.position.set(x, 2.5, Wd / 2); g.add(p); }
  const hd = sign('VICE BUS', 5.2, .6, '#ff3d8b', '#fff6e0'); hd.position.set(0, 3.7, Wd / 2 + .05); g.add(hd);
  const sk = box(L, .55, .14, pink, { px: 3 }); sk.position.set(0, .7, Wd / 2); g.add(sk);
  for (let i = 0; i < 3; i++) { const s = box(.9, .5, 1.1, toon([0xff9ec4, 0xffe08a, 0x9af0c0][i]), { px: 2.4 }); s.position.set(-2.6 + i * 1.7, 1.3, -Wd / 2 + .65); g.add(s); const sb = box(.9, .7, .18, toon([0xff9ec4, 0xffe08a, 0x9af0c0][i]), { px: 2.4 }); sb.position.set(-2.6 + i * 1.7, 1.8, -Wd / 2 + .15); g.add(sb); }
  const bar = cyl(.05, .05, L - .6, cream, { px: 2 }, 8); bar.rotation.z = Math.PI / 2; bar.position.set(0, 3.5, .2); g.add(bar);
  const wheels = [];
  for (const sx of [-2.7, 2.7]) for (const sz of [-1, 1]) { const w = cyl(.62, .62, .4, dk, { px: 2.8 }, 18); w.rotation.x = Math.PI / 2; w.position.set(sx, .62, sz * 1.15); g.add(w); const hb = cyl(.3, .3, .42, cream, { px: 1.6 }, 12); hb.rotation.x = Math.PI / 2; hb.position.copy(w.position); g.add(hb); }
  return g;
}

/* ---------- rooms ---------- */
function windowTex(kind) {
  return canvasTex(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    if (kind === 'sunrise') { gr.addColorStop(0, '#6aa0ff'); gr.addColorStop(.55, '#ffc4a0'); gr.addColorStop(1, '#ff9aa8'); } else { gr.addColorStop(0, '#7ec0ff'); gr.addColorStop(1, '#d8efff'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (kind === 'sunrise') { g.fillStyle = '#fff2b0'; g.beginPath(); g.arc(w * .55, h * .66, 36, 0, 7); g.fill(); g.fillStyle = '#ff7aa0'; g.fillRect(0, h * .74, w, h * .26); }
    g.fillStyle = kind === 'sunrise' ? '#3a2a6a' : '#6a8ab8'; const hs = [60, 90, 50, 110, 70, 95]; hs.forEach((hh, i) => g.fillRect(i * 44 + 4, h - hh - 18, 38, hh + 18));
    g.fillStyle = '#ffe9a0'; if (kind !== 'sunrise') for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i * 5 + j * 3) % 3) g.fillRect(i * 44 + 12, h - 110 + j * 20, 8, 10);
  });
}
export function room(kind) {
  const g = new THREE.Group(), office = kind === 'office';
  const wallC = office ? 0xb8dcc8 : 0xf2a0c0, floorMat = office ? toon(0x5a6a98) : toon(0xffffff, rep(texPlanks('#d9a566', 4), 3, 2.4));
  const fl = box(9.4, .3, 7.4, floorMat, { px: 3 }); fl.position.y = -.15; g.add(fl);
  const bw = box(9.4, 4.4, .3, toon(0xffffff, rep(texPlaster(css(wallC), 3), 2, 1)), { px: 3 }); bw.position.set(0, 2.2, -3.55); g.add(bw);
  const lw = box(.3, 4.4, 7.4, toon(0xffffff, rep(texPlaster(css(wallC), 4), 1.5, 1)), { px: 3 }); lw.position.set(-4.55, 2.2, 0); g.add(lw);
  const bb = box(9, .35, .1, toon(0xfff3e6), { px: 2 }); bb.position.set(0, .18, -3.37); g.add(bb);
  const bl = box(.1, .35, 7, toon(0xfff3e6), { px: 2 }); bl.position.set(-4.37, .18, 0); g.add(bl);
  const fr = box(2.9, 2.5, .14, toon(0xfff3e6), { px: 3 }); fr.position.set(office ? -1.2 : 2.2, 2.6, -3.38); g.add(fr);
  const wn = box(2.5, 2.1, .1, flat(0xffffff, { map: windowTex(office ? 'day' : 'sunrise') }), { px: 0, shadow: false }); wn.position.set(office ? -1.2 : 2.2, 2.6, -3.3); g.add(wn);
  const mu = box(.1, 2.1, .12, toon(0xfff3e6), { px: 1.6 }); mu.position.set(office ? -1.2 : 2.2, 2.6, -3.26); g.add(mu);
  if (!office) {
    const bed = box(2.7, .6, 4.2, toon(0x7a4a8a), { px: 3 }); bed.position.set(-2.6, .3, -1.4); g.add(bed);
    const mat = box(2.5, .24, 4.0, toon(0xfff3e6), { px: 2.4 }); mat.position.set(-2.6, .72, -1.4); g.add(mat);
    const hb = box(2.8, 1.5, .2, toon(0x7a4a8a), { px: 3 }); hb.position.set(-2.6, 1.0, -3.4); g.add(hb);
    const pl = ell(.6, .18, .35, toon(0xffffff), { px: 2.4 }); pl.position.set(-2.6, 1.0, -3.0); g.add(pl);
    const bk = box(2.55, .5, 2.2, toon(0x13c4d6), { px: 3 }); bk.position.set(-2.6, 1.0, -.5); g.add(bk);
    const bk2 = box(2.57, .14, 2.2, toon(0xfff3e6), { px: 2 }); bk2.position.set(-2.6, 1.33, -.5); g.add(bk2);
    const ns = box(1, .9, 1, toon(0xc2864a), { px: 3 }); ns.position.set(.1, .45, -3.0); g.add(ns);
    const ck = new THREE.Group(); ck.position.set(.1, 1.15, -3.0); g.add(ck);
    const cb = box(.55, .38, .3, toon(0xff3a4a), { px: 2.4 }); cb.position.y = .19; ck.add(cb);
    for (const s of [-1, 1]) { const bell = ell(.12, .08, .08, toon(0xffd84a), { px: 2 }); bell.position.set(s * .2, .42, 0); ck.add(bell); }
    const face = ell(.16, .16, .04, flat(0xfff3e6), { px: 1.4, shadow: false }); face.position.set(0, .2, .16); ck.add(face);
    g.userData.clock = ck;
    const wd = box(1.0, 3.4, 2.4, toon(0xc2864a), { px: 3 }); wd.position.set(-4.0, 1.7, 1.8); g.add(wd);
    for (const s of [-1, 1]) { const dr = box(.06, 3.0, 1.1, toon(0xd89a5a), { px: 2.4 }); dr.position.set(-3.47, 1.7, 1.8 + s * .6); g.add(dr); const kn = ell(.05, .05, .05, toon(0xffd84a), { px: 1 }); kn.position.set(-3.42, 1.7, 1.8 + s * .12); g.add(kn); }
    const rug = cyl(1.2, 1.2, .04, toon(0xff7aa8), { px: 2 }, 28); rug.scale.set(1.3, 1, 1); rug.position.set(.6, .02, -.2); g.add(rug);
    const lamp = cyl(.05, .08, 1.4, toon(0x3a3550), { px: 2 }, 8); lamp.position.set(3.7, .7, -2.9); g.add(lamp); const sh = cyl(.2, .35, .4, toon(0xffe08a), { px: 2.4 }, 14); sh.position.set(3.7, 1.55, -2.9); g.add(sh);
  } else {
    const dk = box(2.8, .22, 1.4, toon(0xa66a3a), { px: 3 }); dk.position.set(.4, 1.3, -.5); g.add(dk);
    for (const sx of [-1, 1]) { const lg = box(.22, 1.2, 1.4, toon(0x8a5430), { px: 2.4 }); lg.position.set(.4 + sx * 1.2, .6, -.5); g.add(lg); }
    const fr2 = box(2.5, 1.0, .12, toon(0x8a5430), { px: 2.4 }); fr2.position.set(.4, 1.0, .25); g.add(fr2);
    const chair = box(1.1, .3, 1.1, toon(0xc8323a), { px: 3 }); chair.position.set(.5, .9, -2.3); g.add(chair);
    const cb = box(1.1, 1.8, .22, toon(0xc8323a), { px: 3 }); cb.position.set(.5, 1.7, -2.85); g.add(cb);
    const cs = cyl(.08, .08, .6, toon(0x3a3550), { px: 2 }, 8); cs.position.set(.5, .5, -2.3); g.add(cs);
    const np = box(.9, .2, .1, toon(0xffd84a), { px: 2 }); np.position.set(.4, 1.5, .0); np.rotation.x = -.5; g.add(np);
    const lp = box(.9, .06, .6, toon(0x9aa0b8), { px: 2 }); lp.position.set(-.6, 1.44, -.5); g.add(lp); const sc = box(.9, .6, .06, toon(0x2a3050, null, { emissive: 0x1a2a50 }), { px: 2 }); sc.position.set(-.6, 1.78, -.85); sc.rotation.x = -.15; g.add(sc);
    for (let i = 0; i < 3; i++) { const p = box(.6, .03, .8, toon(0xffffff), { px: 1.4 }); p.position.set(1.3 + i * .07, 1.43 + i * .03, -.4 + i * .05); p.rotation.y = .3 * i; g.add(p); }
    const fc = box(1.1, 2.0, .9, toon(0x8a96b8), { px: 3 }); fc.position.set(-3.8, 1.0, -2.8); g.add(fc);
    for (let i = 0; i < 3; i++) { const dr = box(.9, .5, .06, toon(0xaab4d0), { px: 1.8 }); dr.position.set(-3.8, .4 + i * .62, -2.33); g.add(dr); }
    const pot = cyl(.3, .24, .5, toon(0xc2693e), { px: 2.4 }, 14); pot.position.set(3.7, .25, -2.8); g.add(pot);
    for (let i = 0; i < 6; i++) { const lf = ell(.14, .5, .08, toon(0x3fae5a), { px: 2 }); lf.position.set(3.7 + Math.cos(i) * .18, .9, -2.8 + Math.sin(i) * .18); lf.rotation.set(Math.sin(i) * .5, 0, Math.cos(i) * .5); g.add(lf); }
    const clk = cyl(.45, .45, .08, toon(0xfff3e6), { px: 2.4 }, 24); clk.rotation.x = Math.PI / 2; clk.position.set(2.6, 3.4, -3.35); g.add(clk);
    const h1 = box(.04, .3, .02, flat(0x1c1826), { px: 0 }); h1.position.set(2.6, 3.52, -3.28); g.add(h1); const h2 = box(.04, .22, .02, flat(0x1c1826), { px: 0 }); h2.position.set(2.68, 3.4, -3.28); h2.rotation.z = -1.5; g.add(h2);
    const ps = box(1.1, 1.5, .06, flat(0xffffff, { map: signTex('MONDAY', '#ff3d8b', '#fff6e0', 256, 256) }), { px: 2 }); ps.position.set(-3.1, 3.0, -3.35); g.add(ps);
    const rg = box(4.4, .04, 3.0, toon(0x6a78b8), { px: 2 }); rg.position.set(.4, .03, 1.2); g.add(rg);
  }
  return g;
}

/* ---------- world builder ---------- */
export function buildVice(stage, lightName, { sunAz, sunEl, seed = 7, kind = 'street', clear = [] } = {}) {
  const { scene, bloom, grade } = stage;
  const skip = (x, z) => clear.some((c) => Math.hypot(x - c[0], z - c[1]) < c[2]);
  for (const c of [...scene.children]) scene.remove(c);
  const L = LIGHTS[lightName], r = rng(seed), sd = sunDir(sunAz ?? L.az, sunEl ?? L.el);
  scene.background = null; scene.fog = new THREE.Fog(L.fog, L.fogN, L.fogF); inkUniforms.uFog.value.set(L.fog);
  scene.add(new THREE.HemisphereLight(L.hemiSky, L.hemiGnd, L.hemiI));
  const sun = new THREE.DirectionalLight(L.sun, L.sunI); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06; scene.add(sun); scene.add(sun.target);
  scene.add(makeSky(L, sd)); scene.add(makeClouds(L, seed + 3)); scene.add(makeSunRays(L, sd));
  grade.uniforms.uSat.value = L.sat; grade.uniforms.uLift.value = L.lift; grade.uniforms.uLiftCol.value.set(...L.liftCol); grade.uniforms.uVig.value = L.vig; bloom.strength = L.bloom;
  const wt = rep(texWater(kind === 'street' ? '#ff9ac0' : '#4a9fd8', 8), 60, 60);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), toon(0xffffff, wt, { emissive: kind === 'street' ? 0x6a2a50 : 0x0b2f55 })); water.rotation.x = -Math.PI / 2; water.position.y = -.5; water.receiveShadow = true; scene.add(water);
  const world = { scene, L, sun, sunDirection: sd, water, wt };
  if (kind === 'street') {
    const road = box(560, .4, 12, toon(0x4a4458), { px: 0 }); road.position.set(80, -.2, 0); scene.add(road);
    for (let x = -190; x < 330; x += 5) { const d = box(2.4, .03, .22, flat(0xfff2b0), { px: 0, shadow: false }); d.position.set(x, .02, 0); scene.add(d); }
    for (const sz of [-1, 1]) {
      const sw = box(560, .3, 7, toon(0xffd0dc), { px: 0 }); sw.position.set(80, .0, sz * 9.5); scene.add(sw);
      const cb = box(560, .34, .5, toon(0xfff3e6), { px: 0 }); cb.position.set(80, .02, sz * 6.2); scene.add(cb);
      const edge = box(560, .02, .2, flat(0xffffff), { px: 0, shadow: false }); edge.position.set(80, .02, sz * 5.4); scene.add(edge);
      let x = -190, i = 0;
      while (x < 270) {
        const w = 8 + r() * 6, h = 8 + r() * 12, d = 8, b = deco({ w, h, d, color: PASTEL[(i + (sz > 0 ? 3 : 0)) % PASTEL.length], seed: i + (sz > 0 ? 40 : 0) + 1, name: NAMES[(i * 3 + (sz > 0 ? 1 : 0)) % NAMES.length] });
        b.position.set(x + w / 2, 0, sz * (13.4 + d / 2)); if (sz > 0) b.rotation.y = Math.PI; scene.add(b); x += w + .6 + r() * 1.2; i++;
      }
      for (let x2 = -184, k = 0; x2 < 270; x2 += 11 + (k % 3) * 2.5, k++) { const p = palm(k + 1 + (sz > 0 ? 7 : 0), .95 + r() * .35); p.position.set(x2, .15, sz * 7.8); if (!skip(x2, sz * 7.8)) scene.add(p); }
      for (let x2 = -170; x2 < 270; x2 += 30) { const lp = new THREE.Group(); const pl = cyl(.08, .1, 4.4, toon(0x3a3550), { px: 2.4 }, 8); pl.position.y = 2.2; lp.add(pl); const hd = ell(.3, .26, .3, flat(0xfff2b0), { px: 2.4, shadow: false }); hd.position.y = 4.55; lp.add(hd); lp.position.set(x2, .15, sz * 6.8); scene.add(lp); }
    }
  } else {
    const gp = box(900, .3, 900, toon(0x7fd8c8), { px: 0 }); gp.position.set(0, -.45, 0); scene.add(gp);
    const rm = room(kind); scene.add(rm); world.room = rm;
  }
  return world;
}
