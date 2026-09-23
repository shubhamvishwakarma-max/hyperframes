// Shared scaffold for the five customer stories.
// Phases: identity -> problem (headline) -> solution (replaces problem)
//         -> bullets (progressive) -> impact metrics -> exit.
// Scene scripts own the middle-zone product metaphor and the seam transition.
(function () {
  const { el, customerHeader, problemCopy, solutionCopy, impactBlock, countUp } = window.HF;

  function scaffold(section, c) {
    const zId = el("div", "zone zone-id");
    const zCopy = el("div", "zone zone-copy");
    const zMid = el("div", "zone zone-mid");
    const zImpact = el("div", "zone zone-impact");
    zId.append(customerHeader(c));
    const stack = el("div", "copy-stack");
    const prob = problemCopy(c);
    const sol = solutionCopy(c);
    stack.append(prob, sol);
    zCopy.append(stack);
    const impact = impactBlock(c);
    zImpact.append(impact);
    section.append(zId, zCopy, zMid, zImpact);
    return {
      zId,
      zCopy,
      zMid,
      zImpact,
      logo: zId.querySelector(".logo-slot"),
      idText: zId.querySelectorAll(".cust-meta > *"),
      problem: prob.querySelector(".problem"),
      solMark: sol.querySelector(".solution-mark"),
      solText: sol.querySelector(".solution"),
      impactLabel: impact.querySelector(".eyebrow"),
      tiles: impact.querySelectorAll(".metric"),
    };
  }

  // t = { start, problem, solution, impact, end }
  function phases(tl, r, c, t) {
    // identity
    tl.fromTo(r.logo, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, t.start + 0.1);
    tl.fromTo(
      r.idText,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 },
      t.start + 0.18,
    );

    // problem: masked rise, then masked exit upward when the solution starts
    tl.fromTo(r.problem, { y: 190 }, { y: 0, duration: 0.65, ease: "expo.out" }, t.problem - 0.12);
    tl.to(r.problem, { y: -190, duration: 0.45, ease: "power2.in" }, t.solution - 0.5);

    // solution replaces the problem in the same zone
    tl.fromTo(r.solMark, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: "power3.out" }, t.solution - 0.05);
    tl.fromTo(
      r.solText,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      t.solution,
    );

    // impact
    tl.fromTo(r.impactLabel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, t.impact - 0.15);
    r.tiles.forEach((tile, i) => {
      const at = t.impact + i * 0.14;
      tl.fromTo(tile, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.65, ease: "expo.out" }, at);
      tl.fromTo(tile.querySelector(".accent"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, at + 0.1);
      countUp(tl, tile.querySelector(".value"), c.impact[i], at + 0.05, c.impact[i].count >= 1000 ? 0.9 : 0.7);
    });

    // exit (the seam transition is owned by each scene's metaphor)
    tl.to([r.zId, r.zCopy, r.zImpact], { opacity: 0, x: -36, duration: 0.45, ease: "power2.in", stagger: 0.04 }, t.end - 0.5);
  }

  function bulletsIn(tl, nodes, times, label) {
    if (label) tl.fromTo(label, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, times[0] - 0.25);
    nodes.forEach((n, i) => {
      tl.fromTo(n, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, times[i]);
    });
  }

  window.CustomerScene = { scaffold, phases, bulletsIn };
})();
