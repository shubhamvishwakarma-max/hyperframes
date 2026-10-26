// Generates the DoubleTick UAE real-estate ad compositions.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
const dur = (f) => Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`).toString()).toFixed(3);

const OUT = process.argv[2];
// Canvas: node generate.mjs <dir> [width] [height]. The scenes are authored on a 1080×1080
// stage; other canvases place that stage (and, in landscape, the headline column) around it.
const W = Number(process.argv[3] || 1080), H = Number(process.argv[4] || 1080);
const LAND = W > H;
const CENTERED = ["journey", "cta", "captions"];
const isSplit = (id) => LAND && !CENTERED.includes(id);
const VDY = { 1080: 0, 1350: 135, 1920: 420 }; // vertical offset of the stage per canvas height
const off = (id) => (LAND ? (isSplit(id) ? { x: 800, y: -20 } : { x: (W - 1080) / 2, y: 0 }) : { x: (W - 1080) / 2, y: VDY[H] ?? (H - 1080) / 2 });
const CAP_TOP = LAND ? 960 : 900 + (VDY[H] ?? (H - 1080) / 2) + (H > 1080 ? 20 : 0);
fs.mkdirSync(path.join(OUT, "compositions"), { recursive: true });

// ---------- tokens ----------
const C = {
  bg: "#F3EFE7",
  card: "#FCFBF8",
  ink: "#1F1F22",
  muted: "#66625C",
  line: "#E4DED3",
  green: "#27B578",
  greenDeep: "#0E7A4C",
  greenTint: "#E3F6EC",
  coral: "#B4473C",
  coralTint: "#F3E2DC",
  wa: "#EFEAE2",
  waOut: "#D9FDD3",
};

// ---------- icons (stroke, 24 grid) ----------
const IC = {
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="16.5" cy="15" r="1.2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  tag: '<path d="M12 2H2v10l9.3 9.3a1 1 0 0 0 1.4 0l8.6-8.6a1 1 0 0 0 0-1.4z"/><circle cx="7" cy="7" r="1.5"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  spark: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
  sync: '<path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  usercheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
};
const icon = (n, size = 24, sw = 2) =>
  `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
