// shots_vice.js - "One normal day in Vice City" shots. Original cast: Danny (hero), Rex (boss), Slick (car thief), Bertha (bus driver), Gus (angry passenger), Lola (taxi customer), Officer Maddox.
import { THREE, makeCharacter, pose, toon, flat, box, ell, cyl } from './toonkit.js';
import { star } from './world.js';
import { car, bus, seatIn, addTie, addShades, point, palm } from './vice.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const bl = (t, i) => ((t * .9 + i * .37) % 2.4 < .13 ? 1 : 0);
const g0 = (w) => { const g = new THREE.Group(); w.scene.add(g); return g; };
const ease = (p) => { p = Math.min(1, Math.max(0, p)); return p * p * (3 - 2 * p); };

const cast = {
  danny: (o = {}) => { const c = makeCharacter({ s: .95, coat: 0x4c8ad8, trim: 0xffffff, pants: 0x2a2f55, hat: 'hair', hair: 0x4a2c1c, skin: 0xe8aa80, belts: false, mood: 'smile', boot: 0x3a2a2a, cuffs: false, ...o }); addTie(c); return c; },
  rex: (o = {}) => { const c = makeCharacter({ s: 1, fat: 1.25, coat: 0x3a3a52, trim: 0xffffff, pants: 0x2a2a3a, hat: 'bowler', moustache: 0x2a1c14, skin: 0xd89a72, belts: false, mood: 'angry', cuffs: false, ...o }); addTie(c, 0xffc83a); return c; },
  slick: (o = {}) => { const c = makeCharacter({ s: .9, coat: 0x22222c, trim: 0xffd84a, pants: 0x22222c, hat: 'cap', skin: 0xc98a62, belts: false, mood: 'smirk', cuffs: false, ...o }); addShades(c); return c; },
  bertha: (o = {}) => { const c = makeCharacter({ s: 1, fat: 1.2, coat: 0x1f9a90, trim: 0xfff3e6, pants: 0x234a58, hat: 'cap', skin: 0xc98a62, belts: false, mood: 'angry', cuffs: false, ...o }); return c; },
  gus: (o = {}) => { const c = makeCharacter({ s: .95, fat: 1.1, coat: 0xff6a8a, trim: 0xfff3e6, pants: 0x3fc4b8, hat: 'straw', moustache: 0x4a2e20, skin: 0xf6c49c, belts: false, mood: 'angry', cuffs: false, ...o }); return c; },
  lola: (o = {}) => { const c = makeCharacter({ s: .92, coat: 0xa04ae0, trim: 0xfff3e6, pants: 0x3a2a5a, hat: 'hair', hairStyle: 'long', hair: 0xf0d060, dress: true, belts: false, skin: 0xf6c49c, mood: 'smirk', cuffs: false, ...o }); addShades(c); return c; },
  cop: (o = {}) => { const c = makeCharacter({ s: .92, coat: 0x2a3a8a, trim: 0xffd84a, pants: 0x1c2250, hat: 'cap', skin: 0xe8aa80, belts: false, mood: 'angry', cuffs: false, ...o }); addShades(c); return c; },
};
const speak = (t, i = 0) => .5 + .5 * Math.sin(t * 17 + i * 2);

