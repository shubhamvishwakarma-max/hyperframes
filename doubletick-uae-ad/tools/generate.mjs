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
      (m) => `          <div class="bub ${m.side}" id="${m.id}" style="top:${m.top}px;${m.w ? `width:${m.w}px;` : ""}${m.style || ""}">${m.lines.join("<br>")}${m.extra || ""}<span class="tm">${m.time || "10.24 AM"}</span>${m.buttons ? `<div class="btns">${m.buttons.map((b) => `<div class="btn">${b}</div>`).join("")}</div>` : ""}</div>`,
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
// SCENE 1 — ADS ARE WORKING (0 – 3.8)
// =====================================================================
{
  const src = [
    ["megaphone", "Property Ad", "Meta · Live"],
    ["share", "Social Ad", "Instagram · Live"],
    ["grid", "Listing Campaign", "Portal · Live"],
  ];
  const cardY = [398, 536, 674];
  const rowY = [478, 578, 678]; // abs centres of inbox rows
  const css = `
#ads-hl { top: 140px; font-size: 80px; }
.ads-src { left: 96px; width: 332px; height: 108px; display: flex; align-items: center; gap: 16px; padding: 0 22px; opacity: 0; }
.ads-src .t { font-size: 24px; font-weight: 600; }
.ads-src .s { font-size: 17px; color: ${C.muted}; display: flex; align-items: center; gap: 7px; margin-top: 3px; }
.ads-src .dot { width: 8px; height: 8px; border-radius: 50%; background: ${C.green}; display: block; }
#ads-inbox { left: 604px; top: 366px; width: 380px; height: 424px; opacity: 0; }
.ads-ihead { position: absolute; left: 22px; right: 22px; top: 20px; height: 48px; display: flex; align-items: center; gap: 12px; }
.ads-ihead .t { font-size: 22px; font-weight: 600; }
.ads-cnt { position: absolute; right: 0; top: 10px; font-size: 16px; font-weight: 600; color: ${C.greenDeep}; background: ${C.greenTint}; border-radius: 999px; padding: 5px 12px; opacity: 0; }
.ads-lead { position: absolute; left: 18px; right: 18px; height: 86px; border-radius: 16px; background: #fff; border: 1px solid ${C.line}; display: flex; align-items: center; gap: 14px; padding: 0 16px; opacity: 0; }
.ads-lead .t { font-size: 22px; font-weight: 600; }
.ads-lead .s { font-size: 16px; color: ${C.muted}; margin-top: 2px; }
.ads-lead .now { margin-left: auto; text-align: right; font-size: 14px; color: ${C.greenDeep}; font-weight: 600; }
.ads-lead .bd { width: 24px; height: 24px; border-radius: 50%; background: ${C.greenDeep}; color: #fff; font-size: 13px; display: flex; align-items: center; justify-content: center; margin: 5px 0 0 auto; }
#ads-wires { position: absolute; left: 0; top: 0; width: 1080px; height: 1080px; overflow: visible; }
`;
  let body = `    <h1 class="hl" id="ads-hl">${words("ads-hl", [["Your real estate ads"], ["<br>"], ["are"], ["working.", "g"]])}</h1>
    <svg id="ads-wires" viewBox="0 0 1080 1080" data-layout-ignore>
${cardY
  .map(
    (y, i) =>
      `      <path id="ads-wire${i}" d="M428 ${y + 54} C 520 ${y + 54}, 512 ${rowY[i]}, 604 ${rowY[i]}" fill="none" stroke="${C.green}" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`,
  )
  .join("\n")}
    </svg>
`;
  src.forEach(([ic, t, s], i) => {
    body += `    <div class="card ads-src" id="ads-src${i}" style="top:${cardY[i]}px;">
      <div class="icbox" style="width:58px;height:58px;">${icon(ic, 28)}</div>
      <div><div class="t">${t}</div><div class="s"><span class="dot"></span>${s}</div></div>
    </div>
`;
  });
  body += `    <div class="card" id="ads-inbox">
      <div class="ads-ihead">
        ${waLogo(40)}
        <div class="t">WhatsApp</div>
        <div class="ads-cnt" id="ads-cnt0">1 new</div><div class="ads-cnt" id="ads-cnt1">2 new</div><div class="ads-cnt" id="ads-cnt2">3 new</div>
      </div>
${src
  .map(
    ([, t], i) => `      <div class="ads-lead" id="ads-lead${i}" style="top:${rowY[i] - 366 - 43}px;">
        <div class="avatar" style="width:46px;height:46px;background:${C.greenTint};color:${C.greenDeep};">${icon("user", 22)}</div>
        <div><div class="t">New Lead</div><div class="s">via ${t}</div></div>
        <div class="now">now<div class="bd">1</div></div>
      </div>`,
  )
  .join("\n")}
    </div>
`;
  const script = `
      wordsIn("ads-hl", 5, 0.12, 0.07);
      const from = [{ x: -90, y: -50 }, { x: -170, y: 0 }, { x: -40, y: 130 }];
      from.forEach((f, i) => tl.fromTo(q("ads-src" + i), { opacity: 0, x: f.x, y: f.y, filter: "blur(8px)" }, { opacity: 1, x: 0, y: 0, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, 0.32 + i * 0.09));
      tl.fromTo(q("ads-inbox"), { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.5, ease: "expo.out" }, 0.5);
      [0, 1, 2].forEach((i) => {
        const t = 0.95 + i * 0.26;
        tl.to(q("ads-wire" + i), { strokeDashoffset: 0, duration: 0.42, ease: "power2.inOut" }, t);
        tl.fromTo(q("ads-lead" + i), { opacity: 0, x: -28, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "expo.out" }, t + 0.36);
        tl.fromTo(q("ads-cnt" + i), { opacity: 0 }, { opacity: 1, duration: 0.08 }, t + 0.36);
        if (i > 0) tl.to(q("ads-cnt" + (i - 1)), { opacity: 0, duration: 0.08 }, t + 0.36);
      });
      // exit: blur swap
      blurOut("#ads-hl", 3.52, 0.2);
      blurOut(".ads-src, #ads-inbox, #ads-wires", 3.55, 0.22);
`;
  files["ads"] = scene("ads", 3.8, css, body, script);
}

