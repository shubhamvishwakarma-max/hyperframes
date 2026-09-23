// SCENE 02 — AU Small Finance Bank
// Metaphor: LEADS -> AI VOICE -> RM MAPPING -> RIGHT RM (left half of mid zone),
// bullets progressive on the right. Seam out: the AI waveform stretches
// horizontally and becomes Piramal's lifecycle line.
window.Scenes.s02 = function (tl, section) {
  const H = window.HF;
  const { el, svgEl, place, cue, lineStart, scene, waveform, rmCard, draw, animateWave, bulletList } = H;
  const c = window.customerData.customers[0];
  const S = scene("s02");
  const r = window.CustomerScene.scaffold(section, c);

  // ---- mid zone: flow (local coords, zone origin = 80,440) ----
  const flow = el("div", "au-flow");
  const svg = svgEl("svg", { class: "svg-layer", viewBox: "0 0 460 336" });
  // 8 lead nodes (deterministic scatter)
  const LEADS = [
    [8, 30],
    [58, 64],
    [14, 110],
    [66, 146],
    [10, 196],
    [60, 232],
    [16, 276],
    [70, 306],
  ];
  const nodes = LEADS.map(([x, y]) => {
    const n = el("span", "node idle");
    place(n, x, y);
    return n;
  });
  const hub = el("div", "ui-card au-hub");
  place(hub, 150, 108, 158, 124);
  const hubT = el("div", "row");
  hubT.append(H.icon("phone"), el("span", "ui-title", "AI Voice"));
  const wave = waveform(11);
  hub.append(hubT, wave);
  const bars = Array.from(wave.children);

  const rms = ["RM", "RM", "RM"].map((lbl, i) => {
    const card = rmCard(lbl, 2);
    place(card, 348, 16 + i * 112, 112, 84);
    return card;
  });
  const right = rms[1];
  const tickBadge = el("span", "au-right");
  tickBadge.append(H.icon("check"));
  right.append(tickBadge);

  const pa = { fill: "none", stroke: "#28B379", "stroke-width": 2.5, "stroke-linecap": "round" };
  const inPaths = LEADS.map(([x, y]) =>
    svgEl("path", { ...pa, "stroke-width": 2, opacity: 0.8, d: `M${x + 20} ${y + 10} C${x + 80} ${y + 10} 110 170 150 170` }),
  );
  const outPaths = [58, 170, 282].map((y) => svgEl("path", { ...pa, d: `M308 170 C330 170 326 ${y} 348 ${y}` }));
  // entry line: continues the opening route from the left frame edge
  const entry = svgEl("path", { ...pa, "stroke-width": 3, d: "M-80 180 C-40 180 -30 40 8 40" });
  svg.append(entry, ...inPaths, ...outPaths);
  flow.append(svg, ...nodes, hub, ...rms);

  const bl = bulletList(c);
  place(bl, 500, 0, 420);
  bl.style.position = "absolute";
  r.zMid.append(flow, bl);

  // ---- phases ----
  const t = {
    start: S.start,
    problem: lineStart("au-problem"),
    solution: lineStart("au-solution"),
    impact: H.lineEnd("au-solution") + 0.45,
    end: S.end,
  };
  window.CustomerScene.phases(tl, r, c, t);

  // opening route arrives from the left edge; leads appear as idle, unworked
  draw(tl, entry, S.start - 0.05, 0.7, "power2.out");
  tl.fromTo(nodes, { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(1.6)", stagger: 0.05 }, S.start + 0.4);
  tl.to(entry, { opacity: 0, duration: 0.5 }, S.start + 1.6);
  // "lakhs of leads": the backlog pulses; "missed": half the leads dim out
  const lakhs = cue("au-problem", "LAKHS");
  tl.to(nodes, { scale: 1.25, duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1, stagger: 0.03 }, lakhs);
  tl.to([nodes[1], nodes[3], nodes[4], nodes[6]], { opacity: 0.35, duration: 0.4 }, cue("au-problem", "MISSED"));

  // "AI Voice" -> waveform activates; leads converge
  const ai = cue("au-solution", "VOICE");
  tl.fromTo(hub, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, ai - 0.35);
  animateWave(tl, bars, ai, t.end - ai + 0.2);
  tl.to(nodes, { opacity: 1, borderColor: "#28B379", duration: 0.3, stagger: 0.03 }, ai);
  inPaths.forEach((p, i) => draw(tl, p, ai + 0.1 + i * 0.04, 0.6));

  // "RM mapping" -> routing lines appear to the RM cards
  const map = cue("au-solution", "MAPPING");
  tl.fromTo(rms, { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", stagger: 0.08 }, map - 0.2);
  outPaths.forEach((p, i) => draw(tl, p, map + i * 0.08, 0.5));

  // "right RM" -> connection completes on the assigned RM
  const done = cue("au-solution", "M", 2);
  tl.to([outPaths[0], outPaths[2]], { opacity: 0.25, duration: 0.3 }, done);
  tl.to([rms[0], rms[2]], { opacity: 0.55, duration: 0.3 }, done);
  tl.to(right, { borderColor: "#28B379", boxShadow: "0 0 0 4px rgba(40,179,121,0.18), 0 8px 24px rgba(10,58,43,0.1)", duration: 0.35 }, done);
  tl.fromTo(tickBadge, { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(2)" }, done + 0.05);

  // bullets: progressive, full wording
  const bNodes = Array.from(bl.querySelectorAll(".bullet"));
  window.CustomerScene.bulletsIn(
    tl,
    bNodes,
    [cue("au-solution", "ENGAGE"), cue("au-solution", "ROUTE"), cue("au-solution", "RIGHT"), H.lineEnd("au-solution") + 0.15],
    bl.querySelector(".eyebrow"),
  );

  // seam: flow + bullets exit; the waveform stretches into a horizontal line
  tl.to([...nodes, ...rms, bl, ...inPaths, ...outPaths], { opacity: 0, x: -30, duration: 0.4, ease: "power2.in" }, t.end - 0.7);
  tl.to(hub, { borderColor: "rgba(40,179,121,0)", boxShadow: "none", backgroundColor: "rgba(255,255,255,0)", duration: 0.3 }, t.end - 0.7);
  tl.to(hubT, { opacity: 0, duration: 0.25 }, t.end - 0.7);
  tl.to(wave, { scaleX: 7.9, scaleY: 0.06, x: 231, y: -143, duration: 0.7, ease: "power2.inOut" }, t.end - 0.55);
  tl.to(wave, { opacity: 0, duration: 0.2 }, t.end + 0.3);
};