export const VICE_SHOTS = {
  walkout: {
    world: 'vice', kind: 'street', light: 'dawn', dur: 4, sunAz: 98, sunEl: 12, clear: [[-2, 7.8, 6], [10, 7.8, 5]],
    setup(w, st, t) {
      const g = g0(w), d = cast.danny({ mood: 'smile' }); d.position.set(7.5 - t * 1.6, .3, 9.4); d.rotation.y = -Math.PI / 2 - .3; pose(d, { walk: t * 7.5, blink: bl(t, 1), lean: .06, bounce: .06 }); g.add(d);
      return { pos: V(-3.2, 1.3, 5.6), look: V(7.5, 1.9, 9.4), fov: 56, roll: .02, push: .03, birds: false, sunTarget: V(4, 0, 8), shadowSize: 30, aperture: .0006, maxblur: .01 };
    },
  },
  wake: {
    world: 'vice', kind: 'bedroom', light: 'room', dur: 3.5, sunAz: 40, sunEl: 35,
    setup(w, st, t) {
      const g = g0(w), d = cast.danny({ hat: 'hair', coat: 0xffffff, trim: 0xffe0e0, mood: t < 1.2 ? 'sad' : 'smile' }); const p = ease((t - .7) / 1.2);
      d.position.set(-2.6, .84, -2.2); d.rotation.y = .3; pose(d, { arms: p > .05 ? 'up' : 'side', legs: 'sit', lean: -.05 + .05 * p, bounce: 0, blink: t < .7 ? 1 : bl(t, 2), talk: p > 0 && p < 1 ? .9 : 0 }); g.add(d);
      const ck = w.room.userData.clock; ck.position.x = .1 + (t < .9 ? Math.sin(t * 90) * .03 : 0); ck.rotation.z = t < .9 ? Math.sin(t * 70) * .08 : 0;
      return { pos: V(4.2, 2.4, 3.6), look: V(-.6, 1.9, -2.6), fov: 56, roll: .02, push: .04, birds: false, sunTarget: V(-1, 1, -1), shadowSize: 12, aperture: .0005, maxblur: .008 };
    },
  },
  theft: {
    world: 'vice', kind: 'street', light: 'dawn', dur: 3.6, sunAz: 98, sunEl: 13,
    setup(w, st, t) {
      const g = g0(w), c = car({ color: 0x5fb4ff }); const go = Math.max(0, t - 1.1), x = 1 + 1.0 * go * go * 3.4 + (go > 0 ? go * 2 : 0);
      c.position.set(x, 0, 3.0); c.rotation.y = 0; c.userData.spin(x * 1.2); g.add(c);
      const s = cast.slick(); seatIn(s, c, 'driver'); s.position.z = -.0; pose(s, { legs: 'sit', arms: 'rope', lean: .02, bounce: 0, blink: bl(t, 3) }); const dd = cast.danny({ mood: 'shock' }); dd.position.set(-2.3, .3, 8.4); dd.rotation.y = -.5; pose(dd, { arms: 'up', legs: 'jump', lean: -.05, blink: bl(t, 0), talk: speak(t) }); g.add(dd);
      return { pos: V(-5.8, 1.9, 11.6), look: V(2.6 + go * .6, 1.5, 3.6), fov: 56, roll: .03, push: .03, birds: false, sunTarget: V(0, 0, 5), shadowSize: 32, aperture: .0007, maxblur: .01 };
    },
  },
  bus: {
    world: 'vice', kind: 'street', light: 'day', dur: 3.6, sunAz: 40, sunEl: 40,
    setup(w, st, t) {
      const g = g0(w), b = bus(); b.position.set(0, 0, 0); g.add(b);
      const dr = cast.bertha({ mood: 'angry' }); dr.position.set(3.4, 1.06, .3); dr.rotation.y = -Math.PI / 2 - .25; pose(dr, { arms: 'up', legs: 'jump', lean: 0, bounce: 0, blink: bl(t, 1), talk: speak(t) }); b.add(dr);
      const gu = cast.gus({ mood: 'angry' }); gu.position.set(1.8, 1.06, .1); gu.rotation.y = Math.PI / 2 - .2; pose(gu, { arms: 'up', legs: 'jump', lean: .04, bounce: 0, blink: bl(t, 2), talk: speak(t, 1) }); b.add(gu);
      const shake = (i) => Math.sin(t * 22 + i * 1.7) * .05;
      const d = cast.danny({ mood: 'shock' }); d.position.set(-1.2, 1.06, .7); d.rotation.y = .5; pose(d, { arms: 'up', legs: 'walk', walk: 0, lean: -.06, blink: bl(t, 0), talk: .8 }); b.add(d);
      [[-3.0, .5, 2.1, 0x9a6ad8], [-.2, -.2, -2.4, 0xff9a3a], [.8, .9, 1.2, 0x3fc4b8], [-2.0, .2, .8, 0xffd84a]].forEach(([x, z, ry, col], i) => { const p = cast.gus({ coat: col, hat: i % 2 ? 'cap' : 'none', mood: i % 2 ? 'angry' : 'shock', moustache: 0 }); p.position.set(x + shake(i), 1.06 + Math.abs(Math.sin(t * 9 + i)) * .1, z); p.rotation.y = ry + Math.sin(t * 10 + i) * .2; pose(p, { arms: 'up', legs: 'jump', lean: .06, bounce: 0, blink: bl(t, i + 3), talk: speak(t, i) }); b.add(p); });
      b.position.x = Math.sin(t * 3.2) * .05; b.rotation.z = Math.sin(t * 17) * .006;
      return { pos: V(.2, 3.3, 10.2), look: V(.2, 3.05, 0), fov: 48, roll: 0, push: .03, birds: false, sunTarget: V(0, 1, 0), shadowSize: 14, aperture: .0004, maxblur: .006 };
    },
  },
  office: {
    world: 'vice', kind: 'office', light: 'room', dur: 3.6, sunAz: 30, sunEl: 40,
    setup(w, st, t) {
      const g = g0(w), bs = cast.rex({ mood: 'angry' }); bs.position.set(.9, 0, -1.7); bs.rotation.y = -.15; pose(bs, { arms: 'up', legs: 'walk', walk: 0, lean: .08, bounce: 0, blink: bl(t, 1), talk: speak(t) }); bs.userData.armL.rotation.z = 2.2; bs.userData.armR.rotation.set(-1.5, 0, -.2); g.add(bs);
      const dn = cast.danny({ mood: 'sad' }); dn.position.set(-.5, 0, 1.2); dn.rotation.y = Math.PI - .6; pose(dn, { arms: 'side', legs: 'walk', walk: 0, lean: .1, bounce: 0, blink: bl(t, 2) }); dn.userData.armL.rotation.z = .25; dn.userData.armR.rotation.z = -.25; g.add(dn);
      return { pos: V(2.8, 2.4, 6.4), look: V(-.1, 1.8, -.5), fov: 50, roll: .02, push: .04, birds: false, sunTarget: V(0, 1, 0), shadowSize: 12, aperture: .0005, maxblur: .008 };
    },
  },
  taxi: {
    world: 'vice', kind: 'street', light: 'vice', dur: 3.8, sunAz: 90, sunEl: 7,
    setup(w, st, t) {
      const g = g0(w), v = 7, x = t * v, tx = car({ color: 0xffd21f, taxi: true }); tx.position.set(x, 0, 2.6); tx.userData.spin(x * 1.1); g.add(tx);
      const dn = cast.danny({ mood: 'smile', coat: 0xffffff }); seatIn(dn, tx, 'driver'); pose(dn, { legs: 'sit', arms: 'rope', lean: .02, bounce: 0, blink: bl(t, 1), talk: t > 1.6 ? speak(t) : 0 });
      const lo = cast.lola(); seatIn(lo, tx, 'back2'); lo.position.z = .0; lo.position.x = -1.3; pose(lo, { legs: 'sit', arms: 'rope', lean: .08, bounce: 0, blink: bl(t, 2), talk: speak(t, 1) }); lo.userData.armR.rotation.set(-1.55, 0, -.35); lo.userData.armL.rotation.set(-.4, 0, .3);
      const pc = car({ color: 0x232a6a, police: true }); pc.position.set(x + 9.5, 0, 2.6); pc.userData.spin(x * 1.1); pc.userData.lights(t); g.add(pc);
      const co = cast.cop(); seatIn(co, pc, 'driver'); pose(co, { legs: 'sit', arms: 'rope', lean: 0, bounce: 0, blink: bl(t, 4) });
      return { pos: V(x - 3.8, 2.1, 11.2), look: V(x + 1.4, 1.5, 2.6), fov: 50, roll: .03, push: .02, birds: false, sunTarget: V(x + 3, 0, 2.6), shadowSize: 35, aperture: .0007, maxblur: .01 };
    },
  },
  wanted: {
    world: 'vice', kind: 'street', light: 'vice', dur: 3.8, sunAz: 90, sunEl: 6,
    setup(w, st, t) {
      const g = g0(w), v = 8, x = 14 - t * v, tx = car({ color: 0xffd21f, taxi: true }); tx.position.set(x, 0, 1.8); tx.rotation.y = Math.PI; tx.userData.spin(-x * 1.1); g.add(tx);
      const dn = cast.danny({ mood: 'shock', coat: 0xffffff }); seatIn(dn, tx, 'driver'); pose(dn, { legs: 'sit', arms: 'up', lean: -.05, bounce: 0, blink: bl(t, 1), talk: speak(t) });
      const lo = cast.lola(); seatIn(lo, tx, 'back2'); lo.position.x = -1.3; pose(lo, { legs: 'sit', arms: 'up', lean: .05, bounce: 0, blink: bl(t, 2), talk: speak(t, 1) });
      [[x + 7, -1.2], [x + 12.5, 3.8], [x + 17, 1.0]].forEach(([cx, cz], i) => { const pc = car({ color: 0x232a6a, police: true }); pc.position.set(cx, 0, cz); pc.rotation.y = Math.PI; pc.userData.spin(-cx * 1.1); pc.userData.lights(t + i * .15); g.add(pc); const co = cast.cop(); seatIn(co, pc, 'driver'); pose(co, { legs: 'sit', arms: 'rope', lean: .02, bounce: 0, blink: bl(t, 5 + i) }); });
      for (let i = 0; i < 5; i++) { const k = ease((t - .5 - i * .28) / .25); if (k > 0) { const s1 = star(.4 * k, 0xffe45e); s1.position.set(x - 1.2, 3.9 + Math.sin(t * 6 + i) * .05, 1.8 - 2.2 + i * 1.05); s1.rotation.y = -Math.PI / 2 + .2; s1.rotation.z = Math.sin(t * 3 + i) * .15; g.add(s1); } }
      return { pos: V(-3.5, 1.9, 3.6), look: V(x * .3 - 1, 1.5, 1.8), fov: 52, roll: -.035, push: .02, birds: false, sunTarget: V(x, 0, 2), shadowSize: 40, aperture: .0007, maxblur: .01 };
    },
  },
};