// =====================================================================
// SCENE 2 — BUT WHO IS READY TO BUY? + INTRODUCING (3.8 – 11.0, 7.2 s)
// =====================================================================
{
  const leads = [
    ["Lead 01", "Looking for a 2 BHK"],
    ["Lead 02", "Can you send prices?"],
    ["Lead 03", "Just exploring"],
    ["Lead 04", "Need a home in Dubai Marina this month"],
  ];
  const listX = 96, listY = 300, rowH = 104;
  const css = `
#pb-tint { position: absolute; left: ${-off("problem").x}px; top: ${-off("problem").y}px; width: ${W}px; height: ${H}px; background: ${C.coralTint}; opacity: 0; }
#pb-hl { top: 140px; font-size: 60px; }
#pb-hl .w { color: #B9B1A6; }
#pb-sub { top: 222px; }
#pb-list { left: ${listX}px; top: ${listY}px; width: 572px; height: 560px; padding: 0; }
.pb-lh { position: absolute; left: 24px; right: 24px; top: 18px; height: 44px; display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 600; }
.pb-lh .m { margin-left: auto; font-size: 16px; color: ${C.muted}; font-weight: 500; }
.pb-row { position: absolute; left: 16px; right: 16px; height: ${rowH}px; border-radius: 16px; background: #fff; border: 1px solid ${C.line}; display: flex; align-items: center; gap: 14px; padding: 0 18px; opacity: 0; }
.pb-row .t { font-size: 20px; font-weight: 600; }
.pb-row .s { font-size: 21px; line-height: 26px; color: #3B3936; margin-top: 3px; max-width: 300px; }
.pb-row .now { margin-left: auto; text-align: right; font-size: 14px; color: ${C.muted}; align-self: flex-start; margin-top: 22px; }
.pb-row .bd { width: 24px; height: 24px; border-radius: 50%; background: ${C.greenDeep}; color: #fff; font-size: 13px; display: flex; align-items: center; justify-content: center; margin: 6px 0 0 auto; }
.pb-q { position: absolute; right: 16px; top: 36px; font-size: 16px; font-weight: 600; color: ${C.coral}; background: ${C.coralTint}; border-radius: 999px; padding: 3px 10px; opacity: 0; }
#pb-team { left: 738px; top: 428px; width: 246px; height: 304px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; opacity: 0; }
#pb-team .t { font-size: 24px; font-weight: 600; margin-top: 16px; }
#pb-team .s { font-size: 18px; color: ${C.muted}; margin-top: 6px; }
#pb-who { margin-top: 18px; font-size: 17px; color: ${C.coral}; background: ${C.coralTint}; padding: 7px 14px; opacity: 0; }
#pb-lines { position: absolute; left: 0; top: 0; width: 1080px; height: 1080px; overflow: visible; }
#pb-sweep { position: absolute; top: ${-20 - off("problem").y}px; left: 0; width: 8px; height: ${H + 40}px; background: ${C.green}; border-radius: 4px; box-shadow: 0 0 28px 6px rgba(39,181,120,.45); opacity: 0; }
#pb-intro { position: absolute; left: ${60 + (W - 1080) / 2 - off("problem").x}px; right: ${60 - (W - 1080) / 2 + off("problem").x}px; top: 330px; text-align: center; }
#pb-logo { display: block; height: 40px; width: 326px; margin: 0 auto; opacity: 0; }
#pb-introk { font-size: 30px; color: ${C.muted}; font-weight: 500; opacity: 0; }
#pb-introt { font-family: "Hedvig Letters Serif", serif; font-size: 84px; line-height: 1.05; margin-top: 14px; letter-spacing: -0.015em; }
#pb-introt .w { display: inline-block; }
#pb-introt .g { color: ${C.greenDeep}; }
#pb-uline { width: 520px; height: 6px; border-radius: 3px; background: ${C.green}; margin: 30px auto 0; transform-origin: 0% 50%; }
`;
  let body = `    <div id="pb-tint" data-layout-ignore></div>
    <h1 class="hl" id="pb-hl">${words("pb-hl", [["But who's actually"], ["ready to buy?", "r"]])}</h1>
    <div class="sub" id="pb-sub">Every enquiry looks urgent. Not every enquiry is.</div>
    <svg id="pb-lines" viewBox="0 0 1080 1080" data-layout-ignore>
${leads
  .map((_, i) => {
    const y = listY + 76 + i * (rowH + 12) + rowH / 2;
    return `      <path id="pb-line${i}" d="M738 580 C 706 580, 700 ${y}, 668 ${y}" fill="none" stroke="${C.coral}" stroke-width="2.5" stroke-dasharray="6 7" opacity="0"/>`;
  })
  .join("\n")}
    </svg>
    <div class="card" id="pb-list">
      <div class="pb-lh">${waLogo(26)}WhatsApp enquiries<span class="m">4 unread</span></div>
${leads
  .map(
    ([t, s], i) => `      <div class="pb-row" id="pb-row${i}" style="top:${76 + i * (rowH + 12)}px;">
        <div class="avatar" style="width:52px;height:52px;background:#ECE7DF;color:#8C867D;">${icon("user", 24)}</div>
        <div><div class="t">${t}</div><div class="s">${s}</div></div>
        <div class="now" id="pb-now${i}">now<div class="bd">1</div></div>
        <div class="pb-q" id="pb-q${i}">Priority?</div>
      </div>`,
  )
  .join("\n")}
    </div>
    <div class="card" id="pb-team">
      <div class="avatar" style="width:84px;height:84px;background:#ECE7DF;color:#5E5952;">${icon("users", 40)}</div>
      <div class="t">Sales Team</div>
      <div class="s">4 new enquiries</div>
      <div class="pill" id="pb-who">Who first?</div>
    </div>
    <div id="pb-sweep" data-layout-ignore></div>
    <div id="pb-intro">
      <div id="pb-introk">Introducing</div>
      <div id="pb-introt">${words("pb-introt", [["DoubleTick"], ["<br>"], ["Agentic AI", "g"]])}</div>
      <div id="pb-uline"></div>
    </div>
`;
  const script = `
      tl.to("#pb-tint", { opacity: 1, duration: 0.9, ease: "power2.inOut" }, 0.15);
      // headline: grey → ink / coral, per word
      for (let i = 0; i < 6; i++) {
        tl.fromTo(q("pb-hl-w" + i), { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power2.out" }, 0.1 + i * 0.05);
        tl.to(q("pb-hl-w" + i), { color: i >= 3 ? "${C.coral}" : "${C.ink}", duration: 0.2, ease: "power2.out" }, 0.55 + i * 0.085);
      }
      blurIn("#pb-sub", 1.35, 0.2);
      tl.fromTo("#pb-list", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "expo.out" }, 0.2);
      for (let i = 0; i < 4; i++) tl.fromTo(q("pb-row" + i), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.42, ease: "expo.out" }, 0.32 + i * 0.07);
      tl.fromTo("#pb-team", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.45, ease: "expo.out" }, 0.75);
      for (let i = 0; i < 4; i++) tl.fromTo(q("pb-line" + i), { opacity: 0, strokeDashoffset: 60 }, { opacity: 1, strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 1.7 + i * 0.06);
      for (let i = 0; i < 4; i++) { tl.to(q("pb-now" + i), { opacity: 0, duration: 0.1 }, 2.6 + i * 0.12); tl.fromTo(q("pb-q" + i), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.22, ease: "power3.out" }, 2.6 + i * 0.12); }
      tl.fromTo("#pb-who", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.24, ease: "power3.out" }, 3.15);
      // green line sweeps through, tint clears
      tl.set("#pb-sweep", { opacity: 1, x: ${-40 - off("problem").x} }, 4.5);
      tl.to("#pb-sweep", { x: ${W + 40 - off("problem").x}, duration: 0.7, ease: "power2.inOut" }, 4.5);
      tl.fromTo("#pb-tint", { clipPath: "inset(0 0 0 0%)" }, { clipPath: "inset(0 0 0 100%)", duration: 0.7, ease: "power2.inOut" }, 4.5);
      tl.to(".pb-q, #pb-who, #pb-lines", { opacity: 0, duration: 0.16 }, 4.72);
      tl.to(".pb-row", { borderColor: "${C.green}", duration: 0.12, stagger: 0.03 }, 4.7);
      blurOut("#pb-hl, #pb-sub", 5.0, 0.2);
      blurOut("#pb-list, #pb-team", 5.02, 0.22, { y: -10 });
      tl.set("#pb-sweep", { opacity: 0 }, 5.22);
      // Introducing DoubleTick Agentic AI
      blurIn("#pb-introk", 5.18, 0.16);
      wordsIn("pb-introt", 3, 5.25, 0.08);
      tl.fromTo("#pb-uline", { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "expo.out" }, 5.4);
      // carry up into the qualification scene
      tl.to("#pb-intro", { y: -40, opacity: 0, filter: "blur(8px)", duration: 0.3, ease: "power3.in" }, 6.88);
`;
  files["problem"] = scene("problem", 7.2, css, body, script);
}

