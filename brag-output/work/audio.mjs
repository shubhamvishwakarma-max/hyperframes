import fs from 'fs';
const SR = 48000, DUR = 10, N = SR * DUR;
const dry = [new Float32Array(N), new Float32Array(N)];
const send = new Float32Array(N); // reverb send (mono)
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (i, l, r, s = 0) => { if (i >= 0 && i < N) { dry[0][i] += l; dry[1][i] += r; send[i] += s; } };
// deterministic noise
let seed = 1234567; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };

// ---- pad ----
const chords = [[0, 2.25, [45, 57, 60, 64, 69]], [2.25, 5.15, [41, 57, 60, 65, 69]], [5.15, 7.62, [43, 55, 59, 62, 67]], [7.62, 10, [36, 55, 60, 64, 67, 72]]];
const kickTimes = []; for (let t = 2.25; t < 7.55; t += 0.5) kickTimes.push(t);
for (const [a, b, notes] of chords) {
  const i0 = Math.floor(Math.max(0, a - 0.08) * SR), i1 = Math.min(N, Math.floor((b + 0.25) * SR));
  let lpL = 0, lpR = 0;
  for (let i = i0; i < i1; i++) {
    const t = i / SR;
    const env = Math.min(1, (t - (a - 0.08)) / 0.25) * Math.min(1, Math.max(0, (b + 0.25 - t) / 0.3));
    let sL = 0, sR = 0;
    for (const m of notes) {
      const isBass = m < 50;
      for (const [d, pan] of [[-0.09, 0.2], [0, 0.5], [0.08, 0.8]]) {
        const f = mtof(m + d);
        let v = 0;
        const H = isBass ? 3 : 6;
        for (let h = 1; h <= H; h++) v += Math.sin(2 * Math.PI * f * h * t + h * d * 10) / h;
        const g = isBass ? 0.5 : 0.22;
        sL += v * g * (1 - pan); sR += v * g * pan;
      }
    }
    // slow filter swell
    const cutoff = 0.05 + 0.04 * Math.sin(t * 0.9) + (t > 7.62 ? 0.05 : 0);
    lpL += cutoff * (sL - lpL); lpR += cutoff * (sR - lpR);
    // sidechain duck
    let duck = 1;
    for (const k of kickTimes) { const dt = t - k; if (dt >= 0 && dt < 0.4) duck = Math.min(duck, 0.55 + 0.45 * (dt / 0.4)); }
    const g = 0.055 * env * duck;
    add(i, lpL * g, lpR * g, (lpL + lpR) * g * 0.25);
  }
}

