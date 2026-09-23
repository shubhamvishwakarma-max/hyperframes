// SCENE 05 — CoinDCX
// Metaphor: three separated journey columns (SALES / VIP / SUB-BROKER) light up
// on their spoken names, then route onto one governed DoubleTick layer; the
// analytics surface appears on "centralized visibility and analytics".
// Seam out: the governed layer separates into four governed RM-number cards.
window.Scenes.s05 = function (tl, section) {
  const H = window.HF;
  const { el, svgEl, place, cue, lineStart, lineEnd, scene, bulletCards } = H;
  const c = window.customerData.customers[3];
  const S = scene("s05");
  const r = window.CustomerScene.scaffold(section, c);

  const LANES = [
    { label: "SALES", x: 0, key: ["SALES", 1] },
    { label: "VIP", x: 315, key: ["VIP", 1] },
    { label: "SUB-BROKER", x: 630, key: ["SUB", 1] },
  ];
  const svg = svgEl("svg", { class: "svg-layer", viewBox: "0 0 920 336" });
  const paths = LANES.map((l) =>
    svgEl("path", {
      fill: "none",
      stroke: "#28B379",
      "stroke-width": 2.5,
      "stroke-linecap": "round",
      d: `M${l.x + 145} 130 C${l.x + 145} 152 460 144 460 166`,
    }),
  );
  svg.append(...paths);

  const lanes = LANES.map((l, i) => {
    const card = el("div", "ui-card cd-lane");
    place(card, l.x, 0, 290, 130);
    const head = el("div", "row");
    head.append(H.icon("wa"), el("span", "ui-chip idle", l.label));
    const conv = el("div", "cd-conv");
    [
      ["in", 170],
      ["out", 130],
      ["in", 150 + i * 12],
    ].forEach(([side, w]) => {
      const b = el("span", "bubble " + side);
      b.style.width = w + "px";
      conv.append(b);
    });
    card.append(head, conv);
    return card;
  });

  // one governed layer (DoubleTick) with its analytics surface
  const layer = el("div", "ui-card cd-layer");
  place(layer, 0, 166, 920, 58);
  const lg = el("img", "cd-logo");
  lg.src = "assets/logos/doubletick-logo.png";
  lg.alt = "DoubleTick";
  const merged = el("div", "cd-merged");
  const mdots = [0, 1, 2].map(() => el("span", "cd-dot"));
  merged.append(...mdots);
  const analytics = el("div", "cd-analytics");
  const abars = [0.45, 0.7, 0.55, 0.85, 0.65, 0.95].map((v) => {
    const b = el("i");
    b.dataset.v = v;
    analytics.append(b);
    return b;
  });
  const ring = svgEl("svg", { class: "cd-ring", viewBox: "0 0 36 36" });
  const ringBg = svgEl("circle", { cx: 18, cy: 18, r: 14, fill: "none", stroke: "#E7F5EE", "stroke-width": 5 });
  const ringFg = svgEl("circle", {
    cx: 18,
    cy: 18,
    r: 14,
    fill: "none",
    stroke: "#28B379",
    "stroke-width": 5,
    "stroke-linecap": "round",
    transform: "rotate(-90 18 18)",
  });
  ring.append(ringBg, ringFg);
  analytics.append(ring);
  layer.append(lg, merged, analytics);

  const cards = bulletCards(c);
  cards.classList.add("compact");
  place(cards, 0, 248, 920);
  cards.style.position = "absolute";
  r.zMid.append(svg, ...lanes, layer, cards);

  // single hero metric: horizontal tile + three dots merging into one
  const tile = r.tiles[0];
  tile.classList.add("single");
  const md = el("div", "cd-metric-dots");
  const tdots = [0, 1, 2].map(() => el("span", "cd-dot"));
  md.append(...tdots);
  tile.append(md);

  // ghosts: the layer separates into four RM-number cards (Samar grid, frame coords)
  const CARDS = [
    [410, 80],
    [675, 80],
    [410, 212],
    [675, 212],
  ];
  const ghosts = CARDS.map((_, i) => {
    const g = el("div", "ui-card cd-ghost");
    place(g, 80 + i * 232, 440 + 166, 224, 58);
    section.append(g);
    return g;
  });

  const t = {
    start: S.start,
    problem: lineStart("cd-problem"),
    solution: lineStart("cd-solution"),
    impact: lineEnd("cd-solution") + 0.45,
    end: S.end,
  };
  window.CustomerScene.phases(tl, r, c, t);

  // columns appear (inherited from Wint's compressed cards), separated & idle
  tl.fromTo(lanes, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.06 }, S.start + 0.05);
  // "blind spots": columns drift apart slightly and dim
  const blind = cue("cd-problem", "BLIND");
  tl.to(lanes, { opacity: 0.55, x: (i) => (i - 1) * 10, duration: 0.6, ease: "power2.out" }, blind);

  // "Sales", "VIP", "Sub-Broker": each journey activates on its name
  LANES.forEach((l, i) => {
    const at = cue("cd-solution", l.key[0], l.key[1]);
    tl.to(lanes[i], { opacity: 1, x: 0, borderColor: "#28B379", duration: 0.35, ease: "power2.out" }, at);
    tl.to(lanes[i].querySelector(".ui-chip"), { backgroundColor: "#E7F5EE", color: "#0F7A50", duration: 0.3 }, at);
  });
  // "one governed WhatsApp layer": all three converge
  const one = cue("cd-solution", "ONE");
  tl.fromTo(layer, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, one - 0.1);
  paths.forEach((p, i) => H.draw(tl, p, one + 0.05 + i * 0.12, 0.45, "power2.out"));
  tl.fromTo(mdots, { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(2)", stagger: 0.12 }, one + 0.4);
  tl.to(mdots, { x: (i) => (1 - i) * 13, duration: 0.45, ease: "power3.inOut" }, cue("cd-solution", "LAYER"));
  // "centralized visibility and analytics": analytics surface appears
  const an = cue("cd-solution", "ANALYTICS");
  tl.fromTo(analytics, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, cue("cd-solution", "CENTRALIZED"));
  abars.forEach((b, i) => {
    tl.fromTo(b, { scaleY: 0.1 }, { scaleY: Number(b.dataset.v), duration: 0.5, ease: "power3.out" }, an - 0.3 + i * 0.05);
  });
  const circ = 2 * Math.PI * 14;
  ringFg.style.strokeDasharray = `${circ} ${circ}`;
  tl.fromTo(ringFg, { strokeDashoffset: circ }, { strokeDashoffset: circ * 0.18, duration: 0.8, ease: "power3.out" }, an);

  window.CustomerScene.bulletsIn(
    tl,
    Array.from(cards.children),
    [cue("cd-solution", "CONVERSATIONS") + 0.1, cue("cd-solution", "VISIBILITY"), lineEnd("cd-solution") + 0.1],
    null,
  );

  // metric: three dots merge into one as "3" lands
  tl.fromTo(tdots, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.08 }, t.impact + 0.2);
  tl.to(tdots, { x: (i) => (1 - i) * 22, duration: 0.6, ease: "power3.inOut" }, t.impact + 0.9);

  // seam: layer separates into four governed RM-number cards
  tl.to([...lanes, ...paths, cards], { opacity: 0, y: -16, duration: 0.4, ease: "power2.in" }, t.end - 0.75);
  tl.to(layer, { opacity: 0, duration: 0.2 }, t.end - 0.55);
  ghosts.forEach((g, i) => {
    const [cx, cy] = CARDS[i];
    tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.15 }, t.end - 0.6);
    tl.to(
      g,
      {
        x: cx - i * 232,
        y: cy - 166,
        scaleX: 245 / 224,
        scaleY: 120 / 58,
        transformOrigin: "0 0",
        duration: 0.65,
        ease: "power3.inOut",
        delay: i * 0.04,
      },
      t.end - 0.5,
    );
    tl.to(g, { opacity: 0, duration: 0.3 }, t.end + 0.35);
  });
};
