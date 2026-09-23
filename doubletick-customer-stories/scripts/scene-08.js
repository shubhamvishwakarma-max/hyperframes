// SCENE 08 — Final CTA (PDF CTA copy, verbatim, split into primary/secondary).
// Transition: dark DoubleTick green opens as a circle from the focused recap card
// (one of the film's two cinematic transitions). Background: slow-moving
// conversation nodes. Completed CTA holds ~3 s after the last spoken word.
window.Scenes.s08 = function (tl, section) {
  const H = window.HF;
  const { el, svgEl, place, cue, lineStart, lineEnd, scene } = H;
  const d = window.customerData.cta;
  const S = scene("s08");

  const bg = el("div", "cta-bg");
  // conversation nodes network (deterministic layout)
  const net = svgEl("svg", { class: "svg-layer cta-net", viewBox: "0 0 1080 1080" });
  const PTS = [
    [120, 820],
    [260, 900],
    [410, 800],
    [560, 930],
    [700, 830],
    [860, 910],
    [980, 790],
    [900, 640],
    [760, 700],
    [620, 660],
    [980, 180],
    [880, 260],
    [760, 150],
  ];
  const EDGES = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [4, 8],
    [10, 11],
    [11, 12],
  ];
  const lines = EDGES.map(([a, b]) =>
    svgEl("line", { x1: PTS[a][0], y1: PTS[a][1], x2: PTS[b][0], y2: PTS[b][1], stroke: "#28B379", "stroke-width": 1.5, opacity: 0.35 }),
  );
  const dots = PTS.map(([x, y], i) =>
    svgEl("circle", { cx: x, cy: y, r: i % 3 === 0 ? 7 : 5, fill: i % 3 === 0 ? "#28B379" : "#0F4A37", stroke: "#28B379", "stroke-width": 2 }),
  );
  net.append(...lines, ...dots);

  const logo = el("img", "cta-logo");
  logo.src = "assets/logos/doubletick-logo-on-dark.png";
  logo.alt = "DoubleTick";
  place(logo, 80, 76);

  const q = el("div", "mask cta-q-mask");
  q.setAttribute("data-layout-allow-overflow", "");
  const qt = el("h2", "cta-q line", d.question);
  q.append(qt);
  place(q, 80, 300, 900);
  const sub = el("p", "cta-sub", d.secondary);
  place(sub, 80, 470, 900);
  const btn = el("div", "cta-btn");
  btn.append(el("span", "", d.button), H.icon("arrow"));
  const btnWrap = el("div", "cta-btn-wrap");
  btnWrap.append(btn);
  place(btnWrap, 80, 568);

  bg.append(net);
  section.append(bg, logo, q, sub, btnWrap);

  // circular wipe from the focused recap card (frame centre-ish)
  const t0 = S.start;
  tl.fromTo(
    bg,
    { clipPath: "circle(0% at 540px 510px)" },
    { clipPath: "circle(150% at 540px 510px)", duration: 0.9, ease: "power3.inOut" },
    t0 - 0.3,
  );
  tl.fromTo(net, { opacity: 0 }, { opacity: 1, duration: 0.8 }, t0 + 0.3);
  // slow drift of the network (finite, seek-safe)
  const drift = S.end - t0;
  tl.fromTo(dots, { y: 0 }, { y: (i) => (i % 2 ? -10 : 10), duration: drift / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, t0);
  tl.fromTo(logo, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, t0 + 0.2);

  const qa = lineStart("cta-q");
  tl.fromTo(qt, { yPercent: 104 }, { yPercent: 0, duration: 0.65, ease: "expo.out" }, qa - 0.1);
  tl.fromTo(sub, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, lineStart("cta-sub") - 0.05);
  const btnAt = cue("cta-sub", "AUTOMATED") + 0.2;
  tl.fromTo(btnWrap, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "expo.out" }, btnAt);
  // restrained "resolved" pulse on the button (single, no bounce)
  tl.fromTo(btn, { boxShadow: "0 10px 30px rgba(40,179,121,0.28)" }, { boxShadow: "0 0 0 10px rgba(40,179,121,0.18)", duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, lineEnd("cta-sub") + 0.6);
};