// =====================================================================
// SCENE 3+4 — AI QUALIFIES + HIGH INTENT (11.0 – 20.0, 9 s)
// =====================================================================
{
  const box = { x: 80, y: 274, w: 480, h: 600 };
  const hi = (s) => `<span class="hi" id="__ID__">${s}</span>`;
  const msgs = [
    { id: "qf-m0", side: "out", t: 0.25, lines: ["Hi, I'm looking for an", "apartment in Dubai."], time: "10.24 AM" },
    { id: "qf-m1", side: "in", t: 1.0, typing: true, lines: ["Sure. What budget range", "are you considering?"] },
    { id: "qf-m2", side: "out", t: 1.7, lines: [`Around <span class="hi" id="qf-h0">AED 2M</span>.`] },
    { id: "qf-m3", side: "in", t: 2.4, typing: true, lines: ["Which location do you prefer?"] },
    { id: "qf-m4", side: "out", t: 3.1, lines: [`<span class="hi" id="qf-h1">Dubai Marina</span>.`], time: "10.25 AM" },
    { id: "qf-m5", side: "in", t: 3.8, typing: true, lines: ["What property type are", "you looking for?"], time: "10.25 AM" },
    { id: "qf-m6", side: "out", t: 4.5, lines: [`<span class="hi" id="qf-h2">2-bedroom</span> apartment.`], time: "10.25 AM" },
    { id: "qf-m7", side: "in", t: 5.2, typing: true, lines: ["When are you planning to buy?"], time: "10.25 AM" },
    { id: "qf-m8", side: "out", t: 5.9, lines: [`Within <span class="hi" id="qf-h3">1–2 months</span>.`], time: "10.26 AM" },
  ];
  const chat = buildChat("qf-chat", box, msgs);
  const slotX = 606, slotW = 394, slotY = [342, 442, 542, 642];
  const chips = [
    ["wallet", "Budget", "AED 2M", 2],
    ["pin", "Location", "Dubai Marina", 4],
    ["building", "Property type", "2 Bedroom", 6],
    ["calendar", "Timeline", "1–2 Months", 8],
  ];
  // profile card targets
  const cardX = 315, cardY = 272, cardW = 450;
  const rowX = cardX + 28, rowY0 = cardY + 108;
  const css = `
#qf-hl { top: 140px; font-size: 58px; }
#qf-hl2 { top: 140px; font-size: 58px; opacity: 0; }
#qf-sub { top: 220px; color: ${C.greenDeep}; }
#qf-cap { position: absolute; left: ${slotX}px; top: 300px; width: ${slotW}px; font-size: 15px; font-weight: 600; color: ${C.muted}; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0; display: flex; align-items: center; gap: 8px; }
#qf-card { left: ${cardX}px; top: ${cardY}px; width: ${cardW}px; height: 610px; opacity: 0; }
.qf-ch { position: absolute; left: 28px; right: 28px; top: 24px; display: flex; align-items: center; gap: 14px; }
.qf-ch .t { font-size: 24px; font-weight: 600; }
.qf-ch .s { font-size: 17px; color: ${C.muted}; margin-top: 2px; }
#qf-status { position: absolute; left: 28px; right: 28px; top: 486px; height: 88px; border-radius: 20px; border: 2px dashed #CFC8BC; overflow: hidden; }
#qf-fill { position: absolute; inset: 0; background: ${C.greenDeep}; transform-origin: 0% 50%; }
.qf-st { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 30px; font-weight: 600; }
#qf-st0 { color: ${C.muted}; font-size: 22px; font-weight: 500; }
#qf-st1 { color: #fff; opacity: 0; }
`;
  let body = `    <h1 class="hl" id="qf-hl">AI qualifies every enquiry.</h1>
    <h1 class="hl" id="qf-hl2">${words("qf-hl2", [["Buying intent"], ["identified.", "g"]])}</h1>
    <div class="sub" id="qf-sub">Budget · Location · Property Type · Timeline</div>
${chat.html}
    <div id="qf-cap">${icon("spark", 16)}Captured from the chat</div>
    <div class="card" id="qf-card">
      <div class="qf-ch">
        <div class="avatar" style="width:56px;height:56px;background:${C.greenTint};color:${C.greenDeep};font-size:24px;">A</div>
        <div><div class="t">Buyer Profile</div><div class="s">Ahmed · via WhatsApp</div></div>
      </div>
      <div id="qf-status">
        <div id="qf-fill"></div>
        <div class="qf-st" id="qf-st0">Checking buying intent…</div>
        <div class="qf-st" id="qf-st1">High Intent <span style="display:flex;width:36px;height:36px;border-radius:50%;background:#fff;color:${C.greenDeep};align-items:center;justify-content:center;">${icon("check", 22, 3.2)}</span></div>
      </div>
    </div>
${chips.map(([ic, lb, vl], i) => chip("qf-c" + i, slotX, slotY[i], slotW, ic, lb, vl)).join("\n")}
`;
  let script = `
      blurIn("#qf-hl", 0.05, 0.2);
      blurIn("#qf-sub", 0.25, 0.2);
      tl.fromTo("#qf-chat", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0.0);
      blurIn("#qf-cap", 1.6, 0.2);
${chat.js}`;
  chips.forEach(([, , , mi], i) => {
    const m = chat.laid[mi];
    const t = m.t + 0.18;
    const dx = Math.round(m.cx - (slotX + slotW / 2));
    const dy = Math.round(m.cy - (slotY[i] + 42));
    script += `      tl.to(q("qf-h${i}"), { backgroundColor: "rgba(39,181,120,.28)", duration: 0.15 }, ${t.toFixed(2)});
      tl.fromTo(q("qf-c${i}"), { opacity: 0, x: ${dx}, y: ${dy}, scale: 0.42 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.55, ease: "expo.out" }, ${t.toFixed(2)});
`;
  });
  // intent stage
  script += `
      blurOut("#qf-hl, #qf-sub, #qf-cap", 6.5, 0.18);
      wordsIn("qf-hl2", 3, 6.72, 0.08);
      tl.set("#qf-hl2", { opacity: 1 }, 6.72);
      tl.to("#qf-chat", { x: -80, opacity: 0, filter: "blur(6px)", duration: 0.4, ease: "power3.in" }, 6.55);
      tl.fromTo("#qf-card", { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, 6.8);
`;
  chips.forEach((_, i) => {
    const dx = rowX - slotX;
    const dy = rowY0 + i * 92 - slotY[i];
    script += `      tl.to(q("qf-c${i}"), { x: ${dx}, y: ${dy}, duration: 0.5, ease: "power4.out" }, ${(6.88 + i * 0.07).toFixed(2)});
      tl.fromTo(q("qf-c${i}-ck"), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(1.6)" }, ${(7.4 + i * 0.11).toFixed(2)});
`;
  });
  script += `
      tl.fromTo("#qf-fill", { scaleX: 0 }, { scaleX: 1, duration: 0.42, ease: "power2.inOut" }, 7.9);
      tl.to("#qf-status", { borderColor: "${C.greenDeep}", duration: 0.1 }, 7.9);
      tl.to("#qf-st0", { opacity: 0, duration: 0.12 }, 7.95);
      tl.fromTo("#qf-st1", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: "expo.out" }, 8.22);
      // compress up into the match scene's profile pill
      tl.to("#qf-card, .chip", { y: "-=260", scale: 0.55, opacity: 0, duration: 0.34, ease: "power3.in", transformOrigin: "50% 0%" }, 8.66);
      blurOut("#qf-hl2", 8.7, 0.2);
`;
  files["qualify"] = scene("qualify", 9.0, css, body, script);
}