// ---- kick ----
for (const k of kickTimes) {
  const i0 = Math.floor(k * SR); let ph = 0;
  for (let j = 0; j < SR * 0.35; j++) {
    const t = j / SR; const f = 45 + 85 * Math.exp(-t * 28); ph += 2 * Math.PI * f / SR;
    const v = Math.sin(ph) * Math.exp(-t * 9) * 0.32 * Math.min(1, (0.35 - t) / 0.05);
    add(i0 + j, v, v);
  }
}
// ---- bass (eighths on root) ----
const roots = [[2.25, 5.15, 29], [5.15, 7.62, 31]];
for (const [a, b, m] of roots) for (let t0 = a + 0.25; t0 < b - 0.1; t0 += 0.5) {
  const i0 = Math.floor(t0 * SR), f = mtof(m + 12);
  for (let j = 0; j < SR * 0.22; j++) { const t = j / SR; const v = Math.tanh(1.5 * Math.sin(2 * Math.PI * f * t)) * Math.min(1, t / 0.005) * Math.exp(-t * 10) * 0.13 * Math.min(1, (0.22 - t) / 0.06); add(i0 + j, v, v); }
}
// ---- hats (offbeat, scene 3) ----
for (let t0 = 5.4; t0 < 7.5; t0 += 0.5) {
  const i0 = Math.floor(t0 * SR); let hp = 0, prev = 0;
  for (let j = 0; j < SR * 0.06; j++) { const n = rnd(); hp = 0.85 * (hp + n - prev); prev = n; const v = hp * Math.min(1, j / 48) * Math.exp(-j / SR * 70) * 0.012; add(i0 + j, v * 0.8, v); }
}
// ---- plucks / bells ----
const pluck = (t0, m, gain, pan = 0.5, bell = false) => {
  const i0 = Math.floor(t0 * SR), f = mtof(m), len = bell ? 1.6 : 0.6;
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    let v = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 8);
    if (bell) v += 0.25 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 4);
    v *= Math.min(1, t / 0.004) * Math.exp(-t * (bell ? 2.6 : 7)) * gain * Math.min(1, (len - t) / 0.1);
    add(i0 + j, v * (1 - pan) * 2 * 0.5, v * pan * 2 * 0.5, v * 0.5);
  }
};
// ring motif (two bursts, A/E)
for (const b of [0.3, 1.0]) for (let k = 0; k < 6; k++) pluck(b + k * 0.075, k % 2 ? 76 : 81, 0.09, k % 2 ? 0.35 : 0.65);
// answer chime
[[1.74, 81], [1.84, 84], [1.94, 88]].forEach(([t, m]) => pluck(t, m, 0.08, 0.5, true));
// bubbles
[[2.75, 77, 0.3], [3.35, 81, 0.7], [3.95, 84, 0.3]].forEach(([t, m, p]) => pluck(t, m, 0.09, p));
[[4.25, 89], [4.35, 91], [4.45, 93]].forEach(([t, m]) => pluck(t, m, 0.035, 0.5));
// channel impact
pluck(5.62, 67, 0.09, 0.5, true); pluck(5.62, 74, 0.06, 0.5, true);
// CRM ticks
[[6.45, 79], [6.62, 83], [6.79, 86]].forEach(([t, m]) => pluck(t, m, 0.05, 0.6));
// outro bells
[[7.7, 72], [7.8, 76], [7.9, 79], [8.0, 84]].forEach(([t, m]) => pluck(t, m, 0.08, 0.5, true));
// outro sub
{ const i0 = Math.floor(7.62 * SR); for (let j = 0; j < SR * 2; j++) { const t = j / SR; const v = Math.sin(2 * Math.PI * 65.4 * t) * Math.min(1, t / 0.01) * Math.exp(-t * 1.5) * 0.18; add(i0 + j, v, v); } }
// ---- whooshes (filtered noise sweep) ----
for (const [a, b] of [[1.95, 2.4], [4.9, 5.3], [7.3, 7.7]]) {
  const i0 = Math.floor(a * SR), len = Math.floor((b - a) * SR); let l1 = 0, l2 = 0, h1 = 0;
  for (let j = 0; j < len; j++) {
    const x = j / len; const env = Math.sin(Math.PI * Math.pow(x, 0.7)) ** 2;
    const fc = 250 + 1800 * x; const c = 1 - Math.exp(-2 * Math.PI * fc / SR);
    const n = rnd(); l1 += c * (n - l1); l2 += c * (l1 - l2);
    h1 += 0.02 * (l2 - h1); const y = l2 - h1;
    const v = y * env * 0.22;
    add(i0 + j, v * (1 - x), v * x, v * 0.6);
  }
}
// ---- reverb (Schroeder) ----
const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, buf: new Float32Array(d), i: 0 }));
const aps = [225, 556, 441].map((d) => ({ d, buf: new Float32Array(d), i: 0 }));
const wetL = new Float32Array(N), wetR = new Float32Array(N);
for (let n = 0; n < N; n++) {
  let s = 0;
  for (const c of combs) { const y = c.buf[c.i]; c.buf[c.i] = send[n] + y * 0.84; c.i = (c.i + 1) % c.d; s += y; }
  s *= 0.25;
  for (const a of aps) { const y = a.buf[a.i]; const x = s + y * 0.5; a.buf[a.i] = x; a.i = (a.i + 1) % a.d; s = y - x * 0.5; }
  wetL[n] = s; wetR[Math.min(N - 1, n + 240)] = s; // slight stereo offset
}
// ---- master ----
const out = Buffer.alloc(44 + N * 4);
let peak = 0; const mix = [new Float32Array(N), new Float32Array(N)];
for (let n = 0; n < N; n++) {
  const fade = Math.min(1, (DUR - n / SR) / 0.35) * Math.min(1, n / SR / 0.01);
  for (const c of [0, 1]) { const v = Math.tanh((dry[c][n] + (c ? wetR[n] : wetL[n]) * 0.35) * 1.4) * fade; mix[c][n] = v; peak = Math.max(peak, Math.abs(v)); }
}
const g = 0.89 / peak;
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) for (const c of [0, 1]) out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[c][n] * g)) * 32767), 44 + n * 4 + c * 2);
fs.writeFileSync('music.wav', out);
console.log('peak', peak.toFixed(3));
