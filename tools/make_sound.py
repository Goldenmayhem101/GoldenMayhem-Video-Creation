#!/usr/bin/env python3
"""Synthesize a soft music bed + simple sound effects. No samples, no downloads.
usage: python3 tools/make_sound.py out.wav duration_s events.json
events.json: [{"t":0.9,"type":"crack"}, {"t":0.15,"type":"step"}, ...]  types: step, crack, clatter, splash, whoosh, pop
"""
import sys, json, wave
import numpy as np
SR = 44100
def env_noise(n, decay, rng):
    t = np.arange(n) / SR; return rng.standard_normal(n) * np.exp(-t * decay)
def lowpass(x, k):
    k = int(k); 
    if k <= 1: return x
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.zeros(len(x) - len(y))])
def music(dur, rng):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    chords = [(110.0, 164.8, 220.0, 261.6), (87.3, 130.8, 174.6, 220.0), (98.0, 146.8, 196.0, 246.9), (110.0, 164.8, 220.0, 277.2)]
    seg = 1.9
    for i in range(int(np.ceil(dur / seg))):
        a, b = i * seg, min(dur, (i + 1) * seg + .6); idx = (int(a * SR), int(b * SR)); tt = t[idx[0]:idx[1]]; local = tt - a
        e = np.minimum(1, local / .6) * np.minimum(1, (b - tt) / .6)
        for f in chords[i % 4]:
            for d in (-.7, 0, .7):
                for hm, amp in ((1, 1.0), (2, .45), (3, .22), (4, .1)): out[idx[0]:idx[1]] += np.sin(2 * np.pi * (f * hm + d) * tt) * e * .028 * amp
    out *= .7 + .3 * np.sin(2 * np.pi * .35 * t)  # slow swell
    return lowpass(out, 6)
def reverb(x, rng, wet=.28, sec=1.6):
    n = int(sec * SR); t = np.arange(n) / SR; ir = rng.standard_normal(n) * np.exp(-t * 3.2); ir = lowpass(ir, 5)
    L = len(x) + n; F = 1 << (L - 1).bit_length(); y = np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]
    y = y / max(1e-6, np.abs(y).max()) * np.abs(x).max(); return x * (1 - wet) + y * wet * 1.6
def add(buf, snd, t0, gain=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(snd))
    if i < len(buf): buf[i:j] += snd[:j - i] * gain
def step(rng):
    n = int(.14 * SR); return lowpass(env_noise(n, 38, rng), 40) * 6 + np.sin(2 * np.pi * 70 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 40) * .6
def crack(rng):
    n = int(1.1 * SR); t = np.arange(n) / SR
    sn = env_noise(n, 9, rng) * .8 + env_noise(n, 40, rng) * 1.2; boom = np.sin(2 * np.pi * (60 - 25 * t) * t) * np.exp(-t * 5) * 1.6
    snap = lowpass(env_noise(int(.05 * SR), 90, rng), 3) * 4; sn[:len(snap)] += snap
    return sn * .6 + boom
def clatter(rng):
    out = np.zeros(int(.9 * SR))
    for k in range(7):
        n = int(.09 * SR); tk = env_noise(n, 50, rng) * .8; tk = lowpass(tk, 4 + k % 3) + np.sin(2 * np.pi * (180 + 60 * k) * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 55) * .5
        add(out, tk, k * .11 + (k % 2) * .03, .8 - k * .07)
    return out
def splash(rng):
    n = int(.9 * SR); t = np.arange(n) / SR; return lowpass(env_noise(n, 5, rng), 8) * np.minimum(1, t / .03) * 2.2
def whoosh(rng):
    n = int(.7 * SR); t = np.arange(n) / SR; return lowpass(rng.standard_normal(n), 30) * np.sin(np.pi * t / .7) ** 2 * 5
def pop(rng):
    n = int(.12 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (500 - 2500 * t) * t) * np.exp(-t * 30)
FX = dict(step=step, crack=crack, clatter=clatter, splash=splash, whoosh=whoosh, pop=pop)
def main(out, dur, events, seed=3):
    rng = np.random.default_rng(seed); n = int(dur * SR); m = music(dur, rng) * .9; fx = np.zeros(n)
    wind = lowpass(rng.standard_normal(n), 400) * .5; wind *= .5 + .5 * np.sin(2 * np.pi * .2 * np.arange(n) / SR)
    for e in events: add(fx, FX[e['type']](rng), e['t'], e.get('gain', .9))
    mix = reverb(m, rng, .35, 2.2) + reverb(fx, rng, .22, 1.0) * .45 + wind * .02
    mix = np.tanh(mix * 1.5) * .8; mix = mix / max(1e-6, np.abs(mix).max()) * .9
    fade = np.minimum(1, np.arange(n) / (.3 * SR)) * np.minimum(1, (n - np.arange(n)) / (.5 * SR)); mix *= fade
    st = np.stack([mix, np.roll(mix, int(.0006 * SR))], 1); pcm = (st * 32767).astype('<i2')
    with wave.open(out, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
if __name__ == '__main__': main(sys.argv[1], float(sys.argv[2]), json.load(open(sys.argv[3])))
