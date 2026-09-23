// SCENE 04 — Wint Wealth
// Metaphor: five independent RM conversation cards -> a supervisory "CX Overview"
// layer arrives -> cards become governed -> the overview consolidates.
// Bullets left, product UI right. Seam out: cards compress into CoinDCX's
// three journey columns.
window.Scenes.s04 = function (tl, section) {
  const H = window.HF;
  const { el, svgEl, place, cue, lineStart, lineEnd, scene, bulletList } = H;
  const c = window.customerData.customers[2];
  const S = scene("s04");
  const r = window.CustomerScene.scaffold(section, c);

  const ui = el("div", "ww-ui");
  // supervisory layer
  const panel = el("div", "ui-card ww-panel");
  place(panel, 430, 0, 490, 64);
  const pt = el("div", "row");
  pt.append(H.icon("eye"), el("span", "ui-title", "CX Overview"));
  const minis = el("div", "ww-minis");
  const miniBars = [0.9, 0.65, 0.8, 0.5, 0.72].map((v) => {
    const m = el("span", "ww-mini");
    const f = el("i");
    f.dataset.v = v;
    m.append(f);
    minis.append(m);
    return f;
  });
  panel.append(pt, minis);

  // five RM conversation cards (grid positions) + scattered offsets for "independent"
  const GRID = [
    [430, 88],
    [600, 88],
    [770, 88],
    [515, 218],
    [685, 218],
  ];
  const SCATTER = [
    [-14, 22, -4],
    [10, -6, 3],
    [24, 30, -3],
    [-30, 8, 4],
    [18, 2, -2],
  ];
  const svg = svgEl("svg", { class: "svg-layer", viewBox: "0 0 920 336" });
  const links = GRID.map(([x, y]) =>
    svgEl("path", { fill: "none", stroke: "#28B379", "stroke-width": 2, "stroke-dasharray": "4 5", opacity: 0.7, d: `M${x + 75} 64 L${x + 75} ${y}` }),
  );
  svg.append(...links);
  const cards = GRID.map(([x, y], i) => {
    const card = el("div", "ui-card ww-card");
    place(card, x, y, 150, 112);
    const head = el("div", "row");
    head.append(el("span", "avatar", "R" + (i + 1)), H.icon("wa"));
    const status = el("span", "ww-status");
    head.append(status);
    const msgs = el("div", "ww-msgs");
    [110, 80, 96].forEach((w, j) => {
      const b = el("span", "bar" + (j === 1 ? " g" : ""));
      b.style.width = w + "px";
      msgs.append(b);
    });
    card.append(head, msgs);
    return card;
  });
  ui.append(svg, panel, ...cards);

  const bl = bulletList(c);
  place(bl, 0, 0, 390);
  bl.style.position = "absolute";
  r.zMid.append(bl, ui);

  const t = {
    start: S.start,
    problem: lineStart("ww-problem"),
    solution: lineStart("ww-solution"),
    impact: lineEnd("ww-solution") + 0.45,
    end: S.end,
  };
  window.CustomerScene.phases(tl, r, c, t);

  // independent cards (grid area was just filled by Piramal's expanding RM card)
  cards.forEach((card, i) => {
    const [dx, dy, rot] = SCATTER[i];
    tl.fromTo(
      card,
      { opacity: 0, x: dx, y: dy + 24, rotation: rot },
      { opacity: 1, x: dx, y: dy, rotation: rot, duration: 0.5, ease: "power3.out" },
      S.start + 0.15 + i * 0.07,
    );
  });
  // "harder to govern": cards drift apart a little
  tl.to(cards, { x: (i) => SCATTER[i][0] * 1.6, y: (i) => SCATTER[i][1] * 1.4, duration: 1.2, ease: "sine.inOut" }, cue("ww-problem", "HARDER"));

  // "centralized oversight" -> supervisory layer arrives
  const over = cue("ww-solution", "CENTRALIZED");
  tl.fromTo(panel, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.55, ease: "expo.out" }, over);
  // "RM-led WhatsApp conversations" -> cards become governed (snap to grid)
  const gov = cue("ww-solution", "R");
  tl.to(cards, { x: 0, y: 0, rotation: 0, duration: 0.6, ease: "power3.inOut", stagger: 0.05 }, gov);
  links.forEach((l, i) => H.draw(tl, l, gov + 0.35 + i * 0.05, 0.4, "power2.out"));
  tl.to(cards, { borderColor: "rgba(40,179,121,0.6)", duration: 0.3, stagger: 0.05 }, gov + 0.4);
  tl.fromTo(
    cards.map((cd) => cd.querySelector(".ww-status")),
    { scale: 0, backgroundColor: "#B9C4BD" },
    { scale: 1, backgroundColor: "#28B379", duration: 0.3, ease: "back.out(2)", stagger: 0.05 },
    gov + 0.45,
  );
  // "without managers manually reading every chat" -> overview consolidates
  const cons = cue("ww-solution", "WITHOUT");
  tl.to(
    cards.map((cd) => cd.querySelector(".ww-msgs")),
    { opacity: 0.35, scaleX: 0.55, transformOrigin: "0 50%", duration: 0.5, ease: "power2.inOut", stagger: 0.04 },
    cons,
  );
  miniBars.forEach((f, i) => {
    tl.fromTo(f, { scaleX: 0 }, { scaleX: Number(f.dataset.v), duration: 0.6, ease: "power3.out" }, cons + 0.2 + i * 0.07);
  });

  window.CustomerScene.bulletsIn(
    tl,
    Array.from(bl.querySelectorAll(".bullet")),
    [cue("ww-solution", "OVERSIGHT") + 0.2, cue("ww-solution", "CONVERSATIONS") + 0.1, cue("ww-solution", "READING")],
    bl.querySelector(".eyebrow"),
  );

  // seam: cards compress into three journey columns (CoinDCX layout)
  const COLS = [
    [0, 0],
    [315, 0],
    [630, 0],
  ];
  tl.to([panel, bl, ...links], { opacity: 0, duration: 0.35, ease: "power2.in" }, t.end - 0.75);
  tl.to(cards.flatMap((cd) => Array.from(cd.children)), { opacity: 0, duration: 0.25 }, t.end - 0.7);
  cards.slice(0, 3).forEach((card, i) => {
    const [gx, gy] = GRID[i];
    tl.to(
      card,
      { x: COLS[i][0] - gx, y: COLS[i][1] - gy, scaleX: 290 / 150, scaleY: 150 / 112, transformOrigin: "0 0", duration: 0.6, ease: "power3.inOut" },
      t.end - 0.55,
    );
  });
  tl.to(cards.slice(3), { opacity: 0, scale: 0.8, duration: 0.35 }, t.end - 0.6);
  tl.to(cards.slice(0, 3), { opacity: 0, duration: 0.3 }, t.end + 0.25);
};
