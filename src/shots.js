// shots.js - five example shots for a "bridge that fell for a song" story. Edit freely: each shot is plain code.
import { THREE, makeCharacter, pose, flat, toon, cyl, box, ell } from './toonkit.js';
import { swingSet, star } from './world.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const RED = 0xc8323a;
const hideNearRail = (w) => { for (const half of [w.br.userData.A, w.br.userData.B]) for (const c of half.children) if (c.position.z > 2.3) c.visible = false; };
const bl = (t, i) => ((t * .9 + i * .37) % 2.4 < .13 ? 1 : 0);
const g0 = (w) => { const g = new THREE.Group(); w.scene.add(g); return g; };

export const SHOTS = {
  hook: {
    light: 'day', dur: 4,
    setup(w, st, t) {
      hideNearRail(w); const g = g0(w), zs = [-.9, .9];
      for (let rk = 0; rk < 2; rk++) for (let i = 0; i < 6; i++) {
        const c = makeCharacter({ s: .95 + (i % 3) * .03, coat: RED, mood: i === 2 ? 'smirk' : 'smile', moustache: i % 2 ? 0x4a2e20 : 0, skin: [0xf6c49c, 0xe8aa80, 0xc98a62, 0xf9d2b0][(i + rk) % 4] });
        c.position.set(-3.2 + i * 1.55 + rk * .75 + t * 1.1, 5.0, zs[rk]); c.rotation.y = .5 - rk * .2; pose(c, { walk: t * 7 + i * .9 + rk * 1.7, blink: bl(t, i + rk * 6) }); g.add(c);
      }
      return { pos: V(-3, 8.2, 9.2), look: V(2.6, 6.0, 0), fov: 46, roll: 0.03, push: t * .12, sunTarget: V(0, 5, 0), shadowSize: 45, aperture: .0007, maxblur: .012 };
    },
  },
  snap: {
    light: 'day', dur: 3, sunAz: 40, sunEl: 40,
    setup(w, st, t) {
      const { A, B } = w.br.userData; B.rotation.z = .3; A.rotation.z = -.04; for (const h of w.hang) if (h.userData.hanger > 1) h.visible = false;
      hideNearRail(w); const g = g0(w);
      for (let i = 0; i < 3; i++) { const c = makeCharacter({ s: .95, coat: RED, mood: 'shock' }); c.position.set(-9 - i * 1.6 + 23 - 23 + 0, .22, i % 2 ? .8 : -.8); c.rotation.y = .5; pose(c, { walk: 0, arms: 'up', legs: 'jump', lean: -.05 }); c.position.set(17 - i * 1.7, .22, i % 2 ? .8 : -.8); A.add(c); }
      for (let i = 0; i < 3; i++) { const c = makeCharacter({ s: .95, coat: RED, mood: 'shock' }); c.position.set(-2.2 - i * 1.8, .22, i % 2 ? .8 : -.8); c.rotation.y = .1; pose(c, { arms: 'up', legs: 'jump', lean: .15 }); B.add(c); }
      const f = makeCharacter({ s: .95, coat: RED, mood: 'shock' }); f.position.set(2.5, 6.6, 0); f.rotation.y = .3; pose(f, { arms: 'up', legs: 'jump', lean: .3, tilt: .5 }); g.add(f);
      const s = star(1.25); s.position.set(.4, 6.0, 1.6); s.rotation.set(0, -.25, .2); g.add(s);
      const s2 = star(1.2, 0xffffff); s2.position.set(.4, 6.0, 1.75); s2.rotation.set(0, -.25, .5); s2.scale.setScalar(.5); g.add(s2);
      for (let i = 0; i < 6; i++) { const p = box(1.4, .12, .4, toon(0xcf9a55), { px: 3 }); p.position.set(-3 + i * 1.4, 7.5 + (i % 3) * .9, 1.5 - i * .5); p.rotation.set(i * .7, i * 1.1, i * .5); g.add(p); }
      return { pos: V(-6.5, 4.6, 11.5), look: V(0, 6.6, 0), fov: 52, roll: .08, sunTarget: V(0, 5, 0), shadowSize: 45, aperture: .0007, maxblur: .012 };
    },
  },
  river: {
    light: 'day', dur: 3, sunAz: 70, sunEl: 42,
    setup(w, st, t) {
      const { A, B } = w.br.userData; B.rotation.z = .3; A.rotation.z = -.04; for (const h of w.hang) if (h.userData.hanger > 1) h.visible = false;
      hideNearRail(w); const g = g0(w), pts = [[-3.4, 3.2], [-.9, 5.2], [1.8, 3.3], [4, 5.4], [-5.6, 5.6]];
      pts.forEach(([x, z], i) => {
        const c = makeCharacter({ s: .95, coat: RED, mood: 'sad' }); c.position.set(x, -.52, z); c.rotation.y = .5 + i * .4 - .6; pose(c, { arms: 'side', legs: 'jump', lean: .04, bounce: 0 }); c.rotation.z = (i - 2) * .05; g.add(c);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.62, .035, 6, 32), flat(0xffffff)); ring.rotation.x = Math.PI / 2; ring.position.set(x, .03, z); g.add(ring);
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(.95, .03, 6, 32), flat(0xe8f6ff)); ring2.rotation.x = Math.PI / 2; ring2.position.set(x, .03, z); g.add(ring2);
      });
      [[-2.2, 7.5], [2.8, 7.2], [.2, 8.6]].forEach(([x, z], i) => { const h = cyl(.2, .17, .28, toon(0x23233a), { px: 3 }); h.position.set(x, .1, z); h.rotation.z = .3 * (i - 1); g.add(h); const b = cyl(.18, .18, .05, toon(RED), { px: 0 }); b.position.set(x, .03, z); b.rotation.z = h.rotation.z; g.add(b); });
      return { pos: V(3.2, 1.25, 11.5), look: V(-.4, 2.5, 4.2), fov: 50, roll: -.05, sunTarget: V(0, 2, 4), shadowSize: 40, aperture: .0007, maxblur: .012 };
    },
  },
  golden: {
    light: 'golden', dur: 4, sunAz: 266, sunEl: 13,
    setup(w, st, t) {
      const g = g0(w), sw = swingSet(); sw.position.set(36, 5, 5.2); g.add(sw);
      const a = Math.sin(t * 1.7) * .3; sw.userData.sw.rotation.z = a;
      const kid = makeCharacter({ s: .62, coat: 0x4cae78, pants: 0xe8c040, hat: 'cap', mood: 'smile', boot: 0x5a3a2a }); kid.position.set(0, -3.13 + .02 - .08, 0); kid.rotation.y = Math.PI / 2; pose(kid, { legs: 'sit', arms: 'rope', lean: -.05, bounce: 0 }); sw.userData.sw.add(kid);
      const mom = makeCharacter({ s: .92, coat: 0xd76f8a, pants: 0x3a3566, hat: 'hair', mood: 'smile', belts: false }); mom.position.set(40.2, 5, 6.9); mom.rotation.y = 1.3; pose(mom, { walk: 0, arms: 'side', lean: 0, legs: 'walk' }); g.add(mom);
      return { pos: V(43.6, 6.0, 6.6), look: V(35.6, 6.5, 5.0), fov: 40, roll: .045, sunTarget: V(38, 5, 5), shadowSize: 35, aperture: .0009, maxblur: .014 };
    },
  },
  closeup: {
    light: 'day', dur: 3, sunAz: 38, sunEl: 36,
    setup(w, st, t) {
      const g = g0(w), c = makeCharacter({ s: 1, coat: RED, mood: 'shock' }); c.position.set(30, 5, 2); c.rotation.y = .12; pose(c, { arms: 'up', legs: 'walk', walk: 0, lean: 0, bounce: 0 }); g.add(c);
      const b = makeCharacter({ s: 1, coat: RED, mood: 'shock', hat: 'shako' }); b.position.set(28.1, 5, 0.6); b.rotation.y = .3; pose(b, { arms: 'side', walk: 0 }); g.add(b);
      return { pos: V(31.0, 6.7, 4.9), look: V(30.05, 6.45, 2), fov: 36, roll: .06, sunTarget: V(30, 5, 2), shadowSize: 25, aperture: .0016, maxblur: .026, focusAt: V(30, 6.5, 2.25) };
    },
  },
};