// =====================================================================
// SCENE 5 — MATCHING PROPERTIES (20.0 – 23.8, 3.8 s)
// =====================================================================
{
  const props = [
    ["marina-residence", "Marina Residence", "AED 1.95M"],
    ["harbour-view", "Harbour View", "AED 2.1M"],
    ["marina-heights", "Marina Heights", "AED 2.3M"],
  ];
  const xs = [74, 395, 716], pw = 290, py = 346, ph = 470;
  const css = `
#mt-hl { top: 140px; font-size: 54px; }
#mt-pill { position: absolute; left: 90px; right: 90px; top: 228px; height: 54px; justify-content: center; background: #fff; border: 1px solid ${C.line}; font-size: 19px; font-weight: 500; color: ${C.ink}; gap: 12px; opacity: 0; }
#mt-pill .hi { color: #fff; background: ${C.greenDeep}; border-radius: 999px; padding: 5px 12px; font-size: 16px; font-weight: 600; }
#mt-pill .sep { color: #B9B1A6; }
#mt-src { position: absolute; left: 0; right: 0; top: 300px; display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 18px; color: ${C.muted}; font-weight: 500; opacity: 0; }
.mt-card { top: ${py}px; width: ${pw}px; height: ${ph}px; overflow: hidden; opacity: 0; }
.mt-img { position: absolute; left: 10px; top: 10px; width: ${pw - 22}px; height: 196px; border-radius: 16px; overflow: hidden; }
.mt-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mt-b { position: absolute; left: 22px; right: 22px; top: 224px; }
.mt-b .n { font-size: 25px; font-weight: 600; letter-spacing: -0.01em; }
.mt-b .m { font-size: 18px; color: ${C.muted}; margin-top: 10px; display: flex; align-items: center; gap: 7px; }
.mt-b .hr { height: 1px; background: ${C.line}; margin: 18px 0 14px; }
.mt-b .f { font-size: 15px; color: ${C.muted}; }
.mt-b .p { font-size: 27px; font-weight: 600; color: ${C.greenDeep}; margin-top: 2px; }
.mt-ring { position: absolute; inset: -1px; border-radius: 24px; border: 3px solid ${C.green}; opacity: 0; }
#mt-best { position: absolute; left: 24px; top: 24px; background: ${C.greenDeep}; color: #fff; font-size: 17px; padding: 7px 13px; opacity: 0; }
`;
  let body = `    <h1 class="hl" id="mt-hl">${words("mt-hl", [["AI recommends"], ["matching properties.", "g"]])}</h1>
    <div class="pill" id="mt-pill"><span class="hi">High Intent</span>Ahmed <span class="sep">·</span> AED 2M <span class="sep">·</span> Dubai Marina <span class="sep">·</span> 2 Bedroom <span class="sep">·</span> 1–2 Months</div>
    <div id="mt-src">${icon("sync", 18)}Matched from ABC Properties' live listings</div>
`;
  props.forEach(([img, n, p], i) => {
    body += `    <div class="card mt-card" id="mt-card${i}" style="left:${xs[i]}px;">
      <div class="mt-img"><img src="assets/images/${img}.jpg" alt="${n}"></div>
      <div class="mt-b">
        <div class="n">${n}</div>
        <div class="m">${icon("home", 18)}2 Bedroom</div>
        <div class="m" style="margin-top:6px">${icon("pin", 18)}Dubai Marina</div>
        <div class="hr"></div>
        <div class="f">Starting from</div>
        <div class="p">${p}</div>
      </div>
      <div class="mt-ring" id="mt-ring${i}"></div>
      ${i === 0 ? `<div class="pill" id="mt-best">${icon("check", 16, 3)}Best Match</div>` : ""}
    </div>
`;
  });
  const script = `
      tl.fromTo("#mt-pill", { opacity: 0, scale: 0.9, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "expo.out" }, 0.0);
      wordsIn("mt-hl", 4, 0.1, 0.07);
      blurIn("#mt-src", 0.6, 0.2);
      for (let i = 0; i < 3; i++) tl.fromTo(q("mt-card" + i), { opacity: 0, y: -150, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out", transformOrigin: "50% 0%" }, 0.42 + i * 0.09);
      // best match
      tl.to("#mt-card1, #mt-card2", { opacity: 0.45, scale: 0.97, duration: 0.35, ease: "power2.out" }, 1.85);
      tl.to("#mt-card0", { scale: 1.04, duration: 0.4, ease: "expo.out" }, 1.85);
      tl.to("#mt-ring0", { opacity: 1, duration: 0.18 }, 1.85);
      tl.fromTo("#mt-best", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" }, 1.95);
      // carry the best match into the chat (next scene)
      blurOut("#mt-hl, #mt-pill, #mt-src", 3.3, 0.2);
      tl.to("#mt-card1, #mt-card2", { opacity: 0, x: 60, duration: 0.25, ease: "power3.in" }, 3.3);
      tl.to("#mt-card0", { x: 30, y: -20, scale: 0.92, opacity: 0, duration: 0.4, ease: "power3.in" }, 3.38);
`;
  files["match"] = scene("match", 3.8, css, body, script);
}

// =====================================================================
// SCENE 6+7 — QUESTIONS ANSWERED + VIEWING BOOKED (23.8 – 30.8, 7 s)
// =====================================================================
{
  const box = { x: 80, y: 274, w: 480, h: 600 };
  const propBubble = `<div style="width:292px;height:150px;border-radius:10px;overflow:hidden;margin:-4px -8px 10px -8px;"><img src="assets/images/marina-residence.jpg" alt="Marina Residence" style="width:100%;height:100%;object-fit:cover;display:block;"></div><div style="font-weight:600;font-size:21px;line-height:26px;">Marina Residence</div><div style="font-size:17px;line-height:24px;color:${C.muted};">2 Bedroom · Dubai Marina</div>`;
  const src = `<div class="src">${icon("db", 15)}From ABC Properties listing</div>`;
  const msgs = [
    { id: "an-m0", side: "in", t: 0.08, lines: [propBubble], h: 252, w: 320, time: "10.26 AM" },
    { id: "an-m1", side: "out", t: 0.55, lines: ["What's the price and", "payment plan?"], time: "10.26 AM" },
    { id: "an-m2", side: "in", t: 1.35, typing: true, lines: ["This property starts from", "<b>AED 1.95M</b> with flexible", "payment options."], extra: src, extraH: 24, time: "10.26 AM" },
    { id: "an-m3", side: "out", t: 2.25, lines: ["Does it have a gym and pool?"], time: "10.27 AM" },
    { id: "an-m4", side: "in", t: 3.0, typing: true, lines: ["Yes. It includes a gym, pool", "and covered parking."], time: "10.27 AM" },
    { id: "an-m5", side: "in", t: 4.15, typing: true, lines: ["Would you like to schedule", "a viewing?"], buttons: ["Book a viewing", "Maybe later"], extraH: 112, time: "10.27 AM" },
    { id: "an-m6", side: "out", t: 4.8, lines: ["Yes. Saturday afternoon."], time: "10.28 AM" },
  ];
  const chat = buildChat("an-chat", box, msgs);
  const slotX = 606, slotW = 394;
  const chips = [
    ["tag", "Pricing", "From AED 1.95M", 2, 370],
    ["card", "Payment Plan", "Flexible options", 2, 470],
    ["spark", "Amenities", "Gym · Pool · Parking", 4, 570],
  ];
  const css = `
#an-hl { top: 140px; font-size: 58px; }
#an-hl2 { top: 140px; font-size: 58px; }
#an-sub { top: 220px; color: ${C.greenDeep}; }
#an-book { left: ${slotX}px; top: 362px; width: ${slotW}px; height: 420px; opacity: 0; padding: 26px; }
.an-bh { display: flex; align-items: center; gap: 14px; }
.an-bh .t { font-size: 24px; font-weight: 600; }
.an-bh .s { font-size: 17px; color: ${C.muted}; margin-top: 2px; }
.an-prop { display: flex; align-items: center; gap: 14px; margin-top: 22px; padding: 12px; border-radius: 16px; background: #F6F3EE; }
.an-prop img { width: 84px; height: 64px; border-radius: 10px; object-fit: cover; display: block; }
.an-prop .n { font-size: 19px; font-weight: 600; }
.an-prop .m { font-size: 15px; color: ${C.muted}; margin-top: 3px; }
.an-when { margin-top: 20px; font-size: 15px; color: ${C.muted}; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
.an-time { font-size: 32px; font-weight: 600; margin-top: 6px; letter-spacing: -0.01em; }
#an-btn { position: absolute; left: 26px; right: 26px; bottom: 26px; height: 66px; border-radius: 18px; border: 2px solid ${C.greenDeep}; overflow: hidden; }
#an-bfill { position: absolute; inset: 0; background: ${C.greenDeep}; transform-origin: 0% 50%; }
.an-bt { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 23px; font-weight: 600; }
#an-bt0 { color: ${C.greenDeep}; }
#an-bt1 { color: #fff; opacity: 0; }
`;
  let body = `    <h1 class="hl" id="an-hl">Questions answered instantly.</h1>
    <h1 class="hl" id="an-hl2">${words("an-hl2", [["From enquiry"], ["to viewing.", "g"]])}</h1>
    <div class="sub" id="an-sub">Pricing · Amenities · Payment Plans</div>
${chat.html}
${chips.map(([ic, lb, vl, , y], i) => chip("an-c" + i, slotX, y, slotW, ic, lb, vl)).join("\n")}
    <div class="card" id="an-book">
      <div class="an-bh">
        <div class="icbox" style="width:54px;height:54px;">${icon("calendar", 26)}</div>
        <div><div class="t">Property Viewing</div><div class="s">Scheduled by Agentic AI</div></div>
      </div>
      <div class="an-prop"><img src="assets/images/marina-residence.jpg" alt=""><div><div class="n">Marina Residence</div><div class="m">2 Bedroom · Dubai Marina</div></div></div>
      <div class="an-when">Date &amp; time</div>
      <div class="an-time">Saturday · 3:00 PM</div>
      <div id="an-btn"><div id="an-bfill"></div><div class="an-bt" id="an-bt0">Confirm viewing</div><div class="an-bt" id="an-bt1">Viewing Booked ${icon("check", 24, 3)}</div></div>
    </div>
`;
  let script = `
      gsap.set("#an-hl2 .w", { opacity: 0 });
      blurIn("#an-hl", 0.05, 0.2);
      blurIn("#an-sub", 0.25, 0.2);
      tl.fromTo("#an-chat", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.4, ease: "expo.out" }, 0.0);
${chat.js}`;
  chips.forEach(([, , , mi, y], i) => {
    const m = chat.laid[mi];
    const t = m.t + 0.2 + (i === 1 ? 0.14 : 0);
    const dx = Math.round(m.cx - (slotX + slotW / 2));
    const dy = Math.round(m.cy - (y + 42));
    script += `      tl.fromTo(q("an-c${i}"), { opacity: 0, x: ${dx}, y: ${dy}, scale: 0.42 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.55, ease: "expo.out" }, ${t.toFixed(2)});
      tl.fromTo(q("an-c${i}-ck"), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(1.6)" }, ${(t + 0.42).toFixed(2)});
`;
  });
  script += `
      // viewing stage
      blurOut("#an-hl, #an-sub", 3.95, 0.18);
      wordsIn("an-hl2", 4, 4.12, 0.07);
      tl.to(".chip", { opacity: 0, x: 30, filter: "blur(6px)", duration: 0.25, ease: "power3.in", stagger: 0.04 }, 4.4);
      tl.fromTo("#an-book", { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "expo.out" }, 4.95);
      tl.fromTo("#an-bfill", { scaleX: 0 }, { scaleX: 1, duration: 0.36, ease: "power2.inOut" }, 5.65);
      tl.to("#an-bt0", { opacity: 0, duration: 0.1 }, 5.7);
      tl.fromTo("#an-bt1", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: "expo.out" }, 5.9);
      // exit
      blurOut("#an-hl2", 6.72, 0.2);
      tl.to("#an-chat, #an-book", { opacity: 0, scale: 0.96, filter: "blur(6px)", duration: 0.26, ease: "power3.in" }, 6.72);
`;
  files["answer"] = scene("answer", 7.0, css, body, script);
}

