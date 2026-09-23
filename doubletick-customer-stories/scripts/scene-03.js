// SCENE 03 — Piramal Finance
// Metaphor: horizontal loan lifecycle FOLLOW-UPS -> PARTNERS -> COLLECTIONS -> RM.
// The AI Voice line from AU becomes the lifecycle rail; a green pulse visits each
// stage on its spoken keyword; only the exception conversation reaches the RM.
// Bullets as a row of three cards. Seam out: the RM card expands into Wint's grid.
window.Scenes.s03 = function (tl, section) {
  const H = window.HF;
  const { el, place, cue, lineStart, lineEnd, scene, bulletCards } = H;
  const c = window.customerData.customers[1];
  const S = scene("s03");
  const r = window.CustomerScene.scaffold(section, c);

  // ---- lifecycle rail (local coords in zone-mid) ----
  const rail = el("div", "pf-rail");
  const track = el("span", "pf-track");
  const fill = el("span", "pf-fill");
  place(track, 0, 48, 920, 4);
  place(fill, 0, 48, 920, 4);
  const STAGES = [
    { label: "FOLLOW-UPS", x: 0, key: ["FOLLOW", 1] },
    { label: "PARTNERS", x: 262, key: ["PARTNERS", 1] },
    { label: "COLLECTIONS", x: 508, key: ["COLLECTIONS", 1] },
  ];
  const stages = STAGES.map((s) => {
    const n = el("div", "pf-stage", s.label);
    place(n, s.x, 28);
    return n;
  });
  const rm = el("div", "pf-stage pf-rm");
  rm.append(H.icon("chat"), el("span", "", "RM"));
  place(rm, 806, 20);
  const pulse = el("span", "pf-pulse");
  place(pulse, -9, 41);
  const manual = el("span", "pf-manual");
  place(manual, -7, 43);
  const exc = el("div", "ui-card pf-exc");
  place(exc, 560, 96, 150, 50);
  exc.append(H.icon("chat"));
  const eb = el("span", "bar g");
  eb.style.width = "84px";
  exc.append(eb);
  rail.append(track, fill, manual, ...stages, rm, pulse, exc);

  const cards = bulletCards(c);
  place(cards, 0, 178, 920);
  cards.style.position = "absolute";
  const label = el("span", "eyebrow");
  label.textContent = c.bulletsLabel;
  place(label, 0, 144);
  label.style.position = "absolute";
  r.zMid.append(rail, label, cards);

  // response-time support inside the 90% tile (visual only, no extra text)
  const heroTile = r.tiles[1];
  const rt = el("div", "pf-rt");
  const rtFill = el("span", "pf-rt-fill");
  rt.append(rtFill);
  heroTile.append(rt);

  // ghost card for the seam into Wint Wealth's RM grid (absolute, frame coords)
  const ghost = el("div", "ui-card pf-ghost");
  place(ghost, 510, 440, 490, 336);
  section.append(ghost);

  // ---- phases ----
  const t = {
    start: S.start,
    problem: lineStart("pf-problem"),
    solution: lineStart("pf-solution"),
    impact: lineEnd("pf-solution") + 0.45,
    end: S.end,
  };
  window.CustomerScene.phases(tl, r, c, t);

  // rail inherits the stretched AU waveform
  tl.fromTo(track, { scaleX: 0.82, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.6, ease: "power3.out" }, S.start - 0.05);
  tl.fromTo([...stages, rm], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.08 }, S.start + 0.3);
  // problem phase: a grey manual dot crawls — "slowing"
  const slow = cue("pf-problem", "SLOWING");
  tl.fromTo(manual, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t.problem);
  tl.fromTo(manual, { x: 0 }, { x: 170, duration: t.solution - t.problem, ease: "power1.out" }, t.problem);
  tl.to(manual, { scale: 0.7, duration: 0.3, yoyo: true, repeat: 1 }, slow);
  tl.to(manual, { opacity: 0, duration: 0.3 }, t.solution - 0.2);

  // solution: AI pulse travels the lifecycle, stage by stage on each keyword
  tl.fromTo(pulse, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, cue("pf-solution", "VOICE"));
  let prevX = 0;
  STAGES.forEach((s, i) => {
    const at = cue("pf-solution", s.key[0], s.key[1]);
    const x = s.x + 60;
    tl.fromTo(pulse, { x: prevX }, { x, duration: 0.45, ease: "power2.inOut", immediateRender: i === 0 }, at - 0.35);
    tl.fromTo(fill, { scaleX: prevX / 920 }, { scaleX: x / 920, duration: 0.45, ease: "power2.inOut", immediateRender: i === 0 }, at - 0.35);
    tl.to(stages[i], { backgroundColor: "#E7F5EE", borderColor: "#28B379", color: "#0F7A50", duration: 0.3 }, at);
    prevX = x;
  });
  // "escalating only the conversations that need an RM": exception card to RM
  const esc = cue("pf-solution", "ESCALATING");
  const need = cue("pf-solution", "NEED");
  tl.fromTo(exc, { opacity: 0, y: -30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }, esc);
  tl.to(exc, { x: 238, y: -56, scale: 0.7, duration: need - esc - 0.2, ease: "power2.inOut" }, esc + 0.45);
  tl.to(exc, { opacity: 0, duration: 0.2 }, need + 0.1);
  tl.to(rm, { backgroundColor: "#E7F5EE", borderColor: "#28B379", color: "#0F7A50", duration: 0.3 }, need);
  tl.fromTo(rm, { scale: 1 }, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, need);
  tl.to(pulse, { opacity: 0.35, duration: 0.4 }, need + 0.4);

  // bullets (three cards), full wording, progressive
  window.CustomerScene.bulletsIn(
    tl,
    Array.from(cards.children),
    [cue("pf-solution", "UPS") + 0.1, cue("pf-solution", "COLLECTIONS") + 0.2, need + 0.25],
    label,
  );

  // response-time bar shrinks as 90% lands
  tl.fromTo(rtFill, { scaleX: 1 }, { scaleX: 0.1, duration: 1.0, ease: "power3.inOut" }, t.impact + 0.35);

  // seam: rail + bullets exit; the RM card expands into Wint's RM grid
  tl.to([track, fill, pulse, ...stages, label, cards], { opacity: 0, x: -30, duration: 0.4, ease: "power2.in" }, t.end - 0.7);
  tl.fromTo(
    ghost,
    { opacity: 0, x: 350, y: 6, scaleX: 0.3, scaleY: 0.18, transformOrigin: "0 0" },
    { opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.65, ease: "power3.inOut" },
    t.end - 0.55,
  );
  tl.to(rm, { opacity: 0, duration: 0.15 }, t.end - 0.5);
  tl.to(ghost, { opacity: 0, duration: 0.35 }, t.end + 0.25);
};
