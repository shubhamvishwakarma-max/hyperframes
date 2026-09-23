// SCENE 01 — Opening hook (PDF opening copy, verbatim).
// Motion: masked line reveal (headline) + svg-path-draw route connecting
// three disconnected product objects; the route exits right into AU.
window.Scenes.s01 = function (tl, section) {
  const { el, svgEl, place, cue, lineStart, scene, icon, draw } = window.HF;
  const d = window.customerData.opening;
  const S = scene("s01");
  const end = S.end;

  const eyebrow = place(el("span", "eyebrow s01-eyebrow", d.eyebrow), 80, 168);
  eyebrow.style.position = "absolute";

  // Headline: fixed display lines (each verified to fit 920px at 58px) so each
  // line can rise through its own mask. Text is the source string, split only.
  const LINES = ["How many opportunities", "are hiding inside unworked", "leads and unmanaged", "conversations?"];
  if (LINES.join(" ") !== d.main) throw new Error("Opening copy drifted from source");
  const head = el("h1", "s01-head");
  place(head, 80, 206);
  head.style.position = "absolute";
  const lineEls = LINES.map((txt) => {
    const m = el("span", "mask");
    m.setAttribute("data-layout-allow-overflow", "");
    const l = el("span", "line");
    if (txt.includes("opportunities")) {
      l.append("How many ", el("span", "hl", "opportunities"));
    } else l.textContent = txt;
    m.append(l);
    head.append(m);
    return l;
  });

  const sup = el("p", "s01-sup");
  place(sup, 80, 494, 820);
  sup.style.position = "absolute";
  const [pre] = d.supporting.split("measurable outcomes.");
  const em = el("span", "em", "measurable outcomes");
  sup.append(pre, em, ".");

  // Three disconnected product objects
  const objs = el("div", "s01-objs");
  const lead = el("div", "ui-card s01-card");
  place(lead, 80, 664, 226, 142);
  const lh = el("div", "row");
  lh.append(el("span", "avatar grey", ""), el("span", "ui-chip idle", "Lead"));
  const lb = el("div", "rows");
  [150, 104].forEach((w) => {
    const b = el("span", "bar");
    b.style.width = w + "px";
    lb.append(b);
  });
  lead.append(lh, lb);

  const conv = el("div", "ui-card s01-card");
  place(conv, 402, 742, 264, 176);
  const ch = el("div", "row");
  ch.append(icon("chat"), el("span", "ui-chip idle", "Conversation"));
  const bub = el("div", "bubbles");
  [
    ["in", 150],
    ["out", 120],
    ["in", 176],
  ].forEach(([side, w]) => {
    const b = el("span", "bubble " + side);
    b.style.width = w + "px";
    bub.append(b);
  });
  conv.append(ch, bub);

  const rmq = el("div", "ui-card s01-card");
  place(rmq, 762, 650, 238, 196);
  rmq.append(el("span", "ui-title", "RM queue"));
  const qrows = el("div", "qrows");
  [96, 70, 84].forEach((w) => {
    const r = el("div", "qrow");
    const b = el("span", "bar");
    b.style.width = w + "px";
    r.append(el("span", "avatar grey", "RM"), b);
    qrows.append(r);
  });
  rmq.append(qrows);
  objs.append(lead, conv, rmq);

  // Route (drawn over the gaps between the objects, then out of frame right)
  const svg = svgEl("svg", { class: "svg-layer", viewBox: "0 0 1080 1080" });
  const pathAttrs = { fill: "none", stroke: "#28B379", "stroke-width": 3, "stroke-linecap": "round" };
  const p1 = svgEl("path", { ...pathAttrs, d: "M306 735 C352 735 356 830 402 830" });
  const p2 = svgEl("path", { ...pathAttrs, d: "M666 830 C714 830 714 748 762 748" });
  const p3 = svgEl("path", { ...pathAttrs, d: "M1000 748 C1030 748 1040 748 1090 748" });
  const dots = [
    [306, 735],
    [402, 830],
    [666, 830],
    [762, 748],
  ].map(([cx, cy]) => svgEl("circle", { cx, cy, r: 6, fill: "#fff", stroke: "#28B379", "stroke-width": 3 }));
  svg.append(p1, p2, p3, ...dots);

  section.append(eyebrow, head, sup, objs, svg);

  // ---- motion ----
  const t0 = lineStart("hook-q");
  tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.25);
  tl.fromTo(lineEls, { yPercent: 108 }, { yPercent: 0, duration: 0.62, ease: "expo.out", stagger: 0.09 }, t0 - 0.2);
  tl.fromTo(
    head.querySelector(".hl"),
    { color: "#111613" },
    { color: "#0F7A50", duration: 0.5, ease: "power2.out" },
    cue("hook-q", "OPPORTUNITIES"),
  );

  tl.fromTo(lead, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, cue("hook-q", "LEADS"));
  tl.fromTo(conv, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, cue("hook-q", "CONVERSATIONS"));
  tl.fromTo(rmq, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, cue("hook-q", "CONVERSATIONS") + 0.45);
  // ambient drift while disconnected (finite, seek-safe)
  [lead, conv, rmq].forEach((n, i) => {
    tl.to(n, { y: i % 2 ? 6 : -6, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: 2 }, 7.0 + i * 0.3);
  });

  const sStart = lineStart("hook-sub");
  tl.fromTo(sup, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, sStart - 0.1);
  tl.fromTo(em, { color: "#4F5A54" }, { color: "#111613", duration: 0.4, ease: "power2.out" }, cue("hook-sub", "MEASURABLE"));
  tl.fromTo(em, { backgroundSize: "0% 3px" }, { backgroundSize: "100% 3px", duration: 0.6, ease: "power3.inOut" }, cue("hook-sub", "MEASURABLE"));

  // route connects the objects: begins with the supporting line, completes on "outcomes"
  tl.fromTo(dots, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: "power2.out", stagger: 0.08 }, sStart + 0.6);
  draw(tl, p1, cue("hook-sub", "LEADERS"), 0.9);
  draw(tl, p2, cue("hook-sub", "CONVERSATIONS"), 0.9);
  const connected = cue("hook-sub", "OUTCOMES");
  tl.to([lead, conv, rmq], { borderColor: "rgba(40,179,121,0.7)", duration: 0.4, ease: "power2.out", stagger: 0.08 }, connected);
  tl.to(section.querySelectorAll(".s01-card .ui-chip"), { backgroundColor: "#E7F5EE", color: "#0F7A50", duration: 0.3, stagger: 0.08 }, connected);
  tl.to(dots, { fill: "#28B379", duration: 0.3, stagger: 0.06 }, connected);

  // seam: the route keeps going, out of frame to the right, into AU
  draw(tl, p3, end - 1.0, 0.7, "power2.in");
  tl.to([eyebrow, head, sup, objs, ...dots, p1, p2], { x: -60, opacity: 0, duration: 0.5, ease: "power2.in", stagger: 0.02 }, end - 0.35);
  tl.to(p3, { opacity: 0, duration: 0.3 }, end + 0.2);
};
