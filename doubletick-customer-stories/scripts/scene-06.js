// SCENE 06 — Samar Capital
// Metaphor: RM 01-04 each with an independent governed business number and
// their own client list, access boundaries, and a supervisor layer above.
// "0 cross-RM visibility": one attempted cross-RM connection stops at the
// boundary (neutral lock, no red). Seam out: cards contract into the recap stack.
window.Scenes.s06 = function (tl, section) {
  const H = window.HF;
  const { el, svgEl, place, cue, lineStart, lineEnd, scene, bulletList } = H;
  const c = window.customerData.customers[4];
  const S = scene("s06");
  const r = window.CustomerScene.scaffold(section, c);

  const sup = el("div", "ui-card sc-sup");
  place(sup, 410, 0, 510, 54);
  const st = el("div", "row");
  st.append(H.icon("eye"), el("span", "ui-title", "Supervisor"));
  const sdots = el("div", "sc-sdots");
  for (let i = 0; i < 4; i++) sdots.append(el("span", "cd-dot"));
  sup.append(st, sdots);

  const POS = [
    [410, 80],
    [675, 80],
    [410, 212],
    [675, 212],
  ];
  const svg = svgEl("svg", { class: "svg-layer", viewBox: "0 0 920 336" });
  const links = POS.map(([x, y]) =>
    svgEl("path", { fill: "none", stroke: "#28B379", "stroke-width": 2, opacity: 0.75, d: `M${x + 122} 54 L${x + 122} ${y}` }),
  );
  // attempted cross-RM connection: RM 01 client row -> towards RM 02, stops at boundary
  const cross = svgEl("path", {
    fill: "none",
    stroke: "#6B7570",
    "stroke-width": 2.5,
    "stroke-linecap": "round",
    d: "M598 158 C626 158 640 150 663 150",
  });
  svg.append(...links, cross);

  const cards = POS.map(([x, y], i) => {
    const wrap = el("div", "sc-wrap");
    place(wrap, x, y, 245, 120);
    const bound = el("span", "sc-bound");
    const card = el("div", "ui-card sc-card");
    const head = el("div", "row sc-head");
    head.append(el("span", "ui-title", "RM 0" + (i + 1)));
    const badge = el("span", "sc-badge");
    badge.append(H.icon("shield"), el("span", "", "Governed"));
    head.append(badge);
    const num = el("div", "row sc-num");
    num.append(H.icon("phone"));
    const nb = el("span", "bar g");
    nb.style.width = "96px";
    num.append(nb);
    const clients = el("div", "sc-clients");
    for (let k = 0; k < 3; k++) {
      const cl = el("span", "sc-client");
      clients.append(cl);
    }
    card.append(head, num, clients);
    wrap.append(bound, card);
    return { wrap, bound, card, badge };
  });
  const lock = el("span", "sc-lock");
  lock.append(H.icon("lock"));
  place(lock, 652, 136);

  const bl = bulletList(c);
  place(bl, 0, 0, 370);
  bl.style.position = "absolute";
  r.zMid.append(bl, svg, sup, ...cards.map((x) => x.wrap), lock);

  const t = {
    start: S.start,
    problem: lineStart("sc-problem"),
    solution: lineStart("sc-solution"),
    impact: lineEnd("sc-solution") + 0.45,
    end: S.end,
  };
  window.CustomerScene.phases(tl, r, c, t);

  // problem phase: four RM conversations, independent but ungoverned (dimmed)
  const wraps = cards.map((x) => x.wrap);
  tl.fromTo(wraps, { opacity: 0, scale: 0.94 }, { opacity: 0.5, scale: 0.94, duration: 0.45, ease: "power2.out", stagger: 0.06 }, S.start + 0.1);
  // "every RM" -> RM cards form
  const every = cue("sc-solution", "EVERY");
  tl.to(wraps, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out", stagger: 0.06 }, every);
  // "governed business number" -> governed badges activate
  const gov = cue("sc-solution", "GOVERNED");
  tl.fromTo(
    cards.map((x) => x.badge),
    { opacity: 0, scale: 0.6 },
    { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.07 },
    gov,
  );
  // "role-based access" -> boundaries form
  const role = cue("sc-solution", "ROLE");
  tl.fromTo(
    cards.map((x) => x.bound),
    { opacity: 0, scale: 1.08 },
    { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out", stagger: 0.06 },
    role,
  );
  // "supervisors in control" -> supervisor layer appears
  const sv = cue("sc-solution", "SUPERVISORS");
  tl.fromTo(sup, { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, sv);
  links.forEach((l, i) => H.draw(tl, l, sv + 0.25 + i * 0.05, 0.35, "power2.out"));
  tl.fromTo(sdots.children, { backgroundColor: "#B9C4BD" }, { backgroundColor: "#28B379", duration: 0.25, stagger: 0.06 }, sv + 0.5);

  window.CustomerScene.bulletsIn(
    tl,
    Array.from(bl.querySelectorAll(".bullet")),
    [gov + 0.3, role + 0.35, sv + 0.3],
    bl.querySelector(".eyebrow"),
  );

  // zero metric support: attempted cross-RM link stops at the access boundary
  const z = t.impact + 0.5;
  H.draw(tl, cross, z, 0.5, "power2.out");
  tl.fromTo(lock, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, z + 0.45);
  tl.to(cross, { opacity: 0.35, duration: 0.4 }, z + 0.9);

  // seam: cards contract into a centred customer-proof stack (recap)
  tl.to([bl, sup, ...links, cross, lock], { opacity: 0, duration: 0.35, ease: "power2.in" }, t.end - 0.75);
  tl.to(cards.flatMap((x) => Array.from(x.card.children)), { opacity: 0, duration: 0.2 }, t.end - 0.7);
  wraps.forEach((w, i) => {
    const [x, y] = POS[i];
    // centre of frame (540, 560) in zone-local coords = (460, 120)
    tl.to(
      w,
      { x: 460 - (x + 122) + (i - 1.5) * 14, y: 120 - (y + 60) + (i - 1.5) * 10, scale: 1.2 - i * 0.03, duration: 0.6, ease: "power3.inOut" },
      t.end - 0.55,
    );
  });
  tl.to(wraps, { opacity: 0, duration: 0.3 }, t.end + 0.25);
};