// =====================================================================
// SCENE 8+9 — HIGH-INTENT HANDOFF + SALES FOCUS (30.8 – 38.2, 7.4 s)
// Simplified DoubleTick Team Inbox: chat list · conversation · details
// =====================================================================
{
  const X0 = 60, Y0 = 274, W = 960;
  const LW = 300, CW = 380; // list / chat pane widths; details takes the rest
  const DX = X0 + LW + CW; // details pane abs x
  const items = [
    ["wallet", "Budget", "AED 2M"],
    ["pin", "Location", "Dubai Marina"],
    ["building", "Property", "2 Bedroom"],
    ["calendar", "Timeline", "1–2 Months"],
    ["calendar", "Viewing", "Sat · 3:00 PM"],
  ];
  const bubTop = 118, rowTop0 = 74, rowStep = 44; // AI summary bubble inside the chat body
  const bubX = X0 + LW + CW - 14 - 340;
  const chipAbsY = (i) => Y0 + 56 + bubTop + rowTop0 + i * rowStep;
  const fieldTop0 = 330, fieldStep = 38;
  const fieldAbsY = (i) => Y0 + fieldTop0 + i * fieldStep;
  const leads = [
    ["A", "Ahmed", "Yes. Saturday afternoon.", "10:28 am", [["High intent", "g"], ["Viewing booked", "g"]]],
    ["L", "Lead 01", "Looking for a 2 BHK", "10:21 am", [["AI nurturing", "n"]]],
    ["L", "Lead 02", "Can you send prices?", "10:17 am", [["AI nurturing", "n"]]],
    ["L", "Lead 03", "Just exploring", "10:09 am", [["AI nurturing", "n"]]],
    ["F", "Faisal K.", "Is the 3BR still available?", "09:58 am", [["AI nurturing", "n"]]],
    ["R", "Rania M.", "Thanks, I'll check and revert", "09:41 am", [["AI nurturing", "n"]]],
    ["O", "Omar S.", "Any off-plan options?", "09:30 am", [["AI nurturing", "n"]]],
  ];
  const dticks = `<svg width="16" height="11" viewBox="0 0 18 12"><path d="M1 6.5l3 3L10.5 2.5M7 9.5l1 0.5L16.5 2.5" fill="none" stroke="#2BA36A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const css = `
#ho-hl { top: 140px; font-size: 58px; }
#ho-sub { top: 220px; }
#ho-hl2 { top: 140px; font-size: 58px; }
#ho-hl3 { top: 140px; font-size: 58px; }
#ho-inbox { left: ${X0}px; top: ${Y0}px; width: ${W}px; height: 900px; border-radius: 22px; overflow: hidden; opacity: 0; background: #fff; -webkit-mask-image: linear-gradient(#000 0px, #000 ${700 - Y0}px, rgba(0,0,0,0.05) ${890 - Y0}px, rgba(0,0,0,0.05) 100%); mask-image: linear-gradient(#000 0px, #000 ${700 - Y0}px, rgba(0,0,0,0.05) ${890 - Y0}px, rgba(0,0,0,0.05) 100%); }
.ho-pane { position: absolute; top: 0; bottom: 0; }
.ho-ph { position: absolute; left: 0; right: 0; top: 0; height: 56px; border-bottom: 1px solid #ECEAE6; display: flex; align-items: center; padding: 0 18px; gap: 10px; background: #fff; }
.ho-ph .t { font-size: 18px; font-weight: 600; }
.ho-ph .ics { margin-left: auto; display: flex; gap: 14px; color: #3B3B3B; }
#ho-list { left: 0; width: ${LW}px; border-right: 1px solid #ECEAE6; }
.ho-row { position: absolute; left: 0; right: 0; height: 108px; display: flex; gap: 12px; padding: 16px 16px 0; border-bottom: 1px solid #F1EFEC; background: #fff; }
.ho-row.sel { background: #EAF3EE; }
.ho-row.sel::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${C.green}; }
.ho-av { position: relative; width: 44px; height: 44px; border-radius: 50%; background: #EEE8F7; color: #6E4DAF; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex: none; }
.ho-av i { position: absolute; right: -3px; bottom: -3px; width: 17px; height: 17px; border-radius: 50%; background: #fff url('assets/brand/whatsapp.png') center / 13px 13px no-repeat; }
.ho-rn { font-size: 18px; font-weight: 600; white-space: nowrap; }
.ho-rp { font-size: 15px; color: #6B6B6B; margin-top: 3px; white-space: nowrap; display: flex; align-items: center; gap: 5px; }
.ho-rt { position: absolute; right: 14px; top: 20px; font-size: 12px; color: #6B6B6B; }
.ho-tags { display: flex; gap: 6px; margin-top: 9px; }
.ho-tag { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; white-space: nowrap; }
.ho-tag.g { background: ${C.greenTint}; color: ${C.greenDeep}; }
.ho-tag.n { background: #EFEEEB; color: #66625C; }
#ho-chat { left: ${LW}px; width: ${CW}px; border-right: 1px solid #ECEAE6; }
#ho-asg { margin-left: auto; height: 34px; border: 1px solid #DEDBD5; border-radius: 9px; display: flex; align-items: center; gap: 7px; padding: 0 10px; font-size: 15px; font-weight: 500; color: #333; position: relative; width: 132px; }
#ho-asg .a1, #ho-asg .a2 { position: absolute; left: 34px; top: 7px; white-space: nowrap; }
#ho-asg .a2 { opacity: 0; font-weight: 600; color: ${C.greenDeep}; }
.ho-cbody { position: absolute; left: 0; right: 0; top: 56px; bottom: 0; overflow: hidden; background: #F2EFE7 url('assets/ui/dt-wall.jpg') repeat; background-size: 571px auto; }
#ho-clist { position: absolute; left: 0; right: 0; top: 0; height: 1400px; }
.ho-day { position: absolute; left: 0; right: 0; top: 14px; text-align: center; }
.ho-day span { display: inline-block; background: #DEDCD7; color: #555; font-size: 14px; padding: 4px 14px; border-radius: 7px; }
.ho-b { position: absolute; border-radius: 10px; font-size: 17px; line-height: 25px; padding: 10px 14px 6px; box-shadow: 0 1px 1px rgba(0,0,0,.06); white-space: nowrap; }
.ho-b.in { left: 14px; background: #fff; }
.ho-b.out { right: 14px; background: #E6FFF0; }
.ho-b .tm { display: flex; justify-content: flex-end; align-items: center; gap: 4px; font-size: 12px; color: #6B6B6B; margin-top: 2px; }
.ho-lbl { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #6A45AD; }
.ho-lbl .pp { background: #EFE7F7; border-radius: 5px; padding: 1px 7px; font-size: 13px; }
.ho-lbl.rm { color: ${C.greenDeep}; }
.ho-sum { font-size: 17px; font-weight: 600; margin-top: 6px; }
.ho-cr { position: absolute; left: 12px; width: 316px; height: 38px; border-radius: 9px; background: #fff; border: 1px solid #D5EFE0; display: flex; align-items: center; gap: 10px; padding: 0 10px; }
.ho-cr .lb { font-size: 14px; color: #6B6B6B; width: 72px; }
.ho-cr .vl { font-size: 17px; font-weight: 600; }
.ho-sys { position: absolute; left: 0; right: 0; text-align: center; opacity: 0; }
.ho-sys span { display: inline-block; background: #fff; border-radius: 8px; padding: 6px 12px; font-size: 14px; color: #3D3D3D; box-shadow: 0 1px 1px rgba(0,0,0,.06); }
#ho-det { left: ${LW + CW}px; right: 0; background: #fff; }
.ho-tabs { position: absolute; left: 0; right: 0; top: 0; height: 52px; border-bottom: 1px solid #ECEAE6; display: flex; }
.ho-tabs div { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 15px; color: #6B6B6B; }
.ho-tabs .on { color: #111; font-weight: 600; box-shadow: inset 0 -3px 0 ${C.green}; }
.ho-dl { position: absolute; left: 18px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6B6B6B; display: flex; align-items: center; gap: 6px; }
.ho-dv { position: absolute; left: 18px; right: 18px; font-size: 16px; color: #1F1F22; display: flex; align-items: center; gap: 8px; }
.ho-fr { position: absolute; left: 18px; right: 18px; height: 34px; border-radius: 8px; display: flex; align-items: center; padding: 0 8px; }
.ho-fr .lb { font-size: 14px; color: #6B6B6B; }
.ho-fr .ph { margin-left: auto; color: #C4BFB6; font-size: 16px; }
.ho-fr .vl { position: absolute; right: 8px; top: 6px; font-size: 16px; font-weight: 600; opacity: 0; }
.ho-fly { position: absolute; width: 316px; height: 38px; border-radius: 9px; background: #fff; border: 1.5px solid ${C.green}; display: flex; align-items: center; gap: 10px; padding: 0 10px; opacity: 0; box-shadow: 0 10px 22px -10px rgba(14,122,76,.45); }
.ho-fly .vl { font-size: 17px; font-weight: 600; }
`;
  const row = ([av, n, p, t, tags], i) => `        <div class="ho-row${i === 0 ? " sel" : ""}" id="ho-r${i}" style="top:${56 + i * 108}px;">
          <div class="ho-av">${av}<i></i></div>
          <div><div class="ho-rn">${n}</div><div class="ho-rp">${dticks}${p}</div><div class="ho-tags">${tags.map(([x, c]) => `<span class="ho-tag ${c}">${x}</span>`).join("")}</div></div>
          <div class="ho-rt">${t}</div>
        </div>`;
  let body = `    <h1 class="hl" id="ho-hl">${words("ho-hl", [["Ready buyer."], ["Full context.", "g"]])}</h1>
    <div class="sub" id="ho-sub">Sales takes over when it matters.</div>
    <h1 class="hl" id="ho-hl2">${words("ho-hl2", [["Stop chasing every enquiry."]])}</h1>
    <h1 class="hl" id="ho-hl3">${words("ho-hl3", [["Focus on buyers"], ["ready to move.", "g"]])}</h1>
    <div class="card" id="ho-inbox" data-layout-allow-overflow data-layout-allow-caption-zone>
      <div class="ho-pane" id="ho-list">
        <div class="ho-ph"><span class="t">All chats</span><span class="ics">${icon("users", 18)}${icon("sync", 18)}</span></div>
${leads.map(row).join("\n")}
      </div>
      <div class="ho-pane" id="ho-chat">
        <div class="ho-ph">
          <div class="ho-av" style="width:36px;height:36px;font-size:15px;">A<i></i></div><span class="t">Ahmed</span>
          <div id="ho-asg">${icon("user", 16)}<span class="a1">Unassigned</span><span class="a2">Sarah</span></div>
        </div>
        <div class="ho-cbody">
          <div id="ho-clist">
            <div class="ho-day"><span>Today</span></div>
            <div class="ho-b in" style="top:56px;">Yes. Saturday afternoon.<div class="tm">10:28 am</div></div>
            <div class="ho-b out" id="ho-ai" style="top:${bubTop}px;width:340px;height:${rowTop0 + 5 * rowStep + 26}px;">
              <div class="ho-lbl">${icon("spark", 15)}ABC Properties AI <span class="pp">AI Agent</span></div>
              <div class="ho-sum">Lead qualified · Viewing booked</div>
${items.map(([ic, lb, vl], i) => `              <div class="ho-cr" id="ho-cr${i}" style="top:${rowTop0 + i * rowStep}px;"><span style="color:${C.greenDeep}">${icon(ic, 18)}</span><span class="lb">${lb}</span><span class="vl">${vl}</span></div>`).join("\n")}
              <div class="tm" style="position:absolute;right:12px;bottom:6px;">10:29 am ${dticks}</div>
            </div>
            <div class="ho-sys" id="ho-sys" style="top:${bubTop + rowTop0 + 5 * rowStep + 42}px;"><span>Assigned to Sarah (RM) · High-intent lead</span></div>
            <div class="ho-b out" id="ho-b0" style="top:500px;opacity:0;"><div class="ho-lbl rm">${icon("user", 14)}Sarah · RM</div>Hi Ahmed, I have your requirements<br>and your viewing is confirmed<br>for Saturday.<div class="tm">10:41 am ${dticks}</div></div>
            <div class="ho-b in" id="ho-b1" style="top:652px;opacity:0;">Perfect, thank you.<div class="tm">10:42 am</div></div>
          </div>
        </div>
      </div>
      <div class="ho-pane" id="ho-det">
        <div class="ho-tabs"><div class="on">Details</div><div>Calls</div><div>Notes</div></div>
        <div class="ho-dv" style="top:68px;"><div class="ho-av" style="width:40px;height:40px;">A<i></i></div><span style="font-size:20px;font-weight:600;">Ahmed</span></div>
        <div class="ho-dl" style="top:124px;">Phone number</div>
        <div class="ho-dv" style="top:144px;">+971 50 ••• ••42</div>
        <div class="ho-dl" style="top:184px;">${icon("usercheck", 14)}Assigned RM</div>
        <div class="ho-dv" style="top:204px;"><span id="ho-un" style="color:#9A958D">Unassigned</span><span id="ho-sa" style="position:absolute;left:0;top:0;display:flex;align-items:center;gap:8px;opacity:0;"><span class="avatar" style="width:26px;height:26px;background:${C.greenDeep};color:#fff;font-size:13px;">S</span><b style="font-weight:600">Sarah · RM</b></span></div>
        <div class="ho-dl" style="top:246px;">${icon("tag", 14)}Tags</div>
        <div class="ho-dv" style="top:266px;"><span class="ho-tag g" id="ho-tg0" style="opacity:0">High intent</span><span class="ho-tag g" id="ho-tg1" style="opacity:0">Dubai Marina</span></div>
        <div class="ho-dl" style="top:306px;">${icon("grid", 14)}Custom fields</div>
${items.map(([, lb, vl], i) => `        <div class="ho-fr" id="ho-f${i}" style="top:${fieldTop0 + i * fieldStep}px;"><span class="lb">${lb}</span><span class="ph" id="ho-ph${i}">—</span><span class="vl" id="ho-v${i}">${vl}</span></div>`).join("\n")}
      </div>
    </div>
${items.map(([ic, , vl], i) => `    <div class="ho-fly" id="ho-c${i}" style="left:${bubX + 12}px;top:${chipAbsY(i)}px;"><span style="color:${C.greenDeep}">${icon(ic, 18)}</span><span class="vl">${vl}</span></div>`).join("\n")}
`;
  let script = `
      gsap.set("#ho-hl2 .w, #ho-hl3 .w", { opacity: 0 });
      wordsIn("ho-hl", 4, 0.05, 0.07);
      blurIn("#ho-sub", 0.4, 0.2);
      tl.fromTo("#ho-inbox", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0.0);
      for (let i = 0; i < 7; i++) tl.fromTo(q("ho-r" + i), { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.3, ease: "expo.out" }, 0.12 + i * 0.04);
      tl.fromTo("#ho-ai", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", transformOrigin: "100% 100%" }, 0.3);
      tl.fromTo("#ho-tg0", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.6)" }, 0.6);
      tl.fromTo("#ho-tg1", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.6)" }, 0.68);
`;
  items.forEach((_, i) => {
    const t = 0.8 + i * 0.2;
    const dx = DX + 18 + (W - LW - CW - 36) - 8 - 120 - (bubX + 12 + 158);
    const dy = fieldAbsY(i) + 17 - (chipAbsY(i) + 19);
    script += `      tl.set(q("ho-c${i}"), { opacity: 1 }, ${t.toFixed(2)});
      tl.to(q("ho-cr${i}"), { opacity: 0.45, duration: 0.2 }, ${t.toFixed(2)});
      tl.to(q("ho-c${i}"), { x: ${Math.round(dx)}, y: ${Math.round(dy)}, scale: 0.72, duration: 0.5, ease: "power3.inOut" }, ${t.toFixed(2)});
      tl.to(q("ho-c${i}"), { opacity: 0, duration: 0.12 }, ${(t + 0.44).toFixed(2)});
      tl.to(q("ho-ph${i}"), { opacity: 0, duration: 0.08 }, ${(t + 0.42).toFixed(2)});
      tl.fromTo(q("ho-v${i}"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.22, ease: "power3.out" }, ${(t + 0.42).toFixed(2)});
      tl.to(q("ho-f${i}"), { backgroundColor: "#EEF8F2", duration: 0.15 }, ${(t + 0.42).toFixed(2)});
`;
  });
  script += `
      // assignment
      tl.fromTo("#ho-sys", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, 2.15);
      tl.to("#ho-asg .a1, #ho-un", { opacity: 0, duration: 0.1 }, 2.15);
      tl.fromTo("#ho-asg .a2, #ho-sa", { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, ease: "expo.out" }, 2.18);
      tl.to("#ho-asg", { borderColor: "${C.green}", backgroundColor: "#EEF8F2", duration: 0.2 }, 2.15);
      // ---- focus stage
      blurOut("#ho-hl, #ho-sub", 3.8, 0.18);
      wordsIn("ho-hl2", 4, 3.98, 0.07);
      tl.to("#ho-clist", { y: -268, duration: 0.6, ease: "power3.inOut" }, 4.0);
      tl.fromTo("#ho-b0", { opacity: 0, y: 14, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out", transformOrigin: "100% 100%" }, 4.45);
      tl.fromTo("#ho-b1", { opacity: 0, y: 14, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out", transformOrigin: "0% 100%" }, 5.25);
      // others recede, the ready buyer comes forward
      tl.to("#ho-r1, #ho-r2, #ho-r3, #ho-r4, #ho-r5, #ho-r6", { opacity: 0.35, duration: 0.6, ease: "power2.inOut", stagger: 0.04 }, 4.3);
      tl.to("#ho-r0", { x: 8, boxShadow: "0 16px 30px -14px rgba(14,122,76,.45)", duration: 0.6, ease: "power2.inOut" }, 4.3);
      // headline morph
      tl.to("#ho-hl2 .w", { opacity: 0, filter: "blur(8px)", duration: 0.16, ease: "power3.in", stagger: 0.03 }, 5.35);
      wordsIn("ho-hl3", 6, 5.5, 0.07);
      // exit
      blurOut("#ho-hl3", 7.2, 0.18);
      tl.to("#ho-inbox", { opacity: 0, filter: "blur(6px)", duration: 0.24, ease: "power3.in" }, 7.18);
`;
  files["handoff"] = scene("handoff", 7.4, css, body, script);
}

// =====================================================================
// SCENE 10 — UAE REAL ESTATE POSITIONING (38.2 – 41.8, 3.6 s)
// =====================================================================
{
  const nodes = [
    ["megaphone", "Ad"],
    ["wa", "WhatsApp"],
    ["spark", "AI<br>Qualification"],
    ["home", "Property<br>Match"],
    ["calendar", "Viewing"],
    ["usercheck", "RM"],
  ];
  const nx = (i) => 120 + i * 168;
  const ly = 520;
  const css = `
#jy-bg { position: absolute; left: ${-off("journey").x}px; top: 560px; width: ${W}px; height: ${H - off("journey").y - 560}px; object-fit: cover; opacity: 0; mix-blend-mode: luminosity; }
#jy-fade { position: absolute; left: ${-off("journey").x}px; top: 560px; width: ${W}px; height: ${H - off("journey").y - 560}px; background: linear-gradient(${C.bg}, rgba(243,239,231,0.6)); }
#jy-hl { top: 196px; font-size: 76px; }
#jy-svg { position: absolute; left: 0; top: 0; width: 1080px; height: 1080px; overflow: visible; }
.jy-n { position: absolute; top: ${ly - 36}px; width: 72px; height: 72px; border-radius: 50%; background: #fff; border: 2.5px solid ${C.green}; color: ${C.greenDeep}; display: flex; align-items: center; justify-content: center; opacity: 0; box-shadow: 0 8px 20px -10px rgba(14,122,76,.4); }
.jy-l { position: absolute; top: ${ly + 52}px; width: 160px; text-align: center; font-size: 20px; line-height: 25px; font-weight: 600; opacity: 0; }
#jy-tag { top: 726px; font-size: 52px; }
#jy-cities { position: absolute; left: 0; right: 0; top: 808px; display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 20px; color: ${C.muted}; font-weight: 500; opacity: 0; }
`;
  let body = `    <img id="jy-bg" src="assets/images/towers.jpg" alt="" data-layout-ignore>
    <div id="jy-fade" data-layout-ignore></div>
    <h1 class="hl" id="jy-hl">${words("jy-hl", [["DoubleTick"], ["Agentic AI", "g"]])}</h1>
    <svg id="jy-svg" viewBox="0 0 1080 1080" data-layout-ignore>
      <path d="M${nx(0)} ${ly} L${nx(5)} ${ly}" stroke="${C.line}" stroke-width="4" stroke-linecap="round"/>
      <path id="jy-path" d="M${nx(0)} ${ly} L${nx(5)} ${ly}" stroke="${C.green}" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" fill="none"/>
    </svg>
${nodes
  .map(
    ([ic, lb], i) => `    <div class="jy-n" id="jy-n${i}" style="left:${nx(i) - 36}px;${i === 5 ? `background:${C.greenDeep};color:#fff;border-color:${C.greenDeep};` : ""}">${ic === "wa" ? waLogo(36) : icon(ic, 30)}</div>
    <div class="jy-l" id="jy-l${i}" style="left:${nx(i) - 80}px;">${lb}</div>`,
  )
  .join("\n")}
    <h2 class="hl" id="jy-tag">${words("jy-tag", [["Built for"], ["UAE real estate.", "g"]])}</h2>
    <div id="jy-cities">${icon("pin", 18)}Dubai · Abu Dhabi · Sharjah · Ras Al Khaimah</div>
`;
  const script = `
      tl.to("#jy-bg", { opacity: 0.1, duration: 1.0, ease: "power2.inOut" }, 0.0);
      wordsIn("jy-hl", 3, 0.1, 0.08);
      tl.to("#jy-path", { strokeDashoffset: 0, duration: 1.5, ease: "power1.inOut" }, 0.35);
      for (let i = 0; i < 6; i++) {
        const t = 0.35 + 1.5 * (i / 5) * 0.96;
        tl.fromTo(q("jy-n" + i), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }, t - 0.05);
        tl.fromTo(q("jy-l" + i), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" }, t);
      }
      wordsIn("jy-tag", 5, 1.85, 0.07);
      blurIn("#jy-cities", 2.3, 0.2);
      // collapse into the end card
      tl.to(".jy-n, .jy-l, #jy-svg, #jy-tag, #jy-cities, #jy-hl", { opacity: 0, filter: "blur(8px)", duration: 0.22, ease: "power3.in" }, 3.36);
      tl.to("#jy-bg", { opacity: 0, duration: 0.24 }, 3.36);
`;
  files["journey"] = scene("journey", 3.6, css, body, script);
}

// =====================================================================
// SCENE 11 — CTA (41.8 – 45.8, 4 s)
// =====================================================================
{
  const css = `
#cta-logo { position: absolute; left: 380px; top: 236px; width: 320px; height: 39px; display: block; }
#cta-hl { top: 392px; font-size: 64px; line-height: 1.1; }
#cta-btnw { position: absolute; left: 0; right: 0; top: 602px; display: flex; justify-content: center; }
#cta-btn { position: relative; height: 92px; padding: 0 44px; border-radius: 999px; background: ${C.greenDeep}; color: #fff; font-size: 34px; font-weight: 600; display: flex; align-items: center; gap: 14px; letter-spacing: -0.005em; box-shadow: 0 18px 40px -16px rgba(14,122,76,.6); opacity: 0; }
#cta-ring { position: absolute; inset: 0; border-radius: 999px; border: 3px solid ${C.green}; opacity: 0; }
#cta-url { position: absolute; left: 0; right: 0; top: 722px; text-align: center; font-size: 22px; color: ${C.muted}; font-weight: 500; opacity: 0; }
`;
  const body = `    <h1 class="hl" id="cta-hl">${words("cta-hl", [["Turn more WhatsApp enquiries"], ["<br>"], ["into"], ["qualified buyers.", "g"]])}</h1>
    <div id="cta-btnw"><div id="cta-btn"><div id="cta-ring"></div>Book Your Free Demo Today <span id="cta-arrow" style="display:inline-block">→</span></div></div>
    <div id="cta-url">doubletick.io</div>
`;
  const script = `
      wordsIn("cta-hl", 7, 0.4, 0.06);
      // CTA: opacity 0→1, scale .96→1 in 0.28 s, magnetic settle, one pulse, hold
      tl.fromTo("#cta-btn", { opacity: 0, scale: 0.96, y: 10 }, { opacity: 1, scale: 1, duration: 0.28, ease: "power3.out" }, 1.15);
      tl.to("#cta-btn", { y: 0, duration: 0.5, ease: "elastic.out(1, 0.75)" }, 1.15);
      tl.fromTo("#cta-arrow", { x: -6 }, { x: 0, duration: 0.45, ease: "expo.out" }, 1.3);
      blurIn("#cta-url", 1.5, 0.2);
      tl.to("#cta-btn", { scale: 1.035, duration: 0.2, ease: "power2.out" }, 2.1);
      tl.to("#cta-btn", { scale: 1, duration: 0.35, ease: "power2.inOut" }, 2.3);
      tl.fromTo("#cta-ring", { opacity: 0.8, scale: 1 }, { opacity: 0, scale: 1.18, duration: 0.7, ease: "power2.out" }, 2.1);
`;
  files["cta"] = scene("cta", 4.0, css, body, script);
}

// =====================================================================
// CAPTIONS
// =====================================================================
const CAPS = [
  [0.22, 2.2, "Your real estate ads are working."],
  [3.9, 5.7, "But once the leads enter WhatsApp,"],
  [5.8, 8.75, "can your team identify who's actually ready to buy?"],
  [8.85, 11.35, "Introducing DoubleTick Agentic AI."],
  [11.4, 14.4, "It instantly qualifies every enquiry"],
  [14.5, 15.75, "by budget, preferred location,"],
  [15.85, 18.2, "property type and buying timeline."],
  [20.15, 22.6, "Then, it recommends matching properties,"],
  [23.85, 25.75, "answers questions about pricing,"],
  [25.85, 27.7, "amenities and payment plans,"],
  [27.85, 29.9, "and books the viewing automatically."],
  [30.95, 33.8, "So your sales team stops chasing every enquiry"],
  [33.9, 36.25, "and focuses on high-intent buyers."],
  [38.35, 40.2, "DoubleTick Agentic AI."],
  [40.3, 42.35, "Built for UAE real estate."],
  [42.45, 44.4, "Book your free demo today."],
];
{
  const css = `
.cap { position: absolute; left: ${LAND ? 360 : 110}px; right: ${LAND ? 360 : 110}px; top: ${CAP_TOP}px; text-align: center; font-family: "Geist", sans-serif; font-weight: 500; font-size: 28px; line-height: 36px; color: #2A2926; opacity: 0; }
#root { background: transparent; }
`;
  const body = CAPS.map(([, , t], i) => `    <div class="cap" id="cap-${i}">${t}</div>`).join("\n");
  let script = "";
  CAPS.forEach(([s, e], i) => {
    script += `      tl.fromTo(q("cap-${i}"), { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power2.out" }, ${s});
      tl.to(q("cap-${i}"), { opacity: 0, duration: 0.12, ease: "power2.in" }, ${(e - 0.12).toFixed(2)});
      tl.set(q("cap-${i}"), { opacity: 0, visibility: "hidden" }, ${e});
`;
  });
  files["captions"] = scene("captions", 45.8, css, body, script).replace(
    `#root { position: absolute; inset: 0; overflow: hidden; background: ${C.bg};`,
    `#root { position: absolute; inset: 0; overflow: hidden; background: transparent;`,
  );
}

for (const [id, html] of Object.entries(files)) fs.writeFileSync(path.join(OUT, "compositions", id + ".html"), html);

// =====================================================================
// ROOT
// =====================================================================
const SCENES = [
  ["ads", 0, 3.8],
  ["problem", 3.8, 7.2],
  ["qualify", 11.0, 9.0],
  ["match", 20.0, 3.8],
  ["answer", 23.8, 7.0],
  ["handoff", 30.8, 7.4],
  ["journey", 38.2, 3.6],
  ["cta", 41.8, 4.0],
];
const TOTAL = 45.8;
const VO = [
  ["vo01", 0.22], ["vo02", 3.9], ["vo03", 8.85], ["vo04", 11.4], ["vo05a", 20.15],
  ["vo05b", 23.85], ["vo05c", 27.85], ["vo06", 30.95], ["vo07", 38.35], ["vo08", 42.45],
];
// [file, absolute start, volume]
const SFX = [
  ["notification", 1.31, 0.32],
  ["pop", 1.57, 0.3], ["pop", 1.83, 0.26],
  ["whoosh-short", 3.55, 0.22],
  ["pop", 6.42, 0.22],
  ["whoosh", 8.3, 0.34],
  ["impact-bass-1", 9.05, 0.3],
  ["click-soft", 12.88, 0.35], ["click-soft", 14.28, 0.35], ["click-soft", 15.68, 0.35], ["click-soft", 17.08, 0.35],
  ["whoosh-short", 17.86, 0.25],
  ["pop", 18.42, 0.28],
  ["sparkle", 19.22, 0.3],
  ["whoosh-short", 20.42, 0.26],
  ["click", 21.86, 0.34],
  ["click-soft", 25.38, 0.35], ["click-soft", 27.0, 0.35],
  ["whoosh-short", 28.8, 0.22],
  ["click", 29.46, 0.36],
  ["sparkle", 29.7, 0.3],
  ["pop", 32.05, 0.26], ["pop", 32.45, 0.24], ["pop", 32.85, 0.26],
  ["click", 32.97, 0.34],
  ["whoosh-short", 34.6, 0.22],
  ["notification", 35.25, 0.24],
  ["whoosh", 38.5, 0.26],
  ["whoosh-short", 41.6, 0.2],
  ["impact-bass-1", 42.95, 0.32],
];

const vars = [
  { id: "cta_text", type: "string", label: "CTA text", default: "Book Your Free Demo Today" },
];
const root = `<!doctype html>
<html lang="en" data-resolution="${W === H ? "square" : LAND ? "landscape" : "portrait"}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>DoubleTick Agentic AI — UAE Real Estate</title>
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