const waLogo = (s = 24) => `<img src="assets/brand/whatsapp.png" alt="WhatsApp" style="width:${s}px;height:${s}px;display:block;flex:none;">`;
const verified = (s = 20) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="${C.green}"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ticks = `<svg width="18" height="12" viewBox="0 0 18 12"><path d="M1 6.5l3 3L10.5 2.5M7 9.5l1 0.5L16.5 2.5" fill="none" stroke="#53BDEB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// words → spans for per-word motion. Segments: [text, className?]
function words(prefix, segs) {
  let i = 0;
  return segs
    .map(([text, cls]) =>
      text
        .split(" ")
        .filter(Boolean)
        .map((w) => (w === "<br>" ? "<br>" : `<span class="w ${cls || ""}" id="${prefix}-w${i++}">${w}</span>`))
        .join(" "),
    )
    .join(" ");
}

// ---------- shared CSS ----------
const BASE_CSS = `
@font-face { font-family: "Hedvig Letters Serif"; src: url("assets/fonts/hedvig-letters-serif.woff2") format("woff2"); font-display: block; }
@font-face { font-family: "Geist"; src: url("assets/fonts/geist.woff2") format("woff2"); font-weight: 100 900; font-display: block; }
#root { position: absolute; inset: 0; overflow: hidden; background: ${C.bg}; font-family: "Geist", sans-serif; color: ${C.ink}; }
#root * { box-sizing: border-box; }
.abs { position: absolute; }
.hl { position: absolute; left: 60px; right: 60px; text-align: center; font-family: "Hedvig Letters Serif", serif; font-weight: 400; color: ${C.ink}; letter-spacing: -0.012em; line-height: 1.08; }
.hl .w { display: inline-block; }
.hl .g { color: ${C.greenDeep}; }
.hl .r { color: ${C.coral}; }
.sub { position: absolute; left: 60px; right: 60px; text-align: center; font-size: 24px; font-weight: 500; color: ${C.muted}; letter-spacing: 0.01em; }
.card { position: absolute; background: ${C.card}; border-radius: 24px; border: 1px solid ${C.line}; box-shadow: 0 1px 2px rgba(40,32,20,.05), 0 14px 36px -12px rgba(40,32,20,.16); }
.ic { display: block; flex: none; }
.row { display: flex; align-items: center; }
.icbox { display: flex; align-items: center; justify-content: center; border-radius: 14px; background: ${C.greenTint}; color: ${C.greenDeep}; flex: none; }
.avatar { display: flex; align-items: center; justify-content: center; border-radius: 50%; flex: none; font-weight: 600; }
.pill { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; font-weight: 600; }
/* WhatsApp chat — header, wallpaper and composer are the reference screenshot */
.wa { overflow: hidden; padding: 0; border-radius: 28px; border: 3px solid rgba(20,20,20,.16); background: #E5DDD4; box-shadow: 0 2px 4px rgba(40,32,20,.06), 0 24px 48px -20px rgba(40,32,20,.28); }
.wa-head { position: absolute; left: 0; right: 0; top: 0; display: block; width: 100%; }
.wa-av { position: absolute; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${C.greenDeep}; color: #fff; font-weight: 700; letter-spacing: 0.02em; }
.wa-name { position: absolute; font-family: "Roboto", sans-serif; font-weight: 500; color: #111; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.wa-body { position: absolute; left: 0; right: 0; overflow: hidden; background-repeat: repeat-y; }
.wa-list { position: absolute; left: 0; right: 0; top: 0; height: 2000px; }
.wa-foot { position: absolute; left: 0; right: 0; bottom: 0; display: block; width: 100%; }
.wa-day { position: absolute; left: 0; right: 0; top: 12px; text-align: center; }
.wa-day span { display: inline-block; background: #fff; border-radius: 8px; padding: 4px 14px; font-size: 16px; color: #555; box-shadow: 0 1px 1px rgba(0,0,0,.06); }
.bub { position: absolute; font-size: 22px; line-height: 30px; padding: 10px 14px 6px; border-radius: 12px; white-space: nowrap; box-shadow: 0 1px 1px rgba(0,0,0,.07); color: #111; opacity: 0; }
.bub.in { left: 12px; background: #FFFFFF; }
.bub.out { right: 12px; background: #E7FFD9; }
.bub .tm { display: block; text-align: right; font-size: 14px; line-height: 20px; color: #707070; margin-top: 2px; }
.bub .hi { border-radius: 6px; padding: 0 3px; margin: 0 -3px; }
.bub .src { display: flex; align-items: center; gap: 6px; font-size: 15px; line-height: 20px; color: ${C.greenDeep}; margin-top: 4px; font-weight: 500; }
.bub .btns { margin: 8px -14px -6px; border-top: 1px solid #E6E6E6; }
.bub .btn { height: 52px; display: flex; align-items: center; justify-content: center; font-size: 21px; color: #1A96D5; font-weight: 500; }
.bub .btn + .btn { border-top: 1px solid #E6E6E6; }
.typing { position: absolute; left: 12px; width: 74px; height: 44px; border-radius: 12px; background: #fff; display: flex; align-items: center; justify-content: center; gap: 6px; opacity: 0; box-shadow: 0 1px 1px rgba(0,0,0,.07); }
.typing i { width: 9px; height: 9px; border-radius: 50%; background: #A7A39C; display: block; }
/* extracted chips */
.chip { position: absolute; height: 84px; display: flex; align-items: center; gap: 16px; padding: 0 20px; background: #FFFFFF; border: 1.5px solid ${C.line}; border-radius: 18px; box-shadow: 0 10px 24px -14px rgba(40,32,20,.28); opacity: 0; }
.chip .lb { font-size: 17px; color: ${C.muted}; font-weight: 500; }
.chip .vl { font-size: 27px; font-weight: 600; letter-spacing: -0.01em; margin-top: 1px; }
.chip .ck { position: absolute; right: 18px; top: 25px; width: 34px; height: 34px; border-radius: 50%; background: ${C.green}; color: #fff; display: flex; align-items: center; justify-content: center; opacity: 0; }
`;

// Split a scene body into headline lines (.hl / .sub) and everything else (the stage).
function place(id, body) {
  if (id === "captions") return body;
  const hl = [], st = [];
  let cur = st;
  for (const line of body.split("\n")) {
    if (/^    </.test(line)) cur = /class="(hl|sub)"/.test(line) ? hl : st;
    cur.push(line);
  }
  const o = off(id);
  const ho = isSplit(id) ? { x: 100, y: 0 } : o;
  const ind = (a) => a.map((l) => "  " + l).join("\n");
  return `    <div class="stage" style="left:${o.x}px;top:${o.y}px;">\n${ind(st)}\n    </div>\n    <div class="hlwrap" style="left:${ho.x}px;top:${ho.y}px;">\n${ind(hl)}\n    </div>`;
}

function scene(id, dur, css, body, script) {
  const splitCss = isSplit(id)
    ? `.hlwrap .hl { left: 0 !important; right: auto !important; width: 720px !important; text-align: left !important; top: auto !important; bottom: 520px !important; }
.hlwrap .sub { left: 0 !important; right: auto !important; width: 720px !important; text-align: left !important; top: 590px !important; }`
    : "";
  return `<template>
  <style>
${BASE_CSS}
.stage, .hlwrap { position: absolute; width: 1080px; height: 1080px; }
.hlwrap { pointer-events: none; }
${css}
${splitCss}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
${place(id, body)}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
      const q = (s) => "#" + s;
      // helpers: entrances / exits
      const blurIn = (sel, t, d = 0.18, extra = {}) =>
        tl.fromTo(sel, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: d, ease: "power4.out", ...extra }, t);
      const blurOut = (sel, t, d = 0.2, extra = {}) =>
        tl.to(sel, { opacity: 0, filter: "blur(8px)", duration: d, ease: "power3.in", ...extra }, t);
      const wordsIn = (prefix, n, t, gap = 0.067) => {
        for (let i = 0; i < n; i++) blurIn(q(prefix + "-w" + i), t + i * gap, 0.16);
      };
${script}
      tl.set({}, {}, ${dur});
      window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`;
}

// ---------- chat builder ----------
// msgs: {id, side, lines:[html], t, h? (explicit), extra? (html appended), typing?}
function buildChat(prefix, box, msgs, opts = {}) {
  const head = opts.head || { avatar: "ABC", name: "ABC Properties" };
  const k = (box.w - 6) / 1070; // screenshot px → frame px
  const headH = Math.round(195 * k), footH = Math.round(170 * k);
  const bodyH = box.h - 6 - headH - footH;
  let y = 56;
  const laid = msgs.map((m) => {
    const h = m.h || m.lines.length * 30 + 38 + (m.extraH || 0);
    const o = { ...m, top: y, height: h };
    y += h + 10;
    return o;
  });
  let scroll = 0;
  for (const m of laid) {
    const need = bodyH - 14 - (m.top + m.height);
    scroll = Math.min(scroll, need);
    m.scroll = scroll;
    m.scrollAt = m.side === "in" && m.typing ? m.t - 0.42 : m.t;
    const estW = m.w || Math.max(...m.lines.map((l) => l.replace(/<[^>]+>/g, "").length)) * 11.6 + 30;
    m.cx = m.side === "out" ? box.x + box.w - 15 - estW / 2 : box.x + 15 + estW / 2;
    m.cy = box.y + 3 + headH + m.top + m.scroll + m.height / 2;
  }
  const bubbles = laid
    .map(
      (m) => `          <div class="bub ${m.side}" id="${m.id}" style="top:${m.top}px;${m.w ? `width:${m.w}px;` : ""}${m.style || ""}">${m.lines.join("<br>")}${m.extra || ""}<span class="tm">${m.time || "10.24 AM"}</span>${m.buttons ? `<div class="btns">${m.buttons.map((b, j) => `<div class="btn" id="${m.id}-b${j}">${b}</div>`).join("")}</div>` : ""}</div>`,
    )
    .join("\n");
  const av = Math.round(108 * k);
  const html = `    <div class="card wa" id="${prefix}" style="left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;">
      <img class="wa-head" src="assets/ui/wa-header.png" alt="" style="height:${headH}px;">
      <div class="wa-av" style="left:${Math.round(121 * k)}px;top:${Math.round(51 * k)}px;width:${av}px;height:${av}px;font-size:${Math.round(av * 0.3)}px;">${head.avatar}</div>
      <div class="wa-name" style="left:${Math.round(243 * k)}px;top:${Math.round(50 * k)}px;height:${Math.round(76 * k)}px;font-size:${Math.round(44 * k)}px;">${head.name}<img src="assets/ui/wa-verified.png" alt="" style="width:${Math.round(46 * k)}px;height:${Math.round(46 * k)}px;display:block;"></div>
      <div class="wa-body" style="top:${headH}px;height:${bodyH}px;background-image:url('assets/ui/wa-wall.jpg');background-size:${box.w - 6}px auto;" data-layout-allow-overflow>
        <div class="wa-list" id="${prefix}-list">
          <div class="wa-day"><span>Today</span></div>
${bubbles}
          <div class="typing" id="${prefix}-typing"><i id="${prefix}-d0"></i><i id="${prefix}-d1"></i><i id="${prefix}-d2"></i></div>
        </div>
      </div>
      <img class="wa-foot" src="assets/ui/wa-footer.png" alt="" style="height:${footH}px;">
    </div>`;
  // script
  let js = "";
  let lastScroll = 0;
  for (const m of laid) {
    if (m.side === "in" && m.typing) {
      const ts = m.t - 0.42;
      js += `      tl.set(q("${prefix}-typing"), { y: ${m.top} }, ${ts.toFixed(3)});
      tl.fromTo(q("${prefix}-typing"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.14, ease: "power3.out", transformOrigin: "0% 0%" }, ${ts.toFixed(3)});
      [0, 1, 2].forEach((k) => tl.fromTo(q("${prefix}-d" + k), { opacity: 0.35 }, { opacity: 1, duration: 0.12, yoyo: true, repeat: 1, ease: "sine.inOut" }, ${ts.toFixed(3)} + 0.05 + k * 0.08));
      tl.set(q("${prefix}-typing"), { opacity: 0 }, ${m.t.toFixed(3)});
`;
    }
    if (m.scroll !== lastScroll) {
      js += `      tl.to(q("${prefix}-list"), { y: ${m.scroll}, duration: 0.34, ease: "power3.out" }, ${m.scrollAt.toFixed(3)});\n`;
      lastScroll = m.scroll;
    }
    const origin = m.side === "out" ? "100% 100%" : "0% 100%";
    js += `      tl.fromTo(q("${m.id}"), { opacity: 0, y: 14, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out", transformOrigin: "${origin}" }, ${m.t.toFixed(3)});\n`;
  }
  return { html, js, laid };
}

// chip markup
function chip(id, x, y, w, ic, label, value, extraStyle = "") {
  return `    <div class="chip" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;${extraStyle}">
      <div class="icbox" style="width:52px;height:52px;">${icon(ic, 26)}</div>
      <div><div class="lb">${label}</div><div class="vl">${value}</div></div>
      <div class="ck" id="${id}-ck">${icon("check", 20, 3)}</div>
    </div>`;
}

const files = {};
// =====================================================================
// DoubleTick Agentic AI — Property Discovery (second film)
// =====================================================================
const PROPS = [
  { k: "burj-crest", n: "Burj Crest", a: "Downtown Dubai", t: "1 Bedroom", s: "820 sq ft", p: "AED 2.4M" },
  { k: "marina-vista", n: "Marina Vista", a: "Dubai Marina", t: "2 Bedroom", s: "1,240 sq ft", p: "AED 1.95M", m: true },
  { k: "canal-point", n: "Canal Point", a: "Business Bay", t: "Studio", s: "480 sq ft", p: "AED 950K" },
  { k: "harbour-residence", n: "Harbour Residence", a: "Dubai Marina", t: "2 Bedroom", s: "1,310 sq ft", p: "AED 2.05M", m: true },
  { k: "circle-gardens", n: "Circle Gardens", a: "JVC", t: "2 Bedroom", s: "1,050 sq ft", p: "AED 1.1M" },
  { k: "palm-shoreline", n: "Palm Shoreline", a: "Palm Jumeirah", t: "4 Bed Villa", s: "5,200 sq ft", p: "AED 12.5M" },
  { k: "marina-heights", n: "Marina Heights", a: "Dubai Marina", t: "2 Bedroom", s: "1,180 sq ft", p: "AED 1.9M", m: true },
  { k: "bay-square", n: "Bay Square", a: "Business Bay", t: "3 Bedroom", s: "1,720 sq ft", p: "AED 3.2M" },
];
// scatter slots: centre x, centre y, rotation
const SLOTS = [[175, 440, -6], [420, 405, 3], [665, 425, -3], [905, 450, 6], [165, 690, 5], [405, 712, -4], [660, 702, 4], [905, 680, -5]];
const CW_ = 230, CH_ = 284;
const PCARD_CSS = `
.pc { position: absolute; width: ${CW_}px; height: ${CH_}px; padding: 8px; opacity: 0; }
.pc .im { position: relative; width: 100%; height: 138px; border-radius: 14px; overflow: hidden; }
.pc .im img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pc .bt { position: absolute; left: 8px; top: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: ${C.coral}; background: rgba(255,255,255,.92); border-radius: 6px; padding: 3px 7px; }
.pc .nm { font-size: 20px; font-weight: 600; margin: 12px 6px 0; letter-spacing: -0.01em; white-space: nowrap; }
.pc .ar { font-size: 15px; color: ${C.muted}; margin: 6px 6px 0; display: flex; align-items: center; gap: 5px; white-space: nowrap; }
.pc .pr { font-size: 21px; font-weight: 600; color: ${C.greenDeep}; margin: 8px 6px 0; }
`;
const pcard = (id, p, x, y, tag) => `    <div class="card pc" id="${id}" style="left:${x - CW_ / 2}px;top:${y - CH_ / 2}px;">
      <div class="im"><img src="assets/images/${p.k}.jpg" alt="${p.n}">${tag ? `<span class="bt">${tag}</span>` : ""}</div>
      <div class="nm">${p.n}</div>
      <div class="ar">${icon("pin", 15)}${p.a}</div>
      <div class="ar">${icon("home", 15)}${p.t} · ${p.s}</div>
      <div class="pr">${p.p}</div>
    </div>`;

// =====================================================================
// SCENE 01+02 — TOO MANY BROCHURES → INTRODUCING (0 – 8.0)
// =====================================================================
{
  const order = [3, 0, 6, 1, 4, 7, 2, 5];
  const css = `
${PCARD_CSS}
#br-tint { position: absolute; left: ${-off("brochures").x}px; top: ${-off("brochures").y}px; width: ${W}px; height: ${H}px; background: ${C.coralTint}; opacity: 0; }
#br-hl { top: 140px; font-size: 58px; }
#br-hl2 { top: 214px; font-size: 42px; }
#br-hl2 .g { color: ${C.greenDeep}; }
.pc { border-color: #E9CFC8; }
#br-buyer { position: absolute; left: 480px; top: 512px; width: 120px; height: 120px; border-radius: 50%; background: #fff; border: 3px solid ${C.coral}; color: ${C.coral}; display: flex; align-items: center; justify-content: center; box-shadow: 0 18px 40px -16px rgba(120,40,30,.4); opacity: 0; }
#br-buyl { position: absolute; left: 440px; top: 640px; width: 200px; text-align: center; font-size: 17px; font-weight: 600; color: ${C.coral}; opacity: 0; }
#br-buyl span { background: #fff; border-radius: 999px; padding: 4px 12px; box-shadow: 0 6px 14px -8px rgba(0,0,0,.25); }
#br-sweep { position: absolute; top: ${-20 - off("brochures").y}px; left: 0; width: 8px; height: ${H + 40}px; background: ${C.green}; border-radius: 4px; box-shadow: 0 0 28px 6px rgba(39,181,120,.45); opacity: 0; }
#br-intro { position: absolute; left: ${60 + (W - 1080) / 2 - off("brochures").x}px; right: ${60 - (W - 1080) / 2 + off("brochures").x}px; top: 340px; text-align: center; }
#br-introk { font-size: 30px; color: ${C.muted}; font-weight: 500; opacity: 0; }
#br-introt { font-family: "Hedvig Letters Serif", serif; font-size: 84px; line-height: 1.05; margin-top: 14px; letter-spacing: -0.015em; }
#br-introt .w { display: inline-block; }
#br-introt .g { color: ${C.greenDeep}; }
#br-uline { width: 520px; height: 6px; border-radius: 3px; background: ${C.green}; margin: 30px auto 0; transform-origin: 0% 50%; }
`;
  let body = `    <div id="br-tint" data-layout-ignore></div>
${PROPS.map((p, i) => pcard("br-c" + i, p, SLOTS[i][0], SLOTS[i][1], "Brochure").replace('class="card pc"', 'class="card pc" data-layout-allow-overlap')).join("\n")}
    <div id="br-buyer">${icon("user", 54, 1.8)}</div>
    <div id="br-buyl"><span>Buyer</span></div>
    <div id="br-sweep" data-layout-ignore></div>
    <div id="br-intro">
      <div id="br-introk">Introducing</div>
      <div id="br-introt">${words("br-introt", [["DoubleTick"], ["<br>"], ["Agentic AI", "g"]])}</div>
      <div id="br-uline"></div>
    </div>
    <h1 class="hl" id="br-hl">${words("br-hl", [["Buyers don't need"], ["more brochures.", "r"]])}</h1>
    <h2 class="hl" id="br-hl2">${words("br-hl2", [["They need the"], ["right property.", "g"]])}</h2>
`;
  let script = `
      gsap.set("#br-hl2 .w", { opacity: 0 });
      tl.fromTo("#br-tint", { opacity: 0.55 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0);
      tl.fromTo("#br-buyer", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, 0);
      blurIn("#br-buyl", 0.3, 0.2);
      wordsIn("br-hl", 5, 0.12, 0.06);
`;
  order.forEach((ci, k) => {
    const [cx, cy, r] = SLOTS[ci];
    const t = 0.02 + k * 0.08;
    script += `      tl.fromTo(q("br-c${ci}"), { opacity: 0, x: ${Math.round((cx - 540) * 1.5)}, y: ${Math.round((cy - 580) * 1.5)}, rotation: ${r * 3}, scale: 1.12 }, { opacity: 1, x: 0, y: 0, rotation: ${r}, scale: 1, duration: 0.45, ease: "expo.out" }, ${t.toFixed(2)});
      tl.to(q("br-c${ci}"), { x: ${k % 2 ? 7 : -7}, y: ${k % 3 ? -5 : 5}, duration: ${(2.9 - t - 0.45).toFixed(2)}, ease: "none" }, ${(t + 0.45).toFixed(2)});
`;
  });
  script += `
      // second line — cards have frozen
      tl.set("#br-hl2 .w", { opacity: 0 }, 0.01);
      wordsIn("br-hl2", 5, 3.0, 0.08);
      // the green line sweeps through; clutter softens backward
      blurOut("#br-hl, #br-hl2", 5.0, 0.2);
      tl.set("#br-sweep", { opacity: 1, x: ${-40 - off("brochures").x} }, 5.0);
      tl.to("#br-sweep", { x: ${W + 40 - off("brochures").x}, duration: 0.75, ease: "power2.inOut" }, 5.0);
      tl.fromTo("#br-tint", { clipPath: "inset(0 0 0 0%)" }, { clipPath: "inset(0 0 0 100%)", duration: 0.75, ease: "power2.inOut" }, 5.0);
      tl.to("#br-buyer, #br-buyl", { opacity: 0, scale: 0.9, duration: 0.25, ease: "power2.in" }, 5.3);
      tl.set("#br-sweep", { opacity: 0 }, 5.76);
`;
  PROPS.forEach((_, i) => {
    const t = 5.0 + 0.75 * ((SLOTS[i][0] + off("brochures").x + 40) / (W + 80));
    script += `      tl.to(q("br-c${i}"), { opacity: 0.14, scale: 0.86, filter: "blur(3px)", duration: 0.4, ease: "power2.out" }, ${t.toFixed(2)});\n`;
  });
  script += `
      blurIn("#br-introk", 5.4, 0.16);
      wordsIn("br-introt", 3, 5.46, 0.08);
      tl.fromTo("#br-uline", { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "expo.out" }, 5.6);
      // the line runs on into the WhatsApp conversation
      blurOut("#br-introk, #br-introt", 7.5, 0.2);
      tl.to("#br-uline", { x: -900, scaleX: 1.6, duration: 0.42, ease: "power3.in" }, 7.52);
      tl.to(".pc", { opacity: 0, duration: 0.3 }, 7.55);
`;
  files["brochures"] = scene("brochures", 8.0, css, body, script);
}

// =====================================================================
// SCENE 03 — UNDERSTAND THE BUYER (8.0 – 15.4, 7.4 s)
// =====================================================================
{
  const box = { x: 80, y: 274, w: 480, h: 600 };
  const msgs = [
    { id: "un-m0", side: "out", t: 0.2, lines: ["Hi, I'm looking for an", "apartment in Dubai."], time: "10.24 AM" },
    { id: "un-m1", side: "in", t: 0.85, typing: true, lines: ["Absolutely. What budget", "range are you considering?"], time: "10.24 AM" },
    { id: "un-m2", side: "out", t: 1.45, lines: [`Around <span class="hi" id="un-h0">AED 2 million</span>.`], time: "10.24 AM" },
    { id: "un-m3", side: "in", t: 2.05, typing: true, lines: ["Which location do you prefer?"], time: "10.24 AM" },
    { id: "un-m4", side: "out", t: 2.6, lines: [`<span class="hi" id="un-h1">Dubai Marina</span>.`], time: "10.25 AM" },
    { id: "un-m5", side: "in", t: 3.2, typing: true, lines: ["What property type are", "you looking for?"], time: "10.25 AM" },
    { id: "un-m6", side: "out", t: 3.75, lines: [`<span class="hi" id="un-h2">2-bedroom</span> apartment.`], time: "10.25 AM" },
    { id: "un-m7", side: "in", t: 4.35, typing: true, lines: ["Any must-have requirements?"], time: "10.25 AM" },
    { id: "un-m8", side: "out", t: 4.95, lines: [`<span class="hi" id="un-h3">Sea view</span> and <span class="hi" id="un-h4">ready to</span>`, `<span class="hi" id="un-h5">move in</span>.`], time: "10.26 AM" },
  ];
  const chat = buildChat("un-chat", box, msgs);
  const cardX = 598, cardY = 296, cardW = 412;
  const slotX = cardX + 14, slotW = cardW - 28, slotY = (i) => cardY + 84 + i * 84;
  const chips = [
    ["wallet", "Budget", "AED 2M", 2, ["un-h0"]],
    ["pin", "Location", "Dubai Marina", 4, ["un-h1"]],
    ["building", "Property type", "2 Bedroom", 6, ["un-h2"]],
    ["spark", "Must-have", "Sea View", 8, ["un-h3"]],
    ["check", "Must-have", "Ready to Move", 8, ["un-h4", "un-h5"]],
  ];
  const css = `
#un-hl { top: 140px; font-size: 48px; }
#un-sub { top: 214px; color: ${C.greenDeep}; }
#un-card { left: ${cardX}px; top: ${cardY}px; width: ${cardW}px; height: 520px; opacity: 0; }
.un-ch { position: absolute; left: 22px; right: 22px; top: 20px; display: flex; align-items: center; gap: 12px; }
.un-ch .t { font-size: 22px; font-weight: 600; }
.un-ch .s { font-size: 15px; color: ${C.muted}; margin-top: 2px; }
.un-slot { position: absolute; left: 14px; right: 14px; height: 72px; border-radius: 16px; border: 1.5px dashed #D6CFC3; }
.chip { height: 72px; padding: 0 16px; gap: 14px; }
.chip .icbox { width: 46px !important; height: 46px !important; }
.chip .vl { font-size: 24px; }
.chip .lb { font-size: 15px; }
.chip .ck { top: 19px; }
`;
  const body = `    <h1 class="hl" id="un-hl">${words("un-hl", [["Understand what the buyer"], ["actually wants.", "g"]])}</h1>
    <div class="sub" id="un-sub">Budget · Location · Property · Requirements</div>
${chat.html}
    <div class="card" id="un-card">
      <div class="un-ch"><div class="avatar" style="width:50px;height:50px;background:${C.greenTint};color:${C.greenDeep};">${icon("user", 24)}</div><div><div class="t">Buyer Profile</div><div class="s">Built from the WhatsApp chat</div></div></div>
${chips.map((_, i) => `      <div class="un-slot" style="top:${slotY(i) - cardY}px;"></div>`).join("\n")}
    </div>
${chips.map(([ic, lb, vl], i) => chip("un-c" + i, slotX, slotY(i), slotW, ic, lb, vl)).join("\n")}
`;
  let script = `
      wordsIn("un-hl", 6, 0.05, 0.06);
      blurIn("#un-sub", 0.4, 0.2);
      tl.fromTo("#un-chat", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.5, ease: "expo.out" }, 0.0);
      tl.fromTo("#un-card", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5, ease: "expo.out" }, 0.35);
${chat.js}`;
  chips.forEach(([, , , mi, hs], i) => {
    const m = chat.laid[mi];
    const t = m.t + 0.18 + (i === 4 ? 0.16 : 0);
    const dx = Math.round(m.cx - (slotX + slotW / 2));
    const dy = Math.round(m.cy - (slotY(i) + 36));
    script += `      tl.to("${hs.map((h) => "#" + h).join(", ")}", { backgroundColor: "rgba(39,181,120,.28)", duration: 0.15 }, ${t.toFixed(2)});
      tl.fromTo(q("un-c${i}"), { opacity: 0, x: ${dx}, y: ${dy}, scale: 0.42 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.25)" }, ${t.toFixed(2)});
      tl.fromTo(q("un-c${i}-ck"), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(1.6)" }, ${(t + 0.5).toFixed(2)});
`;
  });
  script += `
      // hand the profile up into the filter row of the next scene
      blurOut("#un-hl, #un-sub", 6.75, 0.2);
      tl.to("#un-chat", { x: -80, opacity: 0, filter: "blur(6px)", duration: 0.4, ease: "power3.in" }, 6.75);
      tl.to("#un-card", { opacity: 0, duration: 0.3 }, 6.85);
      tl.to(".chip", { y: "-=170", scale: 0.6, opacity: 0, duration: 0.4, ease: "power3.in", stagger: 0.03 }, 6.9);
`;
  files["understand"] = scene("understand", 7.4, css, body, script);
}

// =====================================================================
// SCENE 04 — FIND THE RIGHT MATCH (15.4 – 19.4, 4 s)
// =====================================================================
{
  const filters = [["wallet", "AED 2M"], ["pin", "Dubai Marina"], ["building", "2 Bedroom"], ["spark", "Sea View"], ["check", "Ready to Move"]];
  const dy = 22; // scatter sits a little lower under the filter row
  const keep = { 3: 215, 1: 540, 6: 865 }; // matching cards → final centre x
  const css = `
${PCARD_CSS}
#mt-hl { top: 128px; font-size: 48px; }
#mt-filters { position: absolute; left: 0; right: 0; top: 256px; display: flex; justify-content: center; gap: 10px; }
.mt-f { height: 42px; border-radius: 999px; background: #fff; border: 1.5px solid ${C.green}; color: ${C.ink}; display: flex; align-items: center; gap: 7px; padding: 0 14px; font-size: 17px; font-weight: 600; opacity: 0; box-shadow: 0 8px 18px -12px rgba(14,122,76,.5); }
.mt-f .ic { color: ${C.greenDeep}; }
#mt-scan { position: absolute; left: 40px; right: 40px; top: 318px; height: 4px; border-radius: 2px; background: ${C.green}; box-shadow: 0 0 22px 5px rgba(39,181,120,.35); opacity: 0; }
.mt-ring { position: absolute; inset: -1px; border-radius: 24px; border: 3px solid ${C.green}; opacity: 0; }
#mt-best { position: absolute; left: 16px; top: 16px; background: ${C.greenDeep}; color: #fff; font-size: 13px; padding: 5px 10px; opacity: 0; z-index: 2; }
`;
  let body = `    <h1 class="hl" id="mt-hl">${words("mt-hl", [["From hundreds of options"], ["<br>"], ["to the"], ["properties that fit.", "g"]])}</h1>
    <div id="mt-filters">${filters.map(([ic, t], i) => `<div class="mt-f" id="mt-f${i}">${icon(ic, 17)}${t}</div>`).join("")}</div>
${PROPS.map((p, i) => pcard("mt-c" + i, p, SLOTS[i][0], SLOTS[i][1] + dy, null)).join("\n")}
    <div id="mt-scan" data-layout-ignore></div>
`;
  // ring + badge on the best match card (Marina Vista, index 1)
  body = body.replace(`<div class="nm">Marina Vista</div>`, `<div class="nm">Marina Vista</div><div class="mt-ring" id="mt-ring"></div>`);
  body = body.replace(`<img src="assets/images/marina-vista.jpg" alt="Marina Vista">`, `<img src="assets/images/marina-vista.jpg" alt="Marina Vista"><span class="pill" id="mt-best">${icon("check", 13, 3)}Best Match</span>`);
  let script = `
      wordsIn("mt-hl", 9, 0.1, 0.05);
      for (let i = 0; i < 5; i++) tl.fromTo(q("mt-f" + i), { opacity: 0, y: -14, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.5)" }, 0.2 + i * 0.07);
`;
  PROPS.forEach((p, i) => {
    const [cx, cy, r] = SLOTS[i];
    script += `      tl.fromTo(q("mt-c${i}"), { opacity: 0, scale: 0.8, rotation: ${r}, filter: "blur(3px)" }, { opacity: 1, scale: 0.92, rotation: ${r}, filter: "blur(0px)", duration: 0.35, ease: "power3.out" }, ${(0.05 + i * 0.025).toFixed(3)});\n`;
    const tPass = 0.8 + ((cy + dy - 318) / 560) * 0.8;
    if (!p.m) {
      script += `      tl.to(q("mt-c${i}"), { opacity: 0.1, scale: 0.74, filter: "blur(2px)", duration: 0.35, ease: "power2.out" }, ${tPass.toFixed(2)});\n`;
    } else {
      const tx = keep[i] - cx, ty = 600 - (cy + dy);
      script += `      tl.to(q("mt-c${i}"), { x: ${tx}, y: ${ty}, rotation: 0, scale: 1.2, duration: 0.6, ease: "power3.inOut", zIndex: 5 }, 1.7);\n`;
    }
  });
  script += `
      tl.set("#mt-scan", { opacity: 1 }, 0.8);
      tl.fromTo("#mt-scan", { y: 0 }, { y: 560, duration: 0.8, ease: "power1.inOut" }, 0.8);
      tl.to("#mt-scan", { opacity: 0, duration: 0.15 }, 1.55);
      // best match comes forward
      tl.to("#mt-c3, #mt-c6", { opacity: 0.72, duration: 0.3 }, 2.45);
      tl.to("#mt-c1", { scale: 1.3, duration: 0.4, ease: "expo.out" }, 2.45);
      tl.to("#mt-ring", { opacity: 1, duration: 0.18 }, 2.45);
      tl.fromTo("#mt-best", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" }, 2.52);
      // travel into WhatsApp
      blurOut("#mt-hl, #mt-filters", 3.55, 0.2);
      tl.to("#mt-c6", { opacity: 0, x: "+=60", duration: 0.25, ease: "power3.in" }, 3.55);
      tl.to("#mt-c1, #mt-c3", { scale: 0.7, y: "-=10", opacity: 0, duration: 0.4, ease: "power3.in" }, 3.6);
`;
  files["match"] = scene("match", 4.0, css, body, script);
}

// =====================================================================
// SCENE 05 — RECOMMENDATIONS IN WHATSAPP (19.4 – 23.4, 4 s)
// =====================================================================
{
  const box = { x: 300, y: 274, w: 480, h: 600 };
  const wcard = (p) => `<div style="width:214px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 1px rgba(0,0,0,.07);white-space:nowrap;"><img src="assets/images/${p.k}.jpg" alt="${p.n}" style="width:214px;height:118px;object-fit:cover;display:block;"><div style="padding:9px 12px 0;"><div style="font-size:18px;line-height:23px;font-weight:600;">${p.n}</div><div style="font-size:17px;line-height:23px;font-weight:600;color:${C.greenDeep};">${p.p}</div><div style="font-size:14px;line-height:20px;color:#666;">${p.t} · ${p.a}</div></div><div style="margin-top:8px;border-top:1px solid #E6E6E6;height:42px;display:flex;align-items:center;justify-content:center;font-size:17px;color:#1A96D5;font-weight:500;">View Details</div></div>`;
  const carousel = `<div style="display:flex;gap:10px;">${wcard(PROPS[1])}${wcard(PROPS[3])}</div>`;
  const msgs = [
    { id: "rc-m0", side: "out", t: 0.02, lines: ["Sea view and ready to", "move in."], time: "10.26 AM" },
    { id: "rc-m1", side: "in", t: 0.45, typing: true, lines: ["Based on your requirements,", "here are the best matches", "in Dubai Marina."], time: "10.26 AM" },
    { id: "rc-m2", side: "in", t: 0.95, lines: [carousel], h: 262, w: 452, style: "background:transparent;box-shadow:none;padding:0;", time: "" },
    { id: "rc-m3", side: "in", t: 1.65, lines: ["Want to compare them", "side by side?"], buttons: ["Compare"], extraH: 60, time: "10.26 AM" },
    { id: "rc-m4", side: "out", t: 3.1, lines: ["Compare"], time: "10.27 AM" },
  ];
  const chat = buildChat("rc-chat", box, msgs);
  const css = `
#rc-hl { top: 140px; font-size: 54px; }
#rc-m2 .tm { display: none; }
`;
  const body = `    <h1 class="hl" id="rc-hl">${words("rc-hl", [["Shared instantly"], ["on WhatsApp.", "g"]])}</h1>
${chat.html}
`;
  const script = `
      wordsIn("rc-hl", 4, 0.05, 0.07);
      tl.fromTo("#rc-chat", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: "expo.out" }, 0.0);
${chat.js}
      // the buyer taps Compare
      tl.to("#rc-m3-b0", { backgroundColor: "#DCEEF8", duration: 0.08 }, 2.85);
      tl.to("#rc-m3-b0", { backgroundColor: "rgba(220,238,248,0)", duration: 0.3 }, 3.0);
      blurOut("#rc-hl", 3.62, 0.2);
      tl.to("#rc-chat", { opacity: 0, scale: 0.96, filter: "blur(6px)", duration: 0.3, ease: "power3.in" }, 3.65);
`;
  files["recommend"] = scene("recommend", 4.0, css, body, script);
}

// =====================================================================
// SCENE 06 — COMPARE PROPERTIES (23.4 – 28.6, 5.2 s)
// =====================================================================
{
  const PX = 90, PY = 280, PW = 900;
  const rows = [
    ["Price", "AED 1.95M", "AED 2.05M"],
    ["Amenities", "Pool · Gym · Parking", "Pool · Gym · Marina View"],
    ["Unit size", "1,240 sq ft", "1,310 sq ft"],
    ["Payment plan", "40 / 60", "50 / 50"],
  ];
  const colX = [216, 558], colW = 320, rowY0 = 268, rowH = 60;
  const col = (p, j) => `      <div class="cp-col" id="cp-col${j}" style="left:${colX[j]}px;">
        <div class="cp-im"><img src="assets/images/${p.k}.jpg" alt="${p.n}">${j === 0 ? `<span class="pill" id="cp-best">${icon("check", 13, 3)}Best Match</span>` : ""}</div>
        <div class="cp-nm">${p.n}</div>
        <div class="cp-ar">${p.t} · ${p.a}</div>
${rows.map((r, i) => `        <div class="cp-v" id="cp-v${j}${i}" style="top:${rowY0 + i * rowH}px;">${r[j + 1]}</div>`).join("\n")}
      </div>`;
  const css = `
#cp-hl { top: 140px; font-size: 58px; }
#cp-sub { top: 220px; color: ${C.greenDeep}; }
#cp-panel { left: ${PX}px; top: ${PY}px; width: ${PW}px; height: 600px; overflow: hidden; opacity: 0; }
.cp-top { position: absolute; left: 0; right: 0; top: 0; height: 60px; border-bottom: 1px solid ${C.line}; display: flex; align-items: center; gap: 10px; padding: 0 24px; font-size: 18px; font-weight: 600; }
.cp-top .s { margin-left: auto; font-size: 15px; color: ${C.muted}; font-weight: 500; }
.cp-band { position: absolute; left: 12px; right: 12px; height: ${rowH - 6}px; border-radius: 12px; background: ${C.greenTint}; opacity: 0; }
.cp-lb { position: absolute; left: 30px; width: 170px; height: ${rowH}px; display: flex; align-items: center; font-size: 16px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: ${C.muted}; opacity: 0; }
.cp-col { position: absolute; top: 76px; width: ${colW}px; height: 500px; opacity: 0; }
.cp-im { position: relative; width: ${colW}px; height: 180px; border-radius: 14px; overflow: hidden; }
.cp-im img { width: 100%; height: 100%; object-fit: cover; display: block; }
#cp-best { position: absolute; left: 12px; top: 12px; background: ${C.greenDeep}; color: #fff; font-size: 13px; padding: 5px 10px; }
.cp-nm { font-size: 24px; font-weight: 600; margin-top: 12px; letter-spacing: -0.01em; }
.cp-ar { font-size: 15px; color: ${C.muted}; margin-top: 3px; }
.cp-v { position: absolute; left: 0; width: ${colW}px; height: ${rowH}px; display: flex; align-items: center; font-size: 21px; font-weight: 600; white-space: nowrap; }
.cp-hr { position: absolute; left: 24px; right: 24px; height: 1px; background: ${C.line}; }
`;
  const body = `    <h1 class="hl" id="cp-hl">${words("cp-hl", [["Compare"], ["what matters.", "g"]])}</h1>
    <div class="sub" id="cp-sub">Price · Amenities · Size · Payment Plan</div>
    <div class="card" id="cp-panel">
      <div class="cp-top">${waLogo(26)}ABC Properties · Compare<span class="s">2 properties · Dubai Marina</span></div>
${rows.map((_, i) => `      <div class="cp-band" id="cp-band${i}" style="top:${rowY0 + 76 + i * rowH + 3}px;"></div>`).join("\n")}
${rows.map((_, i) => `      <div class="cp-hr" style="top:${rowY0 + 76 + i * rowH}px;"></div>`).join("\n")}
${rows.map((r, i) => `      <div class="cp-lb" id="cp-lb${i}" style="top:${rowY0 + 76 + i * rowH}px;">${r[0]}</div>`).join("\n")}
${col(PROPS[1], 0)}
${col(PROPS[3], 1)}
    </div>
`;
  let script = `
      wordsIn("cp-hl", 3, 0.05, 0.08);
      blurIn("#cp-sub", 0.35, 0.2);
      tl.fromTo("#cp-panel", { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, 0.0);
      // the two WhatsApp cards expand apart into columns
      tl.fromTo("#cp-col0", { opacity: 0, x: 150, scale: 0.62 }, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "expo.out" }, 0.08);
      tl.fromTo("#cp-col1", { opacity: 0, x: -150, scale: 0.62 }, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "expo.out" }, 0.12);
      for (let i = 0; i < 4; i++) tl.fromTo(q("cp-lb" + i), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, 0.5 + i * 0.06);
`;
  [1.3, 2.05, 2.8, 3.55].forEach((t, i) => {
    script += `      tl.fromTo(q("cp-band${i}"), { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power2.out" }, ${t});
      tl.to(q("cp-lb${i}"), { color: "${C.greenDeep}", duration: 0.18 }, ${t});
      tl.to([q("cp-v0${i}"), q("cp-v1${i}")], { color: "${C.greenDeep}", duration: 0.18 }, ${t});
${i < 3 ? `      tl.to(q("cp-band${i}"), { opacity: 0, duration: 0.25 }, ${(t + 0.6).toFixed(2)});
      tl.to(q("cp-lb${i}"), { color: "${C.muted}", duration: 0.25 }, ${(t + 0.6).toFixed(2)});
      tl.to([q("cp-v0${i}"), q("cp-v1${i}")], { color: "${C.ink}", duration: 0.25 }, ${(t + 0.6).toFixed(2)});
` : ""}`;
  });
  script += `
      blurOut("#cp-hl, #cp-sub", 4.88, 0.2);
      tl.to("#cp-col1", { opacity: 0, x: 40, duration: 0.25, ease: "power3.in" }, 4.88);
      tl.to("#cp-panel", { opacity: 0, scale: 0.97, filter: "blur(6px)", duration: 0.28, ease: "power3.in" }, 4.92);
`;
  files["compare"] = scene("compare", 5.2, css, body, script);
}

// =====================================================================
// SCENE 07+08 — FOLLOW-UP QUESTIONS + BOOK THE VIEWING (28.6 – 36.4, 7.8 s)
// =====================================================================
{
  const box = { x: 80, y: 274, w: 480, h: 600 };
  const msgs = [
    { id: "ak-m0", side: "out", t: 0.02, lines: ["Compare"], time: "10.27 AM" },
    { id: "ak-m1", side: "out", t: 0.3, lines: ["Does Marina Vista have", "covered parking?"], time: "10.28 AM" },
    { id: "ak-m2", side: "in", t: 1.0, typing: true, lines: ["Yes. Covered parking is included."], time: "10.28 AM" },
    { id: "ak-m3", side: "out", t: 1.75, lines: ["And when is it ready?"], time: "10.28 AM" },
    { id: "ak-m4", side: "in", t: 2.45, typing: true, lines: ["This unit is ready to move in."], time: "10.28 AM" },
    { id: "ak-m5", side: "in", t: 4.2, typing: true, lines: ["Would you like to schedule a", "viewing for Marina Vista?"], buttons: ["Book a viewing", "Maybe later"], extraH: 112, time: "10.29 AM" },
    { id: "ak-m6", side: "out", t: 4.95, lines: ["Yes. Saturday afternoon."], time: "10.29 AM" },
  ];
  const chat = buildChat("ak-chat", box, msgs);
  const CX = 598, CY = 296, CWd = 412, CHt = 540;
  const css = `
#ak-hl { top: 140px; font-size: 54px; }
#ak-hl2 { top: 140px; font-size: 54px; }
#ak-card { left: ${CX}px; top: ${CY}px; width: ${CWd}px; height: ${CHt}px; overflow: hidden; opacity: 0; }
#ak-img { position: absolute; left: 14px; top: 14px; width: 384px; height: 200px; border-radius: 16px; overflow: hidden; transform-origin: 0 0; }
#ak-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
#ak-a { position: absolute; inset: 0; }
#ak-a .nm { position: absolute; left: 24px; top: 230px; font-size: 26px; font-weight: 600; letter-spacing: -0.01em; }
#ak-a .ar { position: absolute; left: 24px; top: 266px; font-size: 16px; color: ${C.muted}; }
#ak-a .pr { position: absolute; left: 24px; top: 292px; font-size: 24px; font-weight: 600; color: ${C.greenDeep}; }
.ak-f { position: absolute; left: 14px; right: 14px; height: 60px; border-radius: 14px; background: #F6F3EE; display: flex; align-items: center; gap: 12px; padding: 0 14px; font-size: 19px; font-weight: 600; }
.ak-f .icbox { width: 38px; height: 38px; border-radius: 10px; }
.ak-f .ck { margin-left: auto; width: 30px; height: 30px; border-radius: 50%; background: ${C.green}; color: #fff; display: flex; align-items: center; justify-content: center; opacity: 0; }
.ak-f .q { margin-left: auto; font-size: 14px; color: ${C.muted}; font-weight: 500; }
#ak-b { position: absolute; inset: 0; opacity: 0; }
.ak-bh { position: absolute; left: 24px; right: 24px; top: 24px; display: flex; align-items: center; gap: 14px; }
.ak-bh .t { font-size: 24px; font-weight: 600; }
.ak-bh .s { font-size: 15px; color: ${C.muted}; margin-top: 2px; }
#ak-b .nm { position: absolute; left: 140px; top: 112px; font-size: 21px; font-weight: 600; }
#ak-b .ar { position: absolute; left: 140px; top: 142px; font-size: 15px; color: ${C.muted}; }
#ak-b .wl { position: absolute; left: 24px; top: 214px; font-size: 14px; color: ${C.muted}; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
#ak-b .wt { position: absolute; left: 24px; top: 238px; font-size: 32px; font-weight: 600; letter-spacing: -0.01em; }
#ak-btn { position: absolute; left: 24px; right: 24px; bottom: 28px; height: 66px; border-radius: 18px; border: 2px solid ${C.greenDeep}; overflow: hidden; }
#ak-bfill { position: absolute; inset: 0; background: ${C.greenDeep}; transform-origin: 0% 50%; }
.ak-bt { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 23px; font-weight: 600; }
#ak-bt0 { color: ${C.greenDeep}; }
#ak-bt1 { color: #fff; opacity: 0; }
`;
  const body = `    <h1 class="hl" id="ak-hl">${words("ak-hl", [["Questions answered"], ["in context.", "g"]])}</h1>
    <h1 class="hl" id="ak-hl2">${words("ak-hl2", [["Property found."], ["Viewing booked.", "g"]])}</h1>
${chat.html}
    <div class="card" id="ak-card">
      <div id="ak-a">
        <div class="nm">Marina Vista</div>
        <div class="ar">2 Bedroom · Dubai Marina · 1,240 sq ft</div>
        <div class="pr">AED 1.95M</div>
        <div class="ak-f" id="ak-f0" style="top:346px;"><div class="icbox">${icon("home", 20)}</div>Covered parking<span class="q" id="ak-q0">Asked</span><div class="ck" id="ak-k0">${icon("check", 18, 3)}</div></div>
        <div class="ak-f" id="ak-f1" style="top:418px;"><div class="icbox">${icon("calendar", 20)}</div>Ready to move in<span class="q" id="ak-q1">Asked</span><div class="ck" id="ak-k1">${icon("check", 18, 3)}</div></div>
      </div>
      <div id="ak-b">
        <div class="ak-bh"><div class="icbox" style="width:52px;height:52px;">${icon("calendar", 26)}</div><div><div class="t">Property Viewing</div><div class="s">Scheduled by Agentic AI</div></div></div>
        <div class="nm">Marina Vista</div>
        <div class="ar">2 Bedroom · Dubai Marina</div>
        <div class="wl">Date &amp; time</div>
        <div class="wt">Saturday · 3:00 PM</div>
        <div id="ak-btn"><div id="ak-bfill"></div><div class="ak-bt" id="ak-bt0">Confirm viewing</div><div class="ak-bt" id="ak-bt1">Viewing Booked ${icon("check", 24, 3)}</div></div>
      </div>
      <div id="ak-img"><img src="assets/images/marina-vista.jpg" alt="Marina Vista"></div>
    </div>
`;
  const script = `
      gsap.set("#ak-hl2 .w", { opacity: 0 });
      wordsIn("ak-hl", 4, 0.05, 0.07);
      tl.fromTo("#ak-chat", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.45, ease: "expo.out" }, 0.0);
      tl.fromTo("#ak-card", { opacity: 0, x: 40, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "expo.out" }, 0.1);
${chat.js}
      // answers tick on the property, in context
      tl.to("#ak-f0", { backgroundColor: "${C.greenTint}", duration: 0.2 }, 1.15);
      tl.to("#ak-q0", { opacity: 0, duration: 0.1 }, 1.15);
      tl.fromTo("#ak-k0", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.6)" }, 1.15);
      tl.to("#ak-f1", { backgroundColor: "${C.greenTint}", duration: 0.2 }, 2.6);
      tl.to("#ak-q1", { opacity: 0, duration: 0.1 }, 2.6);
      tl.fromTo("#ak-k1", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.6)" }, 2.6);
      // headline swap
      blurOut("#ak-hl", 3.95, 0.18);
      wordsIn("ak-hl2", 4, 4.12, 0.07);
      // the property card morphs into the appointment card
      tl.to("#ak-m5-b0", { backgroundColor: "#DCEEF8", duration: 0.08 }, 4.8);
      tl.to("#ak-m5-b0", { backgroundColor: "rgba(220,238,248,0)", duration: 0.3 }, 4.95);
      tl.to("#ak-a", { opacity: 0, duration: 0.2 }, 5.25);
      tl.to("#ak-img", { x: 10, y: 92, scale: 0.26, borderRadius: 40, duration: 0.5, ease: "power3.inOut" }, 5.25);
      tl.fromTo("#ak-b", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 5.5);
      tl.fromTo("#ak-bfill", { scaleX: 0 }, { scaleX: 1, duration: 0.36, ease: "power2.inOut" }, 6.05);
      tl.to("#ak-bt0", { opacity: 0, duration: 0.1 }, 6.1);
      tl.fromTo("#ak-bt1", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: "expo.out" }, 6.3);
      // collapse toward the journey line
      blurOut("#ak-hl2", 7.5, 0.2);
      tl.to("#ak-chat, #ak-card", { opacity: 0, scale: 0.95, filter: "blur(6px)", duration: 0.28, ease: "power3.in" }, 7.5);
`;
  files["ask"] = scene("ask", 7.8, css, body, script);
}

// =====================================================================
// SCENE 09 — COMPLETE BUYER JOURNEY (36.4 – 41.2, 4.8 s)
// =====================================================================
{
  const nodes = [
    ["user", "Buyer<br>Requirement"],
    ["home", "Property<br>Match"],
    ["grid", "Compare"],
    ["chat", "Questions"],
    ["calendar", "Viewing"],
    ["check", "Site Visit ✓"],
  ];
  const nx = (i) => 120 + i * 168;
  const ly = 540;
  const css = `
#jy-hl { top: 178px; font-size: 70px; }
#jy-svg { position: absolute; left: 0; top: 0; width: 1080px; height: 1080px; overflow: visible; }
.jy-n { position: absolute; top: ${ly - 36}px; width: 72px; height: 72px; border-radius: 50%; background: #fff; border: 2.5px solid ${C.green}; color: ${C.greenDeep}; display: flex; align-items: center; justify-content: center; opacity: 0; box-shadow: 0 8px 20px -10px rgba(14,122,76,.4); }
.jy-l { position: absolute; top: ${ly + 52}px; width: 160px; text-align: center; font-size: 20px; line-height: 25px; font-weight: 600; opacity: 0; }
#jy-sub { top: 720px; font-size: 46px; }
`;
  const body = `    <h1 class="hl" id="jy-hl">${words("jy-hl", [["From property search"], ["<br>"], ["to"], ["site visit.", "g"]])}</h1>
    <svg id="jy-svg" viewBox="0 0 1080 1080" data-layout-ignore>
      <path d="M${nx(0)} ${ly} L${nx(5)} ${ly}" stroke="${C.line}" stroke-width="4" stroke-linecap="round"/>
      <path id="jy-path" d="M${nx(0)} ${ly} L${nx(5)} ${ly}" stroke="${C.green}" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" fill="none"/>
    </svg>
${nodes
  .map(
    ([ic, lb], i) => `    <div class="jy-n" id="jy-n${i}" style="left:${nx(i) - 36}px;${i === 5 ? `background:${C.greenDeep};color:#fff;border-color:${C.greenDeep};` : ""}">${icon(ic, i === 5 ? 34 : 30, i === 5 ? 3 : 2)}</div>
    <div class="jy-l" id="jy-l${i}" style="left:${nx(i) - 80}px;${i === 5 ? `color:${C.greenDeep};` : ""}">${lb}</div>`,
  )
  .join("\n")}
    <h2 class="hl" id="jy-sub">${words("jy-sub", [["Keep every buyer"], ["moving forward.", "g"]])}</h2>
`;
  const script = `
      wordsIn("jy-hl", 6, 0.1, 0.07);
      tl.to("#jy-path", { strokeDashoffset: 0, duration: 1.8, ease: "power1.inOut" }, 0.55);
      for (let i = 0; i < 6; i++) {
        const t = 0.55 + 1.8 * (i / 5) * 0.97;
        tl.fromTo(q("jy-n" + i), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }, t - 0.05);
        tl.fromTo(q("jy-l" + i), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" }, t);
      }
      tl.to("#jy-n5", { scale: 1.12, duration: 0.2, ease: "power2.out" }, 2.45);
      tl.to("#jy-n5", { scale: 1, duration: 0.3, ease: "power2.inOut" }, 2.65);
      wordsIn("jy-sub", 5, 2.2, 0.07);
      tl.to(".jy-n, .jy-l, #jy-svg, #jy-hl, #jy-sub", { opacity: 0, filter: "blur(8px)", duration: 0.22, ease: "power3.in" }, 4.56);
`;
  files["journey"] = scene("journey", 4.8, css, body, script);
}

// =====================================================================
// SCENE 10 — CTA (41.2 – 45.2, 4 s)
// =====================================================================
{
  const css = `
#cta-hl { top: 392px; font-size: 64px; line-height: 1.1; }
#cta-btnw { position: absolute; left: 0; right: 0; top: 602px; display: flex; justify-content: center; }
#cta-btn { position: relative; height: 92px; padding: 0 44px; border-radius: 999px; background: ${C.greenDeep}; color: #fff; font-size: 34px; font-weight: 600; display: flex; align-items: center; gap: 14px; letter-spacing: -0.005em; box-shadow: 0 18px 40px -16px rgba(14,122,76,.6); opacity: 0; }
#cta-ring { position: absolute; inset: 0; border-radius: 999px; border: 3px solid ${C.green}; opacity: 0; }
#cta-url { position: absolute; left: 0; right: 0; top: 722px; text-align: center; font-size: 22px; color: ${C.muted}; font-weight: 500; opacity: 0; }
`;
  const body = `    <h1 class="hl" id="cta-hl">${words("cta-hl", [["Help every buyer find the"], ["<br>"], ["right property.", "g"]])}</h1>
    <div id="cta-btnw"><div id="cta-btn"><div id="cta-ring"></div>Book Your Free Demo Today <span id="cta-arrow" style="display:inline-block">→</span></div></div>
    <div id="cta-url">doubletick.io</div>
`;
  const script = `
      wordsIn("cta-hl", 7, 0.3, 0.06);
      // CTA: opacity 0→1, scale .96→1 in 0.28 s, magnetic settle, one pulse, hold
      tl.fromTo("#cta-btn", { opacity: 0, scale: 0.96, y: 10 }, { opacity: 1, scale: 1, duration: 0.28, ease: "power3.out" }, 1.1);
      tl.to("#cta-btn", { y: 0, duration: 0.5, ease: "elastic.out(1, 0.75)" }, 1.1);
      tl.fromTo("#cta-arrow", { x: -6 }, { x: 0, duration: 0.45, ease: "expo.out" }, 1.25);
      blurIn("#cta-url", 1.45, 0.2);
      tl.to("#cta-btn", { scale: 1.035, duration: 0.2, ease: "power2.out" }, 2.05);
      tl.to("#cta-btn", { scale: 1, duration: 0.35, ease: "power2.inOut" }, 2.25);
      tl.fromTo("#cta-ring", { opacity: 0.8, scale: 1 }, { opacity: 0, scale: 1.18, duration: 0.7, ease: "power2.out" }, 2.05);
`;
  files["cta"] = scene("cta", 4.0, css, body, script);
}

// =====================================================================
// CAPTIONS
// =====================================================================
const TOTAL = 45.2;
const CAPS = [
  [0.3, 2.62, "Property buyers don't need more brochures."],
  [3.0, 4.55, "They need the right property."],
  [5.3, 7.8, "Introducing DoubleTick Agentic AI."],
  [8.6, 10.5, "It understands what each buyer wants,"],
  [10.7, 12.7, "their budget, preferred location,"],
  [12.75, 14.8, "property type and key requirements."],
  [16.0, 19.7, "Then, it instantly shares the most relevant properties on WhatsApp."],
  [23.6, 25.25, "Buyers can compare prices,"],
  [25.4, 28.2, "amenities, unit sizes and payment plans,"],
  [28.9, 30.5, "ask follow-up questions,"],
  [32.95, 35.8, "and book a viewing, all within the same conversation."],
  [36.6, 38.35, "From property search to site visit,"],
  [38.5, 41.1, "DoubleTick keeps every buyer moving forward."],
  [41.9, 43.6, "Book your free demo today."],
];
{
  const css = `
.cap { position: absolute; left: ${LAND ? 360 : 110}px; right: ${LAND ? 360 : 110}px; top: ${CAP_TOP}px; text-align: center; font-family: "Geist", sans-serif; font-weight: 500; font-size: 28px; line-height: 36px; color: #2A2926; opacity: 0; }
`;
  const body = CAPS.map(([, , t], i) => `    <div class="cap" id="cap-${i}">${t}</div>`).join("\n");
  let script = "";
  CAPS.forEach(([s, e], i) => {
    script += `      tl.fromTo(q("cap-${i}"), { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power2.out" }, ${s});
      tl.to(q("cap-${i}"), { opacity: 0, duration: 0.12, ease: "power2.in" }, ${(e - 0.12).toFixed(2)});
      tl.set(q("cap-${i}"), { opacity: 0, visibility: "hidden" }, ${e});
`;
  });
  files["captions"] = scene("captions", TOTAL, css, body, script).replace(
    `#root { position: absolute; inset: 0; overflow: hidden; background: ${C.bg};`,
    `#root { position: absolute; inset: 0; overflow: hidden; background: transparent;`,
  );
}

for (const [id, html] of Object.entries(files)) fs.writeFileSync(path.join(OUT, "compositions", id + ".html"), html);

const SCENES = [
  ["brochures", 0, 8.0],
  ["understand", 8.0, 7.4],
  ["match", 15.4, 4.0],
  ["recommend", 19.4, 4.0],
  ["compare", 23.4, 5.2],
  ["ask", 28.6, 7.8],
  ["journey", 36.4, 4.8],
  ["cta", 41.2, 4.0],
];
const VO = [
  ["vo01", 0.3], ["vo02", 3.0], ["vo03", 5.3], ["vo04", 8.6], ["vo05", 16.0],
  ["vo06a", 23.6], ["vo06b", 28.9], ["vo06c", 32.95], ["vo07", 36.6], ["vo08", 41.9],
];
const SFX = [
  ["whoosh-short", 0.03, 0.2], ["pop", 0.24, 0.2], ["pop", 0.5, 0.18],
  ["whoosh", 5.0, 0.32], ["impact-bass-1", 5.46, 0.28], ["whoosh-short", 7.55, 0.22],
  ["click-soft", 9.95, 0.35], ["click-soft", 11.1, 0.35], ["click-soft", 12.25, 0.35], ["click-soft", 13.45, 0.35], ["pop", 13.62, 0.24],
  ["whoosh-short", 16.2, 0.24], ["click", 17.92, 0.34], ["sparkle", 17.98, 0.26],
  ["notification", 19.9, 0.22], ["click", 22.25, 0.34],
  ["whoosh-short", 23.45, 0.22], ["click-soft", 24.7, 0.32], ["click-soft", 25.45, 0.32], ["click-soft", 26.2, 0.32], ["click-soft", 26.95, 0.32],
  ["pop", 29.76, 0.24], ["pop", 31.21, 0.24], ["click", 33.4, 0.32], ["whoosh-short", 33.85, 0.18], ["click", 34.66, 0.34], ["sparkle", 34.92, 0.3],
  ["whoosh", 37.0, 0.24], ["pop", 38.86, 0.26],
  ["whoosh-short", 41.25, 0.2], ["impact-bass-1", 42.32, 0.3],
];
const vars = [
  { id: "cta_text", type: "string", label: "CTA text", default: "Book Your Free Demo Today" },
];
const root = `<!doctype html>
<html lang="en" data-resolution="${W === H ? "square" : LAND ? "landscape" : "portrait"}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>DoubleTick Agentic AI — Property Discovery</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.bg}; }
      #ground { position: absolute; inset: 0; background: ${C.bg}; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
      <div id="ground"></div>
${SCENES.map(
  ([id, s, d], i) =>
    `      <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${s}" data-duration="${d}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:${i + 1}"></div>`,
).join("\n")}
      <img id="dt-logo" class="clip" src="assets/brand/logo-dark.svg" alt="DoubleTick" data-start="0" data-duration="${TOTAL}" data-track-index="0" style="position:absolute;left:80px;top:80px;width:245px;height:30px;z-index:45;">
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${TOTAL}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}" style="z-index:50"></div>
${VO.map(
  ([f, s]) => `      <audio id="${f}" class="clip" src="assets/vo/${f}.wav" data-start="${s}" data-duration="${dur(path.join(OUT, "assets/vo/" + f + ".wav"))}" data-track-index="3" data-volume="1"></audio>`,
).join("\n")}
${(() => {
  const ends = [];
  return SFX.map(([f, s, v], i) => {
    const d = Number(dur(path.join(OUT, "assets/sfx/" + f + ".mp3")));
    let k = ends.findIndex((e) => e <= s);
    if (k < 0) { k = ends.length; ends.push(0); }
    ends[k] = s + d;
    return `      <audio id="sfx${String(i).padStart(2, "0")}" class="clip" src="assets/sfx/${f}.mp3" data-start="${s}" data-duration="${d.toFixed(3)}" data-track-index="${4 + k}" data-volume="${v}"></audio>`;
  }).join("\n");
})()}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(OUT, "index.html"), root);
console.log("wrote", Object.keys(files).length, "scenes");
